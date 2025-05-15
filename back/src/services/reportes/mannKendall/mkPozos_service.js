import { pool, dbErrorMsg } from '../../../database/db.js';
import MkPozos from '../../../models/mkPozos_models.js';

const allowedFields = {
    id: 'm.id',
    subproyectoId: 'm.subproyectoId',
    subproyecto: 's.nombrelocacion',
    pozoId: 'm.pozoId',
    pozo: 'p.nombre',
    hojaId: 'm.hojaid'
};

const table = 'mkpozos';
const selectBase = 'SELECT m.id, m.subproyectoId, s.nombrelocacion as subproyecto, m.pozoId, p.nombre as pozo, m.hojaId ';
const selectTables = 'FROM mkpozos m ' +
                     'LEFT JOIN subproyectos s ON m.subproyectoId= s.id ' +
                     'LEFT JOIN pozos p ON m.subproyectoId = p.subproyectoId AND m.pozoId = p.id ';
const mainTable = 'm';
const noExiste = 'El Pozo no fue incluido para el informe Mann-Kendall';
const yaExiste = 'El Pozo ya fue incluido para el informe Mann-Kendall';

export default class MkPozosService {
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
            return new MkPozos(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getBysubproyectoPozo (dobles) {
        if (!dobles.length) return [];

        const conditions = dobles.map(() => '(subproyectoId = ? AND pozoId = ?)').join(' OR ');
        const values = dobles.flatMap(t => [t.subproyectoId, t.pozoId]);

        const sql = `SELECT subproyectoId, pozoId, hojaId FROM mkpozos WHERE ${conditions}`;

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

    static async create (MkPozoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [MkPozoToAdd]);
            console.log('fila para agregar', rows);
            MkPozoToAdd.id = rows.insertId;
            return new MkPozos(MkPozoToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, mkpozos) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [mkpozos, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return MkPozosService.getById(id);
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

    static async replaceForSubproyecto (mkPozosToAdd) {
        if (!Array.isArray(mkPozosToAdd) || mkPozosToAdd.length === 0) {
            throw dbErrorMsg(400, 'No se recibieron pozos para guardar');
        }

        const subproyectoId = mkPozosToAdd[0].subproyectoId;
        if (!mkPozosToAdd.every(item => item.subproyectoId === subproyectoId)) {
            throw dbErrorMsg(400, 'Todos los pozos deben pertenecer al mismo subproyecto');
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Borrar los compuestos actuales del subproyecto
            await conn.query(`DELETE FROM ${table} WHERE subproyectoId = ?`, [subproyectoId]);

            // Insertar los nuevos
            const insertSql = `INSERT INTO ${table} (subproyectoId, pozoId, hojaId) VALUES ?`;
            const values = mkPozosToAdd.map(({ subproyectoId, pozoId, hojaId }) => [subproyectoId, pozoId, hojaId]);

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
