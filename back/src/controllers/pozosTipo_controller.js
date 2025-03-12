import PozosTipoService from '../services/pozosTipo_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class PozosTipoController {
    static async getAll (req, res, next) {
        try {
            const tipos = await PozosTipoService.getAll();
            res.status(200).json(tipos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const tipo = await PozosTipoService.getById(id);
            res.status(200).json(tipo.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }
}
