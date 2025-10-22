@echo off
echo 🚀 Starting EventSphere...

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first.
    echo    You can start MongoDB from the Start Menu or run: net start MongoDB
    echo.
    pause
)

REM Check if .env file exists
if not exist "server\.env" (
    echo ⚠️  No .env file found in server directory.
    echo    Please copy .env.example to .env and configure it:
    echo    copy server\.env.example server\.env
    echo    Then edit server\.env with your configuration
    echo.
    pause
)

echo 📦 Installing dependencies...

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
cd ..

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
cd ..

echo ✅ Dependencies installed!
echo.
echo 🌐 Starting services...
echo    Server will run on: http://localhost:5003
echo    Client will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both services
echo.

REM Start server in background
cd server
start "EventSphere Server" cmd /k "npm run dev"
cd ..

REM Start client
cd client
start "EventSphere Client" cmd /k "npm run dev"
cd ..

echo ✅ Services started! Check the opened terminal windows.
echo Press any key to exit this script...
pause >nul
