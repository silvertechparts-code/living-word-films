// Episode 12: Genesis 12. The call of Abram. Haran at dawn, the Lord's word (shown only as light), a golden thread to the land he will be shown, the families of the earth (the six lands of Babel, blessed),
// the journey across the clouds (a path of stones forms under the travellers), Shechem and the altar, the tent near Bethel, famine, Egypt, Sarai taken to Pharaoh's palace, the plagues (dark cloud only), Pharaoh sends Abram away.
// Cinematic interpretation: the thread, the stepping stones, the six coloured lands, the size of the caravan, the dark cloud for the plagues and the pyramids in the far haze are not in the text. The Lord is never shown as a figure.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, keyed, rgbOf, mx, css } from './util.js';
import { pk, tri, makeCamel, makeDonkey, makeOx, makeSheep, walkLegs, roundTreeGeo, oliveGeo, palmGeo, pineGeo, makeMotes } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, mkPerson, houseBlock, wallRing, tentMesh, meshOf, makeSmoke, makeThread, makeBoat, cloudSea, farMountains10, headZ, headX, C3, rimf } from './world10.js';

export const PLACE = { a1: 1.0, b1: 7.4, b2: 13.0, c1: 17.8, c2: 24.3, c3: 31.0, d1: 34.0, d2: 39.0, d3: 43.6, e1: 50.8, e2: 55.3, h1: 61.0, h2: 66.8, h3: 71.6, h4: 78.6, i: 85.3 };
export const HP = [-52, -1.6, 4], EP = [53, -2.4, -7];                 // Haran and Egypt (centres); Canaan is at the origin
const RIH = 15, RIC = 24, RIE = 22;
export const EV = { call: [.7, 4.6], thread: [7.9, 11.7], fam: [13.1, 16.6], famOut: [17.5, 18.8], go: 18.0, lord: [24.8, 29.6], altar: [31.0, 32.9], bethel: 34.1, famine: [38.6, 41.9], eg: [41.6, 43.0], plague: [50.4, 54.6], send: 55.5 };
const D2R = Math.PI / 180;
const C6 = ['#ffb04a', '#5aa0ff', '#7ad08a', '#e0688a', '#a07aff', '#4ad0c8'];
const GOLD = '#ffd27a';

// ---------------- terrain
const HILLC = [[20, -10, 2.4, 9], [-5, -15, 1.4, 7], [8, -16, 1.1, 5], [-18, -12, .9, 6]];
const SH = [-17, 3.5], BT = [18, -.2];                              // Shechem and the Bethel camp (Canaan, world x z)
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .06 * Math.sin(x * .5 + z * .3) + .045 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLC) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  h = lerp(h, .32, smooth(4.2, 1.8, Math.hypot(x - SH[0], z - SH[1]))); h = lerp(h, .5, smooth(4.2, 1.8, Math.hypot(x - BT[0], z - BT[1])));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { let b = C3('#8c9c58').lerp(C3('#7c9050'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); if (y > .95) b.lerp(C3('#9a8e7c'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#8d8578'), clamp((s - .26) * 2));
  const d1 = Math.hypot(x - SH[0], z - SH[1]), d2 = Math.hypot(x - BT[0], z - BT[1]); b.lerp(C3('#c4ae82'), .6 * Math.max(smooth(4, 1.5, d1), smooth(4, 1.5, d2))); if (y < .02) b.lerp(C3('#bdb592'), .7); return b.getHex(); };
const gcCD = (x, y, z, s) => { let b = C3('#cdb070').lerp(C3('#bc9c60'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); if (y > .95) b.lerp(C3('#a8906c'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#9a8a74'), clamp((s - .26) * 2)); if (y < .02) b.lerp(C3('#c9bd96'), .7); return b.getHex(); };
const hH = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .06 * Math.sin(x * .6 + z * .4) + .04 * Math.sin(x * 1.5 - z * 1.2); const d = Math.hypot(x + 6, z + 7) / 6; if (d < 1) h = Math.max(h, 1.3 * Math.pow(1 - d, 1.2)); h = lerp(h, .3, smooth(4.2, 1.8, Math.hypot(x - 8.4, z - 5.8)));
  return rimf(RIH, h, r, -.02); };
const gcH = (x, y, z, s) => { let b = C3('#b8ac6c').lerp(C3('#a8a468'), .5 * smooth(-1, 1, Math.sin(x * .8 + z * .6))); b.lerp(C3('#c8b184'), .7 * smooth(4.4, 1.6, Math.hypot(x - 8.4, z - 5.8))); if (y > .8) b.lerp(C3('#9a8e7c'), clamp((y - .7) * .8)); if (y < .02) b.lerp(C3('#bdb592'), .7); return b.getHex(); };
const NX = z => 2.6 + 1.3 * Math.sin(z * .24);                                                 // the Nile (Egypt, local x as a function of z)
const hE = (x, z) => { const r = Math.hypot(x, z); let h = .34 + .05 * Math.sin(x * .6 + z * .4) + .04 * Math.sin(x * 1.5 - z * 1.2); h = lerp(h, -.3, smooth(2.0, .8, Math.abs(x - NX(z)))); h = lerp(h, .42, smooth(7.2, 4.2, Math.hypot(x + 11.5, z + 3)));
  return rimf(RIE, h, r, -.02); };
const gcE = (x, y, z, s) => { let b = C3('#d8bc7c').lerp(C3('#c8a866'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .5))); const dn = Math.abs(x - NX(z)); if (dn < 4.2) b.lerp(C3('#7f9a50'), smooth(4.2, 1.6, dn) * .9);
  b.lerp(C3('#e0cc98'), .6 * smooth(7, 4, Math.hypot(x + 11.5, z + 3))); if (y < .05) b.lerp(C3('#bdb08a'), .7); return b.getHex(); };
const hF = Rr => (x, z) => { const r = Math.hypot(x, z); return rimf(Rr, .3 + .45 * Math.max(0, 1 - Math.hypot(x - .5, z + .3) / 1.7), r); };
const gcF = (x, y, z, s) => C3('#8c9c58').lerp(C3('#a29a7c'), clamp((y - .5) * 1.2)).getHex();
// the six lands of the families (same colours as the six peoples of Babel)
const FAR = C6.map((c, g) => { const a = (g * 60 + 30) * D2R, d = [32, 35, 31, 34, 35, 33][g]; return { g, c, x: Math.cos(a) * d, z: Math.sin(a) * d, y: [-2.4, -3.0, -2.2, -3.2, -2.6, -2.9][g], a }; });

// ---------------- the paths of stones (Haran to Canaan, Canaan to Egypt)
const SA = { A: [-37.4, -1.55, 6.8], B: [-23.8, .1, 2.8], n: 11, wig: 1.2, ph: .4 }, SB = { A: [23.8, .1, 3.6], B: [30.8, -2.35, -2.4], n: 7, wig: .8, ph: 1.6 };
const stripAt = (S, u) => [lerp(S.A[0], S.B[0], u), lerp(S.A[1], S.B[1], smooth(0, 1, u)), lerp(S.A[2], S.B[2], u) + S.wig * Math.sin(u * 4.4 + S.ph)];
const stripU = (S, x) => clamp((x - S.A[0]) / (S.B[0] - S.A[0]));
const gAt = (x, z) => {
  if (Math.hypot(x - HP[0], z - HP[2]) < RIH - .2) return HP[1] + hH(x - HP[0], z - HP[2]);
  if (Math.hypot(x, z) < RIC - .2) return hC(x, z);
  if (Math.hypot(x - EP[0], z - EP[2]) < RIE - .2) return EP[1] + hE(x - EP[0], z - EP[2]);
  return x < 0 ? stripAt(SA, stripU(SA, x))[1] : stripAt(SB, stripU(SB, x))[1];
};
function mkStone(R, r) { const b = new GB(R); b.add(G.ico0, pk(R, ['#b9a98a', '#a89878', '#c4b48f']), [0, .06, 0], [r, .2, r * .95], [0, R() * 3, 0], .06); b.add(G.ico0, '#8a7a5e', [0, -.22, 0], [r * .78, .3, r * .74], [0, R() * 3, 0], .06); b.add(G.ico0, '#6a5a44', [0, -.55, 0], [r * .45, .34, r * .42], [0, R() * 3, 0], .06);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; }
function mkStrip(R, S) { const grp = new THREE.Group(), items = [];
  for (let i = 0; i < S.n; i++) { const u = (i + .5) / S.n, [x, y, z] = stripAt(S, u), m = mkStone(R, 1.05 + .2 * R()); m.position.set(x, y - .24, z); m.scale.setScalar(.001); m.visible = false; grp.add(m);
    const gl = pool(1.5, 0xffd27a, 0); gl.position.set(x, y + .04, z); grp.add(gl); items.push({ m, gl, u, x, y, z }); }
  return { grp, items }; }

// ---------------- paths for walkers
const mkPath = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, len: L[L.length - 1] }; };
const pathAt = (P, s) => { const d = clamp(s) * P.len; let i = 0; while (i < P.pts.length - 2 && P.L[i + 1] < d) i++; const a = P.pts[i], b = P.pts[i + 1], k = (d - P.L[i]) / ((P.L[i + 1] - P.L[i]) || 1); return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), vx: b[0] - a[0], vz: b[1] - a[1] }; };
const stripPts = (S, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const p = stripAt(S, i / n); return [p[0], p[2]]; });
const walkAnim = (t, ph = 0, sp = 6.2) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
const PA = stripPts(SA), PB = stripPts(SB);
const P1 = mkPath([[HP[0] + 8.0, HP[2] + 6.0], [HP[0] + 12.8, HP[2] + 3.6], ...PA, [SH[0] - 3.2, SH[1] - .2], [SH[0] - .4, SH[1] + .8]]);
const P2 = mkPath([[BT[0] + 1.4, BT[1] + .6], [BT[0] + 4.6, BT[1] + 3.4], ...PB, [EP[0] - 17.5, EP[2] + 4.2], [EP[0] - 12.4, EP[2] + 2.2]]);                  // Bethel -> strip -> Egypt (plaza in front of the gate)
const PLZ = [EP[0] - 12.4, EP[2] + 2.2], GATE = [EP[0] - 11.5, EP[2] - 1.2], DOOR = [EP[0] - 11.5, EP[2] - 5.0];
const P3 = mkPath([[PLZ[0], PLZ[1] - .6], [GATE[0], GATE[1]], [DOOR[0], DOOR[1] + .5]]), P3b = mkPath([[DOOR[0], DOOR[1] + .5], [GATE[0], GATE[1] + .2], [PLZ[0] + .8, PLZ[1] - 1.0]]);
const P4 = mkPath([[PLZ[0], PLZ[1]], [EP[0] - 17.5, EP[2] + 4.2], ...PB.slice().reverse(), [BT[0] + 4.6, BT[1] + 3.4]]);
export const lead1 = t => { const s = ease.inOutSine(seg(t, EV.go, 24.7)), p = pathAt(P1, s); return [p.x, gAt(p.x, p.z), p.z]; };
export const lead2 = t => { const p = t < 56 ? pathAt(P2, ease.inOutSine(seg(t, 39.6, 45.4))) : pathAt(P4, ease.inOutSine(seg(t, 57.2, 61.0))); return [p.x, gAt(p.x, p.z), p.z]; };

