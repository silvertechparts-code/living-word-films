#!/usr/bin/env python3
# Builds src/world31.js (Genesis 31) from src/world30.js: copies the shared pieces (terrain helpers, people, house, well, field, fire pit, sky), replaces the rest.
import re, sys
SRC = '/home/claude/g11/src/'
L = open(SRC + 'world30.js').read().split('\n')
def R(a, b): return '\n'.join(L[a - 1:b])
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80])
    return s.replace(a, b)

out = []

# ---------------------------------------------------------------- header
out.append(r"""// Episode 31: Genesis 31. After twenty years with Laban the Lord says to Jacob "Return to the land of your ancestors and to your kindred, and I will be with you" (31:3); while Laban is away shearing, Jacob sets his wives and children on camels and drives off his flocks (31:17-21); Rachel steals her father's household gods (31:19);
// on the third day Laban hears, pursues for seven days and overtakes them in the hill country of Gilead (31:22-25); God comes to Laban in a dream by night: "Take heed that you say not a word to Jacob, either good or bad" (31:24); Laban asks why Jacob fled in secret and why he stole his gods (31:26-30);
// Jacob answers that he was afraid, and that anyone with whom the gods are found shall not live; he did not know Rachel had taken them (31:31-32); Laban searches the tents of Jacob, Leah and the two maids and finds nothing; Rachel has put the gods in the camel's saddle and sits on them (31:33-35);
// Jacob's anger: twenty years, his wages changed ten times; "If the God of my father had not been on my side, surely now you would have sent me away empty-handed. God saw my affliction" (31:36-42); they make a covenant, set up a pillar and a heap of stones as a witness: "The Lord watch between you and me, when we are absent one from the other" (31:43-53);
// early the next morning Laban kisses his grandchildren and daughters, blesses them, and returns home (31:55).
// Cinematic interpretation: the floating land, the pasture, the yard and the road, the camp with its four tents, the fire where Laban sleeps, the places where the people stand, the gestures, the pace of the walkers, the chase, the carrying of the stones, the pile of baggage Rachel sits on, the light and the faces are not in the text.
// The film leaves out the seven days' journey as such (31:23), the details of Laban's complaint about the songs and tambourines (31:27), the full covenant with Jacob's pledge not to ill-treat Laban's daughters (31:50), the sacrifice and the meal on the mountain (31:54), and the names of the heap (31:47-49). Rachel is shown stealing the gods at the house and then seated on them at the camp; the walk between is not shown.
// The text does not say that God's coming to Laban was a light, that Jacob stood at the heap, who carried the stones (31:46 says "his kinsfolk"), or what the gods looked like; the film shows them so that each moment can be seen. God is shown only as light, never as a figure.""")

# ---------------------------------------------------------------- imports + constants + terrain
out.append(rep(R(8, 14), "headZ, headX, C3, rimf, meshOf }", "headZ, headX, C3, rimf, meshOf, tentMesh }"))
out.append(r"""
export const RIC = 15;
export const HZ = [-6.7, .9], DOOR = [-5.46, .9], YARD = [-4.3, 1.25], WELL = [3.4, -1.0], FLD = [-2.6, 4.8], FIRE = [2.3, 3.4], PAS = [-2.1, -2.9], CAMP = [8.4, -1.4], HEAP = [5.6, -1.2];       // Laban's house (door faces east); the yard; the well; the field; Laban's night fire; Jacob's pasture; Jacob's camp; the heap of stones
export const EV = { a1: .6, a2: 6.66, b1: 14.49, b2: 22.04, c1: 27.72, c2: 36.44, d1: 46.21, e1: 54.41 };
""")
t = R(20, 40)
t = rep(t, "[FIRE[0], FIRE[1], .32, 2.0], [PAS[0] + .6, PAS[1] + .2, .32, 4.4]];", "[FIRE[0] + .5, FIRE[1] + .4, .32, 2.6], [PAS[0] + .6, PAS[1] + .2, .32, 3.8], [CAMP[0], CAMP[1], .32, 4.9]];")
t = rep(t, "  b.lerp(C3('#86a458'), .55 * smooth(4.4, 2.0, Math.hypot(x - PAS[0] - .6, z - PAS[1])));",
        "  b.lerp(C3('#86a458'), .55 * smooth(4.4, 2.0, Math.hypot(x - PAS[0] - .6, z - PAS[1])));\n  b.lerp(C3('#a8906a'), .7 * smooth(4.6, 2.2, Math.hypot(x - CAMP[0] + .6, z - CAMP[1] - .8)));")
t = rep(t, "export const stage = { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH };", "export const stage = { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH, CAMP, HEAP };")
t = rep(t, "// ---------------- terrain: open country, green by the house and dry round the well, a tilled field in the south", "// ---------------- terrain: open country, green by the house, dry and trodden at the camp, a tilled field in the south")
out.append(t)
out.append(R(41, 62))   # walkers, people, animals (shared)

# ---------------------------------------------------------------- makeCountry: head, trees, house
out.append(R(63, 66))
t = R(67, 76)
t = rep(t, "[[-1.4, -3.2, .85], [1.4, -5.6, .8], [2.2, -6.2, .9], [7.0, 7.6, .8], [-5.0, 6.8, .9]]", "[[-5.2, -3.6, .9], [1.4, -5.6, .8], [2.2, -6.2, .9], [7.0, 7.6, .8], [-5.0, 6.8, .9]]")
t = rep(t, "[[11.0, -.4, 1.0], [12.4, -3.8, 1.1], [9.4, 9.8, .9]]", "[[13.2, -1.0, 1.0], [13.4, -4.6, 1.1], [9.4, 9.8, .9]]")
t = rep(t, "Math.hypot(x - FIRE[0], z - FIRE[1]) < 1.6 || Math.hypot(x - PAS[0], z - PAS[1]) < 3.8;", "Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.8 || Math.hypot(x - PAS[0], z - PAS[1]) < 3.8 || Math.hypot(x - CAMP[0], z - CAMP[1]) < 5.4;")
out.append(t)
t = R(77, 84)
t = rep(t, "hb.box('#8a7254', [hx + 1.3, hy0 + .04, hz], [.4, .04, 1.3], [0, 0, 0], .02);",
        "hb.box('#8a7254', [hx + 1.3, hy0 + .04, hz], [.4, .04, 1.3], [0, 0, 0], .02);\n  hb.box('#9a8a70', [hx + 1.38, hy0 + .17, hz - .48], [.15, .24, .15], [0, 0, 0], .02);                                                       // the small stone shelf where the household gods stand")
