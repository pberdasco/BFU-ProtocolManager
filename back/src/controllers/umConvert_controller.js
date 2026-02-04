import UMConvertService from '../services/umConvert_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { umConvertCreateSchema, umConvertUpdateSchema } from '../models/umconvert_schema.js';
import { z } from 'zod';

export default class UMConvertController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = UMConvertService.getAllowedFields();
        next();
    }

    static async getAll (req, res) {
        try {
            const entities = await UMConvertService.getAll();
            res.status(200).json(entities);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getAllDx (req, res) {
        try {
            const result = await UMConvertService.getAllDx(req.devExtremeQuery);
            res.status(200).json(result);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getFactor (req, res, next) {
        try {
            const desde = req.params.desde;
            const hasta = req.params.hasta;
            const factor = await UMConvertService.getFactor(desde, hasta);
            res.status(200).json(factor);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const umconvert = await UMConvertService.getById(id);
            res.status(200).json(umconvert.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevo] = UMConvertController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await UMConvertService.create(nuevo);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, umconvert] = UMConvertController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const umconvertActualizado = await UMConvertService.update(id, umconvert);
            res.status(200).json(umconvertActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await UMConvertService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let umconvert = null;
        try {
            if (method === 'update') {
                umconvert = umConvertUpdateSchema.parse(record);
            } else if (method === 'create') {
                umconvert = umConvertCreateSchema.parse(record);
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
        return [errores, umconvert];
    }
}
