import { z } from "zod";

export const laboratorioCreateSchema = z.object({
    nombre: z.string().max(45),
    domicilio: z.string().max(60),
    formato: z.string().max(60)
});

export const laboratorioUpdateSchema = laboratorioCreateSchema.partial();