#!/usr/bin/env python3
# Builds g11/src/world44.js from world43.js: the same country, house, courtyard and hall; new Genesis 44 props (courtyard lamps, silver cup, open sacks on the road, torn cloth),
# new choreography (the order, the departure, the steward who overtakes them, the search, the return, Judah before Joseph) and new night / dawn / hall light.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'world43.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)
def between(s, a, b, new):
    assert s.count(a) == 1, (s.count(a), a[:60]); i = s.index(a); j = s.index(b, i); return s[:i] + new + s[j:]

# ---- header
L = t.split('\n'); assert L[0].startswith('// Episode 43') and L[3].startswith("import * as THREE")
HDR = [
 "// Episode 44: Genesis 44 (NRSV-CE). Joseph orders his steward to fill the brothers' sacks and to put his silver cup in the youngest brother's sack (44:1-2); at dawn they are sent away; the steward overtakes them and accuses them (44:3-6); they answer: whoever has it will die and we will be slaves; he says: only he will be my slave (44:7-10);",
 "// the sacks are lowered and searched from the eldest to the youngest; the cup is found in Benjamin's sack; they tear their clothes and return to the city (44:11-13); they fall before Joseph; Judah: 'God has found out the guilt of your servants'; Joseph: only the one with the cup will be my slave, the rest go in peace (44:14-17); Judah steps forward (44:18) and speaks of his father (44:19-31), his pledge (44:32) and offers himself in the boy's place (44:33-34).",
 "// Cinematic interpretation: the lamp-lit courtyard at night (the chapter gives no hour for 44:1-2), who stands where, the road, the order in which the sacks lie, the hall of Joseph's house. Joseph is shown in fine linen with the gold chain of Genesis 41; Judah is the Judah of Genesis 38 (blue tunic, brown mantle)."]
t = '\n'.join(HDR + L[3:])

# ---- sky: night until 6.6, then dawn
t = between(t, "  const CLOUD = [", "  const colAt = ", "  const CLOUD = [[0, '#3a3e66'], [7.75, '#3a3e66'], [7.8, '#f0c898'], [28, '#f0d4a8'], [60, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];\n  const CEM = [[0, '#2a2a48'], [7.75, '#2a2a48'], [7.8, '#6a5448'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];\n")

