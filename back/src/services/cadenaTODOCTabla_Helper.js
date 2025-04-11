import { Document, Paragraph, TextRun, TableRow, TableCell, AlignmentType, WidthType, ShadingType, PageOrientation, Header, VerticalAlign } from 'docx';

const HEADER_COLOR = 'D9D9D9';
/**
 * Divide el arreglo de muestras en bloques balanceados. (ej: 13 -> [7,6], 25 -> [9,8,8])
 * @param {Array} allSamples - Lista de muestras a dividir.
 * @param {number} MAX_MUESTRAS_COLS - Constante con la cantidad maxims de muestras por tabla.
 * @returns {Array} Arreglo de bloques de muestras.
 */
export function splitSamples (allSamples, MAX_MUESTRAS_COLS) {
    const total = allSamples.length;
    if (total <= MAX_MUESTRAS_COLS) return [allSamples];

    const bloques = [];
    function calcularPartes () {
        const partes = [];
        let restante = total;
        while (restante > MAX_MUESTRAS_COLS) {
            const next = Math.ceil(restante / Math.ceil(restante / MAX_MUESTRAS_COLS));
            partes.push(next);
            restante -= next;
        }
        partes.push(restante);
        return partes;
    }

    const partes = calcularPartes();
    let inicio = 0;
    for (const cantidad of partes) {
        bloques.push(allSamples.slice(inicio, inicio + cantidad));
        inicio += cantidad;
    }

    return bloques;
}

export function createMainTitleParagraph () {
    return new Paragraph({
        children: [
            new TextRun({
                text: 'Resultados analíticos de laboratorio',
                font: 'Times New Roman',
                size: 24, // 12 pt
                bold: true
            })
        ],
        spacing: { after: 300 },
        alignment: AlignmentType.CENTER
    });
}

export function createSubTitleParagraph (matrixName) {
    let descriptor = '';
    switch (matrixName.toLowerCase()) {
    case 'agua':
        descriptor = 'agua subterránea';
        break;
    case 'flna':
        descriptor = 'fase libre';
        break;
    case 'suelo':
        descriptor = 'suelo';
        break;
    case 'gases':
        descriptor = 'gases';
        break;
    default:
        descriptor = matrixName.toLowerCase();
    }
    const text = 'Resultados de análisis sobre ' + descriptor;
    return new Paragraph({
        children: [
            new TextRun({
                text,
                font: 'Times New Roman',
                size: 24, // 12 pt
                underline: { type: 'single' }
            })
        ],
        spacing: { after: 200 },
        alignment: AlignmentType.LEFT
    });
}

// * Lineas de cabecera de tabla

function greyCell (text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
        shading: { fill: HEADER_COLOR, type: ShadingType.CLEAR, color: 'auto' },
        verticalAlign: VerticalAlign.CENTER,
        ...opts
    });
}

function celdaGuiaContinue () {
    return new TableCell({
        children: [],
        verticalMerge: 'continue'
    });
}

/**
 * Crea la fila de cabecera que muestra la fecha de muestreo.
 * @param {string} fechaMuestreo - La fecha de muestreo a mostrar.
 * @param {Array} muestrasBloque - Bloque de muestras actual.
 * @returns {TableRow} Fila de la tabla con la fecha de muestreo.
 */
export function createFechaMuestreoRow (fechaMuestreo, muestrasBloque) {
    const fechaFormateada = new Date(fechaMuestreo).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return new TableRow({
        children: [
            greyCell('Fecha de muestreo', { columnSpan: 3 }),
            greyCell(fechaFormateada, { columnSpan: muestrasBloque.length }),
            // Agregar celda "Guía" en la primera fila con verticalMerge restart
            new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Nivel' }),
                            new TextRun({ break: 1 }),
                            new TextRun({ text: 'Guía' })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ],
                shading: { fill: HEADER_COLOR, type: ShadingType.CLEAR, color: 'auto' },
                verticalMerge: 'restart',
                verticalAlign: VerticalAlign.CENTER
            })
        ]
    });
}

/**
 * Crea la fila de laboratorio, agrupando la información si todas las muestras provienen del mismo laboratorio.
 * ? Parece que siempre todas las muestras son del mismo laboratorio, si fuera asi se puede simplificar.
 * @param {Array} muestrasBloque - Bloque actual de muestras.
 * @param {Object} data - Objeto de datos que contiene la información de laboratorios.
 * @returns {TableRow} Fila de laboratorio.
 */
export function createLaboratorioRow (muestrasBloque, data) {
    const laboratorioIds = [...new Set(muestrasBloque.map(s => s.laboratorioId))];
    const colspan = muestrasBloque.length;

    if (laboratorioIds.length === 1) {
        const nombre = data.laboratorios.find(l => l.id === laboratorioIds[0])?.nombre || 'Desconocido';
        return new TableRow({
            children: [
                greyCell('Laboratorio', { columnSpan: 3 }),
                greyCell(nombre, { columnSpan: colspan }),
                celdaGuiaContinue()
            ]
        });
    } else {
        return new TableRow({
            children: [
                greyCell('Laboratorio', { columnSpan: 3 }),
                ...muestrasBloque.map(s => {
                    const nombre = data.laboratorios.find(l => l.id === s.laboratorioId)?.nombre || '';
                    return greyCell(nombre);
                }),
                celdaGuiaContinue()
            ]
        });
    }
}

