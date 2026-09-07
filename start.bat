@echo off
echo ==========================================
echo       Starting AI TruthLens Forensic Suite
echo ==========================================
echo.

:: Check if node_modules exists, if not install
if not exist "node_modules\" (
    echo Installing dependencies, please wait...
    call npm install
)

echo Starting server...
echo.
echo Opening app in your browser at http://localhost:3000
start http://localhost:3000

call npm run dev
pause
