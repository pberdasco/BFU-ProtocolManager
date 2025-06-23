import { z } from 'zod';

// Esquema para cada muestra
const muestraSchema = z.object({
    id: z.number().int().positive().optional(),
    nombre: z.string().min(1).max(255),
    pozo: z.string().nullable().optional(),
    tipo: z.number().int().positive().optional(),
    nivelFreatico: z.string().min(1).max(10).optional() // Se mantiene como string ya que en tu JSON lo es
});

// Esquema para cada análisis
const analisisSchema = z.object({
    id: z.number().int().positive().optional(),
    tipo: z.number().int().positive(),
    grupo: z.string().nullable().optional(), // Es requerido solo si `tipo === 1`
    metodo: z.string().min(1).max(60),
    compuestoCodigo: z.string().nullable().optional(),
    compuestoNombre: z.string().nullable().optional() // Es requerido solo si `tipo !== 1`
}).refine(
    (data) => {
        if (data.tipo === 1) {
            return !!data.grupo; // Si `tipo` es 1, `grupo` debe existir
        } else {
            return !!data.compuestoNombre; // Si `tipo` no es 1, `compuestoNombre deben existir
        }
    },
    {
        message: 'Si tipo === 1, grupo es obligatorio. Si tipo !== 1, compuestoCodigo y compuestoNombre son obligatorios.',
        path: ['grupo', 'compuestoCodigo', 'compuestoNombre']
    }
);

// Esquema para cada cadena
const cadenaSchema = z.object({
    id: z.number().int().positive().optional(),
    nombre: z.string().min(1).max(255),
    fecha: z.string().datetime().optional(), // Se valida como fecha en formato ISO
    matriz: z.string().min(1).max(255),
    cliente: z.string().min(1).max(255),
    proyecto: z.string().min(1).max(255),
    laboratorio: z.string().min(1).max(255),
    muestras: z.array(muestraSchema).default([]),
    analisis: z.array(analisisSchema).default([])
});

// Esquema para el cuerpo completo
export const bodyCadenaSchema = z.object({
    cadenas: z.array(cadenaSchema).nonempty('Debe haber al menos una cadena')
});
