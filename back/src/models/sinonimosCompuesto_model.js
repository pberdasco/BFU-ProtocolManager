export default class SinonimoCompuesto {
    id;               // int
    textoLab;         // string(60)
    textoProcesado;   // string(60)
    compuestoId;      // int (FK)
    compuesto;        // string(45)
        
    constructor(row) {
        this.id = row.id;
        this.textoLab = row.textoLab;
        this.textoProcesado = row.textoProcesado;
        this.compuestoId = row.compuestoId;
        this.compuesto = this.compuesto;
              
    }

    toJson() {
        return {
            id: this.id,
            textoLab: this.textoLab,
            textoProcesado: this.textoProcesado,
            compuestoId: this.compuestoId,
            compuesto: this.compuesto,                 
        };
    }

    static fromRows(rows) {
        return rows.map(row => new SinonimoCompuesto(row));
    }
}
