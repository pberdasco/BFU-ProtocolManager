import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import test from 'node:test';
import { z } from 'zod';
import { bodyValidations } from '../src/controllers/validations.js';
import { clienteCreateSchema, clienteUpdateSchema } from '../src/models/clientes_schema.js';
import { subproyectoCreateSchema, subproyectoUpdateSchema } from '../src/models/subproyectos_schema.js';
import { bodyCadenaSchema } from '../src/models/cadenaToExcel_schema.js';
import { filaSchema } from '../src/models/cadenaCompleta_schema.js';
import { configSchema } from '../src/models/evolucionCDI_schema.js';
import { numberSchema } from '../src/models/utils/numberSchema.js';
import { dateSchema } from '../src/models/utils/dateSchema.js';

test('helper devuelve datos filtrados y transformados', () => {
    const schema = z.object({ nombre: z.string().trim(), cantidad: z.coerce.number() });
    assert.deepEqual(bodyValidations({ nombre: ' Prueba ', cantidad: '2', extra: true }, schema), [[], { nombre: 'Prueba', cantidad: 2 }]);
});

test('helper devuelve field/message con rutas anidadas y errores de raíz', () => {
    const schema = z.object({ muestras: z.array(z.object({ valor: z.number() })) });
    const [errors, data] = bodyValidations({ muestras: [{ valor: 'incorrecto' }] }, schema);
    assert.equal(data, null);
    assert.deepEqual(errors.map(error => error.field), ['muestras.0.valor']);
    assert.equal(typeof errors[0].message, 'string');
    assert.equal(bodyValidations(null, schema)[0][0].field, '');
});

test('helper propaga errores de programación en vez de tratarlos como validación', () => {
    const failure = new Error('fallo inesperado');
    const schema = z.string().transform(() => { throw failure; });
    assert.throws(() => bodyValidations('dato', schema), error => error === failure);
});

test('todos los esquemas se construyen y rechazan null con Zod 4', async () => {
    const directory = new URL('../src/models/', import.meta.url);
    let checked = 0;
    for (const file of readdirSync(directory).filter(name => name.endsWith('_schema.js'))) {
        const schemas = await import(new URL(file, directory));
        for (const [name, schema] of Object.entries(schemas)) {
            if (typeof schema?.safeParse !== 'function') continue;
            const result = schema.safeParse(null);
            assert.equal(result.success, false, `${file}: ${name}`);
            assert.ok(result.error.issues.length > 0);
            checked++;
        }
    }
    assert.ok(checked > 50);
});

test('altas filtran campos extra y modificaciones conservan campos omitidos', () => {
    assert.deepEqual(clienteCreateSchema.parse({ codigo: 'C1', nombre: 'Cliente', extra: true }), { codigo: 'C1', nombre: 'Cliente' });
    assert.deepEqual(clienteUpdateSchema.parse({ nombre: 'Nuevo' }), { nombre: 'Nuevo' });
    assert.deepEqual(clienteUpdateSchema.parse({}), {});
    const created = subproyectoCreateSchema.parse({
        proyectoId: 1,
        codigo: 'SP1',
        autAplicacionAguaId: 1,
        autAplicacionSueloId: 1,
        autAplicacionGasesId: 1,
        autAplicacionFLNAId: 1
    });
    for (const key of ['nombreLocacion', 'ubicacion', 'apies', 'objetivo', 'notas']) assert.equal(created[key], '');
    assert.deepEqual(subproyectoUpdateSchema.parse({}), {});
    assert.deepEqual(subproyectoUpdateSchema.parse({ codigo: 'SP2' }), { codigo: 'SP2' });
    assert.deepEqual(subproyectoUpdateSchema.parse({ notas: '' }), { notas: '' });
});

test('preprocesadores conservan fechas, conversiones numéricas y límites', () => {
    assert.equal(dateSchema.parse('2026-10-25T13:00:00.000Z'), '2026-10-25');
    assert.equal(dateSchema.parse('2026-10-25'), '2026-10-25');
    assert.equal(dateSchema.safeParse('no-es-fecha').success, false);
    const number = numberSchema({ desde: -90, hasta: 90 });
    assert.equal(number.parse('-34.5'), -34.5);
    assert.equal(number.safeParse('').success, false);
    assert.equal(number.safeParse('91').success, false);
    assert.equal(number.nullable().parse(null), null);
});

test('cadena Excel mantiene defaults de arrays y rechaza colecciones vacías', () => {
    const cadena = { nombre: 'Cadena', matriz: 'Agua', cliente: 'Cliente', proyecto: 'Proyecto', laboratorio: 'Lab', soloMedidas: false };
    const parsed = bodyCadenaSchema.parse({ cadenas: [cadena] });
    assert.deepEqual(parsed.cadenas[0].muestras, []);
    assert.deepEqual(parsed.cadenas[0].analisis, []);
    assert.equal(bodyCadenaSchema.safeParse({ cadenas: [] }).success, false);
    const result = bodyCadenaSchema.safeParse({ cadenas: [{ ...cadena, analisis: [{ tipo: 1, metodo: 'M' }] }] });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some(issue => issue.path[0] === 'cadenas'));
});

test('protocolos conservan claves dinámicas de muestras', () => {
    const row = { id: 1, compuestoId: 1, metodoId: 1, umId: 1, estado: 0, protocoloItemId: null, 'Muestra-P1': 0.25 };
    assert.deepEqual(filaSchema.parse(row), row);
});

