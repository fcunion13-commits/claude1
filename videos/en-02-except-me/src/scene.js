// "Except me" – In this town… story. Original characters and story.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, canvasTex, redraw, roundRect, textPlane,
  makeChar, pose, makeLabel, baseScene, ground, room, house, tree, sign, screen, confetti,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";

const S = window.SEG, WORDS = window.WORDS, CAPS = window.CAPS;
const at = (seg, w, fb = 0) => {
  const s = S[seg];
  const x = WORDS.find(q => q.t0 >= s.start - .05 && q.t0 <= s.end + .05 && q.w.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
  return x ? x.t0 : s.start + fb;
};

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const cam = new THREE.PerspectiveCamera(50, W / H, .1, 200);

// speech bubble = white rounded box with dark text
const bubble = (text, o = {}) => { const L = makeLabel(text, { box: "#fff", stroke: 0, w: 64, h: 16, size: 8, world: .01 }); L.sprite.visible = false; return L; };
const _unused = (text, o = {}) => makeLabel(text, { box: o.box || "#ffffff", flat: o.ink || "#1b1b22", stroke: 0, size: o.size || 110, w: o.w || 1400, h: o.h || 260, world: o.world || 1.8 });
const popScale = (L, t0, base, t) => { if (!L.sprite.visible) return; const k = back((t - t0) / .3); const s = t < t0 ? .001 : Math.max(.001, k) * base; L.sprite.scale.set(s, s * L.sprite.material.map.image.height / L.sprite.material.map.image.width, 1); };

const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];
const ME = { shirt: "#e63946", pants: "#2b2d42", hair: "#3b2416", hairStyle: "spiky", skin: "#f2c9a0" };
const meKid = () => makeChar({ ...ME, scale: .72 });
const meAdult = (o = {}) => makeChar({ ...ME, ...o });
const lilyC = (o = {}) => makeChar({ shirt: "#ffb3c7", pants: "#ffb3c7", hair: "#c46a2b", hairStyle: "long", skin: "#f7d7b8", ...o });

// ============ A: town square (hook) ============
const sq = baseScene({ sky: ["#5fb4ff", "#d8f0ff"] }); ground(sq, "#86c95f");
const plaza = new THREE.Mesh(new THREE.CircleGeometry(8, 40), mat("#d9cbb3")); plaza.rotation.x = -Math.PI / 2; plaza.position.y = .015; plaza.receiveShadow = true; sq.add(plaza);
[[-6, -6, "#f6d5b2", "#d0573f", .5], [6, -6, "#cfe3f7", "#4a6fa5", -.5], [0, -10, "#f2e2a2", "#8d5a3b", 0], [-9, -1, "#efe0ff", "#6a4aa5", 1.2], [9, -1, "#d8f0d0", "#3d7a4a", -1.2]].forEach(([x, z, w_, r_, ry]) => house(sq, x, z, { wall: w_, roof: r_, ry }));
tree(sq, -4, -9, 1.1); tree(sq, 4, -9.5, 1.1);
const crowd = []; srand(3);
for (let i = 0; i < 8; i++) {
  const a = -1.1 + i * (2.2 / 7), r = 3.4 + (i % 2) * .8;
  const p = makeChar({ shirt: ["#ff7b54", "#6c63ff", "#2ec4b6", "#ffbe0b", "#ef476f", "#06d6a0", "#118ab2", "#f78c6b"][i], skin: SKIN[i % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i % 4], hairStyle: ["short", "long", "bun", "short"][i % 4] });
  p.root.position.set(Math.sin(a) * r, 0, -Math.cos(a) * r + .5); p.root.lookAt(0, 0, 1.5); sq.add(p.root);
  const L = makeLabel("✓ TRUTH", { box: "#1fb257", flat: "#ffffff", stroke: 0, size: 120, w: 900, h: 240, world: .95 }); L.sprite.position.set(p.root.position.x, 2.3, p.root.position.z); sq.add(L.sprite);
  crowd.push({ p, L });
}
const meA = meAdult(); meA.root.position.set(0, 0, 1.5); sq.add(meA.root);
const meLiar = makeLabel("EXCEPT ME", { box: "#e63946", flat: "#ffffff", stroke: 0, size: 120, w: 1100, h: 240, world: 1.5 }); meLiar.sprite.position.set(0, 2.45, 1.5); sq.add(meLiar.sprite);

