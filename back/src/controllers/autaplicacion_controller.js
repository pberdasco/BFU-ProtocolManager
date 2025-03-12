import AutaplicacionService from '../services/autaplicacion_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { autaplicacionCreateSchema, autaplicacionUpdateSchema } from '../models/autaplicacion_schema.js';
import { z } from 'zod';

export default class AutaplicacionController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = AutaplicacionService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const autaplicacion = await AutaplicacionService.getAll(devExtremeQuery);
            res.status(200).json(autaplicacion);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const autaplicacion = await AutaplicacionService.getById(id);
            res.status(200).json(autaplicacion.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoAutaplicacion] = AutaplicacionController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await AutaplicacionService.create(nuevoAutaplicacion);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            await AutaplicacionService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, autaplicacion] = AutaplicacionController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const autaplicacionActualizado = await AutaplicacionService.update(id, autaplicacion);
            res.status(200).json(autaplicacionActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"update" || "create"} method - para que metodo tiene que validar
     * @returns [Array, Object] - [errores, autaplicacion] el array de errores de validacion y el objeto filtrado
     */
    static bodyValidations (record, method) {
        let errores = [];
        let autaplicacion = null;
        try {
            if (method === 'update') {
                autaplicacion = autaplicacionUpdateSchema.parse(record);
            } else if (method === 'create') {
                autaplicacion = autaplicacionCreateSchema.parse(record);
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
        return [errores, autaplicacion];
    }
}
