import { z } from 'zod';

export const pozosCreateSchema = z.object({
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
    nombre: z.string().max(20, 'El código no puede superar los 20 caracteres'),
    estadoId: z.number().int(),
    tipoId: z.number().int()
});

export const pozosUpdateSchema = pozosCreateSchema.partial();
