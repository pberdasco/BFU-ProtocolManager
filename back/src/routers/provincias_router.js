import { Router } from "express";
import ProvinciasController from "../controllers/provincias_controller.js";

export const provinciasRouter = Router();

provinciasRouter.get('/', ProvinciasController.getAll);

provinciasRouter.get('/:id', ProvinciasController.getById);
