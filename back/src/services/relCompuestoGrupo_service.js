import { pool, dbErrorMsg } from "../database/db.js";
import RelCompuestoGrupo from "../models/relCompuestoGrupo_model.js";

const allowedFields = {
    id: "r.id", 
    grupoId: "r.grupoId",
    grupo: "g.nombre",
    matrizGrupoId: "g.matriz",
    matrizGrupo: "m2.nombre",
    compuestoId: "r.compuestoId",
    compuesto: "c.nombre",
    matrizCompuestoId: "c.matriz",
    matrizCompuesto: "m1.nombre"
};

const table = "RelCompuestoGrupo";
const selectBase = "SELECT r.id, r.grupoId, r.compuestoId, g.nombre as grupo, g.matrizCodigo as matrizGrupoId, " + 
                          "c.nombre as compuesto, c.matrizCodigo as matrizCompuestoId, m1.nombre as matrizCompuesto, m2.nombre as matrizGrupo ";
const selectTables = "FROM relCompuestoGrupo r " +
                     "LEFT JOIN compuestos c ON r.compuestoId = c.id " +
                     "LEFT JOIN grupoCompuestos g ON r.grupoId = g.id " +
                     "LEFT JOIN matriz m1 ON c.matrizCodigo = m1.codigo " +
                     "LEFT JOIN matriz m2 ON g.matrizCodigo = m2.codigo"

const mainTable  = "r";
const noExiste = "La relacion grupo-compuesto no existe";
const yaExiste = "El relacion grupo-compuesto ya existe"

export default class RelCompuestoGrupoService{
    
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
            return new RelCompuestoGrupo(rows[0]);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create(compuestoToAdd) {
        try{
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [compuestoToAdd]); 
            compuestoToAdd.id = rows.insertId;
            console.log(compuestoToAdd);
            
            return new RelCompuestoGrupo(compuestoToAdd);
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

    static async update(id, compuesto){  
        console.log("Compuesto: ", compuesto);
              
        try{
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [compuesto, id]);
            if (rows.affectedRows != 1) throw dbErrorMsg(404, noExiste);
            return RelCompuestoGrupoService.getById(id);
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}