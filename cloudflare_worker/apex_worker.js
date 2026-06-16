// 🟠 APEX MOVE — Bot Telegram pe Cloudflare Workers (v4)
// Groq (text) + Workers AI (imagini) + KV (memorie + setari) + Cron (treaba zilnica).
// 12 agenti, comenzi multiple, setari, grup comun, postare automata zilnica.
//
// Variabile: TELEGRAM_TOKEN, GROQ_API_KEY, (optional) GROQ_MODEL
// Bindings:  AI (Workers AI), APEX_KV (KV)
// Trigger:   Cron (ex: 0 4 * * *  = 07:00 in Moldova)

const BRAND =
  "Brand de haine sportive Apex Move (fondator Robert, 18 ani, sportiv si antreprenor). " +
  "Public: tineri 14-25 ani, activi, sport, ambitie. Ton: energic, autentic, motivational, fara limbaj corporativ. Limba: romana.";

const KNOWLEDGE =
  " CUNOSTINTE (foloseste-le concret): Hook-uri puternice (intrebare socanta, promisiunea unui rezultat, o greseala comuna, 'POV:', 'Nimeni nu iti spune ca...'). " +
  "Primele 2-3 secunde decid retentia. Minim 1 postare/zi, 5-9 Reels/saptamana. Ore bune: 7-9, 12-14, 19-22. " +
  "Salvarile si share-urile > like-uri. Formate care viralizeaza in sportwear: transformare/before-after, day-in-the-life, produsul in actiune, behind-the-scenes, challenge. " +
  "Hashtaguri: 3-5 relevante + nisa (#apexmove #sportwear #fitnessmotivation). Mereu un singur CTA clar. Foloseste povestea reala a lui Robert.";

const AGENTS = {
  admin: { emoji: "\u{1F451}", label: "Administrator",
    prompt: "Esti ADMINISTRATORUL (seful) echipei. " + BRAND + " Punct unic de intrare: primesti orice cerere, o descompui, o rezolvi sau spui ce agent o preia. Raspuns: plan scurt + rezultate concrete + urmatorii pasi. Maxim 3 prioritati." + KNOWLEDGE },
  manager: { emoji: "\u{1F9E0}", label: "Manager",
    prompt: "Esti MANAGERUL. " + BRAND + " Transformi obiective in planuri pe pasi, faci planul saptamanal/lunar, aloci sarcini. Format: Obiectiv / Plan (zile) / TOP 3 prioritati / De urmarit." + KNOWLEDGE },
  continut: { emoji: "\u{1F4A1}", label: "Continut & Idei",
    prompt: "Esti generatorul de IDEI & CONTINUT. " + BRAND + " Idei de postari, scripturi Reels/TikTok, calendare. Fiecare idee porneste de la hook, filmabila cu telefonul. Format idee: Titlu / Tip / Hook / Ce filmezi / Text pe ecran / CTA." + KNOWLEDGE },
  design: { emoji: "\u{1F3A8}", label: "Design",
    prompt: "Esti DESIGNERUL. " + BRAND + " Concepte vizuale, postari, identitate grafica. Culori: negru/grafit + accent (portocaliu energic sau verde electric). Bold, contrast mare. Format: Concept / Layout / Culori / Text / Font / Format. Pentru imagine reala indica /imagine." },
  video: { emoji: "\u{1F4F1}", label: "Video & SMM",
    prompt: "Esti STRATEGUL de social media & video. " + BRAND + " Crestere, hook-uri, caption-uri, hashtaguri, strategie TikTok/Instagram/YouTube. Format: Platforma / Hook / Caption / Hashtags / Ora / CTA / De testat." + KNOWLEDGE },
  capcut: { emoji: "\u{2702}\u{FE0F}", label: "Editare CapCut",
    prompt: "Esti EDITORUL VIDEO (CapCut). " + BRAND + " Montaj pas-cu-pas cu timpi: import, taieturi, text pe ecran, tranzitii, muzica pe beat, Auto Captions, export 1080x1920 30fps. Structura: 0-2s hook, 2-5s promisiune, 5-15s taieturi rapide, 15-20s CTA." },
  strateg: { emoji: "\u{1F50E}", label: "Analist Concurenta",
    prompt: "Esti ANALISTUL de concurenta & strategie. " + BRAND + " Analizezi concurenta pe TikTok/Instagram, identifici tipare virale si golul Apex Move. Format: Analiza concurenta / Tipare in nisa / Golul Apex Move / Strategie 30 zile." + KNOWLEDGE },
  // --- agenti noi de business ---
  vanzari: { emoji: "\u{1F4B0}", label: "Vanzari",
    prompt: "Esti AGENTUL DE VANZARI. " + BRAND + " Te ocupi de conversie: mesaje de DM care vand, raspunsuri la obiectii ('e scump', 'ma mai gandesc'), oferte si pachete, follow-up, urgenta/scarcity etica. Dai scripturi gata de folosit." },
  copywriter: { emoji: "\u{270D}\u{FE0F}", label: "Copywriter",
    prompt: "Esti COPYWRITERUL. " + BRAND + " Scrii texte care vand: caption-uri, descrieri de produs, texte de reclama, email-uri, bio. Folosesti formule (AIDA, PAS), titluri puternice si CTA. Dai 2-3 variante." },
  reclame: { emoji: "\u{1F4E3}", label: "Reclame / Ads",
    prompt: "Esti SPECIALISTUL DE RECLAME (TikTok Ads & Meta Ads). " + BRAND + " Dai unghiuri de reclama, structura de creativ (hook-problema-solutie-CTA), targetare, buget de test, ce sa masori (CTR, CPC, ROAS) si idei de A/B testing." },
  produs: { emoji: "\u{1F4E6}", label: "Produs & Magazin",
    prompt: "Esti AGENTUL DE PRODUS & MAGAZIN (ecommerce). " + BRAND + " Idei de produse, nume de colectii, structura paginii de produs, preturi si oferte, optimizare conversie magazin, furnizori/print-on-demand, organizare stoc. Practic si concret." },
  colaborari: { emoji: "\u{1F91D}", label: "Colaborari",
    prompt: "Esti AGENTUL DE COLABORARI & INFLUENCERI. " + BRAND + " Gasesti tipuri de creatori potriviti, scrii mesaje de outreach care primesc raspuns, propui structuri de parteneriat (barter, comision, ambasadori), si campanii UGC." },
  finante: { emoji: "\u{1F4CA}", label: "Finante & Preturi",
    prompt: "Esti AGENTUL DE FINANTE & PRETURI. " + BRAND + " Ajuti la pretul corect (cost + marja), praguri de profit, bugete de marketing, calcule simple de break-even, reinvestire. Nu dai sfaturi de investitii; doar matematica clara a afacerii." },
};

