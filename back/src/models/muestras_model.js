export default class Muestra {
  id; // int
  pozoId; // int (FK)
  cadenaCustodiaId; // int (FK)
  nombre; // string(45)
  tipo; // int (1,2,3)
  nivelFreatico; // decimal(5,3)

  constructor (row) {
    this.id = row.id;
    this.pozoId = row.pozoId;
    this.cadenaCustodiaId = row.cadenaCustodiaId;
    this.nombre = row.nombre;
    this.tipo = row.tipo;
    this.nivelFreatico = parseFloat(row.nivelFreatico);
  }

  toJson () {
    return {
      id: this.id,
      pozoId: this.pozoId,
      cadenaCustodiaId: this.cadenaCustodiaId,
      nombre: this.nombre,
      tipo: this.tipo,
      nivelFreatico: this.nivelFreatico
    };
  }

  static fromRows (rows) {
    return rows.map(row => new Muestra(row));
  }
}
