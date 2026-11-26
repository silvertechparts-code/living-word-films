#!/usr/bin/env python3
# Builds src/world34.js (Genesis 34) from src/world33.js: keeps the country (terrain, trees, reeds, river, tents, sky helpers, people makers, animals)
# and writes the walled city of Shechem on the east bank, Dinah's visit, Jacob's silence, Hamor's embassy, the men at the gate, Simeon and Levi, the captives and the camp.
SRC = '/home/claude/g11/src/'
L = open(SRC + 'world33.js').read().split('\n')
def R(a, b): return '\n'.join(L[a - 1:b])
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:90])
    return s.replace(a, b)
out = []

out.append(r"""// Episode 34: Genesis 34. Dinah, the daughter Leah bore to Jacob, goes out to visit the women of the land (34:1); Shechem son of Hamor the Hivite, the prince of the region, seizes her and lies with her by force; he is drawn to her and wants her for his wife (34:2-4).
// Jacob hears that his daughter has been defiled and keeps silent until his sons come in from the field; the men are grieved and very angry (34:5-7); Hamor comes out to speak with Jacob and asks Dinah for his son (34:6, 8); Jacob's sons answer deceitfully, saying they cannot give their sister to an uncircumcised man, and that every male of the city must be circumcised (34:13-17).
// Hamor and Shechem speak to the men at the gate of the city and the men agree and are circumcised (34:18-24). On the third day, while they are in pain, Simeon and Levi take their swords, come upon the city unawares and kill every male; they take Dinah out of Shechem's house (34:25-26).
// The other sons come upon the slain and plunder the city, and take captive all the women and children (34:27-29). Jacob says to Simeon and Levi "You have brought trouble on me"; they answer with a question about their sister (34:30-31).
// Cinematic interpretation: the walled city on the east bank, the road across the ford, the two friends, the women who meet them at the gate, the way the sons come in from the field, the men gathering and sitting before the gate, the dusk, the night and the dawn, the torches and lit windows,
// the backlit silhouettes at the gate, how Dinah is led out and walks, the line of captives on the road, and Jacob's posture. The text gives no landscape and no thoughts. What happens to Dinah in Shechem's house is not shown at all; the killing is not shown at all: the film shows only the empty road, the gate and the figures who walk in and out.
// The film leaves out Shechem's affection and his plea (34:3, 11-12), Hamor's offer of intermarriage and trade (34:8-10, 21-23), the killing of Hamor and Shechem (34:26), the flocks and wealth taken (34:28-29) and Jacob's fear of the neighbouring peoples (34:30 in part). Narration shortens the brothers' answer in 34:31.""")
out.append(R(7, 13).replace("import { mkIslet, cloudSea, farMountains10, headZ, headX, C3, rimf, meshOf, tentMesh } from './world10.js';", "import { mkIslet, cloudSea, farMountains10, headZ, headX, C3, rimf, meshOf, tentMesh, houseBlock } from './world10.js';"))
out.append(r"""
export const RIC = 15, RW = .85, WL = .2;
export const RV = z => .55 * Math.sin(z * .32 + .6);                                   // the river runs north to south; this is its centre line
export const FORD = [.45, 1.3], CAMPC = [-7.0, -.2], EAST = [4.4, 1.6];                // the ford; the camp at the west end of the road; the east bank
export const CITY = [8.3, .2], CHD = 2.6, CHW = 3.0, GX = CITY[0] - CHD, GZ = CITY[1];   // Shechem: a walled city on the east bank, its gate in the west wall at (GX, GZ)
export const JD = [-4.6, .45];                                                          // where Jacob stands before his tent
export const EV = { a1: .6, a2: 5.4, b1: 11.8, b2: 19.4, c1: 24.3, c2: 34.3, d1: 37.3, e1: 48.1 };
""")
out.append('')
out.append(R(25, 26))
out.append("const FLATS = [[CAMPC[0], CAMPC[1], .31, 4.8], [CITY[0], CITY[1], .33, 4.9], [EAST[0] + .6, EAST[1] - .6, .32, 3.2]];")
out.append(R(28, 33))
out.append("export const PATH = [[-6.0, .8], [-3.2, 1.2], [-1.0, 1.15], [.45, 1.2], [2.2, 1.0], [4.0, .6], [5.4, .25]];")
out.append('')
out.append(R(36, 37))
_g = R(38, 44)
_g = rep(_g, "  b.lerp(C3('#a8906a'), .55 * smooth(3.6, 1.4, Math.hypot(x - CAMPC[0], z - CAMPC[1])));",
 "  b.lerp(C3('#a8906a'), .55 * smooth(3.6, 1.4, Math.hypot(x - CAMPC[0], z - CAMPC[1]))); b.lerp(C3('#c8b078'), .65 * smooth(3.9, 2.7, Math.hypot(x - CITY[0], z - CITY[1])));")
