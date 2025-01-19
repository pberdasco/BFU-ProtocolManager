import { pool, dbErrorMsg } from "../database/db.js";
import Cadena from "../models/cadenasCustodia_model.js";

const allowedFields = { 
    id: "c.id", 
    nombre: "c.nombre", 
    fecha: "c.fecha",
    eventoMuestreoId: "c.eventoMuestreoId",
    subproyectoId: "c.subproyectoId",
    laboratorioId: "c.laboratorioId", 
    laboratorio: "l.nombre",         
}

const table = "CadenaCustodia";
const selectBase = "SELECT c.id, c.nombre, c.fecha, c.eventoMuestreoId, c.subproyectoId, c.laboratorioId, l.nombre as laboratorio, " +
                   "(SELECT COUNT(*) FROM Muestras m WHERE m.cadenaCustodiaId = c.id) AS cantidadMuestras, "+
                   "(SELECT COUNT(*) FROM AnalisisRequeridos a WHERE a.cadenaCustodiaId = c.id) AS cantidadAnalisis ";
const selectTables = "FROM CadenaCustodia c " +
                     "LEFT JOIN Laboratorios l ON c.laboratorioId = l.id ";
const mainTable = "c";                     
const noExiste = "La Cadena de Custodia no existe";
const yaExiste = "La Cadena de Custodia ya existe";

export default class CadenasCustodiaService {

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
            return new Cadena(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(elementToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [elementToAdd]);
            elementToAdd.id = rows.insertId;
            return new Cadena(elementToAdd);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, element) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [element, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return CadenasCustodiaService.getById(id);
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
