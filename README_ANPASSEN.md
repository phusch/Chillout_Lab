# 🌙 Chillout Lab V3.3  
## Arbeitspferd-Version mit separaten Icons

Diese Version ist deine persönliche **App-Auswahlseite** für fertige GitHub-Pages-Anwendungen.  
Sie dient nicht zum Öffnen der Programmierung, sondern als übersichtliches Startmenü für deine veröffentlichten Seiten.

---

## 📁 Ordnerstruktur

```text
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
```

---

## 🧭 Was diese Seite macht

Die `index.html` zeigt deine Anwendungen als große Auswahl-Buttons an.  
Jeder Button kann später mit einem eigenen Namen, einer Beschreibung, einem Icon und einem Link zur fertigen GitHub-Pages-Seite belegt werden.

| Bereich | Aufgabe |
|---|---|
| `index.html` | Hauptseite / Startmenü |
| `icons/` | Speicherort für deine Bildsymbole |
| `CONFIG.projects` | Liste deiner Anwendungen |
| `liveUrl` | Link zur fertigen GitHub-Pages-Seite |
| `iconUrl` | Pfad zum passenden Icon |

---

## ➕ Neue Anwendung hinzufügen

### 1. Icon ablegen

Lege dein neues Symbol in den Ordner `icons/`.

Beispiele:

```text
icons/meine-neue-app.svg
icons/meine-neue-app.png
```

SVG ist ideal für klare, scharfe Icons.  
PNG funktioniert ebenfalls, wenn du lieber fertige Bilddateien verwenden möchtest.

---

### 2. `index.html` öffnen

Öffne die Datei `index.html` und suche im unteren JavaScript-Bereich nach:

```js
CONFIG.projects
```

Dort findest du die vorhandenen Anwendungen und die freien Platzhalter-Buttons.

---

### 3. Freien Button ändern

Nimm einen freien Button und ändere die Werte:

```js
{
  name: "Meine neue App",
  icon: "🚀",
  iconUrl: "icons/meine-neue-app.svg",
  description: "Kurze Beschreibung meiner Anwendung.",
  liveUrl: "https://phusch.github.io/meine-neue-app/",
  buttonLabel: "Anwendung öffnen",
  placeholder: false
}
```

---

## 🧩 Bedeutung der Felder

| Feld | Bedeutung |
|---|---|
| `name` | Name, der auf der Karte angezeigt wird |
| `icon` | Emoji-Fallback, falls kein Bildsymbol geladen wird |
| `iconUrl` | Pfad zur SVG- oder PNG-Datei im Ordner `icons/` |
| `description` | Kurzer Erklärungstext unter dem Namen |
| `liveUrl` | Adresse der fertigen Anwendung |
| `buttonLabel` | Text auf dem Button |
| `placeholder` | `false` macht daraus eine echte Anwendung |

---

## ✅ Wichtig für die Nutzung

Die Buttons sollen bewusst nur die **fertigen Anwendungen** öffnen.  
Also zum Beispiel:

```text
https://phusch.github.io/meine-neue-app/
```

Nicht gemeint ist der Repository-Link wie:

```text
https://github.com/phusch/meine-neue-app
```

---

## 🟡 Platzhalter-Buttons

Die zehn freien Buttons sind vorbereitet für spätere Anwendungen.

Solange `liveUrl` leer bleibt, wird der Button angezeigt, aber nicht als echte Anwendung geöffnet.  
Sobald du eine gültige GitHub-Pages-Adresse einträgst und `placeholder` auf `false` setzt, ist der Button aktiv.

---

## 🖼️ Icon-Tipps

Empfohlene Dateiformate:

| Format | Empfehlung |
|---|---|
| `.svg` | Beste Wahl für Icons, sehr scharf und klein |
| `.png` | Gut für fertige Bildsymbole oder Logos |

Empfohlene Größe für PNG-Dateien:

```text
512 × 512 px
```

Dateinamen am besten klein schreiben und ohne Leerzeichen verwenden:

```text
icons/tourbook.svg
icons/roadbook-app.png
icons/werkstatt-planer.svg
```

---

## 🚀 Kurzer Arbeitsablauf

```text
1. Neues Icon in den Ordner icons/ legen
2. index.html öffnen
3. Freien Button in CONFIG.projects suchen
4. Name, Beschreibung, iconUrl und liveUrl eintragen
5. placeholder auf false setzen
6. index.html speichern
7. Seite neu laden
```

---

## 🛠️ Merksatz

**Neue App = neuer Eintrag in `CONFIG.projects` + passendes Icon im Ordner `icons/`.**

Mehr musst du normalerweise nicht ändern.
