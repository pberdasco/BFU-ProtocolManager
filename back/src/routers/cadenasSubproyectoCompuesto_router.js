// cadenasSubproyectoCompuesto_router.js
import { Router } from 'express';
import cadenasSubproyectoCompuestoController from '../controllers/cadenasSubproyectoCompuesto_controller.js';

export const cadenasSubproyectoCompuestoRouter = Router();

cadenasSubproyectoCompuestoRouter.get('/:subproyectoId/:matrizCodigo/:compuestoId', cadenasSubproyectoCompuestoController.getCadenasPorSubproyecto);
cadenasSubproyectoCompuestoRouter.get('/valoresSubproyecto/:subproyectoId', cadenasSubproyectoCompuestoController.getValoresSubproyecto);
