const numIn = value => { const text = String(value).trim().replace(/[\s’']/g, "").replace(",", "."); return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text) ? Number(text) : NaN; };
const normalizedAnswer = value => String(value ?? "").trim().normalize("NFC").toLowerCase().replace(/\s+/g, " ");
const testSizes = count => count <= 10 ? [count] : [...new Set([10, Math.min(15, count), Math.min(20, count)])];

const shuffle = arr => { const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

/* ---------- Kleine Helfer ---------- */
const pDate = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); };
const todayKey = () => { const t=new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; };

const PT_KIND = {mc:'Multiple Choice', tf:'Richtig / Falsch', select:'Auswahl', fields:'Lücken füllen', match:'Zuordnen', num:'Rechnen', text:'Antwort tippen'};
const mcQ = q => ({kind:'mc', prompt:esc(q.q), opts:shuffle(q.a.map((t,k) => ({t:esc(t), ok:k===0}))), x:esc(q.x)});

// Themen werden reihum gemischt, damit jedes gewählte Thema vorkommt
function buildPTest(sid, n, topics){
  const {bank} = BANKS[sid]();
  const queues = topics.map(topic => shuffle(bank.filter(question => question.topic === topic)));
  const selected = [];
  while(selected.length < n && queues.some(queue => queue.length)){
    for(const queue of queues){
      if(queue.length && selected.length < n){
        const item = queue.pop();
        selected.push({...item.make(), topic:item.topic});
      }
    }
  }
  return shuffle(selected);
}
function ptAnswered(q){
  const r = q.resp; if(r===undefined || r===null || r==='') return false;
  if(q.kind==='fields') return q.fields.every((_,i) => r[i]);
  if(q.kind==='match') return q.pairs.every((_,i) => r[i]);
  return String(r).trim()!=='';
}
function scoreQ(q){
  const r = q.resp;
  switch(q.kind){
    case 'mc': return r!=null && q.opts[+r] && q.opts[+r].ok ? 1 : 0;
    case 'tf': return (r==='1' || r==='0') && (r==='1')===q.ans ? 1 : 0;
    case 'select': return r===q.ans ? 1 : 0;
    case 'fields': return q.fields.filter((f,i) => r && r[i] && (r[i]===f.ans || (f.acc||[]).includes(r[i]))).length / q.fields.length;
    case 'match': return q.pairs.filter((p,i) => r && r[i]===p[1]).length / q.pairs.length;
    case 'num': { const x = numIn(r||''); return !isNaN(x) && Math.abs(x-q.ans) <= q.tol ? 1 : 0; }
    case 'text': return q.ans.some(answer => normalizedAnswer(answer) === normalizedAnswer(r)) ? 1 : 0;
  }
  return 0;
}
function ptSol(q){
  switch(q.kind){
    case 'mc': return `Richtig: <b>${q.opts.find(o => o.ok).t}</b>${q.x ? ' · '+q.x : ''}`;
    case 'tf': return `Die Aussage ist <b>${q.ans ? 'richtig' : 'falsch'}</b>. ${q.x||''}`;
    case 'select': return `Richtig: <b>${esc(q.ans)}</b>. ${q.x||''}`;
    case 'fields': return q.fields.map(f => `${esc(f.label)}: <b>${esc(f.ans)}</b>`).join(' · ') + (q.x ? '<br>'+q.x : '');
    case 'match': return q.pairs.map(p => `<b>${esc(p[0])}</b> → ${esc(p[1])}`).join('<br>');
    case 'num': return q.x;
    case 'text': { return 'Lösung: <b>' + esc(q.ans[0]) + '</b>' + (q.ans.length>1 ? ' <span class="muted">(auch möglich: ' + q.ans.slice(1).map(esc).join(' · ') + ')</span>' : '') + (q.x ? '<br>'+q.x : ''); }
  }
}
const optsH = (opts, sel) => '<option value="">–</option>' + opts.map(o => `<option ${o===sel?'selected':''}>${esc(o)}</option>`).join('');
const fmtP = x => x===1 ? '1' : x===0 ? '0' : String(Math.round(x*100)/100);
function ptQEl(q, i, done){
  const el = document.createElement('div'); el.className = 'card ptq'; el.id = 'ptq'+i;
  const r = q.resp, dis = done ? 'disabled' : '';
  const okCls = ok => done ? (ok ? 'ok' : 'bad') : '';
  let prompt = q.prompt || '', body = '';
  switch(q.kind){
    case 'mc': body = `<div class="opts">${q.opts.map((o,k) => `<label class="opt ${done ? (o.ok ? 'ok' : (String(r)===String(k) ? 'bad' : '')) : ''}"><input type="radio" name="pq${i}" value="${k}" ${String(r)===String(k)?'checked':''} ${dis}> ${o.t}</label>`).join('')}</div>`; break;
    case 'tf': body = `<div class="nopt">${[['1','Richtig'],['0','Falsch']].map(([v,l]) => `<label class="opt ${done ? ((v==='1')===q.ans ? 'ok' : (r===v ? 'bad' : '')) : ''}"><input type="radio" name="pq${i}" value="${v}" ${r===v?'checked':''} ${dis}> ${l}</label>`).join('')}</div>`; break;
    case 'select': body = `<select class="${okCls(r===q.ans)}" ${dis}>${optsH(q.opts, r)}</select>`; break;
    case 'fields': body = q.fields.map((f,j) => { const v = (r||{})[j];
      return `<div class="row" style="margin:var(--s2) 0"><span style="min-width:130px">${esc(f.label)}</span><select data-j="${j}" class="${okCls(v===f.ans || (f.acc||[]).includes(v))}" ${dis} style="max-width:100%">${optsH(f.opts, v)}</select></div>`; }).join(''); break;
    case 'match': if(!q.rights) q.rights = shuffle(q.pairs.map(p => p[1]));
      body = q.pairs.map((p,j) => { const v = (r||{})[j];
        return `<div class="q stack"><b>${esc(p[0])}</b><select data-j="${j}" class="${okCls(v===p[1])}" ${dis} style="max-width:100%">${optsH(q.rights, v)}</select></div>`; }).join(''); break;
    case 'num': body = `<div class="row"><input type="text" inputmode="decimal" class="${done ? okCls(q.score===1) : ''}" value="${esc(r||'')}" ${dis} placeholder="Resultat"><span class="muted">${esc(q.unit||'')}</span></div>`; break;
    case 'text': body = `<input type="text" style="width:100%" class="${done ? (q.score===1 ? 'ok' : q.score>0 ? 'warn' : 'bad') : ''}" value="${esc(r||'')}" ${dis} placeholder="${esc(q.ph||'Deine Antwort')}" autocomplete="off" autocapitalize="off" spellcheck="false" lang="de-CH">`; break;
  }
  const sc = q.score;
  const badge = done ? `<span class="badge ${sc===1 ? 'good' : sc>0 ? 'mid' : 'low'}">${sc===1 ? 'richtig' : sc>0 ? 'teilweise' : 'falsch'} · ${fmtP(sc)} P.</span> ` : '';
  el.innerHTML = `<div class="meta">Frage ${i+1} · ${PT_KIND[q.kind]} · ${esc(q.topic)}${q.src ? ' · '+esc(q.src) : ''}</div>
    <div class="ptprompt">${prompt}</div><div>${body}</div>${done ? `<div class="expl">${badge}${ptSol(q)}</div>` : ''}`;
  if(!done){
    el.querySelectorAll('input[type=radio]').forEach(x => x.onchange = () => { q.resp = x.value; });
    if(q.kind==='select') el.querySelector('select').onchange = ev => { q.resp = ev.target.value; };
    if(q.kind==='fields' || q.kind==='match') el.querySelectorAll('select').forEach(s => s.onchange = () => { q.resp = q.resp || {}; q.resp[s.dataset.j] = s.value; });
    if(q.kind==='num') el.querySelector('input').oninput = ev => { q.resp = ev.target.value; };
    if(q.kind==='text') el.querySelector('input').oninput = ev => { q.resp = ev.target.value; };
  }
  return el;
}

/* Verstanden gesamt: je Thema halb Übungsstand, halb Trefferquote der letzten Probetests.
   Themen ohne Probetest zählen nur mit dem Übungsstand. Liest nur, speichert nichts. */
const ptTopics = sid => BANKS[sid] ? BANKS[sid]().topics : [];
function mastery(sid){
  if(!BANKS[sid]) return {pct:0, cov:0, test:null, tested:0, topics:0};
  const cov = coverage(sid), T = ptTopics(sid);
  const H = store.get('ptest.'+sid,[]).filter(h => !h.retry && h.tp);
  let sum = 0, tested = 0, tsum = 0;
  T.forEach(t => {
    const L = H.filter(h => h.tp[t] && h.tp[t][1] > 0).slice(-5);
    if(!L.length){ sum += cov; return; }
    let w = 0, r = 0; L.forEach((h,i) => { w += i+1; r += (i+1) * h.tp[t][0] / h.tp[t][1]; });
    tested++; tsum += r/w; sum += (cov + r/w) / 2;
  });
  const total = T.length ? sum / T.length : cov;
  return {pct:Math.round(Math.min(1, Math.max(0, total))*100), cov, test:tested ? tsum/tested : null, tested, topics:T.length};
}
const masteryText = m => m.test===null ? `Verstanden ${m.pct} %: noch kein Probetest, nur Übungsstand (${Math.round(m.cov*100)} %)`
  : `Verstanden ${m.pct} %: Übungsstand ${Math.round(m.cov*100)} % und Probetests ${Math.round(m.test*100)} % richtig (${m.tested} von ${m.topics} Themen getestet)`;
function predict(sid, H){
  if(!H.length) return null;
  const last = H.slice(-5); let ws = 0, s = 0;
  last.forEach((h,i) => { ws += i+1; s += (i+1)*h.note; });
  const base = s/ws, cov = coverage(sid), adj = (cov-0.5)*0.3;
  const p = Math.min(6, Math.max(1, base+adj));
  const sd = last.length>1 ? Math.sqrt(last.reduce((a,h) => a + (h.note-base)**2, 0) / (last.length-1)) : 0;
  const spread = Math.max(sd, last.length===1 ? 0.75 : last.length<4 ? 0.5 : 0.25);
  const r4 = x => Math.round(x*4)/4;
  return {note:r4(p), lo:r4(Math.max(1,p-spread)), hi:r4(Math.min(6,p+spread)), base, adj, cov, n:H.length, trend:H.length>1 ? H[H.length-1].note - H[H.length-2].note : 0};
}
const fmtN = x => x.toFixed(2).replace(/0$/,'');
function ptChart(H){
  const L = H.slice(-10); if(L.length < 2) return '';
  const W = 300, Hh = 96, bw = W/L.length, y = n => Hh-12-(n-1)/5*(Hh-26);
  return `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;max-width:520px;height:auto;margin:var(--s2) 0 var(--s1)" role="img" aria-label="Verlauf der Probetest-Noten">
    <line x1="0" x2="${W}" y1="${y(4)}" y2="${y(4)}" stroke="currentColor" stroke-dasharray="4 4" opacity=".45"/>
    ${L.map((h,i) => { const x = i*bw + bw*0.2, w = bw*0.6, top = y(h.note);
      return `<rect x="${x}" y="${top}" width="${w}" height="${Hh-12-top}" rx="3" fill="${h.note>=4 ? 'var(--c,var(--accent))' : 'var(--bad)'}"/><text x="${x+w/2}" y="${top-3}" font-size="9" text-anchor="middle" fill="currentColor">${h.note.toFixed(1)}</text>`; }).join('')}
  </svg><div class="muted" style="font-size:var(--t-xs);font-family:var(--f-ui)">Deine letzten Probetests · gestrichelte Linie = Note 4</div>`;
}
function topicRows(tp){
  return Object.entries(tp).map(([t,[g,m]]) => [t, g/m, g, m]).sort((a,b) => a[1]-b[1]).map(([t,p,g,m]) =>
    `<tr><td>${esc(t)}</td><td style="width:45%"><div class="progress"><i style="width:${Math.round(p*100)}%;${p<0.6?'background:var(--bad)':''}"></i></div></td><td>${Math.round(p*100)} %</td></tr>`).join('');
}
function ptPrognose(s){
  const H = store.get('ptest.'+s.id,[]).filter(h => !h.retry), p = predict(s.id, H);
  if(!p) return `<div class="card"><h3>Notenprognose</h3><p class="muted">Mach einen ersten Probetest, dann schätze ich deine Note.</p></div>`;
  const agg = {}; H.forEach(h => Object.entries(h.tp||{}).forEach(([t,[g,m]]) => { agg[t] = agg[t] || [0,0]; agg[t][0] += g; agg[t][1] += m; }));
  const weak = Object.entries(agg).map(([t,[g,m]]) => [t, g/m]).filter(r => r[1] < 0.75).sort((a,b) => a[1]-b[1]).slice(0,2);
  const dl = examDays(s);
  const unsure = p.n < 3 ? 'Noch unsicher: Mach mindestens 3 Probetests für eine verlässliche Prognose.' : p.cov < 0.4 ? 'Achtung: Du hast erst wenig vom Stoff geübt. Die Prognose kann zu optimistisch sein.' : '';
  return `<div class="card"><h3>Notenprognose</h3>
    <div style="display:flex;gap:var(--s3);align-items:center;flex-wrap:wrap">
      <div class="big" style="margin:0;color:${p.note>=4 ? 'var(--c,var(--accent))' : 'var(--bad)'}">${fmtN(p.note)}</div>
      <div style="flex:1 1 240px"><b>Erwartete Note im Test: etwa ${fmtN(p.lo)} bis ${fmtN(p.hi)}</b>
        <p class="muted" style="margin:var(--s1) 0 0;font-size:var(--t-s);font-family:var(--f-ui)">Basis: Ø deiner letzten ${Math.min(5,p.n)} Probetest${p.n>1?'s':''} = ${p.base.toFixed(2)} (neuere zählen mehr) · Übungsstand ${Math.round(p.cov*100)} % (${p.adj>=0?'+':''}${p.adj.toFixed(2)})
        ${p.n>1 ? ` · Trend: ${p.trend>0.05 ? 'besser' : p.trend<-0.05 ? 'schlechter' : 'gleich'}` : ''}${dl!==null && dl>=0 ? ` · Test in ${dl} Tag${dl===1?'':'en'}` : ''}</p>
        ${unsure ? `<p style="margin:var(--s2) 0 0;font-size:var(--t-s);font-family:var(--f-ui)" class="fb warn">${unsure}</p>` : ''}</div></div>
    <p style="margin:var(--s2) 0 0;font-size:var(--t-s);font-family:var(--f-ui)"><b>${esc(masteryText(mastery(s.id)))}</b></p>
    ${ptChart(H)}
    ${Object.keys(agg).length ? `<h4>Trefferquote nach Thema (alle Probetests)</h4><table>${topicRows(agg)}</table>` : ''}
    ${weak.length ? `<p style="margin-top:var(--s3)"><b>So verbesserst du die Note am meisten:</b> Übe zuerst ${weak.map(w => `<b>${esc(w[0])}</b> (${Math.round(w[1]*100)} %)`).join(' und ')}.</p>
      <div class="row"><button class="btn ghost" data-go="theory">Theorie dazu</button><button class="btn ghost" data-go="ex">Passende Übungen</button></div>` : ''}
    <p class="muted" style="font-size:var(--t-xs);margin-top:var(--s2);font-family:var(--f-ui)">Die Prognose ist eine Schätzung aus deinen Probetests, keine Garantie. Note = 1 + 5 × Punkte ÷ Maximum.</p></div>`;
}

const PT = Object.create(null);
let ptTimer = null;
const ptState = sid => PT[sid] || (PT[sid] = {phase:'setup', n:10, time:0, topics:null});
function ptBindGo(v){ v.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openTab(b.dataset.go)); }
function ptStart(sid, qs, retry){
  if(!qs.length) return;
  const st = ptState(sid);
  qs.forEach(q => { delete q.resp; delete q.score; delete q.msg; delete q.rights; });
  Object.assign(st, {qs, phase:'run', retry:!!retry, endAt: st.time ? Date.now() + st.time*60000 : 0});
  ptTick(); render(); window.scrollTo(0,0);
}
function ptTick(){
  clearInterval(ptTimer);
  ptTimer = setInterval(() => {
    let running = false;
    Object.entries(PT).forEach(([sid,st]) => { if(st.phase==='run' && st.endAt){ running = true; if(Date.now() >= st.endAt) ptSubmit(sid, true); } });
    const st = PT[cur], el = document.getElementById('ptTime');
    if(el && st && st.endAt){ const r = Math.max(0, st.endAt - Date.now()); el.textContent = `${Math.floor(r/60000)}:${String(Math.floor(r/1000)%60).padStart(2,'0')}`; }
    if(!running) clearInterval(ptTimer);
  }, 500);
}
function ptSubmit(sid, timeUp){
  const st = ptState(sid); if(st.phase!=='run') return;
  let pts = 0; const tp = {};
  st.qs.forEach(q => { q.score = scoreQ(q); pts += q.score; tp[q.topic] = tp[q.topic] || [0,0]; tp[q.topic][0] += q.score; tp[q.topic][1] += 1; });
  const max = st.qs.length, note = 1 + 5*pts/max;
  st.result = {pts, max, note, tp, timeUp:!!timeUp};
  const H = store.get('ptest.'+sid,[]);
  H.push({d:todayKey(), note:Math.round(note*100)/100, pts:Math.round(pts*10)/10, max, tp, retry:st.retry});
  store.set('ptest.'+sid, H.slice(-30));
  st.phase = 'done'; st.endAt = 0;
  if(sid===cur && tab==='test'){ render(); window.scrollTo(0,0); }
}
function viewPTest(v, s){
  if(!BANKS[s.id] || !BANKS[s.id]().bank.length){ v.innerHTML = `<div class="card empty">Für dieses Fach gibt es noch keine Unterlagen. Sobald Material drin ist, kannst du hier Probetests machen.</div>`; return; }
  const st = ptState(s.id), {topics, bank} = BANKS[s.id]();
  if(!st.topics) st.topics = topics.slice();
  if(!testSizes(bank.length).includes(st.n)) st.n = testSizes(bank.length)[0];
  if(st.phase==='run') return ptRun(v, s, st);
  if(st.phase==='done') return ptDone(v, s, st);
  const kinds = [...new Set(bank.map(b => b.make().kind))].map(k => PT_KIND[k]);
  v.innerHTML = `<div class="card ex"><h3>Probetest-Generator</h3>
      <p class="muted">Jeder Test wird aus ${bank.length} Fragen neu zusammengestellt. Wenn deine Themen weniger Fragen enthalten, fällt der Test kürzer aus. Fragetypen: ${kinds.join(', ')}.</p>
      <h4>Anzahl Fragen</h4><div class="subtabs">${testSizes(bank.length).map(n => `<button class="chip ${st.n===n?'on':''}" data-n="${n}">${n} Fragen</button>`).join('')}</div>
      <h4>Zeitlimit</h4><div class="subtabs">${[0,15,30,45].map(t => `<button class="chip ${st.time===t?'on':''}" data-time="${t}">${t ? t+' Min.' : 'Ohne'}</button>`).join('')}</div>
      <h4>Themen</h4>${topics.map(t => `<label class="goal"><input type="checkbox" data-tp="${esc(t)}" ${st.topics.includes(t)?'checked':''}><span>${esc(t)} <span class="muted">(${bank.filter(b => b.topic===t).length})</span></span></label>`).join('')}
      <div class="row" style="margin-top:var(--s3)"><button class="btn" id="ptGo">Test erstellen und starten</button><span class="fb bad" id="ptErr"></span></div></div>
    ${ptPrognose(s)}`;
  v.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { st.n = +b.dataset.n; viewPTest(v, s); });
  v.querySelectorAll('[data-time]').forEach(b => b.onclick = () => { st.time = +b.dataset.time; viewPTest(v, s); });
  v.querySelectorAll('[data-tp]').forEach(c => c.onchange = () => { st.topics = topics.filter(t => v.querySelector(`[data-tp="${CSS.escape(t)}"]`).checked); });
  $('#ptGo').onclick = () => { if(!st.topics.length){ $('#ptErr').textContent = 'Wähle mindestens ein Thema.'; return; } ptStart(s.id, buildPTest(s.id, st.n, st.topics)); };
  ptBindGo(v);
}
function ptRun(v, s, st){
  v.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px;position:sticky;top:0;z-index:2;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line)">
      <button class="btn ghost" id="ptCancel">Abbrechen</button><span class="stats"><span id="ptCount"></span>${st.endAt ? ' · Zeit: <b id="ptTime"></b>' : ''}</span><button class="btn" id="ptSubmit">Abgeben</button></div>
    ${st.retry ? '<p class="muted">Wiederholung deiner Fehler (zählt nicht für die Prognose).</p>' : ''}<div id="ptList"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn" id="ptSubmit2">Test abgeben</button></div>`;
  const list = $('#ptList'); st.qs.forEach((q,i) => list.appendChild(ptQEl(q, i, false)));
  const upd = () => { $('#ptCount').textContent = `${st.qs.filter(ptAnswered).length} / ${st.qs.length} beantwortet`; };
  ['input','change'].forEach(ev => list.addEventListener(ev, upd)); upd();
  $('#ptCancel').onclick = () => { if(confirm('Test abbrechen? Deine Antworten gehen verloren.')){ st.phase = 'setup'; st.endAt = 0; render(); } };
  const submit = () => { const open = st.qs.filter(q => !ptAnswered(q)).length;
    if(open && !confirm(`${open} Frage${open===1?' ist':'n sind'} noch offen. Trotzdem abgeben?`)) return; ptSubmit(s.id); };
  $('#ptSubmit').onclick = submit; $('#ptSubmit2').onclick = submit;
  if(st.endAt) ptTick();
}
function ptDone(v, s, st){
  const {pts, max, note, tp, timeUp} = st.result, cls = note>=5 ? 'good' : note>=4 ? 'mid' : 'low';
  const wrong = st.qs.filter(q => q.score < 1);
  v.innerHTML = `<div class="card" style="text-align:center">
      <div class="muted">${st.retry ? 'Fehler-Wiederholung' : 'Probetest'} · Resultat${timeUp ? ' (Zeit abgelaufen)' : ''}</div>
      <div class="big">${note.toFixed(1)}</div><span class="badge ${cls}">${fmtP(Math.round(pts*10)/10)} von ${max} Punkten · gerundet ${(Math.round(note*2)/2).toFixed(1)}</span>
      <div class="row" style="justify-content:center;margin-top:var(--s3)"><button class="btn" id="ptNew">Neuer Probetest</button>
        ${wrong.length ? `<button class="btn ghost" id="ptRetry">Nur Fehler wiederholen (${wrong.length})</button>` : ''}<button class="btn ghost" id="ptSetup">Einstellungen</button></div></div>
    ${ptPrognose(s)}
    <div class="card"><h3>Dieser Test nach Thema</h3><table>${topicRows(tp)}</table></div>
    <h3 style="margin:var(--s4) 0 var(--s2)">Auswertung</h3><div id="ptList"></div>`;
  const list = $('#ptList'); st.qs.forEach((q,i) => list.appendChild(ptQEl(q, i, true)));
  $('#ptNew').onclick = () => ptStart(s.id, buildPTest(s.id, st.n, st.topics));
  if($('#ptRetry')) $('#ptRetry').onclick = () => ptStart(s.id, shuffle(wrong), true);
  $('#ptSetup').onclick = () => { st.phase = 'setup'; render(); };
  ptBindGo(v);
}

