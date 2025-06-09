export function normalizarTexto (texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // eliminar tildes
        .replace(/[.,/#!$%^&*;:{}=\-_`~()[\]+–]/g, '') // eliminar signos de puntuación
        .replace(/\s+/g, '') // eliminar espacios
        .toLowerCase(); // pasar a minúsculas
}
