export default class GrupoCompuesto{
    id;          // int
    nombre;      // string(45)
    matrizCodigo;  // int
    matriz;        // string(30)


    constructor(row){
        this.id = row.id;
        this.nombre = row.nombre;
        this.matrizCodigo = row.matrizCodigo;
        this.matriz = row.matriz;
    }

    toJson() {
        return {
            id: this.id,               
            nombre: this.nombre,
            matrizCodigo: this.matrizCodigo,
            matriz: this.matriz,
        };
    }
}