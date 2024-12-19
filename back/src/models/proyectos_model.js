export default class Proyecto{
    id;          // int
    codigo;      // string(10)
    nombre;      // string(45)
    empresa;     // string(45)

    constructor(row){
        this.id = row.id;
        this.codigo = row.codigo;
        this.nombre = row.nombre;
        this.empresa = row.empresa;
    }

    toJson() {
        return {
            id: this.id,               
            codigo: this.codigo,
            nombre: this.nombre,
            empresa: this.empresa
        };
    }

    /**
     * Transforma una fila de base de datos en un objeto Proyecto bien conformado
     * @param {Object} row - Fila única de base de datos
     * @returns {Proyecto}
     */
    static extendedFromRow(row) {
        return new Proyecto({
            ...row,
            subproyectos: row.subproyectos ? JSON.parse(row.subproyectos) : [] // Parsear JSON si existe
        });
    }

    /**
     * Transforma múltiples filas de base de datos en una lista de Proyectos
     * @param {Array<Object>} rows - Conjunto de filas de base de datos
     * @returns {Array<Proyecto>}
     */
    static extendedFromRows(rows) {
        return rows.map(row => Proyecto.fromRow(row));
    }

}