function viewLab(view) {
  view.innerHTML = `<div class="card">
    <h3>Filius-Labor · Client und Webserver</h3>
    <p>Simuliere einen Client und einen Server mit Netzmaske /24. In diesem Modell gibt es keinen Router.</p>
    <form id="networkLab">
      <div class="lab-controls">
        <label>Client-IP <input name="client" value="192.168.1.10" required></label>
        <label>Server-IP <input name="server" value="192.168.1.20" required></label>
        <label>Webserver <select name="service"><option value="on">Läuft</option><option value="off">Gestoppt</option></select></label>
      </div>
      <div class="row"><button class="btn" type="submit">Verbindung testen</button></div>
    </form>
    <div class="expl" id="labResult" role="status">Ändere die Client-IP auf 192.168.2.10 oder stoppe den Dienst. Vergleiche danach Ping und HTTP.</div>
  </div>`;
  $('#networkLab', view).onsubmit = event => {
    event.preventDefault();
    const data = new FormData(event.target);
    $('#labResult', view).textContent = networkResult(data.get('client').trim(), data.get('server').trim(), data.get('service') === 'on');
  };
}

function networkResult(client, server, service) {
  const valid = ip => {
    const octets = ip.split('.');
    return octets.length === 4 && octets.every(part => /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255) &&
      Number(octets[3]) > 0 && Number(octets[3]) < 255;
  };
  if(!valid(client) || !valid(server)) return 'Gib für beide Geräte eine IPv4-Hostadresse ein. Bei /24 endet sie weder auf .0 noch auf .255.';
  if(client === server) return 'Adresskonflikt: Client und Server brauchen unterschiedliche IP-Adressen.';
  if(client.split('.').slice(0, 3).join('.') !== server.split('.').slice(0, 3).join('.')){
    return 'Ping und HTTP scheitern. Die Geräte liegen in verschiedenen /24-Subnetzen und haben keinen Router.';
  }
  return service ? 'Ping und HTTP gelingen. Beide Geräte sind im gleichen Subnetz und der Webserver läuft.'
    : 'Ping gelingt. HTTP scheitert, weil der Webserver gestoppt ist.';
}

