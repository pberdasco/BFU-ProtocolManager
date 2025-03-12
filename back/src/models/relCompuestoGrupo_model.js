export default class GrupoCompuesto {
    id; // int
    grupoId; // int
    grupo; // string(45)
    compuestoId; // int
    compuesto; // string(45)
    metodoId; // int
    metodo; // string(45)
    matrizCompuestoId; // int
    matrizCompuesto; // string
    matrizGrupoId; // int
    matrizGrupo; // string
    matrizCodigo; // int

    constructor (row) {
        this.id = row.id;
        this.grupoId = row.grupoId;
        this.grupo = row.grupo;
        this.compuestoId = row.compuestoId;
        this.compuesto = row.compuesto;
        this.metodoId = row.metodoId;
        this.metodo = row.metodo;
        this.matrizCompuestoId = row.matrizCompuestoId;
        this.matrizCompuesto = row.matrizCompuesto;
        this.matrizGrupoId = row.matrizGrupoId;
        this.matrizGrupo = row.matrizGrupo;
        this.matrizCodigo = row.matrizCodigo;
    }

    toJson () {
        return {
            id: this.id,
            grupoId: this.grupoId,
            grupo: this.grupo,
            compuestoId: this.compuestoId,
            compuesto: this.compuesto,
            metodoId: this.metodoId,
            metodo: this.metodo,
            matrizCompuestoId: this.matrizCompuestoId,
            matrizCompuesto: this.matrizCompuesto,
            matrizGrupoId: this.matrizGrupoId,
            matrizGrupo: this.matrizGrupo,
            matrizCodigo: this.matrizCodigo
        };
    }
}
