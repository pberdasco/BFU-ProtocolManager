import { Router } from 'express';
import SinonimosMetodosController from '../controllers/sinonimosMetodos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const sinonimosMetodosRouter = Router();

const parseSinonimosMetodosQuery = createParseDevExtremeQuery();

sinonimosMetodosRouter.get('/', SinonimosMetodosController.getAllowedFields, parseSinonimosMetodosQuery, SinonimosMetodosController.getAll);
sinonimosMetodosRouter.get('/:id', SinonimosMetodosController.getById);
sinonimosMetodosRouter.post('/listasinonimos', SinonimosMetodosController.getListaSinonimos);
sinonimosMetodosRouter.post('/', SinonimosMetodosController.create);
sinonimosMetodosRouter.put('/:id', SinonimosMetodosController.update);
sinonimosMetodosRouter.delete('/:id', SinonimosMetodosController.delete);
