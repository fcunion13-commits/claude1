// "The Visit" – story by the channel owner. Original characters, built in code.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, canvasTex, redraw, roundRect, textPlane,
  makeChar, pose, makeLabel, baseScene, ground, room, house, tree, sign, screen, skyTex,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

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
const cam = new THREE.PerspectiveCamera(50, W / H, .1, 300); cam.layers.enable(1);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];
// visitors live on layer 1: visible to the main camera, invisible to mirrors/ice reflections
const toVisitor = (ch) => ch.root.traverse(o => o.layers.set(1));
const sparkle = (sc, n = 40, seed = 2) => { srand(seed); const g = new THREE.Group(); for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 4), new THREE.MeshBasicMaterial({ color: i % 2 ? "#fff6c0" : "#cfe8ff" })); m.userData = { v: v3([(rnd() - .5) * 1.6, rnd() * 2 + .4, (rnd() - .5) * 1.6]) }; g.add(m); } sc.add(g); g.visible = false;
  return (pos, k) => { g.visible = k > 0 && k < 1; g.children.forEach(m => { m.position.copy(pos).addScaledVector(m.userData.v, k).add(new THREE.Vector3(0, 1 + k, 0)); m.scale.setScalar(1 - k); }); }; };
const snowfall = (sc, area = 24, n = 260, seed = 4) => { srand(seed); const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: "#ffffff" }); const geo = new THREE.SphereGeometry(.035, 5, 4);
  const fl = []; for (let i = 0; i < n; i++) { const f = new THREE.Mesh(geo, m); fl.push({ f, x: (rnd() - .5) * area, z: (rnd() - .5) * area, y: rnd() * 10, s: .4 + rnd() * .5, p: rnd() * 6 }); g.add(f); } sc.add(g);
  return (t, cx = 0, cz = 0) => fl.forEach(o => { o.f.position.set(cx + o.x + Math.sin(t + o.p) * .3, ((o.y - t * o.s) % 10 + 10) % 10, cz + o.z); }); };
const footprint = (sc, x, z, ang, small) => { const g = new THREE.Mesh(new THREE.CircleGeometry(small ? .07 : .1, 12), new THREE.MeshBasicMaterial({ color: "#9fb2c4", transparent: true, opacity: .9, depthWrite: false })); g.scale.set(1, 1.7, 1); g.rotation.x = -Math.PI / 2; g.rotation.z = ang; g.position.set(x, .012, z); sc.add(g); return g; };

// ---------- cast ----------
const ME = { shirt: "#3a6fd8", pants: "#2b2d42", hair: "#5a3a1a", hairStyle: "spiky", skin: "#f2c9a0", scale: .82 };
const LILY = { shirt: "#ff6fa3", pants: "#7a2f5a", hair: "#7a3e1d", hairStyle: "long", skin: "#f7d7b8", scale: .62 };
const MOM = { shirt: "#2ec4b6", pants: "#4a3a6a", hair: "#3b2416", hairStyle: "bun", skin: "#f2c9a0" };
const DAD = { shirt: "#7a5c3e", pants: "#2b2d42", hair: "#2a1d14", hairStyle: "short", skin: "#e0ac7e", glasses: true };
const mk = (o, sc) => { const c = makeChar(o); sc.add(c.root); return c; };
const scarf = (ch, col) => { const s = rbox(.6, .14, .42, .06, col); s.position.set(0, 1.04, 0); ch.rig.add(s); };
const dogMake = (sc) => { const g = new THREE.Group(); const b = rbox(.7, .38, .32, .12, "#c8894a"); b.position.y = .32; g.add(b); const h = rbox(.34, .32, .32, .1, "#c8894a"); h.position.set(.42, .48, 0); g.add(h); const sn = rbox(.16, .12, .18, .05, "#3a2a1a"); sn.position.set(.6, .44, 0); g.add(sn);
  for (const [x, z] of [[-.25, -.1], [-.25, .1], [.22, -.1], [.22, .1]]) { const l = box(.08, .2, .08, "#a8703c"); l.position.set(x, .1, z); g.add(l); } const e = rbox(.08, .16, .14, .03, "#8a5a2a"); e.position.set(.4, .62, .14); g.add(e); const e2 = e.clone(); e2.position.z = -.14; g.add(e2); sc.add(g); return g; };