/* ---------- Karteikarten ---------- */
function viewCards(v, s){
  const personal = personalEntries(s).filter(entry => entry.type === 'card');
  const own = store.get('cards.'+s.id,[]);
  const all = studyEntries(s).filter(entry => entry.type === 'card').map(entry => [entry.title, entry.body, entry.id, entry]).concat(own);
  const known = Object.assign(Object.create(null), store.get('known.'+s.id,{}));
  const migrated = workspace().completed;
  if(!store.get('knownMigrated.'+s.id, false)){
    all.forEach(card => { if(card[2] && migrated[card[2]] === true) known[card[2]] = 1; });
    store.set('known.'+s.id, known);
    store.set('knownMigrated.'+s.id, true);
  }
  let queue = all.map((c,i) => i).filter(i => !known[all[i][2] || all[i][0]]);
  let idx = 0, flipped = false;
  v.innerHTML = `
    <div class="card"><h3>Lernen</h3><p class="muted" id="cstat"></p><button class="flash" id="flash" type="button"></button>
      <div class="row" style="margin-top:var(--s3);justify-content:center">
        <button class="btn ghost" id="again">Nochmal</button><button class="btn" id="knew">Gewusst</button>
        <button class="btn ghost" id="reset">Alle zurücksetzen</button></div></div>
    <div class="card"><h3>Eigene Karte hinzufügen</h3>
      <div class="grid2"><input type="text" id="front" placeholder="Vorderseite (Frage / Begriff)"><input type="text" id="back" placeholder="Rückseite (Antwort)"></div>
      <div class="row" style="margin-top:var(--s2)"><button class="btn" id="add">Hinzufügen</button><button class="btn ghost" id="addCardSource">Mit Quelle hinzufügen</button></div>
      ${own.length?`<h4>Deine Karten (${own.length})</h4><ul>${own.map((c,i) => `<li>${esc(c[0])} → ${esc(c[1])} <button class="chip" data-del="${i}">löschen</button></li>`).join('')}</ul>`:''}</div>`;
  function show(){
    $('#cstat').textContent = `${all.length-queue.length} von ${all.length} Karten gewusst`;
    const f = $('#flash');
    f.disabled = !queue.length;
    if(!all.length){ f.innerHTML = 'Noch keine Karten. Füge unten deine erste hinzu.'; return; }
    if(!queue.length){ f.innerHTML = 'Alles gewusst!<small>«Alle zurücksetzen» für eine neue Runde</small>'; return; }
    const c = all[queue[idx % queue.length]];
    f.innerHTML = flipped ? `${esc(c[1])}<small>Antwort</small>` : `${esc(c[0])}<small>Klicken zum Umdrehen</small>`;
  }
  $('#flash').onclick = () => { flipped=!flipped; show(); };
  $('#again').onclick = () => { if(queue.length){ idx=(idx+1)%queue.length; flipped=false; show(); } };
  $('#knew').onclick = () => { if(!queue.length) return; const i=queue[idx%queue.length]; known[all[i][2] || all[i][0]]=1; store.set('known.'+s.id,known); queue=queue.filter(x => x!==i); idx = queue.length ? idx%queue.length : 0; flipped=false; show(); renderSide(); };
  $('#reset').onclick = () => { store.set('known.'+s.id,{}); viewCards(v,s); };
  $('#add').onclick = () => { const a=$('#front').value.trim(), b=$('#back').value.trim(); if(!a||!b) return; own.push([a,b]); store.set('cards.'+s.id,own); viewCards(v,s); renderSide(); };
  $('#addCardSource').onclick = () => editEntry(s, null, true);
  v.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { own.splice(+b.dataset.del,1); store.set('cards.'+s.id,own); viewCards(v,s); renderSide(); });
  if(personal.length) addPersonalControls(v, s, personal);
  show();
}

