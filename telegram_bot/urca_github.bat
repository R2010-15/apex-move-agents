@echo off
chcp 65001 >nul
title Apex Move - urc pe GitHub
cd /d "%~dp0.."

echo === Apex Move: urc pe GitHub === > push_log.txt
git --version >> push_log.txt 2>&1
if not exist ".git" git init >> push_log.txt 2>&1
git config user.email "anonimrobert41@gmail.com" >> push_log.txt 2>&1
git config user.name "Robert" >> push_log.txt 2>&1
git branch -M main >> push_log.txt 2>&1
git add -A >> push_log.txt 2>&1
git commit -m "Apex Move - echipa de agenti AI" >> push_log.txt 2>&1
git remote remove origin >nul 2>&1
git remote add origin https://github.com/R2010-15/apex-move-agents.git >> push_log.txt 2>&1
echo --- PUSH --- >> push_log.txt
git push -u origin main >> push_log.txt 2>&1
echo PUSH_GATA >> push_log.txt

echo.
echo Gata. Daca apare o fereastra de login GitHub, apasa Authorize / Sign in.
pause
