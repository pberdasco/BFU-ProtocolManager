// --- generateDocBlocks.js (refactor) ---
import fs from 'fs';
import {
    Document,
    Paragraph,
    TextRun,
    ImageRun,
    PageOrientation,
    Header,
    AlignmentType
} from 'docx';
import { styles } from './docConfig.js';

/**
 * Construye el documento principal con metadatos.
 */
export function buildDoc (sections) {
    return new Document({
        creator: 'Netrona',
        title: 'Reporte Evolucion CDI',
        description: 'Informe generado automáticamente por BFU Protocol Manager',
        sections
    });
}

/**
 * Crea una sección de documento con márgenes, orientación y cabecera.
 */
export function createSection (elements, headerTextFinal) {
    return {
        properties: {
            page: {
                size: { orientation: PageOrientation.PORTRAIT },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        headers: {
            default: new Header({ children: [buildParagraph(headerTextFinal)] })
        },
        children: elements
    };
}

/**
 * Construye el párrafo de cabecera en cada sección usando buildParagraph.
 */
export function buildHeaderParagraph (text) {
    const { font, size } = styles.header;
    return buildParagraph(text, { font, size });
}

/**
 * Título de sección: negrita, tamaño stdParagraph, spacingAfter 200.
 */
export function buildSectionTitle (text) {
    return buildParagraph(text, {
        bold: true,
        size: styles.stdParagraph.size,
        spacingAfter: 200
    });
}

/**
 * Párrafo introductorio: tamaño stdParagraph, spacingAfter 300.
 */
export function buildSectionIntro (text) {
    return buildParagraph(text, {
        size: styles.stdParagraph.size,
        spacingAfter: 300
    });
}

/**
 * Construye un párrafo genérico usando estilos estándar.
 */
export function buildParagraph (text, override = {}) {
    const { font, size, bold, italics, spacingAfter } = {
        ...styles.stdParagraph,
        ...override
    };
    return new Paragraph({
        children: [new TextRun({ text, font, size, bold, italics })],
        spacing: { after: spacingAfter }
    });
}

/**
 * Genera un salto de página antes de este párrafo.
 */
export function buildNewPage () {
    return new Paragraph({ pageBreakBefore: true, children: [] });
}

/**
 * Genera un bloque de imagen con tamaño fijo.
 */
export function buildImageBlock (pngPath, width = 600, height = 300) {
    const data = fs.readFileSync(pngPath);
    return new Paragraph({
        children: [new ImageRun({ type: 'png', data, transformation: { width, height } })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
    });
}

/**
 * Construye el epígrafe de la imagen (centrado e itálico).
 */
export function buildCaption (text) {
    const { font, size, italics, spacingAfter } = styles.caption;
    return new Paragraph({
        children: [new TextRun({ text, font, size, italics })],
        spacing: { after: spacingAfter }
    });
}
