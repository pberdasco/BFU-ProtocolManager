import { pool, dbErrorMsg } from '../database/db.js';
import Metodo from '../models/metodos_model.js';

const allowedFields = {
  id: 'm.id',
  nombre: 'm.nombre'
};

const table = 'Metodos';
const selectBase = 'SELECT m.id, m.nombre ';
const selectTables = 'FROM Metodos m ';
const mainTable = 'm';
const noExiste = 'El metodo no existe';
const yaExiste = 'El metodo ya existe';

export default class MetodosService {
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
      return new Metodo(rows[0]);
    } catch (error) {
      throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
  }

  static async create (entityToAdd) {
    try {
      console.log(' CREANDO entidad: ', entityToAdd);

      const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [entityToAdd]);
      entityToAdd.id = rows.insertId;

      return new Metodo(entityToAdd);
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

  static async update (id, compuesto) {
    try {
      const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [compuesto, id]);
      if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
      return MetodosService.getById(id);
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
      throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
  }
}
