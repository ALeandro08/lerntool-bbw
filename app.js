const STORAGE_KEY = 'lerntool-bbw.workspace.v1';
const SOURCES = ['Eigene Notizen', 'Teams', 'OneNote', 'Eigener BBW-Code'];
const byId = id => document.getElementById(id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const view = byId('view');
const nav = byId('subject-nav');
const editor = byId('editor');
const form = byId('edit-form');
const error = byId('form-error');

let selected = null;
let submitEditor;
let storageError = false;

function readWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch {
    storageError = true;
  }
  return { subjects: [], entries: [], completed: {} };
}

let workspace = readWorkspace();

function updateWorkspace(change) {
  const next = readWorkspace();
  if (storageError) return false;
  change(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    workspace = next;
    return true;
  } catch {
    return false;
  }
}

function safeLink(value) {
  try {
    const url = new URL(value);
    if (['https:', 'http:'].includes(url.protocol)) return url.href;
  } catch {
    return '';
  }
  return '';
}

function subjects() {
  return [...starterSubjects, ...workspace.subjects];
}

function entriesFor(subject) {
  return [...subject.entries, ...workspace.entries.filter(entry => entry.subjectId === subject.id)];
}

function progress(entries) {
  return entries.filter(entry => workspace.completed[entry.id] === true).length;
}

function subjectButton(subject, card = false) {
  const entries = entriesFor(subject);
  const current = subject.id === selected ? ' aria-current="page"' : '';
  return card
    ? `<button class="subject-card" data-subject="${escapeHtml(subject.id)}">
        <strong>${escapeHtml(subject.name)}</strong>
        <span class="meta">${escapeHtml(subject.source)}</span>
        <span class="meta">${progress(entries)} von ${entries.length} gelernt</span>
      </button>`
    : `<button data-subject="${escapeHtml(subject.id)}"${current}>${escapeHtml(subject.name)}</button>`;
}

function renderOverview() {
  return `<header class="hero">
      <p class="eyebrow">Berufsbildungsschule Winterthur</p>
      <h1>Mein Lernbereich</h1>
      <p>Fächer öffnen, Lernkarten wiederholen und den eigenen Lernfortschritt festhalten.</p>
    </header>
    <section aria-labelledby="subjects-title">
      <div class="section-heading">
        <h2 id="subjects-title">Meine Fächer</h2>
        <button class="primary" data-action="add-subject">+ Fach hinzufügen</button>
      </div>
      <div class="grid">${subjects().map(subject => subjectButton(subject, true)).join('')}</div>
    </section>`;
}

