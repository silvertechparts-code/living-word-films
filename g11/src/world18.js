// Episode 18: Genesis 18. The Lord appears to Abraham by the oaks of Mamre as he sits at the entrance of his tent in the heat of the day; he looks up and sees three men standing near (18:1-2); he runs to meet them and bows
// to the ground: "do not pass by; let a little water be brought, and some bread" (18:2-5); Abraham hurries to Sarah and has a meal prepared (18:6-8); "where is your wife Sarah?"; "I will return, and Sarah shall have a son"
// (18:9-10); Sarah, listening at the tent entrance, laughs to herself (18:11-12); "is anything too wonderful for the Lord?" (18:13-14); the men set out toward Sodom (18:16); "the outcry against Sodom and Gomorrah is great"
// (18:20-21); Abraham stands before the Lord and pleads: "will you sweep away the righteous with the wicked? shall not the Judge of all the earth do right?" (18:22-25); fifty, forty-five, forty, thirty, twenty, ten (18:24-32).
// Cinematic interpretation: the floating camp, the oak and the table, the three men in plain robes (no halos; the text moves between "the Lord" and "three men", and the film does not say who the three are), the dusk
// that falls while Abraham pleads, and the city of lights that dim one by one for the count are not in the text. The two men who go on toward Sodom are shown as figures looking at the city. Nothing happens to Sodom in this chapter and nothing is shown.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, pool, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, crowdPalette } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, houseBlock, meshOf } from './world10.js';
import { makeBird } from './fauna6.js';
import { makeStars } from './stars15.js';

export const RIC = 15;
export const TS = [-4.5, 1.5], TA = [-8.6, 3.6], T3 = [-7.4, -2.6], COOK = [-5.9, 3.4], OAK = [-.7, 1.2], OAK2 = [3.4, 0.6], TB = [.1, 3.2], SD = [-3.15, 1.85], AB0 = [-2.6, 2.7];
export const MEET = [[3.3, 4.5], [4.1, 5.1], [3.7, 3.8]];                 // where the three men stand when Abraham runs to them
export const SEAT = [[-1.0, 3.2], [.4, 4.15], [1.3, 3.0]];                // where they sit at the table
export const ABF = [5.0, 4.7], LORD = [6.3, 4.6], GO = [[9.4, 3.8], [9.9, 5.1]];   // Abraham before the Lord; the two who look toward the city
export const SODOM = [36, -2.2, -7.5];
// the narration beats (PLACE in the mix and subtitle scripts)
export const EV = { appear: [.8, 5.3], run: [6.2, 10.5], feast: [11.3, 14.0], ask: [14.9, 19.6], laugh: [20.4, 23.1], hard: [23.9, 27.0], sodom: [28.0, 33.5], plead: [34.5, 42.0], fifty: [43.2, 47.9], count: [49.0, 53.0], ten: [54.0, 58.8] };

