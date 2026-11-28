// Episode 47: Genesis 47 (NRSV-CE). Joseph brings five of his brothers before Pharaoh, who asks their work; they say they are shepherds and that the famine in Canaan is severe (47:1-4); Pharaoh tells Joseph to settle them in Goshen, the best of the land (47:5-6).
// Joseph brings in his father Jacob, who blesses Pharaoh; Pharaoh asks how old he is; Jacob says one hundred thirty years, few and hard (47:7-10); Joseph settles his family in the land of Rameses and provides them with food (47:11-12).
// The famine grows heavy; the people pay for grain with silver, then livestock, then land and themselves; Joseph buys the land for Pharaoh and gives them seed, and a fifth of the harvest is Pharaoh's; they say: you have saved our lives (47:13-26).
// Israel settles in Goshen, gains property and grows very numerous (47:27); Jacob lives seventeen years in Egypt; near death he asks Joseph not to bury him in Egypt but to carry him to his fathers; Joseph swears; Israel bows at the head of his bed (47:28-31).
// Cinematic interpretation: the portico and its seat, the court, the granary yard with a table and balance, the queue, the dry and the green field, the Goshen tents and flock, the bed, the evening lamp. The chapter's omissions are kept (the long legal detail, the priests' land, the hand under the thigh).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep, makeQuad, makeCamel, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { makeBird } from './fauna6.js';
import { LK } from './lights.js';
import { makeStars } from './stars15.js';
import { mkIslet, cloudSea, farMountains10, headZ, headX, C3, rimf, meshOf, tentMesh, houseBlock } from './world10.js';

export const RIC = 15, RW = .85, WL = .2;
export const RV = z => .55 * Math.sin(z * .32 + .6);                                   // the river runs north to south; this is its centre line
export const FORD = [.45, 1.3], CAMPC = [-7.0, -.2], EAST = [4.4, 1.6];                // the ford; the camp at the west end of the road; the east bank
export const CITY = [8.3, .2], CHD = 2.6, CHW = 3.0, GX = CITY[0] - CHD, GZ = CITY[1];   // a walled town on the east bank, its gate in the west wall at (GX, GZ)
export const JD = [-4.7, .35];                                                          // where Jacob stood in Genesis 35 (kept for the shared stage object)
export const OAK = [-3.0, -2.0];                                                        // the great oak between the camps
export const JC = [-3.3, -4.8];                                                         // Jacob's camp, north of the road
export const SEIR = [11.2, 5.4];                                                        // the hill country of Seir: Esau's camp on the east hill
export const HOR = [5.4, 8.6];                                                          // the people who lived in Seir before him: a small camp in the valley to the south
// ---------------- terrain: open country, a river with a shallow ford in the middle, a ridge in the east
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.8, -5.4, 1.5, 3.8], [3.5, -10.5, 1.1, 5], [12.6, 5.4, 1.1, 3.8], [-2, -10.8, 1.2, 4], [.2, 10.8, 1.0, 4], [-8.5, 9.4, .8, 3.6]];
export const CAN = [3.6, -6.0];                                                           // Jacob's camp in Canaan (Genesis 42): dry ground north of the road, east of the river
const FLATS = [[CAMPC[0], CAMPC[1], .31, 4.8], [CITY[0], CITY[1], .33, 4.9], [EAST[0] + .6, EAST[1] - .6, .32, 3.2], [SEIR[0], SEIR[1], .98, 3.2], [HOR[0], HOR[1], .36, 2.4], [JC[0], JC[1], .31, 2.4], [CAN[0], CAN[1], .31, 2.9]];
const bedAt = z => lerp(-.16, .12, smooth(1.6, .7, Math.abs(z - FORD[1])));
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  h = lerp(h, bedAt(z), smooth(RW + 1.15, RW - .1, Math.abs(x - RV(z))) * smooth(11, 8.6, Math.abs(z)));
  return rimf(RIC, h, r, -.02); };
export const PATH = [[-6.0, .8], [-3.2, 1.2], [-1.0, 1.15], [.45, 1.2], [2.2, 1.0], [4.0, .6], [5.4, .25]];

const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const d = Math.abs(x - RV(z)), zw = smooth(11, 8.6, Math.abs(z)); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  b.lerp(C3('#86a458'), .35 * smooth(-1, 1, Math.sin(x * .5 - z * .8 + 1)));
  b.lerp(C3('#c9b88c'), .6 * smooth(RW + 1.7, RW + .15, d) * zw);
  b.lerp(C3('#a8906a'), .55 * smooth(3.6, 1.4, Math.hypot(x - CAMPC[0], z - CAMPC[1]))); b.lerp(C3('#c8b078'), .65 * smooth(3.9, 2.7, Math.hypot(x - CITY[0], z - CITY[1])));
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#a8583a'), .72 * smooth(6.8, 10.6, x) * smooth(.2, .5, y + .25)); b.lerp(C3('#b0683e'), .5 * smooth(4.2, 1.6, Math.hypot(x - HOR[0], z - HOR[1])));
  b.lerp(C3('#e8d6aa'), .7 * smooth(.8, .3, dPath(x, z)));
  b.lerp(C3('#c8a670'), .8 * smooth(3.4, 1.1, Math.hypot(x - CAN[0], z - CAN[1])));
  if (y < .17) b.lerp(C3('#8a9686'), .75); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, CITY, GX, GZ, JD, CAMPC, PATH, RV, FORD, OAK, JC, SEIR, HOR, EAST };
// ---------------- walkers: keys [[t, x, z, ease?], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (keys.length === 1) return { x: keys[0][1], z: keys[0][2], mv: false, vx: 1, vz: 0 }; if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);

