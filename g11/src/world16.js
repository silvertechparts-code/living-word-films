// Episode 16: Genesis 16. Sarai, Abram's wife, has no child (16:1); she gives her Egyptian servant Hagar to Abram (16:2-3); Hagar conceives and begins to look down on her mistress (16:4); Sarai treats Hagar harshly and Hagar
// runs away (16:6); the angel of the Lord finds her by a spring on the road to Shur (16:7), asks where she has come from and where she is going (16:8), she answers that she is running away from her mistress Sarai (16:8);
// he tells her to go back (16:9) and promises descendants too many to count (16:10), a son named Ishmael because the Lord has heard her suffering (16:11); she calls the Lord "the God who sees me" (16:13); Hagar bears
// Abram a son and Abram names him Ishmael (16:15).
// Cinematic interpretation: the floating camp, the shape of the tents, the dry road and the spring, the look of the sky, the way Hagar walks, kneels and rises, and the column of soft light are not in the text. The angel of the Lord
// is not shown as a figure: only light. No verdict is shown on Sarai or Abram. The reflection (reflect16.js) is a modern picture, not Scripture.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, pool, ringMesh, spriteGlow } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, pineGeo } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf } from './world10.js';
import { makeBird } from './fauna6.js';

export const RIC = 15;
export const TS = [-4.8, .8], TA = [-8.2, 2.8], T3 = [-1.6, -1.8], FIRE = [-3.0, 3.2], SPR = [6.0, 5.6];
export const FH = [-2.2, 4.1], SF = [-3.2, 4.5], AB0 = [-7.0, 4.9], LP = [4.5, 4.6], HS = [4.3, 5.9];
export const EV = { gift: [8.2, 12.0], proud: [13.3, 16.8], harsh: [18.4, 21.0], run: [20.2, 24.4], find: [24.4, 27.9], ask: [29.1, 32.7], answer: [33.8, 37.2], promise: [38.6, 43.7], son: [44.9, 49.6], name: [50.9, 54.5], birth: [55.6, 59.4] };

