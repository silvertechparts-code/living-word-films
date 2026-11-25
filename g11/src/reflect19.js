// Episode 19, 1:00-1:25: the terrace over the cloud sea at first light. A person stands in the doorway of a small house whose room is warm and lit behind them; they hesitate and look back (h1, "Lot hesitated, yet the angels took him by the hand");
// a soft golden light finds their hand and walks ahead of them along the path (h2, "God pulls us out before we have fully let go"); they stop, turn to look back at the lit door, and turn again to the road (h3, "remember Lot's wife, do not keep looking back
// at what God has led you out of"); and they take one step forward onto the lit path (h4, "today, take one step forward"). Cinematic interpretation: the person, the house, the road and the light are a picture for today and are not in Scripture;
// the person is not Lot or any biblical person, and the light is a picture of God's mercy (it is not shown as a person).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea } from './world10.js';
import { makeModern } from './reflect10.js';
import { LK } from './lights.js';

export const RT = { t0: 60, end: 85 };
const AP0 = [-4.1, -.1], DOOR = [-4.69, -.1];                      // the threshold; the doorway of the house (it faces east, toward the road)
export const ROAD = [[-4.1, -.1], [-2.6, -.3], [-1.4, -.5], [-.5, -.6], [1.6, -.9], [3.8, -1.2], [6.6, -1.6]];
const head = (vx, vz) => Math.atan2(vx, vz);

