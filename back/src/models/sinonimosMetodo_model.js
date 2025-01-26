export default class SinonimoMetodo {
    id;               // int
    textoLab;         // string(60)
    textoProcesado;   // string(60)
    metodoId;         // int (FK)
    metodo;           // string(45)
        
    constructor(row) {
        this.id = row.id;
        this.textoLab = row.textoLab;
        this.textoProcesado = row.textoProcesado;
        this.metodoId = row.metodoId;
        this.metodo = this.metodo;
              
    }

    toJson() {
        return {
            id: this.id,
            textoLab: this.textoLab,
            textoProcesado: this.textoProcesado,
            metodoId: this.metodoId,
            metodo: this.metodo,                 
        };
    }

    static fromRows(rows) {
        return rows.map(row => new SinonimoMetodo(row));
    }
}
