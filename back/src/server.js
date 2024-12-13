import express from 'express';
import logger from './utils/logger.js';
import cors from 'cors';
import path from 'path';
import { logRequest } from './middleware/logRequest.js';
import { fileURLToPath } from 'url';
import { usuariosRouter } from './routers/usuarios_router.js';
import { proyectosRouter } from './routers/proyectos_router.js';

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