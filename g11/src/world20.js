// Episode 20: Genesis 20. Abraham travels south and lives for a time in Gerar (20:1); he says of Sarah "she is my sister", and Abimelech, king of Gerar, takes her (20:2); God comes to Abimelech in a dream by night:
// "you are as good as dead because of the woman you have taken; she is a married woman" (20:3); Abimelech had not approached her and asks "Lord, will you destroy an innocent people?" (20:4-5); God answers: "I kept you from sinning against me;
// return the man's wife, for he is a prophet, and he will pray for you, and you shall live" (20:6-7); in the morning Abimelech calls Abraham: "What have you done to us?" (20:8-9); Abraham answers that he thought there was no fear of God in this place
// and that she is in truth his half-sister (20:11-12); Abimelech returns Sarah and gives Abraham sheep, cattle and servants (20:14-16); Abraham prays, and God heals Abimelech, his wife and his female slaves (20:17-18).
// Cinematic interpretation: the floating land, the little walled town, the open sleeping chamber, the column of golden light (God is never shown as a figure: only light), the small figures and the two attendants are not in the text.
// The dream is shown as light over a sleeping man; the film shows nothing of what happens to Sarah in the king's house, only that she is taken in and later returned. Genesis 20:13, 20:15 (the offer of land) and 20:16 (the thousand pieces of silver) are not shown.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, pool, spriteGlow, shaft, ringMesh } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, palmGeo, roundTreeGeo, oliveGeo, crowdPalette, makeSheep, makeOx, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { cloudSea, farMountains10, headZ, C3, rimf, houseBlock, wallRing, meshOf, mkIslet } from './world10.js';
import { makeBird } from './fauna6.js';
import { makeStars } from './stars15.js';

export const RIC = 17;
export const SC = [2.0, -1.0], HW = 3.6, HD = 3.2, GATE = [2.0, SC[1] + HD];              // the town of Gerar: a walled town whose gate faces south, onto the road
export const YG = .34;                                                                    // level of the town's ground
export const BED = [1.9, -2.05], KFEET = [2.12, -2.05];                                   // the couch in the open chamber of the king's house; where the sleeping king's feet are
export const KS = [2.0, -.9], AB = [2.35, .7], SA = [1.95, .5], KM = [2.4, -.2];       // king receiving Sarah; Abraham at prayer; Sarah beside him; the king in the morning courtyard
export const PATH = [[-9.5, 6.6], [-6.4, 5.7], [-3.4, 4.7], [-.9, 3.9], [1.2, 3.4], [2.0, 2.9]];

