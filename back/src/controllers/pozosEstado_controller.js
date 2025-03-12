import PozosEstadoService from '../services/pozosEstado_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class PozosEstadoController {
    static async getAll (req, res, next) {
        try {
            const estados = await PozosEstadoService.getAll();
            res.status(200).json(estados);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const estado = await PozosEstadoService.getById(id);
            res.status(200).json(estado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }
}
