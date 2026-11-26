#!/usr/bin/env python3
# Builds src/world33.js (Genesis 33) from src/world32.js: keeps the Jabbok country (terrain, trees, reeds, river, tents, animals, sky helpers, people makers) and writes the meeting of Jacob and Esau, the caravan and the altar at Shechem.
SRC = '/home/claude/g11/src/'
L = open(SRC + 'world32.js').read().split('\n')
def R(a, b): return '\n'.join(L[a - 1:b])
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80])
    return s.replace(a, b)
out = []

out.append(r"""// Episode 33: Genesis 33. Jacob looks up and sees Esau coming with four hundred men; he divides the children among Leah, Rachel and the two maids, the maids and their children first, Leah and her children next, Rachel and Joseph last (33:1-2); he goes ahead of them and bows himself to the ground seven times, until he comes near his brother (33:3);
// Esau runs to meet him, embraces him, falls on his neck, kisses him, and they weep (33:4); Esau sees the women and children: "Who are these with you?" "The children whom God has graciously given your servant" (33:5); the maids and their children draw near and bow down, then Leah and her children, then Joseph and Rachel (33:6-7);
// Esau asks about all the company he met, and Jacob says it is to find favour with his lord (33:8); "I have enough, my brother; keep what you have for yourself" (33:9); Jacob presses him: "To see your face is like seeing the face of God, since you have received me with such favour. Please accept my gift" and Esau takes it (33:10-11); Esau offers to travel on together and to leave some of his men; Jacob will lead on slowly, according to the pace of the cattle and the children (33:12-15);
// that day Esau started back on his way to Seir (33:16); Jacob journeys to Succoth (33:17); he comes safely to the city of Shechem, camps before the city, buys the piece of land where he had pitched his tent, sets up an altar there and calls it El-Elohe-Israel (33:18-20).
// Cinematic interpretation: the floating land, the east bank and the ridge, the host of men standing on it, the way the family lines up, the pace and the gestures, the run, the embrace, the herd that stands behind Jacob, the road west along the river, the camp and the altar of stones. The text gives no landscape and no thoughts of Esau; the film draws one so that each moment can be seen, and it does not say what Esau felt beyond what the text says (he ran, embraced, kissed and wept).
// The film leaves out Jacob's explanation of the herds (33:8), Esau's offers to travel together and to leave men (33:12, 15), Succoth (33:17) and the altar's name (33:20). Seir and Shechem are not drawn as places; the land beyond the ridge and the camp by the road stand for them.""")
out.append(R(7, 13))
out.append(r"""
export const RIC = 15, RW = .85, WL = .2;
export const RV = z => .55 * Math.sin(z * .32 + .6);                                   // the river runs north to south; this is its centre line
export const JP = [-2.0, 2.0], FORD = [.45, 1.3], CAMPC = [-7.0, -.2], RIDGE = [11.3, -4.2], EAST = [4.4, 1.6];       // the ford; the camp at the west end of the road; the ridge the host stands on; the east bank
export const J0 = [4.3, 1.9], E0 = [9.9, -3.6], ALT = [-4.2, -1.4];                  // where Jacob stands on the east bank; where Esau stands at the head of his men; the altar
const _dx = E0[0] - J0[0], _dz = E0[1] - J0[1], _dl = Math.hypot(_dx, _dz);
export const UX = _dx / _dl, UZ = _dz / _dl;                                              // unit vector from Jacob toward the ridge
export const sPos = (s, lat = 0) => [J0[0] + UX * s - UZ * lat, J0[1] + UZ * s + UX * lat];   // s along the way to Esau, lat to the south-east of it
export const EV = { a1: .6, a2: 9.9, b1: 16.2, b2: 22.7, c1: 30.7, c2: 35.5, d1: 44.6, e1: 53.2 };
""")
_t = R(19, 29)
_t = rep(_t, "[FIRE[0], FIRE[1], .31, 2.2]", "[ALT[0], ALT[1], .31, 2.2]")
out.append(_t)
out.append('')
out.append(R(31, 39))
out.append(r"""const gAt = hC;
export const stage = { gAt, J0, E0, ALT, UX, UZ, sPos, FORD, CAMPC, RIDGE, EAST, PATH, RV };
""")
out.append(R(44, 49))
out.append('')
out.append(R(51, 59))
# Esau and the herdsmen are made below; mkDark and mkGoat are kept
out.append(R(61, 64))
out.append(r"""
const mkEsau = R => person(R, { pants: '#8a5a38', top: '#7a3a26', skin: '#c87a50', hair: '#a8441c', beard: '#a8441c', cloth: '#e0d0b0', mantle: '#6a4a2a', sash: '#2e2018', seed: 975 }, .5);   // ruddy and hairy (25:25), broader than Jacob

export function makeCountry() {""")
out.append(R(69, 72).replace('rng(3232)', 'rng(3333)'))
# trees: drop the olive that stood in the run field; clear the east bank for the meeting
t = R(73, 76)
t = rep(t, "[[-3.6, -5.2, .9], [6.6, -2.8, .8], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [8.8, 5.6, .8]]", "[[-3.6, -5.2, .9], [3.8, -4.6, .9], [2.4, 6.0, .8], [-4.2, 6.8, .9], [8.8, 5.6, .8]]")
out.append(t)
k = R(77, 77)
k = rep(k, "(x > 2.2 && x < 10.4 && z > -.8 && z < 3.8)", "(x > 2.2 && x < 10.8 && z > -4.8 && z < 4.2)")
k = rep(k, "Math.hypot(x - FIRE[0], z - FIRE[1]) < 2.4 || ", "Math.hypot(x - ALT[0], z - ALT[1]) < 2.0 || ")
k = rep(k, "Math.hypot(x - JP[0], z - JP[1]) < 2.4 || ", "")
out.append(k)
out.append(R(78, 92))
out.append('')
# the camp: four tents, pitched at Shechem (they stand up at 53 s)
c = R(94, 96)
c = rep(c, "ca.add(m); });", "ca.add(m); m.userData.s = 1; tents.push(m); });")
c = rep(c, "  const TENTS =", "  const tents = [];\n  const TENTS =")
out.append(c)
out.append(r"""
  // ---- the altar at Shechem (33:20): stones set one on another by the camp; each stone is placed in turn
  const altar = new THREE.Group(); altar.position.set(ALT[0], hC(ALT[0], ALT[1]) - .02, ALT[1]); ca.add(altar);
  const STN = [[-.34, .1, .08, .3, .2, .26, .2], [.0, .1, -.04, .32, .22, .27, -.1], [.34, .1, .09, .29, .2, .25, .4], [-.17, .29, .03, .3, .19, .25, .3], [.17, .29, -.02, .3, .2, .26, -.3], [.0, .46, .02, .28, .18, .24, .1], [-.02, .12, -.34, .26, .18, .22, .6]];
  const stones = STN.map(([x, y, z, sx, sy, sz, ry], i) => { const b = new GB(rng(77 + i)); b.add(G.ico0, pk(rng(78 + i), ['#9a8e7c', '#a99c86', '#85796a']), [0, 0, 0], [sx, sy, sz], [.2 * i, ry, .1], .06); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; altar.add(m); return m; });
  const altarL = new THREE.PointLight(0xffa860, 0, 6, 1.5); altarL.position.set(ALT[0] + .3, hC(ALT[0], ALT[1]) + 1.1, ALT[1] + .5);

  // ---- Esau's four hundred men (33:1): a block of small dark figures on the ridge behind him; they stand over the crest and go back over it with him (33:16)
  const HB = [11.4, -4.9], host = new THREE.Group(); g.add(host); host.position.set(HB[0], hC(HB[0], HB[1]), HB[1]);
  { const b = new GB(rng(61)), rr = rng(62), y0 = hC(HB[0], HB[1]); for (let k = 0; k < 60; k++) { const col = k % 6, row = Math.floor(k / 6), x = HB[0] - 1.2 + col * .42 + (rr() - .5) * .2 - row * .07, z = HB[1] - 1.8 + row * .4 + (rr() - .5) * .16, y = hC(x, z), dx = x - HB[0], dz = z - HB[1], dy = y - y0;
      b.box(pk(rr, ['#4a3a38', '#3a3a48', '#52403a', '#3a4448', '#5a4a3a']), [dx, dy + .17, dz], [.11, .34, .09], [0, 0, 0], .03); b.add(G.ico0, pk(rr, ['#b98a62', '#a8714a', '#c38a5c']), [dx, dy + .39, dz], [.055, .06, .055], [0, 0, 0], .02); b.box('#5a4a38', [dx + .07, dy + .36, dz], [.014, .72, .014], [0, 0, .04], .01); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; host.add(m); }
  host.scale.setScalar(.001);
""")
out.append(R(114, 117))
out.append('')
out.append(R(120, 127))
out.append(r"""  const CLOUD = [[0, '#e8c8a0'], [44, '#e8c0a0'], [58, '#e8a888'], [90, '#e8a888']];
  const CEM = [[0, '#6a5848'], [44, '#6a5848'], [58, '#6a4a3e'], [90, '#6a4a3e']];
""")
out.append(R(131, 133))
out.append(r"""
  // ---- the people: Jacob, his wives, maids and eleven children as in Genesis 32; Esau is new
  const jacob = mkJacob(rng(87)), rachel = mkRachel(rng(88)), leah = mkLeah(rng(90)), esau = mkEsau(rng(114));
  const bil = mkMaid(rng(91), '#9a6a4a', '#c08a5e', '#e0d4bc', '#8a7a4a', 910), zil = mkMaid(rng(92), '#6a7a58', '#b8825a', '#d8cfb4', '#a87a4a', 911);
""")
out.append(R(138, 142))
out.append(R(146, 147))      # the staff
out.append(r"""  const ALLP = [jacob, rachel, leah, esau, bil, zil, ...Object.values(KID), hd1, hd2, sl1, sl2, sv1, sv2]; ALLP.forEach(o => g.add(o.group));
  jacob.group.add(mkStaff());
""".replace("  jacob.group.add(mkStaff());\n", ""))
out.append(R(157, 163).replace("const v3 = new THREE.Vector3(), state = {};", "const v3 = new THREE.Vector3(), state = {};"))
out.append(r"""  // route builder: positions at times, constant speed between waypoints, still while waiting
  const route = (t0, p) => { const ks = [[t0, p[0], p[1], 'L']]; const api = { keys: ks, go(v, q) { const l = ks[ks.length - 1]; ks.push([l[0] + Math.hypot(q[0] - l[1], q[1] - l[2]) / v, q[0], q[1], 'L']); return api; }, wait(tt) { const l = ks[ks.length - 1]; if (tt > l[0]) ks.push([tt, l[1], l[2], 'L']); return api; } }; return api; };
  const PW = [...PATH].reverse();                                   // the road, walked from the east bank to the west
  const sinP = (t, a, d) => { const u = clamp((t - a) / d); return Math.sin(Math.PI * u) ** 2; };   // one smooth pulse (a bow)

  // ---- who goes where
  // the family (33:1-2, 33:6-7): the maids and their children first, Leah and hers next, Rachel and Joseph last; they stand in order, come forward and bow when Esau has seen them, and walk on west with Jacob
  const FIG = { bil, dan: KID.dan, nap: KID.nap, zil, gad: KID.gad, ash: KID.ash, leah, reu: KID.reu, sim: KID.sim, lev: KID.lev, jud: KID.jud, iss: KID.iss, zeb: KID.zeb, rachel, jos: KID.jos };
  const FAM = [['bil', 0, -.85], ['dan', 0, -.55], ['nap', 0, -.3], ['zil', 0, .05], ['gad', 0, .35], ['ash', 0, .62], ['leah', 1, -.96], ['reu', 1, -.64], ['sim', 1, -.32], ['lev', 1, 0], ['jud', 1, .32], ['iss', 1, .64], ['zeb', 1, .96], ['rachel', 2, -.2], ['jos', 2, .15]];
  const GROW = [-.4, -1.0, -1.6], GAP = [3.0, 2.4, 1.8], GIN = [4.6, 5.5, 6.5], GGO = [26.6, 27.3, 28.1], GBW = [28.3, 29.0, 29.8];
  const SLOT = i => [-3.3 + .4 * (i >> 1), 1.0 + .5 * (i % 2)];                          // where they stand along the road by the camp
  const FK = FAM.map(([id, gi, lat], i) => { const f = FIG[id], j = FAM.filter(q => q[1] === gi).findIndex(q => q[0] === id), st = sPos(-2.6 - .15 * (i % 3), -1.5 + 3.0 * ((i * 7) % 15) / 15), ln = sPos(GROW[gi], lat), mt = sPos(GAP[gi], lat * .85), off = (i % 3 - 1) * .14;
    const r = route(0, st).wait(GIN[gi] + .1 * j).go(1.7, ln).wait(GGO[gi] + .08 * j).go(2.0, mt).wait(46.2 + .42 * i).go(1.5, [PW[0][0], PW[0][1] + off]);
    const sl = SLOT(i); for (let q = 1; q < PW.length; q++) { if (PW[q][0] < sl[0] + .4) break; r.go(1.5, [PW[q][0], PW[q][1] + off]); }
    r.go(1.5, sl);
    return { f, id, gi, j, keys: r.keys, ph: 2 + i * .9, bowT: GBW[gi] + .08 * j }; });

  // Jacob: he arranges the family, goes ahead and bows seven times (33:3), meets Esau (33:4-11) and leads on west at the pace of the flocks (33:14)
  const JS = 4.0, BOW0 = 11.1, BOWD = .67;
  const JK = route(44.8, sPos(JS)).go(1.5, [PW[0][0], PW[0][1] - .1]);
  for (let q = 1; q < PW.length - 1; q++) JK.go(1.5, [PW[q][0], PW[q][1] - .1]);
  JK.go(1.5, [-3.6, -.35]);
  const jPos = t => t < 44.8 ? sPos(JS * smooth(10.4, 15.3, t) * 0 + JS * clamp((t - 10.4) / 4.9)) : (p => [p.x, p.z])(kp(t, JK.keys));
  // Esau: at the head of his men, runs down to meet Jacob (33:4), stands with him, and goes back over the ridge with his men (33:16)
  const EF = sPos(JS + .46);
  const EK = route(0, E0).wait(15.8).go(1.9, EF).wait(22.6).go(1.2, sPos(JS + .85)).wait(44.6).go(1.5, E0).go(1.5, [E0[0] + UX * 3.4, E0[1] + UZ * 3.4]);
  // the herd Jacob sent ahead (32:13-21; 33:8 "all this company that I met") stands on the east bank; the goats come forward as the gift (33:10-11); at 46 s all move west
  const HC = sPos(-.5, 5.6), GFT = sPos(JS + .5, 1.6);
  const HERD = [...GOATS, ...DARK, ...WHITE, ...camels, ...donkeys], HERDM = [sv1, sv2, hd1, hd2, sl1, sl2];
  const DK = new Map();
  HERD.forEach((a, i) => { const ang = i * 2.399, rad = .3 + .27 * Math.sqrt(i + 1) * 1.15, st = [HC[0] + Math.cos(ang) * rad, HC[1] + Math.sin(ang) * rad * .8], gift = i < 4;
    const r = route(0, st); if (gift) r.wait(34.3 + .12 * i).go(2.6, [GFT[0] + (i % 2) * .3 - .15, GFT[1] + (i >> 1) * .3 - .15]).wait(46.6 + .15 * i); else r.wait(46.2 + .12 * i);
    const off = ((i % 5) - 2) * .09, tail = 11.5 + .2 * i;
    r.go(1.35, [PW[0][0], PW[0][1] + off + .2]); for (let q = 1; q < PW.length; q++) r.go(1.35, [PW[q][0], PW[q][1] + off + .2]); r.go(1.3, [-6.4 + .3 * (i % 6), 2.3 + .35 * Math.floor(i / 6)]);
    DK.set(a, r.keys); });
  HERDM.forEach((h, i) => { const a0 = i * 2.1 + 5, st = [HC[0] + Math.cos(a0) * 1.8, HC[1] + Math.sin(a0) * 1.5], r = route(0, st);
    if (i === 0) r.wait(34.3).go(2.6, [GFT[0] - .5, GFT[1] - .1]).wait(46.6); else r.wait(46.4 + .2 * i);
    r.go(1.35, [PW[0][0], PW[0][1] + .45]); for (let q = 1; q < PW.length; q++) r.go(1.35, [PW[q][0], PW[q][1] + .45]); r.go(1.3, [-5.2 + .5 * i, 3.4]);
    DK.set(h, r.keys); });

  function update(t, camera, sid) {
    const sway = (k, ph) => ({ s: 1 + .006 * Math.sin(t * k + ph) });
    const cam = camera && camera.position;

""")
out.append(R(193, 197))
out.append(r"""    { const bc = bgAtW(t), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }

    // the low sun behind the subject
    { const k = .42 + .13 * ON(t, 44, 50, 90, 91), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)), [1, .5, 2.5]); dust.update(t, .3 * (ON(t, 45, 47, 60, 62)), [.5, .1, 1.4]);
    // ---- the river: day colours, ripples drifting south
    { water.material.color.setRGB(.36, .48, .62); water.material.emissive.setRGB(.18, .25, .31);
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = .6 * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the tents are pitched at Shechem; the altar is built stone by stone (33:19-20)
    { const tk = smooth(52.4, 53.6, t); tents.forEach((m, i) => { const k = smooth(52.2 + .25 * i, 53.2 + .25 * i, t); m.scale.setScalar(Math.max(.001, k)); m.visible = k > .01; }); }
    stones.forEach((m, i) => { const ts = 55.0 + .42 * i, u = smooth(ts, ts + .35, t); m.scale.setScalar(Math.max(.001, u * (1 + .14 * Math.sin(Math.PI * u)))); m.visible = u > .01; });
    { const ao = smooth(55.0, 57.0, t); altarL.intensity = 1.8 * ao; }
    // ---- Esau's men: they stand on the ridge from the first frame, rise a little over the crest, and go back over it with Esau (33:16)
    { const rise = smooth(.2, 1.8, t), go = smooth(45.0, 52.0, t), k = rise * (1 - smooth(49.6, 52.0, t)), p = [HB[0] + UX * 3.6 * go, HB[1] + UZ * 3.6 * go];
      host.position.set(p[0], hC(HB[0], HB[1]) - .6 * smooth(49.0, 52.0, t), p[1]); host.scale.setScalar(Math.max(.001, k)); host.visible = k > .01; }
    // ---- the herd and its herdsmen
    DK.forEach((K, a) => { const p = kp(t, K), isA = !!a.legs; a.group.visible = true;
      if (isA) { const i = HERD.indexOf(a), j = i; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(-UX + .35 * Math.sin(j * 2.1), -UZ + .3 * Math.cos(j * 1.7)); const big = i >= 16; if (p.mv) walkLegs(a.legs, t + j * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); }
      else { const ph = 1 + HERDM.indexOf(a) * 1.3; fig(a, p.x, p.z, p.mv ? headZ(p.vx, p.vz) : headZ(-UX * .3 + .2, -UZ * .3), p.mv, t, ph, { ...sway(1.3, ph) }, 6); } });
    // ---- Jacob
    { const jp = jPos(t), mvK = t >= 44.8, pk_ = mvK ? kp(t, JK.keys) : null, walkAhead = t > 10.4 && t < 15.3;
      const toFam = headZ(-UX * .9 - UZ * .4, -UZ * .9 + UX * .4), toE = headZ(UX, UZ), toEj = headZ(-UX, -UZ);
      const turnA = smooth(8.0, 9.2, t), turnB = smooth(25.0, 26.0, t);
      let ry; if (mvK) ry = pk_.mv ? headZ(pk_.vx, pk_.vz) : toE; else if (t < 4.4) ry = toE; else if (t < 4.8) ry = lerp(toE, toFam, smooth(4.4, 4.8, t)); else if (t < 9.2) ry = lerp(toFam, toE, turnA); else if (t < 17.6) ry = toE; else ry = toEj;
      const bw = Math.max(...[0, 1, 2, 3, 4, 5, 6].map(k => sinP(t, BOW0 + BOWD * k - .3, .6)));
      const arm = GE(t, [[4.6, 5.3, 8.0, 8.8, { a0x: -.9, a0z: -.55 }], [17.2, 17.8, 18.0, 18.2, { a0x: -.9, a1x: -.9 }], [23.4, 24.0, 26.6, 27.4, { a0x: -.7, a0z: -.7 }], [35.8, 36.4, 40.0, 40.8, { a0x: -.75, a1x: -.75, a0z: -.5, a1z: .5 }], [40.8, 41.5, 43.8, 44.4, { a1x: -1.25, a1z: -.8 }]]);
      const emb = ON(t, 18.0, 18.5, 22.0, 22.8), wp = Math.sin(t * 7.1) * emb;
      const placing = ON(t, 56.4, 56.9, 57.6, 58.2), pray = ON(t, 58.0, 58.8, 62, 63);
      const ex = { ...arm, a0x: (arm.a0x || 0) - 1.3 * bw - 1.05 * emb - 1.1 * placing - .7 * pray, a1x: (arm.a1x || 0) - 1.3 * bw - 1.05 * emb - 1.1 * placing - .7 * pray, a0z: (arm.a0z ?? 0) + .45 * emb + .15 * wp * .2, a1z: (arm.a1z ?? 0) - .45 * emb - .15 * wp * .2,
        lx: 1.2 * bw + .08 * emb + .05 * wp * emb, lz: (walkAhead || (mvK && pk_.mv) ? .09 + .04 * Math.sin(t * 5.2) : 0), s: 1 - .1 * bw };
      const jx = jp[0], jz = jp[1];
      let ryF = ry; if (t > 53.5 && !(mvK && pk_.mv)) ryF = headZ(ALT[0] - jx, ALT[1] - jz);
      fig(jacob, jx, jz, ryF, walkAhead || (mvK && pk_.mv), t, 6.2, { ...ex, ...sway(1.5, 0) }, 5.2);
      state.jacob = [jx, gAt(jx, jz), jz]; }
    // ---- Esau
    { const p = kp(t, EK.keys), run = t > 15.8 && t < 17.9, mv = p.mv, away = smooth(49.6, 52.0, t);
      const toJ = headZ(-UX, -UZ), toFam = headZ(-UX * .5 - UZ * 1.0, -UZ * .5 + UX * 1.0);
      let ry; if (mv) ry = headZ(p.vx, p.vz); else if (t < 15.8) ry = toJ; else if (t > 23.2 && t < 27.0) ry = toFam; else ry = toJ;
      const emb = ON(t, 18.0, 18.4, 22.0, 22.8), wp = Math.sin(t * 7.1 + 1) * emb, runA = run ? 1 : 0;
      const arm = GE(t, [[30.8, 31.2, 33.8, 34.4, { a0x: -.45, a1x: -.45, a0z: -.7, a1z: .7 }], [43.6, 44.2, 45.4, 46.2, { a1x: -1.1, a1z: .2 }], [23.4, 24.0, 25.6, 26.4, { a1x: -.8, a1z: .6 }]]);
      const ex = { ...arm, a0x: (arm.a0x || 0) - 1.15 * emb + (run ? -.6 : 0), a1x: (arm.a1x || 0) - 1.15 * emb + (run ? -.6 : 0), a0z: (arm.a0z ?? 0) + .45 * emb - (run ? 1.05 : 0), a1z: (arm.a1z ?? 0) - .45 * emb + (run ? 1.05 : 0), lx: .32 * emb + .05 * wp + (run ? .12 : 0), s: 1 - .003 * 0 };
      esau.group.visible = away < .98;
      fig(esau, p.x, p.z, ry, mv, t, 1.7, { ...ex, ...sway(1.4, 2), sx: 1 - away * .98 }, run ? 13 : 6);
      state.esau = [p.x, gAt(p.x, p.z), p.z]; }
    // ---- the family
    FK.forEach(o => { const f = o.f, p = kp(t, o.keys), mv = p.mv, bw = sinP(t, o.bowT - .1, .9), big = f.sc > .4, tail = t > 53;
      let ry = mv ? headZ(p.vx, p.vz) : headZ(UX, UZ); if (!mv && t > 53) ry = headZ(ALT[0] - p.x, ALT[1] - p.z);
      fig(f, p.x, p.z, ry, mv, t, o.ph, { lx: (big ? 1.0 : .85) * bw, a0x: -.4 * bw, a1x: -.4 * bw, ...sway(1.4, o.ph) }, big ? 6 : 7); });
    dustR.update(t, ON(t, 15.8, 16.4, 17.4, 18.2), [(E0[0] + EF[0]) / 2, gAt(EF[0], EF[1]) + .05, (E0[1] + EF[1]) / 2]);
    state.t = t;
  }

""")
out.append(r"""  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', [-8, 4, 6], 14), Dk(16, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', [-8, 4, 6], 14),
    Dk(30, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', [-8, 4, 6], 14), Dk(46, '#c0a8b4', '#6a5040', 1.0, '#ffa860', 2.9, [10, 1.9, -4], .5, '#ffbc88', [-8, 4, 6], 14),
    Dk(58, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', [-8, 4, 6], 14), Dk(62, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', [-8, 4, 6], 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [16, ['#5a86c4', '#f6d09a']], [30, ['#5a86c4', '#f6c890']], [46, ['#6a7fb8', '#f8b078']], [58, ['#7a78b0', '#f6a068']], [62, ['#7a78b0', '#f6a068']]];
  return { group: g, update, light, bg, far, pl: [altarL], state, jacob, rachel, leah, esau };
}
""")
s = '\n'.join(out)
EMB = "  const ember = makeMotes({ n: 36, area: [.5, 1.8, .5], size: .008, v: .3, seed: 45, color: 0xffb060 }); g.add(ember.mesh);\n"
assert s.count(EMB) == 1, 'ember line'
s = s.replace(EMB, '')
SPK = "  const spark = makeMotes({ n: 40, area: [1.2, 3.5, 1.2], size: .007, v: .22, seed: 41, color: 0xffe4a8 }); g.add(spark.mesh);\n"
assert s.count(SPK) == 1, 'spark line'
s = s.replace(SPK, '')   # no fire in this chapter: the unused ember mesh would sit at the origin
open(SRC + 'world33.js', 'w').write(s)
print('world33.js', len(s.split('\n')), 'lines')
