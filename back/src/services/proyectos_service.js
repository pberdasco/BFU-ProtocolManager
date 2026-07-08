import { pool, dbErrorMsg } from '../database/db.js';
import Proyecto from '../models/proyectos_model.js';
import { ProyectoExtended } from '../models/proyectosExtended_model.js';

// allowedFields son los campos que pueden recibir filter y sort
// Por lo tanto solo pertenecen a proyectos y no al extended -subproyectos-
const allowedFields = {
    id: 'p.id',
    codigo: 'p.codigo',
    nombre: 'p.nombre',
    clienteId: 'p.clienteId',
    clienteCod: 'c.codigo',
    cliente: 'c.nombre',
    estadoCodigo: 'p.estadoCodigo',
    estado: 'e.nombre',
    codigoAnterior: 'p.codigoAnterior',
    fechaExpiracionCodigoAnterior: 'p.fechaExpiracionCodigoAnterior'
};

const table = 'Proyectos';
const mainTable = 'p';
const selectBase = 'SELECT p.id, p.codigo, p.nombre, p.clienteId, p.estadoCodigo, p.codigoAnterior, p.fechaExpiracionCodigoAnterior, e.nombre as estado, c.codigo as clienteCod, c.nombre as cliente';
const selectTables = 'FROM Proyectos p ' +
                     'LEFT JOIN ProyectosEstado e ON p.estadoCodigo = e.codigo ' +
                     'LEFT JOIN Clientes c ON p.clienteId = c.id';
const noExiste = 'El proyecto no existe';
const yaExiste = 'El proyecto ya existe';

export default class ProyectosService {
    static getSelect (type) {
        if (type !== 'extended') {
            return 'SELECT p.id, p.codigo, p.nombre, p.empresa, p.estadoCodigo FROM Proyectos p ';
        } else {
            return `
              SELECT 
                p.id, 
                p.codigo, 
                p.nombre, 
                p.empresa,
                p.estadoCodigo,
                COALESCE(JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', s.id,
                    'nombreLocacion', s.nombreLocacion,
                    'ubicacion', s.ubicacion,
                    'objetivo', s.objetivo,
                    'notas', s.notas,
                    'pozos', (
                      SELECT COALESCE(JSON_ARRAYAGG(
                        JSON_OBJECT('id', po.id, 'nombre', po.nombre, 'estado', po.estado, 'tipo', po.tipo)
                      ), JSON_ARRAY())
                      FROM pozos po
                      WHERE po.subproyectoId = s.id
                    )
                  )
                ), JSON_ARRAY()) AS subproyectos
              FROM Proyectos p
              LEFT JOIN subproyectos s ON p.id = s.proyectoId
            `;
        }
    }

    static getAllowedFields () {
        return allowedFields;
    }

