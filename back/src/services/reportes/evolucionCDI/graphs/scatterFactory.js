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
 * @param {number} options.filaInicio - Fila inicial del rango de datos.
 * @param {number} options.filaFin - Fila final del rango de datos.
 * @param {Date | string} options.minFechaUsuario - Fecha mínima del eje X.
 * @param {Date | string} options.maxFechaUsuario - Fecha máxima del eje X.
 * @param {number} options.left - Coordenada X de inserción del gráfico (px).
 * @param {number} options.top - Coordenada Y de inserción del gráfico (px).
 * @param {number} options.width - Ancho del gráfico (px).
 * @param {number} options.height - Alto del gráfico (px).
 * @returns {{ chartObj: object, internallyFailedCpIds: number[] }}
 *   - chartObj: objeto COM del ChartObject creado.
 *   - internallyFailedCpIds: lista de cpIds que fallaron al agregar su serie.
 */
export function addScatterChart ({ sheet, sheetName, release, chartName, eje1Cols, eje1CpIds, eje2Cols, eje2CpIds, filaInicio, filaFin, minFechaUsuario = null, maxFechaUsuario = null, left, top, width, height, imagesPath }) {
    const FILA_UM = 3; // Las unidades de medida estan en la fila 3
    const tickCount = 6; // Cantidad de marcas en los ejes Y primario y secundario

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

            const { min, max } = getDateRangeForWell(sheet, eje1Cols, eje2Cols, filaInicio, filaFin, minFechaUsuario = null, maxFechaUsuario = null);
            categoryAxis.MinimumScale = min;
            categoryAxis.MaximumScale = max;
            categoryAxis.MajorUnit = (max - min) / 10;

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

            // Hacer que tanto el eje primario como el secundario tengan tickCount marcas
            setYAxis(primaryAxis, tickCount);
            if (secondaryAxis) {
                setYAxis(secondaryAxis, tickCount);
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

/**
 * Configura un eje Value para que tenga un número fijo de marcas (tickCount).
 *
 * @param {object} axis      Objeto COM del eje (chart.Axes(...))
 * @param {number} tickCount Cantidad de marcas deseadas (incluye extremos)
 */
function setYAxis (axis, tickCount) {
    const min = axis.MinimumScale;
    const max = axis.MaximumScale;

    axis.MinimumScaleIsAuto = false;
    axis.MaximumScaleIsAuto = false;
    axis.MajorUnitIsAuto = false;

    axis.MinimumScale = min;
    axis.MaximumScale = max;
    axis.MajorUnit = (max - min) / (tickCount - 1);
}

/**
 * Devuelve el número de serie Excel de la primera y última fecha donde hay al menos un dato
 * en las series del eje primario o secundario, acotado opcionalmente por fechas límite
 * definidas por el usuario.
 *
 * Las fechas devueltas siempre corresponden a valores reales presentes en la columna A.
 * Nota: al limitar .MinimumScale y .MaximumScale no hace falta acotar filaInicio y filaFin,
 *       excel solo renderiza en base a los primeros aunque deje parte del rango afuera
 *
 * @param {object} sheet - Objeto COM de la hoja de Excel.
 * @param {string[]} eje1Cols - Columnas con series del eje primario.
 * @param {string[]} eje2Cols - Columnas con series del eje secundario.
 * @param {number} filaInicio - Fila inicial del rango.
 * @param {number} filaFin - Fila final del rango.
 * @param {string|Date} [minFechaUsuario] - Fecha mínima opcional (ej: '2020-01-01' o Date).
 * @param {string|Date} [maxFechaUsuario] - Fecha máxima opcional (ej: '2022-12-31' o Date).
 * @returns {{ min: number, max: number }} Fechas en formato serial Excel para eje X.
 */
function getDateRangeForWell (sheet, eje1Cols, eje2Cols, filaInicio, filaFin, minFechaUsuario = null, maxFechaUsuario = null) {
    const minUserSerial = toExcelSerial(minFechaUsuario);
    const maxUserSerial = toExcelSerial(maxFechaUsuario);

    // Array de numeros de serie Excel correspondientes las fechas
    const fechasRaw = sheet.Range(`A${filaInicio}:A${filaFin}`).Value2.map(r => r[0]); // el map, para aplanar el array de arrays

    const series1 = leerSeries(eje1Cols);
    const series2 = leerSeries(eje2Cols);

    // Índices de fechasRaw donde al menos una serie tiene valor no nulo ni vacío
    const validIdx = fechasRaw
        .map((_, i) => i)
        .filter(i => series1.some(serie => serie[i] != null && serie[i] !== '') ||
                     series2.some(serie => serie[i] != null && serie[i] !== '')
        );

    // Si no hay datos válidos, se usa el rango completo
    if (validIdx.length === 0) {
        return {
            min: fechasRaw[0],
            max: fechasRaw[fechasRaw.length - 1]
        };
    }

    // en base a los indices obtener los valores seriales de fechas (min y max asumiendo que estan ordenados)
    const validFechas = validIdx.map(i => fechasRaw[i]);

    let min = Math.min(...validFechas);
    let max = Math.max(...validFechas);

    // Acotar con fechas límite si están definidas, buscando valores reales en fechasRaw
    if (minUserSerial != null) {
        const encontrada = fechasRaw.find(f => f >= minUserSerial);
        if (encontrada !== undefined) min = encontrada;
    }
    if (maxUserSerial != null) {
        const encontrada = [...fechasRaw].reverse().find(f => f <= maxUserSerial);
        if (encontrada !== undefined) max = encontrada;
    }

    return { min, max };

    // ---------------------------------------------------------------------------------
    // devuelve arrays planos con los valores de cada columna
    function leerSeries (cols) {
        return cols.map(col =>
            sheet.Range(`${col}${filaInicio}:${col}${filaFin}`).Value2.map(r => r[0])
        );
    }

    // Convierte 'YYYY-MM-DD' o Date a serial Excel (base 1900)
    function toExcelSerial (fecha) {
        if (!fecha) return null;
        const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
        if (!(dateObj instanceof Date) || isNaN(dateObj)) return null;
        const epoch = new Date(1899, 11, 30);
        return (dateObj - epoch) / (24 * 60 * 60 * 1000);
    }
}
