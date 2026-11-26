#!/usr/bin/env python3
# Builds g11/src/world30.js from world29.js (unchanged parts copied by line range, Ep30 parts written below).
import re, sys
SRC = '/home/claude/g11/src/'
L = open(SRC + 'world29.js').read().split('\n')
def R(a, b): return '\n'.join(L[a - 1:b])
def rep(s, a, b, n=1):
    assert s.count(a) == n, (a[:60], s.count(a))
    return s.replace(a, b)

HEAD = r"""// Episode 30: Genesis 30. Rachel, who has borne Jacob no children, envies her sister and says to Jacob "Give me children, or I shall die!" (30:1); Jacob's anger is kindled: "Am I in the place of God, who has withheld from you the fruit of the womb?" (30:2);
// Rachel gives Jacob her maid Bilhah, who bears Dan and Naphtali (30:3-8); Leah gives her maid Zilpah, who bears Gad and Asher (30:9-13); Leah bears Issachar, Zebulun and a daughter, Dinah (30:17-21);
// then God remembered Rachel, opened her womb, and she bore a son and said "God has taken away my reproach"; she named him Joseph (30:22-24); Jacob asks Laban to send him away with his wives and children (30:25-26); Laban says he has learned that the Lord has blessed him because of Jacob, and bids him name his wages (30:27-28);
// Jacob asks for the dark lambs and the spotted and speckled goats; Laban agrees, and the same day removes those animals and sets three days' journey between himself and Jacob (30:31-36); Jacob grew exceedingly rich, with large flocks, servants, camels and donkeys (30:43).
// Cinematic interpretation: the floating land, the yard, the fire pit, the house and its lit doorway, the places where the people stand, the gestures, the pop of each child into the yard, the herders, the pasture and the road the flocks walk out on, the colour of the light and the faces are not in the text.
// The film leaves out the mandrakes (30:14-16), the naming speeches of the mothers (30:6-13, 30:18-20), Rachel's wish "May the Lord add to me another son" (30:24), Jacob's staffs and the breeding of the flocks (30:37-42), and the first-year details. The giving of the maids and the births are told in one sentence each: the film shows only people standing together and a child coming into the yard.
// The text does not say that the sisters stood at a fire, where each child stood, that the herders were Laban's sons (30:35 says "his sons") or servants, or that God's remembering was a light; the film shows them so that each moment can be seen. God is shown only as light, never as a figure.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, spriteGlow, shaft, pool } from './kit.js';
import { seg, ease, rgbOf, mx, css } from './util.js';
import { pk, makeMotes, roundTreeGeo, oliveGeo, makeSheep, makeQuad, makeCamel, makeDonkey, walkLegs } from './props.js';
import { underRock, TAU } from './terrain8.js';
import { LK } from './lights.js';
import { mkIslet, cloudSea, farMountains10, headZ, headX, C3, rimf, meshOf } from './world10.js';

export const RIC = 15;
export const HZ = [-6.7, .9], DOOR = [-5.46, .9], YARD = [-4.3, 1.25], WELL = [3.4, -1.0], FLD = [-2.6, 4.8], FIRE = [-3.2, .35], PAS = [7.0, -1.9];       // Laban's house (door faces east); the yard; the well; the field; the fire pit; the pasture
export const EV = { a1: .6, a2: 8.43, b1: 12.89, b2: 21.15, c1: 26.29, d1: 34.26, d2: 44.81, e1: 54.19 };
"""

TERRAIN = R(23, 42)
TERRAIN = rep(TERRAIN, "const FLATS = [[HZ[0] + 1.2, HZ[1] + .4, .32, 4.4], [YARD[0], YARD[1], .32, 2.8], [WELL[0], WELL[1], .31, 3.4], [FLD[0], FLD[1], .32, 3.2], [-1.2, TZ, .32, 4.0]];",
  "const FLATS = [[HZ[0] + 1.2, HZ[1] + .4, .32, 4.4], [YARD[0], YARD[1], .32, 2.8], [WELL[0], WELL[1], .31, 3.4], [FLD[0], FLD[1], .32, 3.2], [FIRE[0], FIRE[1], .32, 2.0], [PAS[0] + .6, PAS[1] + .2, .32, 4.4]];")
