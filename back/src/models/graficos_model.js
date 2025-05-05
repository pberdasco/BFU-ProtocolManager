export default class Grafico {
    id;
    nombre;
    eje1;
    eje2;

    constructor (row) {
        this.id = row.id;
        this.nombre = row.nombre;
        this.eje1 = row.eje1;
        this.eje2 = row.eje2;
    }

    toJson () {
        return {
            id: this.id,
            nombre: this.nombre,
            eje1: this.eje1,
            eje2: this.eje2
        };
    }
}
