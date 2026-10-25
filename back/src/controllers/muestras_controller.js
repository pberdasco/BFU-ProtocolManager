import MuestrasService from '../services/muestras_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { muestrasCreateSchema, muestrasUpdateSchema } from '../models/muestras_schema.js';
import { bodyValidations as validateBody } from './validations.js';

export default class MuestrasController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = MuestrasService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const muestras = await MuestrasService.getAll(devExtremeQuery);
            res.status(200).json(muestras);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const muestras = await MuestrasService.getById(id);
            res.status(200).json(muestras.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoMuestras] = MuestrasController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await MuestrasService.create(nuevoMuestras);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, muestras] = MuestrasController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const muestrasActualizado = await MuestrasService.update(id, muestras);
            res.status(200).json(muestrasActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await MuestrasService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        if (method === 'update') return validateBody(record, muestrasUpdateSchema);
        if (method === 'create') return validateBody(record, muestrasCreateSchema);
        return [[], null];
    }
}
