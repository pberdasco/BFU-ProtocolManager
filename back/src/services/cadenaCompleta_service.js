// cadenaCompleta_service.js
import { pool, dbErrorMsg } from '../database/db.js';

// Función para agrupar filas por compuestoId y metodoId, y reasignar IDs secuenciales
// Función para agrupar filas por compuestoId y metodoId, adjuntar el código, ordenar y reasignar IDs secuenciales
function mergeFilas (filas, codigoMap) {
    const clavesBase = ['id', 'cadenaCustodiaId', 'compuestoId', 'metodoId', 'umId', 'estado', 'protocoloItemId'];
    const filasAgrupadas = new Map();

    for (const fila of filas) {
    // Usamos compuestoId y metodoId para identificar el grupo
        const key = `${fila.compuestoId}-${fila.metodoId}`;
        if (!filasAgrupadas.has(key)) {
            filasAgrupadas.set(key, { ...fila });
        } else {
            const filaExistente = filasAgrupadas.get(key);
            for (const prop in fila) {
                if (!clavesBase.includes(prop)) {
                    filaExistente[prop] = fila[prop];
                }
            }
        }
    }

    // Convertimos el mapa a array y adjuntamos el código correspondiente
    const mergedArray = Array.from(filasAgrupadas.values()).map(fila => ({
        ...fila,
        codigo: codigoMap[fila.compuestoId] || ''
    }));

    // Ordenamos el array por el campo código (ascendente)
    mergedArray.sort((a, b) => {
        if (a.codigo < b.codigo) return -1;
        if (a.codigo > b.codigo) return 1;
        return 0;
    });

    // Reasignamos IDs secuenciales (1,2,3,...) en función del orden
    mergedArray.forEach((fila, index) => {
        fila.id = index + 1;
    // Si no necesitas enviar el campo código, puedes eliminarlo:
    // delete fila.codigo;
    });

    return mergedArray;
}

