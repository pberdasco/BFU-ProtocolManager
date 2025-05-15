import path from 'path';
import { createWellTables } from './createWellTables.js';
import { generateGraphs } from './generateGraphs.js';

//* ***************************************************************** */
//*      Esto tiene que llegar por parametros
import { graficosConfig, gruposConfig, measurements } from './mock.js';
const proyectoName = '100000-100';

// TODO: measurements, puede ser que se levante de Valores en tabla plana
// GET http://localhost:5001/cadenasSubproyectoCompuesto/valoresSubproyecto/266
// o se casi duplique el codigo en esta api como un preproceso a createWellTables

//* ***************************************************************** */

export default class evolucionCDIService {
    static async createExcel (proyectoName, graficosConfig, gruposConfig, measurements) {
        // TODO: const measurements = getData(subproyectoId) -> emulando a valores en tabla plana?
        const { indexByPozo, indexByCompuesto, createdFile } = await createWellTables(proyectoName, gruposConfig, measurements);
        const workbookPath = path.resolve(createdFile.path, createdFile.file);
        generateGraphs(indexByPozo, indexByCompuesto, gruposConfig, graficosConfig, workbookPath);
        return createdFile;
    }
}

evolucionCDIService.createExcel(proyectoName, graficosConfig, gruposConfig, measurements);
