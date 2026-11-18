/* ---------- Theme ---------- */
$('#themeBtn').onclick = () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark'; store.set('theme', r.dataset.theme);
};
const th = store.get('theme',null); if(th) document.documentElement.dataset.theme = th;
if(store.get('design', null)==='studio') document.documentElement.dataset.design = 'studio';

/* ---------- Sichern und übertragen: ganzer Stand als Datei oder Code ---------- */
// Nicht mitgenommen: die Farbwahl des Geräts und die automatische Sicherung vor dem Laden
const SYNC_SKIP = ['bb.theme', 'bb.sync.backup', 'bb.sync.meta', 'bb.sync.linked', 'bb.auth'];
function syncPack(){
  const data = {};
  for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k.startsWith('bb.') && !SYNC_SKIP.includes(k)) data[k.slice(3)] = localStorage.getItem(k); }
  return {app:'lerntool-bbw', v:1, at:new Date().toISOString(), data};
}
function syncParse(txt){
  let o; try{ o = JSON.parse(String(txt).trim()); }catch(e){ throw new Error('Das ist kein gültiger Lerntool-Stand. Kopiere den ganzen Code.'); }
  if(!o || o.app!=='lerntool-bbw' || !o.data || typeof o.data!=='object') throw new Error('Das ist kein Stand aus diesem Lerntool.');
  for(const [k,v] of Object.entries(o.data)){ let okv = typeof v==='string' && !SYNC_SKIP.includes('bb.'+k); if(okv){ try{ JSON.parse(v); }catch(e){ okv = false; } } if(!okv) throw new Error('Der Stand ist beschädigt. Sichere ihn auf dem anderen Gerät nochmals.'); }
  return o;
}
function syncApply(o){
  const backup = JSON.stringify(syncPack());
  Object.keys(localStorage).filter(k => k.startsWith('bb.') && !SYNC_SKIP.includes(k)).forEach(k => localStorage.removeItem(k));
  Object.entries(o.data).forEach(([k,v]) => localStorage.setItem('bb.'+k, v));
  localStorage.setItem('bb.sync.backup', backup);
  const now = Date.now(), meta = syncMeta(); Object.keys(JSON.parse(backup).data).concat(Object.keys(o.data)).forEach(k => { if(cloudKey(k)) meta[k] = now; }); lsSet('sync.meta', meta);
  location.reload();
}
const syncWhen = iso => { const d = new Date(iso); return isNaN(d) ? 'unbekannt' : d.toLocaleString('de-CH', {day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}); };
function openSync(){
  const dlg = $('#syncDlg'), pack = syncPack(), n = Object.keys(pack.data).length;
  let bk = null; try{ bk = JSON.parse(localStorage.getItem('bb.sync.backup') || 'null'); }catch(e){}
  dlg.innerHTML = `<form method="dialog" class="dlghead"><h3 id="syncTitle">Konto und Sync</h3><button class="btn ghost" aria-label="Schliessen">Schliessen</button></form>
    <div id="accBox">${accountHtml()}</div>
    <details class="dlgmore" ${fbOn() ? '' : 'open'}><summary>Ohne Konto: mit Code oder Datei übertragen</summary>
    <p class="muted">Sichere deinen Stand auf dem einen Gerät und lade ihn auf dem anderen. Mitgenommen werden Übungen, Probetests, Lernziele, Karteikarten, Notizen und Daten (${n} Einträge).</p>
    <h4>1. Auf diesem Gerät sichern</h4>
    <div class="row"><button class="btn" id="syncFile">Als Datei speichern</button><button class="btn ghost" id="syncCopy">Code kopieren</button></div>
    <p class="muted" style="font-size:var(--t-xs);margin:var(--s2) 0 0;font-family:var(--f-ui)">Den Code kannst du dir selbst schicken, zum Beispiel per WhatsApp oder Mail, und auf dem anderen Gerät einfügen.</p>
    <h4>2. Auf dem anderen Gerät laden</h4>
    <div class="row"><button class="btn ghost" id="syncPick">Datei laden</button><input type="file" id="syncIn" accept=".json,application/json,text/plain" hidden></div>
    <textarea id="syncCode" rows="3" placeholder="Oder den kopierten Code hier einfügen" spellcheck="false" autocomplete="off"></textarea>
    <div class="row" style="margin-top:var(--s2)"><button class="btn ghost" id="syncUse">Code übernehmen</button></div>
    <p class="fb" id="syncMsg" role="status"></p></details>
    ${bk ? `<h4>Rückgängig</h4><p class="muted" style="font-size:var(--t-xs);margin:0 0 var(--s2);font-family:var(--f-ui)">Vor dem letzten Laden wurde dein Stand vom ${esc(syncWhen(bk.at))} gesichert.</p><button class="btn ghost" id="syncUndo">Diesen Stand wiederherstellen</button>` : ''}`;
  const msg = (t, ok) => { const m = $('#syncMsg'); m.className = 'fb ' + (ok ? 'ok' : 'bad'); m.textContent = t; };
  const load = txt => { let o; try{ o = syncParse(txt); }catch(e){ msg(e.message, false); return; }
    if(confirm(`Stand vom ${syncWhen(o.at)} laden? Dein jetziger Stand auf diesem Gerät wird ersetzt. Er wird vorher gesichert und lässt sich hier wiederherstellen.`)) syncApply(o); };
  $('#syncFile').onclick = () => { const p = syncPack(), url = URL.createObjectURL(new Blob([JSON.stringify(p)], {type:'application/json'})), a = document.createElement('a');
    a.href = url; a.download = `lerntool-stand-${p.at.slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    msg('Datei gespeichert. Lade sie auf dem anderen Gerät mit «Datei laden».', true); };
  $('#syncCopy').onclick = async () => { const txt = JSON.stringify(syncPack()), ta = $('#syncCode');
    try{ await navigator.clipboard.writeText(txt); msg('Code kopiert. Füge ihn auf dem anderen Gerät hier ein.', true); }
    catch(e){ ta.value = txt; ta.select(); const ok = document.execCommand && document.execCommand('copy'); msg(ok ? 'Code kopiert. Füge ihn auf dem anderen Gerät hier ein.' : 'Der Code steht im Feld unten. Markiere ihn und kopiere ihn von Hand.', !!ok); } };
  $('#syncPick').onclick = () => $('#syncIn').click();
  $('#syncIn').onchange = ev => { const f = ev.target.files[0]; if(!f) return; const rd = new FileReader(); rd.onload = () => load(rd.result); rd.onerror = () => msg('Die Datei liess sich nicht lesen.', false); rd.readAsText(f); ev.target.value = ''; };
  $('#syncUse').onclick = () => { const t = $('#syncCode').value; if(!t.trim()){ msg('Füge zuerst einen Code ein.', false); return; } load(t); };
  if($('#syncUndo')) $('#syncUndo').onclick = () => { if(confirm('Den gesicherten Stand wiederherstellen? Dein jetziger Stand wird dafür ebenfalls gesichert.')) syncApply(bk); };
  accountBind();
  const tb = document.createElement('div'); tb.className = 'row'; tb.style.marginTop = 'var(--s3)'; const dsg = () => document.documentElement.dataset.design==='studio' ? 'studio' : 'apple';
  tb.innerHTML = '<button class="chip" type="button" id="dlgTheme">Hell / Dunkel</button><span class="muted" style="font:var(--t-xs)/1.4 var(--f-ui);margin-left:var(--s2)">Design:</span><button class="chip" type="button" data-dsg="apple">Apple</button><button class="chip" type="button" data-dsg="studio">Studio</button>';
  dlg.appendChild(tb); $('#dlgTheme').onclick = () => $('#themeBtn').click();
  const dsgMark = () => tb.querySelectorAll('[data-dsg]').forEach(b => b.classList.toggle('on', b.dataset.dsg===dsg())); dsgMark();
  tb.querySelectorAll('[data-dsg]').forEach(b => b.onclick = () => { if(b.dataset.dsg==='studio') document.documentElement.dataset.design = 'studio'; else delete document.documentElement.dataset.design; store.set('design', b.dataset.dsg); dsgMark(); });
  if(!dlg.open) dlg.showModal();
}

/* ---------- Konto und automatischer Abgleich über Firebase (nur fetch, keine fremden Skripte) ---------- */
// Diese zwei Werte sind laut Firebase öffentlich. Geschützt wird über die Firestore-Regeln: jedes Konto liest und schreibt nur sein eigenes Dokument.
const FB = window.LERNTOOL_FIREBASE || {apiKey:'', projectId:''};
const fbOn = () => !!(FB.apiKey && FB.projectId);
const CLOUD_LOCAL = ['theme', 'design', 'subject', 'tab', 'auth', 'grpseen', 'grppub', 'grplast'];   // gilt nur für dieses Gerät
const cloudKey = k => !CLOUD_LOCAL.includes(k) && !k.startsWith('sync.');
const CL = {status:'off', msg:'', last:0, busy:false, again:false, timer:null, pending:null};
const lsGet = k => { try{ return JSON.parse(localStorage.getItem('bb.'+k) || 'null'); }catch(e){ return null; } };
const lsSet = (k, v) => { try{ localStorage.setItem('bb.'+k, JSON.stringify(v)); }catch(e){} };
const syncMeta = () => lsGet('sync.meta') || {};
// Jede Änderung bekommt einen Zeitstempel, damit beim Abgleich die neuere gewinnt
const storeSetRaw = store.set;
store.set = (k, v) => {
  if(!storeSetRaw(k, v)) return false;
  if(cloudKey(k)){ const m = syncMeta(); m[k] = Date.now(); lsSet('sync.meta', m); cloudSoon(); }
  return true;
};

function localEntries(){
  const m = syncMeta(), e = {};
  for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(!k.startsWith('bb.')) continue; const s = k.slice(3); if(cloudKey(s)) e[s] = {v:localStorage.getItem(k), t:m[s] || 0}; }
  Object.keys(m).forEach(s => { if(cloudKey(s) && !(s in e)) e[s] = {v:null, t:m[s]}; });   // gelöscht
  return e;
}
const entV = x => x && x.v != null ? x.v : null;
function mergeEntries(loc, rem){
  const out = {};
  new Set([...Object.keys(loc), ...Object.keys(rem)]).forEach(k => { const a = loc[k], b = rem[k]; out[k] = !a ? b : !b ? a : ((a.t||0) > (b.t||0) ? a : b); });
  return out;
}
function applyLocal(ent){
  const m = syncMeta(), changed = [];
  Object.entries(ent).forEach(([k,x]) => { if(!cloudKey(k)) return; const v = entV(x);
    if(v !== localStorage.getItem('bb.'+k)){ try{ if(v===null) localStorage.removeItem('bb.'+k); else localStorage.setItem('bb.'+k, v); }catch(e){} changed.push(k); }
    if(x.t) m[k] = x.t; });
  lsSet('sync.meta', m);
  return changed;
}

const FB_ERR = {EMAIL_EXISTS:'Für diese E-Mail gibt es schon ein Konto. Melde dich an.', EMAIL_NOT_FOUND:'E-Mail oder Passwort stimmt nicht.', INVALID_PASSWORD:'E-Mail oder Passwort stimmt nicht.', INVALID_LOGIN_CREDENTIALS:'E-Mail oder Passwort stimmt nicht.',
  INVALID_EMAIL:'Diese E-Mail-Adresse ist ungültig.', MISSING_PASSWORD:'Gib ein Passwort ein.', MISSING_EMAIL:'Gib deine E-Mail-Adresse ein.', TOO_MANY_ATTEMPTS_TRY_LATER:'Zu viele Versuche. Warte kurz und versuch es nochmals.',
  USER_DISABLED:'Dieses Konto ist gesperrt.', OPERATION_NOT_ALLOWED:'Neue Konten sind ausgeschaltet.', ADMIN_ONLY_OPERATION:'Neue Konten sind ausgeschaltet.', TOKEN_EXPIRED:'Bitte melde dich neu an.', INVALID_REFRESH_TOKEN:'Bitte melde dich neu an.', USER_NOT_FOUND:'Bitte melde dich neu an.'};
const fbMsg = c => { c = String(c || ''); if(c.startsWith('WEAK_PASSWORD')) return 'Das Passwort braucht mindestens 6 Zeichen.'; return FB_ERR[c.split(' ')[0]] || `Das hat nicht geklappt (${c || 'unbekannter Fehler'}).`; };
async function fbFetch(url, opt){
  let r; try{ r = await fetch(url, opt); }catch(e){ const er = new Error('Keine Verbindung. Prüfe dein Internet.'); er.net = true; throw er; }
  let j = {}; try{ j = await r.json(); }catch(e){} return {r, j};
}
async function fbAuth(path, body){
  const {r, j} = await fbFetch(`https://identitytoolkit.googleapis.com/v1/accounts:${path}?key=${encodeURIComponent(FB.apiKey)}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if(!r.ok) throw new Error(fbMsg(j.error && j.error.message)); return j;
}
async function fbToken(){
  const a = lsGet('auth'); if(!a) return null;
  if(a.exp - 60000 > Date.now()) return a;
  const {r, j} = await fbFetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(FB.apiKey)}`, {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(a.rt)});
  if(!r.ok){ if(r.status===400 || r.status===403){ localStorage.removeItem('bb.auth'); localStorage.removeItem('bb.sync.linked'); throw new Error(fbMsg(j.error && j.error.message)); } throw new Error('Die Anmeldung liess sich nicht erneuern.'); }
  const nx = {...a, id:j.id_token, rt:j.refresh_token, exp:Date.now() + (+j.expires_in || 3600)*1000}; lsSet('auth', nx); return nx;
}
const fsUrl = uid => `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FB.projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
const fsDenied = 'Kein Zugriff auf den Speicher. Prüfe die Firestore-Regeln.';
async function cloudGet(a){
  const {r, j} = await fbFetch(fsUrl(a.uid), {headers:{Authorization:'Bearer '+a.id}});
  if(r.status===404) return {exists:false, ent:{}};
  if(!r.ok) throw new Error(r.status===403 ? fsDenied : `Speicher nicht erreichbar (Fehler ${r.status}).`);
  let ent = {}; try{ ent = JSON.parse((j.fields && j.fields.data && j.fields.data.stringValue) || '{}') || {}; }catch(e){}
  return {exists:true, ut:j.updateTime, ent};
}
// Schreibt nur, wenn seit dem Lesen kein anderes Gerät geschrieben hat; sonst false und es wird neu abgeglichen
async function cloudPut(a, ent, pre){
  const q = pre.exists ? 'currentDocument.updateTime='+encodeURIComponent(pre.ut) : 'currentDocument.exists=false';
  const {r} = await fbFetch(fsUrl(a.uid)+'?'+q, {method:'PATCH', headers:{Authorization:'Bearer '+a.id, 'Content-Type':'application/json'}, body:JSON.stringify({fields:{data:{stringValue:JSON.stringify(ent)}, at:{integerValue:String(Date.now())}}})});
  if(r.status===400 || r.status===409 || r.status===412) return false;
  if(!r.ok) throw new Error(r.status===403 ? fsDenied : `Speichern fehlgeschlagen (Fehler ${r.status}).`);
  return true;
}
function cloudSoon(ms = 2000){ if(!fbOn() || !lsGet('auth')) return; clearTimeout(CL.timer); CL.timer = setTimeout(() => { CL.timer = null; cloudSync(); }, ms); if(CL.status!=='syncing' && CL.status!=='choose') cloudState('pending'); }
async function cloudSync(){
  if(!fbOn() || !lsGet('auth')){ cloudState('off'); return; }
  if(CL.status==='choose') return;
  if(CL.busy){ CL.again = true; return; }
  if(!navigator.onLine){ cloudState('offline'); return; }
  CL.busy = true; cloudState('syncing');
  try{
    let changed = [];
    for(let i = 0; i < 4; i++){
      const a = await fbToken(); if(!a){ cloudState('off'); return; }
      const rem = await cloudGet(a), loc = localEntries();
      if(lsGet('sync.linked') !== a.uid){
        const hasL = Object.values(loc).some(x => entV(x)!==null), hasR = Object.values(rem.ent).some(x => entV(x)!==null);
        const differ = [...new Set([...Object.keys(loc), ...Object.keys(rem.ent)])].some(k => entV(loc[k]) !== entV(rem.ent[k]));
        if(hasL && hasR && differ){ CL.pending = {a, rem}; cloudState('choose'); return; }
        lsSet('sync.linked', a.uid);
      }
      const mer = mergeEntries(loc, rem.ent);
      changed = changed.concat(applyLocal(mer));
      const needPush = Object.keys(mer).some(k => !rem.ent[k] || entV(rem.ent[k]) !== entV(mer[k]) || (rem.ent[k].t||0) !== (mer[k].t||0));
      if(!needPush || await cloudPut(a, mer, rem)){ CL.last = Date.now(); cloudState('ok'); cloudApplied([...new Set(changed)]); return; }
    }
    throw new Error('Der Abgleich ist nicht durchgegangen. Versuch es gleich nochmals.');
  }catch(e){ cloudState(e.net ? 'offline' : lsGet('auth') ? 'error' : 'off', e.message); if(!lsGet('auth') && $('#syncDlg').open) openSync(); }
  finally{ CL.busy = false; if(CL.again){ CL.again = false; cloudSoon(300); } }
}
async function cloudChoose(kind){
  const p = CL.pending; if(!p) return;
  CL.pending = null; CL.status = 'syncing';
  const loc = localEntries();
  if(kind==='cloud'){
    localStorage.setItem('bb.sync.backup', JSON.stringify(syncPack()));
    Object.keys(loc).forEach(k => localStorage.removeItem('bb.'+k));
    lsSet('sync.meta', {}); applyLocal(p.rem.ent); lsSet('sync.linked', p.a.uid); location.reload(); return;
  }
  if(kind==='device'){ const now = Date.now(), m = syncMeta(); Object.keys(loc).forEach(k => m[k] = now); Object.keys(p.rem.ent).forEach(k => { if(!(k in loc)) m[k] = now; }); lsSet('sync.meta', m); }
  if(kind==='merge'){
    // Beide Seiten behalten: Objekte (z. B. Übungsresultate) Eintrag für Eintrag vereinigen, Listen (z. B. Karteikarten) ohne Doppelte; bei gleichem Eintrag gilt das Konto
    const now = Date.now(), m = syncMeta();
    Object.keys(loc).forEach(k => { const lv = entV(loc[k]), rv = entV(p.rem.ent[k]); if(lv===null || lv===rv) return;
      if(rv===null){ m[k] = now; return; }   // nur auf diesem Gerät: bleibt
      let a, b; try{ a = JSON.parse(lv); b = JSON.parse(rv); }catch(e){ return; }
      let v = null;
      if(Array.isArray(a) && Array.isArray(b)){ const seen = new Set(b.map(x => JSON.stringify(x))); v = b.concat(a.filter(x => !seen.has(JSON.stringify(x)))); }
      else if(a && b && typeof a==='object' && typeof b==='object' && !Array.isArray(a) && !Array.isArray(b)) v = {...a, ...b};
      if(v!==null){ try{ localStorage.setItem('bb.'+k, JSON.stringify(v)); }catch(e){} m[k] = now; } });
    lsSet('sync.meta', m);
  }
  lsSet('sync.linked', p.a.uid);
  CL.status = 'pending'; if($('#syncDlg').open) openSync();
  await cloudSync();
}
async function cloudLogout(wipe){
  if(CL.timer){ clearTimeout(CL.timer); CL.timer = null; await cloudSync(); }
  localStorage.removeItem('bb.auth'); localStorage.removeItem('bb.sync.linked'); CL.pending = null;
  if(wipe){ Object.keys(localStorage).filter(k => k.startsWith('bb.') && k!=='bb.theme').forEach(k => localStorage.removeItem(k)); location.reload(); return; }
  cloudState('off'); openSync();
}
// Neuer Stand von einem anderen Gerät: sofort anzeigen, ausser du bist gerade mitten in einer Aufgabe
function cloudApplied(keys){
  if(!keys.length) return;
  const ae = document.activeElement, typing = ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName) && ae.closest('#main');
  const busy = typing || exOpen!==null || (PT[cur] && PT[cur].phase==='run') || (cur==='friends' && DU.play && !DU.play.done);
  if(!busy){ render(); return; }
  renderSide();
  let t = $('#cltoast'); if(!t){ t = document.createElement('div'); t.id = 'cltoast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = '<span>Neuer Stand von einem anderen Gerät geladen.</span><button class="btn ghost">Anzeigen</button>';
  t.querySelector('button').onclick = () => { t.remove(); render(); };
}
const cloudStatusText = () => ({syncing:'Gleicht gerade ab …', pending:'Änderungen werden gleich abgeglichen …',
  ok:`Alles abgeglichen${CL.last ? ' um ' + new Date(CL.last).toLocaleTimeString('de-CH', {hour:'2-digit', minute:'2-digit'}) : ''}.`,
  offline:'Offline. Deine Änderungen werden abgeglichen, sobald du wieder online bist.', error:'Fehler: ' + CL.msg, off:'Noch nicht abgeglichen.', choose:'Bitte wähle oben, welcher Stand gelten soll.'})[CL.status] || '';
function cloudLabel(){
  if(!fbOn()) return 'Sichern / Sync';
  if(!lsGet('auth')) return 'Anmelden / Sync';
  return ({ok:'Sync an', syncing:'Gleicht ab', pending:'Gleicht ab', offline:'Offline', error:'Sync-Fehler', choose:'Sync: Auswahl'})[CL.status] || 'Sync';
}
function cloudState(s, msg){
  CL.status = s; CL.msg = msg || '';
  const b = $('#syncBtn'); if(b){ b.dataset.cs = lsGet('auth') && fbOn() ? s : 'out'; b.querySelector('span').textContent = cloudLabel(); b.title = lsGet('auth') ? 'Konto und Sync: ' + cloudStatusText() : 'Anmelden oder Fortschritt übertragen'; }
  const st = $('#accState'); if(st){ st.textContent = cloudStatusText(); st.className = s==='error' ? 'fb bad' : 'muted'; }
  if(s==='choose') openSync();
}
function accountHtml(){
  if(!fbOn()) return '<p class="muted">Die Anmeldung mit automatischem Abgleich ist in dieser Version noch nicht eingerichtet. Du kannst deinen Stand unten mit einem Code übertragen.</p>';
  const a = lsGet('auth');
  if(CL.status==='choose' && CL.pending){
    const loc = localEntries(), rem = CL.pending.rem.ent, cnt = e => Object.values(e).filter(x => entV(x)!==null).length, newest = e => Math.max(0, ...Object.values(e).map(x => x.t || 0));
    const info = (e, lbl) => `${lbl}: ${cnt(e)} Einträge${newest(e) ? ', zuletzt geändert am ' + esc(syncWhen(newest(e))) : ''}`;
    return `<p class="fb warn" style="margin:0 0 var(--s2)">Auf diesem Gerät und in deinem Konto gibt es schon einen Stand. Welcher soll gelten?</p>
      <p class="muted" style="font-size:var(--t-xs);margin:0 0 var(--s2);font-family:var(--f-ui)">${info(loc, 'Dieses Gerät')}.<br>${info(rem, 'Konto')}.</p>
      <div class="row"><button class="btn" data-ch="merge">Zusammenführen</button><button class="btn ghost" data-ch="cloud">Stand aus dem Konto</button><button class="btn ghost" data-ch="device">Stand von diesem Gerät</button></div>
      <p class="muted" style="font-size:var(--t-xs);margin:var(--s2) 0 0;font-family:var(--f-ui)">Zusammenführen behält alles von beiden Seiten; gibt es denselben Eintrag doppelt, gilt das Konto. Nimmst du den Stand aus dem Konto, wird dieses Gerät vorher gesichert.</p>`;
  }
  if(!a) return `<p class="muted" style="margin-top:0">Mit einem Konto gleicht das Lerntool deinen Stand automatisch zwischen PC, Laptop und Handy ab.</p>
    <form id="accForm" class="accform" novalidate><input type="email" id="accMail" placeholder="E-Mail" autocomplete="username" inputmode="email">
      <input type="password" id="accPw" placeholder="Passwort (mindestens 6 Zeichen)" autocomplete="current-password">
      <div class="row"><button class="btn" type="submit">Anmelden</button><button class="btn ghost" type="button" id="accNew">Konto erstellen</button><button class="btn ghost" type="button" id="accForgot">Passwort vergessen</button></div></form>
    <p class="fb" id="accMsg" role="status"></p>`;
  return `<p style="margin:0 0 var(--s1)">Angemeldet als <b>${esc(a.email)}</b></p><p class="${CL.status==='error' ? 'fb bad' : 'muted'}" id="accState" style="margin:0 0 var(--s2)">${esc(cloudStatusText())}</p>
    <div class="row"><button class="btn" id="accNow">Jetzt abgleichen</button><button class="btn ghost" id="accOut">Abmelden</button><button class="btn ghost" id="accWipe">Abmelden und Gerät leeren</button></div>`;
}
function accountBind(){
  const am = (t, cls) => { const m = $('#accMsg'); if(m){ m.className = 'fb ' + (cls || 'bad'); m.textContent = t; } };
  if($('#accForm')){
    const go = async path => {
      const mail = $('#accMail').value.trim(), pw = $('#accPw').value;
      if(!mail || pw.length < 6){ am('Gib deine E-Mail und ein Passwort mit mindestens 6 Zeichen ein.'); return; }
      am('Einen Moment …', '');
      try{ const j = await fbAuth(path, {email:mail, password:pw, returnSecureToken:true});
        lsSet('auth', {email:j.email || mail, uid:j.localId, id:j.idToken, rt:j.refreshToken, exp:Date.now() + (+j.expiresIn || 3600)*1000});
        CL.status = 'pending'; openSync(); cloudSync();
      }catch(e){ am(e.message); }
    };
    $('#accForm').onsubmit = ev => { ev.preventDefault(); go('signInWithPassword'); };
    $('#accNew').onclick = () => go('signUp');
    $('#accForgot').onclick = async () => { const mail = $('#accMail').value.trim(); if(!mail){ am('Gib zuerst deine E-Mail-Adresse ein.'); return; }
      try{ await fbAuth('sendOobCode', {requestType:'PASSWORD_RESET', email:mail}); am('Falls es dieses Konto gibt, bekommst du jetzt eine E-Mail zum Zurücksetzen.', 'ok'); }catch(e){ am(e.message); } };
  }
  document.querySelectorAll('#accBox [data-ch]').forEach(b => b.onclick = () => cloudChoose(b.dataset.ch));
  if($('#accNow')) $('#accNow').onclick = () => cloudSync();
  if($('#accOut')) $('#accOut').onclick = () => { if(confirm('Abmelden? Dein Stand bleibt auf diesem Gerät.')) cloudLogout(false); };
  if($('#accWipe')) $('#accWipe').onclick = () => { if(confirm('Abmelden und alle Lerntool-Daten auf diesem Gerät löschen? In deinem Konto bleibt alles gespeichert.')) cloudLogout(true); };
}
cloudState(fbOn() && lsGet('auth') ? 'pending' : 'off');
if(fbOn() && lsGet('auth')) setTimeout(cloudSync, 400);
document.addEventListener('visibilitychange', () => { if(document.visibilityState==='visible') cloudSoon(300); else if(CL.timer){ clearTimeout(CL.timer); CL.timer = null; cloudSync(); } });
window.addEventListener('online', () => cloudSoon(300));
window.addEventListener('offline', () => { if(fbOn() && lsGet('auth')) cloudState('offline'); });
setInterval(() => { if(document.visibilityState==='visible' && !CL.timer) cloudSoon(0); }, 120000);
$('#syncBtn').onclick = openSync;

/* ---------- Freunde: Klassengruppe, Fortschritt, Hausaufgaben, Erinnerungen ---------- */
// Firestore: groups/{CODE} (Name), groups/{CODE}/members/{uid} (Name, Fortschritt), .../members/{uid}/inbox (Erinnerungen), groups/{CODE}/tasks (Hausaufgaben).
// Wer den Code kennt, kann beitreten. Lesen dürfen nur Mitglieder, eigene Einträge ändert nur der Besitzer (siehe Firestore-Regeln).
const FR_ICON = '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>';
const FR_TILE = {g1:'#5EEAD4', g2:'#0D9488'};
const FR = {min7:'', duels:null, members:null, tasks:null, inbox:[], err:'', busy:false, t:0, to:null, draft:'', pubT:null};
const FR_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const frGrp = () => { const g = store.get('grp', null); return g && typeof g.id==='string' && /^[A-Z2-9]{8}$/.test(g.id) && typeof g.me==='string' ? g : null; };
const frOn = () => fbOn() && !!lsGet('auth');
const frCode = () => { const b = new Uint8Array(8); crypto.getRandomValues(b); return Array.from(b, x => FR_ABC[x % 32]).join(''); };
const frFmt = c => c.slice(0,4) + '-' + c.slice(4);
const frNorm = c => String(c).toUpperCase().replace(/[^A-Z0-9]/g, '');
const fsVal = v => typeof v==='string' ? {stringValue:v} : typeof v==='number' ? (Number.isInteger(v) ? {integerValue:String(v)} : {doubleValue:v}) : typeof v==='boolean' ? {booleanValue:v} : v===null || v===undefined ? {nullValue:null} : Array.isArray(v) ? {arrayValue:{values:v.map(fsVal)}} : {mapValue:{fields:fsFields(v)}};
const fsFields = o => Object.fromEntries(Object.entries(o).map(([k,v]) => [k, fsVal(v)]));
const fsPlain = x => !x || typeof x!=='object' ? null : 'stringValue' in x ? x.stringValue : 'integerValue' in x ? Number(x.integerValue) : 'doubleValue' in x ? x.doubleValue : 'booleanValue' in x ? x.booleanValue : 'mapValue' in x ? fsObj(x.mapValue.fields) : 'arrayValue' in x ? (x.arrayValue.values || []).map(fsPlain) : null;
const fsObj = fl => Object.fromEntries(Object.entries(fl || {}).map(([k,v]) => [k, fsPlain(v)]));
const fsDoc = d => ({...fsObj(d.fields), id:String(d.name || '').split('/').pop()});
const fsBase = () => 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(FB.projectId) + '/databases/(default)/documents/';
async function fsReq(path, method, body){
  const a = await fbToken(); if(!a) throw new Error('Bitte melde dich zuerst an.');
  const h = {Authorization:'Bearer ' + a.id}; if(body) h['Content-Type'] = 'application/json';
  const {r, j} = await fbFetch(fsBase() + path, {method:method || 'GET', headers:h, body:body ? JSON.stringify(body) : undefined});
  return {r, j, a};
}
const frErr = r => new Error(r.status===403 ? 'Kein Zugriff. Sind die Firestore-Regeln für Gruppen schon eingetragen?' : r.status===404 ? 'Nicht gefunden.' : 'Das hat nicht geklappt (Fehler ' + r.status + ').');
async function fsList(path){ const {r, j} = await fsReq(path + '?pageSize=300'); if(r.status===404) return []; if(!r.ok) throw frErr(r); return (j.documents || []).map(fsDoc); }
const frPath = (g, ...p) => 'groups/' + g.id + p.map(x => '/' + encodeURIComponent(x)).join('');
const frStr = (v, n) => typeof v==='string' ? v.slice(0, n) : '';
const frPct = v => typeof v==='number' && isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : null;

function frProgress(){ const p = {}; SUBJECTS.forEach(x => { if(BANKS[x.id]) p[x.id] = mastery(x.id).pct; }); return p; }
// Eigenen Eintrag in der Gruppe schreiben (nur wenn sich etwas geändert hat)
async function frPublish(force, gg){
  const g = gg || frGrp(); if(!g || !frOn()) return;
  const a = lsGet('auth'), srv = FR.members && FR.members.find(m => m.id===a.uid);
  const as = actStats();
  const doc = {name:g.me, p:frProgress(), last:Math.max(lsGet('grplast') || 0, srv && typeof srv.last==='number' ? srv.last : 0), wk:as.wk, wm:as.week, st:as.streak, sd:ymd(new Date())};
  const key = g.id + JSON.stringify(doc);
  if(!force && lsGet('grppub')===key) return;
  const {r} = await fsReq(frPath(g, 'members', a.uid), 'PATCH', {fields:fsFields({...doc, at:Date.now()})});
  if(!r.ok) throw frErr(r);
  lsSet('grppub', key);
  if(FR.members){ FR.members = FR.members.filter(m => m.id!==a.uid).concat([{...doc, id:a.uid}]); }
}
const frPubSoon = () => { clearTimeout(FR.pubT); FR.pubT = setTimeout(() => { frPublish().catch(() => {}); }, 15000); };
// Lernen merken: jede Änderung an Lernständen zählt als «zuletzt aktiv»
const storeSetCloud = store.set;
store.set = (k, v) => {
  if(!storeSetCloud(k, v)) return false;
  if(!/^(grades|grp|subject|tab|theme|design|notes|sync|auth|act)/.test(k)){
    lsSet('grplast', Date.now());
    if(frGrp() && frOn()) frPubSoon();
  }
  return true;
};

const frName = uid => { const m = FR.members && FR.members.find(x => x.id===uid); return m ? frStr(m.name, 30) : ''; };
function frNotify(fresh){
  const m = fresh[0], who = frName(m.from) || frStr(m.fromName, 30) || 'Jemand', txt = frStr(m.text, 300);
  if(typeof Notification!=='undefined' && Notification.permission==='granted'){
    const title = 'Erinnerung von ' + who + (fresh.length>1 ? ' und ' + (fresh.length-1) + ' weitere' : '');
    const show = () => { try{ new Notification(title, {body:txt, icon:'icon-192.png', tag:'lt-rem'}); }catch(e){} };
    if(navigator.serviceWorker && /^https?:$/.test(location.protocol)) navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification(title, {body:txt, icon:'icon-192.png', tag:'lt-rem'}) : show()).catch(show); else show();
  }
  if(cur==='friends') return;
  let t = $('#frtoast'); if(!t){ t = document.createElement('div'); t.id = 'frtoast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = '<span></span><button class="btn ghost">Ansehen</button>';
  t.querySelector('span').textContent = who + ': ' + txt;
  t.querySelector('button').onclick = () => { t.remove(); cur = 'friends'; store.set('subject', cur); render(); window.scrollTo(0,0); };
}
// Erinnerungen abholen: beim Start, alle 90 Sekunden und wenn die App wieder sichtbar wird
async function frPoll(){
  const g = frGrp(); if(!g || !frOn() || !navigator.onLine || document.visibilityState==='hidden') return;
  try{
    const list = await fsList(frPath(g, 'members', lsGet('auth').uid, 'inbox'));
    FR.inbox = list.filter(m => typeof m.text==='string').sort((x,y) => (y.at||0) - (x.at||0));
    const seen = new Set(lsGet('grpseen') || []), fresh = FR.inbox.filter(m => !seen.has(m.id));
    lsSet('grpseen', FR.inbox.map(m => m.id));
    if(fresh.length) frNotify(fresh);
    renderSide(); if(cur==='friends') frPaint();
  }catch(e){}
}
async function frLoad(){
  const g = frGrp(); if(!g || !frOn() || FR.busy) return;
  FR.busy = true; FR.err = '';
  try{
    let mem;
    try{ mem = await fsList(frPath(g, 'members')); }
    catch(e){ await frPublish(true, g); mem = await fsList(frPath(g, 'members')); }   // eigener Eintrag fehlte: neu eintragen
    FR.members = mem; FR.tasks = await fsList(frPath(g, 'tasks')); FR.duels = await fsList(frPath(g, 'duels')); FR.t = Date.now();
    await frPublish(!mem.some(m => m.id===lsGet('auth').uid), g);
  }catch(e){ FR.err = e.message; }
  FR.busy = false;
  await frPoll();
  if(cur==='friends') frPaint();
}
function frAgo(ts){
  if(!ts) return 'noch nicht gelernt';
  const dd = new Date(ts), day = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate()), diff = Math.round((pDate(gToday()) - day)/86400000);
  return diff<=0 ? 'heute gelernt' : diff===1 ? 'gestern gelernt' : diff<7 ? 'vor ' + diff + ' Tagen gelernt' : 'zuletzt am ' + dd.toLocaleDateString('de-CH', {day:'numeric', month:'numeric'}) + ' gelernt';
}
function frNavHtml(){
  const g = frGrp(), n = g && frOn() ? FR.inbox.length : 0;
  const sk = actStats().streak;
  const info = n ? n + ' Erinnerung' + (n===1 ? '' : 'en') : sk ? 'Streak ' + sk + (sk===1 ? ' Tag' : ' Tage') : !g ? 'Gruppe beitreten' : 'Gruppe ' + frStr(g.name, 40);
  return '<button class="subj gnav ' + (cur==='friends' ? 'active' : '') + '" data-s="friends" title="Freunde und Hausaufgaben" style="--a:' + FR_TILE.g1 + ';--b:' + FR_TILE.g2 + '">'
    + '<span class="stile"><svg viewBox="0 0 24 24" aria-hidden="true">' + FR_ICON + '</svg>' + (n ? '<span class="fbadge" aria-label="' + n + ' neue Erinnerungen">' + (n>9 ? '9+' : n) + '</span>' : '') + '</span>'
    + '<span class="txt"><span class="nm">Freunde</span><span class="pr">' + esc(info) + '</span></span></button>';
}
const frTyping = id => { const ae = document.activeElement, box = document.getElementById(id); return !!(box && ae && box.contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)); };
// Die drei Live-Bereiche neu zeichnen (nicht, solange du darin tippst)
function frPaint(){
  const g = frGrp(); if(!g || cur!=='friends') return;
  const a = lsGet('auth'), today = gToday(), done = store.get('grp.done', {}) || {};
  const subjLabel = id => { const x = SUBJECTS.find(y => y.id===id); return x ? x.label : 'Allgemein'; };
  const tasks = (FR.tasks || []).filter(t => typeof t.title==='string' && (!t.due || t.due >= FR.min7))
    .sort((p,q) => (p.due || '9999').localeCompare(q.due || '9999') || (p.at||0) - (q.at||0));
  const box = $('#frInbox');
  if(box && !frTyping('frInbox')) box.innerHTML = FR.inbox.length ? '<div class="card frinbox"><h3>Erinnerungen an dich</h3>' + FR.inbox.map(m => {
      const tk = m.task && FR.tasks ? FR.tasks.find(t => t.id===m.task) : null;
      return '<div class="gitem"><span class="gt">' + esc(frStr(m.text, 300)) + '<small>' + esc([frName(m.from) || frStr(m.fromName, 30) || 'Jemand', m.at ? new Date(m.at).toLocaleString('de-CH', {day:'numeric', month:'numeric', hour:'2-digit', minute:'2-digit'}) : '', tk && !frStr(m.text, 300).includes(frStr(tk.title, 120)) ? 'zu «' + frStr(tk.title, 120) + '»' : ''].filter(Boolean).join(' · ')) + '</small></span><button class="chip" data-frok="' + esc(m.id) + '">Erledigt</button></div>'; }).join('') + '</div>' : '';
  const mb = $('#frMembers');
  if(mb && !frTyping('frMembers')){
    const subs = SUBJECTS.filter(x => BANKS[x.id]);
    const list = (FR.members || []).slice().sort((p,q) => (p.id===a.uid ? -1 : q.id===a.uid ? 1 : frStr(p.name, 30).localeCompare(frStr(q.name, 30), 'de')));
    mb.innerHTML = (FR.err ? '<p class="fb bad">' + esc(FR.err) + '</p>' : '')
      + (FR.members===null ? (FR.err ? '' : '<p class="muted">Lädt …</p>') : list.map(m => {
        const me = m.id===a.uid, p = m.p && typeof m.p==='object' ? m.p : {};
        return '<div class="frmem"><div class="frhead"><span class="nm">' + esc(frStr(m.name, 30) || 'Ohne Namen') + (me ? ' <em>(du)</em>' : '') + '<small>' + esc(frAgo(typeof m.last==='number' ? m.last : 0)) + '</small></span>'
          + (me ? '' : '<button class="chip" data-frto="' + esc(m.id) + '">Erinnern</button>') + '</div>'
          + '<div class="frbars">' + subs.map(x => { const v = frPct(p[x.id]); return '<div class="frbar" style="--a:' + x.g1 + ';--b:' + x.g2 + '"><span><em>' + esc(x.label) + '</em><b>' + (v===null ? '–' : v + ' %') + '</b></span><i><u style="width:' + (v || 0) + '%"></u></i></div>'; }).join('') + '</div>'
          + (FR.to===m.id ? '<div class="frsend"><div class="gform"><label class="gl-t">Nachricht an ' + esc(frStr(m.name, 30)) + '<input type="text" id="frSendT" maxlength="300" value="' + esc(FR.draft) + '"></label>'
            + '<label>Zu einer Hausaufgabe<select id="frSendK"><option value="">keine</option>' + tasks.map(t => '<option value="' + esc(t.id) + '">' + esc(frStr(t.title, 60)) + '</option>').join('') + '</select></label></div>'
            + '<div class="row" style="margin-top:var(--s2)"><button class="btn" id="frSendGo">Senden</button><button class="btn ghost" id="frSendX">Abbrechen</button></div><p class="fb" id="frSendMsg" role="status"></p></div>' : '')
          + '</div>'; }).join('') + (FR.members && list.length===1 ? '<p class="muted">Noch bist du allein in der Gruppe. Schick den Code unten an deine Freunde.</p>' : ''));
  }
  const rk = $('#frRank'); if(rk) rk.innerHTML = FR.members===null ? '<p class="muted">Lädt …</p>' : frRankHtml();
  const du = $('#frDuels'); if(du && !frTyping('frDuels')) du.innerHTML = frDuelsHtml();
  const tb = $('#frTasks');
  if(tb && !frTyping('frTasks')) tb.innerHTML = FR.tasks===null ? '' : !tasks.length ? '<p class="muted" style="margin:var(--s3) 0 0">Noch keine Hausaufgaben eingetragen.</p>' : tasks.map(t => {
      const dn = !!done[t.id], late = !dn && t.due && t.due < today, mine = t.by===a.uid, due = typeof t.due==='string' && /^\d{4}-\d{2}-\d{2}$/.test(t.due) ? t.due : '';
      return '<div class="frtask' + (dn ? ' done' : '') + '"><input type="checkbox" data-frck="' + esc(t.id) + '"' + (dn ? ' checked' : '') + ' aria-label="Erledigt"><span class="gt">' + esc(frStr(t.title, 120))
        + '<small>' + esc([subjLabel(t.subj), due ? 'bis ' + gDate(due) + (due===today ? ' (heute)' : '') : 'ohne Datum', 'von ' + (frName(t.by) || frStr(t.byName, 30) || 'jemandem')].join(' · ')) + (late ? ' · <span class="gbad">überfällig</span>' : '') + '</small></span>'
        + '<button class="chip" data-frall="' + esc(t.id) + '">Alle erinnern</button>' + (mine ? '<span class="gact"><button data-frdel="' + esc(t.id) + '" aria-label="Hausaufgabe löschen" title="Löschen">' + gSvg('del') + '</button></span>' : '') + '</div>'; }).join('');
  frBind();
}
async function frSend(to, text, task){
  const g = frGrp(), a = lsGet('auth'); let ok = 0;
  for(const uid of to){
    const {r} = await fsReq(frPath(g, 'members', uid, 'inbox'), 'POST', {fields:fsFields({from:a.uid, fromName:g.me, text, task:task || '', at:Date.now()})});
    if(r.ok) ok++; else if(r.status===403 && to.length===1) throw frErr(r);
  }
  return ok;
}
function frBind(){
  const m = $('#main'), g = frGrp(); if(!g) return;
  duBind();
  m.querySelectorAll('[data-frok]').forEach(b => b.onclick = async () => { b.disabled = true;
    try{ const {r} = await fsReq(frPath(g, 'members', lsGet('auth').uid, 'inbox', b.dataset.frok), 'DELETE'); if(!r.ok && r.status!==404) throw frErr(r); FR.inbox = FR.inbox.filter(x => x.id!==b.dataset.frok); renderSide(); frPaint(); }
    catch(e){ b.disabled = false; alert(e.message); } });
  m.querySelectorAll('[data-frto]').forEach(b => b.onclick = () => { FR.to = FR.to===b.dataset.frto ? null : b.dataset.frto; FR.draft = FR.draft || 'Denk ans Lernen!'; frPaint(); const i = $('#frSendT'); if(i) i.focus(); });
  if($('#frSendX')) $('#frSendX').onclick = () => { FR.to = null; frPaint(); };
  if($('#frSendT')) $('#frSendT').oninput = e => { FR.draft = e.target.value; };
  if($('#frSendGo')) $('#frSendGo').onclick = async () => {
    const t = $('#frSendT').value.trim(), msg = $('#frSendMsg');
    if(!t){ msg.className = 'fb bad'; msg.textContent = 'Schreib eine kurze Nachricht.'; return; }
    msg.className = 'fb'; msg.textContent = 'Wird gesendet …';
    try{ await frSend([FR.to], t, $('#frSendK').value); const nm = frName(FR.to); FR.to = null; FR.draft = ''; frPaint(); frToast('Erinnerung an ' + (nm || 'deinen Freund') + ' gesendet.'); }
    catch(e){ msg.className = 'fb bad'; msg.textContent = e.message; } };
  m.querySelectorAll('[data-frck]').forEach(c => c.onchange = () => { const d = store.get('grp.done', {}) || {}; if(c.checked) d[c.dataset.frck] = 1; else delete d[c.dataset.frck]; store.set('grp.done', d); frPaint(); });
  m.querySelectorAll('[data-frdel]').forEach(b => b.onclick = async () => {
    const t = (FR.tasks || []).find(x => x.id===b.dataset.frdel); if(!t || !confirm('«' + frStr(t.title, 120) + '» für alle in der Gruppe löschen?')) return;
    try{ const {r} = await fsReq(frPath(g, 'tasks', t.id), 'DELETE'); if(!r.ok && r.status!==404) throw frErr(r); FR.tasks = FR.tasks.filter(x => x.id!==t.id); frPaint(); }catch(e){ alert(e.message); } });
  m.querySelectorAll('[data-frall]').forEach(b => b.onclick = async () => {
    const t = (FR.tasks || []).find(x => x.id===b.dataset.frall), others = (FR.members || []).filter(x => x.id!==lsGet('auth').uid);
    if(!t) return; if(!others.length){ alert('Noch ist niemand sonst in der Gruppe.'); return; }
    if(!confirm('Alle ' + others.length + ' anderen in der Gruppe an «' + frStr(t.title, 120) + '» erinnern?')) return;
    b.disabled = true;
    try{ const n = await frSend(others.map(x => x.id), 'Erinnerung: «' + frStr(t.title, 120) + '»' + (t.due ? ' bis ' + gDate(t.due) : ''), t.id); frToast(n + ' Erinnerung' + (n===1 ? '' : 'en') + ' gesendet.'); }
    catch(e){ alert(e.message); } b.disabled = false; });
}
function frToast(txt){ let t = $('#frtoast'); if(!t){ t = document.createElement('div'); t.id = 'frtoast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.innerHTML = '<span></span>'; t.querySelector('span').textContent = txt; clearTimeout(frToast.t); frToast.t = setTimeout(() => t.remove(), 3500); }
function viewFriends(){
  if(DU.play && frGrp() && frOn()) return duView();
  const m = $('#main'), g = frGrp(), a = frOn() ? lsGet('auth') : null;
  FR.min7 = (() => { const d = pDate(gToday()); d.setDate(d.getDate() - 7); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); })();
  const hero = sub => '<header class="hero ghero"><span class="hicon"><svg viewBox="0 0 24 24" aria-hidden="true">' + FR_ICON + '</svg></span><div class="htxt"><p class="hkick">BBW</p><h2>Freunde</h2><p class="hsub">' + sub + '</p></div></header>';
  const privacy = '<p class="ghint">Deine Gruppe sieht nur deinen Namen, wie viel Prozent du pro Fach verstanden hast und wann du zuletzt gelernt hast. Noten, Notizen und deine E-Mail bleiben privat.</p>';
  if(!a){
    m.innerHTML = hero('Fortschritt teilen, Hausaufgaben und Erinnerungen') + '<div id="view">' + actCard() + '<div class="card"><h3>' + (fbOn() ? 'Melde dich zuerst an</h3><p class="muted">Mit einem Konto könnt ihr euren Lernfortschritt teilen und euch an Hausaufgaben erinnern.</p><div class="row"><button class="btn" id="frLogin">Anmelden oder Konto erstellen</button></div>' : 'Klassengruppe</h3><p class="muted">Für Klassengruppen, gemeinsame Hausaufgaben und Duelle braucht das Lerntool ein eigenes Firebase-Projekt.</p>') + '' + privacy + '</div></div>';
    if($('#frLogin')) $('#frLogin').onclick = openSync;
    return;
  }
  if(!g){
    m.innerHTML = hero('Fortschritt teilen, Hausaufgaben und Erinnerungen') + '<div id="view">' + actCard()
      + '<div class="card"><h3>Gruppe beitreten</h3><p class="muted">Frag jemanden aus deiner Gruppe nach dem Code.</p><div class="gform"><label class="gl-n">Code<input type="text" id="frJC" maxlength="12" placeholder="ABCD-EFGH" autocomplete="off" autocapitalize="characters" spellcheck="false"></label><label class="gl-t">Dein Name in der Gruppe<input type="text" id="frJN" maxlength="30" placeholder="z. B. Alex"></label></div>'
      + '<div class="row" style="margin-top:var(--s3)"><button class="btn" id="frJoin">Beitreten</button></div><p class="fb" id="frJMsg" role="status"></p></div>'
      + '<div class="card"><h3>Neue Gruppe erstellen</h3><p class="muted">Du bekommst einen Code, den du in den Klassenchat schicken kannst.</p><div class="gform"><label class="gl-t">Name der Gruppe<input type="text" id="frNG" maxlength="40" value="BBW"></label><label class="gl-t">Dein Name in der Gruppe<input type="text" id="frNN" maxlength="30" placeholder="z. B. Alex"></label></div>'
      + '<div class="row" style="margin-top:var(--s3)"><button class="btn ghost" id="frNew">Gruppe erstellen</button></div><p class="fb" id="frNMsg" role="status"></p>' + privacy + '</div></div>';
    const say = (id, t, ok) => { const e = $(id); e.className = 'fb' + (ok===undefined ? '' : ok ? ' ok' : ' bad'); e.textContent = t; };
    const clean = v => v.trim().replace(/\s+/g, ' ');
    $('#frJoin').onclick = async () => {
      const code = frNorm($('#frJC').value), me = clean($('#frJN').value);
      if(code.length!==8 || /[^A-Z2-9]/.test(code)) return say('#frJMsg', 'Der Code hat 8 Zeichen, zum Beispiel ABCD-EFGH.', false);
      if(!me) return say('#frJMsg', 'Gib deinen Namen ein.', false);
      say('#frJMsg', 'Einen Moment …');
      try{ const {r, j} = await fsReq('groups/' + code);
        if(r.status===404) return say('#frJMsg', 'Diesen Code gibt es nicht. Prüf ihn nochmals.', false);
        if(!r.ok) throw frErr(r);
        const ng = {id:code, name:frStr(fsDoc(j).name, 40) || 'Gruppe', me};
        FR.members = null; FR.tasks = null; FR.inbox = []; FR.t = 0;
        await frPublish(true, ng); store.set('grp', ng); render(); }
      catch(e){ say('#frJMsg', e.message, false); } };
    $('#frNew').onclick = async () => {
      const name = clean($('#frNG').value), me = clean($('#frNN').value);
      if(!name) return say('#frNMsg', 'Gib der Gruppe einen Namen.', false);
      if(!me) return say('#frNMsg', 'Gib deinen Namen ein.', false);
      say('#frNMsg', 'Einen Moment …');
      try{
        for(let i = 0; i < 4; i++){
          const code = frCode(), {r} = await fsReq('groups?documentId=' + code, 'POST', {fields:fsFields({name, owner:lsGet('auth').uid, created:Date.now()})});
          if(r.status===409) continue; if(!r.ok) throw frErr(r);
          const ng = {id:code, name, me}; FR.members = null; FR.tasks = null; FR.inbox = []; FR.t = 0;
          await frPublish(true, ng); store.set('grp', ng); render(); return;
        }
        throw new Error('Kein freier Code gefunden. Versuch es nochmals.');
      }catch(e){ say('#frNMsg', e.message, false); } };
    return;
  }
  const canN = typeof Notification!=='undefined';
  const subOpts = '<option value="">Allgemein</option>' + SUBJECTS.map(x => '<option value="' + x.id + '">' + esc(x.label) + '</option>').join('');
  m.innerHTML = hero('Gruppe «' + esc(frStr(g.name, 40)) + '» · Code ' + frFmt(g.id)) + '<div id="view">'
    + '<div id="frInbox"></div>' + actCard()
    + '<div class="card"><h3>Rangliste diese Woche</h3><div id="frRank"></div><p class="ghint">Gezählt werden aktive Lernminuten von Montag bis Sonntag. Daneben steht der Streak.</p></div>'
    + '<div class="card"><h3>Quiz-Duell</h3><div id="frDuels"></div></div>'
    + '<div class="card"><h3>Wer ist wie weit?</h3><div id="frMembers"></div><div class="row" style="margin-top:var(--s3)"><button class="btn ghost" id="frReload">Aktualisieren</button></div></div>'
    + '<div class="card"><h3>Hausaufgaben und Termine</h3><p class="muted">Alle in der Gruppe sehen die Liste. Abhaken gilt nur für dich.</p>'
    + '<div class="gform"><label>Fach<select id="frTS">' + subOpts + '</select></label><label class="gl-t">Was?<input type="text" id="frTT" maxlength="120" placeholder="z. B. Aufgabe 27 fertig lösen"></label><label>Bis<input type="date" id="frTD"></label></div>'
    + '<div class="row" style="margin-top:var(--s3)"><button class="btn" id="frTAdd">Eintragen</button></div><p class="fb" id="frTMsg" role="status"></p><div id="frTasks"></div></div>'
    + '<div class="card"><h3>Gruppe</h3><p style="margin:0 0 var(--s2)">Code zum Einladen: <b class="frcode">' + frFmt(g.id) + '</b></p><div class="row"><button class="btn ghost" id="frCopy">Code kopieren</button></div>'
    + '<h4>Benachrichtigungen</h4><p class="muted" id="frNState" style="margin:0 0 var(--s2)">' + (!canN ? 'Dieser Browser kann keine Benachrichtigungen zeigen. Erinnerungen siehst du hier und als Zahl bei «Freunde».' : Notification.permission==='granted' ? 'An. Neue Erinnerungen erscheinen als Benachrichtigung, solange das Lerntool offen ist.' : Notification.permission==='denied' ? 'Im Browser blockiert. Du kannst sie in den Website-Einstellungen erlauben.' : 'Aus. Erinnerungen siehst du hier und als Zahl bei «Freunde».') + '</p>'
    + (canN && Notification.permission==='default' ? '<div class="row"><button class="btn ghost" id="frNotif">Benachrichtigungen erlauben</button></div>' : '')
    + '<h4>Dein Name in der Gruppe</h4><div class="gx"><label class="gl-t">Name<input type="text" id="frMe" maxlength="30" value="' + esc(g.me) + '"></label></div><div class="row" style="margin-top:var(--s2)"><button class="btn ghost" id="frMeSave">Speichern</button></div><p class="fb" id="frMeMsg" role="status"></p>'
    + privacy + '<div class="row" style="margin-top:var(--s3)"><button class="chip" id="frLeave">Gruppe verlassen</button></div></div></div>';
  frPaint();
  $('#frReload').onclick = () => { FR.t = 0; frLoad(); };
  $('#frCopy').onclick = async () => { try{ await navigator.clipboard.writeText(frFmt(g.id)); frToast('Code ' + frFmt(g.id) + ' kopiert.'); }catch(e){ frToast('Code: ' + frFmt(g.id)); } };
  if($('#frNotif')) $('#frNotif').onclick = () => Notification.requestPermission().then(() => render());
  $('#frMeSave').onclick = async () => { const me = $('#frMe').value.trim().replace(/\s+/g, ' '), el = $('#frMeMsg');
    if(!me){ el.className = 'fb bad'; el.textContent = 'Gib einen Namen ein.'; return; }
    try{ const ng = {...g, me}; await frPublish(true, ng); store.set('grp', ng); el.className = 'fb ok'; el.textContent = 'Gespeichert.'; }catch(e){ el.className = 'fb bad'; el.textContent = e.message; } };
  $('#frTAdd').onclick = async () => {
    const title = $('#frTT').value.trim().replace(/\s+/g, ' '), due = $('#frTD').value, subj = $('#frTS').value, el = $('#frTMsg');
    if(!title){ el.className = 'fb bad'; el.textContent = 'Schreib, was zu tun ist.'; return; }
    el.className = 'fb'; el.textContent = 'Wird eingetragen …';
    try{ const {r, j} = await fsReq(frPath(g, 'tasks'), 'POST', {fields:fsFields({title, subj, due:/^\d{4}-\d{2}-\d{2}$/.test(due) ? due : '', by:lsGet('auth').uid, byName:g.me, at:Date.now()})});
      if(!r.ok) throw frErr(r);
      FR.tasks = (FR.tasks || []).concat([fsDoc(j)]); $('#frTT').value = ''; $('#frTD').value = ''; el.className = 'fb ok'; el.textContent = 'Eingetragen. Alle in der Gruppe sehen es.'; frPaint(); }
    catch(e){ el.className = 'fb bad'; el.textContent = e.message; } };
  $('#frTT').addEventListener('keydown', ev => { if(ev.key==='Enter'){ ev.preventDefault(); $('#frTAdd').click(); } });
  $('#frLeave').onclick = async () => {
    if(!confirm('Gruppe «' + frStr(g.name, 40) + '» verlassen? Deine Freunde sehen dich dann nicht mehr. Hausaufgaben, die du eingetragen hast, bleiben.')) return;
    try{ const uid = lsGet('auth').uid;
      for(const x of FR.inbox) await fsReq(frPath(g, 'members', uid, 'inbox', x.id), 'DELETE');
      const {r} = await fsReq(frPath(g, 'members', uid), 'DELETE'); if(!r.ok && r.status!==404) throw frErr(r);
      store.set('grp', null); lsSet('grppub', null); FR.members = null; FR.tasks = null; FR.inbox = []; FR.to = null; render(); }
    catch(e){ alert(e.message); } };
  if(Date.now() - FR.t > 20000) frLoad();
}
/* ---------- Lern-Streak: aktive Lernminuten pro Tag ---------- */
const ACT_MIN = 5;   // ab so vielen Minuten zählt ein Tag für den Streak
const FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22.5c4.6 0 7.5-3 7.5-6.9 0-3.6-2.3-5.9-3.8-7.9-.4 1.7-1.3 2.8-2.3 3.3.1-3.6-1.2-6.9-4.1-9.5.3 3.2-1.4 5.5-3 7.6-1.3 1.7-2 3.6-2 6.5 0 3.9 2.9 6.9 7.7 6.9z"/></svg>';
const ymd = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
const actData = () => { const a = store.get('act', null); return a && typeof a==='object' && a.d && typeof a.d==='object' && !Array.isArray(a.d) ? a : {d:{}, lm:''}; };
let actLm = '';
function actTick(){
  const now = new Date(), day = ymd(now), mk = day + ' ' + now.getHours() + ':' + now.getMinutes();
  if(mk===actLm) return; actLm = mk;
  const a = actData(); if(a.lm===mk) return;
  a.lm = mk; a.d[day] = (a.d[day] || 0) + 1;
  const cut = new Date(now); cut.setDate(cut.getDate() - 120); const ck = ymd(cut);
  Object.keys(a.d).forEach(k => { if(k < ck) delete a.d[k]; });
  storeSetCloud('act', a); lsSet('grplast', Date.now());
  if(frGrp() && frOn()) frPubSoon();
  if(a.d[day]===ACT_MIN) renderSide();
}
function actStats(){
  const a = actData(), now = new Date(), tk = ymd(now), cnt = k => typeof a.d[k]==='number' ? a.d[k] : 0;
  let streak = 0; const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if(cnt(tk) < ACT_MIN) d.setDate(d.getDate() - 1);
  while(cnt(ymd(d)) >= ACT_MIN){ streak++; d.setDate(d.getDate() - 1); }
  const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate()); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  let week = 0; for(let i = 0; i < 7; i++){ const x = new Date(mon); x.setDate(mon.getDate() + i); week += cnt(ymd(x)); }
  return {streak, today:cnt(tk), week, wk:ymd(mon), lit:cnt(tk) >= ACT_MIN, d:a.d};
}
// Jede Bedienung in einem Fach (oder im Duell) zählt als aktive Minute
['pointerdown','keydown','input','wheel','touchstart'].forEach(ev => document.addEventListener(ev, () => { if(document.visibilityState==='visible' && (SUBJECTS.some(x => x.id===cur) || (cur==='friends' && DU.play))) actTick(); }, {passive:true, capture:true}));
window.addEventListener('scroll', () => { if(document.visibilityState==='visible' && SUBJECTS.some(x => x.id===cur)) actTick(); }, {passive:true});
function actHeat(d){
  const t = new Date(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const start = new Date(today); start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7*11);
  const S = 13, G = 3, L = 22, out = [];
  ['Mo','Mi','Fr'].forEach((n,i) => out.push('<text x="0" y="' + (i*2*(S+G) + 10) + '">' + n + '</text>'));
  for(let w = 0; w < 12; w++) for(let r = 0; r < 7; r++){
    const x = new Date(start); x.setDate(start.getDate() + w*7 + r); if(x > today) continue;
    const m = typeof d[ymd(x)]==='number' ? d[ymd(x)] : 0, lv = m===0 ? 0 : m < ACT_MIN ? 1 : m < 15 ? 2 : m < 30 ? 3 : 4;
    out.push('<rect x="' + (L + w*(S+G)) + '" y="' + (r*(S+G)) + '" width="' + S + '" height="' + S + '" rx="2" class="hl' + lv + '"><title>' + x.toLocaleDateString('de-CH', {weekday:'short', day:'numeric', month:'numeric'}) + ': ' + m + ' Min.</title></rect>');
  }
  return '<svg class="actheat" viewBox="0 0 ' + (L + 12*(S+G) - G) + ' ' + (7*(S+G) - G) + '" role="img" aria-label="Lernminuten der letzten 12 Wochen, je dunkler, desto mehr">' + out.join('') + '</svg>';
}
function actCard(){
  const s = actStats(), left = ACT_MIN - s.today;
  const txt = s.lit ? 'Heute geschafft: ' + s.today + ' Minuten gelernt.' : s.streak ? 'Heute ' + s.today + ' von ' + ACT_MIN + ' Minuten. Lern noch ' + left + ' Minute' + (left===1 ? '' : 'n') + ', dann hält dein Streak.' : 'Lern heute ' + ACT_MIN + ' Minuten, dann startet dein Streak.';
  return '<div class="card"><div class="actrow"><div class="actflame' + (s.lit ? ' lit' : s.streak ? ' warm' : '') + '">' + FLAME + '<b>' + s.streak + '</b></div>'
    + '<div class="acttxt"><h3>' + (s.streak ? s.streak + (s.streak===1 ? ' Tag' : ' Tage') + ' am Stück' : 'Noch kein Streak') + '</h3><p class="muted">' + txt + '</p></div>'
    + '<div class="actweek"><b>' + s.week + '</b>Min. diese Woche</div></div>' + actHeat(s.d)
    + '<p class="ghint">Gezählt werden Minuten, in denen du in einem Fach etwas machst: lesen, Aufgaben lösen, Karteikarten, Labor, Duelle. Ein Tag zählt ab ' + ACT_MIN + ' Minuten.</p></div>';
}
function frRankHtml(){
  const me = lsGet('auth').uid, as = actStats(), today = ymd(new Date()), y = new Date(); y.setDate(y.getDate() - 1); const yd = ymd(y);
  const num = v => typeof v==='number' && isFinite(v) ? Math.max(0, Math.round(v)) : 0;
  const rows = (FR.members || []).map(m => ({id:m.id, name:frStr(m.name, 30) || 'Ohne Namen', wm:m.wk===as.wk ? num(m.wm) : 0, st:m.sd===today || m.sd===yd ? num(m.st) : 0}))
    .sort((p,q) => q.wm - p.wm || q.st - p.st || p.name.localeCompare(q.name, 'de'));
  const max = Math.max(1, ...rows.map(r => r.wm));
  return rows.map((r,i) => '<div class="rkrow' + (r.id===me ? ' me' : '') + (i===0 && r.wm>0 ? ' top' : '') + '"><span class="rkpos">' + (i+1) + '</span><span class="rkname">' + esc(r.name) + (r.id===me ? ' <em>(du)</em>' : '')
    + '<i><u style="width:' + (r.wm/max*100).toFixed(1) + '%"></u></i></span><span class="rkmin">' + r.wm + ' Min.</span><span class="rkst' + (r.st ? ' on' : '') + '" title="Streak: ' + r.st + ' Tage">' + FLAME + r.st + '</span></div>').join('');
}

