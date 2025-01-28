import { pool, dbErrorMsg } from "../database/db.js";
import SinonimoMetodo from "../models/sinonimosMetodo_model.js";

const allowedFields = { 
    id: "s.id", 
    textoLab: "s.textolab",
    textoProcesado: "s.textoProcesado", 
    metodoId: "s.metodoId",
    metodo: "c.nombre",          
}

const table = "SinonimosMetodos";
const selectBase = "SELECT s.id, s.textoLab, s.textoProcesado, s.metodoId, m.nombre as metodo ";
const selectTables = "FROM  SinonimosMetodos s " +
                     "LEFT JOIN Metodos m ON s.metodoId = m.id ";
const mainTable = "s";                     
const noExiste = "El SinonimoMetodo no existe";
const yaExiste = "El SinonimoMetodo ya existe";

export default class SinonimosMetodosService {

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
            return new SinonimoMetodo(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async convertList(listToConvert) {
        const { metodosOriginales } = listToConvert;
        const convertedList = [];
        try {
            const metodosProcesados = metodosOriginales.map(compuesto =>
                compuesto
                    .normalize('NFD')                 // forma descompuesta de acentos unicode
                    .replace(/[\u0300-\u036f]/g, '')  // elimina acentos
                    .replace(/[.,;:_()*/\+\-\s]/g, "")  // Remueve espacios, comas, guión, asterisco, etc.
                    .toLowerCase() 
            );
    
            const sql = `
                SELECT 
                    s.textoLab AS metodoOriginal, 
                    s.textoProcesado AS metodoProcesado, 
                    s.metodoId 
                FROM SinonimosMetodos s
                WHERE s.textoProcesado IN (${metodosProcesados.map(() => '?').join(',')})
            `;
            const [rows] = await pool.query(sql, [...metodosProcesados]);
            
            metodosOriginales.forEach((metodoOriginal, index) => {
                const metodoProcesado = metodosProcesados[index];
                const encontrado = rows.find(row => row.metodoProcesado === metodoProcesado);
    
                convertedList.push({
                    metodoOriginal,
                    metodoProcesado,
                    metodoId: encontrado ? encontrado.metodoId : null, 
                });
            });
    
            return convertedList;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(entityToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [entityToAdd]);
            entityToAdd.id = rows.insertId;
            return new SinonimoMetodo(entityToAdd);
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, entity) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [entity, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return SinonimosMetodosService.getById(id);
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
