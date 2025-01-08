import { z } from "zod";

export const protocolosCreateSchema = z.object({
    numero: z.string().max(10, "El número no puede superar los 10 caracteres"),
    fecha: z.string ().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "La fecha de la autoridad de aplicación debe tener el formato YYYY-MM-DD"
    )
    .refine((val) => !isNaN(Date.parse(val)), {
        message: "La fecha de la autoridad de aplicación no es válida",
    }),
    laboratorioId: z.number().int().min(1, "El ID del laboratorio debe ser válido"),    
});

export const protocolosUpdateSchema = protocolosCreateSchema.partial();

