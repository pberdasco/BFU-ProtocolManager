import { pool, dbErrorMsg } from '../database/db.js';
import Muestra from '../models/muestras_model.js';

const allowedFields = {
    id: 'm.id',
    pozoId: 'm.pozoId',
    pozo: 'p.nombre',
    cadenaCustodiaId: 'm.cadenaCustodiaID',
    nombreBase: 'm.nombreBase',
    nombreIndex: 'm.nombreIndex',
    nombre: 'm.nombre',
    tipo: 'm.tipo',
    nivelFreatico: 'm.nivelFreatico',
    nivelFLNA: 'm.nivelFLNA',
    profundidad: 'm.profundidad',
    flna: 'm.flna',
    cadenaOPDS: 'm.cadenaOPDS',
    protocoloOPDS: 'm.protocoloOPDS'
};

const table = 'Muestras';
const selectBase = 'SELECT m.id, m.nombreBase, m.nombreIndex, m.nombre, m.pozoId, p.nombre as pozo, m.cadenaCustodiaId, m.tipo, m.nivelFreatico, ' +
                   'm.profundidad, m.nivelFLNA, m.flna, m.cadenaOPDS, m.protocoloOPDS ';
const selectTables = 'FROM Muestras m ' +
                     'LEFT JOIN Pozos P ON m.pozoId = P.id ';
const mainTable = 'm';
const noExiste = 'La muestra no existe';
const yaExiste = 'La muestra ya existe';

