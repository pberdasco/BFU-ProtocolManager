-- Nuevo campo en cadena de Custodia para indicar si una cadena es de solo Mediciones 

ALTER TABLE `cadenacustodia` 
ADD COLUMN `SoloMedidas` TINYINT(1) NOT NULL DEFAULT 0
AFTER `MatrizCodigo`;
