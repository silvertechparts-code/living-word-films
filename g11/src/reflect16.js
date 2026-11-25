// Episode 16, 1:00-1:25: the terrace over the cloud sea, a grey morning. Someone sits alone on a bench with their head down while another person walks past without seeing them (h1). A beam of warm light breaks through the cloud
// and rests on the one on the bench (h2); they lift their face into it (h3); the person who passed comes back, stops, sits down beside them, and the light stays on both (h4).
// Cinematic interpretation: the bench, the passer-by, the beam of light and the person who comes back are a picture of "God sees the one nobody sees, and so can we"; they are not in Scripture and they do not depict Hagar's story.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool, shaft } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea } from './world10.js';
import { makeModern } from './reflect10.js';
import { LK } from './lights.js';

export const RT = { t0: 60, end: 85 };
const SK = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a', '#8a5a3a', '#ba8458'];
const BX = [-1.0, 1.5];                                // the bench
const SA = [-1.3, 1.5], SB = [-.3, 1.5];               // the two places on it
const SIT = -.23;                                      // group height of a seated figure (hip at the seat)
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }

export function makeReflect() {
  const R = rng(5656), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a4a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#7e7a76', '#8a867e', '#6e6a68']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    // a paved strip along the front of the bench
    gb.box('#b8ac96', [-1.0, .012, 1.5], [7.0, .02, 1.5], [0, 0, 0], .02);
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5654), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[-7.6, -5.2, 1.3, 0], [-5.4, -7.4, 1.2, 1], [-4.2, -3.8, 1.0, 2], [5.6, -7.2, 1.2, 0], [7.8, -4.6, 1.3, 1], [8.6, -.4, 1.2, 0], [-8.6, -1.0, 1.2, 1], [-9.6, 4.6, 1.1, 0], [8.0, 4.4, 1.1, 2], [6.2, -3.0, 1.0, 2], [-2.6, -9.0, 1.2, 0], [8.4, 7.4, 1.0, 1], [2.6, -5.4, 1.1, 0]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#b0a8b6', '#a6a0b2', '#b8b0bc'];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + (R() - .5) * .1, r = 70 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5655), 140, [[0, 0, 14]]); g.add(sea.mesh);
  const SEA0 = new THREE.Color('#b4b8c8'), SEA1 = new THREE.Color('#f2e0c4'), EM0 = new THREE.Color('#3a3c4c'), EM1 = new THREE.Color('#6a5a48');

  // ---- the familiar corner: a small house, the bench with a backrest, a lamp post
  const hb = new GB(R); { const hx = -5.9, hz = -.2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02);
    hb.box('#8a6642', [BX[0], .24, BX[1]], [1.6, .07, .42], [0, 0, 0], .03); hb.box('#8a6642', [BX[0], .5, BX[1] - .2], [1.6, .3, .05], [0, 0, 0], .03); for (const x of [BX[0] - .7, BX[0] + .7]) hb.box('#6a4a2c', [x, .12, BX[1]], [.09, .24, .36], [0, 0, 0], .03);
    hb.box('#4a3624', [1.7, .62, 1.3], [.09, 1.24, .09], [0, 0, 0], .03); hb.box('#3a2a1c', [1.7, 1.3, 1.3], [.2, .24, .2], [0, 0, 0], .03); hb.box('#2a1c10', [1.7, 1.46, 1.3], [.26, .05, .26], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }

  // ---- two people: the one on the bench (A) and the one who passes and comes back (B)
  const mkP = (o = {}) => { const p = makeModern(R, { skin: pk(R, SK), hat: null, sc: 1.1, ...o }); g.add(p.group); return p; };
  const A = mkP({ jacket: '#6a7fa0', jacket2: '#566a8a', trou: '#3a4258', hair: '#2a1a10', skin: '#b57a50' }), B = mkP({ jacket: '#c07a54', jacket2: '#a8643e', trou: '#4a4036', long: true, hair: '#3a2616', skin: '#d9a073' });
  // light that finds A (16:13)
  const beam = shaft(22, .5, .62, [1, .9, .64], .3, .85), beamG = shaft(22, 1.4, 1.7, [1, .84, .5], .12, .45); [beam, beamG].forEach(m => { m.material.opacity = 0; m.visible = false; m.position.set(SA[0] + .15, 0, SA[1]); g.add(m); });
  const aPool = pool(2.2, 0xffd890, 0); aPool.position.set(SA[0] + .3, .04, SA[1] + .1); g.add(aPool);
  const aGlow = spriteGlow(SA[0] + .1, .7, SA[1] + .3, 1.8, 0xffd890, 0), aGlow2 = spriteGlow(SA[0] + .1, .8, SA[1] + .3, .7, 0xfff0c8, 0); g.add(aGlow, aGlow2);
  const aL = new THREE.PointLight(0xffd090, 0, 9, 1.5);
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const setLegs = (p, sw) => { p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw; };
  const place = (p, x, y, z, ry, o = {}) => { p.group.position.set(x, y + (o.hop || 0), z); p.group.rotation.set(o.lx || 0, ry, 0, 'YXZ'); p.arms[0].rotation.set(o.a0x || 0, 0, o.a0z ?? -.06); p.arms[1].rotation.set(o.a1x || 0, 0, o.a1z ?? .06); };
  const head = (vx, vz) => Math.atan2(vx, vz);
  const KB1 = [[60, 3.6, -.6], [65.8, -5.6, -.9], [90, -5.6, -.9]];
  const KB2 = [[77.0, 3.8, 1.0], [77.9, 2.0, 1.1], [78.7, 2.0, 1.1], [80.0, SB[0] + .55, 1.1], [90, SB[0] + .55, 1.1]];
  const motes = makeMotes({ n: 70, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(900 + i), '#d8d4cc'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const lightOn = t => smooth(66.2, 68.4, t) * (1 - .25 * smooth(78, 84, t));

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos), warm = smooth(66.0, 70.0, t);
    sea.update(t, cp, 16); sea.mat.color.copy(SEA0).lerp(SEA1, warm); sea.mat.emissive.copy(EM0).lerp(EM1, warm);
    // A: sits with the head down (h1), lifts it as the light comes (h2), turns the face up into it with open hands (h3), looks at the one who sits down beside them (h4)
    { const bow = 1 - smooth(66.6, 68.6, t), up = smooth(70.6, 72.4, t) * (1 - smooth(77.6, 79.0, t)), turn = smooth(80.2, 81.6, t);
      place(A, SA[0], SIT, SA[1], head(.05, 1) + .5 * turn, { lx: .24 * bow - .14 * up, a0x: -.55 - .15 * up, a1x: -.55 - .15 * up, a0z: -.08 - .18 * up, a1z: .08 + .18 * up }); A.legs[0].rotation.x = A.legs[1].rotation.x = -1.4; }
    // B: walks past behind the bench without looking (h1), comes back, stops, looks (h4), sits beside A
    { const second = t >= 66, p = kp(t, second ? KB2 : KB1), w = walkAnim(t, 1.7), sit = smooth(80.2, 81.4, t), mv = p.mv && sit < .05;
      B.group.visible = (t > 60.0 && t < 65.9) || t > 76.9;
      const ry = p.mv ? head(p.vx, p.vz) : (second ? head(-1, .12) : head(-1, 0)), x = lerp(p.x, SB[0], sit), z = lerp(p.z, SB[1], sit);
      place(B, x, lerp(0, SIT, sit), z, lerp(ry, head(.1, 1) - .45, sit), { lx: .02 * sit, a0x: mv ? w.a0x : -.4 * sit, a1x: mv ? w.a1x : -.4 * sit, hop: mv ? w.hop : 0 });
      const lg = sit > .01 ? -1.4 * sit : (mv ? w.leg : 0); B.legs[0].rotation.x = lg; B.legs[1].rotation.x = sit > .01 ? lg : -lg; }
    // the light
    { const k = lightOn(t), fk = .93 + .07 * Math.sin(t * 2.3);
      beam.visible = beamG.visible = k > .01; beam.material.opacity = .14 * k * fk; beamG.material.opacity = .05 * k * fk; aPool.material.opacity = .22 * k; aPool.visible = k > .01; aGlow.material.opacity = .26 * k; aGlow2.material.opacity = .2 * k; aGlow.visible = aGlow2.visible = k > .01;
      aL.position.set(SA[0] + .2, 1.3, SA[1] + .5); aL.intensity = 1.8 * k; }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -6 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .5 + .5 * warm, [1.5, .3, -2]);
  }
  // camera keys; the closing keys pull back and up to show the two on the bench with the light on them
  const FOV = 26, DYY = 330;
  const cam = [
    { t: 60, T: [-.6, .9, 1.0], az: 18, el: 12, w: 20 },
    { t: 62.2, T: [SA[0] + .5, .78, SA[1]], az: 10, el: 5, w: 4.8 },
    { t: 65.6, T: [SA[0] + .2, .8, SA[1]], az: 4, el: 4, w: 4.2 },
    { t: 66.4, T: [SA[0] + .1, .8, SA[1]], az: 0, el: 3, w: 4.6 },
    { t: 69.2, T: [SA[0] + .1, 1.0, SA[1]], az: -4, el: 3, w: 5.0 },
    { t: 71.2, T: [SA[0] + .2, .96, SA[1]], az: 8, el: 3, w: 2.9 },
    { t: 75.6, T: [SA[0] + .25, .98, SA[1]], az: 12, el: 3, w: 2.7 },
    { t: 77.6, T: [-.8, .8, 1.5], az: -14, el: 5, w: 7.0 },
    { t: 81.4, T: [-.8, .72, 1.5], az: -18, el: 6, w: 5.0 },
    { t: 83.2, T: [-.8, .8, 1.5], az: -12, el: 16, w: 9.0 },
    { t: 85.0, T: [-.8, 1.2, 1.4], az: -8, el: 24, w: 14.0, stop: true },
  ].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#9aa4c0', '#5a5248', 1.0, '#d8d4dc', 1.5, [-6, 7, 8], .35, '#c8d0e8', [7, 4.5, 10], 12), D(65, '#98a2be', '#585048', 1.0, '#d4d0da', 1.5, [-6, 7, 8], .35, '#c8d0e8', [7, 4.5, 10], 12),
    D(68, '#aab2cc', '#6a5a4c', 1.0, '#ffd8a8', 2.3, [-8, 5.5, 6], .5, '#ffd8a8', [7, 4.5, 10], 12), D(78, '#aab2cc', '#6a5a4c', 1.0, '#ffd098', 2.2, [-8, 5.0, 6], .55, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#aab2cc', '#6a5a4c', 1.0, '#ffd098', 2.2, [-8, 5.0, 6], .55, '#ffcf9a', [7, 4.5, 10], 12)];
  const bg = [[60, ['#7a86a8', '#d0c0b8']], [65, ['#8a92b0', '#d4c4bc']], [68.4, ['#6a88b8', '#f4dcb4']], [76, ['#5c7eb0', '#f6d8a8']], [86, ['#5a76a8', '#f2c890']]];
  return { group: g, update, light, bg, cam, pl: [aL], fog: null, sunElev: t => lerp(20, 12, smooth(60, 80, t)) };
}
