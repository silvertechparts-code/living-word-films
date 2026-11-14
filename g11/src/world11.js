// Episode 11: Genesis 11. The plain of Shinar: one people, bricks baked hard, a city and a tower. The Lord comes down (shown only as light), their speech is confused, they are scattered
// over the earth and the building stops. Then Shem's line to Terah, and Terah's family leave Ur for Canaan and settle in Haran. No one is harmed; the tower is left unfinished.
// Cinematic interpretation: the kilns, the ramp, the colours of the voices and the lit tents of the genealogy are not in the text.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow, slab } from './kit.js';
import { seg, ease, keyed, rgbOf, mx, css } from './util.js';
import { pk, tri, makeCamel, makeDonkey, makeSheep, walkLegs, roundTreeGeo, oliveGeo, palmGeo, rockGeo } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { makeMotes } from './props.js';
import { LK } from './lights.js';
import { mkIslet, mkPerson, houseBlock, wallRing, tentMesh, meshOf, makeSmoke, makeThread, cloudSea, farMountains10, headZ, C3, rimf } from './world10.js';

export const PLACE = { a1: 1.0, b1: 4.51, c1: 11.8, c2: 16.66, c3: 21.64, c4: 25.9, d1: 31.99, d2: 36.35, d3: 41.09, e1: 44.54, e2: 49.96, e3: 55.27, h1: 61.0, h2: 65.6, h3: 71.6, h4: 78.6, i: 85.3 };
export const TW = { x: 2, z: -3 };                       // the tower (centre of its base)
const RI = 24, NT = 9, TH = 1.5, S0 = 7.2, DS = .72, Y0 = .3;
export const EV = {
  walk: 4.5,
  tier: [[11.9, 13.3], [13.5, 14.5], [14.7, 15.7], [16.8, 17.7], [17.8, 18.7], [18.8, 19.7], [19.8, 20.7], [20.8, 21.8], [22.0, 23.4]],
  city: [12.2, 15.2], heavens: [13.4, 16.0], come: [21.8, 24.6], look: [22.3, 24.6], speak: [26.0, 31.0], mix: [28.9, 31.6], stun: [32.2, 35.4], scat: [36.5, 39.6],
  gen: [44.8, 48.4], jOpen: 48.0, haran: 58.0,
};
const D2R = Math.PI / 180;
const C6 = ['#ffb04a', '#5aa0ff', '#7ad08a', '#e0688a', '#a07aff', '#4ad0c8'];     // the six "languages"
const GOLD = '#ffd27a';

// ---------------- the plain of Shinar
const zr = x => -15.5 + 2.2 * Math.sin(x * .21 + .7);                                    // the river runs west to east behind the tower
const hS = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .06 * Math.sin(x * .5 + z * .3) + .045 * Math.sin(x * 1.4 - z * 1.1);
  h = lerp(h, -.3, smooth(2.0, .7, Math.abs(z - zr(x)))); h = lerp(h, .08, smooth(2.4, .9, Math.hypot(x + 7.6, z - 11.8))); h += .28 * smooth(17, 23, r) * smooth(-14, -2, z) * 0;
  return rimf(RI, h, r, -.02); };
