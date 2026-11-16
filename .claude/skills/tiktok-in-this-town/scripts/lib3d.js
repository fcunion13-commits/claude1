// Reusable 3D toolkit for "In this town" story videos (Three.js, deterministic: everything is a function of time t).
// Original chibi character style: big rounded head, large oval eyes, small body, stubby limbs.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export { THREE };
export const W = 1080, H = 1920;

// ---------- math ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ease = (k) => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
export const back = (k) => { k = clamp(k); const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const v3 = (a) => new THREE.Vector3(...a);
let _seed = 1;
export const srand = (s) => (_seed = s);
export const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;

// ---------- materials ----------
const matCache = {};
export const mat = (color, opts = {}) => {
  const key = color + JSON.stringify(opts);
  return matCache[key] || (matCache[key] = new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...opts }));
};
export const rbox = (w, h, d, r, color, opts) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), typeof color === "object" ? color : mat(color, opts));
  m.castShadow = true; m.receiveShadow = true; return m;
};
export const box = (w, h, d, color, opts) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === "object" ? color : mat(color, opts));
  m.castShadow = true; m.receiveShadow = true; return m;
};

// ---------- canvas textures ----------
export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { c, g, draw }; return t;
}
export function redraw(tex, draw) { const { c, g } = tex.userData; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tex.needsUpdate = true; }
export function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function textPlane(w, h, px, draw) {
  const tex = canvasTex(Math.round(w * px), Math.round(h * px), draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }));
  m.receiveShadow = true; m.userData.tex = tex; return m;
}

// ---------- faces ----------
const faceCache = {};
export function faceTex(expr = "smile", opt = {}) {
  const key = expr + JSON.stringify(opt);
  if (faceCache[key]) return faceCache[key];
  return (faceCache[key] = canvasTex(256, 256, (g) => {
    const ey = opt.eyeY || 112;
    // eyes
    for (const s of [-1, 1]) {
      const x = 128 + s * 46;
      if (expr === "closed" || expr === "laugh") {
        g.strokeStyle = "#1b1b22"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath();
        g.arc(x, ey + 6, 16, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      } else if (expr === "dizzy") {
        g.strokeStyle = "#1b1b22"; g.lineWidth = 8; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - 14, ey - 14); g.lineTo(x + 14, ey + 14); g.moveTo(x + 14, ey - 14); g.lineTo(x - 14, ey + 14); g.stroke();
      } else {
        const big = expr === "shock" ? 1.25 : 1;
        g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, ey, 22 * big, 28 * big, 0, 0, 7); g.fill();
        g.fillStyle = opt.iris || "#2a2238"; g.beginPath(); g.ellipse(x + 2, ey + 3, 15 * (expr === "shock" ? .8 : 1), 20 * (expr === "shock" ? .8 : 1), 0, 0, 7); g.fill();
        g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x + 8, ey - 6, 6, 0, 7); g.fill();
      }
      // brows
      g.strokeStyle = opt.brow || "#3a2a20"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath();
      const by = ey - 42;
      if (expr === "sad") { g.moveTo(x - 16, by + s * -6 + 6); g.lineTo(x + 16, by + s * 6 + 6); }
      else if (expr === "angry") { g.moveTo(x - 16, by + s * 8); g.lineTo(x + 16, by - s * 8); }
      else if (expr === "shock") { g.moveTo(x - 16, by - 10); g.quadraticCurveTo(x, by - 20, x + 16, by - 10); }
      else { g.moveTo(x - 15, by); g.quadraticCurveTo(x, by - 6, x + 15, by); }
      g.stroke();
    }
    if (opt.glasses) {
      g.strokeStyle = "#1b1b22"; g.lineWidth = 6;
      for (const s of [-1, 1]) { roundRect(g, 128 + s * 46 - 30, ey - 26, 60, 52, 12); g.stroke(); }
      g.beginPath(); g.moveTo(112, ey - 4); g.lineTo(144, ey - 4); g.stroke();
    }
    // cheeks
    g.fillStyle = "rgba(255,120,120,.28)";
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(128 + s * 70, ey + 40, 16, 10, 0, 0, 7); g.fill(); }
    // mouth
    const my = ey + 62; g.strokeStyle = "#5a2020"; g.fillStyle = "#6b2228"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath();
    if (expr === "smile" || expr === "closed") { g.arc(128, my - 14, 22, Math.PI * .15, Math.PI * .85); g.stroke(); }
    else if (expr === "laugh" || expr === "grin") { g.moveTo(98, my - 8); g.quadraticCurveTo(128, my + 34, 158, my - 8); g.closePath(); g.fill(); }
    else if (expr === "shock") { g.ellipse(128, my + 2, 14, 20, 0, 0, 7); g.fill(); }
    else if (expr === "sad") { g.arc(128, my + 18, 20, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
    else if (expr === "angry") { g.moveTo(104, my + 4); g.lineTo(152, my + 4); g.stroke(); }
    else if (expr === "dizzy") { g.ellipse(128, my, 10, 8, 0, 0, 7); g.fill(); }
    else { g.moveTo(110, my); g.lineTo(146, my); g.stroke(); }
    if (opt.beard) { g.fillStyle = opt.hair || "#3a2a20"; g.globalAlpha = .9; g.beginPath(); g.ellipse(128, my + 18, 64, 34, 0, 0, Math.PI); g.fill(); g.globalAlpha = 1; }
  }));
}

