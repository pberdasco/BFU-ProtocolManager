import { Router } from 'express';
import MatrizCadenaController from '../controllers/matrizCadena_controller.js';

export const matrizCadenaRouter = Router();

matrizCadenaRouter.get('/', MatrizCadenaController.get);
