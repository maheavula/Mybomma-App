@echo off
cd /d "%~dp0"
echo ========================================================
echo   MYbomma - Cinema & Video Streaming Platform
echo ========================================================
echo.

echo [1/3] Running: npm run install:all
call npm run install:all
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Installation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Running: npm run build
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Running: npm run dev
call npm run dev
