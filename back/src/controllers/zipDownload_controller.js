import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

import { showError } from '../middleware/controllerErrors.js';

export default class ZipDownloadController {
    /**
     * Genera un archivo ZIP con múltiples archivos especificados en el body de la petición
     * y lo envía como descarga al cliente. El archivo ZIP se elimina del disco después de la descarga.
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} req.body - Cuerpo de la solicitud HTTP.
     * @param {Array} req.body.archivos - Lista de archivos a comprimir.
     * @param {string} req.body.archivos[].path - Ruta absoluta donde se encuentra el archivo.
     * @param {string} req.body.archivos[].file - Nombre del archivo con su extensión.
     * @param {string} req.body.archivos[].zipName - Nombre base del archivo ZIP a generar (sin extensión).
     * @param {Object} res - Objeto de respuesta de Express.
     * @param {Function} next - Función `next` de Express para manejo de errores.
     *
     * @returns {void}
     *
     * @throws {Error} Si no se reciben archivos o si ocurre un error durante la compresión o descarga.
     */
    static async downloadZip (req, res, next) {
        try {
            const archivos = req.body.archivos;
            console.log('archivos: ', archivos);

            if (!archivos || archivos.length === 0) {
                const err = new Error('No se recibieron archivos para comprimir');
                err.status = 400;
                throw err;
            }

            const zipName = archivos[0].zipName + '.zip'; // e.g., MK_201398-201_2025-04-20.zip
            const destinationDir = archivos[0].path;
            const zipPath = path.join(destinationDir, zipName);

            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                res.download(zipPath, zipName, err => {
                    if (err) return next(err);
                    fs.unlink(zipPath, () => {}); // eliminar el zip luego de la descarga
                });
            });

            archive.on('error', err => {
                throw err;
            });

            archive.pipe(output);

            archivos.forEach(({ path: p, file }) => {
                archive.file(path.join(p, file), { name: file });
            });

            await archive.finalize();
        } catch (error) {
            showError(req, res, error);
        }
    }
}

// TODO: agregar zod para validar el body
