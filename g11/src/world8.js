// Episode 8: the ark afloat, the waters sinking, the ark grounded on the mountains of Ararat, the raven and the dove, the way out, the altar, the promise.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, person, pose, spriteGlow, shaft } from './kit.js';
import { seg, ease } from './util.js';
import { pk, makeQuad, makeMotes, roundTreeGeo, pineGeo, oliveGeo, walkLegs, peakGeo } from './props.js';
import { build as buildWild, makeBird } from './fauna6.js';
import { buildTerrain, underRock, makeClouds, Hf, YSH, MESA, ARK8, RI, TAU } from './terrain8.js';
import { makeArk, AK, zb } from './ark.js';
import { makeWater, makeRain } from './flood.js';
import { LK } from './lights.js';
import { NOAH, SONS, WIVES } from './world.js';

export const gy = (x, z) => Hf(x, z) + .02;
export const AY0 = Hf(ARK8.x, ARK8.z);
// distant mountain range to the north: broad low-poly peaks that rise out of the water as it falls
function farMountains(rn) {
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#2b3250', '#232a45', '#1c2238'], N = 26;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + (i / (N - 1) - .5) * Math.PI * 1.5 + (rn() - .5) * .12, r = 54 + rn() * 34, s = 3.4 + rn() * 4.4, c = cols[i % 3];
    const m = new THREE.Mesh(peakGeo(s, rn, [c, c, c], false), mat); m.scale.set(2.9 + rn() * .8, 1.05 + rn() * .3, 2.0 + rn() * .6); m.position.set(Math.cos(a) * r, -3.6 + rn() * 1.0, Math.sin(a) * r); m.rotation.y = rn() * 6; g.add(m);
  }
  g.userData.mat = mat; return g;
}
const flick = (t, k = 1) => (.84 + .16 * Math.sin(t * 13 * k) + .07 * Math.sin(t * 29 * k + 1));

// ---- the water: falling from far above the highest peak, the ark touches down on the plateau at about 12 s
const WL = [[0, 8.2], [5.5, 7.9], [11.0, 4.15], [12.5, 3.6], [14.5, 3.3], [17.0, 2.35], [22, 1.55], [27, 1.05], [33, .6], [37, .12], [41, -.4], [60, -.7], [90, -.7]];
export function waterLevel(t) { let i = 1; while (i < WL.length - 1 && t > WL[i][0]) i++; const [ta, a] = WL[i - 1], [tb, b] = WL[i]; const u = clamp((t - ta) / (tb - ta)), e = u * u * (3 - 2 * u) * .5 + u * .5; return lerp(a, b, e); }
const AMP = [[0, .5], [5, .46], [11, .26], [16, .12], [25, .08], [40, .05], [90, .04]];
export function waveAmp(t) { let i = 1; while (i < AMP.length - 1 && t > AMP[i][0]) i++; const [ta, a] = AMP[i - 1], [tb, b] = AMP[i]; return lerp(a, b, clamp((t - ta) / (tb - ta))); }

// ---- the ark's journey: drifting, turning, then resting on the plateau with a small lurch
const P0 = { x: -5.4, z: -1.2, yaw: .45 }, TREST = 12.4;
// the roof hatch ("window") and Noah at it, in ark-local coordinates
const HATCH = { x: 0, y: 2.0, z: 0 };
export const NOAH_LOCAL = [0, 1.86, 0];
export const FAMILY_DOOR = { x: 1.0, zIn: ARK8.z + .55, zDoor: ARK8.z + 1.3, zEnd: ARK8.z + 3.08 };

