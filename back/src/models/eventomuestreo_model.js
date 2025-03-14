export default class Eventomuestreo {
    id; // int
    fecha; // date
    subproyectoId; // int (FK)
    subproyecto; // string(10)
    nombre; // string(45)
    cadenasCustodiaPDFLink; // string(60)

    constructor (row) {
        this.id = row.id;
        this.fecha = row.fecha;
        this.subproyectoId = row.subproyectoId;
        this.subproyecto = row.subproyecto;
        this.nombre = row.nombre;
        this.cadenasCustodiaPDFLink = row.cadenasCustodiaPDFLink;
    }

    toJson () {
        return {
            id: this.id,
            fecha: this.fecha,
            subproyectoId: this.subproyectoId,
            subproyecto: this.subproyecto,
            nombre: this.nombre,
            cadenasCustodiaPDFLink: this.cadenasCustodiaPDFLink
        };
    }
}
