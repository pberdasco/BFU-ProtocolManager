import ExcelJS from 'exceljs';

async function procesarExcel (modeloPath, destinoBase, muestras, analisis) {
  const CHUNK_SIZE = 12; // Máximo 12 muestras por archivo
  let chunkIndex = 0;

  while (muestras.length > 0) {
    const muestrasChunk = muestras.splice(0, CHUNK_SIZE);
    const destino = chunkIndex === 0 ? destinoBase : destinoBase.replace(/(\.xlsm|\.xlsx)$/, `_${chunkIndex}$1`);

    console.log(`Procesando archivo: ${destino} con ${muestrasChunk.length} muestras`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(modeloPath);
    const sheet = workbook.worksheets[0]; // Se asume la primera hoja

    // Rango de filas donde insertar los datos
    const startRow = 5;
    const endRow = 16;
    const colMuestra = 'A';
    const colAnalisis = 'G';

    // Insertar muestras
    muestrasChunk.forEach((muestra, index) => {
      if (index < (endRow - startRow + 1)) {
        const cell = sheet.getCell(`${colMuestra}${startRow + index}`);
        cell.value = muestra;
        console.log(`Insertando muestra en ${colMuestra}${startRow + index}: ${muestra}`);
      }
    });

    // Insertar análisis
    analisis.forEach((analisisItem, index) => {
      if (index < (endRow - startRow + 1)) {
        const cell = sheet.getCell(`${colAnalisis}${startRow + index}`);
        cell.value = analisisItem;
        console.log(`Insertando análisis en ${colAnalisis}${startRow + index}: ${analisisItem}`);
      }
    });

    // Forzar la actualización de los valores
    await workbook.xlsx.writeFile(destino);
    console.log(`Archivo guardado correctamente: ${destino}`);

    chunkIndex++;
  }
}

// Ejemplo de uso
const modeloPath = 'C:\\Netrona\\modelos\\CadenaCustodiaNuevo.xlsx';
const destinoBase = 'C:\\Netrona\\modelos\\output.xlsx';
const muestras = ['Muestra1', 'Muestra2', 'Muestra3', 'Muestra4', 'Muestra5', 'Muestra6', 'Muestra7', 'Muestra8', 'Muestra9', 'Muestra10', 'Muestra11', 'Muestra12', 'Muestra13'];
const analisis = ['Analisis1', 'Analisis2', 'Analisis3', 'Analisis4', 'Analisis5', 'Analisis6', 'Analisis7', 'Analisis8', 'Analisis9', 'Analisis10', 'Analisis11', 'Analisis12'];

procesarExcel(modeloPath, destinoBase, muestras, analisis).catch(console.error);
