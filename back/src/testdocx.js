import fs from 'node:fs';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, ShadingType } from 'docx';

const compuestosOrig = [
    { nombre: 'HTP (EPA 418.1)', unidad: 'mg/l' },
    { nombre: 'Benceno', unidad: 'µg/l' },
    { nombre: 'Tolueno', unidad: 'µg/l' },
    { nombre: 'Etilbenceno', unidad: 'µg/l' },
    { nombre: 'm-Xilenos', unidad: 'µg/l' },
    { nombre: 'o-Xileno', unidad: 'µg/l' },
    { nombre: 'p-Xileno', unidad: 'µg/l' },
    { nombre: 'MTBE', unidad: 'mg/l' }
];

const resultadosOrig = {
    'MA PE1/21': { 'HTP (EPA 418.1)': '< 0,5', Benceno: '< 10', Tolueno: '< 10', Etilbenceno: '< 10', 'm-Xilenos': '< 10', 'o-Xileno': '< 10', 'p-Xileno': '< 10', MTBE: '< 0,002' },
    'MA PE8/21': { 'HTP (EPA 418.1)': '< 0,5', Benceno: '< 10', Tolueno: '< 10', Etilbenceno: '< 10', 'm-Xilenos': '< 10', 'o-Xileno': '< 10', 'p-Xileno': '< 10', MTBE: '0,123' },
    'MA PE5/21': { 'HTP (EPA 418.1)': '< 0,5', Benceno: '< 10', Tolueno: '< 10', Etilbenceno: '< 10', 'm-Xilenos': '< 10', 'o-Xileno': '< 10', 'p-Xileno': '< 10', MTBE: 'n.a.' },
    'MA PE10/21': { 'HTP (EPA 418.1)': '< 0,5', Benceno: '< 10', Tolueno: '< 10', Etilbenceno: '< 10', 'm-Xilenos': '< 10', 'o-Xileno': '< 10', 'p-Xileno': '< 10', MTBE: 'n.a.' }
};

const muestrasOrig = [
    { nombre: 'MA PE1/21', fecha: '29/08/2024' },
    { nombre: 'MA PE8/21', fecha: '29/08/2024' },
    { nombre: 'MA PE5/21', fecha: '29/08/2024' },
    { nombre: 'MA PE10/21', fecha: '29/08/2024' }
];

const grisMedio = {
    type: ShadingType.CLEAR,
    color: 'auto',
    fill: 'D9D9D9' // gris medio
};

const buildWord = async (compuestos, resultados, muestras) => {
    const tableRows = [];

    // Fila 1: títulos de muestras
    tableRows.push(new TableRow({
        children: [
            new TableCell({
                rowSpan: 2,
                shading: grisMedio,
                children: [new Paragraph({ text: 'Nombre de la muestra', alignment: AlignmentType.CENTER })]
            }),
            new TableCell({
                rowSpan: 2,
                shading: grisMedio,
                children: [new Paragraph({ text: 'Unidad', alignment: AlignmentType.CENTER })]
            }),
            ...muestras.map(m => new TableCell({
                shading: grisMedio,
                children: [new Paragraph({ text: m.nombre, alignment: AlignmentType.CENTER })]
            }))
        ]
    }));

    // Fila 2: fechas
    tableRows.push(new TableRow({
        children: [
            ...muestras.map(m => new TableCell({
                shading: grisMedio,
                children: [new Paragraph({ text: m.fecha, alignment: AlignmentType.CENTER })]
            }))
        ]
    }));

    // Filas de datos por compuesto
    for (const comp of compuestos) {
        tableRows.push(new TableRow({
            children: [
                new TableCell({
                    shading: grisMedio,
                    children: [new Paragraph(comp.nombre)]
                }),
                new TableCell({
                    children: [new Paragraph(comp.unidad)]
                }),
                ...muestras.map(m => new TableCell({
                    children: [new Paragraph(resultados[m.nombre]?.[comp.nombre] ?? 'n.a.')]
                }))
            ]
        }));
    }

    const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows
    });

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    text: 'Proyecto 201198-001',
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Resultados analíticos de laboratorio',
                            bold: true,
                            font: 'Times New Roman',
                            size: 24 // Times 12pt (12*2)
                        })
                    ],
                    spacing: { after: 300 }
                }),
                table
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('resultado.docx', buffer);
};

buildWord(compuestosOrig, resultadosOrig, muestrasOrig);
