import { Router } from "express";
import SinonimosCompuestosController from "../controllers/sinonimosCompuestos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const sinonimosCompuestosRouter = Router();

const parseSinonimosCompuestosQuery = createParseDevExtremeQuery();

sinonimosCompuestosRouter.get('/', SinonimosCompuestosController.getAllowedFields, parseSinonimosCompuestosQuery, SinonimosCompuestosController.getAll);
sinonimosCompuestosRouter.get('/:id', SinonimosCompuestosController.getById);
sinonimosCompuestosRouter.post('/', SinonimosCompuestosController.create);
sinonimosCompuestosRouter.post('/listasinonimos', SinonimosCompuestosController.getListaSinonimos);
sinonimosCompuestosRouter.put('/:id', SinonimosCompuestosController.update);
sinonimosCompuestosRouter.delete('/:id', SinonimosCompuestosController.delete);
