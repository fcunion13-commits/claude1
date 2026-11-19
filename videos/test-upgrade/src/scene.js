// Upgrade test: CC0 Quaternius characters (skeletal animation) + furniture, post-processing (AO, outline, bloom, SMAA), 60 fps
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { makeLabel, rbox, box, mat, clamp, lerp, ease } from "../../../.claude/skills/tiktok-in-this-town/scripts/lib3d.js";

const W = 1080, H = 1920, TOTAL = 15;
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const sc = new THREE.Scene(); sc.background = new THREE.Color("#1a1410");
const pmrem = new THREE.PMREMGenerator(renderer); sc.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; sc.environmentIntensity = .35;
const cam = new THREE.PerspectiveCamera(42, W / H, .1, 100);

// ---------- room ----------
const floorTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#8a5a36" : "#7a4e2e"; g.fillRect(0, i * 64, 512, 64); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, i * 64, 512, 2); for (let k = 0; k < 3; k++) g.fillRect(((i * 137 + k * 211) % 512), i * 64, 2, 64); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .7 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
const wallM = new THREE.MeshStandardMaterial({ color: "#e9d8bc", roughness: .9 });
const wall = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .15), wallM); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; sc.add(m); return m; };
wall(9, 3.6, 0, 1.8, -4, 0); { const ceil = new THREE.Mesh(new THREE.PlaneGeometry(9, 12), new THREE.MeshStandardMaterial({ color: "#f3ead8", roughness: .95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.6, 2); sc.add(ceil); } wall(8, 3.6, -4.5, 1.8, 0, Math.PI / 2); wall(8, 3.6, 4.5, 1.8, 0, Math.PI / 2);
const skirt = box(9, .14, .06, "#f7f2ea"); skirt.position.set(0, .07, -3.92); sc.add(skirt);
// window with glowing daylight (bloom)
const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), new THREE.MeshStandardMaterial({ color: "#cfe6ff", emissive: "#cfe6ff", emissiveIntensity: 2.2 })); win.position.set(1.6, 2, -3.91); sc.add(win);
{ const fr = rbox(2, 1.6, .08, .02, "#f7f2ea"); fr.position.set(1.6, 2, -3.95); sc.add(fr); const bar = box(.06, 1.4, .05, "#f7f2ea"); bar.position.set(1.6, 2, -3.88); sc.add(bar); }
// warm lamp (bloom)
const lampG = new THREE.Group(); lampG.position.set(-3.4, 0, -3.2); sc.add(lampG);
{ const p = box(.06, 1.6, .06, "#2b2b2b"); p.position.y = .8; lampG.add(p); const shd = new THREE.Mesh(new THREE.CylinderGeometry(.24, .34, .4, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#fff1d6", emissive: "#ffcf8a", emissiveIntensity: 1.2, side: THREE.DoubleSide })); shd.position.y = 1.75; lampG.add(shd); }
const lampL = new THREE.PointLight("#ffbe7a", 2.2, 5, 2); lampL.position.set(-3.4, 1.9, -3.0); sc.add(lampL);
const sun = new THREE.DirectionalLight("#fff4e6", 1.4); sun.position.set(3, 6, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); sun.shadow.bias = -.0005; sc.add(sun);
sc.add(new THREE.HemisphereLight("#ffffff", "#5a4a3a", .55));
// table + pie (code props)
const table = rbox(1.6, .1, 1, .03, "#a8784c"); table.position.set(.8, .78, -.6); table.castShadow = table.receiveShadow = true; sc.add(table);
for (const [x, z] of [[-.68, -.4], [.68, -.4], [-.68, .4], [.68, .4]]) { const l = box(.08, .78, .08, "#6b4423"); l.position.set(.8 + x, .39, -.6 + z); sc.add(l); }
const pie = new THREE.Group(); pie.position.set(.9, .84, -.6); sc.add(pie);
{ const c = new THREE.Mesh(new THREE.CylinderGeometry(.24, .21, .08, 32), mat("#d8964a")); pie.add(c); const tp = new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, .02, 32), mat("#b0122a", { roughness: .35 })); tp.position.y = .05; pie.add(tp); }

// ---------- loading ----------
const outlineTargets = [];
const fitHeight = (obj, h) => { const b = new THREE.Box3().setFromObject(obj); const s = h / (b.max.y - b.min.y); obj.scale.multiplyScalar(s); const b2 = new THREE.Box3().setFromObject(obj); obj.position.y -= b2.min.y; return obj; };
const fitWidth = (obj, w) => { const b = new THREE.Box3().setFromObject(obj); const s = w / Math.max(b.max.x - b.min.x, b.max.z - b.min.z); obj.scale.multiplyScalar(s); const b2 = new THREE.Box3().setFromObject(obj); obj.position.y -= b2.min.y; return obj; };
const fixMat = (x) => { if (x.isMeshPhongMaterial || x.isMeshLambertMaterial) { const n = new THREE.MeshStandardMaterial({ color: x.color, map: x.map || null, roughness: .75, metalness: 0 }); return n; } x.transparent = false; x.opacity = 1; return x; };
const prep = (o) => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.material) m.material = Array.isArray(m.material) ? m.material.map(fixMat) : fixMat(m.material); } }); return o; };
async function loadFBX(name, place) { const o = prep(await new FBXLoader().loadAsync(`assets/models/${name}.fbx`)); const g = new THREE.Group(); g.add(o); place(g, o); sc.add(g); return g; }
async function loadChar(file) { const g = await new GLTFLoader().loadAsync(`assets/models/${file}`); prep(g.scene); fitHeight(g.scene, 1.75); sc.add(g.scene);
  const mixer = new THREE.AnimationMixer(g.scene); const clips = {}; g.animations.forEach(a => clips[a.name] = a); return { root: g.scene, mixer, clips, act: {} }; }
