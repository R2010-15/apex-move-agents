# Dockerfile pentru Apex Move Telegram Bot (Koyeb / orice host Docker)
FROM python:3.12-slim

WORKDIR /app

# Copiem tot proiectul (botul + folderul .claude/agents cu definițiile agenților)
COPY . .

RUN pip install --no-cache-dir -r telegram_bot/requirements.txt

# Koyeb setează automat variabila PORT; botul pornește un mic health-check pe ea
CMD ["python", "telegram_bot/apex_bot.py"]
