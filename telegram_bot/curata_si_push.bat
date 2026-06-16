@echo off
chcp 65001 >nul
title Apex Move - curat si push
set GCM_GITHUB_AUTHMODES=device

echo Inchid procese git blocate...
taskkill /F /IM git-credential-manager.exe >nul 2>&1
taskkill /F /IM git.exe >nul 2>&1

cd /d "%~dp0.."
del /f /q ".git\index.lock" >nul 2>&1

echo --- PUSH curat --- > push_log2.txt
git push -u origin main >> push_log2.txt 2>&1
echo PUSH_GATA >> push_log2.txt

echo.
echo Gata. Daca apare fereastra GitHub, alege "Sign in with a code".
pause
