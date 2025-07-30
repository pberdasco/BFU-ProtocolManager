import EventomuestreoService from '../services/eventomuestreo_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { eventomuestreoCreateSchema, eventomuestreoUpdateSchema, eventomuestreoDuplicateSchema } from '../models/eventomuestreo_schema.js';
import { z } from 'zod';

export default class EventomuestreoController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = EventomuestreoService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const eventomuestreo = await EventomuestreoService.getAll(devExtremeQuery);
            res.status(200).json(eventomuestreo);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const eventomuestreo = await EventomuestreoService.getById(id);
            res.status(200).json(eventomuestreo.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getFullDataById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const eventomuestreo = await EventomuestreoService.getFullDataById(id);
            res.status(200).json(eventomuestreo);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            console.log('Create: ', JSON.stringify(req.body));

            const [errores, nuevoEventomuestreo] = EventomuestreoController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await EventomuestreoService.create(nuevoEventomuestreo);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, eventomuestreo] = EventomuestreoController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const eventomuestreoActualizado = await EventomuestreoService.update(id, eventomuestreo);
            res.status(200).json(eventomuestreoActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await EventomuestreoService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async duplicar (req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            // Validar body
            const result = eventomuestreoDuplicateSchema.safeParse(req.body);
            if (!result.success) {
                const errores = result.error.errors.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));
                throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });
            }

            const nuevoId = await EventomuestreoService.duplicarEvento({
                eventoId: id,
                nuevaFecha: result.data.fecha,
                nuevoNombre: result.data.nombre
            });

            const eventoDuplicado = await EventomuestreoService.getById(nuevoId);
            res.status(200).json(eventoDuplicado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let eventomuestreo = null;
        try {
            if (method === 'update') {
                eventomuestreo = eventomuestreoUpdateSchema.parse(record);
            } else if (method === 'create') {
                eventomuestreo = eventomuestreoCreateSchema.parse(record);
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
        return [errores, eventomuestreo];
    }
}
