USE `bfu-project-db`;

-- primero ajusta los LQs de metodos 999 ya cargados al menor valor de sus hermanos
UPDATE LQs l999
JOIN (
    SELECT 
        compuestoId, 
        laboratorioId, 
        MIN(valorLQ) AS min_valorLQ
    FROM LQs
    WHERE metodoId != 999
    GROUP BY compuestoId, laboratorioId
) base 
    ON l999.compuestoId = base.compuestoId
    AND l999.laboratorioId = base.laboratorioId
SET l999.valorLQ = base.min_valorLQ
WHERE l999.metodoId = 999
  AND l999.valorLQ != base.min_valorLQ;

-- luego crea los metodo 999 para los compuesto-laboratorio que no los tienen definidos
INSERT INTO LQs (compuestoId, laboratorioId, metodoId, UMId, valorLQ, matrizId)
SELECT 
    l.compuestoId,
    l.laboratorioId,
    999 AS metodoId,
    l.UMId,
    base.min_valorLQ,
    l.matrizId
FROM LQs l
JOIN (
    SELECT 
        compuestoId, 
        laboratorioId, 
        MIN(valorLQ) AS min_valorLQ
    FROM LQs
    WHERE metodoId != 999
    GROUP BY compuestoId, laboratorioId
) base
  ON l.compuestoId = base.compuestoId
 AND l.laboratorioId = base.laboratorioId
 AND l.metodoId = (
     SELECT metodoId
     FROM LQs l2
     WHERE l2.compuestoId = base.compuestoId
       AND l2.laboratorioId = base.laboratorioId
       AND l2.valorLQ = base.min_valorLQ
     ORDER BY metodoId ASC
     LIMIT 1
 )
WHERE NOT EXISTS (
    SELECT 1
    FROM LQs l2
    WHERE l2.compuestoId = l.compuestoId
      AND l2.laboratorioId = l.laboratorioId
      AND l2.metodoId = 999
);
-- nota este script (corrido junto el update y el insert) no modifica los 999 genuinos que fueron
-- cargados manualmente porque no tienen "hermanos" con metodo conocido.




-- -- ✅ Insertar nuevos registros en la tabla de LQs para metodo 999
-- USE `bfu-project-db`;

-- INSERT INTO LQs (compuestoId, laboratorioId, metodoId, UMId, valorLQ, matrizId)
-- SELECT
--     l.compuestoId,
--     l.laboratorioId,
--     999 AS metodoId,
--     l.UMId,
--     l.valorLQ,
--     l.matrizId
-- FROM LQs l
-- INNER JOIN (
--     SELECT compuestoId, laboratorioId, MIN(metodoId) AS metodoId
--     FROM LQs
--     WHERE metodoId != 999
--     GROUP BY compuestoId, laboratorioId
-- ) base
--     ON l.compuestoId = base.compuestoId
--    AND l.laboratorioId = base.laboratorioId
--    AND l.metodoId = base.metodoId
-- WHERE NOT EXISTS (
--     SELECT 1
--     FROM LQs l2
--     WHERE l2.compuestoId = l.compuestoId
--       AND l2.laboratorioId = l.laboratorioId
--       AND l2.metodoId = 999
-- );


-- sin validacion de existencia (viejo)
-- DELETE FROM LQs
-- WHERE metodoId = 999;

-- INSERT INTO LQs (compuestoId, laboratorioId, metodoId, UMId, valorLQ)
--SELECT
--    l.compuestoId,
--    l.laboratorioId,
--    999 AS metodoId,
--    l.UMId,
--    l.valorLQ
--FROM LQs l
--INNER JOIN (
--    SELECT compuestoId, laboratorioId, MIN(metodoId) AS metodoId
--    FROM LQs
--    WHERE metodoId != 999
--    GROUP BY compuestoId, laboratorioId
--) base
--ON l.compuestoId = base.compuestoId
--   AND l.laboratorioId = base.laboratorioId
--   AND l.metodoId = base.metodoId;