t = rep(t, "(the evening of Joseph's birth)", "(the grey hour before the family leaves)")
out.append(t)
out.append(R(85, 89))
out.append(r"""  const IDB = hy0 + .29, IDP = [hx + 1.38, hz - .48];
  const mkIdol = () => { const o = new THREE.Group(), b = new GB(rng(15)); b.box('#b8944a', [0, .05, 0], [.06, .1, .045], [0, 0, 0], .01); b.add(G.ico0, '#c8a458', [0, .13, 0], [.036, .04, .036], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; o.add(m); g.add(o); return o; };
  const idols = [mkIdol(), mkIdol()];
""")
# ---- fire pit (Laban's night fire), field, well : shared
t = R(91, 97)
t = rep(t, "the fire pit in the yard: a ring of stones, crossed logs and a flickering flame; the family gathers by it", "Laban's fire pit by the road: a ring of stones, crossed logs and a flickering flame, lit only through the night he sleeps here (31:24)")
out.append(t)
out.append(r"""  { const b = new GB(rng(433)); b.box('#7a4a3a', [FIRE[0] + .95, fireY + .02, FIRE[1] + .65], [1.0, .025, .42], [0, 0, 0], .01); b.box('#6a5a3a', [FIRE[0] + .75, fireY + .02, FIRE[1] - .65], [1.0, .025, .42], [0, 0, 0], .01); b.box('#5a4a6a', [FIRE[0] - .35, fireY + .02, FIRE[1] - .8], [1.0, .025, .42], [0, 0, 0], .01); ca.add(meshOf(b)); }    // three sleeping rugs""")
out.append(R(98, 109))

# ---------------------------------------------------------------- camp: tents, baggage pile, stones, flocks
out.append(r"""
  // ---- Jacob's camp in the hill country (31:25): four tents in a row, the baggage Rachel sits on, and the heap of stones that rises at the covenant (31:45-46)
  const TENTS = [[5.4, -3.0, '#cdb48c', .04], [7.0, -3.2, '#c2a67a', -.05], [8.6, -3.0, '#d4c29c', .06], [10.2, -3.2, '#b8946a', -.03]];
  const tents = TENTS.map(([x, z, c, ry], i) => { const m = tentMesh(rng(500 + i), c, .85); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; m.scale.setScalar(.001); m.userData.t0 = 15.9 + .4 * i; ca.add(m); return m; });
  const PILE = [10.3, -1.75];
  const pileG = new THREE.Group(); { const b = new GB(rng(77)); b.box('#8a5a3a', [0, .14, 0], [.62, .28, .46], [0, .1, 0], .03); b.box('#c8a45a', [.02, .31, 0], [.5, .06, .38], [0, .1, 0], .02); b.box('#a8483a', [-.1, .34, .02], [.22, .06, .3], [0, -.2, .1], .02); b.box('#3a2a1c', [0, .14, .24], [.6, .03, .03], [0, .1, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; pileG.add(m); } pileG.position.set(PILE[0], hC(PILE[0], PILE[1]) - .02, PILE[1]); pileG.rotation.y = .12; pileG.scale.setScalar(.001); ca.add(pileG);
  // stones: a pillar and 27 stones in three layers; each appears as a carrier reaches the heap
  const STP = [[HEAP[0], HEAP[1], 0, 1]];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .2; STP.push([HEAP[0] + Math.cos(a) * .5, HEAP[1] + Math.sin(a) * .34, .07, 0]); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .5; STP.push([HEAP[0] + Math.cos(a) * .3, HEAP[1] + Math.sin(a) * .2, .17, 0]); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .1; STP.push([HEAP[0] + Math.cos(a) * .15, HEAP[1] + Math.sin(a) * .1, .26, 0]); }
  const stones = STP.map(([x, z, dy, pil], i) => { const b = new GB(rng(900 + i)), rr = rng(950 + i);
    if (pil) b.box('#b4a88e', [0, .17, 0], [.11, .34, .17], [0, .2, .04], .02); else b.add(G.ico0, pk(rr, ['#9a8e7c', '#a99c86', '#85796a', '#b0a48c']), [0, 0, 0], [.17 + rr() * .07, .1 + rr() * .04, .15 + rr() * .06], [rr() * 3, rr() * 3, 0], .06);
    const m = meshOf(b); m.position.set(x, hC(x, z) + dy, z); m.rotation.y = rr() * 6; m.scale.setScalar(.001); m.visible = false; ca.add(m); return { m, x, z, dy, pil, y: hC(x, z) + dy }; });
  const carried = Array.from({ length: 10 }, (_, i) => { const b = new GB(rng(980 + i)); b.add(G.ico0, '#a99c86', [0, 0, 0], [.1, .07, .09], [i, 2 * i, 0], .05); const m = meshOf(b); m.visible = false; g.add(m); return m; });

  // ---- the flock (31:18, 31:21): 16 white sheep, dark lambs and spotted goats, grazing in Jacob's pasture, then driven east; camels and donkeys (31:17)
  const put = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); s.home = [x, z, ry]; return s; };
  const SPOT = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) SPOT.push([PAS[0] - .9 + .55 * c + (r % 2 ? .27 : 0) + .06 * Math.sin(r * 3 + c), PAS[1] - .75 + .5 * r + .05 * Math.cos(c * 2 + r)]);
  const TYP = ['w', 'd', 'w', 'g', 'd', 'g', 'w', 'd', 'w', 'g', 'd', 'w', 'g', 'w', 'd', 'w'];
  const flock = TYP.map((ty, i) => { const [x, z] = SPOT[i], ry = i * 1.9; return put(ty === 'w' ? makeSheep(rng(700 + i)) : (ty === 'd' ? mkDark(720 + i) : mkGoat(740 + i)), x, z, ry); });
  const camels = [0, 1].map(i => { const s = makeCamel(rng(800 + i)); ca.add(s.group); return s; }), donkeys = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); ca.add(s.group); return s; });
""")

