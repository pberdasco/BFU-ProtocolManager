import ExcelJS from 'exceljs';
import path from 'node:path';
import fs from 'node:fs';

const modeloPath = 'C:\\Netrona\\BfU\\ProcesoProtocolos\\ModeloCadena\\CadenaCustodiaNuevo.xlsx';

function cleanString (str) {
    return str.trim().replace(/[^a-zA-Z0-9]/g, '');
}

export default class CadenaToExcelService {
    static async create (cadena, muestras, analisis) {
        try {
            const CHUNK_SIZE = 12; // Máximo 12 muestras por archivo
            let chunkIndex = 0;

            const basePath = process.env.CADENA_EXCEL_PATH;
            const fileName = `${cadena.proyecto.trim()}-${cleanString(cadena.nombre)}.xlsx`;
            const destinoBase = path.join(basePath, fileName);

            while (muestras.length > 0) {
                const muestrasChunk = muestras.splice(0, CHUNK_SIZE);
                const destino = chunkIndex === 0 ? destinoBase : destinoBase.replace(/(\.xlsm|\.xlsx)$/, `_${chunkIndex}$1`);

                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(modeloPath);
                const sheet = workbook.worksheets[0]; // Se asume la primera hoja

                sheet.getCell('AA2').value = {
                    richText: [{ text: cadena.matriz, font: { bold: true } }] // Armado de esta forma porque al aplicar sheet.getCell('AA2').font = ...  otras celdas copian el formato...
                };
                sheet.getCell('AA3').value = { richText: [{ text: cadena.nombre, font: { bold: true } }] };
                sheet.getCell('I6').value = { richText: [{ text: cadena.cliente, font: { bold: true } }] };
                sheet.getCell('Q6').value = { richText: [{ text: cadena.proyecto, font: { bold: true } }] };
                sheet.getCell('X5').value = { richText: [{ text: cadena.laboratorio, font: { bold: true } }] };

                // Rango de filas donde insertar los datos
                const startRow = 11;
                const endRow = 27;
                const colMuestra = 'C';
                const colAnalisis = 'W';

                muestrasChunk.forEach((muestra, index) => {
                    const rowNumber = startRow + index;
                    if (index < (endRow - startRow + 1)) {
                        sheet.getCell(`B${rowNumber}`).value = index + 1;
                        sheet.getCell(`${colMuestra}${rowNumber}`).value = muestra;
                    }
                });

                analisis.forEach((analisisItem, index) => {
                    if (index < (endRow - startRow + 1)) {
                        const cell = sheet.getCell(`${colAnalisis}${startRow + index}`);
                        cell.value = analisisItem;
                    }
                });

                await workbook.xlsx.writeFile(destino);
                chunkIndex++;
            }
            return { id: 0, path: basePath, file: fileName };
        } catch (err) {
            let message = err.message;
            let status = err.status;
            if (err.code === 'EBUSY') {
                status = 423;
                message = `El archivo ${err.path || 'desconocido'} esta abierto. No se pudo grabar.`;
            }
            const error = new Error(message || 'Error al generar el formulario Excel de la cadena');
            error.status = status || 503;
            throw error;
        }
    }