export function makeLand() {
  const R = rng(8080), g = new THREE.Group();
  g.add(buildTerrain(rng(61)), underRock(rng(62)));
  const far = farMountains(rng(63)); g.add(far);
  const sea = makeClouds(rng(64), 130, { r0: [14, 62], y: [-3.8, -1.0], s: [3, 7.5], cols: ['#8a86a8', '#9a92b0', '#7a7898', '#a89aaa'], pull: 1 });
  const storm = makeClouds(rng(65), 90, { r0: [12.5, 34], y: [2.4, 7.5], s: [2.2, 4.6], cols: ['#3c4466', '#464e72', '#343c5e', '#50567a'], pull: .8, grow: .3 });
  const canopy = makeClouds(rng(67), 28, { r0: [.6, 7], y: [5.4, 8.2], s: [1.5, 3.0], cols: ['#363e62', '#424a70', '#2e3658', '#4a5078'], pull: 1 });
  g.add(sea.mesh, storm.mesh, canopy.mesh); storm.mat.emissive.set('#1c2440'); canopy.mat.emissive.set('#1c2440'); sea.mat.emissive.set('#40405a');
  const ark = makeArk(rng(66)); ark.update(1000); ark.slitMat.opacity = 0; g.add(ark.group);
  const water = makeWater(false, Hf, waterLevel, waveAmp), rain = makeRain(); g.add(water.mesh, rain.group);
  const foam = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 56), new THREE.MeshBasicMaterial({ color: 0xc8d4e8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); foam.rotation.x = -Math.PI / 2; foam.renderOrder = 5; foam.frustumCulled = false; g.add(foam);

  // ---------------- the hatch in the roof ("the window of the ark")
  const hb = new GB(R), hw = .17;
  for (const [dx, dz, sx, sz] of [[0, -hw, hw * 2 + .06, .05], [0, hw, hw * 2 + .06, .05], [-hw, 0, .05, hw * 2], [hw, 0, .05, hw * 2]]) hb.box('#6a4a2a', [HATCH.x + dx, HATCH.y + .1, HATCH.z + dz], [sx, .2, sz], [0, 0, 0], .06);
  hb.box('#1a120a', [HATCH.x, HATCH.y + .04, HATCH.z], [hw * 2, .02, hw * 2], [0, 0, 0], 0);
  const hatchM = new THREE.Mesh(hb.build(), lam); hatchM.castShadow = true; hatchM.receiveShadow = true; ark.group.add(hatchM);
  const lidPivot = new THREE.Group(); lidPivot.position.set(HATCH.x + hw + .03, HATCH.y + .21, HATCH.z); ark.group.add(lidPivot);
  { const lb = new GB(R); lb.box('#8a6238', [-(hw + .03), .02, 0], [hw * 2 + .1, .035, hw * 2 + .08], [0, 0, 0], .06); lb.box('#3a2a1c', [-(hw + .03), .045, 0], [.03, .02, hw * 2 + .08], [0, 0, 0], .02); const m = new THREE.Mesh(lb.build(), lam); m.castShadow = true; lidPivot.add(m); }

  // ---------------- people: Noah at the hatch; the family leaves by the door
  const mk = (o, sc, name) => { const f = person(R, o, sc); f.group.name = name || ''; return f; };
  const addStaff = f => { const b = new GB(R); b.box('#5a3a20', [0, -.3, 0], [.04, 1.3, .04], [0, 0, 0], .05); b.add(G.ico0, '#4a2e18', [0, .36, 0], [.06, .06, .06], [0, 0, 0], .05); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; f.arms[1].add(m); return m; };
  const noahH = mk(NOAH, .5, 'noahHatch'); ark.group.add(noahH.group);
  const noah = mk(NOAH, .5, 'noah'), shem = mk(SONS.shem, .45, 'shem'), ham = mk(SONS.ham, .45, 'ham'), jap = mk(SONS.jap, .44, 'jap'), wN = mk(WIVES.noah, .46, 'wNoah'), wS = mk(WIVES.shem, .44, 'wShem'), wH = mk(WIVES.ham, .44, 'wHam'), wJ = mk(WIVES.jap, .43, 'wJap');
  addStaff(noah);
  const ALT = { x: -4.1, z: -3.4 };
  const FAM = [
    { f: noah, key: 'noah', tOut: 43.6, dest: [-2.3, -3.0, .6] }, { f: wN, key: 'wNoah', tOut: 44.5, dest: [-2.7, -3.9, .5] },
    { f: shem, key: 'shem', tOut: 45.4, dest: [-5.2, -3.9, 1.1] }, { f: wS, key: 'wShem', tOut: 46.2, dest: [-5.0, -2.7, 1.3] },
    { f: ham, key: 'ham', tOut: 47.0, dest: [-3.3, -2.3, 1.5] }, { f: wH, key: 'wHam', tOut: 47.8, dest: [-6.0, -3.2, 1.1] },
    { f: jap, key: 'jap', tOut: 48.6, dest: [-3.3, -4.5, -.2] }, { f: wJ, key: 'wJap', tOut: 49.4, dest: [-4.8, -4.6, .1] }];
  FAM.forEach(m => g.add(m.f.group));

  // ---------------- altar: three rough stones, a fire, a column of smoke
  const altB = [[0, .06, 0, .54, .12, .4], [.01, .18, 0, .4, .12, .3], [-.01, .29, .0, .28, .11, .22]], altStones = [];
  altB.forEach(([dx, y, dz, sx, sy, sz], i) => { const b = new GB(R); b.box(i === 2 ? '#8a8478' : '#9a9488', [0, 0, 0], [sx, sy, sz], [0, .1 * i, 0], .09); const m = new THREE.Mesh(b.build(), lam); m.castShadow = m.receiveShadow = true; m.position.set(ALT.x + dx, gy(ALT.x, ALT.z) - .02 + y, ALT.z + dz); g.add(m); altStones.push(m); });
  const altY = gy(ALT.x, ALT.z) - .02 + .36, flames = [];
  for (const [dx, h, c] of [[0, .34, 0xffa030], [.06, .24, 0xff6a20], [-.06, .22, 0xffd060], [.02, .16, 0xfff0a0]]) { const m = new THREE.Mesh(G.cone5, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); m.position.set(ALT.x + dx, altY, ALT.z); m.scale.set(.1, h, .1); g.add(m); flames.push({ m, h }); }
  const altGlow = spriteGlow(ALT.x, altY + .2, ALT.z, 1.5, 0xff9a40, 0); g.add(altGlow);
  const altL = new THREE.PointLight(0xff9a48, 0, 5, 1.6); altL.position.set(ALT.x, altY + .3, ALT.z + .3); g.add(altL);
  const NSM = 34, smokeMat = new THREE.MeshBasicMaterial({ color: 0xb4aca4, transparent: true, opacity: .5, depthWrite: false, toneMapped: false }), smoke = new THREE.InstancedMesh(G.ico0, smokeMat, NSM); smoke.frustumCulled = false; smoke.renderOrder = 4; g.add(smoke);
  const SMK = Array.from({ length: NSM }, () => ({ ph: R(), sp: .13 + R() * .06, dx: (R() - .5) * .3, dz: (R() - .5) * .3, sz: .09 + R() * .09 })), _o = new THREE.Object3D();

  // ---------------- trees and shrubs: they rise out of the water as it falls
  const trees = [];
  const tree = (x, z, s, kind, t0 = 0) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f', '#4f8a3a']); const m = new THREE.Mesh(geo, lam); const y = gy(x, z) - .02; m.position.set(x, y, z); m.castShadow = true; g.add(m); trees.push({ m, y, s, t0 }); return m; };
  [[-8.6, -5.4, 1.1, 'round'], [8.8, -5.9, 1.0, 'olive'], [-9.4, -7.4, .9, 'round'], [9.6, -7.6, 1.0, 'round'], [-6.2, -9.0, 1.1, 'pine'], [5.8, -9.1, 1.0, 'round'], [-2.6, -9.0, .9, 'olive'], [3.2, -9.2, 1.1, 'pine'],
    [-7.8, -2.6, 1.0, 'olive'], [6.6, -2.5, 1.0, 'round'], [8.4, -3.4, .8, 'olive'], [-9.0, -4.0, .9, 'round'],
    [-10.4, 3.2, 1.2, 'olive'], [-8.2, 5.4, 1.0, 'round'], [-3.0, 6.8, 1.1, 'round'], [2.2, 7.6, 1.2, 'olive'], [7.0, 6.2, 1.0, 'round'], [9.8, 2.6, 1.0, 'pine'], [-5.6, 3.4, .9, 'olive'], [4.8, 3.2, 1.0, 'round'], [0.4, 4.6, .8, 'olive'], [-1.4, 9.2, .9, 'round']].forEach(a => tree(...a));
  const OLIVE1 = [-10.2, 2.4];                                                                // the olive the dove returns from
  const oliveT = tree(OLIVE1[0], OLIVE1[1], 1.25, 'olive'); const OLIVE1Y = gy(OLIVE1[0], OLIVE1[1]);
  const sapl = (() => { const m = new THREE.Mesh(oliveGeo(1.1, R), lam); const x = 2.9, z = -2.4; m.position.set(x, gy(x, z) - .02, z); m.castShadow = true; g.add(m); return m; })();
  const sh = new GB(R); for (let k = 0; k < 34; k++) { const a = R() * TAU, r = 1 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Hf(x, z) > 2.6 && Hf(x, z) < 3.2 && Math.abs(z - ARK8.z) < 1.9 && Math.abs(x) < 8.4) continue; if (Math.hypot(x - ALT.x, z - ALT.z) < 1.2) continue; sh.add(G.ico0, pk(R, ['#7a766e', '#8a867c', '#6a665e', '#9a9488']), [x, gy(x, z) + .02, z], [.16 + R() * .12, .1 + R() * .08, .14 + R() * .1], [R() * 3, R() * 3, 0], .1); }
  g.add(new THREE.Mesh(sh.build(), lam));

  // ---------------- animals and birds
  const curveOf = pts => new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0, p[1])));
  const FD = FAMILY_DOOR;
  const KIND = {
    sheep: { sc: .6, v: 1.0, mk: i => makeQuad({ rn: rng(910 + i), len: .46, h: .24, w: .2, legL: .2, legW: .04, col: pk(rng(i * 7 + 3), ['#f1ece0', '#e8e0cf', '#d9cfb8', '#f6f2e8', '#6a5a4a']), col2: '#d8d0bc', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#3a2e26' }) },
    ox: { sc: .5, v: .85, mk: i => makeQuad({ rn: rng(940 + i), len: .88, h: .38, w: .3, legL: .38, legW: .075, col: pk(rng(i * 5 + 1), ['#8a5a38', '#7a4a2c', '#a8784a', '#5a3a28', '#b08a60']), col2: '#caa27a', neck: [.2, .9, .16], head: [.26, .18, .18], horns: true }) },
    camel: { sc: .42, v: .8, mk: i => makeQuad({ rn: rng(970 + i), len: 1.05, h: .42, w: .3, legL: .72, legW: .07, col: '#c89a5a', col2: '#a97c44', neck: [.62, .62, .12], head: [.26, .13, .12], hump: true, ears: false }) },
    donkey: { sc: .5, v: .9, mk: i => makeQuad({ rn: rng(980 + i), len: .78, h: .3, w: .22, legL: .42, legW: .05, col: '#8c8378', col2: '#d8d0c0', neck: [.26, .7, .1], head: [.26, .13, .1], ears: true }) },
    elephant: { sc: .36, v: .7, mk: i => buildWild('elephant', rng(990 + i)) },
    zebra: { sc: .45, v: .95, mk: i => buildWild('zebra', rng(995 + i)) },
    lion: { sc: .5, v: .9, mk: i => buildWild('lion', rng(997 + i)) },
  };
  const SEQ = ['ox', 'sheep', 'ox', 'sheep', 'elephant', 'sheep', 'ox', 'camel', 'sheep', 'ox', 'zebra', 'sheep', 'ox', 'lion', 'sheep', 'ox', 'donkey', 'sheep', 'ox'];
  // grazing places on the plateau in front of the ark, away from the ramp and the altar
  const slots = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 15; c++) { const x = -7.4 + c * 1.05 + (r % 2) * .5 + (R() - .5) * .35, z = -4.5 + r * 1.2 + (R() - .5) * .3; if (Math.hypot(x - ALT.x, z - ALT.z) < 1.5) continue; if (x > -.3 && x < 2.2 && z < -3.0) continue; if (Math.hypot(x - 2.9, z + 2.4) < .9) continue; slots.push([x, z]); }
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const animals = []; let ai = 0, si = 0;
  SEQ.forEach((kind, k) => { const K = KIND[kind], tF = 43.9 + k * .42; for (let j = 0; j < 2; j++) {
    const a = K.mk(ai++); a.group.scale.setScalar(K.sc * (.93 + .14 * R())); a.group.visible = false; g.add(a.group);
    const dst = slots[si++ % slots.length], jx = (j ? 1 : -1) * .16, path = curveOf([[FD.x + jx * .4, FD.zIn], [FD.x + jx * .5, FD.zDoor], [FD.x + jx, ARK8.z + 2.3], [FD.x + jx, FD.zEnd], [FD.x + jx + (dst[0] - FD.x) * .3, FD.zEnd + .15 + (dst[1] - FD.zEnd) * .25], dst]);
    animals.push({ a, K, path, L: path.getLength(), tF: tF + j * .5 / K.v, sd: R(), dst }); } });
  const BCOL = ['#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#bdb7a8', '#bdb7a8', '#bdb7a8', '#bdb7a8', '#5a6a8a', '#5a6a8a', '#d8a45a', '#d8a45a'];
  const flock = BCOL.map((c, i) => { const b = makeBird(rng(800 + i), c); b.group.scale.setScalar(.5 + .1 * R()); b.group.visible = false; g.add(b.group); return { ...b, ts: 45.6 + i * .32, r: 3.2 + R() * 3.4, h: 6.4 + R() * 3.2, w: (.22 + R() * .12) * (i % 2 ? 1 : -1), ph: R() * 6 }; });

  // raven and dove (taller than life on screen so they read from the wide shots), a leaf for the dove's beak
  const raven = makeBird(rng(850), '#1c1c26'); raven.group.scale.setScalar(1.0); raven.group.visible = false; g.add(raven.group);
  const dove = makeBird(rng(851), '#f8f5ee'); dove.group.scale.setScalar(1.0); dove.group.visible = false; g.add(dove.group);
  const dGlow = spriteGlow(0, 0, 0, .55, 0xfff2d0, .0); g.add(dGlow);
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(.5, 1, 4).translate(0, .5, 0), new THREE.MeshBasicMaterial({ color: 0x8fbf4a, toneMapped: false })); leaf.scale.set(.05, .13, .018); leaf.rotation.z = -Math.PI / 2 - .25; leaf.position.set(.31, .045, 0); dove.group.add(leaf);
  const leafHand = new THREE.Mesh(new THREE.ConeGeometry(.5, 1, 4).translate(0, .5, 0), new THREE.MeshBasicMaterial({ color: 0x8fbf4a, toneMapped: false })); leafHand.scale.set(.018, .045, .008); leafHand.visible = false; g.add(leafHand);
  const HAND = new THREE.Vector3(), SHO = new THREE.Vector3();
  const pt = (...a) => a.map(p => new THREE.Vector3(...p));
  // where the raised hand is once the ark has come to rest (Noah's hand at the hatch): the flights start and end there
  const HANDUP = new THREE.Vector3(); { ark.group.position.set(ARK8.x, AY0, ARK8.z); ark.group.rotation.set(0, ARK8.yaw, 0, 'YXZ'); pose(noahH, NOAH_LOCAL[0], NOAH_LOCAL[1], NOAH_LOCAL[2], -Math.PI / 2, { a1x: -1.35, a0x: -.1 }); ark.group.updateMatrixWorld(true); noahH.arms[1].localToWorld(HANDUP.set(0, -.44, 0)); }
  const H0 = HANDUP.toArray();
  const RAVEN = new THREE.CatmullRomCurve3(pt(H0, [2.4, 6.1, -8.2], [5.6, 6.7, -10.4], [9.0, 6.2, -10.0], [11.6, 6.6, -6.6], [12.4, 7.2, -2.0], [9.4, 7.4, 1.0], [5.0, 7.4, -1.2], [3.0, 6.6, -4.8], [6.8, 7.8, -9.6], [10.5, 8.6, -12.8], [15.0, 9.4, -17.0]));
  const DOVE1 = new THREE.CatmullRomCurve3(pt(H0, [2.5, 6.0, -8.0], [6.2, 6.4, -9.8], [10.0, 5.4, -7.4], [11.2, 4.6, -4.8], [9.6, 4.35, -3.0], [8.2, 4.5, -3.4], [10.4, 4.5, -4.2], [6.0, 4.9, -2.6], [2.2, 5.4, -4.6], H0));
  const DOVE2 = new THREE.CatmullRomCurve3(pt(H0, [-2.8, 6.2, -6.0], [-6.6, 5.5, -2.8], [-9.0, 4.8, .6], [-10.0, 3.9, 1.6], [-10.2, 3.5, 2.2], [-9.6, 4.4, 1.4], [-6.2, 5.2, -2.2], [-2.6, 5.5, -5.4], H0));
  const DOVE3 = new THREE.CatmullRomCurve3(pt(H0, [2.8, 6.0, -5.2], [5.4, 5.6, -.2], [9.0, 6.2, 5.4], [14.0, 7.4, 12.4], [22.0, 9.6, 25.4], [36.0, 12.0, 45.4]));
  function flyAlong(b, cur, u, t, fr = 18, amp = .72, gl = 0) {
    u = clamp(u); const p = cur.getPointAt(u), q = cur.getPointAt(Math.min(1, u + .008)), dx = q.x - p.x, dz = q.z - p.z, dy = q.y - p.y;
    b.group.position.copy(p); b.group.rotation.set(0, Math.atan2(-dz, dx), Math.atan2(dy, Math.hypot(dx, dz) + 1e-6) * .7 + .06 * Math.sin(t * 1.9), 'XYZ'); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * fr + k * .1) * amp * (1 - gl * .5));
  }

  // ---------------- lights, motes, shafts of light
  const arkL = new THREE.PointLight(0xffb868, 0, 7, 1.4); g.add(arkL);
  const motes = makeMotes({ n: 90, area: [14, 5, 10], size: .05, v: .16, seed: 72, color: 0xffdd90 }); g.add(motes.mesh);
  const SHAFTS = [[-6.0, -2.0], [5.0, -1.0], [9.0, -5.0], [-1.0, 3.5]].map(([x, z]) => { const s = shaft(16, .9, 2.4, [1, .84, .5], 1, .3); s.position.set(x, gy(x, z), z); s.visible = false; g.add(s); return s; });

  // ---------------- state
  function arkState(t) {
    const L = waterLevel(t), u = clamp(t / TREST), e = 1 - Math.pow(1 - u, 2.2), rest = AY0, fl = clamp((L - .6 - rest) / .45);
    const lur = t > 12.1 ? Math.exp(-(t - 12.1) * 1.9) * Math.sin((t - 12.1) * 6.5) : 0;
    return { x: lerp(P0.x, ARK8.x, e), z: lerp(P0.z, ARK8.z, e), yaw: lerp(P0.yaw, ARK8.yaw, e), y: Math.max(L - .6, rest) + Math.sin(t * .9) * .035 * fl, roll: Math.sin(t * .7 + 1) * .035 * fl + lur * .03, pitch: Math.sin(t * .55) * .022 * fl + lur * .022, L, float: fl };
  }
  const rampY = z => AY0 + .41 * (1 - seg(z, FD.zDoor + .1 - 0, FD.zEnd)) * 1;
  function update(t, cam, o = {}) {
    const st = arkState(t), L = st.L;
    ark.group.position.set(st.x, st.y, st.z); ark.group.rotation.set(st.pitch, st.yaw, st.roll, 'YXZ');
    ark.setDoor(1.5 * ease.inOutSine(seg(t, 41.4, 43.2)));
    lidPivot.rotation.z = -1.9 * ease.inOutSine(seg(t, 17.4, 18.6)) * (1 - ease.inOutSine(seg(t, 38.5, 39.6)));
    // ---- water, rain
    water.set(t, { opf: (tt, LL) => smooth(-.3, .25, LL) });
    const cp = cam && cam.position, Tg = cam && cam.userData.T, Wd = (cam && cam.userData.W) || 8;
    const rk = 1 - smooth(1.5, 7.0, t); rain.group.visible = rk > .01; if (rk > .01) rain.update(t, rk, Tg, Wd, L, 1);
    foam.visible = st.float > .01 || L > AY0 - .3; foam.position.set(st.x, L + .035, st.z); foam.rotation.set(-Math.PI / 2, 0, -st.yaw); foam.scale.set(1.55, 8.0, 1); foam.material.opacity = .3 * smooth(AY0 - .2, AY0 + .4, L);
    // ---- sky: the storm thins out and the light comes through
    const clearing = smooth(1.0, 10.0, t), lift = Math.min(Math.max(0, L - .4) * 1.02, 11.5);
    const clr = 26 * smooth(1, 8, t); storm.update(t, .6 * (1 - clearing) + .1, 1 - smooth(1.0, 7.0, t), null, lift, cp, 14, Tg, clr);
    canopy.mesh.position.set(st.x - .5, 0, st.z); canopy.update(t, 0, (1 - smooth(0, 7, t)) * .9, null, lift, cp, 10, Tg, clr);
    const sv = smooth(36, 42, t); sea.mesh.visible = sv > .01; sea.update(t, 0, sv, null, 0, cp, 16, Tg); far.visible = t > 14.1; far.scale.set(1, Math.max(.001, smooth(14.2, 18.5, t)), 1);
    { const w = smooth(6, 14, t), c = lerp(1, 1.9, w); storm.mat.color.setRGB(c, c * .98, c * .94); storm.mat.emissive.set(w < .5 ? '#1c2440' : '#4a3a38'); canopy.mat.emissive.set('#1c2440'); }
    // ---- trees rise from the water as it falls
    trees.forEach(({ m, y, s }) => { const k = smooth(-.15, .55, y - L); m.visible = k > .01; m.scale.setScalar(Math.max(.001, k)); });
    sapl.scale.setScalar(Math.max(.001, ease.outCubic(seg(t, 51.4, 57.6))) * 1.0);
    // ---- altar: stones laid, fire, smoke, light
    altStones.forEach((m, i) => { const k = ease.outBack(seg(t, 47.4 + i * .8, 47.9 + i * .8)); m.scale.setScalar(Math.max(.001, k)); });
    const fire = smooth(50.0, 50.8, t), fk = flick(t, 1);
    flames.forEach(({ m, h }, j) => { m.visible = fire > .01; m.scale.set(.1 * fire, h * fire * (.75 + .5 * flick(t + j * .8, 1 + j * .05)), .1 * fire); m.rotation.y = t * 3 + j; });
    altGlow.material.opacity = .5 * fire * fk; altL.intensity = 1.6 * fire * fk;
    SMK.forEach((p, i) => { const u = ((t * p.sp + p.ph) % 1 + 1) % 1, on = fire * smooth(0, .06, u) * (1 - smooth(.7, 1, u)); const H = 9.0 * u, sc = (p.sz + u * .55) * on; _o.position.set(ALT.x + p.dx * (1 + u * 2) + u * u * 3.0 + Math.sin(u * 7 + p.ph * 6) * .12 * u, altY + .2 + H, ALT.z + p.dz * (1 + u * 2) - u * u * 1.4); _o.scale.set(sc, sc * .8, sc); _o.rotation.set(0, i, 0); _o.updateMatrix(); smoke.setMatrixAt(i, _o.matrix); });
    smoke.instanceMatrix.needsUpdate = true; smokeMat.opacity = .42 * smooth(50.2, 52, t) * (1 - .4 * smooth(56, 60, t));
    // ---- motes and shafts
    motes.update(t, smooth(48, 53, t) * .8 + smooth(33, 36, t) * (1 - smooth(37, 40, t)) * .5, [0, 3, -3]);
    SHAFTS.forEach((s, i) => { const k = smooth(51.5 + i * .5, 54.5 + i * .5, t); s.visible = k > .01; s.material.opacity = .16 * k; });
    ark.group.updateMatrixWorld(true);

    // ---- Noah at the hatch, the raven and the dove
    const nUp = ease.inOutSine(seg(t, 17.9, 18.9)) * (1 - ease.inOutSine(seg(t, 38.4, 39.4)));
    noahH.group.visible = nUp > .01;
    const look = t < 22 ? Math.sin(t * .8) * .08 : t < 27 ? -.35 + .1 * Math.sin(t * 1.1) : t < 33 ? .35 * Math.sin(seg(t, 27, 33) * 3.14) + .1 : .15 * Math.sin(t * .7);
    // arm: raised toward the dove during its return and when it is released
    const tr1 = ease.inOutSine(seg(t, 22.2, 22.8)) * (1 - ease.inOutSine(seg(t, 23.0, 23.4))), ta1 = ease.inOutSine(seg(t, 25.4, 26.0)) * (1 - ease.inOutSine(seg(t, 26.8, 27.4)));
    const tr2 = ease.inOutSine(seg(t, 27.4, 27.9)) * (1 - ease.inOutSine(seg(t, 28.1, 28.5))), ta2 = ease.inOutSine(seg(t, 31.6, 32.2)) * (1 - ease.inOutSine(seg(t, 34.6, 35.4)));
    const tr3 = ease.inOutSine(seg(t, 36.1, 36.6)) * (1 - ease.inOutSine(seg(t, 36.8, 37.4)));
    const arm = Math.max(tr1, ta1, tr2, ta2, tr3), rav = ease.inOutSine(seg(t, 19.0, 19.5)) * (1 - ease.inOutSine(seg(t, 19.7, 20.2)));
    pose(noahH, NOAH_LOCAL[0], NOAH_LOCAL[1] + (1 - nUp) * -.25, NOAH_LOCAL[2], -Math.PI / 2 + look, { a1x: -1.25 * Math.max(arm, rav * .8) - .1, a0x: -.1 - .15 * Math.sin(t * 1.3), lx: .04 * Math.sin(t * 1.1) });
    noahH.group.updateMatrixWorld(true); noahH.arms[1].localToWorld(HAND.set(0, -.44, 0)); noahH.group.localToWorld(SHO.set(0, 1.12, .1));
    // raven (one flight, to and fro, then away)
    { const u = (t - 19.7) / 9.5; raven.group.visible = u > 0 && u < 1; if (raven.group.visible) { if (u < .03) raven.group.position.copy(HAND); else flyAlong(raven, RAVEN, ease.inOutSine(u) * .5 + u * .5, t, 14, .8); } }
    // dove: three flights
    let dvis = false, dp = null, holding = false, glide = 0;
    const d1 = (t - 22.7) / 3.8, d2 = (t - 27.9) / 4.55, d3 = (t - 36.5) / 4.6;
    if (d1 > 0 && d1 < 1) { dvis = true; flyAlong(dove, DOVE1, d1, t, 18, .75); }
    else if (d2 > 0 && d2 < 1) { dvis = true; flyAlong(dove, DOVE2, d2, t, 18, .75); }
    else if (d3 > 0 && d3 < 1) { dvis = true; flyAlong(dove, DOVE3, d3, t, 17, .72, .1); }
    else if ((t >= 22.1 && t <= 22.7) || (t >= 27.3 && t <= 27.9) || (t >= 36.0 && t <= 36.5)) { dvis = true; holding = true; }
    else if (t > 26.3 && t < 27.3) { dvis = true; holding = true; }
    else if (t > 32.5 && t < 35.6) { dvis = true; holding = true; }
    if (holding) { dove.group.position.set(HAND.x, HAND.y + .055, HAND.z); dove.group.rotation.set(0, -Math.PI / 2 + look + .3, 0); dove.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * (.12 + .04 * Math.sin(t * 2.3))); }
    dove.group.visible = dvis; dGlow.visible = dvis; if (dvis) { dGlow.position.copy(dove.group.position); dGlow.material.opacity = .55 * (holding ? .5 : 1); }
    // the leaf: in the dove's beak on the return (d2 > .52) and while it is held at the end of the second return
    leaf.visible = (d2 > .5 && d2 < 1) || (t > 32.4 && t < 35.6);
    leafHand.visible = false;

    // ---- the family walks out
    FAM.forEach((m, idx) => {
      const { f, key, tOut, dest } = m, t1 = tOut + 2.3, t2 = t1 + 2.4; f.group.visible = t >= tOut - .05;
      if (t < tOut - .05) return;
      let x, z, y, ry, o2 = {}, mv = true;
      if (t < t1) { const u = seg(t, tOut, t1); x = FD.x; z = lerp(FD.zIn, FD.zEnd, u); y = rampY(z); ry = Math.PI / 2 * 0 + 0; ry = 0; }
      else if (t < t2) { const u = ease.inOutSine(seg(t, t1, t2)); x = lerp(FD.x, dest[0], u); z = lerp(FD.zEnd, dest[1], u); y = gy(x, z) - .02; ry = Math.atan2(dest[0] - FD.x, dest[1] - FD.zEnd); }
      else { x = dest[0]; z = dest[1]; y = gy(x, z) - .02; ry = dest[2]; mv = false; }
      if (mv) { const w = Math.sin(t * 6.5 + idx); Object.assign(o2, { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02 }); } else o2 = { lx: .03 * Math.sin(t * 1.1 + idx) };
      // Noah raises his hands at the altar
      if (key === 'noah' && !mv) { const up = ease.inOutSine(seg(t, 50.4, 51.2)); o2.a0x = -2.4 * up; o2.a1x = -2.4 * up; }
      // stones: the four men face the altar and stoop as they lay them
      if (!mv && ['noah', 'shem', 'ham', 'jap'].includes(key)) { const bend = Math.sin(seg(t, 46.8, 50.0) * 12 + idx) * .5 + .5, laying = seg(t, 46.6, 49.8) > 0 && seg(t, 46.6, 49.8) < 1; if (laying) o2.lx = .2 * bend; }
      pose(f, x, y + (o2.hop || 0), z, ry, o2);
      if (!mv && ['noah', 'shem', 'ham', 'jap'].includes(key) && t > 46.5) { const ang = Math.atan2(ALT.x - x, ALT.z - z); f.group.rotation.y = lerp(ry, ang, smooth(46.5, 48, t)); }
    });
    // ---- the animals
    animals.forEach(({ a, K, path, L: Ls, tF, sd, dst }) => {
      const s = (t - tF) * K.v, vis = s > 0; a.group.visible = vis; if (!vis) return;
      const u = clamp(s / Ls), p = path.getPointAt(u), q = path.getPointAt(Math.min(1, u + .01)), moving = u < 1;
      const x = p.x, z = p.z, y = (z > FD.zDoor - .3 && z < FD.zEnd + .1 && Math.abs(x - FD.x) < .5) ? rampY(z) : (z < FD.zDoor - .3 ? AY0 + .41 : gy(x, z) - .02);
      a.group.position.set(x, y + (moving ? Math.abs(Math.sin(t * 5.5 + sd * 6)) * .01 : 0), z);
      const ry = moving ? Math.atan2(-(q.z - p.z), q.x - p.x) : -.9 + sd * 1.8 + .08 * Math.sin(t * .6 + sd * 5);
      a.group.rotation.y = ry; if (a.legs) { if (moving) walkLegs(a.legs, t * (1 + sd * .2) + sd * 3, 5.5, .42); else a.legs.forEach(l => l.rotation.z = 0); }
    });
    // ---- the flock: out of the door, then wheeling over the renewed land
    flock.forEach((b, i) => {
      const u = seg(t, b.ts, b.ts + 2.4), a = t * b.w + b.ph, cx = -.5, cz = -2.6, ox = cx + Math.cos(a) * b.r, oz = cz + Math.sin(a) * b.r * .7, oy = b.h + Math.sin(t * .6 + i) * .4;
      const sx = FD.x, sy = AY0 + .8, sz = FD.zDoor, e = ease.inOutSine(u), x = lerp(sx, ox, e), y = lerp(sy, oy, e), z = lerp(sz, oz, e), vis = t >= b.ts; b.group.visible = vis; if (!vis) return;
      b.group.position.set(x, y, z); const nx = cx + Math.cos(a + .05 * Math.sign(b.w)) * b.r, nz = cz + Math.sin(a + .05 * Math.sign(b.w)) * b.r * .7;
      b.group.rotation.set(0, u < 1 ? Math.atan2(-(oz - sz), ox - sx) : Math.atan2(-(nz - oz), nx - ox), -.12 * Math.sin(t * 1.4 + i)); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6);
    });
  }
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    D(0, '#46547a', '#1c2236', .9, '#c4cce4', 1.1, [-10, 6, 6], .5, '#6a7cff', [10, 6, -8], 14),
    D(6, '#5a6a98', '#262a42', 1.0, '#ffc490', 1.8, [-12, 4.5, 5], .5, '#6a7cff', [10, 6, -8], 14),
    D(12, '#6878a8', '#3a3040', 1.0, '#ffd8a0', 2.1, [-12, 5, 6], .45, '#7a8cff', [10, 6, -8], 13),
    D(22, '#7c8cb8', '#403f3c', 1.05, '#ffe2b4', 2.2, [-9, 8, 5], .4, '#8a9cff', [10, 6, -8], 12),
    D(27, '#7480ae', '#40383c', 1.0, '#ffb878', 2.2, [-14, 3.6, 4], .4, '#8a96ff', [10, 6, -8], 12),
    D(33, '#5a5a88', '#38304a', .92, '#ff9a58', 1.9, [-14, 2.4, 3], .4, '#8a96ff', [10, 6, -8], 12),
    D(36.2, '#6c7ca8', '#403c44', 1.0, '#ffe0b0', 2.0, [12, 4.6, 5], .4, '#8a9cff', [-10, 6, -8], 12),
    D(42, '#7c8cb8', '#403f3c', 1.05, '#fff0d0', 2.3, [-8, 9, 6], .4, '#8a9cff', [10, 6, -8], 12),
    D(51, '#7480ae', '#3c3840', 1.0, '#ffc680', 2.2, [-12, 3.8, 4], .42, '#8a96ff', [10, 6, -8], 12),
    D(60, '#7480ae', '#3c3840', 1.0, '#ffc680', 2.1, [-12, 3.6, 4], .42, '#8a96ff', [10, 6, -8], 12)];
  const bg = [[0, ['#10163a', '#4a4a6a']], [6, ['#1a2450', '#a8806a']], [12, ['#2a3c78', '#e0a878']], [22, ['#3a5a98', '#c9b090']], [28, ['#2a3470', '#e89a60']], [34, ['#1c2454', '#d88868']], [37, ['#2a4a8a', '#e8b888']], [44, ['#3a64a8', '#d8c8a0']], [52, ['#2a3a78', '#f0a868']], [60, ['#2a3a78', '#f0a868']]];
  return { group: g, far, update, light, bg, ark, water, arkState, AY0, ALT, HAND, SHO, dove, raven, noahH, FAM, animals, flock, leaf, curves: { RAVEN, DOVE1, DOVE2, DOVE3 }, H0 };
}