function renderEntry(entry) {
  const link = safeLink(entry.url);
  const text = `<p class="entry-body">${escapeHtml(entry.body)}</p>`;
  const card = entry.type === 'card';
  return `<article class="entry">
      <p class="meta">${card ? 'Lernkarte' : 'Notiz'} · ${escapeHtml(entry.source)}</p>
      <h3>${escapeHtml(entry.title)}</h3>
      ${card ? `<details><summary>Antwort anzeigen</summary>${text}</details>` : text}
      ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Quelle öffnen</a>` : ''}
      <label><input type="checkbox" data-progress="${escapeHtml(entry.id)}"${workspace.completed[entry.id] ? ' checked' : ''}> Gelernt</label>
      ${entry.subjectId ? `<div class="actions">
        <button data-edit="${escapeHtml(entry.id)}">Bearbeiten</button>
        <button data-delete="${escapeHtml(entry.id)}">Löschen</button>
      </div>` : ''}
    </article>`;
}

function renderSubject(subject) {
  const entries = entriesFor(subject);
  return `<header class="hero">
      <p class="eyebrow">${escapeHtml(subject.source)}</p>
      <h1>${escapeHtml(subject.name)}</h1>
      <p id="progress-label">${progress(entries)} von ${entries.length} gelernt</p>
      ${entries.length ? `<progress aria-labelledby="progress-label" value="${progress(entries)}" max="${entries.length}"></progress>` : ''}
    </header>
    <section aria-labelledby="entries-title">
      <div class="section-heading">
        <h2 id="entries-title">Lernmaterial</h2>
        <div class="actions">
          ${subject.entries.length === 0 && workspace.subjects.some(item => item.id === subject.id)
            ? '<button data-action="edit-subject">Fach bearbeiten</button>' : ''}
          <button class="primary" data-action="add-entry">+ Eintrag hinzufügen</button>
        </div>
      </div>
      ${entries.length ? entries.map(renderEntry).join('') : '<p class="empty">Füge eine Notiz, eine Lernkarte oder einen Link zu deinen Unterlagen hinzu.</p>'}
    </section>`;
}

function render({ focus = false } = {}) {
  const subject = subjects().find(item => item.id === selected);
  nav.innerHTML = subjects().map(item => subjectButton(item)).join('');
  view.innerHTML = subject ? renderSubject(subject) : renderOverview();
  if (focus) byId('main').focus();
}

function openSubject(id) {
  selected = id;
  byId('status').textContent = '';
  render({ focus: true });
}

function openEditor(title, fields, submit) {
  byId('editor-title').textContent = title;
  byId('fields').innerHTML = fields;
  error.textContent = '';
  submitEditor = submit;
  editor.showModal();
}

function sourceOptions(source) {
  return SOURCES.map(name => `<option${name === source ? ' selected' : ''}>${name}</option>`).join('');
}

function editSubject(subject) {
  openEditor(subject ? 'Fach bearbeiten' : 'Fach hinzufügen', `
    <label>Fachname <input name="name" required maxlength="100" autofocus value="${escapeHtml(subject?.name ?? '')}"></label>
    <label>Quelle <select name="source">${sourceOptions(subject?.source)}</select></label>`, data => {
    const name = data.get('name').trim();
    if (!name) return 'Gib einen Fachnamen ein.';
    const id = subject?.id ?? crypto.randomUUID();
    const item = { id, name, source: data.get('source'), entries: [] };
    if (!updateWorkspace(next => {
      next.subjects = next.subjects.filter(existing => existing.id !== id).concat(item);
    })) return 'Das Fach konnte nicht gespeichert werden.';
    selected = id;
  });
}

function syncEntryFields() {
  const isCard = form.elements.type.value === 'card';
  byId('entry-title-label').textContent = isCard ? 'Frage' : 'Titel';
  byId('entry-body-label').textContent = isCard ? 'Antwort' : 'Notiz';
  form.elements.body.required = isCard;
}

function editEntry(entry) {
  openEditor(entry ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen', `
    <label>Typ <select name="type"><option value="note">Notiz / Link</option>
      <option value="card"${entry?.type === 'card' ? ' selected' : ''}>Lernkarte</option></select></label>
    <label><span id="entry-title-label">Titel</span><input name="title" required maxlength="180" autofocus value="${escapeHtml(entry?.title ?? '')}"></label>
    <label><span id="entry-body-label">Notiz</span><textarea name="body" maxlength="20000">${escapeHtml(entry?.body ?? '')}</textarea></label>
    <label>Quelle <select name="source">${sourceOptions(entry?.source)}</select></label>
    <label>Quellenlink (optional) <input name="url" type="url" placeholder="https://..." value="${escapeHtml(entry?.url ?? '')}"></label>`, data => {
    const title = data.get('title').trim();
    const body = data.get('body').trim();
    const url = data.get('url').trim();
    const type = data.get('type');
    if (!title || (type === 'card' && !body)) return 'Fülle Titel oder Frage und die Antwort aus.';
    if (url && !safeLink(url)) return 'Gib einen Link mit https:// oder http:// ein.';
    if (!body && !url) return 'Füge Text oder einen Quellenlink hinzu.';

    const item = {
      id: entry?.id ?? crypto.randomUUID(), subjectId: selected, title, body, url,
      source: data.get('source'), type
    };
    if (!updateWorkspace(next => {
      const index = next.entries.findIndex(existing => existing.id === item.id);
      if (index === -1) next.entries.push(item);
      else next.entries[index] = item;
    })) return 'Der Eintrag konnte nicht gespeichert werden.';
  });
  syncEntryFields();
}

byId('home').addEventListener('click', () => openSubject(null));
byId('add-subject').addEventListener('click', () => editSubject());
byId('cancel').addEventListener('click', () => editor.close());

form.addEventListener('change', event => {
  if (event.target.name === 'type') syncEntryFields();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const failure = submitEditor(new FormData(form));
  if (failure) {
    error.textContent = failure;
    return;
  }
  editor.close();
  render({ focus: true });
});

nav.addEventListener('click', event => {
  const button = event.target.closest('[data-subject]');
  if (button) openSubject(button.dataset.subject);
});

view.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { subject, action, edit, delete: remove } = button.dataset;
  if (subject) openSubject(subject);
  if (action === 'add-subject') editSubject();
  if (action === 'edit-subject') editSubject(workspace.subjects.find(item => item.id === selected));
  if (action === 'add-entry') editEntry();
  if (edit) editEntry(workspace.entries.find(entry => entry.id === edit));
  if (remove && confirm('Diesen Eintrag löschen?')) {
    const saved = updateWorkspace(next => {
      next.entries = next.entries.filter(entry => entry.id !== remove);
      delete next.completed[remove];
    });
    if (saved) render({ focus: true });
    else byId('status').textContent = 'Der Eintrag konnte nicht gelöscht werden.';
  }
});

view.addEventListener('change', event => {
  const checkbox = event.target;
  const id = checkbox.dataset.progress;
  if (!id) return;
  if (!updateWorkspace(next => {
    if (checkbox.checked) next.completed[id] = true;
    else delete next.completed[id];
  })) {
    checkbox.checked = !checkbox.checked;
    byId('status').textContent = 'Der Fortschritt konnte nicht gespeichert werden.';
    return;
  }
  const entries = entriesFor(subjects().find(subject => subject.id === selected));
  const total = progress(entries);
  byId('progress-label').textContent = `${total} von ${entries.length} gelernt`;
  view.querySelector('progress').value = total;
  byId('status').textContent = '';
});

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  workspace = readWorkspace();
  if (!editor.open) render();
});

render();
if (storageError) byId('status').textContent = 'Die gespeicherten Daten konnten nicht geladen werden.';
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(console.warn);
}