# ---- props + choreography (replaces the whole Ep43 camp / hall / meal choreography)
CHOREO = r"""  // ---- Genesis 44 props: lamps in the courtyard (44:1-2, an evening), the silver cup (44:2, 44:12), open sacks on the road (44:11-12), scraps of torn cloth (44:13)
  const sv2 = person(rng(954), { pants: '#e8dcc0', top: '#d8ccb0', skin: '#9a6a44', hair: '#2a1a10', sash: '#8a6a3a', seed: 954 }, .42);
  const sv3 = person(rng(955), { pants: '#e8dcc0', top: '#c9b890', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 955 }, .42);
  g.add(sv2.group, sv3.group);
  const LAMPS = [[-4.3, -1.55], [-5.4, -.3], [-5.7, -1.75]];
  const lampMesh = (() => { const b = new GB(rng(1301)); for (const [x, z] of LAMPS) { const y = hC(x, z); b.box('#5a3a22', [x, y + .17, z], [.03, .34, .03], [0, 0, 0], .01); b.add(G.cyl6, '#8a5a2a', [x, y + .34, z], [.05, .03, .05], [0, 0, 0], .005); b.box('#c88a3a', [x, y + .375, z], [.03, .02, .03], [0, 0, 0], .003); } const m = meshOf(b); ca.add(m); return m; })();
  const lampG = LAMPS.map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .42, z, .36, 0xffa850, 0), s2 = spriteGlow(x, hC(x, z) + .4, z, .14, 0xfff0c0, 0); g.add(s, s2); return [s, s2]; });
  const CUP = (() => { const gr = new THREE.Group(), b = new GB(rng(1310)); b.add(G.cyl6, '#c8ced9', [0, 0, 0], [.036, .012, .036], [0, 0, 0], .002); b.add(G.cyl6, '#dfe4ee', [0, .012, 0], [.012, .05, .012], [0, 0, 0], .002); b.add(G.cylT, '#eef0f6', [0, .062, 0], [.04, .054, .04], [0, 0, 0], .003); b.add(G.cyl6, '#b8c0d0', [0, .114, 0], [.045, .006, .045], [0, 0, 0], .001);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); gr.visible = false; g.add(gr); return gr; })();
  const XE = k => -1.7 - .24 * k, XS = k => XE(k) - 1.9, OFF = k => k % 2 ? -.15 : -.05, SACKZ = k => roadZ(XE(k)) + .38;
  const SROAD = Array.from({ length: 11 }, (_, k) => { const s = mkSackSilver(false, 1330 + 2 * k); s.position.set(XE(k) + .03, gAt(XE(k), SACKZ(k)), SACKZ(k)); s.rotation.y = .5 * Math.sin(k * 2.3); return s; });
  const scraps = new THREE.Group(); { const b = new GB(rng(1340)), rr = rng(1341); for (let k = 0; k <= 10; k++) for (let j = 0; j < 3; j++) { const x = XE(k) + (rr() - .5) * .22, z = roadZ(XE(k)) + OFF(k) + .02 + rr() * .12; b.box(pk(rr, ['#d8ccb0', '#8a4a3a', '#4a6a8a', '#e0d4b8', '#6a7a4a']), [x, gAt(x, z) + .008, z], [.05 + rr() * .04, .004, .03 + rr() * .03], [0, rr() * 3, 0], .002); }
    scraps.add(new THREE.Mesh(b.build(), lam)); scraps.visible = false; g.add(scraps); }
  const aT = k => k > .001 ? { a0x: -1.2 * k, a1x: -1.2 * k, a0z: .5 * k, a1z: -.5 * k } : {};       // both hands at the chest: tearing the clothes
  const headingOf = (a, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null; return fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); };
  const heldAt = (a, fw, side, h, tt, y0 = 0) => { const p = kp(tt, a.keys), hd = headingOf(a, tt); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, gAt(p.x, p.z) + y0 + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
  // ---- the courtyard at night (44:1-2): Joseph gives the order; the sacks are filled; the steward puts the silver cup in the youngest brother's sack
  const CUPSTK = [-4.7, -1.85], JP = [-5.55, -1.12], SP0 = [-4.9, -1.12], ST = [-4.5, -1.72];
  const aJ = act(joL, [[0, JP[0], JP[1], 'L']], { show: W_(0, 7.8), face: t => aLerp(toward(JP[0], JP[1], SP0), toward(JP[0], JP[1], ST), smooth(2.8, 3.6, t)),
    ex: t => mixA(aP(.8 * ON(t, .9, 1.4, 2.2, 2.7)), aF(.3 * ON(t, 2.7, 3.1, 3.6, 4.0)), aO(.5 * ON(t, 4.6, 5.0, 6.0, 6.5)), { lx: .04 * ON(t, 2.4, 3.0, 4.2, 4.8) }) });
  const aSv = act(sv, route(0, SP0).wait(2.6).go(.7, ST).wait(7.9).keys, { sp: 6, show: W_(0, 7.8), face: (t, q) => q.mv ? null : (t < 2.6 ? toward(SP0[0], SP0[1], JP) : toward(ST[0], ST[1], CUPSTK)),
    ex: t => mixA(aF(.3 * ON(t, .3, .8, 2.0, 2.5)), { a1x: -1.0 * ON(t, 2.2, 2.7, 3.3, 3.6) }, { lx: .55 * ON(t, 4.1, 4.7, 5.1, 5.7) }, aF(.25 * ON(t, 5.8, 6.2, 7.4, 7.9))) });
  still(sv2, [-5.12, -1.62], 0, 7.8, { face: () => toward(-5.12, -1.62, [-4.95, -1.88]), ex: t => mixA({ lx: .5 * ON(t, .4, 1.0, 2.6, 3.2) }, aF(.2)) });
  still(sv3, [-4.35, -2.2], 0, 7.8, { face: () => toward(-4.35, -2.2, [-4.7, -1.9]), ex: t => mixA({ lx: .45 * ON(t, 1.0, 1.6, 3.0, 3.6) }, aF(.2)) });
  // ---- the road at dawn (44:3-13): the eleven sons and five donkeys leave; the steward overtakes them; the sacks are lowered and searched from the eldest to the youngest; the cup is found in Benjamin's sack; they tear their clothes and turn back
  const F44 = k => k === 10 ? ben : br[k];
  for (let k = 0; k <= 10; k++) { const f = F44(k), xe = XE(k), x0 = XS(k), off = OFF(k);
    const r = route(6.8, [x0, roadZ(x0) + off]).go(.42, [xe, roadZ(xe) + off]).wait(26.3).go(.5, [xe - 1.5, roadZ(xe - 1.5) + off]).wait(29.3);
    act(f, r.keys, { sp: 5, show: W_(6.8, 28.8), face: (t, q) => q.mv ? null : aLerp(Math.PI / 2, .12 * Math.sin(k * 2.3), smooth(19.4 + .03 * k, 20.1 + .03 * k, t)),
      ex: t => mixA(aO(.45 * ON(t, 14.6 + .05 * k, 15.2 + .05 * k, 16.4, 16.9) * (k % 2 ? 1 : .6)), aF(.3 * ON(t, 17.8, 18.3, 19.2, 19.6)), { lx: .4 * ON(t, 19.7 + .03 * k, 20.2 + .03 * k, 20.7 + .03 * k, 21.2 + .03 * k) },
        aT(ON(t, 24.8 + .03 * k, 25.2 + .03 * k, 26.0, 26.3)), { lx: .18 * ON(t, 24.8, 25.3, 25.9, 26.3) }) }); }
  [0, 1, 2, 3, 4].forEach(k => { const xe = -1.95 - .55 * k, x0 = xe - 1.9, off = -.38; DKR.push({ d: dnk[k], keys: route(6.8, [x0, roadZ(x0) + off]).go(.42, [xe, roadZ(xe) + off]).wait(26.3).go(.5, [xe - 1.5, roadZ(xe - 1.5) + off]).wait(29.3).keys, show: W_(6.8, 28.8) }); });
  const SRT = route(7.8, [-3.95, -1.0]).wait(8.0).go(1.7, [-3.2, -.95]).go(1.7, [-2.75, .9]).go(1.8, [-1.55, roadZ(-1.55) + .55]).go(1.5, [-1.05, roadZ(-1.05) + .1]).wait(20.9);
  for (let k = 0; k <= 10; k++) SRT.go(1.25, [XE(k) + .06, roadZ(XE(k)) + .15]);
  SRT.wait(25.0).go(1.0, [XE(10) - .35, roadZ(XE(10)) + .55]).wait(26.3).go(.5, [-6.2, roadZ(-6.2) + .55]).wait(29.3);
  const aSR = act(sv, SRT.keys, { sp: 8, show: W_(7.8, 28.8), face: (t, q) => q.mv ? null : (t < 20.9 ? -Math.PI / 2 : (t < 25.0 ? 0 : -Math.PI / 2)),
    ex: t => mixA(aP(.85 * ON(t, 11.9, 12.4, 13.4, 13.9)), aO(.45 * ON(t, 14.2, 14.7, 16.2, 16.8)), aP(.9 * ON(t, 17.9, 18.3, 19.2, 19.7)), { lx: .3 * ON(t, 21.0, 21.4, 22.9, 23.3) }, { a1x: -2.5 * ON(t, 23.3, 23.7, 25.0, 25.5), a1z: .3 * ON(t, 23.3, 23.7, 25.0, 25.5) }) });
  // ---- the hall (44:14-34): the brothers fall before Joseph; Judah speaks, then steps forward; Joseph on his seat
  const HP44 = [[-4.85, -1.35], [-4.85, -.65], [-4.85, -1.0], [-4.85, -.3], [-4.85, .05], [-4.4, -1.2], [-4.4, -.85], [-4.4, -.5], [-4.4, -.15], [-4.4, .2]], HB44 = [-4.85, .42], JU1 = [-5.4, -.68];
  const FALL = t => ON(t, 29.9, 30.5, 30.9, 31.5), KNEEL = t => ON(t, 30.9, 31.8, 56.0, 58.5);
  const lowHall = (t, i) => ({ lx: 1.0 * FALL(t) + .72 * KNEEL(t) + .05 * Math.sin(i * 2) * KNEEL(t) }), lowY = t => -.05 * FALL(t) - .07 * KNEEL(t);
  HP44.forEach((p, i) => { if (i === 1) return;
    act(br[i], route(28.8, [p[0] + 1.0, p[1]]).go(1.0, p).wait(62).keys, { sp: 6, show: W_(28.8, 62), face: (t, q) => q.mv ? null : -Math.PI / 2 + .12 * Math.sin(i * 2), y: t => lowY(t), ex: t => mixA(lowHall(t, i), aF(.2 * (1 - FALL(t)))) }); });
  const HJ = HP44[1];
  act(br[1], route(28.8, [HJ[0] + 1.0, HJ[1]]).go(1.0, HJ).wait(40.3).go(.55, JU1).wait(62).keys, { sp: 6, show: W_(28.8, 62), face: (t, q) => q.mv ? null : -Math.PI / 2 + .57 * ON(t, 41.8, 42.4, 56.8, 57.5),
    y: t => -.05 * FALL(t) - .07 * KNEEL(t) * (1 - smooth(40.2, 40.9, t)) - .07 * ON(t, 54.3, 55.1, 62, 63),
    ex: t => mixA({ lx: 1.0 * FALL(t) + .72 * KNEEL(t) * (1 - smooth(40.2, 40.9, t)) + .55 * ON(t, 54.3, 55.1, 62, 63) }, aO(.45 * ON(t, 31.9, 32.3, 33.0, 33.4)), aO(.55 * ON(t, 42.4, 43.0, 44.3, 44.8)), aO(.5 * ON(t, 45.0, 45.4, 46.0, 46.4)),
      aF(.85 * ON(t, 49.2, 49.8, 52.2, 52.9)), aO(.85 * ON(t, 54.5, 55.0, 56.3, 56.8)), aO(.5 * ON(t, 57.2, 57.7, 58.9, 59.4))) });
  act(ben, route(28.8, [HB44[0] + 1.0, HB44[1]]).go(1.0, HB44).wait(62).keys, { sp: 6, show: W_(28.8, 62), face: (t, q) => q.mv ? null : aLerp(-Math.PI / 2, toward(HB44[0], HB44[1], JU1), smooth(40.8, 41.6, t)), y: t => lowY(t), ex: t => mixA(lowHall(t, 11), aF(.25 * (1 - FALL(t)))) });
  still(joL, TH, 28.8, 62, { y: () => .06, face: t => aLerp(Math.PI / 2, toward(TH[0], TH[1], JU1), smooth(40.6, 41.4, t)),
    ex: t => mixA(aF(.3), aO(.5 * ON(t, 34.6, 35.0, 36.7, 37.1)), aO(.6 * ON(t, 37.4, 37.8, 38.5, 38.9)), { lx: .03 * ON(t, 42.0, 43.0, 52.0, 53.0) }, aF(.3 * ON(t, 55.0, 55.5, 61.0, 61.8))) });

"""
t = between(t, "  // ---- the camp (43:1-14)", "  function update(t, camera, sid) {", CHOREO)

