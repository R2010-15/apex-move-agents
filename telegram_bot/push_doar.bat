@echo off
chcp 65001 >nul
title Apex Move - push GitHub
cd /d "%~dp0.."

echo --- PUSH (cu cod) --- > push_log.txt
git push -u origin main >> push_log.txt 2>&1
echo PUSH_GATA >> push_log.txt

echo.
echo Gata. Vezi push_log.txt
pause
