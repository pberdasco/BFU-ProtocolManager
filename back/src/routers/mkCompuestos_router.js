import { Router } from 'express';
import MkCompuestosController from '../controllers/mkCompuestos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const mkCompuestosRouter = Router();

const parseLqsQuery = createParseDevExtremeQuery();

mkCompuestosRouter.get('/', MkCompuestosController.getAllowedFields, parseLqsQuery, MkCompuestosController.getAll);
mkCompuestosRouter.get('/:id', MkCompuestosController.getById);
mkCompuestosRouter.post('/', MkCompuestosController.create);
mkCompuestosRouter.put('/:id', MkCompuestosController.update);
mkCompuestosRouter.delete('/:id', MkCompuestosController.delete);
