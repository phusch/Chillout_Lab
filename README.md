# 🌙 Chillout Lab

**Version V3.7.1**  
Zentrale Start- und Verwaltungsplattform für die persönlichen GitHub-Pages-Apps.

## Zweck

Das Chillout Lab bündelt die vorhandenen Apps in einer gemeinsamen Startoberfläche. Apps können Kategorien zugeordnet, in ihrer Reihenfolge verändert und über die Oberfläche ergänzt oder bearbeitet werden. Der veröffentlichte, geräteübergreifende Stand liegt in `apps.json` im GitHub-Repository.

## Dateien

```text
Chillout_Lab_V3.7.1_Clean/
├── index.html          # komplette Web-App
├── apps.json           # veröffentlichter App-/Kategorie-Datenbestand
├── manifest.json       # PWA-/Home-Screen-Konfiguration des Chillout Labs
├── README.md           # diese Dokumentation
├── .gitattributes      # Git-Zeilenenden/Normalisierung
├── .gitignore          # verhindert macOS-/Workspace-Altlasten
└── icons/
    ├── chillout-lab-icon.svg
    ├── chillout-lab-32.png
    ├── chillout-lab-180.png
    ├── chillout-lab-192.png
    ├── chillout-lab-512.png
    └── ... verwendete App-Icons
```

## Datenmodell und Speicherung

### GitHub = veröffentlichter Master

Beim Start lädt das Chillout Lab die Datei `apps.json`. Dieser Stand ist auf allen Geräten identisch, sobald die aktuelle Datei im GitHub-Repository liegt.

### Lokale Bearbeitung

Änderungen, die über die Oberfläche vorgenommen werden, werden zunächst lokal im Browser gespeichert. Dazu gehören zum Beispiel:

- neue Apps
- geänderte App-Namen oder Links
- Kategorie-Zuordnungen
- App-Reihenfolge
- neue oder umbenannte Kategorien

Solange lokale Änderungen noch nicht veröffentlicht wurden, zeigt das Chillout Lab den entsprechenden Statushinweis an.

### Änderungen veröffentlichen

1. Änderungen im Chillout Lab auf dem Mac durchführen.
2. **GitHub-Dateien erstellen** wählen.
3. Die erzeugte `apps.json` herunterladen.
4. Im GitHub-Repository die vorhandene `apps.json` durch die neue Datei ersetzen.
5. Nach Veröffentlichung laden Mac, iPad und iPhone denselben Stand.

Ein separater Speichern-Button ist nicht erforderlich: Die Bearbeitung wird lokal direkt gespeichert. Die geräteübergreifende Veröffentlichung erfolgt über `apps.json`.

## Apps verwalten

### App hinzufügen

Über **+ App hinzufügen** können unter anderem folgende Angaben gepflegt werden:

- Name
- Beschreibung
- App-/GitHub-Pages-Link
- optionaler README-Link
- Kategorie
- Emoji
- Icon-Pfad/URL oder eigenes Icon

### App bearbeiten

Über das Menü **⋯** einer App kann der Eintrag bearbeitet oder gelöscht werden.

### Kategorie ändern

**⋯ → App bearbeiten → Kategorie → Speichern**

Beim Wechsel in eine andere Kategorie wird die App dort einsortiert.

### Reihenfolge ändern

Im Bearbeitungsdialog stehen **← Nach vorne** und **Nach hinten →** zur Verfügung. Die neue Reihenfolge wird lokal gespeichert und beim nächsten Export in `apps.json` übernommen.

## Kategorien verwalten

Über **Kategorien verwalten** können Kategorien angelegt, umbenannt, sortiert und – sofern sinnvoll – gelöscht werden. Die Kategoriezuordnung der Apps wird in `apps.json` über `categoryId` gespeichert.

## Icons im Chillout Lab

App-Icons liegen normalerweise im Ordner `icons/`. Empfehlenswert ist:

- PNG
- quadratisch
- 512 × 512 Pixel
- einfacher Dateiname ohne Leerzeichen oder Sonderzeichen

Beispiel:

```json
"iconUrl": "icons/toernplaner.png"
```

Die in der Oberfläche angezeigten App-Icons sind unabhängig vom Home-Screen-Icon der jeweiligen Ziel-App.

## Home-Screen-Paket erzeugen

V3.7.1 enthält einen Generator für Home-Screen-/PWA-Icon-Pakete. Aus einem quadratischen Master-Icon mit mindestens 512 × 512 Pixeln werden erzeugt:

- `apple-touch-icon.png` – 180 × 180
- `icon-192.png` – 192 × 192
- `icon-512.png` – 512 × 512
- `favicon-32.png` – 32 × 32
- `manifest.json`
- `EINBAU-HINWEISE.txt`

Diese Dateien gehören in das Repository der jeweiligen Ziel-App. Die dortige `index.html` muss das Manifest und die Icons im `<head>` referenzieren.

## Chillout-Lab-Home-Screen-Icon

Das Chillout Lab selbst verwendet:

- `icons/chillout-lab-icon.svg` – Browser-Favicon
- `icons/chillout-lab-32.png` – alternatives Favicon
- `icons/chillout-lab-180.png` – Apple Home Screen
- `icons/chillout-lab-192.png` – Manifest/PWA
- `icons/chillout-lab-512.png` – Manifest/PWA
- `manifest.json` – PWA-Konfiguration

Auf iPhone/iPad kann das Lab in Safari über **Teilen → Zum Home-Bildschirm** abgelegt werden.

## Aktueller App-Bestand

Die aktuelle `apps.json` enthält fünf Kategorien:

- Allgemein
- Boot & Törn
- Reise
- Motorrad & Navigation
- Tools

Die App-Einträge werden ausschließlich aus `apps.json` geladen; die in `index.html` enthaltenen Default-Daten dienen als Rückfallbestand, falls `apps.json` nicht geladen werden kann.

## Hinweis zum Törnplaner-Icon

Im aktuellen Datenstand verwenden **Chillout Kalk** und **Törnplaner** noch beide:

```text
icons/chillout-kalk2.svg
```

Das neu erstellte Piraten-Törnplaner-Icon ist in diesem Repository noch nicht eingetragen. Für die Umstellung sollte ein eigenes `icons/toernplaner.png` verwendet und sowohl `apps.json` als auch der Default-Eintrag in `index.html` entsprechend angepasst werden.

## Bereinigung dieser Version

Aus dem hochgeladenen Repository wurden ausschließlich nicht benötigte Entwicklungs-/Altdateien entfernt:

- lokaler `.git`-Ordner
- `__MACOSX`-Metadaten
- `.DS_Store`
- alte VS-Code-Workspace-Dateien
- `README_ANPASSEN.md`
- `README_ANPASSEN.txt`
- `README_ANPASSEN_schoen.txt`
- nicht verwendetes `site.webmanifest`
- nicht verwendetes altes `favicon.svg` im Hauptverzeichnis

Die verwendeten App-Icons, `apps.json`, `manifest.json` und die bestehende Anwendungslogik wurden nicht verändert.

---

**Chillout Lab V3.7.1**  
Persönliche Startplattform für die eigenen Apps.
