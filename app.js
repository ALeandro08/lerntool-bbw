const STORAGE_PREFIX = 'bb.';
const PREVIOUS_WORKSPACE = 'lerntool-bbw.workspace.v1';
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
const validId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
const SOURCES = ['Eigene Notizen', 'Teams', 'OneNote', 'Eigener BBW-Code'];

const SUBJECT_STYLE = {
  mathe: ['#5AC8FA', '#0A84FF', '<path d="M18 4H6l7 8-7 8h12"/>'],
  'm162-m164': ['#4CD964', '#1E9E4A', '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 4 14 4 14 0V6M5 12c0 4 14 4 14 0"/>'],
  m117: ['#5EEAD4', '#0D9488', '<path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 16a4.5 4.5 0 0 1 6 0"/><circle cx="12" cy="20" r=".8"/>'],
  m231: ['#FF7EB6', '#C2185B', '<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v2"/>'],
  m293: ['#A29BFE', '#5856D6', '<path d="M8 7l-5 5 5 5m8-10 5 5-5 5m-2.5-13-3 16"/>'],
  english: ['#FF6B6B', '#E5192E', '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-6.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z"/>'],
  abu: ['#FFB347', '#F2700F', '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8m-8 4h5"/>']
};
const OWN_STYLE = ['#818CF8', '#4F46E5', '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>'];

function parseWorkspace(value) {
  const subjects = Array.isArray(value?.subjects) ? value.subjects.filter(subject =>
    validId(subject?.id) && !['grades', 'friends'].includes(subject.id) &&
    !starterSubjects.some(base => base.id === subject.id) && typeof subject.name === 'string' && subject.name.trim()
  ) : [];
  const subjectsWithEntries = new Set([...starterSubjects, ...subjects].map(subject => subject.id));
  const entries = Array.isArray(value?.entries) ? value.entries.filter(entry =>
    validId(entry?.id) && subjectsWithEntries.has(entry.subjectId) && ['card', 'note'].includes(entry.type) &&
    typeof entry.title === 'string' && typeof entry.body === 'string'
  ) : [];
  return {subjects, entries, completed:record(value?.completed) ? value.completed : {}};
}

function migrateWorkspace() {
  if(store.get('workspaceMigrated', false)) return;
  try {
    const old = localStorage.getItem(PREVIOUS_WORKSPACE);
    if(old && !store.get('workspace', null) && !store.set('workspace', parseWorkspace(JSON.parse(old)))) return;
    store.set('workspaceMigrated', true);
  } catch { /* A malformed previous workspace can stay in browser storage. */ }
}

const workspace = () => parseWorkspace(store.get('workspace', null));
const personalEntries = subject => workspace().entries.filter(entry => entry.subjectId === subject.id);
const studyEntries = subject => [...subject.entries, ...personalEntries(subject)];

function loadSubjects() {
  return [...starterSubjects, ...workspace().subjects.map(subject => ({...subject, entries:[]}))].map(subject => {
    const [g1, g2] = Object.hasOwn(SUBJECT_STYLE, subject.id) ? SUBJECT_STYLE[subject.id] : OWN_STYLE;
    return {...subject, label:subject.name, g1, g2, color:g2};
  });
}

let SUBJECTS = loadSubjects();
let cur = store.get('subject', 'm162-m164');
let tab = store.get('tab', 'overview');
let exOpen = null;
let quiz = null;
let exercise = null;

const iconSvg = id => `<svg viewBox="0 0 24 24" aria-hidden="true">${(Object.hasOwn(SUBJECT_STYLE, id) ? SUBJECT_STYLE[id] : OWN_STYLE)[2]}</svg>`;
const qk = key => key + '.' + cur;
const questionBank = id => Object.hasOwn(COURSE_QUESTIONS, id) ? COURSE_QUESTIONS[id] : [];
const quizPool = () => questionBank(cur).filter(question => question.a);
const BANKS = Object.assign(Object.create(null), Object.fromEntries(Object.keys(COURSE_QUESTIONS).map(id => [id, () => ({
  topics: [...new Set(questionBank(id).map(question => question.topic))],
  bank: questionBank(id).map(question => ({
    topic: question.topic,
    key: question.id,
    make: () => makeQuestion(question)
  }))
})])));

