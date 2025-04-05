import { exportarDocx } from './testdocx2.js';

async function main () {
    const data = {
        muestras: [
            ...Array.from({ length: 12 }, (_, i) => ({
                muestraId: 100 + i,
                muestra: `MA PZ${i + 1}/1`,
                tipo: 1,
                pozo: 200 + i,
                nivelFreatico: '0.000',
                profundidad: null,
                flna: '0.000',
                cadenaOPDS: `OPDS ${i + 1}`,
                protocoloOPDS: `OPDS ${i + 11}`,
                matriz: 1, // Agua
                cadenaCustodiaId: 20,
                laboratorioId: 1
            }))
        ],
        filas: [
            {
                id: 1,
                cadenaCustodiaId: 20,
                compuestoId: 1,
                metodoId: 2,
                umId: 1,
                estado: 2,
                protocoloItemId: 300,
                'MA PZ1/1': -1,
                'MA PZ2/1': -2,
                'MA PZ3/1': 0.001,
                'MA PZ4/1': 0.002,
                'MA PZ5/1': 0.003,
                'MA PZ6/1': 0.004,
                'MA PZ7/1': 0.005,
                'MA PZ8/1': 0.006,
                'MA PZ9/1': 0.007,
                'MA PZ10/1': 0.008,
                'MA PZ11/1': 0.09,
                'MA PZ12/1': 0.08,
                codigo: '10100000'
            },
            {
                id: 2,
                cadenaCustodiaId: 20,
                compuestoId: 2,
                metodoId: 2,
                umId: 1,
                estado: 2,
                protocoloItemId: 301,
                'MA PZ1/1': 0.03,
                'MA PZ2/1': 0.02,
                'MA PZ3/1': 0.01,
                'MA PZ4/1': 0.01,
                'MA PZ5/1': 0.01,
                'MA PZ6/1': 0.01,
                'MA PZ7/1': 0.01,
                'MA PZ8/1': 0.01,
                'MA PZ9/1': 0.01,
                'MA PZ10/1': 0.01,
                'MA PZ11/1': 0.11,
                'MA PZ12/1': 0.12,
                codigo: '10100001'
            }
        ],
        compuestos: [
            { id: 1, nombre: 'HTP' },
            { id: 2, nombre: 'GRO' }
        ],
        nivelesGuia: [
            { compuestoId: 1, valorReferencia: '0.005', um: 'mg/L', matrizId: 1 },
            { compuestoId: 2, valorReferencia: '0.010', um: 'mg/L', matrizId: 1 }
        ],
        laboratorios: [
            { id: 1, nombre: 'Induser' }
        ]
    };

    const proyecto = 'Proyecto 201894-153';
    const fecha = '05/09/2024';
    const result = await exportarDocx(proyecto, fecha, data, '.', 'ReporteProyecto2.docx');
    console.log('grabado: ', result);
}

await main();
