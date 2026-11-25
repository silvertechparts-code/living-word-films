// Episode 14: Genesis 14. Four kings make war on five kings near Sodom and carry off Sodom's goods and Lot (14:1-12); a survivor tells Abram the Hebrew (14:13); Abram arms 318 trained men and pursues to Dan (14:14);
// that night he divides his men and attacks (14:15); he brings back the goods, Lot and all the people (14:16); the king of Sodom comes out to meet him (14:17); Melchizedek, king of Salem and priest of God Most High, brings out
// bread and wine, blesses Abram, and Abram gives him a tenth of everything (14:18-20); the king of Sodom offers: keep the goods, give me the people; Abram refuses, not a thread or a sandal strap, so that no one can say
// "I made Abram rich" (14:21-24).
// Cinematic interpretation: the floating islands, the number of figures (a few dozen stand for the armies and the 318), the colours of the armies, the banners, the crown, the table, the way the raiders scatter and the golden light
// are not in the text. No violence is shown. The Lord is not shown as a figure.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, keyed, rgbOf, mx, css } from './util.js';
import { pk, tri, makeCamel, walkLegs, roundTreeGeo, oliveGeo, palmGeo, pineGeo, makeMotes, addMat } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, mkPerson, houseBlock, wallRing, tentMesh, meshOf, makeSmoke, cloudSea, farMountains10, headZ, headX, C3, rimf, SKINS10, ROBES, HAIRS } from './world10.js';
import { makeBird } from './fauna6.js';

export const JP = [6, -1.6, -34], DP = [-1, -2.6, -58];            // the plain of Sodom, the island of Dan (centres); Canaan (Mamre) is at the origin
const RIC = 20, RIJ = 11.5, RID = 9;
export const MM = [-3, -8], SODL = [-2.5, -4.5], KVL = [1.0, 3.6];  // Mamre camp (world), Sodom and the King's Valley (plain-local)
const TB = [.8, 3.4], AB = [-1.4, 4.2], MEL = [2.0, 4.0], KS = [3.4, 2.4], CMP = [.5, -1.6];   // table, Abram, Melchizedek, king of Sodom (plain-local); the raiders' camp (Dan-local)
export const EV = { clash: [1.2, 3.6], leave: [4.3, 13.0], surv: [6.4, 9.4], muster: [10.9, 13.4], march: [13.6, 21.0], split: [21.2, 22.8], attack: [22.8, 25.0], free: [24.8, 26.6], back: [26.2, 31.0], king: [30.0, 33.4], mel: [32.5, 36.1], bless: [39.4, 43.8], tenth: [44.3, 48.4], offer: [47.6, 51.0], refuse: [51.9, 55.4], close: [56.1, 59.5] };
const D2R = Math.PI / 180;

