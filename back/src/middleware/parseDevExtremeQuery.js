import logger from '../utils/logger.js';
/**
 * Factoria de parseDevExtremeQuery
 * @param {Array} allowedFields 
 * @returns {Function} parseDevExtremeQuery() - middleware
 */
export function createParseDevExtremeQuery(allowedFields) {
    /**
     * Middleware para parsear los parámetros de filtro, orden y paginación 
     * enviados por DevExtreme en una solicitud HTTP.
     * Transforma estos parámetros en estructuras utilizables por el backend
     * para generar consultas SQL seguras.
     *
     * Agrega al objeto `req` la propiedad `devExtremeQuery` con el siguiente formato:
     * req.devExtremeQuery = { where, values, order, limit, offset }
     * 
     * @param {Request} req - Objeto de solicitud HTTP de Express.
     * @param {Response} res - Objeto de respuesta HTTP de Express.
     * @param {Function} next - Función para pasar al siguiente middleware.
     */
    return function parseDevExtremeQuery(req, res, next) {
        const { $filter: filter, $sort: sort, $skip: skip, $take: take } = req.query;
        if (filter || sort || skip){
            logger.info(`$filter: ${filter}  $sort: ${sort}   $skip/take: ${skip}/${take}`);
        }

        let where = "";
        let values = [];
        if (filter) {
            try {
                const parsedFilter = JSON.parse(filter); // DevExtreme envía filtros como JSON string
                const result = parseFilter(parsedFilter, allowedFields);
                where = result.where;
                values = result.values;
            } catch (error) {
                logger.error(error);
                return res.status(400).send({ error: "Invalid filter format" });
            }
        }

        // Orden
        let order = [];
        if (sort) {
            try {
                const sortArray = JSON.parse(sort);
                order = sortArray
                    .filter((s) => allowedFields.includes(s.selector)) // Ignorar campos no permitidos
                    .map((s) => `${s.selector} ${s.desc ? "DESC" : "ASC"}`);
            } catch (error) {
                logger.error(error);
                return res.status(400).send({ error: "Invalid sort format" });
            }
        }

        // Paginación
        const limit = parseInt(take) || 50;
        const offset = parseInt(skip) || 0;

        req.devExtremeQuery = { where, values, order, limit, offset };
        next();
    };
}

/**
 * Convierte el filtro enviado por DevExtreme DataGrid en un objeto que 
 * contiene una cláusula SQL `WHERE` y los valores asociados.
 *
 * @param {Array} filter - Filtro enviado por DevExtreme en formato JSON.
 * @param {Array} allowedFields - Lista de campos permitidos para esta entidad.
 * @returns {{ where: string, values: Array }} Objeto con la cláusula SQL y los valores.
 */
function parseFilter(filter, allowedFields) {
    const { where, values } = parseFilterRecursive(filter, allowedFields);
    return { where, values };
}

function parseFilterRecursive(filt, allowedFields) {
    let where = "";
    let values = [];

    if (Array.isArray(filt)) {
        // Caso 1: Filtro simple de la forma ["Campo","Operador","Valor"]
        if (filt.length === 3 && typeof filt[0] === 'string') {
            const [field, operator, value] = filt;
            const { where: w, values: v } = processCondition(field, operator, value, allowedFields);
            where += w;
            values.push(...v);
            return { where, values };
        } else {
            // Caso 2: Filtro compuesto: puede tener subarrays y operadores lógicos
            where += "(";
            for (let i = 0; i < filt.length; i++) {
                const element = filt[i];
                if (Array.isArray(element)) {
                    const { where: w, values: v } = parseFilterRecursive(element, allowedFields);
                    where += w;
                    values.push(...v);
                } else if (element === "and" || element === "or") {
                    where += ` ${element.toUpperCase()} `;
                } else {
                    logger.error(`Unsupported filter format: ${JSON.stringify(element)}`);
                    throw new Error(`Unsupported filter format: ${JSON.stringify(element)}`);
                }
            }
            where += ")";
            return { where, values };
        }
    } else {
        logger.error(`Unsupported filter format: ${JSON.stringify(filt)}`);
        throw new Error(`Unsupported filter format: ${JSON.stringify(filt)}`);
    }
}

function processCondition(field, operator, value, allowedFields) {
    if (!allowedFields.includes(field)) {
        // Campo no permitido, no lanzar error fatídico, pero devolver vacío
        logger.warn(`Campo no permitido: ${field}`);
        return { where: "1=0", values: [] }; 
        // Esto forza a que no devuelva resultados si el campo no es permitido.
    }

    let w = "";
    const v = [];
    switch (operator) {
        case "contains":
            w = `${field} LIKE ?`;
            v.push(`%${value}%`);
            break;
        case "startswith":
            w = `${field} LIKE ?`;
            v.push(`${value}%`);
            break;
        case "endswith":
            w = `${field} LIKE ?`;
            v.push(`%${value}`);
            break;
        case "=":
            w = `${field} = ?`;
            v.push(value);
            break;
        case "!=":
            w = `${field} != ?`;
            v.push(value);
            break;
        case ">":
        case "<":
        case ">=":
        case "<=":
            w = `${field} ${operator} ?`;
            v.push(value);
            break;
        default:
            logger.error(`Unsupported operator: ${operator}`);
            throw new Error(`Unsupported operator: ${operator}`);
    }
    return { where: w, values: v };
}