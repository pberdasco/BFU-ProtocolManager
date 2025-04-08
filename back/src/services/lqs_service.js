import { pool, dbErrorMsg } from '../database/db.js';
import Lq from '../models/lqs_model.js';

const allowedFields = {
    id: 'l.id',
    laboratorioId: 'l.laboratorioId',
    laboratorio: 'b.nombre',
    compuestoId: 'l.compuestoId',
    compuesto: 'c.nombre',
    metodoId: 'l.metodoId',
    metodo: ' m.nombre',
    UMId: 'l.UMId',
    UM: 'u.nombre',
    valorLQ: 'l.valorLQ',
    MatrizId: 'l.MatrizId'
};

const table = 'Lqs';
const selectBase = 'SELECT l.id, l.laboratorioId, b.nombre as laboratorio, l.compuestoId, c.nombre as compuesto, l.metodoId, m.nombre as metodo, l.UMId, u.nombre as UM, l.valorLQ ';
const selectTables = 'FROM Lqs l ' +
                     'LEFT JOIN Laboratorios B ON L.LaboratorioId = B.id ' +
                     'LEFT JOIN Compuestos C ON L.compuestoId = C.id ' +
                     'LEFT JOIN Metodos M ON M.Id = L.metodoId ' +
                     'LEFT JOIN UM U ON U.Id = L.UMId';
const mainTable = 'L';
const noExiste = 'El LQ no existe';
const yaExiste = 'El LQ ya existe';

export default class LqsService {
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
            return new Lq(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getByCompuestoMetodoLab (triples) {
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

    static async getByIds (ids) {
        if (!ids.length) return [];

        const placeholders = ids.map(() => '?').join(',');
        const sql = `${selectBase} ${selectTables} WHERE ${mainTable}.id IN (${placeholders})`;

        try {
            const [rows] = await pool.query(sql, ids);
            return rows;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (lqToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [lqToAdd]);
            lqToAdd.id = rows.insertId;

            return new Lq(lqToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, lq) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [lq, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return LqsService.getById(id);
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