TERRAIN = rep(TERRAIN, "  if (y < .02) b.lerp(", "  b.lerp(C3('#86a458'), .55 * smooth(4.4, 2.0, Math.hypot(x - PAS[0] - .6, z - PAS[1])));\n  if (y < .02) b.lerp(")
TERRAIN = rep(TERRAIN, "export const stage = { gAt, HZ, DOOR, YARD, WELL, FLD, TL, PATH };", "export const stage = { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH };")

WALK = R(44, 49)

FACT = r"""
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
"""

MID = R(62, 87)
MID = rep(MID, "|| (Math.abs(z - TZ) < 1.0 && x > -5.4 && x < 2.9);", "|| Math.hypot(x - FIRE[0], z - FIRE[1]) < 1.6 || Math.hypot(x - PAS[0], z - PAS[1]) < 3.8;")
MID = rep(MID, "[7.6, -4.4, .9]", "[2.2, -6.2, .9]")
MID = rep(MID, "  // ---- Laban's house: mud-brick walls, a flat roof with a parapet, a doorway on the east face, a small window, and a lit lamp inside (the wedding night and Leah's evening)",
  "  // ---- Laban's house: mud-brick walls, a flat roof with a parapet, a doorway on the east face, a small window, and a lit lamp inside (the evening of Joseph's birth)")

FIRE = r"""
  // ---- the fire pit in the yard: a ring of stones, crossed logs and a flickering flame; the family gathers by it
  const fireY = hC(FIRE[0], FIRE[1]);
  { const b = new GB(rng(431)); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; b.box(pk(R, ['#9a8e7c', '#a99c86', '#85796a']), [FIRE[0] + Math.cos(a) * .3, fireY + .06, FIRE[1] + Math.sin(a) * .3], [.14, .12, .14], [0, -a, 0], .03); }
    b.box('#2a2018', [FIRE[0], fireY + .02, FIRE[1]], [.5, .02, .5], [0, 0, 0], .01); b.box('#3a2a1c', [FIRE[0], fireY + .09, FIRE[1]], [.42, .06, .07], [0, .6, 0], .01); b.box('#4a3420', [FIRE[0], fireY + .09, FIRE[1]], [.42, .06, .07], [0, -.6, 0], .01); ca.add(meshOf(b)); }
  const flames = [0, 1, 2].map(i => { const fm = new THREE.Mesh(new THREE.ConeGeometry(.075 - .015 * i, .28 - .05 * i, 5).translate(0, .14, 0), new THREE.MeshBasicMaterial({ color: i ? 0xffc050 : 0xff8a28, toneMapped: false, transparent: true, opacity: .95 })); fm.position.set(FIRE[0] + (i - 1) * .05, fireY + .12, FIRE[1] + (i % 2 ? .03 : -.02)); g.add(fm); return fm; });
  const fireG = spriteGlow(FIRE[0], fireY + .3, FIRE[1], 1.6, 0xff9a40, 0), fireG2 = spriteGlow(FIRE[0], fireY + .26, FIRE[1], .6, 0xffe0a0, 0); g.add(fireG, fireG2);
  const fireL = new THREE.PointLight(0xff9a50, 0, 6, 1.5); fireL.position.set(FIRE[0], fireY + .6, FIRE[1] + .3);
"""

FIELD = R(99, 101)
WELLB = R(105, 112)
WELLB = rep(WELLB, "  // ---- the well: a ring of stones, the great stone on its mouth that is rolled aside (29:2, 29:10), a bucket on the rim, and a stone trough with water for the flock (29:3, 29:10)",
  "  // ---- the well: a ring of stones, a bucket on the rim and a stone trough with water for the flock (as in Genesis 29)")

