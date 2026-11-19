// "Pebble" Part 1 – original story by the channel owner, built in code with original characters.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, canvasTex, textPlane,
  makeChar, pose, makeLabel, baseScene, ground, room, house, tree, sign, skyTex,
  chair, sitOn, pine, streetlamp, fence, bench, chimneySmoke, townsfolk, decorateLivingRoom,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";

const S = window.SEG, WORDS = window.WORDS, CAPS = window.CAPS;
const at = (seg, w, fb = 0) => { const s = S[seg]; const x = WORDS.find(q => q.t0 >= s.start - .05 && q.t0 <= s.end + .05 && q.w.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase())); return x ? x.t0 : s.start + fb; };
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const cam = new THREE.PerspectiveCamera(50, W / H, .1, 300);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];

// ---------- creatures ----------
function makeTurtle() {
  const g = new THREE.Group();
  const shellTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#5f8f3a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#3b5f22"; c.lineWidth = 10;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = x * 70 + (y % 2) * 35, cy = y * 62; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34); } c.closePath(); c.stroke(); } });
  const glowMat = new THREE.MeshStandardMaterial({ map: shellTex, color: "#ffffff", roughness: .6, emissive: "#3fffe0", emissiveMap: shellTex, emissiveIntensity: 0 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glowMat); shell.scale.set(1, .75, 1.15); shell.position.y = .06; shell.castShadow = true; g.add(shell);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.225, .225, .04, 24), mat("#c8b070")); rim.scale.z = 1.15; rim.position.y = .06; g.add(rim);
  const head = new THREE.Group(); head.position.set(0, .09, .28); g.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.075, 16, 12), mat("#8fbf5a")); hd.scale.set(1, .9, 1.2); head.add(hd);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 8), mat("#ffffff")); e.position.set(s * .04, .03, .06); head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), mat("#111")); p.position.set(s * .042, .032, .078); head.add(p); }
  const legs = []; for (const [x, z] of [[-.16, .14], [.16, .14], [-.16, -.14], [.16, -.14]]) { const l = rbox(.07, .07, .09, .03, "#8fbf5a"); l.position.set(x, .03, z); g.add(l); legs.push(l); }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.03, .08, 8), mat("#8fbf5a")); tail.rotation.x = -Math.PI / 2; tail.position.set(0, .05, -.28); g.add(tail);
  const light = new THREE.PointLight("#3fffe0", 0, 4); light.position.y = .4; g.add(light);
  return { g, head, legs, glowMat, light, setGlow(k, col = "#3fffe0") { glowMat.emissive.set(col); light.color.set(col); glowMat.emissiveIntensity = k * 2.2; light.intensity = k * 14; } };
}
function makeDragon() {
  const g = new THREE.Group(); const red = mat("#c0392b", { roughness: .55 }), belly = mat("#f0a35a"), dark = mat("#7a1f17");
  const body = rbox(1.1, 1.0, 2.2, .45, red); body.position.y = 1.2; g.add(body);
  const bl = rbox(.8, .5, 1.6, .25, belly); bl.position.set(0, .95, .1); g.add(bl);
  const neck = []; let prev = new THREE.Vector3(0, 1.5, .9);
  for (let i = 0; i < 4; i++) { const n = rbox(.5 - i * .05, .5 - i * .05, .5, .2, red); n.position.set(0, 1.6 + i * .32, 1.05 + i * .22); g.add(n); neck.push(n); }
  const head = new THREE.Group(); head.position.set(0, 2.85, 2.0); g.add(head);
  const skull = rbox(.7, .55, .8, .22, red); head.add(skull);
  const snout = rbox(.55, .3, .55, .14, red); snout.position.set(0, -.05, .55); head.add(snout);
  const jaw = new THREE.Group(); jaw.position.set(0, -.2, .15); head.add(jaw); const j = rbox(.5, .14, .75, .07, dark); j.position.set(0, -.04, .35); jaw.add(j);
  const mouthGlow = new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 8), new THREE.MeshStandardMaterial({ color: "#ffb347", emissive: "#ff7a1a", emissiveIntensity: 0 })); mouthGlow.position.set(0, -.14, .55); head.add(mouthGlow);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(.08, .45, 8), mat("#f3e6c8")); h.position.set(s * .22, .4, -.2); h.rotation.x = -.6; head.add(h);
    const e = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshStandardMaterial({ color: "#ffe066", emissive: "#ffb000", emissiveIntensity: .8 })); e.position.set(s * .25, .12, .3); head.add(e); }
  const wings = []; for (const s of [-1, 1]) { const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(2.2, .9); shape.lineTo(2.0, -.2); shape.lineTo(1.4, -.5); shape.lineTo(.8, -.3); shape.lineTo(0, -.6);
    const w = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: "#8e2a20", side: THREE.DoubleSide, roughness: .7 })); const pv = new THREE.Group(); pv.position.set(s * .5, 1.6, .2); w.scale.x = s; w.rotation.x = -Math.PI / 2; pv.add(w); g.add(pv); wings.push(pv); }
  const tail = []; for (let i = 0; i < 6; i++) { const t = rbox(.4 - i * .055, .35 - i * .045, .5, .14, red); t.position.set(0, 1.1 - i * .12, -1.3 - i * .42); g.add(t); tail.push(t); }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.18, .4, 4), dark); tip.rotation.x = -Math.PI / 2; tip.position.set(0, .4, -3.9); g.add(tip);
  for (const [x, z] of [[-.45, .7], [.45, .7], [-.45, -.6], [.45, -.6]]) { const l = rbox(.3, .8, .35, .12, red); l.position.set(x, .4, z); g.add(l); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const fire = []; for (let i = 0; i < 40; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshBasicMaterial({ color: i % 3 ? "#ff8c1a" : "#ffe066", transparent: true, opacity: .9, depthWrite: false })); f.visible = false; g.add(f); fire.push(f); }
  const fireL = new THREE.PointLight("#ff7a1a", 0, 12); fireL.position.set(0, 2.6, 3); g.add(fireL);
  return { g, head, jaw, wings, tail, mouthGlow, fire, fireL,
    anim(t, { flap = 1, open = 0, breath = 0 } = {}) {
      wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (.25 + Math.sin(t * 6) * .45 * flap); });
      tail.forEach((s, i) => s.position.x = Math.sin(t * 2 - i * .6) * .12 * i);
      head.rotation.x = -.1 + Math.sin(t * 1.5) * .05; jaw.rotation.x = open * .6; mouthGlow.material.emissiveIntensity = open * 2.5;
      fire.forEach((f, i) => { const k = ((t * 1.4 + i / 40) % 1); f.visible = breath > 0; f.position.set(Math.sin(i * 7) * .4 * k, 2.6 - k * 1.9, 2.6 + k * 5 * breath); f.scale.setScalar(.6 + k * 2.2); f.material.opacity = .9 * (1 - k); });
      fireL.intensity = breath * 30 + open * 6;
    } };
}
function makeWolf() { const g = new THREE.Group(); const m = mat("#8a8f98"); const b = rbox(.9, .45, .4, .15, m); b.position.y = .5; g.add(b); const h = rbox(.36, .34, .34, .12, m); h.position.set(.55, .7, 0); g.add(h); const sn = rbox(.22, .14, .2, .06, m); sn.position.set(.78, .64, 0); g.add(sn);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(.07, .18, 4), m); e.position.set(.5, .95, s * .1); g.add(e); } for (const [x, z] of [[-.3, -.12], [-.3, .12], [.3, -.12], [.3, .12]]) { const l = box(.1, .32, .1, m); l.position.set(x, .16, z); g.add(l); }
  const t = rbox(.4, .12, .12, .05, m); t.position.set(-.6, .62, 0); t.rotation.z = .5; g.add(t); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
