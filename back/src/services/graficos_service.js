import { pool, dbErrorMsg } from '../database/db.js';
import Grafico from '../models/graficos_model.js';

const allowedFields = {
    id: 'g.id',
    nombre: 'g.nombre',
    eje1: 'g.eje1',
    eje2: 'g.eje2'
};
const table = 'graficos';
const selectBase = 'SELECT g.id, g.nombre, g.eje1, g.eje2';
const selectTables = 'FROM graficos g';
const mainTable = 'g';
const noExiste = 'El gráfico no existe';

export default class GraficosService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async sanitizeCompuestoIds (array) {
        if (!Array.isArray(array)) return [];
        const specials = [-1, -2];
        const normal = array.filter(id => !specials.includes(id));
        let valid = [];
        if (normal.length) {
            const [rows] = await pool.query(
                'SELECT id FROM compuestos WHERE id IN (?)',
                [normal]
            );
            valid = rows.map(r => r.id);
        }
        return array.filter(id => specials.includes(id) || valid.includes(id));
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;
        try {
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total ${selectTables} ${where ? `WHERE ${where}` : ''}`;
            const [cnt] = await pool.query(countSql, countValues);
            const totalCount = cnt[0].total;

            const sql = `${selectBase} ${selectTables} ${where ? `WHERE ${where}` : ''} ${order.length ? `ORDER BY ${order.join(', ')}` : ''} LIMIT ? OFFSET ?`;
            values.push(limit, offset);
            const [rows] = await pool.query(sql, values);

            for (const r of rows) {
                r.eje1 = await GraficosService.sanitizeCompuestoIds(r.eje1);
                r.eje2 = await GraficosService.sanitizeCompuestoIds(r.eje2);
            }

            return { data: rows, totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(
                `${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`,
                [id]
            );
            if (!rows.length) throw dbErrorMsg(404, noExiste);
            const row = rows[0];
            row.eje1 = await GraficosService.sanitizeCompuestoIds(row.eje1);
            row.eje2 = await GraficosService.sanitizeCompuestoIds(row.eje2);
            return new Grafico(row);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (grafico) {
        try {
            const eje1 = await GraficosService.sanitizeCompuestoIds(grafico.eje1);
            const eje2 = await GraficosService.sanitizeCompuestoIds(grafico.eje2);
            const [res] = await pool.query(
                `INSERT INTO ${table} (nombre, eje1, eje2) VALUES (?, CAST(? AS JSON), CAST(? AS JSON))`,
                [grafico.nombre, JSON.stringify(eje1), JSON.stringify(eje2)]
            );
            return new Grafico({ id: res.insertId, nombre: grafico.nombre, eje1, eje2 });
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, grafico) {
        try {
            const eje1 = await GraficosService.sanitizeCompuestoIds(grafico.eje1);
            const eje2 = await GraficosService.sanitizeCompuestoIds(grafico.eje2);
            const [res] = await pool.query(
                `UPDATE ${table} SET nombre = ?, eje1 = CAST(? AS JSON), eje2 = CAST(? AS JSON) WHERE id = ?`,
                [grafico.nombre, JSON.stringify(eje1), JSON.stringify(eje2), id]
            );
            if (res.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return GraficosService.getById(id);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete (id) {
        try {
            const [res] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (res.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar el recurso porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
