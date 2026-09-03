@echo off
:: ===========================================================
:: RiwiSchool Plus - Levantar el proyecto con Docker (Windows)
:: Ejecutar: winscripts\docker-start.bat
:: ===========================================================
setlocal enabledelayedexpansion
title RiwiSchool Plus - Levantando Docker...

cd /d "%~dp0.."

echo.
echo ==========================================
echo   Levantando contenedores Docker...
echo ==========================================
echo.

:: --- Verificar Docker ---
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker no esta corriendo.
    echo [*] Intentando iniciar Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
    echo [*] Esperando a que Docker este listo...
    set /a RETRIES=30
    :WAIT_DOCKER
    timeout /t 2 /nobreak >nul
    docker info >nul 2>&1
    if !errorlevel! neq 0 (
        set /a RETRIES-=1
        if !RETRIES! leq 0 (
            echo [X] Docker no respondio. Abre Docker Desktop manualmente y vuelve a ejecutar este script.
            pause
            exit /b 1
        )
        goto WAIT_DOCKER
    )
    echo [OK] Docker esta corriendo.
)

:: --- Verificar docker-compose.yml ---
if not exist "docker-compose.yml" (
    echo [X] No se encontro docker-compose.yml en el directorio actual.
    pause
    exit /b 1
)

:: --- Copiar .env si no existe ---
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] Archivo .env creado desde .env.example
    )
)

:: --- Levantar contenedores ---
echo [*] Construyendo e iniciando contenedores...
docker compose up -d --build
if %errorlevel% neq 0 (
    echo [X] Error al levantar contenedores.
    pause
    exit /b 1
)

:: --- Esperar a que PostgreSQL este listo ---
echo [*] Esperando a que PostgreSQL este disponible...
set /a RETRIES=30
:WAIT_DB
docker compose exec -T db pg_isready -U postgres -q >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRIES-=1
    if !RETRIES! leq 0 (
        echo [X] PostgreSQL no respondio. Revisa los logs con: docker compose logs db
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    goto WAIT_DB
)
echo [OK] PostgreSQL listo.

:: --- Crear base de datos si no existe ---
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_NAME=" .env') do set "DB_NAME=%%a"
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_USER=" .env') do set "DB_USER=%%a"

docker compose exec -T db psql -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" 2>nul | findstr /C:"1" >nul
if %errorlevel% neq 0 (
    docker compose exec -T db psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
    echo [OK] Base de datos '%DB_NAME%' creada.
) else (
    echo [OK] Base de datos '%DB_NAME%' ya existe.
)

echo.
echo ==========================================
echo   Proyecto levantado correctamente!
echo ==========================================
echo.
echo   API:          http://localhost:3000
echo   Swagger:      http://localhost:3000/api-docs
echo   Health check: http://localhost:3000/api/health
echo.
echo   Logs (tiempo real): docker compose logs -f api
echo.
echo   Cargar seeders:
echo     curl -X POST http://localhost:3000/api/seeders/default -H "Authorization: Bearer ^<TOKEN^>"
echo.
echo   Para detener: docker compose down
echo.

pause
