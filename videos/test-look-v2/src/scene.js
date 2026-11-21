// Look v2 test – 5 s Pebble hook: dragon fire hits Pebble's glowing shield.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, v3, srand, rnd, mat, rbox, box, canvasTex, makeChar, pose, baseScene, confetti,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";
import {
  sandTex, woodTex, stoneTex, scaleTex, texMat, dress, cineLights, makePost, fireStream, sparkBurst, shieldDome, stringLights, bunting, shake, glowSprite,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/look2.js";

const TOTAL = 5;
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const cam = new THREE.PerspectiveCamera(42, W / H, .05, 300);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];

// ---------- creatures ----------
function makeTurtle() {
  const g = new THREE.Group();
  const shellTex = canvasTex(256, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#7fb24a"); gr.addColorStop(1, "#4f7f2a"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#2f4f18"; c.lineWidth = 9; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { const cx = x * 62 + (y % 2) * 31, cy = y * 54; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.lineTo(cx + Math.cos(a) * 29, cy + Math.sin(a) * 29); } c.closePath(); c.stroke(); c.fillStyle = "rgba(255,255,220,.12)"; c.beginPath(); c.arc(cx - 6, cy - 8, 10, 0, 7); c.fill(); } });
  const shellM = new THREE.MeshStandardMaterial({ map: shellTex, roughness: .45, emissive: "#3fffe0", emissiveMap: shellTex, emissiveIntensity: 0 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), shellM); shell.scale.set(1, .78, 1.15); shell.position.y = .06; shell.castShadow = true; g.add(shell);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.222, .025, 8, 32), mat("#d8c07a")); rim.rotation.x = Math.PI / 2; rim.scale.y = 1.15; rim.position.y = .065; g.add(rim);
  const skinM = new THREE.MeshStandardMaterial({ map: scaleTex("#8fbf5a"), roughness: .7 });
  const head = new THREE.Group(); head.position.set(0, .1, .29); g.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.08, 20, 14), skinM); hd.scale.set(1, .92, 1.2); head.add(hd);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.026, 12, 10), mat("#ffffff", { roughness: .2 })); e.position.set(s * .042, .03, .062); head.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(.015, 10, 8), mat("#111", { roughness: .1 })); p.position.set(s * .044, .03, .083); head.add(p);
    const br = box(.04, .008, .01, "#2f4f18"); br.position.set(s * .045, .062, .08); br.rotation.z = s * -.45; head.add(br); }
  const legs = []; for (const [x, z] of [[-.17, .14], [.17, .14], [-.17, -.14], [.17, -.14]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), skinM); l.scale.set(1, .7, 1.2); l.position.set(x, .03, z); g.add(l); legs.push(l); }
  return { g, head, shellM, setGlow(k) { shellM.emissiveIntensity = k * .9; } };
}
function makeDragon() {
  const g = new THREE.Group(); const sc = texMat(scaleTex("#c0392b"), [3, 3], { roughness: .5 }); const belly = new THREE.MeshStandardMaterial({ color: "#f0a35a", roughness: .6 }), horn = mat("#f3e6c8", { roughness: .4 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), sc); body.scale.set(.75, .7, 1.25); body.position.y = 1.3; body.castShadow = true; g.add(body);
  const bel = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), belly); bel.scale.set(.6, .55, 1.05); bel.position.set(0, 1.12, .15); g.add(bel);
  const neckCurve = new THREE.CatmullRomCurve3([v3([0, 1.6, .7]), v3([0, 2.2, 1.2]), v3([0, 2.6, 1.7]), v3([0, 2.75, 2.05])]);
  const neck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 24, .32, 16), sc); neck.castShadow = true; g.add(neck);
  for (let i = 0; i < 6; i++) { const p = neckCurve.getPoint(i / 6); const sp = new THREE.Mesh(new THREE.ConeGeometry(.08, .25, 4), horn); sp.position.set(0, p.y + .05, p.z - .3); sp.rotation.x = -.5; g.add(sp); }
  const head = new THREE.Group(); head.position.set(0, 2.85, 2.25); g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.42, 24, 16), sc); skull.scale.set(1, .85, 1.05); head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), sc); snout.scale.set(.85, .6, 1.4); snout.position.set(0, -.04, .5); head.add(snout);
  const jaw = new THREE.Group(); jaw.position.set(0, -.2, .1); head.add(jaw); const j = new THREE.Mesh(new THREE.SphereGeometry(.26, 16, 12), new THREE.MeshStandardMaterial({ color: "#7a1f17", roughness: .6 })); j.scale.set(.8, .4, 1.4); j.position.set(0, -.04, .4); jaw.add(j);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const tooth = new THREE.Mesh(new THREE.ConeGeometry(.03, .09, 4), horn); tooth.rotation.x = Math.PI; tooth.position.set(s * .15, -.2, .5 + i * .12); head.add(tooth); }
  const mouthGlow = glowSprite("#ffb347", .6, 0); mouthGlow.position.set(0, -.2, .8); head.add(mouthGlow);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(.09, .6, 10), horn); h.position.set(s * .25, .38, -.25); h.rotation.x = -.9; h.rotation.z = s * -.2; head.add(h);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.08, 12, 10), new THREE.MeshStandardMaterial({ color: "#ffe066", emissive: "#ffb000", emissiveIntensity: 1.5 })); eye.position.set(s * .27, .12, .3); head.add(eye);
    const pu = box(.02, .1, .02, "#111"); pu.position.set(s * .3, .12, .37); head.add(pu);
    const brow = box(.22, .05, .08, "#7a1f17"); brow.position.set(s * .25, .24, .3); brow.rotation.z = s * .4; head.add(brow); }
  const wings = []; for (const s of [-1, 1]) { const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.quadraticCurveTo(1.2, 1.4, 2.6, 1.2); shape.lineTo(2.2, .2); shape.quadraticCurveTo(1.9, -.1, 1.6, -.4); shape.quadraticCurveTo(1.2, -.2, 1, -.6); shape.quadraticCurveTo(.6, -.3, 0, -.6);
    const w = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), new THREE.MeshStandardMaterial({ color: "#8e2a20", side: THREE.DoubleSide, roughness: .6, emissive: "#3a0800" })); const pv = new THREE.Group(); pv.position.set(s * .5, 1.8, .2); w.scale.x = s; w.rotation.x = -Math.PI / 2; pv.add(w); g.add(pv); wings.push(pv); }
  const tailCurve = new THREE.CatmullRomCurve3([v3([0, 1.1, -1]), v3([0, .7, -2]), v3([.4, .4, -3]), v3([1.2, .3, -3.6])]); const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 24, .22, 12), sc); tail.castShadow = true; g.add(tail);
  for (const [x, z] of [[-.5, .7], [.5, .7], [-.5, -.6], [.5, -.6]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.2, .16, .9, 12), sc); l.position.set(x, .45, z); l.castShadow = true; g.add(l); }
  const fireL = new THREE.PointLight("#ff7a1a", 0, 14); fireL.position.set(0, 2.6, 3); g.add(fireL);
  return { g, head, jaw, wings, mouthGlow, fireL, anim(t, { flap = 1, open = 0 } = {}) {
    wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (.35 + Math.sin(t * 5) * .4 * flap); }); head.rotation.x = .15 + Math.sin(t * 1.5) * .04; jaw.rotation.x = open * .55; mouthGlow.material.opacity = open * .6; fireL.intensity = open * 10; } };
}

