import ReguladosService from '../services/regulados_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { reguladoCreateSchema, reguladoUpdateSchema } from '../models/regulado_schema.js';
import { bodyValidations as validateBody } from './validations.js';

export default class ReguladosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = ReguladosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const regulados = await ReguladosService.getAll(devExtremeQuery);
            res.status(200).json(regulados);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const regulacion = await ReguladosService.getById(id);
            res.status(200).json(regulacion.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoRegulacion] = ReguladosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await ReguladosService.create(nuevoRegulacion);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, regulacion] = ReguladosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const regulacionActualizado = await ReguladosService.update(id, regulacion);
            res.status(200).json(regulacionActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await ReguladosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        if (method === 'update') return validateBody(record, reguladoUpdateSchema);
        if (method === 'create') return validateBody(record, reguladoCreateSchema);
        return [[], null];
    }
}
