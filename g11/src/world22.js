// Episode 22: Genesis 22. God tests Abraham: "Take your son, your only son Isaac, whom you love, and offer him as a burnt offering on one of the mountains that I shall show you" (22:1-2);
// early in the morning Abraham sets out with Isaac, two of his young men, and the wood (22:3); on the third day he sees the place far away and tells the young men to stay: "we will worship and then come back to you" (22:4-5);
// Isaac carries the wood, Abraham the fire and the knife (22:6); Isaac asks "where is the lamb?" and Abraham answers "God himself will provide the lamb" (22:7-8); at the place God had shown him Abraham builds the altar, lays the wood and binds Isaac (22:9);
// as he reaches for the knife the angel of the Lord calls from heaven "Abraham! Do not lay your hand on the boy" (22:10-12); Abraham sees a ram caught in a thicket by its horns and offers it instead (22:13); he names the place "the Lord will provide" (22:14);
// the angel calls a second time from heaven: through your descendants all the nations of the earth shall gain blessing (22:15-18).
// Cinematic interpretation: the floating land, the shape of the mountain and its path, the camp, the donkey, the look of the sky, the way the figures walk and kneel, and the column of soft light (the angel of the Lord and God's word are never shown as figures: only light)
// are not in the text. The film shows the walk, the altar and the raised hand in silhouette and then the light; the knife is never shown striking, and Isaac is not shown harmed. Genesis 22:19-24 is not shown.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, pineGeo, crowdPalette, makeSheep, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf } from './world10.js';
import { makeBird } from './fauna6.js';

export const RIC = 15;
export const TS = [-4.8, .8], TA = [-8.2, 2.8], T3 = [-1.6, -1.8], FIRE = [-3.0, 3.2];
export const AB0 = [-3.4, 3.1], IS0 = [-2.5, 3.6], DON0 = [-1.7, 4.5], BASE = [3.9, 5.3], SUM = [8.6, -.3], THK = [7.35, .75];
export const EV = { a1: 0.6, b1: 8.8, c1: 14.2, c2: 20.1, c3: 24.3, d1: 30.9, d2: 36.6, d3: 42.5, e1: 47.3, e2: 51.8, e3: 55.2 };

