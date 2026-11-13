// Episode 8, 1:00-1:25: a present-day person waits on a pier at sunrise. A dove brings one small olive leaf; they plant it and give thanks.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, person, spriteGlow } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { makeWalker } from './choice.js';
import { makeWater } from './flood.js';
import { LK } from './lights.js';

export const RT = { t0: 60, end: 85 };
const HAZE = '#d49a8a', gyh = .32, SAP = [0, .3, 2.05];

export function makeReflect() {
  const R = rng(5252), g = new THREE.Group();
  const water = makeWater(true); water.U.uHaze.value.set(HAZE); water.U.uDeep.value.set('#1e3a62'); water.U.uShallow.value.set('#4a7e92'); water.U.uSky.value.set('#e8b090'); water.U.uSpec.value = .45; water.U.uFogA.value = 30; water.U.uFogB.value = 60; g.add(water.mesh);
  const gb = new GB(R);
  gb.add(new THREE.CylinderGeometry(3.3, 4.3, 1.1, 12, 1).translate(0, -.22, 3.5), '#62784e', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
  gb.add(new THREE.CylinderGeometry(3.6, 3.7, .2, 12, 1).translate(0, -.78, 3.5), '#5a4a3a', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
  for (let k = 0; k < 16; k++) { const a = R() * 6.28, r = 3.1 + R() * 1.3, x = Math.cos(a) * r, z = 3.5 + Math.sin(a) * r; gb.add(G.ico0, pk(R, ['#6e6a66', '#7a766e', '#5e5a58']), [x, -.15 + R() * .2, z], [.3 + R() * .35, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
  for (let k = 0; k < 34; k++) { const z = 1.2 - k * .47; gb.box(pk(R, ['#9a7a52', '#8a6c46', '#a88660', '#7e6240']), [0, gyh - .03, z], [1.5, .06, .44], [0, 0, 0], .08); }
  for (let k = 0; k < 11; k++) for (const s of [-1, 1]) gb.box('#4a3624', [s * .66, -.25, 1.0 - k * 1.5], [.12, 1.1, .12], [0, 0, 0], .05);
  const headM = new THREE.Mesh(gb.build(), lam); headM.castShadow = true; headM.receiveShadow = true; g.add(headM);
  [[2.6, 5.4, 1.2, 0], [-1.2, 6.3, 1.0, 1], [3.0, 3.4, .9, 0], [-2.8, 4.2, .9, 1]].forEach(([x, z, s, o]) => { const m = new THREE.Mesh(o ? oliveGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']), lam); m.position.set(x, gyh - .12, z); m.castShadow = true; g.add(m); });
  [[-3.4, 5.4, 1.1], [1.0, 7.0, 1.2]].forEach(([x, z, s]) => { const m = new THREE.Mesh(pineGeo(s, R), lam); m.position.set(x, gyh - .12, z); m.castShadow = true; g.add(m); });
  const foam = new THREE.Mesh(new THREE.RingGeometry(3.45, 3.95, 40), new THREE.MeshBasicMaterial({ color: 0xf0dcc8, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, .03, 3.5); g.add(foam);
  const mote = makeMotes({ n: 80, area: [6, 2.4, 10], size: .035, v: .15, seed: 85, color: 0xffe0b0 }); g.add(mote.mesh);

  // the person: jacket, trousers, backpack; the leaf is carried in the raised hand
  const wk = makeWalker(); g.add(wk.group);
  const hand = new THREE.Object3D(); hand.position.set(0, -.5, .02); wk.arms[1].add(hand);
  const leafH = new THREE.Mesh(new THREE.ConeGeometry(.5, 1, 4).translate(0, .5, 0), new THREE.MeshBasicMaterial({ color: 0x9ccc54, toneMapped: false })); leafH.scale.set(.03, .09, .012); leafH.position.set(0, -.02, .03); leafH.rotation.x = .5; leafH.visible = false; hand.add(leafH);
  // the dove
  const dove = makeBird(rng(851), '#f8f5ee'); dove.group.scale.setScalar(.34); dove.group.visible = false; g.add(dove.group);
  const leafB = new THREE.Mesh(new THREE.ConeGeometry(.5, 1, 4).translate(0, .5, 0), new THREE.MeshBasicMaterial({ color: 0x9ccc54, toneMapped: false })); leafB.scale.set(.05, .13, .018); leafB.rotation.z = -Math.PI / 2 - .25; leafB.position.set(.31, .045, 0); dove.group.add(leafB);
  const dGlow = spriteGlow(0, 0, 0, .55, 0xfff2d0, 0); g.add(dGlow);
  // the sapling that grows where the leaf was planted
  const sap = new THREE.Mesh(oliveGeo(.55, R), lam); sap.position.set(SAP[0], SAP[1], SAP[2]); sap.castShadow = true; g.add(sap);
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(.2, .26, .05, 8), new THREE.MeshLambertMaterial({ color: 0x6a4a30 })); dirt.position.set(SAP[0], SAP[1] - .02, SAP[2]); g.add(dirt);
  const sapGlow = spriteGlow(SAP[0], SAP[1] + .4, SAP[2], 1.3, 0xffd890, 0); g.add(sapGlow);
  const handW = new THREE.Vector3(), tmp = new THREE.Vector3();
  const DOVE = new THREE.CatmullRomCurve3([[0, 4.2, -30], [.3, 2.6, -14], [-.6, 1.8, -5], [-.1, 1.5, -.9], [.05, 1.42, .38]].map(p => new THREE.Vector3(...p)));
  const AWAY = new THREE.CatmullRomCurve3([[.05, 1.42, .38], [1.2, 1.9, -2.2], [3.5, 3.0, -8], [7, 5.5, -20], [10, 8.5, -40]].map(p => new THREE.Vector3(...p)));
  const ryB = Math.PI;

  function update(lt, t, cam) {
    // water slowly falling along the pier
    const U = water.U, dH = cam ? cam.D * Math.cos((cam.el || 20) * Math.PI / 180) : 20;
    U.uT.value = t; U.uLevel.value = lerp(.2, -.1, smooth(60, 84, t)); U.uAmp.value = .045; U.uOp.value = 1; U.uFogA.value = dH + 1; U.uFogB.value = dH + 26;
    foam.position.y = U.uLevel.value + .02; foam.material.opacity = .2 * (1 - .4 * smooth(70, 84, t));
    // the person: waiting; raises a hand for the leaf; turns, walks two steps, stands before the sapling, bows
    const turn = ease.inOutSine(seg(t, 75.6, 77.4)), walk = ease.inOutSine(seg(t, 77.0, 79.0)), bow = ease.inOutSine(seg(t, 80.2, 81.6)) * (1 - ease.inOutSine(seg(t, 83.6, 84.6)));
    let x = 0, z = 1.0, ry = ryB + .03 * Math.sin(t * .8);
    if (t >= 75.6) { ry = lerp(ryB, ryB - Math.PI + (.0), turn) ; }
    if (t >= 77.0) { z = lerp(1.0, 1.48, walk); }
    const moving = t > 77.0 && t < 79.0, ph = t * 6.2, amp = moving ? .45 : 0;
    const arm = ease.inOutSine(seg(t, 67.6, 68.6)) * (1 - ease.inOutSine(seg(t, 73.6, 74.8)));
    wk.group.position.set(x, gyh + (moving ? Math.abs(Math.sin(ph)) * .02 : 0), z); wk.group.rotation.set(.32 * bow, ry, 0, 'YXZ'); wk.group.scale.setScalar(1.1 * (1 + .006 * Math.sin(t * 1.9)));
    wk.legs[0].rotation.x = Math.sin(ph) * amp; wk.legs[1].rotation.x = -Math.sin(ph) * amp;
    wk.arms[0].rotation.x = -Math.sin(ph) * amp * .8 - .06 - 1.1 * bow; wk.arms[1].rotation.x = Math.sin(ph) * amp * .8 - .18 - 1.2 * arm - 1.0 * bow;
    wk.arms[1].rotation.z = .1 - .5 * bow; wk.arms[0].rotation.z = -.1 + .5 * bow;
    wk.group.updateMatrixWorld(true); hand.getWorldPosition(handW);
    // the dove: arrives from the far horizon, hovers at the hand, passes the leaf, flies into the sun
    const a = (t - 64.9) / 4.2, b2 = (t - 69.9) / 3.6;
    let vis = false;
    const fly = (cur, u, fr, extra) => { u = clamp(u); const p = cur.getPointAt(u), q = cur.getPointAt(Math.min(1, u + .008)), dx = q.x - p.x, dz = q.z - p.z, dy = q.y - p.y; dove.group.position.copy(p); dove.group.rotation.set(0, Math.atan2(-dz, dx), Math.atan2(dy, Math.hypot(dx, dz) + 1e-6) * .7 + .05 * Math.sin(t * 2), 'XYZ'); dove.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * fr) * .7); };
    if (a > 0 && a < 1) { vis = true; const e = ease.outQuad ? ease.outQuad(a) : a; DOVE.points[4].set(handW.x - .06, handW.y + .12, handW.z - .28); fly(DOVE, e * .9 + a * .1, 17); }
    else if (a >= 1 && t < 69.9) { vis = true; dove.group.position.set(handW.x - .06 + .02 * Math.sin(t * 5), handW.y + .12 + .02 * Math.sin(t * 7), handW.z - .28); dove.group.rotation.set(0, Math.PI / 2 + .1 * Math.sin(t), .12); dove.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 24) * .8); }
    else if (b2 > 0 && b2 < 1) { vis = true; AWAY.points[0].set(handW.x - .06, handW.y + .12, handW.z - .28); fly(AWAY, ease.inOutSine(b2) * .6 + b2 * .4, 16); }
    dove.group.visible = vis; dGlow.visible = vis; if (vis) { dGlow.position.copy(dove.group.position); dGlow.material.opacity = .5; }
    leafB.visible = a > 0 && t < 69.5; leafH.visible = t >= 69.3 && t < 77.4;
    // sapling grows
    const gk = ease.outCubic(seg(t, 78.4, 84.2)); sap.scale.setScalar(Math.max(.001, gk)); dirt.visible = t > 78.2; sapGlow.material.opacity = .4 * smooth(80, 83, t) * (1 - .5 * smooth(84, 85, t));
    mote.update(t, .8, [0, .5, 0]);
  }
  const cam = [
    { t: 60, T: [0, .5, -1.5], az: 12, el: 36, w: 24 },
    { t: 63.2, T: [0, .85, .2], az: 6, el: 20, w: 8.6 },
    { t: 66.0, T: [0, .95, -.3], az: 10, el: 11, w: 6.2 },
    { t: 69.2, T: [-.2, 1.15, .6], az: 56, el: 8, w: 3.4 },
    { t: 73.0, T: [-.15, 1.1, .9], az: 132, el: 6, w: 3.0 },
    { t: 77.0, T: [0, 1.0, 1.3], az: 168, el: 8, w: 4.2 },
    { t: 81.0, T: [.1, .85, 1.9], az: 152, el: 10, w: 4.6 },
    { t: 85.0, T: [.1, 1.1, 2.0], az: 140, el: 15, w: 7.4, stop: true },
  ].map(k => ({ fov: 26, dy: 330, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#6a6a98', '#32283a', .86, '#ffb080', 1.5, [-3, 2.6, -9], .45, '#8a96ff', [8, 5, 6], 9), D(70, '#7a76a2', '#38303c', .9, '#ffc08c', 1.8, [-3, 3.4, -9], .45, '#8a96ff', [8, 5, 6], 9), D(80, '#8a82aa', '#403640', .95, '#ffd0a0', 2.0, [-3, 5.2, -9], .45, '#8a96ff', [8, 5, 6], 9), D(86, '#8a82aa', '#403640', .95, '#ffd0a0', 2.0, [-3, 5.6, -9], .45, '#8a96ff', [8, 5, 6], 9)];
  const bg = [[60, ['#1c2a60', '#c88a88']], [70, ['#2a3c78', '#e4a088']], [80, ['#3a5090', '#f0b888']], [86, ['#3a5090', '#f0b888']]];
  return { group: g, update, light, bg, cam, water, HAZE, fog: (lt, t, c) => [HAZE, c.D + 1, c.D + 22], sunElev: t => lerp(1.5, 13, smooth(60, 84, t)) };
}
