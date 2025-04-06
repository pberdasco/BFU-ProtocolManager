import { Router } from 'express';
import CadenaToDocTablaController from '../controllers/cadenaToDOCTabla_controller.js';

export const cadenaToDOCTablaRouter = Router();

cadenaToDOCTablaRouter.post('/', CadenaToDocTablaController.createDocx);
cadenaToDOCTablaRouter.get('/:nombreArchivo', CadenaToDocTablaController.download);
