#!/usr/bin/env python3
"""Original background music for story videos – composed procedurally (no samples, no copyrighted material).

Soft piano arpeggios + warm pad + gentle pulse, with mood sections that follow the story:
  "mystery" (minor, curious) → "sad" (sparse, slower feel) → "dark" (low, tense) → "hope" (major, brighter) → "end" (swell + fade)
Reads <project>/timings.js (TOTAL, SEG) and <project>/music.json (optional):
  {"sections": [["mystery", "hook"], ["sad", "problem"], ["dark", "virus"], ["hope", "twist"], ["end", "end"]], "bpm": 84}
Each section starts at the start of the named segment. Writes <project>/assets/music.wav (stereo, 44.1 kHz).
Usage: python3 music.py <project>
"""
import json, os, re, sys, wave
import numpy as np

proj = sys.argv[1]
src = open(os.path.join(proj, "timings.js"), encoding="utf-8").read()
TOTAL = float(re.search(r"window\.TOTAL = ([\d.]+)", src).group(1))
SEG = json.loads(re.search(r"window\.SEG = (\{.*?\});", src, re.S).group(1))
cfgp = os.path.join(proj, "music.json")
cfg = json.load(open(cfgp)) if os.path.exists(cfgp) else {}
sections = cfg.get("sections", [["mystery", "hook"], ["sad", "problem"], ["dark", "virus"], ["hope", "twist"], ["end", "end"]])
bpm = cfg.get("bpm", 84)
SR = 44100
N = int(SR * (TOTAL + .5))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def midi(n): return 440 * 2 ** ((n - 69) / 12)

def piano(f, dur, vel=.5):
    n = int(SR * dur); t = np.arange(n) / SR
    env = np.exp(-t * 2.6) * (1 - np.exp(-t * 400))
    s = sum(a * np.sin(2 * np.pi * f * h * t * (1 + .0004 * h * h)) * np.exp(-t * (1.5 + h * .9)) for h, a in [(1, 1), (2, .45), (3, .22), (4, .1), (5, .05)])
    return s * env * vel

def pad(freqs, dur, vel=.12):
    n = int(SR * dur); t = np.arange(n) / SR
    att = np.clip(t / 1.2, 0, 1); rel = np.clip((dur - t) / 1.2, 0, 1)
    s = np.zeros(n)
    for f in freqs:
        for det in (-.003, 0, .003):
            s += sum(np.sin(2 * np.pi * f * (1 + det) * h * t + rng.random() * 6) / h ** 1.6 for h in (1, 2, 3))
    return s / (len(freqs) * 3) * att * rel * vel

def pulse(dur, vel=.25):
    n = int(SR * dur); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 9) * vel

def add(sig, t0, pan=0.):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * (1 - pan) ** .5 * .9
    R[i:i + len(sig)] += sig * (1 + pan) ** .5 * .9

# chord progressions (root midi, quality) per mood – 1 chord per bar (4 beats)
MOODS = {
    "mystery": {"prog": [(57, "m"), (53, "M"), (48, "M"), (55, "M")], "arp": True, "pulse": False, "vel": .38, "oct": 12},
    "sad":     {"prog": [(57, "m"), (52, "m"), (53, "M"), (52, "m")], "arp": "sparse", "pulse": False, "vel": .32, "oct": 12},
    "dark":    {"prog": [(57, "m"), (50, "m"), (52, "M"), (57, "m")], "arp": True, "pulse": True, "vel": .34, "oct": 0},
    "hope":    {"prog": [(48, "M"), (55, "M"), (57, "m"), (53, "M")], "arp": True, "pulse": True, "vel": .42, "oct": 12},
    "end":     {"prog": [(53, "M"), (55, "M"), (48, "M"), (48, "M")], "arp": "sparse", "pulse": False, "vel": .40, "oct": 12},
}
def chord(root, q): return [root, root + (3 if q == "m" else 4), root + 7]

beat = 60 / bpm; bar = beat * 4
starts = [(SEG[s]["start"] if s in SEG else 0.0, m) for m, s in sections]
starts[0] = (0.0, starts[0][1])
for si, (t0, mood) in enumerate(starts):
    t1 = starts[si + 1][0] if si + 1 < len(starts) else TOTAL + .5
    M = MOODS[mood]
    t = t0; b = 0
    while t < t1 - .2:
        root, q = M["prog"][b % len(M["prog"])]
        notes = chord(root, q)
        blen = min(bar, t1 - t)
        add(pad([midi(n - 12) for n in notes], blen + 1.0, .10 if mood != "dark" else .13), t)
        add(piano(midi(root - 24), 3.0, .22), t)                      # bass note
        if M["arp"]:
            pattern = [0, 1, 2, 1, 2, 3, 2, 1] if M["arp"] is True else [0, None, 2, None, 3, None, 1, None]
            for k, p in enumerate(pattern):
                tt = t + k * beat / 2
                if p is None or tt >= t1: continue
                n = (notes + [notes[0] + 12])[p] + M["oct"]
                add(piano(midi(n), 2.2, M["vel"] * (.8 + .2 * (k % 2 == 0))), tt, pan=(-.35 if k % 2 else .35))
        if M["pulse"]:
            for k in range(4):
                if t + k * beat < t1: add(pulse(.6, .18 if mood == "dark" else .12), t + k * beat)
        t += bar; b += 1

# simple stereo reverb (decaying noise convolution via FFT)
ir_len = int(SR * 2.2); irt = np.arange(ir_len) / SR
def reverb(x, seed):
    ir = np.random.default_rng(seed).standard_normal(ir_len) * np.exp(-irt * 2.8); ir[0] = 0
    n = len(x) + ir_len
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return y / (np.abs(ir).sum() ** .5 * 6)
Lw, Rw = L + reverb(L, 1) * .9, R + reverb(R, 2) * .9
# fades
fade = np.ones(N); fi = int(SR * 1.5); fo = int(SR * 2.5)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
Lw *= fade; Rw *= fade
peak = max(np.abs(Lw).max(), np.abs(Rw).max())
Lw, Rw = Lw / peak * .85, Rw / peak * .85
out = os.path.join(proj, "assets", "music.wav")
st = np.stack([Lw, Rw], 1)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f"music.wav: {N / SR:.1f} s, sections:", [(round(t, 1), m) for t, m in starts])
