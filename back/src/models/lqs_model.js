export default class Lq {
    id;               // int
    laboratorioId;    // int (FK)
    compuestoId;      // int (FK)
    valorLQ;          // decimal (8,5)
    

    constructor(row) {
        this.id = row.id;
        this.laboratorioId = row.laboratorioId;
        this.compuestoId = row.compuestoId;
        this.valorLQ = row.valorLQ;
    }

    toJson() {
        return {
            id: this.id,
            laboratorioId: this.laboratorioId,
            compuestoId: this.compuestoId,
            valorLQ: this.valorLQ,
        };
    }
}