// ---------- arena (dense) ----------
const sc = baseScene({ sky: ["#2a3f8a", "#ff9a6a"], sun: 2, amb: .5 });
cineLights(sc, { key: "#ffc98a", keyI: 2.4, rim: "#7fc8ff", rimI: 2.8, keyPos: [7, 8, 9], rimPos: [-4, 7, -10], hemiSky: "#a8b8ff", hemiGround: "#8a5a3a" });
const floor = new THREE.Mesh(new THREE.CircleGeometry(11, 64), texMat(sandTex(), [6, 6])); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
const outer = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#4a5a3a")); outer.rotation.x = -Math.PI / 2; outer.position.y = -.01; sc.add(outer);
const wall = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 1.2, 64, 1, true), texMat(stoneTex(), [16, 1], { side: THREE.DoubleSide })); wall.position.y = .6; wall.receiveShadow = true; sc.add(wall);
for (let r = 0; r < 5; r++) { const R = 11.6 + r * 1.5, y = 1.2 + r * .85;
  const riser = new THREE.Mesh(new THREE.CylinderGeometry(R, R, .85, 64, 1, true), texMat(stoneTex("#a89f90"), [20, 1], { side: THREE.DoubleSide })); riser.position.y = y - .42; sc.add(riser);
  const seat = new THREE.Mesh(new THREE.RingGeometry(R, R + 1.5, 64), texMat(woodTex("#8a5a32"), [24, 1], { side: THREE.DoubleSide })); seat.rotation.x = -Math.PI / 2; seat.position.y = y; seat.receiveShadow = true; sc.add(seat); }