// ============ B: restaurant (rule) ============
const rest = baseScene({ sky: ["#fff", "#fff"], sun: 1.1, amb: 1.0 });
room(rest, { w: 10, d: 8, h: 4, wall: "#f3dcc2", floor: "#8a5a3a" });
const tbl = rbox(1.6, .1, 1.1, .04, "#ffffff"); tbl.position.set(0, .95, 0); rest.add(tbl); { const leg = box(.12, .95, .12, "#5a3a2a"); leg.position.set(0, .47, 0); rest.add(leg); }
const plate = new THREE.Mesh(new THREE.CylinderGeometry(.28, .24, .04, 24), mat("#ffffff")); plate.position.set(.1, 1.02, .1); rest.add(plate);
const fish = rbox(.42, .1, .16, .05, "#e8a87c"); fish.position.set(.1, 1.08, .1); rest.add(fish);
const fishTail = new THREE.Mesh(new THREE.ConeGeometry(.08, .16, 4), mat("#e8a87c")); fishTail.rotation.z = Math.PI / 2; fishTail.position.set(.38, 1.08, .1); rest.add(fishTail);
const flies = []; for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 4), mat("#222")); rest.add(f); flies.push(f); }
const guest = makeChar({ shirt: "#4a6fa5", hair: "#e3b04b", hairStyle: "short", skin: "#f7d7b8" }); guest.root.position.set(-.3, 0, .9); guest.root.rotation.y = Math.PI * .85; rest.add(guest.root);
const waiter = makeChar({ shirt: "#ffffff", pants: "#111", hair: "#111", hairStyle: "short", skin: "#c98f63" }); waiter.root.position.set(1.2, 0, -.3); waiter.root.rotation.y = -.9; rest.add(waiter.root);
const bowtie = rbox(.18, .08, .04, .02, "#111"); waiter.rig.add(bowtie); bowtie.position.set(0, 1.0, .19);
const bGuest = bubble("How is the fish?", { world: 1.6 }); bGuest.sprite.position.set(-.6, 2.35, .9); rest.add(bGuest.sprite);
const bWaiter = bubble("It's 3 days old.", { world: 1.6 }); bWaiter.sprite.position.set(1.3, 2.45, -.3); rest.add(bWaiter.sprite);
for (const p of [[-3.5, 2.6, -3.9], [3.5, 2.6, -3.9]]) { const fr = rbox(1.2, .9, .05, .02, "#c49a6c"); fr.position.set(...p); rest.add(fr); }

// ============ C: living room (eight) ============
const liv = baseScene({ sky: ["#fff", "#fff"], sun: 1.15, amb: 1.0 });
room(liv, { w: 10, d: 8, h: 4, wall: "#d9ecd2", floor: "#c8a477" });
const winG = new THREE.Group(); winG.position.set(1.8, 2.1, -3.88); liv.add(winG);
{ const fr = rbox(2, 1.5, .1, .03, "#ffffff"); winG.add(fr);
  const gl = textPlane(1.8, 1.3, 300, (g, w, h) => { g.fillStyle = "#a9dcff"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ffffff"; g.lineWidth = 6; const cx = w * .45, cy = h * .4; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); let x = cx, y = cy; for (let k = 0; k < 4; k++) { x += Math.cos(a + k * .3) * 50; y += Math.sin(a + k * .3) * 50; g.lineTo(x, y); } g.stroke(); } g.fillStyle = "#13202c"; g.beginPath(); g.arc(cx, cy, 34, 0, 7); g.fill(); });
  gl.position.z = .06; winG.add(gl); }
const sofa = rbox(2.6, .7, 1, .15, "#6c63ff"); sofa.position.set(-2.2, .45, -2.8); liv.add(sofa); { const bk = rbox(2.6, .8, .3, .12, "#5a52e0"); bk.position.set(-2.2, 1, -3.25); liv.add(bk); }
const ballC = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 14), mat("#ffffff")); ballC.position.set(1.4, .16, -2.6); ballC.castShadow = true; liv.add(ballC);
const mom = makeChar({ shirt: "#2ec4b6", pants: "#5a4a7a", hair: "#3b2416", hairStyle: "bun", skin: "#f2c9a0" }); mom.root.position.set(0, 0, .2); liv.add(mom.root);
const kidMe = meKid(); kidMe.root.position.set(-1.1, 0, 1.2); kidMe.root.rotation.y = .5; liv.add(kidMe.root);
const bro = makeChar({ scale: .8, shirt: "#ffbe0b", pants: "#2b2d42", hair: "#3b2416", hairStyle: "short", skin: "#f2c9a0" }); bro.root.position.set(1.1, 0, 1.2); bro.root.rotation.y = -.5; liv.add(bro.root);
const bMom = bubble("Who broke the window?!", { world: 1.9 }); bMom.sprite.position.set(0, 2.45, .2); liv.add(bMom.sprite);
const bKid = bubble("It was HIM!", { world: 1.3 }); bKid.sprite.position.set(-1.1, 1.75, 1.2); liv.add(bKid.sprite);

