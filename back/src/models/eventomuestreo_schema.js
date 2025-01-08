import { z } from "zod";

export const eventomuestreoCreateSchema = z.object({
    fecha: z.string ().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "La fecha del evento de muestreo debe tener el formato YYYY-MM-DD"
    )
    .refine((val) => !isNaN(Date.parse(val)), {
        message: "La fecha del evento de muestreo no es válida",
    }),
    subproyectoId: z.number().int().min(1, "El ID del subproyecto debe ser válido"),
    nombre: z.string().max(45, "El nombre no puede superar los 45 caracteres"),
    cadenaCustodiaLink: z.string().max(60, "El identificador de cadena de custodia no puede superar los 60 caracteres"),    
});

export const eventomuestreoUpdateSchema = eventomuestreoCreateSchema.partial();