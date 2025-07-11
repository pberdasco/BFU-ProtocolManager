export default class Lq {
    id; // int
    laboratorioId; // int (FK)
    compuestoId; // int (FK)
    metodoId;
    umId;
    valorLQ; // decimal (8,5)
    matrizId;
    matriz; // string

    constructor (row) {
        this.id = row.id;
        this.laboratorioId = row.laboratorioId;
        this.compuestoId = row.compuestoId;
        this.metodoId = row.metodoId;
        this.umId = row.umId;
        this.valorLQ = row.valorLQ;
        this.matrizId = row.matrizId;
        this.matriz = row.matriz;
    }

    toJson () {
        return {
            id: this.id,
            laboratorioId: this.laboratorioId,
            compuestoId: this.compuestoId,
            metodoId: this.metodoId,
            umId: this.umId,
            valorLQ: this.valorLQ,
            matrizId: this.matrizId,
            matriz: this.matriz
        };
    }
}
