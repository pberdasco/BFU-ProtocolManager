import { z } from "zod";

export const pozosCreateSchema = z.object({
    subproyectoId: z.number().int().min(1, "El ID del subproyecto debe ser válido"),
    nombre: z.string().max(20, "El código no puede superar los 20 caracteres"),
    estado: z.number().int().max(1, "El estado del pozo debe ser válido"),
    tipo: z.number().int().max(3, "El tipo de pozo debe ser válido"),
});

export const pozosUpdateSchema = pozosCreateSchema.partial();

