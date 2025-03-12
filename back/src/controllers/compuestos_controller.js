import CompuestosService from '../services/compuestos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { compuestoCreateSchema, compuestoUpdateSchema } from '../models/compuestos_schema.js';
import { z } from 'zod';

export default class CompuestosController {
  static getAllowedFields (req, res, next) {
    req.allowedFields = CompuestosService.getAllowedFields();
    next();
  }

  static async getAll (req, res, next) {
    try {
      const devExtremeQuery = req.devExtremeQuery;
      const compuestos = await CompuestosService.getAll(devExtremeQuery);
      res.status(200).json(compuestos);
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async getById (req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

      const compuesto = await CompuestosService.getById(id);
      res.status(200).json(compuesto.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async create (req, res, next) {
    try {
      const [errores, nuevoCompuesto] = CompuestosController.bodyValidations(req.body, 'create');
      if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });
      const insertado = await CompuestosService.create(nuevoCompuesto);
      res.status(200).json(insertado.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async delete (req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

      await CompuestosService.delete(id);
      res.status(204).send();
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async update (req, res, next) {
    try {
      const id = req.params.id;
      const [errores, compuesto] = CompuestosController.bodyValidations(req.body, 'update');
      if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

      const compuestoActualizado = await CompuestosService.update(id, compuesto);
      res.status(200).json(compuestoActualizado.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }

  /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"update" || "create"} method - para que metodo tiene que validar
     * @returns [Array, Object] - [errores, compuesto] el array de errores de validacion y el objeto filtrado
     */
  static bodyValidations (record, method) {
    let errores = [];
    let compuesto = null;
    try {
      if (method === 'update') {
        compuesto = compuestoUpdateSchema.parse(record);
      } else if (method === 'create') {
        compuesto = compuestoCreateSchema.parse(record);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errores = error.errors.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
      } else {
        throw error;
      }
    }
    return [errores, compuesto];
  }
}
