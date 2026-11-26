#!/usr/bin/env python3
# Builds g11/src/world36.js from world35.js: the terrain, the river, the people makers, the sky and the helpers are reused; the props, the people, the choreography, the update loop and the light are new.
SRC = '/home/claude/g11/src/'
W = open(SRC + 'world35.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)
def at(s, m, start=0):
    i = s.index(m, start); return i

# ---------------- header ----------------
i = at(W, "import * as THREE from 'three';")
HEADER = """// Episode 36: Genesis 36, the family line of Esau (that is, Edom). Esau took his wives from the women of Canaan and from Ishmael's daughter Basemath, and they bore him sons (36:2-5); his possessions were too many for him and Jacob to live together, so he took his wives, children and livestock and went to the hill country of Seir, away from his brother Jacob (36:6-8).
// The chapter then lists his descendants, who became chiefs of clans in Edom (36:9-19), the people who lived in Seir before him and their clans (36:20-30), the kings who ruled in Edom before any king ruled over the Israelites (36:31-39) and the clans of Esau by their families and the places where they lived (36:40-43).
// Cinematic interpretation: the camp on the plain, the herds, the caravan on the road, the red hill country, the tents that rise one after another on the hill, the small camp of the people who lived there before him, the walled town with its lit windows for the kings of Edom, the fires and the night. The text gives no landscape and no thoughts, and no names are spoken in the film.
// The film shows no king and no clan chief by name and does not count the kings or the clans; the wives and sons are shown without names, and the narration does not reconcile the wives' names with Genesis 26:34 and 28:9.
"""
W = HEADER + W[i:]

# ---------------- constants ----------------
a = at(W, "export const JD = [-4.7, .35];")
b = at(W, "// ---------------- terrain:")
W = W[:a] + """export const JD = [-4.7, .35];                                                          // where Jacob stood in Genesis 35 (kept for the shared stage object)
export const OAK = [-3.0, -2.0];                                                        // the great oak between the camps
export const JC = [-3.3, -4.8];                                                         // Jacob's camp, north of the road
export const SEIR = [11.2, 5.4];                                                        // the hill country of Seir: Esau's camp on the east hill
export const HOR = [5.4, 8.6];                                                          // the people who lived in Seir before him: a small camp in the valley to the south
""" + W[b:]
W = rep(W, "[BETH[0], BETH[1], .98, 1.9], [RACH[0], RACH[1], .3, 1.5], [PIL[0], PIL[1], .3, 1.0]];", "[SEIR[0], SEIR[1], .98, 3.2], [HOR[0], HOR[1], .36, 2.4], [JC[0], JC[1], .31, 2.4]];")
W = rep(W, "[[-3.6, -5.2, .9], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [8.8, 5.6, .8]]", "[[-5.4, -6.6, .9], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [10.8, 8.8, .8]]")
W = rep(W, "[[-10.0, 3.0, 2.4]", "[[-10.2, 3.6, 2.4]")
W = rep(W, "export const stage = { gAt, CITY, GX, GZ, JD, CAMPC, PATH, RV, FORD, HEAP, OAK, BETH, RACH, PIL, EAST };", "export const stage = { gAt, CITY, GX, GZ, JD, CAMPC, PATH, RV, FORD, OAK, JC, SEIR, HOR, EAST };")
# red earth in the hill country
W = rep(W, "  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));",
        "  if (y > .95) b.lerp(C3('#a8977c'), clamp((y - .8) * .6)); if (s > .3) b.lerp(C3('#857c70'), clamp((s - .26) * 2));\n  b.lerp(C3('#a8583a'), .72 * smooth(6.8, 10.6, x) * smooth(.2, .5, y + .25)); b.lerp(C3('#b0683e'), .5 * smooth(4.2, 1.6, Math.hypot(x - HOR[0], z - HOR[1])));")

# ---------------- country: trees keep-out, tents, town in its own group ----------------
W = rep(W, "|| Math.hypot(x - BETH[0], z - BETH[1]) < 2.6 || Math.hypot(x - RACH[0], z - RACH[1]) < 2.4 || Math.hypot(x - PIL[0], z - PIL[1]) < 1.6;",
        "|| Math.hypot(x - SEIR[0], z - SEIR[1]) < 3.4 || Math.hypot(x - HOR[0], z - HOR[1]) < 2.6 || Math.hypot(x - JC[0], z - JC[1]) < 2.4;")
W = rep(W, "const TENTS = [[-8.5, -.9, '#cdb48c', .5], [-7.3, 1.0, '#c2a67a', .2], [-6.1, -1.5, '#d4c29c', -.4], [-5.8, .5, '#b8946a', .1]];",
        "const TENTS = [[-8.5, -.9, '#cdb48c', .5], [-7.3, 1.0, '#c2a67a', .2], [-6.1, -1.5, '#d4c29c', -.4], [-5.8, .5, '#b8946a', .1], [-7.8, -2.7, '#c8aa80', .7], [-7.2, 2.7, '#d4c29c', -.2]];")
W = rep(W, "TENTS.forEach(([x, z, c, ry], i) => { const m = tentMesh(rng(500 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); });",
        "const ETENTS = TENTS.map(([x, z, c, ry], i) => { const m = tentMesh(rng(500 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); return m; });")
a = at(W, "  // ---- a walled town on the east bank (35:5)")
b = at(W, "  // ---- the great oak by the camp (35:4)")
TOWN = W[a:b]
TOWN = TOWN.replace("ca.add(", "townG.add(").replace("(35:5); its gate is in the west wall facing the road, and it stays shut", "(cinematic interpretation: the halls of the kings of Edom, 36:31-39); it appears at dusk")
TOWN = "  const townG = new THREE.Group(); ca.add(townG);\n" + TOWN
c = at(W, "  const far = farMountains10(rng(67)); g.add(far);")
PROPS = r"""  // ---- the great oak between the camps (a landmark)
  { const m = new THREE.Mesh(roundTreeGeo(2.5, R, ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']), lam); m.position.set(OAK[0], hC(OAK[0], OAK[1]) - .02, OAK[1]); m.castShadow = true; m.rotation.y = 1.3; ca.add(m); }
  // ---- Jacob's camp north of the road: three tents, who stays where he was
  [[-3.9, -4.7, '#cdb48c', .3], [-2.7, -5.5, '#c2a67a', -.2], [-2.4, -4.0, '#d4c29c', .5]].forEach(([x, z, c, ry], i) => { const m = tentMesh(rng(560 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); });
  // ---- Esau's camp in the hill country of Seir (36:8): his own tent in the middle, the tents of the clans around it, raised one after another
  const SA = [-2.9, -1.8, -.55, .65, 1.95], SOFF = SA.map(an => [2.4 * Math.cos(an), 2.4 * Math.sin(an)]);
  const SEIRT = [[SEIR[0], SEIR[1], '#c2a67a', 0, .8, 31.0, Math.atan2(.56, .83)], ...SOFF.map(([dx, dz], i) => [SEIR[0] + dx, SEIR[1] + dz, ['#d4c29c', '#cdb48c', '#c9a67a', '#d4c29c', '#c2a67a'][i], Math.atan2(-dx, -dz), .62, [32.6, 33.8, 35.0, 36.2, 37.4][i]])];
  const STENTS = SEIRT.map(([x, z, c, ry, sc, ta], i) => { const m = tentMesh(rng(570 + i), c, sc); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = i === 0 ? SEIRT[0][6] : ry; m.userData = { ta, sc }; ca.add(m); return m; });
  // ---- the people who lived in Seir before him (36:20-30): five darker tents in the valley
  const HORT = [[HOR[0] - .9, HOR[1] - 1.1, '#8a6a4a', .4], [HOR[0] + .8, HOR[1] - 1.3, '#7a5a3e', -.2], [HOR[0] + 1.3, HOR[1] + .3, '#8a6a4a', .8], [HOR[0] - 1.4, HOR[1] + .5, '#7a5a3e', -.5], [HOR[0] + .1, HOR[1] + 1.4, '#8a6a4a', .1]];
  const HTENTS = HORT.map(([x, z, c, ry], i) => { const m = tentMesh(rng(580 + i), c, .78); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; ca.add(m); return m; });
  // ---- fires: a small ring of stones, a glow and a hot core; lit by the time they are given
  const FIRES = [];
  const fire = (x, z, a, b, big = 1) => { const y = hC(x, z), bb = new GB(rng(600 + FIRES.length)); for (let k = 0; k < 6; k++) { const an = k * 1.047 + .3; bb.add(G.ico0, '#6a5e52', [Math.cos(an) * .13 * big, .02, Math.sin(an) * .13 * big], [.045 * big, .035 * big, .045 * big], [k, an, 0], .03); }
    const m = meshOf(bb); m.position.set(x, y, z); ca.add(m);
    const s = spriteGlow(x, y + .22 * big, z, .62 * big, 0xff9a48, 0), s2 = spriteGlow(x, y + .2 * big, z, .22 * big, 0xfff0c0, 0); g.add(s, s2); FIRES.push({ s, s2, a, b, ph: FIRES.length * 1.7 }); };
  [[SEIR[0] + .2, SEIR[1] + 2.0, 37.6, 40.6], [SEIR[0] - 1.6, SEIR[1] + .6, 38.2, 41.0], [SEIR[0] + 1.5, SEIR[1] - .5, 38.8, 41.4], [SEIR[0] + .5, SEIR[1] - 1.6, 39.4, 42.0]].forEach(([x, z, a, b]) => fire(x, z, a, b, 1.1));
  [[HOR[0] - .1, HOR[1] - .1, 40.4, 43.0], [HOR[0] + .7, HOR[1] + .8, 41.0, 43.6], [HOR[0] - .9, HOR[1] + 1.4, 41.6, 44.2]].forEach(([x, z, a, b]) => fire(x, z, a, b, 1.0));
  const seirL = new THREE.PointLight(0xffa458, 0, 6.0, 1.5); seirL.position.set(SEIR[0] - .1, hC(SEIR[0], SEIR[1]) + 1.1, SEIR[1] + .6);
  const horL = new THREE.PointLight(0xffa458, 0, 5.0, 1.5); horL.position.set(HOR[0], hC(HOR[0], HOR[1]) + 1.0, HOR[1] + .3);
  // ---- extra sheep: Esau's herd grows (36:7), and the flock that stays with Jacob
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const GOATS = [0, 1].map(i => place(mkGoat(740 + i), 0, 0, 0)), WHITE = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0)), EXTRA = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => place(makeSheep(rng(720 + i)), 0, 0, 0));
  const donkeys = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); ca.add(s.group); return s; });

"""
W = W[:a] + TOWN + PROPS + W[c:]

# ---------------- sky colours (cloud sea and its glow follow the light) ----------------
a = at(W, "  const CLOUD = [")
b = at(W, "  const colAt = ")
W = W[:a] + """  const CLOUD = [[0, '#e8c8a0'], [12, '#e8d0a8'], [22, '#e8c8a0'], [31, '#e8b898'], [37, '#e0a888'], [40, '#c89a98'], [43, '#6a6a98'], [46, '#4a4a78'], [62, '#4a4a78'], [90, '#4a4a78']];
  const CEM = [[0, '#6a5848'], [31, '#6a5848'], [37, '#5a4a52'], [40, '#4a3a58'], [43, '#3a3a58'], [46, '#22223a'], [62, '#22223a'], [90, '#22223a']];
""" + W[b:]

# ---------------- people, choreography, update, light ----------------
a = at(W, "  // ---- the people. Jacob, Rachel, Leah")
b = at(W, "  // ---- animation helpers")
c = at(W, "  // ---- who goes where.")
PEOPLE = r"""  // ---- the people. Esau and Jacob are the same models as in Genesis 33 and 35; Esau's wives, children, sons and men, and the people who lived in Seir before him, are new and unnamed
  const jacob = mkJacob(rng(87)), esau = mkEsau(rng(114));
  const WIVES = [mkMaid(rng(201), '#9a4a3a', '#c58c60', '#e0d4bc', '#c9a15a', 901), mkMaid(rng(202), '#4f7a8a', '#b98a62', '#d8cfb4', '#a87a4a', 902), mkMaid(rng(203), '#8a7a4a', '#c08a5e', '#e8dcc4', '#c8a050', 903)];
  const KIDS = [mkKid(rng(210), '#a87a5a', 910, .25, '#c87a50'), mkKid(rng(211), '#6a8a9a', 911, .27, '#c58c60'), mkKid(rng(212), '#9a6a7a', 912, .23, '#c87a50'), mkKid(rng(213), '#7a9a6a', 913, .26, '#c58c60'), mkKid(rng(214), '#c9a15a', 914, .22, '#c87a50')];
  const mkChief = (sd, top, seed, sc) => person(rng(sd), { pants: '#d9ccb0', top, skin: '#c87a50', hair: '#5a2a14', beard: '#5a2a14', sash: '#8a5a2a', seed }, sc);
  const CHIEF = [mkChief(220, '#7a3a26', 920, .46), mkChief(221, '#c9a15a', 921, .44), mkChief(222, '#6a7fa0', 922, .45), mkChief(223, '#8a5a3a', 923, .44), mkChief(224, '#5f8a5a', 924, .43)];
  const MEN = ['#6f8a62', '#9a4a42', '#8a6a4a', '#4f7a8a', '#c9a15a', '#7a5a8a'].map((c, i) => mkHerd(rng(130 + i), c, ['#a8714a', '#b98a62', '#a8714a', '#b98a62', '#c38a5c', '#a8714a'][i], 870 + i, i % 2 ? '#d8ccb0' : '#cdbd98'));
  const HORP = [mkHerd(rng(240), '#6a7a8a', '#b98a62', 940, '#5a4a38'), mkHerd(rng(241), '#7a7a5a', '#a8714a', 941, '#6a5a48'), mkHerd(rng(242), '#8a6a5a', '#c08a5e', 942, '#5a4a38'), mkMaid(rng(243), '#5a6a7a', '#b98a62', '#d8cfb4', '#8a7a4a', 943), mkMaid(rng(244), '#7a6a4a', '#c08a5e', '#e0d4bc', '#a87a4a', 944), mkKid(rng(245), '#6a7a6a', 945, .24, '#b98a62')];
  const JMEN = [mkHerd(rng(250), '#6a7a5a', '#b98a62', 950, '#d8ccb0'), mkHerd(rng(251), '#8a6a4a', '#a8714a', 951, '#cdbd98')];
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacob.group.add(mkStaff()); esau.group.add(mkStaff());
  const ALLP = [jacob, esau, ...WIVES, ...KIDS, ...CHIEF, ...MEN, ...HORP, ...JMEN]; ALLP.forEach(o => g.add(o.group));
"""
CHOREO = r"""  // ---- who goes where. Phases, each with its own cast (shots change at these times by a hard cut):
  // A 0-6.4 Esau at his camp | B 6.4-14.7 his wives and children | C 14.7-21.9 the herds of two houses on one land | D 21.9-31.6 the caravan goes east to Seir | E 31.6-40.0 the clans on the hill | F 40.0-45.8 the people of Seir before him | G 45.8-52.9 the halls of the kings | H 52.9-61.8 the clans and their places at night
  const TB = 6.4, TC = 14.7, TD = 21.9, TE = 31.6, TF = 40.0, TG = 45.8, TH = 52.9, TZ = 61.8;
  const mixA = (...o) => { const r = { a0z: -.1, a1z: .1 }; for (const x of o) for (const k in x) r[k] = (r[k] || 0) + x[k]; return r; };
  const aF = k => k > .001 ? { a0x: -.9 * k, a1x: -.9 * k, a0z: .35 * k, a1z: -.35 * k } : {};      // hands together in front
  const aO = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.95 * k, a1z: .95 * k } : {};        // hands open to the sides
  const aP = k => k > .001 ? { a0x: -1.4 * k, a1x: .2 * k, a0z: -.5 * k, a1z: .1 * k } : {};          // one arm out, pointing
  const toward = (x, z, p) => headZ(p[0] - x, p[1] - z);
  const trek = (r, v, off, dest) => { alongE(r, v, off, -3.0, 3.2); r.go(v, [4.3, 2.7 + off]).go(v, [5.3, 3.9 + off]).go(v, [8.0, 4.7 + .6 * off]).go(v, [9.8, 5.2 + .6 * off]).go(v, dest); return r; };
  const ES = [-4.5, .3];
  // Esau: stands at his camp through A-C, leads the caravan in D, stands in his own camp on the hill after that
  { const r = route(0, ES).wait(8.0).go(.5, [-4.3, .0]).wait(14.7).go(.6, [-4.5, 1.5]).wait(20.9).go(1.0, [-3.2, 1.1]); trek(r, 1.6, 0, [SEIR[0] - .2, SEIR[1] + 1.25]); r.wait(TZ);
    act(esau, r.keys, { ph: 1, sp: 7, show: () => true,
      face: (t, p) => { if (p.mv) return null; if (t < TB) return headZ(1, .15); if (t < 14.7) return toward(p.x, p.z, t < 10.8 ? [-5.3, .9] : [-5.2, -.6]); if (t < TD) return headZ(1, .5); if (t > TE) return toward(p.x, p.z, [SEIR[0] + .2, SEIR[1] + 1.2]); return null; },
      ex: t => mixA(aO(ON(t, 8.2, 8.8, 9.4, 10.0) + ON(t, 9.6, 10.2, 10.8, 11.4) + ON(t, 11.0, 11.6, 12.4, 13.0)), aP(ON(t, 15.6, 16.4, 18.6, 19.4)), aF(ON(t, 33.2, 33.8, 36.0, 36.8)), { lx: .04 * ON(t, 2, 3, 5, 6) }) }); }
  // Esau's three wives step out of the camp and stand beside him one after another (36:2-3); in D they follow him; on the hill they stand near his tent
  [[WIVES[0], [-6.6, 1.9], 8.0, [-5.3, 1.0]], [WIVES[1], [-7.0, -1.4], 9.5, [-5.2, -.6]], [WIVES[2], [-6.2, -2.2], 10.9, [-3.7, -.6]]].forEach(([f, from, ta, to], i) => {
    const r = route(0, from).wait(ta).go(.8, to).wait(21.7 + .3 * i); trek(r, 1.55, -.5 + .35 * i, [[SEIR[0] - 1.0, SEIR[1] + .5], [SEIR[0] + .6, SEIR[1] + 1.45], [SEIR[0] + 1.2, SEIR[1] + .4]][i]); r.wait(TZ);
    act(f, r.keys, { ph: 2 + i * 1.3, sp: 7, show: W_(TB - .3, TZ), face: (t, p) => { if (p.mv) return null; if (t < TD) return toward(p.x, p.z, ES); if (t > TE) return toward(p.x, p.z, [SEIR[0], SEIR[1] + 2]); return null; }, ex: t => mixA(aF(.35 * ON(t, 11.6, 12.2, 14.4, 15.0))) }); });
  // the children (36:4-5): they run out to their father from 12.2 on, play among the herds, follow the caravan, and play on the hill
  KIDS.forEach((f, i) => { const r = route(0, [-6.4 - .3 * i, 1.6 + .4 * i]).wait(12.0 + .3 * i).go(1.5, [-4.9 + .4 * i, .8 - .35 * i]).wait(15.6).go(1.1, [-5.6 + .7 * i, 2.8 - .3 * i]).go(1.1, [-4.4 + .6 * i, 3.2]).wait(21.5 + .25 * i); trek(r, 1.5, .5 - .25 * i, [SEIR[0] - 1.0 + .5 * i, SEIR[1] + .7 + .15 * (i % 2)]); r.go(.5, [SEIR[0] - .6 + .5 * i, SEIR[1] + 1.4]).go(.5, [SEIR[0] - 1.2 + .5 * i, SEIR[1] + .9]).wait(TZ);
    act(f, r.keys, { ph: 5 + i * 1.7, sp: 9, show: W_(12.0, TZ), face: (t, p) => (!p.mv && t < TD) ? toward(p.x, p.z, ES) : null, ex: t => mixA({ lx: .05 }) }); });
  // Esau's men: with the herds in C, in the caravan in D, on the hill after
  MEN.forEach((f, i) => { const r = route(0, [-8.6 + .4 * i, 2.4 + .5 * (i % 3)]).wait(14.5 + .1 * i).go(.9, [-5.8 + 1.2 * (i % 4), 3.4 + .4 * (i % 2)]).wait(21.6 + .2 * i); trek(r, 1.55, [-.9, .9, -.55, .55, -.2, .25][i], [SEIR[0] - 3.4 + 1.3 * i, SEIR[1] + 3.0 + .4 * (i % 2)]); r.wait(TZ);
    act(f, r.keys, { ph: 3 + i * 1.5, sp: 7, show: W_(TC - .2, TZ), face: (t, p) => (!p.mv && t < TD) ? headZ(1, .3) : null, ex: t => mixA(aF(.3 * ON(t, 16, 17, 19, 20))) }); });
  // the sons who became chiefs of clans (36:15-19), each in front of his tent; they come in with the caravan and stand when the tent is raised
  CHIEF.forEach((f, i) => { const T = SEIRT[i + 1], inward = [SEIR[0] + (T[0] - SEIR[0]) * .62, SEIR[1] + (T[1] - SEIR[1]) * .62];
    const r = route(0, [-8.0 + .5 * i, 2.0 - .5 * i]).wait(14.7).go(.5, [-6.5 + .5 * i, 3.0 + .2 * i]).wait(21.8 + .15 * i); trek(r, 1.5, .8 - .3 * i, inward); r.wait(TZ);
    act(f, r.keys, { ph: 1 + i * 1.9, sp: 7, show: W_(TC - .3, TZ), face: (t, p) => { if (p.mv) return null; if (t < TD) return headZ(1, .2); return toward(p.x, p.z, [T[0], T[1]]); },
      ex: t => { const w = ON(t, T[5] + .3, T[5] + .9, T[5] + 2.0, T[5] + 2.6); return mixA(aO(.7 * w), aF(.4 * ON(t, 46, 47, 62, 63))); } }); });
  // Jacob stays where he was: among his flock in C, and by the road watching the caravan go in D (36:6-7); he is not shown after that
  { const r = route(TC - .2, [-2.9, -3.1]).wait(18.6).go(.5, [-3.0, -2.5]).wait(20.8).go(.7, [-3.6, -.5]).wait(TE);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(TC - .2, TE), face: (t, p) => { if (p.mv) return null; if (t < 20.8) return toward(p.x, p.z, [-4.6, 1.0]); return headZ(1, .1); }, ex: t => mixA(aF(.25 * ON(t, 16, 17, 20, 21))) }); }
  JMEN.forEach((f, i) => { const r = route(TC - .2, [-4.6 + 1.1 * i, -4.0 - .6 * i]).wait(17 + i).go(.5, [-4.0 + 1.0 * i, -3.2 - .4 * i]).wait(TE);
    act(f, r.keys, { ph: 2 + i * 2.1, sp: 6, show: W_(TC - .2, TE), face: (t, p) => !p.mv ? headZ(1, -.4 + .8 * i) : null }); });
  // the people who lived in Seir before him: standing at their fires (36:20-30)
  { const P = HOR; [[HORP[0], [P[0] + .4, P[1] - .25], 0], [HORP[1], [P[0] - .6, P[1] + .2], 1], [HORP[2], [P[0] + 1.1, P[1] + 1.2], 2], [HORP[3], [P[0] + .1, P[1] + .6], 3], [HORP[4], [P[0] - 1.1, P[1] + 1.0], 4], [HORP[5], [P[0] + .5, P[1] + .3], 5]].forEach(([f, p, i]) => {
      act(f, route(0, p).keys, { ph: 2 + i * 1.6, sp: 5, show: W_(TF - .2, TZ), face: () => toward(p[0], p[1], [P[0] - .1, P[1] - .1]) + (i % 2 ? .35 : -.35), ex: t => mixA(aF(.3 * ON(t, 42, 43, 44, 45))) }); }); }

  // the flocks: Jacob's five stay near his camp; Esau's nine sheep, two goats and two donkeys fill the land in C and follow the caravan
  const JFLOCK = WHITE, EHERD = [...EXTRA, ...GOATS, ...donkeys], ANIM = [...JFLOCK, ...EHERD], AK = new Map(), AV = new Map();
  JFLOCK.forEach((a, i) => { const p = [[-5.0, -3.9], [-4.4, -5.6], [-2.2, -6.5], [-5.6, -5.0], [-1.9, -3.0]][i]; AK.set(a, route(0, p).wait(18).go(.15, [p[0] + .3, p[1] + .2]).wait(90).keys); AV.set(a, t => t >= TC - .5 && t < TE); });
  EHERD.forEach((a, i) => { const p0 = [-8.4 + 1.0 * (i % 5), 2.6 + 1.0 * Math.floor(i / 5) + .3 * (i % 3)], p1 = [-6.4 + .85 * (i % 6), 3.4 + .6 * Math.floor(i / 6)], off = ((i % 5) - 2) * .18 + .55;
    const r = route(0, p0).wait(14.7 + .12 * i).go(.45, p1).wait(21.7 + .15 * i); trek(r, 1.5, off, [SEIR[0] - 3.2 + .8 * (i % 6) + .3 * Math.floor(i / 6), SEIR[1] + 3.3 - .4 * Math.floor(i / 6) + .2 * (i % 3)]); r.wait(TZ); AK.set(a, r.keys);
    AV.set(a, i < 4 ? (t => true) : (t => t >= 14.9 + .4 * (i - 3))); });
"""
UPDATE = r"""
  function update(t, camera, sid) {
    const cam = camera && camera.position;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = ON(t, 41.0, 45.0, 90, 91), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    // the low sun behind the subject (it sets in E and F)
    { const k = (.42 + .0) * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]);
    // ---- the river: day colours, darker at night, ripples drifting south
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the town of the kings: it stands from G on, torches at its gate and lit windows one after another (36:31-39)
    { const on = t >= TG - .6; townG.visible = on; const tk = smooth(TG - .2, TG + 1.2, t);
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = smooth(TG + .4 + 5.2 * w.ord, TG + 1.4 + 5.2 * w.ord, t); w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    // ---- fires
    FIRES.forEach(f => { const k = f.b > f.a ? smooth(f.a, f.b, t) : 0; f.s.material.opacity = .8 * k * (fl + .05 * Math.sin(t * 9 + f.ph)); f.s2.material.opacity = .9 * k * fl; f.s.visible = f.s2.visible = k > .01; });
    seirL.intensity = 2.0 * smooth(37.6, 41.6, t) * fl; horL.intensity = 1.7 * smooth(40.4, 43.6, t) * fl;
    // ---- what stands where, by time
    { ETENTS.forEach(m => { m.visible = t < 28.6; });
      STENTS.forEach(m => { const k = smooth(m.userData.ta, m.userData.ta + .9, t); m.visible = k > .01; m.scale.setScalar(Math.max(.01, k)); });
      HTENTS.forEach(m => { m.visible = t >= TF - 1.5; }); }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp); });
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = AV.get(a)(t); a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      const big = i >= 5 + 9 + 2; if (p.mv) walkLegs(a.legs, t + i * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); });
    { const k = kp(t, esauKeys); dust.update(t, 0, [0, 0, 0]); dustR.update(t, .5 * ON(t, 21.8, 23.0, 29.0, 30.6), [k.x, hC(k.x, k.z) + .05, k.z]); }
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(12, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(22, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(31, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(36.5, '#a89ab8', '#5a4448', .95, '#ff9458', 2.4, [10, 1.6, -4], .5, '#ffb480', FD, 14), Dk(40.0, '#8a86b0', '#4a3a40', .9, '#ff8a50', 2.0, [10, 1.2, -4], .5, '#ffa878', FD, 14),
    Dk(43.5, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(62, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [12, ['#5a86c4', '#f6d09a']], [22, ['#5a86c4', '#f6c890']], [31, ['#5a86c4', '#f6c890']], [36.5, ['#5a74b0', '#f4a070']], [40, ['#4a5a9a', '#f0905a']], [43.5, ['#0e1636', '#2a3466']], [62, ['#0e1636', '#2a3466']]];
  return { group: g, update, light, bg, far, pl: [seirL, horL, ...torchL, gateL, campL], state, jacob, esau, CHIEF, WIVES };
}
"""
HELP = W[b:c]
# the animation helpers are kept as they are; Esau's keys are needed by the update loop for the dust
HELP = HELP
out = W[:a] + PEOPLE + HELP + CHOREO.replace("{ const r = route(0, ES).wait(8.0)", "const esauKeys = (() => { const r = route(0, ES).wait(8.0)") .replace("r.wait(TZ);\n    act(esau, r.keys,", "r.wait(TZ); return r.keys; })();\n  {\n    act(esau, esauKeys,") + UPDATE
open(SRC + 'world36.js', 'w').write(out)
print('world36.js', len(out), 'bytes', out.count('\n'), 'lines')
