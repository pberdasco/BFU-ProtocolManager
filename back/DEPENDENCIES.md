# Dependencias y seguridad

Revisión: 2026-10-25. Ejecutar los comandos desde `back/` usando Corepack y la versión de pnpm de `packageManager`.

## Actualizaciones compatibles

- `docx`: 9.6.0 → 9.14.0.
- `express`: 4.22.1 → 4.22.3, conservando Express 4.
- `mysql2`: 3.18.2 → 3.24.6.
- Dependencias transitivas actualizadas dentro de los rangos declarados, incluyendo correcciones de `proxy-addr`, `body-parser`, `qs`, `path-to-regexp`, `brace-expansion`, `lodash`, `tmp`, `js-yaml` y `flatted`.
- Se conserva `winax` 3.6.10.
- Zod 3.25.76 → 4.6.7, con adaptación de controladores y pruebas de compatibilidad.

## Warning conocido de docx (sin parche)

Incluso docx 9.14.0 incluye una utilidad de deprecación de navegador que consulta `localStorage` durante su importación en Node 26. Esto emite un `ExperimentalWarning` aunque la aplicación no utilice Web Storage.

Se utiliza la distribución oficial de docx, sin parches propios ni cambios en globales o filtros de warnings. El aviso no impide generar documentos; se acepta temporalmente hasta que una actualización de la librería lo resuelva.

Al actualizar docx, revisar si upstream corrigió el problema. `pnpm run test:dependencies` comprueba que se genera un documento con los helpers de la aplicación, sin exigir que desaparezca el aviso.

## Override acotado de UUID

ExcelJS 4.4.0 (última versión disponible en esta revisión) depende de UUID 8.3.2, que la auditoría marca por falta de comprobación de límites de buffer en generadores v3/v5/v6. El uso encontrado en ExcelJS es v4; aun así se actualiza la dependencia para eliminar la versión afectada del árbol.

Se fuerza **solo `exceljs>uuid` a 11.1.1**, que mantiene `require('uuid').v4()`. La revisión del código de ExcelJS encontró únicamente llamadas a `v4()` sin argumentos para identificadores de formatos condicionales. La prueba XLSX usa un iconSet extendido `3Stars` para ejercitar esa ruta, valida el UUID y reabre el archivo.

No generalizar el override a otras dependencias ni actualizar UUID a una versión solo ESM sin revisar compatibilidad. Retirarlo cuando una versión de ExcelJS incluya una dependencia corregida.

## Migración de Zod 3 a Zod 4

Zod 4.6.7 corrige la alerta **alta** de Zod 3.25.76: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), agotamiento de memoria al validar colecciones grandes con numerosos elementos inválidos. La corrección publicada requiere Zod >=4.6.6.

`src/controllers/validations.js` centraliza el parseo de bodies y convierte `ZodError.issues` a campos `field` y `message`, manteniendo el contrato con el frontend. Los métodos `bodyValidations` de los controladores seleccionan el esquema y delegan al helper; el manejo HTTP permanece en cada controlador. Los textos predeterminados de Zod pueden diferir respecto de la versión anterior.

Las pruebas cubren también los casos especiales de protocolos (orden y rutas de errores), reemplazos de Mann-Kendall, listas de sinónimos y proyectos extendidos. Se conserva el comportamiento previo de `updateExtended`, que utiliza el esquema de alta extendida; revisar esa selección por separado si se desea admitir modificaciones parciales en ese endpoint.

En subproyectos, los defaults de textos se conservan para altas pero se quitan del esquema de modificación: Zod 4 los aplicaría incluso dentro de campos opcionales y podría reemplazar valores existentes por textos vacíos. Las pruebas cubren este comportamiento, construcción de los esquemas, validación de controladores, fechas/números, arrays de reportes y claves dinámicas de muestras.

## Comprobaciones

```powershell
pnpm install --frozen-lockfile
pnpm lint
pnpm run test:dependencies
pnpm run test:validation
pnpm run test:native
pnpm audit
pnpm audit --prod
```

La auditoría pasó de 36 alertas (incluida una crítica) a **cero alertas conocidas**, tanto en el árbol completo como en producción. Los resultados pueden cambiar con nuevas publicaciones de seguridad.

Antes de desplegar, repetir login, una exportación Word real, una exportación Excel común y los reportes Mann-Kendall/Evolución CDI. Las pruebas automáticas de dependencias no sustituyen la inspección del formato final de los documentos ni la integración con MySQL.
