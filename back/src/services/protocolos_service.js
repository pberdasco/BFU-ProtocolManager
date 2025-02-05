import { pool, dbErrorMsg } from "../database/db.js";

export default class ProtocolosService {
    
    static async createProtocolo(formData, adelantoData) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction(); 

            const protocoloId = await insertProtocolo(conn, formData);
            const protocoloItems = await insertItemsProtocolo(conn, protocoloId, adelantoData);
            const protocoloMuestras = await insertMuestrasProtocolo(conn, protocoloId, adelantoData);
            const protocoloResultados = await insertResultadosProtocolo(conn, protocoloItems, protocoloMuestras, adelantoData);

            await conn.commit(); 
            conn.release();
            return { 
                protocoloId, 
                nombre: formData.adelanto?.[0]?.name.replace(/\.(xlsx|xls)$/, ''), 
                evento: formData.evento, 
                laboratorio: formData.laboratorio,
                matrizId: formData.matrizId,
                //TODO: fecha
                protocoloItems, 
                protocoloMuestras, 
                protocoloResultados 
            };
        } catch (error) {
            await conn.rollback(); 
            conn.release();
            throw dbErrorMsg(500, `Error guardando protocolo: ${error.message}`);
        }
    }

    static async getById(id) {
        const conn = await pool.getConnection();
        try {
            const [protocolo, items, muestras, resultados] = await Promise.all([
                getProtocoloGeneral(conn, id),
                getProtocoloItems(conn, id),
                getProtocoloMuestras(conn, id),
                getProtocoloResultados(conn, id)
            ]);

            if (!protocolo) throw dbErrorMsg(404, "Protocolo no encontrado");

            conn.release();
            return {
                protocoloId: protocolo.id,
                nombre: protocolo.nombre,
                evento: protocolo.evento,
                laboratorio: protocolo.laboratorio,
                matrizId: protocolo.matrizId,
                fecha: protocolo.fecha,
                protocoloItems: items,
                protocoloMuestras: muestras,
                protocoloResultados: resultados
            };
        } catch (error) {
            conn.release();
            throw dbErrorMsg(500, `Error obteniendo protocolo: ${error.message}`);
        }
    }

    static async getOriginalById(id) {
        const conn = await pool.getConnection();
        try {
            const [protocolo, items, muestras, resultados] = await Promise.all([
                getProtocoloGeneral(conn, id),
                getProtocoloItems(conn, id),
                getProtocoloMuestras(conn, id),
                getProtocoloResultados(conn, id)
            ]);

            if (!protocolo) throw dbErrorMsg(404, "Protocolo no encontrado");

            // Mapeo de resultados a la estructura de `data`
            const dataMap = {};
            items.forEach(item => {
                dataMap[item.compuestoLab] = {
                    compuestoLab: item.compuestoLab,
                    compuestoId: item.compuestoId,
                    metodoLab: item.metodoLab,
                    metodoId: item.metodoId,
                    unidadLab: item.unidadLab,
                    unidadId: item.unidadId
                };
            });

            resultados.forEach(resultado => {
                const item = items.find(i => i.id === resultado.itemProtocoloId);
                const muestra = muestras.find(m => m.id === resultado.muestraProtocoloId);
                if (item && muestra) {
                    dataMap[item.compuestoLab][muestra.muestraLab] = resultado.valor;
                }
            });

            const data = Object.values(dataMap);

            conn.release();
            return {
                formData: {
                    evento: protocolo.evento,
                    laboratorio: protocolo.laboratorio,
                    matrizId: protocolo.matrizId,
                    fecha: protocolo.fecha,
                    adelanto: [{ name: protocolo.nombre + ".xlsx" }]
                },
                adelantoData: {
                    data,
                    muestras
                }
            };
        } catch (error) {
            conn.release();
            throw dbErrorMsg(500, `Error obteniendo protocolo original: ${error.message}`);
        }
    }
}





async function insertProtocolo(conn, formData){
    const protocoloSql = `INSERT INTO Protocolos (nombre, fecha, eventoMuestreoId, laboratorioId, matrizId)
                            VALUES (?, NOW(), ?, ?, ?)
                        `;
    const [protocoloResult] = await conn.query(protocoloSql, [
        formData.adelanto?.[0]?.name.replace(/\.(xlsx|xls)$/, ''), 
        formData.evento, 
        formData.laboratorio,
        formData.matrizId
    ]);
    return protocoloResult.insertId;
}

