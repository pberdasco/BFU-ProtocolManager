import { Router } from "express";
import RegulacionesController from "../controllers/regulaciones_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const regulacionesRouter = Router();

const parseRegulacionesQuery = createParseDevExtremeQuery();

regulacionesRouter.get('/', RegulacionesController.getAllowedFields, parseRegulacionesQuery, RegulacionesController.getAll);
regulacionesRouter.get('/:id', RegulacionesController.getById);
regulacionesRouter.post('/', RegulacionesController.create);
regulacionesRouter.put('/:id', RegulacionesController.update);
regulacionesRouter.delete('/:id', RegulacionesController.delete);