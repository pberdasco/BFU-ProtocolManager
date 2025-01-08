export default class Eventomuestreo {
    id;               // int
    fecha;            // date
    subproyectoId;    // int (FK)
    nombre;           // string(45)
    cadenaCustodiaLink;    // string(60)


    constructor(row) {
        this.id = row.id;
        this.fecha = row.fecha;
        this.subproyectoId = row.subproyectoId;
        this.nombre = row.nombre;
        this.cadenaCustodiaLink = row.cadenaCustodiaLink;
    }

    toJson() {
        return {
            id: this.id,
            fecha: this.fecha,
            subproyectoId: this.subproyectoId,
            nombre: this.nombre,
            cadenaCustodiaLink: this.cadenaCustodiaLink,
        };
    }
}
