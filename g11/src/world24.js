// Episode 24: Genesis 24. Abraham, old and blessed in everything (24:1), sends his servant to find a wife for Isaac from his own family (24:2-9); the servant takes ten camels with gifts and goes to the city of Nahor (24:10);
// at evening, when the women go out to draw water, he makes the camels kneel by the well and prays: let the young woman who offers me a drink, and water for my camels, be the one you have appointed for Isaac (24:11-14);
// before he has finished speaking Rebekah comes out with her jar on her shoulder (24:15), goes down to the spring, fills her jar and gives him a drink, then draws water for all his camels, running back and forth to the trough (24:16-20);
// the man bows and blesses the Lord who has led him to the family of his master (24:26-27); her family says "the thing comes from the Lord" (24:50); in the morning they call Rebekah and ask "will you go with this man?" and she says "I will" (24:57-58);
// Isaac, who had gone out in the evening to meditate in the field, lifts his eyes and sees camels coming (24:63); Rebekah sees him and gets down from her camel (24:64); Isaac brings her into the tent of his mother Sarah, takes her as his wife, loves her, and is comforted after his mother's death (24:67).
// Cinematic interpretation: the floating land, the shape of the camp, the town, the well, the trough, the courtyard and the field, the jar, the lamps, the colour of the light, the prayer-light on the servant, the faces and the way the figures stand, bow, run and walk are not in the text.
// The film leaves out the oath and its terms (24:2-9), the gold ring and bracelets (24:22, 47, 53), Rebekah's lineage (24:15, 24), Laban's welcome and the servant's long retelling (24:29-49), the gifts and the request for ten more days (24:53-56),
// the blessing on Rebekah and her nurse (24:59-60), and the journey and the veil (24:61-66). The text does not say that Rebekah's family lived outside the wall; the film shows the house beside the town so that the courtyard can be seen.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, palmGeo, crowdPalette, makeSheep, makeCamel, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, meshOf, houseBlock, wallRing } from './world10.js';

export const RIC = 15;
export const TS = [-7.3, 1.3], AB0 = [-6.1, 3.0], SV0 = [-5.2, 3.3];                                   // Abraham's tent in the west; where Abraham and the servant stand
export const SC = [1.6, -2.9], HW = 3.0, HD = 2.4, YG = .34, GX = SC[0], GZ = SC[1] + HD;              // the city of Nahor: a walled town, its gate faces south (+z)
export const WELL = [1.2, 1.9], TROUGH = [2.45, 2.2], SVW = [.45, 2.45];                              // the well outside the gate, the trough beside it, where the servant waits
export const HOUSE = [5.9, -.8], CY = [5.9, 1.0];                                                       // the family house beside the town, the courtyard before its door
export const TENT2 = [10.7, 3.0], DOOR2 = [10.7, 3.95];                                                 // Sarah's tent in the east and the foot of its doorway
export const FLD = [8.4, -.7];                                                                           // Isaac's field
export const EV = { a1: .6, b1: 8.9, b2: 12.6, c1: 21.9, c2: 29.8, d1: 35.2, e1: 43.0, e2: 48.4 };
const CS = .6;                                                                                           // scale of the camels

