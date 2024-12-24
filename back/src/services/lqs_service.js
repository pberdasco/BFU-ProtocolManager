import { pool, dbErrorMsg } from "../database/db.js";
import Lq from "../models/lqs_model.js";

const allowedFields = { 
    id: "l.id", 
    laboratorioId: "l.laboratorioId", 
    laboratorio: "b.nombre", 
    compuestoId: "l.compuestoId",
    compuesto: "c.nombre",
    valorLQ: "l.valorLQ",
}

const table = "Lqs";
const selectBase = "SELECT l.id, l.laboratorioId, b.nombre as laboratorio, l.compuestoId, c.nombre as compuesto, l.valorLQ "
const selectTables = "FROM Lqs l " +
                     "LEFT JOIN Laboratorios B ON L.LaboratorioId = B.id " +
                     "LEFT JOIN Compuestos C ON L.compuestoId = C.id";
const mainTable = "L";
const noExiste = "El LQ no existe";
const yaExiste = "El LQ ya existe";

export default class LqsService {

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
            return new Lq(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(lqToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [lqToAdd]);
            lqToAdd.id = rows.insertId;

            return new Lq(lqToAdd);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, lq) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [lq, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return LqsService.getById(id);
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