# ---- update(): night factor, lamps, props
t = rep(t, "    SID = sid;\n", "    SID = sid;\n    const night = (sid === 'order' || sid === 'cup') ? 1 : 0, fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);\n")
t = rep(t, "{ const k = .42, cx = cam ? cam.x : 0", "{ const k = .42 * (1 - night), cx = cam ? cam.x : 0")
t = rep(t, "motes.update(t, .5, [1, .5, 2.5]);", "motes.update(t, .5 * (1 - .7 * night), [1, .5, 2.5]);")
t = rep(t, "{ water.material.color.setRGB(.36, .48, .62); water.material.emissive.setRGB(.18, .25, .31);", "{ water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));")
t = rep(t, "    townG.visible = true;\n", """    townG.visible = true;
    // the courtyard lamps (night shots only): a glow on each lamp and the three spare point lights of the town, moved to the courtyard
    lampG.forEach(([s, s2], i) => { s.material.opacity = .85 * night * (fl + .04 * i); s2.material.opacity = .9 * night * fl; s.visible = s2.visible = night > 0; });
    [torchL[0], torchL[1], campL].forEach((l, i) => { const [x, z] = LAMPS[i]; l.position.set(x, hC(x, z) + .62, z); l.distance = 4.2; l.intensity = 1.5 * night * (fl + .05 * i); });
""")
t = rep(t, "['judah', 'pledge', 'blame', 'prayer', 'order', 'fear', 'steward', 'simeon', 'gracious']", "['fall', 'guilt', 'verdict', 'step', 'father', 'promise', 'offer', 'joseph']")
NEWUPD = r"""    // ---- the props of Genesis 44
    ropeG.visible = false; giftsA.visible = silverA1.visible = silverA2.visible = giftsB.visible = basin.visible = tableG.visible = false; silverIn.visible = false; silverSp.visible = false;
    sackCourt.visible = t < 7.8; lampMesh.visible = t < 7.8;
    SROAD.forEach((s, k) => { const a0 = 20.4 + .05 * k, on = t >= a0 && t < 26.35; s.visible = on; if (on) s.scale.setScalar(.15 + .85 * smooth(a0, a0 + .45, t)); });
    scraps.visible = t >= 25.3 && t < 28.8;
    { let p = null;
      if (t >= 2.3 && t < 7.8) { const J = heldAt(aJ, .13, .05, .4, t), S1 = heldAt(aSv, .12, .06, .4, t), K1 = [CUPSTK[0], gAt(CUPSTK[0], CUPSTK[1]) + .1, CUPSTK[1]], a = smooth(3.0, 3.7, t), b = smooth(4.5, 5.2, t); p = [0, 1, 2].map(j => lerp(lerp(J[j], S1[j], a), K1[j], b)); }
      else if (t >= 20.4 && t < 26.4) { const k0 = [XE(10) + .03, gAt(XE(10), SACKZ(10)) + .15, SACKZ(10)], h = heldAt(aSR, .1, 0, .75, t), u = smooth(23.25, 23.75, t); p = [0, 1, 2].map(j => lerp(k0[j], h[j], u)); }
      else if (t >= 28.8 && t < 62) p = [-5.62, gAt(-5.62, -.3) + .02, -.3];
      CUP.visible = !!p; if (p) CUP.position.set(p[0], p[1], p[2]); glint.visible = !!p; if (p) { glint.position.set(p[0], p[1] + .11, p[2]); glint.material.opacity = .55 * (.7 + .3 * Math.sin(t * 9)); } }
    { const WIND = t >= 7.9 && t < 28.8; dust.update(t, WIND ? .9 : .15, [WIND ? 7 : 0, .3, WIND ? -5 : 0]); dustR.update(t, WIND ? .5 : 0, [8, .3, -5]); }
"""
t = between(t, "    // ---- the props of Genesis 43", "    state.t = t;", NEWUPD)