async function insertItemsProtocolo(conn, protocoloId, adelantoData){
    const protocoloItems = [];
    for (const compuesto of adelantoData.data) {
        const [itemResult] = await conn.query(
            `INSERT INTO ItemsProtocolo (protocoloId, compuestoLab, compuestoId, metodoLab, metodoId, umLab, umId)
                VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [protocoloId, compuesto.compuestoLab, compuesto.compuestoId || null, 
                compuesto.metodoLab, compuesto.metodoId || null, 
                compuesto.unidadLab, compuesto.unidadId || null]
        );
        protocoloItems.push({ 
            id: itemResult.insertId, 
            compuestoLab: compuesto.compuestoLab,
            metodoLab: compuesto.metodoLab,
            metodoId: compuesto.metodoId,
            unidadLab: compuesto.unidadLab,
            unidadId: compuesto.unidadId
        });
    }
    return protocoloItems;
}

async function insertMuestrasProtocolo(conn, protocoloId, adelantoData) {
    const protocoloMuestras = [];
    for (const muestra of adelantoData.muestras) {
        const [muestraResult] = await conn.query(
            `INSERT INTO MuestrasProtocolo (protocoloId, muestraLab, muestraId) 
                VALUES (?, ?, ?)`, 
            [protocoloId, muestra.muestraLab, muestra.muestraCadena || null]
        );
        protocoloMuestras.push({ 
            id: muestraResult.insertId, 
            muestraLab: muestra.muestraLab,
            muestraCadena: muestra.muestraCadena || null
        });
    }
    return protocoloMuestras;
}

async function insertResultadosProtocolo(conn, protocoloItems, protocoloMuestras, adelantoData) {
    const protocoloResultados = [];
    for (const compuesto of adelantoData.data) {
        const protocoloItem = protocoloItems.find(p => p.compuestoLab === compuesto.compuestoLab);
        if (!protocoloItem){
            console.warn(`⚠ No se encontró protocoloItem para compuesto: ${compuesto.compuestoLab}`);  
            continue;
        } 

        for (const campo in compuesto) {
            if (!["compuestoLab", "compuestoId", "metodoLab", "metodoId", "unidadLab", "unidadId"].includes(campo)) {
                const protocoloMuestra = protocoloMuestras.find(m => m.muestraLab === campo);
                if (!protocoloMuestra){
                    console.warn(`⚠ No se encontró protocoloMuestra para muestra: ${campo}`);
                    continue;
                } 
                console.log(`✅ Insertando resultado: compuestoId=${protocoloItem.id}, muestraId=${protocoloMuestra.id}, valor=${compuesto[campo]}`);

                const [resultado] = await conn.query(
                    `INSERT INTO ResultadosProtocolo (itemProtocoloId, muestraProtocoloId, valor)
                     VALUES (?, ?, ?)`, 
                    [protocoloItem.id, protocoloMuestra.id, 
                     compuesto[campo] === "" ? null : parseFloat(compuesto[campo])]
                );
                
                protocoloResultados.push({ id: resultado.insertId, protocoloItemId: protocoloItem.id, protocoloMuestraId: protocoloMuestra.id, valor: compuesto[campo] });
            }
        }
    }
    return protocoloResultados;
}

// Funciones para los GETs
async function getProtocoloGeneral(conn, id) {
    const [rows] = await conn.query(
        `SELECT id, nombre, eventoMuestreoId AS evento, laboratorioId AS laboratorio, matrizId, fecha 
         FROM Protocolos WHERE id = ?`, 
        [id]
    );
    return rows.length ? rows[0] : null;
}

async function getProtocoloItems(conn, id) {
    const [rows] = await conn.query(
        `SELECT id, compuestoLab, compuestoId, metodoLab, metodoId, umLab AS unidadLab, umId AS unidadId
         FROM ItemsProtocolo WHERE protocoloId = ?`, 
        [id]
    );
    return rows;
}

async function getProtocoloMuestras(conn, id) {
    const [rows] = await conn.query(
        `SELECT id, muestraLab, muestraId AS muestraCadena FROM MuestrasProtocolo WHERE protocoloId = ?`,  
        [id]
    );
    return rows;
}

async function getProtocoloResultados(conn, id) {
    const [rows] = await conn.query(
        `SELECT id, itemProtocoloId, muestraProtocoloId, valor 
         FROM ResultadosProtocolo WHERE itemProtocoloId IN 
         (SELECT id FROM ItemsProtocolo WHERE protocoloId = ?)`, 
        [id]
    );
    return rows;
}
