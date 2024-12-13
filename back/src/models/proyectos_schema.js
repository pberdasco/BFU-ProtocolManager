import { z } from "zod";

export const proyectoCreateSchema = z.object({
    codigo: z.string().max(10, "El codigo no puede superar los 10 caracteres"),
    nombre: z.string().max(45),
    empresa: z.string().max(45)
});

export const proyectoUpdateSchema = proyectoCreateSchema.partial();