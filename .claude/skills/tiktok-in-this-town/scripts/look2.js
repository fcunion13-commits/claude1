// look2.js – "Look v2" upgrades on top of lib3d.js (Nov 2026, after studying top creators):
// procedural surface textures (fabric with stitched seams, denim, wood, sand, stone, scales),
// cinematic lights (warm key + cool rim), bloom + depth-of-field post, fire/spark particles,
// glow shield, string lights and bunting for dense sets, camera shake.
import { THREE, W, H, srand, rnd, canvasTex, mat } from "./lib3d.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// ---------- colour helpers ----------
const shade = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return "#" + c.getHexString(); };

// ---------- procedural textures ----------
const texCache = {};
const cached = (key, fn) => texCache[key] || (texCache[key] = fn());
function noise(g, w, h, n, a, seed) { srand(seed); for (let i = 0; i < n; i++) { g.fillStyle = rnd() < .5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * .8})`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3); } }
// fabric: knit rows + dashed stitch seam around every face (rounded boxes have 0..1 UVs per face)
export const fabricTex = (color, { seam = true, denim = false } = {}) => cached("f" + color + seam + denim, () => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = color; g.fillRect(0, 0, w, h);
  g.globalAlpha = .10; g.strokeStyle = denim ? "#ffffff" : "#000000"; g.lineWidth = 2;
  for (let i = -h; i < w; i += denim ? 6 : 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + (denim ? h : 0), h); g.stroke(); }
  g.globalAlpha = 1; noise(g, w, h, 900, .05, 7);
  const gr = g.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .75); gr.addColorStop(0, "rgba(255,255,255,.06)"); gr.addColorStop(1, "rgba(0,0,0,.18)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (seam) { g.strokeStyle = denim ? "#d9a441" : shade(color, -.14); g.lineWidth = 5; g.setLineDash([12, 9]); g.strokeRect(16, 16, w - 32, h - 32); g.setLineDash([]); }
}));
export const woodTex = (color = "#9a6a3f") => cached("w" + color, () => { const t = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = color; g.fillRect(0, 0, w, h); srand(11);
  for (let p = 0; p < 8; p++) { const y = p * h / 8; g.fillStyle = shade(color, (rnd() - .5) * .08); g.fillRect(0, y, w, h / 8 - 4); g.fillStyle = shade(color, -.18); g.fillRect(0, y + h / 8 - 4, w, 4);
    g.strokeStyle = shade(color, -.08); g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); const yy = y + 8 + rnd() * (h / 8 - 16); g.moveTo(0, yy); for (let x = 0; x <= w; x += 32) g.lineTo(x, yy + Math.sin(x * .02 + p) * 3); g.stroke(); }
    const cut = rnd() * w; g.fillRect(cut, y, 3, h / 8 - 4); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
export const sandTex = (color = "#e2c48d") => cached("s" + color, () => { const t = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = color; g.fillRect(0, 0, w, h); noise(g, w, h, 6000, .07, 3);
  srand(5); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(120,80,40,${.05 + rnd() * .06})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 50, 8 + rnd() * 20, rnd() * 3, 0, 7); g.fill(); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
export const stoneTex = (color = "#b9b2a6") => cached("st" + color, () => { const t = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = shade(color, -.2); g.fillRect(0, 0, w, h); srand(8);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const x = c * 128 + (r % 2) * 64, y = r * 64; g.fillStyle = shade(color, (rnd() - .5) * .1); g.fillRect(x + 3, y + 3, 122, 58); g.fillRect(x + 3 - 512, y + 3, 122, 58); }
  noise(g, w, h, 3000, .05, 9);
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
export const scaleTex = (color = "#c0392b") => cached("sc" + color, () => { const t = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = shade(color, -.1); g.fillRect(0, 0, w, h);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { const x = c * 32 + (r % 2) * 16, y = r * 30; const gr = g.createRadialGradient(x, y - 6, 2, x, y, 18); gr.addColorStop(0, shade(color, .1)); gr.addColorStop(1, shade(color, -.12)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 17, 0, Math.PI); g.fill(); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
export const texMat = (tex, rep = [1, 1], opts = {}) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(...rep); t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: .9, ...opts }); };

// ---------- characters: clothes get fabric/denim textures, bold face ----------
export function dress(ch) {
  const o = ch.opts, shirtM = mat(o.coat ? "#f4f6f8" : o.shirt), pantsM = mat(o.pants);
  const fab = new THREE.MeshStandardMaterial({ map: fabricTex(o.coat ? "#f4f6f8" : o.shirt), roughness: .95 });
  const den = new THREE.MeshStandardMaterial({ map: fabricTex(o.pants, { denim: true }), roughness: .95 });
  ch.root.traverse(m => { if (!m.isMesh) return; if (m.material === shirtM) m.material = fab; else if (m.material === pantsM) m.material = den; });
  // collar
  const col = new THREE.Mesh(new THREE.TorusGeometry(.17, .045, 8, 20), new THREE.MeshStandardMaterial({ color: shade(o.shirt, -.12), roughness: .9 })); col.rotation.x = Math.PI / 2; col.position.y = 1.06; ch.rig.add(col);
  return ch;
}

// ---------- lights: warm key, cool rim from behind, soft shadows ----------
export function cineLights(sc, { key = "#ffd9a8", keyI = 2.2, rim = "#8fd0ff", rimI = 2.4, amb = .55, keyPos = [6, 9, 7], rimPos = [-5, 6, -9], hemiSky = "#bcd6ff", hemiGround = "#7a5a3a" } = {}) {
  const { hemi, dl } = sc.userData;
  hemi.color.set(hemiSky); hemi.groundColor.set(hemiGround); hemi.intensity = amb;
  dl.color.set(key); dl.intensity = keyI; dl.position.set(...keyPos); dl.shadow.mapSize.set(2048, 2048); dl.shadow.radius = 4; dl.shadow.normalBias = .02;
  const rl = new THREE.DirectionalLight(rim, rimI); rl.position.set(...rimPos); sc.add(rl);
  sc.userData.rim = rl; return rl;
}

// ---------- post: bloom + depth of field ----------
export function makePost(renderer, scene, cam, { bloom = [.55, .5, .82], dof = true } = {}) {
  const comp = new EffectComposer(renderer); comp.setSize(W, H);
  const rp = new RenderPass(scene, cam); comp.addPass(rp);
  let bokeh = null; if (dof) { bokeh = new BokehPass(scene, cam, { focus: 4, aperture: .004, maxblur: .008 }); comp.addPass(bokeh); }
  const bl = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), ...bloom); comp.addPass(bl);
  comp.addPass(new OutputPass());
  return { comp, render(sc, focus, aperture = .004) { rp.scene = sc; if (bokeh) { bokeh.scene = sc; bokeh.uniforms.focus.value = focus; bokeh.uniforms.aperture.value = aperture; } comp.render(); }, bloom: bl };
}

// ---------- sprites, fire, sparks ----------
const glowTex = () => cached("glow", () => canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.35, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
export const glowSprite = (color, size = 1, opacity = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); return s; };
// fire stream from a to b; returns update(t, on) – deterministic
export function fireStream(sc, n = 140, seed = 4) {
  srand(seed); const ps = []; const cols = ["#fff3c4", "#ffd166", "#ff9f1c", "#ff5a1f", "#d62828"];
  for (let i = 0; i < n; i++) { const s = glowSprite(cols[i % 5], .5, .9); s.userData = { ph: i / n, j: [(rnd() - .5), (rnd() - .5), (rnd() - .5)], sz: .5 + rnd() * .8 }; s.visible = false; sc.add(s); ps.push(s); }
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  return (t, a, b, on = 1, spread = .9) => { A.set(...a); B.set(...b);
    ps.forEach(s => { const u = s.userData, k = (t * 1.8 + u.ph) % 1; s.visible = on > 0; if (!on) return;
      s.position.lerpVectors(A, B, k); s.position.x += u.j[0] * spread * k; s.position.y += u.j[1] * spread * k; s.position.z += u.j[2] * spread * k;
      s.scale.setScalar((.12 + k * .7) * u.sz * on); s.material.opacity = .42 * (1 - k * .6); }); };
}
// sparks bursting radially from a point (e.g. fire hitting a shield)
export function sparkBurst(sc, n = 90, color = "#ffd166", seed = 6) {
  srand(seed); const ps = [];
  for (let i = 0; i < n; i++) { const s = glowSprite(i % 3 ? color : "#ffffff", .12); const a = rnd() * Math.PI * 2, e = .1 + rnd() * .9; s.userData = { d: [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)], v: 1.5 + rnd() * 2.5, ph: rnd() }; s.visible = false; sc.add(s); ps.push(s); }
  return (t, at, on = 1, r0 = .5) => ps.forEach(s => { const u = s.userData, k = (t * 1.6 + u.ph) % 1; s.visible = on > 0; if (!on) return;
    const d = r0 + k * u.v; s.position.set(at[0] + u.d[0] * d, at[1] + u.d[1] * d * .7 - k * k * .8, at[2] + u.d[2] * d); s.material.opacity = .8 * (1 - k); s.scale.setScalar(.09 * (1 - k * .5)); });
}
// translucent glowing dome
export function shieldDome(r = .6, color = "#5ff5ff") {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); g.add(m);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, .02, 8, 48), new THREE.MeshBasicMaterial({ color })); rim.rotation.x = Math.PI / 2; g.add(rim);
  const hex = new THREE.Mesh(new THREE.SphereGeometry(r * 1.003, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(hex);
  const L = new THREE.PointLight(color, 0, 6); L.position.y = r * .6; g.add(L);
  g.userData = { set(k) { g.visible = k > 0; m.material.opacity = .22 * k; hex.material.opacity = .35 * k; L.intensity = 3 * k; g.scale.setScalar(.85 + .15 * k); } };
  return g;
}

// ---------- dense set dressing ----------
const sag = (a, b, k, d) => new THREE.Vector3().lerpVectors(a, b, k).add(new THREE.Vector3(0, -Math.sin(k * Math.PI) * d, 0));
export function stringLights(sc, a, b, { n = 18, droop = .6, seed = 2 } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const cols = ["#ffd166", "#ff6b6b", "#4fc3f7", "#7ee081", "#ffffff"];
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(sag(A, B, i / 24, droop));
  const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#222" })); sc.add(wire);
  for (let i = 1; i < n; i++) { const p = sag(A, B, i / n, droop); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: cols[(i + seed) % 5] })); bulb.position.copy(p).add(new THREE.Vector3(0, -.08, 0)); sc.add(bulb);
    const gl = glowSprite(cols[(i + seed) % 5], .45, .55); gl.position.copy(bulb.position); sc.add(gl); }
}
export function bunting(sc, a, b, { n = 14, droop = .5, cols = ["#e63946", "#ffd23f", "#2f5fa0", "#06d6a0", "#ff8fab"] } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(sag(A, B, i / 24, droop)); sc.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#f5f5f5" })));
  const tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.16, 0, 0), new THREE.Vector3(.16, 0, 0), new THREE.Vector3(0, -.36, 0)]); tri.computeVertexNormals();
  for (let i = 0; i < n; i++) { const k = (i + .5) / n; const p = sag(A, B, k, droop); const f = new THREE.Mesh(tri, new THREE.MeshStandardMaterial({ color: cols[i % cols.length], side: THREE.DoubleSide, roughness: .8 })); f.position.copy(p); f.lookAt(p.x + (B.z - A.z), p.y, p.z - (B.x - A.x)); sc.add(f); }
}

// ---------- camera shake (deterministic) ----------
export const shake = (cam, t, amt) => { if (!amt) return; cam.position.x += Math.sin(t * 61) * Math.sin(t * 17) * amt; cam.position.y += Math.sin(t * 53 + 1) * Math.cos(t * 23) * amt; cam.rotation.z += Math.sin(t * 47) * amt * .3; };
