import { z } from 'zod';
import { dateSchema } from './utils/dateSchema.js';
import { numberSchema } from './utils/numberSchema.js';

export const reguladoCreateSchema = z.object({
    autAplicacionId: z.number().int().min(1, 'El ID de la autoridad de aplcación debe ser válido'),
    fechaVigencia: dateSchema,
    compuestoId: z.number().int().min(1, 'El ID del compuesto debe ser válido'),
    norma: z.string().max(45, 'La norma no puede superar los 45 caracteres'),
    umId: z.number().int().positive(),
    valorReferencia: numberSchema({ desde: -3, hasta: 999.99999 }) // -3= <=ND, -2= SAT/SOL  -1= <LQ
});

export const reguladoUpdateSchema = reguladoCreateSchema.partial();
