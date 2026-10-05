// MINT — standalone runtime for GitHub Pages (100% free).
// News, insights and indicators are static JSON files in /data, refreshed by a GitHub Action.
// Personal data (library, routine, AI results you generate) stays in this browser.
// AI calls go straight from the browser to Google's free Gemini API with YOUR key, which is
// stored only in this browser (never in the public code).
(() => {
  if (window.claude) return;
  window.RADAR_STANDALONE = "github";
  const LS = { get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } }, set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} } };
  const REMOTE = { news:1, indicators:1, insights:1, monthly:1 };
  const cache = {}, subs = {}, loading = {};
  const snap = (id, d) => ({ id, exists: d != null, data: () => d ?? undefined, metadata: { fromCache:false, hasPendingWrites:false } });
  const emit = p => (subs[p] || []).forEach(f => f());
  const bust = () => "?v=" + Math.floor(Date.now() / 300000); // 5-minute cache window
  const getJSON = async u => { try{ const r = await fetch(u + bust()); return r.ok ? await r.json() : null; }catch{ return null; } };
  let indexP = null; const index = () => indexP || (indexP = getJSON("data/index.json").then(x => x || { news:[], insights:[], monthly:[] }));
  const overlay = c => LS.get("radar:overlay:" + c) || {};
  async function loadRemote(c){
    if(loading[c]) return loading[c];
    loading[c] = (async () => {
      let docs = [];
      if(c === "indicators"){ const j = await getJSON("data/indicators.json"); if(j) docs = [{ id:"current", ...j }]; }
      else {
        const ix = await index(); const ids = (ix[c] || []).slice(0, c === "news" ? 31 : 10);
        docs = (await Promise.all(ids.map(async id => { const j = await getJSON(`data/${c}/${id}.json`); return j ? { id, ...j } : null; }))).filter(Boolean);
      }
      const ov = overlay(c); // results generated in this browser win when they are newer
      for(const [id, d] of Object.entries(ov)){ const i = docs.findIndex(x => x.id === id); const cur = i >= 0 ? docs[i] : null;
        const newer = !cur || (d.generatedAt || "") >= (cur.generatedAt || "") || (d.brief?.generatedAt || "") > (cur.brief?.generatedAt || "");
        if(newer){ const merged = { ...(cur || {}), ...d, id }; if(cur?.brief && !d.brief) merged.brief = cur.brief; if(i >= 0) docs[i] = merged; else docs.push(merged); } }
      cache[c] = docs; emit(c);
    })().finally(() => { loading[c] = null; });
    return loading[c];
  }
  const localMap = p => LS.get("radar:" + p) || {};
  function collection(path){
    const isRemote = REMOTE[path] === 1; let ord = null, lim = null;
    const q = {
      path,
      orderBy(f, d="asc"){ ord=[f,d]; return q; }, limit(n){ lim=n; return q; }, where(){ return q; },
      _docs(){
        let docs = isRemote ? (cache[path]||[]).map(({id,...b}) => snap(id,b)) : Object.entries(localMap(path)).map(([id,b]) => snap(id,b));
        if(ord) docs.sort((a,b) => { const x=a.data()?.[ord[0]], y=b.data()?.[ord[0]]; return (x>y?1:x<y?-1:0)*(ord[1]==="desc"?-1:1); });
        else docs.sort((a,b) => a.id < b.id ? -1 : 1);
        return lim ? docs.slice(0, lim) : docs;
      },
      onSnapshot(cb){ const f = () => { const docs = q._docs(); cb({ docs, size:docs.length, empty:!docs.length, docChanges:()=>[], metadata:{} }); };
        (subs[path] = subs[path] || []).push(f); if(isRemote && !cache[path]) loadRemote(path); else setTimeout(f, 0);
        return () => { subs[path] = (subs[path]||[]).filter(x => x !== f); }; },
      async get(){ if(isRemote && !cache[path]) await loadRemote(path); const docs=q._docs(); return { docs, size:docs.length, empty:!docs.length }; },
      doc(id){ return doc(path + "/" + (id || Math.random().toString(36).slice(2))); },
      async add(d){ const r = q.doc(); await r.set(d); return r; }
    };
    return q;
  }
  function doc(path){
    const parts = path.split("/"); const id = parts.pop(); const col = parts.join("/"); const isRemote = REMOTE[col] === 1;
    const read = () => { if(isRemote){ const e=(cache[col]||[]).find(x => x.id === id); if(!e) return null; const {id:_, ...b} = e; return b; } return localMap(col)[id] ?? null; };
    return {
      id, path,
      async get(){ if(isRemote && !cache[col]) await loadRemote(col); return snap(id, read()); },
      onSnapshot(cb){ const f = () => cb(snap(id, read())); (subs[col] = subs[col] || []).push(f); if(isRemote && !cache[col]) loadRemote(col); else setTimeout(f, 0); return () => { subs[col] = (subs[col]||[]).filter(x => x !== f); }; },
      async set(d){
        if(isRemote){ const ov = overlay(col); ov[id] = d; const keys = Object.keys(ov).sort(); while(keys.length > 20) delete ov[keys.shift()]; LS.set("radar:overlay:" + col, ov);
          cache[col] = (cache[col]||[]).filter(x => x.id !== id).concat([{ id, ...d }]); emit(col); return; }
        const m = localMap(col); m[id] = d; LS.set("radar:" + col, m); emit(col); },
      async update(d){ return this.set({ ...(read() || {}), ...d }); },
      async delete(){ const m = localMap(col); delete m[id]; LS.set("radar:" + col, m); emit(col); },
      collection(c){ return collection(path + "/" + c); }
    };
  }
  setInterval(() => { indexP = null; ["news","indicators","insights"].forEach(c => { if(cache[c]) loadRemote(c); }); }, 15 * 60 * 1000);

  // ---------- AI: Google Gemini free tier, key kept in this browser ----------
  const KEY = "radar-gemini-key";
  const getKey = () => { try{ return localStorage.getItem(KEY) || ""; }catch{ return ""; } };
  function keyPanel(reason){
    let el = document.getElementById("aiPanel");
    if(!el){ el = document.createElement("div"); el.id = "aiPanel"; el.className = "aipanel"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","AI key"); document.body.appendChild(el); }
    el.innerHTML = `<b>${reason === "bad" ? "That AI key didn't work" : "Connect the free AI"}</b>
      <p>The Studio, Ask and The Brief use Google's free Gemini AI. Create a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> (Google account, 2 minutes) and paste it here. It stays only in this browser.</p>
      <label class="field"><span class="label">Gemini API key</span><input id="aiKeyIn" type="password" autocomplete="off" placeholder="Paste your key (AIza… or AQ.…)"></label>
      <div class="row"><button class="btn primary" type="button" data-ai="save">Save key</button><button class="btn" type="button" data-ai="close">Close</button>${getKey() ? '<button class="btn" type="button" data-ai="forget">Remove key</button>' : ""}</div>`;
    el.querySelector('[data-ai="close"]').onclick = () => el.remove();
    el.querySelector('[data-ai="save"]').onclick = () => { const v = el.querySelector("#aiKeyIn").value.trim(); if(v.length < 20) return; try{ localStorage.setItem(KEY, v); }catch{} el.innerHTML = "<b>Key saved</b><p>Unlocking the Studio…</p>"; setTimeout(() => location.reload(), 1200); };
    const fg = el.querySelector('[data-ai="forget"]'); if(fg) fg.onclick = () => { try{ localStorage.removeItem(KEY); }catch{} el.remove(); };
    el.querySelector("#aiKeyIn").focus();
  }
  // free relay (Cloudflare Worker) that holds MINT's key: visitors need no key of their own
  const PROXY = "__MINT_AI_PROXY__".startsWith("http") ? "__MINT_AI_PROXY__" : "";
  window.MINT_AI_PROXY = PROXY;
  // owner sign-in: email + password checked against a salted SHA-256 fingerprint (the password itself is never stored)
  const OWNER_HASH = "4767b469b9aeec7201a27cc862ac91446a05fd736e4d08926a2e1649991c1cbe";
  const isOwner = () => { try{ return localStorage.getItem("mint-owner") === OWNER_HASH && !!OWNER_HASH; }catch{ return false; } };
  window.MINT_OWNER = isOwner();
  // the AI key, locked with the owner's password (AES-GCM, key from PBKDF2): useless without the password
  const ENC_KEY = "__MINT_ENC_KEY__".startsWith("__") ? "" : "__MINT_ENC_KEY__";
  const b64 = u => btoa(String.fromCharCode(...u)), unb64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
  const kdf = async (pw, salt) => crypto.subtle.deriveKey({ name:"PBKDF2", salt, iterations:250000, hash:"SHA-256" }, await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]), { name:"AES-GCM", length:256 }, false, ["encrypt","decrypt"]);
  async function seal(text, pw){ const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name:"AES-GCM", iv }, await kdf(pw, salt), new TextEncoder().encode(text)));
    return b64(new Uint8Array([...salt, ...iv, ...ct])); }
  async function unseal(code, pw){ const u = unb64(code); const salt = u.slice(0,16), iv = u.slice(16,28), ct = u.slice(28);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name:"AES-GCM", iv }, await kdf(pw, salt), ct)); }
  const sha = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2,"0")).join("");
  const fp = (e, p) => sha("mint-owner-v1|" + e.trim().toLowerCase() + "|" + p);
  function loginPanel(){
    let el = document.getElementById("aiPanel");
    if(!el){ el = document.createElement("div"); el.id = "aiPanel"; el.className = "aipanel"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Owner sign in"); document.body.appendChild(el); }
    const setup = !OWNER_HASH;
    el.innerHTML = `<b>${setup ? "Create your owner password" : "Owner sign in"}</b>
      <p>${setup ? "Choose the email and password you will use to open the Studio. You'll get a code to send to Claude; the password itself never leaves this page." : "The Studio and Library are private. Sign in to open them."}</p>
      <label class="field"><span class="label">Email</span><input id="owEmail" type="email" autocomplete="username"></label>
      <label class="field"><span class="label">Password</span><input id="owPass" type="password" autocomplete="${setup ? "new-password" : "current-password"}"></label>
      <p id="owMsg" class="muted" style="font-size:.85rem"></p>
      <div class="row"><button class="btn primary" type="button" data-ow="go">${setup ? "Create code" : "Sign in"}</button><button class="btn" type="button" data-ow="close">Close</button></div>`;
    const msg = el.querySelector("#owMsg");
    el.querySelector('[data-ow="close"]').onclick = () => { el.remove(); history.replaceState(null, "", location.pathname + location.search); };
    el.querySelector('[data-ow="go"]').onclick = async () => {
      const e = el.querySelector("#owEmail").value, p = el.querySelector("#owPass").value;
      if(!e.includes("@") || p.length < 8){ msg.textContent = "Use your email and a password with at least 8 characters."; return; }
      const h = await fp(e, p);
      if(setup){ msg.innerHTML = `Send this code to Claude:<br><code style="user-select:all;word-break:break-all">${h}</code>`; return; }
      if(h === OWNER_HASH){
        try{ localStorage.setItem("mint-owner", h); }catch{}
        const done = t => { msg.textContent = t; setTimeout(() => { location.hash = ""; location.reload(); }, 900); };
        if(ENC_KEY && !getKey()){ try{ localStorage.setItem(KEY, await unseal(ENC_KEY, p)); return done("Welcome back. AI connected, opening the Studio…"); }catch{} }
        if(!ENC_KEY && getKey()){ const code = await seal(getKey(), p);
          msg.innerHTML = `Signed in. To have the AI ready on every computer, send Claude this code (it is your AI key locked with your password, safe to share):<br><code style="user-select:all;word-break:break-all;font-size:11px">${code}</code>`;
          el.querySelector('[data-ow="go"]').textContent = "Continue"; el.querySelector('[data-ow="go"]').onclick = () => { location.hash = ""; location.reload(); }; return; }
        done("Welcome back. Opening the Studio…"); }
      else msg.textContent = "Email or password not recognised.";
    };
    el.querySelector("#owEmail").focus();
  }
  window.MINT_LOGIN = loginPanel;
  window.MINT_LOGOUT = () => { try{ localStorage.removeItem("mint-owner"); }catch{} location.reload(); };
  if(/owner/.test(location.hash) && !window.MINT_OWNER) addEventListener("DOMContentLoaded", () => setTimeout(loginPanel, 300));
  if(!PROXY) window.RADAR_AI_KEY = () => keyPanel();
  const toText = input => typeof input === "string" ? input : (input || []).map(t => t.content).join("\n\n");
  const MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"];
  async function viaProxy(input, json, opts){
    let r; try{ r = await fetch(PROXY, { method:"POST", signal: opts.signal, headers:{ "content-type":"application/json" }, body: JSON.stringify({ prompt: toText(input).slice(0, 60000), json: !!json }) }); }
    catch(e){ if(e?.name === "AbortError") throw { code:"cancelled" }; throw { code:"network" }; }
    const b = await r.json().catch(() => ({}));
    if(r.ok && b.text) return b.text;
    throw { code: r.status === 429 ? "rate_limited" : (b.code || "ai_error") };
  }
  async function callAI(input, json, opts = {}){
    const key = getKey();
    if(!key && PROXY) return viaProxy(input, json, opts);
    if(!key){ keyPanel(); throw { code:"no_key" }; }
    let last = null;
    for(const m of MODELS){
      let r;
      try{ r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, { method:"POST", signal: opts.signal,
        headers:{ "content-type":"application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text: toText(input).slice(0, 60000) }] }], generationConfig:{ temperature:.7, maxOutputTokens:8192, ...(json ? { responseMimeType:"application/json" } : {}) } }) }); }
      catch(e){ if(e?.name === "AbortError") throw { code:"cancelled" }; throw { code:"network" }; }
      const b = await r.json().catch(() => ({}));
      if(r.ok){ const t = (b?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join(""); if(t) return t; last = { code:"ai_error" }; continue; }
      if(r.status === 400 && /API key/i.test(b?.error?.message || "")){ keyPanel("bad"); throw { code:"bad_key" }; }
      if(r.status === 403){ keyPanel("bad"); throw { code:"bad_key" }; }
      last = { code: r.status === 429 ? "rate_limited" : "ai_error" };
      if(![404, 429, 500, 503].includes(r.status)) break;
    }
    throw last || { code:"ai_error" };
  }
  const parseJSON = t => { const s = String(t).replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim(); try{ return JSON.parse(s); }catch{ const a = s.indexOf("{"), z = s.lastIndexOf("}"); if(a >= 0 && z > a){ try{ return JSON.parse(s.slice(a, z + 1)); }catch{} } throw { code:"invalid_json" }; } };
  const sample = async (input, opts = {}) => { const text = await callAI(input, false, opts); opts.onText?.({ text, delta: text }); return { text, stopReason:"end_turn" }; };
  sample.json = async (input, opts = {}) => parseJSON(await callAI(input, true, opts));
  sample.limits = async () => ({ maxPromptBytes: 60000 });
  const downloads = { async save({ filename, data }){ const blob = data instanceof Blob ? data : new Blob([data]); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return { status:"saved" }; } };
  const user = { id: async () => "local", isOwner: () => true, canEdit: () => true, can: () => true };
  const api = { db:{ doc, collection }, user, sample, downloads };
  window.claude = { use: async n => api[n] || null };
})();
