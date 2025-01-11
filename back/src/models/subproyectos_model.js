export default class Subproyecto {
    id;               // int
    proyectoId;       // int (FK)
    autAplicacionId;  // int (FK)
    codigo;           // string(10)
    nombreLocacion;   // string(45)
    ubicacion;        // string(45)
    apies;            // string(10)
    objetivo;         // string(45)
    notas;            // string(60)
    cantPozos         // int (calculado)


    constructor(row) {
        this.id = row.id;
        this.proyectoId = row.proyectoId;
        this.autAplicacionId = row.autAplicacionId;
        this.codigo = row.codigo;
        this.nombreLocacion = row.nombreLocacion;
        this.ubicacion = row.ubicacion;
        this.apies = row.apies;
        this.objetivo = row.objetivo;
        this.notas = row.notas;
        this.cantPozos = row.cantPozos;
    }

    toJson() {
        return {
            id: this.id,
            proyectoId: this.proyectoId,
            autAplicacionId: this.autAplicacionId,
            codigo: this.codigo,
            nombreLocacion: this.nombreLocacion,
            ubicacion: this.ubicacion,
            apies: this.apies,
            objetivo: this.objetivo,
            notas: this.notas,
            cantPozos: this.cantPozos
        };
    }
}