// ---------- characters ----------
// opts: skin, shirt, pants, hair, hairStyle ('short'|'long'|'bun'|'spiky'|'none'), scale, glasses, coat, helmet, beard, shoes
export function makeChar(o = {}) {
  const c = { skin: "#f2c9a0", shirt: "#4f8ef7", pants: "#2f3a56", hair: "#3a2a20", hairStyle: "short", shoes: "#222", ...o };
  const root = new THREE.Group(); const rig = new THREE.Group(); root.add(rig);
  const torso = rbox(.56, .56, .36, .12, c.coat ? "#f4f6f8" : c.shirt); torso.position.y = .78; rig.add(torso);
  if (c.coat) { const sh = rbox(.3, .5, .02, .01, c.shirt); sh.position.set(0, .82, .18); rig.add(sh); }
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * .14, .52, 0); rig.add(hip);
    const leg = rbox(.22, .42, .26, .09, c.pants); leg.position.y = -.21; hip.add(leg);
    const shoe = rbox(.24, .12, .32, .05, c.shoes); shoe.position.set(0, -.44, .03); hip.add(shoe);
    legs.push(hip);
    const sho = new THREE.Group(); sho.position.set(s * .36, 1.0, 0); rig.add(sho);
    const arm = rbox(.17, .46, .2, .08, c.coat ? "#f4f6f8" : c.shirt); arm.position.y = -.2; sho.add(arm);
    const hand = rbox(.17, .14, .18, .07, c.skin); hand.position.y = -.47; sho.add(hand);
    sho.rotation.z = s * .08; arms.push(sho);
  }
  const headG = new THREE.Group(); headG.position.y = 1.07; rig.add(headG);
  const head = rbox(.78, .72, .68, .22, c.skin); head.position.y = .36; headG.add(head);
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex("smile", c), transparent: true, roughness: .9 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.66, .66), faceMat); face.position.set(0, .36, .345); headG.add(face);
  const hairM = mat(c.hair);
  if (c.hairStyle !== "none" && !c.helmet) {
    const top = rbox(.84, .26, .74, .12, hairM); top.position.set(0, .7, -.02); headG.add(top);
    const back = rbox(.84, .5, .2, .1, hairM); back.position.set(0, .5, -.3); headG.add(back);
    if (c.hairStyle === "long") { const l = rbox(.86, .75, .26, .12, hairM); l.position.set(0, .26, -.26); headG.add(l); for (const s of [-1, 1]) { const sd = rbox(.12, .6, .5, .05, hairM); sd.position.set(s * .43, .3, -.05); headG.add(sd); } }
    if (c.hairStyle === "bun") { const b = rbox(.34, .3, .3, .14, hairM); b.position.set(0, .9, -.2); headG.add(b); }
    if (c.hairStyle === "spiky") for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(.1, .26, 4), hairM); sp.position.set(-.3 + i * .15, .86, .05 - (i % 2) * .1); sp.rotation.z = (i - 2) * .2; sp.castShadow = true; headG.add(sp); }
    const fr = rbox(.8, .12, .1, .05, hairM); fr.position.set(0, .64, .3); headG.add(fr);
  }
  if (c.helmet) {
    const hm = new THREE.Mesh(new THREE.SphereGeometry(.47, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(c.helmet, { roughness: .4 }));
    hm.position.y = .62; hm.scale.set(1, .8, 1); hm.castShadow = true; headG.add(hm);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(.56, .56, .05, 24), mat(c.helmet, { roughness: .4 })); brim.position.y = .62; headG.add(brim);
    const badge = rbox(.16, .14, .03, .02, "#ffd23f"); badge.position.set(0, .78, .4); headG.add(badge);
  }
  root.scale.setScalar(c.scale || 1);
  const ch = { root, rig, head: headG, face, arms, legs, opts: c, expr: "smile" };
  ch.setExpr = (e) => { if (ch.expr !== e) { ch.expr = e; faceMat.map = faceTex(e, c); faceMat.needsUpdate = true; } };
  return ch;
}
// poses: deterministic, call every frame
export function pose(ch, name, t, amt = 1) {
  const [aL, aR] = ch.arms, [lL, lR] = ch.legs;
  // reset
  aL.rotation.set(0, 0, -.08); aR.rotation.set(0, 0, .08); lL.rotation.set(0, 0, 0); lR.rotation.set(0, 0, 0);
  ch.rig.position.set(0, 0, 0); ch.rig.rotation.set(0, 0, 0); ch.head.rotation.set(0, 0, 0);
  const br = Math.sin(t * 2.2 + ch.root.id) * .015; ch.rig.position.y = br; ch.head.rotation.z = Math.sin(t * 1.3 + ch.root.id) * .03;
  if (name === "cheer") { const j = Math.abs(Math.sin(t * 7 + ch.root.id)); ch.rig.position.y = j * .18 * amt; aL.rotation.z = -2.7 * amt + Math.sin(t * 9) * .2; aR.rotation.z = 2.7 * amt - Math.sin(t * 9) * .2; }
  else if (name === "wave") { aR.rotation.z = 2.6 * amt + Math.sin(t * 10) * .35; }
  else if (name === "point") { aR.rotation.set(-1.5 * amt, 0, .3); ch.head.rotation.y = .2; }
  else if (name === "hold") { aL.rotation.set(-1.2 * amt, 0, -.3); aR.rotation.set(-1.2 * amt, 0, .3); }
  else if (name === "walk") { const s = Math.sin(t * 8 + ch.root.id); lL.rotation.x = s * .5; lR.rotation.x = -s * .5; aL.rotation.x = -s * .5; aR.rotation.x = s * .5; ch.rig.position.y = Math.abs(s) * .05; }
  else if (name === "sit") { lL.rotation.x = -1.5; lR.rotation.x = -1.5; ch.rig.position.y = -.42; aL.rotation.x = -1.1; aR.rotation.x = -1.1; }
  else if (name === "type") { lL.rotation.x = -1.5; lR.rotation.x = -1.5; ch.rig.position.y = -.42; aL.rotation.x = -1.35 + Math.sin(t * 22) * .08; aR.rotation.x = -1.35 + Math.cos(t * 19) * .08; ch.head.rotation.x = .1; }
  else if (name === "cough") { const k = Math.max(0, Math.sin(t * 5 + ch.root.id)); ch.rig.rotation.x = k * .25; aR.rotation.set(-2.2 * k, 0, .5); }
  else if (name === "shrug") { const k = .5 + .5 * Math.sin(t * 4); aL.rotation.set(-.6, 0, -.9 * k); aR.rotation.set(-.6, 0, .9 * k); ch.head.rotation.z = Math.sin(t * 2) * .12; }
  else if (name === "laugh") { ch.rig.rotation.x = -.12 + Math.sin(t * 14 + ch.root.id) * .05; aL.rotation.set(-.8, 0, -.4); aR.rotation.set(-.8, 0, .4); }
  else if (name === "facepalm") { aR.rotation.set(-2.4, 0, -.5); ch.head.rotation.x = .25; }
  else if (name === "headhold") { aL.rotation.set(0, 0, -2.6); aR.rotation.set(0, 0, 2.6); ch.head.rotation.z = Math.sin(t * 3) * .1; }
}

