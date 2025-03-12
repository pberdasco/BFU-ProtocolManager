import { Router } from 'express';
import ClientesController from '../controllers/clientes_controller.js';
import { createParseDevExtremeQuery } from '../middleware/parseDevExtremeQuery.js';

export const clientesRouter = Router();

const parseClientesQuery = createParseDevExtremeQuery();

clientesRouter.get('/', ClientesController.getAllowedFields, parseClientesQuery, ClientesController.getAll);
clientesRouter.get('/:id', ClientesController.getById);
clientesRouter.post('/', ClientesController.create);
clientesRouter.put('/:id', ClientesController.update);
clientesRouter.delete('/:id', ClientesController.delete);