// ============ D: classroom (use: homework) ============
const cls = baseScene({ sky: ["#fff", "#fff"], sun: 1.25, amb: 1.0 });
room(cls, { w: 10, d: 9, h: 4.2, wall: "#e8f1e4", floor: "#b98a5a" });
const board = textPlane(4.4, 2, 200, (g, w, h) => { g.fillStyle = "#24533e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5230"; g.lineWidth = 24; g.strokeRect(0, 0, w, h); g.fillStyle = "#f4f4ea"; g.font = "800 110px Inter, sans-serif"; g.textAlign = "center"; g.fillText("HOMEWORK", w / 2, h * .42); g.fillText("DUE TODAY", w / 2, h * .72); });
board.position.set(0, 2.3, -4.38); cls.add(board);
const teacher = makeChar({ shirt: "#7b3fa0", pants: "#2b2b3a", hair: "#7a7a7a", hairStyle: "bun", glasses: true, skin: "#f7d7b8" }); teacher.root.position.set(.9, 0, -1.6); teacher.root.rotation.y = -.3; cls.add(teacher.root);
const desk = rbox(1.3, .1, .75, .03, "#c69c6d"); desk.position.set(-.4, .78, .4); cls.add(desk); for (const s of [-1, 1]) { const l = box(.07, .78, .07, "#555"); l.position.set(-.4 + s * .58, .39, .4); cls.add(l); }
const kidCls = meKid(); kidCls.root.position.set(-.4, 0, 1.15); kidCls.root.rotation.y = Math.PI * .85; cls.add(kidCls.root);
const bHw = bubble("Already done!", { world: 1.3 }); bHw.sprite.position.set(-.4, 1.85, 1.15); cls.add(bHw.sprite);
const bT = bubble("Good job!", { world: 1.1 }); bT.sprite.position.set(.9, 2.4, -1.6); cls.add(bT.sprite);

// ============ E: kick-about (use: game) ============
const field = baseScene({ sky: ["#5fb4ff", "#e2f4ff"] }); ground(field, "#6dbb4f");
const goalF = new THREE.Group(); goalF.position.set(0, 0, -5); field.add(goalF);
for (const s of [-1, 1]) { const p = box(.12, 1.6, .12, "#fff"); p.position.set(s * 1.8, .8, 0); goalF.add(p); } { const cb = box(3.7, .12, .12, "#fff"); cb.position.y = 1.6; goalF.add(cb); }
house(field, -6, -9, { wall: "#f6d5b2", roof: "#d0573f" }); house(field, 6, -9, { wall: "#cfe3f7", roof: "#4a6fa5" }); tree(field, -3.5, -8, 1); tree(field, 3.5, -8, 1);
const kidField = meKid(); kidField.root.position.set(-.5, 0, 0); field.add(kidField.root);
const friend = makeChar({ scale: .72, shirt: "#118ab2", pants: "#2b2d42", hair: "#111", hairStyle: "short", skin: "#8d5a3b" }); friend.root.position.set(.9, 0, -.3); friend.root.rotation.y = -.6; field.add(friend.root);
const ballF = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 14), mat("#ffffff")); ballF.castShadow = true; field.add(ballF);
const score = makeLabel("ME 10 : 0 YOU", { box: "#111827", flat: "#ffd23f", stroke: 0, size: 120, w: 1300, h: 240, world: 1.7 }); score.sprite.position.set(0, 2.6, -1); field.add(score.sprite);