// ---------------- terrain: dry golden steppe with green patches, the road to the south gate, a flat floor for the town
const HILLS = [[-9.5, -5.5, 1.0, 4.2], [10.5, -6.5, .9, 4.4], [-12, 8.5, .7, 3.4], [11.5, 7.5, .8, 3.8], [-3.5, -10, .9, 4.0], [4.5, -11, 1.0, 4.4]];
const FLATS = [[SC[0], SC[1], YG, 6.6]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.88 + .2 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const dPath = (x, z) => { let m = 1e9; for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], dx = bx - ax, dz = bz - az, u = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)); m = Math.min(m, Math.hypot(x - ax - u * dx, z - az - u * dz)); } return m; };
const gcG = (x, y, z, s) => { let b = C3('#b9a56a').lerp(C3('#a8944f'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  b.lerp(C3('#8a9a54'), .5 * smooth(.2, .9, Math.sin(x * .45 - z * .6)));
  if (y > .95) b.lerp(C3('#9a8a70'), clamp((y - .8) * .7)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#dcc890'), .85 * smooth(.8, .35, dPath(x, z))); b.lerp(C3('#cdb884'), .7 * smooth(6.0, 4.2, Math.hypot(x - SC[0], z - SC[1]))); if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, SC, GATE, BED, KFEET, KS, AB, SA, KM, PATH, YG };

// ---------------- walkers: keys [[t, x, z], ...], linear between keys, still between two equal keys
function kpl(t, K) { const n = K.length; if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], mv: false, vx: K[1][1] - K[0][1], vz: K[1][2] - K[0][2] };
  if (t >= K[n - 1][0]) { const p = K[n - 2], q = K[n - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  let i = 1; while (i < n - 1 && t > K[i][0]) i++; const a = K[i - 1], b = K[i], u = (t - a[0]) / (b[0] - a[0]), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01, vx: b[1] - a[1], vz: b[2] - a[2] }; }
// Abraham: the road to the gate (a1), he speaks to the men of the town and watches Sarah go in (b1); in the morning he comes into the courtyard (d1-e2)
const KAB = [[0, -5.6, 5.2], [4.9, .55, 3.45], [5.6, .95, 3.15], [12.5, .95, 3.15], [33.4, 1.7, 3.9], [35.4, AB[0], AB[1]], [90, AB[0], AB[1]]];
// Sarah: beside him on the road, led by the king's attendants through the gate to the king (b1), returned out of the king's house in the morning (d3), then to Abraham (e1)
const KSA = [[0, -6.2, 4.95], [5.0, -.1, 3.3], [5.7, .35, 3.25], [9.3, .35, 3.25], [10.1, 1.55, 3.0], [10.8, 2.0, 2.4], [11.7, 2.0, 1.2], [12.4, 2.0, .2], [13.0, 2.0, .2], [13.1, 2.0, -1.5], [44.8, 2.0, -1.5], [46.4, 1.55, -.3], [48.9, 1.55, -.3], [51.0, SA[0], SA[1]], [90, SA[0], SA[1]]];
// the two attendants of the king: they come along the road to the gate (b1) and lead Sarah in
const KAT = [[[0, 7.5, 4.4], [7.0, 3.6, 3.8], [8.8, 1.2, 3.2], [9.3, 1.2, 3.2], [10.1, 1.9, 2.7], [10.8, 2.0, 1.9], [11.7, 1.9, .7], [12.4, 1.55, -.1], [13.0, 1.55, -.1], [90, 1.55, -.1]],
  [[0, 8.4, 4.9], [7.2, 4.2, 4.1], [9.0, 1.7, 3.7], [9.5, 1.7, 3.7], [10.3, 2.0, 3.3], [11.0, 2.0, 2.5], [11.9, 2.4, 1.2], [12.5, 2.5, .5], [13.0, 2.5, .5], [90, 2.5, .5]]];
const KTW = [[[0, 3.1, 3.7], [10.4, 3.1, 3.7], [11.5, 6.4, 4.8], [90, 6.4, 4.8]], [[0, 3.55, 3.15], [10.6, 3.55, 3.15], [11.7, 6.8, 4.1], [90, 6.8, 4.1]]];
// the king after he wakes: he gets up, walks to the courtyard and sends for Abraham
const KKG = [[33.9, 2.3, -1.7], [35.2, KM[0], KM[1]], [90, KM[0], KM[1]]];
// the king's gifts to Abraham: sheep, cattle and servants come across the courtyard (e1)
const ANIM_CAR = [[0, -4.4, 5.9], [4.9, -.9, 3.95], [5.8, -.7, 3.8], [90, -.7, 3.8]];

// ---------------- little models
const mkAbraham = R => person(R, { pants: '#6a4a30', top: '#b5654a', skin: '#c08258', hair: '#2a1a10', beard: '#2a1a10', sash: '#3a2a1a', seed: 52 }, .48);
const mkSarah = R => person(R, { pants: '#d9ccb0', top: '#5e7fa6', skin: '#c98d62', hair: '#2a1a10', long: true, cloth: '#efe4cc', seed: 53 }, .45);
const mkKing = R => { const f = person(R, { pants: '#efe4cc', top: '#8a2e3c', skin: '#b57a50', hair: '#1a1008', beard: '#1a1008', sash: '#d8b84a', mantle: '#a8782a', seed: 63 }, .5);
  const c = new THREE.Mesh(new THREE.TorusGeometry(.105, .017, 6, 16), new THREE.MeshBasicMaterial({ color: 0xe8c050, toneMapped: false })); c.rotation.x = Math.PI / 2; c.position.set(0, 1.0, 0); f.group.add(c); return f; };
const ATC = [{ pants: '#d8c9a6', top: '#7a5a3a', skin: '#a8744a', hair: '#1f160d', beard: '#1f160d', sash: '#3a2a1a', seed: 91 }, { pants: '#cdbf9c', top: '#5a6a4a', skin: '#b98a62', hair: '#2e1d10', sash: '#3a2a1a', seed: 93 }];
const mkAtt = i => person(rng(310 + i), ATC[i], .5);
const mkMan = (R, i) => { const c = crowdPalette(R); return person(R, { pants: c.robe, top: c.robe2, skin: c.skin, hair: c.hair, beard: R() < .6 ? c.hair : undefined, cloth: c.cloth, seed: 410 + i }, .46 + .02 * (i % 3)); };
const mkWoman = (R, i) => person(R, i ? { pants: '#cdbf9c', top: '#a2564e', skin: '#cf9468', hair: '#2a1a10', cloth: '#efe4cc', long: true, seed: 77 } : { pants: '#d8c9a6', top: '#c9a15a', skin: '#c58c60', hair: '#3a2616', cloth: '#e4d8c0', long: true, seed: 75 }, .44);

// ====================================================================== the world
export function makeGerar() {
  const R = rng(2020), g = new THREE.Group();
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9901), RIC, hC, gcG, 30, 80), underRock(rng(9902), RIC - .1));
  const tree = (grp, hf, x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, cols || ['#7a9a4a', '#6f9440', '#8aa656', '#648a38']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hf(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; grp.add(m); return m; };
  [[-12.5, 2.0, 1.6], [-11, -2.5, 1.5], [-8, -4, 1.4], [-4.2, -7.5, 1.5], [1.8, -8, 1.6], [8.0, -7.4, 1.5], [10.8, .6, 1.4], [9.4, 6.6, 1.3], [4.6, 7.4, 1.2], [-11.2, 4.6, 1.3]].forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'round'));
  [[-6.2, 2.4, 1.0], [7.4, 3.8, 1.0], [6.8, -3.6, .9], [-3.2, 6.8, .9]].forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'olive'));
  [[6.4, 3.4, 1.2], [4.9, 1.5, .7]].forEach(([x, z, s]) => tree(ca, hC, x, z, s, 'palm'));
  for (let i = 0; i < 12; i++) { const a = R() * TAU, r = 6 + R() * 9, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .15 || (x > -3 && x < 7 && z > -5.6 && z < 3.4) || dPath(x, z) < 1.2) continue; tree(ca, hC, x, z, .4 + R() * .35, 'round', ['#b0a062', '#9c8e58', '#bcae70', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 26; k++) { const a = R() * TAU, r = 3 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .9 || (x > -2.4 && x < 6.4 && z > -5 && z < 3.2)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.1 + R() * .22, .07 + R() * .12, .1 + R() * .2], [R() * 3, R() * 3, 0], .04); }
    ca.add(meshOf(b)); }
  // ---- Gerar: a walled town whose south gate faces the road, with low wall so the courtyard can be seen from above
  { const wm = meshOf(wallRing(R, SC[0], SC[1], HW, HD, hC, 0, true)); wm.scale.y = .64; wm.position.y = YG * (1 - .64); ca.add(wm); }
  ca.add(meshOf(houseBlock(R, -.75, -.7, 1, 3, .9, hC, 0)), meshOf(houseBlock(R, 4.75, -.5, 1, 3, .9, hC, 0)), meshOf(houseBlock(R, -.75, -3.2, 1, 1, .9, hC, 0)), meshOf(houseBlock(R, 4.75, -3.3, 1, 1, .9, hC, 0)));
  // ---- the king's house: a broad low palace; in front a chamber open to the courtyard and to the sky between two pillars, with a couch in it
  { const b = new GB(R), y = YG;
    b.box('#cdb88e', [2.0, y + .04, -2.3], [4.4, .08, 3.0], [0, 0, 0], .03);                                                // base
    b.box('#d8c598', [2.0, y + .5, -3.3], [4.2, 1.0, 1.1], [0, 0, 0], .04); b.box('#e2d1a6', [2.0, y + 1.2, -3.35], [3.0, .4, .9], [0, 0, 0], .04); b.box('#e0b848', [2.0, y + 1.42, -3.35], [3.06, .05, .96], [0, 0, 0], .02);
    for (const s of [-1, 1]) { b.box('#d4c29c', [2.0 + s * 1.5, y + .45, -2.075], [1.0, .9, 1.35], [0, 0, 0], .04); b.box('#e0b848', [2.0 + s * 1.5, y + .93, -2.075], [1.06, .05, 1.41], [0, 0, 0], .02); b.box('#3a2a1c', [2.0 + s * 1.5, y + .36, -1.39], [.22, .42, .03], [0, 0, 0], .01); }
    b.box('#d8c598', [2.0, y + .5, -2.7], [2.0, 1.0, .1], [0, 0, 0], .03); b.box('#241508', [2.0, y + .36, -2.64], [.5, .62, .04], [0, 0, 0], .01);   // the back wall of the chamber, with a dark door
    for (const s of [-1, 1]) b.box('#efe4c8', [2.0 + s * .95, y + .42, -1.45], [.11, .84, .11], [0, 0, 0], .02);          // two pillars
    b.box('#e0b848', [2.0, y + .87, -1.45], [2.1, .07, .15], [0, 0, 0], .02); b.box('#cdb88e', [2.0, y + .91, -1.45], [2.1, .03, .2], [0, 0, 0], .02);
    // the couch: a low frame, mattress and pillow sized to the little figures, and a blanket over the lower half of the sleeper
    b.box('#6a4a2c', [BED[0], y + .17, BED[1]], [1.0, .1, .44], [0, 0, 0], .03); for (const [dx, dz] of [[-.45, -.17], [.45, -.17], [-.45, .17], [.45, .17]]) b.box('#4a3420', [BED[0] + dx, y + .08, BED[1] + dz], [.06, .16, .06], [0, 0, 0], .01);
    b.box('#e0d0a8', [BED[0], y + .255, BED[1]], [.96, .06, .4], [0, 0, 0], .03); b.box('#cfc0a0', [1.55, y + .3, BED[1]], [.22, .05, .3], [0, 0, 0], .03);
    // little lamps either side of the couch, and a jar
    for (const x of [1.15, 2.85]) { b.box('#4a3624', [x, y + .13, -1.85], [.05, .26, .05], [0, 0, 0], .01); b.box('#a8783a', [x, y + .29, -1.85], [.09, .05, .09], [0, 0, 0], .01); }
    b.add(G.cylT, '#a8744a', [2.82, y + .1, -2.4], [.1, .2, .1], [0, 0, 0], .04);
    // a well in the courtyard
    b.add(G.cylT, '#a89878', [3.9, y + .14, .6], [.26, .28, .26], [0, 0, 0], .04); b.add(G.cylT, '#2a2018', [3.9, y + .29, .6], [.19, .02, .19], [0, 0, 0], .01);
    ca.add(meshOf(b)); }
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(.4, .12, .36), new THREE.MeshLambertMaterial({ color: 0x8a4a3c })); blanket.position.set(2.08, YG + .46, BED[1]); blanket.castShadow = true; ca.add(blanket);
  // the gate lamps and the windows of the town
  const lamps = [[1.5, 2.5], [2.5, 2.5]].map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .45, z, .5, 0xffb860, 0); g.add(s); return s; });
  const lampsIn = [[1.15, -1.85], [2.85, -1.85]].map(([x, z]) => { const s = spriteGlow(x, YG + .38, z, .42, 0xffb860, 0); g.add(s); return s; });
  const WINS = []; { const Rr = rng(9915), rects = [[-1.2, -.3, -2.1, 1.0], [4.2, 5.3, -2.0, 1.1]], pts = [];
    for (let i = 0; i < 220 && pts.length < 14; i++) { const [x0, x1, z0, z1] = rects[i % 2], x = lerp(x0, x1, Rr()), z = lerp(z0, z1, Rr()); if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .45)) continue; pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + .42 + ((i * 7) % 5) * .05, z, .34, 0xffc878, 0); g.add(s); WINS.push({ s, ph: i * 1.9, ord: Rr() }); }); }
  const dust = makeMotes({ n: 70, area: [18, 1.6, 9], size: .03, v: .06, seed: 35, color: 0xf0d9a0 }); g.add(dust.mesh);

  // ---- the people and the animals
  const abr = mkAbraham(rng(81)), sar = mkSarah(rng(83)), king = mkKing(rng(85)), att = [0, 1].map(mkAtt), tw = [0, 1].map(i => mkMan(rng(230 + i), i)), srv = [0, 1, 2].map(i => mkMan(rng(250 + i), 3 + i)), wom = [0, 1].map(i => mkWoman(rng(270 + i), i));
  [abr, sar, king, ...att, ...tw, ...srv, ...wom].forEach(o => g.add(o.group));
  const don = makeDonkey(rng(130)), caSh = [0, 1].map(i => makeSheep(rng(140 + i))), gSh = [0, 1, 2].map(i => makeSheep(rng(150 + i))), gOx = [0, 1].map(i => makeOx(rng(160 + i)));
  don.group.scale.setScalar(.5); caSh.forEach(s => s.group.scale.setScalar(.55)); gSh.forEach(s => s.group.scale.setScalar(.55)); gOx.forEach(o => o.group.scale.setScalar(.5));
  [don, ...caSh, ...gSh, ...gOx].forEach(o => g.add(o.group));
  const birds = Array.from({ length: 3 }, (_, i) => { const b = makeBird(rng(700 + i), '#8a8478'); b.group.scale.setScalar(.6); g.add(b.group); return { ...b, r: 5 + i * 1.3, h: 7 + i * .6, w: (.16 + .02 * i) * (i % 2 ? 1 : -1), ph: i * 2.1 }; });

  // ---- God is not shown: only light. A column of soft gold over the sleeping king, a glow, a ring on the floor, rising motes.
  const godShaft = shaft(5.2, .9, .28, [1, .84, .46], 1, .3); godShaft.position.set(BED[0], YG + .3, BED[1]); g.add(godShaft);
  const godG = spriteGlow(BED[0], YG + 1.0, BED[1], 3.4, 0xffd890, 0), godG2 = spriteGlow(BED[0], YG + .62, BED[1], 1.3, 0xfff2cc, 0); g.add(godG, godG2);
  const godRing = ringMesh(.5, .05, 0xffd890, 0); godRing.position.set(BED[0], YG + .13, BED[1]); g.add(godRing);
  const godMotes = makeMotes({ n: 70, area: [.9, 3.2, .9], size: .04, v: .35, seed: 77, color: 0xffe3a0 }); g.add(godMotes.mesh);
  const godL = new THREE.PointLight(0xffd090, 0, 7, 1.5), lampL = new THREE.PointLight(0xffb870, 0, 5, 1.6), healL = new THREE.PointLight(0xffd8a0, 0, 7, 1.5);
  // the healing at the end: a softer column over Abraham at prayer, glow over the household
  const prayShaft = shaft(4.4, .75, .3, [1, .85, .5], 1, .3); prayShaft.position.set(AB[0], YG + .3, AB[1]); g.add(prayShaft);
  const healG = spriteGlow(2.3, YG + .9, .3, 5.0, 0xffd890, 0); g.add(healG);
  const healMotes = makeMotes({ n: 80, area: [4.0, 1.6, 3.0], size: .035, v: .2, seed: 79, color: 0xffe6a8 }); g.add(healMotes.mesh);

  // ---- sky and far land
  const stars = makeStars({ seed: 20 }); g.add(stars.group);
  const far = farMountains10(rng(63)); g.add(far);
  const sea = cloudSea(rng(64), 190, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const CLOUD = [[0, '#f2c8a0'], [5, '#ecbc90'], [9, '#c89a98'], [12.2, '#323a68'], [32, '#323a68'], [34.2, '#c8a0a0'], [37, '#f8e0b8'], [58.5, '#f0d8b8'], [60, '#c8b8b0'], [90, '#b8aeb0']];
  const CEM = [[0, '#6a5a48'], [5, '#6a5040'], [9, '#5a4a48'], [12.2, '#1a2038'], [32, '#1a2038'], [34.2, '#5a4a4a'], [37, '#7a6a50'], [58.5, '#6a5a48'], [60, '#4a4a58'], [90, '#3c3c4c']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const starOp = t => smooth(9.5, 12.8, t) * (1 - smooth(32.6, 35, t)), starBoost = t => .5 + .3 * smooth(12, 30, t);
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y) { const w = walkAnim(t, ph, sp); pose(f, x, (y ?? gAt(x, z)) - .02 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const face = (x, z, tx, tz) => headZ(tx - x, tz - z);
  function ani(an, x, z, ry, mv, t, i, on = 1, sc = 1) { const s0 = an.group.userData.s0 ?? (an.group.userData.s0 = an.group.scale.x); an.group.position.set(x, gAt(x, z) - .02, z); an.group.rotation.y = ry; an.group.scale.setScalar(s0 * sc * Math.max(.001, on)); an.group.visible = on > .01; if (mv) walkLegs(an.legs, t + i, 4.4, .32); }
  // the windows of God's speech (c2): the light swells with each phrase; Abimelech's own words (c1) are answered more softly
  const GSP = [[25.6, 26.75], [26.85, 28.3], [28.45, 30.8], [30.95, 32.9]], speakG = t => GSP.reduce((m, [a, b]) => Math.max(m, smooth(a - .1, a + .25, t) * (1 - smooth(b - .1, b + .3, t))), 0);
  const KSP = [[19.4, 21.6], [22.0, 24.6]], speakK = t => KSP.reduce((m, [a, b]) => Math.max(m, smooth(a - .1, a + .25, t) * (1 - smooth(b - .1, b + .3, t))), 0);
  const state = { abr: [0, 0, 0], sar: [0, 0, 0], king: [0, 0, 0] };

  function update(t, camera) {
    const cam = camera && camera.position;
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    stars.update(t, starOp(t), starBoost(t), .6 + .0035 * t, cam);
    { const k = ON(t, 33.2, 37, 58.5, 60.8), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0; sunS.position.set(cx + 150, cy + 6 + 8 * smooth(34, 55, t), cz - 12); sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .5 * k; sunS2.material.opacity = .7 * k; sunS.visible = sunS2.visible = k > .01; }
    dust.update(t, .5 * (1 - smooth(8, 12, t)) + .4 * smooth(34, 38, t), [1, .1, 3]);
    // evening: the gate lamps and the windows come on at dusk, burn through the night, and go out at dawn
    { const lampK = smooth(8.5, 12.5, t) * (1 - smooth(33, 35.5, t)); lamps.forEach((s, i) => { s.material.opacity = .7 * lampK * (.9 + .1 * Math.sin(t * 9 + i * 2)); s.visible = lampK > .01; });
      lampsIn.forEach((s, i) => { s.material.opacity = .62 * lampK * (.9 + .1 * Math.sin(t * 11 + i * 3)); s.visible = lampK > .01; });
      WINS.forEach(w => { const on = smooth(8.5 + w.ord * 3, 11 + w.ord * 3, t) * (1 - smooth(32.5 + w.ord * 2, 35 + w.ord * 2, t)), tw2 = .88 + .12 * Math.sin(t * 2.1 + w.ph); w.s.material.opacity = .62 * on * tw2; w.s.visible = w.s.material.opacity > .004; });
      lampL.position.set(2.0, YG + .8, -1.7); lampL.intensity = 1.3 * lampK * (.92 + .08 * Math.sin(t * 7)); }
    // ---- Abraham
    { const p = kpl(t, KAB), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {}, y;
      const talk = ON(t, 6.4, 6.9, 9.0, 9.4), point = ON(t, 7.6, 8.2, 8.8, 9.3), worry = ON(t, 9.6, 10.2, 12.2, 12.5), sp1 = ON(t, 39.3, 39.8, 44.4, 44.9), sp2 = ON(t, 45.7, 46.0, 47.6, 47.9), pray = smooth(54.6, 55.4, t) * (1 - smooth(58.0, 58.8, t)), lis = ON(t, 35.4, 36.0, 38.0, 38.9);
      if (!mv) { if (t < 12.6) ry = face(p.x, p.z, 3.1, 3.7); if (t >= 9.4 && t < 12.6) ry = face(p.x, p.z, 2.0, 2.0); if (t >= 35.3) ry = face(p.x, p.z, KM[0], KM[1]); if (t >= 45.5 && t < 48.5) ry = face(p.x, p.z, KM[0], KM[1]) + .35; if (t >= 53.9) ry = face(p.x, p.z, KM[0] + .6, KM[1] + 3); }
      ex = { lx: .12 * worry + .1 * lis + .5 * pray, s: 1 - .26 * pray, a0x: -.7 * talk * (.5 + .5 * Math.sin(t * 3.1)) - 1.0 * point - .5 * sp1 * (.5 + .5 * Math.sin(t * 2.6)) - .6 * sp2 * (.5 + .5 * Math.sin(t * 3.0)) - 2.4 * pray, a1x: -.45 * talk * (.5 + .5 * Math.sin(t * 2.3 + 1)) - .4 * sp1 * (.5 + .5 * Math.sin(t * 2.2 + 1)) - 2.4 * pray, a0z: -.1 - .3 * talk - .3 * sp1 + .3 * pray, a1z: .1 + .3 * talk + .3 * sp1 - .3 * pray };
      fig(abr, p.x, p.z, ry, mv, t, 1.1, ex, 9.5); abr.group.visible = t < 12.6 || t > 33.3; state.abr = [p.x, gAt(p.x, p.z), p.z]; }
    // ---- Sarah
    { const p = kpl(t, KSA), mv = p.mv; let ry = headZ(p.vx, p.vz), ex = {};
      if (!mv) { if (t < 9.3) ry = face(p.x, p.z, 3.1, 3.7) + .3; else if (t < 13) ry = face(p.x, p.z, KS[0], KS[1]); else if (t >= 44.5 && t < 49) ry = face(p.x, p.z, KM[0], KM[1]); else if (t >= 49) ry = face(p.x, p.z, AB[0], AB[1]) + .6; }
      ex = { lx: .08 * ON(t, 10.0, 10.8, 12.0, 12.8) + .08 * ON(t, 54.8, 55.6, 58, 58.8), a0x: -.45 * smooth(5.8, 6.4, t) * (1 - smooth(9.2, 9.5, t)) - .45 * ON(t, 46.4, 47.0, 48.8, 49.2), a1x: -.45 * smooth(5.8, 6.4, t) * (1 - smooth(9.2, 9.5, t)) - .45 * ON(t, 46.4, 47.0, 48.8, 49.2) };
      fig(sar, p.x, p.z, ry, mv, t, 3.1, ex, 9); sar.group.visible = t < 12.95 || t > 44.7; state.sar = [p.x, gAt(p.x, p.z), p.z]; }
    // ---- the king: he receives Sarah (b1), sleeps on the couch (b2-c2), wakes, walks out and speaks to Abraham (d1), returns Sarah (e1)
    { let x, z, y = null, ry = 0, ex = {}, mv = false, lx = 0, sc = 1;
      const kk = kpl(t, KKG);
      if (t < 12.55) { x = KS[0]; z = KS[1]; ry = face(x, z, 2.0, .6); ex = { a0x: -.3 * ON(t, 10.8, 11.4, 12.0, 12.5), a1x: -.3 * ON(t, 10.8, 11.4, 12.0, 12.5), lx: .05 * ON(t, 11.0, 11.6, 12.0, 12.5) }; }
      else if (t < 32.9) { x = KFEET[0]; z = KFEET[1]; y = YG + .4; ry = Math.PI / 2; lx = -1.5; const br = Math.sin(t * 1.6) * .012;
        ex = { a0x: -1.6 * speakK(t) * (.6 + .4 * Math.sin(t * 2.5)) - .5 * smooth(15, 17, t) * (1 - speakK(t)) * .0, a1x: -.9 * speakK(t) * (.5 + .5 * Math.sin(t * 2.0 + 1)), a0z: -.12, a1z: .12, s: 1 + br * 2 }; }
      else if (t < 33.9) { const u = ease.inOutSine(seg(t, 32.9, 33.9)); x = lerp(KFEET[0], KKG[0][1], u); z = lerp(KFEET[1], KKG[0][2], u); y = lerp(YG + .4, YG, u); ry = lerp(Math.PI / 2, 0, u); lx = lerp(-1.5, 0, u); }
      else { x = kk.x; z = kk.z; mv = kk.mv; ry = mv ? headZ(kk.vx, kk.vz) : face(x, z, AB[0], AB[1]);
        const call = ON(t, 35.5, 36.0, 37.6, 38.2), off = ON(t, 49.2, 49.8, 52.6, 53.4), lis = ON(t, 39.6, 40.2, 44.4, 45.0);
        ex = { a0x: -.9 * call * (.5 + .5 * Math.sin(t * 2.7)) - .8 * off, a1x: -.5 * call * (.5 + .5 * Math.sin(t * 2.3 + 1)) - .5 * off, a0z: -.1 - .4 * call - .3 * off, a1z: .1 + .4 * call + .3 * off, lx: .06 * lis + .05 * ON(t, 54.8, 55.6, 58, 58.8) }; if (t >= 45.5 && t < 48.8 && !mv) ry = face(x, z, AB[0], AB[1]) - .3; }
      fig(king, x, z, ry, mv, t, 5.2, { ...ex, lx: (ex.lx || 0) + lx }, 9.5, y ?? gAt(x, z)); king.group.visible = t > 8.9; state.king = [x, y ?? gAt(x, z), z]; }
    // ---- the king's attendants
    att.forEach((a, i) => { const p = kpl(t, KAT[i]), mv = p.mv; let ry = headZ(p.vx, p.vz);
      if (!mv) ry = face(p.x, p.z, 2.0, 1.0) + (i ? -.3 : .3);
      fig(a, p.x, p.z, ry, mv, t, 6.2 + i, {}, 9.5); a.group.visible = t > 7.0 && t < 13.0; });
    tw.forEach((a, i) => { const p = kpl(t, KTW[i]), mv = p.mv; let ry = headZ(p.vx, p.vz), lis = ON(t, 6.6, 7.0, 9.0, 9.6);
      if (!mv) ry = face(p.x, p.z, 1.3, 3.2) + .15 * Math.sin(t * .8 + i);
      fig(a, p.x, p.z, ry, mv, t, 7.4 + i, { lx: .08 * lis, a0x: -.25 * lis * i }, 9.5); a.group.visible = t > 4.5 && t < 11.9; });
    // ---- the animals that travel with Abraham, and the king's gifts (e1)
    { const p = kpl(t, ANIM_CAR), mv = p.mv, ry = mv ? headZ(p.vx, p.vz) : headZ(1, -.2), vis = 1 - smooth(11.0, 12.4, t), st = smooth(4.6, 6.2, t);
      // they follow Abraham along the road, then settle on the far side of him from the camera
      const fo = [[-.5, .55, 1.15, .75], [-1.0, .1, 1.4, .05], [-1.4, .8, 1.0, 1.25]].map(([a, b, c, d]) => [lerp(a, c, st), lerp(b, d, st)]);
      ani(don, p.x + fo[0][0], p.z + fo[0][1], ry, mv, t, 0, vis); ani(caSh[0], p.x + fo[1][0], p.z + fo[1][1], ry, mv, t, 1, vis); ani(caSh[1], p.x + fo[2][0], p.z + fo[2][1], ry, mv, t, 2, vis); }
    { const on = smooth(48.7, 49.2, t);
      // the king's gifts (20:14): sheep, cattle and servants come across the courtyard to Abraham; [fromX, fromZ, toX, toZ]
      const SH = [[4.6, -.5, 3.15, 1.55], [4.9, -.1, 3.65, 1.75], [4.4, -.8, 2.85, 1.85]], OX = [[5.0, -.9, 3.95, 1.6], [5.1, -.4, 4.3, 1.9]], SV = [[4.4, -.6, 3.3, 1.2], [4.7, -.2, 3.55, 1.45]];
      const leg = (t0, t1) => ease.inOutSine(seg(t, t0, t1));
      gSh.forEach((s, i) => { const [fx, fz, tx, tz] = SH[i], u = leg(49.4 + i * .12, 52.4 + i * .12); ani(s, lerp(fx, tx, u), lerp(fz, tz, u), headZ(tx - fx, tz - fz), u > .01 && u < .99, t, i, on); });
      gOx.forEach((o, i) => { const [fx, fz, tx, tz] = OX[i], u = leg(49.5 + i * .2, 52.8 + i * .2); ani(o, lerp(fx, tx, u), lerp(fz, tz, u), headZ(tx - fx, tz - fz), u > .01 && u < .99, t, i + 3, on); });
      srv.forEach((s, i) => { if (i > 1) { s.group.visible = false; return; } const [fx, fz, tx, tz] = SV[i], u = leg(49.2 + i * .25, 52.2 + i * .25), mv = u > .01 && u < .99, x = lerp(fx, tx, u), z = lerp(fz, tz, u);
        fig(s, x, z, mv ? headZ(tx - fx, tz - fz) : face(x, z, AB[0], AB[1]), mv, t, 8 + i, { lx: .05 * ON(t, 54.8, 55.6, 58, 58.8) }, 9.5); s.group.visible = t > 49.1; });
      srv[2].group.visible = false; }
    // ---- the household: the king's wife and women of the house come out and stand near the king while Abraham prays (e2)
    wom.forEach((w, i) => { const on = smooth(53.9 + i * .3, 54.4 + i * .3, t), x = KM[0] + (i ? .75 : -.7), z = KM[1] - .15 + (i ? .15 : 0); fig(w, x, z, face(x, z, AB[0], AB[1]), false, t, 9 + i, { lx: .08 * ON(t, 55, 55.8, 58, 58.8), s: Math.max(.001, on), sx: Math.max(.001, on) }); w.group.visible = on > .01; });
    // ---- God's light in the dream (20:3-7): a column of soft gold over the sleeping king, a glow, a ring on the floor, rising motes, and warm light in the open chamber
    { const k = ON(t, 13.4, 16.2, 32.8, 34.3), sw = .55 + .38 * speakG(t) + .12 * speakK(t), fl = .96 + .04 * Math.sin(t * 2.7), o = k * sw * fl;
      godShaft.material.opacity = .36 * o; godShaft.visible = o > .01; godG.material.opacity = .2 * o; godG2.material.opacity = .3 * o; godG.visible = godG2.visible = o > .01;
      const rp = (t * .5) % 1; godRing.scale.setScalar(.6 + 1.6 * rp); godRing.material.opacity = .5 * k * (1 - rp) * (.4 + .6 * speakG(t) + .3 * speakK(t)); godRing.visible = k > .01;
      godMotes.update(t, 1.1 * k, [BED[0], YG + 1.6, BED[1]]); godL.position.set(BED[0], YG + 1.5, BED[1] + .3); godL.intensity = 1.7 * o; }
    // ---- the healing (20:17-18): a soft column over Abraham at prayer and a warm glow over the household
    { const k = ON(t, 54.9, 56.4, 58.6, 60.4), fl = .95 + .05 * Math.sin(t * 2.3); prayShaft.material.opacity = .42 * k * fl; prayShaft.visible = k > .01;
      healG.material.opacity = .22 * k * fl; healG.visible = k > .01; healMotes.update(t, k, [2.3, .5, .3]); healL.position.set(2.3, YG + 1.4, .4); healL.intensity = 2.6 * k * fl; }
    birds.forEach((b, i) => { const a = t * b.w + b.ph; b.group.visible = t < 9 || (t > 35 && t < 62); b.group.position.set(2 + Math.cos(a) * b.r * .8, 5 + b.h * .3 + Math.sin(t * .5 + i), -1 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#d8d4e4', '#8a7a58', 1.0, '#ffcc88', 3.0, [-8, 5, 4], .5, '#ffd8a8', [8, 5, 6], 14), Dk(5, '#d0c8d8', '#7a6a50', .98, '#ffb878', 2.6, [-9, 3.8, 4], .5, '#ffb888', [8, 5, 6], 14),
    Dk(9, '#9a8aa8', '#5a4838', .92, '#ff9a58', 1.9, [-10, 2.4, 4], .55, '#ff9060', [8, 4, 6], 14), Dk(12.2, '#4a5a98', '#1c2038', .9, '#a8b8f8', 1.0, [-7, 8, 7], .6, '#8a9cff', [8, 4, 6], 14),
    Dk(32.5, '#4a5a98', '#1c2038', .9, '#a8b8f8', 1.0, [-7, 8, 7], .6, '#8a9cff', [8, 4, 6], 14), Dk(34.2, '#8a8ab8', '#6a5a58', .95, '#ffb888', 2.0, [10, 3.0, 3], .5, '#ffb890', [-8, 4, 6], 14),
    Dk(37, '#d8d0e4', '#8a7a58', 1.0, '#ffd8a0', 3.0, [10, 6, 3], .5, '#ffe0b0', [-8, 5, 6], 14), Dk(58.5, '#d8c8c0', '#8a6a50', .98, '#ffc890', 2.8, [10, 5, 0], .7, '#ffb070', [-8, 5, 4], 14),
    Dk(60, '#8a90a8', '#4c4648', .95, '#e8c8a8', 1.5, [-6, 7, 8], .5, '#ffd8a8', [7, 4.5, 10], 14)];
  const bg = [[0, ['#6a7cb0', '#f2c890']], [5, ['#5a6cb0', '#f0b078']], [9, ['#3a3a78', '#e8905c']], [12.2, ['#0a1238', '#2a2c60']], [32.5, ['#0a1238', '#2a2c60']], [34.2, ['#3a4a88', '#e8a078']], [37, ['#7aa0d4', '#ffe4b0']], [58.5, ['#8a8aa8', '#f4c890']], [60, ['#7a86a8', '#d8bca8']]];
  return { group: g, update, light, bg, far, stars, abr, sar, king, att, tw, srv, wom, pl: [godL, lampL, healL], state };
}
