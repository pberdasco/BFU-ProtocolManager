import { z } from "zod";

export const sinonimoCompuestoCreateSchema = z.object({
    textoLab: z.string().max(60, "El textoLab no puede superar los 60 caracteres"),
    textoProcesado: z.string().max(60, "El textoProcesado no puede superar los 60 caracteres"),
    compuestoId: z.number().int().min(1, "El ID del compuesto debe ser un entero positivo"),
    matrizId: z.number().int().min(1, "El ID de la matriz debe ser un entero positivo"),
});

export const sinonimoCompuestoUpdateSchema = sinonimoCompuestoCreateSchema.partial();

export const compuestosOriginalesSchema = z.object({
    matrizId: z.number().int().min(1, "El ID de la matriz debe ser un entero positivo"),
    compuestosOriginales: z
      .array(
        z
          .string()
          .max(60, "Cada compuesto no puede superar los 60 caracteres")
          .nonempty("El compuesto no puede estar vacío")
      )
      .min(1, "Debe enviarse al menos un compuesto original")
      .max(100, "No se pueden enviar más de 100 compuestos a la vez"), 
});