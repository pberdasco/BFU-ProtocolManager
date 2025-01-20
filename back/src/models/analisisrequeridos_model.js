export default class AnalisisRequerido{
    id;               // int
    cadenaCustodiaId; //int
    tipo;             // int (1:Grupo/2:Compuesto)
    grupoId;          // int
    grupo;            // string(45)
    compuestoId;      // int
    compuesto;        // string(45)
    metodoId;         // int
    metodo;         // string(45)
    

    constructor(row){
        this.id = row.id;
        this.cadenaCustodiaId = row.cadenaCustodiaId;
        this.tipo = row.tipo;
        this.grupoId = row.grupoId;
        this.grupo = row.grupo;
        this.compuestoId = row.compuestoId;
        this.compuesto = row.compuesto;
        this.metodoId = row.metodoId;
        this.metodo = row.metodo;
    }

    toJson() {
        return {
            id: this.id,         
            cadenaCustodiaId: this.cadenaCustodiaId,      
            tipo: this.tipo,
            grupoId: this.grupoId,
            grupo: this.grupo,
            compuestoId: this.compuestoId,
            compuesto: this.compuesto,
            metodoId: this.metodoId,
            metodo: this.metodo,
        };
    }
}