out.append(_g)
out.append(r"""const gAt = hC;
export const stage = { gAt, CITY, GX, GZ, JD, CAMPC, PATH, RV, FORD };
""")
out.append(R(48, 53))
out.append('')
out.append(R(55, 56))
out.append(R(60, 67))
out.append(r"""
export function makeCountry() {""")
out.append(R(72, 72).replace('rng(3333)', 'rng(3434)'))
out.append(R(73, 79))
k = R(80, 80)
k = rep(k, "Math.hypot(x - ALT[0], z - ALT[1]) < 2.0 || ", "")
k = rep(k, "(x > 2.2 && x < 10.8 && z > -4.8 && z < 4.2)", "(x > 4.6 && x < 11.8 && z > -3.8 && z < 4.4)")
out.append(k)
out.append(R(81, 92))
out.append(R(93, 96))
c = R(97, 100)
c = rep(c, "ca.add(m); m.userData.s = 1; tents.push(m); });", "ca.add(m); });")
c = rep(c, "  const tents = [];\n", "")
out.append(c)
out.append(r"""
  // ---- Shechem (34:2): a walled city on the east bank; the gate is in the west wall facing the road; houses inside; torches at the gate and lit windows come on at dusk
  { const b = new GB(rng(341)), H = .86, T = .2, CX = CITY[0], CZ = CITY[1], x0 = CX - CHD, x1 = CX + CHD, z0 = CZ - CHW, z1 = CZ + CHW, gw = .42, y_ = (x, z) => hC(x, z);
    const wall = (x, z, w, d) => { b.box('#c2ae86', [x, y_(x, z) + H / 2, z], [w, H, d], [0, 0, 0], .04); const n = Math.floor(Math.max(w, d) / .34); for (let k = 0; k < n; k++) { const u = (k + .5) / n - .5; b.box('#b09c74', [x + (w > d ? u * w : 0), y_(x, z) + H + .07, z + (w > d ? 0 : u * d)], [w > d ? .16 : T * 1.2, .14, w > d ? T * 1.2 : .16], [0, 0, 0], .03); } };
    wall(CX, z0, CHD * 2, T); wall(CX, z1, CHD * 2, T); wall(x1, CZ, T, CHW * 2);
    wall(x0, (z0 + CZ - gw) / 2, T, (CZ - gw) - z0); wall(x0, (z1 + CZ + gw) / 2, T, z1 - (CZ + gw));
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [CX, z0], [CX, z1]]) { b.box('#cbb78e', [x, y_(x, z) + .7, z], [.5, 1.4, .5], [0, 0, 0], .04); b.box('#b09c74', [x, y_(x, z) + 1.46, z], [.58, .12, .58], [0, 0, 0], .03); }
    for (const s of [-1, 1]) { const z = CZ + s * (gw + .27); b.box('#cbb78e', [x0, y_(x0, z) + .72, z], [.54, 1.44, .5], [0, 0, 0], .04); b.box('#b09c74', [x0, y_(x0, z) + 1.5, z], [.62, .12, .58], [0, 0, 0], .03); }
    b.box('#b8a47c', [x0, y_(x0, CZ) + .76, CZ], [.3, .2, gw * 2 + .08], [0, 0, 0], .03); b.box('#9a8664', [x0, y_(x0, CZ) + .87, CZ], [.34, .05, gw * 2 + .16], [0, 0, 0], .02);
    b.box('#2a1c10', [x0 + .55, y_(x0, CZ) + .01, CZ], [1.1, .02, gw * 2], [0, 0, 0], .0);
    ca.add(meshOf(b)); }
  ca.add(meshOf(houseBlock(rng(342), CITY[0] + .5, CITY[1] - 1.9, 3, 2, .62, hC, 0)), meshOf(houseBlock(rng(343), CITY[0] + .5, CITY[1] + 1.9, 3, 2, .62, hC, 0)), meshOf(houseBlock(rng(344), CITY[0] + 1.75, CITY[1], 1, 3, .66, hC, 0)));
  { const b = new GB(rng(345)); b.box('#a08a64', [CITY[0] - .2, hC(CITY[0], CITY[1]) + .1, CITY[1] + .02], [.34, .2, .34], [0, 0, 0], .03); b.box('#3a2a1c', [CITY[0] - .2, hC(CITY[0], CITY[1]) + .21, CITY[1] + .02], [.2, .02, .2], [0, 0, 0], .01); ca.add(meshOf(b)); }
  const TX = GX - .34, torchPos = [[TX, GZ - .69], [TX, GZ + .69]];                                        // two torches on the faces of the gate towers
  { const b = new GB(rng(346)); for (const [x, z] of torchPos) b.box('#5a3a22', [x, hC(x, z) + .72, z], [.03, .3, .03], [0, 0, 0], .01); ca.add(meshOf(b)); }
  const torchG = torchPos.map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .92, z, .3, 0xffa850, 0), s2 = spriteGlow(x, hC(x, z) + .9, z, .12, 0xfff0c0, 0); g.add(s, s2); return [s, s2]; });
  const torchL = torchPos.map(([x, z]) => { const l = new THREE.PointLight(0xffa050, 0, 5.2, 1.6); l.position.set(x - .1, hC(x, z) + 1.0, z); return l; });
  const gateL = new THREE.PointLight(0xff9a48, 0, 4.8, 1.5); gateL.position.set(GX + 1.0, hC(GX, GZ) + .55, GZ);
  const gateG = spriteGlow(GX + .55, hC(GX, GZ) + .36, GZ, 1.0, 0xff9a50, 0); g.add(gateG);
  const WINS = []; { const Rr = rng(347), pts = []; for (let i = 0; i < 200 && pts.length < 24; i++) { const x = CITY[0] + .2 + (Rr() - .5) * 4.2, z = CITY[1] + (Rr() - .5) * 5.2; if (Math.abs(z - CITY[1]) < .62 && x < CITY[0] + 1.2) continue; if (Math.hypot(x - CITY[0], z - CITY[1]) < .6) continue; if (pts.some(p => Math.hypot(p[0] - x, p[1] - z) < .42)) continue; pts.push([x, z]); }
    pts.forEach(([x, z], i) => { const s = spriteGlow(x, hC(x, z) + .38 + ((i * 7) % 5) * .06, z, .3, 0xffc070, 0); g.add(s); WINS.push({ s, ph: i * 1.9, ord: Rr() }); }); }
  const campL = new THREE.PointLight(0xffa860, 0, 5.5, 1.5); campL.position.set(-3.7, hC(-3.7, .6) + 1.0, .7);
""")
_a = R(115, 119)
_a = rep(_a, "// ---- the animals sent ahead (32:13-21): 4 goats, 5 dark lambs, 7 white sheep, 2 camels and 2 donkeys, six droves with their herdsmen", "// ---- the animals the sons drive out of the city (34:28): sheep, goats and donkeys")
_a = rep(_a, "const GOATS = [0, 1, 2, 3].map(i => place(mkGoat(740 + i), 0, 0, 0)), DARK = [0, 1, 2, 3, 4].map(i => place(mkDark(720 + i), 0, 0, 0)), WHITE = [0, 1, 2, 3, 4, 5, 6].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0));", "const GOATS = [0, 1].map(i => place(mkGoat(740 + i), 0, 0, 0)), WHITE = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0));")
_a = rep(_a, "  const camels = [0, 1].map(i => { const s = makeCamel(rng(800 + i)); ca.add(s.group); return s; }), donkeys", "  const donkeys")
out.append(_a)
_b = R(120, 127)
_b = rep(_b, "[[0, '#e8c8a0'], [44, '#e8c0a0'], [58, '#e8a888'], [90, '#e8a888']]", "[[0, '#e8c8a0'], [34, '#e8c0a0'], [39.5, '#8a86a8'], [42, '#4a4a78'], [46, '#4a4a78'], [49, '#e0a898'], [54, '#e8b898'], [60, '#e8a888'], [90, '#e8a888']]")
_b = rep(_b, "[[0, '#6a5848'], [44, '#6a5848'], [58, '#6a4a3e'], [90, '#6a4a3e']]", "[[0, '#6a5848'], [34, '#6a5848'], [39.5, '#3a3a58'], [42, '#22223a'], [46, '#22223a'], [49, '#5a4a52'], [54, '#6a5848'], [60, '#6a4a3e'], [90, '#6a4a3e']]")
out.append(_b)
out.append(R(129, 130))
out.append(r"""  const bgAtW = t => { let i = 1; while (i < bg.length - 1 && t > bg[i][0]) i++; const [ta, A] = bg[i - 1], [tb, B] = bg[i], k = ease.inOutSine(seg(t, ta, tb)); return mx(rgbOf(A[1]), rgbOf(B[1]), k); };

  // ---- the people. Jacob and Jacob's sons are the same models as in Genesis 33 (older now, with beards); Dinah, her friends, Shechem, Hamor and the men of the city are new
  const jacob = mkJacob(rng(87));
  const dinah = person(rng(120), { pants: '#e6dac0', top: '#b8485a', skin: '#c58c60', hair: '#2a1a10', long: true, cloth: '#e8dcc8', mantle: '#cdbba0', sash: '#d0a040', seed: 850 }, .41);
  const fr1 = mkMaid(rng(121), '#7a9a6a', '#b8825a', '#d8cfb4', '#a87a4a', 851), fr2 = mkMaid(rng(122), '#c09a58', '#c08a5e', '#e0d4bc', '#8a7a4a', 852);
  const cw1 = mkMaid(rng(123), '#5a7aa8', '#b98a62', '#e8dcc4', '#c8a050', 853), cw2 = mkMaid(rng(124), '#a85a6a', '#c38a5c', '#dcd0b8', '#8a7a4a', 854);
  const shechem = person(rng(125), { pants: '#e8dcc0', top: '#2a4a8a', skin: '#c58c60', hair: '#2a1a10', cloth: '#efe4cc', mantle: '#7a2a3a', sash: '#d0a040', seed: 860 }, .47);
  const hamor = person(rng(126), { pants: '#e0d0b0', top: '#5a2a5a', skin: '#b98a62', hair: '#8a8a82', beard: '#a8a8a0', mantle: '#2a4a6a', cloth: '#e8dcc0', sash: '#d0a040', seed: 861 }, .5);
  const rt1 = mkHerd(rng(127), '#2a4a7a', '#a8714a', 862, '#d8ccb0'), rt2 = mkHerd(rng(128), '#7a3a4a', '#b98a62', 863, '#d8ccb0');
  const mkSon = (sd, top, seed, sc, beard) => person(rng(sd), { pants: '#d9ccb0', top, skin: '#c58c60', hair: '#2a1a10', beard, sash: '#8a5a2a', seed }, sc);
  const SON = { reu: mkSon(93, '#6a7fa0', 930, .44, '#2a1a10'), sim: mkSon(94, '#a8683a', 931, .44, '#2a1a10'), lev: mkSon(95, '#5f8a5a', 932, .43, '#2a1a10'), jud: mkSon(96, '#c9a15a', 933, .42, '#3a2616'), dan: mkSon(97, '#7a4a3a', 934, .41), gad: mkSon(99, '#a2564e', 936, .41), iss: mkSon(101, '#6a5a8a', 938, .4) };
  const mC = ['#6f8a62', '#9a4a42', '#8a6a4a', '#4f7a8a', '#c9a15a', '#7a5a8a', '#a2564e', '#5a7a5a'], mS = ['#a8714a', '#b98a62', '#a8714a', '#b98a62', '#c38a5c', '#a8714a', '#b98a62', '#c38a5c'];
  const MEN = mC.map((c, i) => mkHerd(rng(130 + i), c, mS[i], 870 + i, i % 2 ? '#d8ccb0' : '#cdbd98'));
  const CAPW = [mkMaid(rng(150), '#8a6a9a', '#b8825a', '#d8cfb4', '#a87a4a', 890), mkMaid(rng(151), '#5a8a7a', '#c08a5e', '#e0d4bc', '#8a7a4a', 891), mkMaid(rng(152), '#b87a5a', '#b98a62', '#dcd0b8', '#c8a050', 892), mkMaid(rng(153), '#6a7aa0', '#c38a5c', '#e8dcc4', '#8a7a4a', 893)];
  const CAPK = [mkKid(rng(154), '#a87a5a', 894, .25), mkKid(rng(155), '#6a8a9a', 895, .27), mkKid(rng(156), '#9a6a7a', 896, .23), mkKid(rng(157), '#7a9a6a', 897, .26)];
  const addSword = f => { const b = new GB(rng(38)); b.box('#b4b6c2', [.3, .62, .1], [.035, .62, .03], [0, 0, -.2], .01); b.box('#5a3a22', [.275, .3, .1], [.05, .08, .05], [0, 0, -.2], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; f.group.add(m); return m; };
  const swS = addSword(SON.sim), swL = addSword(SON.lev); swS.visible = swL.visible = false;
""")
out.append(R(142, 143))
out.append(r"""  const ALLP = [jacob, dinah, fr1, fr2, cw1, cw2, shechem, hamor, rt1, rt2, ...Object.values(SON), ...MEN, ...CAPW, ...CAPK]; ALLP.forEach(o => g.add(o.group));
""")
out.append(R(146, 154))
out.append(R(156, 156))
out.append(r"""
  // ---- who goes where (times follow the narration: a1 0.6, a2 5.4, b1 11.8, b2 19.4, c1 24.3, c2 34.3, d1 37.3, e1 48.1)
  const PW = [...PATH].reverse();                                   // the road, walked from the gate west to the camp
  const along = (r, v, off, from, to) => { for (const q of PW) { if (q[0] > from + .01 || q[0] < to - .01) continue; r.go(v, [q[0], q[1] + off]); } return r; };      // follow the road westward between x = from and x = to
  const alongE = (r, v, off, from, to) => { for (const q of PATH) { if (q[0] < from - .01 || q[0] > to + .01) continue; r.go(v, [q[0], q[1] + off]); } return r; };  // and eastward
  const hdgAt = (keys, t) => { let last = null, first = null; for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (Math.hypot(b[1] - a[1], b[2] - a[2]) <= .01) continue; const d = [b[1] - a[1], b[2] - a[2]]; if (!first) first = d; if (a[0] <= t) last = d; else break; } const d = last || first; return d ? headZ(d[0], d[1]) : 0; };
  const ACT = [];
  const act = (f, keys, o = {}) => { const a = { f, keys, ph: o.ph ?? ACT.length * 1.3, sp: o.sp ?? 7, face: o.face || null, show: o.show || (() => true), ex: o.ex || null }; ACT.push(a); return a; };
  const W_ = (a, b) => t => t >= a && t < b;

  // Dinah and her two friends wade the ford and walk to the gate; two women of the city come out to meet them; they all go in together (34:1). From then on the camera never sees what is inside the city.
  act(dinah, route(0, [1.0, 1.12]).go(.95, [2.2, 1.0]).go(.95, [4.0, .66]).go(.95, [4.65, .36]).wait(5.7).go(.9, [5.7, .25]).go(.9, [6.9, .25]).keys, { ph: 1, show: W_(0, 7.6), face: (t, p) => (!p.mv && t > 4.3 && t < 5.8) ? headZ(1, .3) : null });
  act(fr1, route(0, [.45, 1.28]).go(.95, [2.0, 1.18]).go(.95, [3.7, .85]).go(.95, [4.35, .72]).wait(5.8).go(.9, [5.7, .52]).go(.9, [6.9, .5]).keys, { ph: 2.4, show: W_(0, 7.8), face: (t, p) => (!p.mv && t > 4.3 && t < 5.9) ? headZ(1, -.2) : null });
  act(fr2, route(0, [.55, .95]).go(.95, [2.1, .8]).go(.95, [3.7, .4]).go(.95, [4.3, .05]).wait(5.9).go(.9, [5.7, 0]).go(.9, [6.9, -.05]).keys, { ph: 3.7, show: W_(0, 8.0), face: (t, p) => (!p.mv && t > 4.3 && t < 6.0) ? headZ(1, .2) : null });
  act(cw1, route(0, [6.4, .6]).wait(2.8).go(.9, [5.1, .54]).wait(5.9).go(.9, [6.9, .62]).keys, { ph: 5.1, show: W_(0, 8.2), face: (t, p) => (!p.mv && t > 3.8 && t < 6) ? headZ(-1, -.15) : null });
  act(cw2, route(0, [6.4, -.2]).wait(3.0).go(.9, [5.0, .0]).wait(6.0).go(.9, [6.9, -.15]).keys, { ph: 6.3, show: W_(0, 8.4), face: (t, p) => (!p.mv && t > 3.9 && t < 6.1) ? headZ(-1, .2) : null });

  // Jacob stands before his tent: he hears and keeps silent, hands together, head bowed (34:5); his sons come; at 53 his daughter comes home and he puts his hands to his head
  act(jacob, route(0, JD).keys, { ph: 6.2, sp: 5.2, face: () => headZ(1, .12), ex: t => { const si = ON(t, 10.8, 12.0, 17.0, 18.0), hd = ON(t, 53.4, 54.2, 90, 91);
    return { a0x: -.55 * si - 2.3 * hd, a1x: -.55 * si - 2.3 * hd, a0z: .35 * si + .5 * hd - .1, a1z: -.35 * si - .5 * hd + .1, lx: .15 * si + .2 * hd }; } });

  // the sons come in from the field (34:7), stand in a line before Jacob, and are there while Hamor speaks (34:6-17)
  const SLN = { reu: 0, sim: 1, lev: 2, jud: 3, dan: 4, gad: 5, iss: 6 }, SSL = i => [(i % 2 ? -3.3 : -3.72), -.6 + .3 * i];
  Object.entries(SON).forEach(([id, f]) => { const i = SLN[id], sl = SSL(i), st = [-.6 + .32 * i, -6.2 - .2 * (i % 3)], arms = t => { const k = ON(t, 24.6, 25.6, 32.6, 33.6); return { a0x: -.85 * k, a1x: -.85 * k, a0z: .55 * k - .1 * (1 - k), a1z: -.55 * k + .1 * (1 - k) }; };
    const r = route(0, st).wait(12.8 + .12 * i).go(1.5, sl);
    if (id === 'sim' || id === 'lev') { const lv = id === 'lev', o = lv ? .22 : -.1, ZZ = GZ + (lv ? .16 : -.16);
      r.wait(37.2 + (lv ? .2 : 0)); alongE(r, 1.35, o, sl[0], 5.0); r.go(1.35, [6.1, ZZ]).go(1.2, [6.9, ZZ]);
      act(f, r.keys, { ph: 2 + i * .9, show: W_(12.0, 45.2), face: (t, p) => (!p.mv && t < 36.5) ? headZ(1, 0) : null, ex: t => ({ ...arms(t), a0x: arms(t).a0x - .5 * ON(t, 38.6, 39.4, 46, 47) , lx: .04 * ON(t, 42, 43, 45, 46) }) }); }
    else { r.wait(33.6 + .1 * i).go(1.4, [-2.6 + .2 * i, -3.6 - .3 * i]); act(f, r.keys, { ph: 2 + i * .9, show: W_(12.0, 35.4 + .1 * i), face: (t, p) => (!p.mv && t < 33.5) ? headZ(1, 0) : null, ex: arms }); } });

  // Hamor and Shechem come out of the gate to Jacob (34:6, 8, 11); Hamor opens his hands, Shechem bows; they go back to the men at the gate (34:20) and in at dusk
  [[hamor, 0, 0, [-2.05, .62], 0, 'h'], [shechem, .42, .2, [-2.15, 1.08], .12, 's'], [rt1, -.32, .35, [-1.7, .22], .22, 'r'], [rt2, .78, .5, [-1.75, 1.4], .3, 'r']].forEach(([f, off, d, M, dl, kind], i) => {
    const IN2 = [[4.55, .42], [4.85, .02], [4.9, .95], [4.45, 1.05]][i], r = route(0, [7.0, GZ + off * .6]).wait(17.5 + d).go(1.3, [5.4, .25 + off]);
    along(r, 1.3, off, 5.4, -1.0); r.go(1.3, M).wait(31.3 + dl).go(1.7, [-1.0, 1.15 + off]); alongE(r, 1.7, off, -1.0, 4.0); r.go(1.7, IN2).wait(38.3 + dl).go(1.2, [6.1, GZ + off * .5]).go(1.2, [7.0, GZ + off * .5]);
    act(f, r.keys, { ph: 1.1 + i * 1.7, sp: 7, show: W_(17.4, 41.6), face: (t, p) => { if (p.mv) return null; if (t > 23 && t < 32) return headZ(-1, 0); if (t > 34 && t < 38.6) return headZ(-1, .1 * (i - 1)); return null; },
      ex: t => { const s1 = ON(t, 24.6, 25.4, 31.0, 31.6), s2 = ON(t, 35.6, 36.2, 38.0, 38.6); if (kind === 'h') return { a0x: -.8 * s1 - .7 * s2, a1x: -.8 * s1 - .7 * s2, a0z: -.45 * s1 - .4 * s2, a1z: .45 * s1 + .4 * s2 }; if (kind === 's') return { lx: .18 * s1, a0x: -.5 * s2, a1x: -.5 * s2 }; return {}; } }); });

  // the men of the city gather before the gate, agree (34:24), sit in pain on the third day (34:25) and limp in as the light fails
  const RING = i => { const a = (20 + 45 * i) * Math.PI / 180; return [4.6 + .95 * Math.cos(a), .42 + .95 * Math.sin(a)]; };
  MEN.forEach((f, i) => { const rg = RING(i), r = route(0, [6.5 + .15 * (i % 3), GZ - .95 + .27 * i]).wait(32.6 + .15 * i).go(1.2, rg).wait(39.5 + .28 * i).go(.8, [6.0, GZ - .5 + .14 * i]).go(.8, [7.0, GZ - .5 + .14 * i]);
    act(f, r.keys, { ph: 3 + i * 1.1, sp: 6, show: W_(32.5, 43.0), face: (t, p) => (!p.mv && t < 39.3) ? headZ(4.6 - rg[0], .42 - rg[1]) : null,
      ex: t => { const sit = ON(t, 38.2 + .08 * i, 39.0 + .08 * i, 39.6 + .28 * i, 40.2 + .28 * i), hunch = ON(t, 39.6 + .28 * i, 40.2 + .28 * i, 43, 44), nod = ON(t, 35.4, 35.9, 37.4, 38.0) * Math.sin(t * 5 + i * 1.7); return { s: 1 - .3 * sit, lx: .1 * sit + .26 * hunch + .06 * nod }; } }); });

  // Simeon and Levi come into the gate at night (34:25) and come out again with Dinah between them (34:26)
  // Dinah is led out and walks home between her brothers, her arms around herself (34:26)
  { const r = route(0, [7.6, GZ]).wait(45.2).go(1.4, [5.95, GZ]); along(r, 1.35, 0, 5.4, -3.4); r.go(.9, [-4.0, 1.0]);
    act(dinah, r.keys, { ph: 1.3, sp: 6, show: t => t >= 45.2, face: (t, p) => (!p.mv && t > 55) ? headZ(1, -.1) : null, ex: t => { const h = ON(t, 46.0, 46.8, 90, 91), sit = smooth(56.6, 57.4, t); return { a0x: -1.0 * h, a1x: -1.0 * h, a0z: .6 * h - .1 * (1 - h), a1z: -.6 * h + .1 * (1 - h), lx: .12 * h, s: 1 - .3 * sit }; } }); }
  [['sim', -.32, [-3.5, .9]], ['lev', .32, [-3.4, -.1]]].forEach(([id, off, fin], i) => { const f = SON[id], r = route(0, [7.6, GZ + off * .5]).wait(45.2).go(1.4, [5.95, GZ + off]); along(r, 1.35, off, 5.4, -3.4); r.go(.9, fin);
    act(f, r.keys, { ph: 2 + i * 1.6, sp: 7, show: t => t >= 45.2, face: (t, p) => (!p.mv && t > 55) ? headZ(1, 0) : null, ex: t => { const k = ON(t, 54.8, 55.6, 90, 91); return { a0x: -.4 * k, a1x: -.4 * k }; } }); });

  // the other sons, the women and children of the city, and the animals come out of the gate and walk west along the road (34:27-29)
  const COL = []; { const cap = [CAPW[0], SON.gad, CAPK[0], CAPW[1], CAPK[1], SON.dan, CAPW[2], CAPK[2], SON.jud, CAPW[3], CAPK[3], SON.iss, SON.reu];
    cap.forEach((f, i) => { const isS = Object.values(SON).includes(f), off = isS ? (i % 2 ? .38 : -.38) : ((i % 3) - 1) * .13, r = route(0, [7.4 + .2 * (i % 3), GZ + ((i % 4) - 1.5) * .22]).wait(48.3 + .26 * i).go(1.1, [5.4, .25 + off]); along(r, 1.05, off, 5.4, -1.2); r.go(1.0, [-2.3 + .32 * (i % 5), -.9 - .34 * Math.floor(i / 5)]);
      act(f, r.keys, { ph: 1 + i * 1.3, sp: isS ? 7 : 8, show: t => t >= 48.2 + .26 * i - .05 && (!isS || t >= 48.2), face: (t, p) => (!p.mv && t > 52) ? headZ(-1, .2 * ((i % 3) - 1)) : null,
        ex: t => isS ? {} : { lx: .1 * smooth(48.4, 49.4, t) } }); }); }
  const ANIM = [...WHITE, ...GOATS, ...donkeys], AK = new Map();
  ANIM.forEach((a, i) => { const off = ((i % 5) - 2) * .17 + .1, r = route(0, [7.6 + .25 * (i % 4), GZ + ((i % 5) - 2) * .2]).wait(48.6 + .34 * i).go(1.15, [5.4, .25 + off]); along(r, 1.08, off, 5.4, -1.0); r.go(1.0, [-2.8 + .4 * (i % 5), -2.3 - .3 * (i % 3)]); AK.set(a, r.keys); });
""")
out.append(R(193, 203))
out.append(r"""    const night = ON(t, 38.2, 41.5, 46.0, 49.2), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);

    // the low sun behind the subject (it sets before the night and rises again at dawn)
    { const k = (.42 + .13 * ON(t, 44, 50, 90, 91)) * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]); dust.update(t, .3 * (ON(t, 12, 14, 60, 62)), [.5, .1, 1.4]);
    // ---- the river: day colours, darker at night, ripples drifting south
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- torches at the gate, lit windows, the glow in the gateway, the camp light at the end
    { const tk = smooth(38.2, 40.4, t) * (1 - smooth(50.2, 52.6, t)), gk = ON(t, 42.2, 43.6, 47.0, 48.8);
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 2.8 * gk * fl; gateG.material.opacity = (.8 * gk + .2 * tk) * fl; gateG.visible = gateG.material.opacity > .01;
      WINS.forEach(w => { const on = smooth(37.0 + 2.4 * w.ord, 38.4 + 2.4 * w.ord, t) * (1 - smooth(49.5 + 2 * w.ord, 51.5 + 2 * w.ord, t)); w.s.material.opacity = .85 * on * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = on > .01; });
      campL.intensity = 1.1 * ON(t, 55.5, 58.5, 90, 91) * fl; }
    // ---- the actors: every one is a pure function of time
    ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp); });
    swS.visible = swL.visible = t > 37.0;
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = t >= 48.4 + .34 * i - .1; a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(-1, .2 * Math.sin(i * 2.1));
      const big = i >= 7; if (p.mv) walkLegs(a.legs, t + i * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); });
    dustR.update(t, ON(t, 49.0, 50.0, 56, 58), [2.4, hC(2.4, .9) + .05, .9]);
    state.t = t;
  }

""")
out.append(r"""  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(12, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(24, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(34, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(38.4, '#8a86b0', '#4a3a40', .9, '#ff8a50', 2.0, [10, 1.2, -4], .5, '#ffa878', FD, 14), Dk(41.5, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14),
    Dk(46.0, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(49.4, '#8a94c4', '#5a4a50', .95, '#ffb088', 2.1, [10, 1.6, -4], .5, '#ffbc98', FD, 14),
    Dk(53, '#b0a8c0', '#6a5446', 1.0, '#ffb470', 2.7, [10, 2.8, -4], .5, '#ffcf9a', FD, 14), Dk(58, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', FD, 14), Dk(62, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [12, ['#5a86c4', '#f6d09a']], [34, ['#5a86c4', '#f6c890']], [38.4, ['#4a5a9a', '#f0905a']], [41.5, ['#0e1636', '#2a3466']], [46, ['#0e1636', '#2a3466']], [49.4, ['#4a5a9a', '#f4a888']], [53, ['#5a7ab8', '#f6b888']], [58, ['#7a78b0', '#f6a068']], [62, ['#7a78b0', '#f6a068']]];
  return { group: g, update, light, bg, far, pl: [...torchL, gateL, campL], state, jacob, dinah };
}
""")
s = '\n'.join(out)
s = rep(s, 'function kp(t, keys) { if (t <= keys[0][0])', 'function kp(t, keys) { if (keys.length === 1) return { x: keys[0][1], z: keys[0][2], mv: false, vx: 1, vz: 0 }; if (t <= keys[0][0])')
EMB = "  const ember = makeMotes({ n: 36, area: [.5, 1.8, .5], size: .008, v: .3, seed: 45, color: 0xffb060 }); g.add(ember.mesh);\n"
s = s.replace(EMB, '').replace("  const spark = makeMotes({ n: 40, area: [1.2, 3.5, 1.2], size: .007, v: .22, seed: 41, color: 0xffe4a8 }); g.add(spark.mesh);\n", '')
open(SRC + 'world34.js', 'w').write(s)
print('world34.js', len(s.split('\n')), 'lines')
