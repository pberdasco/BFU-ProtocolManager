import ProyectosService from "../services/proyectos_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { proyectoCreateSchema, proyectoUpdateSchema } from "../models/proyectos_schema.js";
import { z } from "zod";

export default class ProyectosController{

    static getAllowedFields(req, res, next) {
        req.allowedFields = ProyectosService.getAllowedFields();
        next();
    }

    static async getAll(req, res, next){
        try{
            const devExtremeQuery = req.devExtremeQuery;
            const proyectos = await ProyectosService.getAll(devExtremeQuery);
            res.status(200).json(proyectos);                  
        } catch (error) {
            showError(req, res, error); 
        }        
    }

    static async getById(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            const proyecto = await ProyectosService.getById(id);
            res.status(200).json(proyecto.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async create(req, res, next) {
        try{
            const [errores, nuevoProyecto] = ProyectosController.bodyValidations(req.body, "create")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const insertado = await ProyectosService.create(nuevoProyecto);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async delete(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            await ProyectosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async update(req, res, next) {
        try{
            const id = req.params.id;
            const [errores, proyecto] = ProyectosController.bodyValidations(req.body, "update")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const proyectoActualizado = await ProyectosService.update(id, proyecto);
            res.status(200).json(proyectoActualizado.toJson());
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
    static bodyValidations(record, method){
        let errores = [];
        let proyecto = null; 
        try {
            if (method === "update") {
                proyecto = proyectoUpdateSchema.parse(record);
            } else if (method === "create"){
                proyecto = proyectoCreateSchema.parse(record);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                errores = error.errors.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
            } else {
                throw error;
            }
        }
        return [errores, proyecto];        
    }
}
