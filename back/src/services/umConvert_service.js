import { pool, dbErrorMsg } from '../database/db.js';
import UMConvert from '../models/umconvert_model.js';

const allowedFields = {
    id: 'uc.id',
    desdeUMId: 'uc.desdeUMId',
    desdeUM: 'u1.nombre',
    hastaUMId: 'uc.hastaUMId',
    hastaUM: 'u2.nombre',
    factor: ' uc.factor'
};

const table = 'umconvert';
const selectBase = 'SELECT uc.id, uc.desdeUMId, u1.nombre as desdeUM , uc.hastaUMId, u2.nombre as hastaUM, uc.factor ';
const selectTables = 'FROM UMconvert uc ' +
                     'LEFT JOIN UM u1 ON u1.Id = uc.desdeUMId ' +
                     'LEFT JOIN UM u2 ON u2.Id = uc.hastaUMId';
const mainTable = 'uc';
const noExiste = 'La Unidad de medida no existe';
const yaExiste = 'La unidad de medida ya existe';

export default class UMConvertService {
    static getAllowedFields () {
        return allowedFields;
    }

    static async getFactor (desde, hasta) {
        try {
            const sql = 'SELECT id, desdeUMId, hastaUMId, factor from UMConvert WHERE desdeUMId = ? AND hastaUMId = ?';
            const [rows] = await pool.query(sql, [desde, hasta]);
            if (!rows.length) return null;
            return rows[0].factor;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getAll () {
        try {
            const sql = 'SELECT id, desdeUMId, hastaUMId, factor from UMConvert';
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getAllDx (devExtremeQuery) {
        const { where, values = [], order = [], limit = 50, offset = 0 } = devExtremeQuery ?? {};

        try {
            // totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total ${selectTables}
                      ${where ? `WHERE ${where}` : ''}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;

            // data
            const dataValues = [...values, limit, offset];
            const sql = `${selectBase} ${selectTables}
                 ${where ? `WHERE ${where}` : ''}
                 ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                 LIMIT ? OFFSET ?`;
            const [rows] = await pool.query(sql, dataValues);

            return { data: rows, totalCount };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.Id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new UMConvert(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (entityToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [entityToAdd]);
            entityToAdd.id = rows.insertId;

            return new UMConvert(entityToAdd);
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

    static async update (id, entity) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [entity, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return UMConvertService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