const gcS = (x, y, z, s) => { let b = C3('#bcb070').lerp(C3('#aea668'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); const dp = Math.hypot(x - 2, z - 5);
  if (dp < 11) b.lerp(C3('#c8b184'), smooth(11, 4, dp) * .8); if (Math.hypot(x + 7.6, z - 11.8) < 3) b.lerp(C3('#8a6a48'), .8);
  const dr = Math.abs(z - zr(x)); if (dr < 3.6) b.lerp(C3('#7f9a50'), smooth(3.6, 1.4, dr) * .85); if (y < .02) b.lerp(C3('#bdb592'), .7); return b.getHex(); };
const hJ = (x, z) => { const r = Math.hypot(x, z); return rimf(16, .28 + .05 * Math.sin(x * .6 + z * .5) + .03 * Math.sin(x * 1.6 - z * 1.2), r, -.02); };
const gcJ = (x, y, z) => C3('#b2a468').lerp(C3('#c4ae82'), smooth(14, 3, Math.hypot(x, z - 2)) * .6).lerp(C3('#9a9a5e'), .4 * smooth(-1, 1, Math.sin(x * .8 + z * .6))).getHex();
const hF = Rr => (x, z) => { const r = Math.hypot(x, z); return rimf(Rr, .3 + .45 * Math.max(0, 1 - Math.hypot(x - .5, z + .3) / 1.7), r); };
const gcF = (x, y, z, s) => C3('#a29a60').lerp(C3('#9a9488'), clamp((y - .5) * 1.2)).getHex();
// the six far lands, one per language (direction from the middle of the island, distance, height)
const FAR = C6.map((c, g) => { const a = (g * 60 + 18) * D2R, d = [43, 49, 41, 51, 45, 47][g]; return { g, c, x: Math.cos(a) * d, z: Math.sin(a) * d, y: [-2.4, -3.0, -2.2, -3.2, -2.6, -2.9][g], a }; });
const GEN = Array.from({ length: 9 }, (_, k) => { const u = k / 8; return [lerp(-28.5, -46.5, u), -2.6 + 1.4 * Math.sin(u * 5.0) - 1.2 * u, -3 + 3.4 * Math.sin(u * 3.6 + .5) * .5]; });  // [x, y, z] of the nine lit tents, Shem to Terah
export const JP = [-66, -2.6, -3];                                                                     // the island of Ur and Haran

// ---------------- the tower (a stepped temple tower), built tier by tier
function tierMesh(R, k) {
  const s = S0 - k * DS, b = new GB(R), light = k % 2 ? '#c4aa80' : '#cdb48a';
  b.box(light, [0, TH / 2, 0], [s, TH, s], [0, 0, 0], .05); b.box('#a88a5e', [0, TH - .1, 0], [s + .12, .2, s + .12], [0, 0, 0], .03); b.box('#9a7c52', [0, .12, 0], [s + .1, .24, s + .1], [0, 0, 0], .03);
  const n = Math.max(2, Math.round(s / .9));
  for (let i = 0; i < n; i++) { const u = (i + .5) / n - .5; for (const [dx, dz, w, d] of [[u * s, s / 2, .34, .05], [u * s, -s / 2, .34, .05], [s / 2, u * s, .05, .34], [-s / 2, u * s, .05, .34]]) b.box('#8c6e46', [dx, TH * .52, dz], [w, .58, d], [0, 0, 0], .03); }
  if (k > 0) b.box('#2a1c10', [0, .5, s / 2 + .012], [.7, 1.0, .05], [0, 0, 0], .02);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m;
}
function scaffold(R) {   // poles and planks round the unfinished top
  const b = new GB(R), s = S0 - 8 * DS + .6;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) b.box('#6a4a2c', [x * s / 2, 1.5, z * s / 2], [.07, 3.1, .07], [0, 0, 0], .05);
  for (const y of [.9, 1.9, 2.8]) { b.box('#8a6a44', [0, y, -s / 2], [s, .06, .1], [0, 0, 0], .04); b.box('#8a6a44', [0, y, s / 2], [s, .06, .1], [0, 0, 0], .04); b.box('#8a6a44', [-s / 2, y, 0], [.1, .06, s], [0, 0, 0], .04); b.box('#8a6a44', [s / 2, y, 0], [.1, .06, s], [0, 0, 0], .04); }
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m;
}
function kilnMesh(R) {
  const b = new GB(R); b.add(G.cyl6, '#9a6a44', [0, 0, 0], [1.15, .35, 1.15], [0, 0, 0], .04); b.add(G.ico1, '#b07a50', [0, .42, 0], [1.05, .85, 1.05], [0, 0, 0], .05); b.box('#1a0e08', [0, .38, 1.02], [.55, .6, .2], [0, 0, 0], .02);
  b.box('#8a5a3a', [-.2, 1.35, -.3], [.34, 1.0, .34], [0, 0, 0], .04); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m;
}
function brickStacks(R, spots) {
  const b = new GB(R);
  for (const [x, z, nx, ny, nz] of spots) for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) { if (j > 1 && R() < .25) continue;
    b.box(pk(R, ['#b87650', '#c08658', '#b0704a']), [x + i * .3 - nx * .15, Y0 + .06 + j * .12, z + k * .19 - nz * .1], [.28, .11, .17], [0, 0, 0], .06); }
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m;
}
const mkBrick = () => { const b = new GB(rng(3)); b.box('#b8794e', [0, 0, 0], [.46, .1, .28], [0, 0, 0], .04); b.box('#c58a58', [.02, .1, 0], [.44, .1, .26], [0, .1, 0], .04); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.position.set(0, .62, .32); return m; };

