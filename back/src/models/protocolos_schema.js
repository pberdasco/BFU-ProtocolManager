import { nullable, z } from "zod";

export const formDataSchema = z.object({
    evento: z.number().int().positive(),
    laboratorio: z.number().int().positive(),
    matrizId: z.number().int().positive(),
    adelanto: z.array(
        z.object({
            name: z.string().min(5).max(255).regex(/\.xlsx$|\.xls$/i, "Debe ser un archivo Excel")
        })
    ).nonempty("Debe subir al menos un archivo"),
});

export const compuestoSchema = z.object({
    compuestoLab: z.string().min(1).max(45).nullable(),
    compuestoId: z.number().int().positive().nullable(),
    metodoLab: z.string().min(1).max(45).nullable(),
    metodoId: z.number().int().positive().nullable(),
    unidadLab: z.string().min(1).max(10).nullable(),
    unidadId: z.number().int().positive().nullable(),
}).passthrough(); // Permite que existan otros campos dinámicos (las muestras)

export const adelantoDataSchema = z.object({
    data: z.array(compuestoSchema).nonempty("Debe haber al menos un compuesto"),
    muestras: z.array(
        z.object({
            muestraLab: z.string().min(1).max(255),
            muestraCadena: z.number().int().positive().nullable()
        })
    ).nonempty("Debe haber al menos una muestra"),
});
