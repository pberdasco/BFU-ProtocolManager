export default class SinonimoUm {
    id; // int
    textoLab; // string(60)
    textoProcesado; // string(60)
    umId; // int (FK)
    um; // string(10)

    constructor (row) {
        this.id = row.id;
        this.textoLab = row.textoLab;
        this.textoProcesado = row.textoProcesado;
        this.umId = row.umId;
        this.um = row.um;
    }

    toJson () {
        return {
            id: this.id,
            textoLab: this.textoLab,
            textoProcesado: this.textoProcesado,
            umId: this.umId,
            um: this.um
        };
    }

    static fromRows (rows) {
        return rows.map(row => new SinonimoUm(row));
    }
}
