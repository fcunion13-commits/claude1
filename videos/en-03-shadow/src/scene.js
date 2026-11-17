// "Your shadow lives one day ahead" – In this town… story. Original characters and story.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, canvasTex, redraw, roundRect, textPlane,
  makeChar, pose, makeLabel, baseScene, ground, room, house, tree, sign, screen, skyTex,
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
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const cam = new THREE.PerspectiveCamera(50, W / H, .1, 300);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];

// ---------- fake "living" shadows: a flattened black copy of a character lying on the ground ----------
const shadowMat = new THREE.MeshBasicMaterial({ color: "#05070c", transparent: true, opacity: .82, depthWrite: false });
function noRealShadow(ch) { ch.root.traverse(o => { if (o.isMesh) o.castShadow = false; }); }
function makeShadow(opts = {}) {
  const ch = makeChar({ hairStyle: "short", ...opts });
  ch.root.traverse(o => { if (o.isMesh) { o.material = shadowMat; o.castShadow = false; o.receiveShadow = false; o.renderOrder = 1; } });
  ch.face.visible = false;
  const holder = new THREE.Group(); holder.add(ch.root);
  ch.root.rotation.x = -Math.PI / 2;          // lie flat, head pointing away (−z)
  ch.root.position.y = .02;
  ch.holder = holder; return ch;
}
// place shadow: feet at (x,z), pointing in direction ang (radians, 0 = −z), length factor len
function placeShadow(sh, x, z, ang, len = 1.2) { sh.holder.position.set(x, 0, z); sh.holder.rotation.y = ang; sh.root.scale.set(1, len, .04); }
const suitcase = () => { const g = new THREE.Group(); const b = rbox(.5, .38, .14, .04, shadowMat); b.position.set(.62, -.6, 0); g.add(b); return g; };

// ---------- town ----------
const sc = baseScene({ sky: ["#1b2350", "#4b5b9a"], sun: .4, amb: .45 });
const SKIES = {
  evening: skyTex("#16204a", "#5a6aa8"), night: skyTex("#070a1c", "#1d2550"), day: skyTex("#5fb4ff", "#d8f0ff"), sunset: skyTex("#3a2a6b", "#ff8a4c"),
};
ground(sc, "#5f8f4a", 120);
const plaza = new THREE.Mesh(new THREE.CircleGeometry(9, 48), mat("#cfc3ad")); plaza.rotation.x = -Math.PI / 2; plaza.position.y = .015; plaza.receiveShadow = true; sc.add(plaza);
const road = box(4, .02, 40, "#bdb4a3"); road.position.set(0, .012, -24); road.receiveShadow = true; sc.add(road);
[[-10, -4, "#f6d5b2", "#d0573f", Math.PI / 2], [10, -4, "#cfe3f7", "#4a6fa5", -Math.PI / 2], [-10, 4, "#efe0ff", "#6a4aa5", Math.PI / 2], [10, 4, "#d8f0d0", "#3d7a4a", -Math.PI / 2], [-7, -11, "#f2e2a2", "#8d5a3b", .6], [7, -11, "#f4c6c6", "#a03c3c", -.6]].forEach(([x, z, w_, r_, ry]) => house(sc, x, z, { wall: w_, roof: r_, ry, lit: true }));
// town gate (north, −z)
const gate = new THREE.Group(); gate.position.set(0, 0, -30); sc.add(gate);
{ for (const s of [-1, 1]) { const t = box(1.4, 6, 1.4, "#8a8f98"); t.position.set(s * 3.2, 3, 0); gate.add(t); const wall = box(14, 3.4, .8, "#9aa0a8"); wall.position.set(s * 10, 1.7, 0); gate.add(wall); }
  const top = box(7.8, 1, 1.4, "#8a8f98"); top.position.set(0, 6.2, 0); gate.add(top);
  const gs = sign("TOWN GATE", { w: 4.4, h: .8, bg: "#3b2a1a", fg: "#ffd27a", size: 130 }); gs.position.set(0, 5.1, .72); gate.add(gs); }
