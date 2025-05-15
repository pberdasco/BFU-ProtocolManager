import fs from 'node:fs/promises';
import path from 'node:path';
import { Packer } from 'docx';
import { generarNombreArchivoConFecha } from '../utils/filenameGenerator.js';
import { generateReport } from './cadenaToDOCTabla_genRep.js';

export default class CadenaToDocTablaService {
    /**
     * Genera el archivo DOCX y lo graba en el disco.
     * @param {string} proyectoNombre
     * @param {string} fechaMuestreo
     * @param {object} data - Contiene muestras, filas, nivelesGuia, compuestos, laboratorios
     * @param {string} basePath - Ruta donde guardar el archivo
     * @param {string} fileName - Nombre del archivo, ej: 'Reporte.docx'
     * @returns {Promise<{ id: number, path: string, file: string }>}
     */
    static async createDocx (proyectoNombre, fechaMuestreo, data) {
        try {
            const basePath = process.env.CADENA_DOCX_PATH;
            const fileName = generarNombreArchivoConFecha('AT', proyectoNombre, 'docx');
            const doc = await generateReport(proyectoNombre, fechaMuestreo, data);
            const fullPath = path.join(basePath, fileName);

            const buffer = await Packer.toBuffer(doc);
            await fs.writeFile(fullPath, buffer);
            return { id: 0, path: basePath, file: fileName };
        } catch (err) {
            let message = err.message;
            let status = err.status;

            if (err.code === 'EBUSY') {
                status = 423;
                message = `El archivo ${err.path || 'desconocido'} está abierto. No se pudo grabar.`;
            }

            const error = new Error(message || 'Error al generar el documento DOCX');
            error.status = status || 503;
            throw error;
        }
    }

    /**
     * Servicio minimo para obtener el path completo, se separo del controller por si en el futuro la logica de busqueda
     * se realiza sobre las tablas del sistema y para seguir la estructura r/c/s
     * @param {string} nombreArchivo (sin path) - En el futuro podria venir un Id de cadena o evento para buscar en la cadena o en el evento el nombre
     * @returns nombre completo (path+nombre) o error si el archivo no existe
     */
    static async getFilePath (nombreArchivo) {
        const basePath = process.env.CADENA_DOCX_PATH;
        const filePath = path.join(basePath, nombreArchivo);

        try {
            await fs.access(filePath);
            return filePath;
        } catch {
            const error = new Error(`No se encuentra el archivo ${nombreArchivo} en el directorio correspondiente`);
            error.status = 404;
            throw error;
        }
    }
}
