import { Router } from 'express';
import GraficosController from '../controllers/graficos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const graficosRouter = Router();

const parseGraficosQuery = createParseDevExtremeQuery();

graficosRouter.get('/', GraficosController.getAllowedFields, parseGraficosQuery, GraficosController.getAll);

graficosRouter.get('/:id', GraficosController.getById);
graficosRouter.post('/', GraficosController.create);
graficosRouter.put('/:id', GraficosController.update);
graficosRouter.delete('/:id', GraficosController.delete);
