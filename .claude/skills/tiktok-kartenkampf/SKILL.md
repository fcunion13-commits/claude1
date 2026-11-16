---
name: tiktok-kartenkampf
description: Erstellt ein deutsches Mitmach-TikTok (9:16) im Kartenkampf-Format – Deutschlandkarte aufgeteilt in Vereinsgebiete, Kommentare = Truppen, Folgen zählt doppelt, Gebiete werden erobert, am Ende ein Sieger – komplett im Code mit HyperFrames (HTML/SVG + GSAP → MP4) und deutschem Piper-Voiceover. Das ist das AKTUELLE Hauptformat des Kanals; für neue Videos, Runden-Updates oder Spieltage verwenden.
---

# Kartenkampf-Video (deutsch, HyperFrames)

Das ist das **aktuelle Hauptformat** des Kanals. Stil B (Datensimulation) läuft schlechter und kommt nur noch auf ausdrücklichen Wunsch.
Das erste fertige Beispiel liegt in `videos/02-kickreich/`. Kopiere es als Ausgangspunkt und lies es zuerst.

Ziel des Formats sind **Kommentare, Markierungen und Follows**. Jedes Video endet deshalb mit einem klaren Aufruf.
Name des Spiels: **Kickreich** (Handle-Platzhalter `@kickreich`, auswechselbar in index.html und toppill).

## Eigenständigkeit (wichtig)
- Das Format mit Kartenkrieg und Abstimmung per Kommentar ist ein Genre, das wir nutzen dürfen. Name, Texte, Grafiken und Spielmechanik-Details der Vorlage („Derbyland“) übernehmen wir **nicht**.
- **Keine echten Vereinswappen.** Jeder Verein bekommt ein eigenes rundes Badge in seinen Vereinsfarben: weißer Rand, Fläche in Farbe 1, Ring in Farbe 2. Vereinsnamen als Text sind erlaubt.
- Nutzernamen in Kommentar-Karten sind ausgedacht und neutral.

## Aufbau (Ankündigungsvideo, ~30 s)
| Segment | Text (Beispiel) | Visual |
|---|---|---|
| hook | „Was wäre, wenn jeder Fußballverein sein eigenes Land hätte?“ | graue Kreiskarte, Badges ploppen nacheinander auf |
| map | „67 Vereine. Jeder regiert seine Region. Willkommen im Kickreich!“ | Zähler im Titel, Gebiete färben sich von Nord nach Süd, Konfetti |
| army | „Ab jetzt wird erobert. Und die Armee deines Vereins bist du!“ | Pin „DEIN VEREIN?“ fällt auf die Karte |
| vote / follow | „Jeder Kommentar schickt einen Soldaten … Wenn du folgst, zwei!“ | Karte gedimmt, Kommentar-Karten mit „+1 ⚔“, eine Karte mit „FOLGT“ und „+2 ⚔“ |
| round / win | „Jede Runde zieht der Verein mit den meisten Truppen …“ | Pill „BEISPIEL“, Ringe um die Angreifer, Pfeile, Gebiet übernimmt die Farbe |
| lose | „Wer keine Truppen hat, verschwindet von der Karte.“ | Zoom, Gebiet wird grau, dann geschluckt |
| end | „Bis am Ende nur noch einer übrig ist. Wird es deiner?“ | Karte wird gold, Pokal mit „?“ |
| cta | „Schreib deinen Verein in die Kommentare, markier deine Freunde und folg …“ | Kommentar-Karte, dann @-Markierungen, dann Profil-Karte „Folgen → Gefolgt ✓“ |

Für Folgevideos (Runde 1, 2, …): aktuelle Karte zeigen, die Top-Kommentare als Karten, dann die Angriffe der Runde mit Ergebnis. Ein Cliffhanger („Morgen greift … an“) und wieder der Aufruf.
Den Spielstand dafür im Projekt als JSON führen (wem gehört welches Gebiet) und über `karte.py` plus Übernahme-Pfade darstellen.

## Look (`assets/kartenkampf.css`)
- Hintergrund: dunkles Stadiongrün mit Verlauf, leichten vertikalen Streifen und Vignette.
- Oben eine weiße Pill: „KICKREICH · 1 KOMMENTAR = 1 SOLDAT“.
- Titel: zwei Zeilen, Inter 900, 82 px, Großbuchstaben; Zeile 1 weiß, Zeile 2 gelb `#ffd23f`. Bei jedem neuen Gedanken wechselt der Titel mit einem Pop.
- Untertitel: bis 4 Wörter, weiß, Karaoke-Effekt (das gerade gesprochene Wort wird gelb), bei y≈1565.
- Karte: Gebiete in kräftigen Pastellfarben mit weißen Grenzen. Benachbarte Gebiete bekommen nie dieselbe Farbe.

## Ablauf
Einmalig pro Sitzung: die Einrichtung aus dem Skill `tiktok-stil-b` (HyperFrames, Piper mit Thorsten, faster-whisper) plus `pip install shapely`.

Pro Video:
1. `videos/NN-name/` anlegen. Aus `videos/02-kickreich/` übernehmen: `index.html`, `package.json`, `hyperframes.json`. Dazu `assets/` aus diesem Skill (gsap.min.js, kartenkampf.css, avatar.png).
2. Karte: `python3 .claude/skills/tiktok-kartenkampf/scripts/karte.py videos/NN-name --box 95,350,890,1150` → `karte.js`.
   Vereinsliste in `data/vereine.json`: Name, Kürzel, Kurzname, Länge, Breite, Farbe 1, Farbe 2. Die Reihenfolge ist zugleich die Priorität, wenn zwei Vereine aus derselben Stadt kommen.
   Im HTML Vereine per Kurzname holen: `T("BVB")`.
3. `script.json` schreiben. Stimme wie in Stil B: Thorsten, `length_scale 0.82`, `noise_scale 0.85`, `noise_w 1.0`, `pitch 1.5`, Ausrufezeichen für Energie. Zahlen als Wörter.
4. `python3 .claude/skills/tiktok-kartenkampf/scripts/voice.py videos/NN-name` erzeugt Stimme und Timings (inkl. Wortzeiten für Karaoke) und setzt `data-duration`.
5. Szenen in index.html an Wörter koppeln, mit `capAt("segment", "wortanfang")`. Titel über `title(t, zeile1, zeile2)`.
   - Zoom: Den Ursprung so berechnen, dass das Ziel in der Mitte landet: `O = (s·Z − C)/(s − 1)` mit C = (540, 900). Zurück mit demselben `svgOrigin`.
   - Bei `fromTo` mitten in der Timeline immer `immediateRender: false` setzen.
6. `npx hyperframes lint .` muss 0 Fehler zeigen. Dann `npx hyperframes snapshot --at …` und das Kontaktblatt ansehen.
7. Rendern mit `npx hyperframes render -q delivery -o name.mp4`, danach committen und pushen.
