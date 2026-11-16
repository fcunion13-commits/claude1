// "The Number" – In this town… story. Original characters and story.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, back, v3, srand, rnd, mat, rbox, box, canvasTex, redraw, roundRect, textPlane,
  makeChar, pose, makeLabel, baseScene, ground, room, house, tree, sign, screen, confetti,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";

const S = window.SEG, WORDS = window.WORDS, CAPS = window.CAPS;
// time of the first word in segment `seg` that starts with `w`
const at = (seg, w, fb = 0) => {
  const s = S[seg];
  const x = WORDS.find(q => q.t0 >= s.start - .05 && q.t0 <= s.end + .05 && q.w.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
  return x ? x.t0 : s.start + fb;
};

// ---------- renderer ----------
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const cam = new THREE.PerspectiveCamera(50, W / H, .1, 200);

// ---------- cast ----------
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];
const baby = (shirt, skin) => makeChar({ scale: .5, shirt, pants: shirt, skin, hairStyle: "none", shoes: shirt });

// ============ SET 1: nursery ============
const nursery = baseScene({ sky: ["#dff1fb", "#dff1fb"], sun: 1.2, amb: 1.1 });
room(nursery, { w: 12, d: 9, h: 4.2, wall: "#cfe9f5", floor: "#e9dcc7" });
const crib = (sc, x, z, col = "#ffffff") => {
  const g = new THREE.Group(); g.position.set(x, 0, z); sc.add(g);
  const base = rbox(1.5, .25, 1, .06, col); base.position.y = .7; g.add(base);
  const mat_ = rbox(1.4, .1, .9, .04, "#bfe3ff"); mat_.position.y = .86; g.add(mat_);
  for (let i = 0; i < 8; i++) { const b = box(.06, .6, .06, col); b.position.set(-.7 + i * .2, 1.05, .48); g.add(b); }
  const rail = box(1.5, .07, .07, col); rail.position.set(0, 1.35, .48); g.add(rail);
  for (const s of [-1, 1]) for (const zz of [-1, 1]) { const l = box(.08, .8, .08, col); l.position.set(s * .72, .4, zz * .46); g.add(l); }
  return g;
};
const nurseryBabies = [];
const nurseryLabels = [];
[[-3.4, "#ffc0d3", "0"], [-1.1, "#bfe3ff", "0"], [1.2, "#fff2a8", "2"], [3.5, "#c9f5d3", "0"]].forEach(([x, col, n], i) => {
  crib(nursery, x, -2.2);
  const b = baby(col, SKIN[i]); b.root.position.set(x, .92, -2.25); b.root.rotation.x = -.1; nursery.add(b.root); nurseryBabies.push(b);
  const L = makeLabel(n, { world: 1.3 }); L.sprite.position.set(x, 2.25, -2.2); nursery.add(L.sprite); nurseryLabels.push(L);
});
const win1 = sign("MATERNITY", { w: 3.2, h: .6, bg: "#ff8fb1", fg: "#ffffff", size: 110 }); win1.position.set(0, 3.5, -4.38); nursery.add(win1);
// Leo's crib + parents + nurse (front)
crib(nursery, 0, 1.2, "#ffe7a3");
const leoBaby = baby("#9ad0ff", "#f2c9a0"); leoBaby.root.position.set(0, .92, 1.15); leoBaby.root.rotation.x = -.1; nursery.add(leoBaby.root);
const bigLabel = makeLabel("1,000,000", { world: 3.4, w: 1600, h: 300, size: 200 }); bigLabel.sprite.position.set(0, 2.5, 1.2); nursery.add(bigLabel.sprite);
const mom = makeChar({ shirt: "#ff8fb1", pants: "#5a4a7a", hair: "#7a3e1d", hairStyle: "long" }); mom.root.position.set(-1.6, 0, 2.2); mom.root.rotation.y = .7; nursery.add(mom.root);
const dad = makeChar({ shirt: "#5b9bd5", pants: "#2f3a56", hair: "#2a1d14", glasses: true }); dad.root.position.set(1.6, 0, 2.2); dad.root.rotation.y = -.7; nursery.add(dad.root);
const nurse = makeChar({ shirt: "#7fd6c8", pants: "#7fd6c8", hair: "#e3b04b", hairStyle: "bun", skin: "#c98f63" }); nurse.root.position.set(2.6, 0, .4); nurse.root.rotation.y = -1.1; nursery.add(nurse.root);

// ============ SET 2: town street ============
const town = baseScene({ sky: ["#5fb4ff", "#d8f0ff"] });
ground(town, "#86c95f"); town.userData.normBg = town.background;
const road = box(5, .02, 60, "#c9c2b5"); road.position.set(0, .01, 0); road.receiveShadow = true; town.add(road);
[[-6, -4, "#f6d5b2", "#d0573f"], [6, -4, "#cfe3f7", "#4a6fa5"], [-6, -11, "#f2e2a2", "#8d5a3b"], [6, -11, "#f4c6c6", "#a03c3c"], [-6, 3, "#d8f0d0", "#3d7a4a"], [6, 3, "#efe0ff", "#6a4aa5"]]
  .forEach(([x, z, wall, roof]) => house(town, x, z, { wall, roof, ry: x < 0 ? Math.PI / 2 : -Math.PI / 2 }));
