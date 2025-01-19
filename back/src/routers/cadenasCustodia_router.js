import { Router } from "express";
import CadenasCustodiaController from "../controllers/cadenasCustodia_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const cadenasCustodiaRouter = Router();

const parseCadenasCustodiaQuery = createParseDevExtremeQuery();

cadenasCustodiaRouter.get('/', CadenasCustodiaController.getAllowedFields, parseCadenasCustodiaQuery, CadenasCustodiaController.getAll);
cadenasCustodiaRouter.get('/:id', CadenasCustodiaController.getById);
cadenasCustodiaRouter.post('/', CadenasCustodiaController.create);
cadenasCustodiaRouter.put('/:id', CadenasCustodiaController.update);
cadenasCustodiaRouter.delete('/:id', CadenasCustodiaController.delete);
