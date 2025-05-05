import { Router } from 'express';
import GraficosGruposController from '../controllers/graficosGrupos_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const graficosGruposRouter = Router();

const parseGraficosGruposQuery = createParseDevExtremeQuery();

graficosGruposRouter.get('/', GraficosGruposController.getAllowedFields, parseGraficosGruposQuery, GraficosGruposController.getAll);

graficosGruposRouter.get('/:id', GraficosGruposController.getById);
graficosGruposRouter.post('/', GraficosGruposController.create);
graficosGruposRouter.put('/:id', GraficosGruposController.update);
graficosGruposRouter.delete('/:id', GraficosGruposController.delete);