/* ---------- Schnelltest ---------- */
function startQuiz(onlyWrong){
  const wrong = store.get(qk('quizWrong'),[]);
  let pool = quizPool();
  if(onlyWrong) pool = pool.filter(q => wrong.includes(q.q));
  if(!pool.length) return;
  quiz = {qs: shuffle(pool).slice(0,10).map(q => ({...q, opts: shuffle(q.a.map((t,k) => ({t, ok:k===0})))})), i:0, score:0, picked:null, missed:[], onlyWrong};
  exOpen='quiz'; render(); window.scrollTo(0,0);
}
function viewQuiz(v){
  if(!quiz){ exOpen=null; return viewExercises(v, SUBJECTS.find(x => x.id===cur)); }
  const n = quiz.qs.length;
  if(quiz.i>=n){
    const pct = quiz.score/n, cls = pct>=.8?'good':pct>=.5?'mid':'low';
    if(!quiz.onlyWrong){ const b=store.get(qk('quizBest'),null); if(b===null||quiz.score/n>b.pct) store.set(qk('quizBest'),{score:quiz.score, total:n, pct:quiz.score/n}); }
    const msg = pct===1?'Perfekt!':pct>=.8?'Sehr gut!':pct>=.5?'Gut, da geht noch mehr.':'Schau dir die Theorie nochmal an.';
    v.innerHTML = `<div class="card" style="text-align:center"><div class="muted">Resultat</div><div class="big">${quiz.score} / ${n}</div>
      <span class="badge ${cls}">${msg}</span>
      ${quiz.missed.length?`<div style="text-align:left;margin-top:var(--s3)"><h4>Das solltest du nochmal anschauen</h4><ul>${quiz.missed.map(q => `<li><b>${esc(q.q)}</b><br>${esc(q.a[0])} <span class="muted">· ${esc(q.x)}</span></li>`).join('')}</ul></div>`:''}
      <div class="row" style="justify-content:center;margin-top:var(--s3)"><button class="btn" id="again">Neuer Test</button>
      ${store.get(qk('quizWrong'),[]).length?'<button class="btn ghost" id="fix">Fehler üben</button>':''}<button class="btn ghost" id="back">Zur Übersicht</button></div></div>`;
    $('#again').onclick = () => startQuiz(false);
    if($('#fix')) $('#fix').onclick = () => startQuiz(true);
    $('#back').onclick = () => { quiz=null; openEx(null); };
    return;
  }
  const q = quiz.qs[quiz.i], answered = quiz.picked!==null;
  v.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:var(--s3)">
      <button class="btn ghost" id="back">← Abbrechen</button><span class="muted">Frage ${quiz.i+1} von ${n} · ${quiz.score} richtig</span></div>
    <div class="progress" style="margin-bottom:var(--s3)"><i style="width:${quiz.i/n*100}%"></i></div>
    <div class="card"><div class="meta muted" style="font-size:var(--t-xs);text-transform:uppercase;letter-spacing:.06em;font-family:var(--f-ui);font-weight:600">${quiz.onlyWrong?'Fehler üben':'Schnelltest'}</div>
      <p class="qtext">${esc(q.q)}</p>
      <div class="opts">${q.opts.map((o,k) => { let c=''; if(answered){ if(o.ok) c='ok'; else if(k===quiz.picked) c='bad'; }
        return `<button class="opt ${c}" data-k="${k}" ${answered?'disabled':''}><span class="k">${k+1}</span>${esc(o.t)}${answered&&o.ok?' (richtig)':''}${answered&&c==='bad'?' (deine Wahl)':''}</button>`; }).join('')}</div>
      ${answered?`<div class="expl"><b>${q.opts[quiz.picked].ok?'Richtig!':'Leider falsch.'}</b> ${esc(q.x)}</div>
        <div class="row" style="justify-content:flex-end;margin-top:var(--s3)"><button class="btn" id="next">${quiz.i===n-1?'Resultat anzeigen':'Weiter →'}</button></div>`
        :'<p class="muted" style="font-size:var(--t-xs);margin:var(--s2) 0 0;font-family:var(--f-ui)">Tipp: Du kannst auch mit den Tasten 1–4 antworten.</p>'}</div>`;
  $('#back').onclick = () => { quiz=null; openEx(null); };
  v.querySelectorAll('.opt').forEach(b => b.onclick = () => answerQuiz(+b.dataset.k));
  if($('#next')) { $('#next').onclick = nextQuiz; $('#next').focus(); }
}
function answerQuiz(k){
  if(!quiz || quiz.picked!==null || !quiz.qs[quiz.i]?.opts[k]) return;
  const q = quiz.qs[quiz.i]; quiz.picked = k;
  let wrong = store.get(qk('quizWrong'),[]);
  if(q.opts[k].ok){ quiz.score++; wrong = wrong.filter(w => w!==q.q); }
  else { quiz.missed.push(q); if(!wrong.includes(q.q)) wrong.push(q.q); }
  store.set(qk('quizWrong'),wrong); render();
}
function nextQuiz(){ quiz.i++; quiz.picked=null; render(); }
document.addEventListener('keydown', ev => {
  if(exOpen!=='quiz' || !quiz || tab!=='ex' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if(quiz.picked===null && /^[1-4]$/.test(ev.key) && quiz.qs[quiz.i]) answerQuiz(+ev.key-1);
});