// ---------------- the people
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', beard: '#3a2616', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);   // the same Jacob, Rachel and Leah as in Genesis 33, with a beard
const mkRachel = R => person(R, { pants: '#e0d4b4', top: '#4f9a8a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#efe4cc', sash: '#c8884a', seed: 810 }, .43);
const mkLeah = R => person(R, { pants: '#cdbf9c', top: '#8a5a78', skin: '#c58c60', hair: '#2a1a10', long: true, cloth: '#d8c8d6', sash: '#c9a15a', seed: 820 }, .44);
const mkMaid = (R, top, skin, cloth, sash, seed) => person(R, { pants: '#d8ccb0', top, skin, hair: '#2a1a10', long: true, cloth, sash, seed }, .42);
const mkHerd = (R, top, skin, seed, pants = '#5a4a38') => person(R, { pants, top, skin, hair: '#2e1d10', sash: '#3a2a1a', seed }, .45);
const mkKid = (R, top, seed, sc, skin = '#c58c60', long = false) => person(R, { pants: '#d9ccb0', top, skin, hair: '#2a1a10', long, seed }, sc);
const mkIsaac = R => person(R, { pants: '#d8d0bc', top: '#c9b890', skin: '#c38a5c', hair: '#d6d2ca', beard: '#e2dfd8', cloth: '#efe8d6', mantle: '#9a8a6a', sash: '#8a6a3a', seed: 630 }, .46);   // Isaac, very old: white beard, a long mantle
const mkEsau = R => person(R, { pants: '#8a5a38', top: '#7a3a26', skin: '#c87a50', hair: '#a8441c', beard: '#a8441c', cloth: '#e0d0b0', mantle: '#6a4a2a', sash: '#2e2018', seed: 975 }, .5);   // ruddy and hairy (25:25), broader than Jacob
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const mkDark = sd => makeQuad({ rn: rng(sd), len: .46, h: .24, w: .2, legL: .2, legW: .04, col: '#3a2e26', col2: '#2a201a', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#2a201a' });
const mkGoat = sd => { const s = makeQuad({ rn: rng(sd), len: .5, h: .24, w: .2, legL: .26, legW: .04, col: '#d8cdb4', col2: '#7a5a3a', neck: [.15, .75, .08], head: [.17, .1, .09], horns: true, ears: false, legCol: '#5a4430' });
  for (const [x, z] of [[.07, .3], [-.1, -.3]]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(.11, .08, .206), lamC('#4a3426')); sp.position.set(x, .42, z * .08); s.group.add(sp); } return s; };

export function makeCountry() {
  const R = rng(3535), g = new THREE.Group();
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9871), RIC, hC, gcC, 38, 118), underRock(rng(9872), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  [[-10.2, 3.6, 2.4], [-10.6, -3.2, 2.0], [-10.4, 6.0, 1.9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-8.0, -6.4, 2.0], [-5.4, -8.4, 2.1], [6.0, -8.2, 1.8]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-5.4, -6.6, .9], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [10.8, 8.8, .8]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[13.2, 1.0, 1.0], [13.4, -1.6, 1.1], [9.4, 9.8, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.abs(x - RV(z)) < RW + 1.6 || Math.hypot(x - CAMPC[0], z - CAMPC[1]) < 4.4 || dPath(x, z) < 1.3 || (x > 4.6 && x < 11.8 && z > -3.8 && z < 4.4) || (x > -5.6 && x < -.8 && z > -4.4 && z < -.2) || Math.hypot(x - SEIR[0], z - SEIR[1]) < 3.4 || Math.hypot(x - HOR[0], z - HOR[1]) < 2.6 || Math.hypot(x - JC[0], z - JC[1]) < 2.4;
  for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 44; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; if (x > 4.0 && Math.abs(z + 5.3) < 1.6) { for (let q = 0; q < 6; q++) R(); continue; } b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    ca.add(meshOf(b)); }
  // ---- reeds along both banks, and a few stones in the ford
  { const b = new GB(rng(31)), rr = rng(32); for (let k = 0; k < 170; k++) { const z = -8.6 + rr() * 17.2; if (Math.abs(z - FORD[1]) < 1.15) continue; const side = rr() < .5 ? -1 : 1, x = RV(z) + side * (RW + .12 + rr() * .55), y = hC(x, z), h = .26 + rr() * .3;
      b.add(G.cone5, pk(rr, ['#7a8a4a', '#8a9a52', '#6e8044', '#96a05c']), [x, y + h * .5, z], [.022, h, .022], [(rr() - .5) * .25, 0, (rr() - .5) * .25], .03); }
    for (let k = 0; k < 22; k++) { const z = FORD[1] - 1.1 + rr() * 2.2, x = RV(z) + (rr() - .5) * 1.7; b.add(G.ico0, pk(rr, ['#8a8478', '#9a9486', '#7a766c']), [x, hC(x, z) + .03, z], [.09 + rr() * .08, .05, .08 + rr() * .07], [rr() * 3, rr() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- the river: a strip of water that follows the bed, with ripples that drift downstream (south)
  const NWS = 42, water = (() => { const geo = new THREE.BufferGeometry(), P = [], I = [];
    for (let i = 0; i <= NWS; i++) { const z = -10.4 + 20.8 * i / NWS, cx = RV(z), hw = RW + .95; P.push(cx - hw, WL, z, cx + hw, WL, z); }
    for (let i = 0; i < NWS; i++) { const a = 2 * i; I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setIndex(I); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x3a6c92, emissive: 0x14304a, transparent: true, opacity: .92, side: THREE.DoubleSide })); m.receiveShadow = true; g.add(m); return m; })();
  const RIP = Array.from({ length: 46 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(.34, .008, .035), new THREE.MeshBasicMaterial({ color: 0xcfe4f0, transparent: true, opacity: .4, toneMapped: false })); m.userData = { z0: R() * 20.8, o: (R() - .5) * 2 * (RW - .2), sp: .3 + R() * .2, w: .2 + R() * .36 }; g.add(m); return m; });

  // ---- the camp: four tents, rugs, and the fire pit (lit through the night)
  const TENTS = [[-8.5, -.9, '#cdb48c', .5], [-7.3, 1.0, '#c2a67a', .2], [-6.1, -1.5, '#d4c29c', -.4], [-5.8, .5, '#b8946a', .1], [-7.8, -2.7, '#c8aa80', .7], [-7.2, 2.7, '#d4c29c', -.2]];
  const ETENTS = TENTS.map(([x, z, c, ry], i) => { const m = tentMesh(rng(500 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); return m; });

  const townG = new THREE.Group(); ca.add(townG);
  // ---- a walled town on the east bank (cinematic interpretation: the halls of the kings of Edom, 36:31-39); it appears at dusk
  { const b = new GB(rng(341)), H = .86, T = .2, CX = CITY[0], CZ = CITY[1], x0 = CX - CHD, x1 = CX + CHD, z0 = CZ - CHW, z1 = CZ + CHW, gw = .42, y_ = (x, z) => hC(x, z);
    const wall = (x, z, w, d) => { b.box('#c2ae86', [x, y_(x, z) + H / 2, z], [w, H, d], [0, 0, 0], .04); const n = Math.floor(Math.max(w, d) / .34); for (let k = 0; k < n; k++) { const u = (k + .5) / n - .5; b.box('#b09c74', [x + (w > d ? u * w : 0), y_(x, z) + H + .07, z + (w > d ? 0 : u * d)], [w > d ? .16 : T * 1.2, .14, w > d ? T * 1.2 : .16], [0, 0, 0], .03); } };
    wall(CX, z0, CHD * 2, T); wall(CX, z1, CHD * 2, T); wall(x1, CZ, T, CHW * 2);
    wall(x0, (z0 + CZ - gw) / 2, T, (CZ - gw) - z0); wall(x0, (z1 + CZ + gw) / 2, T, z1 - (CZ + gw));
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [CX, z0], [CX, z1]]) { b.box('#cbb78e', [x, y_(x, z) + .7, z], [.5, 1.4, .5], [0, 0, 0], .04); b.box('#b09c74', [x, y_(x, z) + 1.46, z], [.58, .12, .58], [0, 0, 0], .03); }
    for (const s of [-1, 1]) { const z = CZ + s * (gw + .27); b.box('#cbb78e', [x0, y_(x0, z) + .72, z], [.54, 1.44, .5], [0, 0, 0], .04); b.box('#b09c74', [x0, y_(x0, z) + 1.5, z], [.62, .12, .58], [0, 0, 0], .03); }
    b.box('#b8a47c', [x0, y_(x0, CZ) + .76, CZ], [.3, .2, gw * 2 + .08], [0, 0, 0], .03); b.box('#9a8664', [x0, y_(x0, CZ) + .87, CZ], [.34, .05, gw * 2 + .16], [0, 0, 0], .02);
    b.box('#2a1c10', [x0 + .55, y_(x0, CZ) + .01, CZ], [1.1, .02, gw * 2], [0, 0, 0], .0);
    townG.add(meshOf(b)); }
  townG.add(meshOf(houseBlock(rng(342), CITY[0] + .5, CITY[1] - 1.9, 3, 2, .62, hC, 0)), meshOf(houseBlock(rng(343), CITY[0] + .5, CITY[1] + 1.9, 3, 2, .62, hC, 0)), meshOf(houseBlock(rng(344), CITY[0] + 1.75, CITY[1], 1, 3, .66, hC, 0)));
  { const b = new GB(rng(345)); b.box('#a08a64', [CITY[0] - .2, hC(CITY[0], CITY[1]) + .1, CITY[1] + .02], [.34, .2, .34], [0, 0, 0], .03); b.box('#3a2a1c', [CITY[0] - .2, hC(CITY[0], CITY[1]) + .21, CITY[1] + .02], [.2, .02, .2], [0, 0, 0], .01); townG.add(meshOf(b)); }
  const TX = GX - .34, torchPos = [[TX, GZ - .69], [TX, GZ + .69]];                                        // two torches on the faces of the gate towers
  { const b = new GB(rng(346)); for (const [x, z] of torchPos) b.box('#5a3a22', [x, hC(x, z) + .72, z], [.03, .3, .03], [0, 0, 0], .01); townG.add(meshOf(b)); }
  const torchG = torchPos.map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .92, z, .3, 0xffa850, 0), s2 = spriteGlow(x, hC(x, z) + .9, z, .12, 0xfff0c0, 0); g.add(s, s2); return [s, s2]; });
  const torchL = torchPos.map(([x, z]) => { const l = new THREE.PointLight(0xffa050, 0, 5.2, 1.6); l.position.set(x - .1, hC(x, z) + 1.0, z); return l; });
  const gateL = new THREE.PointLight(0xff9a48, 0, 4.8, 1.5); gateL.position.set(GX + 1.0, hC(GX, GZ) + .55, GZ);
  const gateG = spriteGlow(GX + .55, hC(GX, GZ) + .36, GZ, 1.0, 0xff9a50, 0); g.add(gateG);
  const WINS = []; { const Rr = rng(347), pts = []; for (let i = 0; i < 200 && pts.length < 24; i++) { const x = CITY[0] + .2 + (Rr() - .5) * 4.2, z = CITY[1] + (Rr() - .5) * 5.2; if (Math.abs(z - CITY[1]) < .62 && x < CITY[0] + 1.2) continue; if (Math.hypot(x - CITY[0], z - CITY[1]) < .6) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .42)) continue; pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + .38 + ((i * 7) % 5) * .06, z, .3, 0xffc070, 0); g.add(s); WINS.push({ s, ph: i * 1.9, ord: Rr() }); }); }
  const campL = new THREE.PointLight(0xffa860, 0, 5.5, 1.5); campL.position.set(-3.7, hC(-3.7, .6) + 1.0, .7);

  { const b = new GB(rng(348)), x0 = GX; b.box('#6a4a2a', [x0 + .04, hC(x0, GZ) + .42, GZ], [.1, .84, .84], [0, 0, 0], .03); for (const dz of [-.28, 0, .28]) b.box('#4a3220', [x0 - .02, hC(x0, GZ) + .42, GZ + dz], [.05, .8, .04], [0, 0, 0], .01); b.box('#4a3220', [x0 - .02, hC(x0, GZ) + .36, GZ], [.05, .04, .8], [0, 0, 0], .01); townG.add(meshOf(b)); }
  // ---- the great oak between the camps (a landmark)
  { const m = new THREE.Mesh(roundTreeGeo(2.5, R, ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']), lam); m.position.set(OAK[0], hC(OAK[0], OAK[1]) - .02, OAK[1]); m.castShadow = true; m.rotation.y = 1.3; ca.add(m); occ.push({ m, s: 2.5 }); }
  // ---- Jacob's camp north of the road: three tents, who stays where he was
  [[-3.9, -4.7, '#cdb48c', .3], [-2.7, -5.5, '#c2a67a', -.2], [-2.4, -4.0, '#d4c29c', .5]].forEach(([x, z, c, ry], i) => { const m = tentMesh(rng(560 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; m.visible = false; ca.add(m); });
  // ---- fires: a small ring of stones, a glow and a hot core; lit by the time they are given
  const FIRES = [];
  const fire = (x, z, a, b, big = 1) => { const y = hC(x, z), bb = new GB(rng(600 + FIRES.length)); for (let k = 0; k < 6; k++) { const an = k * 1.047 + .3; bb.add(G.ico0, '#6a5e52', [Math.cos(an) * .13 * big, .02, Math.sin(an) * .13 * big], [.045 * big, .035 * big, .045 * big], [k, an, 0], .03); }
    const m = meshOf(bb); m.position.set(x, y, z); ca.add(m);
    const s = spriteGlow(x, y + .22 * big, z, .62 * big, 0xff9a48, 0), s2 = spriteGlow(x, y + .2 * big, z, .22 * big, 0xfff0c0, 0); g.add(s, s2); FIRES.push({ s, s2, a, b, ph: FIRES.length * 1.7 }); };

  // ---- the stage: Potiphar's house at the west end of the road (mudbrick, a painted frieze, a portico of four columns), its courtyard with a low wall and a gate, a well, jars, palms; the prison yard in the north (stone walls, a barred gate, torches)
  ETENTS.forEach(m => { m.visible = false; });
  const HSE = [-7.5, -1.0], FRX = HSE[0] + .95, CGATE = [-3.7, -1.0], PRIS = [-3.3, -4.8], PGATE = [-3.3, -3.7], WELL = [-4.55, -2.05];
  const wallB = (b, rr, x0, z0, x1, z1, h, th, cols) => { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(l / .27)), a = -Math.atan2(z1 - z0, x1 - x0);
    for (let i = 0; i < n; i++) { const u = (i + .5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u, hh = h * (.88 + .24 * rr()); b.box(pk(rr, cols), [x, hC(x, z) + hh / 2, z], [l / n * 1.04, hh, th], [0, a, 0], .02); } };
  const jarB = (b, x, z, sc, col) => { const y = hC(x, z); b.add(G.cylT, col, [x, y, z], [.068 * sc, .15 * sc, .068 * sc], [0, 0, 0], .01); b.add(G.cyl6, '#a8683c', [x, y + .15 * sc, z], [.036 * sc, .035 * sc, .036 * sc], [0, 0, 0], .005); };
  { const b = new GB(rng(391)), rr = rng(392), y0 = hC(HSE[0], HSE[1]), PZ = HSE[1];
    b.box('#d4bb8e', [HSE[0], y0 + .4, PZ], [1.9, .8, 2.4], [0, 0, 0], .02);                                   // the block
    b.box('#cdb284', [HSE[0] - .25, y0 + .95, PZ], [1.2, .3, 1.8], [0, 0, 0], .02);                         // a small upper room on the roof
    b.box('#2a1c12', [HSE[0] + .355, y0 + .97, PZ], [.02, .13, .26], [0, 0, 0], .004); b.box('#7a5a3a', [HSE[0] + .352, y0 + .97, PZ], [.015, .17, .32], [0, 0, 0], .004);
    b.box('#c4aa7a', [HSE[0] + .93, y0 + .86, PZ], [.07, .12, 2.4], [0, 0, 0], .015); b.box('#c4aa7a', [HSE[0] - .93, y0 + .86, PZ], [.07, .12, 2.4], [0, 0, 0], .015);
    b.box('#c4aa7a', [HSE[0], y0 + .86, PZ + 1.17], [1.9, .12, .07], [0, 0, 0], .015); b.box('#c4aa7a', [HSE[0], y0 + .86, PZ - 1.17], [1.9, .12, .07], [0, 0, 0], .015);
    for (let k = 0; k < 12; k++) b.box(['#b8402e', '#2e6a9a', '#d8a838', '#f0e8d0'][k % 4], [FRX + .012, y0 + .7, PZ - 1.1 + k * .2], [.02, .09, .17], [0, 0, 0], .003);   // the painted frieze
    b.box('#b79e72', [FRX + .006, y0 + .06, PZ], [.012, .12, 2.4], [0, 0, 0], .004);
    b.box('#6a4a2a', [FRX + .01, y0 + .22, PZ], [.025, .44, .32], [0, 0, 0], .004); b.box('#241810', [FRX + .02, y0 + .21, PZ], [.02, .4, .25], [0, 0, 0], .003);      // the door and its frame
    for (const dz of [-.92, .92]) { b.box('#6a4a2a', [FRX + .01, y0 + .42, PZ + dz], [.025, .17, .16], [0, 0, 0], .004); b.box('#241810', [FRX + .02, y0 + .42, PZ + dz], [.02, .13, .11], [0, 0, 0], .003); }
    b.box('#bfa87c', [FRX + .34, y0 + .03, PZ], [.68, .06, 2.3], [0, 0, 0], .01); b.box('#b39c70', [FRX + .72, y0 + .015, PZ], [.2, .03, 1.0], [0, 0, 0], .01);       // the portico floor and a step
    for (const dz of [-.9, -.3, .3, .9]) { b.box('#b8a070', [FRX + .31, y0 + .09, PZ + dz], [.13, .06, .13], [0, 0, 0], .004); b.add(G.cyl6, '#e4d2a2', [FRX + .31, y0 + .09, PZ + dz], [.052, .5, .052], [0, 0, 0], .006); b.box('#c8452e', [FRX + .31, y0 + .62, PZ + dz], [.14, .05, .14], [0, 0, 0], .004); }
    b.box('#c8b080', [FRX + .3, y0 + .675, PZ], [.62, .055, 2.3], [0, 0, 0], .01); b.box('#2e6a9a', [FRX + .605, y0 + .675, PZ], [.012, .05, 2.3], [0, 0, 0], .003);
    wallB(b, rr, -6.1, -2.6, -3.7, -2.6, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']); wallB(b, rr, -6.1, .6, -3.7, .6, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']);                   // the courtyard wall, low enough to see over
    wallB(b, rr, -3.7, -2.6, -3.7, -1.4, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']); wallB(b, rr, -3.7, -.6, -3.7, .6, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']);
    for (const z of [-1.4, -.6]) b.box('#cbb78e', [-3.7, hC(-3.7, z) + .16, z], [.15, .32, .15], [0, 0, 0], .01);
    for (let k = 0; k < 8; k++) { const an = k * TAU / 8; b.box(pk(rr, ['#9a8e7c', '#a99c86', '#85796a']), [WELL[0] + Math.cos(an) * .14, hC(WELL[0], WELL[1]) + .05, WELL[1] + Math.sin(an) * .14], [.09, .1, .08], [0, -an, 0], .02); }
    jarB(b, -4.25, -2.2, 1.0, '#b87a4a'); jarB(b, -4.4, -2.32, .8, '#a8683c'); jarB(b, FRX + .22, PZ - 1.1, 1.1, '#b87a4a'); jarB(b, FRX + .3, PZ + 1.0, .9, '#a8683c'); jarB(b, -5.3, .4, 1.0, '#b87a4a');
    b.box('#c9a15a', [-5.0, hC(-5.0, .4) + .04, .38], [.16, .08, .13], [0, .3, 0], .01); b.box('#b8914a', [-5.95, hC(-5.95, .4) + .04, .42], [.15, .08, .12], [0, -.2, 0], .01);
    ca.add(meshOf(b)); }
  // ---- palms: a trunk of boxes, ten fronds that droop, a few upright ones, a cluster of dates
  const palm = (x, z, s, sd) => { const rr = rng(sd), b = new GB(rr), n = 7; let cx = 0;
    for (let k = 0; k < n; k++) { const u = k / n; cx = .14 * s * u * u; b.box(k % 2 ? '#8a6a48' : '#7c5e3e', [cx, (k + .5) * .15 * s, 0], [.08 * s * (1 - .35 * u), .16 * s, .08 * s * (1 - .35 * u)], [0, 0, 0], .012); }
    const top = n * .15 * s;
    for (let k = 0; k < 10; k++) { const an = k * TAU / 10 + rr() * .3, len = (.5 + .12 * rr()) * s, tl = .45 + .3 * rr(); b.box(pk(rr, ['#5f8a3a', '#6a9a44', '#557f36']), [cx + Math.cos(an) * Math.cos(tl) * len / 2, top - Math.sin(tl) * len / 2, Math.sin(an) * Math.cos(tl) * len / 2], [len, .014 * s, .11 * s], [0, -an, -tl], .01); }
    for (let k = 0; k < 4; k++) { const an = k * TAU / 4 + .7, len = .32 * s; b.box('#74a24c', [cx + Math.cos(an) * Math.cos(.8) * len / 2, top + Math.sin(.8) * len / 2, Math.sin(an) * Math.cos(.8) * len / 2], [len, .014 * s, .09 * s], [0, -an, .8], .01); }
    b.add(G.ico0, '#a8602a', [cx + .04 * s, top - .05 * s, .03 * s], [.04 * s, .05 * s, .04 * s], [0, 0, 0], .01); b.add(G.ico0, '#98521e', [cx - .03 * s, top - .06 * s, -.04 * s], [.035 * s, .045 * s, .035 * s], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = rr() * 6; ca.add(m); occ.push({ m, s: 1.05 * s }); return m; };
  [[-5.1, 2.4, .95, 11], [-9.7, -3.4, 1.05, 12], [-9.5, 2.0, .9, 13], [-2.1, 1.9, .85, 14], [-1.5, -3.0, 1.0, 15], [-6.4, -3.5, .85, 16], [1.5, 3.8, .95, 17], [-8.6, -4.6, .9, 18]].forEach(([x, z, s, sd]) => palm(x, z, s, sd));
  // ---- the prison yard: a compound of stone with a gate on its south side, a roof over one corner, mats, jars, two torches at the gate
  const pWalls = {}; let pBeam = null;
  { const b = new GB(rng(393)), rr = rng(394), cols = ['#9a8e7c', '#a99c86', '#85796a'], x0 = PRIS[0] - 1.2, x1 = PRIS[0] + 1.2, z0 = PRIS[1] - 1.1, z1 = PRIS[1] + 1.1, gl = PGATE[0] - .27, gr = PGATE[0] + .27;
    b.box('#7a6a52', [PRIS[0], hC(PRIS[0], PRIS[1]) + .006, PRIS[1]], [2.36, .012, 2.16], [0, 0, 0], .004);
    const WB = { N: new GB(rng(395)), E: new GB(rng(396)), W: new GB(rng(397)), S: new GB(rng(398)) };
    wallB(WB.N, rr, x0, z0, x1, z0, .72, .17, cols); wallB(WB.W, rr, x0, z0, x0, z1, .72, .17, cols); wallB(WB.E, rr, x1, z0, x1, z1, .72, .17, cols); wallB(WB.S, rr, x0, z1, gl, z1, .72, .17, cols); wallB(WB.S, rr, gr, z1, x1, z1, .72, .17, cols);
    for (const [x, z, k] of [[x0, z0, 'N'], [x1, z0, 'N'], [x0, z1, 'S'], [x1, z1, 'S']]) WB[k].box('#aa9d86', [x, hC(x, z) + .43, z], [.22, .86, .22], [0, 0, 0], .02);
    for (const k of Object.keys(WB)) { pWalls[k] = meshOf(WB[k]); ca.add(pWalls[k]); }
    for (const x of [gl, gr]) { b.box('#6a4a2a', [x, hC(x, z1) + .46, z1], [.14, .92, .14], [0, 0, 0], .01); b.box('#5a3a22', [x, hC(x, z1) + .93, z1], [.18, .05, .18], [0, 0, 0], .004); }
    { const bb = new GB(rng(399)); bb.box('#5a3a22', [PGATE[0], hC(PGATE[0], z1) + .96, z1], [.66, .07, .14], [0, 0, 0], .008); pBeam = meshOf(bb); ca.add(pBeam); }
    { const hx = gl + .07, hz = z1 + .02; b.box('#4a3220', [hx + Math.cos(1.1) * .13, hC(hx, hz) + .34, hz - Math.sin(1.1) * .13], [.26, .66, .03], [0, 1.1, 0], .006); for (let k = 0; k < 3; k++) b.box('#2e2218', [hx + Math.cos(1.1) * (.04 + k * .09), hC(hx, hz) + .34, hz - Math.sin(1.1) * (.04 + k * .09)], [.016, .6, .016], [0, 1.1, 0], .003); }   // the barred door, open
    for (const [x, z, a] of [[-3.8, -4.5, .05], [-3.0, -4.4, -.08], [-2.5, -5.4, .3]]) b.box('#8a7a5a', [x, hC(x, z) + .012, z], [.5, .016, .22], [0, a, 0], .004);
    for (const dx of [-.5, .5]) for (const dz of [-.4, .4]) b.box('#6a4a2a', [-2.62 + dx, hC(-2.62, -5.4) + .3, -5.38 + dz], [.04, .6, .04], [0, 0, 0], .006);
    b.box('#8a6a3a', [-2.62, hC(-2.62, -5.4) + .62, -5.38], [1.2, .045, .95], [0, 0, 0], .01);
    jarB(b, -4.15, -5.6, 1.0, '#a8683c'); jarB(b, -4.3, -5.45, .8, '#b87a4a'); jarB(b, -2.35, -4.6, .9, '#a8683c');
    b.box('#9a8e7c', [-4.3, hC(-4.3, -4.9) + .07, -4.9], [.14, .14, .7], [0, 0, 0], .015);
    ca.add(meshOf(b)); }
  const ptPos = [[PGATE[0] - .4, PGATE[1] - .12 + 1.1 - 1.1], [PGATE[0] + .4, PGATE[1] - .12]], PT = [[PGATE[0] - .27, PRIS[1] + 1.1 + .1], [PGATE[0] + .27, PRIS[1] + 1.1 + .1]];
  { const b = new GB(rng(395)); for (const [x, z] of PT) b.box('#5a3a22', [x, hC(x, z) + .8, z], [.03, .24, .03], [0, 0, 0], .01); ca.add(meshOf(b)); }
  const ptG = PT.map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .98, z, .3, 0xffa850, 0), s2 = spriteGlow(x, hC(x, z) + .96, z, .12, 0xfff0c0, 0); g.add(s, s2); return [s, s2]; });
  const ptL = PT.map(([x, z]) => { const l = new THREE.PointLight(0xffa050, 0, 4.6, 1.6); l.position.set(x, hC(x, z) + 1.0, z - .15); return l; });
  const prL = new THREE.PointLight(0xffb060, 0, 3.4, 1.5); prL.position.set(PRIS[0] - .1, hC(PRIS[0], PRIS[1]) + .85, PRIS[1] + .1);
  // ---- props: the cloak (39:12), a water jar carried at the start, the keys of the prison, spears for the guards
  const mkCloak = () => { const gr = new THREE.Group(), b = new GB(rng(380)); b.box('#2f6a72', [0, 0, 0], [.2, .05, .15], [0, .2, 0], .01); b.box('#d8b048', [0, .012, .07], [.2, .052, .02], [0, .2, 0], .004); b.box('#245860', [.07, -.06, .01], [.1, .12, .12], [0, 0, .2], .01); b.box('#2f6a72', [-.07, -.045, -.02], [.09, .09, .1], [0, 0, -.2], .01); gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkJarP = () => { const gr = new THREE.Group(), b = new GB(rng(381)); b.add(G.cylT, '#b87a4a', [0, 0, 0], [.07, .17, .07], [0, 0, 0], .01); b.add(G.cyl6, '#a8683c', [0, .17, 0], [.038, .04, .038], [0, 0, 0], .005); b.box('#8a5a2a', [.07, .12, 0], [.02, .07, .03], [0, 0, 0], .004); b.box('#8a5a2a', [-.07, .12, 0], [.02, .07, .03], [0, 0, 0], .004); gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkKeys = () => { const gr = new THREE.Group(), b = new GB(rng(382)); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; b.box('#d8aa48', [Math.cos(a) * .028, 0, Math.sin(a) * .028], [.014, .012, .02], [0, -a, 0], .002); } for (let k = 0; k < 3; k++) { b.box('#b89038', [-.01 + k * .014, -.04, .005 * k], [.01, .07, .012], [0, 0, 0], .002); b.box('#b89038', [-.01 + k * .014, -.072, .01 * k], [.024, .012, .012], [0, 0, 0], .002); } gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const CLOAK = mkCloak(), JARP = mkJarP(), KEYS = mkKeys();
  const mkSpear = () => { const st = new THREE.Group(), b = new GB(rng(383)); b.box('#6b4a2c', [.2, .62, -.08], [.028, 1.3, .028], [0, 0, .04], .01); b.add(G.cone5, '#c0c4cc', [.215, 1.27, -.08], [.03, .1, .03], [0, 0, .04], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };

  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const stars = makeStars({ seed: 46 }); g.add(stars.group);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);
  const CLOUD = [[0, '#e8d0ac'], [24, '#e8d0ac'], [25.4, '#d8c4a8'], [31.4, '#d0bca0'], [37, '#e8d0ac'], [46, '#f0d4a8'], [49, '#f0d4a8'], [53, '#e8a078'], [56, '#6a5a80'], [59.6, '#6a5a80'], [60.4, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];
  const CEM = [[0, '#6a5c4a'], [24, '#6a5c4a'], [31.4, '#5a4c3c'], [37, '#6a5c4a'], [49, '#6a5444'], [53, '#5a4444'], [56, '#3a3450'], [59.6, '#3a3450'], [60.4, '#6a5c4a'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = {};
  const walk = (ts, v, pts) => { const ks = [[ts, pts[0][0], pts[0][1], 'L']]; let t = ts; for (let i = 1; i < pts.length; i++) { t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) / v; ks.push([t, pts[i][0], pts[i][1], 'L']); } return ks; };
  // route builder: positions at times, constant speed between waypoints, still while waiting
  const route = (t0, p) => { const ks = [[t0, p[0], p[1], 'L']]; const api = { keys: ks, go(v, q) { const l = ks[ks.length - 1]; ks.push([l[0] + Math.hypot(q[0] - l[1], q[1] - l[2]) / v, q[0], q[1], 'L']); return api; }, wait(tt) { const l = ks[ks.length - 1]; if (tt > l[0]) ks.push([tt, l[1], l[2], 'L']); return api; } }; return api; };
  const sinP = (t, a, d) => { const u = clamp((t - a) / d); return Math.sin(Math.PI * u) ** 2; };   // one smooth pulse (a bow)

  const PW = [...PATH].reverse();                                   // the road, walked from the gate west to the camp
  const along = (r, v, off, from, to) => { for (const q of PW) { if (q[0] > from + .01 || q[0] < to - .01) continue; r.go(v, [q[0], q[1] + off]); } return r; };      // follow the road westward between x = from and x = to
  const alongE = (r, v, off, from, to) => { for (const q of PATH) { if (q[0] < from - .01 || q[0] > to + .01) continue; r.go(v, [q[0], q[1] + off]); } return r; };  // and eastward
  const hdgAt = (keys, t) => { let last = null, first = null; for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (Math.hypot(b[1] - a[1], b[2] - a[2]) <= .01) continue; const d = [b[1] - a[1], b[2] - a[2]]; if (!first) first = d; if (a[0] <= t) last = d; else break; } const d = last || first; return d ? headZ(d[0], d[1]) : 0; };
  const ACT = [];
  const act = (f, keys, o = {}) => { const a = { f, keys, ph: o.ph ?? ACT.length * 1.3, sp: o.sp ?? 7, face: o.face || null, show: o.show || (() => true), ex: o.ex || null, y: o.y || null }; ACT.push(a); return a; };
  const W_ = (a, b) => t => t >= a && t < b;
  const mixA = (...o) => { const r = { a0z: -.1, a1z: .1 }; for (const x of o) for (const k in x) r[k] = (r[k] || 0) + x[k]; return r; };
  const aF = k => k > .001 ? { a0x: -.9 * k, a1x: -.9 * k, a0z: .35 * k, a1z: -.35 * k } : {};      // hands together in front
  const aO = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.95 * k, a1z: .95 * k } : {};        // hands open to the sides
  const aP = k => k > .001 ? { a0x: -1.4 * k, a1x: .2 * k, a0z: -.5 * k, a1z: .1 * k } : {};          // one arm out, pointing
  const toward = (x, z, p) => headZ(p[0] - x, p[1] - z);
  const trek = (r, v, off, dest) => { alongE(r, v, off, -3.0, 3.2); r.go(v, [4.3, 2.7 + off]).go(v, [5.3, 3.9 + off]).go(v, [8.0, 4.7 + .6 * off]).go(v, [9.8, 5.2 + .6 * off]).go(v, dest); return r; };

  // ---- the people. Joseph keeps the face and body of Genesis 37 to 41 (seed 930), now in fine linen with the gold chain (41:42). Jacob is the Jacob of Genesis 33 to 37 (seed 720). The ten brothers (seeds 1100 to 1109), Benjamin (1110) and the servant are new, unnamed on screen except Simeon, the fourth of the ten
  const jac = mkJacob(rng(720));
  const ben = person(rng(1110), { pants: '#d9ccb0', top: '#4f9a8a', skin: '#c58c60', hair: '#2a1a10', sash: '#c8884a', seed: 1110 }, .38);
  const joL = person(rng(930), { pants: '#efe6d0', top: '#f4ecd8', skin: '#c58c60', hair: '#2a1a10', sash: '#d8b048', seed: 930 }, .44);
  const BRC = [['#8a4a3a', '#d8ccb0', '#b98a62', '#2a1a10', '#efe6d0', 1100, .47], ['#4a6a8a', '#d4c8a8', '#a8714a', '#3a2a1a', null, 1101, .46], ['#6a7a4a', '#d8ccb0', '#c58c60', null, '#e0d4b8', 1102, .45], ['#7a5a2a', '#cfc2a0', '#a8714a', '#3a2a1a', null, 1103, .46],
    ['#8a6a8a', '#d8c8a8', '#b98a62', null, '#efe6d0', 1104, .44], ['#a8704a', '#d0c4a4', '#c58c60', '#2a1a10', null, 1105, .46], ['#5a6a8a', '#d8ccb0', '#9a6a44', null, '#d8ccb0', 1106, .45], ['#9a5a4a', '#e0d4b8', '#b98a62', '#3a2a1a', null, 1107, .46],
    ['#6a8a7a', '#d4c8a8', '#a8714a', null, '#efe6d0', 1108, .44], ['#8a7a4a', '#d8ccb0', '#c58c60', '#2a1a10', '#e0d4b8', 1109, .45]];
  const br = BRC.map(([top, pants, skin, beard, cloth, seed, sc]) => person(rng(seed), { pants, top, skin, hair: '#2a1a10', beard, cloth, sash: '#6a4a2a', seed }, sc));
  br[1] = person(rng(990), { pants: '#d9ccb0', top: '#3f5a7a', skin: '#b98a62', hair: '#2e1d10', beard: '#2e1d10', cloth: '#e8dcc0', mantle: '#7a4a2a', sash: '#6a3a1a', seed: 990 }, .46);   // Judah (the Judah of Genesis 38)
  const SIM = 3;
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  const sv = person(rng(950), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 950 }, .42);
  const dnk = [0, 1, 2, 3, 4].map(i => { const s = makeDonkey(rng(810 + i)); s.group.scale.setScalar(.55);
    { const b = new GB(rng(830 + i)); for (const sz of [-1, 1]) { b.add(G.ico0, '#d8c9a0', [-.02, .76, sz * .16], [.1, .12, .08], [0, 0, 0], .004); b.box('#a8946a', [-.02, .87, sz * .16], [.05, .02, .05], [0, 0, 0], .002); } s.group.add(new THREE.Mesh(b.build(), lam)); }
    g.add(s.group); return s; });
  const ALLP = [jac, ben, joL, ...br, gu1, gu2, sv]; ALLP.forEach(o => g.add(o.group));
  // ---- Joseph's gold chain (41:42) rides on the linen figure
  { const b = new GB(rng(791)), N = 20; for (let k = 0; k < N; k++) { const a = k / N * TAU, s = Math.sin(a), fr = s > 0 ? s * s : 0; b.box(k % 2 ? '#e8c040' : '#d8aa30', [Math.cos(a) * .17, .925 - .17 * fr, s * .17], [.038, .03, .038], [0, -a, 0], .003); }
    b.box('#f2ce50', [0, .735, .175], [.05, .06, .02], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; joL.group.add(m); }
  const ropeG = new THREE.Group(); { const b = new GB(rng(793)); for (const [y, r] of [[.9, .19], [.8, .19], [.7, .18]]) for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; b.box('#7a5a32', [Math.cos(a) * r, y, Math.sin(a) * r * .8], [.055, .035, .055], [0, -a, 0], .003); }
    b.box('#7a5a32', [0, .66, .2], [.2, .035, .06], [0, 0, 0], .003); b.box('#6a4a28', [0, .56, .22], [.035, .16, .035], [0, 0, 0], .003); ropeG.add(new THREE.Mesh(b.build(), lam)); ropeG.visible = false; br[SIM].group.add(ropeG); }
  // ---- props: sack stacks at the court, the silver
  const sackB = (b, x, y, z, ry = 0) => { b.add(G.ico0, '#d8c9a0', [x, y + .045, z], [.06, .05, .09], [0, ry, 0], .004); b.box('#a8946a', [x, y + .1, z], [.03, .02, .03], [0, ry, 0], .002); };
  const sackStack = (b, x, z, ry = 0) => { const y = hC(x, z); for (const [dx, dz] of [[-.07, -.1], [.07, -.1], [-.07, .1], [.07, .1], [0, 0]]) sackB(b, x + dx, y, z + dz, ry); for (const [dx, dz] of [[0, -.1], [0, .1]]) sackB(b, x + dx, y + .08, z + dz, ry); sackB(b, x, y + .16, z, ry); };
  const sackCourt = new THREE.Group(); { const b = new GB(rng(792)); sackStack(b, -4.85, -1.95); sackStack(b, -5.0, -1.75, .4); sackB(b, -4.7, hC(-4.7, -1.85), -1.85, .8); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; sackCourt.add(m); g.add(sackCourt); }
  const mkSackSilver = (spill, sd) => { const gr = new THREE.Group(), b = new GB(rng(sd)), rr = rng(sd + 1), tilt = spill ? .55 : 0;
    b.add(G.ico0, '#d8c9a0', [0, .075, 0], [.13, .1, .17], [0, 0, tilt], .004); b.box('#b89c68', [spill ? .06 : 0, .15, 0], [.11, .02, .11], [0, 0, tilt], .002);
    const n = spill ? 30 : 16;
    for (let k = 0; k < n; k++) { const a = rr() * TAU, d = spill ? .06 + rr() * .34 : rr() * .06, x = Math.cos(a) * d + (spill ? .16 : 0), z = Math.sin(a) * d, y = spill ? .012 + rr() * .02 : .15 + rr() * .035;
      b.add(G.cyl6, pk(rr, ['#eef0f6', '#d8dce6', '#f6f7fb']), [x, y, z], [.028, .007, .028], [rr() * .6, rr() * 3, rr() * .6], .002); }
    gr.add(new THREE.Mesh(b.build(), lam)); gr.visible = false; g.add(gr); return gr; };
  const silverIn = mkSackSilver(false, 840), silverSp = mkSackSilver(true, 850);
  const SACKP = [-4.5, -.7], SPILLP = [1.62, 1.1];
  const glint = spriteGlow(0, 0, 0, .3, 0xffffff, 0); g.add(glint);
  // ---- Canaan: three tents on a dry rise, dead trees, dry scrub (Genesis 42:1-5, 42:29-38)
  const CT = [[3.6, -6.8, .95, '#cdb48c', 0], [2.1, -6.45, .8, '#c2a67a', .35], [5.1, -6.6, .8, '#d4c29c', -.3]];
  CT.forEach(([x, z, s, c, ry], i) => { const m = tentMesh(rng(1200 + i), c, s); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; m.castShadow = true; ca.add(m); });
  for (let k = occ.length - 1; k >= 0; k--) { const p = occ[k].m.position; if (Math.hypot(p.x - CAN[0], p.z - CAN[1]) < 3.4) { ca.remove(occ[k].m); occ.splice(k, 1); } }
  const deadTree = (x, z, s, sd) => { const rr = rng(sd), b = new GB(rr); let cx = 0; const n = 6;
    for (let k = 0; k < n; k++) { cx = .05 * s * Math.sin(k * 1.3); b.box(k % 2 ? '#6a5844' : '#5e4c3a', [cx, (k + .5) * .17 * s, 0], [.075 * s * (1 - .4 * k / n), .18 * s, .075 * s * (1 - .4 * k / n)], [0, 0, 0], .01); }
    const top = n * .17 * s;
    for (let k = 0; k < 6; k++) { const an = k * TAU / 6 + rr() * .5, len = (.38 + .22 * rr()) * s, tl = .5 + .5 * rr(), y0 = top * (.55 + .4 * rr());
      b.box('#54422f', [cx + Math.cos(an) * Math.cos(tl) * len / 2, y0 + Math.sin(tl) * len / 2, Math.sin(an) * Math.cos(tl) * len / 2], [len, .03 * s, .03 * s], [0, -an, tl], .006);
      b.box('#54422f', [cx + Math.cos(an) * Math.cos(tl) * len * .9, y0 + Math.sin(tl) * len * .95, Math.sin(an) * Math.cos(tl) * len * .9], [len * .45, .02 * s, .02 * s], [0, -an + .6, tl + .5], .005); }
    const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = rr() * 6; ca.add(m); occ.push({ m, s: .9 * s }); return m; };
  [[2.1, -5.0, 1.5, 1210], [5.9, -5.1, 1.7, 1211], [2.8, -8.0, 1.3, 1212], [4.6, -8.2, 1.6, 1213], [1.9, -7.6, 1.2, 1214]].forEach(([x, z, s, sd]) => deadTree(x, z, s, sd));
  { const b = new GB(rng(1220)), rr = rng(1221); for (let k = 0; k < 70; k++) { const a = rr() * TAU, d = 1.2 + rr() * 3.8, x = CAN[0] + Math.cos(a) * d, z = CAN[1] + Math.sin(a) * d * .9; if (hC(x, z) < .15) continue; const h = .07 + rr() * .11;
      b.add(G.cone5, pk(rr, ['#b8a478', '#a89466', '#c4b088', '#9a8a60']), [x, hC(x, z) + h * .5, z], [.03, h, .03], [(rr() - .5) * .3, 0, (rr() - .5) * .3], .02); }
    for (let k = 0; k < 16; k++) { const a = rr() * TAU, d = .8 + rr() * 3.4, x = CAN[0] + Math.cos(a) * d, z = CAN[1] + Math.sin(a) * d; if (hC(x, z) < .15) continue; if (x > 4.2 && Math.abs(z + 5.3) < 1.3) { for (let q = 0; q < 6; q++) rr(); continue; } b.add(G.ico0, pk(rr, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.1 + rr() * .16, .07 + rr() * .1, .1 + rr() * .16], [rr() * 3, rr() * 3, 0], .05); }
    b.add(G.cylT, '#b87a4a', [2.85, hC(2.85, -7.5), -7.5], [.07, .15, .07], [0, 0, 0], .01); b.add(G.cylT, '#a8683c', [4.3, hC(4.3, -7.5), -7.5], [.06, .13, .06], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.receiveShadow = true; ca.add(m); }

  // ---- Genesis 43 props: the gifts (43:11-15), the double silver at the camp (43:12-15), the washing basin (43:31), the meal table (43:32-34)
  const mkGifts = sd => { const gr = new THREE.Group(), b = new GB(rng(sd)), rr = rng(sd + 1);
    for (const [x, z, s, c] of [[0, 0, 1.0, '#b87a4a'], [.17, .06, .8, '#a8683c'], [-.16, .08, .9, '#c89a3a'], [.06, -.18, .8, '#b8723e'], [-.12, -.17, 1.0, '#a8683c'], [.3, -.14, .75, '#c89a3a']]) { b.add(G.cylT, c, [x, 0, z], [.068 * s, .15 * s, .068 * s], [0, 0, 0], .01); b.add(G.cyl6, '#a8683c', [x, .15 * s, z], [.036 * s, .035 * s, .036 * s], [0, 0, 0], .005); }
    b.box('#a8825a', [-.34, .04, .02], [.17, .08, .13], [0, .3, 0], .01);
    for (let k = 0; k < 9; k++) b.add(G.ico0, pk(rr, ['#c8a870', '#b89258', '#d4b680']), [-.34 + (rr() - .5) * .1, .09 + rr() * .02, .02 + (rr() - .5) * .08], [.03, .022, .03], [rr() * 3, rr() * 3, 0], .002);
    b.box('#d8c9a0', [0, .035, .3], [.2, .07, .1], [0, .2, 0], .01); b.box('#9a7a4a', [0, .075, .3], [.21, .012, .11], [0, .2, 0], .002);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); gr.visible = false; g.add(gr); return gr; };
  const GA = [2.45, -3.55], GB1 = [-5.0, -1.85];
  const giftsA = mkGifts(870), giftsB = mkGifts(871);
  giftsA.position.set(GA[0], hC(GA[0], GA[1]), GA[1]); giftsB.position.set(GB1[0], hC(GB1[0], GB1[1]), GB1[1]); giftsB.rotation.y = .5;
  const SA1 = [2.6, -3.0], SA2 = [2.9, -2.9];
  const silverA1 = mkSackSilver(false, 860), silverA2 = mkSackSilver(false, 862);
  silverA1.position.set(SA1[0], hC(SA1[0], SA1[1]), SA1[1]); silverA2.position.set(SA2[0], hC(SA2[0], SA2[1]), SA2[1]); silverA2.rotation.y = 1.1;
  const BASN = [-6.22, -1.62];
  const basin = new THREE.Group(); { const b = new GB(rng(880)); b.add(G.cyl6, '#a8946a', [0, 0, 0], [.05, .27, .05], [0, 0, 0], .005); b.add(G.cyl6, '#b8946a', [0, .27, 0], [.12, .055, .12], [0, 0, 0], .004); b.add(G.cyl6, '#8fb4cc', [0, .322, 0], [.1, .004, .1], [0, 0, 0], .001);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; basin.add(m); basin.position.set(BASN[0], hC(BASN[0], BASN[1]), BASN[1]); basin.visible = false; g.add(basin); }
  const TBL = [-4.62, -.62];
  const tableG = new THREE.Group(), platG = new THREE.Group();
  { const b = new GB(rng(890)), y0 = hC(TBL[0], TBL[1]);
    b.box('#8a6a44', [0, .2, 0], [1.7, .035, .5], [0, 0, 0], .006);
    for (const sx of [-.78, .78]) for (const sz of [-.2, .2]) b.box('#6a4e30', [sx, .1, sz], [.04, .2, .04], [0, 0, 0], .004);
    b.box('#e8dcc0', [0, .219, 0], [1.5, .004, .32], [0, 0, 0], .002);
    tableG.add(new THREE.Mesh(b.build(), lam));
    const b2 = new GB(rng(891)), rr = rng(892), top = .224;
    const plate = (x, z, r, big) => { b2.add(G.cyl6, '#e0d2b0', [x, top, z], [r, .012, r], [0, 0, 0], .002);
      const n = big ? 9 : 2; for (let k = 0; k < n; k++) { const a = rr() * TAU, d = big ? rr() * r * .6 : rr() * r * .3, h = big ? .022 + rr() * .05 : .014 + rr() * .012;
        b2.add(G.ico0, pk(rr, ['#a8683c', '#c8883e', '#8a5a2a', '#b4742e', '#c89a3a', '#6a8a4a']), [x + Math.cos(a) * d, top + .012 + h * .5 + (big ? rr() * .02 : 0), z + Math.sin(a) * d], [r * (big ? .4 : .5), h, r * (big ? .4 : .5)], [rr() * 3, rr() * 3, 0], .002); } };
    for (const x of [-.3, -.05, .2, .45, .7]) { plate(x, -.14, .065, false); plate(x, .14, .065, false); }
    plate(-.66, 0, .17, true);                                   // Benjamin's portion (43:34): about five times the size of the others
    platG.add(new THREE.Mesh(b2.build(), lam)); tableG.add(platG);
    tableG.position.set(TBL[0], y0, TBL[1]); tableG.visible = false; g.add(tableG); }

  let SID = '';
  const SH = (...w) => t => w.some(([a, b]) => t >= a && t < b);
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: Array.isArray(a) ? SH(...a) : W_(a, b), ...o });
  const roadZ = x => { for (let i = 0; i < PATH.length - 1; i++) { const a = PATH[i], b = PATH[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return x < PATH[0][0] ? PATH[0][1] : PATH[PATH.length - 1][1]; };
  const aLerp = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const TH = [-6.02, -.6], JAC = [3.6, -5.6], BEN = [3.15, -5.5], DOOR = [-6.4, -1.0], BASP = [-5.98, -1.62], SVG = [-4.05, -1.0], SPT = [-3.3, -3.0];
  const bow = (t, a, b, c, d, k = 1.0) => k * ON(t, a, b, c, d);
  const DKR = [];
  const D5 = k => [2.9 + .5 * k, -3.3 - .2 * (k % 2)];
  const LOAD = j => { const d = D5(j % 5); return j < 5 ? [d[0] - .3, d[1] + .22] : [d[0] + .3, d[1] + .5]; };
  // ---- Genesis 47: Pharaoh's court, Goshen, the granary and the fields, Jacob's bed
  const HE = Math.PI / 2, HW = -Math.PI / 2, HN = Math.PI;
  const aU = k => k > .001 ? { a0x: -2.3 * k, a1x: -2.3 * k, a0z: -.35 * k, a1z: .35 * k } : {};      // both hands raised
  const aOne = k => k > .001 ? { a1x: -1.15 * k, a1z: -.35 * k } : {};                                // one arm forward
  const aE = k => k > .001 ? { a0x: -1.5 * k, a1x: -1.5 * k, a0z: -.1 * k, a1z: .1 * k } : {};        // both arms held out in front: to give
  const aD = k => k > .001 ? { a0x: -1.0 * k, a1x: -1.0 * k, a0z: -.12 * k, a1z: .12 * k } : {};      // both hands down to the ground
  const lyA = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.3 * k, a1z: .3 * k } : {};          // lying: both hands open
  const lyP = k => k > .001 ? { a1x: -1.25 * k, a1z: .45 * k } : {};                                   // lying: one hand raised
  const nightF = t => .5 * ON(t, 54.0, 57.0, 59.6, 60.0);

  const pha = person(rng(972), { pants: '#efe6d0', top: '#f2ead6', skin: '#b98a62', hair: '#1a1410', cloth: '#2e5a9a', mantle: '#c9a15a', sash: '#d8b048', seed: 972 }, .5);
  { const b = new GB(rng(973)); b.box('#d8aa48', [0, 1.1, 0], [.23, .05, .23], [0, 0, 0], .008); b.box('#e8c458', [0, 1.145, .115], [.03, .07, .03], [0, 0, 0], .004); b.box('#d8aa48', [0, 1.14, -.115], [.2, .04, .02], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pha.group.add(m); }
  g.add(pha.group);
  const thr = new THREE.Group(); { const b = new GB(rng(385)), x = -6.02, z = -.6, y = hC(x, z) + .03;
    b.box('#bfa87c', [x, y + .01, z], [.44, .02, .44], [0, 0, 0], .004); b.box('#8a6a3a', [x, y + .08, z], [.27, .12, .25], [0, 0, 0], .004); b.box('#2e5a9a', [x + .005, y + .15, z], [.25, .025, .23], [0, 0, 0], .003);
    b.box('#8a6a3a', [x - .115, y + .3, z], [.03, .3, .25], [0, 0, 0], .004); b.box('#d8aa48', [x - .118, y + .46, z], [.036, .028, .27], [0, 0, 0], .003); for (const dz of [-.115, .115]) b.box('#8a6a3a', [x, y + .2, z + dz], [.24, .03, .03], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; thr.add(m); thr.visible = false; g.add(thr); }

  const WIV = [[1460, '#a8564a', '#efe6d0', '#c58c60'], [1461, '#4a7a8a', '#e8dcc0', '#b98a62'], [1462, '#8a6a9a', '#efe6d0', '#a8714a'], [1463, '#b8944a', '#e8dcc0', '#c58c60']].map(([sd, top, cloth, skin]) => person(rng(sd), { pants: '#e8dcc0', top, skin, hair: '#1e1208', long: true, cloth, sash: '#8a6a3a', seed: sd }, .41));
  const KID = [[1470, .27, '#c9553c', '#b98a62'], [1471, .29, '#4f9a8a', '#c58c60'], [1472, .25, '#d8b048', '#a8714a'], [1473, .28, '#6a7aa8', '#c58c60'], [1474, .26, '#a8704a', '#b98a62']].map(([sd, sc, top, skin]) => person(rng(sd), { pants: '#e8dcc0', top, skin, hair: '#1e1208', seed: sd }, sc));
  g.add(...WIV.map(o => o.group), ...KID.map(o => o.group));
  const ofc = person(rng(1690), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 1690 }, .44);
  const VQ = [[1700, '#8a6a4a', '#d8c9a8', '#a8714a', .42], [1701, '#6a7a5a', '#d4c8a8', '#c58c60', .43], [1702, '#a07850', '#d8ccb0', '#b98a62', .42], [1703, '#7a6a8a', '#d0c4a4', '#9a6a44', .43],
    [1704, '#8a5a4a', '#d8ccb0', '#c58c60', .42], [1705, '#5a7a8a', '#d4c8a8', '#a8714a', .43], [1706, '#9a8a5a', '#d8c9a8', '#b98a62', .42], [1707, '#7a5a3a', '#d0c4a4', '#9a6a44', .43]]
    .map(([sd, top, pants, skin, sc]) => person(rng(sd), { pants, top, skin, hair: '#2a1a10', beard: sd % 2 ? '#2a1a10' : null, sash: '#6a4a2a', seed: sd }, sc));
  g.add(ofc.group, ...VQ.map(o => o.group));
  // ---- the granary yard (east of the river), its sacks and heaps, and the field that is dry and then green
  const FLD = [[2.55, 4.7, 4.85, 6.8]];
  const mkField = lush => { const b = new GB(rng(lush ? 771 : 772)), rr = rng(lush ? 773 : 774);
    for (const [x0, z0, x1, z1] of FLD) { const nr = Math.round((x1 - x0) / .17), nz = Math.round((z1 - z0) / .15);
      for (let r = 0; r < nr; r++) for (let k = 0; k < nz; k++) { const x = x0 + (r + .5) * (x1 - x0) / nr + (rr() - .5) * .03, z = z0 + (k + .5) * (z1 - z0) / nz + (rr() - .5) * .04, y = hC(x, z);
        if (lush) { const h = .17 + rr() * .1; b.box(pk(rr, ['#6a9a3e', '#5f8f38', '#78a444', '#8aa84a']), [x, y + h / 2, z], [.07, h, .07], [(rr() - .5) * .2, rr() * 3, (rr() - .5) * .2], .01); if (rr() < .55) b.box(pk(rr, ['#d8b848', '#c9a83c']), [x, y + h + .012, z], [.05, .04, .05], [0, rr() * 3, 0], .005); }
        else { const h = .035 + rr() * .045; b.box(pk(rr, ['#b8a478', '#a89466', '#c4b088']), [x, y + h / 2, z], [.06, h, .06], [(rr() - .5) * .5, rr() * 3, (rr() - .5) * .5], .01); } } }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = lush; m.receiveShadow = true; ca.add(m); return m; };
  const fLush = mkField(true), fDry = mkField(false);
  // ---- the granary yard east of the river: three round granaries, a low wall, sacks, and two heaps of grain that grow (41:47-49)
  const SILOS = [[3.05, 3.02], [3.62, 3.12], [3.32, 3.78]], PILES = [[2.55, 3.0], [2.6, 3.6]];
  { const b = new GB(rng(780)), rr = rng(781), cols = ['#cdb48c', '#c2a67a', '#d4c29c'];
    wallB(b, rr, 2.2, 2.5, 4.3, 2.5, .13, .09, cols); wallB(b, rr, 4.3, 2.5, 4.3, 4.4, .13, .09, cols); wallB(b, rr, 4.3, 4.4, 2.2, 4.4, .13, .09, cols);
    for (const [x, z] of SILOS) { const y = hC(x, z); b.add(G.cylT, '#c8b088', [x, y, z], [.26, .52, .26], [0, 0, 0], .02); b.box('#b09a70', [x, y + .26, z], [.54, .03, .5], [0, 0, 0], .01); b.add(G.ico1, '#b8a078', [x, y + .52, z], [.27, .17, .27], [0, 0, 0], .02); b.box('#2a1c12', [x - .255, y + .1, z], [.03, .13, .1], [0, 0, 0], .004); b.box('#2a1c12', [x, y + .68, z], [.08, .03, .08], [0, 0, 0], .004); }
    sackStack(b, 3.95, 2.78); sackStack(b, 4.05, 3.9, .5); sackStack(b, 2.75, 4.15, -.4); sackB(b, 3.0, hC(3.0, 3.5), 3.5, .5); sackB(b, 3.7, hC(3.7, 3.5), 3.5, 1.1);
    ca.add(meshOf(b)); }
  const pileM = PILES.map(([x, z], i) => { const b = new GB(rng(783 + i)); b.add(G.ico1, '#d8aa44', [0, .09, 0], [.34, .2, .3], [0, i, 0], .012); b.add(G.ico0, '#c8982c', [.12, .06, .1], [.18, .1, .16], [0, 1, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z), z); m.castShadow = true; ca.add(m); return m; });

  pileM.forEach(m => m.scale.setScalar(1));
  // ---- the table and the balance by the granary, the sacks that change hands
  const TBL47 = [3.2, 1.72], OFP = [3.2, 2.12], TJ = [2.78, 1.72], GATE = [5.75, .35];
  const tblG = new THREE.Group(); { const b = new GB(rng(1691)), x = TBL47[0], z = TBL47[1], y = hC(x, z);
    b.box('#8a6a3a', [x, y + .2, z], [.5, .03, .3], [0, 0, 0], .004);
    for (const [dx, dz] of [[-.2, -.11], [.2, -.11], [-.2, .11], [.2, .11]]) b.box('#6a4a2a', [x + dx, y + .1, z + dz], [.03, .2, .03], [0, 0, 0], .003);
    b.box('#5a4028', [x - .1, y + .31, z], [.022, .2, .022], [0, 0, 0], .003); b.box('#7a5a38', [x - .1, y + .41, z], [.022, .022, .3], [0, 0, 0], .003);
    for (const dz of [-.13, .13]) { b.add(G.cyl6, '#c8b070', [x - .1, y + .33, z + dz], [.09, .012, .09], [0, 0, 0], .003); b.box('#7a5a38', [x - .1, y + .37, z + dz], [.01, .08, .01], [0, 0, 0], .002); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; tblG.add(m); g.add(tblG); }
  const mkSack = (col, s, sd) => { const b = new GB(rng(sd)); b.add(G.ico0, col, [0, .05 * s, 0], [.07 * s, .06 * s, .1 * s], [0, .3, 0], .004); b.box('#a8946a', [0, .11 * s, 0], [.035 * s, .02 * s, .035 * s], [0, 0, 0], .002);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
  const sBag = mkSack('#c9b890', 1.0, 1692); { const b = new GB(rng(1694)); for (let k = 0; k < 5; k++) b.add(G.cyl6, '#dfe3ea', [.1 + .035 * (k % 3), .015 * Math.floor(k / 3) + .004, -.03 + .05 * (k % 2)], [.022, .006, .022], [0, 0, 0], .001); sBag.add(new THREE.Mesh(b.build(), lam)); }
  sBag.position.set(TBL47[0] - .12, hC(TBL47[0], TBL47[1]) + .215, TBL47[1] + .02); sBag.visible = false; g.add(sBag);
  const grBag = mkSack('#d8c9a0', 1.2, 1695); grBag.position.set(TBL47[0] + .12, hC(TBL47[0], TBL47[1]) + .215, TBL47[1] - .04); grBag.visible = false; g.add(grBag);
  const seedBagJ = mkSack('#c8b88a', 1.0, 1696), seedBagF = mkSack('#c8b88a', 1.0, 1697);
  seedBagJ.scale.setScalar(2.3); seedBagJ.position.set(0, .5, .22); seedBagJ.visible = false; joL.group.add(seedBagJ);
  seedBagF.scale.setScalar(2.3); seedBagF.position.set(0, .5, .2); seedBagF.visible = false; VQ[2].group.add(seedBagF);
  // ---- Goshen: tents (more appear as the people grow, 47:27), Jacob's stool, the bed, the lamp
  const TENTS47 = [[-4.2, 2.7, 1.0, '#cdb48c', 0, 0], [-2.3, 2.5, .8, '#c2a67a', .3, 0], [-6.0, 3.7, .8, '#d4c29c', -.2, 0], [-1.4, 3.9, .75, '#b8946a', .2, 0],
    [-5.9, 5.2, .75, '#d9c8a4', .1, 42.0], [-3.2, 6.1, .75, '#cdb48c', -.25, 43.0], [-6.9, 2.0, .7, '#c2a67a', .4, 44.2]];
  const tentObjs = TENTS47.map(([x, z, s, c, ry, ap], i) => { const m = tentMesh(rng(1250 + i), c, s); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; m.castShadow = true; ca.add(m); return { m, ap }; });
  for (const [cx, cz, cr] of [[-3.8, 4.2, 4.4], [3.2, 3.5, 2.6], [3.7, 5.7, 2.2]]) for (let k = occ.length - 1; k >= 0; k--) { const p = occ[k].m.position; if (Math.hypot(p.x - cx, p.z - cz) < cr) { ca.remove(occ[k].m); occ.splice(k, 1); } }
  const JS = [-3.5, 3.45];
  const stoolG = new THREE.Group(); { const b = new GB(rng(1698)), y = hC(JS[0], JS[1]); b.box('#6a4a2a', [JS[0], y + .09, JS[1]], [.14, .03, .12], [0, 0, 0], .003); for (const [dx, dz] of [[-.05, -.04], [.05, -.04], [-.05, .04], [.05, .04]]) b.box('#5a3a20', [JS[0] + dx, y + .04, JS[1] + dz], [.02, .08, .02], [0, 0, 0], .002);
    b.box('#c8452e', [JS[0], y + .11, JS[1]], [.12, .012, .1], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; stoolG.add(m); stoolG.visible = false; g.add(stoolG); }
  const BED = [-4.2, 4.15];
  const bedG = new THREE.Group(); { const b = new GB(rng(1693)), x = BED[0], z = BED[1], y = hC(x, z);
    for (const [dx, dz] of [[-.36, -.15], [.36, -.15], [-.36, .15], [.36, .15]]) b.box('#6a4a2a', [x + dx, y + .045, z + dz], [.045, .09, .045], [0, 0, 0], .003);
    b.box('#7a5a38', [x, y + .1, z], [.82, .03, .36], [0, 0, 0], .004);
    b.box('#d9cdb0', [x, y + .13, z], [.78, .04, .32], [0, 0, 0], .006);
    b.box('#7a5a38', [x - .4, y + .2, z], [.03, .2, .38], [0, 0, 0], .004); b.box('#d8aa48', [x - .4, y + .3, z], [.036, .02, .4], [0, 0, 0], .002);
    b.box('#e8dcc0', [x - .3, y + .17, z], [.14, .04, .2], [0, 0, 0], .006);
    b.box('#b8452e', [x + .17, y + .2, z], [.34, .08, .35], [0, 0, 0], .006); b.box('#d8aa48', [x + .0, y + .2, z], [.015, .082, .352], [0, 0, 0], .002);
    // a low lamp stand behind the headboard
    const LX = x - .52, LZ = z - .12; b.box('#6a4a2a', [LX, y + .09, LZ], [.025, .18, .025], [0, 0, 0], .002); b.add(G.cyl6, '#8a6a3a', [LX, y + .19, LZ], [.06, .03, .06], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bedG.add(m); g.add(bedG); }
  const LAMP = [BED[0] - .52, hC(BED[0], BED[1]) + .26, BED[1] - .12];
  const lampGl = spriteGlow(LAMP[0], LAMP[1], LAMP[2], .5, 0xffb060, 0), lampG2 = spriteGlow(LAMP[0], LAMP[1], LAMP[2], .14, 0xfff0c0, 0); g.add(lampGl, lampG2);
  const bedL = new THREE.PointLight(0xffa860, 0, 3.2, 1.5); bedL.position.set(LAMP[0] + .05, LAMP[1] + .08, LAMP[2] + .05);

  // ---- the court (47:1-10): Pharaoh on his seat in the portico, two guards, the five brothers, Joseph
  still(pha, TH, 0, 24.4, { y: () => .06, face: () => HE, ex: t => mixA({ lx: -.03 }, aO(.6 * ON(t, 6.9, 7.5, 9.2, 9.8)), aO(.45 * ON(t, 16.9, 17.4, 18.3, 18.8)), aF(.4 * ON(t, 14.9, 15.4, 16.5, 16.9))) });
  still(gu1, [-6.0, -1.55], 0, 24.4, { face: () => HE, ex: () => mixA({ lx: -.02 }) });
  still(gu2, [-6.0, .35], 0, 24.4, { face: () => HE, ex: () => mixA({ lx: -.02 }) });
  const BRS = [[-4.62, -1.65], [-4.5, -1.1], [-4.62, -.55], [-4.5, .0], [-4.62, .55]];
  BRS.forEach((p, i) => still(br[i], p, 0, 9.7, { face: () => HW, ex: t => mixA({ s: 1 - .05 * ON(t, .5, 1.1, 2.4, 3.0), lx: .09 * ON(t, .5, 1.1, 2.4, 3.0) }, aF(.5 * ON(t, .2, .8, 3.2, 3.6)), i === 2 ? aO(.85 * ON(t, 3.5, 3.9, 6.6, 7.0)) : aF(.3 * ON(t, 4.2, 4.8, 6.4, 6.9)), i === 3 ? aO(.5 * ON(t, 5.6, 6.0, 6.6, 7.0)) : {}) }));
  still(joL, [-5.25, .05], 0, 9.7, { face: () => toward(-5.25, .05, TH), ex: t => mixA({ lx: .02 }, aP(.7 * ON(t, .3, .8, 2.4, 3.0)), aF(.35 * ON(t, 3.4, 4.0, 6.8, 7.4)), aO(.5 * ON(t, 7.6, 8.1, 9.0, 9.7))) });
  // Joseph goes for his father and brings him in through the courtyard gate (47:7)
  const jcKeys = route(10.6, [-2.4, -1.15]).go(.7, [-3.9, -1.15]).go(.7, [-4.75, -.75]).wait(24.4).keys;
  act(jac, jcKeys, { sp: 6, show: W_(10.6, 24.4), face: (tt, q) => q.mv ? null : toward(q.x, q.z, TH), ex: tt => mixA({ lx: .06 + .03 * ON(tt, 18.9, 19.6, 23.5, 24.2) }, aU(.8 * ON(tt, 14.6, 15.2, 16.4, 16.9)), aF(.5 * ON(tt, 17.2, 17.8, 18.4, 18.8)), aO(.45 * ON(tt, 19.2, 19.8, 22.2, 23.0)), aF(.4 * ON(tt, 23.2, 23.7, 24.0, 24.4))) });
  const jsKeys0 = route(10.4, [-2.2, -.85]).go(.7, [-3.9, -.85]).go(.7, [-4.9, .15]).wait(24.4).keys;
  act(joL, jsKeys0, { sp: 6, show: W_(10.4, 24.4), face: (tt, q) => q.mv ? null : toward(q.x, q.z, TH), ex: tt => mixA({ lx: .02 }, aOne(.7 * ON(tt, 14.6, 15.0, 16.0, 16.8)), aF(.4 * ON(tt, 17.0, 17.6, 23.0, 24.0))) });

  // ---- Goshen: the family and the herd stand about the tents (47:6, 47:11); more come as they grow (47:27)
  const GW = [[-5.0, 3.4], [-3.1, 5.0], [-2.3, 3.2], [-6.2, 3.9]], GK = [[-4.7, 4.6], [-2.9, 3.6], [-1.9, 4.5], [-5.5, 4.4], [-6.1, 4.5]], GAP_W = [0, 0, 42.2, 43.4], GAP_K = [0, 0, 42.2, 43.4, 43.4];
  WIV.forEach((f, i) => still(f, GW[i], GAP_W[i], 49.8, { face: () => toward(GW[i][0], GW[i][1], [-3.6, 4.0]), ex: t => mixA({ s: Math.max(.001, smooth(GAP_W[i], GAP_W[i] + .8, t)) }, aF(.4 * ON(t, 2 + i, 3 + i, 8 + 4 * i, 9 + 4 * i))) }));
  KID.forEach((f, i) => still(f, GK[i], GAP_K[i], 49.8, { face: () => toward(GK[i][0], GK[i][1], [-3.6, 4.0]), ex: t => mixA({ s: Math.max(.001, smooth(GAP_K[i], GAP_K[i] + .8, t)) * (1 + .03 * Math.sin(t * 2 + i)) }) }));
  const GS = [[-1.9, 5.2, 0, HN], [-1.6, 6.0, 0, HW], [-2.4, 6.5, 0, HW], [-3.4, 6.0, 42.2, HE]];
  [5, 6, 7, 8].forEach((bi, i) => { const [x, z, ap, hd] = GS[i]; still(br[bi], [x, z], ap, 49.8, { face: () => hd, ex: t => mixA({ s: Math.max(.001, smooth(ap, ap + .8, t)) }, aF(.3 * ON(t, 3 + i, 4 + i, 8 + i, 9 + i))) }); });
  const SHP = [];
  [[-3.0, 7.0], [-2.6, 6.8], [-2.2, 7.0], [-2.9, 7.4], [-2.4, 7.4], [-2.0, 7.3], [-2.7, 7.7]].forEach((p, i) => { const s = makeSheep(rng(700 + i)); s.group.scale.setScalar(.6); g.add(s.group);
    const r = route(0, p); for (let k = 0; k < 8; k++) { const a = i * 1.7 + k * 2.1; r.go(.07, [p[0] + .25 * Math.cos(a), p[1] + .2 * Math.sin(a)]); r.wait(r.keys[r.keys.length - 1][0] + 3.5 + (i % 3)); }
    SHP.push({ s, keys: r.keys, i, sc: .6, ap: 0, show: null }); });
  [[-3.4, 6.9, 42.0], [-3.0, 7.3, 43.0], [-2.4, 7.5, 43.6], [-3.7, 6.5, 44.4]].forEach(([x, z, ap], i) => { const s = makeSheep(rng(720 + i)); g.add(s.group); const r = route(0, [x, z]); for (let k = 0; k < 8; k++) { const a = i * 2.3 + k * 1.9; r.go(.07, [x + .2 * Math.cos(a), z + .15 * Math.sin(a)]); r.wait(r.keys[r.keys.length - 1][0] + 3 + (i % 2)); }
    SHP.push({ s, keys: r.keys, i: i + 9, sc: .36, ap, show: null }); });
  // Jacob sits at the door of his tent (47:27-28)
  act(jac, [[0, JS[0], JS[1], 'L']], { show: W_(41.4, 49.95), face: () => HW, y: () => .08, ex: tt => mixA({ s: .8, lx: .05 }, aF(.4 * ON(tt, 44.0, 44.6, 48.0, 49.0)), aO(.3 * ON(tt, 45.0, 45.5, 46.2, 46.7))) });
  stoolG.visible = false;

  // ---- the famine (47:13-26): the queue at the table, silver, livestock, the field
  const QS = [[3.7, 1.72], [4.1, 1.55], [4.5, 1.78], [4.9, 1.6]], QV = [0, 1, 6, 7], PS = [[2.5, 4.95], [2.6, 5.45], [2.5, 5.95], [2.1, 6.2]], FK = [[3.0, 5.2], [3.0, 5.8]];
  // Joseph at the table (47:14), the clerk beside it; the queue comes in from the town gate on the east and waits on the dry ground north of the granary yard
  act(joL, route(24.4, TJ).wait(31.8).keys, { sp: 6, show: W_(24.4, 31.8), face: () => HE, ex: t => mixA({ lx: -.02 }, aOne(.6 * ON(t, 25.2, 25.7, 26.3, 26.8)), aE(.7 * ON(t, 28.0, 28.4, 29.0, 29.5)), aF(.3 * ON(t, 30.0, 30.4, 31.2, 31.6))) });
  still(ofc, OFP, 24.0, 31.9, { face: () => HN, ex: t => mixA({ lx: -.02 }, aF(.5 * ON(t, 26.4, 26.8, 27.4, 27.8)), aE(.5 * ON(t, 28.0, 28.4, 29.0, 29.5))) });
  // four people wait in the queue, pay, and later walk round the yard to the field (47:15-19, 47:25)
  QV.forEach((vi, i) => { const q = QS[i], f = VQ[vi], r = route(21.0 + .35 * i, [GATE[0], GATE[1] + .15 * i]).go(.62, [q[0] + .45, q[1] - .1]).go(.5, q).wait(28.8 + .3 * i).go(.75, [5.1, 2.35]).go(.75, [5.1, 4.55]).go(.75, [3.4, 4.55]).go(.75, PS[i]).wait(41.8);
    act(f, r.keys, { sp: 6, show: W_(20.9, 41.8), face: (tt, p) => p.mv ? null : (tt < 31 ? toward(p.x, p.z, TJ) : toward(p.x, p.z, [1.95, 5.5])),
      ex: tt => mixA({}, i === 0 ? aE(.85 * ON(tt, 26.0, 26.5, 27.1, 27.5)) : {}, aF(.3 * ON(tt, 24.6, 25.0, 25.6, 26.2)), aO(.8 * ON(tt, 38.4 + .15 * i, 38.9 + .15 * i, 40.6, 41.4))) }); });
  // two farmers stand on the dry field and kneel before Joseph (47:19, 47:25); one stands and is given seed
  [2, 3].forEach((vi, j) => { const f = VQ[vi], kn = tt => ON(tt, 31.9, 32.6, 34.0, 34.6);
    still(f, FK[j], 29.1, 41.8, { face: () => toward(FK[j][0], FK[j][1], [1.95, 5.5]),
      ex: tt => mixA({ s: 1 - .22 * kn(tt), lx: .16 * kn(tt) }, aD(.9 * kn(tt)), vi === 2 ? aE(.6 * ON(tt, 35.0, 35.4, 36.0, 36.6)) : {}, aO(.8 * ON(tt, 38.5 + .1 * j, 39.0 + .1 * j, 40.6, 41.4))) }); });
  // the livestock and the donkeys are led in from the gate (47:17)
  const LV = [[0, [5.8, .8]], [1, [6.0, .6]], [2, [5.7, 1.1]]], LD = [[4.0, .75], [4.4, .5], [4.2, 1.0]];
  LV.forEach(([k, p], j) => { const s = makeSheep(rng(740 + j)); s.group.scale.setScalar(.6); g.add(s.group); const r = route(0, p).wait(27.4 + .3 * j).go(.6, LD[j]).wait(33.5).go(.6, [5.8, .6]).wait(62);
    SHP.push({ s, keys: r.keys, i: 20 + j, sc: .6, ap: 0, show: t => t >= 27.3 && t < 36.0 }); });
  [0, 1].forEach(j => { const r = route(0, [6.1, .9 + .3 * j]).wait(27.4 + .4 * j).go(.58, [3.6 + 1.2 * j, .8 - .15 * j]).wait(34).go(.6, [5.9, .7]).wait(62); DKR.push({ d: dnk[j], keys: r.keys, show: t => t >= 27.4 && t < 36.0, face: null }); });
  [4, 5].forEach((vi, j) => { const r = route(27.4 + .3 * j, [5.75, .35 + .3 * j]).go(.6, [4.7 - .5 * j, 1.0 - .55 * j]).wait(33.6).go(.6, [5.75, .5]).wait(36.0).keys;
    act(VQ[vi], r, { sp: 6, show: W_(27.3, 36.0), face: (tt, p) => p.mv ? null : toward(p.x, p.z, TJ), ex: tt => mixA({}, aOne(.8 * ON(tt, 31.0, 31.5, 32.0, 32.6))) }); });
  // Joseph at the field edge: the land is bought for Pharaoh, the seed is given, the people are saved (47:20-25)
  const jfKeys = route(31.8, [1.95, 5.5]).wait(41.8).keys;
  act(joL, jfKeys, { sp: 6, show: W_(31.8, 41.8), face: (tt, p) => p.mv ? null : toward(p.x, p.z, [2.7, 5.5]), ex: tt => mixA({ lx: .02 }, aO(.8 * ON(tt, 32.6, 33.2, 33.8, 34.2)), aE(.8 * ON(tt, 34.0, 34.5, 35.2, 35.7)), aO(.5 * ON(tt, 36.3, 36.8, 37.6, 38.1)), aF(.35 * ON(tt, 38.4, 38.9, 40.6, 41.4))) });

  // ---- the bed (47:28-31): Jacob lies at the end of his life; Joseph kneels at his side and swears; Israel bows at the head of his bed
  const JBE = [BED[0] + .34, BED[1]], JBW = [BED[0] - .2, BED[1]];
  const jBed = route(49.8, JBE).wait(57.9).go(1.0, JBW).wait(62).keys;
  const lieB = tt => 1 - smooth(57.9, 58.7, tt);
  const aJb = act(jac, jBed, { sp: 6, show: W_(49.8, 62), face: () => HE, y: tt => .22 * lieB(tt) + .2 * (1 - lieB(tt)),
    ex: tt => { const lie = lieB(tt), bw = ON(tt, 58.6, 59.2, 59.8, 60.6);
      return mixA({ s: 1 - .26 * (1 - lie) * (1 - .0 * bw), lx: -1.5 * lie + .38 * bw }, lyA(lie * (.7 * ON(tt, 50.6, 51.1, 52.4, 52.9) + .9 * ON(tt, 53.0, 53.5, 55.4, 56.0))), lyP(lie * .9 * ON(tt, 54.0, 54.6, 55.6, 56.2)), aF(.9 * bw)); } });
  aJb.rid = true;
  const jsKeys = route(51.0, [-2.9, 5.7]).go(.55, [BED[0] + .12, 4.62]).wait(62).keys;
  act(joL, jsKeys, { sp: 6, show: W_(51.0, 62), face: (tt, p) => p.mv ? null : HN, ex: tt => { const kn = smooth(54.0, 54.7, tt), ok = ON(tt, 56.6, 57.1, 58.2, 58.7);
    return mixA({ s: 1 - .22 * kn, lx: .16 * kn }, aE(.5 * ON(tt, 54.8, 55.3, 56.2, 56.7)), ok > .001 ? { a1x: -2.3 * ok, a1z: .25 * ok } : {}); } });

  function update(t, camera, sid) {
    SID = sid;
    const night = nightF(t);
    const cam = camera && camera.position, tc = t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = .6 * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    townG.visible = false;
    // the prison yard: its near walls are open to the camera in the custody shot
    pWalls.S.visible = sid !== 'cell'; pWalls.E.visible = sid !== 'cell'; pBeam.visible = sid !== 'cell';
    // ---- the actors: every one is a pure function of time (and of the shot)
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return;
      const f = a.f, p = kp(t, a.keys), mv = a.rid ? false : p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // keep the hall close-ups clear: a brother or guard standing between the camera and the subject is not drawn
    if (camera && camera.userData && camera.userData.T && ['asks', 'years', 'bless', 'dying', 'seed', 'saved', 'swear', 'silver'].includes(sid)) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      [...br, ben, ...WIV, ...KID, ...VQ, ofc, gu1, gu2].forEach(f => { if (!f.group.visible) return; const q = f.group.position, px = q.x - C.x, py = q.y + .25 - C.y, pz = q.z - C.z, u = (px * vx + py * vy + pz * vz) / l2;
        if (u > 0 && u < .98) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; if (Math.hypot(dx, dy, dz) < .15 + 1.3 * hw * u) f.group.visible = false; } }); }
    // ---- the donkeys
    dnk.forEach(d => { d.group.visible = false; });
    DKR.forEach(w => { if (!w.show(t)) return; const d = w.d, p = kp(t, w.keys); d.group.visible = true; d.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); d.group.rotation.y = (w.face != null ? w.face : hdgAt(w.keys, t)) - Math.PI / 2; walkLegs(d.legs, t + w.keys.length, 7, p.mv ? .4 : 0); });
    // ---- the props of Genesis 45
    ropeG.visible = false; giftsA.visible = silverA1.visible = silverA2.visible = giftsB.visible = basin.visible = tableG.visible = false; silverIn.visible = false; silverSp.visible = false; sackCourt.visible = false; glint.visible = false;
    // ---- Genesis 47
    thr.visible = t < 24.4;
    tentObjs.forEach(o => { const k = o.ap ? Math.max(.001, smooth(o.ap, o.ap + 1.0, t)) : 1; o.m.scale.setScalar(k); o.m.visible = k > .01; });
    stoolG.visible = t >= 41.4 && t < 49.95; bedG.visible = true;
    { const gk = smooth(34.6, 39.2, t); fLush.scale.y = Math.max(.001, gk); fLush.visible = gk > .02; fDry.visible = gk < .97; }
    sBag.visible = t >= 26.9 && t < 29.6; grBag.visible = t >= 28.2 && t < 29.9; seedBagJ.visible = t >= 33.9 && t < 35.4 && joL.group.visible; seedBagF.visible = t >= 35.3 && t < 41.8 && VQ[2].group.visible;
    // the evening lamp by Jacob's bed
    { const lk = smooth(51.5, 54.0, t) * (1 - smooth(59.7, 60.1, t)), fl = .9 + .07 * Math.sin(t * 13.1) + .04 * Math.sin(t * 23.7 + 1); bedL.intensity = 1.3 * lk * fl; lampGl.material.opacity = .5 * lk * fl; lampG2.material.opacity = .55 * lk * fl; lampGl.visible = lampG2.visible = lk > .01; }
    // the star dome comes with the dusk
    { const so = ON(t, 54.5, 57.5, 59.6, 60.0); stars.group.visible = so > .004; stars.update(t, so, .38, .6 + .0035 * t, cam || new THREE.Vector3()); }
    // dust over the granary yard in the famine
    dust.update(t, .8 * ON(t, 23.6, 24.6, 31.4, 32.4), [3.8, .3, 1.8]); dustR.update(t, 0, [8, .3, -5]);
    // the flock and the livestock
    SHP.forEach(o => { const p = kp(t, o.keys), hd = hdgAt(o.keys, t), grp = o.s.group, k = o.ap ? Math.max(.001, smooth(o.ap, o.ap + .8, t)) : 1, on = (o.show ? o.show(t) : true) && k > .01; grp.visible = on; if (!on) return;
      grp.scale.setScalar(o.sc * k); grp.position.set(p.x, gAt(p.x, p.z) - .02, p.z); grp.rotation.y = hd - Math.PI / 2; walkLegs(o.s.legs, t + o.i * .7, 7, p.mv ? .4 : 0); });
    bedL.visible = true;
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const PHAR = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.6, [9, 3.0, -5], .5, '#ffcf9a', FD, 14];
  const DRY = ['#c8c0b0', '#6a5848', 1.0, '#ffe0b0', 2.8, [9, 3.6, -5], .5, '#ffe0b0', FD, 14];
  const HAZE = ['#c8b8a8', '#6a5848', .98, '#ffd0a0', 2.1, [9, 3.6, -5], .5, '#e8c8a0', FD, 14];
  const SUNSET = ['#a0a0c8', '#5a4a48', .95, '#ff9a58', 2.1, [-10, 2.2, 4], .5, '#ffc890', [8, 4, 6], 14];
  const DUSK = ['#6a78b0', '#3a3448', .85, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [8, 3, 6], 14];
  const NIGHT = ['#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.4, [-9, 6, 6], .45, '#ffc890', [-8, 4, 8], 14];
  const DAWN = ['#5a5c94', '#2e2a40', .78, '#a8a4d8', 1.2, [-9, 4, 6], .45, '#ffb078', [8, 3, 6], 14];
  const MORN = ['#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const light = [Dk(0, ...PHAR), Dk(9.4, ...PHAR), Dk(9.9, ...MORN), Dk(12.4, ...MORN), Dk(12.9, ...PHAR), Dk(23.8, ...PHAR), Dk(24.6, ...HAZE), Dk(31.4, ...DRY), Dk(35.0, ...DRY), Dk(38.0, ...GOLD), Dk(41.0, ...GOLD), Dk(41.6, ...MORN), Dk(46.4, ...MORN), Dk(47.0, ...GOLD), Dk(49.6, ...GOLD), Dk(53.0, ...SUNSET), Dk(56.0, ...DUSK), Dk(59.6, ...DUSK), Dk(60.1, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#7a98c0', '#f8dcb0']], [24.0, ['#7a98c0', '#f8dcb0']], [25.2, ['#9aa0b0', '#ecd0a8']], [31.4, ['#9aa0b0', '#ecd0a8']], [36.0, ['#6a8ec8', '#f8d4a0']], [46.4, ['#6a8ec8', '#f8d4a0']], [47.2, ['#5a86c4', '#f6c890']], [49.6, ['#5a86c4', '#f6c890']], [53.0, ['#3a56a4', '#f08a62']], [56.0, ['#141e4c', '#6a4a70']], [59.6, ['#141e4c', '#6a4a70']], [60.1, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL, bedL], state };
}
