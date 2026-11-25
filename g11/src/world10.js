// Episode 10: Genesis 10, the table of the nations. One family on the ark hill; golden threads of light run out from the ark to small floating lands in the cloud sea
// (the coastlands, the southern lands, the first cities, the hill country of Shem). No faces or costumes are tied to any region: every camp mixes skin tones, hair and dress at random.
// Genesis 11 (the tower) is NOT shown: Babel here is only the first city of Nimrod's kingdom (Gen 10:10).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, spriteGlow } from './kit.js';
import { seg, ease, keyed, rgbOf, mx, css } from './util.js';
import { pk, tri, makeQuad, makeCamel, makeDonkey, makeSheep, makeOx, walkLegs, roundTreeGeo, pineGeo, oliveGeo, palmGeo, rockGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { buildTerrain, underRock, makeClouds, Hf as HfC, ARK8, TAU } from './terrain8.js';
import { makeArk } from './ark.js';
import { LK } from './lights.js';
import { NOAH, SONS, WIVES } from './world.js';
import { gy as gyC, AY0 } from './world8.js';
import { makeWater10 } from './water10.js';

// ---------------- the story clock (seconds on the episode clock), from the real narration clips (vo_timing.json)
export const PLACE = { a1: 1.0, b1: 5.26, b2: 10.95, c1: 15.96, c2: 21.14, c3: 27.0, d1: 31.76, d2: 36.12, d3: 40.29, d4: 45.16, e1: 48.21, e2: 53.24, h1: 61.0, h2: 66.2, h3: 71.4, h4: 79.4, i: 85.3 };
export const EV = {
  thJ: [5.5, 8.2], campJ: [8.2, 8.9, 9.6], boatsJ: [9.0, 10.5],
  thH: [11.2, 13.3], campH: [12.6, 13.15, 13.5, 13.85], caravan: 14.0,
  thB: [16.1, 18.0], nimrod: 17.6, babel: [24.8, 27.2],
  thA: [27.1, 28.9], nineveh: [28.7, 30.9], towns: [29.5, 30.2],
  thS: [33.8, 35.8], campS: [36.7, 37.25, 38.0, 38.8, 39.45],
  chain: [40.4, 41.5], eber: 41.95, fork: [42.5, 43.7], peleg: 43.25, joktan: 44.3,
  far: [46.4, 47.8], farCamps: [49.0, 50.0, 51.0, 52.0], farTh: [48.6, 51.6],
};

const D2R = Math.PI / 180;
export const headX = (vx, vz) => Math.atan2(-vz, vx);   // rotation.y that points a model's +x axis along (vx, vz)
export const headZ = (vx, vz) => Math.atan2(vx, vz);    // rotation.y that points a figure (front = +z) along (vx, vz)
export const SKINS10 = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a', '#8a5a3a', '#ba8458'];
export const ROBES = ['#b5654a', '#c9a15a', '#5e7fa6', '#8a9a6a', '#cfc2a0', '#a2564e', '#6c5a8a', '#d9b36a', '#7a8a9a', '#a8744a', '#3f6a78'];
export const HAIRS = ['#2e1d10', '#3a2616', '#1f160d', '#5a4128', '#6a4a2a'];
export const mkPerson = (R, sc = .45, o = {}) => person(R, { pants: pk(R, ROBES), top: pk(R, ROBES), skin: pk(R, SKINS10), hair: pk(R, HAIRS), cloth: R() < .4 ? pk(R, ['#efe4cc', '#d9ccb0', '#c9b88a']) : null, long: R() < .3, beard: R() < .3 ? pk(R, ['#3a2616', '#5a4128', '#2e1d10']) : null, sash: R() < .5 ? '#5a3a20' : null, seed: (R() * 1e6) | 0, ...o }, sc);

// ---------------- the little floating lands
export function mkIslet(rn, R, hf, gc, rings = 26, segs = 64) {
  const V = [];
  for (let i = 0; i <= rings; i++) { const row = []; for (let j = 0; j < segs; j++) {
    let r = i / rings * R, a = j / segs * TAU; if (i > 0 && i < rings) { r += (rn() - .5) * .4 * (R / rings); a += (rn() - .5) * .55 * TAU / segs; }
    const x = Math.cos(a) * r, z = Math.sin(a) * r; row.push([x, i === 0 ? hf(0, 0) : hf(x, z), z]); } V.push(row); }
  const gb = new GB(rn), A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3();
  const put = (p, q, r) => {
    A.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); B.set(r[0] - p[0], r[1] - p[1], r[2] - p[2]); Cc.crossVectors(A, B);
    if (Cc.y < 0) { const t = q; q = r; r = t; Cc.negate(); } Cc.normalize();
    const cx = (p[0] + q[0] + r[0]) / 3, cy = (p[1] + q[1] + r[1]) / 3, cz = (p[2] + q[2] + r[2]) / 3;
    tri(gb, p, q, r, Math.hypot(cx, cz) > R - 1.0 ? '#5a4a38' : gc(cx, cy, cz, 1 - Cc.y), .07);
  };
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs, a = V[i][j], b = V[i][j1], c = V[i + 1][j1], d = V[i + 1][j];
    if (i === 0) put(V[0][0], d, c); else if ((i + j) & 1) { put(a, b, c); put(a, c, d); } else { put(a, b, d); put(b, c, d); }
  }
  const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; m.frustumCulled = false; return m;
}
export const C3 = c => new THREE.Color(c);
export const rimf = (R, h, r, lo = .03) => h * (1 - smooth(R - 2.0, R - .15, r)) + lo * smooth(R - 2.0, R - .15, r);
const RI10 = 10;
// positions of the lands (x, y, z) in the world; y is the water/ground reference of each land
export const POS = { J: [-33, -1.2, 6], H: [4, -1.8, 33], B: [31, -1.0, 21], A: [36, -2.0, -8], S: [13, -1.5, -33], F1: [-52, -3, -42], F2: [66, -3, -40], F3: [-60, -2.5, 30], F4: [58, -2.5, 56] };

// --- Japheth: the coastlands (sea on the west side, green land and a hill in the east)
const coastJ = (x, z) => x + 1.4 * Math.sin(z * .7) + .8 * Math.sin(z * 1.7 + 1);
const hJ = (x, z) => { const r = Math.hypot(x, z), c = coastJ(x, z); let h = lerp(-.55, .36 + .1 * Math.sin(x * .9 + z * .4), smooth(-1.6, .5, c));
  const hl = Math.hypot(x - 5, z + 1.8) / 4.0; if (hl < 1) h = Math.max(h, 1.6 * Math.pow(1 - hl, 1.3) * (.85 + .25 * Math.sin(x * 2 + z)));
  return rimf(RI10, h, r, -.02); };
const gcJ = (x, y, z, s) => { const c = coastJ(x, z); let b = C3('#76904c'); b.lerp(C3('#8a9a58'), .5 * smooth(-3, 3, Math.sin(x * 1.1 + z * .8)));
  if (y < .22) b.lerp(C3('#d9c79a'), smooth(.22, .0, y) * .9); if (y < -.05) b.lerp(C3('#bdb592'), .8);
  if (s > .3 || y > 1.2) b.lerp(C3('#8d8578'), clamp((s - .25) * 2 + (y - 1) * .2)); return b.getHex(); };