# ---- light, sky colours: night, dawn, morning, the golden hall
NEWLIGHT = r"""  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const NITE = ['#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14];
  const DAWN = ['#c0b4c0', '#6a5448', .95, '#ffc890', 2.4, [9, 2.6, -5], .5, '#ffcf9a', FD, 14];
  const MORN = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.5, [9, 3.4, -5], .5, '#ffcf9a', FD, 14];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const HAZE = ['#c8b8a8', '#6a5848', .98, '#ffd0a0', 2.1, [9, 3.6, -5], .5, '#e8c8a0', FD, 14];
  const light = [Dk(0, ...NITE), Dk(7.75, ...NITE), Dk(7.8, ...DAWN), Dk(12.4, ...MORN), Dk(27.5, ...MORN), Dk(29.0, ...GOLD), Dk(58.0, ...GOLD), Dk(59.6, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#0e1636', '#2a3466']], [7.75, ['#0e1636', '#2a3466']], [7.8, ['#6a8ec8', '#f8d4a0']], [27.5, ['#6a8ec8', '#f8d4a0']], [29.0, ['#5a86c4', '#f6c890']], [58.0, ['#5a86c4', '#f6c890']], [59.6, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
"""
t = between(t, "  const Dk = (t, hs", "  return { group: g", NEWLIGHT)
open(SRC + 'world44.js', 'w').write(t)
print('world44.js', len(t), 'bytes,', t.count('\n'), 'lines')
