import { Router } from 'express';
import ReguladosController from '../controllers/regulados_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const reguladosRouter = Router();

const parseReguladosQuery = createParseDevExtremeQuery();

reguladosRouter.get('/', ReguladosController.getAllowedFields, parseReguladosQuery, ReguladosController.getAll);
reguladosRouter.get('/:id', ReguladosController.getById);
reguladosRouter.post('/', ReguladosController.create);
reguladosRouter.put('/:id', ReguladosController.update);
reguladosRouter.delete('/:id', ReguladosController.delete);