// ============ F: mansion + billboard (rich) ============
const rich = baseScene({ sky: ["#5fb4ff", "#d8f0ff"] }); ground(rich, "#86c95f");
const villa = house(rich, 0, -5, { wall: "#fff3d6", roof: "#d4a017", w: 6, h: 3.4, d: 4 });
const bill = new THREE.Group(); bill.position.set(-3.2, 0, -1.5); bill.rotation.y = .35; rich.add(bill);
{ const bb = sign("TRUST ME.", { w: 3.6, h: 1.4, bg: "#111827", fg: "#ffd23f", size: 240, px: 260 }); bb.position.y = 2.9; bill.add(bb); for (const s of [-1, 1]) { const p = box(.12, 2.9, .12, "#555"); p.position.set(s * 1.4, 1.45, -.05); bill.add(p); } }
const coins = []; srand(8);
for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .06, 18), mat("#ffc83d", { metalness: .6, roughness: .3 })); c.castShadow = true; rich.add(c); coins.push({ c, x: 1 + (rnd() - .5) * 1.2, z: .3 + (rnd() - .5) * 1, y: .03 + Math.floor(i / 6) * .06, d: rnd() }); }
const meRich = meAdult({ shirt: "#1f2937", pants: "#1f2937" }); meRich.root.position.set(.1, 0, .6); rich.add(meRich.root);
const tie = rbox(.1, .32, .03, .02, "#ffd23f"); meRich.rig.add(tie); tie.position.set(0, .82, .19);
const bTrust = bubble("Trust me.", { world: 1.3 }); bTrust.sprite.position.set(.1, 2.45, .6); rich.add(bTrust.sprite);
const richConf = confetti(rich, 120, [6, 6, 3], 4);

// ============ G: park bench at sunset (lily, ask, end, cta) ============
const park = baseScene({ sky: ["#ff8a5c", "#ffd8a8"], sun: 1.2, amb: .9 }); ground(park, "#6aa84f");
park.userData.dl.color.set("#ffc28a"); park.userData.dl.position.set(-8, 6, 4);
const bench = new THREE.Group(); park.add(bench);
{ const seat = rbox(2.4, .12, .6, .04, "#8b5a2b"); seat.position.y = .55; bench.add(seat); const bk = rbox(2.4, .5, .1, .04, "#8b5a2b"); bk.position.set(0, .95, -.28); bench.add(bk); for (const s of [-1, 1]) { const l = box(.1, .55, .5, "#333"); l.position.set(s * 1.05, .27, 0); bench.add(l); } }
const lamp = new THREE.Group(); lamp.position.set(2, 0, -.6); park.add(lamp); { const p = box(.1, 3, .1, "#333"); p.position.y = 1.5; lamp.add(p); const b = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), new THREE.MeshStandardMaterial({ color: "#fff3c0", emissive: "#ffd27a", emissiveIntensity: 1.5 })); b.position.y = 3.05; lamp.add(b); }
tree(park, -3.5, -2.5, 1.2); tree(park, 4, -4, 1.1); house(park, 0, -12, { wall: "#f6d5b2", roof: "#d0573f" });
const meP = meAdult(); meP.root.position.set(-.5, 0, .05); park.add(meP.root);
const lilyP = lilyC(); lilyP.root.position.set(.5, 0, .05); park.add(lilyP.root);
const meOld = meAdult({ hair: "#d9d9d9", shirt: "#7a2a33", glasses: true }); meOld.root.position.set(-.5, 0, .05); park.add(meOld.root);
const lilyOld = lilyC({ hair: "#e6e6e6", hairStyle: "bun", shirt: "#c98aa0", pants: "#c98aa0" }); lilyOld.root.position.set(.5, 0, .05); park.add(lilyOld.root);
const bAsk = bubble("Do you love me?", { world: 1.5 }); bAsk.sprite.position.set(-.8, 2.1, .05); park.add(bAsk.sprite);
const bYes = bubble("Yes.", { world: .7, w: 700 }); bYes.sprite.position.set(.8, 2.1, .05); park.add(bYes.sprite);
const heart = makeLabel("♥", { flat: "#ff4d6d", stroke: 18, strokeColor: "#ffffff", size: 260, w: 400, h: 400, world: .9 }); heart.sprite.position.set(0, 2.4, .05); park.add(heart.sprite);
const qMark = makeLabel("?", { world: 1.2, w: 512, h: 512, size: 420, stroke: 34 }); qMark.sprite.position.set(-.5, 2.3, .05); park.add(qMark.sprite);
const parkConf = confetti(park, 0);

