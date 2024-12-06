import {createPool} from "mysql2/promise";

process.loadEnvFile();

export const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,  //Nota: tuve que generar un nuevo usuario administrador que usa seguridad
                            // estandar y no SHA?? porque el cliente no lo soporta
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
})

//todo: debeia usar logger para dejar registro de errores?
/**
 * Genera un error con throw a partir de un error programatico
 * Por ejemplo un 401, Credenciales invalidas por password invalida lo convierte en 
 * un error homogeneo con otros errores de base de datos.
 * @param {number} code - numero de error real o generado
 * @param {*} message - mensaje de error
 */
export function dbErrorMsg(code, message){
    const error = new Error(message);
    error.status = code;
    throw error;
}