// "Pebble" – single video with payoff (Look v2 + HUSS training).
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, makeChar, pose, makeLabel, baseScene, house, tree, confetti,
  chair, sitOn, townsfolk, streetlamp, fence, pine, chimneySmoke,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";
import {
  sandTex, woodTex, stoneTex, texMat, dress, cineLights, makePost, fireStream, sparkBurst, shieldDome, stringLights, bunting, shake, glowSprite, fabricTex,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/look2.js";
import { makeTurtle, makeDragon, makeSaint } from "../../../.claude/skills/tiktok-in-this-town/scripts/creatures.js";

const S = window.SEG, WORDS = window.WORDS, CAPS = window.CAPS, TOTAL = window.TOTAL;
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const at = (seg, w, fb = 0, nth = 0) => { const s = S[seg]; const xs = WORDS.filter(q => q.t0 >= s.start - .05 && q.t0 <= s.end + .05 && norm(q.w).startsWith(w)); return xs[nth] ? xs[nth].t0 : s.start + fb; };
const words = (seg) => WORDS.filter(q => q.t0 >= S[seg].start - .05 && q.t0 <= S[seg].end + .05);
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const cam = new THREE.PerspectiveCamera(42, W / H, .05, 300);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];
const SHIRTS = ["#ff7b54", "#6c63ff", "#2ec4b6", "#ffbe0b", "#ef476f", "#06d6a0", "#118ab2", "#f4a261", "#9b5de5"];
const HERO = { shirt: "#5f7a4a", pants: "#3a4a6a", hair: "#5a3a1a", hairStyle: "spiky", skin: "#f2c9a0", scale: .78, bold: true };
const JAX = { shirt: "#c0392b", pants: "#1f2937", hair: "#e3c04b", hairStyle: "spiky", skin: "#f7d7b8", scale: .82, bold: true };
const MIA = { shirt: "#8e6bd8", pants: "#2b2d42", hair: "#2a1d14", hairStyle: "long", skin: "#c98f63", scale: .76, bold: true };
const mkHero = (sc) => { const h = dress(makeChar(HERO)); const sf = rbox(.62, .14, .44, .06, "#2f5fa0"); sf.position.y = 1.04; h.rig.add(sf); sc.add(h.root); return h; };
const mk = (sc, o) => { const c = dress(makeChar(o)); sc.add(c.root); return c; };
const pl = (c, x, z, ry = 0, y = 0) => { c.root.visible = true; c.root.position.set(x, y, z); c.root.rotation.set(0, ry, 0); };
const NUM = (txt, gold = true) => makeLabel(txt, { world: 1.1, size: 170, depthTest: false, ...(gold ? {} : { c1: "#e8eef5", c2: "#8a9bb0" }) });
const crowdRing = (sc, n, R0, rows, seed, exprs = ["laugh", "grin", "shock"]) => { const cr = []; srand(seed);
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r * .1; if (Math.cos(a) > .85) continue; const R = R0 + r * 1.5;
    const p = makeChar({ shirt: SHIRTS[(i + r) % 9], pants: ["#2b2d42", "#3d405b", "#264653"][i % 3], skin: SKIN[(i * 3 + r) % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111", "#c0392b"][(i + r) % 5], hairStyle: ["short", "long", "bun", "spiky"][(i + r) % 4], scale: .85, bold: true });
    p.root.position.set(Math.cos(a) * R, 1.2 + r * .85, Math.sin(a) * R); p.root.lookAt(0, 1.2 + r * .85, 0); p.setExpr(exprs[(i + r) % exprs.length]); p.root.traverse(m => { if (m.isMesh) m.castShadow = false; }); sc.add(p.root); cr.push(p); } return cr; };

// ================= SET A: arena =================
const ar = baseScene({ sky: ["#2a3f8a", "#ff9a6a"], sun: 2, amb: .5 });
cineLights(ar, { key: "#ffc98a", keyI: 2.4, rim: "#7fc8ff", rimI: 2.8, keyPos: [7, 8, 9], rimPos: [-4, 7, -10], hemiSky: "#a8b8ff", hemiGround: "#8a5a3a" });
{ const f = new THREE.Mesh(new THREE.CircleGeometry(11, 64), texMat(sandTex(), [6, 6])); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; ar.add(f);
  const o = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#4a5a3a")); o.rotation.x = -Math.PI / 2; o.position.y = -.01; ar.add(o);
  const w = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 1.2, 64, 1, true), texMat(stoneTex(), [16, 1], { side: THREE.DoubleSide })); w.position.y = .6; ar.add(w);
  for (let r = 0; r < 5; r++) { const R = 11.6 + r * 1.5, y = 1.2 + r * .85;
    const ri = new THREE.Mesh(new THREE.CylinderGeometry(R, R, .85, 64, 1, true), texMat(stoneTex("#a89f90"), [20, 1], { side: THREE.DoubleSide })); ri.position.y = y - .42; ar.add(ri);
    const se = new THREE.Mesh(new THREE.RingGeometry(R, R + 1.5, 64), texMat(woodTex("#8a5a32"), [24, 1], { side: THREE.DoubleSide })); se.rotation.x = -Math.PI / 2; se.position.y = y; se.receiveShadow = true; ar.add(se); }
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + .3; const x = Math.cos(a) * 11.3, z = Math.sin(a) * 11.3;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 6, 8), mat("#5a3a1a")); pole.position.set(x, 3, z); ar.add(pole);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .7), mat(["#e63946", "#2f5fa0", "#ffd23f", "#06d6a0"][i % 4], { side: THREE.DoubleSide })); fl.position.set(x + .55, 5.6, z); ar.add(fl);
    const to = glowSprite("#ffb347", 1.1, .9); to.position.set(x, 6.2, z); ar.add(to);
    const b = (i + 1) % 10, a2 = b / 10 * Math.PI * 2 + .3; stringLights(ar, [x, 5.8, z], [Math.cos(a2) * 11.3, 5.8, Math.sin(a2) * 11.3], { droop: .9, seed: i });
    bunting(ar, [x, 4.6, z], [Math.cos(a2) * 11.3, 4.6, Math.sin(a2) * 11.3], { droop: .6 }); } }
