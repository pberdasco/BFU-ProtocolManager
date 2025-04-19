import { Router } from 'express';
import MkPozosController from '../controllers/mkPozos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const mkPozosRouter = Router();

const parseLqsQuery = createParseDevExtremeQuery();

mkPozosRouter.get('/', MkPozosController.getAllowedFields, parseLqsQuery, MkPozosController.getAll);
mkPozosRouter.get('/:id', MkPozosController.getById);
mkPozosRouter.post('/', MkPozosController.create);
mkPozosRouter.put('/:id', MkPozosController.update);
mkPozosRouter.delete('/:id', MkPozosController.delete);
