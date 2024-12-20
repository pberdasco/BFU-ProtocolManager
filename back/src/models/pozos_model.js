export default class Pozo {
    id;               // int
    subproyectoId;    // int (FK)
    nombre;           // string(20)
    estado;           // int
    tipo;             // int


    constructor(row) {
        this.id = row.id;
        this.subproyectoId = row.subproyectoId;
        this.nombre = row.nombre;
        this.estado = row.estado;
        this.tipo = row.tipo;
    }

    toJson() {
        return {
            id: this.id,
            subproyectoId: this.subproyectoId,
            nombre: this.nombre,
            estado: this.estado,
            tipo: this.tipo,
        };
    }
}
