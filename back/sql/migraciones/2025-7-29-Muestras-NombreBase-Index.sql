-- Nuevos campos en muestra para componer el nombre de la muestra NombreBase + "/" + NombreIndex = Nombre
ALTER TABLE `Muestras` 
  ADD COLUMN `NombreBase` VARCHAR(16) NULL COMMENT 'Nombre de la muestra hasta la base (ej MA PM1)',
  ADD COLUMN `NombreIndex` INT NULL COMMENT 'Indice de la mustra (despues de la barra)';

-- Popular los nuevos campos nombreBase y nombreIndex desde el campo nombre existente
UPDATE Muestras
SET 
  nombreBase = IF(LOCATE('/', nombre) > 0, LEFT(nombre, LOCATE('/', nombre) - 1), nombre),
  nombreIndex = IF(LOCATE('/', nombre) > 0, CAST(SUBSTRING_INDEX(nombre, '/', -1) AS UNSIGNED), 0)
WHERE nombreBase IS NULL OR nombreIndex IS NULL;