const crowdA = crowdRing(ar, 30, 12.2, 4, 31);
const confA = confetti(ar, 260, [14, 6, 14], 5);
const heroA = mkHero(ar), jaxA = mk(ar, JAX), saintA = makeSaint(); ar.add(saintA.root);
const pebA = makeTurtle(); ar.add(pebA.g); pebA.g.scale.setScalar(1.3);
const domeA = shieldDome(.55); ar.add(domeA); const dragA = makeDragon(); ar.add(dragA.g);
const fireA = fireStream(ar, 110); const sparksA = sparkBurst(ar, 110);
const numPebA = NUM("1", false), numDragA = NUM("99"), numGold = NUM("10"); ar.add(numPebA.sprite, numDragA.sprite, numGold.sprite);
const shards = []; srand(77); for (let i = 0; i < 26; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(.12 + rnd() * .12, .1 + rnd() * .1), new THREE.MeshBasicMaterial({ color: i % 2 ? "#ffd23f" : "#fff6b0", side: THREE.DoubleSide, depthTest: false })); s.renderOrder = 11; s.userData = { d: [(rnd() - .5) * 2, rnd() * 1.4 - .2, (rnd() - .5) * 2], r: rnd() * 10 }; ar.add(s); shards.push(s); }
const PEB = [0, 0, 2], DRAG = [0, 0, -3.4];

// ================= SET B: town square =================
const sq = baseScene({ sky: ["#5fb4ff", "#ffe2c4"], sun: 2, amb: .6 });
const SKYSQ = { day: sq.background };
cineLights(sq, { key: "#fff0d8", keyI: 2.4, rim: "#aee0ff", rimI: 2, keyPos: [6, 10, 8], rimPos: [-6, 6, -9], hemiSky: "#cfe6ff", hemiGround: "#8a7a5a" });
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), texMat(stoneTex("#cfc4b0"), [40, 40])); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sq.add(g);
  const stage = new THREE.Mesh(new THREE.BoxGeometry(5, .6, 3), texMat(woodTex("#8b5a2b"), [3, 1])); stage.position.set(0, .3, -3); stage.castShadow = stage.receiveShadow = true; sq.add(stage);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2, .15, 10, 36, Math.PI), mat("#f1d38a", { roughness: .4 })); arch.position.set(0, .6, -4.2); sq.add(arch);
  [[-7, -7, "#f6d5b2", "#d0573f", .5], [7, -7, "#cfe3f7", "#4a6fa5", -.5], [-10, 1, "#efe0ff", "#6a4aa5", 1.4], [10, 1, "#d8f0d0", "#3d7a4a", -1.4], [-3.5, -11, "#f2e2a2", "#8d5a3b", 0], [3.5, -11, "#ffd6d6", "#a33", 0]].forEach(([x, z, w_, r_, ry]) => house(sq, x, z, { wall: w_, roof: r_, ry }));
  [[-5, -9], [5, -9.5], [-12, -4], [12, -4]].forEach(([x, z]) => tree(sq, x, z, 1.2)); [[-6.5, 4], [6.5, 4]].forEach(([x, z]) => streetlamp(sq, x, z));
  bunting(sq, [-7, 3.2, -6], [7, 3.2, -6], { n: 20, droop: .8 }); bunting(sq, [-7, 3.6, -1], [7, 3.6, -1], { n: 20, droop: 1 }); stringLights(sq, [-8, 4, 2], [8, 4, 2], { n: 22, droop: 1 }); }
const saintS = makeSaint(); sq.add(saintS.root);
const heroS = mkHero(sq), jaxS = mk(sq, JAX), miaS = mk(sq, MIA);
const kidW = mk(sq, { shirt: "#555", pants: "#222", hair: "#111", hairStyle: "short", skin: SKIN[2], scale: .8, bold: true });
const kidE = mk(sq, { shirt: "#2ec4b6", pants: "#2b2d42", hair: "#e3b04b", hairStyle: "bun", skin: SKIN[0], scale: .78, bold: true });
function makeWolf() { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ map: fabricTex("#8a8f98", { seam: false }), roughness: .9 }); const b = rbox(.9, .45, .4, .15, m); b.position.y = .5; g.add(b); const h = rbox(.36, .34, .34, .12, m); h.position.set(.55, .7, 0); g.add(h); const sn = rbox(.22, .14, .2, .06, m); sn.position.set(.78, .64, 0); g.add(sn);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(.07, .18, 4), m); e.position.set(.5, .95, s * .1); g.add(e); const ey = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), mat("#ffd23f", { emissive: "#aa7700" })); ey.position.set(.72, .76, s * .09); g.add(ey); }
  for (const [x, z] of [[-.3, -.12], [-.3, .12], [.3, -.12], [.3, .12]]) { const l = box(.1, .32, .1, m); l.position.set(x, .16, z); g.add(l); }
  const t = rbox(.4, .12, .12, .05, m); t.position.set(-.6, .62, 0); t.rotation.z = .5; g.add(t); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
function makeEagle() { const g = new THREE.Group(); const b = rbox(.24, .3, .2, .1, "#6b4423"); b.position.y = .15; g.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 10), mat("#f5f5f5")); h.position.set(0, .36, .03); g.add(h); const bk = new THREE.Mesh(new THREE.ConeGeometry(.04, .1, 6), mat("#ffbf00")); bk.rotation.x = Math.PI / 2; bk.position.set(0, .34, .14); g.add(bk);
  const wings = []; for (const s of [-1, 1]) { const w = rbox(.5, .04, .22, .02, "#6b4423"); const pv = new THREE.Group(); pv.position.set(s * .1, .22, 0); w.position.x = s * .25; pv.add(w); g.add(pv); wings.push(pv); } g.userData.wings = wings; return g; }
