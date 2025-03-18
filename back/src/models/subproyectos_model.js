export default class Subproyecto {
    id; // int
    proyectoId; // int (FK)
    codigo; // string(10)
    nombreLocacion; // string(45)
    ubicacion; // string(45)
    apies; // string(10)
    objetivo; // string(45)
    notas; // string(60)
    cantPozos; // int (calculado)
    autAplicacionAguaId; // int (FK)
    autAplicacionSueloId; // int (FK)
    autAplicacionGasesId; // int (FK)
    autAplicacionFLNAId; // int (FK)

    constructor (row) {
        this.id = row.id;
        this.proyectoId = row.proyectoId;
        this.codigo = row.codigo;
        this.nombreLocacion = row.nombreLocacion;
        this.ubicacion = row.ubicacion;
        this.apies = row.apies;
        this.objetivo = row.objetivo;
        this.notas = row.notas;
        this.cantPozos = row.cantPozos;
        this.autAplicacionAguaId = row.autAplicacionAguaId;
        this.autAplicacionSueloId = row.autAplicacionSueloId;
        this.autAplicacionGasesId = row.autAplicacionGasesId;
        this.autAplicacionFLNAId = row.autAplicacionFLNAId;
    }

    toJson () {
        return {
            id: this.id,
            proyectoId: this.proyectoId,
            codigo: this.codigo,
            nombreLocacion: this.nombreLocacion,
            ubicacion: this.ubicacion,
            apies: this.apies,
            objetivo: this.objetivo,
            notas: this.notas,
            cantPozos: this.cantPozos,
            autAplicacionAguaId: this.autAplicacionAguaId,
            autAplicacionSueloId: this.autAplicacionSueloId,
            autAplicacionGasesId: this.autAplicacionGasesId,
            autAplicacionFLNAId: this.autAplicacionFLNAId
        };
    }
}
