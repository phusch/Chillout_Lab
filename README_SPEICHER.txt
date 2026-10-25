CHILLOUT LAB V3.8.3 TEST – KLEINE ICONS + HUSCHEL SPEICHER
==========================================================
Ausgangsbasis: V3.8.2 Test. Nur Icon-Verarbeitung, optimierte apps.json,
ein zusätzlicher Icon-Optimierungsbutton und Hinweise wurden geändert.
Keine Änderung an SUPABASE_EdgeFunction_index.ts nötig (V3.8.2 bleibt gültig).

NEU
---
1. Bestehende 15 eingebettete PNG-Icons in apps.json zu 180-Pixel-WebP
   konvertiert, Qualität 80 %. Ein kurzes eingebettetes SVG bleibt erhalten.
2. Neue hochgeladene Icons werden automatisch auf höchstens 180 Pixel
   begrenzt und als WebP gespeichert; die Bilddaten bleiben in apps.json.
   Kleine SVG-Dateien (bis ca. 12 KB als Data-URI) bleiben als SVG erhalten.
3. "GitHub-Dateien erstellen" optimiert zuvor zusätzlich vorhandene
   eingebettete Icons, auch wenn ein alter Datenstand geladen war.
4. Unter "Speichern & Backup" gibt es "Vorhandene Icons optimieren" für
   importierte Backups, alte lokale Entwürfe oder private GitHub-Stände.
   Es werden NUR die aktuell geöffneten App-Daten geändert. GitHub selbst
   wird erst nach gezieltem Klick auf "GitHub Speichern" geschrieben.
5. Wenn WebP im verwendeten Browser nicht unterstützt wird, wird die
   Konvertierung abgebrochen statt unbemerkt große PNG-Dateien zu erzeugen.
6. Die Bildkompression ändert die Prüfsumme der veröffentlichten apps.json.
   Deshalb bleibt der Konfliktschutz von V3.8.2 aktiv.

WICHTIG BEIM ERSTEN AUFRUF
-------------------------
Eine ältere, im Browser gespeicherte Chillout-Lab-Bearbeitung kann weiterhin
Vorrang vor der optimierten apps.json haben. Deshalb unter "Speichern & Backup"
den Quellenhinweis prüfen. Ein alter privater GitHub-Stand wird bei abweichender
Quelle weiterhin NICHT automatisch übernommen.

EMPFOHLENE REIHENFOLGE ZUM UMSTIEG
---------------------------------
1. Die alte V3.8.2-ZIP als Rückfallkopie behalten.
2. V3.8.3-Dateien in ein separates GitHub-Pages-TEST-Repository laden.
   Die optimierte apps.json aus dieser ZIP gehört zur neuen Testversion.
3. Öffnen, die App-Karten/Icons prüfen. Speicher-Symbol öffnen.
4. Falls ein alter Browserentwurf geladen ist und beibehalten werden soll:
   "Vorhandene Icons optimieren" wählen und die neuen App-Daten danach
   zuerst über "GitHub-Dateien erstellen" als apps.json exportieren.
   Die exportierte apps.json bewusst ins richtige App-Repository laden.
5. Wenn stattdessen die veröffentlichte optimierte apps.json maßgeblich ist:
   Im Speichermodul "GitHub Laden" verwenden und bei Herkunftswarnung
   ausdrücklich "Aktuelle apps.json übernehmen" wählen. Dadurch werden
   etwaige lokale Änderungen ersetzt; vorher bei Bedarf JSON-Backup erstellen.
6. Danach "GitHub Speichern" für ein neues privates Backup wählen.
   Achtung: Das ist ein eigenständiger Schritt! Das Hochladen der öffentlichen
   apps.json synchronisiert die private data.json nicht automatisch.
7. Bei einem späteren Import eines großen alten Backups: bewusst laden,
   dann "Vorhandene Icons optimieren" und erneut gezielt speichern.

UNVERÄNDERT
-----------
- 26 Projekte und 7 Kategorien mit allen Namen, URLs, IDs und Reihenfolgen.
- Bestehende Hauptnavigation, App-Karten, Home-Screen-Icon-Export (PNG 180px),
  Speicherbutton/Separate Speicherseite, SHA-Konfliktschutz aus V3.8.2.
- Externe iconUrl-Verweise, sämtliche Dateien unter icons/.
- Supabase Auth, GitHub Token in Supabase, private GitHub-Pfade,
  IndexedDB, JSON-Backup, Speicherversionierung und Schreibschutz.

WICHTIG: Ein realer Test über das produktive Supabase/GitHub-System wurde
für V3.8.3 noch nicht durchgeführt. Die alte App unverändert lassen,
bis die neue Version getestet und freigegeben ist.


===================================================================
ANHANG: BISHERIGE V3.8.2 ANLEITUNG (UNVERÄNDERT ZUR REFERENZ)
===================================================================
CHILLOUT LAB V3.8.2 TEST – HUSCHEL SPEICHER MIT VERSIONSSCHUTZ
===========================================================
Ausgangsbasis: die im Chat erstellte Chillout-Lab-V3.8.1-Testversion,
ursprünglich basierend auf der vom Nutzer hochgeladenen Chillout_Lab.zip.
Die Version ist ein separater TESTSTAND. Bestehende GitHub-Repositories
wurden nicht verändert. Die alte App nicht vor dem Test überschreiben.

