// Episode 19: Genesis 19. Two angels reach Sodom at evening and Lot, sitting in the gateway, welcomes them to his house (19:1-3); the men of the city surround the house and demand his guests (19:4-5, 9);
// the angels pull Lot inside, shut the door and strike the men outside with blindness (19:10-11); "the Lord has sent us to destroy this city; take your family and go" (19:12-13); his sons-in-law think he is joking (19:14);
// at dawn Lot still hesitates, the angels take his hand, his wife's and his two daughters', "the Lord being merciful to him", and lead them out of the city (19:15-16); "flee for your life; do not look back" (19:17);
// Lot reaches Zoar as the sun rises (19:23); the Lord rains sulfur and fire on Sodom and Gomorrah (19:24-25); Lot's wife looks back and becomes a pillar of salt (19:26);
// next morning Abraham looks toward Sodom and sees smoke rising like the smoke of a furnace; God remembered Abraham and sent Lot out (19:27-29).
// Cinematic interpretation: the floating plain, the crowd of silhouettes with torches, the small figures and the small white column are not in the text. The film shows nothing of what happens to people: fire and smoke are seen far away;
// the crowd only stumbles; the pillar is a small white column at the roadside. Genesis 19:6-9 and 19:30-38 are not shown (this episode follows 19:1-5, 10-17, 23-29).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, pool, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, crowdPalette, addMat } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, houseBlock, wallRing, meshOf } from './world10.js';
import { makeBird } from './fauna6.js';
import { makeStars } from './stars15.js';

export const RIC = 19;
export const SC = [8, -1.2], GATE = [8, 1.8], DOOR = [6.66, -.25], PLZ = [7.9, -.2], LH = [6.0, -.25];
export const PATH = [[8, 2.0], [7.4, 3.3], [4.8, 4.0], [2.0, 3.4], [-.8, 2.3], [-3.6, 1.1], [-6.4, .2], [-8.7, -.3], [-9.5, -1.0]];
export const ZC = [-9.6, -2.5], ZG = [-9.6, -1.0];
export const WP = [-.6, 2.85];                                  // where Lot's wife stands, and where the pillar is
export const ABH = [-30, -1.4, 5.0];                            // Abraham's little island (the camp of Mamre, west of the plain)
export const ABP = [ABH[0] + 2.6, ABH[2] - .4];                 // where Abraham stands (x, z)
export const SODOM = [SC[0], SC[1]];

// ---------------- terrain: green plain in the west, dry sandy ground toward Sodom in the east, a low ridge, the plateau of Zoar
const HILLS = [[-4.8, -1.8, 1.0, 4.2], [2.5, -9.5, 1.1, 5], [-2, 9.5, .7, 4], [14.5, -9.5, 1.0, 4.4], [-15.5, 6, .9, 3.8], [-14, -8.5, 1.0, 4]];
const FLATS = [[SC[0], SC[1] + .2, .34, 6.8], [ZC[0], ZC[1], .8, 2.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1) + smooth(-6, 4, x) * (.1 * Math.sin(x * .7 + z * .35) + .06 * Math.sin(x * 1.5 - z * .9));
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const dPath = (x, z) => { let m = 1e9; for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], dx = bx - ax, dz = bz - az, u = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)); m = Math.min(m, Math.hypot(x - ax - u * dx, z - az - u * dz)); } return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-7, 7, x) * .85; let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6b678').lerp(C3('#c4a060'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry);
  if (y > .95) b.lerp(C3('#9a8a70'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#d2bc88'), .85 * smooth(.8, .35, dPath(x, z))); b.lerp(C3('#c8b078'), .7 * smooth(6.4, 4.4, Math.hypot(x - SC[0], z - SC[1]))); b.lerp(C3('#c8b078'), .6 * smooth(2.8, 1.6, Math.hypot(x - ZC[0], z - ZC[1])));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const HA = (x, z) => { const r = Math.hypot(x, z); return rimf(5.0, .3 + .05 * Math.sin(x * .8 + z * .6) + .5 * smooth(2.6, 0, Math.hypot(x + 1.8, z + .8)) * .5, r, -.02); };
const gcA = (x, y, z, s) => { const b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); if (y < .02) b.lerp(C3('#b0aa88'), .7); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2)); return b.getHex(); };
const gAt = hC, abY = (x, z) => ABH[1] + HA(x - ABH[0], z - ABH[2]);
export const stage = { gAt, abY, SC, GATE, DOOR, PLZ, LH, PATH, ZC, ZG, WP, ABH, ABP };

// ---------------- walkers: keys [[t, x, z], ...], linear between keys, still between two equal keys
function kpl(t, K) { const n = K.length; if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], mv: false, vx: K[1][1] - K[0][1], vz: K[1][2] - K[0][2] };
  if (t >= K[n - 1][0]) { const p = K[n - 2], q = K[n - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  let i = 1; while (i < n - 1 && t > K[i][0]) i++; const a = K[i - 1], b = K[i], u = (t - a[0]) / (b[0] - a[0]), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01, vx: b[1] - a[1], vz: b[2] - a[2] }; }
