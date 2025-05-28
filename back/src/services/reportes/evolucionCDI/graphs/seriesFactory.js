import { xlMarkerStyle, xlLineStyle } from './excelConstants.js';
import logger from '../../../../utils/logger.js';

export function addSeries (chart, sheet, column, rowStart, rowEnd, xValues, axisGroup, seriesIndex, cpId, release) {
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
