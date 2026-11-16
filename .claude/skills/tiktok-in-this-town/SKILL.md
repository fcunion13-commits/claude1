---
name: tiktok-in-this-town
description: Creates an ENGLISH "In this town / In this world…" story TikTok (9:16, 60–90 s) – a strange rule, a character everyone misjudges, a time jump and a twist ending – fully in code with HyperFrames + Three.js (original blocky chibi 3D characters), Kokoro English voiceover and word-exact 1–2-word captions. Use for every video in the English story niche.
---

# "In this town" story videos (English, HyperFrames + Three.js)

This niche is **always in English**. First finished example: `videos/en-01-the-number/` (read `src/scene.js` before building a new one).

## Originality rules
- **Own characters only.** Use the chibi style from `scripts/lib3d.js`: big rounded head, large oval eyes with highlight, cheeks, small body, stubby limbs. Never recreate Roblox avatars or any other game's or brand's characters, logos or UI.
- **Own stories only.** The reference creator's stories, such as the future-photo story, are not retold or lightly reworded. Invent a new strange rule every time.

## Story formula (≈ 180–230 words → 65–80 s)
1. **Hook (1 sentence):** "In this town, every [person] [strange rule]."
2. **Rule examples:** 2–3 quick concrete cases, including one "normal" and one exciting.
3. **The character:** "But one day, a [boy/girl] named X …". Their result breaks the rule's expectations.
4. **Everyone's reaction:** hype or fear, with a crowd scene.
5. **The problem:** the character seems to be the opposite (fails, gets laughed at). Add an authority figure such as a teacher or boss who writes them off.
6. **Withdrawal:** the character disappears and the town forgets about them.
7. **Time jump:** "Twenty years later …" brings a crisis.
8. **Twist:** the rule was right, but in a way nobody expected. It can be wholesome (the-number) or dark-comedic (the reference). Keep it TikTok-safe: no gore, no real people.
9. **Final image:** 1 short line that calls back to the rule, ideally with a visual payoff (number changes, photo matches …).

Style: simple words, short sentences, past tense, a narrator who sounds slightly dramatic. Numbers are written as words when spoken.

## Look
- 3D sets: rooms (`room`), streets (`ground`, `house`, `tree`), signs (`sign`), screens (`screen`), confetti, floating labels (`makeLabel`, golden numbers with dark outline).
- Camera: every shot gets a slow push-in or drift (from → to), with a new shot every 2–5 s. Cut on keywords using `at("segment","word")`.
- Captions: 1–2 words, centered at y≈1150, Inter 900 white with thick black stroke, small pop-in (`assets/story.css`).
- Bright, saturated colours; daylight for normal life, blue night for loneliness, green fog for crises.

## Pipeline
One-time per session:
- Do the setup from `tiktok-stil-b`.
- `cd /tmp/hf && npm i three@0.170.0 esbuild`
- `pip install kokoro-onnx soundfile faster-whisper`

Per video:
1. Create `videos/en-NN-slug/` and copy `index.html`, `package.json`, `hyperframes.json` and `assets/story.css` from `videos/en-01-the-number/`. Then copy `gsap.min.js` into `assets/`.
2. Write `script.json`. Use voice `am_michael`, speed `1.08`, and one segment per story beat.
3. Run `python3 .claude/skills/tiktok-in-this-town/scripts/voice_en.py videos/en-NN-slug`. It generates the Kokoro voice, whisper word times (`WORDS`), 1–2-word `CAPS`, `SEG`, and syncs `data-duration`.
4. Write `src/scene.js`: build sets and cast with `lib3d.js` and define `shot(t0, scene, fromCam, toCam, update)`.
   Every shot's `update` must set **all** state it shows: visibility, textures, poses, backgrounds. Snapshots and renders seek out of order.
5. Bundle:
   `NODE_PATH=/tmp/hf/node_modules /tmp/hf/node_modules/.bin/esbuild src/scene.js --bundle --format=iife --minify --outfile=assets/scene.js --alias:three=/tmp/hf/node_modules/three`
6. Check with `npx hyperframes snapshot --at …` and review the contact sheets: framing, nothing blocking text, screen text fits.
   The lint errors about `Math.random`/`requestAnimationFrame` come from inside three.js (UUIDs, unused loop) and are harmless.
7. Render with `npx hyperframes render -q delivery -o slug.mp4`. 77 s takes about 10–15 min in software WebGL, so run it in the background. Then commit and push.

Framing tips:
- Portrait has a narrow horizontal view. Keep important things within ±1.5 m of the look-at point at 6 m distance.
- Keep screen text at ≤ 120 px on a 4.6 m × 260 px/m canvas.

## Learnings from the channel (apply to every video)
- "The Number": 2.9K views in <4 h, 27 % watched the full 77 s, 5 % likes, but only 1 comment and 5 follows. The story works, but the ending gave no reason to comment or follow. Every video now ends with:
  1. a **question to the viewer**, spoken as the last segment and shown big on screen (`.endq`), e.g. "Would YOU want to be the only liar? 👇"
  2. a **"Follow for the next town 🏘️"** pill (`.follow`), shown after the question.
- **Speech bubbles are screen-space HTML (`.sb l|r|c`, optional `red`)**, not 3D sprites. 3D sprites get cut off at the screen edges in portrait. Each bubble shows the speaker (`<small>LILY</small>`). Keep bubble text ≤ ~20 characters.
- A second voice is fine for one key line (segment `"voice": "af_heart"`); `voice_en.py` supports per-segment `voice` and `speed`.
- Music sections per story go in `music.json` (mystery → hope → dark → end), then run `scripts/music.py`.
- First-person hooks ("…except me") are strong: an immediate conflict and a character the viewer identifies with.
