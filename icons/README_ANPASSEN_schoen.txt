🌙 CHILLOUT LAB V3.3
Arbeitspferd-Version mit separaten Icons
============================================================

Diese Version ist deine persönliche App-Auswahlseite für
fertige GitHub-Pages-Anwendungen.

Sie öffnet bewusst nicht die Programmierung, sondern die
veröffentlichten Seiten, also deine fertigen Anwendungen.


📁 ORDNERSTRUKTUR
------------------------------------------------------------

chillout_lab_v3_3_separate_icons/
├── index.html
└── icons/
    ├── chillout-kalk.svg
    ├── preride-portfolio.svg
    ├── wohnungsuebergabe.svg
    ├── app-slot-01.svg
    ├── app-slot-02.svg
    ├── app-slot-03.svg
    ├── app-slot-04.svg
    ├── app-slot-05.svg
    ├── app-slot-06.svg
    ├── app-slot-07.svg
    ├── app-slot-08.svg
    ├── app-slot-09.svg
    └── app-slot-10.svg


🧭 WAS DIE SEITE MACHT
------------------------------------------------------------

Die index.html zeigt deine Anwendungen als große Auswahl-
Buttons an. Jeder Button kann später mit eigenem Namen,
eigener Beschreibung, eigenem Icon und einem Link zur fertigen
GitHub-Pages-Seite belegt werden.

index.html        = Hauptseite / Startmenü
icons/            = Speicherort für deine Bildsymbole
CONFIG.projects   = Liste deiner Anwendungen
liveUrl           = Link zur fertigen GitHub-Pages-Seite
iconUrl           = Pfad zum passenden Icon


➕ NEUE ANWENDUNG HINZUFÜGEN
------------------------------------------------------------

1. Icon ablegen

Lege dein neues Symbol in den Ordner icons/.

Beispiele:

icons/meine-neue-app.svg
icons/meine-neue-app.png

SVG ist ideal für klare, scharfe Icons.
PNG funktioniert ebenfalls, wenn du lieber fertige Bilddateien
verwenden möchtest.


2. index.html öffnen

Öffne die Datei index.html und suche im unteren JavaScript-
Bereich nach:

CONFIG.projects

Dort findest du die vorhandenen Anwendungen und die freien
Platzhalter-Buttons.


3. Freien Button ändern

Beispiel:

{
  name: "Meine neue App",
  icon: "🚀",
  iconUrl: "icons/meine-neue-app.svg",
  description: "Kurze Beschreibung meiner Anwendung.",
  liveUrl: "https://phusch.github.io/meine-neue-app/",
  buttonLabel: "Anwendung öffnen",
  placeholder: false
}


🧩 BEDEUTUNG DER FELDER
------------------------------------------------------------

name          = Name, der auf der Karte angezeigt wird
icon          = Emoji-Fallback, falls kein Bildsymbol lädt
iconUrl       = Pfad zur SVG- oder PNG-Datei im Ordner icons/
description   = kurzer Erklärungstext unter dem Namen
liveUrl       = Adresse der fertigen Anwendung
buttonLabel   = Text auf dem Button
placeholder   = false macht daraus eine echte Anwendung


✅ WICHTIG FÜR DIE NUTZUNG
------------------------------------------------------------

Die Buttons sollen nur die fertigen Anwendungen öffnen.

Richtig:
https://phusch.github.io/meine-neue-app/

Nicht gemeint:
https://github.com/phusch/meine-neue-app


🟡 PLATZHALTER-BUTTONS
------------------------------------------------------------

Die zehn freien Buttons sind vorbereitet für spätere Anwendungen.

Solange liveUrl leer bleibt, wird der Button angezeigt, aber nicht
als echte Anwendung geöffnet.

Sobald du eine gültige GitHub-Pages-Adresse einträgst und
placeholder auf false setzt, ist der Button aktiv.


🖼️ ICON-TIPPS
------------------------------------------------------------

Empfohlene Dateiformate:

.svg   = beste Wahl für Icons, sehr scharf und klein
.png   = gut für fertige Bildsymbole oder Logos

Empfohlene PNG-Größe:
512 × 512 px

Dateinamen am besten klein schreiben und ohne Leerzeichen:

icons/tourbook.svg
icons/roadbook-app.png
icons/werkstatt-planer.svg


🚀 KURZER ARBEITSABLAUF
------------------------------------------------------------

1. Neues Icon in den Ordner icons/ legen
2. index.html öffnen
3. Freien Button in CONFIG.projects suchen
4. Name, Beschreibung, iconUrl und liveUrl eintragen
5. placeholder auf false setzen
6. index.html speichern
7. Seite neu laden


🛠️ MERKSATZ
------------------------------------------------------------

Neue App = neuer Eintrag in CONFIG.projects
          + passendes Icon im Ordner icons/.

Mehr musst du normalerweise nicht ändern.
