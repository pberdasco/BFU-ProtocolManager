-- Nueva tabla de registro de migraciones aplicadas
use `bfu-project-db`;
CREATE TABLE IF NOT EXISTS MigracionesAplicadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombreArchivo VARCHAR(255) NOT NULL UNIQUE,
    fechaAplicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aplicadoPor VARCHAR(255) NULL,
    comentario TEXT NULL
);
INSERT INTO MigracionesAplicadas (nombreArchivo, fechaAplicacion, aplicadoPor, comentario) VALUES
('2025-7-28-InitialStructure-V1.sql', '2025-07-28 00:00:00', 'inicial', 'inicializacion v1'),
('2025-7-28-InitialData-V1.sql',      '2025-07-28 00:00:00', 'inicial', 'inicializacion v1'),
('2025-7-28-MigracionesAplicadas.sql','2025-07-28 00:00:00', 'inicial', 'inicializacion v1');
