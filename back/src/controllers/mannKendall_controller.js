import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

import MannKendallService from '../services/mannKendall_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class MannKendallController {
    static async getData (req, res, next) {
        try {
            const { subproyectoId } = req.params;
            let { fecha } = req.query; // fechaEvaluacion
            if (!fecha) {
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0]; // → '2025-04-16'
            }
            const data = await MannKendallService.getDataForSubproyecto(Number(subproyectoId), fecha);
            res.json(data);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async generate (req, res, next) {
        try {
            const { subproyectoId } = req.params;
            let { fecha } = req.query; // fechaEvaluacion
            if (!fecha) {
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0]; // → '2025-04-16'
            }
            const data = await MannKendallService.fullProcess(Number(subproyectoId), fecha);
            res.json(data);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async downloadZip (req, res, next) {
        try {
            const archivos = req.body.archivos;

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
