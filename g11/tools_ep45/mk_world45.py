#!/usr/bin/env python3
# Builds g11/src/world45.js from world44.js: the same country, house, courtyard and Canaan camp; new Genesis 45 people (Pharaoh, three more attendants), props (Pharaoh's seat, two wagons)
# and new choreography (the attendants sent out, Joseph weeps and speaks, the brothers come closer, the embrace, Pharaoh's house, Canaan and the wagons) in daylight.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'world44.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)
def between(s, a, b, new):
    assert s.count(a) == 1, (s.count(a), a[:60]); i = s.index(a); j = s.index(b, i); return s[:i] + new + s[j:]

# ---- header
L = t.split('\n'); assert L[0].startswith('// Episode 44') and L[3].startswith("import * as THREE")
HDR = [
 "// Episode 45: Genesis 45 (NRSV-CE). Joseph can no longer control himself before all his attendants and cries out: send everyone away from me; no one stays with him when he makes himself known to his brothers (45:1); he weeps so loudly that the Egyptians hear it, and Pharaoh's household hears it (45:2);",
 "// he says: I am Joseph; is my father still alive? and his brothers cannot answer him (45:3); he says: come closer to me, I am your brother Joseph, whom you sold into Egypt (45:4); do not be distressed or angry with yourselves, God sent me before you to preserve life (45:5-8); go to my father and tell him to come to me, you shall live in the land of Goshen, near me (45:9-11);",
 "// he falls on Benjamin's neck and weeps, kisses all his brothers and weeps on them, and after that his brothers talk with him (45:14-15); the report reaches Pharaoh's house and Pharaoh and his servants are glad; Pharaoh tells Joseph to bring his father and households and he will give them the best of the land of Egypt (45:16-20); wagons and provisions are given (45:21-24);",
 "// they go up to Jacob in Canaan and say: Joseph is still alive and is ruler over all Egypt; his heart went numb, he did not believe them; when he saw the wagons Joseph had sent, the spirit of their father Jacob revived and Israel said: it is enough, I will go and see him before I die (45:25-28).",
 "// Cinematic interpretation: the courtyard of Joseph's house by day, who stands where, how the attendants leave, the embrace, Pharaoh's house shown on the same portico as in Genesis 41, the two wagons and the donkeys that draw them, and the Canaan camp of Genesis 42 and 43. The chapter gives no number of wagons and does not say who spoke to Jacob."]
t = '\n'.join(HDR + L[3:])

# ---- sky: all day
t = between(t, "  const CLOUD = [", "  const colAt = ", "  const CLOUD = [[0, '#f0d4a8'], [47, '#f0d4a8'], [60, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];\n  const CEM = [[0, '#6a5448'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];\n")

