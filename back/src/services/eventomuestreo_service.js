import { pool, dbErrorMsg } from '../database/db.js';
import Evento from '../models/eventomuestreo_model.js';
import AnalisisRequeridosService from './analisisrequeridos_service.js';
import MuestrasService from './muestras_service.js';

const allowedFields = {
    id: 'E.id',
    fecha: 'E.fecha',
    subproyectoId: 'E.subproyectoId',
    subproyecto: 'S.codigo',
    nombre: 'E.nombre',
    cadenasCustodiaPDFLink: 'E.cadenasCustodiaPDFLink',
    soloMuestras: 'E.soloMuestras'
};

const table = 'Eventomuestreo';
const selectBase = 'SELECT E.id, E.fecha, E.subproyectoId, S.codigo as subproyecto, E.nombre, E.cadenasCustodiaPDFLink, E.soloMuestras ';
const selectTables = 'FROM Eventomuestreo E ' +
                     'LEFT JOIN Subproyectos S ON E.subproyectoId = S.id ';
const mainTable = 'E';
const noExiste = 'El evento de muestreo no existe';
const yaExiste = 'El evento de muestreo ya existe';

export default class EventomuestreoService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            const countSql = `SELECT COUNT(*) as total ${selectTables} ${where ? `WHERE ${where}` : ''}`;

            const [countResult] = await pool.query(countSql, values);
            const totalCount = countResult[0].total;

            const sql = `${selectBase} ${selectTables}
                         ${where ? `WHERE ${where}` : ''}
                         ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                         LIMIT ? OFFSET ?`;
            values.push(limit, offset);
            const [rows] = await pool.query(sql, values);

            return { data: Evento.fromRows(rows), totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Evento(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (eventomuestreoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [eventomuestreoToAdd]);
            eventomuestreoToAdd.id = rows.insertId;
            return new Evento(eventomuestreoToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, eventomuestreo) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [eventomuestreo, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return EventomuestreoService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete (id) {
        try {
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar el recurso porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getFullDataById (id) {
        try {
            const sql = `
                SELECT 
                    E.id AS eventoMuestreoId, 
                    E.fecha, 
                    E.subproyectoId,
                    E.soloMuestras, 
                    S.codigo AS proyecto, 
                    C.nombre AS cliente, 
                    L.nombre AS laboratorio, 
                    M.nombre AS matriz, 
                    CC.id AS cadenaCustodiaId, 
                    CC.nombre AS cadenaNombre, 
                    CC.fecha AS cadenaFecha,
                    MUE.id AS muestraId,
                    MUE.nombre AS muestraNombre, 
                    P.nombre AS pozoNombre, 
                    P.latitud,
                    p.longitud,
                    MUE.tipo AS muestraTipo, 
                    MUE.nivelFreatico, 
                    AR.id AS analisisRequeridoId,
                    AR.tipo AS analisisTipo, 
                    GC.nombre AS grupoCompuesto, 
                    MT.nombre AS metodo, 
                    CMP.codigo AS compuestoCodigo, 
                    CMP.nombre AS compuestoNombre
                FROM Eventomuestreo E
                LEFT JOIN Subproyectos S ON E.subproyectoId = S.id
                LEFT JOIN Proyectos PR ON S.proyectoId = PR.id
                LEFT JOIN Clientes C ON PR.clienteId = C.id
                LEFT JOIN CadenaCustodia CC ON CC.eventoMuestreoId = E.id
                LEFT JOIN Laboratorios L ON CC.laboratorioId = L.id
                LEFT JOIN Matriz M ON CC.matrizCodigo = M.codigo
                LEFT JOIN Muestras MUE ON MUE.cadenaCustodiaId = CC.id
                LEFT JOIN Pozos P ON MUE.pozoId = P.id
                LEFT JOIN AnalisisRequeridos AR ON AR.cadenaCustodiaId = CC.id
                LEFT JOIN GrupoCompuestos GC ON AR.grupoId = GC.id
                LEFT JOIN Metodos MT ON AR.metodoId = MT.id
                LEFT JOIN Compuestos CMP ON AR.compuestoId = CMP.id
                WHERE E.id = ?
                ORDER BY CC.fecha ASC, CC.id ASC, MUE.id ASC, AR.id ASC;
            `;

            const [rows] = await pool.query(sql, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, 'El evento de muestreo no existe');

            const cadenasMap = new Map();

            rows.forEach(row => {
                // Si no hay ninguna cadena asociada, lanzar error 404
                if (!row.cadenaCustodiaId) throw dbErrorMsg(404, 'El evento no tiene cadenas');

                // Si la cadena no ha sido agregada aún, la inicializamos con sus propios arrays de muestras y análisis
                if (!cadenasMap.has(row.cadenaCustodiaId)) {
                    cadenasMap.set(row.cadenaCustodiaId, {
                        id: row.cadenaCustodiaId,
                        nombre: row.cadenaNombre,
                        fecha: row.cadenaFecha,
                        matriz: row.matriz,
                        cliente: row.cliente,
                        proyecto: row.proyecto,
                        laboratorio: row.laboratorio,
                        muestras: new Map(), // Usamos Map para evitar duplicados y asegurar ordenación
                        analisis: new Map()
                    });
                }

                const cadena = cadenasMap.get(row.cadenaCustodiaId);

                // Agregar muestra si no está en la lista
                if (row.muestraId && !cadena.muestras.has(row.muestraId)) {
                    cadena.muestras.set(row.muestraId, {
                        id: row.muestraId,
                        nombre: row.muestraNombre,
                        pozo: row.pozoNombre,
                        tipo: row.muestraTipo,
                        nivelFreatico: row.nivelFreatico,
                        latitud: row.latitud,
                        longitud: row.longitud

                    });
                }

                // Agregar análisis si no está en la lista
                if (row.analisisRequeridoId && !cadena.analisis.has(row.analisisRequeridoId)) {
                    cadena.analisis.set(row.analisisRequeridoId, {
                        id: row.analisisRequeridoId,
                        tipo: row.analisisTipo,
                        grupo: row.grupoCompuesto,
                        metodo: row.metodo,
                        compuestoCodigo: row.compuestoCodigo,
                        compuestoNombre: row.compuestoNombre
                    });
                }
            });

            // Si no hay cadenas en el Map, devolver error 404
            if (cadenasMap.size === 0) throw dbErrorMsg(404, 'El evento no tiene cadenas');

            // Convertir maps a arrays ordenados
            const response = {
                cadenas: Array.from(cadenasMap.values()).map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    fecha: c.fecha,
                    matriz: c.matriz,
                    cliente: c.cliente,
                    proyecto: c.proyecto,
                    laboratorio: c.laboratorio,
                    muestras: Array.from(c.muestras.values()), // Convertimos Map a Array ordenado
                    analisis: Array.from(c.analisis.values()) // Convertimos Map a Array ordenado
                }))
            };

            return response;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async duplicarEvento ({ eventoId, nuevaFecha, nuevoNombre }) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Obtener evento original
            const eventoOriginal = await this.getById(eventoId);

            // Crear nuevo evento
            const nuevoEvento = {
                fecha: nuevaFecha,
                nombre: nuevoNombre,
                subproyectoId: eventoOriginal.subproyectoId,
                soloMuestras: eventoOriginal.soloMuestras
            };
            const [eventoResult] = await conn.query('INSERT INTO Eventomuestreo SET ?', [nuevoEvento]);
            const nuevoEventoId = eventoResult.insertId;

            // Obtener cadenas sin suelo
            const [cadenas] = await conn.query(
                'SELECT * FROM CadenaCustodia WHERE eventoMuestreoId = ? AND matrizCodigo <> 3',
                [eventoId]
            );

            for (const cadena of cadenas) {
                const nuevaCadena = { ...cadena, eventoMuestreoId: nuevoEventoId };
                delete nuevaCadena.id;

                const [resCadena] = await conn.query('INSERT INTO CadenaCustodia SET ?', [nuevaCadena]);
                const nuevaCadenaId = resCadena.insertId;

                await AnalisisRequeridosService.copyFromCadena(cadena.id, nuevaCadenaId, conn);
                await MuestrasService.copyFromCadena(cadena.id, nuevaCadenaId, conn);
            }

            await conn.commit();
            return nuevoEventoId;
        } catch (error) {
            await conn.rollback();
            throw dbErrorMsg(error.status || 500, error.message || 'Error al duplicar evento');
        } finally {
            conn.release();
        }
    }
}
