---
name: tiktok-in-this-town
description: Creates an ENGLISH "In this town / In this world…" story TikTok (9:16, 60–90 s) – a strange rule, a character everyone misjudges, a time jump and a twist ending – fully in code with HyperFrames + Three.js (original blocky chibi 3D characters), Kokoro English voiceover and word-exact 1–2-word captions. Use for every video in the English story niche.
---


> **Erster Schritt in jeder neuen Sitzung / First step in every new session:** `bash scripts/setup-video-tools.sh` (installs HyperFrames, Remotion, FFmpeg, faster-whisper, yt-dlp, three, esbuild, gsap, Piper/Kokoro voices into /tmp/hf, about 2–5 min on a fresh container).

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

## Performance log & rules derived from it
| Video | Views | Full watch | Likes | Comments / Follows | Notes |
|---|---|---|---|---|---|
| The Number (77 s) | 2.9K / 4 h | 27.3 % | 5.0 % | 1 / 5 | visible rule (number over head) = mystery the whole time |
| Except me (57 s) | 891 / 12 h | 9.8 % | 8.8 % | 0 / 0 | invisible rule, montage middle (17–31 s), stakes only from 32 s, twist at 46 s |
| The Visit (139 s) | 1.5K / 30 h | 6.0 % (avg 34 s) | 7.7 % | 2 / 2 | 31 s of rules shown on side characters; heroes appear at 31 s; about 70 % gone by 15–20 s; twist at 1:35 |
| Body Count (70 s) | 911 / 15 h | 12.1 % (avg 16.7 s) | 4.7 % | 3 / 6 (best follow rate: 6.6 per 1K) | new rules work after the hook (flat curve), but about 60 % gone within 1–3 s: first frame was a smiling boy with a "0", the scary "47" only at 4 s |
| Pebble P1 (74 s) | 860 / 48 h (died after day 1) | 2.2 % (avg 8.1 s) | 1.6 % | 0 / 0 | below 50 % within ~1 s, then flat: back of a turtle shell + static "🐢 VS 🐉" text, no face, no action, "PART 1" pill; underdog story without a visible rule or twist, montage middle |

Rules from this:
1. **The rule must be VISIBLE on screen the whole time** (number, shadow, color, object). Invisible rules (lying) lose viewers.
2. **Open loop within the first 6 s:** right after the hook, one sentence that promises the ending ("…it worked on everyone. Except the one person who mattered.").
3. **No list or montage middles.** Every beat must raise the stakes or add a clue. Target 45–60 s.
4. **Stakes and main characters introduced by about 15 s.** First twist hint by about 50 % of the runtime.
5. A small on-screen "Wait for the ending 👀" pill around 3–6 s, plus the end question and follow card.

## Detail & staging rules (after "The Visit" feedback)
- **Scenes must never look empty.** Use the props in `lib3d.js`: `pine`, `car`, `streetlamp`, `fence`, `mailbox`, `snowman`, `bench`, `chimneySmoke` (call the returned update every frame), `townsfolk` (background people walking or talking; keep their paths away from camera paths), `decorateLivingRoom` (fireplace, rug, couch, shelf, frames, plant, lamp, counter, curtains).
- **Sitting at a table:** add a `chair()` at each seat, place the character on the chair (not inside the table footprint) and call `sitOn(ch, .5)` after `pose()`. Keep the table narrow (about 1.7 m) so both ends fit in portrait framing.
- True reflections: `Reflector` (three/examples) for mirrors/ice; put "invisible to reflection" characters on layer 1 (`cam.layers.enable(1)`).
- Keep trees and houses off the camera paths, and check every shot in the contact sheet.
- Do not commit MP4s over ~50 MB (GitHub limit); send them to the user directly and add them to `.gitignore`.

