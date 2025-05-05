import { z } from 'zod';

export const graficoGrupoCreateSchema = z.object({
    subproyectoId: z.number().int().positive(),
    nombre: z.string().max(20),
    pozos: z.array(z.number().int()),
    graficos: z.array(z.number().int())
});

export const graficoGrupoUpdateSchema = graficoGrupoCreateSchema.partial();
