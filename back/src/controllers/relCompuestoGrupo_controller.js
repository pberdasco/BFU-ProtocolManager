import RelCompuestoGrupoService from '../services/relCompuestoGrupo_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { relCompuestoGrupoCreateSchema, relCompuestoGrupoUpdateSchema } from '../models/relCompuestoGrupo_schema.js';
import { z } from 'zod';

export default class RelCompuestoGrupoController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = RelCompuestoGrupoService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const relCompuestoGrupo = await RelCompuestoGrupoService.getAll(devExtremeQuery);
            res.status(200).json(relCompuestoGrupo);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const relCompuestoGrupo = await RelCompuestoGrupoService.getById(id);
            res.status(200).json(relCompuestoGrupo.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevaRelCG] = RelCompuestoGrupoController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await RelCompuestoGrupoService.create(nuevaRelCG);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            await RelCompuestoGrupoService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, relCG] = RelCompuestoGrupoController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const relacionActualizada = await RelCompuestoGrupoService.update(id, relCG);
            res.status(200).json(relacionActualizada.toJson());
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
        let relCG = null;
        try {
            if (method === 'update') {
                relCG = relCompuestoGrupoUpdateSchema.parse(record);
            } else if (method === 'create') {
                relCG = relCompuestoGrupoCreateSchema.parse(record);
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
        return [errores, relCG];
    }
}
