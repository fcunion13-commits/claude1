// "Body Count" – In this town… horror twist. Original characters and story.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, canvasTex, redraw, roundRect, textPlane,
  makeChar, pose, makeLabel, baseScene, ground, room, house, tree, sign, screen, skyTex,
  chair, sitOn, pine, car, streetlamp, fence, mailbox, bench, chimneySmoke, townsfolk, decorateLivingRoom,
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
const cam = new THREE.PerspectiveCamera(50, W / H, .1, 300);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];
const num = (txt, world = .9) => makeLabel(txt, { world, w: 512, h: 300, size: 220, stroke: 26, depthTest: false });

// ---------- characters ----------
const ME = { shirt: "#2ec4b6", pants: "#2b2d42", hair: "#5a3a1a", hairStyle: "spiky", skin: "#f2c9a0", scale: .8 };
const GMA = { shirt: "#b5523b", pants: "#6b4a5a", hair: "#e6e6e6", hairStyle: "bun", skin: "#f7d7b8", glasses: true, scale: .92 };
const MAX = { shirt: "#ffbe0b", pants: "#2b2d42", hair: "#111", hairStyle: "short", skin: "#8d5a3b", scale: .8 };
const apron = (ch) => { const a = rbox(.42, .5, .04, .03, "#fff3e6"); a.position.set(0, .7, .19); ch.rig.add(a); const p = rbox(.2, .12, .02, .02, "#ff8fb1"); p.position.set(0, .62, .215); ch.rig.add(p); };
const mkC = (o, sc) => { const c = makeChar(o); sc.add(c.root); return c; };

// ---------- props ----------
const pie = (whole = true) => {
  const g = new THREE.Group();
  const tin = new THREE.Mesh(new THREE.CylinderGeometry(.34, .28, .08, 28, 1, false, 0, whole ? Math.PI * 2 : Math.PI / 3), mat("#c8c8c8", { metalness: .4 })); g.add(tin);
  const crust = new THREE.Mesh(new THREE.CylinderGeometry(.33, .3, .1, 28, 1, false, 0, whole ? Math.PI * 2 : Math.PI / 3), mat("#d8964a")); crust.position.y = .05; g.add(crust);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .02, 28, 1, false, 0, whole ? Math.PI * 2 : Math.PI / 3), mat("#b0122a", { roughness: .4 })); top.position.y = .1; g.add(top);
  if (whole) for (let i = -2; i <= 2; i++) for (const r of [0, Math.PI / 2]) { const s = box(.58 - Math.abs(i) * .1, .02, .04, "#e8a85a"); s.position.set(r ? 0 : i * .1, .12, r ? i * .1 : 0); s.rotation.y = r; g.add(s); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
};
const truck = (sc, x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g); const b = rbox(2, 2, 3.6, .1, "#f2f2f2"); b.position.set(0, 1.4, -.6); g.add(b); const c = rbox(1.9, 1.3, 1.3, .15, "#2f5fa0"); c.position.set(0, 1.05, 1.8); g.add(c);
  const lg = sign("MOVING", { w: 2.6, h: .6, bg: "#f2f2f2", fg: "#2f5fa0", size: 110 }); lg.position.set(1.01, 1.6, -.6); lg.rotation.y = Math.PI / 2; g.add(lg);
  for (const sx of [-.95, .95]) for (const sz of [-1.6, 1.7]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .25, 16), mat("#1b1b1b")); w.rotation.z = Math.PI / 2; w.position.set(sx, .38, sz); g.add(w); } return g; };
const boxes = (sc, x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); sc.add(g); [[0, .25, 0], [.6, .25, .1], [.3, .75, 0], [-.6, .25, .2]].forEach(([a, b, c]) => { const bx = box(.55, .5, .5, "#c8a06a"); bx.position.set(a, b, c); g.add(bx); }); return g; };