// ---------------- buildings
function palaceMesh(R, cx, cz, hf) {   // a flat-roofed palace with a pillared front, a golden frieze and a dark doorway; the courtyard wall has a gap in front
  const b = new GB(R), y = hf(cx, cz);
  b.box('#c9b48a', [cx, y + .18, cz], [5.0, .36, 3.4], [0, 0, 0], .04); b.box('#d8c598', [cx, y + .86, cz], [3.6, 1.0, 2.2], [0, 0, 0], .04); b.box('#e2d1a6', [cx, y + 1.56, cz], [2.5, .5, 1.5], [0, 0, 0], .04);
  b.box('#3a6aa8', [cx, y + 1.27, cz + 1.12], [3.6, .1, .06], [0, 0, 0], .02); b.box('#e0b848', [cx, y + 1.34, cz + 1.12], [3.64, .05, .08], [0, 0, 0], .02); b.box('#e0b848', [cx, y + 1.83, cz], [2.56, .06, 1.56], [0, 0, 0], .02);
  for (let k = 0; k < 6; k++) b.box('#efe4c8', [cx - 1.5 + k * .6, y + .86, cz + 1.2], [.13, 1.0, .13], [0, 0, 0], .02);
  b.box('#241508', [cx, y + .62, cz + 1.11], [.7, .84, .08], [0, 0, 0], .02);
  for (const s of [-1, 1]) { b.box('#d4c29c', [cx + s * 3.2, y + .45, cz - .2], [1.6, .9, 2.2], [0, 0, 0], .04); b.box('#e0b848', [cx + s * 3.2, y + .93, cz - .2], [1.66, .05, 2.26], [0, 0, 0], .02); }
  for (let s = 0; s < 4; s++) b.box('#cbb78e', [cx, y + .08 + s * .06, cz + 1.9 + (3 - s) * .1 + .45], [1.8 + (3 - s) * .5, .12, .45], [0, 0, 0], .03);
  for (const x of [-1.5, 1.5]) for (let k = 0; k < 4; k++) b.box('#2a1c10', [cx + x - .1 + k * .07, y + .96 + .18, cz + 1.12], [.05, .0001, .04], [0, 0, 0], .0);
  return b; }
function courtWall(R, cx, cz, hw, hd, hf, gap = .9) {
  const b = new GB(R), H = .9, T = .16, put = (x, z, w, d) => { b.box('#c2ae86', [x, hf(x, z) + H / 2, z], [w, H, d], [0, 0, 0], .04);
    const n = Math.floor(Math.max(w, d) / .34); for (let k = 0; k < n; k++) { const u = (k + .5) / n - .5; b.box('#b09c74', [x + (w > d ? u * w : 0), hf(x, z) + H + .07, z + (w > d ? 0 : u * d)], [w > d ? .16 : T * 1.2, .14, w > d ? T * 1.2 : .16], [0, 0, 0], .03); } };
  put(cx, cz - hd, hw * 2, T); put(cx - hw, cz, T, hd * 2); put(cx + hw, cz, T, hd * 2); const wl = hw - gap; put(cx - gap - wl / 2, cz + hd, wl, T); put(cx + gap + wl / 2, cz + hd, wl, T);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = cx + sx * hw, z = cz + sz * hd; b.box('#cbb78e', [x, hf(x, z) + .7, z], [.5, 1.4, .5], [0, 0, 0], .04); b.box('#e0b848', [x, hf(x, z) + 1.46, z], [.58, .1, .58], [0, 0, 0], .03); }
  for (const s of [-1, 1]) b.box('#cbb78e', [cx + s * (gap + .15), hf(cx, cz + hd) + .7, cz + hd], [.3, 1.4, .3], [0, 0, 0], .03);
  return b; }
