import { xlChartType, xlAxisType, xlAxisGroup, xlLegendPosition, XlDisplayBlanksAs } from './excelConstants.js';
import path from 'path';
import logger from '../../../../utils/logger.js';
import { addSeries } from './seriesFactory.js';

/**
 * Inserta en la hoja un gráfico de dispersión (XY Scatter with Smooth Lines),
 * agrega series de datos en ejes primario y/o secundario, configura títulos y ejes,
 * y devuelve el objeto COM del chart junto a IDs de series que fallaron internamente.
 *
 * @param {object} options
 * @param {object} options.sheet- Objeto COM de la hoja de Excel donde se agregará el gráfico.
 * @param {string} options.sheetName - Nombre de la hoja, usado para títulos y rangos.
 * @param {Function} options.release - Función para liberar objetos COM tras su uso.
 * @param {string} options.chartName - Nombre único para identificar el ChartObject en Excel.
 * @param {string[]} options.eje1Cols - Columnas de Excel para series del eje primario.
 * @param {number[]} options.eje1CpIds - IDs de compuesto correspondientes a las columnas de eje1Cols.
 * @param {string[]} options.eje2Cols - Columnas para series en el eje secundario (opcional).
 * @param {number[]} options.eje2CpIds - IDs de compuesto para eje2Cols.
 * @param {Date} options.fechaInicio - Fecha mínima del eje X (serial Excel).
 * @param {Date} options.fechaFin - Fecha máxima del eje X (serial Excel).
 * @param {number} options.filaInicio - Fila inicial del rango de datos.
 * @param {number} options.filaFin - Fila final del rango de datos.
 * @param {number} options.left - Coordenada X de inserción del gráfico (px).
 * @param {number} options.top - Coordenada Y de inserción del gráfico (px).
 * @param {number} options.width - Ancho del gráfico (px).
 * @param {number} options.height - Alto del gráfico (px).
 * @returns {{ chartObj: object, internallyFailedCpIds: number[] }}
 *   - chartObj: objeto COM del ChartObject creado.
 *   - internallyFailedCpIds: lista de cpIds que fallaron al agregar su serie.
 */
export function addScatterChart ({ sheet, sheetName, release, chartName, eje1Cols, eje1CpIds, eje2Cols, eje2CpIds, fechaInicio, fechaFin, filaInicio, filaFin, left, top, width, height, imagesPath }) {
    const FILA_UM = 3; // Asumiendo que esta constante está definida o es conocida
    let chartObj, chart, categoryAxis, primaryAxis, secondaryAxis;
    let datoUm1, datoUm2; // Para los ranges de UM, usando nombres diferentes para evitar confusión con variables globales si existieran
    let pngPath;
    const internallyFailedCpIds = [];

    try {
        chartObj = sheet.ChartObjects().Add(left, top, width, height);
        chartObj.Name = chartName;
        chart = chartObj.Chart;

        chart.ChartType = xlChartType.xlXYScatterLines;
        chart.DisplayBlanksAs = XlDisplayBlanksAs.xlInterpolated;

        const rangoFechas = sheet.Range(`A${filaInicio}:A${filaFin}`);
        const valoresFechas = rangoFechas.Value2;
        const fechasExcel = valoresFechas
            .map(fila => fila[0])
            .map(f => typeof f === 'object'
                ? excelDateFromJSDate(new Date(f))
                : f);

        eje1Cols.forEach((col, index) => {
            try {
                // Asumimos que eje1CpIds[index] existe y es el cpId correcto
                addSeries(chart, sheet, col, filaInicio, filaFin, fechasExcel, xlAxisGroup.xlPrimary, index, eje1CpIds[index], release);
            } catch (error) {
                logger.warn(`[addScatterChart] - Error agregando serie para columna ${col} (cpId: ${eje1CpIds[index]}):`);
                console.error(error.message);
                internallyFailedCpIds.push(eje1CpIds[index]);
            }
        });

        eje2Cols.forEach((col, index) => {
            try {
                // Asumimos que eje2CpIds[index] existe y es el cpId correcto
                addSeries(chart, sheet, col, filaInicio, filaFin, fechasExcel, xlAxisGroup.xlSecondary, eje1Cols.length + index, eje2CpIds[index], release);
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
            const fechaIniSerial = excelDateFromJSDate(fechaInicio);
            const fechaFinSerial = excelDateFromJSDate(fechaFin);
            categoryAxis.MinimumScale = fechaIniSerial;
            categoryAxis.MaximumScale = fechaFinSerial;
            categoryAxis.MajorUnit = (fechaFinSerial - fechaIniSerial) / 10;

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

            // Grabar la imagen en disco
            const pngName = `${chartName.replace(/[/\\:?<>|"]/g, '_')}.png`;
            pngPath = path.join(imagesPath, pngName);
            chart.DisplayBlanksAs = XlDisplayBlanksAs.xlInterpolated;
            chart.Export(pngPath, 'PNG');
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
        if (chartObj) release(chartObj);
    }

    return { pngPath, internallyFailedCpIds };
}

// Función que convierte fechas de JavaScript a formato Excel (número de serie)
function excelDateFromJSDate (date) {
    const epoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = (date - epoch) / msPerDay;
    return dayDiff;
}
