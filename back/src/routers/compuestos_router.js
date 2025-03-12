import { Router } from 'express';
import CompuestosController from '../controllers/compuestos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const compuestosRouter = Router();

const parseCompuestosQuery = createParseDevExtremeQuery();

compuestosRouter.get('/', CompuestosController.getAllowedFields, parseCompuestosQuery, CompuestosController.getAll);

compuestosRouter.get('/:id', CompuestosController.getById);
compuestosRouter.post('/', CompuestosController.create);
compuestosRouter.put('/:id', CompuestosController.update);
compuestosRouter.delete('/:id', CompuestosController.delete);