    static async getAll (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            // Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total ${selectTables}
                              ${where ? `WHERE ${where}` : ''}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;

            // Select para los datos
            values.push(limit, offset);
            const sql = `${selectBase} ${selectTables}
                         ${where ? `WHERE ${where}` : ''}
                         ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                         LIMIT ? OFFSET ?`;

            const [rows] = await pool.query(sql, values);

            return {
                data: Proyecto.fromRows(rows),
                totalCount
            };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getAllExtended (devExtremeQuery) {
        const { where, values, order, limit, offset } = devExtremeQuery;

        try {
            // Select para el totalCount
            const countValues = [...values];
            const countSql = `SELECT COUNT(*) as total
                          FROM Proyectos p
                          ${where ? `WHERE ${where}` : ''}`;
            const [countResult] = await pool.query(countSql, countValues);
            const totalCount = countResult[0].total;

            // Select para los datos extendidos
            values.push(limit, offset);
            const sql = `
                ${this.getSelect('extended')}
                ${where ? `WHERE ${where}` : ''}
                GROUP BY p.id
                ${order.length ? `ORDER BY ${order.join(', ')}` : ''}
                LIMIT ? OFFSET ?
            `;
            const [rows] = await pool.query(sql, values);

            const proyectos = ProyectoExtended.fromRows(rows);
            return {
                data: proyectos,
                totalCount
            };
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getById (id) {
        try {
            const [rows] = await pool.query(`${selectBase} ${selectTables} WHERE ${mainTable}.Id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return new Proyecto(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async getByIdExtended (id) {
        try {
            const [rows] = await pool.query(`${this.getSelect('extended')} WHERE ${mainTable}.Id = ?`, [id]);
            if (rows.length === 0) throw dbErrorMsg(404, noExiste);
            return ProyectoExtended.fromRow(rows[0]);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async create (proyectoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [proyectoToAdd]);
            proyectoToAdd.id = rows.insertId;

            return new Proyecto(proyectoToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async createExtended (proyectoToAdd) {
        try {
            const [rows] = await pool.query(`INSERT INTO ${table} SET ?`, [proyectoToAdd]);
            proyectoToAdd.id = rows.insertId;
            return new Proyecto(proyectoToAdd);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async delete (id) {
        try {
            const [rows] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlMessage?.includes('foreign key constraint')) {
                throw dbErrorMsg(409, 'No se puede eliminar el recurso porque tiene dependencias asociadas.');
            }
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async update (id, proyecto) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [proyecto, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return ProyectosService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async updateExtended (id, proyecto) {
        try {
            const [rows] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [proyecto, id]);
            if (rows.affectedRows !== 1) throw dbErrorMsg(404, noExiste);
            return ProyectosService.getById(id);
        } catch (error) {
            if (error?.code === 'ER_DUP_ENTRY') throw dbErrorMsg(409, yaExiste);
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async validarRenumeracion (payload) {
        try {
            return await getRenumeracionPreview(pool, payload);
        } catch (error) {
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        }
    }

    static async renumerar (payload) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const preview = await getRenumeracionPreview(conn, payload, true);
            if (!preview.canAplicar) {
                throw dbErrorMsg(409, preview.motivosBloqueo[0] || 'La renumeracion no puede aplicarse.');
            }

            await conn.query(`
                UPDATE Proyectos
                   SET codigo = ?,
                       codigoAnterior = ?,
                       fechaExpiracionCodigoAnterior = ?
                 WHERE id = ?
            `, [payload.nuevoCodigo, preview.proyecto.codigoActual, payload.fechaExpiracionCodigoAnterior, payload.proyectoId]);

            const [subproyectosUpdate] = await conn.query(`
                UPDATE Subproyectos
                   SET codigo = CONCAT(?, SUBSTRING(codigo, 7))
                 WHERE proyectoId = ?
                   AND LEFT(codigo, 6) = ?
            `, [payload.nuevoCodigo, payload.proyectoId, preview.proyecto.codigoActual]);

            await conn.commit();

            return {
                ...preview,
                aplicado: true,
                subproyectosActualizados: subproyectosUpdate.affectedRows
            };
        } catch (error) {
            await conn.rollback();
            throw dbErrorMsg(error.status, error.sqlMessage || error.message);
        } finally {
            conn.release();
        }
    }
}

async function getRenumeracionPreview (conn, payload, lockRows = false) {
    const lockSql = lockRows ? ' FOR UPDATE' : '';
    const [proyectos] = await conn.query(`
        SELECT id, codigo, nombre, codigoAnterior, fechaExpiracionCodigoAnterior
          FROM Proyectos
         WHERE id = ?${lockSql}
    `, [payload.proyectoId]);

    if (proyectos.length === 0) throw dbErrorMsg(404, noExiste);

    const proyecto = proyectos[0];
    const [codigoDuplicadoRows] = await conn.query(`
        SELECT id, codigo, nombre
          FROM Proyectos
         WHERE codigo = ?
           AND id <> ?
         LIMIT 1${lockSql}
    `, [payload.nuevoCodigo, payload.proyectoId]);

    const [subproyectos] = await conn.query(`
        SELECT id, codigo
          FROM Subproyectos
         WHERE proyectoId = ?${lockSql}
    `, [payload.proyectoId]);

    const subproyectosConPrefijo = subproyectos.filter(s => s.codigo?.slice(0, 6) === proyecto.codigo);
    const subproyectosPrefijoInesperado = subproyectos.filter(s => s.codigo?.slice(0, 6) !== proyecto.codigo);

    const [colisionesSubproyectos] = await conn.query(`
        SELECT s.id, s.codigo, CONCAT(?, SUBSTRING(s.codigo, 7)) AS nuevoCodigo, otro.id AS conflictoId, otro.codigo AS conflictoCodigo
          FROM Subproyectos s
          JOIN Subproyectos otro
            ON otro.codigo = CONCAT(?, SUBSTRING(s.codigo, 7))
           AND otro.id <> s.id
         WHERE s.proyectoId = ?
           AND LEFT(s.codigo, 6) = ?
    `, [payload.nuevoCodigo, payload.nuevoCodigo, payload.proyectoId, proyecto.codigo]);

    const motivosBloqueo = [];
    if (proyecto.codigo === payload.nuevoCodigo) motivosBloqueo.push('El nuevo codigo es igual al codigo actual.');
    if (proyecto.codigo.length !== 6) motivosBloqueo.push('El codigo actual del proyecto no tiene 6 caracteres.');
    if (codigoDuplicadoRows.length > 0) motivosBloqueo.push('Ya existe otro proyecto con el nuevo codigo.');
    if (subproyectosPrefijoInesperado.length > 0) motivosBloqueo.push('Hay subproyectos cuyo codigo no comienza con el codigo actual del proyecto.');
    if (colisionesSubproyectos.length > 0) motivosBloqueo.push('La renumeracion generaria codigos de subproyecto duplicados.');

    return {
        canAplicar: motivosBloqueo.length === 0,
        motivosBloqueo,
        proyecto: {
            id: proyecto.id,
            nombre: proyecto.nombre,
            codigoActual: proyecto.codigo,
            nuevoCodigo: payload.nuevoCodigo,
            codigoAnterior: proyecto.codigoAnterior,
            fechaExpiracionCodigoAnterior: payload.fechaExpiracionCodigoAnterior
        },
        subproyectos: {
            total: subproyectos.length,
            aActualizar: subproyectosConPrefijo.length,
            prefijoInesperado: subproyectosPrefijoInesperado.length,
            colisiones: colisionesSubproyectos.length,
            muestrasPrefijoInesperado: subproyectosPrefijoInesperado.slice(0, 20),
            muestrasColisiones: colisionesSubproyectos.slice(0, 20)
        },
        conflictoProyecto: codigoDuplicadoRows[0] || null
    };
}