NEU IN V3.8.2
-------------
Die öffentliche apps.json im App-Repository und der private Speicherstand
in phusch/huschel-app-data/chillout-lab/data.json sind zwei eigenständige
Quellen. Ihre Herkunft wird nun mittels einer SHA-256-Prüfsumme der
veröffentlichten apps.json abgeglichen.

1. Bei GitHub Laden prüft das Modul die aktuelle veröffentlichte apps.json.
   Bei geänderter Dateiversion oder unbekannter Herkunft des privaten
   Speicherstands wird NICHT stillschweigend der private Stand übernommen.
2. Stattdessen erscheint im Speichermodul eine deutlich sichtbare Warnung:
   - Aktuelle apps.json übernehmen (und danach bei Bedarf privat speichern)
   - Privaten Speicherstand trotzdem laden (nur mit expliziter Bestätigung)
   - Abbrechen – nichts ändern
3. GitHub Speichern prüft die Herkunft und hält im Konfliktfall ebenfalls an.
4. Auch für lokale Gerätekopien und JSON-Backups wird – sofern bekannt – die
   apps.json-Herkunft gesichert und bei der Wiederherstellung geprüft.
5. Eine bewusst trotz Konflikt genutzte ältere Version wird NICHT fälschlich
   als mit der neuen apps.json synchronisiert markiert (gelbe Ampel).
6. Alte private Speicherstände ohne Versionsmetadaten bleiben lesbar,
   verlangen bei inhaltlicher Abweichung aber eine ausdrückliche Entscheidung.
7. Server prüft vor dem Speichern weiterhin GitHubs SHA-Dateiversion,
   damit parallele Änderungen keine neueren Daten still überschreiben.

WICHTIG: Eine geänderte SHA-256-Prüfsumme beweist lediglich eine inhaltliche
Änderung, nicht welches Dokument chronologisch neuer ist. Deshalb trifft
niemals das System stillschweigend die Entscheidung für den Nutzer.

INBETRIEBNAHME – REIHENFOLGE
----------------------------
1. Supabase-Dashboard > Edge Functions > github-app-storage > Code.
   Den dortigen index.ts durch SUPABASE_EdgeFunction_index.ts aus diesem Paket
   ersetzen und Deploy updates ausführen.
   - Kein neues Token erzeugen; GITHUB_TOKEN bleibt in Supabase Secrets.
   - Benutzer-ID und Repository-Allowlist bleiben dieselben.
   - Neue Action "capabilities" und das Metadatenfeld "source" werden benötigt.
   - SHA-Konfliktschutz und Beschränkung auf freigeschaltete Apps bleiben aktiv.
   - Ohne das aktualisierte Backend verweigert V3.8.2 vorsorglich private
     Speicher- und Ladeaktionen, statt unkontrolliert zu arbeiten.
2. Die App-Dateien aus diesem Verzeichnis in ein separates Test-Repository
   oder den vorgesehenen Test-Pages-Bereich stellen (nicht die aktive App
   ungetestet ersetzen). GitHub Pages kann Aktualisierungen verzögert liefern.
3. App starten > Speicher-Symbol > anmelden > GitHub Laden.
4. Bei Warnung unterscheiden: "apps.json übernehmen" hält die neue
   veröffentlichte Datei (einschließlich verkleinerter Bilder) in der App.
   Anschließend GitHub Speichern wählen, um auch den privaten Stand zu
   aktualisieren.
5. Bei Bedarf zuerst JSON-Backup erstellen, bevor Daten zurückgespielt
   oder durch die aktuelle apps.json ersetzt werden.

UNVERÄNDERT
-----------
- Hauptseite, 26 App-Karten, Icons, Links, Kategorien, Bearbeitungsdialoge.
- Bestehende apps.json-Datei und öffentliche GitHub-Datei-Exportfunktion.
- Bisherige Behandlung des lokalen Entwurfs und Hinweis NICHT VERÖFFENTLICHT.
- Speichermodul als eigene zusätzliche Ansicht über Symbolbutton.
- Bestehende GitHub-Token-Verwahrung ausschließlich in Supabase Secrets.
- Lokale Kopien per IndexedDB sowie JSON-Backup.

DATEIEN IM PAKET
----------------
index.html                    Brücke ergänzt um Konfliktansicht
huschel-speicher.js           Versionsprüfung, Auswahl, Speicherlogik
huschel-speicher.css          Stil der zusätzlichen Konfliktansicht
SUPABASE_EdgeFunction_index.ts  Neue Serverversion zum manuellen Deploy
apps.json und icons/*         Originale unveränderte App-Daten und Symbole
README_SPEICHER.txt           Diese Anleitung

TESTSTATUS
----------
JavaScript-Syntax und Browserabläufe mit simuliertem Supabase/GitHub geprüft:
Cloud Speichern/Laden, Hash-Konflikt nach Änderung von apps.json,
Entscheidungsdialoge, Schutz vor stiller Übernahme, SHA-Basis in Metadaten,
JSON-Backup-Warnung, 375px-Ansicht, Navigation und bestehende 26 Karten.
Ein echter Test mit aktualisierter Supabase Edge Function und privatem
GitHub-Repository muss nach dem Deploy noch erfolgen.
