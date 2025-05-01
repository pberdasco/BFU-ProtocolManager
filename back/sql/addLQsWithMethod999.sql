-- ✅ Insertar nuevos registros en la tabla de LQs para metodo 999
USE `bfu-project-db`;

DELETE FROM LQs
WHERE metodoId = 999;

INSERT INTO LQs (compuestoId, laboratorioId, metodoId, UMId, valorLQ)
SELECT
    l.compuestoId,
    l.laboratorioId,
    999 AS metodoId,
    l.UMId,
    l.valorLQ
FROM LQs l
INNER JOIN (
    SELECT compuestoId, laboratorioId, MIN(metodoId) AS metodoId
    FROM LQs
    WHERE metodoId != 999
    GROUP BY compuestoId, laboratorioId
) base
ON l.compuestoId = base.compuestoId
   AND l.laboratorioId = base.laboratorioId
   AND l.metodoId = base.metodoId;
