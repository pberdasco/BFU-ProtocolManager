import CadenasCustodiaService from '../services/cadenasCustodia_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { cadenasCustodiaCreateSchema, cadenasCustodiaUpdateSchema } from '../models/cadenasCustodia_schema.js';
import { z } from 'zod';

export default class CadenasCustodiaController {
  static getAllowedFields (req, res, next) {
    req.allowedFields = CadenasCustodiaService.getAllowedFields();
    next();
  }

  static async getAll (req, res, next) {
    try {
      const devExtremeQuery = req.devExtremeQuery;
      const cadenasCustodia = await CadenasCustodiaService.getAll(devExtremeQuery);
      res.status(200).json(cadenasCustodia);
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async getById (req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

      const cadenaCustodia = await CadenasCustodiaService.getById(id);
      res.status(200).json(cadenaCustodia.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async create (req, res, next) {
    try {
      console.log('Create: ', JSON.stringify(req.body));

      const [errores, nuevaCadenaCustodia] = CadenasCustodiaController.bodyValidations(req.body, 'create');
      if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

      const insertado = await CadenasCustodiaService.create(nuevaCadenaCustodia);
      res.status(200).json(insertado.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async update (req, res, next) {
    try {
      const id = req.params.id;
      const [errores, cadenaCustodia] = CadenasCustodiaController.bodyValidations(req.body, 'update');
      if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

      const cadenaCustodiaActualizada = await CadenasCustodiaService.update(id, cadenaCustodia);
      res.status(200).json(cadenaCustodiaActualizada.toJson());
    } catch (error) {
      showError(req, res, error);
    }
  }

  static async delete (req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) throw Object.assign(new Error('El id debe ser numérico.'), { status: 400 });

      await CadenasCustodiaService.delete(id);
      res.status(204).send();
    } catch (error) {
      showError(req, res, error);
    }
  }

  static bodyValidations (record, method) {
    let errores = [];
    let cadenaCustodia = null;
    try {
      if (method === 'update') {
        cadenaCustodia = cadenasCustodiaUpdateSchema.parse(record);
      } else if (method === 'create') {
        cadenaCustodia = cadenasCustodiaCreateSchema.parse(record);
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
    return [errores, cadenaCustodia];
  }
}
