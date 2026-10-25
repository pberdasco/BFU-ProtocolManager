import { ZodError } from 'zod';

/**
 * Valida y filtra datos sin acoplar la validación a una respuesta HTTP.
 * @returns {[Array<{field: string, message: string}>, object|null]}
 */
export function bodyValidations (data, schema) {
    try {
        return [[], schema.parse(data)];
    } catch (error) {
        if (!(error instanceof ZodError)) throw error;
        const errors = error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
        }));
        return [errors, null];
    }
}
