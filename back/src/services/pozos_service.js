import { pool, dbErrorMsg } from '../database/db.js';
import Pozo from '../models/pozos_model.js';

const allowedFields = {
    id: 'P.id',
    nombre: 'P.nombre',
    estadoId: 'P.estadoId',
    tipoId: 'P.tipoId',
    subproyectoId: 'P.subproyectoId',
    subproyecto: 'S.codigo',
    estado: 'E.nombre',
    tipo: 'T.nombre',
    latitud: 'P.latitud',
    longitud: 'P.longitud',
    UltMuestraAguaIdx: 'P.UltMuestraAguaIdx',
    UltMuestraFLNAIdx: 'P.UltMuestraFLNAIdx',
    UltMuestraGasIdx: 'P.UltMuestraGasIdx'
};

const table = 'Pozos';
const selectBase = 'SELECT P.id, P.subproyectoId, S.codigo as subproyecto, P.nombre, P.estadoId, P.tipoId, E.nombre as estado, T.nombre as tipo ,P.latitud,P.longitud, P.UltMuestraAguaIdx, P.UltMuestraFLNAIdx,P.UltMuestraGasIdx ';
const selectTables = 'FROM Pozos P ' +
                     'LEFT JOIN Subproyectos S ON P.subProyectoId = S.id ' +
                     'LEFT JOIN PozosTipo T ON P.tipoId = T.id ' +
                     'LEFT JOIN PozosEstado E ON P.estadoId = E.id';
const mainTable = 'P';
const noExiste = 'El pozo no existe';
const yaExiste = 'El pozo ya existe';

export default class PozosService {
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

            return { data: rows, totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Pozo(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (pozosToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [pozosToAdd]);
            pozosToAdd.id = rows.insertId;
            return new Pozo(pozosToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, pozo) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [pozo, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return PozosService.getById(id);
        } catch (error) {
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
}