// ============ H: wedding ============
const wed = baseScene({ sky: ["#9fd3ff", "#f4fbff"] }); ground(wed, "#86c95f");
const arch = new THREE.Group(); arch.position.set(0, 0, -1.2); wed.add(arch);
{ const a = new THREE.Mesh(new THREE.TorusGeometry(1.6, .12, 12, 32, Math.PI), mat("#ffffff")); a.position.y = 1.6; arch.add(a); for (const s of [-1, 1]) { const p = box(.24, 1.6, .24, "#ffffff"); p.position.set(s * 1.6, .8, 0); arch.add(p); }
  srand(6); for (let i = 0; i < 22; i++) { const ang = Math.PI * i / 21; const f = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), mat(["#ff8fb1", "#ffffff", "#ffd1dc", "#ff5d7a"][i % 4])); f.position.set(Math.cos(ang) * 1.6, 1.6 + Math.sin(ang) * 1.6, .1); arch.add(f); } }
const meW = meAdult({ shirt: "#111827", pants: "#111827" }); meW.root.position.set(-.45, 0, 0); meW.root.rotation.y = .6; wed.add(meW.root);
const bowW = rbox(.2, .08, .04, .02, "#e63946"); meW.rig.add(bowW); bowW.position.set(0, 1.0, .19);
const lilyW = lilyC({ shirt: "#ffffff", pants: "#ffffff" }); lilyW.root.position.set(.45, 0, 0); lilyW.root.rotation.y = -.6; wed.add(lilyW.root);
const veil = rbox(.9, .9, .1, .06, new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: .55 })); lilyW.head.add(veil); veil.position.set(0, .5, -.38);
const guests = []; for (let i = 0; i < 8; i++) { const g = makeChar({ shirt: ["#6c63ff", "#ffbe0b", "#ef476f", "#2ec4b6"][i % 4], skin: SKIN[i % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i % 4], hairStyle: ["short", "long", "bun", "spiky"][i % 4] }); g.root.position.set((i % 4 - 1.5) * 1.3 + (i % 4 > 1 ? .8 : -.8), 0, 2.4 + Math.floor(i / 4) * 1.2); g.root.rotation.y = Math.PI; wed.add(g.root); guests.push(g); }
const bPsst = bubble("psst...", { world: .8, w: 800 }); bPsst.sprite.position.set(.55, 2.2, .1); wed.add(bPsst.sprite);
const bLie = bubble("I can lie too.", { box: "#e63946", ink: "#ffffff", world: 1.5 }); bLie.sprite.position.set(.5, 2.35, .1); wed.add(bLie.sprite);
const wedConf = confetti(wed, 140, [6, 6, 4], 9);

// ---------- shots ----------
const shots = [];
const shot = (t0, sc, from, to, update) => shots.push({ t0, sc, from, to, update });
const C = (p, l) => ({ p, l });

