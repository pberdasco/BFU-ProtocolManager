use `bfu-project-db`;
ALTER TABLE `Pozos`
  ADD COLUMN `UltMuestraAguaIdx` INT NULL COMMENT 'Indice de la última muestra de agua asociada al pozo',
  ADD COLUMN `UltMuestraFLNAIdx` INT NULL COMMENT 'Indice de la última muestra FLNA asociada al pozo',
  ADD COLUMN `UltMuestraGasIdx` INT NULL COMMENT 'Indice de la última muestra de gas asociada al pozo';