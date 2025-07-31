-- Nuevos campos en pozos para indicar el ultimo indice de muestra utilizado en cada tipo de matriz
ALTER TABLE `Pozos`
  ADD COLUMN `UltMuestraAguaIdx` INT NULL COMMENT 'Indice de la última muestra de agua asociada al pozo',
  ADD COLUMN `UltMuestraFLNAIdx` INT NULL COMMENT 'Indice de la última muestra FLNA asociada al pozo',
  ADD COLUMN `UltMuestraGasIdx` INT NULL COMMENT 'Indice de la última muestra de gas asociada al pozo';

-- Popular campos ultMuestra*Idx de Pozos a partir de muestras tipo 1 con index válido
-- Agua
UPDATE Pozos p
LEFT JOIN (
    SELECT m.pozoId, MAX(m.nombreIndex) as maxIdx
    FROM Muestras m
    JOIN CadenaCustodia c ON m.cadenaCustodiaId = c.id
    WHERE m.tipo = 1 AND m.nombreIndex > 0 AND c.matrizCodigo = 1
    GROUP BY m.pozoId
) t ON t.pozoId = p.id
SET p.ultMuestraAguaIdx = t.maxIdx;

-- FLNA
UPDATE Pozos p
LEFT JOIN (
    SELECT m.pozoId, MAX(m.nombreIndex) as maxIdx
    FROM Muestras m
    JOIN CadenaCustodia c ON m.cadenaCustodiaId = c.id
    WHERE m.tipo = 1 AND m.nombreIndex > 0 AND c.matrizCodigo = 2
    GROUP BY m.pozoId
) t ON t.pozoId = p.id
SET p.ultMuestraFLNAIdx = t.maxIdx;

-- Gases
UPDATE Pozos p
LEFT JOIN (
    SELECT m.pozoId, MAX(m.nombreIndex) as maxIdx
    FROM Muestras m
    JOIN CadenaCustodia c ON m.cadenaCustodiaId = c.id
    WHERE m.tipo = 1 AND m.nombreIndex > 0 AND c.matrizCodigo = 4
    GROUP BY m.pozoId
) t ON t.pozoId = p.id
SET p.ultMuestraGASIdx = t.maxIdx;