// ============ SET A: snowy town ============
const town = baseScene({ sky: ["#ffb98a", "#ffe6c8"], sun: 1.2, amb: .9 });
const SKY = { sunrise: skyTex("#7aa6ff", "#ffc89a"), day: skyTex("#8ec5ff", "#eaf6ff"), sunset: skyTex("#3a2a6b", "#ff8a4c"), dusk: skyTex("#0b1030", "#3a3a7a") };
ground(town, "#eef4f8", 140);
const roofSnow = (h) => { const r = rbox(3.6, .25, 3.6, .1, "#ffffff"); r.position.y = 3.25; h.add(r); };
const homes = [];
[[-6, -6, "#c96f53", "#6b3a2a"], [6, -6, "#6f8fc9", "#2f4a7a"], [-6, 4, "#d9b26a", "#7a5a2a"], [7, 4, "#9fc96f", "#3a6a2f"], [12, -14, "#c9a0d9", "#5a3a7a"]].forEach(([x, z, w_, r_]) => { const h = house(town, x, z, { wall: w_, roof: "#ffffff", lit: true, ry: x < 0 ? .4 : -.4 }); homes.push(h); });
srand(12); for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1; const t = tree(town, side * (11 + rnd() * 10), -16 - rnd() * 26, .9 + rnd() * .5); t.children[1].material = mat("#e9f2f7"); }
const snowT = snowfall(town, 30, 320, 4);
// pond (with true reflection, visitors excluded)
const pondPos = new THREE.Vector3(0, 0, -30);
const ice = new Reflector(new THREE.CircleGeometry(7, 48), { textureWidth: 512, textureHeight: 1024, color: 0x9ab8c8 });
ice.rotation.x = -Math.PI / 2; ice.position.set(pondPos.x, .03, pondPos.z); town.add(ice);
const iceTint = new THREE.Mesh(new THREE.CircleGeometry(7, 48), new THREE.MeshBasicMaterial({ color: "#cfe9f5", transparent: true, opacity: .28, depthWrite: false })); iceTint.rotation.x = -Math.PI / 2; iceTint.position.set(pondPos.x, .04, pondPos.z); town.add(iceTint);
const hole = new THREE.Mesh(new THREE.CircleGeometry(.8, 24), mat("#14232e")); hole.rotation.x = -Math.PI / 2; hole.position.set(pondPos.x + 2, .05, pondPos.z - 2); town.add(hole);
const pondSign = sign("MILLER POND", { w: 2.2, h: .5, bg: "#5a3a1a", fg: "#ffffff", size: 100 }); pondSign.position.set(-4.5, 1.3, -23.5); pondSign.rotation.y = .3; town.add(pondSign);
{ const p = box(.1, 1.3, .1, "#5a3a1a"); p.position.set(-4.5, .65, -23.6); town.add(p); }
// porch house (our house)
const ours = homes[2];
const porch = new THREE.Group(); porch.position.set(-6, 0, 6.2); town.add(porch);
{ const deck = box(3, .35, 1.2, "#8b5a2b"); deck.position.y = .3; porch.add(deck); const step = box(1, .15, .4, "#8b5a2b"); step.position.set(0, .08, .75); porch.add(step); }
const dog = dogMake(town); dog.position.set(-5.2, -.05, 7.3); dog.scale.setScalar(.85);
// cast in town
const meT = mk(ME, town); scarf(meT, "#e63946"); toVisitor(meT);
const lilyT = mk(LILY, town); scarf(lilyT, "#ffd23f");
const momT = mk(MOM, town), dadT = mk(DAD, town);
const gpa = mk({ shirt: "#6b6b8a", pants: "#3a3a4a", hair: "#e6e6e6", hairStyle: "short", skin: "#f2c9a0", glasses: true }, town); toVisitor(gpa);
const kidA = mk({ shirt: "#ffbe0b", pants: "#2b2d42", hair: "#2a1d14", hairStyle: "short", skin: SKIN[1], scale: .7 }, town);
const womA = mk({ shirt: "#ef476f", pants: "#3a3a4a", hair: "#7a3e1d", hairStyle: "long", skin: SKIN[1] }, town);
// footprints
const gpaPrints = [], lilyPrints = [], momPrints = [];
for (let i = 0; i < 14; i++) gpaPrints.push(footprint(town, 2 + (i % 2 ? .18 : -.18), 6 - i * .55, 0, false));
for (let i = 0; i < 14; i++) momPrints.push(footprint(town, .6 + (i % 2 ? .18 : -.18), 6 - i * .55, 0, false));
for (let i = 0; i < 46; i++) lilyPrints.push(footprint(town, -5 + Math.sin(i * .12) * .6 + (i % 2 ? .11 : -.11), 4 - i * .7, 0, true));
const vanishT = sparkle(town, 50, 3), vanishMe = sparkle(town, 60, 7);

