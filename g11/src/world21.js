// Episode 21: Genesis 21. The Lord keeps his promise: Sarah bears Abraham a son in his old age, at the time God had set (21:1-2); Abraham names him Isaac (21:3); Sarah says "God has made me laugh; everyone who hears will laugh with me" (21:6);
// on the day Isaac is weaned Abraham gives a great feast (21:8); Sarah sees the son of Hagar the Egyptian playing with her son Isaac and asks Abraham to cast out the slave woman and her son (21:9-10); the matter is very distressing to Abraham (21:11);
// God tells Abraham to listen to Sarah, and promises that the son of the slave woman will also become a nation (21:12-13); early in the morning Abraham gives Hagar bread and a skin of water and sends her away with the boy (21:14);
// in the wilderness of Beer-sheba the water in the skin is gone; she puts the boy under one of the bushes and sits down a bowshot away, saying "do not let me look on the death of the child", and weeps (21:14-16);
// God hears the voice of the boy, and the angel of God calls to Hagar from heaven: "Do not be afraid" (21:17); God opens her eyes and she sees a well of water; she fills the skin and gives the boy a drink (21:19); God is with the boy as he grows up (21:20).
// Cinematic interpretation: the floating camp, the shape of the tents, the dry wilderness and its single bush, the look of the sky, the way the figures walk, sit and kneel, the toddler and the friends who gather round Sarah, the column of soft light
// (the angel of God and the word to Abraham are never shown as figures: only light) and the boy standing taller at the end are not in the text. The film shows the well appearing where Hagar sits; it does not say how far the well was. Genesis 21:22-34 is not shown.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, pineGeo, crowdPalette } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf } from './world10.js';
import { makeBird } from './fauna6.js';

export const RIC = 15;
export const TS = [-4.8, .8], TA = [-8.2, 2.8], T3 = [-1.6, -1.8], FIRE = [-3.0, 3.2], SPR = [6.0, 5.6];
export const SA0 = [-4.4, 2.5], AB0 = [-3.2, 3.0], MAT = [-3.0, 3.7], HG1 = [-3.3, 4.5];
export const BU = [4.5, 4.2], HGS = [3.0, 6.3], LP = [3.8, 5.2];
export const GP = [[-3.9, 3.7], [-2.1, 3.4], [-2.8, 4.5]];
export const EV = { a1: 0.8, b1: 7.9, b2: 9.9, c1: 15.4, c2: 22.8, d1: 30.4, d2: 37.2, e1: 43.4, e2: 50.4, e3: 55.2 };

