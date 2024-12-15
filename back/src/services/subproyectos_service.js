import { pool, dbErrorMsg } from "../database/db.js";
import Subproyecto from "../models/subproyectos_model.js";

const table = "Subproyectos";
const selectBase = "SELECT S.id, S.proyectoId, P.codigo as proyecto, S.codigo, S.nombreLocacion, S.ubicacion, S.autAplicacionId, A.nombre as autoridad "
const selectTables = "FROM SubProyectos S " +
                     "LEFT JOIN AutAplicacion A ON S.AutAplicacionId = A.id " +
                     "LEFT JOIN Proyectos P ON S.proyectoId = P.id";
const noExiste = "El subproyecto no existe";
const yaExiste = "El subproyecto ya existe";

export default class SubproyectosService {

    static async getAll(devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            const countSql = `SELECT COUNT(*) as total ${selectTables} ${where ? `WHERE ${where}` : ""}`;


            const [countResult] = await pool.query(countSql, values);
            const totalCount = countResult[0].total;

            const sql = `${selectBase} ${selectTables}
                         ${where ? `WHERE ${where}` : ""}
                         ${order.length ? `ORDER BY ${order.join(", ")}` : ""}
                         LIMIT ? OFFSET ?`;
            values.push(limit, offset);
            const [rows] = await pool.query(sql, values);

            return { data: rows, totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById(id) {
        try {
            const [rows] = await pool.query(selectBase + "WHERE id = ?", [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Subproyecto(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(subproyectoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [subproyectoToAdd]);
            subproyectoToAdd.id = rows.insertId;
            return new Subproyecto(subproyectoToAdd);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, subproyecto) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [subproyecto, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return SubproyectosService.getById(id);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete(id) {
        try {
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return true;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
