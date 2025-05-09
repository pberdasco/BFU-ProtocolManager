import UMConvertService from '../services/umConvert_service.js';
import { showError } from '../middleware/controllerErrors.js';

export default class UMConvertController {
    static async getAll (req, res, next) {
        try {
            const entities = await UMConvertService.getAll();
            res.status(200).json(entities);
        } catch (error) {
            showError(req, res, error);
        }
    }

    static async getFactor (req, res, next) {
        try {
            const desde = req.params.desde;
            const hasta = req.params.hasta;
            const factor = await UMConvertService.getFactor(desde, hasta);
            res.status(200).json(factor);
        } catch (error) {
            showError(req, res, error);
        }
    }
}