const wolfS = makeWolf(); sq.add(wolfS); const eagleS = makeEagle(); sq.add(eagleS);
const pebS = makeTurtle(); sq.add(pebS.g); pebS.g.scale.setScalar(1.2); const dragS = makeDragon(); sq.add(dragS.g);
const numWolf = NUM("70"), numEagle = NUM("80"), numPebS = NUM("1", false), numDragS = NUM("99"); sq.add(numWolf.sprite, numEagle.sprite, numPebS.sprite, numDragS.sprite);
const npcSq = townsfolk(sq, 14, [[-3, 3, 3, 3], [-4, 2, -4, 2.6], [4, 2, 4.4, 2.5], [-2, 4.2, -1.5, 4.6], [2, 4.4, 2.4, 4.2], [-5.5, 1, -5, 1.6], [5.5, 1.2, 5, 1.8], [-1, 5, -.4, 5.3], [1, 5.4, 1.5, 5], [-3.5, 4.6, -3, 5], [3.5, 4.8, 3, 5.2], [0, 6, .5, 6], [-4.5, 3.2, -4, 3.6], [4.5, 3.4, 4, 3.8]], 41);
const laughers = []; srand(12); for (let i = 0; i < 10; i++) { const a = -Math.PI * .1 + i / 9 * Math.PI * 1.2, R = 3 + (i % 2) * .9; const p = mk(sq, { shirt: SHIRTS[i % 9], pants: "#2b2d42", skin: SKIN[i % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i % 4], hairStyle: ["short", "long", "bun", "spiky"][i % 4], scale: .8, bold: true }); p.home = [Math.cos(a) * R, Math.sin(a) * R + 1]; laughers.push(p); }
const redSky = (() => { const c = document.createElement("canvas"); c.width = 16; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#4a0d0d"); gr.addColorStop(1, "#ff6a2a"); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

// ================= SET C: training field (sunrise) =================
const fl = baseScene({ sky: ["#ff8a5c", "#ffe0b0"], sun: 2.2, amb: .5 });
cineLights(fl, { key: "#ffb070", keyI: 2.6, rim: "#ffd9a0", rimI: 2.2, keyPos: [-8, 4, 6], rimPos: [6, 5, -10], hemiSky: "#ffd0b0", hemiGround: "#5a6a3a" });
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), texMat(sandTex("#7fa84a"), [30, 30])); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; fl.add(g);
  [[-7, -8], [7, -9], [-10, -2], [10, -3], [-4, -14], [5, -15], [-12, -10], [12, -12]].forEach(([x, z], i) => pine(fl, x, z, 1.1 + (i % 2) * .3, false));
  fence(fl, 0, -5, 12, 0, "#a8865a"); house(fl, -8, -12, { wall: "#c8b090", roof: "#6b4423" }); const sun = glowSprite("#ffe0a0", 9, .9); sun.position.set(-30, 6, -60); fl.add(sun); }
const heroF = mkHero(fl); const pebF = makeTurtle(); fl.add(pebF.g); pebF.g.scale.setScalar(1.2);
const boulder = new THREE.Mesh(new THREE.IcosahedronGeometry(.75, 1), texMat(sandTex("#8f8a80"), [1, 1], { flatShading: true })); boulder.castShadow = true; fl.add(boulder);
const pebble = new THREE.Mesh(new THREE.IcosahedronGeometry(.1, 1), texMat(sandTex("#8f8a80"), [1, 1], { flatShading: true })); pebble.castShadow = true; fl.add(pebble);
const dust = []; srand(4); for (let i = 0; i < 30; i++) { const d = glowSprite("#e8d2a8", .3, .5); d.material.blending = THREE.NormalBlending; d.userData = { a: rnd() * 6.28, v: .5 + rnd(), ph: rnd() }; fl.add(d); dust.push(d); }
const numPebF = NUM("1", false); fl.add(numPebF.sprite);

// ================= SET D: kitchen (night) =================
const kt = baseScene({ sky: ["#0b1030", "#1b2350"], sun: .15, amb: .25 });
cineLights(kt, { key: "#ffb05a", keyI: .4, rim: "#6a8cff", rimI: 1.2, keyPos: [2, 4, 3], rimPos: [-3, 3, -4], hemiSky: "#3a4a8a", hemiGround: "#2a1a10" });
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(7, 6), texMat(woodTex("#6a4a30"), [3, 3])); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; kt.add(f);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.4), texMat(stoneTex("#8a7a62"), [3, 2])); back.position.set(0, 1.7, -3); back.receiveShadow = true; kt.add(back);
  for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.4), texMat(stoneTex("#7a6a52"), [3, 2])); sd.position.set(s * 3.5, 1.7, 0); sd.rotation.y = -s * Math.PI / 2; kt.add(sd); }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .9), new THREE.MeshBasicMaterial({ color: "#1a2860" })); win.position.set(1.4, 2, -2.98); kt.add(win); const moon = glowSprite("#cfe0ff", .7, .8); moon.position.set(1.6, 2.15, -2.95); kt.add(moon);
  for (let i = 0; i < 2; i++) { const bar = box(1.1, .05, .05, "#3a2a1a"); bar.position.set(1.4, 1.55 + i * .9, -2.95); kt.add(bar); }
  const tb = new THREE.Mesh(new THREE.BoxGeometry(1.4, .08, .9), texMat(woodTex("#7a5a3a"), [1, 1])); tb.position.set(0, .9, -.7); tb.castShadow = tb.receiveShadow = true; kt.add(tb);
  for (const [x, z] of [[-.6, -.35], [.6, -.35], [-.6, .35], [.6, .35]]) { const l = box(.07, .9, .07, "#5a3a24"); l.position.set(x, .45, -.7 + z); kt.add(l); }
  chair(kt, -1.05, -.7, Math.PI / 2, .46, "#6b4423");
  const pt = new THREE.Mesh(new THREE.CylinderGeometry(.2, .17, .03, 20), mat("#d8d2c4")); pt.position.set(-.2, .95, -.7); kt.add(pt);
  const shelf = box(1.2, .05, .3, "#5a3a24"); shelf.position.set(-1.6, 2, -2.85); kt.add(shelf); const jar = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .25, 12), mat("#9fd3ff", { transparent: true, opacity: .5 })); jar.position.set(-1.8, 2.15, -2.8); kt.add(jar); const pot = new THREE.Mesh(new THREE.CylinderGeometry(.15, .12, .2, 14), mat("#555")); pot.position.set(-1.3, 2.12, -2.8); kt.add(pot); }
