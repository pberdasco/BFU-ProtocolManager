import { Router } from "express";
import ProyectosController from "../controllers/proyectos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const proyectosRouter = Router();

const allowedFields = ["Id", "Codigo", "Nombre", "Empresa"];
const parseProyectosQuery = createParseDevExtremeQuery(allowedFields);

proyectosRouter.get('/', parseProyectosQuery, ProyectosController.getAll);

proyectosRouter.get('/:id', ProyectosController.getById);
proyectosRouter.post('/', ProyectosController.create);
proyectosRouter.put('/:id', ProyectosController.update);
proyectosRouter.delete('/:id', ProyectosController.delete);