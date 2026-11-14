// Episode 13: Genesis 13. Abram and Lot. Abram returns from Egypt to the altar near Bethel, rich in livestock, silver and gold; Lot has flocks and tents too; the land cannot support both; the herders quarrel;
// Abram offers Lot the first choice; Lot chooses the well-watered plain of the Jordan and pitches his tent near Sodom (wicked, sinners against the Lord); the Lord tells Abram to look in every direction, gives him the land
// and promises offspring like the dust of the earth; Abram settles at the oaks of Mamre at Hebron and builds an altar.
// Cinematic interpretation: the island layout, the golden light on the plain, the dark cloud over Sodom, the four lights Abram turns toward, the rings and the golden dust are not in the text. The Lord is never shown as a figure.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, keyed, rgbOf, mx, css } from './util.js';
import { pk, tri, makeCamel, makeDonkey, makeOx, makeSheep, walkLegs, roundTreeGeo, oliveGeo, palmGeo, pineGeo, makeMotes, addMat } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, mkPerson, houseBlock, wallRing, tentMesh, meshOf, makeSmoke, cloudSea, farMountains10, headZ, headX, C3, rimf } from './world10.js';
import { makeBird } from './fauna6.js';

export const EP = [53, -2.4, -7], JP = [6, -1.6, -42];            // far Egypt, the plain of the Jordan (centres); Canaan is at the origin
const RIC = 24, RIE = 22, RIJ = 16;
export const BT = [18, 1.0], LC = [7, -4.0], QZ = [12.5, -1.4], TK = [14.6, -7.4], MM = [-13, 5];     // Abram's camp near Bethel, Lot's camp, where the flocks meet, the hill where they talk, the oaks of Mamre
export const EV = { tents: [9.0, 10.0], creep: [9.6, 14.2], quarrel: [12.3, 15.3], sweep: [22.1, 23.7], plain: [26.9, 33.8], lotWalk: [28.4, 34.2], lotTent: 34.2, sodom: [35.4, 41.2], lord: [41.5, 50.9], dirs: [42.4, 43.4, 44.2, 45.0, 45.8], land: [46.4, 50.4], dust: [50.9, 54.2], mamre: [51.2, 56.2], mtent: 56.0, altar: [56.5, 58.4] };
const D2R = Math.PI / 180;

// ---------------- terrain
const HILLS = [[15, -9, 2.1, 8], [-7, -14, 1.4, 7], [-19, -6, .9, 6], [3, -18, .8, 5]];
const FLAT = [[BT[0], BT[1], .5, 4.4], [LC[0], LC[1], .4, 4.0], [MM[0], MM[1], .32, 4.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .06 * Math.sin(x * .5 + z * .3) + .045 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLAT) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { let b = C3('#8c9c58').lerp(C3('#7c9050'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); if (y > .95) b.lerp(C3('#9a8e7c'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#8d8578'), clamp((s - .26) * 2));
  b.lerp(C3('#c4ae82'), .6 * Math.max(smooth(4, 1.5, Math.hypot(x - BT[0], z - BT[1])), smooth(3.8, 1.4, Math.hypot(x - LC[0], z - LC[1])), .6 * smooth(4.2, 1.6, Math.hypot(x - MM[0], z - MM[1])), .5 * smooth(2.6, 1, Math.hypot(x - QZ[0], z - QZ[1])))); if (y < .02) b.lerp(C3('#bdb592'), .7); return b.getHex(); };
const RJX = z => 4.6 + 1.5 * Math.sin(z * .3), SODL = [-1, -8], LTL = [-4, -2];                  // the Jordan (local x as a function of local z), Sodom and Lot's tent on the plain (local)
const hJ = (x, z) => { const r = Math.hypot(x, z); let h = .26 + .06 * Math.sin(x * .6 + z * .4) + .04 * Math.sin(x * 1.5 - z * 1.2); h = lerp(h, -.2, smooth(1.8, .7, Math.abs(x - RJX(z)))); h = lerp(h, .34, smooth(5.5, 3.0, Math.hypot(x - SODL[0], z - SODL[1]))); h = lerp(h, .3, smooth(2.6, 1.2, Math.hypot(x - LTL[0], z - LTL[1])));
  return rimf(RIJ, h, r, -.02); };
const gcJ = (x, y, z, s) => { let b = C3('#6fa044').lerp(C3('#5c9238'), .5 * smooth(-1, 1, Math.sin(x * .8 + z * .6))); b.lerp(C3('#8ab454'), .35 * smooth(-1, 1, Math.sin(x * .4 - z * .9))); const dn = Math.abs(x - RJX(z)); if (dn < 3.2) b.lerp(C3('#4f8a3a'), smooth(3.2, 1.2, dn) * .6);
  b.lerp(C3('#a8966a'), .8 * smooth(5.2, 3, Math.hypot(x - SODL[0], z - SODL[1]))); b.lerp(C3('#c4ae82'), .6 * smooth(2.4, 1, Math.hypot(x - LTL[0], z - LTL[1]))); if (y < .0) b.lerp(C3('#a9b88a'), .7); return b.getHex(); };
const NX = z => 2.6 + 1.3 * Math.sin(z * .24);
const hE = (x, z) => { const r = Math.hypot(x, z); let h = .34 + .05 * Math.sin(x * .6 + z * .4) + .04 * Math.sin(x * 1.5 - z * 1.2); h = lerp(h, -.3, smooth(2.0, .8, Math.abs(x - NX(z)))); return rimf(RIE, h, r, -.02); };
const gcE = (x, y, z, s) => { let b = C3('#d8bc7c').lerp(C3('#c8a866'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .5))); const dn = Math.abs(x - NX(z)); if (dn < 4.2) b.lerp(C3('#7f9a50'), smooth(4.2, 1.6, dn) * .9); if (y < .05) b.lerp(C3('#bdb08a'), .7); return b.getHex(); };

// ---------------- paths of stones (Egypt to Canaan, Canaan to the plain)
const SB = { A: [23.8, .1, 3.6], B: [30.8, -2.35, -2.4], n: 7, wig: .8, ph: 1.6 }, SJ = { A: [3.2, .1, -23.4], B: [5.0, -1.5, -27.0], n: 3, wig: .3, ph: .5 };
const stripAt = (S, u) => [lerp(S.A[0], S.B[0], u), lerp(S.A[1], S.B[1], smooth(0, 1, u)), lerp(S.A[2], S.B[2], u) + S.wig * Math.sin(u * 4.4 + S.ph)];
const gAt = (x, z) => {
  if (Math.hypot(x - JP[0], z - JP[2]) < RIJ - .2) return JP[1] + hJ(x - JP[0], z - JP[2]);
  if (Math.hypot(x, z) < RIC - .2) return hC(x, z);
  if (Math.hypot(x - EP[0], z - EP[2]) < RIE - .2) return EP[1] + hE(x - EP[0], z - EP[2]);
  return z < -20 ? stripAt(SJ, clamp((z - SJ.A[2]) / (SJ.B[2] - SJ.A[2])))[1] : stripAt(SB, clamp((x - SB.A[0]) / (SB.B[0] - SB.A[0])))[1];
};
function mkStone(R, r) { const b = new GB(R); b.add(G.ico0, pk(R, ['#b9a98a', '#a89878', '#c4b48f']), [0, .06, 0], [r, .2, r * .95], [0, R() * 3, 0], .06); b.add(G.ico0, '#8a7a5e', [0, -.22, 0], [r * .78, .3, r * .74], [0, R() * 3, 0], .06); b.add(G.ico0, '#6a5a44', [0, -.55, 0], [r * .45, .34, r * .42], [0, R() * 3, 0], .06);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; }
function mkStrip(R, S) { const grp = new THREE.Group(); for (let i = 0; i < S.n; i++) { const u = (i + .5) / S.n, [x, y, z] = stripAt(S, u), m = mkStone(R, 1.05 + .2 * R()); m.position.set(x, y - .24, z); grp.add(m); } return grp; }

// ---------------- walkers
const mkPath = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, len: L[L.length - 1] }; };
const pathAt = (P, s) => { const d = clamp(s) * P.len; let i = 0; while (i < P.pts.length - 2 && P.L[i + 1] < d) i++; const a = P.pts[i], b = P.pts[i + 1], k = (d - P.L[i]) / ((P.L[i + 1] - P.L[i]) || 1); return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), vx: b[0] - a[0], vz: b[1] - a[1] }; };
const stripPts = (S, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const p = stripAt(S, i / n); return [p[0], p[2]]; });
const walkAnim = (t, ph = 0, sp = 6.2) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
const la = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
const PBr = stripPts(SB).reverse(), PJs = stripPts(SJ, 4);
const A_STAND = [BT[0] - .7, BT[1] + .5];
const TKA = [TK[0] - .9, TK[1] + .3], TKL = [TK[0] + .9, TK[1] + .1];
// a track is a list of legs {a, b, P}; between legs the walker rests at the end of the last finished leg
function track(legs) { return t => { let L = legs[0]; for (const l of legs) if (t >= l.a) L = l; const s = t < L.a ? 0 : ease.inOutSine(seg(t, L.a, L.b)), p = pathAt(L.P, s); return { x: p.x, z: p.z, vx: p.vx, vz: p.vz, mv: t > L.a && t < L.b && s > .002 && s < .998, s }; }; }
const Lg = (a, b, pts) => ({ a, b, P: mkPath(pts) });
const endOf = (l) => { const n = l.P.pts; return n[n.length - 1]; };
const IN0 = [35.5, -2.8];

