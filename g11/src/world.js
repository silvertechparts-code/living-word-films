// Episode 7: the Episode 6 island and the same ark, now finished. Animals and the family enter, the door closes by itself, the water rises and the ark floats.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, person, pose, spriteGlow, shaft } from './kit.js';
import { seg, ease } from './util.js';
import { pk, makeQuad, makeMotes, roundTreeGeo, pineGeo, walkLegs } from './props.js';
import { build as buildWild, makeBird } from './fauna6.js';
import { buildTerrain, underRock, farMountains, makeClouds, Hf, RI, SET, HILL, ARKP, TAU } from './terrain6.js';
import { makeArk, AK, zb } from './ark.js';
import { makeWater, makeRain, makeSprings, waterLevel } from './flood.js';
import { LK } from './lights.js';

export const gy = (x, z) => Hf(x, z) + .02;
const rot = (x, z, ry, px, pz) => { const c = Math.cos(ry), s = Math.sin(ry); return [x + px * c + pz * s, z - px * s + pz * c]; };
const flick = (t, k = 1) => (.84 + .16 * Math.sin(t * 13 * k) + .07 * Math.sin(t * 29 * k + 1));
// the family: Noah and his sons exactly as in Episode 6; the four wives share the palette of their husbands
export const NOAH = { pants: '#8a6a46', top: '#cdb88e', mantle: '#e6dcc4', sash: '#6a4a2a', hair: '#b4aea4', beard: '#cdc8be', seed: 301, skin: '#c98d62' };
export const SONS = { shem: { pants: '#4a6a8a', top: '#6f8fae', cloth: '#e6dcc4', hair: '#2a1a10', sash: '#3a3a4a', seed: 303, skin: '#c98d62' }, ham: { pants: '#a8603a', top: '#c98660', hair: '#1f160d', sash: '#5a3a20', seed: 304, skin: '#b57a50' }, jap: { pants: '#6a8a5a', top: '#9ab07a', hair: '#6a4a2a', sash: '#4a4a2a', seed: 305, skin: '#d9a073' } };
export const WIVES = { noah: { pants: '#6a4a5a', top: '#a9837f', cloth: '#e6dcc4', sash: '#4a3040', hair: '#8a8478', seed: 311, skin: '#c98d62', long: true }, shem: { pants: '#3f5f72', top: '#7fa0ae', cloth: '#d9ccb0', sash: '#2a3a4a', hair: '#2a1a10', seed: 312, skin: '#c08258', long: true }, ham: { pants: '#8c5a32', top: '#c9a060', cloth: '#e8dcc0', sash: '#5a3a20', hair: '#1f160d', seed: 313, skin: '#a8703f', long: true }, jap: { pants: '#586e4a', top: '#a6b884', cloth: '#e0d6b8', sash: '#3a4a2a', hair: '#6a4a2a', seed: 314, skin: '#dcaa7c', long: true } };

const AY0 = gy(ARKP.x, ARKP.z) - .02, F = [3.95, .4], DR = [ARKP.x - AK.W / 2 - .045 + .0, ARKP.z + zb(6)], DRX = 5.72;
const yAt = (x, z) => x < F[0] ? gy(x, z) : x < DRX ? lerp(gy(F[0], F[1]), AY0 + .37, (x - F[0]) / (DRX - F[0])) : AY0 + .41;
const SPOT = { noah: [6.45, .42], wNoah: [6.72, .68], shem: [6.4, .02], wShem: [6.68, .2], ham: [6.42, .86], wHam: [6.72, 1.02], jap: [6.98, .38], wJap: [7.02, .78] };

