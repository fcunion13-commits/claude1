// creatures.js – Look v2 creatures shared by all Pebble videos: turtle (glowing shell), dragon (tube neck, scales, fire mouth), saint.
import { THREE, v3, mat, rbox, box, canvasTex, makeChar } from "./lib3d.js";
import { scaleTex, texMat, glowSprite } from "./look2.js";
export function makeTurtle() {
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
export function makeDragon() {
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


export function makeSaint() {
  const c = makeChar({ shirt: "#efe6d2", pants: "#efe6d2", hair: "#e6e6e6", hairStyle: "long", skin: "#e8c9a8", beard: true, scale: 1.05, bold: true });
  const robe = rbox(.78, 1.0, .52, .2, "#e9dfc6"); robe.position.y = .45; c.rig.add(robe);
  const hood = rbox(.92, .5, .82, .2, "#c9b98f"); hood.position.set(0, .82, -.06); c.head.add(hood);
  const staff = new THREE.Group(); const st = box(.07, 2.2, .07, "#7a5230"); st.position.y = 1.1; staff.add(st);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.16, 18, 14), new THREE.MeshStandardMaterial({ color: "#fff6c0", emissive: "#ffe9a0", emissiveIntensity: 2 })); orb.position.y = 2.3; staff.add(orb);
  const og = glowSprite("#ffe9a0", 1.2, .7); og.position.y = 2.3; staff.add(og);
  staff.position.set(.5, 0, .1); c.root.add(staff); c.staff = staff; c.orb = orb; return c;
}
