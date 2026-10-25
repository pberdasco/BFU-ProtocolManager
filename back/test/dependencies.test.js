import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';
import ExcelJS from 'exceljs';
import express from 'express';

for (const mode of ['esm', 'cjs']) {
    test(`docx genera un Word con la distribución oficial (${mode})`, () => {
        const load = mode === 'esm'
            ? "const { Packer } = await import('docx');"
            : "const { createRequire } = await import('node:module'); const { Packer } = createRequire(import.meta.url)('docx');";
        const script = `
            ${load}
            const { buildDoc, createMainTitleParagraph, createSubTitleParagraph, createTablaSeccionConEpigrafe }
                = await import('./src/services/reportes/tablasAnaliticas/cadenaTODOCTabla_Helper.js');
            const section = createTablaSeccionConEpigrafe([
                createMainTitleParagraph(), createSubTitleParagraph('Agua')
            ], 'Proyecto de prueba');
            const buffer = await Packer.toBuffer(buildDoc([section], 'Proyecto de prueba'));
            if (buffer.readUInt32LE(0) !== 0x04034b50) throw new Error('Invalid DOCX ZIP');
            console.log(buffer.length);
        `;
        const result = spawnSync(process.execPath, ['--trace-warnings', '--input-type=module', '-e', script], {
            cwd: new URL('../', import.meta.url),
            encoding: 'utf8',
            timeout: 20000
        });
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr);
        // docx puede emitir el warning conocido de localStorage en Node 26.
        // No se modifica la dependencia ni se exige la ausencia del aviso.
        assert.ok(Number(result.stdout.trim()) > 1000);
    });
}

test('ExcelJS guarda y reabre datos y formatos condicionales con UUID v4', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Datos');
    sheet.addRows([['Pozo', 'Valor'], ['P1', 10], ['P2', 20]]);
    // Este iconSet utiliza la extensión x14 y obliga a ExcelJS a generar UUIDs.
    sheet.addConditionalFormatting({
        ref: 'B2:B3',
        rules: [{
            type: 'iconSet',
            iconSet: '3Stars',
            cfvo: [{ type: 'percent', value: 0 }, { type: 'percent', value: 33 }, { type: 'percent', value: 67 }]
        }]
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const restored = new ExcelJS.Workbook();
    await restored.xlsx.load(buffer);
    const saved = restored.getWorksheet('Datos');
    assert.equal(saved.getCell('B2').value, 10);
    assert.equal(saved.getCell('B3').value, 20);
    const rule = saved.conditionalFormattings[0].rules[0];
    assert.equal(rule.iconSet, '3Stars');
    assert.match(rule.x14Id, /^\{[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\}$/i);
});

test('Express procesa JSON y consultas sin acceder a la base de datos', async () => {
    const app = express();
    app.use(express.json({ limit: '1kb' }));
    app.use(express.urlencoded({ extended: true, limit: '1kb' }));
    app.post('/echo', (req, res) => res.json({ body: req.body, query: req.query }));
    const server = app.listen(0, '127.0.0.1');
    try {
        await once(server, 'listening');
        const url = `http://127.0.0.1:${server.address().port}/echo?$skip=0`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyectoId: 270 })
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { body: { proyectoId: 270 }, query: { $skip: '0' } });
        const form = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams({ 'filtro[proyectoId]': '270' })
        });
        assert.equal(form.status, 200);
        assert.deepEqual((await form.json()).body, { filtro: { proyectoId: '270' } });
    } finally {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});
