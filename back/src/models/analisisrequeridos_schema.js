import { z } from "zod";

export const analisisRequeridoCreateSchema = z.object({
    cadenaCustodiaId: z.number().int().positive(), 
    tipo: z.number().int().min(1).max(2),
    grupoId: z.number().int().positive().nullable(),
    compuestoId: z.number().int().positive().nullable(),
    metodoId: z.number().int().positive()
});


export const analisisRequeridoUpdateSchema = analisisRequeridoCreateSchema.partial();