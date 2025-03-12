import { pool, dbErrorMsg } from '../database/db.js';
import AnalisisRequerido from '../models/analisisrequeridos_model.js';

const allowedFields = {
    id: 'r.id',
    cadenaCustodiaId: 'r.cadenaCustodiaId',
    tipo: 'r.tipo',
    grupoId: 'r.grupoId',
    grupo: 'g.nombre',
    compuestoId: 'r.compuestoId',
    compuesto: 'c.nombre',
    metodoId: 'g.metodoId',
    metodo: 'm.nombre'
};

const table = 'AnalisisRequeridos';
const selectBase = 'SELECT r.id, r.cadenaCustodiaId, r.tipo, r.grupoId, r.compuestoId, r.metodoId, ' +
                          'g.nombre as grupo, c.nombre as compuesto, m.nombre as metodo ';
const selectTables = 'FROM AnalisisRequeridos r ' +
                     'LEFT JOIN compuestos c ON r.compuestoId = c.id ' +
                     'LEFT JOIN grupoCompuestos g ON r.grupoId = g.id ' +
                     'LEFT JOIN metodos m ON r.metodoId = m.id ';

const mainTable = 'r';
const noExiste = 'El Analisis Requerido no existe';
const yaExiste = 'El Analisis Requerido ya existe';

export default class AnalisisRequeridosService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            // Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total ${selectTables}
                              ${where ? `WHERE ${where}` : ''}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;
            // Select para los datos
            values.push(limit, offset);
            const sql = `${selectBase} ${selectTables}
                         ${where ? `WHERE ${where}` : ''}
                         ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                         LIMIT ? OFFSET ?`;
            const [rows] = await pool.query(sql, values);

            return {
                data: rows, // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Compuestos.toJsonArray()
                totalCount
            };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.Id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new AnalisisRequerido(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (elementToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [elementToAdd]);
            return AnalisisRequeridosService.getById(rows.insertId);
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

    static async update (id, element) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [element, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return AnalisisRequeridosService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
