// Episode 24, 1:00-1:25: the terrace over the cloud sea at first light. A person stands on the threshold of a small house whose doorway is warm and lit behind them, hands folded, head bowed (h1, "The servant asked God for a sign, and watched for kindness");
// they look up and watch the road; a tired traveller comes slowly along it, and the person takes a jar of water from a flat stone and goes out to meet them (h2, "Rebekah offered water to a stranger, and to all his camels"); the traveller drinks and the two walk back toward the lit door together
// (h3, "God often leads us through ordinary kindness, and hears us before we finish asking"); at the threshold the person sets the jar down and folds their hands again while the traveller stands beside them in the morning light (h4, "Today, pray for guidance, and be kind where you are").
// Cinematic interpretation: the two people, the house, the road, the jar and the stone are a picture for today and are not in Scripture; neither is a biblical person. The terrace, house and road are the series' reflection set, re-timed for this episode.
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
export function makeReflect() {
  const R = rng(5959), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a4a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(z + .5) < .9 && x > -4.8) continue; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#7e7a76', '#8a867e', '#6e6a68']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], n = 5; for (let k = 0; k < n; k++) { const u = (k + .5) / n; gb.box(k % 2 ? '#d8ccb0' : '#cfc2a4', [lerp(ax, bx, u), .014, lerp(az, bz, u)], [Math.hypot(bx - ax, bz - az) / n * 1.02, .02, .62 + .05 * ((k + i) % 3)], [0, -Math.atan2(bz - az, bx - ax), 0], .02); } }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5954), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[7.6, -4.8, 1.3, 0], [8.6, 2.4, 1.2, 1], [6.0, -7.6, 1.2, 2], [9.0, 5.4, 1.1, 0], [-9.4, 3.6, 1.2, 1], [-9.6, -3.4, 1.2, 0], [8.0, 7.4, 1.0, 2], [-7.6, 6.6, 1.1, 1], [3.2, -4.8, 1.0, 2], [2.9, -8.2, 1.1, 0], [3.6, 6.4, .9, 1], [-2.4, 5.8, 1.0, 0]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#b0a8b6', '#a6a0b2', '#b8b0bc'];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + (R() - .5) * .1, r = 70 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5955), 140, [[0, 0, 14]]); g.add(sea.mesh);
  const SEA0 = new THREE.Color('#b4b8c8'), SEA1 = new THREE.Color('#f6dcc0'), EM0 = new THREE.Color('#3a3c4c'), EM1 = new THREE.Color('#6a5a48');

  // ---- the small house, its doorway open to the road and lit from inside: what the person is stepping out of
  const hb = new GB(R); { const hx = -5.9, hz = -.2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const doorM = new THREE.Mesh(new THREE.PlaneGeometry(.52, .86), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); doorM.position.set(DOOR[0] + .02, .5, DOOR[1] + .0); doorM.rotation.y = Math.PI / 2; g.add(doorM);
  const doorG = spriteGlow(DOOR[0] + .1, .55, DOOR[1], 1.8, 0xffc070, 0), doorG2 = spriteGlow(DOOR[0] + .05, .5, DOOR[1], .8, 0xfff0c8, 0); g.add(doorG, doorG2);
  const doorL = new THREE.PointLight(0xffc070, 0, 6, 1.6);

  // ---- the two people, the jar of water and the flat stone it stands on
  const A = makeModern(R, { skin: '#b57a50', hat: null, sc: 1.1, jacket: '#6a7fa0', jacket2: '#566a8a', trou: '#3a4258', hair: '#2a1a10' }); g.add(A.group);
  const B = makeModern(R, { skin: '#9c6a42', hat: '#c9a15a', sc: 1.1, jacket: '#a8683a', jacket2: '#8a5430', trou: '#4a4036', hair: '#1f160d', bag: '#6a5a3a' }); g.add(B.group);
  const aPool = pool(1.3, 0xffd890, 0); g.add(aPool);
  const STONE = [-3.55, .5];
  { const b = new GB(rng(5962)); b.box('#a89c88', [STONE[0], .05, STONE[1]], [.5, .1, .36], [0, .2, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const jarM = new THREE.Mesh((() => { const b = new GB(rng(5961)); b.add(G.ico1, '#b8703a', [0, .06, 0], [.06, .072, .06], [0, 0, 0], .01); b.add(G.cylT, '#a8602e', [0, .125, 0], [.028, .044, .028], [0, 0, 0], .01); b.add(G.cylT, '#c8803e', [0, .163, 0], [.04, .01, .04], [0, 0, 0], .004); return b.build(); })(), lam); jarM.castShadow = true; g.add(jarM);
  const hand = spriteGlow(0, 0, 0, .8, 0xffd890, 0), hand2 = spriteGlow(0, 0, 0, .3, 0xfff6d8, 0); g.add(hand, hand2);
  const trail = makeMotes({ n: 30, area: [.6, .6, .6], size: .04, v: .2, seed: 91, color: 0xffe3a0 }); g.add(trail.mesh);
  const aL = new THREE.PointLight(0xffd090, 0, 8, 1.5);
  const dawn = spriteGlow(17, 1.6, -2.5, 15, 0xffc888, 0), dawn2 = spriteGlow(17, 1.3, -2.5, 6, 0xfff0d0, 0); g.add(dawn, dawn2);
  const road = ROAD.slice(1).map(([x, z], i) => { const p = pool(1.0, 0xffd890, 0); p.position.set(x + .2, .03, z); g.add(p); return p; });
  const motes = makeMotes({ n: 70, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(900 + i), '#d8d4cc'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 4.8 + ph); return { hop: Math.abs(w) * .016, leg: .42 * w }; };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const kp = (t, K) => { if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], mv: false }; let i = 1; while (i < K.length - 1 && t > K[i][0]) i++; const a = K[i - 1], b = K[i]; if (t >= K[K.length - 1][0]) return { x: b[1], z: b[2], mv: false }; const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: (Math.abs(b[1] - a[1]) + Math.abs(b[2] - a[2])) > .01 && t > a[0] && t < b[0] }; };
  const ky = (t, KY) => { if (t <= KY[0][0]) return KY[0][1]; let i = 1; while (i < KY.length - 1 && t > KY[i][0]) i++; const a = KY[i - 1], b = KY[i]; if (t >= KY[KY.length - 1][0]) return b[1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
  // where they are: A on the threshold through h1, out along the road to the traveller (h2), back toward the door with them (h3), at the threshold again (h4); B comes slowly along the road from the east
  const M = [-1.5, -.5], AT = [-3.3, -.18], BT = [-2.75, -.72];
  const KA = [[60, AP0[0], AP0[1]], [66.4, AP0[0], AP0[1]], [69.4, M[0] - .3, M[1] - .04], [72.6, M[0] - .3, M[1] - .04], [77.3, AT[0], AT[1]], [90, AT[0], AT[1]]];
  const KB = [[60, 8.4, -1.9], [62.6, 7.2, -1.7], [69.6, M[0] + .5, M[1] + .04], [72.6, M[0] + .5, M[1] + .04], [77.5, BT[0], BT[1]], [90, BT[0], BT[1]]];
  const E = Math.PI / 2, W = -Math.PI / 2, KYA = [[60, E], [72.4, E], [73.8, W], [77.0, W], [78.6, E], [90, E]], KYB = [[60, W], [77.6, W], [79.0, E], [90, E]];

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos), warm = smooth(62.0, 76.0, t);
    sea.update(t, cp, 16); sea.mat.color.copy(SEA0).lerp(SEA1, warm); sea.mat.emissive.copy(EM0).lerp(EM1, warm);
    const pa = kp(t, KA), pb = kp(t, KB), wa = walkAnim(t, .6), wb = walkAnim(t, 2.1), br = Math.sin(t * 1.7) * .012;
    // A: head bowed with the hands folded (h1), the head lifted to watch the road (h1, from 64.2), out to the traveller with the jar held before them (h2), the jar offered, back toward the door (h3), the jar set on the stone and the hands folded again (h4)
    const bowA = .24 * smooth(60, 61.2, t) * (1 - smooth(63.6, 64.8, t)) + .2 * ON(t, 79.6, 80.4, 82.8, 83.8), jar = ON(t, 66.0, 66.9, 77.4, 78.1);
    { A.group.position.set(pa.x, pa.mv ? wa.hop : 0, pa.z); A.group.rotation.set(bowA + br, ky(t, KYA), 0, 'YXZ');
      const fold = Math.max(smooth(60, 60.8, t) * (1 - smooth(65.0, 65.8, t)), smooth(78.4, 79.2, t)), hold = jar, fw = lerp(-.5, -.95, Math.max(fold, hold * (1 - ON(t, 69.8, 70.2, 71.4, 71.8))));
      A.arms[0].rotation.set(fw, 0, .1 + .22 * Math.max(fold, hold)); A.arms[1].rotation.set(fw, 0, -.1 - .22 * Math.max(fold, hold));
      A.legs[0].rotation.x = pa.mv ? wa.leg : 0; A.legs[1].rotation.x = pa.mv ? -wa.leg : 0; }
    // B: walks slowly along the road, lifts the jar to drink (h2), walks back with A, stands beside them at the threshold
    { const drink = ON(t, 70.3, 70.9, 71.7, 72.3); B.group.position.set(pb.x, pb.mv ? wb.hop : 0, pb.z); B.group.rotation.set(.04 - .22 * drink + br, ky(t, KYB), 0, 'YXZ');
      B.arms[0].rotation.set(-.5 - 1.0 * ON(t, 69.8, 70.3, 71.9, 72.5), 0, .1); B.arms[1].rotation.set(-.5 - 1.0 * ON(t, 69.8, 70.3, 71.9, 72.5), 0, -.1);
      B.legs[0].rotation.x = pb.mv ? wb.leg : 0; B.legs[1].rotation.x = pb.mv ? -wb.leg : 0; }
    // the doorway glows through the whole reflection, a little softer once they have walked away from it
    { const k = smooth(60.0, 61.0, t) * (1 - .4 * smooth(66, 72, t) * (1 - smooth(75, 78, t))), fk = .94 + .06 * Math.sin(t * 2.3); doorM.material.opacity = .85 * k * fk; doorG.material.opacity = .4 * k * fk; doorG2.material.opacity = .24 * k; doorL.position.set(DOOR[0] + .7, .8, DOOR[1]); doorL.intensity = 2.4 * k;
      const ka = smooth(62, 70, t); aPool.position.set(pa.x, .04, pa.z); aPool.material.opacity = .12 * ka; aL.position.set(pa.x + .5, 1.5, pa.z + .7); aL.intensity = .9 * ka; }
    // the jar: on the stone until A takes it (66.0-66.9), carried before A, passed to B to drink (70.0-72.0), carried back, set down on the stone (77.2-78.1)
    { const fa = A.group.rotation.y, ofB = smooth(69.9, 70.4, t) * (1 - smooth(71.8, 72.3, t)), fb = B.group.rotation.y, drinkUp = ON(t, 70.4, 70.9, 71.6, 72.1), b = smooth(66.0, 66.9, t) * (1 - smooth(77.2, 78.1, t));
      const ax = pa.x + Math.sin(fa) * .3, az2 = pa.z + Math.cos(fa) * .3, bx = pb.x + Math.sin(fb) * .24, bz = pb.z + Math.cos(fb) * .24;
      const cx = lerp(ax, bx, ofB), cz = lerp(az2, bz, ofB), cy = lerp(.74, lerp(.74, 1.02, drinkUp), ofB);
      jarM.position.set(lerp(STONE[0], cx, b), lerp(.1, cy, b), lerp(STONE[1], cz, b)); jarM.rotation.set(-.35 * drinkUp * ofB, ofB > .5 ? fb : fa, 0, 'YXZ');
      const fl = .9 + .1 * Math.sin(t * 8.6) * Math.sin(t * 5.1), kg = ON(t, 69.8, 70.6, 71.8, 72.6);
      hand.position.set(jarM.position.x, jarM.position.y + .18, jarM.position.z); hand2.position.copy(hand.position); hand.material.opacity = .26 * kg * fl; hand2.material.opacity = .5 * kg * fl; trail.update(t, .5 * kg, [jarM.position.x, jarM.position.y + .15, jarM.position.z]);
      road.forEach((rp, i) => { rp.material.opacity = .14 * smooth(72 + i * .5, 76 + i * .5, t); rp.visible = rp.material.opacity > .004; }); }
    { const s = smooth(62, 84, t); dawn.material.opacity = .22 * s; dawn2.material.opacity = .34 * s; }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r + 4, b.h + Math.sin(t * .5 + i), 2 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w2, k) => w2.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .5 + .5 * warm, [1.5, .3, -2]);
  }
  const FOV = 26, DYY = 330;
  const cam = [
    { t: 60, T: [-3.0, .9, .4], az: 62, el: 7, w: 8.5 },
    { t: 62.6, T: [-3.9, 1.0, -.1], az: 72, el: 5, w: 3.0 },
    { t: 65.4, T: [-3.9, .95, -.1], az: 46, el: 4, w: 2.6 },
    { t: 67.6, T: [-3.2, .8, -.25], az: 56, el: 5, w: 3.8 },
    { t: 69.6, T: [-1.9, .75, -.45], az: 40, el: 5, w: 4.0 },
    { t: 71.0, T: [-1.45, .7, -.5], az: 20, el: 3, w: 2.3 },
    { t: 72.6, T: [-1.45, .8, -.5], az: 8, el: 6, w: 3.0 },
    { t: 74.6, T: [-2.4, .85, -.35], az: 34, el: 5, w: 4.2 },
    { t: 77.4, T: [-3.2, .9, -.2], az: 52, el: 4, w: 3.4 },
    { t: 79.6, T: [-3.3, .9, -.12], az: 62, el: 6, w: 2.7 },
    { t: 81.4, T: [-3.2, .9, -.12], az: 48, el: 8, w: 3.0 },
    { t: 82.8, T: [-2.4, 1.2, -.4], az: 26, el: 14, w: 8.0 },
    { t: 85.0, T: [1.4, 1.2, -.8], az: -24, el: 18, w: 15, stop: true },
  ].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#aab2cc', '#6a5a4c', 1.0, '#ffd8a8', 2.2, [8, 4.5, 3], .5, '#ffd8a8', [-7, 4.5, 8], 12), D(72, '#b4b6cc', '#6a5a4c', 1.0, '#ffd098', 2.4, [8, 4.0, 2], .55, '#ffcf9a', [-7, 4.5, 8], 12), D(86, '#c0b8c8', '#6a5a4c', 1.0, '#ffd098', 2.6, [8, 4.2, 2], .55, '#ffcf9a', [-7, 4.5, 8], 12)];
  const bg = [[60, ['#7a86a8', '#d8bca8']], [64, ['#7a8cb4', '#ecd0b0']], [68.4, ['#6a88b8', '#f4dcb4']], [76, ['#5c7eb0', '#f6d8a8']], [86, ['#5a76a8', '#f2c890']]];
  return { group: g, update, light, bg, cam, pl: [aL, doorL], fog: null, sunElev: t => lerp(14, 20, smooth(60, 80, t)) };
}
