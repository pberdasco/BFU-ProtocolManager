import { pool, dbErrorMsg } from '../database/db.js';
import Laboratorio from '../models/laboratorios_model.js';

const allowedFields = {
    id: 'l.id',
    nombre: 'l.nombre',
    domicilio: 'l.domicilio',
    formato: 'l.formato'
};

const table = 'Laboratorios';
const selectBase = 'SELECT l.id, l.nombre, l.domicilio, l.formato FROM Laboratorios l ';
const noExiste = 'El laboratorio no existe';
const yaExiste = 'El laboratorio ya existe';

export default class LaboratoriosService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            // Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total FROM Laboratorios l
                              ${where ? `WHERE ${where}` : ''}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;

            // Select para los datos
            values.push(limit, offset);
            const sql = `${selectBase}
                         ${where ? `WHERE ${where}` : ''}
                         ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                         LIMIT ? OFFSET ?`;
            const [rows] = await pool.query(sql, values);

            return {
                data: rows, // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Laboratosio.toJsonArray()
                totalCount
            };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(selectBase + 'WHERE Id = ?', [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Laboratorio(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (laboratorioToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [laboratorioToAdd]);
            laboratorioToAdd.id = rows.insertId;
            console.log(laboratorioToAdd);

            return new Laboratorio(laboratorioToAdd);
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

    static async update (id, laboratorio) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [laboratorio, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return LaboratoriosService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
