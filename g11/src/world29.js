// Episode 29: Genesis 29. Jacob comes to the land of the people of the east and sees a well in the open country, with three flocks of sheep lying beside it and a large stone on its mouth (29:1-2);
// the shepherds say they roll the stone away only when all the flocks are gathered, and they point to Rachel, Laban's daughter, coming with her father's sheep (29:3-9); Jacob rolls the stone from the well, waters Laban's sheep, kisses Rachel and weeps aloud (29:10-11);
// Rachel runs and tells her father; Laban runs to meet Jacob, embraces and kisses him and brings him to his house (29:12-13); Jacob says "I will serve you seven years for your younger daughter Rachel" (29:18);
// the seven years seemed to him but a few days because he loved her (29:20); Laban gathers the people and makes a feast, and in the evening brings Leah to Jacob (29:22-23); in the morning, behold, it was Leah: "Why have you deceived me?" - "it is not so done in our country, to give the younger before the firstborn" (29:25-26);
// after the week Laban gives him Rachel also, for seven more years of service (29:27-30); the Lord saw that Leah was hated (unloved) and opened her womb: Reuben, Simeon, Levi (29:31-34); and Judah, "This time I will praise the Lord" (29:35).
// Cinematic interpretation: the floating land, the shape of the well, the trough, the shepherds, the house and its doorway, the lamps and torches, the feast mat and the guests, the rows of stones that stand for the years, the tools, the colour of the light, the veil, the faces and the way the figures stand, walk, run, embrace, point, plead, step aside and lift are not in the text.
// The film leaves out the first month of Jacob's stay (29:14-15), the description of the sisters (29:16-17), Laban's gift of the maids Zilpah and Bilhah (29:24, 29:29), Leah's weak eyes, and the sons' names beyond the narration. The wedding night is told in one sentence: the film shows only the doorway.
// The text does not say that the years are counted in stones, how the seven years were spent, that Leah wore a veil of a certain colour, or that the Lord's seeing was a light; the film shows them so that each moment can be seen. God is shown only as light, never as a figure.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, cloudSea, farMountains10, headZ, headX, C3, rimf, meshOf } from './world10.js';
import { makeStars } from './stars15.js';

export const RIC = 15;
export const HZ = [-6.7, .9], DOOR = [-5.46, .9], YARD = [-4.3, 1.25], WELL = [3.4, -1.0], FLD = [-2.6, 4.8], TZ = 2.9;       // Laban's house (door faces east); the yard; the well; the field; the row of year-stones
export const TL = Array.from({ length: 14 }, (_, k) => [-4.6 + .5 * k + (k > 6 ? .1 : 0), TZ + .1 * Math.sin(k * 1.9)]);          // the fourteen year-stones, in two rows of seven
export const EV = { a1: .6, a2: 7.2, a3: 11.45, b1: 17.6, b2: 24.5, c1: 30.0, c2: 35.2, c3: 43.7, d1: 50.35, d2: 56.2 };

// ---------------- terrain: open country, green by the house and dry round the well, a tilled field in the south
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.8, -5.4, 1.5, 3.8], [3.5, -10.5, 1.1, 5], [12.6, 5.4, 1.1, 3.8], [-2, -10.8, 1.2, 4]];
const FLATS = [[HZ[0] + 1.2, HZ[1] + .4, .32, 4.4], [YARD[0], YARD[1], .32, 2.8], [WELL[0], WELL[1], .31, 3.4], [FLD[0], FLD[1], .32, 3.2], [-1.2, TZ, .32, 4.0]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
export const PATH = [[-5.0, 1.1], [-2.6, 1.5], [-.2, .9], [2.0, -.1], [4.6, -.2], [7.4, .2], [10.2, .6]];
const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-5, 3, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .9);
  b.lerp(C3('#a8906a'), .7 * smooth(2.6, 1.0, Math.hypot(x - WELL[0], z - WELL[1])));
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#8a6a44'), .85 * smooth(2.9, 2.0, Math.hypot((x - FLD[0]) * .8, z - FLD[1])));
  b.lerp(C3('#7e9a52'), .5 * smooth(5.0, 2.6, Math.hypot(x - YARD[0] + 1.4, z - YARD[1])));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, HZ, DOOR, YARD, WELL, FLD, TL, PATH };

// ---------------- walkers: keys [[t, x, z, ease?], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);

// ---------------- the people
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);                       // the same Jacob as in Genesis 27-28
const mkRachel = R => person(R, { pants: '#e0d4b4', top: '#4f9a8a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#efe4cc', sash: '#c8884a', seed: 810 }, .43);
const mkLeah = R => person(R, { pants: '#cdbf9c', top: '#8a5a78', skin: '#c58c60', hair: '#2a1a10', long: true, cloth: '#d8c8d6', sash: '#c9a15a', seed: 820 }, .44);
const mkLaban = R => person(R, { pants: '#d9ccb0', top: '#3f6a78', skin: '#b98a62', hair: '#6a5a4a', beard: '#8a7a68', mantle: '#8a5a3a', sash: '#a8483a', seed: 830 }, .47);
const mkHerd = (R, top, skin, seed, pants = '#5a4a38') => person(R, { pants, top, skin, hair: '#2e1d10', sash: '#3a2a1a', seed }, .45);
const mkSon = (R, top, seed, sc) => person(R, { pants: '#d9ccb0', top, skin: '#c58c60', hair: '#2a1a10', seed }, sc);
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const waterM = () => new THREE.MeshLambertMaterial({ color: 0x3a6c92, emissive: 0x14304a });

