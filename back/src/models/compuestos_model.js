export default class compuesto {
    id; // int
    nombre; // string(45)
    codigo; // string(10)
    agrupaEn; // int
    exponeId; // int
    matrizCodigo; // int
    matriz; // string(30)

    constructor (row) {
        this.id = row.id;
        this.nombre = row.nombre;
        this.codigo = row.codigo;
        this.agrupaEn = row.agrupaEn;
        this.exponeId = row.exponeId;
        this.matrizCodigo = row.matrizCodigo;
        this.matriz = row.matriz;
    }

    toJson () {
        return {
            id: this.id,
            nombre: this.nombre,
            codigo: this.codigo,
            agrupaEn: this.agrupaEn,
            exponeId: this.exponeId,
            matrizCodigo: this.matrizCodigo,
            matriz: this.matriz
        };
    }
}