const crowd = []; srand(31); const SHIRTS = ["#ff7b54", "#6c63ff", "#2ec4b6", "#ffbe0b", "#ef476f", "#06d6a0", "#118ab2", "#f4a261", "#9b5de5"];
for (let r = 0; r < 4; r++) for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + r * .1; if (Math.cos(a) > .85) continue; const R = 12.2 + r * 1.5;
  const p = makeChar({ shirt: SHIRTS[(i + r) % 9], pants: ["#2b2d42", "#3d405b", "#264653"][i % 3], skin: SKIN[(i * 3 + r) % 5], hair: ["#2a1d14", "#e3b04b", "#7a3e1d", "#111", "#c0392b"][(i + r) % 5], hairStyle: ["short", "long", "bun", "spiky"][(i + r) % 4], scale: .85, bold: true });
  p.root.position.set(Math.cos(a) * R, 1.2 + r * .85, Math.sin(a) * R); p.root.lookAt(0, 1.2 + r * .85, 0); p.setExpr(["laugh", "grin", "shock"][(i + r) % 3]); p.root.traverse(m => { if (m.isMesh) m.castShadow = false; }); sc.add(p.root); crowd.push(p); }
for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + .3; const x = Math.cos(a) * 11.3, z = Math.sin(a) * 11.3;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 6, 8), mat("#5a3a1a")); pole.position.set(x, 3, z); sc.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .7, 8, 1), mat(["#e63946", "#2f5fa0", "#ffd23f", "#06d6a0"][i % 4], { side: THREE.DoubleSide })); flag.position.set(x + .55, 5.6, z); sc.add(flag);
  const torch = glowSprite("#ffb347", 1.1, .9); torch.position.set(x, 6.2, z); sc.add(torch);
  const b = (i + 1) % 10, a2 = b / 10 * Math.PI * 2 + .3; stringLights(sc, [x, 5.8, z], [Math.cos(a2) * 11.3, 5.8, Math.sin(a2) * 11.3], { droop: .9, seed: i });
  bunting(sc, [x, 4.6, z], [Math.cos(a2) * 11.3, 4.6, Math.sin(a2) * 11.3], { droop: .6 }); }
const conf = confetti(sc, 260, [14, 6, 14], 5);

// ---------- cast ----------
const HERO = { shirt: "#5f7a4a", pants: "#3a4a6a", hair: "#5a3a1a", hairStyle: "spiky", skin: "#f2c9a0", scale: .78, bold: true };
const JAX = { shirt: "#c0392b", pants: "#1f2937", hair: "#e3c04b", hairStyle: "spiky", skin: "#f7d7b8", scale: .82, bold: true };
const hero = dress(makeChar(HERO)); sc.add(hero.root); const scarf = rbox(.62, .14, .44, .06, "#2f5fa0"); scarf.position.y = 1.04; hero.rig.add(scarf);
const jax = dress(makeChar(JAX)); sc.add(jax.root);
const peb = makeTurtle(); sc.add(peb.g); peb.g.scale.setScalar(1.3);
const dome = shieldDome(.55); sc.add(dome);
const drag = makeDragon(); sc.add(drag.g);
const fire = fireStream(sc, 110); const sparks = sparkBurst(sc, 110);
const PEB = [0, 0, 2], DRAG = [0, 0, -3.4];