// ============ SET B: house interior ============
const home = baseScene({ sky: ["#fff", "#fff"], sun: 1.1, amb: 1.0 });
room(home, { w: 11, d: 9, h: 4, wall: "#f0e2c8", floor: "#a87a52" });
const winH = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), new THREE.MeshBasicMaterial({ color: "#dfefff" })); winH.position.set(2.8, 2.2, -4.38); home.add(winH);
{ const fr = rbox(2, 1.5, .08, .02, "#ffffff"); fr.position.set(2.8, 2.2, -4.42); home.add(fr); }
const table = rbox(2.4, .12, 1.3, .04, "#c69c6d"); table.position.set(1.2, .95, -.6); home.add(table); for (const [x, z] of [[-1, -.5], [1, -.5], [-1, .5], [1, .5]]) { const l = box(.1, .95, .1, "#7a5230"); l.position.set(1.2 + x, .47, -.6 + z); home.add(l); }
const pancakes = new THREE.Group(); pancakes.position.set(1.2, 1.02, -.6); home.add(pancakes);
{ const pl = new THREE.Mesh(new THREE.CylinderGeometry(.34, .3, .04, 24), mat("#ffffff")); pancakes.add(pl); for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .05, 24), mat("#e8b56a")); p.position.y = .05 + i * .055; pancakes.add(p); }
  srand(9); for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(.028, 6, 4), mat("#4a2a14")); c.position.set((rnd() - .5) * .3, .33, (rnd() - .5) * .3); pancakes.add(c); } }
// mirror on the left wall (true reflection) + bedsheet cover
const mirrorG = new THREE.Group(); mirrorG.position.set(-3.2, 0, -4.2); home.add(mirrorG);
const mirror = new Reflector(new THREE.PlaneGeometry(1.4, 2.4), { textureWidth: 512, textureHeight: 1024, color: 0xd8e4ea }); mirror.position.set(0, 1.5, .08); mirrorG.add(mirror);
{ const fr = rbox(1.6, 2.6, .12, .04, "#7a5230"); fr.position.set(0, 1.5, 0); mirrorG.add(fr); }
const sheet = rbox(1.9, 2.9, .12, .1, "#f7f7f2"); sheet.position.set(0, 1.45, .2); mirrorG.add(sheet);
const sheetTop = rbox(1.9, .2, .5, .08, "#f7f7f2"); sheetTop.position.set(0, 2.9, .05); mirrorG.add(sheetTop);
const tv = new THREE.Group(); tv.position.set(4.2, 0, -2); tv.rotation.y = -Math.PI / 2; home.add(tv);
const tvScreen = screen(1.8, 1.05, (g, w, h) => { g.fillStyle = "#3a6fd8"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `900 ${h * .16}px Inter`; g.textAlign = "center"; g.fillText("LOCAL NEWS", w / 2, h * .45); g.font = `700 ${h * .09}px Inter`; g.fillText("Remembering last winter…", w / 2, h * .65); }, { emissive: 1.2 });
tvScreen.position.set(0, 1.5, .06); tv.add(tvScreen); { const fr = rbox(1.95, 1.2, .1, .03, "#111"); fr.position.set(0, 1.5, 0); tv.add(fr); const st = box(.8, .9, .5, "#3a2a1a"); st.position.set(0, .45, -.1); tv.add(st); }
const tvOff = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.05), mat("#0a0a0a", { roughness: .2 })); tvOff.position.set(0, 1.5, .07); tv.add(tvOff);
const paper = textPlane(.7, .5, 500, (g, w, h) => { g.fillStyle = "#f2efe6"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.font = "900 46px Inter"; g.textAlign = "center"; g.fillText("ONE YEAR AGO", w / 2, 70); g.font = "700 28px Inter"; g.fillText("Tragedy at Miller Pond", w / 2, 120); g.fillStyle = "#999"; for (let i = 0; i < 6; i++) g.fillRect(30, 160 + i * 28, w - 60, 10); });
paper.rotation.x = -Math.PI / 2; paper.position.set(.4, 1.02, -.3); home.add(paper);
const meH = mk(ME, home); toVisitor(meH);
const lilyH = mk(LILY, home), momH = mk(MOM, home), dadH = mk(DAD, home);
const phone = rbox(.08, .16, .03, .01, "#111"); dadH.arms[1].add(phone); phone.position.set(0, -.5, .1);
const gpaH = mk({ shirt: "#6b6b8a", pants: "#3a3a4a", hair: "#e6e6e6", hairStyle: "short", skin: "#f2c9a0", glasses: true }, home); toVisitor(gpaH);
const womH = mk({ shirt: "#ef476f", pants: "#3a3a4a", hair: "#7a3e1d", hairStyle: "long", skin: SKIN[1] }, home);
const kidH = mk({ shirt: "#ffbe0b", pants: "#2b2d42", hair: "#2a1d14", hairStyle: "short", skin: SKIN[1], scale: .7 }, home);

