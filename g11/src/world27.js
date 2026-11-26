// Episode 27: Genesis 27. Isaac, old and almost blind, tells Esau to take his weapons, hunt game and make him the savoury food he loves, so that he may bless him before he dies (27:1-4);
// Rebekah overhears and tells Jacob to fetch two kids from the flock so that she can make the dish for his father (27:5-10); Jacob fears a curse instead of a blessing and Rebekah says "let your curse be on me, my son" (27:11-13);
// she takes Esau's best clothes and puts them on Jacob, and covers his hands and the smooth part of his neck with the skins of the kids (27:15-16); Jacob goes in with the dish and says "I am Esau"; Isaac says "the voice is Jacob's voice, but the hands are the hands of Esau", and blesses him (27:18-23);
// Isaac's blessing: "may God give you of the dew of heaven and of the fatness of the earth ... let peoples serve you" (27:28-29); Jacob has hardly left when Esau comes in from the hunt; Isaac trembles violently; Esau cries out with a great and bitter cry: "bless me, even me also, O my father" (27:30-34);
// the blessing is given; Esau hates Jacob and plans to kill him (27:41); Rebekah tells Jacob to flee to her brother Laban (27:42-45).
// Cinematic interpretation: the floating land, the shape of the camp, the cut-away tent, the rug, the couch, the lamp, the table, the curtain, the pot on the fire, the bundle, the colour of the light, the stars, the faces and the way the figures stand, kneel, walk, reach, tremble and bow are not in the text.
// The film leaves out Jacob's claim that the Lord gave him success (27:20), the kiss and the smell of the clothes (27:26-27), the full words of the blessing (27:28-29), Esau's lesser blessing (27:39-40) and Rebekah's words about the Hittite women (27:46).
// The text does not say that Isaac sat in a lit tent in the evening, that Rebekah stood at a curtain, that Esau returned at dusk or that Jacob left at night; the film shows them so that each place can be seen. No violence is shown.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeQuad } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, meshOf } from './world10.js';

export const RIC = 15;
export const TS = [-3.2, 2.0], FIRE = [-.7, 4.15];                                                   // the centre of Isaac's tent; the cooking fire
const RS = .55, RW = (rx, rz) => [TS[0] + RS * rx, TS[1] + RS * rz];                                   // the room is modelled in its own units and scaled by RS to the size of the people
export const ISK = RW(-.62, -.45), LAMP = RW(1.1, -.58), TAB = RW(.9, .3), VS = RW(.32, -.25), ES = RW(.15, .5);   // Isaac's couch; the lamp; the low table; where a visitor stands beside Isaac; where Esau kneels
export const RL = RW(-1.95, .05), RY = [-4.05, 3.95], JY = [-4.8, 4.05], SPEN = [-6.5, 4.5];         // Rebekah at the curtain; the yard in front of the tents; the goat pen
export const EV = { a1: .6, b1: 9.28, b2: 16.78, b3: 22.97, c1: 28.97, c2: 38.11, d1: 44.93, d2: 53.47 };

