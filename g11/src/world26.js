// Episode 26: Genesis 26. A famine comes and the Lord tells Isaac not to go down to Egypt but to stay in the land he will show him, and promises to be with him and bless him (26:1-5);
// Isaac sows in that land and in the same year reaps a hundredfold; he grows rich, and the Philistines envy him (26:12-14); they stop up with earth all the wells his father's servants had dug, and Abimelech says "go away from us; you have become too powerful for us" (26:15-16);
// Isaac moves on and digs again the wells of his father that the Philistines had stopped up, and gives them the names his father had given them (26:17-18); the herdsmen of Gerar quarrel with Isaac's herdsmen over two wells, which he names Esek (Quarrel) and Sitnah (Opposition) (26:19-21);
// he moves on and digs another well, over which they do not quarrel, and names it Rehoboth: "now the Lord has made room for us" (26:22); at Beersheba the Lord appears to him: "do not be afraid, for I am with you" (26:23-24);
// Abimelech comes and says "we see plainly that the Lord has been with you"; Isaac makes them a feast and they make peace (26:26-31).
// Cinematic interpretation: the floating land, the shape of the camp, the field, the wells and their stone rings, the trough, the pile of earth, the baskets, the spades, the standing stone, the fire, the mat and the bowls, the colour of the light, the shaft of light, the faces and the way the figures stand, walk, dig, point, argue, bow and clasp hands are not in the text.
// The film leaves out the wife-sister episode in Gerar and Abimelech's order protecting Isaac and Rebekah (26:6-11), the altar and the new well at Beersheba (26:25), the name Shibah (26:33) and Esau's marriages (26:34-35).
// The text does not say that the wells lay in this order or this far apart, that the Lord's word came to Isaac in the field, or that the feast was held at his tent at dawn; the film shows them so that each place can be seen. Abimelech's companions are not named here.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, tentMesh, makeSmoke, cloudSea, farMountains10, headZ, C3, rimf, meshOf } from './world10.js';

export const RIC = 15;
export const TS = [-4.8, 1.6], FIRE = [-2.3, 3.7], FLD = [-3.0, -2.9];                          // Isaac's tent; the fire where the feast is laid; the field
export const W1 = [3.4, 1.9], WQ = [7.5, -1.4], WO = [7.1, 3.4], WR = [1.7, -3.7];               // Abraham's well, the two quarrelled wells, Rehoboth
export const FEAST = [-1.0, 3.95];
export const IS0 = [-1.6, -.3], OBS = [4.9, .9], DGR = [.95, -3.35], DGW = [2.55, 1.85];         // Isaac in the dry field; where he watches the quarrel; at Rehoboth; at Abraham's well
export const EV = { a1: .6, b1: 8.3, b2: 17.1, c1: 27.3, c2: 34.0, c3: 40.0, d1: 48.0, d2: 53.2 };

// ---------------- terrain: green camp ground in the west, dry sand in the middle and the east, a tilled field in the north-west, packed earth round the wells
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.8, -5.4, 1.5, 3.8], [3.5, -10, 1.1, 5], [13.2, 2.4, 1.1, 3.6], [11.6, 8.6, .9, 3.6], [-2.0, -10.4, 1.2, 4]];
const FLATS = [[TS[0], TS[1] + 1.6, .32, 4.4], [FIRE[0], FIRE[1], .31, 2.6], [FLD[0], FLD[1], .32, 3.4], [W1[0], W1[1], .31, 2.4], [WQ[0], WQ[1], .31, 2.0], [WO[0], WO[1], .31, 2.0], [WR[0], WR[1], .31, 2.6], [IS0[0], IS0[1], .31, 2.2], [OBS[0], OBS[1], .31, 2.2]];
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  return rimf(RIC, h, r, -.02); };
const PATH = [[-3.0, 4.6], [-1.4, 4.9], [.4, 4.3], [2.4, 3.2], [4.6, 2.6], [6.4, 2.4], [8.6, 2.0]];
const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const dry = smooth(-6.5, 1.5, x); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  const sand = C3('#d6bf90').lerp(C3('#c4aa78'), .5 * smooth(-1, 1, Math.sin(x * .7 + z * .4))); b.lerp(sand, dry * .95);
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#8a6a44'), .85 * smooth(2.7, 1.9, Math.hypot(x - FLD[0], z - FLD[1])));
  for (const [wx, wz] of [W1, WQ, WO, WR]) b.lerp(C3('#a8906a'), .7 * smooth(1.5, .6, Math.hypot(x - wx, z - wz)));
  b.lerp(C3('#7e9a52'), .5 * smooth(4.8, 2.6, Math.hypot(x - TS[0], z - TS[1] - 1.6)));
  b.lerp(C3('#e8d6aa'), .75 * smooth(.8, .3, dPath(x, z)));
  if (y < .02) b.lerp(C3('#b0aa88'), .7); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, TS, FIRE, FLD, W1, WQ, WO, WR, IS0, OBS, DGR, DGW };

// ---------------- walkers: keys [[t, x, z, ease?], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);

// ---------------- the people
const mkIsaac = R => person(R, { pants: '#7a5a3a', top: '#c9a15a', skin: '#c38a5c', hair: '#4a3a2c', beard: '#6a5a4c', sash: '#8a3a2a', seed: 630 }, .47);          // the same Isaac as in Genesis 25: a beard
const mkAbimelech = R => person(R, { pants: '#cdbd98', top: '#6a3a7a', skin: '#b98a62', hair: '#2a1a12', beard: '#2a1a12', mantle: '#8a2a3a', sash: '#d8b848', cloth: '#d8b848', seed: 760 }, .5);   // king of the Philistines: golden head-dress and a purple tunic
const mkPhil = (R, top, skin, seed) => person(R, { pants: '#4a3a30', top, skin, hair: '#1f160d', beard: '#1f160d', sash: '#2a1a14', seed }, .47);
const mkHerd = (R, top, skin, seed, pants = '#5a4a38') => person(R, { pants, top, skin, hair: '#2e1d10', sash: '#3a2a1a', seed }, .45);
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const waterM = () => new THREE.MeshLambertMaterial({ color: 0x3a6c92, emissive: 0x14304a });

