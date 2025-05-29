// valoresPlanos_controller.js
import ValoresPlanosService from '../services/valoresPlanos_service.js';

export default class ValoresPlanosController {
    static async getValoresSubproyecto (req, res) {
        const { subproyectoId } = req.params;

        try {
            const data = await ValoresPlanosService.getValoresSubproyecto(parseInt(subproyectoId));
            res.json(data);
        } catch (error) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}
