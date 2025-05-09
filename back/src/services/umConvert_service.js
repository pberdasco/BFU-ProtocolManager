import { pool, dbErrorMsg } from '../database/db.js';

export default class UMConvertService {
    static async getAll () {
        try {
            const sql = 'SELECT id, desdeUMId, hastaUMId, factor from UMConvert';
            const [rows] = await pool.query(sql);
            return rows;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
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
}
