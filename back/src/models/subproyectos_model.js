export default class Subproyecto {
    id;               // int
    proyectoId;       // int (FK)
    autAplicacionId;  // int (FK)
    codigo;           // string(10)
    nombreLocacion;   // string(45)
    ubicacion;        // string(45)

    constructor(row) {
        this.id = row.id;
        this.proyectoId = row.proyectoId;
        this.autAplicacionId = row.autAplicacionId;
        this.codigo = row.codigo;
        this.nombreLocacion = row.nombreLocacion;
        this.ubicacion = row.ubicacion;
    }

    toJson() {
        return {
            id: this.id,
            proyectoId: this.proyectoId,
            autAplicacionId: this.autAplicacionId,
            codigo: this.codigo,
            nombreLocacion: this.nombreLocacion,
            ubicacion: this.ubicacion,
        };
    }
}