// ---------- moods ----------
let curMood = "";
function moodTown(m) {
  if (curMood === m) return; curMood = m;
  const L = { sunrise: [.9, 1.3, "#ffd0a0", [-20, 6, -10]], day: [1.0, 1.4, "#ffffff", [8, 14, 8]], sunset: [.7, 1.5, "#ff9a5a", [0, 4, -40]], dusk: [.35, .4, "#8a90ff", [0, 8, -30]] }[m];
  town.background = SKY[m]; town.userData.hemi.intensity = L[0]; town.userData.dl.intensity = L[1]; town.userData.dl.color.set(L[2]); town.userData.dl.position.set(...L[3]);
  town.fog = new THREE.Fog(m === "dusk" ? "#2a2f5a" : m === "sunset" ? "#ffb08a" : "#e6f0f8", 25, 80);
}
const allTown = [meT, lilyT, momT, dadT, gpa, kidA, womA];
const allHome = [meH, lilyH, momH, dadH, gpaH, womH, kidH];
const hideTown = () => { allTown.forEach(c => { c.root.visible = false; c.root.scale.setScalar(c.opts.scale || 1); c.rig.rotation.set(0, 0, 0); }); [...gpaPrints, ...lilyPrints, ...momPrints].forEach(p => p.visible = false); vanishT(new THREE.Vector3(), 0); vanishMe(new THREE.Vector3(), 0); };
const hideHome = () => allHome.forEach(c => { c.root.visible = false; });
const place = (c, x, z, ry = 0) => { c.root.visible = true; c.root.position.set(x, 0, z); c.root.rotation.y = ry; };

// ---------- shots ----------
const shots = [];
const shot = (t0, sc, from, to, update) => shots.push({ t0, sc, from, to, update });
const C = (p, l) => ({ p, l });

