#!/usr/bin/env python3
"""English voiceover + word-exact captions for "In this town" story videos.

Reads <project>/script.json:
  {"voice": "am_michael", "speed": 1.0, "lead_in": 0.3, "tail": 1.2,
   "segments": [{"id": "hook", "text": "...", "pause": 0.3}]}
Writes <project>/assets/voice.wav and <project>/timings.js:
  window.SEG = {id: {start, end}}, window.WORDS = [{w, t0, t1}], window.CAPS = [{t0, t1, text}], window.TOTAL
Engine: Kokoro via `hyperframes tts` (needs `pip install kokoro-onnx soundfile`).
Word times come from faster-whisper on the final mix, captions are 1–2 words like the reference style.
Usage: python3 voice_en.py <project>
"""
import json, os, re, subprocess, sys, wave
import numpy as np

proj = sys.argv[1]
cfg = json.load(open(os.path.join(proj, "script.json"), encoding="utf-8"))
tmp = os.path.join(proj, ".tts"); os.makedirs(tmp, exist_ok=True)
os.makedirs(os.path.join(proj, "assets"), exist_ok=True)
hf = os.environ.get("HF_BIN", "/tmp/hf/node_modules/.bin/hyperframes")

RATE = 24000
chunks, seg_t = [], {}
t = cfg.get("lead_in", 0.3)
chunks.append(np.zeros(int(RATE * t), np.int16))
for seg in cfg["segments"]:
    wav = os.path.join(tmp, seg["id"] + ".wav")
    key = json.dumps([seg.get("say", seg["text"]), seg.get("voice", cfg.get("voice")), seg.get("speed", cfg.get("speed"))])
    if not (os.path.exists(wav) and open(wav + ".key").read() == key if os.path.exists(wav + ".key") else False):
        subprocess.run([hf, "tts", seg.get("say", seg["text"]), "-v", seg.get("voice", cfg.get("voice", "am_michael")),
                        "-s", str(seg.get("speed", cfg.get("speed", 1.0))), "-o", wav], check=True, capture_output=True)
        open(wav + ".key", "w").write(key)
    with wave.open(wav) as w:
        assert w.getframerate() == RATE, w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    # trim leading/trailing silence
    nz = np.where(np.abs(a) > 300)[0]
    if len(nz):
        a = a[max(0, nz[0] - 600): nz[-1] + 1200]
    d = len(a) / RATE
    seg_t[seg["id"]] = {"start": round(t, 3), "end": round(t + d, 3)}
    chunks.append(a); t += d
    p = seg.get("pause", 0.25)
    chunks.append(np.zeros(int(RATE * p), np.int16)); t += p
tail = cfg.get("tail", 1.2)
chunks.append(np.zeros(int(RATE * tail), np.int16)); t += tail
audio = np.concatenate(chunks)
out = os.path.join(proj, "assets", "voice.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(audio.tobytes())

# word timestamps
from faster_whisper import WhisperModel
a16 = np.interp(np.arange(0, len(audio), RATE / 16000), np.arange(len(audio)), audio.astype(np.float32) / 32768).astype(np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8")
script_words = " ".join(s["text"] for s in cfg["segments"]).split()
segs, _ = m.transcribe(a16, language="en", word_timestamps=True,
                       initial_prompt=" ".join(s["text"] for s in cfg["segments"])[:800])
heard = [w for s in segs for w in s.words]
# align per segment with difflib; unmatched script words are interpolated inside their segment
import difflib
norm = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())
words = []
matched = 0
for seg in cfg["segments"]:
    st = seg_t[seg["id"]]
    sw = seg["text"].split()
    hw = [w for w in heard if st["start"] - .15 <= w.start <= st["end"] + .15]
    times = [None] * len(sw)
    sm = difflib.SequenceMatcher(None, [norm(x) for x in sw], [norm(w.word) for w in hw], autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = (hw[b + k].start, hw[b + k].end); matched += 1
    # interpolate gaps by character weight between known anchors (segment edges as fallback)
    s0, s1 = st["start"] + .05, st["end"] - .05
    i = 0
    while i < len(sw):
        if times[i] is not None: i += 1; continue
        j = i
        while j < len(sw) and times[j] is None: j += 1
        left = times[i - 1][1] if i > 0 else s0
        right = times[j][0] if j < len(sw) else s1
        if right <= left: right = left + .25 * (j - i)
        wts = [len(x) + 2 for x in sw[i:j]]; tot = sum(wts); c = left
        for k in range(i, j):
            d = (right - left) * wts[k - i] / tot; times[k] = (c, c + d); c += d
        i = j
    for x, (a, b) in zip(sw, times):
        words.append({"w": x, "t0": round(a, 3), "t1": round(b, 3)})
print(f"aligned {matched}/{sum(len(s['text'].split()) for s in cfg['segments'])} script words, {len(heard)} heard")

# enforce strictly increasing word times
for i in range(1, len(words)):
    if words[i]["t0"] <= words[i - 1]["t0"]: words[i]["t0"] = round(words[i - 1]["t0"] + .05, 3)
    if words[i]["t1"] <= words[i]["t0"]: words[i]["t1"] = round(words[i]["t0"] + .12, 3)
caps, cur = [], []
for w in words:
    cur.append(w)
    if len(cur) == 2 or re.search(r"[.,!?:;—]$", w["w"]) or len(w["w"]) > 9:
        caps.append(cur); cur = []
if cur: caps.append(cur)
CAPS = []
for i, c in enumerate(caps):
    t1 = caps[i + 1][0]["t0"] if i + 1 < len(caps) else c[-1]["t1"] + 0.3
    t1 = min(t1, c[-1]["t1"] + 0.6)
    if i + 1 < len(caps): t1 = min(t1, caps[i + 1][0]["t0"])
    t1 = max(t1, c[0]["t0"] + .12)
    CAPS.append({"t0": c[0]["t0"], "t1": round(t1, 3), "text": " ".join(x["w"] for x in c)})

with open(os.path.join(proj, "timings.js"), "w", encoding="utf-8") as f:
    f.write("// generated by voice_en.py\n")
    f.write(f"window.TOTAL = {round(t, 3)};\n")
    f.write("window.SEG = " + json.dumps(seg_t, indent=1) + ";\n")
    f.write("window.WORDS = " + json.dumps(words) + ";\n")
    f.write("window.CAPS = " + json.dumps(CAPS, ensure_ascii=False, indent=0) + ";\n")
idx = os.path.join(proj, "index.html")
if os.path.exists(idx):
    src = open(idx, encoding="utf-8").read()
    src = re.sub(r'(data-duration=")[\d.]+("[^>]*?data-sync-total)', lambda m_: m_.group(1) + str(round(t, 3)) + m_.group(2), src)
    open(idx, "w", encoding="utf-8").write(src)
print(f"voice.wav: {t:.2f} s, {len(CAPS)} captions")
for k, v in seg_t.items():
    print(f"  {k:10s} {v['start']:6.2f} – {v['end']:6.2f}")
