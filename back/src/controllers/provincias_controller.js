import ProvinciasService from '../services/provincias_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class ProvinciasController {
  static async getAll (req, res, next) {
    try {
      const provincias = await ProvinciasService.getAll();
      res.status(200).json(provincias);
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async getById (req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

      const provincia = await ProvinciasService.getById(id);
      res.status(200).json(provincia.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }
}