const candleL = new THREE.PointLight("#ffb05a", 3, 5); candleL.position.set(.58, 1.3, -1.0); kt.add(candleL); const flame = glowSprite("#ffb347", .35, 1); flame.position.set(.58, 1.17, -1.0); kt.add(flame);
const candle = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .2, 10), mat("#f3ead8")); candle.position.set(.58, 1.04, -1.0); kt.add(candle);
const bread = () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 10), mat("#c8893a", { roughness: .7 })); b.scale.set(1.4, .7, 1); g.add(b); for (let i = -1; i <= 1; i++) { const s = box(.02, .02, .18, "#e9c27a"); s.position.set(i * .08, .1, 0); s.rotation.y = .5; g.add(s); } return g; };
const breadL = bread(); breadL.position.set(-.25, 1.02, -.7); kt.add(breadL); const breadR = bread(); kt.add(breadR);
const heroK = mkHero(kt); const pebK = makeTurtle(); kt.add(pebK.g); const numPebK = NUM("1", false); kt.add(numPebK.sprite);

// ---------- post ----------
const post = makePost(renderer, ar, cam, { bloom: [.42, .4, .86] });

// ---------- shots ----------
const shots = []; const C = (p, l) => ({ p, l });
const shot = (t0, sc, from, to, update, o = {}) => shots.push({ t0, sc, from, to, update, focus: 4, ap: .003, shake: 0, ...o });
const lbl = (L, obj, dy, txt) => { L.sprite.visible = true; L.sprite.position.set(obj.position.x, obj.position.y + dy, obj.position.z); if (txt !== undefined) L.set(txt); };
function arenaBase(t, { open = 1, fire = 0, glow = 0, num = "1" } = {}) {
  crowdA.forEach((c, j) => pose(c, j % 4 ? "cheer" : "point", t + j * .3, .8)); confA(t + 1.5);
  pl(heroA, -.55, 2.75, Math.PI * .92); pose(heroA, "hold", t); heroA.arms[0].rotation.set(-1.1, 0, -.4); heroA.arms[1].rotation.set(-.4, 0, .9);
  pl(jaxA, -1.9, -2.0, .25); pose(jaxA, "idle", t);
  pl(saintA, 6, -4, -.9); pose(saintA, "idle", t);
  pebA.g.position.set(...PEB); pebA.g.rotation.y = Math.PI; pebA.setGlow(glow * (1 + .15 * Math.sin(t * 11)));
  domeA.position.set(PEB[0], 0, PEB[2]); domeA.userData.set(glow ? 1 + .08 * Math.sin(t * 13) : 0);
  dragA.g.position.set(...DRAG); dragA.anim(t, { flap: .7, open });
  const mouth = new THREE.Vector3(0, -.2, .95); dragA.head.localToWorld(mouth);
  fireA(t, [mouth.x, mouth.y, mouth.z], [PEB[0], .75, PEB[2] - .35], fire, 1.1); sparksA(t, [PEB[0], .5, PEB[2] - .2], fire, .55);
  const gold = num && num !== "1"; lbl(numPebA, pebA.g, 1.25, gold ? "1" : num); numPebA.sprite.visible = !gold && !!num; lbl(numGold, pebA.g, 1.25, gold ? num : "10"); numGold.sprite.visible = !!gold; lbl(numDragA, dragA.g, 4.5); shards.forEach(s => s.visible = false);
}
// HOOK – fire on the shield, 1 vs 99 in one image
shot(0, ar, C([2.3, 1.05, .5], [-.35, .85, 2.3]), C([2.0, .98, .85], [-.35, .85, 2.3]), (lt, t) => { arenaBase(t, { fire: 1, glow: 1 }); heroA.setExpr("angry"); numDragA.sprite.visible = false; }, { focus: 2.9, shake: .025 });
shot(1.3, ar, C([.3, 1.45, -.2], [-1.9, 1.25, -2.2]), C([.15, 1.4, -.55], [-1.9, 1.28, -2.2]), (lt, t) => { arenaBase(t, { fire: 1, glow: 1 }); pose(jaxA, "headhold", t); jaxA.setExpr("shock"); numPebA.sprite.visible = false; numDragA.sprite.visible = false; }, { focus: 2.4, shake: .012 });
// LOOP – a year ago the town laughed
shot(S.loop.start - .1, sq, C([.3, 1.7, 5.0], [0, 1.0, -.6]), C([.25, 1.55, 4.3], [0, 1.0, -.6]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, false); [jaxS, miaS, kidW, kidE, saintS].forEach(c => c.root.visible = false); wolfS.visible = eagleS.visible = dragS.g.visible = false; [numWolf, numEagle, numDragS].forEach(L => L.sprite.visible = false);
  pl(heroS, 0, 0, 0); pose(heroS, "hold", t); heroS.setExpr("sad"); pebS.g.visible = true; pebS.g.position.set(0, .62 * .78 + .02, .32); pebS.g.rotation.y = 0; pebS.setGlow(0); numPebS.sprite.visible = true; numPebS.sprite.position.set(.55, .85, .4); numPebS.set("1"); numPebS.sprite.scale.set(.7, .175, 1);
  laughers.forEach((p, i) => { const a = .12 * Math.PI + i / 9 * .76 * Math.PI, R = 2.1 + (i % 2) * .9; pl(p, Math.cos(a) * R, -Math.sin(a) * R * .8 - .3, 0); p.root.lookAt(0, 0, 0); pose(p, i % 2 ? "laugh" : "point", t + i); p.setExpr("laugh"); });
}, { focus: 3.6, ap: .004 });
// RULE – Saint gives animals, number appears
shot(S.rule.start - .1, sq, C([0, 3.2, 9], [0, 1.6, -2]), C([0, 2.6, 6.5], [0, 1.6, -2.4]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, true); laughers.forEach(p => p.root.visible = false); [heroS, jaxS, miaS, kidE].forEach(c => c.root.visible = false); pebS.g.visible = dragS.g.visible = eagleS.visible = false; [numPebS, numEagle, numDragS].forEach(L => L.sprite.visible = false);
  pl(saintS, 0, -3.1, 0, .6); pose(saintS, t > at("rule", "every", 2) ? "wave" : "idle", t); saintS.setExpr("smile");
  pl(kidW, -.3, -.6, 0, .6); pose(kidW, t > at("rule", "number", 4) ? "cheer" : "idle", t, .6); kidW.setExpr(t > at("rule", "number", 4) ? "laugh" : "smile");
  const kw = easeOut(clamp((t - at("rule", "animal", 3) + .3) / .6)); wolfS.visible = kw > 0; wolfS.position.set(.7, .6, -.4); wolfS.rotation.y = Math.PI * .85; wolfS.scale.setScalar(kw);
  const kn = back(clamp((t - at("rule", "number", 4)) / .4)); numWolf.sprite.visible = kn > 0; numWolf.sprite.position.set(.7, .6 + 1.5, -.4); numWolf.sprite.scale.set(1.1 * kn, .275 * kn, 1);
}, { focus: 7.5, ap: .002 });
shot(at("rule", "its", 5.4) - .15, sq, C([1.6, 1.6, 1.8], [.5, 1.4, -.5]), C([1.3, 1.6, 1.4], [.5, 1.5, -.5]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, false); laughers.forEach(p => p.root.visible = false); [heroS, jaxS, miaS, kidE, saintS].forEach(c => c.root.visible = false); pebS.g.visible = dragS.g.visible = eagleS.visible = false; [numPebS, numEagle, numDragS].forEach(L => L.sprite.visible = false);
  pl(kidW, -.3, -.6, .3, .6); pose(kidW, "cheer", t, .6); kidW.setExpr("laugh"); wolfS.visible = true; wolfS.scale.setScalar(1); wolfS.position.set(.7, .6, -.4); wolfS.rotation.y = Math.PI * .85;
  lbl(numWolf, wolfS, 1.5, "70"); numWolf.sprite.scale.set(1.1, .275, 1);
}, { focus: 2.4 });
// ME – eagles 80, my turtle 1
shot(at("me", "eagles", 1.5) - .1, sq, C([-2.2, 1.9, 2.8], [-.3, 1.5, -.4]), C([-1.9, 1.9, 2.4], [-.3, 1.55, -.4]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, false); laughers.forEach(p => p.root.visible = false); [heroS, jaxS, miaS, kidW, saintS].forEach(c => c.root.visible = false); pebS.g.visible = dragS.g.visible = wolfS.visible = false; [numPebS, numWolf, numDragS].forEach(L => L.sprite.visible = false);
  pl(kidE, .2, -.6, -.2, .6); pose(kidE, "point", t); kidE.setExpr("grin");
  const ke = easeOut(clamp(lt / .7)); eagleS.visible = true; eagleS.position.set(lerp(-2, -.5, ke), lerp(3, 1.75, ke), -.3); eagleS.userData.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * Math.sin(t * 14) * .8);
  lbl(numEagle, eagleS, .8, "80");
}, { focus: 2.2 });
shot(at("me", "my", 2.6) - .1, sq, C([.5, 1.0, 2.7], [0, .85, 0]), C([.4, .95, 2.2], [0, .85, 0]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, false); laughers.forEach(p => p.root.visible = false); [jaxS, miaS, kidW, kidE, saintS].forEach(c => c.root.visible = false); dragS.g.visible = wolfS.visible = eagleS.visible = false; [numWolf, numEagle, numDragS].forEach(L => L.sprite.visible = false);
  pl(heroS, 0, 0, 0); pose(heroS, "hold", t); heroS.setExpr(t > at("me", "one", 4) ? "shock" : "smile");
  pebS.g.visible = true; pebS.g.position.set(0, .62 * .78 + .02, .32); pebS.g.rotation.y = 0; pebS.setGlow(0);
  const kn = back(clamp((t - at("me", "one", 4)) / .35)); numPebS.sprite.visible = kn > 0; numPebS.sprite.position.set(.55, .85, .4); numPebS.set("1"); numPebS.sprite.scale.set(.8 * kn, .2 * kn, 1);
}, { focus: 2.3, ap: .005 });
// JAX – red sky, dragon lands, 99; Mia picks him
shot(S.jax.start - .1, sq, C([0, 3, 9.5], [0, 2.2, -1]), C([0, 2.6, 8], [0, 2.8, -1]), (lt, t) => {
  sq.background = redSky; npcSq(t, true); laughers.forEach(p => p.root.visible = false); [heroS, miaS, kidW, kidE, saintS].forEach(c => c.root.visible = false); pebS.g.visible = wolfS.visible = eagleS.visible = false; [numWolf, numEagle, numPebS].forEach(L => L.sprite.visible = false);
  pl(jaxS, 0, 1.6, 0); pose(jaxS, "cheer", t); jaxS.setExpr("laugh");
  const k = easeOut(clamp((lt + .3) / 1.0)); dragS.g.visible = true; dragS.g.position.set(0, lerp(9, 0, k), lerp(-6, -1.5, k)); dragS.anim(t, { flap: 1.4 - k * .8 });
  const kn = back(clamp((t - at("jax", "ninety", .8)) / .35)); numDragS.sprite.visible = kn > 0; numDragS.sprite.position.set(0, dragS.g.position.y + 4.0, -1.5); numDragS.set("99"); numDragS.sprite.scale.set(1.6 * kn, .4 * kn, 1);
}, { focus: 8.5, ap: .0015, shake: .01 });
shot(at("jax", "that", 1.9) - .1, sq, C([2.6, 3.6, 7.2], [0, 1.0, 1.6]), C([2.1, 3.2, 6.4], [0, 1.0, 1.6]), (lt, t) => {
  sq.background = redSky; npcSq(t, false); laughers.forEach(p => p.root.visible = false); [kidW, kidE, saintS].forEach(c => c.root.visible = false); wolfS.visible = eagleS.visible = false; [numWolf, numEagle].forEach(L => L.sprite.visible = false);
  pl(jaxS, -.6, 1.4, .5); pose(jaxS, "cheer", t, .5); jaxS.setExpr("laugh");
  dragS.g.visible = true; dragS.g.position.set(-2.6, 0, -1.6); dragS.anim(t, { flap: .3 }); lbl(numDragS, dragS.g, 4.6, "99"); numDragS.sprite.scale.set(1.1, .275, 1);
  const tM = at("jax", "mia", 2.8); pl(miaS, lerp(1.6, -.05, ease((t - tM + .5) / 1.0)), 1.6, -.6); pose(miaS, t > tM + .5 ? "idle" : "walk", t); miaS.setExpr("smile"); if (t > tM + .5) { miaS.arms[0].rotation.z = -.5; jaxS.arms[1].rotation.z = .5; }
  pl(heroS, 1.5, 3.3, -2.4); pose(heroS, "idle", t); heroS.setExpr("sad"); pebS.g.visible = true; pebS.g.position.set(1.1, 0, 3.6); pebS.g.rotation.y = -2.4; lbl(numPebS, pebS.g, .8, "1"); numPebS.sprite.scale.set(.7, .175, 1);
}, { focus: 5.5, ap: .002 });
// TRAIN – sunrise run, then push-ups with Pebble on the back
const pushUp = (t, rate, y0 = 0) => { const k = .5 + .5 * Math.sin(t * rate); const rot = lerp(1.1, 1.3, k);
  heroF.root.visible = true; heroF.root.position.set(0, y0, 0); heroF.root.rotation.set(rot, Math.PI / 2, 0, "YXZ"); pose(heroF, "idle", t); heroF.rig.position.y = 0; heroF.head.rotation.x = -.6;
  heroF.arms.forEach(a => a.rotation.set(-rot, 0, 0)); heroF.legs.forEach(l => l.rotation.set(0, 0, 0)); heroF.setExpr("angry");
  const v = new THREE.Vector3(0, .85, -.24); heroF.rig.localToWorld(v); pebF.g.visible = true; pebF.g.position.copy(v); pebF.g.rotation.set(0, Math.PI / 2, 0); pebF.g.rotateX(rot - Math.PI / 2); pebF.g.rotateX(-.0); };
