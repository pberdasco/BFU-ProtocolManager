export default class Regulacion {
    id;               // int
    pozoId;           // int (FK)
    eventoMuestreoId; // int (FK)
    nombre;           // string(45)
    tipo;             // int
    cantViales;       // int
    cantBotellas05;   // int
    cantBotellas1;    // int
    cantBotellas2;    // int
        
    constructor(row) {
        this.id = row.id;
        this.pozoId = row.pozoId;
        this.eventoMuestreoId = row.eventoMuestreoId;
        this.nombre = row.nombre;
        this.tipo = row.tipo;
        this.cantViales = row.cantViales;
        this.cantBotellas05 = row.cantBotellas05;
        this.cantBotellas1 = row.cantBotellas1;
        this.cantBotellas2 = row.cantBotellas2;              
    }

    toJson() {
        return {
            id: this.id,
            pozoId: this.pozoId,
            eventoMuestreoId: this.eventoMuestreoId,
            nombre: this.nombre,
            tipo: this.tipo,
            cantViales: this.cantViales,
            cantBotellas05: this.cantBotellas05,
            cantBotellas1: this.cantBotellas1,
            cantBotellas2: this.cantBotellas2,                       
        };
    }
}
