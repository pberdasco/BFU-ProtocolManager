export default class laboratorio {
    id; // int
    nombre; // string(45)
    domicilio; // string(60)
    formato; // string(10)

    constructor (row) {
        this.id = row.id;
        this.nombre = row.nombre;
        this.domicilio = row.domicilio;
        this.formato = row.formato;
    }

    toJson () {
        return {
            id: this.id,
            nombre: this.nombre,
            domicilio: this.domicilio,
            formato: this.formato
        };
    }
}