// clock tower (south, +z)
const tower = new THREE.Group(); tower.position.set(0, 0, 13); sc.add(tower);
{ const b = box(3.2, 11.9, 3.2, "#d9cbb3"); b.position.y = 5.95; tower.add(b); const roof = new THREE.Mesh(new THREE.ConeGeometry(2.9, 2.2, 4), mat("#7a3b2e")); roof.position.y = 16.3; for (const a of [[-1.9,-1.9],[1.9,-1.9],[-1.9,1.9],[1.9,1.9]]) { const pl_ = box(.2, 3.2, .2, "#8b5a2b"); pl_.position.set(a[0], 13.7, a[1]); tower.add(pl_); } roof.rotation.y = Math.PI / 4; roof.castShadow = true; tower.add(roof);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(.9, 32), mat("#fff8e6")); clock.position.set(0, 9.6, -1.62); clock.rotation.y = Math.PI; tower.add(clock);
  const deck = box(4.4, .2, 4.4, "#8b5a2b"); deck.position.y = 12; tower.add(deck); }
const flood = new THREE.Group(); flood.position.set(0, 12.6, 11.4); sc.add(flood);
{ const housing = new THREE.Mesh(new THREE.CylinderGeometry(.7, .9, 1.1, 24), mat("#3a3f4a", { metalness: .5, roughness: .4 })); housing.rotation.x = Math.PI / 2 - .35; flood.add(housing);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.66, 24), new THREE.MeshStandardMaterial({ color: "#fffbe6", emissive: "#fff2b0", emissiveIntensity: .2 })); lens.position.set(0, -.2, -.5); lens.rotation.x = -.35 + Math.PI; flood.add(lens); flood.userData.lens = lens; }
// streetlights (emissive only + a few point lights)
const lamps = [];
const lampAt = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); sc.add(g); const p = box(.12, 3.2, .12, "#2b2f36"); p.position.y = 1.6; g.add(p); const arm = box(.7, .08, .08, "#2b2f36"); arm.position.set(.3, 3.15, 0); g.add(arm);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), new THREE.MeshStandardMaterial({ color: "#fff3c0", emissive: "#ffd27a", emissiveIntensity: 2 })); bulb.position.set(.6, 3.0, 0); g.add(bulb); lamps.push({ g, bulb }); return g; };
[[-5, -2], [5, -2], [-5, 5], [5, 5], [-2, -14], [2, -20], [-6.5, 1.5], [6.5, 1.5]].forEach(([x, z]) => lampAt(x, z));
const pl = [new THREE.PointLight("#ffd27a", 18, 10), new THREE.PointLight("#ffd27a", 18, 10)]; pl[0].position.set(-4.4, 3, -2); pl[1].position.set(5.6, 3, -2); pl.forEach(l => sc.add(l));
// festival string lights
const fest = new THREE.Group(); sc.add(fest);
srand(5); for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshBasicMaterial({ color: ["#ffd27a", "#ff8fb1", "#8fd3ff", "#b6ff9a"][i % 4] })); b.position.set(Math.cos(a) * 8, 3.6 + Math.sin(i * 1.7) * .25, Math.sin(a) * 8); fest.add(b); }
tree(sc, -14, -16, 1.4); tree(sc, 14, -17, 1.4); tree(sc, -13, 10, 1.3); tree(sc, 14, 10, 1.3);

