import { Router } from 'express';
import PozosTipoController from '../controllers/pozosTipo_controller.js';

export const pozosTipoRouter = Router();

pozosTipoRouter.get('/', PozosTipoController.getAll);

pozosTipoRouter.get('/:id', PozosTipoController.getById);
