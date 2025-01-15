import { z } from "zod";

export const metodoCreateSchema = z.object({
    nombre: z.string().max(45),  
    sinonimo: z.string().max(45),  
    funcion: z.number().int().min(1),  
});


export const metodoUpdateSchema = metodoCreateSchema.partial();