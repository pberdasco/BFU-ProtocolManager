import SinonimosMetodosService from '../services/sinonimosMetodos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { sinonimoMetodoCreateSchema, sinonimoMetodoUpdateSchema, metodosOriginalesSchema } from '../models/sinonimosMetodo_schema.js';
import { z } from 'zod';

export default class SinonimosMetodosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = SinonimosMetodosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const entities = await SinonimosMetodosService.getAll(devExtremeQuery);
            res.status(200).json(entities);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });
            const entity = await SinonimosMetodosService.getById(id);
            res.status(200).json(entity.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getListaSinonimos (req, res, next) {
        try {
            const [errores, validBody] = SinonimosMetodosController.bodyValidations(req.body, 'getLista');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const convertedList = await SinonimosMetodosService.convertList(validBody);
            res.status(200).json(convertedList);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, newEntity] = SinonimosMetodosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await SinonimosMetodosService.create(newEntity);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, entity] = SinonimosMetodosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const updatedEntity = await SinonimosMetodosService.update(id, entity);
            res.status(200).json(updatedEntity.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await SinonimosMetodosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let validBody = null;
        try {
            if (method === 'update') {
                validBody = sinonimoMetodoUpdateSchema.parse(record);
            } else if (method === 'create') {
                validBody = sinonimoMetodoCreateSchema.parse(record);
            } else if (method === 'getLista') {
                validBody = metodosOriginalesSchema.parse(record);
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
        return [errores, validBody];
    }
}