function makeEagle() { const g = new THREE.Group(); const b = rbox(.24, .3, .2, .1, "#6b4423"); b.position.y = .15; g.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 10), mat("#f5f5f5")); h.position.set(0, .36, .03); g.add(h); const bk = new THREE.Mesh(new THREE.ConeGeometry(.04, .1, 6), mat("#ffbf00")); bk.rotation.x = Math.PI / 2; bk.position.set(0, .34, .14); g.add(bk);
  const wings = []; for (const s of [-1, 1]) { const w = rbox(.5, .04, .22, .02, "#6b4423"); const pv = new THREE.Group(); pv.position.set(s * .1, .22, 0); w.position.x = s * .25; pv.add(w); g.add(pv); wings.push(pv); } g.userData.wings = wings; return g; }
function makeSaint() { const c = makeChar({ shirt: "#efe6d2", pants: "#efe6d2", hair: "#e6e6e6", hairStyle: "long", skin: "#e8c9a8", beard: true, scale: 1.05 });
  const robe = rbox(.75, 1.0, .5, .2, "#e9dfc6"); robe.position.y = .45; c.rig.add(robe); const hood = rbox(.92, .5, .82, .2, "#c9b98f"); hood.position.set(0, .82, -.06); c.head.add(hood);
  const staff = new THREE.Group(); const st = box(.07, 2.2, .07, "#7a5230"); st.position.y = 1.1; staff.add(st); const orb = new THREE.Mesh(new THREE.SphereGeometry(.16, 18, 14), new THREE.MeshStandardMaterial({ color: "#fff6c0", emissive: "#ffe9a0", emissiveIntensity: 1.6 })); orb.position.y = 2.3; staff.add(orb);
  const ol = new THREE.PointLight("#ffe9a0", 6, 6); ol.position.y = 2.3; staff.add(ol); c.staff = staff; c.orb = orb; c.orbL = ol; return c; }
const bread = () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 10), mat("#c8893a")); b.scale.set(1.4, .7, 1); g.add(b); for (let i = -1; i <= 1; i++) { const s = box(.02, .02, .18, "#e9c27a"); s.position.set(i * .08, .1, 0); s.rotation.y = .5; g.add(s); } return g; };

// ---------- shared cast ----------
const HERO = { shirt: "#7a8a6a", pants: "#4a3a2a", hair: "#5a3a1a", hairStyle: "spiky", skin: "#f2c9a0", scale: .78 };
const JAX = { shirt: "#c0392b", pants: "#1f2937", hair: "#e3c04b", hairStyle: "spiky", skin: "#f7d7b8", scale: .82 };
const MIA = { shirt: "#8e6bd8", pants: "#2b2d42", hair: "#2a1d14", hairStyle: "long", skin: "#c98f63", scale: .76 };
const patch = (ch) => { const p = rbox(.16, .14, .02, .02, "#a0522d"); p.position.set(.12, .7, .19); ch.rig.add(p); };
const scarfC = (ch, col) => { const s = rbox(.6, .14, .42, .06, col); s.position.set(0, 1.04, 0); ch.rig.add(s); };