// ---------------- terrain: a green camp ground in the west, dry sandy ground in the east, a few hills
const HILLS = [[-10.5, -5, 1.1, 6], [-11, 7, .8, 5], [9.8, -5.2, 1.5, 5.4], [2.5, -9.5, 1.1, 5], [11.8, 8.4, .8, 3.8]];
const FLATS = [[TS[0] + .8, TS[1] + .8, .32, 5.4], [TB[0], TB[1], .3, 4.6], [ABF[0] + .6, ABF[1], .3, 4.4], [MEET[0][0] + 2, 4.5, .3, 3.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1) + smooth(-1, 5, x) * (.12 * Math.sin(x * .7 + z * .35) + .07 * Math.sin(x * 1.5 - z * .9));
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { const dry = smooth(0, 8, x) * .8; let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6b678').lerp(C3('#c4a060'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry);
  if (y > .95) b.lerp(C3('#9a8a70'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#c9b27e'), .8 * smooth(3.6, 1.8, Math.hypot(x - TB[0], z - TB[1]))); b.lerp(C3('#b8a47a'), .5 * smooth(4.0, 1.6, Math.hypot(x - TS[0] - .8, z - TS[1] - .4))); b.lerp(C3('#b8a47a'), .45 * smooth(3.0, 1.2, Math.hypot(x - ABF[0] - .6, z - ABF[1])));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = (x, z) => hC(x, z);
export const stage = { gAt, TS, TA, T3, COOK, OAK, TB, SD, AB0, ABF, LORD, SODOM, MEET, SEAT, GO };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
// Abraham: sits at his tent (18:1), stands and sees them (18:2), runs to them and bows, leads them to the table, hurries to Sarah (18:6), serves them, walks out with them (18:16), stands before the Lord (18:22)
const KA = [[0, AB0[0], AB0[1]], [6.2, AB0[0], AB0[1]], [8.2, MEET[1][0] - 1.5, MEET[1][1] - .45], [10.6, MEET[1][0] - 1.5, MEET[1][1] - .45], [11.6, TB[0] + 1.9, TB[1] + 1.7], [12.1, TB[0] + 1.9, TB[1] + 1.7], [13.3, SD[0] + .9, SD[1] + .55], [13.7, SD[0] + .9, SD[1] + .55],
  [15.4, TB[0] + 1.9, TB[1] + 1.7], [28.2, TB[0] + 1.9, TB[1] + 1.7], [31.4, 3.2, 4.4], [33.8, 3.6, 4.5], [34.6, ABF[0], ABF[1]], [90, ABF[0], ABF[1]]];
const KS = [[0, SD[0], SD[1]], [11.8, SD[0], SD[1]], [14.0, TB[0] - 1.9, TB[1] - .7], [15.2, TB[0] - 1.9, TB[1] - .7], [17.4, SD[0], SD[1]], [90, SD[0], SD[1]]];
const KV = [0, 1, 2].map(i => [[0, 14.0 + i * .5, 5.4 + i * .5], [1.1 + i * .22, 14.0 + i * .5, 5.4 + i * .5], [5.0 + i * .12, MEET[i][0], MEET[i][1]], [10.4, MEET[i][0], MEET[i][1]], [12.6 + i * .25, SEAT[i][0], SEAT[i][1]], [28.2 + i * .15, SEAT[i][0], SEAT[i][1]],
  i === 1 ? [31.2, LORD[0], LORD[1]] : [32.6 + i * .5, GO[i === 0 ? 0 : 1][0], GO[i === 0 ? 0 : 1][1]], [90, i === 1 ? LORD[0] : GO[i === 0 ? 0 : 1][0], i === 1 ? LORD[1] : GO[i === 0 ? 0 : 1][1]]]);
const HH0 = [[-8.4, 1.0], [-9.6, 4.8], [-6.0, -3.6]];
export const abrahamPos = t => { const p = kp(t, KA); return [p.x, gAt(p.x, p.z), p.z]; };
export const sarahPos = t => { const p = kp(t, KS); return [p.x, gAt(p.x, p.z), p.z]; };
export const visitorPos = (i, t) => { const p = kp(t, KV[i]); return [p.x, gAt(p.x, p.z), p.z]; };

// ---------------- little models
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkSarah = R => person(R, { pants: '#d8c9a6', top: '#6c5a8a', skin: '#d9a073', hair: '#c4bcb0', cloth: '#efe4cc', long: true, sash: '#8a6a46', seed: 61 }, .46);
const VIS = [{ pants: '#e2d8be', top: '#b9a888', skin: '#c9966a', hair: '#3a2a1a', beard: '#3a2a1a', cloth: '#e8dfca', sash: '#8a7a5a', seed: 181 }, { pants: '#efe6cf', top: '#d8c9a6', skin: '#bf8a5e', hair: '#2a1a10', beard: '#2a1a10', cloth: '#f2ead6', sash: '#a89060', seed: 183 }, { pants: '#d8d0bc', top: '#9aa0a8', skin: '#a8744a', hair: '#1f160d', beard: '#1f160d', cloth: '#dcd2bc', sash: '#7a6a50', seed: 185 }];
const mkVisitor = (i) => person(rng(300 + i), VIS[i], [.54, .57, .54][i]);
const mkMan = (R, i) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: c.hair, beard: R() < .6 ? c.hair : undefined, cloth: c.cloth, seed: 110 + i }, .43 + .02 * (i % 3)); };

// ====================================================================== the world
export function makeMamre() {
  const R = rng(1818), g = new THREE.Group(), smoke = makeSmoke(3);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9801), RIC, hC, gcC, 30, 80), underRock(rng(9802), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  // the oaks of Mamre: two big, dark-leaved trees by the table
  const OAKC = ['#4f7a30', '#46702a', '#5a8236', '#3f6824']; tree(OAK[0], OAK[1], 2.7, 'round', OAKC); tree(OAK2[0], OAK2[1], 2.1, 'round', OAKC);
  [[-10.6, -3.6, 2.0], [-8.4, -8.0, 2.2], [-11.6, 5.2, 1.7], [-6.2, -6.4, 1.5], [8.2, 1.2, 1.6], [9.6, 8.0, 1.4], [6.6, -3.0, 1.4], [-2.8, -4.8, 1.8]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-9.6, 7.6, 1.1], [-5.2, 8.6, 1.0], [4.6, 8.8, 1.0]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  for (let i = 0; i < 16; i++) { const a = R() * TAU, r = 5 + R() * 9.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x < 5 || hC(x, z) < .15 || Math.hypot(x - ABF[0], z - ABF[1]) < 4) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 30; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || Math.hypot(x - TB[0], z - TB[1]) < 2.6 || Math.hypot(x - ABF[0], z - ABF[1]) < 2.4) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.18 + R() * .3, .12 + R() * .16, .18 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  // the camp: Abraham's tent (door to the east), two more tents, a cooking fire, a water jar
  [[TS[0], TS[1], 1.38, '#cdb48c', 1.1], [TA[0], TA[1], .7, '#c2a67a', .8], [T3[0], T3[1], -.4, '#d4c29c', .66]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  // the meal: a reed mat under the oak with bread, a bowl of curds and a jar of water; a mat for each guest
  { const b = new GB(R), ty = hC(TB[0], TB[1]); b.box('#b0824e', [TB[0], ty + .02, TB[1]], [1.5, .03, 1.1], [0, .15, 0], .01); b.box('#e9e0c8', [TB[0], ty + .045, TB[1]], [1.2, .012, .8], [0, .15, 0], .01);
    for (let k = 0; k < 4; k++) b.add(G.ico0, '#d8a860', [TB[0] - .3 + k * .21, ty + .09, TB[1] - .12 + (k % 2) * .2], [.09, .05, .075], [0, k, 0], .02);
    b.add(G.cylT, '#8a5a3a', [TB[0] + .3, ty + .06, TB[1] + .12], [.11, .06, .11], [0, 0, 0], .02); b.add(G.cylT, '#f0e8d2', [TB[0] + .3, ty + .1, TB[1] + .12], [.085, .02, .085], [0, 0, 0], .01);
    b.add(G.cylT, '#9a6a44', [TB[0] - .45, ty + .13, TB[1] + .28], [.07, .17, .07], [0, 0, 0], .02);
    SEAT.forEach(([x, z]) => b.box('#a8744a', [x, hC(x, z) + .015, z], [.7, .025, .6], [0, 0, 0], .01));
    b.box('#a8744a', [COOK[0], hC(COOK[0], COOK[1]) + .02, COOK[1]], [.7, .03, .5], [0, .3, 0], .01); b.add(G.cylT, '#9a6a44', [COOK[0] - .9, hC(COOK[0] - .9, COOK[1] + .5), COOK[1] + .5], [.07, .17, .07], [0, 0, 0], .02);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; b.add(G.ico0, '#7a746c', [COOK[0] + 1.0 + Math.cos(a) * .22, hC(COOK[0] + 1.0, COOK[1]) + .04, COOK[1] - .6 + Math.sin(a) * .22], [.07, .05, .07], [R() * 3, R() * 3, 0], .04); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  const cfx = COOK[0] + 1.0, cfz = COOK[1] - .6, cfy = hC(cfx, cfz) + .2;
  const cookG = spriteGlow(cfx, cfy, cfz, .9, 0xff9a40, 0); g.add(cookG); smoke.add(cfx, cfy + .1, cfz, t => smooth(9.6, 11.6, t) * (1 - smooth(27, 31, t)), .22, 1.8); g.add(smoke.mesh);
  const dust = makeMotes({ n: 90, area: [16, 1.6, 8], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(dust.mesh);

  // ---- the people
  const abr = mkAbraham(R), sar = mkSarah(rng(81)), vis = [0, 1, 2].map(mkVisitor), men = HH0.map((_, i) => mkMan(rng(200 + i), i));
  [abr, sar, ...vis, ...men].forEach(o => g.add(o.group));
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 5 + i * 1.3, h: 7 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });

  // ---- the Lord: shown only as light on the man who speaks and stays (the film does not say which of the three he is)
  const lGlow = spriteGlow(0, 0, 0, 1.4, 0xffd890, 0), lGlow2 = spriteGlow(0, 0, 0, .55, 0xfff4d0, 0), lPool = pool(1.8, 0xffe0a0, 0); g.add(lGlow, lGlow2, lPool);
  const lMotes = makeMotes({ n: 50, area: [1.8, 2.6, 1.8], size: .026, v: .4, seed: 71, color: 0xffe3a0 }); g.add(lMotes.mesh);
  const sGlow = spriteGlow(0, 0, 0, 1.2, 0xffd890, 0), sGlow2 = spriteGlow(0, 0, 0, .5, 0xfff4d0, 0); g.add(sGlow, sGlow2);
  const godL = new THREE.PointLight(0xffd890, 0, 9, 1.5), cookL = new THREE.PointLight(0xff9a50, 0, 4, 1.7), sarL = new THREE.PointLight(0xffd890, 0, 5, 1.6), duskL = new THREE.PointLight(0xffb870, 0, 12, 1.4);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);

  // ---- the cities of the plain: one far islet with two quarters (Sodom and Gomorrah), fifty small lights that go out one by one for the count
  const sodom = new THREE.Group(); sodom.position.set(...SODOM); g.add(sodom);
  const SRAD = 7.2, hS = (x, z) => { const r = Math.hypot(x, z); return rimf(SRAD, .3 + .06 * Math.sin(x * .9 + z * .6), r, -.02); }, gS = (x, y, z, s) => { const b = C3('#cdb07a').lerp(C3('#b89a62'), .5 * smooth(-1, 1, Math.sin(x * .8 + z * .5))); if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
  sodom.add(mkIslet(rng(9811), SRAD, hS, gS, 18, 52), underRock(rng(9812), SRAD - .1));
  const LIGHTS = []; { const Rr = rng(9815), hb = new GB(Rr);
    const quarter = (cx, cz, nx, nz, sp) => { const b = houseBlock(Rr, cx, cz, nx, nz, sp, hS, 0); const m = meshOf(b); sodom.add(m); };
    quarter(-2.3, -.6, 5, 5, .62); quarter(2.4, .7, 5, 5, .62);
    const pts = []; for (let i = 0; i < 80; i++) { const q = i % 2 ? 1 : 0, cx = q ? 2.4 : -2.3, cz = q ? .7 : -.6, x = cx + (Rr() - .5) * 3.0, z = cz + (Rr() - .5) * 3.0; if (Math.hypot(x, z) > SRAD - 1.6) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .42)) continue; pts.push([x, z]); if (pts.length >= 50) break; }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hS(x, z) + 1.0 + ((i * 7) % 5) * .06, z, .6, 0xffd488, 0); sodom.add(s); LIGHTS.push({ s, x, z, d: Math.hypot(x - .05, z - .05) }); });
    LIGHTS.sort((a, b) => b.d - a.d); LIGHTS.forEach((l, i) => l.rank = i); }          // rank 0 = the outermost light (the first to go out), 49 = the one nearest the middle
  const cityG = spriteGlow(0, .6, 0, 10, 0xff9a50, 0); sodom.add(cityG);
  const cityPts = new THREE.PointLight(0xffa860, 0, 14, 1.5); cityPts.position.set(SODOM[0], SODOM[1] + 1.5, SODOM[2]);

  // ---- sky and far land
  const stars = makeStars({ seed: 18 }); g.add(stars.group);
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22], [SODOM[0], SODOM[2], 9]]); g.add(sea.mesh);
  const CLOUD = [[0, '#f8f0e0'], [24, '#f8f0e0'], [29, '#f4d4a8'], [33, '#e8a078'], [38, '#8a7a9a'], [44, '#3a4268'], [58, '#3a4268'], [60, '#c8b8b0'], [90, '#b8aeb0']];
  const CEM = [[0, '#7a7060'], [24, '#7a7060'], [29, '#6a5a48'], [33, '#5a4a48'], [38, '#3a3a58'], [44, '#161c38'], [58, '#161c38'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const SMK = [[0, '#c8b8a8'], [30, '#b0a098'], [90, '#8a8aa0']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const starOp = t => smooth(35, 43, t) * (1 - smooth(59.4, 60.8, t));
  const starBoost = t => .5 + .35 * smooth(36, 52, t);

  // ---- the lights of the city: how many are lit at time t (fifty, then 45, 40, 30, 20, and ten for good)
  const COUNT = [[0, 50], [48.9, 50], [49.9, 45], [50.4, 45], [50.9, 40], [51.4, 40], [51.9, 30], [52.4, 30], [52.9, 20], [53.4, 20], [54.4, 10], [90, 10]];
  const countAt = t => { let i = 1; while (i < COUNT.length - 1 && t > COUNT[i][0]) i++; const [ta, a] = COUNT[i - 1], [tb, b] = COUNT[i]; return lerp(a, b, ease.inOutSine(seg(t, ta, tb))); };
  const dusk = t => smooth(28.5, 37, t);                                              // the city lights are only seen as the evening comes on

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const state = { abraham: AB0.slice(), sarah: SD.slice(), lord: LORD.slice(), lit: 50 };

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    stars.update(t, starOp(t), starBoost(t), .6 + .0035 * t, cam);
    // the low sun in the west, as the afternoon turns to evening
    { const k = ON(t, 26.0, 28.6, 32.2, 36.4), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0; sunS.position.set(cx - 150, cy + 6, cz + 30); sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01; }
    // the cooking fire by Sarah's tent
    { const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), on = smooth(9.6, 11.4, t) * (1 - smooth(27, 31, t)); cookG.material.opacity = .32 * on * fl; cookG.visible = on > .01; cookL.position.set(cfx, cfy + .5, cfz); cookL.intensity = 2.0 * on * fl; smoke.update(t, colAt(SMK, t)); }
    dust.update(t, .5 * (1 - smooth(26, 34, t)), [1.5, .1, 3.8]);
    // Abraham
    { const p = kp(t, KA), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, sp = 9.5;
      if (t > 6.0 && t < 8.3) sp = 13.5;
      const sit = (1 - smooth(3.6, 4.7, t)), bow = smooth(8.3, 9.1, t) * (1 - smooth(10.2, 11.0, t)), srv = ON(t, 15.6, 16.4, 27.4, 28.2), pl = smooth(34.6, 36.0, t), up = smooth(41.5, 43, t) * (1 - smooth(47.5, 49.5, t));
      const cnt = [[49.6, 1], [50.7, 2], [51.7, 3], [52.7, 4], [54.3, 5]].reduce((a, [tt]) => a + .5 * Math.exp(-Math.pow((t - tt) / .3, 2)), 0);
      if (!mv) { ry = headZ(1, .1);
        if (t > 8.2 && t < 11) ry = headZ(MEET[1][0] - p.x, MEET[1][1] - p.z);
        if (t > 11.2 && t < 16 && t < 12.2) ry = headZ(TB[0] - p.x, TB[1] - p.z);
        if (t > 13 && t < 14.5) ry = headZ(SD[0] - p.x, SD[1] - p.z);
        if (t > 15.4 && t < 28) ry = headZ(TB[0] - p.x, TB[1] - p.z);
        if (t > 34.5) ry = headZ(LORD[0] - p.x, LORD[1] - p.z); }
      const s = 1 - .24 * sit, lx = .1 * sit + 1.05 * bow + .12 * pl;
      ex = { lx, s, a0x: -.25 * srv * (.6 + .4 * Math.sin(t * 1.6)) - .5 * bow - .9 * pl - 1.5 * up * 0 - cnt * 1.4, a1x: -.25 * srv * (.6 + .4 * Math.sin(t * 1.3 + 1)) - .5 * bow - .5 * pl, a0z: -.12 - .5 * pl, a1z: .12 + .5 * pl };
      fig(abr, p.x, p.z, ry, mv, t, 1.1, ex, sp); state.abraham = [p.x, gAt(p.x, p.z), p.z]; }
    // Sarah
    { const p = kp(t, KS), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { ry = headZ(1, -.1); if (t > 13.8 && t < 15.4) ry = headZ(TB[0] - p.x, TB[1] - p.z); if (t > 17.2) ry = headZ(1, -.25);
        const lg = ON(t, 20.5, 21.0, 22.6, 23.4), sh = Math.sin(t * 15) * lg; ex = { lx: .06 * lg + .03 * sh, s: 1 - .03 * lg + .015 * sh, a0x: -1.55 * lg, a0z: -.1, a1x: -.3 * lg, a1z: .12 + .1 * lg }; }
      fig(sar, p.x, p.z, ry, mv, t, 2.4, ex); state.sarah = [p.x, gAt(p.x, p.z), p.z]; }
    // the three men: they walk in from the east (18:2), bow to... they stand while Abraham bows, sit to eat (18:8), stand and look toward Sodom (18:16), two stay on the ridge and one stays with Abraham (18:22)
    vis.forEach((v, i) => { const p = kp(t, KV[i]), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      const seat = smooth(12.6 + i * .25, 13.6 + i * .25, t) * (1 - smooth(28.0 + i * .15, 28.9 + i * .15, t));
      if (!mv) { ry = headZ(-1, -.2);
        if (t > 5 && t < 12) ry = headZ(abr.group.position.x - p.x, abr.group.position.z - p.z);
        if (t >= 12.5 && t < 29.5) ry = headZ(TB[0] - p.x, TB[1] - p.z);
        if (t >= 29.5 && i === 1 && t < 34.4) ry = headZ(1, .5);
        if (i === 1 && t >= 23.0 && t < 29.4) ry = headZ(-1, -.3);                       // the speaker turns toward the tent (Sarah)
        if (t >= 34.4 && i === 1) ry = headZ(ABF[0] - p.x, ABF[1] - p.z);
        if (t >= 29.5 && i !== 1) ry = headZ(SODOM[0] - p.x, SODOM[2] - p.z);
        if (i === 1 && t > 15 && t < 20) ex.lx = .05; }
      ex.s = 1 - .34 * seat; if (seat > .5) ex.lx = (ex.lx || 0) + .1; ex.a0x = (ex.a0x || 0) - .3 * seat * (.5 + .5 * Math.sin(t * 1.4 + i)); if (i === 1 && t > 34.8) ex.a0x = (ex.a0x || 0) - .22 + .1 * Math.sin(t * 1.2);
      fig(v, p.x, p.z, ry, mv, t, i * 1.3 + .3, ex, 8.5); v.group.visible = t > 1.0 + i * .2; if (i === 1) state.lord = [p.x, gAt(p.x, p.z), p.z]; });
    // the household: a few people at the other tents
    men.forEach((m, i) => { const p = HH0[i]; fig(m, p[0], p[1], headZ(1, .2 + i * .3), false, t, i * .9, { lx: .02 * Math.sin(t * .9 + i), a0x: -.05 }); m.group.visible = t < 28; });
    // light on the man who speaks and stays: when he says "is anything too hard for the Lord" (18:14), and while Abraham stands before him (18:22-32)
    { const ls = state.lord, k = Math.max(ON(t, 23.6, 24.6, 27.0, 28.4), ON(t, 14.9, 15.6, 17.4, 18.4) * .35, ON(t, 33.6, 35.4, 59.0, 60.4)), fk = .93 + .07 * Math.sin(t * 2.3), nf = 1 - .5 * (1 - smooth(32, 40, t));
      lGlow.position.set(ls[0], ls[1] + .42, ls[2] - .12); lGlow2.position.set(ls[0], ls[1] + .38, ls[2] - .12); lPool.position.set(ls[0], ls[1] + .05, ls[2]);
      lGlow.material.opacity = .13 * k * fk * (.6 + .4 * (1 - nf)); lGlow2.material.opacity = .1 * k * fk; lPool.material.opacity = .12 * k; lGlow.visible = lGlow2.visible = lPool.visible = k > .01;
      godL.position.set(ls[0] - .5, ls[1] + 1.1, ls[2] + .4); godL.intensity = 1.4 * k * (1 + 1.2 * smooth(32, 44, t)); lMotes.update(t, .7 * k, [ls[0], ls[1], ls[2]]);
      const sa = state.sarah, sk = ON(t, 20.2, 21.2, 23.3, 24.2); sGlow.position.set(sa[0], sa[1] + .3, sa[2] - .08); sGlow2.position.set(sa[0], sa[1] + .26, sa[2] - .08); sGlow.material.opacity = .13 * sk; sGlow2.material.opacity = .05 * sk; sGlow.visible = sGlow2.visible = sk > .01; sarL.position.set(sa[0] + .3, sa[1] + 1.0, sa[2] + .5); sarL.intensity = .9 * sk;
      duskL.position.set(state.abraham[0] - 1.2, state.abraham[1] + 1.4, state.abraham[2] + 2.2); duskL.intensity = 1.8 * smooth(36, 46, t) * (1 - smooth(59, 60.5, t)); }
    // the lights of the cities
    { const n = countAt(t), dk = dusk(t) * (1 - smooth(59.2, 60.6, t)); state.lit = n;
      LIGHTS.forEach(l => { const on = clamp(n - l.rank, 0, 1), tw = .88 + .12 * Math.sin(t * 2.1 + l.x * 7 + l.z * 3), ten = l.rank >= 40 ? 1 + .5 * smooth(54.6, 56.8, t) : 1; l.s.material.opacity = (.6 * on * tw * ten) * dk; l.s.visible = l.s.material.opacity > .004; });
      const cg = ((countAt(t) / 50) * .5 + .25) * dk * (1 + .0); cityG.material.opacity = .2 * cg * (1 + .6 * smooth(54.6, 57.2, t) * (10 / 50 * 3)); cityG.visible = cg > .003; }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t < 30; b.group.position.set(TB[0] + 2 + Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), TB[1] - 5 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 7 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#d4e0f4', '#8a7a58', 1.0, '#fff0d0', 3.0, [-2.5, 9, -2.0], .5, '#ffe0b0', [-8, 5, 7], 14), Dk(20, '#d4e0f4', '#8a7a58', 1.0, '#fff0d0', 2.9, [-3, 8.4, -2.0], .5, '#ffe0b0', [-8, 5, 7], 14),
    Dk(27, '#d8d4e4', '#8a7a58', 1.0, '#ffdcaa', 2.6, [-8, 5.5, 3], .5, '#ffd8a8', [8, 5, 6], 14), Dk(31, '#c0b8d8', '#7a6050', .98, '#ffb070', 2.4, [-10, 3.2, 4], .5, '#9ab0ff', [8, 5, 6], 14),
    Dk(36, '#7a82b8', '#4a3a4a', .92, '#ff9a58', 1.4, [-10, 1.8, 4], .5, '#6a7cff', [8, 5, 6], 14), Dk(42, '#4a5a98', '#2a2a44', .9, '#a8b8f8', .9, [-7, 8, 7], .6, '#8a9cff', [8, 4, 6], 14),
    Dk(50, '#4a5a98', '#1c2038', .9, '#a8b8f8', 1.0, [-7, 9, 8], .6, '#8a9cff', [8, 4, 6], 14), Dk(58.5, '#4a5a98', '#1c2038', .9, '#a8b8f8', 1.0, [-7, 9, 8], .6, '#8a9cff', [8, 4, 6], 14),
    Dk(60, '#8a90a8', '#4c4648', .95, '#e8c8a8', 1.5, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#6a94cc', '#f4e4c0']], [24, ['#6a94cc', '#f6e2b8']], [28, ['#5a80c0', '#f8d49c']], [32, ['#4a62a8', '#f0a070']], [36, ['#2a3a7c', '#c06a6c']], [42, ['#161e56', '#5a3e68']], [50, ['#0a1238', '#2a2c60']], [58.5, ['#070c2a', '#1c2450']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, stars, abr, sar, vis, men, pl: [godL, cookL, sarL, duskL], state };
}
