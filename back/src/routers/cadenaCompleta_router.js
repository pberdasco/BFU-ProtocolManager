//cadenaCompleta_router.js
import { Router } from "express";
import CadenaCompletaController from "../controllers/cadenaCompleta_controller.js";

export const cadenaCompletaRouter = Router();

cadenaCompletaRouter.get('/:id', CadenaCompletaController.getById);
cadenaCompletaRouter.post('/', CadenaCompletaController.create);
cadenaCompletaRouter.delete('/:id', CadenaCompletaController.delete);
