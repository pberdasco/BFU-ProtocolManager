export default class Regulacion {
  id; // int
  autAplicacionId; // int (FK)
  fechaVigencia; // date
  compuestoId; // int (FK)
  norma; // string(45)
  valorReferencia; // decimal(8,3)

  constructor (row) {
    this.id = row.id;
    this.autAplicacionId = row.autAplicacionId;
    this.fechaVigencia = row.fechaVigencia;
    this.compuestoId = row.compuestoId;
    this.norma = row.norma;
    this.valorReferencia = row.valorReferencia;
  }

  toJson () {
    return {
      id: this.id,
      autAplicacionId: this.autAplicacionId,
      fechaVigencia: this.fechaVigencia,
      compuestoId: this.compuestoId,
      norma: this.norma,
      valorReferencia: this.valorReferencia
    };
  }
}