export function makeLand() {
  const R = rng(7070), g = new THREE.Group();
  g.add(buildTerrain(rng(61)), underRock(rng(62)));
  const far = farMountains(rng(63)); g.add(far);
  const sea = makeClouds(rng(64), 130, { r0: [14, 62], y: [-3.8, -1.0], s: [3, 7.5], cols: ['#39426a', '#414a74', '#2e3758', '#4a4466'], pull: 1 });
  const storm = makeClouds(rng(65), 90, { r0: [12.5, 34], y: [2.4, 7.5], s: [2.2, 4.6], cols: ['#3c4466', '#464e72', '#343c5e', '#50567a'], pull: .8, grow: .3 });
  const canopy = makeClouds(rng(67), 28, { r0: [.6, 7], y: [5.4, 8.2], s: [1.5, 3.0], cols: ['#363e62', '#424a70', '#2e3658', '#4a5078'], pull: 1 });
  g.add(sea.mesh, storm.mesh, canopy.mesh); storm.mat.emissive.set('#1c2440'); canopy.mat.emissive.set('#1c2440'); sea.mat.emissive.set('#141a30');
  const ark = makeArk(rng(66)); ark.update(1000); g.add(ark.group);
  const water = makeWater(), rain = makeRain(), springs = makeSprings(gy); g.add(water.mesh, rain.group, springs.group);
  const foam = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 56), new THREE.MeshBasicMaterial({ color: 0xc8d4e8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); foam.rotation.x = -Math.PI / 2; foam.renderOrder = 5; foam.frustumCulled = false; g.add(foam);

  // ---------------- the settlement, dim, no one in it
  const lit = new GB(R), glow = new GB(R);
  const HOUSES = [[-3.5, -1.3, 1.25, 1.0, .75, '#7d6a56', '#3f342c'], [-2.1, -3.1, 1.35, 1.0, .7, '#6f5f4e', '#4a3a30'], [.4, -3.6, 1.15, .9, .85, '#86705c', '#3a2e28'], [2.5, -2.6, 1.25, 1.0, .65, '#75624f', '#44382e'], [3.9, -.3, 1.0, 1.0, .7, '#7d6a56', '#3a2e28'], [3.7, 2.0, 1.2, .9, .8, '#6f5f4e', '#4a3a30'], [1.5, 3.8, 1.3, 1.1, .7, '#86705c', '#3f342c'], [-1.0, 3.9, 1.1, 1.0, .6, '#75624f', '#44382e'], [-3.1, 2.9, 1.2, 1.0, .75, '#7d6a56', '#4a3a30'], [-4.3, .6, 1.0, .9, .6, '#6f5f4e', '#3a2e28']];
  HOUSES.forEach(([dx, dz, w, d, h, wall, roof], i) => {
    const x = SET.x + dx, z = SET.z + dz, y = gy(x, z) - .03, ry = Math.atan2(-dx, -dz) + (R() - .5) * .3, at = (px, py, pz) => { const q = rot(x, z, ry, px, pz); return [q[0], y + py, q[1]]; };
    lit.box(wall, at(0, h / 2, 0), [w, h, d], [0, ry, 0], .06);
    if (i === 3) { lit.box('#2a2220', at(0, h + .02, 0), [w * 1.06, .06, d * 1.06], [0, ry, 0], .05); lit.box('#1a1412', at(.1, h + .12, 0), [w * .5, .2, d * .6], [.2, ry, .3], .05); }
    else if (i % 3 === 0) lit.add(new THREE.ConeGeometry(1, 1, 4).translate(0, .5, 0), roof, at(0, h, 0), [w * .8, h * .6, d * .8], [0, ry + Math.PI / 4, 0], .06);
    else { lit.box(roof, at(0, h + .03, 0), [w * 1.1, .07, d * 1.1], [0, ry, 0], .05); lit.box(wall, at(w * .3, h + .12, -d * .2), [.18, .2, .18], [0, ry, 0], .05); }
    lit.box('#1c1410', at(-w * .18, .22, d / 2 + .004), [.2, .44, .02], [0, ry, 0], .02);
    if (i % 2 === 0) glow.box('#a8642a', at(w * .26, h * .62, d / 2 + .008), [.15, .17, .01], [0, ry, 0], .02);
  });
  const dead = (x, z, s) => { const y = gy(x, z) - .02; lit.box('#2a2420', [x, y + .45 * s, z], [.07 * s, .9 * s, .07 * s], [.05, 0, .08], .1); for (let k = 0; k < 4; k++) { const a = R() * TAU; lit.box('#2a2420', [x + Math.cos(a) * .14 * s, y + (.5 + .13 * k) * s, z + Math.sin(a) * .14 * s], [.035 * s, .5 * s, .035 * s], [Math.sin(a) * .9, 0, -Math.cos(a) * .9], .1); } };
  [[-9.4, 3.6, 1.2], [-9.0, -1.6, 1.0], [-2.2, 6.4, 1.1], [-5.4, 7.2, 1.3], [-10.2, 1.2, .9], [-0.6, 1.8, 1.0], [-7.4, -4.4, 1.1], [-1.6, -.2, .9]].forEach(a => dead(...a));
  const px = SET.x, pz = SET.z;
  for (const [a, b, n] of [[-1.7, 2.0, 4.0], [1.6, -1.3, 4.0], [-.4, 4.4, 5.0]]) for (let k = 0; k < n; k++) if (k !== 2) { const u = k / (n - 1), x = px + lerp(a, a + 1.9, u), z = pz + lerp(b, b + .9, u), y = gy(x, z) - .02; lit.box('#6a4a2c', [x, y + .14, z], [.05, .28, .05], [0, 0, k === 3 ? .5 : 0], .08); }
  const settleM = new THREE.Mesh(lit.build(), lam); settleM.castShadow = settleM.receiveShadow = true; g.add(settleM); g.add(new THREE.Mesh(glow.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })));
  const tree = (x, z, s, cols) => { const m = new THREE.Mesh(roundTreeGeo(s, R, cols || ['#4a6a3a', '#3f5c34', '#55743f', '#46663a']), lam); m.position.set(x, gy(x, z) - .02, z); m.castShadow = true; g.add(m); };
  [[HILL.x - 2.4, HILL.z + 1.0, 1.2], [HILL.x + 2.5, HILL.z + 1.4, 1.1], [HILL.x - .6, HILL.z + 3.0, .9], [HILL.x + 3.4, HILL.z + 3.2, 1.2], [10.6, 3.4, 1.2], [10.4, -1.2, 1.0], [11.0, 1.2, .9], [4.2, 9.4, 1.0], [-3.8, 9.6, 1.1], [9.4, 7.0, 1.0]].forEach(a => tree(...a));
  for (const [x, z, s] of [[-1.5, -7.2, 1.4], [1.4, -6.5, 1.2], [5.0, -6.8, 1.3], [-6.0, -6.8, 1.3], [-9.2, -2.6, 1.2], [3.6, -9.0, 1.1], [6.6, -8.8, 1.2]]) { const m = new THREE.Mesh(pineGeo(s, R), lam); m.position.set(x, gy(x, z) - .02, z); m.castShadow = true; g.add(m); }
  const rk = new GB(R); for (let k = 0; k < 26; k++) { const a = R() * TAU, r = 2 + R() * 11, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - SET.x, z - SET.z) < 4.5 || Math.hypot(x - ARKP.x, z - ARKP.z) < 5) continue; rk.add(G.ico0, pk(R, ['#7a766e', '#8a867c', '#6a665e']), [x, gy(x, z) + .02, z], [.2, .13, .17], [R() * 3, R() * 3, 0], .1); } g.add(new THREE.Mesh(rk.build(), lam));

  // ---------------- people
  const mk = (o, sc, name) => { const f = person(R, o, sc); f.group.name = name || ''; g.add(f.group); return f; };
  const addStaff = f => { const b = new GB(R); b.box('#5a3a20', [0, -.3, 0], [.04, 1.3, .04], [0, 0, 0], .05); b.add(G.ico0, '#4a2e18', [0, .36, 0], [.06, .06, .06], [0, 0, 0], .05); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; f.arms[1].add(m); return m; };
  const noah = mk(NOAH, .5, 'noah'), shem = mk(SONS.shem, .45, 'shem'), ham = mk(SONS.ham, .45, 'ham'), jap = mk(SONS.jap, .44, 'jap'), wN = mk(WIVES.noah, .46, 'wNoah'), wS = mk(WIVES.shem, .44, 'wShem'), wH = mk(WIVES.ham, .44, 'wHam'), wJ = mk(WIVES.jap, .43, 'wJap');
  addStaff(noah);
  const FAM = [
    { f: noah, key: 'noah', gp: [3.05, 1.05, 1.5], tD: 22.0 }, { f: wN, key: 'wNoah', gp: [2.7, 1.3, 1.4], tD: 23.4 },
    { f: shem, key: 'shem', gp: [2.45, .85, 1.3], tD: 24.8 }, { f: wS, key: 'wShem', gp: [2.3, 1.25, 1.4], tD: 25.5 },
    { f: ham, key: 'ham', gp: [2.2, 1.65, 1.5], tD: 26.7 }, { f: wH, key: 'wHam', gp: [2.55, 1.85, 1.5], tD: 27.3 },
    { f: jap, key: 'jap', gp: [2.0, 1.1, 1.3], tD: 28.4 }, { f: wJ, key: 'wJap', gp: [1.95, 1.5, 1.4], tD: 29.0 }];

  // ---------------- animals: seven pairs of clean animals (sheep, oxen), one pair of each unclean kind, seven pairs of birds
  const curveOf = pts => new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0, p[1])));
  const SRCS = { A: curveOf([[-1.4, -5.6], [.2, -3.9], [1.8, -2.1], [3.0, -.6], F]), B: curveOf([[-2.7, -.5], [-.9, -.1], [.9, .25], [2.6, .35], F]), C: curveOf([[-3.2, -6.8], [-.4, -4.4], [1.9, -2.2], [3.3, -.5], F]) };
  const LEN = Object.fromEntries(Object.entries(SRCS).map(([k, c]) => [k, c.getLength()]));
  const KIND = {
    sheep: { sc: .6, v: 1.0, mk: i => makeQuad({ rn: rng(910 + i), len: .46, h: .24, w: .2, legL: .2, legW: .04, col: pk(rng(i * 7 + 3), ['#f1ece0', '#e8e0cf', '#d9cfb8', '#f6f2e8', '#6a5a4a']), col2: '#d8d0bc', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#3a2e26' }) },
    ox: { sc: .5, v: .85, mk: i => makeQuad({ rn: rng(940 + i), len: .88, h: .38, w: .3, legL: .38, legW: .075, col: pk(rng(i * 5 + 1), ['#8a5a38', '#7a4a2c', '#a8784a', '#5a3a28', '#b08a60']), col2: '#caa27a', neck: [.2, .9, .16], head: [.26, .18, .18], horns: true }) },
    camel: { sc: .42, v: .8, mk: i => makeQuad({ rn: rng(970 + i), len: 1.05, h: .42, w: .3, legL: .72, legW: .07, col: '#c89a5a', col2: '#a97c44', neck: [.62, .62, .12], head: [.26, .13, .12], hump: true, ears: false }) },
    donkey: { sc: .5, v: .9, mk: i => makeQuad({ rn: rng(980 + i), len: .78, h: .3, w: .22, legL: .42, legW: .05, col: '#8c8378', col2: '#d8d0c0', neck: [.26, .7, .1], head: [.26, .13, .1], ears: true }) },
    elephant: { sc: .36, v: .7, mk: i => buildWild('elephant', rng(990 + i)) },
    zebra: { sc: .45, v: .95, mk: i => buildWild('zebra', rng(995 + i)) },
    lion: { sc: .5, v: .9, mk: i => buildWild('lion', rng(997 + i)) },
  };
  const SEQ = [['ox', 'A'], ['sheep', 'B'], ['ox', 'A'], ['sheep', 'B'], ['elephant', 'C'], ['sheep', 'B'], ['ox', 'A'], ['camel', 'C'], ['sheep', 'B'], ['ox', 'A'], ['zebra', 'C'], ['sheep', 'B'], ['ox', 'A'], ['lion', 'C'], ['sheep', 'B'], ['ox', 'A'], ['donkey', 'C'], ['sheep', 'B'], ['ox', 'A']];
  const animals = []; let ai = 0;
  SEQ.forEach(([kind, src], k) => { const K = KIND[kind], tF = 8.7 + k * .5; for (let j = 0; j < 2; j++) { const a = K.mk(ai++); a.group.scale.setScalar(K.sc * (.93 + .14 * R())); a.group.visible = false; g.add(a.group); animals.push({ a, K, src, j, tF: tF + j * .55 / K.v, sd: R() }); } });
  const BCOL = ['#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#bdb7a8', '#bdb7a8', '#bdb7a8', '#bdb7a8', '#2c2c36', '#2c2c36', '#2c2c36', '#2c2c36'];
  const birds = BCOL.map((c, i) => { const b = makeBird(rng(800 + i), c); b.group.scale.setScalar(.75 + .15 * R()); b.group.visible = false; g.add(b.group); return b; });
  const BP = i => new THREE.CatmullRomCurve3([[-3.4 + (i % 5) * .5, 3.6 + (i % 3) * .3, -3.8 + (i % 4) * .5], [.6, 2.6, -1.6 + (i % 3) * .3], [3.8, 1.5, -.2], [5.2, .95, .35], [5.9, .82, .4]].map(p => new THREE.Vector3(...p)));
  const BC = birds.map((_, i) => BP(i));

  // ---------------- torches, smoke, lights
  const flames = [], C = { x: SET.x + .2, z: SET.z - .1 };
  const fire = (x, y, z, s) => { const f = new THREE.Group(); f.position.set(x, y, z); for (const [dx, h, c] of [[0, .36, 0xffa030], [.07, .26, 0xff6a20], [-.07, .24, 0xffd060]]) { const m = new THREE.Mesh(G.cone5, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); m.scale.set(.13 * s, h * s, .13 * s); m.position.x = dx * s; f.add(m); } g.add(f); const gl = spriteGlow(x, y + .25 * s, z, 1.7 * s, 0xff8a30, .5); g.add(gl); flames.push({ f, gl, s }); return f; };
  const TORCH = [[C.x - 1.9, C.z - 1.2], [C.x + 1.9, C.z + .9], [C.x - .2, C.z + 2.1]];
  TORCH.forEach(([x, z]) => { const y = gy(x, z) - .02, b = new GB(R); b.box('#4a3220', [x, y + .3, z], [.04, .6, .04], [0, 0, 0], .05); g.add(new THREE.Mesh(b.build(), lam)); fire(x, y + .62, z, .5); });
  const plazaL = new THREE.PointLight(0xff8a3a, 0, 5.5, 2), arkL = new THREE.PointLight(0xffb868, 0, 9, 1.4), inL = new THREE.PointLight(0xffa850, 0, 4.6, 1.4), goldL = new THREE.PointLight(0xffd08a, 0, 8, 1.5);
  plazaL.position.set(C.x, 1.0, C.z); arkL.position.set(ARKP.x - 3.4, 1.6, ARKP.z + .9); inL.position.set(7.5, 1.25, .45); goldL.position.set(3.1, 1.0, 1.1); g.add(plazaL, arkL, inL, goldL);
  const doorGlow = spriteGlow(5.35, AY0 + .75, ARKP.z + zb(6), 2.4, 0xffc27a, 0); g.add(doorGlow);
  const noahGlow = spriteGlow(3.05, 1.0, 1.05, 1.8, 0xffd890, 0); g.add(noahGlow);
  const dust = makeMotes({ n: 80, area: [3, 1.4, 3], size: .018, v: .05, seed: 74, color: 0xffe0a8 }); g.add(dust.mesh);
  const motesG = makeMotes({ n: 70, area: [6, 3, 6], size: .04, v: .2, seed: 72, color: 0xffdd90 }); g.add(motesG.mesh);
  const hopeShaft = shaft(16, .7, 2.2, [1, .83, .5], 1, .35); g.add(hopeShaft);

  // ---------------- state of the ark (rises with the water, then floats and drifts)
  function arkState(t) {
    const L = waterLevel(t), lift = Math.max(0, L - .6 - AY0), fb = clamp((L - .9) / 1.2), dr = smooth(45, 70, t);
    return { x: ARKP.x - 2.4 * dr, z: ARKP.z + 1.1 * dr, y: AY0 + lift + Math.sin(t * .9) * .035 * fb, yaw: -.55 * smooth(47, 68, t), roll: Math.sin(t * .7 + 1) * .035 * fb, pitch: Math.sin(t * .55) * .022 * fb, L, float: fb };
  }
  // water level lifts the cloud layers so they always stay above the sea
  const place = (f, x, z, ry, o = {}, y) => pose(f, x, (y ?? gy(x, z)) + (o.hop || 0), z, ry, o);
  const walkO = (w, amp = .42) => ({ a0x: amp * w, a1x: -amp * w });

  function update(t, cam, o = {}) {
    const hope = o.hope || 0, st = arkState(t), L = st.L, inside = !!o.interior;
    // ---- ark
    ark.group.position.set(st.x, st.y, st.z); ark.group.rotation.set(st.pitch, st.yaw, st.roll, 'YXZ');
    ark.slitMat.opacity = .92 * (1 - .35) * (.94 + .06 * Math.sin(1000 * 3.1)) * smooth(34.3, 37.0, t);   // lamplight between the boards: only after the door is shut
    const dOpen = 1.5 * (1 - ease.inOutSine(seg(t, 31.4, 34.0))); ark.setDoor(dOpen);
    // ---- water, rain, springs
    const rk = (smooth(37.6, 41.5, t) * (1 - hope * .55)) * (t < 35 ? 0 : 1) * (inside ? 0 : 1);
    water.set(t, { op: inside ? 0 : 1 }); water.mesh.visible = t > 36;
    const cp = cam && cam.position, Tg = cam && cam.userData.T, Wd = (cam && cam.userData.W) || 8;
    rain.group.visible = rk > .01; if (rk > .01) rain.update(t, rk, Tg, Wd, L, 1);
    springs.group.visible = t > 36 && t < 52; if (springs.group.visible) springs.update(t, L);
    foam.visible = L > AY0 + .05; foam.position.set(st.x, L + .035, st.z); foam.rotation.set(-Math.PI / 2, 0, -st.yaw); foam.scale.set(1.55, 8.0, 1); foam.material.opacity = .3 * smooth(AY0 + .05, AY0 + .6, L);
    // ---- sky (the hope shot paints its own sky, so the 3D cloud layers are hidden there)
    const nc = !!o.noCloud; storm.mesh.visible = !nc; canopy.mesh.visible = !nc; sea.mesh.visible = !nc; far.visible = !nc;
    const gather = (.38 + .22 * smooth(0, 36, t) + .4 * smooth(36, 44, t)) * (1 - hope * .35), vis = smooth(0, 5, t) * (1 - hope * .2), lift = Math.min(Math.max(0, L - .4) * 1.02, 11.5);
    const clr = 26 * smooth(46, 54, t); storm.update(t, gather, vis, null, lift, cp, 14, Tg, clr); sea.update(t, 0, 1 - smooth(36.2, 38.6, t), null, 0, cp, 16, Tg);
    canopy.mesh.position.set(st.x - .5, 0, st.z); canopy.update(t, 0, smooth(30, 40, t) * (1 - hope * .7), null, lift, cp, 10, Tg, clr);
    { const c = 1 - .32 * smooth(30, 48, t); storm.mat.color.setRGB(c, c, c * 1.02); far.userData.mat.color.setRGB(.8 + .2 * smooth(18, 24, t), .8 + .2 * smooth(18, 24, t), .8 + .2 * smooth(18, 24, t)); }
    // ---- fires and lights
    flames.forEach((o2, i) => { const k = flick(t + i * .7, 1 + i * .05); o2.f.children.forEach((c, j) => { c.scale.y = [.36, .26, .24][j] * o2.s * (.75 + .5 * k); c.rotation.y = t * 3 + j; }); o2.gl.material.opacity = .4 * k * (1 - smooth(38, 46, t)); o2.f.visible = L < .3; });
    plazaL.intensity = 2.2 * flick(t, .8) * (1 - smooth(38, 44, t));
    arkL.intensity = 1.9 * smooth(1, 4, t) * flick(t, .5) * (1 - smooth(30, 38, t)) * (inside ? 0 : 1);
    inL.intensity = (inside ? 1.1 : .4) * smooth(27, 30, t) * (1 - smooth(34, 36, t) * .5) * (t < 37 ? 1 : 0) * flick(t, .6);
    const open = clamp(dOpen / 1.5);
    doorGlow.material.opacity = .45 * open * (t > 27 ? 1 : 0); doorGlow.position.set(st.x - 1.55, st.y + .75, st.z + zb(6));
    goldL.intensity = 1.5 * smooth(2, 5, t) * (1 - smooth(21, 24, t)); noahGlow.material.opacity = .1 * smooth(2, 5, t) * (1 - smooth(21, 24, t));
    dust.mesh.visible = t > 27 && t < 36; dust.update(t, open * smooth(28, 30, t), [6.9, .75, .5]);
    motesG.update(t, (smooth(2, 5, t) * (1 - smooth(36, 40, t)) + hope * .5) * .8, [3.5, .6, 1.0]);
    // hope: a thin golden shaft over the floating ark
    hopeShaft.position.set(st.x - 1.5, L - .1, st.z + 1.0); hopeShaft.material.opacity = .2 * hope; hopeShaft.visible = hope > .01;

    // ---- animals
    animals.forEach(({ a, K, src, j, tF, sd }) => {
      const cur = SRCS[src], Ls = LEN[src], Lr = DRX - F[0], s = (t - (tF - Ls / K.v)) * K.v, vis = s > 0 && s < Ls + Lr + .1 && t < 37;
      a.group.visible = vis; if (!vis) return;
      let x, z, y, ry;
      if (s < Ls) { const u = clamp(s / Ls), p = cur.getPointAt(u), q = cur.getPointAt(Math.min(1, u + .01)), nx = -(q.z - p.z), nz = q.x - p.x, nn = Math.hypot(nx, nz) || 1, off = (j ? 1 : -1) * .24 * (1 - smooth(Ls - 1.5, Ls - .2, s)) + .05 * Math.sin(sd * 9 + s * .3); x = p.x + nx / nn * off; z = p.z + nz / nn * off; ry = Math.atan2(-(q.z - p.z), q.x - p.x); y = gy(x, z); }
      else { const u = (s - Ls) / Lr; x = F[0] + u * Lr; z = F[1]; ry = 0; y = yAt(x, z); }
      a.group.position.set(x, y + Math.abs(Math.sin(t * 5.5 + sd * 6)) * .01, z); a.group.rotation.y = ry; if (a.legs) walkLegs(a.legs, t * (1 + sd * .2) + sd * 3, 5.5, .42);
    });
    birds.forEach((b, i) => { const t0 = 10.2 + i * .56, u = (t - t0) / 4.6, vis = u > 0 && u < 1 && t < 37; b.group.visible = vis; if (!vis) return; const p = BC[i].getPointAt(u), q = BC[i].getPointAt(Math.min(1, u + .01)); b.group.position.copy(p); b.group.rotation.set(0, Math.atan2(-(q.z - p.z), q.x - p.x), -.15 * Math.sin(t * 1.4 + i)); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 9 + i * 1.3) * .7); });

    // ---- the family
    const nz = Math.sin(t * .9) * .06;
    FAM.forEach((m, idx) => {
      const { f, key, gp, tD } = m, sp = SPOT[key], tF = tD - 1.9, tG = tF - 1.6, tS = tD + 1.5;
      f.group.visible = t < 37.6;
      let x, z, y, ry, o2 = {}, mv = false;
      if (t < tG) { x = gp[0]; z = gp[1]; ry = gp[2] + (key === 'noah' ? nz : .08 * Math.sin(t * .8 + idx)); y = gy(x, z); o2 = { lx: .04 * Math.sin(t * 1.3 + idx) }; if (key === 'noah') o2.a0x = -.15 - .8 * smooth(19.0, 19.8, t) * (1 - smooth(20.0, 20.4, t)) * (.7 + .3 * Math.sin(t * 6)); }
      else if (t < tF) { const u = ease.inOutSine(seg(t, tG, tF)); x = lerp(gp[0], F[0] - .1 * (idx % 2), u); z = lerp(gp[1], F[1] + .05 * (idx % 3), u); ry = Math.atan2(F[0] - gp[0], F[1] - gp[1]); y = gy(x, z); mv = true; }
      else if (t < tD) { const u = seg(t, tF, tD); x = lerp(F[0], DRX, u); z = F[1]; ry = Math.PI / 2; y = yAt(x, z); mv = true; }
      else if (t < tS) { const u = ease.inOutSine(seg(t, tD, tS)); x = lerp(DRX, sp[0], u); z = lerp(F[1], sp[1], u); ry = lerp(Math.PI / 2, -Math.PI / 2 + .06 * (idx - 3.5) * .3, smooth(.5, 1, u)); y = AY0 + .41; mv = u < .85; }
      else { x = sp[0]; z = sp[1]; ry = -Math.PI / 2 + .05 * (idx - 3.5) * .5 + (t > 33 && t < 36 ? .1 * Math.sin(t * .8 + idx) : 0); y = AY0 + .41; o2 = { lx: .03 * Math.sin(t * 1.1 + idx) }; }
      if (mv) { const w = Math.sin(t * 6.5 + idx); Object.assign(o2, walkO(w), { hop: Math.abs(w) * .02 }); }
      if (key === 'noah' && !mv) o2.a1x = -.4;
      // inside the ark everything moves with the hull (they are hidden once the water arrives)
      const bob = t > 37.6 ? 0 : 0; place(f, x, z, ry, o2, y + bob);
    });
  }
  function plates() { }

  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    D(0, '#5668a8', '#242840', 1.0, '#ffcf94', 1.9, [-13, 5.2, 4], .55, '#6a7cff', [10, 6, -8], 14),
    D(10, '#5262a0', '#222640', .98, '#ffc88c', 1.8, [-13, 5.0, 4], .5, '#6a7cff', [10, 6, -8], 12),
    D(20, '#4c5c96', '#202440', .94, '#ffc084', 1.7, [-13, 4.4, 4], .5, '#6a7cff', [10, 6, -8], 11),
    D(30, '#46568e', '#1e2240', .9, '#ffb87c', 1.6, [-13, 4.0, 3.5], .45, '#6a7cff', [10, 6, -8], 11),
    D(36, '#44528a', '#1c2038', .9, '#a8b2d8', .9, [-9, 7, 5], .4, '#7a8cff', [8, 5, -6], 12),
    D(41, '#445088', '#1c2038', .95, '#98a6d4', .9, [-9, 7, 5], .45, '#7a8cff', [8, 5, -6], 14),
    D(50, '#44508a', '#1c2038', .95, '#a4b0dc', .95, [-9, 7, 5], .5, '#7a8cff', [8, 5, -6], 16),
    D(60, '#46528c', '#1c2038', .9, '#a4b0dc', .9, [-9, 7, 5], .5, '#7a8cff', [8, 5, -6], 16)];
  const bg = [[0, ['#070a20', '#4a3040']], [10, ['#070a20', '#3a2c3c']], [20, ['#0a1230', '#302c44']], [30, ['#0a1230', '#2c2c46']], [38, ['#0a1230', '#242840']], [50, ['#0a1230', '#20243c']], [60, ['#080c1e', '#1c2036']]];
  return { group: g, update, plates, light, bg, noah, shem, ham, jap, ark, water, arkState, AY0, yAt };
}
