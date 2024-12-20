export default class compuesto{
    id;          // int
    nombre;      // string(45)
    sinonimo;    // string(30)
    funcion;     // int
    agrupaEn;  // int

    constructor(row){
        this.id = row.id;
        this.nombre = row.nombre;
        this.sinonimo = row.sinonimo;
        this.funcion = row.funcion;
        this.agrupaEn = row.agrupaEn;
    }

    toJson() {
        return {
            id: this.id,               
            nombre: this.nombre,
            sinonimo: this.sinonimo,
            funcion: this.funcion,
            agrupaEn: this.agrupaEn,
        };
    }

}