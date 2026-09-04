@echo off
:: ===========================================================
:: RiwiSchool Plus — Start PostgreSQL with Docker (Windows)
:: Run: winscripts\docker-start.bat
:: ===========================================================
setlocal enabledelayedexpansion
title RiwiSchool Plus - PostgreSQL in Docker...

cd /d "%~dp0.."

echo.
echo ==========================================
echo   Starting PostgreSQL in Docker...
echo ==========================================
echo.

:: --- Check Docker ---
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker is not running.
    echo [*] Attempting to start Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
    echo [*] Waiting for Docker to be ready...
    set /a RETRIES=30
    :WAIT_DOCKER
    timeout /t 2 /nobreak >nul
    docker info >nul 2>&1
    if !errorlevel! neq 0 (
        set /a RETRIES-=1
        if !RETRIES! leq 0 (
            echo [X] Docker did not respond. Open Docker Desktop manually and run this script again.
            pause
            exit /b 1
        )
        goto WAIT_DOCKER
    )
    echo [OK] Docker is running.
)

:: --- Check docker-compose.yml ---
if not exist "docker-compose.yml" (
    echo [X] docker-compose.yml not found in the current directory.
    pause
    exit /b 1
)

:: --- Copy .env if it does not exist ---
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] File .env created from .env.example
    )
)

:: --- Start PostgreSQL only ---
echo [*] Starting PostgreSQL container...
docker compose up -d db

:: --- Wait for PostgreSQL to be ready ---
echo [*] Waiting for PostgreSQL to be available...
set /a RETRIES=30
:WAIT_DB
docker compose exec -T db pg_isready -U postgres -q >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRIES-=1
    if !RETRIES! leq 0 (
        echo [X] PostgreSQL did not respond. Check the logs with: docker compose logs db
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    goto WAIT_DB
)
echo [OK] PostgreSQL ready.

:: --- Create database if it does not exist ---
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_NAME=" .env') do set "DB_NAME=%%a"
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_USER=" .env') do set "DB_USER=%%a"

docker compose exec -T db psql -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" 2>nul | findstr /C:"1" >nul
if %errorlevel% neq 0 (
    docker compose exec -T db psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
    echo [OK] Database '%DB_NAME%' created.
) else (
    echo [OK] Database '%DB_NAME%' already exists.
)

echo.
echo ==========================================
echo   PostgreSQL started successfully!
echo ==========================================
echo.
echo   PostgreSQL: localhost:5432
echo.
echo   To start the API:
echo     npm run dev
echo.
echo   To stop PostgreSQL:
echo     docker compose down
echo.

pause
