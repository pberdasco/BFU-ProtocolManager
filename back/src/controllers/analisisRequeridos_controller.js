import AnalisisRequeridosService from '../services/analisisRequeridos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { analisisRequeridoCreateSchema, analisisRequeridoUpdateSchema } from '../models/analisisrequeridos_schema.js';
import { z } from 'zod';

export default class AnalisisRequeridosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = AnalisisRequeridosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const entityList = await AnalisisRequeridosService.getAll(devExtremeQuery);
            res.status(200).json(entityList);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const entity = await AnalisisRequeridosService.getById(id);
            res.status(200).json(entity.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, newEntity] = AnalisisRequeridosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await AnalisisRequeridosService.create(newEntity);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            await AnalisisRequeridosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, entity] = AnalisisRequeridosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const updatedEntity = await AnalisisRequeridosService.update(id, entity);
            res.status(200).json(updatedEntity.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"update" || "create"} method - para que metodo tiene que validar
     * @returns [Array, Object] - [errores, compuesto] el array de errores de validacion y el objeto filtrado
     */
    static bodyValidations (record, method) {
        let errores = [];
        let entity = null;
        try {
            if (method === 'update') {
                entity = analisisRequeridoUpdateSchema.parse(record);
            } else if (method === 'create') {
                entity = analisisRequeridoCreateSchema.parse(record);
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
        return [errores, entity];
    }
}
