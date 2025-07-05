@echo off
REM Energy Meter Dashboard Setup Script for Windows
REM This script helps set up the React frontend for the Energy Meter Dashboard

echo 🔌 Energy Meter Dashboard - Frontend Setup
echo ========================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✅ npm is installed

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo ⚙️  Creating environment configuration...
    (
        echo # Energy Meter Dashboard Configuration
        echo VITE_API_BASE_URL=http://localhost:3000/api
        echo VITE_WS_URL=ws://localhost:3000/realtime/stream
        echo VITE_APP_NAME=Energy Meter Dashboard
        echo VITE_APP_VERSION=1.0.0
    ) > .env
    echo ✅ Environment file created (.env^)
) else (
    echo ✅ Environment file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Ensure the backend server is running on http://localhost:3000
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Open your browser and navigate to:
echo    http://localhost:3001
echo.
echo 📚 Additional commands:
echo    npm run build    - Build for production
echo    npm run preview  - Preview production build
echo    npm run lint     - Run code linting
echo.
echo 🔗 Useful links:
echo    Backend API: http://localhost:3000/health
echo    WebSocket Test: ws://localhost:3000/realtime/stream
echo.
echo Happy coding! 🚀
pause