// ---------------- terrain: the green camp in the west, a dry plain and a dusty road to the east, and the mountain with its winding path and a flat summit
const ROAD = [[-2.4, 4.8], [-.2, 5.0], [1.6, 5.3], [3.9, 5.3], [5.3, 4.8], [6.7, 4.0], [7.9, 2.9], [8.5, 1.6], [8.6, .4]];
const dRoad = (x, z) => { let m = 99; for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - (ax + u * vx), z - (az + u * vz))); } return m; };
const HILLS = [[-10.5, -5, 1.1, 6], [-11, 7, .8, 5], [8.6, -.7, 3.4, 6.9], [2.5, -9.5, 1.1, 5], [12.4, 6.6, .9, 4.0], [13, -6.5, 1.2, 4.2]];
const FLATS = [[TS[0] + .6, TS[1] + 2.6, .32, 6.4], [SUM[0], SUM[1], 3.02, 2.7], [BASE[0], BASE[1], .36, 2.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1) + smooth(-1, 5, x) * (.15 * Math.sin(x * .7 + z * .35) + .09 * Math.sin(x * 1.5 - z * .9));
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { const dry = smooth(-3.5, 3.5, x); let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d2ba8e').lerp(C3('#c0a676'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .95);
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#b8a47a'), .6 * smooth(3.6, 1.6, Math.hypot(x - FIRE[0], z - FIRE[1]))); b.lerp(C3('#b8a47a'), .5 * smooth(4.2, 1.8, Math.hypot(x - TS[0] - .5, z - TS[1] - 1.5)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.9, .3, dRoad(x, z)));
  b.lerp(C3('#b8a88a'), .7 * smooth(1.5, .9, Math.hypot(x - SUM[0], z - SUM[1])));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = (x, z) => hC(x, z);
export const stage = { gAt, TS, TA, T3, FIRE, AB0, IS0, DON0, BASE, SUM, THK };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
// the altar spot on the summit: Abraham stands on its south side, Isaac lies along it
const ALX = SUM[0], ALZ = SUM[1], ABA = [ALX + .15, ALZ + .62];
// Abraham: at his tent (22:1-2), loads the donkey (22:3), leads the party east (22:3-4), speaks to the young men (22:5), climbs with the fire and the knife (22:6), stands at the altar (22:9-12)
const KA = [[0, AB0[0], AB0[1]], [9.4, AB0[0], AB0[1]], [10.8, DON0[0] - .5, DON0[1] - .25], [12.2, DON0[0] - .5, DON0[1] - .25], [13.6, .5, 5.15], [15.5, BASE[0] + .5, BASE[1] - .1], [21.6, BASE[0] + .5, BASE[1] - .1],
  [23.6, 5.4, 4.72], [25.8, 6.7, 4.05], [27.9, 7.9, 3.0], [29.7, 8.5, 1.7], [31.2, ABA[0] - .35, ABA[1] + .1], [33.2, ABA[0] - .35, ABA[1] + .1], [34.0, ABA[0], ABA[1]], [90, ABA[0], ABA[1]]];
const KI = [[0, IS0[0], IS0[1]], [9.6, IS0[0], IS0[1]], [11.0, DON0[0] + .2, DON0[1] + .35], [12.4, DON0[0] + .2, DON0[1] + .35], [13.9, .2, 5.5], [15.9, BASE[0] - .3, BASE[1] + .3], [21.8, BASE[0] - .3, BASE[1] + .3],
  [24.4, 5.2, 4.95], [26.6, 6.5, 4.3], [28.8, 7.7, 3.2], [30.6, 8.3, 2.0], [32.0, 8.0, .95], [34.2, 8.0, .95], [35.2, ALX + .2, ALZ - .02], [44.4, ALX + .2, ALZ - .02], [46.0, ALX + .85, ALZ + .5], [90, ALX + .85, ALZ + .5]];
const KV = [[[0, -5.7, 4.1], [9.6, -5.7, 4.1], [11.6, -3.4, 4.6], [12.6, -3.4, 4.6], [14.2, -.9, 5.6], [16.0, BASE[0] - 1.0, BASE[1] + .45], [90, BASE[0] - 1.0, BASE[1] + .45]],
  [[0, -5.0, 4.8], [9.8, -5.0, 4.8], [11.8, -3.0, 5.2], [12.8, -3.0, 5.2], [14.4, -.4, 5.9], [16.2, BASE[0] - 1.4, BASE[1] + 1.0], [90, BASE[0] - 1.4, BASE[1] + 1.0]]];
const KD = [[0, DON0[0], DON0[1]], [12.0, DON0[0], DON0[1]], [13.5, -.2, 5.5], [15.6, BASE[0] - .7, BASE[1] + .75], [90, BASE[0] - .7, BASE[1] + .75]];
// the ram: caught in the thicket, then led to the altar by Abraham
const KR = [[0, THK[0] + .3, THK[1] - .1], [48.6, THK[0] + .3, THK[1] - .1], [49.4, THK[0] + .6, THK[1] + .3], [50.6, ALX - .3, ALZ + .95], [90, ALX - .3, ALZ + .95]];
export const abrahamPos = t => { const p = kp(t, KA); return [p.x, gAt(p.x, p.z), p.z]; };
export const isaacPos = t => { const p = kp(t, KI); return [p.x, gAt(p.x, p.z), p.z]; };

// ---------------- little models
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkIsaac = R => person(R, { pants: '#efe4cc', top: '#efe4cc', skin: '#c08258', hair: '#2a1a10', seed: 92 }, .36);
const mkMan = (R, i) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: c.hair, cloth: i === 1 ? '#efe4cc' : undefined, seed: 300 + i }, .44); };
const mkWood = (R, n = 7, len = 1.0) => { const b = new GB(R); for (let k = 0; k < n; k++) b.box(pk(R, ['#6a4a30', '#7a5a38', '#5a3e26', '#8a6a42']), [(R() - .5) * .08, (k % 3) * .055 - .055, (k - n / 2) * .045 + (R() - .5) * .02], [len * (.85 + .3 * R()), .05, .05], [0, (R() - .5) * .12, (R() - .5) * .08], .02);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
const mkKnife = () => { const b = new GB(rng(5)); b.box('#d8dce4', [0, -.58, 0], [.03, .16, .012], [0, 0, 0], .01); b.box('#4a3420', [0, -.47, 0], [.035, .06, .035], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
const mkPot = () => { const g = new THREE.Group(), b = new GB(rng(6)); b.add(G.ico0, '#8a5a3a', [0, -.5, .04], [.06, .05, .06], [0, 0, 0], .02); b.box('#3a2418', [0, -.465, .04], [.07, .02, .07], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; g.add(m);
  const fl = spriteGlow(0, -.44, .04, .22, 0xff9a40, .8); g.add(fl); g.userData.fl = fl; return g; };
const mkRam = rn => { const r = makeSheep(rn); r.body.material = lam;
  for (const s of [-1, 1]) { const b = new GB(rn); b.box('#e8dcc0', [0, 0, 0], [.04, .09, .04], [0, 0, 0], .01); b.box('#d8cca8', [.025 * s, .07, -.02], [.04, .06, .035], [0, 0, .5 * s], .01); b.box('#cdbf9c', [.06 * s, .1, -.05], [.035, .05, .03], [0, 0, 1.0 * s], .01);
    const m = new THREE.Mesh(b.build(), lam); m.position.set(.3, .52, .06 * s); m.rotation.y = s * .25; r.group.add(m); }
  return r; };

// ====================================================================== the world
export function makeMoriah() {
  const R = rng(2222), g = new THREE.Group(), smoke = makeSmoke(4);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9701), RIC, hC, gcC, 30, 80), underRock(rng(9702), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  [[-10.6, -3.6, 2.0], [-8.4, -8.0, 2.2], [-11.8, 8.6, 1.7], [-6.2, -6.4, 1.5]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-9.6, 7.6, 1.1], [-5.2, 8.6, 1.0], [-7.4, 6.2, .9]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  // the thicket where the ram is caught, and dry shrubs and rocks over the plain and the mountain
  tree(THK[0] + .55, THK[1] - .15, .5, 'round', ['#a89a62', '#9a8c58', '#8e8450', '#b4a870']); tree(THK[0] + .15, THK[1] + .35, .36, 'round', ['#a09260', '#8e8450', '#b4a870']);
  for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x < -1.5 || hC(x, z) < .15 || dRoad(x, z) < 1.1 || Math.hypot(x - THK[0], z - THK[1]) < 1.4 || Math.hypot(x - SUM[0], z - SUM[1]) < 1.8) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 44; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dRoad(x, z) < .6 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.2 || Math.hypot(x - SUM[0], z - SUM[1]) < 1.5) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.18 + R() * .3, .12 + R() * .16, .18 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    // stones along the sides of the mountain path
    for (let k = 0; k < 18; k++) { const i = 3 + (k % (ROAD.length - 4)), u = R(), x = lerp(ROAD[i][0], ROAD[i + 1][0], u) + (R() - .5) * 1.4, z = lerp(ROAD[i][1], ROAD[i + 1][1], u) + (R() - .5) * 1.4; if (dRoad(x, z) < .5) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.12 + R() * .2, .08 + R() * .14, .12 + R() * .2], [R() * 3, R() * 3, 0], .05); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  // the camp: three tents and a fire in a stone ring
  [[TS[0], TS[1], .2, '#cdb48c', 1.1], [TA[0], TA[1], .7, '#c2a67a', .8], [T3[0], T3[1], -.4, '#d4c29c', .66]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  { const b = new GB(R); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .24, hC(FIRE[0], FIRE[1]) + .04, FIRE[1] + Math.sin(a) * .24], [.07, .05, .07], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, .5, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const fy = hC(FIRE[0], FIRE[1]) + .22;
  const fireG = spriteGlow(FIRE[0], fy, FIRE[1], 1.0, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy - .02, FIRE[1], .42, 0xffe0a0, 0); g.add(fireG, fireG2);
  smoke.add(FIRE[0], fy + .1, FIRE[1], t => smooth(.4, 1.4, t) * (1 - smooth(10, 12, t)), .24, 2.0);
  const SY = hC(SUM[0], SUM[1]), ALT = SY + .5;                                                  // the altar top
  smoke.add(ALX, ALT + .35, ALZ, t => smooth(50.4, 52.2, t) * (1 - smooth(58.5, 60.4, t)), .28, 2.6); g.add(smoke.mesh);
  const campMotes = makeMotes({ n: 30, area: [1.2, 2.6, 1.2], size: .03, v: .5, seed: 33, color: 0xffb860 }); g.add(campMotes.mesh);
  const sand = makeMotes({ n: 90, area: [16, 1.6, 8], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(sand.mesh);

  // ---- the altar: three courses of rough stone that go up as Abraham builds (22:9), the wood on top, a rope, and the fire when the ram is offered (22:13)
  const alt = new THREE.Group(); alt.position.set(ALX, SY, ALZ); g.add(alt);
  const courses = [[[0, .08, 0], [.9, .17, .5]], [[0, .24, 0], [.78, .16, .44]], [[0, .39, 0], [.66, .15, .38]]].map(([p, s], i) => { const b = new GB(rng(40 + i)); b.box(pk(rng(41 + i), ['#9a8e7c', '#a99c86', '#8a7e6e']), [0, 0, 0], s, [0, .04 * i, 0], .05);
    for (let k = 0; k < 3; k++) b.add(G.ico0, pk(rng(50 + k), ['#9a8e7c', '#a99c86', '#85796a']), [(k - 1) * s[0] * .32, .02, (k % 2 ? .1 : -.1)], [s[0] * .2, s[1] * .55, s[2] * .22], [0, k, 0], .05);
    const m = new THREE.Mesh(b.build(), lam); m.position.set(p[0], p[1], p[2]); m.castShadow = true; m.receiveShadow = true; alt.add(m); return m; });
  const altWood = mkWood(rng(61), 8, .72); altWood.position.set(0, .5, 0); alt.add(altWood); altWood.visible = false;
  const rope = new THREE.Mesh(new THREE.BoxGeometry(.04, .02, .16), new THREE.MeshLambertMaterial({ color: 0xa88a58 })); rope.visible = false; g.add(rope);
  const altG = spriteGlow(ALX, ALT + .3, ALZ, 1.1, 0xff9a40, 0), altG2 = spriteGlow(ALX, ALT + .26, ALZ, .46, 0xffe0a0, 0); g.add(altG, altG2);
  const altL = new THREE.PointLight(0xffa860, 0, 6, 1.6);

  // ---- the people and the animals
  const abraham = mkAbraham(rng(83)), isaac = mkIsaac(rng(85)), men = [0, 1].map(i => mkMan(rng(90 + i), i)); [abraham, isaac, ...men].forEach(o => g.add(o.group));
  const don = makeDonkey(rng(130)); don.group.scale.setScalar(.5); g.add(don.group);
  const wDon = mkWood(rng(63), 7, .56); wDon.position.set(0, .8, 0); don.group.add(wDon);
  const wIsa = mkWood(rng(64), 8, .9); wIsa.position.set(0, .62, -.17); isaac.group.add(wIsa); wIsa.visible = false;
  const knife = mkKnife(); abraham.arms[1].add(knife); knife.visible = false; const pot = mkPot(); abraham.arms[0].add(pot); pot.visible = false;
  const ram = mkRam(rng(150)); ram.group.scale.setScalar(.62); g.add(ram.group);
  const dust = Array.from({ length: 5 }, () => { const s = spriteGlow(0, 0, 0, .8, 0xe8d4a8, 0); s.material.blending = THREE.NormalBlending; g.add(s); return s; });
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 4 + i * 1.3, h: 7 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });

  // ---- light: God's word to Abraham (22:1-2), the mountain, the angel of the Lord (22:11-12, 15-18) are only light (columns)
  const mkCol = (rad, hgt) => { const o = { beam: shaft(hgt, rad * .34, rad * .46, [1, .92, .7], .3, .85), beamG: shaft(hgt, rad * 1.1, rad * 1.35, [1, .86, .55], .12, .45), pl: pool(rad * 2.2, 0xffe0a0, 0), gl: spriteGlow(0, 0, 0, rad * 1.8, 0xffd890, 0), gl2: spriteGlow(0, 0, 0, rad * .7, 0xfff4d0, 0), lt: new THREE.PointLight(0xffd890, 0, 11, 1.5) };
    [o.beam, o.beamG].forEach(m => { m.material.opacity = 0; m.visible = false; g.add(m); }); g.add(o.pl, o.gl, o.gl2); return o; };
  const colA = mkCol(.8, 30), colM = mkCol(1.0, 30), colS = mkCol(1.0, 30);
  const setCol = (o, k, x, y, z, cam, nf0 = 1) => { const fk = .93 + .07 * Math.sin(k * 0 + 2.3), dc = cam ? Math.hypot(cam.x - x, cam.z - z, (cam.y - y - 1.5) * .5) : 14, nf = (.4 + .6 * smooth(4, 13, dc)) * nf0;
    [o.beam, o.beamG, o.pl].forEach(m => m.position.set(x, y + (m === o.pl ? .05 : 0), z)); o.beam.visible = o.beamG.visible = k > .01; o.beam.material.opacity = .12 * k * nf; o.beamG.material.opacity = .035 * k * nf; o.pl.material.opacity = .15 * k * (.5 + .5 * nf); o.pl.visible = k > .01;
    o.gl.position.set(x, y + .55, z); o.gl2.position.set(x, y + .5, z); o.gl.material.opacity = .26 * k * (.55 + .45 * nf); o.gl2.material.opacity = .22 * k * (.55 + .45 * nf); o.gl.visible = o.gl2.visible = k > .01; o.lt.position.set(x + .3, y + 1.1, z + .3); o.lt.intensity = 3.6 * k; };
  const rings = [0, 1, 2].map(() => { const r = ringMesh(1, .14, 0xffe8b0, 0); g.add(r); return r; });
  const lMotes = makeMotes({ n: 90, area: [2.4, 5.5, 2.4], size: .05, v: .45, seed: 71, color: 0xffe3a0 }); g.add(lMotes.mesh);
  const many = makeMotes({ n: 230, area: [22, 12, 18], size: .07, v: .26, seed: 73, color: 0xffe9b0 }); g.add(many.mesh);
  const lightL = colS.lt, campL = new THREE.PointLight(0xff9a50, 0, 7, 1.7);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);

  // ---- sky and far land
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const CLOUD = [[0, '#58588a'], [8, '#b8a0a0'], [10, '#f0d8c0'], [20, '#fbf6ea'], [30, '#f6e4c4'], [36, '#f8e6c0'], [42, '#fbf0d8'], [47, '#f6e4c4'], [55, '#f4e0bc'], [60, '#e4ccb4'], [90, '#b8aeb0']];
  const CEM = [[0, '#2a2a48'], [8, '#4a3e4a'], [14, '#6a6258'], [30, '#6a5a48'], [42, '#7a6a58'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const SMK = [[0, '#a8a0a0'], [30, '#d8c6b0'], [50, '#cfc4b8'], [90, '#b8a898']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const state = { abraham: AB0.slice(), isaac: IS0.slice() };
  const v3 = new THREE.Vector3();

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun: the dusk of the first evening (west), the sunrise (east), then a bright glow always behind the view (d1 to d3: silhouettes), and the warm one at the end
    { const dusk = ON(t, -1, 0.2, 5.5, 8.4), rise = ON(t, 8.6, 9.6, 13.0, 15.0), back = ON(t, 34.6, 36.4, 46.0, 48.0), warm = ON(t, 54.0, 56.0, 89, 90), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + (rise > .01 ? 5 : 9), cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(dusk * .6, rise, back * .9, warm * .8); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01; }
    const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), fon = smooth(.2, 1.2, t) * (1 - smooth(9.4, 12.0, t));
    fireG.material.opacity = .5 * fon * fl; fireG2.material.opacity = .4 * fon; fireG.visible = fireG2.visible = fon > .01;
    campL.position.set(FIRE[0], fy + .6, FIRE[1]); campL.intensity = 5 * fon * (.85 + .15 * fl);
    campMotes.update(t, .8 * fon, [FIRE[0], fy, FIRE[1]]); smoke.update(t, colAt(SMK, t)); sand.update(t, .5 * (.5 + .5 * ON(t, 12, 14, 52, 54)), [1.5, .1, 3.8]);
    // the altar: three courses go up while Abraham builds (22:9); wood, rope, and the fire at the offering (22:13)
    { courses.forEach((m, i) => { const u = ease.outCubic(seg(t, 31.4 + i * .55, 32.0 + i * .55)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
      const w = smooth(33.0, 33.5, t); altWood.visible = w > .01; altWood.scale.setScalar(Math.max(.001, w)); altWood.position.y = .5 + (1 - w) * .2;
      const af = smooth(50.7, 51.6, t) * (1 - smooth(58.8, 60.2, t)), ff = .75 + .25 * Math.sin(t * 11) * Math.sin(t * 5.7);
      altG.material.opacity = .55 * af * ff; altG2.material.opacity = .45 * af; altG.visible = altG2.visible = af > .01; altL.position.set(ALX, ALT + .6, ALZ); altL.intensity = 5 * af * ff; altG.scale.set(1.1 + .2 * ff, 1.1 + .2 * ff, 1); }

    // Abraham: at his tent, God's word (22:1-2), loads the donkey (22:3), speaks to the young men (22:5), takes the fire and the knife (22:6), builds the altar (22:9), raises his hand and stops (22:10-12), sees the ram (22:13)
    { const p = kp(t, KA), mv = p.mv, climb = t > 21.6 && t < 31.4; let ry = headZ(p.vx, p.vz), ex = {}, y0 = 0, s = 1;
      if (!mv) { ry = t < 9.6 ? headZ(1, -.4) : (t < 21.6 ? headZ(1, .1) : (t < 33.0 ? headZ(0, -1) : headZ(0, -1)));
        ex = GE(t, [[1.0, 2.2, 6.4, 8.2, { lx: .09, a0x: -.25, a1x: -.25 }], [3.0, 3.8, 7.0, 8.0, { a0x: -.9, a1x: -.9, a0z: -.2, a1z: .2 }],              // God's word: he listens, then opens his hands
          [10.2, 10.8, 12.0, 12.6, { lx: .2, a0x: -.7, a1x: -.7 }], [17.0, 17.6, 19.2, 19.8, { a0x: -1.6, a0z: -.15, lx: -.04 }],                                    // loads the donkey, then points to the place
          [19.6, 20.4, 21.2, 21.8, { lx: .16, a0x: -.8, a1x: -.8 }],                                                                                               // puts the wood on Isaac
          [31.4, 32.0, 32.8, 33.4, { lx: .3, a0x: -.9, a1x: -.9 }], [33.4, 33.8, 34.2, 34.8, { lx: .1, a0x: -.4, a1x: -.4 }],                                     // lays the stones, then the wood, then binds Isaac
          [37.4, 38.4, 41.0, 42.2, { a1x: -3.0, a1z: .12, lx: -.05 }],                                                                                             // the raised hand (22:10), held until the angel's call is over
          [42.2, 43.4, 45.8, 46.8, { a0x: -1.25, a1x: -1.25, a0z: -.3, a1z: .3, lx: .05 }],                                                                        // opens his arms to Isaac (22:12)
          [47.4, 48.2, 49.0, 49.8, { lx: .08, a1x: -1.0 }], [51.4, 52.4, 54.0, 55.0, { a0x: -1.2, a1x: -1.2, a0z: -.5, a1z: .5 }], [55.6, 56.4, 59, 61, { a0x: -.6, a1x: -.6, lx: -.16 }]]); }
      ex.s = s; fig(abraham, p.x, p.z, ry, mv, t, 1.1, ex, climb ? 6.8 : 9.5, y0); state.abraham = [p.x, gAt(p.x, p.z), p.z];
      knife.visible = t > 20.8 && t < 43.6; pot.visible = t > 20.8 && t < 34.0; pot.userData.fl && (pot.children[1].material.opacity = .7 + .2 * Math.sin(t * 12)); }
    // Isaac: sits by the fire, loads, walks behind his father carrying the wood (22:6), asks about the lamb (22:7), is bound and laid on the wood (22:9), is released (22:12)
    { const p = kp(t, KI), mv = p.mv, climb = t > 21.8 && t < 35.2, lie = smooth(34.4, 35.2, t) * (1 - smooth(43.4, 44.6, t)); let ry = headZ(p.vx, p.vz), ex = {}, y0 = 0;
      wIsa.visible = t > 20.9 && t < 32.4; wDon.visible = t < 20.8;
      if (lie > .002) { ry = Math.PI / 2; ex = { lx: -1.5 * lie, a0x: -.1 * lie, a1x: -.1 * lie, a0z: -.3 * lie, a1z: .3 * lie }; y0 = ALT - gAt(p.x, p.z) + .1 * lie - .02; }
      else if (t > 35 && t < 46.4) { y0 = (ALT - gAt(p.x, p.z) - .02) * (1 - smooth(44.6, 45.8, t)); ry = t < 44.6 ? headZ(0, -1) : headZ(-.6, -.8); ex = GE(t, [[43.4, 44.4, 45.8, 46.8, { a0x: -.3, a1x: -.3 }]]); }
      else if (!mv) { ry = t < 9.8 ? headZ(1, -.3) : (t < 21.8 ? headZ(1, .2) : headZ(-.6, -.8)); ex = GE(t, [[0, 1, 9, 9.8, { lx: .12, a0x: -.5, a1x: -.5 }], [24.8, 25.4, 26.4, 27.0, { lx: .0 }], [43.4, 44.4, 45.8, 46.8, { a0x: -1.2, a1x: -1.2, a0z: -.3, a1z: .3 }]]); }
      isaac.group.visible = true; fig(isaac, p.x, p.z, ry, mv && lie < .05, t, 2.2, ex, climb ? 7.2 : 9.5, y0); state.isaac = [p.x, gAt(p.x, p.z), p.z];
      rope.visible = lie > .5 && t < 43.6; rope.position.set(ALX + .02, ALT + .15, ALZ); rope.rotation.set(0, 0, 0); }
    // the two young men and the donkey: with the party along the road, then they stay at the foot of the mountain (22:5)
    men.forEach((m, i) => { const p = kp(t, KV[i]), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, s = 1;
      if (!mv) { ry = t < 10 ? headZ(1, -.2) : headZ(-.7, -1); if (t > 16.6) { const sit = smooth(17.6, 18.4, t); s = 1 - .26 * sit; ex = { s }; } }
      fig(m, p.x, p.z, ry, mv, t, 4 + i, ex, 9.5); });
    { const p = kp(t, KD), mv = p.mv; const ry = mv ? headZ(p.vx, p.vz) : headZ(1, .1); don.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); don.group.rotation.y = ry - Math.PI / 2; if (mv) walkLegs(don.legs, t, 5.2, .32); }
    // the ram caught in the thicket (22:13), led to the altar
    { const p = kp(t, KR), mv = p.mv, vis = t > 47.0 && t < 51.0; ram.group.visible = vis; ram.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); ram.group.rotation.y = (mv ? headZ(p.vx, p.vz) : headZ(-.6, .3)) - Math.PI / 2; if (mv) walkLegs(ram.legs, t, 5.0, .35); }
    // the dust on the road
    { const p = kp(t, KA), mv = p.mv && t > 12 && t < 16; dust.forEach((d, k) => { const tt = (t * 2.6 + k / dust.length) % 1, on = mv ? Math.sin(Math.PI * tt) : 0; d.position.set(p.x - .35 - .3 * tt + .05 * k, gAt(p.x, p.z) + .08 + .22 * tt, p.z + .04 * Math.sin(k * 3)); d.material.opacity = .3 * on; d.scale.setScalar(.35 + .8 * tt); d.visible = on > .01; }); }

    // the columns of light: the mountain God will show (22:2), his word to Abraham (22:1-2), the angel of the Lord (22:11-12), the second call from heaven (22:15-18)
    { const kM = Math.max(ON(t, -1, .3, 3.6, 5.8), .85 * ON(t, 14.6, 15.4, 18.0, 19.4)), kA = ON(t, .8, 1.9, 6.8, 8.4), kS = Math.max(ON(t, 38.8, 39.6, 46.6, 48.4), .8 * ON(t, 54.6, 55.8, 59.0, 60.4)), fk = .93 + .07 * Math.sin(t * 2.3);
      setCol(colM, kM * fk, SUM[0], SY, SUM[1], cam, 2.6); setCol(colA, kA * fk, AB0[0] - .1, gAt(AB0[0], AB0[1]), AB0[1] - .2, cam); setCol(colS, kS * fk, ALX, SY, ALZ, cam, 1.4); colM.lt.intensity = 0; colA.lt.intensity = 0;
      rings.forEach((r, i) => { const t0 = [39.0, 41.4, 55.6][i], u = seg(t, t0, t0 + 2.6), o = Math.sin(Math.PI * Math.min(1, u)) * kS; r.position.set(ALX, SY + .07, ALZ); r.scale.setScalar(Math.max(.001, .3 + 3.2 * ease.outCubic(u))); r.material.opacity = .34 * o; r.visible = o > .01 && t >= t0 - .1; });
      lMotes.update(t, .8 * kS, [ALX, SY, ALZ]); lMotes.mesh.position.set(0, 0, 0);
      many.update(t, .85 * ON(t, 55.6, 57.6, 59.2, 60.8), [ALX - 2, SY - .5, ALZ - 4]); }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t > 54.5 && t < 61; b.group.position.set(ALX - 1 + Math.cos(a) * b.r, SY + 3 + b.h * .3 + Math.sin(t * .5 + i), ALZ - 5 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 7 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(6, '#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(8.8, '#7a88c0', '#4a4048', .85, '#ffb888', 2.1, [10, 2.6, 6], .5, '#ffc890', [-8, 5, 6], 14), Dk(12, '#9aa8d0', '#645448', .95, '#ffd09a', 2.3, [10, 3.8, 6], .5, '#ffcf9a', [-8, 5, 6], 14),
    Dk(15.5, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [4, 10, 5], .4, '#ffe8c8', [-8, 5, 6], 14), Dk(29, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [-4, 9, 6], .4, '#ffe8c8', [8, 5, 6], 14),
    Dk(31, '#b0b4d0', '#7a6650', 1.0, '#ffd8a0', 2.5, [-6, 6, 6], .5, '#ffcf90', [8, 3, 6], 9), Dk(35.6, '#8c92bc', '#5a4a40', .8, '#ffd890', 2.7, [11, 3.4, .5], .3, '#ffcf90', [-8, 3, 4], 8),
    Dk(41.4, '#8c92bc', '#5a4a40', .8, '#ffd890', 2.7, [11, 3.4, .5], .3, '#ffcf90', [-8, 3, 4], 8), Dk(43.0, '#c0c8e0', '#8a7a68', 1.1, '#fff0d0', 2.8, [-4, 9, 3], .55, '#ffe8c0', [6, 4, 8], 9),
    Dk(47.5, '#b0b8d4', '#7a6a58', 1.0, '#ffd8a0', 2.5, [-9, 5, 6], .55, '#ffd890', [8, 3, 6], 14), Dk(55.4, '#a8b4d4', '#6a5a4c', 1.0, '#ffd2a0', 2.3, [-10, 4.2, 6], .55, '#ffd8a8', [9, 3, 6], 14),
    Dk(60, '#a0a4b8', '#5c5250', 1.0, '#f4d4a8', 1.9, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#0c1636', '#3c3868']], [6, ['#10204a', '#5a4a70']], [8.6, ['#3a5a9a', '#f0b878']], [12, ['#4a78b8', '#f4d4a4']], [15.5, ['#5a88c4', '#f6ecd0']], [29, ['#5a88c4', '#f6e4c0']], [31, ['#5a80b8', '#f4d4a4']],
    [35.6, ['#6a7fb0', '#fbe6b0']], [41.4, ['#6a7fb0', '#fbe6b0']], [43.0, ['#7aa0cc', '#fbeccc']], [47.5, ['#6a90c0', '#f4dcb0']], [55.4, ['#4a78b8', '#f4cc98']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, abraham, isaac, pl: [colS.lt, campL, altL], state };
}
