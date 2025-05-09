import { Router } from 'express';
import UMConvertController from '../controllers/umConvert_controller.js';

export const umConvertRouter = Router();

umConvertRouter.get('/', UMConvertController.getAll);
umConvertRouter.get('/:desde/:hasta', UMConvertController.getFactor);
