export default class cliente{
    id;          // int
    codigo;      // string(12)
    nombre;      // string(45)
    
    constructor(row){
        this.id = row.id;
        this.codigo = row.codigo;
        this.nombre = row.nombre;
    }

    toJson() {
        return {
            id: this.id,         
            codigo: this.codigo,      
            nombre: this.nombre,   
        };
    }

}