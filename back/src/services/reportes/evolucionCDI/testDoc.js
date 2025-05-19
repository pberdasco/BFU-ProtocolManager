import { createReport } from './generateDOC.js';

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

(async () => {
    try {
        await createReport(
            charts,
            'C:\\Netrona\\Clientes\\BfU\\ProcesoProtocolos\\Temp\\EvolucionCDI\\',
            'Estación ABC',
            { desde: 'enero de 2016', hasta: 'mayo de 2024' }
        );
        console.log('Documento creado correctamente');
    } catch (err) {
        console.error('Error al generar el documento:', err);
    }
})();
