---
name: tiktok-stil-b
description: Erstellt ein deutsches TikTok-Erklärvideo (9:16) im „Stil B“ – dunkle Datensimulation mit zwei farbigen Seiten, Zähler-HUD, Pills, Endstand-Panel und 1–3-Wort-Untertiteln – komplett im Code mit HyperFrames (HTML + GSAP → MP4) und deutschem Piper-Voiceover. Verwenden, wenn der Nutzer ein neues Video, eine neue Folge oder ein Thema für seinen TikTok-Kanal möchte.
---

# TikTok-Video im Stil B (deutsch, HyperFrames)

> **Hinweis:** Das aktuelle Hauptformat ist jetzt `tiktok-kartenkampf`. Stil B nur noch verwenden, wenn der Nutzer es ausdrücklich möchte.

Alle Videos sind **immer auf Deutsch**, Hochformat 1080×1920, 30 fps, und werden **komplett im Code** gebaut.
Vorlage war „Rennen vs. Gehen im Regen“. Das erste fertige Beispiel liegt in `videos/01-elfmeter/`.
Kopiere es als Ausgangspunkt und lies es, bevor du ein neues Video baust.

## 1. Inhalt: die Formel (immer einhalten)

Länge 30–60 s (Standard: ~30 s ≈ 75–90 Wörter). Zwei Seiten A gegen B, die gegeneinander „simuliert“ werden.

| # | Segment | Inhalt | Visual |
|---|---|---|---|
| 1 | `hook` (0–3 s) | Frage: „A oder B? Womit … ?“ | Titel `A vs B` in Rot/Türkis + gelbe Frage |
| 2 | `setup` | Feste Regeln in Stakkato: „Zehn Schüsse. Gleicher Torwart.“ | gelbe/weiße Pills oben, Bahnen leuchten auf |
| 3 | `trap` | Falsche Erwartung: „Klar, A ist besser, oder?“ | rote Pill „BESSER?“ |
| 4 | Simulation | Erst ein Durchgang langsam, dann Schnelldurchlauf | HUD: Zähler oben, Karten mit Wert + Status-Pill |
| 5 | Wendung | „Aber jetzt kommt das Merkwürdige …“ / „Noch nicht.“ | großes gelbes Wort, z. B. „NOCH NICHT.“ |
| 6 | `result` | Endstand mit konkreten Zahlen | Dimmen + Panel „ENDSTAND“, Gewinner leuchtet |
| 7 | `why` | „Aber warum?“ – echter Mechanismus, echte Zahl mit Quelle | gelber Abschnittstitel + Balken |
| 8 | Pointe | ein knackiger Schlusssatz | großes gelbes Wort oder Panel „UNTERM STRICH“ |

Sprache: begeistert und energisch, viele Ausrufezeichen („Zehn Schüsse! Gleicher Torwart!“). Präsens, „du“, Sätze mit 3–10 Wörtern, Zahlen **als Wörter** schreiben (Piper liest sie dann richtig).
Fakten müssen stimmen. Simulierte Zahlen als Simulation kennzeichnen, echte Zahlen mit Quelle (kleine graue Zeile).
Keine fremden Handles oder Wasserzeichen übernehmen. Das TikTok-Outro mit der Suchleiste fügt TikTok beim Download selbst an, deshalb wird es **nicht** gebaut.

## 2. Look (steht in `assets/stil-b.css`)

- Hintergrund: Navy `#0d1520` mit Verlauf, feinen Punkten und einer Skyline-Silhouette.
- Seite A ist immer **Korallenrot `--a #f2665a`**, Seite B immer **Türkis `--b #3cc6b8`**, Highlights sind **Gelb `--y #f6b440`**.
- Schrift: Inter (900 für Titel und Pills, 700 für Untertitel).
- Figuren: weißer runder Kopf, Körper in der Farbe der Seite. Neutrale Figuren sind grau `#8c99ab`.
- Bahnen: dünner Rahmen, farbige Bodenlinie, Label oben links in der Farbe der Seite.
- HUD: großer Zähler oben („SCHUSS 3 / 10“, „0:24“), darunter zwei Karten (Name, Label, große Zahl, Status-Pill).
- Pills: abgerundet, Großbuchstaben, fett.
- Untertitel: 1–3 Wörter, weiß, unten mittig bei y≈1480. Schlüsselwörter werden über `colors` in script.json eingefärbt (`a`, `b` oder `y`).
- Alle 1,5–3 s muss sich etwas bewegen. Das Bild zeigt immer genau das, was gerade gesagt wird.