function play(ch, name, t, speed = 1) { // deterministic: set clip time directly
  const clip = ch.clips[name]; if (!ch.act[name]) { ch.act[name] = ch.mixer.clipAction(clip); }
  Object.entries(ch.act).forEach(([k, a]) => { a.enabled = k === name; a.setEffectiveWeight(k === name ? 1 : 0); if (k === name) a.play(); });
  ch.act[name].time = (t * speed) % clip.duration; ch.mixer.update(0);
}

let man, woman, numL; const numEl = document.getElementById("num");
const composer = new EffectComposer(renderer);
async function init() {
  await Promise.all([
    loadFBX("Couch_Large1", (g, o) => { fitWidth(o, 2.4); g.position.set(-2.2, 0, -3.2); }),
    loadFBX("Bookshelf", (g, o) => { fitHeight(o, 2.2); g.position.set(3.7, 0, -2.4); g.rotation.y = -Math.PI / 2; }),
    loadFBX("Chair_1", (g, o) => { fitHeight(o, 1.0); g.position.set(-.25, 0, -.6); g.rotation.y = Math.PI / 2; }),
    loadFBX("Chair_1", (g, o) => { fitHeight(o, 1.0); g.position.set(1.85, 0, -.6); g.rotation.y = -Math.PI / 2; }),
    loadFBX("Carpet_1", (g, o) => { fitWidth(o, 3.2); g.position.set(-1.6, .005, -1.8); }),
    loadFBX("Curtains_Double", (g, o) => { fitHeight(o, 2.3); g.position.set(1.6, .9, -3.8); }),
    loadFBX("Door_1", (g, o) => { fitHeight(o, 2.3); g.position.set(-4.4, 0, 1.6); g.rotation.y = Math.PI / 2; }),
    loadFBX("Drawer_1", (g, o) => { fitHeight(o, .9); g.position.set(3.8, 0, .8); g.rotation.y = -Math.PI / 2; }),
  ]);
  man = await loadChar("man.gltf"); woman = await loadChar("woman.gltf");
  outlineTargets.push(man.root, woman.root);
  numL = makeLabel("47", { world: .8, w: 512, h: 300, size: 220, stroke: 26, depthTest: false }); numL.sprite.visible = false;
  // post-processing chain
  composer.addPass(new RenderPass(sc, cam));
  const ao = new GTAOPass(sc, cam, W, H); ao.output = GTAOPass.OUTPUT.Default; ao.updateGtaoMaterial({ radius: .5, distanceExponent: 1.4, thickness: 1.2, scale: 1.2 }); composer.addPass(ao);
  const ol = new OutlinePass(new THREE.Vector2(W, H), sc, cam, outlineTargets); ol.edgeStrength = 3; ol.edgeThickness = 1.2; ol.visibleEdgeColor.set("#1a1208"); ol.hiddenEdgeColor.set("#000000"); ol.edgeGlow = 0; composer.addPass(ol);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .35, .4, .92));
  composer.addPass(new SMAAPass(W, H));
  composer.addPass(new OutputPass());
}

