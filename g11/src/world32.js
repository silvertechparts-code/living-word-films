// Episode 32: Genesis 32. Jacob sends messengers to his brother Esau and they return: "he is coming to meet you, and four hundred men with him" (32:3-6); Jacob is greatly afraid and prays: "O God of my father Abraham ... I am not worthy ... Deliver me ... from the hand of my brother" (32:7-12); he sends a gift of animals ahead in droves, with a space between drove and drove (32:13-21);
// that night he takes his two wives, his two maids and his eleven children over the ford of the Jabbok, sends everything across, and is left alone (32:22-24); a man wrestles with him until daybreak; he does not prevail, strikes Jacob's hip and puts it out of joint (32:24-25); "Let me go, for the day is breaking." "I will not let you go, unless you bless me." (32:26); "Your name shall no longer be Jacob, but Israel, for you have striven with God and with humans, and have prevailed" (32:27-28);
// Jacob names the place Peniel: "I have seen God face to face, and yet my life is preserved" (32:30); the sun rises upon him as he passes Penuel, limping because of his hip (32:31).
// Cinematic interpretation: the floating land, the river and its ford, the camp with its tents and fire, where the people stand, the dusk and the night, the torches, the six droves and who drives them, the host on the ridge, the pace and the gestures, the light that stands over Jacob, the dust, the flash at the hip, the new light of morning. The text gives no landscape; the film draws one so that each moment can be seen.
// The film leaves out the angels at Mahanaim (32:1-2), the two camps (32:7-8), the list of animals (32:14-15), the man's refusal to give his name (32:29) and the custom about the thigh muscle (32:32).
// The text calls the opponent "a man" and does not say what he looked like. The film shows him as a figure of light and shadow with no face, the way God and angels are shown elsewhere in the series; it does not say whether he was God or an angel, and Jacob's words at Peniel are left as they are. The limp is the only lasting mark the text names (32:31).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep, makeQuad, makeCamel, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, cloudSea, farMountains10, headZ, headX, C3, rimf, meshOf, tentMesh } from './world10.js';

export const RIC = 15, RW = .85, WL = .2;
export const RV = z => .55 * Math.sin(z * .32 + .6);                                   // the Jabbok runs north to south; this is its centre line
export const JP = [-2.0, 2.0], FORD = [.45, 1.3], FIRE = [-5.4, 3.0], CAMPC = [-7.0, -.2], RIDGE = [11.3, -4.2], EAST = [4.4, 1.6], WR = [-2.15, 2.1];       // Jacob's place on the west bank; the ford; the camp's fire; the camp; the ridge Esau's men come over; the east bank; where they wrestle
export const EV = { a1: .6, a2: 7.9, b1: 15.9, b2: 21.2, c1: 27.0, c2: 35.6, d1: 41.2, d2: 50.4, e1: 57.4 };

// ---------------- terrain: open country, a river with a shallow ford in the middle, a ridge in the east
const HILLS = [[-10.5, -5, 1.1, 6], [-11.5, 8, .8, 5], [11.8, -5.4, 1.5, 3.8], [3.5, -10.5, 1.1, 5], [12.6, 5.4, 1.1, 3.8], [-2, -10.8, 1.2, 4], [.2, 10.8, 1.0, 4], [-8.5, 9.4, .8, 3.6]];
const FLATS = [[JP[0], JP[1], .32, 2.6], [CAMPC[0], CAMPC[1], .31, 4.8], [FIRE[0], FIRE[1], .31, 2.2], [EAST[0] + .8, EAST[1] + .6, .32, 3.6]];
const bedAt = z => lerp(-.16, .12, smooth(1.6, .7, Math.abs(z - FORD[1])));
const hC = (x, z) => { const r = Math.hypot(x, z); let h = .3 + .05 * Math.sin(x * .5 + z * .3) + .04 * Math.sin(x * 1.4 - z * 1.1);
  for (const [px, pz, ph, pr] of HILLS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.15) * (.9 + .12 * Math.sin(x * 2.3 + z * 1.7))); }
  for (const [fx, fz, fh, fr] of FLATS) h = lerp(h, fh, smooth(fr, fr * .42, Math.hypot(x - fx, z - fz)));
  h = lerp(h, bedAt(z), smooth(RW + 1.15, RW - .1, Math.abs(x - RV(z))) * smooth(11, 8.6, Math.abs(z)));
  return rimf(RIC, h, r, -.02); };
export const PATH = [[-6.0, .8], [-3.2, 1.2], [-1.0, 1.15], [.45, 1.2], [2.2, 1.3], [4.6, 1.1], [7.6, .6]];

const segD = (x, z, ax, az, bx, bz) => { const vx = bx - ax, vz = bz - az, u = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); return Math.hypot(x - (ax + u * vx), z - (az + u * vz)); };
const dPath = (x, z) => { let m = 99; for (let i = 0; i < PATH.length - 1; i++) m = Math.min(m, segD(x, z, ...PATH[i], ...PATH[i + 1])); return m; };
const gcC = (x, y, z, s) => { const d = Math.abs(x - RV(z)), zw = smooth(11, 8.6, Math.abs(z)); let b = C3('#7e9a52').lerp(C3('#6e8c46'), .5 * smooth(-1, 1, Math.sin(x * .9 + z * .7)));
  b.lerp(C3('#86a458'), .35 * smooth(-1, 1, Math.sin(x * .5 - z * .8 + 1)));
  b.lerp(C3('#c9b88c'), .6 * smooth(RW + 1.7, RW + .15, d) * zw);
  b.lerp(C3('#a8906a'), .55 * smooth(3.6, 1.4, Math.hypot(x - CAMPC[0], z - CAMPC[1])));
  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));
  b.lerp(C3('#e8d6aa'), .7 * smooth(.8, .3, dPath(x, z)));
  if (y < .17) b.lerp(C3('#8a9686'), .75); return b.getHex(); };
