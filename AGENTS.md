# AGENTS.md — BFU Protocol Manager

## Alcance y contexto

Estas instrucciones aplican a todo este repositorio.

Backend para gestión de protocolos de laboratorio, cadenas de custodia, proyectos, pozos, muestras y reportes analíticos.

- La aplicación Node está en **`back/`**, no en la raíz.
- JavaScript ESM, Express **4**, MySQL **8.4** mediante `mysql2/promise`, Zod **4**.
- ExcelJS y docx generan documentos; winax automatiza Excel de escritorio para Mann-Kendall y gráficos de Evolución CDI.
- El frontend principal está en el repositorio hermano **`BFU-Protocol-Front`**. No modificarlo sin que el pedido incluya ese alcance.
- `public/` contiene archivos estáticos servidos por el backend. No confundirlos ni confundir `src/` de la raíz con el código principal de `back/src/`.

## Forma de trabajo

- Antes de cambiar un endpoint, revisar router, controller, service, model, schema y, cuando corresponda, su consumidor en el frontend.
- Mantener cambios chicos y localizados. Seguir los patrones existentes sin introducir frameworks, ORMs ni capas nuevas innecesarias.
- Respetar nombres de archivos y entidades, incluso inconsistencias históricas. No hacer renombrados o limpieza general fuera del pedido.
- No descartar ni sobrescribir cambios ajenos. No hacer commits, push o despliegues sin que el usuario lo pida.
- Separar refactors de cambios de comportamiento. Si se descubre un posible bug ajeno al pedido, señalarlo antes de corregirlo.
- No ejecutar migraciones, restauraciones de backups ni escrituras en producción sin autorización explícita.

## Entorno, instalación y comandos

- Usar las versiones de Node y pnpm fijadas en `back/.nvmrc` y `back/package.json`, con **Corepack**.
- No instalar pnpm globalmente. Corepack selecciona la versión y hash de `packageManager`.
- Consultar `back/README.md` para preparar el entorno. No cambiar herramientas globales sin explicar su alcance y obtener autorización cuando sea necesario.
- Ejecutar los comandos desde **`back/`**. El backend carga `.env` y resuelve algunos recursos respecto del directorio de trabajo.
- Usar pnpm; no generar `package-lock.json` ni instalar dependencias del proyecto con npm.
- `pnpm-workspace.yaml` configura este backend, no un monorepo con los repositorios hermanos.

```powershell
pnpm install --frozen-lockfile
pnpm dev
pnpm start
pnpm lint
pnpm run test:dependencies
pnpm run test:validation
pnpm run test:native
pnpm audit
pnpm audit --prod
```

- Conservar `--expose-gc` en los comandos que automatizan Excel.
- `pnpm test` todavía es un placeholder que falla: utilizar los scripts específicos anteriores.
- Al cambiar de versión mayor de Node, reinstalar los addons nativos; no reutilizar `node_modules` compilado para otro runtime.

## Estructura y responsabilidades

- `back/src/server.js`: Express, registro de routers y publicación de archivos estáticos.
- `back/src/routers/*_router.js`: rutas y encadenamiento de middleware.
- `back/src/controllers/*_controller.js`: validación de entrada y respuestas HTTP; normalmente clases con métodos estáticos.
- `back/src/services/*_service.js`: lógica de negocio y acceso SQL.
- `back/src/services/reportes/`: reportes, conversión de unidades, plantillas y automatización de documentos.
- `back/src/models/*_model.js`: modelos y serialización.
- `back/src/models/*_schema.js` y `models/utils/`: esquemas Zod y preprocesadores.
- `back/src/middleware/`: errores, consultas DevExtreme, sesiones y utilidades de autenticación.
- `back/src/database/db.js`: pool MySQL y `dbErrorMsg`.
- `back/assets/`: plantillas de documentos. `back/sql/migraciones/`: cambios de base de datos.
- `back/test/`: pruebas con el runner nativo **`node:test`**.

## API, validación y errores

- Mantener las rutas específicas antes de `/:id` y registrar nuevos routers en `back/src/server.js`.
- Respetar los códigos HTTP y contratos existentes; no normalizar todas las respuestas como parte de otro cambio.
- Los controllers validan, llaman al service y responden. No trasladar lógica de negocio pesada a routers/controllers.
- Validar entradas con los esquemas de `models/` y reutilizar el helper `bodyValidations` de `controllers/validations.js`; no duplicar el parseo y formato de errores.
- Distinguir altas de modificaciones parciales y respetar los campos opcionales, conversiones y datos dinámicos de cada recurso.
- Usar `showError(req, res, error)` y los helpers existentes de error. No devolver stacks al cliente ni incorporar secretos a logs.
- Revisar la protección real de cada router; no asumir que existe `req.user` ni omitir controles de autenticación o autorización existentes.

## Consultas DevExtreme y SQL

