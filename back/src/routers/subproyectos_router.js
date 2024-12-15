import { Router } from "express";
import SubproyectosController from "../controllers/subproyectos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const subproyectosRouter = Router();

const allowedFields = { 
    id: "S.id", 
    codigo: "S.codigo", 
    nombreLocacion: "S.nombreLocacion", 
    ubicacion: "S.ubicacion", 
    autAplicacionId: "S.autAplicacionId", 
    proyectoId: "S.proyectoId",
    proyecto: "P.codigo",
    autoridad: "A.nombre"
}
const parseSubproyectosQuery = createParseDevExtremeQuery(allowedFields);

subproyectosRouter.get('/', parseSubproyectosQuery, SubproyectosController.getAll);
subproyectosRouter.get('/:id', SubproyectosController.getById);
subproyectosRouter.post('/', SubproyectosController.create);
subproyectosRouter.put('/:id', SubproyectosController.update);
subproyectosRouter.delete('/:id', SubproyectosController.delete);
