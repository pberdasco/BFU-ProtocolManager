export default class Protocolo {
    id;               // int
    numero;           // string(10)
    fecha;            // date
    laboratorioId;    // int (FK) 
    
    constructor(row) {
        this.id = row.id;
        this.numero = row.numero;
        this.fecha = row.fecha;
        this.laboratorioId = row.laboratorioId;
    }

    toJson() {
        return {
            id: this.id,
            numero: this.numero,
            fecha: this.fecha,
            laboratorioId: this.laboratorioId,            
        };
    }
}
