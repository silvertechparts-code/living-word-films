#!/usr/bin/env python3
# Builds g11/src/world47.js from world46.js: the same floating country (Canaan camp in the east, the ford, the road west, Joseph's house and courtyard in the west).
# New for Genesis 47 (NRSV-CE): Pharaoh on his seat in the portico with the five brothers (47:1-6), Jacob led in to bless Pharaoh (47:7-10), Goshen with its tents, flock and family that grows (47:6, 47:11, 47:27),
# the granary yard with the table and the balance, the queue, the livestock and the fields in the famine (47:13-26), and Jacob's bed in Goshen with Joseph kneeling at its side (47:28-31).
SRC = '/home/claude/g11/src/'
t = open(SRC + 'world46.js').read()
t45 = open(SRC + 'world45.js').read()
t41 = open(SRC + 'world41.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)
def between(s, a, b, new):
    assert s.count(a) == 1, (s.count(a), a[:60]); i = s.index(a); j = s.index(b, i); return s[:i] + new + s[j:]

# ---- header
L = t.split('\n'); assert L[0].startswith('// Episode 46') and L[5].startswith("import * as THREE")
HDR = [
 "// Episode 47: Genesis 47 (NRSV-CE). Joseph brings five of his brothers before Pharaoh, who asks their work; they say they are shepherds and that the famine in Canaan is severe (47:1-4); Pharaoh tells Joseph to settle them in Goshen, the best of the land (47:5-6).",
 "// Joseph brings in his father Jacob, who blesses Pharaoh; Pharaoh asks how old he is; Jacob says one hundred thirty years, few and hard (47:7-10); Joseph settles his family in the land of Rameses and provides them with food (47:11-12).",
 "// The famine grows heavy; the people pay for grain with silver, then livestock, then land and themselves; Joseph buys the land for Pharaoh and gives them seed, and a fifth of the harvest is Pharaoh's; they say: you have saved our lives (47:13-26).",
 "// Israel settles in Goshen, gains property and grows very numerous (47:27); Jacob lives seventeen years in Egypt; near death he asks Joseph not to bury him in Egypt but to carry him to his fathers; Joseph swears; Israel bows at the head of his bed (47:28-31).",
 "// Cinematic interpretation: the portico and its seat, the court, the granary yard with a table and balance, the queue, the dry and the green field, the Goshen tents and flock, the bed, the evening lamp. The chapter's omissions are kept (the long legal detail, the priests' land, the hand under the thigh).",
]
t = '\n'.join(HDR + L[5:])

# ---- sky: day by day, then the dusk of the bed scene
t = between(t, "  const CLOUD = [", "  const colAt = ", """  const CLOUD = [[0, '#e8d0ac'], [24, '#e8d0ac'], [25.4, '#d8c4a8'], [31.4, '#d0bca0'], [37, '#e8d0ac'], [46, '#f0d4a8'], [49, '#f0d4a8'], [53, '#e8a078'], [56, '#6a5a80'], [59.6, '#6a5a80'], [60.4, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];
  const CEM = [[0, '#6a5c4a'], [24, '#6a5c4a'], [31.4, '#5a4c3c'], [37, '#6a5c4a'], [49, '#6a5444'], [53, '#5a4444'], [56, '#3a3450'], [59.6, '#3a3450'], [60.4, '#6a5c4a'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];
""")

# ---- people and props (replaces the whole Ep46 block)
i = t45.index("  const pha = person(rng(972)"); j = t45.index("  const mkWagon = sd =>")
PHA = t45[i:j]
PHA = rep(PHA, "g.add(sv2.group, sv3.group, pha.group);", "g.add(pha.group);")
i = t.index("  const WIV = ["); j = t.index("  const mkWagon = sd =>")
WIVKID = t[i:j]
i = t41.index("  const FLD = [[-3.1, 2.7"); j = t41.index("  let SID = '';")
FIELDS = t41[i:j]
FIELDS = rep(FIELDS, "PILES = [[1.95, 2.95], [1.98, 3.55]]", "PILES = [[2.55, 3.0], [2.6, 3.6]]")
FIELDS = rep(FIELDS, "const FLD = [[-3.1, 2.7, -.95, 5.7], [-7.4, 3.4, -4.7, 5.9], [2.55, 4.7, 4.85, 6.8]];", "const FLD = [[2.55, 4.7, 4.85, 6.8]];")

CHOREO = r"""  // ---- Genesis 47: Pharaoh's court, Goshen, the granary and the fields, Jacob's bed
  const HE = Math.PI / 2, HW = -Math.PI / 2, HN = Math.PI;
  const aU = k => k > .001 ? { a0x: -2.3 * k, a1x: -2.3 * k, a0z: -.35 * k, a1z: .35 * k } : {};      // both hands raised
  const aOne = k => k > .001 ? { a1x: -1.15 * k, a1z: -.35 * k } : {};                                // one arm forward
  const aE = k => k > .001 ? { a0x: -1.5 * k, a1x: -1.5 * k, a0z: -.1 * k, a1z: .1 * k } : {};        // both arms held out in front: to give
  const aD = k => k > .001 ? { a0x: -1.0 * k, a1x: -1.0 * k, a0z: -.12 * k, a1z: .12 * k } : {};      // both hands down to the ground
  const lyA = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.3 * k, a1z: .3 * k } : {};          // lying: both hands open
  const lyP = k => k > .001 ? { a1x: -1.25 * k, a1z: .45 * k } : {};                                   // lying: one hand raised
  const nightF = t => .5 * ON(t, 54.0, 57.0, 59.6, 60.0);
""" + "\n" + PHA + "\n" + WIVKID + r"""  const ofc = person(rng(1690), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 1690 }, .44);
  const VQ = [[1700, '#8a6a4a', '#d8c9a8', '#a8714a', .42], [1701, '#6a7a5a', '#d4c8a8', '#c58c60', .43], [1702, '#a07850', '#d8ccb0', '#b98a62', .42], [1703, '#7a6a8a', '#d0c4a4', '#9a6a44', .43],
    [1704, '#8a5a4a', '#d8ccb0', '#c58c60', .42], [1705, '#5a7a8a', '#d4c8a8', '#a8714a', .43], [1706, '#9a8a5a', '#d8c9a8', '#b98a62', .42], [1707, '#7a5a3a', '#d0c4a4', '#9a6a44', .43]]
    .map(([sd, top, pants, skin, sc]) => person(rng(sd), { pants, top, skin, hair: '#2a1a10', beard: sd % 2 ? '#2a1a10' : null, sash: '#6a4a2a', seed: sd }, sc));
  g.add(ofc.group, ...VQ.map(o => o.group));
  // ---- the granary yard (east of the river), its sacks and heaps, and the field that is dry and then green
""" + FIELDS + r"""  pileM.forEach(m => m.scale.setScalar(1));
  // ---- the table and the balance by the granary, the sacks that change hands
  const TBL47 = [3.2, 1.72], OFP = [3.2, 2.12], TJ = [2.78, 1.72], GATE = [5.75, .35];
  const tblG = new THREE.Group(); { const b = new GB(rng(1691)), x = TBL47[0], z = TBL47[1], y = hC(x, z);
    b.box('#8a6a3a', [x, y + .2, z], [.5, .03, .3], [0, 0, 0], .004);
    for (const [dx, dz] of [[-.2, -.11], [.2, -.11], [-.2, .11], [.2, .11]]) b.box('#6a4a2a', [x + dx, y + .1, z + dz], [.03, .2, .03], [0, 0, 0], .003);
    b.box('#5a4028', [x - .1, y + .31, z], [.022, .2, .022], [0, 0, 0], .003); b.box('#7a5a38', [x - .1, y + .41, z], [.022, .022, .3], [0, 0, 0], .003);
    for (const dz of [-.13, .13]) { b.add(G.cyl6, '#c8b070', [x - .1, y + .33, z + dz], [.09, .012, .09], [0, 0, 0], .003); b.box('#7a5a38', [x - .1, y + .37, z + dz], [.01, .08, .01], [0, 0, 0], .002); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; tblG.add(m); g.add(tblG); }
  const mkSack = (col, s, sd) => { const b = new GB(rng(sd)); b.add(G.ico0, col, [0, .05 * s, 0], [.07 * s, .06 * s, .1 * s], [0, .3, 0], .004); b.box('#a8946a', [0, .11 * s, 0], [.035 * s, .02 * s, .035 * s], [0, 0, 0], .002);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
  const sBag = mkSack('#c9b890', 1.0, 1692); { const b = new GB(rng(1694)); for (let k = 0; k < 5; k++) b.add(G.cyl6, '#dfe3ea', [.1 + .035 * (k % 3), .015 * Math.floor(k / 3) + .004, -.03 + .05 * (k % 2)], [.022, .006, .022], [0, 0, 0], .001); sBag.add(new THREE.Mesh(b.build(), lam)); }
  sBag.position.set(TBL47[0] - .12, hC(TBL47[0], TBL47[1]) + .215, TBL47[1] + .02); sBag.visible = false; g.add(sBag);
  const grBag = mkSack('#d8c9a0', 1.2, 1695); grBag.position.set(TBL47[0] + .12, hC(TBL47[0], TBL47[1]) + .215, TBL47[1] - .04); grBag.visible = false; g.add(grBag);
  const seedBagJ = mkSack('#c8b88a', 1.0, 1696), seedBagF = mkSack('#c8b88a', 1.0, 1697);
  seedBagJ.scale.setScalar(2.3); seedBagJ.position.set(0, .5, .22); seedBagJ.visible = false; joL.group.add(seedBagJ);
  seedBagF.scale.setScalar(2.3); seedBagF.position.set(0, .5, .2); seedBagF.visible = false; VQ[2].group.add(seedBagF);
  // ---- Goshen: tents (more appear as the people grow, 47:27), Jacob's stool, the bed, the lamp
  const TENTS47 = [[-4.2, 2.7, 1.0, '#cdb48c', 0, 0], [-2.3, 2.5, .8, '#c2a67a', .3, 0], [-6.0, 3.7, .8, '#d4c29c', -.2, 0], [-1.4, 3.9, .75, '#b8946a', .2, 0],
    [-5.9, 5.2, .75, '#d9c8a4', .1, 42.0], [-3.2, 6.1, .75, '#cdb48c', -.25, 43.0], [-6.9, 2.0, .7, '#c2a67a', .4, 44.2]];
  const tentObjs = TENTS47.map(([x, z, s, c, ry, ap], i) => { const m = tentMesh(rng(1250 + i), c, s); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; m.castShadow = true; ca.add(m); return { m, ap }; });
  for (const [cx, cz, cr] of [[-3.8, 4.2, 4.4], [3.2, 3.5, 2.6], [3.7, 5.7, 2.2]]) for (let k = occ.length - 1; k >= 0; k--) { const p = occ[k].m.position; if (Math.hypot(p.x - cx, p.z - cz) < cr) { ca.remove(occ[k].m); occ.splice(k, 1); } }
  const JS = [-3.5, 3.45];
  const stoolG = new THREE.Group(); { const b = new GB(rng(1698)), y = hC(JS[0], JS[1]); b.box('#6a4a2a', [JS[0], y + .09, JS[1]], [.14, .03, .12], [0, 0, 0], .003); for (const [dx, dz] of [[-.05, -.04], [.05, -.04], [-.05, .04], [.05, .04]]) b.box('#5a3a20', [JS[0] + dx, y + .04, JS[1] + dz], [.02, .08, .02], [0, 0, 0], .002);
    b.box('#c8452e', [JS[0], y + .11, JS[1]], [.12, .012, .1], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; stoolG.add(m); stoolG.visible = false; g.add(stoolG); }
  const BED = [-4.2, 4.15];
  const bedG = new THREE.Group(); { const b = new GB(rng(1693)), x = BED[0], z = BED[1], y = hC(x, z);
    for (const [dx, dz] of [[-.36, -.15], [.36, -.15], [-.36, .15], [.36, .15]]) b.box('#6a4a2a', [x + dx, y + .045, z + dz], [.045, .09, .045], [0, 0, 0], .003);
    b.box('#7a5a38', [x, y + .1, z], [.82, .03, .36], [0, 0, 0], .004);
    b.box('#d9cdb0', [x, y + .13, z], [.78, .04, .32], [0, 0, 0], .006);
    b.box('#7a5a38', [x - .4, y + .2, z], [.03, .2, .38], [0, 0, 0], .004); b.box('#d8aa48', [x - .4, y + .3, z], [.036, .02, .4], [0, 0, 0], .002);
    b.box('#e8dcc0', [x - .3, y + .17, z], [.14, .04, .2], [0, 0, 0], .006);
    b.box('#b8452e', [x + .17, y + .2, z], [.34, .08, .35], [0, 0, 0], .006); b.box('#d8aa48', [x + .0, y + .2, z], [.015, .082, .352], [0, 0, 0], .002);
    // a low lamp stand behind the headboard
    const LX = x - .52, LZ = z - .12; b.box('#6a4a2a', [LX, y + .09, LZ], [.025, .18, .025], [0, 0, 0], .002); b.add(G.cyl6, '#8a6a3a', [LX, y + .19, LZ], [.06, .03, .06], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; bedG.add(m); g.add(bedG); }
  const LAMP = [BED[0] - .52, hC(BED[0], BED[1]) + .26, BED[1] - .12];
  const lampGl = spriteGlow(LAMP[0], LAMP[1], LAMP[2], .5, 0xffb060, 0), lampG2 = spriteGlow(LAMP[0], LAMP[1], LAMP[2], .14, 0xfff0c0, 0); g.add(lampGl, lampG2);
  const bedL = new THREE.PointLight(0xffa860, 0, 3.2, 1.5); bedL.position.set(LAMP[0] + .05, LAMP[1] + .08, LAMP[2] + .05);

  // ---- the court (47:1-10): Pharaoh on his seat in the portico, two guards, the five brothers, Joseph
  still(pha, TH, 0, 24.4, { y: () => .06, face: () => HE, ex: t => mixA({ lx: -.03 }, aO(.6 * ON(t, 6.9, 7.5, 9.2, 9.8)), aO(.45 * ON(t, 16.9, 17.4, 18.3, 18.8)), aF(.4 * ON(t, 14.9, 15.4, 16.5, 16.9))) });
  still(gu1, [-6.0, -1.55], 0, 24.4, { face: () => HE, ex: () => mixA({ lx: -.02 }) });
  still(gu2, [-6.0, .35], 0, 24.4, { face: () => HE, ex: () => mixA({ lx: -.02 }) });
  const BRS = [[-4.62, -1.65], [-4.5, -1.1], [-4.62, -.55], [-4.5, .0], [-4.62, .55]];
  BRS.forEach((p, i) => still(br[i], p, 0, 9.7, { face: () => HW, ex: t => mixA({ s: 1 - .05 * ON(t, .5, 1.1, 2.4, 3.0), lx: .09 * ON(t, .5, 1.1, 2.4, 3.0) }, aF(.5 * ON(t, .2, .8, 3.2, 3.6)), i === 2 ? aO(.85 * ON(t, 3.5, 3.9, 6.6, 7.0)) : aF(.3 * ON(t, 4.2, 4.8, 6.4, 6.9)), i === 3 ? aO(.5 * ON(t, 5.6, 6.0, 6.6, 7.0)) : {}) }));
  still(joL, [-5.25, .05], 0, 9.7, { face: () => toward(-5.25, .05, TH), ex: t => mixA({ lx: .02 }, aP(.7 * ON(t, .3, .8, 2.4, 3.0)), aF(.35 * ON(t, 3.4, 4.0, 6.8, 7.4)), aO(.5 * ON(t, 7.6, 8.1, 9.0, 9.7))) });
  // Joseph goes for his father and brings him in through the courtyard gate (47:7)
  const jcKeys = route(10.6, [-2.4, -1.15]).go(.7, [-3.9, -1.15]).go(.7, [-4.75, -.75]).wait(24.4).keys;
  act(jac, jcKeys, { sp: 6, show: W_(10.6, 24.4), face: (tt, q) => q.mv ? null : toward(q.x, q.z, TH), ex: tt => mixA({ lx: .06 + .03 * ON(tt, 18.9, 19.6, 23.5, 24.2) }, aU(.8 * ON(tt, 14.6, 15.2, 16.4, 16.9)), aF(.5 * ON(tt, 17.2, 17.8, 18.4, 18.8)), aO(.45 * ON(tt, 19.2, 19.8, 22.2, 23.0)), aF(.4 * ON(tt, 23.2, 23.7, 24.0, 24.4))) });
  const jsKeys0 = route(10.4, [-2.2, -.85]).go(.7, [-3.9, -.85]).go(.7, [-4.9, .15]).wait(24.4).keys;
  act(joL, jsKeys0, { sp: 6, show: W_(10.4, 24.4), face: (tt, q) => q.mv ? null : toward(q.x, q.z, TH), ex: tt => mixA({ lx: .02 }, aOne(.7 * ON(tt, 14.6, 15.0, 16.0, 16.8)), aF(.4 * ON(tt, 17.0, 17.6, 23.0, 24.0))) });

  // ---- Goshen: the family and the herd stand about the tents (47:6, 47:11); more come as they grow (47:27)
  const GW = [[-5.0, 3.4], [-3.1, 5.0], [-2.3, 3.2], [-6.2, 3.9]], GK = [[-4.7, 4.6], [-2.9, 3.6], [-1.9, 4.5], [-5.5, 4.4], [-6.1, 4.5]], GAP_W = [0, 0, 42.2, 43.4], GAP_K = [0, 0, 42.2, 43.4, 43.4];
  WIV.forEach((f, i) => still(f, GW[i], GAP_W[i], 49.8, { face: () => toward(GW[i][0], GW[i][1], [-3.6, 4.0]), ex: t => mixA({ s: Math.max(.001, smooth(GAP_W[i], GAP_W[i] + .8, t)) }, aF(.4 * ON(t, 2 + i, 3 + i, 8 + 4 * i, 9 + 4 * i))) }));
  KID.forEach((f, i) => still(f, GK[i], GAP_K[i], 49.8, { face: () => toward(GK[i][0], GK[i][1], [-3.6, 4.0]), ex: t => mixA({ s: Math.max(.001, smooth(GAP_K[i], GAP_K[i] + .8, t)) * (1 + .03 * Math.sin(t * 2 + i)) }) }));
  const GS = [[-1.9, 5.2, 0, HN], [-1.6, 6.0, 0, HW], [-2.4, 6.5, 0, HW], [-3.4, 6.0, 42.2, HE]];
  [5, 6, 7, 8].forEach((bi, i) => { const [x, z, ap, hd] = GS[i]; still(br[bi], [x, z], ap, 49.8, { face: () => hd, ex: t => mixA({ s: Math.max(.001, smooth(ap, ap + .8, t)) }, aF(.3 * ON(t, 3 + i, 4 + i, 8 + i, 9 + i))) }); });
  const SHP = [];
  [[-3.0, 7.0], [-2.6, 6.8], [-2.2, 7.0], [-2.9, 7.4], [-2.4, 7.4], [-2.0, 7.3], [-2.7, 7.7]].forEach((p, i) => { const s = makeSheep(rng(700 + i)); s.group.scale.setScalar(.6); g.add(s.group);
    const r = route(0, p); for (let k = 0; k < 8; k++) { const a = i * 1.7 + k * 2.1; r.go(.07, [p[0] + .25 * Math.cos(a), p[1] + .2 * Math.sin(a)]); r.wait(r.keys[r.keys.length - 1][0] + 3.5 + (i % 3)); }
    SHP.push({ s, keys: r.keys, i, sc: .6, ap: 0, show: null }); });
  [[-3.4, 6.9, 42.0], [-3.0, 7.3, 43.0], [-2.4, 7.5, 43.6], [-3.7, 6.5, 44.4]].forEach(([x, z, ap], i) => { const s = makeSheep(rng(720 + i)); g.add(s.group); const r = route(0, [x, z]); for (let k = 0; k < 8; k++) { const a = i * 2.3 + k * 1.9; r.go(.07, [x + .2 * Math.cos(a), z + .15 * Math.sin(a)]); r.wait(r.keys[r.keys.length - 1][0] + 3 + (i % 2)); }
    SHP.push({ s, keys: r.keys, i: i + 9, sc: .36, ap, show: null }); });
  // Jacob sits at the door of his tent (47:27-28)
  act(jac, [[0, JS[0], JS[1], 'L']], { show: W_(41.4, 49.95), face: () => HW, y: () => .08, ex: tt => mixA({ s: .8, lx: .05 }, aF(.4 * ON(tt, 44.0, 44.6, 48.0, 49.0)), aO(.3 * ON(tt, 45.0, 45.5, 46.2, 46.7))) });
  stoolG.visible = false;

  // ---- the famine (47:13-26): the queue at the table, silver, livestock, the field
  const QS = [[3.7, 1.72], [4.1, 1.55], [4.5, 1.78], [4.9, 1.6]], QV = [0, 1, 6, 7], PS = [[2.5, 4.95], [2.6, 5.45], [2.5, 5.95], [2.1, 6.2]], FK = [[3.0, 5.2], [3.0, 5.8]];
  // Joseph at the table (47:14), the clerk beside it; the queue comes in from the town gate on the east and waits on the dry ground north of the granary yard
  act(joL, route(24.4, TJ).wait(31.8).keys, { sp: 6, show: W_(24.4, 31.8), face: () => HE, ex: t => mixA({ lx: -.02 }, aOne(.6 * ON(t, 25.2, 25.7, 26.3, 26.8)), aE(.7 * ON(t, 28.0, 28.4, 29.0, 29.5)), aF(.3 * ON(t, 30.0, 30.4, 31.2, 31.6))) });
  still(ofc, OFP, 24.0, 31.9, { face: () => HN, ex: t => mixA({ lx: -.02 }, aF(.5 * ON(t, 26.4, 26.8, 27.4, 27.8)), aE(.5 * ON(t, 28.0, 28.4, 29.0, 29.5))) });
  // four people wait in the queue, pay, and later walk round the yard to the field (47:15-19, 47:25)
  QV.forEach((vi, i) => { const q = QS[i], f = VQ[vi], r = route(21.0 + .35 * i, [GATE[0], GATE[1] + .15 * i]).go(.62, [q[0] + .45, q[1] - .1]).go(.5, q).wait(28.8 + .3 * i).go(.75, [5.1, 2.35]).go(.75, [5.1, 4.55]).go(.75, [3.4, 4.55]).go(.75, PS[i]).wait(41.8);
    act(f, r.keys, { sp: 6, show: W_(20.9, 41.8), face: (tt, p) => p.mv ? null : (tt < 31 ? toward(p.x, p.z, TJ) : toward(p.x, p.z, [1.95, 5.5])),
      ex: tt => mixA({}, i === 0 ? aE(.85 * ON(tt, 26.0, 26.5, 27.1, 27.5)) : {}, aF(.3 * ON(tt, 24.6, 25.0, 25.6, 26.2)), aO(.8 * ON(tt, 38.4 + .15 * i, 38.9 + .15 * i, 40.6, 41.4))) }); });
  // two farmers stand on the dry field and kneel before Joseph (47:19, 47:25); one stands and is given seed
  [2, 3].forEach((vi, j) => { const f = VQ[vi], kn = tt => ON(tt, 31.9, 32.6, 34.0, 34.6);
    still(f, FK[j], 29.1, 41.8, { face: () => toward(FK[j][0], FK[j][1], [1.95, 5.5]),
      ex: tt => mixA({ s: 1 - .22 * kn(tt), lx: .16 * kn(tt) }, aD(.9 * kn(tt)), vi === 2 ? aE(.6 * ON(tt, 35.0, 35.4, 36.0, 36.6)) : {}, aO(.8 * ON(tt, 38.5 + .1 * j, 39.0 + .1 * j, 40.6, 41.4))) }); });
  // the livestock and the donkeys are led in from the gate (47:17)
  const LV = [[0, [5.8, .8]], [1, [6.0, .6]], [2, [5.7, 1.1]]], LD = [[4.0, .75], [4.4, .5], [4.2, 1.0]];
  LV.forEach(([k, p], j) => { const s = makeSheep(rng(740 + j)); s.group.scale.setScalar(.6); g.add(s.group); const r = route(0, p).wait(27.4 + .3 * j).go(.6, LD[j]).wait(33.5).go(.6, [5.8, .6]).wait(62);
    SHP.push({ s, keys: r.keys, i: 20 + j, sc: .6, ap: 0, show: t => t >= 27.3 && t < 36.0 }); });
  [0, 1].forEach(j => { const r = route(0, [6.1, .9 + .3 * j]).wait(27.4 + .4 * j).go(.58, [3.6 + 1.2 * j, .8 - .15 * j]).wait(34).go(.6, [5.9, .7]).wait(62); DKR.push({ d: dnk[j], keys: r.keys, show: t => t >= 27.4 && t < 36.0, face: null }); });
  [4, 5].forEach((vi, j) => { const r = route(27.4 + .3 * j, [5.75, .35 + .3 * j]).go(.6, [4.7 - .5 * j, 1.0 - .55 * j]).wait(33.6).go(.6, [5.75, .5]).wait(36.0).keys;
    act(VQ[vi], r, { sp: 6, show: W_(27.3, 36.0), face: (tt, p) => p.mv ? null : toward(p.x, p.z, TJ), ex: tt => mixA({}, aOne(.8 * ON(tt, 31.0, 31.5, 32.0, 32.6))) }); });
  // Joseph at the field edge: the land is bought for Pharaoh, the seed is given, the people are saved (47:20-25)
  const jfKeys = route(31.8, [1.95, 5.5]).wait(41.8).keys;
  act(joL, jfKeys, { sp: 6, show: W_(31.8, 41.8), face: (tt, p) => p.mv ? null : toward(p.x, p.z, [2.7, 5.5]), ex: tt => mixA({ lx: .02 }, aO(.8 * ON(tt, 32.6, 33.2, 33.8, 34.2)), aE(.8 * ON(tt, 34.0, 34.5, 35.2, 35.7)), aO(.5 * ON(tt, 36.3, 36.8, 37.6, 38.1)), aF(.35 * ON(tt, 38.4, 38.9, 40.6, 41.4))) });

  // ---- the bed (47:28-31): Jacob lies at the end of his life; Joseph kneels at his side and swears; Israel bows at the head of his bed
  const JBE = [BED[0] + .34, BED[1]], JBW = [BED[0] - .2, BED[1]];
  const jBed = route(49.8, JBE).wait(57.9).go(1.0, JBW).wait(62).keys;
  const lieB = tt => 1 - smooth(57.9, 58.7, tt);
  const aJb = act(jac, jBed, { sp: 6, show: W_(49.8, 62), face: () => HE, y: tt => .22 * lieB(tt) + .2 * (1 - lieB(tt)),
    ex: tt => { const lie = lieB(tt), bw = ON(tt, 58.6, 59.2, 59.8, 60.6);
      return mixA({ s: 1 - .26 * (1 - lie) * (1 - .0 * bw), lx: -1.5 * lie + .38 * bw }, lyA(lie * (.7 * ON(tt, 50.6, 51.1, 52.4, 52.9) + .9 * ON(tt, 53.0, 53.5, 55.4, 56.0))), lyP(lie * .9 * ON(tt, 54.0, 54.6, 55.6, 56.2)), aF(.9 * bw)); } });
  aJb.rid = true;
  const jsKeys = route(51.0, [-2.9, 5.7]).go(.55, [BED[0] + .12, 4.62]).wait(62).keys;
  act(joL, jsKeys, { sp: 6, show: W_(51.0, 62), face: (tt, p) => p.mv ? null : HN, ex: tt => { const kn = smooth(54.0, 54.7, tt), ok = ON(tt, 56.6, 57.1, 58.2, 58.7);
    return mixA({ s: 1 - .22 * kn, lx: .16 * kn }, aE(.5 * ON(tt, 54.8, 55.3, 56.2, 56.7)), ok > .001 ? { a1x: -2.3 * ok, a1z: .25 * ok } : {}); } });

"""
t = between(t, "  // ---- Genesis 46: the altar of Beersheba", "  function update(t, camera, sid) {", CHOREO)

# ---- update loop
t = rep(t, "['kneel', 'vision', 'promise', 'face', 'closeeyes', 'ride', 'wives', 'embrace', 'weep'].includes(sid)", "['asks', 'years', 'bless', 'dying', 'seed', 'saved', 'swear', 'silver'].includes(sid)")
t = rep(t, "[...br, ben, ...WIV, ...KID].forEach(f =>", "[...br, ben, ...WIV, ...KID, ...VQ, ofc, gu1, gu2].forEach(f =>")
t = between(t, "    WAGS.forEach((w, i) =>", "    // the star dome comes with the night and goes with the dawn", "")
t = between(t, "    // the star dome comes with the night and goes with the dawn", "    state.t = t;", r"""    // ---- Genesis 47
    thr.visible = t < 24.4;
    tentObjs.forEach(o => { const k = o.ap ? Math.max(.001, smooth(o.ap, o.ap + 1.0, t)) : 1; o.m.scale.setScalar(k); o.m.visible = k > .01; });
    stoolG.visible = t >= 41.4 && t < 49.95; bedG.visible = true;
    { const gk = smooth(34.6, 39.2, t); fLush.scale.y = Math.max(.001, gk); fLush.visible = gk > .02; fDry.visible = gk < .97; }
    sBag.visible = t >= 26.9 && t < 29.6; grBag.visible = t >= 28.2 && t < 29.9; seedBagJ.visible = t >= 33.9 && t < 35.4 && joL.group.visible; seedBagF.visible = t >= 35.3 && t < 41.8 && VQ[2].group.visible;
    // the evening lamp by Jacob's bed
    { const lk = smooth(51.5, 54.0, t) * (1 - smooth(59.7, 60.1, t)), fl = .9 + .07 * Math.sin(t * 13.1) + .04 * Math.sin(t * 23.7 + 1); bedL.intensity = 1.3 * lk * fl; lampGl.material.opacity = .5 * lk * fl; lampG2.material.opacity = .55 * lk * fl; lampGl.visible = lampG2.visible = lk > .01; }
    // the star dome comes with the dusk
    { const so = ON(t, 54.5, 57.5, 59.6, 60.0); stars.group.visible = so > .004; stars.update(t, so, .38, .6 + .0035 * t, cam || new THREE.Vector3()); }
    // dust over the granary yard in the famine
    dust.update(t, .8 * ON(t, 23.6, 24.6, 31.4, 32.4), [3.8, .3, 1.8]); dustR.update(t, 0, [8, .3, -5]);
    // the flock and the livestock
    SHP.forEach(o => { const p = kp(t, o.keys), hd = hdgAt(o.keys, t), grp = o.s.group, k = o.ap ? Math.max(.001, smooth(o.ap, o.ap + .8, t)) : 1, on = (o.show ? o.show(t) : true) && k > .01; grp.visible = on; if (!on) return;
      grp.scale.setScalar(o.sc * k); grp.position.set(p.x, gAt(p.x, p.z) - .02, p.z); grp.rotation.y = hd - Math.PI / 2; walkLegs(o.s.legs, t + o.i * .7, 7, p.mv ? .4 : 0); });
    bedL.visible = true;
""")

# ---- light
t = between(t, "  const light = [", "  const bg = [", r"""  const light = [Dk(0, ...PHAR), Dk(9.4, ...PHAR), Dk(9.9, ...MORN), Dk(12.4, ...MORN), Dk(12.9, ...PHAR), Dk(23.8, ...PHAR), Dk(24.6, ...HAZE), Dk(31.4, ...DRY), Dk(35.0, ...DRY), Dk(38.0, ...GOLD), Dk(41.0, ...GOLD), Dk(41.6, ...MORN), Dk(46.4, ...MORN), Dk(47.0, ...GOLD), Dk(49.6, ...GOLD), Dk(53.0, ...SUNSET), Dk(56.0, ...DUSK), Dk(59.6, ...DUSK), Dk(60.1, ...HAZE), Dk(90, ...HAZE)];
""")
t = between(t, "  const bg = [", "  return { group: g, update, light, bg, far, pl:", r"""  const bg = [[0, ['#7a98c0', '#f8dcb0']], [24.0, ['#7a98c0', '#f8dcb0']], [25.2, ['#9aa0b0', '#ecd0a8']], [31.4, ['#9aa0b0', '#ecd0a8']], [36.0, ['#6a8ec8', '#f8d4a0']], [46.4, ['#6a8ec8', '#f8d4a0']], [47.2, ['#5a86c4', '#f6c890']], [49.6, ['#5a86c4', '#f6c890']], [53.0, ['#3a56a4', '#f08a62']], [56.0, ['#141e4c', '#6a4a70']], [59.6, ['#141e4c', '#6a4a70']], [60.1, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
""")
t = rep(t, "pl: [prL, ...ptL, ...torchL, gateL, campL, altL, colLi], state };", "pl: [prL, ...ptL, ...torchL, gateL, campL, bedL], state };")

open(SRC + 'world47.js', 'w').write(t)
print('world47.js', len(t))
