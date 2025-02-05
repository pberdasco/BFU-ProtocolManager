import { Router } from "express";
import ProtocolosController from "../controllers/protocolos_controller.js";

export const protocolosRouter = Router();

protocolosRouter.get('/:id/extended', ProtocolosController.getById);
protocolosRouter.get('/:id/original', ProtocolosController.getOriginalById);
protocolosRouter.post('/', ProtocolosController.create);
