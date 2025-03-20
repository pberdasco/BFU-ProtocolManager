export default class Muestra {
    id; // int
    pozoId; // int (FK)
    cadenaCustodiaId; // int (FK)
    nombre; // string(45)
    tipo; // int (1,2,3)
    nivelFreatico; // decimal(8,3)
    profundidad; // decimal(8,3)
    flna; // decimal(8,3)
    cadenaOPDS; // string(10)
    protocoloOPDS; // string(10)

    constructor (row) {
        this.id = row.id;
        this.pozoId = row.pozoId;
        this.cadenaCustodiaId = row.cadenaCustodiaId;
        this.nombre = row.nombre;
        this.tipo = row.tipo;
        this.nivelFreatico = parseFloat(row.nivelFreatico);
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
            nombre: this.nombre,
            tipo: this.tipo,
            nivelFreatico: this.nivelFreatico,
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
