import { THREE, makeChar, pose, makeLabel, rbox, box, mat, house, tree, ground, baseScene, sign, textPlane, roundRect, canvasTex } from "../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";
const S = 1080;
const r = new THREE.WebGLRenderer({ canvas: document.getElementById("c"), antialias: true, preserveDrawingBuffer: true });
r.setPixelRatio(1); r.setSize(S, S, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
const v = new URLSearchParams(location.search).get("v");
const cam = new THREE.PerspectiveCamera(38, 1, .1, 200);
let sc;

// rule scroll: parchment plane with "RULE #1" and wavy lines
const scroll = (title = "RULE #1") => textPlane(1.3, 1.6, 400, (g, w, h) => {
  g.fillStyle = "#f6e7c1"; roundRect(g, 0, 0, w, h, 40); g.fill();
  g.strokeStyle = "#c9a96b"; g.lineWidth = 14; roundRect(g, 10, 10, w - 20, h - 20, 34); g.stroke();
  g.fillStyle = "#7a1f1f"; g.font = "900 120px Inter, sans-serif"; g.textAlign = "center"; g.fillText(title, w / 2, 170);
  g.strokeStyle = "#8a6a3a"; g.lineWidth = 12; g.lineCap = "round";
  for (let i = 0; i < 5; i++) { g.beginPath(); for (let x = 70; x < w - 70; x += 8) g.lineTo(x, 280 + i * 70 + Math.sin(x * .05 + i) * 7); g.stroke(); }
  g.fillStyle = "#c0392b"; g.beginPath(); g.arc(w * .75, h - 90, 46, 0, 7); g.fill();
});

if (v === "a") { // town entrance sign "IN THIS TOWN" + kid waving
  sc = baseScene({ sky: ["#4fa8ff", "#d6f0ff"] }); ground(sc, "#7cc45a");
  const road = box(3, .02, 30, "#cfc6b5"); road.position.set(0, .01, -10); sc.add(road);
  house(sc, -3.4, -6, { wall: "#f6d5b2", roof: "#d0573f" }); house(sc, 3.4, -6.5, { wall: "#cfe3f7", roof: "#4a6fa5" }); house(sc, 0, -11, { wall: "#f2e2a2", roof: "#8d5a3b" });
  tree(sc, -5.5, -3, 1.1); tree(sc, 5.5, -3.5, 1.1);
  const sg = sign("IN THIS TOWN", { w: 3.4, h: .9, bg: "#1f7a4a", fg: "#ffffff", size: 150, px: 320 }); sg.position.set(0, 3.0, -1.2); sc.add(sg);
  for (const s of [-1, 1]) { const p = box(.14, 3, .14, "#7a5230"); p.position.set(s * 1.55, 1.5, -1.26); sc.add(p); }
  const k = makeChar({ shirt: "#ff5d7a", hair: "#5a3a1a", hairStyle: "spiky", skin: "#e0ac7e" }); k.root.position.set(0, 0, .6); sc.add(k.root); pose(k, "wave", .3); k.setExpr("grin");
  cam.position.set(0, 2.1, 6.4); cam.lookAt(0, 2.0, 0);
}
if (v === "b") { // girl reading the rule scroll, shocked
  sc = baseScene({ sky: ["#ffb36b", "#ffe2c2"] }); ground(sc, "#86c95f");
  house(sc, -3.4, -4, { wall: "#efe0ff", roof: "#6a4aa5" }); house(sc, 3.4, -4.5, { wall: "#d8f0d0", roof: "#3d7a4a" }); tree(sc, 0, -7, 1.3);
  const k = makeChar({ shirt: "#4fc3f7", hair: "#2a1d14", hairStyle: "long", skin: "#c98f63" }); k.root.position.set(-.35, 0, 0); sc.add(k.root); pose(k, "hold", 0); k.setExpr("shock");
  const sp = scroll(); sp.position.set(.55, 1.55, .55); sp.rotation.y = -.5; sc.add(sp);
  const q = makeLabel("!", { world: 1.0, w: 512, h: 512, size: 420, stroke: 34 }); q.sprite.position.set(-.35, 2.55, 0); sc.add(q.sprite);
  cam.position.set(.6, 1.9, 4.5); cam.lookAt(.1, 1.75, 0);
}
if (v === "c") { // tiny town on a floating island, night, glowing "?"
  sc = baseScene({ sky: ["#0b1030", "#3b2a6b"], sun: .7, amb: .55 });
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 2.2, 1.6, 40), mat("#6d4c41")); isl.position.y = -.8; isl.castShadow = true; isl.receiveShadow = true; sc.add(isl);
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(4.25, 4.25, .25, 40), mat("#5fae4a")); grass.position.y = -.05; grass.receiveShadow = true; sc.add(grass);
  [[-1.8, -1, "#f6d5b2", "#d0573f"], [1.8, -1.2, "#cfe3f7", "#4a6fa5"], [0, -2.4, "#f2e2a2", "#8d5a3b"], [-.2, .9, "#efe0ff", "#6a4aa5"]].forEach(([x, z, w_, r_], i) => { const h = house(sc, x, z, { wall: w_, roof: r_, lit: true, w: 1.6, h: 1.3, d: 1.6 }); });
  tree(sc, 2.6, .9, .6); tree(sc, -2.7, .6, .6); tree(sc, 2.5, -2.3, .55);
  const glow = new THREE.PointLight("#ffd27a", 30, 12); glow.position.set(0, 2.5, 1); sc.add(glow);
  const q = makeLabel("?", { world: 2.2, w: 512, h: 512, size: 420, stroke: 34 }); q.sprite.position.set(0, 3.4, -.5); sc.add(q.sprite);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(.5, 32), new THREE.MeshBasicMaterial({ color: "#fff6d0" })); moon.position.set(3.4, 5.6, -6); sc.add(moon);
  const stars = new THREE.Group(); for (let i = 0; i < 70; i++) { const st = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 4), new THREE.MeshBasicMaterial({ color: "#fff" })); st.position.set(Math.sin(i * 12.9) * 9, 2 + Math.abs(Math.cos(i * 7.3)) * 8, -8 - (i % 5)); stars.add(st); } sc.add(stars);
  cam.position.set(0, 5.2, 13.5); cam.lookAt(0, 1.1, 0);
}
if (v === "d") { // two kids, one with a gold number crown-like label, other with "0" – judgement theme
  sc = baseScene({ sky: ["#4fa8ff", "#d6f0ff"] }); ground(sc, "#7cc45a");
  house(sc, 0, -5, { wall: "#f6d5b2", roof: "#d0573f", w: 4 }); tree(sc, -3.5, -3, 1.1); tree(sc, 3.5, -3, 1.1);
  const a = makeChar({ shirt: "#ffbe0b", hair: "#e3b04b", hairStyle: "short" }); a.root.position.set(-.75, 0, 0); a.root.rotation.y = .25; sc.add(a.root); pose(a, "cheer", .2, .7); a.setExpr("laugh");
  const b = makeChar({ shirt: "#6c63ff", hair: "#2a1d14", hairStyle: "bun", skin: "#8d5a3b" }); b.root.position.set(.75, 0, 0); b.root.rotation.y = -.25; sc.add(b.root); pose(b, "idle", 0); b.setExpr("sad");
  const la = makeLabel("99", { world: 1.0, w: 512, h: 300, size: 220 }); la.sprite.position.set(-.75, 2.5, 0); sc.add(la.sprite);
  const lb = makeLabel("?", { world: 1.0, w: 512, h: 300, size: 220 }); lb.sprite.position.set(.75, 2.5, 0); sc.add(lb.sprite);
  cam.position.set(0, 1.9, 5.2); cam.lookAt(0, 1.75, 0);
}
r.render(sc, cam); window.done = true;