test('configuración Evolución CDI valida arrays y mantiene rutas de errores', () => {
    const config = {
        subproyectoId: 270,
        proyectoNombre: 'Proyecto',
        gruposConfig: [{ id: 1, subproyectoId: 270, nombre: 'Grupo', pozos: [1], graficos: [1] }],
        graficosConfig: [{ id: 1, nombre: 'Gráfico', eje1: [1], eje2: [], seccion: 1, anexoNombre: 'Anexo' }],
        minFechaUsuario: null,
        maxFechaUsuario: '2026-10-25'
    };
    assert.deepEqual(configSchema.parse(config), config);
    const invalid = structuredClone(config);
    invalid.gruposConfig[0].pozos = ['incorrecto'];
    const result = configSchema.safeParse(invalid);
    assert.equal(result.success, false);
    assert.equal(result.error.issues[0].path.join('.'), 'gruposConfig.0.pozos.0');
});

test('controladores devuelven field/message ante errores sin consultar MySQL', async t => {
    // Los imports crean el pool pero no abren conexiones. No requiere un .env.
    t.mock.method(process, 'loadEnvFile', () => {});
    const previousTemplate = process.env.CADENA_EXCEL_MODELO_NAME;
    process.env.CADENA_EXCEL_MODELO_NAME = 'test-template.xlsx';
    t.after(() => {
        if (previousTemplate === undefined) delete process.env.CADENA_EXCEL_MODELO_NAME;
        else process.env.CADENA_EXCEL_MODELO_NAME = previousTemplate;
    });
    const directory = new URL('../src/controllers/', import.meta.url);
    const loaded = new Map();
    let checked = 0;
    for (const file of readdirSync(directory).filter(name => name.endsWith('_controller.js'))) {
        const controllers = await import(new URL(file, directory));
        for (const controller of Object.values(controllers)) {
            if (typeof controller?.bodyValidations !== 'function') continue;
            loaded.set(file, controller);
            const [errors, entity] = controller.bodyValidations({}, 'create');
            assert.ok(errors.length > 0, file);
            assert.equal(entity, null, file);
            for (const error of errors) {
                assert.equal(typeof error.field, 'string', file);
                assert.equal(typeof error.message, 'string', file);
            }
            const [updateErrors, update] = controller.bodyValidations({}, 'update');
            assert.deepEqual(updateErrors, [], file);
            assert.ok(update === null || Object.keys(update).length === 0, file);
            // Conservar también la conducta previa ante métodos no contemplados.
            const expectedUnknown = file.startsWith('graficos') ? [[], {}] : [[], null];
            assert.deepEqual(controller.bodyValidations({}, 'unknown'), expectedUnknown, file);
            checked++;
        }
    }
    assert.ok(checked >= 25);

    await t.test('wrappers CRUD conservan altas y modificaciones parciales', () => {
        const controller = loaded.get('clientes_controller.js');
        assert.deepEqual(controller.bodyValidations({ codigo: 'C1', nombre: 'Cliente', extra: true }, 'create'), [[], { codigo: 'C1', nombre: 'Cliente' }]);
        assert.deepEqual(controller.bodyValidations({ nombre: 'Nuevo' }, 'update'), [[], { nombre: 'Nuevo' }]);
    });

    await t.test('reemplazos Mann-Kendall y listas de sinónimos usan sus esquemas', () => {
        const cases = [
            ['mkPozos_controller.js', 'replace', [{ subproyectoId: 1, pozoId: 2, hojaId: 3 }]],
            ['mkCompuestos_controller.js', 'replace', [{ subproyectoId: 1, compuestoId: 2, umId: 3 }]],
            ['sinonimosCompuestos_controller.js', 'getLista', { matrizId: 1, compuestosOriginales: ['Benceno'] }],
            ['sinonimosMetodos_controller.js', 'getLista', { metodosOriginales: ['EPA'] }],
            ['sinonimosUMs_controller.js', 'getLista', { umsOriginales: ['mg/L'] }]
        ];
        for (const [file, method, data] of cases) {
            const controller = loaded.get(file);
            assert.deepEqual(controller.bodyValidations(data, method), [[], data], file);
            assert.ok(controller.bodyValidations({}, method)[0].length > 0, file);
        }
    });

    await t.test('protocolos mantienen orden y rutas de validación sin prefijos nuevos', () => {
        const controller = loaded.get('protocolos_controller.js');
        const formData = { evento: 1, laboratorio: 1, matrizId: 1, indicePagina: 1, adelanto: [{ name: 'prueba.xlsx' }] };
        const adelantoData = {
            data: [{ compuestoLab: 'Benceno', compuestoId: 1, metodoLab: null, metodoId: null, unidadLab: null, unidadId: null, P1: 0.5 }],
            muestras: [{ muestraLab: 'P1', muestraCadena: 1 }]
        };
        assert.deepEqual(controller.bodyValidations({ formData, adelantoData }, 'create'), [[], { formData, adelantoData }]);
        const [firstErrors] = controller.bodyValidations({ formData: {}, adelantoData: {} }, 'create');
        assert.equal(firstErrors[0].field, 'evento');
        const [secondErrors] = controller.bodyValidations({ formData, adelantoData: {} }, 'create');
        assert.equal(secondErrors[0].field, 'data');
    });

    await t.test('proyectos conservan la selección actual de esquemas extendidos', () => {
        const controller = loaded.get('proyectos_controller.js');
        const data = { codigo: 'P1', nombre: 'Proyecto', clienteId: 1, estadoCodigo: 1, subproyectos: [] };
        assert.deepEqual(controller.bodyValidations(data, 'createExtended'), [[], data]);
        assert.deepEqual(controller.bodyValidations(data, 'updateExtended'), [[], data]);
        assert.ok(controller.bodyValidations({}, 'updateExtended')[0].length > 0);
        const renumeracion = { proyectoId: 1, nuevoCodigo: '123456', fechaExpiracionCodigoAnterior: '2026-10-25' };
        assert.deepEqual(controller.bodyValidations(renumeracion, 'renumeracion'), [[], renumeracion]);
    });
});