const COMMANDS = {
  "/admin": "admin", "/manager": "manager", "/continut": "continut", "/design": "design",
  "/video": "video", "/capcut": "capcut", "/strateg": "strateg", "/vanzari": "vanzari",
  "/copywriter": "copywriter", "/reclame": "reclame", "/produs": "produs", "/colaborari": "colaborari", "/finante": "finante",
};

const QUICK = {
  "/idei": { agent: "continut", text: "Da-mi 10 idei de continut variate pentru zilele urmatoare, fiecare cu Tip, Hook si CTA." },
  "/plan": { agent: "manager", text: "Fa-mi planul de continut pe saptamana asta, pe zile, cu format si idee." },
  "/analiza": { agent: "strateg", text: "Analizeaza concurenta sportwear pe TikTok/Instagram si da-mi golul Apex Move + 3 idei de testat." },
  "/hook": { agent: "video", text: "Da-mi 7 hook-uri puternice pentru Reels Apex Move pe care le pot folosi azi." },
  "/caption": { agent: "copywriter", text: "Scrie 3 variante de caption + hashtaguri pentru o postare Apex Move de azi." },
  "/oferta": { agent: "vanzari", text: "Propune-mi 3 oferte/pachete care ar vinde pentru Apex Move acum si cum le anunt." },
};

