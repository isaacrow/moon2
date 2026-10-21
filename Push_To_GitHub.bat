@echo off
title Push MOON2 to GitHub
cd /d "%~dp0"
echo ===================================================
echo  Pushing MOON2 to https://github.com/ISAACROW/moon2
echo ===================================================
echo.
git push -u origin main --force
echo.
if %ERRORLEVEL% equ 0 (
  echo [SUCCESS] MOON2 pushed successfully to GitHub!
) else (
  echo [NOTE] If prompted for credentials, please sign in with your GitHub account
  echo or provide your GitHub Personal Access Token (PAT).
)
pause
