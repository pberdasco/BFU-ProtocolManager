# Changelog

Registro de cambios relevantes por entrega. Los cambios pendientes se agrupan en **Sin publicar**; al desplegarlos, reemplazar ese encabezado por la fecha real de la entrega en formato `YYYY-MM-DD`, con las entradas más recientes primero.

No es necesario listar todos los commits: Git conserva el detalle técnico. Cuando corresponda, agregar un enlace a la PR o a la comparación entre entregas.

## [Sin publicar]

### Infraestructura y seguridad
- Backend migrado de Node 22 a **Node 26.12.1**, con **winax 3.6.10** para la automatización de Excel.
- Migración de npm a **pnpm 12.15.0 mediante Corepack**, con instalación reproducible desde el lockfile.
- Actualizados docx, Express 4, mysql2 y dependencias transitivas para corregir alertas de seguridad.
- Migración de Zod 3 a **Zod 4.6.7** y override de UUID 11.1.1 limitado a ExcelJS. Auditoría sin vulnerabilidades conocidas al momento de la revisión.

### Mantenimiento y correcciones
- Centralizada la validación de los controladores, conservando el formato de errores del frontend.
- Preservados los campos omitidos en modificaciones parciales de subproyectos para evitar reemplazarlos por textos vacíos al migrar a Zod 4.
- Modo de desarrollo limitado a observar `src/`, evitando reinicios por cambios detectados en dependencias durante la generación de reportes.
- Agregadas pruebas de validación, generación de documentos, procesamiento HTTP y dependencias nativas.

### Despliegue
- Reinstalar las dependencias desde `back/` con Node 26: no reutilizar `node_modules` de Node 22 o de npm. Usar `pnpm install --prod --frozen-lockfile` en producción.
- La compilación de winax requiere Windows, Python, herramientas C++ de Visual Studio y Windows SDK. Los reportes automatizados requieren Excel de escritorio instalado.
- Si conviven aplicaciones con distintas versiones de Node en el servidor, configurar cada servicio con la ruta absoluta de su `node.exe`, sin depender de `nvm use`. Mantener `back/` como directorio de trabajo y el argumento `--expose-gc`.
- Validar login, edición de datos, exportaciones Word/Excel y reportes Mann-Kendall/Evolución CDI antes de publicar.

### Problemas conocidos
- docx puede emitir un warning de `localStorage` en Node 26 sin impedir la generación de Word. Se utiliza la distribución oficial, sin parches propios ni filtros de warnings.
