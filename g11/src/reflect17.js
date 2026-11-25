// Episode 17, 1:00-1:25: the terrace over the cloud sea, a grey morning. A person stands alone with their head down (h1). A warm light finds them and the same pattern of gold stars that was written for Abraham begins to
// glow on the ground round their feet (h2); they lift their face and open their hands (h3); they look up, step forward, and the pattern spreads wide and lights fill the air (h4).
// Cinematic interpretation: the person, the light and the pattern are a picture of "believe what God says about you, over what you say about yourself"; they are not in Scripture and they do not depict Abraham's story.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool, shaft } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea } from './world10.js';
import { makeModern } from './reflect10.js';
import { LK } from './lights.js';
import { makePattern } from './pattern17.js';

export const RT = { t0: 60, end: 85 };
const SK = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a', '#8a5a3a', '#ba8458'];
const AP = [-.8, 1.6];                                 // where the person stands
const head = (vx, vz) => Math.atan2(vx, vz);

export function makeReflect() {
  const R = rng(5757), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a4a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#7e7a76', '#8a867e', '#6e6a68']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    // a paved area under the person's feet
    gb.box('#b8ac96', [AP[0], .012, AP[1]], [6.4, .02, 5.2], [0, 0, 0], .02);
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5754), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[-7.6, -5.2, 1.3, 0], [-5.4, -7.4, 1.2, 1], [-4.2, -3.8, 1.0, 2], [5.6, -7.2, 1.2, 0], [7.8, -4.6, 1.3, 1], [8.6, -.4, 1.2, 0], [-8.6, -1.0, 1.2, 1], [-9.6, 4.6, 1.1, 0], [8.0, 4.4, 1.1, 2], [6.2, -3.0, 1.0, 2], [-4.6, -9.0, 1.2, 0], [8.4, 7.4, 1.0, 1], [2.6, -5.4, 1.1, 0]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#b0a8b6', '#a6a0b2', '#b8b0bc'];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + (R() - .5) * .1, r = 70 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5755), 140, [[0, 0, 14]]); g.add(sea.mesh);
  const SEA0 = new THREE.Color('#b4b8c8'), SEA1 = new THREE.Color('#f2e0c4'), EM0 = new THREE.Color('#3a3c4c'), EM1 = new THREE.Color('#6a5a48');

  // ---- the familiar corner: the small house and a lamp post (same as Episode 16)
  const hb = new GB(R); { const hx = -5.9, hz = -.2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02);
    hb.box('#4a3624', [1.9, .62, 1.0], [.09, 1.24, .09], [0, 0, 0], .03); hb.box('#3a2a1c', [1.9, 1.3, 1.0], [.2, .24, .2], [0, 0, 0], .03); hb.box('#2a1c10', [1.9, 1.46, 1.0], [.26, .05, .26], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }

  // ---- the person
  const A = makeModern(R, { skin: '#b57a50', hat: null, sc: 1.1, jacket: '#6a7fa0', jacket2: '#566a8a', trou: '#3a4258', hair: '#2a1a10' }); g.add(A.group);
  // the light that finds them, and the pattern at their feet
  const beam = shaft(22, .5, .62, [1, .9, .64], .3, .85), beamG = shaft(22, 1.4, 1.7, [1, .84, .5], .12, .45); [beam, beamG].forEach(m => { m.material.opacity = 0; m.visible = false; m.position.set(AP[0], 0, AP[1]); g.add(m); });
  const aPool = pool(2.2, 0xffd890, 0); aPool.position.set(AP[0], .04, AP[1]); g.add(aPool);
  const aGlow = spriteGlow(AP[0], .45, AP[1] - .1, 1.8, 0xffd890, 0), aGlow2 = spriteGlow(AP[0], .4, AP[1] - .1, .7, 0xfff0c8, 0); g.add(aGlow, aGlow2);
  const aL = new THREE.PointLight(0xffd090, 0, 9, 1.5);
  const pat = makePattern(3.4); pat.position.set(AP[0], .046, AP[1]); g.add(pat);
  const many = makeMotes({ n: 150, area: [9, 6, 8], size: .06, v: .3, seed: 83, color: 0xffe3a0 }); g.add(many.mesh);
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const motes = makeMotes({ n: 70, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(900 + i), '#d8d4cc'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const lightOn = t => smooth(66.2, 68.4, t) * (1 - .2 * smooth(78, 84, t));

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos), warm = smooth(66.0, 70.0, t);
    sea.update(t, cp, 16); sea.mat.color.copy(SEA0).lerp(SEA1, warm); sea.mat.emissive.copy(EM0).lerp(EM1, warm);
    // the person: head down and shoulders heavy (h1); the head begins to lift as the light comes (h2); chin up, hands open (h3); steps forward and looks ahead (h4)
    { const bow = 1 - smooth(66.8, 70.0, t), up = smooth(71.0, 72.6, t), walk = Math.min(1, Math.max(0, seg(t, 77.4, 79.6))), mv = t > 77.4 && t < 79.7, w = walkAnim(t, .6), br = Math.sin(t * 1.7) * .012;
      const z = AP[1] + .55 * ease.inOutSine(walk), open = up * (1 - smooth(76.6, 77.6, t) * .6);
      A.group.position.set(AP[0], mv ? w.hop : 0, z); A.group.rotation.set(.28 * bow - .1 * up + br + (t > 80 ? -.05 * smooth(80, 82, t) : 0), head(.1, 1) + .1 * smooth(80, 82.5, t), 0, 'YXZ');
      A.arms[0].rotation.set(mv ? w.a0x : -.14 * bow - .3 * open, 0, -.07 - .2 * open); A.arms[1].rotation.set(mv ? w.a1x : -.14 * bow - .3 * open, 0, .07 + .2 * open);
      A.legs[0].rotation.x = mv ? w.leg : 0; A.legs[1].rotation.x = mv ? -w.leg : 0; }
    // the light and the pattern
    { const k = lightOn(t), fk = .93 + .07 * Math.sin(t * 2.3);
      beam.visible = beamG.visible = k > .01; beam.material.opacity = .14 * k * fk; beamG.material.opacity = .05 * k * fk; aPool.material.opacity = .2 * k; aPool.visible = k > .01; aGlow.material.opacity = .1 * k; aGlow2.material.opacity = .04 * k; aGlow.visible = aGlow2.visible = k > .01;
      aL.position.set(AP[0] + .2, 1.5, AP[1] + .6); aL.intensity = .9 * k;
      const rev = 1.1 * ease.outCubic(seg(t, 66.6, 72.0)), op = .95 * smooth(66.4, 68.4, t) * (1 + .35 * smooth(71, 72.4, t) * (1 - smooth(76, 78, t)) + .25 * smooth(78, 82, t));
      pat.position.z = AP[1] + .55 * ease.inOutSine(seg(t, 77.4, 79.6)); pat.userData.set(rev, op * (.9 + .1 * Math.sin(t * 2.0)));
      many.update(t, .85 * smooth(73.0, 76.5, t), [AP[0], .2, AP[1] - 1.5]); }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -6 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .5 + .5 * warm, [1.5, .3, -2]);
  }
  // camera keys: wide at the start, in on the person (h1), in tighter on the face as the head lifts (h3), then back and up to the whole terrace with the pattern on it (h4)
  const FOV = 26, DYY = 330;
  const cam = [
    { t: 60, T: [-.6, .9, 1.2], az: 18, el: 12, w: 20 },
    { t: 62.2, T: [AP[0] + .1, .78, AP[1]], az: 12, el: 5, w: 2.6 },
    { t: 65.6, T: [AP[0] + .1, .8, AP[1]], az: 8, el: 4, w: 2.2 },
    { t: 66.8, T: [AP[0], .82, AP[1]], az: 0, el: 3, w: 2.4 },
    { t: 69.6, T: [AP[0], .9, AP[1]], az: -6, el: 8, w: 4.0 },
    { t: 71.2, T: [AP[0] + .02, .98, AP[1]], az: 6, el: 3, w: 2.3 },
    { t: 75.4, T: [AP[0] + .04, 1.0, AP[1]], az: 10, el: 3, w: 2.0 },
    { t: 77.4, T: [AP[0], .9, AP[1] + .1], az: -10, el: 6, w: 3.4 },
    { t: 81.4, T: [AP[0], .8, AP[1] + .5], az: -16, el: 9, w: 3.6 },
    { t: 83.2, T: [AP[0], .8, AP[1] + .5], az: -12, el: 20, w: 8.0 },
    { t: 85.0, T: [AP[0], 1.0, AP[1] + .3], az: -8, el: 28, w: 14.0, stop: true },
  ].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#9aa4c0', '#5a5248', 1.0, '#d8d4dc', 1.5, [-6, 7, 8], .35, '#c8d0e8', [7, 4.5, 10], 12), D(65, '#98a2be', '#585048', 1.0, '#d4d0da', 1.5, [-6, 7, 8], .35, '#c8d0e8', [7, 4.5, 10], 12),
    D(68, '#aab2cc', '#6a5a4c', 1.0, '#ffd8a8', 2.3, [-8, 5.5, 6], .5, '#ffd8a8', [7, 4.5, 10], 12), D(78, '#aab2cc', '#6a5a4c', 1.0, '#ffd098', 2.2, [-8, 5.0, 6], .55, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#aab2cc', '#6a5a4c', 1.0, '#ffd098', 2.2, [-8, 5.0, 6], .55, '#ffcf9a', [7, 4.5, 10], 12)];
  const bg = [[60, ['#7a86a8', '#d0c0b8']], [65, ['#8a92b0', '#d4c4bc']], [68.4, ['#6a88b8', '#f4dcb4']], [76, ['#5c7eb0', '#f6d8a8']], [86, ['#5a76a8', '#f2c890']]];
  return { group: g, update, light, bg, cam, pl: [aL], fog: null, sunElev: t => lerp(20, 12, smooth(60, 80, t)) };
}
