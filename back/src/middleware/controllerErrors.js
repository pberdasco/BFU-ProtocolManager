import logger from "../utils/logger.js";

/**
 * Convierte un error en una respuesta de error de la api y deja un log del error
 * @param { Request } req 
 * @param { Response } res 
 * @param { Error } error 
 * @returns {{ status: Number, message: String }}  error - genera la respuesta de la api por error con status y message
 */
export function showError(req, res, error){
    logger.error(error)
    res.status(error?.status || 500).send({message: error?.message || error}); 
}
