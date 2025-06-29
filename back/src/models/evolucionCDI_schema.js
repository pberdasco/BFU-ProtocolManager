import { z } from 'zod';

const isoDateString = z.string().refine(
    (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(new Date(val).getTime()),
    {
        message: "Debe tener formato 'aaaa-mm-dd' y ser una fecha válida"
    }
);

const grupoSchema = z.object({
    id: z.number().int().positive(),
    subproyectoId: z.number().int().positive(),
    nombre: z.string().min(1),
    pozos: z.array(z.number().int().positive()),
    graficos: z.array(z.number().int().positive())
});

const graficoSchema = z.object({
    id: z.number().int().positive(),
    nombre: z.string().min(1).max(20),
    eje1: z.array(z.number().int()),
    eje2: z.array(z.number().int()),
    seccion: z.number().int().positive(),
    anexoNombre: z.string().min(1).max(20)
});

export const configSchema = z.object({
    subproyectoId: z.number().int().positive(),
    proyectoNombre: z.string().min(1),
    gruposConfig: z.array(grupoSchema),
    graficosConfig: z.array(graficoSchema),
    minFechaUsuario: isoDateString.nullable(),
    maxFechaUsuario: isoDateString.nullable()
});