ANIM = r"""
  // ---- the flocks: Laban's white sheep, among them the dark lambs and spotted goats Jacob names as his wages (30:32), and the flock that grows (30:43)
  const put = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); s.home = [x, z, ry]; return s; };
  const SPOT = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) SPOT.push([PAS[0] - .9 + .55 * c + (r % 2 ? .27 : 0) + .06 * Math.sin(r * 3 + c), PAS[1] - .75 + .5 * r + .05 * Math.cos(c * 2 + r)]);
  const TYP = ['w', 'd', 'w', 'g', 'd', 'g', 'w', 'd', 'w', 'g', 'd', 'w', 'g', 'w', 'd', 'w'];
  const white = [], mixed = []; TYP.forEach((ty, i) => { const [x, z] = SPOT[i], ry = i * 1.9;
    if (ty === 'w') white.push(put(makeSheep(rng(700 + i)), x, z, ry)); else mixed.push(put(ty === 'd' ? mkDark(720 + i) : mkGoat(740 + i), x, z, ry)); });
  const GP = Array.from({ length: 12 }, (_, k) => [PAS[0] - 2.6 + .78 * (k % 6) + (k > 5 ? .35 : 0) + .08 * Math.sin(k * 2.3), PAS[1] - 1.5 - .75 * Math.floor(k / 6) + .08 * Math.cos(k * 1.7)]);
  const grow = GP.map(([x, z], k) => { const s = put(k % 2 ? mkGoat(760 + k) : mkDark(780 + k), x, z, 1.2 + k * 1.3); s.t0 = 54.6 + .2 * k; return s; });
  const camels = [0, 1].map(i => { const s = makeCamel(rng(800 + i)); ca.add(s.group); return s; }), donkeys = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); ca.add(s.group); return s; });
"""

SKY = R(120, 122) + "\n" + R(124, 126) + r"""
  const ember = makeMotes({ n: 36, area: [.5, 1.8, .5], size: .008, v: .3, seed: 45, color: 0xffb060 }); g.add(ember.mesh);
  const CLOUD = [[0, '#e8d0b0'], [14, '#e8c4a0'], [22, '#d89080'], [27, '#6a5a80'], [34, '#3a3860'], [43.4, '#3a3860'], [45.4, '#e8c8a8'], [56, '#e8c0a0'], [90, '#e8c0a0']];
  const CEM = [[0, '#6a5a48'], [14, '#6a5444'], [22, '#5a4444'], [27, '#3a3050'], [34, '#242444'], [43.4, '#242444'], [45.4, '#6a5848'], [90, '#6a5848']];
""" + R(129, 131)

PEOPLE = r"""
  // ---- the people
  const jacob = mkJacob(rng(87)), rachel = mkRachel(rng(88)), laban = mkLaban(rng(89)), leah = mkLeah(rng(90));
  const bil = mkMaid(rng(91), '#9a6a4a', '#c08a5e', '#e0d4bc', '#8a7a4a', 910), zil = mkMaid(rng(92), '#6a7a58', '#b8825a', '#d8cfb4', '#a87a4a', 911);
  const KID = { reu: mkKid(rng(93), '#6a7fa0', 930, .36), sim: mkKid(rng(94), '#a8683a', 931, .34), lev: mkKid(rng(95), '#5f8a5a', 932, .32), jud: mkKid(rng(96), '#c9a15a', 933, .30),
    dan: mkKid(rng(97), '#7a4a3a', 934, .27), nap: mkKid(rng(98), '#4f7a8a', 935, .26), gad: mkKid(rng(99), '#a2564e', 936, .27), ash: mkKid(rng(100), '#8a9a5a', 937, .25),
    iss: mkKid(rng(101), '#6a5a8a', 938, .25), zeb: mkKid(rng(102), '#b4784a', 939, .24), din: mkKid(rng(103), '#c88a7a', 940, .24, '#cf9468', true) };
  const hd1 = mkHerd(rng(104), '#6f8a62', '#a8714a', 941), hd2 = mkHerd(rng(105), '#9a4a42', '#b98a62', 942, '#4a3a30'), sv1 = mkHerd(rng(106), '#c9a15a', '#c38a5c', 943, '#6a5a3a'), sv2 = mkHerd(rng(107), '#7a5a8a', '#a8714a', 944, '#cdbd98');
  const ALLP = [jacob, rachel, laban, leah, bil, zil, ...Object.values(KID), hd1, hd2, sv1, sv2]; ALLP.forEach(o => g.add(o.group));
  const staff = new THREE.Group(); { const b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; staff.add(m); } jacob.group.add(staff);
  const baby = new THREE.Group(); { const b = new GB(rng(9)); b.box('#efe4cc', [0, 0, 0], [.2, .1, .11], [0, 0, 0], .02); b.add(G.ico0, '#c08258', [-.1, .03, 0], [.045, .045, .045], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; baby.add(m); } baby.position.set(0, .56, .2); rachel.group.add(baby); baby.visible = false;
  const racL = new THREE.PointLight(0xffd090, 0, 6, 1.5), racS = shaft(6, .22, .5, [1, .86, .5], .9, .12), racG = spriteGlow(0, 0, 0, 1.3, 0xffd890, 0), racP = pool(.9, 0xffd890, 0); g.add(racS, racG, racP);
"""