[[-9, -7], [9, -8], [-9, 0], [9, 1], [-8.5, -15], [8.5, -14]].forEach(([x, z]) => tree(town, x, z, 1.1));
const people = [];
[[-1.4, -1, "#ff7b54", "0"], [1.3, -3, "#6c63ff", "0"], [-.6, -6, "#2ec4b6", "3"], [1.6, -8.5, "#ffbe0b", "0"]].forEach(([x, z, shirt, n], i) => {
  const p = makeChar({ shirt, skin: SKIN[(i + 1) % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111"][i], hairStyle: ["short", "long", "spiky", "bun"][i] });
  p.root.position.set(x, 0, z); town.add(p.root);
  const L = makeLabel(n, { world: .9 }); L.sprite.position.set(x, 2.35, z); town.add(L.sprite);
  people.push({ p, L, x, z });
});
const fireman = makeChar({ shirt: "#f4b400", pants: "#3a3a3a", helmet: "#d62828", skin: "#c98f63" }); fireman.root.position.set(0, 0, 6); town.add(fireman.root);
const fireLabel = makeLabel("100", { world: 1.1 }); fireLabel.sprite.position.set(0, 2.55, 6); town.add(fireLabel.sprite);
const truck = new THREE.Group(); truck.position.set(-1.8, 0, 3.6); truck.rotation.y = .3; town.add(truck);
{ const b = rbox(2.2, 1.3, 4.2, .15, "#d62828"); b.position.y = .95; truck.add(b); const cab = rbox(2.1, 1, 1.3, .15, "#d62828"); cab.position.set(0, 2, 1.3); truck.add(cab);
  const ws = box(1.8, .6, .05, mat("#9fd3ff", { roughness: .2 })); ws.position.set(0, 2.05, 1.97); truck.add(ws);
  for (const s of [-1, 1]) for (const zz of [-1.3, 1.3]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .3, 20), mat("#222")); wh.rotation.z = Math.PI / 2; wh.position.set(s * 1.1, .42, zz); truck.add(wh); } }
// hospital (used in virus scene)
const hosp = new THREE.Group(); hosp.position.set(0, 0, -18); town.add(hosp);
{ const b = box(9, 5.5, 4, "#f4f7fa"); b.position.y = 2.75; hosp.add(b);
  const cross = box(1.1, .35, .05, "#e63946"); cross.position.set(0, 4.6, 2.03); hosp.add(cross); const cross2 = box(.35, 1.1, .05, "#e63946"); cross2.position.set(0, 4.6, 2.03); hosp.add(cross2);
  const hs = sign("HOSPITAL", { w: 4, h: .8, bg: "#1d70b8", fg: "#ffffff", size: 130 }); hs.position.set(0, 3.6, 2.04); hosp.add(hs);
  for (let i = 0; i < 4; i++) { const w_ = box(1.2, .9, .05, mat("#9fd3ff", { roughness: .2 })); w_.position.set(-3.3 + i * 2.2, 1.9, 2.03); hosp.add(w_); }
  const dr = box(1.6, 1.6, .05, "#9fd3ff"); dr.position.set(0, .8, 2.03); hosp.add(dr); }
const fullSign = sign("FULL", { w: 3.4, h: 1.1, bg: "#e63946", fg: "#ffffff", size: 220 }); fullSign.position.set(0, 2.6, -15.9); fullSign.rotation.z = -.06; town.add(fullSign);
const sick = [];
for (let i = 0; i < 6; i++) { const p = makeChar({ shirt: ["#9aa5b1", "#7d8da1", "#a1887f", "#90a4ae", "#8d99ae", "#b0a8b9"][i], skin: SKIN[i % 5], hair: "#2a1d14", hairStyle: i % 2 ? "long" : "short" }); p.root.position.set(-2.5 + (i % 3) * 2.5 + (i > 2 ? 1 : 0), 0, -12 - Math.floor(i / 3) * 1.5); p.root.rotation.y = Math.PI + (rnd() - .5) * .6; town.add(p.root); sick.push(p); }
const fireConf = confetti(town, 0);

// ============ SET 3: town square celebration ============
const square = baseScene({ sky: ["#5fb4ff", "#e2f4ff"] });
ground(square, "#86c95f");
const plaza = new THREE.Mesh(new THREE.CircleGeometry(7, 40), mat("#d9cbb3")); plaza.rotation.x = -Math.PI / 2; plaza.position.y = .015; plaza.receiveShadow = true; square.add(plaza);
house(square, -6, -6, { wall: "#f6d5b2", roof: "#d0573f", ry: .5 }); house(square, 6, -6, { wall: "#cfe3f7", roof: "#4a6fa5", ry: -.5 }); house(square, 0, -9, { wall: "#f2e2a2", roof: "#8d5a3b", w: 4 });
const banner = new THREE.Group(); banner.position.set(0, 3.4, -3.5); square.add(banner);
{ const bn = sign("OUR FUTURE DOCTOR!", { w: 6, h: 1, bg: "#ffd23f", fg: "#7a1f1f", size: 120 }); banner.add(bn); for (const s of [-1, 1]) { const pole = box(.12, 3.6, .12, "#7a5230"); pole.position.set(s * 3.1, -1.6, 0); banner.add(pole); } }
const momS = makeChar({ shirt: "#ff8fb1", pants: "#5a4a7a", hair: "#7a3e1d", hairStyle: "long" }); momS.root.position.set(-.5, 0, -1.2); square.add(momS.root);
const dadS = makeChar({ shirt: "#5b9bd5", pants: "#2f3a56", hair: "#2a1d14", glasses: true }); dadS.root.position.set(.6, 0, -1.2); square.add(dadS.root);
const babyS = baby("#9ad0ff", "#f2c9a0"); babyS.root.position.set(.6, 1.05, -.85); square.add(babyS.root);
const sqLabel = makeLabel("1,000,000", { world: 2.2, w: 1600, h: 300, size: 200 }); sqLabel.sprite.position.set(.6, 2.15, -.8); square.add(sqLabel.sprite);
const crowd = [];
srand(11);
for (let i = 0; i < 16; i++) {
  const a = Math.PI * (.15 + .7 * (i / 15)), r = 3 + (i % 3) * .9;
  const p = makeChar({ shirt: ["#ff7b54", "#6c63ff", "#2ec4b6", "#ffbe0b", "#ef476f", "#06d6a0", "#118ab2", "#f78c6b"][i % 8], skin: SKIN[i % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111", "#b5651d"][i % 5], hairStyle: ["short", "long", "spiky", "bun"][i % 4] });
  p.root.position.set(Math.cos(a) * r * (i % 2 ? 1 : -1), 0, -1 + Math.sin(a) * r * .8); p.root.lookAt(0, 0, -1); square.add(p.root); crowd.push(p);
}
const sqConf = confetti(square, 220, [10, 7, 6], 5);

// ============ SET 4: classroom ============
const cls = baseScene({ sky: ["#fff", "#fff"], sun: 1.3, amb: 1.0 });
room(cls, { w: 12, d: 10, h: 4.4, wall: "#e8f1e4", floor: "#b98a5a" });
const board = textPlane(5, 2.2, 200, (g, w, h) => { g.fillStyle = "#24533e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5230"; g.lineWidth = 24; g.strokeRect(0, 0, w, h); });
board.position.set(0, 2.4, -4.88); cls.add(board);
const boardTex = board.userData.tex;
const drawBoard = (txt) => (g, w, h) => { g.fillStyle = "#24533e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5230"; g.lineWidth = 24; g.strokeRect(0, 0, w, h); g.fillStyle = "#f4f4ea"; g.font = "800 120px Inter, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; txt.split("\n").forEach((l, i, a) => g.fillText(l, w / 2, h / 2 + (i - (a.length - 1) / 2) * 140)); };
redraw(boardTex, drawBoard("SCIENCE\nTEST TODAY"));
const desk = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); cls.add(g); const top = rbox(1.4, .1, .8, .03, "#c69c6d"); top.position.y = .95; g.add(top); for (const s of [-1, 1]) for (const zz of [-1, 1]) { const l = box(.07, .95, .07, "#555"); l.position.set(s * .62, .47, zz * .32); g.add(l); } const ch = rbox(.6, .08, .55, .02, "#4a6fa5"); ch.position.set(0, .55, .75); g.add(ch); return g; };
const kids = [];
[[-2.4, -.8], [0, -.8], [2.4, -.8], [-2.4, 1.6], [2.4, 1.6]].forEach(([x, z], i) => { desk(x, z); const k = makeChar({ scale: .78, shirt: ["#ff7b54", "#2ec4b6", "#ffbe0b", "#ef476f", "#06d6a0"][i], skin: SKIN[(i + 2) % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111", "#b5651d"][i], hairStyle: ["spiky", "long", "short", "bun", "short"][i] }); k.root.position.set(x, 0, z + .75); k.root.rotation.y = Math.PI; cls.add(k.root); kids.push(k); });
desk(0, 1.6);
const leoKid = makeChar({ scale: .78, shirt: "#9ad0ff", pants: "#2f3a56", hair: "#5a3a1a", hairStyle: "short" }); leoKid.root.position.set(0, 0, 2.35); leoKid.root.rotation.y = Math.PI; cls.add(leoKid.root);
const kidLabel = makeLabel("1,000,000", { world: 1.5, w: 1600, h: 300, size: 200 }); kidLabel.sprite.position.set(0, 2.05, 2.35); cls.add(kidLabel.sprite);
const testPaper = textPlane(.9, 1.2, 600, (g, w, h) => {
  g.fillStyle = "#fbfbf5"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.font = "800 46px Inter, sans-serif"; g.textAlign = "center";
  g.fillText("SCIENCE TEST", w / 2, 80); g.font = "600 34px Inter, sans-serif"; g.fillText("Name: Leo", w / 2, 140);
  g.strokeStyle = "#ccd"; g.lineWidth = 3; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(60, 230 + i * 60); g.lineTo(w - 60, 230 + i * 60); g.stroke(); }
  g.fillStyle = "#e63946"; g.font = "900 220px Inter, sans-serif"; g.fillText("F", w * .68, 520); g.font = "800 60px Inter, sans-serif"; g.fillText("2/100", w * .3, 640);
});
testPaper.rotation.x = -Math.PI / 2 + .05; testPaper.position.set(0, 1.01, 1.55); cls.add(testPaper);
const teacher = makeChar({ shirt: "#7b3fa0", pants: "#2b2b3a", hair: "#2a1d14", hairStyle: "bun", glasses: true, skin: "#f7d7b8" }); teacher.root.position.set(-2.8, 0, -3.6); teacher.root.rotation.y = .35; cls.add(teacher.root);
const bloodKid = kids[2];
const band = rbox(.1, .06, .1, .02, "#ff4d4d"); band.visible = false; cls.add(band);

// ============ SET 5: bedroom ============
const bed = baseScene({ sky: ["#0d1020", "#0d1020"], sun: .25, amb: .35 });
room(bed, { w: 8, d: 7, h: 3.8, wall: "#3b3f6b", floor: "#5a4636" });
const bedM = new THREE.Group(); bedM.position.set(2.4, 0, -1.8); bed.add(bedM); { const f = rbox(2, .5, 3, .08, "#6d4c41"); f.position.y = .3; bedM.add(f); const mt = rbox(1.9, .25, 2.9, .1, "#9fa8da"); mt.position.y = .65; bedM.add(mt); const pl = rbox(.9, .2, .5, .1, "#fff"); pl.position.set(0, .85, -1.1); bedM.add(pl); }
const pdesk = rbox(2.4, .12, 1, .04, "#3e2f27"); pdesk.position.set(-1.6, 1.0, -2.8); bed.add(pdesk);
const mon = new THREE.Group(); mon.position.set(-1.6, 1.55, -3.05); bed.add(mon);
const monScreen = screen(1.5, .9, () => {}, { emissive: 1.5, px: 400 }); mon.add(monScreen); { const frame = rbox(1.6, 1, .08, .03, "#111"); frame.position.z = -.05; mon.add(frame); }
const drawGame = (k) => (g, w, h) => {
  g.fillStyle = "#0b1030"; g.fillRect(0, 0, w, h);
  srand(4); for (let i = 0; i < 22; i++) { const x = (i / 21) * w * .8 + w * .1, y = h * .5 + Math.sin(i * .9 + k * 3) * h * .25 * (1 - k * .6); g.fillStyle = ["#ff5d7a", "#ffd23f", "#4fc3f7", "#7ee081", "#b388ff"][i % 5]; g.beginPath(); g.arc(x, y, h * .045, 0, 7); g.fill(); if (i) { g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 5; g.beginPath(); g.moveTo(x - w * .8 / 21, h * .5 + Math.sin((i - 1) * .9 + k * 3) * h * .25 * (1 - k * .6)); g.lineTo(x, y); g.stroke(); } }
  g.fillStyle = "#fff"; g.font = `900 ${h * .09}px Inter, sans-serif`; g.fillText("UNTANGLE", w * .05, h * .14);
};
redraw(monScreen.userData.tex, drawGame(0));
const monLight = new THREE.PointLight("#7fb8ff", 6, 6); monLight.position.set(-1.6, 1.6, -2.2); bed.add(monLight);
const winB = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ color: "#16204a" })); winB.position.set(1.2, 2.3, -3.39); bed.add(winB);
const moon = new THREE.Mesh(new THREE.CircleGeometry(.18, 24), new THREE.MeshBasicMaterial({ color: "#fff6d0" })); moon.position.set(1.5, 2.5, -3.37); bed.add(moon);
const chair = rbox(.7, .1, .7, .03, "#c0392b"); chair.position.set(-1.6, .55, -1.9); bed.add(chair);
const leoTeen = makeChar({ shirt: "#3d4b8f", pants: "#22283f", hair: "#5a3a1a", hairStyle: "short" }); leoTeen.root.position.set(-1.6, 0, -1.9); leoTeen.root.rotation.y = Math.PI; bed.add(leoTeen.root);
const leoAdult = makeChar({ shirt: "#5b6b4a", pants: "#22283f", hair: "#5a3a1a", hairStyle: "spiky", beard: true }); leoAdult.root.position.set(-1.6, 0, -1.9); leoAdult.root.rotation.y = Math.PI; bed.add(leoAdult.root);
const adultLabel = makeLabel("1,000,000", { world: 2.0, w: 1600, h: 300, size: 200 }); adultLabel.sprite.position.set(-1.6, 2.15, -1.6); bed.add(adultLabel.sprite);
const teenLabel = makeLabel("1,000,000", { world: 1.6, w: 1600, h: 300, size: 200 }); teenLabel.sprite.position.set(-1.6, 2.05, -1.6); bed.add(teenLabel.sprite);

// house at night (exterior)
const night = baseScene({ sky: ["#070a18", "#1b2448"], sun: .15, amb: .3 });
ground(night, "#1d3a24");
house(night, 0, 0, { wall: "#8a7f9a", roof: "#3a2a4a", lit: true, w: 3.4 }); house(night, -5, -2, { wall: "#6d6a7a", roof: "#2a2a3a" }); house(night, 5, -2, { wall: "#6d6a7a", roof: "#2a2a3a" });
tree(night, -2.8, 1.5, .9); tree(night, 3, 1.8, 1);
srand(9); for (let i = 0; i < 80; i++) { const st = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: "#fff" })); st.position.set((rnd() - .5) * 60, 10 + rnd() * 20, -30 - rnd() * 10); night.add(st); }
const glow = new THREE.PointLight("#ffb340", 8, 6); glow.position.set(0, 1.6, 2.2); night.add(glow);

// ============ SET 6: lab ============
const lab = baseScene({ sky: ["#eef3f7", "#eef3f7"], sun: 1.1, amb: 1.1 });
room(lab, { w: 12, d: 9, h: 4.5, wall: "#e6edf3", floor: "#cfd8dc" });
const bigScreen = screen(4.6, 2.6, () => {}, { emissive: 1.1, px: 260 }); bigScreen.position.set(0, 2.55, -4.38); lab.add(bigScreen);
const drawLab = (mode, k = 0) => (g, w, h) => {
  g.fillStyle = mode === "solved" || mode === "leo" ? "#0f3d2a" : mode === "nocure" ? "#3a0d12" : "#0b1030"; g.fillRect(0, 0, w, h);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff";
  if (mode === "nocure") { g.font = "900 120px Inter, sans-serif"; g.fillStyle = "#ff4d5e"; g.fillText("NO CURE FOUND", w / 2, h / 2); return; }
  if (mode === "puzzle") {
    srand(4); const n = 34; let px = 0, py = 0;
    for (let i = 0; i < n; i++) { const x = w * .1 + rnd() * w * .5, y = h * .15 + rnd() * h * .7; g.fillStyle = ["#ff5d7a", "#ffd23f", "#4fc3f7", "#7ee081", "#b388ff"][i % 5]; if (i) { g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 6; g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke(); } g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill(); px = x; py = y; }
    g.textAlign = "left"; g.font = "800 44px Inter, sans-serif"; g.fillStyle = "#9fb3c8"; g.fillText("ESTIMATED TIME", w * .64, h * .38);
    g.font = "900 88px Inter, sans-serif"; g.fillStyle = "#ffd23f"; g.fillText(k < .01 ? "??? YEARS" : `${Math.round(lerp(0, 100, k))} YEARS`, w * .64, h * .6); return;
  }
  if (mode === "solved") { g.font = "900 104px Inter, sans-serif"; g.fillStyle = "#7ee081"; g.fillText("✓ PUZZLE SOLVED", w / 2, h / 2); return; }
  if (mode === "leo") { g.font = "700 70px Inter, sans-serif"; g.fillStyle = "#9fe3b0"; g.fillText("GAME CREATED BY", w / 2, h * .33); g.font = "900 240px Inter, sans-serif"; g.fillStyle = "#fff"; g.fillText("LEO", w / 2, h * .65); }
};
const sci = [];
[[-1.5, 1.7, "#2a1d14", "short", true], [0, 2.0, "#e3b04b", "bun", false], [1.5, 1.7, "#7a7a7a", "spiky", true]].forEach(([x, z, hair, hs, gl], i) => {
  const s = makeChar({ coat: true, shirt: ["#4a6fa5", "#2ec4b6", "#ef476f"][i], pants: "#3a3f55", hair, hairStyle: hs, glasses: gl, skin: SKIN[(i + 3) % 5] });
  s.root.position.set(x, 0, z); s.root.rotation.y = Math.PI; lab.add(s.root); sci.push(s);
});
const labTable = rbox(5, .12, 1.2, .04, "#b0bec5"); labTable.position.set(0, 1, -3.6); lab.add(labTable);
for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, .45, 12), new THREE.MeshStandardMaterial({ color: ["#7ee081", "#ff5d7a", "#4fc3f7", "#ffd23f", "#b388ff"][i], transparent: true, opacity: .8, roughness: .1 })); f.position.set(-2 + i, 1.3, -3.6); lab.add(f); }

