import { pool, dbErrorMsg } from '../database/db.js';
import Matriz from '../models/matrices_model.js';

const selectBase = 'SELECT id, codigo, nombre FROM Matriz';
const noExiste = 'La matriz no existe';

export default class MatricesService {
  static async getAll () {
    try {
      const [rows] = await pool.query(selectBase);
      return { data: rows, totalCount: 0 };
    } catch (error) {
      throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
  }

  static async getById (id) {
    try {
      const [rows] = await pool.query(`${selectBase} WHERE id = ?`, [id]);
      if (rows.length === 0) throw dbErrorMsg(404, noExiste);
      return new Matriz(rows[0]);
    } catch (error) {
      throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
  }
}
