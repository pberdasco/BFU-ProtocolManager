import ExcelJS from 'exceljs';
import path from 'path';

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
            console.log('destinoBase: ', destinoBase);

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
                console.log(`Archivo guardado correctamente: ${destino}`);

                chunkIndex++;
            }
            return { id: 0, path: destinoBase };
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
}
