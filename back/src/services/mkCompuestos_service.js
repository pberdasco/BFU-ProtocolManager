import { pool, dbErrorMsg } from '../database/db.js';
import MkCompuestos from '../models/mkCompuestos_models.js';

const allowedFields = {
    id: 'm.id',
    subproyectoId: 'm.subproyectoId',
    subproyecto: 's.nombrelocacion',
    compuestoId: 'm.compuestoid',
    compuesto: 'c.nombre'
};

const table = 'mkcompuestos';
const selectBase = 'SELECT m.id, m.subproyectoId, s.nombrelocacion as subproyecto, m.compuestoId, c.nombre as compuesto ';
const selectTables = 'FROM mkcompuestos m ' +
                     'LEFT JOIN subproyectos s ON m.subproyectoId= s.id ' +
                     'LEFT JOIN compuestos c ON m.compuestoId = c.id ';
const mainTable = 'm';
const noExiste = 'El compuesto para incluir en Mann-Kendall no fue seleccionado para el subproyecto';
const yaExiste = 'El compuesto para incluir en Mann-Kendall ya fue seleccionado para el subproyecto';

export default class MkCompuestosService {
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
            return new MkCompuestos(rows[0]);
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

    static async create (MkCompuestoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [MkCompuestoToAdd]);
            MkCompuestoToAdd.id = rows.insertId;
            return new MkCompuestos(MkCompuestoToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, mkcompuesto) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [mkcompuesto, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return MkCompuestosService.getById(id);
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

    static async replaceForSubproyecto (mkCompuestosToAdd) {
        if (!Array.isArray(mkCompuestosToAdd) || mkCompuestosToAdd.length === 0) {
            throw dbErrorMsg(400, 'No se recibieron compuestos para guardar');
        }

        const subproyectoId = mkCompuestosToAdd[0].subproyectoId;
        if (!mkCompuestosToAdd.every(item => item.subproyectoId === subproyectoId)) {
            throw dbErrorMsg(400, 'Todos los compuestos deben pertenecer al mismo subproyecto');
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Borrar los compuestos actuales del subproyecto
            await conn.query(`DELETE FROM ${table} WHERE subproyectoId = ?`, [subproyectoId]);

            // Insertar los nuevos
            const insertSql = `INSERT INTO ${table} (subproyectoId, compuestoId) VALUES ?`;
            const values = mkCompuestosToAdd.map(({ subproyectoId, compuestoId }) => [subproyectoId, compuestoId]);

            await conn.query(insertSql, [values]);

            await conn.commit();
            return true;
        } catch (error) {
            await conn.rollback();
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        } finally {
            conn.release();
        }
    }
}
