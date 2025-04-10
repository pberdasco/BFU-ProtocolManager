import { Paragraph, Table, WidthType } from 'docx';

import {
    splitSamples, createFechaMuestreoRow, createLaboratorioRow, createOPDSRows, setNombresMuestras, setSustanciaProfundidad, setSustanciaMuestra,
    createCompoundRow, createEpigrafeParagraph, createTablaSeccionConEpigrafe, createSubTitleParagraph, createMainTitleParagraph, buildDoc
} from './cadenaTODOCTabla_Helper.js';
import LqsService from './lqs_service.js';
import UMService from './um_service.js';

const MAX_MUESTRAS_COLS = 2;
const MAX_FILAS_LINES = 10;

export async function generateReport (proyectoNombre, fechaMuestreo, data) {
    const matrices = {
        1: 'Agua',
        2: 'FLNA',
        3: 'Suelo',
        4: 'Gases'
    };

    const LqKeysToSearch = data.filas.map(x => {
        // TODO: asume que los LQs son generales y no por laboratorio y que están cargados todos al laboratorio 1.
        // La opción sería tomar el laboratorio de la primera muestra.
        return { compuestoId: x.compuestoId, metodoId: x.metodoId, laboratorioId: 1 };
    });
    const LQs = await LqsService.getByCompuestoMetodoLab(LqKeysToSearch);
    const UMs = await UMService.getAll({ where: null, values: [], order: [], limit: 100, offset: 0 }); // nunca hay mas de 100 UMs (son menos de 20 en realidad)

    const sections = [];
    let mainTitleAdded = false;

    Object.entries(matrices).forEach(([matrixId, matrixName]) => {
        const muestrasOriginal = data.muestras.filter(m => m.matriz === Number(matrixId));
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

            const allTienenCadena = muestrasBloque.every(m => m.cadenaOPDS);
            if (allTienenCadena) {
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
                nombresMuestras.some(sampleName => Object.prototype.hasOwnProperty.call(fila, sampleName))
            );
            const compoundRows = filasForMatrix.map(fila => createCompoundRow(fila, data, LQs, UMs, muestrasBloque, matrixId));

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

    if (sections.length === 0) {
        const error = new Error('No hay datos disponibles para generar el reporte.');
        error.status = 204;
        error.code = 'NO_DATA';
        throw error;
    }

    return buildDoc(sections, proyectoNombre);
}