// ---------------- terrain: green camp ground in the west, golden earth around the town and well, the field in the east
const HILLS = [[-11.5, -5, 1.2, 6], [-12, 7.5, .9, 5], [12.8, -5.5, 1.5, 4.4], [3.5, -11, 1.0, 5], [-3.5, -11.5, 1.0, 4.5], [13, 9, .8, 3.6], [-.5, 11.8, .6, 4]];
const FLATS = [[TS[0], TS[1] + 1.8, .32, 4.2], [SC[0], SC[1] + .6, YG, 5.2], [WELL[0] + .6, WELL[1] + .8, .31, 3.2], [HOUSE[0], HOUSE[1] + 1.2, .33, 2.9], [TENT2[0], TENT2[1] + .6, .33, 3.0], [FLD[0], FLD[1], .33, 2.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const PATHS = [[[-5.6, 4.6], [-3.4, 4.1], [-1.2, 3.5], [.6, 3.0], [WELL[0], WELL[1] + .9]], [[GX, GZ + .2], [GX - .1, 1.0], [WELL[0], WELL[1] - .4]], [[WELL[0] + .6, 3.2], [3.4, 3.7], [5.2, 4.3], [7.4, 4.9], [9.4, 4.6]], [[3.4, 2.6], [CY[0] - .5, CY[1] + .2], [CY[0], CY[1]]]];
const dPath = (x, z) => { let m = 99; for (const P of PATHS) for (let i = 0; i < P.length - 1; i++) { const [ax, az] = P[i], [bx, bz] = P[i + 1], vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - (ax + u * vx), z - (az + u * vz))); } return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-7, 0, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .9);
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#cdb884'), .6 * smooth(6.0, 3.6, Math.hypot(x - SC[0], z - SC[1] - .6)));
  const fd = Math.hypot(x - FLD[0], z - FLD[1]); b.lerp(C3('#b99a5a'), .8 * smooth(2.8, 2.0, fd)); b.lerp(C3('#9c8040'), .35 * smooth(-.1, .7, Math.sin(z * 9)) * smooth(2.6, 1.9, fd));
  b.lerp(C3('#7e9a52'), .6 * smooth(4.8, 2.6, Math.hypot(x - TS[0], z - TS[1] - 1.6)));
  b.lerp(C3('#c8b488'), .55 * smooth(2.4, 1.0, Math.hypot(x - WELL[0] - .4, z - WELL[1] - .2)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, SC, GX, GZ, WELL, TROUGH, SVW, HOUSE, CY, TENT2, DOOR2, FLD, TS, AB0, SV0, YG };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const NN = headZ(0, -1), SS = headZ(0, 1), EE = headZ(1, 0), WW = headZ(-1, 0);

// ---------------- the ten camels: where each stands in the camp, kneels at the well, and parks by Isaac's tent
const NC = 10;
const CAMP_C = Array.from({ length: NC }, (_, i) => [-3.7 + (i % 5) * .64 + (i >> 1 & 1) * .1, 4.5 + (i / 5 | 0) * .95]);   // east of the people so the first shots see Abraham and the servant, not the camels
const WC = [1.65, 2.2];
const KN = [[-.3, 1.5], [-1.3, 1.3], [-.1, .4], [-1.1, .25], [-2.1, .1], [3.6, 1.35], [4.5, 1.7], [3.5, .3], [4.4, .6], [5.3, 1.05]];   // the camels kneel in two groups beside the way from the gate to the well, so the servant, Rebekah and the well stay in the open
const PARK = [[5.7, 2.5], [6.35, 2.5], [8.35, 3.4], [7.0, 2.5], [7.65, 2.5], [8.3, 2.5], [5.7, 3.4], [6.35, 3.4], [7.0, 3.4], [7.65, 3.4]];   // parked west of Sarah's tent; Rebekah's camel (no. 2) stands at the east end, nearest the door
const PE = [[3.3, 4.5], [5.4, 4.9], [7.3, 5.3]];
const camKeys = i => { const d0 = 8.2 + .24 * i, d1 = 11.6 + .24 * i, u0 = 39.4 + .38 * i; const [kx, kz] = KN[i], [cx, cz] = CAMP_C[i], [px, pz] = PARK[i]; const o = ((i % 5) - 2) * .12, o2 = (i >> 2 & 1) * .25;
  return [[0, cx, cz], [d0, cx, cz], [d0 + 1.2, cx + .5 + o, 3.9 + o2 + (i % 3) * .1, 'W'], [d0 + 2.5, -1.2 + o, 3.5 + o2, 'W'], [d1, kx, kz, 'W'], [u0, kx, kz], [u0 + 1.6, PE[0][0] + o, PE[0][1] + o2, 'W'], [u0 + 3.7, PE[1][0] + o, PE[1][1] + o2, 'W'], [u0 + 5.7, PE[2][0] + o, PE[2][1] + o2, 'W'], [u0 + 7.7, px, pz, 'W']]; };
const CAMK = Array.from({ length: NC }, (_, i) => camKeys(i));

// ---------------- the people
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);   // the same Abraham as in every episode
const mkServant = R => person(R, { pants: '#4a3a2a', top: '#8a6a4a', skin: '#a8714a', hair: '#2a1a10', beard: '#2a1e14', cloth: '#d9ccb0', sash: '#7a2a2a', seed: 610 }, .46);
const mkRebekah = R => person(R, { pants: '#5a7a9a', top: '#d8b86a', skin: '#c9905f', hair: '#3a2418', long: true, cloth: '#efe4cc', sash: '#a8483a', seed: 620 }, .44);
const mkIsaac = R => person(R, { pants: '#7a5a3a', top: '#c9a15a', skin: '#c38a5c', hair: '#2e1d10', sash: '#8a3a2a', seed: 630 }, .47);
const mkKin = (R, i) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: '#4a3a2c', beard: i === 0 ? '#8a8478' : i === 1 ? undefined : '#3a2e22', long: i === 1, cloth: i === 1 ? '#e8dcc0' : c.cloth || undefined, sash: i === 0 ? '#e0b848' : undefined, seed: 640 + i }, i === 1 ? .43 : .45); };
const lamC = c => new THREE.MeshLambertMaterial({ color: c });