# ---- people, props and choreography (replaces the whole Ep44 night / road / hall choreography)
CHOREO = r"""  // ---- Genesis 45 people and props: three more attendants of the house, Pharaoh (45:16-20) with his seat, the two wagons Joseph sends (45:19-21, 45:27)
  const sv2 = person(rng(954), { pants: '#e8dcc0', top: '#d8ccb0', skin: '#9a6a44', hair: '#2a1a10', sash: '#8a6a3a', seed: 954 }, .42);
  const sv3 = person(rng(955), { pants: '#e8dcc0', top: '#c9b890', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 955 }, .42);
  const pha = person(rng(972), { pants: '#efe6d0', top: '#f2ead6', skin: '#b98a62', hair: '#1a1410', cloth: '#2e5a9a', mantle: '#c9a15a', sash: '#d8b048', seed: 972 }, .5);
  { const b = new GB(rng(973)); b.box('#d8aa48', [0, 1.1, 0], [.23, .05, .23], [0, 0, 0], .008); b.box('#e8c458', [0, 1.145, .115], [.03, .07, .03], [0, 0, 0], .004); b.box('#d8aa48', [0, 1.14, -.115], [.2, .04, .02], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pha.group.add(m); }
  g.add(sv2.group, sv3.group, pha.group);
  const thr = new THREE.Group(); { const b = new GB(rng(385)), x = -6.02, z = -.6, y = hC(x, z) + .03;
    b.box('#bfa87c', [x, y + .01, z], [.44, .02, .44], [0, 0, 0], .004); b.box('#8a6a3a', [x, y + .08, z], [.27, .12, .25], [0, 0, 0], .004); b.box('#2e5a9a', [x + .005, y + .15, z], [.25, .025, .23], [0, 0, 0], .003);
    b.box('#8a6a3a', [x - .115, y + .3, z], [.03, .3, .25], [0, 0, 0], .004); b.box('#d8aa48', [x - .118, y + .46, z], [.036, .028, .27], [0, 0, 0], .003); for (const dz of [-.115, .115]) b.box('#8a6a3a', [x, y + .2, z + dz], [.24, .03, .03], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; thr.add(m); thr.visible = false; g.add(thr); }
  const mkWagon = sd => { const gr = new THREE.Group(), b = new GB(rng(sd)), rr = rng(sd + 1);
    b.box('#8a6a44', [0, .2, 0], [.58, .035, .3], [0, 0, 0], .006);                                                  // the bed
    for (const sz of [-.15, .15]) b.box('#7a5a38', [0, .255, sz], [.58, .075, .022], [0, 0, 0], .004);               // the side boards
    for (const sx of [-.29, .29]) b.box('#7a5a38', [sx, .255, 0], [.022, .075, .3], [0, 0, 0], .004);
    for (const sx of [-.18, .18]) { b.box('#5a4028', [sx, .1, 0], [.03, .03, .4], [0, 0, 0], .003); for (const sz of [-.2, .2]) b.add(G.cyl6, '#6a4a2a', [sx, .1, sz - .015], [.1, .03, .1], [Math.PI / 2, 0, 0], .004); }   // axles and wheels
    for (const sz of [-.07, .07]) b.box('#7a5a38', [.5, .17, sz], [.46, .02, .02], [0, 0, 0], .003);                // the shafts to the donkey
    for (let k = 0; k < 7; k++) { const x = -.2 + (k % 4) * .13, z = k < 4 ? -.07 : .07, y = .24 + (k > 5 ? .09 : 0); b.add(G.ico0, pk(rr, ['#d8c9a0', '#c8b890', '#e0d4b4']), [x, y + .04, z], [.07, .06, .08], [0, rr() * 3, 0], .004); }   // sacks of provisions
    b.add(G.cylT, '#b87a4a', [.2, .235, .08], [.045, .1, .045], [0, 0, 0], .005); b.box('#c8452e', [-.05, .3, -.02], [.3, .03, .2], [0, 0, 0], .004);       // a jar and a folded red cloth
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); gr.visible = false; g.add(gr); return gr; };
  const WK = [[[-1.2, 1.15], [1.2, .95], [2.0, -.9], [2.4, -3.7]], [[-1.2, 1.15], [1.2, .95], [2.5, -.9], [3.0, -3.5]]], WV = .62, WARR = [58.3, 59.6];
  const WAGS = [0, 1].map(i => { const r = route(0, WK[i][0]); for (let j = 1; j < WK[i].length; j++) r.go(WV, WK[i][j]);
    const tt = r.keys[r.keys.length - 1][0], sh = WARR[i] - tt; r.keys.forEach(k => { k[0] += sh; }); return { gr: mkWagon(1400 + 2 * i), d: dnk[i], keys: r.keys, a: 54.0 + 1.3 * i }; });
  const HE = Math.PI / 2, HW = -Math.PI / 2;
  const aW = k => k > .001 ? { a1x: -1.3 * k, a1z: .25 * k } : {};                                     // one arm out, the hand turned in: come closer
  const aOne = k => k > .001 ? { a1x: -1.15 * k, a1z: -.35 * k } : {};                                // one arm forward, laid on a shoulder
  // ---- the courtyard of Joseph's house by day (45:1-15): Joseph and the brothers; the attendants are sent out
  const BP = [[-4.7, -1.5], [-4.7, -.8], [-4.8, -1.15], [-4.65, -.3], [-4.65, .1], [-4.25, -1.3], [-4.25, -.9], [-4.25, -.5], [-4.25, -.1], [-4.3, .3]], BNP = [-4.55, .5], JP0 = [-5.95, -.65], BC = [-4.5, -.6];
  const RING = i => { const a = .3 + i * TAU / 11; return [-5.0 + .55 * Math.cos(a), -.55 + .55 * Math.sin(a)]; };
  const aJ = act(joL, route(0, JP0).wait(8.2).go(.3, [-5.75, -.7]).wait(20.9).go(.25, [-5.5, -.75]).wait(33.9).go(.75, [-5.25, .42]).wait(37.0).go(.5, [-5.0, -.55]).wait(39.9).keys, { sp: 6, show: W_(0, 39.9),
    face: (t, q) => q.mv ? null : (t < 34 ? aLerp(toward(q.x, q.z, BC), HW + .3, ON(t, 3.6, 4.4, 7.6, 8.5)) : toward(q.x, q.z, [-4.9, .4])),
    ex: t => mixA({ s: 1 + .016 * Math.sin(t * 15) * ON(t, 4.5, 5.0, 7.4, 8.0) }, aW(0), { a1x: -1.2 * ON(t, 2.5, 3.0, 3.7, 4.2), a1z: .55 * ON(t, 2.5, 3.0, 3.7, 4.2) }, aF(.9 * ON(t, 4.4, 4.9, 7.5, 8.0)), { lx: .32 * ON(t, 4.3, 4.8, 7.4, 8.0) },
      aF(.7 * ON(t, 8.4, 8.9, 10.2, 10.8)), aW(ON(t, 14.9, 15.4, 16.0, 16.5)), aF(.6 * ON(t, 17.4, 17.9, 19.6, 20.2)), aO(.8 * ON(t, 21.0, 21.6, 23.2, 23.8)), aO(.5 * ON(t, 24.0, 24.5, 26.0, 26.6)), { lx: -.12 * ON(t, 23.6, 24.4, 26.2, 27.0) },
      aOne(.9 * ON(t, 27.5, 28.0, 29.4, 29.9)), aP(.95 * ON(t, 30.5, 31.0, 32.8, 33.4)), aF(.9 * ON(t, 35.5, 36.0, 36.8, 37.2)), { lx: .12 * ON(t, 35.4, 35.9, 36.9, 37.3) }, aO(.5 * ON(t, 38.0, 38.4, 39.2, 39.6))) });
  const jPos = t => { const p = kp(t, aJ.keys); return [p.x, p.z]; };
  const bro = i => i === 10 ? ben : br[i];
  for (let i = 0; i <= 10; i++) { const f = bro(i), p0 = i === 10 ? BNP : BP[i], d = .05 * i, pB = [p0[0] + .14, p0[1]], pC = i === 10 ? [-5.0, .45] : [p0[0] < -4.5 ? -5.1 : -4.78, p0[1]], pR = RING(i);
    const r = route(0, p0).wait(8.0 + d).go(.15, pB).wait(15.0 + d).go(.3, pC).wait(37.3 + .5 * d).go(.45, pR).wait(39.9);
    act(f, r.keys, { sp: 5, show: W_(0, 39.9), face: (t, q) => q.mv ? null : toward(q.x, q.z, jPos(t)),
      ex: t => mixA({ lx: .1 + .3 * ON(t, 9.0, 9.8, 14.6, 15.6) * (i === 1 ? 1.15 : 1) + .25 * ON(t, 17.4 + d, 18.2 + d, 20.4, 21.4) - .1 * smooth(24, 27, t) }, aF(.3 * (1 - smooth(21, 23, t))), aO(.4 * ON(t, 38.3 + .06 * i, 38.7 + .06 * i, 39.2 + .06 * i, 39.6 + .06 * i)), aF(.9 * (i === 10 ? ON(t, 35.5, 36.0, 36.8, 37.2) : 0)), { lx: .1 * (i === 10 ? ON(t, 35.4, 35.9, 36.9, 37.3) : 0) }) }); }
  // the attendants are sent out through the gate (45:1) and stop outside the wall, where the Egyptians hear him (45:2)
  const ATT = [[gu1, [-5.75, -1.7], 2.7], [sv, [-5.3, -.15], 2.9], [gu2, [-5.75, .5], 3.1], [sv2, [-5.2, -1.6], 3.3], [sv3, [-4.4, -2.1], 3.5]];
  const OUT = [[-2.85, -.55], [-2.55, -1.15], [-2.95, -1.55], [-2.35, -.35], [-2.7, .05]], OFFG = [-.12, .1, -.05, .12, 0];
  ATT.forEach(([f, p0, t0], i) => { const r = route(t0, p0).go(.9, [-3.95, -1.0 + OFFG[i]]).go(.9, [-3.45, -1.0 + OFFG[i]]).go(.75, OUT[i]).wait(9.6);
    act(f, r.keys, { sp: 7, show: W_(0, 9.6), face: (t, q) => q.mv ? null : (t < t0 ? toward(p0[0], p0[1], JP0) : toward(OUT[i][0], OUT[i][1], [-5.9, -.6])), ex: t => mixA(aF(.25 * (1 - smooth(t0 - .3, t0, t))), { lx: .1 * ON(t, 6.0 + .1 * i, 6.6 + .1 * i, 8.8, 9.4) }) }); });
  // ---- Pharaoh's house (45:16-20): the same portico as in Genesis 41; Pharaoh stands on his seat, Joseph before him, two guards at the sides
  still(pha, TH, 39.9, 47.3, { y: () => .06, face: () => HE, ex: t => mixA(aO(.45 * ON(t, 40.6, 41.2, 42.0, 42.6)), aO(.7 * ON(t, 44.0, 44.6, 46.0, 46.8)), { lx: -.03 }) });
  still(joL, [-5.35, -.6], 39.9, 47.3, { face: () => HW, ex: t => mixA(aF(.3), { lx: .08 * ON(t, 40.2, 41, 46, 47) }) });
  still(gu1, [-6.0, -1.55], 39.9, 47.3, { face: () => HE, ex: () => mixA(aF(.15)) }); still(gu2, [-6.0, .35], 39.9, 47.3, { face: () => HE, ex: () => mixA(aF(.15)) });
  // ---- Canaan (45:25-28): the brothers come to Jacob and tell him; he does not believe it; the wagons come up the road; he gets up
  const CJ = JAC;
  still(jac, CJ, 46.9, 62, { face: t => { let a = aLerp(0, 2.4, ON(t, 51.8, 52.8, 54.4, 55.0)); a = aLerp(a, toward(CJ[0], CJ[1], [2.0, -3.2]), smooth(54.6, 55.6, t)); return a; },
    ex: t => mixA({ lx: .2 * (1 - smooth(56.3, 57.6, t)) }, aO(.5 * ON(t, 49.8, 50.4, 51.4, 52.0)), aF(.4 * ON(t, 52.6, 53.2, 54.3, 54.8)), aO(.9 * ON(t, 55.6, 56.2, 57.0, 57.6)), aF(.6 * smooth(57.6, 58.4, t))) });
  for (let i = 0; i <= 10; i++) { const f = bro(i), ang = (i - 5) * .26, rr_ = 1.0 + .25 * (i % 2), slot = i === 1 ? [CJ[0] - .15, CJ[1] + .8] : [CJ[0] + Math.sin(ang) * rr_, CJ[1] + Math.cos(ang) * rr_], d = .1 * i;
    const r = route(46.9 + d, [slot[0], slot[1] + 1.7]).go(.5, slot).wait(62);
    act(f, r.keys, { sp: 5, show: W_(46.9, 62), face: (t, q) => q.mv ? null : (t > 54.8 && i !== 1 ? toward(q.x, q.z, [2.0, -3.2]) : toward(q.x, q.z, CJ)),
      ex: t => mixA({ lx: .06 }, aF(.3), i === 1 ? aP(.75 * ON(t, 49.4, 49.9, 50.8, 51.4)) : {}) }); }

"""
t = between(t, "  // ---- Genesis 44 props:", "  function update(t, camera, sid) {", CHOREO)

