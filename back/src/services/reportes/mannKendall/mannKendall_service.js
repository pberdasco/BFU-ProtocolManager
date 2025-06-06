import { pool, dbErrorMsg } from '../../../database/db.js';
import { processCompound } from './mannKendallCreateBook_service.js';
import { convertirValor, verificarConversionesFallidas } from '../tablasAnaliticas/cadenaTODOCTabla_UMs.js';
import UMConvertService from '../../umConvert_service.js';
import UMService from '../../um_service.js';

export default class MannKendallService {
    static async fullProcess (subproyectoId, fechaEvaluacion) {
        const data = await MannKendallService.getDataForSubproyecto(subproyectoId, fechaEvaluacion);
        const filesCreated = [];
        data.compuestos.forEach(async compuesto => {
            compuesto.proyecto = data.proyecto;
            compuesto.fechaEvaluacion = data.fechaEvaluacion;
            compuesto.facility = data.facility;
            const { excel, log } = await processCompound(compuesto);
            filesCreated.push(excel);
            if (log) { filesCreated.push(log); }
        });
        return filesCreated;
    }

    static async getDataForSubproyecto (subproyectoId, fechaEvaluacion) {
        try {
            // Datos del subproyecto (para nombre del proyecto y facility)
            const [[subproyecto]] = await pool.query(`
                SELECT s.id, s.codigo AS proyecto, s.nombreLocacion AS facility
                FROM Subproyectos s
                WHERE s.id = ?`, [subproyectoId]);

            if (!subproyecto) {
                throw dbErrorMsg(404, `Subproyecto no encontrado: ${subproyectoId}`);
            }

            // Pozos parametrizados para MK, junto con hoja (1: Principal, 2: Secundaria, etc)
            const [mkPozos] = await pool.query(`
                SELECT mp.id, mp.pozoId, mp.hojaId, p.nombre AS pozoNombre
                FROM mkPozos mp
                JOIN Pozos p ON mp.pozoId = p.id
                WHERE mp.subproyectoId = ?`, [subproyectoId]);

            if (!mkPozos.length) {
                throw dbErrorMsg(404, `No hay pozos configurados para Mann-Kendall en subproyecto ${subproyectoId}`);
            }

            // Compuestos parametrizados
            const [mkCompuestos] = await pool.query(`
                SELECT mc.compuestoId, c.nombre AS compuestoName , mc.umId , um.nombre AS umNombre
                FROM mkCompuestos mc
                JOIN Compuestos c ON mc.compuestoId = c.id
                JOIN um ON mc.umId = um.id 
                WHERE mc.subproyectoId = ?`, [subproyectoId]);

            if (!mkCompuestos.length) {
                throw dbErrorMsg(404, `No hay compuestos configurados para Mann-Kendall en subproyecto ${subproyectoId}`);
            }

            // Muestras tipo 1 y sus eventos
            const [muestrasConValores] = await pool.query(`
                SELECT em.fecha, m.id AS muestraId, m.pozoId, cc.compuestoId, cc.metodoId, cc.UMId, cv.valor, ccust.laboratorioId
                FROM EventoMuestreo em
                JOIN CadenaCustodia ccust ON ccust.eventoMuestreoId = em.id AND ccust.subproyectoId = ?
                JOIN Muestras m ON m.cadenaCustodiaId = ccust.id AND m.tipo = 1
                JOIN CadenaCompletaFilas cc ON cc.cadenaCustodiaId = ccust.id
                JOIN CadenaCompletaValores cv ON cv.cadenaCompletaFilaId = cc.id AND cv.muestraId = m.id
                WHERE em.soloMuestras = false AND em.subproyectoId = ?
                AND cc.compuestoId IN (?) 
                AND m.pozoId IN (?)`, [
                subproyectoId,
                subproyectoId,
                mkCompuestos.map(c => c.compuestoId),
                mkPozos.map(p => p.pozoId)
            ]);

            if (!muestrasConValores.length) {
                throw dbErrorMsg(404, 'No se encontraron valores para las combinaciones configuradas');
            }

            // cargar datos de conversion de UM
            // Crear un array para rastrear conversiones fallidas
            const conversionesFallidas = [];
            const UMs = await UMService.getAll({ where: null, values: [], order: [], limit: 100, offset: 0 }); // nunca hay mas de 100 UMs (son menos de 20 en realidad)
            const umConvert = await UMConvertService.getAll();

            // Cargar MAP de LQs
            const triplesSet = new Set();

            muestrasConValores.forEach(v => {
                const clave = `${v.compuestoId}-${v.metodoId}-${v.laboratorioId}`;
                triplesSet.add(clave);
            });

            const triples = Array.from(triplesSet).map(c => {
                const [compuestoId, metodoId, laboratorioId] = c.split('-').map(Number);
                return { compuestoId, metodoId, laboratorioId };
            });

            const lqs = await getLQs(triples);
            const lqMap = new Map();
            lqs.forEach(lq => {
                const clave = `${lq.compuestoId}-${lq.metodoId}-${lq.laboratorioId}`;
                lqMap.set(clave, lq);
            });

            // Agrupar por compuesto
            const resultado = mkCompuestos.map(comp => {
                const pozosCompuesto = mkPozos.map(pozo => ({
                    pozo: pozo.pozoNombre,
                    hoja: `Hoja ${pozo.hojaId}`,
                    pozoId: pozo.pozoId
                }));

                // Obtener fechas únicas ordenadas
                const fechas = Array.from(new Set(
                    muestrasConValores
                        .filter(v => v.compuestoId === comp.compuestoId)
                        .map(v => v.fecha.toISOString().split('T')[0])
                )).sort();

                const mediciones = fechas.map(fecha => {
                    const registros = muestrasConValores.filter(v => v.compuestoId === comp.compuestoId && v.fecha.toISOString().split('T')[0] === fecha);
                    const valores = mkPozos.map(p => {
                        const registro = registros.find(r => r.pozoId === p.pozoId);
                        // return registro ? Number(registro.valor) : null;
                        if (!registro) return null;

                        if (registro.valor <= -2) return null; // ND y NA => van como null

                        if (registro.valor <= 0) {
                            // buscar el lq para ese compuesto y lo convierte a la unidad de medida de  mkcompuestos
                            const lqOrig = lqMap.get(`${registro.compuestoId}-${registro.metodoId}-${registro.laboratorioId}`);
                            const lq = convertirValor(lqOrig.valorLQ, lqOrig.UMId, comp.umId, umConvert, conversionesFallidas);
                            return lq ? lq / 2 : 0.0001; // NC (0 o -1) debe ir como 1/2*LQ, si no encuentra el LQ => 0.0001
                        }

                        // convierte el valor a la um que manda mkCompuestos
                        const valorConvertido = convertirValor(registro.valor, registro.UMId, comp.umId, umConvert, conversionesFallidas);
                        return valorConvertido;
                        // return Number(registro.valor);
                    });

                    return { fecha, muestras: valores };
                });

                return {
                    compuestoId: comp.compuestoId,
                    compuestoName: comp.compuestoName,
                    umId: comp.umId,
                    umNombre: comp.umNombre,
                    muestras: pozosCompuesto,
                    mediciones
                };
            });

            // Verificar si hay conversiones fallidas
            const errorConversiones = verificarConversionesFallidas(conversionesFallidas, UMs);
            if (errorConversiones) {
                const error = new Error(errorConversiones);
                error.status = 400;
                error.code = 'CONVERSION_ERROR';
                throw error;
            }

            return {
                proyecto: subproyecto.proyecto,
                facility: subproyecto.facility,
                fechaEvaluacion,
                compuestos: resultado
            };
        } catch (err) {
            throw dbErrorMsg(err.status || 500, err.message || 'Error interno al generar datos Mann-Kendall');
        }
    }
}

async function getLQs (triples) {
    if (!triples.length) return [];

    const conditions = triples.map(() => '(compuestoId = ? AND metodoId = ? AND laboratorioId = ?)').join(' OR ');
    const values = triples.flatMap(t => [t.compuestoId, t.metodoId, t.laboratorioId]);

    const sql = `SELECT laboratorioId, compuestoId, metodoId, UMId, valorLQ FROM LQs WHERE ${conditions}`;

    try {
        const [rows] = await pool.query(sql, values);
        return rows;
    } catch (error) {
        throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
}
