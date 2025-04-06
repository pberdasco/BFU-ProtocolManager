import { z } from 'zod';

// Schema para cada muestra
const muestraSchema = z.object({
    muestraId: z.number().int().positive(),
    muestra: z.string().min(1).max(255),
    tipo: z.number().int().positive(),
    pozo: z.number().nullable(),
    nivelFreatico: z.string().min(1).max(10),
    profundidad: z.string().nullable(),
    flna: z.string().nullable(),
    cadenaOPDS: z.string().nullable(),
    protocoloOPDS: z.string().nullable(),
    matriz: z.number().int().positive(),
    cadenaCustodiaId: z.number().int().positive(),
    laboratorioId: z.number().int().positive()
});

// Schema para cada fila
const filaSchema = z.object({
    id: z.number().int().positive(),
    cadenaCustodiaId: z.number().int().positive(),
    compuestoId: z.number().int().positive(),
    metodoId: z.number().int().positive(),
    umId: z.number().int().positive(),
    estado: z.number(),
    protocoloItemId: z.number().int().positive().nullable(),
    codigo: z.string().min(1)
})
    .catchall(z.number()); // Cualquier otra propiedad (los valores asociados a cada muestra) deben ser números

// Schema para cada compuesto
const compuestoSchema = z.object({
    id: z.number().int().positive(),
    nombre: z.string().min(1)
});

// Schema para cada nivel de guía
const nivelGuiaSchema = z.object({
    compuestoId: z.number().int().positive(),
    valorReferencia: z.string().min(1),
    um: z.string().min(1),
    matrizId: z.number().int().positive()
});

// Schema para cada laboratorio
const laboratorioSchema = z.object({
    id: z.number().int().positive(),
    nombre: z.string().min(1)
});

// Schema para la propiedad "data"
const dataSchema = z.object({
    muestras: z.array(muestraSchema).nonempty('Debe haber al menos una muestra'),
    filas: z.array(filaSchema).nonempty('Debe haber al menos una fila'),
    compuestos: z.array(compuestoSchema).nonempty('Debe haber al menos un compuesto'),
    nivelesGuia: z.array(nivelGuiaSchema).nonempty('Debe haber al menos un nivel de guía'),
    laboratorios: z.array(laboratorioSchema).nonempty('Debe haber al menos un laboratorio')
});

// Schema completo para el endpoint
export const cadenaToDOCTablaSchema = z.object({
    proyecto: z.string().min(1),
    fecha: z.string().datetime(), // Se asume que es una fecha en formato ISO
    data: dataSchema
});
