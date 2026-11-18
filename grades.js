/* ---------- Noten und Durchschnitt ---------- */
const G_ICON = '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3.5"/>';
const G_TILE = {g1:'#818CF8', g2:'#4F46E5'};
const gExams = () => {
  const exams = store.get('exams', []);
  return Array.isArray(exams) ? exams.filter(x => validId(x?.id) && validId(x.s) &&
    typeof x.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.d) && typeof x.t === 'string'
  ).sort((a, b) => a.d.localeCompare(b.d)) : [];
};
const nextExam = id => gExams().find(exam => exam.s === id && exam.d >= todayKey());
const G_SVG = {
  edit:'<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  del:'<path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  chev:'<path d="M9 6l6 6-6 6"/>'
};
const gSvg = (k, cls) => '<svg viewBox="0 0 24 24" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + G_SVG[k] + '</svg>';
let gOpen = new Set(), gEdit = null, gFlash = '', gForm = {s:'mathe', d:'', t:''}, gCalc = {mode:'need', s:'mathe', target:'4', w:'1', g:'4.5'};
const gObj = o => o && typeof o==='object' && !Array.isArray(o) ? o : {};
function gData(){
  const d = gObj(store.get('grades', null));
  return {sem: Number.isInteger(d.sem) && d.sem>=1 && d.sem<=8 ? d.sem : 1, round: [0.5,0.1,0].includes(d.round) ? d.round : 0.5, extra: gObj(d.extra), items: gObj(d.items)};
}
const gSave = d => store.set('grades', d);
const gNum = v => { const t = String(v ?? '').trim().replace(',', '.'); const n = Number(t); return t!=='' && isFinite(n) ? n : NaN; };
const gId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const gIni = n => { const w = n.trim().split(/\s+/), t = w.length>1 ? w[0][0]+w[1][0] : w[0].slice(0,2); return t.charAt(0).toUpperCase() + t.slice(1); };
const gToday = () => { const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0'); };
const gDate = iso => iso.split('-').reverse().join('.');
// Runden wie im Zeugnis: ab .25 auf die nächste halbe Note, ab .05 auf das nächste Zehntel (1e-6 gleicht Rechenungenauigkeit aus)
const gRound = (x, step) => step===0.5 ? Math.round(x*2 + 1e-6)/2 : step===0.1 ? Math.round(x*10 + 1e-6)/10 : x;
const gUp = (x, step) => step===0.5 ? Math.ceil(x*2 - 1e-6)/2 : step===0.1 ? Math.ceil(x*10 - 1e-6)/10 : x;
const g2 = x => (Math.round(x*100 + 1e-6)/100).toFixed(2);
const gFmt = (x, step) => step ? x.toFixed(1) : g2(x);
const gShow = g => Number.isInteger(g) ? g.toFixed(1) : String(g);
function gSubjects(d){
  const app = SUBJECTS.map(x => ({id:x.id, label:x.label, grp:'other', a:x.g1, b:x.g2, tile:iconSvg(x.id)}));
  const ex = Object.entries(d.extra).filter(([id,x]) => validId(id) && x && typeof x.name==='string' && x.name.trim())
    .sort((p,q) => (p[1].at||0) - (q[1].at||0))
    .map(([id,x]) => ({id, label:x.name.trim(), grp:x.grp==='bm' ? 'bm' : 'other', a:'#8E8E93', b:'#48484A', tile:'<b class="gini">' + esc(gIni(x.name)) + '</b>', extra:true}));
  return app.concat(ex);
}
function gItems(d, sid){
  return Object.entries(d.items).filter(([id,x]) => validId(id) && x && x.s===sid && (x.sem||1)===d.sem && typeof x.g==='number' && x.g>=1 && x.g<=6 && typeof x.w==='number' && x.w>0)
    .map(([id,x]) => ({id, s:x.s, t:typeof x.t==='string' ? x.t : '', g:x.g, w:x.w, d:typeof x.d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(x.d) ? x.d : '', at:x.at||0}))
    .sort((p,q) => p.d.localeCompare(q.d) || p.at - q.at);
}
const gSum = list => list.reduce((a,x) => ({S:a.S + x.g*x.w, W:a.W + x.w}), {S:0, W:0});
const gAvg = list => { const {S,W} = gSum(list); return W>0 ? S/W : null; };
function gGroup(d, grp){
  const subs = gSubjects(d).filter(x => x.grp===grp).map(x => { const list = gItems(d, x.id), avg = gAvg(list); return {...x, list, avg, rep: avg===null ? null : gRound(avg, d.round)}; });
  const graded = subs.filter(x => x.rep!==null), mean = graded.length ? graded.reduce((a,x) => a + x.rep, 0)/graded.length : null;
  return {subs, graded, mean, total: mean===null ? null : Math.round(mean*10 + 1e-6)/10};
}
function gSideInfo(){
  const d = gData(), bm = gGroup(d,'bm'), ot = gGroup(d,'other');
  return bm.total!==null ? 'Schnitt BM ' + bm.total.toFixed(1) : ot.total!==null ? 'Schnitt ' + ot.total.toFixed(1) : 'Noch keine Noten';
}
function gNavHtml(){
  return '<div class="gsep" aria-hidden="true"></div><button class="subj gnav ' + (cur==='grades' ? 'active' : '') + '" data-s="grades" title="Noten und Durchschnitt" style="--a:' + G_TILE.g1 + ';--b:' + G_TILE.g2 + '">'
    + '<span class="stile"><svg viewBox="0 0 24 24" aria-hidden="true">' + G_ICON + '</svg></span>'
    + '<span class="txt"><span class="nm">Noten</span><span class="pr">' + esc(gSideInfo()) + '</span></span></button>';
}
// Notenleiste von 1 bis 6: Punkte = einzelne Noten, Strich = Schnitt, gestrichelt = 4
function gStrip(list, avg){
  const X = g => 14 + (g-1)/5*272, seen = {};
  const ticks = [1,2,3,4,5,6].map(n => '<line class="ax" x1="' + X(n) + '" y1="41" x2="' + X(n) + '" y2="47"/><text x="' + X(n) + '" y="59" text-anchor="middle">' + n + '</text>').join('');
  const dots = list.map(it => { const k = it.g.toFixed(2), n = Math.min(3, seen[k] = (seen[k]||0) + 1); return '<circle class="dot ' + (it.g<4 ? 'bad' : 'ok') + '" cx="' + X(it.g).toFixed(1) + '" cy="' + (36 - (n-1)*9) + '" r="5"><title>' + esc((it.t || 'Note') + ': ' + gShow(it.g)) + '</title></circle>'; }).join('');
  const ax = X(avg), tx = Math.min(272, Math.max(28, ax));
  return '<svg class="gstrip" viewBox="0 0 300 62" role="img" aria-label="Noten auf der Skala von 1 bis 6, Schnitt ' + g2(avg) + '">'
    + '<line class="ax" x1="14" y1="44" x2="286" y2="44"/>' + ticks
    + '<line class="pass" x1="' + X(4) + '" y1="14" x2="' + X(4) + '" y2="44"/>'
    + '<line class="avg" x1="' + ax.toFixed(1) + '" y1="15" x2="' + ax.toFixed(1) + '" y2="44"/>'
    + '<text class="avgt" x="' + tx.toFixed(1) + '" y="10" text-anchor="middle">Ø ' + g2(avg) + '</text>' + dots + '</svg>';
}
function gCalcRun(){
  const box = $('#gcRes'); if(!box) return;
  const d = gData(), {S, W} = gSum(gItems(d, gCalc.s)), w = gNum(gCalc.w), r = d.round;
  const out = (big, txt, bad) => { box.innerHTML = '<b class="gr' + (bad ? ' gbad' : '') + '">' + big + '</b>' + txt; };
  if(!(w>0 && w<=1000)) return out('Gewicht fehlt', 'Gib ein Gewicht grösser als 0 ein, zum Beispiel 1.');
  const before = W>0 ? 'Jetzt: Schnitt ' + g2(S/W) + (r ? ', Zeugnis ' + gFmt(gRound(S/W, r), r) : '') + '.' : 'Noch keine Noten in diesem Fach und Semester.';
  if(gCalc.mode==='if'){
    const G = gNum(gCalc.g);
    if(!(G>=1 && G<=6)) return out('Note fehlt', 'Gib eine Note zwischen 1 und 6 ein.');
    const a = (S + G*w)/(W + w);
    return out('Schnitt ' + g2(a), (r ? 'Im Zeugnis: ' + gFmt(gRound(a, r), r) + '. ' : '') + before, gRound(a, r)<4);
  }
  const T = gNum(gCalc.target);
  if(!(T>=1 && T<=6)) return out('Ziel fehlt', 'Gib eine Zielnote zwischen 1 und 6 ein.');
  const Tn = gUp(T, r), thr = r ? Tn - r/2 : Tn, need = (thr*(W + w) - S)/w;
  const goal = r ? 'eine ' + gFmt(Tn, r) + ' im Zeugnis (Schnitt ab ' + g2(thr) + ')' : 'einen Schnitt von ' + g2(Tn);
  if(need<=1) return out('Schon sicher', 'Auch mit einer 1 reicht es für ' + goal + '. ' + before);
  if(need>6){ const a = (S + 6*w)/(W + w); return out('Nicht erreichbar', 'Selbst mit einer 6 kommst du auf ' + g2(a) + (r ? ' (Zeugnis ' + gFmt(gRound(a, r), r) + ')' : '') + '. Für ' + goal + ' reicht eine Prüfung mit diesem Gewicht nicht. ' + before, true); }
  const n = Math.ceil(need*100 - 1e-6)/100;
  out('Mindestens ' + n.toFixed(2), 'So viel brauchst du für ' + goal + '. ' + before);
}
function gExamCard(d, subs){
  const today = gToday(), lab = id => (subs.find(x => x.id===id) || {label:id}).label;
  const has = x => Object.values(d.items).find(it => it && it.s===x.s && it.d===x.d);
  const row = x => { const done = has(x), days = Math.round((pDate(x.d) - pDate(today))/86400000);
    const when = days>0 ? 'in ' + days + ' Tag' + (days===1 ? '' : 'en') : days===0 ? 'heute' : '';
    return '<div class="gitem"><span class="gt">' + esc(lab(x.s)) + ': ' + esc(x.t) + '<small>' + [gDate(x.d), when].filter(Boolean).map(esc).join(' · ') + '</small></span>'
      + (done ? '<span class="gv' + (done.g<4 ? ' gbad' : '') + '">' + gShow(done.g) + '</span>' : days<=0 ? '<button class="chip" data-gexam="' + x.id + '">Note eintragen</button>' : '')
      + '<button class="chip" data-exam-edit="' + x.id + '">Bearbeiten</button></div>'; };
  const exams = gExams(), up = exams.filter(x => x.d >= today), past = exams.filter(x => x.d < today).reverse();
  return '<div class="card"><h3>Prüfungen</h3>'
    + (up.length ? '<h4>Kommend</h4>' + up.map(row).join('') : '')
    + (past.length ? '<h4>Vorbei</h4>' + past.map(row).join('') : '')
    + '<button class="btn ghost" id="addExam">+ Prüfung hinzufügen</button></div>';
}

function editExam(exam, subjects) {
  const options = subjects.map(subject => `<option value="${esc(subject.id)}"${exam?.s === subject.id ? ' selected' : ''}>${esc(subject.label)}</option>`).join('');
  showEditor(exam ? 'Prüfung bearbeiten' : 'Prüfung hinzufügen', `
    <label>Fach <select name="subject">${options}</select></label>
    <label>Bezeichnung <input name="title" required maxlength="100" autofocus value="${esc(exam?.t)}"></label>
    <label>Datum <input name="date" type="date" required value="${esc(exam?.d)}"></label>`, data => {
    const title = data.get('title').trim(), date = data.get('date'), subject = data.get('subject');
    if(!title || !date || !subjects.some(item => item.id === subject)) return 'Fülle alle Felder aus.';
    const item = {id:exam?.id ?? newId(), s:subject, t:title, d:date};
    if(!store.set('exams', gExams().filter(existing => existing.id !== item.id).concat(item))) return 'Die Prüfung konnte nicht gespeichert werden.';
  }, exam && (() => store.set('exams', gExams().filter(existing => existing.id !== exam.id))));
}
function viewGrades(){
  const d = gData(), subs = gSubjects(d), ids = subs.map(x => x.id);
  if(gEdit && !d.items[gEdit]) gEdit = null;
  if(!ids.includes(gForm.s)) gForm.s = subs[0].id;
  if(!ids.includes(gCalc.s)) gCalc.s = subs[0].id;
  if(!gForm.d) gForm.d = gToday();
  const e = gEdit ? d.items[gEdit] : null;
  const fv = e ? {s:ids.includes(e.s) ? e.s : gForm.s, t:e.t || '', g:gShow(e.g), w:String(e.w), d:e.d || ''} : {s:gForm.s, t:gForm.t || '', g:'', w:'1', d:gForm.d};
  const bm = gGroup(d,'bm'), ot = gGroup(d,'other');
  const head = bm.total!==null ? [bm.total, 'Schnitt BM-Fächer'] : ot.total!==null ? [ot.total, 'Schnitt weitere Fächer'] : null;
  const used = Object.values(d.items).reduce((m,x) => Math.max(m, x && Number.isInteger(x.sem) ? x.sem : 1), 0);
  const nSem = Math.min(8, Math.max(2, used + 1, d.sem));
  const opts = sel => subs.map(x => '<option value="' + x.id + '"' + (x.id===sel ? ' selected' : '') + '>' + esc(x.label) + '</option>').join('');
  const rows = g => g.subs.map(x => '<details class="gsub" data-gs="' + x.id + '"' + (gOpen.has(x.id) ? ' open' : '') + ' style="--a:' + x.a + ';--b:' + x.b + '"><summary>'
    + '<span class="stile">' + x.tile + '</span>'
    + '<span class="gname">' + esc(x.label).replace('wissenschaften', '&shy;wissen&shy;schaften').replace('Landessprache', 'Landes&shy;sprache') + '<small>' + (x.list.length ? x.list.length + ' Note' + (x.list.length===1 ? '' : 'n') : 'Noch keine Noten') + (x.rep!==null && x.rep<4 ? ' · <span class="gbad">ungenügend</span>' : '') + '</small>'
    + (x.avg!==null ? '<span class="gbar"><i style="width:' + ((x.avg-1)/5*100).toFixed(1) + '%"></i></span>' : '') + '</span>'
    + (x.avg!==null ? '<span class="gavg' + (x.rep<4 ? ' gbad' : '') + '">' + g2(x.avg) + (d.round ? '<small>Zeugnis ' + gFmt(x.rep, d.round) + '</small>' : '') + '</span>' : '')
    + gSvg('chev', 'gchev') + '</summary><div class="gbody">'
    + (x.list.length ? gStrip(x.list, x.avg) : '')
    + x.list.map(it => '<div class="gitem"><span class="gt">' + esc(it.t || 'Note') + '<small>' + [it.d ? gDate(it.d) : '', 'Gewicht ' + it.w].filter(Boolean).join(' · ') + '</small></span>'
      + '<span class="gv' + (it.g<4 ? ' gbad' : '') + '">' + gShow(it.g) + '</span>'
      + '<span class="gact"><button data-ge="' + it.id + '" aria-label="Note ändern" title="Ändern">' + gSvg('edit') + '</button><button data-gd="' + it.id + '" aria-label="Note löschen" title="Löschen">' + gSvg('del') + '</button></span></div>').join('')
    + '<div class="row" style="margin-top:var(--s2)"><button class="btn ghost" data-gadd="' + x.id + '">Note eintragen</button>' + (x.extra ? '<button class="chip" data-gx="' + x.id + '">Fach entfernen</button>' : '') + '</div>'
    + '</div></details>').join('');
  const under = bm.graded.filter(x => x.rep<4), miss = under.reduce((a,x) => a + (4 - x.rep), 0);
  const checks = bm.total===null ? '' : [
    [bm.total>=4, 'Gesamtschnitt mindestens 4.0 (jetzt ' + bm.total.toFixed(1) + ')'],
    [under.length<=2, 'Höchstens zwei Fachnoten unter 4 (jetzt ' + under.length + ')'],
    [miss<=2 + 1e-9, 'Abstand dieser Noten zur 4 zusammen höchstens 2.0 (jetzt ' + gFmt(miss, d.round) + ')']
  ].map(c => '<li class="' + (c[0] ? 'gyes' : 'gno') + '"><span>' + (c[0] ? 'Erfüllt: ' : 'Nicht erfüllt: ') + esc(c[1]) + '</span></li>').join('');
  const need = gCalc.mode==='need';
  $('#main').innerHTML = '<header class="hero ghero"><span class="hicon"><svg viewBox="0 0 24 24" aria-hidden="true">' + G_ICON + '</svg></span>'
    + '<div class="htxt"><p class="hkick">BBW</p><h2>Noten</h2><p class="hsub">' + d.sem + '. Semester · Schnitte und Zeugnisnoten</p></div>'
    + (head ? '<div class="hmeta"><div class="gbig"><b class="' + (head[0]<4 ? 'gbad' : '') + '">' + head[0].toFixed(1) + '</b><span class="hlab">' + head[1] + '</span></div></div>' : '') + '</header>'
    + '<div class="tabs">' + Array.from({length:nSem}, (_, i) => '<button class="tab' + (i+1===d.sem ? ' active' : '') + '" data-gsem="' + (i+1) + '">' + (i+1) + '. Semester</button>').join('') + '</div>'
    + '<div id="view">'
    + '<div class="card" id="gformCard"><h3>' + (e ? 'Note ändern' : 'Note eintragen') + '</h3><div class="gform">'
    + '<label>Fach<select id="gS">' + opts(fv.s) + '</select></label>'
    + '<label class="gl-t">Bezeichnung<input type="text" id="gT" maxlength="80" placeholder="z. B. Test Kapitel 1" value="' + esc(fv.t) + '"></label>'
    + '<label class="gl-n">Note<input type="text" id="gG" inputmode="decimal" placeholder="4.5" autocomplete="off" value="' + esc(fv.g) + '"></label>'
    + '<label class="gl-n">Gewicht<input type="text" id="gW" inputmode="decimal" autocomplete="off" value="' + esc(fv.w) + '"></label>'
    + '<label>Datum<input type="date" id="gD" value="' + esc(fv.d) + '"></label></div>'
    + '<div class="row" style="margin-top:var(--s3)"><button class="btn" id="gAdd">' + (e ? 'Speichern' : 'Eintragen') + '</button>' + (e ? '<button class="btn ghost" id="gCancel">Abbrechen</button>' : '') + '</div>'
    + '<p class="fb' + (gFlash ? ' ok' : '') + '" id="gMsg" role="status">' + esc(gFlash) + '</p>'
    + '<p class="ghint">Gewicht: 1 = normal, 2 = zählt doppelt, 0.5 = zählt halb. Prozente gehen auch, zum Beispiel 30 und 70.</p></div>'
    + (bm.subs.length ? '<h3 class="sectiontitle">BM-Fächer' + (bm.total!==null ? '<span class="gsecavg">Schnitt ' + bm.total.toFixed(1) + '</span>' : '') + '</h3>'
    + '<div class="card glist">' + rows(bm) + '</div>' : '')
    + (bm.total!==null ? '<div class="card"><h3>Reicht es?</h3><div class="tiles3"><div><b class="' + (bm.total<4 ? 'gbad' : '') + '">' + bm.total.toFixed(1) + '</b><span>Gesamtschnitt</span></div><div><b>' + bm.graded.length + '/' + bm.subs.length + '</b><span>Fächer benotet</span></div><div><b class="' + (under.length ? 'gbad' : '') + '">' + under.length + '</b><span>unter 4</span></div></div>'
      + '<ul class="gcheck">' + checks + '</ul><p class="ghint">Richtwert nach der Bestehensregel der Berufsmaturität, gerechnet mit den Zeugnisnoten. Massgebend ist das Reglement deiner Schule.</p></div>' : '')
    + '<h3 class="sectiontitle">Weitere Fächer' + (ot.total!==null ? '<span class="gsecavg">Schnitt ' + ot.total.toFixed(1) + '</span>' : '') + '</h3>'
    + '<div class="card glist">' + rows(ot) + '</div>'
    + '<div class="card"><h3>Rechner</h3><div class="row" style="margin-bottom:var(--s3)"><button class="chip' + (need ? ' on' : '') + '" data-gm="need">Welche Note brauche ich?</button><button class="chip' + (need ? '' : ' on') + '" data-gm="if">Was wäre wenn?</button></div>'
    + '<div class="gcalc"><label>Fach<select id="gcS">' + opts(gCalc.s) + '</select></label>'
    + (need ? '<label class="gl-n">Ziel im Zeugnis<input type="text" id="gcT" inputmode="decimal" autocomplete="off" value="' + esc(gCalc.target) + '"></label>' : '<label class="gl-n">Note der Prüfung<input type="text" id="gcG" inputmode="decimal" autocomplete="off" value="' + esc(gCalc.g) + '"></label>')
    + '<label class="gl-n">Gewicht der Prüfung<input type="text" id="gcW" inputmode="decimal" autocomplete="off" value="' + esc(gCalc.w) + '"></label></div>'
    + '<div class="gres" id="gcRes" role="status"></div></div>'
    + gExamCard(d, subs)
    + '<div class="card"><h3>Einstellungen</h3><h4>Zeugnisnote runden auf</h4><div class="row">'
    + [[0.5,'Halbe Noten'],[0.1,'Zehntel'],[0,'Nicht runden']].map(o => '<button class="chip' + (d.round===o[0] ? ' on' : '') + '" data-gr="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>'
    + '<h4>Eigenes Fach hinzufügen</h4><div class="gx"><label class="gl-t">Name<input type="text" id="gxN" maxlength="40" placeholder="z. B. Englisch"></label>'
    + '<label>Gruppe<select id="gxG"><option value="bm">BM-Fach</option><option value="other">Weiteres Fach</option></select></label></div>'
    + '<div class="row" style="margin-top:var(--s2)"><button class="btn ghost" id="gxAdd">Fach hinzufügen</button></div><p class="fb" id="gxMsg" role="status"></p>'
    + '<p class="ghint">BM-Fächer zählen zum Gesamtschnitt und zur Bestehensregel. Weitere Fächer haben einen eigenen Schnitt. Die Noten werden in diesem Browser gespeichert.</p></div>'
    + '</div>';
  gFlash = '';
  const m = $('#main'), redraw = () => render();
  m.querySelectorAll('[data-gsem]').forEach(b => b.onclick = () => { const x = gData(); x.sem = Number(b.dataset.gsem); gSave(x); gEdit = null; redraw(); });
  m.querySelectorAll('.gsub').forEach(el => el.addEventListener('toggle', () => { el.open ? gOpen.add(el.dataset.gs) : gOpen.delete(el.dataset.gs); }));
  const toForm = () => { const c = $('#gformCard'); c.scrollIntoView({behavior:'smooth', block:'start'}); $('#gG').focus({preventScroll:true}); };
  m.querySelectorAll('[data-gadd]').forEach(b => b.onclick = () => { gForm.s = b.dataset.gadd; gEdit = null; redraw(); toForm(); });
  m.querySelectorAll('[data-ge]').forEach(b => b.onclick = () => { gEdit = b.dataset.ge; redraw(); toForm(); });
  m.querySelectorAll('[data-gd]').forEach(b => b.onclick = () => {
    const x = gData(), it = x.items[b.dataset.gd]; if(!it) return;
    if(!confirm('Note ' + gShow(it.g) + ' «' + (it.t || 'Note') + '» löschen?')) return;
    delete x.items[b.dataset.gd]; if(gEdit===b.dataset.gd) gEdit = null; gSave(x); redraw(); });
  m.querySelectorAll('[data-gx]').forEach(b => b.onclick = () => {
    const x = gData(), id = b.dataset.gx, ex = x.extra[id]; if(!ex) return;
    const n = Object.values(x.items).filter(it => it && it.s===id).length;
    if(!confirm('Fach «' + ex.name + '» entfernen?' + (n ? ' Seine ' + n + ' Note' + (n===1 ? '' : 'n') + ' aus allen Semestern werden ebenfalls gelöscht.' : ''))) return;
    delete x.extra[id]; Object.keys(x.items).forEach(k => { if(x.items[k] && x.items[k].s===id) delete x.items[k]; }); gOpen.delete(id); gSave(x); redraw(); });
  const save = () => {
    const msg = t => { const el = $('#gMsg'); el.className = 'fb bad'; el.textContent = t; };
    const sid = $('#gS').value, t = $('#gT').value.trim(), g = gNum($('#gG').value), w = gNum($('#gW').value), dt = $('#gD').value;
    if(!(g>=1 && g<=6)) return msg('Gib eine Note zwischen 1 und 6 ein, zum Beispiel 4.5.');
    if(!(w>0 && w<=1000)) return msg('Das Gewicht muss grösser als 0 sein, zum Beispiel 1.');
    const x = gData(); if(!gSubjects(x).some(y => y.id===sid)) return msg('Wähle ein Fach.');
    const old = gEdit ? x.items[gEdit] : null, id = old ? gEdit : gId();
    x.items[id] = {s:sid, t, g:Math.round(g*100)/100, w:Math.round(w*1000)/1000, d:/^\d{4}-\d{2}-\d{2}$/.test(dt) ? dt : '', sem:old && Number.isInteger(old.sem) ? old.sem : x.sem, at:old && old.at ? old.at : Date.now()};
    gSave(x); gForm = {s:sid, d:old ? gForm.d : (dt || gForm.d), t:''}; gEdit = null; gOpen.add(sid);
    gFlash = old ? 'Note geändert.' : 'Note ' + gShow(x.items[id].g) + ' eingetragen.'; redraw(); $('#gG').focus({preventScroll:true});
  };
  $('#gAdd').onclick = save;
  ['#gT','#gG','#gW','#gD'].forEach(q => $(q).addEventListener('keydown', ev => { if(ev.key==='Enter'){ ev.preventDefault(); save(); } }));
  if($('#gCancel')) $('#gCancel').onclick = () => { gEdit = null; redraw(); };
  m.querySelectorAll('[data-gexam]').forEach(b => b.onclick = () => { const x = gExams().find(exam => exam.id === b.dataset.gexam); if(!x) return; gForm = {s:x.s, d:x.d, t:x.t}; gEdit = null; redraw(); toForm(); });
  $('#addExam').onclick = () => editExam(null, subs);
  m.querySelectorAll('[data-exam-edit]').forEach(b => b.onclick = () => editExam(gExams().find(exam => exam.id === b.dataset.examEdit), subs));
  m.querySelectorAll('[data-gm]').forEach(b => b.onclick = () => { gCalc.mode = b.dataset.gm; redraw(); });
  m.querySelectorAll('[data-gr]').forEach(b => b.onclick = () => { const x = gData(); x.round = Number(b.dataset.gr); gSave(x); redraw(); });
  $('#gcS').onchange = ev => { gCalc.s = ev.target.value; gCalcRun(); };
  [['#gcT','target'],['#gcG','g'],['#gcW','w']].forEach(([q,k]) => { const el = $(q); if(el) el.oninput = () => { gCalc[k] = el.value; gCalcRun(); }; });
  gCalcRun();
  $('#gxAdd').onclick = () => {
    const el = $('#gxMsg'), name = $('#gxN').value.trim().replace(/\s+/g, ' '), x = gData();
    if(!name){ el.className = 'fb bad'; el.textContent = 'Gib einen Namen für das Fach ein.'; return; }
    if(gSubjects(x).some(y => y.label.toLowerCase()===name.toLowerCase())){ el.className = 'fb bad'; el.textContent = 'Dieses Fach gibt es schon.'; return; }
    const id = 'x' + gId(); x.extra[id] = {name, grp:$('#gxG').value==='bm' ? 'bm' : 'other', at:Date.now()}; gSave(x); gForm.s = id; redraw();
  };
  $('#gxN').addEventListener('keydown', ev => { if(ev.key==='Enter'){ ev.preventDefault(); $('#gxAdd').click(); } });
}