function makeQuestion(question) {
  if(question.a) return mcQ(question);
  const {q, x, ...fields} = question;
  return {...fields, prompt:esc(q), x:esc(x)};
}

function examDays(subject) {
  const next = nextExam(subject.id);
  return next ? Math.round((pDate(next.d) - pDate(todayKey())) / 86400000) : null;
}

function coverage(id) {
  const questions = questionBank(id);
  const done = store.get('exercise.' + id, {});
  return questions.length ? questions.filter(question => done[question.id] === true).length / questions.length : 0;
}

function openTab(next) {
  tab = next;
  exOpen = null;
  quiz = null;
  exercise = null;
  store.set('tab', tab);
  render();
  window.scrollTo(0, 0);
}

function openSubject(id) {
  cur = id;
  store.set('subject', cur);
  openTab('overview');
}

function renderSide() {
  const subjects = $('#subjects');
  subjects.innerHTML = SUBJECTS.map(subject => {
    const percent = mastery(subject.id).pct;
    const days = examDays(subject);
    const status = days === 0 ? 'Heute Prüfung' : days > 0 ? `Prüfung in ${days} Tagen` : percent ? `${percent} % verstanden` : 'Noch offen';
    return `<button class="subj${subject.id === cur ? ' active' : ''}" data-s="${esc(subject.id)}" style="--a:${subject.g1};--b:${subject.g2}">
      <span class="stile">${iconSvg(subject.id)}</span><span class="txt"><span class="nm">${esc(subject.label)}</span><span class="pr">${status}</span>
      <span class="smini"><i style="width:${percent}%"></i></span></span></button>`;
  }).join('') + gNavHtml() + frNavHtml() + '<button class="chip add-subject" id="addSubject">+ Fach hinzufügen</button>';
  subjects.querySelectorAll('[data-s]').forEach(button => button.onclick = () => openSubject(button.dataset.s));
  $('#addSubject').onclick = () => editSubject();
}

function render() {
  SUBJECTS = loadSubjects();
  if(!SUBJECTS.some(subject => subject.id === cur) && !['grades', 'friends'].includes(cur)) cur = SUBJECTS[0].id;
  renderSide();
  const css = document.documentElement.style;
  const color = cur === 'grades' ? G_TILE : cur === 'friends' ? FR_TILE : SUBJECTS.find(subject => subject.id === cur);
  for(const [key, value] of Object.entries({'--c':color.g2, '--g1':color.g1, '--g2':color.g2})) css.setProperty(key, value);
  if(cur === 'grades') return viewGrades();
  if(cur === 'friends') return viewFriends();

  const subject = color;
  const tabs = [['overview','Übersicht'], ['theory','Theorie'], ['ex','Übungen'], ['test','Probetest'], ['cards','Karteikarten'], ['notes','Notizen']];
  if(subject.id === 'm117') tabs.splice(2, 0, ['lab','Labor']);
  if(Object.hasOwn(DISCUSSIONS, subject.id)) tabs.splice(3, 0, ['discussion','Gespräch']);
  if(!tabs.some(([key]) => key === tab)) tab = 'overview';
  const views = {overview:viewOverview, theory:viewTheory, ex:viewExercises, test:viewPTest, cards:viewCards, notes:viewNotes, lab:viewLab, discussion:viewDiscussion};
  const progress = mastery(subject.id);
  const circumference = 2 * Math.PI * 34;
  $('#main').innerHTML = `<header class="hero"><span class="hwm">${iconSvg(subject.id)}</span><span class="hicon">${iconSvg(subject.id)}</span>
    <div class="htxt"><p class="hkick">BBW</p><h2>${esc(subject.label)}</h2><p class="hsub">${esc(subject.source)}</p></div>
    <div class="hmeta"><div class="hring" role="img" aria-label="${esc(masteryText(progress))}">
    <svg viewBox="0 0 80 80"><circle class="rt" cx="40" cy="40" r="34"/>
    <circle class="rv" cx="40" cy="40" r="34" stroke-dasharray="${circumference * progress.pct / 100} ${circumference}"/></svg><b>${progress.pct}%</b></div>
    <span class="hlab">verstanden</span></div></header>
    <nav class="tabs" aria-label="Lernbereich">${tabs.map(([key, label]) =>
      `<button class="tab${key === tab ? ' active' : ''}" data-tab="${key}"${key === tab ? ' aria-current="page"' : ''}>${label}</button>`).join('')}</nav><div id="view"></div>`;
  $('#main').querySelectorAll('[data-tab]').forEach(button => button.onclick = () => openTab(button.dataset.tab));
  views[tab]($('#view'), subject);
}

