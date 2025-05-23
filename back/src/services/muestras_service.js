import { pool, dbErrorMsg } from '../database/db.js';
import Muestra from '../models/muestras_model.js';

const allowedFields = {
    id: 'm.id',
    pozoId: 'm.pozoId',
    pozo: 'p.nombre',
    cadenaCustodiaId: 'm.cadenaCustodiaID',
    nombre: 'm.nombre',
    tipo: 'm.tipo',
    nivelFreatico: 'm.nivelFreatico',
    nivelFLNA: 'm.nivelFLNA',
    profundidad: 'm.profundidad',
    flna: 'm.flna',
    cadenaOPDS: 'm.cadenaOPDS',
    protocoloOPDS: 'm.protocoloOPDS'
};

const table = 'Muestras';
const selectBase = 'SELECT m.id, m.nombre, m.pozoId, p.nombre as pozo, m.cadenaCustodiaId, m.tipo, m.nivelFreatico, ' +
                   'm.profundidad, m.nivelFLNA, m.flna, m.cadenaOPDS, m.protocoloOPDS ';
const selectTables = 'FROM Muestras m ' +
                     'LEFT JOIN Pozos P ON m.pozoId = P.id ';
const mainTable = 'm';
const noExiste = 'La muestra no existe';
const yaExiste = 'La muestra ya existe';

export default class MuestrasService {
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

            return { data: Muestra.fromRows(rows), totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Muestra(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (muestraToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [muestraToAdd]);
            muestraToAdd.id = rows.insertId;

            return new Muestra(muestraToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, muestra) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [muestra, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return MuestrasService.getById(id);
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
