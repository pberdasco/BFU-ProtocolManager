import { xlChartType, xlAxisType, xlAxisGroup, xlMarkerStyle, xlLegendPosition } from './excelConstants.js';
import { stdErrorMsg } from '../stdError.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Object: ActiveXObject } = require('winax');

const GRAPH_WIDTH = 400;
const GRAPH_HEIGHT = 250;
const ALTO_FILA_EN_PX = 13.8;
const TOP_PADDING = 20;
const LEFT_PADDING = 20;

export function generateGraphs (indexByWell, indexByCompound, grupos, graficosConfig, workbookPath) {
    try {
        const excel = openExcel();
        const workbook = openWorkbook(excel, workbookPath);

        const sheetNamesById = indexByCompound.reduce((map, { pozoId, pozo }) => {
            map[pozoId] = pozo;
            return map;
        }, {});

        grupos.forEach((grupo, gIdx) => {
            grupo.pozos.forEach(pozoId => {
                console.log(`Procesando grupo ${gIdx} pozo ${pozoId}`);

                const sheetName = getSheetName(pozoId, sheetNamesById);
                const sheet = workbook.Sheets(sheetName);
                const wellIndex = lookupWellIndex(sheetName, indexByWell);
                const compoundMap = buildCompoundMap(pozoId, indexByCompound);

                grupo.graficos.forEach((grafId, idx) => {
                    const config = lookupGraficoConfig(grafId, graficosConfig);

                    // mapeamos cada cpId a su columna, validando existencia
                    const eje1Cols = config.eje1.map(cpId => {
                        const col = compoundMap[cpId];
                        if (!col) throw stdErrorMsg(400, `[generateExcel] Sin columna para el compuestoId=${cpId} en pozo=${pozoId}, eje 1.`);
                        return col;
                    });
                    const eje2Cols = config.eje2.map(cpId => {
                        const col = compoundMap[cpId];
                        if (!col) throw stdErrorMsg(400, `[generateExcel] Sin columna para el compuestoId=${cpId} en pozo=${pozoId}, eje 2.`);
                        return col;
                    });

                    const grafico = graficosConfig.find(x => grafId === x.id);
                    const chartName = `${sheetName} ${grafico.nombre}`;
                    const pos = calculateChartPosition(idx, wellIndex.filaFin);
                    addScatterChart({
                        excel,
                        sheet,
                        chartName,
                        eje1Cols,
                        eje2Cols,
                        fechaInicio: new Date(wellIndex.fechaInicio),
                        fechaFin: new Date(wellIndex.fechaFin),
                        filaInicio: wellIndex.filaInicio,
                        filaFin: wellIndex.filaFin,
                        left: pos.left,
                        top: pos.top,
                        width: GRAPH_WIDTH,
                        height: GRAPH_HEIGHT
                    });
                });
            });
        });

        saveAndClose(workbook, excel);
        return true;
    } catch (error) {
        throw stdErrorMsg(error.status, error.message || '[evolucionCDI] generateExcel error');
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
    workbook.Close(false);
    excel.Quit();
}

function getSheetName (pozoId, sheetNamesById) {
    const name = sheetNamesById[pozoId];
    if (!name) {
        throw stdErrorMsg(400, `[evolucionCDI] No se encontró nombre de hoja para pozoId=${pozoId}`);
    }
    return name;
}

function lookupWellIndex (sheetName, indexByWell) {
    return indexByWell.find(w => w.pozo === sheetName);
}

function lookupGraficoConfig (id, graficosConfig) {
    return graficosConfig.find(g => g.id === id);
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

function addScatterChart ({ excel, sheet, chartName, eje1Cols, eje2Cols, fechaInicio, fechaFin, filaInicio, filaFin, left, top, width, height }) {
    const FILA_UM = 3;
    // Crear un objeto ChartObject
    const chartObj = sheet.ChartObjects().Add(left, top, width, height);
    chartObj.Name = chartName;

    // Obtener el gráfico del objeto
    const chart = chartObj.Chart;

    // Establecer el tipo de gráfico
    chart.ChartType = xlChartType.xlXYScatterLines;

    // Generar las fechas periódicas para el eje X y convertirlas a formato excel (nro de serie)
    const fechas = generatePeriodicDates(fechaInicio, fechaFin);
    const fechasExcel = fechas.map(fecha => {
        return excelDateFromJSDate(fecha);
    });

    // Agregar series para el eje primario
    eje1Cols.forEach((col, index) => {
        try {
            addSeries(excel, chart, sheet, col, filaInicio, filaFin, fechasExcel, xlAxisGroup.xlPrimary, index);
        } catch (error) {
            console.error(`[evolucionCDI] - Error agregando serie para columna ${col}:`, error);
            throw stdErrorMsg(400, `[evolucionCDI] Error agregando serie para columna ${col}`);
        }
    });

    // Agregar series para el eje secundario
    eje2Cols.forEach((col, index) => {
        try {
            addSeries(excel, chart, sheet, col, filaInicio, filaFin, fechasExcel, xlAxisGroup.xlSecondary, eje1Cols.length + index);
        } catch (error) {
            console.error(`[evolucionCDI] - Error agregando serie para columna ${col}:`, error);
            throw stdErrorMsg(400, `[evolucionCDI] Error agregando serie para columna ${col}`);
        }
    });

    const um1 = eje1Cols[0] ? sheet.Range(`${eje1Cols[0]}${FILA_UM}`).Value : 'Concentración';
    const um2 = eje2Cols[0] ? sheet.Range(`${eje2Cols[0]}${FILA_UM}`).Value : 'Nivel';

    // Configurar títulos de ejes
    try {
        chart.HasTitle = true;
        chart.ChartTitle.Text = chartName;

        chart.HasLegend = true;
        chart.Legend.Position = xlLegendPosition.xlLegendPositionBottom;
        chart.Legend.IncludeInLayout = true; // Leyenda en varias filas

        const categoryAxis = chart.Axes(xlAxisType.xlCategory);
        categoryAxis.HasTitle = true;
        categoryAxis.AxisTitle.Text = 'Fecha';
        categoryAxis.TickLabels.NumberFormat = 'mm/yyyy';

        const primaryAxis = chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlPrimary);
        primaryAxis.HasTitle = true;
        primaryAxis.AxisTitle.Text = um1;

        if (eje2Cols.length > 0) {
            const secondaryAxis = chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlSecondary);
            secondaryAxis.HasTitle = true;
            secondaryAxis.AxisTitle.Text = um2;
        }
    } catch (error) {
        console.error('[evolucionCDI] - Error configurando títulos de ejes:', error);
        throw stdErrorMsg(500, '[evolucionCDI] Error configurando títulos de ejes');
    }
}