ANIMH = R(144, 150)

KEYS = r"""
  // ---- the keys
  // Rachel: by the door at the start (30:1), beside Jacob and the maids (30:3-8), alone in the light and then with her son (30:22-24)
  const KR = [[0, -4.75, 1.3], [11.6, -4.75, 1.3], [12.4, -4.5, 1.45, 'W'], [26.4, -4.5, 1.45], [27.8, -4.3, 1.85, 'W'], [90, -4.3, 1.85]];
  // Jacob: comes to Rachel (30:1-2), stands between the sisters (30:3-13), goes to Rachel and her son (30:24), speaks with Laban in the yard (30:25-28); then at the pasture (30:31-43)
  const KJ = [[0, -.6, 1.55], [2.8, -.6, 1.55], [5.4, -3.75, 1.2, 'W'], [13.4, -3.75, 1.2], [14.6, -3.45, 1.4, 'W'], [30.6, -3.45, 1.4], [32.2, -3.7, 1.85, 'W'], [90, -3.7, 1.85]];
  const KJ2 = [[44.5, 4.3, -.85], [54.4, 4.3, -.85], [57.0, 4.5, -.6, 'W'], [90, 4.5, -.6]];
  const KL1 = [[33.0, 1.2, .4], [35.3, -2.2, 1.75, 'W'], [90, -2.2, 1.75]], KL2 = [[44.5, 5.5, -.7], [90, 5.5, -.7]];
  const KB = [[12.0, DOOR[0] + .3, DOOR[1] + .1], [13.7, -4.05, 1.12, 'W'], [90, -4.05, 1.12]], KZ = [[11.6, 1.6, 1.1], [13.8, -1.3, 1.25, 'W'], [90, -1.3, 1.25]];
  const KP = { reu: [-1.9, 1.25], sim: [-2.5, 1.85], lev: [-1.5, .75], jud: [-2.85, .95], dan: [-4.75, .8], nap: [-4.3, .65], gad: [-1.0, 1.75], ash: [-.65, .95], iss: [-2.55, .5], zeb: [-2.0, .5], din: [-1.35, .6] };
  const KT = { reu: -9, sim: -9, lev: -9, jud: -9, dan: 17.85, nap: 18.4, gad: 19.2, ash: 19.75, iss: 23.0, zeb: 23.75, din: 24.95 };                    // when each child comes into the yard, as the name is spoken
  const LP = [-2.45, 1.25];                                                                                                                                  // Leah
  const KH1 = [[49.6, 12.2, -2.6], [51.2, 8.6, -1.9, 'W'], [51.5, 8.6, -1.9], [53.7, 11.0, .7, 'W'], [90, 11.0, .7]], KH2 = [[49.9, 12.6, -1.6], [51.4, 8.7, -1.0, 'W'], [51.7, 8.7, -1.0], [53.8, 11.4, 1.4, 'W'], [90, 11.4, 1.4]];
  const KC = [[[56.6, 12.6, -2.6], [60.6, 9.0, -2.5]], [[57.2, 13.4, -3.4], [61.0, 9.8, -3.3]]], KD = [[[56.9, 13.4, -1.2], [60.8, 10.0, -1.1]], [[57.4, 14.0, -.4], [61.2, 10.6, -.3]]];
  const SV = [[3.9, -2.9], [9.2, -4.6]];
  const RS = [-4.3, 1.85];                                                                                                                                   // where Rachel stands in the light
"""