// hook
shot(0, sq, C([0, 4.5, 11], [0, 1.4, 0]), C([0, 2.4, 6.6], [0, 1.7, 1.5]), (lt, t) => {
  crowd.forEach(({ p, L }, i) => { pose(p, "idle", t); p.setExpr("smile"); popScale(L, .25 + i * .12, .95, t); });
  pose(meA, "idle", t); meA.setExpr(t > at("hook", "except") ? "grin" : "flat");
  popScale(meLiar, at("hook", "except"), 1.5, t);
});
shot(at("hook", "except", 2) + .35, sq, C([0, 1.95, 4.4], [0, 1.7, 1.5]), C([0, 1.9, 3.7], [0, 1.75, 1.5]), (lt, t) => {
  pose(meA, "idle", t); meA.setExpr("grin"); meA.head.rotation.y = Math.sin(t * 2) * .12; popScale(meLiar, -1, 1.5, t);
  crowd.forEach(({ p }) => pose(p, "idle", t));
});
// rule – restaurant
shot(S.rule.start, rest, C([-2.2, 2.2, 4.6], [.3, 1.4, 0]), C([-1.4, 2.0, 3.6], [.4, 1.5, 0]), (lt, t) => {
  pose(guest, "idle", t); pose(waiter, "idle", t);
  const tA = at("rule", "ask"), tO = at("rule", "old");
  popScale(bGuest, tA, 1.6, t); if (t > at("rule", "and", 4)) bGuest.sprite.scale.setScalar(.001);
  popScale(bWaiter, at("rule", "and", 4), 1.6, t);
  guest.setExpr(t > tO ? "shock" : "smile"); waiter.setExpr(t > at("rule", "and", 4) ? "flat" : "smile");
  flies.forEach((f, i) => { f.visible = t > tO - .2; f.position.set(.1 + Math.sin(t * 7 + i * 2) * .25, 1.35 + Math.cos(t * 9 + i) * .12, .1 + Math.cos(t * 6 + i * 3) * .2); });
  if (t > tO) { guest.rig.rotation.x = -.15; }
});
// eight – living room
shot(S.eight.start, liv, C([0, 2.6, 6.5], [0, 1.3, -.5]), C([0, 2.2, 5.2], [0, 1.2, .2]), (lt, t) => {
  const tW = at("eight", "window"), tP = at("eight", "pointed"), tB = at("eight", "believed");
  pose(mom, t > tW - .6 ? (t > tB ? "point" : "headhold") : "idle", t); mom.setExpr(t > tB ? "angry" : t > tW - .6 ? "angry" : "flat");
  mom.root.rotation.y = t > tB ? .55 : 0;
  popScale(bMom, at("eight", "my", 1.5), 1.9, t); if (t > tP) bMom.sprite.scale.setScalar(.001);
  pose(kidMe, t > tP ? "point" : "idle", t); kidMe.root.rotation.y = t > tP ? 1.2 : .5; kidMe.setExpr(t > tP ? "grin" : "flat");
  popScale(bKid, tP, 1.3, t);
  pose(bro, t > tB ? "headhold" : "idle", t); bro.setExpr(t > tP ? "shock" : "smile");
});
// use – homework
shot(S.use.start, cls, C([-.1, 2.5, 5.4], [.2, 1.3, -.6]), C([-.1, 2.3, 4.6], [.2, 1.35, -.6]), (lt, t) => {
  pose(teacher, t > at("use", "homework") ? "idle" : "point", t); teacher.setExpr(t > at("use", "homework") + .4 ? "smile" : "flat");
  pose(kidCls, "sit", t); kidCls.setExpr("grin");
  popScale(bHw, at("use", "homework") - .2, 1.3, t); popScale(bT, at("use", "homework") + .5, 1.1, t);
});
// use – game
shot(at("use", "lost", 3.8) - .5, field, C([0, 2.2, 5.5], [0, 1, -1]), C([0, 2.0, 4.4], [0, 1.1, -1]), (lt, t) => {
  pose(kidField, "cheer", t); kidField.setExpr("laugh"); pose(friend, "facepalm", t); friend.setExpr("sad");
  ballF.position.set(Math.sin(t * 2) * .3, .16, -4.6);
  popScale(score, at("use", "lost", 3.8) - .2, 1.7, t);
});
// rich
shot(S.rich.start, rich, C([0, 3.4, 9], [0, 1.8, -2]), C([0, 2.2, 5.2], [0, 1.6, 0]), (lt, t) => {
  pose(meRich, t > at("rich", "trust") ? "point" : "idle", t); meRich.setExpr(t > at("rich", "trust") ? "grin" : "smile");
  coins.forEach(({ c, x, z, y, d }) => { const k = easeOut((lt - d * 1.2) / .5); c.position.set(x, lerp(4, y, k), z); c.rotation.x = (1 - k) * 6; c.visible = lt > d * 1.2; });
  popScale(bTrust, at("rich", "trust"), 1.3, t); richConf(lt);
});
shot(at("rich", "trust", 7) + .4, rich, C([-2.2, 3, 3.2], [-3.2, 2.9, -1.5]), C([-2.6, 2.95, 2.4], [-3.2, 2.9, -1.5]), (lt, t) => { pose(meRich, "point", t); });
// lily
shot(S.lily.start, park, C([0, 2.4, 6.5], [0, 1.3, 0]), C([0, 1.9, 4.4], [0, 1.3, 0]), (lt, t) => {
  [meOld, lilyOld].forEach(c => c.root.visible = false); [meP, lilyP].forEach(c => c.root.visible = true);
  pose(meP, "idle", t); meP.setExpr("smile"); meP.root.rotation.y = .4; pose(lilyP, "idle", t); lilyP.setExpr("smile"); lilyP.root.rotation.y = -.4;
  [bAsk, bYes, heart, qMark].forEach(L => L.sprite.scale.setScalar(.001));
});
shot(S.ask.start, park, C([0, 2.1, 4.6], [0, 1.3, 0]), C([0, 2.0, 3.8], [0, 1.35, 0]), (lt, t) => {
  [meOld, lilyOld].forEach(c => c.root.visible = false); [meP, lilyP].forEach(c => c.root.visible = true);
  pose(meP, "sit", t); meP.root.position.z = .05; pose(lilyP, "sit", t);
  meP.root.rotation.y = .5; lilyP.root.rotation.y = -.5;
  const tQ = at("ask", "do"), tY = at("ask", "she"), tT = at("ask", "true");
  popScale(bAsk, tQ, 1.5, t); if (t > tY + .6) bAsk.sprite.scale.setScalar(.001);
  popScale(bYes, tY + .3, .7, t); popScale(heart, tT - .2, .9 + .08 * Math.sin(t * 8), t);
  meP.setExpr(t > tY + .3 ? "laugh" : "flat"); lilyP.setExpr("smile"); qMark.sprite.scale.setScalar(.001);
});
// wedding
shot(S.wedding.start, wed, C([0, 2.6, 7], [0, 1.6, 0]), C([0, 2.0, 3.8], [0, 1.7, 0]), (lt, t) => {
  guests.forEach(g => { pose(g, "cheer", t, .5); }); pose(meW, "idle", t); meW.setExpr("laugh"); pose(lilyW, "idle", t); lilyW.setExpr("smile");
  wedConf(lt); bLie.sprite.scale.setScalar(.001);
  const tL = at("wedding", "leaned"); lilyW.root.position.x = .45 - easeOut((t - tL) / .6) * .2; lilyW.head.rotation.z = -easeOut((t - tL) / .6) * .25;
  popScale(bPsst, at("wedding", "whispered"), .8, t);
});
shot(S.twist.start - .25, wed, C([.5, 2.0, 3.1], [.15, 1.7, 0]), C([.45, 1.95, 2.6], [.15, 1.75, 0]), (lt, t) => {
  pose(lilyW, "idle", t); lilyW.setExpr(t > S.twist.start + .8 ? "closed" : "grin"); lilyW.root.position.x = .25; lilyW.head.rotation.z = -.25;
  bPsst.sprite.scale.setScalar(.001); popScale(bLie, S.twist.start + .2, 1.5, t);
  pose(meW, "idle", t); meW.setExpr("shock"); guests.forEach(g => pose(g, "idle", t));
});
shot(S.twist.end + .1, wed, C([-1.2, 1.9, 2.4], [-.45, 1.75, 0]), C([-1.0, 1.85, 1.8], [-.45, 1.8, 0]), (lt, t) => {
  pose(meW, "headhold", t); meW.setExpr("shock"); bLie.sprite.scale.setScalar(.001);
  cam.position.x += Math.sin(t * 40) * .015 * Math.max(0, 1 - lt);
});
// end – old couple
shot(S.end.start, park, C([0, 2.2, 6], [0, 1.2, 0]), C([0, 1.9, 4.2], [0, 1.3, 0]), (lt, t) => {
  [meP, lilyP].forEach(c => c.root.visible = false); [meOld, lilyOld].forEach(c => c.root.visible = true);
  pose(meOld, "sit", t); pose(lilyOld, "sit", t); meOld.root.rotation.y = .5; lilyOld.root.rotation.y = -.5;
  meOld.setExpr("flat"); lilyOld.setExpr(t > at("end", "lie", 3) ? "closed" : "smile");
  [bAsk, bYes, heart].forEach(L => L.sprite.scale.setScalar(.001));
  popScale(qMark, at("end", "still", 1.4), 1.2 + .06 * Math.sin(t * 5), t);
});
// cta
shot(S.cta.start, park, C([0, 1.9, 4.2], [0, 1.3, 0]), C([0, 3.2, 8], [0, 1.6, 0]), (lt, t) => {
  [meP, lilyP].forEach(c => c.root.visible = false); [meOld, lilyOld].forEach(c => c.root.visible = true);
  pose(meOld, "sit", t); pose(lilyOld, "sit", t); meOld.setExpr("flat"); lilyOld.setExpr("closed");
  popScale(qMark, -1, 1.2, t);
});
shots.sort((a, b) => a.t0 - b.t0);

