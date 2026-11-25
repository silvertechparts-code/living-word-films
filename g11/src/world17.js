// Episode 17: Genesis 17. When Abram is ninety-nine the Lord appears to him: "I am God Almighty; walk before me and be blameless" (17:1); Abram falls on his face and God makes his covenant: Abram will be the father of
// many nations and his name will be Abraham (17:2-5); God will be God to him and his descendants for ever and give them Canaan (17:7-8); the sign of the covenant is circumcision of every male in his household (17:9-14);
// Sarai is renamed Sarah, mother of nations (17:15-16); Abraham falls on his face and laughs: can a man of a hundred and a woman of ninety have a child? (17:17); God: Sarah will bear you a son, name him Isaac, and my covenant
// is with him (17:19); Ishmael too will be blessed and become a great nation (17:20); Isaac will be born by this time next year (17:21); that very day Abraham did as God had said (17:23).
// Cinematic interpretation: the night-to-dawn sky, the floating camp, the column of light and the pattern of stars written on the ground, the household gathering, the time-lapse of stars for "this time next year" and the walk
// back to the tents are not in the text. God is only light and voice, never a figure. The sign of the covenant (circumcision) is named in the narration and is NOT shown. The reflection (reflect17.js) is a modern picture, not Scripture.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, pineGeo, crowdPalette } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf } from './world10.js';
import { makeBird } from './fauna6.js';
import { makeStars } from './stars15.js';
import { makePattern } from './pattern17.js';

export const RIC = 15;
export const TS = [-5.8, .8], TA = [-8.8, 3.2], T3 = [-2.9, -2.0], FIRE = [-3.0, 4.6], CG = [1.6, 4.0], LP = [3.7, 3.9], SD = [-4.5, 2.8], IS = [-1.4, 5.8], AB0 = [1.2, 4.2];
// the narration beats (PLACE in the mix and subtitle scripts)
export const EV = { appear: [.8, 7.3], fall: [8.3, 12.5], name: [13.4, 17.5], land: [18.5, 23.4], sign: [24.4, 29.7], sarah: [30.7, 35.0], laugh: [35.9, 41.7], isaac: [42.7, 48.4], ishmael: [49.3, 52.6], year: [53.5, 56.0], that: [56.9, 59.6] };

