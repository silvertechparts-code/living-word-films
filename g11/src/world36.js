// Episode 36: Genesis 36, the family line of Esau (that is, Edom). Esau took his wives from the women of Canaan and from Ishmael's daughter Basemath, and they bore him sons (36:2-5); his possessions were too many for him and Jacob to live together, so he took his wives, children and livestock and went to the hill country of Seir, away from his brother Jacob (36:6-8).
// The chapter then lists his descendants, who became chiefs of clans in Edom (36:9-19), the people who lived in Seir before him and their clans (36:20-30), the kings who ruled in Edom before any king ruled over the Israelites (36:31-39) and the clans of Esau by their families and the places where they lived (36:40-43).
// Cinematic interpretation: the camp on the plain, the herds, the caravan on the road, the red hill country, the tents that rise one after another on the hill, the small camp of the people who lived there before him, the walled town with its lit windows for the kings of Edom, the fires and the night. The text gives no landscape and no thoughts, and no names are spoken in the film.
// The film shows no king and no clan chief by name and does not count the kings or the clans; the wives and sons are shown without names, and the narration does not reconcile the wives' names with Genesis 26:34 and 28:9.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep, makeQuad, makeCamel, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
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
  { const m = new THREE.Mesh(roundTreeGeo(2.5, R, ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']), lam); m.position.set(OAK[0], hC(OAK[0], OAK[1]) - .02, OAK[1]); m.castShadow = true; m.rotation.y = 1.3; ca.add(m); }
  // ---- Jacob's camp north of the road: three tents, who stays where he was
  [[-3.9, -4.7, '#cdb48c', .3], [-2.7, -5.5, '#c2a67a', -.2], [-2.4, -4.0, '#d4c29c', .5]].forEach(([x, z, c, ry], i) => { const m = tentMesh(rng(560 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); });
  // ---- Esau's camp in the hill country of Seir (36:8): his own tent in the middle, the tents of the clans around it, raised one after another
  const SA = [-2.9, -1.8, -.55, .65, 1.95], SOFF = SA.map(an => [2.4 * Math.cos(an), 2.4 * Math.sin(an)]);
  const SEIRT = [[SEIR[0], SEIR[1], '#c2a67a', 0, .8, 31.0, Math.atan2(.56, .83)], ...SOFF.map(([dx, dz], i) => [SEIR[0] + dx, SEIR[1] + dz, ['#d4c29c', '#cdb48c', '#c9a67a', '#d4c29c', '#c2a67a'][i], Math.atan2(-dx, -dz), .62, [32.6, 33.8, 35.0, 36.2, 37.4][i]])];
  const STENTS = SEIRT.map(([x, z, c, ry, sc, ta], i) => { const m = tentMesh(rng(570 + i), c, sc); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = i === 0 ? SEIRT[0][6] : ry; m.userData = { ta, sc }; ca.add(m); return m; });
  // ---- the people who lived in Seir before him (36:20-30): five darker tents in the valley
  const HORT = [[HOR[0] - .9, HOR[1] - 1.1, '#8a6a4a', .4], [HOR[0] + .8, HOR[1] - 1.3, '#7a5a3e', -.2], [HOR[0] + 1.3, HOR[1] + .3, '#8a6a4a', .8], [HOR[0] - 1.4, HOR[1] + .5, '#7a5a3e', -.5], [HOR[0] + .1, HOR[1] + 1.4, '#8a6a4a', .1]];
  const HTENTS = HORT.map(([x, z, c, ry], i) => { const m = tentMesh(rng(580 + i), c, .78); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); return m; });
  // ---- fires: a small ring of stones, a glow and a hot core; lit by the time they are given
  const FIRES = [];
  const fire = (x, z, a, b, big = 1) => { const y = hC(x, z), bb = new GB(rng(600 + FIRES.length)); for (let k = 0; k < 6; k++) { const an = k * 1.047 + .3; bb.add(G.ico0, '#6a5e52', [Math.cos(an) * .13 * big, .02, Math.sin(an) * .13 * big], [.045 * big, .035 * big, .045 * big], [k, an, 0], .03); }
    const m = meshOf(bb); m.position.set(x, y, z); ca.add(m);
    const s = spriteGlow(x, y + .22 * big, z, .62 * big, 0xff9a48, 0), s2 = spriteGlow(x, y + .2 * big, z, .22 * big, 0xfff0c0, 0); g.add(s, s2); FIRES.push({ s, s2, a, b, ph: FIRES.length * 1.7 }); };
  [[SEIR[0] + .2, SEIR[1] + 2.0, 37.6, 40.6], [SEIR[0] - 1.6, SEIR[1] + .6, 38.2, 41.0], [SEIR[0] + 1.5, SEIR[1] - .5, 38.8, 41.4], [SEIR[0] + .5, SEIR[1] - 1.6, 39.4, 42.0]].forEach(([x, z, a, b]) => fire(x, z, a, b, 1.1));
  [[HOR[0] - .1, HOR[1] - .1, 40.4, 43.0], [HOR[0] + .7, HOR[1] + .8, 41.0, 43.6], [HOR[0] - .9, HOR[1] + 1.4, 41.6, 44.2]].forEach(([x, z, a, b]) => fire(x, z, a, b, 1.0));
  const seirL = new THREE.PointLight(0xffa458, 0, 6.0, 1.5); seirL.position.set(SEIR[0] - .1, hC(SEIR[0], SEIR[1]) + 1.1, SEIR[1] + .6);
  const horL = new THREE.PointLight(0xffa458, 0, 5.0, 1.5); horL.position.set(HOR[0], hC(HOR[0], HOR[1]) + 1.0, HOR[1] + .3);
  // ---- extra sheep: Esau's herd grows (36:7), and the flock that stays with Jacob
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const GOATS = [0, 1].map(i => place(mkGoat(740 + i), 0, 0, 0)), WHITE = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0)), EXTRA = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => place(makeSheep(rng(720 + i)), 0, 0, 0));
  const donkeys = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); ca.add(s.group); return s; });

  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);
  const CLOUD = [[0, '#e8c8a0'], [12, '#e8d0a8'], [22, '#e8c8a0'], [31, '#e8b898'], [37, '#e0a888'], [40, '#c89a98'], [43, '#6a6a98'], [46, '#4a4a78'], [62, '#4a4a78'], [90, '#4a4a78']];
  const CEM = [[0, '#6a5848'], [31, '#6a5848'], [37, '#5a4a52'], [40, '#4a3a58'], [43, '#3a3a58'], [46, '#22223a'], [62, '#22223a'], [90, '#22223a']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the people. Esau and Jacob are the same models as in Genesis 33 and 35; Esau's wives, children, sons and men, and the people who lived in Seir before him, are new and unnamed
  const jacob = mkJacob(rng(87)), esau = mkEsau(rng(114));
  const WIVES = [mkMaid(rng(201), '#9a4a3a', '#c58c60', '#e0d4bc', '#c9a15a', 901), mkMaid(rng(202), '#4f7a8a', '#b98a62', '#d8cfb4', '#a87a4a', 902), mkMaid(rng(203), '#8a7a4a', '#c08a5e', '#e8dcc4', '#c8a050', 903)];
  const KIDS = [mkKid(rng(210), '#a87a5a', 910, .25, '#c87a50'), mkKid(rng(211), '#6a8a9a', 911, .27, '#c58c60'), mkKid(rng(212), '#9a6a7a', 912, .23, '#c87a50'), mkKid(rng(213), '#7a9a6a', 913, .26, '#c58c60'), mkKid(rng(214), '#c9a15a', 914, .22, '#c87a50')];
  const mkChief = (sd, top, seed, sc) => person(rng(sd), { pants: '#d9ccb0', top, skin: '#c87a50', hair: '#5a2a14', beard: '#5a2a14', sash: '#8a5a2a', seed }, sc);
  const CHIEF = [mkChief(220, '#7a3a26', 920, .46), mkChief(221, '#c9a15a', 921, .44), mkChief(222, '#6a7fa0', 922, .45), mkChief(223, '#8a5a3a', 923, .44), mkChief(224, '#5f8a5a', 924, .43)];
  const MEN = ['#6f8a62', '#9a4a42', '#8a6a4a', '#4f7a8a', '#c9a15a', '#7a5a8a'].map((c, i) => mkHerd(rng(130 + i), c, ['#a8714a', '#b98a62', '#a8714a', '#b98a62', '#c38a5c', '#a8714a'][i], 870 + i, i % 2 ? '#d8ccb0' : '#cdbd98'));
  const HORP = [mkHerd(rng(240), '#6a7a8a', '#b98a62', 940, '#5a4a38'), mkHerd(rng(241), '#7a7a5a', '#a8714a', 941, '#6a5a48'), mkHerd(rng(242), '#8a6a5a', '#c08a5e', 942, '#5a4a38'), mkMaid(rng(243), '#5a6a7a', '#b98a62', '#d8cfb4', '#8a7a4a', 943), mkMaid(rng(244), '#7a6a4a', '#c08a5e', '#e0d4bc', '#a87a4a', 944), mkKid(rng(245), '#6a7a6a', 945, .24, '#b98a62')];
  const JMEN = [mkHerd(rng(250), '#6a7a5a', '#b98a62', 950, '#d8ccb0'), mkHerd(rng(251), '#8a6a4a', '#a8714a', 951, '#cdbd98')];
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacob.group.add(mkStaff()); esau.group.add(mkStaff());
  const ALLP = [jacob, esau, ...WIVES, ...KIDS, ...CHIEF, ...MEN, ...HORP, ...JMEN]; ALLP.forEach(o => g.add(o.group));
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
  const act = (f, keys, o = {}) => { const a = { f, keys, ph: o.ph ?? ACT.length * 1.3, sp: o.sp ?? 7, face: o.face || null, show: o.show || (() => true), ex: o.ex || null }; ACT.push(a); return a; };
  const W_ = (a, b) => t => t >= a && t < b;


  // ---- who goes where. Phases, each with its own cast (shots change at these times by a hard cut):
  // A 0-6.4 Esau at his camp | B 6.4-14.7 his wives and children | C 14.7-21.9 the herds of two houses on one land | D 21.9-31.6 the caravan goes east to Seir | E 31.6-40.0 the clans on the hill | F 40.0-45.8 the people of Seir before him | G 45.8-52.9 the halls of the kings | H 52.9-61.8 the clans and their places at night
  const TB = 6.4, TC = 14.7, TD = 21.9, TE = 31.6, TF = 40.0, TG = 45.8, TH = 52.9, TZ = 61.8;
  const mixA = (...o) => { const r = { a0z: -.1, a1z: .1 }; for (const x of o) for (const k in x) r[k] = (r[k] || 0) + x[k]; return r; };
  const aF = k => k > .001 ? { a0x: -.9 * k, a1x: -.9 * k, a0z: .35 * k, a1z: -.35 * k } : {};      // hands together in front
  const aO = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.95 * k, a1z: .95 * k } : {};        // hands open to the sides
  const aP = k => k > .001 ? { a0x: -1.4 * k, a1x: .2 * k, a0z: -.5 * k, a1z: .1 * k } : {};          // one arm out, pointing
  const toward = (x, z, p) => headZ(p[0] - x, p[1] - z);
  const trek = (r, v, off, dest) => { alongE(r, v, off, -3.0, 3.2); r.go(v, [4.3, 2.7 + off]).go(v, [5.3, 3.9 + off]).go(v, [8.0, 4.7 + .6 * off]).go(v, [9.8, 5.2 + .6 * off]).go(v, dest); return r; };
  const ES = [-4.5, .3];
  // Esau: stands at his camp through A-C, leads the caravan in D, stands in his own camp on the hill after that
  const esauKeys = (() => { const r = route(0, ES).wait(8.0).go(.5, [-4.3, .0]).wait(14.7).go(.6, [-4.5, 1.5]).wait(20.9).go(1.0, [-3.2, 1.1]); trek(r, 1.6, 0, [SEIR[0] - .2, SEIR[1] + 1.25]); r.wait(TZ); return r.keys; })();
  {
    act(esau, esauKeys, { ph: 1, sp: 7, show: () => true,
      face: (t, p) => { if (p.mv) return null; if (t < TB) return headZ(1, .15); if (t < 14.7) return toward(p.x, p.z, t < 10.8 ? [-5.3, .9] : [-5.2, -.6]); if (t < TD) return headZ(1, .5); if (t > TE) return toward(p.x, p.z, [SEIR[0] + .2, SEIR[1] + 1.2]); return null; },
      ex: t => mixA(aO(ON(t, 8.2, 8.8, 9.4, 10.0) + ON(t, 9.6, 10.2, 10.8, 11.4) + ON(t, 11.0, 11.6, 12.4, 13.0)), aP(ON(t, 15.6, 16.4, 18.6, 19.4)), aF(ON(t, 33.2, 33.8, 36.0, 36.8)), { lx: .04 * ON(t, 2, 3, 5, 6) }) }); }
  // Esau's three wives step out of the camp and stand beside him one after another (36:2-3); in D they follow him; on the hill they stand near his tent
  [[WIVES[0], [-6.6, 1.9], 8.0, [-5.3, 1.0]], [WIVES[1], [-7.0, -1.4], 9.5, [-5.2, -.6]], [WIVES[2], [-6.2, -2.2], 10.9, [-3.7, -.6]]].forEach(([f, from, ta, to], i) => {
    const r = route(0, from).wait(ta).go(.8, to).wait(21.7 + .3 * i); trek(r, 1.55, -.5 + .35 * i, [[SEIR[0] - 1.0, SEIR[1] + .5], [SEIR[0] + .6, SEIR[1] + 1.45], [SEIR[0] + 1.2, SEIR[1] + .4]][i]); r.wait(TZ);
    act(f, r.keys, { ph: 2 + i * 1.3, sp: 7, show: W_(TB - .3, TZ), face: (t, p) => { if (p.mv) return null; if (t < TD) return toward(p.x, p.z, ES); if (t > TE) return toward(p.x, p.z, [SEIR[0], SEIR[1] + 2]); return null; }, ex: t => mixA(aF(.35 * ON(t, 11.6, 12.2, 14.4, 15.0))) }); });
  // the children (36:4-5): they run out to their father from 12.2 on, play among the herds, follow the caravan, and play on the hill
  KIDS.forEach((f, i) => { const r = route(0, [-6.4 - .3 * i, 1.6 + .4 * i]).wait(12.0 + .3 * i).go(1.5, [-4.9 + .4 * i, .8 - .35 * i]).wait(15.6).go(1.1, [-5.6 + .7 * i, 2.8 - .3 * i]).go(1.1, [-4.4 + .6 * i, 3.2]).wait(21.5 + .25 * i); trek(r, 1.5, .5 - .25 * i, [SEIR[0] - 1.0 + .5 * i, SEIR[1] + .7 + .15 * (i % 2)]); r.go(.5, [SEIR[0] - .6 + .5 * i, SEIR[1] + 1.4]).go(.5, [SEIR[0] - 1.2 + .5 * i, SEIR[1] + .9]).wait(TZ);
    act(f, r.keys, { ph: 5 + i * 1.7, sp: 9, show: W_(12.0, TZ), face: (t, p) => (!p.mv && t < TD) ? toward(p.x, p.z, ES) : null, ex: t => mixA({ lx: .05 }) }); });
  // Esau's men: with the herds in C, in the caravan in D, on the hill after
  MEN.forEach((f, i) => { const r = route(0, [-8.6 + .4 * i, 2.4 + .5 * (i % 3)]).wait(14.5 + .1 * i).go(.9, [-5.8 + 1.2 * (i % 4), 3.4 + .4 * (i % 2)]).wait(21.6 + .2 * i); trek(r, 1.55, [-.9, .9, -.55, .55, -.2, .25][i], [SEIR[0] - 3.4 + 1.3 * i, SEIR[1] + 3.0 + .4 * (i % 2)]); r.wait(TZ);
    act(f, r.keys, { ph: 3 + i * 1.5, sp: 7, show: W_(TC - .2, TZ), face: (t, p) => (!p.mv && t < TD) ? headZ(1, .3) : null, ex: t => mixA(aF(.3 * ON(t, 16, 17, 19, 20))) }); });
  // the sons who became chiefs of clans (36:15-19), each in front of his tent; they come in with the caravan and stand when the tent is raised
  CHIEF.forEach((f, i) => { const T = SEIRT[i + 1], inward = [SEIR[0] + (T[0] - SEIR[0]) * .62, SEIR[1] + (T[1] - SEIR[1]) * .62];
    const r = route(0, [-8.0 + .5 * i, 2.0 - .5 * i]).wait(14.7).go(.5, [-6.5 + .5 * i, 3.0 + .2 * i]).wait(21.8 + .15 * i); trek(r, 1.5, .8 - .3 * i, inward); r.wait(TZ);
    act(f, r.keys, { ph: 1 + i * 1.9, sp: 7, show: W_(TC - .3, TZ), face: (t, p) => { if (p.mv) return null; if (t < TD) return headZ(1, .2); return toward(p.x, p.z, [T[0], T[1]]); },
      ex: t => { const w = ON(t, T[5] + .3, T[5] + .9, T[5] + 2.0, T[5] + 2.6); return mixA(aO(.7 * w), aF(.4 * ON(t, 46, 47, 62, 63))); } }); });
  // Jacob stays where he was: among his flock in C, and by the road watching the caravan go in D (36:6-7); he is not shown after that
  { const r = route(TC - .2, [-2.9, -3.1]).wait(18.6).go(.5, [-3.0, -2.5]).wait(20.8).go(.7, [-3.6, -.5]).wait(TE);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(TC - .2, TE), face: (t, p) => { if (p.mv) return null; if (t < 20.8) return toward(p.x, p.z, [-4.6, 1.0]); return headZ(1, .1); }, ex: t => mixA(aF(.25 * ON(t, 16, 17, 20, 21))) }); }
  JMEN.forEach((f, i) => { const r = route(TC - .2, [-4.6 + 1.1 * i, -4.0 - .6 * i]).wait(17 + i).go(.5, [-4.0 + 1.0 * i, -3.2 - .4 * i]).wait(TE);
    act(f, r.keys, { ph: 2 + i * 2.1, sp: 6, show: W_(TC - .2, TE), face: (t, p) => !p.mv ? headZ(1, -.4 + .8 * i) : null }); });
  // the people who lived in Seir before him: standing at their fires (36:20-30)
  { const P = HOR; [[HORP[0], [P[0] + .4, P[1] - .25], 0], [HORP[1], [P[0] - .6, P[1] + .2], 1], [HORP[2], [P[0] + 1.1, P[1] + 1.2], 2], [HORP[3], [P[0] + .1, P[1] + .6], 3], [HORP[4], [P[0] - 1.1, P[1] + 1.0], 4], [HORP[5], [P[0] + .5, P[1] + .3], 5]].forEach(([f, p, i]) => {
      act(f, route(0, p).keys, { ph: 2 + i * 1.6, sp: 5, show: W_(TF - .2, TZ), face: () => toward(p[0], p[1], [P[0] - .1, P[1] - .1]) + (i % 2 ? .35 : -.35), ex: t => mixA(aF(.3 * ON(t, 42, 43, 44, 45))) }); }); }

  // the flocks: Jacob's five stay near his camp; Esau's nine sheep, two goats and two donkeys fill the land in C and follow the caravan
  const JFLOCK = WHITE, EHERD = [...EXTRA, ...GOATS, ...donkeys], ANIM = [...JFLOCK, ...EHERD], AK = new Map(), AV = new Map();
  JFLOCK.forEach((a, i) => { const p = [[-5.0, -3.9], [-4.4, -5.6], [-2.2, -6.5], [-5.6, -5.0], [-1.9, -3.0]][i]; AK.set(a, route(0, p).wait(18).go(.15, [p[0] + .3, p[1] + .2]).wait(90).keys); AV.set(a, t => t >= TC - .5 && t < TE); });
  EHERD.forEach((a, i) => { const p0 = [-8.4 + 1.0 * (i % 5), 2.6 + 1.0 * Math.floor(i / 5) + .3 * (i % 3)], p1 = [-6.4 + .85 * (i % 6), 3.4 + .6 * Math.floor(i / 6)], off = ((i % 5) - 2) * .18 + .55;
    const r = route(0, p0).wait(14.7 + .12 * i).go(.45, p1).wait(21.7 + .15 * i); trek(r, 1.5, off, [SEIR[0] - 3.2 + .8 * (i % 6) + .3 * Math.floor(i / 6), SEIR[1] + 3.3 - .4 * Math.floor(i / 6) + .2 * (i % 3)]); r.wait(TZ); AK.set(a, r.keys);
    AV.set(a, i < 4 ? (t => true) : (t => t >= 14.9 + .4 * (i - 3))); });

  function update(t, camera, sid) {
    const cam = camera && camera.position;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = ON(t, 41.0, 45.0, 90, 91), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    // the low sun behind the subject (it sets in E and F)
    { const k = (.42 + .0) * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]);
    // ---- the river: day colours, darker at night, ripples drifting south
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the town of the kings: it stands from G on, torches at its gate and lit windows one after another (36:31-39)
    { const on = t >= TG - .6; townG.visible = on; const tk = smooth(TG - .2, TG + 1.2, t);
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = smooth(TG + .4 + 5.2 * w.ord, TG + 1.4 + 5.2 * w.ord, t); w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    // ---- fires
    FIRES.forEach(f => { const k = f.b > f.a ? smooth(f.a, f.b, t) : 0; f.s.material.opacity = .8 * k * (fl + .05 * Math.sin(t * 9 + f.ph)); f.s2.material.opacity = .9 * k * fl; f.s.visible = f.s2.visible = k > .01; });
    seirL.intensity = 2.0 * smooth(37.6, 41.6, t) * fl; horL.intensity = 1.7 * smooth(40.4, 43.6, t) * fl;
    // ---- what stands where, by time
    { ETENTS.forEach(m => { m.visible = t < 28.6; });
      STENTS.forEach(m => { const k = smooth(m.userData.ta, m.userData.ta + .9, t); m.visible = k > .01; m.scale.setScalar(Math.max(.01, k)); });
      HTENTS.forEach(m => { m.visible = t >= TF - 1.5; }); }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp); });
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = AV.get(a)(t); a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      const big = i >= 5 + 9 + 2; if (p.mv) walkLegs(a.legs, t + i * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); });
    { const k = kp(t, esauKeys); dust.update(t, 0, [0, 0, 0]); dustR.update(t, .5 * ON(t, 21.8, 23.0, 29.0, 30.6), [k.x, hC(k.x, k.z) + .05, k.z]); }
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(12, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(22, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(31, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(36.5, '#a89ab8', '#5a4448', .95, '#ff9458', 2.4, [10, 1.6, -4], .5, '#ffb480', FD, 14), Dk(40.0, '#8a86b0', '#4a3a40', .9, '#ff8a50', 2.0, [10, 1.2, -4], .5, '#ffa878', FD, 14),
    Dk(43.5, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(62, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [12, ['#5a86c4', '#f6d09a']], [22, ['#5a86c4', '#f6c890']], [31, ['#5a86c4', '#f6c890']], [36.5, ['#5a74b0', '#f4a070']], [40, ['#4a5a9a', '#f0905a']], [43.5, ['#0e1636', '#2a3466']], [62, ['#0e1636', '#2a3466']]];
  return { group: g, update, light, bg, far, pl: [seirL, horL, ...torchL, gateL, campL], state, jacob, esau, CHIEF, WIVES };
}
