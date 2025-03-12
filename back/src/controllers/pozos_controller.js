import PozosService from '../services/pozos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { pozosCreateSchema, pozosUpdateSchema } from '../models/pozos_schema.js';
import { z } from 'zod';

export default class PozosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = PozosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const pozos = await PozosService.getAll(devExtremeQuery);
            res.status(200).json(pozos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const pozos = await PozosService.getById(id);
            res.status(200).json(pozos.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoPozos] = PozosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await PozosService.create(nuevoPozos);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, pozos] = PozosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const pozosActualizado = await PozosService.update(id, pozos);
            res.status(200).json(pozosActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await PozosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let pozos = null;
        try {
            if (method === 'update') {
                pozos = pozosUpdateSchema.parse(record);
            } else if (method === 'create') {
                pozos = pozosCreateSchema.parse(record);
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
        return [errores, pozos];
    }
}
