@echo off
chcp 65001 >nul
title Apex Move - Bot Telegram
cd /d "%~dp0"

echo ============================================
echo   APEX MOVE - pornesc botul de Telegram
echo ============================================
echo.

REM Folosim Python 3.11 (stabil cu biblioteca de Telegram).
echo [1/2] Instalez dependintele pe Python 3.11... (scriu in setup_log.txt)
py -3.11 -m pip install -r requirements.txt > setup_log.txt 2>&1
echo SETUP_GATA >> setup_log.txt

echo [2/2] Pornesc botul (scriu in bot_log.txt). Lasa fereastra DESCHISA.
py -3.11 -u apex_bot.py > bot_log.txt 2>&1

echo.
echo Botul s-a oprit. Vezi bot_log.txt pentru detalii. Apasa o tasta.
pause >nul
