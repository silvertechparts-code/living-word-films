// Episode 28: Genesis 28. Isaac blesses Jacob and sends him to Paddan-aram to find a wife among Laban's daughters (28:1-5); Jacob leaves Beersheba for Haran (28:10);
// at sunset he stops for the night, takes one of the stones of the place for his head and lies down (28:11); he dreams of a stairway set on the earth, its top reaching to heaven, with angels of God going up and down on it (28:12);
// the Lord stands beside him: "I am the Lord, the God of Abraham and the God of Isaac; the land on which you lie I will give to you and to your offspring" (28:13); all the families of the earth shall be blessed in him; "I am with you ... I will not leave you" (28:14-15);
// Jacob wakes, afraid: "Surely the Lord is in this place, and I did not know it ... this is the gate of heaven" (28:16-17); early in the morning he takes the stone, sets it up as a pillar, pours oil on top of it and names the place Bethel (28:18-19).
// Cinematic interpretation: the floating land, the shape of the camp and the road, the tent, the cushion, the staff and bundle, the colour of the light, the stars, the faces and the way the figures stand, kneel, walk, lie, sit up and reach are not in the text.
// The film leaves out Esau's reaction and his marriage to Mahalath (28:6-9), the promise of descendants like the dust of the earth (28:14), the promise to bring Jacob back (28:15), the old name Luz (28:19) and Jacob's vow and the tithe (28:20-22).
// The text does not say that the stairway was made of light, how the angels looked, that the Lord appeared as a column of light, or that Jacob carried a staff and a bundle or a flask of oil; the film shows them so that each moment can be seen. God and the angels are shown only as light, never as figures.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, cloudSea, farMountains10, headZ, C3, rimf, meshOf } from './world10.js';
import { makeStars } from './stars15.js';

export const RIC = 15;
export const TS = [-6.9, 1.2], ISK = [-5.1, 2.4], JV = [-3.85, 2.4];                  // Isaac's tent; Isaac's cushion; where Jacob stands before him
export const SX = [6.9, .1];                                                          // the place: a stony rise in the east, where the road ends
export const EV = { a1: .6, a2: 10.03, b1: 18.92, b2: 27.74, b3: 37.32, c1: 45.73, c2: 54.57 };

// ---------------- terrain: green camp ground in the west, golden then stony earth toward the east
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.6, -1.4, 1.5, 4.4], [3.5, -10, 1.1, 5], [10.5, 7.6, .9, 4], [12.8, -7, 1.1, 4]];
const FLATS = [[TS[0], TS[1] + .5, .32, 4.0], [-4.4, 2.4, .32, 2.2], [SX[0], SX[1], .52, 1.5]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
export const PATH = [[-3.85, 2.4], [-2.6, 3.3], [-.8, 3.9], [1.2, 3.6], [3.3, 2.6], [5.0, 1.5], [6.2, .5]];
const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-6, 2, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .9);
  b.lerp(C3('#a39583'), .75 * smooth(5.0, 1.6, Math.hypot(x - SX[0], z - SX[1])));
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#7e9a52'), .55 * smooth(5.2, 2.8, Math.hypot(x - TS[0], z - TS[1] - 1.2)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, TS, ISK, JV, SX, PATH };

// ---------------- walkers: keys [[t, x, z, ease?], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);

// ---------------- the people
const mkIsaac = R => person(R, { pants: '#7a5a3a', top: '#c9a15a', skin: '#c38a5c', hair: '#aaa498', beard: '#bdb7ac', sash: '#8a3a2a', seed: 630 }, .47);            // the same Isaac as in Genesis 24-27, old: grey hair and beard
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);              // the same Jacob: quiet, in light linen
const mkBowl = R => { const b = new GB(R); b.add(G.cylT, '#a8602e', [0, 0, 0], [.07, .1, .07], [0, 0, 0], .01); return b; };

