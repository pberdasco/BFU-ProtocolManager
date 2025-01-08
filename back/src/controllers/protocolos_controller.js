import ProtocolosService from "../services/protocolos_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { protocolosCreateSchema, protocolosUpdateSchema } from "../models/protocolos_schema.js";
import { z } from "zod";

export default class ProtocolosController {

    static getAllowedFields(req, res, next) {
        req.allowedFields = ProtocolosService.getAllowedFields();
        next();
    }

    static async getAll(req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const protocolos = await ProtocolosService.getAll(devExtremeQuery);
            res.status(200).json(protocolos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById(req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error("El id debe ser numérico."), { status: 400 });

            const protocolos = await ProtocolosService.getById(id);
            res.status(200).json(protocolos.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create(req, res, next) {
        try {
            const [errores, nuevoProtocolos] = ProtocolosController.bodyValidations(req.body, "create");
            if (errores.length !== 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });

            const insertado = await ProtocolosService.create(nuevoProtocolos);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update(req, res, next) {
        try {
            const id = req.params.id;
            const [errores, protocolos] = ProtocolosController.bodyValidations(req.body, "update");
            if (errores.length !== 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });

            const protocolosActualizado = await ProtocolosService.update(id, protocolos);
            res.status(200).json(protocolosActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error("El id debe ser numérico."), { status: 400 });

            await ProtocolosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations(record, method) {
        let errores = [];
        let protocolos = null;
        try {
            if (method === "update") {
                protocolos = protocolosUpdateSchema.parse(record);
            } else if (method === "create") {
                protocolos = protocolosCreateSchema.parse(record);
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
        return [errores, protocolos];
    }
}