import fs from 'node:fs';
import path from 'path';
import { getPlainData } from './getPlainData.js';
import { createWellTables } from './createWellTables.js';
import { generateGraphs } from './generateGraphs.js';

export default class evolucionCDIService {
    static async createExcel ({ subproyectoId, proyectoNombre, graficosConfig, gruposConfig }) {
        const uniquePozos = [...new Set(gruposConfig.flatMap(g => g.pozos))];
        const uniqueCompuestos = [...new Set(graficosConfig.flatMap(g => [...g.eje1, ...g.eje2]))];
        const measurements = await getPlainData(subproyectoId, uniquePozos, uniqueCompuestos);

        const { basePath, imagesPath } = evolucionCDIService.asegurarDirectorios();
        const { indexByPozo, indexByCompuesto, createdFile } = await createWellTables(proyectoNombre, gruposConfig, measurements, basePath);

        const workbookPath = path.resolve(createdFile.path, createdFile.file);
        const result = generateGraphs(indexByPozo, indexByCompuesto, gruposConfig, graficosConfig, workbookPath, imagesPath);
        result.createdFile = createdFile;
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