function startText() {
  return (
    "\u{1F7E0} APEX MOVE — Echipa de agenti AI (24/7)\n\n" +
    "Scrie-mi orice si raspunde agentul curent (implicit \u{1F451} Administrator). Imi amintesc conversatia.\n\n" +
    "\u{1F465} AGENTI (schimba cu comanda, ramane setat):\n" +
    "/manager /continut /design /video /capcut /strateg\n/vanzari /copywriter /reclame /produs /colaborari /finante\n\n" +
    "⚡ RAPIDE: /idei /plan /analiza /hook /caption /oferta /azi\n\n" +
    "\u{1F5BC}\u{FE0F} /imagine <descriere> — imagine grafica\n" +
    "\u{1F451} /administrator — imaginea Administratorului\n" +
    "☀\u{FE0F} AUTOMATIZARE ZILNICA (o controlezi tu):\n" +
    "   /activeaza — PORNESTE raport automat zilnic aici\n" +
    "   /stop — OPRESTE  |  /raport — ruleaza ACUM  |  /status — vezi starea\n" +
    "⚙\u{FE0F} /setbrand <text> — adauga context despre afacerea ta\n" +
    "ℹ\u{FE0F} /info — setari curente   |   /agenti — lista   |   \u{1F9F9} /reset\n\n" +
    "Merg si in GRUP: adauga-ma intr-un grup si folositi comenzile impreuna."
  );
}
function agentiText() {
  let s = "\u{1F465} Echipa Apex Move (" + Object.keys(AGENTS).length + " agenti):\n\n";
  for (const k in AGENTS) s += AGENTS[k].emoji + " /" + k + " — " + AGENTS[k].label + "\n";
  return s;
}

// ----------------- KV: memorie + setari -----------------
async function kvGet(env, key) { try { return env.APEX_KV ? await env.APEX_KV.get(key) : null; } catch (e) { return null; } }
async function kvPut(env, key, val, ttl) { try { if (env.APEX_KV) await env.APEX_KV.put(key, val, ttl ? { expirationTtl: ttl } : undefined); } catch (e) {} }
async function getState(env, chatId) { const raw = await kvGet(env, "chat:" + chatId); return raw ? JSON.parse(raw) : { agent: "admin", history: [] }; }
async function saveState(env, chatId, s) { s.history = (s.history || []).slice(-8); await kvPut(env, "chat:" + chatId, JSON.stringify(s), 259200); }
async function getBrandExtra(env) { return (await kvGet(env, "brand_extra")) || ""; }
async function getDailyChats(env) { const raw = await kvGet(env, "daily_chats"); return raw ? JSON.parse(raw) : []; }
async function addDailyChat(env, id) { const l = await getDailyChats(env); if (!l.includes(id)) { l.push(id); await kvPut(env, "daily_chats", JSON.stringify(l)); } }
async function removeDailyChat(env, id) { let l = await getDailyChats(env); l = l.filter(function (c) { return c !== id; }); await kvPut(env, "daily_chats", JSON.stringify(l)); }

function sysPrompt(agentKey, extra) {
  return AGENTS[agentKey].prompt + (extra ? (" CONTEXT SUPLIMENTAR DESPRE AFACERE (de la Robert): " + extra) : "");
}

// ----------------- Groq -----------------
async function callGroq(env, systemPrompt, history, userText) {
  const model = (env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();
  const messages = [{ role: "system", content: systemPrompt }].concat(history || []).concat([{ role: "user", content: userText }]);
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.GROQ_API_KEY },
    body: JSON.stringify({ model: model, max_tokens: 1500, temperature: 0.8, messages: messages }),
  });
  if (!r.ok) return "⚠️ Eroare Groq (" + r.status + "). Incearca din nou.";
  const data = await r.json();
  return (data.choices && data.choices[0] && data.choices[0].message.content) || "(raspuns gol)";
}

