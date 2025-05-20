import { z } from 'zod';
import { numberSchema } from './utils/numberSchema.js';

export const muestrasCreateSchema = z.object({
    pozoId: z.number().int().positive().nullable(),
    cadenaCustodiaId: z.number().int().positive(),
    nombre: z.string().max(45, 'El nombre no puede superar los 45 caracteres'),
    tipo: z.number().int()
        .min(1, 'El tipo puede ser 1: Pozo, 2: Sondeo, 3:Equipo, 4: Blanco')
        .max(4, 'El tipo puede ser 1: Pozo, 2: Sondeo, 3:Equipo, 4: Blanco'),
    nivelFreatico: numberSchema({ desde: 0, hasta: 99.999 }).optional(),
    nivelFLNA: numberSchema({ desde: 0, hasta: 99.999 }).nullable().optional(),
    flna: numberSchema({ desde: 0, hasta: 99.999 }).nullable().optional(),
    profundidad: numberSchema({ desde: 0, hasta: 99.999 }).optional(),
    cadenaOPDS: z.string().max(10).optional(),
    protocoloOPDS: z.string().max(10).optional()
});

export const muestrasUpdateSchema = muestrasCreateSchema.partial();
