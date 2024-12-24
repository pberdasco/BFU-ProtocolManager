import { Router } from "express";
import LqsController from "../controllers/lqs_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const lqsRouter = Router();

const parseLqsQuery = createParseDevExtremeQuery();

lqsRouter.get('/', LqsController.getAllowedFields, parseLqsQuery, LqsController.getAll);
lqsRouter.get('/:id', LqsController.getById);
lqsRouter.post('/', LqsController.create);
lqsRouter.put('/:id', LqsController.update);
lqsRouter.delete('/:id', LqsController.delete);
