import GrupoCompuestosService from "../services/grupoCompuestos_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { grupoCompuestoCreateSchema, grupoCompuestoUpdateSchema } from "../models/grupoCompuestos_schema.js";
import { z } from "zod";

export default class GrupoCompuestosController{

    static getAllowedFields(req, res, next) {
        req.allowedFields = GrupoCompuestosService.getAllowedFields();
        next();
    }

    static async getAll(req, res, next){
        try{
            const devExtremeQuery = req.devExtremeQuery;
            const compuestos = await GrupoCompuestosService.getAll(devExtremeQuery);
            res.status(200).json(compuestos);                  
        } catch (error) {
            showError(req, res, error); 
        }        
    }

    static async getById(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            const compuesto = await GrupoCompuestosService.getById(id);
            res.status(200).json(compuesto.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async create(req, res, next) {
        try{
            const [errores, nuevoCompuesto] = GrupoCompuestosController.bodyValidations(req.body, "create")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const insertado = await GrupoCompuestosService.create(nuevoCompuesto);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async delete(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            await GrupoCompuestosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async update(req, res, next) {
        try{
            const id = req.params.id;
            const [errores, compuesto] = GrupoCompuestosController.bodyValidations(req.body, "update")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const compuestoActualizado = await GrupoCompuestosService.update(id, compuesto);
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
    static bodyValidations(record, method){
        let errores = [];
        let compuesto = null; 
        try {
            if (method === "update") {
                compuesto = grupoCompuestoUpdateSchema.parse(record);
            } else if (method === "create"){
                compuesto = grupoCompuestoCreateSchema.parse(record);
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
        return [errores, compuesto];        
    }
}