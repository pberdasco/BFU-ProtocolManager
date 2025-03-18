import { z } from 'zod';

export const autaplicacionCreateSchema = z.object({
    nombre: z.string().max(45),
    sitioWeb1: z.string().max(60),
    sitioWeb2: z.string().max(60),
    provinciaId: z.number().int().min(1, 'La provincia debe ser válida'),
    matrizId: z.number().positive()
});

export const autaplicacionUpdateSchema = autaplicacionCreateSchema.partial();
