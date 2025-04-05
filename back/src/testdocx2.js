import fs from 'node:fs/promises';
import path from 'node:path';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, ShadingType, PageOrientation, Header, VerticalAlign } from 'docx';

export function generateReport (proyectoNombre, fechaMuestreo, data) {
    const matrices = {
        1: 'Agua',
        2: 'FLNA',
        3: 'Suelo',
        4: 'Gases'
    };

    const sections = [];

    const greyCell = (text, opts = {}) =>
        new TableCell({
            children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
            verticalAlign: VerticalAlign.CENTER,
            ...opts
        });

    Object.entries(matrices).forEach(([matrixId, matrixName]) => {
        const muestras = data.muestras.filter(m => m.matriz === Number(matrixId));
        if (muestras.length === 0) return;

        const sampleNames = muestras.map(s => s.muestra);

        const extraHeaderRows = [];

        // --- Fila 1: Fecha de muestreo ---
        extraHeaderRows.push(new TableRow({
            children: [
                greyCell('Fecha de muestreo', { columnSpan: 3 }),
                ...muestras.map(() =>
                    new TableCell({
                        children: [new Paragraph({ text: fechaMuestreo, alignment: AlignmentType.CENTER })],
                        shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                    })
                )
            ]
        }));

        // --- Fila 2: Laboratorio ---
        const laboratorioIds = [...new Set(muestras.map(s => s.laboratorioId))];
        if (laboratorioIds.length === 1) {
            const nombre = data.laboratorios.find(l => l.id === laboratorioIds[0])?.nombre || 'Desconocido';
            extraHeaderRows.push(new TableRow({
                children: [
                    greyCell('Laboratorio', { columnSpan: 3 }),
                    ...muestras.map(() =>
                        new TableCell({
                            children: [new Paragraph({ text: nombre, alignment: AlignmentType.CENTER })],
                            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                        })
                    )
                ]
            }));
        } else {
            extraHeaderRows.push(new TableRow({
                children: [
                    greyCell('Laboratorio', { columnSpan: 3 }),
                    ...muestras.map(s => {
                        const nombre = data.laboratorios.find(l => l.id === s.laboratorioId)?.nombre || '';
                        return new TableCell({
                            children: [new Paragraph({ text: nombre })],
                            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                        });
                    })
                ]
            }));
        }

        // --- OPDS si corresponde ---
        const allTienenCadena = muestras.every(m => m.cadenaOPDS);
        if (allTienenCadena) {
            extraHeaderRows.push(new TableRow({
                children: [
                    greyCell('N° Cadena custodia OPDS', { columnSpan: 3 }),
                    ...muestras.map(s =>
                        new TableCell({
                            children: [new Paragraph(s.cadenaOPDS)],
                            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                        })
                    )
                ]
            }));
            extraHeaderRows.push(new TableRow({
                children: [
                    greyCell('N° Protocolo OPDS', { columnSpan: 3 }),
                    ...muestras.map(s =>
                        new TableCell({
                            children: [new Paragraph(s.protocoloOPDS || '')],
                            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                        })
                    )
                ]
            }));
        }

        // --- Profundidad si es suelo ---
        if (Number(matrixId) === 3) {
            extraHeaderRows.push(new TableRow({
                children: [
                    greyCell('Profundidad (m)'),
                    ...muestras.map(s =>
                        new TableCell({ children: [new Paragraph(s.profundidad || '')] })
                    )
                ]
            }));
        }

        // --- Cabecera de sustancia / LC / UM + muestras ---
        const headerRow = new TableRow({
            children: [
                greyCell('Sustancia', { width: { size: 15, type: WidthType.PERCENTAGE } }),
                greyCell('LC'),
                greyCell('UM'),
                ...muestras.map(s =>
                    new TableCell({
                        children: [new Paragraph({ text: s.muestra })],
                        shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                    })
                )
            ]
        });

        const filasForMatrix = data.filas.filter(fila =>
            sampleNames.some(sampleName => Object.prototype.hasOwnProperty.call(fila, sampleName))
        );

        const compoundRows = filasForMatrix.map(fila => {
            const comp = data.compuestos.find(c => c.id === fila.compuestoId);
            const compoundName = comp ? (comp.nombre || comp.compuesto) : `Compuesto ${fila.compuestoId}`;

            const nivelGuia = data.nivelesGuia.find(n =>
                n.compuestoId === fila.compuestoId && n.matrizId === Number(matrixId)
            );

            const lc = nivelGuia?.valorReferencia ?? '';
            const um = nivelGuia?.um ?? '';

            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(compoundName)] }),
                    new TableCell({ children: [new Paragraph(String(lc))] }),
                    new TableCell({ children: [new Paragraph(String(um))] }),
                    ...muestras.map(s => {
                        let val = fila[s.muestra];
                        if (val === -1) val = 'NC';
                        else if (val === -2) val = 'NL';
                        else if (val == null) val = '';
                        return new TableCell({ children: [new Paragraph(String(val))] });
                    })
                ]
            });
        });

        const table = new Table({
            rows: [...extraHeaderRows, headerRow, ...compoundRows],
            width: { size: 100, type: WidthType.PERCENTAGE }
        });

        const titulo = new Paragraph({
            text: `Resultados de análisis sobre ${matrixName}`,
            heading: 'Heading1'
        });

        sections.push({
            properties: {
                page: {
                    size: {
                        orientation: PageOrientation.LANDSCAPE
                    },
                    margin: {
                        top: 1440,
                        bottom: 1440,
                        left: 1134, // 2 cm
                        right: 850 // 1.5 cm
                    }
                }
            },
            children: [titulo, table, new Paragraph('')]
        });
    });

    if (sections.length === 0) {
        sections.push({
            children: [new Paragraph('No hay datos disponibles para generar el reporte.')]
        });
    }

    const doc = new Document({
        creator: 'Netrona',
        title: 'Reporte de análisis',
        description: 'Informe generado automáticamente por BFU Protocol Manager',
        sections: sections.map(section => ({
            ...section,
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${proyectoNombre} / Anexo BfU de Argentina S.A.\t\t\t\t\tAnexo 3`,
                                    font: 'Times New Roman',
                                    size: 20
                                })
                            ],
                            alignment: AlignmentType.LEFT
                        })
                    ]
                })
            }
        }))
    });

    return doc;
}

/**
 * Genera el archivo DOCX y lo graba en el disco.
 * @param {string} proyectoNombre
 * @param {string} fechaMuestreo
 * @param {object} data - Contiene muestras, filas, nivelesGuia, compuestos, laboratorios
 * @param {string} basePath - Ruta donde guardar el archivo
 * @param {string} fileName - Nombre del archivo, ej: 'Reporte.docx'
 * @returns {Promise<{ id: number, path: string, file: string }>}
 */
export async function exportarDocx (proyectoNombre, fechaMuestreo, data, basePath, fileName) {
    const doc = generateReport(proyectoNombre, fechaMuestreo, data);
    const fullPath = path.join(basePath, fileName);

    try {
        const buffer = await Packer.toBuffer(doc);
        await fs.writeFile(fullPath, buffer);
        return { id: 0, path: basePath, file: fileName };
    } catch (err) {
        let message = err.message;
        let status = err.status;

        if (err.code === 'EBUSY') {
            status = 423;
            message = `El archivo ${err.path || 'desconocido'} está abierto. No se pudo grabar.`;
        }

        const error = new Error(message || 'Error al generar el documento DOCX');
        error.status = status || 503;
        throw error;
    }
}
