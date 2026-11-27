// Episode 40: Genesis 40 (NRSV-CE). Pharaoh's cupbearer and baker offend him and are put in custody in the prison where Joseph is held; Joseph attends them (40:1-4); each has a dream in the same night, and Joseph sees in the morning that they are downcast and asks why (40:5-7); they say they dreamed and there is no one to interpret, and Joseph says interpretations belong to God (40:8);
// the cupbearer's dream: a vine with three branches, and Pharaoh's cup pressed and put into Pharaoh's hand (40:9-11); Joseph says in three days Pharaoh will restore him, asks him to remember him and speak to Pharaoh, and says he has done nothing to deserve the dungeon (40:12-15); the baker's dream: three baskets on his head and birds eating from the top one (40:16-17); Joseph says in three days Pharaoh will have him executed (40:18-19);
// on the third day, Pharaoh's birthday, it happens as Joseph said (40:20-22); but the cupbearer did not remember Joseph; he forgot him (40:23). Cinematic interpretation: the yard and its mats, the faces and clothes, who sits where, the dream pictures (a vine growing in the dark, the stack of baskets, the birds), Pharaoh's seat and table at the house, the light (golden hour, night in the prison, morning, dusk), and that nothing of the baker's death is shown.
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
  const CLOUD = [[0, '#e8c8a0'], [12, '#e8c8a0'], [13, '#f0d4a8'], [50, '#f0d4a8'], [52, '#e8c8a0'], [90, '#e8c8a0'], [100, '#4a4a78'], [110, '#22223a'], [120, '#a8809a'], [130, '#c8c4cc']];
  const CEM = [[0, '#6a5848'], [90, '#6a5848'], [100, '#3a3a58'], [110, '#22223a'], [120, '#5a4a52'], [130, '#6a6068']];
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

  // ---- the people. Joseph is the same face and body as in Genesis 37 and 39 (the plain tunic of a household servant, now a prisoner, no cloak). The cupbearer, the baker and Pharaoh are new, unnamed on screen; the guards and servants are the Ep39 figures. Each dream figure is a second copy of the same person (the dream is a picture, not a second person)
  const joN = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', sash: '#6a3a1a', seed: 930 }, .44);
  const mkCup = () => person(rng(970), { pants: '#e8dcc0', top: '#7a3a5a', skin: '#b98a62', hair: '#1a1410', sash: '#d8b048', seed: 970 }, .43);
  const mkBak = () => person(rng(971), { pants: '#d8ccb0', top: '#e0d6bc', skin: '#a8714a', hair: '#1a1410', beard: '#2a1a10', cloth: '#f0e8d4', sash: '#8a6a3a', seed: 971 }, .45);
  const mkPha = () => person(rng(972), { pants: '#efe6d0', top: '#f2ead6', skin: '#b98a62', hair: '#1a1410', cloth: '#2e5a9a', mantle: '#c9a15a', sash: '#d8b048', seed: 972 }, .5);
  const cup = mkCup(), bak = mkBak(), pha = mkPha(), cupD = mkCup(), bakD = mkBak(), phaD = mkPha();
  const sv1 = person(rng(950), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 950 }, .42);
  const sv2 = person(rng(951), { pants: '#d8c8a8', top: '#d0c0a0', skin: '#b98a62', hair: '#2a1a10', sash: '#8a6a3a', seed: 951 }, .41);
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  [pha, phaD].forEach(o => { const b = new GB(rng(973)); b.box('#d8aa48', [0, 1.1, 0], [.23, .05, .23], [0, 0, 0], .008); b.box('#e8c458', [0, 1.145, .115], [.03, .07, .03], [0, 0, 0], .004); b.box('#d8aa48', [0, 1.14, -.115], [.2, .04, .02], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; o.group.add(m); });
  [bakD].forEach(o => { const b = new GB(rng(974)); for (let k = 0; k < 3; k++) { const y = 1.12 + k * .1; b.add(G.cylT, k % 2 ? '#b8884a' : '#a87a40', [0, y, 0], [.12 - .006 * k, .085, .12 - .006 * k], [0, 0, 0], .006); b.box('#8a5a2a', [0, y + .085, 0], [.25 - .012 * k, .016, .25 - .012 * k], [0, 0, 0], .003); }
    b.add(G.ico0, '#f0dcb0', [-.04, 1.12 + .2 + .1, .02], [.055, .036, .045], [0, 0, 0], .004); b.add(G.ico0, '#e8cf9c', [.04, 1.12 + .2 + .1, -.02], [.05, .034, .045], [0, .6, 0], .004); b.add(G.ico0, '#f4e4bc', [0, 1.12 + .2 + .12, .0], [.045, .03, .04], [0, 1.1, 0], .004);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; o.group.add(m); });
  const ALLP = [joN, cup, bak, pha, cupD, bakD, phaD, sv1, sv2, gu1, gu2]; ALLP.forEach(o => g.add(o.group));
  // ---- props: the gold cup (40:11, 40:21), Pharaoh's seat and table (invented staging for the birthday, 40:20), the vine of the first dream (40:9-10), the birds of the second (40:17)
  const mkCupP = () => { const gr = new THREE.Group(), b = new GB(rng(384)); b.add(G.cylT, '#e0b848', [0, 0, 0], [.034, .062, .034], [0, 0, 0], .004); b.box('#e8c458', [0, .064, 0], [.08, .01, .08], [0, 0, 0], .002); b.box('#c8962c', [0, -.006, 0], [.05, .012, .05], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); return gr; };
  const CUPP = mkCupP(); g.add(CUPP);
  const thr = new THREE.Group(); { const b = new GB(rng(385)), x = -6.02, z = -.6, y = hC(x, z) + .03;
    b.box('#bfa87c', [x, y + .01, z], [.44, .02, .44], [0, 0, 0], .004); b.box('#8a6a3a', [x, y + .08, z], [.27, .12, .25], [0, 0, 0], .004); b.box('#2e5a9a', [x + .005, y + .15, z], [.25, .025, .23], [0, 0, 0], .003);
    b.box('#8a6a3a', [x - .115, y + .3, z], [.03, .3, .25], [0, 0, 0], .004); b.box('#d8aa48', [x - .118, y + .46, z], [.036, .028, .27], [0, 0, 0], .003); for (const dz of [-.115, .115]) b.box('#8a6a3a', [x, y + .2, z + dz], [.24, .03, .03], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; thr.add(m); g.add(thr); }
  const tbl = new THREE.Group(); { const b = new GB(rng(386)), x = -5.2, z = -2.1, y = hC(x, z);
    b.box('#8a6a3a', [x, y + .2, z], [.92, .035, .3], [0, 0, 0], .004); for (const dx of [-.42, .42]) for (const dz of [-.12, .12]) b.box('#6a4a2a', [x + dx, y + .1, z + dz], [.03, .2, .03], [0, 0, 0], .003);
    b.box('#efe6d0', [x, y + .22, z], [.88, .006, .27], [0, 0, 0], .002); b.add(G.ico0, '#e0b878', [x - .28, y + .25, z - .05], [.05, .032, .045], [0, 0, 0], .004); b.add(G.ico0, '#e8cf9c', [x - .2, y + .245, z + .06], [.045, .03, .04], [0, .5, 0], .004);
    b.add(G.ico0, '#a8402e', [x - .02, y + .245, z], [.03, .03, .03], [0, 0, 0], .003); b.add(G.ico0, '#d8a838', [x + .04, y + .243, z + .05], [.03, .028, .03], [0, 0, 0], .003); b.add(G.ico0, '#7a3a6a', [x + .06, y + .243, z - .06], [.028, .028, .028], [0, 0, 0], .003);
    b.add(G.cylT, '#b87a4a', [x + .3, y + .225, z + .03], [.04, .09, .04], [0, 0, 0], .004); b.add(G.cylT, '#a8683c', [x + .38, y + .225, z - .05], [.032, .07, .032], [0, 0, 0], .004);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; tbl.add(m); g.add(tbl); }
  // the dream stage floats in the sky above the prison yard; the vine, the baskets and the birds live there
  const DS = [-3.3, -4.8], DY = 2.2, VY = gAt(DS[0], DS[1]) + 1.95;
  const vineG = new THREE.Group(); vineG.position.set(DS[0], VY, DS[1]); g.add(vineG);
  const vTrunk = new THREE.Group(), vBr = [new THREE.Group(), new THREE.Group(), new THREE.Group()]; vineG.add(vTrunk); vBr.forEach(b => { b.position.set(0, 1.0, 0); vineG.add(b); });
  { const b = new GB(rng(990)); for (let k = 0; k < 6; k++) b.box(k % 2 ? '#6a4a2a' : '#7a5632', [Math.sin(k * 1.1) * .03, .09 + k * .17, Math.cos(k * 1.3) * .03], [.075 - k * .007, .2, .075 - k * .007], [0, k * .5, Math.sin(k) * .12], .01);
    for (let k = 0; k < 3; k++) { const a = k * 2.1; b.box('#4f8f3a', [Math.cos(a) * .09, .35 + k * .2, Math.sin(a) * .09], [.12, .014, .08], [0, -a, .5], .01); }
    vTrunk.add(new THREE.Mesh(b.build(), lam)); }
  [[.95, 0], [0, .5], [-.95, 0]].forEach(([rz, ry], i) => { const b = new GB(rng(991 + i)); let x = 0, y = 0;
    for (let k = 0; k < 5; k++) { const a = .12 * k; b.box(k % 2 ? '#6a4a2a' : '#7a5632', [x + Math.sin(a) * .09, y + Math.cos(a) * .09, 0], [.045 - k * .004, .19, .045 - k * .004], [0, 0, -a], .008); x += Math.sin(a) * .18; y += Math.cos(a) * .18;
      const s = k % 2 ? 1 : -1; b.box(['#4f8f3a', '#5f9f44', '#46843a'][k % 3], [x + s * .07, y - .02, .03 * s], [.16, .012, .1], [0, .4 * s, .35 * s], .008); b.box('#5f9f44', [x - s * .06, y + .03, -.03 * s], [.14, .012, .09], [0, -.4 * s, -.3 * s], .008); }
    for (let k = 0; k < 7; k++) { const a = k * 2.4; b.add(G.ico0, ['#6a3a8a', '#5a2f7a', '#7a4a9a'][k % 3], [x + Math.cos(a) * .04, y - .07 - (k % 3) * .045, Math.sin(a) * .04], [.034, .034, .034], [0, 0, 0], .004); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; vBr[i].add(m); vBr[i].rotation.set(0, ry, rz); });
  const vPool = pool(1.1, 0xb8c8ff, 0); vPool.position.set(DS[0], VY - .02, DS[1]); g.add(vPool);
  const dreamM = makeMotes({ n: 90, area: [3.2, 3.4, 3.0], size: .028, v: .1, seed: 61, color: 0xcfe0ff }); g.add(dreamM.mesh);
  const BIRDS = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(980 + i), i % 2 ? '#e8e2d4' : '#d8d2c4'); b.group.scale.setScalar(.36); g.add(b.group); return { ...b, ph: i * 1.7 }; });
  // glows over the sleepers' heads: the two dreams of the night (40:5)
  const dg = [[-4.07, hC(-4.07, -4.5) + .3, -4.5, 0xcfd8ff], [-2.73, hC(-2.73, -4.4) + .3, -4.4, 0xffe0a0]].map(([x, y, z, c]) => { const s = spriteGlow(x, y, z, .55, c, 0), s2 = spriteGlow(x, y + .02, z, .2, 0xffffff, 0); g.add(s, s2); return [s, s2]; });

  let SID = '';
  const headingOf = (a, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null; return fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); };
  const heldAt = (a, fw, side, h, tt, y0 = 0) => { const p = kp(tt, a.keys), hd = headingOf(a, tt); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, gAt(p.x, p.z) + y0 + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const SIT = () => -.12, aU = k => k > .001 ? { a0x: -2.7 * k, a1x: -.3 * k, a0z: -.35 * k, a1z: .1 * k } : {};
  const M1 = [-3.8, -4.5], M2 = [-3.0, -4.4], JB = [-2.55, -5.4], MID = [-3.4, -4.62];
  const toM1 = p => toward(p.x, p.z, M1), toM2 = p => toward(p.x, p.z, M2), toMID = p => toward(p.x, p.z, MID);
  // ---- the guards bring the two men to the prison; they stand outside the gate until the night (40:3)
  act(gu1, route(0, [-3.7, -1.75]).go(.6, [-3.62, -3.45]).wait(12.4).keys, { sp: 6, show: W_(0, 12.4), face: (t, p) => p.mv ? null : headZ(0, 1) });
  act(gu2, route(0, [-2.9, -1.75]).go(.6, [-2.98, -3.45]).wait(12.4).keys, { sp: 6, show: W_(0, 12.4), face: (t, p) => p.mv ? null : headZ(0, 1) });
  const aCp1 = act(cup, route(0, [-3.45, -1.4]).go(.55, [-3.3, -3.2]).go(.55, [-3.3, -3.95]).go(.5, [-3.6, -4.3]).go(.4, M1).wait(8.4).keys, { sp: 6, show: W_(0, 8.4), y: t => SIT() * smooth(6.0, 6.6, t), face: (t, p) => p.mv ? null : headZ(.6, .3), ex: t => mixA({ lx: .14 * smooth(6.0, 6.6, t) }) });
  const aBk1 = act(bak, route(0, [-3.2, -1.05]).go(.55, [-3.3, -3.2]).go(.55, [-3.3, -3.95]).go(.5, [-3.05, -4.25]).go(.4, M2).wait(8.4).keys, { sp: 6, show: W_(0, 8.4), y: t => SIT() * smooth(6.5, 7.1, t), face: (t, p) => p.mv ? null : headZ(-.6, .3), ex: t => mixA({ lx: .14 * smooth(6.5, 7.1, t) }) });
  // ---- Joseph with a jar of water (40:4: he attended them)
  const aJ1 = act(joN, route(0, [-2.7, -5.3]).wait(3.0).go(.45, [-3.4, -4.88]).go(.4, [-3.45, -4.7]).wait(8.4).keys, { sp: 6, show: W_(0, 8.4), face: (t, p) => p.mv ? null : (t < 3.0 ? headZ(-.2, 1) : toward(p.x, p.z, t < 7.3 ? M1 : M2)), ex: t => mixA(aF(.15 * ON(t, 6.6, 7.0, 7.3, 7.6))) });
  // ---- the night: the three lie down; the two men dream (40:5)
  still(cup, [M1[0] + .22, M1[1]], 8.4, 12.4, { y: () => .045, face: () => Math.PI / 2, ex: t => ({ lx: -1.5, a0z: -.2, a1z: .2, s: 1 + .012 * Math.sin(t * 1.6) }) });
  still(bak, [M2[0] - .22, M2[1]], 8.4, 12.4, { y: () => .045, face: () => -Math.PI / 2, ex: t => ({ lx: -1.5, a0z: -.2, a1z: .2, s: 1 + .012 * Math.sin(t * 1.5 + 1) }) });
  still(joN, [JB[0] + .2, JB[1]], 8.4, 12.4, { y: () => .045, face: () => Math.PI / 2, ex: t => ({ lx: -1.5, a0z: -.2, a1z: .2, s: 1 + .012 * Math.sin(t * 1.4 + 2) }) });
  // ---- the morning: they sit, heads down; Joseph comes between them and asks (40:6-7); they answer (40:8); Joseph speaks (40:8, 12-19)
  const aCp3 = still(cup, M1, 12.4, 51.8, { y: SIT, face: () => Math.PI / 2 - .25, ex: t => mixA({ lx: .38 * (1 - smooth(14.8, 15.8, t)) + .1 - .06 * smooth(31.8, 32.6, t) + .08 * smooth(39, 41, t) }, aO(.5 * ON(t, 17.8, 18.4, 19.4, 20.2)), aO(.3 * ON(t, 38.8, 39.4, 41.0, 41.6))) });
  const aBk3 = still(bak, M2, 12.4, 51.8, { y: SIT, face: () => -Math.PI / 2 + .25, ex: t => mixA({ lx: .38 * (1 - smooth(14.8, 15.8, t)) + .08 + .3 * smooth(48.6, 50.4, t) }, aO(.5 * ON(t, 19.2, 19.8, 20.6, 21.0))) });
  const aJ3 = act(joN, route(12.4, [-3.1, -5.3]).go(.45, [-3.4, -4.88]).go(.4, MID).wait(35.4).go(.14, [-3.62, -4.62]).wait(41.0).go(.2, MID).wait(46.0).go(.3, [-3.2, -4.62]).wait(52.0).go(.3, [-3.3, -4.7]).wait(56.2).go(.28, [-3.3, -4.1]).wait(61.7).keys, { sp: 6, show: W_(12.4, 61.7),
    face: (t, p) => p.mv ? null : (t < 14.4 ? headZ(0, 1) : (t < 15.6 ? toM1(p) : (t < 16.6 ? toM2(p) : (t < 21.2 ? toM1(p) : (t < 24.0 ? headZ(0, 1) + .35 : (t < 25.0 ? toM1(p) : (t < 35.4 ? toM1(p) : (t < 46.0 ? toM1(p) : (t < 52.0 ? toM2(p) : (t < 56.0 ? headZ(1, -.3) : headZ(0, 1))))))))))),
    ex: t => mixA(aO(.45 * ON(t, 15.4, 15.9, 16.6, 17.2)), aF(.3 * ON(t, 17.4, 18.0, 20.4, 21.0)), aU(ON(t, 21.2, 21.8, 23.2, 23.8)), aO(.55 * ON(t, 23.8, 24.2, 24.9, 25.4)), { lx: -.12 * ON(t, 21.4, 22.0, 23.2, 23.8) + .07 * ON(t, 35.6, 36.4, 38.4, 38.9) },
      aO(.4 * ON(t, 32.4, 32.9, 34.4, 35.0)), aF(.55 * ON(t, 35.8, 36.4, 38.4, 38.9)), aO(.5 * ON(t, 39.0, 39.5, 41.0, 41.6)), aO(.4 * ON(t, 48.2, 48.8, 50.6, 51.2)), aF(.45 * ON(t, 57.8, 58.4, 61.0, 61.7))) });
  // ---- the third day (40:20-22): the cupbearer is back at Pharaoh's side, hands him the cup; the baker is not shown
  const aCf = act(cup, route(51.8, [-5.0, -.7]).go(.5, [-5.62, -.6]).wait(56.0).keys, { sp: 6, show: W_(51.8, 56.0), face: (t, p) => p.mv ? null : headZ(-1, 0), ex: t => mixA(aP(ON(t, 53.0, 53.5, 54.5, 55.0))) });
  const aPh = still(pha, [-6.02, -.6], 51.8, 56.0, { y: () => .06, face: () => Math.PI / 2, ex: t => mixA({ a0x: -1.1 * ON(t, 53.6, 54.1, 55.2, 55.8), a0z: -.2 * ON(t, 53.6, 54.1, 55.2, 55.8) }) });
  still(sv1, [-5.3, -1.55], 51.8, 56.0, { face: () => Math.PI / 2, ex: t => mixA(aF(.5)) });
  still(sv2, [-5.1, -1.5], 51.8, 56.0, { face: () => Math.PI / 2 + .2, ex: t => mixA(aF(.5)) });
  // ---- the dreams: second copies of the same people float in the sky above the yard
  const DX = DS[0], DZ = DS[1], bob = (t, ph) => DY + .04 * Math.sin(t * 1.4 + ph);
  const aCd = still(cupD, [DX - .36, DZ], 25.2, 32.2, { y: t => bob(t, 0), face: () => Math.PI / 2, ex: t => mixA(aP(.5 * smooth(28.6, 29.2, t))) });
  const aPd = still(phaD, [DX + .36, DZ], 25.2, 32.2, { y: t => bob(t, 1.5), face: () => -Math.PI / 2, ex: t => mixA({ a0x: -1.1 * smooth(30.4, 31.0, t), a0z: -.2 * smooth(30.4, 31.0, t) }) });
  still(bakD, [DX, DZ], 41.6, 47.8, { y: t => bob(t, 3), face: () => headZ(0, 1) + .12, ex: t => mixA(aF(.3)) });

  function update(t, camera, sid) {
    SID = sid;
    { const INT = ['attend', 'night', 'morn', 'ask', 'tell', 'hand', 'restore', 'remember', 'nothing', 'doom', 'empty'], lowS = INT.includes(sid), C = camera ? camera.position : null, gy = hC(PRIS[0], PRIS[1]);
      const side = C ? { N: C.z < PRIS[1] - 1.1 + .3, S: C.z > PRIS[1] + 1.1 - .3, E: C.x > PRIS[0] + 1.2 - .3, W: C.x < PRIS[0] - 1.2 + .3 } : {};
      for (const k of Object.keys(pWalls)) { const lo = lowS && side[k]; pWalls[k].scale.y = lo ? .4 : 1; pWalls[k].position.y = lo ? gy * .6 : 0; }
      if (pBeam) pBeam.visible = !(lowS && side.S); }
    const cam = camera && camera.position, MOOD = { night: 100, vine: 110, cup: 110, baskets: 110, birds: 110, forgot: 120, doom: 130, empty: 130 }, tc = MOOD[sid] ?? t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    const isDream = sid === 'vine' || sid === 'cup' || sid === 'baskets' || sid === 'birds', night = (sid === 'night' || isDream) ? 1 : (sid === 'forgot' ? .6 : 0), lit = (sid === 'night' || sid === 'forgot') ? 1 : 0, fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the town on the east bank stands as a distant city; its torches and windows light at night and dusk (cinematic interpretation)
    { townG.visible = true; const tk = lit;
      torchL.forEach((l, i) => { l.intensity = 0; }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = tk; w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    FIRES.forEach(f => { f.s.visible = f.s2.visible = false; });
    // ---- the prison: two torches at the gate and a warm light on the yard at night and dusk
    { const pk_ = lit;
      ptG.forEach(([s, s2], i) => { s.material.opacity = .85 * pk_ * (fl + .05 * i); s2.material.opacity = .9 * pk_ * fl; s.visible = s2.visible = pk_ > .01; });
      ptL.forEach((l, i) => { l.intensity = 1.7 * pk_ * (fl + .05 * i); }); prL.intensity = (sid === 'night' ? .8 : .5) * pk_ * fl; }
    // ---- the actors: every one is a pure function of time (and of the shot, for the dream copies)
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; if ((a.f === cupD || a.f === phaD) && sid !== 'cup') return; if (a.f === bakD && !(sid === 'baskets' || sid === 'birds')) return;
      const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // ---- the jar Joseph carries (until 8.4), then it stands by the mats
    { JARP.visible = true; if (t < 8.4) { const a = heldAt(aJ1, .16, 0, .17, t); JARP.position.set(a[0], a[1], a[2]); JARP.rotation.y = a[3]; } else { JARP.position.set(-3.1, hC(-3.1, -5.0) + .06, -5.0); JARP.rotation.y = .4; } }
    // ---- the gold cup: from the cupbearer's hand to Pharaoh's, in the dream and again on the third day
    { CUPP.visible = false;
      if (sid === 'cup') { const kk = smooth(30.5, 31.1, t), a = heldAt(aCd, .2, .08, .27, t, DY), b = heldAt(aPd, .17, .06, .25, t, DY); CUPP.visible = true; CUPP.position.set(lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(a[2], b[2], kk)); }
      else if (sid === 'feast') { const kk = smooth(54.0, 54.6, t), a = heldAt(aCf, .2, .08, .22, t), b = heldAt(aPh, .17, .06, .2, t, .06); CUPP.visible = true; CUPP.position.set(lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(a[2], b[2], kk)); } }
    thr.visible = tbl.visible = sid === 'feast';
    // ---- the vine grows: the trunk, then the three branches one after another (40:9-10)
    { vineG.visible = sid === 'vine'; const gt = smooth(25.4, 26.3, t); vTrunk.scale.set(1, Math.max(.001, gt), 1); vBr.forEach((b, i) => { const s = smooth(26.2 + i * .6, 27.0 + i * .6, t); b.scale.setScalar(Math.max(.001, s)); b.visible = s > .01; }); vPool.material.opacity = (sid === 'vine' ? .35 : 0) * smooth(25.2, 26.5, t); vPool.visible = sid === 'vine'; }
    // ---- the birds come to the top basket and eat (40:17)
    { const tb = [DX, DY + gAt(DX, DZ) + 1.31 * .45 + .06, DZ];
      BIRDS.forEach((b, i) => { const on = sid === 'birds', u = smooth(44.7 + i * .35, 46.0 + i * .35, t), r = lerp(1.1, .13, u), a = 1.2 + i * 1.57 - (1 - u) * 3.2 - t * .6 * (1 - u), peck = u > .98 ? Math.max(0, Math.sin(t * 7 + i * 1.9)) * .035 : 0;
        b.group.visible = on; b.group.position.set(tb[0] + Math.cos(a) * r, tb[1] + (1 - u) * (.45 + .1 * i) + .02 - peck, tb[2] + Math.sin(a) * r * .8);
        const dx = -Math.sin(a) * (1 - u) * 3 + (u > .98 ? Math.cos(a + 1.6) * .4 : 0), dz = Math.cos(a) * (1 - u) * 3 * .8 + (u > .98 ? Math.sin(a + 1.6) * .4 : 0); b.group.rotation.set(0, Math.atan2(-dz, dx), 0);
        b.wings.forEach((w2, k) => w2.rotation.x = (k ? 1 : -1) * Math.sin(t * 9 + i * 1.3) * (.25 + .5 * (1 - u))); }); }
    // ---- the dream light: motes around the dream stage, glows over the two sleepers
    dreamM.update(t, isDream ? .9 : 0, [DX, DY + gAt(DX, DZ) + .6, DZ]);
    dg.forEach(([s, s2], i) => { const k = (sid === 'night' ? smooth(9.4 + i * .5, 11.2 + i * .5, t) : 0) * (.8 + .2 * Math.sin(t * 2.1 + i)); s.material.opacity = .75 * k; s2.material.opacity = .6 * k; s.visible = s2.visible = k > .01; });
    dust.update(t, 0, [0, 0, 0]); dustR.update(t, 0, [0, 0, 0]);
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const MORN = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.5, [9, 3.4, -5], .5, '#ffcf9a', FD, 14];
  const light = [Dk(0, ...GOLD), Dk(8.5, ...GOLD), Dk(12.2, ...MORN), Dk(50, ...MORN), Dk(51.6, ...GOLD), Dk(90, ...GOLD)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [8.5, ['#5a86c4', '#f6c890']], [12.2, ['#6a8ec8', '#f8d4a0']], [50, ['#6a8ec8', '#f8d4a0']], [51.6, ['#5a86c4', '#f6c890']], [90, ['#5a86c4', '#f6c890']], [100, ['#0e1636', '#2a3466']], [110, ['#070c24', '#1a2a5a']], [120, ['#2a3270', '#d08060']], [130, ['#7a8cb0', '#d8c8b4']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL], state };
}
