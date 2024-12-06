import { Router } from "express";
import ProyectosController from "../controllers/proyectos_controller.js";
import { createParseDevExtremeQuery } from "../middleware/parseDevExtremeQuery.js";

export const proyectosRouter = Router();

const allowedFields = ["id", "nombre", "empresa"];
const parseProyectosQuery = createParseDevExtremeQuery(allowedFields);

proyectosRouter.get('/', parseProyectosQuery, ProyectosController.getAll);