export default class CadenaCompletaService {
    /**
     * Crea una nueva entrada en la base de datos para una Cadena Completa.
     *
     * @param {number} cadenaId - El ID único de la cadena de custodia asociada.
     * @param {Object} cadenaCompleta - El objeto que contiene las filas y muestras a insertar.
     * @param {Array<Object>} cadenaCompleta.filas - Lista de objetos de fila con el formato:
     *      [{ id, estado, compuestoId, metodoId, umId, protocoloItemId, <NombreMuestra1>: valor, <NombreMuestra2>: valor, ... }]
     * @param {Array<Object>} cadenaCompleta.muestras - Lista de objetos muestra con el formato:
     *      [{ muestraId, muestra (nombre), tipo, pozo }]
     *
     * @returns {Object} - Retorna un objeto que contiene las filas y valores insertados:
     *      {
     *          filas: [{ id, cadenaCustodiaId, compuestoId, metodoId, umId, estado, protocoloItemId }],
     *          valores: [{ id, cadenaCompletaFilaId, muestraId, valor }]
     *      }
     *
     * @throws {Error} - Lanza un error si ocurre algún problema durante la inserción de datos.
     */
    static async create (cadenaId, cadenaCompleta) {
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
            };
        } catch (error) {
            await conn.rollback();
            conn.release();
            throw dbErrorMsg(500, `Error guardando cadenaCompleta: ${error.message}`);
        }
    }

    /**
     * Obtiene una Cadena Completa por su ID desde la base de datos.
     *
     * @param {number} cadenaId - El ID único de la cadena de custodia a consultar.
     *
     * @returns {Object} - Retorna un objeto con la estructura de la cadena completa:
     *      {
     *          filas: [
     *              {
     *                  id: number,                // ID de la fila en la base de datos
     *                  compuestoId: number,      // ID del compuesto analizado
     *                  metodoId: number,         // ID del método de análisis
     *                  umId: number,             // ID de la unidad de medida
     *                  estado: number,           // Estado de la fila
     *                  protocoloItemId: number,  // ID del ítem de protocolo asociado (nullable)
     *                  <NombreMuestra1>: number | null,  // Valor asociado a la muestra 1 (si existe)
     *                  <NombreMuestra2>: number | null,  // Valor asociado a la muestra 2 (si existe)
     *                  ... // Más valores de muestras
     *              }
     *          ],
     *          muestras: [
     *              {
     *                  muestraId: number,    // ID único de la muestra
     *                  muestra: string,     // Nombre de la muestra
     *                  tipo: number,        // Tipo de muestra
     *                  pozo: number | null  // ID del pozo asociado o null si no aplica
     *                  nivelFreatico
     *                  profundidad
     *                  flna
     *                  cadenaOPDS
     *                  protocoloOPDS
     *                  matriz
     *              }
     *          ]
     *      }
     *
     * @throws {Error} - Lanza un error si ocurre algún problema al obtener los datos, como:
     *      - Error en la consulta SQL
     *      - ID de cadena no encontrado
     */
    static async getById (cadenaId) {
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
                `SELECT m.Id AS muestraId, m.Nombre AS muestra, m.Tipo AS tipo, m.PozoId AS pozo, 
                              m.nivelFreatico, m.profundidad, m.flna, m.nivelFLNA, m.cadenaOPDS, m.protocoloOPDS, c.matrizCodigo as matriz 
                 FROM Muestras m
                 LEFT JOIN CadenaCustodia c ON m.CadenaCustodiaId = c.id
                 WHERE m.CadenaCustodiaId = ?`,
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
                    fila[valor.muestra] = valor.valor !== null ? Number(valor.valor) : null;
                }
            }

            const filasArray = Array.from(filasMap.values());

            const cadenaCompleta = {
                filas: filasArray,
                muestras
            };

            return cadenaCompleta;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getByEventoMuestreoId (eventoMuestreoId, matrizId = null) {
        try {
            const [cadenas] = await pool.query(
                'SELECT id, matrizCodigo FROM CadenaCustodia WHERE EventoMuestreoId = ?',
                [eventoMuestreoId]
            );
            if (!cadenas.length) {
                throw dbErrorMsg(404, `No existen cadenas de custodia para el EventoMuestreo especificado (${eventoMuestreoId})`);
            }

            // obtengo los Ids de las cadenas involucradas (eventualmente filtradas por matriz)
            let cadenaIds;
            if (matrizId) {
                cadenaIds = cadenas.filter(c => Number(c.matrizCodigo) === Number(matrizId)).map(c => c.id);
                if (!cadenaIds.length) {
                    throw dbErrorMsg(404, `No existen cadenas de custodia para el EventoMuestreo/Matriz especificados (${eventoMuestreoId}-${matrizId})`);
                }
            } else {
                cadenaIds = cadenas.map(c => c.id);
            }

            // traigo todas las filas de las cadenas filtradas
            const [filas] = await pool.query(
                `SELECT id, cadenaCustodiaId, compuestoId, metodoId, umId, estado, protocoloItemId 
                 FROM CadenaCompletaFilas 
                 WHERE cadenaCustodiaId IN (?)`,
                [cadenaIds]
            );
            if (!filas.length) {
                throw dbErrorMsg(404, `No existen compuestos analizados para el EventoMuestreo/Matriz especificados (${eventoMuestreoId}-${matrizId})`);
            }

            // Extraemos los compuestoIds para consultar el campo Código en compuestos
            const compuestoIds = Array.from(new Set(filas.map(f => f.compuestoId)));
            const [compuestos] = await pool.query(
                'SELECT id as compuestoId, Codigo FROM compuestos WHERE id IN (?)',
                [compuestoIds]
            );

            // Extraemos los IDs de las cadenas que realmente tienen filas.
            const cadenaIdsConFilas = Array.from(new Set(filas.map(fila => fila.cadenaCustodiaId)));

            // Obtenemos los valores asociados, limitados a las cadenas con filas.
            const [valores] = await pool.query(
                `SELECT v.cadenaCompletaFilaId, v.muestraId, m.Nombre AS muestra, v.valor
                 FROM CadenaCompletaValores v
                 JOIN Muestras m ON v.muestraId = m.Id
                 WHERE m.CadenaCustodiaId IN (?)`,
                [cadenaIdsConFilas]
            );

            // Obtenemos las muestras solo de las cadenas que tienen registros.
            const [muestras] = await pool.query(
                `SELECT m.Id AS muestraId, m.Nombre AS muestra, m.Tipo AS tipo, m.PozoId AS pozo, m.cadenaCustodiaId, c.laboratorioId, 
                              m.nivelFreatico, m.profundidad, m.flna, m.cadenaOPDS, m.protocoloOPDS, c.matrizCodigo as matriz 
                 FROM Muestras m
                 LEFT JOIN CadenaCustodia c ON m.CadenaCustodiaId = c.id
                 WHERE m.CadenaCustodiaId IN (?)`,
                [cadenaIdsConFilas]
            );
            const codigoMap = {};
            for (const comp of compuestos) {
                codigoMap[comp.compuestoId] = comp.Codigo;
            }

            // Armamos un mapa para las filas y asignamos los valores correspondientes.
            const filasMap = new Map();
            for (const fila of filas) {
                filasMap.set(fila.id, {
                    id: fila.id,
                    cadenaCustodiaId: fila.cadenaCustodiaId,
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
                    fila[valor.muestra] = valor.valor !== null ? Number(valor.valor) : null;
                }
            }

            const filasArray = Array.from(filasMap.values());
            const filasMerge = mergeFilas(filasArray, codigoMap);

            const cadenaCompleta = {
                filas: filasMerge,
                muestras
            };

            return cadenaCompleta;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete (cadenaId) {
        try {
            await pool.query(
                `DELETE FROM CadenaCompletaValores 
                 WHERE cadenaCompletaFilaId IN 
                 (SELECT id FROM CadenaCompletaFilas WHERE cadenaCustodiaId = ?)`,
                [cadenaId]
            );

            const [result] = await pool.query(
                'DELETE FROM CadenaCompletaFilas WHERE cadenaCustodiaId = ?',
                [cadenaId]
            );

            if (!result.affectedRows) throw dbErrorMsg(404, 'No existe la CadenaCompleta especificada.');

            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar la CadenaCompleta porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