// ============ SET A: arena ============
const arena = baseScene({ sky: ["#4a6fd0", "#ffd9a8"], sun: 1.3, amb: .8 });
ground(arena, "#6a8a4a", 160);
const sand = new THREE.Mesh(new THREE.CircleGeometry(11, 64), mat("#e2c48d")); sand.rotation.x = -Math.PI / 2; sand.position.y = .02; sand.receiveShadow = true; arena.add(sand);
const ring = new THREE.Mesh(new THREE.TorusGeometry(11, .25, 8, 64), mat("#8a5a36")); ring.rotation.x = Math.PI / 2; ring.position.y = .3; arena.add(ring);
for (let r = 0; r < 4; r++) { const st = new THREE.Mesh(new THREE.CylinderGeometry(12.2 + r * 1.6, 12.2 + r * 1.6, .9, 64, 1, true), new THREE.MeshStandardMaterial({ color: ["#9a7a5a", "#8a6a4a", "#9a7a5a", "#8a6a4a"][r], side: THREE.DoubleSide })); st.position.y = .45 + r * .9; arena.add(st);
  const top = new THREE.Mesh(new THREE.RingGeometry(12.2 + r * 1.6, 13.8 + r * 1.6, 64), mat("#b08a62", { side: THREE.DoubleSide })); top.rotation.x = -Math.PI / 2; top.position.y = .9 + r * .9; arena.add(top); }
const crowdA = []; srand(31);
for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2; if (Math.abs(Math.sin(a)) < .2 && Math.cos(a) > 0) continue; const r = Math.floor(rnd() * 3); const R = 13 + r * 1.6;
  const p = makeChar({ shirt: ["#ff7b54", "#6c63ff", "#2ec4b6", "#ffbe0b", "#ef476f", "#06d6a0", "#118ab2"][i % 7], skin: SKIN[i % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i % 4], hairStyle: ["short", "long", "bun", "spiky"][i % 4], scale: .8 });
  p.root.position.set(Math.cos(a) * R, .9 + r * .9, Math.sin(a) * R); p.root.lookAt(0, .9 + r * .9, 0); arena.add(p.root); crowdA.push(p); }
for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2; const pole = box(.12, 5, .12, "#5a3a1a"); pole.position.set(Math.cos(a) * 11.6, 2.5, Math.sin(a) * 11.6); arena.add(pole);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1, .7), mat(["#c0392b", "#2f5fa0", "#f1c40f", "#27ae60"][i % 4], { side: THREE.DoubleSide })); fl.position.set(Math.cos(a) * 11.6 + .5, 4.6, Math.sin(a) * 11.6); arena.add(fl);
  const torch = new THREE.Mesh(new THREE.ConeGeometry(.18, .4, 8), new THREE.MeshStandardMaterial({ color: "#ffb347", emissive: "#ff7a1a", emissiveIntensity: 2 })); torch.position.set(Math.cos(a) * 11.6, 5.2, Math.sin(a) * 11.6); arena.add(torch); }
const heroA = makeChar(HERO); patch(heroA); scarfC(heroA, "#2f5fa0"); arena.add(heroA.root);
const jaxA = makeChar(JAX); arena.add(jaxA.root);
const pebA = makeTurtle(); arena.add(pebA.g); const dragA = makeDragon(); arena.add(dragA.g);
const wolfA = makeWolf(); arena.add(wolfA); const oppA = makeChar({ shirt: "#555", pants: "#222", hair: "#111", scale: .8 }); arena.add(oppA.root);
const sparks = []; srand(9); for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 4), new THREE.MeshBasicMaterial({ color: "#3fffe0" })); s.userData = { a: rnd() * 6.28, r: .3 + rnd() * .5, v: .5 + rnd() }; arena.add(s); sparks.push(s); }

