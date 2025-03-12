import { Router } from 'express';
import LaboratoriosController from '../controllers/laboratorios_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const laboratoriosRouter = Router();

const parseLaboratoriosQuery = createParseDevExtremeQuery();

laboratoriosRouter.get('/', LaboratoriosController.getAllowedFields, parseLaboratoriosQuery, LaboratoriosController.getAll);

laboratoriosRouter.get('/:id', LaboratoriosController.getById);
laboratoriosRouter.post('/', LaboratoriosController.create);
laboratoriosRouter.put('/:id', LaboratoriosController.update);
laboratoriosRouter.delete('/:id', LaboratoriosController.delete);
