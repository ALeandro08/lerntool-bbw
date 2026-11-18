// Bei Multiple Choice steht die richtige Antwort an erster Stelle.
const multiple = (id, topic, label, q, a, x) => ({id, topic, label, q, a, x});
const numeric = (id, topic, label, q, ans, unit, x) => ({id, topic, label, q, kind:'num', ans, unit, tol:0.00001, x});
const truth = (id, topic, label, q, ans, x) => ({id, topic, label, q, kind:'tf', ans, x});
const typed = (id, topic, label, q, ans, x) => ({id, topic, label, q, kind:'text', ans, x});
const matched = (id, topic, label, q, pairs) => ({id, topic, label, q, kind:'match', pairs});
const umlOptions = ['0..1', '1..1', '0..*', '1..*'];

const COURSE_QUESTIONS = {
  mathe: [
    multiple('bin-1101', 'Zahlensysteme', 'Binär umrechnen', 'Welche Dezimalzahl entspricht 1101₂?', ['13','11','12','15'], '8 + 4 + 1 = 13.'),
    multiple('hex-3c', 'Zahlensysteme', 'Hexadezimal umrechnen', 'Welchen Dezimalwert hat 3C₁₆?', ['60','48','51','54'], '3 × 16 + 12 = 60.'),
    numeric('bytes', 'Einheiten und Dateigrössen', 'Bit und Byte', 'Wie viele Bit sind 1 500 Byte?', 12000, 'Bit', '1 500 × 8 = 12 000 Bit.'),
    multiple('prefix', 'Einheiten und Dateigrössen', 'SI-Präfixe', 'Welche Schreibweise entspricht 0,0032 Volt?', ['3,2 mV','32 mV','3,2 µV','0,32 mV'], 'Milli steht für 10⁻³.'),
    numeric('video', 'Einheiten und Dateigrössen', 'Videogrösse', 'Wie gross ist ein unkomprimiertes Video (320 × 240 Pixel, 24 Bit/Pixel, 25 Bilder/s, 2 Sekunden)?', 11520000, 'Byte', '320 × 240 × 24 × 25 × 2 ÷ 8 = 11 520 000 Byte.'),
    numeric('download', 'Übertragungszeiten', 'Download berechnen', 'Wie lange dauert der Download von 150 MB bei 20 Mbit/s ohne Overhead?', 60, 's', '150 × 8 ÷ 20 = 60 Sekunden.'),
    multiple('bandwidth', 'Übertragungszeiten', 'Bandbreite berechnen', 'Welche Datenrate braucht ein Upload von 30 MB in 12 Sekunden?', ['20 Mbit/s','2,5 Mbit/s','30 Mbit/s','240 Mbit/s'], '30 × 8 ÷ 12 = 20 Mbit/s.'),
    multiple('power', 'Potenzen und Logarithmen', 'Potenzgesetz anwenden', 'Was ergibt 10⁻⁴ × 10⁷?', ['10³','10⁻³','10⁻²⁸','10¹¹'], 'Beim Multiplizieren gleicher Basen werden die Exponenten addiert.'),
    numeric('log', 'Potenzen und Logarithmen', 'Logarithmus bestimmen', 'Was ist log₂(32)?', 5, '', '2⁵ = 32.'),
    multiple('logic', 'Logik', 'Aussagen verknüpfen', 'A ist wahr und B ist falsch. Welche Aussage ist wahr?', ['A ODER B','A UND B','NICHT A','A UND NICHT A'], 'Beim inklusiven ODER genügt eine wahre Aussage.')
  ],
  'm162-m164': [
    matched('uml-match', 'UML-Multiplizitäten', 'Multiplizitäten zuordnen', 'Ordne jeder UML-Multiplizität ihre Bedeutung zu.', [['0..1','null oder eins'],['1..1','genau eins'],['0..*','null oder beliebig viele'],['1..*','eins oder mehr']]),
    {id:'uml-team', topic:'UML-Multiplizitäten', label:'Team und Mitglieder', kind:'fields',
      q:'In diesem Modell gehört jedes Mitglied genau einem Team an. Jedes Team hat mindestens ein Mitglied. Setze beide Multiplizitäten.',
      fields:[{label:'Am Ende Team', ans:'1..1', opts:umlOptions},{label:'Am Ende Mitglied', ans:'1..*', opts:umlOptions}],
      x:'Die Zahl am Ende Team zählt Teams pro Mitglied. Die Zahl am Ende Mitglied zählt Mitglieder pro Team.'},
    multiple('uml-reservation', 'UML-Multiplizitäten', 'Optionale Beziehung', 'Ein Platz kann zu einem bestimmten Zeitpunkt frei oder einmal reserviert sein. Was steht am Ende Reservierung?', ['0..1','1..1','0..*','1..*'], 'Pro Platz sind null oder eine Reservierung möglich.'),
    multiple('uml-read', 'UML-Multiplizitäten', 'Beziehung lesen', 'In der Beziehung Bestellung–Artikel steht 1..* am Ende Artikel. Was folgt?', ['Jede Bestellung enthält mindestens einen Artikel.','Jeder Artikel gehört genau einer Bestellung.','Eine Bestellung kann ohne Artikel existieren.','Jeder Artikel hat mindestens eine Bestellung.'], 'Die Angabe am Ende Artikel zählt Artikel pro Bestellung.'),
    truth('uml-zero', 'UML-Multiplizitäten', 'Null zulassen?', 'Die Multiplizität 0..* schliesst eine leere Menge aus.', false, 'Null ist die erlaubte Untergrenze.'),
    multiple('sheet-average', 'Excel und Datenanalyse', 'Mittelwert berechnen', 'Welche Formel berechnet den Mittelwert der Zellen C2 bis C8 in Excel auf Deutsch?', ['=MITTELWERT(C2:C8)','=SUMME(C2:C8)','=ANZAHL(C2:C8)','=MAX(C2:C8)'], 'MITTELWERT dividiert die Summe der Zahlen durch deren Anzahl.'),
    multiple('sheet-line', 'Excel und Datenanalyse', 'Diagramm auswählen', 'Welches Diagramm passt am besten zu einem monatlichen Temperaturverlauf?', ['Liniendiagramm','Kreisdiagramm','Organigramm','Stapel aus Einzelwerten'], 'Eine Linie zeigt die zeitliche Veränderung.'),
    typed('sheet-reference', 'Excel und Datenanalyse', 'Absoluter Zellbezug', 'Schreibe den vollständig absoluten Bezug auf Zelle B3.', ['$B$3'], 'Das erste Dollarzeichen fixiert die Spalte, das zweite die Zeile.'),
    multiple('sheet-units', 'Excel und Datenanalyse', 'Daten vergleichen', 'Eine Tabelle gibt Weglängen teils in Metern und teils in Kilometern an. Was prüfst du vor einem Vergleich?', ['Alle Werte sind in dieselbe Einheit umgerechnet.','Die Zeilen sind alphabetisch sortiert.','Alle Zahlen haben zwei Nachkommastellen.','Die Überschrift ist fett.'], 'Vergleiche Beträge erst in einer gemeinsamen Einheit.'),
    multiple('sheet-sort', 'Excel und Datenanalyse', 'Tabelle sortieren', 'Warum sortierst du beim Ordnen nach Datum die ganze Tabelle?', ['Damit die Felder jedes Datensatzes zusammenbleiben.','Damit die Datumswerte unverändert an ihrem alten Ort bleiben.','Damit doppelte Datensätze gelöscht werden.','Damit jede Zahl auf zwei Stellen gerundet wird.'], 'Nur eine einzelne Spalte zu sortieren würde Datensätze vermischen.')
  ],
  m117: [
    multiple('wlan-name', 'WLAN und OSI', 'SSID erkennen', 'Welche Angabe ist der sichtbare WLAN-Name?', ['SSID','BSSID','IP-Adresse','Standardgateway'], 'Die SSID ist der Name; die BSSID kennzeichnet ein einzelnes Funknetz.'),
    multiple('wlan-osi', 'WLAN und OSI', 'OSI-Schicht erkennen', 'Zu welcher OSI-Schicht gehört die Funkübertragung?', ['Schicht 1','Schicht 2','Schicht 3','Schicht 7'], 'Funk ist das physische Medium in Schicht 1.'),
    multiple('wlan-range', 'WLAN und OSI', 'Frequenzbereiche vergleichen', 'Welches Band reicht bei vergleichbaren Bedingungen häufig weiter durch Wände?', ['2,4 GHz','5 GHz','6 GHz','Alle erreichen immer exakt dieselbe Distanz'], 'Niedrigere Frequenzen werden durch viele Hindernisse weniger stark gedämpft.'),
    truth('wlan-same', 'WLAN und OSI', 'Mehrere Access Points', 'Verschiedene Access Points können dieselbe SSID anbieten.', true, 'Ihre BSSIDs können sich unterscheiden, obwohl der WLAN-Name gleich ist.'),
    multiple('web-check', 'Filius und Webserver', 'Netzverbindung prüfen', 'Im Filius-Labor antwortet der Server auf Ping, aber die Seite lädt nicht. Was prüfst du als Nächstes?', ['Ob der Webserver läuft und die Adresse stimmt.','Ob der Bildschirm richtig eingestellt ist.','Ob der Client einen Drucker hat.','Ob die SSID des Servers kürzer ist.'], 'Ping prüft Erreichbarkeit auf IP-Ebene. Die Webanwendung ist ein separater Dienst.'),
    multiple('web-url', 'Filius und Webserver', 'URL auswählen', 'Der Labor-Webserver läuft per HTTP unter 192.168.1.20. Welche URL passt?', ['http://192.168.1.20/','ftp://192.168.1.20/','http://localhost/','http://192.168.1.21/'], 'Der Browser braucht das Protokoll und die Adresse des Servers.'),
    multiple('ip-control', 'IPERKA', 'Kontrollieren', 'Zu welchem IPERKA-Schritt gehört ein Test gegen die Anforderungen?', ['Kontrollieren','Informieren','Entscheiden','Realisieren'], 'Beim Kontrollieren wird das Resultat überprüft.'),
    multiple('ip-review', 'IPERKA', 'Auswerten', 'Wann hältst du Erfahrungen für die nächste Aufgabe fest?', ['Beim Auswerten','Beim Entscheiden','Beim Planen','Beim Informieren'], 'Die Auswertung ist die Rückschau auf Ergebnis und Vorgehen.')
  ],
  m231: [
    multiple('auth', 'Anmeldung und Rechte', 'Identität prüfen', 'Was prüft die Authentifizierung?', ['Wer du bist.','Welche Datei du bearbeiten darfst.','Wie gross dein Speicher ist.','Ob deine Daten komprimiert sind.'], 'Die Autorisierung entscheidet anschliessend über Rechte.'),
    multiple('authz', 'Anmeldung und Rechte', 'Berechtigung prüfen', 'Der Benutzer ist angemeldet. Darf er einen Admin-Bereich öffnen?', ['Nur wenn er dafür autorisiert ist.','Immer, denn er ist angemeldet.','Immer, wenn er HTTPS verwendet.','Nur wenn sein Passwort lang ist.'], 'Eine Anmeldung allein erteilt keine Administratorrechte.'),
    multiple('http-post', 'Anmeldung und Rechte', 'Formularmethode', 'Welche HTTP-Methode verwendet das Anmeldeformular in deinem Spring-Projekt zum Senden?', ['POST','GET','HEAD','OPTIONS'], 'Der Controller verarbeitet die Formulardaten beim POST.'),
    multiple('hash-compare', 'Hashing und Datenschutz', 'Hash und Verschlüsselung', 'Welches Verfahren ermöglicht das Wiederherstellen der Daten mit einem Schlüssel?', ['Verschlüsselung','Hashing','Prüfsumme','Stichprobe'], 'Verschlüsselung ist mit passendem Schlüssel umkehrbar.'),
    multiple('hash-salt', 'Hashing und Datenschutz', 'Salt verstehen', 'Warum erhält jedes Passwort einen eigenen zufälligen Salt?', ['Damit gleiche Passwörter unterschiedliche gespeicherte Hashwerte ergeben.','Damit alle Benutzer denselben Hashwert erhalten.','Damit das Passwort wieder entschlüsselt werden kann.','Damit es kürzer wird.'], 'Der Salt fliesst in die Hashberechnung ein und muss nicht geheim sein.'),
    truth('hash-change', 'Hashing und Datenschutz', 'Datei überprüfen', 'Wenn dieselbe Hashfunktion zwei verschiedene Hashwerte liefert, sind die Eingaben verschieden.', true, 'Deterministische Funktionen liefern für dieselbe Eingabe immer denselben Wert.'),
    multiple('privacy-minimal', 'Hashing und Datenschutz', 'Datensparsam arbeiten', 'Ein Kontaktformular braucht nur eine Antwortadresse und die Nachricht. Welches Feld lässt du weg?', ['Geburtsdatum','E-Mail-Adresse','Nachricht','Absenden-Schaltfläche'], 'Erhebe nur Daten, die du für den Zweck brauchst.')
  ],
  m293: [
    multiple('html-heading', 'HTML und CSS', 'Semantik wählen', 'Welches Element steht für eine Hauptüberschrift?', ['h1','div','span','small'], 'Die Überschrift beschreibt die Hierarchie des Inhalts.'),
    multiple('html-label', 'HTML und CSS', 'Formular beschriften', 'Wie verknüpfst du ein label mit einem input?', ['Das for-Attribut verweist auf die id des input.','Beide erhalten denselben Klassennamen.','Das input erhält eine größere Schrift.','Der Platzhalter hat denselben Text.'], 'Eine programmatisch zugeordnete Beschriftung hilft bei der Bedienung.'),
    multiple('css-layout', 'HTML und CSS', 'CSS-Layout wählen', 'Welcher Wert eignet sich, um Elemente in Zeilen und Spalten anzuordnen?', ['display: grid','display: none','font-weight: bold','position: fixed'], 'Grid kann Zeilen und Spalten gemeinsam steuern.'),
    multiple('css-selector', 'HTML und CSS', 'Klasse auswählen', 'Welcher Selektor wählt Elemente mit class="card"?', ['.card','#card','card','*card'], 'Ein Punkt beginnt einen Klassenselektor.'),
    multiple('next-page', 'Next.js App Router', 'Startseite finden', 'Welche Datei definiert die Startseite in deinem Projekt?', ['src/app/page.js','src/app/layout.js','public/page.js','package.json'], 'page.js definiert den Inhalt dieser Route.'),
    multiple('next-layout', 'Next.js App Router', 'Layout wiederverwenden', 'Wo legst du das gemeinsame Layout im eigenen Projekt ab?', ['src/app/layout.js','src/app/globals.css','src/app/page.js','next.config.mjs'], 'Das Layout umgibt den Seiteninhalt.'),
    truth('css-content', 'HTML und CSS', 'Struktur und Darstellung', 'HTML und CSS haben verschiedene Rollen. HTML beschreibt Struktur, CSS die Darstellung.', true, 'Eine Hauptüberschrift ist eine Strukturentscheidung; ihre Farbe ist eine Darstellungsentscheidung.')
  ],
  english: [
    multiple('en-usually', 'Present tenses', 'Habits', 'Choose the correct form: She usually ___ dinner at home.', ['cooks','is cooking','cook','cooking'], 'Use the present simple for habits.'),
    multiple('en-now', 'Present tenses', 'Actions happening now', 'Choose the correct form: Look, they ___ the onions now.', ['are chopping','chop','chops','chopping'], 'Use the present continuous for an action in progress.'),
    typed('en-gap', 'Present tenses', 'Complete the sentence', 'Fill the gap with the present continuous: I ___ (bake) a cake right now.', ['am baking','’m baking',"'m baking"], 'The present continuous uses am plus the -ing form.'),
    multiple('en-arranged', 'Future forms', 'Arrangements', 'Which sentence states a confirmed arrangement?', ['We’re meeting at six.','We meet sometimes.','We met at six.','We have met before.'], 'The present continuous can refer to an arrangement in the future.'),
    multiple('en-evidence', 'Future forms', 'Predictions', 'Which form fits a prediction based on visible evidence? Look at those clouds. It ___.', ['is going to rain','rains every day','was raining','has rained'], 'Going to works for predictions based on present evidence.'),
    multiple('en-bake', 'Vocabulary', 'Cooking verbs', 'Which verb means cooking food in an oven using dry heat?', ['bake','boil','peel','slice'], 'A cake is baked. Water or pasta is boiled.'),
    multiple('en-reliable', 'Vocabulary', 'Personality adjectives', 'Someone who consistently keeps their promises is ___.', ['reliable','impatient','careless','shy'], 'A reliable person can be trusted to do what they said.')
  ],
  abu: [
    multiple('abu-core', 'Zeitungsartikel verstehen', 'Kernaussage bestimmen', 'Was gehört in eine knappe Zusammenfassung der Kernaussage?', ['Das zentrale Anliegen des Artikels.','Die vollständige Liste aller Beispiele.','Die eigene Meinung zum Thema.','Nur der erste Satz, unverändert.'], 'Die Kernaussage fasst das Wesentliche in eigenen Worten zusammen.'),
    multiple('abu-detail', 'Zeitungsartikel verstehen', 'Beispiele einordnen', 'Welche Funktion kann eine konkrete Szene in einem Artikel haben?', ['Sie veranschaulicht eine allgemeine Aussage.','Sie ersetzt zwingend alle Quellen.','Sie beweist jede Meinung im Text.','Sie ist immer die Überschrift.'], 'Ein Beispiel hilft beim Verständnis und kann die Kernaussage stützen.'),
    multiple('abu-fact', 'Fakten und Meinungen', 'Überprüfbare Aussage erkennen', 'Welche Aussage lässt sich anhand eines Fahrplans überprüfen?', ['Der Bus fährt um 7.32 Uhr.','Der Bus ist ungemütlich.','Der Bus ist die beste Wahl.','Die Fahrt ist schrecklich langweilig.'], 'Die Uhrzeit lässt sich nachprüfen.'),
    truth('abu-opinion', 'Fakten und Meinungen', 'Wertung erkennen', '«Das Ergebnis ist enttäuschend» enthält eine Wertung.', true, 'Enttäuschend beschreibt eine Einschätzung.'),
    multiple('abu-phrase', 'Wendungen erklären', 'Bedeutung aus dem Kontext', 'Im Artikel steht «Die Idee stösst auf Widerstand». Was bedeutet das?', ['Einige Personen lehnen die Idee ab.','Die Idee funktioniert nur elektrisch.','Alle Personen stimmen ihr zu.','Die Idee wurde vollständig umgesetzt.'], 'Widerstand bezeichnet hier Ablehnung oder Gegenwehr.'),
    multiple('abu-rewrite', 'Wendungen erklären', 'In eigenen Worten schreiben', 'Welche Formulierung erklärt «Die Lage spitzt sich zu» am besten?', ['Die Situation wird zunehmend schwieriger.','Das Gebäude bekommt ein neues Dach.','Das Problem ist gelöst.','Die Lage bleibt unverändert.'], 'Die Wendung beschreibt eine wachsende Anspannung.')
  ]
};
