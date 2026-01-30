import { pool, dbErrorMsg } from '../../../database/db.js';
/**
 * Devuelve una tabla plana para todos los valores de un subproyecto.
 *
 * @param {number} subproyectoId - ID del subproyecto.
 * @param {number[]} uniquePozos - IDs de pozos a incluir.
 * @param {number[]} uniqueCompuestos - IDs de compuestos a incluir.
 * @returns {Promise<{
 *   rangoFechas: { desde: string, hasta: string },
 *   measurements: Array<{
 *     subproyectoId: number,
 *     pozoId: number,
 *     pozoNombre: string,
 *     fecha: string,
 *     soloMuestras: boolean,
 *     compuestoCodigo: string,
 *     compuestoId: number,
 *     compuestoNombre: string,
 *     unidad: string,
 *     valor: number,
 *     tipoDato: string,
 *     valorChart: number
 *   }>
 * }>>} Promise que resuelve en un objeto con `rangoFechas` y el array `measurements`.
 */
export async function getPlainData (subproyectoId, uniquePozos, uniqueCompuestos) {
    const sql = `-- Datos de compuestos desde CadenaCompletaValores
                    WITH DatosRaw AS (
                        SELECT
                            p.subproyectoId,
                            p.id AS pozoId,
                            p.nombre AS pozoNombre,
                            em.fecha AS fecha_dt,
                            DATE_FORMAT(em.fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha,
                            JSON_EXTRACT(JSON_OBJECT('v', em.soloMuestras = 1), '$.v') AS soloMuestras,
                            c.codigo AS compuestoCodigo,
                            c.id AS compuestoId,
                            c.nombre AS compuestoNombre,
                            um.id AS umId,
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
                        WHERE p.subproyectoId = ? AND p.id IN (?) AND c.id IN (?)

                        UNION ALL

                        -- Nivel freático (sin umId real)
                        SELECT
                            p.subproyectoId,
                            p.id AS pozoId,
                            p.nombre AS pozoNombre,
                            em.fecha AS fecha_dt,
                            DATE_FORMAT(em.fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha,
                            JSON_EXTRACT(JSON_OBJECT('v', em.soloMuestras = 1), '$.v') AS soloMuestras,
                            '00000001' AS compuestoCodigo,
                            -1 AS compuestoId,
                            'Nivel freático' AS compuestoNombre,
                            NULL AS umId,
                            'm.b.b.p.' AS unidad,
                            CAST(CASE WHEN m.nivelFreatico = 0 THEN -4 ELSE m.nivelFreatico END AS DECIMAL(10,4)) AS valor,
                            'nivel' AS tipoDato
                        FROM EventoMuestreo em
                        JOIN CadenaCustodia cc ON cc.eventoMuestreoId = em.id
                        JOIN Muestras m ON m.cadenaCustodiaId = cc.id
                        JOIN Pozos p ON p.id = m.pozoId
                        WHERE m.nivelFreatico IS NOT NULL
                        AND p.subproyectoId = ? AND p.id IN (?)

                        UNION ALL

                        -- FLNA (sin umId real)
                        SELECT
                            p.subproyectoId,
                            p.id AS pozoId,
                            p.nombre AS pozoNombre,
                            em.fecha AS fecha_dt,
                            DATE_FORMAT(em.fecha, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha,
                            JSON_EXTRACT(JSON_OBJECT('v', em.soloMuestras = 1), '$.v') AS soloMuestras,
                            '00000002' AS compuestoCodigo,
                            -2 AS compuestoId,
                            'FLNA' AS compuestoNombre,
                            NULL AS umId,
                            'm' AS unidad,
                            CAST(CASE WHEN m.flna = 0 THEN -4 ELSE m.flna END AS DECIMAL(10,4)) AS valor,
                            'fase' AS tipoDato
                        FROM EventoMuestreo em
                        JOIN CadenaCustodia cc ON cc.eventoMuestreoId = em.id
                        JOIN Muestras m ON m.cadenaCustodiaId = cc.id
                        JOIN Pozos p ON p.id = m.pozoId
                        WHERE m.flna IS NOT NULL
                        AND p.subproyectoId = ? AND p.id IN (?)
                    ),
                    ConDestino AS (
                        SELECT
                            dr.*,
                            -- unidad destino = unidad del registro más viejo (solo para compuestos reales)
                            CASE
                                WHEN dr.tipoDato = 'compuesto'
                                THEN FIRST_VALUE(dr.umId) OVER (
                                    PARTITION BY dr.subproyectoId, dr.pozoId, dr.compuestoId
                                    ORDER BY dr.fecha_dt
                                )
                                ELSE NULL
                            END AS umDestinoId
                        FROM DatosRaw dr
                    ),
                    Convertido AS (
                        SELECT
                            cd.*,
                            uDest.nombre AS unidadDestino,
                            uc.factor AS factorConversion,
                            -- valor convertido: solo convertir positivos (los -1/-2/-3/-4 se respetan)
                            CASE
                                WHEN cd.tipoDato <> 'compuesto' THEN cd.valor
                                WHEN cd.umDestinoId IS NULL OR cd.umId IS NULL OR cd.umId = cd.umDestinoId THEN cd.valor
                                WHEN cd.valor <= 0 THEN cd.valor
                                WHEN uc.factor IS NULL THEN cd.valor  -- si falta conversión, lo dejamos igual (o podés forzar NULL/error)
                                ELSE CAST(cd.valor * uc.factor AS DECIMAL(10,4))
                            END AS valorConv
                        FROM ConDestino cd
                        LEFT JOIN umconvert uc
                            ON uc.DesdeUmId = cd.umId
                        AND uc.HastaUmId = cd.umDestinoId
                        LEFT JOIN UM uDest
                            ON uDest.id = cd.umDestinoId
                    )
                    SELECT
                        subproyectoId,
                        pozoId,
                        pozoNombre,
                        fecha,
                        soloMuestras,
                        compuestoCodigo,
                        compuestoId,
                        compuestoNombre,
                        CASE
                            WHEN tipoDato = 'compuesto' AND umDestinoId IS NOT NULL THEN unidadDestino
                            ELSE unidad
                        END AS unidad,
                        valorConv AS valor,
                        tipoDato,
                        CASE
                            WHEN valorConv IN (-4, -3, -2) THEN NULL
                            WHEN valorConv <= 0 THEN 0.00001
                            ELSE valorConv
                        END AS valorChart
                    FROM Convertido
                    WHERE compuestoId IN (?)
                    ORDER BY fecha_dt, pozoId, compuestoId;
                    `;

    try {
        // Obtener todas las cadenas del subproyecto y matriz
        const [measurements] = await pool.query(sql, [subproyectoId, uniquePozos, uniqueCompuestos, subproyectoId, uniquePozos, subproyectoId, uniquePozos, uniqueCompuestos]);

        const rangoFechas = minAndMaxFecha(measurements);
        return { rangoFechas, measurements };
    } catch (error) {
        throw dbErrorMsg(error.status, error.sqlMessage || error.message);
    }
}

function minAndMaxFecha (valores) {
    if (!valores.length) return { desde: null, hasta: null };

    let minFecha = new Date(valores[0].fecha);
    let maxFecha = minFecha;

    for (const row of valores) {
        const fecha = new Date(row.fecha);
        if (fecha < minFecha) minFecha = fecha;
        if (fecha > maxFecha) maxFecha = fecha;
    }

    const formatter = new Intl.DateTimeFormat('es-AR', { year: 'numeric', month: 'long' });
    return {
        desde: formatter.format(minFecha),
        hasta: formatter.format(maxFecha)
    };
}
