#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🟠 APEX MOVE — Bot de Telegram cu echipa de agenți AI
Motor: Groq (gratis, fără card).
Vorbești cu toți agenții (Administrator + 6 specialiști) direct din Telegram.

Agenții sunt încărcați automat din folderul ../.claude/agents/*.md
Dacă editezi un agent acolo, botul folosește versiunea nouă la repornire.
"""

import os
import re
import asyncio
import logging
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters,
)

# ---------------------------------------------------------------------------
# Configurare
# ---------------------------------------------------------------------------
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
MAX_HISTORY = 12  # câte mesaje ținem minte per conversație

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("apex-bot")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


# ---------------------------------------------------------------------------
# Găsirea folderului cu agenți
# ---------------------------------------------------------------------------
def _resolve_agents_dir() -> Path:
    here = Path(__file__).resolve().parent
    candidates = []
    if os.getenv("AGENTS_DIR"):
        candidates.append(Path(os.getenv("AGENTS_DIR")))
    candidates.append(here.parent / ".claude" / "agents")
    candidates.append(here / "agents")
    for c in candidates:
        if c.exists():
            return c
    return here.parent / ".claude" / "agents"


AGENTS_DIR = _resolve_agents_dir()

# id scurt (folosit la comenzi) -> numele fișierului din .claude/agents
AGENT_FILES = {
    "admin":    "apex-admin.md",
    "manager":  "apex-manager.md",
    "continut": "apex-continut.md",
    "design":   "apex-design.md",
    "video":    "apex-video-smm.md",
    "capcut":   "apex-capcut.md",
    "strateg":  "apex-strateg.md",
}

AGENT_EMOJI = {
    "admin": "👑", "manager": "🧠", "continut": "💡", "design": "🎨",
    "video": "📱", "capcut": "✂️", "strateg": "🔎",
}

AGENT_LABEL = {
    "admin": "Administrator", "manager": "Manager", "continut": "Conținut & Idei",
    "design": "Design", "video": "Video & SMM", "capcut": "Editare CapCut",
    "strateg": "Analist Concurență",
}


def parse_agent_file(path: Path) -> str:
    """Întoarce corpul (system prompt) fără frontmatter-ul YAML dintre --- ---."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n.*?\n---\s*\n(.*)$", text, re.DOTALL)
    return (m.group(1) if m else text).strip()


def load_agents() -> dict:
    agents = {}
    for key, filename in AGENT_FILES.items():
        path = AGENTS_DIR / filename
        if path.exists():
            agents[key] = parse_agent_file(path)
        else:
            log.warning("Lipsește fișierul de agent: %s", path)
            agents[key] = f"Ești agentul {AGENT_LABEL.get(key, key)} al brandului Apex Move."
    return agents


AGENTS = load_agents()

# Stare per chat: agentul curent + istoric
chat_agent: dict[int, str] = {}
chat_history: dict[int, list] = {}


# ---------------------------------------------------------------------------
# Tastatura de selecție a agentului
# ---------------------------------------------------------------------------
def agent_keyboard() -> InlineKeyboardMarkup:
    rows, row = [], []
    for key in AGENT_FILES:
        row.append(InlineKeyboardButton(
            f"{AGENT_EMOJI[key]} {AGENT_LABEL[key]}", callback_data=f"agent:{key}"
        ))
        if len(row) == 2:
            rows.append(row); row = []
    if row:
        rows.append(row)
    return InlineKeyboardMarkup(rows)


def current_agent(chat_id: int) -> str:
    return chat_agent.get(chat_id, "admin")  # implicit: Administratorul


# ---------------------------------------------------------------------------
# Comenzi
# ---------------------------------------------------------------------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_agent[update.effective_chat.id] = "admin"
    chat_history[update.effective_chat.id] = []
    await update.message.reply_text(
        "🟠 *APEX MOVE — Echipa de agenți AI*\n\n"
        "Vorbești cu toți agenții direct de aici. Implicit ești conectat la "
        "👑 *Administrator*, care dirijează totul către agentul potrivit.\n\n"
        "Alege un agent sau scrie-mi direct ce vrei:",
        parse_mode="Markdown",
        reply_markup=agent_keyboard(),
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "*Comenzi:*\n"
        "/start – pornește / resetează\n"
        "/agenti – alege agentul din meniu\n"
        "/admin – 👑 Administrator (dirijează tot)\n"
        "/manager – 🧠 Manager (planuri)\n"
        "/continut – 💡 Idei & conținut\n"
        "/design – 🎨 Design\n"
        "/video – 📱 Video & SMM\n"
        "/capcut – ✂️ Editare CapCut\n"
        "/strateg – 🔎 Analiză concurență + strategie\n"
        "/reset – șterge istoricul conversației\n\n"
        "Scrie orice mesaj și agentul curent îți răspunde.",
        parse_mode="Markdown",
    )


async def agenti_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Alege agentul:", reply_markup=agent_keyboard())


async def reset_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_history[update.effective_chat.id] = []
    await update.message.reply_text("🧹 Istoricul a fost șters. O luăm de la zero.")


def make_switch(key: str):
    async def handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_agent[update.effective_chat.id] = key
        chat_history[update.effective_chat.id] = []
        await update.message.reply_text(
            f"{AGENT_EMOJI[key]} Acum vorbești cu *{AGENT_LABEL[key]}*. Spune-mi ce ai nevoie.",
            parse_mode="Markdown",
        )
    return handler


async def on_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    key = query.data.split(":", 1)[1]
    chat_agent[query.message.chat.id] = key
    chat_history[query.message.chat.id] = []
    await query.edit_message_text(
        f"{AGENT_EMOJI[key]} Acum vorbești cu *{AGENT_LABEL[key]}*. Spune-mi ce ai nevoie.",
        parse_mode="Markdown",
    )


# ---------------------------------------------------------------------------
# Mesaje normale -> Groq
# ---------------------------------------------------------------------------
async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    user_text = update.message.text
    key = current_agent(chat_id)
    system_prompt = AGENTS.get(key, "")

    history = chat_history.setdefault(chat_id, [])
    history.append({"role": "user", "content": user_text})
    history[:] = history[-MAX_HISTORY:]

    # Mesaje în format OpenAI/Groq: system + istoric (user/assistant)
    messages = [{"role": "system", "content": system_prompt}] + history

    await context.bot.send_chat_action(chat_id=chat_id, action="typing")

    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=1500,
            temperature=0.8,
        )
        answer = (resp.choices[0].message.content or "").strip() or "(răspuns gol)"
    except Exception as e:
        log.exception("Eroare API Groq")
        await update.message.reply_text(f"⚠️ Eroare: {e}")
        return

    history.append({"role": "assistant", "content": answer})

    prefix = f"{AGENT_EMOJI[key]} *{AGENT_LABEL[key]}*\n\n"
    full = prefix + answer
    # Telegram are limită de 4096 caractere/mesaj
    for i in range(0, len(full), 4000):
        await update.message.reply_text(full[i:i + 4000], parse_mode="Markdown")


# ---------------------------------------------------------------------------
# Health-check server (necesar pe Koyeb/Render — vor un port deschis)
# ---------------------------------------------------------------------------
class _HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Apex Move bot is alive")

    def log_message(self, *args):
        pass


def start_health_server():
    port = int(os.getenv("PORT", "0"))
    if not port:
        return
    server = HTTPServer(("0.0.0.0", port), _HealthHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    log.info("🌐 Health server pe portul %s", port)


# ---------------------------------------------------------------------------
# Pornire
# ---------------------------------------------------------------------------
def main():
    if not TELEGRAM_TOKEN or not GROQ_API_KEY:
        raise SystemExit(
            "Lipsește TELEGRAM_TOKEN sau GROQ_API_KEY. "
            "Completează fișierul .env (vezi .env.example)."
        )

    # Asigurăm un event loop (Python 3.12+ nu-l mai creează automat)
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        asyncio.set_event_loop(asyncio.new_event_loop())

    start_health_server()

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("agenti", agenti_cmd))
    app.add_handler(CommandHandler("reset", reset_cmd))
    for key in AGENT_FILES:
        app.add_handler(CommandHandler(key, make_switch(key)))
    app.add_handler(CallbackQueryHandler(on_button, pattern=r"^agent:"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_message))

    log.info("✅ Apex Move bot pornit (Groq: %s). Agenți: %s", MODEL, ", ".join(AGENTS))
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
