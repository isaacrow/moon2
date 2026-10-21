@echo off
title Moon Editor
cd /d "%~dp0"
echo Starting Moon Editor...
set "PATH=C:\Program Files\nodejs;%PATH%"
start http://localhost:5173
call npm.cmd run dev
pause