const gAt = hC;
export const stage = { gAt, JP, FORD, FIRE, CAMPC, RIDGE, EAST, WR, PATH, RV };


// ---------------- walkers: keys [[t, x, z, ease?], ...], eased between keys, still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const r = clamp((t - a[0]) / (b[0] - a[0])), u = b[3] === 'W' ? .5 * r + .5 * r * r * (3 - 2 * r) : (b[3] === 'L' ? r : ease.inOutSine(r)), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }
const hy = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; return lerp(a[1], b[1], ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0])))); };
const face = (x, z, tx, tz) => headZ(tx - x, tz - z);

// ---------------- the people
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);                       // the same Jacob, Rachel, Leah and Laban as in Genesis 29
const mkRachel = R => person(R, { pants: '#e0d4b4', top: '#4f9a8a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#efe4cc', sash: '#c8884a', seed: 810 }, .43);
const mkLeah = R => person(R, { pants: '#cdbf9c', top: '#8a5a78', skin: '#c58c60', hair: '#2a1a10', long: true, cloth: '#d8c8d6', sash: '#c9a15a', seed: 820 }, .44);
const mkLaban = R => person(R, { pants: '#d9ccb0', top: '#3f6a78', skin: '#b98a62', hair: '#6a5a4a', beard: '#8a7a68', mantle: '#8a5a3a', sash: '#a8483a', seed: 830 }, .47);
const mkMaid = (R, top, skin, cloth, sash, seed) => person(R, { pants: '#d8ccb0', top, skin, hair: '#2a1a10', long: true, cloth, sash, seed }, .42);
const mkHerd = (R, top, skin, seed, pants = '#5a4a38') => person(R, { pants, top, skin, hair: '#2e1d10', sash: '#3a2a1a', seed }, .45);
const mkKid = (R, top, seed, sc, skin = '#c58c60', long = false) => person(R, { pants: '#d9ccb0', top, skin, hair: '#2a1a10', long, seed }, sc);
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const waterM = () => new THREE.MeshLambertMaterial({ color: 0x3a6c92, emissive: 0x14304a });
// the animals: the white flock, the dark lambs and the spotted goats (30:32), camels and donkeys (30:43)
const mkDark = sd => makeQuad({ rn: rng(sd), len: .46, h: .24, w: .2, legL: .2, legW: .04, col: '#3a2e26', col2: '#2a201a', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#2a201a' });
const mkGoat = sd => { const s = makeQuad({ rn: rng(sd), len: .5, h: .24, w: .2, legL: .26, legW: .04, col: '#d8cdb4', col2: '#7a5a3a', neck: [.15, .75, .08], head: [.17, .1, .09], horns: true, ears: false, legCol: '#5a4430' });
  for (const [x, z] of [[.07, .3], [-.1, -.3]]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(.11, .08, .206), lamC('#4a3426')); sp.position.set(x, .42, z * .08); s.group.add(sp); } return s; };

const mkMan = R => person(R, { pants: '#f0e8d4', top: '#f6f0de', skin: '#f0e6d0', hair: '#f6f0de', cloth: '#fbf6e8', mantle: '#aab6e0', seed: 960 }, .52);

export function makeCountry() {
  const R = rng(3232), g = new THREE.Group();
  const ca = new THREE.Group(); g.add(ca); ca.add(mkIslet(rng(9871), RIC, hC, gcC, 38, 118), underRock(rng(9872), RIC - .1));
  const occ = [];
  const tree = (x, z, s, kind, cols) => { const geo = kind === 'olive' ? oliveGeo(s, R) : roundTreeGeo(s, R, cols || ['#6a8a40', '#5f8a3a', '#7a9a4a', '#557f36']); const m = new THREE.Mesh(geo, lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = R() * 6; ca.add(m); occ.push({ m, s }); return m; };
  [[-10.0, 3.0, 2.4], [-9.2, -2.4, 2.0], [-10.4, 6.0, 1.9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']));
  [[-8.0, -6.4, 2.0], [-5.4, -8.4, 2.1], [6.0, -8.2, 1.8]].forEach(([x, z, s]) => tree(x, z, s, 'round'));
  [[-3.6, -5.2, .9], [6.6, -2.8, .8], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [8.8, 5.6, .8]].forEach(([x, z, s]) => tree(x, z, s, 'olive'));
  [[13.2, 1.0, 1.0], [13.4, -1.6, 1.1], [9.4, 9.8, .9]].forEach(([x, z, s]) => tree(x, z, s, 'round', ['#8a9a5a', '#7a8c4e', '#98a866']));
  const keepOut = (x, z) => hC(x, z) < .15 || Math.abs(x - RV(z)) < RW + 1.6 || Math.hypot(x - JP[0], z - JP[1]) < 2.4 || Math.hypot(x - CAMPC[0], z - CAMPC[1]) < 4.4 || Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.4 || dPath(x, z) < 1.3 || (x > 2.2 && x < 10.4 && z > -.8 && z < 3.8) || (x > -5.6 && x < -2 && z > -4.2 && z < -.6);
  for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 5 + R() * 9.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (keepOut(x, z)) continue; tree(x, z, .45 + R() * .4, 'round', ['#a89a62', '#9a8c58', '#b4a870', '#8e8450']); }
  { const b = new GB(R); for (let k = 0; k < 44; k++) { const a = R() * TAU, r = 3 + R() * 11.4, x = Math.cos(a) * r, z = Math.sin(a) * r; if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.16 + R() * .3, .11 + R() * .16, .16 + R() * .3], [R() * 3, R() * 3, 0], .06); }
    ca.add(meshOf(b)); }
  // ---- reeds along both banks, and a few stones in the ford
  { const b = new GB(rng(31)), rr = rng(32); for (let k = 0; k < 170; k++) { const z = -8.6 + rr() * 17.2; if (Math.abs(z - FORD[1]) < 1.15) continue; const side = rr() < .5 ? -1 : 1, x = RV(z) + side * (RW + .12 + rr() * .55), y = hC(x, z), h = .26 + rr() * .3;
      b.add(G.cone5, pk(rr, ['#7a8a4a', '#8a9a52', '#6e8044', '#96a05c']), [x, y + h * .5, z], [.022, h, .022], [(rr() - .5) * .25, 0, (rr() - .5) * .25], .03); }
    for (let k = 0; k < 22; k++) { const z = FORD[1] - 1.1 + rr() * 2.2, x = RV(z) + (rr() - .5) * 1.7; b.add(G.ico0, pk(rr, ['#8a8478', '#9a9486', '#7a766c']), [x, hC(x, z) + .03, z], [.09 + rr() * .08, .05, .08 + rr() * .07], [rr() * 3, rr() * 3, 0], .05); }
    ca.add(meshOf(b)); }
  // ---- the river: a strip of water that follows the bed, with ripples that drift downstream (south)
  const NWS = 42, water = (() => { const geo = new THREE.BufferGeometry(), P = [], I = [];
    for (let i = 0; i <= NWS; i++) { const z = -10.4 + 20.8 * i / NWS, cx = RV(z), hw = RW + .95; P.push(cx - hw, WL, z, cx + hw, WL, z); }
    for (let i = 0; i < NWS; i++) { const a = 2 * i; I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setIndex(I); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x3a6c92, emissive: 0x14304a, transparent: true, opacity: .92, side: THREE.DoubleSide })); m.receiveShadow = true; g.add(m); return m; })();
  const RIP = Array.from({ length: 46 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(.34, .008, .035), new THREE.MeshBasicMaterial({ color: 0xcfe4f0, transparent: true, opacity: .4, toneMapped: false })); m.userData = { z0: R() * 20.8, o: (R() - .5) * 2 * (RW - .2), sp: .3 + R() * .2, w: .2 + R() * .36 }; g.add(m); return m; });

  // ---- the camp: four tents, rugs, and the fire pit (lit through the night)
  const TENTS = [[-8.5, -.9, '#cdb48c', .5], [-7.3, 1.0, '#c2a67a', .2], [-6.1, -1.5, '#d4c29c', -.4], [-5.8, .5, '#b8946a', .1]];
  TENTS.forEach(([x, z, c, ry], i) => { const m = tentMesh(rng(500 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); });

  // ---- Laban's fire pit by the road: a ring of stones, crossed logs and a flickering flame, lit only through the night he sleeps here (31:24)
  const fireY = hC(FIRE[0], FIRE[1]);
  { const b = new GB(rng(431)); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; b.box(pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [FIRE[0] + Math.cos(a) * .3, fireY + .06, FIRE[1] + Math.sin(a) * .3], [.14, .12, .14], [0, -a, 0], .03); }
    b.box('#2a2018', [FIRE[0], fireY + .02, FIRE[1]], [.5, .02, .5], [0, 0, 0], .01); b.box('#3a2a1c', [FIRE[0], fireY + .09, FIRE[1]], [.42, .06, .07], [0, .6, 0], .01); b.box('#4a3420', [FIRE[0], fireY + .09, FIRE[1]], [.42, .06, .07], [0, -.6, 0], .01); ca.add(meshOf(b)); }
  const flames = [0, 1, 2].map(i => { const fm = new THREE.Mesh(new THREE.ConeGeometry(.075 - .015 * i, .28 - .05 * i, 5).translate(0, .14, 0), new THREE.MeshBasicMaterial({ color: i ? 0xffc050 : 0xff8a28, toneMapped: false, transparent: true, opacity: .95 })); fm.position.set(FIRE[0] + (i - 1) * .05, fireY + .12, FIRE[1] + (i % 2 ? .03 : -.02)); g.add(fm); return fm; });
  const fireG = spriteGlow(FIRE[0], fireY + .3, FIRE[1], 1.6, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fireY + .26, FIRE[1], .6, 0xffe0a0, 0); g.add(fireG, fireG2);
  const fireL = new THREE.PointLight(0xff9a50, 0, 6, 1.5); fireL.position.set(FIRE[0], fireY + .6, FIRE[1] + .3);
  { const b = new GB(rng(433)); b.box('#7a4a3a', [FIRE[0] + .95, fireY + .02, FIRE[1] + .65], [1.0, .025, .42], [0, 0, 0], .01); b.box('#6a5a3a', [FIRE[0] + .75, fireY + .02, FIRE[1] - .65], [1.0, .025, .42], [0, 0, 0], .01); b.box('#5a4a6a', [FIRE[0] - .35, fireY + .02, FIRE[1] - .8], [1.0, .025, .42], [0, 0, 0], .01); ca.add(meshOf(b)); }    // three sleeping rugs

  // ---- Esau's four hundred men (32:6): a column of small dark figures on the ridge, shown only while the messengers speak
  const host = new THREE.Group(); g.add(host);
  { const b = new GB(rng(61)), rr = rng(62); for (let k = 0; k < 60; k++) { const col = k % 5, row = Math.floor(k / 5), x = RIDGE[0] - 2.5 + col * .46 + (rr() - .5) * .2 - row * .09, z = RIDGE[1] - 2.6 + row * .42 + (rr() - .5) * .16, y = hC(x, z);
      b.box(pk(rr, ['#4a3a38', '#3a3a48', '#52403a', '#3a4448', '#5a4a3a']), [x, y + .17, z], [.11, .34, .09], [0, 0, 0], .03); b.add(G.ico0, pk(rr, ['#b98a62', '#a8714a', '#c38a5c']), [x, y + .39, z], [.055, .06, .055], [0, 0, 0], .02); b.box('#5a4a38', [x + .07, y + .36, z], [.014, .72, .014], [0, 0, .04], .01); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; host.add(m); }
  host.scale.setScalar(.001);

  // ---- the animals sent ahead (32:13-21): 4 goats, 5 dark lambs, 7 white sheep, 2 camels and 2 donkeys, six droves with their herdsmen
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const GOATS = [0, 1, 2, 3].map(i => place(mkGoat(740 + i), 0, 0, 0)), DARK = [0, 1, 2, 3, 4].map(i => place(mkDark(720 + i), 0, 0, 0)), WHITE = [0, 1, 2, 3, 4, 5, 6].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0));
  const camels = [0, 1].map(i => { const s = makeCamel(rng(800 + i)); ca.add(s.group); return s; }), donkeys = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); ca.add(s.group); return s; });


  const far = farMountains10(rng(67)); g.add(far);
  const sea = cloudSea(rng(68), 150, [[0, 0, 22]]); g.add(sea.mesh);
  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);
  const motes = makeMotes({ n: 60, area: [18, 3, 8], size: .012, v: .06, seed: 39, color: 0xf0d9a0 }); g.add(motes.mesh);
  const dust = makeMotes({ n: 70, area: [10, 1.6, 6], size: .02, v: .2, seed: 43, color: 0xc8a878 }); g.add(dust.mesh);
  const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);
  const spark = makeMotes({ n: 40, area: [1.2, 3.5, 1.2], size: .007, v: .22, seed: 41, color: 0xffe4a8 }); g.add(spark.mesh);
  const ember = makeMotes({ n: 36, area: [.5, 1.8, .5], size: .008, v: .3, seed: 45, color: 0xffb060 }); g.add(ember.mesh);
  const CLOUD = [[0, '#e8c8a0'], [6.8, '#e8c8a0'], [8.6, '#8a7aa8'], [14.0, '#4a4478'], [16.0, '#3a3860'], [41.0, '#3a3860'], [45.0, '#8a6a80'], [49.0, '#e0a888'], [54.0, '#e8c0a0'], [90, '#e8c0a0']];
  const CEM = [[0, '#6a5444'], [6.8, '#6a5444'], [8.6, '#4a4468'], [14.0, '#343058'], [16.0, '#242444'], [41.0, '#242444'], [45.0, '#5a4450'], [49.0, '#6a5044'], [54.0, '#6a5848'], [90, '#6a5848']];

  const colAt = (keys, t) => { let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const [ta, a] = keys[i - 1], [tb, b] = keys[i], k = ease.inOutSine(seg(t, ta, tb)); return css(mx(rgbOf(a), rgbOf(b), k)); };
  const FARC = new THREE.Color('#8498c4');
  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the people: the same Jacob, Rachel, Leah, maids and sons as in Genesis 29-31 (eleven children, 32:22); the two messengers; the herdsmen; the man is a figure of light, drawn unlit so that he reads as light against the dark
  const jacob = mkJacob(rng(87)), rachel = mkRachel(rng(88)), leah = mkLeah(rng(90));
  const bil = mkMaid(rng(91), '#9a6a4a', '#c08a5e', '#e0d4bc', '#8a7a4a', 910), zil = mkMaid(rng(92), '#6a7a58', '#b8825a', '#d8cfb4', '#a87a4a', 911);
  const KID = { reu: mkKid(rng(93), '#6a7fa0', 930, .35), sim: mkKid(rng(94), '#a8683a', 931, .33), lev: mkKid(rng(95), '#5f8a5a', 932, .31), jud: mkKid(rng(96), '#c9a15a', 933, .29),
    dan: mkKid(rng(97), '#7a4a3a', 934, .26), nap: mkKid(rng(98), '#4f7a8a', 935, .25), gad: mkKid(rng(99), '#a2564e', 936, .26), ash: mkKid(rng(100), '#8a9a5a', 937, .24),
    iss: mkKid(rng(101), '#6a5a8a', 938, .24), zeb: mkKid(rng(102), '#b4784a', 939, .23), jos: mkKid(rng(108), '#5f8aa8', 945, .26) };
  const hd1 = mkHerd(rng(104), '#6f8a62', '#a8714a', 941), hd2 = mkHerd(rng(105), '#9a4a42', '#b98a62', 942, '#4a3a30'), sl1 = mkHerd(rng(109), '#8a6a4a', '#a8714a', 946), sl2 = mkHerd(rng(110), '#4f7a8a', '#b98a62', 947, '#4a3a30');
  const sv1 = mkHerd(rng(106), '#c9a15a', '#c38a5c', 943, '#6a5a3a'), sv2 = mkHerd(rng(107), '#7a5a8a', '#a8714a', 944, '#cdbd98');
  const ms1 = mkHerd(rng(111), '#a8683a', '#b98a62', 948), ms2 = mkHerd(rng(112), '#5f8a5a', '#a8714a', 949, '#4a3a30');
  const man = mkMan(rng(113)); man.group.traverse(o => { if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); });
  const ALLP = [jacob, rachel, leah, bil, zil, ...Object.values(KID), hd1, hd2, sl1, sl2, sv1, sv2, ms1, ms2, man]; ALLP.forEach(o => g.add(o.group));
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacob.group.add(mkStaff());
  // God is shown only as light: gold over Jacob while he prays (32:9-12), when he is blessed (32:29) and at Peniel (32:30); the man is a pale figure with a glow, a flash at the hip (32:25)
  const jS = shaft(6, .22, .5, [1, .86, .5], .9, .12), jG = spriteGlow(0, 0, 0, 1.3, 0xffd890, 0), jP = pool(.9, 0xffd890, 0), jL = new THREE.PointLight(0xffd090, 0, 6, 1.5);
  const mG = spriteGlow(0, 0, 0, 2.0, 0xfff0c8, 0), mG2 = spriteGlow(0, 0, 0, .8, 0xffffff, 0), mL = new THREE.PointLight(0xe8e8ff, 0, 6, 1.5), hipG = spriteGlow(0, 0, 0, .9, 0xfff4d8, 0);
  g.add(jS, jG, jP, mG, mG2, hipG);
  // the torches the family carries across the ford (a stick, a small flame and a glow), and one light that follows them
  const TORCH = [0, 1, 2, 3].map(i => { const tg = new THREE.Group(), b = new GB(rng(40 + i)); b.box('#5a3a22', [0, .2, 0], [.025, .4, .025], [0, 0, 0], .01); tg.add(new THREE.Mesh(b.build(), lam));
    const fl = new THREE.Mesh(new THREE.ConeGeometry(.045, .16, 5).translate(0, .46, 0), new THREE.MeshBasicMaterial({ color: 0xffa040, toneMapped: false })); tg.add(fl); const gl = spriteGlow(0, .5, 0, .8, 0xff9a40, 0); tg.add(gl); g.add(tg); return { tg, fl, gl }; });
  const torchL = new THREE.PointLight(0xff9a50, 0, 7, 1.4);

  // ---- animation helpers
  const walkAnim = (t, ph = 0, sp = 9.5) => { const w = Math.sin(t * sp + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .018 }; };
  function fig(f, x, z, ry, mv, t, ph, extra = {}, sp = 9.5, y0 = 0) { const w = walkAnim(t, ph, sp); pose(f, x, gAt(x, z) - .02 + y0 + (mv ? w.hop : 0), z, ry, { ...(mv ? { a0x: w.a0x, a1x: w.a1x } : {}), ...extra }); }
  const ON = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));
  const GE = (t, list) => { const o = {}; for (const [a, b, c, d, ex] of list) { const w = ON(t, a, b, c, d); if (w > .0005) for (const k in ex) o[k] = (o[k] || 0) + ex[k] * w; } return o; };
  const v3 = new THREE.Vector3(), state = {};
  const walk = (ts, v, pts) => { const ks = [[ts, pts[0][0], pts[0][1], 'L']]; let t = ts; for (let i = 1; i < pts.length; i++) { t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) / v; ks.push([t, pts[i][0], pts[i][1], 'L']); } return ks; };

  // ---- who goes where
  const MS = [-3.9, 1.0], MB = [-1.25, 1.65], WRc = WR, RR = .3;
  const JF = [[0, headZ(1, -.4)], [3.0, headZ(1, -.4)], [3.7, headZ(1.2, -.25)], [7.7, headZ(1.2, -.25)], [8.3, headZ(1, -.4)], [30, headZ(1, -.4)]];
  const M1K = walk(0, 2.7, [[6.5, .2], [4.4, .9], [2.4, 1.3], [.6, 1.5], [-.8, 1.75]]), M2K = walk(.35, 2.7, [[7.1, .7], [4.6, 1.3], [2.5, 1.6], [.6, 1.85], [-.75, 2.6]]);
  const LW = walk(57.3, 1.25, [JP, [-.7, 1.6], [.45, 1.25], [2.2, 1.35], [3.1, 1.0]]);                   // the limp: Jacob walks on east through the ford into the sun (32:31)
  // the droves (32:13-21): each leaves the camp's pasture in turn, crosses the ford and stops on the east bank with a space before the next
  const DRV = [{ t0: 14.4, lane: 1.0, end: [9.0, .5], an: GOATS, hd: sv1, sp: 1.9 }, { t0: 15.2, lane: 1.55, end: [8.0, 1.5], an: DARK, hd: sv2, sp: 1.9 }, { t0: 16.0, lane: 1.15, end: [7.0, .6], an: WHITE.slice(0, 4), hd: hd1, sp: 1.9 },
    { t0: 16.8, lane: 1.7, end: [6.0, 1.6], an: WHITE.slice(4), hd: hd2, sp: 1.9 }, { t0: 17.5, lane: 1.0, end: [5.1, .6], an: camels, hd: sl1, sp: 1.6 }, { t0: 18.2, lane: 1.5, end: [4.3, 1.7], an: donkeys, hd: sl2, sp: 1.6 }];
  const DK = new Map();
  DRV.forEach((d, k) => { const hx0 = -4.9 + .95 * (k % 3), hz0 = -3.6 + 1.0 * Math.floor(k / 3);
    const mk = (j, man_) => { const ox = man_ ? -1.25 : -.34 * (j >> 1), oz = man_ ? .15 : (j % 2 ? .28 : -.28) + .05 * (j >> 1), st = d.t0 + (man_ ? 0 : .12 + .1 * j), h0 = [hx0 + (man_ ? .1 : -.3 + .3 * (j % 3)), hz0 + (man_ ? .6 : -.25 + .3 * ((j / 3) | 0))];
      return walk(st, d.sp, [h0, [-1.9 + ox, -.1 + oz], [-.8 + ox, d.lane + oz], [.5 + ox, d.lane + oz], [2.6 + ox, d.lane + .7 * oz], [d.end[0] + ox * .6, d.end[1] + oz]]); };
    d.an.forEach((a, j) => DK.set(a, mk(j, false))); DK.set(d.hd, mk(0, true)); });
  // the family (32:22): the maids and their sons lead, then Leah and her sons, Rachel and Joseph last, by torchlight
  const FORDER = [['bil', bil, 1], ['dan', KID.dan], ['nap', KID.nap], ['zil', zil, 1], ['gad', KID.gad], ['ash', KID.ash], ['leah', leah, 1], ['reu', KID.reu], ['sim', KID.sim], ['lev', KID.lev], ['jud', KID.jud], ['iss', KID.iss], ['zeb', KID.zeb], ['rachel', rachel, 1], ['jos', KID.jos]];
  const FK = FORDER.map(([id, f], i) => { const lat = ((i % 3) - 1) * .2, ts = 21.0 + .17 * i, col = i % 5, row = Math.floor(i / 5);
    return { f, ts, torch: FORDER[i][2], id, ph: 2 + i * .9, keys: walk(ts, 1.9, [[-5.4, .35 + lat + .1 * (i % 4)], [-3.1, .8 + lat], [-1.0, .95 + lat], [.45, 1.15 + lat], [2.0, 1.6 + .5 * lat], [2.6 + .4 * col, 2.3 + .4 * row]]) }; });

  // the grapple: the two circle each other around WRc; the opponent comes out of the dark at 27 and leaves in light after the blessing
  const wth = t => t < 35.6 ? 1.9 + 1.0 * (t - 27.4) : 1.9 + 1.0 * (35.6 - 27.4) + .18 * (t - 35.6);
  function duel(t) { const a = smooth(26.9, 28.2, t), b = smooth(39.8, 41.0, t), th = wth(t), r = RR * (1 - .1 * Math.sin(t * 3));
    let jx = lerp(JP[0], WRc[0] + Math.cos(th) * r, a), jz = lerp(JP[1], WRc[1] + Math.sin(th) * r, a), mx = lerp(MS[0], WRc[0] - Math.cos(th) * r, a), mz = lerp(MS[1], WRc[1] - Math.sin(th) * r, a);
    jx = lerp(jx, JP[0], b); jz = lerp(jz, JP[1], b); mx = lerp(mx, MB[0], b); mz = lerp(mz, MB[1], b); return { jx, jz, mx, mz }; }

  function update(t, camera, sid) {
    const sway = (k, ph) => ({ s: 1 + .006 * Math.sin(t * k + ph) });
    const cam = camera && camera.position;

    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }

    // the low sun behind the subject: evening at the start, none in the dusk and the night, rising from 44 s
    const dark = Math.max(ON(t, 7.6, 9.0, 14.6, 15.8) * .5, ON(t, 15.8, 17.6, 42.0, 44.6));

    { const k = Math.max(ON(t, -1, .5, 6.6, 9.0) * .5, ON(t, 44.0, 50.0, 90, 91) * .55), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * dark), [1, .5, 2.5]); dust.update(t, .3 * (ON(t, 14.6, 15.6, 22, 24) + ON(t, 56.6, 57.4, 61, 62.5)), [.5, .1, 1.4]);
    // ---- the river: colour with the light, ripples drifting south
    { const nk = ON(t, 15.8, 18.0, 42.0, 45.0), dk = ON(t, 44.0, 49.0, 90, 91); water.material.color.setRGB(lerp(lerp(.23, .1, nk), .5, dk * .5), lerp(lerp(.42, .17, nk), .55, dk * .5), lerp(lerp(.57, .32, nk), .68, dk * .5)); water.material.emissive.setRGB(lerp(.08, .03, nk) + .1 * dk, lerp(.19, .06, nk) + .06 * dk, lerp(.29, .12, nk) + .02 * dk);
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.22 + .12 * (1 - nk) + .35 * dk) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the camp fire burns through the night and dies down at dawn

    { const fo = ON(t, 14.2, 15.2, 44.0, 47.0), fk = .92 + .08 * Math.sin(t * 7.3) * Math.sin(t * 11.1);
      flames.forEach((f, i) => { f.visible = fo > .02; f.scale.set(.85 + .2 * Math.sin(t * 9 + i * 2), .8 + .4 * Math.sin(t * 13 + i * 2.1), .85); });
      fireG.material.opacity = .5 * fk * fo; fireG2.material.opacity = .42 * fo; fireL.intensity = 3.0 * fk * fo; ember.update(t, .9 * fo, [FIRE[0], fireY + .15, FIRE[1]]); }

    // ---- Esau's men: they rise over the ridge while the messengers speak (32:6) and are gone with the dusk
    { const k = smooth(3.6, 4.8, t) * (1 - smooth(8.0, 8.6, t)); host.scale.setScalar(Math.max(.001, k)); host.visible = k > .01; }
    // ---- the animals and their herdsmen
    DK.forEach((K, a) => { const p = kp(t, K), isA = !!a.legs; a.group.visible = t > K[0][0] - .05; if (isA) { const i = DRV.findIndex(d => d.an.includes(a)), j = i >= 0 ? DRV[i].an.indexOf(a) : 0;
        a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .3 * Math.sin(j * 2.1 + i)); const big = i >= 4; if (p.mv) walkLegs(a.legs, t + j * 1.3, big ? 7 : 9, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); }
      else { const ph = 1 + (DRV.findIndex(d => d.hd === a)) * 1.3; fig(a, p.x, p.z, p.mv ? headZ(p.vx, p.vz) : headZ(1, -.25), p.mv, t, ph, { ...sway(1.3, ph) }, 8); } });
    // ---- Jacob and the man
    const D = duel(t), man_on = smooth(26.9, 27.7, t) * (1 - smooth(48.6, 49.6, t));
    { const walkK = t >= 57.3, p = walkK ? kp(t, LW) : { x: D.jx, z: D.jz, mv: false, vx: 1, vz: 0 }, mv = p.mv;
      const kn1 = ON(t, 8.2, 9.0, 14.0, 14.9), kn2 = ON(t, 41.5, 42.4, 48.4, 49.3), gr = ON(t, 27.2, 28.2, 39.6, 40.8), hurt = smooth(31.5, 31.9, t), tw = Math.sin(t * 9.3), tw2 = Math.sin(t * 6.1 + 1);
      const toMan = headZ(D.mx - D.jx, D.mz - D.jz), turn = smooth(26.3, 27.1, t), faceE = headZ(1, -.4);
      const a0 = hy(Math.min(t, 26.3), JF); let ry;
      if (walkK) ry = mv ? headZ(p.vx, p.vz) : faceE; else if (t < 26.3) ry = hy(t, JF); else if (t < 49.3) { let d = toMan - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; ry = a0 + d * turn; } else ry = faceE;
      const arm = GE(t, [[5.0, 5.6, 7.2, 7.9, { a0x: -1.0, a1x: -1.0, a0z: -.3, a1z: .3 }], [8.8, 9.6, 13.4, 14.4, { a0x: -.25, a1x: -.25, a0z: -1.9, a1z: 1.9 }], [41.8, 42.5, 48.4, 49.2, { a0x: -.9, a1x: -.9, a0z: .2, a1z: -.2 }], [50.6, 51.4, 55.2, 56.4, { a0x: -.5, a1x: -.5, a0z: -.85, a1z: .85 }],
        [57.3, 58.0, 62, 63, { a1x: .35, a1z: .75 }]]);
      const grA = gr * (1 + .12 * tw), ex = { ...arm, a0x: (arm.a0x || 0) - 1.2 * grA, a1x: (arm.a1x || 0) - 1.25 * grA, a0z: (arm.a0z ?? 0) + .15 * gr, a1z: (arm.a1z ?? 0) - .15 * gr,
        lx: .22 * kn1 + (.3 + .05 * tw2) * gr + .28 * kn2, lz: .2 * hurt * (1 - smooth(41.5, 43.0, t) * .55) + (walkK ? .1 + .05 * Math.sin(t * 5.2) : 0), s: 1 - .22 * Math.max(kn1, kn2) };
      fig(jacob, p.x + .015 * gr * tw, p.z, ry, mv, t, 6.2, { ...ex, ...sway(1.5, 0) }, 5.2);
      state.jacob = [p.x, gAt(p.x, p.z), p.z]; }
    { const m = man; m.group.visible = man_on > .01;
      const gr = ON(t, 27.4, 28.2, 39.6, 40.8), tw = Math.sin(t * 9.3 + 2), push = ON(t, 35.8, 36.6, 39.4, 40.0), bless = ON(t, 41.6, 42.4, 48.4, 49.0), strike = ON(t, 31.1, 31.5, 31.8, 32.3), up = smooth(48.6, 49.6, t);
      const toJ = headZ(D.jx - D.mx, D.jz - D.mz);
      pose(m, D.mx, gAt(D.mx, D.mz) - .02, D.mz, toJ, { lx: (.28 + .05 * tw) * gr * (1 - .9 * push) - .14 * push, a0x: -1.15 * gr * (1 - .6 * push) - .3 * bless, a1x: -1.2 * gr * (1 - strike) - 1.7 * strike - 2.3 * bless, a0z: -.25 * gr, a1z: .25 * gr + .5 * strike + .3 * bless, s: 1 + .5 * up, sx: Math.max(.001, man_on) * (1 - up * .97) });
      state.man = [D.mx, gAt(D.mx, D.mz), D.mz]; }
    // ---- the messengers (32:3-6): they run back across the ford, speak, and are gone by the dusk
    [[ms1, M1K, 0], [ms2, M2K, 1]].forEach(([f, K, i]) => { const p = kp(t, K), mv = p.mv; f.group.visible = t < 8.4; fig(f, p.x, p.z, mv ? headZ(p.vx, p.vz) : face(p.x, p.z, JP[0], JP[1]), mv, t, 3 + i * 1.3, mv ? { lx: .1 } : { ...sway(1.4, i) }, 12); });
    // ---- the family at the ford and the torches (32:22-23)
    FK.forEach(o => { const f = o.f, p = kp(t, o.keys), mv = p.mv, big = f.sc > .4; f.group.visible = t >= o.ts - .05;
      fig(f, p.x, p.z, mv ? headZ(p.vx, p.vz) : headZ(-1, -.15), mv, t, o.ph, { ...(o.torch && t > o.ts - .1 ? { a1x: -1.15, a1z: .1 } : {}), ...sway(1.4, o.ph) }, big ? 8 : 9); });
    { const tv = ON(t, 20.8, 21.4, 44.5, 47.0), fk = .9 + .1 * Math.sin(t * 8.3) * Math.sin(t * 12.7); let lead = null;
      TORCH.forEach((T, i) => { const o = FK.find(q => q.id === ['bil', 'zil', 'leah', 'rachel'][i]), f = o.f, gp = f.group.position, ry = f.group.rotation.y, k = f.sc / .45, on = tv > .02 && f.group.visible;
        T.tg.visible = on; T.tg.position.set(gp.x + Math.sin(ry) * .2 * k + Math.cos(ry) * .22 * k, gp.y + .5 * k, gp.z + Math.cos(ry) * .2 * k - Math.sin(ry) * .22 * k); T.tg.scale.setScalar(.9);
        T.fl.scale.set(.9 + .25 * Math.sin(t * 11 + i * 2), .85 + .4 * Math.sin(t * 14 + i * 2.3), .9); T.gl.material.opacity = .6 * fk * tv; if (on && !lead) lead = T.tg.position; });
      if (lead) torchL.position.set(lead.x, lead.y + .25, lead.z + .2); torchL.intensity = (lead ? 3.2 : 0) * tv * fk; }
    // ---- light: gold over Jacob while he prays, is blessed and at Peniel; the man's glow and the flash at the hip
    { const a = ON(t, 9.0, 10.0, 14.0, 14.9), b = ON(t, 42.2, 43.2, 48.4, 49.4), c = ON(t, 51.0, 52.2, 56.0, 57.2), lo = Math.max(a, b, c) * (.92 + .08 * Math.sin(t * 1.7)), lx = D.jx, lz = D.jz, gy = hC(lx, lz);
      jS.position.set(lx, gy, lz); jS.material.opacity = .26 * lo; jS.visible = lo > .004; jG.position.set(lx, gy + .55, lz); jG.material.opacity = .12 * lo; jG.visible = lo > .004; jP.position.set(lx, gy + .03, lz); jP.material.opacity = .18 * lo; jP.visible = lo > .004; jL.position.set(lx + .3, gy + .9, lz + .3); jL.intensity = .8 * lo; spark.update(t, lo * 1.3, [lx, gy, lz]);
      const mo = man_on * (.9 + .1 * Math.sin(t * 2.3)) * (1 + .6 * smooth(48.4, 49.2, t)), mx = D.mx, mz = D.mz, my = hC(mx, mz);
      mG.position.set(mx, my + .5, mz); mG.material.opacity = .42 * mo; mG.visible = mo > .01; mG2.position.set(mx, my + .55, mz); mG2.material.opacity = .4 * mo; mG2.visible = mo > .01; mL.position.set(mx + .2, my + .9, mz + .35); mL.intensity = 1.5 * mo;
      const fl = ON(t, 31.2, 31.5, 31.7, 32.1); hipG.position.set(D.jx, gAt(D.jx, D.jz) + .32, D.jz); hipG.material.opacity = .95 * fl; hipG.visible = fl > .01;
      dustR.update(t, ON(t, 27.4, 28.4, 39.6, 41.0), [D.jx * .5 + D.mx * .5, gAt(D.jx, D.jz) + .05, D.jz * .5 + D.mz * .5]); }
  }



  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#c4c0b4', '#8a7a64', 1.0, '#ffd098', 2.8, [-8, 3.6, 5], .45, '#ffe0b0', [8, 5, 6], 14), Dk(6.8, '#c0bcb2', '#8a7a64', 1.0, '#ffd098', 2.7, [-8, 3.2, 5], .45, '#ffe0b0', [8, 5, 6], 14),
    Dk(8.6, '#6a78b0', '#3a3a58', .85, '#ffa870', 1.8, [-8, 2.0, 5], .45, '#ffc888', [8, 5, 6], 14), Dk(14.2, '#5a6aa8', '#2e2e4c', .8, '#ff9a60', 1.2, [-8, 1.6, 5], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(16.4, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(41.0, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(44.0, '#5a5a98', '#2e2a48', .8, '#9aa0d8', 1.3, [-9, 4, 6], .5, '#ffb880', [-8, 4, 6], 14), Dk(47.5, '#8a88b0', '#4a4458', .9, '#ff9a5a', 2.0, [9, 1.6, -4], .5, '#ffb880', [-8, 4, 6], 14),
    Dk(52, '#b0aac4', '#6a5444', 1.0, '#ffb870', 2.6, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], 14), Dk(62, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 3.2, -5], .45, '#ffcf9a', [-8, 4, 6], 14)];
  const bg = [[0, ['#4a6aa8', '#f4c890']], [6.8, ['#4a6aa8', '#f4c890']], [8.8, ['#3a4a88', '#f09a6a']], [12.0, ['#232e68', '#8a5a78']], [15.6, ['#1e2a5c', '#6a5a88']], [18.0, ['#121c48', '#4a4070']], [21, ['#0e1640', '#2a2a58']], [41, ['#0e1640', '#2a2a58']], [44, ['#1a2458', '#6a4a70']], [47, ['#3a4a88', '#d08a7a']], [50, ['#5a76b0', '#f6a870']], [54, ['#5a86c4', '#f6c890']], [58, ['#5a86c4', '#f6dcb0']], [62, ['#5a86c4', '#f6dcb0']]];
  return { group: g, update, light, bg, far, pl: [fireL, torchL, jL, mL], state, jacob, rachel, leah, man };
}
