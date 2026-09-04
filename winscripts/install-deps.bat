@echo off
:: ===========================================================
:: RiwiSchool Plus - Install dependencies (Windows)
:: Run: winscripts\install-deps.bat
:: ===========================================================
setlocal enabledelayedexpansion
title RiwiSchool Plus - Installing dependencies...

echo.
echo ==========================================
echo   Installing system dependencies...
echo ==========================================
echo.

:: --- Check if winget is available ---
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] winget not found. Install it from Microsoft Store:
    echo     https://aka.ms/getwinget
    echo.
    echo Or install manually:
    echo   - Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    echo   - Node.js 18+:    https://nodejs.org/
    echo   - Git:            https://git-scm.com/download/win
    exit /b 1
)

:: --- Docker Desktop ---
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker already installed: 
    docker --version
) else (
    echo [*] Installing Docker Desktop...
    winget install --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
)

:: --- Node.js ---
node -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1 delims=v." %%a in ('node -v') do set "NODE_MAJOR=%%a"
    echo [OK] Node.js already installed:
    node -v
) else (
    echo [*] Installing Node.js 18...
    winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)

:: --- Git ---
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git already installed:
    git --version
) else (
    echo [*] Installing Git...
    winget install --id Git.Git --accept-package-agreements --accept-source-agreements
)

:: --- npm ---
npm -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm already installed:
    npm -v
) else (
    echo [!] npm not found. It is installed with Node.js.
)

echo.
echo ==========================================
echo   Installed tools summary:
echo ==========================================
echo   Docker:  2>nul && docker --version
echo   Node.js: 2>nul && node -v
echo   npm:     2>nul && npm -v
echo   Git:     2>nul && git --version
echo.
echo [OK] Dependencies installed successfully.
echo.
echo Next step: winscripts\docker-start.bat
echo.

pause
