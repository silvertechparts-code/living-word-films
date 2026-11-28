#!/usr/bin/env python3
# Builds g11/src/world46.js from world45.js: the same floating country (Canaan camp in the east, the ford, the road west, Joseph's house and courtyard in the west).
# New for Genesis 46 (NRSV-CE): the altar and its fire at Beersheba (46:1), the night, the stars and the column of light (46:2-4), the family, the two wagons, the pack donkeys and the herd (46:5-7),
# Judah sent ahead (46:28), Joseph's chariot and the meeting in Goshen (46:29-30), all by day or by night as the chapter has it.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'world45.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)
def between(s, a, b, new):
    assert s.count(a) == 1, (s.count(a), a[:60]); i = s.index(a); j = s.index(b, i); return s[:i] + new + s[j:]

# ---- header
L = t.split('\n'); assert L[0].startswith('// Episode 45') and L[5].startswith("import * as THREE")
HDR = [
 "// Episode 46: Genesis 46 (NRSV-CE). Israel sets out with all that is his and comes to Beersheba, where he offers sacrifices to the God of his father Isaac (46:1); God speaks to him in visions of the night: Jacob, Jacob; he answers: here I am (46:2);",
 "// God says: I am God, the God of your father; do not be afraid to go down to Egypt, for I will make you a great nation there; I myself will go down with you and I will also bring you up again, and Joseph's hand shall close your eyes (46:3-4);",
 "// Jacob sets out from Beersheba; his sons carry him, their little ones and their wives in the wagons Pharaoh had sent (46:5); the chapter lists the sons and grandsons who came with him, seventy persons in all (46:8-27); he sends Judah ahead to Joseph to prepare the way to Goshen (46:28);",
 "// Joseph has his chariot made ready and goes up to meet his father Israel in Goshen; he presents himself to him, falls on his neck and weeps on his neck a good while; Israel says: now I can die, since I have seen for myself that you are still alive (46:29-30).",
 "// Cinematic interpretation: the altar of stones and its fire east of the camp, the dusk and the night with its stars, the column of light as the only sign of God, the two wagons, the pack donkeys, the herd, the road west past the ford, Judah running, the chariot and its two horses, and the meeting outside the courtyard wall. The film leaves out the list of names (46:8-27) and Joseph's counsel for Goshen (46:31-34).",
]
t = '\n'.join(HDR + L[5:])
t = rep(t, "import { LK } from './lights.js';", "import { LK } from './lights.js';\nimport { makeStars } from './stars15.js';")

# ---- sky: golden late afternoon, dusk, night, first light, morning, day
t = between(t, "  const CLOUD = [", "  const colAt = ", "  const CLOUD = [[0, '#e8c4a0'], [5, '#d89080'], [8.6, '#4a4a70'], [12.5, '#262a4a'], [27.4, '#262a4a'], [29.4, '#6a5a80'], [31.4, '#e8c8a8'], [47, '#f0d4a8'], [60, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];\n  const CEM = [[0, '#6a5444'], [5, '#5a4444'], [8.6, '#2e2e48'], [12.5, '#181a30'], [27.4, '#181a30'], [29.4, '#4a4058'], [31.4, '#6a5c4a'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];\n")
t = rep(t, "  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);",
 "  const sunS = spriteGlow(0, 0, 0, 18, 0xff9a70, 0), sunS2 = spriteGlow(0, 0, 0, 7, 0xffd8b8, 0); g.add(sunS, sunS2);\n  const stars = makeStars({ seed: 46 }); g.add(stars.group);")

