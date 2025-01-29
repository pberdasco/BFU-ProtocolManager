import MatrizProtocoloService from "../services/MatrizProtocolo_service.js";
import { matrizProtocoloSchema } from "../models/matrizProtocolo_schema.js";
import { showError } from "../middleware/controllerErrors.js";
import { z } from "zod";

export default class MatrizProtocoloController{

    static async get(req, res, next){
        try{
            const { eventoId, cadenaId } = matrizProtocoloSchema.parse(req.query);
            const matrizProtocolo = await MatrizProtocoloService.get(eventoId, cadenaId);
            res.status(200).json(matrizProtocolo);                  
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