// --- Ham: the southern lands (dunes, a river with green banks, an oasis)
const xrH = z => 1.5 * Math.sin(z * .32 + .6) - 1.2;
const hH = (x, z) => { const r = Math.hypot(x, z); let h = .42 + .28 * Math.sin(x * .5 + z * .2) * Math.cos(z * .45) + .16 * Math.sin(x * 1.3 + z * .9);
  h = lerp(h, -.28, smooth(1.3, .45, Math.abs(x - xrH(z)))); h = lerp(h, -.25, smooth(1.9, .8, Math.hypot(x + 4.6, z - 4.2)));
  return rimf(RI10, h, r, .0); };
const gcH = (x, y, z, s) => { let b = C3('#d6b678').lerp(C3('#c4a060'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); const d = Math.min(Math.abs(x - xrH(z)), Math.hypot(x + 4.6, z - 4.2) - .7);
  if (d < 2.6) b.lerp(C3('#7f9a50'), smooth(2.6, 1.0, d) * .9); if (y < .05) b.lerp(C3('#bdb08a'), .7); if (y > .78) b.lerp(C3('#e4c88a'), .5); return b.getHex(); };
// --- Nimrod: the plain with a rock ledge (west) and the first city (east)
const hB = (x, z) => { const r = Math.hypot(x, z); let h = .26 + .06 * Math.sin(x * .8 + z * .6) + .04 * Math.sin(x * 2.1 - z * 1.3);
  const hl = Math.hypot(x + 5.4, z + 3) / 2.6; if (hl < 1) h = Math.max(h, 1.35 * (hl < .55 ? 1 : Math.pow(1 - (hl - .55) / .45, 1.4) * .9 + .1 * (1 - hl)));
  const hm = Math.hypot(x - 2.6, z - 2.2) / 4.0; if (hm < 1) h = Math.max(h, .5 * smooth(1, .6, hm) + .26);
  return rimf(RI10, h, r); };
const gcB = (x, y, z, s) => { let b = C3('#a2a862').lerp(C3('#8e9a58'), .5 * smooth(-1, 1, Math.sin(x * 1.1 + z * .9))); if (Math.hypot(x - 2.6, z - 2.2) < 4.0) b.lerp(C3('#c4ae82'), .7);
  if (y > .8) b.lerp(C3('#9a9284'), clamp((y - .6) * .9)); return b.getHex(); };
// --- Assyria: a plain with a river bend on the east side
const hA = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .07 * Math.sin(x * .7 + z * .5) + .05 * Math.sin(x * 1.9 - z * 1.1); const xc = 6.2 + .8 * Math.sin(z * .5); h = lerp(h, -.25, smooth(1.2, .5, Math.abs(x - xc))); return rimf(RI10, h, r); };
const gcA = (x, y, z, s) => { let b = C3('#94a05c').lerp(C3('#a8aa66'), .5 * smooth(-1, 1, Math.sin(x * 1.3 + z * .8))); const xc = 6.2 + .8 * Math.sin(z * .5); if (Math.abs(x - xc) < 2.2) b.lerp(C3('#6f9250'), smooth(2.2, 1, Math.abs(x - xc)) * .8); if (y < .08) b.lerp(C3('#bdb08a'), .7); return b.getHex(); };
// --- Shem: hill country with five camps
const HILLS = [[-4, -2.2, 2.3, 4.2], [3.8, -3.6, 1.9, 3.6], [1.6, 4.2, 1.5, 3.3], [-5.2, 4.8, 1.1, 2.6]];
const hS = (x, z) => { const r = Math.hypot(x, z); let h = .28 + .09 * Math.sin(x * .9 + z * .7);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  return rimf(RI10, h, r); };
const gcS = (x, y, z, s) => { let b = C3('#7f9558').lerp(C3('#8a9a60'), .5 * smooth(-1, 1, Math.sin(x * 1.1 + z)));  if (y > .9) b.lerp(C3('#9a8e7c'), clamp((y - .8) * .6)); if (s > .32) b.lerp(C3('#8d8578'), clamp((s - .26) * 2.2)); return b.getHex(); };
// --- tiny far lands
const hF = (R) => (x, z) => { const r = Math.hypot(x, z); return rimf(R, .3 + .5 * Math.max(0, 1 - Math.hypot(x - .6, z + .4) / 2.0), r); };
const gcF = (x, y, z, s) => C3('#86985a').lerp(C3('#9a9488'), clamp((y - .5) * 1.2)).getHex();

// ---------------- pieces
export function tentMesh(R, col = '#cdb48c', s = .8) {
  const b = new GB(R), r = 1.2 * s, h = 1.15 * s;
  b.add(new THREE.ConeGeometry(r, h, 4, 1).rotateY(Math.PI / 4).translate(0, h / 2, 0), col, [0, 0, 0], [1, 1, 1], [0, 0, 0], .05);
  b.box('#5a3a20', [0, h + .06, 0], [.05, .26, .05], [0, 0, 0], .02);
  const zf = y => r * Math.SQRT1_2 * (1 - y / h) + .012, v = [[-.3 * s, .02, zf(.02)], [.3 * s, .02, zf(.02)], [0, .6 * s, zf(.6 * s)]], geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v.flat(), 3)); geo.setIndex([0, 1, 2]); geo.computeVertexNormals(); b.add(geo, '#1a1008', [0, 0, 0], [1, 1, 1], [0, 0, 0], 0);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m;
}
export const mudCols = ['#c8b48c', '#b8a47c', '#d4c29c', '#c2a67a', '#bfae8a'];
// houses/walls/towers: merged per sector so a whole district can rise out of the ground
export function houseBlock(R, cx, cz, nx, nz, sp, hf, y0) {
  const b = new GB(R);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    if (R() < .12) continue; const x = cx + (i - (nx - 1) / 2) * sp + (R() - .5) * .22, z = cz + (j - (nz - 1) / 2) * sp + (R() - .5) * .22, w = .62 + R() * .36, d = .62 + R() * .36, h = .5 + R() * .45, col = pk(R, mudCols), y = hf(x, z) - y0;
    b.box(col, [x, y + h / 2, z], [w, h, d], [0, (R() - .5) * .25, 0], .05); b.box('#a08a64', [x, y + h + .03, z], [w * 1.06, .06, d * 1.06], [0, 0, 0], .03);
    if (R() < .5) b.box('#3a2a1c', [x, y + .17, z + d / 2 + .005], [.16, .3, .02], [0, 0, 0], .02);
  }
  return b;
}
export function wallRing(R, cx, cz, hw, hd, hf, y0, towers = true) {
  const b = new GB(R), H = .9, T = .16, seg_ = [[cx, cz - hd, hw * 2, T], [cx, cz + hd, hw * 2, T], [cx - hw, cz, T, hd * 2], [cx + hw, cz, T, hd * 2]];
  for (const [x, z, w, d] of seg_) { b.box('#c2ae86', [x, hf(x, z) - y0 + H / 2, z], [w, H, d], [0, 0, 0], .04);
    const n = Math.floor(Math.max(w, d) / .34); for (let k = 0; k < n; k++) { const u = (k + .5) / n - .5; b.box('#b09c74', [x + (w > d ? u * w : 0), hf(x, z) - y0 + H + .07, z + (w > d ? 0 : u * d)], [w > d ? .16 : T * 1.2, .14, w > d ? T * 1.2 : .16], [0, 0, 0], .03); } }
  if (towers) for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]]) { const x = cx + sx * hw, z = cz + sz * hd; b.box('#cbb78e', [x, hf(x, z) - y0 + .7, z], [.5, 1.4, .5], [0, 0, 0], .04); b.box('#b09c74', [x, hf(x, z) - y0 + 1.46, z], [.58, .12, .58], [0, 0, 0], .03); }
  b.box('#2a1c10', [cx, hf(cx, cz + hd) - y0 + .32, cz + hd + .1], [.5, .64, .12], [0, 0, 0], .02);
  return b;
}
export function palaceBlock(R, cx, cz, hf, y0) {
  const b = new GB(R), y = hf(cx, cz) - y0; b.box('#c9b48a', [cx, y + .3, cz], [2.6, .6, 2.0], [0, 0, 0], .04); b.box('#d4c29c', [cx, y + .8, cz], [1.9, .5, 1.4], [0, 0, 0], .04); b.box('#dccaa6', [cx, y + 1.2, cz], [1.2, .4, .9], [0, 0, 0], .04); b.box('#8a4a32', [cx, y + 1.46, cz], [.9, .12, .6], [0, 0, 0], .03);
  for (const s of [-1, 1]) b.box('#e8dcc0', [cx + s * .55, y + 1.7, cz + .1], [.06, .5, .06], [0, 0, 0], .02); return b;
}
export const meshOf = (b) => { const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; };