# ---- people, props and choreography (replaces the whole Ep45 block)
CHOREO = r"""  // ---- Genesis 46: the altar of Beersheba (46:1) east of the camp, on the dry ground between the camp and the road
  const ALT = [5.35, -3.25], AY = hC(ALT[0], ALT[1]), HE = Math.PI / 2, HW = -Math.PI / 2;
  const altar = new THREE.Group(); altar.position.set(ALT[0], AY - .02, ALT[1]); altar.scale.setScalar(.8); ca.add(altar);
  { const STN = [[-.34, .1, .08, .3, .2, .26, .2], [.0, .1, -.04, .32, .22, .27, -.1], [.34, .1, .09, .29, .2, .25, .4], [-.17, .29, .03, .3, .19, .25, .3], [.17, .29, -.02, .3, .2, .26, -.3], [.0, .46, .02, .28, .18, .24, .1], [-.02, .12, -.34, .26, .18, .22, .6]];
    STN.forEach(([x, y, z, sx, sy, sz, ry], i) => { const b = new GB(rng(477 + i)); b.add(G.ico0, pk(rng(478 + i), ['#9a8e7c', '#a99c86', '#85796a']), [0, 0, 0], [sx, sy, sz], [.2 * i, ry, .1], .06); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; altar.add(m); });
    const b = new GB(rng(490)); for (let k = 0; k < 7; k++) { const a = k * .9 + .3; b.box(k % 2 ? '#5a3a24' : '#6a4a2e', [Math.cos(a) * .07, .58 + .02 * (k % 3), Math.sin(a) * .07], [.2, .03, .035], [0, a, .12 * (k % 3 - 1)], .004); }   // the wood laid on the top stone
    const m = new THREE.Mesh(b.build(), lam); altar.add(m); }
  const flA = spriteGlow(ALT[0], AY + .64, ALT[1], .62, 0xff9a48, 0), flB = spriteGlow(ALT[0], AY + .58, ALT[1], .2, 0xfff0c0, 0); g.add(flA, flB);
  const flame = new THREE.Group(); { for (const [dx, dz, h, s0] of [[0, 0, .3, 1], [.07, .03, .2, .8], [-.06, -.04, .22, .85]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(.075 * s0, h, 6), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: .0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); c.position.set(dx, .62 + h / 2, dz); flame.add(c); } flame.position.set(0, 0, 0); altar.add(flame); }
  const altL = new THREE.PointLight(0xff9a48, 0, 5.5, 1.5); altL.position.set(ALT[0] - .3, AY + 1.0, ALT[1] + .25);
  const smoke = makeMotes({ n: 46, area: [.3, 3.2, .3], size: .05, v: .26, seed: 477, color: 0xb0a090 }); g.add(smoke.mesh);
  const embers = makeMotes({ n: 24, area: [.5, 1.6, .5], size: .018, v: .34, seed: 478, color: 0xffb060 }); g.add(embers.mesh);
  // ---- God is shown only as light (46:2-4): a tall column beside Jacob, its foot on the ground, and the sparks that rise in it
  const CL = [4.45, -3.95], CLY = hC(CL[0], CL[1]);
  const colL = shaft(7, .24, .18, [1, .86, .5], .9, .55); colL.position.set(CL[0], CLY + .02, CL[1]); g.add(colL);
  const colG = spriteGlow(CL[0], CLY + .55, CL[1], 1.0, 0xffd890, 0), colP = pool(.7, 0xffd890, 0); colP.position.set(CL[0], CLY + .04, CL[1]); g.add(colG, colP);
  const colLi = new THREE.PointLight(0xffd090, 0, 7, 1.5); colLi.position.set(CL[0] + .1, CLY + .8, CL[1] + .05);
  const spark = makeMotes({ n: 40, area: [1.2, 4.5, 1.2], size: .008, v: .22, seed: 41, color: 0xffe4a8 }); g.add(spark.mesh);
  // ---- the family: four wives and five little ones ride in the wagons (46:5), eleven sons walk with the caravan, a herd and three pack donkeys follow (46:6)
  const WIV = [[1460, '#a8564a', '#efe6d0', '#c58c60'], [1461, '#4a7a8a', '#e8dcc0', '#b98a62'], [1462, '#8a6a9a', '#efe6d0', '#a8714a'], [1463, '#b8944a', '#e8dcc0', '#c58c60']].map(([sd, top, cloth, skin]) => person(rng(sd), { pants: '#e8dcc0', top, skin, hair: '#1e1208', long: true, cloth, sash: '#8a6a3a', seed: sd }, .41));
  const KID = [[1470, .27, '#c9553c', '#b98a62'], [1471, .29, '#4f9a8a', '#c58c60'], [1472, .25, '#d8b048', '#a8714a'], [1473, .28, '#6a7aa8', '#c58c60'], [1474, .26, '#a8704a', '#b98a62']].map(([sd, sc, top, skin]) => person(rng(sd), { pants: '#e8dcc0', top, skin, hair: '#1e1208', seed: sd }, sc));
  g.add(...WIV.map(o => o.group), ...KID.map(o => o.group));
  const mkWagon = sd => { const gr = new THREE.Group(), b = new GB(rng(sd)), rr = rng(sd + 1);
    b.box('#8a6a44', [0, .2, 0], [.58, .035, .3], [0, 0, 0], .006);                                                  // the bed
    for (const sz of [-.15, .15]) b.box('#7a5a38', [0, .255, sz], [.58, .075, .022], [0, 0, 0], .004);               // the side boards
    for (const sx of [-.29, .29]) b.box('#7a5a38', [sx, .255, 0], [.022, .075, .3], [0, 0, 0], .004);
    for (const sx of [-.18, .18]) { b.box('#5a4028', [sx, .1, 0], [.03, .03, .4], [0, 0, 0], .003); for (const sz of [-.2, .2]) b.add(G.cyl6, '#6a4a2a', [sx, .1, sz - .015], [.1, .03, .1], [Math.PI / 2, 0, 0], .004); }   // axles and wheels
    for (const sz of [-.07, .07]) b.box('#7a5a38', [.5, .17, sz], [.46, .02, .02], [0, 0, 0], .003);                // the shafts to the donkey
    for (let k = 0; k < 4; k++) { const x = -.2 + k * .13, y = .24; b.add(G.ico0, pk(rr, ['#d8c9a0', '#c8b890', '#e0d4b4']), [x, y + .04, -.1], [.06, .05, .07], [0, rr() * 3, 0], .004); }   // sacks of provisions along one side
    b.box('#c8452e', [-.12, .245, .08], [.22, .015, .14], [0, 0, 0], .003);                                          // a red rug for the seat
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); gr.scale.setScalar(1.3); gr.visible = false; g.add(gr); return gr; };
  const CP = [[2.6, .2], [2.2, .95], [.45, 1.22], [-1.0, 1.16]];                       // the way down from the camp to the road, across the ford and west
  const WV = .55;
  const convoy = (start, tDep, v, lane, fin, wait0 = 0) => { const r = route(0, start).wait(tDep + wait0); for (const q of CP) r.go(v, [q[0] + lane[0], q[1] + lane[1]]); r.go(v, fin); return r; };
  const WPK = [[1.4, -1.5], [2.6, -1.9]], WFIN = [[-1.7, 1.18], [-.45, 1.14]];
  const WAGS = [0, 1].map(i => { const r = convoy(WPK[i], 32.4 + 1.0 * i, WV, [0, 0], WFIN[i]); return { gr: mkWagon(1400 + 2 * i), d: dnk[i], keys: r.keys, a: 0 }; });
  const follow = (keys, back, side, tt0 = 0) => { const out = []; for (let tt = tt0; tt <= 62.001; tt += .25) { const p = kp(tt, keys), h = hdgAt(keys, tt); out.push([tt, p.x - Math.sin(h) * back + Math.cos(h) * side, p.z - Math.cos(h) * back - Math.sin(h) * side, 'L']); } return out; };
  const aW = k => k > .001 ? { a1x: -1.3 * k, a1z: .25 * k } : {};                                     // one arm out, the hand turned in
  const aOne = k => k > .001 ? { a1x: -1.15 * k, a1z: -.35 * k } : {};                                // one arm forward, laid on a shoulder
  const aU = k => k > .001 ? { a0x: -2.3 * k, a1x: -2.3 * k, a0z: -.35 * k, a1z: .35 * k } : {};      // both hands raised
  const aE = k => k > .001 ? { a0x: -1.5 * k, a1x: -1.5 * k, a0z: -.1 * k, a1z: .1 * k } : {};        // both arms held out in front: to embrace
  const nightF = t => ON(t, 8.0, 10.4, 27.6, 29.8);
  // ---- passengers sit in the wagons the whole way (46:5)
  const seats = [[0, -.15, .08, 0], [1, .1, -.08, 0], [1, -.18, .06, 1], [1, .05, .08, 2], [1, .2, -.06, 3]];
  [[WIV[0], 1, -.12, .08], [WIV[1], 1, .06, -.07], [WIV[2], 1, -.18, -.07], [WIV[3], 0, -.17, .11]].forEach(([f, wi, back, side], i) => { const keys = follow(WAGS[wi].keys, .8 + back, side * .5); const a = act(f, keys, { sp: 5, ph: i * 1.7, face: (tt, q) => hdgAt(keys, tt), y: () => .27,
      ex: tt => mixA({ s: .86, lx: .06 + .16 * nightF(tt) }, aF(.3)) }); a.rid = true; });
  [[KID[0], 1, .2, .1], [KID[1], 1, .05, .02], [KID[2], 0, .12, -.06], [KID[3], 0, -.05, .06], [KID[4], 1, -.02, .12]].forEach(([f, wi, back, side], i) => { const keys = follow(WAGS[wi].keys, .8 + back * .5, side * .5); const a = act(f, keys, { sp: 5, ph: i * 1.3, face: (tt, q) => hdgAt(keys, tt), y: () => .27,
      ex: tt => mixA({ s: .9, lx: .05 + .22 * nightF(tt) }) }); a.rid = true; });
  // ---- the sons: eleven. They stand behind Jacob at the altar, rest through the night, and walk beside the wagons from first light
  const BRP = [[3.95, -4.15], [3.95, -3.55], [3.95, -2.95], [3.95, -2.35], [3.5, -4.3], [3.5, -3.7], [3.5, -3.1], [3.5, -2.5], [3.05, -4.1], [3.05, -3.4], [3.05, -2.8]];
  const bro = i => i === 10 ? ben : br[i];
  const LANES = [[.0, -.55], [.0, .55], [.5, -.35], [.5, .35], [1.0, -.6], [1.0, .6], [1.5, -.4], [1.5, .4], [2.0, -.55], [2.0, .55], [2.5, 0]];
  const BFIN = [[-2.7, .45], [-2.4, .75], [-2.95, .75], [-2.2, .4], [-3.2, 2.0], [-2.7, 2.1], [-2.2, 2.0], [-1.7, 2.1], [-1.25, 2.0], [-3.3, 1.6], [-.9, 2.35]];
  for (let i = 0; i <= 10; i++) { const f = bro(i), p0 = BRP[i], lane = LANES[i], d = .12 * i;
    const r = route(0, p0).wait(30.4 + d * .8).go(.9, [3.0, -.6 + lane[1] * .3]);
    for (const q of CP.slice(1)) r.go(.6, [q[0] - lane[0] * .5, q[1] + lane[1]]);
    if (i === 1) { r.go(.6, [-1.2, 1.18 + lane[1]]).wait(44.4).go(2.0, [-8.3, 1.1]).wait(49.2).go(1.4, [-4.35, .8]).wait(62); }     // Judah goes ahead (46:28)
    else r.go(.6, BFIN[i]).wait(62);
    act(f, r.keys, { sp: 5, ph: i * 1.1, face: (tt, q) => q.mv ? null : (tt < 29.6 ? HE : toward(q.x, q.z, [-2.6, .55])),
      ex: tt => mixA({ s: 1 - .2 * ON(tt, 8.4, 9.4, 28.6, 29.8), lx: .1 + .12 * ON(tt, 8.4, 9.4, 28.6, 29.8) - .1 * smooth(2, 4, tt) * (1 - smooth(4.6, 5.2, tt)) }, aF(.5 * ON(tt, 2.2, 3.0, 8.0, 8.8)), aO(.4 * ON(tt, 3.6, 4.2, 6.8, 7.6)), aF(.3 * smooth(52, 53, tt))) }); }
  // ---- Jacob: walks to the altar (46:1), kneels with his hands raised, lies down at night and sleeps; the voice wakes him (46:2); he sits and listens; at first light he gets up, climbs into the first wagon, rides west, and in Goshen gets down to meet Joseph (46:29)
  const JA = [4.85, -3.3], JW0 = (() => { const hd = hdgAt(WAGS[0].keys, 0); return [WPK[0][0] - Math.sin(hd) * .92, WPK[0][1] - Math.cos(hd) * .92]; })();
  const jA = route(0, [3.75, -4.9]).go(.5, JA).wait(28.6).go(.95, JW0).wait(31.7).keys;
  const jB = follow(WAGS[0].keys, .92, .06, 31.75).filter(k => k[0] > 31.7 && k[0] < 49.2);
  const jLast = jB[jB.length - 1];
  const jC = route(49.2, [jLast[1], jLast[2]]).go(.95, [-3.15, .75]).wait(62).keys;
  const jKeys = [...jA, ...jB, ...jC.slice(1)];
  const EMBP = [-3.36, .75];
  const aJac = act(jac, jKeys, { sp: 6, y: tt => .08 * lieK(tt) + .27 * smooth(31.2, 31.8, tt) * (1 - smooth(49.3, 49.7, tt)),
    face: (tt, q) => { if (tt < 31.7) return q.mv ? null : aLerp(HE, toward(q.x, q.z, CL), smooth(10.95, 11.7, tt) * (1 - smooth(28.6, 29.4, tt))); if (tt < 49.2) return hdgAt(jKeys, tt); return q.mv ? null : toward(q.x, q.z, EMBP); },
    ex: tt => { const kn = ON(tt, 4.4, 5.2, 8.0, 8.8), lie = lieK(tt), sit = sitK(tt), wag = ON(tt, 31.7, 32.2, 49.0, 49.6);
      return mixA({ s: (1 - .22 * kn) * (1 - .22 * sit) * (1 - .16 * wag), lx: .16 * kn - 1.5 * lie + .06 * sit + .04 * wag }, aU(.85 * ON(tt, 5.0, 5.6, 7.4, 8.2)), aF(.5 * ON(tt, 4.4, 4.9, 5.2, 5.6)), { a0x: -.3 * lie, a1x: -.3 * lie, a0z: -.3 * lie, a1z: .3 * lie },
        aO(.55 * ON(tt, 12.0, 12.6, 13.6, 14.2)), aF(.6 * ON(tt, 14.6, 15.2, 21.6, 22.6)), aO(.5 * ON(tt, 22.8, 23.4, 25.0, 25.8)), aOne(.9 * ON(tt, 25.8, 26.4, 28.6, 29.4)), aF(.5 * wag), aE(.95 * ON(tt, 51.8, 52.4, 59.8, 60.8)), { lx: .12 * ON(tt, 52.4, 53.0, 58.0, 59.8) }); } });
  function lieK(tt) { return smooth(8.8, 9.9, tt) * (1 - smooth(10.8, 11.8, tt)); }
  function sitK(tt) { return smooth(10.9, 11.9, tt) * (1 - smooth(28.4, 29.4, tt)); }
  const jPos = tt => { const p = kp(tt, jKeys); return [p.x, p.z]; };
  // ---- the herd and the pack donkeys (46:6)
  const ANIM = [];
  const HP = [[7.0, -4.6], [7.5, -5.0], [6.8, -5.4], [7.4, -4.0], [7.9, -5.5], [6.6, -4.2], [7.2, -6.0], [7.9, -4.4]];
  HP.forEach((p, i) => { const s = makeSheep(rng(700 + i)); s.group.scale.setScalar(.6); g.add(s.group); const lane = [[0, 1.5], [.4, 1.9], [.9, 1.6], [1.3, 2.0], [1.8, 1.7], [2.2, 2.1], [2.7, 1.8], [3.1, 2.2]][i];
    const r = route(0, p).wait(32.6 + .25 * i).go(.7, [6.9, -2.2 + .1 * i]).go(.7, [4.2, -.4 + .15 * i]); for (const q of CP.slice(1)) r.go(.55, [q[0] + lane[0] * .1, q[1] + .55 + .12 * i]); r.go(.55, [-1.2 + .18 * (i % 4), 2.55 + .12 * (i >> 2)]); ANIM.push({ s, keys: r.keys, i }); });
  [[2, [6.6, -4.5], [-.9, .45]], [3, [7.0, -5.0], [-1.35, .5]], [4, [6.2, -5.1], [-1.8, .42]]].forEach(([k, p, fin], j) => { const r = route(0, p).wait(32.0 + .6 * j).go(.7, [6.9, -2.0 + .1 * j]).go(.7, [4.0, -.3 + .1 * j]); for (const q of CP.slice(1)) r.go(.55, [q[0] + .2 * j, q[1] - .55 - .08 * j]); r.go(.55, fin); ANIM.push({ s: dnk[k], keys: r.keys, i: 10 + j }); });
  // ---- Joseph's chariot stands by his house; Judah comes running (46:28); Joseph has it made ready and drives east to meet his father (46:29)
  const CH0 = [-9.2, 1.05], CHF = [-7.1, 1.12];
  const chKeys = route(0, CH0).wait(48.8).go(1.5, [-8.2, 1.08]).go(1.5, CHF).wait(62).keys;
  const chG = new THREE.Group(), whl = []; { const b = new GB(rng(1500)), rr = rng(1501);
    b.box('#8a6a3a', [0, .17, 0], [.34, .03, .26], [0, 0, 0], .004); b.box('#6a4a28', [.14, .27, 0], [.035, .22, .27], [0, 0, 0], .004);
    for (const sz of [-.125, .125]) b.box('#7a5a32', [0, .3, sz], [.3, .028, .022], [0, 0, 0], .003);
    b.box('#c8452e', [0, .185, 0], [.22, .012, .16], [0, 0, 0], .002); b.box('#d8aa48', [.14, .385, 0], [.04, .02, .29], [0, 0, 0], .002);
    b.box('#5a4028', [0, .13, 0], [.03, .03, .4], [0, 0, 0], .003);
    b.box('#7a5a38', [.6, .2, 0], [.9, .022, .022], [0, 0, 0], .003); b.box('#d8aa48', [1.02, .24, 0], [.035, .035, .26], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; chG.add(m);
    for (const sz of [-.2, .2]) { const wb = new GB(rr); wb.add(G.cyl6, '#6a4a2a', [0, 0, 0], [.13, .026, .13], [Math.PI / 2, 0, 0], .004); for (let k = 0; k < 3; k++) wb.box('#d8b070', [0, 0, 0], [.26, .018, .02], [0, 0, k * 1.0472], .002); const w = new THREE.Mesh(wb.build(), lam); w.position.set(0, .13, sz); w.castShadow = true; chG.add(w); whl.push(w); } }
  const HORSE = [0, 1].map(i => { const h = makeQuad({ rn: rng(1520 + i), len: .95, h: .36, w: .25, legL: .46, legW: .068, col: i ? '#7a4a2a' : '#9a5a30', col2: i ? '#5a3418' : '#6a4020', neck: [.44, .7, .13], head: [.34, .16, .12], ears: true }); h.group.position.set(.98, 0, i ? .12 : -.12); h.group.scale.setScalar(.62); chG.add(h.group); return h; });
  chG.scale.setScalar(1.45); g.add(chG);
  const sJ = [[0, CH0[0] + .35, CH0[1] - .2, 'L']];
  act(joL, sJ, { sp: 6, show: t => t >= 44.0 && t < 48.8, face: () => toward(CH0[0] + .35, CH0[1] - .2, [-8.0, 1.1]), ex: tt => mixA({ lx: .05 + .1 * ON(tt, 47.0, 47.4, 48.2, 48.8) }, aF(.35), aW(.7 * ON(tt, 47.2, 47.7, 48.1, 48.8))) });
  const joRide = act(joL, chKeys, { sp: 6, show: t => t >= 48.8 && t < 50.3, face: (tt, q) => hdgAt(chKeys, tt), y: () => .25, ex: tt => mixA({ s: 1 }, { a0x: -.9, a1x: -.9, a0z: .2, a1z: -.2 }) });
  const stepKeys = route(50.3, [CHF[0] - .1, CHF[1] - .35]).go(1.6, [-3.58, .75]).wait(62).keys;
  act(joL, stepKeys, { sp: 6, show: t => t >= 50.3 && t < 62, face: (tt, q) => q.mv ? null : toward(q.x, q.z, EMBP), ex: tt => mixA({ lx: .1 * ON(tt, 52.4, 53.0, 58.0, 59.8) }, aE(.95 * ON(tt, 51.8, 52.4, 59.8, 60.8))) });

"""
t = between(t, "  // ---- Genesis 45 people and props", "  function update(t, camera, sid) {", CHOREO)

