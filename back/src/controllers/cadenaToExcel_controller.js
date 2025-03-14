import CadenaToExcelService from '../services/cadenaToExcel_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { bodyCadenaSchema } from '../models/cadenaToExcel_schema.js';
import { z } from 'zod';

export default class CadenaToExcelController {
    /**
     * Recibe datos de la cadena y graba un excel de formulario completado
     * Devuelve { id: en el futuro id grabado en la base, path: nombre completo del archivo grabado}
     */
    static async create (req, res, next) {
        try {
            const { cadena, muestras, analisis } = req.body;
            const excelGrabado = await CadenaToExcelService.create(cadena, muestras, analisis);
            // todo: podria llamar a otro servicio que grabe en la base de datos ese id (por ejemplo en un campo de cadena)
            res.status(200).json(excelGrabado);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async createMultiple (req, res, next) {
        try {
            const [errores, validData] = CadenaToExcelController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) {
                throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });
            }
            const { cadenas } = validData;

            const excelGrabado = await CadenaToExcelService.createMultiple(cadenas);
            res.status(200).json(excelGrabado);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async download (req, res, next) {
        try {
            const { nombreArchivo } = req.params;
            const filePath = CadenaToExcelService.getFilePath(nombreArchivo);

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
                validData = bodyCadenaSchema.parse(record);
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
