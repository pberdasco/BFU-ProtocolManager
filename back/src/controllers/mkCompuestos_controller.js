import MkCompuestosService from '../services/mkCompuestos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { mkCompuestosCreateSchema, mkCompuestosUpdateSchema, mkCompuestosReplaceSchema } from '../models/mkCompuestos_schema.js';
import { z } from 'zod';

export default class MkCompuestosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = MkCompuestosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const mkCompuestos = await MkCompuestosService.getAll(devExtremeQuery);
            res.status(200).json(mkCompuestos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const mkCompuesto = await MkCompuestosService.getById(id);
            res.status(200).json(mkCompuesto.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoMkCompuesto] = MkCompuestosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await MkCompuestosService.create(nuevoMkCompuesto);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, mkCompuesto] = MkCompuestosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const mkCompuestoActualizado = await MkCompuestosService.update(id, mkCompuesto);
            res.status(200).json(mkCompuestoActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await MkCompuestosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async replace (req, res, next) {
        try {
            const [errores, compuestos] = MkCompuestosController.bodyValidations(req.body, 'replace');
            if (errores.length !== 0) {
                throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });
            }

            await MkCompuestosService.replaceForSubproyecto(compuestos);
            res.status(204).send(); // ver si conviene 200 con compuestos
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let resultado = null;
        try {
            if (method === 'update') {
                resultado = mkCompuestosUpdateSchema.parse(record);
            } else if (method === 'create') {
                resultado = mkCompuestosCreateSchema.parse(record);
            } else if (method === 'replace') {
                resultado = mkCompuestosReplaceSchema.parse(record);
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
        return [errores, resultado];
    }
}
