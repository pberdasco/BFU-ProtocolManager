import { Router } from 'express';
import MannKendallController from '../controllers/mannKendall_controller.js';

export const mannKendallRouter = Router();

mannKendallRouter.get('/data/:subproyectoId', MannKendallController.getData);
mannKendallRouter.get('/:subproyectoId', MannKendallController.generate);
mannKendallRouter.post('/getzip', MannKendallController.downloadZip);
