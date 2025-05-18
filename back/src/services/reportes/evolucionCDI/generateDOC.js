import fs from 'fs';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Header,
    ImageRun,
    AlignmentType
} from 'docx';

// Importamos configuraciones de secciones desde archivo separado
import { headerText, sections } from './docConfig.js';

/**
 * Crea un documento .docx según el JSON de entrada y configuración de secciones.
 *
 * @param {Array} charts - Array de objetos con propiedades:
 *    pozoId, pozo, graficoId, graficoNombre, chartName, pngPath, status, cpIdsFailed, section, CP
 * @param {string} outputFilePath - Ruta donde se guardará el .docx
 * @param {Object} params - Parámetros adicionales como proyectoNombre y rangoFechas
 */
async function createReport (charts, outputFilePath, params = {}) {
    const { proyectoNombre = 'XXXXXXX', rangoFechas = { desde: 'XXXXXXX', hasta: 'XXXXXXX' } } = params;

    // Formatear el rango de fechas
    const rangoFormateado = `${rangoFechas.desde} y ${rangoFechas.hasta}`;

    // Reemplazar placeholders en el encabezado
    const headerTextFinal = headerText.replace('{SubP}', proyectoNombre);

    // Agrupar gráficos por sección
    const graficosPorSeccion = {};
    charts.forEach(grafico => {
        if (!graficosPorSeccion[grafico.section]) {
            graficosPorSeccion[grafico.section] = [];
        }
        graficosPorSeccion[grafico.section].push(grafico);
    });

    // Ordenar secciones según la propiedad 'order' de la configuración
    const seccionesOrdenadas = sections
        .filter(seccion => graficosPorSeccion[seccion.order] && graficosPorSeccion[seccion.order].length > 0)
        .sort((a, b) => a.order - b.order);

    // Construir array de Paragraphs para el documento
    const children = [];

    // Procesar cada sección que tenga gráficos
    seccionesOrdenadas.forEach((seccion, seccionIndex) => {
        const graficosSeccion = graficosPorSeccion[seccion.order] || [];

        // Si no hay gráficos en esta sección, la saltamos
        if (graficosSeccion.length === 0) return;

        // Obtener lista de compuestos únicos en esta sección para el placeholder {CPS}
        const compuestosUnicos = [...new Set(graficosSeccion.map(g => g.CP))];
        const compuestosTexto = formatearListaCompuestos(compuestosUnicos);

        // Reemplazar placeholders en el texto de la sección
        const tituloFinal = seccion.title;
        const parrafoFinal = seccion.paragraph
            .replace('{RF}', rangoFormateado)
            .replace('{CPS}', compuestosTexto);

        // Agregar título de sección
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: tituloFinal,
                        bold: true,
                        font: 'Times New Roman',
                        size: 24 // 12 points = 24 half-points
                    })
                ],
                spacing: { after: 200 }
            })
        );

        // Agregar párrafo de sección
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: parrafoFinal,
                        font: 'Times New Roman',
                        size: 24
                    })
                ],
                spacing: { after: 300 }
            })
        );

        // Ordenar gráficos por pozo
        const graficosOrdenados = [...graficosSeccion].sort((a, b) => {
            // Primero ordenar por pozoId
            if (a.pozoId !== b.pozoId) {
                return a.pozoId - b.pozoId;
            }
            // Si son del mismo pozo, ordenar por graficoId
            return a.graficoId - b.graficoId;
        });

        // Número de sección (count de secciones mostradas)
        const seccionNumero = seccionIndex + 1;

        // Agregar gráficos e imágenes
        graficosOrdenados.forEach((grafico, idx) => {
            // Letra del gráfico (a, b, c...) que se reinicia en cada sección
            const graphLetter = String.fromCharCode(97 + idx);

            // Crear el caption reemplazando los placeholders
            const caption = seccion.graphCaption
                .replace('{sn}', seccionNumero)
                .replace('{gl}', graphLetter)
                .replace('{POZO}', grafico.pozo)
                .replace('{CP}', grafico.CP);

            // Imagen
            children.push(
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: fs.readFileSync(grafico.pngPath),
                            transformation: { width: 600, height: 400 },
                            extension: 'png',
                            docPr: {
                                id: seccionIndex + idx, // cualquier valor único por imagen
                                name: `S${seccionIndex}-G${idx}`
                            }
                        })
                    ],
                    spacing: { after: 100 }
                })
            );

            // Epígrafe centrado e itálica
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: caption,
                            italics: true,
                            font: 'Times New Roman',
                            size: 20 // 10 points
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 }
                })
            );
        });
    });

    // Construir el documento con header
    const doc = new Document({
        sections: [
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: headerTextFinal,
                                        font: 'Times New Roman',
                                        size: 20
                                    })
                                ]
                            })
                        ]
                    })
                },
                children
            }
        ]
    });

    // Empaquetar y escribir fichero
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputFilePath, buffer);
    console.log(`Documento generado en ${outputFilePath}`);
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

