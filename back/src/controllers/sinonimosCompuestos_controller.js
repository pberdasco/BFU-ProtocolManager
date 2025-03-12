import SinonimosCompuestosService from '../services/sinonimosCompuestos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { sinonimoCompuestoCreateSchema, sinonimoCompuestoUpdateSchema, compuestosOriginalesSchema } from '../models/sinonimosCompuesto_schema.js';
import { z } from 'zod';

export default class SinonimosCompuestosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = SinonimosCompuestosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const entities = await SinonimosCompuestosService.getAll(devExtremeQuery);
            res.status(200).json(entities);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const entity = await SinonimosCompuestosService.getById(id);
            res.status(200).json(entity.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getListaSinonimos (req, res, next) {
        try {
            const [errores, validdBody] = SinonimosCompuestosController.bodyValidations(req.body, 'getLista');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const convertedList = await SinonimosCompuestosService.convertList(validdBody);
            res.status(200).json(convertedList);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, newEntity] = SinonimosCompuestosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await SinonimosCompuestosService.create(newEntity);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, entity] = SinonimosCompuestosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const updatedEntity = await SinonimosCompuestosService.update(id, entity);
            res.status(200).json(updatedEntity.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await SinonimosCompuestosService.delete(id);
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
                validBody = sinonimoCompuestoUpdateSchema.parse(record);
            } else if (method === 'create') {
                validBody = sinonimoCompuestoCreateSchema.parse(record);
            } else if (method === 'getLista') {
                validBody = compuestosOriginalesSchema.parse(record);
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
