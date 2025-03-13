import { Router } from 'express';
import CadenaToExcelController from '../controllers/cadenaToExcel_controller.js';

export const cadenaToExcelRouter = Router();

cadenaToExcelRouter.post('/', CadenaToExcelController.create);