// ---------- cast ----------
const MAYOR = { shirt: "#2a3a5c", pants: "#2a3a5c", hair: "#9a9a9a", hairStyle: "short", skin: "#f2c9a0", glasses: true };
const addHat = (ch) => { const brim = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .05, 28), mat("#1b1b22")); brim.position.y = .72; ch.head.add(brim); const top = new THREE.Mesh(new THREE.CylinderGeometry(.38, .4, .42, 24), mat("#1b1b22")); top.position.y = .95; ch.head.add(top); const band = new THREE.Mesh(new THREE.CylinderGeometry(.405, .405, .08, 24), mat("#b22222")); band.position.y = .8; ch.head.add(band); };
const mayor = makeChar(MAYOR); addHat(mayor); noRealShadow(mayor); sc.add(mayor.root);
const mayorSh = makeShadow({ ...MAYOR }); sc.add(mayorSh.holder); { const s = suitcase(); mayorSh.arms[1].add(s); mayorSh.userData = { case: s }; }
const ME = { shirt: "#2ec4b6", pants: "#2b2d42", hair: "#5a3a1a", hairStyle: "spiky", skin: "#e0ac7e", scale: .8 };
const me = makeChar(ME); noRealShadow(me); sc.add(me.root);
const meSh = makeShadow({ ...ME }); sc.add(meSh.holder); { const s = suitcase(); s.position.x = -1.24; meSh.arms[0].add(s); meSh.userData = { case: s }; }
// townsfolk (with living shadows)
const folk = []; srand(17);
for (let i = 0; i < 14; i++) {
  const o = { shirt: ["#ff7b54", "#6c63ff", "#ffbe0b", "#ef476f", "#06d6a0", "#118ab2", "#f78c6b"][i % 7], skin: SKIN[i % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i % 4], hairStyle: ["short", "long", "bun", "spiky"][i % 4], scale: i % 5 === 0 ? .75 : 1 };
  const p = makeChar(o); noRealShadow(p); sc.add(p.root);
  const sh = makeShadow(o); sc.add(sh.holder);
  const a = i / 14 * Math.PI * 2 + .2, r = 3 + (i % 3) * 1.6;
  folk.push({ p, sh, x: Math.cos(a) * r, z: Math.sin(a) * r * .8, d: rnd() });
}
// thief + police
const thief = makeChar({ shirt: "#3a3a3a", pants: "#222", hair: "#111", hairStyle: "short", skin: "#c98f63" }); noRealShadow(thief); sc.add(thief.root);
const thiefSh = makeShadow({}); sc.add(thiefSh.holder);
const wallet = rbox(.28, .06, .2, .02, "#7a4b2a"); sc.add(wallet);
const stall = new THREE.Group(); sc.add(stall); { const t = rbox(2, .1, .9, .03, "#c69c6d"); t.position.y = .95; stall.add(t); for (const s of [-1, 1]) { const l = box(.08, .95, .08, "#5a3a2a"); l.position.set(s * .9, .47, 0); stall.add(l); } const aw = rbox(2.3, .1, 1.2, .03, "#e63946"); aw.position.y = 2.3; stall.add(aw); for (const s of [-1, 1]) { const p = box(.08, 2.3, .08, "#5a3a2a"); p.position.set(s * 1.05, 1.15, -.4); stall.add(p); } }
const cops = [0, 1].map(i => { const c = makeChar({ shirt: "#1d3a8a", pants: "#1d3a8a", hair: "#111", helmet: "#1d3a8a", skin: SKIN[i + 1] }); sc.add(c.root); return c; });

// ---------- helpers ----------
let mood = "";
function setMood(m) {
  if (m === mood) return; mood = m;
  const L = { evening: [.5, .35, "#9fb0ff", 18], night: [.35, .12, "#7f8fd0", 18], day: [1.1, 1.6, "#ffffff", 0], sunset: [.7, 1.5, "#ffb070", 6] }[m];
  sc.background = SKIES[m]; sc.userData.hemi.intensity = L[0]; sc.userData.dl.intensity = L[1]; sc.userData.dl.color.set(L[2]); pl.forEach(p => p.intensity = L[3]);
  lamps.forEach(l => l.bulb.material.emissiveIntensity = m === "day" ? .2 : 2);
  if (m === "sunset") sc.userData.dl.position.set(0, 4, 40); else sc.userData.dl.position.set(6, 12, 8);
  sc.fog = m === "night" ? new THREE.Fog("#0a0f26", 18, 60) : m === "sunset" ? new THREE.Fog("#ff9a6a", 30, 90) : null;
}
const hideAll = () => { [mayor.root, me.root, thief.root, wallet, stall, ...cops.map(c => c.root), mayorSh.holder, meSh.holder, thiefSh.holder].forEach(o => o.visible = false); folk.forEach(f => { f.p.root.visible = false; f.sh.holder.visible = false; }); fest.visible = false; flood.visible = false; mayorSh.userData.case.visible = false; meSh.userData.case.visible = false; };
const show = (...o) => o.forEach(x => x.visible = true);

// ---------- shots ----------
const shots = [];
const shot = (t0, from, to, update) => shots.push({ t0, from, to, update });
const C = (p, l) => ({ p, l });

