import { Router } from 'express';
import MuestrasController from '../controllers/muestras_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const muestrasRouter = Router();

const parseMuestrasQuery = createParseDevExtremeQuery();

muestrasRouter.get('/', MuestrasController.getAllowedFields, parseMuestrasQuery, MuestrasController.getAll);
muestrasRouter.get('/:id', MuestrasController.getById);
muestrasRouter.post('/', MuestrasController.create);
muestrasRouter.put('/:id', MuestrasController.update);
muestrasRouter.delete('/:id', MuestrasController.delete);