// ====================================================================== the world
export function makeCamp() {
  const R = rng(2626), g = new THREE.Group(), smoke = makeSmoke(2);
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9831), RIC, hC, gcC, 30, 80), underRock(rng(9832), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  [[-7.6, 1.4, 2.4], [-9.2, 4.2, 2.0], [-7.0, -1.4, 1.8], [-5.8, -5.4, 1.7]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-10.6, -4.0, 2.0], [-8.4, -8.0, 2.2]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[5.4, 6.0, .85], [4.2, 6.8, .9], [9.6, -4.4, .8], [10.4, 5.2, .8], [-.4, -6.6, .8]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[11.6, .2, 1.0], [12.6, -3.6, 1.1], [10.6, 7.2, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.hypot(x - TS[0], z - TS[1]) < 3.8 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 3.0 || dPath(x, z) < 1.2 || Math.hypot(x - FLD[0], z - FLD[1]) < 3.0 || [W1, WQ, WO, WR, IS0, OBS].some(([a, b]) => Math.hypot(x - a, z - b) < 2.6);
  for (let i = 0; i < 20; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 40; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- dry scrub in the famine: a few bare twigs and dead tufts about the field and the wells (built last so the random sequence of the trees is unchanged)
  { const b = new GB(rng(401)); for (let k = 0; k < 46; k++) { const a = k * 2.399, r = 1.5 + (k * 37 % 100) / 100 * 9.5, x = Math.cos(a) * r + 1, z = Math.sin(a) * r * .9; if (hC(x, z) < .15 || keepOut(x, z) || dPath(x, z) < .5) continue; const y = hC(x, z);
      b.box('#8a6a3c', [x, y + .1, z], [.014, .2, .014], [.2 * Math.sin(k), 0, .3 * Math.cos(k * 1.7)], .01); b.box('#9a7a46', [x + .03, y + .08, z], [.012, .14, .012], [.1, 0, -.5], .01); b.add(G.ico0, '#b89a58', [x, y + .02, z + .02], [.1, .035, .08], [0, k, 0], .02); }
    ca.add(meshOf(b)); }
  // ---- the camp: Isaac's tent and two more, sheep and a fire in a ring of stones
  [[TS[0], TS[1], 0, '#cdb48c', 1.2], [-6.3, 2.9, .5, '#c2a67a', .85], [-3.2, 0.2, -.4, '#d4c29c', .75]].forEach(([x, z, ry, c, s]) => { const m = tentMesh(R, c, s); m.position.set(x, hC(x, z), z); m.rotation.y = ry; ca.add(m); });
  const sheepP = [[-6.2, 4.9], [-6.9, 4.0], [-7.2, 5.0], [-5.4, 5.6], [-7.6, 3.1], [-6.0, 6.2]];
  const campSheep = sheepP.map(([x, z], i) => { const s = makeSheep(rng(560 + i)); s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = i * 1.7; ca.add(s.group); return s; });
  const fy = hC(FIRE[0], FIRE[1]);
  { const b = new GB(R); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; b.add(G.ico0, '#7a746c', [FIRE[0] + Math.cos(a) * .3, fy + .04, FIRE[1] + Math.sin(a) * .3], [.08, .06, .08], [R() * 3, R() * 3, 0], .04); } b.box('#4a3420', [FIRE[0] - .04, fy + .05, FIRE[1]], [.3, .05, .06], [0, .5, 0], .01); b.box('#4a3420', [FIRE[0] + .04, fy + .05, FIRE[1]], [.3, .05, .06], [0, -.5, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; ca.add(m); }
  const flames = new THREE.Group(); flames.position.set(FIRE[0], fy + .06, FIRE[1]); g.add(flames);
  const flameMats = [0xff7a20, 0xffa030, 0xffd060].map(c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: .92 }));
  const flameM = [[0, 0, .1, .26, 0], [.08, .03, .07, .2, 1], [-.07, -.03, .06, .16, 2]].map(([x, z, r, h, k]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5).translate(0, h / 2, 0), flameMats[k]); m.position.set(x, 0, z); flames.add(m); return { m, h }; });
  const fireG = spriteGlow(FIRE[0], fy + .22, FIRE[1], 1.3, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fy + .2, FIRE[1], .5, 0xffe0a0, 0); g.add(fireG, fireG2);
  const fireL = new THREE.PointLight(0xff8a40, 0, 7, 1.6);
  smoke.add(FIRE[0], fy + .4, FIRE[1], t => smooth(47.2, 48.4, t) * (1 - smooth(60, 61, t)), .15, 1.6); smoke.mesh.material.opacity = .2; g.add(smoke.mesh);
  const SMK = [[0, '#8a8490'], [48, '#44445e'], [53, '#9a8a7c'], [90, '#a8978a']];
  // ---- the feast: a woven mat, bowls and loaves on it (laid in front of the tent for Abimelech and his men, 26:30)
  const feast = new THREE.Group(); feast.position.set(FEAST[0], hC(FEAST[0], FEAST[1]), FEAST[1]); g.add(feast);
  { const b = new GB(rng(411)); b.box('#8a4a3c', [0, .012, 0], [1.5, .02, .9], [0, 0, 0], .02); b.box('#c8a050', [0, .024, 0], [1.4, .01, .09], [0, 0, 0], .01); b.box('#c8a050', [0, .024, .3], [1.4, .01, .05], [0, 0, 0], .01);
    for (const [x, z, c] of [[-.45, -.18, '#a8602e'], [.1, -.22, '#8a4a22'], [.5, -.1, '#a8602e'], [-.15, .2, '#8a4a22'], [.38, .24, '#a8602e']]) { b.add(G.cylT, c, [x, .06, z], [.1, .06, .1], [0, 0, 0], .01); b.add(G.cylT, '#c8a85a', [x, .092, z], [.075, .012, .075], [0, 0, 0], .004); }
    for (const [x, z] of [[-.05, -.02], [.25, .06], [-.3, .04]]) b.add(G.ico1, '#d8b878', [x, .06, z], [.09, .035, .06], [0, x * 9, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; feast.add(m); }
  // ---- the field: tilled earth, then stalks that come up and ripen (26:12), and sheaves at the edge
  const field = new THREE.Group(); field.position.set(FLD[0], hC(FLD[0], FLD[1]), FLD[1]); ca.add(field);
  { const b = new GB(rng(421)), rr = rng(422);
    for (let r = 0; r < 11; r++) for (let k = 0; k < 18; k++) { const x = -2.0 + k * .235 + (rr() - .5) * .05, z = -1.35 + r * .27 + (rr() - .5) * .04; if (Math.hypot(x * .8, z * 1.1) > 2.05) continue; const h = .5 + rr() * .16, c = pk(rr, ['#d8b050', '#c8a040', '#e0c060', '#d0a848']);
      b.box(c, [x, h / 2, z], [.03, h, .03], [(rr() - .5) * .14, 0, (rr() - .5) * .14], .01); b.box('#e8cc70', [x, h + .05, z], [.055, .15, .05], [0, 0, 0], .01); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; field.add(m); field.userData.m = m; }
  const sheaves = new THREE.Group(); sheaves.position.set(FLD[0] + 2.35, hC(FLD[0] + 2.35, FLD[1] + .4), FLD[1] + .4); ca.add(sheaves);
  { const b = new GB(rng(431)); for (let k = 0; k < 5; k++) { const x = k * .3 - .6, z = (k % 2) * .22; b.add(G.cylT, '#d8b050', [x, .15, z], [.1, .3, .1], [0, 0, .12 * (k - 2)], .02); b.add(G.cyl6, '#8a6a3c', [x, .16, z], [.11, .03, .11], [0, 0, 0], .01); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; sheaves.add(m); }
  // ---- the wells: a ring of stones, a wooden frame with a pulley beam, dark water inside, and a stone trough beside it
  const wells = {};
  const mkWell = (id, [wx, wz], o = {}) => {
    const ring = new THREE.Group(); ring.position.set(wx, hC(wx, wz), wz); ca.add(ring);
    const b = new GB(R); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; b.box(pk(R, ['#b8a47c', '#a8946e', '#c2ae86']), [Math.cos(a) * .27, .12, Math.sin(a) * .27], [.17, .24, .17], [0, -a, 0], .03); }
    for (const s of [-1, 1]) b.box('#6b4a2c', [0, .45, s * .3], [.045, .64, .045], [0, 0, 0], .02);
    b.box('#6b4a2c', [0, .78, 0], [.05, .05, .74], [0, 0, 0], .02); b.add(G.cylT, '#8a6a42', [0, .72, 0], [.04, .05, .04], [0, 0, 0], .01);
    const m = meshOf(b); ring.add(m);
    const w = new THREE.Mesh(new THREE.CircleGeometry(.2, 18), waterM()); w.rotation.x = -Math.PI / 2; w.position.set(0, .17, 0); ring.add(w);
    const fill = new THREE.Mesh(G.ico1, lamC('#8a6a44')); fill.position.set(0, .12, 0); fill.visible = false; fill.castShadow = true; ring.add(fill);
    const tr = new GB(R), tx = o.tx ?? .95, tz = o.tz ?? .5; tr.box('#a8946e', [tx, .08, tz], [.8, .16, .28], [0, o.try ?? .2, 0], .03); tr.box('#98845e', [tx - .02, .06, tz + .15], [.84, .12, .05], [0, o.try ?? .2, 0], .02); tr.box('#98845e', [tx + .02, .06, tz - .15], [.84, .12, .05], [0, o.try ?? .2, 0], .02);
    const trough = meshOf(tr); ring.add(trough); const tw = new THREE.Mesh(new THREE.BoxGeometry(.68, .02, .2), new THREE.MeshLambertMaterial({ color: 0x3c6a8c, emissive: 0x10243a })); tw.position.set(tx, .1, tz); tw.rotation.y = o.try ?? .2; ring.add(tw);
    if (o.noTrough) { trough.visible = false; tw.visible = false; }
    wells[id] = { ring, water: w, fill, trough, tw }; return wells[id]; };
  mkWell('w1', W1, { noTrough: true }); mkWell('wq', WQ, { tx: -.9, tz: .55, try: -.3 }); mkWell('wo', WO, { tx: -.9, tz: -.55, try: .3 }); mkWell('wr', WR, { tx: .95, tz: .45 });
  // the standing stone Isaac sets by Abraham's well when he gives it his father's name (26:18)
  const stele = new THREE.Group(); stele.position.set(W1[0] + .62, hC(W1[0] + .62, W1[1] + .36), W1[1] + .36); ca.add(stele);
  { const b = new GB(rng(441)); b.box('#bcae94', [0, .2, 0], [.16, .4, .1], [0, .3, 0], .03); b.box('#a89a82', [0, .02, 0], [.3, .05, .22], [0, .3, 0], .02); const m = meshOf(b); stele.add(m); }
  // the pile of earth the Philistines carry to the well, with baskets
  const pile = new THREE.Group(); pile.position.set(W1[0] + 1.35, hC(W1[0] + 1.35, W1[1] - .9), W1[1] - .9); ca.add(pile);
  { const b = new GB(rng(451)); b.add(G.ico1, '#8a6a44', [0, .1, 0], [.34, .2, .3], [0, .4, 0], .03); b.add(G.ico1, '#9a7a50', [.28, .06, .1], [.18, .1, .16], [0, 1, 0], .02); b.add(G.cylT, '#a8782e', [-.45, .08, .1], [.16, .1, .16], [0, 0, 0], .01); const m = meshOf(b); pile.add(m); }
  // ---- the sheep: Isaac's flock at the camp (more of them as he grows rich), the herds at the two quarrelled wells, and the flock that comes to Rehoboth
  const herd = (n, [cx, cz], sd) => Array.from({ length: n }, (_, i) => { const s = makeSheep(rng(sd + i)); const a = i * 2.1, x = cx + Math.cos(a) * .5, z = cz + Math.sin(a) * .4; s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = a + 1.2; ca.add(s.group); s.home = [x, z, a + 1.2]; return s; });
  const herdQ = herd(3, [WQ[0] - .6, WQ[1] + .8], 600), herdO = herd(3, [WO[0] - .5, WO[1] - .9], 620), flockR = herd(5, [5.6, -1.4], 640);
  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xffa860, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffe0b0, 0); g.add(sunS, sunS2);
  const starA = spriteGlow(0, 0, 0, 7, 0xffe8b0, 0), starB = spriteGlow(0, 0, 0, 2.2, 0xffffff, 0); g.add(starA, starB);
  const lordL = shaft(7, .22, .62, [1, .86, .5], .9, .12); g.add(lordL);
  const room = spriteGlow(WR[0], hC(WR[0], WR[1]) + .6, WR[1], 7, 0xffe6b0, 0), room2 = spriteGlow(WR[0], hC(WR[0], WR[1]) + .4, WR[1], 2.6, 0xfff4d0, 0); g.add(room, room2);
  const motes = makeMotes({ n: 70, area: [18, 3, 9], size: .03, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 90, area: [16, 2.6, 10], size: .05, v: .22, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const seed = makeMotes({ n: 16, area: [.5, .5, .5], size: .03, v: .5, seed: 47, color: 0xe8cc70 }); g.add(seed.mesh);
  const chips = makeMotes({ n: 22, area: [.5, .4, .5], size: .04, v: .6, seed: 49, color: 0x8a6a44 }); g.add(chips.mesh);
  const CLOUD = [[0, '#d0b8a0'], [8, '#e8c8a0'], [16, '#d8b498'], [24, '#8a7a88'], [28, '#f4d8b0'], [38, '#e8b484'], [44, '#fbf0dc'], [47, '#6a6a96'], [51, '#2a2a4a'], [54, '#e0a898'], [58, '#fbe8c8'], [90, '#f6e4c4']];
  const CEM = [[0, '#5a4a44'], [8, '#6a5444'], [16, '#5a4a44'], [24, '#3e3a50'], [28, '#6a5c4c'], [38, '#6a4c40'], [44, '#6a5c4c'], [47, '#2a2a48'], [51, '#1e2038'], [54, '#5a4448'], [58, '#6a5c4c'], [90, '#6a5c4c']];
  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the people
  const isaac = mkIsaac(rng(83)), isaacF = mkIsaac(rng(83)), abi = mkAbimelech(rng(84)), p1 = mkPhil(rng(85), '#7a3a3a', '#b98a62', 770), p2 = mkPhil(rng(86), '#6a4a3a', '#a8714a', 771), p3 = mkPhil(rng(87), '#8a4a3a', '#c38a5c', 772);
  const h1 = mkHerd(rng(88), '#6f8a62', '#a8714a', 780), h2 = mkHerd(rng(89), '#c9a15a', '#c38a5c', 781, '#6a5a3a'), g1 = mkHerd(rng(90), '#9a4a42', '#b98a62', 782, '#4a3a30'), g2 = mkHerd(rng(91), '#7a5a8a', '#a8714a', 783, '#4a3a30');
  const ALLP = [isaac, isaacF, abi, p1, p2, p3, h1, h2, g1, g2]; ALLP.forEach(o => g.add(o.group));
  // spades (Isaac's, and the Philistines'): a shaft with a blade, carried in front of the figure and moved by the animation
  const mkSpade = () => { const s = new THREE.Group(), b = new GB(rng(461)); b.box('#6b4a2c', [0, .45, 0], [.03, .9, .03], [0, 0, 0], .01); b.box('#9a8a6a', [0, .04, .01], [.11, .14, .02], [0, 0, 0], .01); b.box('#6b4a2c', [0, .9, 0], [.14, .03, .03], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; s.add(m); s.visible = false; return s; };
  const spI = mkSpade(), spIF = mkSpade(), spP1 = mkSpade(), spP2 = mkSpade(); isaac.group.add(spI); isaacF.group.add(spIF); p1.group.add(spP1); p2.group.add(spP2);
  const basket = new THREE.Mesh((() => { const b = new GB(rng(471)); b.add(G.cylT, '#a8782e', [0, .06, 0], [.17, .12, .17], [0, 0, 0], .01); b.add(G.cylT, '#8a6a44', [0, .13, 0], [.14, .03, .14], [0, 0, 0], .01); return b.build(); })(), lam); basket.position.set(0, .4, .26); basket.visible = false; p3.group.add(basket);

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = { isaac: [IS0[0], 0, IS0[1]] };
  const DIG = (t, ph = 0, sp = 4.2) => { const u = Math.sin(t * sp + ph); return { u, ex: { a0x: -.9 - .25 * u, a1x: -.9 - .25 * u, a0z: -.05, a1z: .05, lx: .22 + .2 * u } }; };
  const ARG = (t, ph, k) => ({ a0x: (-1.25 + .55 * Math.sin(t * 5.1 + ph)) * k, a1x: (-1.25 + .55 * Math.cos(t * 4.3 + ph)) * k, a0z: -.45 * k, a1z: .45 * k, lx: (.1 + .1 * Math.sin(t * 3.3 + ph)) * k });
  const putSpade = (sp, u, show) => { sp.visible = show; if (show) { sp.position.set(.13, .05 + .09 * (1 - u) * .5, .3); sp.rotation.set(-.35 + .35 * u, 0, 0); } };

  // ---- the keys
  // Isaac: stands in the dry field (26:1-2), sows the field (26:12), goes to his tent and meets Abimelech (26:16), moves on to Abraham's well (26:17-18), watches the quarrel (26:20-21), digs Rehoboth (26:22)
  const KI = [[0, IS0[0], IS0[1]], [8.0, IS0[0], IS0[1]], [9.6, -5.0, -2.1, 'W'], [13.0, -1.2, -2.1, 'L'], [13.6, -1.2, -2.1], [16.2, -2.6, 3.1, 'W'], [26.8, -2.6, 3.1], [31.0, DGW[0] - 1.2, DGW[1] + .1, 'W'], [31.6, DGW[0] - 1.2, DGW[1] + .1], [34.2, DGW[0] - 1.2, DGW[1] + .1], [35.6, OBS[0], OBS[1], 'W'], [38.0, OBS[0], OBS[1]], [40.2, DGR[0], DGR[1], 'W'], [47.0, DGR[0], DGR[1]]];
  // Abimelech: out of sight, comes to Isaac's tent (26:16) and goes; comes again at dawn with his men (26:26)
  const KA = [[22.0, 6.2, 3.2], [22.8, 6.2, 3.2], [25.8, -1.4, 3.7, 'W'], [28.2, -1.4, 3.7], [31.0, 6.0, 3.4, 'W'], [90, 6.0, 3.4]];
  const KAF = [[51.2, 7.8, 4.6], [55.2, FEAST[0], FEAST[1] + .95, 'W'], [90, FEAST[0], FEAST[1] + .95]];
  const KIF = [[0, FIRE[0] - .9, FIRE[1] + .1], [53.4, FIRE[0] - .9, FIRE[1] + .1], [55.2, FEAST[0], FEAST[1] - .9, 'W'], [90, FEAST[0], FEAST[1] - .9]];
  const KP1 = [[16.0, 9.6, 4.2], [17.4, 5.4, 3.4, 'W'], [19.6, W1[0] + .55, W1[1] + .2, 'W'], [24.6, W1[0] + .55, W1[1] + .2], [29.0, 6.8, 3.6, 'W'], [33.0, 6.8, 3.6], [50.8, 8.4, 5.4], [55.0, FEAST[0] + .85, FEAST[1] + .6, 'W'], [90, FEAST[0] + .85, FEAST[1] + .6]];
  const KP2 = [[16.0, 9.6, 3.2], [17.4, 6.0, 2.8, 'W'], [19.6, W1[0] - .45, W1[1] + .5, 'W'], [24.6, W1[0] - .45, W1[1] + .5], [29.0, 7.2, 3.0, 'W'], [33.0, 7.2, 3.0], [51.0, 8.6, 4.8], [55.0, FEAST[0] - .85, FEAST[1] + .6, 'W'], [90, FEAST[0] - .85, FEAST[1] + .6]];
  const KP3 = [[16.0, 9.6, 2.4], [17.6, 5.6, 2.2, 'W'], [19.6, W1[0] + 1.3, W1[1] - .8, 'W'], [24.6, W1[0] + 1.3, W1[1] - .8], [29.0, 7.0, 2.2, 'W'], [90, 7.0, 2.2]];
  // the herdsmen: at the two quarrelled wells (26:20-21); Isaac's two come to Rehoboth with the flock, where nobody quarrels (26:22)
  const HQ = { h1: [WQ[0] - 1.0, WQ[1] + .1], g1: [WQ[0] - .35, WQ[1] + 1.0], h2: [WO[0] - 1.0, WO[1] - .1], g2: [WO[0] - .4, WO[1] - 1.0] };
  const KH1 = [[0, HQ.h1[0], HQ.h1[1]], [38.4, HQ.h1[0], HQ.h1[1]], [41.6, 3.6, -3.0, 'W'], [43.6, WR[0] + 1.0, WR[1] + .9, 'W'], [90, WR[0] + 1.0, WR[1] + .9]];
  const KH2 = [[0, HQ.h2[0], HQ.h2[1]], [38.8, HQ.h2[0], HQ.h2[1]], [41.9, 3.9, -2.7, 'W'], [44.2, WR[0] + 1.5, WR[1] + .3, 'W'], [90, WR[0] + 1.5, WR[1] + .3]];
  const FL = [[44.6, 5.6, -1.9], [47.6, WR[0] + .5, WR[1] + 1.4]];

  function update(t, camera, sid) {
    const cam = camera && camera.position, NIGHT = sid === 'night' || sid === 'dawn' || sid === 'feast';
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; } o.m.visible = !hide; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject (famine noon is high and white, so no glow; the golden hours, the dusk of Rehoboth and the dawn have one); stars through the night at Beersheba
    { const k0 = ON(t, 7, 9, 16, 19) * .55, k1 = ON(t, 26, 28, 40, 44) * .6, k2 = ON(t, 44, 46, 47.4, 48.6) * .8, k3 = ON(t, 52.4, 54, 90, 91) * .95, cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); starA.position.set(cx + v3.x / hl * 150 + v3.z / hl * 14, cy + 34, cz + v3.z / hl * 150 - v3.x / hl * 14); }
      sunS2.position.copy(sunS.position); starB.position.copy(starA.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); const k = Math.max(k0, k1, k2, k3); sunS.material.opacity = .5 * k; sunS2.material.opacity = .65 * k; sunS.visible = sunS2.visible = k > .01;
      const st = ON(t, 47.4, 48.6, 51.2, 52.8) * (.9 + .1 * Math.sin(t * 3.1)); starA.material.opacity = .62 * st; starB.material.opacity = .95 * st; starA.visible = starB.visible = st > .01; }
    // light: the fire is lit at Beersheba and burns through the dawn and the feast
    { const kf = smooth(47.2, 48.6, t), ff = .9 + .1 * Math.sin(t * 11.3) * Math.sin(t * 7.1);
      fireG.material.opacity = .62 * kf * ff; fireG2.material.opacity = .5 * kf; fireG.visible = fireG2.visible = kf > .01; fireL.position.set(FIRE[0], fy + .6, FIRE[1] + .3); fireL.intensity = 4.6 * kf * ff * (1 - .55 * smooth(54.5, 57.5, t));
      flames.visible = kf > .02; flameM.forEach((f, i) => { const s = (.8 + .35 * Math.sin(t * 13 + i * 2.1) * Math.sin(t * 8.3 + i)) * kf; f.m.scale.set(.9 + .15 * Math.sin(t * 9 + i), Math.max(.05, s), .9 + .15 * Math.cos(t * 10 + i)); }); }
    smoke.update(t, colAt(SMK, t)); motes.update(t, .5 * (.4 + .6 * ON(t, 8, 12, 56, 62)), [0, .5, 1]); dust.update(t, .55 * (1 - smooth(6.5, 9.5, t)) + .3 * ON(t, 19.4, 21, 24, 27) + .25 * ON(t, 30.4, 32, 34, 36), [1, .3, 1]);
    campSheep.forEach((s, i) => { s.group.rotation.y = i * 1.7 + .12 * Math.sin(t * .4 + i); s.group.visible = i < 3 || t > 13.2 + (i - 3) * .5; });
    // the Lord's word: a slow shaft of gold on Isaac in the field (26:2), and on Isaac by the fire at Beersheba (26:24); a suggestion only
    { const pF = ON(t, 3.0, 4.2, 6.6, 7.8) * .46, pN = ON(t, 48.2, 49.0, 51.2, 52.2) * .5, onF = t < 20; lordL.position.set(onF ? IS0[0] : FIRE[0] - .1, hC(onF ? IS0[0] : FIRE[0], onF ? IS0[1] : FIRE[1]), onF ? IS0[1] : FIRE[1] - .2); lordL.material.opacity = onF ? pF : pN; lordL.visible = lordL.material.opacity > .004; }
    // ---- the field: ploughed and bare, then the stalks come up and ripen in the same year (26:12); sheaves at its edge as he grows rich
    { const gr = smooth(10.0, 14.4, t); field.visible = t > 9.7; field.scale.set(1, Math.max(.02, gr), 1); sheaves.visible = t > 14.4; sheaves.scale.setScalar(.2 + .8 * smooth(14.4, 16.4, t)); }
    // ---- Abraham's well (26:15, 26:18): water, filled with earth by the Philistines, then cleared by Isaac and the water comes back; the standing stone is set beside it
    { const w1 = wells.w1, hf = smooth(19.4, 23.8, t) * (1 - smooth(31.4, 34.0, t)); w1.fill.visible = hf > .03; w1.fill.scale.set(.27, .02 + .22 * hf, .27); w1.fill.position.y = .08 + .08 * hf; w1.water.visible = hf < .9; w1.water.material.opacity = 1;
      const sl = smooth(34.0, 35.2, t); stele.visible = sl > .01; stele.scale.set(sl, sl, sl); pile.visible = t < 31.5; }
    // ---- the wells that are quarrelled over, and Rehoboth: the ring rises as it is dug, and the water comes up (26:19-22)
    { const wr = wells.wr, kd = smooth(40.4, 42.2, t), kw = smooth(42.2, 44.2, t); wr.ring.visible = t > 40.2; wr.ring.scale.set(1, .15 + .85 * kd, 1); wr.water.visible = kw > .02; wr.water.scale.setScalar(.3 + .7 * kw); wr.tw.visible = wr.trough.visible = t > 43.6; }
    flockR.forEach((s, i) => { const k = smooth(44.0 + i * .25, 47.2 + i * .25, t), x = lerp(FL[0][1] + i * .35, WR[0] + .35 + (i % 3) * .38 - .3, k), z = lerp(FL[0][2] - i * .2, WR[1] + 1.0 + Math.floor(i / 3) * .6, k); s.group.visible = t > 43.8; s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = lerp(headZ(-1, -.3), headZ(-.3, -1), k) + (k > .98 ? .15 * Math.sin(i) : 0); });
    { const kq = smooth(32.4, 33.6, t), kqw = smooth(33.2, 34.2, t); for (const id of ['wq', 'wo']) { const w = wells[id]; w.ring.visible = t > 32.2; w.ring.scale.set(1, .15 + .85 * kq, 1); w.water.visible = kqw > .02; w.water.scale.setScalar(.3 + .7 * kqw); w.trough.visible = w.tw.visible = t > 33.4; }
      herdQ.forEach(s => s.group.visible = t > 33.2); herdO.forEach(s => s.group.visible = t > 33.2); }
    herdQ.forEach((s, i) => { s.group.rotation.y = s.home[2] + .15 * Math.sin(t * 1.6 + i) * ON(t, 33, 34, 38, 40); }); herdO.forEach((s, i) => { s.group.rotation.y = s.home[2] + .15 * Math.cos(t * 1.4 + i) * ON(t, 33, 34, 38, 40); });
    room.material.opacity = .3 * ON(t, 43.4, 45.6, 47.0, 48.2); room2.material.opacity = .36 * ON(t, 43.4, 45.6, 47.0, 48.2); room.visible = room2.visible = room.material.opacity > .004;

    // ---- Isaac by day (the same figure walks, sows, digs and waits); a second copy, Isaac by the fire, is shown only in the night, dawn and feast shots
    feast.visible = t >= 52.4;
    { const p = kp(t, KI), mv = p.mv, show = !NIGHT && t < 48.4; isaac.group.visible = show; spI.visible = false;
      if (show) { let ry, ex = {}, sp = 9, mvx = mv;
        if (t < 8.2) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[0, headZ(-1, .8)], [3.0, headZ(-1, .8)], [4.8, headZ(.1, 1)], [7.0, headZ(.7, .4)], [8.2, headZ(-.5, -1)]]); ex = GE(t, [[0.4, 1.2, 2.6, 3.2, { a0x: -.1, a1x: -.1, lx: .06 }], [4.8, 5.6, 6.4, 7.2, { a0x: -.3, a1x: -.3, a0z: -.3, a1z: .3, lx: -.06 }]]); }
        else if (t < 13.0) { ry = mv ? headZ(p.vx, p.vz) : headZ(1, 0); if (t >= 9.6) { const sw = Math.sin(t * 6.2); ex = { a1x: -.9 + .7 * sw, a1z: .3, a0x: .1, lx: .12 }; mvx = mv; sp = 7; } }
        else if (t < 16.4) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[13.0, headZ(-.2, -1)], [14.8, headZ(-.2, -1)]]); ex = GE(t, [[13.6, 14.2, 15.0, 15.6, { a0x: -.3, a1x: -.3, a0z: -.4, a1z: .4 }]]); }
        else if (t < 27.4) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[16.4, headZ(.9, .2)], [22.0, headZ(.9, .2)], [25.0, headZ(.95, .1)], [26.6, headZ(.95, .1)]]); ex = GE(t, [[19.0, 19.8, 21.0, 21.8, { a0x: -.3, a1x: -.3, lx: -.04 }], [25.9, 26.4, 27.0, 27.4, { a0x: -.3, a1x: -.3, lx: -.04 }]]); }
        else if (t < 31.6) { ry = mv ? headZ(p.vx, p.vz) : headZ(1, 0); if (t > 27.6) putSpade(spI, 1, true); }
        else if (t < 34.4) { ry = headZ(1, .1); const d = DIG(t, .3, 4.2), k = ON(t, 31.8, 32.4, 33.8, 34.4); ex = { a0x: lerp(0, d.ex.a0x, k), a1x: lerp(0, d.ex.a1x, k), lx: d.ex.lx * k }; putSpade(spI, .5 + .5 * d.u, k > .05); }
        else if (t < 40.2) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[35.6, headZ(1, .1)], [36.4, headZ(.7, -.6)], [37.2, headZ(.8, .55)], [38.0, headZ(.5, -.2)]]); ex = GE(t, [[36.2, 36.8, 37.6, 38.2, { a0x: -.2, a1x: -.2, lx: -.06 }]]); if (mv) putSpade(spI, 1, true); }
        else if (t < 47.4) { ry = headZ(1, -.2); const d = DIG(t, 1.1, 4.0), k = ON(t, 40.6, 41.2, 43.2, 43.9), op = ON(t, 44.4, 45.4, 47.0, 47.6); ex = { a0x: lerp(0, d.ex.a0x, k) + -.1 * op, a1x: lerp(0, d.ex.a1x, k) + -.1 * op, a0z: -.05 - .75 * op, a1z: .05 + .75 * op, lx: d.ex.lx * k - .06 * op }; putSpade(spI, .5 + .5 * d.u, k > .05); }
        else ry = headZ(1, 0);
        fig(isaac, p.x, p.z, ry, mvx, t, 5.1, { ...ex, s: 1 + .008 * Math.sin(t * 1.6) }, sp); state.isaac = [p.x, gAt(p.x, p.z), p.z]; } }
    // Isaac by the fire at Beersheba, at dawn and at the feast
    { isaacF.group.visible = NIGHT; spIF.visible = false;
      if (NIGHT) { const p = kp(t, KIF), mv = p.mv, ex = GE(t, [[48.6, 49.4, 51.4, 52.2, { a0x: -.35, a1x: -.35, a0z: -.5, a1z: .5, lx: -.1 }], [55.4, 55.9, 56.6, 57.2, { a1x: -1.1, a0x: -.2, lx: .03 }], [57.6, 58.0, 60.0, 61, { a0x: -.3, a1x: -.3 }]]);
        const ry = mv ? headZ(p.vx, p.vz) : hy(t, [[0, headZ(1, -.1)], [51.4, headZ(1, -.1)], [53.0, headZ(1, .3)], [55.0, headZ(1, .3)], [55.6, headZ(0, 1)], [90, headZ(0, 1)]]), sit = smooth(55.6, 56.4, t) * (1 - smooth(60.5, 61, t));
        fig(isaacF, p.x, p.z, ry, mv, t, 5.1, { ...ex, s: (1 - .2 * sit) * (1 + .008 * Math.sin(t * 1.6)) }, 9); } }
    // ---- Abimelech: comes to Isaac's tent (26:16), then comes again with his men at dawn (26:26)
    { const day = t < 40, p = kp(t, day ? KA : KAF), show = (t > 22.0 && t < 33) || t > 51.0; abi.group.visible = show;
      if (show) { const mv = p.mv, ry = mv ? headZ(p.vx, p.vz) : (day ? hy(t, [[25.8, headZ(-1, -.05)], [27.0, headZ(-1, -.05)], [28.2, headZ(-1, -.05)]]) : hy(t, [[55.2, headZ(0, -1)], [90, headZ(0, -1)]]));
        const ex = day ? GE(t, [[26.0, 26.5, 27.7, 28.4, { a1x: -1.55, a1z: .1, a0x: -.25, lx: .05 }]]) : GE(t, [[55.4, 55.9, 56.6, 57.2, { a1x: -1.1, a0x: -.2, lx: .03 }], [57.6, 58.0, 60.0, 61, { a0x: -.3, a1x: -.3 }]]);
        const seated = !day ? smooth(55.6, 56.4, t) * (1 - smooth(60.5, 61, t)) : 0;
        fig(abi, p.x, p.z, ry, mv, t, 3.3, { ...ex, s: (1 - .2 * seated) * (1 + .007 * Math.sin(t * 1.7)) }, 8.2); } }
    // ---- the Philistines: they watch Isaac's wealth from the east rise (26:14), stop up the well with earth (26:15), stand at it while Abimelech speaks (26:16); two of them come with Abimelech at dawn
    const phil = (f, K, ph, spd, spade, isP3) => { const p = kp(t, K), show = isP3 ? (t > 15.9 && t < 33) : ((t > 15.9 && t < 33) || t > 50.6); f.group.visible = show; if (spade) spade.visible = false; if (isP3) basket.visible = false; if (!show) return;
      const mv = p.mv, w = t > 19.6 && t < 24.4, work = w ? ON(t, 19.8, 20.4, 23.8, 24.4) : 0;
      const ry = mv ? headZ(p.vx, p.vz) : (t < 19.5 ? headZ(-1, .15) : (w ? face(p.x, p.z, W1[0], W1[1]) : (t < 33 ? face(p.x, p.z, -2, 3.6) : (t > 55 ? face(p.x, p.z, FEAST[0], FEAST[1]) : headZ(-1, -.2)))));
      let ex = {}; if (t > 16.8 && t < 19.4) ex = GE(t, [[16.8, 17.4, 18.4, 19.4, { a0x: -.55, a1x: -.55, a0z: -.1, a1z: .1 }]]);
      if (t > 55.4) { const sit = smooth(55.6, 56.4, t) * (1 - smooth(60.5, 61, t)); fig(f, p.x, p.z, ry, mv, t, ph, { a0x: -.4, a1x: -.4, s: 1 - .2 * sit }, spd); return; }
      if (isP3) { if (work > .5) { const k = (t * .72 + ph) % 1, tri = k < .5 ? k * 2 : 2 - k * 2, e = ease.inOutSine(tri), x = lerp(W1[0] + 1.3, W1[0] + .6, e), z = lerp(W1[1] - .8, W1[1] + .3, e); fig(f, x, z, k < .5 ? headZ(-.7, 1.1) : headZ(.7, -1.1), true, t, ph, k < .5 ? { a0x: -1.0, a1x: -1.0, lx: .06 } : { a0x: .1, a1x: -.1 }, 9); basket.visible = k < .5; } else fig(f, p.x, p.z, ry, mv, t, ph, ex, spd); return; }
      if (spade && w) { const d = DIG(t, ph, 4.6), kk = work; ex = { a0x: lerp(0, d.ex.a0x, kk), a1x: lerp(0, d.ex.a1x, kk), lx: d.ex.lx * kk * .8 }; putSpade(spade, .5 + .5 * d.u, kk > .05); }
      fig(f, p.x, p.z, ry, mv, t, ph, ex, spd); };
    phil(p1, KP1, 1.1, 8.6, spP1, false); phil(p2, KP2, 2.4, 8.6, spP2, false); phil(p3, KP3, .3, 8.6, null, true);
    // ---- the herdsmen quarrel at the two wells (26:20-21), then Isaac's herdsmen leave with him and come to Rehoboth
    { const q = ON(t, 33.8, 34.6, 38.0, 39.0);
      const hd = (f, K, ph, other, who) => { const p = kp(t, K), mv = p.mv, atQ = t < 39.5; f.group.visible = t > 33.0; const ry = mv ? headZ(p.vx, p.vz) : (atQ ? face(p.x, p.z, other[0], other[1]) : face(p.x, p.z, WR[0], WR[1])); fig(f, p.x, p.z, ry, mv, t, ph, atQ ? ARG(t, ph, q) : GE(t, [[44.2, 45.2, 47.2, 48.2, { a0x: -.2, a1x: -.2, lx: .02 }]]), 8.6); };
      hd(h1, KH1, 1.7, [WQ[0] - .35, WQ[1] + 1.0], 'h'); hd(h2, KH2, 2.9, [WO[0] - .4, WO[1] - 1.0], 'h');
      const gd = (f, K, ph, other) => { const p = kp(t, [[0, K[0], K[1]], [90, K[0], K[1]]]); f.group.visible = t > 33.0 && t < 39.8; fig(f, p.x, p.z, face(p.x, p.z, other[0], other[1]), false, t, ph, ARG(t, ph + 1, q), 8.6); };
      gd(g1, [WQ[0] - .35, WQ[1] + 1.0], 3.4, [WQ[0] - 1.0, WQ[1] + .1]); gd(g2, [WO[0] - .4, WO[1] - 1.0], 4.6, [WO[0] - 1.0, WO[1] - .1]); }
    // the dust and the chips of earth thrown up by the spades
    { const dg = ON(t, 31.8, 32.4, 33.8, 34.4) + ON(t, 40.6, 41.2, 43.2, 43.9), wf = ON(t, 19.8, 20.4, 23.8, 24.4); const dp = t < 36 ? (t > 28 ? [DGW[0] + .45, .15, DGW[1] - .05] : [W1[0] + .1, .25, W1[1]]) : [DGR[0] + .5, .15, DGR[1] + .1]; chips.update(t, .55 * Math.max(dg, wf), t < 25 ? [W1[0], .25, W1[1]] : dp); seed.update(t, .6 * ON(t, 9.8, 10.4, 12.6, 13.2), [state.isaac[0] + .2, .35, state.isaac[2] + .15]); }
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#c4c0b4', '#8a7a64', 1.0, '#fff0d4', 2.6, [3, 9, 6], .4, '#ffe8c8', [-8, 5, 6], 14), Dk(3.0, '#c4c0b4', '#8a7a64', 1.0, '#fff0d4', 2.6, [3, 9, 6], .4, '#ffe8c8', [-8, 5, 6], 14),
    Dk(4.6, '#b8b0b8', '#7a6a58', .95, '#ffc878', 2.9, [8, 5, 6], .45, '#ffd8a0', [-8, 5, 6], 14), Dk(9, '#b0b4cc', '#7a6a58', .95, '#ffd69a', 2.7, [8, 6, 6], .45, '#ffe0b0', [-8, 5, 6], 14),
    Dk(15, '#b0b4cc', '#7a6a58', .95, '#ffc888', 2.8, [8, 4.6, 6], .45, '#ffd8a0', [-8, 5, 6], 14), Dk(18, '#8a88b0', '#5a4a48', .85, '#ffa860', 2.3, [8, 3.2, 5], .5, '#ffb888', [-8, 4, 6], 14),
    Dk(24, '#7a78a8', '#4a4048', .8, '#ff9a58', 2.3, [8, 2.8, 4], .5, '#ffa870', [-8, 4, 6], 14), Dk(28, '#b0b4cc', '#7a6a58', .98, '#ffd098', 2.7, [8, 4.4, 5], .45, '#ffd8a0', [-8, 5, 6], 14),
    Dk(34, '#b4a8a0', '#7a6050', .95, '#ffb070', 2.8, [9, 3.4, 4], .5, '#ffbc88', [-8, 4, 6], 14), Dk(39, '#b8b4c4', '#7a6a58', 1.0, '#ffd8a0', 2.7, [8, 5.4, 6], .45, '#ffe0b0', [-8, 5, 6], 14),
    Dk(44, '#c0bcd0', '#7a6a58', 1.05, '#ffe4b0', 2.8, [7, 6.2, 7], .45, '#fff0d0', [-8, 5, 6], 14), Dk(47.0, '#b0b0cc', '#6a5a50', 1.0, '#ffcc90', 2.6, [8, 3.0, 5], .5, '#ffd8a0', [-8, 4, 6], 14),
    Dk(48.4, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(51.6, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(53.4, '#8a80a8', '#5a4a58', .9, '#ff9a68', 2.2, [10, 2.2, 4], .55, '#ffa878', [-8, 4, 6], 14), Dk(56, '#b0a8bc', '#7a6a58', 1.0, '#ffc888', 2.6, [10, 3.8, 4], .5, '#ffd8a0', [-8, 4, 6], 14), Dk(60, '#b0a8bc', '#7a6a58', 1.0, '#ffc888', 2.6, [10, 3.8, 4], .5, '#ffd8a0', [-8, 4, 6], 14)];
  const bg = [[0, ['#9aa4b8', '#f0d8b0']], [3.0, ['#9aa4b8', '#f0d8b0']], [4.6, ['#6a84b8', '#f6c890']], [9, ['#5a86c4', '#f6dcb0']], [15, ['#5a7ab8', '#f4d0a0']], [18, ['#4a5488', '#e8a070']], [24, ['#3a3c70', '#e08858']], [28, ['#5a88c4', '#f6dcb0']], [34, ['#6a78a8', '#f2b080']], [39, ['#6a90c8', '#f6dcb0']], [44, ['#5a96d0', '#faecc4']], [47, ['#4a6aa8', '#f0b880']], [48.4, ['#0a1230', '#2a2a50']], [51.6, ['#0a1230', '#2a2a50']], [53.4, ['#38447a', '#f29a64']], [56, ['#5a78b0', '#f6d4a0']], [60, ['#5a78b0', '#f6d4a0']]];
  return { group: g, update, light, bg, far, pl: [fireL], state };
}
