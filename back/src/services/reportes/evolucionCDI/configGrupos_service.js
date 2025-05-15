import { pool, dbErrorMsg } from '../../../database/db.js';
import GraficoGrupo from '../../../models/graficosGrupos_model.js';

const allowedFields = {
    id: 'gg.id',
    subproyectoId: 'gg.subproyectoId',
    nombre: 'gg.nombre',
    pozos: 'gg.pozos',
    graficos: 'gg.graficos'
};

const table = 'graficosGrupos';
const selectBase = 'SELECT gg.id, gg.subproyectoId, gg.nombre, gg.pozos, gg.graficos';
const selectTables = 'FROM graficosGrupos gg';
const mainTable = 'gg';
const noExiste = 'El grupo de gráficos no existe';

export default class GraficosGruposService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async sanitizeIds (array, tableName) {
        if (!Array.isArray(array)) return [];
        const normal = array;
        let valid = [];
        if (normal.length) {
            const [rows] = await pool.query(
                `SELECT id FROM ${tableName} WHERE id IN (?)`,
                [normal]
            );
            valid = rows.map(r => r.id);
        }
        return array.filter(id => valid.includes(id));
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;
        try {
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total ${selectTables} ${where ? `WHERE ${where}` : ''}`;
            const [cnt] = await pool.query(countSql, countValues);
            const totalCount = cnt[0].total;

            const sql = `${selectBase} ${selectTables}
        ${where ? `WHERE ${where}` : ''}
        ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
        LIMIT ? OFFSET ?`;
            values.push(limit, offset);
            const [rows] = await pool.query(sql, values);

            for (const r of rows) {
                r.pozos = await GraficosGruposService.sanitizeIds(r.pozos, 'pozos');
                r.graficos = await GraficosGruposService.sanitizeIds(r.graficos, 'graficos');
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
            row.pozos = await GraficosGruposService.sanitizeIds(row.pozos, 'pozos');
            row.graficos = await GraficosGruposService.sanitizeIds(row.graficos, 'graficos');
            return new GraficoGrupo(row);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (group) {
        try {
            const pozos = await GraficosGruposService.sanitizeIds(group.pozos, 'pozos');
            const graficos = await GraficosGruposService.sanitizeIds(group.graficos, 'graficos');
            const [res] = await pool.query(
                `INSERT INTO ${table} (subproyectoId, nombre, pozos, graficos)
         VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON))`,
                [group.subproyectoId, group.nombre, JSON.stringify(pozos), JSON.stringify(graficos)]
            );
            return new GraficoGrupo({ id: res.insertId, subproyectoId: group.subproyectoId, nombre: group.nombre, pozos, graficos });
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, group) {
        try {
            const sets = [];
            const values = [];

            if (group.subproyectoId !== undefined) {
                sets.push('subproyectoId = ?');
                values.push(group.subproyectoId);
            }

            if (group.nombre !== undefined) {
                sets.push('nombre = ?');
                values.push(group.nombre);
            }

            if (group.pozos !== undefined) {
                const pozos = await GraficosGruposService.sanitizeIds(group.pozos, 'pozos');
                sets.push('pozos = CAST(? AS JSON)');
                values.push(JSON.stringify(pozos));
            }

            if (group.graficos !== undefined) {
                const graficos = await GraficosGruposService.sanitizeIds(group.graficos, 'graficos');
                sets.push('graficos = CAST(? AS JSON)');
                values.push(JSON.stringify(graficos));
            }

            // Si no llegó ningún campo para actualizar, devolvemos el registro tal cual
            if (sets.length === 0) {
                return GraficosGruposService.getById(id);
            }

            const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`;
            values.push(id);

            const [res] = await pool.query(sql, values);
            if (res.affectedRows !== 1) throw dbErrorMsg(404, noExiste);

            return GraficosGruposService.getById(id);
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
