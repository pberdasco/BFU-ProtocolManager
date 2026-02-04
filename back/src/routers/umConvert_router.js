import { Router } from 'express';
import UMConvertController from '../controllers/umConvert_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const umConvertRouter = Router();

const parseUMConvertQuery = createParseDevExtremeQuery();

// 1) Legacy (para no romper lo que ya existe)
umConvertRouter.get('/', UMConvertController.getAll);
umConvertRouter.get('/:desde/:hasta', UMConvertController.getFactor);
// 2) ABM / Grid (MISMO recurso para todo)
umConvertRouter.get('/dx', UMConvertController.getAllowedFields, parseUMConvertQuery, UMConvertController.getAllDx);
umConvertRouter.post('/dx', UMConvertController.create);
umConvertRouter.put('/dx/:id', UMConvertController.update);
umConvertRouter.delete('/dx/:id', UMConvertController.delete);
umConvertRouter.get('/dx/:id', UMConvertController.getById);
