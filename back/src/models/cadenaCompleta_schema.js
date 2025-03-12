// cadenaCompleta_schema.js
import { z } from 'zod';

// Validación para el ID de la cadena
export const cadenaIdSchema = z.number().int().positive();

// Validación de cada muestra
export const muestraSchema = z.object({
    muestraId: z.number().int().positive(),
    muestra: z.string().min(1).max(255),
    tipo: z.number().int().positive(),
    pozo: z.number().int().positive().nullable()
});

// Validación de cada fila de la cadena
export const filaSchema = z.object({
    id: z.number().int().positive(), // Es un identificador temporal, puede ser string
    compuestoId: z.number().int().positive(),
    metodoId: z.number().int().positive(),
    umId: z.number().int().positive(),
    estado: z.number().int(),
    protocoloItemId: z.number().int().positive().nullable()
}).passthrough(); // Permite valores dinámicos (muestras como claves)

// Validación del objeto `cadenaCompleta`
export const cadenaCompletaSchema = z.object({
    filas: z.array(filaSchema).nonempty('Debe haber al menos una fila'),
    muestras: z.array(muestraSchema).nonempty('Debe haber al menos una muestra')
});

// Validación del cuerpo de la API
export const bodyCadenaCompletaSchema = z.object({
    cadenaId: cadenaIdSchema,
    cadenaCompleta: cadenaCompletaSchema
});
