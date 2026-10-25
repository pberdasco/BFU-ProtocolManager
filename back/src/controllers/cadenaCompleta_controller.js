// cadenaCompleta_controller.js
import CadenaCompletaService from '../services/cadenaCompleta_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { bodyCadenaCompletaSchema } from '../models/cadenaCompleta_schema.js';
import { bodyValidations as validateBody } from './validations.js';

export default class CadenaCompletaController {
    static async create (req, res, next) {
        try {
            const [errores, validData] = CadenaCompletaController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) {
                throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });
            }

            const { cadenaId, cadenaCompleta } = validData;

            const insertado = await CadenaCompletaService.create(cadenaId, cadenaCompleta);
            res.status(200).json(insertado);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const entity = await CadenaCompletaService.getById(id);
            res.status(200).json(entity);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getByEventoMuestreoId (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const matrizId = req.query.matrizId;
            const entity = await CadenaCompletaService.getByEventoMuestreoId(id, matrizId);
            res.status(200).json(entity);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            await CadenaCompletaService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        if (method === 'create') return validateBody(record, bodyCadenaCompletaSchema);
        return [[], null];
    }
}
