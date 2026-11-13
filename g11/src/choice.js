// Episode 6, 1:00-1:20: the present-day choice. One miniature world, two paths, one person at the fork.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease } from './util.js';
import { pk, tri, roundTreeGeo, pineGeo, makeMotes } from './props.js';
import { makeClouds, underRock, TAU } from './terrain6.js';
import { LK } from './lights.js';

export const VT = { fork: 60, dawn: 79.4, end: 83.0 };
const RC = 9.8;

// ---------------- the two ways
const curve = pts => new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)));
const WALK = curve([[0, 2.0], [0, 1.2], [1.0, .1], [2.3, -1.5], [3.1, -3.3], [3.5, -5.3], [4.2, -7.3]]);
const TRUNK = curve([[0, 9.6], [0, 6.0], [0, 3.2], [0, 1.2]]);
const LEFT = curve([[0, 1.2], [-1.0, .1], [-2.4, -1.4], [-3.4, -3.2], [-4.2, -5.2], [-5.0, -7.0]]);
const RIGHT = curve([[0, 1.2], [1.0, .1], [2.3, -1.5], [3.1, -3.3], [3.5, -5.3], [4.2, -7.3]]);
const SP = c => c.getSpacedPoints(70);
const TP = SP(TRUNK), LPT = SP(LEFT), RPT = SP(RIGHT);
const dP = (P, x, z) => { let d = 1e9; for (const p of P) { const q = Math.hypot(p.x - x, p.z - z); if (q < d) d = q; } return d; };
const hills = (x, z) => {
  let h = .1; const a = Math.hypot(x - 4.5, (z + 7.8) * .85) / 4.9; if (a < 1) h = Math.max(h, 2.1 * Math.pow(1 - a, 1.25));
  const b = Math.hypot(x + 5.4, z + 6.6) / 4.4; if (b < 1) h = Math.max(h, 1.35 * Math.pow(1 - b, 1.1) * (.7 + .55 * Math.abs(Math.sin(x * 2.7 + z * 1.9))));
  return h;
};
export function Hc(x, z) {
  const r = Math.hypot(x, z), dp = Math.min(dP(TP, x, z), dP(LPT, x, z), dP(RPT, x, z));
  const noise = (.1 * Math.sin(x * .9 + 1) * Math.cos(z * .8) + .06 * Math.sin(x * 2.1 + z * 1.7)) * smooth(.5, 1.6, dp);
  return Math.max(.03, (hills(x, z) + noise) * (1 - smooth(RC - 2.2, RC - .1, r)) + .03);
}
const C = c => new THREE.Color(c);
function gcol(x, y, z, slope) {
  const side = smooth(-2.6, 2.6, x); let b = C('#4a4650').lerp(C('#5b7541'), side);
  b.lerp(C('#6a695a'), .75 * smooth(1.2, 4.2, z));
  const dT = dP(TP, x, z), dL = dP(LPT, x, z), dR = dP(RPT, x, z);
  if (Math.hypot(x, z - 1.2) < 1.35) b.lerp(C('#a89c86'), .85);
  if (dT < .52) b.lerp(C('#b3a68a'), .9); if (dR < .52) b.lerp(C('#e0c98e'), .92); if (dL < .55) b.lerp(C('#120e16'), .95);
  if (slope > .26 || y > 1.5) b.lerp(C(x < 0 ? '#2a282e' : '#807c6e'), clamp((slope - .22) * 2.4 + (y - 1.2) * .2));
  if (Math.hypot(x, z) > RC - 1.0) b.lerp(C('#5a4a38'), .7);
  return b.getHex();
}
function terrain(rn) {
  const rings = 44, segs = 104, V = [];
  for (let i = 0; i <= rings; i++) { const row = []; for (let j = 0; j < segs; j++) {
    let r = i / rings * RC, a = j / segs * TAU; if (i > 0 && i < rings) { r += (rn() - .5) * .4 * (RC / rings); a += (rn() - .5) * .55 * TAU / segs; }
    const x = Math.cos(a) * r, z = Math.sin(a) * r; row.push([x, Hc(x, z), z]); } V.push(row); }
  const gb = new GB(rn), A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3();
  const put = (p, q, r) => {
    A.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); B.set(r[0] - p[0], r[1] - p[1], r[2] - p[2]); Cc.crossVectors(A, B);
    if (Cc.y < 0) { const t = q; q = r; r = t; Cc.negate(); } Cc.normalize();
    tri(gb, p, q, r, gcol((p[0] + q[0] + r[0]) / 3, (p[1] + q[1] + r[1]) / 3, (p[2] + q[2] + r[2]) / 3, 1 - Cc.y), .07);
  };
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs, a = V[i][j], b = V[i][j1], c = V[i + 1][j1], d = V[i + 1][j];
    if (i === 0) put(V[0][0], d, c); else if ((i + j) & 1) { put(a, b, c); put(a, c, d); } else { put(a, b, d); put(b, c, d); }
  }
  const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; m.frustumCulled = false; return m;
}
const gy = (x, z) => Hc(x, z) + .02;