// ---------------- terrain: green camp ground in the west, golden earth in the east, the rocky rise in the far east where the road leaves
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.4, .2, 1.7, 3.7], [3.5, -10, 1.1, 5], [13.5, -6.5, 1.2, 4.2], [12.6, 7.8, .8, 3.6]];
const FLATS = [[TS[0], TS[1] + .4, .32, 4.0], [FIRE[0], FIRE[1], .31, 2.6], [-4.6, 4.1, .32, 2.6], [4.8, 1.8, .33, 3.0]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const PATH = [[-3.2, 3.5], [-1.9, 4.4], [-.7, 4.9], [1.2, 4.3], [3.6, 3.0], [6.2, 2.4], [8.4, 1.9]];
const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-6, 2, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .9);
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#cdb884'), .6 * smooth(4.6, 2.2, Math.hypot(x - FIRE[0] + 1.2, z - FIRE[1])));
  b.lerp(C3('#7e9a52'), .55 * smooth(5.2, 2.8, Math.hypot(x - TS[0], z - TS[1] - 1.2)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, TS, FIRE, ISK, LAMP, TAB, VS, ES, RL, RY, JY, SPEN };

// ---------------- walkers: keys [[t, x, z, ease?], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);
const fIV = face(ISK[0], ISK[1], VS[0], VS[1]), fVI = face(VS[0], VS[1], ISK[0], ISK[1]), fIE = face(ISK[0], ISK[1], ES[0], ES[1]), fEI = face(ES[0], ES[1], ISK[0], ISK[1]);

// ---------------- the people
const mkIsaac = R => person(R, { pants: '#7a5a3a', top: '#c9a15a', skin: '#c38a5c', hair: '#aaa498', beard: '#bdb7ac', sash: '#8a3a2a', seed: 630 }, .47);            // the same Isaac as in Genesis 24-26, old now: grey hair and beard
const mkRebekah = R => person(R, { pants: '#5a7a9a', top: '#d8b86a', skin: '#c9905f', hair: '#3a2418', long: true, cloth: '#efe4cc', sash: '#a8483a', seed: 620 }, .44);   // the same Rebekah
const mkEsau = R => person(R, { pants: '#7a5030', top: '#9a6038', skin: '#c8704a', hair: '#8a3a18', beard: '#8a3a18', mantle: '#6a3a22', sash: '#3a2418', seed: 710 }, .48);   // red-brown and hairy, a hunter
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);              // quiet, smooth, in light linen
const mkJacobE = R => person(R, { pants: '#7a5030', top: '#9a6038', skin: '#d9a073', hair: '#2e1d10', mantle: '#6a3a22', sash: '#3a2418', seed: 721 }, .45);             // Jacob in Esau's best clothes (27:15)
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const bowlMesh = (R, stew) => { const b = new GB(R); b.add(G.cylT, '#a8602e', [0, 0, 0], [.13, .08, .13], [0, 0, 0], .01); b.add(G.cylT, '#8a4a22', [0, -.045, 0], [.09, .03, .09], [0, 0, 0], .01); if (stew) b.add(G.cylT, '#b52c14', [0, .042, 0], [.115, .012, .115], [0, 0, 0], .005); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
const mkGoat = rn => makeQuad({ rn, len: .44, h: .23, w: .19, legL: .19, legW: .04, col: '#7a5a40', col2: '#5a4030', neck: [.12, .9, .08], head: [.15, .1, .09], ears: true, horns: false, legCol: '#2a1e18' });

// ====================================================================== the world
export function makeCamp() {
  const R = rng(2727), g = new THREE.Group(), smoke = makeSmoke(2);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9841), RIC, hC, gcC, 30, 80), underRock(rng(9842), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  [[-7.6, 1.0, 2.5], [-9.0, 4.0, 2.0], [-6.8, -1.6, 1.8], [-4.8, -3.6, 1.7]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-10.6, -4.0, 2.0], [-8.4, -8.0, 2.2]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[4.6, -.4, .9], [5.6, 5.4, .85], [6.5, 6.0, .9], [3.0, -1.4, .8], [7.6, -1.2, .8]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[9.8, -2.4, 1.0], [12.4, -.8, 1.1], [11.8, 5.0, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.hypot(x - TS[0], z - TS[1]) < 3.4 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 3.0 || dPath(x, z) < 1.2 || Math.hypot(x - SPEN[0], z - SPEN[1]) < 2.4;
  for (let i = 0; i < 20; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- two more tents behind the camp
  { const rr = rng(9); const mk = (x, z, ry, c, s) => { const grp = new THREE.Group(); const b = new GB(rr); b.add(G.cone7, c, [0, .5 * s, 0], [.9 * s, 1.0 * s, .9 * s], [0, 0, 0], .05); b.box('#6b4a2c', [0, 1.05 * s, 0], [.04, .3, .04], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; grp.add(m); grp.position.set(x, hC(x, z), z); grp.rotation.y = ry; ca.add(grp); };
    mk(-6.4, 2.4, .5, '#c2a67a', .95); mk(-5.9, -.2, -.4, '#d4c29c', .85); }
  // ---- Isaac's tent, cut away: a rug, a couch, a low table with a lamp beside it, the back wall, the right wall, a curtain on the left, two posts and a valance. The front is open to the camera.
  const room = new THREE.Group(); room.position.set(TS[0], hC(TS[0], TS[1]), TS[1]); room.scale.setScalar(RS); ca.add(room);
  { const b = new GB(rng(71));
    b.box('#8a4a3c', [0, .02, .15], [2.9, .03, 2.1], [0, 0, 0], .02); b.box('#c8a050', [0, .04, .15], [2.7, .01, .12], [0, 0, 0], .01); b.box('#c8a050', [0, .04, -.45], [2.7, .01, .07], [0, 0, 0], .01); b.box('#c8a050', [0, .04, .75], [2.7, .01, .07], [0, 0, 0], .01);
    b.box('#cdb48c', [0, .78, -1.1], [3.4, 1.56, .08], [0, 0, 0], .03); b.box('#b89c70', [0, .5, -1.05], [3.3, .06, .06], [0, 0, 0], .01); b.box('#b89c70', [0, 1.1, -1.05], [3.3, .06, .06], [0, 0, 0], .01);
    for (const s of [-1, 1]) b.box('#6b4a2c', [1.66 * s, .78, 1.08], [.07, 1.56, .07], [0, 0, 0], .02);
    b.box('#6b4a2c', [0, 1.57, 1.08], [3.4, .07, .07], [0, 0, 0], .02); b.box('#b8956a', [0, 1.45, 1.1], [3.2, .22, .03], [0, 0, 0], .03); b.box('#6b4a2c', [0, 1.57, -1.08], [3.4, .07, .07], [0, 0, 0], .02);
    b.box('#8a5a3a', [-.55, .13, -.5], [1.3, .18, .85], [0, 0, 0], .03); b.box('#a8483a', [-.55, .26, -.52], [1.15, .1, .6], [0, 0, 0], .04); b.box('#c9a15a', [-.55, .42, -.88], [1.15, .3, .14], [.08, 0, 0], .04); b.box('#d8c8a8', [-.55, .2, -.1], [1.2, .05, .22], [0, 0, 0], .03);
    b.box('#7a5a3a', [.9, .21, .3], [.74, .05, .52], [0, 0, 0], .02); for (const [x, z] of [[.57, .08], [1.23, .08], [.57, .52], [1.23, .52]]) b.box('#6b4a2c', [x, .1, z], [.05, .2, .05], [0, 0, 0], .01);
    b.add(G.cylT, '#6b4a2c', [1.1, .12, -.58], [.14, .24, .14], [0, 0, 0], .01); b.add(G.cylT, '#a8783a', [1.1, .3, -.58], [.1, .1, .1], [0, 0, 0], .01); b.box('#3a2418', [1.1, .36, -.58], [.06, .02, .06], [0, 0, 0], .01);
    b.add(G.ico1, '#a8483a', [-1.2, .08, .7], [.2, .1, .2], [0, .4, 0], .03); b.add(G.ico1, '#c9a15a', [-1.0, .08, .85], [.18, .09, .18], [0, 1.1, 0], .03); b.add(G.ico1, '#d8c8a8', [1.2, .07, .65], [.2, .1, .2], [0, 0, 0], .03);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; room.add(m); }
  // the two side walls are separate so that the cut-away can hide the wall nearer to the camera
  const wallR = new THREE.Group(), wallL = new THREE.Group(); room.add(wallR, wallL);
  { const b = new GB(rng(73)); b.box('#c2a67a', [1.68, .78, .0], [.08, 1.56, 2.2], [0, 0, 0], .03); b.box('#b09364', [1.64, .78, -.2], [.04, 1.2, .5], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; wallR.add(m); }
  { const b = new GB(rng(74)); b.box('#8a3a2a', [-1.68, .76, -.62], [.08, 1.5, .9], [0, 0, 0], .04); b.box('#8a3a2a', [-1.68, .76, .66], [.08, 1.5, .9], [0, 0, 0], .04); b.box('#a8483a', [-1.7, .72, .02], [.04, 1.1, .12], [0, .2, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; wallL.add(m); }
  // the curtain's gap: a half-open drape that Rebekah listens at (27:5)
  const gapG = new THREE.Group(); wallL.add(gapG); { const b = new GB(rng(72)); b.box('#7a2e22', [-1.64, .74, -.06], [.04, 1.3, .24], [0, -.5, 0], .03); b.box('#7a2e22', [-1.64, .74, .26], [.04, 1.3, .24], [0, .5, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gapG.add(m); }
  const lampG = spriteGlow(LAMP[0], hC(LAMP[0], LAMP[1]) + .22, LAMP[1], .9, 0xffa850, 0), lampG2 = spriteGlow(LAMP[0], hC(LAMP[0], LAMP[1]) + .2, LAMP[1], .35, 0xffe0a0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa860, 0, 3.4, 1.6), fireL = new THREE.PointLight(0xff8a40, 0, 7, 1.6);
  // ---- the dish on the low table (carried in by Jacob)
  const dish = bowlMesh(rng(95), true); dish.position.set(TAB[0] + .01, hC(TAB[0], TAB[1]) + RS * .27, TAB[1]); dish.scale.setScalar(.5); dish.visible = false; g.add(dish);
  // ---- the camp fire in a ring of stones, the pot on it, and the smoke
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
  smoke.add(FIRE[0], fy + .5, FIRE[1], t => smooth(20.5, 22.5, t) * (1 - smooth(60.5, 62, t)), .2, 1.8); g.add(smoke.mesh);
  const SMK = [[0, '#a8a0a8'], [20, '#d8c6b0'], [33, '#8a8498'], [50, '#5a5a78'], [90, '#4a4a68']];
  // ---- the flock of goats in their pen west of the camp; two of them are fetched by Jacob (27:9)
  const GP = [[0, 0], [-.55, .35], [.5, .45], [-.3, -.55], [.45, -.5], [-.9, -.2], [.9, 0]];
  const goats = GP.map(([ox, oz], i) => { const s = mkGoat(rng(560 + i)); const x = SPEN[0] + ox, z = SPEN[1] + oz; s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = i * 1.7; ca.add(s.group); s.home = [x, z, i * 1.7]; return s; });
  { const b = new GB(rng(77)); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = SPEN[0] + Math.cos(a) * 1.6, z = SPEN[1] + Math.sin(a) * 1.2; if (a > 5.2 || a < .7) continue; b.box('#6b4a2c', [x, hC(x, z) + .1, z], [.035, .22, .035], [0, 0, 0], .01); b.box('#7a5a3a', [x, hC(x, z) + .15, z], [.45, .03, .03], [0, -a - 1.57, 0], .01); }
    ca.add(meshOf(b)); }
  // ---- Esau's weapons: a bow and a quiver on his back (27:3), the game on his shoulder when he comes back (27:30-31)
  const isaac = mkIsaac(rng(83)), rebekah = mkRebekah(rng(85)), esau = mkEsau(rng(86)), jacob = mkJacob(rng(87)), jacobE = mkJacobE(rng(88));
  [isaac, rebekah, esau, jacob, jacobE].forEach(o => g.add(o.group));
  const bow = new THREE.Group(); { const b = new GB(rng(97)); for (let k = 0; k < 7; k++) { const u = k / 6 * 2 - 1, y = u * .36, x = -.06 * (1 - u * u); b.box('#5a3a20', [x, .5 + y, 0], [.025, .13, .025], [0, 0, -u * .5], .005); } b.box('#e8dcc0', [.04, .5, 0], [.008, .74, .008], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bow.add(m); }
  bow.position.set(-.26, .02, .04); esau.group.add(bow);
  const quiver = (() => { const b = new GB(rng(98)); b.box('#6a4a2a', [0, .78, -.14], [.09, .4, .09], [.1, 0, .25], .01); for (const k of [-1, 0, 1]) b.box('#d8c8a8', [k * .015 + .05, 1.0, -.15], [.012, .16, .012], [.1, 0, .25], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; esau.group.add(m); return m; })();
  const game = new THREE.Group(); { const b = new GB(rng(99)); b.box('#8a6a44', [0, 0, 0], [.34, .13, .12], [0, 0, .2], .02); b.add(G.ico0, '#7a5a38', [.2, .05, 0], [.1, .08, .08], [0, 0, 0], .02); for (const [x, z] of [[-.1, .05], [-.1, -.05], [.06, .05], [.06, -.05]]) b.box('#4a3426', [x, -.11, z], [.025, .14, .025], [0, 0, .1], .005); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; game.add(m); }
  game.position.set(-.02, .96, -.16); game.rotation.set(0, 1.57, .2); game.visible = false; esau.group.add(game);
  const bowlJ = bowlMesh(rng(95), true), bowlE = bowlMesh(rng(96), true); bowlJ.visible = bowlE.visible = false; jacobE.arms[1].add(bowlJ); bowlJ.position.set(0, -.44, .06); esau.arms[1].add(bowlE); bowlE.position.set(0, -.44, .06);
  // ---- Esau's best clothes, held up by Rebekah (27:15), and the skins of the kids: a collar on Jacob's neck and a cuff on each hand (27:16)
  const robe = new THREE.Group(); { const b = new GB(rng(31)); b.box('#9a6038', [0, 0, 0], [.34, .5, .04], [0, 0, 0], .03); b.box('#6a3a22', [0, .08, .02], [.4, .2, .035], [0, 0, 0], .03); b.box('#3a2418', [0, -.08, .03], [.3, .05, .03], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; robe.add(m); }
  rebekah.group.add(robe); robe.visible = false; robe.position.set(.0, .66, .22); robe.rotation.set(-.2, 0, 0);
  const pelt = new THREE.Group(); { const b = new GB(rng(33)); b.box('#9a7248', [0, 0, 0], [.26, .22, .04], [0, 0, 0], .03); b.add(G.ico0, '#8a6238', [.1, .1, 0], [.06, .06, .05], [0, 0, 0], .02); b.add(G.ico0, '#b08658', [-.08, -.1, 0], [.06, .05, .05], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pelt.add(m); }
  rebekah.arms[0].add(pelt); pelt.position.set(.0, -.28, .08); pelt.rotation.set(.2, 0, .3); pelt.visible = false;
  const furC = ['#9a7248', '#b08658', '#8a6238'], fur = new THREE.Group(); { const b = new GB(rng(34)), fr = rng(35); b.add(G.ico1, '#a07a4c', [0, .9, 0], [.085, .05, .085], [0, 0, 0], .03); for (let k = 0; k < 5; k++) b.add(G.ico0, pk(fr, furC), [(k - 2) * .035, .91 + .01 * (k % 2), .02 * ((k % 3) - 1)], [.03, .03, .03], [fr() * 3, fr() * 3, 0], .02); const m = new THREE.Mesh(b.build(), lam); fur.add(m); }
  jacobE.group.add(fur); fur.visible = false;
  const cuffs = [0, 1].map(i => { const b = new GB(rng(36 + i)); b.box('#a07a4c', [0, -.37, 0], [.09, .12, .09], [0, 0, 0], .03); b.add(G.ico0, '#b08658', [0, -.43, 0], [.065, .055, .065], [0, 0, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; jacobE.arms[i].add(m); m.visible = false; return m; });
  // ---- the traveller's bundle and staff that Jacob takes on the road (27:43-45)
  const bundle = new THREE.Group(); { const b = new GB(rng(37)); b.add(G.ico1, '#8a6a44', [0, .8, -.16], [.14, .16, .1], [0, 0, 0], .03); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); b.box('#c9b27c', [0, .84, -.12], [.15, .03, .1], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bundle.add(m); }
  jacobE.group.add(bundle); bundle.visible = false;
  const blessL = shaft(3, .1, .26, [1, .76, .36], .9, .12); g.add(blessL);
  const dew = makeMotes({ n: 46, area: [.9, 1.3, .8], size: .02, v: -.16, seed: 59, color: 0xfff0b8 }); g.add(dew.mesh);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .03, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const starA = spriteGlow(0, 0, 0, 7, 0xffe8b0, 0), starB = spriteGlow(0, 0, 0, 2.2, 0xffffff, 0); g.add(starA, starB);
  const CLOUD = [[0, '#d8b8a0'], [9, '#e8c4a0'], [16, '#d8a090'], [24, '#7a6a88'], [33, '#4a4a70'], [44, '#38385a'], [53, '#2a2a48'], [90, '#2a2a48']];
  const CEM = [[0, '#5a4a44'], [9, '#6a5444'], [16, '#5a4444'], [24, '#3e3a50'], [33, '#26263e'], [44, '#1e2038'], [53, '#181a30'], [90, '#181a30']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = {};
  const SIT = .8, YC = .17;      // a kneeling or sitting figure is shorter; Isaac sits on the cushion (YC high)
  
  // Esau: in the tent before Isaac, listening (27:1-4), out of the camp to hunt, and back from the hunt at dusk (27:30), in and out of the tent, then waiting outside in the dark (27:41)
  const KE = [[0, VS[0], VS[1]], [6.0, VS[0], VS[1]], [6.8, -3.2, 3.3, 'W'], [8.4, 1.6, 3.6, 'W'], [10.0, 6.2, 2.6, 'W']];
  const KE2 = [[43.8, 6.0, 2.9], [45.8, 1.0, 3.6, 'W'], [46.9, -2.2, 3.2, 'W'], [47.7, ES[0], ES[1], 'W'], [53.4, ES[0], ES[1]], [54.6, -2.7, 3.3, 'W'], [55.3, -2.45, 3.7, 'W'], [56.0, -2.45, 3.7], [58.4, 3.2, 3.0, 'W'], [61.0, 7.0, 2.4, 'W'], [90, 7.0, 2.4]];
  // Rebekah: walks to the curtain (27:5), listens, goes to meet Jacob (27:6), gives him the instructions, takes his hands, dresses him, goes back to the curtain, and then to the fire (27:42)
  const KR = [[0, -6.6, 3.4], [5.6, -6.6, 3.4], [8.2, RL[0], RL[1], 'W'], [11.2, RL[0], RL[1]], [12.8, RY[0], RY[1], 'W'], [29.0, RY[0], RY[1]], [30.6, RL[0], RL[1], 'W'], [55.6, RL[0], RL[1]], [57.8, -1.4, 4.5, 'W'], [90, -1.4, 4.5]];
  // Jacob: among the goats (27:9), to Rebekah, back for two kids, to the yard, dressed, into the tent, out, to the fire, and away on the road (27:43)
  const KJ = [[0, -5.9, 4.7], [11.6, -5.9, 4.7], [12.8, JY[0], JY[1], 'W'], [15.2, JY[0], JY[1]], [16.2, SPEN[0] + .8, SPEN[1] + .2, 'W'], [16.6, SPEN[0] + .8, SPEN[1] + .2], [17.6, JY[0], JY[1], 'W'], [29.0, JY[0], JY[1]], [30.0, -3.9, 3.4, 'W'], [31.4, VS[0], VS[1] + .02, 'W'], [44.2, VS[0], VS[1] + .02], [45.4, -3.15, 3.25, 'W'], [46.6, -2.3, 4.4, 'W'], [48.6, -.4, 4.7, 'W'], [60.2, -.4, 4.7], [61.0, 1.4, 4.25, 'W'], [63.4, 3.6, 3.0, 'W'], [90, 6.2, 2.4]];
  const KG0 = [[0, goats[0].home[0], goats[0].home[1]], [16.2, goats[0].home[0], goats[0].home[1]], [17.9, JY[0] - .55, JY[1] + .3, 'W'], [22.4, JY[0] - .55, JY[1] + .3], [24.6, goats[0].home[0], goats[0].home[1], 'W']];
  const KG1 = [[0, goats[1].home[0], goats[1].home[1]], [16.4, goats[1].home[0], goats[1].home[1]], [18.1, JY[0] - .35, JY[1] - .35, 'W'], [22.4, JY[0] - .35, JY[1] - .35], [24.8, goats[1].home[0], goats[1].home[1], 'W']];

  function update(t, camera, sid) {
    const cam = camera && camera.position;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; } o.m.visible = !hide; } }
    if (cam) { wallL.visible = !(cam.x < TS[0] - RS * 1.7); wallR.visible = !(cam.x > TS[0] + RS * 1.7); }
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 2) / 2;
      goats.forEach((s, i) => { if (i < 2) { s.group.visible = true; return; } const p = s.group.position, px = p.x - C.x, py = p.y + .1 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .3 + .45 * hw * u; } s.group.visible = !hide; }); }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject in the golden hour; stars and a moon-bright star once night falls
    { const k0 = ON(t, -1, .5, 11, 20) * .75, cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); starA.position.set(cx + v3.x / hl * 150 + v3.z / hl * 14, cy + 34, cz + v3.z / hl * 150 - v3.x / hl * 14); }
      sunS2.position.copy(sunS.position); starB.position.copy(starA.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k0; sunS2.material.opacity = .5 * k0; sunS.visible = sunS2.visible = k0 > .01;
      const st = ON(t, 26, 33, 90, 91) * (.9 + .1 * Math.sin(t * 3.1)); starA.material.opacity = .62 * st; starB.material.opacity = .95 * st; starA.visible = starB.visible = st > .01; }
    // light: the lamp in the tent glows from the start and grows with the dusk; the camp fire is lit while Rebekah cooks and burns to the end
    { const fl = .88 + .12 * Math.sin(t * 9.1) * Math.sin(t * 5.3), kl = .45 + .55 * smooth(9, 30, t), kf = smooth(19.5, 22.0, t), ff = .9 + .1 * Math.sin(t * 11.3) * Math.sin(t * 7.1);
      lampG.material.opacity = .4 * kl * fl; lampG2.material.opacity = .32 * kl; lampL.position.set(LAMP[0] - .05, hC(LAMP[0], LAMP[1]) + .45, LAMP[1] + .3); lampL.intensity = 2.5 * kl * fl;
      fireG.material.opacity = .62 * kf * ff; fireG2.material.opacity = .5 * kf; fireG.visible = fireG2.visible = kf > .01; fireL.position.set(FIRE[0], fy + .6, FIRE[1] + .3); fireL.intensity = 4.6 * kf * ff;
      flames.visible = kf > .02; flameM.forEach((f, i) => { const s = (.8 + .35 * Math.sin(t * 13 + i * 2.1) * Math.sin(t * 8.3 + i)) * kf; f.m.scale.set(.9 + .15 * Math.sin(t * 9 + i), Math.max(.05, s), .9 + .15 * Math.cos(t * 10 + i)); }); pot.visible = t > 19.5; }
    smoke.update(t, colAt(SMK, t)); motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)), [3, .5, 2.5]);
    // the blessing: a slow shaft of gold and falling points of dew over Jacob (27:28)
    { const bl = ON(t, 38.0, 39.4, 43.2, 44.6) * .5, vx = VS[0], vz = VS[1] + .02; blessL.position.set(vx, hC(vx, vz) + .05, vz); blessL.material.opacity = bl; blessL.visible = bl > .004; dew.update(t, bl * 2, [vx, hC(vx, vz), vz]); }
    // the goats: the flock grazes; two of them follow Jacob to the yard (27:9) and go back
    goats.forEach((s, i) => { const keys = i === 0 ? KG0 : i === 1 ? KG1 : null; if (keys) { const p = kp(t, keys); s.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); s.group.rotation.y = p.mv ? headZ(p.vx, p.vz) - 1.57 + 1.57 : s.home[2] + .12 * Math.sin(t * .4 + i);
        if (p.mv) s.legs.forEach((l, k) => l.rotation.z = (k === 1 || k === 2 ? -1 : 1) * Math.sin(t * 7) * .45); else s.legs.forEach(l => l.rotation.z = 0); } else s.group.rotation.y = s.home[2] + .12 * Math.sin(t * .4 + i); });
    const arm = (a, extra) => extra;
    // ---- Isaac: sits on the couch all the way through; turns to Esau's voice and reaches for him (27:1-4), feels Jacob's hands (27:22), blesses him (27:27-29), trembles when Esau comes (27:33)
    { const tr = ON(t, 47.6, 48.2, 52.2, 53.6), ex = GE(t, [[.9, 1.6, 4.4, 5.4, { a1x: -1.15, a1z: .12, lx: -.05 }], [32.9, 33.5, 35.6, 36.2, { a0x: -1.25, a1x: -1.25, a0z: -.08, a1z: .08, lx: -.05 }], [36.5, 37.3, 43.0, 44.2, { a0x: -1.9, a1x: -1.9, a0z: -.28, a1z: .28, lx: -.07 }], [48.2, 49.0, 52.0, 53.4, { a0x: -.9, a1x: -.9, a0z: -.2, a1z: .2, lx: .05 }]]);
      const sh = tr * (Math.sin(t * 37) * .018 + Math.sin(t * 29 + 1) * .01), slump = smooth(53.2, 55.0, t) * .08;
      fig(isaac, ISK[0], ISK[1], hy(t, [[0, fIV], [44.0, fIV], [46.8, fIE], [90, fIE]]), false, t, 5.1, { ...ex, lx: (ex.lx || 0) + sh + slump, a0x: (ex.a0x || 0) + sh * 3, s: SIT * (1 + .008 * Math.sin(t * 1.6)) }, 9, YC); }
    // ---- Esau: before Isaac, out to hunt; back with the game, in, crying out, kneeling, out, and waiting outside
    { const early = t < 10.3, late = t > 43.5; esau.group.visible = early || late;
      if (esau.group.visible) { const p = kp(t, early ? KE : KE2), mv = p.mv;
        game.visible = late && t < 47.9; bow.visible = early; quiver.visible = true; bowlE.visible = false;
        const kn = late ? ON(t, 50.6, 51.4, 53.0, 53.8) : 0, cry = late ? ON(t, 49.2, 49.7, 50.7, 51.3) : 0, ang = late ? smooth(54.2, 55.2, t) : 0;
        const ry = mv ? headZ(p.vx, p.vz) : early ? fVI : hy(t, [[47.7, fEI], [54.0, fEI], [55.1, headZ(-.6, -1)], [90, headZ(-.6, -1)]]);
        let ex = !mv ? (early ? GE(t, [[1.4, 2.2, 4.8, 5.8, { a0x: -.25, a0z: -.1, lx: .04 }]]) : { a0x: -.2 * ang - 2.4 * cry - 1.0 * kn, a1x: -2.1 * cry - 1.0 * kn, a0z: -.5 * ang - .7 * cry - .3 * kn, a1z: .5 * ang + .7 * cry + .3 * kn, lx: .06 * kn + .08 * ang }) : {};
        fig(esau, p.x, p.z, ry, mv, t, 3.3, { ...ex, s: (1 - .2 * kn) * (1 + .008 * Math.sin(t * 1.7)) }, 8.4); } }
    // ---- Rebekah: the curtain, the yard, the dressing, the curtain again, the fire
    { const p = kp(t, KR), mv = p.mv, vis = t > 5.0; rebekah.group.visible = vis;
      if (vis) { const ry = mv ? headZ(p.vx, p.vz) : t < 12.0 ? headZ(1, .12) : t < 29.2 ? face(RY[0], RY[1], JY[0], JY[1]) : t < 56 ? headZ(1, .1) : headZ(1, -.1);
        const ex = !mv ? GE(t, [[8.8, 9.6, 11.0, 11.6, { a1x: -.95, a1z: .15, lx: .05 }], [13.0, 13.6, 15.8, 16.4, { a0x: -.5, a1x: -1.3, a1z: -.1 }], [17.2, 17.8, 18.6, 19.2, { a0x: -1.2, a1x: -1.2, a0z: -.1, a1z: .1 }], [19.4, 20.0, 21.6, 22.2, { a1x: -.9, a1z: .25, a0x: -.4 }], [22.4, 23.0, 24.2, 24.8, { a0x: -1.6, a1x: -1.6, a0z: -.2, a1z: .2 }], [25.3, 25.9, 27.0, 27.6, { a0x: -1.2, a1x: -1.0, a0z: -.1, a1z: .1 }], [31.4, 32.0, 55.0, 55.8, { a1x: -.95, a1z: .15, lx: .04 }], [58.0, 58.6, 60.0, 60.6, { a1x: -1.7, a1z: -.5, a0x: -.3 }]]) : {};
        fig(rebekah, p.x, p.z, ry, mv, t, 4.1, { ...ex, s: 1 + .007 * Math.sin(t * 1.5) }, 8.5); robe.visible = t > 22.4 && t < 24.4; pelt.visible = t > 24.8 && t < 27.8; } }
    // ---- Jacob: in linen until Rebekah dresses him at 24.4 (27:15), then in Esau's clothes with the skins (27:16)
    { const p = kp(t, KJ), mv = p.mv, dressed = t > 24.4; jacob.group.visible = !dressed; jacobE.group.visible = dressed; const f = dressed ? jacobE : jacob;
      fur.visible = t > 26.3; cuffs.forEach(c => c.visible = t > 25.6); bundle.visible = t > 58.0;
      const ry = mv ? headZ(p.vx, p.vz) : hy(t, [[0, headZ(1, .5)], [12.8, face(JY[0], JY[1], RY[0], RY[1])], [15.3, headZ(-1, .2)], [16.4, headZ(-1, .2)], [17.7, face(JY[0], JY[1], RY[0], RY[1])], [29.0, face(JY[0], JY[1], RY[0], RY[1])], [31.4, fVI], [44.2, fVI], [48.8, headZ(-1, -.5)], [56.6, headZ(-1, -.5)], [57.9, headZ(-1, -.1)], [60.0, headZ(-1, -.1)], [60.6, headZ(1, -.2)], [90, headZ(1, -.2)]]);
      const kneel = ON(t, 36.6, 37.6, 43.4, 44.4);
      const ex = !mv ? GE(t, [[13.0, 13.6, 14.8, 15.4, { a0x: -.4, a1x: -.8 }], [17.9, 18.4, 19.4, 20.0, { a0x: -.6, a1x: -.6, a0z: -.5, a1z: .5, lx: -.06 }], [22.4, 23.0, 24.2, 24.8, { a0x: -1.2, a1x: -1.2, a0z: -.1, a1z: .1 }], [25.3, 26.0, 27.6, 28.4, { a0x: -1.3, a1x: -1.3, a0z: -.1, a1z: .1 }], [32.0, 32.6, 36.0, 36.6, { a0x: -1.3, a1x: -1.0, a0z: -.1, a1z: .05 }], [57.8, 58.4, 59.6, 60.2, { a0x: -.5, a1x: -.6, lx: .04 }]]) : {};
      if (dressed && t > 28.4 && t < 36.6) ex.a1x = (ex.a1x || 0) + -1.0 * smooth(28.4, 29.2, t) * (1 - smooth(33.0, 33.6, t));
      fig(f, p.x, p.z, ry, mv, t, 6.2, { ...ex, s: (1 - .2 * kneel) * (1 + .008 * Math.sin(t * 1.5)) }, 8.0); state.jacob = [p.x, gAt(p.x, p.z), p.z];
      bowlJ.visible = dressed && t > 28.2 && t < 33.6; dish.visible = t > 33.6 && t < 44.6; }
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [-9, 3.4, 5], .45, '#ffcf9a', [8, 4, 6], 14), Dk(9, '#b0a8cc', '#6a5444', 1.0, '#ffb068', 2.5, [-9, 3.2, 5], .45, '#ffc890', [8, 4, 6], 14),
    Dk(16, '#a0a0c8', '#5a4a48', .95, '#ffa060', 2.2, [-10, 2.6, 4], .5, '#ffc890', [8, 4, 6], 14), Dk(24, '#6a78b0', '#3a3448', .85, '#ff9050', 1.6, [-10, 2.0, 4], .5, '#ffb070', [8, 3, 6], 14),
    Dk(33, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.4, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(44, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(53, '#3e4c84', '#181a2c', .72, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(62, '#3e4c84', '#181a2c', .72, '#7a8ad0', 1.2, [-9, 6, 6], .5, '#ff9a50', [-8, 4, 8], 14)];
  const bg = [[0, ['#2a3a7a', '#f0b878']], [9, ['#2a3a7a', '#f0a870']], [16, ['#2a3a7a', '#f29a64']], [24, ['#1a2858', '#a8607a']], [33, ['#10204a', '#5a4a70']], [44, ['#0a1230', '#2a2a50']], [53, ['#070d26', '#1c2244']], [62, ['#070d26', '#1c2244']]];
  return { group: g, update, light, bg, far, esau, jacob, jacobE, isaac, rebekah, pl: [lampL, fireL], state };
}