// Lot's route out of the city (a1: he sits at the gate; 19:1-3 he rises and welcomes them; 19:10 he stands at his door; 19:15-16 he is led out)
const LOT_K = [[0, 8.95, 2.3], [2.5, 8.95, 2.3], [3.4, 8.2, 2.85], [4.1, 8.15, 2.6], [4.9, 8.0, 1.55], [5.6, 7.7, .4], [6.1, 7.05, -.25], [11.4, 7.05, -.25], [12.2, 6.8, -.25], [12.3, 6.8, -.25],
  [16.0, 7.35, -.25], [21.4, 7.35, -.25], [22.4, 8.5, .45], [24.6, 8.5, .45], [25.4, 7.8, .05], [27.2, 7.8, .05],
  [28.4, 8.0, .95], [29.4, 8.0, 1.85], [30.4, 7.6, 3.0], [31.6, 6.5, 3.8], [33.0, 5.1, 4.0], [34.3, 2.0, 3.4], [35.8, -.8, 2.3], [37.2, -3.6, 1.1], [38.6, -6.4, .2], [39.8, -8.7, -.3], [40.5, -9.5, -.5], [41.0, -9.6, -.45], [90, -9.6, -.45]];
const shiftK = (K, from, dt, dx, dz) => K.filter(k => k[0] >= from).map(k => [k[0] + dt, k[1] + dx, k[2] + dz]);
const pre = (stand, t0, K) => [[0, ...stand], [t0, ...stand], ...K];
const WALK = LOT_K.filter(k => k[0] >= 27.2 && k[0] <= 41.0);
// angels: arrive along the road (a1), go in with Lot, come out again (c1), lead the family out and stop by the road to point the way (d1)
const KANG = [pre([4.4, 3.8], 0, [[3.0, 7.2, 3.15], [4.2, 8.1, 2.4], [5.0, 8.0, 1.4], [5.7, 7.5, .2], [6.1, 6.9, -.5], [6.4, 6.9, -.5]]).concat([[11.3, 6.9, -.5], [11.6, 6.9, -.5], [12.5, 6.9, -.5], [16.0, 6.95, -.6], [27.2, 7.45, .4]]),
  pre([3.4, 3.7], 0, [[3.2, 7.0, 3.0], [4.4, 7.8, 2.4], [5.2, 7.8, 1.3], [5.9, 7.3, .1], [6.3, 6.9, .1]]).concat([[11.3, 6.9, .1], [11.6, 6.9, .1], [12.5, 6.9, .1], [16.0, 6.95, .15], [27.2, 7.45, -.45]])];
KANG[0] = KANG[0].concat(shiftK(WALK, 28.4, .1, -.22, .1).filter(k => k[0] < 33.4)).concat([[33.9, 4.7, 4.55], [90, 4.7, 4.55]]);
KANG[1] = KANG[1].concat(shiftK(WALK, 28.4, .6, .18, -.12).filter(k => k[0] < 33.6)).concat([[34.3, 3.6, 4.4], [90, 3.6, 4.4]]);
// wife and daughters: they come out of the house at c1, stand with Lot, are led out; the wife falls behind (19:17, 19:26)
const KWIFE = [[0, 7.9, .45], [27.2, 8.2, .4]].concat(shiftK(WALK, 28.4, .5, .2, 0).filter(k => k[0] < 36)).concat([[38.6, WP[0], WP[1]], [90, WP[0], WP[1]]]);
const KD = [[[0, 7.75, -.65], [27.2, 8.0, -.5]].concat(shiftK(WALK, 28.4, .9, -.2, .1)), [[0, 8.15, -.2], [27.2, 8.35, -.1]].concat(shiftK(WALK, 28.4, 1.3, .2, .12))];
const KS = [[[0, 9.3, .75], [90, 9.3, .75]], [[0, 9.3, .1], [90, 9.3, .1]]];                 // the sons-in-law
const CROWD = Array.from({ length: 14 }, (_, k) => { const th = (k / 13 - .5) * 2.3, r = 1.1 + .3 * ((k * 7) % 3); return { th, r, x: 7.05 + Math.cos(th) * r, z: -.25 + Math.sin(th) * r, torch: k % 2 === 0, ph: k * 1.7 }; });
export const lotPos = t => { const p = kpl(t, LOT_K); return [p.x, gAt(p.x, p.z), p.z]; };
export const wifePos = t => { const p = kpl(t, KWIFE); return [p.x, gAt(p.x, p.z), p.z]; };
export const angelPos = (i, t) => { const p = kpl(t, KANG[i]); return [p.x, gAt(p.x, p.z), p.z]; };
export const dauPos = (i, t) => { const p = kpl(t, KD[i]); return [p.x, gAt(p.x, p.z), p.z]; };
export const silPos = (i, t) => { const p = kpl(t, KS[i]); return [p.x, gAt(p.x, p.z), p.z]; };
export const crowdPos = (k, t) => { const c = CROWD[k], a = smooth(5.5, 8.6, t), far = 2.4 * (1 - a), dr = smooth(12.3, 16.2, t); return [c.x + Math.cos(c.th) * far + dr * (1.5 + .25 * Math.sin(k)), gAt(c.x, c.z), c.z + Math.sin(c.th) * far + dr * (Math.sin(k * 2.3) * .9)]; };
export const abrahamPos = () => [ABP[0], abY(ABP[0] - ABH[0], ABP[1] - ABH[2]) + .34, ABP[1]];