// ---------------- terrain
const HILLS = [[11, -4, 1.6, 6.5], [-10, -5, 1.1, 6], [-12, 8, .8, 5], [9, 9, .7, 5]];
const FLAT = [[MM[0], MM[1], .32, 6.0]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .06 * Math.sin(x * .5 + z * .3) + .045 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLAT) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { let b = C3('#8c9c58').lerp(C3('#7c9050'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); if (y > .95) b.lerp(C3('#9a8e7c'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#8d8578'), clamp((s - .26) * 2));
  b.lerp(C3('#c4ae82'), .6 * smooth(4.4, 1.6, Math.hypot(x - MM[0] + 1.4, z - MM[1] - 1))); if (y < .02) b.lerp(C3('#bdb592'), .7); return b.getHex(); };
const RJX = z => 4.6 + 1.5 * Math.sin(z * .3);
const hJ = (x, z) => { const r = Math.hypot(x, z); let h = .26 + .06 * Math.sin(x * .6 + z * .4) + .04 * Math.sin(x * 1.5 - z * 1.2); h = lerp(h, -.2, smooth(1.8, .7, Math.abs(x - RJX(z)))); h = lerp(h, .34, smooth(5.0, 2.6, Math.hypot(x - SODL[0], z - SODL[1]))); h = lerp(h, .3, smooth(4.4, 2.2, Math.hypot(x - KVL[0], z - KVL[1])));
  return rimf(RIJ, h, r, -.02); };
const gcJ = (x, y, z, s) => { let b = C3('#6fa044').lerp(C3('#5c9238'), .5 * smooth(-1, 1, Math.sin(x * .8 + z * .6))); b.lerp(C3('#8ab454'), .35 * smooth(-1, 1, Math.sin(x * .4 - z * .9))); const dn = Math.abs(x - RJX(z)); if (dn < 3.2) b.lerp(C3('#4f8a3a'), smooth(3.2, 1.2, dn) * .6);
  b.lerp(C3('#a8966a'), .8 * smooth(5.0, 2.8, Math.hypot(x - SODL[0], z - SODL[1]))); b.lerp(C3('#c4ae82'), .5 * smooth(3.6, 1.4, Math.hypot(x - KVL[0], z - KVL[1]))); if (y < .0) b.lerp(C3('#a9b88a'), .7); return b.getHex(); };
const hD = (x, z) => { const r = Math.hypot(x, z); let h = .32 + .06 * Math.sin(x * .7 + z * .5) + .04 * Math.sin(x * 1.6 - z * 1.1); const d = Math.hypot(x + 1, z + 6.2) / 4.0; if (d < 1) h = Math.max(h, 1.3 * Math.pow(1 - d, 1.1));
  h = lerp(h, .3, smooth(3.8, 1.8, Math.hypot(x - CMP[0], z - CMP[1]))); h = lerp(h, -.12, smooth(1.5, .6, Math.hypot(x - 5.2, z + 4.4))); return rimf(RID, h, r, -.02); };
const gcD = (x, y, z, s) => { let b = C3('#8e9c5a').lerp(C3('#7e8e50'), .5 * smooth(-1, 1, Math.sin(x * .8 + z * .6))); if (y > .8) b.lerp(C3('#9a8e7c'), clamp((y - .7) * .8)); b.lerp(C3('#c4ae82'), .65 * smooth(4.2, 1.8, Math.hypot(x - CMP[0], z - CMP[1]))); b.lerp(C3('#7aaed0'), .7 * smooth(1.4, .6, Math.hypot(x - 5.2, z + 4.4))); if (y < .02) b.lerp(C3('#bdb592'), .5); return b.getHex(); };

// ---------------- stones between the islands
const SJ = { A: [3.2, .1, -19.4], B: [5.0, -1.5, -23.0], n: 3, wig: .3, ph: .5 }, SD = { A: [7.5, -1.4, -44.6], B: [2.0, -2.5, -49.8], n: 3, wig: .3, ph: 1.1 };
const stripAt = (S, u) => [lerp(S.A[0], S.B[0], u), lerp(S.A[1], S.B[1], smooth(0, 1, u)), lerp(S.A[2], S.B[2], u) + S.wig * Math.sin(u * 4.4 + S.ph)];
const gAt = (x, z) => {
  if (Math.hypot(x - JP[0], z - JP[2]) < RIJ - .2) return JP[1] + hJ(x - JP[0], z - JP[2]);
  if (Math.hypot(x - DP[0], z - DP[2]) < RID - .2) return DP[1] + hD(x - DP[0], z - DP[2]);
  if (Math.hypot(x, z) < RIC - .2) return hC(x, z);
  return z < -40 ? stripAt(SD, clamp((z - SD.A[2]) / (SD.B[2] - SD.A[2])))[1] : stripAt(SJ, clamp((z - SJ.A[2]) / (SJ.B[2] - SJ.A[2])))[1];
};
function mkStone(R, r) { const b = new GB(R); b.add(G.ico0, pk(R, ['#b9a98a', '#a89878', '#c4b48f']), [0, .06, 0], [r, .2, r * .95], [0, R() * 3, 0], .06); b.add(G.ico0, '#8a7a5e', [0, -.22, 0], [r * .78, .3, r * .74], [0, R() * 3, 0], .06); b.add(G.ico0, '#6a5a44', [0, -.55, 0], [r * .45, .34, r * .42], [0, R() * 3, 0], .06);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; }
function mkStrip(R, S) { const grp = new THREE.Group(); for (let i = 0; i < S.n; i++) { const u = (i + .5) / S.n, [x, y, z] = stripAt(S, u), m = mkStone(R, 1.0 + .2 * R()); m.position.set(x, y - .24, z); grp.add(m); } return grp; }

// ---------------- paths and walkers (pure functions of time, also used by the cameras)
const mkPath = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, len: L[L.length - 1] }; };
const pathAt = (P, s) => { const d = clamp(s) * P.len; let i = 0; while (i < P.pts.length - 2 && P.L[i + 1] < d) i++; const a = P.pts[i], b = P.pts[i + 1], k = (d - P.L[i]) / ((P.L[i + 1] - P.L[i]) || 1); return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), vx: b[0] - a[0], vz: b[1] - a[1] }; };
const stripPts = (S, n = 4) => Array.from({ length: n + 1 }, (_, i) => { const p = stripAt(S, i / n); return [p[0], p[2]]; });
const walkAnim = (t, ph = 0, sp = 6.2) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
const la = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
function track(legs) { return t => { let L = legs[0]; for (const l of legs) if (t >= l.a) L = l; const u = seg(t, L.a, L.b), s = t < L.a ? 0 : (L.lin ? lerp(u, ease.inOutSine(u), .4) : ease.inOutSine(u)), p = pathAt(L.P, s); return { x: p.x, z: p.z, vx: p.vx, vz: p.vz, mv: t > L.a && t < L.b && s > .002 && s < .998, s }; }; }
const Lg = (a, b, pts, lin = false) => ({ a, b, P: mkPath(pts), lin });
const JW = (x, z) => [JP[0] + x, JP[2] + z], DW = (x, z) => [DP[0] + x, DP[2] + z];
const SJw = stripPts(SJ), SDw = stripPts(SD), SJr = [...SJw].reverse(), SDr = [...SDw].reverse();
const DB = SDw[SDw.length - 1];                                                   // where the strip lands on Dan
const NORTH = [JW(2.4, 6.5), JW(3.7, .5), JW(3.9, -6.5)], SOUTH = [JW(3.9, -6.5), JW(3.7, .5), JW(2.4, 6.5)];   // the east lane of the plain, away from Sodom's walls
const A_STAND = [MM[0] + 1.4, MM[1] + .9];
// Abram's whole walk: Mamre, over the stones, across the plain, to Dan, the attack, the camp, and back to the King's Valley
const ABR = [Lg(13.5, 21.0, [A_STAND, [-1, -12], [2, -16], ...SJw, ...NORTH, ...SDw], true), Lg(21.2, 22.0, [DB, DW(1.5, 5.8)]), Lg(24.6, 25.6, [DW(1.5, 5.8), DW(1.6, .2)]), Lg(25.8, 30.6, [DW(1.6, .2), DB, ...SDr, ...SOUTH, JW(AB[0], AB[1])], true)];
const abramT = track(ABR);
const CAPS = [0, 1, 2, 3, 4], capSpot = i => DW(-2.0 + .8 * i, -4.6), capFin = i => JW(-4.4 + .62 * i, 1.8);
const capLegs = i => [Lg(5.0 + .4 * i, 13.4 + .4 * i, [JW(-.6 + .6 * i, -1.0), JW(3.8, -3.4), JW(3.9, -7.0), JW(1.5, -10.6), ...SDw, capSpot(i)], true), Lg(25.0 + .2 * i, 26.6 + .2 * i, [capSpot(i), DW(1.2 + .5 * i, .8)]),
  Lg(26.4 + .25 * i, 31.0 + .25 * i, [DW(1.2 + .5 * i, .8), DB, ...SDr, ...SOUTH, i === 0 ? JW(-2.5, 4.9) : capFin(i)], true)];
const lotT = track(capLegs(0));
export const abramPos = t => { const p = abramT(t); return [p.x, gAt(p.x, p.z), p.z]; };
export const lotPos = t => { const p = lotT(t); return [p.x, gAt(p.x, p.z), p.z]; };

// ---------------- little models
const mkFam = () => { const R = rng(1414); return {
  abram: person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48),
  lot: person(R, { pants: '#6a5a3a', top: '#8a9a6a', skin: '#b57a50', hair: '#3a2616', seed: 54 }, .44),
  mel: person(R, { pants: '#efe4cc', top: '#f6efdc', skin: '#c08258', hair: '#d9d2c4', beard: '#d9d2c4', cloth: '#f6efdc', sash: '#d9b36a', mantle: '#e8d8a8', seed: 61 }, .47),
  king: person(R, { pants: '#5a2a6a', top: '#8a4a9a', skin: '#b57a50', hair: '#2a1a10', beard: '#2a1a10', sash: '#d9b36a', mantle: '#6a2a7a', seed: 62 }, .47) }; };
const mkBanner = (R, c1, c2) => { const b = new GB(R); b.box('#5a3a20', [0, .85, 0], [.035, 1.7, .035], [0, 0, 0], .01); b.box(c1, [.22, 1.5, 0], [.44, .32, .02], [0, 0, 0], .02); b.box(c2, [.22, 1.5, .012], [.44, .09, .02], [0, 0, 0], .01); b.add(G.ico0, '#d9b36a', [0, 1.72, 0], [.05, .05, .05], [0, 0, 0], .02);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
const mkCrown = R => { const b = new GB(R); b.add(new THREE.CylinderGeometry(.115, .1, .06, 8), '#e0b040', [0, 1.12, 0], [1, 1, 1], [0, 0, 0], .01); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; b.add(new THREE.ConeGeometry(.022, .08, 4), '#f4cc58', [Math.cos(a) * .1, 1.18, Math.sin(a) * .1], [1, 1, 1], [0, 0, 0], .01); }
  return new THREE.Mesh(b.build(), lam); };
