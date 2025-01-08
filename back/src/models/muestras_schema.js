import { z } from "zod";

export const muestrasCreateSchema = z.object({
    pozoId: z.number().int().min(1, "El ID del pozo debe ser válido"),
    eventoMuestreoId: z.number().int().min(1, "El ID del evento de muestreo debe ser válido"),
    nombre: z.string().max(45, "El nombre no puede superar los 45 caracteres"),
    tipo: z.number().int()
    .min(1, "El tipo de muestra debe ser válido")
    .max(4, "El tipo de muestra debe ser válido"),
    cantViales: z.number().int().min(0, "La cantidad de viales debe ser válida"),
    cantBotellas05: z.number().int().min(0, "La cantidad de botellas de 0.5L debe ser válida"),
    cantBotellas1: z.number().int().min(0, "La cantidad de botellas de 1L debe ser válida"),
    cantBotellas2: z.number().int().min(0, "La cantidad de botellas de 2L debe ser válida"),    
});

export const muestrasUpdateSchema = muestrasCreateSchema.partial();