// ---------- shots ----------
const post = makePost(renderer, sc, cam, { bloom: [.42, .4, .86] });
const C = (p, l) => ({ p, l });
const shots = [
  // 1: hero + Pebble under fire (face, emotion, action from frame 1)
  { t0: 0, from: C([2.3, 1.05, .5], [-.35, .72, 2.3]), to: C([2.0, .98, .85], [-.35, .74, 2.3]), focus: 2.9, shake: .025, fire: 1 },
  // 2: Jax shocked, dragon behind
  { t0: 1.4, from: C([.3, 1.45, -.2], [-1.9, 1.25, -2.2]), to: C([.15, 1.4, -.55], [-1.9, 1.28, -2.2]), focus: 2.4, shake: .012, fire: 1 },
  // 3: dragon head from below, fire
  { t0: 2.5, from: C([3.1, 3.0, 1.6], [0, 2.6, -1.0]), to: C([2.8, 3.0, 1.2], [0, 2.65, -1.0]), focus: 4, shake: .03, fire: 1 },
  // 4: wide – packed arena, glowing shield
  { t0: 3.5, from: C([2.4, 2.0, 7.0], [-.4, 1.1, -.3]), to: C([3.0, 2.8, 8.8], [-.4, 1.3, -.5]), focus: 8, ap: .0012, shake: .008, fire: 1 },
];
function draw(t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : TOTAL, k = ease((t - s.t0) / (t1 - s.t0));
  cam.position.copy(v3(s.from.p).lerp(v3(s.to.p), k)); cam.lookAt(v3(s.from.l).lerp(v3(s.to.l), k)); shake(cam, t, s.shake);
  crowd.forEach((c, j) => pose(c, j % 4 ? "cheer" : "point", t + j * .3, .8)); conf(t + 1.5);
  hero.root.position.set(-.55, 0, 2.75); hero.root.rotation.y = Math.PI * .92; pose(hero, "hold", t); hero.setExpr(i === 3 ? "grin" : "angry"); hero.rig.rotation.x = -.08;
  hero.arms[0].rotation.set(-1.1, 0, -.4); hero.arms[1].rotation.set(-.4, 0, .9);
  jax.root.position.set(-1.9, 0, -2.0); jax.root.rotation.y = .25; pose(jax, "headhold", t); jax.setExpr("shock");
  peb.g.position.set(...PEB); peb.g.rotation.y = Math.PI; peb.setGlow(1 + .15 * Math.sin(t * 11)); peb.head.position.z = .29;
  dome.position.set(PEB[0], 0, PEB[2]); dome.userData.set(1 + .08 * Math.sin(t * 13));
  drag.g.position.set(...DRAG); drag.anim(t, { flap: .7, open: 1 });
  const mouth = new THREE.Vector3(0, -.2, .95); drag.head.localToWorld(mouth);
  fire(t, [mouth.x, mouth.y, mouth.z], [PEB[0], .75, PEB[2] - .35], s.fire, 1.1);
  sparks(t, [PEB[0], .5, PEB[2] - .2], s.fire, .55);
  post.render(sc, s.focus, s.ap || .004);
}

// ---------- overlays ----------
const tl = gsap.timeline({ paused: true });
tl.fromTo("#hook", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: .2, ease: "back.out(2.5)", immediateRender: false }, 0);
tl.fromTo("#speed", { opacity: .9 }, { opacity: .5, duration: 1.4, immediateRender: false }, 0); tl.set("#speed", { opacity: 0 }, 1.4); tl.fromTo("#speed", { opacity: .7 }, { opacity: 0, duration: .9, immediateRender: false }, 2.5);
[0, 1.4, 2.5, 3.5].forEach(x => tl.fromTo("#flash", { opacity: .55 }, { opacity: 0, duration: .18, immediateRender: false }, x));
const clock = { t: 0 }; tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; tl.seek(0); draw(0);
