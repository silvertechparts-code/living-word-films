// Episode 7, 1:00-1:15: a present-day person stands where the pier runs into fog and the lamps light only a few steps ahead. Behind them, someone sits alone on a bench.
// The walker cannot see what lies ahead, and chooses kindness: turns back and shares the lantern.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, person, spriteGlow } from './kit.js';
import { pk, roundTreeGeo, pineGeo, makeMotes } from './props.js';
import { makeWalker } from './choice.js';
import { makeWater } from './flood.js';
import { LK } from './lights.js';

export const TT = { t0: 60, end: 83 };
const HAZE = '#5c5478', gyh = .32, BX = -1.95, BZ = 2.4;

export function makeTrust() {
  const R = rng(4242), g = new THREE.Group();
  const water = makeWater(true); water.U.uHaze.value.set(HAZE); water.U.uDeep.value.set('#1a2846'); water.U.uShallow.value.set('#34607a'); water.U.uSky.value.set('#8a6a88'); water.U.uSpec.value = .3; water.U.uFogA.value = 30; water.U.uFogB.value = 60; g.add(water.mesh);
  // the headland with its rocks, the pier, the posts and the lamps
  const gb = new GB(R);
  gb.add(new THREE.CylinderGeometry(3.3, 4.3, 1.1, 12, 1).translate(0, -.22, 3.5), '#56684a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
  gb.add(new THREE.CylinderGeometry(3.6, 3.7, .2, 12, 1).translate(0, -.78, 3.5), '#5a4a3a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
  for (let k = 0; k < 16; k++) { const a = R() * 6.28, r = 3.1 + R() * 1.3, x = Math.cos(a) * r, z = 3.5 + Math.sin(a) * r; gb.add(G.ico0, pk(R, ['#6e6a66', '#7a766e', '#5e5a58']), [x, -.15 + R() * .2, z], [.3 + R() * .35, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
  for (let k = 0; k < 34; k++) { const z = 1.2 - k * .47; gb.box(pk(R, ['#9a7a52', '#8a6c46', '#a88660', '#7e6240']), [0, gyh - .03, z], [1.5, .06, .44], [0, 0, 0], .08); }
  for (let k = 0; k < 11; k++) for (const s of [-1, 1]) gb.box('#4a3624', [s * .66, -.25, 1.0 - k * 1.5], [.12, 1.1, .12], [0, 0, 0], .05);
  const LAMPS = []; for (let k = 0; k < 8; k++) { const z = -.6 - k * 1.9, x = (k % 2 ? 1 : -1) * .74; gb.box('#2e2e3a', [x, gyh + .5, z], [.05, 1.0, .05], [0, 0, 0], .03); gb.box('#2e2e3a', [x, gyh + 1.03, z], [.15, .05, .15], [0, 0, 0], .03); LAMPS.push([x, gyh + .93, z]); }
  // bench and a street lamp for the stranger
  gb.box('#6a4a2c', [BX, gyh + .26, BZ], [.42, .06, 1.15], [0, 0, 0], .05); gb.box('#6a4a2c', [BX - .2, gyh + .5, BZ], [.05, .42, 1.15], [0, 0, 0], .05);
  for (const dz of [-.5, .5]) gb.box('#3a3a44', [BX, gyh + .13, BZ + dz], [.38, .26, .06], [0, 0, 0], .03);
  gb.box('#2e2e3a', [-2.7, gyh + .65, 3.1], [.06, 1.3, .06], [0, 0, 0], .03); gb.box('#2e2e3a', [-2.7, gyh + 1.33, 3.1], [.2, .06, .2], [0, 0, 0], .03);
  const headM = new THREE.Mesh(gb.build(), lam); headM.castShadow = true; headM.receiveShadow = true; g.add(headM);
  const lampG = new GB(R); lampG.box('#ffd49a', [-2.7, gyh + 1.2, 3.1], [.14, .2, .14], [0, 0, 0], 0); for (const [x, y, z] of LAMPS) lampG.box('#ffd49a', [x, y, z], [.1, .14, .1], [0, 0, 0], 0);
  g.add(new THREE.Mesh(lampG.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })));
  [[2.6, 5.4, 1.2], [-1.2, 6.3, 1.0], [3.0, 3.4, .9]].forEach(([x, z, s]) => { const m = new THREE.Mesh(roundTreeGeo(s, R, ['#4a6a46', '#3f5c3e', '#55743f']), lam); m.position.set(x, gyh - .12, z); m.castShadow = true; g.add(m); });
  [[-3.4, 5.4, 1.1], [1.0, 7.0, 1.2]].forEach(([x, z, s]) => { const m = new THREE.Mesh(pineGeo(s, R), lam); m.position.set(x, gyh - .12, z); m.castShadow = true; g.add(m); });
  // a faint ring of foam where the water meets the headland
  const foam = new THREE.Mesh(new THREE.RingGeometry(3.45, 3.95, 40), new THREE.MeshBasicMaterial({ color: 0xc8d4e8, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, .03, 3.5); g.add(foam);
  const glows = LAMPS.map(([x, y, z]) => { const s = spriteGlow(x, y, z, 1.5, 0xffc880, 0); g.add(s); return s; }), glowSL = spriteGlow(-2.7, gyh + 1.2, 3.1, 2.2, 0xffc880, .4); g.add(glowSL);
  const mote = makeMotes({ n: 70, area: [6, 2.4, 10], size: .035, v: .15, seed: 85, color: 0xffe0b0 }); g.add(mote.mesh);

  // people: the walker (jacket, trousers, backpack) carries a lantern; the stranger sits on the bench, hooded, head down
  const wk = makeWalker(); g.add(wk.group);
  { const b = new GB(R); b.box('#3a3a44', [0, -.01, 0], [.12, .02, .12], [0, 0, 0], 0); b.box('#2e2e3a', [0, -.08, 0], [.09, .14, .09], [0, 0, 0], 0); b.box('#ffd49a', [0, -.08, 0], [.065, .1, .065], [0, 0, 0], 0); const m = new THREE.Mesh(b.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); m.position.set(0, -.46, .02); wk.arms[1].add(m); }
  const hand = new THREE.Object3D(); hand.position.set(0, -.5, .02); wk.arms[1].add(hand);
  const lg = spriteGlow(0, 0, 0, 1.3, 0xffc27a, 0); g.add(lg);
  const lanternL = new THREE.PointLight(0xffb868, 0, 4.5, 1.6); g.add(lanternL);
  const st = person(R, { top: '#4e4e5c', pants: '#34343f', cloth: '#5a5a68', skin: '#b57a50', seed: 66 }, .55); g.add(st.group);
  const wL = new THREE.Vector3(), ryB = Math.atan2(BX, BZ - 1.0) + Math.PI * 2;

  function update(lt, t, cam) {
    // lamps come on one by one as the walker looks ahead
    glows.forEach((s, i) => { s.material.opacity = (.34 + .06 * Math.sin(t * 2 + i)) * smooth(62.4 + i * .55, 63.4 + i * .55, t); });
    // 60-66 stands and looks ahead; 66.2-68.8 turns to the bench; 69.8-73.2 walks over; 73.4-75 holds out the lantern
    let x = 0, z = 1.0, ry = Math.PI + .03 * Math.sin(t * .8);
    const turn = smooth(66.2, 68.8, t), walk = smooth(69.8, 73.2, t);
    if (t >= 66.2) ry = lerp(Math.PI, ryB, turn);
    if (t >= 69.8) { x = lerp(0, BX + .78, walk); z = lerp(1.0, BZ - .18, walk); ry = lerp(ryB, Math.PI * 1.5, smooth(72.2, 73.6, t)); }
    const moving = t > 69.8 && t < 73.3, ph = t * 6.2, amp = moving ? .5 : 0;
    wk.group.position.set(x, gyh + (moving ? Math.abs(Math.sin(ph)) * .02 : 0), z); wk.group.rotation.set(0, ry, 0); wk.group.scale.setScalar(1.1 * (1 + .006 * Math.sin(t * 1.9)));
    wk.legs[0].rotation.x = Math.sin(ph) * amp; wk.legs[1].rotation.x = -Math.sin(ph) * amp;
    wk.arms[0].rotation.x = -Math.sin(ph) * amp * .8 - (moving ? 0 : .06); wk.arms[1].rotation.x = Math.sin(ph) * amp * .8 - (moving ? 0 : .18) - 1.15 * smooth(73.3, 74.6, t);
    wk.group.updateMatrixWorld(true); hand.getWorldPosition(wL); lg.position.copy(wL); lanternL.position.copy(wL).add(new THREE.Vector3(0, .12, 0));
    const lon = smooth(60.8, 62.6, t); lg.material.opacity = .5 * (.92 + .08 * Math.sin(t * 9)) * lon; lanternL.intensity = 1.4 * lon * (.94 + .06 * Math.sin(t * 7));
    // the stranger sits, head bowed, and looks up as the light arrives
    st.group.position.set(BX + .02, gyh + .1, BZ); st.group.rotation.set(.02 + .22 * (1 - smooth(73.4, 74.8, t)), Math.PI / 2, 0, 'YXZ'); st.arms[0].rotation.set(-.9, 0, -.1); st.arms[1].rotation.set(-.9, 0, .1); st.group.scale.set(.55, .55 * .78, .55);
    // the sea fades into haze behind the pier, whatever the camera distance
    const U = water.U, dH = cam ? cam.D * Math.cos((cam.el || 20) * Math.PI / 180) : 20; U.uT.value = t; U.uLevel.value = 0; U.uAmp.value = .05; U.uOp.value = 1; U.uFogA.value = dH + 1; U.uFogB.value = dH + 26;
    mote.update(t, .8, [0, .5, -2]);
  }
  const cam = [
    { t: 60, T: [0, .4, -1.5], az: 12, el: 60, w: 30 },
    { t: 63.0, T: [0, .85, .2], az: 4, el: 24, w: 7.4 },
    { t: 66.4, T: [0, .95, -.5], az: 2, el: 13, w: 6.4 },
    { t: 70.0, T: [-.8, .95, 1.6], az: 12, el: 13, w: 5.6 },
    { t: 74.9, T: [-1.15, .85, 2.15], az: 22, el: 11, w: 3.9, stop: true },
  ].map(k => ({ fov: 26, dy: 330, ...k, t: k.t - TT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#5a5c8e', '#2a2438', .82, '#ffb888', 1.35, [7, 4.6, 6], .4, '#7a8cff', [-8, 5, 4], 9), D(70, '#625e90', '#2c2638', .84, '#ffc090', 1.5, [7, 4.6, 6], .4, '#8a96ff', [-8, 5, 4], 9), D(76, '#6a6494', '#2e2838', .86, '#ffc898', 1.6, [7, 4.8, 6], .4, '#8a96ff', [-8, 5, 4], 9)];
  const bg = [[60, ['#161c48', '#7a6a90']], [70, ['#1a2250', '#8a7090']], [76, ['#1e2654', '#9a7a90']]];
  return { group: g, update, light, bg, cam, water, lg, fog: (lt, t, c) => [HAZE, c.D + 1, c.D + 22] };
}
