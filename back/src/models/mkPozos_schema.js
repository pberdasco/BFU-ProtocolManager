import { z } from 'zod';

export const mkPozosCreateSchema = z.object({
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
    pozoId: z.number().int().min(1, 'El ID del pozo debe ser válido'),
    hojaId: z.number().refine((val) => val >= 1 && val <= 3, { message: 'El valor debe estar entre 1y 3' })

});

export const mkPozosUpdateSchema = mkPozosCreateSchema.partial();
