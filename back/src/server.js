import express from 'express';
import logger from './utils/logger.js';
import cors from 'cors';
import path from 'path';
import { logRequest } from './middleware/logRequest.js';
import { fileURLToPath } from 'url';
import { usuariosRouter } from './routers/usuarios_router.js';
import { proyectosRouter } from './routers/proyectos_router.js';
import { subproyectosRouter } from './routers/subproyectos_router.js';
import { pozosRouter } from './routers/pozos_router.js';
import { pozosEstadoRouter } from './routers/pozosEstado_router.js';
import { pozosTipoRouter } from './routers/pozosTipo_router.js';
import { laboratoriosRouter } from './routers/laboratorios_router.js';
import { compuestosRouter } from './routers/compuestos_router.js';
import { grupoCompuestosRouter } from './routers/grupoCompuestos_router.js';
import { relCompuestoGrupoRouter } from './routers/relCompuestoGrupo_router.js';
import { autaplicacionRouter } from './routers/autaplicacion_router.js';
import { lqsRouter } from './routers/lqs_router.js';
import { reguladosRouter } from './routers/regulados_router.js';
import { umRouter } from './routers/um_router.js';
import { provinciasRouter } from './routers/provincias_router.js';
import { protocolosRouter } from './routers/protocolos_router.js';
import { eventomuestreoRouter } from './routers/eventomuestreo_router.js';
import { cadenasCustodiaRouter } from './routers/cadenasCustodia_router.js';
import { cadenaCompletaRouter } from './routers/cadenaCompleta_router.js';
import { muestrasRouter } from './routers/muestras_router.js';
import { analisisRequeridosRouter } from './routers/analisisRequeridos_router.js';
import { proyectosEstadoRouter } from './routers/proyectosEstado_router.js';
import { matricesRouter } from './routers/matrices_router.js';
import { clientesRouter } from './routers/clientes_router.js';
import { metodosRouter } from './routers/metodos_router.js';
import { matrizCadenaRouter } from './routers/matrizCadena_router.js';
import { sinonimosCompuestosRouter } from './routers/sinonimosCompuestos_router.js';
import { sinonimosMetodosRouter } from './routers/sinonimosMetodos_router.js';
import { sinonimosUMsRouter } from './routers/sinonimosUMs_router.js';
import { cadenaToExcelRouter } from './routers/cadenaToExcel_router.js';
import { cadenaToDOCTablaRouter } from './routers/cadenaToDocTabla_router.js';
import { mannKendallRouter } from './routers/mannKendall_router.js';
import { mkPozosRouter } from './routers/mkPozos_router.js';
import { mkCompuestosRouter } from './routers/mkCompuestos_router.js';
import { cadenasSubproyectoCompuestoRouter } from './routers/cadenasSubproyectoCompuesto_router.js';
import { graficosRouter } from './routers/graficos_router.js';
import { graficosGruposRouter } from './routers/graficosGrupos_router.js';
import { umConvertRouter } from './routers/umConvert_router.js';
import { evolucionCDIRouter } from './routers/evolucionCDI_router.js';
import { zipDownloadRouter } from './routers/zipDownload_router.js';
import { valoresPlanosRouter } from './routers/valoresPlanos_router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(logRequest(logger));

app.use(cors());

// APIs
app.use('/api/usuarios', usuariosRouter);
app.use('/api/proyectos', proyectosRouter);
app.use('/api/subproyectos', subproyectosRouter);
app.use('/api/pozos', pozosRouter);
app.use('/api/pozosEstado', pozosEstadoRouter);
app.use('/api/pozosTipo', pozosTipoRouter);
app.use('/api/laboratorios', laboratoriosRouter);
app.use('/api/compuestos', compuestosRouter);
app.use('/api/grupoCompuestos', grupoCompuestosRouter);
app.use('/api/relCompuestoGrupo', relCompuestoGrupoRouter);
app.use('/api/autaplicacion', autaplicacionRouter);
app.use('/api/lqs', lqsRouter);
app.use('/api/regulados', reguladosRouter);
app.use('/api/provincias', provinciasRouter);
app.use('/api/um', umRouter);
app.use('/api/protocolos', protocolosRouter);
app.use('/api/eventomuestreo', eventomuestreoRouter);
app.use('/api/cadenascustodia', cadenasCustodiaRouter);
app.use('/api/cadenacompleta', cadenaCompletaRouter);
app.use('/api/muestras', muestrasRouter);
app.use('/api/analisisrequeridos', analisisRequeridosRouter);
app.use('/api/proyectosEstado', proyectosEstadoRouter);
app.use('/api/matriz', matricesRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/metodos', metodosRouter);
app.use('/api/matrizcadena', matrizCadenaRouter);
app.use('/api/sinonimoscompuestos', sinonimosCompuestosRouter);
app.use('/api/sinonimosmetodos', sinonimosMetodosRouter);
app.use('/api/sinonimosums', sinonimosUMsRouter);
app.use('/api/cadenatoexcel', cadenaToExcelRouter);
app.use('/api/cadenatodoctabla', cadenaToDOCTablaRouter);
app.use('/api/mannKendall', mannKendallRouter);
app.use('/api/mkcompuestos', mkCompuestosRouter);
app.use('/api/mkpozos', mkPozosRouter);
app.use('/api/cadenasSubproyectoCompuesto', cadenasSubproyectoCompuestoRouter);
app.use('/api/graficos', graficosRouter);
app.use('/api/graficosGrupos', graficosGruposRouter);
app.use('/api/umConvert', umConvertRouter);
app.use('/api/evolucionCDI', evolucionCDIRouter);
app.use('/api/getZip', zipDownloadRouter);
app.use('/api/valoresPlanos', valoresPlanosRouter);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../public')));

// Manejar rutas del frontend (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    const clientIP = req.ip;
    logger.warn(`404 Not Found: ${req.method} ${req.url} - IP: ${clientIP}`);
    res.status(404).json({ message: 'No existe el endpoint' });
});

process.loadEnvFile();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running http://localhost:${PORT}`));
