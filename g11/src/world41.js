// Episode 41: Genesis 41 (NRSV-CE). Two years later Pharaoh dreams by the Nile: seven sleek, fat cows come up out of the river and feed on the reed grass, then seven ugly, gaunt cows come up after them and eat the fat ones (41:1-4); he dreams again: seven plump ears of grain on one stalk, then seven thin ears blighted by the east wind that swallow the plump ones (41:5-7); in the morning his spirit is troubled and none of the wise men of Egypt can interpret (41:8);
// the cupbearer remembers Joseph (41:9-13); Joseph is brought hurriedly from the dungeon (41:14) and says it is not in him, God will give Pharaoh a favourable answer (41:15-16); he explains: seven years of plenty, then seven of famine (41:25-30), advises a store of grain in the good years (41:33-36); Pharaoh asks whether anyone like him can be found, one in whom is the spirit of God (41:38), and sets him over Egypt (41:41), gives him the signet ring, fine linen and a gold chain (41:42); Joseph is thirty years old (41:46);
// he stores the grain of the plenty (41:47-49); before the famine his son Ephraim is born: God has made me fruitful in the land of my affliction (41:52); the famine comes and all lands come to Egypt for grain (41:54-57). Cinematic interpretation: the dream pictures, the court of the house, the four unnamed wise men, the granary yard and its workers, the fields turning dry, the queue on the road, who stands where, the light (dream dawn, morning, golden hour, dusty haze).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep, makeQuad, makeCamel, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { makeBird } from './fauna6.js';
import { LK } from './lights.js';
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
const FLATS = [[CAMPC[0], CAMPC[1], .31, 4.8], [CITY[0], CITY[1], .33, 4.9], [EAST[0] + .6, EAST[1] - .6, .32, 3.2], [SEIR[0], SEIR[1], .98, 3.2], [HOR[0], HOR[1], .36, 2.4], [JC[0], JC[1], .31, 2.4]];
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
  { const b = new GB(R); for (let k = 0; k < 44; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .06); }
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
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);
  const CLOUD = [[0, '#f0d4a8'], [50, '#f0d4a8'], [52, '#e8c8a0'], [56, '#e8c8a0'], [57.5, '#d8c4a8'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];
  const CEM = [[0, '#6a5848'], [56, '#6a5848'], [57.5, '#6a5c4a'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];
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

  // ---- the people. Joseph keeps the face and body of Genesis 37, 39 and 40 (seed 930): the plain tunic of the prison, then fine linen (41:42). Pharaoh and the cupbearer are the figures of Genesis 40 (seeds 972 and 970). The four wise men, the workers and the people of the queue are new, unnamed figures
  const joN = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', sash: '#6a3a1a', seed: 930 }, .44);
  const joL = person(rng(930), { pants: '#efe6d0', top: '#f4ecd8', skin: '#c58c60', hair: '#2a1a10', sash: '#d8b048', seed: 930 }, .44);
  const cup = person(rng(970), { pants: '#e8dcc0', top: '#7a3a5a', skin: '#b98a62', hair: '#1a1410', sash: '#d8b048', seed: 970 }, .43);
  const pha = person(rng(972), { pants: '#efe6d0', top: '#f2ead6', skin: '#b98a62', hair: '#1a1410', cloth: '#2e5a9a', mantle: '#c9a15a', sash: '#d8b048', seed: 972 }, .5);
  { const b = new GB(rng(973)); b.box('#d8aa48', [0, 1.1, 0], [.23, .05, .23], [0, 0, 0], .008); b.box('#e8c458', [0, 1.145, .115], [.03, .07, .03], [0, 0, 0], .004); b.box('#d8aa48', [0, 1.14, -.115], [.2, .04, .02], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pha.group.add(m); }
  const mkSage = (seed, top, skin, beard, cloth) => person(rng(seed), { pants: '#e0d4b8', top, skin, hair: '#2a1a10', beard, cloth, sash: '#8a6a3a', seed }, .45);
  const sg = [mkSage(960, '#4a6a9a', '#b98a62', '#3a2a1a', '#efe6d0'), mkSage(961, '#8a5a3a', '#a8714a', null, '#e0d4b8'), mkSage(962, '#5a7a5a', '#c58c60', '#6a5a4a', '#d8ccb0'), mkSage(963, '#7a4a6a', '#9a6a44', null, '#efe6d0')];
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  const WKC = [['#9a6a44', '#c8a878', '#a8714a'], ['#6a7a5a', '#d8c8a0', '#b98a62'], ['#8a5a3a', '#e0d0b0', '#9a6a44'], ['#7a6a8a', '#d0c0a0', '#c58c60']];
  const wk = WKC.map(([top, pants, skin], i) => person(rng(940 + i), { pants, top, skin, hair: '#2a1a10', sash: '#6a4a2a', seed: 940 + i }, .42));
  const QC = [['#a8714a', '#c8b08a', '#b98a62'], ['#6a5a7a', '#d8ccb0', '#c58c60'], ['#8a6a3a', '#cfc2a0', '#a8714a'], ['#7a8a6a', '#d8c8a8', '#9a6a44'], ['#9a5a4a', '#e0d4b8', '#b98a62'], ['#5a6a8a', '#d0c4a4', '#c58c60'], ['#8a7a5a', '#d8ccb0', '#a8714a']];
  const qp = QC.map(([top, pants, skin], i) => person(rng(1000 + i), { pants, top, skin, hair: '#2a1a10', beard: i % 3 === 1 ? '#3a2a1a' : null, cloth: i % 2 ? '#d8ccb0' : null, sash: '#6a4a2a', seed: 1000 + i }, .4 + .008 * i));
  const dnk = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); s.group.scale.setScalar(.55); g.add(s.group); return s; });
  const ALLP = [joN, joL, cup, pha, ...sg, gu1, gu2, ...wk, ...qp]; ALLP.forEach(o => g.add(o.group));
  // ---- Joseph's gold chain (41:42) and the baby of 41:52 ride on the linen figure and are shown on their shots
  const chainG = new THREE.Group(); { const b = new GB(rng(791)), N = 20; for (let k = 0; k < N; k++) { const a = k / N * TAU, s = Math.sin(a), fr = s > 0 ? s * s : 0; b.box(k % 2 ? '#e8c040' : '#d8aa30', [Math.cos(a) * .17, .925 - .17 * fr, s * .17], [.038, .03, .038], [0, -a, 0], .003); }
    b.box('#f2ce50', [0, .735, .175], [.05, .06, .02], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; chainG.add(m); chainG.visible = false; joL.group.add(chainG); }
  const babyG = new THREE.Group(); { const b = new GB(rng(790)); b.box('#efe6d4', [0, 0, 0], [.3, .12, .14], [0, 0, 0], .006); b.box('#d8c8a8', [-.02, .05, 0], [.26, .03, .15], [0, 0, 0], .004); b.add(G.ico0, '#d9a073', [.15, .02, .02], [.07, .07, .07], [0, 0, 0], .003); b.add(G.ico0, '#2a1a10', [.15, .06, 0], [.06, .035, .06], [0, 0, 0], .003);
    babyG.add(new THREE.Mesh(b.build(), lam)); babyG.position.set(0, .6, .3); babyG.visible = false; joL.group.add(babyG); }
  // ---- props: Pharaoh's seat at the portico, the signet ring (41:42), sacks of grain
  const thr = new THREE.Group(); { const b = new GB(rng(385)), x = -6.02, z = -.6, y = hC(x, z) + .03;
    b.box('#bfa87c', [x, y + .01, z], [.44, .02, .44], [0, 0, 0], .004); b.box('#8a6a3a', [x, y + .08, z], [.27, .12, .25], [0, 0, 0], .004); b.box('#2e5a9a', [x + .005, y + .15, z], [.25, .025, .23], [0, 0, 0], .003);
    b.box('#8a6a3a', [x - .115, y + .3, z], [.03, .3, .25], [0, 0, 0], .004); b.box('#d8aa48', [x - .118, y + .46, z], [.036, .028, .27], [0, 0, 0], .003); for (const dz of [-.115, .115]) b.box('#8a6a3a', [x, y + .2, z + dz], [.24, .03, .03], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; thr.add(m); g.add(thr); }
  const RINGP = new THREE.Mesh(new THREE.TorusGeometry(.016, .0055, 6, 12), new THREE.MeshLambertMaterial({ color: 0xe8c040, emissive: 0x7a5a10 })); RINGP.visible = false; g.add(RINGP);
  const sackB = (b, x, y, z, ry = 0) => { b.add(G.ico0, '#d8c9a0', [x, y + .045, z], [.06, .05, .09], [0, ry, 0], .004); b.box('#a8946a', [x, y + .1, z], [.03, .02, .03], [0, ry, 0], .002); };
  const sackStack = (b, x, z, ry = 0) => { const y = hC(x, z); for (const [dx, dz] of [[-.07, -.1], [.07, -.1], [-.07, .1], [.07, .1], [0, 0]]) sackB(b, x + dx, y, z + dz, ry); for (const [dx, dz] of [[0, -.1], [0, .1]]) sackB(b, x + dx, y + .08, z + dz, ry); sackB(b, x, y + .16, z, ry); };
  const sackCourt = new THREE.Group(); { const b = new GB(rng(792)); sackStack(b, -4.15, -1.45); sackStack(b, -4.28, -1.18, .4); sackB(b, -4.05, hC(-4.05, -1.2), -1.2, .8); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; sackCourt.add(m); g.add(sackCourt); }
  const SCK = [0, 1, 2, 3].map(i => { const b = new GB(rng(795 + i)); sackB(b, 0, -.04, 0); const m = new THREE.Mesh(b.build(), lam); m.visible = false; g.add(m); return m; });
  // ---- the dreams: seven fat cows and seven gaunt ones (41:2-4) come up out of the Nile and out onto the bank; two stalks, one with seven plump ears and one with seven thin ones (41:5-7)
  const FATC = ['#9a5a34', '#b87e4c', '#cfa774', '#8a4a2c', '#c0885a', '#a8683c', '#d4b690'];
  const mkFat = i => makeQuad({ rn: rng(700 + i), len: .56, h: .23, w: .21, legL: .17, legW: .048, col: FATC[i % 7], col2: '#ecdcbc', neck: [.14, .85, .11], head: [.17, .11, .1], horns: true, ears: false, legCol: '#5a4430' });
  const mkThin = i => { const s = makeQuad({ rn: rng(720 + i), len: .56, h: .15, w: .12, legL: .21, legW: .028, col: '#8c7c68', col2: '#6a5e4e', neck: [.17, .95, .06], head: [.19, .12, .07], horns: true, ears: false, legCol: '#4a3e32' });
    const b = new GB(rng(740 + i)); for (let k = 0; k < 6; k++) for (const sz of [-1, 1]) b.box('#4e4234', [-.2 + k * .08, .285, sz * .062], [.012, .1, .006], [0, 0, 0], .003); s.group.add(new THREE.Mesh(b.build(), lam)); return s; };
  const COWS = [], FZ = i => -1.7 + i * .37;
  for (let i = 0; i < 7; i++) { const z = FZ(i), c = mkFat(i); g.add(c.group); COWS.push({ q: c, i, fat: true, keys: route(0, [RV(z) + .35, z]).wait(.06 * i + .05).go(.85, [-1.7 - .1 * (i % 2), z]).wait(9).keys }); }
  for (let i = 0; i < 7; i++) { const z = FZ(i) + .17, c = mkThin(i); g.add(c.group); COWS.push({ q: c, i, fat: false, keys: route(0, [RV(z) + .1, z]).wait(.9 + .1 * i).go(.9, [-1.3 - .12 * (i % 2), z]).wait(9).keys }); }
  const SKP = [[-2.06, 2.22], [-1.8, 2.26]];
  const mkStalk = plump => { const gr = new THREE.Group(), b = new GB(rng(plump ? 761 : 762)), e = new GB(rng(plump ? 763 : 764)), H = .78;
    for (let k = 0; k < 7; k++) b.box(k % 2 ? '#8a9a4a' : '#7c8c40', [Math.sin(k * .8) * .004, (k + .5) * H / 7, 0], [.034 - k * .0016, H / 7 + .01, .034 - k * .0016], [0, 0, 0], .004);
    for (let k = 0; k < 3; k++) { const a = k * 2.1, yy = .12 + k * .13; b.box('#6f9a42', [Math.cos(a) * .13, yy + .05, Math.sin(a) * .13], [.26, .012, .05], [0, -a, .45], .006); }
    for (let k = 0; k < 7; k++) { const y = .3 + k * .068 - .5, ra = k * 2.4, x = Math.cos(ra) * .05, z = Math.sin(ra) * .05;
      if (plump) { e.add(G.ico0, k % 2 ? '#e0b040' : '#d4a434', [x, y, z], [.052, .105, .052], [Math.sin(ra) * .25, 0, -Math.cos(ra) * .25], .004); for (let m = 0; m < 3; m++) e.box('#f0d078', [x + Math.cos(ra) * (m - 1) * .012, y + .1, z + Math.sin(ra) * (m - 1) * .012], [.004, .08, .004], [0, 0, (m - 1) * .1], .001); }
      else { e.add(G.ico0, k % 2 ? '#a89a76' : '#968a68', [x, y - .01, z], [.032, .075, .032], [Math.sin(ra) * .6, 0, -Math.cos(ra) * .6], .004); e.box('#5a4e38', [x, y + .03, z], [.012, .02, .012], [0, 0, 0], .001); } }
    const stem = new THREE.Mesh(b.build(), lam), ears = new THREE.Mesh(e.build(), lam); ears.position.y = .5; stem.castShadow = ears.castShadow = true; gr.add(stem, ears); return { group: gr, stem, ears }; };
  const stA = mkStalk(true), stB = mkStalk(false);
  stA.group.position.set(SKP[0][0], hC(SKP[0][0], SKP[0][1]) - .01, SKP[0][1]); stB.group.position.set(SKP[1][0], hC(SKP[1][0], SKP[1][1]) - .01, SKP[1][1]); g.add(stA.group, stB.group);
  // ---- the fields of the plenty and of the famine (41:29-31, 41:54): the same rows, green and gold, then dry
  const FLD = [[-3.1, 2.7, -.95, 5.7], [-7.4, 3.4, -4.7, 5.9], [2.55, 4.7, 4.85, 6.8]];
  const mkField = lush => { const b = new GB(rng(lush ? 771 : 772)), rr = rng(lush ? 773 : 774);
    for (const [x0, z0, x1, z1] of FLD) { const nr = Math.round((x1 - x0) / .17), nz = Math.round((z1 - z0) / .15);
      for (let r = 0; r < nr; r++) for (let k = 0; k < nz; k++) { const x = x0 + (r + .5) * (x1 - x0) / nr + (rr() - .5) * .03, z = z0 + (k + .5) * (z1 - z0) / nz + (rr() - .5) * .04, y = hC(x, z);
        if (lush) { const h = .17 + rr() * .1; b.box(pk(rr, ['#6a9a3e', '#5f8f38', '#78a444', '#8aa84a']), [x, y + h / 2, z], [.07, h, .07], [(rr() - .5) * .2, rr() * 3, (rr() - .5) * .2], .01); if (rr() < .55) b.box(pk(rr, ['#d8b848', '#c9a83c']), [x, y + h + .012, z], [.05, .04, .05], [0, rr() * 3, 0], .005); }
        else { const h = .035 + rr() * .045; b.box(pk(rr, ['#b8a478', '#a89466', '#c4b088']), [x, y + h / 2, z], [.06, h, .06], [(rr() - .5) * .5, rr() * 3, (rr() - .5) * .5], .01); } } }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = lush; m.receiveShadow = true; ca.add(m); return m; };
  const fLush = mkField(true), fDry = mkField(false);
  // ---- the granary yard east of the river: three round granaries, a low wall, sacks, and two heaps of grain that grow (41:47-49)
  const SILOS = [[3.05, 3.02], [3.62, 3.12], [3.32, 3.78]], PILES = [[1.95, 2.95], [1.98, 3.55]];
  { const b = new GB(rng(780)), rr = rng(781), cols = ['#cdb48c', '#c2a67a', '#d4c29c'];
    wallB(b, rr, 2.2, 2.5, 4.3, 2.5, .13, .09, cols); wallB(b, rr, 4.3, 2.5, 4.3, 4.4, .13, .09, cols); wallB(b, rr, 4.3, 4.4, 2.2, 4.4, .13, .09, cols);
    for (const [x, z] of SILOS) { const y = hC(x, z); b.add(G.cylT, '#c8b088', [x, y, z], [.26, .52, .26], [0, 0, 0], .02); b.box('#b09a70', [x, y + .26, z], [.54, .03, .5], [0, 0, 0], .01); b.add(G.ico1, '#b8a078', [x, y + .52, z], [.27, .17, .27], [0, 0, 0], .02); b.box('#2a1c12', [x - .255, y + .1, z], [.03, .13, .1], [0, 0, 0], .004); b.box('#2a1c12', [x, y + .68, z], [.08, .03, .08], [0, 0, 0], .004); }
    sackStack(b, 3.95, 2.78); sackStack(b, 4.05, 3.9, .5); sackStack(b, 2.75, 4.15, -.4); sackB(b, 3.0, hC(3.0, 3.5), 3.5, .5); sackB(b, 3.7, hC(3.7, 3.5), 3.5, 1.1);
    ca.add(meshOf(b)); }
  const pileM = PILES.map(([x, z], i) => { const b = new GB(rng(783 + i)); b.add(G.ico1, '#d8aa44', [0, .09, 0], [.34, .2, .3], [0, i, 0], .012); b.add(G.ico0, '#c8982c', [.12, .06, .1], [.18, .1, .16], [0, 1, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z), z); m.castShadow = true; ca.add(m); return m; });

  let SID = '';
  const headingOf = (a, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null; return fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); };
  const heldAt = (a, fw, side, h, tt, y0 = 0) => { const p = kp(tt, a.keys), hd = headingOf(a, tt); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, gAt(p.x, p.z) + y0 + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const aU = k => k > .001 ? { a0x: -2.7 * k, a1x: -.3 * k, a0z: -.35 * k, a1z: .1 * k } : {}, aQ = k => k > .001 ? { a1x: -1.4 * k, a1z: .1 * k } : {};
  const TH = [-6.02, -.6], JP = [-4.95, -.6], PS = [-5.4, -.6], CQ = [-4.05, -.62], SG = [[-4.5, -1.75], [-4.25, -1.15], [-4.25, -.05], [-4.5, .5]];
  // ---- shot 1 (0-4.7): Pharaoh stands by the Nile (41:1); the cows come up out of the river (see COWS)
  const aP0 = still(pha, [-2.4, .1], 0, 4.7, { face: () => Math.PI / 2 - .2, ex: t => mixA(aO(.2 * ON(t, 3.0, 3.6, 4.2, 4.7))) });
  // ---- shots 3-4 (9.4-16.2): the court; the wise men stand, no one can interpret (41:8); the cupbearer steps forward (41:9)
  SG.forEach((p, i) => still(sg[i], p, 9.4, 43.5, { face: () => toward(p[0], p[1], TH), ex: t => mixA(...[
    [aO(.5 * ON(t, 10.4, 11.0, 12.2, 12.8)), aF(.3 * ON(t, 33.0, 33.6, 36.0, 36.6))], [{ lx: .14 * ON(t, 10.6, 11.4, 12.6, 13.2) }, aO(.3 * ON(t, 34.0, 34.6, 36.4, 37.0))], [aF(.45), { lx: .05 * ON(t, 38, 38.6, 40, 40.6) }], [aO(.4 * ON(t, 11.6, 12.2, 12.8, 13.1)), aF(.35 * ON(t, 29.4, 30, 31.6, 32.2))]][i]) }));
  const aC1 = act(cup, route(9.4, CQ).wait(13.2).go(.55, [-5.2, -.95]).wait(16.2).keys, { sp: 6, show: W_(9.4, 16.2), face: (t, p) => p.mv ? null : toward(p.x, p.z, TH), ex: t => mixA(aF(.55 * ON(t, 15.1, 15.6, 16.1, 16.3))) });
  const aC2 = still(cup, [-4.1, -1.55], 16.2, 43.5, { face: () => toward(-4.1, -1.55, TH), ex: t => mixA(aF(.5)) });
  const aP1 = still(pha, TH, 9.4, 36.1, { y: () => .06, face: () => Math.PI / 2, ex: t => mixA({ lx: .05 * ON(t, 11, 11.6, 12.6, 13.2) }, aO(.4 * ON(t, 11.8, 12.4, 12.8, 13.1)), aF(.35 * ON(t, 17.0, 17.6, 19, 19.6)), aO(.5 * ON(t, 33.6, 34.2, 35.2, 35.8))) });
  // ---- shot 5 (16.0-19.6): Joseph is brought hurriedly out of the dungeon between two guards (41:14)
  act(joN, route(16.0, [-3.3, -4.05]).go(.5, [-3.3, -3.3]).go(.55, [-3.3, -2.3]).keys, { sp: 7, show: W_(16.0, 19.6), face: (t, p) => p.mv ? null : headZ(0, 1) });
  act(gu1, route(16.0, [-3.68, -3.45]).wait(17.0).go(.55, [-3.62, -2.35]).keys, { sp: 7, show: W_(16.0, 19.6), face: (t, p) => p.mv ? null : headZ(0, 1) });
  act(gu2, route(16.0, [-2.92, -3.45]).wait(17.0).go(.55, [-2.98, -2.35]).keys, { sp: 7, show: W_(16.0, 19.6), face: (t, p) => p.mv ? null : headZ(0, 1) });
  // ---- shots 6-11 (19.6-43.5): Joseph before Pharaoh: not I, God will give an answer (41:16); the store (41:33-36); Pharaoh stands and sets him over Egypt (41:38-41); the ring (41:42)
  const aJb = still(joN, JP, 19.6, 43.5, { face: () => -Math.PI / 2, ex: t => mixA(aF(.3 * ON(t, 19.6, 20.2, 20.8, 21.2)), aU(ON(t, 21.3, 21.9, 23.1, 23.7)), aO(.5 * ON(t, 29.0, 29.5, 31.6, 32.0)), aF(.5 * ON(t, 32.6, 33.2, 35.6, 36.1)), { lx: .1 * ON(t, 37.0, 37.6, 39.4, 39.9) }, aQ(ON(t, 40.8, 41.1, 42.0, 42.5))) });
  const aP2 = act(pha, route(36.1, TH).go(.5, PS).wait(43.5).keys, { sp: 6, show: W_(36.1, 43.5), y: t => .06 * (1 - smooth(36.1, 36.9, t)), face: () => Math.PI / 2, ex: t => mixA(aP(ON(t, 38.3, 38.8, 39.7, 40.0)), aP(ON(t, 40.3, 40.8, 41.9, 42.4))) });
  // ---- shots 12 and 14 (43.5-47.4, 51.6-55.7): Joseph in fine linen with the gold chain, then with his son at the portico
  const aL1 = still(joL, [-5.0, -.6], 43.5, 47.4, { face: () => 1.12, ex: t => mixA(aF(.3), { lx: .03 * ON(t, 44.4, 45, 46.4, 47)}) });
  const aL3 = still(joL, [-5.7, -.75], 51.6, 55.7, { face: () => 1.05, ex: t => mixA(aF(1.1), { lx: .06 }) });
  // ---- shot 13 (47.4-51.6): the granary yard: workers carry sacks from the heap to the granaries (41:48-49); Joseph oversees
  const aL2 = still(joL, [3.95, 3.45], 47.4, 51.6, { face: () => -Math.PI / 2 - .05, ex: t => mixA(aP(ON(t, 48.9, 49.4, 50.3, 50.8))) });
  const DOOR = SILOS.map(([x, z]) => [x - .36, z]), WK = [[0, 0], [1, 1], [0, 2], [1, 1]].map(([pl, sl], i) => { const P0 = [PILES[pl][0] + .3, PILES[pl][1] + (i % 2 ? .12 : -.1)], D0 = DOOR[sl], r = route(47.4 - .5 * i, P0); for (let k = 0; k < 4; k++) r.go(.5, k % 2 ? P0 : D0); r.wait(51.6);
    return { a: act(wk[i], r.keys, { sp: 7, show: W_(47.4, 51.6), face: (t, p) => p.mv ? null : headZ(D0[0] - P0[0], D0[1] - P0[1]), ex: () => mixA(aF(.5)) }), P0, D0 }; });
  // ---- shot 15 (55.7-61.7): the famine: a line of people walks the road toward the granaries, two with donkeys (41:54-57)
  const roadZ = x => { for (let i = 0; i < PATH.length - 1; i++) { const a = PATH[i], b = PATH[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return x < PATH[0][0] ? PATH[0][1] : PATH[PATH.length - 1][1]; };
  const QA = qp.map((f, i) => { const x0 = .2 - i * .72, off = (i % 2 ? .12 : -.1), r = route(53.0, [x0, roadZ(x0) + off]); alongE(r, .5, off, x0 + .05, 2.0); r.go(.5, [2.45, 2.45]).go(.5, [2.0, 3.0]).wait(61.7); return act(f, r.keys, { sp: 6, show: W_(55.7, 61.7), ex: () => mixA(i % 3 === 0 ? aF(.5) : {}) }); });
  const DNA = [2, 5].map(i => { const q = QA[i], ks = q.keys.map(([t, x, z, e]) => [t + .9, x - .35, z + .12, e]); return ks; });

  function update(t, camera, sid) {
    SID = sid;
    const cam = camera && camera.position, MOOD = { cows: 110, ears: 110 }, tc = MOOD[sid] ?? t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    const dreamS = sid === 'cows' || sid === 'ears', night = dreamS ? .1 : 0;
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5, [1, .5, 2.5]);
    { water.material.color.setRGB(.36, .48, .62); water.material.emissive.setRGB(.18, .25, .31);
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = .6 * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    townG.visible = true;
    // ---- the actors: every one is a pure function of time (and of the shot)
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return;
      const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // keep the close-ups clear: a sage or the cupbearer standing between the camera and the subject is not drawn
    if (camera && camera.userData && camera.userData.T && ['before', 'asks', 'over', 'ring', 'chain', 'store'].includes(sid)) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      [...sg, cup].forEach(f => { if (!f.group.visible) return; const q = f.group.position, px = q.x - C.x, py = q.y + .25 - C.y, pz = q.z - C.z, u = (px * vx + py * vy + pz * vz) / l2;
        if (u > 0 && u < .98) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; if (Math.hypot(dx, dy, dz) < .15 + 1.3 * hw * u) f.group.visible = false; } }); }
    // ---- the cows: seven fat come up out of the river, seven gaunt follow, and the fat ones are gone (41:2-4)
    COWS.forEach(c => { const G_ = c.q.group, on = sid === 'cows'; G_.visible = on; if (!on) return;
      const p = kp(t, c.keys), y = gAt(p.x, p.z), k = c.fat ? Math.max(.001, 1 - smooth(3.7 + .07 * c.i, 4.4 + .07 * c.i, t)) : 1;
      G_.position.set(p.x, y - .02, p.z); G_.rotation.y = hdgAt(c.keys, t) - Math.PI / 2; G_.scale.setScalar(k); walkLegs(c.q.legs, t + c.i, 8, p.mv ? .42 : 0); });
    // ---- the stalks: seven plump ears, then seven thin ones grow beside them and the plump ones are swallowed (41:5-7)
    { const on = sid === 'ears'; stA.group.visible = stB.group.visible = on; const kb = smooth(6.2, 7.4, t);
      stA.ears.scale.setScalar(Math.max(.02, 1 - .97 * smooth(8.0, 9.2, t))); stB.group.scale.set(1, Math.max(.02, kb), 1); stB.ears.scale.setScalar(Math.max(.02, smooth(7.0, 8.0, t))); }
    // ---- the fields: green and gold in the years of plenty, dry once the famine has come (41:29-30, 41:54)
    { const dry = sid === 'years' ? smooth(26.6, 27.9, t) : (sid === 'famine' ? 1 : 0); fLush.scale.y = Math.max(.001, 1 - dry); fLush.visible = dry < .98; fDry.visible = true; }
    // ---- the granary: the heaps grow while the workers carry sacks (41:47-49)
    { const gk = .3 + .7 * smooth(47.4, 51.6, t); pileM.forEach(m => m.scale.setScalar(gk));
      SCK.forEach(m => m.visible = false);
      if (sid === 'granaries') WK.forEach((w, i) => { const p = kp(t, w.a.keys), to = (p.vx * (w.D0[0] - w.P0[0]) + p.vz * (w.D0[1] - w.P0[1])) > 0; if (!p.mv || !to) return; const h = heldAt(w.a, .1, 0, .3, t); SCK[i].visible = true; SCK[i].position.set(h[0], h[1], h[2]); SCK[i].rotation.y = h[3]; }); }
    // ---- the donkeys of the queue
    dnk.forEach((d, i) => { const on = sid === 'famine' && t >= 55.7; d.group.visible = on; if (!on) return; const ks = DNA[i], p = kp(t, ks); d.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); d.group.rotation.y = hdgAt(ks, t) - Math.PI / 2; walkLegs(d.legs, t + i, 7, p.mv ? .4 : 0); });
    // ---- the signet ring passes from Pharaoh's hand to Joseph's (41:42); the chain and the baby show on their shots
    { RINGP.visible = sid === 'ring';
      if (RINGP.visible) { const a = heldAt(aP2, .2, -.09, .37, t), b = heldAt(aJb, .17, .09, .35, t), k = smooth(40.9, 41.3, t); RINGP.position.set(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)); RINGP.rotation.set(Math.PI / 2, 0, 0); } }
    chainG.visible = t >= 44.65; chainG.scale.setScalar(.2 + .8 * smooth(44.65, 45.15, t)); babyG.visible = sid === 'son'; sackCourt.visible = sid === 'store';
    dust.update(t, sid === 'famine' ? .9 : .15, [0, 0, 0]); dustR.update(t, sid === 'famine' ? .7 : 0, [-1.4, .3, 1.6]);
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const MORN = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.5, [9, 3.4, -5], .5, '#ffcf9a', FD, 14];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const HAZE = ['#c8b8a8', '#6a5848', .98, '#ffd0a0', 2.1, [9, 3.6, -5], .5, '#e8c8a0', FD, 14];
  const light = [Dk(0, ...MORN), Dk(51.0, ...MORN), Dk(52.0, ...GOLD), Dk(55.2, ...GOLD), Dk(56.4, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#6a8ec8', '#f8d4a0']], [50, ['#6a8ec8', '#f8d4a0']], [52, ['#5a86c4', '#f6c890']], [55.2, ['#5a86c4', '#f6c890']], [56.4, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL], state };
}
