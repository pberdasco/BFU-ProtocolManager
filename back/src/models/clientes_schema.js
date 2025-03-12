import { z } from 'zod';

export const clienteCreateSchema = z.object({
    codigo: z.string().max(12),
    nombre: z.string().max(45)
});

export const clienteUpdateSchema = clienteCreateSchema.partial();