UPDATE = r"""
  function update(t, camera, sid) {
""" + R(166, 172) + r"""
    // the low sun behind the subject through the golden light, dimmer through the dusk
    { const k = (ON(t, -1, .5, 90, 91) * .5) * (1 - .55 * ON(t, 24.6, 26.4, 43.2, 44.8)), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)), [3, .5, 2.5]); dust.update(t, .5 * ON(t, 51.0, 52.0, 53.6, 54.8), [9.6, .2, -.4]);
    // ---- the fire burns through the yard scenes; stronger as the dusk comes
    { const fk = .92 + .08 * Math.sin(t * 7.3) * Math.sin(t * 11.1), dus = .55 + .45 * ON(t, 22, 26, 43, 44.6);
      flames.forEach((f, i) => { f.scale.set(.85 + .2 * Math.sin(t * 9 + i * 2), .8 + .4 * Math.sin(t * 13 + i * 2.1), .85); });
      fireG.material.opacity = .5 * fk * dus; fireG2.material.opacity = .42 * dus; fireL.intensity = 3.0 * fk * dus; ember.update(t, .9, [FIRE[0], fireY + .15, FIRE[1]]); }
    // ---- the doorway is lit through the dusk (the evening of Joseph's birth)
    { const dk = ON(t, 22.5, 25.4, 43.2, 44.6), fk = .94 + .06 * Math.sin(t * 2.3) * Math.sin(t * 3.7);
      doorM.material.opacity = .85 * dk * fk; winM.material.opacity = .8 * dk * fk; doorG.material.opacity = .4 * dk * fk; doorG2.material.opacity = .24 * dk; doorL.intensity = 2.4 * dk * fk; }
    // ---- the animals: the white flock grazes; the dark lambs and spotted goats are led off by the herders (30:35-36); the flock that grows (30:43)
    white.forEach((s, i) => { s.group.rotation.y = s.home[2] + .14 * Math.sin(t * .5 + i); });
    mixed.forEach((s, i) => { const u = smooth(51.3 + .09 * i, 53.5, t), dx = 10.1 + .38 * (i % 3), dz = .55 + .34 * Math.floor(i / 3), x = lerp(s.home[0], dx, u), z = lerp(s.home[1], dz, u), mv = u > .01 && u < .99;
      s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = mv ? headX(dx - s.home[0], dz - s.home[1]) : s.home[2] + .14 * Math.sin(t * .5 + i + 2); if (mv) walkLegs(s.legs, t + i, 9, .5); else walkLegs(s.legs, 0, 0, 0); s.group.visible = !(u >= .995 && t > 54.6); });
    grow.forEach((s, k) => { const a = smooth(s.t0, s.t0 + .5, t); s.group.visible = t > s.t0; s.group.scale.setScalar(a + .001); s.group.rotation.y = s.home[2] + .14 * Math.sin(t * .5 + k); });
    [[camels, KC, 1], [donkeys, KD, 1]].forEach(([arr, K]) => arr.forEach((s, i) => { const [a, b] = K[i], u = ease.inOutSine(seg(t, a[0], b[0])), x = lerp(a[1], b[1], u), z = lerp(a[2], b[2], u), mv = u > .005 && u < .995;
      s.group.visible = t > a[0] - .1; s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = headX(b[1] - a[1], b[2] - a[2]); if (mv) walkLegs(s.legs, t + i * 1.3, 7, .35); else walkLegs(s.legs, 0, 0, 0); }));
    // ---- the people
    // Jacob: comes to Rachel (30:1-2), stands between the sisters (30:3-13), goes to Rachel and her son (30:24), speaks with Laban (30:25-28); at the pasture he points to the dark lambs (30:32) and watches the flocks grow (30:43)
    { const early = t < 44.5, p = early ? kp(t, KJ) : kp(t, KJ2), mv = p.mv; let ry, ex = {};
      if (t < 13.5) { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, t < 2.8 ? 0 : .3); ex = GE(t, [[8.9, 9.5, 11.3, 12.0, { a0x: -.5, a1x: -.5, a0z: -.55, a1z: .55 }]]); }
      else if (t < 30.6) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[13.4, headZ(-1, .3)], [14.6, headZ(-1, .2)], [15.8, headZ(1, .15)], [21.0, headZ(1, .15)], [24.0, headZ(-1, .2)], [26.0, headZ(-1, .3)]]); }
      else if (t < 44.5) { ry = mv ? headZ(p.vx, p.vz) : hy(t, [[31.4, headZ(-1, -.05)], [33.5, headZ(-1, -.05)], [35.2, headZ(1, -.02)], [44.4, headZ(1, -.02)]]); ex = GE(t, [[35.4, 36.0, 37.4, 38.4, { a1x: -1.0, a0x: -.2, a1z: .3 }]]); }
      else { ry = mv ? headZ(p.vx, p.vz) : (t < 54.4 ? headZ(1, .12) : headZ(1, -.4)); ex = GE(t, [[45.6, 46.2, 47.6, 48.4, { a1x: -1.5, a1z: .1, a0x: -.2 }]]); }
      fig(jacob, p.x, p.z, ry, mv, t, 6.2, { ...ex, s: 1 + .006 * Math.sin(t * 1.5) }, 8.4); staff.visible = t > 44.4; state.jacob = [p.x, gAt(p.x, p.z), p.z]; }
    // Rachel: apart from the family at the start (30:1), pleads (30:1), lowers her head (30:2), stands with Bilhah (30:3), alone in the light (30:22), holds her son (30:23-24)
    { const p = kp(t, KR), mv = p.mv; rachel.group.visible = t < 44.8;
      const ry = mv ? headZ(p.vx, p.vz) : (t < 5.0 ? headZ(2.3, -.4) : (t < 26.4 ? headZ(1, -.2) : headZ(.2, 1)));
      const ex = GE(t, [[5.0, 5.6, 7.6, 8.8, { a0x: -.9, a1x: -.9, a0z: -.4, a1z: .4 }], [13.9, 14.4, 15.2, 15.8, { a0x: -.7, a0z: -.2 }], [28.9, 29.5, 44.0, 44.8, { a0x: -.95, a1x: -.95, a0z: -.35, a1z: .35 }]]);
      fig(rachel, p.x, p.z, ry, mv, t, 2.2, { ...ex, s: 1 + .006 * Math.sin(t * 1.6) }, 8.4);
      baby.visible = t > 28.8 && t < 44.8; const bs = smooth(28.8, 29.6, t); baby.scale.setScalar(bs + .001); state.rachel = [p.x, gAt(p.x, p.z), p.z]; }
    // Leah: content by the fire with her sons while Rachel stands apart (30:1)
    { const ry = headZ(-.3, 1), ex = GE(t, [[14.0, 14.6, 15.4, 16.0, { a1x: -.7, a1z: .2 }]]); fig(leah, LP[0], LP[1], ry, false, t, 4.4, { ...ex, s: 1 + .006 * Math.sin(t * 1.4) }, 8.4); }
    // the maids (30:3, 30:9): each stands beside her mistress while Jacob stands between
    { const pb = kp(t, KB), pz = kp(t, KZ); bil.group.visible = zil.group.visible = t > 11.9 && t < 44.8;
      fig(bil, pb.x, pb.z, pb.mv ? headZ(pb.vx, pb.vz) : headZ(1, -.1), pb.mv, t, 1.4, { s: 1 + .006 * Math.sin(t * 1.5) }, 8.4); fig(zil, pz.x, pz.z, pz.mv ? headZ(pz.vx, pz.vz) : headZ(-1, .2), pz.mv, t, 3.3, { s: 1 + .006 * Math.sin(t * 1.3) }, 8.4); }
    // Laban: comes to speak with Jacob (30:25-28); at the pasture he agrees and the animals are taken away (30:34-36)
    { const early = t < 44.5, p = early ? kp(t, KL1) : kp(t, KL2), mv = p.mv; laban.group.visible = t > 32.9 && t < 54.0; let ry, ex = {};
      if (early) { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, .05); ex = GE(t, [[39.2, 39.8, 41.4, 42.2, { a1x: -1.2, a1z: .5, a0x: -.1 }], [42.7, 43.2, 43.9, 44.4, { a0x: -.6, a1x: -.6, a0z: -.6, a1z: .6 }]]); }
      else { ry = mv ? headZ(p.vx, p.vz) : headZ(-1, -.1); ex = GE(t, [[49.2, 49.8, 50.5, 51.0, { a1x: -.9, a1z: .3 }], [50.9, 51.5, 52.6, 53.2, { a0x: -1.5, a0z: -.1 }]]); }
      fig(laban, p.x, p.z, ry, mv, t, 3.3, { ...ex, s: 1 + .007 * Math.sin(t * 1.7) }, 8.4); }
    // the children: they come into the yard one by one as each name is spoken (30:6-13, 30:19-21); Leah's four sons play by the fire at the start
    Object.keys(KID).forEach((id, i) => { const f = KID[id], [x, z] = KP[id], t0 = KT[id], a = smooth(t0, t0 + .5, t), play = i < 4 ? ON(t, 0, .6, 8, 10) : 0;
      f.group.visible = t > t0 && t < 44.8; fig(f, x, z, face(x, z, -3.5, 1.3), false, t, 5 + i, { s: a * (1 + .01 * Math.sin(t * 1.9 + i)) + .001 }, 8, play * .035 * Math.max(0, Math.sin(t * 4.2 + i * 1.7))); });
    // the herders (30:35) and the servants (30:43)
    { const h = (f, K, ph) => { const p = kp(t, K); f.group.visible = t > K[0][0] - .05 && t < 54.4; fig(f, p.x, p.z, p.mv ? headZ(p.vx, p.vz) : headZ(1, .3), p.mv, t, ph, {}, 8.4); }; h(hd1, KH1, 1.1); h(hd2, KH2, 2.2);
      [[sv1, 57.8, 0], [sv2, 58.1, 1]].forEach(([f, t0, i]) => { const a = smooth(t0, t0 + .5, t); f.group.visible = t > t0; fig(f, SV[i][0], SV[i][1], face(SV[i][0], SV[i][1], PAS[0], PAS[1] - 1.8), false, t, 4 + i, { s: a + .001 }, 8); }); }
    // ---- God remembered Rachel (30:22): a soft shaft of golden light on Rachel in the yard, never a figure
    { const lo = ON(t, 26.5, 27.9, 43.2, 44.6) * (.92 + .08 * Math.sin(t * 1.7)), lx = RS[0] + .05, lz = RS[1] + .05; racS.position.set(lx, hC(lx, lz), lz); racS.material.opacity = .26 * lo; racS.visible = lo > .004;
      racG.position.set(lx, hC(lx, lz) + .55, lz); racG.material.opacity = .12 * lo; racG.visible = lo > .004; racP.position.set(lx, hC(lx, lz) + .03, lz); racP.material.opacity = .18 * lo; racP.visible = lo > .004; racL.position.set(lx + .3, hC(lx, lz) + .9, lz + .3); racL.intensity = .8 * lo; spark.update(t, lo * 1.3, [lx, hC(lx, lz), lz]); }
  }
"""