    static async createMultiple (cadenasArray) {
        try {
            const basePath = process.env.CADENA_EXCEL_PATH;
            const fileName = `Cadenas_${Date.now()}.xlsx`;
            const destino = path.join(basePath, fileName);
            // Creamos el workbook final en el que se agregarán todas las hojas nuevas
            const finalWorkbook = new ExcelJS.Workbook();

            // Leemos la plantilla desde el archivo modelo
            const templateWorkbook = new ExcelJS.Workbook();
            await templateWorkbook.xlsx.readFile(modeloPath);
            const templateSheet = templateWorkbook.worksheets[0];

            // Extraer la imagen de la hoja plantilla antes del loop
            const templateImages = templateSheet.getImages();
            let imageTemplate = null;
            if (templateImages.length > 0) {
                const imageInfo = templateImages[0]; // Suponiendo que hay solo una imagen
                const img = templateWorkbook.getImage(imageInfo.imageId);
                imageTemplate = {
                    buffer: img.buffer,
                    extension: img.extension,
                    position: {
                        tl: { col: imageInfo.range.tl.col, row: imageInfo.range.tl.row },
                        br: { col: imageInfo.range.br.col, row: imageInfo.range.br.row },
                        ext: { width: img.width * 1.4, height: img.height * 1.4 }
                    }
                };
            }

            // Para cada cadena del array, copiamos la plantilla fila por fila en una hoja nueva
            for (const item of cadenasArray) {
                const { nombre, matriz, cliente, proyecto, laboratorio, muestras, analisis } = item;
                // Definimos un nombre de hoja basado en el nombre de la cadena
                const sheetName = cleanString(nombre);
                // Creamos la hoja nueva en el workbook final
                // const newSheet = finalWorkbook.addWorksheet(sheetName);
                const newSheet = finalWorkbook.addWorksheet(sheetName, {
                    properties: { defaultRowHeight: 18 }
                });

                // Copiamos la plantilla: fila por fila, celda por celda
                templateSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    const newRow = newSheet.getRow(rowNumber);
                    newRow.height = row.height || 18; // ? parece que height no se copia automaticamente
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const newCell = newRow.getCell(colNumber);
                        // Se copia el modelo de cada celda (incluye formateo, fórmulas, etc.)
                        newCell.model = JSON.parse(JSON.stringify(cell.model));
                    });
                });

                // Copiar ancho de las columnas
                templateSheet.columns.forEach((col, i) => {
                    const newCol = newSheet.getColumn(i + 1);
                    newCol.width = col.width;
                });

                templateSheet.eachRow((row, rowNumber) => {
                    const newRow = newSheet.getRow(rowNumber);
                    newRow.height = row.height || 18; // ? Nuevo intento de asignar height porque el anterior parece fallar
                });

                // *** Parámetros de impresión (pageSetup) ***
                newSheet.pageSetup = JSON.parse(JSON.stringify(templateSheet.pageSetup));

                // Actualizamos los datos de la cadena en celdas específicas
                newSheet.getCell('AA2').value = {
                    richText: [{ text: matriz, font: { bold: true } }]
                };
                newSheet.getCell('AA3').value = {
                    richText: [{ text: nombre, font: { bold: true } }]
                };
                newSheet.getCell('I6').value = {
                    richText: [{ text: cliente, font: { bold: true } }]
                };
                newSheet.getCell('Q6').value = {
                    richText: [{ text: proyecto, font: { bold: true } }]
                };
                newSheet.getCell('X5').value = {
                    richText: [{ text: laboratorio, font: { bold: true } }]
                };

                // Insertamos los datos de muestras y análisis
                const startRow = 11;
                const endRow = 27;
                const colIndice = 'B';
                const colMuestra = 'C';
                const colAnalisis = 'W';

                // Insertar muestras: asignamos un número en la columna B y la muestra en la columna definida
                let muestraIndex = 0;
                for (let rowNumber = startRow; rowNumber <= endRow && muestraIndex < muestras.length; rowNumber++) {
                    newSheet.getCell(`${colIndice}${rowNumber}`).value = muestraIndex + 1;
                    newSheet.getCell(`${colMuestra}${rowNumber}`).value = muestras[muestraIndex].nombre;
                    muestraIndex++;
                }

                // Insertar análisis de forma similar
                let analisisIndex = 0;
                for (let rowNumber = startRow; rowNumber <= endRow && analisisIndex < analisis.length; rowNumber++) {
                    const texto = analisis[analisisIndex].tipo === 1 ? analisis[analisisIndex].grupo : analisis[analisisIndex].compuestoNombre + ' - ' + analisis[analisisIndex].metodo;
                    newSheet.getCell(`${colAnalisis}${rowNumber}`).value = texto;
                    analisisIndex++;
                }

                if (imageTemplate) {
                    const newImageId = finalWorkbook.addImage({
                        buffer: imageTemplate.buffer,
                        extension: imageTemplate.extension
                    });

                    newSheet.addImage(newImageId, imageTemplate.position);
                }
            }

            // Escribimos el workbook final en el destino
            await finalWorkbook.xlsx.writeFile(destino);
            return { id: 0, path: basePath, file: fileName };
        } catch (err) {
            let message = err.message;
            let status = err.status;
            if (err.code === 'EBUSY') {
                status = 423;
                message = `El archivo ${err.path || 'desconocido'} está abierto. No se pudo grabar.`;
            }
            const error = new Error(message || 'Error al generar el formulario Excel de la cadena');
            error.status = status || 503;
            throw error;
        }
    }

    /**
     * Servicio minimo para obtener el path completo, se separo del controller por si en el futuro la logica de busqueda
     * se realiza sobre las tablas del sistema y para seguir la estructura r/c/s
     * @param {string} nombreArchivo (sin path) - En el futuro podria venir un Id de cadena o evento para buscar en la cadena o en el evento el nombre
     * @returns nombre completo (path+nombre) o error si el archivo no existe
     */
    static getFilePath (nombreArchivo) {
        const basePath = process.env.CADENA_EXCEL_PATH;
        const filePath = path.join(basePath, nombreArchivo);

        if (!fs.existsSync(filePath)) {
            const error = new Error(`No se encuentra el archivo ${nombreArchivo} en el directorio correspondiente`);
            error.status = 404;
            throw error;
        }

        return filePath;
    }
}
