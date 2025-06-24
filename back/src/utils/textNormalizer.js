export function normalizarTexto (texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // eliminar tildes
        .replace(/[.,/#!$%^&*;:{}=\-_`~()[\]+–]/g, '') // eliminar signos de puntuación
        .replace(/\s+/g, '') // eliminar espacios
        .toLowerCase(); // pasar a minúsculas
}

export function normalizarTextoUM (texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // eliminar tildes
        .replace(/[.,/#!$^&*;:{}=_`~()[\]+]/g, '') // eliminar signos de puntuación excepto % y -
        .replace(/\s+/g, '') // eliminar espacios
        .replace(/[-–]+/g, '-') // colapsar guiones en uno solo
        .toLowerCase(); // pasar a minúsculas
}
