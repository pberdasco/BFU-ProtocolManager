import { Router } from 'express';
import SinonimosUMsController from '../controllers/sinonimosUMs_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const sinonimosUMsRouter = Router();

const parseSinonimosUMsQuery = createParseDevExtremeQuery();

sinonimosUMsRouter.get('/', SinonimosUMsController.getAllowedFields, parseSinonimosUMsQuery, SinonimosUMsController.getAll);
sinonimosUMsRouter.get('/:id', SinonimosUMsController.getById);
sinonimosUMsRouter.post('/listasinonimos', SinonimosUMsController.getListaSinonimos);
sinonimosUMsRouter.post('/', SinonimosUMsController.create);
sinonimosUMsRouter.put('/:id', SinonimosUMsController.update);
sinonimosUMsRouter.delete('/:id', SinonimosUMsController.delete);
