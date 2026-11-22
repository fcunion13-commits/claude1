# Roblox brief – "The Hearts" (In this town, ~49.3 s)

This is the build task for Claude Code on the owner's PC (with the Roblox_Studio MCP). Build everything in the existing town place
(main street + market plaza with fountain and stage). Voice, music, captions and text pops are added later in the cloud pipeline,
**so the Roblox recording has no sound and no text except the hearts above the heads.**

## 1. Cast (R15 rigs, own designs – do not copy other creators' characters)
| Name | Look | Hearts label |
|---|---|---|
| Mayor | tall, dark-blue suit, red sash, top hat, mustache, big smile | grey "0" (no heart symbol) – later "❤ 1" |
| Old Ben | old sweeper, grey beard, orange work vest, cap, broom | big glowing red "❤ 412" |
| Me (narrator) | kid, ~10 years, yellow hoodie, brown hair | "❤ 6" |
| Mrs. Lee | elderly woman, purple cardigan, glasses, white hair bun | "❤ 31" |
| Baker | white apron + baker hat, flour on clothes | "❤ 18" |
| Orphans | 4 small kids, simple colourful clothes | "❤ 2" … "❤ 5" |
| Townsfolk | the existing 25–30 residents | random "❤ 3" … "❤ 40" |

**Hearts:** a BillboardGui above every head (StudsOffset ~ (0, 3, 0), AlwaysOnTop = true, Size ~ {0,220},{0,90}).
TextLabel with Font FredokaOne / GothamBlack, white text, thick black UIStroke (Thickness 4), red heart "❤" before the number.
Ben's label is bigger (1.5×) and pulses gently (scale 1.0 → 1.08). The mayor's "0" is grey text without a heart.

## 2. Extra props
- Mrs. Lee's house: a window with a **broken pane** (cracked glass part + shards on the ground) that Ben repairs (swap to an intact pane at 22.6 s).
- An **"ORPHANAGE"** building with a sign and a wooden door at the edge of the plaza.
- Ben's toolbox, hammer, wooden boards, a **bread basket** (5–6 loaves), his broom.
- Festival decoration on the stage: banner "SPRING FESTIVAL", balloons.

## 3. Recording setup
- A LocalScript in StarterPlayerScripts named `HeartsDirector` that runs the whole film automatically when Play is pressed:
  Camera.CameraType = Scriptable, hide the player character, disable the default UI (StarterGui:SetCoreGuiEnabled(All, false)).
- **Sync marker:** wait 3 s after start, then show a full-screen **white frame for 0.1 s** – that moment is t = 0.
  All shot times below are measured from this flash.
- Every shot = a camera CFrame tween from "from" to "to" over the full shot duration (TweenInfo Linear or Sine InOut) = slow push-in.
  Shots marked **HUSS** are hard cuts with a small camera shake (random offset ±0.15 studs for 0.2 s).
- Lighting changes per scene through the script: **day** = ClockTime 15; **night 4 AM** = ClockTime 4, street lamps PointLight on,
  bluish Ambient; **sunrise** = ClockTime 6.3. Characters walk with Humanoid:MoveTo and play animations (idle, walk, wave, point, cheer, sit).
- Portrait recording: in Studio use **Test → Device emulator** with a custom portrait device of **1080 × 1920**, or record with OBS
  and crop to 9:16. Record **one continuous take** from the Play button until the end (≥ 53 s).

## 4. Shot list (t in seconds from the white flash)
| # | t0 – t1 | Scene | What happens | Camera |
|---|---|---|---|---|
| 1 | 0.0 – 2.6 | plaza, day | **Strongest image:** Mayor waving on the stage (grey "0"), in front of the stage Ben sweeping (glowing "❤ 412"). Both in frame. | low angle from the front, slow push-in |
| 2 | 2.6 – 5.3 | market | crowd walking between stalls, everyone with hearts (12, 6, 30 …) | sideways dolly at eye height |
| 3 | 5.3 – 6.8 | stage | close-up mayor smiling + waving, "0" above head, crowd cheering below | medium close-up, push-in |
| 4 | 6.8 – 10.0 | street | Ben sweeping alone, people walk past without looking, "❤ 412" | eye height, slow push |
| 5 | 10.0 – 13.3 | market stall | Me (kid, "❤ 6") peeks from behind a stall at Ben, curious | over-the-shoulder of the kid |
| 6 | 13.3 – 17.8 | stage | Mayor points angrily at Ben, guards next to him; Ben lowers his head | medium shot, Ben in foreground |
| 7 | 17.8 – 20.0 | street, **night 4 AM** | Ben walks with toolbox and broom under lamps; the kid peeks around a corner | wide, eye height |
| 8 | 20.06 / 20.30 / 20.56 | night | **HUSS** ×3: close-ups Ben hammering a board, sawing, sweeping fast | hard cuts, 3 angles, shake |
| 9 | 20.9 – 23.3 | Mrs. Lee's house | Ben fixes the broken window; pane becomes intact at 22.6 | medium shot from the street |
| 10 | 23.34 / 23.66 | night | **HUSS** ×2: Ben carrying the bread basket fast, low angle | hard cuts, shake |
| 11 | 24.0 – 25.8 | orphanage | Ben puts the basket at the door, knocks, hides behind a wall | wide from across the street |
| 12 | 25.86 / 26.12 / 26.36 | night | **HUSS** ×3: fixing a bench, watering flowers, sweeping | hard cuts, shake |
| 13 | 26.7 – 30.2 | plaza, **sunrise** | Ben sits tired alone on a bench, sun rises; the kid watches from afar | slow pull-back |
| 14 | 30.2 – 32.6 | stage, day, festival | Mayor on stage points at Ben in the crowd | wide over the crowd |
| 15 | 32.6 – 34.7 | stage | close-up mayor, angry face, pointing ("This man is a fraud") | close-up, slight push |
| 16 | 34.7 – 36.5 | plaza | Mrs. Lee stands up from a bench and walks to Ben | medium |
| 17 | 36.5 – 37.6 | plaza | the Baker steps behind Ben | medium |
| 18 | 37.6 – 38.9 | plaza | the 4 orphans run to Ben | low, kids' eye height |
| 19 | 38.9 – 41.9 | plaza | the whole town walks over and stands behind Ben; the mayor alone on the stage | crane up from Ben to a high wide shot |
| 20 | 41.9 – 44.0 | stage | close-up mayor, surprised, the grey "0" disappears | close-up |
| 21 | 44.0 – 45.9 | stage | a small **"❤ 1"** pops above the mayor (scale 0 → 1.2 → 1); then reveal Ben smiling up at him | pull back to show both |
| 22 | 45.9 – 49.3+ | plaza | final wide image: town around Ben, mayor looking at his heart; hold 3 s longer | slow wide push-in |

## 5. Done when
- Pressing Play runs the whole film by itself, every cut lands on the listed time (±0.1 s).
- The owner records one portrait take and sends it to the cloud session for voice, music, captions and HUSS text.
