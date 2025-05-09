# Backend para Gestión de Cadenas de Custodia y Análisis de Muestras

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
- Exportación de archivos Excel con formato personalizado (ExcelJS y Winax -solo para MannKendall-)
- Exportación de archivos Word (docx)

## 🚀 Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tuusuario/tu-repo.git
   cd tu-repo
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Instalación de winax (solo se utiliza para la funcionalidad Mann-Kendall)
   ⚠️ winax requiere compilación nativa. Antes de instalarlo, asegurate de tener:

   - Python 3.x accesible desde consola
   - Visual Studio con herramientas de desarrollo C++ o Visual Studio Build Tools
   - Windows SDK (para la version 10 u 11 segun sea el SO)
     > ℹ️ Podés verificar tu entorno ejecutando el script `verificarInstalacion.ps1`.

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
   npm start
   ```
   o
   ```bash
   node --expose-gc src/server.js
   ```
   dado que requiere `--expose-gc` habilitado para permitir la liberacion manual de memoria usada por WinAx

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
