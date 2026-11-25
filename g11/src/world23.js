// Episode 23: Genesis 23. Sarah dies at Kiriath-arba (Hebron) in the land of Canaan at the age of 127, and Abraham comes to mourn for her and to weep (23:1-2);
// he rises from beside her and speaks to the Hittites (the sons of Heth): "I am a stranger and a sojourner among you; give me a burial site among you" (23:3-4); they answer "you are a prince of God among us; bury your dead in the choicest of our tombs" (23:5-6);
// Abraham bows to the people of the land and asks them to speak for him to Ephron son of Zohar, that he may have the cave of Machpelah at the end of his field (23:7-9); Ephron, sitting among the Hittites, answers in the hearing of all who went in at the gate of the city: "I give you the field and the cave in it" (23:10-11);
// Abraham bows again and insists on paying the full price (23:12-13); Ephron: "a piece of land worth four hundred shekels of silver, what is that between you and me? Bury your dead" (23:14-15); Abraham weighs out the silver, in the hearing of the Hittites (23:16);
// the field, the cave in it and all the trees within its whole area are made over to Abraham in the sight of the Hittites, of all who went in at the gate of his city (23:17-18); Abraham buries Sarah in the cave of the field of Machpelah, east of Mamre, which is Hebron (23:19-20).
// Cinematic interpretation: the floating land, the shape of the tent and town, the lamp and the shrouded figure on the mat at dusk (the chapter does not say where she lay), the stone benches at the gate, the bronze scale, the shape of the field and the cave,
// the look of the sky and the way the figures stand, bow and walk are not in the text. The text does not say that Abraham's tent stood at Mamre in this chapter or where the gate stood; it says only that the cave is east of Mamre, so the film puts the camp (Mamre) to the west and the cave to the east.
// The film does not show the burial itself, only the cave mouth, the stone and Abraham looking toward Mamre. Isaac is not shown (the chapter does not mention him).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, crowdPalette, makeSheep } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, meshOf, houseBlock, wallRing } from './world10.js';

export const RIC = 15;
export const SC = [1.4, -1.6], HW = 3.2, HD = 2.8, YG = .34, GX = SC[0], GZ = SC[1] + HD;          // Hebron: a walled town whose gate faces south (+z)
export const GF = [GX - .2, GZ + 2.15];                                                                  // where Abraham stands before the elders, in front of the gate
export const TS = [-2.6, 3.4], BIER = [-2.45, 5.0], ABK = [-1.73, 5.0];                            // the tent of the camp (Mamre, to the west), the mat before it, where Abraham kneels (at its foot, facing west)
export const TBL = [GX, GZ + 1.25];                                                                  // the stone table with the scale
export const FLD = [6.8, 3.0], CAVE = [9.8, 1.0], CF = [9.0, 1.45];                                // Ephron's field, the cave of Machpelah, the apron before the cave
export const EV = { a1: .6, a2: 8.25, b1: 12.09, b2: 19.7, c1: 25.87, c2: 31.93, c3: 36.36, d1: 40.38, d2: 46.7, e1: 51.89, e2: 56.45 };

