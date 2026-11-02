@echo off
echo ========================================================
echo  Launching MicroPS Protocol Studio on Localhost
echo ========================================================
cd /d "%~dp0protocol-studio"
echo Starting development server at http://127.0.0.1:5173/ ...
npm run dev -- --host 127.0.0.1 --port 5173
pause
