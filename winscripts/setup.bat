@echo off
:: ===========================================================
:: RiwiSchool Plus — Setup completo (Windows)
:: Instala dependencias + PostgreSQL en Docker + npm run dev
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
echo [Paso 1/6] Instalando dependencias del sistema...
call "%~dp0install-deps.bat"
if %errorlevel% neq 0 (
    echo [X] Error al instalar dependencias.
    pause
    exit /b 1
)

:: --- 2. Verificar Docker ---
echo [Paso 2/6] Verificando Docker...
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
echo [Paso 3/6] Preparando archivos de entorno...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] .env creado desde .env.example
    )
) else (
    echo [OK] .env ya existe.
)

:: --- 4. Levantar SOLO PostgreSQL en Docker ---
echo [Paso 4/6] Levantando PostgreSQL en Docker...
docker compose up -d db

echo [*] Esperando a que PostgreSQL este disponible...
set /a RETRIES=30
:WAIT_DB
docker compose exec -T db pg_isready -U postgres -q >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRIES-=1
    if !RETRIES! leq 0 (
        echo [X] PostgreSQL no respondio. Revisa: docker compose logs db
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    goto WAIT_DB
)
echo [OK] PostgreSQL listo.

:: Crear base de datos si no existe
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_NAME=" .env') do set "DB_NAME=%%a"
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_USER=" .env') do set "DB_USER=%%a"

docker compose exec -T db psql -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" 2>nul | findstr /C:"1" >nul
if %errorlevel% neq 0 (
    docker compose exec -T db psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
    echo [OK] Base de datos '%DB_NAME%' creada.
) else (
    echo [OK] Base de datos '%DB_NAME%' ya existe.
)

:: --- 5. Instalar dependencias Node.js ---
echo [Paso 5/6] Instalando dependencias Node.js...
npm install --silent 2>nul
echo [OK] node_modules instalado.

:: --- 6. Iniciar servidor en modo desarrollo ---
echo [Paso 6/6] Iniciando servidor en modo desarrollo...
echo.
echo ==========================================
echo   ¡Setup completo!
echo ==========================================
echo.
echo   Servidor:  http://localhost:3000
echo   Swagger:   http://localhost:3000/api-docs
echo   Health:    http://localhost:3000/api/health
echo.
echo   PostgreSQL: localhost:5432 (Docker)
echo.
echo   Load test seeders:
echo     curl -X POST http://localhost:3000/api/seeder/default -H "Authorization: Bearer ^<TOKEN^>"
echo.
echo   To stop PostgreSQL:
echo     docker compose down
echo.
echo ==========================================
echo   Starting npm run dev...
echo ==========================================
echo.

npm run dev
