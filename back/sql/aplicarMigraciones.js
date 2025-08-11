import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { pool, dbErrorMsg } from '../src/database/db.js';
import { fileURLToPath } from 'url';

// __dirname para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a migraciones
const MIGRACIONES_DIR = path.resolve(__dirname, 'migraciones');

// Detectar --dry-run
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

async function aplicarMigraciones () {
    const conn = await pool.getConnection();
    try {
        const [aplicadas] = await conn.query('SELECT nombreArchivo FROM MigracionesAplicadas');
        const yaAplicadas = new Set(aplicadas.map(r => r.nombreArchivo));

        // Leer archivos del directorio
        const archivos = (await readdir(MIGRACIONES_DIR))
            .filter(f => f.endsWith('.sql'))
            .sort();

        const pendientes = archivos.filter(a => !yaAplicadas.has(a));

        if (isDryRun) {
            if (pendientes.length > 0) {
                console.log('Modo dry-run activado. Las siguientes migraciones se aplicarían:');
                pendientes.forEach(a => console.log(`→ ${a}`));
            } else {
                console.log('Modo dry-run activado. No quedan migraciones pendientes por aplicar');
            }
            conn.release();
            process.exit(0);
        }

        for (const archivo of pendientes) {
            const fullPath = path.join(MIGRACIONES_DIR, archivo);
            const sql = await readFile(fullPath, 'utf8');

            // Extraer comentario si está en la primera línea
            const primeraLinea = sql.split('\n')[0].trim();
            const comentario = primeraLinea.startsWith('--')
                ? primeraLinea.replace(/^--\s*/, '').slice(0, 254)
                : null;

            console.log(`→ Aplicando: ${archivo}`);

            // Iniciar transacción por archivo
            await conn.beginTransaction();
            try {
                // Ejecutar statements (uno por uno)
                // Nota: este split es simple; si usás procedimientos/DELIMITER, ver notas abajo.
                const statements = sql
                    .split(/;\s*(?:\r?\n)+/g)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

                for (const stmt of statements) {
                    console.log('----> ', stmt);
                    await conn.query(stmt);
                }

                // Registrar la migración dentro de la misma transacción
                await conn.query(
                    'INSERT INTO MigracionesAplicadas (nombreArchivo, aplicadoPor, comentario) VALUES (?, ?, ?)',
                    [archivo, process.env.USER || 'script', comentario]
                );

                // Commit si todo fue bien
                await conn.commit();
                console.log(`✔ Aplicado: ${archivo}\n`);
            } catch (err) {
                // Rollback si algo falla en este archivo
                await conn.rollback();
                console.error(`✗ Error en ${archivo}:`, err.message);
                // Re-lanzar con tu formato estándar
                throw dbErrorMsg(500, `Error al aplicar ${archivo}: ${err.message}`);
            }
        }

        if (pendientes.length === 0) {
            console.log('✓ No hay migraciones pendientes');
        }
    } catch (error) {
        console.error('✗ Error general:', error.message);
        throw dbErrorMsg(error.status || 500, error.message);
    } finally {
        conn.release();
        process.exit(0);
    }
}

// Ejecutar si se corre directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        await aplicarMigraciones();
        if (!isDryRun) console.log('✔ Migraciones completas');
    } catch (err) {
        console.error('✗ Falló la aplicación de migraciones:', err.message);
        process.exit(1);
    }
}
