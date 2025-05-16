// cadenasSubproyectoCompuesto_service.js
import { pool, dbErrorMsg } from '../database/db.js';

export default class CadenasSubproyectoCompuestoService {
    /**
     * Obtiene una matriz de valores por subproyecto, matriz y compuesto.
     * Las filas representan fechas de eventos de muestreo, y las columnas son los pozos.
     *
     * @param {number} subproyectoId - ID del subproyecto.
     * @param {number} matrizCodigo - Código de la matriz (ej: 'AGUA').
     * @param {number} compuestoId - ID del compuesto seleccionado.
     * @returns {Object[]} - Array de objetos donde cada fila representa una fecha de evento con valores por pozo.
     */
    static async getCadenasPorSubproyectoCompuesto (subproyectoId, matrizCodigo, compuestoId) {
        try {
            // Obtener todas las cadenas del subproyecto y matriz
            const [cadenas] = await pool.query(
                `SELECT cc.id AS cadenaId, cc.EventoMuestreoId, em.fecha
                 FROM CadenaCustodia cc
                 JOIN EventoMuestreo em ON cc.EventoMuestreoId = em.id
                 WHERE cc.subproyectoId = ? AND cc.matrizCodigo = ?
                 ORDER BY em.fecha`,
                [subproyectoId, matrizCodigo]
            );

            if (!cadenas.length) {
                throw dbErrorMsg(404, 'No se encontraron cadenas para el subproyecto y matriz indicados.');
            }

            const cadenaIds = cadenas.map(c => c.cadenaId);

            // Obtener las filas que coinciden con el compuesto solicitado
            const [filas] = await pool.query(
                `SELECT f.id, f.cadenaCustodiaId, f.metodoId
                 FROM CadenaCompletaFilas f
                 WHERE f.cadenaCustodiaId IN (?) AND f.compuestoId = ?`,
                [cadenaIds, compuestoId]
            );
            const filaIds = filas.map(f => f.id);

            if (!filas.length) {
                throw dbErrorMsg(404, 'No se encontraron registros del compuesto en las cadenas seleccionadas.');
            }

            // Obtener los valores de esas filas
            const [valores] = await pool.query(
                `SELECT v.cadenaCompletaFilaId, v.valor, m.Nombre AS muestra, m.PozoId, m.CadenaCustodiaId
                 FROM CadenaCompletaValores v
                 JOIN Muestras m ON v.muestraId = m.Id 
                 WHERE v.cadenaCompletaFilaId IN (?)`,
                [filaIds]
            );

            const resultado = [];

            for (const val of valores) {
                const fila = filas.find(f => f.id === val.cadenaCompletaFilaId);
                const cadena = cadenas.find(c => c.cadenaId === fila.cadenaCustodiaId);
                const fecha = typeof cadena.fecha === 'string' ? cadena.fecha : cadena.fecha.toISOString().split('T')[0];

                if (val.PozoId) {
                    resultado.push({
                        fecha,
                        pozoId: val.PozoId,
                        valor: val.valor !== null ? Number(val.valor) : null
                    });
                }
            }

            return resultado;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    /**
     * Devuelve una tabla plana para todos los valores de un subproyecto.
     *
     * @param {number} subproyectoId - ID del subproyecto.
     * @returns {Object[]} - Array de objetos {pozoId, pozoNombre, fecha, compuestoId, compuestoNombre, unidad, valor, tipodato:(compuesto, nivel, fase)}.
     */
    static async getValoresSubproyecto (subproyectoId) {
        const sql = `-- Datos de compuestos desde CadenaCompletaValores
                WITH DatosRaw AS (
                    SELECT
                        p.subproyectoId,
                        p.id AS pozoId,
                        p.nombre AS pozoNombre,
                        em.fecha,
                        JSON_EXTRACT(JSON_OBJECT('v', em.soloMuestras = 1), '$.v') AS soloMuestras,
                        c.codigo AS compuestoCodigo,
                        c.id AS compuestoId,
                        c.nombre AS compuestoNombre,
                        um.nombre AS unidad,
                        CAST(ccv.valor AS DECIMAL(10,4)) AS valor,
                        'compuesto' AS tipoDato
                    FROM EventoMuestreo em
                    JOIN CadenaCustodia cc ON cc.eventoMuestreoId = em.id
                    JOIN Muestras m ON m.cadenaCustodiaId = cc.id
                    JOIN Pozos p ON p.id = m.pozoId
                    JOIN CadenaCompletaValores ccv ON ccv.muestraId = m.id
                    JOIN CadenaCompletaFilas ccf ON ccf.id = ccv.cadenaCompletaFilaId
                    JOIN Compuestos c ON c.id = ccf.compuestoId
                    JOIN UM um ON um.id = ccf.umId
                    WHERE p.subproyectoId = ?

                    UNION ALL

                    -- Nivel freático como "compuesto virtual"
                    SELECT
                        p.subproyectoId,
                        p.id AS pozoId,
                        p.nombre AS pozoNombre,
                        em.fecha,
                        JSON_EXTRACT(JSON_OBJECT('v', em.soloMuestras = 1), '$.v') AS soloMuestras,
                        '00000001' AS compuestoCodigo,
                        -1 AS compuestoId,
                        'Nivel freático' AS compuestoNombre,
                        'm.b.b.p.' AS unidad,
                        CAST(CASE WHEN m.nivelFreatico = 0 THEN -4 ELSE m.nivelFreatico END AS DECIMAL(10,4)) AS valor,
                        'nivel' AS tipoDato
                    FROM EventoMuestreo em
                    JOIN CadenaCustodia cc ON cc.eventoMuestreoId = em.id
                    JOIN Muestras m ON m.cadenaCustodiaId = cc.id
                    JOIN Pozos p ON p.id = m.pozoId
                    WHERE m.nivelFreatico IS NOT NULL
                    AND p.subproyectoId = ?

                    UNION ALL

                    -- FLNA como "compuesto virtual"
                    SELECT
                        p.subproyectoId,
                        p.id AS pozoId,
                        p.nombre AS pozoNombre,
                        em.fecha,
                        JSON_EXTRACT(JSON_OBJECT('v', em.soloMuestras = 1), '$.v') AS soloMuestras,
                        '00000002' AS compuestoCodigo,
                        -2 AS compuestoId,
                        'FLNA' AS compuestoNombre,
                        'm' AS unidad,
                        CAST(CASE WHEN m.flna = 0 THEN -4 ELSE m.flna END AS DECIMAL(10,4)) AS valor,
                        'fase' AS tipoDato
                    FROM EventoMuestreo em
                    JOIN CadenaCustodia cc ON cc.eventoMuestreoId = em.id
                    JOIN Muestras m ON m.cadenaCustodiaId = cc.id
                    JOIN Pozos p ON p.id = m.pozoId
                    WHERE m.flna IS NOT NULL
                    AND p.subproyectoId = ?
                )
                SELECT 
                    dr.*,
                    CASE
                        WHEN dr.valor IN (-4, -3, -2) THEN NULL      -- NA o ND → null en chart
                        WHEN dr.valor <= 0 THEN 0.00001          -- NC       → valor muy pequeño / podria ser 1/2*LQ
                        ELSE dr.valor                            -- resto    → valor real
                    END AS valorChart
                    FROM DatosRaw dr;
                `;

        try {
            // Obtener todas las cadenas del subproyecto y matriz
            const [valores] = await pool.query(sql, [subproyectoId, subproyectoId, subproyectoId]);
            return valores;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
