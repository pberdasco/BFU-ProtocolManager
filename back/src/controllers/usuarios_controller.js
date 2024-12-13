import UsuariosService from "../services/usuarios_service.js";


//TODO: agregar validador de datos (zod)
export default class UsuariosController{
    /**
     * Utiliza a UsuariosService para grabar un nuevo usuario
     * @param {Request} req 
     * @param {req.body.nombre} - nombre de usuario
     * @param {req.body.mail} - mail del usuario
     * @param {req.body.password} - password sin encriptar
     * @param {Response} res 
     * @returns {Response} - status: 200 + json con los datos del usuario ingresado (sin password) 
     *                     - status: errorstatus + message: string (si falló)
     */
    static async userRegister(req, res, next) {
        const {nombre, mail, password} = req.body;
        try{
            const usuario = await UsuariosService.userRegister({nombre, mail, password});
            res.status(200).send(usuario.toJson());
        } catch (error) {
            showError(req, res, error); 
        }  
            
    }

    /**
     * Utiliza a UsuariosService para realizar el login de un usuario
     * @param {Request} req 
     * @param {Request.body.mail} mail- mail del usuario
     * @param {Request.body.password} password - password sin encriptar
     * @param {Response} res 
     * @returns {Response} - token: string (con id, mail, nombre) (si login ok)
     *                     - status: 401 + message (si fallo)
     */
    static async userLogin(req, res, next) {
        const {mail, password} = req.body;  
        try{
            const data = await UsuariosService.userLogin(mail, password);
            res.status(200).send(data);                  
        } catch (error) {
            showError(req, res, error); 
        }  
    }
}