function pyramid(R, s) { const b = new GB(R); b.add(new THREE.ConeGeometry(s, s * .72, 4, 1).rotateY(Math.PI / 4).translate(0, s * .36, 0), '#e2cc94', [0, 0, 0], [1, 1, 1], [0, 0, 0], .05); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; }
function altarMesh(R, n = 6) { const b = [], rows = [[-.34, 0, 0], [0, 0, 0], [.34, 0, 0], [-.17, .17, 0], [.17, .17, 0], [0, .34, 0]];
  return rows.slice(0, n).map(([x, y, z], k) => { const g = new GB(R); g.box(pk(R, ['#a8a39a', '#938e84', '#b4aea2']), [x, y + .09, z], [.34 - y * .15, .17, .3], [0, (R() - .5) * .3, 0], .06); const m = new THREE.Mesh(g.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; }); }
const mkFam = () => { const R = rng(1111); return {
  abram: person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48),
  sarai: person(R, { pants: '#d9ccb0', top: '#5e7fa6', skin: '#c98d62', hair: '#2a1a10', long: true, cloth: '#efe4cc', seed: 53 }, .45),
  lot: person(R, { pants: '#6a5a3a', top: '#8a9a6a', skin: '#b57a50', hair: '#3a2616', seed: 54 }, .44) }; };

