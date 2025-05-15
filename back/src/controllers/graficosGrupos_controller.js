import GraficosGruposService from '../services/reportes/evolucionCDI/configGrupos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { graficoGrupoCreateSchema, graficoGrupoUpdateSchema } from '../models/graficosGrupos_schema.js';
import { z } from 'zod';

export default class GraficosGruposController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = GraficosGruposService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const result = await GraficosGruposService.getAll(devExtremeQuery);
            res.status(200).json(result);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });
            const grupo = await GraficosGruposService.getById(id);
            res.status(200).json(grupo.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errors, group] = GraficosGruposController.bodyValidations(req.body, 'create');
            if (errors.length) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errors });
            const inserted = await GraficosGruposService.create(group);
            res.status(200).json(inserted.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });
            const [errors, group] = GraficosGruposController.bodyValidations(req.body, 'update');
            if (errors.length) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errors });
            const updated = await GraficosGruposService.update(id, group);
            res.status(200).json(updated.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });
            await GraficosGruposService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errors = [];
        let group = null;
        try {
            if (method === 'create') group = graficoGrupoCreateSchema.parse(record);
            else group = graficoGrupoUpdateSchema.parse(record);
        } catch (err) {
            if (err instanceof z.ZodError) {
                errors = err.errors.map(issue => ({ field: issue.path.join('.'), message: issue.message }));
            } else {
                throw err;
            }
        }
        return [errors, group];
    }
}
