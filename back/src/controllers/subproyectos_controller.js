import SubproyectosService from "../services/subproyectos_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { subproyectoCreateSchema, subproyectoUpdateSchema } from "../models/subproyectos_schema.js";
import { z } from "zod";

export default class SubproyectosController {

    static async getAll(req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const subproyectos = await SubproyectosService.getAll(devExtremeQuery);
            res.status(200).json(subproyectos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById(req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error("El id debe ser numérico."), { status: 400 });

            const subproyecto = await SubproyectosService.getById(id);
            res.status(200).json(subproyecto.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create(req, res, next) {
        try {
            const [errores, nuevoSubproyecto] = SubproyectosController.bodyValidations(req.body, "create");
            if (errores.length !== 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });

            const insertado = await SubproyectosService.create(nuevoSubproyecto);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async update(req, res, next) {
        try {
            const id = req.params.id;
            const [errores, subproyecto] = SubproyectosController.bodyValidations(req.body, "update");
            if (errores.length !== 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });

            const subproyectoActualizado = await SubproyectosService.update(id, subproyecto);
            res.status(200).json(subproyectoActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete(req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error("El id debe ser numérico."), { status: 400 });

            await SubproyectosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    static bodyValidations(record, method) {
        let errores = [];
        let subproyecto = null;
        try {
            if (method === "update") {
                subproyecto = subproyectoUpdateSchema.parse(record);
            } else if (method === "create") {
                subproyecto = subproyectoCreateSchema.parse(record);
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
        return [errores, subproyecto];
    }
}
