import fs from 'fs';
import path from 'path';
import logger from '../../../utils/logger.js';

// winax no tiene versión ECM => hay que importarlo como sigue:
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Object: ActiveXObject } = require('winax');

const filaNombrePozos = 8;
const filaInicio = 15;
const totalFilas = 40; // se rellenan filas hasta esta cantidad
const totalFilasdelMedio = 30; // si hay mas de total filas debe reducir las del medio a este valor

const projectRoot = process.cwd();
const MANNKENDALL_MODEL_PATH = path.resolve(projectRoot, 'assets');

const MANNKENDALL_MODEL_NAME = 'MannKendall.xlsm';
const { MANNKENDALL_FILES_PATH } = process.env;

const baseTemplate = path.join(MANNKENDALL_MODEL_PATH, MANNKENDALL_MODEL_NAME);

export async function processCompound (compuesto) {
    const fileCreated = copyExcelTemplate(compuesto);
    const newFilePath = path.join(fileCreated.path, fileCreated.file);

    const sheetGroups = groupSamples(compuesto);
    const logLines = []; // acumulador de logs para tener todas las hojas juntas

    // Procesar cada grupo asignándolo a una hoja secuencial
    sheetGroups.forEach((grupo, index) => {
        const sheetIndex = index + 1; // hojas numeradas a partir del 1
        processSheetGroup(newFilePath, sheetIndex, compuesto, grupo, logLines);
    });

    const logCreated = guardarLogTxtFinal(compuesto, logLines);

    return {
        excel: fileCreated,
        log: logCreated
    };
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
        return { id: 0, path: MANNKENDALL_FILES_PATH, file: fileName, zipName: `MK_${compuesto.proyecto}_${compuesto.fechaEvaluacion}` };
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
function processSheetGroup (filePath, sheetIndex, compuesto, grupo, logLines) {
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

        /*  const values = compuesto.mediciones.map(med => {
            const row = [med.fecha];
            grupo.sampleIndices.forEach(idx => {
                row.push(med.muestras[idx] != null ? med.muestras[idx] : '');
            });
            return row;
            });
        */
        // Se reemplazó este bloque por el siguiente para seleccionar las filas si se pasa del maximo de filas
        // que soporta el excel de MannKendall

        const medicionesFiltradas = seleccionar40Fechas(grupo, compuesto.mediciones, compuesto, sheetName, logLines);

        const values = medicionesFiltradas.map(med => {
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

function seleccionar40Fechas (grupo, mediciones, compuesto, hoja, logLines) {
    const total = mediciones.length;

    if (total <= totalFilas) { // si son menos del totalFilas no hace falta descartar mediciones
        return mediciones;
    }

    const primeras5 = mediciones.slice(0, 5);
    const ultimas5 = mediciones.slice(-5);
    const delMedio = mediciones.slice(5, -5);

    // verificar si hace falta descartar las que toda la fila son nulas
    const delMedioValidas = delMedio.filter(med =>
        med.muestras.some(v => v != null)
    );

    // Se descartan  mediciones cuando las del medio superan las totalFilas menos las 10 que seleccioné fijas ( 5 primeras y 5 ultimas)
    const totalValidas = delMedioValidas.length;
    if (totalValidas > totalFilasdelMedio) {
        const nuevas = [];
        const usados = new Set();
        const step = totalValidas / totalFilasdelMedio;

        for (let i = 0; i < totalFilasdelMedio; i++) {
            const idx = Math.floor((i + 0.5) * step);
            if (!usados.has(idx)) {
                nuevas.push(delMedioValidas[idx]);
                usados.add(idx);
            }
        }

        const descartadasDetalle = delMedioValidas.filter((_, i) => !usados.has(i));
        delMedioValidas.length = 0;
        delMedioValidas.push(...nuevas);

        guardarLogFechas(compuesto, hoja, descartadasDetalle, logLines, grupo.sampleIndices);

        return [...primeras5, ...delMedioValidas, ...ultimas5];
    } else {
        guardarLogFechas(compuesto, hoja, [], logLines);

        return [...primeras5, ...delMedioValidas, ...ultimas5];
    }
}

// Genera un txt con los archivos excel en caso de descartar fechas

function guardarLogFechas (compuesto, hoja, descartadasCompletas = [], logLines = [], sampleIndices = []) {
    if (!descartadasCompletas.length) return;

    logLines.push('==========================================');
    logLines.push(`Hoja: ${hoja}`);
    logLines.push(`Compuesto: ${compuesto.compuestoName}`);
    logLines.push(`Fecha de evaluación: ${compuesto.fechaEvaluacion}`);
    logLines.push('Detalles de muestras descartadas (tipo tabla):');

    const cabecera = ['Fecha     ', ...sampleIndices.map(idx => compuesto.muestras[idx].pozo)];

    logLines.push(cabecera.join('\t'));
    descartadasCompletas.forEach(med => {
        const fila = [med.fecha];
        sampleIndices.forEach(idx => {
            const val = med.muestras[idx];
            fila.push(val == null ? '' : val.toString());
        });
        logLines.push(fila.join('\t'));
    });

    logLines.push(''); // Línea vacía entre hojas
}

function guardarLogTxtFinal (compuesto, logLines) {
    // Si no hay líneas de log, no crees el archivo y retorna null.
    if (!logLines.length) {
        return null;
    }

    const logFileName = `MK_${compuesto.proyecto}_${compuesto.compuestoName}_${compuesto.fechaEvaluacion}_log.txt`;
    const logFilePath = path.join(process.env.MANNKENDALL_FILES_PATH, logFileName);
    const zipName = `MK_${compuesto.proyecto}_${compuesto.fechaEvaluacion}`;
    const logCreated = { id: 0, path: MANNKENDALL_FILES_PATH, file: logFileName, zipName };

    try {
        fs.writeFileSync(logFilePath, logLines.join('\n'), 'utf-8');
        logger.info(`Log  de fechas descartadas guardado en ${logFilePath}`);
        return logCreated;
    } catch (error) {
        logger.error(`Error al guardar el log .txt ${logFilePath}: ${error.message}`);
        console.error(error);
        return null;
    }
}
