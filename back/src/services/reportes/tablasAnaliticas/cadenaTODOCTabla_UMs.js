/**
 * Determina la unidad de medida correcta para una fila según las reglas:
 * - Si hay NivelGuia válido, usar su UM
 * - Si no, usar la UM de las mediciones
 * @param {Object} fila - Fila actual de datos
 * @param {Object} nivelGuia - Objeto de nivel guía si existe para este compuesto/matriz
 * @param {Array} UMs - Lista de unidades de medida disponibles
 * @returns {Object} Objeto con la UM a usar y su ID
 */
export function determinarUMFila (fila, nivelGuia, UMs) {
    // Si hay nivel guía válido (no es nulo ni negativo), usar su UM  //10/6/2025 cambio esta definicion
    // if (nivelGuia && nivelGuia.valorReferencia &&
    //     !['NL', '-1', '-2', '-3'].includes(String(nivelGuia.valorReferencia))) {
    //     const umNG = UMs.data.find(um => um.id === nivelGuia.umId);
    //     if (umNG) {
    //         return {
    //             umId: nivelGuia.umId,
    //             umNombre: umNG.nombre
    //         };
    //     }
    // }

    // Si no hay nivel guía válido o no se encontró su UM, usar la UM de la fila (mediciones)
    const umFila = UMs.data.find(um => um.id === fila.umId);
    return {
        umId: fila.umId,
        umNombre: umFila?.nombre || '-'
    };
}

/**
 * Busca y aplica el factor de conversión entre dos unidades de medida
 * @param {number} valor - Valor a convertir
 * @param {number} desdeUMId - ID de la unidad de origen
 * @param {number} hastaUMId - ID de la unidad de destino
 * @param {Array} umConvert - Tabla de conversiones entre unidades
 * @param {Array} conversionesFallidas - Array para registrar conversiones fallidas
 * @returns {number|string} Valor convertido o el valor original si no se necesita conversión
 */
export function convertirValor (valor, desdeUMId, hastaUMId, umConvert, conversionesFallidas) {
    // Si las unidades son iguales o el valor no es un número, no necesita conversión
    if (desdeUMId === hastaUMId ||
        valor === null ||
        valor === undefined ||
        isNaN(Number(valor)) ||
        ['NC', 'ND', 'NA', '-1', '-2', '-3'].includes(String(valor))) {
        return valor;
    }

    // Buscar la conversión en la tabla
    const conversion = umConvert.find(
        c => c.desdeUMId === desdeUMId && c.hastaUMId === hastaUMId
    );

    // Si no hay conversión, intentar la inversa
    if (!conversion) {
        const conversionInversa = umConvert.find(
            c => c.desdeUMId === hastaUMId && c.hastaUMId === desdeUMId
        );

        if (conversionInversa) {
            // Usar el factor inverso (1/factor)
            return Number(valor) / conversionInversa.factor;
        } else {
            // Registrar la conversión fallida
            const yaRegistrada = conversionesFallidas.some(
                cf => cf.desde === desdeUMId && cf.hasta === hastaUMId
            );

            if (!yaRegistrada) {
                conversionesFallidas.push({
                    desde: desdeUMId,
                    hasta: hastaUMId
                });
            }

            // Devolver el valor original y confiar en que el error se manejará después
            return valor;
        }
    }

    // Aplicar el factor de conversión
    return Number(valor) * conversion.factor;
}

/**
 * Formatea el valor para mostrarlo en la tabla
 * @param {number|string} valor - Valor a formatear
 * @returns {string} Valor formateado
 */
export function formatearValor (valor) {
    if (valor === null || valor === undefined) return 'NA';
    if (valor === -1) return 'NC';
    if (valor === -2) return 'ND';
    if (valor === -3) return 'NA';

    // Si es un número, formatearlo con 3 decimales
    if (!isNaN(Number(valor))) {
        return Number(valor).toFixed(3);
    }

    return String(valor);
}

/**
 * Comprueba si hay conversiones fallidas y genera un mensaje de error
 * @param {Array} conversionesFallidas - Lista de conversiones que no se pudieron realizar
 * @param {Array} UMs - Lista de unidades de medida para obtener nombres
 * @returns {string|null} Mensaje de error o null si no hay errores
 */
export function verificarConversionesFallidas (conversionesFallidas, UMs) {
    if (conversionesFallidas.length === 0) return null;

    const mensajes = conversionesFallidas.map(cf => {
        const umDesde = UMs.data.find(um => um.id === cf.desde)?.nombre || `UM ID ${cf.desde}`;
        const umHasta = UMs.data.find(um => um.id === cf.hasta)?.nombre || `UM ID ${cf.hasta}`;
        return `de ${umDesde} a ${umHasta}`;
    });

    return `No se pudieron realizar las siguientes conversiones: ${mensajes.join(', ')}. Verifique la tabla de conversiones de unidades.`;
}
