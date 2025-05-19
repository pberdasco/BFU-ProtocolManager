import { xlChartType, xlAxisType, xlAxisGroup, xlMarkerStyle, xlLegendPosition, XlDisplayBlanksAs, xlLineStyle } from './excelConstants.js';
import { stdErrorMsg } from '../../../utils/stdError.js';
import logger from '../../../utils/logger.js';
import path from 'path';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { release, Object: ActiveXObject } = require('winax');

const GRAPH_WIDTH = 500; // Se necesita Ratio 2:1, para que vaya bien en el anexo.
const GRAPH_HEIGHT = 250;
const ALTO_FILA_EN_PX = 13.8;
const TOP_PADDING = 20;
const LEFT_PADDING = 20;

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
                                    graphName: graficoConfig.nombre,
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

function generatePeriodicDates (start, end, points = 10) {
    const dates = [];
    const diff = end - start;
    for (let i = 0; i <= points; i++) {
        dates.push(new Date(start.getTime() + (diff * i) / points));
    }
    return dates;
}

function addScatterChart ({ sheet, sheetName, graphName, chartName, eje1Cols, eje1CpIds, eje2Cols, eje2CpIds, fechaInicio, fechaFin, filaInicio, filaFin, left, top, width, height }) {
    const FILA_UM = 3; // Asumiendo que esta constante está definida o es conocida
    let chartObj, chart, categoryAxis, primaryAxis, secondaryAxis;
    let datoUm1, datoUm2; // Para los ranges de UM, usando nombres diferentes para evitar confusión con variables globales si existieran
    const internallyFailedCpIds = [];

    try {
        chartObj = sheet.ChartObjects().Add(left, top, width, height);
        chartObj.Name = chartName;
        chart = chartObj.Chart; // Acceso como propiedad si así estaba originalmente y funcionaba

        chart.ChartType = xlChartType.xlXYScatterLines;
        chart.DisplayBlanksAs = XlDisplayBlanksAs.xlInterpolated;

        const fechas = generatePeriodicDates(fechaInicio, fechaFin);
        const fechasExcel = fechas.map(fecha => excelDateFromJSDate(fecha));

        eje1Cols.forEach((col, index) => {
            try {
                // Asumimos que eje1CpIds[index] existe y es el cpId correcto
                addSeries(chart, sheet, col, filaInicio, filaFin, fechasExcel, xlAxisGroup.xlPrimary, index, eje1CpIds[index]);
            } catch (error) {
                logger.warn(`[addScatterChart] - Error agregando serie para columna ${col} (cpId: ${eje1CpIds[index]}):`);
                console.error(error.message);
                internallyFailedCpIds.push(eje1CpIds[index]);
            }
        });

        eje2Cols.forEach((col, index) => {
            try {
                // Asumimos que eje2CpIds[index] existe y es el cpId correcto
                addSeries(chart, sheet, col, filaInicio, filaFin, fechasExcel, xlAxisGroup.xlSecondary, eje1Cols.length + index, eje2CpIds[index]);
            } catch (error) {
                logger.warn(`[addScatterChart] - Error agregando serie para columna ${col} (cpId: ${eje2CpIds[index]}):`);
                console.error(error.message);
                internallyFailedCpIds.push(eje2CpIds[index]);
            }
        });

        let um1 = 'Concentración'; // Valor por defecto
        if (eje1Cols[0]) {
            datoUm1 = sheet.Range(`${eje1Cols[0]}${FILA_UM}`);
            um1 = datoUm1.value || um1; // Usando .value (minúscula) como en tu original para esta parte
        }

        let um2 = 'Nivel'; // Valor por defecto
        if (eje2Cols[0]) {
            datoUm2 = sheet.Range(`${eje2Cols[0]}${FILA_UM}`);
            um2 = datoUm2.value || um2; // Usando .value (minúscula)
        }

        // Configuración de títulos y ejes
        try {
            chart.HasTitle = true;
            chart.ChartTitle.Text = sheetName;

            chart.HasLegend = true;
            chart.Legend.Position = xlLegendPosition.xlLegendPositionBottom;
            chart.Legend.IncludeInLayout = true;

            categoryAxis = chart.Axes(xlAxisType.xlCategory);
            categoryAxis.HasTitle = true;
            categoryAxis.AxisTitle.Text = 'Fecha';
            categoryAxis.TickLabels.NumberFormat = 'mm/yyyy';

            const normalize = u => (u || '').toString().toLowerCase().replace(/[\s.]/g, '');
            const um1Norm = normalize(um1);
            const um2Norm = normalize(um2);

            primaryAxis = chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlPrimary);
            primaryAxis.HasTitle = true;
            if (um1Norm === 'm') {
                primaryAxis.AxisTitle.Text = 'Espesor (m)';
            } else if (um1Norm === 'mbbp') {
                primaryAxis.ReversePlotOrder = true;
                primaryAxis.AxisTitle.Text = 'Profundidad (m.b.b.p.)';
            } else {
                primaryAxis.AxisTitle.Text = `Concentración (${um1})`;
            }

            if (eje2Cols.length > 0) {
                secondaryAxis = chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlSecondary);
                secondaryAxis.HasTitle = true;
                if (um2Norm === 'm') {
                    secondaryAxis.AxisTitle.Text = 'Espesor (m)';
                } else if (um2Norm === 'mbbp') {
                    secondaryAxis.ReversePlotOrder = true;
                    secondaryAxis.AxisTitle.Text = 'Profundidad (m.b.b.p.)';
                } else {
                    secondaryAxis.AxisTitle.Text = `Concentración (${um2})`;
                }
            }
        } catch (axisError) {
            logger.error(`[addScatterChart] - Error configurando títulos de ejes ${axisError.message}`);
            console.error(axisError);
            throw axisError; // Re-lanzar para que el catch principal de addScatterChart lo maneje
        }
    } catch (error) {
        logger.error(`[addScatterChart] - Error creando o configurando el gráfico '${chartName}`);
        console.error(error);
        throw error;
    } finally {
        if (datoUm1) release(datoUm1);
        if (datoUm2) release(datoUm2);
        if (secondaryAxis) release(secondaryAxis);
        if (primaryAxis) release(primaryAxis);
        if (categoryAxis) release(categoryAxis);
        if (chart) release(chart);
        // if (chartObj) release(chartObj);
    }
    return { chartObj, internallyFailedCpIds };
}