// ============ SET A: autumn street ============
const st = baseScene({ sky: ["#ffb98a", "#ffe9c8"], sun: 1.3, amb: .9 });
const SKY = { day: skyTex("#8ec5ff", "#fff2dc"), evening: skyTex("#3a2a6b", "#ff9a5c"), night: skyTex("#070a1c", "#1d2550"), morning: skyTex("#b8d8ff", "#fff0d8") };
ground(st, "#7fa84a", 140);
const road = box(6, .02, 70, "#6b6b70"); road.position.set(0, .012, 0); road.receiveShadow = true; st.add(road);
for (let z = -30; z < 30; z += 3) { const d = box(.12, .02, 1.4, "#f2e6a0"); d.position.set(0, .02, z); st.add(d); }
const sidewalk = (x) => { const s = box(1.6, .05, 70, "#c9c2b5"); s.position.set(x, .03, 0); s.receiveShadow = true; st.add(s); }; sidewalk(-3.8); sidewalk(3.8);
// grandma's house (left) and the Parkers' house (right), facing the road
const gHouse = house(st, -8, 0, { wall: "#f6d5b2", roof: "#7a3b2e", ry: Math.PI / 2, lit: true, w: 3.6, h: 2.6, d: 3.4 });
const pHouse = house(st, 8, 0, { wall: "#cfe3f7", roof: "#3a4a6a", ry: -Math.PI / 2, lit: false, w: 3.6, h: 2.6, d: 3.4 });
const smokeG = chimneySmoke(st, gHouse, .7, -.4, 3.6);
[[-8, -9, "#d8f0d0", "#3d7a4a", Math.PI / 2], [8, -9, "#f2e2a2", "#8d5a3b", -Math.PI / 2], [-8, 9, "#efe0ff", "#6a4aa5", Math.PI / 2], [8, 9, "#f4c6c6", "#a03c3c", -Math.PI / 2], [-8, -18, "#e6d29c", "#5a3a2a", Math.PI / 2], [8, -18, "#9cc5e6", "#2f4a7a", -Math.PI / 2]].forEach(([x, z, w_, r_, ry]) => house(st, x, z, { wall: w_, roof: r_, ry, lit: true }));
srand(5); for (let i = 0; i < 18; i++) { const sx = i % 2 ? 1 : -1; const tz = -24 + i * 2.8 + rnd(); if (Math.abs(tz) < 7) continue; const t = tree(st, sx * (5.3 + rnd() * .4), tz, .9 + rnd() * .3); t.children[1].material = mat(["#e07b39", "#d9a03a", "#c0482b", "#e8c14a"][i % 4]); }
[[-5.2, -5], [5.2, -5], [-5.2, 5], [5.2, 5], [-5.2, 14], [5.2, 14]].forEach(([x, z]) => streetlamp(st, x, z));
fence(st, -8, 2.6, 3.6, 0); fence(st, -8, -2.6, 3.6, 0); mailbox(st, -5, 1.8, Math.PI / 2); mailbox(st, 5, 1.8, -Math.PI / 2);
car(st, 2, 7, 0, "#c0392b", false); car(st, -2.1, -8, Math.PI, "#2f8f5a", false);
const leaves = []; srand(8); for (let i = 0; i < 80; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(.14, .1), mat(["#e07b39", "#d9a03a", "#c0482b"][i % 3], { side: THREE.DoubleSide })); l.rotation.x = -Math.PI / 2; l.rotation.z = rnd() * 6; l.position.set((rnd() - .5) * 14, .04, (rnd() - .5) * 30); st.add(l); }
// porch for grandma
const porch = new THREE.Group(); porch.position.set(-6.1, 0, 0); st.add(porch);
{ const d = box(1.4, .3, 3, "#8b5a2b"); d.position.y = .15; porch.add(d); }
const rock = chair(st, -6.3, .9, Math.PI / 2, .78, "#6b4423");
const truckT = truck(st, 4.6, -2.5, 0); const boxesT = boxes(st, 5.8, 2.2);
const pieOnHand = pie(true); st.add(pieOnHand);
// cast on street
const meS = mkC(ME, st), gmaS = mkC(GMA, st), maxS = mkC(MAX, st); apron(gmaS);
const pMom = mkC({ shirt: "#ef476f", pants: "#3a3a4a", hair: "#7a3e1d", hairStyle: "long", skin: SKIN[2] }, st);
const pDad = mkC({ shirt: "#118ab2", pants: "#2b2d42", hair: "#111", hairStyle: "short", skin: SKIN[2] }, st);
const kids = [0, 1, 2, 3].map(i => mkC({ shirt: ["#ff7b54", "#6c63ff", "#06d6a0", "#f78c6b"][i], pants: "#2b2d42", hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i], hairStyle: ["short", "long", "bun", "spiky"][i], skin: SKIN[i], scale: .78 }, st));
const adults = [0, 1].map(i => mkC({ shirt: ["#5a5a7a", "#7a5c3e"][i], pants: "#2b2d42", hair: ["#555", "#2a1d14"][i], hairStyle: "short", skin: SKIN[i + 3], glasses: !!i }, st));
const npc = townsfolk(st, 6, [[3.8, 20, 3.8, -20], [-3.8, -20, -3.8, 20], [3.6, -14, 3.6, 12], [-4, 10, -4, -12], [9.5, 6, 9.5, 12], [-9.6, -12, -9.6, -6]], 33);
// labels
const L = {}; const lbl = (key, txt, world, sc = st) => { L[key] = num(txt, world); sc.add(L[key].sprite); return L[key]; };
lbl("me", "0"); lbl("gma", "47"); lbl("max", "0"); lbl("pMom", "0"); lbl("pDad", "0");
kids.forEach((k, i) => lbl("k" + i, "0", .7)); adults.forEach((a, i) => lbl("a" + i, "0"));
const follow = (key, ch, dy = 2.15) => { const l = L[key]; const s = ch.opts.scale || 1; l.sprite.position.set(ch.root.position.x, ch.root.position.y + dy * s + .2, ch.root.position.z); l.sprite.visible = ch.root.visible; };

