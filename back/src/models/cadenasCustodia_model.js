export default class CadenasCustodia {
    id;                  // int
    nombre;              // string(45)
    laboratorioId;       // int (FK)
    eventoMuestreoId;    // int (FK)
    subproyectoId;       // int (FK) - aunque se llega a traves de eventoMuestreoId, tenerlo aqui simplifica cosas del front
    matrizCodigo         // int (FK)
    fecha;               // date
    laboratorio;         // string(45)
    cantidadMuestras     // int
    cantidadAnalisis     // int
        
    constructor(row) {
        this.id = row.id;
        this.laboratorioId = row.laboratorioId;
        this.eventoMuestreoId = row.eventoMuestreoId;
        this.subproyectoId = row.subproyectoId;
        this.matrizCodigo = row.matrizCodigo;
        this.nombre = row.nombre;
        this.fecha = row.fecha;
        this.laboratorio = row.laboratorio;
        this.cantidadMuestras = row.cantidadMuestras;
        this.cantidadAnalisis = row.cantidadAnalisis;
              
    }

    toJson() {
        return {
            id: this.id,
            laboratorioId: this.laboratorioId,
            eventoMuestreoId: this.eventoMuestreoId,
            subproyectoId: this.subproyectoId,
            matrizCodigo: this.matrizCodigo,
            nombre: this.nombre,
            fecha: this.fecha,
            laboratorio: this.laboratorio,           
            cantidadMuestras: this.cantidadMuestras,
            cantidadAnalisis: this.cantidadAnalisis,      
        };
    }
}
