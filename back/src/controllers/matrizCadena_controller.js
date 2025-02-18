import MatrizCadenaService from "../services/MatrizCadena_service.js";
import { matrizCadenaSchema } from "../models/matrizCadena_schema.js";
import { showError } from "../middleware/controllerErrors.js";
import { z } from "zod";

export default class MatrizCadenaController{

    static async get(req, res, next){
        try{
            const { eventoId, cadenaId } = matrizCadenaSchema.parse(req.query);
            const result = await MatrizCadenaService.get(eventoId, cadenaId);
            res.status(200).json(result);                  
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fields = error.errors.map(issue => ({
                    field: issue.path.join("."), 
                    message: issue.message       
                }));

                return showError(req, res, { 
                    status: 400, 
                    message: "Error de validación en los parámetros de entrada.", 
                    fields 
                });
            }

            return showError(req, res, error);
        }        
    }

}