// ============ SET B: grandma's kitchen ============
const kit = baseScene({ sky: ["#fff", "#fff"], sun: 1.0, amb: .9 });
room(kit, { w: 11, d: 9, h: 4, wall: "#f3e2c8", floor: "#9a6a42" });
const deco = decorateLivingRoom(kit, { w: 11, d: 9, h: 4 });
const winK = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), new THREE.MeshBasicMaterial({ color: "#dfefff" })); winK.position.set(2.8, 2.2, -4.38); kit.add(winK);
const tableK = rbox(1.7, .12, 1.2, .04, "#c69c6d"); tableK.position.set(1.2, .95, -.2); kit.add(tableK); for (const [x, z] of [[-.7, -.45], [.7, -.45], [-.7, .45], [.7, .45]]) { const l = box(.1, .95, .1, "#7a5230"); l.position.set(1.2 + x, .47, -.2 + z); kit.add(l); }
chair(kit, -.3, -.2, Math.PI / 2, .48); chair(kit, 2.7, -.2, -Math.PI / 2, .48);
const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .9), mat("#d9e6f2")); cloth.rotation.x = -Math.PI / 2; cloth.position.set(1.2, 1.015, -.2); kit.add(cloth);
const pieK = pie(true); pieK.position.set(1.5, 1.03, -.35); kit.add(pieK);
const plate = new THREE.Mesh(new THREE.CylinderGeometry(.22, .19, .03, 24), mat("#ffffff")); plate.position.set(.6, 1.03, -.2); kit.add(plate);
const slice = pie(false); slice.position.set(.55, 1.05, -.25); slice.rotation.y = 2.2; kit.add(slice);
const fork = box(.03, .02, .25, "#c8c8c8"); fork.position.set(.6, 1.04, .05); kit.add(fork);
const counterPie = pie(true); counterPie.position.set(4.6, .99, -1.6); kit.add(counterPie);
const meK = mkC(ME, kit), gmaK = mkC(GMA, kit); apron(gmaK);
const lblK = { me: num("0", .9), gma: num("48", .9) }; kit.add(lblK.me.sprite); kit.add(lblK.gma.sprite);
const ceilLamp = new THREE.PointLight("#ffe0b0", 10, 9); ceilLamp.position.set(1.2, 3.6, -.2); kit.add(ceilLamp);