// ============ SET B: town square ceremony ============
const sq = baseScene({ sky: ["#5fb4ff", "#e2f4ff"], sun: 1.3, amb: .9 });
const SKYSQ = { day: skyTex("#5fb4ff", "#e2f4ff"), red: skyTex("#5a0d0d", "#ff5a2a") };
ground(sq, "#86c95f", 120);
const plaza = new THREE.Mesh(new THREE.CircleGeometry(9, 48), mat("#d9cbb3")); plaza.rotation.x = -Math.PI / 2; plaza.position.y = .015; plaza.receiveShadow = true; sq.add(plaza);
const stage = rbox(5, .6, 3, .05, "#8b5a2b"); stage.position.set(0, .3, -3); sq.add(stage);
const steps = box(1.6, .3, .6, "#7a4a22"); steps.position.set(0, .15, -1.3); sq.add(steps);
const arch = new THREE.Mesh(new THREE.TorusGeometry(2, .15, 10, 36, Math.PI), mat("#f1d38a")); arch.position.set(0, .6, -4.2); sq.add(arch);
const smokesSq = [];
[[-8, -6, "#f6d5b2", "#d0573f", .6], [8, -6, "#cfe3f7", "#4a6fa5", -.6], [-10, 2, "#efe0ff", "#6a4aa5", 1.4], [10, 2, "#d8f0d0", "#3d7a4a", -1.4], [0, -11, "#f2e2a2", "#8d5a3b", 0]].forEach(([x, z, w_, r_, ry]) => { const h = house(sq, x, z, { wall: w_, roof: r_, ry }); smokesSq.push(chimneySmoke(sq, h, .7, -.4, 3.4)); });
[[-5, -9], [5, -9], [-12, -4], [12, -4]].forEach(([x, z]) => tree(sq, x, z, 1.2)); [[-6.5, 4], [6.5, 4]].forEach(([x, z]) => streetlamp(sq, x, z));
const banner = sign("ANIMAL DAY", { w: 3.4, h: .7, bg: "#2f5fa0", fg: "#ffffff", size: 130 }); banner.position.set(0, 3.2, -4.3); sq.add(banner);
const saint = makeSaint(); saint.root.position.set(0, .6, -3.3); sq.add(saint.root); saint.staff.position.set(.55, .6, -3.1); sq.add(saint.staff);
const heroS = makeChar(HERO); patch(heroS); scarfC(heroS, "#2f5fa0"); sq.add(heroS.root);
const jaxS = makeChar(JAX); sq.add(jaxS.root); const miaS = makeChar(MIA); sq.add(miaS.root);
const kidW = makeChar({ shirt: "#555", pants: "#222", hair: "#111", hairStyle: "short", skin: SKIN[2], scale: .8 }); sq.add(kidW.root);
const kidE = makeChar({ shirt: "#2ec4b6", pants: "#2b2d42", hair: "#e3b04b", hairStyle: "bun", skin: SKIN[0], scale: .78 }); sq.add(kidE.root);
const wolfS = makeWolf(); sq.add(wolfS); const eagleS = makeEagle(); sq.add(eagleS);
const pebS = makeTurtle(); sq.add(pebS.g); const dragS = makeDragon(); sq.add(dragS.g);
const npcSq = townsfolk(sq, 12, [[-3, 3, 3, 3], [-4, 2, -4, 2.6], [4, 2, 4.4, 2.5], [-2, 4.2, -1.5, 4.6], [2, 4.4, 2.4, 4.2], [-5.5, 1, -5, 1.6], [5.5, 1.2, 5, 1.8], [-1, 5, -.4, 5.3], [1, 5.4, 1.5, 5], [-3.5, 4.6, -3, 5], [3.5, 4.8, 3, 5.2], [0, 6, .5, 6]], 41);

// ============ SET C: poor kitchen + bedroom ============
const kit = baseScene({ sky: ["#0b1030", "#1b2350"], sun: .2, amb: .35 });
room(kit, { w: 7, d: 6, h: 3.4, wall: "#8a7a62", floor: "#5a4636" });
const winK = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: "#16204a" })); winK.position.set(1.6, 2, -2.88); kit.add(winK);
const candle = new THREE.Group(); candle.position.set(.4, .95, -.7); kit.add(candle); { const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .2, 10), mat("#f3ead8")); c.position.y = .1; candle.add(c); const f = new THREE.Mesh(new THREE.ConeGeometry(.03, .08, 8), new THREE.MeshStandardMaterial({ color: "#ffd27a", emissive: "#ff9a3a", emissiveIntensity: 2 })); f.position.y = .24; candle.add(f); }
const candleL = new THREE.PointLight("#ffb05a", 5, 5); candleL.position.set(.4, 1.4, -.5); kit.add(candleL);
const tbl = rbox(1.4, .08, .9, .03, "#7a5a3a"); tbl.position.set(0, .9, -.7); kit.add(tbl); for (const [x, z] of [[-.6, -.35], [.6, -.35], [-.6, .35], [.6, .35]]) { const l = box(.07, .9, .07, "#5a3a24"); l.position.set(x, .45, -.7 + z); kit.add(l); }
chair(kit, -1.05, -.7, Math.PI / 2, .46, "#6b4423");
const plate = new THREE.Mesh(new THREE.CylinderGeometry(.2, .17, .03, 20), mat("#d8d2c4")); plate.position.set(-.2, .95, -.7); kit.add(plate);
const breadL = bread(); breadL.position.set(-.25, 1.02, -.7); kit.add(breadL); const breadR = bread(); breadR.scale.setScalar(.55); kit.add(breadR);
const crack = box(.5, .02, .02, "#3a2a1a"); crack.position.set(-1.6, 2.6, -2.89); kit.add(crack);
const heroK = makeChar(HERO); patch(heroK); kit.add(heroK.root); const pebK = makeTurtle(); kit.add(pebK.g);
const bedG = new THREE.Group(); bedG.position.set(-1.6, 0, 1.4); kit.add(bedG); { const f = rbox(1.1, .4, 2, .06, "#6b4423"); f.position.y = .25; bedG.add(f); const mt = rbox(1, .2, 1.9, .08, "#9a9080"); mt.position.y = .5; bedG.add(mt); const bl = rbox(1, .12, 1.2, .08, "#5a6a8a"); bl.position.set(0, .64, .3); bedG.add(bl); const pl = rbox(.6, .14, .35, .07, "#d8d2c4"); pl.position.set(0, .68, -.7); bedG.add(pl); }

