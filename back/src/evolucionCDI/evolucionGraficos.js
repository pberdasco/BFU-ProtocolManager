// add_charts.js
// Node.js + Winax script to add scatter-with-lines charts to each well sheet
// Using Single Responsibility functions (ES6)
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Object: ActiveXObject } = require('winax');

// Configuration (fill mapping of pozoId to sheet name if needed)
const workbookPath = path.resolve(process.cwd(), 'output.xlsx');

// Indices loaded or imported
const indexByWell = [
    { pozo: 'PM1', fechaInicio: '2015-12-05T03:00:00.000Z', filaInicio: 4, fechaFin: '2024-12-05T03:00:00.000Z', filaFin: 18 },
    { pozo: 'PM2', fechaInicio: '2015-12-05T03:00:00.000Z', filaInicio: 4, fechaFin: '2024-12-05T03:00:00.000Z', filaFin: 18 },
    { pozo: 'PM3', fechaInicio: '2015-12-05T03:00:00.000Z', filaInicio: 4, fechaFin: '2024-12-05T03:00:00.000Z', filaFin: 18 },
    { pozo: 'PM4', fechaInicio: '2015-12-05T03:00:00.000Z', filaInicio: 4, fechaFin: '2024-12-05T03:00:00.000Z', filaFin: 18 },
    { pozo: 'PM6', fechaInicio: '2015-12-05T03:00:00.000Z', filaInicio: 4, fechaFin: '2024-12-05T03:00:00.000Z', filaFin: 18 }
];
const indexByCompound = [
    { pozoId: 30, pozo: 'PM1', compuestoId: 1, compuesto: 'HTP', columna: 'B' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 26, compuesto: 'Benceno', columna: 'C' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 27, compuesto: 'Tolueno', columna: 'D' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 28, compuesto: 'Etilbenceno', columna: 'E' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 29, compuesto: 'Xilenos', columna: 'F' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 40, compuesto: 'Naftaleno', columna: 'G' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 41, compuesto: 'Fenantreno', columna: 'H' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 42, compuesto: 'Fluoreno', columna: 'I' },
    { pozoId: 30, pozo: 'PM1', compuestoId: 43, compuesto: 'MTBE', columna: 'J' },
    { pozoId: 30, pozo: 'PM1', compuestoId: -1, compuesto: 'Nivel freático', columna: 'K' },
    { pozoId: 30, pozo: 'PM1', compuestoId: -2, compuesto: 'FLNA', columna: 'L' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 1, compuesto: 'HTP', columna: 'B' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 26, compuesto: 'Benceno', columna: 'C' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 27, compuesto: 'Tolueno', columna: 'D' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 28, compuesto: 'Etilbenceno', columna: 'E' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 29, compuesto: 'Xilenos', columna: 'F' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 40, compuesto: 'Naftaleno', columna: 'G' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 41, compuesto: 'Fenantreno', columna: 'H' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 42, compuesto: 'Fluoreno', columna: 'I' },
    { pozoId: 31, pozo: 'PM2', compuestoId: 43, compuesto: 'MTBE', columna: 'J' },
    { pozoId: 31, pozo: 'PM2', compuestoId: -1, compuesto: 'Nivel freático', columna: 'K' },
    { pozoId: 31, pozo: 'PM2', compuestoId: -2, compuesto: 'FLNA', columna: 'L' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 1, compuesto: 'HTP', columna: 'B' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 26, compuesto: 'Benceno', columna: 'C' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 27, compuesto: 'Tolueno', columna: 'D' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 28, compuesto: 'Etilbenceno', columna: 'E' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 29, compuesto: 'Xilenos', columna: 'F' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 40, compuesto: 'Naftaleno', columna: 'G' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 41, compuesto: 'Fenantreno', columna: 'H' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 42, compuesto: 'Fluoreno', columna: 'I' },
    { pozoId: 35, pozo: 'PM5', compuestoId: 43, compuesto: 'MTBE', columna: 'J' },
    { pozoId: 35, pozo: 'PM5', compuestoId: -1, compuesto: 'Nivel freático', columna: 'K' },
    { pozoId: 35, pozo: 'PM5', compuestoId: -2, compuesto: 'FLNA', columna: 'L' }

];

const grupos = [
    { id: 1, nombre: 'Gr1', pozos: [30, 31], graficos: [1] },
    { id: 7, nombre: 'Gr2', pozos: [35], graficos: [4] }
];