export default class MuestrasService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            const countSql = `SELECT COUNT(*) as total ${selectTables} ${where ? `WHERE ${where}` : ''}`;

            const [countResult] = await pool.query(countSql, values);
            const totalCount = countResult[0].total;

            const sql = `${selectBase} ${selectTables}
                         ${where ? `WHERE ${where}` : ''}
                         ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                         LIMIT ? OFFSET ?`;
            values.push(limit, offset);
            const [rows] = await pool.query(sql, values);

            return { data: Muestra.fromRows(rows), totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Muestra(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (muestraToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [muestraToAdd]);
            muestraToAdd.id = rows.insertId;

            // si el index es mayor al ultimo del pozo para la matriz en cuestion, actualizar en pozos
            await MuestrasService.newUltimaMuestra(muestraToAdd.nombreIndex, muestraToAdd.pozoId, muestraToAdd.cadenaCustodiaId, 0);

            return new Muestra(muestraToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, muestra) {
        try {
            const old = await MuestrasService.getById(id);
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [muestra, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            const nueva = await MuestrasService.getById(id);
            await MuestrasService.newUltimaMuestra(nueva.nombreIndex, nueva.pozoId, nueva.cadenaCustodiaId, old.nombreIndex);
            return nueva;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete (id) {
        try {
            const muestra = await MuestrasService.getById(id);
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            await MuestrasService.newUltimaMuestra(0, muestra.pozoId, muestra.cadenaCustodiaId, muestra.nombreIndex);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar el recurso porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    /**
     * Actualiza en la tabla Pozos el índice de la última muestra para la matriz correspondiente
     * (agua, FLNA o gases), según la muestra asociada a un pozo y cadena de custodia.
     *
     * Reglas:
     * - Si el `nombreIndex` es mayor al valor actual del campo correspondiente en Pozos,
     *   se actualiza con el nuevo valor.
     * - Si el índice anterior (`oldIndex`) coincide con el valor actual y el nuevo índice es menor,
     *   se recalcula el valor máximo existente de `nombreIndex` para ese pozo y matriz.
     *
     * Solo aplica si la cadena está asociada a una matriz válida (agua=1, FLNA=2, gases=4).
     * Las cadenas de suelo (matriz 3) no afectan ningún índice.
     *
     * La funcion se ejecuta tanto en create como update y delete de muestras.
     *
     * @param {number} nombreIndex - El nuevo índice de muestra a evaluar.
     * @param {number} pozoId - ID del pozo asociado.
     * @param {number} cadenaCustodiaId - ID de la cadena de custodia asociada.
     * @param {number|null} [oldIndex=null] - El índice anterior de la muestra (para comparación descendente).
     *
     * @returns {Promise<void>}
     */
    static async newUltimaMuestra (nombreIndex, pozoId, cadenaCustodiaId, oldIndex = null) {
        if ((typeof nombreIndex !== 'number' || nombreIndex < 0) || !pozoId || !cadenaCustodiaId) return;
        try {
            const [cadenaRows] = await pool.query(
                'SELECT MatrizCodigo FROM CadenaCustodia WHERE id = ?',
                [cadenaCustodiaId]
            );
            if (cadenaRows.length === 0) return;

            const matrizCodigo = cadenaRows[0].MatrizCodigo;
            let campoActualizar = null;
            switch (matrizCodigo) {
            case 1: campoActualizar = 'UltMuestraAguaIdx'; break;
            case 2: campoActualizar = 'UltMuestraFLNAIdx'; break;
            case 4: campoActualizar = 'UltMuestraGasIdx'; break;
            default: return;
            }

            const [pozoRows] = await pool.query(
                `SELECT ${campoActualizar} FROM Pozos WHERE id = ?`,
                [pozoId]
            );
            if (pozoRows.length === 0) return;

            const valorActual = pozoRows[0][campoActualizar];

            // Si es mayor, actualizar
            if (valorActual == null || nombreIndex > valorActual) {
                await pool.query(
                    `UPDATE Pozos SET ${campoActualizar} = ? WHERE id = ?`,
                    [nombreIndex, pozoId]
                );
            } else if (oldIndex !== null && oldIndex === valorActual && nombreIndex < oldIndex) {
                // Si el valor viejo era el índice actual, y se bajó o eliminó, recalcular
                const [maxRows] = await pool.query(`
                    SELECT MAX(m.NombreIndex) as maxIdx
                        FROM Muestras m
                        JOIN CadenaCustodia c ON m.CadenaCustodiaId = c.Id
                        WHERE m.PozoId = ? AND c.MatrizCodigo = ?`,
                [pozoId, matrizCodigo]);

                const nuevoMax = maxRows[0].maxIdx ?? null;
                await pool.query(`UPDATE Pozos SET ${campoActualizar} = ? WHERE id = ?`, [nuevoMax, pozoId]);
            }
        } catch (error) {
            console.error('Error en newUltimaMuestra:', error);
        }
    }

    /**
     * Duplica todas las muestras asociadas a una cadena de custodia existente (`origCadenaId`)
     * hacia una nueva cadena (`nuevaCadenaId`), generando nuevos índices consecutivos por pozo y matriz.
     *
     * Por cada muestra:
     * - Se obtiene el índice actual registrado en el pozo según el tipo de matriz (agua, FLNA o gases).
     * - Se incrementa ese índice en 1 y se utiliza como `nombreIndex` de la nueva muestra.
     * - Se genera el nuevo campo `nombre` combinando `nombreBase` con el nuevo índice.
     * - Se insertan los valores mínimos requeridos. Otros campos se dejan en null o 0.
     * - Se actualiza en Pozos el nuevo valor del índice máximo (`UltMuestra*Idx`).
     *
     * Las matrices válidas son:
     * - Agua (1) → campo `UltMuestraAguaIdx`
     * - FLNA (2) → campo `UltMuestraFLNAIdx`
     * - Gases (4) → campo `UltMuestraGasIdx`
     *
     * No se realiza duplicación para otros tipos de matriz.
     *
     * @param {number} origCadenaId - ID de la cadena de custodia original a copiar.
     * @param {number} nuevaCadenaId - ID de la nueva cadena de custodia destino.
     * @param {import('mysql2/promise').PoolConnection} conn - Conexión activa de MySQL con transacción iniciada.
     *
     * @returns {Promise<void>}
     */
    static async copyFromCadena (origCadenaId, nuevaCadenaId, conn) {
        const [muestras] = await conn.query(
            'SELECT * FROM Muestras WHERE cadenaCustodiaId = ?',
            [origCadenaId]
        );

        for (const m of muestras) {
            // Obtener matrizCodigo de la cadena original
            const [matrizRes] = await conn.query('SELECT MatrizCodigo FROM CadenaCustodia WHERE id = ?', [origCadenaId]);
            const matrizCodigo = matrizRes[0]?.MatrizCodigo;
            if (!matrizCodigo) continue;

            // Obtener índice actual del pozo
            const campo = matrizCodigo === 1
                ? 'UltMuestraAguaIdx'
                : matrizCodigo === 2
                    ? 'UltMuestraFLNAIdx'
                    : matrizCodigo === 4
                        ? 'UltMuestraGasIdx'
                        : null;

            if (!campo) continue;

            const [pozoRes] = await conn.query(`SELECT ${campo} FROM Pozos WHERE id = ?`, [m.PozoId]);
            const indexActual = pozoRes[0]?.[campo] ?? 0;
            const nuevoIndex = indexActual + 1;

            const nuevaMuestra = {
                pozoId: m.PozoId,
                cadenaCustodiaId: nuevaCadenaId,
                nombreBase: m.NombreBase,
                nombreIndex: nuevoIndex,
                nombre: `${m.NombreBase}/${nuevoIndex}`,
                tipo: m.Tipo,
                nivelFreatico: 0,
                nivelFLNA: null,
                profundidad: null,
                flna: null,
                cadenaOPDS: null,
                protocoloOPDS: null
            };

            await conn.query('INSERT INTO Muestras SET ?', [nuevaMuestra]);
            await conn.query(`UPDATE Pozos SET ${campo} = ? WHERE id = ?`, [nuevoIndex, m.PozoId]);
        }
    }
}