LIGHT = r"""
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#c4c0b4', '#8a7a64', 1.0, '#ffe0a8', 2.7, [8, 5.4, 6], .45, '#ffe0b0', [-8, 5, 6], 14), Dk(12, '#b8b0b8', '#7a6a58', .95, '#ffc478', 2.8, [8, 3.8, 5], .45, '#ffd8a0', [-8, 5, 6], 14),
    Dk(21, '#a8a4c0', '#6a5a50', .9, '#ffb068', 2.5, [8, 3.0, 5], .45, '#ffd0a0', [-8, 5, 6], 14), Dk(25.6, '#6a70a8', '#2e2a40', .8, '#ff9a60', 1.7, [-9, 3.2, 6], .5, '#ffb070', [-8, 4, 8], 14),
    Dk(28, '#7a78b0', '#3a3048', .85, '#ffb070', 1.9, [-9, 3.4, 6], .55, '#ffc888', [-8, 4, 8], 14), Dk(34, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(43.8, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(45.4, '#b4b0c4', '#7a6a58', 1.0, '#ffd8a0', 2.7, [8, 5, 6], .45, '#ffe0b0', [-8, 5, 6], 14),
    Dk(50, '#b0a8bc', '#7a6a58', 1.0, '#ffc888', 2.6, [9, 3.6, 5], .45, '#ffd8a0', [-8, 4, 6], 14), Dk(55, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.6, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], 14),
    Dk(62, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 3.2, -5], .45, '#ffcf9a', [-8, 4, 6], 14)];
  const bg = [[0, ['#5a86c4', '#f6dcb0']], [14, ['#4a5488', '#f0b878']], [22, ['#3a4a88', '#f09a6a']], [27, ['#1a2458', '#9a6080']], [34, ['#141e4c', '#6a4a70']], [43.6, ['#141e4c', '#6a4a70']], [45.4, ['#4a6aa8', '#f6d4a0']], [50, ['#5a86c4', '#f6dcb0']], [56, ['#4a5488', '#f0b878']], [62, ['#4a6aa8', '#f6d8a8']]];
  return { group: g, update, light, bg, far, pl: [doorL, fireL, racL], state, jacob, rachel, laban, leah };
}
"""

out = '\n'.join([HEAD, TERRAIN, '', WALK, FACT, MID, FIRE, FIELD, WELLB, ANIM, SKY, PEOPLE, ANIMH, KEYS, UPDATE, LIGHT])
open(SRC + 'world30.js', 'w').write(out)
print('world30.js', len(out), 'bytes', out.count('\n'), 'lines')
