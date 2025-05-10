import { z } from 'zod';
import { dateSchema } from './utils/dateSchema.js';

export const eventomuestreoCreateSchema = z.object({
    fecha: dateSchema,
    subproyectoId: z.number().int().min(1),
    nombre: z.string().max(45),
    soloMuestras: z.boolean(),
    cadenasCustodiaPDFLink: z.string().max(60).nullable()
});

export const eventomuestreoUpdateSchema = eventomuestreoCreateSchema.partial();
