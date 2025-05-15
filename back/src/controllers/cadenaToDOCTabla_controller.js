import CadenaToDocTablaService from '../services/reportes/tablasAnaliticas/cadenaToDOCTabla_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { cadenaToDOCTablaSchema } from '../models/cadenaToDOCTabla_schema.js';
import { z } from 'zod';

export default class CadenaToDOCTablaController {
    /**
     * Recibe datos de la cadena y crea el anexo en word
     * Devuelve { id: en el futuro id grabado en la base, path: nombre completo del archivo grabado}
     */

    static async createDocx (req, res, next) {
        try {
            const [errores, validData] = CadenaToDOCTablaController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) {
                throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });
            }
            const { proyecto, fecha, data } = validData;

            const DOCGrabado = await CadenaToDocTablaService.createDocx(proyecto, fecha, data);
            res.status(200).json(DOCGrabado);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async download (req, res, next) {
        try {
            const { nombreArchivo } = req.params;
            const filePath = await CadenaToDocTablaService.getFilePath(nombreArchivo);

            res.download(filePath, nombreArchivo, (err) => {
                if (err) {
                    const error = new Error('Error al descargar el archivo');
                    error.status = 500;
                    error.stack = err.stack;
                    showError(req, res, error);
                }
            });
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let validData = null;
        try {
            if (method === 'create') {
                validData = cadenaToDOCTablaSchema.parse(record);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                errores = error.errors.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));
            } else {
                throw error;
            }
        }
        return [errores, validData];
    }
}
