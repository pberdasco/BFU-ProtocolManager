import { Paragraph, Table, WidthType } from 'docx';

import {
    splitSamples, createFechaMuestreoRow, createLaboratorioRow, createOPDSRows, setNombresMuestras, setSustanciaProfundidad, setSustanciaMuestra,
    createCompoundRow, createEpigrafeParagraph, createTablaSeccionConEpigrafe, createSubTitleParagraph, createMainTitleParagraph, buildDoc
} from './cadenaTODOCTabla_Helper.js';
import { determinarUMFila, verificarConversionesFallidas } from './cadenaTODOCTabla_UMs.js';
import LqsService from '../../lqs_service.js';
import UMService from '../../um_service.js';
import UMConvertService from '../../umConvert_service.js';

const MAX_MUESTRAS_COLS = 8;
const MAX_FILAS_LINES = 25;

const matrices = {
    1: 'Agua',
    2: 'FLNA',
    3: 'Suelo',
    4: 'Gases'
};

export async function generateReport (proyectoNombre, fechaMuestreo, data) {
    // seleccionar el laboratorio de la primera muestra para definir que tabla de LQs usar
    const laboratorioIdPrimeraMuestra = data.muestras[0]?.laboratorioId || 1;
    const LqKeysToSearch = data.filas.map(x => {
        return { compuestoId: x.compuestoId, metodoId: x.metodoId, laboratorioId: laboratorioIdPrimeraMuestra };
    });
    const LQs = await LqsService.getByCompuestoMetodoLab(LqKeysToSearch);
    const UMs = await UMService.getAll({ where: null, values: [], order: [], limit: 100, offset: 0 }); // nunca hay mas de 100 UMs (son menos de 20 en realidad)
    const umConvert = await UMConvertService.getAll();

    // Crear un array para rastrear conversiones fallidas
    const conversionesFallidas = [];

    const sections = [];
    let mainTitleAdded = false;

    Object.entries(matrices).forEach(([matrixId, matrixName]) => {
        const muestrasRaw = data.muestras.filter(m => m.matriz === Number(matrixId));

        // const muestrasOriginal = muestrasRaw;
        const muestrasOriginal = muestrasRaw.filter(m => {
            return data.filas.some(fila => {
                const val = fila[m.muestra];
                return val !== null && val !== undefined && val !== -3;
            });
        });

        if (muestrasOriginal.length === 0) return;

        const bloquesMuestras = splitSamples(muestrasOriginal, MAX_MUESTRAS_COLS);

        let epigrafeCounter = 1;
        let totalSubtables = 0;
        let subtitleAdded = false;

        bloquesMuestras.forEach((muestrasBloque, bloqueIndex) => {
            const nombresMuestras = muestrasBloque.map(s => s.muestra);

            // * == Cabeceras de las tablas (headerRows) == *
            const headerRows = [];

            headerRows.push(createFechaMuestreoRow(fechaMuestreo, muestrasBloque)); // TODO: sacarle las horas a fechaMuestreo
            headerRows.push(createLaboratorioRow(muestrasBloque, data));

            const anyTienenCadena = muestrasBloque.some(m => m.cadenaOPDS);
            if (anyTienenCadena) {
                const [rowCadena, rowProtocolo] = createOPDSRows(muestrasBloque);
                headerRows.push(rowCadena);
                headerRows.push(rowProtocolo);
            }

            if (Number(matrixId) === 3) { // ? 3 = Suelo
                headerRows.push(setNombresMuestras(muestrasBloque));
                headerRows.push(setSustanciaProfundidad(muestrasBloque));
            } else {
                headerRows.push(setSustanciaMuestra(muestrasBloque));
            }

            // * == Detalle de las tablas == *
            const filasForMatrix = data.filas.filter(fila =>
                nombresMuestras.some(sampleName => Object.prototype.hasOwnProperty.call(fila, sampleName)) // ~= fila.hasOwnProperty(sampleName)
            );

            // Modificación para usar las nuevas funciones de conversión
            const compoundRows = filasForMatrix.map(fila => {
                // Determinar nivel guía para este compuesto/matriz
                const nivelGuia = data.nivelesGuia.find(n =>
                    n.compuestoId === fila.compuestoId && n.matrizId === Number(matrixId)
                );

                // Determinar la UM correcta para esta fila
                const umFila = determinarUMFila(fila, nivelGuia, UMs);

                // Crear la fila con la información de UM
                return createCompoundRow(
                    fila,
                    data,
                    LQs,
                    UMs,
                    muestrasBloque,
                    matrixId,
                    umFila,
                    umConvert,
                    conversionesFallidas
                );
            });

            const totalChunks = Math.ceil(compoundRows.length / MAX_FILAS_LINES);
            totalSubtables = totalChunks * bloquesMuestras.length;

            for (let i = 0, chunkIndex = 0; i < compoundRows.length; i += MAX_FILAS_LINES, chunkIndex++) {
                const chunk = compoundRows.slice(i, i + MAX_FILAS_LINES);
                const tableRows = [...headerRows, ...chunk];

                const epigrafe = createEpigrafeParagraph(matrixId, matrixName, epigrafeCounter, totalSubtables);
                epigrafeCounter++;

                const tableChunk = new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE }
                });

                // Se arma el arreglo de elementos para la sección; si hay más de un chunk se coloca salto de página
                const elements = [];
                if (!mainTitleAdded) {
                    elements.push(createMainTitleParagraph());
                    mainTitleAdded = true;
                }
                if (!subtitleAdded) {
                    elements.push(createSubTitleParagraph(matrixName));
                    subtitleAdded = true;
                }
                if (chunkIndex > 0) {
                    elements.push(new Paragraph({ text: '', pageBreakBefore: true }));
                }
                elements.push(tableChunk, epigrafe, new Paragraph(''));

                sections.push(createTablaSeccionConEpigrafe(elements, proyectoNombre));
            }
        });
    });

    // Verificar si hay datos para generar el reporte
    if (sections.length === 0) {
        const error = new Error('No hay datos disponibles para generar el reporte.');
        error.status = 204;
        error.code = 'NO_DATA';
        throw error;
    }

    // Verificar si hay conversiones fallidas
    const errorConversiones = verificarConversionesFallidas(conversionesFallidas, UMs);
    if (errorConversiones) {
        const error = new Error(errorConversiones);
        error.status = 400;
        error.code = 'CONVERSION_ERROR';
        throw error;
    }

    return buildDoc(sections, proyectoNombre);
}
