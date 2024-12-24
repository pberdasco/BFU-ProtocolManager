import LqsService from "../services/lqs_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { lqCreateSchema, lqUpdateSchema } from "../models/lqs_schema.js";
import { z } from "zod";

export default class LqsController {

    static getAllowedFields(req, res, next) {
        req.allowedFields = LqsService.getAllowedFields();
        next();
    }

    static async getAll(req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const lqs = await LqsService.getAll(devExtremeQuery);
            res.status(200).json(lqs);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById(req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error("El id debe ser numérico."), { status: 400 });

            const lqs = await LqsService.getById(id);
            res.status(200).json(lqs.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create(req, res, next) {
        try {
            const [errores, nuevoLqs] = LqsController.bodyValidations(req.body, "create");
            if (errores.length !== 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });

            const insertado = await LqsService.create(nuevoLqs);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update(req, res, next) {
        try {
            const id = req.params.id;
            const [errores, lqs] = LqsController.bodyValidations(req.body, "update");
            if (errores.length !== 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });

            const lqsActualizado = await LqsService.update(id, lqs);
            res.status(200).json(lqsActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error("El id debe ser numérico."), { status: 400 });

            await LqsService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations(record, method) {
        let errores = [];
        let lqs = null;
        try {
            if (method === "update") {
                lqs = lqUpdateSchema.parse(record);
            } else if (method === "create") {
                lqs = lqCreateSchema.parse(record);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                errores = error.errors.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
            } else {
                throw error;
            }
        }
        return [errores, lqs];
    }
}
