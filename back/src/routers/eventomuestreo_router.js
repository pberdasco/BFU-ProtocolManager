import { Router } from "express";
import EventomuestreoController from "../controllers/eventomuestreo_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const eventomuestreoRouter = Router();

const parseEventomuestreoQuery = createParseDevExtremeQuery();

eventomuestreoRouter.get('/', EventomuestreoController.getAllowedFields, parseEventomuestreoQuery, EventomuestreoController.getAll);
eventomuestreoRouter.get('/:id', EventomuestreoController.getById);
eventomuestreoRouter.post('/', EventomuestreoController.create);
eventomuestreoRouter.put('/:id', EventomuestreoController.update);
eventomuestreoRouter.delete('/:id', EventomuestreoController.delete);
