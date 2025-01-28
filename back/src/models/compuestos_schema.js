import { z } from "zod";

export const compuestoCreateSchema = z.object({
    nombre: z.string().max(45),
    codigo: z.string().max(10),
    agrupaEn: z.number().int().nullable(),
    exponeId: z.number().int().min(0).max(2),
    matrizCodigo: z.number().int().positive(),
});


export const compuestoUpdateSchema = compuestoCreateSchema.partial();