// ---------------- terrain: green camp in the west, dry dunes and a dusty road to the east, a small spring with a few palms
const ROAD = [[-1.4, 4.6], [1.2, 5.0], [3.4, 5.5], [5.0, 5.7]];
const dRoad = (x, z) => { let m = 99; for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - (ax + u * vx), z - (az + u * vz))); } return m; };
const HILLS = [[-10.5, -5, 1.1, 6], [-11, 7, .8, 5], [9.8, -4.6, 1.7, 5.4], [2.5, -9.5, 1.1, 5], [11.5, 7.0, .9, 4.0]];
const FLATS = [[TS[0] + .6, TS[1] + 2.6, .32, 6.4], [SPR[0], SPR[1], .2, 3.4], [-1.4, 4.9, .3, 2.0]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1) + smooth(-1, 5, x) * (.15 * Math.sin(x * .7 + z * .35) + .09 * Math.sin(x * 1.5 - z * .9));
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const gcC = (x, y, z, s) => { const dry = smooth(-3.5, 3.5, x); let b = C3('#7e9250').lerp(C3('#6e8446'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6b678').lerp(C3('#c4a060'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .92);
  if (y > .95) b.lerp(C3('#9a8a70'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#b8a47a'), .6 * smooth(3.6, 1.6, Math.hypot(x - FIRE[0], z - FIRE[1]))); b.lerp(C3('#b8a47a'), .5 * smooth(4.2, 1.8, Math.hypot(x - TS[0] - .5, z - TS[1] - 1.5)));
  b.lerp(C3('#e4d0a2'), .75 * smooth(.9, .3, dRoad(x, z)));
  b.lerp(C3('#7f9a50'), .85 * smooth(3.6, 1.5, Math.hypot(x - SPR[0], z - SPR[1])));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = (x, z) => hC(x, z);
export const stage = { gAt, TS, TA, T3, FIRE, SPR, FH, SF, AB0, LP, HS };

// ---------------- walkers: keys [[t, x, z], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const KS = [[0, -4.6, 2.7], [5.0, -4.6, 2.7], [7.4, SF[0], SF[1]], [11.0, SF[0], SF[1]], [13.0, -5.4, 4.2], [14.4, -4.6, 2.7], [18.2, -4.6, 2.7], [19.8, SF[0], SF[1]], [22.0, SF[0], SF[1]], [23.6, -4.6, 2.7], [90, -4.6, 2.7]];
const KH = [[0, FH[0], FH[1]], [8.4, FH[0], FH[1]], [11.4, -6.4, 4.5], [13.2, -6.4, 4.5], [15.0, FH[0], FH[1]], [20.2, FH[0], FH[1]], [22.2, 1.4, 5.0], [24.4, 3.8, 5.8], [25.0, HS[0], HS[1]], [90, HS[0], HS[1]]];
const KA = [[0, AB0[0], AB0[1]], [50.0, AB0[0], AB0[1]], [53.8, -2.5, 4.0], [90, -2.5, 4.0]];
export const saraiPos = t => { const p = kp(t, KS); return [p.x, gAt(p.x, p.z), p.z]; };
export const hagarPos = t => { const p = kp(t, KH); return [p.x, gAt(p.x, p.z), p.z]; };
export const abramPos = t => { const p = kp(t, KA); return [p.x, gAt(p.x, p.z), p.z]; };
export const HB = [-3.5, 3.9];            // where Hagar sits with her son (16:15)

// ---------------- little models
const mkAbram = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkSarai = R => person(R, { pants: '#d8c9a6', top: '#6c5a8a', skin: '#d9a073', hair: '#c4bcb0', cloth: '#efe4cc', long: true, sash: '#8a6a46', seed: 61 }, .46);
const mkHagar = R => person(R, { pants: '#3f6a78', top: '#c9a15a', skin: '#8a5a3a', hair: '#1f160d', cloth: '#2f4f72', long: true, sash: '#b5654a', seed: 71 }, .46);
const mkBaby = () => { const g = new THREE.Group(), b = new GB(rng(9)); b.box('#efe4cc', [0, 0, 0], [.2, .1, .11], [0, 0, 0], .02); b.add(G.ico0, '#8a5a3a', [-.1, .03, 0], [.045, .045, .045], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; g.add(m); g.position.set(0, .56, .2); return g; };

// ====================================================================== the world
export function makeWilderness() {
  const R = rng(1616), g = new THREE.Group(), smoke = makeSmoke(4);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9601), RIC, hC, gcC, 30, 80), underRock(rng(9602), RIC - .1));
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); return m; };
  [[-10.6, -3.6, 2.0], [-8.4, -8.0, 2.2], [-11.6, 5.2, 1.7], [-6.2, -6.4, 1.5]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-9.6, 7.6, 1.1], [-5.2, 8.6, 1.0]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  // the spring: a ring of stones, a few palms, green round it
  [[SPR[0] + 1.9, SPR[1] + 1.5, 1.35], [SPR[0] + 2.8, SPR[1] + .4, 1.15], [SPR[0] + 1.0, SPR[1] + 2.4, 1.0]].forEach(([x, z, s]) => tree(x, z, s, 'palm'));
  [[SPR[0] + 1.6, SPR[1] + 3.0, .8], [SPR[0] - 2.2, SPR[1] + 2.4, .7], [SPR[0] + 3.6, SPR[1] + 2.0, .75]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#6a8a44', '#5c7e3a', '#7a9a50']));
  // dry shrubs and rocks along the road and out over the dunes
  for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x < -1.5 || hC(x, z) < .15 || dRoad(x, z) < 1.1 || Math.hypot(x - SPR[0], z - SPR[1]) < 3.4) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 34; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dRoad(x, z) < .6 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.2 || Math.hypot(x - SPR[0], z - SPR[1]) < 1.5) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.18 + R() * .3, .12 + R() * .16, .18 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    // the stone ring round the water, and two cairns along the road
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + .1, rr = 1.22 + .06 * Math.sin(k * 2.3); b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [SPR[0] + Math.cos(a) * rr, hC(SPR[0], SPR[1]) + .05, SPR[1] + Math.sin(a) * rr * .96], [.13, .09, .12], [R() * 3, R() * 3, 0], .05); }
    for (const [cx, cz] of [[1.8, 6.1], [-.2, 3.8]]) for (let k = 0; k < 4; k++) b.add(G.ico0, pk(R, ['#a99c86', '#9a8e7c']), [cx + (R() - .5) * .05, hC(cx, cz) + .05 + .09 * k, cz], [.17 - .03 * k, .09, .16 - .03 * k], [R() * 3, R() * 3, 0], .04);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  // water in the spring
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.14, 32), new THREE.MeshBasicMaterial({ color: 0x78a8c6, transparent: true, opacity: .94, toneMapped: false })); water.rotation.x = -Math.PI / 2; water.position.set(SPR[0], hC(SPR[0], SPR[1]) + .028, SPR[1]); water.renderOrder = 2; ca.add(water);
  const glint = spriteGlow(SPR[0] + .3, hC(SPR[0], SPR[1]) + .12, SPR[1] - .2, .9, 0xfff0c8, .0); ca.add(glint);
  const ripples = [0, 1, 2].map(() => { const r = ringMesh(1, .06, 0xe8f4ff, 0); r.position.set(HS[0] + .55, hC(SPR[0], SPR[1]) + .05, HS[1] - .2); g.add(r); return r; });
  // the camp: three tents, a fire in a stone ring, a mat and a water jar
  [[TS[0], TS[1], .2, '#cdb48c', 1.1], [TA[0], TA[1], .7, '#c2a67a', .8], [T3[0], T3[1], -.4, '#d4c29c', .66]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  { const b = new GB(R); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .24, hC(FIRE[0], FIRE[1]) + .04, FIRE[1] + Math.sin(a) * .24], [.07, .05, .07], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, .5, 0], .01); b.box('#3a2818', [FIRE[0], hC(FIRE[0], FIRE[1]) + .05, FIRE[1]], [.34, .05, .06], [0, -.6, 0], .01);
    b.box('#a8744a', [FIRE[0] - 1.0, hC(FIRE[0] - 1.0, FIRE[1] + 1.0) + .02, FIRE[1] + 1.0], [.7, .03, .5], [0, .3, 0], .01); b.add(G.cylT, '#9a6a44', [FIRE[0] + 1.0, hC(FIRE[0] + 1.0, FIRE[1] - .9), FIRE[1] - .9], [.07, .17, .07], [0, 0, 0], .02);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; ca.add(m); }
  const fy = hC(FIRE[0], FIRE[1]) + .22;
  const fireG = spriteGlow(FIRE[0], fy, FIRE[1], 1.0, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy - .02, FIRE[1], .42, 0xffe0a0, 0); g.add(fireG, fireG2);
  smoke.add(FIRE[0], fy + .1, FIRE[1], t => smooth(.4, 1.4, t), .24, 2.0); g.add(smoke.mesh);
  const campMotes = makeMotes({ n: 30, area: [1.2, 2.6, 1.2], size: .03, v: .5, seed: 33, color: 0xffb860 }); g.add(campMotes.mesh);
  const sand = makeMotes({ n: 90, area: [16, 1.6, 8], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(sand.mesh);

  // ---- the people
  const sarai = mkSarai(rng(81)), hagar = mkHagar(rng(82)), hagar2 = mkHagar(rng(82)), abram = mkAbram(R);
  const baby = mkBaby(); hagar2.group.add(baby);
  [sarai, hagar, hagar2, abram].forEach(o => g.add(o.group));
  const dust = Array.from({ length: 5 }, () => { const s = spriteGlow(0, 0, 0, .8, 0xe8d4a8, 0); s.material.blending = THREE.NormalBlending; g.add(s); return s; });
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 4 + i * 1.3, h: 6 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });

  // ---- light: the angel of the Lord is only light, by the spring
  const beam = shaft(26, .34, .46, [1, .92, .7], .3, .85), beamG = shaft(26, 1.1, 1.35, [1, .86, .55], .12, .45); [beam, beamG].forEach(m => { m.material.opacity = 0; m.visible = false; m.position.set(LP[0], gAt(LP[0], LP[1]), LP[1]); g.add(m); });
  const lPool = pool(2.2, 0xffe0a0, 0); lPool.position.set(LP[0], gAt(LP[0], LP[1]) + .05, LP[1]); g.add(lPool);
  const lGlow = spriteGlow(LP[0], gAt(LP[0], LP[1]) + .55, LP[1], 1.8, 0xffd890, 0), lGlow2 = spriteGlow(LP[0], gAt(LP[0], LP[1]) + .5, LP[1], .7, 0xfff4d0, 0); g.add(lGlow, lGlow2);
  const rings = [0, 1, 2].map(() => { const r = ringMesh(1, .14, 0xffe8b0, 0); r.position.set(LP[0], gAt(LP[0], LP[1]) + .07, LP[1]); g.add(r); return r; });
  const lMotes = makeMotes({ n: 80, area: [2.6, 5.5, 2.6], size: .05, v: .45, seed: 71, color: 0xffe3a0 }); lMotes.mesh.position.set(LP[0], gAt(LP[0], LP[1]), LP[1]); g.add(lMotes.mesh);
  const many = makeMotes({ n: 230, area: [22, 12, 18], size: .07, v: .26, seed: 73, color: 0xffe9b0 }); g.add(many.mesh);
  const lightL = new THREE.PointLight(0xffd890, 0, 11, 1.5), campL = new THREE.PointLight(0xff9a50, 0, 7, 1.7);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);

  // ---- sky and far land
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const CLOUD = [[0, '#e0b898'], [8, '#f4ecde'], [20, '#fbf6ea'], [36, '#f6e4c8'], [44, '#f2c490'], [54, '#f2c490'], [58, '#f4e0bc'], [60, '#c8b8b0'], [90, '#b8aeb0']];
  const CEM = [[0, '#5a4a4a'], [8, '#6a6258'], [44, '#6a5a48'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const SMK = [[0, '#c8b8a8'], [30, '#d8c6b0'], [90, '#b8a898']];
  const WAT = [[0, '#8abad6'], [24, '#8ec0dc'], [44, '#e8c890'], [56, '#8abad6'], [90, '#8abad6']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  const la = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x * (sp > 11 ? 1.5 : 1), a1x: w.a1x * (sp > 11 ? 1.5 : 1) } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const state = { hagar: HS.slice(), sarai: [0, 0, 0] };

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun of the first morning (east), and a warm one in the west after the promise
    { const sk = ON(t, -1, 0.2, 5.5, 9.0), sk2 = ON(t, 39.0, 41.0, 53.0, 55.0), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      sunS.position.set(cx + 150 * (sk2 > sk ? -1 : 1), cy + 7, cz + 30); sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(sk, sk2 * .8); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01; }
    const fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7.3), fon = smooth(.2, 1.2, t) * (1 - smooth(57.5, 60, t));
    fireG.material.opacity = .5 * fon * fl * (1 - .6 * smooth(10, 18, t)); fireG2.material.opacity = .4 * fon * (1 - .6 * smooth(10, 18, t)); fireG.visible = fireG2.visible = fon > .01;
    campL.position.set(FIRE[0], fy + .6, FIRE[1]); campL.intensity = 6 * fon * (.85 + .15 * fl) * (1 - smooth(8, 18, t));
    campMotes.update(t, .8 * fon * (1 - smooth(16, 18, t)), [FIRE[0], fy, FIRE[1]]); smoke.update(t, colAt(SMK, t)); sand.update(t, .5, [1.5, .1, 3.8]);
    water.material.color.set(colAt(WAT, t)); const gl = ON(t, 22, 25, 56, 58) * (.7 + .3 * Math.sin(t * 2.4)); glint.material.opacity = .5 * gl; glint.visible = gl > .01;
    // Sarai: stands at her tent at dawn (16:1), speaks with Hagar (16:2), looks on (16:4), turns on her (16:6)
    { const p = kp(t, KS), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { if (t < 5.0) { ry = headZ(1.0, .5); ex = { lx: .12 * smooth(.6, 2.4, t), a0x: -.1, a1x: -.1 }; }
        else if (t < 11.6) { ry = headZ(.95, -.35); const g1 = ON(t, 7.6, 8.4, 9.4, 10.2); ex = { a0x: -1.0 * g1 - .05, a0z: -.1 - .25 * g1, lx: .04 }; }
        else if (t < 13.4) { ry = headZ(-1, 0); ex = { lx: .06, a0x: -.1, a1x: -.1 }; }
        else if (t < 18.8) { ry = headZ(.9, 1.0); ex = { lx: .14 * smooth(13.4, 14.8, t), a0x: -.3, a1x: -.3, a0z: -.2, a1z: .2 }; }
        else if (t < 22.4) { ry = headZ(1.0, .1); const pt = ON(t, 19.9, 20.5, 21.4, 22.0); ex = { lx: -.06, a0x: -1.6 * pt, a0z: -.15 }; }
        else { ry = headZ(.5, 1.0); ex = { lx: .16, a0x: -.2, a1x: -.2 }; } }
      fig(sarai, p.x, p.z, ry, mv, t, 2.4, ex); state.sarai = [p.x, gAt(p.x, p.z), p.z]; }
    // Hagar: at the fire, goes to Abram, comes back with her head high, runs along the road, sits by the spring, rises, stands (16:3-15)
    { const p = kp(t, KH), mv = p.mv, run = t > EV.run[0] && t < 24.6; let ry = headZ(p.vx, p.vz), ex = {}, s = 1, x = p.x, z = p.z;
      if (!mv) { if (t < 8.4) { ry = headZ(-1, .15); ex = { lx: .05, a0x: -.15 * Math.sin(t * .9), a1x: -.1 }; }
        else if (t < 13.4) { ry = headZ(-1, 0); ex = { lx: .06, a0x: -.2, a1x: -.2 }; }
        else if (t < 20.3) { ry = headZ(.05, 1.0); const pr = smooth(13.6, 15.2, t); ex = { lx: -.1 * pr, a0x: -.55 * pr, a1x: -.55 * pr, a0z: -.1, a1z: .1 }; }
        else { ry = headZ(LP[0] - HS[0], LP[1] - HS[1]);
          const sit = smooth(24.8, 26.2, t) * (1 - smooth(40.3, 41.6, t)); s = 1 - .3 * sit; ex = { lx: .16 * sit - .12 * smooth(30.5, 31.5, t) * sit - .06 * smooth(37, 39, t), a0x: -.3 * sit, a1x: -.2 * sit, s };
          const gs = ON(t, 33.9, 34.6, 36.0, 36.8) * sit; ex.a1x = -.9 * gs - .2 * sit; ex.a1z = .35 * gs + .1;
          const bl = smooth(44.8, 46.0, t) * (1 - smooth(50.2, 51.2, t)); if (bl > .001) { ex.a0x = -.7 * bl; ex.a1x = -.7 * bl; ex.a0z = -.12; ex.a1z = .12; ex.lx = -.04 * bl; }
          const op = smooth(50.8, 52.4, t); if (op > .001) { ex.a0x = -.5 * op; ex.a1x = -.5 * op; ex.a0z = -.1 - .5 * op; ex.a1z = .1 + .5 * op; ex.lx = -.2 * op * (1 - smooth(53.6, 54.4, t)); } } }
      else if (t > 8.2 && t < 14) ex = { lx: .04 };
      fig(hagar, x, z, ry, mv, t, 0, ex, run ? 14 : 9.5); state.hagar = [x, gAt(x, z), z]; hagar.group.visible = t < 56.2;
      // the son: Hagar sits by the tent with the baby in her arms (16:15); a second figure so the cut from the spring is clean
      { const bk = smooth(54.4, 55.2, t); hagar2.group.visible = t > 54.4; baby.visible = t > 54.6; fig(hagar2, HB[0], HB[1], headZ(.25, 1), false, t, 0, { lx: .04, s: .8, a0x: -.7, a1x: -.7, a0z: -.1, a1z: .1 }); }
      // dust behind her feet while she runs
      dust.forEach((d, k) => { const tt = (t * 2.6 + k / dust.length) % 1, on = run ? Math.sin(Math.PI * tt) : 0; d.position.set(x - .35 - .3 * tt + .05 * k, gAt(x, z) + .08 + .22 * tt, z + .04 * Math.sin(k * 3)); d.material.opacity = .32 * on; d.scale.setScalar(.35 + .8 * tt); d.visible = on > .01; }); }
    // Abram: waits by his tent, stands with Hagar when she is given to him (16:3), later stands by her and the child (16:15)
    { const p = kp(t, KA), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { if (t < 14) ry = headZ(1, -.1); else if (t < 53) ry = headZ(.6, .8); else ry = headZ(-.5, 1.0); ex = { lx: t > 55 ? .12 * smooth(55.4, 57, t) : 0, a0x: -.05 }; }
      if (t > 9.4 && t < 13.2) { ry = headZ(.9, -.4); }
      fig(abram, p.x, p.z, ry, mv, t, 1.1, ex); }
    // the angel of the Lord: only a column of light by the spring (16:7), speaking at 16:8-11, then it settles (16:13)
    { const k = ON(t, 25.3, 27.6, 54.0, 55.6), vo = Math.max(ON(t, 29.0, 29.6, 31.6, 32.6), ON(t, 38.5, 39.1, 42.2, 43.6), ON(t, 44.8, 45.4, 48.0, 49.2)), fk = .93 + .07 * Math.sin(t * 2.3), kk = k * (.82 + .18 * vo), dc = cam ? Math.hypot(cam.x - LP[0], cam.z - LP[1], (cam.y - 1.5) * .5) : 14, nf = .4 + .6 * smooth(4, 13, dc);
      beam.visible = beamG.visible = k > .01; beam.material.opacity = .12 * kk * fk * nf; beamG.material.opacity = .035 * kk * fk * nf; lPool.material.opacity = .15 * kk * (.5 + .5 * nf); lPool.visible = k > .01;
      lGlow.material.opacity = .26 * kk * (.55 + .45 * nf); lGlow2.material.opacity = .22 * kk * (.55 + .45 * nf); lGlow.visible = lGlow2.visible = k > .01; lightL.position.set(LP[0] + .3, gAt(LP[0], LP[1]) + 1.1, LP[1] + .3); lightL.intensity = 3.6 * kk;
      rings.forEach((r, i) => { const t0 = [29.1, 38.6, 44.9][i], u = seg(t, t0, t0 + 2.6), o = Math.sin(Math.PI * Math.min(1, u)) * k; r.position.set(LP[0], gAt(LP[0], LP[1]) + .07, LP[1]); r.scale.setScalar(Math.max(.001, .3 + 3.2 * ease.outCubic(u))); r.material.opacity = .34 * o; r.visible = o > .01 && t >= t0 - .1; });
      lMotes.update(t, .8 * k, [LP[0], gAt(LP[0], LP[1]), LP[1]]); lMotes.mesh.position.set(0, 0, 0);
      // descendants too many to count (16:10): lights fill the air
      many.update(t, .85 * ON(t, 38.8, 42.4, 44.6, 47.0), [SPR[0] - 2, gAt(SPR[0], SPR[1]) - .5, SPR[1] - 4]);
      // ripples on the water when she kneels and when she is found
      ripples.forEach((r, i) => { const t0 = 25.2 + i * .7, u = seg(t, t0, t0 + 2.2), o = Math.sin(Math.PI * Math.min(1, u)); r.scale.setScalar(Math.max(.001, .15 + .9 * ease.outCubic(u))); r.material.opacity = .5 * o; r.visible = o > .01; }); }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t > 16 && t < 40; b.group.position.set(SPR[0] - 1 + Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), SPR[1] - 5 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 7 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#8a9cc8', '#5a4a44', .85, '#ffb878', 2.2, [10, 3.2, 6], .55, '#ffc890', [-8, 5, 6], 14), Dk(6, '#9aa8d0', '#645448', .95, '#ffc890', 2.3, [10, 3.8, 6], .5, '#ffcf9a', [-8, 5, 6], 14),
    Dk(14, '#a8b6d8', '#6a5a4c', 1.0, '#ffdcaa', 2.4, [9, 6, 6], .45, '#ffd8a8', [-8, 5, 6], 14), Dk(19, '#b4c0dc', '#7a6a58', 1.05, '#fff0d4', 2.7, [4, 10, 5], .4, '#ffe8c8', [-8, 5, 6], 14),
    Dk(24.4, '#b0bcd8', '#7a6a58', 1.05, '#ffe8c4', 2.5, [-8, 7, 7], .55, '#ffd890', [8, 3, 6], 14), Dk(30, '#a8b4d4', '#6a5a4c', 1.0, '#ffddb0', 2.3, [-9, 5, 7], .6, '#ffd890', [8, 3, 6], 14),
    Dk(38.6, '#9aa4cc', '#645448', .95, '#ffc890', 2.2, [-10, 3.6, 5], .6, '#ffd890', [9, 3, 6], 14), Dk(50, '#9aa4cc', '#645448', .95, '#ffc480', 2.2, [-10, 3.4, 5], .65, '#ffd890', [9, 3, 6], 14),
    Dk(55.4, '#a0aad0', '#6a5a4c', 1.0, '#ffd2a0', 2.3, [10, 4.2, 6], .5, '#ffd8a8', [-8, 5, 6], 14), Dk(60, '#8a90a8', '#4c4648', .95, '#e8c8a8', 1.5, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#3a5a9a', '#f0b878']], [6, ['#4a78b8', '#f4d4a4']], [14, ['#5a88c4', '#f4e0b8']], [19, ['#6a98d0', '#f6ecd0']], [24.4, ['#6a94cc', '#f4e4c0']], [34, ['#5a86c0', '#f4dab0']], [40, ['#4a6aa8', '#f2c490']], [50, ['#4a6aa8', '#f2bc84']],
    [55.4, ['#4a78b8', '#f4d4a4']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, hagar, sarai, abram, pl: [lightL, campL], state };
}
