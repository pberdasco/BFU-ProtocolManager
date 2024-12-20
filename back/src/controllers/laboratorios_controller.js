import LaboratoriosService from "../services/laboratorios_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { laboratorioCreateSchema, laboratorioUpdateSchema } from "../models/laboratorios_schema.js";
import { z } from "zod";

export default class LaboratoriosController{

    static getAllowedFields(req, res, next) {
        req.allowedFields = LaboratoriosService.getAllowedFields();
        next();
    }

    static async getAll(req, res, next){
        try{
            const devExtremeQuery = req.devExtremeQuery;
            const laboratorios = await LaboratoriosService.getAll(devExtremeQuery);
            res.status(200).json(laboratorios);                  
        } catch (error) {
            showError(req, res, error); 
        }        
    }

    static async getById(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            const laboratorio = await LaboratoriosService.getById(id);
            res.status(200).json(laboratorio.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async create(req, res, next) {
        try{
            const [errores, nuevoLaboratorio] = LaboratoriosController.bodyValidations(req.body, "create")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const insertado = await LaboratoriosService.create(nuevoLaboratorio);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async delete(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            await LaboratoriosService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async update(req, res, next) {
        try{
            const id = req.params.id;
            const [errores, laboratorio] = LaboratoriosController.bodyValidations(req.body, "update")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const laboratorioActualizado = await LaboratoriosService.update(id, laboratorio);
            res.status(200).json(laboratorioActualizado.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"update" || "create"} method - para que metodo tiene que validar 
     * @returns [Array, Object] - [errores, laboratorio] el array de errores de validacion y el objeto filtrado
     */
    static bodyValidations(record, method){
        let errores = [];
        let laboratorio = null; 
        try {
            if (method === "update") {
                laboratorio = laboratorioUpdateSchema.parse(record);
            } else if (method === "create"){
                laboratorio = laboratorioCreateSchema.parse(record);
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
        return [errores, laboratorio];        
    }
}