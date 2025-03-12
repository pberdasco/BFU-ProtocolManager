import { z } from 'zod';

export const matrizCadenaSchema = z.object({
  eventoId: z
    .preprocess((val) => (val !== undefined ? parseInt(val, 10) : null), z.number().nullable().optional())
    .refine((val) => val === null || !isNaN(val), {
      message: "'eventoId' debe ser un número válido o null."
    }),
  cadenaId: z
    .preprocess((val) => (val !== undefined ? parseInt(val, 10) : null), z.number().nullable().optional())
    .refine((val) => val === null || !isNaN(val), {
      message: "'cadenaId' debe ser un número válido o null."
    })
}).refine((data) => data.eventoId || data.cadenaId, {
  message: "Debe proporcionar al menos un 'eventoId' o una 'cadenaId'."
});
