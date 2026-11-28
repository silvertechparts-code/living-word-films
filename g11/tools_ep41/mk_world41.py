#!/usr/bin/env python3
# Derives g11/src/world41.js (Genesis 41, Pharaoh's dreams and Joseph's rise) from world40.js: the island, terrain, river, town, house, courtyard, prison yard and helpers are reused; the sky/cloud colour tables are re-keyed; the people, props, dream visuals, fields, granary, actors, update(), light and sky are new.
S = '/home/claude/g11/'
src = open(S + 'src/world40.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

MARK = "  // ---- the people. Joseph is the same face and body as in Genesis 37"
i = src.index(MARK)
head = src[:i]
L = head.split('\n')
HDR = [
"// Episode 41: Genesis 41 (NRSV-CE). Two years later Pharaoh dreams by the Nile: seven sleek, fat cows come up out of the river and feed on the reed grass, then seven ugly, gaunt cows come up after them and eat the fat ones (41:1-4); he dreams again: seven plump ears of grain on one stalk, then seven thin ears blighted by the east wind that swallow the plump ones (41:5-7); in the morning his spirit is troubled and none of the wise men of Egypt can interpret (41:8);",
"// the cupbearer remembers Joseph (41:9-13); Joseph is brought hurriedly from the dungeon (41:14) and says it is not in him, God will give Pharaoh a favourable answer (41:15-16); he explains: seven years of plenty, then seven of famine (41:25-30), advises a store of grain in the good years (41:33-36); Pharaoh asks whether anyone like him can be found, one in whom is the spirit of God (41:38), and sets him over Egypt (41:41), gives him the signet ring, fine linen and a gold chain (41:42); Joseph is thirty years old (41:46);",
"// he stores the grain of the plenty (41:47-49); before the famine his son Ephraim is born: God has made me fruitful in the land of my affliction (41:52); the famine comes and all lands come to Egypt for grain (41:54-57). Cinematic interpretation: the dream pictures, the court of the house, the four unnamed wise men, the granary yard and its workers, the fields turning dry, the queue on the road, who stands where, the light (dream dawn, morning, golden hour, dusty haze).",
]
assert L[3].startswith("import * as THREE"), L[:5]
head = '\n'.join(HDR + L[3:])
head = rep(head, "const CLOUD = [[0, '#e8c8a0'], [12, '#e8c8a0'], [13, '#f0d4a8'], [50, '#f0d4a8'], [52, '#e8c8a0'], [90, '#e8c8a0'], [100, '#4a4a78'], [110, '#22223a'], [120, '#a8809a'], [130, '#c8c4cc']];",
            "const CLOUD = [[0, '#f0d4a8'], [50, '#f0d4a8'], [52, '#e8c8a0'], [56, '#e8c8a0'], [57.5, '#d8c4a8'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];")
head = rep(head, "const CEM = [[0, '#6a5848'], [90, '#6a5848'], [100, '#3a3a58'], [110, '#22223a'], [120, '#5a4a52'], [130, '#6a6068']];",
            "const CEM = [[0, '#6a5848'], [56, '#6a5848'], [57.5, '#6a5c4a'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];")

NEW3 = r"""  // ---- the people. Joseph keeps the face and body of Genesis 37, 39 and 40 (seed 930): the plain tunic of the prison, then fine linen (41:42). Pharaoh and the cupbearer are the figures of Genesis 40 (seeds 972 and 970). The four wise men, the workers and the people of the queue are new, unnamed figures
  const joN = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', sash: '#6a3a1a', seed: 930 }, .44);
  const joL = person(rng(930), { pants: '#efe6d0', top: '#f4ecd8', skin: '#c58c60', hair: '#2a1a10', sash: '#d8b048', seed: 930 }, .44);
  const cup = person(rng(970), { pants: '#e8dcc0', top: '#7a3a5a', skin: '#b98a62', hair: '#1a1410', sash: '#d8b048', seed: 970 }, .43);
  const pha = person(rng(972), { pants: '#efe6d0', top: '#f2ead6', skin: '#b98a62', hair: '#1a1410', cloth: '#2e5a9a', mantle: '#c9a15a', sash: '#d8b048', seed: 972 }, .5);
  { const b = new GB(rng(973)); b.box('#d8aa48', [0, 1.1, 0], [.23, .05, .23], [0, 0, 0], .008); b.box('#e8c458', [0, 1.145, .115], [.03, .07, .03], [0, 0, 0], .004); b.box('#d8aa48', [0, 1.14, -.115], [.2, .04, .02], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; pha.group.add(m); }
  const mkSage = (seed, top, skin, beard, cloth) => person(rng(seed), { pants: '#e0d4b8', top, skin, hair: '#2a1a10', beard, cloth, sash: '#8a6a3a', seed }, .45);
  const sg = [mkSage(960, '#4a6a9a', '#b98a62', '#3a2a1a', '#efe6d0'), mkSage(961, '#8a5a3a', '#a8714a', null, '#e0d4b8'), mkSage(962, '#5a7a5a', '#c58c60', '#6a5a4a', '#d8ccb0'), mkSage(963, '#7a4a6a', '#9a6a44', null, '#efe6d0')];
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  const WKC = [['#9a6a44', '#c8a878', '#a8714a'], ['#6a7a5a', '#d8c8a0', '#b98a62'], ['#8a5a3a', '#e0d0b0', '#9a6a44'], ['#7a6a8a', '#d0c0a0', '#c58c60']];
  const wk = WKC.map(([top, pants, skin], i) => person(rng(940 + i), { pants, top, skin, hair: '#2a1a10', sash: '#6a4a2a', seed: 940 + i }, .42));
  const QC = [['#a8714a', '#c8b08a', '#b98a62'], ['#6a5a7a', '#d8ccb0', '#c58c60'], ['#8a6a3a', '#cfc2a0', '#a8714a'], ['#7a8a6a', '#d8c8a8', '#9a6a44'], ['#9a5a4a', '#e0d4b8', '#b98a62'], ['#5a6a8a', '#d0c4a4', '#c58c60'], ['#8a7a5a', '#d8ccb0', '#a8714a']];
  const qp = QC.map(([top, pants, skin], i) => person(rng(1000 + i), { pants, top, skin, hair: '#2a1a10', beard: i % 3 === 1 ? '#3a2a1a' : null, cloth: i % 2 ? '#d8ccb0' : null, sash: '#6a4a2a', seed: 1000 + i }, .4 + .008 * i));
  const dnk = [0, 1].map(i => { const s = makeDonkey(rng(810 + i)); s.group.scale.setScalar(.55); g.add(s.group); return s; });
  const ALLP = [joN, joL, cup, pha, ...sg, gu1, gu2, ...wk, ...qp]; ALLP.forEach(o => g.add(o.group));
  // ---- Joseph's gold chain (41:42) and the baby of 41:52 ride on the linen figure and are shown on their shots
  const chainG = new THREE.Group(); { const b = new GB(rng(791)), N = 20; for (let k = 0; k < N; k++) { const a = k / N * TAU, s = Math.sin(a), fr = s > 0 ? s * s : 0; b.box(k % 2 ? '#e8c040' : '#d8aa30', [Math.cos(a) * .17, .925 - .17 * fr, s * .17], [.038, .03, .038], [0, -a, 0], .003); }
    b.box('#f2ce50', [0, .735, .175], [.05, .06, .02], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; chainG.add(m); chainG.visible = false; joL.group.add(chainG); }
  const babyG = new THREE.Group(); { const b = new GB(rng(790)); b.box('#efe6d4', [0, 0, 0], [.3, .12, .14], [0, 0, 0], .006); b.box('#d8c8a8', [-.02, .05, 0], [.26, .03, .15], [0, 0, 0], .004); b.add(G.ico0, '#d9a073', [.15, .02, .02], [.07, .07, .07], [0, 0, 0], .003); b.add(G.ico0, '#2a1a10', [.15, .06, 0], [.06, .035, .06], [0, 0, 0], .003);
    babyG.add(new THREE.Mesh(b.build(), lam)); babyG.position.set(0, .6, .3); babyG.visible = false; joL.group.add(babyG); }
  // ---- props: Pharaoh's seat at the portico, the signet ring (41:42), sacks of grain
  const thr = new THREE.Group(); { const b = new GB(rng(385)), x = -6.02, z = -.6, y = hC(x, z) + .03;
    b.box('#bfa87c', [x, y + .01, z], [.44, .02, .44], [0, 0, 0], .004); b.box('#8a6a3a', [x, y + .08, z], [.27, .12, .25], [0, 0, 0], .004); b.box('#2e5a9a', [x + .005, y + .15, z], [.25, .025, .23], [0, 0, 0], .003);
    b.box('#8a6a3a', [x - .115, y + .3, z], [.03, .3, .25], [0, 0, 0], .004); b.box('#d8aa48', [x - .118, y + .46, z], [.036, .028, .27], [0, 0, 0], .003); for (const dz of [-.115, .115]) b.box('#8a6a3a', [x, y + .2, z + dz], [.24, .03, .03], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; thr.add(m); g.add(thr); }
  const RINGP = new THREE.Mesh(new THREE.TorusGeometry(.016, .0055, 6, 12), new THREE.MeshLambertMaterial({ color: 0xe8c040, emissive: 0x7a5a10 })); RINGP.visible = false; g.add(RINGP);
  const sackB = (b, x, y, z, ry = 0) => { b.add(G.ico0, '#d8c9a0', [x, y + .045, z], [.06, .05, .09], [0, ry, 0], .004); b.box('#a8946a', [x, y + .1, z], [.03, .02, .03], [0, ry, 0], .002); };
  const sackStack = (b, x, z, ry = 0) => { const y = hC(x, z); for (const [dx, dz] of [[-.07, -.1], [.07, -.1], [-.07, .1], [.07, .1], [0, 0]]) sackB(b, x + dx, y, z + dz, ry); for (const [dx, dz] of [[0, -.1], [0, .1]]) sackB(b, x + dx, y + .08, z + dz, ry); sackB(b, x, y + .16, z, ry); };
  const sackCourt = new THREE.Group(); { const b = new GB(rng(792)); sackStack(b, -4.15, -1.45); sackStack(b, -4.28, -1.18, .4); sackB(b, -4.05, hC(-4.05, -1.2), -1.2, .8); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; sackCourt.add(m); g.add(sackCourt); }
  const SCK = [0, 1, 2, 3].map(i => { const b = new GB(rng(795 + i)); sackB(b, 0, -.04, 0); const m = new THREE.Mesh(b.build(), lam); m.visible = false; g.add(m); return m; });
  // ---- the dreams: seven fat cows and seven gaunt ones (41:2-4) come up out of the Nile and out onto the bank; two stalks, one with seven plump ears and one with seven thin ones (41:5-7)
  const FATC = ['#9a5a34', '#b87e4c', '#cfa774', '#8a4a2c', '#c0885a', '#a8683c', '#d4b690'];
  const mkFat = i => makeQuad({ rn: rng(700 + i), len: .56, h: .23, w: .21, legL: .17, legW: .048, col: FATC[i % 7], col2: '#ecdcbc', neck: [.14, .85, .11], head: [.17, .11, .1], horns: true, ears: false, legCol: '#5a4430' });
  const mkThin = i => { const s = makeQuad({ rn: rng(720 + i), len: .56, h: .15, w: .12, legL: .21, legW: .028, col: '#8c7c68', col2: '#6a5e4e', neck: [.17, .95, .06], head: [.19, .12, .07], horns: true, ears: false, legCol: '#4a3e32' });
    const b = new GB(rng(740 + i)); for (let k = 0; k < 6; k++) for (const sz of [-1, 1]) b.box('#4e4234', [-.2 + k * .08, .285, sz * .062], [.012, .1, .006], [0, 0, 0], .003); s.group.add(new THREE.Mesh(b.build(), lam)); return s; };
  const COWS = [], FZ = i => -1.7 + i * .37;
  for (let i = 0; i < 7; i++) { const z = FZ(i), c = mkFat(i); g.add(c.group); COWS.push({ q: c, i, fat: true, keys: route(0, [RV(z) + .35, z]).wait(.06 * i + .05).go(.85, [-1.7 - .1 * (i % 2), z]).wait(9).keys }); }
  for (let i = 0; i < 7; i++) { const z = FZ(i) + .17, c = mkThin(i); g.add(c.group); COWS.push({ q: c, i, fat: false, keys: route(0, [RV(z) + .1, z]).wait(.9 + .1 * i).go(.9, [-1.3 - .12 * (i % 2), z]).wait(9).keys }); }
  const SKP = [[-2.06, 2.22], [-1.8, 2.26]];
  const mkStalk = plump => { const gr = new THREE.Group(), b = new GB(rng(plump ? 761 : 762)), e = new GB(rng(plump ? 763 : 764)), H = .78;
    for (let k = 0; k < 7; k++) b.box(k % 2 ? '#8a9a4a' : '#7c8c40', [Math.sin(k * .8) * .004, (k + .5) * H / 7, 0], [.034 - k * .0016, H / 7 + .01, .034 - k * .0016], [0, 0, 0], .004);
    for (let k = 0; k < 3; k++) { const a = k * 2.1, yy = .12 + k * .13; b.box('#6f9a42', [Math.cos(a) * .13, yy + .05, Math.sin(a) * .13], [.26, .012, .05], [0, -a, .45], .006); }
    for (let k = 0; k < 7; k++) { const y = .3 + k * .068 - .5, ra = k * 2.4, x = Math.cos(ra) * .05, z = Math.sin(ra) * .05;
      if (plump) { e.add(G.ico0, k % 2 ? '#e0b040' : '#d4a434', [x, y, z], [.052, .105, .052], [Math.sin(ra) * .25, 0, -Math.cos(ra) * .25], .004); for (let m = 0; m < 3; m++) e.box('#f0d078', [x + Math.cos(ra) * (m - 1) * .012, y + .1, z + Math.sin(ra) * (m - 1) * .012], [.004, .08, .004], [0, 0, (m - 1) * .1], .001); }
      else { e.add(G.ico0, k % 2 ? '#a89a76' : '#968a68', [x, y - .01, z], [.032, .075, .032], [Math.sin(ra) * .6, 0, -Math.cos(ra) * .6], .004); e.box('#5a4e38', [x, y + .03, z], [.012, .02, .012], [0, 0, 0], .001); } }
    const stem = new THREE.Mesh(b.build(), lam), ears = new THREE.Mesh(e.build(), lam); ears.position.y = .5; stem.castShadow = ears.castShadow = true; gr.add(stem, ears); return { group: gr, stem, ears }; };
  const stA = mkStalk(true), stB = mkStalk(false);
  stA.group.position.set(SKP[0][0], hC(SKP[0][0], SKP[0][1]) - .01, SKP[0][1]); stB.group.position.set(SKP[1][0], hC(SKP[1][0], SKP[1][1]) - .01, SKP[1][1]); g.add(stA.group, stB.group);
  // ---- the fields of the plenty and of the famine (41:29-31, 41:54): the same rows, green and gold, then dry
  const FLD = [[-3.1, 2.7, -.95, 5.7], [-7.4, 3.4, -4.7, 5.9], [2.55, 4.7, 4.85, 6.8]];
  const mkField = lush => { const b = new GB(rng(lush ? 771 : 772)), rr = rng(lush ? 773 : 774);
    for (const [x0, z0, x1, z1] of FLD) { const nr = Math.round((x1 - x0) / .17), nz = Math.round((z1 - z0) / .15);
      for (let r = 0; r < nr; r++) for (let k = 0; k < nz; k++) { const x = x0 + (r + .5) * (x1 - x0) / nr + (rr() - .5) * .03, z = z0 + (k + .5) * (z1 - z0) / nz + (rr() - .5) * .04, y = hC(x, z);
        if (lush) { const h = .17 + rr() * .1; b.box(pk(rr, ['#6a9a3e', '#5f8f38', '#78a444', '#8aa84a']), [x, y + h / 2, z], [.07, h, .07], [(rr() - .5) * .2, rr() * 3, (rr() - .5) * .2], .01); if (rr() < .55) b.box(pk(rr, ['#d8b848', '#c9a83c']), [x, y + h + .012, z], [.05, .04, .05], [0, rr() * 3, 0], .005); }
        else { const h = .035 + rr() * .045; b.box(pk(rr, ['#b8a478', '#a89466', '#c4b088']), [x, y + h / 2, z], [.06, h, .06], [(rr() - .5) * .5, rr() * 3, (rr() - .5) * .5], .01); } } }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = lush; m.receiveShadow = true; ca.add(m); return m; };
  const fLush = mkField(true), fDry = mkField(false);
  // ---- the granary yard east of the river: three round granaries, a low wall, sacks, and two heaps of grain that grow (41:47-49)
  const SILOS = [[3.05, 3.02], [3.62, 3.12], [3.32, 3.78]], PILES = [[1.95, 2.95], [1.98, 3.55]];
  { const b = new GB(rng(780)), rr = rng(781), cols = ['#cdb48c', '#c2a67a', '#d4c29c'];
    wallB(b, rr, 2.2, 2.5, 4.3, 2.5, .13, .09, cols); wallB(b, rr, 4.3, 2.5, 4.3, 4.4, .13, .09, cols); wallB(b, rr, 4.3, 4.4, 2.2, 4.4, .13, .09, cols);
    for (const [x, z] of SILOS) { const y = hC(x, z); b.add(G.cylT, '#c8b088', [x, y, z], [.26, .52, .26], [0, 0, 0], .02); b.box('#b09a70', [x, y + .26, z], [.54, .03, .5], [0, 0, 0], .01); b.add(G.ico1, '#b8a078', [x, y + .52, z], [.27, .17, .27], [0, 0, 0], .02); b.box('#2a1c12', [x - .255, y + .1, z], [.03, .13, .1], [0, 0, 0], .004); b.box('#2a1c12', [x, y + .68, z], [.08, .03, .08], [0, 0, 0], .004); }
    sackStack(b, 3.95, 2.78); sackStack(b, 4.05, 3.9, .5); sackStack(b, 2.75, 4.15, -.4); sackB(b, 3.0, hC(3.0, 3.5), 3.5, .5); sackB(b, 3.7, hC(3.7, 3.5), 3.5, 1.1);
    ca.add(meshOf(b)); }
  const pileM = PILES.map(([x, z], i) => { const b = new GB(rng(783 + i)); b.add(G.ico1, '#d8aa44', [0, .09, 0], [.34, .2, .3], [0, i, 0], .012); b.add(G.ico0, '#c8982c', [.12, .06, .1], [.18, .1, .16], [0, 1, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z), z); m.castShadow = true; ca.add(m); return m; });
"""

NEW4 = r"""
  let SID = '';
  const headingOf = (a, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null; return fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); };
  const heldAt = (a, fw, side, h, tt, y0 = 0) => { const p = kp(tt, a.keys), hd = headingOf(a, tt); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, gAt(p.x, p.z) + y0 + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const aU = k => k > .001 ? { a0x: -2.7 * k, a1x: -.3 * k, a0z: -.35 * k, a1z: .1 * k } : {}, aQ = k => k > .001 ? { a1x: -1.4 * k, a1z: .1 * k } : {};
  const TH = [-6.02, -.6], JP = [-4.95, -.6], PS = [-5.4, -.6], CQ = [-4.05, -.62], SG = [[-4.5, -1.75], [-4.25, -1.15], [-4.25, -.05], [-4.5, .5]];
  // ---- shot 1 (0-4.7): Pharaoh stands by the Nile (41:1); the cows come up out of the river (see COWS)
  const aP0 = still(pha, [-2.4, .1], 0, 4.7, { face: () => Math.PI / 2 - .2, ex: t => mixA(aO(.2 * ON(t, 3.0, 3.6, 4.2, 4.7))) });
  // ---- shots 3-4 (9.4-16.2): the court; the wise men stand, no one can interpret (41:8); the cupbearer steps forward (41:9)
  SG.forEach((p, i) => still(sg[i], p, 9.4, 43.5, { face: () => toward(p[0], p[1], TH), ex: t => mixA(...[
    [aO(.5 * ON(t, 10.4, 11.0, 12.2, 12.8)), aF(.3 * ON(t, 33.0, 33.6, 36.0, 36.6))], [{ lx: .14 * ON(t, 10.6, 11.4, 12.6, 13.2) }, aO(.3 * ON(t, 34.0, 34.6, 36.4, 37.0))], [aF(.45), { lx: .05 * ON(t, 38, 38.6, 40, 40.6) }], [aO(.4 * ON(t, 11.6, 12.2, 12.8, 13.1)), aF(.35 * ON(t, 29.4, 30, 31.6, 32.2))]][i]) }));
  const aC1 = act(cup, route(9.4, CQ).wait(13.2).go(.55, [-5.2, -.95]).wait(16.2).keys, { sp: 6, show: W_(9.4, 16.2), face: (t, p) => p.mv ? null : toward(p.x, p.z, TH), ex: t => mixA(aF(.55 * ON(t, 15.1, 15.6, 16.1, 16.3))) });
  const aC2 = still(cup, [-4.1, -1.55], 16.2, 43.5, { face: () => toward(-4.1, -1.55, TH), ex: t => mixA(aF(.5)) });
  const aP1 = still(pha, TH, 9.4, 36.1, { y: () => .06, face: () => Math.PI / 2, ex: t => mixA({ lx: .05 * ON(t, 11, 11.6, 12.6, 13.2) }, aO(.4 * ON(t, 11.8, 12.4, 12.8, 13.1)), aF(.35 * ON(t, 17.0, 17.6, 19, 19.6)), aO(.5 * ON(t, 33.6, 34.2, 35.2, 35.8))) });
  // ---- shot 5 (16.0-19.6): Joseph is brought hurriedly out of the dungeon between two guards (41:14)
  act(joN, route(16.0, [-3.3, -4.05]).go(.5, [-3.3, -3.3]).go(.55, [-3.3, -2.3]).keys, { sp: 7, show: W_(16.0, 19.6), face: (t, p) => p.mv ? null : headZ(0, 1) });
  act(gu1, route(16.0, [-3.68, -3.45]).wait(17.0).go(.55, [-3.62, -2.35]).keys, { sp: 7, show: W_(16.0, 19.6), face: (t, p) => p.mv ? null : headZ(0, 1) });
  act(gu2, route(16.0, [-2.92, -3.45]).wait(17.0).go(.55, [-2.98, -2.35]).keys, { sp: 7, show: W_(16.0, 19.6), face: (t, p) => p.mv ? null : headZ(0, 1) });
  // ---- shots 6-11 (19.6-43.5): Joseph before Pharaoh: not I, God will give an answer (41:16); the store (41:33-36); Pharaoh stands and sets him over Egypt (41:38-41); the ring (41:42)
  const aJb = still(joN, JP, 19.6, 43.5, { face: () => -Math.PI / 2, ex: t => mixA(aF(.3 * ON(t, 19.6, 20.2, 20.8, 21.2)), aU(ON(t, 21.3, 21.9, 23.1, 23.7)), aO(.5 * ON(t, 29.0, 29.5, 31.6, 32.0)), aF(.5 * ON(t, 32.6, 33.2, 35.6, 36.1)), { lx: .1 * ON(t, 37.0, 37.6, 39.4, 39.9) }, aQ(ON(t, 40.8, 41.1, 42.0, 42.5))) });
  const aP2 = act(pha, route(36.1, TH).go(.5, PS).wait(43.5).keys, { sp: 6, show: W_(36.1, 43.5), y: t => .06 * (1 - smooth(36.1, 36.9, t)), face: () => Math.PI / 2, ex: t => mixA(aP(ON(t, 38.3, 38.8, 39.7, 40.0)), aP(ON(t, 40.3, 40.8, 41.9, 42.4))) });
  // ---- shots 12 and 14 (43.5-47.4, 51.6-55.7): Joseph in fine linen with the gold chain, then with his son at the portico
  const aL1 = still(joL, [-5.0, -.6], 43.5, 47.4, { face: () => 1.12, ex: t => mixA(aF(.3), { lx: .03 * ON(t, 44.4, 45, 46.4, 47)}) });
  const aL3 = still(joL, [-5.7, -.75], 51.6, 55.7, { face: () => 1.05, ex: t => mixA(aF(1.1), { lx: .06 }) });
  // ---- shot 13 (47.4-51.6): the granary yard: workers carry sacks from the heap to the granaries (41:48-49); Joseph oversees
  const aL2 = still(joL, [3.95, 3.45], 47.4, 51.6, { face: () => -Math.PI / 2 - .05, ex: t => mixA(aP(ON(t, 48.9, 49.4, 50.3, 50.8))) });
  const DOOR = SILOS.map(([x, z]) => [x - .36, z]), WK = [[0, 0], [1, 1], [0, 2], [1, 1]].map(([pl, sl], i) => { const P0 = [PILES[pl][0] + .3, PILES[pl][1] + (i % 2 ? .12 : -.1)], D0 = DOOR[sl], r = route(47.4 - .5 * i, P0); for (let k = 0; k < 4; k++) r.go(.5, k % 2 ? P0 : D0); r.wait(51.6);
    return { a: act(wk[i], r.keys, { sp: 7, show: W_(47.4, 51.6), face: (t, p) => p.mv ? null : headZ(D0[0] - P0[0], D0[1] - P0[1]), ex: () => mixA(aF(.5)) }), P0, D0 }; });
  // ---- shot 15 (55.7-61.7): the famine: a line of people walks the road toward the granaries, two with donkeys (41:54-57)
  const roadZ = x => { for (let i = 0; i < PATH.length - 1; i++) { const a = PATH[i], b = PATH[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return x < PATH[0][0] ? PATH[0][1] : PATH[PATH.length - 1][1]; };
  const QA = qp.map((f, i) => { const x0 = .2 - i * .72, off = (i % 2 ? .12 : -.1), r = route(53.0, [x0, roadZ(x0) + off]); alongE(r, .5, off, x0 + .05, 2.0); r.go(.5, [2.45, 2.45]).go(.5, [2.0, 3.0]).wait(61.7); return act(f, r.keys, { sp: 6, show: W_(55.7, 61.7), ex: () => mixA(i % 3 === 0 ? aF(.5) : {}) }); });
  const DNA = [2, 5].map(i => { const q = QA[i], ks = q.keys.map(([t, x, z, e]) => [t + .9, x - .35, z + .12, e]); return ks; });
"""

NEW5 = r"""
  function update(t, camera, sid) {
    SID = sid;
    const cam = camera && camera.position, MOOD = { cows: 110, ears: 110 }, tc = MOOD[sid] ?? t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    const dreamS = sid === 'cows' || sid === 'ears', night = dreamS ? .1 : 0;
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5, [1, .5, 2.5]);
    { water.material.color.setRGB(.36, .48, .62); water.material.emissive.setRGB(.18, .25, .31);
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = .6 * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    townG.visible = true;
    // ---- the actors: every one is a pure function of time (and of the shot)
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return;
      const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // keep the close-ups clear: a sage or the cupbearer standing between the camera and the subject is not drawn
    if (camera && camera.userData && camera.userData.T && ['before', 'asks', 'over', 'ring', 'chain', 'store'].includes(sid)) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      [...sg, cup].forEach(f => { if (!f.group.visible) return; const q = f.group.position, px = q.x - C.x, py = q.y + .25 - C.y, pz = q.z - C.z, u = (px * vx + py * vy + pz * vz) / l2;
        if (u > 0 && u < .98) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; if (Math.hypot(dx, dy, dz) < .15 + 1.3 * hw * u) f.group.visible = false; } }); }
    // ---- the cows: seven fat come up out of the river, seven gaunt follow, and the fat ones are gone (41:2-4)
    COWS.forEach(c => { const G_ = c.q.group, on = sid === 'cows'; G_.visible = on; if (!on) return;
      const p = kp(t, c.keys), y = gAt(p.x, p.z), k = c.fat ? Math.max(.001, 1 - smooth(3.7 + .07 * c.i, 4.4 + .07 * c.i, t)) : 1;
      G_.position.set(p.x, y - .02, p.z); G_.rotation.y = hdgAt(c.keys, t) - Math.PI / 2; G_.scale.setScalar(k); walkLegs(c.q.legs, t + c.i, 8, p.mv ? .42 : 0); });
    // ---- the stalks: seven plump ears, then seven thin ones grow beside them and the plump ones are swallowed (41:5-7)
    { const on = sid === 'ears'; stA.group.visible = stB.group.visible = on; const kb = smooth(6.2, 7.4, t);
      stA.ears.scale.setScalar(Math.max(.02, 1 - .97 * smooth(8.0, 9.2, t))); stB.group.scale.set(1, Math.max(.02, kb), 1); stB.ears.scale.setScalar(Math.max(.02, smooth(7.0, 8.0, t))); }
    // ---- the fields: green and gold in the years of plenty, dry once the famine has come (41:29-30, 41:54)
    { const dry = sid === 'years' ? smooth(26.6, 27.9, t) : (sid === 'famine' ? 1 : 0); fLush.scale.y = Math.max(.001, 1 - dry); fLush.visible = dry < .98; fDry.visible = true; }
    // ---- the granary: the heaps grow while the workers carry sacks (41:47-49)
    { const gk = .3 + .7 * smooth(47.4, 51.6, t); pileM.forEach(m => m.scale.setScalar(gk));
      SCK.forEach(m => m.visible = false);
      if (sid === 'granaries') WK.forEach((w, i) => { const p = kp(t, w.a.keys), to = (p.vx * (w.D0[0] - w.P0[0]) + p.vz * (w.D0[1] - w.P0[1])) > 0; if (!p.mv || !to) return; const h = heldAt(w.a, .1, 0, .3, t); SCK[i].visible = true; SCK[i].position.set(h[0], h[1], h[2]); SCK[i].rotation.y = h[3]; }); }
    // ---- the donkeys of the queue
    dnk.forEach((d, i) => { const on = sid === 'famine' && t >= 55.7; d.group.visible = on; if (!on) return; const ks = DNA[i], p = kp(t, ks); d.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); d.group.rotation.y = hdgAt(ks, t) - Math.PI / 2; walkLegs(d.legs, t + i, 7, p.mv ? .4 : 0); });
    // ---- the signet ring passes from Pharaoh's hand to Joseph's (41:42); the chain and the baby show on their shots
    { RINGP.visible = sid === 'ring';
      if (RINGP.visible) { const a = heldAt(aP2, .2, -.09, .37, t), b = heldAt(aJb, .17, .09, .35, t), k = smooth(40.9, 41.3, t); RINGP.position.set(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)); RINGP.rotation.set(Math.PI / 2, 0, 0); } }
    chainG.visible = t >= 44.65; chainG.scale.setScalar(.2 + .8 * smooth(44.65, 45.15, t)); babyG.visible = sid === 'son'; sackCourt.visible = sid === 'store';
    dust.update(t, sid === 'famine' ? .9 : .15, [0, 0, 0]); dustR.update(t, sid === 'famine' ? .7 : 0, [-1.4, .3, 1.6]);
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const MORN = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.5, [9, 3.4, -5], .5, '#ffcf9a', FD, 14];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const HAZE = ['#c8b8a8', '#6a5848', .98, '#ffd0a0', 2.1, [9, 3.6, -5], .5, '#e8c8a0', FD, 14];
  const light = [Dk(0, ...MORN), Dk(51.0, ...MORN), Dk(52.0, ...GOLD), Dk(55.2, ...GOLD), Dk(56.4, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#6a8ec8', '#f8d4a0']], [50, ['#6a8ec8', '#f8d4a0']], [52, ['#5a86c4', '#f6c890']], [55.2, ['#5a86c4', '#f6c890']], [56.4, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL], state };
}
"""
out = head + NEW3 + NEW4 + NEW5
open(S + 'src/world41.js', 'w').write(out)
print('world41.js', len(out))
