@echo off
title علقمي - تشغيل الخادم ونفق Cloudflare السحابي (trycloudflare.com)
echo =====================================================================
echo   علقمي (Alqami) - منظومة فهرسة المخطوطات المعيارية
echo   تشغيل الخادم مع نفق Cloudflare السحابي (trycloudflare.com)
echo =====================================================================
echo.
echo [1] بدء تشغيل خادم علقمي...
start "" "http://localhost:3456"
start /B node "D:\MAN\viewer_server.js"
timeout /t 2 /nobreak >nul
echo.
echo [2] تشغيل نفق Cloudflare السحابي العالمي...
echo سيبدأ الرابط السحابي بالظهور أدناه وسيعمل فوراً على أي جهاز حول العالم:
echo ---------------------------------------------------------------------
"D:\MAN\cloudflared.exe" tunnel --edge-ip-version 4 --url http://localhost:3456
pause