const FORMULAS = [
  {title:'Bit und Byte', formula:'Bit = Byte × 8', result:'Bit', terms:['Byte','×','8'], create:() => {
    const bytes = 50 * randomInteger(2, 40);
    return {q:`Rechne ${bytes} Byte in Bit um.`, answer:bytes * 8, unit:'Bit'};
  }},
  {title:'Dateigrösse eines Bildes', formula:'Byte = Breite × Höhe × Farbtiefe ÷ 8', result:'Byte', terms:['Breite','×','Höhe','×','Farbtiefe','÷','8'], create:() => {
    const width = 80 * randomInteger(4, 16), height = 60 * randomInteger(4, 16);
    return {q:`Unkomprimiertes Bild: ${width} × ${height} Pixel, 24 Bit pro Pixel. Wie gross ist es in Byte?`, answer:width * height * 3, unit:'Byte'};
  }},
  {title:'Übertragungszeit', formula:'Sekunden = Dateigrösse in Mbit ÷ Datenrate in Mbit/s', result:'Sekunden', terms:['Dateigrösse in Mbit','÷','Datenrate in Mbit/s'], create:() => {
    const rate = 8 * randomInteger(1, 10), seconds = randomInteger(5, 80);
    return {q:`Wie lange dauert die Übertragung von ${rate * seconds / 8} MB bei ${rate} Mbit/s ohne Overhead?`, answer:seconds, unit:'s'};
  }}
];
const randomInteger = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function viewFormulas(view, mode = 'calc') {
  view.innerHTML = `<div class="row" style="margin-bottom:var(--s3)"><button class="btn ghost" id="formulasBack">← Alle Übungen</button></div>
    <div class="card"><h3>Formel-Trainer</h3><div class="subtabs">
      <button class="chip${mode === 'calc' ? ' on' : ''}" id="calcMode">Rechnen</button>
      <button class="chip${mode === 'build' ? ' on' : ''}" id="buildMode">Formel bauen</button></div>
      <details><summary>Formelblatt</summary><ul>
      ${FORMULAS.map(item => `<li><b>${item.title}</b> · ${item.formula}</li>`).join('')}</ul></details>
      <form id="formulaExercise">
        <div class="lab-controls"><label>Thema <select name="topic">${FORMULAS.map((item, index) =>
          `<option value="${index}">${item.title}</option>`).join('')}</select></label>
          <label>Resultat <input name="result" inputmode="decimal" required></label></div>
        <p id="formulaPrompt"></p>
        <div class="row"><button type="submit" class="btn">Prüfen</button>
          <button type="button" class="btn ghost" id="formulaSolution">Lösung zeigen</button>
          <button type="button" class="btn ghost" id="formulaNext">Neue Aufgabe</button></div>
        <p class="fb" id="formulaFeedback" role="status"></p>
      </form>
    </div>`;
  $('#formulasBack', view).onclick = () => openEx(null);
  $('#calcMode', view).onclick = () => viewFormulas(view, 'calc');
  $('#buildMode', view).onclick = () => viewFormulas(view, 'build');
  const form = $('#formulaExercise', view), feedback = $('#formulaFeedback', view);
  if(mode === 'build'){
    renderFormulaBuilder(form);
    return;
  }
  let exercise;
  function generate() {
    exercise = FORMULAS[Number(form.elements.topic.value)].create();
    $('#formulaPrompt', view).textContent = exercise.q;
    form.elements.result.value = '';
    feedback.textContent = '';
  }
  form.elements.topic.onchange = generate;
  $('#formulaNext', view).onclick = generate;
  $('#formulaSolution', view).onclick = () => {
    feedback.textContent = `${exercise.answer.toLocaleString('de-CH')} ${exercise.unit} · ${FORMULAS[Number(form.elements.topic.value)].formula}`;
  };
  form.onsubmit = event => {
    event.preventDefault();
    const correct = numIn(form.elements.result.value) === exercise.answer;
    feedback.className = 'fb ' + (correct ? 'ok' : 'bad');
    feedback.textContent = correct ? 'Richtig.' : 'Noch nicht richtig. Prüfe Einheiten und Formel.';
  };
  generate();
}

function renderFormulaBuilder(form) {
  const operators = ['×', '÷'];
  const terms = [...new Set(FORMULAS.flatMap(item => item.terms).filter(term => !operators.includes(term)))];
  const options = '<option value="">–</option>' + terms.map(term => `<option>${term}</option>`).join('');
  form.innerHTML = `<div class="lab-controls"><label>Formel <select name="topic">${FORMULAS.map((item, index) =>
    `<option value="${index}">${item.title}</option>`).join('')}</select></label></div>
    <div class="row" id="formulaParts"></div><div class="row"><button class="btn" type="submit">Prüfen</button></div>
    <p class="fb" id="builderFeedback" role="status"></p>`;
  const parts = $('#formulaParts', form), feedback = $('#builderFeedback', form);
  const selected = () => FORMULAS[Number(form.elements.topic.value)];
  function renderParts(){
    const item = selected();
    parts.innerHTML = `<b>${item.result} =</b>` + item.terms.map((term, index) =>
      operators.includes(term) ? `<span>${term}</span>` : `<select required aria-label="Position ${index + 1}" data-part="${index}">${options}</select>`).join('');
    feedback.textContent = '';
  }
  form.elements.topic.onchange = renderParts;
  form.onsubmit = event => {
    event.preventDefault();
    const item = selected();
    const answers = [...parts.querySelectorAll('[data-part]')];
    const correct = answers.every(input => input.value === item.terms[Number(input.dataset.part)]);
    feedback.className = 'fb ' + (correct ? 'ok' : 'bad');
    feedback.textContent = (correct ? 'Richtig. ' : 'Vergleiche mit der Lösung: ') + item.formula;
  };
  renderParts();
}
