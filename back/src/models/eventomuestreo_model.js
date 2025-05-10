export default class Eventomuestreo {
    id; // int
    fecha; // date
    subproyectoId; // int (FK)
    subproyecto; // string(10)
    nombre; // string(45)
    soloMuestras; // tiniInt(0/1) - pero hasta la api se maneja como boolean
    cadenasCustodiaPDFLink; // string(60)

    constructor (row) {
        this.id = row.id;
        this.fecha = row.fecha;
        this.subproyectoId = row.subproyectoId;
        this.subproyecto = row.subproyecto;
        this.nombre = row.nombre;
        this.soloMuestras = !!row.soloMuestras;
        this.cadenasCustodiaPDFLink = row.cadenasCustodiaPDFLink;
    }

    toJson () {
        return {
            id: this.id,
            fecha: this.fecha,
            subproyectoId: this.subproyectoId,
            subproyecto: this.subproyecto,
            nombre: this.nombre,
            soloMuestras: this.soloMuestras,
            cadenasCustodiaPDFLink: this.cadenasCustodiaPDFLink
        };
    }

    static fromRows (rows) {
        return rows.map(row => new Eventomuestreo(row));
    }
}
