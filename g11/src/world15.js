// Episode 15: Genesis 15. The word of the Lord comes to Abram in a vision: do not be afraid, I am your shield (15:1); Abram says he has no child, his heir is a servant of his house (15:2-3); the Lord answers: your own son
// will be your heir (15:4); he brings Abram outside: count the stars, if you can, so shall your descendants be (15:5); Abram believed the Lord, and it was counted to him as righteousness (15:6); Abram asks how he will know
// that he will possess the land (15:7-8); he is told to bring animals and cuts them in two (15:9-10); at sunset a deep sleep falls on him and a great darkness (15:12); his descendants will be strangers for four hundred years
// and then come out with great wealth (15:13-14); in the dark a smoking fire pot and a flaming torch pass between the pieces (15:17); that day the Lord makes a covenant with Abram (15:18).
// Cinematic interpretation: the floating camp, the shape of the tents, the number of animals and how they are laid out, the caravan, the look of the sky, the golden light and the way the fire pot and torch glide are not in the
// text. No violence is shown. The Lord is not shown as a figure: only light, and the fire pot and torch of 15:17.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeQuad, makeOx, makeCamel, walkLegs, roundTreeGeo, oliveGeo, pineGeo, makeMotes, fadeCone, glowMat } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, mkPerson, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, headX, C3, rimf, SKINS10, HAIRS } from './world10.js';
import { makeBird } from './fauna6.js';
import { makeStars } from './stars15.js';

export const RIC = 15;
export const TENT = [-5.0, 1.0], AB0 = [-4.3, 3.4], FIRE = [-2.8, 3.7], OUT = [-.9, 4.7], SAC = [2.5, 7.2], ASL = [-.4, 5.5], HILL = [7.8, -3.2];
export const EV = { vision: [.8, 6.0], answer: [11.9, 15.0], out: [15.0, 18.6], stars: [17.6, 21.6], believe: [22.4, 27.0], bring: [29.6, 33.4], cut: [34.0, 36.0], sleep: [38.4, 40.6], caravan: [43.6, 50.0], pass: [51.0, 55.2], cov: [55.6, 60.5], wake: [57.2, 58.8] };