// ============ SET D: training field ============
const fld = baseScene({ sky: ["#ffb98a", "#ffe6c8"], sun: 1.2, amb: .9 });
const SKYF = { sunrise: skyTex("#ff9a6a", "#ffe0b0"), rain: skyTex("#5a6470", "#9aa4ae"), snow: skyTex("#b8c6d6", "#eef3f8") };
const fldGround = ground(fld, "#7fb04a", 120);
[[-7, -8], [7, -9], [-10, -2], [10, -3], [-4, -14], [5, -15]].forEach(([x, z], i) => pine(fld, x, z, 1.1 + (i % 2) * .3, false));
fence(fld, 0, -5, 10, 0, "#a8865a"); house(fld, -8, -12, { wall: "#c8b090", roof: "#6b4423" });
const heroF = makeChar(HERO); patch(heroF); scarfC(heroF, "#2f5fa0"); fld.add(heroF.root); const pebF = makeTurtle(); fld.add(pebF.g);
const log = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 1, 16), mat("#7a5230")); log.rotation.z = Math.PI / 2; log.castShadow = true; fld.add(log);
const rain = []; srand(5); for (let i = 0; i < 260; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.015, .35, .015), new THREE.MeshBasicMaterial({ color: "#c8d8ea", transparent: true, opacity: .6 })); r.userData = { x: (rnd() - .5) * 14, z: (rnd() - .5) * 10, y: rnd() * 8, v: 9 + rnd() * 4 }; fld.add(r); rain.push(r); }
const snow = []; for (let i = 0; i < 220; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.035, 5, 4), new THREE.MeshBasicMaterial({ color: "#ffffff" })); s.userData = { x: (rnd() - .5) * 14, z: (rnd() - .5) * 10, y: rnd() * 8, v: .6 + rnd() * .5, p: rnd() * 6 }; fld.add(s); snow.push(s); }

// ---------- helpers ----------
const pl = (c, x, z, ry = 0, y = 0) => { c.root.visible = true; c.root.position.set(x, y, z); c.root.rotation.y = ry; };
const turtleAt = (tt, x, z, ry, t, walk = false, y = 0) => { tt.g.visible = true; tt.g.position.set(x, y, z); tt.g.rotation.y = ry; tt.head.position.z = .28 + Math.sin(t * 2) * .015; tt.legs.forEach((l, i) => l.position.y = .03 + (walk ? Math.max(0, Math.sin(t * 8 + i * 1.6)) * .02 : 0)); };
let curF = "";
function fieldMood(m) { if (curF === m) return; curF = m; fld.background = SKYF[m]; fldGround.material = mat(m === "snow" ? "#eef3f8" : m === "rain" ? "#5f8a3a" : "#7fb04a");
  fld.userData.dl.intensity = m === "sunrise" ? 1.3 : .6; fld.userData.dl.color.set(m === "sunrise" ? "#ffc89a" : "#dfe6ee"); fld.userData.hemi.intensity = m === "sunrise" ? .9 : .75; fld.fog = m === "rain" ? new THREE.Fog("#7a848e", 8, 30) : null; }