// ============ SET 7: the game spreads (screens in the dark) ============
const net = baseScene({ sky: ["#05070f", "#101a3a"], sun: .2, amb: .4, shadow: false });
const nets = [];
srand(21);
for (let i = 0; i < 42; i++) {
  const ph = new THREE.Group(); const fr = rbox(.62, 1.1, .06, .08, "#111"); ph.add(fr);
  const sc = screen(.54, .98, drawGame(rnd()), { emissive: 1.3, px: 260 }); sc.position.z = .035; ph.add(sc);
  const col = i % 7, row = Math.floor(i / 7);
  ph.position.set((col - 3) * .95 + (row % 2) * .3, 2.8 - row * 1.35, -2 - rnd() * 1.5); ph.rotation.set((rnd() - .5) * .3, (rnd() - .5) * .5, (rnd() - .5) * .2);
  ph.userData = { d: rnd() }; net.add(ph); nets.push(ph);
}
const playersLabel = makeLabel("PLAYERS: 0", { world: 3.2, w: 1800, h: 300, size: 150, c1: "#ffffff", c2: "#a8e6ff", depthTest: false }); playersLabel.sprite.position.set(0, 3.6, 0); net.add(playersLabel.sprite);

// ---------- shots ----------
const shots = [];
const shot = (t0, sc, from, to, update) => shots.push({ t0, sc, from, to, update });
const camAt = (p, l) => ({ p, l });