const graficosConfig = [
    { id: 1, nombre: 'NP-BTEX', eje1: [26, 27, 28, 29], eje2: [-1] },
    { id: 4, nombre: 'Grafico8 01234567890', eje1: [2, 3], eje2: [1] }
];

// Excel constants
const xlChartType = {
    xlXYScatterLines: -4169
};
const xlAxisType = {
    xlCategory: 1,
    xlValue: 2
};
const xlAxisGroup = {
    xlPrimary: 1,
    xlSecondary: 2
};

// Entry point
function run () {
    const excel = openExcel();
    const workbook = openWorkbook(excel, workbookPath);

    const sheetNamesById = indexByCompound.reduce((map, { pozoId, pozo }) => {
        map[pozoId] = pozo;
        return map;
    }, {});

    grupos.forEach(grupo => {
        grupo.pozos.forEach(pozoId => {
            const sheetName = getSheetName(pozoId, sheetNamesById);
            const sheet = workbook.Sheets[sheetName];
            const wellIndex = lookupWellIndex(sheetName);
            const compoundMap = buildCompoundMap(pozoId);

            console.log('[lookups]:', wellIndex, compoundMap);

            grupo.graficos.forEach((grafId, idx) => {
                const config = lookupGraficoConfig(grafId);

                // mapeamos cada cpId a su columna, validando existencia
                const eje1Cols = config.eje1.map(cpId => {
                    const col = compoundMap[cpId];
                    if (!col) throw new Error(`No column para cpId=${cpId} en pozo=${pozoId}`);
                    return col;
                });
                const eje2Cols = config.eje2
                    .map(cpId => {
                        const col = compoundMap[cpId];
                        if (!col) throw new Error(`No column para cpId=${cpId} en pozo=${pozoId}`);
                        return col;
                    });
                console.log('[graficosConfig]: ', config, eje1Cols, eje2Cols);

                const chartName = `Chart_${sheetName}_${grupo.id}_${grafId}`;
                const pos = calculateChartPosition(idx);
                addScatterChart({
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
                    width: 400,
                    height: 250
                });
            });
        });
    });

    saveAndClose(workbook, excel);
}

// Single Responsibility Functions

function buildCompoundMap (pozoId) { // ej: acc = {29: 'L', 30: 'P'}
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
        throw new Error(`No se encontró nombre de hoja para pozoId=${pozoId}`);
    }
    return name;
}

function lookupWellIndex (sheetName) {
    return indexByWell.find(w => w.pozo === sheetName);
}

function lookupGraficoConfig (id) {
    return graficosConfig.find(g => g.id === id);
}

function calculateChartPosition (chartIndex) {
    const padding = 20;
    const top = padding + chartIndex * 300;
    const left = padding;
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

function addScatterChart ({ sheet, chartName, eje1Cols, eje2Cols, fechaInicio, fechaFin, filaInicio, filaFin, left, top, width, height }) {
    const charts = sheet.ChartObjects();
    const chartObj = charts.Add(left, top, width, height);
    const chart = chartObj.Chart;
    chart.ChartType = xlChartType.xlXYScatterLines;

    const categories = generatePeriodicDates(fechaInicio, fechaFin);

    // Add series for eje1 (primary)
    eje1Cols.forEach(col => addSeries(chart, sheet, col, filaInicio, filaFin, categories, xlAxisGroup.xlPrimary));
    // Add series for eje2 (secondary)
    eje2Cols.forEach(col => addSeries(chart, sheet, col, filaInicio, filaFin, categories, xlAxisGroup.xlSecondary));

    // Configure axis titles
    chart.Axes(xlAxisType.xlCategory).HasTitle = true;
    chart.Axes(xlAxisType.xlCategory).AxisTitle.Text = 'Time Period';
    chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlPrimary).HasTitle = true;
    chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlPrimary).AxisTitle.Text = 'Concentration';
    chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlSecondary).HasTitle = true;
    chart.Axes(xlAxisType.xlValue, xlAxisGroup.xlSecondary).AxisTitle.Text = 'Concentration (Secondary)';
}

function addSeries (chart, sheet, column, rowStart, rowEnd, categories, axisGroup) {
    console.log('[addSeries]: ', `${column}${rowStart}:${column}${rowEnd}`);

    const series = chart.SeriesCollection().NewSeries();
    series.Values = sheet.Range(`${column}${rowStart}:${column}${rowEnd}`);
    series.XValues = categories;
    series.AxisGroup = axisGroup;
    series.Name = sheet.Range(`${column}1`).Value; // header as series name
}

// Run the process
run();
