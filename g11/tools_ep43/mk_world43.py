#!/usr/bin/env python3
# Derives g11/src/world43.js (Genesis 43, Judah steps forward) from world42.js: island, terrain, river, town, house, courtyard, prison yard and Canaan camp are reused unchanged; the people keep their Ep42 designs except Judah (the Ep38 Judah, seed 990); new props are the gifts, the double silver at the camp, a washing basin and the meal table; the choreography, light and sky tables are new.
S = '/home/claude/g11/'
src = open(S + 'src/world42.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

M1 = "  // ---- the people. Joseph keeps the face and body of Genesis 37 to 41"
i1 = src.index(M1)
i2 = src.index("\n  let SID = '';")
i3 = src.index("\n  function update(t, camera, sid) {")
head, NEW3, NEW5 = src[:i1], src[i1:i2], src[i3:]

HDR = [
"// Episode 43: Genesis 43 (NRSV-CE). The famine is severe; Jacob tells his sons to go back to Egypt for food (43:1-2); Judah pledges himself for Benjamin: 'I will be responsible for him ... let me bear the blame forever' (43:8-9); Jacob agrees, sends a gift, double the silver and Benjamin, and prays: may God Almighty grant you mercy before the man (43:11-14);",
"// Joseph sees Benjamin with them and orders a meal (43:15-16); the brothers fear the silver found in their sacks; the steward says 'Peace to you, do not be afraid; your God ... has put treasure in your sacks', and brings Simeon out (43:17-23); Joseph comes home and the brothers bow; he sees Benjamin: 'God be gracious to you, my son' (43:26-29); he hurries out and weeps in a private room, washes his face, has the meal served, and Benjamin's portion is five times larger (43:30-34).",
"// Cinematic interpretation: the camp and who stands where, the gifts and sacks, the road, the hall and courtyard of Joseph's house, the prison gate, the meal table, the light. Joseph is shown in fine linen with the gold chain of Genesis 41; Judah is the Judah of Genesis 38 (blue tunic, brown mantle).",
]
L = head.split('\n')
assert L[3].startswith("import * as THREE"), L[:5]
head = '\n'.join(HDR + L[3:])
head = rep(head, "const CLOUD = [[0, '#ece0c8'], [10, '#ece0c8'], [11.5, '#f0d4a8'], [51, '#f0d4a8'], [53, '#ecdcc0'], [58, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];",
            "const CLOUD = [[0, '#ece0c8'], [24, '#ece0c8'], [26, '#f0d4a8'], [48, '#f0d4a8'], [50, '#d4d0cc'], [53, '#d4d0cc'], [55, '#ecd8b8'], [58, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];")

# ---- NEW3: Judah replaces the second brother (Genesis 38)
JUD = "  br[1] = person(rng(990), { pants: '#d9ccb0', top: '#3f5a7a', skin: '#b98a62', hair: '#2e1d10', beard: '#2e1d10', cloth: '#e8dcc0', mantle: '#7a4a2a', sash: '#6a3a1a', seed: 990 }, .46);   // Judah (the Judah of Genesis 38)\n"
NEW3 = rep(NEW3, "  const SIM = 3;\n", JUD + "  const SIM = 3;\n")
NEW3 = rep(NEW3, "  // ---- Joseph's gold chain (41:42) rides on the linen figure; the cords that bind Simeon (42:24) ride on Simeon", "  // ---- Joseph's gold chain (41:42) rides on the linen figure")
EXTRA3 = r"""
  // ---- Genesis 43 props: the gifts (43:11-15), the double silver at the camp (43:12-15), the washing basin (43:31), the meal table (43:32-34)
  const mkGifts = sd => { const gr = new THREE.Group(), b = new GB(rng(sd)), rr = rng(sd + 1);
    for (const [x, z, s, c] of [[0, 0, 1.0, '#b87a4a'], [.17, .06, .8, '#a8683c'], [-.16, .08, .9, '#c89a3a'], [.06, -.18, .8, '#b8723e'], [-.12, -.17, 1.0, '#a8683c'], [.3, -.14, .75, '#c89a3a']]) { b.add(G.cylT, c, [x, 0, z], [.068 * s, .15 * s, .068 * s], [0, 0, 0], .01); b.add(G.cyl6, '#a8683c', [x, .15 * s, z], [.036 * s, .035 * s, .036 * s], [0, 0, 0], .005); }
    b.box('#a8825a', [-.34, .04, .02], [.17, .08, .13], [0, .3, 0], .01);
    for (let k = 0; k < 9; k++) b.add(G.ico0, pk(rr, ['#c8a870', '#b89258', '#d4b680']), [-.34 + (rr() - .5) * .1, .09 + rr() * .02, .02 + (rr() - .5) * .08], [.03, .022, .03], [rr() * 3, rr() * 3, 0], .002);
    b.box('#d8c9a0', [0, .035, .3], [.2, .07, .1], [0, .2, 0], .01); b.box('#9a7a4a', [0, .075, .3], [.21, .012, .11], [0, .2, 0], .002);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); gr.visible = false; g.add(gr); return gr; };
  const GA = [2.45, -3.55], GB1 = [-5.0, -1.85];
  const giftsA = mkGifts(870), giftsB = mkGifts(871);
  giftsA.position.set(GA[0], hC(GA[0], GA[1]), GA[1]); giftsB.position.set(GB1[0], hC(GB1[0], GB1[1]), GB1[1]); giftsB.rotation.y = .5;
  const SA1 = [2.6, -3.0], SA2 = [2.9, -2.9];
  const silverA1 = mkSackSilver(false, 860), silverA2 = mkSackSilver(false, 862);
  silverA1.position.set(SA1[0], hC(SA1[0], SA1[1]), SA1[1]); silverA2.position.set(SA2[0], hC(SA2[0], SA2[1]), SA2[1]); silverA2.rotation.y = 1.1;
  const BASN = [-6.22, -1.62];
  const basin = new THREE.Group(); { const b = new GB(rng(880)); b.add(G.cyl6, '#a8946a', [0, 0, 0], [.05, .27, .05], [0, 0, 0], .005); b.add(G.cyl6, '#b8946a', [0, .27, 0], [.12, .055, .12], [0, 0, 0], .004); b.add(G.cyl6, '#8fb4cc', [0, .322, 0], [.1, .004, .1], [0, 0, 0], .001);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; basin.add(m); basin.position.set(BASN[0], hC(BASN[0], BASN[1]), BASN[1]); basin.visible = false; g.add(basin); }
  const TBL = [-4.62, -.62];
  const tableG = new THREE.Group(), platG = new THREE.Group();
  { const b = new GB(rng(890)), y0 = hC(TBL[0], TBL[1]);
    b.box('#8a6a44', [0, .2, 0], [1.7, .035, .5], [0, 0, 0], .006);
    for (const sx of [-.78, .78]) for (const sz of [-.2, .2]) b.box('#6a4e30', [sx, .1, sz], [.04, .2, .04], [0, 0, 0], .004);
    b.box('#e8dcc0', [0, .219, 0], [1.5, .004, .32], [0, 0, 0], .002);
    tableG.add(new THREE.Mesh(b.build(), lam));
    const b2 = new GB(rng(891)), rr = rng(892), top = .224;
    const plate = (x, z, r, big) => { b2.add(G.cyl6, '#e0d2b0', [x, top, z], [r, .012, r], [0, 0, 0], .002);
      const n = big ? 9 : 2; for (let k = 0; k < n; k++) { const a = rr() * TAU, d = big ? rr() * r * .6 : rr() * r * .3, h = big ? .022 + rr() * .05 : .014 + rr() * .012;
        b2.add(G.ico0, pk(rr, ['#a8683c', '#c8883e', '#8a5a2a', '#b4742e', '#c89a3a', '#6a8a4a']), [x + Math.cos(a) * d, top + .012 + h * .5 + (big ? rr() * .02 : 0), z + Math.sin(a) * d], [r * (big ? .4 : .5), h, r * (big ? .4 : .5)], [rr() * 3, rr() * 3, 0], .002); } };
    for (const x of [-.3, -.05, .2, .45, .7]) { plate(x, -.14, .065, false); plate(x, .14, .065, false); }
    plate(-.66, 0, .17, true);                                   // Benjamin's portion (43:34): about five times the size of the others
    platG.add(new THREE.Mesh(b2.build(), lam)); tableG.add(platG);
    tableG.position.set(TBL[0], y0, TBL[1]); tableG.visible = false; g.add(tableG); }
"""
NEW3 = NEW3 + EXTRA3

NEW4 = r"""
  let SID = '';
  const SH = (...w) => t => w.some(([a, b]) => t >= a && t < b);
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: Array.isArray(a) ? SH(...a) : W_(a, b), ...o });
  const roadZ = x => { for (let i = 0; i < PATH.length - 1; i++) { const a = PATH[i], b = PATH[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return x < PATH[0][0] ? PATH[0][1] : PATH[PATH.length - 1][1]; };
  const aLerp = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const TH = [-6.02, -.6], JAC = [3.6, -5.6], BEN = [3.15, -5.5], DOOR = [-6.4, -1.0], BASP = [-5.98, -1.62], SVG = [-4.05, -1.0], SPT = [-3.3, -3.0];
  const bow = (t, a, b, c, d, k = 1.0) => k * ON(t, a, b, c, d);
  const DKR = [];
  const D5 = k => [2.9 + .5 * k, -3.3 - .2 * (k % 2)];
  const LOAD = j => { const d = D5(j % 5); return j < 5 ? [d[0] - .3, d[1] + .22] : [d[0] + .3, d[1] + .5]; };
  // ---- the camp (43:1-14): Jacob, Benjamin beside him, the sons before him; Judah steps out (43:8-9); the sons load gifts and double silver (43:11-12); Jacob prays with Benjamin before him (43:14)
  still(jac, JAC, 0, 24.8, { face: () => 0, ex: t => mixA(aP(.9 * ON(t, 3.3, 3.8, 5.2, 5.7)), { lx: .04 * ON(t, 8.0, 8.8, 15.0, 15.8) }, aO(.5 * ON(t, 12.8, 13.3, 14.2, 14.7)), aP(.7 * ON(t, 17.8, 18.3, 19.5, 20.0)), aO(.6 * ON(t, 21.7, 22.3, 24.0, 24.6)), { lx: .06 * ON(t, 21.6, 22.2, 24.0, 24.6) }) });
  still(ben, BEN, 0, 20.5, { face: () => 1.75, ex: t => mixA({ lx: .05 * ON(t, 8.0, 9.0, 15.0, 16.0) }) });
  still(ben, [3.6, -4.95], 20.5, 24.8, { face: () => Math.PI, ex: t => mixA(aF(.5 * ON(t, 21.5, 22.1, 24.0, 24.6)), { lx: .12 * ON(t, 21.6, 22.2, 24.0, 24.6) }) });
  const ARC = [[2.75, -4.6], [3.15, -4.6], [3.55, -4.55], [3.95, -4.6], [4.35, -4.6], [2.95, -4.15], [3.35, -4.15], [3.75, -4.1], [4.15, -4.15], [4.55, -4.15]];
  let jn = 1;
  br.forEach((f, i) => { const p = ARC[i];
    if (i === 1) { const r = route(0, p).wait(6.5).go(.55, [3.4, -5.0]).wait(17.1).go(.8, LOAD(0)).wait(24.8);
      act(f, r.keys, { sp: 6, show: W_(0, 24.8), face: (t, q) => q.mv ? null : (t < 17.5 ? toward(q.x, q.z, JAC) : -Math.PI / 2),
        ex: t => mixA(aF(.3 * ON(t, 3.2, 3.7, 4.8, 5.2)), aO(.5 * ON(t, 8.9, 9.4, 10.4, 10.9)), aF(.45 * ON(t, 10.9, 11.4, 12.5, 13.0)), { lx: .1 * ON(t, 13.3, 13.9, 15.3, 16.0) }, aO(.35 * ON(t, 14.2, 14.6, 15.2, 15.6)), { lx: .22 * ON(t, 19.2, 19.7, 20.4, 20.9) }) });
      return; }
    const q = LOAD(jn++), r = route(0, p).wait(16.4 + .12 * i).go(.8, q).wait(24.8);
    act(f, r.keys, { sp: 6, show: W_(0, 24.8), face: (t, s) => s.mv ? null : (t < 16.4 ? toward(s.x, s.z, JAC) : -Math.PI / 2 + .25 * Math.sin(i)),
      ex: t => mixA(aF(.25 * ON(t, 3.0, 3.5, 4.8, 5.2)), { lx: .06 * ON(t, 9.0, 9.8, 15.2, 15.8) }, { lx: .22 * ON(t, 19.0 + .12 * i, 19.5 + .12 * i, 20.2 + .1 * i, 20.8 + .1 * i) }, aO(.35 * ON(t, 21.0 + .1 * i, 21.5, 23.0, 23.6))) }); });
  [0, 1, 2, 3, 4].forEach(k => { const p = D5(k); DKR.push({ d: dnk[k], keys: [[0, p[0], p[1], 'L']], show: W_(0, 24.8), face: -1.55 + .1 * k }); });
  // ---- the road, west towards the house (43:15): the ten and Benjamin with the donkeys
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(k => { const x0 = 1.3 + .3 * k, off = k % 2 ? -.12 : -.02, f = k === 5 ? ben : br[k < 5 ? k : k - 1];
    act(f, route(24.8, [x0, roadZ(x0) + off]).go(.55, [x0 - 1.1, roadZ(x0 - 1.1) + off]).wait(26.4).keys, { sp: 6, show: W_(24.8, 26.35), ex: () => mixA(aF(.15)) }); });
  [0, 1, 2, 3, 4].forEach(k => { const x0 = 1.6 + .6 * k, off = .13; DKR.push({ d: dnk[k], keys: route(24.8, [x0, roadZ(x0) + off]).go(.55, [x0 - 1.1, roadZ(x0 - 1.1) + off]).wait(26.4).keys, show: W_(24.8, 26.35) }); });
  // ---- the hall (43:15-16): Joseph on his seat sees Benjamin among them and orders the meal; the steward receives the order
  const HP1 = { 0: [-5.05, -1.3], 1: [-5.05, -.95], 2: [-5.05, -.6], 4: [-5.05, -.25], 5: [-5.05, .1], 6: [-4.6, -1.15], 7: [-4.6, -.8], 8: [-4.6, -.45], 9: [-4.6, -.1] }, HB1 = [-5.38, -.12];
  still(joL, TH, 26.35, 31.3, { y: () => .06, face: t => aLerp(Math.PI / 2, toward(TH[0], TH[1], HB1), smooth(26.6, 27.4, t)), ex: t => mixA(aF(.35), aP(.8 * ON(t, 29.2, 29.7, 30.4, 30.9)), { lx: .04 * ON(t, 26.8, 27.5, 28.6, 29.2) }) });
  still(sv, [-5.75, -1.1], 28.4, 31.3, { face: () => toward(-5.75, -1.1, TH), ex: t => mixA({ lx: .15 * ON(t, 29.8, 30.4, 30.8, 31.2) }, aF(.3 * ON(t, 28.6, 29.0, 29.5, 29.9))) });
  still(ben, HB1, 26.35, 31.3, { face: () => aLerp(-Math.PI / 2, toward(HB1[0], HB1[1], TH), 1), ex: t => mixA(aF(.4), { lx: .05 }) });
  Object.entries(HP1).forEach(([k, p]) => { const i = +k; still(br[i], p, 26.35, 31.3, { face: () => -Math.PI / 2 + .15 * Math.sin(i * 2), ex: t => mixA(aF(.25), { lx: .08 * ON(t, 27.6, 28.2, 30.6, 31.2) * (i % 2) }) }); });
  // ---- the gate of the courtyard (43:17-23): the brothers afraid of the silver; the steward speaks to them; Simeon comes out of the prison
  const SL = [[-3.38, -1.45], [-3.38, -1.15], [-3.38, -.85], [-3.38, -.55], [-3.0, -1.3], [-3.0, -1.0], [-3.0, -.7], [-3.0, -.4], [-2.65, -1.15], [-2.65, -.8]];
  [0, 1, 2, 'B', 4, 5, 6, 7, 8, 9].forEach((w, n) => { const f = w === 'B' ? ben : br[w], p = SL[n];
    still(f, p, 31.3, 41.95, { face: t => aLerp(aLerp(toward(p[0], p[1], SVG) + .45 * Math.sin(t * .9 + n * 2.1) * (1 - smooth(34.8, 35.4, t)), toward(p[0], p[1], SVG), smooth(34.8, 35.4, t)), toward(p[0], p[1], SPT), smooth(39.9, 40.6, t)),
      ex: t => mixA(aF(.45 * (1 - smooth(35.2, 35.8, t)) + .2), { lx: .06 * ON(t, 31.6, 32.4, 34.4, 35.2) * (n % 2 ? 1 : 0), a0x: n === 1 ? -.9 * ON(t, 32.6, 33.2, 34.2, 34.8) : 0 }) }); });
  still(sv, SVG, 31.3, 39.8, { face: () => Math.PI / 2, ex: t => mixA(aO(.7 * ON(t, 35.5, 36.0, 37.2, 37.6)), aP(.75 * ON(t, 37.7, 38.1, 38.9, 39.3)), { lx: .05 * ON(t, 35.5, 36.2, 38.5, 39.2) }) });
  act(br[SIM], route(38.6, [-3.3, -4.4]).go(.5, [-3.3, -3.65]).go(.55, [-3.3, -3.0]).wait(41.95).keys, { sp: 6, show: W_(38.6, 41.95), face: (t, q) => q.mv ? null : Math.PI, ex: () => mixA(aF(.15)) });
  still(gu1, [-3.57, -3.45], 38.4, 42.0, { face: () => 0 }); still(gu2, [-3.03, -3.45], 38.4, 42.0, { face: () => 0 });
  // ---- Joseph comes home (43:26-29): the brothers bow with the gift; he sees Benjamin and says 'God be gracious to you, my son'
  const HP2 = { 0: [-5.05, -1.3], 1: [-5.05, -.95], 2: [-5.05, -.6], 3: [-5.05, -.25], 4: [-5.05, .1], 5: [-4.6, -1.15], 6: [-4.6, -.8], 7: [-4.6, -.45], 8: [-4.6, -.1], 9: [-4.6, .25] }, HB2 = [-5.38, -.12], JB = [-5.72, -.42];
  const JR = route(41.9, DOOR).go(.5, TH).wait(45.3).go(.6, JB).wait(47.9).go(.95, DOOR).wait(53.1).go(.9, BASP).wait(56.1).go(.8, TH).wait(61.9);
  act(joL, JR.keys, { sp: 6, show: W_(41.9, 61.9), y: t => (Math.hypot(kp(t, JR.keys).x - TH[0], kp(t, JR.keys).z - TH[1]) < .05) ? .06 : 0,
    face: (t, q) => q.mv ? null : (t < 45.4 ? Math.PI / 2 : t < 48.0 ? toward(q.x, q.z, HB2) : t < 49.2 ? -Math.PI / 2 : t < 53.1 ? -Math.PI / 2 + Math.PI * smooth(49.2, 50.2, t) : t < 56.2 ? -Math.PI / 2 : Math.PI / 2),
    ex: t => mixA(aF(.3 * ON(t, 43.0, 43.5, 45.0, 45.4)), aO(.5 * ON(t, 46.1, 46.5, 47.4, 47.8)),
      { a0x: -2.3 * ON(t, 49.4, 50.0, 52.8, 53.4), a0z: .25 * ON(t, 49.4, 50.0, 52.8, 53.4) }, { lx: (.08 + .012 * Math.sin(t * 9)) * ON(t, 49.4, 50.0, 52.8, 53.4) },
      { a0x: -1.0 * ON(t, 54.6, 55.0, 55.4, 55.7), a1x: -1.0 * ON(t, 54.6, 55.0, 55.4, 55.7), lx: .5 * ON(t, 54.5, 55.0, 55.9, 56.3) },
      { a0x: -2.2 * ON(t, 55.5, 55.8, 56.0, 56.4), a1x: -2.2 * ON(t, 55.5, 55.8, 56.0, 56.4), a0z: .3 * ON(t, 55.5, 55.8, 56.0, 56.4), a1z: -.3 * ON(t, 55.5, 55.8, 56.0, 56.4) },
      aF(.3 * ON(t, 57.6, 58.0, 61.0, 61.8))) });
  still(ben, HB2, 41.95, 51.2, { face: t => aLerp(-Math.PI / 2, toward(HB2[0], HB2[1], t < 47.9 ? JB : DOOR), smooth(45.6, 46.2, t)), ex: t => mixA(aF(.3), { lx: .1 * ON(t, 46.2, 46.8, 49.0, 50.0) }) });
  Object.entries(HP2).forEach(([k, p]) => { const i = +k; still(br[i], p, 41.95, 51.2, { face: () => -Math.PI / 2 + .1 * Math.sin(i * 2),
    y: t => -.1 * bow(t, 43.1, 43.7, 45.0, 45.6), ex: t => mixA({ lx: 1.1 * bow(t, 43.1, 43.7, 45.0, 45.6) }, aF(.25), { lx: .1 * ON(t, 48.4, 49.0, 50.6, 51.1) * (i % 2) }) }); });
  // ---- the meal (43:31-34): the ten around the table, Benjamin at the head, his portion five times larger
  const TB = { 0: [-4.92, -.96], 2: [-4.67, -.96], 4: [-4.42, -.96], 6: [-4.17, -.96], 8: [-3.92, -.96], 1: [-4.92, -.28], 3: [-4.67, -.28], 5: [-4.42, -.28], 7: [-4.17, -.28], 9: [-3.92, -.28] }, BT = [-5.58, -.62];
  Object.entries(TB).forEach(([k, p]) => { const i = +k, tf = p[1] < -.62 ? 0 : Math.PI; still(br[i], p, 56.85, 61.9, { face: t => aLerp(tf, toward(p[0], p[1], BT), .55 * smooth(58.0, 58.6, t)), ex: t => mixA(aF(.2), aO(.3 * ON(t, 58.6 + .08 * i, 59.0, 60.2, 60.7))) }); });
  still(ben, BT, 56.85, 61.9, { face: () => Math.PI / 2, ex: t => mixA(aF(.35 * ON(t, 58.0, 58.5, 61.0, 61.8)), { lx: .08 * ON(t, 58.2, 58.8, 61.0, 61.8) }) });
"""

# ---- NEW5: derived from the Ep42 update with the Ep43 props and tables
i4 = NEW5.index("    { const ONLY = {")
j4 = NEW5.index("\n", i4)
NEW5 = NEW5[:i4] + NEW5[j4 + 1:]
NEW5 = rep(NEW5, "['knew', 'spies', 'fear', 'wept', 'bound', 'whisper', 'anguish', 'cell']", "['judah', 'pledge', 'blame', 'prayer', 'order', 'fear', 'steward', 'simeon', 'gracious']")
NEW5 = rep(NEW5, "[...br, gu1, gu2].forEach(f => {", "[...br, ben, sv, gu1, gu2].forEach(f => {")
a5 = NEW5.index("    // ---- Simeon's cords (42:24); the silver (42:25, 42:27)")
b5 = NEW5.index("    dust.update(")
PROPS = r"""    // ---- the props of Genesis 43: the gifts and double silver at the camp, the sacks and silver at the gate, the gifts at the hall, the basin, the meal table
    ropeG.visible = false;
    giftsA.visible = t >= 16.2 && t < 24.8; silverA1.visible = silverA2.visible = t >= 16.2 && t < 24.8; giftsB.visible = t >= 41.9 && t < 51.3; basin.visible = t >= 52.8 && t < 61.9;
    { const k = smooth(56.9, 57.8, t); tableG.visible = t >= 56.85 && t < 61.9; platG.scale.setScalar(Math.max(.01, k)); platG.visible = k > .02; }
    sackCourt.visible = t >= 31.3 && t < 41.95;
    { const on = t >= 31.3 && t < 39.8; silverIn.visible = on; silverIn.position.set(-3.5, gAt(-3.5, -.3), -.3); silverIn.scale.setScalar(1); silverIn.children[0].visible = true; silverSp.visible = false; }
    { const on = t >= 31.3 && t < 39.8; glint.visible = on; if (on) { glint.position.set(-3.5, gAt(-3.5, -.3) + .17, -.3); glint.material.opacity = .5 * (.7 + .3 * Math.sin(t * 9)); } }
"""
NEW5 = NEW5[:a5] + PROPS + NEW5[b5:]
NEW5 = rep(NEW5, "dust.update(t, (t < 9 || t > 52.6) ? .9 : .15, [t < 9 || t > 52.6 ? 7 : 0, .3, t < 9 || t > 52.6 ? -5 : 0]); dustR.update(t, t < 9 ? .5 : 0, [8, .3, -5]);",
                 "dust.update(t, t < 26.4 ? .9 : .15, [t < 26.4 ? 7 : 0, .3, t < 26.4 ? -5 : 0]); dustR.update(t, t < 26.4 ? .5 : 0, [8, .3, -5]);")
k5 = NEW5.index("  const light = [")
l5 = NEW5.index("  return { group: g, update, light, bg, far")
TABLES = r"""  const light = [Dk(0, ...DRY), Dk(24.4, ...DRY), Dk(25.2, ...MORN), Dk(31.0, ...MORN), Dk(31.8, ...HAZE), Dk(35.0, ...HAZE), Dk(35.8, ...MORN), Dk(41.6, ...MORN), Dk(42.4, ...GOLD), Dk(48.4, ...GOLD), Dk(49.2, ...COOL), Dk(53.0, ...COOL), Dk(54.0, ...GOLD), Dk(58.0, ...GOLD), Dk(59.6, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#a8b8d0', '#f6e8cc']], [24.4, ['#a8b8d0', '#f6e8cc']], [25.2, ['#6a8ec8', '#f8d4a0']], [31.0, ['#6a8ec8', '#f8d4a0']], [31.8, ['#9ab0c8', '#ecdcc0']], [35.0, ['#9ab0c8', '#ecdcc0']], [35.8, ['#6a8ec8', '#f8d4a0']], [41.6, ['#6a8ec8', '#f8d4a0']], [42.4, ['#5a86c4', '#f6c890']], [48.4, ['#5a86c4', '#f6c890']], [49.2, ['#7a8ab8', '#e8d0b0']], [53.0, ['#7a8ab8', '#e8d0b0']], [54.0, ['#8a98b8', '#f0c898']], [58.0, ['#8a98b8', '#f0c898']], [59.6, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
"""
NEW5 = NEW5[:k5] + TABLES + NEW5[l5:]
out = head + NEW3 + NEW4 + NEW5
# Ep43: keep the camp's dialogue shots (filmed from the east) free of big foreground stones; the six rr() calls the stone would use are still consumed so the others stay where they were
# the brothers' sacks stand to the north of the steward, not right behind him (from the east they looked like wings on his shoulders)
out = rep(out, "sackStack(b, -4.85, -1.35); sackStack(b, -5.0, -1.05, .4); sackB(b, -4.7, hC(-4.7, -1.2), -1.2, .8);",
          "sackStack(b, -4.85, -1.95); sackStack(b, -5.0, -1.75, .4); sackB(b, -4.7, hC(-4.7, -1.85), -1.85, .8);")
out = rep(out, "if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; b.add(G.ico0, pk(R, ['#9a8e7c'",
          "if (hC(x, z) < .12 || dPath(x, z) < .6 || keepOut(x, z)) continue; if (x > 4.0 && Math.abs(z + 5.3) < 1.6) { for (let q = 0; q < 6; q++) R(); continue; } b.add(G.ico0, pk(R, ['#9a8e7c'")
out = rep(out, "z = CAN[1] + Math.sin(a) * d; if (hC(x, z) < .15) continue; b.add(G.ico0, pk(rr, ['#9a8e7c'",
          "z = CAN[1] + Math.sin(a) * d; if (hC(x, z) < .15) continue; if (x > 4.2 && Math.abs(z + 5.3) < 1.3) { for (let q = 0; q < 6; q++) rr(); continue; } b.add(G.ico0, pk(rr, ['#9a8e7c'")
open(S + 'src/world43.js', 'w').write(out)
print('world43.js', len(out))