export function makeBoat(R, col = '#8a5a38', sail = '#efe4cc') {
  const g = new THREE.Group(), b = new GB(R);
  b.box(col, [0, .1, 0], [1.5, .16, .46], [0, 0, 0], .05); b.box(col, [.88, .2, 0], [.4, .16, .3], [0, 0, .45], .05); b.box(col, [-.88, .2, 0], [.36, .16, .3], [0, 0, -.4], .05);
  b.box('#6a4426', [0, .26, .22], [1.4, .1, .05], [0, 0, 0], .04); b.box('#6a4426', [0, .26, -.22], [1.4, .1, .05], [0, 0, 0], .04); b.box('#5a3a20', [.1, .8, 0], [.05, 1.3, .05], [0, 0, 0], .02);
  tri(b, [.14, 1.42, 0], [.14, .28, 0], [.92, .3, .02], sail, .04); tri(b, [.14, 1.42, 0], [.92, .3, .02], [.14, .28, 0], sail, .04);
  tri(b, [.06, 1.3, 0], [-.66, .3, -.02], [.06, .28, 0], sail, .06); tri(b, [.06, 1.3, 0], [.06, .28, 0], [-.66, .3, -.02], sail, .06);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; g.add(m); return g;
}
function bowProp(R) {   // long axis y, belly toward +z, string in the z = 0 plane (the figure holds it with the arm raised forward)
  const b = new GB(R), n = 8, rad = .55, A = 1.05, z0 = rad * Math.cos(A);
  for (let k = 0; k < n; k++) { const am = -A + 2 * A * (k + .5) / n; b.box('#5a3a20', [0, Math.sin(am) * rad, Math.cos(am) * rad - z0], [.035, rad * 2 * A / n * 1.2, .035], [-am, 0, 0], .02); }
  b.box('#e8dcc0', [0, 0, 0], [.012, rad * 2 * Math.sin(A), .012], [0, 0, 0], .01);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m;
}

// ---------------- smoke: one instanced mesh for every chimney in the world
export function makeSmoke(maxEm) {
  const NP = 7, n = maxEm * NP, mat = new THREE.MeshBasicMaterial({ color: 0xd8cabb, transparent: true, opacity: .42, depthWrite: false, toneMapped: false }), m = new THREE.InstancedMesh(G.ico0, mat, n);
  m.frustumCulled = false; m.renderOrder = 6; const ob = new THREE.Object3D(), em = [];
  function update(t, col) { mat.color.set(col); let i = 0;
    for (const e of em) { const on = e.on(t); for (let k = 0; k < NP; k++, i++) { const u = (((t * .22 + k / NP + e.ph) % 1) + 1) % 1, s = on > .01 ? e.s * (.25 + 1.1 * u) * Math.sin(Math.PI * Math.min(1, u * 1.12)) * on : 0.0001;
      ob.position.set(e.x + Math.sin(t * .6 + k * 1.7) * .12 * u * 3 + u * .5, e.y + u * e.h, e.z + Math.cos(t * .5 + k) * .1 * u * 3); ob.scale.setScalar(Math.max(.0001, s)); ob.rotation.set(t * .3 + k, k, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); } }
    for (; i < n; i++) { ob.scale.setScalar(.0001); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); } m.instanceMatrix.needsUpdate = true; }
  return { mesh: m, add: (x, y, z, on, s = .5, h = 3.2) => em.push({ x, y, z, on, s, h, ph: Math.random() * 0 + em.length * .137 }), update };
}

// ---------------- the golden thread: a tube that grows along a curve, with a bright head
export function makeThread(p0, p1, lift, rad = .06) {
  const mid = [(p0[0] + p1[0]) / 2, Math.max(p0[1], p1[1]) + lift, (p0[2] + p1[2]) / 2], curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...p0), new THREE.Vector3(...mid), new THREE.Vector3(...p1)), SEGS = 72, RAD = 5;
  const g = new THREE.Group(), mk = (r, op) => { const m = new THREE.Mesh(new THREE.TubeGeometry(curve, SEGS, r, RAD, false), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.frustumCulled = false; m.renderOrder = 7; g.add(m); return m; };
  const core = mk(rad, .95), halo = mk(rad * 3.4, .16), head = spriteGlow(p0[0], p0[1], p0[2], 1.6, 0xffe3a0, 0);
  g.add(head); const P = new THREE.Vector3();
  const set = (u, a = 1) => { const n = Math.floor(clamp(u) * SEGS) * RAD * 6; core.geometry.setDrawRange(0, n); halo.geometry.setDrawRange(0, n); core.visible = halo.visible = u > .002 && a > .01; core.material.opacity = .95 * a; halo.material.opacity = .16 * a;
    head.visible = u > .002 && u < .999 && a > .01; if (head.visible) { curve.getPoint(clamp(u), P); head.position.copy(P); head.material.opacity = .9 * a; } };
  set(0); return { group: g, set, curve };
}

// ---------------- cloud sea (own placement so the lands are kept clear)
export function cloudSea(rn, n, keep) {
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), m = new THREE.InstancedMesh(G.ico1, mat, n); m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  const items = [], ob = new THREE.Object3D(), col = new THREE.Color(); let guard = 0;
  while (items.length < n && guard++ < 5000) { const a = rn() * TAU, r = 15 + Math.pow(rn(), .8) * 110, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keep.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr)) continue;
    items.push({ x, z, y: -8.4 + rn() * 3.2, s: 2.6 + rn() * 3.6 * (1 + r / 120), sy: .34 + .2 * rn(), ph: rn() * 6, v: .05 + rn() * .1, ox: rn() * 6 }); m.setColorAt(items.length - 1, col.set(pk(rn, ['#e8e4ee', '#dcd8ea', '#f0ece6', '#d0cce2']))); }
  m.instanceColor.needsUpdate = true;
  function update(t, cp, near = 16) {
    items.forEach((c, i) => { const x = c.x + Math.sin(t * .05 * c.v * 10 + c.ph) * 1.2, y = c.y + Math.sin(t * .2 + c.ph) * .12, dd = cp ? Math.hypot(x - cp.x, y - cp.y, c.z - cp.z) : 999;
      const sc = c.s * smooth(near * .5, near, dd); ob.position.set(x, y, c.z); ob.scale.set(sc, sc * c.sy, sc * .82); ob.rotation.set(0, c.ox + t * .01, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); });
    m.instanceMatrix.needsUpdate = true; }
  return { mesh: m, update, mat };
}
export function farMountains10(rn) {
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#2b3250', '#232a45', '#1c2238'], N = 34;
  for (let i = 0; i < N; i++) { const a = i / N * TAU + rn() * .12, r = 118 + rn() * 34, s = 4 + rn() * 5, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, rn, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + rn() * .25, 2.2); m.position.set(Math.cos(a) * r, -5 + rn() * 2, Math.sin(a) * r); m.rotation.y = rn() * 6; g.add(m); }
  g.userData.mat = mat; return g;
}

