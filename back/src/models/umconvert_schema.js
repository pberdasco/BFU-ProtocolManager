import { z } from 'zod';
import { numberSchema } from './utils/numberSchema.js';

export const umConvertCreateSchema = z.object({
    desdeUMId: z.number().int().min(1, 'El ID de la um debe ser válido'),
    hastaUMId: z.number().int().min(1, 'El ID de la um debe ser válido'),
    factor: numberSchema({ desde: 0, hasta: 9999.999999 })
});

export const umConvertUpdateSchema = umConvertCreateSchema.partial();
