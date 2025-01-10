export default class GrupoCompuesto{
    id;            // int
    grupoId;       // int
    grupo;         // string(45)
    compuestoId;   // int
    compuesto;     // string(45)
    matrizCompuestoId;  // int
    matrizCompuesto;
    matrizGrupoId;
    matrizGrupo;

    constructor(row){
        this.id = row.id;
        this.grupoId = row.grupoId;
        this.grupo = row.grupo;
        this.compuestoId = row.compuestoId;
        this.compuesto = row.compuesto;
        this.matrizCompuestoId = row.matrizCompuestoId;
        this.matrizCompuesto = row.matrizCompuesto;
        this.matrizGrupoId = row.matrizGrupoId;
        this.matrizGrupo = row.matrizGrupo;
    }

    toJson() {
        return {
            id: this.id,               
            grupoId: this.grupoId,
            grupo: this.grupo,
            compuestoId: this.compuestoId,
            compuesto: this.compuesto,
            matrizCompuestoId: this.matrizCompuestoId,
            matrizCompuesto: this.matrizCompuesto,
            matrizGrupoId: this.matrizGrupoId,
            matrizGrupo: this.matrizGrupo
        };
    }
}