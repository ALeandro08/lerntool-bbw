const starterSubjects = [
  {
    id: 'mathe',
    name: 'Mathematik',
    source: 'OneNote · Teams',
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
      },
      {
        id: 'mathe-zahlen', type: 'card', source: 'Teams',
        title: 'Welchen Wert hat 101101₂ in Dezimal und Hexadezimal?',
        body: '32 + 8 + 4 + 1 = 45. Für Hexadezimal gruppierst du die Bits von rechts: 0010 1101 ergibt 2D₁₆.'
      },
      {
        id: 'mathe-bandbreite', type: 'card', source: 'Teams',
        title: 'Wie lange dauert ein Download von 90 MB bei 12 Mbit/s?',
        body: '90 MB × 8 = 720 Mbit. 720 Mbit ÷ 12 Mbit/s = 60 Sekunden bei konstanter Geschwindigkeit ohne Protokoll-Overhead.'
      },
      {
        id: 'mathe-potenz', type: 'card', source: 'Teams',
        title: 'Berechne 10⁻⁴ ÷ 10² und log₃(81).',
        body: 'Beim Dividieren gleicher Basen subtrahierst du die Exponenten: 10⁽⁻⁴⁻²⁾ = 10⁻⁶. Weil 3⁴ = 81, gilt log₃(81) = 4.'
      },
      {
        id: 'mathe-dateigroesse', type: 'card', source: 'Teams',
        title: 'Wie gross ist ein unkomprimiertes Bild mit 800 × 600 Pixeln und 24 Bit pro Pixel?',
        body: '800 × 600 × 24 = 11 520 000 Bit. Das sind 1 440 000 Byte oder 1,44 MB ohne Dateikopf.'
      }
    ]
  },
  {
    id: 'm162-m164',
    name: 'Module 162 und 164 · Daten',
    source: 'OneNote · Teams',
    entries: [
      {
        id: 'm164-uml', type: 'note', source: 'Teams',
        title: 'UML-Beziehungen formulieren',
        body: 'Lerne die vier Schreibweisen: 1..1 steht für genau eins, 0..1 für höchstens eins, 1..* für mindestens eins und 0..* erlaubt jede Anzahl ab null. Lies jede Beziehung in beide Richtungen. Die Angabe an einer Klasse beschreibt, wie viele Objekte dieser Klasse zu einem Objekt am anderen Ende gehören.'
      },
      {
        id: 'm164-uml-bestellung', type: 'card', source: 'Teams',
        title: 'Jede Bestellung hat genau einen Kunden. Ein Kunde kann beliebig viele Bestellungen haben. Wo stehen die Multiplizitäten?',
        body: 'Am Ende Kunde steht 1..1. Am Ende Bestellung steht 0..*. Ein Kunde kann auch ohne Bestellung existieren.'
      },
      {
        id: 'm164-uml-raum', type: 'card', source: 'Teams',
        title: 'Ein Kurs nutzt höchstens einen Raum. Ein Raum wird von mindestens einem Kurs genutzt. Wie lautet die Beziehung in UML?',
        body: 'Am Ende Raum steht 0..1, am Ende Kurs steht 1..*. In beiden Richtungen hilft die Frage: Wie viele Objekte am anderen Ende gehören zu diesem einen Objekt?'
      },
      {
        id: 'm162-excel', type: 'card', source: 'Teams',
        title: 'Wie berechnest du in Excel den Mittelwert von B2 bis B9 und stellst die Werte nach Monaten dar?',
        body: 'In einer deutschsprachigen Excel-Oberfläche berechnet =MITTELWERT(B2:B9) den Durchschnitt. Für einen zeitlichen Verlauf eignet sich ein Liniendiagramm mit den Monaten auf der X-Achse.'
      }
    ]
  },
  {
    id: 'm117',
    name: 'Modul 117 · Netzwerke',
    source: 'OneNote · Teams',
    entries: [
      {
        id: 'm117-wlan', type: 'card', source: 'Teams',
        title: 'Was bedeuten SSID und BSSID?',
        body: 'Die SSID ist der Name des WLANs. Die BSSID identifiziert ein konkretes Basic Service Set. In einem typischen WLAN ist sie eine MAC-Adresse des Access Points für dieses WLAN.'
      },
      {
        id: 'm117-osi', type: 'card', source: 'Teams',
        title: 'Welche OSI-Schichten deckt WLAN nach IEEE 802.11 ab?',
        body: 'Schicht 1 umfasst die Funkübertragung. Schicht 2 regelt den Medienzugriff und den Austausch von Frames.'
      },
      {
        id: 'm117-filius', type: 'note', source: 'Teams',
        title: 'Webserver in Filius üben',
        body: 'Verbinde einen Client und einen Webserver. Vergib IP-Adressen im selben Subnetz, starte den Webserver und rufe ihn vom Client über seine IP-Adresse auf. Prüfe die Verbindung schrittweise, falls die Seite nicht erscheint.'
      },
      {
        id: 'm117-iperka', type: 'card', source: 'Teams',
        title: 'Wofür stehen die sechs Schritte von IPERKA?',
        body: 'Informieren, Planen, Entscheiden, Realisieren, Kontrollieren und Auswerten. Beim Kontrollieren prüfst du das Ergebnis gegen die Anforderungen. Beim Auswerten hältst du fest, was du beim nächsten Mal verbessern würdest.'
      }
    ]
  },
  {
    id: 'm231',
    name: 'Modul 231 · Datenschutz',
    source: 'OneNote · Teams · Eigener BBW-Code',
    entries: [
      {
        id: 'm231-auth', type: 'card', source: 'Eigener BBW-Code',
        title: 'Was ist der Unterschied zwischen Authentifizierung und Autorisierung?',
        body: 'Bei der Authentifizierung wird die Identität geprüft. Bei der Autorisierung wird geprüft, welche Aktionen diese Identität ausführen darf.'
      },
      {
        id: 'm231-hash', type: 'card', source: 'Teams',
        title: 'Worin unterscheiden sich Hashing und Verschlüsselung?',
        body: 'Eine Hashfunktion erzeugt aus Daten einen Prüfwert fester Länge. Verschlüsselung schützt Daten so, dass sie mit dem passenden Schlüssel wieder lesbar werden.'
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
    name: 'Modul 293 · Webentwicklung',
    source: 'OneNote · Teams · Eigener BBW-Code',
    entries: [
      {
        id: 'm293-html-css', type: 'card', source: 'Teams',
        title: 'Was legst du mit HTML fest, und wofür verwendest du CSS?',
        body: 'HTML strukturiert Inhalte und beschreibt ihre Bedeutung, etwa mit Überschriften und Absätzen. CSS bestimmt ihre Darstellung, etwa Abstände, Farben und Layout.'
      },
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
  },
  {
    id: 'english',
    name: 'English',
    source: 'OneNote · Teams',
    entries: [
      {
        id: 'english-present', type: 'card', source: 'Teams',
        title: 'Complete the sentence: I usually ___ (cook) at home, but today I ___ (eat) out.',
        body: 'I usually cook at home, but today I am eating out. Use the present simple for a routine and the present continuous for a temporary situation.'
      },
      {
        id: 'english-future', type: 'card', source: 'Teams',
        title: 'Which future form fits a confirmed dinner booking? Give an example.',
        body: 'Use the present continuous for an arrangement already made. For example: We’re having dinner at seven. The table is booked.'
      },
      {
        id: 'english-vocabulary', type: 'note', source: 'Teams',
        title: 'Food, cooking and personality vocabulary',
        body: 'Write three sentences using chop, boil and bake. Then describe someone using two personality adjectives, such as reliable and curious, and give one example of their behaviour for each adjective.'
      }
    ]
  },
  {
    id: 'abu',
    name: 'ABU',
    source: 'OneNote · Teams',
    entries: [
      {
        id: 'abu-artikel', type: 'note', source: 'Teams',
        title: 'Einen Zeitungsartikel erschliessen',
        body: 'Lies Titel und Einleitung und formuliere die Kernaussage in einem Satz. Markiere anschliessend drei schwierige Wendungen. Erkläre jede Wendung in eigenen Worten und prüfe, ob deine Erklärung im Satz Sinn ergibt.'
      },
      {
        id: 'abu-fakten', type: 'card', source: 'Teams',
        title: 'Wie erkennst du in einem Artikel den Unterschied zwischen einer Tatsachenbehauptung und einer Meinung?',
        body: 'Eine Tatsachenbehauptung lässt sich anhand von Quellen prüfen. Eine Meinung drückt eine persönliche Einschätzung oder Wertung aus. Ein Satz kann beides enthalten.'
      }
    ]
  }
];
