@echo off
echo ====================================
echo MLMS Backend Setup Script
echo ====================================
echo.

cd backend

echo Step 1: Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Please ensure Python 3.8+ is installed
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment activated
echo.

echo Step 3: Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo ====================================
echo Backend Setup Complete! ✓
echo ====================================
echo.
echo Next steps:
echo 1. Run start_backend.bat to start the backend server
echo 2. Run setup_frontend.bat to setup the frontend
echo.
pause