// ---------------- little models
const mkLot = R => person(R, { pants: '#7a5a3a', top: '#5e7fa6', skin: '#b57a50', hair: '#4a3a2a', beard: '#4a3a2a', sash: '#3a2a1a', seed: 71 }, .5);
const mkWife = R => person(R, { pants: '#d8c9a6', top: '#8a5a6a', skin: '#c08258', hair: '#2a1a10', cloth: '#e4d8c0', long: true, sash: '#8a6a46', seed: 73 }, .45);
const mkDau = (R, i) => person(R, i ? { pants: '#cdbf9c', top: '#a2564e', skin: '#cf9468', hair: '#2a1a10', cloth: '#efe4cc', long: true, seed: 77 } : { pants: '#d8c9a6', top: '#c9a15a', skin: '#c58c60', hair: '#3a2616', long: true, seed: 75 }, .42);
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const VIS = [{ pants: '#e2d8be', top: '#b9a888', skin: '#c9966a', hair: '#3a2a1a', beard: '#3a2a1a', cloth: '#e8dfca', sash: '#8a7a5a', seed: 181 }, { pants: '#d8d0bc', top: '#9aa0a8', skin: '#a8744a', hair: '#1f160d', beard: '#1f160d', cloth: '#dcd2bc', sash: '#7a6a50', seed: 185 }];
const mkAngel = i => person(rng(300 + i), VIS[i], .54);
const mkMan = (R, i, dark) => { const c = crowdPalette(R); return person(R, { pants: dark ? '#4a3a40' : c.robe, top: dark ? '#3a3040' : c.robe2, skin: c.skin, hair: c.hair, beard: R() < .6 ? c.hair : undefined, cloth: dark ? undefined : c.cloth, seed: 410 + i }, .43 + .02 * (i % 3)); };