// Función que convierte fechas de JavaScript a formato Excel (número de serie)
function excelDateFromJSDate (date) {
    const epoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = (date - epoch) / msPerDay;
    return dayDiff;
}

function addSeries (chart, sheet, column, rowStart, rowEnd, xValues, axisGroup, seriesIndex, cpId) {
    const FILA_TITULOS = 2;
    let series, headerCell;
    try {
        series = chart.SeriesCollection().NewSeries();
        headerCell = sheet.Range(`${column}${FILA_TITULOS}`);
        series.Name = headerCell.Value;

        // ? Importante: Hay que usar el método específico Formula para asignar los valores
        // ? =SERIES(nombre_serie, valores_x, valores_y, trazado) -trazado es el orden de la serie en el grafico-
        // ? ⚠ Importante: en gráficos tipo scatter (xlXYScatter), el eje X es de valores (no categórico).
        // ? Por eso, los valores de fecha deben pasarse como números de serie de Excel en el segundo argumento de la fórmula.
        // ? En este caso se insertan como una constante (de fechas serializadas en formato Excel) en línea: {xValues.join(',')}.
        series.Formula = `=SERIES(${sheet.Name}!$${column}$${FILA_TITULOS},{${xValues.join(',')}},${sheet.Name}!$${column}$${rowStart}:$${column}$${rowEnd},${seriesIndex + 1})`;
        series.AxisGroup = axisGroup;
        series.MarkerStyle = xlMarkerStyle.xlMarkerStyleCircle;
        series.MarkerSize = 6;
        series.Format.Line.Weight = 1.5;

        if (cpId === -1) {
            series.Format.Line.DashStyle = xlLineStyle.xlDash;
            series.Format.Line.ForeColor.RGB = 0x00FF0000; // Azul (BGR)
            series.MarkerStyle = xlMarkerStyle.xlMarkerStyleTriangle;
            series.MarkerForegroundColor = 0x00FF0000;
            series.MarkerBackgroundColor = 0x00FF0000;
        } else if (cpId === -2) {
            series.Format.Line.DashStyle = xlLineStyle.xlContinuous;
            series.Format.Line.ForeColor.RGB = 0x000000FF; // Rojo (BGR)
            series.MarkerStyle = xlMarkerStyle.xlMarkerStyleSquare;
            series.MarkerForegroundColor = 0x000000FF;
            series.MarkerBackgroundColor = 0x000000FF;
        }
    } catch (error) {
        logger.error(`[generateGraphs] Error en addSeries para columna ${column}:`);
        console.error(error);
        throw error;
    } finally {
        if (headerCell) release(headerCell);
        if (series) release(series);
    }
}

// ⚠️ Sobre Winax y la liberación de objetos COM:
// ⚠️ Este módulo contiene varios bloques `finally` que en otro contexto parecerían redundantes.
// ⚠️ Son necesarios para liberar correctamente objetos COM como: `excel`, `workbook`, `sheet`, `range`, `chart`, `axis`, etc.
// ⚠️ Especial atención con `Range`, que debe liberarse justo después de acceder a `.Value`.