const mkFam = () => { const R = rng(1111); return {
  abram: person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48),
  sarai: person(R, { pants: '#d9ccb0', top: '#5e7fa6', skin: '#c98d62', hair: '#2a1a10', long: true, cloth: '#efe4cc', seed: 53 }, .45),
  lot: person(R, { pants: '#6a5a3a', top: '#8a9a6a', skin: '#b57a50', hair: '#3a2616', seed: 54 }, .44) }; };
function altarMesh(R, n = 6) { const rows = [[-.34, 0, 0], [0, 0, 0], [.34, 0, 0], [-.17, .17, 0], [.17, .17, 0], [0, .34, 0]];
  return rows.slice(0, n).map(([x, y, z]) => { const gb = new GB(R); gb.box(pk(R, ['#a8a39a', '#938e84', '#b4aea2']), [x, y + .09, z], [.34 - y * .15, .17, .3], [0, (R() - .5) * .3, 0], .06); const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; }); }
function pyramid(R, s) { const b = new GB(R); b.add(new THREE.ConeGeometry(s, s * .72, 4, 1).rotateY(Math.PI / 4).translate(0, s * .36, 0), '#e2cc94', [0, 0, 0], [1, 1, 1], [0, 0, 0], .05); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; }

// ====================================================================== the characters' tracks (pure functions of time, also used by the cameras)
const ABR = [Lg(.4, 5.3, [IN0, ...PBr, [21.0, 2.2], A_STAND]), Lg(12.0, 15.0, [A_STAND, [16.6, -3.0], TKA]), Lg(51.2, 56.2, [TKA, [8, -3.5], [-2, .5], [-9, 4.0], [MM[0] + .9, MM[1] - .4]])];
const abramT = track(ABR);
const LOTG = [Lg(1.0, 9.4, [IN0, ...PBr, [20.0, 2.2], [15.5, 2.0], [LC[0] + 4, LC[1] + 3.5], [LC[0] + 1.0, LC[1] + 2.0]]), Lg(12.6, 15.5, [[LC[0] + 1.0, LC[1] + 2.0], [11, -4.5], TKL]),
  Lg(EV.lotWalk[0], EV.lotWalk[1], [[TKL[0], TKL[1] - .55], [10, -12], [5, -17], [3.4, -23.0], ...PJs, [5.2, -27.4], [3.6, -35], [2.8, -41.0], [JP[0] + LTL[0] + 1.0, JP[2] + LTL[1] + .8]])];
const lotT = track(LOTG);
export const abramPos = t => { const p = abramT(t); return [p.x, gAt(p.x, p.z), p.z]; };
export const lotPos = t => { const p = lotT(t); return [p.x, gAt(p.x, p.z), p.z]; };