// ====================================================================== the world
export function makeNahor() {
  const R = rng(2424), g = new THREE.Group(), smoke = makeSmoke(3);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9811), RIC, hC, gcC, 30, 80), underRock(rng(9812), RIC - .1));
  const treeList = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); treeList.push({ m, x, z }); return m; };
  // the oaks around Abraham's camp in the west
  [[-9.6, .4, 2.4], [-10.6, 3.6, 2.0], [-8.4, -1.8, 1.9], [-5.2, -1.2, 1.7], [-9.4, 6.0, 1.7]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-11.2, -4.4, 2.0], [-8.8, -8.2, 2.2]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  // palms and olives about the well, the town and Isaac's field
  [[3.9, 3.0, 1.0], [-.7, 1.2, .95], [4.7, 2.2, .9], [3.1, -.1, .85]].forEach(([x, z, s]) => tree(x, z, s, 'palm'));
  [[7.0, -2.6, .9], [9.4, -2.5, .85], [10.7, -1.4, .85], [8.1, -3.7, .8], [10.1, .6, .75]].forEach(([x, z, s]) => { const m = tree(x, z, s, 'olive'); if (x === 9.4 || x === 10.7 || x === 10.1 || x === 8.1 || x === 7.0) ca.remove(m); });   // built, then removed: keeps Isaac's field open to the camera without changing the random sequence
  [[11.8, -.6, 1.1], [12.4, 4.6, 1.0], [9.4, 7.4, .9]].forEach(([x, z, s]) => { const m = tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']); if (x === 11.8) ca.remove(m); });
  const keepOut = (x, z) => hC(x, z) < .15 || Math.hypot(x - SC[0], z - SC[1]) < 4.9 || Math.hypot(x - WELL[0], z - WELL[1]) < 3.2 || Math.hypot(x - TS[0], z - TS[1]) < 3.4 || dPath(x, z) < 1.1 || Math.hypot(x - FLD[0], z - FLD[1]) < 3.0 || Math.hypot(x - TENT2[0], z - TENT2[1]) < 3.2 || Math.hypot(x - HOUSE[0], z - HOUSE[1]) < 3.0;
  for (let i = 0; i < 22; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  // Isaac's field is seen from the north-east in shot 12 (43-48 s): trees on that line of sight are built but taken out afterwards, so the random sequence is unchanged
  { for (const az of [108, 116, 124, 132, 140]) { const dx = Math.sin(az * Math.PI / 180), dz = Math.cos(az * Math.PI / 180); for (const T of treeList) { const rx = T.x - FLD[0], rz = T.z - (FLD[1] + .35), u = rx * dx + rz * dz; if (u > .5 && u < 10 && Math.abs(rx * dz - rz * dx) < 1.3 && T.m.parent) ca.remove(T.m); } } }
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- the city of Nahor: a walled town, its wall kept low so the roofs can be seen, with a gate in the south wall and a few houses and smoke inside
  { const wm = meshOf(wallRing(R, SC[0], SC[1], HW, HD, hC, 0, true)); wm.scale.y = .64; wm.position.y = YG * (1 - .64); ca.add(wm); }
  ca.add(meshOf(houseBlock(R, SC[0] - 1.5, SC[1] - .5, 2, 3, .9, hC, 0)), meshOf(houseBlock(R, SC[0] + 1.5, SC[1] - .4, 2, 3, .9, hC, 0)), meshOf(houseBlock(R, SC[0], SC[1] - 1.9, 3, 1, .9, hC, 0)));
  { const b = new GB(R), y = YG, z0 = GZ + .12;
    for (const s of [-1, 1]) { b.box('#d8c598', [GX + s * .66, y + .62, z0], [.5, 1.24, .62], [0, 0, 0], .04); b.box('#c2ae86', [GX + s * .66, y + 1.28, z0], [.58, .12, .7], [0, 0, 0], .03);
      for (const k of [-1, 0, 1]) b.box('#b09c74', [GX + s * .66 + k * .17, y + 1.4, z0], [.12, .12, .12], [0, 0, 0], .02); }
    b.box('#cdb88e', [GX, y + .98, z0], [.88, .26, .6], [0, 0, 0], .04); b.box('#e0b848', [GX, y + 1.12, z0 + .01], [.92, .04, .62], [0, 0, 0], .02);
    b.box('#1a1008', [GX, y + .44, z0 + .08], [.8, .88, .5], [0, 0, 0], .01);
    ca.add(meshOf(b)); }
  // ---- the well: a ring of stones, a wooden frame with a pulley beam, dark water inside; and the stone trough beside it
  { const b = new GB(R), wy = hC(WELL[0], WELL[1]);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; b.box(pk(R, ['#b8a47c', '#a8946e', '#c2ae86']), [WELL[0] + Math.cos(a) * .27, wy + .12, WELL[1] + Math.sin(a) * .27], [.17, .24, .17], [0, -a, 0], .03); }
    for (const s of [-1, 1]) b.box('#6b4a2c', [WELL[0], wy + .45, WELL[1] + s * .3], [.045, .64, .045], [0, 0, 0], .02);
    b.box('#6b4a2c', [WELL[0], wy + .78, WELL[1]], [.05, .05, .74], [0, 0, 0], .02); b.add(G.cylT, '#8a6a42', [WELL[0], wy + .72, WELL[1]], [.04, .05, .04], [0, 0, 0], .01);
    b.box('#a8946e', [TROUGH[0], hC(TROUGH[0], TROUGH[1]) + .08, TROUGH[1]], [.8, .16, .28], [0, 0, 0], .03);
    b.box('#98845e', [TROUGH[0], hC(TROUGH[0], TROUGH[1]) + .06, TROUGH[1] + .15], [.84, .12, .05], [0, 0, 0], .02); b.box('#98845e', [TROUGH[0], hC(TROUGH[0], TROUGH[1]) + .06, TROUGH[1] - .15], [.84, .12, .05], [0, 0, 0], .02);
    ca.add(meshOf(b)); }
  const waterM = new THREE.MeshLambertMaterial({ color: 0x2c5878, emissive: 0x0c1c2c }), wellW = new THREE.Mesh(new THREE.CircleGeometry(.2, 18), waterM); wellW.rotation.x = -Math.PI / 2; wellW.position.set(WELL[0], hC(WELL[0], WELL[1]) + .17, WELL[1]); ca.add(wellW);
  const troughW = new THREE.Mesh(new THREE.BoxGeometry(.68, .02, .2), new THREE.MeshLambertMaterial({ color: 0x3c6a8c, emissive: 0x10243a })); troughW.position.set(TROUGH[0], hC(TROUGH[0], TROUGH[1]) + .1, TROUGH[1]); ca.add(troughW);
  // ---- the family house beside the town: a larger house with a flat roof, a doorway, a low courtyard wall and a tree
  { const b = new GB(R), hy0 = hC(HOUSE[0], HOUSE[1]);
    b.box('#d4c29c', [HOUSE[0], hy0 + .5, HOUSE[1]], [2.6, 1.0, 1.4], [0, 0, 0], .04); b.box('#b09c74', [HOUSE[0], hy0 + 1.04, HOUSE[1]], [2.76, .1, 1.56], [0, 0, 0], .03); b.box('#c8b488', [HOUSE[0] - 1.8, hy0 + .38, HOUSE[1] + .1], [1.2, .76, 1.0], [0, 0, 0], .04); b.box('#b09c74', [HOUSE[0] - 1.8, hy0 + .79, HOUSE[1] + .1], [1.3, .08, 1.1], [0, 0, 0], .03);
    b.box('#2a1c10', [HOUSE[0], hy0 + .34, HOUSE[1] + .71], [.52, .68, .06], [0, 0, 0], .01); b.box('#cdb88e', [HOUSE[0], hy0 + .72, HOUSE[1] + .72], [.66, .1, .08], [0, 0, 0], .02);
    for (const sx of [-.9, .9]) b.box('#3a2a1c', [HOUSE[0] + sx, hy0 + .6, HOUSE[1] + .71], [.2, .2, .04], [0, 0, 0], .01);
    for (const [wx, wz, ww, wd] of [[CY[0] - 1.8, CY[1] + .8, 2.4, .1], [CY[0] + 1.8, CY[1] + .8, 2.4, .1], [CY[0] - 2.9, CY[1] - .1, .1, 1.8], [CY[0] + 2.9, CY[1] - .1, .1, 1.8]]) b.box('#c2ae86', [wx, hC(wx, wz) + .13, wz], [ww, .26, wd], [0, 0, 0], .03);
    ca.add(meshOf(b)); }
  // ---- Abraham's camp: his tent, two more, sheep and a lamp
  [[TS[0], TS[1], .3, '#cdb48c', 1.2], [TS[0] - 2.4, TS[1] + .8, .6, '#c2a67a', .85], [TS[0] - 1.0, TS[1] - 1.8, -.4, '#d4c29c', .75]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  const sheep = [[-8.4, 3.6], [-9.1, 4.7], [-7.5, 5.6]].map(([x, z], i) => { const s = makeSheep(rng(260 + i)); s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = i * 1.7; ca.add(s.group); return s; });
  // ---- Sarah's tent in the east, with its doorway that is lit from inside at night, and Isaac's field with a few sheaves
  { const m = tentMesh(R, '#d8c29a', 1.1); m.position.set(TENT2[0], hC(TENT2[0], TENT2[1]), TENT2[1]); ca.add(m); }
  { const b = new GB(R); for (let r = 0; r < 6; r++) for (let k = 0; k < 6; k++) { const x = FLD[0] - 1.8 + k * .72, z = FLD[1] - 1.5 + r * .56; if (Math.hypot(x - FLD[0], z - FLD[1]) > 2.4) continue; b.box('#a8863e', [x + (R() - .5) * .08, hC(x, z) + .012, z], [.6, .026, .1], [0, (R() - .5) * .06, 0], .02); }
    ca.add(meshOf(b)); }
  const doorH = hC(DOOR2[0], DOOR2[1]), doorM = new THREE.Mesh(new THREE.PlaneGeometry(.46, .56), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }));
  doorM.position.set(DOOR2[0], doorH + .34, DOOR2[1] + .02); g.add(doorM);
  const doorG = spriteGlow(DOOR2[0], doorH + .34, DOOR2[1] + .12, 2.0, 0xffc070, 0), doorG2 = spriteGlow(DOOR2[0], doorH + .3, DOOR2[1] + .1, .8, 0xfff0c8, 0); g.add(doorG, doorG2);
  const doorL = new THREE.PointLight(0xffc070, 0, 6, 1.6), gateL = new THREE.PointLight(0xffb870, 0, 7, 1.7), campL = new THREE.PointLight(0xffa860, 0, 6, 1.7);
  // a lamp by Abraham in the camp (evening), the lamps at the town gate, and the glow of the lit tent
  const campB = spriteGlow(-5.65, hC(-5.65, 2.7) + .42, 2.7, .9, 0xffa850, 0), campB2 = spriteGlow(-5.65, hC(-5.65, 2.7) + .41, 2.7, .38, 0xffe0a0, 0); g.add(campB, campB2);
  { const b = new GB(rng(33)); b.add(G.cylT, '#a8783a', [0, .06, 0], [.05, .12, .05], [0, 0, 0], .01); b.box('#3a2418', [0, .13, 0], [.07, .02, .07], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.position.set(-5.65, hC(-5.65, 2.7), 2.7); m.castShadow = true; g.add(m); }
  const lamps = [[GX - 1.05, GZ + .55], [GX + 1.05, GZ + .55], [SC[0] - 1.7, SC[1] - .2], [SC[0] + 1.8, SC[1] + .1], [SC[0] - .2, SC[1] - 1.9], [SC[0] + 2.3, SC[1] - 1.6], [CY[0] - .75, CY[1] - .2], [CY[0] + .75, CY[1] - .2]].map(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + (i < 2 ? .55 : i > 5 ? .5 : .6), z, i < 2 ? .6 : .46, 0xffb860, 0); g.add(s); return s; });
  smoke.add(SC[0] - 1.4, YG + .95, SC[1] - .6, t => 1 - smooth(34, 36, t), .22, 1.8); smoke.add(SC[0] + 1.9, YG + .9, SC[1] - .5, t => 1 - smooth(34, 36, t), .2, 1.7); smoke.add(CY[0] - 1.8, hC(CY[0] - 1.8, HOUSE[1]) + .85, HOUSE[1] + .1, t => smooth(34, 36, t) * (1 - smooth(44, 46, t)), .2, 1.6); g.add(smoke.mesh);
  const SMK = [[0, '#c8aa98'], [34, '#e0cdb8'], [46, '#c8aa98'], [90, '#8a8090']];
  // ---- the camels, each with a saddle blanket and some with a load (24:10)
  const camels = Array.from({ length: NC }, (_, i) => { const c = makeCamel(rng(300 + i)); const b = new GB(rng(700 + i)); b.box(['#9a4a3a', '#3a5a7a', '#7a5a2a', '#6a3a5a'][i % 4], [.12, 1.155, 0], [.34, .05, .36], [0, 0, 0], .01); b.box('#e0b848', [.12, 1.18, 0], [.35, .012, .1], [0, 0, 0], .005);
    if (i % 3 !== 0) b.box(['#b89a64', '#8a6a4a', '#a07a4a'][i % 3], [-.22, 1.27, 0], [.26, .2, .28], [0, 0, .05], .02);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; c.group.add(m); c.group.scale.setScalar(CS * (.96 + .06 * ((i * 7) % 5) / 4)); ca.add(c.group); return c; });
  // ---- the jar and the stream of water
  const jarB = new GB(rng(801)); jarB.add(G.ico1, '#b8703a', [0, .055, 0], [.055, .066, .055], [0, 0, 0], .01); jarB.add(G.cylT, '#a8602e', [0, .115, 0], [.026, .04, .026], [0, 0, 0], .01); jarB.add(G.cylT, '#c8803e', [0, .15, 0], [.036, .01, .036], [0, 0, 0], .004);
  const jar = new THREE.Mesh(jarB.build(), lam); jar.castShadow = true; g.add(jar);
  const stream = new THREE.Mesh(new THREE.BoxGeometry(.016, 1, .016), new THREE.MeshBasicMaterial({ color: 0xb4dcf4, transparent: true, opacity: 0, toneMapped: false })); stream.visible = false; g.add(stream);
  const drop = spriteGlow(0, 0, 0, .3, 0xd8f0ff, 0); g.add(drop);
  // ---- the people
  const abraham = mkAbraham(rng(83)), servant = mkServant(rng(84)), rebekah = mkRebekah(rng(85)), isaac = mkIsaac(rng(86)), kin = [0, 1, 2].map(i => mkKin(rng(150 + i), i));
  [abraham, servant, rebekah, isaac, ...kin].forEach(o => g.add(o.group));
  const prayer = shaft(7, .22, .62, [1, .86, .5], .9, .12); prayer.position.set(SVW[0], hC(SVW[0], SVW[1]), SVW[1]); g.add(prayer);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .03, v: .06, seed: 37, color: 0xf0d9a0 }); g.add(motes.mesh);
  const far = farMountains10(rng(65)); g.add(far);
  const sea = cloudSea(rng(66), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const starA = spriteGlow(0, 0, 0, 7, 0xffe8b0, 0), starB = spriteGlow(0, 0, 0, 2.2, 0xffffff, 0); g.add(starA, starB);
  const CLOUD = [[0, '#c0a0a8'], [8, '#e0c4b4'], [21, '#fbf0dc'], [33, '#e8b894'], [35.4, '#f6e4c4'], [41.5, '#fbf3e0'], [43, '#e8b088'], [47.5, '#6a5a78'], [54, '#38385a'], [90, '#38385a']];
  const CEM = [[0, '#4a3a44'], [8, '#5a4a48'], [21, '#6a5c4c'], [33, '#5a4440'], [35.4, '#6a5c4c'], [43, '#5a443c'], [47.5, '#2a2a48'], [54, '#1e2038'], [90, '#1e2038']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = { servant: [SVW[0], 0, SVW[1]] };
  const headC = (vx, vz) => Math.atan2(-vz, vx);                     // heading of a camel (its head is local +x)

  // Abraham: stands before the servant (24:2), then goes back toward his tent
  const KA = [[0, AB0[0], AB0[1]], [7.4, AB0[0], AB0[1]], [9.4, AB0[0] - .5, AB0[1] - .9, 'W'], [90, AB0[0] - .5, AB0[1] - .9]];
  // the servant: stands before Abraham, leads the camels to the well (24:10), waits and prays (24:12-14), accepts the drink (24:17-18), bows (24:26), is with the family (24:50), leads the caravan (24:61), and is by the tent
  const KS1 = [[0, SV0[0], SV0[1]], [7.6, SV0[0], SV0[1]], [11.4, -1.0, 3.0, 'W'], [12.5, SVW[0], SVW[1], 'W'], [34.9, SVW[0], SVW[1]]];
  const KS2 = [[35.0, 3.45, 2.0], [40.2, 3.45, 2.0], [41.6, 4.3, 4.2, 'W'], [43.6, 6.3, 4.6, 'W'], [45.5, 8.0, 4.9, 'W'], [46.8, 8.6, 4.2, 'W'], [90, 8.6, 4.2]];
  // Rebekah: out of the gate (24:15), to the well, to the servant, back and forth to the trough (24:19-20); then in the courtyard (24:57-58); then on her camel; then beside Isaac
  const WP = [1.25, 1.42], TP = [2.0, 1.9];
  const KR1 = [[18.9, GX - .15, GZ + .3], [22.1, WP[0], WP[1], 'W'], [24.5, WP[0], WP[1]], [25.4, SVW[0] + .6, SVW[1] - .45, 'W'], [26.8, SVW[0] + .6, SVW[1] - .45], [27.8, WP[0], WP[1], 'W'], [28.4, WP[0], WP[1]], [29.3, TP[0], TP[1], 'W'], [30.1, TP[0], TP[1]], [31.0, WP[0], WP[1], 'W'], [31.6, WP[0], WP[1]], [32.5, TP[0], TP[1], 'W'], [33.3, TP[0], TP[1]], [34.2, WP[0], WP[1], 'W'], [34.9, WP[0], WP[1]]];
  const KR2 = [[35.0, 6.7, 1.55], [90, 6.7, 1.55]];
  // Isaac: walks in the field at evening, stops and looks (24:63), goes to meet them, leads Rebekah to the tent (24:67)
  const KI = [[42.8, 8.9, -1.5], [44.4, 8.3, -.35, 'W'], [47.6, 8.3, -.35], [50.2, 9.15, 4.05, 'W'], [51.8, 9.15, 4.05], [53.1, 10.3, 4.4, 'W'], [53.9, 10.9, 4.02, 'W'], [54.7, 10.9, 3.55, 'W'], [90, 10.9, 3.55]];
  const KRD = [[50.1, 8.35, 3.9], [50.9, 8.55, 4.05, 'W'], [51.8, 8.55, 4.05], [53.1, 10.15, 4.45, 'W'], [53.9, 10.5, 4.02, 'W'], [54.7, 10.5, 3.55, 'W'], [90, 10.5, 3.55]];
  const RIDE = 2;        // the camel Rebekah rides
  const KFAM = [[5.0, 1.45], [5.8, 1.3], [4.25, 1.75]];

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject: the evening at the start, the evening at the well, the morning at the house, the sunset over the caravan; the evening star
    { const k0 = ON(t, -1, 0.5, 6.0, 11.0) * .8, k1 = ON(t, 12, 15, 28, 33) * .55, k2 = ON(t, 34.5, 37, 41, 43) * .7, k3 = ON(t, 42.4, 44, 46.5, 49.0) * .95, cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); starA.position.set(cx + v3.x / hl * 150 + v3.z / hl * 14, cy + 34, cz + v3.z / hl * 150 - v3.x / hl * 14); }
      sunS2.position.copy(sunS.position); starB.position.copy(starA.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(k0, k1, k2, k3); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01;
      const st = Math.max(ON(t, -1, 1.0, 9.0, 12.0), ON(t, 46, 49, 90, 91)) * (.9 + .1 * Math.sin(t * 3.1)); starA.material.opacity = .62 * st; starB.material.opacity = .95 * st; starA.visible = starB.visible = st > .01; }
    // lamps: the one by Abraham burns through the evening and goes out as the caravan leaves; town and courtyard lamps come on at dusk, are out in the morning, and come on again; the tent glows from the evening on
    { const fl = .86 + .14 * Math.sin(t * 9.1) * Math.sin(t * 5.3), kc = smooth(-.5, .8, t) * (1 - smooth(8.6, 11.0, t)), kg = Math.max(smooth(-.5, .8, t) * (1 - smooth(27, 33, t)), smooth(43.5, 47.5, t)), kd = smooth(47.0, 50.5, t);
      campB.material.opacity = .62 * kc * fl; campB2.material.opacity = .5 * kc; campB.visible = campB2.visible = kc > .01; campL.position.set(-5.5, hC(-5.5, 2.7) + .5, 2.9); campL.intensity = 4.0 * kc * fl;
      lamps.forEach((s, i) => { s.material.opacity = (i < 2 ? .6 : .5) * kg * (.9 + .1 * Math.sin(t * 7 + i)); s.visible = kg > .01; }); gateL.position.set(GX, YG + 1.0, GZ + 1.3); gateL.intensity = 2.4 * kg;
      doorM.material.opacity = .85 * kd * (.94 + .06 * Math.sin(t * 2.3)); doorG.material.opacity = .42 * kd * (.94 + .06 * Math.sin(t * 2.3)); doorG2.material.opacity = .26 * kd; doorL.position.set(DOOR2[0], doorH + .8, DOOR2[1] + .9); doorL.intensity = 3.0 * kd; }
    smoke.update(t, colAt(SMK, t)); motes.update(t, .5 * (.4 + .6 * ON(t, 10, 14, 80, 88)), [3, .5, 2.5]);
    sheep.forEach((s, i) => { s.group.rotation.y = i * 1.7 + .12 * Math.sin(t * .4 + i); });
    // the prayer light on the servant at the well (24:12-14): a slow shaft of gold, only a suggestion
    { const pl = ON(t, 13.6, 15.6, 19.6, 21.6) * .42; prayer.material.opacity = pl; prayer.visible = pl > .004; }

    // the camels: standing in the camp, walking to the well (24:10), kneeling (24:11), standing again in the morning and walking east with Rebekah, kneeling by the tent
    camels.forEach((c, i) => { const p = kp(t, CAMK[i]); let ry = p.mv ? headC(p.vx, p.vz) : (c.ry ?? 0);
      if (!p.mv) { if (t < 8) ry = 0; else if (t < 38) ry = Math.atan2(-(WC[1] - p.z), WC[0] - p.x); else ry = headC(1, .15); } c.ry = ry;
      const kn = Math.max(ON(t, 11.9 + .24 * i, 12.9 + .24 * i, 36.0 + .2 * i, 37.2 + .2 * i), smooth(47.2 + .3 * i, 48.4 + .3 * i, t));
      const k = lerp(1, .39, kn), yk = -CS * .72 * (1 - k);
      const sc = c.group.scale.x; c.group.position.set(p.x, gAt(p.x, p.z) - .02 + yk * (sc / CS), p.z); c.group.rotation.set(0, ry, .012 * Math.sin(t * 1.1 + i), 'YXZ');
      c.legs.forEach(l => l.scale.y = k); if (p.mv && kn < .05) { walkLegs(c.legs, t + i * .7, 8, .42); c.group.position.y += Math.abs(Math.sin(t * 8 + i * .7)) * .012; } else c.legs.forEach(l => l.rotation.z = 0); c.pos = [p.x, p.z, ry, kn, p.mv]; });

    // Abraham
    { const p = kp(t, KA), mv = p.mv; const ry = mv ? headZ(p.vx, p.vz) : hy(t, [[0, headZ(.9, .1)], [9.0, headZ(.9, .1)], [90, headZ(-.5, -.6)]]);
      const ex = !mv ? GE(t, [[1.6, 2.4, 4.0, 4.8, { a1x: -1.0, a1z: -.3, lx: .04 }], [4.9, 5.5, 6.7, 7.4, { a0x: -.5, a1x: -.5, a0z: -.25, a1z: .25, lx: .06 }]]) : {};
      fig(abraham, p.x, p.z, ry, mv, t, 1.1, ex, 6.0); }
    // the servant
    { const p = kp(t, t < 34.95 ? KS1 : KS2), mv = p.mv; let ry = mv ? headZ(p.vx, p.vz) : hy(t, [[0, headZ(-.9, -.15)], [7.4, headZ(-.9, -.15)], [12.5, headZ(.9, -.3)], [20.4, headZ(.9, -.3)], [21.6, headZ(.5, -.6)], [24.6, headZ(.5, -.6)], [25.6, NN], [26.9, NN], [28.0, headZ(.8, -.5)], [31.6, headZ(.8, -.5)], [32.4, headZ(.5, -.7)], [34.4, headZ(.5, -.7)], [35.0, headZ(1, -.3)], [40.2, headZ(1, -.3)], [47.0, EE], [90, EE]]);
      let ex = !mv ? GE(t, [[1.8, 2.6, 6.8, 7.5, { a0x: -.5, a1x: -.5, lx: .12 }], [13.2, 14.1, 20.3, 21.2, { a0x: -2.3, a1x: -2.3, a0z: -.2, a1z: .2, lx: -.16 }], [24.9, 25.5, 26.8, 27.6, { a0x: -.9, a1x: -.9, a0z: -.2, a1z: .2, lx: -.06 }],
        [29.6, 30.6, 32.6, 33.6, { a0x: -.4, a1x: -.4, lx: .62 }], [36.0, 36.8, 38.0, 38.8, { lx: .4, a0x: -.4, a1x: -.4 }], [38.8, 39.6, 40.0, 40.6, { a0x: -.5, a1x: -.5, a0z: -.3, a1z: .3 }]]) : {};
      fig(servant, p.x, p.z, ry, mv, t, 2.3, ex, 8.0); state.servant = [p.x, gAt(p.x, p.z), p.z]; }
    // Rebekah: the well, the trough, the courtyard, her camel, Isaac's side
    { let vis = true, x, z, ry, mv = false, ex = {}, y0 = 0, sc = 1;
      if (t < 18.8) vis = false;
      else if (t < 35.0) { const p = kp(t, KR1); x = p.x; z = p.z; mv = p.mv; ry = mv ? headZ(p.vx, p.vz) : hy(t, [[18.8, SS], [24.0, headZ(0, -1)], [24.6, headZ(-.5, .9)], [26.8, headZ(-.5, .9)], [27.5, NN], [28.4, NN], [29.2, EE], [30.2, EE], [31.0, NN], [31.6, NN], [32.4, EE], [33.3, EE], [34.2, NN], [90, NN]]);
        if (!mv) ex = GE(t, [[22.3, 22.8, 23.8, 24.4, { lx: .55, a0x: -.7, a1x: -.7 }], [25.4, 25.9, 26.6, 27.2, { a0x: -1.0, a1x: -1.0, a0z: -.1, a1z: .1 }], [27.9, 28.3, 28.4, 28.9, { lx: .5, a0x: -.7, a1x: -.7 }], [29.5, 29.8, 30.0, 30.4, { a0x: -1.1, a1x: -1.1, lx: .12 }], [31.2, 31.5, 31.6, 32.0, { lx: .5, a0x: -.7, a1x: -.7 }], [32.7, 33.0, 33.2, 33.6, { a0x: -1.1, a1x: -1.1, lx: .12 }], [34.2, 34.5, 34.8, 35.0, { lx: .5, a0x: -.7, a1x: -.7 }]]); }
      else if (t < 43.0) { x = KR2[0][1]; z = KR2[0][2]; ry = hy(t, [[35.0, headZ(-1, .3)], [42.8, headZ(-1, .3)]]); ex = GE(t, [[39.4, 40.0, 41.2, 42.0, { a0x: -.4, a1x: -.4, lx: .08 }]]); }
      else if (t < 50.1) { const c = camels[RIDE], [cx, cz, cry] = c.pos; x = cx; z = cz; ry = headZ(Math.cos(cry), -Math.sin(cry)); y0 = lerp(.6, .34, c.pos[3]); ex = { s: .86 }; }
      else { const p = kp(t, KRD); x = p.x; z = p.z; mv = p.mv; ry = mv ? headZ(p.vx, p.vz) : hy(t, [[50.1, headZ(-.3, -1)], [50.9, headZ(-1, 0)], [52.0, headZ(-1, 0)], [52.8, NN], [90, NN]]); if (t > 54.1) sc = 1 - smooth(54.1, 54.8, t); }
      rebekah.group.visible = vis && sc > .02; if (rebekah.group.visible) { if (sc < 1) ex = { ...ex, s: sc, sx: sc }; fig(rebekah, x, z, ry, mv, t, 4.1, ex, 8.5, y0); state.rebekah = [x, z]; } }
    // the jar: on her shoulder out of the gate, held low at the well, offered to the servant, carried to the trough and poured, then carried back empty
    { const on = t > 19.0 && t < 35.0; jar.visible = on; stream.visible = false; drop.material.opacity = 0;
      if (on) { const p = kp(t, KR1), mv = p.mv; const ry = mv ? headZ(p.vx, p.vz) : hy(t, [[18.8, SS], [24.0, headZ(0, -1)], [24.6, headZ(-.5, .9)], [26.8, headZ(-.5, .9)], [27.5, NN], [28.4, NN], [29.2, EE], [30.2, EE], [31.0, NN], [31.6, NN], [32.4, EE], [33.3, EE], [34.2, NN], [90, NN]]);
        const fx = Math.sin(ry), fz = Math.cos(ry), gy = gAt(p.x, p.z);
        const lowAt = Math.max(ON(t, 22.3, 22.8, 23.8, 24.4), ON(t, 27.9, 28.3, 28.4, 28.9), ON(t, 31.2, 31.5, 31.6, 32.0), ON(t, 34.2, 34.5, 34.8, 35.0)), giveAt = ON(t, 25.4, 25.9, 26.6, 27.2), pourAt = Math.max(ON(t, 29.4, 29.8, 30.0, 30.4), ON(t, 32.6, 33.0, 33.2, 33.6));
        // shoulder carry by default; low in front of her at the well; held out at chest height to the servant; tilted over the trough
        const sh = 1 - Math.max(lowAt, giveAt, pourAt), d = lerp(lerp(lerp(.0, .26, lowAt), .3, giveAt), .26, pourAt), hgt = lerp(lerp(lerp(.46, .1, lowAt), .24, giveAt), .26, pourAt), side = .11 * sh;
        jar.position.set(p.x + fx * d + fz * side, gy + hgt, p.z + fz * d - fx * side); jar.rotation.set(1.8 * pourAt - .35 * giveAt, ry, .0, 'YXZ');
        if (pourAt > .25) { const mx_ = p.x + fx * (d + .06), mz_ = p.z + fz * (d + .06), ty = hC(TROUGH[0], TROUGH[1]) + .12, my = gy + hgt - .02; stream.visible = true; stream.position.set(mx_, (my + ty) / 2, mz_); stream.scale.set(1, Math.max(.01, my - ty), 1); stream.material.opacity = .85 * smooth(.25, .6, pourAt); drop.position.set(mx_, ty, mz_); drop.material.opacity = .5 * pourAt; } } }
    // water in the trough rises while she pours; the well is dark
    { const lv = smooth(29.3, 30.3, t) * .5 + smooth(32.4, 33.4, t) * .5; troughW.position.y = hC(TROUGH[0], TROUGH[1]) + .07 + .045 * lv; troughW.visible = lv > .005 || t > 29.0; }
    // her family in the courtyard (24:50, 24:57-58): the father (an elder), the mother and her brother, standing before the door
    kin.forEach((f, i) => { const [x, z] = KFAM[i], ry = hy(t, [[35, headZ(-1, .3)], [38.6, headZ(-1, .3)], [39.7, headZ(1, .1)], [90, headZ(1, .1)]]); const show = t > 34.9 && t < 43.2; f.group.visible = show; if (show) fig(f, x, z, ry, false, t, 6 + i, { s: 1 + .008 * Math.sin(t * 1.5 + i), ...GE(t, [[35.6, 36.2, 37.8, 38.6, { a0x: -.8, a1x: -.8, a0z: -.5, a1z: .5, lx: .04 }], [38.9, 39.5, 40.4, 41.0, { a0x: -.5, a1x: -.1, a0z: -.2, lx: .05 }]]) }, 9.0); });
    // Isaac
    { const show = t > 42.7; isaac.group.visible = show; if (show) { const p = kp(t, KI), mv = p.mv; const ry = mv ? headZ(p.vx, p.vz) : hy(t, [[42.8, WW], [47.0, WW], [47.8, headZ(.1, 1)], [51.8, headZ(1, .1)], [52.8, NN], [90, NN]]);
      const ex = !mv ? GE(t, [[45.4, 46.2, 49.0, 50.0, { lx: -.08, a0x: -.2, a1x: -.2 }], [51.0, 51.5, 51.9, 52.3, { a1x: -.7 }]]) : {}; fig(isaac, p.x, p.z, ry, mv, t, 5.1, ex, 6.5);
      if (t > 54.1) { const s = 1 - smooth(54.1, 54.8, t); isaac.group.visible = s > .02; isaac.group.scale.set(isaac.sc * s, isaac.sc * s, isaac.sc * s); } } }
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#8a8cc0', '#4a4048', .9, '#ffb070', 2.3, [-10, 3.2, 5], .5, '#ffc890', [8, 4, 6], 14), Dk(9, '#8a8cc0', '#4a4048', .9, '#ffb878', 2.3, [-10, 3.4, 5], .5, '#ffc890', [8, 4, 6], 14),
    Dk(13, '#a0a8d0', '#6a5a50', .95, '#ffc890', 2.4, [-9, 4.2, 6], .5, '#ffcf9a', [8, 4, 6], 14), Dk(21, '#b0b8d4', '#7a6a58', 1.0, '#ffd8a0', 2.5, [-9, 4.6, 6], .55, '#ffd890', [8, 3, 6], 14),
    Dk(33, '#8a94c0', '#5a4c4c', .9, '#ffa860', 2.1, [-10, 2.6, 5], .5, '#ffb880', [8, 3, 6], 14), Dk(35.2, '#9aa8d0', '#645448', .95, '#ffd09a', 2.3, [9, 4.4, 7], .5, '#ffcf9a', [-8, 5, 6], 14),
    Dk(41.5, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.6, [8, 6, 8], .45, '#ffe8c8', [-8, 5, 6], 14), Dk(43.2, '#8a8cc0', '#4a4048', .9, '#ff9a58', 2.4, [-10, 2.6, 4], .55, '#ffb070', [8, 3, 6], 14),
    Dk(47.6, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(54, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(60, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14)];
  const bg = [[0, ['#2a3a7a', '#f0a870']], [9, ['#2a3a7a', '#f0a870']], [13, ['#4a68a8', '#f4c890']], [21, ['#5a88c4', '#f6dcb0']], [33, ['#34406e', '#f09a68']], [35.2, ['#5a7ab8', '#f4d4a8']], [41.5, ['#6a90c8', '#f6e4c0']], [43.2, ['#38447a', '#f29a64']], [47.6, ['#10204a', '#5a4a70']], [54, ['#0a1230', '#2a2a50']], [60, ['#0a1230', '#2a2a50']]];
  return { group: g, update, light, bg, far, abraham, pl: [campL, gateL, doorL], state, camels };
}
