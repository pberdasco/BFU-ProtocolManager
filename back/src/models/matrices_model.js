export default class Matriz {
    id; // int
    codigo; // int
    nombre; // string(20)

    constructor (row) {
        this.id = row.id;
        this.codigo = row.codigo;
        this.nombre = row.nombre;
    }

    toJson () {
        return {
            id: this.id,
            codigo: this.codigo,
            nombre: this.nombre
        };
    }
}