// ---------- shots ----------
const shots = []; const shot = (t0, sc, from, to, update) => shots.push({ t0, sc, from, to, update }); const C = (p, l) => ({ p, l });
const arenaFaceoff = (t, open = 0, glow = 0) => {
  crowdA.forEach((c, i) => pose(c, i % 3 ? "cheer" : "idle", t, .6));
  pl(heroA, 0, 4, Math.PI); pose(heroA, "idle", t); turtleAt(pebA, 0, 2.7, Math.PI, t);
  pl(jaxA, -1.6, -4.2, 0); pose(jaxA, "idle", t); jaxA.setExpr("grin");
  dragA.g.visible = true; dragA.g.position.set(0, 0, -4.8); dragA.g.rotation.y = 0; dragA.anim(t, { flap: .6, open }); pebA.setGlow(glow);
  oppA.root.visible = false; wolfA.visible = false; sparks.forEach(s => s.visible = false);
};
// hook: flash-forward to the final (strongest image + contrast in one frame)
shot(0, arena, C([.32, .55, 4.4], [0, 1.3, -4.8]), C([.28, .5, 4.0], [0, 1.5, -4.8]), (lt, t) => { arenaFaceoff(t, .35 + .25 * Math.sin(t * 3)); pl(heroA, -.75, 3.2, Math.PI); pose(heroA, "idle", t); heroA.setExpr("angry"); turtleAt(pebA, .12, 2.5, Math.PI, t); });
// rule: ceremony, wolves and eagles
shot(S.rule.start, sq, C([0, 3.2, 9], [0, 1.6, -2]), C([0, 2.6, 6.5], [0, 1.6, -2.4]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, true); pose(saint, "idle", t); saint.orbL.intensity = 6;
  [heroS, jaxS, miaS].forEach(c => c.root.visible = false); pebS.g.visible = false; dragS.g.visible = false;
  pl(kidW, -1.8, .2, 0); pose(kidW, "cheer", t, .5); kidW.setExpr("laugh"); wolfS.visible = t > at("rule", "wolves", 5) - .3; wolfS.position.set(-1.1, 0, .5); wolfS.rotation.y = Math.PI * .9;
  pl(kidE, 1.8, .2, 0); pose(kidE, t > at("rule", "eagles", 7) ? "point" : "idle", t); kidE.setExpr("grin");
  const ke = clamp((t - at("rule", "eagles", 7) + .2) / .8); eagleS.visible = ke > 0; eagleS.position.set(lerp(4, 2.3, ke), lerp(4, 1.45, ke), lerp(-2, .45, ke)); eagleS.userData.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * Math.sin(t * 14) * (1 - ke * .7) * .8);
});
// me: tiny turtle, town laughs; the saint whispers
shot(S.me.start, sq, C([1.8, 2.3, 4.6], [0, 1.2, -1.6]), C([1.2, 2.0, 3.6], [0, 1.1, -1.8]), (lt, t) => {
  sq.background = SKYSQ.day; npcSq(t, true); kidW.root.visible = kidE.root.visible = wolfS.visible = eagleS.visible = false; jaxS.root.visible = miaS.root.visible = false; dragS.g.visible = false;
  pl(heroS, 0, -1.6, Math.PI * .95, .6); pose(heroS, "hold", t); heroS.setExpr(t > at("me", "laughed", 3) ? "sad" : "smile");
  turtleAt(pebS, .02, -1.3, 0, t, false, .6 + .62 * .78); pebS.setGlow(0);
  pose(saint, "idle", t);
});
shot(at("me", "but", 4.2) - .1, sq, C([1.7, 2.3, .4], [0, 1.85, -3.1]), C([1.4, 2.25, -.1], [0, 1.9, -3.2]), (lt, t) => {
  sq.background = SKYSQ.day; pl(heroS, 0, -2.2, Math.PI, .6); pose(heroS, "hold", t); heroS.setExpr("shock");
  saint.root.position.set(0, .6, -3.1); pose(saint, "idle", t); saint.head.rotation.x = .35; saint.setExpr("smile"); turtleAt(pebS, .02, -1.95, 0, t, false, .6 + .62 * .78);
});
// care: poor kitchen, one piece of bread, Pebble eats first
shot(S.care.start, kit, C([1.4, 1.8, 2.2], [-.4, 1.0, -.7]), C([1.0, 1.65, 1.5], [-.4, 1.0, -.7]), (lt, t) => {
  pl(heroK, -1.05, -.7, Math.PI / 2); pose(heroK, "idle", t); sitOn(heroK, .48); heroK.setExpr(t > at("care", "pebble", 6.5) ? "smile" : "sad");
  const tB = at("care", "pebble", 6.5) - .2, k = clamp((t - tB) / .8);
  breadL.visible = true; breadL.scale.set(1, 1, 1 - k * .45); breadR.visible = k > 0; breadR.position.set(lerp(-.3, .25, k), lerp(1.08, .99, k), -.62);
  turtleAt(pebK, .38, -.65, -Math.PI / 2, t, false, .94); pebK.setGlow(0); pebK.head.position.z = .28 + (k > .9 ? Math.abs(Math.sin(t * 7)) * .04 : 0);
  bedG.visible = true; candleL.intensity = 5 + Math.sin(t * 13) * .4;
});
shot(S.warm.start, kit, C([-.2, 1.6, 2.2], [-1.6, .7, .9]), C([-.6, 1.4, 1.9], [-1.6, .75, .7]), (lt, t) => {
  heroK.root.visible = true; heroK.root.position.set(-1.6, .42, 1.6); heroK.root.rotation.set(-Math.PI / 2, 0, 0); pose(heroK, "idle", t); heroK.setExpr("closed"); heroK.root.rotation.set(-Math.PI / 2, 0, 0);
  turtleAt(pebK, -1.35, .7, .6, t, false, .72); pebK.setGlow(.25 + .05 * Math.sin(t * 2), "#ffb05a"); breadR.visible = false; candleL.intensity = 1.5;
});
// jax: red sky, dragon lands
shot(S.jax.start, sq, C([0, 3, 9.5], [0, 2.2, -1]), C([0, 2.6, 8], [0, 2.8, -1]), (lt, t) => {
  const tR = at("jax", "sky", 2.2); sq.background = t > tR ? SKYSQ.red : SKYSQ.day; sq.userData.dl.color.set(t > tR ? "#ff8a5a" : "#fff4e0");
  npcSq(t, true); heroS.root.visible = miaS.root.visible = kidW.root.visible = kidE.root.visible = wolfS.visible = eagleS.visible = pebS.g.visible = false;
  pl(jaxS, 0, 1.6, 0); pose(jaxS, t > at("jax", "dragon", 4.4) ? "cheer" : "idle", t); jaxS.setExpr(t > at("jax", "dragon", 4.4) ? "laugh" : "smile");
  const k = easeOut(clamp((t - at("jax", "dragon", 4.2) + 1.2) / 1.4)); dragS.g.visible = true; dragS.g.position.set(0, lerp(9, 0, k), lerp(-6, -1.5, k)); dragS.g.rotation.y = 0; dragS.anim(t, { flap: 1.4 - k * .8 });
  saint.orbL.intensity = t > tR ? 14 : 6;
});
// hype: cheering, Mia holds Jax's hand, Jax mocks
shot(S.hype.start, sq, C([1.8, 5.2, 7.4], [.2, .9, 1.6]), C([1.5, 4.6, 6.6], [0, .9, 1.6]), (lt, t) => {
  sq.background = SKYSQ.day; sq.userData.dl.color.set("#fff4e0"); npcSq(t, false); kidW.root.visible = kidE.root.visible = wolfS.visible = eagleS.visible = false;
  pl(jaxS, -.6, 1.4, .5); pose(jaxS, "cheer", t, .5); jaxS.setExpr("laugh");
  dragS.g.visible = true; dragS.g.position.set(-2.6, 0, -1.6); dragS.g.rotation.y = .6; dragS.anim(t, { flap: .3 });
  const tM = at("hype", "mia", 3); pl(miaS, lerp(1.6, -.1, ease((t - tM) / 1.2)), 1.6, -.4); pose(miaS, t > tM + 1.2 ? "idle" : "walk", t); miaS.setExpr("smile");
  if (t > tM + 1.2) { miaS.arms[0].rotation.z = -.5; jaxS.arms[1].rotation.z = .5; }
  pl(heroS, 1.5, 3.3, -2.4); pose(heroS, "idle", t); heroS.setExpr("sad"); turtleAt(pebS, 1.1, 3.6, -2.4, t);
});
// train: sunrise / rain / snow; log bounces off Pebble
shot(S.train.start, fld, C([1.4, 1.1, 3.4], [0, .5, 0]), C([1.0, .95, 2.7], [0, .45, 0]), (lt, t) => {
  const tR = at("train", "rain", 3), tS = at("train", "snow", 4), tK = at("train", "knock", 6.5);
  fieldMood(t > tK - 1.6 ? "sunrise" : t > tS ? "snow" : t > tR ? "rain" : "sunrise");
  rain.forEach(r => { r.visible = curF === "rain"; const u = r.userData; r.position.set(u.x, ((u.y - t * u.v) % 8 + 8) % 8, u.z); });
  snow.forEach(s => { s.visible = curF === "snow"; const u = s.userData; s.position.set(u.x + Math.sin(t + u.p) * .3, ((u.y - t * u.v) % 8 + 8) % 8, u.z); });
  const run = Math.sin(t * .8) * .5, dir = Math.cos(t * .8) > 0 ? Math.PI / 2 : -Math.PI / 2; pl(heroF, -.4 + run, -.5, dir); pose(heroF, curF === "sunrise" && t < tR ? "walk" : "cheer", t * 1.4, .6); heroF.setExpr("angry");
  turtleAt(pebF, .1 + run * .4, .45, dir, t, true);
  log.visible = t > tK - 1.5; const lk = clamp((t - tK + 1.5) / 1.5); const hit = lk > .6;
  if (t > tK - 1.5) { heroF.root.position.set(.75, 0, -.6); heroF.root.rotation.y = -.5; pose(heroF, "headhold", t); heroF.setExpr("shock"); turtleAt(pebF, 0, 0, Math.PI / 2, t); }
  log.position.set(hit ? lerp(-.6, -2.4, (lk - .6) / .4) : lerp(-4, -.6, lk / .6), .2 + (hit ? Math.sin((lk - .6) / .4 * Math.PI) * .6 : 0), 0); log.rotation.x = t * (hit ? -6 : 6);
});
// tourney: dragon burns through, Pebble withstands a wolf
shot(S.tourney.start, arena, C([5, 3, 7], [0, 1.5, -2]), C([4, 2.6, 5.8], [0, 1.6, -2.5]), (lt, t) => {
  crowdA.forEach((c, i) => pose(c, "cheer", t, .7)); heroA.root.visible = false; pebA.g.visible = false; sparks.forEach(s => s.visible = false);
  pl(jaxA, -1.8, -3.8, .4); pose(jaxA, "point", t); jaxA.setExpr("grin");
  dragA.g.visible = true; dragA.g.position.set(-.5, 0, -5); dragA.g.rotation.y = .1; const br = t > at("tourney", "burned", 2) && t < at("tourney", "and", 4.5) ? 1 : 0; dragA.anim(t, { flap: .8, open: br, breath: br });
  pl(oppA, .4, 2.2, Math.PI * .9); pose(oppA, br ? "headhold" : "idle", t); oppA.setExpr("shock"); wolfA.visible = true; wolfA.position.set(1.4, 0, 1.6); wolfA.rotation.y = Math.PI * .7;
});
shot(at("tourney", "and", 4.5) - .1, arena, C([2.4, 1.3, 3.4], [0, .5, 0]), C([2.0, 1.1, 2.8], [0, .5, 0]), (lt, t) => {
  crowdA.forEach((c, i) => pose(c, "cheer", t, .7)); dragA.g.visible = false; jaxA.root.visible = false; sparks.forEach(s => s.visible = false);
  turtleAt(pebA, 0, 0, -Math.PI / 2, t); pebA.setGlow(0);
  const k = clamp(lt / 1.2); const bounce = k > .5; wolfA.visible = true; wolfA.position.set(bounce ? lerp(.5, 2.6, (k - .5) * 2) : lerp(3, .5, k * 2), bounce ? Math.sin((k - .5) * 2 * Math.PI) * .8 : 0, 0); wolfA.rotation.set(0, Math.PI, bounce ? -(k - .5) * 6 : 0);
  pl(heroA, -.8, -.6, .8); pose(heroA, bounce ? "cheer" : "idle", t); heroA.setExpr(bounce ? "laugh" : "angry"); oppA.root.visible = false;
});
// final: face-off, dragon opens its mouth
shot(S.final.start, arena, C([0, 4.6, 12], [0, 1.4, 0]), C([.6, 2.2, 7.5], [0, 1.7, -2.5]), (lt, t) => {
  const o = clamp((t - at("final", "dragon", 4.6)) / .8); arenaFaceoff(t, o); heroA.setExpr("angry");
});
shot(at("final", "jax", 3.2) - .1, arena, C([-1.2, 2.0, -1.4], [-1.6, 1.7, -4.2]), C([-1.3, 1.95, -2.0], [-1.6, 1.75, -4.2]), (lt, t) => {
  const o = clamp((t - at("final", "dragon", 4.6)) / .8); arenaFaceoff(t, o); jaxA.root.rotation.y = .1;
});
shot(at("final", "dragon", 4.6) - .1, arena, C([.8, 2.0, -.2], [0, 2.6, -2.8]), C([.6, 2.1, -.6], [0, 2.7, -2.9]), (lt, t) => { arenaFaceoff(t, clamp(lt / .8)); });
// glow: Pebble's shell lights up
shot(S.glow.start - .1, arena, C([.9, .7, 4.2], [0, .25, 2.7]), C([.6, .6, 3.7], [0, .3, 2.7]), (lt, t) => {
  arenaFaceoff(t, 1, easeOut(clamp((t - at("glow", "glow", 2.4)) / 1.2)) * (1 + .1 * Math.sin(t * 9)));
  heroA.setExpr("shock");
  const gk = clamp((t - at("glow", "glow", 2.4)) / 1.2); sparks.forEach(s => { const u = s.userData; s.visible = gk > 0; s.position.set(Math.cos(u.a + t * u.v) * u.r, .1 + ((t * u.v * .3 + u.a) % 1) * .8, 2.7 + Math.sin(u.a + t * u.v) * u.r); });
});
shot(S.cta.start - .2, arena, C([.6, .6, 3.7], [0, .3, 2.7]), C([3.4, 2.4, 8.6], [-.3, 1.0, -.5]), (lt, t) => {
  arenaFaceoff(t, 1, 1 + .1 * Math.sin(t * 9)); heroA.setExpr("shock");
  sparks.forEach(s => { const u = s.userData; s.visible = true; s.position.set(Math.cos(u.a + t * u.v) * u.r, .1 + ((t * u.v * .3 + u.a) % 1) * .8, 2.7 + Math.sin(u.a + t * u.v) * u.r); });
});
shots.sort((a, b) => a.t0 - b.t0);

