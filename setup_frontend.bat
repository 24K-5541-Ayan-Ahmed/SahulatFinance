@echo off
echo ====================================
echo MLMS Frontend Setup Script
echo ====================================
echo.

cd frontend

echo Installing Node.js dependencies...
echo This may take a few minutes...
echo.

npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    echo Please ensure Node.js 16+ is installed
    pause
    exit /b 1
)

echo.
echo ====================================
echo Frontend Setup Complete! ✓
echo ====================================
echo.
echo Next steps:
echo 1. Run start_backend.bat (if not already running)
echo 2. Run start_frontend.bat to start the frontend
echo.
pause

