export default class compuesto{
    id;          // int
    nombre;      // string(45)
    sinonimo;    // string(45)
    funcion;     // int
    agrupaEn;    // int
    exponeId;      // int
    matrizCodigo;  // int
    matriz;        // string(30)

    constructor(row){
        this.id = row.id;
        this.nombre = row.nombre;
        this.sinonimo = row.sinonimo;
        this.funcion = row.funcion;
        this.agrupaEn = row.agrupaEn;
        this.exponeId = row.exponeId;
        this.matrizCodigo = row.matrizCodigo;
        this.matriz = row.matriz;
    }

    toJson() {
        return {
            id: this.id,               
            nombre: this.nombre,
            sinonimo: this.sinonimo,
            funcion: this.funcion,
            agrupaEn: this.agrupaEn,
            exponeId: this.exponeId,
            matrizCodigo: this.matrizCodigo,
            matriz: this.matriz,
        };
    }
}