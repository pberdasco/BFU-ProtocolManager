@echo off
setlocal enabledelayedexpansion

REM ===== CONFIG =====
set DB_NAME=bfu-project-db
set DB_USER=netrona
set DB_PASS=netrona-01
set MYSQL_BIN="C:\Program Files\MySQL\MySQL Server 8.4\bin"
set BACKUP_DIR=T:\BFU-ProtocolMgr-Bkup

REM ===== FECHA =====
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "$d=Get-Date; $dia=$d.ToString('ddd', [System.Globalization.CultureInfo]::GetCultureInfo('es-ES')).Replace('.', ''); $f=$d.ToString('yyyy-MM-dd'); $h=$d.ToString('HHmmss'); Write-Output ($f + $dia + '_' + $h)"') do set TIMESTAMP=%%i

set FILE=bfu-project-db_%TIMESTAMP%

echo === Backup MySQL %DB_NAME% ===
echo Archivo: %FILE%

cd /d %BACKUP_DIR%

REM ===== DUMP =====
%MYSQL_BIN%\mysqldump --no-tablespaces -u %DB_USER% -p%DB_PASS% %DB_NAME% > %FILE%.sql

if errorlevel 1 (
  echo ERROR en mysqldump
  pause
  exit /b 1
)

REM ===== ZIP =====
powershell -command "Compress-Archive -Path '%FILE%.sql' -DestinationPath '%FILE%.zip'"

del %FILE%.sql

echo OK Backup generado: %FILE%.zip