export default class Proyecto{
    id;          // int
    codigo;      // string(10)
    nombre;      // string(45)
    empresa;     // string(45)

    constructor(row){
        this.id = row.id;
        this.codigo = row.codigo;
        this.nombre = row.nombre;
        this.empresa = row.empresa;
    }

    toJson() {
        return {
            id: this.id,               
            codigo: this.codigo,
            nombre: this.nombre,
            empresa: this.empresa
        };
    }

}