function fieldBase(t) { boulder.visible = pebble.visible = false; dust.forEach(d => d.visible = false); numPebF.sprite.visible = false; pebF.setGlow(0); }
shot(S.train.start - .1, fl, C([1.2, 1.3, 4.4], [0, .6, 0]), C([1.0, 1.15, 3.7], [0, .55, 0]), (lt, t) => {
  fieldBase(t); const run = Math.sin(t * .9) * .4, dir = Math.cos(t * .9) > 0 ? Math.PI / 2 : -Math.PI / 2;
  pl(heroF, run, -.3, dir); pose(heroF, "walk", t * 1.6); heroF.setExpr("angry"); pebF.g.visible = true; pebF.g.position.set(run * .5 + .2, 0, .5); pebF.g.rotation.set(0, dir, 0); lbl(numPebF, pebF.g, .9, "1"); numPebF.sprite.scale.set(.7, .175, 1);
}, { focus: 3.6 });
shot(at("train", "push", 1.7) - .1, fl, C([.9, .75, 3.6], [.7, .4, 0]), C([.85, .7, 3.1], [.7, .4, 0]), (lt, t) => { fieldBase(t); pushUp(t, 5); }, { focus: 2.3 });
// HUSS 1 – one hard cut per "Huss"
const H1 = words("huss1").map(w => w.t0), H2 = words("huss2").map(w => w.t0);
const hussCams = [C([2.1, .3, .35], [.9, .4, 0]), C([.65, .5, 1.9], [.65, .35, 0]), C([1.9, .35, -.6], [1.0, .42, 0]), C([.3, 1.5, 1.1], [.6, .3, 0])];
H1.forEach((t0, i) => { const c = hussCams[i % 4]; shot(t0 - .04, fl, c, C([c.p[0] * .85, c.p[1], c.p[2] * .85], c.l), (lt, t) => { fieldBase(t); pushUp(t, 14); dust.forEach((d, j) => { const u = d.userData, k = (t * u.v + u.ph) % 1; d.visible = true; d.position.set(Math.cos(u.a) * (.3 + k), .05 + k * .3, Math.sin(u.a) * (.3 + k)); d.material.opacity = .5 * (1 - k); }); }, { focus: 1.2, ap: .006, shake: .03 }); });
// ROCKS – hero pushes boulder, Pebble pushes a pebble
shot(S.rocks.start - .1, fl, C([-.2, .95, 3.4], [-.35, .55, .2]), C([-.2, .9, 2.9], [-.35, .55, .2]), (lt, t) => {
  fieldBase(t); const x = lerp(-.4, .1, clamp(lt / 1.2));
  pl(heroF, x - .95, 0, Math.PI / 2); pose(heroF, "walk", t * 2.5, .6); heroF.rig.rotation.x = .45; heroF.arms.forEach(a => a.rotation.set(-1.9, 0, 0)); heroF.setExpr("angry");
  boulder.visible = true; boulder.position.set(x, .72, -.1); boulder.rotation.z = -x * 1.4;
  pebF.g.visible = true; pebF.g.position.set(x - .35, 0, .75); pebF.g.rotation.set(0, Math.PI / 2, 0); pebble.visible = true; pebble.position.set(x - .06, .1, .75); pebble.rotation.z = -x * 6;
}, { focus: 2.6 });
H2.forEach((t0, i) => { const last = i === H2.length - 1; const c = last ? C([.4, .35, 2.1], [-.12, .15, .75]) : hussCams[(i + 1) % 4];
  shot(t0 - .04, fl, c, C([c.p[0] * .85, c.p[1], c.p[2] * .85], c.l), (lt, t) => { fieldBase(t);
    if (last) { const x = .1; pl(heroF, x - .95, 0, Math.PI / 2); pose(heroF, "walk", t * 2.5, .6); heroF.rig.rotation.x = .45; heroF.arms.forEach(a => a.rotation.set(-1.9, 0, 0)); boulder.visible = true; boulder.position.set(x, .72, -.1);
      pebF.g.visible = true; pebF.g.position.set(-.25 + Math.sin(t * 20) * .02, 0, .75); pebF.g.rotation.set(0, Math.PI / 2, 0); pebF.head.position.z = .29 + Math.abs(Math.sin(t * 18)) * .03; pebble.visible = true; pebble.position.set(.04, .1, .75); }
    else pushUp(t, 16); }, { focus: last ? 1.6 : 1.2, ap: .006, shake: last ? .01 : .03 }); });
