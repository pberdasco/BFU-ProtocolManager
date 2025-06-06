import { z } from 'zod';

export const mkCompuestosCreateSchema = z.object({
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
    compuestoId: z.number().int().min(1, 'El ID del compuesto debe ser válido'),
    umId: z.number().int().min(1, 'El ID del compuesto debe ser válido')
});

export const mkCompuestosUpdateSchema = mkCompuestosCreateSchema.partial();
export const mkCompuestosReplaceSchema = z.array(mkCompuestosCreateSchema).min(1, 'Debe enviar al menos un compuesto');
