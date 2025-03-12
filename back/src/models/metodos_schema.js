import { z } from 'zod';

export const metodoCreateSchema = z.object({
    nombre: z.string().max(45)
});

export const metodoUpdateSchema = metodoCreateSchema.partial();