// BREAD – kitchen at night, number stays 1
shot(S.bread.start - .1, kt, C([1.0, 1.75, 2.6], [-.45, 1.0, -.7]), C([.8, 1.65, 2.1], [-.45, 1.0, -.7]), (lt, t) => {
  pl(heroK, -1.05, -.7, Math.PI / 2); pose(heroK, "idle", t); sitOn(heroK, .48); heroK.arms[1].rotation.set(-1.2, 0, 0);
  const tB = at("bread", "with", 1.2), k = clamp((t - tB) / .8); heroK.setExpr(k > .9 ? "smile" : "sad");
  breadL.visible = true; breadL.scale.set(1, 1, 1 - k * .5); breadR.visible = k > 0; breadR.scale.setScalar(.6); breadR.position.set(lerp(-.3, .22, k), lerp(1.08, .99, k), -.62);
  pebK.g.visible = true; pebK.g.position.set(.38, .94, -.65); pebK.g.rotation.y = -Math.PI / 2; pebK.setGlow(0); pebK.head.position.z = .29 + (k > .9 ? Math.abs(Math.sin(t * 7)) * .04 : 0);
  lbl(numPebK, pebK.g, .55, "1"); numPebK.sprite.scale.set(.6, .15, 1); candleL.intensity = 3 + Math.sin(t * 13) * .3; flame.scale.setScalar(.35 + Math.sin(t * 17) * .03);
}, { focus: 1.9, ap: .004 });
shot(at("bread", "the", 2), kt, C([.75, 1.2, .35], [.3, 1.0, -.55]), C([.65, 1.15, .2], [.3, 1.02, -.55]), (lt, t) => {
  pl(heroK, -1.05, -.7, Math.PI / 2); pose(heroK, "idle", t); sitOn(heroK, .48); heroK.setExpr("smile"); breadL.visible = true; breadL.scale.set(1, 1, .5); breadR.visible = true; breadR.position.set(.22, .99, -.62);
  pebK.g.visible = true; pebK.g.position.set(.38, .94, -.65); pebK.g.rotation.y = -Math.PI / 2; pebK.head.position.z = .29 + Math.abs(Math.sin(t * 7)) * .04;
  lbl(numPebK, pebK.g, .45, "1"); numPebK.sprite.scale.set(.5, .125, 1); candleL.intensity = 3 + Math.sin(t * 13) * .3;
}, { focus: 1.0, ap: .006 });
// FINAL – face-off, mouth opens
shot(S.final.start - .1, ar, C([0, 4.6, 12], [0, 1.4, 0]), C([.6, 2.4, 8], [0, 1.6, -1]), (lt, t) => { arenaBase(t, { open: clamp((t - at("final", "mouth", 4)) / .6) }); heroA.setExpr("angry"); jaxA.setExpr("grin"); pose(jaxA, "point", t); }, { focus: 9, ap: .0012 });
shot(at("final", "me", 1.6) - .1, ar, C([-1.0, 1.4, -.2], [-1.9, 1.25, -2.0]), C([-1.15, 1.4, -.6], [-1.9, 1.28, -2.0]), (lt, t) => { arenaBase(t, { open: 0 }); jaxA.setExpr("grin"); pose(jaxA, "point", t); numPebA.sprite.visible = false; }, { focus: 1.9 });
shot(at("final", "his", 3.2) - .1, ar, C([3.1, 3.0, 1.6], [0, 2.6, -1.0]), C([2.8, 3.0, 1.2], [0, 2.65, -1.0]), (lt, t) => { arenaBase(t, { open: clamp((t - at("final", "mouth", 4)) / .6) }); numPebA.sprite.visible = false; numDragA.sprite.visible = false; }, { focus: 4, shake: .01 });
// TWIST – fire hits, number climbs, breaks
const tTen = at("twist", "ten", 2.4), tFive = at("twist", "five", 3), tNine = at("twist", "nine", 4), tBroke = at("twist", "broke", 5.6);
const twistNum = (t) => t > tNine ? "9000" : t > tFive ? "500" : t > tTen ? "10" : "1";
shot(S.twist.start - .1, ar, C([2.3, 1.05, .5], [-.35, .85, 2.3]), C([2.0, .98, .85], [-.35, .85, 2.3]), (lt, t) => { arenaBase(t, { fire: 1, glow: clamp(lt / .6), num: twistNum(t) }); heroA.setExpr("angry"); numDragA.sprite.visible = false; }, { focus: 2.9, shake: .025 });
shot(tTen - .1, ar, C([.9, 1.4, 4.6], [0, 1.4, 2]), C([.7, 1.5, 4.1], [0, 1.6, 2]), (lt, t) => {
  arenaBase(t, { fire: 1, glow: 1, num: twistNum(t) }); heroA.setExpr("shock"); numDragA.sprite.visible = false;
  const pop = t > tTen ? 1 + .25 * Math.max(0, 1 - ((t - [tTen, tFive, tNine].filter(x => x <= t).pop()) / .25)) : 1; numGold.sprite.scale.set(1.3 * pop, .325 * pop, 1);
}, { focus: 2.6, shake: .015 });
shot(tBroke - .15, ar, C([.6, 1.5, 4.4], [0, 1.4, 2]), C([.3, 2.2, 6.5], [0, 1.4, 1.5]), (lt, t) => {
  arenaBase(t, { fire: t < tBroke + .4 ? 1 : 0, glow: 1.3, num: "9000" }); heroA.setExpr("grin"); numDragA.sprite.visible = false; numGold.sprite.visible = t < tBroke;
  const k = clamp((t - tBroke) / 1.2); shards.forEach(s => { const u = s.userData; s.visible = t >= tBroke && k < 1; s.position.set(u.d[0] * k * 2.2, 1.3 + u.d[1] * k * 2 - k * k * 1.2, PEB[2] + u.d[2] * k * 2.2); s.rotation.set(u.r * k, u.r * k * .7, 0); s.material.opacity = 1 - k; s.material.transparent = true; });
  jaxA.setExpr("shock"); pose(jaxA, "headhold", t);
}, { focus: 4.5, ap: .002, shake: .03 });
// SAINT – the number showed love
shot(S.saint.start - .1, ar, C([3.6, 2.0, -1.0], [6, 1.8, -4]), C([3.9, 2.0, -1.4], [6, 1.85, -4]), (lt, t) => { arenaBase(t, { glow: 1, num: "" }); numPebA.sprite.visible = numDragA.sprite.visible = numGold.sprite.visible = false; saintA.setExpr("smile"); saintA.root.lookAt(0, 0, 2); }, { focus: 3.8 });
shot(at("saint", "it", 3) - .1, ar, C([.5, 1.05, 4.9], [-.3, .85, 2.6]), C([.4, 1.0, 4.4], [-.3, .85, 2.6]), (lt, t) => {
  arenaBase(t, { glow: .8, num: "" }); numPebA.sprite.visible = numDragA.sprite.visible = numGold.sprite.visible = false; pl(heroA, -.35, 2.55, .25); pose(heroA, "hold", t); heroA.setExpr("closed");
  pebA.g.position.set(-.27, .5, 2.87); pebA.g.rotation.y = .25; pebA.g.scale.setScalar(1); domeA.userData.set(0);
}, { focus: 2.1, ap: .005 });
// CTA – wide celebration
shot(S.cta.start - .15, ar, C([2.4, 2.0, 7.0], [-.4, 1.1, -.3]), C([3.0, 3.2, 9.2], [-.4, 1.4, -.5]), (lt, t) => {
  arenaBase(t, { glow: 1, num: "" }); numPebA.sprite.visible = numDragA.sprite.visible = numGold.sprite.visible = false; pose(heroA, "cheer", t); heroA.setExpr("laugh"); jaxA.setExpr("sad");
}, { focus: 8, ap: .0012 });
shots.sort((a, b) => a.t0 - b.t0);

