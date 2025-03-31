import ExcelJS from 'exceljs';

async function procesarExcel (modeloPath, destinoBase, cadena, muestras, analisis) {
    const CHUNK_SIZE = 12; // Máximo 12 muestras por archivo
    let chunkIndex = 0;

    while (muestras.length > 0) {
        const muestrasChunk = muestras.splice(0, CHUNK_SIZE);
        const destino = chunkIndex === 0 ? destinoBase : destinoBase.replace(/(\.xlsm|\.xlsx)$/, `_${chunkIndex}$1`);

        console.log(`Procesando archivo: ${destino} con ${muestrasChunk.length} muestras`);

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

        // Insertar muestras
        muestrasChunk.forEach((muestra, index) => {
            const rowNumber = startRow + index;
            if (index < (endRow - startRow + 1)) {
                sheet.getCell(`B${rowNumber}`).value = index + 1;
                sheet.getCell(`${colMuestra}${rowNumber}`).value = muestra;
                // const cell = sheet.getCell(`${colMuestra}${startRow + index}`);
                // cell.value = muestra;
            }
        });

        // Insertar análisis
        analisis.forEach((analisisItem, index) => {
            if (index < (endRow - startRow + 1)) {
                const cell = sheet.getCell(`${colAnalisis}${startRow + index}`);
                cell.value = analisisItem;
            }
        });

        sheet.eachRow((row) => {
            row.height = 48; // Fija la altura para cada fila copiada
        });
        // Forzar la actualización de los valores
        await workbook.xlsx.writeFile(destino);
        console.log(`Archivo guardado correctamente: ${destino}`);

        chunkIndex++;
    }
}

// Ejemplo de uso

const modeloPath = 'C:\\Netrona\\BfU\\ProcesoProtocolos\\ModeloCadena\\CadenaCustodiaNuevo.xlsx';
const destinoBase = 'C:\\Netrona\\BfU\\ProcesoProtocolos\\ModeloCadena\\200184-076-EneroGeneral01.xlsx';
const cadena = { nombre: 'Enero General 01', matriz: 'Agua', cliente: 'YPF S.A.', proyecto: '200184-076', laboratorio: 'Inducer SA' };
const muestras = ['MA PM1/10', 'MA PM2/10', 'MA PM3/10', 'MA PM4/10', 'MA PSX1/7', 'MA PSX2/7', 'MA PSX3/7', 'MA PSX4/7', 'MA PSX5/7', 'MA PSX6/7'];
const analisis = ['HTP - EPA 8015', 'BTEX - EPA 8260', 'MTBE - EPA 8260', 'Plomo Total'];

procesarExcel(modeloPath, destinoBase, cadena, muestras, analisis).catch(console.error);
