export default class UM {
  id; // int
  nombre; // string(10)

  constructor (row) {
    this.id = row.id;
    this.nombre = row.nombre;
  }

  toJson () {
    return {
      id: this.id,
      nombre: this.nombre
    };
  }
}
