import { Router } from "express";
import SubproyectosController from "../controllers/subproyectos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const subproyectosRouter = Router();

const parseSubproyectosQuery = createParseDevExtremeQuery();

subproyectosRouter.get('/', SubproyectosController.getAllowedFields, parseSubproyectosQuery, SubproyectosController.getAll);
subproyectosRouter.get('/:id', SubproyectosController.getById);
subproyectosRouter.post('/', SubproyectosController.create);
subproyectosRouter.put('/:id', SubproyectosController.update);
subproyectosRouter.delete('/:id', SubproyectosController.delete);
