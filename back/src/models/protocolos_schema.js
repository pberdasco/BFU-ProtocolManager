import { z } from 'zod';

export const formDataSchema = z.object({
    evento: z.number().int().positive(),
    laboratorio: z.number().int().positive(),
    matrizId: z.number().int().positive(),
    indicePagina: z.number().int().positive(),
    adelanto: z.array(
        z.object({
            name: z.string().min(5).max(65, 'El archivo debe tener menos de 45 caracteres incluyendo el .xlsx').regex(/\.xlsx$/i, 'Debe ser un archivo Excel tipo .xlsx')
        })
    ).nonempty('Debe subir al menos un archivo')
});

export const compuestoSchema = z.object({
    compuestoLab: z.string().min(1).max(60).nullable(),
    compuestoId: z.number().int().positive().nullable(),
    metodoLab: z.string().min(1).max(60).nullable(),
    metodoId: z.number().int().positive().nullable(),
    unidadLab: z.string().min(1).max(15).nullable(),
    unidadId: z.number().int().positive().nullable()
}).passthrough(); // Permite que existan otros campos dinámicos (las muestras)

export const adelantoDataSchema = z.object({
    data: z.array(compuestoSchema).nonempty('Debe haber al menos un compuesto'),
    muestras: z.array(
        z.object({
            muestraLab: z.string().min(1).max(255),
            muestraCadena: z.number().int().positive().nullable()
        })
    ).nonempty('Debe haber al menos una muestra')
});
