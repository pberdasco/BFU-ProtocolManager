import EvolucionCDIService from '../services/reportes/evolucionCDI/evolucionCDI_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { configSchema } from '../models/evolucionCDI_schema.js';
import { z } from 'zod';

export default class EvolucionCDIController {
    static async create (req, res, next) {
        try {
            const [errores, config] = EvolucionCDIController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const result = await EvolucionCDIService.createExcel(config);
            res.status(200).json(result);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async download (req, res, next) {
        try {
            const { nombreArchivo } = req.params;
            const filePath = await EvolucionCDIService.getFilePath(nombreArchivo);

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

    /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"create"} method - para que metodo tiene que validar
     * @returns [Array, Object] - [errores, autaplicacion] el array de errores de validacion y el objeto filtrado
     */
    static bodyValidations (record, method) {
        let errores = [];
        let config = null;
        try {
            if (method === 'create') {
                config = configSchema.parse(record);
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
        // console.log('validation: ', config);

        return [errores, config];
    }
}
