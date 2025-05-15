// utils/filenameGenerator.js

/**
 * Genera un nombre de archivo con un prefijo, nombre de proyecto y una marca de tiempo legible.
 * La marca de tiempo usa el formato YYYYMMDDTHHMMSS.
 *
 * @param {string} prefijo - El prefijo para el nombre del archivo (ej: 'AT', 'EV').
 * @param {string} proyectoNombre - El nombre del proyecto.
 * @param {string} ext - extension del archivo (ej: 'dotx').
 * @returns {string} El nombre base del archivo (sin extensión).
 */
export function generarNombreArchivoConFecha (prefijo, proyectoNombre, ext) {
    const now = new Date();

    // Genera la marca de tiempo en formato YYYYMMDDTHHMMSS
    // toISOString() da YYYY-MM-DDTHH:mm:ss.sssZ
    // replace elimina guiones, dos puntos y el punto
    // slice(0, 15) toma los primeros 15 caracteres (YYYYMMDDTHHMMSS)
    const fechaHora = now.toISOString().replace(/[-:.]/g, '').slice(0, 15);

    // Construye el nombre base del archivo (sin extensión)
    const fileNameBase = `${prefijo}_${proyectoNombre}_${fechaHora}.${ext}`;

    return fileNameBase;
}
