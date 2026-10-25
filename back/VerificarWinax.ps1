Write-Host "=== Verificando entorno para winax ===`n"

# 1. Verificar Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js: $nodeVersion"
} else {
    Write-Host "[ERROR] Node.js no está instalado o no está en PATH"
}

# 2. Verificar pnpm
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVersion = pnpm -v
    Write-Host "[OK] pnpm: $pnpmVersion"
} else {
    Write-Host "[ERROR] pnpm no está disponible. Habilitalo con: corepack enable pnpm (ver README.md para instalar Corepack en Node 26)"
}

# 3. Verificar Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python: $pythonVersion"
} else {
    Write-Host "[ERROR] Python no está instalado o no está en PATH"
}

# 4. node-gyp es provisto por pnpm al compilar winax; no requiere instalación global.

# 5. Verificar herramientas de compilación (msbuild)
$msbuildPath = Get-ChildItem "C:\Program Files*\Microsoft Visual Studio\" -Recurse -Filter msbuild.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if ($msbuildPath) {
    Write-Host "[OK] msbuild.exe encontrado en: $($msbuildPath.FullName)"
} else {
    Write-Host "[WARN] msbuild.exe no está en el PATH. Si winax funcionó, está accesible por Visual Studio internamente."
}

# 6. Prueba winax si está presente
Write-Host "`n--- Probando winax si está disponible... ---"
$winaxInstalled = Test-Path (Join-Path $PSScriptRoot 'node_modules/winax/package.json')

if ($winaxInstalled) {
    Write-Host "[OK] winax está instalado en el proyecto"
    Push-Location $PSScriptRoot
    try {
        pnpm run test:native
        if ($LASTEXITCODE -ne 0) { throw 'Falló la prueba de dependencias nativas' }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "[INFO] winax no está instalado. Ejecutá: pnpm install --frozen-lockfile desde back/"
}
