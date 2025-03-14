import { Router } from 'express';
import CadenaToExcelController from '../controllers/cadenaToExcel_controller.js';

export const cadenaToExcelRouter = Router();

cadenaToExcelRouter.post('/', CadenaToExcelController.createMultiple);
cadenaToExcelRouter.get('/:nombreArchivo', CadenaToExcelController.download);
