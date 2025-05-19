import fs from 'node:fs';
import path from 'path';
import { stdErrorMsg } from '../../../utils/stdError.js';
import { getPlainData } from './getPlainData.js';
import { createWellTables } from './createWellTables.js';
import { generateGraphs } from './generateGraphs.js';
import { createReport } from './generateDOC.js';

export default class evolucionCDIService {
    /**
     * Genera el Anexo de Evolución CDI para un subproyecto determinado.
     *
     * Este método realiza las siguientes tareas:
     * 1. Obtiene los datos planos (nivel freático, FLNA y compuestos) a partir de los pozos y compuestos configurados.
     * 2. Genera una tabla consolidada en Excel con los valores obtenidos.
     * 3. Inserta gráficos en el Excel para cada grupo y configuración especificada.
     * 4. Genera un documento Word con el Anexo del informe, incluyendo gráficos y datos clave.
     *
     * @param {Object} options - Parámetros de entrada.
     * @param {number} options.subproyectoId - ID del subproyecto a procesar.
     * @param {string} options.proyectoNombre - Nombre del proyecto (usado para nombrar archivos).
     * @param {Array<Object>} options.graficosConfig - Configuración de los gráficos (ejes y agrupaciones de compuestos).
     * @param {Array<Object>} options.gruposConfig - Configuración de los grupos de pozos (nombre del grupo, pozos incluidos).
     *
     * @returns {Promise<{
     *   status: 'Ok' | 'Warn' | 'Fail',
     *   log: Array<{
     *     pozoId: number,
     *     pozo: string,
     *     graficoId: number,
     *     graficoNombre: string,
     *     section: number,
     *     CP: string,
     *     chartName: string,
     *     pngPath: string,
     *     status: 'Ok' | 'Warn' | 'Fail',
     *     cpIdsFailed?: number[] // IDs de compuestos que fallaron al generar el gráfico
     *   }>,
     *   createdFiles: Array<{
     *     id: number,
     *     path: string,
     *     file: string,
     *     zipName: string,
     *     type: string
     *   }>
     * }>} - Resultado de la generación, incluyendo logs y rutas de archivos generados.
     *
     * @throws {Error} - Lanza un error si no se encuentran datos o si ocurre alguna falla durante el proceso.
    */
    static async createAnexoEvolucionCDI ({ subproyectoId, proyectoNombre, graficosConfig, gruposConfig }) {
        const uniquePozos = [...new Set(gruposConfig.flatMap(g => g.pozos))];
        const uniqueCompuestos = [...new Set(graficosConfig.flatMap(g => [...g.eje1, ...g.eje2]))];

        // * Obtener datos
        const { rangoFechas, measurements } = await getPlainData(subproyectoId, uniquePozos, uniqueCompuestos);
        if (measurements.length === 0) throw stdErrorMsg(400, '[createAnexo - getPlainData] No se encontraron datos para los pozos/compuestos seleccionados');

        // * Crear tabla en excel
        const { basePath, imagesPath } = evolucionCDIService.asegurarDirectorios();
        const { indexByPozo, indexByCompuesto, excelFile } = await createWellTables(proyectoNombre, gruposConfig, measurements, basePath);
        const createdFiles = [excelFile];

        // * Generar graficos en excel
        const workbookPath = path.resolve(excelFile.path, excelFile.file);
        const result = generateGraphs(indexByPozo, indexByCompuesto, gruposConfig, graficosConfig, workbookPath, imagesPath, subproyectoId);

        // * Generar word con el Anexo
        if (result.status !== 'Fail') {
            createdFiles.push(await createReport(result.log, createdFiles[0].path, proyectoNombre, rangoFechas));
        }

        result.createdFiles = createdFiles;
        return result;
    }

    static asegurarDirectorios () {
        process.loadEnvFile();
        const basePath = process.env.EVOLUCIONCDI_PATH;

        const imagesPath = path.join(basePath, 'images');

        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        if (!fs.existsSync(imagesPath)) {
            fs.mkdirSync(imagesPath, { recursive: true });
        }

        return { basePath, imagesPath };
    }

    /**
     * Servicio minimo para obtener el path completo, se separo del controller por si en el futuro la logica de busqueda
     * se realiza sobre las tablas del sistema y para seguir la estructura r/c/s
     * @param {string} nombreArchivo (sin path) - En el futuro podria venir un Id de cadena o evento para buscar en la cadena o en el evento el nombre
     * @returns nombre completo (path+nombre) o error si el archivo no existe
     */
    static async getFilePath (nombreArchivo) {
        const basePath = process.env.EVOLUCIONCDI_PATH;
        const filePath = path.join(basePath, nombreArchivo);

        try {
            await fs.promises.access(filePath);
            return filePath;
        } catch {
            const error = new Error(`No se encuentra el archivo ${nombreArchivo} en el directorio correspondiente`);
            error.status = 404;
            throw error;
        }
    }
}
