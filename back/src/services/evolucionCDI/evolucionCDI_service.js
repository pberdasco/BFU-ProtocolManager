import path from 'path';
import { getPlainData } from './getPlainData.js';
import { createWellTables } from './createWellTables.js';
import { generateGraphs } from './generateGraphs.js';

export default class evolucionCDIService {
    static async createExcel ({ subproyectoId, proyectoNombre, graficosConfig, gruposConfig }) {
        const uniquePozos = [...new Set(gruposConfig.flatMap(g => g.pozos))];
        const uniqueCompuestos = [...new Set(graficosConfig.flatMap(g => [...g.eje1, ...g.eje2]))];
        const measurements = await getPlainData(subproyectoId, uniquePozos, uniqueCompuestos);

        const { indexByPozo, indexByCompuesto, createdFile } = await createWellTables(proyectoNombre, gruposConfig, measurements);

        const workbookPath = path.resolve(createdFile.path, createdFile.file);
        generateGraphs(indexByPozo, indexByCompuesto, gruposConfig, graficosConfig, workbookPath);

        return createdFile;
    }
}
