import { z } from "zod";

export const cadenasCustodiaCreateSchema = z.object({
    nombre: z.string().max(45, "El nombre no puede superar los 45 caracteres"),
    laboratorioId: z.number().int().min(1, "El ID del laboratorio debe ser un entero positivo"),
    eventoMuestreoId: z.number().int().min(1, "El ID del evento de muestreo debe ser un entero positivo"),
    subproyectoId: z.number().int().min(1, "El ID del subproyecto debe ser un entero positivo"),
    matrizCodigo: z.number().int().min(1, "El Codigo de la Matriz debe ser un entero positivo"),
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
            "La fecha debe estar en formato YYYY-MM-DD o ISO 8601 completo"
        )
    ).refine((val) => !isNaN(Date.parse(val)), {
        message: "La fecha de la cadena de muestreo no es válida",
    }),
});

export const cadenasCustodiaUpdateSchema = cadenasCustodiaCreateSchema.partial();

