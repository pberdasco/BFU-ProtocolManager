import MatricesService from '../services/matrices_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class MatricesController {
  static async getAll (req, res, next) {
    try {
      const matrices = await MatricesService.getAll();
      res.status(200).json(matrices);
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async getById (req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

      const matriz = await MatricesService.getById(id);
      res.status(200).json(matriz.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }
}
