import { xlMarkerStyle, xlLineStyle } from './excelConstants.js';
import logger from '../../../../utils/logger.js';

/**
 * Agrega una nueva serie de datos al gráfico especificado, construyendo la
 * fórmula de Excel `=SERIES(...)` con valores de X (fechas serializadas) e Y
 * (datos de la hoja), y aplica estilo de línea y marcadores según cpId.
 *
 * @param {object} chart - Objeto COM del Chart de Excel.
 * @param {object} sheet - Objeto COM de la hoja con los datos.
 * @param {string} column - Letra de la columna que contiene la serie de valores Y.
 * @param {number} rowStart - Fila inicial de los datos Y.
 * @param {number} rowEnd - Fila final de los datos Y.
 * @param {number[]} xValues - Array de números de serie de fechas para el eje X.
 * @param {number} axisGroup - Constante xlAxisGroup para eje primario o secundario.
 * @param {number} seriesIndex - Índice de trazado de la serie (orden en el gráfico).
 * @param {number} cpId - ID de compuesto; valores especiales (-1 NF, -2 FLNA) cambian estilo de línea.
 * @param {Function} release - Función para liberar objetos COM tras su uso.
 * @throws {Error} Lanza si ocurre un problema al crear la serie o aplicar la fórmula.
 */
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
