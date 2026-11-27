// Episode 38: Genesis 38, Judah and Tamar. Judah gives his firstborn Er a wife, Tamar (38:6); Er displeased the Lord and the Lord took his life (38:7); Judah tells Onan to marry his brother's widow (38:8); Onan would not give her a child and the Lord took his life too (38:9-10).
// Judah tells Tamar to stay a widow in her father's house until his son Shelah is grown, for he feared Shelah would die like his brothers (38:11); years pass and Shelah is grown but Tamar is not given to him (38:14); she covers herself with a veil and sits by the road, and Judah does not know her (38:14-16); he leaves his seal, cord and staff and she conceives (38:18).
// Three months later Judah is told Tamar is pregnant and says: bring her out, and let her be burned (38:24); she sends him the seal, cord and staff (38:25); Judah says she is more in the right than he (38:26); Tamar gives birth to twins, Perez and Zerah (38:27-30).
// Cinematic interpretation: the camp, the road, the roadside stone, the gate of the walled town at dusk, the lamp, the veil, the seal, cord and staff and the two newborns are pictures made for this film. The text gives no landscape and no faces; nothing of the act between Judah and Tamar is shown, and the deaths of Er and Onan are shown only as a lamp going out and an empty place.
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
  // ---- fires: a small ring of stones, a glow and a hot core; lit by the time they are given
  const FIRES = [];
  const fire = (x, z, a, b, big = 1) => { const y = hC(x, z), bb = new GB(rng(600 + FIRES.length)); for (let k = 0; k < 6; k++) { const an = k * 1.047 + .3; bb.add(G.ico0, '#6a5e52', [Math.cos(an) * .13 * big, .02, Math.sin(an) * .13 * big], [.045 * big, .035 * big, .045 * big], [k, an, 0], .03); }
    const m = meshOf(bb); m.position.set(x, y, z); ca.add(m);
    const s = spriteGlow(x, y + .22 * big, z, .62 * big, 0xff9a48, 0), s2 = spriteGlow(x, y + .2 * big, z, .22 * big, 0xfff0c0, 0); g.add(s, s2); FIRES.push({ s, s2, a, b, ph: FIRES.length * 1.7 }); };

  // ---- the stage: Judah's tents at the west end of the road, Tamar's father's house in the north camp, the roadside stone and the town gate in the east
  const DOOR = [-5.1, .55], LAMP = [-5.25, .88], JU1 = [-4.1, .45], ER1 = [-4.8, .9], TB1 = [-4.8, .2], ON1 = [-4.5, .88], JU2 = [-3.7, .78], TJ = [-4.25, .45], SH1 = [-3.4, .45];
  const JCD = [-3.35, -4.15], JCD2 = [-3.4, -4.3], RSIT = [3.95, 1.3], STN = [3.62, 1.52], GB_ = [4.6, .6], GATE0 = [6.45, .2];
  // ---- harvest: small sheaves of grain stand about the camp (the text gives no season for the weddings; this is the film's picture)
  { const b = new GB(rng(396)), rr = rng(397); [[-7.1, -2.1], [-6.7, -2.3], [-6.4, -1.9], [-3.1, 3.0], [-2.6, 3.3], [-8.8, 1.9], [-9.1, 1.5], [-2.2, 3.4], [-1.5, 3.1]].forEach(([x, z]) => { const y = hC(x, z); for (let k = 0; k < 3; k++) b.box(pk(rr, ['#d8b860', '#c9a850', '#e0c470']), [x + (k - 1) * .035, y + .15, z + (k % 2) * .03], [.045, .3, .045], [(k - 1) * .18, 0, (1 - k) * .12], .01); b.box('#a8884a', [x, y + .15, z], [.11, .03, .11], [0, 0, 0], .005); }); ca.add(meshOf(b)); }
  // ---- the roadside stone where Tamar sits, and the bench of stone at the town gate where Judah hears the matter
  { const b = new GB(rng(398)); b.box('#9a8e7c', [RSIT[0], hC(RSIT[0], RSIT[1]) + .08, RSIT[1]], [.34, .16, .28], [0, .3, 0], .03); b.box('#a99c86', [STN[0], hC(STN[0], STN[1]) + .09, STN[1]], [.3, .18, .24], [0, -.2, 0], .03); b.box('#a08a64', [GB_[0], hC(GB_[0], GB_[1]) + .07, GB_[1]], [.3, .14, .22], [0, 0, 0], .03); b.box('#b0a088', [3.2, hC(3.2, 1.6) + .05, 1.6], [.16, .1, .14], [0, .5, 0], .03); ca.add(meshOf(b)); }
  // ---- the rug at the door of the north camp, where Tamar will sit
  { const b = new GB(rng(399)); b.box('#8a4a3a', [JCD2[0], hC(JCD2[0], JCD2[1]) + .012, JCD2[1] + .1], [.9, .016, .6], [0, 0, 0], .005); b.box('#d8b060', [JCD2[0], hC(JCD2[0], JCD2[1]) + .02, JCD2[1] + .1], [.9, .006, .08], [0, 0, 0], .002); ca.add(meshOf(b)); }
  // ---- the lamp (a small clay oil lamp at the door of Judah's tent): it burns while Er is there, and goes out
  { const b = new GB(rng(400)); b.box('#a8743a', [LAMP[0], hC(LAMP[0], LAMP[1]) + .03, LAMP[1]], [.08, .05, .06], [0, .4, 0], .01); b.box('#8a5a2a', [LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .05, LAMP[1]], [.04, .02, .03], [0, .4, 0], .005); ca.add(meshOf(b)); }
  const lampG = spriteGlow(LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .1, LAMP[1], .12, 0xffb858, 0), lampG2 = spriteGlow(LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .095, LAMP[1], .05, 0xfff0c0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa458, 0, 3.0, 1.6); lampL.position.set(LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .3, LAMP[1] + .1);
  // ---- the seal (a small cylinder on a cord), the cord, and the staff (38:18, 38:25)
  const mkSeal = () => { const gr = new THREE.Group(), b = new GB(rng(380)); b.add(G.cyl6, '#d8aa48', [0, .03, 0], [.026, .06, .026], [0, 0, 0], .01); b.box('#8a6a2a', [0, .065, 0], [.034, .012, .034], [0, 0, 0], .005); gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkCord = () => { const gr = new THREE.Group(), b = new GB(rng(381)); for (let k = 0; k < 14; k++) { const a = k * TAU / 14; b.box(k % 2 ? '#a83a2c' : '#e8dcc0', [Math.cos(a) * .045, .008, Math.sin(a) * .045], [.02, .012, .04], [0, -a, 0], .003); } gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkStaffP = () => { const gr = new THREE.Group(), b = new GB(rng(382)); b.box('#6b4a2c', [0, .3, 0], [.026, .6, .026], [0, 0, 0], .004); b.box('#5a3a20', [0, .6, 0], [.04, .035, .04], [0, 0, 0], .003); const m = meshOf(b); m.castShadow = true; gr.add(m); g.add(gr); gr.visible = false; return gr; };
  const SEAL = mkSeal(), CORD = mkCord(), STAFFP = mkStaffP();
  // ---- the two newborns (38:27-30): swaddled, one with a red thread at his wrist
  const mkInfant = (col, thread, sd) => { const gr = new THREE.Group(), b = new GB(rng(390 + sd)); b.box(col, [0, .035, 0], [.2, .07, .09], [0, 0, 0], .015); b.box('#efe4cc', [-.06, .075, 0], [.08, .025, .09], [0, 0, 0], .01); b.add(G.ico0, '#cf9468', [.115, .05, 0], [.045, .045, .042], [0, 0, 0], .01); b.box('#2a1a10', [.125, .078, 0], [.03, .012, .04], [0, 0, 0], .005);
    if (thread) { b.box('#cf9468', [.03, .08, .055], [.05, .016, .016], [0, 0, .3], .003); b.box('#c0302a', [.052, .085, .057], [.012, .022, .022], [0, 0, 0], .002); }
    gr.add(meshOf(b)); ca.add(gr); gr.visible = false; return gr; };
  const INF = [mkInfant('#d8c8a8', false, 0), mkInfant('#c8d0b8', true, 1)];
  { const p = [[JCD2[0] + .26, JCD2[1] + .3, .5], [JCD2[0] - .12, JCD2[1] + .34, -.3]]; INF.forEach((m, i) => { m.position.set(p[i][0], hC(p[i][0], p[i][1]) + .022, p[i][1]); m.rotation.y = p[i][2]; }); }
  // ---- animals: Judah's flock stays at the camp; two sheep at Tamar's father's house
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const HOME = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0)), JSH = [0, 1].map(i => place(makeSheep(rng(750 + i)), 0, 0, 0));

  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);
  const CLOUD = [[0, '#e8c8a0'], [14, '#e8d0a8'], [27, '#e8c8a0'], [38, '#e8b898'], [42, '#d8a08c'], [45, '#a8809a'], [48, '#5a5a88'], [60, '#4a4a78'], [70, '#f0cfa8'], [99, '#f0cfa8']];
  const CEM = [[0, '#6a5848'], [38, '#6a5848'], [42, '#5a4a52'], [46, '#3a3a58'], [60, '#22223a'], [70, '#7a6050'], [99, '#7a6050']];
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

  // ---- the people. All are new and unnamed in the text beyond Judah, Er, Onan, Shelah and Tamar; Tamar has three states (bride, widow, veiled); Shelah has two (boy, grown man)
  const judah = person(rng(990), { pants: '#d9ccb0', top: '#3f5a7a', skin: '#b98a62', hair: '#2e1d10', beard: '#2e1d10', cloth: '#e8dcc0', mantle: '#7a4a2a', sash: '#6a3a1a', seed: 990 }, .46);
  const er = person(rng(991), { pants: '#d9ccb0', top: '#8a3a2e', skin: '#b98a62', hair: '#2a1a10', sash: '#3a2a1a', seed: 991 }, .43);
  const onan = person(rng(992), { pants: '#cdbd98', top: '#5a6a4a', skin: '#a8714a', hair: '#2a1a10', sash: '#3a2a1a', seed: 992 }, .43);
  const shB = person(rng(993), { pants: '#d9ccb0', top: '#c9a15a', skin: '#b98a62', hair: '#2a1a10', seed: 993 }, .31);
  const shM = person(rng(993), { pants: '#d9ccb0', top: '#c9a15a', skin: '#b98a62', hair: '#2a1a10', sash: '#6a3a1a', seed: 993 }, .44);
  const tBr = person(rng(994), { pants: '#e0d4b4', top: '#4f9a8a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#efe4cc', sash: '#c9a15a', seed: 994 }, .42);
  const tWd = person(rng(994), { pants: '#2c2830', top: '#3a323c', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#2c2830', sash: '#4a3a44', seed: 994 }, .42);
  const tVl = person(rng(994), { pants: '#c8a878', top: '#b8784a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#d8b080', sash: '#6a3a2a', seed: 994 }, .42);
  const veilG = new THREE.Group(); { const b = new GB(rng(995)); b.box('#d8b080', [0, -.09, .098], [.2, .18, .024], [0, 0, 0], .01); b.box('#c49a68', [0, -.01, .1], [.22, .03, .03], [0, 0, 0], .01); veilG.add(meshOf(b)); veilG.position.set(0, 1.08, 0); tVl.group.add(veilG); veilG.scale.y = 0; }
  const MEN = [['#7a5a3a', '#e8dcc0', '#6a4a2a', 1000], ['#5a6a7a', '#d8c9a8', null, 1001], ['#8a6a4a', '#e0d4b8', null, 1002]].map(([top, cloth, mantle, sd], i) => person(rng(260 + i), { pants: '#d8ccb0', top, skin: '#a8714a', hair: '#2a1a10', beard: i < 2 ? '#2a1a10' : undefined, cloth, mantle: mantle || undefined, sash: '#4a2a1a', seed: sd }, .45));
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(38)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  const judahStaff = mkStaff(); judah.group.add(judahStaff);
  const ALLP = [judah, er, onan, shB, shM, tBr, tWd, tVl, ...MEN]; ALLP.forEach(o => g.add(o.group));

  const fx = (dx, dz) => () => headZ(dx, dz);
  const ftoP = p => (t, q) => toward(q.x, q.z, p);
  const ftoK = keys => (t, q) => { const o = kp(t, keys); return toward(q.x, q.z, [o.x, o.z]); };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const ang = (a, b, k) => a + (b - a) * k;
  const SIT = () => -.12;
  // ---- a1 (0.6-8.6): Judah gives his firstborn Er a wife named Tamar (38:6); Er displeased the Lord and the Lord took his life (38:7): the lamp at the door goes out, and Tamar is alone in the dark clothes of a widow
  const aJ1 = still(judah, JU1, 0, 14.0, { sp: 5, face: (t, q) => t < 8.6 ? toward(q.x, q.z, [-4.8, .55]) : (t < 10.0 ? toward(q.x, q.z, ON1) : (t < 11.8 ? toward(q.x, q.z, DOOR) : toward(q.x, q.z, ON1))), ex: t => mixA(aO(.8 * ON(t, 1.0, 1.7, 3.2, 3.9)), aF(.4 * ON(t, 5.0, 5.8, 8.0, 8.5)), aP(ON(t, 10.0, 10.5, 11.5, 12.0)), aF(.5 * ON(t, 12.4, 12.9, 13.6, 14.0))) });
  const aE1 = still(er, ER1, 0, 4.6, { face: ftoP([-4.8, .55]), ex: t => mixA(aF(.55)) });
  const aTb = still(tBr, TB1, 0, 4.6, { face: ftoP(ER1), ex: t => mixA(aF(.45 * ON(t, .8, 1.5, 4.0, 4.5))) });
  const aE2 = still(er, DOOR, 4.6, 6.5, { face: fx(.75, .45), ex: t => mixA({ lx: .05 }, aO(.25 * ON(t, 5.0, 5.6, 6.1, 6.5))) });
  const DOOR2 = [-5.05, .02];
  const aT1 = still(tWd, DOOR, 6.4, 8.6, { face: fx(.7, .6), ex: t => mixA({ lx: .1 + .04 * Math.sin(t * 1.3) }, aF(.5)) });
  const aT1b = still(tWd, DOOR2, 8.6, 14.2, { face: (t, q) => toward(q.x, q.z, JU1), ex: t => mixA({ lx: .08 + .03 * Math.sin(t * 1.3) }, aF(.5)) });
  const aT1c = still(tWd, DOOR, 14.2, 16.2, { face: fx(.9, .3), ex: t => mixA({ lx: .1 + .03 * Math.sin(t * 1.3) }, aF(.5)) });
  // ---- a2 (8.6-16.8): Judah tells Onan to marry his brother's widow (38:8); Onan would not give her a child and the Lord took his life too (38:9-10): he turns away and is gone; the lamp goes out a second time
  const aO1 = still(onan, ON1, 8.6, 13.4, { face: (t, q) => t < 11.4 ? toward(q.x, q.z, JU1) : ang(toward(q.x, q.z, JU1), headZ(.2, 1), smooth(11.5, 12.6, t)), ex: t => mixA(aF(.35 * ON(t, 8.9, 9.5, 11.0, 11.5)), aF(.8 * ON(t, 12.2, 12.8, 13.3, 13.4))) });
  const aO2 = act(onan, route(13.4, ON1).go(.8, [-3.4, 1.3]).go(.9, [-1.6, 1.2]).keys, { sp: 6, show: W_(13.4, 16.8) });
  // ---- b1 (16.8-25.8): Judah tells Tamar to stay a widow in her father's house until Shelah is grown (38:11); he feared Shelah would die too
  const aJ2 = act(judah, route(14.0, JU1).go(.5, JU2).wait(30.9).keys, { sp: 5, show: W_(14.0, 30.9), face: (t, p) => p.mv ? null : (t < 18.3 ? toward(p.x, p.z, TJ) : (t < 20.4 ? headZ(0, -1) : (t < 22.8 ? ftoK(aT3.keys)(t, p) : (t < 27.0 ? toward(p.x, p.z, SH1) : toward(p.x, p.z, [-3.0, .9]))))), ex: t => mixA(aP(ON(t, 18.3, 18.8, 19.9, 20.4)), aF(.5 * ON(t, 22.9, 23.5, 25.6, 26.4)), { lx: .06 * ON(t, 23.5, 24.2, 25.4, 26.2) }) });
  const aT2 = act(tWd, route(16.2, DOOR).go(.55, TJ).wait(20.4).keys, { sp: 6, show: W_(16.2, 20.4), face: (t, p) => p.mv ? null : toward(p.x, p.z, JU2), ex: t => mixA({ lx: .08 }, aF(.5)) });
  const aT3 = act(tWd, route(20.4, TJ).go(1.15, [-4.0, -1.2]).go(1.15, [-3.6, -3.2]).go(1.0, JCD).keys, { sp: 7, show: W_(20.4, 24.6) });
  const aSB = still(shB, SH1, 16.8, 27.0, { face: (t, q) => t < 20.4 ? toward(q.x, q.z, TJ) : toward(q.x, q.z, JU2), ex: t => mixA({ lx: .04 }) });
  // ---- b2 (25.8-31.4): years passed, Shelah grew up, but Tamar was not given to him (38:14): the light swings across the sky; Tamar waits at her father's house
  const aSM = still(shM, SH1, 27.0, 31.4, { face: fx(1, .35), ex: t => mixA(aF(.3 * ON(t, 27.6, 28.2, 30.6, 31.2))) });
  const aT4 = still(tWd, JCD, 24.6, 31.4, { face: (t, q) => t < 28.4 ? headZ(.3, 1) : toward(q.x, q.z, [-3.7, .8]), ex: t => mixA({ lx: .05 }, aF(.45)) });
  // ---- c1 (31.2-41.8): she covered her face with a veil and sat by the road (38:14); Judah did not know her (38:15); he left his seal, cord and staff (38:18)
  const aTv0 = still(tVl, JCD, 31.4, 34.2, { face: (t, q) => ang(headZ(.3, 1), headZ(.9, .3), smooth(33.4, 34.0, t)), ex: t => mixA(aP(.7 * ON(t, 32.3, 32.8, 33.2, 33.6)), aF(.5 * ON(t, 33.4, 33.8, 34.1, 34.2))) });
  const aTv = still(tVl, RSIT, 34.2, 41.8, { y: SIT, face: (t, q) => t < 35.6 ? headZ(-1, -.3) : toward(q.x, q.z, [3.3, .85]), ex: t => mixA({ lx: .09 }, aF(.35)) });
  const aJ3 = act(judah, route(30.9, JU2).go(1.29, [-3.2, 1.1]).go(1.29, [-1.0, 1.15]).go(1.29, [.45, 1.2]).go(1.29, [2.2, 1.0]).go(1.29, [3.3, .85]).wait(37.7).go(1.1, [4.7, .45]).go(1.1, [5.5, .2]).go(1.1, [6.6, .2]).keys, { sp: 7, show: W_(30.9, 41.0), face: (t, p) => p.mv ? null : toward(p.x, p.z, RSIT), ex: t => mixA(aO(.35 * ON(t, 36.6, 37.0, 37.5, 37.8))) });
  // ---- c2 (41.5-49.4): three months later Judah heard Tamar was pregnant and said: bring her out, and let her be burned (38:24): dusk at the gate of the town
  const aJg = still(judah, GB_, 41.8, 54.8, { sp: 5, face: (t, q) => t < 44.9 ? toward(q.x, q.z, MENP[0]) : (t < 47.6 ? headZ(1, .05) : toward(q.x, q.z, [4.95, .3])), ex: t => mixA(aF(.45 * ON(t, 42.0, 42.6, 44.5, 45.0)), aP(ON(t, 45.3, 45.8, 46.9, 47.4)), aF(.5 * ON(t, 52.0, 52.6, 54.4, 54.8)), { lx: .12 * ON(t, 52.3, 53.0, 54.4, 54.8) }) });
  const MENP = [[4.15, .98], [4.3, -.4], [3.85, -.05]];
  const aM1 = still(MEN[0], MENP[0], 41.8, 54.8, { ph: 1, sp: 5, face: (t, q) => t < 47.6 ? toward(q.x, q.z, GB_) : toward(q.x, q.z, [4.95, .3]), ex: t => mixA(aP(ON(t, 42.4, 42.9, 44.2, 44.7))) });
  const aM2a = still(MEN[1], MENP[1], 41.8, 47.5, { ph: 3, sp: 5, face: ftoP(GB_), ex: t => mixA(aF(.3)) });
  const aM3a = still(MEN[2], MENP[2], 41.8, 47.5, { ph: 5, sp: 5, face: ftoP(GB_), ex: t => mixA(aF(.3)) });
  const aTg = act(tWd, route(47.6, GATE0).go(.85, [4.95, .3]).wait(54.8).keys, { sp: 6, show: W_(47.6, 54.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, GB_), ex: t => mixA({ lx: .04 }, aF(.6 * ON(t, 47.7, 48.4, 48.9, 49.4) + .95 * ON(t, 49.4, 49.9, 54.6, 54.8))) });
  const aM2b = act(MEN[1], route(47.6, [6.4, .6]).go(.85, [5.05, .62]).wait(54.8).keys, { ph: 3, sp: 6, show: W_(47.6, 54.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [4.95, .3]), ex: t => mixA(aF(.3)) });
  const aM3b = act(MEN[2], route(47.6, [6.4, -.2]).go(.85, [5.05, -.08]).wait(54.8).keys, { ph: 5, sp: 6, show: W_(47.6, 54.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [4.95, .3]), ex: t => mixA(aF(.3)) });
  // ---- d2 (54.8-61.8): Tamar gave birth to twins, Perez and Zerah (38:27-30): morning at her father's house
  const aTb2 = still(tWd, JCD2, 54.8, 61.8, { y: SIT, face: (t, q) => ang(headZ(.15, 1), toward(q.x, q.z, [JCD2[0] + .07, JCD2[1] + .32]), smooth(56.4, 57.2, t)), ex: t => mixA({ lx: .05 + .1 * smooth(56.4, 57.2, t) }, aF(.35 + .4 * smooth(56.4, 57.2, t))) });
  // ---- the animals
  const ANIM = [...HOME, ...JSH], AK = new Map(), AV = new Map();
  [[-2.4, -1.4], [-1.7, -.5], [-.7, -1.4], [-2.8, -.8], [-1.2, -1.0]].forEach((p, i) => { AK.set(HOME[i], route(0, p).wait(8).go(.12, [p[0] + .25, p[1] + .1]).wait(90).keys); AV.set(HOME[i], t => t < 31.5); });
  [[-2.4, -3.3], [-4.5, -3.7]].forEach((p, i) => { AK.set(JSH[i], route(0, p).wait(10).go(.1, [p[0] + .2, p[1] - .12]).wait(90).keys); AV.set(JSH[i], t => t >= 24.4 && t < 34.5 || t >= 54.0); });
  const heldAt = (a, fw, side, h, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null, hd = fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, hC(p.x, p.z) + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };


  function update(t, camera, sid) {
    const cam = camera && camera.position, dawn = sid === 'birth' || sid === 'rise', tc = dawn ? 70 : t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = dawn ? 0 : ON(t, 42.0, 47.0, 53.5, 54.6), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the walled town stands the whole time; its torches and windows light at dusk (38:24, cinematic interpretation)
    { townG.visible = true; const tk = smooth(40.4, 42.2, t) * (1 - smooth(52.8, 54.4, t));
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = smooth(41.0 + 3 * w.ord, 42.0 + 3 * w.ord, t) * (1 - smooth(52.8, 54.4, t)); w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    FIRES.forEach(f => { f.s.visible = f.s2.visible = false; });
    // ---- the lamp at the door: lit while Er is there, relit, and out again after Onan
    { const lk = Math.min(1, smooth(.4, 1.0, t) * (1 - smooth(6.1, 6.5, t)) + smooth(8.8, 9.4, t) * (1 - smooth(14.9, 15.3, t))), lf = fl * (1 - .35 * ON(t, 14.2, 14.5, 14.7, 15.0));
      lampG.material.opacity = .6 * lk * lf; lampG2.material.opacity = .8 * lk * lf; lampG.visible = lampG2.visible = lk > .01; lampL.intensity = 1.3 * lk * lf; }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    veilG.scale.y = smooth(32.4, 33.6, t); judahStaff.visible = t < 37.7;
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = AV.get(a)(t); a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      if (p.mv) walkLegs(a.legs, t + i * 1.3, 7, .5); else walkLegs(a.legs, 0, 0, 0); });
    // ---- the seal, the cord and the staff: left on the roadside stone (38:18), held out by Tamar at the gate (38:25)
    { const onStone = t >= 37.7 && t < 41.9, held = t >= 49.4 && t < 54.8;
      SEAL.visible = CORD.visible = STAFFP.visible = onStone || held;
      if (onStone) { const y = hC(STN[0], STN[1]) + .18; SEAL.position.set(STN[0] + .04, y, STN[1] - .03); SEAL.rotation.y = .4; CORD.position.set(STN[0] - .07, y, STN[1] + .05); CORD.rotation.y = .2; STAFFP.position.set(STN[0] - .26, hC(STN[0] - .26, STN[1] + .14), STN[1] + .14); STAFFP.rotation.set(0, .2, .32); }
      else if (held) { const k = smooth(49.4, 50.0, t), a = heldAt(aTg, .17 + .02 * k, .03, .21 + .02 * k, t), b2 = heldAt(aTg, .17 + .02 * k, -.03, .17 + .02 * k, t), c = heldAt(aTg, .06, -.2, 0, t); SEAL.position.set(a[0], a[1], a[2]); SEAL.rotation.y = a[3]; CORD.position.set(b2[0], b2[1], b2[2]); CORD.rotation.y = b2[3]; STAFFP.position.set(c[0], c[1] - hC(c[0], c[2]) + hC(c[0], c[2]) + .0, c[2]); STAFFP.position.y = hC(c[0], c[2]); STAFFP.rotation.set(0, c[3], .06); } }
    { const k = smooth(56.2, 56.9, t); INF.forEach((m, i) => { m.visible = t >= 56.1; m.scale.setScalar(Math.max(.01, k)); }); }
    { const k = kp(t, aT3.keys); dust.update(t, 0, [0, 0, 0]); dustR.update(t, .4 * ON(t, 20.8, 21.6, 23.8, 24.4), [k.x, hC(k.x, k.z) + .05, k.z]); }
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(4.4, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14),
    Dk(6.3, '#9a9cb0', '#584a46', .88, '#f0b078', 1.7, [9, 2.6, -5], .5, '#ffcf9a', FD, 14), Dk(8.9, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.5, [9, 2.8, -5], .5, '#ffcf9a', FD, 14),
    Dk(14.2, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.5, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(15.2, '#9a9cb0', '#584a46', .88, '#f0b078', 1.8, [9, 2.6, -5], .5, '#ffcf9a', FD, 14),
    Dk(16.8, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(25.8, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(27.1, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [-9, 3.0, -4], .5, '#ffcf9a', FD, 14), Dk(38, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [-10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(42, '#a89ab8', '#5a4448', .95, '#ff9458', 2.2, [-10, 1.5, -4], .5, '#ffb480', FD, 14), Dk(46.5, '#6a72a8', '#322c44', .95, '#9aa8f0', 1.6, [-9, 5.0, -3], .62, '#7a8cd0', FD, 14),
    Dk(54.0, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(62, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [14, ['#5a86c4', '#f6d09a']], [27, ['#5a86c4', '#f6c890']], [38, ['#5a74b0', '#f4a070']], [42, ['#4a5a9a', '#f0905a']], [45, ['#2a3270', '#c87a60']], [48, ['#0e1636', '#2a3466']], [60, ['#0e1636', '#2a3466']], [70, ['#6a8ec8', '#f8d4a0']], [99, ['#6a8ec8', '#f8d4a0']]];
  return { group: g, update, light, bg, far, pl: [lampL, ...torchL, gateL, campL], state };
}
