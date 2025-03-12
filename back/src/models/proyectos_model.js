
export default class Proyecto {
  id; // int
  codigo; // string(10)
  nombre; // string(45)
  clienteId; // int
  clienteCod; // string(12)
  cliente; // string(45)
  estadoCodigo; // int
  estado; // string(15)

  constructor (row) {
    this.id = row.id;
    this.codigo = row.codigo;
    this.nombre = row.nombre;
    this.clienteId = row.clienteId;
    this.clienteCod = row.clienteCod;
    this.cliente = row.cliente;
    this.estadoCodigo = row.estadoCodigo;
    this.estado = row.estado;
  }

  toJson () {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      cliente: this.cliente,
      clienteId: this.clienteId,
      clienteCod: this.clienteCod,
      estadoCodigo: this.estadoCodigo,
      estado: this.estado
    };
  }

  /**
     * Transforma una fila de base de datos en un objeto Proyecto bien conformado
     * @param {Object} row - Fila única de base de datos
     * @returns {Proyecto}
     */
  static extendedFromRow (row) {
    return new Proyecto({
      ...row,
      subproyectos: row.subproyectos ? JSON.parse(row.subproyectos) : [] // Parsear JSON si existe
    });
  }

  /**
     * Transforma múltiples filas de base de datos en una lista de Proyectos
     * @param {Array<Object>} rows - Conjunto de filas de base de datos
     * @returns {Array<Proyecto>}
     */
  static extendedFromRows (rows) {
    return rows.map(row => Proyecto.fromRow(row));
  }

  static fromRows (rows) {
    return rows.map(row => new Proyecto(row));
  }
}
