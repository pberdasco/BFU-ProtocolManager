import { Router } from 'express';
import PozosController from '../controllers/pozos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const pozosRouter = Router();

const parsePozosQuery = createParseDevExtremeQuery();

pozosRouter.get('/', PozosController.getAllowedFields, parsePozosQuery, PozosController.getAll);
pozosRouter.get('/:id', PozosController.getById);
pozosRouter.post('/', PozosController.create);
pozosRouter.put('/:id', PozosController.update);
pozosRouter.delete('/:id', PozosController.delete);
