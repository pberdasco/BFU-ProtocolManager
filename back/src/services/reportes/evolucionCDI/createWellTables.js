import ExcelJS from 'exceljs';
import { stdErrorMsg } from '../../../utils/stdError.js';
import { generarNombreArchivoConFecha } from '../../../utils/filenameGenerator.js';
import path from 'path';

export async function createWellTables (proyectoNombre, grupoConfig, measurements, basePath) {
    try {
        const { workbook, indexByPozo, indexByCompuesto } = await buildWorkbook(measurements, grupoConfig);

        const fileName = generarNombreArchivoConFecha('EV', proyectoNombre, 'xlsx');
        const fullPath = path.join(basePath, fileName);

        await workbook.xlsx.writeFile(fullPath);

        const excelFile = { id: 1, path: basePath, file: fileName, zipName: `EV_${proyectoNombre}`, type: 'xlsx' };
        return { indexByPozo, indexByCompuesto, excelFile };
    } catch (error) {
        throw stdErrorMsg(error.status, error.message || '[evolucionCDI] createWellTables error');
    }
}

/**
 * Convert a 1-based column index to Excel column letters (e.g., 1 -> A, 27 -> AA)
 */
function columnNumberToName (num) {
    let name = '';
    while (num > 0) {
        const rem = (num - 1) % 26;
        name = String.fromCharCode(65 + rem) + name;
        num = Math.floor((num - 1) / 26);
    }
    return name;
}

/**
 * Extract unique compounds (and special codes) for a specific pozo
 */
function getUniqueCompounds (records) {
    const map = new Map();
    records.forEach(r => {
        const key = r.compuestoCodigo;
        if (!map.has(key)) {
            map.set(key, {
                compuestoId: r.compuestoId,
                compuestoCodigo: r.compuestoCodigo,
                nombre: r.compuestoNombre,
                unidad: r.unidad
            });
        }
    });
    return Array.from(map.values());
}

/**
 * Extract unique sorted dates for a specific pozo
 */
function getUniqueDates (records) {
    const dates = new Set(records.map(r => r.fecha));
    return Array.from(dates)
        .map(d => new Date(d))
        .sort((a, b) => a - b);
}

/**
 * Write headers (compound names) in row 2, units in row 3
 */
function writeCompoundHeaders (sheet, compounds) {
    compounds.forEach((c, idx) => {
        const col = 2 + idx;
        const cellName = columnNumberToName(col) + '2';
        const unitCell = columnNumberToName(col) + '3';

        sheet.getCell(cellName).value = c.nombre;
        sheet.getCell(unitCell).value = c.unidad;
    });
}

/**
 * Write dates down column A starting at row 4
 */
function writeDates (sheet, dates) {
    dates.forEach((d, idx) => {
        const row = 4 + idx;
        const cellRef = 'A' + row;
        sheet.getCell(cellRef).value = d;
        sheet.getCell(cellRef).numFmt = 'yyyy-mm-dd';
    });
}

/**
 * Populate intersection cells with valorChart
 */
function writeValues (sheet, records, compounds, dates) {
    // Create lookup maps for faster access
    const compIndex = new Map();
    compounds.forEach((c, idx) => compIndex.set(c.nombre, 2 + idx));

    const dateIndex = new Map();
    dates.forEach((d, idx) => dateIndex.set(d.getTime(), 4 + idx));

    records.forEach(r => {
        const nombre = r.compuestoNombre;
        const col = compIndex.get(nombre);
        const row = dateIndex.get(new Date(r.fecha).getTime());

        if (col !== undefined && row !== undefined) {
            const cellRef = columnNumberToName(col) + row;
            let value = null;

            // Ensure we have a valid number
            if (r.valorChart !== null && r.valorChart !== undefined) {
                if (typeof r.valorChart === 'string') {
                    value = parseFloat(r.valorChart);
                    // Check if value is NaN
                    if (isNaN(value)) value = null;
                } else if (typeof r.valorChart === 'number') {
                    value = r.valorChart;
                }
            }

            sheet.getCell(cellRef).value = value;
        }
    });
}

