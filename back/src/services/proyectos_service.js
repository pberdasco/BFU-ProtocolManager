import { pool, dbErrorMsg } from "../database/db.js";
import Proyecto from "../models/proyectos_model.js";

const allowedFields = {
    id: "p.id", 
    codigo: "p.codigo",
    nombre: "p.nombre",
    empresa: "p.empresa"
};

const table = "Proyectos";
const selectBase = "SELECT p.id, p.codigo, p.nombre, p.empresa FROM Proyectos p ";
const noExiste = "El proyecto no existe";
const yaExiste = "El proyecto ya existe"

export default class ProyectosService{
    
    static getAllowedFields() {
        return allowedFields;
    }

    static async getAll(devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try{
            //Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total FROM Proyectos p
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
            
            return {data:rows,      // Si algo no coincidiera entre la base y el objeto seria necesario llamar a un Proyectos.toJsonArray()
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
            return new Proyecto(rows[0]);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(proyectoToAdd) {
        try{
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [proyectoToAdd]); 
            proyectoToAdd.id = rows.insertId;
            console.log(proyectoToAdd);
            
            return new Proyecto(proyectoToAdd);
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

    static async update(id, proyecto){        
        try{
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [proyecto, id]);
            if (rows.affectedRows != 1) throw dbErrorMsg(404, noExiste);
            return ProyectosService.getById(id);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}