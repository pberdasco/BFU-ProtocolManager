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
            await this.newUltimaMuestra(muestraToAdd.nombreIndex, muestraToAdd.pozoId, muestraToAdd.cadenaCustodiaId, 0);

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
            await this.newUltimaMuestra(nueva.nombreIndex, nueva.pozoId, nueva.cadenaCustodiaId, old.nombreIndex);
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
            await this.newUltimaMuestra(0, muestra.pozoId, muestra.cadenaCustodiaId, muestra.nombreIndex);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar el recurso porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async newUltimaMuestra (nombreIndex, pozoId, cadenaCustodiaId, oldIndex = null) {
        if ((typeof nombreIndex !== 'number' || nombreIndex < 0) || !pozoId || !cadenaCustodiaId) return;

        try {
            const [cadenaRows] = await pool.query(
                'SELECT matrizCodigo FROM CadenasCustodia WHERE id = ?',
                [cadenaCustodiaId]
            );
            if (cadenaRows.length === 0) return;

            const matrizCodigo = cadenaRows[0].matrizCodigo;
            let campoActualizar = null;
            switch (matrizCodigo) {
            case 1: campoActualizar = 'ultMuestraAguaIdx'; break;
            case 2: campoActualizar = 'ultMuestraFLNAIdx'; break;
            case 4: campoActualizar = 'ultMuestraGasIdx'; break;
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
                SELECT MAX(m.nombreIndex) as maxIdx
                FROM Muestras m
                JOIN CadenasCustodia c ON m.cadenaCustodiaId = c.id
                WHERE m.pozoId = ? AND c.matrizCodigo = ?`,
                [pozoId, matrizCodigo]
                );
                const nuevoMax = maxRows[0].maxIdx ?? null;
                await pool.query(
                    `UPDATE Pozos SET ${campoActualizar} = ? WHERE id = ?`,
                    [nuevoMax, pozoId]
                );
            }
        } catch (error) {
            console.error('Error en newUltimaMuestra:', error);
        }
    }

    static async copyFromCadena (origCadenaId, nuevaCadenaId, conn) {
        const [muestras] = await conn.query(
            'SELECT * FROM Muestras WHERE cadenaCustodiaId = ?',
            [origCadenaId]
        );

        for (const m of muestras) {
        // Obtener matrizCodigo de la cadena original
            const [matrizRes] = await conn.query(
                'SELECT matrizCodigo FROM CadenaCustodia WHERE id = ?',
                [origCadenaId]
            );
            const matrizCodigo = matrizRes[0]?.matrizCodigo;
            if (!matrizCodigo) continue;

            // Obtener índice actual del pozo
            const campo = matrizCodigo === 1
                ? 'ultMuestraAguaIdx'
                : matrizCodigo === 2
                    ? 'ultMuestraFLNAIdx'
                    : matrizCodigo === 4
                        ? 'ultMuestraGasIdx'
                        : null;

            if (!campo) continue;

            const [pozoRes] = await conn.query(`SELECT ${campo} FROM Pozos WHERE id = ?`, [m.pozoId]);
            const indexActual = pozoRes[0]?.[campo] ?? 0;
            const nuevoIndex = indexActual + 1;

            const nuevaMuestra = {
                pozoId: m.pozoId,
                cadenaCustodiaId: nuevaCadenaId,
                nombreBase: m.nombreBase,
                nombreIndex: nuevoIndex,
                nombre: `${m.nombreBase}-${nuevoIndex}`,
                tipo: m.tipo,
                nivelFreatico: m.nivelFreatico,
                nivelFLNA: m.nivelFLNA,
                profundidad: m.profundidad,
                flna: m.flna,
                cadenaOPDS: m.cadenaOPDS,
                protocoloOPDS: m.protocoloOPDS
            };

            await conn.query('INSERT INTO Muestras SET ?', [nuevaMuestra]);
            await conn.query(`UPDATE Pozos SET ${campo} = ? WHERE id = ?`, [nuevoIndex, m.pozoId]);
        }
    }
}