function viewOverview(view, subject) {
  const topics = ptTopics(subject.id);
  const goals = store.get('goals.' + subject.id, {});
  const next = nextExam(subject.id);
  view.innerHTML = `<div class="card"><h3>Lernziele</h3>
    ${topics.length ? topics.map(topic => `<label class="goal"><input type="checkbox" data-goal="${esc(topic)}"${goals[topic] ? ' checked' : ''}><span>${esc(topic)}</span></label>`).join('')
      : '<p class="muted">Du kannst deine Unterlagen unter Theorie und eigene Karten unter Karteikarten hinzufügen.</p>'}
    ${next ? `<p class="muted">Nächste Prüfung am ${gDate(next.d)} · ${esc(next.t)}</p>` : ''}
    <div class="row"><button class="btn" data-go="theory">Theorie öffnen</button><button class="btn ghost" data-go="ex">Üben</button><button class="btn ghost" data-go="test">Probetest</button>
    ${starterSubjects.some(base => base.id === subject.id) ? '' : '<button class="chip" id="editSubject">Fach bearbeiten</button>'}</div></div>
    ${ptPrognose(subject)}`;
  view.querySelectorAll('[data-goal]').forEach(input => input.onchange = () => {
    const latest = store.get('goals.' + subject.id, {});
    latest[input.dataset.goal] = input.checked;
    store.set('goals.' + subject.id, latest);
  });
  if($('#editSubject', view)) $('#editSubject', view).onclick = () => editSubject(subject);
  ptBindGo(view);
}

