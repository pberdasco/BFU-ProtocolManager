import { z } from 'zod';

export const eventomuestreoCreateSchema = z.object({
  fecha: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        // Si es formato largo, truncamos a "YYYY-MM-DD"
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)) {
          return val.slice(0, 10);
        }
        // Si ya está en "YYYY-MM-DD", lo devolvemos como está
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return val;
        }
      }
      return val; // Devolver el valor original si no es un string
    },
    z.string().regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'La fecha debe estar en formato YYYY-MM-DD o ISO 8601 completo'
    )
  ).refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha del evento de muestreo no es válida'
  }),
  subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser válido'),
  nombre: z.string().max(45, 'El nombre no puede superar los 45 caracteres'),
  cadenasCustodiaPDFLink: z.string().max(60, 'El link al PDF de las cadenas de custodia no puede superar los 60 caracteres').nullable()
});

export const eventomuestreoUpdateSchema = eventomuestreoCreateSchema.partial();
