export default class Regulacion {
    id;                  // int
    nombre;              // string(45)
    laboratorioId;       // int (FK)
    eventoMuestreoId;    // int (FK)
    fecha;               // date
    laboratorio;         // string(45)
        
    constructor(row) {
        this.id = row.id;
        this.laboratorioId = row.laboratorioId;
        this.eventoMuestreoId = row.eventoMuestreoId;
        this.nombre = row.nombre;
        this.fecha = row.fecha;
        this.laboratorio = row.laboratorio;
              
    }

    toJson() {
        return {
            id: this.id,
            laboratorioId: this.laboratorioId,
            eventoMuestreoId: this.eventoMuestreoId,
            nombre: this.nombre,
            fecha: this.fecha,
            laboratorio: this.laboratorio,                 
        };
    }
}
