import { Router } from "express";
import MatricesController from "../controllers/matrices_controller.js";

export const matricesRouter = Router();

matricesRouter.get('/', MatricesController.getAll);

matricesRouter.get('/:id', MatricesController.getById);
