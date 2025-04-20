import { pool, dbErrorMsg } from '../database/db.js';
import { processCompound } from './mannKendallCreateBook_service.js';

export default class MannKendallService {
    static async fullProcess (subproyectoId, fechaEvaluacion) {
        const data = await MannKendallService.getDataForSubproyecto(subproyectoId, fechaEvaluacion);
        const filesCreated = [];
        data.compuestos.forEach(compuesto => {
            compuesto.proyecto = data.proyecto;
            compuesto.fechaEvaluacion = data.fechaEvaluacion;
            compuesto.facility = data.facility;
            filesCreated.push(processCompound(compuesto));
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
                SELECT mc.compuestoId, c.nombre AS compuestoName
                FROM mkCompuestos mc
                JOIN Compuestos c ON mc.compuestoId = c.id
                WHERE mc.subproyectoId = ?`, [subproyectoId]);

            if (!mkCompuestos.length) {
                throw dbErrorMsg(404, `No hay compuestos configurados para Mann-Kendall en subproyecto ${subproyectoId}`);
            }

            // Muestras tipo 1 y sus eventos
            const [muestrasConValores] = await pool.query(`
                SELECT em.fecha, m.id AS muestraId, m.pozoId, cc.compuestoId, cv.valor
                FROM EventoMuestreo em
                JOIN CadenaCustodia ccust ON ccust.eventoMuestreoId = em.id AND ccust.subproyectoId = ?
                JOIN Muestras m ON m.cadenaCustodiaId = ccust.id AND m.tipo = 1
                JOIN CadenaCompletaFilas cc ON cc.cadenaCustodiaId = ccust.id
                JOIN CadenaCompletaValores cv ON cv.cadenaCompletaFilaId = cc.id AND cv.muestraId = m.id
                WHERE em.subproyectoId = ?
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
                        return registro ? Number(registro.valor) : null;
                    });

                    return { fecha, muestras: valores };
                });

                return {
                    compuestoId: comp.compuestoId,
                    compuestoName: comp.compuestoName,
                    muestras: pozosCompuesto,
                    mediciones
                };
            });

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
