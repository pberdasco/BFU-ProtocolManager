import { Router } from "express";
import GrupoCompuestosController from "../controllers/grupoCompuestos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const grupoCompuestosRouter = Router();

const parseCompuestosQuery = createParseDevExtremeQuery();

grupoCompuestosRouter.get('/', GrupoCompuestosController.getAllowedFields, parseCompuestosQuery, GrupoCompuestosController.getAll);

grupoCompuestosRouter.get('/:id', GrupoCompuestosController.getById);
grupoCompuestosRouter.post('/', GrupoCompuestosController.create);
grupoCompuestosRouter.put('/:id', GrupoCompuestosController.update);
grupoCompuestosRouter.delete('/:id', GrupoCompuestosController.delete);