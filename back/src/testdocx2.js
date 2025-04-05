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

    // Divide muestras en bloques balanceados (ej: 13 -> [7,6], 25 -> [9,8,8])
    function splitSamples (allSamples) {
        const total = allSamples.length;
        if (total <= 12) return [allSamples];

        const bloques = [];
        const calcularPartes = () => {
            const partes = [];
            let restante = total;
            while (restante > 12) {
                const next = Math.ceil(restante / Math.ceil(restante / 12));
                partes.push(next);
                restante -= next;
            }
            partes.push(restante);
            return partes;
        };

        const partes = calcularPartes();
        let inicio = 0;
        for (const cantidad of partes) {
            bloques.push(allSamples.slice(inicio, inicio + cantidad));
            inicio += cantidad;
        }

        return bloques;
    }

    const sections = [];

    const greyCell = (text, opts = {}) =>
        new TableCell({
            children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
            verticalAlign: VerticalAlign.CENTER,
            ...opts
        });

    Object.entries(matrices).forEach(([matrixId, matrixName]) => {
        const muestrasOriginal = data.muestras.filter(m => m.matriz === Number(matrixId));
        if (muestrasOriginal.length === 0) return;

        const sampleBlocks = splitSamples(muestrasOriginal);

        sampleBlocks.forEach((muestrasBloque, bloqueIndex) => {
            const sampleNames = muestrasBloque.map(s => s.muestra);

            const extraHeaderRows = [];

            // Fila 1: Fecha de muestreo (única y centrada)
            extraHeaderRows.push(new TableRow({
                children: [
                    greyCell('Fecha de muestreo', { columnSpan: 3 }),
                    new TableCell({
                        children: [new Paragraph({ text: fechaMuestreo, alignment: AlignmentType.CENTER })],
                        shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
                        columnSpan: muestrasBloque.length
                    })
                ]
            }));

            // Fila 2: Laboratorio (agrupado si todos iguales)
            const laboratorioIds = [...new Set(muestrasBloque.map(s => s.laboratorioId))];
            const colspan = muestrasBloque.length;

            if (laboratorioIds.length === 1) {
                const nombre = data.laboratorios.find(l => l.id === laboratorioIds[0])?.nombre || 'Desconocido';
                extraHeaderRows.push(new TableRow({
                    children: [
                        greyCell('Laboratorio', { columnSpan: 3 }),
                        new TableCell({
                            children: [new Paragraph({ text: nombre, alignment: AlignmentType.CENTER })],
                            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
                            columnSpan: colspan
                        })
                    ]
                }));
            } else {
                extraHeaderRows.push(new TableRow({
                    children: [
                        greyCell('Laboratorio', { columnSpan: 3 }),
                        ...muestrasBloque.map(s => {
                            const nombre = data.laboratorios.find(l => l.id === s.laboratorioId)?.nombre || '';
                            return new TableCell({
                                children: [new Paragraph({ text: nombre })],
                                shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                            });
                        })
                    ]
                }));
            }

            // OPDS si todas tienen
            const allTienenCadena = muestrasBloque.every(m => m.cadenaOPDS);
            if (allTienenCadena) {
                extraHeaderRows.push(new TableRow({
                    children: [
                        greyCell('N° Cadena custodia OPDS', { columnSpan: 3 }),
                        ...muestrasBloque.map(s =>
                            new TableCell({
                                children: [new Paragraph({ text: s.cadenaOPDS, alignment: AlignmentType.CENTER })],
                                shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                            })
                        )
                    ]
                }));
                extraHeaderRows.push(new TableRow({
                    children: [
                        greyCell('N° Protocolo OPDS', { columnSpan: 3 }),
                        ...muestrasBloque.map(s =>
                            new TableCell({
                                children: [new Paragraph({ text: s.protocoloOPDS || '', alignment: AlignmentType.CENTER })],
                                shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                            })
                        )
                    ]
                }));
            }

            // Profundidad si es suelo
            if (Number(matrixId) === 3) {
                extraHeaderRows.push(new TableRow({
                    children: [
                        greyCell('Profundidad (m)', { columnSpan: 3 }),
                        ...muestrasBloque.map(s =>
                            new TableCell({
                                children: [new Paragraph({ text: s.profundidad || '', alignment: AlignmentType.CENTER })],
                                shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                            })
                        )
                    ]
                }));
            }

            // Cabecera
            const headerRow = new TableRow({
                children: [
                    greyCell('Sustancia', { width: { size: 15, type: WidthType.PERCENTAGE } }),
                    greyCell('LC'),
                    greyCell('UM'),
                    ...muestrasBloque.map(s =>
                        new TableCell({
                            children: [new Paragraph({ text: s.muestra, alignment: AlignmentType.CENTER })],
                            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' }
                        })
                    ),
                    greyCell('Guía')
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
                        new TableCell({ children: [new Paragraph({ text: compoundName, alignment: AlignmentType.LEFT })] }),
                        new TableCell({ children: [new Paragraph({ text: String(lc), alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ text: String(um), alignment: AlignmentType.CENTER })] }),
                        ...muestrasBloque.map(s => {
                            let val = fila[s.muestra];
                            if (val === -1) val = 'NC';
                            else if (val === -2) val = 'NL';
                            else if (val == null) val = '';
                            return new TableCell({
                                children: [new Paragraph({ text: String(val), alignment: AlignmentType.CENTER })]
                            });
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: String(nivelGuia?.valorReferencia || ''), alignment: AlignmentType.CENTER })]
                        })
                    ]
                });
            });

            const table = new Table({
                rows: [...extraHeaderRows, headerRow, ...compoundRows],
                width: { size: 100, type: WidthType.PERCENTAGE }
            });

            const letra = { 1: 'a', 2: 'b', 3: 'c', 4: 'd' }[Number(matrixId)] || '';
            const epigrafeTexto = `Tabla 1${letra}: (${bloqueIndex + 1}/${sampleBlocks.length}) Resultados de análisis sobre ${matrixName.toLowerCase()}${Number(matrixId) === 1 ? ' subterránea' : ''}. LC: límite de cuantificación del método. NC: no cuantificado. NL: no legislado.`;

            const epigrafe = new Paragraph({
                children: [new TextRun({
                    text: epigrafeTexto,
                    font: 'Times New Roman',
                    size: 20 // 10 pt = 20 half-points
                })],
                spacing: { after: 100 }
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
                            left: 1134,
                            right: 850
                        }
                    }
                },
                children: [table, epigrafe, new Paragraph('')]
            });
        });
    });

    if (sections.length === 0) {
        sections.push({
            children: [new Paragraph('No hay datos disponibles para generar el reporte.')]
        });
    }

    return new Document({
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
