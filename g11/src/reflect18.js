// Episode 18, 1:00-1:25: the terrace over the cloud sea at golden hour. A person opens the door of the small house and welcomes a stranger (h1, "Abraham welcomed strangers, and met the Lord"); then walks to the edge of the
// terrace and looks out at a far town whose windows are lit (h2, "he stood before God and pleaded for a city that was not even his own"); stands with hands together (h3, "standing before God for others"); and lets one small light
// go from their hands to a single window in the town (h4, "pray for someone by name"). Cinematic interpretation: the person, the stranger, the town and the light are a picture for today and are not in Scripture;
// the person is not Abraham or any biblical person.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea, mkIslet, houseBlock, meshOf, C3, rimf } from './world10.js';
import { makeModern } from './reflect10.js';
import { LK } from './lights.js';

export const RT = { t0: 60, end: 85 };
const AP0 = [-4.0, -.1], AP2 = [-1.0, -2.8], DOOR = [-4.69, -.1];                 // the doorway; the place at the edge of the terrace
export const TOWN = [-7, -1.7, -31];
const head = (vx, vz) => Math.atan2(vx, vz);

export function makeReflect() {
  const R = rng(5858), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a4a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#7e7a76', '#8a867e', '#6e6a68']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    gb.box('#b8ac96', [-2.6, .012, -.6], [6.8, .02, 4.0], [0, 0, 0], .02); gb.box('#b8ac96', [-1.4, .012, -2.4], [3.4, .02, 3.6], [0, 0, 0], .02);
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5854), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[7.6, -4.8, 1.3, 0], [8.6, -.4, 1.2, 1], [6.0, -7.6, 1.2, 2], [9.0, 4.4, 1.1, 0], [-9.4, 3.6, 1.2, 1], [-9.6, -3.4, 1.2, 0], [8.0, 7.4, 1.0, 2], [-7.6, 6.6, 1.1, 1], [5.2, -2.8, 1.0, 2], [2.9, -8.2, 1.1, 0], [3.6, 6.4, .9, 1]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#b0a8b6', '#a6a0b2', '#b8b0bc'];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + (R() - .5) * .1, r = 70 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5855), 140, [[0, 0, 14], [TOWN[0], TOWN[2], 9]]); g.add(sea.mesh);
  const SEA0 = new THREE.Color('#b4b8c8'), SEA1 = new THREE.Color('#f2e0c4'), EM0 = new THREE.Color('#3a3c4c'), EM1 = new THREE.Color('#6a5a48');

  // ---- the small house with its door (the same corner as Episodes 16 and 17); the doorway is open and lit from inside while the stranger is welcomed
  const hb = new GB(R); { const hx = -5.9, hz = -.2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02);
    hb.box('#4a3624', [1.9, .62, 3.4], [.09, 1.24, .09], [0, 0, 0], .03); hb.box('#3a2a1c', [1.9, 1.3, 3.4], [.2, .24, .2], [0, 0, 0], .03); hb.box('#2a1c10', [1.9, 1.46, 3.4], [.26, .05, .26], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const doorG = spriteGlow(DOOR[0] - .1, .55, DOOR[1] + .1, 1.4, 0xffc070, 0), doorG2 = spriteGlow(DOOR[0] - .05, .5, DOOR[1] + .1, .6, 0xfff0c8, 0); g.add(doorG, doorG2);
  const doorL = new THREE.PointLight(0xffc070, 0, 6, 1.6);

  // ---- the people: the one who welcomes, and the stranger
  const A = makeModern(R, { skin: '#b57a50', hat: null, sc: 1.1, jacket: '#6a7fa0', jacket2: '#566a8a', trou: '#3a4258', hair: '#2a1a10' }); g.add(A.group);
  const B = makeModern(rng(5859), { skin: '#d9a073', sc: 1.08, jacket: '#8a6a52', jacket2: '#74583f', trou: '#4a4a52', hair: '#3a2616', bag: '#4a5a6a', scarf: '#c8a05a' }); g.add(B.group);
  const aGlow = spriteGlow(0, 0, 0, 1.0, 0xffd890, 0), aPool = pool(1.6, 0xffd890, 0); g.add(aGlow, aPool);
  const aL = new THREE.PointLight(0xffd090, 0, 8, 1.5);

  // ---- the far town: a small floating town whose windows are lit; the light that goes from the person's hands reaches the one at LW
  const town = new THREE.Group(); town.position.set(...TOWN); g.add(town);
  const TR = 6.4, hT = (x, z) => rimf(TR, .3 + .05 * Math.sin(x * .8 + z * .6), Math.hypot(x, z), -.02), gT = (x, y, z) => { const b = C3('#cdb07a').lerp(C3('#b89a62'), .5 * smooth(-1, 1, Math.sin(x * .8 + z * .5))); if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
  town.add(mkIslet(rng(5861), TR, hT, gT, 16, 48), underRock(rng(5862), TR - .1));
  { const Rr = rng(5863); town.add(meshOf(houseBlock(Rr, -.6, -.2, 7, 6, .62, hT, 0))); }
  const WIN = []; { const Rr = rng(5864), pts = []; for (let i = 0; i < 90 && pts.length < 26; i++) { const x = (Rr() - .5) * 5.6, z = (Rr() - .5) * 4.4; if (Math.hypot(x, z) > TR - 1.6) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .5)) continue; pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hT(x, z) + .5, z, .46, 0xffb860, 0); town.add(s); WIN.push({ s, x, z, ph: i * 1.7 }); }); }
  const LW = 7;                                                                                            // the window that is named
  const wGlow = spriteGlow(WIN[LW].x, hT(WIN[LW].x, WIN[LW].z) + .6, WIN[LW].z, 3.6, 0xffe0a0, 0); town.add(wGlow);
  const townG = spriteGlow(0, .6, 0, 9, 0xff9a50, 0); town.add(townG);
  const pray = spriteGlow(0, 0, 0, 1.2, 0xfff0c0, 0), pray2 = spriteGlow(0, 0, 0, .45, 0xffffff, 0); g.add(pray, pray2);
  const trail = makeMotes({ n: 40, area: [.7, .7, .7], size: .06, v: .25, seed: 91, color: 0xffe3a0 }); g.add(trail.mesh);
  const motes = makeMotes({ n: 70, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(900 + i), '#d8d4cc'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const KB = [[60, 3.6, 1.3], [63.4, -3.15, .3], [64.4, -3.15, .3], [65.2, DOOR[0] - .2, DOOR[1]], [90, DOOR[0] - .2, DOOR[1]]];
  const KA = [[60, AP0[0], AP0[1]], [65.2, AP0[0], AP0[1]], [67.4, AP2[0], AP2[1]], [90, AP2[0], AP2[1]]];
  const kp = (t, K) => { let i = 1; while (i < K.length - 1 && t > K[i][0]) i++; const a = K[i - 1], b = K[i], u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: (Math.abs(b[1] - a[1]) + Math.abs(b[2] - a[2])) > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; };
  const PR = (t) => { const a = [AP2[0] + .1, 1.0, AP2[1] - .35], b = WIN[LW]; const wx = TOWN[0] + b.x, wy = TOWN[1] + hT(b.x, b.z) + .55, wz = TOWN[2] + b.z, u = ease.inOutSine(seg(t, 77.6, 82.4)); return [lerp(a[0], wx, u), lerp(a[1], wy, u) + 2.2 * Math.sin(Math.PI * u), lerp(a[2], wz, u)]; };

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos), warm = smooth(62.0, 68.0, t);
    sea.update(t, cp, 16); sea.mat.color.copy(SEA0).lerp(SEA1, warm); sea.mat.emissive.copy(EM0).lerp(EM1, warm);
    // the person at the door: stands (h1), opens arms to the stranger, watches the stranger go in, walks to the edge (h2), stands with the town in front (h2-h3), hands together (h3), the light leaves their hands (h4)
    { const p = kp(t, KA), mv = p.mv, w = walkAnim(t, .6), wel = ON(t, 63.2, 63.9, 64.5, 65.2), pr = smooth(71.2, 72.6, t) * (1 - smooth(76.7, 77.5, t)), op = smooth(77.0, 78.0, t) * (1 - smooth(82.6, 84.2, t)), br = Math.sin(t * 1.7) * .012;
      let ry = mv ? head(p.vx, p.vz) : head(1, .1); if (!mv && t > 67.3) ry = head(TOWN[0] - p.x + 2, TOWN[2] - p.z) * 1 + 0; if (!mv && t > 65.2 && t < 67.3) ry = head(AP2[0] - p.x, AP2[1] - p.z);
      if (!mv && t < 65.2 && t > 64.3) ry = head(DOOR[0] - p.x, DOOR[1] - p.z);
      A.group.position.set(p.x, mv ? w.hop : 0, p.z); A.group.rotation.set(.12 * pr + br + (t > 82.8 ? -.08 * smooth(82.8, 84.6, t) : 0), ry, 0, 'YXZ');
      A.arms[0].rotation.set(mv ? w.a0x : -.2 * wel - 1.15 * pr - .7 * op, 0, mv ? -.06 : -.07 - .55 * wel + .55 * pr - .45 * op); A.arms[1].rotation.set(mv ? w.a1x : -.2 * wel - 1.15 * pr - .7 * op, 0, mv ? .06 : .07 + .55 * wel - .55 * pr + .45 * op);
      A.legs[0].rotation.x = mv ? w.leg : 0; A.legs[1].rotation.x = mv ? -w.leg : 0; }
    // the stranger: walks up (h1), is welcomed, goes into the house
    { const p = kp(t, KB), mv = p.mv, w = walkAnim(t, 2.1); B.group.visible = t > 60.2 && t < 65.1;
      B.group.position.set(p.x, mv ? w.hop : 0, p.z); B.group.rotation.set(0, mv ? head(p.vx, p.vz) : head(AP0[0] - p.x, AP0[1] - p.z), 0, 'YXZ'); B.arms[0].rotation.set(mv ? w.a0x : -.05, 0, -.06); B.arms[1].rotation.set(mv ? w.a1x : -.05, 0, .06); B.legs[0].rotation.x = mv ? w.leg : 0; B.legs[1].rotation.x = mv ? -w.leg : 0; }
    // the doorway glows while the stranger is welcomed; a soft light finds the person while they stand at the edge
    { const k = ON(t, 62.6, 63.6, 64.4, 66.0), fk = .94 + .06 * Math.sin(t * 2.3); doorG.material.opacity = .34 * k * fk; doorG2.material.opacity = .22 * k; doorG.visible = doorG2.visible = k > .01; doorL.position.set(DOOR[0] + .6, .8, DOOR[1]); doorL.intensity = 2.4 * k;
      const ka = smooth(68.0, 71.0, t) * (1 - .3 * smooth(80, 84, t)), pp = kp(t, KA); aGlow.position.set(pp.x + .05, .8, pp.z - .15); aPool.position.set(pp.x, .04, pp.z); aGlow.material.opacity = .08 * ka; aPool.material.opacity = .13 * ka; aGlow.visible = aPool.visible = ka > .01; aL.position.set(pp.x + .4, 1.5, pp.z + .6); aL.intensity = .8 * ka; }
    // the town: its windows come on while the person looks, brighten while they stand (h3), and the named window flares when the light reaches it (h4)
    { const on = .35 + .45 * smooth(66.4, 70.4, t) + .2 * smooth(72, 78, t), reach = smooth(82.0, 83.4, t) * (1 - .15 * smooth(84, 85, t));
      WIN.forEach((w, i) => { const tw = .86 + .14 * Math.sin(t * 2.0 + w.ph), s = i === LW ? 1 + 1.2 * reach : 1; w.s.material.opacity = .72 * on * tw * Math.min(1.4, s); w.s.visible = true; });
      wGlow.material.opacity = .7 * reach; wGlow.visible = reach > .01; townG.material.opacity = .1 * on; }
    // the one light: it rises from the open hands (77.6) and travels to the named window (82.4)
    { const k = ON(t, 77.5, 78.1, 82.2, 83.0), q = PR(t); pray.position.set(q[0], q[1], q[2]); pray2.position.copy(pray.position); pray.material.opacity = .9 * k; pray2.material.opacity = k; pray.visible = pray2.visible = k > .01;
      trail.update(t, .9 * k, [q[0], q[1], q[2]]); }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r + 4, b.h + Math.sin(t * .5 + i), 2 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .5 + .5 * warm, [1.5, .3, -2]);
  }
  // camera keys (absolute seconds, written relative to the shot start below)
  const FOV = 26, DYY = 330;
  const cam = [
    { t: 60, T: [-3.6, .9, .6], az: 38, el: 8, w: 16 },
    { t: 62.4, T: [-3.5, .9, .1], az: 30, el: 6, w: 5.2 },
    { t: 64.4, T: [-3.6, .9, .0], az: 24, el: 5, w: 4.2 },
    { t: 66.0, T: [-2.4, .9, -1.4], az: 32, el: 6, w: 5.0 },
    { t: 68.2, T: [AP2[0] + .1, 1.0, AP2[1] - .1], az: 26, el: 5, w: 3.8 },
    { t: 70.4, T: [AP2[0] - .6, 1.4, AP2[1] - 3.0], az: 24, el: 4, w: 9.5 },
    { t: 71.6, T: [AP2[0] + .04, 1.02, AP2[1]], az: 62, el: 3, w: 2.6 },
    { t: 76.4, T: [AP2[0] + .02, 1.05, AP2[1]], az: 52, el: 4, w: 2.4 },
    { t: 78.2, T: [AP2[0] - .5, 1.5, AP2[1] - 2.2], az: 36, el: 8, w: 6.0 },
    { t: 81.0, T: [AP2[0] - 3.2, 2.0, AP2[1] - 10], az: 24, el: 8, w: 13 },
    { t: 83.4, T: [AP2[0] - 3.4, 1.8, AP2[1] - 12], az: 20, el: 10, w: 15 },
    { t: 85.0, T: [AP2[0] - 3.0, 1.6, AP2[1] - 8], az: 18, el: 16, w: 19, stop: true },
  ].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#aab2cc', '#6a5a4c', 1.0, '#ffd8a8', 2.2, [-8, 5.5, 6], .5, '#ffd8a8', [7, 4.5, 10], 12), D(70, '#aab2cc', '#6a5a4c', 1.0, '#ffd098', 2.2, [-8, 5.0, 6], .55, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#aab2cc', '#6a5a4c', 1.0, '#ffd098', 2.2, [-8, 5.0, 6], .55, '#ffcf9a', [7, 4.5, 10], 12)];
  const bg = [[60, ['#7a86a8', '#d8bca8']], [64, ['#7a8cb4', '#ecd0b0']], [68.4, ['#6a88b8', '#f4dcb4']], [76, ['#5c7eb0', '#f6d8a8']], [86, ['#5a76a8', '#f2c890']]];
  return { group: g, update, light, bg, cam, pl: [aL, doorL], fog: null, sunElev: t => lerp(20, 12, smooth(60, 80, t)) };
}
