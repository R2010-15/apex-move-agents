# 🚀 DEPLOY pe KOYEB — Agenții Apex Move 24/7 (gratis)

Pui botul pe un server gratuit care **stă pornit non-stop**, fără să-ți ții PC-ul deschis. Durează ~20 min. Faci o singură dată.

Koyeb construiește automat proiectul din `Dockerfile` (pe care l-am pregătit deja) și pornește botul.

---

## De ce ai nevoie
1. Cont **GitHub** (gratis) — acolo urci codul
2. Cont **Koyeb** (gratis) — acolo rulează botul
3. **Tokenul** de la BotFather + **cheia Google Gemini** (gratis, din GHID_TELEGRAM.md)

> ⚠️ NU urca niciodată fișierul `.env` pe GitHub. L-am exclus deja prin `.gitignore`. Cheile le pui direct în Koyeb (Pasul 3).

---

## PASUL 1 — Urcă proiectul pe GitHub
Cel mai simplu, cu aplicația **GitHub Desktop** (fără comenzi):
1. Instalează GitHub Desktop și loghează-te.
2. *File → Add Local Repository* → alege folderul `agenti Apex move`.
3. Te întreabă să-l inițializezi ca repo → *Create a repository* → **Publish**.
4. **Bifează „Keep this code private"** (e privat, doar al tău).

Acum codul tău e pe GitHub. (Fișierul `.env` NU se urcă — e protejat.)

---

## PASUL 2 — Creează serviciul pe Koyeb
1. Intră pe **koyeb.com** → *Sign up* (poți cu contul GitHub).
2. *Create Service → GitHub*.
3. Autorizează Koyeb să-ți vadă repo-urile și alege repo-ul `agenti Apex move`.
4. Koyeb detectează `Dockerfile`-ul automat. Lasă setările implicite.
5. La **Instance**, alege tipul **Free** (Nano).

---

## PASUL 3 — Pune cheile (Environment variables)
La secțiunea **Environment variables**, adaugă:

| Nume | Valoare |
|------|---------|
| `TELEGRAM_TOKEN` | tokenul de la BotFather |
| `GEMINI_API_KEY` | cheia ta Google Gemini |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

> Pune-le ca **Secret** dacă Koyeb îți dă opțiunea — sunt date sensibile.

---

## PASUL 4 — Pornește
1. Apasă **Deploy**.
2. Așteaptă să se construiască (2-4 min). În *Logs* trebuie să apară:
   `✅ Apex Move bot pornit` și `🌐 Health server pe portul ...`
3. Gata! Deschide Telegram, intră la botul tău, scrie `/start`. Acum răspunde **24/7**, chiar dacă închizi PC-ul. 🎉

---

## Cum actualizezi agenții pe viitor
Modifici un fișier din `.claude/agents/` (sau orice altceva) pe PC → în GitHub Desktop apeși **Commit** apoi **Push**. Koyeb redeployează automat versiunea nouă în câteva minute.

---

## Probleme frecvente
- **Build failed** → verifică în Logs; de obicei lipsește o cheie în Environment variables.
- **Botul nu răspunde** → verifică în Logs că scrie „bot pornit"; verifică `TELEGRAM_TOKEN`.
- **Eroare de API** → cheia Gemini greșită; ia alta de pe aistudio.google.com/apikey.
- **Serviciul „sleeps"** → asigură-te că ai ales instanța Free corectă și că health-check-ul răspunde (apare în Logs).

---

## Alternative (dacă vrei altă variantă)
- **Railway** — și mai simplu de pornit, dar gratis doar ~5$ credit/lună (apoi cost mic). Același `Dockerfile` funcționează.
- **Oracle Cloud Always Free** — server real, gratis permanent, dar setup mai lung. Spune-mi dacă vrei pașii.
