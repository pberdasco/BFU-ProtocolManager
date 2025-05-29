// cadenasSubproyectoCompuesto_router.js
import { Router } from 'express';
import valoresPlanosController from '../controllers/valoresPlanos_controller.js';

export const valoresPlanosRouter = Router();

valoresPlanosRouter.get('/valoresSubproyecto/:subproyectoId', valoresPlanosController.getValoresSubproyecto);
