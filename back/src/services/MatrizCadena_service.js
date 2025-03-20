import { pool, dbErrorMsg } from '../database/db.js';

export default class MatrizCadenaService {
    /**
     * Obtiene la información necesaria para armar la matriz de una Cadena de Custodia o de todas las cadenas de un evento.
     * Devuelve la lista de compuestos requeridos y la lista de muestras asociadas.
     *
     * Si se especifica una cadena (`cadenaId`), se devuelve la información correspondiente a esa cadena.
     * Si no se especifica una cadena, se devuelve la información acumulada de todas las cadenas
     * asociadas al evento (`eventoId`). Esto es útil para generar un adelanto de protocolo
     * que incluya varias cadenas.
     *
     * @param {number|null} eventoId - ID del evento al que pertenecen las cadenas de custodia.
     *                                 Debe proporcionarse si no se informa un `cadenaId`.
     * @param {number|null} cadenaId - (Opcional) ID de una cadena de custodia específica.
     *                                 Si se proporciona, este será el parámetro prioritario, y se ignorará `eventoId`.
     * @returns {Object} - Un objeto con las listas de compuestos y muestras:
     *  {
     *    compuestos: {
     *      data: [
     *        {
     *          compuestoId: number,
     *          metodoId: number,
     *          compuesto: string,
     *          metodo: string,
     *          grupo: string,
     *          matrizCodigo: number
     *        }
     *      ],
     *      totalCount: number
     *    },
     *    muestras: {
     *      data: [
     *        {
     *          muestraId: number,
     *          cadenaCustodiaId,
     *          muestra: string,
     *          tipo: number,
     *          pozo: string
     *        }
     *      ],
     *      totalCount: number
     *    }
     *  }
     */
    static async get (eventoId, cadenaId) {
        try {
            const [compuestos, muestras] = await Promise.all([
                MatrizCadenaService.getCompuestos(eventoId, cadenaId),
                MatrizCadenaService.getMuestras(eventoId, cadenaId)
            ]);

            return {
                compuestos,
                muestras
            };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getCompuestos (eventoId, cadenaId) {
        const selectBase = MatrizCadenaService.getSelectCompuestos(cadenaId);
        let rows;
        try {
            if (cadenaId) { [rows] = await pool.query(selectBase, [cadenaId]); } else { [rows] = await pool.query(selectBase, [eventoId]); }

            return rows;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getMuestras (eventoId, cadenaId) {
        const selectBase = MatrizCadenaService.getSelectMuestras(cadenaId);
        let rows;
        try {
            if (cadenaId) {
                [rows] = await pool.query(selectBase, [cadenaId]);
            } else {
                [rows] = await pool.query(selectBase, [eventoId]);
            }

            return rows;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static getSelectCompuestos (cadenaId) {
        const compuestosListSQL = 'SELECT CC.id AS cadenaCustodiaId, AR.id as analisisRequeridoId, ' +
                    'CASE WHEN AR.tipo = 1 THEN RCG.compuestoId ELSE AR.compuestoId END AS compuestoId, ' +
                    'AR.metodoId AS metodoId, CASE WHEN AR.tipo = 1 THEN C.nombre ELSE C2.nombre END AS compuesto, ' +
                    'M.nombre AS metodo, CASE WHEN AR.tipo = 1 THEN G.nombre ELSE "" END AS grupo, CC.matrizCodigo AS matrizCodigo ' +
                    'FROM AnalisisRequeridos AR ' +
                    'LEFT JOIN relCompuestoGrupo RCG ON AR.tipo = 1 AND AR.grupoId = RCG.grupoId ' +
                    'LEFT JOIN Compuestos C ON RCG.compuestoId = C.id ' +
                    'LEFT JOIN Compuestos C2 ON AR.compuestoId = C2.id ' +
                    'LEFT JOIN GrupoCompuestos G ON AR.grupoId = G.id ' +
                    'LEFT JOIN Metodos M ON AR.metodoId = M.id ' +
                    'JOIN CadenaCustodia CC ON AR.cadenaCustodiaID = CC.id ';
        const whereCadena = 'WHERE AR.cadenaCustodiaID = ?';
        const whereEvento = 'WHERE CC.eventoMuestreoId = ?';

        return cadenaId ? compuestosListSQL + whereCadena : compuestosListSQL + whereEvento;
    }

    static getSelectMuestras (cadenaId) {
        const muestrasListCadenaSQL = 'SELECT M.id AS muestraId, M.cadenaCustodiaId, M.tipo, M.nombre AS muestra, M.pozoId AS pozo, ' +
                    'M.nivelFreatico, M.profundidad, M.flna, M.cadenaOPDS, M.protocoloOPDS ' +
                    'FROM Muestras M WHERE M.cadenaCustodiaId = ?';
        const muestrasListEventoSQL = 'SELECT M.id AS muestraId, M.cadenaCustodiaId, M.tipo, M.nombre AS muestra, M.pozoId AS pozo, ' +
                    'M.nivelFreatico, M.profundidad, M.flna, M.cadenaOPDS, M.protocoloOPDS ' +
                    'FROM Muestras M JOIN CadenaCustodia CC ON M.cadenaCustodiaId = CC.id WHERE CC.eventoMuestreoId = ?';

        return cadenaId ? muestrasListCadenaSQL : muestrasListEventoSQL;
    }
}
