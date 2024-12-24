import { Router } from "express";
import AutaplicacionController from "../controllers/autaplicacion_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const autaplicacionRouter = Router();

const parseAutaplicacionQuery = createParseDevExtremeQuery();

autaplicacionRouter.get('/', AutaplicacionController.getAllowedFields, parseAutaplicacionQuery, AutaplicacionController.getAll);

autaplicacionRouter.get('/:id', AutaplicacionController.getById);
autaplicacionRouter.post('/', AutaplicacionController.create);
autaplicacionRouter.put('/:id', AutaplicacionController.update);
autaplicacionRouter.delete('/:id', AutaplicacionController.delete);