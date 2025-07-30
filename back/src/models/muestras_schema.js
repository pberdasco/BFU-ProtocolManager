import { z } from 'zod';
import { numberSchema } from './utils/numberSchema.js';

export const muestrasCreateSchema = z.object({
    pozoId: z.number().int().positive().nullable(),
    cadenaCustodiaId: z.number().int().positive(),
    nombreBase: z.string().max(16, 'El nombre base no puede superar los 16 caracteres'),
    nombreIndex: z.number().int().positive().nullable().optional(),
    nombre: z.string().max(20, 'El nombre no puede superar los 20 caracteres'),
    tipo: z.number().int()
        .min(1, 'El tipo puede ser 1: Pozo, 2: Sondeo, 3:Equipo, 4: Blanco, 5: Otros')
        .max(5, 'El tipo puede ser 1: Pozo, 2: Sondeo, 3:Equipo, 4: Blanco, 5: Otros'),
    nivelFreatico: numberSchema({ desde: 0, hasta: 999.999 }).optional(),
    nivelFLNA: numberSchema({ desde: 0, hasta: 999.999 }).nullable().optional(),
    flna: numberSchema({ desde: 0, hasta: 999.999 }).nullable().optional(),
    profundidad: numberSchema({ desde: 0, hasta: 999.999 }).nullable().optional(),
    cadenaOPDS: z.string().max(10).nullable().optional(),
    protocoloOPDS: z.string().max(10).nullable().optional()
});

export const muestrasUpdateSchema = muestrasCreateSchema.partial();