// ====================================================================== the world
export function makeCall() {
  const R = rng(1212), g = new THREE.Group(), smoke = makeSmoke(14);
  // ---- the lands
  const ha = new THREE.Group(); ha.position.set(...HP); g.add(ha); ha.add(mkIslet(rng(8001), RIH, hH, gcH, 30, 80), underRock(rng(8002), RIH - .1));
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(8101), RIC, hC, gcC, 34, 88), underRock(rng(8102), RIC - .1));
  const dry = mkIslet(rng(8101), RIC, hC, gcCD, 34, 88); { const dm = lam.clone(); dm.transparent = true; dm.opacity = 0; dm.depthWrite = false; dry.material = dm; dry.castShadow = false; dry.position.y = .004; dry.renderOrder = 2; dry.visible = false; ca.add(dry); }
  const eg = new THREE.Group(); eg.position.set(...EP); eg.visible = false; g.add(eg); eg.add(mkIslet(rng(8201), RIE, hE, gcE, 32, 84), underRock(rng(8202), RIE - .1));
  const tree = (grp, hf, ox, oz, x, z, s, kind) => { const geo = kind === 'palm' ? palmGeo(s, R) : kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, ['#7a9a4a', '#6a8a40', '#88a655', '#5f8a3a']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hf(x + ox, z + oz) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; grp.add(m); return m; };
  // Haran: the city behind, the camp at the east edge
  { const hf = (x, z) => hH(x, z); ha.add(meshOf(houseBlock(R, -6.4, -3.6, 4, 3, 1.05, hf, 0)), meshOf(wallRing(R, -6.4, -3.6, 4.2, 3.4, hf, 0, true)));
    smoke.add(HP[0] - 5, HP[1] + 1.4, HP[2] - 4, t => 1 - smooth(1, 6, t) * .4, .45, 2.8);
    for (let i = 0; i < 12; i++) { const a = R() * TAU, r = 4 + R() * 9.5, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x + 6.4, z + 3.6) < 5.4 || Math.hypot(x - 8.4, z - 5.8) < 4.2 || Math.hypot(x - 14.5, z - 2.6) < 2.4) continue; tree(ha, hf, 0, 0, x, z, 1.0 + R() * .35, i % 3 ? 'olive' : 'round'); }
    for (const [x, z, s, c, ry] of [[7.1, 3.0, .5, '#cdb48c', .5], [11.6, 3.4, .44, '#c2a67a', -.4]]) { const m = tentMesh(R, c, s); m.position.set(x, hf(x, z), z); m.rotation.y = ry; ha.add(m); }
    const lg = new GB(R); lg.box('#4a3020', [0, .04, 0], [.5, .07, .1], [0, .5, 0], .03); lg.box('#4a3020', [0, .04, 0], [.5, .07, .1], [0, -.5, 0], .03); const lm = new THREE.Mesh(lg.build(), lam); lm.position.set(9.6, hf(9.6, 6.9), 6.9); ha.add(lm); }
  const hFire = spriteGlow(HP[0] + 9.6, HP[1] + hH(9.6, 6.9) + .3, HP[2] + 6.9, .9, 0xffa040, 0), hFire2 = spriteGlow(HP[0] + 9.6, HP[1] + hH(9.6, 6.9) + .26, HP[2] + 6.9, .4, 0xffe0a0, 0); g.add(hFire, hFire2);
  // Canaan: trees, rocks, the great oak at Shechem, the hills of Bethel
  const trees = []; { const hf = hC;
    for (let i = 0; i < 22; i++) { const a = R() * TAU, r = 5 + R() * 17, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - SH[0], z - SH[1]) < 4.6 || Math.hypot(x - BT[0], z - BT[1]) < 4.6 || hf(x, z) < .15 || Math.hypot(x + 19.8, z + .5) < 2) continue; trees.push(tree(ca, hf, 0, 0, x, z, .9 + R() * .5, hf(x, z) > .9 ? 'pine' : i % 2 ? 'olive' : 'round')); }
    const oak = new THREE.Mesh(roundTreeGeo(2.3, R, ['#5f8a3a', '#6a8a40', '#557f36', '#7a9a4a']), lam); oak.position.set(-20.2, hf(-20.2, -.6) - .02, -.6); oak.castShadow = true; ca.add(oak);
    const b = new GB(R); for (let k = 0; k < 22; k++) { const a = R() * TAU, r = 6 + R() * 15, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hf(x, z) < .15 || Math.hypot(x - SH[0], z - SH[1]) < 3.4) continue; b.add(G.ico0, pk(R, ['#8f8b82', '#a39f95', '#77746c']), [x, hf(x, z), z], [.2 + R() * .3, .14 + R() * .16, .2 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const bt = tentMesh(R, '#cdb48c', .56); bt.position.set(BT[0] + .8, hC(BT[0] + .8, BT[1] + 1.2), BT[1] + 1.2); bt.rotation.y = -.5; bt.scale.setScalar(.001); ca.add(bt);   // the tent near Bethel
  const altS = altarMesh(R, 6), altB = altarMesh(R, 6); altS.forEach(m => { m.position.set(SH[0] + 2.4, hC(SH[0] + 2.4, SH[1] + 2.0), SH[1] + 2.0); m.scale.setScalar(.001); ca.add(m); }); altB.forEach(m => { m.position.set(BT[0] - 1.6, hC(BT[0] - 1.6, BT[1] - 1.2), BT[1] - 1.2); m.scale.setScalar(.001); ca.add(m); });
  const bGlow = spriteGlow(BT[0] - 1.6, hC(BT[0] - 1.6, BT[1] - 1.2) + .55, BT[1] - 1.2, 1.1, 0xffd890, 0), bGlow2 = spriteGlow(BT[0] - 1.6, hC(BT[0] - 1.6, BT[1] - 1.2) + .5, BT[1] - 1.2, .5, 0xfff0c0, 0); ca.add(bGlow, bGlow2);
  // Egypt: the Nile with boats, palms, the city beyond, the palace with its courtyard, the far pyramids
  const hEw = (x, z) => hE(x, z), boats = [], palms = [];
  { const gb = new GB(R), A = [], B = []; for (let z = -20; z <= 20; z += .6) { const x = NX(z), w = 1.4 + .2 * Math.sin(z * .6); A.push([x - w, -.04, z]); B.push([x + w, -.04, z]); }
    for (let i = 0; i + 1 < A.length; i++) { const c = (i & 1) ? '#5a88aa' : '#4f7fa4'; tri(gb, A[i], B[i], B[i + 1], c, .06); tri(gb, A[i], B[i + 1], A[i + 1], c, .06); } const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; eg.add(m); }
  for (let i = 0; i < 4; i++) { const b = makeBoat(rng(300 + i), '#8a5a38', '#efe4cc'); b.scale.setScalar(.55); b.rotation.y = -Math.PI / 2; eg.add(b); boats.push({ b, z0: -14 + i * 9, off: (i % 2 ? .5 : -.4), sp: i % 2 ? -.7 : .9 }); }
  for (let i = 0; i < 22; i++) { const z = -17 + i * 1.7, side = i % 2 ? 1 : -1, x = NX(z) + side * (2.4 + R() * .8); if (Math.hypot(x, z) > 20.4 || Math.hypot(x + 11.5, z + 3) < 7.2) continue; palms.push(tree(eg, hEw, 0, 0, x, z, .95 + R() * .4, 'palm')); }
  for (let i = 0; i < 8; i++) { const a = R() * TAU, r = 7 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x + 11.5, z + 3) < 8 || Math.abs(x - NX(z)) < 4.2 || Math.hypot(x, z) > 20) continue; tree(eg, hEw, 0, 0, x, z, 1.0, 'palm'); }
  eg.add(meshOf(houseBlock(R, 11, -1, 3, 4, 1.05, hEw, 0)), meshOf(houseBlock(R, 9, -12, 3, 2, 1.0, hEw, 0)));
  { const m = meshOf(courtWall(R, -11.5, -4.4, 5.4, 3.4, hEw)); eg.add(m); const p = meshOf(palaceMesh(R, -11.5, -6.2, hEw)); eg.add(p); }
  { const p1 = pyramid(R, 7.5), p2 = pyramid(R, 5.2); p1.position.set(4.5, hEw(4.5, -17) - .05, -17); p2.position.set(11, hEw(11, -14) - .05, -14); p1.rotation.y = .2; eg.add(p1, p2); }
  const eglow = [-1.4, 1.4].map(s => { const sp = spriteGlow(-11.5 + s * 1.0, hEw(-11.5, -5) + 1.2, -5.0, .8, 0xffd890, 0); eg.add(sp); return sp; });
  // the plague cloud over the palace: dark cloud only
  const pc = (() => { const n = 26, mat = new THREE.MeshLambertMaterial({ color: 0x4a3c58, emissive: 0x241a30, flatShading: true }), m = new THREE.InstancedMesh(G.ico1, mat, n), items = [], ob = new THREE.Object3D(); m.frustumCulled = false;
    for (let i = 0; i < n; i++) items.push({ a: i / n * TAU + R() * .3, r0: 1.5 + R() * 6, y: 4.2 + R() * 3.2, s: 1.6 + R() * 1.6, ph: R() * 6, d: i / n });
    function update(t, on) { items.forEach((c, i) => { const k = smooth(EV.plague[0] + c.d * 1.2, EV.plague[0] + c.d * 1.2 + 1.5, t) * on, a = c.a + t * .16, r = c.r0 * (1 - .15 * Math.sin(t * .4 + c.ph)), sc = c.s * k;
      ob.position.set(EP[0] - 11.5 + Math.cos(a) * r, EP[1] + c.y + Math.sin(t * .6 + c.ph) * .25, EP[2] - 6.2 + Math.sin(a) * r * .8); ob.scale.set(sc, sc * .5, sc * .85); ob.rotation.set(0, c.ph + t * .1, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); }); m.instanceMatrix.needsUpdate = true; }
    return { mesh: m, update, mat }; })(); g.add(pc.mesh);
  const pglow = [0, 1, 2].map(i => { const sp = spriteGlow(EP[0] - 11.5 + (i - 1) * 2.0, EP[1] + 1.2, EP[2] - 5.6, 2.2, 0xd04a30, 0); g.add(sp); return sp; });
  // ---- the six lands of the families (shown while the word "all the families of the earth" is spoken) and the threads to them
  const fars = FAR.map(F => { const gr = new THREE.Group(); gr.position.set(F.x, F.y, F.z); gr.visible = false; g.add(gr); const ur = underRock(rng(7210 + F.g), 4.2); ur.scale.y = .38; gr.add(mkIslet(rng(7200 + F.g), 4.6, hF(4.6), gcF, 10, 30), ur);
    const tm = tentMesh(R, pk(R, ['#cdb48c', '#c2a67a', '#d4c29c']), .75); tm.position.set(.2, hF(4.6)(.2, .2), .2); tm.scale.setScalar(.001); gr.add(tm);
    const fire = spriteGlow(.9, .4, .9, .7, 0xffa040, 0); gr.add(fire); tree(gr, hF(4.6), 0, 0, -2.2, -1.0, .6, 'round'); tree(gr, hF(4.6), 0, 0, 1.9, -1.8, .5, 'olive'); const ppl = [0, 1].map(k => { const f = mkPerson(R, .4); f.group.visible = false; f.group.position.set(-.5 + k * 1.2, .3, 1.2); gr.add(f.group); return f; });
    const st = [Math.cos(F.a) * 21.5, 1.0, Math.sin(F.a) * 21.5], th = makeThread(st, [F.x, F.y + 1.6, F.z], 5, .12); th.group.traverse(o => { if (o.material && o.material.color) o.material.color.set(F.c); }); g.add(th.group); return { gr, tm, fire, ppl, th, F }; });
  // ---- the call: a thread from Abram to the land, a column of light, and the pool of light where he will stand
  const AB0 = [HP[0] + 8.0, HP[1] + hH(8.0, 6.0), HP[2] + 6.0];
  const TOPY = 60, BASE1 = AB0[1] + .66, LH = TOPY - BASE1 + .5, beam = shaft(LH, .5, .7, [1, .9, .64], .35, .8); beam.position.set(AB0[0], BASE1, AB0[2]); beam.visible = false; g.add(beam);
  const beamB = shaft(LH, .17, .25, [1, .96, .82], .4, .9); beamB.position.set(AB0[0], BASE1, AB0[2]); beamB.visible = false; g.add(beamB);
  const apool = pool(2.2, 0xffe6b0, 0); apool.position.set(AB0[0], AB0[1] + .06, AB0[2]); g.add(apool);
  const thread = makeThread([AB0[0], AB0[1] + 1.6, AB0[2]], [SH[0], hC(...SH) + 1.8, SH[1]], 7, .09); g.add(thread.group);
  const dest = pool(5.5, 0xffe6b0, 0); dest.position.set(SH[0], hC(...SH) + .07, SH[1]); g.add(dest);
  // ---- the Lord appears at Shechem (light only) and gives the land: rings spread over it
  const SHtop = hC(...SH), LH2 = TOPY - SHtop, lb = shaft(LH2, .55, .75, [1, .9, .64], .35, .8), lb2 = shaft(LH2, .2, .28, [1, .96, .82], .4, .9); [lb, lb2].forEach(b => { b.position.set(SH[0] + 1.0, SHtop, SH[1] + .6); b.visible = false; g.add(b); });
  const lrings = [0, 1, 2].map(i => { const r = ringMesh(3, .24, 0xffe6b0, 0); r.position.set(SH[0] + 1.0, SHtop + .08, SH[1] + .6); g.add(r); return r; });
  // ---- the two paths of stones
  const stA = mkStrip(R, SA), stB = mkStrip(R, SB); g.add(stA.grp, stB.grp);
  // ---- the travellers: set 1 (Haran to Shechem) and set 2 (Bethel, Egypt and back)
  const mkSet = (kind) => { const F = mkFam(); const S = { abram: F.abram, sarai: F.sarai, lot: kind === 1 ? F.lot : null, camels: [], donkeys: [], oxen: [], sheep: [], servants: [] };
    const nc = kind === 1 ? 2 : 3, nd = kind === 1 ? 1 : 2, ns = kind === 1 ? 3 : 6, no = kind === 1 ? 0 : 2, nv = kind === 1 ? 0 : 3;
    for (let i = 0; i < nc; i++) { const c = makeCamel(rng(120 + i)); c.group.scale.setScalar(.5); S.camels.push(c); } for (let i = 0; i < nd; i++) { const d = makeDonkey(rng(130 + i)); d.group.scale.setScalar(.5); S.donkeys.push(d); }
    for (let i = 0; i < ns; i++) { const s = makeSheep(rng(140 + i)); s.group.scale.setScalar(.55); S.sheep.push(s); } for (let i = 0; i < no; i++) { const o = makeOx(rng(150 + i)); o.group.scale.setScalar(.5); S.oxen.push(o); }
    for (let i = 0; i < nv; i++) S.servants.push(mkPerson(rng(160 + i), .42));
    [S.abram, S.sarai, S.lot, ...S.camels, ...S.donkeys, ...S.sheep, ...S.oxen, ...S.servants].forEach(o => o && g.add(o.group)); return S; };
  const S1 = mkSet(1), S2 = mkSet(2);
  const pharaoh = person(R, { pants: '#efe4cc', top: '#2a4a8a', skin: '#b57a50', hair: '#1a1008', cloth: '#d8b84a', mantle: '#c8a040', sash: '#d8b84a', seed: 61 }, .5), atts = [0, 1].map(i => person(R, { pants: '#efe4cc', top: i ? '#d8c8a0' : '#e8dcc0', skin: ['#a87a56', '#b98a62'][i], hair: '#1a1008', cloth: i ? null : '#efe4cc', seed: 70 + i }, .46)); g.add(pharaoh.group, ...atts.map(a => a.group));
  // ---- sky
  const stars = (() => { const n = 260, pos = new Float32Array(n * 3), rn = rng(99); for (let i = 0; i < n; i++) { const a = rn() * TAU, e = (.12 + .75 * rn()) * Math.PI / 2, d = 150; pos.set([Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const mat = new THREE.PointsMaterial({ color: 0xfff2d8, size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }); const p = new THREE.Points(geo, mat); p.frustumCulled = false; return p; })(); g.add(stars);
  const far = farMountains10(rng(63)); g.add(far);
  const motes = makeMotes({ n: 80, area: [18, 6, 14], size: .05, v: .15, seed: 72, color: 0xffdd90 }); g.add(motes.mesh);
  const keep = [[HP[0], HP[2], 20], [0, 0, 27], [EP[0], EP[2], 26], [-30, 5, 9], [27, 0, 7], ...FAR.map(F => [F.x, F.z, 7])];
  const sea = cloudSea(rng(64), 150, keep); g.add(sea.mesh);
  smoke.add(0, 0, 0, () => 0, .1, 1); g.add(smoke.mesh);
  const CLOUD = [[0, '#c8c4d8'], [6, '#e8d4c8'], [14, '#f4f0ea'], [30, '#f0e8dc'], [38, '#f0d8b0'], [44, '#f4e4c4'], [50, '#7a6a88'], [55, '#8a7a90'], [60, '#f0b890'], [90, '#4c5478']];
  const CEM = [[0, '#4a4668'], [14, '#5a5670'], [38, '#5a5670'], [50, '#201a30'], [56, '#3c3450'], [60, '#5a5670'], [90, '#222640']];
  const SMK = [[0, '#c8c0c8'], [10, '#e0d6c8'], [38, '#d8c6b0'], [90, '#707490']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the walks (world x z)

  function fig(f, x, z, ry, mv, t, ph, extra = {}) { const w = walkAnim(t, ph, 9.5); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  function ani(an, x, z, ry, mv, t, i) { an.group.position.set(x, gAt(x, z) - .02, z); an.group.rotation.y = ry; if (mv) walkLegs(an.legs, t + i, 4.4, .32); }
  function update(t, cam) {
    const cp = cam && cam.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cp, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)), M = far.userData.mat, f = smooth(0, 5, t) * .66; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
    stars.material.opacity = .9 * (1 - smooth(1, 6, t));
    // Haran: fire, smoke, the word from above
    { const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), on = smooth(0, 1, t) * (1 - smooth(17.5, 19.5, t) * .8); hFire.material.opacity = .62 * on * fl; hFire2.material.opacity = .5 * on; }
    { const k = ease.inOutSine(seg(t, EV.call[0], EV.call[1])), fade = 1 - smooth(8.4, 10.2, t); for (const [b, a] of [[beam, 1], [beamB, .8]]) { b.visible = k > .003 && fade > .01; b.scale.set(1, Math.max(.001, k), 1); b.position.y = (BASE1 + LH) - LH * k; b.material.opacity = (.42 + .05 * Math.sin(t * 2)) * fade * a; }
      const pa = ease.inOutSine(seg(t, EV.call[1] - 1.0, EV.call[1] + .8)) * (1 - smooth(8.2, 10.2, t)); apool.material.opacity = .3 * pa; apool.visible = pa > .01; }
    thread.set(ease.inOutSine(seg(t, EV.thread[0], EV.thread[1])), 1 - smooth(17.2, 18.6, t)); thread.group.visible = t > EV.thread[0] - .1 && t < 19;
    { const d = ease.inOutSine(seg(t, EV.thread[1] - 1.0, EV.thread[1] + 1.0)) * (1 - smooth(17.2, 19, t)); dest.material.opacity = .42 * d; dest.visible = d > .01; }
    // the families of the earth
    fars.forEach(({ gr, tm, fire, ppl, th, F }, k) => { const rise = ease.outBack(seg(t, EV.fam[0] + k * .15, EV.fam[0] + 1.2 + k * .15)) * (1 - smooth(EV.famOut[0] + k * .1, EV.famOut[1] + k * .1, t)); gr.visible = rise > .01; gr.scale.setScalar(Math.max(.001, rise)); gr.position.y = F.y - 2.5 * (1 - Math.min(1, rise));
      const u = ease.inOutSine(seg(t, EV.fam[0] + .5 + k * .15, EV.fam[0] + 2.1 + k * .15)); th.set(u, 1 - smooth(EV.famOut[0], EV.famOut[1], t)); const arr = seg(t, EV.fam[0] + 2.1 + k * .1, EV.fam[0] + 2.8 + k * .1), c = ease.outBack(arr);
      tm.scale.setScalar(Math.max(.001, c)); tm.visible = arr > .01; fire.material.opacity = .62 * smooth(0, 1, arr) * (.85 + .15 * Math.sin(t * 13 + k)); fire.visible = arr > .01; ppl.forEach((p, j) => { const q = ease.outCubic(seg(arr, .3 + j * .2, 1)); p.group.visible = q > .01; pose(p, -.5 + j * 1.2, .3, 1.2, .4 + j * 1.2, { s: q, sx: q, lx: .012 * Math.sin(t * 1.1 + j) }); }); });
    // the stones form ahead of the travellers
    const tA0 = EV.go + .4, tA1 = 23.6;
    stA.items.forEach(({ m, gl, u }, i) => { const tr = lerp(tA0, tA1, u) - .9, rise = ease.outBack(seg(t, tr, tr + .8)), pass = smooth(lerp(tA0, tA1, u) - .35, lerp(tA0, tA1, u) + .3, t); m.scale.setScalar(Math.max(.001, rise)); m.visible = rise > .01; gl.material.opacity = (.2 + .5 * pass * (1 - smooth(0, 1.6, t - lerp(tA0, tA1, u)) * .6)) * smooth(0, .6, rise); gl.visible = rise > .02; m.position.y = stA.items[i].y - .24 + .04 * Math.sin(t * .8 + i); });
    const tB0 = 40.0, tB1 = 43.0;
    stB.items.forEach(({ m, gl, u }, i) => { const tr = lerp(tB0, tB1, u) - 1.0, rise = ease.outBack(seg(t, tr, tr + .8)), pass = smooth(lerp(tB0, tB1, u) - .35, lerp(tB0, tB1, u) + .3, t); m.scale.setScalar(Math.max(.001, rise)); m.visible = rise > .01; gl.material.opacity = (.2 + .5 * pass * (1 - smooth(0, 1.6, t - lerp(tB0, tB1, u)) * .6)) * smooth(0, .6, rise); gl.visible = rise > .02; m.position.y = stB.items[i].y - .24 + .04 * Math.sin(t * .8 + i); });
    // the Lord appears at Shechem (light), the land is given (rings)
    { const k = ease.inOutSine(seg(t, EV.lord[0], EV.lord[0] + 1.6)), fade = 1 - smooth(EV.lord[1] - 1.2, EV.lord[1] + .6, t); for (const [b, a] of [[lb, 1], [lb2, .8]]) { b.visible = k > .003 && fade > .01; b.scale.set(1, Math.max(.001, k), 1); b.position.y = TOPY - LH2 * k; b.material.opacity = (.42 + .05 * Math.sin(t * 2)) * fade * a; }
      lrings.forEach((r, i) => { const u = (((t - EV.lord[0] - 1.4) * .26 + i / 3) % 1 + 1) % 1, on = smooth(EV.lord[0] + 1.4, EV.lord[0] + 2.4, t) * (1 - smooth(EV.lord[1] - 1, EV.lord[1] + 1, t)); r.visible = on > .01; r.scale.setScalar(.3 + u * 5.2); r.material.opacity = .5 * on * Math.sin(Math.PI * u); }); }
    // the altar at Shechem, the tent and altar at Bethel
    altS.forEach((m, i) => { const u = ease.outBack(seg(t, EV.altar[0] + i * .28, EV.altar[0] + i * .28 + .6)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    altB.forEach((m, i) => { const u = ease.outBack(seg(t, EV.bethel - .3 + i * .12, EV.bethel + .5 + i * .12)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    { const u = ease.outBack(seg(t, EV.bethel + .2, EV.bethel + 1.4)); bt.scale.setScalar(Math.max(.001, u)); bt.visible = u > .01; const gg = smooth(EV.bethel + 1.6, EV.bethel + 3.4, t) * (1 - smooth(40.5, 42.5, t)), fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3); bGlow.material.opacity = .7 * gg * fl; bGlow2.material.opacity = .6 * gg; bGlow.visible = bGlow2.visible = gg > .01; }
    // famine: the land dries and the trees thin
    { const f = smooth(EV.famine[0], EV.famine[1], t); dry.visible = f > .003; dry.material.opacity = .96 * f; trees.forEach((m, i) => { m.scale.set(1, 1 - .42 * f, 1); }); }
    // Egypt rises while the caravan crosses; the plague cloud
    { const k = ease.outBack(seg(t, EV.eg[0], EV.eg[1])); eg.visible = k > .01; eg.scale.setScalar(Math.max(.001, k)); eg.position.y = EP[1] - 2.0 * (1 - Math.min(1, k)); }
    boats.forEach(({ b, z0, off, sp }, i) => { const z = ((z0 + 20 + t * sp) % 40 + 40) % 40 - 20; b.position.set(NX(z) + off, -.02, z); b.rotation.y = sp > 0 ? 0 : Math.PI; b.rotation.y += -Math.PI / 2 * 0; b.rotation.y = sp > 0 ? Math.PI / 2 : -Math.PI / 2; });
    { const on = smooth(EV.plague[0], EV.plague[0] + 1.2, t) * (1 - smooth(EV.plague[1] - .4, EV.plague[1] + 1.6, t)); pc.update(t, on); pc.mesh.visible = on > .005;
      pglow.forEach((sp, i) => { sp.material.opacity = .5 * on * (.7 + .3 * Math.sin(t * 5 + i * 2)); sp.visible = on > .01; }); eglow.forEach((sp, i) => { sp.material.opacity = .65 * smooth(43, 45, t) * (1 - .6 * on + .2 * on * Math.sin(t * 17 + i * 3)); }); }
    // ----- set 1: Abram, Sarai and Lot leave Haran, cross the stones, arrive at Shechem, stand and build the altar
    { const tp = (d) => ease.inOutSine(seg(t, EV.go + d * .3, 24.7 + d * .15)); const S = S1; const st = [['abram', 0, 0], ['sarai', .8, 1], ['lot', 1.4, 2]];
      st.forEach(([k, d, j]) => { const f = S[k], s = tp(d), p = pathAt(P1, s), mv = s > .002 && s < .998, a0 = HP[0] + [8.0, 10.0, 6.2][j], b0 = HP[2] + [6.0, 5.4, 7.4][j];
        let x = lerp(a0, p.x, s > 0 ? 1 : 0), z = lerp(b0, p.z, s > 0 ? 1 : 0); if (s <= 0) { x = a0; z = b0; } const sx = [SH[0] - .2, SH[0] - 1.0, SH[0] - 2.4][j] + 0, sz = [SH[1] + 1.0, SH[1] + 2.2, SH[1] + 2.6][j];
        const fin = smooth(.96, 1, s); x = lerp(x, sx, fin); z = lerp(z, sz, fin);
        let ry = mv ? headZ(p.vx, p.vz) : (s >= .998 ? (k === 'abram' ? -.3 : .5) : (k === 'abram' ? 2.1 : 1.9)); let ex = {};
        if (!mv && s < .01) { if (k === 'sarai') ex = { a0x: -.5, a1x: -.5 }; if (k === 'abram') ex = { a0x: -.15 * Math.sin(t * .8), a1x: -.1 }; ry += .05 * Math.sin(t * .5 + j); }
        if (s >= .998) { const lk = smooth(EV.lord[0], EV.lord[0] + 1.4, t) * (1 - smooth(EV.lord[1] - 1, EV.lord[1], t)); if (k === 'abram') { ry = lerp(-.3, 0, lk); ex = { a0x: -.9 * lk, a1x: -.9 * lk, a0z: -.5 * lk, a1z: .5 * lk, lx: -.18 * lk }; } const bld = ease.inOutSine(seg(t, EV.altar[0] - .3, EV.altar[0] + .4)) * (1 - smooth(EV.altar[1], EV.altar[1] + .8, t)); if (k === 'abram' && bld > .01) { ry = lerp(ry, headZ(2.4, 2), bld); ex = { a0x: -.6 * bld * (.5 + .5 * Math.sin(t * 3)), a1x: -.6 * bld * (.5 + .5 * Math.sin(t * 3 + 1.5)), lx: .25 * bld }; } }
        fig(f, x, z, ry, mv, t, j * 1.7, ex); });
      const an = [[...S.camels, 1.0, 1.4], [0, 0, 0]]; const bk = [[S.camels[0], 1.0, 1.5], [S.camels[1], 1.7, -1.4], [S.donkeys[0], 1.25, 0], [S.sheep[0], 2.4, -.5], [S.sheep[1], 2.7, .6], [S.sheep[2], 3.0, 0]];
      bk.forEach(([a, d, lat], i) => { const s = ease.inOutSine(seg(t, EV.go + d * .3, 24.7 + d * .12)), p = pathAt(P1, s), mv = s > .002 && s < .998, a0 = [HP[0] + 11.6 + (i % 2) * .6, HP[2] + 7.4 + i * .5], fin = smooth(.95, 1, s), tx = SH[0] - 3.2 + lat * .5 + (i > 2 ? 1.2 : 0) + i * .3, tz = SH[1] + 2.8 + d * .4;
        let x = s <= 0 ? a0[0] : p.x, z = s <= 0 ? a0[1] : p.z; if (s > 0) { x += lat * .0; z += lat * .35; } x = lerp(x, tx, fin); z = lerp(z, tz, fin); const ry = mv ? headX(p.vx, p.vz) : (s >= .998 ? 1.0 : 0); ani(a, x, z, ry, mv, t, i); }); }
    // ----- set 2: at the tent near Bethel, to Egypt, in Egypt, and away
    let sarVis = true;
    { const S = S2, big = smooth(55.0, 55.1, t), tg = ease.inOutSine(seg(t, 39.6, 45.4)), tr = ease.inOutSine(seg(t, 57.2, 61.0)), wlk = t < 56 ? 0 : 1;
      let pa, mvA;
      if (t < 56) { pa = pathAt(P2, tg); mvA = tg > .002 && tg < .998; } else { pa = pathAt(P4, tr); mvA = tr > .002 && tr < .998; }
      const hv = (d, lat = 0) => { if (t < 56) { const s = ease.inOutSine(seg(t, 39.6 + d * .3, 45.4 + d * .25)), p = pathAt(P2, s); return { x: p.x - lat * (p.vz) * 0 + 0, z: p.z + lat * .35, vx: p.vx, vz: p.vz, mv: s > .002 && s < .998, s }; } const s = ease.inOutSine(seg(t, 57.2 + d * .3, 61.0 + d * .25)), p = pathAt(P4, s); return { x: p.x, z: p.z + lat * .35, vx: p.vx, vz: p.vz, mv: s > .002 && s < .998, s }; };
      // Abram
      { const h = hv(0); let x = h.x, z = h.z, ry = h.mv ? headZ(h.vx, h.vz) : 0, ex = {}; const atPlz = t >= 45.4 && t < 56.5;
        if (t < 39.6) { x = BT[0] + 1.4; z = BT[1] + .6; const pr = smooth(EV.bethel + 1.6, EV.bethel + 2.6, t) * (1 - smooth(38.4, 39.4, t)); ry = lerp(2.4, -2.2, 0) + 0; ry = headZ(-1.6, -1.2) * 1; ex = { a0x: -.95 * pr, a1x: -.95 * pr, a0z: -.4 * pr, a1z: .4 * pr, lx: -.12 * pr }; }
        else if (atPlz) { x = PLZ[0]; z = PLZ[1]; const talk = smooth(45.6, 46.2, t) * (1 - smooth(48.2, 48.8, t)), grief = smooth(48.6, 49.6, t) * (1 - smooth(54.0, 55.4, t)); ry = lerp(headZ(.3, -1), headZ(-.9, .2), talk); ry = lerp(ry, headZ(0, -1), grief); ex = { a0x: -.5 * talk * Math.max(0, Math.sin(t * 2.4)), a1x: -.3 * talk, lx: .05 * grief, a0z: -.2 * grief }; if (t > 55) ry = headZ(-.5, -1); }
        fig(S.abram, x, z, ry, h.mv, t, 0, ex); }
      // Sarai: with Abram, taken to the palace, back out
      { let x, z, ry = 0, mv = false, vis = 1, ex = {}; const h = hv(.8, 1);
        if (t < 46.6) { x = h.x; z = h.z; mv = h.mv; ry = mv ? headZ(h.vx, h.vz) : headZ(-.6, .4); if (t < 39.6) { x = BT[0] + 2.6; z = BT[1] + 2.0; ry = headZ(-1, -1); } else if (!mv && t >= 45.4) { x = PLZ[0] + 1.3; z = PLZ[1] + .1; ry = headZ(-1, -.1); } }
        else if (t < 51.0) { const s = ease.inOutSine(seg(t, 47.8, 51.0)), p = pathAt(P3, s); x = lerp(PLZ[0] + 1.3, p.x, smooth(0, .08, s)); z = lerp(PLZ[1] + .1, p.z, smooth(0, .08, s)); mv = s > .002 && s < .998; ry = mv ? headZ(p.vx, p.vz) : headZ(-1, -.1); if (t < 47.8) { x = PLZ[0] + 1.3; z = PLZ[1] + .1; mv = false; ry = headZ(-1, -.1); } vis = 1 - smooth(.94, 1, s); }
        else if (t < 55.4) { vis = 0; x = DOOR[0]; z = DOOR[1]; }
        else if (t < 57.4) { const s = ease.inOutSine(seg(t, 55.5, 57.4)), p = pathAt(P3b, s); x = p.x; z = p.z; mv = s > .002 && s < .998; ry = mv ? headZ(p.vx, p.vz) : headZ(-.7, -.2); vis = smooth(0, .08, s); if (s >= .998) { x = PLZ[0] + .8; z = PLZ[1] - 1.0; } }
        else { const hh = hv(.8, 1); x = hh.x; z = hh.z; mv = hh.mv; ry = mv ? headZ(hh.vx, hh.vz) : headZ(-.7, -.2); if (!mv && hh.s <= 0) { x = PLZ[0] + .8; z = PLZ[1] - 1.0; } }
        if (t >= 47.8 && t < 50.8) { mv = true; }
        fig(S.sarai, x, z, ry, mv, t, 1.7, { ...ex, s: Math.max(.001, vis), sx: Math.max(.001, vis) }); sarVis = vis > .01; S.sarai.group.visible = sarVis && t >= 33.7; }
      // the animals and servants of the first caravan (camels 0-1, donkey 0, sheep 0-2) go along; the gifts (rest) come out of the palace and join for the return
      const stay = (i) => [BT[0] + 3 + i * .5, BT[1] + 2.4 + (i % 3) * .5];
      const firstGroup = [[S.camels[0], 1.0, 1.4], [S.camels[1], 1.7, -1.5], [S.donkeys[0], 1.25, 0], [S.sheep[0], 2.4, -.5], [S.sheep[1], 2.7, .6], [S.sheep[2], 3.0, 0]];
      firstGroup.forEach(([a, d, lat], i) => { const h = hv(d, lat * 1.4); let x = h.x, z = h.z, ry = h.mv ? headX(h.vx, h.vz) : 0, mv = h.mv;
        if (t < 39.6) { const st = stay(i); x = st[0]; z = st[1]; ry = 2.2; mv = false; } else if (t >= 45.4 && t < 56.6) { x = PLZ[0] + 1.8 + (i % 3) * .9 + (i > 2 ? 1.2 : 0); z = PLZ[1] + 1.4 + (i % 2) * 1.1; ry = 3.0 + i * .2; mv = false; }
        else if (t >= 56.6 && t < 57.2) { x = PLZ[0] + 1.8 + (i % 3) * .9 + (i > 2 ? 1.2 : 0); z = PLZ[1] + 1.4 + (i % 2) * 1.1; ry = 3.0; mv = false; }
        ani(a, x, z, ry, mv, t, i); });
      // the gifts: oxen, more donkeys and camels, more sheep, three servants, come out of the courtyard from 55.4
      const gifts = [[S.camels[2], 0], [S.donkeys[1], 1], [S.oxen[0], 2], [S.oxen[1], 3], [S.sheep[3], 4], [S.sheep[4], 5], [S.sheep[5], 6]];
      gifts.forEach(([a, i]) => { a.group.visible = t > 55.0; let t0 = 55.4 + i * .22, GPTH = mkPath([[EP[0] - 15.0 + (i % 3), EP[2] - 6.6], [EP[0] - 14.4, EP[2] - 2.0], [GATE[0] + (i % 2 ? .4 : -.4), GATE[1] + .6], [PLZ[0] + 2.4 + (i % 4) * .8, PLZ[1] + 2.2 - (i % 3) * .7]]), s = ease.inOutSine(seg(t, t0, t0 + 2.6)), p = pathAt(GPTH, s), mv = s > .002 && s < .998;
        let x = p.x, z = p.z, ry = mv ? headX(p.vx, p.vz) : 3.0; if (t >= 57.2) { const h = hv(2.0 + i * .2, (i % 3 - 1) * 1.5); x = h.x; z = h.z; mv = h.mv; ry = mv ? headX(h.vx, h.vz) : ry; } ani(a, x, z, ry, mv, t, i + 2); });
      S.servants.forEach((f, i) => { f.group.visible = t > 55.0; let t0 = 55.6 + i * .3, SPTH = mkPath([[EP[0] - 15.4 + i, EP[2] - 6.6], [EP[0] - 14.6, EP[2] - 2.2], [GATE[0] + (i - 1) * .5, GATE[1] + .6], [PLZ[0] - 1.0 + i * .9, PLZ[1] + 1.2]]), s = ease.inOutSine(seg(t, t0, t0 + 2.4)), p = pathAt(SPTH, s), mv = s > .002 && s < .998;
        let x = p.x, z = p.z, ry = mv ? headZ(p.vx, p.vz) : headZ(0, 1) + .4 * (i - 1); if (t >= 57.2) { const h = hv(1.6 + i * .3, (i - 1) * 1.2); x = h.x - 1.2; z = h.z; mv = h.mv; ry = mv ? headZ(h.vx, h.vz) : ry; } fig(f, x, z, ry, mv, t, i * 1.3); });
      // Pharaoh and two attendants
      { const pv = smooth(55.0, 55.1, t) * (1 - smooth(60.0, 60.4, t)); pharaoh.group.visible = pv > .01; const px = GATE[0] + .2, pz = GATE[1] + 1.4, sw = ease.inOutSine(seg(t, 55.6, 56.6)) * (1 - ease.inOutSine(seg(t, 58.2, 59.2)));
        pose(pharaoh, px, gAt(px, pz) - .02, pz, headZ(-.8, 1) + .2 * (1 - sw), { a0x: -1.5 * sw, a0z: -.5 * sw, a1x: -.1, s: Math.max(.001, pv), sx: Math.max(.001, pv) });
        atts.forEach((f, i) => { const a = i === 0 ? smooth(46.8, 47.4, t) * (1 - smooth(50.9, 51.4, t)) : smooth(46.8, 47.4, t) * (1 - smooth(54.6, 55.2, t)) * (1 - smooth(50.9, 51.4, t) * 0), vis = Math.max(a, 0);
          let x, z, ry; const hold = f => 0; if (t < 51) { const s = ease.inOutSine(seg(t, 47.8, 51.0)), p = pathAt(P3, s); x = lerp(GATE[0] + (i ? 1.0 : -1.0), p.x + (i ? .55 : -.55), smooth(0, .3, s)) ; z = lerp(GATE[1] + .8, p.z + .1, smooth(0, .3, s)); ry = headZ(p.vx, p.vz); if (t < 47.8) { x = GATE[0] + (i ? 1.0 : -1.0); z = GATE[1] + .8; ry = headZ(0, 1); } }
          else { x = GATE[0] + (i ? 1.4 : -1.4); z = GATE[1] + 1.0; ry = headZ(0, 1); }
          const dis = smooth(EV.plague[0] + .4, EV.plague[0] + 1.2, t) * (1 - smooth(EV.plague[1] - .6, EV.plague[1] + .6, t)); const sway = Math.sin(t * 3.6 + i * 2);
          const vv = t < 51 ? vis : smooth(50.4, 50.9, t) * (1 - smooth(54.4, 55.0, t));
          pose(f, x, gAt(x, z) - .02, z, ry + .3 * dis * sway, { a0x: -1.2 * dis, a1x: -.9 * dis * (.6 + .4 * Math.sin(t * 4 + i)), a0z: -.3 * dis, lx: .12 * dis * Math.sin(t * 2.6 + i), s: Math.max(.001, vv), sx: Math.max(.001, vv) }); f.group.visible = vv > .01; }); }
    }
    { const v1 = t < 33.9, v2 = t >= 33.7; [S1.abram, S1.sarai, S1.lot, ...S1.camels, ...S1.donkeys, ...S1.sheep].forEach(o => o && (o.group.visible = v1)); [S2.abram, ...S2.camels.slice(0, 2), S2.donkeys[0], ...S2.sheep.slice(0, 3)].forEach(o => o && (o.group.visible = v2)); }
    motes.update(t, .5 * smooth(1, 6, t) * (1 - smooth(48, 51, t)), [HP[0] + 5, HP[1] + 3, HP[2] + 3]);
    smoke.update(t, colAt(SMK, t));
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#4a5a90', '#3a3040', .95, '#ffb878', 1.7, [12, 4.5, 6], .5, '#6a7cff', [-10, 6, -8], 16),
    Dk(5, '#7c8cb8', '#403f3c', 1.05, '#ffd8a4', 2.1, [12, 6, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(13, '#8a9cc8', '#454448', 1.05, '#ffe6bc', 2.3, [10, 9, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(18, '#8a98c0', '#45403c', 1.05, '#ffeac4', 2.3, [8, 10, 6], .4, '#8a9cff', [-10, 6, -8], 16),
    Dk(25, '#7480ae', '#40383c', .98, '#fff0d4', 1.6, [8, 10, 6], .5, '#a8b4ff', [-10, 6, -8], 16),
    Dk(31, '#8a90b8', '#44403c', 1.02, '#ffdcae', 2.1, [-9, 7, 6], .45, '#8a9cff', [10, 6, -8], 16),
    Dk(36, '#8a7aa0', '#4a3a4a', 1.05, '#ffb878', 2.1, [-12, 5.5, 5], .45, '#7a8cff', [10, 6, -8], 16),
    Dk(39.5, '#a09a98', '#4a443c', 1.15, '#fff2cc', 2.7, [4, 12, 5], .35, '#c8c0a8', [-8, 6, -6], 16),
    Dk(44, '#8c88a0', '#463e3a', 1.05, '#ffe2ae', 2.4, [-8, 9, 6], .4, '#8a9cff', [10, 6, -8], 16),
    Dk(49.5, '#7a7898', '#403a3c', .98, '#ffe0b0', 2.0, [-8, 8, 6], .45, '#8a9cff', [10, 6, -8], 16),
    Dk(52.0, '#3e3a58', '#241e34', .8, '#9a90c0', .9, [-6, 10, 4], .8, '#c0583a', [4, 3, 8], 14),
    Dk(54.5, '#4e486a', '#2c2438', .9, '#c8a8b0', 1.2, [-6, 9, 5], .7, '#c0583a', [4, 3, 8], 14),
    Dk(57, '#8a82a2', '#46403e', 1.05, '#ffd0a0', 2.1, [-9, 6, 6], .5, '#ffcf9a', [7, 4.5, 10], 14),
    Dk(60, '#8a82a2', '#46403e', 1.05, '#ffc890', 2.0, [-9, 5, 6], .5, '#ffcf9a', [7, 4.5, 10], 14)];
  const bg = [[0, ['#1c2a60', '#e0a070']], [5, ['#2a4a90', '#f0c890']], [13, ['#3a6ab0', '#f0dcb0']], [24, ['#3a6ab0', '#dcd4b0']], [31, ['#3a5a9a', '#e8c890']], [36, ['#2a3470', '#e89a60']], [39.5, ['#5a82b8', '#f4e4c0']], [44, ['#3a6ab0', '#f0dcb0']],
    [50, ['#2a3468', '#c8a888']], [52, ['#1c1830', '#5a3040']], [55, ['#2a2848', '#8a5a58']], [58, ['#2a3a78', '#f0b078']], [60, ['#1c2a60', '#c88a88']]];
  return { group: g, update, light, bg, far, FAM: S1, AB0, SH, BT, SA, SB, stripAt };
}
