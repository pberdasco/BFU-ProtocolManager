import { z } from 'zod';
import { numberSchema } from './utils/numberSchema.js';

export const pozosCreateSchema = z.object({
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
    nombre: z.string().max(20, 'El código no puede superar los 20 caracteres'),
    estadoId: z.number().int(),
    tipoId: z.number().int(),
    latitud: numberSchema({ desde: -90.999999, hasta: 90.999999 }).nullable().optional(),
    longitud: numberSchema({ desde: -180.999999, hasta: 180.999999 }).nullable().optional()
});

export const pozosUpdateSchema = pozosCreateSchema.partial();
