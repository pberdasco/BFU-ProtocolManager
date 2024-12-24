import { pool, dbErrorMsg } from "../database/db.js";
import Autaplicacion from "../models/autaplicacion_model.js";

const allowedFields = {
    id: "a.id", 
    nombre: "a.nombre",
    sitioWeb1: "a.sitioWeb1",
    sitioWeb2: "a.sitioWeb2"
};

const table = "Autaplicacion";
const selectBase = "SELECT a.id, a.nombre, a.sitioWeb1, a.sitioWeb2 FROM Autaplicacion a ";
const noExiste = "La autoridad de aplicacion no existe";
const yaExiste = "La autoridad de aplicacion ya existe"

export default class AutaplicacionService{
    
    static getAllowedFields() {
        return allowedFields;
    }

    static async getAll(devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try{
            //Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total FROM Autaplicacion a
                              ${where ? `WHERE ${where}` : ""}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;
                //Select para los datos
            values.push(limit, offset)
            const sql = `${selectBase}
                         ${where ? `WHERE ${where}` : ""}
                         ${order.length ? `ORDER BY ${order.join(", ")}` : ""}
                         LIMIT ? OFFSET ?`
            const [rows] = await pool.query(sql, values );
            
            return {data:rows,      // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Autaplicacion.toJsonArray()
                    totalCount: totalCount
            };
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById(id) {
        try{
            const [rows] = await pool.query(selectBase + "WHERE Id = ?", [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Autaplicacion(rows[0]);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(autaplicacionToAdd) {
        try{
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [autaplicacionToAdd]); 
            autaplicacionToAdd.id = rows.insertId;
            return new Autaplicacion(autaplicacionToAdd);
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
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update(id, autaplicacion){        
        try{
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [autaplicacion, id]);
            if (rows.affectedRows != 1) throw dbErrorMsg(404, noExiste);
            return AutaplicacionService.getById(id);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}