// ====================================================================== the world
export function makeNations() {
  const R = rng(1010), g = new THREE.Group(), smoke = makeSmoke(70), W = [];   // W: things with update(t, cam)
  const wpos = (key, x, y, z) => [POS[key][0] + x, POS[key][1] + y, POS[key][2] + z];

  // ---- the ark hill (the central island of Episodes 8 and 9)
  const hill = new THREE.Group(); g.add(hill); hill.add(buildTerrain(rng(61)), underRock(rng(62)));
  const ark = makeArk(rng(66)); ark.update(1000); ark.slitMat.opacity = 0; hill.add(ark.group); ark.group.position.set(ARK8.x, AY0, ARK8.z); ark.group.rotation.set(0, ARK8.yaw, 0, 'YXZ'); ark.setDoor(1.5);
  const tree = (x, z, s, kind) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f', '#4f8a3a']); const m = new THREE.Mesh(geo, lam); m.position.set(x, gyC(x, z) - .02, z); m.castShadow = true; hill.add(m); return m; };
  [[-8.6, -5.4, 1.1, 'round'], [8.8, -5.9, 1.0, 'olive'], [-9.4, -7.4, .9, 'round'], [9.6, -7.6, 1.0, 'round'], [-6.2, -9.0, 1.1, 'pine'], [5.8, -9.1, 1.0, 'round'], [-2.6, -9.0, .9, 'olive'], [3.2, -9.2, 1.1, 'pine'], [-7.8, -2.6, 1.0, 'olive'], [8.4, -3.4, .8, 'olive'],
    [-10.4, 3.2, 1.2, 'olive'], [-8.2, 5.4, 1.0, 'round'], [-3.0, 6.8, 1.1, 'round'], [2.2, 7.6, 1.2, 'olive'], [7.0, 6.2, 1.0, 'round'], [9.8, 2.6, 1.0, 'pine'], [-5.6, 3.4, .9, 'olive']].forEach(a => tree(...a));
  { const sh = new GB(R); for (let k = 0; k < 30; k++) { const a = R() * TAU, r = 1 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (HfC(x, z) > 2.6 && HfC(x, z) < 3.2 && Math.abs(z - ARK8.z) < 1.9 && Math.abs(x) < 8.4) continue; if (z > -4.9 && z < -.6 && x > -4 && x < 4) continue; sh.add(G.ico0, pk(R, ['#7a766e', '#8a867c', '#6a665e', '#9a9488']), [x, gyC(x, z) + .02, z], [.16 + R() * .12, .1 + R() * .08, .14 + R() * .1], [R() * 3, R() * 3, 0], .1); } hill.add(new THREE.Mesh(sh.build(), lam)); }
  // the family at the ark: Noah and his wife, three sons with their wives and two children each (the sons share one skin tone on purpose, as in Episode 9)
  const SK = '#c98d62', fam = {}, mk = (k, o, sc) => { const f = person(R, o, sc); f.group.name = k; hill.add(f.group); fam[k] = f; return f; };
  mk('noah', NOAH, .5); mk('wNoah', WIVES.noah, .46); mk('shem', { ...SONS.shem, skin: SK }, .46); mk('ham', { ...SONS.ham, skin: SK }, .45); mk('jap', { ...SONS.jap, skin: SK }, .45);
  mk('wShem', WIVES.shem, .44); mk('wHam', WIVES.ham, .44); mk('wJap', WIVES.jap, .43);
  const kidO = [{ top: '#d8c8a0', pants: '#8a6a46', skin: SK, hair: '#2a1a10' }, { top: '#7aa0b0', pants: '#4a6a8a', skin: '#c08258', hair: '#2a1a10', long: true }, { top: '#c98660', pants: '#a8603a', skin: '#b57a50', hair: '#1f160d' }, { top: '#c9a060', pants: '#8c5a32', skin: '#a8703f', hair: '#1f160d', long: true }, { top: '#9ab07a', pants: '#6a8a5a', skin: '#d9a073', hair: '#6a4a2a' }, { top: '#a6b884', pants: '#586e4a', skin: '#dcaa7c', hair: '#6a4a2a', long: true }];
  kidO.forEach((o, i) => mk('kid' + i, { ...o, seed: 400 + i }, .27 + (i % 2) * .03));
  // standing places in a loose arc in front of the ark door; ry 0 = facing the viewer (+z)
  const FP = { noah: [0, -4.1, 0], wNoah: [.8, -3.9, -.1], shem: [-2.0, -2.9, .12], wShem: [-2.9, -3.1, .3], ham: [2.5, -2.8, -.14], wHam: [3.4, -3.1, -.3], jap: [-.5, -2.1, .05], wJap: [.4, -2.0, -.05],
    kid0: [-1.6, -2.0, .2], kid1: [-2.5, -2.2, .3], kid2: [2.0, -2.0, -.2], kid3: [2.9, -2.1, -.3], kid4: [-.9, -1.4, .1], kid5: [0, -1.3, -.1] };
  // Shem steps forward beside Japheth for "the older brother of Japheth" (31.8 - 35.7)
  const shemStep = t => ease.inOutSine(seg(t, 31.4, 32.4)) * (1 - ease.inOutSine(seg(t, 36.2, 37.2)));

  // ---- the five lands and the far lands
  const lands = {};
  const land = (key, Rr, hf, gc, opt = {}) => { const gr = new THREE.Group(), p = POS[key]; gr.position.set(...p); g.add(gr); gr.add(mkIslet(rng(7000 + key.charCodeAt(0) + key.length * 31), Rr, hf, gc, opt.rings, opt.segs), underRock(rng(7100 + key.charCodeAt(0)), Rr)); lands[key] = { gr, hf, R: Rr, p }; return lands[key]; };
  land('J', RI10, hJ, gcJ); land('H', RI10, hH, gcH); land('B', RI10, hB, gcB); land('A', RI10, hA, gcA); land('S', RI10, hS, gcS);
  for (const k of ['F1', 'F2', 'F3', 'F4']) land(k, 3.6, hF(3.6), gcF, { rings: 10, segs: 28 });
  // water patches for the coastlands, the river and oasis of the south, the river of the plain
  const waters = [];
  for (const [k, hf] of [['J', hJ], ['H', hH], ['A', hA]]) { const w = makeWater10((x, z) => hf(x, z) + POS[k][1], 12, RI10, [POS[k][0], POS[k][2]], RI10 - .05); g.add(w.mesh); waters.push(w); w.U.uLevel.value = POS[k][1] + .06; w.U.uAmp.value = k === 'J' ? .06 : .035; w.U.uOp.value = 1; w.U.uFogA.value = 40; w.U.uFogB.value = 120; }
  const hOf = (k, x, z) => lands[k].hf(x, z) + .0;     // local ground height
  const place = (k, mesh, x, z, dy = -.02) => { mesh.position.set(x, hOf(k, x, z) + dy, z); lands[k].gr.add(mesh); return mesh; };

  // ---- trees, palms, rocks on each land
  const scatter = (k, n, kind, ok, s0 = .9) => { for (let i = 0; i < n; i++) { const a = R() * TAU, r = 1.2 + R() * (RI10 - 3.2), x = Math.cos(a) * r, z = Math.sin(a) * r; if (!ok(x, z)) { i--; if (R() < .02) break; continue; }
    const geo = kind === 'palm' ? palmGeo(s0 * (.8 + R() * .5), R) : kind === 'pine' ? pineGeo(s0 * (.8 + R() * .5), R) : kind === 'olive' ? oliveGeo(s0 * (.8 + R() * .5), R) : roundTreeGeo(s0 * (.8 + R() * .5), R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.castShadow = true; m.rotation.y = R() * 6; place(k, m, x, z); } };
  scatter('J', 12, 'olive', (x, z) => coastJ(x, z) > 1.0 && Math.hypot(x - 5, z + 1.8) > 2.4 && Math.hypot(x - 1.5, z - 2.5) > 1.8);
  scatter('J', 6, 'pine', (x, z) => coastJ(x, z) > 2 && Math.hypot(x - 5, z + 1.8) < 4.2);
  scatter('H', 12, 'palm', (x, z) => Math.abs(x - xrH(z)) > 1.0 && Math.abs(x - xrH(z)) < 2.8 && Math.hypot(x - 3.5, z - 2.2) > 2.2 || Math.hypot(x + 4.6, z - 4.2) < 2.8 && Math.hypot(x + 4.6, z - 4.2) > 1.7, 1.0);
  scatter('B', 9, 'round', (x, z) => Math.hypot(x - 2.6, z - 2.2) > 4.6 && Math.hypot(x + 5.4, z + 3) > 3.2);
  scatter('A', 10, 'olive', (x, z) => Math.hypot(x + 1.5, z - .5) > 3.9 && Math.hypot(x - 4.5, z + 3.5) > 1.8 && Math.hypot(x - 3.6, z - 4.2) > 1.8 && x < 4.6);
  scatter('S', 14, 'pine', (x, z) => hS(x, z) > .45 && hS(x, z) < 2.0);
  scatter('S', 5, 'round', (x, z) => hS(x, z) < .6);
  for (const k of ['J', 'H', 'B', 'A', 'S']) { const b = new GB(R); for (let i = 0; i < 16; i++) { const a = R() * TAU, r = 1 + R() * 8, x = Math.cos(a) * r, z = Math.sin(a) * r, y = lands[k].hf(x, z); if (y < .12) continue; b.add(G.ico0, pk(R, ['#7a766e', '#8a867c', '#9a9488', '#6a665e']), [x, y + .02, z], [.16 + R() * .12, .1 + R() * .08, .14 + R() * .1], [R() * 3, R() * 3, 0], .1); } const m = new THREE.Mesh(b.build(), lam); lands[k].gr.add(m); }

  // ---- camps: a tent, a fire, a little smoke, two or three people
  const camps = [];
  function camp(k, x, z, t0, o = {}) {
    const gr = new THREE.Group(), y = hOf(k, x, z); gr.position.set(x, y, z); lands[k].gr.add(gr);
    const nT = o.tents ?? 1, tents = [];
    for (let i = 0; i < nT; i++) { const tm = tentMesh(R, pk(R, ['#cdb48c', '#c2a67a', '#d4c29c', '#b8946a', '#d9c8a4']), .8 * (.85 + R() * .3)); tm.position.set((i - (nT - 1) / 2) * 1.55, 0, -.4 + (i % 2) * .3); tm.rotation.y = (R() - .5) * .9 + (o.face || 0); tm.scale.setScalar(.001); gr.add(tm); tents.push(tm); }
    const fire = spriteGlow(.2, .12, 1.0, .75, 0xffa040, 0), fc = spriteGlow(.2, .1, 1.0, .3, 0xffe0a0, 0); gr.add(fire, fc);
    const logs = new GB(R); logs.box('#4a3020', [0, .04, 0], [.4, .06, .08], [0, .5, 0], .03); logs.box('#4a3020', [0, .04, 0], [.4, .06, .08], [0, -.5, 0], .03); const lm = new THREE.Mesh(logs.build(), lam); lm.position.set(.2, 0, 1.0); lm.visible = false; gr.add(lm);
    const people = []; const nP = o.people ?? 3;
    for (let i = 0; i < nP; i++) { const f = mkPerson(R, i === nP - 1 && nP > 2 ? .3 : .44); f.group.visible = false; gr.add(f.group); const a = (i / nP) * TAU + .6 + R(), rr = 1.0 + R() * .4; people.push({ f, x: .2 + Math.cos(a) * rr, z: 1.0 + Math.sin(a) * rr * .9, ry: Math.atan2(-Math.cos(a), -Math.sin(a) * .9) + (R() - .5) * .5, ph: R() * 6, d: i * .18 }); }
    smoke.add(POS[k][0] + x + .2, POS[k][1] + y + .5, POS[k][2] + z + 1.0, t => smooth(t0 + .8, t0 + 2.4, t), .42, 3.0);
    const c = { t0, update(t) {
      const p = ease.outBack(seg(t, t0, t0 + .7)); tents.forEach((tm, i) => { const k2 = ease.outBack(seg(t, t0 + i * .15, t0 + .7 + i * .15)); tm.scale.setScalar(Math.max(.001, k2)); tm.visible = k2 > .002; });
      const fo = smooth(t0 + .4, t0 + 1.4, t), fl = .8 + .2 * Math.sin(t * 13 + x) * Math.sin(t * 7.3); fire.material.opacity = .62 * fo * fl; fc.material.opacity = .55 * fo; fire.visible = fc.visible = fo > .01; lm.visible = fo > .01;
      people.forEach(q => { const u = ease.outCubic(seg(t, t0 + .5 + q.d, t0 + 1.2 + q.d)); q.f.group.visible = u > .01; if (u > .01) pose(q.f, q.x, hOf(k, x + q.x, z + q.z) - y - .02, q.z, q.ry, { s: u, sx: u, lx: .015 * Math.sin(t * 1.1 + q.ph), a0x: .06 * Math.sin(t * .9 + q.ph), a1x: -.06 * Math.sin(t * .9 + q.ph + 1) }); });
    } };
    camps.push(c); return c;
  }
  // coastlands: two camps on the shore plain
  camp('J', 2.0, 3.2, EV.campJ[0], { tents: 2, people: 4, face: .4 }); camp('J', 1.0, -4.4, EV.campJ[1], { tents: 1, people: 3 });
  // southern lands: one camp for each name (Cush, Egypt, Put, Canaan)
  camp('H', 3.6, 2.4, EV.campH[0], { tents: 2, people: 4 }); camp('H', -1.8, -3.6, EV.campH[1], { tents: 1, people: 3 }); camp('H', 5.4, -3.4, EV.campH[2], { tents: 1, people: 3 }); camp('H', -6.4, 1.4, EV.campH[3], { tents: 1, people: 3 });
  // Shem's hill camps (Elam, Asshur, Arpachshad, Lud, Aram), then Shelah, Eber, Peleg, Joktan
  const sC = [[-6.6, 1.0], [-1.4, -6.1], [5.6, -1.2], [1.8, 1.4], [-2.4, 6.4]];
  const campS = sC.map(([x, z], i) => camp('S', x, z, EV.campS[i], { tents: 1, people: 3 }));
  camp('S', 7.1, 3.0, EV.eber - 1.0, { tents: 1, people: 2 });     // Shelah
  camp('S', 4.2, 6.6, EV.eber, { tents: 1, people: 3 });          // Eber
  camp('S', -5.6, -4.6, EV.peleg, { tents: 1, people: 3 });       // Peleg
  camp('S', 3.0, -6.8, EV.joktan, { tents: 1, people: 3 });       // Joktan
  const fc2 = [['F1', EV.farCamps[0]], ['F2', EV.farCamps[1]], ['F3', EV.farCamps[2]], ['F4', EV.farCamps[3]]].map(([k, t0]) => camp(k, .3, .4, t0, { tents: 1, people: 2 }));

  // ---- coast: boats that sail out and along the shore
  const boats = [[-4.8, 2.0, .0, .6], [-6.5, -2.5, 2.0, .8], [-3.8, 6.0, 1.0, .7], [-7.5, 3.8, 3.0, .9]].map(([x, z, ph, sp], i) => { const b = makeBoat(R, pk(R, ['#8a5a38', '#7a4a2c', '#9a6a40']), pk(R, ['#efe4cc', '#e8dcc0', '#d9ccb0'])); b.scale.setScalar(.9 + .15 * R()); b.visible = false; lands.J.gr.add(b); return { b, x, z, ph, sp, i }; });

  // ---- the south: a caravan of camels on a slow loop, the river with a few animals
  const cams = [0, 1, 2, 3].map(i => { const c = makeCamel(rng(120 + i)); c.group.scale.setScalar(.5); c.group.visible = false; lands.H.gr.add(c.group); return { c, i }; });
  const walkers = [0, 1].map(i => { const f = mkPerson(R, .42); f.group.visible = false; lands.H.gr.add(f.group); return { f, i }; });
  // ---- Babel: Nimrod on the ledge, his hunters, the animals, the first city
  const NIM = person(R, { pants: '#7a2e24', top: '#c9a15a', mantle: '#8a3a2a', skin: '#b57a50', hair: '#1f160d', beard: '#1f160d', sash: '#3a2a1a', seed: 777 }, .66); NIM.group.visible = false; lands.B.gr.add(NIM.group);
  const bow = bowProp(R); bow.position.set(0, -.42, .04); bow.rotation.set(1.3, 0, 0); NIM.arms[0].add(bow);
  { const q = new GB(R); q.box('#6a4426', [0, 0, 0], [.1, .46, .1], [.15, 0, .25], .03); for (let k = 0; k < 3; k++) q.box('#e8dcc0', [.0 + k * .02, .27, 0], [.015, .12, .015], [0, 0, 0], .02); const qm = new THREE.Mesh(q.build(), lam); qm.position.set(.06, .72, -.14); NIM.group.add(qm); }
  const hunters = [0, 1, 2].map(i => { const f = mkPerson(R, .46); f.group.visible = false; lands.B.gr.add(f.group); return { f, i }; });
  const gaz = [0, 1, 2, 3, 4, 5].map(i => { const a = makeQuad({ rn: rng(300 + i), len: .62, h: .26, w: .17, legL: .36, legW: .04, col: pk(rng(i * 3 + 1), ['#c8a070', '#b8905c', '#d2b080']), col2: '#efe4cc', neck: [.2, .75, .09], head: [.2, .11, .08], horns: true, legCol: '#5a4030' }); a.group.scale.setScalar(.7); a.group.visible = false; lands.B.gr.add(a.group); return { a, i }; });
  const bPos = { x: -5.4, z: -3.0 };
  // the city: three rising sectors + a wall
  const cityB = []; { const hf = (x, z) => lands.B.hf(x, z), y0 = 0, cxB = 2.6, czB = 2.2;
    const sectors = [meshOf(houseBlock(R, cxB - .9, czB - .8, 3, 3, 1.05, hf, 0)), meshOf(houseBlock(R, cxB + .95, czB - .6, 3, 3, 1.05, hf, 0)), meshOf(houseBlock(R, cxB, czB + 1.2, 4, 2, 1.1, hf, 0)), meshOf(wallRing(R, cxB, czB, 2.9, 2.5, hf, 0, false))];
    sectors.forEach((m, i) => { lands.B.gr.add(m); m.scale.y = .001; cityB.push({ m, t0: EV.babel[0] + i * .55 }); });
    [[cxB - .3, czB - 1.5], [cxB + 1.4, czB + .4], [cxB - 1.7, czB + .9], [cxB + .4, czB + 1.7]].forEach(([x, z], i) => smoke.add(POS.B[0] + x, POS.B[1] + hf(x, z) + 1.0, POS.B[2] + z, t => smooth(EV.babel[0] + 1.6 + i * .3, EV.babel[1] + .6 + i * .3, t), .5, 3.2)); }
  // ---- Assyria: Nineveh (walls, towers, palace platform) and two more towns
  const cityA = []; { const hf = (x, z) => lands.A.hf(x, z);
    const n1 = [meshOf(wallRing(R, -1.5, .5, 3.2, 2.8, hf, 0, true)), meshOf(houseBlock(R, -2.7, -.4, 3, 3, 1.0, hf, 0)), meshOf(houseBlock(R, -.4, 1.8, 3, 2, 1.0, hf, 0)), meshOf(palaceBlock(R, -1.2, -.3, hf, 0))];
    n1.forEach((m, i) => { lands.A.gr.add(m); m.scale.y = .001; cityA.push({ m, t0: EV.nineveh[0] + i * .35 }); });
    [[4.6, -3.6, EV.towns[0]], [3.8, 4.2, EV.towns[1]]].forEach(([x, z, t0], j) => { const hb = [meshOf(houseBlock(R, x, z, 3, 2, 1.0, hf, 0)), meshOf(wallRing(R, x, z, 1.7, 1.3, hf, 0, false))]; hb.forEach((m, i) => { lands.A.gr.add(m); m.scale.y = .001; cityA.push({ m, t0: t0 + i * .3 }); });
      smoke.add(POS.A[0] + x, POS.A[1] + hf(x, z) + 1.0, POS.A[2] + z, t => smooth(t0 + .8, t0 + 2.2, t), .42, 2.8); });
    [[-2.4, -1.2], [-.4, 1.0], [-1.6, .9]].forEach(([x, z], i) => smoke.add(POS.A[0] + x, POS.A[1] + hf(x, z) + 1.2, POS.A[2] + z, t => smooth(EV.nineveh[0] + 1.2 + i * .3, EV.nineveh[1] + 1, t), .55, 3.4)); }
  const crowdA = Array.from({ length: 8 }, (_, i) => { const f = mkPerson(R, .4); f.group.visible = false; lands.A.gr.add(f.group); return { f, i, a: R() * TAU, r: 1 + R() * 1.8 }; });
  const crowdB = Array.from({ length: 6 }, (_, i) => { const f = mkPerson(R, .4); f.group.visible = false; lands.B.gr.add(f.group); return { f, i, a: R() * TAU, r: 1 + R() * 1.2 }; });

  // ---- the threads of light
  const arkTop = [ARK8.x, AY0 + 2.4, ARK8.z], over = (k, dx = 0, dz = 0, dy = 2.4) => [POS[k][0] + dx, POS[k][1] + dy, POS[k][2] + dz];
  const TH = [
    ['J', arkTop, over('J', 3, 1), 9, EV.thJ[0], EV.thJ[1]], ['H', arkTop, over('H', 3, 3), 9, EV.thH[0], EV.thH[1]], ['B', arkTop, over('B', 2, 2), 10, EV.thB[0], EV.thB[1]],
    ['A', arkTop, over('A', -1, 0), 9, EV.thA[0], EV.thA[1]], ['S', arkTop, over('S', 0, 0), 9, EV.thS[0], EV.thS[1]],
    ['F1', over('S', -5.6, -4.6, 1.8), over('F1', .3, .4, 1.6), 8, EV.far[0], EV.far[1]], ['F2', over('S', 3, -6.8, 1.8), over('F2', .3, .4, 1.6), 8, EV.far[0] + .15, EV.far[1] + .15],
    ['F3', over('J', 2, 3.2, 1.6), over('F3', .3, .4, 1.6), 6, EV.farTh[0], EV.farTh[0] + 1.6], ['F4', over('B', 1, 1, 1.6), over('F4', .3, .4, 1.6), 6, EV.farTh[1] - .4, EV.farTh[1] + 1.2],
  ].map(([k, a, b, lift, t0, t1]) => { const th = makeThread(a, b, lift, k.length > 1 ? .05 : .065); g.add(th.group); return { th, t0, t1 }; });
  // short threads inside Shem's land: Arpachshad -> Shelah -> Eber, then Eber -> Peleg and Joktan
  const sp = (x, z) => [POS.S[0] + x, POS.S[1] + hS(x, z) + 1.1, POS.S[2] + z];
  const CH = [[sp(5.6, -1.2), sp(7.1, 3.0), 1.4, EV.chain[0], EV.chain[1]], [sp(7.1, 3.0), sp(4.2, 6.6), 1.4, EV.eber - 1.1, EV.eber], [sp(4.2, 6.6), sp(-5.6, -4.6), 4.5, EV.fork[0], EV.fork[1]], [sp(4.2, 6.6), sp(3.0, -6.8), 4.5, EV.fork[0] + .2, EV.fork[1] + .2]].map(([a, b, lift, t0, t1]) => { const th = makeThread(a, b, lift, .045); g.add(th.group); return { th, t0, t1 }; });
  TH.push(...CH);

  // ---- birds, sky, far mountains
  const BC = ['#f4f0e6', '#f4f0e6', '#f4f0e6', '#bdb7a8', '#d8a45a'];
  const flock = Array.from({ length: 12 }, (_, i) => { const b = makeBird(rng(800 + i), BC[i % BC.length]); b.group.scale.setScalar(.55 + .1 * R()); g.add(b.group); const c = i < 5 ? [0, 8, -4] : i < 8 ? POS.J : i < 10 ? POS.H : POS.S; return { ...b, c, r: 3 + R() * 3, h: 3.6 + R() * 2, w: (.22 + R() * .12) * (i % 2 ? 1 : -1), ph: R() * 6 }; });
  const motes = makeMotes({ n: 90, area: [14, 5, 10], size: .05, v: .16, seed: 72, color: 0xffdd90 }); hill.add(motes.mesh);
  const SH = [[-6.0, -2.0], [5.0, -1.0], [-1.0, 3.5]].map(([x, z]) => { const s = shaft(16, .9, 2.4, [1, .84, .5], 1, .3); s.position.set(x, gyC(x, z), z); s.visible = false; hill.add(s); return s; });
  const far = farMountains10(rng(63)); g.add(far);
  const keep = [[0, 0, 17], ...['J', 'H', 'B', 'A', 'S'].map(k => [POS[k][0], POS[k][2], 14]), ...['F1', 'F2', 'F3', 'F4'].map(k => [POS[k][0], POS[k][2], 8])];
  const sea = cloudSea(rng(64), 130, keep); g.add(sea.mesh);
  smoke.add(0, 0, 0, () => 0, .1, 1); g.add(smoke.mesh);
  // sea-cloud tint through the day
  const CLOUD = [[0, '#b0a8c8'], [6, '#e6e0ec'], [22, '#f0ece8'], [40, '#f0dcc4'], [52, '#f0b890'], [60, '#b88ea0'], [90, '#8a7a98']];
  const SMK = [[0, '#c8c0c8'], [10, '#e0d6c8'], [40, '#d8c6b0'], [52, '#c8a490'], [90, '#a08a90']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };

  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  function update(t, cam) {
    const cp = cam && cam.position, Tg = cam && cam.userData.T;
    // sky and clouds
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set('#5a5670'); sea.update(t, cp, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)), M = far.userData.mat, f = smooth(0, 5, t) * .66; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
    // the family
    const brth = (i) => ({ lx: .012 * Math.sin(t * 1.1 + i) });
    Object.keys(FP).forEach((k, i) => { const f = fam[k], [x, z, ry] = FP[k]; let xx = x, zz = z, rr = ry;
      if (k === 'shem') { const s = shemStep(t); xx = lerp(x, -1.15, s); zz = lerp(z, -1.8, s); rr = lerp(ry, .1, s); }
      const arms = k === 'noah' ? ease.inOutSine(seg(t, 52.0, 53.6)) * (1 - ease.inOutSine(seg(t, 58.0, 59.4))) * 1.2 : 0;
      pose(f, xx, gyC(xx, zz) - .02, zz, rr, { ...brth(i), a0x: -arms, a1x: -arms }); });
    // threads
    TH.forEach(({ th, t0, t1 }) => { const u = ease.inOutSine(seg(t, t0, t1)); th.set(u, 1); });
    // camps
    camps.forEach(c => c.update(t));
    // birds
    flock.forEach((b, i) => { const a = t * b.w + b.ph, x = b.c[0] + Math.cos(a) * b.r, z = b.c[2] + Math.sin(a) * b.r * .7, y = b.c[1] + b.h + Math.sin(t * .6 + i) * .4; b.group.visible = t > 2 + i * .3; b.group.position.set(x, y, z);
      const nx = b.c[0] + Math.cos(a + .05 * Math.sign(b.w)) * b.r, nz = b.c[2] + Math.sin(a + .05 * Math.sign(b.w)) * b.r * .7; b.group.rotation.set(0, Math.atan2(-(nz - z), nx - x), -.12 * Math.sin(t * 1.4 + i)); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .6 * smooth(2, 7, t), [0, 3, -3]);
    { const sk = smooth(1.5, 4.5, t) * (1 - smooth(20, 28, t)); SH.forEach((s, i) => { const k = sk * (1 - i * .1); s.visible = k > .01; s.material.opacity = .14 * k; }); }
    // coastlands: boats drifting along the shore (hull long axis = x)
    boats.forEach(({ b, x, z, ph, sp: sv, i }) => { const on = smooth(EV.boatsJ[0] + i * .35, EV.boatsJ[0] + i * .35 + 1.2, t); b.visible = on > .01; if (!b.visible) return;
      const a = t * .12 * sv + ph, bx = x - 1.2 + Math.cos(a) * 1.6, bz = z + Math.sin(a * 1.3) * 2.0, vx = -Math.sin(a) * 1.6, vz = Math.cos(a * 1.3) * 2.6;
      b.position.set(bx, .08 + .04 * Math.sin(t * 1.6 + ph), bz); b.rotation.set(.05 * Math.sin(t * 1.3 + ph), headX(vx, vz), .04 * Math.sin(t * 1.1 + ph)); b.scale.setScalar(on * (.9 + .02 * i)); });
    // the south: a camel caravan on a slow loop east of the river
    const LOOPC = [2.4, -.6];
    cams.forEach(({ c, i }) => { const on = smooth(EV.caravan, EV.caravan + 1.0, t); c.group.visible = on > .01; if (!c.group.visible) return; const a = t * .17 - i * .32, r = 3.7, x = LOOPC[0] + Math.cos(a) * r, z = LOOPC[1] + Math.sin(a) * r * .8, vx = -Math.sin(a) * r, vz = Math.cos(a) * r * .8;
      c.group.position.set(x, hH(x, z) - .02, z); c.group.rotation.y = headX(vx, vz); c.group.scale.setScalar(.5 * on); walkLegs(c.legs, t * 1.0 + i, 3.4, .35); });
    walkers.forEach(({ f, i }) => { const on = smooth(EV.caravan + .4, EV.caravan + 1.4, t); f.group.visible = on > .01; if (!f.group.visible) return; const a = t * .17 - (i ? 1.45 : -.2), r = 4.5, x = LOOPC[0] + Math.cos(a) * r, z = LOOPC[1] + Math.sin(a) * r * .8, vx = -Math.sin(a) * r, vz = Math.cos(a) * r * .8, w = Math.sin(t * 5 + i);
      pose(f, x, hH(x, z) - .02 + Math.abs(w) * .015, z, headZ(vx, vz), { s: on, sx: on, a0x: .35 * w, a1x: -.35 * w }); });
    // Nimrod on the ledge (stands tall, bow in hand), his hunters, the herd
    { const on = ease.outBack(seg(t, EV.nimrod, EV.nimrod + .8)); NIM.group.visible = on > .01; const ly = hB(bPos.x, bPos.z);
      pose(NIM, bPos.x, ly - .02, bPos.z, lerp(.5, .9, ease.inOutSine(seg(t, 17.6, 26))), { s: on, sx: on, lx: .01 * Math.sin(t * 1.0), a0x: -1.3, a0z: -.1, a1x: -.12 });
      hunters.forEach(({ f, i }) => { const u = ease.outCubic(seg(t, EV.nimrod + .8 + i * .3, EV.nimrod + 1.6 + i * .3)); f.group.visible = u > .01; if (u > .01) { const x = bPos.x + 1.5 + i * .85, z = bPos.z + 1.1 + (i % 2) * .5; pose(f, x, hB(x, z) - .02, z, .5, { s: u, sx: u, lx: .012 * Math.sin(t * 1.1 + i), a0x: .05, a1x: -.05 }); } });
      gaz.forEach(({ a, i }) => { const u = smooth(EV.nimrod + 1.2 + i * .25, EV.nimrod + 2.4 + i * .25, t); a.group.visible = u > .01; if (!a.group.visible) return; const ang = t * .035 + i * 1.1, rx = 2.0 + .35 * i, rz = 2.6 + .2 * i, x = -1.2 + Math.cos(ang) * rx, z = -.4 + Math.sin(ang) * rz, vx = -Math.sin(ang) * rx, vz = Math.cos(ang) * rz;
        a.group.position.set(x, hB(x, z) - .02, z); a.group.rotation.y = headX(vx, vz); a.group.scale.setScalar(.7 * u); walkLegs(a.legs, t + i, 2.1, .2); }); }
    // the cities rise out of the ground
    cityB.forEach(({ m, t0 }) => { const k = ease.outCubic(seg(t, t0, t0 + 1.4)); m.scale.y = Math.max(.001, k); m.visible = k > .002; });
    cityA.forEach(({ m, t0 }) => { const k = ease.outCubic(seg(t, t0, t0 + 1.4)); m.scale.y = Math.max(.001, k); m.visible = k > .002; });
    crowdB.forEach(({ f, i, a, r }) => { const u = ease.outCubic(seg(t, EV.babel[1] - .2 + i * .15, EV.babel[1] + .6 + i * .15)); f.group.visible = u > .01; if (u > .01) { const aa = a + t * .08 * (i % 2 ? 1 : -1), x = 2.6 + Math.cos(aa) * (r + 1.2), z = 2.2 + Math.sin(aa) * (r + 1.0) * .9, w = Math.sin(t * 4.5 + i); pose(f, x, hB(x, z) - .02 + Math.abs(w) * .012, z, headZ(-Math.sin(aa) * (i % 2 ? 1 : -1), Math.cos(aa) * (i % 2 ? 1 : -1) * .9), { s: u, sx: u, a0x: .3 * w, a1x: -.3 * w }); } });
    crowdA.forEach(({ f, i, a, r }) => { const u = ease.outCubic(seg(t, EV.nineveh[1] - .4 + i * .15, EV.nineveh[1] + .5 + i * .15)); f.group.visible = u > .01; if (u > .01) { const aa = a + t * .07 * (i % 2 ? 1 : -1), x = -1.5 + Math.cos(aa) * (r + 2.2), z = .6 + Math.sin(aa) * (r + 1.6) * .9, w = Math.sin(t * 4.5 + i); pose(f, x, hA(x, z) - .02 + Math.abs(w) * .012, z, headZ(-Math.sin(aa) * (i % 2 ? 1 : -1), Math.cos(aa) * (i % 2 ? 1 : -1) * .9), { s: u, sx: u, a0x: .3 * w, a1x: -.3 * w }); } });
    // water
    waters.forEach(w => { w.U.uT.value = t; });
    smoke.update(t, colAt(SMK, t));
    ark.group.updateMatrixWorld(true);
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#46547a', '#1c2236', .9, '#ffb888', 1.5, [-12, 4.5, 6], .5, '#6a7cff', [10, 6, -8], 14),
    Dk(6, '#5a6a98', '#262a42', 1.0, '#ffc896', 1.9, [-12, 5.5, 6], .5, '#6a7cff', [10, 6, -8], 14),
    Dk(14, '#6878a8', '#3a3040', 1.0, '#ffd8a0', 2.1, [-11, 7, 6], .45, '#7a8cff', [10, 6, -8], 14),
    Dk(26, '#7c8cb8', '#403f3c', 1.05, '#ffe2b4', 2.2, [-9, 9, 5], .4, '#8a9cff', [10, 6, -8], 14),
    Dk(40, '#7480ae', '#40383c', 1.0, '#ffc680', 2.2, [-13, 5.2, 4], .4, '#8a96ff', [10, 6, -8], 14),
    Dk(53, '#5a5a88', '#38304a', .92, '#ff9a58', 1.95, [-14, 2.8, 4], .42, '#7a8cff', [10, 6, -8], 14),
    Dk(60, '#4c5684', '#2e2c44', .86, '#d89a88', 1.5, [-12, 2.4, 4], .5, '#7a8cff', [10, 6, -8], 14)];
  const bg = [[0, ['#10163a', '#8a6a70']], [5, ['#1a2450', '#c8906a']], [12, ['#2a4a88', '#e0b888']], [26, ['#3a6ab0', '#d8d0b0']], [40, ['#3a5a98', '#f0c088']], [53, ['#2a3470', '#e89a60']], [60, ['#1c2454', '#9a6a8a']]];
  return { group: g, update, light, bg, far, hill, lands, fam };
}