// ============ SET C: winter garden ============
const gar = baseScene({ sky: ["#9fb6d0", "#e6eef6"], sun: .8, amb: .9 });
ground(gar, "#eef4f8", 60);
for (let i = 0; i < 4; i++) { const m = rbox(1.2, .35, .7, .3, "#5a3a24"); m.position.set(-2 + i * 1.4, .1, -1 - (i % 2) * .6); m.rotation.y = (i - 1.5) * .2; gar.add(m); }
const shovel = new THREE.Group(); shovel.position.set(2.6, 0, -.6); shovel.rotation.z = .25; gar.add(shovel); { const h = box(.06, 1.4, .06, "#7a5230"); h.position.y = .9; shovel.add(h); const bl = rbox(.3, .4, .04, .04, "#8a8f98", { metalness: .6 }); bl.position.y = .2; shovel.add(bl); }
fence(gar, 0, -3.2, 9, 0, "#e8e2d6"); house(gar, -2, -8, { wall: "#f6d5b2", roof: "#ffffff", lit: true }); pine(gar, 4.5, -5, 1.1); pine(gar, -5.5, -4.5, 1);
const gWin = new THREE.Group(); gar.add(gWin);
const snowG = (() => { srand(4); const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: "#fff" }); const f = []; for (let i = 0; i < 150; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.03, 5, 4), m); f.push({ s, x: (rnd() - .5) * 14, z: (rnd() - .5) * 10, y: rnd() * 6, v: .4 + rnd() * .4 }); g.add(s); } gar.add(g); return (t) => f.forEach(o => o.s.position.set(o.x, ((o.y - t * o.v) % 6 + 6) % 6, o.z)); })();

// ---------- moods ----------
let mood = "";
function moodSt(m) {
  if (mood === m) return; mood = m;
  const P = { day: [1, 1.4, "#fff2dc", [10, 14, 6]], evening: [.7, 1.2, "#ff9a5c", [-20, 5, 10]], night: [.3, .25, "#8a90ff", [6, 12, 8]], morning: [1, 1.2, "#fff0d8", [-10, 10, -6]] }[m];
  st.background = SKY[m]; st.userData.hemi.intensity = P[0]; st.userData.dl.intensity = P[1]; st.userData.dl.color.set(P[2]); st.userData.dl.position.set(...P[3]);
  st.fog = new THREE.Fog(m === "night" ? "#0a0f26" : "#ffe9d0", 22, 70);
}
const allSt = [meS, gmaS, maxS, pMom, pDad, ...kids, ...adults];
const hideSt = () => { allSt.forEach(c => c.root.visible = false); Object.values(L).forEach(l => l.sprite.visible = false); pieOnHand.visible = false; truckT.visible = false; boxesT.visible = false; };
const pl = (c, x, z, ry = 0) => { c.root.visible = true; c.root.position.set(x, 0, z); c.root.rotation.y = ry; };

// ---------- shots ----------
const shots = []; const shot = (t0, sc, from, to, update) => shots.push({ t0, sc, from, to, update }); const C = (p, l) => ({ p, l });
const labelsOn = () => { follow("me", meS); follow("gma", gmaS); follow("max", maxS); follow("pMom", pMom); follow("pDad", pDad); kids.forEach((k, i) => follow("k" + i, k)); adults.forEach((a, i) => follow("a" + i, a)); };

