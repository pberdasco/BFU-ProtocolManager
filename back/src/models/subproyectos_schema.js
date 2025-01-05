import { z } from "zod";

export const subproyectoCreateSchema = z.object({
    proyectoId: z.number().int().min(1, "El ID del proyecto debe ser válido"),
    autAplicacionId: z.number().int().min(1, "El ID de la aplicación debe ser válido"),
    codigo: z.string().max(10, "El código no puede superar los 10 caracteres"),
    nombreLocacion: z.string().max(45, "El nombre de la locación no puede superar los 40 caracteres").default(""),
    ubicacion: z.string().max(45, "La ubicación no puede superar los 45 caracteres").default(""),
    apies: z.string().max(10, "El código apies no puede superar los 10 caracteres").default(""),
    objetivo: z.string().max(45, "El objetivo no puede superar los 45 caracteres").default(""),
    notas: z.string().max(60, "Las notas admiten hasta 60 caracteres").default(""),
});

export const subproyectoUpdateSchema = subproyectoCreateSchema.partial();


// Analizar si truncar en lugar de rechazar
// codigo: z.string().max(10).transform((val) => val.slice(0, 10))