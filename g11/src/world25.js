// Episode 25: Genesis 25. Abraham dies at a good old age and his sons Isaac and Ishmael bury him in the cave of Machpelah, in the field Abraham bought from the Hittites, beside Sarah (25:7-10);
// Isaac prays to the Lord for his wife Rebekah, because she was barren, and the Lord grants his prayer (25:21); the children struggle together within her, and the Lord says to her "two nations are in your womb, ... the elder shall serve the younger" (25:22-23);
// the first comes out red, all his body like a hairy mantle, and is named Esau; afterwards his brother comes out, his hand holding Esau's heel, and is named Jacob (25:24-26); the boys grow: Esau a skilful hunter, a man of the field, Jacob a quiet man, living in tents;
// Isaac loves Esau, Rebekah loves Jacob (25:27-28); once when Jacob is cooking a stew Esau comes in from the field, famished, and says "let me eat some of that red stuff" (25:29-30); Jacob says "first sell me your birthright", Esau says "I am about to die, of what use is a birthright to me?" (25:31-32);
// Esau swears and sells his birthright; Jacob gives him bread and lentil stew; he eats and drinks, rises and goes his way; "thus Esau despised his birthright" (25:33-34).
// Cinematic interpretation: the floating land, the shape of the camp and the cave, the lamp, the mat and the two swaddled babies, the fire in its ring of stones, the pot and the bowl, the colour of the light, the prayer-light, the faces and the way the figures stand, kneel, walk, reach and bow are not in the text.
// The film leaves out Keturah and her sons (25:1-4), the gifts to the other sons (25:5-6), Abraham's age (25:7), God's blessing of Isaac (25:11), the sons of Ishmael and his death (25:12-18), the ages of Isaac (25:20, 26), Rebekah's words in 25:22 and the name Edom (25:30).
// The text does not say that Isaac and Rebekah's tent stood far from the cave, that Esau left the camp to the east, or that the hunt and the return took the same road; the film shows them so that the two places can be seen. Abraham's body is shown wrapped in linen; the chapter says only that he was buried.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, crowdPalette, makeSheep } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, meshOf } from './world10.js';

export const RIC = 15;
export const TS = [-3.2, 2.0], DOORP = [-2.85, 3.3];                                                   // Isaac and Rebekah's tent; where Rebekah stands at its door
export const MAT = [-3.2, 3.6], ISK = [-4.55, 3.85], LAMP = [-4.05, 3.65], RBK = [-3.95, 3.72];        // the mat before the door; where Isaac kneels; the lamp; where Rebekah kneels beside the babies
export const STI = [-2.5, 3.5], STR = [-3.6, 3.45], JT = [-5.0, 4.35];                                   // Isaac and Rebekah standing at the door; Jacob among the tents
export const FIRE = [-.7, 4.15], JF = [-1.45, 4.2], EF = [.15, 4.05];                                      // the cooking fire; where Jacob stands; where Esau stands
export const CAVE = [9.8, 1.0], CF = [9.0, 1.45], CR = headZ(CF[0] - CAVE[0], CF[1] - CAVE[1]);          // the cave of Machpelah and its apron; the cave turns its face this way
export const EV = { a1: .6, a2: 6.9, b1: 12.6, b2: 21.5, c1: 27.5, d1: 35.5, d2: 43.0, e1: 49.9 };
const cl = (lx, lz) => [CAVE[0] + lx * Math.cos(CR) + lz * Math.sin(CR), CAVE[1] - lx * Math.sin(CR) + lz * Math.cos(CR)];   // a point in the cave's own frame -> world
export const BIERP = cl(0, .78), ISC = cl(-.8, .86), ISM = cl(.8, .86);

// ---------------- terrain: green camp ground in the west, golden earth around the fire, the open field in the middle and the rocky rise with the cave in the east
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.4, .2, 1.7, 3.7], [3.5, -10, 1.1, 5], [13.5, -6.5, 1.2, 4.2], [12.6, 7.8, .8, 3.6]];
const FLATS = [[TS[0], TS[1] + 1.6, .32, 4.4], [FIRE[0], FIRE[1], .31, 2.6], [4.8, 1.8, .33, 3.0]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const PATH = [[-3.2, 3.9], [-1.9, 4.4], [-.7, 4.9], [1.2, 4.2], [3.6, 3.0], [6.2, 2.4], [8.4, 1.9]];
const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-6, 2, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .9);
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#cdb884'), .6 * smooth(4.6, 2.2, Math.hypot(x - FIRE[0] + 1.2, z - FIRE[1])));
  b.lerp(C3('#7e9a52'), .55 * smooth(4.8, 2.6, Math.hypot(x - TS[0], z - TS[1] - 1.6)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, TS, DOORP, MAT, ISK, LAMP, STI, STR, JT, FIRE, JF, EF, CAVE, CF, BIERP, ISC, ISM };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const NN = headZ(0, -1), SS = headZ(0, 1), EE = headZ(1, 0), WW = headZ(-1, 0);
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);

