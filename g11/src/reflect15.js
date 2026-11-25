// Episode 15, 1:00-1:25: the terrace over the cloud sea at nightfall. Two people in today's clothes. One stands at the edge of the lawn, head bowed, not seeing how things will work out (h1). A friend comes over from the house
// with a lantern, points to the sky, and the stars come out, more and more of them (h2). The first one stands with open hands and the light of the lantern on their face (h3); at h4 both look up and the camera tilts
// up into the stars.
// Cinematic interpretation: the terrace, the lantern, the friend and the thickening stars are a picture of "look up, trust the One who made the stars"; they are not in Scripture and they do not depict Abram's night.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea } from './world10.js';
import { makeModern } from './reflect10.js';
import { LK } from './lights.js';
import { makeStars } from './stars15.js';

export const RT = { t0: 60, end: 85 };
const SK = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a', '#8a5a3a', '#ba8458'];
const AX = [.2, .7];                                  // where the first person stands
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }

export function makeReflect() {
  const R = rng(5353), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#5f7a42', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#4a3c30', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; gb.add(G.ico0, pk(R, ['#6a8a48', '#587a3a', '#76965a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#6e6a66', '#7a766e', '#5e5a58']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5354), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[-7.6, -5.2, 1.3, 0], [-5.4, -7.4, 1.2, 1], [-4.2, -3.8, 1.0, 2], [5.6, -7.2, 1.2, 0], [7.8, -4.6, 1.3, 1], [8.6, -.4, 1.2, 0], [-8.6, -1.0, 1.2, 1], [-9.6, 4.6, 1.1, 0], [8.0, 4.4, 1.1, 2], [6.2, -3.0, 1.0, 2], [-2.6, -9.0, 1.2, 0], [8.4, 7.4, 1.0, 1]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#4f8a3a', '#46803a', '#5a9a44']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#2b3250', '#232a45', '#1c2238'];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + (R() - .5) * .1, r = 70 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5355), 140, [[0, 0, 14]]); g.add(sea.mesh); sea.mat.color.set('#3a4268'); sea.mat.emissive.set('#161c38');
  const stars = makeStars({ seed: 77 }); g.add(stars.group);

  // ---- the familiar corner: a small house with a lit window, a bench and a lantern on a post
  const hb = new GB(R); { const hx = -5.6, hz = .2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02); hb.box('#7a5636', [hx + 1.22, .78, hz + .72], [.03, .34, .04], [0, 0, 0], .01);
    hb.box('#8a6642', [-3.4, .24, 1.8], [1.5, .07, .4], [0, 0, 0], .03); for (const x of [-4.0, -2.8]) hb.box('#6a4a2c', [x, .12, 1.8], [.09, .24, .32], [0, 0, 0], .03);
    hb.box('#4a3624', [-2.0, .62, 1.6], [.09, 1.24, .09], [0, 0, 0], .03); hb.box('#3a2a1c', [-2.0, 1.3, 1.6], [.2, .24, .2], [0, 0, 0], .03); hb.box('#2a1c10', [-2.0, 1.46, 1.6], [.26, .05, .26], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const winGlow = spriteGlow(-4.4, .8, .9, 1.5, 0xffb860, .8), lanGlow = spriteGlow(-2.0, 1.3, 1.6, 1.6, 0xffb860, .8), lanGlow2 = spriteGlow(-2.0, 1.3, 1.6, .6, 0xffe6a8, .7); [winGlow, lanGlow, lanGlow2].forEach(s => { s.material.fog = false; g.add(s); });

  // ---- two people: the one at the edge of the lawn (A) and the friend who comes with a lantern (B)
  const mkP = (o = {}) => { const p = makeModern(R, { skin: pk(R, SK), hat: null, sc: 1.1, ...o }); g.add(p.group); return p; };
  const A = mkP({ jacket: '#5e7fa6', jacket2: '#4a6a78', hair: '#2a1a10' }), B = mkP({ jacket: '#a2564e', jacket2: '#8a4a3c', long: true, hair: '#3a2616' });
  const lan = new THREE.Group(); { const lb = new GB(R); lb.box('#3a2a1c', [0, -.07, 0], [.1, .02, .1], [0, 0, 0], .01); lb.box('#3a2a1c', [0, .07, 0], [.1, .02, .1], [0, 0, 0], .01); lb.box('#e8b060', [0, 0, 0], [.07, .12, .07], [0, 0, 0], .01); const m = new THREE.Mesh(lb.build(), lam); lan.add(m); }
  lan.position.set(.03, .6, .3); B.group.add(lan); const lanH = spriteGlow(.03, .6, .3, .5, 0xffb860, .8), lanH2 = spriteGlow(.03, .6, .3, .2, 0xffe6a8, .7); [lanH, lanH2].forEach(s => { s.material.fog = false; B.group.add(s); });
  const lanL = new THREE.PointLight(0xffa860, 0, 8, 1.6);
  const aGlow = pool(2.4, 0xffd890, 0); aGlow.position.set(AX[0], .05, AX[1]); aGlow.material.fog = false; g.add(aGlow);
  const aHalo = spriteGlow(AX[0] + .1, .95, AX[1] + .1, 2.2, 0xffd890, 0); aHalo.material.fog = false; g.add(aHalo);
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const setLegs = (p, sw) => { p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw; };
  const place = (p, x, y, z, ry, o = {}) => { p.group.position.set(x, y + (o.hop || 0), z); p.group.rotation.set(o.lx || 0, ry, 0, 'YXZ'); p.arms[0].rotation.set(o.a0x || 0, 0, o.a0z ?? -.06); p.arms[1].rotation.set(o.a1x || 0, 0, o.a1z ?? .06); };
  const head = (vx, vz) => Math.atan2(vx, vz);
  const KB = [[60, -3.0, 1.9], [64.4, -3.0, 1.9], [66.6, -.95, .45], [90, -.95, .45]];
  const motes = makeMotes({ n: 70, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(900 + i), '#c8c4bc'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const starBoost = t => .12 + .88 * smooth(65.5, 80, t);
  const starOp = t => smooth(61.0, 66.0, t);

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos);
    sea.update(t, cp, 16); stars.update(t, starOp(t), starBoost(t), .9 + .004 * (t - 60) + .02 * Math.pow(Math.max(0, t - 78), 2) * .08, cp);
    const lanOn = smooth(63.6, 66.6, t);
    winGlow.material.opacity = (.75 + .1 * Math.sin(t * 2.1)); lanGlow.material.opacity = .6 * (.85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3)); lanGlow2.material.opacity = .55;
    // A: stands with head down (h1), lifts the head to the stars (h2), opens both hands with the lantern light on the face (h3), looks up with the friend (h4); faces east (+x) throughout
    { const bow = 1 - smooth(66.2, 67.6, t), up = smooth(66.6, 68.2, t) * .55 + smooth(79.0, 80.4, t) * .45, op = smooth(72.0, 73.6, t) * (1 - smooth(76.6, 77.8, t));
      const ex = { lx: .16 * bow - .05 * smooth(66.8, 68.0, t) - .12 * up * (1 - op) - .08 * smooth(79.0, 80.4, t), a0x: -.1 - .5 * op, a1x: -.1 - .5 * op, a0z: -.06 - .62 * op, a1z: .06 + .62 * op };
      place(A, AX[0], 0, AX[1], head(1, -.12), ex); setLegs(A, 0); }
    // B: walks over from the bench with the lantern, stands beside A, points to the sky (h2), then looks up with A (h4)
    { const pB = kp(t, KB), wB = walkAnim(t, 1.7), pt = smooth(67.6, 68.6, t) * (1 - smooth(70.6, 71.6, t)); let ry = pB.mv ? head(pB.vx, pB.vz) : head(1, -.12);
      const ex = { lx: -.1 * smooth(67.6, 68.8, t) - .08 * smooth(79.0, 80.4, t), a0x: -2.55 * pt, a0z: -.1 - .1 * pt, a1x: -1.0 + .0 * pt, a1z: .14 };
      place(B, pB.x, 0, pB.z, ry, pB.mv ? { a0x: wB.a0x, a1x: -.9 - .2 * wB.a1x, hop: wB.hop, a1z: .14 } : ex); setLegs(B, pB.mv ? wB.leg : 0);
      const on = smooth(63.4, 64.4, t); B.group.visible = t > 63.2; lanH.material.opacity = .55 * on * (.9 + .1 * Math.sin(t * 8)); lanH2.material.opacity = .5 * on; lanH.visible = lanH2.visible = on > .01;
      B.group.updateMatrixWorld(true); const lw = new THREE.Vector3(); lan.getWorldPosition(lw); lanL.position.copy(lw).add(new THREE.Vector3(0, .15, .1)); lanL.intensity = 4.2 * on * lanOn * (.9 + .1 * Math.sin(t * 8)) * (1 - .4 * smooth(66, 68, t)); }
    { const op = smooth(71.6, 73.4, t) * (1 - smooth(77.6, 79.4, t)); aGlow.material.opacity = .22 * op; aHalo.material.opacity = .2 * op; aGlow.visible = aHalo.visible = op > .01; }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t < 66; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -6 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, (.8 + .6 * smooth(72.8, 75.5, t)) * (1 - smooth(76.0, 77.6, t)), [1.5, .3, -2]);
  }
  // camera keys; the closing key frames tilt up into the stars with the eye fixed at EYE
  const FOV = 26, DYY = 330, TW = Math.tan(FOV * Math.PI / 360) * 2 * (1080 / 1920);
  const EYE = [1.1, 1.05, 3.4];
  const EKr = (t, pitch, az, D) => { const e = -pitch * Math.PI / 180, a = az * Math.PI / 180; return { t, T: [EYE[0] - D * Math.sin(a) * Math.cos(e), EYE[1] - D * Math.sin(e), EYE[2] - D * Math.cos(a) * Math.cos(e)], az, el: -pitch, w: D * TW }; };
  const cam = [
    { t: 60, T: [0, 2.0, -2.0], az: 20, el: 10, w: 24 },
    { t: 62.0, T: [AX[0] + .2, 1.0, AX[1]], az: 40, el: 6, w: 6.4 },
    { t: 63.8, T: [AX[0] + .25, 1.12, AX[1]], az: 48, el: 4, w: 4.2 },
    { t: 66.0, T: [-.3, 1.0, .6], az: 30, el: 5, w: 6.4 },
    { t: 68.4, T: [-.35, 1.1, .6], az: 44, el: 8, w: 5.2 },
    { t: 70.4, T: [-.2, 1.5, .55], az: 52, el: 4, w: 6.0 },
    { t: 72.4, T: [AX[0] + .3, 1.12, AX[1]], az: 42, el: 4, w: 3.8 },
    { t: 75.8, T: [AX[0] + .3, 1.15, AX[1]], az: 52, el: 3, w: 3.4 },
    { t: 78.4, T: [-.3, 1.0, .55], az: 38, el: 3, w: 7.0 },
    { ...EKr(80.6, 5, 30, 14), },
    { ...EKr(83.0, 38, 30, 14) },
    { ...EKr(85.0, 62, 30, 14), stop: true },
  ].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#8a82a2', '#46403e', 1.0, '#ffc890', 2.0, [-9, 5, 6], .5, '#ffcf9a', [7, 4.5, 10], 12), D(64, '#6a6a9c', '#32283a', .9, '#c8a8c0', 1.4, [-6, 6, 4], .55, '#ffcf9a', [7, 4.5, 10], 12), D(68, '#46508c', '#241f38', .9, '#9ab0f0', 1.3, [-6, 9, 8], .6, '#ffb070', [-6, 3.5, 6], 12),
    D(76, '#46508c', '#241f38', .92, '#a8b8f8', 1.3, [-6, 9, 8], .7, '#ffc080', [-3, 3.0, 6], 12), D(86, '#46508c', '#241f38', .92, '#a8b8f8', 1.3, [-6, 9, 8], .6, '#ffc080', [-3, 3.0, 6], 12)];
  const bg = [[60, ['#1c2a60', '#c88a88']], [64, ['#16204c', '#8a6a88']], [68, ['#0c1436', '#3a3a68']], [74, ['#070c28', '#222a5a']], [86, ['#050a1e', '#1a2650']]];
  return { group: g, update, light, bg, cam, pl: [lanL], fog: null, sunElev: t => lerp(9, -2, smooth(60, 70, t)) };
}
