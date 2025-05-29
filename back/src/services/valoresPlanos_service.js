// cadenasSubproyectoCompuesto_service.js
import { pool, dbErrorMsg } from '../database/db.js';

export default class ValoresPlanosService {
    /**
     * Devuelve una tabla plana para todos los valores de un subproyecto.
     *
     * @param {number} subproyectoId - ID del subproyecto.
     * @returns {Object[]} - Array de objetos {pozoId, pozoNombre, fecha, compuestoId, compuestoNombre, unidad, valor, tipodato:(compuesto, nivel, fase), etc}.
     */
    static async getValoresSubproyecto (subproyectoId) {
        const sql = 'SELECT * FROM valoresplanos where subproyectoId = ?;';

        try {
            // Obtener todas las cadenas del subproyecto y matriz
            const [valores] = await pool.query(sql, [subproyectoId]);
            return valores;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