// ---------------- terrain: green camp ground in the west (the oaks of Mamre), golden earth around the town, the field in the east and the rocky rise with the cave beyond it
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.4, .2, 1.7, 3.7], [3.5, -10, 1.1, 5], [13.5, -6.5, 1.2, 4.2], [12.6, 7.8, .8, 3.6]];
const FLATS = [[TS[0], TS[1] + 1.4, .32, 3.8], [SC[0], SC[1] + .6, YG, 5.4], [FLD[0], FLD[1], .34, 3.2]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const PATH = [[-2.6, 4.9], [-1.2, 4.3], [.2, 3.8], [GX, GZ + 1.5], [3.2, 3.8], [5.2, 3.4]];
const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - (ax + u * vx), z - (az + u * vz))); } return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-6, 2, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .9);
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#cdb884'), .6 * smooth(6.0, 3.6, Math.hypot(x - SC[0], z - SC[1] - .6)));
  const fd = Math.hypot(x - FLD[0], z - FLD[1]); b.lerp(C3('#b99a5a'), .85 * smooth(3.2, 2.4, fd)); b.lerp(C3('#9c8040'), .4 * smooth(-.1, .7, Math.sin(z * 9)) * smooth(2.9, 2.2, fd));
  b.lerp(C3('#7e9a52'), .55 * smooth(4.6, 2.6, Math.hypot(x - TS[0], z - TS[1] - 1.4)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, SC, GX, GZ, GF, TS, BIER, ABK, TBL, FLD, CAVE, CF, YG };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : ease.inOutSine(r), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
// heading keys [[t, angle], ...] (angle = rotation.y of a figure, see headZ), eased between keys
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const N = Math.PI, ENE = headZ(1, -.35), NN = headZ(0, -1), WW = headZ(-1, 0), SSW = headZ(-.4, 1);
// Abraham: comes from the gate to Sarah (23:2) and kneels, rises and walks back to the gate (23:3), stands before the Hittites (23:3-16), walks to the field (23:17), stands at the cave (23:19)
const KA = [[0, GF[0], GF[1]], [1.2, GF[0], GF[1]], [8.0, ABK[0], ABK[1], 'W'], [10.5, ABK[0], ABK[1]], [13.7, GF[0], GF[1], 'W'], [36.0, GF[0], GF[1]], [37.0, GF[0], GF[1] - .28], [46.0, GF[0], GF[1] - .28], [47.2, TBL[0] + .02, TBL[1] + .56], [50.8, TBL[0] + .02, TBL[1] + .56],
  [57.0, 8.45, 1.85, 'W'], [90, 8.45, 1.85]];
const KAH = [[0, headZ(-1, .6)], [1.2, headZ(-1, .6)], [8.0, WW], [90, WW]];            // heading while he stands still (the walk headings follow the path)
// the speaking elder (H0): rises and answers (23:5-6); Ephron (EP): rises and answers (23:10-11, 14-15)
const H0P = [[0, -.5, GZ + .55], [19.6, -.5, GZ + .55], [20.3, .1, GZ + 1.0], [25.0, .1, GZ + 1.0], [25.8, -.5, GZ + .55], [90, -.5, GZ + .55]];
const EPP = [[0, 3.0, GZ + .55], [31.4, 3.0, GZ + .55], [32.2, 2.7, GZ + 1.0], [90, 2.7, GZ + 1.0]];
// seats along the two stone benches in front of the gate (x, z), facing south
const SEATS = [[-1.1, GZ + .55], [-.5, GZ + .55], [.1, GZ + .55], [2.5, GZ + .55], [3.0, GZ + .55], [3.6, GZ + .55]];
const STAND = [[-1.2, GZ + 1.5, headZ(.6, .6)], [4.8, GZ + 1.3, headZ(-.6, .7)], [5.45, GZ + 1.85, headZ(-.8, .5)], [-.7, GZ + 1.78, headZ(.7, .4)]];

// ---------------- little models
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkElder = (R, i, big) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: '#4a3a2c', beard: i % 2 ? '#8a8478' : '#3a2e22', cloth: c.cloth || undefined, sash: big ? '#e0b848' : undefined, seed: 400 + i }, big ? .47 : .44); };
const mkEphron = R => person(R, { pants: '#7a4a5a', top: '#c9a15a', skin: '#b57a50', hair: '#4a3a2a', beard: '#6a5a4a', sash: '#e0b848', cloth: '#efe4cc', seed: 77 }, .47);
const lamC = c => new THREE.MeshLambertMaterial({ color: c });

