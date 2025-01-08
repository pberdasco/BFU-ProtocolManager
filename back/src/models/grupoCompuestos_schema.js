import { z } from "zod";

export const grupoCompuestoCreateSchema = z.object({
    nombre: z.string().max(45),
    matrizCodigo: z.number().int().positive(),
});


export const grupoCompuestoUpdateSchema = grupoCompuestoCreateSchema.partial();