import { pool, dbErrorMsg } from '../database/db.js';
import Regulado from '../models/regulados_model.js';

const allowedFields = {
    id: 'R.id',
    autAplicacionId: 'R.autAplicacionId',
    autoridad: 'A.nombre',
    fechaVigencia: 'R.fechaVigencia',
    compuestoId: 'R.compuestoId',
    compuesto: 'C.nombre',
    norma: 'R.norma',
    valorReferencia: 'R.valorReferencia',
    matrizId: 'A.matrizId',
    umId: 'R.umId',
    um: 'U.nombre'
};

const table = 'Regulados';
const selectBase = 'SELECT R.id, R.autAplicacionId, A.nombre as autoridad, R.fechaVigencia, R.compuestoId, C.nombre as compuesto, ' +
                   'R.norma, R.valorReferencia, A.matrizId, R.umId, U.nombre as um ';
const selectTables = 'FROM Regulados R ' +
                     'LEFT JOIN AutAplicacion A ON R.AutAplicacionId = A.id ' +
                     'LEFT JOIN Compuestos C ON R.compuestoId = C.id ' +
                     'LEFT JOIN UM U ON R.umId = U.id';
const mainTable = 'R';
const noExiste = 'El compuesto Regulado no existe';
const yaExiste = 'El compuesto Regulado ya existe';

export default class ReguladosService {
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
            return new Regulado(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (regulacionToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [regulacionToAdd]);
            regulacionToAdd.id = rows.insertId;
            return new Regulado(regulacionToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, regulacion) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [regulacion, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return ReguladosService.getById(id);
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
}
