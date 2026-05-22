@echo off
title Hox ID Card Builder - Local Server
echo ====================================================================
echo             HOX INFOTECH - PREMIUM ID CARD PORTAL
echo ====================================================================
echo.
echo Modern browsers restrict loading external React components via the local
echo "file://" protocol due to CORS security policies. 
echo.
echo This script will boot a secure, zero-installation local server to ensure
echo the application loads with 100%% compatibility and high performance.
echo.
echo Checking environment...

:: Check for python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo [🟢 OK] Python detected on system PATH.
    echo Launching local server on http://localhost:8000/offline-portal.html ...
    echo (Press Ctrl+C inside this window to stop the server at any time)
    echo.
    start "" "http://localhost:8000/offline-portal.html"
    python -m http.server 8000
    goto end
)

:: Check for python3
where python3 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo [🟢 OK] Python3 detected on system PATH.
    echo Launching local server on http://localhost:8000/offline-portal.html ...
    echo (Press Ctrl+C inside this window to stop the server at any time)
    echo.
    start "" "http://localhost:8000/offline-portal.html"
    python3 -m http.server 8000
    goto end
)

echo.
echo [🟡 WARNING] Python is not detected on your system PATH.
echo.
echo Trying to launch offline-portal.html directly...
echo Note: If the browser screen is blank, please do one of the following:
echo   1. Open this workspace in VS Code and click "Go Live" (Live Server extension).
echo   2. Install Python from the Microsoft Store to enable one-click running.
echo.
pause
start offline-portal.html

:end