// ---------------- the people
const mkIsaac = R => person(R, { pants: '#7a5a3a', top: '#c9a15a', skin: '#c38a5c', hair: '#4a3a2c', beard: '#6a5a4c', sash: '#8a3a2a', seed: 630 }, .47);          // Isaac, older than in Genesis 24: a beard
const mkIshmael = R => person(R, { pants: '#5a4a38', top: '#6f8a62', skin: '#a8714a', hair: '#1f160d', beard: '#1f160d', sash: '#3a2a1a', seed: 730 }, .47);
const mkRebekah = R => person(R, { pants: '#5a7a9a', top: '#d8b86a', skin: '#c9905f', hair: '#3a2418', long: true, cloth: '#efe4cc', sash: '#a8483a', seed: 620 }, .44);   // the same Rebekah as in Genesis 24
const mkEsau = R => person(R, { pants: '#7a5030', top: '#9a6038', skin: '#c8704a', hair: '#8a3a18', beard: '#8a3a18', mantle: '#6a3a22', sash: '#3a2418', seed: 710 }, .48);   // red-brown and hairy (25:25), a hunter
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);              // quiet, smooth, in light linen (25:27)
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const bowlMesh = (R, stew) => { const b = new GB(R); b.add(G.cylT, '#a8602e', [0, 0, 0], [.13, .08, .13], [0, 0, 0], .01); b.add(G.cylT, '#8a4a22', [0, -.045, 0], [.09, .03, .09], [0, 0, 0], .01); if (stew) b.add(G.cylT, '#b52c14', [0, .042, 0], [.115, .012, .115], [0, 0, 0], .005); b.box('#d8b878', [.12, .03, .02], [.1, .02, .08], [0, .3, .1], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };

// ====================================================================== the world
export function makeCamp() {
  const R = rng(2525), g = new THREE.Group(), smoke = makeSmoke(2);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9821), RIC, hC, gcC, 30, 80), underRock(rng(9822), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  // the oaks around the camp in the west
  [[-7.4, 1.4, 2.5], [-9.0, 4.0, 2.0], [-6.8, -1.2, 1.8], [-4.8, -3.4, 1.7]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-10.6, -4.0, 2.0], [-8.4, -8.0, 2.2]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  // olives and round trees about the open field and along the rise
  [[4.6, -.4, .9], [5.6, 5.0, .85], [6.3, 5.8, .9], [3.0, -1.4, .8], [7.6, -1.2, .8]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[9.8, -2.4, 1.0], [12.4, -.8, 1.1], [11.8, 5.0, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  for (let i = 0; i < 20; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .15 || Math.hypot(x - TS[0], z - TS[1]) < 3.8 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 3.0 || dPath(x, z) < 1.2 || Math.hypot(x - CAVE[0], z - CAVE[1]) < 3.4) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 1.6 || Math.hypot(x - CAVE[0], z - CAVE[1]) < 2.2 || Math.hypot(x - TS[0], z - TS[1] - 1.2) < 2.8) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- the cave of Machpelah: a rocky face, a dark mouth, a lintel stone and a flat apron
  const cave = new THREE.Group(); cave.position.set(CAVE[0], hC(CAVE[0], CAVE[1]) - .06, CAVE[1]); cave.rotation.y = CR; ca.add(cave);
  { const b = new GB(rng(77)), rk = ['#9a8e7c', '#a99c86', '#85796a', '#b0a48e'];
    for (const [x, y, z, sx, sy, sz] of [[-.55, .32, -.05, .42, .5, .38], [.55, .3, -.05, .44, .46, .36], [-.3, .72, -.12, .5, .34, .4], [.3, .76, -.1, .5, .32, .4], [0, .98, -.14, .62, .28, .42], [-.95, .22, .1, .34, .3, .3], [.95, .2, .12, .34, .28, .3], [0, .45, -.45, .9, .8, .5]]) b.add(G.ico0, pk(rng(78 + Math.floor(x * 10)), rk), [x, y, z], [sx, sy, sz], [0, x, 0], .06);
    b.box('#b8ac96', [0, .64, .1], [.9, .13, .22], [0, 0, 0], .03); b.box('#8a7e6e', [0, .02, .32], [1.2, .05, .8], [0, 0, 0], .02);
    cave.add(meshOf(b)); const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), lamC(0x120a06)); mouth.scale.set(.36, .5, .3); mouth.position.set(0, .02, .05); mouth.castShadow = false; cave.add(mouth); }
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .13, 12).rotateX(Math.PI / 2), lamC(0xa89a82)); seal.castShadow = true; seal.visible = false; cave.add(seal);
  // ---- Abraham, wrapped in white linen on a woven mat before the cave (cinematic interpretation: the chapter says only that he was buried)
  const bier = new THREE.Group(); g.add(bier);
  { const b = new GB(rng(31)); b.box('#8a4a3c', [0, .012, 0], [.98, .02, .4], [0, 0, 0], .02); b.box('#c8a050', [0, .024, 0], [.92, .01, .07], [0, 0, 0], .01);
    b.box('#efe6d2', [0, .075, 0], [.76, .1, .19], [0, 0, 0], .02); b.add(G.ico1, '#efe6d2', [-.37, .085, 0], [.09, .07, .09], [0, 0, 0], .02); b.box('#e0d6bc', [.12, .13, 0], [.24, .02, .2], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; bier.add(m); }
  // ---- Isaac's camp: his tent, two more, sheep, and the lamp
  [[TS[0], TS[1], 0, '#cdb48c', 1.2], [-5.5, 2.9, .5, '#c2a67a', .85], [-4.4, .2, -.4, '#d4c29c', .75]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  const sheep = [[-5.9, 4.7], [-6.5, 3.8], [-6.9, 4.7]].map(([x, z], i) => { const s = makeSheep(rng(560 + i)); s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = i * 1.7; ca.add(s.group); return s; });
  const lampB = new THREE.Group(); lampB.position.set(LAMP[0], hC(LAMP[0], LAMP[1]), LAMP[1]); g.add(lampB);
  { const b = new GB(rng(33)); b.add(G.cylT, '#a8783a', [0, .06, 0], [.05, .12, .05], [0, 0, 0], .01); b.box('#3a2418', [0, .13, 0], [.07, .02, .07], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; lampB.add(m); }
  const lampG = spriteGlow(LAMP[0], hC(LAMP[0], LAMP[1]) + .2, LAMP[1], .95, 0xffa850, 0), lampG2 = spriteGlow(LAMP[0], hC(LAMP[0], LAMP[1]) + .19, LAMP[1], .4, 0xffe0a0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa860, 0, 6, 1.7), doorL = new THREE.PointLight(0xffc070, 0, 6, 1.6), fireL = new THREE.PointLight(0xff8a40, 0, 7, 1.6);
  // the tent glows from inside through the night (the doorway of the tent faces south)
  const doorH = hC(TS[0], TS[1] + 1.0), TSC = 1.2, TR = 1.2 * TSC, TH = 1.15 * TSC, zfd = y => TR * Math.SQRT1_2 * (1 - y / TH) + .03;
  const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.Float32BufferAttribute([-.3 * TSC * .94, .05, zfd(.05), .3 * TSC * .94, .05, zfd(.05), 0, .6 * TSC * .93, zfd(.6 * TSC * .93)].flat(), 3)); dgeo.setIndex([0, 1, 2]);
  const doorM = new THREE.Mesh(dgeo, new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  doorM.position.set(TS[0], doorH, TS[1]); g.add(doorM);
  const doorG = spriteGlow(TS[0], doorH + .36, TS[1] + 1.14, 2.2, 0xffc070, 0), doorG2 = spriteGlow(TS[0], doorH + .32, TS[1] + 1.1, .9, 0xfff0c8, 0); g.add(doorG, doorG2);
  // ---- the fire in a ring of stones, the pot of red lentil stew on it, and the steam
  const fy = hC(FIRE[0], FIRE[1]);
  { const b = new GB(R); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .3, fy + .04, FIRE[1] + Math.sin(a) * .3], [.08, .06, .08], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0] - .04, fy + .05, FIRE[1]], [.3, .05, .06], [0, .5, 0], .01); b.box('#4a3420', [FIRE[0] + .04, fy + .05, FIRE[1] + .02], [.3, .05, .06], [0, -.6, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  const flames = new THREE.Group(); flames.position.set(FIRE[0], fy + .06, FIRE[1]); g.add(flames);
  const flameMats = [0xff7a20, 0xffa030, 0xffd060].map(c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: .92 }));
  const flameM = [[0, 0, .1, .26, 0], [.08, .03, .07, .2, 1], [-.07, -.03, .06, .16, 2]].map(([x, z, r, h, k]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5).translate(0, h / 2, 0), flameMats[k]); m.position.set(x, 0, z); flames.add(m); return { m, h }; });
  const pot = new THREE.Group(); pot.position.set(FIRE[0], fy + .16, FIRE[1]); pot.scale.setScalar(.62); g.add(pot);
  { const b = new GB(rng(91)); b.add(G.ico1, '#8a4a32', [0, .08, 0], [.2, .17, .2], [0, 0, 0], .02); b.add(G.cylT, '#7a3e28', [0, .22, 0], [.15, .05, .15], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pot.add(m);
    const st = new THREE.Mesh(new THREE.CircleGeometry(.135, 14), new THREE.MeshLambertMaterial({ color: 0xb02a14, emissive: 0x501408 })); st.rotation.x = -Math.PI / 2; st.position.set(0, .245, 0); pot.add(st); }
  const fireG = spriteGlow(FIRE[0], fy + .22, FIRE[1], 1.3, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy + .2, FIRE[1], .5, 0xffe0a0, 0); g.add(fireG, fireG2);
  smoke.add(FIRE[0], fy + .5, FIRE[1], t => smooth(34.6, 36.0, t) * (1 - smooth(57.5, 59.5, t)), .2, 1.8);
  smoke.add(TS[0] + .2, hC(TS[0], TS[1]) + 1.5, TS[1] - .2, t => smooth(33, 36, t) * (1 - smooth(57, 60, t)) * .6, .16, 1.4); g.add(smoke.mesh);
  const SMK = [[0, '#a8a0a8'], [20, '#d8c6b0'], [35, '#e0cdb8'], [50, '#a89098'], [90, '#8a8090']];
  // ---- the twins: two swaddled babies on a woven mat before the tent door (25:24-26): the first red and hairy, the second with his hand on his brother's heel
  const babes = new THREE.Group(); babes.position.set(MAT[0], hC(MAT[0], MAT[1]) + .005, MAT[1]); g.add(babes);
  { const b = new GB(rng(35)); b.box('#8a4a3c', [0, .012, 0], [.66, .02, .36], [0, 0, 0], .02); b.box('#c8a050', [0, .024, 0], [.6, .01, .05], [0, 0, 0], .01);
    b.add(G.ico1, '#b8472e', [-.07, .065, 0], [.1, .05, .062], [0, 0, 0], .02); b.add(G.ico1, '#c8583a', [-.155, .08, 0], [.048, .048, .048], [0, 0, 0], .02); b.add(G.ico0, '#8a3a1a', [-.16, .1, 0], [.05, .026, .05], [0, 0, 0], .02); b.add(G.ico0, '#c8583a', [.045, .066, 0], [.022, .02, .02], [0, 0, 0], .01);
    b.add(G.ico1, '#efe4cc', [.2, .06, .01], [.095, .048, .062], [0, 0, 0], .02); b.add(G.ico1, '#d9a073', [.115, .075, .01], [.045, .045, .045], [0, 0, 0], .02); b.add(G.ico0, '#2e1d10', [.115, .097, .01], [.04, .018, .04], [0, 0, 0], .02); b.box('#d9a073', [.078, .071, .008], [.05, .018, .018], [0, 0, 0], .005);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; babes.add(m); }
  // ---- the bowl of stew and the bread that Jacob gives (25:34): it is carried by Jacob, then by Esau
  const bowlJ = bowlMesh(rng(95), true), bowlE = bowlMesh(rng(96), true); bowlJ.visible = bowlE.visible = false;
  // ---- the people
  const isaacC = mkIsaac(rng(83)), ishmael = mkIshmael(rng(84)), isaac = mkIsaac(rng(83)), rebekah = mkRebekah(rng(85)), esau = mkEsau(rng(86)), jacob = mkJacob(rng(87));
  [isaacC, ishmael, isaac, rebekah, esau, jacob].forEach(o => g.add(o.group));
  jacob.arms[1].add(bowlJ); bowlJ.position.set(0, -.44, .06); esau.arms[1].add(bowlE); bowlE.position.set(0, -.44, .06);
  // Esau's bow and quiver
  const bow = new THREE.Group(); { const b = new GB(rng(97)); for (let k = 0; k < 7; k++) { const u = k / 6 * 2 - 1, y = u * .36, x = -.06 * (1 - u * u); b.box('#5a3a20', [x, .5 + y, 0], [.025, .13, .025], [0, 0, -u * .5], .005); } b.box('#e8dcc0', [.04, .5, 0], [.008, .74, .008], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bow.add(m); }
  bow.position.set(-.26, .02, .04); esau.group.add(bow);
  { const b = new GB(rng(98)); b.box('#6a4a2a', [0, .78, -.14], [.09, .4, .09], [.1, 0, .25], .01); for (const k of [-1, 0, 1]) b.box('#d8c8a8', [k * .015 + .05, 1.0, -.15], [.012, .16, .012], [.1, 0, .25], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; esau.group.add(m); }
  const prayer = shaft(7, .22, .62, [1, .86, .5], .9, .12); g.add(prayer);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .03, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const starA = spriteGlow(0, 0, 0, 7, 0xffe8b0, 0), starB = spriteGlow(0, 0, 0, 2.2, 0xffffff, 0); g.add(starA, starB);
  const CLOUD = [[0, '#c0a0a8'], [6.4, '#d8b4a8'], [9, '#58588a'], [20, '#38385a'], [22.5, '#e0c4b4'], [29, '#fbf0dc'], [35, '#f6e4c4'], [43, '#e8b088'], [50, '#e8a888'], [57, '#6a5a78'], [90, '#38385a']];
  const CEM = [[0, '#4a3a44'], [6.4, '#5a4448'], [9, '#2a2a48'], [20, '#1e2038'], [22.5, '#5a4a48'], [29, '#6a5c4c'], [35, '#6a5c4c'], [43, '#5a443c'], [50, '#5a4040'], [57, '#2a2a48'], [90, '#1e2038']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = { esau: [EF[0], 0, EF[1]], jacob: [JF[0], 0, JF[1]] };
  const SIT = .8;

  // Esau: out of the camp to hunt (25:27), far to the east, then back, famished, to the fire (25:29), the oath (25:33), eats, and walks away into the dusk (25:34)
  const KE = [[26.8, -2.2, 3.95], [27.0, -2.2, 3.95], [30.8, 3.4, 3.2, 'W'], [33.4, 8.0, 1.4, 'W'], [35.2, 8.0, 1.4], [40.0, EF[0] + .15, EF[1] + .05, 'W'], [56.6, EF[0] + .15, EF[1] + .05], [59.4, 3.2, 3.1, 'W'], [64, 7.6, 1.2, 'W']];
  // Jacob: among the tents (25:27), to the fire where he cooks (25:29), stays by the fire
  const KJ = [[26.8, JT[0], JT[1]], [33.6, JT[0], JT[1]], [35.4, JF[0], JF[1], 'W'], [90, JF[0], JF[1]]];

  function update(t, camera) {
    const cam = camera && camera.position;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; } o.m.visible = !hide; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject: the evening at the cave, the dawn of the twins, the afternoon and the sunset of the stew; stars through the night and again after sunset
    { const k0 = ON(t, -1, .5, 6.0, 8.5) * .8, k1 = ON(t, 21, 23, 28, 31) * .55, k2 = ON(t, 35, 37, 41, 43) * .6, k3 = ON(t, 42.6, 44.5, 57, 60) * .95, cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); starA.position.set(cx + v3.x / hl * 150 + v3.z / hl * 14, cy + 34, cz + v3.z / hl * 150 - v3.x / hl * 14); }
      sunS2.position.copy(sunS.position); starB.position.copy(starA.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(k0, k1, k2, k3); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01;
      const st = Math.max(ON(t, 7, 9.5, 19.5, 21.8), ON(t, 55, 58, 90, 91)) * (.9 + .1 * Math.sin(t * 3.1)); starA.material.opacity = .62 * st; starB.material.opacity = .95 * st; starA.visible = starB.visible = st > .01; }
    // light: the lamp by Isaac burns from dusk to dawn; the tent glows through the night; the cooking fire is lit before Esau comes in and burns to the end
    { const fl = .86 + .14 * Math.sin(t * 9.1) * Math.sin(t * 5.3), kl = smooth(5.6, 7.4, t) * (1 - smooth(22.0, 24.0, t)), kd = smooth(6.0, 8.0, t) * (1 - .55 * smooth(22.0, 24.5, t)) * (1 - smooth(26.5, 28.5, t)), kf = smooth(33.0, 35.0, t) * (1 - smooth(60.0, 62.0, t)), ff = .9 + .1 * Math.sin(t * 11.3) * Math.sin(t * 7.1);
      lampG.material.opacity = .62 * kl * fl; lampG2.material.opacity = .5 * kl; lampG.visible = lampG2.visible = kl > .01; lampL.position.set(LAMP[0], hC(LAMP[0], LAMP[1]) + .5, LAMP[1] + .2); lampL.intensity = 4.0 * kl * fl;
      doorM.material.opacity = .55 * kd * (.94 + .06 * Math.sin(t * 2.3)); doorG.material.opacity = .34 * kd * (.94 + .06 * Math.sin(t * 2.3)); doorG2.material.opacity = .26 * kd; doorL.position.set(TS[0], doorH + .8, TS[1] + 1.9); doorL.intensity = 3.0 * kd;
      fireG.material.opacity = .62 * kf * ff; fireG2.material.opacity = .5 * kf; fireG.visible = fireG2.visible = kf > .01; fireL.position.set(FIRE[0], fy + .6, FIRE[1] + .3); fireL.intensity = 4.6 * kf * ff;
      flames.visible = kf > .02; flameM.forEach((f, i) => { const s = (.8 + .35 * Math.sin(t * 13 + i * 2.1) * Math.sin(t * 8.3 + i)) * kf; f.m.scale.set(.9 + .15 * Math.sin(t * 9 + i), Math.max(.05, s), .9 + .15 * Math.cos(t * 10 + i)); }); }
    smoke.update(t, colAt(SMK, t)); motes.update(t, .5 * (.4 + .6 * ON(t, 26, 30, 80, 88)), [3, .5, 2.5]);
    sheep.forEach((s, i) => { s.group.rotation.y = i * 1.7 + .12 * Math.sin(t * .4 + i); });
    // the prayer light: on Isaac as the Lord answers (25:21) and on Rebekah as the Lord speaks to her (25:23): a slow shaft of gold, only a suggestion
    { const pI = ON(t, 10.0, 11.4, 12.0, 12.8) * .42, pR = ON(t, 16.4, 17.6, 20.4, 21.8) * .42, onI = t < 12.9; prayer.position.set(onI ? ISK[0] : MAT[0], hC(MAT[0], MAT[1]), onI ? ISK[1] : MAT[1]); prayer.material.opacity = onI ? pI : pR; prayer.visible = prayer.material.opacity > .004; }

    // ---- Machpelah: the bier, the stone and the two brothers (25:9)
    { const mv = smooth(2.9, 4.3, t), vis = t < 4.55; bier.visible = vis && t < 6.9; const [bx, bz] = cl(0, lerp(.78, .36, mv)); bier.position.set(bx, hC(bx, bz) - .005, bz); bier.rotation.y = CR + Math.PI / 2;
      const sl = smooth(4.5, 5.8, t); seal.visible = sl > .01; seal.position.set(lerp(.9, 0, ease.outCubic(sl)), .28, .34); seal.rotation.z = (1 - sl) * 1.6;
      const show = t < 7.0; isaacC.group.visible = ishmael.group.visible = show;
      if (show) { const bow_ = GE(t, [[.8, 1.6, 3.0, 3.8, { lx: .2 }], [6.0, 6.5, 7.0, 7.1, { lx: .16 }]]), push = ON(t, 4.1, 4.5, 5.5, 6.0), nx = cl(0, .3), pose_ = { ...bow_ };
        fig(isaacC, ISC[0] + .0, ISC[1], hy(t, [[0, headZ(Math.cos(CR), -Math.sin(CR))], [3.9, headZ(Math.cos(CR), -Math.sin(CR))], [4.4, face(ISC[0], ISC[1], nx[0], nx[1])], [90, face(ISC[0], ISC[1], nx[0], nx[1])]]), false, t, 1.1, { ...pose_, a0x: -1.05 * push, a1x: -1.05 * push, s: 1 + .008 * Math.sin(t * 1.7) }, 9);
        fig(ishmael, ISM[0], ISM[1], hy(t, [[0, headZ(-Math.cos(CR), Math.sin(CR))], [3.9, headZ(-Math.cos(CR), Math.sin(CR))], [4.4, face(ISM[0], ISM[1], nx[0], nx[1])], [90, face(ISM[0], ISM[1], nx[0], nx[1])]]), false, t, 2.3, { ...pose_, a0x: -1.05 * push, a1x: -1.05 * push, s: 1 + .008 * Math.sin(t * 1.9 + 1) }, 9); } }

    // ---- Isaac at the tent: he kneels and prays (25:21); later he stands at the door (25:28)
    { const show = (t > 6.0 && t < 12.9) || t > 26.9; isaac.group.visible = show;
      if (show) { if (t < 20) { const kn = smooth(6.4, 7.4, t), s = 1 - (1 - SIT) * kn, ex = GE(t, [[7.6, 8.4, 11.2, 12.2, { a0x: -2.3, a1x: -2.3, a0z: -.2, a1z: .2, lx: -.12 }]]); fig(isaac, ISK[0], ISK[1], headZ(.5, 1), false, t, 5.1, { ...ex, s: s * (1 + .008 * Math.sin(t * 1.6)) }, 9); }
        else { const ry = hy(t, [[26.9, EE], [32.0, headZ(.7, .6)], [90, headZ(.5, .9)]]); fig(isaac, STI[0], STI[1], ry, false, t, 5.1, { s: 1 + .008 * Math.sin(t * 1.6), ...GE(t, [[28.0, 28.8, 31.0, 31.8, { lx: -.05, a0x: -.3, a1x: -.3 }], [33.2, 33.9, 34.8, 35.5, { a0x: -.6, a1x: -.6, lx: .05 }]]) }, 9); } } }

    // ---- Rebekah: at the door (25:21), on the mat with the children struggling within her (25:22-23), beside the babies (25:24-26), at the door (25:28)
    { let x, z, ry, ex = {}, s = 1, belly = false;
      if (t < 12.7) { x = DOORP[0]; z = DOORP[1]; ry = face(x, z, ISK[0], ISK[1]); ex = GE(t, [[6.8, 7.6, 11.5, 12.4, { a0x: -.6, a1x: -.6, a0z: -.35, a1z: .35, lx: .06 }]]); }
      else if (t < 21.3) { x = MAT[0] + .1; z = MAT[1] - .1; ry = headZ(.1, 1); s = SIT; belly = true; ex = { a0x: -.85, a1x: -.85, a0z: -.38, a1z: .38, lx: .04 * Math.sin(t * 2.2) * (.4 + .6 * smooth(13, 15, t)) }; }
      else if (t < 26.9) { x = RBK[0]; z = RBK[1]; ry = face(x, z, MAT[0], MAT[1]); s = SIT; ex = { lx: .22 * smooth(21.3, 22.4, t), a0x: -.45, a1x: -.45, a0z: -.2, a1z: .2 }; }
      else { x = STR[0]; z = STR[1]; ry = hy(t, [[26.9, headZ(.2, 1)], [31.6, headZ(-.9, .55)], [90, headZ(-.9, .55)]]); ex = GE(t, [[31.8, 32.6, 34.6, 35.4, { a0x: -.5, a1x: -.5, lx: .05 }]]); }
      fig(rebekah, x, z, ry, false, t, 4.1, { ...ex, s: s * (1 + .007 * Math.sin(t * 1.5)) }, 8.5); rebekah.belly && (rebekah.belly.visible = belly); }

    // ---- the twins on their mat: from the birth to the day they are grown
    { const on = t > 21.0 && t < 26.9; babes.visible = on; }

    // ---- Esau: from the hunt to the oath and the walk away
    { const show = t > 26.85; esau.group.visible = show; bow.visible = t < 41; if (show) { const p = kp(t, KE), mv = p.mv, at = t > 39.8 && t < 56.7;
        const tired = ON(t, 35.2, 36.0, 41.0, 42.0), ry = mv ? headZ(p.vx, p.vz) : hy(t, [[40, headZ(-1, -.05)], [56.8, headZ(-1, -.05)], [90, headZ(1, -.2)]]);
        let ex = !mv ? GE(t, [[41.0, 41.6, 42.2, 43.0, { a0x: -.8, a1x: -.1, a0z: -.5, lx: .1 }], [43.8, 44.4, 45.4, 46.0, { a0x: -.2, a1x: -1.2, a1z: -.7, lx: .06 }], [46.6, 47.2, 48.8, 49.6, { a0x: -.4, a1x: -.4, a0z: -.7, a1z: .7, lx: -.08 }], [50.2, 50.7, 51.6, 52.2, { a1x: -2.7, a1z: .15, lx: -.1 }], [53.4, 54.2, 55.0, 55.6, { a1x: -1.9, a1z: -.35, lx: .12 }]]) : {};
        if (mv && t > 35 && t < 40.5) ex = { ...ex, lx: .22 * tired, a0x: .12 * Math.sin(t * 5.6), a1x: -.12 * Math.sin(t * 5.6) };
        fig(esau, p.x, p.z, ry, mv && !(t > 35 && t < 40.5), t, 3.3, { ...ex, s: 1 + .008 * Math.sin(t * 1.7) - .05 * tired }, 8.4); if (mv && t > 35 && t < 40.5) pose(esau, p.x, gAt(p.x, p.z) - .02 + Math.abs(Math.sin(t * 5.6)) * .01, p.z, ry, { ...ex, s: 1 - .05 * tired }); state.esau = [p.x, gAt(p.x, p.z), p.z]; } }

    // ---- Jacob: sitting among the tents, then at the fire stirring the pot, and giving the bowl
    { const show = t > 26.85; jacob.group.visible = show; if (show) { const p = kp(t, KJ), mv = p.mv, sit = (1 - smooth(33.2, 34.0, t)) * .2 + (smooth(36.0, 36.8, t) * (1 - smooth(52.0, 52.8, t))) * .16;
        const ry = mv ? headZ(p.vx, p.vz) : hy(t, [[26.9, headZ(.6, 1)], [33.6, headZ(.6, 1)], [35.4, EE], [42.5, EE], [43.2, face(JF[0], JF[1], EF[0], EF[1])], [90, face(JF[0], JF[1], EF[0], EF[1])]]);
        const ex = !mv ? GE(t, [[28.0, 28.8, 29.6, 30.4, { a0x: -.5, a1x: -.5, lx: .12 }], [36.4, 37.0, 40.0, 40.8, { a0x: -.9, a1x: -.1, a0z: -.1, lx: .14 }], [43.6, 44.2, 45.4, 46.0, { a0x: -.2, a1x: -1.1, a1z: -.25 }], [49.8, 50.4, 52.0, 52.6, { a0x: -.6, a1x: -.6, lx: .04 }], [52.0, 52.5, 53.4, 54.0, { a1x: -1.35, a1z: .05, lx: .08 }]]) : {};
        fig(jacob, p.x, p.z, ry, mv, t, 6.2, { ...ex, s: (1 - sit) * (1 + .008 * Math.sin(t * 1.5)) }, 8.0); state.jacob = [p.x, gAt(p.x, p.z), p.z];
        // Jacob holds out the bowl (25:34); Esau takes it, eats, and the bowl is left by the fire as he goes
        const give = ON(t, 51.7, 52.6, 53.4, 53.9); bowlJ.visible = t > 51.7 && t < 53.9 && give > .02; bowlE.visible = t > 53.3 && t < 56.4; } }
    // the stew in the pot goes down a little as Esau is served
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#8a8cc0', '#4a4048', .9, '#ffb070', 2.3, [-10, 3.2, 5], .5, '#ffc890', [8, 4, 6], 14), Dk(6.0, '#8a8cc0', '#4a4048', .9, '#ffb878', 2.2, [-10, 3.4, 5], .5, '#ffc890', [8, 4, 6], 14),
    Dk(8.6, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(12, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(20.5, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(23, '#a0a8d0', '#6a5a50', .95, '#ffc890', 2.4, [-9, 4.2, 6], .5, '#ffcf9a', [8, 4, 6], 14),
    Dk(28, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [5, 9, 8], .4, '#ffe8c8', [-8, 5, 6], 14), Dk(35, '#b0b8d4', '#7a6a58', 1.0, '#ffe0b0', 2.6, [8, 6, 8], .45, '#ffe0b0', [-8, 4, 6], 14),
    Dk(39, '#9aa8d0', '#645448', .95, '#ffd09a', 2.3, [9, 4.4, 7], .5, '#ffcf9a', [-8, 5, 6], 14), Dk(44, '#8a8cc0', '#4a4048', .9, '#ff9a58', 2.4, [-10, 2.6, 4], .55, '#ffb070', [8, 3, 6], 14),
    Dk(51, '#7a78b0', '#3a3040', .85, '#ff8a50', 2.1, [-10, 2.2, 4], .55, '#ff9a60', [8, 3, 6], 14), Dk(57, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(60, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14)];
  const bg = [[0, ['#2a3a7a', '#f0a870']], [6.0, ['#2a3a7a', '#f0a870']], [8.6, ['#10204a', '#5a4a70']], [12, ['#0a1230', '#2a2a50']], [20.5, ['#0a1230', '#2a2a50']], [23, ['#4a68a8', '#f4c890']], [28, ['#5a88c4', '#f6dcb0']], [35, ['#5a88c4', '#f6dcb0']], [39, ['#5a7ab8', '#f4d4a8']], [44, ['#38447a', '#f29a64']], [51, ['#34406e', '#f09a68']], [57, ['#10204a', '#5a4a70']], [60, ['#0a1230', '#2a2a50']]];
  // Rebekah's belly (visible while the children struggle within her): a rounded shape on the front of her figure
  { const m = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), lamC('#d8b86a')); m.scale.set(1, 1.05, .85); m.position.set(0, .5, .13); m.castShadow = true; rebekah.group.add(m); rebekah.belly = m; m.visible = false; }
  return { group: g, update, light, bg, far, esau, jacob, pl: [lampL, doorL, fireL], state };
}
