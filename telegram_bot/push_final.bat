@echo off
chcp 65001 >nul
title Apex Move - push final
taskkill /F /IM git-credential-manager.exe >nul 2>&1
cd /d "%~dp0.."
del /f /q ".git\index.lock" >nul 2>&1
echo --- PUSH final --- > push_final.txt
git push -u origin main >> push_final.txt 2>&1
echo PUSH_GATA >> push_final.txt
echo.
echo Daca apare fereastra GitHub, alege "Sign in with your browser".
pause
