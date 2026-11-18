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
        body: 'NICHT kehrt den Wahrheitswert um. UND ist nur wahr, wenn beide Aussagen wahr sind. Das inklusive ODER ist wahr, sobald mindestens eine Aussage wahr ist.\n\nPrüfe für A und B alle vier Kombinationen: falsch/falsch, falsch/wahr, wahr/falsch und wahr/wahr.'
      },
      {
        id: 'mathe-stellenwerte', type: 'note', source: 'Teams',
        title: 'Stellenwerte und SI-Präfixe',
        body: 'Lies Binärzahlen von rechts mit den Gewichten 1, 2, 4, 8, … . Für Hexadezimal bündelst du jeweils vier Bits. In der Basis 16 stehen A bis F für 10 bis 15.\n\n0,000 004 m = 4 × 10⁻⁶ m = 4 µm. In der Ingenieurschreibweise ist der Exponent ein Vielfaches von drei.'
      },
      {
        id: 'mathe-dateien', type: 'note', source: 'Teams',
        title: 'Dateigrössen und Übertragungen',
        body: '1 Byte = 8 Bit. Bei einem unkomprimierten Bild multiplizierst du Breite, Höhe und Farbtiefe. Bei einem Video multiplizierst du zusätzlich mit der Bildrate und der Dauer.\n\nFür die Übertragungszeit brauchst du dieselbe Einheit oben und unten: 40 MB entsprechen 320 Mbit. Bei 16 Mbit/s dauert die Übertragung 20 s, wenn die Rate konstant ist.'
      },
      {
        id: 'mathe-potenz-theorie', type: 'note', source: 'Teams',
        title: 'Potenzen und Logarithmen',
        body: 'Bei gleicher Basis addierst du beim Multiplizieren und subtrahierst beim Dividieren die Exponenten. Eine negative Hochzahl bedeutet den Kehrwert.\n\nDer Logarithmus beantwortet die Frage nach dem Exponenten. log₅(25) = 2, weil 5² = 25.'
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
      },
      {
        id: 'm162-tabellen-theorie', type: 'note', source: 'Teams',
        title: 'Daten in Tabellen aufbereiten',
        body: 'Eine Zeile steht für einen Datensatz und jede Spalte für ein Merkmal. Wähle eindeutige Überschriften und einheitliche Einheiten. Sortiere jeweils die gesamte Tabelle, damit die Werte einer Zeile zusammenbleiben.\n\nExcel passt relative Zellbezüge beim Kopieren an. Ein Bezug wie $B$3 bleibt konstant. Bei einem Diagramm zeigen Linien einen Verlauf und Balken eignen sich für den Vergleich von Kategorien.'
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
        id: 'm117-wlan-theorie', type: 'note', source: 'Teams',
        title: 'Funknetz, Access Point und OSI',
        body: 'Die SSID ist der WLAN-Name. Mehrere Access Points können dieselbe SSID aussenden, haben aber unterschiedliche BSSIDs. Beim Standortwechsel kann ein Client daher zum nächsten Access Point wechseln, während der WLAN-Name gleich bleibt.\n\nTrenne den physischen Funk (OSI 1), die Frames und den Medienzugriff (OSI 2) von der IP-Adressierung (OSI 3).'
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
        id: 'm231-hash-theorie', type: 'note', source: 'Teams',
        title: 'Prüfwerte und Passwörter',
        body: 'Ein Hash kann helfen, Veränderungen an einer Datei festzustellen, wenn du den erwarteten Prüfwert aus einer vertrauenswürdigen Quelle hast. Bei der Anmeldung vergleicht ein Dienst das Ergebnis einer Passwortprüfung mit dem gespeicherten Wert. Dafür benutzt man einen eigenen Passwort-Hash mit zufälligem Salt.\n\nPrüfe getrennt: Wer ist angemeldet? Welche Aktion ist erlaubt? Welche Daten sind für den Zweck überhaupt nötig?'
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
        id: 'm293-html-theorie', type: 'note', source: 'Teams',
        title: 'Semantisches HTML und CSS-Layout',
        body: 'Gliedere eine Seite mit Überschriften, Navigation und Hauptinhalt. Verwende ein button-Element für eine Aktion und einen Link für Navigation. Beschrifte Formularfelder mit label.\n\nCSS selektiert Klassen mit einem Punkt, zum Beispiel .card. Mit Flexbox ordnest du Elemente vor allem entlang einer Achse an. Grid kann Zeilen und Spalten gemeinsam steuern.'
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
      },
      {
        id: 'english-grammar-theory', type: 'note', source: 'Teams',
        title: 'Present tenses and future forms',
        body: 'Use the present simple for routines: I cook on Sundays. Use the present continuous for something in progress: I am cooking now.\n\nFor a confirmed arrangement, use the present continuous: I’m meeting Sam at seven. For a prediction based on present evidence, use going to: Look at that pan. It’s going to boil over.'
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
      },
      {
        id: 'abu-wendungen', type: 'note', source: 'Teams',
        title: 'Wendungen in eigenen Worten erklären',
        body: 'Lies zuerst den Satz davor und danach. Ersetze die Wendung mit einer kurzen Erklärung und lies den ganzen Satz nochmals. Beispiel: «Die Diskussion nimmt Fahrt auf» bedeutet, dass sie lebhafter wird oder sich schneller entwickelt. Es geht hier um den Verlauf der Diskussion.'
      }
    ]
  }
];
