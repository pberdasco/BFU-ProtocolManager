import { z } from "zod";

export const relCompuestoGrupoCreateSchema = z.object({
    grupoId: z.number().int().positive(),
    compuestoId: z.number().int().positive()
});


export const relCompuestoGrupoUpdateSchema = relCompuestoGrupoCreateSchema.partial();