// Look v2 test – 5 s Pebble hook: dragon fire hits Pebble's glowing shield.
import {
  THREE, W, H, clamp, lerp, ease, easeOut, v3, srand, rnd, mat, rbox, box, canvasTex, makeChar, pose, baseScene, confetti,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";
import {
  sandTex, woodTex, stoneTex, scaleTex, texMat, dress, cineLights, makePost, fireStream, sparkBurst, shieldDome, stringLights, bunting, shake, glowSprite,
} from "../../../.claude/skills/tiktok-in-this-town/scripts/look2.js";
import { makeTurtle, makeDragon } from "../../../.claude/skills/tiktok-in-this-town/scripts/creatures.js";

const TOTAL = 5;
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const cam = new THREE.PerspectiveCamera(42, W / H, .05, 300);
const SKIN = ["#f2c9a0", "#c98f63", "#8d5a3b", "#f7d7b8", "#e0ac7e"];

// ---------- creatures ----------
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
