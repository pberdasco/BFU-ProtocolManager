import { z } from 'zod';

export const umCreateSchema = z.object({
    nombre: z.string().max(15)
});

export const umUpdateSchema = umCreateSchema.partial();
