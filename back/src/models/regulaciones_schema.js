import { z } from "zod";

export const regulacionCreateSchema = z.object({
    autAplicacionId: z.number().int().min(1, "El ID de la autoridad de aplcación debe ser válido"),
    fechaVigencia: z.string ().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "La fecha de la autoridad de aplicación debe tener el formato YYYY-MM-DD"
    )
    .refine((val) => !isNaN(Date.parse(val)), {
        message: "La fecha de la autoridad de aplicación no es válida",
    }),
    compuestoId: z.number().int().min(1, "El ID del compuesto debe ser válido"), 
    norma: z.string().max(45, "La norma no puede superar los 45 caracteres"),
    valorReferencia: z.number().refine((val) => val == -1 || (val>= 0 && val <= 999.99999), {
        message: "El valor de referencia debe ser -1 o entre 0 y 999.99999",
    }),
});

export const regulacionUpdateSchema = regulacionCreateSchema.partial();


/* autAplicacionFecha: z
.string()
.regex(
    /^\d{2}\/\d{2}\/\d{4}$/,
    "La fecha de la autoridad de aplicación debe tener el formato DD/MM/AAAA"
)
.refine((val) => {
    const [day, month, year] = val.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}, {
    message: "La fecha de la autoridad de aplicación no es válida",
}),
*/

