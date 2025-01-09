import { Router } from "express";
import ProyectosEstadoController from "../controllers/proyectosEstado_controller.js";

export const proyectosEstadoRouter = Router();

proyectosEstadoRouter.get('/', ProyectosEstadoController.getAll);

proyectosEstadoRouter.get('/:id', ProyectosEstadoController.getById);