const allChars = [heroA, jaxA, saintA, heroS, jaxS, miaS, kidW, kidE, saintS, heroF, heroK, ...laughers];
function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : TOTAL, k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k)); cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k)); shake(cam, t, s.shake);
  allChars.forEach(c => { c.root.rotation.x = 0; c.root.rotation.z = 0; });
  pebA.g.scale.setScalar(1.3); pebA.head.position.z = .29; pebF.head.position.z = .29;
  s.update(t - s.t0, t);
  post.render(s.sc, s.focus, s.ap);
}

// ---------- overlays ----------
const KEY = new Set(["dragon", "turtle", "laughed", "number", "power", "seventy", "eighty", "one", "ninetynine", "mia", "pebble", "bread", "final", "ten", "five", "hundred", "nine", "thousand", "broke", "loved", "saint"]);
const capsEl = document.getElementById("caps"); const tl = gsap.timeline({ paused: true });
const inHuss = (x) => (x >= S.huss1.start - .1 && x <= S.huss1.end + .1) || (x >= S.huss2.start - .1 && x <= S.huss2.end + .1);
let prev = null;
CAPS.forEach(c => { if (inHuss(c.t0) || c.t0 < S.hook.end) return;
  const d = document.createElement("div"); d.className = "cap"; d.innerHTML = c.text.split(" ").map(w => KEY.has(norm(w)) ? `<span class="hk">${w}</span>` : w).join(" "); capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0); tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0); tl.set(d, { opacity: 0 }, Math.min(c.t1, inHuss(c.t1) ? S.huss1.start : c.t1));
  if (prev) tl.set(prev, { opacity: 0 }, c.t0); prev = d; });
