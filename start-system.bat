@echo off
echo 🚀 Starting Mental Health Depression Detection System
echo ================================================

echo.
echo 📍 Current directory: %cd%
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Start Backend Server
echo.
echo 🔧 Starting Backend Server...
start "Mental Health Backend" cmd /c "cd backend && npm install && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 >nul

REM Start AI Engine
echo.
echo 🤖 Starting AI Engine...
start "Mental Health AI Engine" cmd /c "cd ai-engine && python setup.py && .venv\Scripts\activate && python app.py"

echo.
echo 🎉 System is starting up!
echo.
echo 📝 Services:
echo   Backend:   http://localhost:5000
echo   AI Engine: http://localhost:5001
echo.
echo ⚠️  Important Notes:
echo   1. Make sure MongoDB is running
echo   2. Add your Gemini API key to ai-engine\.env
echo   3. Both terminal windows will open - don't close them
echo.
echo Press any key to continue...
pause >nul