# ---- update loop: night, stars, the fire, the column of light, the caravan, the herd, the chariot
t = rep(t, "    const night = 0;\n", "    const night = nightF(t);\n")
t = rep(t, "    townG.visible = true;\n", "    townG.visible = false;\n")
t = rep(t, "    thr.visible = t >= 39.9 && t < 47.3;\n", "")
t = rep(t, "const f = a.f, p = kp(t, a.keys), mv = p.mv, fo", "const f = a.f, p = kp(t, a.keys), mv = a.rid ? false : p.mv, fo")
t = rep(t, "['weep', 'alive', 'silent', 'closer', 'sold', 'angry', 'ahead', 'goshen', 'road', 'embrace', 'talked', 'pharaoh'].includes(sid)", "['kneel', 'vision', 'promise', 'face', 'closeeyes', 'ride', 'wives', 'embrace', 'weep'].includes(sid)")
t = rep(t, "[...br, ben, sv, sv2, sv3, gu1, gu2].forEach(f =>", "[...br, ben, ...WIV, ...KID].forEach(f =>")
t = rep(t, "    { const CAN_ = t >= 46.9; dust.update(t, CAN_ ? .5 : .15, [CAN_ ? 3 : 0, .3, CAN_ ? -2 : 0]); dustR.update(t, 0, [8, .3, -5]); }\n", r"""    // the star dome comes with the night and goes with the dawn
    { const so = ON(t, 8.8, 11.8, 27.4, 30.4); stars.group.visible = so > .004; stars.update(t, so, .38, .6 + .0035 * t, cam || new THREE.Vector3()); }
    // the fire on the altar: lit as Jacob kneels, it burns through the night and banks down by the morning
    { const lit = smooth(4.0, 5.4, t) * (1 - smooth(33.0, 37.0, t)), fl = .88 + .09 * Math.sin(t * 17.3) + .06 * Math.sin(t * 29.1 + 1) + .05 * Math.sin(t * 7.7);
      flame.children.forEach((c, i) => { c.material.opacity = .88 * lit * (.82 + .18 * Math.sin(t * (13 + 3 * i) + i)); c.scale.set(1, .85 + .3 * Math.sin(t * (9 + 2 * i) + i * 2), 1); c.rotation.y = t * 2 + i; }); flame.visible = lit > .01;
      flA.material.opacity = .38 * lit * fl; flB.material.opacity = .4 * lit * fl; flA.visible = flB.visible = lit > .01; altL.intensity = 1.5 * lit * fl;
      smoke.update(t, lit * .9, [ALT[0] + .1, AY + .52, ALT[1]]); embers.update(t, lit * 1.2, [ALT[0], AY + .56, ALT[1]]); }
    // God, shown only as light (46:2-4): the column stands up beside Jacob at "Jacob, Jacob", glows through the promise and softens before the morning
    { const lo = ON(t, 10.9, 12.6, 27.8, 30.0) * (.92 + .08 * Math.sin(t * 1.9)); colL.material.opacity = .4 * lo; colL.visible = lo > .004; colG.material.opacity = .13 * lo; colG.visible = lo > .004; colP.material.opacity = .18 * lo; colP.visible = lo > .004; colLi.intensity = 1.2 * lo;
      spark.update(t, lo * 1.4, [CL[0] + .05, CLY, CL[1]]); }
    // the caravan: dust behind the leading wagon, and behind the chariot
    { const w0 = kp(t, WAGS[0].keys), ds = ON(t, 32.6, 34.6, 43.4, 45.4); dust.update(t, ds * .55, [w0.x + .3, .25, w0.z]); const c = kp(t, chKeys); dustR.update(t, ON(t, 48.9, 49.5, 50.2, 50.8) * .9, [c.x - .5, .2, c.z]); }
    // the herd and the pack animals
    ANIM.forEach(o => { const p = kp(t, o.keys), hd = hdgAt(o.keys, t), grp = o.s.group; grp.visible = true; grp.position.set(p.x, gAt(p.x, p.z) - .02, p.z); grp.rotation.y = hd - Math.PI / 2; walkLegs(o.s.legs, t + o.i * .7, 7, p.mv ? .4 : 0); });
    // Joseph's chariot
    { const p = kp(t, chKeys), hd = hdgAt(chKeys, t); chG.visible = true; chG.position.set(p.x, gAt(p.x, p.z) - .01, p.z); chG.rotation.y = hd - Math.PI / 2; const sx = (p.x - CH0[0]) / .19; whl.forEach(w => { w.rotation.z = -sx; });
      HORSE.forEach((h, i) => walkLegs(h.legs, t + i * .4, 11, p.mv ? .55 : 0)); }
    altL.visible = colLi.visible = true;
""")
t = rep(t, "  const light = [Dk(0, ...GOLD), Dk(39.6, ...GOLD), Dk(40.2, ...PHAR), Dk(46.6, ...PHAR), Dk(47.2, ...DRY), Dk(58.0, ...DRY), Dk(59.6, ...HAZE), Dk(90, ...HAZE)];\n",
 r"""  const SUNSET = ['#a0a0c8', '#5a4a48', .95, '#ff9a58', 2.1, [-10, 2.2, 4], .5, '#ffc890', [8, 4, 6], 14];
  const DUSK = ['#6a78b0', '#3a3448', .85, '#8a9ad8', 1.5, [-9, 5, 6], .5, '#ff9a50', [8, 3, 6], 14];
  const NIGHT = ['#5a68a4', '#2a2a44', .8, '#8a9ad8', 1.4, [-9, 6, 6], .45, '#ffc890', [-8, 4, 8], 14];
  const DAWN = ['#5a5c94', '#2e2a40', .78, '#a8a4d8', 1.2, [-9, 4, 6], .45, '#ffb078', [8, 3, 6], 14];
  const MORN = ['#b8aed0', '#6a5444', 1.0, '#ffb870', 2.7, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const light = [Dk(0, ...GOLD), Dk(3.0, ...GOLD), Dk(6.0, ...SUNSET), Dk(9.0, ...DUSK), Dk(12.5, ...NIGHT), Dk(27.4, ...NIGHT), Dk(30.0, ...DAWN), Dk(33.0, ...MORN), Dk(47.2, ...DRY), Dk(58.0, ...DRY), Dk(59.6, ...HAZE), Dk(90, ...HAZE)];
""")
t = rep(t, "  const bg = [[0, ['#5a86c4', '#f6c890']], [39.6, ['#5a86c4', '#f6c890']], [40.2, ['#6a8ec8', '#f8d4a0']], [46.6, ['#6a8ec8', '#f8d4a0']], [47.2, ['#7a98c0', '#f8dcb0']],",
 "  const bg = [[0, ['#3a56a4', '#f6c088']], [3.0, ['#3a56a4', '#f4b078']], [6.0, ['#2a3a7a', '#f08a62']], [9.0, ['#141e4c', '#6a4a70']], [12.5, ['#050a1e', '#10204a']], [27.4, ['#050a1e', '#10204a']], [30.0, ['#1a2858', '#8a6a88']], [33.0, ['#5a86c4', '#f6c890']], [47.2, ['#7a98c0', '#f8dcb0']],")
t = rep(t, "pl: [prL, ...ptL, ...torchL, gateL, campL], state };", "pl: [prL, ...ptL, ...torchL, gateL, campL, altL, colLi], state };")

open(SRC + 'world46.js', 'w').write(t)
print('world46.js (stage 1)', len(t))
