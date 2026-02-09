@echo off
echo ==========================================
echo Starting Print Worker
echo ==========================================
echo.

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)
echo.

echo Starting print worker...
echo Press Ctrl+C to stop
echo.

node scripts\print-worker.js

pause