// ---------------- terrain: the green camp in the west, dry dunes and a dusty road to the east, a dry hollow where the well will be
const ROAD = [[-2.4, 4.8], [-.2, 5.0], [1.6, 5.3], [3.4, 5.6], [5.0, 5.7]];
const dRoad = (x, z) => { let m = 99; for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - (ax + u * vx), z - (az + u * vz))); } return m; };
const HILLS = [[-10.5, -5, 1.1, 6], [-11, 7, .8, 5], [9.8, -4.6, 1.7, 5.4], [2.5, -9.5, 1.1, 5], [11.5, 7.0, .9, 4.0]];
const FLATS = [[TS[0] + .6, TS[1] + 2.6, .32, 6.4], [SPR[0], SPR[1], .2, 3.4], [BU[0], BU[1], .27, 3.0], [HGS[0], HGS[1], .27, 2.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1) + smooth(-1, 5, x) * (.15 * Math.sin(x * .7 + z * .35) + .09 * Math.sin(x * 1.5 - z * .9));
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  h -= .1 * smooth(1.5, .2, Math.hypot(x - SPR[0], z - SPR[1]));                                  // the dry hollow
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { const dry = smooth(-3.5, 3.5, x); let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d2ba8e').lerp(C3('#c0a676'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .95);
  if (y > .95) b.lerp(C3('#9a8a70'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#b8a47a'), .6 * smooth(3.6, 1.6, Math.hypot(x - FIRE[0], z - FIRE[1]))); b.lerp(C3('#b8a47a'), .5 * smooth(4.2, 1.8, Math.hypot(x - TS[0] - .5, z - TS[1] - 1.5)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.9, .3, dRoad(x, z)));
  b.lerp(C3('#c4a468'), .5 * smooth(1.6, .3, Math.hypot(x - SPR[0], z - SPR[1])));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = (x, z) => hC(x, z);
export const stage = { gAt, TS, TA, T3, FIRE, SPR, SA0, AB0, MAT, HG1, BU, HGS, LP, GP };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
// Sarah: at her tent with the baby; steps to Abraham when she asks him to send Hagar away (21:10)
const KS = [[0, SA0[0], SA0[1]], [18.6, SA0[0], SA0[1]], [20.2, -3.8, 2.7], [90, -3.8, 2.7]];
// Abraham: beside Sarah; early in the morning he goes to Hagar with the bread and water (21:14)
const KA = [[0, AB0[0], AB0[1]], [30.4, AB0[0], AB0[1]], [32.0, HG1[0], HG1[1]], [34.0, HG1[0], HG1[1]], [90, HG1[0], HG1[1]]];
// Hagar: near her tent, comes to meet Abraham, walks east along the road into the wilderness, sits a bowshot from the boy, goes to the well and back to the boy
const KH = [[0, -7.4, 3.3], [27.0, -7.4, 3.3], [30.0, -2.4, 4.8], [33.0, -2.4, 4.8], [37.0, 1.4, 5.3], [38.8, HGS[0], HGS[1]], [50.6, HGS[0], HGS[1]], [52.4, SPR[0] - .9, SPR[1] + .1], [54.0, SPR[0] - .9, SPR[1] + .1], [55.4, BU[0] + .6, BU[1] + 1.0], [90, BU[0] + .6, BU[1] + 1.0]];
// Ishmael: plays near his mother, plays with the toddler at the feast, goes with his mother, lies under the bush, sits up when he drinks
const KI = [[0, -7.0, 3.8], [14.8, -3.9, 4.6], [16.0, -3.2, 4.0], [17.4, -2.4, 4.7], [18.8, -2.9, 3.9], [20.2, -2.2, 4.4], [24.0, -2.2, 4.4], [27.0, -2.0, 4.9], [30.0, -2.0, 5.0], [33.0, -2.0, 5.0], [37.0, 1.8, 5.1], [38.8, BU[0] - .9, BU[1] + .4], [39.9, BU[0] + .1, BU[1] + .9], [57.0, BU[0] + .1, BU[1] + .9], [59.2, 5.4, 5.6], [90, 5.4, 5.6]];
const KT = [[0, -3.8, 3.2], [14.8, -3.5, 4.3], [16.0, -3.0, 4.0], [17.4, -2.2, 4.6], [18.8, -2.7, 3.8], [20.2, -3.4, 3.1], [90, -3.6, 3.0]];
const KG = [[[0, -1.0, 5.3], [9.8, -1.0, 5.3], [12.4, GP[0][0], GP[0][1]], [28.0, GP[0][0], GP[0][1]], [29.8, -8.6, 4.6], [90, -8.6, 4.6]], [[0, -.6, 5.6], [10.3, -.6, 5.6], [12.8, GP[1][0], GP[1][1]], [28.2, GP[1][0], GP[1][1]], [30.0, -9.2, 5.2], [90, -9.2, 5.2]], [[0, -1.4, 5.0], [10.6, -1.4, 5.0], [13.0, GP[2][0], GP[2][1]], [28.4, GP[2][0], GP[2][1]], [30.2, -8.0, 5.6], [90, -8.0, 5.6]]];
export const sarahPos = t => { const p = kp(t, KS); return [p.x, gAt(p.x, p.z), p.z]; };
export const abrahamPos = t => { const p = kp(t, KA); return [p.x, gAt(p.x, p.z), p.z]; };
export const hagarPos = t => { const p = kp(t, KH); return [p.x, gAt(p.x, p.z), p.z]; };
export const ishmaelPos = t => { const p = kp(t, KI); return [p.x, gAt(p.x, p.z), p.z]; };

// ---------------- little models
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkSarah = R => person(R, { pants: '#d9ccb0', top: '#5e7fa6', skin: '#c98d62', hair: '#2a1a10', long: true, cloth: '#efe4cc', seed: 53 }, .45);
const mkHagar = R => person(R, { pants: '#3f6a78', top: '#c9a15a', skin: '#8a5a3a', hair: '#1f160d', cloth: '#2f4f72', long: true, sash: '#b5654a', seed: 71 }, .46);
const mkIshmael = R => person(R, { pants: '#8a6a3a', top: '#c9a15a', skin: '#9a6a44', hair: '#1f160d', seed: 91 }, .3);
const mkIsaac = R => person(R, { pants: '#efe4cc', top: '#efe4cc', skin: '#c08258', hair: '#2a1a10', seed: 92 }, .17);
const mkGuest = (R, i) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: c.hair, long: i === 1, cloth: i === 1 ? '#efe4cc' : undefined, beard: i === 0 ? c.hair : undefined, seed: 300 + i }, .46); };
const mkBaby = () => { const g = new THREE.Group(), b = new GB(rng(9)); b.box('#efe4cc', [0, 0, 0], [.2, .1, .11], [0, 0, 0], .02); b.add(G.ico0, '#c08258', [-.1, .03, 0], [.045, .045, .045], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; g.add(m); g.position.set(0, .56, .2); return g; };
const mkSkin = () => { const g = new THREE.Group(), b = new GB(rng(19)); b.add(G.ico1, '#8a5a38', [0, 0, 0], [.07, .1, .05], [0, 0, 0], .03); b.add(G.ico0, '#d6b070', [.1, -.02, .0], [.07, .03, .06], [0, 0, .3], .02); b.add(G.cylT, '#6a4426', [0, .1, 0], [.02, .04, .02], [0, 0, 0], .01);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; g.add(m); return g; };

// ====================================================================== the world
export function makeWilderness() {
  const R = rng(2121), g = new THREE.Group(), smoke = makeSmoke(4);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9601), RIC, hC, gcC, 30, 80), underRock(rng(9602), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  [[-10.6, -3.6, 2.0], [-8.4, -8.0, 2.2], [-11.6, 5.2, 1.7], [-6.2, -6.4, 1.5]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-9.6, 7.6, 1.1], [-5.2, 8.6, 1.0]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  // the one bush where the boy is laid, and a few dry shrubs and rocks over the dunes
  tree(BU[0], BU[1] - .1, 1.05, 'round', ['#a89a62', '#9a8c58', '#8e8450', '#b4a870']);
  for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x < -1.5 || hC(x, z) < .15 || dRoad(x, z) < 1.1 || Math.hypot(x - SPR[0], z - SPR[1]) < 2.6 || Math.hypot(x - BU[0], z - BU[1]) < 1.6 || Math.hypot(x - HGS[0], z - HGS[1]) < 1.4) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 34; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dRoad(x, z) < .6 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.2 || Math.hypot(x - SPR[0], z - SPR[1]) < 1.5 || Math.hypot(x - BU[0], z - BU[1]) < 1.1 || Math.hypot(x - HGS[0], z - HGS[1]) < 1.0) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.18 + R() * .3, .12 + R() * .16, .18 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    // the stones round the hollow where the well will be
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + .1, rr = 1.22 + .06 * Math.sin(k * 2.3); b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [SPR[0] + Math.cos(a) * rr, hC(SPR[0] + Math.cos(a) * rr, SPR[1] + Math.sin(a) * rr * .96) + .05, SPR[1] + Math.sin(a) * rr * .96], [.13, .09, .12], [R() * 3, R() * 3, 0], .05); }
    // the feast mat with bowls and loaves
    b.box('#a8744a', [MAT[0], hC(MAT[0], MAT[1]) + .02, MAT[1]], [1.5, .03, .9], [0, .15, 0], .01);
    for (let k = 0; k < 5; k++) b.add(G.ico0, pk(R, ['#d6b070', '#c9a15a', '#e0c48a']), [MAT[0] - .5 + k * .26, hC(MAT[0], MAT[1]) + .07, MAT[1] + (k % 2 ? .12 : -.14)], [.09, .04, .09], [0, R() * 3, 0], .02);
    for (let k = 0; k < 3; k++) b.add(G.cylT, pk(R, ['#9a6a44', '#7a5232']), [MAT[0] - .3 + k * .45, hC(MAT[0], MAT[1]) + .07, MAT[1] + .02], [.07, .09, .07], [0, 0, 0], .02);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  // the water of the well (not there until God opens Hagar's eyes) and a rim of stones round it
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ color: 0x78a8c6, transparent: true, opacity: 0, toneMapped: false })); water.rotation.x = -Math.PI / 2; water.position.set(SPR[0], hC(SPR[0], SPR[1]) + .035, SPR[1]); water.renderOrder = 2; water.visible = false; ca.add(water);
  const glint = spriteGlow(SPR[0] + .3, hC(SPR[0], SPR[1]) + .12, SPR[1] - .2, .9, 0xfff0c8, 0); ca.add(glint);
  const ripples = [0, 1, 2].map(() => { const r = ringMesh(1, .06, 0xe8f4ff, 0); r.position.set(SPR[0], hC(SPR[0], SPR[1]) + .06, SPR[1]); g.add(r); return r; });
  // the camp: three tents and a fire in a stone ring
  [[TS[0], TS[1], .2, '#cdb48c', 1.1], [TA[0], TA[1], .7, '#c2a67a', .8], [T3[0], T3[1], -.4, '#d4c29c', .66]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  { const b = new GB(R); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .24, hC(FIRE[0], FIRE[1]) + .04, FIRE[1] + Math.sin(a) * .24], [.07, .05, .07], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, .5, 0], .01);
    b.add(G.cylT, '#9a6a44', [FIRE[0] + 1.0, hC(FIRE[0] + 1.0, FIRE[1] - .9), FIRE[1] - .9], [.07, .17, .07], [0, 0, 0], .02);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const fy = hC(FIRE[0], FIRE[1]) + .22;
  const fireG = spriteGlow(FIRE[0], fy, FIRE[1], 1.0, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy - .02, FIRE[1], .42, 0xffe0a0, 0); g.add(fireG, fireG2);
  smoke.add(FIRE[0], fy + .1, FIRE[1], t => smooth(.4, 1.4, t) * (1 - smooth(34, 36, t)), .24, 2.0); g.add(smoke.mesh);
  const campMotes = makeMotes({ n: 30, area: [1.2, 2.6, 1.2], size: .03, v: .5, seed: 33, color: 0xffb860 }); g.add(campMotes.mesh);
  const sand = makeMotes({ n: 90, area: [16, 1.6, 8], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(sand.mesh);
  const joy = makeMotes({ n: 120, area: [3.4, 3.4, 3.4], size: .05, v: .5, seed: 37, color: 0xffe3a0 }); g.add(joy.mesh);

  // ---- the people
  const sarah = mkSarah(rng(81)), hagar = mkHagar(rng(82)), abraham = mkAbraham(rng(83)), ishmael = mkIshmael(rng(84)), isaac = mkIsaac(rng(85)), guests = [0, 1, 2].map(i => mkGuest(rng(90 + i), i));
  [sarah, hagar, abraham, ishmael, isaac, ...guests].forEach(o => g.add(o.group));
  const baby = mkBaby(); sarah.group.add(baby); const wskin = mkSkin(); g.add(wskin);
  const dust = Array.from({ length: 5 }, () => { const s = spriteGlow(0, 0, 0, .8, 0xe8d4a8, 0); s.material.blending = THREE.NormalBlending; g.add(s); return s; });
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 4 + i * 1.3, h: 6 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });

  // ---- light: the word to Abraham (21:12) and the angel of God (21:17) are only light; the same column moves between the two places
  const beam = shaft(26, .34, .46, [1, .92, .7], .3, .85), beamG = shaft(26, 1.1, 1.35, [1, .86, .55], .12, .45); [beam, beamG].forEach(m => { m.material.opacity = 0; m.visible = false; g.add(m); });
  const lPool = pool(2.2, 0xffe0a0, 0); g.add(lPool);
  const lGlow = spriteGlow(0, 0, 0, 1.8, 0xffd890, 0), lGlow2 = spriteGlow(0, 0, 0, .7, 0xfff4d0, 0); g.add(lGlow, lGlow2);
  const rings = [0, 1, 2].map(() => { const r = ringMesh(1, .14, 0xffe8b0, 0); g.add(r); return r; });
  const lMotes = makeMotes({ n: 80, area: [2.6, 5.5, 2.6], size: .05, v: .45, seed: 71, color: 0xffe3a0 }); g.add(lMotes.mesh);
  const many = makeMotes({ n: 230, area: [22, 12, 18], size: .07, v: .26, seed: 73, color: 0xffe9b0 }); g.add(many.mesh);
  const lightL = new THREE.PointLight(0xffd890, 0, 11, 1.5), campL = new THREE.PointLight(0xff9a50, 0, 7, 1.7);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);

  // ---- sky and far land
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const CLOUD = [[0, '#e0b898'], [8, '#f4ecde'], [20, '#fbf6ea'], [28, '#f2dcb8'], [31, '#e8c4a4'], [37, '#f6ecd8'], [44, '#e8dcc8'], [50, '#fbf2e0'], [56, '#f4e0bc'], [60, '#e4ccb4'], [90, '#b8aeb0']];
  const CEM = [[0, '#5a4a4a'], [8, '#6a6258'], [30, '#6a5a48'], [44, '#6a6258'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const SMK = [[0, '#c8b8a8'], [30, '#d8c6b0'], [90, '#b8a898']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  // gestures: [[rise a, full b, hold until c, gone d, {pose fields}], ...] summed by weight
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const state = { hagar: HGS.slice(), sarah: SA0.slice(), ish: BU.slice() };
  const lpAt = t => t < 40 ? [AB0[0] - .1, gAt(AB0[0], AB0[1]), AB0[1] - .2] : [LP[0], gAt(LP[0], LP[1]), LP[1]];

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun of the first morning (east), of the second morning, and the warm one at the end
    { const sk = ON(t, -1, 0.2, 4.5, 8.0), sk2 = ON(t, 29.5, 30.5, 35.0, 37.0), sk3 = ON(t, 55.0, 57.0, 89, 90), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      sunS.position.set(cx + 150 * (sk3 > Math.max(sk, sk2) ? -1 : 1), cy + 7, cz + 30); sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(sk, sk2, sk3 * .8); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01; }
    const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), fon = smooth(.2, 1.2, t) * (1 - smooth(34, 36, t)) * (1 - .5 * smooth(8, 12, t));
    fireG.material.opacity = .5 * fon * fl; fireG2.material.opacity = .4 * fon; fireG.visible = fireG2.visible = fon > .01;
    campL.position.set(FIRE[0], fy + .6, FIRE[1]); campL.intensity = 5 * fon * (.85 + .15 * fl) * (1 - smooth(6, 12, t)) + 4 * smooth(28, 30, t) * (1 - smooth(34, 36, t)) * (.85 + .15 * fl);
    campMotes.update(t, .8 * fon * (1 - smooth(8, 12, t)), [FIRE[0], fy, FIRE[1]]); smoke.update(t, colAt(SMK, t)); sand.update(t, .5 * (.5 + .5 * ON(t, 36, 38, 52, 54)), [1.5, .1, 3.8]);
    // the water of the well appears when God opens her eyes (21:19)
    { const wv = smooth(51.2, 52.4, t), gl = wv * (.7 + .3 * Math.sin(t * 2.4)); water.visible = wv > .002; water.material.opacity = .94 * wv; glint.material.opacity = .5 * gl; glint.visible = gl > .01;
      ripples.forEach((r, i) => { const t0 = 51.4 + i * .8, u = seg(t, t0, t0 + 2.2), o = Math.sin(Math.PI * Math.min(1, u)); r.scale.setScalar(Math.max(.001, .15 + .9 * ease.outCubic(u))); r.material.opacity = .5 * o; r.visible = o > .01; }); }

    // Sarah: stands at her tent holding the baby (21:2), laughs (21:6), watches the boys play (21:9), asks Abraham to send Hagar away (21:10)
    { const p = kp(t, KS), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { ry = t < 20 ? headZ(.6, 1.0) : headZ(.6, .7); ex = GE(t, [[0, 1.2, 14.8, 15.4, { a0x: -.7, a1x: -.7, a0z: -.1, a1z: .1, lx: .04 }], [9.8, 10.6, 14.0, 14.8, { a0x: -1.7, a1x: -1.7, a0z: -.3, a1z: .3, lx: -.16 }], [18.0, 18.6, 19.4, 20.0, { a0x: -1.25, a0z: -.2 }],
        [22.6, 23.6, 29, 31, { lx: .04, a0x: -.15, a1x: -.15 }], [15.4, 16.2, 18.0, 18.6, { lx: .05, a0x: -.2, a1x: -.2 }]]); }
      fig(sarah, p.x, p.z, ry, mv, t, 2.4, ex); state.sarah = [p.x, gAt(p.x, p.z), p.z];
      // the baby: in Sarah's arms, held up by Abraham when he names him (21:3), back with Sarah; from the feast on Isaac is a toddler
      const own = (t > 7.9 && t < 9.8) ? abraham.group : sarah.group; if (baby.parent !== own) own.add(baby);
      const lift = own === abraham.group ? ON(t, 8.0, 8.8, 9.2, 9.8) : 0; baby.position.set(0, .56 + .34 * lift, .2 + .1 * lift); baby.visible = t < 15.0; }
    // Abraham: beside Sarah (21:2), lifts the baby and names him (21:3), troubled when Sarah asks (21:11), listens to God (21:12), gives Hagar bread and water (21:14)
    { const p = kp(t, KA), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { ry = t < 30.4 ? headZ(-.5, 1.0) : headZ(.9, .3);
        ex = GE(t, [[7.9, 8.5, 9.3, 9.8, { a0x: -1.5, a1x: -1.5, a0z: -.15, a1z: .15 }], [20.6, 22.0, 26.0, 28.0, { lx: .26, a0x: -.4, a1x: -.1, a0z: -.1 }], [26.2, 27.2, 29.6, 30.4, { lx: -.12, a0x: -.2, a1x: -.2 }],
          [32.2, 32.7, 33.4, 33.9, { a0x: -1.0, a1x: -1.0, a0z: -.1, a1z: .1 }]]); }
      fig(abraham, p.x, p.z, ry, mv, t, 1.1, ex); }
    // the guests gather round Sarah, laugh with her (21:6) and sit at the feast (21:8)
    guests.forEach((gu, i) => { const p = kp(t, KG[i]), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, s = 1;
      if (!mv) { ry = headZ(SA0[0] - p.x, SA0[1] - p.z + .2); const lg = ON(t, 12.4, 13.0, 14.2, 14.8); ex = { a0x: -1.4 * lg, a1x: -1.2 * lg, lx: -.08 * lg + .05 * Math.sin(t * 9 + i) * lg }; const sit = smooth(15.0, 15.6, t) * (1 - smooth(27, 29, t)); s = 1 - .26 * sit; ex.s = s; ry = lerp(ry, headZ(MAT[0] - p.x, MAT[1] - p.z), sit); }
      gu.group.visible = t > 9.8; fig(gu, p.x, p.z, ry, mv, t, 3 + i, ex); });
    // Isaac the toddler and Ishmael playing together (21:9)
    { const p = kp(t, KT), mv = p.mv; isaac.group.visible = t > 14.6; fig(isaac, p.x, p.z, headZ(p.vx, p.vz), mv, t, .6, mv ? {} : { lx: .05 }, 12); }
    { const p = kp(t, KI), mv = p.mv, lie = smooth(39.2, 40.3, t) * (1 - smooth(54.0, 54.8, t)); let ry = headZ(p.vx, p.vz), ex = {}, y0 = 0;
      ishmael.sc = .3 * (1 + .45 * smooth(57.0, 60.0, t));
      if (lie > .002) { ry = headZ(1, .3); ex = { lx: -1.42 * lie, a0x: -.2 * lie, a1x: .1 * lie, a0z: -.3 * lie, a1z: .3 * lie }; y0 = .05 * lie; }
      else if (!mv) { ry = t < 14 ? headZ(1, .3) : (t < 54 ? headZ(.4, 1) : (t < 57 ? headZ(.5, .1) : headZ(1, .3))); ex = { a1x: -.7 * ON(t, 55.0, 55.4, 56.4, 56.9) }; }
      fig(ishmael, p.x, p.z, ry, mv && lie < .05, t, 1.7, ex, t > 15 && t < 20.5 ? 13 : 9.5, y0); state.ish = [p.x, gAt(p.x, p.z), p.z]; }
    // Hagar: near her tent (21:9 seen from afar), receives the bread and water (21:14), walks into the wilderness, sits down and weeps (21:15-16), looks up (21:17), goes to the well (21:19)
    { const p = kp(t, KH), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, s = 1, x = p.x, z = p.z;
      if (!mv) { ry = t < 30 ? headZ(1, .3) : (t < 41 ? headZ(HG1[0] - p.x, HG1[1] - p.z) : headZ(BU[0] - p.x, BU[1] - p.z + .1));
        if (t >= 38.8 && t < 50.6) { ry = headZ(1, 1.2); const sit = smooth(40.0, 41.0, t) * (1 - smooth(50.2, 50.8, t)); s = 1 - .3 * sit; const wp = ON(t, 40.8, 41.8, 43.2, 44.0), up = ON(t, 44.6, 45.6, 50.0, 50.6);
          ex = { s, lx: (.28 + .26 * wp) * sit * (1 - up) - .2 * up * sit, a0x: -1.2 * wp - .3 * sit, a1x: -1.2 * wp - .2 * sit, a0z: -.12 * wp, a1z: .12 * wp }; }
        else if (t >= 33.0 && t < 34.2) ex = GE(t, [[33.0, 33.4, 33.8, 34.2, { a0x: -.9, a1x: -.9 }]]);
        else if (t >= 52.4 && t < 54.2) { ry = headZ(SPR[0] - p.x, SPR[1] - p.z); const kn = ON(t, 52.6, 53.0, 53.8, 54.2); s = 1 - .3 * kn; ex = { s, lx: .3 * kn, a0x: -.9 * kn, a1x: -.9 * kn }; }
        else if (t >= 55.4) { ry = headZ(-.2, 1); const kn = smooth(55.4, 56.0, t); s = 1 - .3 * kn; ex = { s, lx: .2 * kn, a0x: -.9 * kn, a1x: -.9 * kn }; } }
      fig(hagar, x, z, ry, mv, t, 0, ex, 9.5); state.hagar = [x, gAt(x, z), z];
      dust.forEach((d, k) => { const tt = (t * 2.6 + k / dust.length) % 1, on = (mv && t > 33 && t < 39) ? Math.sin(Math.PI * tt) : 0; d.position.set(x - .35 - .3 * tt + .05 * k, gAt(x, z) + .08 + .22 * tt, z + .04 * Math.sin(k * 3)); d.material.opacity = .3 * on; d.scale.setScalar(.35 + .8 * tt); d.visible = on > .01; });
      // the skin of water: in Abraham's hands, on Hagar's shoulder, on the ground when empty (21:15), filled and carried to the boy (21:19)
      const hp = hagar.group.position, ap = abraham.group.position;
      if (t < 30.4) wskin.visible = false;
      else if (t < 33.6) { wskin.visible = true; wskin.position.set(ap.x + .12, ap.y + .3, ap.z + .12); wskin.rotation.set(0, 0, 0); wskin.scale.setScalar(1); }
      else if (t < 41.2) { wskin.visible = true; wskin.position.set(hp.x - .05, hp.y + .38 - .1 * smooth(38, 41, t), hp.z - .03); wskin.rotation.set(0, 0, .5); wskin.scale.setScalar(1 - .35 * smooth(37, 41, t)); }
      else if (t < 52.8) { wskin.visible = true; wskin.position.set(HGS[0] + .35, gAt(HGS[0], HGS[1]) + .04, HGS[1] - .2); wskin.rotation.set(0, 0, 1.4); wskin.scale.setScalar(.65); }
      else { wskin.visible = true; wskin.position.set(hp.x + .1, hp.y + .22, hp.z + .1); wskin.rotation.set(0, 0, 0); wskin.scale.setScalar(.65 + .35 * smooth(53.0, 53.8, t)); } }

    // the word to Abraham (21:12) and the voice of the angel of God (21:17): only a column of light
    { const k = Math.max(ON(t, 26.0, 27.6, 29.0, 30.2), ON(t, 43.6, 45.0, 49.6, 51.2)), vo = Math.max(ON(t, 26.4, 27.0, 28.4, 29.4), ON(t, 44.0, 44.6, 48.4, 49.4)), fk = .93 + .07 * Math.sin(t * 2.3), kk = k * (.82 + .18 * vo);
      const [lx, ly, lz] = lpAt(t), dc = cam ? Math.hypot(cam.x - lx, cam.z - lz, (cam.y - 1.5) * .5) : 14, nf = .4 + .6 * smooth(4, 13, dc);
      [beam, beamG, lPool].forEach(m => m.position.set(lx, ly + (m === lPool ? .05 : 0), lz)); beam.visible = beamG.visible = k > .01; beam.material.opacity = .12 * kk * fk * nf; beamG.material.opacity = .035 * kk * fk * nf; lPool.material.opacity = .15 * kk * (.5 + .5 * nf); lPool.visible = k > .01;
      lGlow.position.set(lx, ly + .55, lz); lGlow2.position.set(lx, ly + .5, lz); lGlow.material.opacity = .26 * kk * (.55 + .45 * nf); lGlow2.material.opacity = .22 * kk * (.55 + .45 * nf); lGlow.visible = lGlow2.visible = k > .01; lightL.position.set(lx + .3, ly + 1.1, lz + .3); lightL.intensity = 3.6 * kk;
      rings.forEach((r, i) => { const t0 = [26.6, 44.4, 46.6][i], u = seg(t, t0, t0 + 2.6), o = Math.sin(Math.PI * Math.min(1, u)) * k; r.position.set(lx, ly + .07, lz); r.scale.setScalar(Math.max(.001, .3 + 3.2 * ease.outCubic(u))); r.material.opacity = .34 * o; r.visible = o > .01 && t >= t0 - .1; });
      lMotes.update(t, .8 * k, [lx, ly, lz]); lMotes.mesh.position.set(0, 0, 0);
      many.update(t, .85 * ON(t, 55.6, 57.6, 59.2, 60.8), [SPR[0] - 2, gAt(SPR[0], SPR[1]) - .5, SPR[1] - 4]);
      // Sarah's joy: golden light round her while she laughs
      joy.update(t, .9 * ON(t, 10.0, 10.8, 14.0, 14.8), [SA0[0], gAt(SA0[0], SA0[1]) + .3, SA0[1]]); }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t > 55.5 && t < 61; b.group.position.set(SPR[0] - 1 + Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), SPR[1] - 5 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 7 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#8a9cc8', '#5a4a44', .85, '#ffb878', 2.2, [10, 3.2, 6], .55, '#ffc890', [-8, 5, 6], 14), Dk(6, '#9aa8d0', '#645448', .95, '#ffc890', 2.3, [10, 3.8, 6], .5, '#ffcf9a', [-8, 5, 6], 14),
    Dk(10, '#a8b6d8', '#6a5a4c', 1.0, '#ffdcaa', 2.4, [9, 6, 6], .45, '#ffd8a8', [-8, 5, 6], 14), Dk(15.4, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [4, 10, 5], .4, '#ffe8c8', [-8, 5, 6], 14),
    Dk(22.8, '#b0b4d0', '#7a6650', 1.0, '#ffd8a0', 2.4, [-8, 6, 6], .5, '#ffcf90', [8, 3, 6], 14), Dk(26.6, '#a8b0d0', '#6a5a4c', 1.0, '#ffd890', 2.4, [-9, 5, 7], .6, '#ffd890', [8, 3, 6], 14),
    Dk(30.0, '#7f93c4', '#54483f', .8, '#ffc9a0', 1.9, [10, 2.4, 6], .5, '#ffc090', [-8, 4, 6], 14), Dk(36.0, '#9aaad0', '#6a5a4c', .95, '#ffe2b4', 2.5, [8, 6, 5], .4, '#ffd8a8', [-8, 5, 6], 14),
    Dk(38.0, '#b4c0d8', '#7a6a58', .95, '#ffecd0', 2.3, [2, 12, 3], .3, '#ffe0b8', [-6, 5, 7], 14), Dk(43.0, '#b0bcd4', '#7a6a58', .95, '#ffecd0', 2.3, [3, 11, 3], .3, '#ffe0b8', [-6, 5, 7], 14),
    Dk(44.4, '#a8b4d0', '#7a6a58', 1.0, '#ffe8c0', 2.6, [-6, 8, 6], .55, '#ffd890', [8, 3, 6], 14), Dk(50.4, '#b0bcd8', '#7a6a58', 1.05, '#ffe8c4', 2.5, [-8, 7, 7], .55, '#ffd890', [8, 3, 6], 14),
    Dk(55.4, '#a8b4d4', '#6a5a4c', 1.0, '#ffd2a0', 2.3, [-10, 4.2, 6], .55, '#ffd8a8', [9, 3, 6], 14), Dk(60, '#a0a4b8', '#5c5250', 1.0, '#f4d4a8', 1.9, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#3a5a9a', '#f0b878']], [6, ['#4a78b8', '#f4d4a4']], [15, ['#5a88c4', '#f6ecd0']], [22.8, ['#5a80b8', '#f4d4a4']], [28, ['#4a6aa8', '#f2c490']], [30.4, ['#4a5a98', '#f0b080']], [36, ['#5a86c0', '#f4dab0']],
    [38, ['#7aa4d4', '#f6e8c8']], [43.4, ['#7aa0cc', '#f2e0bc']], [47, ['#6a90c0', '#f4dcb0']], [50.4, ['#5a88c4', '#f6e4c0']], [56, ['#4a78b8', '#f4cc98']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, hagar, sarah, abraham, pl: [lightL, campL], state };
}
