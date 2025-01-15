export default class Metodo{
    id;          // int
    nombre;      // string(45)
    sinonimo;      // string(45)
    funcion;      // int
    
    constructor(row){
        this.id = row.id;
        this.nombre = row.nombre;
        this.sinonimo = row.sinonimo;
        this.funcion = row.funcion;
    }

    toJson() {
        return {
            id: this.id,            
            nombre: this.nombre, 
            sinomimo: this.sinonimo,
            funcion: this.funcion,  
        };
    }

}