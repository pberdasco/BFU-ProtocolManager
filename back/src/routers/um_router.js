import { Router } from "express";
import UMController from "../controllers/um_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const umRouter = Router();

const parseUMQuery = createParseDevExtremeQuery();

umRouter.get('/', UMController.getAllowedFields, parseUMQuery, UMController.getAll);
umRouter.get('/:id', UMController.getById);
umRouter.post('/', UMController.create);
umRouter.put('/:id', UMController.update);
umRouter.delete('/:id', UMController.delete);
