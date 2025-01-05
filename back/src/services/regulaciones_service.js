import { pool, dbErrorMsg } from "../database/db.js";
import Regulacion from "../models/regulaciones_model.js";

const allowedFields = { 
    id: "R.id", 
    autAplicacionId: "R.autAplicacionId",
    autoridad: "A.nombre",
    fechaVigencia: "R.fechaVigencia",
    compuestoId: "R.compuestoId",
    compuesto: "C.nombre", 
    norma: "R.norma",
    valorReferencia: "R.valorReferencia",
}

const table = "Regulaciones";
const selectBase = "SELECT R.id, R.autAplicacionId, A.nombre as autoridad, R.fechaVigencia, R.compuestoId, C.nombre as compuesto, R.norma, R.valorReferencia "
const selectTables = "FROM Regulaciones R " +
                     "LEFT JOIN AutAplicacion A ON R.AutAplicacionId = A.id " +
                     "LEFT JOIN Compuestos C ON R.compuestoId = C.id";
const mainTable = "R";
const noExiste = "La regulacion no existe";
const yaExiste = "La regulacion ya existe";

export default class RegulacionesService {

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
            return new Regulacion(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(regulacionToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [regulacionToAdd]);
            regulacionToAdd.id = rows.insertId;
            return new Regulacion(regulacionToAdd);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, regulacion) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [regulacion, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return RegulacionesService.getById(id);
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