function safeLink(raw) {
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function viewTheory(view, subject) {
  const notes = studyEntries(subject).filter(entry => entry.type === 'note');
  const completed = workspace().completed;
  view.innerHTML = '<div class="card"><div class="row"><h3>Theorie und Quellen</h3><button class="btn ghost" id="addMaterial">+ Eintrag hinzufügen</button></div></div>'
    + notes.map(entry => {
      const url = safeLink(entry.url);
      return `<article class="card"><div class="meta muted">${esc(entry.source)}</div><h3>${esc(entry.title)}</h3>
        ${entry.body ? `<p class="study-text">${esc(entry.body)}</p>` : ''}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Quelle öffnen</a>` : ''}
        <div class="row"><label class="goal"><input type="checkbox" data-read="${esc(entry.id)}"${completed[entry.id] === true ? ' checked' : ''}><span>Gelernt</span></label>
        ${entry.subjectId ? `<button class="chip" data-entry-edit="${esc(entry.id)}">Bearbeiten</button>` : ''}</div></article>`;
    }).join('');
  $('#addMaterial', view).onclick = () => editEntry(subject);
  view.querySelectorAll('[data-entry-edit]').forEach(button => button.onclick = () =>
    editEntry(subject, personalEntries(subject).find(entry => entry.id === button.dataset.entryEdit)));
  view.querySelectorAll('[data-read]').forEach(input => input.onchange = () => {
    const next = workspace();
    if(input.checked) next.completed[input.dataset.read] = true;
    else delete next.completed[input.dataset.read];
    if(!store.set('workspace', next)) input.checked = !input.checked;
  });
}

function viewNotes(view, subject) {
  view.innerHTML = `<div class="card"><h3>Meine Notizen</h3><label for="notes" class="muted">Wird automatisch in diesem Browser gespeichert.</label>
    <textarea id="notes" style="min-height:320px">${esc(store.get('notes.' + subject.id, ''))}</textarea></div>`;
  $('#notes', view).oninput = event => store.set('notes.' + subject.id, event.target.value);
}

function showEditor(title, fields, submit, remove) {
  const dialog = $('#contentDlg');
  dialog.innerHTML = `<form class="content-form"><h3 id="contentTitle">${title}</h3>${fields}<p class="fb bad" role="alert"></p>
    <div class="row"><button class="btn" type="submit">Speichern</button><button class="btn ghost" data-close type="button">Abbrechen</button>
    ${remove ? '<button class="chip" data-remove type="button">Löschen</button>' : ''}</div></form>`;
  const form = $('form', dialog);
  $('[data-close]', dialog).onclick = () => dialog.close();
  form.onsubmit = event => {
    event.preventDefault();
    const error = submit(new FormData(form));
    if(error) { $('.fb', dialog).textContent = error; return; }
    dialog.close();
    render();
  };
  if(remove) $('[data-remove]', dialog).onclick = () => {
    if(!confirm('Diesen Eintrag löschen?')) return;
    if(!remove()) { $('.fb', dialog).textContent = 'Die Änderung konnte nicht gespeichert werden.'; return; }
    dialog.close();
    render();
  };
  if(!dialog.open) dialog.showModal();
}

const sourceOptions = source => SOURCES.map(name => `<option${name === source ? ' selected' : ''}>${name}</option>`).join('');
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), n => n.toString(16).padStart(2, '0')).join('');

function editSubject(subject) {
  showEditor(subject ? 'Fach bearbeiten' : 'Fach hinzufügen', `
    <label>Fachname <input name="name" required maxlength="100" autofocus value="${esc(subject?.name)}"></label>
    <label>Quelle <select name="source">${sourceOptions(subject?.source)}</select></label>`, data => {
    const name = data.get('name').trim();
    if(!name) return 'Gib einen Fachnamen ein.';
    const next = workspace();
    const item = {id:subject?.id ?? newId(), name, source:data.get('source')};
    const index = next.subjects.findIndex(existing => existing.id === item.id);
    if(index < 0) next.subjects.push(item);
    else next.subjects[index] = item;
    if(!store.set('workspace', next)) return 'Das Fach konnte nicht gespeichert werden.';
    cur = item.id;
    tab = 'overview';
    store.set('subject', cur);
    store.set('tab', tab);
  });
}

function editEntry(subject, entry, card = entry?.type === 'card') {
  showEditor(entry ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen', `
    <label>${card ? 'Frage' : 'Titel'} <input name="title" required maxlength="180" autofocus value="${esc(entry?.title)}"></label>
    <label>${card ? 'Antwort' : 'Notiz'} <textarea name="body" maxlength="20000"${card ? ' required' : ''}>${esc(entry?.body)}</textarea></label>
    <label>Quelle <select name="source">${sourceOptions(entry?.source)}</select></label>
    <label>Quellenlink (optional) <input name="url" type="url" value="${esc(entry?.url)}"></label>`, data => {
    const title = data.get('title').trim(), body = data.get('body').trim(), url = data.get('url').trim();
    if(!title || (card && !body) || (!body && !url)) return 'Füge einen Titel und Text oder einen Quellenlink hinzu.';
    if(url && !safeLink(url)) return 'Gib einen Link mit http:// oder https:// ein.';
    const next = workspace();
    const item = {id:entry?.id ?? newId(), subjectId:subject.id, title, body, url, source:data.get('source'), type:card ? 'card' : 'note'};
    const index = next.entries.findIndex(existing => existing.id === item.id);
    if(index < 0) next.entries.push(item);
    else next.entries[index] = item;
    if(!store.set('workspace', next)) return 'Der Eintrag konnte nicht gespeichert werden.';
  }, entry && (() => {
    const next = workspace();
    next.entries = next.entries.filter(existing => existing.id !== entry.id);
    delete next.completed[entry.id];
    return store.set('workspace', next);
  }));
}

function addPersonalControls(view, subject, entries) {
  const panel = document.createElement('div');
  panel.className = 'card';
  panel.innerHTML = '<h3>Eigene Lernkarten mit Quelle</h3><ul>' + entries.map(entry => {
    const url = safeLink(entry.url);
    return `<li>${esc(entry.title)} <span class="muted">${esc(entry.source)}</span>
      ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Quelle öffnen</a>` : ''}
      <button class="chip" data-entry-edit="${esc(entry.id)}">Bearbeiten</button></li>`;
  }).join('') + '</ul>';
  panel.querySelectorAll('[data-entry-edit]').forEach(button => button.onclick = () =>
    editEntry(subject, entries.find(entry => entry.id === button.dataset.entryEdit)));
  view.append(panel);
}

