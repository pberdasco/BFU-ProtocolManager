-- Nuevos campos en pozos para indicar el ultimo indice de muestra utilizado en cada tipo de matriz
ALTER TABLE `Pozos`
  ADD COLUMN `UltMuestraAguaIdx` INT NULL COMMENT 'Indice de la última muestra de agua asociada al pozo',
  ADD COLUMN `UltMuestraFLNAIdx` INT NULL COMMENT 'Indice de la última muestra FLNA asociada al pozo',
  ADD COLUMN `UltMuestraGasIdx` INT NULL COMMENT 'Indice de la última muestra de gas asociada al pozo';