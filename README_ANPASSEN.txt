Chillout Lab V3.3 – Arbeitspferd mit separaten Icons
====================================================

Struktur:
- index.html
- icons/
  - chillout-kalk.svg
  - preride-portfolio.svg
  - wohnungsuebergabe.svg
  - app-slot-01.svg bis app-slot-10.svg

So fügst du später eine neue Anwendung hinzu:

1. Lege dein neues Icon in den Ordner icons/.
   Beispiel: icons/meine-neue-app.svg oder icons/meine-neue-app.png

2. Öffne index.html und suche unten im JavaScript nach CONFIG.projects.

3. Nimm einen freien Button und ändere dort:
   name:        Anzeigename der Anwendung
   description: Kurzbeschreibung
   iconUrl:     Pfad zum Icon, z. B. "icons/meine-neue-app.svg"
   liveUrl:     Link zur fertigen GitHub-Pages-Seite
   buttonLabel: meist "Anwendung öffnen"
   placeholder: false

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

Wichtig:
Die App-Auswahl öffnet bewusst nur die fertigen Seiten, nicht die Programmierung.
Wenn liveUrl leer ist, bleibt der Button sichtbar, aber deaktiviert.