export function makeReflect() {
  const R = rng(5959), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a4a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(z + .5) < .9 && x > -4.8) continue; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#7e7a76', '#8a867e', '#6e6a68']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    // the road: pale slabs from the doorstep to the edge of the terrace
    for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], n = 5; for (let k = 0; k < n; k++) { const u = (k + .5) / n; gb.box(k % 2 ? '#d8ccb0' : '#cfc2a4', [lerp(ax, bx, u), .014, lerp(az, bz, u)], [Math.hypot(bx - ax, bz - az) / n * 1.02, .02, .62 + .05 * ((k + i) % 3)], [0, -Math.atan2(bz - az, bx - ax), 0], .02); } }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5954), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[7.6, -4.8, 1.3, 0], [8.6, 2.4, 1.2, 1], [6.0, -7.6, 1.2, 2], [9.0, 5.4, 1.1, 0], [-9.4, 3.6, 1.2, 1], [-9.6, -3.4, 1.2, 0], [8.0, 7.4, 1.0, 2], [-7.6, 6.6, 1.1, 1], [3.2, -4.8, 1.0, 2], [2.9, -8.2, 1.1, 0], [3.6, 6.4, .9, 1], [-2.4, 5.8, 1.0, 0]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#b0a8b6', '#a6a0b2', '#b8b0bc'];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + (R() - .5) * .1, r = 70 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5955), 140, [[0, 0, 14]]); g.add(sea.mesh);
  const SEA0 = new THREE.Color('#b4b8c8'), SEA1 = new THREE.Color('#f6dcc0'), EM0 = new THREE.Color('#3a3c4c'), EM1 = new THREE.Color('#6a5a48');

  // ---- the small house, its doorway open to the road and lit from inside: what the person is leaving
  const hb = new GB(R); { const hx = -5.9, hz = -.2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const doorM = new THREE.Mesh(new THREE.PlaneGeometry(.52, .86), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); doorM.position.set(DOOR[0] + .02, .5, DOOR[1] + .0); doorM.rotation.y = Math.PI / 2; g.add(doorM);
  const doorG = spriteGlow(DOOR[0] + .1, .55, DOOR[1], 1.8, 0xffc070, 0), doorG2 = spriteGlow(DOOR[0] + .05, .5, DOOR[1], .8, 0xfff0c8, 0); g.add(doorG, doorG2);
  const doorL = new THREE.PointLight(0xffc070, 0, 6, 1.6);

  // ---- the person, and the light of mercy
  const A = makeModern(R, { skin: '#b57a50', hat: null, sc: 1.1, jacket: '#6a7fa0', jacket2: '#566a8a', trou: '#3a4258', hair: '#2a1a10' }); g.add(A.group);
  const aPool = pool(1.3, 0xffd890, 0); g.add(aPool);
  const hand = spriteGlow(0, 0, 0, .9, 0xffd890, 0), hand2 = spriteGlow(0, 0, 0, .34, 0xfff6d8, 0); g.add(hand, hand2);
  const trail = makeMotes({ n: 40, area: [.7, .7, .7], size: .05, v: .25, seed: 91, color: 0xffe3a0 }); g.add(trail.mesh);
  const aL = new THREE.PointLight(0xffd090, 0, 8, 1.5);
  const dawn = spriteGlow(17, 1.6, -2.5, 15, 0xffc888, 0), dawn2 = spriteGlow(17, 1.3, -2.5, 6, 0xfff0d0, 0); g.add(dawn, dawn2);
  const road = ROAD.slice(2).map(([x, z], i) => { const p = pool(1.0, 0xffd890, 0); p.position.set(x + .4, .03, z); g.add(p); return p; });
  const motes = makeMotes({ n: 70, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(900 + i), '#d8d4cc'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  // where the person is (a walk east in h2, a stop, one more step in h4), and which way they face (west = toward the door, east = the road)
  const KA = [[60, AP0[0], AP0[1]], [65.4, AP0[0], AP0[1]], [69.4, -1.4, -.5], [78.0, -1.4, -.5], [79.8, -.62, -.58], [82.0, -.62, -.58], [85, 1.0, -.8], [90, 1.0, -.8]];
  const W = -Math.PI / 2, E = Math.PI / 2, KY = [[60, W], [64.4, W], [65.5, E], [71.0, E], [72.4, W], [74.2, W], [75.6, E], [90, E]];
  const kp = (t, K) => { let i = 1; while (i < K.length - 1 && t > K[i][0]) i++; const a = K[i - 1], b = K[i], u = clamp((t - a[0]) / (b[0] - a[0])); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: (Math.abs(b[1] - a[1]) + Math.abs(b[2] - a[2])) > .01 && t > a[0] && t < b[0] }; };
  const ky = t => { let i = 1; while (i < KY.length - 1 && t > KY[i][0]) i++; const a = KY[i - 1], b = KY[i], u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))); return lerp(a[1], b[1], u); };

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos), warm = smooth(62.0, 76.0, t);
    sea.update(t, cp, 16); sea.mat.color.copy(SEA0).lerp(SEA1, warm); sea.mat.emissive.copy(EM0).lerp(EM1, warm);
    const p = kp(t, KA), mv = p.mv, w = walkAnim(t, .6), br = Math.sin(t * 1.7) * .012, hes = ON(t, 61.0, 62.2, 64.2, 64.9) + ON(t, 72.6, 73.2, 74.0, 74.5), step = ON(t, 78.0, 78.4, 79.6, 80.0);
    { A.group.position.set(p.x, mv ? w.hop : 0, p.z); A.group.rotation.set(-.07 * hes + br + .04 * step, ky(t), 0, 'YXZ');
      const hold = smooth(60, 61, t) * (1 - smooth(64.4, 65.2, t));
      A.arms[0].rotation.set(mv ? w.a0x : -.1 * hold, 0, mv ? -.06 : -.07 - .2 * hold + .1 * ON(t, 62.2, 63, 64, 65)); A.arms[1].rotation.set(mv ? w.a1x : 0, 0, mv ? .06 : .07);
      A.legs[0].rotation.x = mv ? w.leg : .0; A.legs[1].rotation.x = mv ? -w.leg : 0; }
    // the doorway glows through the whole reflection, a little softer once the person has turned to the road
    { const k = smooth(60.0, 61.0, t) * (1 - .35 * smooth(75, 82, t)), fk = .94 + .06 * Math.sin(t * 2.3); doorM.material.opacity = .85 * k * fk; doorG.material.opacity = .4 * k * fk; doorG2.material.opacity = .24 * k; doorL.position.set(DOOR[0] + .7, .8, DOOR[1]); doorL.intensity = 2.4 * k;
      const ka = smooth(62, 70, t); aPool.position.set(p.x, .04, p.z); aPool.material.opacity = .12 * ka; aL.position.set(p.x + .5, 1.5, p.z + .7); aL.intensity = .9 * ka; }
    // the light: it finds the person's hand (h1), goes ahead along the road (h2), waits ahead while they stop (h3), and brightens the next stone (h4)
    { const k = ON(t, 62.0, 63.2, 83.5, 85.0), lead = smooth(65.2, 66.2, t), ahead = lerp(.0, .75, lead) + .35 * Math.sin(t * .8) * 0, hx = p.x + (ky(t) > 0 ? 1 : -1) * .18 + ahead * (ky(t) > 0 ? 1 : 0), hy = .62 + .12 * lead + .04 * Math.sin(t * 2.2), hz = p.z + .22;
      hand.position.set(hx, hy, hz); hand2.position.copy(hand.position); hand.material.opacity = .5 * k; hand2.material.opacity = .9 * k; hand.visible = hand2.visible = k > .01; trail.update(t, .8 * k, [hx, hy, hz]);
      road.forEach((rp, i) => { rp.material.opacity = .22 * smooth(74 + i * .6, 78 + i * .6, t) * (1 + .3 * step); rp.visible = rp.material.opacity > .004; }); }
    // first light: the sunrise glow beyond the edge of the terrace grows
    { const s = smooth(62, 84, t); dawn.material.opacity = .22 * s; dawn2.material.opacity = .34 * s; }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r + 4, b.h + Math.sin(t * .5 + i), 2 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w2, k) => w2.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .5 + .5 * warm, [1.5, .3, -2]);
  }
  const FOV = 26, DYY = 330;
  const cam = [
    { t: 60, T: [-3.0, .9, .4], az: 62, el: 7, w: 8.5 },
    { t: 62.4, T: [-3.7, 1.0, -.1], az: 74, el: 5, w: 3.2 },
    { t: 64.4, T: [-3.6, 1.0, -.2], az: 44, el: 4, w: 2.8 },
    { t: 66.6, T: [-2.8, .95, -.4], az: 16, el: 4, w: 3.6 },
    { t: 69.4, T: [-1.4, .95, -.5], az: 20, el: 5, w: 3.2 },
    { t: 71.0, T: [-1.4, 1.04, -.5], az: 12, el: 3, w: 2.0 },
    { t: 74.0, T: [-1.4, 1.04, -.5], az: 8, el: 3, w: 2.1 },
    { t: 76.0, T: [-1.4, 1.06, -.5], az: -76, el: 11, w: 3.2 },
    { t: 78.0, T: [-1.35, .3, -.5], az: 28, el: 3, w: 1.5 },
    { t: 79.8, T: [-.7, .75, -.58], az: 24, el: 5, w: 2.6 },
    { t: 82.0, T: [.4, 1.0, -.7], az: -34, el: 12, w: 8.5 },
    { t: 85.0, T: [1.2, 1.2, -.8], az: -24, el: 18, w: 15, stop: true },
  ].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#aab2cc', '#6a5a4c', 1.0, '#ffd8a8', 2.2, [8, 4.5, 3], .5, '#ffd8a8', [-7, 4.5, 8], 12), D(72, '#b4b6cc', '#6a5a4c', 1.0, '#ffd098', 2.4, [8, 4.0, 2], .55, '#ffcf9a', [-7, 4.5, 8], 12), D(86, '#c0b8c8', '#6a5a4c', 1.0, '#ffd098', 2.6, [8, 4.2, 2], .55, '#ffcf9a', [-7, 4.5, 8], 12)];
  const bg = [[60, ['#7a86a8', '#d8bca8']], [64, ['#7a8cb4', '#ecd0b0']], [68.4, ['#6a88b8', '#f4dcb4']], [76, ['#5c7eb0', '#f6d8a8']], [86, ['#5a76a8', '#f2c890']]];
  return { group: g, update, light, bg, cam, pl: [aL, doorL], fog: null, sunElev: t => lerp(14, 20, smooth(60, 80, t)) };
}