// hook: evening, people walk; their shadows walk a few steps ahead
shot(0, C([0, 11, 9], [0, 0, -2]), C([0, 8.5, 6.5], [0, 0, -2.5]), (lt, t) => {
  setMood("evening"); hideAll();
  folk.slice(0, 6).forEach((f, i) => {
    show(f.p.root, f.sh.holder);
    const x = -4 + i * 1.6, z = 2 - ((t * .8 + i * 1.3) % 6);
    f.p.root.position.set(x, 0, z); f.p.root.rotation.y = Math.PI; pose(f.p, "walk", t);
    placeShadow(f.sh, x, z - 1.4, 0, 1.25); pose(f.sh, i === 2 ? "wave" : "walk", t + .4);
  });
});
// rule: thief + shadow steals
shot(S.rule.start, C([3.2, 5.2, 3.6], [.2, 0, -.4]), C([2.6, 4.4, 3.0], [.2, 0, -.4]), (lt, t) => {
  setMood("night"); hideAll(); show(thief.root, thiefSh.holder, stall, wallet);
  stall.position.set(0, 0, -1); wallet.position.set(.3, 1.04, -1);
  thief.root.position.set(.9, 0, .3); thief.root.rotation.y = -2.4; pose(thief, "idle", t); thief.setExpr("flat");
  const tg = at("rule", "grabs", 5);
  placeShadow(thiefSh, .9, .3, -2.3, 1.3);
  pose(thiefSh, t > tg - .2 ? "point" : "idle", t);
  wallet.visible = t < tg + .4;
});
shot(at("rule", "police", 7.5) - .2, C([0, 2.4, 6], [0, 1.1, 0]), C([0, 2.1, 5], [0, 1.2, 0]), (lt, t) => {
  setMood("day"); hideAll(); show(thief.root, stall, ...cops.map(c => c.root));
  stall.position.set(0, 0, -1); thief.root.position.set(.4, 0, .6); thief.root.rotation.y = Math.PI * .9; pose(thief, "headhold", t); thief.setExpr("shock");
  cops.forEach((c, i) => { c.root.position.set(i ? 1.5 : -.8, 0, -.1); c.root.rotation.y = i ? -2.2 : 2.4; pose(c, "point", t); c.setExpr("angry"); });
});
// mayor under lamp
shot(S.mayor.start, C([0, 6, 15], [0, 2, -2]), C([-2.6, 2.4, 3.6], [-4.6, 1.8, -2]), (lt, t) => {
  setMood("evening"); hideAll(); show(mayor.root);
  mayor.root.position.set(-4.5, 0, -2); mayor.root.rotation.y = .5; pose(mayor, t > at("mayor", "town", 4) ? "wave" : "idle", t); mayor.setExpr("grin");
});
shot(S.clues.start, C([-3.4, 3.6, 1.4], [-4.5, 1.2, -2]), C([-3.6, 2.8, .4], [-4.5, .8, -2]), (lt, t) => {
  setMood("evening"); hideAll(); show(mayor.root, mayorSh.holder);
  mayor.root.position.set(-4.5, 0, -2); mayor.root.rotation.y = .5; pose(mayor, "idle", t); mayor.setExpr("smile");
  placeShadow(mayorSh, -4.5, -2, .2, .18);  // tiny shadow right under his feet
});
shot(at("clues", "never", 4.5) - .1, C([0, 4, 12], [0, 3, -4]), C([0, 3.4, 10], [0, 3, -4]), (lt, t) => {
  setMood("sunset"); hideAll();   // empty sunset square: no mayor
});
// festival: shadows run to the gate
shot(S.fest.start, C([0, 16, 12], [0, 0, -3]), C([0, 18, 6], [0, 0, -12]), (lt, t) => {
  setMood("night"); hideAll(); show(fest);
  const tTurn = at("fest", "turned", 3.5), tRun = at("fest", "ran", 5);
  folk.forEach((f, i) => {
    show(f.p.root, f.sh.holder);
    f.p.root.position.set(f.x, 0, f.z); f.p.root.rotation.y = Math.atan2(-f.x, -f.z) + Math.PI; pose(f.p, t < tTurn ? "cheer" : "idle", t, .5);
    f.p.setExpr(t > tRun + .5 ? "shock" : "laugh");
    const ang = lerp(f.d * 6, 0, ease((t - tTurn) / .6));
    const run = Math.max(0, t - tRun - f.d * .4) * 4.2;
    placeShadow(f.sh, f.x, f.z - run, ang, 1.3); pose(f.sh, t > tRun ? "walk" : "idle", t * 1.8 + i);
    f.sh.holder.visible = run < 26;
  });
});
shot(at("fest", "not", 8.5) - .2, C([1.5, 1.8, 6.5], [0, 1.4, 2]), C([1.2, 1.7, 5.6], [0, 1.4, 2]), (lt, t) => {
  setMood("night"); hideAll(); show(fest);
  folk.forEach((f, i) => { show(f.p.root); f.p.root.position.set(f.x, 0, f.z); f.p.root.rotation.y = Math.atan2(-f.x, -f.z) + Math.PI; pose(f.p, "idle", t); f.p.setExpr("shock"); f.p.head.rotation.x = .35; });
});
shot(S.panic.start, C([0, 14, -10], [0, 0, -24]), C([0, 12, -14], [0, 0, -26]), (lt, t) => {
  setMood("night"); hideAll();
  folk.forEach((f, i) => { show(f.sh.holder); placeShadow(f.sh, -5 + (i % 7) * 1.6, -24 + Math.floor(i / 7) * 1.8, 0, 1.3); pose(f.sh, "walk", t * 2 + i); });
});
// floodlight
shot(S.flood.start, C([-4, 3, 6], [-4.5, 1.6, -2]), C([-3.6, 2.4, 3], [-4.5, 1.8, -2]), (lt, t) => {
  setMood("evening"); hideAll(); show(mayor.root); mayor.root.position.set(-4.5, 0, -2); mayor.root.rotation.y = .5; pose(mayor, "idle", t); mayor.setExpr("smile");
});
shot(at("flood", "built", 3.5) - .2, C([3, 10.5, 4.5], [0, 12.6, 11.4]), C([2, 11.8, 7], [0, 12.7, 11.4]), (lt, t) => {
  setMood("evening"); hideAll(); show(flood);
  flood.userData.lens.material.emissiveIntensity = .3 + .2 * Math.sin(t * 3);
});
// tower at sunset: mayor + me on the deck; his long shadow across the square
shot(S.tower.start, C([-.1, 13.7, 18.2], [-.1, 12.9, 12.5]), C([-.1, 13.5, 16.8], [-.1, 13, 12.5]), (lt, t) => {
  setMood("sunset"); hideAll(); show(flood, mayor.root, me.root);
  mayor.root.position.set(.5, 12.1, 12.4); mayor.root.rotation.y = Math.PI; pose(mayor, "idle", t); mayor.setExpr("smile");
  me.root.position.set(-.8, 12.1, 12.6); me.root.rotation.y = Math.PI * .8; pose(me, "idle", t); me.setExpr("flat");
});
shot(at("tower", "first", 5.5) - .1, C([9, 21, 21], [0, 0, -6]), C([10, 25, 19], [0, 0, -12]), (lt, t) => {
  setMood("sunset"); hideAll(); show(flood, mayor.root, me.root, mayorSh.holder);
  mayor.root.position.set(.5, 12.1, 12.4); me.root.position.set(-.8, 12.1, 12.6);
  const grow = easeOut((t - at("tower", "saw", 6.5)) / 1.4);
  placeShadow(mayorSh, .5, 9, 0, lerp(1, 18, grow)); pose(mayorSh, "idle", t);
});
// reveal: shadow outside the gate with suitcase, waving
shot(S.reveal.start, C([0, 13, -44], [0, 0, -32]), C([0, 10.5, -41], [0, 0, -32]), (lt, t) => {
  setMood("sunset"); hideAll(); show(mayorSh.holder); mayorSh.userData.case.visible = t > at("reveal", "suitcase", 2.5) - .2;
  placeShadow(mayorSh, 0, -32, Math.PI, 2.2);
  pose(mayorSh, t > at("reveal", "waving", 5) - .2 ? "wave" : "idle", t);
  if (mayorSh.userData.case.visible) mayorSh.arms[1].rotation.z = Math.min(mayorSh.arms[1].rotation.z, .3);
});
shot(S.after.start, C([0, 20, -8], [0, 0, -26]), C([0, 18, -12], [0, 0, -28]), (lt, t) => {
  setMood("sunset"); hideAll(); show(mayorSh.holder); mayorSh.userData.case.visible = true;
  placeShadow(mayorSh, 0, -32, Math.PI, 2.2); pose(mayorSh, "wave", t);
  folk.forEach((f, i) => { show(f.sh.holder); placeShadow(f.sh, -5 + (i % 7) * 1.6, -16 - Math.floor(i / 7) * 2 - lt * 2.2, 0, 1.6); pose(f.sh, "walk", t * 2 + i); });
});
// mine: my shadow holds the other handle
shot(S.mine.start, C([-.4, 13.5, 16.4], [-.6, 12.9, 12.6]), C([-.5, 13.4, 15.5], [-.6, 12.95, 12.6]), (lt, t) => {
  setMood("sunset"); hideAll(); show(flood, mayor.root, me.root);
  mayor.root.position.set(.5, 12.1, 12.4); mayor.root.rotation.y = Math.PI; pose(mayor, "idle", t); mayor.setExpr("grin");
  me.root.position.set(-.8, 12.1, 12.6); me.root.rotation.y = Math.PI * .8; pose(me, "idle", t); me.setExpr("flat"); me.head.rotation.x = .4;
});
shot(at("mine", "standing", 3) - .2, C([0, 12.5, -44], [0, 0, -32]), C([0, 10, -41], [0, 0, -32]), (lt, t) => {
  setMood("sunset"); hideAll(); show(mayorSh.holder, meSh.holder); mayorSh.userData.case.visible = true; meSh.userData.case.visible = true;
  placeShadow(mayorSh, .7, -32, Math.PI, 2.2); pose(mayorSh, "idle", t); mayorSh.arms[1].rotation.z = .25;
  placeShadow(meSh, -.7, -32, Math.PI, 2.2 * .8 / .8); pose(meSh, "idle", t); meSh.arms[0].rotation.z = -.25;
});
shot(at("mine", "handle", 7) - .3, C([-.4, 13.3, 15.6], [-.7, 12.95, 12.6]), C([-.5, 13.2, 14.9], [-.7, 13.0, 12.6]), (lt, t) => {
  setMood("sunset"); hideAll(); show(flood, mayor.root, me.root);
  me.root.position.set(-.8, 12.1, 12.6); me.root.rotation.y = Math.PI * .8 + .6; pose(me, "headhold", t); me.setExpr("shock");
  mayor.root.position.set(.5, 12.1, 12.4); pose(mayor, "idle", t); mayor.setExpr("grin");
});
shot(S.cta.start, C([3, 14, 18], [0, 12.6, 13]), C([5, 18, 24], [0, 11, 8]), (lt, t) => {
  setMood("sunset"); hideAll(); show(flood, mayor.root, me.root);
  mayor.root.position.set(.5, 12.1, 12.4); mayor.root.rotation.y = 0; pose(mayor, "point", t); mayor.setExpr("grin");
  me.root.position.set(-.8, 12.1, 12.6); pose(me, "idle", t); me.setExpr("shock");
  flood.userData.lens.material.emissiveIntensity = .3 + Math.max(0, t - S.cta.end) * 6;
});
shots.sort((a, b) => a.t0 - b.t0);

