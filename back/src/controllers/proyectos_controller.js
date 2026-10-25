import ProyectosService from '../services/proyectos_service.js';
import { showError } from '../middleware/controllerErrors.js';
import { proyectoCreateSchema, proyectoUpdateSchema, proyectoCreateExtendedSchema, proyectoRenumeracionSchema } from '../models/proyectos_schema.js';
// import { proyectoUpdateExtendedSchema } from '../models/proyectos_schema.js';
import { bodyValidations as validateBody } from './validations.js';

export default class ProyectosController {
    static getAllowedFields (req, res, next) {
        req.allowedFields = ProyectosService.getAllowedFields();
        next();
    }

    static async getAll (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const proyectos = await ProyectosService.getAll(devExtremeQuery);
            res.status(200).json(proyectos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getAllExtended (req, res, next) {
        try {
            const devExtremeQuery = req.devExtremeQuery;
            const proyectos = await ProyectosService.getAllExtended(devExtremeQuery);
            res.status(200).json(proyectos);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getById (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const proyecto = await ProyectosService.getById(id);
            res.status(200).json(proyecto.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getByIdExtended (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            const proyecto = await ProyectosService.getByIdExtended(id);
            res.status(200).json(proyecto.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async create (req, res, next) {
        try {
            const [errores, nuevoProyecto] = ProyectosController.bodyValidations(req.body, 'create');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await ProyectosService.create(nuevoProyecto);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async createExtended (req, res, next) {
        try {
            const [errores, nuevoProyecto] = ProyectosController.bodyValidations(req.body, 'createExtended');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const insertado = await ProyectosService.createExtended(nuevoProyecto);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async delete (req, res, next) {
        try {
            const id = req.params.id;
            if (isNaN(id)) throw Object.assign(new Error('El id debe ser numerico.'), { status: 400 });

            await ProyectosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error);
        }
    }

    // TODO: probablemente este no deba existir... si borra borra todos los hijos quizas hay que desactivar. por ahora ojo que apunta al service.delete
    // static async deleteExtended(req, res, next) {
    //     try{
    //         const id = req.params.id;
    //         if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });

    //         await ProyectosService.delete(id);
    //         res.status(204).send();
    //     } catch (error) {
    //         showError(req, res, error);
    //     }
    // }

    static async update (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, proyecto] = ProyectosController.bodyValidations(req.body, 'update');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const proyectoActualizado = await ProyectosService.update(id, proyecto);
            res.status(200).json(proyectoActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async updateExtended (req, res, next) {
        try {
            const id = req.params.id;
            const [errores, proyecto] = ProyectosController.bodyValidations(req.body, 'updateExtended');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const proyectoActualizado = await ProyectosService.updateExtended(id, proyecto);
            res.status(200).json(proyectoActualizado.toJson());
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async validarRenumeracion (req, res, next) {
        try {
            const [errores, data] = ProyectosController.bodyValidations(req.body, 'renumeracion');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const resultado = await ProyectosService.validarRenumeracion(data);
            res.status(200).json(resultado);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async renumerar (req, res, next) {
        try {
            const [errores, data] = ProyectosController.bodyValidations(req.body, 'renumeracion');
            if (errores.length !== 0) throw Object.assign(new Error('Problemas con el req.body'), { status: 400, fields: errores });

            const resultado = await ProyectosService.renumerar(data);
            res.status(200).json(resultado);
        } catch (error) {
            showError(req, res, error);
        }
    }

    /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"update" || "create"} method - para que metodo tiene que validar
     * @returns [Array, Object] - [errores, proyecto] el array de errores de validacion y el objeto filtrado
     */
    static bodyValidations (record, method) {
        if (method === 'update') return validateBody(record, proyectoUpdateSchema);
        if (method === 'create') return validateBody(record, proyectoCreateSchema);
        // Conservar el esquema actual de updateExtended durante este refactor.
        if (method === 'updateExtended' || method === 'createExtended') return validateBody(record, proyectoCreateExtendedSchema);
        if (method === 'renumeracion') return validateBody(record, proyectoRenumeracionSchema);
        return [[], null];
    }
}
