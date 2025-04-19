import MannKendallService from '../services/mannKendall_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class MannKendallController {
    static async generate (req, res, next) {
        try {
            const { subproyectoId } = req.params;
            let { fecha } = req.query; // fechaEvaluacion
            if (!fecha) {
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0]; // → '2025-04-16'
            }
            const data = await MannKendallService.fullProcess(Number(subproyectoId), fecha);
            res.json(data);
        } catch (error) {
            showError(req, res, error);
        }
    }
}
