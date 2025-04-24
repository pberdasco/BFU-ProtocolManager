// cadenasSubproyectoCompuesto_controller.js
import CadenasSubproyectoCompuestoService from '../services/cadenasSubproyectoCompuesto_service.js';

export default class CadenasSubproyectoCompuestoController {
    static async getCadenasPorSubproyecto (req, res) {
        const { subproyectoId, matrizCodigo, compuestoId } = req.params;
        console.log('controller: ', subproyectoId, matrizCodigo, compuestoId);

        try {
            const data = await CadenasSubproyectoCompuestoService.getCadenasPorSubproyectoCompuesto(
                parseInt(subproyectoId),
                parseInt(matrizCodigo),
                parseInt(compuestoId)
            );
            res.json(data);
        } catch (error) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}
