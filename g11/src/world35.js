// Episode 35: Genesis 35. God tells Jacob "go up to Bethel, settle there and make an altar" (35:1); Jacob tells his household to put away the foreign gods, purify themselves and change their clothes (35:2); they give him the foreign gods and the rings in their ears, and he buries them under the oak near Shechem (35:4).
// As they journey a terror from God falls on the towns around them and they do not pursue the sons of Jacob (35:5); Jacob comes to Luz, that is Bethel, builds an altar there (35:6-7); God appears to him again and blesses him, saying "your name is Jacob, you shall no longer be called Jacob, but Israel shall be your name" (35:9-10).
// They journey from Bethel; when there is still some distance to Ephrath Rachel begins to give birth and has a hard labor; the midwife says "Do not be afraid; now you will have another son"; as her soul departs, for she died, she names him Ben-oni, but his father calls him Benjamin (35:16-18); Rachel dies and is buried on the road to Ephrath, that is Bethlehem, and Jacob sets up a pillar over her tomb (35:19-20).
// Jacob comes to his father Isaac at Mamre; Isaac dies, old and full of days, and his sons Esau and Jacob bury him (35:27-29).
// Cinematic interpretation: the floating land, the camp, the great oak, the heap of small figures and rings laid on a cloth, the walled town with its gate closed, the column on the road, the hill and the altar of stones, the shaft of light that stands for God's appearing, the lone tent with its lamp, the pillar of stones, the bier carried by the two brothers, the dusk, the night and the dawn.
// The text gives no landscape and no thoughts. God is shown only as light. Rachel's death is not shown: the film holds on the tent and the lamp. The film leaves out Deborah's death (35:8), the promises of 35:11-12, the pillar and the drink offering at Bethel (35:14-15), Reuben and Bilhah (35:22) and the list of the twelve sons (35:22-26); the narration shortens Rachel's naming of Ben-oni in 35:18.
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
export const JD = [-4.7, .35];                                                          // where Jacob stands in the camp
export const HEAP = [-4.3, -.4], OAK = [-3.0, -2.0];                                    // the cloth where the household lays down its other gods; the great oak
export const BETH = [12.2, 5.3];                                                        // Bethel: the altar on the north-east hill
export const RACH = [-1.9, 2.9];                                                        // the lone tent beside the road (Ephrath)
export const PIL = [-1.1, .45];                                                         // the pillar over the grave beside the road