// 1 hook – nursery with babies + numbers
shot(0, nursery, camAt([-3.2, 2.6, 4.6], [-1.6, 1.5, -2.2]), camAt([2.2, 2.5, 4.4], [1.4, 1.5, -2.2]), (lt, t) => {
  nurseryLabels.forEach((L, i) => { const k = back((t - .6 - i * .5) / .4); L.sprite.scale.set(1.3 * k, 1.3 * k / 4, 1); });
  nurseryBabies.forEach(b => { pose(b, "idle", t); b.setExpr(Math.sin(t * .7 + b.root.id) > .6 ? "closed" : "smile"); });
  bigLabel.sprite.visible = false; leoBaby.root.visible = false; [mom, dad, nurse].forEach(c => c.root.visible = false);
});
// 2 rule – street with numbers
shot(S.rule.start, town, camAt([0, 2.2, 6.5], [0, 1.6, -4]), camAt([0, 2.0, 3.5], [0, 1.5, -6]), (lt, t) => {
  town.background = town.userData.normBg; town.fog = null; town.userData.hemi.color.set("#ffffff");
  people.forEach(({ p, L, x, z }, i) => { p.root.visible = true; L.sprite.visible = true; pose(p, "walk", t); p.root.position.z = z + lt * .6; L.sprite.position.z = p.root.position.z; L.sprite.position.x = x; });
  fireman.root.visible = false; fireLabel.sprite.visible = false; truck.visible = false; hosp.visible = false; fullSign.visible = false; sick.forEach(p => p.root.visible = false);
  people.forEach(({ L }) => { const k = back((t - at("rule", "zero") ) / .3); if (L.text === "0") L.sprite.scale.set(.9 * (1 + .3 * Math.max(0, 1 - Math.abs(t - at("rule", "zero") - .2) * 4)), .9 / 4, 1); });
});
shot(at("rule", "firefighter"), town, camAt([1.8, 1.6, 10], [0, 1.6, 6]), camAt([.9, 1.7, 8.6], [0, 1.8, 6]), (lt, t) => {
  fireman.root.visible = true; fireLabel.sprite.visible = true; truck.visible = true; people.forEach(({ p, L }) => { p.root.visible = false; L.sprite.visible = false; });
  pose(fireman, "wave", t); fireman.setExpr("grin");
  const n = Math.round(lerp(0, 100, easeOut((t - at("rule", "hundred") + .2) / .7))); fireLabel.set(String(n));
});
// 3 leo – Leo's crib, parents
shot(S.leo.start, nursery, camAt([0, 2.4, 7.5], [0, 1.6, 1.2]), camAt([0, 2.2, 5.8], [0, 1.8, 1.2]), (lt, t) => {
  [mom, dad, nurse, leoBaby].forEach(c => c.root.visible = true); bigLabel.sprite.visible = true;
  people.forEach(({ p, L }) => { p.root.visible = true; L.sprite.visible = true; });
  const tBig = at("leo", "big");
  const grow = easeOut((t - tBig) / 1.4);
  const ov = t > at("leo", "barely") ? 1 + .06 * Math.sin(t * 30) * Math.max(0, 1 - (t - at("leo", "barely")) * 1.5) : 1;
  bigLabel.sprite.scale.set(3.4 * grow * ov, 3.4 * grow / 5.33 * ov, 1);
  const shock = t > tBig + .3;
  [mom, dad, nurse].forEach((c, i) => { pose(c, shock ? "headhold" : "idle", t); c.setExpr(shock ? "shock" : "smile"); });
  pose(leoBaby, "idle", t); leoBaby.setExpr("smile");
  nurseryLabels.forEach(L => L.sprite.visible = false); nurseryBabies.forEach(b => b.root.visible = false);
});
shot(at("leo", "million", 5) - .35, nursery, camAt([0, 2.2, 4.6], [0, 2.1, 1.2]), camAt([0, 2.3, 3.9], [0, 2.3, 1.2]), (lt, t) => {
  const s = 1 + .08 * Math.sin(lt * 18) * Math.max(0, 1 - lt);
  bigLabel.sprite.scale.set(3.4 * s, 3.4 / 5.33 * s, 1);
  pose(leoBaby, "idle", t);
  cam.position.x += Math.sin(t * 40) * .02 * Math.max(0, 1 - lt);
});
// 4 hype – town square
shot(S.hype.start, square, camAt([0, 3.2, 9], [0, 1.6, -1]), camAt([0, 2.4, 6.2], [0, 1.9, -1]), (lt, t) => {
  crowd.forEach(c => { pose(c, "cheer", t); c.setExpr("laugh"); });
  pose(momS, "cheer", t, .6); momS.setExpr("laugh"); pose(dadS, "hold", t); dadS.setExpr("grin"); pose(babyS, "idle", t);
  sqConf(lt);
});
shot(at("hype", "greatest"), square, camAt([0, 5.0, 6.5], [0, 2.4, -2.5]), camAt([0, 4.6, 5.0], [0, 2.6, -2.5]), (lt, t) => {
  crowd.forEach(c => pose(c, "cheer", t)); pose(momS, "cheer", t, .6); pose(dadS, "hold", t); sqConf(lt + 2);
});
// 5 problem – classroom
shot(S.problem.start, cls, camAt([4.8, 2.6, 5.6], [0, 1.2, .6]), camAt([3.8, 2.4, 4.8], [0, 1.2, 1.2]), (lt, t) => {
  const tBlood = at("problem", "blood"), tFaint = at("problem", "fainted");
  kids.forEach((k, i) => { k.root.rotation.y = Math.PI; pose(k, "sit", t); k.setExpr("smile"); }); leoKid.root.rotation.y = Math.PI; kidLabel.sprite.material.opacity = 1;
  // classmate shows a cut finger
  bloodKid.root.rotation.y = Math.PI + (t > tFaint - .3 ? -.9 : 0); pose(bloodKid, t > tFaint - .3 ? "wave" : "sit", t); bloodKid.setExpr("grin");
  band.visible = t > tFaint - .3; band.position.set(2.4 + .55, 1.45, -.05 + .75);
  const fk = clamp((t - tFaint - .4) / .5);
  pose(leoKid, "sit", t); leoKid.setExpr(t > tFaint - .1 ? (fk > .5 ? "dizzy" : "shock") : "smile");
  leoKid.root.rotation.x = -fk * 1.35; leoKid.root.position.y = fk * .1;
  kidLabel.sprite.position.y = 2.05 - fk * .7; kidLabel.sprite.position.z = 2.35 + fk * .9;
  redraw(boardTex, drawBoard("SCIENCE\nTEST TODAY")); testPaper.visible = false;
});
shot(at("problem", "failed"), cls, camAt([0, 2.9, 2.1], [0, 1.0, 1.55]), camAt([0, 2.6, 1.95], [0, 1.0, 1.55]), (lt, t) => {
  testPaper.visible = true; leoKid.root.rotation.set(0, Math.PI, 0); leoKid.root.position.y = 0; kidLabel.sprite.position.set(0, 2.05, 2.35);
  pose(leoKid, "sit", t); leoKid.setExpr("sad");
});
// 6 teacher
shot(S.teacher.start, cls, camAt([-.8, 1.9, 1.2], [-2.6, 1.7, -3.6]), camAt([-1.4, 1.8, .2], [-2.4, 1.75, -3.8]), (lt, t) => {
  testPaper.visible = false; kids.forEach(k => { k.root.rotation.y = Math.PI; pose(k, "sit", t); });
  redraw(boardTex, drawBoard(t > at("teacher", "broken") ? "1,000,000\n= ERROR" : "1,000,000\n= ???"));
  pose(teacher, "point", t); teacher.setExpr(t > at("teacher", "broken") - .3 ? "angry" : "flat");
  teacher.root.rotation.y = .35 + (t > at("teacher", "class") ? .5 : 0);
});
shot(at("teacher", "broken"), cls, camAt([0, 1.8, 5.8], [0, 1.4, 1.5]), camAt([0, 1.7, 5.0], [0, 1.5, 1.5]), (lt, t) => {
  redraw(boardTex, drawBoard("1,000,000\n= ERROR")); testPaper.visible = false;
  kids.forEach(k => { k.root.rotation.y = 0; pose(k, "laugh", t); k.setExpr("laugh"); });
  leoKid.root.rotation.y = 0; pose(leoKid, "sit", t); leoKid.setExpr("sad"); kidLabel.sprite.position.set(0, 2.05, 2.35);
  kidLabel.sprite.material.opacity = .55 + .45 * Math.abs(Math.sin(t * 6));
});
// 7 quit – bedroom then house at night
shot(S.quit.start, bed, camAt([1.2, 2.2, 2.4], [-1.6, 1.4, -2.6]), camAt([.4, 1.9, 1.3], [-1.6, 1.5, -2.6]), (lt, t) => {
  kids.forEach(k => k.root.rotation.y = Math.PI); kidLabel.sprite.material.opacity = 1;
  leoAdult.root.visible = false; adultLabel.sprite.visible = false; leoTeen.root.visible = true; teenLabel.sprite.visible = true;
  pose(leoTeen, "type", t); leoTeen.setExpr("flat"); redraw(monScreen.userData.tex, drawGame((t * .3) % 1));
  // day/night cycling through the window
  const d = .5 + .5 * Math.sin(lt * 3.2);
  winB.material.color.setRGB(lerp(.05, .55, d), lerp(.07, .75, d), lerp(.18, 1, d)); moon.visible = d < .4;
});
shot(at("quit", "slowly"), night, camAt([0, 1.8, 7], [0, 1.6, 0]), camAt([0, 3.8, 14], [0, 1.6, 0]), (lt, t) => {
  glow.intensity = 8 + Math.sin(t * 9) * .8;
});
// 8 virus – sick town + hospital FULL
shot(S.virus.start, town, camAt([0, 4.2, -1], [0, 2.4, -16]), camAt([0, 3.6, -5.5], [0, 2.8, -17]), (lt, t) => {
  [fireman.root, truck].forEach(o => o.visible = false); hosp.visible = true; fullSign.visible = true; sick.forEach(p => p.root.visible = true); fireLabel.sprite.visible = false; people.forEach(({ p, L }) => { p.root.visible = false; L.sprite.visible = false; });
  sick.forEach(p => { pose(p, "cough", t); p.setExpr("sad"); });
  town.background = town.userData.sickBg || (town.userData.sickBg = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6b7b5a"); gr.addColorStop(1, "#b8c49a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
  town.fog = town.userData.fog || (town.userData.fog = new THREE.Fog("#9fb07a", 6, 30));
  town.userData.hemi.color.set("#d8f0b0");
  const k = back((t - at("virus", "hospitals")) / .35); fullSign.scale.setScalar(Math.max(.001, k));
});
shot(at("virus", "scientist"), lab, camAt([0, 2.4, 6.5], [0, 1.9, -2]), camAt([0, 2.4, 5.4], [0, 2.0, -2.5]), (lt, t) => {
  redraw(bigScreen.userData.tex, drawLab("nocure"));
  sci.forEach((s, i) => { s.root.rotation.y = 0; pose(s, i === 1 ? "facepalm" : "shrug", t); s.setExpr("sad"); });
});
// 9 lab – the puzzle
shot(S.lab.start, lab, camAt([0, 3.3, 6.2], [0, 2.4, -4.3]), camAt([0, 3.1, 4.6], [0, 2.5, -4.3]), (lt, t) => {
  const k = easeOut((t - at("lab", "hundred") + .3) / .8);
  redraw(bigScreen.userData.tex, drawLab("puzzle", t > at("lab", "solving") ? k : 0));
  sci.forEach(s => { s.root.rotation.y = Math.PI; pose(s, "idle", t); s.setExpr("sad"); });
});
// 10 game spreads
shot(S.game.start, bed, camAt([1.0, 1.9, 1.6], [-1.6, 1.5, -3]), camAt([-.6, 1.65, -1.2], [-1.6, 1.55, -3.05]), (lt, t) => {
  leoTeen.root.visible = false; teenLabel.sprite.visible = false; leoAdult.root.visible = true; adultLabel.sprite.visible = false; leoAdult.root.rotation.y = Math.PI;
  pose(leoAdult, "type", t); redraw(monScreen.userData.tex, drawGame((t * .4) % 1)); winB.material.color.set("#0e1430"); moon.visible = true;
});
shot(at("game", "millions"), net, camAt([0, 1, 9], [0, 1, -2]), camAt([0, 1, 6.2], [0, 1, -2]), (lt, t) => {
  const t0 = at("game", "millions");
  nets.forEach((p, i) => { const k = back((t - t0 - p.userData.d * 1.6) / .35); p.scale.setScalar(Math.max(.001, k)); p.rotation.y += Math.sin(t + i) * .002; });
  const n = Math.round(lerp(0, 2481903, clamp((t - t0) / (S.game.end - t0)) ** 1.6));
  playersLabel.set("PLAYERS: " + n.toLocaleString("en-US"));
});
// 11 twist – solved, made by Leo
shot(S.twist.start, lab, camAt([0, 3.3, 6.0], [0, 2.3, -4.3]), camAt([0, 3.0, 4.4], [0, 2.4, -4.3]), (lt, t) => {
  const tSol = at("twist", "puzzle"), tLeo = at("twist", "leo", 5);
  redraw(bigScreen.userData.tex, drawLab(t > tLeo - .2 ? "leo" : t > tSol ? "solved" : "nocure"));
  sci.forEach((s, i) => { s.root.rotation.y = Math.PI; pose(s, t > tSol ? (t > tLeo ? "headhold" : "cheer") : "idle", t, .7); s.setExpr(t > tSol ? (t > tLeo ? "shock" : "laugh") : "sad"); });
});
// 12 end – Leo turns, number counts down
shot(S.end.start, bed, camAt([0, 1.7, 3.0], [-1.6, 1.75, -1.9]), camAt([-1.1, 1.75, 1.2], [-1.6, 1.85, -1.9]), (lt, t) => {
  leoAdult.root.visible = true; adultLabel.sprite.visible = true; leoTeen.root.visible = false; teenLabel.sprite.visible = false;
  const turn = ease((t - S.end.start - .4) / .8);
  leoAdult.root.rotation.y = Math.PI - turn * Math.PI; pose(leoAdult, turn > .9 ? "idle" : "type", t); leoAdult.setExpr(turn > .9 ? "smile" : "flat");
  const tDown = at("end", "number", 2.5);
  const k = clamp((t - tDown) / (window.TOTAL - tDown));
  const n = Math.round(1000000 - Math.pow(k, 2.2) * 25000 - (t > tDown ? (t - tDown) * 3 : 0));
  adultLabel.set(n.toLocaleString("en-US"));
  const pulse = t > tDown ? 1 + .05 * Math.sin(t * 12) : 1; adultLabel.sprite.scale.set(2 * pulse, 2 / 5.33 * pulse, 1);
  redraw(monScreen.userData.tex, drawLab("solved"));
});

shots.sort((a, b) => a.t0 - b.t0);

// ---------- draw(t) ----------
function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : window.TOTAL;
  const k = ease((t - s.t0) / Math.max(.01, t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k));
  const look = v3(s.from.l).lerp(v3(s.to.l), k);
  cam.lookAt(look);
  s.update(t - s.t0, t);
  renderer.render(s.sc, cam);
}

// ---------- captions (1–2 words, center) ----------
const capsEl = document.getElementById("caps");
const tl = gsap.timeline({ paused: true });
CAPS.forEach(c => {
  const d = document.createElement("div"); d.className = "cap"; d.textContent = c.text; capsEl.appendChild(d);
  tl.set(d, { opacity: 0 }, 0);
  tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .1, ease: "back.out(3)", immediateRender: false }, c.t0);
  tl.set(d, { opacity: 0 }, c.t1);
});
const clock = { t: 0 };
tl.to(clock, { t: window.TOTAL, duration: window.TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0); draw(0);
