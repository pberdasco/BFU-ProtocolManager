import { z } from 'zod';

export const mkCompuestosCreateSchema = z.object({
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
    compuestoId: z.number().int().min(1, 'El ID del compuesto debe ser válido')
});

export const mkCompuestosUpdateSchema = mkCompuestosCreateSchema.partial();
