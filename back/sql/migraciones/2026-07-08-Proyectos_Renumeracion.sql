ALTER TABLE `Proyectos`
ADD COLUMN `CodigoAnterior` varchar(10) DEFAULT NULL COMMENT 'Ultimo codigo anterior del proyecto' AFTER `ClienteId`,
ADD COLUMN `FechaExpiracionCodigoAnterior` date DEFAULT NULL COMMENT 'Fecha desde la cual expiro el codigo anterior del proyecto' AFTER `CodigoAnterior`;