// ---------- labels (floating numbers, signs) ----------
export function makeLabel(text, o = {}) {
  const w = o.w || 1024, h = o.h || 256;
  const draw = (g, W_, H_) => {
    const s = o._text;
    g.font = `900 ${o.size || 150}px Inter, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    if (o.box) { g.fillStyle = o.box; roundRect(g, 10, 10, W_ - 20, H_ - 20, 40); g.fill(); }
    g.lineJoin = "round"; g.lineWidth = o.stroke ?? 22; g.strokeStyle = o.strokeColor || "#1a1205"; if (g.lineWidth) g.strokeText(s, W_ / 2, H_ / 2 + 6);
    const gr = g.createLinearGradient(0, H_ * .2, 0, H_ * .8);
    gr.addColorStop(0, o.c1 || "#fff6b0"); gr.addColorStop(1, o.c2 || "#ffb400");
    g.fillStyle = o.flat || gr; g.fillText(s, W_ / 2, H_ / 2 + 6);
  };
  o._text = text;
  const tex = canvasTex(w, h, draw);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: o.depthTest ?? true }));
  sp.scale.set((o.world || 1.6), (o.world || 1.6) * h / w, 1);
  sp.renderOrder = 10;
  const L = { sprite: sp, text, set(t) { if (t !== L.text) { L.text = t; o._text = t; redraw(tex, draw); } } };
  return L;
}

// ---------- sets ----------
export function skyTex(top, bottom) { return canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }
export function baseScene({ sky = ["#7cc4ff", "#d8f0ff"], sun = 1.6, amb = .9, fog, shadow = true } = {}) {
  const sc = new THREE.Scene();
  sc.background = skyTex(...sky);
  const hemi = new THREE.HemisphereLight("#ffffff", "#8a8a7a", amb); sc.add(hemi);
  const dl = new THREE.DirectionalLight("#fff4e0", sun); dl.position.set(6, 12, 8); dl.castShadow = shadow;
  dl.shadow.mapSize.set(1024, 1024); Object.assign(dl.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .5, far: 40 }); dl.shadow.bias = -.0005; sc.add(dl);
  if (fog) sc.fog = new THREE.Fog(fog[0], fog[1], fog[2]);
  sc.userData = { hemi, dl };
  return sc;
}
export function ground(sc, color = "#79c25a", size = 80) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat(color)); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; sc.add(g); return g;
}
export function room(sc, { w = 10, d = 8, h = 4, wall = "#cfe6ee", floor = "#c8a477", trim = "#ffffff" } = {}) {
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(floor)); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; sc.add(f);
  const back = box(w, h, .2, wall); back.position.set(0, h / 2, -d / 2); sc.add(back);
  for (const s of [-1, 1]) { const side = box(.2, h, d, wall); side.position.set(s * w / 2, h / 2, 0); sc.add(side); }
  const tr = box(w, .25, .25, trim); tr.position.set(0, .12, -d / 2 + .1); sc.add(tr);
  return { floor: f, back };
}
export function house(sc, x, z, { w = 3, h = 2.4, d = 3, wall = "#f1d6b8", roof = "#c4553c", door = "#7a4b2a", win = "#9fd3ff", lit = false, ry = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g);
  const b = box(w, h, d, wall); b.position.y = h / 2; g.add(b);
  const r = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * .78, 1.4, 4), mat(roof)); r.position.y = h + .7; r.rotation.y = Math.PI / 4; r.castShadow = true; g.add(r);
  const dr = box(.7, 1.2, .05, door); dr.position.set(0, .6, d / 2 + .02); g.add(dr);
  const wm = lit ? new THREE.MeshStandardMaterial({ color: "#ffd98a", emissive: "#ffb340", emissiveIntensity: 1.4 }) : mat(win, { roughness: .2 });
  for (const s of [-1, 1]) { const wd = box(.6, .6, .05, wm); wd.position.set(s * w * .3, h * .62, d / 2 + .02); g.add(wd); }
  return g;
}
export function tree(sc, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); sc.add(g);
  const tr = box(.35, 1.2, .35, "#7a5230"); tr.position.y = .6; g.add(tr);
  const lf = rbox(1.6, 1.4, 1.6, .3, "#4caf50"); lf.position.y = 1.7; g.add(lf);
  return g;
}
export function sign(text, { w = 3, h = .8, bg = "#ffffff", fg = "#1b2a3a", size = 120, px = 300 } = {}) {
  return textPlane(w, h, px, (g, W_, H_) => {
    g.fillStyle = bg; g.fillRect(0, 0, W_, H_);
    g.fillStyle = fg; g.font = `900 ${size}px Inter, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W_ / 2, H_ / 2 + 4);
  });
}
export function screen(w, h, draw, { emissive = 1.2, px = 300 } = {}) {
  const tex = canvasTex(Math.round(w * px), Math.round(h * px), draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: "#ffffff", emissiveIntensity: emissive, roughness: .4 }));
  m.userData.tex = tex; return m;
}
export function confetti(sc, n = 160, area = [8, 6, 4], seed = 3) {
  srand(seed); const cols = ["#ff5d7a", "#ffd23f", "#4fc3f7", "#7ee081", "#b388ff", "#ffffff"];
  const ps = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .07), new THREE.MeshBasicMaterial({ color: cols[i % 6], side: THREE.DoubleSide }));
    const p = { m, x: (rnd() - .5) * area[0], y0: area[1] + rnd() * 3, z: (rnd() - .5) * area[2], sp: .8 + rnd() * .8, ph: rnd() * 6, rs: 2 + rnd() * 4 };
    sc.add(m); ps.push(p);
  }
  return (t) => ps.forEach(p => { const y = p.y0 - t * p.sp * 2; p.m.position.set(p.x + Math.sin(t * 2 + p.ph) * .3, y, p.z); p.m.rotation.set(t * p.rs, t * p.rs * .7, 0); p.m.visible = y > -.2 && t > 0; });
}