/**
 * Crea las filas correspondientes a OPDS (Cadena custodia y Protocolo)
 * @param {Array} muestrasBloque - Bloque de muestras en uso.
 * @returns {Array} Arreglo con las filas de OPDS.
 */
export function createOPDSRows (muestrasBloque) {
    const rowCadena = new TableRow({
        children: [
            greyCell('N° Cadena custodia OPDS', { columnSpan: 3 }),
            ...muestrasBloque.map(s => greyCell(s.cadenaOPDS)),
            celdaGuiaContinue()
        ]
    });
    const rowProtocolo = new TableRow({
        children: [
            greyCell('N° Protocolo OPDS', { columnSpan: 3 }),
            ...muestrasBloque.map(s => greyCell(s.protocoloOPDS || '')),
            celdaGuiaContinue()
        ]
    });
    return [rowCadena, rowProtocolo];
}

export function setNombresMuestras (muestrasBloque) {
    return new TableRow({
        children: [
            greyCell('Nombre muestras', { columnSpan: 3 }),
            ...muestrasBloque.map(s => greyCell(s.muestra)),
            // ...muestrasBloque.map(s => greyCell(s.profundidad || '')),
            celdaGuiaContinue()
        ]
    });
}

function setLineaSustancias (textArray) {
    return new TableRow({
        children: [
            greyCell('Sustancia', { width: { size: 15, type: WidthType.PERCENTAGE } }),
            greyCell('LC', { width: { size: 5, type: WidthType.PERCENTAGE } }),
            greyCell('UM', { width: { size: 5, type: WidthType.PERCENTAGE } }),
            ...textArray.map(text => greyCell(text)),
            celdaGuiaContinue()
        ]
    });
}
export function setSustanciaProfundidad (muestrasBloque) {
    const profundidades = muestrasBloque.map(s => (
        (s.profundidad != null && !isNaN(s.profundidad))
            ? `${parseFloat(s.profundidad).toFixed(1)} (m)`
            : ''
    ));
    return setLineaSustancias(profundidades);
}

export function setSustanciaMuestra (muestrasBloque) {
    const nombresMuestras = muestrasBloque.map(s => s.muestra);
    return setLineaSustancias(nombresMuestras);
}

// * Lineas de detalle (compuestos)
export function createCompoundRow (fila, data, LQs, UMs, muestrasBloque, matrixId) {
    const comp = data.compuestos.find(c => c.id === fila.compuestoId);
    const compoundName = comp ? comp.nombre : `Compuesto ${fila.compuestoId}`;

    const LQ = LQs.find(x => x.compuestoId === fila.compuestoId && x.metodoId === fila.metodoId);
    const lc = LQ?.valorLQ ?? '-';
    const lcFormateado = isNaN(Number(lc)) ? lc : Number(lc).toFixed(3);

    const um = UMs.data.find(x => x.id === fila.umId);
    const umFormateado = um?.nombre ?? '-';

    const nivelGuia = data.nivelesGuia.find(n =>
        n.compuestoId === fila.compuestoId && n.matrizId === Number(matrixId)
    );

    return new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: compoundName, alignment: AlignmentType.LEFT })] }),
            new TableCell({ children: [new Paragraph({ text: lcFormateado, alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: umFormateado, alignment: AlignmentType.CENTER })] }),
            ...muestrasBloque.map(s => {
                let val = fila[s.muestra];
                if (val === -1) val = 'NC';
                else if (val === -2) val = 'ND';
                else if (val === -3) val = 'NA';
                else if (val == null) val = 'NA';
                return new TableCell({
                    children: [new Paragraph({ text: String(val), alignment: AlignmentType.CENTER })]
                });
            }),
            new TableCell({
                children: [new Paragraph({ text: String(nivelGuia?.valorReferencia || 'NL'), alignment: AlignmentType.CENTER })]
            })
        ]
    });
}

function getMatrixLetter (matrixId) {
    return { 1: 'a', 2: 'b', 3: 'c', 4: 'd' }[Number(matrixId)] || '';
}

export function createEpigrafeParagraph (matrixId, matrixName, current, total) {
    const sufijo = Number(matrixId) === 1 ? ' subterránea' : '';
    const letra = getMatrixLetter(matrixId);
    const texto = `Tabla 1${letra}: (${current}/${total}) Resultados de análisis sobre ${matrixName.toLowerCase()}${sufijo}. NC: No cuantificado. ND: No detectado. NA: No analizado. NL: No legislado.`;

    return new Paragraph({
        children: [new TextRun({ text: texto, font: 'Times New Roman', size: 20 })],
        spacing: { after: 100 }
    });
}

export function createTablaSeccionConEpigrafe (elements, proyectoNombre) {
    return {
        properties: {
            page: {
                size: { orientation: PageOrientation.LANDSCAPE },
                margin: { top: 1440, bottom: 1440, left: 1134, right: 850 }
            }
        },
        children: elements,
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
    };
}

export function buildDoc (sections, proyectoNombre) {
    return new Document({
        creator: 'Netrona',
        title: 'Reporte de análisis',
        description: 'Informe generado automáticamente por BFU Protocol Manager',
        sections: sections.map(section => ({
            ...section,
            headers: section.headers || {
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
