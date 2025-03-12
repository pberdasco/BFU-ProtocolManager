import { Router } from 'express';
import PozosEstadoController from '../controllers/pozosEstado_controller.js';

export const pozosEstadoRouter = Router();

pozosEstadoRouter.get('/', PozosEstadoController.getAll);

pozosEstadoRouter.get('/:id', PozosEstadoController.getById);
