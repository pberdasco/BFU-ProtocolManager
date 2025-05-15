import { pool, dbErrorMsg } from '../../../database/db.js';
/**
     * Devuelve una tabla plana para todos los valores de un subproyecto.
     *
     * @param {number} subproyectoId - ID del subproyecto.
     * @returns {Object[]} - Array de objetos {pozoId, pozoNombre, fecha, compuestoId, compuestoNombre, unidad, valor, tipodato:(compuesto, nivel, fase)}.
     */
export async function getPlainData (subproyectoId, uniquePozos, uniqueCompuestos) {
    const sql = `-- Datos de compuestos desde CadenaCompletaValores
                    WITH DatosRaw AS (
                        SELECT
                            p.subproyectoId,
                            p.id AS pozoId,
                            p.nombre AS pozoNombre,
                            DATE_FORMAT(em.fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha,
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
                        WHERE p.subproyectoId = ? AND pozoId IN (?) AND compuestoId IN (?)
    
                        UNION ALL
    
                        -- Nivel freático como "compuesto virtual"
                        SELECT
                            p.subproyectoId,
                            p.id AS pozoId,
                            p.nombre AS pozoNombre,
                            DATE_FORMAT(em.fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha,
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
                        AND p.subproyectoId = ? AND pozoId IN (?)
    
                        UNION ALL
    
                        -- FLNA como "compuesto virtual"
                        SELECT
                            p.subproyectoId,
                            p.id AS pozoId,
                            p.nombre AS pozoNombre,
                            DATE_FORMAT(em.fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha,
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
                        AND p.subproyectoId = ? AND pozoId IN (?)
                    )
                    SELECT 
                        dr.*,
                        CASE
                            WHEN dr.valor IN (-4, -3, -2) THEN NULL      -- NA o ND → null en chart
                            WHEN dr.valor <= 0 THEN 0.00001          -- NC       → valor muy pequeño / podria ser 1/2*LQ
                            ELSE dr.valor                            -- resto    → valor real
                        END AS valorChart
                        FROM DatosRaw dr
                        WHERE dr.compuestoId IN (?)
                        ORDER BY dr.fecha, dr.pozoId, dr.compuestoId;
                    `;

    try {
        // Obtener todas las cadenas del subproyecto y matriz
        const [valores] = await pool.query(sql, [subproyectoId, uniquePozos, uniqueCompuestos, subproyectoId, uniquePozos, subproyectoId, uniquePozos, uniqueCompuestos]);
        return valores;
    } catch (error) {
        throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
}