// Función que convierte fechas de JavaScript a formato Excel (número de serie)
function excelDateFromJSDate (date) {
    const epoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = (date - epoch) / msPerDay;
    return dayDiff;
}

function addSeries (excel, chart, sheet, column, rowStart, rowEnd, xValues, axisGroup, seriesIndex) {
    const FILA_TITULOS = 2;
    try {
        // Añadir una nueva serie
        const series = chart.SeriesCollection().NewSeries();

        // Obtener el nombre de la serie desde la cabecera
        const headerCell = sheet.Range(`${column}${FILA_TITULOS}`);
        series.Name = headerCell.Value;

        // Importante: Hay que usar el método específico Formula para asignar los valores
        series.Formula = `=SERIES(${sheet.Name}!$${column}$${FILA_TITULOS},{${xValues.join(',')}},${sheet.Name}!$${column}$${rowStart}:$${column}$${rowEnd},${seriesIndex + 1})`;

        // Establecer el grupo de ejes (primario o secundario)
        series.AxisGroup = axisGroup;

        // Personalizar la apariencia de la serie
        series.MarkerStyle = xlMarkerStyle.xlMarkerStyleCircle;
        series.MarkerSize = 6;
        series.Format.Line.Weight = 1.5;

        return series;
    } catch (error) {
        console.error(`Error en addSeriesCorrectly para columna ${column}:`, error);
        throw error;
    }
}