function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : window.TOTAL;
  const k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k)); cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k));
  [heroA, jaxA, heroS, jaxS, miaS, heroF, heroK, saint, oppA].forEach(c => { c.head.rotation.set(0, 0, 0); c.root.rotation.x = 0; c.root.rotation.z = 0; });
  if (s.sc === sq) { smokesSq.forEach(f => f(t)); saint.orb.position.y = 2.3 + Math.sin(t * 2) * .04; }
  if (s.sc !== sq) npcSq(t, false);
  s.update(t - s.t0, t);
  renderer.render(s.sc, cam);
}

// ---------- captions, bubbles, cards ----------
const KEY = new Set(["turtle", "dragon", "final", "saint", "wolves", "eagles", "pebble", "bread", "warm", "red", "hero", "mia", "trained", "rain", "snow", "tournament", "glow", "older"]);
const capsEl = document.getElementById("caps");
const tl = gsap.timeline({ paused: true });
CAPS.forEach(c => {
  const d = document.createElement("div"); d.className = "cap";
  d.innerHTML = c.text.split(" ").map(w => KEY.has(w.toLowerCase().replace(/[^a-z]/g, "")) ? `<span class="hk">${w}</span>` : w).join(" ");
  capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0); tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0); tl.set(d, { opacity: 0 }, c.t1);
  if (capsEl.children.length > 1) tl.set(capsEl.children[capsEl.children.length - 2], { opacity: 0 }, c.t0);
});
const SB = [
  ["He's older than this town.", "c", at("me", "take", 5) - .1, S.me.end + .3, "THE ANIMAL SAINT"],
  ["Nice pet rock. 😂", "r", at("hype", "started", 5.5), S.hype.end + .3, "JAX"],
];
SB.forEach(([txt, cls, t0, t1, who]) => { const d = document.createElement("div"); d.className = "sb " + cls; d.innerHTML = `<small>${who}</small>${txt}`; document.getElementById("root").appendChild(d);
  tl.fromTo(d, { opacity: 0, scale: .6, xPercent: cls.startsWith("c") ? -50 : 0 }, { opacity: 1, scale: 1, duration: .22, ease: "back.out(3)", immediateRender: false }, t0); tl.set(d, { opacity: 0 }, t1); });
tl.fromTo("#vs", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: .25, ease: "back.out(2.5)", immediateRender: false }, 0); tl.set("#vs", { opacity: 0 }, S.hook.end + .1);
tl.fromTo("#part", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .25, immediateRender: false }, .3); tl.set("#part", { opacity: 0 }, S.hook.end + .1);
tl.fromTo("#q", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2.5)", immediateRender: false }, S.cta.start);
tl.fromTo("#follow", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)", immediateRender: false }, S.cta.end + .2);
const clock = { t: 0 };
tl.to(clock, { t: window.TOTAL, duration: window.TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
tl.seek(0); draw(0);
