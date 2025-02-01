import { z } from "zod";

export const umCreateSchema = z.object({
    nombre: z.string().max(10),   
});


export const umUpdateSchema = umCreateSchema.partial();