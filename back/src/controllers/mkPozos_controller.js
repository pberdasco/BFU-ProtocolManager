import MkPozosService from '../services/mkPozos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { mkPozosCreateSchema, mkPozosUpdateSchema } from '../models/mkPozos_schema.js';
import { z } from 'zod';

export default class MkPozosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = MkPozosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const mkPozos = await MkPozosService.getAll(devExtremeQuery);
            res.status(200).json(mkPozos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            const mkPozos = await MkPozosService.getById(id);
            res.status(200).json(mkPozos.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoMkPozo] = MkPozosController.bodyValidations(req.body, 'create');
            console.log(' en create controller,', errores, 'nuevomkPozo', nuevoMkPozo);
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await MkPozosService.create(nuevoMkPozo);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, mkPozo] = MkPozosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const mkPozoActualizado = await MkPozosService.update(id, mkPozo);
            res.status(200).json(mkPozoActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

            await MkPozosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errores = [];
        let mkPozo = null;
        try {
            if (method === 'update') {
                mkPozo = mkPozosUpdateSchema.parse(record);
            } else if (method === 'create') {
                mkPozo = mkPozosCreateSchema.parse(record);
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
        return [errores, mkPozo];
    }
}
