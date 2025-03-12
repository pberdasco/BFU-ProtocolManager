import { z } from 'zod';

export const sinonimoUmCreateSchema = z.object({
    textoLab: z.string().max(10, 'El textoLab no puede superar los 10 caracteres'),
    textoProcesado: z.string().max(10, 'El textoProcesado no puede superar los 10 caracteres'),
    umId: z.number().int().min(1, 'El ID de la unidad de medida debe ser un entero positivo')
});

export const sinonimoUmUpdateSchema = sinonimoUmCreateSchema.partial();

export const umsOriginalesSchema = z.object({
    umsOriginales: z
        .array(
            z
                .string()
                .max(10, 'Cada um no puede superar los 45 caracteres')
                .nonempty('El um no puede estar vacío')
        )
        .min(1, 'Debe enviarse al menos una um original')
        .max(100, 'No se pueden enviar más de 100 ums a la vez')
});
