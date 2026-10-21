@echo off
chcp 65001 >nul
title رفع مشروع MOON 2 إلى GitHub
cd /d "%~dp0"
echo ================================================================
echo   رفع منظومة MOON 2 الموحدة إلى https://github.com/isaacrow/moon2
echo ================================================================
echo.
echo [1] محاولة الرفع المباشر عبر تسجيل الدخول بالمتصفح (Git Credential Manager)
echo [2] إدخال GitHub Personal Access Token (PAT) مباشرة
echo.
set /p choice="اختر طريقة الرفع [1 أو 2]: "

if "%choice%"=="2" goto with_token

:direct
echo.
echo جاري الرفع المباشر...
git push -u origin main --force
if %ERRORLEVEL% equ 0 goto success
echo.
echo [ملاحظة] فشل الرفع المباشر أو لم يتم التعرف على الحساب.
goto with_token

:with_token
echo.
echo ================================================================
echo أدخل رمز GitHub Personal Access Token (يبدأ بـ ghp_):
echo (يمكنك إنشاؤه من: github.com -> Settings -> Developer settings -> Personal access tokens)
echo ================================================================
set /p token="GitHub Token: "
if "%token%"=="" goto end

echo.
echo جاري الرفع باستخدام التوكن...
git push https://%token%@github.com/isaacrow/moon2.git main --force
if %ERRORLEVEL% equ 0 goto success
goto end

:success
echo.
echo ================================================================
echo   [SUCCESS] تم رفع المشروع بنجاح إلى https://github.com/isaacrow/moon2 !
echo ================================================================
pause
exit /b

:end
echo.
echo حدث خطأ أثناء عملية الرفع. يرجى التأكد من صلاحيات التوكن (repo scope).
pause
