import { pool, dbErrorMsg } from '../database/db.js';
import Autaplicacion from '../models/autaplicacion_model.js';

const allowedFields = {
    id: 'a.id',
    nombre: 'a.nombre',
    sitioWeb1: 'a.sitioWeb1',
    sitioWeb2: 'a.sitioWeb2',
    provinciaId: 'a.provinciaId',
    provincia: 'p.nombre',
    matrizId: 'a.matrizId',
    matriz: 'm.nombre'
};

const table = 'Autaplicacion';
const selectBase = 'SELECT a.id, a.nombre, a.sitioWeb1, a.sitioWeb2, a.provinciaId, p.nombre as provincia, a.matrizId, m.nombre as matriz ';
const selectTables = 'FROM Autaplicacion AS a ' +
                     'LEFT JOIN Provincias AS p ON a.provinciaId = p.id ' +
                     'LEFT JOIN Matriz AS m ON a.matrizId = m.id';
const mainTable = 'a';
const noExiste = 'La autoridad de aplicacion no existe';
const yaExiste = 'La autoridad de aplicacion ya existe';

export default class AutaplicacionService {
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
                data: rows, // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Autaplicacion.toJsonArray()
                totalCount
            };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Autaplicacion(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (autaplicacionToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [autaplicacionToAdd]);
            autaplicacionToAdd.id = rows.insertId;
            return new Autaplicacion(autaplicacionToAdd);
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

    static async update (id, autaplicacion) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [autaplicacion, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return AutaplicacionService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
