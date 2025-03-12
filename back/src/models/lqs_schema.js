import { z } from 'zod';

export const lqCreateSchema = z.object({
    laboratorioId: z.number().int().min(1, 'El ID del laboratorio debe ser válido'),
    compuestoId: z.number().int().min(1, 'El ID del compuesto debe ser válido'),
    valorLQ: z.number().refine((val) => val >= 0 && val <= 999.99999, {
        message: 'El valor debe estar entre 0 y 999.99999'
    })
});

export const lqUpdateSchema = lqCreateSchema.partial();
