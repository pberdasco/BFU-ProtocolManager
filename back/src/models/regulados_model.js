export default class Regulado {
    id; // int
    autAplicacionId; // int (FK)
    autoridad; // string(45)
    fechaVigencia; // date
    compuestoId; // int (FK)
    compuesto; // string(45)
    norma; // string(45)
    valorReferencia; // decimal(12,5)
    matrizId;
    umId; // int (FK)
    um; // string(10)

    constructor (row) {
        this.id = row.id;
        this.autAplicacionId = row.autAplicacionId;
        this.autoridad = row.autoridad;
        this.fechaVigencia = row.fechaVigencia;
        this.compuestoId = row.compuestoId;
        this.compuesto = row.compuesto;
        this.norma = row.norma;
        this.valorReferencia = row.valorReferencia;
        this.matrizId = row.matrizId;
        this.umId = row.umId;
        this.um = row.um;
    }

    toJson () {
        return {
            id: this.id,
            autAplicacionId: this.autAplicacionId,
            autoridad: this.autoridad,
            fechaVigencia: this.fechaVigencia,
            compuestoId: this.compuestoId,
            compuesto: this.compuesto,
            norma: this.norma,
            valorReferencia: this.valorReferencia,
            matrizId: this.matrizId,
            umId: this.umId,
            um: this.um
        };
    }
}
