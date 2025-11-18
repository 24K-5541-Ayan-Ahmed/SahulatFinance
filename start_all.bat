@echo off
setlocal

REM Resolve repo root
set ROOT=%~dp0

echo ====================================
echo Starting MLMS full stack environment
echo ====================================
echo.

REM Launch backend server in new window
if exist "%ROOT%backend\venv\Scripts\activate.bat" (
    start "MLMS Backend" cmd /k "cd /d %ROOT%backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
) else (
    echo [!] Backend virtual environment not found.
    echo     Please run setup_backend.bat first.
    goto skip_frontend
)

echo Backend launching at http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.

:skip_frontend

REM Launch frontend dev server in new window
if exist "%ROOT%frontend\package.json" (
    start "MLMS Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"
    echo Frontend launching at http://localhost:3000
) else (
    echo [!] Frontend folder not found. Please check your setup.
)

echo.
echo Both servers are starting in their own windows.
echo Close this window if you don't need it anymore.
echo ====================================

endlocal

