import { z } from 'zod';

export const grupoCompuestoCreateSchema = z.object({
  nombre: z.string().max(45),
  metodoId: z.number().int().positive(),
  matrizCodigo: z.number().int().positive()
});

export const grupoCompuestoUpdateSchema = grupoCompuestoCreateSchema.partial();