// hook: snowy town at sunrise, a visitor walks up to a family
shot(0, town, C([0, 6, 16], [0, 1.5, 0]), C([0, 3, 10], [0, 1.4, 1]), (lt, t) => {
  moodTown("sunrise"); hideTown(); snowT(t, 0, 2);
  place(womA, .6, 3.4, Math.PI); place(kidA, -.4, 3.2, Math.PI); pose(womA, "idle", t); pose(kidA, "idle", t);
  const k = clamp(lt / 3.5); place(gpa, 0, lerp(-6, 1.6, k), 0); pose(gpa, k < 1 ? "walk" : "wave", t); gpa.setExpr("smile");
  womA.setExpr(k > .8 ? "laugh" : "shock"); kidA.setExpr(k > .8 ? "laugh" : "shock");
});
// rule1: eat, laugh, hug (interior)
shot(S.rule1.start, home, C([2.2, 2.4, 4.4], [1.2, 1.2, -.6]), C([1.8, 2.1, 3.4], [1.2, 1.3, -.6]), (lt, t) => {
  hideHome(); sheet.visible = sheetTop.visible = false; tvOff.visible = true; paper.visible = false; pancakes.visible = true;
  place(gpaH, 1.2, -1.5, 0); pose(gpaH, t > at("rule1", "laugh") ? "laugh" : "sit", t); gpaH.setExpr("laugh");
  place(womH, .1, -.6, Math.PI / 2); pose(womH, "sit", t); womH.setExpr("laugh");
  place(kidH, 2.3, -.6, -Math.PI / 2); pose(kidH, t > at("rule1", "hug") ? "hold" : "sit", t); kidH.setExpr("laugh");
  if (t > at("rule1", "hug")) { kidH.root.position.set(1.6, 0, -1.1); kidH.root.rotation.y = Math.PI * .8; }
});
// rule2: mirror without the visitor
shot(S.rule2.start, home, C([-.6, 1.7, .4], [-3.2, 1.45, -4.1]), C([-1.0, 1.65, -.3], [-3.2, 1.45, -4.1]), (lt, t) => {
  hideHome(); sheet.visible = sheetTop.visible = false; pancakes.visible = false;
  place(gpaH, -4.3, -2.6, Math.PI * .85); place(womH, -3.6, -2.9, Math.PI * .9); place(kidH, -2.9, -2.7, Math.PI * .95);
  [gpaH, womH, kidH].forEach(c => { pose(c, "idle", t); c.setExpr("smile"); });
});
shot(at("rule2", "footprints", 2.5) - .2, town, C([4.5, 2.6, 8], [1.5, .2, 3]), C([4, 2.3, 6.5], [1.4, .2, 2]), (lt, t) => {
  moodTown("day"); hideTown(); snowT(t, 1, 3);
  const k = clamp(lt / 4);
  place(gpa, 2, lerp(6.6, -1, k), Math.PI); pose(gpa, "walk", t); place(womA, .6, lerp(6.6, -1, k), Math.PI); pose(womA, "walk", t);
  gpaPrints.forEach((p, i) => { const tz = 6 - i * .55; const passed = (6.6 - lerp(6.6, -1, k)) > (6 - tz); p.visible = passed; p.material.opacity = passed ? clamp(1 - ((6.6 - lerp(6.6, -1, k)) - (6 - tz) - .3) * 1.4, 0, .9) : 0; });
  momPrints.forEach((p, i) => { const tz = 6 - i * .55; p.visible = (6.6 - lerp(6.6, -1, k)) > (6 - tz); p.material.opacity = .9; });
});
shot(at("rule2", "never", 5) - .1, home, C([0, 1.9, 2.8], [-.2, 1.6, 0]), C([0, 1.85, 2.2], [-.2, 1.7, 0]), (lt, t) => {
  hideHome(); place(gpaH, -.2, 0, 0); pose(gpaH, "shrug", t); gpaH.setExpr("flat");
});
// rule3: told -> vanish
shot(S.rule3.start, town, C([0, 2.2, 6.5], [0, 1.4, 1.5]), C([0, 2, 5.4], [0, 1.5, 1.5]), (lt, t) => {
  moodTown("day"); hideTown(); snowT(t, 0, 2);
  place(womA, .7, 1.8, -.6); place(kidA, -.6, 2.2, .5);
  const tV = at("rule3", "vanish", 4.5);
  const k = clamp((t - tV) / .5);
  place(gpa, 0, 1.4, 0); pose(gpa, "idle", t); gpa.setExpr(t > tV - .6 ? "shock" : "smile"); gpa.root.scale.setScalar(Math.max(.001, 1 - k));
  vanishT(new THREE.Vector3(0, 0, 1.4), clamp((t - tV) / 1.2));
  pose(kidA, t > tV ? "headhold" : "point", t); kidA.setExpr(t > tV ? "shock" : "flat"); pose(womA, t > tV ? "headhold" : "idle", t); womA.setExpr(t > tV ? "sad" : "flat");
});
// rule4: cover mirrors, hide paper, smile too much
shot(S.rule4.start, home, C([-1.2, 2.1, 2.4], [-3, 1.5, -3.6]), C([-1.6, 2, 1.6], [-3, 1.5, -3.8]), (lt, t) => {
  hideHome(); pancakes.visible = false; paper.visible = true;
  const k = easeOut((t - S.rule4.start - .3) / .7); sheet.visible = sheetTop.visible = true; sheet.position.y = lerp(4.5, 1.45, k); sheetTop.position.y = lerp(5.9, 2.9, k);
  place(womH, -2.4, -2.8, Math.PI * .85); pose(womH, "hold", t); womH.setExpr(t > at("rule4", "smile") ? "grin" : "flat");
  place(kidH, -1.4, -2.2, Math.PI * .7); pose(kidH, "idle", t); kidH.setExpr(t > at("rule4", "smile") ? "grin" : "flat");
  if (t > at("rule4", "smile")) { womH.root.rotation.y = 0; kidH.root.rotation.y = 0; }
});
// intro: me + lily, then the pond with the hole
shot(S.intro.start, town, C([0, 1.6, 4.2], [0, 1.1, 0]), C([0, 1.5, 3.4], [0, 1.0, 0]), (lt, t) => {
  moodTown("day"); hideTown(); snowT(t, 0, 0);
  place(meT, -.5, 0, .2); pose(meT, "wave", t, .6); meT.setExpr("smile");
  place(lilyT, .5, .2, -.2); pose(lilyT, "cheer", t, .5); lilyT.setExpr("laugh");
});
shot(at("intro", "last", 3.5) - .2, town, C([6, 6, -20], [pondPos.x + 2, 0, pondPos.z - 2]), C([4.5, 4.4, -23], [pondPos.x + 2, 0, pondPos.z - 2]), (lt, t) => {
  moodTown("dusk"); hideTown(); snowT(t, 0, -26);
});
// morning: sheet-covered mirror, dad on phone, mom pancakes
shot(S.morning.start, home, C([-1, 2.1, 2.2], [-3.2, 1.6, -4]), C([-1.4, 2, 1.4], [-3.2, 1.6, -4]), (lt, t) => {
  hideHome(); sheet.visible = sheetTop.visible = true; sheet.position.y = 1.45; sheetTop.position.y = 2.9; paper.visible = true; pancakes.visible = true; tvOff.visible = false;
  place(dadH, -1.2, -2.8, .6); pose(dadH, "wave", t, 0); dadH.arms[1].rotation.set(-2.6, 0, -.4); dadH.setExpr("sad");
});
shot(at("morning", "mom", 4.5) - .1, home, C([2.6, 2.2, 2.6], [1.2, 1.1, -.6]), C([2.0, 1.9, 1.8], [1.2, 1.05, -.6]), (lt, t) => {
  hideHome(); pancakes.visible = true; paper.visible = true;
  place(momH, 1.2, -1.7, 0); pose(momH, "hold", t); momH.setExpr(t > at("morning", "nobody", 7.5) ? "sad" : "smile");
});
// knew
shot(S.knew.start, home, C([2.6, 1.8, 2.8], [1.2, 1.2, -.6]), C([2.2, 1.7, 2.2], [1.2, 1.25, -.6]), (lt, t) => {
  hideHome(); pancakes.visible = true; paper.visible = true;
  place(lilyH, 2.2, -.6, -Math.PI / 2); pose(lilyH, "sit", t); lilyH.setExpr("laugh");
  place(meH, .2, -.6, Math.PI / 2); pose(meH, "sit", t); meH.setExpr(t > at("knew", "swore", 2) ? "angry" : "flat");
});
// hide: paper, TV, onions
shot(S.hide.start, home, C([2.4, 2.2, 3], [2.6, 1.2, -1.4]), C([2, 2, 2.4], [2.8, 1.3, -1.6]), (lt, t) => {
  hideHome(); pancakes.visible = true;
  const tP = at("hide", "hid"), tT = at("hide", "unplugged", 1.5);
  paper.visible = t < tP + .3; tvOff.visible = t > tT + .2;
  place(meH, 2.6, -1.4, t > tT ? -1.2 : Math.PI * .9); pose(meH, t > tT - .2 && t < tT + .6 ? "point" : "idle", t); meH.setExpr("flat");
  place(lilyH, 1.6, .2, Math.PI * .7); pose(lilyH, "idle", t); lilyH.setExpr("flat");
});
shot(at("hide", "when", 3.3) - .1, home, C([0, 1.8, 3.2], [0, 1.2, 0]), C([0, 1.75, 2.6], [0, 1.25, 0]), (lt, t) => {
  hideHome(); tvOff.visible = true; paper.visible = false;
  place(momH, -1.4, -1.4, .5); pose(momH, "facepalm", t); momH.setExpr("sad");
  place(lilyH, .2, 0, -.4); pose(lilyH, "point", t); lilyH.setExpr("flat");
  place(meH, 1.1, .3, -.6); pose(meH, t > at("hide", "onions", 5.5) ? "shrug" : "idle", t); meH.setExpr(t > at("hide", "onions", 5.5) ? "grin" : "flat");
});
// day: lily holds my hand, walks behind me "in my footprints" — only ONE trail of small prints exists
shot(S.day.start, town, C([-3.2, 1.8, 6], [-5, .8, 1]), C([-3.6, 1.7, 3.6], [-5, .7, -1.5]), (lt, t) => {
  moodTown("day"); hideTown(); snowT(t, -5, 0);
  const z = 3.4 - lt * .7;
  place(meT, -5 + Math.sin((4 - z) / .7 * .12) * .6, z, Math.PI); pose(meT, "walk", t);
  place(lilyT, -5 + Math.sin((4 - z - 1.2) / .7 * .12) * .6, z + 1.0, Math.PI); pose(lilyT, "walk", t + .3); lilyT.setExpr("smile");
  lilyPrints.forEach((p, i) => { p.visible = (4 - i * .7) > z + .6; });
});
// dog + dad
shot(S.dog.start, town, C([-3.4, 1.4, 10.4], [-5.2, .4, 7.3]), C([-3.8, 1.2, 9.4], [-5.2, .4, 7.3]), (lt, t) => {
  moodTown("day"); hideTown(); snowT(t, -6, 7);
  dog.position.x = -5.2 + Math.sin(t * 30) * .02; dog.rotation.y = Math.PI * .75;
  place(meT, -3.8, 8.6, -2.4); pose(meT, "idle", t); place(lilyT, -3.2, 8.9, -2.4); pose(lilyT, "idle", t);
});
shot(at("dog", "dad", 4.5) - .1, town, C([-5.2, 1.9, 9.4], [-6, 1.8, 6.6]), C([-5.4, 1.85, 8.4], [-6, 1.8, 6.6]), (lt, t) => {
  moodTown("day"); hideTown(); place(dadT, -6, 6.6, 0); dadT.root.position.y = .45; pose(dadT, "idle", t); dadT.setExpr("sad"); dadT.head.rotation.y = .3;
});
// run to the pond (late afternoon)
shot(S.run.start, town, C([3, 3.2, -10], [0, .6, -18]), C([2.4, 2.6, -16], [0, .5, -24]), (lt, t) => {
  moodTown("sunset"); hideTown(); snowT(t, 0, -18);
  const k = clamp(lt / (S.run.end - S.run.start));
  place(lilyT, -.4, lerp(-12, -23, k), Math.PI); pose(lilyT, "walk", t * 1.6); lilyT.setExpr("sad");
  place(meT, .5, lerp(-9.5, -21.5, k), Math.PI); pose(meT, "walk", t * 1.7); meT.setExpr("shock");
  lilyPrints.forEach((p, i) => { p.position.set(-.4 + (i % 2 ? .11 : -.11), .012, -12 + 1.2 - i * .5); p.visible = p.position.z > lilyT.root.position.z + .3 && i < 30; });
});
// edge + lily1 (close on lily)
shot(S.edge.start, town, C([1.2, 1.3, -19.6], [0, .7, -23.4]), C([1, 1.15, -20.6], [0, .7, -23.4]), (lt, t) => {
  moodTown("sunset"); hideTown(); snowT(t, 0, -22);
  place(lilyT, 0, -23.4, 0); pose(lilyT, "idle", t); lilyT.setExpr("sad");
  place(meT, .9, -22.4, -.6); pose(meT, "idle", t); meT.setExpr("shock");
});
// look: down at the ice — Lily reflected, next to her nobody
shot(S.look.start, town, C([.6, 3.2, -21.4], [.4, 0, -24.6]), C([.5, 2.8, -22.2], [.4, 0, -24.8]), (lt, t) => {
  moodTown("sunset"); hideTown();
  place(lilyT, 0, -23.4, Math.PI); pose(lilyT, "idle", t); lilyT.setExpr("sad");
  place(meT, .9, -23.3, Math.PI); pose(meT, "idle", t); meT.setExpr("shock");
});
// prints: one set of small footprints behind us
shot(S.prints.start, town, C([.2, 2.6, -24.6], [0, 0, -18]), C([.2, 3.4, -25], [0, 0, -15]), (lt, t) => {
  moodTown("sunset"); hideTown(); snowT(t, 0, -18);
  place(lilyT, 0, -23.4, 0); pose(lilyT, "idle", t); place(meT, .9, -23.3, 0); pose(meT, "idle", t);
  lilyPrints.forEach((p, i) => { p.position.set(-.1 + (i % 2 ? .11 : -.11), .012, -22.8 + i * .5); p.visible = i < 30; });
});
// realize: quick flashback cuts
const fb = (t0, setup) => shot(t0, home, setup[0], setup[1], setup[2]);
fb(S.realize.start, [C([-2, 1.9, -1.4], [-3.2, 1.6, -4]), C([-2.2, 1.85, -2], [-3.2, 1.6, -4]), (lt, t) => { hideHome(); sheet.visible = sheetTop.visible = true; sheet.position.y = 1.45; sheetTop.position.y = 2.9; }]);
fb(at("realize", "pancakes", 1.2) - .1, [C([1.6, 1.8, .6], [1.2, 1.05, -.6]), C([1.5, 1.7, .2], [1.2, 1.05, -.6]), (lt, t) => { hideHome(); pancakes.visible = true; }]);
shot(at("realize", "dad", 2.4) - .1, town, C([-5.3, 1.85, 8.2], [-6, 1.8, 6.6]), C([-5.4, 1.85, 7.8], [-6, 1.8, 6.6]), (lt, t) => { moodTown("day"); hideTown(); place(dadT, -6, 6.6, 0); dadT.root.position.y = .45; pose(dadT, "idle", t); dadT.setExpr("sad"); });
shot(at("realize", "never", 3.5) - .1, town, C([1.4, 1.2, -21.6], [.9, 1.1, -23.3]), C([1.3, 1.15, -22.1], [.9, 1.1, -23.3]), (lt, t) => { moodTown("sunset"); hideTown(); place(meT, .9, -23.3, .4); pose(meT, "headhold", t); meT.setExpr("shock"); });
// why / wipe / lily2
shot(S.why.start, town, C([.4, 1.2, -21.4], [.4, .9, -23.4]), C([.4, 1.15, -21.9], [.4, .9, -23.4]), (lt, t) => {
  moodTown("sunset"); hideTown(); place(meT, .9, -23.3, -.5); pose(meT, "idle", t); meT.setExpr("sad"); place(lilyT, 0, -23.4, .5); pose(lilyT, "idle", t); lilyT.setExpr("sad");
});
shot(S.wipe.start, town, C([-.4, .95, -22.2], [0, .75, -23.4]), C([-.35, .92, -22.5], [0, .78, -23.4]), (lt, t) => {
  moodTown("sunset"); hideTown(); place(lilyT, 0, -23.4, .3); pose(lilyT, "facepalm", t); lilyT.setExpr(t > S.lily2.start ? "smile" : "sad");
});
// hug
shot(S.hug.start, town, C([2.4, 1.6, -20.4], [.45, .8, -23.4]), C([2, 1.4, -21.4], [.45, .8, -23.4]), (lt, t) => {
  moodTown("sunset"); hideTown(); snowT(t, 0, -22);
  place(meT, .7, -23.4, -Math.PI / 2); place(lilyT, .2, -23.4, Math.PI / 2);
  pose(meT, "hold", t); pose(lilyT, "hold", t); meT.arms.forEach(a => a.rotation.x = -1.6); lilyT.arms.forEach(a => a.rotation.x = -1.6);
  meT.setExpr(t > at("hug", "stay", 2.5) ? "smile" : "closed"); lilyT.setExpr(t > at("hug", "laughed", 5) ? "laugh" : "sad");
});
// end: sun goes down, I vanish; Lily walks home alone in her own prints
shot(S.end.start, town, C([3, 2.4, -19.5], [.4, .8, -23.4]), C([4, 3.4, -17], [.2, .6, -22]), (lt, t) => {
  moodTown(t > at("end", "down", 1.4) ? "dusk" : "sunset"); hideTown(); snowT(t, 0, -22);
  const tD = at("end", "down", 1.4);
  const k = clamp((t - tD) / .6);
  place(meT, .7, -23.4, -Math.PI / 2); pose(meT, "idle", t); meT.setExpr("smile"); meT.root.scale.setScalar(Math.max(.001, (ME.scale) * (1 - k)));
  vanishMe(new THREE.Vector3(.7, 0, -23.4), clamp((t - tD) / 1.4));
  const w = clamp((t - at("end", "walked", 2.8)) / 3);
  place(lilyT, .2, lerp(-23.4, -18, w), w > 0 ? 0 : Math.PI / 2); pose(lilyT, w > 0 ? "walk" : "idle", t); lilyT.setExpr("sad");
  lilyPrints.forEach((p, i) => { p.position.set(.2 + (i % 2 ? .11 : -.11), .012, -22.8 + i * .5); p.visible = i < 30; });
});
shot(S.cta.start, town, C([4, 3.4, -17], [.2, .6, -20]), C([6, 7, -12], [0, .5, -18]), (lt, t) => {
  moodTown("dusk"); hideTown(); snowT(t, 0, -18);
  place(lilyT, .2, -18 + lt * .4, 0); pose(lilyT, "walk", t);
  lilyPrints.forEach((p, i) => { p.position.set(.2 + (i % 2 ? .11 : -.11), .012, -22.8 + i * .5); p.visible = i < 30; });
});
shots.sort((a, b) => a.t0 - b.t0);

