import { z } from "zod";

export const muestrasCreateSchema = z.object({
    pozoId: z.number().int().min(1, "El ID del pozo debe ser válido"),
    cadenaCustodiaId: z.number().int().min(1, "El ID del evento de muestreo debe ser válido"),
    nombre: z.string().max(45, "El nombre no puede superar los 45 caracteres"),
    tipo: z.number().int()
    .min(1, "El tipo puede ser 1: Pozo, 2: Equipo, 3: Blanco")
    .max(3, "El tipo puede ser 1: Pozo, 2: Equipo, 3: Blanco"),  
});

export const muestrasUpdateSchema = muestrasCreateSchema.partial();