// ====================================================================== the world
export function makeHebron() {
  const R = rng(2323), g = new THREE.Group(), smoke = makeSmoke(3);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9801), RIC, hC, gcC, 30, 80), underRock(rng(9802), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  // the oaks of Mamre around the camp in the west (the chapter places the cave east of Mamre, 23:19)
  [[-7.2, 1.2, 2.5], [-9.0, 3.8, 2.0], [-5.4, -.9, 1.8], [-4.6, -3.6, 1.7]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-10.6, -4.0, 2.0], [-8.4, -8.0, 2.2]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  // the trees of the field (23:17): olives and round trees scattered over Ephron's land, a few more along the rise
  [[4.6, 1.2, .9], [5.4, 4.9, .85], [5.9, 6.0, .95], [6.3, 5.5, .85], [4.9, 3.7, .8], [5.3, 2.2, .7], [7.4, .6, .9], [6.2, .1, .75]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[9.6, -1.2, 1.0], [12.4, -.8, 1.1]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  for (let i = 0; i < 20; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .15 || Math.hypot(x - SC[0], z - SC[1]) < 4.9 || Math.hypot(x - FLD[0], z - FLD[1]) < 3.4 || Math.hypot(x - TS[0], z - TS[1]) < 3.6 || dPath(x, z) < 1.1 || Math.hypot(x - CAVE[0], z - CAVE[1]) < 3.4) continue; const m_ = tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); if (segD(x, z, -13.4, 10.2, -2.4, 5.0) < 2.2) ca.remove(m_); }   // (a tree in the corridor of the mourning shot, 4-11 s, is built like all the others, so the random sequence is unchanged, and then taken out of the scene)
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || Math.hypot(x - SC[0], z - SC[1]) < 4.6 || Math.hypot(x - FLD[0], z - FLD[1]) < 3.0 || Math.hypot(x - CAVE[0], z - CAVE[1]) < 2.2 || Math.hypot(x - TS[0], z - TS[1] - 1.2) < 2.6) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- Hebron: a walled town, its wall kept low so the roofs can be seen, with a gate in the south wall (towers, a lintel, a dark doorway) and a few houses and smoke inside
  { const wm = meshOf(wallRing(R, SC[0], SC[1], HW, HD, hC, 0, true)); wm.scale.y = .64; wm.position.y = YG * (1 - .64); ca.add(wm); }
  ca.add(meshOf(houseBlock(R, SC[0] - 1.55, SC[1] - .5, 2, 3, .9, hC, 0)), meshOf(houseBlock(R, SC[0] + 1.6, SC[1] - .4, 2, 3, .9, hC, 0)), meshOf(houseBlock(R, SC[0], SC[1] - 2.0, 3, 1, .9, hC, 0)));
  { const b = new GB(R), y = YG, z0 = GZ + .12;
    for (const s of [-1, 1]) { b.box('#d8c598', [GX + s * .66, y + .62, z0], [.5, 1.24, .62], [0, 0, 0], .04); b.box('#c2ae86', [GX + s * .66, y + 1.28, z0], [.58, .12, .7], [0, 0, 0], .03);
      for (const k of [-1, 0, 1]) b.box('#b09c74', [GX + s * .66 + k * .17, y + 1.4, z0], [.12, .12, .12], [0, 0, 0], .02); }
    b.box('#cdb88e', [GX, y + .98, z0], [.88, .26, .6], [0, 0, 0], .04); b.box('#e0b848', [GX, y + 1.12, z0 + .01], [.92, .04, .62], [0, 0, 0], .02);                 // the lintel
    b.box('#1a1008', [GX, y + .44, z0 + .08], [.8, .88, .5], [0, 0, 0], .01);                                                                                           // the dark doorway
    // the stone benches before the gate: low, with a front panel that hides the legs of the seated elders
    for (const [cx, w] of [[-.5, 2.2], [3.3, 2.2]]) { b.box('#bda985', [cx, y + .08, GZ + .72], [w, .16, .38], [0, 0, 0], .04); b.box('#a8946e', [cx, y + .08, GZ + .92], [w + .04, .17, .06], [0, 0, 0], .03); }
    ca.add(meshOf(b)); }
  // ---- the stone table before the gate (where the silver is weighed, 23:16)
  { const b = new GB(R), y = hC(TBL[0], TBL[1]);
    b.box('#b8a47c', [TBL[0], y + .24, TBL[1]], [.72, .06, .42], [0, 0, 0], .02); for (const sx of [-1, 1]) b.box('#a8946e', [TBL[0] + sx * .26, y + .12, TBL[1]], [.14, .24, .34], [0, 0, 0], .03);
    ca.add(meshOf(b)); }
  // ---- Ephron's field: furrows, and four boundary stones at its corners (the whole area is made over to Abraham, 23:17)
  { const b = new GB(R); for (let r = 0; r < 7; r++) for (let k = 0; k < 6; k++) { const x = FLD[0] - 1.9 + k * .76, z = FLD[1] - 1.7 + r * .56; if (Math.hypot(x - FLD[0], z - FLD[1]) > 2.5) continue; b.box('#a8863e', [x + (R() - .5) * .08, hC(x, z) + .012, z], [.62, .026, .1], [0, (R() - .5) * .06, 0], .02); }
    for (const [sx, sz] of [[-2.15, -1.7], [2.15, -1.7], [-2.15, 1.9], [2.15, 1.9]]) { const x = FLD[0] + sx, z = FLD[1] + sz; b.box('#b4a88e', [x, hC(x, z) + .14, z], [.14, .3, .14], [0, R(), 0], .04); }
    ca.add(meshOf(b)); }
  // ---- the cave of Machpelah at the end of the field: a rocky face, a dark mouth, a lintel stone and a flat apron
  const cave = new THREE.Group(); cave.position.set(CAVE[0], hC(CAVE[0], CAVE[1]) - .06, CAVE[1]); cave.rotation.y = headZ(CF[0] - CAVE[0], CF[1] - CAVE[1]); ca.add(cave);
  { const b = new GB(rng(77)), rk = ['#9a8e7c', '#a99c86', '#85796a', '#b0a48e'];
    for (const [x, y, z, sx, sy, sz] of [[-.55, .32, -.05, .42, .5, .38], [.55, .3, -.05, .44, .46, .36], [-.3, .72, -.12, .5, .34, .4], [.3, .76, -.1, .5, .32, .4], [0, .98, -.14, .62, .28, .42], [-.95, .22, .1, .34, .3, .3], [.95, .2, .12, .34, .28, .3], [0, .45, -.45, .9, .8, .5]]) b.add(G.ico0, pk(rng(78 + Math.floor(x * 10)), rk), [x, y, z], [sx, sy, sz], [0, x, 0], .06);
    b.box('#b8ac96', [0, .64, .1], [.9, .13, .22], [0, 0, 0], .03); b.box('#8a7e6e', [0, .02, .32], [1.2, .05, .8], [0, 0, 0], .02);
    cave.add(meshOf(b)); const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), lamC(0x120a06)); mouth.scale.set(.36, .5, .3); mouth.position.set(0, .02, .05); mouth.castShadow = false; cave.add(mouth); }
  // the stone that closes the cave: it is rolled in after the burial (23:19)
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .13, 12).rotateX(Math.PI / 2), lamC(0xa89a82)); seal.castShadow = true; seal.visible = false; cave.add(seal);
  // ---- the camp of Mamre: Abraham's tent, a second one, and a few sheep
  [[TS[0], TS[1], .0, '#cdb48c', 1.1], [TS[0] - 2.3, TS[1] + .4, .5, '#c2a67a', .8], [TS[0] - 1.1, TS[1] - 1.6, -.4, '#d4c29c', .7]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  const sheep = [[-4.9, 1.0], [-5.6, 2.0], [-6.2, .6]].map(([x, z], i) => { const s = makeSheep(rng(160 + i)); s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = i * 1.7; ca.add(s.group); return s; });
  // ---- Sarah, wrapped in white linen on a woven mat before the tent, with a lamp by her side (cinematic interpretation: the chapter does not say how or where she lay)
  const bier = new THREE.Group(); bier.position.set(BIER[0], hC(BIER[0], BIER[1]) - .01, BIER[1]); g.add(bier);
  { const b = new GB(rng(31)); b.box('#8a4a3c', [0, .012, 0], [.86, .02, .34], [0, 0, 0], .02); b.box('#c8a050', [0, .024, 0], [.8, .01, .06], [0, 0, 0], .01);
    b.box('#efe6d2', [0, .07, 0], [.64, .09, .16], [0, 0, 0], .02); b.add(G.ico1, '#efe6d2', [-.31, .08, 0], [.08, .06, .08], [0, 0, 0], .02); b.box('#e0d6bc', [.1, .12, 0], [.2, .02, .17], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; bier.add(m); }
  const lampB = new THREE.Group(); lampB.position.set(BIER[0] - .62, hC(BIER[0] - .62, BIER[1] - .2), BIER[1] - .2); g.add(lampB);
  { const b = new GB(rng(33)); b.add(G.cylT, '#a8783a', [0, .06, 0], [.05, .12, .05], [0, 0, 0], .01); b.box('#3a2418', [0, .13, 0], [.07, .02, .07], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; lampB.add(m); }
  const lampG = spriteGlow(BIER[0] - .62, hC(BIER[0] - .62, BIER[1] - .2) + .2, BIER[1] - .2, .95, 0xffa850, 0), lampG2 = spriteGlow(BIER[0] - .62, hC(BIER[0] - .62, BIER[1] - .2) + .19, BIER[1] - .2, .4, 0xffe0a0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa860, 0, 6, 1.7), gateL = new THREE.PointLight(0xffb870, 0, 7, 1.7);
  // the lamps at the gate and in the windows of the town come on at dusk and go out toward morning
  const lamps = [[GX - 1.05, GZ + .55], [GX + 1.05, GZ + .55], [SC[0] - 1.7, SC[1] - .2], [SC[0] + 1.8, SC[1] + .1], [SC[0] - .2, SC[1] - 1.9], [SC[0] + 2.3, SC[1] - 1.6]].map(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + (i < 2 ? .55 : .6), z, i < 2 ? .6 : .46, 0xffb860, 0); g.add(s); return s; });
  smoke.add(SC[0] - 1.4, YG + .95, SC[1] - .6, t => smooth(-1, 1, t) * (1 - smooth(10.5, 13, t)), .22, 1.8); smoke.add(SC[0] + 1.9, YG + .9, SC[1] - .5, t => smooth(-1, 1, t) * (1 - smooth(10.5, 13, t)), .2, 1.7); g.add(smoke.mesh);
  const SMK = [[0, '#a8a0a8'], [30, '#d8c6b0'], [90, '#cfc4b8']];
  // ---- the silver and the scale (23:16): a bronze balance on the table, a pile of weights in one pan, silver pieces that Abraham lays in the other
  const TY = hC(TBL[0], TBL[1]) + .27, balance = new THREE.Group(); balance.position.set(TBL[0], TY, TBL[1]); g.add(balance);
  const post = new THREE.Mesh((() => { const b = new GB(rng(41)); b.box('#b0803a', [0, .17, 0], [.03, .34, .03], [0, 0, 0], .01); b.box('#9a6e30', [0, .01, 0], [.14, .02, .08], [0, 0, 0], .01); return b.build(); })(), lam); post.castShadow = true; balance.add(post);
  const beamG = new THREE.Group(); beamG.position.set(0, .34, 0); balance.add(beamG);
  { const b = new GB(rng(42)); b.box('#c08a3c', [0, 0, 0], [.52, .016, .016], [0, 0, 0], .005); b.add(G.ico0, '#d8a24a', [0, .012, 0], [.02, .02, .02], [0, 0, 0], .005); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; beamG.add(m); }
  const pans = [-1, 1].map(s => { const pg = new THREE.Group(); pg.position.set(s * .25, 0, 0); beamG.add(pg); const b = new GB(rng(43)); b.box('#c08a3c', [0, -.06, 0], [.004, .12, .004], [0, 0, 0], .002); b.add(G.cylT, '#c8923e', [0, -.125, 0], [.085, .012, .085], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pg.add(m); return pg; });
  const wts = new THREE.Mesh((() => { const b = new GB(rng(44)); for (let k = 0; k < 5; k++) b.box('#6a645a', [(k % 3 - 1) * .04, -.105 + (k > 2 ? .03 : 0), (k % 2 - .5) * .05], [.04, .026, .035], [0, k, 0], .005); return b.build(); })(), lam); pans[1].add(wts);
  const bars = Array.from({ length: 8 }, (_, k) => { const b = new GB(rng(45 + k)); b.box('#e2e6f0', [0, 0, 0], [.06, .02, .035], [0, 0, 0], .003); const m = new THREE.Mesh(b.build(), lam); m.position.set((k % 4 - 1.5) * .045, -.1 + Math.floor(k / 4) * .022, (k % 2 - .5) * .045); m.castShadow = true; m.visible = false; pans[0].add(m); return m; });
  const glint = spriteGlow(TBL[0] - .25, TY + .25, TBL[1] + .08, .3, 0xfff4d8, 0); g.add(glint);
  // ---- the people
  const abraham = mkAbraham(rng(83)), elders = SEATS.map((_, i) => i === 4 ? mkEphron(rng(84)) : mkElder(rng(120 + i), i, i === 2)), watchers = STAND.map((_, i) => mkElder(rng(140 + i), 10 + i));   // elders[4] is Ephron, son of Zohar; elders[1] answers for the Hittites
  [abraham, ...elders, ...watchers].forEach(o => g.add(o.group));
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(motes.mesh);
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const CLOUD = [[0, '#58588a'], [8, '#b8a0a0'], [10.8, '#f0d8c0'], [20, '#fbf6ea'], [40, '#f6e4c4'], [52, '#f8e6c0'], [60, '#e4ccb4'], [90, '#b8aeb0']];
  const CEM = [[0, '#2a2a48'], [8, '#4a3e4a'], [14, '#6a6258'], [40, '#7a6a58'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const SIT = .84, state = { abraham: [GF[0], 0, GF[1]] };
  const v3 = new THREE.Vector3();

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun: the dusk of the evening Sarah dies (west), the morning at the gate (east), and the warm light when the field is made over to Abraham
    { const dusk = ON(t, -1, 0.2, 5.5, 8.4), rise = ON(t, 10.0, 11.6, 15.0, 18.0), warm = ON(t, 50.0, 52.4, 89, 90), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + (rise > .01 ? 5 : 9), cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(dusk * .6, rise * .8, warm * .8); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01; }
    // lamps: the one by Sarah burns until the morning, the gate and town lamps come on at dusk
    { const fl = .86 + .14 * Math.sin(t * 9.1) * Math.sin(t * 5.3), kl = smooth(-.5, .8, t) * (1 - smooth(10.2, 12.4, t)), kg = smooth(-.5, .8, t) * (1 - smooth(11.0, 14.0, t));
      lampG.material.opacity = .62 * kl * fl; lampG2.material.opacity = .5 * kl; lampG.visible = lampG2.visible = kl > .01; lampL.position.set(BIER[0] - .62, hC(BIER[0], BIER[1]) + .5, BIER[1] - .1); lampL.intensity = 4.2 * kl * fl;
      lamps.forEach((s, i) => { s.material.opacity = (i < 2 ? .6 : .5) * kg * (.9 + .1 * Math.sin(t * 7 + i)); s.visible = kg > .01; }); gateL.position.set(GX, YG + 1.0, GZ + 1.3); gateL.intensity = 3.0 * kg; }
    smoke.update(t, colAt(SMK, t)); motes.update(t, .5 * (.4 + .6 * ON(t, 11, 14, 80, 88)), [3, .5, 2.5]);
    sheep.forEach((s, i) => { s.group.rotation.y = i * 1.7 + .12 * Math.sin(t * .4 + i); });
    // Sarah lies before the tent until Abraham leaves for the gate; afterwards the mat is carried to the cave (it is shown there again from e1 on)
    bier.visible = t < 11.4 || t > 55.0; bier.position.set(t < 11.4 ? BIER[0] : CF[0] + .02, 0, t < 11.4 ? BIER[1] : CF[1] - .02); bier.position.y = hC(bier.position.x, bier.position.z) - .01; bier.rotation.y = t < 11.4 ? 0 : Math.atan2(-(CF[1] - CAVE[1]), CF[0] - CAVE[0]);
    lampB.visible = t < 11.4;
    // the stone is rolled before the cave after the burial; the mat has been taken in
    { const sl = smooth(57.4, 58.6, t); bier.visible = t < 11.4 || (t > 55.0 && t < 57.6); seal.visible = sl > .01; seal.position.set(lerp(.9, 0, ease.outCubic(sl)), .28, .34); seal.rotation.z = (1 - sl) * 1.6; }

    // Abraham
    { const p = kp(t, KA), mv = p.mv, kneel = ON(t, 7.9, 8.6, 9.8, 10.5), walkingSlow = t < 8.0; let ry = mv ? headZ(p.vx, p.vz) : hy(t, KAH), ex = {}, s = 1 - (1 - SIT) * kneel;
      if (!mv) { if (t >= 13.7) ry = hy(t, [[0, NN], [27.6, NN], [28.6, ENE], [31.0, ENE], [32.0, NN], [46.6, NN], [47.2, NN], [50.7, NN], [57.2, WW], [90, WW]]);
        ex = GE(t, [[8.0, 8.8, 9.6, 10.4, { lx: .42, a0x: -.5, a1x: -.5 }], [13.6, 14.2, 15.0, 15.6, { a1x: -.9, a1z: -.35, lx: .04 }], [16.0, 16.6, 18.4, 19.2, { a0x: -1.1, a1x: -1.1, a0z: -.3, a1z: .3, lx: .05 }],
          [19.8, 20.6, 24.2, 25.4, { lx: .1 }], [26.0, 26.7, 27.0, 27.9, { lx: .5 }], [28.7, 29.3, 30.6, 31.2, { a1x: -1.45, a1z: .05 }], [36.6, 37.4, 38.6, 39.3, { a0x: -.9, a1x: -.9, a0z: -.2, a1z: .2, lx: .06 }], [38.8, 39.4, 39.7, 40.3, { a1x: -.8, a1z: -.3 }],
          [40.8, 41.6, 45.4, 46.4, { lx: .06 }], [47.4, 48.0, 50.4, 51.2, { lx: .16, a0x: -.85, a1x: -.85, a0z: -.1, a1z: .1 }], [57.2, 58.0, 59.0, 60.0, { lx: .1, a0x: -.2, a1x: -.2 }]]); }
      ex.s = s; fig(abraham, p.x, p.z, ry, mv, t, 1.1, ex, walkingSlow ? 6.0 : 9.0); state.abraham = [p.x, gAt(p.x, p.z), p.z]; }
    // the elders on the benches: still, with a slow breath; the speaking elder (H0) and Ephron rise from their seats (23:5-6, 23:10-15)
    elders.forEach((e, i) => { let [x, z] = SEATS[i], ry = headZ(.05 * (i - 2.5), 1), ex = {}, s = SIT, mv = false;
      if (i === 1) { const p = kp(t, H0P); x = p.x; z = p.z; mv = p.mv; const up = ON(t, 19.6, 20.2, 25.0, 25.8); s = SIT + (1 - SIT) * up; ry = mv ? headZ(p.vx, p.vz) : headZ(.05, 1);
        ex = GE(t, [[20.4, 21.0, 23.4, 24.2, { a0x: -1.15, a1x: -1.15, a0z: -.4, a1z: .4, lx: .05 }]]); }
      if (i === 4) { const p = kp(t, EPP); x = p.x; z = p.z; mv = p.mv; const up = ON(t, 31.4, 32.0, 99, 100); s = SIT + (1 - SIT) * up; ry = mv ? headZ(p.vx, p.vz) : headZ(-.9, .85);
        ex = GE(t, [[32.4, 33.0, 35.2, 36.0, { a0x: -1.1, a1x: -1.1, a0z: -.35, a1z: .35 }], [40.8, 41.5, 42.3, 43.0, { a0x: -.5, a1x: -.5, a0z: -.85, a1z: .85 }], [43.2, 43.8, 44.6, 45.2, { a0x: -1.0, a1x: -1.0, a0z: -.4, a1z: .4 }], [45.2, 45.8, 47.0, 48.0, { a0x: -.7, a1x: -.1, a0z: -.2 }]]); }
      if (i !== 1 && i !== 4) { ex = GE(t, [[21.5, 22.2, 23.0, 23.8, { lx: .08 }], [33.0, 33.6, 34.6, 35.2, { lx: .06 }], [47.6, 48.2, 49.6, 50.4, { lx: .08 }]]); }
      ex.s = s * (1 + .008 * Math.sin(t * 1.7 + i * 2)); fig(e, x, z, ry, mv, t, 3 + i, ex, 9.0); });
    watchers.forEach((w, i) => { const [x, z, ry] = STAND[i]; fig(w, x, z, ry, false, t, 7 + i, { s: 1 + .008 * Math.sin(t * 1.5 + i), ...GE(t, [[26.0, 26.6, 27.6, 28.2, { lx: .05 }]]) }, 9.0); });
    // the scale: the weights sit in the right pan; Abraham lays eight silver pieces in the left pan (23:16) until the beam is level
    { const n = Math.min(8, Math.floor(smooth(47.8, 50.2, t) * 8.0001)), tilt = .26 * (1 - n / 8) * smooth(46.8, 47.6, t) + .0; bars.forEach((m, k) => m.visible = k < n);
      const tt = tilt + .012 * Math.sin(t * 5) * (1 - smooth(50.3, 51.5, t)) * (n > 0 ? 1 : 0); beamG.rotation.z = tt; pans.forEach(p => p.rotation.z = -tt);
      const gl = ON(t, 49.6, 50.0, 50.6, 51.2); glint.material.opacity = .8 * gl; glint.visible = gl > .01; }
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(8.4, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(11.4, '#7a88c0', '#4a4048', .85, '#ffb888', 2.1, [10, 2.8, 7], .5, '#ffc890', [-8, 5, 6], 14), Dk(14, '#9aa8d0', '#645448', .95, '#ffd09a', 2.3, [8, 4.4, 8], .5, '#ffcf9a', [-8, 5, 6], 14),
    Dk(19, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [5, 9, 8], .4, '#ffe8c8', [-8, 5, 6], 14), Dk(36, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [-4, 9, 7], .4, '#ffe8c8', [8, 5, 6], 14),
    Dk(44, '#b0b8d4', '#7a6a58', 1.0, '#ffe0b0', 2.6, [6, 7, 8], .45, '#ffe0b0', [-8, 4, 6], 14), Dk(52, '#b0b8d4', '#7a6a58', 1.0, '#ffd8a0', 2.5, [-9, 5, 6], .55, '#ffd890', [8, 3, 6], 14),
    Dk(56.4, '#a8b4d4', '#6a5a4c', 1.0, '#ffd2a0', 2.5, [11, 3.4, 3], .5, '#ffd8a8', [-9, 3, 6], 14), Dk(60, '#a0a4b8', '#5c5250', 1.0, '#f4d4a8', 1.9, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#0c1636', '#3c3868']], [6, ['#10204a', '#5a4a70']], [10.4, ['#3a5a9a', '#f0b878']], [13, ['#4a78b8', '#f4d4a4']], [19, ['#5a88c4', '#f6ecd0']], [36, ['#5a88c4', '#f6e4c0']], [44, ['#6a90c0', '#f6e0b4']], [52, ['#6a90c0', '#f4dcb0']], [56.4, ['#4a78b8', '#f4cc98']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, abraham, pl: [lampL, gateL], state };
}
