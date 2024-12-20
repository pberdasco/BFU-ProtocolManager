import { z } from "zod";

export const compuestoCreateSchema = z.object({
    nombre: z.string().max(45),
    sinonimo: z.string().max(30),
    funcion: z.number().int().min(1).max(2),
    agrupaEn: z.number().int()
});


export const compuestoUpdateSchema = compuestoCreateSchema.partial();