- Los listados usan `createParseDevExtremeQuery`, `getAllowedFields()` y `req.allowedFields`. Mantener las listas de campos seguras y alineadas con los SELECT/JOIN.
- Conservar filtros, orden, paginación y respuestas `{ data, totalCount }` donde ese sea el contrato existente.
- Usar SQL parametrizado para valores de usuario. Solo interpolar identificadores controlados por el código y fragmentos del parser validado.
- Reutilizar `pool` de `database/db.js`. Para transacciones, obtener una conexión, ejecutar todas las consultas en ella y asegurar rollback/release.
- Revisar dependencias, integridad referencial y conversiones de unidades al modificar datos de muestras y reportes. Evitar consultas N+1 innecesarias.

## Base de datos y migraciones

- Usar una base local/de QA. Verificar host, puerto y base antes de ejecutar SQL. No reutilizar credenciales de producción en archivos versionados.
- Agregar cambios de esquema en `back/sql/migraciones/`; no editar migraciones ya aplicadas ni renombrarlas, porque se registran por nombre en `MigracionesAplicadas`.
- Para nuevas migraciones, usar fechas con ceros (`YYYY-MM-DD`) y un sufijo que ordene los cambios del día. Revisar el orden lexicográfico junto con los archivos históricos.
- La primera línea `-- Descripción` se registra como comentario. No fijar el nombre de la base con `USE`: el destino proviene del entorno.
- Revisar `back/sql/aplicarMigraciones.js` antes de escribir SQL complejo: separa sentencias con un parser simple y no maneja arbitrariamente `DELIMITER`/procedimientos.
- Incluso el modo `--dry-run` del aplicador se conecta a la base: verificar siempre el entorno de destino.
- No asumir que todo DDL de MySQL se revierte con una transacción. Evaluar respaldo y recuperación antes de cambios destructivos.

## Excel, Word y recursos COM

- Windows y Excel de escritorio son requisitos para automatización COM. winax se compila con Python, herramientas C++ de Visual Studio y Windows SDK.
- Preservar plantillas `.xlsx`/`.xlsm`, macros, nombres de hojas, rangos, formatos y reglas de unidades. No reemplazar plantillas ni ejecutar macros del cliente solo para explorar código.
- No sustituir automatización COM por generación de archivos sin revisar las macros, cálculos y gráficos que dependen de Excel.
- Garantizar limpieza en `finally`: cerrar libros propios, salir de las instancias creadas y liberar referencias con las utilidades de winax según los patrones cercanos.
- No eliminar bloques de limpieza COM por parecer redundantes ni confiar únicamente en el GC. No matar globalmente `EXCEL.EXE`: puede haber libros abiertos del usuario.
- Para pruebas, crear archivos temporales propios y no sobrescribir reportes o plantillas reales. Preferir el directorio temporal de OpenCode aprobado cuando corresponda.

## Dependencias y parches

- Preferir actualizaciones compatibles y revisar saltos mayores por separado, con pruebas del código afectado. No usar `audit fix --force` ni actualizar todo a `latest` sin evaluar compatibilidad.
- Mantener `package.json`, `pnpm-lock.yaml` y `pnpm-workspace.yaml` consistentes; verificar instalación con lockfile congelado.
- Autorizar solo los scripts de instalación necesarios. Revisar el alcance y compatibilidad de overrides antes de cambiarlos.
- **No introducir parches propios de dependencias ni editar `node_modules` sin consultar al usuario.** Se prefiere la distribución oficial y aceptar un warning inocuo antes que mantener un parche solo cosmético.
- Una auditoría sin alertas conocidas no sustituye las pruebas ni garantiza ausencia de vulnerabilidades futuras.

## Pruebas y cierre de cambios

- Ejecutar lint y las pruebas relacionadas. Si no es posible, informar exactamente qué no se validó y por qué.
- Revisar los requisitos de las pruebas antes de ejecutarlas: algunas cargan addons nativos o abren Excel. Usar datos y archivos de prueba propios.
- No afirmar que las pruebas automáticas validan el formato visual de documentos ni la integración real con MySQL.
- Para cambios en runtime, validación o reportes, proponer QA de login, altas/modificaciones, entradas inválidas, exportaciones Word/Excel, Mann-Kendall y Evolución CDI. Verificar que no queden instancias propias de Excel colgadas.
- Mantener las pruebas en Git; su exclusión del artefacto de producción corresponde al proceso de despliegue, no a borrarlas del repositorio.

## Estilo y documentación

- ESM con extensión `.js` en imports locales, `async/await`, punto y coma e indentación de cuatro espacios según ESLint.
- Mantener el idioma, nombres y estilo del código cercano. Comentar reglas de negocio o decisiones no evidentes, no obviedades.
- `back/README.md` describe instalación y operación actuales. Verificar el código cuando una sección histórica esté desactualizada.
- `CHANGELOG.md` registra cambios relevantes por entrega bajo **Sin publicar** hasta conocer la fecha real de despliegue (`YYYY-MM-DD`). No duplicar todos los commits ni inventar entregas históricas.
- Mantener este archivo enfocado en convenciones generales y duraderas. Los detalles de una migración, incidencias temporales o decisiones de una entrega pertenecen a su documentación específica o al historial de Git.
- No leer `.env` o backups con datos del cliente salvo necesidad real; nunca copiar secretos o información sensible a documentación, tests, commits o respuestas.
