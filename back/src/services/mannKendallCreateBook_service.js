import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
const require = createRequire(import.meta.url);

const { Object: ActiveXObject } = require('winax'); // winax no tiene versión ECM

const filaNombrePozos = 8;
const filaInicio = 15;
const totalFilas = 40; // se rellenan filas hasta esta cantidad

const { MANNKENDALL_MODEL_PATH, MANNKENDALL_MODEL_NAME, MANNKENDALL_FILES_PATH } = process.env;
const baseTemplate = path.join(MANNKENDALL_MODEL_PATH, MANNKENDALL_MODEL_NAME);

export function processCompound (compuesto) {
    const newFilePath = copyExcelTemplate(compuesto);
    const sheetGroups = groupSamples(compuesto);

    // Procesar cada grupo asignándolo a una hoja secuencial
    sheetGroups.forEach((grupo, index) => {
        const sheetIndex = index + 1; // hojas numeradas a partir del 1
        processSheetGroup(newFilePath, sheetIndex, compuesto, grupo);
    });
}

// Función para copiar el archivo base y crear uno nuevo para el compuesto
function copyExcelTemplate (compuesto) {
    const fileName = `MK_${compuesto.proyecto}_${compuesto.compuestoName}_${compuesto.fechaEvaluacion}.xlsm`;
    try {
        const newFilePath = path.join(MANNKENDALL_FILES_PATH, fileName);
        if (!fs.existsSync(MANNKENDALL_FILES_PATH)) {
            fs.mkdirSync(MANNKENDALL_FILES_PATH, { recursive: true });
        }
        fs.copyFileSync(baseTemplate, newFilePath);
        logger.info(`MannKendallService - Creada copia para ${fileName}`);
        return newFilePath;
    } catch (error) {
        logger.error(`Error al copiar el template para ${fileName}`);
        console.error(error);
        const message = `Error al copiar el template para ${fileName}: ` + error.message;
        const err = new Error(message);
        err.status = 500;
        throw err;
    }
}

// Función para agrupar los pozos según su propiedad "hoja"
function groupSamples (compuesto) {
    const grupos = {}; // clave: hoja, valor: array de índices de las muestras
    compuesto.muestras.forEach((muestra, index) => {
        const hojaKey = muestra.hoja;
        if (!grupos[hojaKey]) grupos[hojaKey] = [];
        grupos[hojaKey].push(index);
    });

    // Armar la lista de grupos válidos
    return Object.entries(grupos).map(([hoja, indices]) => ({
        hojaOriginal: hoja,
        sampleIndices: indices
    }));
}

// Función que abre el Excel, actualiza una hoja específica (según el grupo) y cierra el libro
function processSheetGroup (filePath, sheetIndex, compuesto, grupo) {
    // La hoja se nombra "Hoja1", "Hoja2", etc.
    const sheetName = `Hoja${sheetIndex}`;
    let excel, workbook, worksheet;
    try {
        excel = new ActiveXObject('Excel.Application');
        excel.EnableEvents = false;
        // excel.Visible = true;

        workbook = excel.Workbooks.Open(filePath);
        worksheet = workbook.Worksheets(sheetName);

        worksheet.Unprotect('Forest Fast Run Run');

        worksheet.Range('C4').Value = compuesto.fechaEvaluacion;
        worksheet.Range('C5').Value = compuesto.facility;
        worksheet.Range('H4').Value = compuesto.proyecto;
        worksheet.Range('H5').Value = compuesto.compuestoName;

        const wellHeaderStartCol = 4; // Columna D
        const wellNames = grupo.sampleIndices.map(idx => compuesto.muestras[idx].pozo);
        wellNames.forEach((nombre, i) => {
            const colLetter = columnToLetter(wellHeaderStartCol + i);
            worksheet.Range(`${colLetter}${filaNombrePozos}`).Value = nombre;
        });

        // Preparar la matriz de datos a escribir:
        // Cada fila: [fecha, valor_muestra1, valor_muestra2, ...]
        // Se utiliza el array de índices del grupo para extraer los valores correctos
        const values = compuesto.mediciones.map(med => {
            const row = [med.fecha];
            grupo.sampleIndices.forEach(idx => {
                row.push(med.muestras[idx] != null ? med.muestras[idx] : '');
            });
            return row;
        });

        // Rellenar con filas vacías si la cantidad de mediciones es menor que totalFilas
        const filasFaltantes = totalFilas - values.length;
        for (let i = 0; i < filasFaltantes; i++) {
            const blankRow = new Array(values[0].length).fill('');
            values.push(blankRow);
        }

        // Calcular rango de destino en la hoja
        // Se empieza en la columna C (índice 3) y se determina la última columna según la cantidad de columnas a escribir
        const numCols = values[0].length;
        const startCol = 3; // Columna C
        const endCol = startCol + numCols - 1;
        const startColLetter = columnToLetter(startCol);
        const endColLetter = columnToLetter(endCol);
        const filaFin = filaInicio + values.length - 1;
        const rangeAddress = `${startColLetter}${filaInicio}:${endColLetter}${filaFin}`;

        const rangoDestino = worksheet.Range(rangeAddress);
        rangoDestino.Value = values;

        worksheet.Protect('Forest Fast Run Run');
        workbook.Save();
        logger.info(`Grabado: ${filePath} - ${sheetName}`);
    } catch (error) {
        logger.error(`Error procesando la hoja ${sheetName}`);
        console.error(error);
        const message = `Error procesando la hoja ${sheetName}: ` + error.message;
        const err = new Error(message);
        err.status = 500;
        throw err;
    } finally {
        try {
            if (workbook && typeof workbook.Close === 'function') workbook.Close(false);
            if (excel && typeof excel.Quit === 'function') excel.Quit();
            worksheet = null;
            workbook = null;
            excel = null;
            if (typeof global.gc === 'function') {
                global.gc();
            } else {
                logger.warn('GC no expuesto; correr Node con --expose-gc');
            }
        } catch (e) {
            logger.error('ProcessSheetGroup: Error en cleanup');
            console.error(e);
        }
    }
}

function columnToLetter (column) {
    let letter = '';
    while (column > 0) {
        const modulo = (column - 1) % 26;
        letter = String.fromCharCode(65 + modulo) + letter;
        column = Math.floor((column - modulo) / 26);
    }
    return letter;
}
