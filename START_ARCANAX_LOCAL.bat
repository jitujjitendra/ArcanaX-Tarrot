@echo off
setlocal
cd /d "%~dp0"
node "%~dp0local-preview-server.mjs"
echo.
echo Local preview stopped. You can close this window.
pause