const root = document.getElementById("root");
[...H1, ...H2].forEach((t0, i) => { const last = i === H1.length + H2.length - 1; const d = document.createElement("div"); d.className = "huss" + (last ? " small" : ""); d.textContent = last ? "huss!" : "HUSS!"; root.appendChild(d);
  const rot = [-6, 5, -3, 7, -5, 4, -2][i % 7];
  tl.fromTo(d, { opacity: 1, scale: 1.7, rotation: rot }, { opacity: 1, scale: 1, rotation: rot, duration: .12, ease: "back.out(3)", immediateRender: false }, t0); tl.set(d, { opacity: 0 }, t0 + .24);
  tl.fromTo("#flash", { opacity: .35 }, { opacity: 0, duration: .12, immediateRender: false }, t0);
  tl.fromTo("#speed", { opacity: .8 }, { opacity: 0, duration: .25, immediateRender: false }, t0); });
tl.fromTo("#hook", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: .2, ease: "back.out(2.5)", immediateRender: false }, 0); tl.set("#hook", { opacity: 0 }, S.hook.end + .15);
tl.fromTo("#speed", { opacity: .8 }, { opacity: .3, duration: 1.3, immediateRender: false }, 0); tl.set("#speed", { opacity: 0 }, 1.3);
[S.twist.start, tBroke].forEach(x => tl.fromTo("#flash", { opacity: .6 }, { opacity: 0, duration: .25, immediateRender: false }, x));
tl.fromTo("#speed", { opacity: .7 }, { opacity: 0, duration: 1.2, immediateRender: false }, tBroke);
tl.fromTo("#q", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2.5)", immediateRender: false }, S.cta.start);
tl.fromTo("#follow", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)", immediateRender: false }, S.cta.end + .2);
const clock = { t: 0 }; tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; tl.seek(0); draw(0);
