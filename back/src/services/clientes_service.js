import { pool, dbErrorMsg } from '../database/db.js';
import Cliente from '../models/clientes_model.js';

const allowedFields = {
    id: 'c.id',
    codigo: 'c.codigo',
    nombre: 'c.nombre'
};

const table = 'Clientes';
const selectBase = 'SELECT c.id, c.codigo, c.nombre ';
const selectTables = 'FROM Clientes c ';
const mainTable = 'c';
const noExiste = 'El cliente no existe';
const yaExiste = 'El cliente ya existe';

export default class ClientesService {
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
                data: rows, // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Entity.toJsonArray()
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
            return new Cliente(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (entityToAdd) {
        try {
            console.log(' CREANDO entidad: ', entityToAdd);

            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [entityToAdd]);
            entityToAdd.id = rows.insertId;

            return new Cliente(entityToAdd);
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

    static async update (id, entity) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [entity, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return ClientesService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
