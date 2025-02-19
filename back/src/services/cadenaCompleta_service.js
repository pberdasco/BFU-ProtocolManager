//cadenaCompleta_service.js
import { pool, dbErrorMsg } from "../database/db.js";

export default class CadenaCompletaService {

    static async create(cadenaId, cadenaCompleta) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const insertedFilas = [];
            const filasIdsMap = new Map(); 
            for (const fila of cadenaCompleta.filas) {
                const [result] = await conn.query(
                    `INSERT INTO CadenaCompletaFilas (cadenaCustodiaId, compuestoId, metodoId, umId, estado, protocoloItemId) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [cadenaId, fila.compuestoId, fila.metodoId, fila.umId, fila.estado, fila.protocoloItemId]
                );
                filasIdsMap.set(fila.id, result.insertId); 

                insertedFilas.push({
                    id: result.insertId, 
                    cadenaCustodiaId: cadenaId,
                    compuestoId: fila.compuestoId,
                    metodoId: fila.metodoId,
                    umId: fila.umId,
                    estado: fila.estado,
                    protocoloItemId: fila.protocoloItemId
                  });
            }
            
            const insertedValores = [];
            for (const fila of cadenaCompleta.filas) {
                const cadenaCompletaFilaId = filasIdsMap.get(fila.id);               
                for (const muestra of cadenaCompleta.muestras) {
                    const valor = fila[muestra.muestra] ?? null; 
                    if (valor !== null) {
                        const [valResult] = await conn.query(
                            `INSERT INTO CadenaCompletaValores (cadenaCompletaFilaId, muestraId, valor) 
                            VALUES (?, ?, ?)`,
                            [cadenaCompletaFilaId, muestra.muestraId, valor]
                        );
                        insertedValores.push({
                            id: valResult.insertId,
                            cadenaCompletaFilaId,
                            muestraId: muestra.muestraId,
                            valor
                          });
                    }
                }
            }

            await conn.commit(); 
            conn.release();
            return { 
                filas: insertedFilas,
                valores: insertedValores
            }
        }catch (error) {
            await conn.rollback(); 
            conn.release();
            throw dbErrorMsg(500, `Error guardando cadenaCompleta: ${error.message}`);
        }
    }

    static async getById(cadenaId){
        try {
            const [filas] = await pool.query(
                `SELECT id, compuestoId, metodoId, umId, estado, protocoloItemId 
                 FROM CadenaCompletaFilas 
                 WHERE cadenaCustodiaId = ?`,
                [cadenaId]
            );
    
            const [valores] = await pool.query(
                `SELECT v.cadenaCompletaFilaId, v.muestraId, m.Nombre AS muestra, v.valor
                 FROM CadenaCompletaValores v
                 JOIN Muestras m ON v.muestraId = m.Id
                 WHERE m.CadenaCustodiaId = ?`,
                [cadenaId]
            );
    
            const [muestras] = await pool.query(
                `SELECT Id AS muestraId, Nombre AS muestra, Tipo AS tipo, PozoId AS pozo 
                 FROM Muestras 
                 WHERE CadenaCustodiaId = ?`,
                [cadenaId]
            );
    
            const filasMap = new Map();

            for (const fila of filas) {
                filasMap.set(fila.id, {
                    id: fila.id,
                    compuestoId: fila.compuestoId,
                    metodoId: fila.metodoId,
                    umId: fila.umId,
                    estado: fila.estado,
                    protocoloItemId: fila.protocoloItemId
                });
            }
    
            for (const valor of valores) {
                const fila = filasMap.get(valor.cadenaCompletaFilaId);
                if (fila) {
                    fila[valor.muestra] = valor.valor; 
                }
            }
    
            const filasArray = Array.from(filasMap.values());
    
            const cadenaCompleta = {
                filas: filasArray,
                muestras: muestras
            };
    
            return cadenaCompleta;
        }catch(error){
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete(cadenaId) {
        try {
            await pool.query(
                `DELETE FROM CadenaCompletaValores 
                 WHERE cadenaCompletaFilaId IN 
                 (SELECT id FROM CadenaCompletaFilas WHERE cadenaCustodiaId = ?)`,
                [cadenaId]
            );
    
            const [result] = await pool.query(
                `DELETE FROM CadenaCompletaFilas WHERE cadenaCustodiaId = ?`,
                [cadenaId]
            );
    
            if (!result.affectedRows) throw dbErrorMsg(404, "No existe la CadenaCompleta especificada.");
    
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, "No se puede eliminar la CadenaCompleta porque tiene dependencias asociadas.");
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    
}

