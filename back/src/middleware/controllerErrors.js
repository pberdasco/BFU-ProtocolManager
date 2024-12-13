import logger from "../utils/logger.js";

/**
 * Error Handler
 * @param {error} error
 * @param { Request } req 
 * @param { Response } res 
 * @param { Function } next 
 * @returns {{ status: Number, message: String }}  error - genera la respuesta de la api por error con status y message
 */
export function showError(req, res, error){    
    logger.error(`(${error.status}) ${error.message}`);
    if (error.stack) logger.error(`stack ${error.stack}`);
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    const fields = error.fields || null;

    res.status(status).json({ message, fields }); 
}
