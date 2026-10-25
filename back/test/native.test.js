import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import bcrypt from 'bcrypt';
import winax from 'winax';

test('bcrypt genera y valida hashes', async () => {
    const hash = await bcrypt.hash('migration-smoke-test', 4);
    assert.equal(await bcrypt.compare('migration-smoke-test', hash), true);
    assert.equal(await bcrypt.compare('incorrect-password', hash), false);
});

// Requiere Windows y Excel instalado. Solo crea un libro temporal propio.
test('winax escribe matrices, crea un gráfico y guarda/reabre un libro', () => {
    const tempRoot = path.join(os.tmpdir(), 'opencode');
    fs.mkdirSync(tempRoot, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(tempRoot, 'bfu-native-'));
    const filePath = path.join(tempDir, 'smoke.xlsx');
    const objects = [];
    const track = object => {
        objects.push(object);
        return object;
    };
    let excel, workbook;
    try {
        excel = track(new winax.Object('Excel.Application'));
        excel.Visible = false;
        excel.DisplayAlerts = false;
        excel.EnableEvents = false;
        const workbooks = track(excel.Workbooks);
        workbook = track(workbooks.Add());
        const sheet = track(workbook.Worksheets(1));
        const range = track(sheet.Range('A1:B3'));
        const values = [[1, 10], [2, 20], [3, 30]];
        range.Value = values;
        assert.deepEqual(range.Value.valueOf(), values);

        const charts = track(sheet.ChartObjects());
        const chartObject = track(charts.Add(10, 70, 400, 240));
        const chart = track(chartObject.Chart);
        chart.ChartType = 74; // xlXYScatterLines
        chart.SetSourceData(range);
        assert.equal(charts.Count, 1);
        workbook.SaveAs(filePath, 51); // xlOpenXMLWorkbook
        workbook.Close(false);
        workbook = null;
        assert.ok(fs.statSync(filePath).size > 0);

        workbook = track(workbooks.Open(filePath));
        const savedSheet = track(workbook.Worksheets(1));
        const savedRange = track(savedSheet.Range('A1:B3'));
        const savedCharts = track(savedSheet.ChartObjects());
        assert.deepEqual(savedRange.Value.valueOf(), values);
        assert.equal(savedCharts.Count, 1);
    } finally {
        try {
            if (workbook) workbook.Close(false);
        } finally {
            try {
                if (excel) excel.Quit();
            } finally {
                for (const object of objects.reverse()) winax.release(object);
                if (typeof global.gc === 'function') global.gc();
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        }
    }
});
