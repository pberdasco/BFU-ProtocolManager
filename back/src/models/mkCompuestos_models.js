export default class MkCompuestos {
    id; // int
    subproyectoId; // int (FK)
    compuestoId; // int (FK)
    umId; // int (FK)

    constructor (row) {
        this.id = row.id;
        this.subproyectoId = row.subproyectoId;
        this.compuestoId = row.compuestoId;
        this.umId = row.umId;
    }

    toJson () {
        return {
            id: this.id,
            subproyectoId: this.subproyectoId,
            compuestoId: this.compuestoId,
            umId: this.umId
        };
    }
}
