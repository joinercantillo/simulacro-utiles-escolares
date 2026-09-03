@echo off
:: ===========================================================
:: RiwiSchool Plus - Instalacion de dependencias (Windows)
:: Ejecutar: winscripts\install-deps.bat
:: ===========================================================
setlocal enabledelayedexpansion
title RiwiSchool Plus - Instalando dependencias...

echo.
echo ==========================================
echo   Instalando dependencias del sistema...
echo ==========================================
echo.

:: --- Verificar si winget esta disponible ---
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] winget no encontrado. Instalalo desde Microsoft Store:
    echo     https://aka.ms/getwinget
    echo.
    echo O instala manualmente:
    echo   - Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    echo   - Node.js 18+:    https://nodejs.org/
    echo   - Git:            https://git-scm.com/download/win
    exit /b 1
)

:: --- Docker Desktop ---
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker ya instalado: 
    docker --version
) else (
    echo [*] Instalando Docker Desktop...
    winget install --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
)

:: --- Node.js ---
node -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1 delims=v." %%a in ('node -v') do set "NODE_MAJOR=%%a"
    echo [OK] Node.js ya instalado:
    node -v
) else (
    echo [*] Instalando Node.js 18...
    winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)

:: --- Git ---
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git ya instalado:
    git --version
) else (
    echo [*] Instalando Git...
    winget install --id Git.Git --accept-package-agreements --accept-source-agreements
)

:: --- npm ---
npm -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm ya instalado:
    npm -v
) else (
    echo [!] npm no encontrado. Se instala con Node.js.
)

echo.
echo ==========================================
echo   Resumen de herramientas instaladas:
echo ==========================================
echo   Docker:  2>nul && docker --version
echo   Node.js: 2>nul && node -v
echo   npm:     2>nul && npm -v
echo   Git:     2>nul && git --version
echo.
echo [OK] Dependencias instaladas correctamente.
echo.
echo Siguiente paso: winscripts\docker-start.bat
echo.

pause
