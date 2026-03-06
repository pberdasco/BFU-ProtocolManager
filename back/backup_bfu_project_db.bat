@echo off
setlocal enabledelayedexpansion

REM ===== CONFIG =====
set DB_NAME=bfu-project-db
set DB_USER=netrona
set DB_PASS=netrona-01
set MYSQL_BIN="C:\Program Files\MySQL\MySQL Server 8.4\bin"
set BACKUP_DIR=\\file01\Tecnica\BFU-ProtocolMgr-Bkup

REM ===== FECHA =====
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "$d=Get-Date; $dia=$d.ToString('ddd', [System.Globalization.CultureInfo]::GetCultureInfo('es-ES')).Replace('.', ''); $f=$d.ToString('yyyy-MM-dd'); $h=$d.ToString('HHmmss'); Write-Output ($f + $dia + '_' + $h)"') do set TIMESTAMP=%%i

set FILE=bfu-project-db_%TIMESTAMP%

echo === Backup MySQL %DB_NAME% ===
echo Archivo: %BACKUP_DIR%\%FILE%.zip

if not exist "%BACKUP_DIR%" (
  echo ERROR: no se puede acceder a "%BACKUP_DIR%"
  exit /b 1
)


REM ===== DUMP =====
%MYSQL_BIN%\mysqldump --no-tablespaces -u %DB_USER% -p%DB_PASS% %DB_NAME% > "%BACKUP_DIR%\%FILE%.sql"

if errorlevel 1 (
  echo ERROR en mysqldump
  pause
  exit /b 1
)

REM ===== ZIP =====
powershell -NoProfile -Command "Compress-Archive -Path '%BACKUP_DIR%\%FILE%.sql' -DestinationPath '%BACKUP_DIR%\%FILE%.zip' -Force"

if errorlevel 1 (
  echo ERROR al comprimir
  exit /b 1
)

del "%BACKUP_DIR%\%FILE%.sql"

echo OK Backup generado: "%BACKUP_DIR%\%FILE%.zip"