## 3. Ablauf

Einmalig pro Sitzung (die Container sind flüchtig):
```bash
mkdir -p /tmp/hf && cd /tmp/hf && npm init -y >/dev/null && npm i hyperframes@0.9.54
npx hyperframes telemetry disable
pip install -q piper-tts faster-whisper
mkdir -p voices && cd voices && for f in de_DE-thorsten-high.onnx de_DE-thorsten-high.onnx.json; do
  curl -sSL -o $f https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/high/$f; done
export PATH=/tmp/hf/node_modules/.bin:$PATH
```
(edge-tts funktioniert hier nicht, weil der Proxy keine WebSockets durchlässt.)

Pro Video:
1. Neuen Ordner `videos/NN-thema/` anlegen. Aus `videos/01-elfmeter/` übernehmen: `index.html`, `package.json` (Namen anpassen) und `hyperframes.json`. Danach `assets/gsap.min.js` und `assets/stil-b.css` aus diesem Skill nach `assets/` kopieren.
2. `script.json` schreiben (Format steht oben in `scripts/voice.py`). Jedes Segment bekommt eine `id`, die du im HTML über `S.<id>` nutzt.
3. Voiceover und Timings erzeugen:
   `python3 .claude/skills/tiktok-stil-b/scripts/voice.py videos/NN-thema`
   Das erzeugt `assets/voice.wav` und `timings.js` (`SEG`, `CAPS`, `TOTAL`) und setzt `data-duration` an allen Elementen mit `data-sync-total`.
   Ist das Video zu lang, `length_scale` senken (0.86 ist schon schnell) oder den Text kürzen.
4. Szene in `index.html` bauen: genau eine pausierte GSAP-Timeline, registriert als `window.__timelines["main"]`.
   - Ereignisse an Wörter koppeln: `capAt("segment", "wort")` gibt die Startzeit des Untertitels mit diesem Wort zurück.
   - Text- und Zahlenwechsel nicht mit `tl.call` machen. Stattdessen Spans stapeln und mit `stack()` und `swap()` per `tl.set` umschalten, sonst ist das Video beim Springen in der Zeitleiste nicht deterministisch.
   - Bei `fromTo` mitten in der Timeline `immediateRender: false` setzen, sonst springt der Startzustand schon an den Anfang des Videos.
   - Unterstützte Eigenschaften: opacity, x, y, scale, scaleX/Y, rotation, width, height. Balken wachsen deshalb über `scaleX` mit `transform-origin: 0 50%`.
5. Prüfen: `npx hyperframes lint .` muss 0 Fehler zeigen. Dann `npx hyperframes snapshot --at 1,5,10,…` und das Kontaktblatt ansehen (Überlappungen, Lesbarkeit, Timing).
   **Stimme (Standard):** Thorsten (`de_DE-thorsten-high`) mit `"noise_scale": 0.85, "noise_w": 1.0, "pitch": 1.5, "length_scale": 0.82`. Das klingt begeistert und gleicht dem ersten Video. Diese Werte in jede script.json übernehmen.
   Piper klingt bei jedem Lauf leicht anders. Ist ein Wort verwaschen, das Skript einfach noch einmal laufen lassen.
6. Die Stimme immer kontrollieren: `voice.wav` mit faster-whisper (`language='de'`) transkribieren. Ein falsch gelesenes Wort im Segment über `"say"` mit anderer Schreibweise korrigieren.
7. Rendern: `npx hyperframes render -q delivery -o <name>.mp4` (dauert ~1 min für 30 s).
8. Committen und pushen: Projektordner plus MP4. `.tts/` und `.hyperframes/` sind ignoriert.

## 4. Themen-Ideen für Stil B

Gute Themen haben zwei Seiten A und B, eine Erwartung, die kippt, und eine echte Zahl mit Quelle.
Fußball-Beispiele: Elfmeter Ecke vs. Mitte (fertig), Heim- vs. Auswärtstor, Kopfball vs. Schuss aus 11 m, Abseitsfalle vs. tiefe Abwehr, Nachspielzeit gefühlt vs. real, Torwart groß vs. klein.
