import { z } from 'zod';
import { dateSchema } from './utils/dateSchema.js';

export const cadenasCustodiaCreateSchema = z.object({
    nombre: z.string().max(45, 'El nombre no puede superar los 45 caracteres'),
    laboratorioId: z.number().int().min(1, 'El ID del laboratorio debe ser un entero positivo'),
    eventoMuestreoId: z.number().int().min(1, 'El ID del evento de muestreo debe ser un entero positivo'),
    subproyectoId: z.number().int().min(1, 'El ID del subproyecto debe ser un entero positivo'),
    matrizCodigo: z.number().int().min(1, 'El Codigo de la Matriz debe ser un entero positivo'),
    fecha: dateSchema
});

export const cadenasCustodiaUpdateSchema = cadenasCustodiaCreateSchema.partial();
