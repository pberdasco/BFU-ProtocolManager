// --- generateDOC.js---
import fs from 'fs';
import path from 'path';
import logger from '../../../utils/logger.js';
import { Packer } from 'docx';
import { generarNombreArchivoConFecha } from '../../../utils/filenameGenerator.js';
import { stdErrorMsg } from '../../../utils/stdError.js';
import {
    buildDoc,
    createSection,
    buildSectionTitle,
    buildSectionIntro,
    buildImageBlock,
    buildCaption
    // buildNewPage
} from './generateDocBlocks.js';
import { headerText, sections } from './docConfig.js';

/**
 * Crea un .docx con los gráficos agrupados en secciones según la configuración.
 * Inserta un salto de página entre secciones cuando corresponde.
 * @param {Array} charts - Datos de gráficos (pozoId, graficoId, section, CP, pngPath, etc.)
 * @param {string} basePath - Directorio donde grabar el .docx
 * @param {string} proyectoNombre - va al header del documento
 * @param {Object <{desde: string, hasta: string}>} rangoFechas - fechas con formato: 'marzo de 2018'
 */
export async function createReport (charts, basePath, proyectoNombre = 'XXXXXX', rangoFechas = { desde: 'XXXXXXX', hasta: 'XXXXXXX' }) {
    const rangoFormateado = `${rangoFechas.desde} y ${rangoFechas.hasta}`;
    const headerTextFinal = headerText.replace('{SubP}', proyectoNombre);

    // Agrupar gráficos por sección: objeto con {seccion: [array de graficos]}
    const graficosPorSeccion = {};
    charts.forEach(grafico => {
        if (grafico.status === 'Fail') {
            logger.warn(`[graficosPorSeccion] Gráfico omitido por fallo previo: ${grafico.graficoNombre}-${grafico.pozo}`);
            return; // No procesar graficos fallidos en ninguna seccion
        }
        if (!graficosPorSeccion[grafico.section]) {
            graficosPorSeccion[grafico.section] = [];
        }
        graficosPorSeccion[grafico.section].push(grafico);
    });
    // Filtrar y ordenar secciones según configuración
    const seccionesOrdenadas = sections
        .filter(({ order }) => graficosPorSeccion[order]?.length > 0)
        .sort((a, b) => a.order - b.order);

    // Construir cada sección de docx
    const docxSections = seccionesOrdenadas.map((seccion, idx) => {
        const graficos = graficosPorSeccion[seccion.order];

        // Compuestos únicos
        const compuestosUnicos = [...new Set(graficos.map(g => g.CP))];
        const compuestosTexto = formatearListaCompuestos(compuestosUnicos);

        // Título y párrafo de sección
        const titulo = seccion.title;
        const parrafoText = seccion.paragraph
            .replace('{RF}', rangoFormateado)
            .replace('{CPS}', compuestosTexto);

        const elements = [];
        elements.push(buildSectionTitle(titulo));
        elements.push(buildSectionIntro(parrafoText));

        // Ordenar gráficos
        graficos.sort((a, b) =>
            a.pozoId !== b.pozoId ? a.pozoId - b.pozoId : a.graficoId - b.graficoId
        );

        // Agregar imágenes y epígrafes
        graficos.forEach((grafico, i) => {
            const letter = String.fromCharCode(97 + i);
            const captionText = seccion.graphCaption
                .replace('{sn}', idx + 1)
                .replace('{gl}', letter)
                .replace('{POZO}', grafico.pozo)
                .replace('{CP}', grafico.CP);

            elements.push(buildImageBlock(grafico.pngPath));
            elements.push(buildCaption(captionText));
        });

        // Salto de página entre secciones (excepto la última)
        // if (idx < seccionesOrdenadas.length - 1) {
        //     elements.push(buildNewPage());
        // }

        return createSection(elements, headerTextFinal);
    });

    // Generar documento
    const fileName = generarNombreArchivoConFecha('EV', proyectoNombre, 'docx');
    const fullPath = path.join(basePath, fileName);

    try {
        const doc = buildDoc(docxSections);
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(fullPath, buffer);
        logger.info(`Generado el docx ${fileName} del anexo EvolucionCDI`);
        return { id: 2, path: basePath, file: fileName, zipName: `EV_${proyectoNombre}`, type: 'docx' };
    } catch (error) {
        logger.error('[evolucionCDI-] generateDOC');
        throw stdErrorMsg(error.status, error.message || '[evolucionCDI-] generateDOC error');
    }
}

/**
 * Formatea una lista de compuestos en texto legible
 * @param {Array} compuestos - Lista de nombres de compuestos
 * @returns {string} - Texto formateado con la lista de compuestos
 */
function formatearListaCompuestos (compuestos) {
    if (compuestos.length === 0) return '';
    if (compuestos.length === 1) return compuestos[0];
    if (compuestos.length === 2) return `${compuestos[0]} y ${compuestos[1]}`;

    const ultimo = compuestos.pop();
    return `${compuestos.join(', ')} y ${ultimo}`;
}
