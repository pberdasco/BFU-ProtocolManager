import { showError } from "../middleware/controllerErrors.js";
import ProyectosService from "../services/proyectos_service.js";


//TODO: agregar validador de datos (zod)
export default class PryectosController{
    static async getAll(req, res, next){
        const devExtremeQuery = req.devExtremeQuery;
        try {
            const casos = await ProyectosService.getAll(devExtremeQuery);
            res.status(200).send(casos);                  
        } catch (error) {
            showError(req, res, error);
        }
    }
}
