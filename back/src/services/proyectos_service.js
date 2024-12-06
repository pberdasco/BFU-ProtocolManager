import { pool, dbErrorMsg } from "../database/db.js";


export default class ProyectosService{
    
    static async getAll(devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;
        values.push(limit, offset)
        const sql = `SELECT id, nombre, empresa FROM Proyectos
                     ${where ? `WHERE ${where}` : ""}
                     ${order.length ? `ORDER BY ${order.join(", ")}` : ""}
                     LIMIT ? OFFSET ?`

        const [rows] = await pool.query(sql, values );
        return rows;
    }
}