// Mock para pruebas
const charts = [
    {
        pozoId: 30,
        pozo: 'PM1',
        graficoId: 1,
        graficoNombre: 'NP-BTEX',
        chartName: 'PM1-NP-BTEX-266',
        pngPath: 'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\images\\PM1-NP-BTEX-266.png',
        status: 'Warn',
        cpIdsFailed: [129],
        section: 2, // new
        CP: 'BTEX' // new
    },
    {
        pozoId: 30,
        pozo: 'PM1',
        graficoId: 3,
        graficoNombre: 'Naftaleno',
        chartName: 'PM1-Naftaleno-266',
        pngPath: 'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\images\\PM1-Naftaleno-266.png',
        status: 'Ok',
        section: 2,
        CP: 'Naftaleno'
    },
    {
        pozoId: 31,
        pozo: 'PM2',
        graficoId: 1,
        graficoNombre: 'NP-BTEX',
        chartName: 'PM2-NP-BTEX-266',
        pngPath: 'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\images\\PM2-NP-BTEX-266.png',
        status: 'Warn',
        cpIdsFailed: [129],
        section: 2,
        CP: 'BTEX'
    },
    {
        pozoId: 31,
        pozo: 'PM2',
        graficoId: 3,
        graficoNombre: 'Naftaleno',
        chartName: 'PM2-Naftaleno-266',
        pngPath: 'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\images\\PM2-Naftaleno-266.png',
        status: 'Ok',
        section: 2,
        CP: 'Naftaleno'
    },
    {
        pozoId: 35,
        pozo: 'PM6',
        graficoId: 1,
        graficoNombre: 'NP-BTEX',
        chartName: 'PM6-NP-BTEX-266',
        pngPath: 'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\images\\PM6-NP-BTEX-266.png',
        status: 'Warn',
        cpIdsFailed: [129],
        section: 2,
        CP: 'BTEX'
    },
    {
        pozoId: 35,
        pozo: 'PM6',
        graficoId: 4,
        graficoNombre: 'PAHs-HTP',
        chartName: 'PM6-PAHs-HTP-266',
        pngPath: 'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\images\\PM6-PAHs-HTP-266.png',
        status: 'Ok',
        section: 1,
        CP: 'PAHs'
    }
];

// Parámetros adicionales para la generación del informe
const params = {
    proyectoNombre: 'Estación ABC',
    rangoFechas: {
        desde: 'enero de 2016',
        hasta: 'mayo de 2024'
    }
};

(async () => {
    try {
        // Generamos el documento con los parámetros adicionales
        await createReport(
            charts,
            'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\Evolucion_MonitoreoX2.docx',
            params
        );
        console.log('Documento creado correctamente');
    } catch (err) {
        console.error('Error al generar el documento:', err);
    }
})();
