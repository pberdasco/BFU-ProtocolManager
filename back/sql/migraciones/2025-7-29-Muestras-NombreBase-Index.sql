use `bfu-project-db`;
ALTER TABLE `Muestras` 
  ADD COLUMN `NombreBase` VARCHAR(16) NULL COMMENT 'Nombre de la muestra hasta la base (ej MA PM1)',
  ADD COLUMN `NombreIndex` INT NULL COMMENT 'Indice de la mustra (despues de la barra)';