const mkLoot = (R, k) => { const b = new GB(R); b.box('#b8a070', [-.1, .1, 0], [.26, .2, .22], [0, R() * .5, 0], .03); b.box('#8a5a3a', [.14, .12, .06], [.14, .24, .14], [0, 0, 0], .02); b.box(['#7a3a4a', '#4a6a8a', '#a8864a'][k % 3], [0, .26, -.04], [.22, .1, .2], [0, R() * .5, 0], .02); b.box('#c9a15a', [-.02, .33, -.04], [.08, .06, .08], [0, 0, 0], .01);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; };
function tableMesh(R) { const b = new GB(R); b.box('#a8a39a', [0, .17, 0], [.95, .34, .5], [0, 0, 0], .04); b.box('#b8b2a6', [0, .36, 0], [1.05, .06, .58], [0, 0, 0], .03);
  const loaves = new THREE.Group(), lb = new GB(R); [[-.32, .06], [-.08, -.08], [.12, .08]].forEach(([x, z]) => lb.add(G.ico0, '#c8924a', [x, .46, z], [.11, .06, .09], [0, R() * 3, 0], .04)); const lm = new THREE.Mesh(lb.build(), lam); lm.castShadow = true; loaves.add(lm);
  const wine = new THREE.Group(), wb = new GB(R); wb.box('#8a4a3a', [.34, .48, -.04], [.09, .22, .09], [0, 0, 0], .02); wb.box('#d9b36a', [.18, .42, .12], [.08, .08, .08], [0, 0, 0], .01); wb.box('#7a1a30', [.18, .465, .12], [.06, .01, .06], [0, 0, 0], 0); const wm = new THREE.Mesh(wb.build(), lam); wm.castShadow = true; wine.add(wm);
  const t = new THREE.Mesh(b.build(), lam); t.castShadow = true; t.receiveShadow = true; const g = new THREE.Group(); g.add(t, loaves, wine); return { group: g, loaves, wine }; }
function altarMesh(R, n = 6) { const rows = [[-.34, 0, 0], [0, 0, 0], [.34, 0, 0], [-.17, .17, 0], [.17, .17, 0], [0, .34, 0]];
  return rows.slice(0, n).map(([x, y, z]) => { const gb = new GB(R); gb.box(pk(R, ['#a8a39a', '#938e84', '#b4aea2']), [x, y + .09, z], [.34 - y * .15, .17, .3], [0, (R() - .5) * .3, 0], .06); const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; }); }