/**
 * Rellena con 0 las celdas vacías de la columna FLNA (compuestoId = -2),
 * pero solo dentro del rango de filas donde hay al menos una medición
 * de Nivel freático (compuestoId = -1).
 *
 * Se asume que la columna de FLNA existe en `compounds`, y que las fechas en `dates`
 * están ordenadas cronológicamente de forma ascendente.
 *
 * @param {object} sheet - Hoja de ExcelJS donde escribir los valores.
 * @param {Array} compounds - Lista de compuestos únicos del pozo actual.
 * @param {Date[]} dates - Fechas únicas, ordenadas, correspondientes a las filas de datos.
 */
function writeCeroForFlna (sheet, compounds, dates) {
    const waterIndex = compounds.findIndex(c => c.compuestoId === -1);
    const flnaIndex = compounds.findIndex(c => c.compuestoId === -2);

    if (flnaIndex === -1 || waterIndex === -1) return;

    const waterCol = columnNumberToName(2 + waterIndex);
    const flnaCol = columnNumberToName(2 + flnaIndex);

    // Buscar filas donde hay valores de nivel freático
    let filaDesde = null;
    let filaHasta = null;
    for (let i = 0; i < dates.length; i++) {
        const row = 4 + i;
        const waterCell = sheet.getCell(`${waterCol}${row}`);
        if (waterCell.value != null) {
            if (filaDesde === null) filaDesde = row;
            filaHasta = row;
        }
    }

    // Rellenar FLNA con 0 sólo entre esas filas
    if (filaDesde !== null && filaHasta !== null) {
        for (let i = 0; i < dates.length; i++) {
            const row = 4 + i;
            if (row < filaDesde || row > filaHasta) continue;
            const cell = sheet.getCell(`${flnaCol}${row}`);
            if (cell.value == null) {
                cell.value = 0;
            }
        }
    }
}

/**
 * Build the workbook given measurements and configuration
 */
async function buildWorkbook (measurements, grupoConfig) {
    const wb = new ExcelJS.Workbook();
    const indexByPozo = [];
    const indexByCompuesto = [];

    // Group measurements by pozoId
    const byPozo = measurements.reduce((acc, r) => {
        (acc[r.pozoId] = acc[r.pozoId] || []).push(r);
        return acc;
    }, {});

    // pozos unicos en la configuracion
    const uniquePozos = Array.from(
        new Set(
            grupoConfig.flatMap(item => item.pozos)
        )
    );

    // For each pozo in config
    uniquePozos.forEach(pozoId => {
        const records = byPozo[pozoId] || [];
        if (!records.length) return;

        const pozoName = records[0].pozoNombre;

        // Sanitize worksheet name (Excel has restrictions on worksheet names)
        const safePozoName = pozoName.replace(/[*?:/\\[\]]/g, '_').substring(0, 31);

        const compounds = getUniqueCompounds(records);
        const dates = getUniqueDates(records);

        const sheet = wb.addWorksheet(safePozoName);
        sheet.getCell('A1').value = pozoName;

        writeCompoundHeaders(sheet, compounds);
        writeDates(sheet, dates);
        writeValues(sheet, records, compounds, dates);
        writeCeroForFlna(sheet, compounds, dates);

        // Estilos de la tabla
        sheet.columns.forEach(column => {
            column.width = 12;
        });
        sheet.getRow(2).font = { bold: true };
        sheet.getRow(2).alignment = { horizontal: 'center' };
        sheet.getRow(3).alignment = { horizontal: 'center' };

        sheet.getColumn(1).font = { bold: true };
        const a1 = sheet.getCell('A1');
        a1.font = { bold: true };
        a1.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFADD8E6' } // Celeste claro
        };

        const lastRow = 4 + dates.length - 1;
        const lastCol = compounds.length + 1; // A=1 + compuestos
        for (let r = 2; r <= lastRow; r++) {
            for (let c = 1; c <= lastCol; c++) {
                const cell = sheet.getCell(r, c);
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        }

        // Record index for fechas
        indexByPozo.push({
            pozo: pozoName,
            fechaInicio: dates[0],
            filaInicio: 4,
            fechaFin: dates[dates.length - 1],
            filaFin: 4 + dates.length - 1
        });

        // Record index for compuestos
        compounds.forEach((c, idx) => {
            const colNum = 2 + idx;
            indexByCompuesto.push({
                pozoId,
                pozo: pozoName,
                compuestoId: c.compuestoId,
                compuesto: c.nombre,
                columna: columnNumberToName(colNum)
            });
        });
    });

    return { workbook: wb, indexByPozo, indexByCompuesto };
}
