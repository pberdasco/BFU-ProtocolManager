import { addScatterChart } from './scatterFactory.js';
import { stdErrorMsg } from '../../../../utils/stdError.js';
import logger from '../../../../utils/logger.js';
import { GRAPH_HEIGHT, GRAPH_WIDTH, ALTO_FILA_EN_PX, TOP_PADDING, LEFT_PADDING, BLOCK_SPACING } from './layoutConstants.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { release, Object: ActiveXObject } = require('winax');

/**
 * Genera gráficos de dispersión en un libro de Excel para los pozos agrupados,
 * exporta cada uno como PNG y devuelve un resumen de estado.
 *
 * @param {Array<{ pozo: string, filaInicio: number, filaFin: number, fechaInicio: Date, fechaFin: Date }>} indexByWell
 *      * Indice de pozos con sus filas y rangos de fecha en la hoja.
 * @param {Array<{ pozoId: number, pozo: string, compuestoId: number, compuesto: string, columna: string }>} indexByCompound
 *      * Mapa de compuestos por pozo, indicando qué columna de Excel corresponde.
 * @param {Array<{ pozos: number[], graficos: number[] }>} grupos
 *      * Agrupaciones de pozos y los IDs de gráficos que deben generarse para cada grupo.
 * @param {Array<{ id: number, nombre: string, eje1: number[], eje2: number[], seccion: number, anexoNombre: string }>} graficosConfig
 *      * Configuración detallada de cada tipo de gráfico (series de ejes, sección, nombre de anexo)
 * @param {string} workbookPath  Ruta al archivo .xlsx de trabajo
 * @param {string} imagesPath    Carpeta donde se guardarán los PNG
 * @param {number} subproyectoId ID del subproyecto (solo para nombrar el chart)
 * @returns {{
 *   status: 'Ok'|'Warn'|'Fail' | 'NoData', : Estado general tras procesar todos los gráficos
 *               - 'Ok': todos los gráficos se generaron correctamente (o fueron NoData, sin advertencias).
 *               - 'Warn': se generaron gráficos pero con advertencias (series faltantes o compuestos no graficados).
 *               - 'Fail': todos los gráficos fallaron por errores técnicos o de configuración.
 *               - 'NoData': no se generó ningún gráfico por ausencia total de datos válidos.
 *   log: Array<{
 *     pozoId: number,
 *     pozo: string,
 *     graficoId: number,
 *     graficoNombre: string,
 *     section: number,
 *     CP: string,
 *     chartName: string,
 *     pngPath: string,
 *     status: 'Ok'|'Warn'|'Fail'|'NoData', - Estado individual de este gráfico/pozo:
 *       - 'Ok': el gráfico se generó correctamente sin problemas.
 *       - 'Warn': se generó, pero hubo advertencias:
 *           * compuestos sin columna asignada,
 *           * series que fallaron al agregarse.
 *       - 'Fail': error crítico que impidió generar el gráfico (excepción en Excel o configuración inválida).
 *       - 'NoData': el gráfico no se generó por falta de datos válidos:
 *           * series completamente vacías o debajo del umbral,
 *           * único compuesto FLNA sin datos.
 *     cpIdsFailed?: number[] -compuestos que no se pudieron generar en el grafico/pozo
 *   }>
 * }} Objeto con el estado global de la operación y un array de entradas detalladas para cada gráfico.
 *
 */