// ====================================================================== the world
export function makeWar() {
  const R = rng(1414), g = new THREE.Group(), smoke = makeSmoke(10);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9101), RIC, hC, gcC, 30, 80), underRock(rng(9102), RIC - .1));
  const jp = new THREE.Group(); jp.position.set(...JP); g.add(jp); jp.add(mkIslet(rng(9301), RIJ, hJ, gcJ, 26, 70), underRock(rng(9302), RIJ - .1));
  const dn = new THREE.Group(); dn.position.set(...DP); g.add(dn); dn.add(mkIslet(rng(9201), RID, hD, gcD, 24, 64), underRock(rng(9202), RID - .1));
  const tree = (grp, hf, x, z, s, kind, cols) => { const geo = kind === 'palm' ? palmGeo(s, R) : kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, cols || ['#7a9a4a', '#6a8a40', '#88a655', '#5f8a3a']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hf(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; grp.add(m); return m; };
  // Canaan: the oaks of Mamre, a few trees, rocks, the camp (3 tents, a fire)
  const NORTHOAKS = [];
  { const OAKS = [[-9.4, -9.6, 2.1], [-8.6, -4.2, 2.3], [-6.2, -12.6, 2.0], [.2, -13.4, 2.2], [2.6, -6.6, 1.9]]; OAKS.forEach(([x, z, s], i) => { const om = tree(ca, hC, x, z, s, 'round', ['#5f8a3a', '#6a8a40', '#557f36', '#7a9a4a']); if (i === 2 || i === 3) NORTHOAKS.push(om); });
    for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 6 + R() * 13, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - MM[0], z - MM[1]) < 7.5 || hC(x, z) < .15 || (z < -14 && x > -3 && x < 8)) continue; tree(ca, hC, x, z, .9 + R() * .5, hC(x, z) > .9 ? 'pine' : i % 2 ? 'olive' : 'round'); }
    const b = new GB(R); for (let k = 0; k < 18; k++) { const a = R() * TAU, r = 6 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .15 || Math.hypot(x - MM[0], z - MM[1]) < 5.5) continue; b.add(G.ico0, pk(R, ['#8f8b82', '#a39f95', '#77746c']), [x, hC(x, z), z], [.2 + R() * .3, .14 + R() * .16, .2 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const TENTS = [[MM[0] - 2.8, MM[1] + 1.6, -.5, '#cdb48c'], [MM[0] - 4.6, MM[1] - 1.2, .6, '#c2a67a'], [MM[0] - 1.8, MM[1] + 3.6, 2.1, '#d4c29c'], [MM[0] + 3.2, MM[1] - 2.2, 1.0, '#c8b48c']];
  const mTents = TENTS.map(([x, z, ry, c]) => { const m = tentMesh(R, c, .56); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); return m; });
  const fireM = spriteGlow(MM[0] - 2.2, hC(MM[0] - 2.2, MM[1] + .2) + .28, MM[1] + .2, .8, 0xffa040, 0), fireM2 = spriteGlow(MM[0] - 2.2, hC(MM[0] - 2.2, MM[1] + .2) + .24, MM[1] + .2, .36, 0xffe0a0, 0); g.add(fireM, fireM2);
  smoke.add(MM[0] - 2.2, hC(MM[0] - 2.2, MM[1] + .2) + .3, MM[1] + .2, t => smooth(.5, 1.5, t) * (1 - smooth(13.2, 14.4, t)), .34, 2.4);
  g.add(mkStrip(R, SJ), mkStrip(R, SD));
  // the plain of Sodom: river, meadows, trees, the walled city, the King's Valley
  { const gb = new GB(R), A = [], B = []; for (let z = -11; z <= 11; z += .6) { const x = RJX(z), w = 1.0 + .22 * Math.sin(z * .7); A.push([x - w, -.04, z]); B.push([x + w, -.04, z]); }
    for (let i = 0; i + 1 < A.length; i++) { const c = (i & 1) ? '#5a9ab4' : '#4f8fae'; tri(gb, A[i], B[i], B[i + 1], c, .06); tri(gb, A[i], B[i + 1], A[i + 1], c, .06); } const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; jp.add(m); }
  { for (let i = 0; i < 30; i++) { const a = R() * TAU, r = 3 + R() * 8.5, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - SODL[0], z - SODL[1]) < 5.2 || Math.hypot(x - KVL[0], z - KVL[1]) < 4.6 || Math.abs(x - RJX(z)) < 1.5 || Math.hypot(x, z) > 11 || (z > -3 && z < 3 && x > -6 && x < 9)) continue; const tm = tree(jp, hJ, x, z, .8 + R() * .45, Math.abs(x - RJX(z)) < 3.4 ? 'palm' : i % 3 ? 'round' : 'olive', ['#5f9a46', '#52903e', '#6aa84f', '#7aaa52']); if (x > -4.5 && x < 6.5 && z > 5.0) tm.visible = false; }
    jp.add(meshOf(houseBlock(R, SODL[0], SODL[1], 5, 4, 1.0, hJ, 0)), meshOf(wallRing(R, SODL[0], SODL[1], 3.4, 2.7, hJ, 0, true))); }
  // Dan: a hill, a spring, trees, and the raiders' camp (four crimson tents, a fire, a heap of the loot)
  { for (let i = 0; i < 12; i++) { const a = R() * TAU, r = 3 + R() * 5.5, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - CMP[0], z - CMP[1]) < 4.6 || Math.hypot(x - 5.2, z + 4.4) < 1.8 || hD(x, z) < .1) continue; tree(dn, hD, x, z, .8 + R() * .5, hD(x, z) > .7 ? 'pine' : 'round', ['#6a8a40', '#5f8a3a', '#7a9a4a']); }
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, .04, 16), new THREE.MeshLambertMaterial({ color: 0x6aaed0, emissive: 0x16304a })); sp.position.set(5.2, hD(5.2, -4.4) + .02, -4.4); dn.add(sp); }
  const rTents = [[-2.4, -.4, .4], [3.0, -.6, -.5], [-.6, -4.0, 1.2], [3.2, -3.6, 2.0]].map(([x, z, ry]) => { const m = tentMesh(R, '#8a3a3a', .5); m.position.set(x, hD(x, z), z); m.rotation.y = ry; m.scale.setScalar(.001); dn.add(m); return m; });
  const dFire = spriteGlow(DP[0] + CMP[0], DP[1] + hD(CMP[0], CMP[1]) + .28, DP[2] + CMP[1], .9, 0xffa040, 0), dFire2 = spriteGlow(DP[0] + CMP[0], DP[1] + hD(CMP[0], CMP[1]) + .24, DP[2] + CMP[1], .4, 0xffe0a0, 0); g.add(dFire, dFire2);
  smoke.add(DP[0] + CMP[0], DP[1] + hD(CMP[0], CMP[1]) + .3, DP[2] + CMP[1], t => smooth(13.4, 14.6, t) * (1 - smooth(23.4, 24.6, t)), .36, 2.6); g.add(smoke.mesh);
  // the loot at the King's Valley: ten small heaps (the tenth is carried to Melchizedek); the table with bread and wine; the thread and the sandal strap
  const LOOT = Array.from({ length: 10 }, (_, k) => { const m = mkLoot(R, k); const [x, z] = JW(-1.0 + .55 * (k % 5), 7.5 + .75 * (k >> 1) * .6 + (k >> 2) * 0); m.position.set(x, gAt(x, z), z); m.userData.home = [x, z]; m.scale.setScalar(.001); g.add(m); return m; });
  { /* re-lay the ten heaps in two rows of five */ LOOT.forEach((m, k) => { const [x, z] = JW(-1.1 + .6 * (k % 5), 7.6 + .8 * (k >> 2 > 0 ? 1 : 0) + .8 * (k >= 5 ? 1 : 0) - .8 * (k >= 5 ? 1 : 0)); const zz = JW(0, 7.7 + .85 * (k >= 5 ? 1 : 0))[1]; m.position.set(x, gAt(x, zz), zz); m.userData.home = [x, zz]; }); }
  const TBL = tableMesh(R), [tx, tz] = JW(TB[0], TB[1]); TBL.group.position.set(tx, gAt(tx, tz), tz); TBL.group.rotation.y = .1; TBL.group.scale.setScalar(.001); g.add(TBL.group);
  const tGlow = spriteGlow(tx, gAt(tx, tz) + .6, tz, 1.1, 0xffd890, 0), tGlow2 = spriteGlow(tx, gAt(tx, tz) + .55, tz, .4, 0xfff0c0, 0); g.add(tGlow, tGlow2);
  const bl = pool(3.2, 0xffe6b0, 0); bl.position.set(tx + .2, gAt(tx, tz) + .1, tz + .6); g.add(bl);
  const thread = (() => { const b = new GB(R); for (let k = 0; k < 9; k++) { const u = k / 8; b.box('#e8dcb8', [-.34 + u * .68, .012, .05 * Math.sin(u * 5.2)], [.09, .012, .012], [0, -.2 * Math.cos(u * 5.2), 0], 0); }
    const m = new THREE.Mesh(b.build(), lam); return m; })();
  const sandal = (() => { const b = new GB(R); b.box('#7a5a3a', [0, .018, 0], [.34, .03, .13], [0, 0, 0], .01); b.box('#6a4a2c', [.04, .045, 0], [.04, .03, .13], [0, 0, 0], .01); b.box('#5a3a20', [-.04, .05, .03], [.02, .03, .07], [0, .5, 0], 0); b.box('#5a3a20', [-.04, .05, -.03], [.02, .03, .07], [0, -.5, 0], 0); b.box('#d8c8a0', [.16, .03, 0], [.04, .008, .1], [0, 0, 0], 0);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; })();
  const [sx, sz] = JW(AB[0] + 1.1, AB[1] - .5); thread.position.set(sx, gAt(sx, sz) + .04, sz); sandal.position.set(sx + .05, gAt(sx, sz) + .03, sz + .32); thread.scale.setScalar(.001); sandal.scale.setScalar(.001); g.add(thread, sandal);
  const tGl = pool(1.8, 0xffe6b0, 0); tGl.position.set(sx, gAt(sx, sz) + .06, sz + .15); g.add(tGl);
  // blessing light: a soft pool and glow around Abram and Melchizedek
  const [bx, bz] = JW((AB[0] + MEL[0]) / 2, AB[1] - .2), blsp = pool(3.0, 0xffe6b0, 0); blsp.position.set(bx, gAt(bx, bz) + .12, bz); g.add(blsp);
  const bGlow = spriteGlow(bx, gAt(bx, bz) + .9, bz - .6, 1.8, 0xffd890, 0), bGlow2 = spriteGlow(bx, gAt(bx, bz) + .8, bz - .5, .7, 0xfff0c0, 0); g.add(bGlow, bGlow2);
  const jMotes = makeMotes({ n: 90, area: [14, 3.0, 12], size: .05, v: .1, seed: 93, color: 0xffe6a0 }); g.add(jMotes.mesh);
  const flock = Array.from({ length: 5 }, (_, i) => { const b = makeBird(rng(900 + i), '#f4f0e6'); b.group.scale.setScalar(.5); g.add(b.group); return { ...b, r: 4 + i * .8, h: 3.4 + i * .4, w: (.2 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.1 }; });
  // ---- the people
  const F = mkFam(); [F.abram, F.lot, F.mel, F.king].forEach(o => g.add(o.group));
  const sc = (o, s) => { o.group.scale.setScalar(s); g.add(o.group); return o; };
  const SKr = rng(77), mkSoldier = (pal, seed) => person(SKr, { ...pal, skin: pk(SKr, SKINS10), hair: pk(SKr, HAIRS), staff: true, seed }, .42);
  const INV = { pants: '#6a2424', top: '#8a2e2e', cloth: '#2e1818' }, SOD = { pants: '#cfc2a0', top: '#4a6a9a', cloth: '#e8dcc0' }, MEN = { pants: '#8a7a50', top: '#a8905a', cloth: '#efe4cc' };
  const AG = [];
  const add = (o, kind, legs, ex = {}) => { g.add(o.group); const A = { o, kind, tr: track(legs), legs, ...ex }; AG.push(A); return A; };
  const rim = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  // Sodom's soldiers (blue and cream) and the four kings' raiders (crimson): they meet on the plain at the start, the soldiers scatter, the raiders gather the loot and the captives
  const sold = rim(8, i => { const o = mkSoldier(SOD, 700 + i); const a = JW(-5.6 + 1.05 * (i % 4), 1.2 + 1.0 * (i >> 2)), b = JW(.9 + .45 * (i % 4), .6 + 1.2 * (i >> 2)), c = JW(-6.8 + .9 * (i % 4), 6.8 + .5 * (i >> 2));
    return add(o, 'p', [Lg(0, 2.2, [a, b], true), Lg(3.0 + .05 * i, 5.4, [b, c])], { i, clash: 'S' }); });
  [0, 2, 3, 5, 7].forEach(i => { const bn = mkBanner(R, '#3f6a98', '#e8dcc0'); bn.scale.setScalar(1.15); bn.position.set(.12, .05, 0); sold[i].o.group.add(bn); });
  const invCamp = i => { const a = i / 10 * TAU + .4; return DW(CMP[0] + 2.1 * Math.cos(a), CMP[1] + 1.7 * Math.sin(a)); };
  const invEdge = i => DW(-3.6 + i * .8, -8.2);
  const inv = rim(10, i => { const o = mkSoldier(INV, 800 + i); const a = JW(9.4 + .5 * (i % 2), -2.2 + .9 * (i >> 1)), b = JW(3.4 + .5 * (i % 2), -1.4 + .9 * (i >> 1));
    return add(o, 'p', [Lg(0, 2.2, [a, b], true), Lg(4.3 + .12 * i, 12.6 + .12 * i, [b, JW(3.9, -2 - .15 * i), JW(3.9, -7.0), JW(1.5, -10.6), ...SDw, invCamp(i)], true), Lg(22.9 + .05 * i, 24.5 + .05 * i, [invCamp(i), invEdge(i)], true)], { i, clash: 'I', gone: 24.6 + .05 * i }); });
  [0, 3, 6, 9].forEach(i => { const bn = mkBanner(R, '#8a2e2e', '#d9b36a'); bn.scale.setScalar(1.15); bn.position.set(.12, .05, 0); inv[i].o.group.add(bn); });
  const camels = rim(4, i => { const o = makeCamel(rng(120 + i)); o.group.scale.setScalar(.5); const ld = mkLoot(R, i); ld.scale.setScalar(1.5); ld.position.set(0, .62, 0); ld.userData.keep = 1; o.group.add(ld); o.load = ld; const a = JW(6.4 + .3 * (i & 1), -4.2 + 1.2 * i - (i & 1) * .3);
    return add(o, 'a', [Lg(4.6 + .5 * i, 13.2 + .5 * i, [a, JW(3.9, -7.0), JW(1.5, -10.6), ...SDw, DW(-3 + .9 * i, 2.2)], true), Lg(26.5 + .4 * i, 31.2 + .4 * i, [DW(-3 + .9 * i, 2.2), DB, ...SDr, ...SOUTH, JW(-3.4 + .8 * i, 9.2)], true)], { i }); });
  // the captives: Lot and four people of Sodom
  const caps = CAPS.map(i => i === 0 ? { o: F.lot, own: true } : { o: mkPerson(rng(300 + i), .42), own: false });
  CAPS.forEach(i => add(caps[i].o, 'p', capLegs(i), { i, cap: true }));
  // a survivor brings the news to Abram
  const surv = mkPerson(rng(33), .42, { robe: '#b0a080' }); add(surv, 'p', [Lg(EV.surv[0], EV.surv[1], [SJr[0], [1.2, -15], [-.9, -8.5]], true)], { i: 77, surv: true });
  // Abram's trained men: they come out of the tents, line up, march, split around the camp, attack, and come back
  const mF = i => [MM[0] - 5.6 + (i % 6) * 1.05, MM[1] + 1.4 + (i / 6 | 0) * 1.05], mTent = i => [TENTS[i % 4][0] + .3, TENTS[i % 4][1] + .5];
  const ring = (i, k) => { const left = i < 12, u = (left ? i : i - 12) / 11, a = (left ? 100 + 160 * u : 80 - 160 * u) * D2R; return DW(CMP[0] + 5.2 * k * Math.cos(a), CMP[1] + 4.0 * k * Math.sin(a)); };
  const mFin = i => JW(-8.0 + (i % 6) * 1.0, 1.0 + (i / 6 | 0) * .9);
  const men = rim(24, i => { const o = mkSoldier(MEN, 900 + i); const d = .05 * i;
    return add(o, 'p', [Lg(10.9 + .06 * i, 13.2, [mTent(i), mF(i)]), Lg(13.6 + d, 21.0 + d, [mF(i), [-1, -12], [2, -16], ...SJw, ...NORTH, ...SDw], true), Lg(21.4 + .04 * i, 22.8, [DB, i < 12 ? DW(-5.8, 5.4) : DW(5.0, 6.4), ring(i, 1)]), Lg(22.9, 24.6, [ring(i, 1), ring(i, .55)]),
      Lg(26.2 + .07 * i, 30.8 + .07 * i, [ring(i, .55), DB, ...SDr, ...SOUTH, mFin(i)], true)], { i, men: true, vis: 10.9 + .06 * i }); });
  // the king of Sodom with four attendants (they come out of the city), Melchizedek with two attendants (they come over the stones from the south)
  const kingA = add(F.king, 'p', [Lg(EV.king[0], EV.king[1], [JW(-2.5, -1.6), JW(.5, .6), JW(KS[0], KS[1])])], { i: 90, king: true, vis: EV.king[0] - .2 }); const kc = mkCrown(R); F.king.group.add(kc);
  const kAt = rim(4, i => add(mkPerson(rng(500 + i), .42, { robe: '#6a3a7a' }), 'p', [Lg(EV.king[0] + .3 + .12 * i, EV.king[1] + .3, [JW(-2.5 + .5 * i, -1.6), JW(.3 + .5 * i, .8), JW(KS[0] + .9 + .55 * (i % 2), KS[1] - .3 + .55 * (i >> 1))])], { i: 91 + i, vis: EV.king[0] - .2 }));
  const melA = add(F.mel, 'p', [Lg(EV.mel[0], EV.mel[1], [SJw[SJw.length - 1], JW(.4, 7.4), JW(MEL[0], MEL[1])])], { i: 95, mel: true, vis: EV.mel[0] - .2 });
  const mAt = rim(2, i => { const o = mkPerson(rng(520 + i), .42, { robe: '#efe4cc' }); return add(o, 'p', [Lg(EV.mel[0] + .3 + .2 * i, EV.mel[1] + .1, [SJw[SJw.length - 1], JW(.6 + .6 * i, 7.9), JW(MEL[0] + .9 + .5 * i, MEL[1] + .5)])], { i: 96 + i, vis: EV.mel[0] - .2, att: i }); });
  const carry = [(() => { const b = new GB(R); b.box('#8a6a42', [0, .62, .22], [.26, .08, .2], [0, 0, 0], .02); [[-.06, 0], [.05, .02]].forEach(([x, z]) => b.add(G.ico0, '#c8924a', [x, .68, .22 + z], [.06, .035, .05], [0, 0, 0], .02)); return new THREE.Mesh(b.build(), lam); })(),
    (() => { const b = new GB(R); b.box('#8a4a3a', [0, .66, .22], [.07, .17, .07], [0, 0, 0], .02); b.box('#d9b36a', [.12, .62, .22], [.07, .07, .07], [0, 0, 0], .01); return new THREE.Mesh(b.build(), lam); })()];
  mAt.forEach((a, i) => a.o.group.add(carry[i]));
  // torches for the night attack
  const torchOn = rim(12, i => i * 2), torches = torchOn.map(() => { const s = spriteGlow(0, 0, 0, .55, 0xff9a40, 0); g.add(s); return s; });
  const flashes = rim(6, i => { const s = spriteGlow(0, 0, 0, 1.6, 0xffe0b0, 0); g.add(s); return s; });
  const dust = rim(8, i => { const s = spriteGlow(0, 0, 0, 1.5, 0xe8d8b8, 0); s.material.blending = THREE.NormalBlending; g.add(s); return s; });
  // ---- sky and far hills
  const far = farMountains10(rng(63)); g.add(far);
  const keep = [[0, 0, 24], [JP[0], JP[2], 14], [DP[0], DP[2], 12]];
  const sea = cloudSea(rng(64), 150, keep); g.add(sea.mesh);
  const CLOUD = [[0, '#b8b0c4'], [6, '#d8c4b8'], [11, '#f4f0ea'], [17, '#e8c4a8'], [20.5, '#3a4268'], [27, '#3a4268'], [30, '#e0b898'], [34, '#f4ecde'], [52, '#f0e8dc'], [56, '#f0b890'], [60, '#f0b890'], [90, '#4c5478']];
  const CEM = [[0, '#4a4668'], [11, '#5a5670'], [20.5, '#161c38'], [27, '#161c38'], [30, '#5a5670'], [56, '#3c3450'], [60, '#5a5670'], [90, '#222640']];
  const SMK = [[0, '#c8c0c8'], [10, '#e0d6c8'], [20, '#8a8aa0'], [30, '#d8c6b0'], [90, '#707490']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  const nightK = t => smooth(17.2, 20.6, t) * (1 - smooth(28.6, 30.4, t));   // 1 at night

  // ---- animation
  function fig(f, x, z, ry, mv, t, ph, extra = {}) { const w = walkAnim(t, ph, 9.5); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  function ani(an, x, z, ry, mv, t, i) { an.group.position.set(x, gAt(x, z) - .02, z); an.group.rotation.y = ry; if (mv) walkLegs(an.legs, t + i, 4.4, .32); }
  const pulse = (t, f, ph = 0) => Math.max(0, Math.sin(t * f + ph));
  const pos = {};   // last computed world positions, for torches, effects and the carried heaps
  function update(t, cam) {
    NORTHOAKS.forEach(m => { m.visible = t < 31.5 || t > 62; });
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam && cam.position, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)), M = far.userData.mat, f = smooth(0, 5, t) * .66; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
    const night = nightK(t), fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3);
    // fires: Mamre until the men leave, the raiders' fire at Dan until the attack; Dan's tents go up when they arrive
    { const on = smooth(.4, 1.4, t) * (1 - smooth(13.2, 14.4, t)); fireM.material.opacity = .62 * on * fl; fireM2.material.opacity = .5 * on; fireM.visible = fireM2.visible = on > .01;
      const onD = smooth(13.4, 14.6, t) * (1 - smooth(24.0, 25.0, t)); dFire.material.opacity = .7 * onD * fl; dFire2.material.opacity = .5 * onD; dFire.visible = dFire2.visible = onD > .01; }
    rTents.forEach((m, i) => { const u = ease.outBack(seg(t, 13.6 + i * .25, 14.4 + i * .25)) * (1 - smooth(24.4, 25.2, t)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    mTents.forEach((m, i) => { const u = 1 - smooth(14.6 + i * .2, 15.6 + i * .2, t) * 0; m.scale.setScalar(u); });
    // the table, the heaps of loot, the thread and the sandal strap, the blessing light
    { const u = ease.outBack(seg(t, 35.2, 35.9)); TBL.group.scale.setScalar(Math.max(.001, u)); TBL.group.visible = u > .01; TBL.loaves.visible = TBL.wine.visible = t > 36.0;
      const gg = smooth(36.0, 37.2, t) * (1 - smooth(55.0, 57.5, t)), flk = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3); tGlow.material.opacity = .26 * gg * flk; tGlow2.material.opacity = .22 * gg; tGlow.visible = tGlow2.visible = gg > .01; bl.material.opacity = .26 * gg; bl.visible = gg > .01;
      const bk = smooth(EV.bless[0] - .3, EV.bless[0] + 1.2, t) * (1 - smooth(EV.bless[1] + 1.4, EV.bless[1] + 3.2, t)); blsp.material.opacity = .34 * bk; blsp.visible = bk > .01; bGlow.material.opacity = .6 * bk * flk; bGlow2.material.opacity = .5 * bk; bGlow.visible = bGlow2.visible = bk > .01;
      const ts = ease.outBack(seg(t, EV.refuse[0] + .2, EV.refuse[0] + 1.0)) * (1 - smooth(EV.refuse[1] + .2, EV.refuse[1] + 1.0, t)); thread.scale.setScalar(Math.max(.001, ts * 2.4)); sandal.scale.setScalar(Math.max(.001, ts * 2.4)); thread.visible = sandal.visible = ts > .01; tGl.material.opacity = .5 * ts; tGl.visible = ts > .01;
      jMotes.update(t, .9 * smooth(31, 34, t) * (1 - smooth(57.5, 59.5, t)), [JP[0], JP[1] + .3, JP[2] + 4]);
      LOOT.forEach((m, k) => { const [hx, hz] = m.userData.home; let x = hx, z = hz, y = 0; const u = ease.outBack(seg(t, 30.4 + .06 * k, 31.2 + .06 * k)); let s = u; if (k === 4) { const go = ease.inOutSine(seg(t, EV.tenth[0] + .4, EV.tenth[0] + 2.0)), ret = smooth(EV.tenth[1] - 1.5, EV.tenth[1] - .3, t); const [ex, ez] = JW(MEL[0] + 1.1, MEL[1] + .9); x = lerp(hx, ex, go); z = lerp(hz, ez, go); y = Math.sin(Math.PI * go) * .35; s = u * (1 - 0 * ret); }
        m.position.set(x, gAt(x, z) + y, z); m.scale.setScalar(Math.max(.001, s)); m.visible = s > .01; }); }
    // the plain: dust at the first clash, light birds
    { const cl = smooth(EV.clash[0] - .3, EV.clash[0] + .4, t) * (1 - smooth(EV.clash[1] + .2, EV.clash[1] + 1.4, t)); dust.slice(0, 4).forEach((s, i) => { const [x, z] = JW(2.2 + .9 * Math.sin(i * 2.1), .2 + 1.4 * Math.cos(i * 1.7)); s.position.set(x, gAt(x, z) + .5 + .25 * Math.sin(t * 2 + i) + .3 * seg(t, 1.5, 3.8), z); s.material.opacity = .34 * cl * (.7 + .3 * Math.sin(t * 3 + i)); s.visible = cl > .01; s.scale.setScalar(1.6 + .6 * i * .3); });
      flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t < 17 || t > 31; b.group.position.set(JP[0] + Math.cos(a) * b.r, JP[1] + b.h + Math.sin(t * .5 + i), JP[2] + 2 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); }); }
    // the people and animals
    AG.forEach(A => { const p = A.tr(t); let ry = A.kind === 'a' ? headX(p.vx, p.vz) : headZ(p.vx, p.vz), x = p.x, z = p.z, ex = {}, vis = true, scl = 1;
      if (A.vis != null) vis = t >= A.vis; if (A.surv) vis = t >= EV.surv[0] - .1 && t < 13.4;
      if (A.gone != null && t > A.gone) vis = false;
      if (A.clash) { const q = smooth(1.2, 1.7, t) * (1 - smooth(3.4, 3.9, t)); if (q > .01) { const ph = A.i * 1.3, dir = A.clash === 'I' ? headZ(-1, 0) : headZ(1, 0); ry = la(ry, dir, q) + .2 * q * Math.sin(t * 5 + ph); ex = { a0x: -1.3 * q * pulse(t, 3.4, ph), a1x: -.9 * q * pulse(t, 3.4, ph + 1) }; } }
      if (A.cap && !p.mv) { const held = t < EV.free[0]; ex = { lx: held ? .14 : 0, a0x: held ? -.2 : 0, a1x: held ? -.2 : 0 }; if (t > EV.free[0] && t < EV.free[1] + .5) { ry = la(ry, headZ(.3, 1), smooth(EV.free[0], EV.free[0] + .5, t)); } }
      if (A.surv && !p.mv && t > EV.surv[1] - .1) { ry = headZ(-.7, 1.4); const br = Math.sin(t * 9) * .02; ex = { lx: .12 + br, a0x: -1.0 * pulse(t, 2.4), a1x: -.2 }; }
      if (A.men && !p.mv && t >= 13.2 && t < 13.6) ry = headZ(1, -.4);
      if (A.men && !p.mv && t > EV.split[1] && t < EV.back[0]) { const k = A.i < 12 ? 1 : -1; ry = la(ry, headZ(-k * 1.0, -.6) , .7); }
      if (A.men && !p.mv && t > EV.back[1]) ry = headZ(1, .1);
      if (A.inv && !p.mv && t > 14 && t < 22.6) ry = ry;
      if (A.mel || A.att != null) { if (!p.mv) { ry = A.mel ? headZ(-1, .15) : headZ(-1, 0); } }
      if (A.king) { if (!p.mv) { ry = headZ(-1, .2); const of = smooth(EV.offer[0], EV.offer[0] + .6, t) * (1 - smooth(EV.offer[1] + 2.2, EV.offer[1] + 3.0, t)); if (of > .01) ex = { a0x: -1.1 * of, a1x: -.9 * of, a0z: -.4 * of, a1z: .4 * of }; } }
      if (A.vis != null && A.i >= 91 && A.i < 95 && !p.mv) ry = headZ(-1, .3);
      pos[A.i != null && A.kind === 'p' ? A.i + (A.cap ? 1000 : 0) + (A.men ? 2000 : 0) + (A.clash ? 3000 + (A.clash === 'I' ? 100 : 0) : 0) : 0] = [x, z];
      A.o.group.visible = vis;
      if (A.kind === 'p') { if (A.o === F.king) kc.visible = vis; fig(A.o, x, z, ry, p.mv, t, A.i * 1.7, ex); } else { ani(A.o, x, z, ry, p.mv, t, A.i); if (A.o.load) A.o.load.visible = t < 31.6; } });
    // the heap carried by two men is moved by the loot code above; the two carriers take a short walk to the table and back
    // Abram
    { const p = abramT(t); let x = p.x, z = p.z, mv = p.mv, ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) {
        if (t < 13.5) { ry = la(headZ(.2, -1), headZ(.7, -1.4), smooth(EV.surv[1] - .5, EV.surv[1] + .1, t)); const ar = smooth(EV.muster[0], EV.muster[0] + 1.2, t) * (1 - smooth(13.2, 13.6, t)); if (t >= EV.muster[0]) ry = la(ry, headZ(-1, .5), smooth(EV.muster[0], EV.muster[0] + .6, t)); ex = { a0x: -.9 * ar, a1x: -.9 * ar, a0z: -.4 * ar, a1z: .4 * ar, lx: -.08 * ar }; }
        else if (t > 21.1 && t < 26.8) { ry = headZ(-.15, -1); if (t < 24.8) ex = { a0x: -.5 * smooth(21.8, 22.3, t), a1x: -.5 * smooth(21.8, 22.3, t), a0z: -.3, a1z: .3 }; }
        else if (t >= 30.6) {
          ry = headZ(1, 0); const k = smooth(EV.king[0] + 2.6, EV.king[0] + 3.4, t); ry = la(headZ(1, -.4), headZ(1, 0), k);
          if (t >= EV.bless[0]) { const bw = smooth(EV.bless[0] + .2, EV.bless[0] + 1.2, t) * (1 - smooth(EV.bless[1], EV.bless[1] + .8, t)); ex = { lx: .24 * bw, a0x: -.3 * bw, a1x: -.3 * bw }; }
          if (t >= EV.tenth[0]) { const gv = smooth(EV.tenth[0] + .8, EV.tenth[0] + 1.8, t) * (1 - smooth(EV.tenth[0] + 3.4, EV.tenth[0] + 4.2, t)); ex = { ...ex, a0x: -.9 * gv, a1x: -.9 * gv, a0z: -.3, a1z: .3 }; }
          if (t >= EV.refuse[0]) { const sh = smooth(EV.refuse[0], EV.refuse[0] + .4, t) * (1 - smooth(EV.refuse[1] + .6, EV.refuse[1] + 1.4, t)), sw = Math.sin((t - EV.refuse[0]) * 6.2) * sh; ry = la(ry, headZ(1, 0) + .5 * sw, sh); ex = { a1x: -2.3 * sh, a1z: .15 * sh, a0x: -.4 * sh, lx: -.05 * sh }; }
          if (t >= EV.close[0]) { const cl = smooth(EV.close[0], EV.close[0] + 1.2, t); ry = la(ry, headZ(.3, 1), cl * .6); ex = { a0x: -.7 * cl, a1x: -.7 * cl, a0z: -.45 * cl, a1z: .45 * cl }; } } }
      A_pos = [x, z]; fig(F.abram, x, z, ry, mv, t, 0, ex); }
    // Melchizedek lifts his hands to bless
    { const m = F.mel, bw = smooth(EV.bless[0], EV.bless[0] + 1.0, t) * (1 - smooth(EV.bless[1], EV.bless[1] + .8, t)); if (bw > .01) { m.arms[0].rotation.set(-2.0 * bw, 0, -.5 * bw); m.arms[1].rotation.set(-2.0 * bw, 0, .5 * bw); }
      const pr = smooth(EV.mel[0] + 3.0, EV.mel[1], t) * (1 - smooth(EV.mel[1] + .4, EV.mel[1] + 1.2, t)); if (pr > .01 && bw < .01) { m.arms[0].rotation.set(-.9 * pr, 0, -.2); m.arms[1].rotation.set(-.9 * pr, 0, .2); } }
    mAt.forEach((a, i) => { carry[i].visible = t < EV.mel[1] + .3; });
    // torches on the marching men at night; flashes and dust when the camp is taken
    torches.forEach((s, k) => { const i = torchOn[k], P = AG.find(A => A.men && A.i === i); const q = P ? P.tr(t) : null; const on = night * smooth(19.4, 20.4, t) * (1 - smooth(27.2, 28.6, t)); if (q) { s.position.set(q.x + .12, gAt(q.x, q.z) + .52, q.z); } s.material.opacity = .85 * on * (.8 + .2 * Math.sin(t * 11 + k * 2)); s.visible = on > .01; });
    flashes.forEach((s, k) => { const tt = 22.9 + k * .33, u = seg(t, tt, tt + .5), o = Math.sin(Math.PI * u), [x, z] = DW(CMP[0] + 3.3 * Math.cos(k * 1.9 + .5), CMP[1] + 2.5 * Math.sin(k * 1.9 + .5)); s.position.set(x, DP[1] + hD(x - DP[0], z - DP[2]) + .6, z); s.material.opacity = .8 * o; s.scale.setScalar(.8 + 1.8 * u); s.visible = o > .01; });
    dust.slice(4).forEach((s, k) => { const tt = 23.2 + k * .35, u = seg(t, tt, tt + 1.6), o = Math.sin(Math.PI * u), [x, z] = DW(-2.5 + k * 1.8, -6.4); s.position.set(x, DP[1] + hD(x - DP[0], z - DP[2]) + .45 + .5 * u, z); s.material.opacity = .4 * o; s.scale.setScalar(1.4 + u * 1.6); s.visible = o > .01; });
    smoke.update(t, colAt(SMK, t));
  }
  let A_pos = [0, 0];
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#6a6478', '#3a3238', .92, '#ffb878', 1.8, [10, 5, 6], .5, '#8a8cff', [-10, 6, -8], 16),
    Dk(6, '#7a7890', '#403a3c', 1.0, '#ffc890', 2.0, [10, 6, 6], .5, '#8a9cff', [-10, 6, -8], 16),
    Dk(11, '#8a9cc8', '#454448', 1.05, '#ffe0b0', 2.2, [10, 7, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(16, '#8a98c0', '#45403c', 1.05, '#ffe0b0', 2.2, [10, 7, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(18.6, '#8a7aa0', '#4a3a4a', .98, '#ffa860', 1.9, [-12, 4, 6], .5, '#6a7cff', [8, 5, -6], 16),
    Dk(20.8, '#3c4c8c', '#1c2038', .95, '#9ab0f0', 1.6, [-6, 9, 8], .55, '#ffb070', [8, 4, 6], 16),
    Dk(28.0, '#3c4c8c', '#1c2038', .95, '#9ab0f0', 1.6, [-6, 9, 8], .55, '#ffb070', [8, 4, 6], 16),
    Dk(30.6, '#8a7aa0', '#4a3a4a', 1.0, '#ffb888', 2.0, [10, 4, 8], .5, '#ffcf9a', [-8, 5, 6], 16),
    Dk(33.6, '#a09aa0', '#4a443c', 1.1, '#fff0c8', 2.5, [6, 9, 6], .35, '#c8c0a8', [-8, 6, -6], 16),
    Dk(48, '#a09aa0', '#4a443c', 1.1, '#ffe8b8', 2.4, [4, 9, 6], .35, '#c8c0a8', [-8, 6, -6], 16),
    Dk(56, '#9a90a8', '#463e3a', 1.05, '#ffd8a0', 2.2, [-9, 6, 6], .5, '#ffcf9a', [7, 4.5, 10], 16),
    Dk(60, '#8a82a2', '#46403e', 1.05, '#ffc890', 2.0, [-9, 5, 6], .5, '#ffcf9a', [7, 4.5, 10], 14)];
  const bg = [[0, ['#2a2a52', '#c88a68']], [6, ['#2a3a70', '#d8a070']], [11, ['#3a6ab0', '#f0d8a8']], [16, ['#3a6ab0', '#f0d0a0']], [18.6, ['#2a3470', '#d08a68']], [20.8, ['#0c1230', '#1e2a50']], [28, ['#0c1230', '#26325a']], [30.6, ['#2a3a78', '#e0a080']], [34, ['#4a7ab8', '#f4e4c0']], [48, ['#3a6ab0', '#f0dcb0']], [56, ['#2a3a78', '#f0b078']], [60, ['#1c2a60', '#c88a88']]];
  const posOf = { abram: abramPos, lot: lotPos };
  return { group: g, update, light, bg, far, AG, F, getPos: () => pos };
}
// helpers for the cameras (the same tracks as the figures, evaluated by index)
const _tr = { inv: i => track([Lg(0, 2.2, [JW(9.4 + .5 * (i % 2), -2.2 + .9 * (i >> 1)), JW(3.4 + .5 * (i % 2), -1.4 + .9 * (i >> 1))], true), Lg(4.3 + .12 * i, 12.6 + .12 * i, [JW(3.4 + .5 * (i % 2), -1.4 + .9 * (i >> 1)), JW(3.9, -2 - .15 * i), JW(3.9, -7.0), JW(1.5, -10.6), ...SDw, DW(CMP[0] + 2.1 * Math.cos(i / 10 * TAU + .4), CMP[1] + 1.7 * Math.sin(i / 10 * TAU + .4))], true)]),
  men: i => track([Lg(13.6 + .05 * i, 21.0 + .05 * i, [[MM[0] - 5.6 + (i % 6) * 1.05, MM[1] + 1.4 + (i / 6 | 0) * 1.05], [-1, -12], [2, -16], ...SJw, ...NORTH, ...SDw], true)]) };
export const invPos = (i, t) => { const p = _tr.inv(i)(t); return [p.x, gAt(p.x, p.z), p.z]; };
export const menPos = (i, t) => { const p = _tr.men(i)(t); return [p.x, gAt(p.x, p.z), p.z]; };
export const lootPos = (k = 4) => { const [x, z] = JW(-1.1 + .6 * (k % 5), 7.7 + .85 * (k >= 5 ? 1 : 0)); return [x, gAt(x, z), z]; };
export const stage = { JW, DW, TB, AB, MEL, KS, CMP, gAt, MM, DB, SJw, SDw };
