export default class GraficoGrupo {
    id;
    subproyectoId;
    nombre;
    pozos;
    graficos;

    constructor (row) {
        this.id = row.id;
        this.subproyectoId = row.subproyectoId;
        this.nombre = row.nombre;
        this.pozos = row.pozos;
        this.graficos = row.graficos;
    }

    toJson () {
        return {
            id: this.id,
            subproyectoId: this.subproyectoId,
            nombre: this.nombre,
            pozos: this.pozos,
            graficos: this.graficos
        };
    }
}