// hook: me with "0" (first frame), then grandma with "47"
shot(0, st, C([-3.2, 1.75, 2.9], [-4.8, 1.7, .4]), C([-3.4, 1.75, 2.5], [-4.8, 1.75, .4]), (lt, t) => {
  moodSt("day"); hideSt(); pl(meS, -4.6, .9, 1.2); pose(meS, "idle", t); meS.setExpr("smile"); labelsOn();
});
shot(at("hook", "grandma", 3.6) - .1, st, C([-3.2, 2.0, 1.4], [-5.0, 2.0, -.4]), C([-3.5, 2.0, 1.0], [-5.0, 2.05, -.4]), (lt, t) => {
  moodSt("day"); hideSt(); pl(gmaS, -5.0, -.4, 1.3); pose(gmaS, "wave", t, .6); gmaS.setExpr("grin"); labelsOn();
  const k = back((t - at("hook", "forty", 4.8)) / .35); L.gma.sprite.scale.set(.9 * Math.max(.3, k), .9 * 300 / 512 * Math.max(.3, k), 1);
});
// rule: kids joking, grown-ups serious
shot(S.rule.start, st, C([1.5, 2.6, 8], [3.8, 1.2, 2]), C([1.8, 2.3, 6.6], [3.8, 1.2, 2]), (lt, t) => {
  moodSt("day"); hideSt(); npc(t, true);
  kids.forEach((k, i) => { pl(k, 3.2 + (i % 2) * 1.2, 1.4 + Math.floor(i / 2) * 1.1, Math.PI * (i % 2 ? .7 : 1.3)); pose(k, t < at("rule", "grown", 5) ? "laugh" : "idle", t); k.setExpr(t < at("rule", "grown", 5) ? "laugh" : "flat"); });
  adults.forEach((a, i) => { pl(a, 5.6, 1.2 + i * 1.4, -Math.PI / 2 - .3); pose(a, t > at("rule", "pray", 7) ? "hold" : "idle", t); a.setExpr(t > at("rule", "grown", 5) ? "angry" : "flat"); });
  labelsOn();
});
// gma: knitting on porch, then pie in kitchen
shot(S.gma.start, st, C([-3.8, 2.1, 3.2], [-6.3, 1.1, .9]), C([-4.3, 1.9, 2.4], [-6.3, 1.15, .9]), (lt, t) => {
  moodSt("day"); hideSt(); npc(t, true);
  pl(gmaS, -6.3, .9, Math.PI / 2); pose(gmaS, "idle", t); sitOn(gmaS, .78); gmaS.rig.rotation.x = Math.sin(t * 2) * .05; gmaS.setExpr("smile");
  gmaS.arms.forEach((a, i) => a.rotation.set(-1.1 + Math.sin(t * 9 + i * 3) * .12, 0, i ? .35 : -.35));
  labelsOn();
});
shot(at("gma", "bakes", 4.2) - .1, kit, C([2.4, 2.4, 1.6], [4.4, 1.3, -1.6]), C([2.7, 2.2, 1.0], [4.4, 1.25, -1.6]), (lt, t) => {
  pl(gmaK, 4.1, -1.6, -Math.PI / 2 + .2); pose(gmaK, "hold", t); gmaK.setExpr("smile"); meK.root.visible = false;
  lblK.gma.set("47"); lblK.gma.sprite.position.set(4.1, 2.25, -1.6); lblK.me.sprite.visible = false; lblK.gma.sprite.visible = true;
  counterPie.visible = true; pieK.visible = slice.visible = plate.visible = fork.visible = false;
});
// clue1: night, family leaves, house goes dark
shot(S.clue1.start, st, C([-1.5, 4, 9], [7, 1.2, 0]), C([-.5, 3.4, 7], [7.5, 1.2, 0]), (lt, t) => {
  moodSt("night"); hideSt();
  truckT.visible = true; truckT.position.z = -2.5 - Math.max(0, t - at("clue1", "move", 3.2)) * 6;
});
// clue2: winter garden, fresh dirt
shot(S.clue2.start, gar, C([0, 3, 5.5], [0, .3, -1.2]), C([.4, 2.4, 4], [.2, .3, -1.2]), (lt, t) => { snowG(t); });
// max: moving in, playing
shot(S.max.start, st, C([1.2, 2.6, 9], [5.5, 1, 1]), C([1.6, 2.2, 7.2], [5.5, 1, 1]), (lt, t) => {
  moodSt("day"); hideSt(); npc(t, true); truckT.visible = true; truckT.position.z = -2.5; boxesT.visible = true;
  pl(pDad, 6.2, 1.2, -1.8); pose(pDad, "hold", t); pDad.setExpr("smile"); pl(pMom, 6.8, -.4, -1.6); pose(pMom, "wave", t); pMom.setExpr("laugh");
  pl(maxS, 4, 2.4, -2); pose(maxS, "wave", t); maxS.setExpr("laugh");
  labelsOn();
});
shot(at("max", "we", 4.5) - .1, st, C([-1.2, 1.6, 6], [1, .8, 3]), C([-1, 1.5, 5.2], [1, .8, 3]), (lt, t) => {
  moodSt("day"); hideSt(); npc(t, true);
  pl(meS, 0, 3.4, Math.PI / 2); pose(meS, "cheer", t, .7); meS.setExpr("laugh"); pl(maxS, 2, 2.8, -Math.PI / 2); pose(maxS, "cheer", t + .5, .7); maxS.setExpr("laugh"); labelsOn();
});
// pie: grandma brings pie to the Parkers at evening
shot(S.pie.start, st, C([1, 2.2, 6.5], [5.5, 1, 0]), C([2, 2, 5], [6, 1, 0]), (lt, t) => {
  moodSt("evening"); hideSt();
  const k = clamp(lt / 2.2); pl(gmaS, lerp(1.5, 5.4, k), lerp(1.5, .2, k), Math.PI / 2 - .3); pose(gmaS, k < 1 ? "walk" : "hold", t); gmaS.arms.forEach(a => a.rotation.x = -1.3); gmaS.setExpr("grin");
  pieOnHand.visible = true; pieOnHand.position.set(gmaS.root.position.x + .38, 1.0, gmaS.root.position.z - .1);
  pl(pMom, 6.3, -.1, -Math.PI / 2); pose(pMom, "idle", t); pMom.setExpr("laugh"); pl(maxS, 6.2, .8, -Math.PI / 2 - .3); pose(maxS, "idle", t); maxS.setExpr("smile");
  labelsOn();
});
// gone: morning, empty house, grandma says "moved away", 47 -> 48
shot(S.gone.start, st, C([2, 2.6, 6], [7.8, 1.4, 0]), C([3, 2.4, 4.6], [7.8, 1.4, 0]), (lt, t) => { moodSt("morning"); hideSt(); });
shot(at("gone", "above", 4.4) - .3, st, C([-3.2, 2.0, 1.4], [-5.0, 2.0, -.4]), C([-3.5, 2.05, 1.0], [-5.0, 2.05, -.4]), (lt, t) => {
  moodSt("morning"); hideSt(); pl(gmaS, -5.0, -.4, 1.3); pose(gmaS, "idle", t); gmaS.setExpr("smile"); labelsOn();
  const tN = at("gone", "forty", 5.6) - .1; L.gma.set(t > tN ? "48" : "47");
  const k = t > tN ? 1 + .25 * Math.max(0, 1 - (t - tN) * 2.5) : 1; L.gma.sprite.scale.set(.9 * k, .9 * 300 / 512 * k, 1);
});
// know: me realizes
shot(S.know.start, st, C([-3.3, 1.6, 2.2], [-4.6, 1.55, .9]), C([-3.6, 1.6, 1.85], [-4.6, 1.6, .9]), (lt, t) => {
  moodSt("morning"); hideSt(); pl(meS, -4.6, .9, 1.2); pose(meS, "idle", t); meS.setExpr("shock"); labelsOn(); L.me.set("0");
});
// tonight: kitchen at night, slice in front of me
shot(S.tonight.start, kit, C([1.2, 2.6, 3.6], [1.1, 1.0, -.2]), C([1.0, 2.2, 2.6], [.9, 1.05, -.2]), (lt, t) => {
  winK.material.color.set("#0b1030"); ceilLamp.intensity = 10;
  pl(meK, -.3, -.2, Math.PI / 2); pose(meK, "idle", t); sitOn(meK, .5); meK.setExpr("flat");
  pl(gmaK, .5, -1.4, .3); pose(gmaK, t > at("tonight", "smiled", 4.6) ? "idle" : "hold", t); gmaK.setExpr("grin");
  pieK.visible = true; plate.visible = true; slice.visible = t > at("tonight", "put", 2) ; fork.visible = slice.visible; counterPie.visible = false;
  lblK.me.set("0"); lblK.gma.set("48"); lblK.me.sprite.visible = lblK.gma.sprite.visible = true;
  lblK.me.sprite.position.set(-.3, 1.95, -.2); lblK.gma.sprite.position.set(.5, 2.2, -1.4);
});
// eat: close on grandma
shot(S.eat.start - .1, kit, C([1.6, 1.9, .9], [.5, 1.75, -1.4]), C([1.4, 1.85, .5], [.5, 1.8, -1.4]), (lt, t) => {
  winK.material.color.set("#0b1030");
  pl(gmaK, .5, -1.4, .55); pose(gmaK, "idle", t); gmaK.setExpr("grin"); meK.root.visible = false; pieK.visible = plate.visible = slice.visible = fork.visible = true; counterPie.visible = false;
  lblK.gma.set("48"); lblK.gma.sprite.visible = true; lblK.me.sprite.visible = false; lblK.gma.sprite.position.set(.5, 2.2, -1.4);
});
// flicker: her number flickers 48 / 49, the light flickers
shot(S.flicker.start, kit, C([-1.4, 1.6, 1.4], [.5, 1.7, -1.4]), C([-1.0, 1.65, .7], [.5, 1.9, -1.4]), (lt, t) => {
  winK.material.color.set("#0b1030");
  pl(meK, -.3, -.2, Math.PI / 2); pose(meK, "idle", t); sitOn(meK, .5); meK.setExpr("shock");
  pl(gmaK, .5, -1.4, .3); pose(gmaK, "idle", t); gmaK.setExpr("grin");
  pieK.visible = plate.visible = slice.visible = fork.visible = true; counterPie.visible = false;
  const tF = at("flicker", "flicker", 3);
  const fl = t > tF ? (Math.floor(t * 9) % 3 === 0) : false;
  lblK.gma.set(fl ? "49" : "48"); lblK.gma.sprite.material.opacity = t > tF ? (Math.floor(t * 13) % 4 === 1 ? .25 : 1) : 1;
  lblK.me.set("0"); lblK.me.sprite.visible = lblK.gma.sprite.visible = true; lblK.me.sprite.position.set(-.3, 1.95, -.2); lblK.gma.sprite.position.set(.5, 2.2, -1.4);
  ceilLamp.intensity = t > tF && Math.floor(t * 11) % 5 === 0 ? 1 : 10; deco.fireL.intensity = 6;
});
shot(S.cta.start, kit, C([-1.0, 1.65, .7], [.5, 1.9, -1.4]), C([2.6, 3.2, 3.8], [1, 1, -.4]), (lt, t) => {
  winK.material.color.set("#0b1030");
  pl(meK, -.3, -.2, Math.PI / 2); pose(meK, "idle", t); sitOn(meK, .5); meK.setExpr("shock");
  pl(gmaK, .5, -1.4, .3); pose(gmaK, "idle", t); gmaK.setExpr("grin");
  lblK.me.sprite.position.set(-.3, 1.95, -.2); lblK.gma.sprite.position.set(.5, 2.2, -1.4); lblK.gma.set(Math.floor(t * 9) % 3 === 0 ? "49" : "48"); lblK.me.sprite.visible = lblK.gma.sprite.visible = true; pieK.visible = plate.visible = slice.visible = fork.visible = true; counterPie.visible = false;
});
shots.sort((a, b) => a.t0 - b.t0);