// ----------------- Imagini -----------------
async function generateImageBytes(env, prompt) {
  const out = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt: prompt, steps: 4 });
  const b64 = out && out.image ? out.image : null;
  if (!b64) throw new Error("fara imagine");
  const bin = atob(b64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ----------------- Telegram -----------------
async function sendMessage(env, chatId, text) {
  for (let i = 0; i < text.length; i += 4000) {
    await fetch("https://api.telegram.org/bot" + env.TELEGRAM_TOKEN + "/sendMessage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(i, i + 4000) }),
    });
  }
}
async function sendChatAction(env, chatId, action) {
  try { await fetch("https://api.telegram.org/bot" + env.TELEGRAM_TOKEN + "/sendChatAction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, action: action }) }); } catch (e) {}
}
async function sendPhoto(env, chatId, bytes, caption) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  if (caption) form.append("caption", caption);
  form.append("photo", new Blob([bytes], { type: "image/jpeg" }), "apexmove.jpg");
  await fetch("https://api.telegram.org/bot" + env.TELEGRAM_TOKEN + "/sendPhoto", { method: "POST", body: form });
}
async function doImage(env, chatId, desc, caption) {
  await sendChatAction(env, chatId, "upload_photo");
  try {
    const bytes = await generateImageBytes(env, "Sport fashion brand poster, Apex Move, energetic, bold, high contrast, black and orange accents, dynamic. " + desc);
    await sendPhoto(env, chatId, bytes, caption || ("\u{1F3A8} Apex Move — " + desc));
  } catch (e) { await sendMessage(env, chatId, "⚠️ Nu am putut genera imaginea acum. Mai incearca."); }
}

// ----------------- Handler -----------------
async function handleUpdate(update, env) {
  const msg = update.message || update.edited_message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
  let text = msg.text.trim();
  const firstWord = text.split(/\s+/)[0].toLowerCase().replace(/@.*$/, "");
  if (isGroup && firstWord[0] !== "/") return;

  if (firstWord === "/start" || firstWord === "/help") { await sendMessage(env, chatId, startText()); return; }
  if (firstWord === "/agenti") { await sendMessage(env, chatId, agentiText()); return; }
  if (firstWord === "/reset") { await saveState(env, chatId, { agent: "admin", history: [] }); await sendMessage(env, chatId, "\u{1F9F9} Am uitat conversatia. O luam de la zero."); return; }
  if (firstWord === "/activeaza") { await addDailyChat(env, chatId); await sendMessage(env, chatId, "☀️ Gata! Primesti AUTOMAT continut Apex Move aici in fiecare dimineata (idei + poster). /stop opreste."); return; }
  if (firstWord === "/stop") { await removeDailyChat(env, chatId); await sendMessage(env, chatId, "\u{1F6D1} Am oprit continutul zilnic automat aici."); return; }
  if (firstWord === "/raport") {
    await sendChatAction(env, chatId, "typing");
    const r = await buildDailyReport(env);
    await sendMessage(env, chatId, r.report);
    if (r.img) await sendPhoto(env, chatId, r.img, "\u{1F3A8} Posterul zilei");
    return;
  }
  if (firstWord === "/status") {
    const dc = await getDailyChats(env);
    const on = dc.indexOf(chatId) !== -1;
    await sendMessage(env, chatId, "\u{2699}\u{FE0F} Automatizare zilnica aici: " + (on ? "PORNITA \u{2705}  (opresti cu /stop)" : "OPRITA  (pornesti cu /activeaza)") + "\nRulezi manual oricand: /raport");
    return;
  }
  if (firstWord === "/setbrand") {
    const v = text.replace(/^\/setbrand(@\S+)?/i, "").trim();
    if (!v) { const cur = await getBrandExtra(env); await sendMessage(env, chatId, cur ? ("Context actual:\n" + cur) : "Scrie dupa comanda detalii despre afacerea ta, ex: /setbrand vand tricouri si hanorace, pret 250-450 lei, vand pe Instagram si TikTok."); return; }
    await kvPut(env, "brand_extra", v); await sendMessage(env, chatId, "⚙️ Am salvat contextul. Toti agentii il vor folosi de acum.");
    return;
  }
  if (firstWord === "/info") {
    const extra = await getBrandExtra(env); const dc = await getDailyChats(env); const st = await getState(env, chatId);
    await sendMessage(env, chatId, "ℹ️ Setari Apex Move\n\nAgent curent: " + (AGENTS[st.agent] ? AGENTS[st.agent].label : "Administrator") + "\nContext afacere: " + (extra ? extra : "(neсetat)") + "\nChat-uri cu continut zilnic: " + dc.length);
    return;
  }
  if (firstWord === "/administrator") { await doImage(env, chatId, "confident young male sports brand manager, athletic, modern streetwear, orange and black, studio portrait, leadership", "\u{1F451} Administrator — Apex Move"); return; }
  if (firstWord === "/imagine" || firstWord === "/poster") {
    const p = text.replace(/^\/(imagine|poster)(@\S+)?/i, "").trim();
    if (!p) { await sendMessage(env, chatId, "\u{1F5BC}️ Scrie ce vrei, ex: /imagine poster Apex Move, negru cu portocaliu, alergator in miscare"); return; }
    await doImage(env, chatId, p, null); return;
  }
  if (firstWord === "/azi") {
    const extra = await getBrandExtra(env);
    await sendChatAction(env, chatId, "typing");
    const ideas = await callGroq(env, sysPrompt("continut", extra), [], "Da-mi 5 idei de continut pentru AZI, scurte, fiecare cu Tip, Hook si CTA.");
    await sendMessage(env, chatId, "☀️ Continutul zilei — Apex Move\n\n" + ideas);
    await doImage(env, chatId, "poster motivational sportiv pentru azi", "\u{1F3A8} Posterul zilei");
    return;
  }
  if (QUICK[firstWord]) {
    const q = QUICK[firstWord]; const a = AGENTS[q.agent]; const extra = await getBrandExtra(env);
    await sendChatAction(env, chatId, "typing");
    const ans = await callGroq(env, sysPrompt(q.agent, extra), [], q.text);
    await sendMessage(env, chatId, a.emoji + " " + a.label + "\n\n" + ans);
    return;
  }

  const state = await getState(env, chatId);
  if (COMMANDS[firstWord]) {
    state.agent = COMMANDS[firstWord];
    text = text.slice(firstWord.length).trim();
    if (!text) { state.history = []; await saveState(env, chatId, state); const a = AGENTS[state.agent]; await sendMessage(env, chatId, a.emoji + " Acum vorbesti cu " + a.label + ". Spune-mi ce ai nevoie."); return; }
  } else if (isGroup) {
    text = text.replace(/^\/\S+\s*/, "").trim(); if (!text) return; state.agent = "admin";
  }

  const extra = await getBrandExtra(env);
  const agent = AGENTS[state.agent] || AGENTS.admin;
  await sendChatAction(env, chatId, "typing");
  const answer = await callGroq(env, sysPrompt(state.agent, extra), state.history, text);
  state.history = (state.history || []).concat([{ role: "user", content: text }, { role: "assistant", content: answer }]);
  await saveState(env, chatId, state);
  await sendMessage(env, chatId, agent.emoji + " " + agent.label + "\n\n" + answer);
}

// ----------------- Cron zilnic -----------------
async function buildDailyReport(env) {
  const extra = await getBrandExtra(env);
  // Fiecare agent cheie livreaza ceva concret
  const tasks = [
    ["manager", "Planul de azi pe scurt: TOP 3 prioritati."],
    ["continut", "3 idei de continut pentru AZI, fiecare cu Hook si CTA."],
    ["strateg", "O idee rapida bazata pe ce viralizeaza acum in nisa."],
    ["vanzari", "O actiune de vanzari de facut azi: 1 mesaj/oferta gata de folosit."],
    ["finante", "O recomandare scurta de bani pentru azi."],
  ];
  let report = "☀️ Raportul zilei — agentii au lucrat:\n";
  for (const t of tasks) {
    try {
      const a = AGENTS[t[0]];
      const ans = await callGroq(env, sysPrompt(t[0], extra), [], t[1]);
      report += "\n" + a.emoji + " " + a.label + "\n" + ans + "\n";
    } catch (e) {}
  }
  let img = null;
  try { img = await generateImageBytes(env, "Sport fashion daily motivational poster, black and orange, dynamic athlete"); } catch (e) {}
  return { report: report, img: img };
}
async function runDaily(env) {
  const chats = await getDailyChats(env);
  if (!chats.length) return;
  const r = await buildDailyReport(env);
  for (const cid of chats) {
    try { await sendMessage(env, cid, "☀️ Buna dimineata!\n" + r.report); if (r.img) await sendPhoto(env, cid, r.img, "\u{1F3A8} Posterul zilei"); } catch (e) {}
  }
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Apex Move bot is alive \u{1F7E0}");
    let update; try { update = await request.json(); } catch (e) { return new Response("ok"); }
    try { await handleUpdate(update, env); }
    catch (e) { try { const m = update && (update.message || update.edited_message); if (m && m.chat) await sendMessage(env, m.chat.id, "⚠️ A aparut o eroare, dar botul e ok. Mai incearca."); } catch (e2) {} }
    return new Response("ok");
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(runDaily(env)); },
};
