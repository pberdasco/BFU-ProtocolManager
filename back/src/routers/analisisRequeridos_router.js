import { Router } from 'express';
import AnalisisRequeridosController from '../controllers/analisisRequeridos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const analisisRequeridosRouter = Router();

const parseAnalisisRequeridosQuery = createParseDevExtremeQuery();

analisisRequeridosRouter.get('/', AnalisisRequeridosController.getAllowedFields, parseAnalisisRequeridosQuery, AnalisisRequeridosController.getAll);
analisisRequeridosRouter.get('/:id', AnalisisRequeridosController.getById);
analisisRequeridosRouter.post('/', AnalisisRequeridosController.create);
analisisRequeridosRouter.put('/:id', AnalisisRequeridosController.update);
analisisRequeridosRouter.delete('/:id', AnalisisRequeridosController.delete);