// ---------------- terrain: green camp ground in the west, sandy meeting ground in the middle, a few hills
const HILLS = [[-10.5, -5, 1.1, 6], [-11, 7, .8, 5], [9.8, -4.6, 1.7, 5.4], [2.5, -9.5, 1.1, 5], [11.5, 7.0, .9, 4.0]];
const FLATS = [[TS[0] + .6, TS[1] + 2.6, .32, 6.4], [CG[0], CG[1], .3, 4.4], [FIRE[0], FIRE[1], .3, 2.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1) + smooth(-1, 5, x) * (.12 * Math.sin(x * .7 + z * .35) + .07 * Math.sin(x * 1.5 - z * .9));
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { const dry = smooth(3, 10, x) * .75; let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6b678').lerp(C3('#c4a060'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry);
  if (y > .95) b.lerp(C3('#9a8a70'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#c9b27e'), .85 * smooth(3.8, 2.0, Math.hypot(x - CG[0], z - CG[1]))); b.lerp(C3('#b8a47a'), .6 * smooth(3.2, 1.4, Math.hypot(x - FIRE[0], z - FIRE[1]))); b.lerp(C3('#b8a47a'), .5 * smooth(4.2, 1.8, Math.hypot(x - TS[0] - .5, z - TS[1] - 1.5)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = (x, z) => hC(x, z);
export const stage = { gAt, TS, TA, T3, FIRE, CG, LP, SD, IS, AB0 };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const WK = [[-1.0, 4.9]];            // Abraham's last stop on the way back to the tents
const KA = [[0, AB0[0], AB0[1]], [56.9, AB0[0], AB0[1]], [59.9, AB0[0] - 3.4, AB0[1] + .8], [90, AB0[0] - 3.4, AB0[1] + .8]];
const KS = [[0, SD[0], SD[1]], [50.0, SD[0], SD[1]], [52.8, AB0[0] - .95, AB0[1] + .35], [90, AB0[0] - .95, AB0[1] + .35]];
const KI = [[0, IS[0], IS[1]], [48.9, IS[0], IS[1]], [50.6, AB0[0] + .8, AB0[1] + .65], [56.9, AB0[0] + .8, AB0[1] + .65], [59.9, AB0[0] - 2.5, AB0[1] + 1.3], [90, AB0[0] - 2.5, AB0[1] + 1.3]];
const HH0 = [[-7.2, 4.6], [-8.0, 5.8], [-4.2, -.6], [-3.4, .2], [-6.4, -1.8], [-9.4, 1.6]];
const HHC = [[-.5, 6.3], [.9, 7.0], [3.2, 6.6], [4.4, 5.4], [-.9, 2.5], [4.6, 2.2]];
const KH = HH0.map((p, i) => [[0, p[0], p[1]], [23.2 + i * .35, p[0], p[1]], [28.4 + i * .15, HHC[i][0], HHC[i][1]], [57.2, HHC[i][0], HHC[i][1]], [59.9, p[0] + 2.2, p[1] + 1.1], [90, p[0] + 2.2, p[1] + 1.1]]);
export const abrahamPos = t => { const p = kp(t, KA); return [p.x, gAt(p.x, p.z), p.z]; };
export const sarahPos = t => { const p = kp(t, KS); return [p.x, gAt(p.x, p.z), p.z]; };
export const ishmaelPos = t => { const p = kp(t, KI); return [p.x, gAt(p.x, p.z), p.z]; };
export const hhPos = (i, t) => { const p = kp(t, KH[i]); return [p.x, gAt(p.x, p.z), p.z]; };

// ---------------- little models (same people as Episodes 14-16)
const mkAbram = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkSarai = R => person(R, { pants: '#d8c9a6', top: '#6c5a8a', skin: '#d9a073', hair: '#c4bcb0', cloth: '#efe4cc', long: true, sash: '#8a6a46', seed: 61 }, .46);
const mkIshmael = R => person(R, { pants: '#4a5a3a', top: '#8a9a58', skin: '#8a5a3a', hair: '#1f160d', sash: '#6a4a30', seed: 93 }, .4);
const mkMan = (R, i) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: c.hair, beard: R() < .6 ? c.hair : undefined, cloth: c.cloth, seed: 110 + i }, .43 + .02 * (i % 3)); };

// ====================================================================== the world
export function makeCovenant() {
  const R = rng(1717), g = new THREE.Group(), smoke = makeSmoke(4);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9701), RIC, hC, gcC, 30, 80), underRock(rng(9702), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  [[-10.6, -3.6, 2.0], [-8.4, -8.0, 2.2], [-11.6, 5.2, 1.7], [-6.2, -6.4, 1.5], [8.2, 1.2, 1.9], [9.6, 5.4, 1.6], [6.6, -3.0, 1.4]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-9.6, 7.6, 1.1], [-5.2, 8.6, 1.0], [7.4, 8.0, 1.0]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x < 3 || hC(x, z) < .15 || Math.hypot(x - CG[0], z - CG[1]) < 4.4) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 30; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.2 || Math.hypot(x - CG[0], z - CG[1]) < 3.6) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.18 + R() * .3, .12 + R() * .16, .18 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    // a ring of low stones round the meeting ground
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + .1, rr = 3.5 + .06 * Math.sin(k * 2.3); b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [CG[0] + Math.cos(a) * rr, hC(CG[0] + Math.cos(a) * rr, CG[1] + Math.sin(a) * rr) + .03, CG[1] + Math.sin(a) * rr], [.15, .1, .14], [R() * 3, R() * 3, 0], .05); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  // the camp: three tents, a fire in a stone ring, a mat and a water jar
  [[TS[0], TS[1], .45, '#cdb48c', 1.1], [TA[0], TA[1], .7, '#c2a67a', .8], [T3[0], T3[1], -.4, '#d4c29c', .66]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  { const b = new GB(R); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .24, hC(FIRE[0], FIRE[1]) + .04, FIRE[1] + Math.sin(a) * .24], [.07, .05, .07], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, .5, 0], .01); b.box('#3a2818', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, -.6, 0], .01);
    b.box('#a8744a', [FIRE[0] - 1.0, hC(FIRE[0] - 1.0, FIRE[1] + 1.0) + .02, FIRE[1] + 1.0], [.7, .03, .5], [0, .3, 0], .01); b.add(G.cylT, '#9a6a44', [FIRE[0] + 1.0, hC(FIRE[0] + 1.0, FIRE[1] - .9), FIRE[1] - .9], [.07, .17, .07], [0, 0, 0], .02);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const fy = hC(FIRE[0], FIRE[1]) + .22;
  const fireG = spriteGlow(FIRE[0], fy, FIRE[1], 1.0, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy - .02, FIRE[1], .42, 0xffe0a0, 0); g.add(fireG, fireG2);
  smoke.add(FIRE[0], fy + .1, FIRE[1], t => smooth(.4, 1.4, t), .24, 2.0); g.add(smoke.mesh);
  const campMotes = makeMotes({ n: 30, area: [1.2, 2.6, 1.2], size: .03, v: .5, seed: 33, color: 0xffb860 }); g.add(campMotes.mesh);
  const sand = makeMotes({ n: 90, area: [16, 1.6, 8], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(sand.mesh);

  // ---- the people
  const abram = mkAbram(R), sarah = mkSarai(rng(81)), ish = mkIshmael(rng(83)), men = HH0.map((_, i) => mkMan(rng(200 + i), i));
  [abram, sarah, ish, ...men].forEach(o => g.add(o.group));
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 4 + i * 1.3, h: 6 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });

  // ---- light: the Lord is only light and a voice (a pale column over the meeting ground); a second, small light finds Sarah; one touches Ishmael
  const gy = gAt(LP[0], LP[1]);
  const beam = shaft(26, .34, .46, [1, .92, .7], .3, .85), beamG = shaft(26, 1.1, 1.35, [1, .86, .55], .12, .45); [beam, beamG].forEach(m => { m.material.opacity = 0; m.visible = false; m.position.set(LP[0], gy, LP[1]); g.add(m); });
  const lPool = pool(2.2, 0xffe0a0, 0); lPool.position.set(LP[0], gy + .05, LP[1]); g.add(lPool);
  const lGlow = spriteGlow(LP[0], gy + .55, LP[1], 1.8, 0xffd890, 0), lGlow2 = spriteGlow(LP[0], gy + .5, LP[1], .7, 0xfff4d0, 0); g.add(lGlow, lGlow2);
  const rings = [0, 1, 2, 3].map(() => { const r = ringMesh(1, .14, 0xffe8b0, 0); r.position.set(LP[0], gy + .07, LP[1]); g.add(r); return r; });
  const lMotes = makeMotes({ n: 80, area: [2.6, 5.5, 2.6], size: .035, v: .45, seed: 71, color: 0xffe3a0 }); g.add(lMotes.mesh);
  const sGlow = spriteGlow(0, 0, 0, 1.5, 0xffd890, 0), sGlow2 = spriteGlow(0, 0, 0, .6, 0xfff4d0, 0), sPool = pool(1.5, 0xffe0a0, 0); g.add(sGlow, sGlow2, sPool);
  const sMotes = makeMotes({ n: 40, area: [1.6, 2.4, 1.6], size: .022, v: .4, seed: 74, color: 0xffe3a0 }); g.add(sMotes.mesh);
  const iGlow = spriteGlow(0, 0, 0, 1.3, 0xffd890, 0), iPool = pool(1.3, 0xffe0a0, 0); g.add(iGlow, iPool);
  const many = makeMotes({ n: 200, area: [20, 10, 16], size: .045, v: .26, seed: 73, color: 0xffe9b0 }); g.add(many.mesh);
  const pat = makePattern(3.5); pat.position.set(CG[0], gAt(CG[0], CG[1]) + .045, CG[1]); g.add(pat);
  const godL = new THREE.PointLight(0xffd890, 0, 11, 1.5), campL = new THREE.PointLight(0xff9a50, 0, 7, 1.7), sarL = new THREE.PointLight(0xffd890, 0, 6, 1.6);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);

  // ---- sky and far land
  const stars = makeStars({ seed: 17 }); g.add(stars.group);
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const CLOUD = [[0, '#3a4268'], [14, '#3a4268'], [20, '#e0b898'], [26, '#f4ecde'], [50, '#f4ecde'], [52.8, '#f0b890'], [54.4, '#3a4268'], [56.2, '#3a4268'], [58.4, '#f0c8a0'], [60, '#c8b8b0'], [90, '#b8aeb0']];
  const CEM = [[0, '#161c38'], [14, '#161c38'], [20, '#5a4a4a'], [26, '#6a6258'], [50, '#6a6258'], [52.8, '#6a5a48'], [54.4, '#161c38'], [56.2, '#161c38'], [58.4, '#5a4a48'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const SMK = [[0, '#8a8aa0'], [18, '#c8b8a8'], [90, '#b8a898']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const starOp = t => Math.max(1 - smooth(15.5, 20.5, t), ON(t, 52.2, 54.0, 56.0, 57.8));
  const starBoost = t => .55 + .3 * smooth(2, 9, t) + .15 * ON(t, 53, 55, 56, 57.5);
  const starSpin = t => .6 + .0035 * t + 2.8 * Math.pow(seg(t, 53.4, 57.0), 1.4);

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const state = { abraham: AB0.slice(), sarah: SD.slice() };

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    stars.update(t, starOp(t), starBoost(t), starSpin(t), cam);
    // the low sun of the first morning (east), and a warm one in the west at dusk
    { const sk = ON(t, 15.5, 18.0, 22.5, 27.0), sk2 = ON(t, 50.5, 52.0, 53.4, 54.4), sk3 = ON(t, 56.4, 57.6, 60.6, 62), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0, west = sk2 > sk && sk2 > sk3;
      sunS.position.set(cx + 150 * (west ? -1 : 1), cy + 7, cz + 30); sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(sk, sk2 * .8, sk3 * .9); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01; }
    // the camp fire: lit in the night, dies down at dawn, lit again in the night of the time-lapse
    const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), fon = Math.max(smooth(.2, 1.2, t) * (1 - smooth(14, 19, t)), ON(t, 52.6, 54.0, 56.4, 57.8));
    fireG.material.opacity = .5 * fon * fl; fireG2.material.opacity = .4 * fon; fireG.visible = fireG2.visible = fon > .01;
    campL.position.set(FIRE[0], fy + .6, FIRE[1]); campL.intensity = 6 * fon * (.85 + .15 * fl);
    campMotes.update(t, .8 * fon, [FIRE[0], fy, FIRE[1]]); smoke.update(t, colAt(SMK, t)); sand.update(t, .5, [1.5, .1, 3.8]);
    // Abraham: stands, falls on his face (17:3), rises, stands for the land and the sign, turns to Sarah, falls laughing (17:17), kneels (17:19), stands with Ishmael, walks back (17:23)
    { const p = kp(t, KA), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { ry = headZ(1, .05);
        const up = smooth(2.4, 4.0, t) * (1 - smooth(8.0, 8.6, t)), pr = smooth(8.5, 10.2, t) * (1 - smooth(13.0, 14.8, t)), rec = ON(t, 14.6, 16.0, 22.0, 24.0), sg = ON(t, 24.4, 26, 29, 30.6),
          tn = smooth(30.0, 31.2, t) * (1 - smooth(35.0, 35.9, t)), lg = smooth(36.0, 37.4, t) * (1 - smooth(41.0, 42.2, t)), kn = smooth(42.4, 43.8, t) * (1 - smooth(47.8, 49.0, t)), bl = ON(t, 49.4, 50.6, 52.4, 53.4);
        if (tn > .001) ry = headZ(lerp(1, -.97, tn), lerp(.05, -.26, tn));
        if (bl > .001) ry = headZ(lerp(1, .5, bl), lerp(.05, 1, bl));
        const sh = Math.sin(t * 14) * lg, big = pr + lg;
        ex = { lx: -.1 * up + 1.38 * big + .05 * sh + .16 * kn, s: 1 - .1 * big - .26 * kn, a0x: -.3 * up - 1.2 * big - .35 * kn - .5 * bl - .2 * sg + .25 * sh, a1x: -.3 * up - 1.2 * big - .35 * kn - .5 * bl - .2 * sg - .25 * sh, a0z: -.12 - .3 * (up + rec) - .35 * sg, a1z: .12 + .3 * (up + rec) + .35 * sg }; }
      fig(abram, p.x, p.z, ry, mv, t, 1.1, ex); state.abraham = [p.x, gAt(p.x, p.z), p.z]; }
    // Sarah: stands at her tent (17:15), the light finds her, she listens (17:16, 17:19), later walks to stand by Abraham
    { const p = kp(t, KS), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { ry = t < 51 ? headZ(1, .1) : headZ(1, .05); const gl = ON(t, 30.8, 32.0, 34.6, 36.0), ls = ON(t, 42.8, 44.2, 47.6, 48.8); ex = { lx: .03 * gl, a0z: -.12 - .28 * gl, a1z: .12 + .28 * gl, a0x: -.2 * ls - .1 * gl, a1x: -.2 * ls - .1 * gl }; }
      fig(sarah, p.x, p.z, ry, mv, t, 2.4, ex); state.sarah = [p.x, gAt(p.x, p.z), p.z]; }
    // Ishmael: waits by the fire, comes to stand by Abraham (17:20, 17:23)
    { const p = kp(t, KI), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { ry = t < 49 ? headZ(1, -.5) : headZ(.6, -.6); if (t > 50.4 && t < 56) ex = { lx: .04, a0x: -.1 }; }
      fig(ish, p.x, p.z, ry, mv, t, 3.3, ex); }
    // the household: at the tents, gather round the meeting ground (17:12-13, shown only as people coming together), then go back to the tents (17:23)
    men.forEach((m, i) => { const p = kp(t, KH[i]), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}; if (!mv) { ry = t < 25 ? headZ(1, .2) : headZ(CG[0] - p.x, CG[1] - p.z); ex = { lx: .02 * Math.sin(t * .9 + i), a0x: -.05 }; }
      fig(m, p.x, p.z, ry, mv, t, i * .9, ex); m.group.visible = t > 21 || true; });
    // the Lord: only light by the meeting ground (17:1-8, 17:19-21), and a light that finds Sarah (17:15-16) and one on Ishmael (17:20)
    { const dc = cam ? Math.hypot(cam.x - LP[0], cam.z - LP[1], (cam.y - 1.5) * .5) : 14, nf = .4 + .6 * smooth(4, 13, dc), fk = .93 + .07 * Math.sin(t * 2.3);
      const vo = Math.max(ON(t, .8, 1.4, 6.6, 7.6), ON(t, 10.4, 10.9, 12.2, 12.8), ON(t, 13.4, 13.9, 17.0, 17.8), ON(t, 42.9, 43.4, 48.0, 48.8)), k = Math.max(ON(t, 2.2, 4.4, 17.2, 20.0), .9 * ON(t, 41.6, 43.2, 48.4, 50.2)), kk = k * (.82 + .18 * vo);
      beam.visible = beamG.visible = k > .01; beam.material.opacity = .17 * kk * fk * nf; beamG.material.opacity = .05 * kk * fk * nf; lPool.material.opacity = .15 * kk * (.5 + .5 * nf); lPool.visible = k > .01;
      lGlow.material.opacity = .26 * kk * (.55 + .45 * nf); lGlow2.material.opacity = .22 * kk * (.55 + .45 * nf); lGlow.visible = lGlow2.visible = k > .01; godL.position.set(LP[0] + .3, gy + 1.1, LP[1] + .3); godL.intensity = 3.4 * kk;
      rings.forEach((r, i) => { const t0 = [13.6, 15.4, 43.0, 45.4][i], u = seg(t, t0, t0 + 2.6), o = Math.sin(Math.PI * Math.min(1, u)) * (i < 2 ? 1 : .8); r.position.set(LP[0], gy + .07, LP[1]); r.scale.setScalar(Math.max(.001, .3 + 3.2 * ease.outCubic(u))); r.material.opacity = .34 * o; r.visible = o > .01 && t >= t0 - .1; });
      lMotes.update(t, .8 * k, [LP[0], gy, LP[1]]); lMotes.mesh.position.set(0, 0, 0);
      const sk = ON(t, 30.6, 31.8, 34.6, 36.2), sp = state.sarah; sGlow.position.set(sp[0], sp[1] + .3, sp[2] - .08); sGlow2.position.set(sp[0], sp[1] + .26, sp[2] - .08); sPool.position.set(sp[0], sp[1] + .05, sp[2]);
      sGlow.material.opacity = .15 * sk; sGlow2.material.opacity = .05 * sk; sPool.material.opacity = .16 * sk; sGlow.visible = sGlow2.visible = sPool.visible = sk > .01; sarL.position.set(sp[0] + .3, sp[1] + 1.0, sp[2] + .5); sarL.intensity = 1.5 * sk;
      sMotes.update(t, .8 * sk, [sp[0], sp[1], sp[2]]);
      const ik = ON(t, 49.2, 50.2, 52.0, 53.4), ip = ishmaelPos(t); iGlow.position.set(ip[0], ip[1] + .5, ip[2]); iPool.position.set(ip[0], ip[1] + .05, ip[2]); iGlow.material.opacity = .26 * ik; iPool.material.opacity = .2 * ik; iGlow.visible = iPool.visible = ik > .01;
      // descendants too many to count: lights fill the air while Isaac is named (17:19) and when Ishmael is blessed (17:20)
      many.update(t, .8 * Math.max(ON(t, 43.6, 45.4, 47.4, 49.2), ON(t, 50.0, 51.0, 52.2, 53.4)), [CG[0] - 2, gy - .5, CG[1] - 4]); }
    // the pattern written on the ground: radiates out from the centre while the new name is spoken (17:5), stays faintly, flares when Isaac is named
    { const rev = 1.1 * ease.outCubic(seg(t, 13.6, 17.6)), op = .85 * smooth(13.4, 14.8, t) * (1 - .55 * smooth(21, 26, t)) * (1 - smooth(58.5, 60.5, t)) + .35 * ON(t, 42.8, 44.2, 46.8, 48.6) + .15 * ON(t, 49.2, 50.2, 52, 53.4); pat.userData.set(rev, op * (.9 + .1 * Math.sin(t * 2.0))); }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t > 18.5 && t < 36; b.group.position.set(CG[0] - 1 + Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), CG[1] - 5 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 7 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const NT = ['#4a5a98', '#1c2038', .95, '#a8b8f8', 1.5, [-7, 9, 8]];
  const light = [
    Dk(0, ...NT, .6, '#ffb070', [6, 2.5, 8], 14), Dk(14, ...NT, .8, '#ffb070', [6, 2.5, 8], 14),
    Dk(19.0, '#8a82b0', '#4a3a4a', .98, '#ff9a58', 2.0, [10, 2.5, 2], .5, '#6a7cff', [-8, 5, -6], 14), Dk(24.4, '#a8b6d8', '#6a5a4c', 1.0, '#ffdcaa', 2.4, [9, 6, 6], .45, '#ffd8a8', [-8, 5, 6], 14),
    Dk(30, '#a8b4d4', '#6a5a4c', 1.0, '#ffddb0', 2.3, [9, 6, 6], .5, '#ffd890', [-8, 5, 6], 14), Dk(50, '#a8b4d4', '#6a5a4c', 1.0, '#ffd2a0', 2.3, [-9, 5, 6], .5, '#ffd890', [8, 4, 6], 14),
    Dk(52.8, '#8a7aa0', '#4a3a4a', .98, '#ff9a58', 2.0, [-10, 2.5, 2], .5, '#6a7cff', [8, 5, -6], 14), Dk(54.6, ...NT, .8, '#ffb070', [6, 2.5, 8], 14), Dk(56.2, ...NT, .8, '#ffb070', [6, 2.5, 8], 14),
    Dk(58.2, '#9a8ab0', '#4a3a4a', 1.0, '#ffb878', 2.1, [10, 3, 5], .55, '#ffcf9a', [-8, 5, 6], 14), Dk(60, '#8a90a8', '#4c4648', .95, '#e8c8a8', 1.5, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#040818', '#142048']], [12, ['#060c24', '#1c2a5a']], [17, ['#1a2858', '#9a6a78']], [20, ['#4a6aa8', '#f2b080']], [24.4, ['#5a88c4', '#f4d4a4']], [30, ['#5a88c4', '#f4e0b8']], [49, ['#4a6aa8', '#f2c490']],
    [52.8, ['#2a3470', '#e8905a']], [54.6, ['#040818', '#101a40']], [56.2, ['#0a1030', '#6a4a58']], [58.2, ['#4a6aa8', '#f2b480']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, stars, abram, sarah, ish, men, pl: [godL, campL, sarL], state };
}