# ---------------------------------------------------------------- sky etc (shared)
t = R(121, 127)
t = rep(t, "const spark = makeMotes", "const dustR = makeMotes({ n: 46, area: [2.4, .7, 1.4], size: .035, v: .5, seed: 47, color: 0xd8b888 }); g.add(dustR.mesh);\n  const spark = makeMotes")
out.append(t)
out.append(r"""  const CLOUD = [[0, '#e8d0b0'], [6.2, '#e8d0b0'], [7.4, '#8a8ab8'], [11.8, '#e8c4a0'], [14.6, '#e8d6b8'], [17.0, '#d89080'], [17.9, '#3a3860'], [21.2, '#3a3860'], [22.4, '#e8c8a8'], [41.5, '#e8d0b0'], [47, '#d89080'], [53.4, '#6a5a80'], [54.2, '#3a3860'], [54.9, '#e8c0a0'], [90, '#e8c0a0']];
  const CEM = [[0, '#6a5a48'], [6.2, '#6a5a48'], [7.4, '#3a3a5a'], [11.8, '#6a5444'], [14.6, '#6a5a48'], [17.0, '#5a4444'], [17.9, '#242444'], [21.2, '#242444'], [22.4, '#6a5848'], [41.5, '#6a5848'], [47, '#5a4444'], [53.4, '#3a3050'], [54.2, '#242444'], [54.9, '#6a5848'], [90, '#6a5848']];""")
out.append(R(130, 132))

# ---------------------------------------------------------------- the people
out.append(r"""
  // ---- the people: the same Jacob, Rachel, Leah and Laban as in Genesis 29-30, the maids and the sons grown by twenty years
  const jacob = mkJacob(rng(87)), jacobP = mkJacob(rng(87)), rachel = mkRachel(rng(88)), laban = mkLaban(rng(89)), labanD = mkLaban(rng(89)), leah = mkLeah(rng(90));
  const bil = mkMaid(rng(91), '#9a6a4a', '#c08a5e', '#e0d4bc', '#8a7a4a', 910), zil = mkMaid(rng(92), '#6a7a58', '#b8825a', '#d8cfb4', '#a87a4a', 911);
  const KID = { reu: mkKid(rng(93), '#6a7fa0', 930, .36), sim: mkKid(rng(94), '#a8683a', 931, .34), lev: mkKid(rng(95), '#5f8a5a', 932, .32), jud: mkKid(rng(96), '#c9a15a', 933, .30),
    dan: mkKid(rng(97), '#7a4a3a', 934, .27), nap: mkKid(rng(98), '#4f7a8a', 935, .26), gad: mkKid(rng(99), '#a2564e', 936, .27), ash: mkKid(rng(100), '#8a9a5a', 937, .25),
    iss: mkKid(rng(101), '#6a5a8a', 938, .25), zeb: mkKid(rng(102), '#b4784a', 939, .24), din: mkKid(rng(103), '#c88a7a', 940, .24, '#cf9468', true), jos: mkKid(rng(108), '#5f8aa8', 945, .27) };
  const hd1 = mkHerd(rng(104), '#6f8a62', '#a8714a', 941), hd2 = mkHerd(rng(105), '#9a4a42', '#b98a62', 942, '#4a3a30'), sl1 = mkHerd(rng(109), '#6f8a62', '#a8714a', 941), sl2 = mkHerd(rng(110), '#9a4a42', '#b98a62', 942, '#4a3a30');
  const sv1 = mkHerd(rng(106), '#c9a15a', '#c38a5c', 943, '#6a5a3a'), sv2 = mkHerd(rng(107), '#7a5a8a', '#a8714a', 944, '#cdbd98');
  const ALLP = [jacob, jacobP, rachel, laban, labanD, leah, bil, zil, ...Object.values(KID), hd1, hd2, sl1, sl2, sv1, sv2]; ALLP.forEach(o => g.add(o.group));
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacob.group.add(mkStaff()); jacobP.group.add(mkStaff());
  // God is shown only as light: gold on Jacob at the pasture (31:3) and when he speaks of God's help (31:42); pale blue-white on Laban asleep (31:24)
  const jS = shaft(6, .22, .5, [1, .86, .5], .9, .12), jG = spriteGlow(0, 0, 0, 1.3, 0xffd890, 0), jP = pool(.9, 0xffd890, 0), jL = new THREE.PointLight(0xffd090, 0, 6, 1.5);
  const lS = shaft(6, .24, .55, [.78, .86, 1], .9, .12), lG = spriteGlow(0, 0, 0, 1.4, 0xbcd0ff, 0), lP = pool(1.0, 0xbcd0ff, 0), lL = new THREE.PointLight(0xb8c8ff, 0, 6, 1.5);
  g.add(jS, jG, jP, lS, lG, lP);
""")
out.append(R(146, 151))

