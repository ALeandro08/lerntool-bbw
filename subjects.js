const starterSubjects = [
  {
    id: 'mathe',
    name: 'Mathematik',
    source: 'OneNote',
    entries: [
      {
        id: 'mathe-logik', type: 'card', source: 'OneNote',
        title: 'Wann ist eine UND-Verknüpfung wahr?',
        body: 'Genau dann, wenn beide Aussagen wahr sind. Sobald mindestens eine Aussage falsch ist, ist die Verknüpfung falsch.'
      },
      {
        id: 'mathe-grundlagen', type: 'note', source: 'OneNote',
        title: 'Grundlagen und Logik',
        body: 'Wiederhole die Grundlagen und stelle für NICHT, UND und ODER je eine Wahrheitstabelle auf.'
      }
    ]
  },
  {
    id: 'm162-m164',
    name: 'Module 162 und 164',
    source: 'OneNote',
    entries: []
  },
  {
    id: 'm231',
    name: 'Modul 231',
    source: 'Eigener BBW-Code',
    entries: [
      {
        id: 'm231-auth', type: 'card', source: 'Eigener BBW-Code',
        title: 'Was ist der Unterschied zwischen Authentifizierung und Autorisierung?',
        body: 'Bei der Authentifizierung wird die Identität geprüft. Bei der Autorisierung wird geprüft, welche Aktionen diese Identität ausführen darf.'
      },
      {
        id: 'm231-form', type: 'note', source: 'Eigener BBW-Code',
        title: 'Ein Anmeldeformular nachvollziehen',
        body: 'Zeichne den Ablauf deiner Spring-Anwendung. Wo wird das Formular angezeigt? Wohin werden die Daten gesendet? Welche Antwort erhält der Browser?',
        url: 'https://github.com/ALeandro08/bbw-projects-aleandro-durso/tree/main/Modul%20231'
      }
    ]
  },
  {
    id: 'm293',
    name: 'Modul 293',
    source: 'Eigener BBW-Code',
    entries: [
      {
        id: 'm293-next', type: 'card', source: 'Eigener BBW-Code',
        title: 'Welche Datei definiert im Next.js App Router die Startseite?',
        body: 'Im eigenen Projekt ist es src/app/page.js. Das gemeinsame Layout liegt in src/app/layout.js.'
      },
      {
        id: 'm293-practice', type: 'note', source: 'Eigener BBW-Code',
        title: 'Startseite und Layout üben',
        body: 'Ändere lokal die Überschrift der Startseite. Vergleiche danach, welche Teile aus page.js und welche aus layout.js stammen.',
        url: 'https://github.com/ALeandro08/bbw-projects-aleandro-durso/tree/main/Modul%20293'
      }
    ]
  }
];
