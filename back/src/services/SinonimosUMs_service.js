import { pool, dbErrorMsg } from '../database/db.js';
import { normalizarTextoUM } from '../utils/textNormalizer.js';
import SinonimoUM from '../models/sinonimosUm_model.js';

const allowedFields = {
    id: 's.id',
    textoLab: 's.textolab',
    textoProcesado: 's.textoProcesado',
    umId: 's.umId',
    um: 'u.nombre'
};

const table = 'SinonimosUM';
const selectBase = 'SELECT s.id, s.textoLab, s.textoProcesado, s.umId, u.nombre as um ';
const selectTables = 'FROM  SinonimosUM s ' +
                     'LEFT JOIN UM u ON s.umId = u.id ';
const mainTable = 's';
const noExiste = 'El SinonimoUM no existe';
const yaExiste = 'El SinonimoUM ya existe';

export default class SinonimosUMsService {
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
            return new SinonimoUM(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async convertList (listToConvert) {
        const { umsOriginales } = listToConvert;
        const convertedList = [];
        try {
            const umsProcesados = umsOriginales.map(um => normalizarTextoUM(um));

            const sql = `
                SELECT 
                    s.textoLab AS umOriginal, 
                    s.textoProcesado AS umProcesado, 
                    s.umId
                FROM SinonimosUM s
                WHERE s.textoProcesado IN (${umsProcesados.map(() => '?').join(',')})
            `;
            const [rows] = await pool.query(sql, [...umsProcesados]);

            umsOriginales.forEach((umOriginal, index) => {
                const umProcesado = umsProcesados[index];
                const encontrado = rows.find(row => row.umProcesado === umProcesado);

                convertedList.push({
                    umOriginal,
                    umProcesado,
                    umId: encontrado ? encontrado.umId : null
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
            return new SinonimoUM(entityToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, entity) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [entity, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return SinonimosUMsService.getById(id);
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
