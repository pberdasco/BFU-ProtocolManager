import { addScatterChart } from './scatterFactory.js';
import { stdErrorMsg } from '../../../../utils/stdError.js';
import logger from '../../../../utils/logger.js';
import { GRAPH_HEIGHT, GRAPH_WIDTH, ALTO_FILA_EN_PX, TOP_PADDING, LEFT_PADDING } from './layoutConstants.js';
import path from 'path';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { release, Object: ActiveXObject } = require('winax');

/**
 * Genera gráficos de dispersión en un libro de Excel para los pozos agrupados,
 * exporta cada uno como PNG y devuelve un resumen de estado.
 *
 * @param {Array<{ pozo: string, filaInicio: number, filaFin: number, fechaInicio: Date, fechaFin: Date }>} indexByWell
 * @param {Array<{ pozoId: number, compuestoId: number, columna: string }>} indexByCompound
 * @param {Array<{ pozos: number[], graficos: number[] }>} grupos
 * @param {Array<{ id: number, nombre: string, eje1: number[], eje2: number[], seccion: number, anexoNombre: string }>} graficosConfig
 * @param {string} workbookPath  Ruta al archivo .xlsx de trabajo
 * @param {string} imagesPath    Carpeta donde se guardarán los PNG
 * @param {number} subproyectoId ID del subproyecto (solo para nombrar el chart)
 * @returns {{
 *   status: 'Ok'|'Warn'|'Fail',
 *   log: Array<{
 *     pozoId: number,
 *     pozo: string,
 *     graficoId: number,
 *     graficoNombre: string,
 *     section: number,
 *     CP: string,
 *     chartName: string,
 *     pngPath: string,
 *     status: 'Ok'|'Warn'|'Fail',
 *     cpIdsFailed?: number[] -compuestos que no se pudieron generar en el grafico/pozo
 *   }>
 * }} Objeto con el estado global de la operación y un array de entradas detalladas para cada gráfico.
 */
export function generateGraphs (indexByWell, indexByCompound, grupos, graficosConfig, workbookPath, imagesPath, subproyectoId) {
    let excel;
    let workbook;
    const log = [];

    try {
        excel = openExcel();
        workbook = openWorkbook(excel, workbookPath);

        const sheetNamesById = indexByCompound.reduce((map, { pozoId, pozo }) => {
            map[pozoId] = pozo;
            return map;
        }, {});

        let totalGraphsAttempted = 0;
        // let graphsSuccessfullyCreated = 0;
        let graphsWithWarnings = 0;
        let graphsFailed = 0;

        grupos.forEach((grupo, gIdx) => {
            grupo.pozos.forEach(pozoId => {
                console.log(`Procesando grupo ${gIdx} pozo ${pozoId}`);
                const sheetName = getSheetName(pozoId, sheetNamesById);
                let sheet = null;
                let chartObj = null;
                try {
                    sheet = workbook.Sheets(sheetName);
                    const wellIndex = lookupWellIndex(sheetName, indexByWell);
                    const compoundMap = buildCompoundMap(pozoId, indexByCompound);

                    grupo.graficos.forEach((grafId, idx) => {
                        totalGraphsAttempted++;
                        const graficoConfig = lookupGraficoConfig(grafId, graficosConfig);
                        const chartName = `${sheetName}-${graficoConfig.nombre}-${subproyectoId}`; // ver que sea igual que en addScatterChart
                        const currentGraphLogEntry = {
                            pozoId,
                            pozo: sheetName,
                            graficoId: graficoConfig.id,
                            graficoNombre: graficoConfig.nombre,
                            section: graficoConfig.seccion,
                            CP: graficoConfig.anexoNombre,
                            chartName,
                            pngPath: '',
                            status: '' // Se determinará a continuación
                            // cpIdsFailed será añadido solo si status es 'Warn'
                        };
                        const missingCompoundsForThisGraph = [];

                        const eje1Data = graficoConfig.eje1.reduce((arr, cpId) => {
                            const col = compoundMap[cpId];
                            if (!col) {
                                missingCompoundsForThisGraph.push(cpId);
                            } else {
                                arr.push({ cpId, col });
                            }
                            return arr;
                        }, []);

                        const eje2Data = graficoConfig.eje2.reduce((arr, cpId) => {
                            const col = compoundMap[cpId];
                            if (!col) {
                                missingCompoundsForThisGraph.push(cpId);
                            } else {
                                arr.push({ cpId, col });
                            }
                            return arr;
                        }, []);

                        // Extraer arrays paralelos
                        const eje1Cols = eje1Data.map(item => item.col);
                        const eje1CpIds = eje1Data.map(item => item.cpId);
                        const eje2Cols = eje2Data.map(item => item.col);
                        const eje2CpIds = eje2Data.map(item => item.cpId);

                        if (eje1Cols.length === 0 && eje2Cols.length === 0) {
                            currentGraphLogEntry.status = 'Fail';
                            // Opcional: añadir un mensaje específico si se desea
                            // currentGraphLogEntry.mensaje = `No se encontraron datos para compuestos en pozo=${pozoId} para gráfico ${graficoConfig.nombre}.`;
                            graphsFailed++;
                        } else {
                            const pos = calculateChartPosition(idx, wellIndex.filaFin);
                            try {
                                const { chartObj: co, internallyFailedCpIds } = addScatterChart({
                                    sheet,
                                    sheetName,
                                    release,
                                    chartName,
                                    eje1Cols,
                                    eje1CpIds,
                                    eje2Cols,
                                    eje2CpIds,
                                    fechaInicio: new Date(wellIndex.fechaInicio),
                                    fechaFin: new Date(wellIndex.fechaFin),
                                    filaInicio: wellIndex.filaInicio,
                                    filaFin: wellIndex.filaFin,
                                    left: pos.left,
                                    top: pos.top,
                                    width: GRAPH_WIDTH,
                                    height: GRAPH_HEIGHT
                                });
                                const allProblematicCpIds = [...new Set([
                                    ...missingCompoundsForThisGraph,
                                    ...(internallyFailedCpIds || [])
                                ])];

                                // Grabar la imagen en disco
                                const pngName = `${chartName.replace(/[/\\:?<>|"]/g, '_')}.png`;
                                const pngPath = path.join(imagesPath, pngName);
                                chartObj = co; // asigna a una variable de fuera del try para que sea alcanzable en el finally
                                chartObj.Chart.Export(pngPath, 'PNG');
                                currentGraphLogEntry.pngPath = pngPath;

                                if (allProblematicCpIds.length > 0) {
                                    currentGraphLogEntry.status = 'Warn';
                                    currentGraphLogEntry.cpIdsFailed = allProblematicCpIds;
                                    graphsWithWarnings++;
                                } else {
                                    currentGraphLogEntry.status = 'Ok';
                                }
                            } catch (chartError) {
                                logger.warn(`[generateGraphs] - Error creando gráfico ${graficoConfig.nombre} en pozo ${pozoId}: ${chartError.message}:`);
                                console.error(chartError.message);
                                currentGraphLogEntry.status = 'Fail';
                                graphsFailed++;
                            }
                        }
                        log.push(currentGraphLogEntry);
                    });
                } finally {
                    if (sheet) release(sheet);
                    if (chartObj) release(chartObj);
                }
            });
        });

        let overallStatus = 'Ok';
        if (totalGraphsAttempted > 0) {
            if (graphsFailed === totalGraphsAttempted) {
                overallStatus = 'Fail';
            } else if (graphsFailed > 0 || graphsWithWarnings > 0) {
                overallStatus = 'Warn';
            } else { // .Todos Ok (graphsSuccessfullyCreated === totalGraphsAttempted)
                overallStatus = 'Ok';
            }
        } else { // No se intentó crear ningún gráfico (ej: grupos o graficosConfig vacío)
            overallStatus = 'Ok';
        }

        saveAndClose(workbook, excel);
        return {
            status: overallStatus,
            log
        };
    } catch (error) {
        throw stdErrorMsg(error.status, error.message || '[evolucionCDI] generateGraphs error');
    } finally {
        try {
            // Intentar liberar recursos incluso si hubo error
            if (workbook && typeof workbook.Close === 'function') workbook.Close(false);
            if (excel && typeof excel.Quit === 'function') excel.Quit();

            if (workbook) release(workbook);
            if (excel) release(excel);

            // Forzar GC si está disponible
            workbook = null;
            excel = null;

            if (typeof global.gc === 'function') {
                global.gc();
            } else {
                logger.error('[generateGraphs] GC no expuesto; correr Node con --expose-gc para limpiar objetos COM');
            }
        } catch (cleanupError) {
            logger.error('[generateGraphs] Error durante cleanup en generateGraphs');
            console.error(cleanupError);
        }
    }
}

