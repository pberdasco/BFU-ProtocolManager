import { Router } from 'express';
import RelCompuestoGrupoController from '../controllers/relCompuestoGrupo_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const relCompuestoGrupoRouter = Router();

const parseCompuestosQuery = createParseDevExtremeQuery();

relCompuestoGrupoRouter.get('/', RelCompuestoGrupoController.getAllowedFields, parseCompuestosQuery, RelCompuestoGrupoController.getAll);

relCompuestoGrupoRouter.get('/:id', RelCompuestoGrupoController.getById);
relCompuestoGrupoRouter.post('/', RelCompuestoGrupoController.create);
relCompuestoGrupoRouter.put('/:id', RelCompuestoGrupoController.update);
relCompuestoGrupoRouter.delete('/:id', RelCompuestoGrupoController.delete);