# ---------------------------------------------------------------- the keys
out.append(r"""
  // ---- walking: keys [t, x, z, 'L'] along the road at a steady pace (a polyline)
  const PP = [[-4.3, 1.3], [-2.6, 1.5], [-.2, .9], [2.0, -.1], [4.4, -.3]];
  const walk = (ts, v, pts) => { const ks = [[ts, pts[0][0], pts[0][1], 'L']]; let t = ts; for (let i = 1; i < pts.length; i++) { t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) / v; ks.push([t, pts[i][0], pts[i][1], 'L']); } return ks; };
  const cav = (ts, v, a, lat, e) => walk(ts, v, [a, [PP[1][0], PP[1][1] + lat], [PP[2][0], PP[2][1] + lat], [PP[3][0], PP[3][1] + lat], [PP[4][0], PP[4][1] + lat], e]);
  const AK = {};
  // the departure (31:17): at the grey hour Jacob leads, the wives, the sons and the animals follow along the road to the camp
  const KS = { reu: [-2.7, .7], sim: [-2.8, 2.05], lev: [-3.5, .3], jud: [-2.45, 1.4], dan: [-3.45, 2.5], nap: [-3.1, 1.85], gad: [-4.25, .35], ash: [-3.55, 1.7], iss: [-2.9, .05], zeb: [-2.35, 1.0], din: [-4.0, 1.45], jos: [-4.4, 1.0] };
  const KE = { reu: [7.6, -.5], sim: [8.35, -.15], lev: [7.15, .35], jud: [8.75, .35], dan: [7.7, .5], nap: [9.25, -.25], gad: [8.25, .7], ash: [9.35, .55], iss: [7.4, -1.15], zeb: [9.8, .05], din: [8.9, -1.55], jos: [8.45, -.75] };
  const KD0 = { reu: 7.5, sim: 7.8, lev: 7.6, jud: 7.7, dan: 8.0, nap: 7.9, gad: 8.1, ash: 8.2, iss: 7.9, zeb: 8.3, din: 8.0, jos: 8.2 };
  Object.keys(KID).forEach((id, i) => { AK[id] = cav(KD0[id], 1.5, KS[id], ((i % 4) - 1.5) * .22, KE[id]); });
  const JEND = [6.75, -1.15];
  AK.jacob = cav(7.3, 1.5, [-3.2, 1.35], 0, JEND);
  AK.leah = cav(7.5, 1.5, [-3.9, .75], -.12, [8.05, -1.1]); AK.bil = cav(7.7, 1.5, [-3.7, 2.0], .3, [9.45, -1.05]); AK.zil = cav(7.8, 1.5, [-4.35, 2.15], .45, [9.95, -.35]);
  AK.sv1 = cav(7.25, 1.4, [-4.15, 2.45], .55, [10.55, .15]); AK.sv2 = cav(7.65, 1.4, [-4.4, .2], -.35, [9.95, .75]);
  const CK = [cav(7.6, 1.4, [-4.7, 2.55], .5, [12.1, -2.3]), cav(8.0, 1.4, [-4.7, -.4], -.4, [12.6, -.5])], DKS = [cav(8.2, 1.4, [-3.9, 2.9], .7, [12.0, 1.2]), cav(8.4, 1.4, [-3.6, -.1], -.5, [12.9, 2.0])];
  const FSPOT = SPOT.map((_, i) => [12.7 + .5 * (i % 4) + .2 * ((i >> 2) % 2), 3.0 + .5 * (i >> 2)]);
  const FK = SPOT.map(([x, z], i) => walk(8.3 + .1 * i, 1.7, [[x, z], [-.9 + .15 * (i % 4), -.7 + .1 * (i >> 2)], [PP[2][0], PP[2][1] + ((i % 4) - 1.5) * .25], [PP[3][0], PP[3][1] + ((i % 4) - 1.5) * .25], [PP[4][0], PP[4][1] + ((i % 4) - 1.5) * .25], [7.6, .9 + ((i % 4) - 1.5) * .25], FSPOT[i]]));
  // Laban: the chase (31:23), then at the confrontation (31:26-30), the search (31:33-35), the covenant (31:44-53), the farewell (31:55)
  const LRUN = walk(14.5, 2.3, [[-3.0, 1.4], PP[1], PP[2], PP[3], [2.9, .25]]);
  const LB = [[21.4, 2.4, -.1, 'L'], [22.7, 4.7, -1.15, 'W'], [30.7, 4.7, -1.15, 'L'], [31.5, 5.4, -2.1, 'L'], [32.0, 5.4, -2.1, 'L'], [32.8, 7.0, -2.3, 'L'], [33.3, 7.0, -2.3, 'L'], [34.1, 8.6, -2.1, 'L'], [34.6, 8.6, -2.1, 'L'], [35.5, 9.65, -1.3, 'L'], [36.1, 9.65, -1.3, 'L'], [38.6, 4.75, -1.15, 'W'], [54.4, 4.75, -1.15, 'L'],
    [55.3, 7.7, -.7, 'W'], [56.2, 7.7, -.7, 'L'], [56.9, 7.4, -1.15, 'L'], [58.0, 7.4, -1.15, 'L'], [59.0, 5.2, -.3, 'W'], [61.5, 1.8, -.05, 'L'], [66, -2.6, 1.5, 'L']];
  const HIDE = [[31.45, 32.0], [32.75, 33.3], [34.05, 34.6]];
  const LFACE = [[22.6, headZ(1, 0)], [30.6, headZ(1, 0)], [31.1, headZ(0, -1)], [34.7, headZ(0, -1)], [35.4, headZ(.9, -.35)], [36.2, headZ(.9, -.35)], [38.0, headZ(1, 0)], [54.4, headZ(1, 0)], [55.2, headZ(1, .05)], [56.2, headZ(1, .05)], [56.8, headZ(.8, -.1)], [58.0, headZ(.8, -.1)]];
  // Laban's kinsmen (31:23, 31:25): they run behind him, sleep by the fire, stand behind him at the confrontation, carry stones, and go home with him
  const HK = [[[14.7, -3.3, 1.2, 'L'], ...walk(14.7, 2.3, [[-3.3, 1.2], PP[1], PP[2], PP[3], [2.4, .05]]).slice(1)], [[14.8, -3.4, 1.7, 'L'], ...walk(14.8, 2.3, [[-3.4, 1.7], [PP[1][0], PP[1][1] + .4], [PP[2][0], PP[2][1] + .4], [PP[3][0], PP[3][1] + .4], [2.6, .55]]).slice(1)]];
  const HE = [[[21.5, 2.0, .4, 'L'], [22.9, 3.55, -.5, 'W']], [[21.6, 2.4, 1.0, 'L'], [23.0, 3.85, -1.75, 'W']]];
  // Rachel: at the door while the family leaves, steals the gods (31:19); then at the camp, seated on the baggage (31:34), rising when Laban has gone (31:35)
  const RY = [[0, -4.75, 1.3], [10.3, -4.75, 1.3], [10.9, -5.0, .62, 'W'], [12.7, -5.0, .62], [13.4, -4.6, 1.2, 'W'], [14.35, -3.7, 1.4, 'L']];
  const RC = [[16.3, PILE[0], PILE[1]], [37.9, PILE[0], PILE[1]], [39.4, 9.55, -1.25, 'W'], [90, 9.55, -1.25]];
  // the heap (31:46): ten carriers bring 27 stones; the first stone is the pillar Jacob sets up (31:45)
  const CAR = {}, HEV = []; { const order = [['hd1', -1, [3.55, -.5]], ['hd2', -1, [3.9, -1.75]], ['reu', 1], ['sim', 1], ['lev', 1], ['jud', 1], ['dan', 1], ['nap', 1], ['sv1', 1], ['sv2', 1]];
    order.forEach(([id, side, home0], i) => { const home = home0 || KE[id] || [AK[id][AK[id].length - 1][1], AK[id][AK[id].length - 1][2]], b = 46.0 + .13 * i, T = 2.0, n = i < 7 ? 3 : 2, ap = [HEAP[0] + side * .64, HEAP[1] + .5 + .1 * (i % 3)], ks = [[b, home[0], home[1], 'L']];
      for (let k = 0; k < n; k++) { const ta = b + T / 2 + k * T; ks.push([ta, ap[0], ap[1], 'L']); ks.push([ta + T / 2, home[0], home[1], 'L']); HEV.push(ta); }
      CAR[id] = { b, T, n, ks, ci: i }; }); HEV.sort((a, b) => a - b); }
  // after the covenant the kinsmen go home with Laban (31:55)
  CAR.hd1.ks.push([54.4, 3.55, -.5, 'L'], [57.9, 3.55, -.5, 'L'], [59.1, 4.5, -.2, 'W'], [61.6, 1.2, .1, 'L'], [66, -2.8, 1.4, 'L']);
  CAR.hd2.ks.push([54.4, 3.9, -1.75, 'L'], [58.0, 3.9, -1.75, 'L'], [59.2, 4.8, -.6, 'W'], [61.7, 1.5, .5, 'L'], [66, -2.4, 1.8, 'L']);
  const SLP = [[labanD, 3.25, 4.05, -Math.PI / 2], [sl1, 3.05, 2.75, -Math.PI / 2], [sl2, 1.6, 2.6, Math.PI / 2]];
  const keysOf = (id, t, base) => (CAR[id] && t >= CAR[id].b - .01) ? CAR[id].ks : base;
  const lookP = (x, z) => [x, gAt(x, z), z];

  function update(t, camera, sid) {
    const cam = camera && camera.position;
""")
t = R(173, 177)
t = t.replace("    if (camera && camera.userData && camera.userData.T) {", "    if (camera && camera.userData && camera.userData.T) {")  # no change, keep
# the first line of R(171,172) is `function update(...) {` and `const cam`; we skip them (written above); R(173,...) starts at the occluder block
out.append(R(173, 176))
out.append(r"""    sea.mat.color.set(colAt(CLOUD, t)); sea.mat.emissive.set(colAt(CEM, t)); sea.update(t, cam, 22);
    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    // the low sun behind the subject; none in the grey hour or the night
    const nightK = Math.max(ON(t, 6.8, 7.6, 10.6, 11.8), ON(t, 17.2, 17.9, 21.2, 22.2), ON(t, 53.4, 54.0, 54.2, 54.7));
    { const k = (ON(t, -1, .5, 90, 91) * .5) * (1 - .9 * nightK), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * nightK), [3, .5, 2.5]); dust.update(t, .4 * ON(t, 21.6, 22.8, 56, 58.5), [7.0, .2, -.4]);
    // ---- Laban's fire burns only through the night (31:24)
    { const fo = ON(t, 16.8, 17.6, 21.3, 22.2), fk = .92 + .08 * Math.sin(t * 7.3) * Math.sin(t * 11.1);
      flames.forEach((f, i) => { f.visible = fo > .02; f.scale.set(.85 + .2 * Math.sin(t * 9 + i * 2), .8 + .4 * Math.sin(t * 13 + i * 2.1), .85); });
      fireG.material.opacity = .5 * fk * fo; fireG2.material.opacity = .42 * fo; fireL.intensity = 3.0 * fk * fo; ember.update(t, .9 * fo, [FIRE[0], fireY + .15, FIRE[1]]); }
    // ---- the lamp in the doorway is lit in the grey hour while the family leaves and Rachel takes the gods
    { const dk = ON(t, 5.6, 6.6, 12.6, 14.2), fk = .94 + .06 * Math.sin(t * 2.3) * Math.sin(t * 3.7);
      doorM.material.opacity = .85 * dk * fk; winM.material.opacity = .8 * dk * fk; doorG.material.opacity = .4 * dk * fk; doorG2.material.opacity = .24 * dk; doorL.intensity = 2.4 * dk * fk; }
    // ---- the tents are pitched as the family arrives; the baggage appears with Rachel
    tents.forEach(m => { m.scale.setScalar(Math.max(.001, smooth(m.userData.t0, m.userData.t0 + .7, t))); });
    { const a = smooth(16.2, 16.8, t); pileG.scale.setScalar(a + .001); pileG.visible = a > .01; }
    // ---- the animals
    FK.forEach((K, i) => { const s = flock[i], p = kp(t, K); s.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); s.group.rotation.y = p.mv ? headX(p.vx, p.vz) : s.home[2] + .14 * Math.sin(t * .5 + i); if (p.mv) walkLegs(s.legs, t + i, 9, .5); else walkLegs(s.legs, 0, 0, 0); });
    [[camels, CK], [donkeys, DKS]].forEach(([arr, K]) => arr.forEach((s, i) => { const p = kp(t, K[i]); s.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); s.group.rotation.y = p.mv ? headX(p.vx, p.vz) : (K === CK ? headX(-1, .1) : headX(-1, .3)); if (p.mv) walkLegs(s.legs, t + i * 1.3, 7, .35); else walkLegs(s.legs, 0, 0, 0); }));
    // ---- the people
    const sway = (k, ph) => ({ s: 1 + .006 * Math.sin(t * k + ph) });
    // Jacob at the pasture: the Lord says "go home" (31:3)
    { jacobP.group.visible = t < 6.9; fig(jacobP, -.55, -2.45, headZ(-.4, .5), false, t, 6.2, { ...GE(t, [[1.6, 2.2, 5.6, 6.6, { a1x: -.5, a1z: .3 }]]), ...sway(1.5, 0) }, 8.4); }
    // Jacob at the yard, on the road, at the camp
    { jacob.group.visible = t > 6.3; const p = kp(t, AK.jacob), mv = p.mv; let ry;
      if (mv) ry = headZ(p.vx, p.vz); else if (t < 7.4) ry = headZ(1, .1); else if (t < 21.5) ry = headZ(-1, .15); else ry = headZ(-1, 0);
      const ex = GE(t, [[28.0, 28.5, 30.3, 31.0, { a1x: -1.5, a1z: .1, a0x: -.2 }], [36.4, 36.9, 38.2, 38.7, { a1x: -1.0, a0x: -.2, a1z: .3 }], [38.8, 39.3, 40.2, 40.8, { a0x: -.6, a1x: -.6, a0z: -.6, a1z: .6 }], [42.0, 42.6, 45.4, 46.0, { a0x: -.9, a1x: -.9, a0z: -.4, a1z: .4 }]]);
      fig(jacob, p.x, p.z, ry, mv, t, 6.2, { ...ex, ...sway(1.5, 0) }, 8.4); state.jacob = [p.x, gAt(p.x, p.z), p.z]; }
    // Rachel: takes the gods from the shelf (31:19); later sits on them in the baggage and does not rise (31:34-35)
    { const inYard = t < 14.35, atCamp = t > 16.3; rachel.group.visible = inYard || atCamp;
      if (inYard) { const p = kp(t, RY), mv = p.mv, ry = mv ? headZ(p.vx, p.vz) : (t < 10.3 ? headZ(1, 0) : headZ(-.32, -.2));
        const ex = GE(t, [[10.9, 11.2, 11.6, 11.95, { a1x: -1.1, a1z: .2 }], [11.8, 12.2, 13.0, 13.4, { a0x: -.9, a1x: -.9, a0z: -.4, a1z: .4 }]]); fig(rachel, p.x, p.z, ry, mv, t, 2.2, { ...ex, ...sway(1.6, 0) }, 8.4); state.rachel = [p.x, gAt(p.x, p.z), p.z]; }
      else if (atCamp) { const p = kp(t, RC), mv = p.mv, sit = 1 - smooth(37.6, 38.4, t), ry = mv ? headZ(p.vx, p.vz) : headZ(-1, .1);
        const ex = GE(t, [[16.8, 17.4, 34.2, 34.9, { a0x: -.5, a1x: -.5, a0z: -.3, a1z: .3 }], [34.8, 35.3, 36.6, 37.3, { a0x: -.6, a1x: -.6, a0z: -.6, a1z: .6 }]]);
        fig(rachel, p.x, p.z, ry, mv, t, 2.2, { ...ex, s: smooth(16.3, 16.8, t) * (1 + .006 * Math.sin(t * 1.6)) + .001 }, 8.4, -.2 * sit); state.rachel = [p.x, gAt(p.x, p.z), p.z]; } }
    // the two household gods: on the shelf, in her hands, under her mantle
    idols.forEach((o, k) => { const sx = IDP[0], sz = IDP[1] + (k ? .035 : -.035), p = kp(Math.min(t, 14.3), RY), cx = p.x - .1, cy = gAt(p.x, p.z) + .4 + .02 * k, cz = p.z - .03 + .03 * k, bx = p.x - .02, by = gAt(p.x, p.z) + .28, bz = p.z + .02;
      const u1 = smooth(11.0, 11.9, t), u2 = smooth(12.0, 12.8, t), x = lerp(lerp(sx, cx, u1), bx, u2), y = lerp(lerp(IDB, cy, u1), by, u2), z = lerp(lerp(sz, cz, u1), bz, u2);
      o.position.set(x, y, z); o.scale.setScalar(Math.max(.001, 1 - smooth(12.5, 13.0, t))); o.visible = t < 13.05; });
    // Leah, the wives' maids, the sons: the family on the road and at the camp
    { const w = (f, id, ph, extra = {}) => { const p = kp(t, keysOf(id, t, AK[id])), mv = p.mv; f.group.visible = true; const ry = mv ? headZ(p.vx, p.vz) : (t < 7.4 ? headZ(1, .1) : face(p.x, p.z, JEND[0] - 2.05, JEND[1])); fig(f, p.x, p.z, ry, mv, t, ph, { ...extra, ...sway(1.4, ph) }, 8.4); return p; };
      w(leah, 'leah', 4.4); w(bil, 'bil', 1.4); w(zil, 'zil', 3.3);
      Object.keys(KID).forEach((id, i) => { const f = KID[id], p = kp(t, keysOf(id, t, AK[id])), mv = p.mv; const ry = mv ? headZ(p.vx, p.vz) : (t < 7.4 ? headZ(1, .1) : face(p.x, p.z, 4.7, -1.15)); fig(f, p.x, p.z, ry, mv, t, 5 + i, { s: 1 + .01 * Math.sin(t * 1.9 + i) }, 8); });
      [[sv1, 'sv1', 4], [sv2, 'sv2', 5]].forEach(([f, id, ph]) => { const p = kp(t, keysOf(id, t, AK[id])), mv = p.mv; const ry = mv ? headZ(p.vx, p.vz) : face(p.x, p.z, 4.7, -1.15); fig(f, p.x, p.z, ry, mv, t, ph, { ...sway(1.3, ph) }, 8); }); }
    // Laban: the chase (31:23), the confrontation (31:26-30), the search (31:33-35), the heap (31:44-53), the farewell (31:55)
    { const run = t > 14.5 && t < 17.95, arr = t > 21.35, inTent = HIDE.some(([a, b]) => t > a && t < b); laban.group.visible = (run || arr) && !inTent;
      const K = run ? LRUN : LB, p = kp(t, K), mv = p.mv, ry = mv ? headZ(p.vx, p.vz) : hy(t, LFACE);
      const ex = run ? { lx: .12 } : GE(t, [[22.9, 23.4, 24.2, 24.6, { a1x: -1.2, a1z: .5, a0x: -.1 }], [24.7, 25.2, 26.0, 26.4, { a0x: -.6, a1x: -.6, a0z: -.6, a1z: .6 }], [26.5, 27.0, 27.6, 28.0, { a1x: -1.2, a1z: .5, a0x: -.1 }], [50.6, 51.1, 52.6, 53.2, { a1x: -1.5, a1z: .1, a0x: -.2 }],
        [55.3, 55.6, 56.0, 56.3, { lx: .5 }], [56.9, 57.1, 57.3, 57.5, { lx: .5 }], [57.0, 57.5, 57.9, 58.3, { a0x: -1.5, a0z: -.1 }]]);
      fig(laban, p.x, p.z, ry, mv, t, 3.3, { ...ex, ...sway(1.7, 0) }, run ? 12 : 8.4); state.laban = [p.x, gAt(p.x, p.z), p.z];
      dustR.update(t, run ? 1 : 0, [p.x - .4, gAt(p.x, p.z) + .05, p.z]); }
    // Laban's kinsmen
    [[hd1, 0, 'hd1', 1.1], [hd2, 1, 'hd2', 2.2]].forEach(([f, i, id, ph]) => { const run = t > 14.7 && t < 17.95, arr = t > 21.45; f.group.visible = run || arr;
      const K = run ? HK[i] : (CAR[id] && t >= CAR[id].b - .01 ? CAR[id].ks : HE[i]), p = kp(t, K), mv = p.mv, ry = mv ? headZ(p.vx, p.vz) : face(p.x, p.z, JEND[0], JEND[1]);
      fig(f, p.x, p.z, ry, mv, t, ph, run ? { lx: .12 } : {}, run ? 12 : 8.4); });
    // Laban and his kinsmen asleep by the fire (31:24)
    { const vis = t > 16.8 && t < 21.7; SLP.forEach(([f, x, z, ry], i) => { f.group.visible = vis; pose(f, x, gAt(x, z) + .1, z, ry, { lx: -Math.PI / 2, s: 1 + .008 * Math.sin(t * 1.3 + i) }); }); }
    // the stones: the pillar first (31:45), then one for each carrier who reaches the heap (31:46)
    stones.forEach((s, i) => { const te = i === 0 ? 46.3 : (HEV[i - 1] + .05), a = smooth(te, te + .35, t); s.m.visible = a > .01; s.m.scale.setScalar(Math.max(.001, a)); s.m.position.y = s.y + (1 - a) * .18; });
    Object.keys(CAR).forEach(id => { const c = CAR[id], ph = t - c.b, mvOut = ph >= 0 && ph < c.n * c.T && (ph % c.T) < c.T / 2, f = carried[c.ci]; f.visible = mvOut;
      if (mvOut) { const own = id === 'hd1' ? hd1 : id === 'hd2' ? hd2 : id === 'sv1' ? sv1 : id === 'sv2' ? sv2 : KID[id], gp = own.group.position, ry = own.group.rotation.y; f.position.set(gp.x + Math.sin(ry) * .1, gp.y + .4 * own.sc / .45, gp.z + Math.cos(ry) * .1); } });
    // ---- God as light: gold on Jacob at the pasture (31:3) and when he says God has been on his side (31:42); pale on Laban asleep (31:24)
    { const a = ON(t, 1.0, 2.0, 6.4, 7.2), b = ON(t, 41.2, 42.0, 45.6, 46.4), lo = Math.max(a, b) * (.92 + .08 * Math.sin(t * 1.7)), lx = a > b ? -.55 : JEND[0], lz = a > b ? -2.45 : JEND[1], gy = hC(lx, lz);
      jS.position.set(lx, gy, lz); jS.material.opacity = .26 * lo; jS.visible = lo > .004; jG.position.set(lx, gy + .55, lz); jG.material.opacity = .12 * lo; jG.visible = lo > .004; jP.position.set(lx, gy + .03, lz); jP.material.opacity = .18 * lo; jP.visible = lo > .004; jL.position.set(lx + .3, gy + .9, lz + .3); jL.intensity = .8 * lo; spark.update(t, lo * 1.3, [lx, gy, lz]);
      const o = ON(t, 17.9, 18.8, 21.0, 21.8) * (.92 + .08 * Math.sin(t * 1.9)), ox = 3.25, oz = 4.0, oy = hC(ox, oz);
      lS.position.set(ox, oy, oz); lS.material.opacity = .3 * o; lS.visible = o > .004; lG.position.set(ox, oy + .5, oz); lG.material.opacity = .14 * o; lG.visible = o > .004; lP.position.set(ox, oy + .03, oz); lP.material.opacity = .2 * o; lP.visible = o > .004; lL.position.set(ox + .3, oy + .9, oz + .3); lL.intensity = .9 * o; }
  }
""")

