import { subproyectoCreateSchema, subproyectoUpdateSchema } from './subproyectos_schema.js';
import { z } from 'zod';

export const proyectoCreateSchema = z.object({
  codigo: z.string().max(10, 'El codigo no puede superar los 10 caracteres'),
  nombre: z.string().max(45),
  clienteId: z.number().int().positive(),
  estadoCodigo: z.number().int().positive()
});

export const proyectoUpdateSchema = proyectoCreateSchema.partial();

export const proyectoCreateExtendedSchema = proyectoCreateSchema.extend({
  subproyectos: z.array(subproyectoCreateSchema).optional()
});

export const proyectoUpdateExtendedSchema = proyectoUpdateSchema.extend({
  subproyectos: z.array(subproyectoUpdateSchema).optional()
});
