
export default class MkPozos {
    id; // int
    subproyectoId; // int (FK)
    pozoId; // int (FK)
    hojaId; // int entre  1y5 ??

    constructor (row) {
        this.id = row.id;
        this.subproyectoId = row.subproyectoId;
        this.pozoId = row.pozoId;
        this.hojaId = row.hojaId;
    }

    toJson () {
        return {
            id: this.id,
            subproyectoId: this.subproyectoId,
            pozoId: this.pozoId,
            hojaId: this.hojaId

        };
    }
}
