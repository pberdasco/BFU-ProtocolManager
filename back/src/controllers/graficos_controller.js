import GraficosService from '../services/reportes/evolucionCDI/configGraficos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { graficoCreateSchema, graficoUpdateSchema } from '../models/graficos_schema.js';
import { z } from 'zod';

export default class GraficosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = GraficosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const result = await GraficosService.getAll(devExtremeQuery);
            res.status(200).json(result);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });
            const grafico = await GraficosService.getById(id);
            res.status(200).json(grafico.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errors, grafico] = GraficosController.bodyValidations(req.body, 'create');
            if (errors.length) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errors });
            const inserted = await GraficosService.create(grafico);
            res.status(200).json(inserted.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });
            const [errors, grafico] = GraficosController.bodyValidations(req.body, 'update');
            if (errors.length) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errors });
            const updated = await GraficosService.update(id, grafico);
            res.status(200).json(updated.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });
            await GraficosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations (record, method) {
        let errors = [];
        let grafico = null;
        try {
            if (method === 'create') grafico = graficoCreateSchema.parse(record);
            else grafico = graficoUpdateSchema.parse(record);
        } catch (err) {
            if (err instanceof z.ZodError) {
                errors = err.errors.map(issue => ({ field: issue.path.join('.'), message: issue.message }));
            } else {
                throw err;
            }
        }
        return [errors, grafico];
    }
}