// ---------------- the walker: a present-day person (jacket, trousers, backpack)
export function makeWalker() {
  const g = new THREE.Group(), R = rng(77), b = new GB(R), jacket = '#d3cbbb', jacket2 = '#b3a894', trou = '#27324c', shoe = '#17171f', skin = '#c98d62', hair = '#2a1a10';
  b.box(jacket, [0, .75, 0], [.36, .46, .2], [0, 0, 0], .04); b.box(jacket2, [0, .54, 0], [.38, .1, .22], [0, 0, 0], .04);
  b.box(jacket2, [0, 1.0, -.07], [.26, .1, .12], [0, 0, 0], .04);
  b.box('#7b5a3a', [0, .78, -.17], [.27, .34, .13], [0, 0, 0], .05); b.box('#5a4028', [0, .94, -.17], [.2, .06, .14], [0, 0, 0], .04);
  b.add(G.cyl6, skin, [0, .98, 0], [.04, .07, .04], [0, 0, 0], .02); b.add(G.ico1, skin, [0, 1.12, 0], [.105, .118, .105], [0, 0, 0], .05); b.add(G.ico0, hair, [0, 1.17, -.02], [.112, .08, .118], [0, 0, 0], .06);
  const body = new THREE.Mesh(b.build(), lam); body.castShadow = true; g.add(body);
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const l = new GB(R); l.box(trou, [0, -.23, 0], [.125, .5, .135], [0, 0, 0], .04); l.box(shoe, [0, -.5, .04], [.135, .08, .22], [0, 0, 0], .03);
    const m = new THREE.Mesh(l.build(), lam); m.castShadow = true; m.position.set(.078 * s, .5, 0); g.add(m); legs.push(m);
    const a = new GB(R); a.box(jacket, [0, -.18, 0], [.085, .38, .085], [0, 0, 0], .04); a.add(G.ico0, skin, [0, -.4, 0], [.042, .042, .042], [0, 0, 0], .03);
    const am = new THREE.Mesh(a.build(), lam); am.castShadow = true; am.position.set(.215 * s, .94, 0); g.add(am); arms.push(am);
  }
  g.scale.setScalar(1.1); return { group: g, legs, arms };
}

