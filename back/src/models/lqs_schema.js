import { z } from 'zod';

export const lqCreateSchema = z.object({
    laboratorioId: z.number().int().min(1, 'El ID del laboratorio debe ser válido'),
    compuestoId: z.number().int().min(1, 'El ID del compuesto debe ser válido'),
    metodoId: z.number().int().min(1, 'El ID del método debe ser válido'),
    UMId: z.number().int().min(1, 'El ID de la um debe ser válido'),
    valorLQ: z.number().refine((val) => val >= 0 && val <= 999.99999, {
        message: 'El valor debe estar entre 0 y 999.99999'
    }),
    matrizId: z.number().refine((val) => val >= 1 && val <= 4, {
        message: 'El valor de la matriz debe estar entre 1 y 4'
    })

});

export const lqUpdateSchema = lqCreateSchema.partial();