function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : window.TOTAL;
  const k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k)); cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k));
  [...allTown, ...allHome].forEach(c => { c.head.rotation.set(0, 0, 0); });
  s.update(t - s.t0, t);
  renderer.render(s.sc, cam);
}

// ---------- captions, bubbles, end cards ----------
const KEY = new Set(["visit", "mirrors", "mirror", "footprints", "dead", "vanish", "lily", "lily's", "ice", "pond", "nobody", "mine", "one", "small", "sunset", "sunrise", "goodbye", "onions", "forever"]);
const capsEl = document.getElementById("caps");
const tl = gsap.timeline({ paused: true });
CAPS.forEach(c => {
  const d = document.createElement("div"); d.className = "cap";
  d.innerHTML = c.text.split(" ").map(w => KEY.has(w.toLowerCase().replace(/[^a-z']/g, "")) ? `<span class="hk">${w}</span>` : w).join(" ");
  capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0);
  tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0);
  tl.set(d, { opacity: 0 }, c.t1);
  if (capsEl.children.length > 1) tl.set(capsEl.children[capsEl.children.length - 2], { opacity: 0 }, c.t0);
});
const SB = [
  ["You're... dead.", "l", at("rule3", "if", 2) - .1, at("rule3", "vanish", 4.5) + .4, "KID"],
  ["Why is Mom crying?", "c", at("hide", "when", 3.3), at("hide", "onions", 5.5) - .1, "LILY"],
  ["Onions!", "r", at("hide", "onions", 5.5), S.hide.end + .2, "ME"],
];
SB.forEach(([txt, cls, t0, t1, who]) => {
  const d = document.createElement("div"); d.className = "sb " + cls; d.innerHTML = `<small>${who}</small>${txt}`; document.getElementById("root").appendChild(d);
  tl.fromTo(d, { opacity: 0, scale: .6, xPercent: cls.startsWith("c") ? -50 : 0 }, { opacity: 1, scale: 1, duration: .22, ease: "back.out(3)", immediateRender: false }, t0);
  tl.set(d, { opacity: 0 }, t1);
});
tl.fromTo("#wait", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .25, immediateRender: false }, 3.0); tl.set("#wait", { opacity: 0 }, 7.5);
tl.fromTo("#clock", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .2, immediateRender: false }, S.run.start); tl.set("#clock", { opacity: 0 }, S.run.start + 2.6);
tl.fromTo("#q", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2.5)", immediateRender: false }, S.cta.end + .05);
tl.fromTo("#follow", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)", immediateRender: false }, S.cta.end + .45);
const clock = { t: 0 };
tl.to(clock, { t: window.TOTAL, duration: window.TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0); draw(0);