function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : window.TOTAL;
  const k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k)); cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k));
  [...allSt, meK, gmaK].forEach(c => { c.root.position.y = 0; c.rig.rotation.set(0, 0, 0); });
  if (s.sc === st) { smokeG(t); npc(t, false); }
  if (s.sc === kit) { winK.material.color.set("#dfefff"); ceilLamp.intensity = 4; lblK.gma.sprite.material.opacity = 1; deco.fire.scale.y = 1 + Math.sin(t * 13) * .15; }
  s.update(t - s.t0, t);
  renderer.render(s.sc, cam);
}

// ---------- captions, bubbles, end ----------
const KEY = new Set(["body", "count", "zero", "forty-seven", "forty-eight", "grandma", "pie", "cherry", "neighbors", "night", "goodbye", "dug", "winter", "empty", "counts", "flicker", "max"]);
const capsEl = document.getElementById("caps");
const tl = gsap.timeline({ paused: true });
CAPS.forEach(c => {
  const d = document.createElement("div"); d.className = "cap";
  d.innerHTML = c.text.split(" ").map(w => KEY.has(w.toLowerCase().replace(/[^a-z-]/g, "")) ? `<span class="hk">${w}</span>` : w).join(" ");
  capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0);
  tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0);
  tl.set(d, { opacity: 0 }, c.t1);
  if (capsEl.children.length > 1) tl.set(capsEl.children[capsEl.children.length - 2], { opacity: 0 }, c.t0);
});
const SB = [
  ["Moved away, dear. 🙂", "l", at("gone", "moved", 2.6) - .1, at("gone", "above", 4.4) - .3, "GRANDMA ROSE"],
  ["Eat up, sweetheart. 🥧", "c", S.eat.start, S.flicker.start + .6, "GRANDMA ROSE"],
];
SB.forEach(([txt, cls, t0, t1, who]) => {
  const d = document.createElement("div"); d.className = "sb " + cls; d.innerHTML = `<small>${who}</small>${txt}`; document.getElementById("root").appendChild(d);
  tl.fromTo(d, { opacity: 0, scale: .6, xPercent: cls.startsWith("c") ? -50 : 0 }, { opacity: 1, scale: 1, duration: .22, ease: "back.out(3)", immediateRender: false }, t0);
  tl.set(d, { opacity: 0 }, t1);
});
tl.fromTo("#wait", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .25, immediateRender: false }, 2.2); tl.set("#wait", { opacity: 0 }, 6.6);
tl.fromTo("#winter", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .2, immediateRender: false }, S.clue2.start); tl.set("#winter", { opacity: 0 }, S.clue2.end + .2);
tl.fromTo("#morning", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .2, immediateRender: false }, S.gone.start); tl.set("#morning", { opacity: 0 }, S.gone.start + 2.4);
tl.fromTo("#q", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2.5)", immediateRender: false }, S.cta.end + .05);
tl.fromTo("#follow", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)", immediateRender: false }, S.cta.end + .45);
const clock = { t: 0 };
tl.to(clock, { t: window.TOTAL, duration: window.TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0); draw(0);
