import RelCompuestoGrupoService from '../services/relCompuestoGrupo_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { relCompuestoGrupoCreateSchema, relCompuestoGrupoUpdateSchema } from '../models/relCompuestoGrupo_schema.js';
import { bodyValidations as validateBody } from './validations.js';

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
        if (method === 'update') return validateBody(record, relCompuestoGrupoUpdateSchema);
        if (method === 'create') return validateBody(record, relCompuestoGrupoCreateSchema);
        return [[], null];
    }
}
