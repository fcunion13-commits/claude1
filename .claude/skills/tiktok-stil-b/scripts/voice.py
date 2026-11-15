#!/usr/bin/env python3
"""Deutsches Voiceover + Untertitel-Timing für ein Stil-B-Video.

Liest <projekt>/script.json, erzeugt pro Segment Sprache mit Piper (Stimme Thorsten),
fügt alles zu <projekt>/assets/voice.wav zusammen und schreibt <projekt>/timings.js mit
  window.SEG  = { id: {start, end} }       – Sekunden im fertigen Film
  window.CAPS = [ {t0, t1, html} ]          – 1–3 Wörter pro Untertitel, Schlüsselwörter eingefärbt
  window.TOTAL = Gesamtdauer

script.json:
{
  "lead_in": 0.3,                 # Stille am Anfang
  "tail": 1.2,                    # Stille am Ende
  "length_scale": 0.95,           # <1 = schneller sprechen
  "colors": {"ecke": "a", "mitte": "b", "sieben": "y"},   # a=Seite A (rot), b=Seite B (türkis), y=gelb
  "segments": [ {"id": "hook", "text": "…", "pause": 0.25, "say": "optional abweichende Aussprache"} ]
}
Aufruf: python3 voice.py <projekt-ordner> [--voice /pfad/de_DE-thorsten-high.onnx]
"""
import json, re, subprocess, sys, wave, os, html as H

proj = sys.argv[1]
voice = os.environ.get("PIPER_VOICE", "/tmp/hf/voices/de_DE-thorsten-high.onnx")
if "--voice" in sys.argv:
    voice = sys.argv[sys.argv.index("--voice") + 1]
cfg = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
os.makedirs(os.path.join(proj, "assets"), exist_ok=True)
tmp = os.path.join(proj, ".tts")
os.makedirs(tmp, exist_ok=True)

RATE = None
frames = []
seg_t = {}
caps = []
t = cfg.get("lead_in", 0.3)
colors = {k.lower(): v for k, v in cfg.get("colors", {}).items()}


def silence(sec):
    return b"\x00\x00" * int(RATE * sec)


def chunk_words(text):
    """1–3 Wörter pro Untertitel; nach Satzzeichen wird immer getrennt."""
    words = text.split()
    out, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.,!?:;–]$", w) or len(cur) == 3:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def word_html(w):
    core = re.sub(r"[^\wäöüÄÖÜß%-]", "", w).lower()
    cls = colors.get(core)
    e = H.escape(w)
    return f'<span class="k{cls}">{e}</span>' if cls else e


for seg in cfg["segments"]:
    wav = os.path.join(tmp, seg["id"] + ".wav")
    subprocess.run([sys.executable, "-m", "piper", "-m", voice, "-f", wav,
                    "--length-scale", str(seg.get("length_scale", cfg.get("length_scale", 0.95)))],
                   input=seg.get("say", seg["text"]).encode(), check=True, capture_output=True)
    with wave.open(wav) as w:
        if RATE is None:
            RATE = w.getframerate()
            frames.append(silence(t))
        data = w.readframes(w.getnframes())
        dur = w.getnframes() / RATE
    # Piper lässt ~0.1 s Stille vorn/hinten – Untertitel darauf abstimmen
    s0, s1 = t + 0.08, t + dur - 0.12
    seg_t[seg["id"]] = {"start": round(t, 3), "end": round(t + dur, 3)}
    chunks = chunk_words(seg["text"])
    weights = [sum(len(x) for x in c) + 2 for c in chunks]
    tot = sum(weights)
    c0 = s0
    for c, wgt in zip(chunks, weights):
        c1 = c0 + (s1 - s0) * wgt / tot
        caps.append({"t0": round(c0, 3), "t1": round(c1, 3), "html": " ".join(word_html(x) for x in c)})
        c0 = c1
    frames.append(data)
    t += dur
    p = seg.get("pause", 0.2)
    frames.append(silence(p))
    t += p

frames.append(silence(cfg.get("tail", 1.0)))
t += cfg.get("tail", 1.0)
out = os.path.join(proj, "assets", "voice.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes(b"".join(frames))

with open(os.path.join(proj, "timings.js"), "w", encoding="utf-8") as f:
    f.write("// automatisch erzeugt von voice.py – nicht von Hand ändern\n")
    f.write(f"window.TOTAL = {round(t, 3)};\n")
    f.write("window.SEG = " + json.dumps(seg_t, ensure_ascii=False, indent=1) + ";\n")
    f.write("window.CAPS = " + json.dumps(caps, ensure_ascii=False, indent=1) + ";\n")
idx = os.path.join(proj, "index.html")
if os.path.exists(idx):
    src = open(idx, encoding="utf-8").read()
    src = re.sub(r'(data-sync-total[^>]*?data-duration=")[\d.]+(")', lambda m: m.group(1) + str(round(t, 3)) + m.group(2), src)
    src = re.sub(r'(data-duration=")[\d.]+("[^>]*?data-sync-total)', lambda m: m.group(1) + str(round(t, 3)) + m.group(2), src)
    open(idx, "w", encoding="utf-8").write(src)
print(f"voice.wav: {t:.2f} s, {len(caps)} Untertitel")
for k, v in seg_t.items():
    print(f"  {k:12s} {v['start']:6.2f} – {v['end']:6.2f}")
