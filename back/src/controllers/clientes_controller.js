import ClientesService from "../services/clientes_service.js";
import { showError } from "../middleware/controllerErrors.js";
import { clienteCreateSchema, clienteUpdateSchema } from "../models/clientes_schema.js";
import { z } from "zod";

export default class ClientesController{

    static getAllowedFields(req, res, next) {
        req.allowedFields = ClientesService.getAllowedFields();
        next();
    }

    static async getAll(req, res, next){
        try{
            const devExtremeQuery = req.devExtremeQuery;
            const clientes = await ClientesService.getAll(devExtremeQuery);
            res.status(200).json(clientes);                  
        } catch (error) {
            showError(req, res, error); 
        }        
    }

    static async getById(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            const entidad = await ClientesService.getById(id);
            res.status(200).json(entidad.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async create(req, res, next) {
        try{
            const [errores, nuevaEntidad] = ClientesController.bodyValidations(req.body, "create")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const insertado = await ClientesService.create(nuevaEntidad);
            res.status(200).json(insertado.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async delete(req, res, next) {
        try{
            const id = req.params.id;
            if(isNaN(id)) throw Object.assign(new Error("El id debe ser numerico."), { status: 400 });
            
            await ClientesService.delete(id);
            res.status(204).send();
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    static async update(req, res, next) {
        try{
            const id = req.params.id;
            const [errores, entidad] = ClientesController.bodyValidations(req.body, "update")
            if (errores.length != 0) throw Object.assign(new Error("Problemas con el req.body"), { status: 400, fields: errores });
    
            const clienteActualizado = await ClientesService.update(id, entidad);
            res.status(200).json(clienteActualizado.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
    }

    /**
     * Valida y filtra con Zod los body para alta y modificacion
     * Los campos sobrantes los ignora. Para modificación admite parciales (partial)
     * @param {Object} record - el req.body recibido
     * @param {"update" || "create"} method - para que metodo tiene que validar 
     * @returns [Array, Object] - [errores, cliente] el array de errores de validacion y el objeto filtrado
     */
    static bodyValidations(record, method){
        let errores = [];
        let cliente = null; 
        try {
            if (method === "update") {
                cliente = clienteUpdateSchema.parse(record);
            } else if (method === "create"){
                cliente = clienteCreateSchema.parse(record);
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
        return [errores, cliente];        
    }
}