Write-Host "=== Verificando entorno para winax ===`n"

# 1. Verificar Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js: $nodeVersion"
} else {
    Write-Host "[ERROR] Node.js no está instalado o no está en PATH"
}

# 2. Verificar NPM
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm -v
    Write-Host "[OK] NPM: $npmVersion"
} else {
    Write-Host "[ERROR] NPM no está instalado o no está en PATH"
}

# 3. Verificar Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python: $pythonVersion"
} else {
    Write-Host "[ERROR] Python no está instalado o no está en PATH"
}

# 4. Verificar node-gyp
$gypPath = npm list -g node-gyp --depth=0 2>&1 | Select-String 'node-gyp'
if ($gypPath) {
    Write-Host "[OK] node-gyp está instalado globalmente (detectado vía npm)"
} else {
    Write-Host "[WARN] node-gyp no está global. Si winax funciona, fue usado como dependencia local."
}

# 5. Verificar herramientas de compilación (msbuild)
$msbuildPath = Get-ChildItem "C:\Program Files*\Microsoft Visual Studio\" -Recurse -Filter msbuild.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if ($msbuildPath) {
    Write-Host "[OK] msbuild.exe encontrado en: $($msbuildPath.FullName)"
} else {
    Write-Host "[WARN] msbuild.exe no está en el PATH. Si winax funcionó, está accesible por Visual Studio internamente."
}

# 6. Prueba winax si está presente
Write-Host "`n--- Probando winax si está disponible... ---"
$winaxInstalled = npm list winax --depth=0 2>&1 | Select-String 'winax'

if ($winaxInstalled) {
    Write-Host "[OK] winax está instalado en el proyecto"
$testScript = @"
import winaxPkg from 'winax';
const ActiveXObject = winaxPkg.Object;
const excel = new ActiveXObject('Excel.Application');
excel.Visible = false;
console.log('[TEST] winax: Excel instanciado correctamente');
excel.Quit();
"@
	Set-Content -Path "testWinax.mjs" -Value $testScript -Encoding UTF8
	node testWinax.mjs
	Remove-Item "testWinax.mjs"
} else {
    Write-Host "[INFO] winax no está instalado. Ejecutá: npm install winax"
}
