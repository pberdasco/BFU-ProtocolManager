import { Router } from "express";
import ProyectosController from "../controllers/proyectos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const proyectosRouter = Router();

const parseProyectosQuery = createParseDevExtremeQuery();

proyectosRouter.get('/extended', ProyectosController.getAllowedFields, parseProyectosQuery, ProyectosController.getAllExtended);
proyectosRouter.get('/', ProyectosController.getAllowedFields, parseProyectosQuery, ProyectosController.getAll);

proyectosRouter.get('/:id/extended', ProyectosController.getByIdExtended);
proyectosRouter.get('/:id', ProyectosController.getById);

proyectosRouter.post('/extended', ProyectosController.createExtended);
proyectosRouter.post('/', ProyectosController.create);

proyectosRouter.put('/:id/extended', ProyectosController.updateExtended);
proyectosRouter.put('/:id', ProyectosController.update);

// proyectosRouter.delete('/:id/extended', ProyectosController.deleteExtended);
proyectosRouter.delete('/:id', ProyectosController.delete);