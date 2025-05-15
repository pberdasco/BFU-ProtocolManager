import { Router } from 'express';
import EvolucionCDIController from '../controllers/evolucionCDI_controller.js';

export const evolucionCDIRouter = Router();

evolucionCDIRouter.post('/', EvolucionCDIController.create);
