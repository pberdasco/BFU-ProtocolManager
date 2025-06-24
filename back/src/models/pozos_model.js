export default class Pozo {
    id; // int
    subproyectoId; // int (FK)
    nombre; // string(20)
    estadoId; // int
    tipoId; // int
    latitud; // decimal(9,6)
    longitud; // decimal(9,6)

    constructor (row) {
        this.id = row.id;
        this.subproyectoId = row.subproyectoId;
        this.nombre = row.nombre;
        this.estadoId = row.estadoId;
        this.estado = row.estado;
        this.tipoId = row.tipoId;
        this.tipo = row.tipo;
        this.latitud = row.latitud;
        this.longitud = row.longitud;
    }

    toJson () {
        return {
            id: this.id,
            subproyectoId: this.subproyectoId,
            nombre: this.nombre,
            estadoId: this.estadoId,
            estado: this.estado,
            tipoId: this.tipoId,
            tipo: this.tipo,
            latitud: this.latitud,
            longitud: this.longitud
        };
    }
}