# ---------------------------------------------------------------- lighting + sky + return
out.append(r"""
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#c4c0b4', '#8a7a64', 1.0, '#ffe0a8', 2.7, [8, 5.4, 6], .45, '#ffe0b0', [-8, 5, 6], 14), Dk(6.2, '#c0bcb2', '#8a7a64', 1.0, '#ffe0a8', 2.7, [8, 5.0, 6], .45, '#ffe0b0', [-8, 5, 6], 14),
    Dk(7.2, '#7a8ac0', '#3a3a58', .8, '#8a9ad8', 1.2, [-8, 4, 6], .4, '#ffc888', [-8, 5, 6], 14), Dk(10.2, '#7a8ac0', '#3a3a58', .8, '#8a9ad8', 1.2, [-8, 4, 6], .4, '#ffc888', [-8, 5, 6], 14),
    Dk(11.8, '#b4a8b8', '#6a5a58', .95, '#ffc080', 2.3, [9, 2.4, 5], .45, '#ffd8a0', [-8, 5, 6], 14), Dk(14.6, '#c8c4b8', '#8a7a64', 1.05, '#fff0d0', 3.0, [6, 7, 6], .45, '#ffe8c0', [-8, 5, 6], 14),
    Dk(16.9, '#b0a8b8', '#6a5a54', .95, '#ffc078', 2.4, [9, 2.8, 5], .45, '#ffd0a0', [-8, 5, 6], 14), Dk(17.9, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14),
    Dk(21.0, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(22.4, '#b4b0c4', '#7a6a58', 1.0, '#ffd8a0', 2.7, [8, 3.4, 5], .45, '#ffe0b0', [-8, 5, 6], 14),
    Dk(28.5, '#c8c4b8', '#8a7a64', 1.05, '#fff0d0', 3.0, [5, 7.5, 6], .45, '#ffe8c0', [-8, 5, 6], 14), Dk(36, '#c8c4b8', '#8a7a64', 1.05, '#fff0d0', 3.0, [5, 7.5, 6], .45, '#ffe8c0', [-8, 5, 6], 14),
    Dk(41.5, '#c4bcb4', '#8a7a64', 1.0, '#ffe0a8', 2.8, [8, 4.4, 5], .45, '#ffe0b0', [-8, 5, 6], 14), Dk(47, '#a8a0b8', '#6a5a54', .95, '#ffa860', 2.6, [9, 2.0, 5], .5, '#ffc890', [-8, 4, 6], 14),
    Dk(51, '#8a88b0', '#4a4458', .85, '#ff9a5a', 2.0, [9, 1.6, 5], .5, '#ffb880', [-8, 4, 6], 14), Dk(53.5, '#6a70a8', '#2e2a40', .8, '#ff9a60', 1.5, [9, 1.4, 5], .5, '#ffb070', [-8, 4, 8], 14),
    Dk(54.2, '#4a5890', '#1e2036', .75, '#7a8ad0', 1.3, [-9, 5, 6], .5, '#ff9a50', [-8, 4, 8], 14), Dk(55, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.6, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], 14),
    Dk(62, '#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 3.2, -5], .45, '#ffcf9a', [-8, 4, 6], 14)];
  const bg = [[0, ['#5a86c4', '#f6dcb0']], [6.2, ['#5a86c4', '#f6dcb0']], [7.4, ['#1e2a5c', '#6a5a88']], [10.2, ['#1e2a5c', '#6a5a88']], [11.8, ['#4a5c98', '#f0b878']], [14.6, ['#5a86c4', '#f6dcb0']], [17.0, ['#4a5488', '#f0a870']], [17.9, ['#141e4c', '#6a4a70']], [21.1, ['#141e4c', '#6a4a70']], [22.4, ['#4a6aa8', '#f6d4a0']], [28.5, ['#5a86c4', '#f6dcb0']], [41.5, ['#5a86c4', '#f6d8a8']], [47, ['#3a4a88', '#f09a6a']], [53.4, ['#1a2458', '#9a6080']], [54.2, ['#141e4c', '#6a4a70']], [55, ['#4a6aa8', '#f6d4a0']], [62, ['#4a6aa8', '#f6d8a8']]];
  return { group: g, update, light, bg, far, pl: [doorL, fireL, jL, lL], state, jacob, rachel, laban, leah };
}
""")

s = '\n'.join(out)
open(SRC + 'world31.js', 'w').write(s)
print('world31.js', len(s))
