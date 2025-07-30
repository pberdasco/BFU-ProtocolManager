export default class Muestra {
    id; // int
    pozoId; // int (FK)
    cadenaCustodiaId; // int (FK)
    nombreBase; // string(16)
    nombreIndex; // int
    nombre; // string(20)  - Se arma con nombreBase + "-" + nombreIndex
    tipo; // int (1,2,3)
    nivelFreatico; // decimal(6,3)
    nivelFLNA; // decimal(6,3)
    flna; // decimal(6,3)
    profundidad; // decimal(6,3)
    cadenaOPDS; // string(10)
    protocoloOPDS; // string(10)

    constructor (row) {
        this.id = row.id;
        this.pozoId = row.pozoId;
        this.cadenaCustodiaId = row.cadenaCustodiaId;
        this.nombreBase = row.nombreBase;
        this.nombreIndex = row.nombreIndex;
        this.nombre = row.nombre;
        this.tipo = row.tipo;
        this.nivelFreatico = parseFloat(row.nivelFreatico);
        this.nivelFLNA = parseFloat(row.nivelFLNA);
        this.profundidad = parseFloat(row.profundidad);
        this.flna = parseFloat(row.flna);
        this.cadenaOPDS = row.cadenaOPDS;
        this.protocoloOPDS = row.protocoloOPDS;
    }

    toJson () {
        return {
            id: this.id,
            pozoId: this.pozoId,
            cadenaCustodiaId: this.cadenaCustodiaId,
            nombreBase: this.nombreBase,
            nombreIndex: this.nombreIndex,
            nombre: this.nombre,
            tipo: this.tipo,
            nivelFreatico: this.nivelFreatico,
            nivelFLNA: this.nivelFLNA,
            profundidad: this.profundidad,
            flna: this.flna,
            cadenaOPDS: this.cadenaOPDS,
            protocoloOPDS: this.protocoloOPDS
        };
    }

    static fromRows (rows) {
        return rows.map(row => new Muestra(row));
    }
}
