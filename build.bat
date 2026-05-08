@echo off
cd /d "%~dp0frontend"
echo Installing frontend dependencies...
call npm install
echo Building frontend...
call npm run build
echo Build complete.
dir dist
