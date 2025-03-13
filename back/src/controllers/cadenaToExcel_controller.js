import CadenaToExcelService from '../services/cadenaToExcel_service.js';
import { showError } from '../middleware/controllerErrors.js';
// import { eventomuestreoCreateSchema, eventomuestreoUpdateSchema } from '../models/eventomuestreo_schema.js';
// import { z } from 'zod';
// todo: validar

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
}
