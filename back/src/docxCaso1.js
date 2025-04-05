import { exportarDocx } from './testdocx2.js';

/**
 * Función principal para construir datos ficticios, llamar a generateReport y grabar el documento.
 */
async function main () {
    // Se arma el objeto data con los arrays de muestras y filas proporcionados, y se agregan arrays ficticios para compuestos y nivelesGuia
    const data = {
        muestras: [
            {
                muestraId: 20,
                muestra: 'MA PM1/1',
                tipo: 1,
                pozo: 22,
                nivelFreatico: '0.000',
                profundidad: null,
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 1,
                cadenaCustodiaId: 13,
                laboratorioId: 1
            },
            {
                muestraId: 21,
                muestra: 'MA PM2/1',
                tipo: 1,
                pozo: 23,
                nivelFreatico: '0.000',
                profundidad: null,
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 1,
                cadenaCustodiaId: 13,
                laboratorioId: 1
            },
            {
                muestraId: 22,
                muestra: 'MA E/I',
                tipo: 2,
                pozo: null,
                nivelFreatico: '0.000',
                profundidad: null,
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 1,
                cadenaCustodiaId: 13,
                laboratorioId: 1
            },
            {
                muestraId: 23,
                muestra: 'MA PM3/1',
                tipo: 1,
                pozo: 24,
                nivelFreatico: '0.000',
                profundidad: null,
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 1,
                cadenaCustodiaId: 14,
                laboratorioId: 1
            },
            {
                muestraId: 24,
                muestra: 'MG PM1',
                tipo: 1,
                pozo: 22,
                nivelFreatico: '0.000',
                profundidad: null,
                flna: null,
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 4,
                cadenaCustodiaId: 16,
                laboratorioId: 1
            },
            {
                muestraId: 25,
                muestra: 'MS PM1/1',
                tipo: 1,
                pozo: 22,
                nivelFreatico: '0.000',
                profundidad: '1.000',
                flna: null,
                cadenaOPDS: '12345678',
                protocoloOPDS: null,
                matriz: 3,
                cadenaCustodiaId: 15,
                laboratorioId: 1
            },
            {
                muestraId: 26,
                muestra: 'MS PM1/2',
                tipo: 1,
                pozo: 22,
                nivelFreatico: '0.000',
                profundidad: '2.000',
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 3,
                cadenaCustodiaId: 15,
                laboratorioId: 1
            },
            {
                muestraId: 27,
                muestra: 'MS PM1/3',
                tipo: 1,
                pozo: 22,
                nivelFreatico: '0.000',
                profundidad: '3.000',
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 3,
                cadenaCustodiaId: 15,
                laboratorioId: 1
            },
            {
                muestraId: 28,
                muestra: 'MS PM2/1',
                tipo: 1,
                pozo: 23,
                nivelFreatico: '0.000',
                profundidad: '1.500',
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 3,
                cadenaCustodiaId: 15,
                laboratorioId: 1
            },
            {
                muestraId: 29,
                muestra: 'MS PM2/2',
                tipo: 1,
                pozo: 23,
                nivelFreatico: '0.000',
                profundidad: '2.500',
                flna: '0.000',
                cadenaOPDS: null,
                protocoloOPDS: null,
                matriz: 3,
                cadenaCustodiaId: 15,
                laboratorioId: 1
            }
        ],
        filas: [
            {
                id: 1,
                cadenaCustodiaId: 13,
                compuestoId: 1,
                metodoId: 2,
                umId: 1,
                estado: 2,
                protocoloItemId: 207,
                'MA PM1/1': -1,
                'MA PM2/1': -2,
                'MA E/I': -1,
                'MA PM3/1': 0.001,
                codigo: '10100000'
            },
            {
                id: 2,
                cadenaCustodiaId: 13,
                compuestoId: 2,
                metodoId: 2,
                umId: 1,
                estado: 2,
                protocoloItemId: 208,
                'MA PM1/1': 0.03,
                'MA PM2/1': 0.03,
                'MA E/I': 0.04,
                'MA PM3/1': 0.03,
                codigo: '10101010'
            },
            {
                id: 3,
                cadenaCustodiaId: 13,
                compuestoId: 3,
                metodoId: 2,
                umId: 1,
                estado: 2,
                protocoloItemId: 209,
                'MA PM1/1': -1,
                'MA PM2/1': -2,
                'MA E/I': 0.05,
                'MA PM3/1': -1,
                codigo: '10101020'
            },
            {
                id: 4,
                cadenaCustodiaId: 13,
                compuestoId: 4,
                metodoId: 2,
                umId: 1,
                estado: 2,
                protocoloItemId: 210,
                'MA PM1/1': 0.006,
                'MA PM2/1': 0.006,
                'MA E/I': -2,
                'MA PM3/1': 0.007,
                codigo: '10101030'
            },
            {
                id: 5,
                cadenaCustodiaId: 13,
                compuestoId: 25,
                metodoId: 7,
                umId: 1,
                estado: 4,
                protocoloItemId: null,
                'MA PM1/1': 0.011,
                'MA PM2/1': 0.002,
                'MA E/I': 0.034,
                'MA PM3/1': 0.063,
                codigo: '10201000'
            },
            {
                id: 6,
                cadenaCustodiaId: 13,
                compuestoId: 26,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 211,
                'MA PM1/1': 0.001,
                'MA PM2/1': 0.001,
                'MA E/I': 0.002,
                'MA PM3/1': 0.03,
                codigo: '10201010'
            },
            {
                id: 7,
                cadenaCustodiaId: 13,
                compuestoId: 27,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 213,
                'MA PM1/1': 0.01,
                'MA PM2/1': -1,
                'MA E/I': 0.01,
                'MA PM3/1': 0.01,
                codigo: '10201020'
            },
            {
                id: 8,
                cadenaCustodiaId: 13,
                compuestoId: 28,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 212,
                'MA PM1/1': -1,
                'MA PM2/1': -1,
                'MA E/I': 0.01,
                'MA PM3/1': 0.02,
                codigo: '10201030'
            },
            {
                id: 9,
                cadenaCustodiaId: 13,
                compuestoId: 29,
                metodoId: 7,
                umId: 1,
                estado: 4,
                protocoloItemId: null,
                'MA PM1/1': -1,
                'MA PM2/1': 0.001,
                'MA E/I': 0.012,
                'MA PM3/1': 0.003,
                codigo: '10201040'
            },
            {
                id: 10,
                cadenaCustodiaId: 13,
                compuestoId: 31,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 214,
                'MA PM1/1': -1,
                'MA PM2/1': 0.001,
                'MA E/I': 0.012,
                'MA PM3/1': 0.003,
                codigo: '10201042'
            },
            {
                id: 11,
                cadenaCustodiaId: 13,
                compuestoId: 33,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 215,
                'MA PM1/1': -1,
                'MA PM2/1': -1,
                'MA E/I': -1,
                'MA PM3/1': -1,
                codigo: '10201044'
            },
            {
                id: 12,
                cadenaCustodiaId: 14,
                compuestoId: 35,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 217,
                'MA PM3/1': -1,
                codigo: '10203010'
            },
            {
                id: 13,
                cadenaCustodiaId: 14,
                compuestoId: 37,
                metodoId: 7,
                umId: 1,
                estado: 2,
                protocoloItemId: 216,
                'MA PM3/1': -1,
                codigo: '10204010'
            },
            {
                id: 14,
                cadenaCustodiaId: 15,
                compuestoId: 302,
                metodoId: 1,
                umId: 14,
                estado: 1,
                protocoloItemId: null,
                'MS PM1/1': -1,
                'MS PM1/2': 0.22,
                'MS PM1/3': 12,
                'MS PM2/1': 1.1,
                'MS PM2/2': -2,
                codigo: '30101010'
            },
            {
                id: 15,
                cadenaCustodiaId: 15,
                compuestoId: 303,
                metodoId: 1,
                umId: 14,
                estado: 1,
                protocoloItemId: null,
                'MS PM1/1': -1,
                'MS PM1/2': 0.23,
                'MS PM1/3': 11,
                'MS PM2/1': -2,
                'MS PM2/2': -2,
                codigo: '30101020'
            },
            {
                id: 16,
                cadenaCustodiaId: 16,
                compuestoId: 474,
                metodoId: 9,
                umId: 10,
                estado: 1,
                protocoloItemId: null,
                'MG PM1': 1.1,
                codigo: '40104000'
            }
        ],
        compuestos: [
            { id: 1, nombre: 'HTP' },
            { id: 2, nombre: 'GRO' },
            { id: 3, nombre: 'DRO' },
            { id: 4, nombre: 'MRO' },
            { id: 25, nombre: 'Benceno' },
            { id: 26, nombre: 'Etilbenceno' },
            { id: 27, nombre: 'Tolueno' },
            { id: 28, nombre: 'Xilenos' },
            { id: 29, nombre: 'MTBE' },
            { id: 31, nombre: 'Acenafteno' },
            { id: 33, nombre: 'Acenaftileno' },
            { id: 35, nombre: 'Antraceno' },
            { id: 37, nombre: 'Benzo(a)antraceno' },
            { id: 302, nombre: 'Benzo(a)pireno' },
            { id: 303, nombre: 'Benzo(b)fluorateno' },
            { id: 474, nombre: 'Benzo(g,h,i)perileno' }
        ],
        nivelesGuia: [
            // Para matriz 1 (Agua)
            { compuestoId: 1, valorReferencia: '0.005', um: 'mg/L', matrizId: 1 },
            { compuestoId: 2, valorReferencia: '0.010', um: 'mg/L', matrizId: 1 },
            { compuestoId: 3, valorReferencia: '0.015', um: 'mg/L', matrizId: 1 },
            { compuestoId: 4, valorReferencia: '0.020', um: 'mg/L', matrizId: 1 },
            // Para matriz 3 (Suelo)
            { compuestoId: 25, valorReferencia: '0.001', um: 'mg/kg', matrizId: 3 },
            { compuestoId: 26, valorReferencia: '0.002', um: 'mg/kg', matrizId: 3 },
            { compuestoId: 27, valorReferencia: '0.003', um: 'mg/kg', matrizId: 3 },
            { compuestoId: 28, valorReferencia: '0.004', um: 'mg/kg', matrizId: 3 },
            { compuestoId: 29, valorReferencia: '0.005', um: 'mg/kg', matrizId: 3 },
            // Para matriz 4 (Gases)
            { compuestoId: 474, valorReferencia: '0.100', um: 'mg/m3', matrizId: 4 },
            { compuestoId: 302, valorReferencia: '0.200', um: 'mg/m3', matrizId: 4 },
            { compuestoId: 303, valorReferencia: '0.300', um: 'mg/m3', matrizId: 4 }
        ],
        laboratorios: [
            { id: 1, nombre: 'Induser' },
            { id: 2, nombre: 'Labca' }
        ]
    };

    const proyecto = 'Proyecto 201894-153';
    const fecha = '05/09/2024';
    const result = await exportarDocx(proyecto, fecha, data, '.', 'ReporteProyecto.docx');
    console.log('grabado: ', result);
}

await main();