// ---------------- terrain
const HILLS = [[HILL[0], HILL[1], 1.5, 6.6], [-9.5, -5, 1.0, 6], [-11, 6.5, .8, 5], [10.5, 8.5, .7, 4.6], [0, -10.5, .9, 5.5]];
const FLATS = [[TENT[0] + .8, TENT[1] + 2.0, .32, 5.6], [OUT[0], OUT[1], .31, 3.8], [SAC[0], SAC[1], .30, 4.8]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .06 * Math.sin(x * .5 + z * .3) + .045 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7))); if (y > .95) b.lerp(C3('#8e8472'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#b8a47a'), .6 * smooth(4.6, 1.8, Math.hypot(x - SAC[0], z - SAC[1]))); b.lerp(C3('#b8a47a'), .5 * smooth(4.4, 1.8, Math.hypot(x - TENT[0] - .6, z - TENT[1] - 1.4))); if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = (x, z) => hC(x, z);
export const stage = { gAt, TENT, AB0, FIRE, OUT, SAC, ASL, HILL };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const KA = [[0, AB0[0], AB0[1]], [15.0, AB0[0], AB0[1]], [18.6, OUT[0], OUT[1]], [31.0, OUT[0], OUT[1]], [32.8, ASL[0] + .1, ASL[1] - .15], [90, ASL[0] + .1, ASL[1] - .15]];
export const abramPos = t => { const p = kp(t, KA); return [p.x, gAt(p.x, p.z), p.z]; };
export const sacPos = () => [SAC[0], gAt(SAC[0], SAC[1]), SAC[1]];
// the fire pot and the torch: along the lane between the pieces, away from the far end toward the near end
const LANE = (u, side) => [SAC[0] + side * .13, SAC[1] - 3.3 + 6.4 * u];
const POT_T = [EV.pass[0], EV.pass[1] - .6], TOR_T = [EV.pass[0] + .6, EV.pass[1]];
export const potPos = t => { const u = ease.inOutSine(seg(t, POT_T[0], POT_T[1])), [x, z] = LANE(u, -1); return [x, gAt(x, z) + .17 + .02 * Math.sin(t * 3), z]; };
export const torchPos = t => { const u = ease.inOutSine(seg(t, TOR_T[0], TOR_T[1])), [x, z] = LANE(u, 1); return [x, gAt(x, z) + .5 + .03 * Math.sin(t * 2.6 + 1), z]; };
export const piecePos = k => { const row = k % 2 ? 1 : -1, pair = k >> 1; return [SAC[0] + row * .6, SAC[1] - 1.6 + 1.6 * pair]; };

// ---------------- little models
const mkAbram = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkLoad = (R, k) => { const b = new GB(R); b.box(['#7a3a4a', '#4a6a8a', '#a8864a'][k % 3], [0, .06, 0], [.3, .12, .22], [0, 0, 0], .03); b.box('#b8a070', [-.05, .17, 0], [.2, .1, .2], [0, R() * .5, 0], .03); b.box('#c9a15a', [.06, .24, .02], [.07, .06, .07], [0, 0, 0], .01);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
const mkPiece = (R, big) => { const b = new GB(R), s = big ? 1 : .72; b.add(G.ico0, '#6a3a30', [0, .09 * s, 0], [.3 * s, .11 * s, .17 * s], [0, 0, 0], .05); b.add(G.ico0, '#523028', [-.05 * s, .06 * s, .03 * s], [.2 * s, .08 * s, .14 * s], [0, .4, 0], .05); b.box('#a87a66', [0, .09 * s, 0], [.02, .12 * s, .26 * s], [0, 0, 0], .01);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; };

// ====================================================================== the world
export function makeCovenant() {
  const R = rng(1515), g = new THREE.Group(), smoke = makeSmoke(8);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9501), RIC, hC, gcC, 30, 80), underRock(rng(9502), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  [[-10.5, -3.6, 2.1], [-8.2, -8.3, 2.3], [-2.6, -9.6, 2.0], [4.4, -9.4, 2.2], [10.4, -.6, 1.9], [-11.4, 4.6, 1.8], [11.2, 5.6, 1.6]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  for (let i = 0; i < 22; i++) { const a = R() * TAU, r = 5 + R() * 9.5, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - TENT[0], z - TENT[1]) < 6.5 || Math.hypot(x - SAC[0], z - SAC[1]) < 5.2 || Math.hypot(x - OUT[0], z - OUT[1]) < 4 || hC(x, z) < .15 || (z > 8.5 && x > -6 && x < 7)) continue; tree(x, z, .8 + R() * .5, hC(x, z) > .9 ? 'pine' : i % 2 ? 'olive' : 'round'); }
  { const b = new GB(R); for (let k = 0; k < 22; k++) { const a = R() * TAU, r = 5 + R() * 9, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .15 || Math.hypot(x - SAC[0], z - SAC[1]) < 4.2 || Math.hypot(x - TENT[0], z - TENT[1]) < 5) continue; b.add(G.ico0, pk(R, ['#8f8b82', '#a39f95', '#77746c']), [x, hC(x, z), z], [.2 + R() * .3, .14 + R() * .16, .2 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  // the camp: three tents, a fire, a stone ring
  [[TENT[0], TENT[1], 0, '#cdb48c', 1.05], [-8.0, 2.8, .7, '#c2a67a', .7], [-2.6, -1.0, -.4, '#d4c29c', .68]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  { const b = new GB(R); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .24, hC(FIRE[0], FIRE[1]) + .04, FIRE[1] + Math.sin(a) * .24], [.07, .05, .07], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, .5, 0], .01); b.box('#3a2818', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, -.6, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const fy = hC(FIRE[0], FIRE[1]) + .22;
  const fireG = spriteGlow(FIRE[0], fy, FIRE[1], 1.0, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy - .02, FIRE[1], .42, 0xffe0a0, 0), fireC = new THREE.Mesh(fadeCone(.3, .1, .0, [1, .62, .22], 1.2), glowMat(.9)); fireC.position.set(FIRE[0], fy - .1, FIRE[1]); g.add(fireG, fireG2, fireC);
  smoke.add(FIRE[0], fy + .1, FIRE[1], t => smooth(.4, 1.4, t), .26, 2.2); g.add(smoke.mesh);
  const campMotes = makeMotes({ n: 40, area: [1.2, 2.6, 1.2], size: .035, v: .5, seed: 33, color: 0xffb860 }); g.add(campMotes.mesh);

  // ---- the people and animals
  const abram = mkAbram(R), servant = mkPerson(rng(77), .44, { pants: '#8a7a5a', top: '#a89878', beard: null, long: false }), herdA = mkPerson(rng(78), .43), herdB = mkPerson(rng(79), .43);
  [abram, servant, herdA, herdB].forEach(o => g.add(o.group));
  const ox = makeOx(rng(41)), goat = makeQuad({ rn: rng(42), len: .5, h: .26, w: .21, legL: .24, legW: .045, col: '#a89880', col2: '#d8d0c0', neck: [.14, .9, .08], head: [.16, .1, .09], ears: true, horns: true }),
    ram = makeQuad({ rn: rng(43), len: .52, h: .27, w: .23, legL: .23, legW: .045, col: '#e8dfcc', col2: '#cfc4aa', neck: [.14, .9, .09], head: [.17, .11, .1], ears: false, horns: true, legCol: '#3a2e26' });
  ox.group.scale.setScalar(.62); goat.group.scale.setScalar(.8); ram.group.scale.setScalar(.84);
  const ANI = [ox, goat, ram]; ANI.forEach(a => g.add(a.group));
  const dove = makeBird(rng(51), '#f8f4ea'), pigeon = makeBird(rng(52), '#a8a39a'); [dove, pigeon].forEach(b => { b.group.scale.setScalar(.7); g.add(b.group); });
  const PIECES = Array.from({ length: 6 }, (_, k) => { const m = mkPiece(R, k < 2); const [x, z] = piecePos(k); m.position.set(x, gAt(x, z) + .02, z); m.rotation.y = (k % 2 ? 1 : -1) * 1.5708 + (R() - .5) * .2; m.scale.setScalar(.001); g.add(m); return m; });
  // the caravan of the four hundred years: walkers and camels crossing the far meadow, then camels with their loads
  const CV = [], CVZ = -3.4; for (let i = 0; i < 7; i++) CV.push({ o: mkPerson(rng(120 + i), .56, { long: i % 3 === 1 }), kind: 'p', d: i * .45 });
  for (let i = 0; i < 3; i++) { const o = makeCamel(rng(130 + i)); o.group.scale.setScalar(.7); const ld = mkLoad(R, i); ld.position.set(0, .62, 0); ld.scale.setScalar(.001); o.group.add(ld); CV.push({ o, kind: 'a', d: 2.2 + i * 1.1, ld }); }
  CV.forEach(c => g.add(c.o.group));
  const lamps = [0, 3, 6].map(() => { const s = spriteGlow(0, 0, 0, .5, 0xffb060, 0); g.add(s); return s; });

  // ---- light: the vision, the fire pot and torch, the covenant
  const beam = shaft(26, .6, .75, [1, .9, .64], .3, .85), beamG = shaft(26, 1.7, 2.0, [1, .84, .5], .12, .45); [beam, beamG].forEach(m => { m.material.opacity = 0; m.visible = false; g.add(m); });
  const vPool = pool(2.4, 0xffe0a0, 0); g.add(vPool);
  const pot = new THREE.Group(), potB = new GB(R); potB.add(new THREE.CylinderGeometry(.075, .05, .13, 10), '#4a3428', [0, .0, 0], [1, 1, 1], [0, 0, 0], .02); potB.add(new THREE.CylinderGeometry(.09, .075, .025, 10), '#5a4034', [0, .075, 0], [1, 1, 1], [0, 0, 0], .01);
  { const m = new THREE.Mesh(potB.build(), lam); m.castShadow = true; pot.add(m); }
  const potC = new THREE.Mesh(fadeCone(.3, .09, .0, [1, .6, .2], 1.1), glowMat(.95)); potC.position.y = .08; pot.add(potC);
  const potG = spriteGlow(0, .2, 0, .9, 0xff9a40, 0), potG2 = spriteGlow(0, .2, 0, .36, 0xffe6a8, 0); pot.add(potG, potG2); g.add(pot);
  const torch = new THREE.Group(), torB = new GB(R); torB.box('#4a3420', [0, .0, 0], [.03, .5, .03], [0, 0, .12], .01); torB.box('#2a1c10', [-.03, .27, 0], [.06, .07, .06], [0, 0, .12], .01);
  { const m = new THREE.Mesh(torB.build(), lam); m.castShadow = true; torch.add(m); }
  const torC = new THREE.Mesh(fadeCone(.4, .075, .0, [1, .66, .24], 1.1), glowMat(.95)); torC.position.set(-.03, .27, 0); torch.add(torC);
  const torG = spriteGlow(-.03, .4, 0, 1.0, 0xff9a40, 0), torG2 = spriteGlow(-.03, .4, 0, .4, 0xffe6a8, 0); torch.add(torG, torG2); g.add(torch);
  // light trail: glowing puffs left behind the pot and the torch
  const TRN = 16, trail = new THREE.InstancedMesh(G.ico0, new THREE.MeshBasicMaterial({ color: 0x9a8070, transparent: true, opacity: .34, depthWrite: false, toneMapped: false }), TRN * 2); trail.frustumCulled = false; trail.renderOrder = 6; g.add(trail);
  const embers = makeMotes({ n: 90, area: [2.4, 1.6, 7.4], size: .04, v: .3, seed: 61, color: 0xffb450 }); g.add(embers.mesh);
  const potL = new THREE.PointLight(0xff9a50, 0, 9, 1.7), campL = new THREE.PointLight(0xff9a50, 0, 8, 1.7), covL = new THREE.PointLight(0xffd890, 0, 12, 1.5);
  // the covenant: a pool of gold on the ground, rings of light, a column of light
  const cPool = pool(5.5, 0xffd890, 0); cPool.position.set(SAC[0], gAt(SAC[0], SAC[1]) + .06, SAC[1]); g.add(cPool);
  const rings = [0, 1, 2].map(() => { const r = ringMesh(1, .18, 0xffe0a0, 0); r.position.set(SAC[0], gAt(SAC[0], SAC[1]) + .08, SAC[1]); g.add(r); return r; });
  const cBeam = shaft(32, .8, 1.0, [1, .9, .62], .3, .85), cBeamG = shaft(32, 2.6, 3.0, [1, .82, .48], .1, .4); [cBeam, cBeamG].forEach(m => { m.position.set(SAC[0], gAt(SAC[0], SAC[1]), SAC[1]); m.material.opacity = 0; m.visible = false; g.add(m); });
  const cGlow = spriteGlow(SAC[0], gAt(SAC[0], SAC[1]) + .5, SAC[1], 3.2, 0xffd890, 0), cGlow2 = spriteGlow(SAC[0], gAt(SAC[0], SAC[1]) + .4, SAC[1], 1.2, 0xfff0c8, 0); g.add(cGlow, cGlow2);
  const cMotes = makeMotes({ n: 120, area: [8, 6, 8], size: .06, v: .35, seed: 71, color: 0xffe3a0 }); g.add(cMotes.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const dust = Array.from({ length: 6 }, () => { const s = spriteGlow(0, 0, 0, 1.4, 0xe8d8b8, 0); s.material.blending = THREE.NormalBlending; g.add(s); return s; });

  // ---- sky and far land
  const stars = makeStars({ seed: 15 }); g.add(stars.group);
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const CLOUD = [[0, '#3a4268'], [26.6, '#3a4268'], [30, '#e0b898'], [35, '#f4ecde'], [38.6, '#f0b890'], [41.8, '#3a4268'], [56, '#3a4268'], [60, '#f0b890'], [90, '#4c5478']];
  const CEM = [[0, '#161c38'], [26.6, '#161c38'], [30, '#5a5670'], [38, '#5a5670'], [41.8, '#161c38'], [56, '#161c38'], [60, '#5a5670'], [90, '#222640']];
  const SMK = [[0, '#8a8aa0'], [30, '#d8c6b0'], [41, '#8a8aa0'], [90, '#707490']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  const starOp = t => Math.max(1 - smooth(26.8, 29.6, t), smooth(39.6, 42.6, t));
  const starBoost = t => t < 27 ? ease.inOutSine(seg(t, EV.stars[0], EV.stars[1])) : .72 + .28 * smooth(54, 58, t);
  const starSpin = t => .6 + .0035 * t + 2.6 * Math.pow(seg(t, 43.4, 50.4), 1.5);

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  const la = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}) { const w = walkAnim(t, ph); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  function ani(an, x, z, ry, mv, t, i) { an.group.position.set(x, gAt(x, z) - .02, z); an.group.rotation.y = ry; if (mv) walkLegs(an.legs, t + i, 4.4, .32); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const _o = new THREE.Object3D(), _p = new THREE.Vector3();
  const puff = (i, p0, t, k) => { const age = ((t * .8 + k / TRN) % 1 + 1) % 1, back = age * 1.5; return back; };
  const hC2 = hC;

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)), M = far.userData.mat, f = smooth(0, 5, t) * .66; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
    stars.update(t, starOp(t), starBoost(t), starSpin(t), cam);
    // sun low in the west for the sunset (15:12 is "as the sun was going down")
    { const sk = ON(t, 36.6, 38.4, 41.0, 42.4), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0; sunS.position.set(cx + 150, cy + 6, cz + 30); sunS2.position.set(cx + 150, cy + 6, cz + 30); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .55 * sk; sunS2.material.opacity = .7 * sk; sunS.visible = sunS2.visible = sk > .01; }
    const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), fon = smooth(.2, 1.2, t) * (1 - smooth(57.5, 60, t));
    fireG.material.opacity = .62 * fon * fl; fireG2.material.opacity = .5 * fon; fireC.material.opacity = fon; fireC.scale.set(1, .8 + .35 * fl, 1); fireG.visible = fireG2.visible = fireC.visible = fon > .01;
    { const nb = smooth(36.6, 38.6, t), k = .7 * nb; campL.position.set(FIRE[0] + (ASL[0] - FIRE[0]) * k, fy + .5 + 1.5 * nb, FIRE[1] + (ASL[1] - FIRE[1]) * k); campL.intensity = 14 * fon * (.85 + .15 * fl) * (1 - smooth(27, 29.5, t) * (1 - nb)) * (1 - .1 * nb); }
    campMotes.update(t, .9 * fon * (1 - smooth(18.4, 18.8, t) * (1 - smooth(22.2, 22.6, t))), [FIRE[0], fy, FIRE[1]]); smoke.update(t, colAt(SMK, t));
    // Abram
    { const p = kp(t, KA), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, x = p.x, z = p.z, y = 0;
      if (!mv) { if (t < 6.2) { ry = headZ(.2, 1); ex = { lx: -.26 * smooth(.6, 2.2, t), a0x: -.2, a1x: -.2 }; }
        else if (t < 11.6) { ry = headZ(-.55, 1); ex = { lx: -.02, a0x: -.15 * Math.sin(t * .8) - .1 }; }
        else if (t < 15.4) { ry = headZ(.1, 1); ex = { lx: -.3 * smooth(11.9, 12.8, t), a0x: -.1, a1x: -.1 }; }
        else if (t < 27.4) { ry = headZ(0, -1); ex = { lx: -.3 * smooth(19, 20.4, t), a0x: -.25 * smooth(22.4, 23.8, t), a1x: -.25 * smooth(22.4, 23.8, t), a0z: -.1 - .4 * smooth(23.4, 25, t), a1z: .1 + .4 * smooth(23.4, 25, t) }; }
        else if (t < 32.8) { ry = headZ(1, -.35); }
        else { ry = headZ(1.7, 1.4);
          const up = ON(t, 34.0, 34.8, 35.6, 36.4); ex = { a0x: -2.4 * up, a1x: -2.4 * up, a0z: -.2, a1z: .2 };
          const sl = smooth(EV.sleep[0], EV.sleep[1], t) * (1 - smooth(EV.wake[0], EV.wake[1], t)); if (sl > .001) { ex = { ...ex, lx: -1.5 * sl }; y = .03 * sl; ry = la(ry, headZ(.25, 1), sl); }
          const aw = smooth(EV.wake[0] + .6, EV.wake[1] + .4, t); if (aw > .001 && t > EV.wake[0]) ex = { ...ex, a0x: -.4 * aw, a1x: -.4 * aw, a0z: -.9 * aw, a1z: .9 * aw }; } }
      if (t < 6.2 && Math.abs(p.vz) < 1e-6 && Math.abs(p.vx) < 1e-6) ry = headZ(.2, 1);
      fig(abram, x, z, ry, mv, t, 0, ex); abram.group.position.y += y; abramState.p = [x, gAt(x, z), z]; }
    // the servant stands by the tent while Abram speaks, the herders bring the animals
    { const sv = t < 30 ? [AB0[0] - 1.7, AB0[1] + .3] : [OUT[0] - 1.9, OUT[1] - .5]; servant.group.visible = t < 33; fig(servant, sv[0], sv[1], headZ(1, -.1), false, t, 1, { a0x: -.1 }); }
    { const A0 = [[EV.bring[0], 10.8, 3.6], [EV.bring[1] - .2, SAC[0] + .4, SAC[1] - .3], [EV.cut[0] + .2, SAC[0] + .4, SAC[1] - .3], [EV.cut[1] + 1.4, 11, 6.8], [90, 11, 6.8]];
      const pa = kp(t, A0), pb = kp(t, A0.map(([tt, x, z], i) => [tt + .15, x + .9 * (i === 0 || i === 3 || i === 4 ? 1 : 0), z + .8]));
      herdA.group.visible = herdB.group.visible = t > EV.bring[0] - .1 && t < EV.cut[1] + 1.6; fig(herdA, pa.x, pa.z, headZ(pa.vx, pa.vz), pa.mv, t, 2); fig(herdB, pb.x, pb.z, headZ(pb.vx, pb.vz), pb.mv, t, 3.1);
      const spots = [[SAC[0] - .9, SAC[1] - .1], [SAC[0] + .15, SAC[1] - .5], [SAC[0] + 1.1, SAC[1] - .05]], live = t > EV.bring[0] - .2 && t < EV.cut[0] + .8;
      ANI.forEach((a, i) => { const k = [[EV.bring[0] + .1 * i, 10.2 + .8 * i, 2.8 + .7 * i], [EV.bring[1] + .1 * i, spots[i][0], spots[i][1]], [90, spots[i][0], spots[i][1]]], p = kp(t, k); a.group.visible = live; ani(a, p.x, p.z, la(headX(p.vx, p.vz), headX(-1, 0), p.mv ? 0 : 1) , p.mv, t, i); });
      const pk0 = smooth(EV.cut[0] + .3, EV.cut[0] + 1.0, t) * (1 - smooth(59.2, 60.4, t));
      PIECES.forEach((m, k) => { const u = ease.outBack(seg(t, EV.cut[0] + .6 + .12 * k, EV.cut[0] + 1.4 + .12 * k)) * (1 - smooth(59.0, 60.4, t)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
      dust.forEach((s, k) => { const tt = EV.cut[0] + .2 + .18 * k, u = seg(t, tt, tt + 1.4), o = Math.sin(Math.PI * u), x = SAC[0] + (k % 2 ? .7 : -.7) + .2 * Math.sin(k * 2.1), z = SAC[1] - 1.4 + .6 * k; s.position.set(x, gAt(x, z) + .3 + .4 * u, z); s.material.opacity = .4 * o; s.scale.setScalar(1.0 + 1.2 * u); s.visible = o > .01; });
      const bd = smooth(EV.bring[0] + 2, EV.bring[1], t) * (1 - smooth(EV.cut[0] + .2, EV.cut[0] + .7, t)); dove.group.visible = pigeon.group.visible = bd > .02;
      dove.group.position.set(SAC[0] - 1.9, gAt(SAC[0] - 1.9, SAC[1] + .5) + .06, SAC[1] + .5); dove.group.rotation.set(0, 1.0, 0); pigeon.group.position.set(SAC[0] - 1.6, gAt(SAC[0] - 1.6, SAC[1] + 1.1) + .06, SAC[1] + 1.1); pigeon.group.rotation.set(0, .5, 0);
      [dove, pigeon].forEach(b => b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * .1)); }
    // the vision (15:1), the answer (15:4), the promise (15:5-6): a column of golden light on Abram
    { const ap = abramState.p, k = Math.max(ON(t, EV.vision[0], EV.vision[0] + 1.6, EV.vision[1] - 1.0, EV.vision[1] + .4) * .9, ON(t, EV.answer[0], EV.answer[0] + 1.2, EV.answer[1] - 1.2, EV.answer[1]) * .95, ON(t, EV.believe[0] - .4, EV.believe[0] + 1.4, EV.believe[1] - .6, EV.believe[1] + 1.0) * .9) * (1 - .0 * smooth(27, 28, t));
      const fk = .93 + .07 * Math.sin(t * 2.3); beam.position.set(ap[0], ap[1], ap[2]); beamG.position.set(ap[0], ap[1], ap[2]); beam.visible = beamG.visible = k > .01; beam.material.opacity = .26 * k * fk; beamG.material.opacity = .09 * k * fk;
      vPool.position.set(ap[0], ap[1] + .05, ap[2]); vPool.material.opacity = .34 * k; vPool.visible = k > .01; }
    // the fire pot and the torch pass between the pieces (15:17)
    { const ps = ON(t, POT_T[0] - .3, POT_T[0] + .5, POT_T[1] + .5, POT_T[1] + 1.2), ts = ON(t, TOR_T[0] - .3, TOR_T[0] + .5, TOR_T[1] + .6, TOR_T[1] + 1.4), ff = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 9.1);
      const pp = potPos(t), tp = torchPos(t); pot.position.set(...pp); torch.position.set(tp[0], tp[1] - .27, tp[2]); pot.visible = ps > .01; torch.visible = ts > .01;
      potC.scale.set(1, (.8 + .4 * ff) * ps, 1); potG.material.opacity = .85 * ps * ff; potG2.material.opacity = .7 * ps; torC.scale.set(1, (.8 + .4 * ff) * ts, 1); torG.material.opacity = .9 * ts * ff; torG2.material.opacity = .75 * ts;
      const mid = [(pp[0] + tp[0]) / 2, (pp[1] + tp[1]) / 2 + .1, (pp[2] + tp[2]) / 2], both = Math.max(ps, ts); potL.position.set(...mid); potL.intensity = 20 * both * ff;
      // puffs of smoke streaming behind the pot (15:17 "a smoking fire pot"), and a few embers behind the torch
      for (let k = 0; k < TRN; k++) { const age = ((t * .9 + k / TRN) % 1 + 1) % 1, tp0 = Math.max(POT_T[0], t - age * 1.6), q = potPos(tp0), tq = torchPos(Math.max(TOR_T[0], t - age * 1.1)), up = age * .7, s = (.16 + .3 * age) * Math.sin(Math.PI * Math.min(1, age * 1.15)) * ps;
        _o.position.set(q[0] + Math.sin(k * 2.7 + t) * .06, q[1] + .1 + up, q[2] + Math.cos(k * 1.9) * .06); _o.scale.setScalar(Math.max(.0001, s)); _o.rotation.set(k, t * .4, 0); _o.updateMatrix(); trail.setMatrixAt(k, _o.matrix);
        const s2 = (.08 + .12 * age) * Math.sin(Math.PI * Math.min(1, age * 1.15)) * ts * .6; _o.position.set(tq[0], tq[1] + .15 + age * .5, tq[2]); _o.scale.setScalar(Math.max(.0001, s2)); _o.updateMatrix(); trail.setMatrixAt(TRN + k, _o.matrix); }
      trail.instanceMatrix.needsUpdate = true; trail.material.opacity = .3; trail.visible = both > .01;
      embers.update(t, both * .9, [SAC[0], gAt(SAC[0], SAC[1]) + .1, SAC[1]]); }
    // the covenant (15:18): gold floods the place, rings of light go out, the column stands over the pieces
    { const c = ON(t, EV.cov[0], EV.cov[0] + 1.6, 59.4, 61.0), cl = .9 + .1 * Math.sin(t * 3.1), y0 = gAt(SAC[0], SAC[1]);
      cPool.material.opacity = .42 * c * cl; cPool.visible = c > .01; cGlow.material.opacity = .5 * c * cl; cGlow2.material.opacity = .45 * c; cGlow.visible = cGlow2.visible = c > .01;
      cBeam.visible = cBeamG.visible = c > .01; cBeam.material.opacity = .45 * c * cl; cBeamG.material.opacity = .24 * c; covL.position.set(SAC[0], y0 + 1.2, SAC[1]); covL.intensity = 26 * c;
      rings.forEach((r, k) => { const u = seg(t, EV.cov[0] + .3 + 1.0 * k, EV.cov[0] + 3.4 + 1.0 * k), o = Math.sin(Math.PI * Math.min(1, u)) * c; r.scale.setScalar(Math.max(.001, .6 + 5.8 * ease.outCubic(u))); r.material.opacity = .55 * o; r.visible = o > .01; });
      cMotes.update(t, .9 * c, [SAC[0], y0, SAC[1]]); }
    // the caravan (15:13-14): walkers pass slowly, then camels with their loads
    CV.forEach((c, i) => { const t0 = EV.caravan[0] + c.d, t1 = t0 + (c.kind === 'p' ? 4.6 : 5.0), u = (t - t0) / (t1 - t0), vis = u > 0 && u < 1, x = lerp(6.8, -6.8, clamp(u)), z = CVZ + .7 * Math.sin(i * 2.3) - (c.kind === 'a' ? .5 : 0), ry = headZ(-1, 0);
      c.o.group.visible = vis; if (c.kind === 'p') fig(c.o, x, z, ry, vis, t, i * 1.3, { a0x: 0 }); else { ani(c.o, x, z, headX(-1, 0), vis, t, i); c.ld.scale.setScalar(Math.max(.001, 1.5)); }
      c.x = x; c.z = z; });
    lamps.forEach((s, k) => { const c = CV[[1, 4, 7][k]], on = c.o.group.visible ? .8 * (.8 + .2 * Math.sin(t * 9 + k)) : 0; s.position.set(c.x + .1, gAt(c.x, c.z) + .42, c.z + .08); s.material.opacity = on; s.visible = on > .01; });
  }
  const abramState = { p: [AB0[0], gAt(AB0[0], AB0[1]), AB0[1]] };
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const NT = ['#4a5a98', '#1c2038', .95, '#a8b8f8', 1.5, [-7, 9, 8]];
  const light = [
    Dk(0, ...NT, .6, '#ffb070', [6, 2.5, 8], 14), Dk(12, ...NT, .8, '#ffb070', [6, 2.5, 8], 14),
    Dk(22, '#5a64a0', '#241f38', 1.0, '#c8c0f0', 1.6, [-7, 9, 8], 1.0, '#ffc880', [2, 2.5, 8], 14), Dk(26.4, '#5a64a0', '#241f38', 1.0, '#c8c0f0', 1.6, [-7, 9, 8], 1.0, '#ffc880', [2, 2.5, 8], 14),
    Dk(29.6, '#8a9cc8', '#454448', 1.05, '#ffe0b0', 2.2, [10, 7, 6], .4, '#8a9cff', [-10, 6, -8], 14), Dk(35.5, '#8a98c0', '#45403c', 1.05, '#ffd8a0', 2.3, [10, 5, 6], .4, '#8a9cff', [-10, 6, -8], 14),
    Dk(38.6, '#8a7aa0', '#4a3a4a', .98, '#ff9a58', 2.0, [10, 2.5, 2], .5, '#6a7cff', [-8, 5, -6], 14), Dk(41.8, '#3c4c8c', '#1c2038', .9, '#9ab0f0', 1.4, [-6, 9, 8], .6, '#ffb070', [8, 4, 6], 14),
    Dk(50, '#3c4c8c', '#1c2038', .9, '#9ab0f0', 1.4, [-6, 9, 8], .6, '#ffb070', [8, 4, 6], 14), Dk(55.4, '#46508c', '#241f38', 1.0, '#b0b8f0', 1.5, [-6, 9, 8], .9, '#ffc070', [8, 4, 6], 14),
    Dk(58.4, '#6a5a90', '#3a2a3a', 1.05, '#ffd09a', 1.9, [-6, 6, 8], 1.0, '#ffcf9a', [7, 4.5, 10], 14), Dk(60, '#8a82a2', '#46403e', 1.05, '#ffc890', 2.0, [-9, 5, 6], .5, '#ffcf9a', [7, 4.5, 10], 14)];
  const bg = [[0, ['#040818', '#142048']], [12, ['#040818', '#18285a']], [22, ['#060c22', '#2a2f62']], [26.4, ['#0a1230', '#3a3a68']], [29.6, ['#3a6ab0', '#f0d0a0']], [35.5, ['#3a6ab0', '#f0cc98']], [38.6, ['#2a3470', '#e8905a']], [41.8, ['#0a1030', '#3a2a58']],
    [44, ['#040818', '#101a40']], [54, ['#040818', '#101a40']], [57, ['#0a1030', '#6a4a58']], [60, ['#1c2a60', '#c88a88']]];
  return { group: g, update, light, bg, far, stars, abram, pl: [campL, potL, covL], getAbram: () => abramState.p };
}
