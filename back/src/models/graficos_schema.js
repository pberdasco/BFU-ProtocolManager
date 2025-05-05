import { z } from 'zod';

export const graficoCreateSchema = z.object({
    nombre: z.string().max(255),
    eje1: z.array(z.number().int()),
    eje2: z.array(z.number().int())
});

export const graficoUpdateSchema = graficoCreateSchema.partial();
