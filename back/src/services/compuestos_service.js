import { pool, dbErrorMsg } from "../database/db.js";
import Compuesto from "../models/compuestos_model.js";

const allowedFields = {
    id: "c.id", 
    nombre: "c.nombre",
    codigo: "c.codigo",
    agrupaEn: "c.agrupaen",
    expone: "c.exponeId",
    matrizCodigo: "c.matrizCodigo",
    matriz: "m.nombre"
};

const table = "Compuestos";
const selectBase = "SELECT c.id, c.nombre, c.codigo, c.agrupaEn, c.exponeId, c.matrizCodigo, m.nombre as matriz ";
const selectTables = "FROM Compuestos c " +
                     "LEFT JOIN Matriz m ON c.matrizCodigo = m.codigo "; 
const mainTable  = "c";
const noExiste = "El compuesto no existe";
const yaExiste = "El compuesto ya existe";

export default class CompuestosService{
    
    static getAllowedFields() {
        return allowedFields;
    }

    static async getAll(devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try{
            //Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total ${selectTables}
                              ${where ? `WHERE ${where}` : ""}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;
                //Select para los datos
            values.push(limit, offset)
            const sql = `${selectBase} ${selectTables}
                         ${where ? `WHERE ${where}` : ""}
                         ${order.length ? `ORDER BY ${order.join(", ")}` : ""}
                         LIMIT ? OFFSET ?`
            const [rows] = await pool.query(sql, values );
            
            return {data:rows,      // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Compuestos.toJsonArray()
                    totalCount: totalCount
            };
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById(id) {
        try{
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.Id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Compuesto(rows[0]);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(compuestoToAdd) {
        try{
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [compuestoToAdd]); 
            compuestoToAdd.id = rows.insertId;
            console.log(compuestoToAdd);
            
            return new Compuesto(compuestoToAdd);
        }catch(error){
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }                          
    }

    static async delete(id) {
        try{
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows != 1) throw dbErrorMsg(404, noExiste);
            return true;
        }catch(error){
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, "No se puede eliminar el recurso porque tiene dependencias asociadas.");
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, compuesto){        
        try{
            console.log(table, "Compuesto: ", JSON.stringify(compuesto))


            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [compuesto, id]);
            if (rows.affectedRows != 1) throw dbErrorMsg(404, noExiste);
            return CompuestosService.getById(id);
        }catch(error){
            if (error?.code === "ER_DUP_ENTRY") throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}