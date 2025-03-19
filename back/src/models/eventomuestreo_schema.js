import { z } from 'zod';
import { dateSchema } from './utils/dateSchema.js';

export const eventomuestreoCreateSchema = z.object({
    fecha: dateSchema,
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
    nombre: z.string().max(45, 'El nombre no puede superar los 45 caracteres'),
    cadenasCustodiaPDFLink: z.string().max(60, 'El link al PDF de las cadenas de custodia no puede superar los 60 caracteres').nullable()
});

export const eventomuestreoUpdateSchema = eventomuestreoCreateSchema.partial();
