import { Router } from 'express';
import MetodosController from '../controllers/metodos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const metodosRouter = Router();

const parseMetodosQuery = createParseDevExtremeQuery();

metodosRouter.get('/', MetodosController.getAllowedFields, parseMetodosQuery, MetodosController.getAll);
metodosRouter.get('/:id', MetodosController.getById);
metodosRouter.post('/', MetodosController.create);
metodosRouter.put('/:id', MetodosController.update);
metodosRouter.delete('/:id', MetodosController.delete);
