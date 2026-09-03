@echo off
:: ===========================================================
:: RiwiSchool Plus - Setup completo (Windows)
:: Instala dependencias + levanta Docker + carga seeders
:: Ejecutar: winscripts\setup.bat
:: ===========================================================
setlocal enabledelayedexpansion
title RiwiSchool Plus - Setup completo...

cd /d "%~dp0.."

echo.
echo ==========================================
echo   RiwiSchool Plus - Setup completo
echo ==========================================
echo.

:: --- 1. Instalar dependencias del sistema ---
echo [Paso 1/5] Instalando dependencias del sistema...
call "%~dp0install-deps.bat"
if %errorlevel% neq 0 (
    echo [X] Error al instalar dependencias.
    pause
    exit /b 1
)

:: --- 2. Verificar Docker ---
echo [Paso 2/5] Verificando Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
    echo [*] Esperando a que Docker Desktop inicie...
    set /a RETRIES=30
    :WAIT_DOCKER_SETUP
    timeout /t 2 /nobreak >nul
    docker info >nul 2>&1
    if !errorlevel! neq 0 (
        set /a RETRIES-=1
        if !RETRIES! leq 0 (
            echo [X] Docker no inicio. Abre Docker Desktop manualmente.
            pause
            exit /b 1
        )
        goto WAIT_DOCKER_SETUP
    )
)
echo [OK] Docker corriendo.

:: --- 3. Preparar entorno ---
echo [Paso 3/5] Preparando archivos de entorno...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] .env creado desde .env.example
    )
) else (
    echo [OK] .env ya existe.
)

:: --- 4. Levantar Docker ---
echo [Paso 4/5] Levantando contenedores Docker...
call "%~dp0docker-start.bat"

:: --- 5. Instalar dependencias Node.js ---
echo [Paso 5/5] Instalando dependencias Node.js...
npm install --silent 2>nul
echo [OK] node_modules instalado.

:: --- Resumen ---
echo.
echo ==========================================
echo   ¡Setup completo!
echo ==========================================
echo.
echo   Servidor:  http://localhost:3000
echo   Swagger:   http://localhost:3000/api-docs
echo   Health:    http://localhost:3000/api/health
echo.
echo   Desarrollo local (fuera de Docker):
echo     npm run dev
echo.
echo   Levantar Docker:
echo     winscripts\docker-start.bat
echo.
echo   Cargar seeders de prueba:
echo     curl -X POST http://localhost:3000/api/seeders/default -H "Authorization: Bearer ^<TOKEN^>"
echo.
echo   Detener Docker:
echo     docker compose down
echo.

pause
