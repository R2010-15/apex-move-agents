# 📲 GHID — Agenții Apex Move pe Telegram

Acest ghid te duce de la zero la „vorbesc cu toți agenții din Telegram". Durează ~15 minute. Nu trebuie să fii programator — doar urmează pașii în ordine.

---

## Ce primești
Un bot de Telegram cu **toți cei 7 agenți** (👑 Administrator + 🧠 Manager + 💡 Conținut + 🎨 Design + 📱 Video&SMM + ✂️ CapCut + 🔎 Analist). Le scrii, îți răspund. Schimbi agentul dintr-un meniu sau cu o comandă.

---

## De ce ai nevoie (2 lucruri, ambele GRATIS)
1. **Token de bot** de la Telegram (gratis)
2. **Cheie Google Gemini** (gratis, FĂRĂ card — doar cont Google) de la aistudio.google.com/apikey

---

## PASUL 1 — Creează botul în Telegram (gratis)
1. Deschide Telegram și caută **@BotFather** (cel cu bifă albastră).
2. Scrie-i `/newbot`.
3. Dă-i un nume (ex: `Apex Move AI`).
4. Dă-i un username care se termină în `bot` (ex: `apexmove_ai_bot`).
5. BotFather îți dă un **token** de forma `123456789:AAE...`. **Copiază-l** — e secret.

---

## PASUL 2 — Ia cheia Google Gemini (GRATIS, fără card)
1. Intră pe **aistudio.google.com/apikey** și loghează-te cu contul Google.
2. Apasă **Create API key** (Creează cheie API).
3. Copiază cheia. Asta e — fără card, fără plată.

---

## PASUL 3 — Instalează (o singură dată)
Ai nevoie de **Python 3.10+** instalat (python.org → la instalare bifează „Add to PATH").

Deschide un terminal (pe Windows: caută „cmd") și rulează:
```
cd "C:\Users\diana\Claude\Projects\agenti Apex move\telegram_bot"
pip install -r requirements.txt
```

---

## PASUL 4 — Pune cheile tale
1. În folderul `telegram_bot`, copiază fișierul `.env.example` și redenumește copia în `.env`.
2. Deschide `.env` cu Notepad și completează:
```
TELEGRAM_TOKEN=tokenul_de_la_botfather
GEMINI_API_KEY=cheia_ta_gemini
GEMINI_MODEL=gemini-2.5-flash
```
3. Salvează.

> 🔒 Fișierul `.env` conține secrete — nu-l trimite nimănui și nu-l urca pe internet.

---

## PASUL 5 — Pornește botul = ACTIVAREA agenților
Cel mai simplu: **dublu-click pe `start_bot.bat`** din folderul `telegram_bot`. Se deschide o fereastră neagră care instalează tot și pornește botul.

(Sau, manual, în terminal: `python apex_bot.py`.)

Când vezi `✅ Apex Move bot pornit`, agenții sunt activi.

Acum deschide Telegram, intră la botul tău și scrie `/start`. Gata — vorbești cu agenții! 🎉

> ⚠️ Botul funcționează **cât timp terminalul rămâne deschis** și calculatorul e pornit. Închizi terminalul → botul se oprește. (Mai jos: cum îl ții pornit 24/7.)

---

## Cum vorbești cu agenții
- `/start` – pornește și îți arată meniul cu agenți
- `/agenti` – alegi agentul din butoane
- Implicit ești pe 👑 **Administrator** — îi spui orice și el dirijează către agentul potrivit
- Comenzi directe: `/manager`, `/continut`, `/design`, `/video`, `/capcut`, `/strateg`
- `/reset` – șterge istoricul conversației
- Orice mesaj normal = răspunde agentul curent

**Exemple de scris în Telegram:**
- „Admin, vreau să lansez colecția nouă" (Administratorul cheamă mai mulți agenți)
- `/continut` apoi „dă-mi 10 idei de Reels pe azi"
- `/strateg` apoi „analizează [3 conturi concurente] și fă-mi strategia"

---

## Cum modifici un agent
Agenții sunt încărcați automat din folderul `..\.claude\agents\` (apex-admin.md, apex-continut.md etc.). Editezi textul de acolo, repornești botul (`python apex_bot.py`), și agentul folosește versiunea nouă.

---

## (Opțional) Să meargă 24/7
Ca botul să fie mereu online fără să-ți ții PC-ul pornit, îl pui pe un server ieftin:
- **Railway** sau **Render** (au plan gratuit/foarte ieftin) — urci folderul și rulezi `python apex_bot.py`
- **Un VPS** (ex: Hetzner, ~4€/lună) cu `screen`/`systemd` ca să ruleze non-stop
- Spune-mi pe care vrei și îți fac pașii exacți de deploy.

---

## Probleme frecvente
- **„Lipsește TELEGRAM_TOKEN..."** → n-ai completat `.env` sau l-ai numit greșit (trebuie exact `.env`).
- **Botul nu răspunde** → verifică în terminal că scrie „bot pornit"; verifică tokenul.
- **Eroare de API** → cheia Gemini greșită; ia alta de pe aistudio.google.com/apikey.
- **`pip` necunoscut** → reinstalează Python bifând „Add to PATH".
