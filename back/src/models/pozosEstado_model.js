export default class PozosEstado{
    id;          // int
    nombre;      // string(20)
    
    constructor(row){
        this.id = row.id;
        this.nombre = row.nombre;
    }

    toJson() {
        return {
            id: this.id,               
            nombre: this.nombre,   
        };
    }

}