// ====================================================================== the world
export function makeSodomPlain() {
  const R = rng(1919), g = new THREE.Group(), smoke = makeSmoke(5);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9901), RIC, hC, gcC, 30, 80), underRock(rng(9902), RIC - .1));
  const tree = (grp, hf, x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hf(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; grp.add(m); return m; };
  [[-14.5, 1.4, 1.8], [-13, 5.6, 1.6], [-8.4, 7.2, 1.7], [-3.2, 8.8, 1.5], [-6, -6.8, 1.6], [-1.6, -8, 1.5], [2.6, 7.6, 1.2]].forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'round'));
  [[-5.6, 5.2, 1.0], [-1.8, 5.8, .9], [0.6, -4.8, 1.0], [-11.5, 3.6, .9]].forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'olive'));
  [[13.2, 4.2, 1.3], [14.4, -4.4, 1.2]].forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'palm'));
  for (let i = 0; i < 12; i++) { const a = R() * TAU, r = 6 + R() * 10, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x < 3 || hC(x, z) < .15 || Math.hypot(x - SC[0], z - SC[1]) < 5.4 || dPath(x, z) < 1.2) continue; tree(ca, hC, x, z, .4 + R() * .35, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 26; k++) { const a = R() * TAU, r = 3 + R() * 13, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .9 || Math.hypot(x - SC[0], z - SC[1]) < 4.9) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.1 + R() * .22, .07 + R() * .12, .1 + R() * .2], [R() * 3, R() * 3, 0], .04); }
    ca.add(meshOf(b)); }
  // ---- Sodom: a walled city whose gate faces the road (south), the little square inside, and Lot's house with its lit door
  ca.add(meshOf(wallRing(R, SC[0], SC[1], 3.3, 3.0, hC, 0, true)));
  ca.add(meshOf(houseBlock(R, 8.1, -3.2, 7, 2, .6, hC, 0)), meshOf(houseBlock(R, 5.5, 1.0, 2, 2, .52, hC, 0)), meshOf(houseBlock(R, 5.4, -2.2, 2, 2, .6, hC, 0)));
  { const b = new GB(R), y = hC(LH[0], LH[1]); b.box('#d8be92', [LH[0], y + .42, LH[1]], [1.3, .84, 1.0], [0, 0, 0], .04); b.box('#b09c74', [LH[0], y + .88, LH[1]], [1.42, .1, 1.12], [0, 0, 0], .03); b.box('#8a6642', [LH[0], y + .97, LH[1]], [1.42, .08, 1.12], [0, 0, 0], .03);
    b.box('#2a1c10', [DOOR[0] + .01, y + .25, DOOR[1]], [.04, .5, .26], [0, 0, 0], .01); b.box('#7a5a3a', [DOOR[0] + .02, y + .53, DOOR[1]], [.06, .05, .34], [0, 0, 0], .01); b.box('#4a3624', [LH[0] + .3, y + 1.1, LH[1]], [.05, .3, .05], [0, 0, 0], .02);
    ca.add(meshOf(b)); }
  const doorM = new THREE.Mesh(new THREE.PlaneGeometry(.22, .46), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); doorM.position.set(DOOR[0] + .045, hC(DOOR[0], DOOR[1]) + .26, DOOR[1]); doorM.rotation.y = Math.PI / 2; ca.add(doorM);
  const doorG = spriteGlow(DOOR[0] + .15, hC(DOOR[0], DOOR[1]) + .3, DOOR[1], 1.2, 0xffc070, 0), doorG2 = spriteGlow(DOOR[0] + .1, hC(DOOR[0], DOOR[1]) + .26, DOOR[1], .5, 0xfff0c8, 0); g.add(doorG, doorG2);
  { const b = new GB(R); b.box('#a08a64', [PLZ[0] + .6, hC(PLZ[0], PLZ[1]) + .1, PLZ[1] + .5], [.34, .2, .34], [0, 0, 0], .03); b.box('#3a2a1c', [PLZ[0] + .6, hC(PLZ[0], PLZ[1]) + .21, PLZ[1] + .5], [.2, .02, .2], [0, 0, 0], .01); ca.add(meshOf(b)); }
  tree(ca, hC, 9.6, 1.2, .8, 'palm'); tree(ca, hC, 10.1, -2.6, .7, 'olive');
  // the gate lamps and the windows of the city
  const lamps = [[7.45, 1.7], [8.55, 1.7]].map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .45, z, .5, 0xffb860, 0); g.add(s); return s; });
  const WINS = []; { const Rr = rng(9915), pts = []; for (let i = 0; i < 160 && pts.length < 26; i++) { const x = SC[0] + (Rr() - .5) * 5.6, z = SC[1] + (Rr() - .5) * 5.0; if (Math.hypot(x - PLZ[0], z - PLZ[1]) < 1.9 || Math.hypot(x - SC[0], z - SC[1]) > 3.1) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .45)) continue; pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + .42 + ((i * 7) % 5) * .05, z, .34, 0xffc878, 0); g.add(s); WINS.push({ s, x, z, ph: i * 1.9, ord: Rr() }); }); }
  // ---- Zoar: a little walled town on a higher plateau, its gate facing the road
  ca.add(meshOf(wallRing(R, ZC[0], ZC[1], 1.5, 1.5, hC, 0, true)), meshOf(houseBlock(R, ZC[0], ZC[1] - .2, 3, 3, .5, hC, 0)));
  // ---- the pillar of salt: a small white column by the road, with the shape of a figure in it (19:26)
  const pillar = new THREE.Group(); { const b = new GB(R); b.add(G.cylT, '#dcd6cc', [0, 0, 0], [.13, .36, .13], [0, 0, 0], .07); b.add(G.ico0, '#ece8e0', [0, .22, 0], [.1, .16, .09], [0, .3, 0], .07); b.add(G.ico0, '#f2eee8', [.01, .38, 0], [.095, .075, .085], [0, 0, 0], .06); b.add(G.ico1, '#f4f0ea', [0, .47, 0], [.07, .08, .07], [0, 0, 0], .06);
    b.add(G.ico0, '#e4dfd4', [.075, .3, .02], [.035, .1, .04], [0, 0, .3], .05); b.add(G.ico0, '#f0ece4', [-.08, .15, .03], [.04, .05, .04], [.4, 0, 0], .05); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; pillar.add(m); }
  pillar.position.set(WP[0], hC(WP[0], WP[1]) - .02, WP[1]); pillar.scale.set(1, .001, 1); g.add(pillar);
  const salt = spriteGlow(WP[0], hC(WP[0], WP[1]) + .3, WP[1], .8, 0xf4f0e8, 0), flashG = spriteGlow(WP[0], hC(WP[0], WP[1]) + .3, WP[1], 2.6, 0xfff4e0, 0); g.add(salt, flashG);
  const dust = makeMotes({ n: 80, area: [18, 1.6, 9], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(dust.mesh);

  // ---- Abraham's island (the camp at Mamre, west of the plain; Genesis 19:27 "the place where he had stood before the Lord")
  const ab = new THREE.Group(); ab.position.set(...ABH); g.add(ab); ab.add(mkIslet(rng(9921), 5.0, HA, gcA, 18, 52), underRock(rng(9922), 4.9));
  { const t1 = tentMesh(R, '#cdb48c', .9); t1.position.set(-2.2, HA(-2.2, 1.0), 1.0); t1.rotation.y = 1.4; ab.add(t1); const t2 = tentMesh(R, '#c2a67a', .66); t2.position.set(-1.0, HA(-1.0, -2.4), -2.4); t2.rotation.y = .6; ab.add(t2); }
  tree(ab, HA, -3.4, -.6, 1.7, 'round', ['#4f7a30', '#46702a', '#5a8236', '#3f6824']); tree(ab, HA, 1.0, 2.9, .9, 'olive');
  { const b = new GB(R); for (let k = 0; k < 6; k++) { const a = R() * TAU, r = 1 + R() * 3.2; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86']), [Math.cos(a) * r, HA(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r], [.1 + R() * .12, .07, .1 + R() * .1], [R() * 3, R() * 3, 0], .04); } ab.add(meshOf(b)); }

  // ---- the people
  const lot = mkLot(rng(81)), wife = mkWife(rng(83)), dau = [0, 1].map(i => mkDau(rng(85 + i), i)), ang = [0, 1].map(mkAngel), sil = [0, 1].map(i => mkMan(rng(220 + i), i)), abr = mkAbraham(R);
  const crowd = CROWD.map((_, i) => mkMan(rng(240 + i), i, true));
  [lot, wife, ...dau, ...ang, ...sil, abr, ...crowd].forEach(o => g.add(o.group));
  const torchS = CROWD.map((c, i) => { if (!c.torch) return null; const s = spriteGlow(0, 0, 0, .42, 0xff9a40, 0); g.add(s); return s; });
  const angG = [0, 1].map(() => { const s = spriteGlow(0, 0, 0, .9, 0xffe8b0, 0); g.add(s); return s; });
  const flashD = spriteGlow(DOOR[0] + .25, hC(DOOR[0], DOOR[1]) + .3, DOOR[1], 3.2, 0xffffff, 0), flashD2 = spriteGlow(DOOR[0] + .25, hC(DOOR[0], DOOR[1]) + .3, DOOR[1], 1.2, 0xffffff, 0); g.add(flashD, flashD2);
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 5 + i * 1.3, h: 7 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });
  const doorL = new THREE.PointLight(0xffc070, 0, 5, 1.6), torchL1 = new THREE.PointLight(0xff9a50, 0, 5, 1.6), torchL2 = new THREE.PointLight(0xff9a50, 0, 5, 1.6), fireL = new THREE.PointLight(0xff8a40, 0, 12, 1.4), faceL = new THREE.PointLight(0xff9050, 0, 5, 1.5);

  // ---- the fire from heaven: streaks falling on Sodom, glow on the city, columns of smoke
  const FR = rng(1950), FN = 190, fireM = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, .6, .03), addMat(0xffa040, .9), FN); fireM.frustumCulled = false; fireM.renderOrder = 8; g.add(fireM);
  const FP = Array.from({ length: FN }, () => ({ x: SC[0] + (FR() - .5) * 8.4, z: SC[1] + (FR() - .5) * 7.2, y0: FR() * 9, v: 5 + FR() * 4, s: .6 + FR() * .9 })); const fob = new THREE.Object3D();
  const flames = Array.from({ length: 10 }, (_, i) => { const a = FR() * TAU, r = FR() * 3.0, x = SC[0] + Math.cos(a) * r, z = SC[1] + Math.sin(a) * r, s = spriteGlow(x, hC(x, z) + .55, z, 1.0 + FR() * .9, i % 2 ? 0xff7a30 : 0xffa848, 0); g.add(s); return { s, ph: FR() * 6, d: i * .25 }; });
  const cityG = spriteGlow(SC[0], .9, SC[1], 11, 0xff7a30, 0); g.add(cityG);
  const scorch = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, .01, 28), new THREE.MeshBasicMaterial({ color: 0x2a1c16, transparent: true, opacity: 0, depthWrite: false })); scorch.position.set(SC[0], .355, SC[1]); g.add(scorch);
  [[SC[0] - 1.2, SC[1] - .6], [SC[0] + 1.4, SC[1] + .2], [SC[0] + .2, SC[1] - 1.8], [SC[0] - 2.0, SC[1] + 1.0], [SC[0] + 2.4, SC[1] - 1.2]].forEach(([x, z], i) => smoke.add(x, hC(x, z) + .5, z, t => smooth(42.2 + i * .4, 46 + i * .4, t), .5 + .1 * (i % 3), 6.4)); g.add(smoke.mesh);

  // ---- sky and far land
  const stars = makeStars({ seed: 19 }); g.add(stars.group);
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 190, [[0, 0, 24], [ABH[0], ABH[2], 8]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const CLOUD = [[0, '#f2c8a0'], [5, '#c89a98'], [8, '#323a68'], [24, '#323a68'], [28, '#a88aa0'], [32, '#f0b890'], [37, '#f8e0b8'], [41, '#b89890'], [46, '#8a7078'], [52, '#e8c8a0'], [60, '#c8b8b0'], [90, '#b8aeb0']];
  const CEM = [[0, '#6a5a48'], [6, '#1a2038'], [24, '#1a2038'], [30, '#5a4a4a'], [37, '#7a6a50'], [41, '#6a4a40'], [45, '#8a4a30'], [52, '#6a5a48'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const SMK = [[0, '#4a3a36'], [60, '#3a302e'], [90, '#3a302e']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const starOp = t => smooth(5.5, 8, t) * (1 - smooth(27, 32, t)), starBoost = t => .5 + .3 * smooth(8, 24, t);
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y) { const w = walkAnim(t, ph, sp); pose(f, x, (y ?? gAt(x, z)) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const state = { lot: [0, 0, 0], wife: [WP[0], 0, WP[1]], pillar: [WP[0], 0, WP[1]] };

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    stars.update(t, starOp(t), starBoost(t), .6 + .0035 * t, cam);
    { const k = ON(t, 28.5, 33, 58, 61), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0; sunS.position.set(cx + 150, cy + 7 + 8 * smooth(33, 55, t), cz - 12); sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .5 * k; sunS2.material.opacity = .7 * k; sunS.visible = sunS2.visible = k > .01; }
    dust.update(t, .5 * (1 - smooth(5, 8, t)) * (1 - smooth(32, 36, t)) + .3 * smooth(36, 40, t), [-1, .1, 2.5]);
    // evening: the lamps of the gate and the windows of the city come on; they burn through the night and go out toward morning
    const lampK = smooth(1.0, 5.5, t) * (1 - smooth(30, 34, t)) * (1 - smooth(43, 47, t));
    lamps.forEach((s, i) => { s.material.opacity = .7 * lampK * (.9 + .1 * Math.sin(t * 9 + i * 2)); s.visible = lampK > .01; });
    WINS.forEach(w => { const on = smooth(w.ord * 3 + 1.0, w.ord * 3 + 3.0, t) * (1 - smooth(31 + w.ord * 2, 34 + w.ord * 2, t)), tw = .88 + .12 * Math.sin(t * 2.1 + w.ph); w.s.material.opacity = .62 * on * tw * (1 - smooth(43, 47, t)); w.s.visible = w.s.material.opacity > .004; });
    // Lot
    { const p = kpl(t, LOT_K), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, sp = 9.5;
      const sit = 1 - smooth(2.4, 3.2, t), bow = ON(t, 3.4, 3.9, 4.0, 4.5), hes = ON(t, 25.2, 25.8, 26.9, 27.6), spk = ON(t, 6.8, 7.2, 11.2, 11.6), hand = smooth(27.0, 27.6, t) * (1 - smooth(33.0, 33.6, t)), run = ON(t, 33.2, 34.0, 39.8, 40.6);
      if (!mv) { ry = headZ(-1, .1); if (t < 2.6) ry = headZ(-1, -.3); if (t >= 3.2 && t < 5) ry = headZ(-.4, 1); if (t >= 6 && t < 12.5) ry = headZ(1, .1); if (t >= 16 && t < 21.6) ry = headZ(-1, -.1); if (t >= 21.6 && t < 25) ry = headZ(1, .1); if (t >= 25 && t < 27.4) ry = headZ(-1, -.15) + hes * .35 * Math.sin(t * 1.3); if (t >= 40.8) ry = headZ(0, -1); }
      ex = { lx: .1 * sit + .9 * bow - .22 * hes + .1 * run, s: 1 - .24 * sit, a0x: -.4 * spk * (.6 + .4 * Math.sin(t * 3)) - .6 * bow - .9 * hand * (mv ? 0 : 1), a1x: -.5 * spk * (.5 + .5 * Math.sin(t * 2.5 + 1)) - .5 * bow, a0z: -.12 - .6 * spk, a1z: .12 + .6 * spk };
      fig(lot, p.x, p.z, ry, mv, t, 1.1, ex, run > .3 ? 12.5 : sp); lot.group.visible = !(t > 12.45 && t < 15.9); state.lot = [p.x, gAt(p.x, p.z), p.z]; }
    // angels: arrive, go in (a1), reach out and pull Lot in (b2), speak (c1), take the hands (c3), point the way (d1), watch (e1)
    ang.forEach((a, i) => { const p = kpl(t, KANG[i]), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      const pull = ON(t, 11.4, 11.8, 12.2, 12.5), spk = ON(t, 16.3, 16.8, 20.8, 21.4), hold = smooth(27.0, 27.6, t) * (1 - smooth(33.0, 33.6, t)), point = smooth(34.4, 35.2, t) * (1 - smooth(40.0, 41.0, t)), watch = smooth(41.0, 42.0, t);
      if (!mv) { ry = headZ(-1, .1); if (t >= 11.2 && t < 12.6) ry = headZ(-1, 0); if (t >= 16 && t < 22) ry = headZ(-1, i ? .4 : -.4) * 1; if (t >= 25 && t < 33.5) ry = headZ(-.6, i ? -1 : 1); if (t >= 34) ry = headZ(-1, -.3); if (t >= 41.4) ry = headZ(1, -.2); }
      ex = { a0x: -1.3 * pull - .5 * spk * (.5 + .5 * Math.sin(t * 2.2 + i)) - (mv ? 0 : 1.2 * hold) - 1.4 * point * (1 - i * .15) - .2 * watch, a1x: -1.3 * pull * .6 - .15 * spk, a0z: -.12 - .9 * hold * (mv ? 0 : 1) };
      fig(a, p.x, p.z, ry, mv, t, 2.4 + i, ex, 9.5); a.group.visible = (t > .05 && t < 6.2) || (t > 11.25 && t < 12.55) || t > 15.9; angG[i].position.set(p.x, gAt(p.x, p.z) + .38, p.z); angG[i].material.opacity = (.1 + .1 * pull + .06 * spk + .08 * ON(t, 27, 28, 32, 34.5)) * (a.group.visible ? 1 : 0); angG[i].visible = a.group.visible; });
    // Lot's wife and daughters
    { const p = kpl(t, KWIFE), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}; const look = smooth(46.3, 47.3, t), fl = ON(t, 25.2, 25.8, 26.9, 27.5);
      if (!mv) { ry = headZ(-1, -.2); if (t < 27) ry = headZ(-.6, -.8); if (t >= 41.5 && t < 46.3) ry = headZ(-1, -.3); if (t >= 46.3) ry = lerp(headZ(-1, -.3), headZ(1, -.1) - 2 * Math.PI * 0, look); }
      ex = { lx: -.05 * fl - .05 * look, a0x: -.3 * look * 0 - (mv ? 0 : .5 * look), a1x: -.4 * look * 0 };
      fig(wife, p.x, p.z, ry, mv, t, 3.1, ex, 9); wife.group.visible = t > 15.9 && t < 47.85; state.wife = [p.x, gAt(p.x, p.z), p.z];
      if (!mv && t >= 46.3) { const a0 = Math.atan2(-1, -.3), a1 = Math.atan2(1, -.1); wife.group.rotation.y = lerp(a0, a1 - 2 * Math.PI * 0, look); wife.group.rotation.y = a0 + ((a1 - a0 + Math.PI * 3) % (2 * Math.PI) - Math.PI) * look; } }
    dau.forEach((d, i) => { const p = kpl(t, KD[i]), mv = p.mv; let ry = headZ(p.vx, p.vz);
      if (!mv) { ry = headZ(-1, .1 + i * .3); if (t >= 41) ry = headZ(0, -1); }
      fig(d, p.x, p.z, ry, mv, t, 4.2 + i, { a0x: mv ? 0 : -.0 }, 9.5); d.group.visible = t > 15.9; });
    // the sons-in-law: they hear Lot out and laugh (19:14)
    sil.forEach((s, i) => { const p = kpl(t, KS[i]), lg = ON(t, 22.8 + i * .25, 23.2 + i * .25, 24.2, 24.8), sh = Math.sin(t * 15 + i) * lg;
      fig(s, p.x, p.z, headZ(-1, .25 - i * .5), false, t, i, { lx: .05 * lg + .03 * sh, s: 1 - .03 * lg + .015 * sh, a0x: -.4 * lg, a1x: -.2 * lg }); s.group.visible = t > 21.5 && t < 28; });
    // the crowd: they come to the house with torches (19:4), shout (19:9), are struck with blindness and grope for the door (19:11), then wander off
    { const l1 = [0, 0, 0], l2 = [0, 0, 0]; let n1 = 0, n2 = 0;
      crowd.forEach((m, k) => { const c = CROWD[k], p = crowdPos(k, t), arr = smooth(5.5, 8.6, t), blind = smooth(12.2, 12.7, t), mv = arr < .98 || (t > 13.4 && t < 16.4);
        let ry = headZ(DOOR[0] + .4 - p[0], DOOR[1] - p[2]); const shout = (1 - blind) * smooth(7.2, 8.2, t), pump = Math.sin(t * 5 + c.ph);
        if (blind > 0) ry += blind * .7 * Math.sin(t * 2.7 + c.ph) + (t > 13.4 ? Math.sin(t * 1.3 + k) * 1.2 * smooth(13.4, 15.5, t) : 0);
        const ex = { lx: .05 * shout, a0x: c.torch ? lerp(-2.9, -1.4, blind) - .25 * pump * shout : -2.5 * shout + (-1.4) * blind + -.4 * pump * shout, a1x: -2.1 * shout * (1 + .15 * pump) - 1.3 * blind, a0z: -.2, a1z: .2 };
        fig(m, p[0], p[2], ry, mv, t, k * .7, ex, 7.5, p[1]); m.group.visible = t > 5.5 && t < 16.6;
        const ts = torchS[k]; if (ts) { const k2 = ON(t, 5.8, 6.6, 12.2, 13.4) * (m.group.visible ? 1 : 0), fl = .85 + .15 * Math.sin(t * 17 + c.ph) * Math.sin(t * 9 + k); ts.position.set(p[0] + .04, p[1] + .66, p[2]); ts.material.opacity = .85 * k2 * fl; ts.visible = k2 > .01; if (c.th < 0) { l1[0] += p[0]; l1[1] += p[1]; l1[2] += p[2]; n1++; } else { l2[0] += p[0]; l2[1] += p[1]; l2[2] += p[2]; n2++; } } });
      const tk = ON(t, 5.8, 6.8, 12.0, 13.2), fk = .88 + .12 * Math.sin(t * 13) * Math.sin(t * 7.3);
      torchL1.position.set(l1[0] / Math.max(1, n1), l1[1] / Math.max(1, n1) + .7, l1[2] / Math.max(1, n1)); torchL2.position.set(l2[0] / Math.max(1, n2), l2[1] / Math.max(1, n2) + .7, l2[2] / Math.max(1, n2)); torchL1.intensity = 2.0 * tk * fk; torchL2.intensity = 2.0 * tk * (1.1 - fk * .1); }
    // the lit door: the lamp inside burns through the night; the flash that strikes the crowd (19:11)
    { const lit = smooth(4.8, 6.4, t) * (1 - smooth(31, 34, t)), fk = .94 + .06 * Math.sin(t * 2.3), fl = ON(t, 12.0, 12.35, 12.5, 14.0), pull = ON(t, 11.4, 11.8, 12.2, 12.6) * 0;
      doorM.material.opacity = .8 * lit * fk; doorG.material.opacity = .4 * lit * fk + .2 * fl; doorG2.material.opacity = .26 * lit + .3 * fl; doorG.visible = doorG2.visible = lit > .01; doorL.position.set(DOOR[0] + .7, hC(DOOR[0], DOOR[1]) + .5, DOOR[1]); doorL.intensity = 1.7 * lit * fk + 6 * fl;
      flashD.material.opacity = .85 * fl; flashD2.material.opacity = fl; flashD.visible = flashD2.visible = fl > .01; }
    // fire and brimstone: the streaks fall on the city (19:24), glow, smoke; the ground darkens
    { const k = ON(t, 41.2, 42.2, 56, 59.5), th = 1 - .55 * smooth(46, 52, t); fireM.visible = k > .01;
      FP.forEach((p, i) => { const y = 9 - ((p.v * (t - 41) + p.y0) % 9); fob.position.set(p.x + (9 - y) * .1, hC(p.x, p.z) + y, p.z); fob.rotation.set(0, 0, .1); fob.scale.set(1, k * th * p.s, 1); fob.updateMatrix(); fireM.setMatrixAt(i, fob.matrix); }); fireM.instanceMatrix.needsUpdate = true;
      flames.forEach(f => { const on = smooth(42.5 + f.d, 44.5 + f.d, t) * (1 - .35 * smooth(54, 60, t)), fl = .75 + .25 * Math.sin(t * 11 + f.ph) * Math.sin(t * 5.3 + f.ph); f.s.material.opacity = .55 * on * fl; f.s.visible = on > .01; });
      const cg = smooth(42.2, 45, t) * (1 - .3 * smooth(54, 60, t)); cityG.material.opacity = .34 * cg * (.9 + .1 * Math.sin(t * 7)); cityG.visible = cg > .003; scorch.material.opacity = .5 * smooth(43, 50, t); scorch.visible = scorch.material.opacity > .01;
      fireL.position.set(SC[0], 1.8, SC[1]); fireL.intensity = 3.4 * cg * (.9 + .1 * Math.sin(t * 9)); smoke.update(t, colAt(SMK, t));
      const ff = smooth(41.6, 43, t) * (1 - smooth(50, 54, t)); faceL.position.set(WP[0] + 1.4, hC(WP[0], WP[1]) + .7, WP[1] - .3); faceL.intensity = 3.0 * ff * (.92 + .08 * Math.sin(t * 8)); }
    // Lot's wife looks back and becomes a pillar of salt: a white flash, then the small white column stands in her place (19:26)
    { const fl = ON(t, 47.4, 47.8, 47.9, 49.0), grow = smooth(47.75, 48.2, t); pillar.scale.set(1, Math.max(.001, grow), 1); pillar.visible = grow > .01;
      flashG.material.opacity = .9 * fl; flashG.visible = fl > .01; const sk = smooth(48.2, 50, t) * (.7 + .3 * Math.sin(t * 3)); salt.material.opacity = .22 * sk * (.7 + .3 * Math.sin(t * 5.1)); salt.visible = sk > .01; }
    // Abraham: he stands at the place where he stood before the Lord and looks toward Sodom (19:27-28)
    { const p = abrahamPos(), br = Math.sin(t * 1.5) * .012, lk = smooth(49.8, 51.2, t), pl = smooth(51.2, 52.4, t) * .12; fig(abr, p[0], p[2], headZ(1, -.16), false, t, 0, { lx: -.04 * lk + br + pl * .0, a0x: -.4 * smooth(53.5, 55, t) * (1 - smooth(58, 60, t)), a1x: -.1 }, 9.5, p[1]); abr.group.visible = t > 49; }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t < 6 || t > 50; b.group.position.set(ABH[0] + 3 + Math.cos(a) * b.r * .6, 5 + b.h * .3 + Math.sin(t * .5 + i), ABH[2] - 2 + Math.sin(a) * b.r * .5); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#d8d4e4', '#8a7a58', 1.0, '#ffcc88', 2.8, [-8, 4.6, 3], .5, '#ffd8a8', [8, 5, 6], 14), Dk(3.5, '#c8c0d8', '#7a6050', .98, '#ffb070', 2.3, [-10, 3.0, 4], .5, '#ffa070', [8, 5, 6], 14),
    Dk(6, '#4a5a98', '#1c2038', .9, '#a8b8f8', 1.0, [-7, 8, 7], .6, '#8a9cff', [8, 4, 6], 14), Dk(25, '#4a5a98', '#1c2038', .9, '#a8b8f8', 1.0, [-7, 8, 7], .6, '#8a9cff', [8, 4, 6], 14),
    Dk(28, '#6a76a8', '#3a3248', .92, '#e8a888', 1.5, [9, 3.4, 3], .5, '#ffa078', [-8, 4, 6], 14), Dk(31, '#a8a8c8', '#6a5a50', .98, '#ffb27a', 2.2, [10, 3.2, 2], .5, '#ffc090', [-8, 5, 6], 14),
    Dk(36.5, '#d8d0e4', '#8a7a58', 1.0, '#ffd8a0', 3.0, [10, 6, 3], .5, '#ffe0b0', [-8, 5, 6], 14), Dk(41, '#b8a8b0', '#7a5a48', .92, '#ffb06a', 2.4, [10, 5, 2], .6, '#ff8a40', [10, 3, 0], 14),
    Dk(46, '#a89098', '#6a4a40', .9, '#ff9a58', 1.8, [10, 4, 2], .8, '#ff7a38', [12, 3, -1], 14), Dk(51, '#d8c8c0', '#8a6a50', .98, '#ffc890', 2.8, [10, 5, 0], .7, '#ffb070', [-8, 5, 4], 14),
    Dk(58.5, '#d8c8c0', '#8a6a50', .98, '#ffc890', 2.8, [10, 5, 0], .7, '#ffb070', [-8, 5, 4], 14), Dk(60, '#8a90a8', '#4c4648', .95, '#e8c8a8', 1.5, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#6a7cb0', '#f2c890']], [3.5, ['#4a5a98', '#e8905c']], [6, ['#0a1238', '#2a2c60']], [25, ['#0a1238', '#2a2c60']], [28, ['#1c2a60', '#8a5a70']], [31, ['#4a5a98', '#f0a070']], [34, ['#6a8ac4', '#f8d49c']], [37.5, ['#7aa0d4', '#ffe4b0']],
    [41, ['#6a5a78', '#e8905c']], [46, ['#4a3a50', '#d0703c']], [51, ['#8a8aa8', '#f4c890']], [58.5, ['#8a8aa8', '#f4c890']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, stars, lot, wife, dau, ang, sil, crowd, abr, pl: [doorL, torchL1, torchL2, fireL, faceL], state };
}
