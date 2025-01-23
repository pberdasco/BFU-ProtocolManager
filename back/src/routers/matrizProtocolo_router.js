import { Router } from "express";
import MatrizProtocoloController from "../controllers/matrizProtocolo_controller.js";

export const matrizProtocoloRouter = Router();

matrizProtocoloRouter.get('/', MatrizProtocoloController.get);