# ---- update(): daylight, no lamps, the props of Genesis 45
t = rep(t, "    const night = (sid === 'order' || sid === 'cup') ? 1 : 0, fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);\n", "    const night = 0;\n")
t = between(t, "    // the courtyard lamps (night shots only)", "    // the prison yard: its near walls", "")
t = rep(t, "['fall', 'guilt', 'verdict', 'step', 'father', 'promise', 'offer', 'joseph'].includes(sid)", "['weep', 'alive', 'silent', 'closer', 'sold', 'angry', 'ahead', 'goshen', 'road', 'embrace', 'talked', 'pharaoh'].includes(sid)")
t = rep(t, "[...br, ben, sv, gu1, gu2].forEach(f =>", "[...br, ben, sv, sv2, sv3, gu1, gu2].forEach(f =>")
NEWUPD = r"""    // ---- the props of Genesis 45
    ropeG.visible = false; giftsA.visible = silverA1.visible = silverA2.visible = giftsB.visible = basin.visible = tableG.visible = false; silverIn.visible = false; silverSp.visible = false; sackCourt.visible = false; glint.visible = false;
    thr.visible = t >= 39.9 && t < 47.3;
    WAGS.forEach((w, i) => { w.gr.visible = false; w.d.group.visible = false; if (!(t >= w.a && t < 62)) return; const p = kp(t, w.keys), hd = hdgAt(w.keys, t);
      w.d.group.visible = true; w.d.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); w.d.group.rotation.y = hd - Math.PI / 2; walkLegs(w.d.legs, t + i, 7, p.mv ? .4 : 0);
      const bx = p.x - Math.sin(hd) * .8, bz = p.z - Math.cos(hd) * .8; w.gr.visible = true; w.gr.position.set(bx, gAt(bx, bz) - .01, bz); w.gr.rotation.y = hd - Math.PI / 2; });
    { const CAN_ = t >= 46.9; dust.update(t, CAN_ ? .5 : .15, [CAN_ ? 3 : 0, .3, CAN_ ? -2 : 0]); dustR.update(t, 0, [8, .3, -5]); }
"""
t = between(t, "    // ---- the props of Genesis 44", "    state.t = t;", NEWUPD)