// ---------- animation (pure function of t) ----------
const P = (a, b, k) => new THREE.Vector3(...a).lerp(new THREE.Vector3(...b), k);
function draw(t) {
  // man walks in through the door, stops, waves
  const walkEnd = 6.2, k = clamp(t / walkEnd);
  const path = [[-4.2, 0, 1.6], [-2.2, 0, 1.2], [-.4, 0, .3]];
  const pos = k < .5 ? P(path[0], path[1], k * 2) : P(path[1], path[2], (k - .5) * 2);
  man.root.position.copy(pos);
  man.root.rotation.y = k < .5 ? Math.PI / 2 - .05 : Math.PI / 2 - .4;
  if (t < walkEnd) play(man, "Walk", t, 1); else if (t < 9) { man.root.rotation.y = .2; play(man, "Wave", t - walkEnd, 1); } else { man.root.rotation.y = .2; play(man, "Idle", t, 1); }
  // woman by the table: idle, turns, waves back, then interacts with the pie
  woman.root.position.set(1.0, 0, -1.5);
  const turn = ease(clamp((t - 5.2) / 1)); woman.root.rotation.y = lerp(0, -.8, turn);
  if (t < 6.8) play(woman, "Idle", t, 1); else if (t < 9.4) play(woman, "Wave", t - 6.8, 1); else play(woman, "Interact", t - 9.4, .8);
  numL.sprite.position.set(1.0, 2.25, -1.5);
  const pulse = 1 + .06 * Math.sin(t * 4); numL.sprite.scale.set(.8 * pulse, .8 * 300 / 512 * pulse, 1);
  lampL.intensity = 2.2 + Math.sin(t * 9) * .1;
  // camera: wide from the doorway side, slow push in and arc to the woman + number
  const c = ease(t / TOTAL);
  cam.position.copy(P([-.4, 2.2, 7.6], [1.2, 1.8, 2.4], c));
  cam.lookAt(P([-.6, 1.0, -.6], [.7, 1.45, -1.3], c));
  // HTML number above grandma's head, projected from 3D (crisp, unaffected by post-processing)
  const hp = new THREE.Vector3(1.0, 2.15, -1.5).project(cam);
  numEl.style.transform = `translate(${(hp.x * .5 + .5) * W}px, ${(-hp.y * .5 + .5) * H}px) translate(-50%, -50%) scale(${pulse})`;
  composer.render();
}

// ---------- captions + timeline (registered only after loading finishes) ----------
init().then(() => {
  window.__dbg = { manBox: new THREE.Box3().setFromObject(man.root), womanBox: new THREE.Box3().setFromObject(woman.root), manScale: man.root.scale.toArray(), label: numL.sprite.visible, fbxMats: [] };
  sc.traverse(o => { if (o.isMesh && o.material && !o.isSkinnedMesh) { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m.type !== 'MeshStandardMaterial' && window.__dbg.fbxMats.length < 14) window.__dbg.fbxMats.push([o.name, m.type, m.transparent, m.opacity, m.color && m.color.getHexString(), !!m.map]); } });
  const tl = gsap.timeline({ paused: true });
  const caps = [[.4, 2.6, "In this town,"], [2.6, 5.2, "everyone has a <span class='hk'>number</span>."], [9.6, 12.6, "Grandma's is <span class='hk'>47</span>."]];
  const el = document.getElementById("caps");
  caps.forEach(([a, b, txt]) => { const d = document.createElement("div"); d.className = "cap"; d.innerHTML = txt; el.appendChild(d); tl.set(d, { opacity: 0 }, 0); tl.fromTo(d, { opacity: 1, scale: .86 }, { opacity: 1, scale: 1, duration: .12, immediateRender: false }, a); tl.set(d, { opacity: 0 }, b); });
  const clock = { t: 0 };
  tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none", onUpdate: () => draw(clock.t) }, 0);
  window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
  tl.seek(0); draw(0);
  window.__probe = (t) => { draw(t); const v = new THREE.Vector3(); man.root.getWorldPosition(v); let vis = 0; man.root.traverse(o => { if (o.isSkinnedMesh) vis++; }); return { pos: v.toArray(), skinned: vis, visible: man.root.visible, parent: !!man.root.parent }; };
});