function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : window.TOTAL;
  const k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k)); cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k));
  [mayor, me, thief].forEach(c => c.head.rotation.x = 0); folk.forEach(f => f.p.head.rotation.x = 0);
  s.update(t - s.t0, t);
  renderer.render(sc, cam);
}

// ---------- captions (keyword highlight), bubbles, end cards ----------
const KEY = new Set(["shadow", "shadows", "tomorrow", "police", "light", "lamp", "hat", "sunset", "gate", "hundreds", "run", "floodlight", "suitcase", "money", "goodbye", "after", "handle", "own"]);
const capsEl = document.getElementById("caps");
const tl = gsap.timeline({ paused: true });
CAPS.forEach(c => {
  const d = document.createElement("div"); d.className = "cap";
  d.innerHTML = c.text.split(" ").map(w => KEY.has(w.toLowerCase().replace(/[^a-z]/g, "")) ? `<span class="hk">${w}</span>` : w).join(" ");
  capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0);
  tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0);
  tl.set(d, { opacity: 0 }, c.t1);
});
const SB = [
  ["A town in the light is a town without secrets.", "c", at("mayor", "town", 4) - .1, S.mayor.end + .2, "MAYOR HALE"],
  ["More light.", "c", at("flood", "more", 1.2), at("flood", "built", 3.5) - .2, "MAYOR HALE"],
];
SB.forEach(([txt, cls, t0, t1, who]) => {
  const d = document.createElement("div"); d.className = "sb " + cls + (txt.length > 24 ? " wrap" : ""); d.innerHTML = `<small>${who}</small>${txt}`; document.getElementById("root").appendChild(d);
  tl.fromTo(d, { opacity: 0, scale: .6, xPercent: cls.startsWith("c") ? -50 : 0 }, { opacity: 1, scale: 1, duration: .22, ease: "back.out(3)", immediateRender: false }, t0);
  tl.set(d, { opacity: 0 }, t1);
});
tl.fromTo("#morning", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .2, immediateRender: false }, at("rule", "police", 7.5) - .2);
tl.set("#morning", { opacity: 0 }, S.rule.end + .3);
tl.fromTo("#q", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2.5)", immediateRender: false }, S.cta.end + .05);
tl.fromTo("#follow", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)", immediateRender: false }, S.cta.end + .45);
const clock = { t: 0 };
tl.to(clock, { t: window.TOTAL, duration: window.TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0); draw(0);
