export default class GrupoCompuesto {
    id; // int
    nombre; // string(45)
    metodoId; // int
    metodo; // string(45)  // de un join
    matrizCodigo; // int
    matriz; // string(30)  // de un join

    constructor (row) {
        this.id = row.id;
        this.nombre = row.nombre;
        this.matrizCodigo = row.matrizCodigo;
        this.matriz = row.matriz;
        this.metodoId = row.metodoId;
        this.metodo = row.metodo;
    }

    toJson () {
        return {
            id: this.id,
            nombre: this.nombre,
            matrizCodigo: this.matrizCodigo,
            matriz: this.matriz,
            metodoId: this.metodoId,
            metodo: this.metodo
        };
    }
}