// ---------------- terrain: open country, a river with a shallow ford in the middle, a ridge in the east
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.8, -5.4, 1.5, 3.8], [3.5, -10.5, 1.1, 5], [12.6, 5.4, 1.1, 3.8], [-2, -10.8, 1.2, 4], [.2, 10.8, 1.0, 4], [-8.5, 9.4, .8, 3.6]];
const FLATS = [[CAMPC[0], CAMPC[1], .31, 4.8], [CITY[0], CITY[1], .33, 4.9], [EAST[0] + .6, EAST[1] - .6, .32, 3.2], [BETH[0], BETH[1], .98, 1.9], [RACH[0], RACH[1], .3, 1.5], [PIL[0], PIL[1], .3, 1.0]];
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
  b.lerp(C3('#e8d6aa'), .7 * smooth(.8, .3, dPath(x, z)));
  if (y < .17) b.lerp(C3('#8a9686'), .75); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, CITY, GX, GZ, JD, CAMPC, PATH, RV, FORD, HEAP, OAK, BETH, RACH, PIL, EAST };
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
  [[-10.0, 3.0, 2.4], [-10.6, -3.2, 2.0], [-10.4, 6.0, 1.9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-8.0, -6.4, 2.0], [-5.4, -8.4, 2.1], [6.0, -8.2, 1.8]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-3.6, -5.2, .9], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [8.8, 5.6, .8]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[13.2, 1.0, 1.0], [13.4, -1.6, 1.1], [9.4, 9.8, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.abs(x - RV(z)) < RW + 1.6 || Math.hypot(x - CAMPC[0], z - CAMPC[1]) < 4.4 || dPath(x, z) < 1.3 || (x > 4.6 && x < 11.8 && z > -3.8 && z < 4.4) || (x > -5.6 && x < -.8 && z > -4.4 && z < -.2) || Math.hypot(x - BETH[0], z - BETH[1]) < 2.6 || Math.hypot(x - RACH[0], z - RACH[1]) < 2.4 || Math.hypot(x - PIL[0], z - PIL[1]) < 1.6;
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
  const TENTS = [[-8.5, -.9, '#cdb48c', .5], [-7.3, 1.0, '#c2a67a', .2], [-6.1, -1.5, '#d4c29c', -.4], [-5.8, .5, '#b8946a', .1]];
  TENTS.forEach(([x, z, c, ry], i) => { const m = tentMesh(rng(500 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); });

  // ---- a walled town on the east bank (35:5); its gate is in the west wall facing the road, and it stays shut
  { const b = new GB(rng(341)), H = .86, T = .2, CX = CITY[0], CZ = CITY[1], x0 = CX - CHD, x1 = CX + CHD, z0 = CZ - CHW, z1 = CZ + CHW, gw = .42, y_ = (x, z) => hC(x, z);
    const wall = (x, z, w, d) => { b.box('#c2ae86', [x, y_(x, z) + H / 2, z], [w, H, d], [0, 0, 0], .04); const n = Math.floor(Math.max(w, d) / .34); for (let k = 0; k < n; k++) { const u = (k + .5) / n - .5; b.box('#b09c74', [x + (w > d ? u * w : 0), y_(x, z) + H + .07, z + (w > d ? 0 : u * d)], [w > d ? .16 : T * 1.2, .14, w > d ? T * 1.2 : .16], [0, 0, 0], .03); } };
    wall(CX, z0, CHD * 2, T); wall(CX, z1, CHD * 2, T); wall(x1, CZ, T, CHW * 2);
    wall(x0, (z0 + CZ - gw) / 2, T, (CZ - gw) - z0); wall(x0, (z1 + CZ + gw) / 2, T, z1 - (CZ + gw));
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [CX, z0], [CX, z1]]) { b.box('#cbb78e', [x, y_(x, z) + .7, z], [.5, 1.4, .5], [0, 0, 0], .04); b.box('#b09c74', [x, y_(x, z) + 1.46, z], [.58, .12, .58], [0, 0, 0], .03); }
    for (const s of [-1, 1]) { const z = CZ + s * (gw + .27); b.box('#cbb78e', [x0, y_(x0, z) + .72, z], [.54, 1.44, .5], [0, 0, 0], .04); b.box('#b09c74', [x0, y_(x0, z) + 1.5, z], [.62, .12, .58], [0, 0, 0], .03); }
    b.box('#b8a47c', [x0, y_(x0, CZ) + .76, CZ], [.3, .2, gw * 2 + .08], [0, 0, 0], .03); b.box('#9a8664', [x0, y_(x0, CZ) + .87, CZ], [.34, .05, gw * 2 + .16], [0, 0, 0], .02);
    b.box('#2a1c10', [x0 + .55, y_(x0, CZ) + .01, CZ], [1.1, .02, gw * 2], [0, 0, 0], .0);
    ca.add(meshOf(b)); }
  ca.add(meshOf(houseBlock(rng(342), CITY[0] + .5, CITY[1] - 1.9, 3, 2, .62, hC, 0)), meshOf(houseBlock(rng(343), CITY[0] + .5, CITY[1] + 1.9, 3, 2, .62, hC, 0)), meshOf(houseBlock(rng(344), CITY[0] + 1.75, CITY[1], 1, 3, .66, hC, 0)));
  { const b = new GB(rng(345)); b.box('#a08a64', [CITY[0] - .2, hC(CITY[0], CITY[1]) + .1, CITY[1] + .02], [.34, .2, .34], [0, 0, 0], .03); b.box('#3a2a1c', [CITY[0] - .2, hC(CITY[0], CITY[1]) + .21, CITY[1] + .02], [.2, .02, .2], [0, 0, 0], .01); ca.add(meshOf(b)); }
  const TX = GX - .34, torchPos = [[TX, GZ - .69], [TX, GZ + .69]];                                        // two torches on the faces of the gate towers
  { const b = new GB(rng(346)); for (const [x, z] of torchPos) b.box('#5a3a22', [x, hC(x, z) + .72, z], [.03, .3, .03], [0, 0, 0], .01); ca.add(meshOf(b)); }
  const torchG = torchPos.map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .92, z, .3, 0xffa850, 0), s2 = spriteGlow(x, hC(x, z) + .9, z, .12, 0xfff0c0, 0); g.add(s, s2); return [s, s2]; });
  const torchL = torchPos.map(([x, z]) => { const l = new THREE.PointLight(0xffa050, 0, 5.2, 1.6); l.position.set(x - .1, hC(x, z) + 1.0, z); return l; });
  const gateL = new THREE.PointLight(0xff9a48, 0, 4.8, 1.5); gateL.position.set(GX + 1.0, hC(GX, GZ) + .55, GZ);
  const gateG = spriteGlow(GX + .55, hC(GX, GZ) + .36, GZ, 1.0, 0xff9a50, 0); g.add(gateG);
  const WINS = []; { const Rr = rng(347), pts = []; for (let i = 0; i < 200 && pts.length < 24; i++) { const x = CITY[0] + .2 + (Rr() - .5) * 4.2, z = CITY[1] + (Rr() - .5) * 5.2; if (Math.abs(z - CITY[1]) < .62 && x < CITY[0] + 1.2) continue; if (Math.hypot(x - CITY[0], z - CITY[1]) < .6) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .42)) continue; pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + .38 + ((i * 7) % 5) * .06, z, .3, 0xffc070, 0); g.add(s); WINS.push({ s, ph: i * 1.9, ord: Rr() }); }); }
  const campL = new THREE.PointLight(0xffa860, 0, 5.5, 1.5); campL.position.set(-3.7, hC(-3.7, .6) + 1.0, .7);

  { const b = new GB(rng(348)), x0 = GX; b.box('#6a4a2a', [x0 + .04, hC(x0, GZ) + .42, GZ], [.1, .84, .84], [0, 0, 0], .03); for (const dz of [-.28, 0, .28]) b.box('#4a3220', [x0 - .02, hC(x0, GZ) + .42, GZ + dz], [.05, .8, .04], [0, 0, 0], .01); b.box('#4a3220', [x0 - .02, hC(x0, GZ) + .36, GZ], [.05, .04, .8], [0, 0, 0], .01); ca.add(meshOf(b)); }
  // ---- the great oak by the camp (35:4): its own tree, never hidden by the camera helper
  { const m = new THREE.Mesh(roundTreeGeo(2.5, R, ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']), lam); m.position.set(OAK[0], hC(OAK[0], OAK[1]) - .02, OAK[1]); m.castShadow = true; m.rotation.y = 1.3; ca.add(m); }
  const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lamC('#6a5038')); mound.scale.set(.3, .07, .2); mound.position.set(OAK[0] + .62, hC(OAK[0] + .62, OAK[1] + .45) - .01, OAK[1] + .45); mound.receiveShadow = true; ca.add(mound);
  // ---- the foreign gods and the rings, laid on a cloth (35:2, 4): small figures of gold, bronze and silver, and earrings
  const heapG = new THREE.Group(); heapG.position.set(HEAP[0], hC(HEAP[0], HEAP[1]), HEAP[1]); g.add(heapG);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(.78, .012, .66), lamC('#c8b48c')); cloth.position.y = .008; cloth.rotation.y = .3; cloth.receiveShadow = true; heapG.add(cloth);
  const ITEMS = []; { const Ri = rng(351); for (let i = 0; i < 18; i++) { const b = new GB(rng(360 + i)), ang = i * 2.4 + Ri() * .4, rr = .06 + Ri() * .22 * Math.sqrt(i / 17 + .15), kind = i % 3, col = ['#d4a73c', '#9a6a32', '#c0c0b6', '#e0b84c'][i % 4];
      if (kind === 2) b.add(G.ico0, col, [0, .02, 0], [.07, .018, .07], [0, 0, 0], .02); else { b.box(col, [0, .06, 0], [.045, .11, .04], [0, 0, 0], .01); b.add(G.ico0, col, [0, .13, 0], [.034, .034, .034], [0, 0, 0], .01); }
      const m = new THREE.Mesh(b.build(), lam); m.position.set(Math.cos(ang) * rr, .012 + (i > 11 ? .04 : 0), Math.sin(ang) * rr); m.rotation.set(i % 3 === 0 ? 1.2 : 0, ang * 2, 0); m.castShadow = true; heapG.add(m); ITEMS.push(m); } }
  // ---- the altar at Bethel (35:7): stones set one on another on the hilltop
  const altar = new THREE.Group(); altar.position.set(BETH[0], hC(BETH[0], BETH[1]) - .02, BETH[1]); ca.add(altar);
  const STN = [[-.34, .1, .08, .3, .2, .26, .2], [.0, .1, -.04, .32, .22, .27, -.1], [.34, .1, .09, .29, .2, .25, .4], [-.17, .29, .03, .3, .19, .25, .3], [.17, .29, -.02, .3, .2, .26, -.3], [.0, .46, .02, .28, .18, .24, .1], [-.02, .12, -.34, .26, .18, .22, .6]];
  const stones = STN.map(([x, y, z, sx, sy, sz, ry], i) => { const b = new GB(rng(77 + i)); b.add(G.ico0, pk(rng(78 + i), ['#9a8e7c', '#a99c86', '#85796a']), [0, 0, 0], [sx, sy, sz], [.2 * i, ry, .1], .06); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; altar.add(m); return m; });
  const altarL = new THREE.PointLight(0xffc878, 0, 7, 1.5); altarL.position.set(BETH[0] - .3, hC(BETH[0], BETH[1]) + 1.2, BETH[1] + .4);
  const shaftB = shaft(8, .36, 1.2, [1, .86, .5], 1, .3); shaftB.position.set(BETH[0], hC(BETH[0], BETH[1]), BETH[1]); g.add(shaftB);
  const poolB = pool(1.5, 0xffd890, 0); poolB.position.set(BETH[0], hC(BETH[0], BETH[1]) + .03, BETH[1]); g.add(poolB);
  const shaftJ = shaft(7, .3, .95, [1, .84, .5], 1, .25); shaftJ.position.set(JD[0] + 1.15, hC(JD[0] + 1.15, JD[1] + .1), JD[1] + .1); g.add(shaftJ);
  const poolJ = pool(1.1, 0xffd890, 0); poolJ.position.set(JD[0] + 1.15, hC(JD[0] + 1.15, JD[1] + .1) + .03, JD[1] + .1); g.add(poolJ);
  const bethM = makeMotes({ n: 70, area: [1.7, 3.6, 1.7], size: .032, v: .38, seed: 61, color: 0xffd47a }); g.add(bethM.mesh);
  const callM = makeMotes({ n: 40, area: [1.4, 3.0, 1.4], size: .028, v: .34, seed: 62, color: 0xffd47a }); g.add(callM.mesh);
  // ---- Rachel's tent beside the road, its door toward the road, and the lamp at its door (35:16)
  const rTent = tentMesh(rng(551), '#d4c29c', .95); rTent.position.set(RACH[0], hC(RACH[0], RACH[1]) - .02, RACH[1]); rTent.rotation.y = Math.PI + .12; ca.add(rTent);
  const RDIR = [Math.sin(Math.PI + .12), Math.cos(Math.PI + .12)], RDOOR = [RACH[0] + RDIR[0] * .86, RACH[1] + RDIR[1] * .86];
  const lampG = spriteGlow(RDOOR[0], hC(RDOOR[0], RDOOR[1]) + .28, RDOOR[1], .9, 0xffa850, 0), lampG2 = spriteGlow(RDOOR[0], hC(RDOOR[0], RDOOR[1]) + .26, RDOOR[1], .3, 0xfff0c0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa458, 0, 5.2, 1.6); lampL.position.set(RDOOR[0] + RDIR[0] * .3, hC(RDOOR[0], RDOOR[1]) + .6, RDOOR[1] + RDIR[1] * .3);
  let rRug; { const b = new GB(rng(352)); b.box('#8a4a3c', [RDOOR[0] + RDIR[0] * .45, hC(RDOOR[0], RDOOR[1]) + .012, RDOOR[1] + RDIR[1] * .45], [.7, .02, .5], [0, 0, 0], .02); rRug = meshOf(b); ca.add(rRug); }
  // ---- the pillar over the grave (35:20): stones set one on another; a low heap at its foot
  const pillar = new THREE.Group(); pillar.position.set(PIL[0], hC(PIL[0], PIL[1]) - .02, PIL[1]); ca.add(pillar);
  const PST = [[-.3, .06, .1, .26, .13, .2, .3], [.3, .06, -.04, .24, .12, .2, -.2], [.0, .06, .22, .26, .12, .18, .1], [.0, .07, -.22, .24, .13, .2, .5], [0, .2, 0, .24, .16, .22, .2], [0, .38, 0, .2, .2, .18, -.2], [0, .58, 0, .17, .2, .16, .4], [0, .78, 0, .14, .18, .13, .1]];
  const pStones = PST.map(([x, y, z, sx, sy, sz, ry], i) => { const b = new GB(rng(97 + i)); b.add(G.ico0, pk(rng(98 + i), ['#a89a84', '#b4a690', '#9a8e7c']), [0, 0, 0], [sx, sy, sz], [.1 * i, ry, .08], .05); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; pillar.add(m); return m; });
  // ---- the body wrapped in linen on a bier (cinematic interpretation: the text says only that she, and later Isaac, was buried)
  const mkBier = () => { const br = new THREE.Group(), b = new GB(rng(31)); b.box('#8a4a3c', [0, .012, 0], [.98, .02, .4], [0, 0, 0], .02); b.box('#c8a050', [0, .024, 0], [.92, .01, .07], [0, 0, 0], .01);
    b.box('#efe6d2', [0, .075, 0], [.76, .1, .19], [0, 0, 0], .02); b.add(G.ico1, '#efe6d2', [-.37, .085, 0], [.09, .07, .09], [0, 0, 0], .02); b.box('#e0d6bc', [.12, .13, 0], [.24, .02, .2], [0, 0, 0], .01);
    b.box('#6b4a2c', [0, -.02, .26], [1.3, .03, .03], [0, 0, 0], .01); b.box('#6b4a2c', [0, -.02, -.26], [1.3, .03, .03], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; br.add(m); g.add(br); br.visible = false; return br; };
  const bierR = mkBier(), bierI = mkBier();
  // ---- the flocks that travel with Jacob: sheep, goats and donkeys
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const GOATS = [0, 1].map(i => place(mkGoat(740 + i), 0, 0, 0)), WHITE = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0));
  const donkeys = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); ca.add(s.group); return s; });

  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);
  const CLOUD = [[0, '#e8c8a0'], [14, '#e8c8a0'], [17, '#c8b0a8'], [21, '#e8c8a0'], [25, '#f0d4a0'], [32, '#e8b898'], [37, '#c89a98'], [40, '#6a6a98'], [42, '#4a4a78'], [46, '#4a4a78'], [49, '#e0a898'], [54, '#e8b898'], [60, '#e8a888'], [90, '#e8a888']];
  const CEM = [[0, '#6a5848'], [32, '#6a5848'], [37, '#5a4a58'], [40, '#3a3a58'], [42, '#22223a'], [46, '#22223a'], [49, '#5a4a52'], [54, '#6a5848'], [60, '#6a4a3e'], [90, '#6a4a3e']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the people. Jacob, Rachel, Leah and the sons are the same models as in Genesis 33 and 34; Isaac (older), Esau, the midwife and the household are shown here
  const jacob = mkJacob(rng(87)), rachel = mkRachel(rng(88)), leah = mkLeah(rng(90)), isaac = mkIsaac(rng(83)), esau = mkEsau(rng(114));
  const bil = mkMaid(rng(121), '#7a9a6a', '#b8825a', '#d8cfb4', '#a87a4a', 851), zil = mkMaid(rng(122), '#c09a58', '#c08a5e', '#e0d4bc', '#8a7a4a', 852), mid = mkMaid(rng(123), '#6a7aa8', '#b98a62', '#e8dcc4', '#c8a050', 853);
  const mkSon = (sd, top, seed, sc, beard) => person(rng(sd), { pants: '#d9ccb0', top, skin: '#c58c60', hair: '#2a1a10', beard, sash: '#8a5a2a', seed }, sc);
  const SON = { reu: mkSon(93, '#6a7fa0', 930, .44, '#2a1a10'), sim: mkSon(94, '#a8683a', 931, .44, '#2a1a10'), lev: mkSon(95, '#5f8a5a', 932, .43, '#2a1a10'), jud: mkSon(96, '#c9a15a', 933, .42, '#3a2616'), dan: mkSon(97, '#7a4a3a', 934, .41), gad: mkSon(99, '#a2564e', 936, .41), iss: mkSon(101, '#6a5a8a', 938, .4) };
  const mC = ['#6f8a62', '#9a4a42', '#8a6a4a', '#4f7a8a', '#c9a15a', '#7a5a8a'], mS = ['#a8714a', '#b98a62', '#a8714a', '#b98a62', '#c38a5c', '#a8714a'];
  const MEN = mC.map((c, i) => mkHerd(rng(130 + i), c, mS[i], 870 + i, i % 2 ? '#d8ccb0' : '#cdbd98'));
  const CAPW = [mkMaid(rng(150), '#8a6a9a', '#b8825a', '#d8cfb4', '#a87a4a', 890), mkMaid(rng(151), '#5a8a7a', '#c08a5e', '#e0d4bc', '#8a7a4a', 891)];
  const CAPK = [mkKid(rng(154), '#a87a5a', 894, .25), mkKid(rng(155), '#6a8a9a', 895, .27), mkKid(rng(156), '#9a6a7a', 896, .23)];
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacob.group.add(mkStaff());
  const bundle = new THREE.Mesh(new THREE.BoxGeometry(.22, .15, .17), lamC('#cdbd98')); bundle.position.set(0, .6, .2); bundle.castShadow = true; jacob.group.add(bundle); bundle.visible = false;
  const babe = new THREE.Mesh(new THREE.BoxGeometry(.16, .1, .12), lamC('#efe6d2')); babe.position.set(0, .64, .2); babe.castShadow = true; jacob.group.add(babe); babe.visible = false;
  const ALLP = [jacob, rachel, leah, isaac, esau, bil, zil, mid, ...Object.values(SON), ...MEN, ...CAPW, ...CAPK]; ALLP.forEach(o => g.add(o.group));
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


  // ---- who goes where. Phases, each with its own cast: P1 camp, oak and the road east | P2 Bethel | P3 the road back west to the lone tent | P4 the bier and the pillar | P5 Isaac in the camp | P6 the bier carried away
  const T2 = 21.7, T3 = 29.9, T4 = 46.5, T5 = 52.9, T6 = 57.0, T7 = 61.8;
  const mixA = (...o) => { const r = { a0z: -.1, a1z: .1 }; for (const x of o) for (const k in x) r[k] = (r[k] || 0) + x[k]; return r; };
  const aF = k => k > .001 ? { a0x: -.9 * k, a1x: -.9 * k, a0z: .35 * k, a1z: -.35 * k } : {};      // hands together in front: giving, holding, carrying
  const aU = k => k > .001 ? { a0x: -2.35 * k, a1x: -2.35 * k, a0z: -.2 * k, a1z: .2 * k } : {};      // arms raised
  const aO = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.95 * k, a1z: .95 * k } : {};        // hands open to the sides
  const toward = (x, z, p) => headZ(p[0] - x, p[1] - z);
  const RING = i => { const a = (i * 45 + 20) * Math.PI / 180; return [HEAP[0] + .86 * Math.cos(a), HEAP[1] + .86 * Math.sin(a)]; };
  const OAKF = [OAK[0] - .5, OAK[1] + .25];                                  // where Jacob kneels at the foot of the oak
  const GIVE = [8.7, 9.15, 9.6, 10.05, 10.5, 10.95, 11.4, 11.6];            // when each of the eight at the cloth lays something down (35:4)
  const pairPath = (t0, v, W, d) => { const n = W.length, un = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
    const f = route(t0, W[0]); for (let i = 1; i < n; i++) f.go(v, W[i]);
    const u0 = un(W[0], W[1]), uN = un(W[n - 2], W[n - 1]), r = route(t0, [W[0][0] - d * u0[0], W[0][1] - d * u0[1]]);
    for (let i = 1; i < n - 1; i++) r.go(v, W[i]); r.go(v, [W[n - 1][0] - d * uN[0], W[n - 1][1] - d * uN[1]]);
    return { f: f.keys, r: r.keys }; };                                        // two bearers d apart on one path, arriving together

  // ===== P1 (a1, a2, b1): Jacob in the camp, the household at the cloth, the burial at the oak, the column on the road (35:1-5)
  const RINGERS = [[jacob, 4], [leah, 5], [rachel, 6], [SON.reu, 7], [SON.sim, 0], [bil, 1], [SON.lev, 2], [zil, 3]];
  const HOME = [JD, [-6.3, -.3], [-5.0, -2.3], [-2.4, -1.5], [-2.6, .6], [-3.0, 1.4], [-4.2, -2.3], [-5.2, 1.6]];
  RINGERS.forEach(([f, k], i) => { const rg = RING(k), r = route(0, HOME[i]), so = ((i % 3) - 1) * .25;
    if (i === 0) { r.wait(6.4).go(1.2, rg).wait(11.9).go(1.5, OAKF).wait(14.9).go(1.7, [-3.2, 1.2]); alongE(r, 1.35, 0, -3.0, 3.2); r.go(1.35, [4.3, 2.7]).go(1.35, [5.3, 3.9]); }
    else { r.wait(6.5 + .22 * i).go(1.25, rg).wait(12.6 + .1 * i).go(1.3, [-3.3, 1.2 + so]).wait(15.2 + .18 * i); alongE(r, 1.3, so, -3.0, 3.2); r.go(1.3, [4.3, 2.7 + so]).go(1.3, [5.3, 3.9 + so]); }
    act(f, r.keys, { ph: 1.3 + i * 1.1, sp: i === 0 ? 5.5 : 7, show: W_(0, T2),
      face: (t, p) => { if (p.mv) return null;
        if (i === 0) { if (t < 6.3) return headZ(1, .12); if (t > 7.4 && t < 12.0) return toward(p.x, p.z, HEAP); if (t > 13.2 && t < 14.9) return toward(p.x, p.z, OAK); return null; }
        return (t > 7.9 && t < 12.6) ? toward(p.x, p.z, HEAP) : (t < 6.5 ? headZ(1, .1 * i) : null); },
      ex: t => { if (i === 0) { const lay = ON(t, 7.4, 8.0, 10.6, 11.0), kn1 = ON(t, 10.9, 11.3, 11.5, 11.9), kn2 = ON(t, 13.3, 13.7, 14.5, 14.95), dg = kn2 * (.5 + .5 * Math.sin(t * 9));
          return { ...mixA(aO(lay), aF(.6 * kn1 + .9 * dg)), s: 1 - .22 * kn1 - .24 * kn2, lx: .4 * kn1 + .46 * kn2 }; }
        const gv = ON(t, GIVE[i] - .35, GIVE[i], GIVE[i] + .45, GIVE[i] + .85); return { ...mixA(aF(gv)), lx: .12 * gv }; } }); });
  // the others in the camp join the column
  const OTH = [[SON.jud, [-7.9, .2], 0], [SON.dan, [-8.2, 2.0], 1], [SON.gad, [-7.2, -2.4], 2], [SON.iss, [-4.7, -2.3], 0], [CAPW[0], [-7.2, 2.6], 1], [CAPW[1], [-8.1, 2.4], 2], [CAPK[0], [-6.0, 2.4], 0], [CAPK[1], [-5.0, 2.2], 1], [CAPK[2], [-4.5, 2.6], 2], [MEN[0], [-8.8, 1.1], 0], [MEN[1], [-5.1, -2.9], 1], [MEN[2], [-7.0, -2.6], 2]];
  OTH.forEach(([f, h, o], i) => { const off = (o - 1) * .22, r = route(0, h); r.wait(12.4 + .1 * i).go(1.25, [-3.7 - .25 * (i % 3), 1.1 + off + .1 * (i % 2)]).wait(15.2 + .18 * i); alongE(r, 1.3, off, -3.0, 3.2); r.go(1.3, [4.3, 2.7 + off]).go(1.3, [5.3, 3.9 + off]);
    act(f, r.keys, { ph: 4 + i * 1.4, sp: 7, show: W_(0, T2), face: (t, p) => (!p.mv && t < 12.4) ? headZ(1, .15 * (o - 1)) : null, ex: t => ({ lx: .06 * ON(t, 8, 9, 11.5, 12.4) }) }); });
  // the flocks go with them
  const ANIM = [...WHITE, ...GOATS, ...donkeys], AK = new Map();
  ANIM.forEach((a, i) => { const off = ((i % 5) - 2) * .2 + .45, r = route(0, [-5.6 + .35 * (i % 5), 2.4 + .3 * (i % 3)]); r.wait(14.6 + .25 * i).go(1.2, [-3.0, 1.2 + off]); alongE(r, 1.25, off, -2.9, 3.2); r.go(1.25, [4.6, 2.9 + off]).go(1.25, [5.6, 3.9 + off]); AK.set(a, r.keys); });

  // ===== P2 (b2): Bethel (35:6-10): the household climbs the hill, Jacob builds the altar, God appears as light
  const BP = [[jacob, [-.95, -.1]], [leah, [-1.75, .55]], [rachel, [-1.6, -.7]], [SON.reu, [-2.15, -.05]], [SON.sim, [-2.35, .85]], [SON.lev, [-2.5, -.9]], [SON.jud, [-2.95, .1]]];
  BP.forEach(([f, d], i) => { const sp_ = [BETH[0] + d[0], BETH[1] + d[1]], r = route(T2 - .8, [sp_[0] - 2.4, sp_[1] - 1.2]); r.go(1.15 + .02 * i, sp_).wait(T3);
    act(f, r.keys, { ph: 2 + i * 1.5, sp: 6, show: W_(T2, T3), face: (t, p) => !p.mv ? toward(p.x, p.z, BETH) : null,
      ex: t => { if (i === 0) { const lay = ON(t, 22.8, 23.2, 24.8, 25.2), kn = ON(t, 25.2, 25.9, 27.6, 28.1), up = ON(t, 27.4, 28.0, 29.7, 29.95);
          return { ...mixA(aF(.9 * lay + .4 * kn), aU(up)), s: 1 - .22 * kn, lx: .4 * lay + .34 * kn }; }
        const bw = ON(t, 25.4, 26.2, 27.6, 28.2); return { ...mixA(aF(.5 * bw)), lx: .14 * bw }; } }); });

  // ===== P3 (c1, c2): back along the road to the lone tent; Rachel goes in; the midwife; the lamp; the child (35:16-18)
  const CW = [[leah, 0, 1.2, [-.7, 1.75]], [bil, .2, 1.2, [-2.9, 1.65]], [zil, -.2, 1.2, [-3.2, 1.3]], [SON.reu, -.15, 1.1, [1.0, 1.55]], [SON.sim, .2, 1.1, [1.5, .75]], [SON.lev, .35, 1.1, [2.0, 1.4]], [SON.jud, -.3, 1.1, [2.5, .85]]];
  CW.forEach(([f, off, v, fin], i) => { const r = route(T3 + .12 * i, [4.4, 2.6 + off]); r.go(v, [3.4, .9 + off]); along(r, v, off, 3.2, fin[0] + .1); r.go(v, fin).wait(T4);
    act(f, r.keys, { ph: 5 + i * 1.2, sp: 7, show: W_(T3, T4), face: (t, p) => { if (p.mv) return null; if (t > 31.5 && t < T4) return toward(p.x, p.z, i < 3 ? [RACH[0], RACH[1] - .6] : [RACH[0], RACH[1]]); return null; },
      ex: t => { const gr = ON(t, 38.8, 39.8, 46.0, 46.5), bw = ON(t, 41.0, 42.0, 45.6, 46.4); return { ...mixA(), lx: .2 * gr + .08 * bw, s: i < 3 ? 1 - .2 * bw : 1 }; } }); });
  { const r = route(T3, [4.2, 2.5]); r.go(1.25, [3.4, .9]); along(r, 1.25, 0, 3.2, -1.1); r.go(1.0, [-1.4, 1.7]).go(.85, [RDOOR[0] + .1, RDOOR[1] - .05]).go(.8, [RACH[0] - .02, RACH[1] - .2]);
    const tEnd = r.keys[r.keys.length - 1][0];
    act(rachel, r.keys, { ph: 2, sp: 6, show: t => t >= T3 && t < tEnd, ex: t => { const lab = smooth(31.6, 33.2, t); return { ...mixA(aF(.55 * lab)), lx: .14 + .22 * lab }; } }); }
  { const r = route(T3, [4.3, 2.4]); r.go(1.2, [3.4, .9]); along(r, 1.2, 0, 3.2, -.1); r.go(1.0, [-.2, 1.35]).wait(37.2).go(.6, [-.75, 1.5]).wait(38.6).go(.5, [-1.2, 1.5]).wait(41.0).go(.4, [-1.35, 1.5]).wait(T4);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(T3, T4), face: (t, p) => (!p.mv && t > 33.0) ? toward(p.x, p.z, RDOOR) : null,
      ex: t => { const wr = ON(t, 33.6, 34.6, 37.4, 38.2), kn = ON(t, 40.4, 41.6, 43.2, 43.8), hb = ON(t, 43.6, 44.2, 46.2, 46.5); return { ...mixA(aF(.9 * hb + .5 * wr)), s: 1 - .24 * kn, lx: .1 * wr + .38 * kn }; } }); }
  { const r = route(33.3, [RACH[0] - .05, RACH[1] - .15]).go(.9, [RDOOR[0] + RDIR[0] * .5, RDOOR[1] + RDIR[1] * .5]).wait(T4);
    act(mid, r.keys, { ph: 3, sp: 6, show: W_(33.3, T4), face: (t, p) => !p.mv ? headZ(1.5, -.2) : null, ex: t => ({ ...mixA(aO(ON(t, 35.0, 35.8, 37.8, 38.6))), lx: .1 * ON(t, 38.8, 39.6, 41.5, 43) }) }); }

  // ===== P4 (d1): the bier is carried to the roadside, the pillar is raised (35:19-20)
  const BEAR = { d1: pairPath(T4, .8, [[-3.05, 1.5], [-1.25, 1.45]], 1.3), e1: pairPath(T6, .95, [[-3.6, 1.5], [-1.0, 1.15], [.45, 1.2], [2.2, 1.0]], 1.3) };
  [[SON.sim, 'f'], [SON.lev, 'r']].forEach(([f, w], i) => { act(f, BEAR.d1[w], { ph: 1 + i, sp: 6, show: W_(T4, T5), face: (t, p) => (!p.mv && t > 49.0) ? toward(p.x, p.z, PIL) : null,
      ex: t => { const kn = ON(t, 48.7, 49.3, 49.7, 50.6); return { ...mixA(aF(ON(t, 46.4, 46.8, 48.6, 49.1))), s: 1 - .22 * kn, lx: .3 * kn + .18 * ON(t, 50.8, 51.6, 52.6, 52.9) }; } }); });
  { const r = route(T4, [-5.0, 1.45]).go(.8, [-3.3, 1.45]).wait(49.2).go(.9, [-1.75, .8]).wait(T5);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(T4, T5), face: (t, p) => (!p.mv && t > 50.0) ? toward(p.x, p.z, PIL) : null, ex: t => { const pl_ = ON(t, 50.0, 50.6, 52.2, 52.7); return { ...mixA(aF(.5 * pl_)), lx: .22 * pl_ }; } }); }
  [[leah, [-5.7, 1.7], [-4.3, 1.6], [-3.0, 1.05]], [bil, [-6.0, 1.4], [-4.6, 1.3], [-2.75, .5]], [zil, [-6.3, 1.7], [-4.9, 1.65], [-3.25, 1.75]]].forEach(([f, a, b, c], i) => { const r = route(T4, a).go(.8, b).wait(49.4).go(.85, c).wait(T5);
    act(f, r.keys, { ph: 3 + i * 1.4, sp: 6, show: W_(T4, T5), face: (t, p) => (!p.mv && t > 50.0) ? toward(p.x, p.z, PIL) : null, ex: t => ({ lx: .2 * ON(t, 50.0, 51.0, 52.6, 52.9) }) }); });

  // ===== P5 (e1): Jacob comes home to Isaac; Isaac dies (35:27-29)
  const ISP = [-7.0, 2.1];
  act(isaac, route(0, ISP).keys, { ph: 5, sp: 5, show: W_(T5, T6), face: () => headZ(1, -.25), ex: t => ({ ...mixA(aF(.25 * ON(t, 55.4, 56.0, 56.6, 57.0))), s: .72, lx: .05 * Math.sin(t * 1.3) }) });
  { const r = route(T5, [-3.8, 1.7]).go(1.2, [-6.1, 2.05]).wait(T6);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(T5, T6), face: (t, p) => !p.mv ? toward(p.x, p.z, ISP) : null, ex: t => { const kn = ON(t, 55.2, 55.8, 56.8, 57.0); return { ...mixA(aF(.5 * kn)), s: 1 - .24 * kn, lx: .3 * kn }; } }); }
  // ===== P6: Esau and Jacob carry Isaac away (35:29)
  act(esau, BEAR.e1.f, { ph: 1, sp: 6, show: W_(T6, T7), ex: t => mixA(aF(1)) });
  act(jacob, BEAR.e1.r, { ph: 2, sp: 6, show: W_(T6, T7), ex: t => mixA(aF(1)) });

  function update(t, camera, sid) {
    const sway = (k, ph) => ({ s: 1 + .006 * Math.sin(t * k + ph) });
    const cam = camera && camera.position;


    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = ON(t, 37.6, 40.6, 46.4, 49.6), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);

    // the low sun behind the subject (it sets before the night and rises again at dawn)
    { const k = (.42 + .13 * ON(t, 44, 50, 90, 91)) * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]); dust.update(t, .3 * ON(t, 14.6, 16, 21, 22), [.5, .1, 1.4]);
    // ---- the river: day colours, darker at night, ripples drifting south
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- torches at the gate, lit windows, the glow in the gateway, the camp light at the end
    { const tk = smooth(37.6, 39.8, t) * (1 - smooth(50.2, 52.6, t)), gk = 0;
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 2.8 * gk * fl; gateG.material.opacity = (.8 * gk + .2 * tk) * fl; gateG.visible = gateG.material.opacity > .01;
      WINS.forEach(w => { const on = smooth(37.0 + 2.4 * w.ord, 38.4 + 2.4 * w.ord, t) * (1 - smooth(49.5 + 2 * w.ord, 51.5 + 2 * w.ord, t)); w.s.material.opacity = .85 * on * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = on > .01; });
      campL.intensity = 1.1 * night * fl; }
    // ---- what stands where, by time
    { const hk = 1 - smooth(11.4, 11.9, t); heapG.visible = t > 6.3 && hk > .01; cloth.scale.setScalar(Math.max(.01, smooth(6.3, 7.0, t) * hk));
      ITEMS.forEach((m, i) => { const gv = GIVE[i % 8] + .06 * Math.floor(i / 8); m.visible = t > gv; m.scale.setScalar(Math.max(.01, hk * (.4 + .6 * smooth(gv, gv + .35, t)))); });
      bundle.visible = t > 11.6 && t < 14.1; const mk = smooth(14.0, 14.8, t); mound.visible = mk > .01; mound.scale.set(.3 * mk + .001, .07 * mk + .001, .2 * mk + .001);
      stones.forEach((m, i) => { const k = smooth(22.9 + .33 * i, 23.4 + .33 * i, t); m.visible = k > .01; m.scale.setScalar(.2 + .8 * k); });
      const gB = ON(t, 26.2, 27.4, 29.5, 29.9), gJ = ON(t, 1.2, 2.4, 5.2, 6.0);
      shaftB.material.opacity = .6 * gB; shaftB.visible = gB > .005; poolB.material.opacity = .55 * gB; poolB.visible = gB > .005; altarL.intensity = 2.4 * gB * (.92 + .08 * Math.sin(t * 6));
      bethM.update(t, gB, [BETH[0], hC(BETH[0], BETH[1]) + 1.8, BETH[1]]); bethM.mesh.visible = gB > .005;
      shaftJ.material.opacity = .5 * gJ; shaftJ.visible = gJ > .005; poolJ.material.opacity = .5 * gJ; poolJ.visible = gJ > .005; callM.update(t, gJ, [JD[0] + 1.15, hC(JD[0] + 1.15, JD[1]) + 1.6, JD[1] + .1]); callM.mesh.visible = gJ > .005;
      const tentOn = t >= T3 - .05 && t < T5; rTent.visible = tentOn; rRug.visible = tentOn; const lk = smooth(32.5, 36.0, t) * (1 - smooth(48.5, 50.5, t));
      lampG.material.opacity = .8 * lk * fl; lampG2.material.opacity = .7 * lk * fl; lampG.visible = lampG2.visible = lk > .01; lampL.intensity = 2.2 * lk * fl;
      babe.visible = t > 43.8 && t < T4;
      pStones.forEach((m, i) => { const k = smooth(49.3 + .36 * i, 49.8 + .36 * i, t); m.visible = k > .01; m.scale.setScalar(.2 + .8 * k); });
      const carry = (br, kf, kr, on) => { br.visible = on; if (!on) return; const a = kp(t, kf), b = kp(t, kr), x = (a.x + b.x) / 2, z = (a.z + b.z) / 2; br.position.set(x, hC(x, z) + .56, z); br.rotation.y = Math.atan2(-(a.z - b.z), a.x - b.x); };
      carry(bierR, BEAR.d1.f, BEAR.d1.r, t >= T4 && t < 49.7); carry(bierI, BEAR.e1.f, BEAR.e1.r, t >= T6 && t < T7); }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp); });
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = t < T2; a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      const big = i >= 7; if (p.mv) walkLegs(a.legs, t + i * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); });
    dustR.update(t, .5 * ON(t, 46.8, 47.6, 48.6, 49.2) + .6 * ON(t, 15.4, 16.4, 20.6, 21.6), [t < T2 ? 1.6 : -1.5, hC(-1.5, 1.4) + .05, t < T2 ? 1.1 : 1.4]);
    state.t = t;
  }


  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(12, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(17, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(22.4, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14),
    Dk(31, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [10, 2.0, -4], .5, '#ffbc88', FD, 14), Dk(36.5, '#a89ab8', '#5a4448', .95, '#ff9458', 2.4, [10, 1.6, -4], .5, '#ffb480', FD, 14),
    Dk(38.4, '#8a86b0', '#4a3a40', .9, '#ff8a50', 2.0, [10, 1.2, -4], .5, '#ffa878', FD, 14), Dk(41.5, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14),
    Dk(46.0, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(49.4, '#8a94c4', '#5a4a50', .95, '#ffb088', 2.1, [10, 1.6, -4], .5, '#ffbc98', FD, 14),
    Dk(53, '#b0a8c0', '#6a5446', 1.0, '#ffb470', 2.7, [10, 2.8, -4], .5, '#ffcf9a', FD, 14), Dk(58, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', FD, 14), Dk(62, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [12, ['#5a86c4', '#f6d09a']], [22, ['#5a86c4', '#f6c890']], [31, ['#5a86c4', '#f6c890']], [36.5, ['#5a74b0', '#f4a070']], [38.4, ['#4a5a9a', '#f0905a']], [41.5, ['#0e1636', '#2a3466']], [46, ['#0e1636', '#2a3466']], [49.4, ['#4a5a9a', '#f4a888']], [53, ['#5a7ab8', '#f6b888']], [58, ['#7a78b0', '#f6a068']], [62, ['#7a78b0', '#f6a068']]];
  return { group: g, update, light, bg, far, pl: [altarL, lampL, ...torchL, gateL, campL], state, jacob };
}
