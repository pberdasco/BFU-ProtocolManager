import { pool, dbErrorMsg } from "../database/db.js";
import Pozo from "../models/eventomuestreo_model.js";

const allowedFields = { 
    id: "E.id", 
    fecha: "E.fecha",
    subProyectoId: "E.subProyectoId", 
    subProyecto: "S.codigo",
    nombre: "E.nombre", 
    cadenaCustodiaLink: "E.cadenaCustodiaLink",         
}

const table = "Eventomuestreo";
const selectBase = "SELECT E.id, E.fecha, E.subProyectoId, S.codigo as subProyecto, E.nombre, E.cadenaCustodiaLink ";
const selectTables = "FROM Eventomuestreo E " +
                     "LEFT JOIN Subproyectos S ON E.subProyectoId = S.id ";
const mainTable = "E";                     
const noExiste = "El evento de muestreo no existe";
const yaExiste = "El evento de muestreo ya existe";

export default class EventomuestreoService {

    static getAllowedFields() {
        return allowedFields;
    }

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
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Pozo (rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(eventomuestreoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [eventomuestreoToAdd]);
            eventomuestreoToAdd.id = rows.insertId;
            return new Pozo(eventomuestreoToAdd);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, eventomuestreo) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [eventomuestreo, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return EventomuestreoService.getById(id);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete(id) {
        try {
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, "No se puede eliminar el recurso porque tiene dependencias asociadas.");
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