/* ---------- Quiz-Duell: gleiche 8 Fragen für beide, erzeugt aus einem gemeinsamen Zufallsschlüssel ---------- */
// In der Cloud steht nur der Schlüssel, nie Fragen-HTML: so kann niemand über ein Duell fremden Code einschleusen.
const DUEL_N = 8, DU = {play:null, timer:null};
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function duelQs(subj, seed){ const R = Math.random; Math.random = mulberry(seed); try{ return buildPTest(subj, DUEL_N, BANKS[subj]().topics); } finally{ Math.random = R; } }
function duelFp(subj){ const k = BANKS[subj]().bank.map(b => b.key).join('|'); let h = 0; for(let i = 0; i < k.length; i++) h = (Math.imul(h, 31) + k.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + '.' + k.length; }
const duOk = id => typeof id==='string' && Object.prototype.hasOwnProperty.call(BANKS, id);
const duSubjects = () => SUBJECTS.filter(x => duOk(x.id));
const duLabel = id => (SUBJECTS.find(x => x.id===id) || {label:''}).label;
function duRes(str, n){
  try{ const o = JSON.parse(str); if(!o || typeof o.s!=='number' || typeof o.t!=='number') return null;
    return {s:Math.max(0, Math.min(n, Math.round(o.s*10)/10)), t:Math.max(0, Math.round(o.t)), d:Array.isArray(o.d) ? o.d.slice(0, n).map(x => typeof x==='number' ? Math.max(0, Math.min(1, x)) : 0) : []}; }catch(e){ return null; }
}
const duFmt = x => String(Math.round(x*10)/10).replace('.', ',');
const duTime = t => Math.floor(t/60) + ':' + String(t%60).padStart(2,'0');
// 1 = erster gewinnt, -1 = zweiter, 0 = unentschieden
const duCmp = (x, y) => x.s!==y.s ? (x.s > y.s ? 1 : -1) : x.t!==y.t ? (x.t < y.t ? 1 : -1) : 0;
function duStart(o){
  const qs = duelQs(o.subj, o.seed);
  if(!qs.length){ alert('Für dieses Fach gibt es noch keine Fragen.'); return; }
  DU.play = {...o, qs, i:0, t0:Date.now(), done:false, res:null, saved:false, saving:false, err:''};
  render(); window.scrollTo(0,0);
}
function duView(){
  const P = DU.play, m = $('#main'), lab = duLabel(P.subj);
  clearInterval(DU.timer);
  if(!P.done){
    const q = P.qs[P.i], last = P.i===P.qs.length - 1;
    m.innerHTML = '<div class="duhead"><button class="btn ghost" id="duX">Abbrechen</button><div class="duprog">Frage ' + (P.i+1) + ' von ' + P.qs.length + '<i><u style="width:' + (P.i/P.qs.length*100).toFixed(1) + '%"></u></i></div><b class="dutime" id="duTime">0:00</b></div>'
      + '<p class="duvs">Quiz-Duell gegen <b>' + esc(P.opp.name) + '</b> · ' + esc(lab) + '</p><div id="duQ"></div>'
      + '<div class="row" style="justify-content:flex-end;margin-top:var(--s3)"><button class="btn" id="duNext">' + (last ? 'Fertig' : 'Weiter') + '</button></div>';
    $('#duQ').appendChild(ptQEl(q, P.i, false));
    const tick = () => { const el = $('#duTime'); if(el) el.textContent = duTime(Math.floor((Date.now() - P.t0)/1000)); };
    tick(); DU.timer = setInterval(tick, 500);
    const next = () => {
      if(!ptAnswered(q) && !confirm('Diese Frage ist noch offen. Trotzdem weiter?')) return;
      if(!last){ P.i++; duView(); window.scrollTo(0,0); } else duFinish();
    };
    $('#duNext').onclick = next;
    $('#duQ').querySelectorAll('input[type=text]').forEach(i => i.addEventListener('keydown', ev => { if(ev.key==='Enter'){ ev.preventDefault(); next(); } }));
    const first = $('#duQ').querySelector('input[type=text]'); if(first) first.focus({preventScroll:true});
    $('#duX').onclick = () => { if(confirm(P.mine==='a' ? 'Duell abbrechen? Die Herausforderung wird nicht gesendet.' : 'Duell abbrechen? Du kannst es später nochmals von vorne spielen.')){ clearInterval(DU.timer); DU.play = null; render(); } };
    return;
  }
  const r = P.res, o = P.other, c = o ? duCmp(r, o) : null;
  const verdict = P.mine==='a' ? 'Herausforderung ' + (P.saved ? 'gesendet' : P.saving ? 'wird gesendet …' : 'noch nicht gesendet') : c===1 ? 'Gewonnen!' : c===-1 ? 'Verloren' : 'Unentschieden';
  const sub = P.mine==='a' ? 'Sobald ' + esc(P.opp.name) + ' gespielt hat, siehst du hier und unter «Quiz-Duell», wer gewonnen hat.' : 'Bei gleich vielen Punkten gewinnt die schnellere Zeit.';
  m.innerHTML = '<div class="card"><div class="duscore"><div><span>Du</span><b>' + duFmt(r.s) + '</b></div><div class="duc">:</div><div><span>' + esc(P.opp.name) + '</span><b>' + (o ? duFmt(o.s) : '?') + '</b></div></div>'
    + '<p class="duverdict">' + verdict + '</p><p class="dusub">' + P.qs.length + ' Fragen · deine Zeit ' + duTime(r.t) + (o ? ' · Zeit von ' + esc(P.opp.name) + ' ' + duTime(o.t) : '') + '<br>' + sub + '</p>'
    + (P.err ? '<p class="fb bad" style="text-align:center">' + esc(P.err) + '</p>' : '')
    + '<div class="row" style="justify-content:center"><button class="btn" id="duBack">Zurück zu Freunde</button>' + (P.err ? '<button class="btn ghost" id="duRetry">Nochmals senden</button>' : '') + '</div></div>'
    + '<h3 class="sectiontitle">Deine Antworten</h3><div id="duReview"></div>';
  const rv = $('#duReview'); P.qs.forEach((q,i) => rv.appendChild(ptQEl(q, i, true)));
  $('#duBack').onclick = () => { if(P.saving) return; DU.play = null; FR.t = 0; render(); window.scrollTo(0,0); };
  if($('#duRetry')) $('#duRetry').onclick = () => duSave();
}
function duFinish(){
  const P = DU.play; clearInterval(DU.timer);
  const d = P.qs.map(q => { q.score = scoreQ(q); return Math.round(q.score*100)/100; });
  P.res = {s:Math.round(d.reduce((x,y) => x + y, 0)*10)/10, t:Math.round((Date.now() - P.t0)/1000), d};
  P.done = true; duSave(); window.scrollTo(0,0);
}
async function duSave(){
  const P = DU.play, g = frGrp(), a = lsGet('auth'), lab = duLabel(P.subj);
  P.err = ''; P.saving = true; if(cur==='friends') duView();
  try{
    if(P.mine==='a'){
      const {r, j} = await fsReq(frPath(g, 'duels'), 'POST', {fields:fsFields({a:a.uid, aName:g.me, b:P.opp.id, bName:frStr(P.opp.name, 30), subj:P.subj, seed:P.seed, fp:P.fp, n:P.qs.length, ra:JSON.stringify(P.res), rb:'', at:Date.now()})});
      if(!r.ok) throw frErr(r);
      FR.duels = (FR.duels || []).concat([fsDoc(j)]);
      frSend([P.opp.id], g.me + ' fordert dich zum Quiz-Duell in ' + lab + ' heraus: ' + duFmt(P.res.s) + ' von ' + P.qs.length + ' Punkten. Schaffst du mehr?', '').catch(() => {});
    } else {
      const {r} = await fsReq(frPath(g, 'duels', P.did) + '?updateMask.fieldPaths=rb', 'PATCH', {fields:fsFields({rb:JSON.stringify(P.res)})});
      if(!r.ok) throw frErr(r);
      const dd = (FR.duels || []).find(x => x.id===P.did); if(dd) dd.rb = JSON.stringify(P.res);
      const c = P.other ? duCmp(P.res, P.other) : 0;
      frSend([P.opp.id], g.me + ' hat euer Duell in ' + lab + ' gespielt: ' + duFmt(P.other ? P.other.s : 0) + ' : ' + duFmt(P.res.s) + '. ' + (c===1 ? g.me + ' hat gewonnen.' : c===-1 ? 'Du hast gewonnen!' : 'Unentschieden.'), '').catch(() => {});
    }
    P.saved = true;
  }catch(e){ P.err = e.message; }
  P.saving = false;
  if(DU.play===P && cur==='friends') duView();
}
function frDuelsHtml(){
  const me = lsGet('auth').uid, others = (FR.members || []).filter(m => m.id!==me);
  const valid = d => typeof d.a==='string' && typeof d.b==='string' && duOk(d.subj) && Number.isInteger(d.seed);
  const mine = (FR.duels || []).filter(d => valid(d) && (d.a===me || d.b===me)).sort((p,q) => (q.at||0) - (p.at||0));
  const nm = (uid, fb) => frName(uid) || frStr(fb, 30) || 'jemand';
  const n = d => Math.max(1, Math.min(20, Number.isInteger(d.n) ? d.n : DUEL_N));
  const turn = mine.filter(d => d.b===me && !d.rb), wait = mine.filter(d => d.a===me && !d.rb), done = mine.filter(d => d.rb).slice(0, 8);
  const subOpts = duSubjects().map(x => '<option value="' + x.id + '">' + esc(x.label) + '</option>').join('');
  let h = others.length
    ? '<div class="gform"><label>Gegen<select id="duOpp">' + others.map(m => '<option value="' + esc(m.id) + '">' + esc(frStr(m.name, 30) || 'Ohne Namen') + '</option>').join('') + '</select></label><label>Fach<select id="duSubj">' + subOpts + '</select></label></div>'
      + '<div class="row" style="margin-top:var(--s3)"><button class="btn" id="duGo">Herausfordern</button></div><p class="ghint">' + DUEL_N + ' Fragen, für beide dieselben. Es zählen die Punkte, bei Gleichstand gewinnt die schnellere Zeit.</p>'
    : '<p class="muted">Sobald jemand in der Gruppe ist, kannst du ein Duell starten.</p>';
  if(turn.length) h += '<h4>Du bist dran</h4>' + turn.map(d => '<div class="duitem"><span class="gt"><b>' + esc(nm(d.a, d.aName)) + '</b> fordert dich heraus<small>' + esc(duLabel(d.subj)) + ' · ' + n(d) + ' Fragen</small></span><button class="btn" data-duplay="' + esc(d.id) + '">Spielen</button></div>').join('');
  if(wait.length) h += '<h4>Warten auf die anderen</h4>' + wait.map(d => { const ra = duRes(d.ra, n(d));
    return '<div class="duitem"><span class="gt">' + esc(nm(d.b, d.bName)) + '<small>' + esc(duLabel(d.subj)) + (ra ? ' · du: ' + duFmt(ra.s) + ' von ' + n(d) : '') + '</small></span><span class="dutag wait">wartet</span></div>'; }).join('');
  if(done.length) h += '<h4>Fertig</h4>' + done.map(d => {
    const ra = duRes(d.ra, n(d)), rb = duRes(d.rb, n(d)); if(!ra || !rb) return '';
    const iA = d.a===me, my = iA ? ra : rb, ot = iA ? rb : ra, c = duCmp(my, ot), other = iA ? nm(d.b, d.bName) : nm(d.a, d.aName);
    return '<div class="duitem"><span class="gt">Du ' + duFmt(my.s) + ' : ' + duFmt(ot.s) + ' ' + esc(other) + '<small>' + esc(duLabel(d.subj)) + ' · ' + duTime(my.t) + ' gegen ' + duTime(ot.t) + '</small></span><span class="dutag ' + (c===1 ? 'win' : c===-1 ? 'lose' : 'tie') + '">' + (c===1 ? 'gewonnen' : c===-1 ? 'verloren' : 'unentschieden') + '</span></div>'; }).join('');
  return h;
}
function duBind(){
  const me = lsGet('auth').uid;
  if($('#duGo')) $('#duGo').onclick = () => {
    const opp = $('#duOpp').value, subj = $('#duSubj').value, m = (FR.members || []).find(x => x.id===opp);
    if(!m || !duOk(subj)) return;
    const b = new Uint32Array(1); crypto.getRandomValues(b);
    duStart({opp:{id:m.id, name:frStr(m.name, 30) || 'Ohne Namen'}, subj, seed:b[0] >>> 1, fp:duelFp(subj), mine:'a', other:null});
  };
  document.querySelectorAll('[data-duplay]').forEach(btn => btn.onclick = () => {
    const d = (FR.duels || []).find(x => x.id===btn.dataset.duplay); if(!d || d.b!==me || d.rb || !duOk(d.subj) || !Number.isInteger(d.seed)) return;
    if(d.fp!==duelFp(d.subj)){ alert('Ihr habt verschiedene Versionen des Lerntools. Lade die App neu (oder schliess sie einmal) und versuch es nochmals. Hilft das nicht, muss ' + (frName(d.a) || 'die andere Person') + ' die App auch neu laden.'); return; }
    const nn = Math.max(1, Math.min(20, Number.isInteger(d.n) ? d.n : DUEL_N));
    duStart({did:d.id, opp:{id:d.a, name:frName(d.a) || frStr(d.aName, 30) || 'jemand'}, subj:d.subj, seed:d.seed, fp:d.fp, mine:'b', other:duRes(d.ra, nn)});
  });
}

setTimeout(frPoll, 1500);
setInterval(frPoll, 90000);
document.addEventListener('visibilitychange', () => { if(document.visibilityState==='visible') frPoll(); });