export function generateGraphs (indexByWell, indexByCompound, grupos, graficosConfig, workbookPath, imagesPath, subproyectoId, minFechaUsuario = null, maxFechaUsuario = null) {
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

        grupos.forEach((grupo, gIdx) => {
            grupo.pozos.forEach(pozoId => {
                console.log(`Procesando grupo ${gIdx} pozo ${pozoId}`);
                const sheetName = getSheetName(pozoId, sheetNamesById);
                let sheet = null;
                try {
                    sheet = workbook.Sheets(sheetName);
                    const wellIndex = lookupWellIndex(sheetName, indexByWell);
                    const compoundMap = buildCompoundMap(pozoId, indexByCompound);

                    grupo.graficos.forEach((grafId, idx) => {
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

                        // Manejo especial FLNA sólo (compuestoId -2): Si es el unico y esta vacio no genera grafico
                        const flna1 = isFlnaOnlyEmpty(sheet, compoundMap, wellIndex.filaInicio, wellIndex.filaFin, eje1Data.map(item => item.cpId), release);
                        const flna2 = isFlnaOnlyEmpty(sheet, compoundMap, wellIndex.filaInicio, wellIndex.filaFin, eje2Data.map(item => item.cpId), release);
                        if (flna1 || flna2) {
                            currentGraphLogEntry.status = 'NoData';
                            log.push(currentGraphLogEntry);
                            return;
                        }

                        const eje1DataFiltered = eje1Data.filter(item =>
                            !isSeriesEmpty(sheet, item.col, wellIndex.filaInicio, wellIndex.filaFin, release)
                        );

                        // Si no hay series con algun valor no nulo ni nc => no lo graficamos
                        if (eje1DataFiltered.length === 0) {
                            currentGraphLogEntry.status = 'NoData';
                            log.push(currentGraphLogEntry);
                            return;
                        }

                        // Extraer arrays paralelos
                        const eje1Cols = eje1DataFiltered.map(item => item.col);
                        const eje1CpIds = eje1DataFiltered.map(item => item.cpId);
                        const eje2Cols = eje2Data.map(item => item.col);
                        const eje2CpIds = eje2Data.map(item => item.cpId);

                        if (eje1Cols.length === 0 && eje2Cols.length === 0) {
                            currentGraphLogEntry.status = 'Fail';
                        } else {
                            const pos = calculateChartPosition(idx, wellIndex.filaFin, gIdx);
                            try {
                                const { pngPath, internallyFailedCpIds } = addScatterChart({
                                    sheet,
                                    sheetName,
                                    release,
                                    chartName,
                                    eje1Cols,
                                    eje1CpIds,
                                    eje2Cols,
                                    eje2CpIds,
                                    filaInicio: wellIndex.filaInicio,
                                    filaFin: wellIndex.filaFin,
                                    minFechaUsuario,
                                    maxFechaUsuario,
                                    left: pos.left,
                                    top: pos.top,
                                    width: GRAPH_WIDTH,
                                    height: GRAPH_HEIGHT,
                                    imagesPath
                                });

                                currentGraphLogEntry.pngPath = pngPath;

                                const allProblematicCpIds = [...new Set([
                                    ...missingCompoundsForThisGraph,
                                    ...(internallyFailedCpIds || [])
                                ])];
                                if (allProblematicCpIds.length > 0) {
                                    currentGraphLogEntry.status = 'Warn';
                                    currentGraphLogEntry.cpIdsFailed = allProblematicCpIds;
                                } else {
                                    currentGraphLogEntry.status = 'Ok';
                                }
                            } catch (chartError) {
                                logger.warn(`[generateGraphs] - Error creando gráfico ${graficoConfig.nombre} en pozo ${pozoId}: ${chartError.message}:`);
                                console.error(chartError.message);
                                currentGraphLogEntry.status = 'Fail';
                            }
                        }
                        log.push(currentGraphLogEntry);
                    });
                } finally {
                    if (sheet) release(sheet);
                }
            });
        });

        const total = log.length;
        const countOk = log.filter(g => g.status === 'Ok').length;
        const countFail = log.filter(g => g.status === 'Fail').length;
        const countNoData = log.filter(g => g.status === 'NoData').length;

        let overallStatus;
        if (total === 0) {
            overallStatus = 'NoData'; // No se intentó generar ningún gráfico
        } else if (countNoData === total) {
            overallStatus = 'NoData';
        } else if (countFail === total) {
            overallStatus = 'Fail';
        } else if ((countOk + countNoData) === total) {
            overallStatus = 'Ok';
        } else {
            overallStatus = 'Warn'; // hay mezcla (Fail o Warn con Ok o NoData)
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

/**
 * Construye un mapa de compuestos para un pozo, asignando cada compuesto a su columna de Excel.
 *
 * @param {number} pozoId - ID del pozo para el cual se construye el mapa.
 * @param {Array<{pozoId: number, compuestoId: number, columna: string }>} indexByCompound
 *      *  Arreglo que relaciona cada ID de pozo con un ID de compuesto y la letra de columna correspondiente.
 * @returns {Object.<number, string>} - Mapa donde las claves son IDs de compuesto y los valores son las letras de columna en la hoja.
 *      * Ejemplo: `{ 29: 'L', 30: 'P' }`.
 */
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

/**
 * Busca la entrada de índice para un pozo dado en el arreglo `indexByWell`.
 *
 * @param {string} sheetName - Nombre de la hoja de Excel que representa al pozo.
 * @param {Array<{pozo: string, filaInicio: number, filaFin: number, fechaInicio: Date, fechaFin: Date}>} indexByWell
 *      * Arreglo de objetos que mapea nombres de pozos a sus posiciones de fila y rangos de fecha.
 * @returns {{ pozo: string, filaInicio: number, filaFin: number, fechaInicio: Date, fechaFin: Date }}
 *      * Objeto con la información de índice para el pozo especificado.
 * @throws {Error} - Lanza un error con `stdErrorMsg(400, ...)` si no existe una entrada para el pozo.
 */
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

function calculateChartPosition (chartIndex, filaFin, groupIndex) {
    const topBase = TOP_PADDING + filaFin * ALTO_FILA_EN_PX;
    const extraPerGroup = groupIndex * (GRAPH_HEIGHT + BLOCK_SPACING);
    const top = topBase + extraPerGroup;
    const left = LEFT_PADDING + chartIndex * (GRAPH_WIDTH + LEFT_PADDING);
    return { top, left };
}

/**
 * Indica si un gráfico de FLNA puro debe omitirse (todos ceros).
 *
 * @param {object} sheet            Objeto COM de la hoja de Excel.
 * @param {Object<number,string>} compoundMap Mapa de compuestoId → columna.
 * @param {number} rowStart         Fila inicial de datos.
 * @param {number} rowEnd           Fila final de datos.
 * @param {number[]} cpIds          IDs de compuestos para el eje.
 * @param {Function} release        Función para liberar objetos COM.
 * @returns {boolean}               True si es FLNA único y todos sus valores son 0.
*/
function isFlnaOnlyEmpty (sheet, compoundMap, rowStart, rowEnd, cpIds, release) {
    const FLNA = -2;
    if (cpIds.length === 1 && cpIds[0] === FLNA) {
        const col = compoundMap[FLNA];
        for (let r = rowStart; r <= rowEnd; r++) {
            const range = sheet.Range(`${col}${r}`);
            const v = range.Value;
            release(range);
            if (v !== 0) return false; // si hay algun valor distinto de 0 => no omitimos el grafico
        }
        return true;
    }
    return false;
}

/**
 * Devuelve true si TODOS los valores de la columna están nulos o <= NCValue (definido como 0.00001).
 */
function isSeriesEmpty (sheet, col, rowStart, rowEnd, release) {
    const NCValue = 0.00001;
    for (let r = rowStart; r <= rowEnd; r++) {
        const range = sheet.Range(`${col}${r}`);
        const v = range.Value;
        release(range);
        if (v != null && v > NCValue) {
            return false;
        }
    }
    return true;
}

// ⚠️ Sobre Winax y la liberación de objetos COM:
// ⚠️ Este módulo contiene varios bloques `finally` que en otro contexto parecerían redundantes.
// ⚠️ Son necesarios para liberar correctamente objetos COM como: `excel`, `workbook`, `sheet`, `range`, `chart`, `axis`, etc.
// ⚠️ Especial atención con `Range`, que debe liberarse justo después de acceder a `.Value`.
