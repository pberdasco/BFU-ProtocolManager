import { pool, dbErrorMsg } from '../database/db.js';
import { normalizarTexto } from '../utils/textNormalizer.js';
import SinonimoCompuesto from '../models/sinonimosCompuesto_model.js';

const allowedFields = {
    id: 's.id',
    textoLab: 's.textolab',
    textoProcesado: 's.textoProcesado',
    compuestoId: 's.compuestoId',
    compuesto: 'c.nombre',
    matrizId: 's.matrizId'
};

const table = 'SinonimosCompuestos';
const selectBase = 'SELECT s.id, s.textoLab, s.textoProcesado, s.compuestoId, c.nombre as compuesto, s.matrizId';
const selectTables = 'FROM  SinonimosCompuestos s ' +
                     'LEFT JOIN Compuestos c ON s.compuestoId = c.id ';
const mainTable = 's';
const noExiste = 'El SinonimoCompuesto no existe';
const yaExiste = 'El SinonimoCompuesto ya existe';

export default class SinonimosCompuestosService {
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

            return { data: rows, totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new SinonimoCompuesto(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async convertList (listToConvert) {
        const { compuestosOriginales, matrizId } = listToConvert;
        const convertedList = [];

        try {
            const compuestosProcesados = compuestosOriginales.map(compuesto => normalizarTexto(compuesto));

            const sql = `
                SELECT 
                    s.textoLab AS compuestoOriginal, 
                    s.textoProcesado AS compuestoProcesado, 
                    s.compuestoId, 
                    s.matrizId
                FROM SinonimosCompuestos s
                WHERE s.textoProcesado IN (${compuestosProcesados.map(() => '?').join(',')})
                AND s.matrizId = ?
            `;

            const [rows] = await pool.query(sql, [...compuestosProcesados, matrizId]);

            compuestosOriginales.forEach((compuestoOriginal, index) => {
                const compuestoProcesado = compuestosProcesados[index];
                const encontrado = rows.find(row => row.compuestoProcesado === compuestoProcesado);

                convertedList.push({
                    compuestoOriginal,
                    compuestoProcesado,
                    compuestoId: encontrado ? encontrado.compuestoId : null
                });
            });

            return convertedList;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (entityToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [entityToAdd]);
            entityToAdd.id = rows.insertId;
            return new SinonimoCompuesto(entityToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, entity) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [entity, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return SinonimosCompuestosService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete (id) {
        try {
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar el recurso porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
