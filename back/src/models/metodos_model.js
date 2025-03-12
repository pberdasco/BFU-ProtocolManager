export default class Metodo {
    id; // int
    nombre; // string(45)

    constructor (row) {
        this.id = row.id;
        this.nombre = row.nombre;
    }

    toJson () {
        return {
            id: this.id,
            nombre: this.nombre
        };
    }
}