function openEx(id) {
  exOpen = id;
  exercise = null;
  render();
  window.scrollTo(0, 0);
}

function viewExercises(view, subject) {
  if(exOpen === 'quiz') return viewQuiz(view);
  if(exOpen === 'formulas') return viewFormulas(view);
  const bank = questionBank(subject.id);
  if(!bank.length) {
    view.innerHTML = '<div class="card empty">Für dieses Fach sind noch keine Übungen hinterlegt.</div>';
    return;
  }
  if(exOpen) return viewExercise(view, subject, exOpen);
  const done = store.get('exercise.' + subject.id, {});
  const wrong = store.get(qk('quizWrong'), []).length;
  const best = store.get(qk('quizBest'), null);
  view.innerHTML = `<div class="card"><h3>Schnelltest</h3><div class="row"><button class="btn" id="startQuiz">Schnelltest starten</button>
    ${wrong ? '<button class="btn ghost" id="retryQuiz">Fehler üben</button>' : ''}
    ${subject.id === 'mathe' ? '<button class="btn ghost" id="formulas">Formel-Trainer</button>' : ''}</div>
    ${best ? `<p class="muted">Bestes Resultat: ${esc(best.score)} von ${esc(best.total)} richtig</p>` : ''}</div>`
    + ptTopics(subject.id).map(topic => `<div class="card"><h3>${esc(topic)}</h3><div class="row">
      ${bank.filter(question => question.topic === topic).map(question =>
        `<button class="chip${done[question.id] ? ' on' : ''}" data-ex="${esc(question.id)}">${esc(question.label)}</button>`).join('')}</div></div>`).join('');
  $('#startQuiz', view).onclick = () => startQuiz(false);
  if($('#retryQuiz', view)) $('#retryQuiz', view).onclick = () => startQuiz(true);
  if($('#formulas', view)) $('#formulas', view).onclick = () => openEx('formulas');
  view.querySelectorAll('[data-ex]').forEach(button => button.onclick = () => openEx(button.dataset.ex));
}

function viewExercise(view, subject, id) {
  const item = questionBank(subject.id).find(question => question.id === id);
  if(!item) { exOpen = null; return viewExercises(view, subject); }
  if(!exercise) exercise = {...makeQuestion(item), topic:item.topic};
  const question = exercise;
  const checked = question.score !== undefined;
  view.innerHTML = `<div class="row" style="margin-bottom:var(--s3)"><button class="btn ghost" id="exBack">← Alle Übungen</button></div>`;
  const result = ptQEl(question, 0, checked);
  view.append(result);
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = checked
    ? '<button class="btn" id="exRetry">Nochmal versuchen</button>'
    : '<button class="btn" id="exCheck">Prüfen</button><button class="btn ghost" id="exSolution">Lösung zeigen</button><span class="fb" role="status"></span>';
  view.append(row);
  $('#exBack', view).onclick = () => openEx(null);
  if(checked) {
    $('#exRetry', row).onclick = () => openEx(id);
    return;
  }
  $('#exSolution', row).onclick = () => {
    if(!$('.expl', result)) {
      const solution = document.createElement('div');
      solution.className = 'expl';
      solution.innerHTML = ptSol(question);
      result.append(solution);
    }
    question.revealed = true;
    $('.fb', row).textContent = 'Lösung eingeblendet. Dieser Versuch zählt nicht.';
  };
  $('#exCheck', row).onclick = () => {
    if(!ptAnswered(question)) { $('.fb', row).textContent = 'Beantworte zuerst die Frage.'; return; }
    question.score = scoreQ(question);
    if(question.score === 1 && !question.revealed) {
      const done = store.get('exercise.' + subject.id, {});
      done[id] = true;
      store.set('exercise.' + subject.id, done);
    }
    render();
  };
}
