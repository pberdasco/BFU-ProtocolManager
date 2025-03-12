import { pool, dbErrorMsg } from '../database/db.js';
import ProyectosEstado from '../models/proyectosEstado_model.js';

const selectBase = 'SELECT id, codigo, nombre FROM ProyectosEstado';
const noExiste = 'El estado no existe';

export default class ProyectosEstadoService {
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
      return new ProyectosEstado(rows[0]);
    } catch (error) {
      throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
  }
}