// ====================================================================== the world
export function makeCall() {
  const R = rng(1313), g = new THREE.Group(), smoke = makeSmoke(8);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(8101), RIC, hC, gcC, 34, 88), underRock(rng(8102), RIC - .1));
  const jp = new THREE.Group(); jp.position.set(...JP); g.add(jp); jp.add(mkIslet(rng(8301), RIJ, hJ, gcJ, 28, 76), underRock(rng(8302), RIJ - .1));
  const eg = new THREE.Group(); eg.position.set(...EP); g.add(eg); eg.add(mkIslet(rng(8201), RIE, hE, gcE, 32, 84), underRock(rng(8202), RIE - .1));
  const tree = (grp, hf, x, z, s, kind, cols) => { const geo = kind === 'palm' ? palmGeo(s, R) : kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, cols || ['#7a9a4a', '#6a8a40', '#88a655', '#5f8a3a']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hf(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; grp.add(m); return m; };
  // Canaan: trees, rocks, the hills, the oaks of Mamre
  const OAKS = [[-16.4, 2.4, 2.1], [-16.8, 7.6, 2.4], [-12.4, 9.8, 2.0], [-9.2, 8.4, 2.2], [-8.8, 2.2, 1.9]];
  { for (let i = 0; i < 24; i++) { const a = R() * TAU, r = 5 + R() * 17, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - BT[0], z - BT[1]) < 5 || Math.hypot(x - LC[0], z - LC[1]) < 4.6 || Math.hypot(x - QZ[0], z - QZ[1]) < 3.4 || Math.hypot(x - MM[0], z - MM[1]) < 8 || hC(x, z) < .15 || Math.hypot(x - TK[0], z - TK[1]) < 3.4 || (x > -2 && x < 7 && z < -8)) continue; tree(ca, hC, x, z, .9 + R() * .5, hC(x, z) > .9 ? 'pine' : i % 2 ? 'olive' : 'round'); }
    OAKS.forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'round', ['#5f8a3a', '#6a8a40', '#557f36', '#7a9a4a']));
    const b = new GB(R); for (let k = 0; k < 22; k++) { const a = R() * TAU, r = 6 + R() * 15, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .15 || Math.hypot(x - BT[0], z - BT[1]) < 4 || Math.hypot(x - LC[0], z - LC[1]) < 4 || Math.hypot(x - MM[0], z - MM[1]) < 5.5 || Math.hypot(x - TK[0], z - TK[1]) < 2.6) continue; b.add(G.ico0, pk(R, ['#8f8b82', '#a39f95', '#77746c']), [x, hC(x, z), z], [.2 + R() * .3, .14 + R() * .16, .2 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  // Abram's camp near Bethel (the old altar is there from the start) and Lot's camp
  const altB = altarMesh(R, 6); altB.forEach(m => { m.position.set(BT[0] - 1.6, hC(BT[0] - 1.6, BT[1] - 1.2), BT[1] - 1.2); ca.add(m); });
  const aTents = [[20.8, 4.2, -.5, '#cdb48c'], [23.0, .4, .6, '#c2a67a'], [19.0, -3.4, 2.1, '#d4c29c']].map(([x, z, ry, c]) => { const m = tentMesh(R, c, .56); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); return m; });
  const lTents = [[LC[0], LC[1], .2, '#c2a67a'], [LC[0] - 3, LC[1] + 1.6, -.6, '#cdb48c'], [LC[0] + 2.6, LC[1] + 2.4, 1.0, '#d4c29c'], [LC[0] - 1.6, LC[1] - 2.8, 2.4, '#c8b48c']].map(([x, z, ry, c]) => { const m = tentMesh(R, c, .52); m.position.set(x, hC(x, z), z); m.rotation.y = ry; m.scale.setScalar(.001); ca.add(m); return m; });
  const fireA = spriteGlow(19.4, hC(19.4, .4) + .28, .4, .8, 0xffa040, 0), fireA2 = spriteGlow(19.4, hC(19.4, .4) + .24, .4, .36, 0xffe0a0, 0), fireL = spriteGlow(LC[0] + 1.8, hC(LC[0] + 1.8, LC[1] + .6) + .28, LC[1] + .6, .8, 0xffa040, 0), fireL2 = spriteGlow(LC[0] + 1.8, hC(LC[0] + 1.8, LC[1] + .6) + .24, LC[1] + .6, .36, 0xffe0a0, 0); g.add(fireA, fireA2, fireL, fireL2);
  smoke.add(19.4, hC(19.4, .4) + .3, .4, t => smooth(.5, 1.5, t) * (1 - smooth(51.4, 52.6, t)), .34, 2.4); smoke.add(LC[0] + 1.8, hC(LC[0] + 1.8, LC[1] + .6) + .3, LC[1] + .6, t => smooth(9.6, 11, t), .34, 2.4); g.add(smoke.mesh);
  const bGlow = spriteGlow(BT[0] - 1.6, hC(BT[0] - 1.6, BT[1] - 1.2) + .55, BT[1] - 1.2, 1.1, 0xffd890, 0), bGlow2 = spriteGlow(BT[0] - 1.6, hC(BT[0] - 1.6, BT[1] - 1.2) + .5, BT[1] - 1.2, .5, 0xfff0c0, 0); g.add(bGlow, bGlow2);
  // Mamre: the tent and the altar are made when Abram arrives
  const mTent = tentMesh(R, '#cdb48c', .56); mTent.position.set(MM[0] - 1.2, hC(MM[0] - 1.2, MM[1] + 1.4), MM[1] + 1.4); mTent.rotation.y = .6; mTent.scale.setScalar(.001); ca.add(mTent);
  const MAX = MM[0] + 2.0, MAZ = MM[1] - .9, altM = altarMesh(R, 6); altM.forEach(m => { m.position.set(MAX, hC(MAX, MAZ), MAZ); m.scale.setScalar(.001); ca.add(m); });
  const mGlow = spriteGlow(MAX, hC(MAX, MAZ) + .6, MAZ, 1.4, 0xffd890, 0), mGlow2 = spriteGlow(MAX, hC(MAX, MAZ) + .55, MAZ, .6, 0xfff0c0, 0), fireM = spriteGlow(MM[0] - .2, hC(MM[0], MM[1] + 2.6) + .26, MM[1] + 2.6, .7, 0xffa040, 0); g.add(mGlow, mGlow2, fireM);
  // the stone steps to Egypt and to the plain
  g.add(mkStrip(R, SB), mkStrip(R, SJ));
  // the plain of the Jordan: the river, the meadows, flowers, trees; Sodom behind its walls; Lot's tent
  let lotTent = null;
  { const gb = new GB(R), A = [], B = []; for (let z = -14; z <= 14; z += .6) { const x = RJX(z), w = 1.0 + .22 * Math.sin(z * .7); A.push([x - w, -.04, z]); B.push([x + w, -.04, z]); }
    for (let i = 0; i + 1 < A.length; i++) { const c = (i & 1) ? '#5a9ab4' : '#4f8fae'; tri(gb, A[i], B[i], B[i + 1], c, .06); tri(gb, A[i], B[i + 1], A[i + 1], c, .06); } const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; jp.add(m); }
  { for (let i = 0; i < 46; i++) { const a = R() * TAU, r = 3 + R() * 11.5, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - SODL[0], z - SODL[1]) < 5.6 || Math.hypot(x - LTL[0], z - LTL[1]) < 3.2 || Math.abs(x - RJX(z)) < 1.5 || Math.hypot(x, z) > 14) continue; tree(jp, hJ, x, z, .85 + R() * .5, Math.abs(x - RJX(z)) < 3.6 ? 'palm' : i % 3 ? 'round' : 'olive', ['#5f9a46', '#52903e', '#6aa84f', '#7aaa52']); }
    const fb = new GB(R); for (let k = 0; k < 70; k++) { const a = R() * TAU, r = 2 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - SODL[0], z - SODL[1]) < 5.4 || Math.abs(x - RJX(z)) < 1.2 || Math.hypot(x, z) > 14) continue; fb.add(G.ico0, pk(R, ['#f4e27a', '#ffffff', '#f0a0b8', '#a8c8f0', '#ffd27a']), [x, hJ(x, z) + .03, z], [.12 + R() * .1, .05, .12 + R() * .1], [0, R() * 3, 0], .04); }
    const fm = new THREE.Mesh(fb.build(), lam); jp.add(fm);
    jp.add(meshOf(houseBlock(R, SODL[0], SODL[1], 5, 4, 1.0, hJ, 0)), meshOf(wallRing(R, SODL[0], SODL[1], 3.4, 2.7, hJ, 0, true)));
    lotTent = tentMesh(R, '#c2a67a', .52); lotTent.position.set(LTL[0], hJ(...LTL), LTL[1]); lotTent.rotation.y = .4; lotTent.scale.setScalar(.001); jp.add(lotTent); }
  const lotFire = spriteGlow(JP[0] + LTL[0] + 1.4, JP[1] + hJ(LTL[0] + 1.4, LTL[1] + .2) + .26, JP[2] + LTL[1] + .2, .7, 0xffa040, 0); g.add(lotFire);
  const torches = [[-4, -5.2], [2.2, -5.2], [-4.2, -10.8], [2.4, -10.8], [-1, -5.2]].map(([x, z], i) => { const sp = spriteGlow(JP[0] + x, JP[1] + hJ(x, z) + .9, JP[2] + z, .8, 0xff8a40, 0); g.add(sp); return sp; });
  const jpPools = [[0, 6, 10], [-5, -1, 7], [5, -3, 7]].map(([x, z, r]) => { const p = pool(r, 0xffd88a, 0); p.position.set(JP[0] + x, JP[1] + .14, JP[2] + z); g.add(p); return p; });
  const mists = Array.from({ length: 6 }, (_, i) => { const z = -10 + i * 4, sp = spriteGlow(JP[0] + RJX(z), JP[1] + .5, JP[2] + z, 3.2, 0xf0f4ff, 0); g.add(sp); return sp; });
  const jpMotes = makeMotes({ n: 90, area: [22, 3.2, 22], size: .05, v: .1, seed: 91, color: 0xffe6a0 }); g.add(jpMotes.mesh);
  const flock = Array.from({ length: 6 }, (_, i) => { const b = makeBird(rng(900 + i), '#f4f0e6'); b.group.scale.setScalar(.5); g.add(b.group); return { ...b, r: 4 + i * .8, h: 3.4 + i * .4, w: (.2 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.1 }; });
  // the cloud of Sodom: dark only
  const sodC = (() => { const n = 20, mat = new THREE.MeshLambertMaterial({ color: 0x40344c, emissive: 0x1c1428, flatShading: true }), m = new THREE.InstancedMesh(G.ico1, mat, n), items = [], ob = new THREE.Object3D(); m.frustumCulled = false;
    for (let i = 0; i < n; i++) items.push({ a: i / n * TAU + R() * .3, r0: 1.0 + R() * 4.6, y: 3.3 + R() * 2.4, s: 1.4 + R() * 1.4, ph: R() * 6, d: i / n });
    function update(t, on) { items.forEach((c, i) => { const k = smooth(EV.sodom[0] + c.d, EV.sodom[0] + c.d + 1.6, t) * on, a = c.a + t * .14, r = c.r0 * (1 - .12 * Math.sin(t * .4 + c.ph)), sc = c.s * k;
      ob.position.set(JP[0] + SODL[0] + Math.cos(a) * r, JP[1] + c.y + Math.sin(t * .6 + c.ph) * .22, JP[2] + SODL[1] + Math.sin(a) * r * .8); ob.scale.set(sc, sc * .5, sc * .85); ob.rotation.set(0, c.ph + t * .1, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); }); m.instanceMatrix.needsUpdate = true; }
    return { mesh: m, update }; })(); g.add(sodC.mesh);
  // Egypt, far behind the caravan: the Nile, palms, two pyramids
  { const gb = new GB(R), A = [], B = []; for (let z = -20; z <= 20; z += .6) { const x = NX(z), w = 1.4 + .2 * Math.sin(z * .6); A.push([x - w, -.04, z]); B.push([x + w, -.04, z]); }
    for (let i = 0; i + 1 < A.length; i++) { const c = (i & 1) ? '#5a88aa' : '#4f7fa4'; tri(gb, A[i], B[i], B[i + 1], c, .06); tri(gb, A[i], B[i + 1], A[i + 1], c, .06); } const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; eg.add(m); }
  for (let i = 0; i < 18; i++) { const z = -17 + i * 2.0, side = i % 2 ? 1 : -1, x = NX(z) + side * (2.4 + R() * .8); if (Math.hypot(x, z) > 20.4) continue; tree(eg, hE, x, z, .95 + R() * .4, 'palm'); }
  eg.add(meshOf(houseBlock(R, 11, -1, 3, 4, 1.05, hE, 0)), meshOf(houseBlock(R, -11, -3, 3, 3, 1.0, hE, 0)));
  { const p1 = pyramid(R, 7.5), p2 = pyramid(R, 5.2); p1.position.set(4.5, hE(4.5, -17) - .05, -17); p2.position.set(11, hE(11, -14) - .05, -14); p1.rotation.y = .2; eg.add(p1, p2); }
  // ---- the light: the word to Abram on the hill (a column, rings), the four lights he turns toward, the land, the dust
  const TKy = hC(TK[0] + 1.2, TK[1] - .6), TOPY = 60, LH2 = TOPY - TKy, lb = shaft(LH2, .55, .75, [1, .9, .64], .35, .8), lb2 = shaft(LH2, .2, .28, [1, .96, .82], .4, .9); [lb, lb2].forEach(b => { b.position.set(TK[0] + 1.2, TKy, TK[1] - .6); b.visible = false; g.add(b); });
  const lrings = [0, 1, 2].map(i => { const r = ringMesh(3, .26, 0xffe6b0, 0); r.position.set(TK[0] + 1.2, TKy + .08, TK[1] - .6); g.add(r); return r; });
  const DIRP = [[4, -22], [21, 1], [10, 19], [-21, 2]].map(([x, z]) => { const p = pool(4.6, 0xffe6b0, 0); p.position.set(x, hC(x, z) + .1, z); g.add(p); return p; });
  const landGlow = pool(26, 0xffe0a0, 0); landGlow.position.set(0, .16, 0); g.add(landGlow);
  const dust = (() => { const n = 760, rn = rng(77), m = new THREE.InstancedMesh(G.tet, addMat(0xffdc96, .9), n), ob = new THREE.Object3D(), items = []; m.frustumCulled = false; m.renderOrder = 8;
    for (let i = 0; i < n; i++) { const a = rn() * TAU, r = Math.sqrt(rn()) * 44, x = Math.cos(a) * r, z = Math.sin(a) * r, y = Math.hypot(x, z) < 23 ? hC(x, z) + .1 : -.9 + rn() * -1.2; items.push({ x, y, z, s: .05 + rn() * .1, ph: rn() * 6, d: Math.hypot(x - TK[0], z - TK[1]) / 44 * 2.4 + rn() * .3 }); }
    function update(t) { items.forEach((c, i) => { const u = seg(t, EV.dust[0] + c.d, EV.dust[0] + c.d + 1.0), v = (1 - smooth(EV.dust[1] - 0.6, EV.dust[1] + .6, t)), k = ease.outBack(u) * v, up = (t - EV.dust[0] - c.d) * .16;
      ob.position.set(c.x + Math.sin(t * .8 + c.ph) * .2, c.y + Math.max(0, up) + .15 * Math.sin(t * 1.3 + c.ph), c.z + Math.cos(t * .7 + c.ph) * .2); ob.scale.setScalar(Math.max(.0001, c.s * k)); ob.rotation.set(t + c.ph, c.ph, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); }); m.instanceMatrix.needsUpdate = true; }
    return { mesh: m, update }; })(); g.add(dust.mesh);
  // ---- the characters
  const F = mkFam(); [F.abram, F.sarai, F.lot].forEach(o => g.add(o.group));
  const sc = (o, s) => { o.group.scale.setScalar(s); g.add(o.group); return o; };
  const AG = [];                                           // generic movers: { o, kind, tr }
  const add = (o, kind, legs, i = 0) => { AG.push({ o, kind, tr: track(legs), legs, i }); return o; };
  const arrive = (d, rest, lat, lot) => lot ? Lg(1.0 + .25 * d, 9.4 + .4 * d, [IN0, ...PBr, [20.0, 2.0 + lat * .3], [15.5, 2.0 + lat * .5], [LC[0] + 4 + lat * .2, LC[1] + 3.5 + lat * .3], rest]) : Lg(.4 + .25 * d, 5.3 + .45 * d, [IN0, ...PBr, [22.0, 2.4 + lat * .5], rest]);
  const creep = (from, to, a, b) => Lg(a, b, [from, to]);
  const toMamre = (from, rest, j, d) => Lg(51.4 + .12 * d, 56.2 + .1 * d, [from, [lerp(from[0], rest[0], .4) + j, lerp(from[1], rest[1], .4) + j * .5], [lerp(from[0], rest[0], .75) - j * .4, lerp(from[1], rest[1], .75)], rest]);
  const toJP = (from, rest, a, b, j) => Lg(a, b, [from, [lerp(from[0], 4, .6) + j, lerp(from[1], -12, .6)], [3.6 + j * .3, -23.0], ...PJs, [5.2 + j * .3, -27.4], [3.4 + j * .3, -36], rest]);
  const camp = (n, x, z, dx = .9, dy = .9, per = 4) => Array.from({ length: n }, (_, i) => [x + (i % per) * dx, z + Math.floor(i / per) * dy]);
  const LOTR = (lx, lz) => [JP[0] + lx, JP[2] + lz];
  // Abram's party
  const sar = F.sarai, sarRest = [18.6, 3.2];
  AG.push({ o: sar, kind: 'p', tr: track([arrive(.9, sarRest, .9), Lg(51.6, 56.4, [sarRest, [8, 0], [-2, 3], [-9, 5.6], [MM[0] + .4, MM[1] + 1.6]])]), i: 1 });
  const hA = sc(mkPerson(rng(160), .42), .42), hA2 = sc(mkPerson(rng(161), .42), .42);
  const hARest = [19.4, -.8], hA2Rest = [21.2, .9], hAFace = [QZ[0] - .75, QZ[1] + .1];
  AG.push({ o: hA, kind: 'p', tr: track([arrive(1.4, hARest, -1.1), Lg(10.0, 11.9, [hARest, [QZ[0] + 3, QZ[1] + 1], hAFace]), Lg(51.6, 56.4, [hAFace, [4, 0], [-9, 4], [MM[0] + 1.6, MM[1] + 2.2]])]), i: 2, special: 'hA' });
  AG.push({ o: hA2, kind: 'p', tr: track([arrive(2.0, hA2Rest, 1.5), Lg(51.8, 56.6, [hA2Rest, [4, 1], [-8, 5], [MM[0] + 2.2, MM[1] + 1.4]])]), i: 3 });
  const aCam = [[21.6, -2.2], [23.2, -3.2]].map((r, i) => { const c = sc(makeCamel(rng(120 + i)), .5); AG.push({ o: c, kind: 'a', tr: track([arrive(1.2 + .6 * i, r, i ? 1.2 : -.6), toMamre(r, [MM[0] - 3.0 + i * 1.6, MM[1] + 4.6], i, i)]), i: 10 + i }); return c; });
  const aDon = sc(makeDonkey(rng(130)), .5), dRest = [21.4, 2.2]; AG.push({ o: aDon, kind: 'a', tr: track([arrive(2.2, dRest, 0), toMamre(dRest, [MM[0] - 5, MM[1] + 3.6], 0, 2)]), i: 12 });
  [[20.6, -.4], [21.8, -.4]].forEach((r, i) => { const o = sc(makeOx(rng(150 + i)), .5); AG.push({ o, kind: 'a', tr: track([arrive(2.6 + .4 * i, r, i ? .6 : -1.4), toMamre(r, [MM[0] - 4 + i * 1.4, MM[1] - 3.4], i, 3 + i)]), i: 13 + i }); });
  camp(8, 16.6, 4.0).forEach((r, i) => { const o = sc(makeSheep(rng(140 + i)), .55), cw = [QZ[0] + .2 + (i % 4) * .55, QZ[1] + (i >> 2) * .6], cr = creep(r, cw, EV.creep[0] + .12 * i, EV.creep[1] + .1 * i);
    AG.push({ o, kind: 'a', tr: track([arrive(2.4 + .12 * i, r, (i % 3 - 1) * .8), cr, toMamre(cw, [MM[0] + 2.4 + (i % 4) * .6, MM[1] + 2.6 + (i >> 2) * .6], (i % 3 - 1) * .3, 4 + i * .3)]), i: 20 + i, sheep: true }); });
  // Lot's party
  const lotF = F.lot, lHerd = [0, 1, 2].map(i => sc(mkPerson(rng(170 + i), .42), .42));
  const lRest = [[LC[0] + 3.2, LC[1] + 3.6], [LC[0] - 3.4, LC[1] + 4.0], [LC[0] + 4.2, LC[1] + 1.0]], lFace = [QZ[0] + .75, QZ[1] - .1];
  lHerd.forEach((h, i) => AG.push({ o: h, kind: 'p', tr: track(i === 0 ? [arrive(1.8, lRest[0], .6, true), Lg(10.2, 12.1, [lRest[0], [QZ[0] + 5, QZ[1] + 2], lFace]), toJP(lFace, LOTR(LTL[0] + 2.2, LTL[1] + 1.8), 28.5, 34.1, 0)] : [arrive(1.8 + i * .5, lRest[i], i === 1 ? -.5 : .8, true), toJP(lRest[i], LOTR(LTL[0] + 2.2 + i * 1.0, LTL[1] + 1.8 + i * .5), 28.4, 34.1 + .1 * i, i * .4)]), i: 30 + i, special: i === 0 ? 'hB' : null }));
  [[LC[0] + 5.2, LC[1] - 3.4], [LC[0] + 6.4, LC[1] - 2.6]].forEach((r, i) => { const c = sc(makeCamel(rng(180 + i)), .5); AG.push({ o: c, kind: 'a', tr: track([arrive(1.6 + .6 * i, r, i ? 1.4 : -.6, true), toJP(r, LOTR(LTL[0] - 3.6 + i * 1.8, LTL[1] + 1.4), 28.5 + .2 * i, 34.2, i * .5)]), i: 40 + i }); });
  { const r = [LC[0] + 3.6, LC[1] - 4.4], o = sc(makeDonkey(rng(190)), .5); AG.push({ o, kind: 'a', tr: track([arrive(2.2, r, 0, true), toJP(r, LOTR(LTL[0] + 2.6, LTL[1] + 3.2), 28.6, 34.2, .4)]), i: 44 }); }
  { const r = [LC[0] + 2.0, LC[1] - 4.8], o = sc(makeOx(rng(195)), .5); AG.push({ o, kind: 'a', tr: track([arrive(2.6, r, .4, true), toJP(r, LOTR(LTL[0] + 3.6, LTL[1] + 2.2), 28.6, 34.3, .8)]), i: 45 }); }
  camp(8, LC[0] - 1.5, LC[1] + 4.2).forEach((r, i) => { const o = sc(makeSheep(rng(200 + i)), .55), cw = [QZ[0] - 1.0 + (i % 4) * .55, QZ[1] + .3 + (i >> 2) * .6], cr = creep(r, cw, EV.creep[0] + .1 * i, EV.creep[1] + .1 * i);
    AG.push({ o, kind: 'a', tr: track([arrive(2.4 + .12 * i, r, (i % 3 - 1) * .7, true), cr, toJP(cw, LOTR(-7.4 + (i % 4) * .8, 1.8 + (i >> 2) * .8), 28.4 + .12 * i, 34.0 + .12 * i, (i % 3 - 1) * .4)]), i: 50 + i, sheep: true }); });
  // ---- sky and far hills
  const far = farMountains10(rng(63)); g.add(far);
  const keep = [[0, 0, 27], [JP[0], JP[2], 19], [EP[0], EP[2], 25], [28, 0, 7], [4, -25, 6]];
  const sea = cloudSea(rng(64), 150, keep); g.add(sea.mesh);
  const CLOUD = [[0, '#c8c4d8'], [6, '#e8d4c8'], [14, '#f4f0ea'], [27, '#f0e8dc'], [33, '#8a7a90'], [36, '#7a6a88'], [41, '#7a6a88'], [43, '#f4e4c4'], [52, '#f0e8dc'], [56, '#f0b890'], [60, '#f0b890'], [90, '#4c5478']];
  const CEM = [[0, '#4a4668'], [14, '#5a5670'], [33, '#2a2438'], [41, '#2a2438'], [43, '#5a5670'], [56, '#3c3450'], [60, '#5a5670'], [90, '#222640']];
  const SMK = [[0, '#c8c0c8'], [10, '#e0d6c8'], [38, '#d8c6b0'], [90, '#707490']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation
  function fig(f, x, z, ry, mv, t, ph, extra = {}) { const w = walkAnim(t, ph, 9.5); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  function ani(an, x, z, ry, mv, t, i) { an.group.position.set(x, gAt(x, z) - .02, z); an.group.rotation.y = ry; if (mv) walkLegs(an.legs, t + i, 4.4, .32); }
  const pulse = (t, f, ph = 0) => Math.max(0, Math.sin(t * f + ph));
  function update(t, cam) {
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam && cam.position, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)), M = far.userData.mat, f = smooth(0, 5, t) * .66; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
    // camps: fires, the tents of Lot's camp rise, Abram's camp is struck at the end
    { const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), on = smooth(.4, 1.4, t) * (1 - smooth(51.4, 52.6, t)); fireA.material.opacity = .62 * on * fl; fireA2.material.opacity = .5 * on; fireA.visible = fireA2.visible = on > .01;
      const onL = smooth(EV.tents[0] + .6, EV.tents[1] + .6, t) * (1 - smooth(28.0, 29.0, t)); fireL.material.opacity = .62 * onL * fl; fireL2.material.opacity = .5 * onL; fireL.visible = fireL2.visible = onL > .01;
      const onJ = smooth(EV.lotTent + .6, EV.lotTent + 1.6, t); lotFire.material.opacity = .62 * onJ * fl; lotFire.visible = onJ > .01;
      const onM = smooth(EV.mtent + .2, EV.mtent + 1.2, t); fireM.material.opacity = .62 * onM * fl; fireM.visible = onM > .01; }
    lTents.forEach((m, i) => { const u = ease.outBack(seg(t, EV.tents[0] + i * .22, EV.tents[0] + i * .22 + .7)) * (1 - smooth(28.4 + i * .1, 29.3 + i * .1, t)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    aTents.forEach((m, i) => { const u = 1 - smooth(51.8 + i * .2, 52.8 + i * .2, t); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    { const gg = smooth(.8, 2.4, t) * (1 - smooth(6.4, 8.0, t)), fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3); bGlow.material.opacity = .55 * gg * fl; bGlow2.material.opacity = .5 * gg; bGlow.visible = bGlow2.visible = gg > .01; }
    { const u = ease.outBack(seg(t, EV.mtent, EV.mtent + .8)); mTent.scale.setScalar(Math.max(.001, u)); mTent.visible = u > .01;
      altM.forEach((m, i) => { const k = ease.outBack(seg(t, EV.altar[0] + i * .28, EV.altar[0] + i * .28 + .6)); m.scale.setScalar(Math.max(.001, k)); m.visible = k > .01; });
      const gg = smooth(EV.altar[0] + 1.3, EV.altar[1] + .2, t), fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3); mGlow.material.opacity = .7 * gg * fl; mGlow2.material.opacity = .6 * gg; mGlow.visible = mGlow2.visible = gg > .01; }
    // the plain of the Jordan: golden light and mist while Lot looks, Sodom's torches and its dark cloud later, Lot's tent
    { const on = smooth(EV.plain[0], EV.plain[0] + 1.8, t) * (1 - smooth(EV.plain[1] - .6, EV.plain[1] + 1.4, t));
      jpPools.forEach((p, i) => { p.material.opacity = .34 * on * (.88 + .12 * Math.sin(t * 1.4 + i)); p.visible = on > .01; }); mists.forEach((s, i) => { s.material.opacity = .22 * on * (.8 + .2 * Math.sin(t * 1.1 + i * 1.3)); s.visible = on > .01; });
      jpMotes.update(t, .9 * smooth(EV.plain[0], EV.plain[0] + 2, t) * (1 - smooth(EV.sodom[0] - .4, EV.sodom[0] + 1, t)), [JP[0], JP[1] + .3, JP[2]]);
      const sodomOn = smooth(EV.sodom[0] - .4, EV.sodom[0] + 1.2, t) * (1 - smooth(EV.sodom[1] - .2, EV.sodom[1] + 1.6, t)); sodC.update(t, sodomOn); sodC.mesh.visible = sodomOn > .01;
      torches.forEach((s, i) => { s.material.opacity = .8 * smooth(EV.sodom[0] - .2, EV.sodom[0] + 1.0, t) * (1 - smooth(EV.sodom[1] + .4, EV.sodom[1] + 2, t)) * (.8 + .2 * Math.sin(t * 11 + i * 2)); s.visible = s.material.opacity > .01; });
      const u = ease.outBack(seg(t, EV.lotTent, EV.lotTent + .8)); lotTent.scale.setScalar(Math.max(.001, u)); lotTent.visible = u > .01;
      flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t > EV.plain[0] - 1 && t < EV.sodom[0] + 1; b.group.position.set(JP[0] + Math.cos(a) * b.r, JP[1] + b.h + Math.sin(t * .5 + i), JP[2] + 2 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); }); }
    // the Lord's word on the hill: light only; rings spread over the land; the four lights; the land; the dust
    { const k = ease.inOutSine(seg(t, EV.lord[0], EV.lord[0] + 1.6)), fade = 1 - smooth(EV.lord[1] - 1.2, EV.lord[1] + .6, t); for (const [b, a] of [[lb, 1], [lb2, .8]]) { b.visible = k > .003 && fade > .01; b.scale.set(1, Math.max(.001, k), 1); b.position.y = TOPY - LH2 * k; b.material.opacity = (.42 + .05 * Math.sin(t * 2)) * fade * a; }
      lrings.forEach((r, i) => { const u = (((t - EV.lord[0] - 1.4) * .22 + i / 3) % 1 + 1) % 1, on = smooth(EV.lord[0] + 1.4, EV.lord[0] + 2.4, t) * (1 - smooth(EV.lord[1] - 1, EV.lord[1] + 1, t)); r.visible = on > .01; r.scale.setScalar(.3 + u * 7.2); r.material.opacity = .5 * on * Math.sin(Math.PI * u); });
      DIRP.forEach((p, i) => { const on = smooth(EV.dirs[i], EV.dirs[i] + .6, t) * (1 - smooth(EV.land[0] + 1.5, EV.land[0] + 3.0, t)); p.material.opacity = .42 * on * (.9 + .1 * Math.sin(t * 2 + i)); p.visible = on > .01; });
      const lg = smooth(EV.land[0], EV.land[0] + 1.6, t) * (1 - smooth(EV.land[1] - .2, EV.land[1] + 2.4, t)); landGlow.material.opacity = .3 * lg; landGlow.visible = lg > .01; dust.update(t); dust.mesh.visible = t > EV.dust[0] - .2 && t < EV.dust[1] + 1.4; }
    // the people and animals
    AG.forEach(A => { const p = A.tr(t); let ry = A.kind === 'a' ? headX(p.vx, p.vz) : headZ(p.vx, p.vz), x = p.x, z = p.z, ex = {};
      if (A.special === 'hA' || A.special === 'hB') { const q = smooth(EV.quarrel[0] - .2, EV.quarrel[0] + .3, t) * (1 - smooth(EV.quarrel[1] - .6, EV.quarrel[1], t)); if (q > .01) { const hb = A.special === 'hB', ph = hb ? 1.9 : 0, sh = Math.sin(t * 4.2 + ph);
          ry = la(ry, headZ(hb ? -1 : 1, hb ? .1 : -.1), q) + .22 * q * sh; x += (hb ? -1 : 1) * .12 * q * pulse(t, 2.6, ph); ex = { a0x: -1.25 * q * pulse(t, 3.1, ph), a1x: -.9 * q * pulse(t, 3.1, ph + 1), lx: .12 * q * Math.sin(t * 2 + ph) }; } }
      if (A.kind === 'p') fig(A.o, x, z, ry, p.mv, t, A.i * 1.7, ex); else ani(A.o, x, z, ry, p.mv, t, A.i); });
    // Abram
    { const p = abramT(t); let x = p.x, z = p.z, mv = p.mv, ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) {
        if (t < 12) { ry = headZ(-.9, -1.7); const pr = smooth(5.3, 6.1, t) * (1 - smooth(8.2, 9.0, t)); ex = { a0x: -.8 * pr, a1x: -.8 * pr, a0z: -.4 * pr, a1z: .4 * pr, lx: -.1 * pr }; }
        else if (t < 51.3) {
          const tk = ry; ry = la(tk, headZ(1, 0), smooth(15.0, 15.7, t)); // face Lot
          if (t >= 16.0 && t < 21.7) { const gA = pulse(t, 2.3), gB = pulse(t, 2.3, 1.3); ex = { a0x: -.5 * gA - .1, a1x: -.32 * gB, a0z: -.28, a1z: .28 }; }
          if (t >= 21.7) { ry = la(headZ(1, 0), headZ(0, -1), smooth(21.7, 22.3, t));
            const sw = smooth(EV.sweep[0], EV.sweep[0] + .6, t) * (1 - smooth(EV.sweep[1], EV.sweep[1] + .6, t)); ex = { a0x: -1.45 * sw, a1x: -1.1 * sw, a0z: -(.3 + .6 * Math.sin((t - EV.sweep[0]) * 2.0) * sw), a1z: .3 + .4 * sw };
            const wL = smooth(23.4, 23.9, t) * (1 - smooth(24.5, 24.9, t)), eR = smooth(24.7, 25.2, t) * (1 - smooth(25.8, 26.3, t));
            ry = la(ry, headZ(-1, -.25), wL); ry = la(ry, headZ(1, -.25), Math.max(eR, 0) * 1); if (wL > .01 || eR > .01) ex = { a0x: -1.25 * wL, a1x: -1.25 * eR, a0z: -.5 * wL, a1z: .5 * eR };
            if (t > 26.3) ry = la(ry, headZ(0, -1), smooth(26.3, 26.8, t)); }
          if (t >= 34.5 && t < 41.4) ex = { lx: .06, a0x: -.1, a1x: -.1 };
          if (t >= EV.lord[0]) { const lk = smooth(EV.lord[0], EV.lord[0] + 1.4, t) * (1 - smooth(EV.lord[1] - 1.0, EV.lord[1], t)); let dir = headZ(0, -1); const D4 = [headZ(0, -1), headZ(1, -.1), headZ(0, 1), headZ(-1, -.1), headZ(0, -1)];
            for (let k = 0; k < 5; k++) dir = la(dir, D4[k], smooth(EV.dirs[k], EV.dirs[k] + .45, t)); ry = dir; ex = { a0x: -.9 * lk, a1x: -.9 * lk, a0z: -.5 * lk, a1z: .5 * lk, lx: -.18 * lk }; }
        } else if (t >= EV.mamre[1]) { const bld = ease.inOutSine(seg(t, EV.altar[0] - .3, EV.altar[0] + .4)) * (1 - smooth(EV.altar[1], EV.altar[1] + .8, t)); ry = headZ(2.2, -.9); ex = { a0x: -.6 * bld * (.5 + .5 * Math.sin(t * 3)), a1x: -.6 * bld * (.5 + .5 * Math.sin(t * 3 + 1.5)), lx: .25 * bld }; }
      }
      fig(F.abram, x, z, ry, mv, t, 0, ex); }
    // Lot
    { const p = lotT(t); let x = p.x, z = p.z, mv = p.mv, ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) {
        if (t < 12.4) ry = headZ(0, 1) + .3;
        else if (t < 28.4) { const tk = ry; ry = la(tk, headZ(-1, 0), smooth(15.5, 16.1, t)); const lst = smooth(16.2, 16.8, t) * (1 - smooth(21.4, 21.9, t)); ex = { lx: .05 * Math.sin(t * 1.7) * lst, a0x: -.08, a1x: -.08 };
          ry = la(ry, headZ(0, -1), smooth(21.8, 22.4, t)); const st = smooth(26.7, 27.7, t); z -= .55 * st; const br = smooth(27.2, 27.8, t) * (1 - smooth(28.0, 28.4, t)); ex = { lx: -.08 * st, a0x: -1.45 * br, a1x: -.05 }; }
        else if (t >= EV.lotWalk[1]) { ry = headZ(-.8, -1); const hold = smooth(EV.lotTent + .2, EV.lotTent + .9, t); ex = { a0x: -.5 * hold * pulse(t, 2.1), a1x: -.4 * hold * pulse(t, 2.1, 1) }; }
      }
      fig(F.lot, x, z, ry, mv, t, 3.1, ex); }
    smoke.update(t, colAt(SMK, t));
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#6a78a8', '#3a3238', .95, '#ffc890', 1.9, [12, 4.5, 6], .5, '#6a7cff', [-10, 6, -8], 16),
    Dk(6, '#8a9cc8', '#454448', 1.05, '#ffe0b0', 2.2, [10, 7, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(14, '#8a98c0', '#45403c', 1.05, '#ffeac4', 2.3, [8, 10, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(24, '#8a98c0', '#45403c', 1.05, '#ffeac4', 2.2, [8, 10, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(27.5, '#9aa0b8', '#4a443c', 1.1, '#ffd8a0', 2.5, [-6, 6, 8], .45, '#ffcf9a', [8, 5, 6], 16),
    Dk(33, '#8a90b8', '#44403c', 1.0, '#ffdcae', 2.1, [-8, 6, 6], .45, '#ffcf9a', [8, 5, 6], 16),
    Dk(36, '#625e80', '#2c2630', .78, '#c88a60', 1.4, [-8, 3.5, 6], .7, '#a04a3a', [6, 3, 8], 16),
    Dk(40.5, '#625e80', '#2c2630', .78, '#c88a60', 1.4, [-8, 3.5, 6], .7, '#a04a3a', [6, 3, 8], 16),
    Dk(42.4, '#a09aa0', '#4a443c', 1.1, '#fff2cc', 2.7, [4, 12, 5], .35, '#c8c0a8', [-8, 6, -6], 16),
    Dk(48, '#a09aa0', '#4a443c', 1.1, '#fff0c8', 2.6, [4, 12, 5], .35, '#c8c0a8', [-8, 6, -6], 16),
    Dk(52, '#9a90a8', '#463e3a', 1.05, '#ffd8a0', 2.2, [-9, 6, 6], .5, '#ffcf9a', [7, 4.5, 10], 16),
    Dk(56, '#8a7aa0', '#4a3a4a', 1.0, '#ffb878', 2.1, [-12, 5, 5], .5, '#ffcf9a', [7, 4.5, 10], 14),
    Dk(60, '#8a82a2', '#46403e', 1.05, '#ffc890', 2.0, [-9, 5, 6], .5, '#ffcf9a', [7, 4.5, 10], 14)];
  const bg = [[0, ['#1c2a60', '#e0a070']], [6, ['#2a4a90', '#f0c890']], [14, ['#3a6ab0', '#f0dcb0']], [27, ['#3a6ab0', '#f0d8a0']], [33, ['#2a3470', '#c88060']], [36, ['#1e1c3c', '#6a3a48']], [41, ['#1e1c3c', '#6a3a48']], [43, ['#5a82b8', '#f4e4c0']], [52, ['#3a6ab0', '#f0dcb0']], [56, ['#2a3a78', '#f0b078']], [60, ['#1c2a60', '#c88a88']]];
  return { group: g, update, light, bg, far };
}
