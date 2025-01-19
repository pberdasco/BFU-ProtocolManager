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
import { regulacionesRouter } from './routers/regulaciones_router.js';
import { provinciasRouter } from './routers/provincias_router.js';
import { protocolosRouter } from './routers/protocolos_router.js';
import { eventomuestreoRouter } from './routers/eventomuestreo_router.js';
import { cadenasCustodiaRouter } from './routers/cadenasCustodia_router.js';
import { muestrasRouter } from './routers/muestras_router.js';
import { proyectosEstadoRouter } from './routers/proyectosEstado_router.js';
import { matricesRouter } from './routers/matrices_router.js';
import { clientesRouter } from './routers/clientes_router.js';
import { metodosRouter } from './routers/metodos_router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(logRequest(logger));

app.use(cors());

// APIs
app.use("/usuarios", usuariosRouter);
app.use("/proyectos", proyectosRouter);
app.use("/subproyectos", subproyectosRouter);
app.use("/pozos", pozosRouter);
app.use("/pozosEstado", pozosEstadoRouter);
app.use("/pozosTipo", pozosTipoRouter);
app.use("/laboratorios", laboratoriosRouter);
app.use("/compuestos", compuestosRouter);
app.use("/grupoCompuestos", grupoCompuestosRouter);
app.use("/relCompuestoGrupo", relCompuestoGrupoRouter);
app.use("/autaplicacion", autaplicacionRouter);
app.use("/lqs", lqsRouter);
app.use("/regulaciones", regulacionesRouter);
app.use("/provincias", provinciasRouter);
app.use("/protocolos", protocolosRouter);
app.use("/eventomuestreo", eventomuestreoRouter);
app.use("/cadenascustodia", cadenasCustodiaRouter);
app.use("/muestras", muestrasRouter);
app.use("/proyectosEstado", proyectosEstadoRouter);
app.use("/matriz", matricesRouter);
app.use("/clientes", clientesRouter);
app.use("/metodos", metodosRouter);

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
    res.status(404).json({message: "No existe el endpoint"});
});

process.loadEnvFile();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running http://localhost:${PORT}`));