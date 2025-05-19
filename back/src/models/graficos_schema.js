import { z } from 'zod';

export const graficoCreateSchema = z.object({
    nombre: z.string().min(1).max(20),
    eje1: z.array(z.number().int()),
    eje2: z.array(z.number().int()),
    seccion: z.number().int().positive(),
    anexoNombre: z.string().min(1).max(20)
});

export const graficoUpdateSchema = graficoCreateSchema.partial();