// ====================================================================== the world
export function makeCountry() {
  const R = rng(2929), g = new THREE.Group();
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9871), RIC, hC, gcC, 30, 80), underRock(rng(9872), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  [[-10.0, 3.0, 2.4], [-9.2, -2.4, 2.0], [-10.4, 6.0, 1.9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-8.0, -6.4, 2.0], [-5.4, -8.4, 2.1]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-1.4, -3.2, .85], [1.4, -5.6, .8], [7.6, -4.4, .9], [7.0, 7.6, .8], [-5.0, 6.8, .9]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[11.0, -.4, 1.0], [12.4, -3.8, 1.1], [9.4, 9.8, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.hypot(x - HZ[0], z - HZ[1]) < 3.2 || Math.hypot(x - YARD[0], z - YARD[1]) < 2.6 || dPath(x, z) < 1.2 || Math.hypot(x - WELL[0], z - WELL[1]) < 3.4 || Math.hypot((x - FLD[0]) * .8, z - FLD[1]) < 3.2 || (Math.abs(z - TZ) < 1.0 && x > -5.4 && x < 2.9);
  for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- Laban's house: mud-brick walls, a flat roof with a parapet, a doorway on the east face, a small window, and a lit lamp inside (the wedding night and Leah's evening)
  const hb = new GB(rng(71)), hx = HZ[0], hz = HZ[1], hy0 = hC(hx + 1.2, hz);
  hb.box('#cdb48c', [hx, hy0 + .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, hy0 + 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, hy0 + 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
  hb.box('#cdb48c', [hx - 1.2, hy0 + .62, hz + 1.25], [1.2, .9, .9], [0, 0, 0], .04); hb.box('#b09c74', [hx - 1.2, hy0 + 1.12, hz + 1.25], [1.3, .1, 1.0], [0, 0, 0], .03);
  hb.box('#3a2a1c', [hx + 1.21, hy0 + .5, hz], [.06, .9, .62], [0, 0, 0], .02); hb.box('#6b4a2c', [hx + 1.235, hy0 + .98, hz], [.04, .05, .76], [0, 0, 0], .01); hb.box('#6b4a2c', [hx + 1.235, hy0 + .5, hz - .34], [.04, .92, .05], [0, 0, 0], .01); hb.box('#6b4a2c', [hx + 1.235, hy0 + .5, hz + .34], [.04, .92, .05], [0, 0, 0], .01);
  hb.box('#3a2a1c', [hx + 1.21, hy0 + .84, hz + .92], [.05, .22, .24], [0, 0, 0], .02); hb.box('#6b4a2c', [hx + 1.235, hy0 + .84, hz + .92], [.04, .27, .29], [0, 0, 0], .01);
  hb.box('#8a7254', [hx + 1.3, hy0 + .04, hz], [.4, .04, 1.3], [0, 0, 0], .02);
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  const doorY = hy0 + .5;
  const doorM = new THREE.Mesh(new THREE.PlaneGeometry(.5, .84), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); doorM.position.set(hx + 1.25, doorY, hz); doorM.rotation.y = Math.PI / 2; g.add(doorM);
  const winM = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); winM.position.set(hx + 1.255, hy0 + .84, hz + .92); winM.rotation.y = Math.PI / 2; g.add(winM);
  const doorG = spriteGlow(hx + 1.5, doorY + .05, hz, 1.9, 0xffc070, 0), doorG2 = spriteGlow(hx + 1.35, doorY, hz, .8, 0xfff0c8, 0); g.add(doorG, doorG2);
  const doorL = new THREE.PointLight(0xffc070, 0, 6, 1.6); doorL.position.set(hx + 1.9, hy0 + .75, hz);
  // ---- torches in the yard (the wedding night, 29:22) and a mat with bowls where the guests sit
  const torches = [[YARD[0] + .9, YARD[1] - 1.3], [YARD[0] + .9, YARD[1] + 1.7]].map(([x, z]) => { const y = hC(x, z), grp = new THREE.Group(); grp.position.set(x, y, z); g.add(grp);
    const b = new GB(R); b.box('#4a3420', [0, .32, 0], [.04, .64, .04], [0, 0, 0], .01); b.box('#3a2a18', [0, .66, 0], [.09, .06, .09], [0, 0, 0], .01); grp.add(meshOf(b));
    const fm = new THREE.Mesh(new THREE.ConeGeometry(.06, .2, 5).translate(0, .1, 0), new THREE.MeshBasicMaterial({ color: 0xffa030, toneMapped: false, transparent: true, opacity: .95 })); fm.position.y = .68; grp.add(fm);
    const gl = spriteGlow(x, y + .8, z, 1.3, 0xff9a40, 0), gl2 = spriteGlow(x, y + .78, z, .45, 0xffe0a0, 0); g.add(gl, gl2); return { fm, gl, gl2 }; });
  const torchL = new THREE.PointLight(0xff9a50, 0, 6, 1.5); torchL.position.set(YARD[0] + .6, hC(YARD[0], YARD[1]) + .9, YARD[1] + .3);
  const MAT = [YARD[0] + 1.0, YARD[1] + 1.5]; let mat = null;
  { const b = new GB(rng(411)), my = hC(MAT[0], MAT[1]); b.box('#8a4a3c', [MAT[0], my + .012, MAT[1]], [1.5, .02, .9], [0, 0, 0], .02); b.box('#c8a050', [MAT[0], my + .024, MAT[1]], [1.4, .01, .09], [0, 0, 0], .01);
    for (const [x, z, c] of [[-.45, -.18, '#a8602e'], [.1, -.22, '#8a4a22'], [.5, -.1, '#a8602e'], [-.15, .2, '#8a4a22'], [.38, .24, '#a8602e']]) { b.add(G.cylT, c, [MAT[0] + x, my + .06, MAT[1] + z], [.1, .06, .1], [0, 0, 0], .01); b.add(G.cylT, '#c8a85a', [MAT[0] + x, my + .092, MAT[1] + z], [.075, .012, .075], [0, 0, 0], .004); }
    for (const [x, z] of [[-.05, -.02], [.25, .06], [-.3, .04]]) b.add(G.ico1, '#d8b878', [MAT[0] + x, my + .06, MAT[1] + z], [.09, .035, .06], [0, x * 9, 0], .01);
    mat = meshOf(b); ca.add(mat); }
  // ---- the field: tilled earth with young green rows, a tool and a basket at its edge
  { const b = new GB(rng(421)), rr = rng(422); for (let r = 0; r < 8; r++) for (let k = 0; k < 16; k++) { const x = FLD[0] - 1.9 + k * .25 + (rr() - .5) * .05, z = FLD[1] - 1.1 + r * .3 + (rr() - .5) * .04; if (Math.hypot((x - FLD[0]) * .85, z - FLD[1]) > 1.9) continue; const h = .1 + rr() * .07, y = hC(x, z); b.box(pk(rr, ['#8aa84a', '#7a9a40', '#98b458']), [x, y + h / 2, z], [.025, h, .025], [(rr() - .5) * .2, 0, (rr() - .5) * .2], .01); }
    b.add(G.cylT, '#a8782e', [FLD[0] + 2.1, hC(FLD[0] + 2.1, FLD[1] + .5) + .08, FLD[1] + .5], [.17, .16, .17], [0, 0, 0], .01); ca.add(meshOf(b)); }
  // ---- the fourteen year-stones: small standing stones in a row, rising one by one (the first seven are the seven years for Rachel, the next seven the seven years after Leah); each has a soft glow when it is set
  const tally = TL.map(([x, z], k) => { const y = hC(x, z), m = new THREE.Mesh(G.ico1, lamC(k < 7 ? '#c0b298' : '#c8bca0')); m.position.set(x, y, z); m.userData.h = .17 + .03 * Math.sin(k * 2.3); m.castShadow = true; m.visible = false; g.add(m);
    const gl = spriteGlow(x, y + .12, z, .5, 0xffd890, 0); g.add(gl); return { m, gl, y }; });
  // ---- the well: a ring of stones, the great stone on its mouth that is rolled aside (29:2, 29:10), a bucket on the rim, and a stone trough with water for the flock (29:3, 29:10)
  const wring = new THREE.Group(); wring.position.set(WELL[0], hC(WELL[0], WELL[1]), WELL[1]); ca.add(wring);
  { const b = new GB(R); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; b.box(pk(R, ['#b8a47c', '#a8946e', '#c2ae86']), [Math.cos(a) * .27, .12, Math.sin(a) * .27], [.17, .24, .17], [0, -a, 0], .03); }
    wring.add(meshOf(b)); const w = new THREE.Mesh(new THREE.CircleGeometry(.2, 18), waterM()); w.rotation.x = -Math.PI / 2; w.position.set(0, .17, 0); wring.add(w); wring.userData.water = w; }
  const bucket = new THREE.Group(); { const b = new GB(R); b.add(G.cylT, '#8a6a44', [0, .06, 0], [.09, .12, .09], [0, 0, 0], .01); b.add(G.cylT, '#3a6c92', [0, .115, 0], [.075, .01, .075], [0, 0, 0], .004); bucket.add(meshOf(b)); } bucket.position.set(.55, 0, -.28); wring.add(bucket);
  const TR = [-.95, .45];
  { const tr = new GB(R); tr.box('#a8946e', [TR[0], .08, TR[1]], [.8, .16, .28], [0, .2, 0], .03); tr.box('#98845e', [TR[0] - .02, .06, TR[1] + .15], [.84, .12, .05], [0, .2, 0], .02); tr.box('#98845e', [TR[0] + .02, .06, TR[1] - .15], [.84, .12, .05], [0, .2, 0], .02); wring.add(meshOf(tr)); }
  const trW = new THREE.Mesh(new THREE.BoxGeometry(.68, .06, .2), new THREE.MeshLambertMaterial({ color: 0x3c6a8c, emissive: 0x10243a })); trW.position.set(TR[0], .06, TR[1]); trW.rotation.y = .2; wring.add(trW);
  const stoneM = new THREE.Mesh(G.ico1, lamC('#a89c88')); stoneM.castShadow = true; stoneM.receiveShadow = true; g.add(stoneM);
  const GS0 = [WELL[0], hC(WELL[0], WELL[1]) + .35, WELL[1]], GS1 = [WELL[0] - .1, hC(WELL[0] - .1, WELL[1] - 1.05) + .2, WELL[1] - 1.05];          // where the great stone lies on the well, and where it rolls to
  const pour = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1, 6), new THREE.MeshBasicMaterial({ color: 0x7ab4d8, transparent: true, opacity: 0, toneMapped: false })); pour.visible = false; g.add(pour);
  // ---- the sheep: three flocks lying by the well (29:2), and Rachel's flock (29:9)
  const mkFlock = (n, [cx, cz], sd) => Array.from({ length: n }, (_, i) => { const s = makeSheep(rng(sd + i)), a = i * 2.1 + sd, x = cx + Math.cos(a) * .42, z = cz + Math.sin(a) * .34; s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = a; ca.add(s.group); s.home = [x, z, a]; return s; });
  const FA = [1.9, -2.5], FB = [5.2, -2.6], FC = [3.3, 1.5];
  const flocks = [mkFlock(3, FA, 600), mkFlock(3, FB, 620), mkFlock(3, FC, 640)], flockR = Array.from({ length: 4 }, (_, i) => { const s = makeSheep(rng(660 + i)); g.add(s.group); return s; });
  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const stars = makeStars({ seed: 29 }); g.add(stars.group);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const spark = makeMotes({ n: 40, area: [1.2, 3.5, 1.2], size: .007, v: .22, seed: 41, color: 0xffe4a8 }); g.add(spark.mesh);
  const CLOUD = [[0, '#e8d0b0'], [14, '#e8c4a0'], [26, '#d89080'], [29.6, '#4a4a70'], [35, '#262a4a'], [36.6, '#6a5a80'], [38.4, '#e8c0a0'], [50, '#e8c8a8'], [90, '#e8c8a8']];
  const CEM = [[0, '#6a5a48'], [14, '#6a5444'], [26, '#5a4444'], [29.6, '#2e2e48'], [35, '#181a30'], [36.6, '#4a4058'], [38.4, '#6a5848'], [90, '#6a5848']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the people
  const jacob = mkJacob(rng(87)), rachel = mkRachel(rng(88)), laban = mkLaban(rng(89)), leah = mkLeah(rng(90));
  const s1 = mkHerd(rng(91), '#6f8a62', '#a8714a', 781), s2 = mkHerd(rng(92), '#c9a15a', '#c38a5c', 782, '#6a5a3a'), s3 = mkHerd(rng(93), '#9a4a42', '#b98a62', 783, '#4a3a30');
  const gu1 = mkHerd(rng(94), '#7a5a8a', '#a8714a', 784, '#cdbd98'), gu2 = mkHerd(rng(95), '#a2564e', '#b98a62', 785, '#cdbd98');
  const k1 = mkSon(rng(96), '#6a7fa0', 850, .27), k2 = mkSon(rng(97), '#a8683a', 851, .3), k3 = mkSon(rng(98), '#5f8a5a', 852, .33);
  const ALLP = [jacob, rachel, laban, leah, s1, s2, s3, gu1, gu2, k1, k2, k3]; ALLP.forEach(o => g.add(o.group));
  const staff = new THREE.Group(); { const b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; staff.add(m); } jacob.group.add(staff);
  const baby = new THREE.Group(); { const b = new GB(rng(9)); b.box('#efe4cc', [0, 0, 0], [.2, .1, .11], [0, 0, 0], .02); b.add(G.ico0, '#c08258', [-.1, .03, 0], [.045, .045, .045], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; baby.add(m); } baby.position.set(0, .56, .2); leah.group.add(baby); baby.visible = false;
  const veil = new THREE.Mesh(new THREE.BoxGeometry(.2, .34, .02), lamC('#e8dcd0')); veil.position.set(0, .98, .1); leah.group.add(veil); veil.visible = false;
  const leahL = new THREE.PointLight(0xffd090, 0, 6, 1.5), leahS = shaft(6, .22, .5, [1, .86, .5], .9, .12), leahG = spriteGlow(0, 0, 0, 1.3, 0xffd890, 0), leahP = pool(.9, 0xffd890, 0); g.add(leahS, leahG, leahP);

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = {};

  // ---- the keys
  const JW = [5.3, .3], STN = [WELL[0] + .15, WELL[1] + .95];                // where Jacob waits; where he stands to roll the stone
  // Jacob: arrives from the east (29:1), waits by the shepherds, rolls the stone (29:10), waters the flock, greets Rachel (29:11); meets Laban on the road (29:13); stands in the yard (29:18); works; the wedding night (29:23); the morning (29:25); the second seven years
  const KJ = [[0, 10.0, .6], [4.6, JW[0], JW[1], 'W'], [11.4, JW[0], JW[1]], [12.3, STN[0], STN[1], 'W'], [13.2, STN[0], STN[1]], [14.0, 2.9, -.35, 'W'], [14.6, 2.9, -.35], [15.3, 1.78, .1, 'W'], [16.9, 1.78, .1], [19.4, -.4, 1.2, 'W'], [19.8, -.4, 1.2], [22.2, -3.7, 1.28, 'W'], [25.0, -3.7, 1.28], [26.6, -2.6, 3.9, 'W'], [29.4, -1.4, 3.7, 'W'], [30.0, -1.4, 3.7], [31.0, -3.0, 1.45, 'W'], [33.2, -3.0, 1.45], [35.0, -5.7, .95, 'W'], [35.8, -5.7, .95], [36.9, -4.3, 1.2, 'W'], [43.6, -4.3, 1.2], [45.8, -4.3, 1.2], [49.2, -.7, 3.6, 'W'], [50.0, -.7, 3.6], [55.6, 2.6, .2, 'W'], [90, 2.6, .2]];
  const KR = [[0, DOOR[0] + .3, DOOR[1] + .1], [4.8, DOOR[0] + .3, DOOR[1] + .1], [10.2, 1.45, .12, 'W'], [15.9, 1.45, .12], [18.0, -4.9, 1.0, 'L'], [90, -4.9, 1.0]];
  const KR2 = [[43.4, DOOR[0] + .6, DOOR[1] + .6], [44.6, -4.7, 1.55, 'W'], [46.4, -4.7, 1.55], [49.4, -.3, 3.5, 'W'], [50.0, -.3, 3.5], [55.6, 2.3, .05, 'W'], [90, 2.3, .05]];
  const KL = [[0, DOOR[0] + .3, DOOR[1] + .1], [16.4, DOOR[0] + .3, DOOR[1] + .1], [19.2, -.75, 1.22, 'L'], [20.4, -.75, 1.22], [22.2, -4.0, 1.3, 'W'], [24.4, -4.0, 1.3], [90, -4.0, 1.3]];
  const KLN = [[0, -4.0, 1.3], [30.0, -4.0, 1.3], [30.9, -5.06, 1.1, 'W'], [31.3, -5.06, 1.1], [32.6, -3.7, 1.4, 'W'], [34.0, -3.7, 1.4], [36.0, -3.2, 1.5, 'W'], [90, -3.2, 1.5]];
  const KLEAH = [[0, DOOR[0] - .3, DOOR[1]], [30.5, DOOR[0] - .3, DOOR[1]], [31.4, DOOR[0] + .3, DOOR[1] + .05, 'W'], [32.6, -3.3, 1.4, 'W'], [33.4, -3.3, 1.4], [35.0, -5.35, 1.0, 'W'], [36.2, -5.35, 1.0], [36.8, DOOR[0] + .3, DOOR[1] + .05, 'W'], [90, DOOR[0] + .3, DOOR[1] + .05]];
  const KS = [[0, 2.6, -2.0], [90, 2.6, -2.0]], KS2 = [[0, 4.9, -1.9], [90, 4.9, -1.9]], KS3 = [[0, 3.9, 1.0], [90, 3.9, 1.0]];
  const KG1 = [[0, MAT[0] - .75, MAT[1] + .1], [90, MAT[0] - .75, MAT[1] + .1]], KG2 = [[0, MAT[0] + .75, MAT[1] - .05], [90, MAT[0] + .75, MAT[1] - .05]];
  const LZ = [DOOR[0] + .55, DOOR[1] + .05];                                                      // where Leah stands in the evening, at the doorway (29:31)
  const K1 = [LZ[0] + .45, LZ[1] + .68], K2 = [LZ[0] + .5, LZ[1] - .62], K3 = [LZ[0] + .3, LZ[1] + 1.3];

  function update(t, camera, sid) {
    const cam = camera && camera.position;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject by day's end, at the dawn, and again in the late light
    { const k0 = ON(t, -1, .5, 90, 91) * .5, k1 = ON(t, 24.4, 26.4, 28.6, 29.8) * .4, k2 = ON(t, 36.0, 37.4, 41, 43) * .7, k3 = ON(t, 49.5, 51, 90, 91) * .6, k = Math.max(k0, k1, k2, k3) * (1 - ON(t, 29.6, 31, 35, 36.2)), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    { const so = ON(t, 29.2, 31.0, 35.0, 36.8); stars.group.visible = so > .004; stars.update(t, so, .38, .6 + .0035 * t, cam || new THREE.Vector3()); }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)), [3, .5, 2.5]); dust.update(t, .5 * ON(t, 4.2, 5.6, 17, 18) + .4 * ON(t, 18.4, 19.4, 21, 22.4), [3.2, .2, -.4]);
    // ---- the well: the great stone lies on its mouth (29:2) until Jacob rolls it away (29:10); the water in the trough rises when he waters the flock (29:10)
    { const rl = smooth(12.2, 13.5, t), roll = ease.inOutSine(rl), x = lerp(GS0[0], GS1[0], roll), z = lerp(GS0[2], GS1[2], roll), y = lerp(GS0[1], GS1[1], roll) + .1 * Math.sin(Math.PI * rl);
      stoneM.position.set(x, y, z); stoneM.scale.set(.34, .22, .34); stoneM.rotation.set(-(z - GS0[2]) / .3, .4, 0);
      wring.userData.water.visible = true; bucket.position.set(lerp(.55, .0, smooth(13.4, 14.0, t) * (1 - smooth(14.2, 14.7, t))), lerp(0, .3, smooth(13.4, 14.0, t) * (1 - smooth(14.2, 14.7, t))) , lerp(-.28, .0, smooth(13.4, 14.0, t) * (1 - smooth(14.2, 14.7, t))));
      const tw = .3 + .7 * smooth(13.6, 14.8, t); trW.scale.set(1, tw, 1); trW.position.y = .02 + .06 * tw;
      const ps = ON(t, 14.0, 14.3, 14.6, 14.9); pour.visible = ps > .01; pour.position.set(WELL[0] + TR[0] + .3, hC(WELL[0], WELL[1]) + .22, WELL[1] + TR[1] - .1); pour.scale.set(1, .26, 1); pour.material.opacity = .8 * ps; }
    // ---- the sheep: three flocks by the well; Rachel's flock comes with her (29:9), gathers at the trough, and is watered (29:10)
    flocks.forEach((fl, j) => fl.forEach((s, i) => { s.group.rotation.y = s.home[2] + .14 * Math.sin(t * .5 + i + j * 2) + (t > 8 && t < 11.6 ? .2 * ON(t, 7.4, 8.4, 11, 11.6) : 0); }));
    { const pr = kp(t, KR), tt = smooth(10.2, 11.6, t); flockR.forEach((s, i) => { const bx = pr.x - .4 - i * .26, bz = pr.z + (i % 2 ? .24 : -.24) + .05 * Math.sin(i * 2.1), gx = WELL[0] + TR[0] + (i - 1.5) * .28, gz = WELL[1] + TR[1] + (i % 2 ? .45 : -.45), x = lerp(bx, gx, tt), z = lerp(bz, gz, tt);
        s.group.visible = t > 5.0 && t < 18.2; s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = lerp(headX(1, .05), headX(-.3, i % 2 ? -1 : 1), tt) + .1 * Math.sin(t * .6 + i) * tt; }); }
    // ---- the great stone's side of the story: dust as it rolls
    // ---- the doorway: lit through the wedding night and again at the evening of Leah's story; the yard torches burn through the night (29:22-23)
    { const nk = ON(t, 29.0, 30.4, 34.0, 35.8), dk = nk * (1 - smooth(33.8, 34.8, t)) + ON(t, 49.4, 50.4, 90, 91) * .8 + (smooth(34.8, 35.6, t) * (1 - smooth(37.0, 38.4, t))) * .2, fk = .94 + .06 * Math.sin(t * 2.3) * Math.sin(t * 3.7);
      const dl = 1 - .6 * smooth(40, 45, t); doorM.material.opacity = .85 * dk * fk * dl; winM.material.opacity = .8 * dk * fk * dl; doorG.material.opacity = .4 * dk * fk * dl; doorG2.material.opacity = .24 * dk * dl; doorL.intensity = 2.4 * dk * fk * dl;
      const tk = nk; torches.forEach((o, i) => { o.fm.visible = tk > .02; o.fm.scale.set(.9 + .15 * Math.sin(t * 9 + i), (.8 + .35 * Math.sin(t * 13 + i * 2.1)) * tk + .05, .9); o.gl.material.opacity = .55 * tk * fk; o.gl2.material.opacity = .45 * tk; o.gl.visible = o.gl2.visible = tk > .01; });
      torchL.intensity = 3.2 * tk * fk; mat.visible = t > 28.6 && t < 36.4; }
    // ---- the year-stones rise: the first seven while Jacob works for Rachel (29:20), the next seven in the second seven years (29:30)
    tally.forEach((o, k) => { const t0 = k < 7 ? 24.6 + k * .5 : 46.0 + (k - 7) * .42, u = smooth(t0, t0 + .5, t), h = o.m.userData.h; o.m.visible = u > .01; const sy = h * .95 * u + .001; o.m.position.y = o.y + sy * .8 - .02; o.m.scale.set(.15 * u, sy, .12 * u); o.gl.material.opacity = .55 * ON(t, t0, t0 + .2, t0 + .5, t0 + 1.8); o.gl.visible = o.gl.material.opacity > .003; o.gl.position.set(o.m.position.x, o.y + h * 1.5, o.m.position.z); o.gl.scale.setScalar(.8); });
    // ---- the people
    // Jacob: arrives from the east with his staff (29:1), waits by the shepherds, rolls the stone (29:10), waters the flock, greets Rachel (29:11); meets Laban on the road (29:13); stands in the yard (29:18); works; the wedding night (29:23); the morning (29:25); the second seven years
    { const p = kp(t, KJ), mv = p.mv; let ry, ex = {}, sp = 8.4;
      if (t < 12.2) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[4.6, headZ(-1, -.4)], [7.0, headZ(-1, -.4)], [8.6, headZ(-1, .35)], [10.0, headZ(-1, .35)], [11.0, headZ(-1, -.1)], [12.2, headZ(-.3, -1)]]); ex = GE(t, [[7.8, 8.4, 10.8, 11.5, { a0x: -.3, a0z: -.1 }]]); }
      else if (t < 13.4) { ry = mv ? headZ(p.vx, p.vz) : headZ(0, -1); const ps = ON(t, 12.4, 12.9, 13.1, 13.5); ex = { a0x: -1.25 * ps, a1x: -1.25 * ps, a0z: -.1, a1z: .1, lx: .25 * ps }; }
      else if (t < 15.2) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[13.4, headZ(-.3, -1)], [14.0, headZ(-1, -.2)], [14.6, headZ(-1, .1)]]); ex = GE(t, [[13.5, 14.0, 14.2, 14.6, { a1x: -.7, a0x: -.3 }]]); }
      else if (t < 17.0) { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, .06); const kiss = ON(t, 15.6, 15.95, 16.05, 16.4), cry = ON(t, 16.2, 16.6, 16.9, 17.2); ex = { lx: .2 * kiss + .12 * cry, a0x: -.5 * kiss - 1.7 * cry, a1x: -.5 * kiss - .2 * cry, a0z: -.1, a1z: .1 }; }
      else if (t < 19.9) { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, .02); const emb = ON(t, 19.3, 19.7, 20.0, 20.5); ex = { a0x: -1.2 * emb, a1x: -1.2 * emb, a0z: -.5 * emb, a1z: .5 * emb, lx: .06 * emb }; }
      else if (t < 25.2) { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, .03); ex = GE(t, [[22.6, 23.1, 23.6, 24.4, { a0x: -.9, a0z: -.3, a1x: -.1, lx: .05 }]]); }
      else if (t < 30.2) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[29.4, headZ(-1, -.2)], [30.2, headZ(-1, -.2)]]); if (!mv) ex = GE(t, [[28.4, 29.0, 29.8, 30.2, { a0x: -.4, a1x: -.4 }]]); }
      else if (t < 34.9) { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, .2); ex = GE(t, [[32.5, 33.0, 33.6, 34.0, { a0x: -1.0, a0z: -.2, lx: .05 }]]); if (!mv) ex = { ...ex, a1x: (ex.a1x || 0) - .2 }; }
      else if (t < 36.0) { ry = mv ? headZ(p.vx, p.vz) : headZ(1, .05); }
      else if (t < 44.4) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[36.9, headZ(1, .1)], [37.4, headZ(.8, 1)], [38.0, headZ(1, .35)], [43.0, headZ(1, .35)]]); ex = GE(t, [[37.4, 37.9, 38.2, 38.6, { a0x: -.5, a0z: -.1 }], [38.8, 39.3, 41.0, 41.6, { a0x: -1.9, a1x: -1.9, a0z: -.7, a1z: .7, lx: .06 }], [41.8, 42.2, 43.4, 44.0, { a1x: -.5, a0x: -.2 }]]); }
      else { ry = mv ? headZ(p.vx, p.vz) : (t < 49.4 ? hy(t, [[44.4, headZ(1, .05)], [45.0, headZ(1, .05)]]) : headZ(1, -.3)); ex = GE(t, [[44.6, 45.2, 45.6, 46.0, { a0x: -.8, a1x: -.5 }]]); }
      fig(jacob, p.x, p.z, ry, mv && !(t > 12.2 && t < 13.4), t, 6.2, { ...ex, s: 1 + .006 * Math.sin(t * 1.5) }, sp);
      jacob.group.visible = !(t > 35.0 && t < 35.8); state.jacob = [p.x, gAt(p.x, p.z), p.z];
      staff.visible = t < 29.4 || t > 44.4; }
    // Rachel: comes from the house with her father's flock (29:9), is greeted at the well (29:11), runs to tell her father (29:12), waits at the door; she is given to Jacob (29:28), walks out to him and they go together
    { const early = t < 24.6, p = early ? kp(t, KR) : kp(t, KR2), mv = p.mv, run = t > 16.0 && t < 18.1;
      rachel.group.visible = (t > 4.9 && early) || (t >= 43.4 && t < 58);
      const ry = mv ? headZ(p.vx, p.vz) : (t < 17.0 ? headZ(1, 0) : headZ(1, .15));
      const ex = early ? GE(t, [[15.0, 15.6, 16.0, 16.4, { a0x: -.2, a1x: -.2, lx: .02 }]]) : GE(t, [[44.4, 45.0, 46.2, 46.8, { a1x: -1.5, a0x: -.2 }]]);
      fig(rachel, p.x, p.z, ry, mv, t, 2.2, { ...ex, s: 1 + .006 * Math.sin(t * 1.6) }, run ? 12 : 8.4); }
    // Laban: runs out to meet Jacob (29:13), embraces and kisses him, brings him to the house; brings Leah (29:23); the morning and the answer (29:26); gives Rachel (29:28)
    { const p = t < 24.5 ? kp(t, KL) : kp(t, KLN); laban.group.visible = t > 16.5 && t < 56.2; let ry, ex = {}, sp = 8.4;
      if (t < 20.8) { ry = p.mv ? headZ(p.vx, p.vz) : headZ(1, -.02); const emb = ON(t, 19.3, 19.7, 20.0, 20.5); ex = { a0x: -1.25 * emb, a1x: -1.25 * emb, a0z: -.5 * emb, a1z: .5 * emb, lx: .06 * emb }; if (t < 19.1) sp = 12; }
      else if (t < 25) { ry = p.mv ? headZ(p.vx, p.vz) : headZ(1, -.03); ex = GE(t, [[22.8, 23.3, 23.8, 24.4, { a1x: -.9, a1z: .2, a0x: -.1 }]]); }
      else { ry = p.mv ? headZ(p.vx, p.vz) : hy(t, [[30.4, headZ(1, .1)], [34.0, headZ(1, .15)], [35.6, headZ(1, .15)], [37.6, headZ(-1, -.3)], [43.4, headZ(-1, -.3)], [44.4, headZ(-1, .1)]]);
        ex = GE(t, [[31.7, 32.2, 33.0, 33.6, { a1x: -1.3, a1z: .1, a0x: -.2 }], [41.2, 41.7, 43.0, 43.6, { a0x: -.9, a1x: -.9, a0z: -.5, a1z: .5, lx: .04 }], [44.4, 44.9, 46.0, 46.6, { a1x: -1.4, a0x: -.2 }]]); }
      fig(laban, p.x, p.z, ry, p.mv, t, 3.3, { ...ex, s: 1 + .007 * Math.sin(t * 1.7) }, sp); }
    // Leah: veiled at the wedding (29:23), unveiled in the morning (29:25), at her door in the evening light with her sons (29:31-35)
    { leah.group.visible = t > 30.5; veil.visible = t > 30.5 && t < 35.1;
      let X, Z, mv = false, ry, ex = {};
      if (t < 50.2) { const p = kp(t, KLEAH); X = p.x; Z = p.z; mv = p.mv; ry = mv ? headZ(p.vx, p.vz) : (t < 34.6 ? headZ(1, .05) : headZ(1, .02)); ex = t < 35.1 ? { a0x: -.3, a1x: -.3 } : GE(t, [[38.6, 39.4, 42.6, 43.4, { lx: .1, a0x: -.4, a1x: -.4 }]]); }
      else { X = LZ[0]; Z = LZ[1]; ry = hy(t, [[50.2, headZ(1, .1)], [52.0, headZ(1, .1)], [55.6, headZ(1, -.05)], [90, headZ(1, -.05)]]); ex = GE(t, [[52.0, 52.6, 55.0, 56.0, { a1x: -.5, a0x: -.4, a0z: -.2 }], [56.6, 57.4, 59.6, 60.4, { a0x: -1.0, a1x: -1.0, a0z: -.3, a1z: .3 }]]); }
      fig(leah, X, Z, ry, mv, t, 4.4, { ...ex, s: 1 + .006 * Math.sin(t * 1.4) }, 8.4); state.leah = [X, gAt(X, Z), Z];
      baby.visible = t > 56.0; baby.position.set(0, .56 + .08 * smooth(58.2, 59.4, t), .2); }
    // shepherds and guests
    { const sh = (f, K, ph, spec) => { const p = kp(t, K), tw = ON(t, 7.0, 7.8, 10.8, 11.8), ry = hy(t, [[0, face(p.x, p.z, WELL[0], WELL[1])], [6.6, face(p.x, p.z, WELL[0], WELL[1])], [7.6, face(p.x, p.z, -2, 1)], [11.0, face(p.x, p.z, -2, 1)], [12.2, face(p.x, p.z, WELL[0], WELL[1])]]);
        const ex = GE(t, [[7.4, 8.0, 9.4, 10.2, spec]]); fig(f, p.x, p.z, ry, false, t, ph, { ...ex, s: 1 + .006 * Math.sin(t * 1.3 + ph) }, 8); f.group.visible = t < 18.6; };
      sh(s1, KS, 1.1, { a1x: -1.55, a1z: .1, a0x: -.2 }); sh(s2, KS2, 2.3, { a0x: -1.4, a0z: -.1, a1x: -.1 }); sh(s3, KS3, 3.6, { a1x: -1.3, a0x: -.4, a1z: .3 });
      const gs = (f, K, ph, tgt) => { const p = kp(t, K); f.group.visible = t > 28.8 && t < 36.4; fig(f, p.x, p.z, face(p.x, p.z, tgt[0], tgt[1]), false, t, ph, GE(t, [[32.4, 33.0, 33.6, 34.4, { a0x: -.5, a1x: -.2 }]]), 8, .13 * smooth(28.8, 29.4, t)); };
      gs(gu1, KG1, 1.9, [MAT[0], MAT[1]]); gs(gu2, KG2, 3.1, [MAT[0], MAT[1]]); }
    // the three sons, one by one beside Leah (29:32-34)
    { [[k1, K1, 51.8, 'a'], [k2, K2, 52.9, 'b'], [k3, K3, 54.0, 'c']].forEach(([f, K, t0, id], i) => { const a = smooth(t0, t0 + .5, t); f.group.visible = t > t0 && t < 60.6; fig(f, K[0], K[1], face(K[0], K[1], LZ[0] + 1.4, LZ[1] + .2) + .4 * (i - 1) * 0 + 3.14159 * 0, false, t, 5 + i, { s: a * (1 + .01 * Math.sin(t * 1.9 + i)) + .001 }, 8); }); }
    // ---- the Lord saw (29:31, 29:35): a soft shaft of golden light on Leah at her door, never a figure
    { const lo = ON(t, 50.4, 52.0, 58.6, 60.4) * (.92 + .08 * Math.sin(t * 1.7)), lx = LZ[0] + .05, lz = LZ[1] + .05; leahS.position.set(lx, hC(lx, lz), lz); leahS.material.opacity = .26 * lo; leahS.visible = lo > .004;
      leahG.position.set(lx, hC(lx, lz) + .55, lz); leahG.material.opacity = .12 * lo; leahG.visible = lo > .004; leahP.position.set(lx, hC(lx, lz) + .03, lz); leahP.material.opacity = .18 * lo; leahP.visible = lo > .004; leahL.position.set(lx + .3, hC(lx, lz) + .9, lz + .3); leahL.intensity = .8 * lo; spark.update(t, lo * 1.3, [lx, hC(lx, lz), lz]); }
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#c4c0b4', '#8a7a64', 1.0, '#ffe0a8', 2.7, [8, 5.4, 6], .45, '#ffe0b0', [-8, 5, 6], 14), Dk(14, '#b8b0b8', '#7a6a58', .95, '#ffc478', 2.8, [8, 3.8, 5], .45, '#ffd8a0', [-8, 5, 6], 14),
    Dk(22, '#b0b4cc', '#7a6a58', .95, '#ffd098', 2.7, [8, 4.4, 6], .45, '#ffe0b0', [-8, 5, 6], 14), Dk(27.6, '#8a88b0', '#5a4a48', .85, '#ff9a58', 2.3, [8, 2.6, 4], .5, '#ffb888', [-8, 4, 6], 14),
    Dk(30.4, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(35.0, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(36.8, '#8a80a8', '#5a4a58', .9, '#ff9a68', 2.2, [10, 2.2, 4], .55, '#ffa878', [-8, 4, 6], 14), Dk(40.4, '#b0a8bc', '#7a6a58', 1.0, '#ffc888', 2.6, [10, 3.8, 4], .5, '#ffd8a0', [-8, 4, 6], 14),
    Dk(46, '#b4b0c4', '#7a6a58', 1.0, '#ffd8a0', 2.7, [8, 5, 6], .45, '#ffe0b0', [-8, 5, 6], 14), Dk(50.4, '#b0a8bc', '#7a6a58', 1.0, '#ffc070', 2.4, [9, 2.8, 5], .5, '#ffd8a0', [-8, 4, 6], 14),
    Dk(58, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.6, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], 14), Dk(62, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 3.2, -5], .45, '#ffcf9a', [-8, 4, 6], 14)];
  const bg = [[0, ['#5a86c4', '#f6dcb0']], [14, ['#4a5488', '#f0b878']], [22, ['#5a78b0', '#f2c890']], [27.6, ['#2a3a7a', '#f08a62']], [30.4, ['#141e4c', '#6a4a70']], [32, ['#050a1e', '#10204a']], [35, ['#050a1e', '#10204a']], [36.8, ['#38447a', '#f29a64']], [40.4, ['#5a78b0', '#f6d4a0']], [46, ['#5a86c4', '#f6dcb0']], [50.4, ['#4a5488', '#f0b878']], [58, ['#3a528c', '#f4c890']], [62, ['#4a6aa8', '#f6d8a8']]];
  return { group: g, update, light, bg, far, pl: [doorL, torchL, leahL], state, jacob, rachel, laban, leah };
}
