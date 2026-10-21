@echo off
title MOON 2 Platform - Dev Server
cd /d "%~dp0"
echo ===================================================
echo  Starting MOON 2 Unified Platform (Vite)
echo ===================================================
echo  - Main Studio & OPAC: http://localhost:5173/
echo  - 3D Spatial OPAC:    http://localhost:5173/
echo  - Mobile AR View:     http://localhost:5173/mobile/
echo  - Standalone AR:      http://localhost:5173/ar-viewer.html
echo ===================================================
start "" "http://localhost:5173/"
npm run dev
pause
