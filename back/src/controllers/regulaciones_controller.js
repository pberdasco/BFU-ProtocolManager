import RegulacionesService from '../services/regulaciones_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { regulacionCreateSchema, regulacionUpdateSchema } from '../models/regulaciones_schema.js';
import { z } from 'zod';

export default class RegulacionesController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = RegulacionesService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const regulaciones = await RegulacionesService.getAll(devExtremeQuery);
            res.status(200).json(regulaciones);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const regulacion = await RegulacionesService.getById(id);
            res.status(200).json(regulacion.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoRegulacion] = RegulacionesController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await RegulacionesService.create(nuevoRegulacion);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, regulacion] = RegulacionesController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const regulacionActualizado = await RegulacionesService.update(id, regulacion);
            res.status(200).json(regulacionActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await RegulacionesService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let regulacion = null;
        try {
            if (method === 'update') {
                regulacion = regulacionUpdateSchema.parse(record);
            } else if (method === 'create') {
                regulacion = regulacionCreateSchema.parse(record);
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
        return [errores, regulacion];
    }
}