function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : window.TOTAL;
  const k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k));
  cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k));
  s.update(t - s.t0, t);
  renderer.render(s.sc, cam);
}

// ---------- captions + end cards ----------
const capsEl = document.getElementById("caps");
const tl = gsap.timeline({ paused: true });
CAPS.forEach(c => {
  const d = document.createElement("div"); d.className = "cap"; d.textContent = c.text; capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0);
  tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0);
  tl.set(d, { opacity: 0 }, c.t1);
});
const SB = [
  ["How is the fish?", "l", at("rule", "ask"), at("rule", "and", 4), "GUEST"],
  ["It's 3 days old.", "r", at("rule", "and", 4), S.rule.end + .3, "WAITER"],
  ["Who broke the window?!", "c", at("eight", "my", 1.5), at("eight", "pointed"), "MOM"],
  ["It was HIM! 👉", "l", at("eight", "pointed"), S.eight.end + .2, "ME, AGE 8"],
  ["Already done! 😇", "l", at("use", "homework") - .2, at("use", "lost", 3.8) - .5, "ME"],
  ["Trust me. 😏", "c", at("rich", "trust"), S.rich.end + .3, "ME"],
  ["Do you love me?", "l", at("ask", "do"), at("ask", "she") + .3, "ME"],
  ["Yes. ❤️", "r", at("ask", "she") + .3, S.ask.end + .2, "LILY"],
  ["psst...", "r", at("wedding", "whispered"), S.twist.start, "LILY"],
  ["I can lie too.", "r red", S.twist.start + .1, S.twist.end + .5, "LILY"],
];
SB.forEach(([txt, cls, t0, t1, who]) => {
  const d = document.createElement("div"); d.className = "sb " + cls; d.innerHTML = `<small>${who}</small>${txt}`; document.getElementById("root").appendChild(d);
  const cx = cls.startsWith("c") ? "-50%" : "0%";
  tl.fromTo(d, { opacity: 0, scale: .6, xPercent: cls.startsWith("c") ? -50 : 0, x: 0 }, { opacity: 1, scale: 1, duration: .22, ease: "back.out(3)", immediateRender: false }, t0);
  tl.set(d, { opacity: 0 }, t1);
});
const tCta = S.cta.end + .05;
tl.fromTo("#q", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2.5)", immediateRender: false }, tCta);
tl.fromTo("#follow", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)", immediateRender: false }, tCta + .4);
const clock = { t: 0 };
tl.to(clock, { t: window.TOTAL, duration: window.TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0); draw(0);
