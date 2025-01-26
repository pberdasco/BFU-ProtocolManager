import { z } from "zod";

export const sinonimoMetodoCreateSchema = z.object({
    textoLab: z.string().max(60, "El textoLab no puede superar los 60 caracteres"),
    textoProcesado: z.string().max(60, "El textoProcesado no puede superar los 60 caracteres"),
    metodoId: z.number().int().min(1, "El ID del metodo debe ser un entero positivo")
});

export const sinonimoMetodoUpdateSchema = sinonimoMetodoCreateSchema.partial();

export const metodosOriginalesSchema = z.object({
    metodosOriginales: z
      .array(
        z
          .string()
          .max(60, "Cada metodo no puede superar los 45 caracteres")
          .nonempty("El metodo no puede estar vacío")
      )
      .min(1, "Debe enviarse al menos un metodo original")
      .max(100, "No se pueden enviar más de 100 metodos a la vez"), 
});