export function makeChoice() {
  const out = {};
  const R = rng(9090), g = new THREE.Group();
  g.add(terrain(rng(91)), underRock(rng(92), RC));
  const sea = makeClouds(rng(93), 120, { r0: [12, 60], y: [-3.8, -1.0], s: [3, 7.5], cols: ['#5a5480', '#6e6088', '#7c6a88', '#4a4a74', '#8a7288'], pull: 1 });
  g.add(sea.mesh);
  const smokeCloud = makeClouds(rng(94), 16, { r0: [.4, 2.6], y: [0, .9], s: [1.1, 2.1], cols: ['#26283c', '#2e3048', '#1e2036', '#3a2c3c'], pull: 1 }); smokeCloud.mesh.position.set(-5.0, 4.6, -3.2); g.add(smokeCloud.mesh);

  // --- present-day skyline across the back, with a gap where the light rises
  const city = new GB(R), wins = new GB(R);
  for (let i = 0; i < 17; i++) {
    const th = lerp(.1, Math.PI - .1, i / 16); if (th > .92 && th < 1.36) continue;
    const r = 8.2 + R() * .9, x = Math.cos(th) * r, z = -Math.sin(th) * r * .97 + .3, w = .75 + R() * .7, d = .8 + R() * .6, h = 1.5 + Math.pow(Math.sin(th), 1.5) * 2.5 + R() * 1.1, y0 = gy(x, z) - .05;
    const warm = smooth(-5, 7, x), col = C(pk(R, ['#2b3250', '#343b58', '#3b3f5e'])).lerp(C(pk(R, ['#7a6c74', '#8a7a7c', '#6e6676'])), warm).getHex();
    city.box(col, [x, y0 + h / 2, z], [w, h, d], [0, 0, 0], .06);
    city.box(col, [x + .06, y0 + h + .22, z - .04], [w * .62, .44, d * .62], [0, 0, 0], .06);
    if (i % 3 === 0) city.box('#4a4a5a', [x, y0 + h + .75, z], [.04, .9, .04], [0, 0, 0], .02);
    for (let ry = .5; ry < h - .2; ry += .44) for (let cx = -w / 2 + .17; cx < w / 2 - .1; cx += .3) if (R() < .06 + .2 * warm) wins.box(warm > .5 ? '#f2c47c' : '#aab8e8', [x + cx, y0 + ry, z + d / 2 + .012], [.11, .17, .01], [0, 0, 0], .02);
  }
  { const m = new THREE.Mesh(city.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); g.add(new THREE.Mesh(wins.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }))); }

  // --- the way of harm (left): ash, thorns, dead trees, a smouldering fire
  const L = new GB(R), emb = new GB(R);
  const dead = (x, z, s) => { const y = gy(x, z) - .02; L.box('#2a2420', [x, y + .5 * s, z], [.08 * s, 1.0 * s, .08 * s], [.05, 0, .08], .1); for (let k = 0; k < 5; k++) { const a = R() * TAU; L.box('#2a2420', [x + Math.cos(a) * .15 * s, y + (.5 + .13 * k) * s, z + Math.sin(a) * .15 * s], [.04 * s, .55 * s, .04 * s], [Math.sin(a) * .9, 0, -Math.cos(a) * .9], .1); } };
  [[-1.5, 3.2, 1.1], [-3.4, 1.6, 1.0], [-5.6, 0.4, 1.2], [-2.4, -3.4, 1.0], [-6.4, -2.6, 1.2], [-1.0, -5.0, .9], [-7.0, -4.8, 1.0], [-3.6, 4.6, .9]].forEach(a => dead(...a));
  const thorn = (x, z, s) => { const y = gy(x, z) - .02; for (let k = 0; k < 9; k++) { const a = R() * TAU, e = .5 + R() * .7; L.add(G.cone5, '#1d1a1f', [x + Math.cos(a) * .12 * s, y + .04, z + Math.sin(a) * .12 * s], [.05 * s, (.4 + R() * .45) * s, .05 * s], [Math.sin(a) * e, 0, -Math.cos(a) * e], .08); } };
  [[-1.8, 0.9], [-1.2, -1.6], [-2.9, -2.2], [-4.4, -3.2], [-3.0, -4.6], [-5.2, -5.8], [-2.2, 2.0], [-4.8, -1.0]].forEach(([x, z]) => thorn(x, z, 1.2));
  for (let k = 0; k < 26; k++) { const a = R() * TAU, r = 1.5 + R() * 7; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > -.8 || Math.hypot(x, z) > RC - 1) continue; if (dP(LPT, x, z) < .5) continue; L.add(G.oct, pk(R, ['#26242a', '#302d34', '#1f1d24']), [x, gy(x, z) + .1, z], [.16 + R() * .3, .2 + R() * .5, .16 + R() * .3], [R() * 3, R() * 3, R() * 3], .1); }
  for (let k = 0; k < 34; k++) { const u = R(), p = LEFT.getPointAt(u), a = R() * TAU, off = .4 + R() * .25; L.add(G.ico0, '#2c2830', [p.x + Math.cos(a) * off, gy(p.x, p.z) + .04, p.z + Math.sin(a) * off], [.1 + R() * .1, .06, .09], [R(), R(), 0], .1); emb.add(G.tet, '#ff7a28', [p.x + Math.cos(a + 1) * (.15 + R() * .3), gy(p.x, p.z) + .035, p.z + Math.sin(a + 1) * .3], [.03, .03, .03], [R(), R(), 0], 0); }
  // broken railing along the harmful way
  for (let k = 0; k < 7; k++) { const u = .16 + k * .09, p = LEFT.getPointAt(u), q = LEFT.getPointAt(Math.min(1, u + .02)), nx = -(q.z - p.z), nz = q.x - p.x, nn = Math.hypot(nx, nz) || 1, x = p.x - nx / nn * .75, z = p.z - nz / nn * .75; if (k === 3 || k === 5) continue; L.box('#4a3a30', [x, gy(x, z) + .22, z], [.06, .44, .06], [0, 0, k === 4 ? .6 : 0], .08); }
  { const m = new THREE.Mesh(L.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); g.add(new THREE.Mesh(emb.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }))); }
  // smouldering fire at the roadside
  const FX = -2.9, FZ = -.2, fy = gy(FX, FZ), flames = [];
  for (const [dx, h, c, s] of [[0, .5, 0xff9a2e, 1], [.1, .36, 0xff6a20, .9], [-.1, .32, 0xffd060, .8]]) { const m = new THREE.Mesh(G.cone5, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); m.scale.set(.16 * s, h, .16 * s); m.position.set(FX + dx, fy + h / 2, FZ); g.add(m); flames.push({ m, h, dx }); }
  const fireGl = spriteGlow(FX, fy + .4, FZ, 2.4, 0xff7a30, .42); g.add(fireGl);
  const leftL = new THREE.PointLight(0xff6a2a, 0, 7.5, 1.6); leftL.position.set(FX, fy + .8, FZ + .3); g.add(leftL);
  const glowLow = spriteGlow(-5.0, 3.6, -3.2, 5.2, 0xff4a28, .2); g.add(glowLow);
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0x2a2a34, transparent: true, opacity: .5, depthWrite: false, toneMapped: false }), NSM = 30, smoke = new THREE.InstancedMesh(G.ico0, smokeMat, NSM); smoke.frustumCulled = false; g.add(smoke);
  const SMK = Array.from({ length: NSM }, () => ({ ph: R(), sp: .3 + R() * .2, dx: (R() - .5) * .5, sz: .45 + R() * .4 })); const _o = new THREE.Object3D();

  // --- the way of integrity (right): warm stones, green trees, lamps, a gateway of light
  const Rg = new GB(R), glow = new GB(R);
  for (let k = 0; k < 20; k++) { const u = .03 + k * .047, p = RIGHT.getPointAt(Math.min(1, u)), a = R() * .6 - .3; Rg.add(G.ico0, pk(R, ['#efe2b8', '#e4d3a0', '#f3e9c8']), [p.x + (R() - .5) * .22, gy(p.x, p.z) + .035, p.z + (R() - .5) * .22], [.2, .05, .15], [0, a, 0], .06); }
  for (let k = 0; k < 8; k++) { const u = .06 + k * .04, p = TRUNK.getPointAt(Math.min(1, u * 2)), a = R() * .6 - .3; Rg.add(G.ico0, '#cbbf9e', [p.x + (R() - .5) * .3, gy(p.x, p.z) + .03, p.z], [.2, .045, .15], [0, a, 0], .06); }
  const lamp = (x, z, s = 1) => { const y = gy(x, z) - .02; Rg.box('#3a3a44', [x, y + .5 * s, z], [.05, 1.0 * s, .05], [0, 0, 0], .04); Rg.box('#3a3a44', [x, y + 1.02 * s, z], [.16, .05, .16], [0, 0, 0], .04); glow.box('#ffd98a', [x, y + .94 * s, z], [.11, .16, .11], [0, 0, 0], 0); const gl = spriteGlow(x, y + .95 * s, z, 1.4, 0xffc070, .5); g.add(gl); return gl; };
  const lamps = [lamp(.95, -.1), lamp(2.9, -2.4), lamp(4.0, -4.9), lamp(1.2, 3.2, .9)];
  for (let k = 0; k < 46; k++) { const u = R() * .95, p = RIGHT.getPointAt(u), a = R() * TAU, off = .55 + R() * .9, x = p.x + Math.cos(a) * off, z = p.z + Math.sin(a) * off; if (x < .4) continue; Rg.box(pk(R, ['#f2c24b', '#f4ebd6', '#e8956a', '#f2c24b']), [x, gy(x, z) + .07, z], [.06, .12, .06], [0, R(), 0], .05); }
  { const m = new THREE.Mesh(Rg.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); g.add(new THREE.Mesh(glow.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }))); }
  [[2.2, 3.2, 1.2], [5.6, 2.0, 1.3], [6.8, -1.2, 1.2], [6.3, -4.4, 1.1], [1.6, -3.8, .95], [7.2, 3.4, 1.0], [2.9, 6.2, 1.0], [5.0, 5.4, 1.1], [-6.4, 4.8, 1.0]].forEach(([x, z, s]) => { const m = new THREE.Mesh(roundTreeGeo(s, R, ['#4f7a3e', '#456c37', '#5a8446', '#4c7440']), lam); m.position.set(x, gy(x, z) - .02, z); m.castShadow = true; g.add(m); });
  [[6.0, -6.0, 1.2], [2.0, -6.5, 1.0], [7.6, -3.0, 1.1]].forEach(([x, z, s]) => { const m = new THREE.Mesh(pineGeo(s, R), lam); m.position.set(x, gy(x, z) - .02, z); m.castShadow = true; g.add(m); });
  // the gateway at the hill crest
  const GX = 4.2, GZ = -7.3, gyc = gy(GX, GZ);
  { const gb = new GB(R); for (const s of [-1, 1]) { gb.box('#d9ccaa', [GX + s * .55, gyc + .55, GZ], [.2, 1.1, .2], [0, 0, 0], .05); gb.box('#c9bc9a', [GX + s * .55, gyc + 1.14, GZ], [.28, .1, .28], [0, 0, 0], .05); } gb.box('#d9ccaa', [GX, gyc + 1.22, GZ], [1.5, .16, .24], [0, 0, 0], .05); const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; g.add(m); }
  const beacon = shaft(15, .45, 1.1, [1, .84, .5], 1, .3); beacon.position.set(GX, gyc + .1, GZ); g.add(beacon);
  const gateGl = spriteGlow(GX, gyc + .7, GZ, 3.4, 0xffd890, .5); g.add(gateGl);
  const rightL = new THREE.PointLight(0xffc878, 0, 10, 1.5); rightL.position.set(3.4, 1.8, -4.4); g.add(rightL);
  const junc = pool(1.7, 0xffd890, 0); junc.position.set(0, gy(0, 1.2) + .05, 1.2); g.add(junc);
  const gold = makeMotes({ n: 90, area: [7, 4, 9], size: .05, v: .22, seed: 81, color: 0xffdd90 }), ember = makeMotes({ n: 70, area: [6, 4, 7], size: .055, v: .45, seed: 82, color: 0xff8a40 }); g.add(gold.mesh, ember.mesh);

  // --- the person
  const wk = makeWalker(); g.add(wk.group);
  const WL = WALK.getLength(), Vsp = .95;
  const walkS = t => { const tau = t - 74.4; return tau <= 0 ? 0 : Vsp * (tau < .9 ? tau * tau / 1.8 : tau - .45); };
  const walkPos = s => { const u = clamp(s / WL), p = WALK.getPointAt(u), q = WALK.getPointAt(Math.min(1, u + .004)); return { x: p.x, z: p.z, ry: Math.atan2(q.x - p.x, q.z - p.z), u }; };
  function personUpdate(t) {
    const s = walkS(t), P = walkPos(s); const moving = s > 0.01 && t < 81; let ry = P.ry, x = P.x, z = P.z;
    if (!moving && t < 74.4) {
      ry = Math.PI + .5 * Math.sin(smooth(63.6, 66.4, t) * Math.PI) * (1 - smooth(66.5, 67, t)) * 1 + (-.42) * Math.sin(smooth(67.6, 70.2, t) * Math.PI) * (1 - smooth(70.3, 70.8, t)) + .1 * Math.sin(t * .7) * smooth(71, 74, t);
      ry = Math.PI + (.5 * Math.sin(Math.PI * smooth(63.4, 66.8, t)) - .44 * Math.sin(Math.PI * smooth(67.4, 70.8, t)));
    }
    const ph = s * 5.6, amp = .55 * smooth(0, .6, s) * (moving ? 1 : 0), bob = moving ? Math.abs(Math.sin(ph)) * .03 : 0;
    wk.group.position.set(x, gy(x, z) + bob, z); wk.group.rotation.set(0, ry, 0);
    wk.legs[0].rotation.x = Math.sin(ph) * amp; wk.legs[1].rotation.x = -Math.sin(ph) * amp; wk.arms[0].rotation.x = -Math.sin(ph) * amp * .8; wk.arms[1].rotation.x = Math.sin(ph) * amp * .8;
    const hes = !moving && t < 74.4 ? .08 * Math.sin(t * 1.3) : 0; // weight shifts while he hesitates
    if (!moving) { wk.arms[0].rotation.set(-.1 + hes, 0, -.08); wk.arms[1].rotation.set(-.1 - hes, 0, .08); if (t > 70.8 && t < 74.4) { wk.arms[1].rotation.x = -.1 - .5 * Math.sin(Math.PI * smooth(70.8, 74.4, t)); } wk.group.scale.setScalar(1.1 * (1 + .006 * Math.sin(t * 1.9))); }
    return { x, z, s, u: P.u };
  }
  const flick = (t, k = 1) => (.84 + .16 * Math.sin(t * 13 * k) + .07 * Math.sin(t * 29 * k + 1));

  function update(lt, t) {
    personUpdate(t);
    const k = flick(t); flames.forEach((f, i) => { const kk = flick(t + i * .7, 1 + i * .05); f.m.scale.y = f.h * (.75 + .5 * kk); f.m.position.y = fy + f.h * (.75 + .5 * kk) / 2; f.m.rotation.y = t * 3 + i; }); fireGl.material.opacity = .4 * k; leftL.intensity = 3.0 * k * (1 - smooth(74.4, 79, t) * .55);
    smokeCloud.update(t, 0, 1); sea.update(t, 0, 1);
    smoke.visible = true; SMK.forEach((p, i) => { const u = (((t * p.sp * .35 + p.ph) % 1) + 1) % 1; _o.position.set(FX + p.dx * u * 2 + u * .7, fy + .5 + u * 3.8, FZ + p.dx * .4); const sz = p.sz * (.2 + u * 1.5) * (u < .85 ? 1 : (1 - u) * 6.6); _o.scale.set(sz, sz * .8, sz); _o.rotation.set(u * 3, i, 0); _o.updateMatrix(); smoke.setMatrixAt(i, _o.matrix); }); smoke.instanceMatrix.needsUpdate = true;
    const warm = smooth(62, 78, t);
    rightL.intensity = (1.2 + 1.6 * warm) * (.95 + .05 * Math.sin(t * 1.1)); beacon.material.opacity = .16 + .2 * smooth(63, 78, t); gateGl.material.opacity = .2 + .18 * warm; junc.material.opacity = .1 + .12 * smooth(60, 70, t);
    lamps.forEach((l, i) => l.material.opacity = (.26 + .16 * warm) * (.94 + .06 * Math.sin(t * 2 + i)));
    gold.update(t, .4 + .6 * warm, [3.0, .2, -3.4]); ember.update(t, 1 - warm * .45, [-3.6, 0, -2.4]);
  }

  // --- camera: high over the diorama, down behind the person, then alongside him as he walks
  const pp = tt => { const s = walkS(tt), P = walkPos(s); return [P.x, gy(P.x, P.z), P.z]; };
  const at = (tt, dx, dy, dz) => { const p = pp(tt); return [p[0] + dx, p[1] + dy, p[2] + dz]; };
  const cam = [
    { t: 60, T: [0, .2, -1.8], az: 0, el: 64, w: 26, dy: 140 },
    { t: 63.2, T: [0, .5, -.4], az: 3, el: 38, w: 13.5, dy: 250 },
    { t: 66.0, T: [0, .98, .5], az: 2, el: 18, w: 7.0, dy: 330 },
    { t: 71.0, T: [0, 1.02, .55], az: -1, el: 14.5, w: 5.8, dy: 340 },
    { t: 74.4, T: [0, 1.0, .5], az: -3, el: 13, w: 5.3, dy: 345 },
    { t: 77.0, T: at(77.0, .5, .95, -.9), az: -16, el: 12, w: 6.6, dy: 345 },
    { t: 80.9, T: at(80.9, .8, 1.05, -.8), az: -30, el: 10, w: 8.6, dy: 340, stop: true },
  ].map(k => ({ fov: 26, ...k, t: k.t - VT.fork }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    D(60, '#3a4676', '#16182c', .82, '#ffb878', 1.5, [10, 3.8, -4], .4, '#6a7cff', [-8, 5, 8], 13),
    D(68, '#4c5686', '#1c1e32', .84, '#ffbd7c', 1.85, [10, 4.2, -4], .42, '#7a8cff', [-8, 5, 8], 13),
    D(76, '#6a6490', '#2a2438', .86, '#ffc888', 2.2, [10, 5.0, -3], .45, '#8a96ff', [-8, 5, 8], 13),
    D(82, '#7a6a90', '#2e2638', .86, '#ffcc90', 2.3, [10, 5.4, -3], .45, '#8a96ff', [-8, 5, 8], 13)];
  const bg = [[60, ['#0a1030', '#2a2a4c']], [68, ['#0e1636', '#46384e']], [76, ['#18204a', '#8a5a58']], [82, ['#202a58', '#b0705a']]];
  // sunrise disc and glow behind the hills, drawn before the 3D pass
  const back = (cx, lt, t, cam0, proj, halo) => {
    const [bx, by] = proj(V3(GX, gyc + 5.0, GZ)); const a = smooth(61, 70, t), r = 120 + 40 * smooth(66, 80, t), yy = by - 50 * smooth(66, 80, t);
    drawSun(cx, bx, yy, r, a * .95, halo);
  };
  const halos = (cx, lt, t, halo, proj) => {
    const [gx, gyp] = proj(V3(GX, gyc + .8, GZ)); halo(cx, gx, gyp, 520, '255,205,130', .14 * smooth(62, 76, t));
    const [fx, fyp] = proj(V3(FX, fy + .5, FZ)); halo(cx, fx, fyp, 380, '255,92,40', .22 * (1 - smooth(74, 79, t) * .6));
  };
  out.fork = { group: g, update, light, bg, cam, back, halos, bloom: [[0, .34]], scrim: [[0, .32]], vig: [[0, .58]], xin: 1.9, abs: true, smoothCam: true, wk };
  return out;
}

// a faceted sun
export function drawSun(cx, x, y, r, a, halo) {
  if (a <= .004) return; cx.save();
  halo(cx, x, y, r * 6.2, '255,150,80', .42 * a); halo(cx, x, y, r * 2.6, '255,208,140', .5 * a);
  cx.globalAlpha = a; cx.beginPath(); for (let i = 0; i < 10; i++) { const th = i / 10 * TAU + .15; cx.lineTo(x + Math.cos(th) * r, y + Math.sin(th) * r); } cx.closePath();
  const gr = cx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, '#fff3c8'); gr.addColorStop(1, '#ffb55a'); cx.fillStyle = gr; cx.fill();
  cx.clip(); cx.globalAlpha = a * .22; cx.fillStyle = '#ff8a3a'; for (let i = 0; i < 10; i += 2) { const th = i / 10 * TAU + .15, th2 = (i + 1) / 10 * TAU + .15; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(th) * r, y + Math.sin(th) * r); cx.lineTo(x + Math.cos(th2) * r, y + Math.sin(th2) * r); cx.closePath(); cx.fill(); }
  cx.restore();
}
