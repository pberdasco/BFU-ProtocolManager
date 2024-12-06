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
        const { filter, sort, skip, take } = req.query;

        let where = "";
        let values = [];
        if (filter) {
            try {
                const parsedFilter = JSON.parse(filter); // DevExtreme envía filtros como JSON string
                const result = parseFilter(parsedFilter, allowedFields);
                where = result.where;
                values = result.values;
            } catch (error) {
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
const parseFilter = (filter, allowedFields) => {
    let where = "";
    let values = [];

    const buildCondition = (filter) => {
        if (Array.isArray(filter)) {
            const [field, operator, value] = filter;

            // Validar si el campo está permitido
            if (!allowedFields.includes(field)) {
                return; // Ignorar este filtro si no está permitido
            }

            switch (operator) {
                case "contains":
                    where += `${field} LIKE ?`;
                    values.push(`%${value}%`);
                    break;
                case "startswith":
                    where += `${field} LIKE ?`;
                    values.push(`${value}%`);
                    break;
                case "endswith":
                    where += `${field} LIKE ?`;
                    values.push(`%${value}`);
                    break;
                case "=":
                    where += `${field} = ?`;
                    values.push(value);
                    break;
                case "!=":
                    where += `${field} != ?`;
                    values.push(value);
                    break;
                case ">":
                case "<":
                case ">=":
                case "<=":
                    where += `${field} ${operator} ?`;
                    values.push(value);
                    break;
                default:
                    throw new Error(`Unsupported operator: ${operator}`);
            }
        } else if (filter === "and" || filter === "or") {
            where += ` ${filter.toUpperCase()} `;
        } else {
            throw new Error(`Unsupported filter format: ${filter}`);
        }
    };

    const parseRecursive = (filter) => {
        where += "(";
        filter.forEach((f, index) => {
            if (Array.isArray(f)) {
                parseRecursive(f); // Subfiltros
            } else {
                buildCondition(f); // Condición simple o lógica
            }
            if (index < filter.length - 1) where += " ";
        });
        where += ")";
    };

    parseRecursive(filter);

    return { where, values };
};

