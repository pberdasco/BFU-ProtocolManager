import { z } from 'zod';

const grupoSchema = z.object({
    id: z.number().int().positive(),
    subproyectoId: z.number().int().positive(),
    nombre: z.string().min(1),
    pozos: z.array(z.number().int().positive()),
    graficos: z.array(z.number().int().positive())
});

const graficoSchema = z.object({
    id: z.number().int().positive(),
    nombre: z.string().min(1),
    eje1: z.array(z.number().int()),
    eje2: z.array(z.number().int())
});

export const configSchema = z.object({
    subproyectoId: z.number().int().positive(),
    proyectoNombre: z.string().min(1),
    gruposConfig: z.array(grupoSchema),
    graficosConfig: z.array(graficoSchema)
});