# ---- light, sky colours: golden courtyard, the bright dry light of Canaan, the haze of the reflection
NEWLIGHT = r"""  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const PHAR = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.6, [9, 3.0, -5], .5, '#ffcf9a', FD, 14];
  const DRY = ['#c8c0b0', '#6a5848', 1.0, '#ffe0b0', 2.8, [9, 3.6, -5], .5, '#ffe0b0', FD, 14];
  const HAZE = ['#c8b8a8', '#6a5848', .98, '#ffd0a0', 2.1, [9, 3.6, -5], .5, '#e8c8a0', FD, 14];
  const light = [Dk(0, ...GOLD), Dk(39.6, ...GOLD), Dk(40.2, ...PHAR), Dk(46.6, ...PHAR), Dk(47.2, ...DRY), Dk(58.0, ...DRY), Dk(59.6, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [39.6, ['#5a86c4', '#f6c890']], [40.2, ['#6a8ec8', '#f8d4a0']], [46.6, ['#6a8ec8', '#f8d4a0']], [47.2, ['#7a98c0', '#f8dcb0']], [58.0, ['#7a98c0', '#f8dcb0']], [59.6, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
"""
t = between(t, "  const Dk = (t, hs", "  return { group: g", NEWLIGHT)
open(SRC + 'world45.js', 'w').write(t)
print('world45.js', len(t), 'bytes,', t.count('\n'), 'lines')
