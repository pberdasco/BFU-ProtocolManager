// cadenasSubproyectoCompuesto_service.js
import { pool, dbErrorMsg } from '../database/db.js';

export default class CadenasSubproyectoCompuestoService {
    /**
     * Obtiene una matriz de valores por subproyecto, matriz y compuesto.
     * Las filas representan fechas de eventos de muestreo, y las columnas son los pozos.
     *
     * @param {number} subproyectoId - ID del subproyecto.
     * @param {number} matrizCodigo - Código de la matriz (ej: 'AGUA').
     * @param {number} compuestoId - ID del compuesto seleccionado.
     * @returns {Object[]} - Array de objetos donde cada fila representa una fecha de evento con valores por pozo.
     */
    static async getCadenasPorSubproyectoCompuesto (subproyectoId, matrizCodigo, compuestoId) {
        console.log('Entro: ', subproyectoId, matrizCodigo, compuestoId);

        try {
            // Obtener todas las cadenas del subproyecto y matriz
            const [cadenas] = await pool.query(
                `SELECT cc.id AS cadenaId, cc.EventoMuestreoId, em.fecha
                 FROM CadenaCustodia cc
                 JOIN EventoMuestreo em ON cc.EventoMuestreoId = em.id
                 WHERE cc.subproyectoId = ? AND cc.matrizCodigo = ?
                 ORDER BY em.fecha`,
                [subproyectoId, matrizCodigo]
            );

            if (!cadenas.length) {
                throw dbErrorMsg(404, 'No se encontraron cadenas para el subproyecto y matriz indicados.');
            }
            console.log('cadenas:', cadenas.map(c => ({ id: c.cadenaId, fecha: c.fecha })));

            const cadenaIds = cadenas.map(c => c.cadenaId);

            // Obtener las filas que coinciden con el compuesto solicitado
            const [filas] = await pool.query(
                `SELECT f.id, f.cadenaCustodiaId, f.metodoId
                 FROM CadenaCompletaFilas f
                 WHERE f.cadenaCustodiaId IN (?) AND f.compuestoId = ?`,
                [cadenaIds, compuestoId]
            );
            const filaIds = filas.map(f => f.id);

            if (!filas.length) {
                throw dbErrorMsg(404, 'No se encontraron registros del compuesto en las cadenas seleccionadas.');
            }

            console.log('filas:', filas);

            // Obtener los valores de esas filas
            const [valores] = await pool.query(
                `SELECT v.cadenaCompletaFilaId, v.valor, m.Nombre AS muestra, m.PozoId, m.CadenaCustodiaId
                 FROM CadenaCompletaValores v
                 JOIN Muestras m ON v.muestraId = m.Id 
                 WHERE v.cadenaCompletaFilaId IN (?)`,
                [filaIds]
            );

            console.log('valores:', valores);
            //

            const resultado = [];

            for (const val of valores) {
                const fila = filas.find(f => f.id === val.cadenaCompletaFilaId);
                const cadena = cadenas.find(c => c.cadenaId === fila.cadenaCustodiaId);
                const fecha = typeof cadena.fecha === 'string' ? cadena.fecha : cadena.fecha.toISOString().split('T')[0];

                if (val.PozoId) {
                    resultado.push({
                        fecha,
                        pozoId: val.PozoId,
                        valor: val.valor !== null ? Number(val.valor) : null
                    });
                }
            }

            return resultado;
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }
}
