export class ProyectoExtended {
    id; // int
    codigo; // string(10)
    nombre; // string(45)
    empresa; // string(45)
    subproyectos; // array de subproyectos

    constructor (row) {
        this.id = row.id;
        this.codigo = row.codigo;
        this.nombre = row.nombre;
        this.empresa = row.empresa;
        this.subproyectos = row.subproyectos;
    }

    toJson () {
        return {
            id: this.id,
            codigo: this.codigo,
            nombre: this.nombre,
            empresa: this.empresa,
            subproyectos: this.subproyectos
        };
    }

    static fromRow (row) {
        return new ProyectoExtended(row);
    }

    static fromRows (rows) {
        return rows.map(row => ProyectoExtended.fromRow(row));
    }
}
