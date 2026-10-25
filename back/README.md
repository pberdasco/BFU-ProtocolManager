# Backend para Gestión de Cadenas de Custodia y Análisis de Muestras

![Node.js](https://img.shields.io/badge/Node%2Ejs-v26%2Ex-blue?logo=node%2Ejs) ![Base de Datos](https://img.shields.io/badge/MySQL-v8%2Ex-blue?logo=mysql)
![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-yellow) ![MannKendall](https://img.shields.io/badge/Mann--Kendall-WinAx%20Required-orange) ![License](https://img.shields.io/badge/Licencia-Privado-lightgrey)

Este es el backend de un sistema para la gestión de eventos de muestreo, cadenas de custodia, análisis de laboratorio y generación de reportes Excel. Desarrollado con Node.js y Express, sigue una estructura modular orientada a recursos REST.

- 🔗 [Repositorio en Deepwiki - BFU Protocol Manager](https://deepwiki.com/pberdasco/BFU-ProtocolManager)

## 📁 Estructura del proyecto

```
src/
├── controllers/         # Controladores REST por entidad
├── database/            # Conexión a base de datos (MySQL)
├── middleware/          # Middlewares personalizados (logs, parseo, auth futuro)
├── models/              # Modelos de datos (si se usa ORM o definiciones propias)
├── routers/             # Agrupamiento de rutas
├── services/            # Lógica de negocio
├── utils/               # Funciones auxiliares
├── server.js            # Punto de entrada de la aplicación
```

## ✨ Tecnologías utilizadas

- Node.js + Express
- Base de datos: **MySQL** (vía `mysql2/promise`)
- Arquitectura RESTful modular
- Exportación de archivos Excel con formato personalizado (ExcelJS y Winax para Mann-Kendall y gráficos de Evolución CDI)
- Exportación de archivos Word (docx)

## 🚀 Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tuusuario/tu-repo.git
   cd tu-repo
   ```

2. Preparar Node.js **26.12.1** y pnpm **12.15.0** mediante Corepack (versiones fijadas en `.nvmrc` y `package.json`). Desde `back/`:

   ```powershell
   nvm install 26.12.1
   nvm use 26.12.1
   # Node 26 no incluye Corepack; instalarlo si no está disponible.
   npm install --global corepack@0.36.0
   corepack enable pnpm
   pnpm --version
   ```

   Corepack selecciona la versión de pnpm indicada en `packageManager`, con su hash de integridad. No instalar pnpm globalmente. Si ya tenés Corepack disponible para esta versión de Node, omití su instalación.

3. Preparar winax **3.6.10**, utilizado para Mann-Kendall y gráficos de Evolución CDI.
   ⚠️ Requiere Windows, Excel de escritorio instalado y compilación nativa. Antes de instalar las dependencias, asegurate de tener:
   - Python 3.x accesible desde consola
   - Visual Studio con herramientas de desarrollo C++ o Visual Studio Build Tools
   - Windows SDK (para la version 10 u 11 segun sea el SO)
     > ℹ️ Podés verificar tu entorno ejecutando `./VerificarWinax.ps1` desde `back/`.

   Instalar las dependencias:

   ```powershell
   pnpm install --frozen-lockfile
   ```

   Usar también este comando en despliegue y versionar `pnpm-lock.yaml`; no generar `package-lock.json` ni usar `npm install` para las dependencias del proyecto.
   `pnpm-workspace.yaml` configura únicamente este backend y autoriza los scripts de instalación de `winax` y `bcrypt`, sin habilitar scripts de todos los paquetes.
   Al cambiar de versión mayor de Node o migrar desde npm, eliminar primero `back/node_modules` para reinstalar y recompilar los addons nativos.

4. Crear el archivo `.env` con configuración de entorno:

   ```dotenv
   PORT = 5001

   DB_HOST=localhost
   DB_USER=usuario
   DB_PASS=clave
   DB_NAME=nombre_basededatos
   DB_PORT = 3306

   CADENA_DOCX_PATH = C:/.../AnexoTablas/
   CADENA_EXCEL_PATH = C:/.../ModeloCadena/
   CADENA_EXCEL_MODELO_NAME = CadenaCustodiaNuevo.xlsx
   MANNKENDALL_MODEL_PATH = C:/.../MannKendall/
   MANNKENDALL_MODEL_NAME = MannKendall.xlsm
   MANNKENDALL_FILES_PATH = C:/.../MannKendall/Files/

   ERRORS_TO_CONSOLE = true
   INFO_TO_CONSOLE = true
   DEBUG_TO_CONSOLE = true
   LOGGER_MIN_LEVEL = debug
   ```

5. Iniciar el servidor:
   ```bash
    pnpm start
   ```
   o
   ```bash
   node --expose-gc src/server.js
   ```
    dado que requiere `--expose-gc` habilitado para permitir la liberacion manual de memoria usada por WinAx

## Validación de la migración

Desde `back/`:

```powershell
pnpm lint
pnpm run test:dependencies
pnpm run test:validation
pnpm run test:native
```

La prueba nativa valida hashes de `bcrypt` y abre una instancia propia de Excel para escribir una matriz, crear un gráfico, guardar y reabrir un libro temporal. No modifica plantillas ni consulta la base de datos. Requiere Excel instalado; no reemplaza las pruebas funcionales de los reportes.

Antes de desplegar, probar login, un reporte Mann-Kendall con la macro `UpdateAll` y un reporte de Evolución CDI con gráficos. Verificar que no queden instancias nuevas de Excel abiertas.
`test:dependencies` valida generación DOCX con la distribución oficial, escritura/lectura XLSX con formatos condicionales y procesamiento JSON/formularios de Express, sin consultar la base de datos.
`test:validation` comprueba esquemas y controladores con Zod 4, fechas/números, claves dinámicas y defaults de altas frente a modificaciones parciales, sin consultar la base de datos.
Consultar [DEPENDENCIES.md](DEPENDENCIES.md) para el warning conocido de docx, el override de ExcelJS y la revisión de seguridad. No aplicar saltos mayores automáticos.

## 🔐 Autenticación (planificada)

Se encuentra previsto implementar JWT para la autenticación de usuarios, con protección de rutas y manejo de sesiones.

## 📂 Recursos disponibles

El backend expone recursos a través de endpoints REST. Cada recurso cuenta con rutas para operaciones básicas (GET, POST, PUT, DELETE) según corresponda.

### Entidades principales:

- **usuarios**
- **clientes**
- **proyectos**, **subproyectos**, **proyectosEstado**
- **pozos**, **pozosEstado**, **pozosTipo**
- **muestras**, **eventomuestreo**
- **cadenasCustodia**, **cadenaCompleta**, **cadenaToExcel**
- **grupoCompuestos**, **compuestos**, **relCompuestoGrupo**
- **lqs**, **metodos**, **um** (unidades de medida)
- **matrices**, **matrizCadena**
- **protocolos**, **regulados**, **autaplicacion**
- **sinonimosCompuestos**, **sinonimosMetodos**, **sinonimosUMs**

## ⚙️ Endpoint especial

### Exportación de cadena a Excel

- `POST /cadenaToExcel`
  - Recibe la información de la cadena de custodia y genera un archivo Excel con formato personalizado.
  - El archivo se guarda en el servidor o se devuelve como respuesta según configuración.

## 📊 Logs y middleware

- `logRequest`: registra cada request entrante con timestamp
- `controllerErrors`: manejo centralizado de errores
- `parseDevExtremeQuery`: transforma queries tipo DevExtreme a SQL
- Preparado para middleware de sesiones y JWT

## 🔧 En desarrollo

- Autenticación JWT
- Tests automatizados
- Refactor de exportador Excel y eliminación de `testExcel.js`

## 🔧 Scripts SQL de instalacion

- `bfu-project-db-struct.sql`: crea la base y tablas.
- `bfu-project-db-MasterData.sql`: inserta datos maestros (seeds).

📝 Ejecutar con:

```bash
mysql -u root -p < sql/bfu-project-db-struct.sql
mysql -u root -p < sql/bfu-project-db-MasterData.sql
```

## 📅 Licencia

Proyecto privado. Desarrollado por **Netrona**.
