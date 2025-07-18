export default class autaplicacion {
    id; // int
    nombre; // string(45)
    sitioWeb1; // string(60)
    sitioWeb2; // string(60)
    provinciaId; // int (FK)
    provincia; // string(45)
    matrizId; // int (FK)
    matriz; // string (20)

    constructor (row) {
        this.id = row.id;
        this.nombre = row.nombre;
        this.sitioWeb1 = row.sitioWeb1;
        this.sitioWeb2 = row.sitioWeb2;
        this.provinciaId = row.provinciaId;
        this.provincia = row.provincia;
        this.matrizId = row.matrizId;
        this.matriz = row.matriz;
    }

    toJson () {
        return {
            id: this.id,
            nombre: this.nombre,
            sitioWeb1: this.sitioWeb1,
            sitioWeb2: this.sitioWeb2,
            provinciaId: this.provinciaId,
            provincia: this.provincia,
            matrizId: this.matrizId,
            martriz: this.matriz
        };
    }
}