// ====================================================================== the world
export function makeBabel() {
  const R = rng(1111), g = new THREE.Group(), smoke = makeSmoke(20);
  const isl = new THREE.Group(); g.add(isl); isl.add(mkIslet(rng(7101), RI, hS, gcS, 34, 88), underRock(rng(7102), RI - .1));

  // ---- the river (a flat ribbon between the banks), trees, rocks
  { const gb = new GB(R), A = [], B = []; for (let x = -17.4; x <= 17.4; x += .6) { const z = zr(x), w = 1.5 + .25 * Math.sin(x * .7); A.push([x, -.04, z - w]); B.push([x, -.04, z + w]); }
    for (let i = 0; i + 1 < A.length; i++) { const c = (i & 1) ? '#5a88aa' : '#4f7fa4'; tri(gb, A[i], B[i], B[i + 1], c, .06); tri(gb, A[i], B[i + 1], A[i + 1], c, .06); }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; isl.add(m); }
  const hOf = (x, z) => hS(x, z), tree = (x, z, s, kind) => { const geo = kind === 'palm' ? palmGeo(s, R) : kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, ['#7a9a4a', '#6a8a40', '#88a655', '#5f8a3a']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hOf(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; isl.add(m); };
  for (let i = 0; i < 18; i++) { const x = -16 + i * 1.9 + R(), z = zr(x) + (R() < .5 ? -1 : 1) * (2.4 + R() * 1.6); if (Math.hypot(x, z) < 21.5) tree(x, z, .9 + R() * .5, i % 3 ? 'palm' : 'round'); }
  [[-17, 4], [-18, -4], [16.5, 4], [17.5, -3], [14.5, 12], [-14, 15], [8, 19], [-4, 20], [19, 9], [-19, 9]].forEach(([x, z], i) => { if (Math.hypot(x, z) < 21.5) tree(x, z, 1.0 + R() * .3, i % 2 ? 'olive' : 'round'); });
  { const b = new GB(R); for (let k = 0; k < 20; k++) { const a = R() * TAU, r = 6 + R() * 15, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hOf(x, z) < .15 || Math.hypot(x - 2, z - 3) < 9) continue; b.add(G.ico0, pk(R, ['#8f8b82', '#a39f95', '#77746c']), [x, hOf(x, z), z], [.2 + R() * .3, .14 + R() * .16, .2 + R() * .3], [R() * 3, R() * 3, 0], .06); } const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; isl.add(m); }

  // ---- the kilns, the brick stacks and the city
  const KILNS = [[-11.8, 3.2], [-12.6, 7.6], [-9.8, 11.0]], fires = [];
  KILNS.forEach(([x, z], i) => { const m = kilnMesh(R); m.position.set(x, hOf(x, z) - .02, z); m.rotation.y = .5 * (i - 1) * .4; isl.add(m); const f = spriteGlow(x + .05, Y0 + .45, z + 1.0, .95, 0xff8a30, 0), f2 = spriteGlow(x + .05, Y0 + .4, z + 1.05, .4, 0xffe0a0, 0); isl.add(f, f2); fires.push({ f, f2, ph: i * 1.7 });
    smoke.add(x - .2, Y0 + 2.0, z - .3, t => smooth(EV.walk, EV.walk + 2.2, t) * (1 - smooth(37, 42, t) * .75), .5, 3.4); });
  isl.add(brickStacks(R, [[-6.8, 5.4, 4, 4, 3], [-5.2, 8.4, 5, 3, 2], [-8.2, 8.6, 3, 3, 3], [4.8, 7.8, 4, 3, 3], [-1.6, 9.2, 3, 2, 2]]));
  { const b = new GB(R); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) b.box('#c4915e', [-9.3 + i * .34, Y0 + .03, 12.8 + j * .22 - 1.2], [.3, .05, .18], [0, 0, 0], .06); const m = new THREE.Mesh(b.build(), lam); isl.add(m); }
  const blocks = [[-7.4, -3.2, 3, 3, 1.05, EV.city[0] + .3], [11.4, -3.0, 3, 3, 1.05, EV.city[0] + 1.0], [6.4, -10.4, 4, 2, 1.1, EV.city[0] + 1.8], [12.2, 5.4, 2, 3, 1.05, EV.city[0] + 2.4], [-3.4, -10.6, 3, 2, 1.05, EV.city[0] + 2.8], [13.2, -9.6, 2, 2, 1.0, EV.city[0] + 3.0]].map(([x, z, nx, nz, sp, t0]) => { const m = meshOf(houseBlock(R, x, z, nx, nz, sp, hOf, 0)); m.scale.y = .001; isl.add(m); smoke.add(x + .2, Y0 + 1.2, z + .1, t => smooth(t0 + 1.2, t0 + 2.6, t) * (1 - smooth(36, 42, t) * .85), .4, 2.6); return { m, t0 }; });

  // ---- the tower
  const tiers = Array.from({ length: NT }, (_, k) => { const m = tierMesh(R, k), gr = new THREE.Group(); gr.add(m); gr.position.set(TW.x, Y0 - .05 + k * TH, TW.z); gr.scale.y = .001; gr.visible = false; isl.add(gr); return gr; });
  const ramp = (() => { const b = new GB(R), L = Math.hypot(5.8, 1.45), ang = Math.atan2(1.45, 5.8); b.box('#bda57a', [0, 0, 0], [2.7, .2, L], [ang, 0, 0], .04); b.box('#a88a5e', [-1.4, -.2, 0], [.14, .55, L], [ang, 0, 0], .04); b.box('#a88a5e', [1.4, -.2, 0], [.14, .55, L], [ang, 0, 0], .04);
    for (let k = 0; k < 10; k++) b.box('#9a7c52', [0, .02 + .001 * k, -L / 2 + (k + .5) * L / 10 * 1.0], [2.6, .03, .05], [ang, 0, 0], .02);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; m.position.set(2.0, Y0 + .8, 3.6); m.scale.set(1, 1, 1); m.visible = false; isl.add(m); return m; })();
  const scaf = scaffold(R); scaf.position.set(TW.x, Y0 - .05 + 8 * TH, TW.z); scaf.visible = false; isl.add(scaf);
  const hoist = (() => { const gr = new THREE.Group(), b = new GB(R); b.box('#6a4a2c', [0, 0, 0], [.1, 2.0, .1], [0, 0, 0], .04); b.box('#6a4a2c', [1.4, 1.0, 0], [3.0, .08, .08], [0, 0, 0], .04); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m);
    const rope = new THREE.Mesh(new THREE.BoxGeometry(.02, 1, .02), new THREE.MeshBasicMaterial({ color: 0x3a2a1c, toneMapped: false })); rope.position.set(2.7, 0, 0); gr.add(rope);
    const lb = new GB(R); lb.box('#b8794e', [0, 0, 0], [.5, .22, .3], [0, 0, 0], .04); lb.box('#c58a58', [0, .2, 0], [.46, .18, .28], [0, 0, 0], .04); const load = new THREE.Mesh(lb.build(), lam); load.position.set(2.7, -1, 0); gr.add(load);
    gr.visible = false; isl.add(gr); return { gr, rope, load }; })();
  // the light that comes down (only light), a pool and rings on the plaza
  const TOPY = 60, LH = 59, beam = shaft(LH, 2.6, 3.4, [1, .9, .64], 1, .6); beam.position.set(TW.x, 1, TW.z); beam.visible = false; isl.add(beam);
  const beam2 = shaft(LH, 1.0, 1.4, [1, .96, .82], 1, .8); beam2.position.set(TW.x, 1, TW.z); beam2.visible = false; isl.add(beam2);
  const plaza = pool(9.5, 0xffe6b0, 0); plaza.position.set(TW.x, Y0 + .06, 5.5); isl.add(plaza);
  const rings = [0, 1, 2].map(i => { const r = ringMesh(3, .22, 0xffe6b0, 0); r.position.set(TW.x, Y0 + .08, 5.5); isl.add(r); return r; });
  // clouds that gather round the tower top and then open
  const cl = (() => { const n = 24, mat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), m = new THREE.InstancedMesh(G.ico1, mat, n), items = [], ob = new THREE.Object3D(); m.frustumCulled = false;
    for (let i = 0; i < n; i++) items.push({ a: i / n * TAU + R() * .3, r0: 4.2 + R() * 4.5, y: 11.6 + R() * 5.5, s: 1.9 + R() * 1.7, ph: R() * 6, d: i / n });
    function update(t) { items.forEach((c, i) => { const on = smooth(EV.heavens[0] + c.d * 1.6, EV.heavens[0] + c.d * 1.6 + 1.6, t), open = ease.inOutSine(seg(t, EV.come[0] - .2, EV.come[1] + 1.0)), a = c.a + t * .02, r = c.r0 + open * 11 + .3 * Math.sin(t * .3 + c.ph), sc = c.s * on * (1 - .35 * open);
      ob.position.set(TW.x + Math.cos(a) * r, c.y + Math.sin(t * .25 + c.ph) * .2, TW.z + Math.sin(a) * r); ob.scale.set(sc, sc * .5, sc * .85); ob.rotation.set(0, c.ph, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); }); m.instanceMatrix.needsUpdate = true; }
    return { mesh: m, update, mat }; })(); isl.add(cl.mesh);

  // ---- the people of Shinar: one crowd, one language. They gather, work, look up, are confused and leave in six groups.
  const N = 30, ring = Array.from({ length: N }, (_, i) => { const r = .8 + 3.7 * Math.sqrt((i + .5) / N), a = i * 2.39996; return [2 + Math.cos(a) * r, 9.2 + Math.sin(a) * r]; });
  const grp = ring.map(([x, z]) => Math.floor(((Math.atan2(z - 9.2, x - 2) + Math.PI) / TAU) * 6) % 6);
  const rimT = grp.map((gg, i) => { const [x, z] = ring[i], a = (gg + .5) / 6 * TAU - Math.PI, dx = Math.cos(a), dz = Math.sin(a); let L = 1; for (let s = 2; s < 40; s += .25) { if (Math.hypot(2 + dx * s, 9.2 + dz * s) > 20.4) { L = s; break; } } return [2 + dx * L + (R() - .5) * 1.4, 9.2 + dz * L + (R() - .5) * 1.4]; });
  const P = [[-8.8, 5.0, Y0], [-4.4, 5.8, Y0], [2.9, 6.6, Y0], [2.9, .66, Y0 + 1.45], [2.9, .26, Y0 + 1.45], [1.1, .26, Y0 + 1.45], [1.1, .66, Y0 + 1.45], [1.1, 6.6, Y0], [-4.0, 7.6, Y0], [-8.8, 6.6, Y0]];
  const LEN = P.map((p, i) => Math.hypot(P[(i + 1) % P.length][0] - p[0], P[(i + 1) % P.length][1] - p[1], 0)), CUM = LEN.reduce((a, l) => (a.push(a[a.length - 1] + l), a), [0]), LT = CUM[P.length], SPD = 1.35;
  function loopAt(i, t) { const u = ((((t - EV.walk) * SPD + i / N * LT) % LT) + LT) % LT; let s = 0; while (s < P.length - 1 && CUM[s + 1] <= u) s++; const k = (u - CUM[s]) / LEN[s], a = P[s], b = P[(s + 1) % P.length];
    let vis = 1; if (s === 4) vis = 0; else if (s === 3) vis = 1 - smooth(LEN[3] * .6, LEN[3], u - CUM[3]); else if (s === 5) vis = smooth(0, LEN[5] * .5, u - CUM[5]);
    return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), vis, carry: s < 4 }; }
  const works = Array.from({ length: N }, (_, i) => { const f = mkPerson(R, .42); f.group.visible = false; isl.add(f.group); const br = mkBrick(); br.visible = false; f.group.add(br); const orb = spriteGlow(0, 0, 0, .8, 0xffd27a, 0); isl.add(orb); return { f, br, orb, i }; });
  const ORB = 16;
  // far lands (one per language), the threads and the camps on them
  const fars = FAR.map(F => { const gr = new THREE.Group(); gr.position.set(F.x, F.y, F.z); gr.visible = false; g.add(gr); const ur = underRock(rng(7210 + F.g), 3.0); ur.scale.y = .38; gr.add(mkIslet(rng(7200 + F.g), 3.4, hF(3.4), gcF, 10, 28), ur);
    const tm = tentMesh(R, pk(R, ['#cdb48c', '#c2a67a', '#d4c29c']), .75); tm.position.set(.2, hF(3.4)(.2, .2), .2); tm.scale.setScalar(.001); gr.add(tm);
    const fire = spriteGlow(.9, .4, .9, .7, 0xffa040, 0); gr.add(fire); const ppl = [0, 1].map(k => { const f = mkPerson(R, .4); f.group.visible = false; f.group.position.set(-.5 + k * 1.2, .3, 1.2); gr.add(f.group); return f; });
    const tgt = [F.x - 0, F.y + 1.4, F.z], a = F.a, d0 = Math.hypot(rimT.find((_, i) => grp[i] === F.g)[0], rimT.find((_, i) => grp[i] === F.g)[1]);
    const rp = rimT.filter((_, i) => grp[i] === F.g), st = rp.length ? [rp.reduce((s, q) => s + q[0], 0) / rp.length, rp.reduce((s, q) => s + q[1], 0) / rp.length] : [Math.cos(a) * 21, Math.sin(a) * 21];
    const th = makeThread([st[0], Y0 + .9, st[1]], [F.x, F.y + 1.6, F.z], 5, .06); th.group.traverse(o => { if (o.material && o.material.color) o.material.color.set(F.c); }); g.add(th.group); return { gr, tm, fire, ppl, th, F, d0 }; });
  // ---- the genealogy: nine lit tents from Shem to Terah, and a thread to Ur
  const gen = GEN.map(([x, y, z], k) => { const gr = new THREE.Group(); gr.position.set(x, y, z); g.add(gr); { const sl = slab(R, 1.0 + (k === 8 ? .3 : 0), '#7a8a4a'); sl.scale.y = .36; gr.add(sl); } const tm = tentMesh(R, k === 8 ? '#e0c898' : '#cdb48c', k === 8 ? .55 : .38); tm.position.set(0, .0, 0); gr.add(tm);
    const gl = spriteGlow(.1, .45, .35, k === 8 ? 1.5 : 1.0, 0xffc060, 0); gr.add(gl); return { gr, tm, gl, t0: EV.gen[0] + k * .38 }; });
  const gth = GEN.map((p, k) => { const q = k === 0 ? [-23.5, 1.2, -3 + 1.0] : GEN[k - 1], a = k === 0 ? q : [q[0], q[1] + .9, q[2]], b = [p[0], p[1] + .9, p[2]], th = makeThread(a, b, .6, .035); g.add(th.group); return { th, t0: EV.gen[0] + k * .38 - .25, t1: EV.gen[0] + k * .38 + .25 }; });
  { const th = makeThread([GEN[8][0], GEN[8][1] + .9, GEN[8][2]], [JP[0] + 15.5, JP[1] + 1.2, JP[2] + 5], .8, .045); g.add(th.group); gth.push({ th, t0: EV.gen[0] + 3.2, t1: EV.gen[1] + .4 }); }

  // ---- the island of Ur and Haran
  const jg = new THREE.Group(); jg.position.set(...JP); jg.visible = false; g.add(jg); jg.add(mkIslet(rng(7301), 16, hJ, gcJ, 28, 72), underRock(rng(7302), 15.9));
  const jh = (x, z) => hJ(x, z);
  { const ur = new THREE.Group(); jg.add(ur); ur.add(meshOf(houseBlock(R, 1.0, 9.8, 4, 3, 1.0, jh, 0)), meshOf(wallRing(R, 1.0, 9.6, 3.9, 2.9, jh, 0, true)));
    const zb = new GB(R); for (let k = 0; k < 3; k++) zb.box(pk(R, ['#d4c29c', '#cbb78e', '#c2ae86']), [1.0, jh(1, 9.6) + .25 + k * .5, 9.4], [2.2 - k * .65, .5, 2.2 - k * .65], [0, 0, 0], .04); const zm = new THREE.Mesh(zb.build(), lam); zm.castShadow = true; ur.add(zm);
    smoke.add(JP[0] + 2.4, JP[1] + 1.4, JP[2] + 9.2, t => smooth(47, 50, t), .45, 2.8); }
  for (let i = 0; i < 12; i++) { const a = R() * TAU, r = 5 + R() * 9, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - 1, z - 9.6) < 6.5 || Math.hypot(x + 3.2, z - 4) < 2.6 || Math.hypot(x - 1.5, z + 3.5) < 3) continue; const m = new THREE.Mesh(i % 3 ? oliveGeo(1.0 + R() * .3, R) : palmGeo(1.0, R), lam); m.position.set(x, jh(x, z) - .02, z); m.castShadow = true; jg.add(m); }
  const CAMP = [-3.2, 4.0], HAR = [1.5, -3.5];
  const jtents = [[-4.9, 3.2, .46, '#cdb48c'], [-1.5, 3.2, .42, '#c2a67a']].map(([x, z, s, c]) => { const m = tentMesh(R, c, s); m.position.set(x, jh(x, z), z); m.rotation.y = (x < -3 ? .5 : -.4); jg.add(m); return m; });
  const hTents = [[1.5, -3.5, .5, '#d4c29c'], [-.2, -4.2, .44, '#cdb48c'], [3.2, -4.2, .46, '#c2a67a']].map(([x, z, s, c], i) => { const m = tentMesh(R, c, s); m.position.set(x, jh(x, z), z); m.rotation.y = .3 - i * .5; m.scale.setScalar(.001); jg.add(m); return m; });
  const fl1 = new THREE.PointLight(0xff9a50, 0, 9, 1.4), fl2 = new THREE.PointLight(0xff9a50, 0, 9, 1.4); jg.add(fl1, fl2);
  const jfire = spriteGlow(CAMP[0], jh(CAMP[0], CAMP[1]) + .3, CAMP[1], .9, 0xffa040, 0), jfire2 = spriteGlow(CAMP[0], jh(CAMP[0], CAMP[1]) + .26, CAMP[1], .4, 0xffe0a0, 0), hfire = spriteGlow(HAR[0] + 1.2, jh(HAR[0] + 1.2, HAR[1] + 1) + .3, HAR[1] + 1, .85, 0xffa040, 0); jg.add(jfire, jfire2, hfire);
  { const lg = new GB(R); lg.box('#4a3020', [0, .04, 0], [.5, .07, .1], [0, .5, 0], .03); lg.box('#4a3020', [0, .04, 0], [.5, .07, .1], [0, -.5, 0], .03); for (const [x, z] of [CAMP, [HAR[0] + 1.2, HAR[1] + 1]]) { const lm = new THREE.Mesh(lg.build(), lam); lm.position.set(x, jh(x, z), z); jg.add(lm); } }
  const FAM = { terah: person(R, { pants: '#7a5a3a', top: '#c9a15a', skin: '#b57a50', hair: '#d6d0c4', beard: '#d6d0c4', sash: '#3a2a1a', seed: 51 }, .5), abram: person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48),
    sarai: person(R, { pants: '#d9ccb0', top: '#5e7fa6', skin: '#c98d62', hair: '#2a1a10', long: true, cloth: '#efe4cc', seed: 53 }, .45), lot: person(R, { pants: '#6a5a3a', top: '#8a9a6a', skin: '#b57a50', hair: '#3a2616', seed: 54 }, .44) };
  Object.values(FAM).forEach(f => jg.add(f.group));
  const beasts = [0, 1].map(i => { const c = makeCamel(rng(120 + i)); c.group.scale.setScalar(.5); jg.add(c.group); return c; }), donkey = makeDonkey(rng(130)); donkey.group.scale.setScalar(.5); jg.add(donkey.group);
  const sheep = [0, 1, 2].map(i => { const s = makeSheep(rng(140 + i)); s.group.scale.setScalar(.55); jg.add(s.group); return s; });
  // lantern-bearing walkers keep their lines straight: positions on the way from the camp to Haran
  const caravan = [['terah', 0, -.3], ['abram', .5, .5], ['sarai', 1.0, -.9], ['lot', 1.5, .9]].map(([k, d, lat]) => ({ k, d, lat })), animals = [[beasts[0], 1.0, 1.4], [beasts[1], 1.7, -1.5], [donkey, 1.25, 0], [sheep[0], 2.4, -.5], [sheep[1], 2.7, .6], [sheep[2], 3.0, 0]];

  // ---- sky: stars for the night shots, far mountains, motes, the sea of clouds
  const stars = (() => { const n = 260, pos = new Float32Array(n * 3), rn = rng(99); for (let i = 0; i < n; i++) { const a = rn() * TAU, e = (.12 + .75 * rn()) * Math.PI / 2, d = 150; pos.set([Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const mat = new THREE.PointsMaterial({ color: 0xfff2d8, size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }); const p = new THREE.Points(geo, mat); p.frustumCulled = false; return p; })(); g.add(stars);
  const far = farMountains10(rng(63)); g.add(far);
  const motes = makeMotes({ n: 80, area: [18, 6, 14], size: .05, v: .15, seed: 72, color: 0xffdd90 }); isl.add(motes.mesh);
  const keep = [[0, 0, 27], [JP[0], JP[2], 19], [-37, -2.5, 10], ...FAR.map(F => [F.x, F.z, 7])];
  const sea = cloudSea(rng(64), 150, keep); g.add(sea.mesh);
  smoke.add(0, 0, 0, () => 0, .1, 1); g.add(smoke.mesh);
  const CLOUD = [[0, '#e8d8d0'], [12, '#f4f0ea'], [24, '#d0d0dc'], [32, '#a8a8bc'], [38, '#f0b890'], [44, '#b88ea0'], [50, '#5a6288'], [90, '#4c5478']];
  const CEM = [[0, '#5a5670'], [38, '#5a5670'], [44, '#4a4460'], [50, '#262a46'], [90, '#222640']];
  const SMK = [[0, '#c8c0c8'], [10, '#e0d6c8'], [38, '#d8c6b0'], [46, '#a8908c'], [90, '#707490']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  const walkAnim = (t, ph = 0, sp = 6.2) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function update(t, cam) {
    const cp = cam && cam.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cp, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)), M = far.userData.mat, f = smooth(0, 5, t) * .66; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
    stars.material.opacity = .9 * smooth(44, 50, t);
    cl.mat.color.set(colAt(CLOUD, t)); cl.mat.emissive.set('#3c3a52'); cl.update(t);
    // kilns glow, city and tower rise
    fires.forEach(({ f, f2, ph }) => { const o = smooth(EV.walk - 1, EV.walk + 1, t) * (1 - smooth(37, 41, t) * .85), fl = .8 + .2 * Math.sin(t * 13 + ph) * Math.sin(t * 7.3 + ph); f.material.opacity = .6 * o * fl; f2.material.opacity = .5 * o; f.visible = f2.visible = o > .01; });
    blocks.forEach(({ m, t0 }) => { const k = ease.outCubic(seg(t, t0, t0 + 1.4)); m.scale.y = Math.max(.001, k); m.visible = k > .002; });
    tiers.forEach((gr, k) => { const [a, b] = EV.tier[k], u = ease.outCubic(seg(t, a, b)), full = k === NT - 1 ? .55 : 1; gr.scale.y = Math.max(.001, u * full); gr.visible = u > .002; });
    ramp.visible = t > EV.tier[0][0] + .6; scaf.visible = t > EV.tier[7][0]; { const y = Y0 - .05 + 8 * TH + .55 * TH; scaf.position.y = Y0 - .05 + 8 * TH; hoist.gr.visible = t > EV.tier[8][0]; hoist.gr.position.set(TW.x - .3, y, TW.z + .5);
      const alive = 1 - smooth(EV.come[0] + 1, EV.come[1], t), bob = alive * Math.sin(t * 1.3) * .35, len = 1.7 + bob + (1 - alive) * .0; hoist.rope.scale.y = len; hoist.rope.position.y = -len / 2 + 1.0; hoist.load.position.y = 1.0 - len - .1; }
    // light from above
    { const k = ease.inOutSine(seg(t, EV.come[0], EV.come[1])), fade = 1 - smooth(34.5, 37.5, t); for (const [b, s] of [[beam, 1], [beam2, 1]]) { b.visible = k > .003 && fade > .01; b.scale.set(1, Math.max(.001, k), 1); b.position.y = TOPY - LH * k; b.material.opacity = (.55 + .06 * Math.sin(t * 2.0)) * fade * (s === 1 ? (b === beam ? 1 : .8) : 1); }
      const pa = ease.inOutSine(seg(t, EV.come[1] - .6, EV.speak[0] + 1.5)) * (1 - smooth(34.5, 38, t)); plaza.material.opacity = .5 * pa; plaza.visible = pa > .01;
      rings.forEach((r, i) => { const u = (((t - EV.speak[0]) * .22 + i / 3) % 1 + 1) % 1, on = smooth(EV.speak[0], EV.speak[0] + 1, t) * (1 - smooth(32, 35, t)); r.visible = on > .01; r.scale.setScalar(.3 + u * 3.2); r.material.opacity = .5 * on * Math.sin(Math.PI * u); }); }
    // the people
    works.forEach(({ f, br, orb, i }) => {
      const [gx, gz] = ring[i], dd = i * .037, gg = grp[i], [rx, rz] = rimT[i];
      let x = gx, z = gz, y = hOf(gx, gz), ry = Math.atan2(2 - gx, 9.2 - gz), vis = 1, carry = false, arms = {}, lean = 0, hop = 0;
      const m1 = ease.inOutSine(seg(t, EV.walk + dd * 1.2, EV.walk + 3.6 + dd * 1.2)), m2 = ease.inOutSine(seg(t, EV.look[0] + dd, EV.look[1] + dd)), m3 = ease.inOutSine(seg(t, EV.scat[0] + (gg % 3) * .12 + dd * .6, EV.scat[1] + (gg % 3) * .12 + dd * .6));
      const at = tt => { const L = loopAt(i, tt); let px = lerp(gx, L.x, m1), pz = lerp(gz, L.z, m1), py = lerp(hOf(gx, gz), L.y, m1), v = lerp(1, L.vis, m1);
        px = lerp(px, gx, m2); pz = lerp(pz, gz, m2); py = lerp(py, hOf(gx, gz), m2); v = lerp(v, 1, m2);
        // stun: pairs step toward each other, then part
        const sd = ease.inOutSine(seg(tt, EV.stun[0], EV.stun[0] + 1.2)) * (1 - ease.inOutSine(seg(tt, EV.stun[1] - .6, EV.stun[1] + .4))); const pj = (i ^ 1) < N ? ring[i ^ 1] : [gx, gz]; px = lerp(px, lerp(gx, pj[0], .28), sd); pz = lerp(pz, lerp(gz, pj[1], .28), sd);
        px = lerp(px, rx, m3); pz = lerp(pz, rz, m3); py = lerp(py, hOf(rx, rz), m3); return [px, py, pz, v, L.carry]; };
      const [px, py, pz, v0, car0] = at(t), [qx, , qz] = at(t + .05); x = px; z = pz; y = py; vis = v0 * (1 - smooth(.86, 1.0, m3));
      const mv = Math.hypot(qx - px, qz - pz) / .05, walking = mv > .25;
      if (walking) ry = headZ(qx - px, qz - pz); else ry = lerp(Math.atan2(2 - gx, 9.2 - gz), Math.PI, m2);
      const w = walkAnim(t, i * 1.3, 2.4 + mv * 2.2); if (walking) { arms = { a0x: w.a0x, a1x: w.a1x }; hop = w.hop; }
      carry = car0 && m1 > .9 && m2 < .15 && t < EV.look[0] + 1.5; if (carry) { arms = { a0x: -1.15, a1x: -1.15 }; lean = .1; }
      if (!walking && m2 > .98 && t < EV.stun[0]) lean = -.12 * (1 - smooth(EV.speak[1], EV.speak[1] + 2, t) * .6);
      if (t > EV.stun[0] - .2 && t < EV.scat[0] + .5) { const k = smooth(EV.stun[0] - .2, EV.stun[0] + .6, t), ph = i * 1.9; arms = { a0x: -.9 * k * Math.max(0, Math.sin(t * 2.6 + ph)) , a1x: -.7 * k * Math.max(0, Math.sin(t * 2.2 + ph + 1)), a0z: -.2 - .6 * k * Math.max(0, Math.sin(t * 1.7 + ph)) }; lean = .06 * k * Math.sin(t * 3.1 + ph);
        const turn = ease.inOutSine(seg(t, EV.stun[1] - .4, EV.stun[1] + .5)); ry += (i & 1 ? 1 : -1) * 2.4 * turn; ry += .35 * k * Math.sin(t * 1.9 + ph); }
      f.group.visible = vis > .01; br.visible = carry && vis > .5;
      pose(f, x, y - .02 + hop, z, ry, { ...arms, lx: lean + .012 * Math.sin(t * 1.1 + i), s: Math.max(.001, vis), sx: Math.max(.001, vis) });
      // the voices (one gold colour while they speak one language; six colours when the speech is confused)
      if (i < ORB) { const on = Math.max(smooth(.6, 1.6, t) * (1 - smooth(4.0, 5.0, t)), smooth(25.4, 26.4, t)) * (1 - smooth(EV.scat[0] - .3, EV.scat[0] + .8, t)) * vis, mixk = ease.inOutSine(seg(t, EV.mix[0] + i * .06, EV.mix[1] + i * .06));
        const c = new THREE.Color(GOLD).lerp(new THREE.Color(C6[i % 6]), mixk); orb.material.color.copy(c); orb.position.set(x, y + .62 + .05 * Math.sin(t * 2.1 + i) + mixk * .05 * Math.sin(t * 9 + i), z); orb.scale.setScalar(.5 + .22 * mixk * Math.sin(t * 7 + i * 2)); orb.material.opacity = .85 * on * (.7 + .3 * Math.sin(t * 3 + i)); orb.visible = on > .01; }
      else orb.visible = false;
    });
    // the scattering: threads run out to the six far lands, a camp lights on each
    fars.forEach(({ gr, tm, fire, ppl, th, F }, k) => { const rise = ease.outBack(seg(t, EV.scat[0] + .1 + k * .15, EV.scat[0] + 1.3 + k * .15)); gr.visible = rise > .01; gr.scale.setScalar(Math.max(.001, rise)); gr.position.y = F.y - 2.5 * (1 - Math.min(1, rise)); const u = ease.inOutSine(seg(t, EV.scat[0] + .6 + k * .15, EV.scat[1] + 1.2 + k * .15)); th.set(u, 1 - smooth(40.6, 42.4, t)); const arr = seg(t, EV.scat[1] + 1.6 + k * .15, EV.scat[1] + 2.2 + k * .15), c = ease.outBack(arr);
      tm.scale.setScalar(Math.max(.001, c)); tm.visible = arr > .01; fire.material.opacity = .62 * smooth(0, 1, arr) * (.85 + .15 * Math.sin(t * 13 + k)); fire.visible = arr > .01; ppl.forEach((p, j) => { const q = ease.outCubic(seg(arr, .3 + j * .2, 1)); p.group.visible = q > .01; pose(p, -.5 + j * 1.2, .3, 1.2, .4 + j * 1.2, { s: q, sx: q, lx: .012 * Math.sin(t * 1.1 + j) }); }); });
    // the nine tents
    jg.visible = t > 43.6; jg.scale.setScalar(Math.max(.001, ease.outCubic(seg(t, 43.8, 46.0))));
    gen.forEach(({ gr, tm, gl, t0 }, k) => { gr.visible = t > 44.2 + k * .05; const u = ease.outBack(seg(t, t0, t0 + .7)); tm.scale.setScalar(Math.max(.001, u)); tm.visible = u > .01; gl.material.opacity = (.65 + .1 * Math.sin(t * 3 + k)) * smooth(t0 + .2, t0 + .9, t); gl.visible = gl.material.opacity > .01; gr.position.y = GEN[k][1] + .03 * Math.sin(t * .7 + k); });
    gth.forEach(({ th, t0, t1 }) => th.set(ease.inOutSine(seg(t, t0, t1)), 1));
    // Ur and Haran
    { const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), on = smooth(47.5, 49.5, t); jfire.material.opacity = .62 * on * fl; jfire2.material.opacity = .5 * on; jfire.visible = jfire2.visible = on > .01; hfire.material.opacity = .62 * smooth(58.2, 59.0, t) * fl; hfire.visible = hfire.material.opacity > .01;
      fl1.position.set(CAMP[0], jh(CAMP[0], CAMP[1]) + .55, CAMP[1]); fl1.intensity = 9 * on * (1 - smooth(57.4, 58.6, t) * .8) * fl; fl2.position.set(HAR[0] + 1.2, jh(HAR[0] + 1.2, HAR[1] + 1) + .55, HAR[1] + 1); fl2.intensity = 9 * smooth(58.2, 59.2, t) * fl; }
    const dep = 55.6, tvl = 3.7, hh = (x, z) => jh(x, z);
    const stand = { terah: [-5.0, 2.7, 1.3], abram: [-3.9, 4.45, 1.45], sarai: [-2.5, 4.45, -1.5], lot: [-3.2, 2.5, .2] };
    Object.entries(FAM).forEach(([k, f]) => { const sp = stand[k], cv = caravan.find(c => c.k === k), a = ease.inOutSine(seg(t, dep + cv.d * .38, dep + cv.d * .38 + tvl)), tx = HAR[0] - .4 + cv.lat * .9, tz = HAR[1] + 1.2 + cv.d * .5;
      const x = lerp(sp[0], tx, a), z = lerp(sp[1], tz, a), mv = a > .01 && a < .99, w = walkAnim(t, cv.d * 2, 6.4);
      let ry = mv ? headZ(tx - sp[0], tz - sp[1]) : (a >= .99 ? Math.PI + .3 * cv.lat : headZ(CAMP[0] - sp[0], CAMP[1] - sp[1])), arms = mv ? { a0x: w.a0x, a1x: w.a1x } : {};
      if (!mv && a < .01 && t < dep) { if (k === 'sarai') arms = { a0x: -.55, a1x: -.55 }; if (k === 'abram') arms = { a0x: -.15 * Math.sin(t * .8), a1x: -.1 }; ry += .06 * Math.sin(t * .5 + cv.d); }
      pose(f, x, hh(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...arms, lx: .01 * Math.sin(t * 1.1 + cv.d) }); });
    animals.forEach(([an, d, lat], i) => { const sp = [-5.6 + i * .5, 5.0 - (i % 3) * .5], a = ease.inOutSine(seg(t, dep + d * .38, dep + d * .38 + tvl)), tx = HAR[0] - 1.6 + lat * .8 + (i > 2 ? 1.5 : 0), tz = HAR[1] + 2.4 + d * .45, x = lerp(sp[0], tx, a), z = lerp(sp[1], tz, a), mv = a > .01 && a < .99;
      an.group.position.set(x, hh(x, z) - .02, z); an.group.rotation.y = mv ? Math.atan2(-(tz - sp[1]), tx - sp[0]) : (a >= .99 ? 1.2 : 0); if (mv) walkLegs(an.legs, t + i, 2.8, .3); });
    hTents.forEach((m, i) => { const u = ease.outBack(seg(t, EV.haran + i * .25, EV.haran + .7 + i * .25)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    motes.update(t, .5 * smooth(2, 7, t) * (1 - smooth(40, 44, t)), [0, 3, 2]);
    waterBlank(); smoke.update(t, colAt(SMK, t));
  }
  const waterBlank = () => { };
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#5a6a98', '#3a3040', 1.0, '#ffc890', 2.0, [-12, 5.5, 6], .5, '#6a7cff', [10, 6, -8], 16),
    Dk(11, '#7c8cb8', '#403f3c', 1.05, '#ffe2b4', 2.3, [-9, 9, 5], .4, '#8a9cff', [10, 6, -8], 16),
    Dk(21, '#7480ae', '#40383c', 1.0, '#ffe8c0', 2.2, [-10, 8, 5], .4, '#8a9cff', [10, 6, -8], 16),
    Dk(25, '#6a78a8', '#363444', .96, '#fff0d4', 1.5, [-10, 8, 5], .5, '#a8b4ff', [10, 6, -8], 16),
    Dk(32, '#6a78a0', '#34344a', 1.0, '#ecdcc4', 1.45, [-10, 8, 5], .5, '#8a9cff', [10, 6, -8], 16),
    Dk(38, '#8a7aa0', '#4a3a4a', 1.1, '#ffb070', 2.1, [-12, 6.5, 5], .45, '#7a8cff', [10, 6, -8], 16),
    Dk(45, '#4a5282', '#2a2438', .88, '#d88a70', 1.25, [-12, 3.8, 4], .5, '#7a8cff', [10, 6, -8], 16),
    Dk(50, '#3e4e80', '#242842', 1.0, '#9ab0e8', 1.6, [2, 10, -4], .8, '#ffb070', [-4, 3, 8], 14),
    Dk(60, '#3e4e80', '#242842', 1.0, '#9ab0e8', 1.6, [2, 10, -4], .8, '#ffb070', [-4, 3, 8], 14)];
  const bg = [[0, ['#243a7a', '#e0b080']], [11, ['#2a5aa0', '#e8d0a0']], [21, ['#3a6ab0', '#dcd4b0']], [25, ['#2a3a68', '#a8a0a8']], [32, ['#2a3460', '#908aa0']], [38, ['#2a3470', '#e89a60']], [45, ['#1c2454', '#c0788a']], [50, ['#0a1030', '#2a3a68']], [60, ['#080c26', '#202e5a']]];
  return { group: g, update, light, bg, far, isl, jg, FAM, JP };
}