### Hard rules from "The Visit"
6. **Main character and their personal stakes in the first 5 s** ("Today is my little sister's Visit. I swore she'd never find out."). Never open with side characters.
7. **Rules ≤ 10–12 s**, demonstrated on the main characters themselves, not a demo family.
8. **Max ~80 s total.** Tighten long scripts. Twist before ~65 % of the runtime.
9. **First frame must already show the mystery object** (covered mirror, number, shadow). No establishing wide shot as the opening.

## Decision: stay with the current toolset (Nov 2026)
A test with CC0 Quaternius models, skeletal animation, post-processing (GTAO, outline, bloom, SMAA) and 60 fps lives in `videos/test-upgrade/` (comparison: `vergleich.png`).
Result: smoother motion, but 15 s took 31 min to render (≈ 2 h+ per video), the faces cannot change expression, and the style moves away from the channel's chibi look.
**The owner decided to keep the existing tools and look** (lib3d chibi characters, code props, 30 fps, no post-processing). Do not switch unless the owner asks again; the test project is the starting point if they do.

### Hard rules from "Body Count" (the first 2 seconds)
10. **Frame 1 = the strongest image of the video**, not the chronological start. Show the threat or contrast immediately (e.g. smiling grandma + pie + glowing "47", nervous kid with "0" next to her).
11. **Big on-screen text hook from frame 1** (works without sound), e.g. "Grandma's body count: 47 😳". Keep it 1–2 s, then let the story start.
12. **Show contrast in one image** (0 next to 47, gray next to orange), not in two consecutive shots.

### Hard rules from "Pebble Part 1"
13. **Frame 1 needs a face with emotion AND something already happening** (fire hitting, number glowing, someone screaming). A static object seen from behind (shell, back of a head) loses viewers in the first second.
14. **The text hook must be a curiosity gap or claim**, not a neutral label. Use "The dragon's fire didn't even scratch him", not "🐢 VS 🐉".
15. **No "Part 1" videos without a payoff.** Every video resolves its own twist; a series continues with a new mystery, never a cut-off ending. No "PART 1" pill.
16. **Voice starts at 0.0 s** (`lead_in: 0`), and the first spoken words are the strongest line.
17. Keep the formula: **visible rule + misjudged hero + twist**. A plain underdog story with an obvious ending does not hold.

## Look v2 (standard from Nov 2026, after studying two top creators)
Use `scripts/look2.js` and `scripts/creatures.js` on top of `lib3d.js` (example: `videos/en-07-pebble/`, test: `videos/test-look-v2/`).
- `dress(ch)` gives clothes knit/denim textures with stitched seams. Create characters with `bold: true` for thick, readable eyebrows.
- Surfaces: `texMat(sandTex()|woodTex()|stoneTex()|scaleTex(), [rx, ry])`; never plain single-colour floors or walls.
- Light: `cineLights(scene, {...})` gives a warm key and a cool rim. Post: `makePost(renderer, scene, cam)`, then `post.render(scene, focus, aperture)` per shot (bloom + depth of field). Close-ups use aperture .004–.006; wide shots use .0012–.002.
- Effects: `fireStream`, `sparkBurst`, `shieldDome`, `glowSprite`. Keep additive sprites small and low opacity, or bloom washes the frame white.
- Dense sets: `stringLights`, `bunting`, packed crowds (`castShadow = false` on crowd), confetti.
- Camera: characters fill a third to half of the frame, a cut every 1–2 s, and `shake(cam, t, amt)` on impacts. HTML overlays `#speed` (speed lines), `#vig`, `#flash`.
- **"HUSS!" meme moment:** a fast grind sequence (training, working) where the narrator chants "Huss, huss, huss!" (script `text` "Huss!", `say` "Hush, hush, hush!", speed 1.25–1.3). Add one hard cut plus a big tilted yellow `HUSS!` text pop, a flash, speed lines and shake per word. Optionally end with a tiny cute "huss!" from a side character.
- Cost: about 56 s of render time per second of video (~50 min for 50 s). Render in the background.
