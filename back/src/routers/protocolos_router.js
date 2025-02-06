import { Router } from "express";
import ProtocolosController from "../controllers/protocolos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const protocolosRouter = Router();

const parseProtocolosQuery = createParseDevExtremeQuery();

protocolosRouter.get('/', ProtocolosController.getAllowedFields, parseProtocolosQuery, ProtocolosController.getAll);
protocolosRouter.get('/:id/extended', ProtocolosController.getById);
protocolosRouter.get('/:id/original', ProtocolosController.getOriginalById);
protocolosRouter.post('/', ProtocolosController.create);