// ====================================================================== the world
export function makeCamp() {
  const R = rng(2828), g = new THREE.Group();
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9851), RIC, hC, gcC, 30, 80), underRock(rng(9852), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  [[-9.0, 1.0, 2.5], [-10.0, 4.4, 2.0], [-10.2, -2.2, 1.8]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-10.6, -5.0, 2.0], [-8.4, -8.0, 2.2]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-1.6, 5.9, .85], [1.6, 5.6, .8], [3.6, 5.0, .9], [4.4, -1.4, .8], [-.4, -2.0, .9]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[10.2, -4.4, 1.0], [12.4, -.8, 1.1], [11.6, 5.0, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.hypot(x - TS[0], z - TS[1]) < 3.4 || Math.hypot(x - ISK[0], z - ISK[1]) < 2.2 || dPath(x, z) < 1.2 || Math.hypot(x - SX[0], z - SX[1]) < 1.9;
  for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  // stones: scattered everywhere and thick around the place where the road ends (28:11 "one of the stones of the place")
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    for (let k = 0; k < 34; k++) { const a = R() * TAU, r = 1.9 + R() * 3.0, x = SX[0] + Math.cos(a) * r, z = SX[1] + Math.sin(a) * r * .9; if (hC(x, z) < .12 || dPath(x, z) < .5 || Math.hypot(x - SX[0], z - SX[1]) < 1.15) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a', '#8e8470']), [x, hC(x, z), z], [.14 + R() * .34, .1 + R() * .2, .14 + R() * .34], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- more tents behind Isaac's
  { const rr = rng(9); const mk = (x, z, ry, c, s) => { const grp = new THREE.Group(); const b = new GB(rr); b.add(G.cone7, c, [0, .5 * s, 0], [.9 * s, 1.0 * s, .9 * s], [0, 0, 0], .05); b.box('#6b4a2c', [0, 1.05 * s, 0], [.04, .3, .04], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; grp.add(m); grp.position.set(x, hC(x, z), z); grp.rotation.y = ry; ca.add(grp); };
    mk(-8.2, 3.2, .5, '#c2a67a', .95); mk(-7.6, -.6, -.4, '#d4c29c', .85); }
  // ---- Isaac's tent, a rug, and the cushion where he sits (the tent opens toward the east, the road)
  { const b = new GB(rng(71)); const tx = TS[0], tz = TS[1], ty = hC(tx, tz);
    b.add(G.cone7, '#c9ae80', [tx, ty + .66, tz], [1.1, 1.32, 1.1], [0, 0, 0], .05); b.box('#6b4a2c', [tx, ty + 1.4, tz], [.05, .3, .05], [0, 0, 0], .01); b.box('#3a2418', [tx + .56, ty + .34, tz], [.06, .68, .42], [0, 0, 0], .02);
    const ry = hC(ISK[0], ISK[1]); b.box('#8a4a3c', [ISK[0] + .25, ry + .02, ISK[1]], [2.3, .03, 1.5], [0, 0, 0], .02); b.box('#c8a050', [ISK[0] + .25, ry + .04, ISK[1] + .62], [2.1, .012, .09], [0, 0, 0], .01); b.box('#c8a050', [ISK[0] + .25, ry + .04, ISK[1] - .62], [2.1, .012, .09], [0, 0, 0], .01);
    b.add(G.ico1, '#a8483a', [ISK[0], ry + .08, ISK[1]], [.3, .13, .3], [0, .3, 0], .03);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  // ---- the place: a few bigger stones around the spot where Jacob lies, and the one he rests his head on (28:11), which he later sets up as a pillar (28:18)
  const SY = hC(SX[0], SX[1]);
  { const b = new GB(rng(75)); for (const [dx, dz, s, c] of [[-.9, -.8, .17, '#9a8e7c'], [.7, -.9, .2, '#85796a'], [-1.2, .8, .15, '#a99c86'], [1.1, .9, .17, '#8e8470'], [.1, -1.3, .15, '#9a8e7c'], [-.4, 1.5, .15, '#85796a']]) b.add(G.ico0, c, [SX[0] + dx, hC(SX[0] + dx, SX[1] + dz) + .03, SX[1] + dz], [s, s * .62, s * .85], [dx * 3, dz * 2, 0], .05);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0xa89c88 });
  const stoneG = new THREE.Group(), stoneM = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), stoneMat); stoneM.castShadow = true; stoneG.add(stoneM); g.add(stoneG);
  const stoneHeld = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), stoneMat); stoneHeld.scale.set(.1, .13, .09); stoneHeld.visible = false;
  const oilG = spriteGlow(SX[0], SY + .4, SX[1], .5, 0xffd890, 0), oilG2 = spriteGlow(SX[0], SY + .4, SX[1], .2, 0xfff2cc, 0); g.add(oilG, oilG2);
  // ---- the people and what they carry: a staff and a bundle (not in the text), a flask of oil (28:18)
  const isaac = mkIsaac(rng(83)), jacob = mkJacob(rng(87)); g.add(isaac.group, jacob.group);
  const bundle = new THREE.Group(); { const b = new GB(rng(37)); b.add(G.ico1, '#8a6a44', [0, .8, -.16], [.14, .16, .1], [0, 0, 0], .03); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); b.box('#c9b27c', [0, .84, -.12], [.15, .03, .1], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bundle.add(m); }
  jacob.group.add(bundle);
  const bundleG = new THREE.Group(); { const b = new GB(rng(38)); b.add(G.ico1, '#8a6a44', [0, .09, 0], [.17, .12, .12], [0, .4, 0], .03); b.box('#c9b27c', [0, .17, 0], [.17, .03, .12], [0, .4, 0], .01); b.box('#6b4a2c', [.0, .02, .2], [.03, .04, .5], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bundleG.add(m); } bundleG.visible = false; bundleG.scale.setScalar(.75); g.add(bundleG);
  const flask = new THREE.Group(); { const b = new GB(rng(39)); b.add(G.cylT, '#a8602e', [0, 0, 0], [.05, .09, .05], [0, 0, 0], .005); b.add(G.cylT, '#7a3e28', [0, .06, 0], [.025, .04, .025], [0, 0, 0], .003); const m = new THREE.Mesh(b.build(), lam); flask.add(m); }
  jacob.arms[1].add(flask); flask.position.set(0, -.4, .07); flask.visible = false; jacob.arms[0].add(stoneHeld); stoneHeld.position.set(0, -.4, .12);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffd070, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); stream.visible = false; g.add(stream);
  // ---- the stairway: steps of light rising from the ground beside Jacob's head toward the sky, two bright rails, and the angels as tall soft lights going up and down (28:12)
  const NST = 38, SRISE = .33, SRUN = .26, SW = .95, SB = [SX[0] + .45, SY + .02, SX[1] - .35];
  const stair = new THREE.Group(); g.add(stair);
  const stepMats = [], riserMats = []; for (let i = 0; i < NST; i++) { const mk = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }), m = mk(0xffe0a0), mr = mk(0xffc878); stepMats.push(m); riserMats.push(mr);
    const tread = new THREE.Mesh(new THREE.BoxGeometry(SW, .03, SRUN * .9), m); tread.position.set(SB[0], SB[1] + i * SRISE, SB[2] - i * SRUN); stair.add(tread);
    const riser = new THREE.Mesh(new THREE.BoxGeometry(SW, SRISE - .03, .02), mr); riser.position.set(SB[0], SB[1] + i * SRISE - SRISE / 2, SB[2] - i * SRUN + SRUN * .45); stair.add(riser); }
  const railM = new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const sx of [-1, 1]) { const len = Math.hypot(NST * SRISE, NST * SRUN), rail = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, len), railM); rail.position.set(SB[0] + sx * SW / 2, SB[1] + NST * SRISE / 2, SB[2] - NST * SRUN / 2); rail.rotation.x = Math.atan2(NST * SRISE, NST * SRUN); stair.add(rail); }
  const haze = []; for (let i = 0; i < 16; i++) { const k = i / 15, h = spriteGlow(SB[0], SB[1] + k * NST * SRISE, SB[2] - k * NST * SRUN, 1.7 + 1.4 * k, 0xffd890, 0); h.userData.k = k; stair.add(h); haze.push(h); }
  const angels = Array.from({ length: 9 }, (_, i) => { const a = spriteGlow(0, 0, 0, 1, 0xffefc0, 0), c = spriteGlow(0, 0, 0, 1, 0xffffff, 0); stair.add(a, c); return { a, c, up: i % 2 === 0, ph: i / 9, sp: .026 + .004 * (i % 3), ox: (i % 3 - 1) * .2 }; });
  // ---- the Lord beside him: a tall column of light (God is shown only as light), and the foot of it on the ground
  const colL = shaft(7, .24, .18, [1, .86, .5], .9, .55); colL.position.set(SX[0] + .05, SY + .02, SX[1] + .62); g.add(colL);
  const colG = spriteGlow(SX[0] + .05, SY + .5, SX[1] + .62, .9, 0xffd890, 0), colP = pool(.6, 0xffd890, 0); colP.position.set(SX[0] + .05, SY + .04, SX[1] + .62); g.add(colG, colP);
  const lightL = new THREE.PointLight(0xffd090, 0, 7, 1.5); lightL.position.set(SX[0] + .1, SY + .7, SX[1] + .6);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const spark = makeMotes({ n: 40, area: [1.2, 4.5, 1.2], size: .007, v: .22, seed: 41, color: 0xffe4a8 }); g.add(spark.mesh);
  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const stars = makeStars({ seed: 28 }); g.add(stars.group);
  const CLOUD = [[0, '#d8b8a0'], [9, '#e8c4a0'], [15, '#d89080'], [20, '#4a4a70'], [26, '#262a4a'], [49, '#262a4a'], [54, '#6a5a80'], [58, '#e8c0a0'], [90, '#e8c8a8']];
  const CEM = [[0, '#5a4a44'], [9, '#6a5444'], [15, '#5a4444'], [20, '#2e2e48'], [26, '#181a30'], [49, '#181a30'], [54, '#4a4058'], [58, '#6a5848'], [90, '#6a5848']];
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
  const LEN = .5;               // from the feet of the lying figure to the middle of the head

  // Jacob: stands before Isaac (28:1), kneels for the blessing, rises and leaves along the road (28:10), reaches the place at sunset, lies down with his head on the stone (28:11),
  // sleeps through the dream, wakes (28:16), stands, sets up the stone and pours the oil (28:18)
  const KJ = [[0, JV[0], JV[1]], [7.6, JV[0], JV[1]], [8.5, -3.7, 2.55, 'W'], [9.6, -2.6, 3.3, 'W'], [11.6, -.8, 3.9, 'L'], [13.4, 1.2, 3.6, 'L'], [15.0, 3.3, 2.6, 'L'], [16.0, 5.0, 1.5, 'L'], [16.9, SX[0] - .85, SX[1] + .04, 'W'], [90, SX[0] - .85, SX[1] + .04]];
  const LIEX = SX[0] - LEN - .1, LIEZ = SX[1] + .02, P0 = [SX[0] - .85, SX[1] + .04];     // where the feet are when he lies; where he stops before lying down
  const STONEP = [SX[0] + .02, SX[1] + .02];
  function update(t, camera) {
    const cam = camera && camera.position;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; } o.m.visible = !hide; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject at the golden hour and sunset, and again at dawn (the sprite stays on the far side of whatever the camera looks at)
    { const k0 = ON(t, -1, .5, 16.4, 19.4) * .78 + ON(t, 53.6, 56.4, 90, 91) * .8, cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k0; sunS2.material.opacity = .5 * k0; sunS.visible = sunS2.visible = k0 > .01; }
    // the star dome: it comes with the night and goes with the dawn
    { const so = ON(t, 16.5, 23.5, 52.0, 56.5); stars.group.visible = so > .004; stars.update(t, so, .38, .6 + .0035 * t, cam || new THREE.Vector3()); }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)), [3, .5, 2.5]);
    // ---- the stairway and the angels: it opens from the foot at 19.4, is fully there through the promise, and closes upward as Jacob wakes (28:12)
    { const op = ON(t, 19.2, 24.0, 44.6, 48.6) * (1 - .4 * ON(t, 36.4, 37.4, 41.2, 42.4)), up = smooth(19.2, 25.0, t) * (1 - smooth(44.0, 49.0, t)), fl = .93 + .07 * Math.sin(t * 2.1); stair.visible = op > .004;
      const grow = smooth(19.2, 25.0, t) * NST, fade = smooth(44.0, 49.0, t) * NST;      // the top rises as it opens; as it closes the foot fades first, so the light lifts away
      stepMats.forEach((m, i) => { const a = smooth(i - 3, i + 1, grow) * (1 - smooth(i - 3, i + 1, fade)); m.opacity = .2 * a * fl * (.5 + .5 * (1 - i / NST)); riserMats[i].opacity = .09 * a * fl; });
      railM.opacity = .4 * op * fl;
      haze.forEach(h => { const a = smooth(h.userData.k * NST - 3, h.userData.k * NST + 1, grow) * (1 - smooth(h.userData.k * NST - 3, h.userData.k * NST + 1, fade)); h.material.opacity = .13 * a * (1 - .5 * h.userData.k); });
      angels.forEach((an, i) => { const u = ((t * an.sp * 1.6 + an.ph) % 1 + 1) % 1, k = an.up ? u : 1 - u, kk = .04 + k * .94, a = Math.sin(Math.PI * clamp(kk)) * op, px = SB[0] + an.ox * .9, py = SB[1] + kk * NST * SRISE + .55, pz = SB[2] - kk * NST * SRUN;
        an.a.position.set(px, py, pz); an.c.position.set(px, py + .05, pz); an.a.scale.set(.2 + .1 * kk, .62 + .26 * kk, 1); an.c.scale.set(.08 + .03 * kk, .3 + .12 * kk, 1); an.a.material.opacity = .62 * a; an.c.material.opacity = .78 * a; }); }
    // ---- the Lord beside him (28:13-15): the column of light stands up beside Jacob and glows through the promise, then softens as he wakes
    { const lo = ON(t, 27.4, 29.4, 43.4, 46.0) * (.92 + .08 * Math.sin(t * 1.9)); colL.material.opacity = .4 * lo; colL.visible = lo > .004; colG.material.opacity = .2 * lo; colG.visible = lo > .004; colP.material.opacity = .16 * lo; colP.visible = lo > .004; lightL.intensity = 1.5 * lo;
      spark.update(t, lo * 1.4, [SX[0] + .05, SY, SX[1] + .62]); }
    // ---- Isaac: sits on his cushion before the tent; reaches out to Jacob, lays his hands on him (28:1) and points him on his way (28:2)
    { const ex = GE(t, [[.6, 1.4, 2.8, 3.5, { a1x: -1.0, a1z: .2, lx: -.05 }], [3.4, 4.1, 6.6, 7.4, { a0x: -1.9, a1x: -1.9, a0z: -.3, a1z: .3, lx: -.06 }], [7.2, 7.8, 9.6, 10.6, { a1x: -1.6, a1z: -.1, lx: -.04 }]]);
      fig(isaac, ISK[0], ISK[1], hy(t, [[0, face(ISK[0], ISK[1], JV[0], JV[1])], [90, face(ISK[0], ISK[1], JV[0], JV[1])]]), false, t, 5.1, { ...ex, s: SIT * (1 + .008 * Math.sin(t * 1.6)) }, 9, YC); }
    // ---- Jacob
    { const p = kp(t, KJ), mv = p.mv, kneel = ON(t, 2.2, 3.3, 6.6, 7.6);
      const lp = smooth(17.0, 18.6, t), lie = lp * (1 - smooth(46.0, 47.4, t)), phi = 1.5 * lie, sit = smooth(46.4, 47.4, t) * (1 - smooth(51.4, 52.6, t));
      let X = p.x, Z = p.z, ry, ex = {}, y0 = 0;
      if (t < 8.6) { ry = face(JV[0], JV[1], ISK[0], ISK[1]); ex = GE(t, [[.6, 1.4, 2.2, 2.8, { lx: .1 }], [3.2, 3.8, 6.8, 7.6, { lx: .16, a0x: -.4, a1x: -.4 }]]); }
      else if (t < 16.95) { ry = mv ? headZ(p.vx, p.vz) : headZ(1, -.3); }
      else {
        X = lerp(P0[0], LIEX + .3, lp) - .3 * Math.sin(phi); Z = lerp(P0[1], LIEZ, lp);
        ry = hy(t, [[16.9, headZ(1, -.3)], [17.8, headZ(-1, 0)], [46.0, headZ(-1, 0)], [48.0, headZ(-1, .5)], [49.4, headZ(-1, -.6)], [50.8, headZ(-.5, -1)], [52.4, headZ(-.2, -1)], [54.2, headZ(1, 0)], [90, headZ(1, 0)]]);
        ex = GE(t, [[16.9, 17.2, 17.6, 18.0, { lx: .18, a0x: -.5, a1x: -.5 }], [47.7, 48.3, 50.0, 50.9, { a0x: -1.0, a1x: -1.0, a0z: -.2, a1z: .2 }], [51.6, 52.4, 53.6, 54.4, { a0x: -1.3, a1x: -1.3, a0z: -.5, a1z: .5, lx: -.08 }],
          [54.7, 55.3, 55.8, 56.3, { lx: .3, a0x: -1.1, a1x: -1.1 }], [56.3, 57.0, 58.4, 59.2, { a1x: -1.7, a0x: -.3, lx: .05 }]]);
        if (lie > .002) { ex.lx = (ex.lx || 0) - phi; ex.a0x = (ex.a0x || 0) - .1 * lie; ex.a1x = (ex.a1x || 0) - .1 * lie; ex.a0z = -.3 * lie; ex.a1z = .3 * lie; y0 = (SY - gAt(X, Z)) * lie + .1 * lie - .02 * lie; }
        y0 += .08 * sit; }
      fig(jacob, X, Z, ry, mv && t < 16.95, t, 6.2, { ...ex, s: (1 - .22 * kneel) * (1 - .22 * sit) * (1 + .006 * Math.sin(t * 1.5)) }, 8.0, y0); state.jacob = [X, gAt(X, Z), Z];
      bundle.visible = t < 17.0; bundleG.visible = t >= 17.0; bundleG.position.set(SX[0] - .75, SY + .02, SX[1] - .42); bundleG.rotation.y = -.5;
      flask.visible = t > 56.2 && t < 59.4; stoneHeld.visible = t > 55.4 && t < 56.3; }
    // ---- the stone: a pillow for his head until morning, lifted and set up as a pillar (28:18), with the oil running down it
    { const pil = [.14, .09, .11], pla = [.08, .22, .07], k = smooth(56.3, 56.8, t);
      stoneG.visible = t < 55.4 || t > 56.2;
      stoneG.position.set(STONEP[0], SY + lerp(.05, .19, k), STONEP[1]); stoneG.scale.set(lerp(pil[0], pla[0], k), lerp(pil[1], pla[1], k), lerp(pil[2], pla[2], k)); stoneG.rotation.set(0, lerp(.4, 0, k), 0);
      const oil = ON(t, 56.9, 57.6, 90, 91), sa = ON(t, 56.7, 57.1, 58.5, 58.9); stream.visible = sa > .01; stream.position.set(STONEP[0] + .02, SY + .46, STONEP[1] + .01); stream.scale.set(1, .1, 1); stream.material.opacity = .85 * sa;
      oilG.position.set(STONEP[0], SY + .4, STONEP[1]); oilG2.position.copy(oilG.position); oilG.material.opacity = .5 * oil * smooth(57.2, 59, t); oilG2.material.opacity = .6 * oil * smooth(57.2, 59, t); oilG.visible = oilG2.visible = oil > .01; }
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [-9, 3.4, 5], .45, '#ffcf9a', [8, 4, 6], 14), Dk(9, '#b0a8cc', '#6a5444', 1.0, '#ffb068', 2.5, [-9, 3.2, 5], .45, '#ffc890', [8, 4, 6], 14),
    Dk(15, '#a0a0c8', '#5a4a48', .95, '#ff9a58', 2.1, [-10, 2.2, 4], .5, '#ffc890', [8, 4, 6], 14), Dk(19.5, '#6a78b0', '#3a3448', .85, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [8, 3, 6], 14),
    Dk(26, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.4, [-9, 6, 6], .45, '#ffc890', [-8, 4, 8], 14), Dk(46, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.2, [-9, 6, 6], .45, '#ffc890', [-8, 4, 8], 14),
    Dk(53, '#5a5c94', '#2e2a40', .78, '#a8a4d8', 1.2, [-9, 4, 6], .45, '#ffb078', [8, 3, 6], 14), Dk(58, '#b0a8cc', '#6a5444', 1.0, '#ffb870', 2.6, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], 14), Dk(62, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 3.2, -5], .45, '#ffcf9a', [-8, 4, 6], 14)];
  const bg = [[0, ['#2a3a7a', '#f0b878']], [9, ['#2a3a7a', '#f0a870']], [15, ['#2a3a7a', '#f08a62']], [19.5, ['#141e4c', '#6a4a70']], [26, ['#050a1e', '#10204a']], [49, ['#050a1e', '#10204a']], [54, ['#1a2858', '#8a6a88']], [58, ['#3a528c', '#f4c890']], [62, ['#4a6aa8', '#f6d8a8']]];
  return { group: g, update, light, bg, far, isaac, jacob, pl: [lightL], state };
}