function buildCompoundMap (pozoId, indexByCompound) { // ej: acc = {29: 'L', 30: 'P'}
    return indexByCompound
        .filter(entry => entry.pozoId === pozoId)
        .reduce((acc, { compuestoId, columna }) => {
            acc[compuestoId] = columna;
            return acc;
        }, {});
}

function openExcel () {
    const excel = new ActiveXObject('Excel.Application');
    excel.Visible = true;
    return excel;
}

function openWorkbook (excel, filePath) {
    return excel.Workbooks.Open(filePath);
}

function saveAndClose (workbook, excel) {
    workbook.Save();
    logger.info(`Generado el excel ${workbook.Name} con sus graficos`);
    workbook.Close(false);
    excel.Quit();
}

function getSheetName (pozoId, sheetNamesById) {
    const name = sheetNamesById[pozoId];
    if (!name) throw stdErrorMsg(400, `[generateGraphs] No se encontró nombre de hoja para pozoId=${pozoId}`);
    return name;
}

function lookupWellIndex (sheetName, indexByWell) {
    const result = indexByWell.find(w => w.pozo === sheetName);
    if (!result) throw stdErrorMsg(400, `[generateGraphs] No se encontró índice para el pozo con hoja '${sheetName}'`);
    return result;
}

function lookupGraficoConfig (id, graficosConfig) {
    const result = graficosConfig.find(g => g.id === id);
    if (!result) throw stdErrorMsg(400, `[generateGraphs] No se encontró configuración para el gráfico id=${id}`);
    return result;
}

function calculateChartPosition (chartIndex, filaFin) {
    const top = TOP_PADDING + filaFin * ALTO_FILA_EN_PX;
    const left = LEFT_PADDING + chartIndex * (GRAPH_WIDTH + LEFT_PADDING);
    return { top, left };
}

// ⚠️ Sobre Winax y la liberación de objetos COM:
// ⚠️ Este módulo contiene varios bloques `finally` que en otro contexto parecerían redundantes.
// ⚠️ Son necesarios para liberar correctamente objetos COM como: `excel`, `workbook`, `sheet`, `range`, `chart`, `axis`, etc.
// ⚠️ Especial atención con `Range`, que debe liberarse justo después de acceder a `.Value`.
