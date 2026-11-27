#!/usr/bin/env python3
# Derives g11/src/world40.js (Genesis 40, The Cupbearer and the Baker) from world39.js: the island, terrain, river, town, house, courtyard, prison yard, torches and helpers are reused; the mats are moved, the sky/cloud colour tables are re-keyed by mood, and the people, props, dream visuals, actors, update(), light and sky are new.
S = '/home/claude/g11/'
src = open(S + 'src/world39.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

MARK = "  // ---- the people. Joseph is the same face and body as in Genesis 37"
i = src.index(MARK)
head = src[:i]
L = head.split('\n')
HDR = [
"// Episode 40: Genesis 40 (NRSV-CE). Pharaoh's cupbearer and baker offend him and are put in custody in the prison where Joseph is held; Joseph attends them (40:1-4); each has a dream in the same night, and Joseph sees in the morning that they are downcast and asks why (40:5-7); they say they dreamed and there is no one to interpret, and Joseph says interpretations belong to God (40:8);",
"// the cupbearer's dream: a vine with three branches, and Pharaoh's cup pressed and put into Pharaoh's hand (40:9-11); Joseph says in three days Pharaoh will restore him, asks him to remember him and speak to Pharaoh, and says he has done nothing to deserve the dungeon (40:12-15); the baker's dream: three baskets on his head and birds eating from the top one (40:16-17); Joseph says in three days Pharaoh will have him executed (40:18-19);",
"// on the third day, Pharaoh's birthday, it happens as Joseph said (40:20-22); but the cupbearer did not remember Joseph; he forgot him (40:23). Cinematic interpretation: the yard and its mats, the faces and clothes, who sits where, the dream pictures (a vine growing in the dark, the stack of baskets, the birds), Pharaoh's seat and table at the house, the light (golden hour, night in the prison, morning, dusk), and that nothing of the baker's death is shown.",
]
assert L[3].startswith("import * as THREE"), L[:5]
head = '\n'.join(HDR + L[3:])
# the mats: two close together for the two men, one under the roofed corner for Joseph
head = rep(head, "[[-4.1, -4.3, .1], [-2.55, -4.15, -.2], [-2.5, -5.4, .3]]", "[[-3.8, -4.5, .05], [-3.0, -4.4, -.08], [-2.5, -5.4, .3]]")
# sky / cloud tables keyed by real time for the day shots and by pseudo-times for moods: 100 night, 110 dream, 120 dusk, 130 cool morning
head = rep(head, "const CLOUD = [[0, '#e8c8a0'], [14, '#e8d0a8'], [27, '#e8c8a0'], [40, '#e8b898'], [44, '#d8a08c'], [46.5, '#a8809a'], [49, '#5a5a88'], [60, '#4a4a78'], [70, '#f0cfa8'], [99, '#f0cfa8']];",
            "const CLOUD = [[0, '#e8c8a0'], [12, '#e8c8a0'], [13, '#f0d4a8'], [50, '#f0d4a8'], [52, '#e8c8a0'], [90, '#e8c8a0'], [100, '#4a4a78'], [110, '#22223a'], [120, '#a8809a'], [130, '#c8c4cc']];")
head = rep(head, "const CEM = [[0, '#6a5848'], [40, '#6a5848'], [44, '#5a4a52'], [47, '#3a3a58'], [60, '#22223a'], [70, '#7a6050'], [99, '#7a6050']];",
            "const CEM = [[0, '#6a5848'], [90, '#6a5848'], [100, '#3a3a58'], [110, '#22223a'], [120, '#5a4a52'], [130, '#6a6068']];")

# the prison walls are separate meshes (N, E, W, S) so the camera-side wall can be lowered in the interior shots (the walls are taller than the seated people); the gate lintel is separate so it can be hidden on the same shots
head = rep(head, "  // ---- the prison yard: a compound of stone with a gate on its south side, a roof over one corner, mats, jars, two torches at the gate\n",
            "  // ---- the prison yard: a compound of stone with a gate on its south side, a roof over one corner, mats, jars, two torches at the gate\n  const pWalls = {}; let pBeam = null;\n")
head = rep(head, "    wallB(b, rr, x0, z0, x1, z0, .72, .17, cols); wallB(b, rr, x0, z0, x0, z1, .72, .17, cols); wallB(b, rr, x1, z0, x1, z1, .72, .17, cols); wallB(b, rr, x0, z1, gl, z1, .72, .17, cols); wallB(b, rr, gr, z1, x1, z1, .72, .17, cols);\n    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) b.box('#aa9d86', [x, hC(x, z) + .43, z], [.22, .86, .22], [0, 0, 0], .02);\n",
            "    const WB = { N: new GB(rng(395)), E: new GB(rng(396)), W: new GB(rng(397)), S: new GB(rng(398)) };\n    wallB(WB.N, rr, x0, z0, x1, z0, .72, .17, cols); wallB(WB.W, rr, x0, z0, x0, z1, .72, .17, cols); wallB(WB.E, rr, x1, z0, x1, z1, .72, .17, cols); wallB(WB.S, rr, x0, z1, gl, z1, .72, .17, cols); wallB(WB.S, rr, gr, z1, x1, z1, .72, .17, cols);\n    for (const [x, z, k] of [[x0, z0, 'N'], [x1, z0, 'N'], [x0, z1, 'S'], [x1, z1, 'S']]) WB[k].box('#aa9d86', [x, hC(x, z) + .43, z], [.22, .86, .22], [0, 0, 0], .02);\n    for (const k of Object.keys(WB)) { pWalls[k] = meshOf(WB[k]); ca.add(pWalls[k]); }\n")
head = rep(head, "    b.box('#5a3a22', [PGATE[0], hC(PGATE[0], z1) + .96, z1], [.66, .07, .14], [0, 0, 0], .008);\n",
            "    { const bb = new GB(rng(399)); bb.box('#5a3a22', [PGATE[0], hC(PGATE[0], z1) + .96, z1], [.66, .07, .14], [0, 0, 0], .008); pBeam = meshOf(bb); ca.add(pBeam); }\n")

NEW3 = r"""  // ---- the people. Joseph is the same face and body as in Genesis 37 and 39 (the plain tunic of a household servant, now a prisoner, no cloak). The cupbearer, the baker and Pharaoh are new, unnamed on screen; the guards and servants are the Ep39 figures. Each dream figure is a second copy of the same person (the dream is a picture, not a second person)
  const joN = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', sash: '#6a3a1a', seed: 930 }, .44);
  const mkCup = () => person(rng(970), { pants: '#e8dcc0', top: '#7a3a5a', skin: '#b98a62', hair: '#1a1410', sash: '#d8b048', seed: 970 }, .43);
  const mkBak = () => person(rng(971), { pants: '#d8ccb0', top: '#e0d6bc', skin: '#a8714a', hair: '#1a1410', beard: '#2a1a10', cloth: '#f0e8d4', sash: '#8a6a3a', seed: 971 }, .45);
  const mkPha = () => person(rng(972), { pants: '#efe6d0', top: '#f2ead6', skin: '#b98a62', hair: '#1a1410', cloth: '#2e5a9a', mantle: '#c9a15a', sash: '#d8b048', seed: 972 }, .5);
  const cup = mkCup(), bak = mkBak(), pha = mkPha(), cupD = mkCup(), bakD = mkBak(), phaD = mkPha();
  const sv1 = person(rng(950), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 950 }, .42);
  const sv2 = person(rng(951), { pants: '#d8c8a8', top: '#d0c0a0', skin: '#b98a62', hair: '#2a1a10', sash: '#8a6a3a', seed: 951 }, .41);
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  [pha, phaD].forEach(o => { const b = new GB(rng(973)); b.box('#d8aa48', [0, 1.1, 0], [.23, .05, .23], [0, 0, 0], .008); b.box('#e8c458', [0, 1.145, .115], [.03, .07, .03], [0, 0, 0], .004); b.box('#d8aa48', [0, 1.14, -.115], [.2, .04, .02], [0, 0, 0], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; o.group.add(m); });
  [bakD].forEach(o => { const b = new GB(rng(974)); for (let k = 0; k < 3; k++) { const y = 1.12 + k * .1; b.add(G.cylT, k % 2 ? '#b8884a' : '#a87a40', [0, y, 0], [.12 - .006 * k, .085, .12 - .006 * k], [0, 0, 0], .006); b.box('#8a5a2a', [0, y + .085, 0], [.25 - .012 * k, .016, .25 - .012 * k], [0, 0, 0], .003); }
    b.add(G.ico0, '#f0dcb0', [-.04, 1.12 + .2 + .1, .02], [.055, .036, .045], [0, 0, 0], .004); b.add(G.ico0, '#e8cf9c', [.04, 1.12 + .2 + .1, -.02], [.05, .034, .045], [0, .6, 0], .004); b.add(G.ico0, '#f4e4bc', [0, 1.12 + .2 + .12, .0], [.045, .03, .04], [0, 1.1, 0], .004);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; o.group.add(m); });
  const ALLP = [joN, cup, bak, pha, cupD, bakD, phaD, sv1, sv2, gu1, gu2]; ALLP.forEach(o => g.add(o.group));
  // ---- props: the gold cup (40:11, 40:21), Pharaoh's seat and table (invented staging for the birthday, 40:20), the vine of the first dream (40:9-10), the birds of the second (40:17)
  const mkCupP = () => { const gr = new THREE.Group(), b = new GB(rng(384)); b.add(G.cylT, '#e0b848', [0, 0, 0], [.034, .062, .034], [0, 0, 0], .004); b.box('#e8c458', [0, .064, 0], [.08, .01, .08], [0, 0, 0], .002); b.box('#c8962c', [0, -.006, 0], [.05, .012, .05], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; gr.add(m); return gr; };
  const CUPP = mkCupP(); g.add(CUPP);
  const thr = new THREE.Group(); { const b = new GB(rng(385)), x = -6.02, z = -.6, y = hC(x, z) + .03;
    b.box('#bfa87c', [x, y + .01, z], [.44, .02, .44], [0, 0, 0], .004); b.box('#8a6a3a', [x, y + .08, z], [.27, .12, .25], [0, 0, 0], .004); b.box('#2e5a9a', [x + .005, y + .15, z], [.25, .025, .23], [0, 0, 0], .003);
    b.box('#8a6a3a', [x - .115, y + .3, z], [.03, .3, .25], [0, 0, 0], .004); b.box('#d8aa48', [x - .118, y + .46, z], [.036, .028, .27], [0, 0, 0], .003); for (const dz of [-.115, .115]) b.box('#8a6a3a', [x, y + .2, z + dz], [.24, .03, .03], [0, 0, 0], .003);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; thr.add(m); g.add(thr); }
  const tbl = new THREE.Group(); { const b = new GB(rng(386)), x = -5.2, z = -2.1, y = hC(x, z);
    b.box('#8a6a3a', [x, y + .2, z], [.92, .035, .3], [0, 0, 0], .004); for (const dx of [-.42, .42]) for (const dz of [-.12, .12]) b.box('#6a4a2a', [x + dx, y + .1, z + dz], [.03, .2, .03], [0, 0, 0], .003);
    b.box('#efe6d0', [x, y + .22, z], [.88, .006, .27], [0, 0, 0], .002); b.add(G.ico0, '#e0b878', [x - .28, y + .25, z - .05], [.05, .032, .045], [0, 0, 0], .004); b.add(G.ico0, '#e8cf9c', [x - .2, y + .245, z + .06], [.045, .03, .04], [0, .5, 0], .004);
    b.add(G.ico0, '#a8402e', [x - .02, y + .245, z], [.03, .03, .03], [0, 0, 0], .003); b.add(G.ico0, '#d8a838', [x + .04, y + .243, z + .05], [.03, .028, .03], [0, 0, 0], .003); b.add(G.ico0, '#7a3a6a', [x + .06, y + .243, z - .06], [.028, .028, .028], [0, 0, 0], .003);
    b.add(G.cylT, '#b87a4a', [x + .3, y + .225, z + .03], [.04, .09, .04], [0, 0, 0], .004); b.add(G.cylT, '#a8683c', [x + .38, y + .225, z - .05], [.032, .07, .032], [0, 0, 0], .004);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; tbl.add(m); g.add(tbl); }
  // the dream stage floats in the sky above the prison yard; the vine, the baskets and the birds live there
  const DS = [-3.3, -4.8], DY = 2.2, VY = gAt(DS[0], DS[1]) + 1.95;
  const vineG = new THREE.Group(); vineG.position.set(DS[0], VY, DS[1]); g.add(vineG);
  const vTrunk = new THREE.Group(), vBr = [new THREE.Group(), new THREE.Group(), new THREE.Group()]; vineG.add(vTrunk); vBr.forEach(b => { b.position.set(0, 1.0, 0); vineG.add(b); });
  { const b = new GB(rng(990)); for (let k = 0; k < 6; k++) b.box(k % 2 ? '#6a4a2a' : '#7a5632', [Math.sin(k * 1.1) * .03, .09 + k * .17, Math.cos(k * 1.3) * .03], [.075 - k * .007, .2, .075 - k * .007], [0, k * .5, Math.sin(k) * .12], .01);
    for (let k = 0; k < 3; k++) { const a = k * 2.1; b.box('#4f8f3a', [Math.cos(a) * .09, .35 + k * .2, Math.sin(a) * .09], [.12, .014, .08], [0, -a, .5], .01); }
    vTrunk.add(new THREE.Mesh(b.build(), lam)); }
  [[.95, 0], [0, .5], [-.95, 0]].forEach(([rz, ry], i) => { const b = new GB(rng(991 + i)); let x = 0, y = 0;
    for (let k = 0; k < 5; k++) { const a = .12 * k; b.box(k % 2 ? '#6a4a2a' : '#7a5632', [x + Math.sin(a) * .09, y + Math.cos(a) * .09, 0], [.045 - k * .004, .19, .045 - k * .004], [0, 0, -a], .008); x += Math.sin(a) * .18; y += Math.cos(a) * .18;
      const s = k % 2 ? 1 : -1; b.box(['#4f8f3a', '#5f9f44', '#46843a'][k % 3], [x + s * .07, y - .02, .03 * s], [.16, .012, .1], [0, .4 * s, .35 * s], .008); b.box('#5f9f44', [x - s * .06, y + .03, -.03 * s], [.14, .012, .09], [0, -.4 * s, -.3 * s], .008); }
    for (let k = 0; k < 7; k++) { const a = k * 2.4; b.add(G.ico0, ['#6a3a8a', '#5a2f7a', '#7a4a9a'][k % 3], [x + Math.cos(a) * .04, y - .07 - (k % 3) * .045, Math.sin(a) * .04], [.034, .034, .034], [0, 0, 0], .004); }
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; vBr[i].add(m); vBr[i].rotation.set(0, ry, rz); });
  const vPool = pool(1.1, 0xb8c8ff, 0); vPool.position.set(DS[0], VY - .02, DS[1]); g.add(vPool);
  const dreamM = makeMotes({ n: 90, area: [3.2, 3.4, 3.0], size: .028, v: .1, seed: 61, color: 0xcfe0ff }); g.add(dreamM.mesh);
  const BIRDS = Array.from({ length: 4 }, (_, i) => { const b = makeBird(rng(980 + i), i % 2 ? '#e8e2d4' : '#d8d2c4'); b.group.scale.setScalar(.36); g.add(b.group); return { ...b, ph: i * 1.7 }; });
  // glows over the sleepers' heads: the two dreams of the night (40:5)
  const dg = [[-4.07, hC(-4.07, -4.5) + .3, -4.5, 0xcfd8ff], [-2.73, hC(-2.73, -4.4) + .3, -4.4, 0xffe0a0]].map(([x, y, z, c]) => { const s = spriteGlow(x, y, z, .55, c, 0), s2 = spriteGlow(x, y + .02, z, .2, 0xffffff, 0); g.add(s, s2); return [s, s2]; });
"""

NEW4 = r"""
  let SID = '';
  const headingOf = (a, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null; return fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); };
  const heldAt = (a, fw, side, h, tt, y0 = 0) => { const p = kp(tt, a.keys), hd = headingOf(a, tt); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, gAt(p.x, p.z) + y0 + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const SIT = () => -.12, aU = k => k > .001 ? { a0x: -2.7 * k, a1x: -.3 * k, a0z: -.35 * k, a1z: .1 * k } : {};
  const M1 = [-3.8, -4.5], M2 = [-3.0, -4.4], JB = [-2.55, -5.4], MID = [-3.4, -4.62];
  const toM1 = p => toward(p.x, p.z, M1), toM2 = p => toward(p.x, p.z, M2), toMID = p => toward(p.x, p.z, MID);
  // ---- the guards bring the two men to the prison; they stand outside the gate until the night (40:3)
  act(gu1, route(0, [-3.7, -1.75]).go(.6, [-3.62, -3.45]).wait(12.4).keys, { sp: 6, show: W_(0, 12.4), face: (t, p) => p.mv ? null : headZ(0, 1) });
  act(gu2, route(0, [-2.9, -1.75]).go(.6, [-2.98, -3.45]).wait(12.4).keys, { sp: 6, show: W_(0, 12.4), face: (t, p) => p.mv ? null : headZ(0, 1) });
  const aCp1 = act(cup, route(0, [-3.45, -1.4]).go(.55, [-3.3, -3.2]).go(.55, [-3.3, -3.95]).go(.5, [-3.6, -4.3]).go(.4, M1).wait(8.4).keys, { sp: 6, show: W_(0, 8.4), y: t => SIT() * smooth(6.0, 6.6, t), face: (t, p) => p.mv ? null : headZ(.6, .3), ex: t => mixA({ lx: .14 * smooth(6.0, 6.6, t) }) });
  const aBk1 = act(bak, route(0, [-3.2, -1.05]).go(.55, [-3.3, -3.2]).go(.55, [-3.3, -3.95]).go(.5, [-3.05, -4.25]).go(.4, M2).wait(8.4).keys, { sp: 6, show: W_(0, 8.4), y: t => SIT() * smooth(6.5, 7.1, t), face: (t, p) => p.mv ? null : headZ(-.6, .3), ex: t => mixA({ lx: .14 * smooth(6.5, 7.1, t) }) });
  // ---- Joseph with a jar of water (40:4: he attended them)
  const aJ1 = act(joN, route(0, [-2.7, -5.3]).wait(3.0).go(.45, [-3.4, -4.88]).go(.4, [-3.45, -4.7]).wait(8.4).keys, { sp: 6, show: W_(0, 8.4), face: (t, p) => p.mv ? null : (t < 3.0 ? headZ(-.2, 1) : toward(p.x, p.z, t < 7.3 ? M1 : M2)), ex: t => mixA(aF(.15 * ON(t, 6.6, 7.0, 7.3, 7.6))) });
  // ---- the night: the three lie down; the two men dream (40:5)
  still(cup, [M1[0] + .22, M1[1]], 8.4, 12.4, { y: () => .045, face: () => Math.PI / 2, ex: t => ({ lx: -1.5, a0z: -.2, a1z: .2, s: 1 + .012 * Math.sin(t * 1.6) }) });
  still(bak, [M2[0] - .22, M2[1]], 8.4, 12.4, { y: () => .045, face: () => -Math.PI / 2, ex: t => ({ lx: -1.5, a0z: -.2, a1z: .2, s: 1 + .012 * Math.sin(t * 1.5 + 1) }) });
  still(joN, [JB[0] + .2, JB[1]], 8.4, 12.4, { y: () => .045, face: () => Math.PI / 2, ex: t => ({ lx: -1.5, a0z: -.2, a1z: .2, s: 1 + .012 * Math.sin(t * 1.4 + 2) }) });
  // ---- the morning: they sit, heads down; Joseph comes between them and asks (40:6-7); they answer (40:8); Joseph speaks (40:8, 12-19)
  const aCp3 = still(cup, M1, 12.4, 51.8, { y: SIT, face: () => Math.PI / 2 - .25, ex: t => mixA({ lx: .38 * (1 - smooth(14.8, 15.8, t)) + .1 - .06 * smooth(31.8, 32.6, t) + .08 * smooth(39, 41, t) }, aO(.5 * ON(t, 17.8, 18.4, 19.4, 20.2)), aO(.3 * ON(t, 38.8, 39.4, 41.0, 41.6))) });
  const aBk3 = still(bak, M2, 12.4, 51.8, { y: SIT, face: () => -Math.PI / 2 + .25, ex: t => mixA({ lx: .38 * (1 - smooth(14.8, 15.8, t)) + .08 + .3 * smooth(48.6, 50.4, t) }, aO(.5 * ON(t, 19.2, 19.8, 20.6, 21.0))) });
  const aJ3 = act(joN, route(12.4, [-3.1, -5.3]).go(.45, [-3.4, -4.88]).go(.4, MID).wait(35.4).go(.14, [-3.62, -4.62]).wait(41.0).go(.2, MID).wait(46.0).go(.3, [-3.2, -4.62]).wait(52.0).go(.3, [-3.3, -4.7]).wait(56.2).go(.28, [-3.3, -4.1]).wait(61.7).keys, { sp: 6, show: W_(12.4, 61.7),
    face: (t, p) => p.mv ? null : (t < 14.4 ? headZ(0, 1) : (t < 15.6 ? toM1(p) : (t < 16.6 ? toM2(p) : (t < 21.2 ? toM1(p) : (t < 24.0 ? headZ(0, 1) + .35 : (t < 25.0 ? toM1(p) : (t < 35.4 ? toM1(p) : (t < 46.0 ? toM1(p) : (t < 52.0 ? toM2(p) : (t < 56.0 ? headZ(1, -.3) : headZ(0, 1))))))))))),
    ex: t => mixA(aO(.45 * ON(t, 15.4, 15.9, 16.6, 17.2)), aF(.3 * ON(t, 17.4, 18.0, 20.4, 21.0)), aU(ON(t, 21.2, 21.8, 23.2, 23.8)), aO(.55 * ON(t, 23.8, 24.2, 24.9, 25.4)), { lx: -.12 * ON(t, 21.4, 22.0, 23.2, 23.8) + .07 * ON(t, 35.6, 36.4, 38.4, 38.9) },
      aO(.4 * ON(t, 32.4, 32.9, 34.4, 35.0)), aF(.55 * ON(t, 35.8, 36.4, 38.4, 38.9)), aO(.5 * ON(t, 39.0, 39.5, 41.0, 41.6)), aO(.4 * ON(t, 48.2, 48.8, 50.6, 51.2)), aF(.45 * ON(t, 57.8, 58.4, 61.0, 61.7))) });
  // ---- the third day (40:20-22): the cupbearer is back at Pharaoh's side, hands him the cup; the baker is not shown
  const aCf = act(cup, route(51.8, [-5.0, -.7]).go(.5, [-5.62, -.6]).wait(56.0).keys, { sp: 6, show: W_(51.8, 56.0), face: (t, p) => p.mv ? null : headZ(-1, 0), ex: t => mixA(aP(ON(t, 53.0, 53.5, 54.5, 55.0))) });
  const aPh = still(pha, [-6.02, -.6], 51.8, 56.0, { y: () => .06, face: () => Math.PI / 2, ex: t => mixA({ a0x: -1.1 * ON(t, 53.6, 54.1, 55.2, 55.8), a0z: -.2 * ON(t, 53.6, 54.1, 55.2, 55.8) }) });
  still(sv1, [-5.3, -1.55], 51.8, 56.0, { face: () => Math.PI / 2, ex: t => mixA(aF(.5)) });
  still(sv2, [-5.1, -1.5], 51.8, 56.0, { face: () => Math.PI / 2 + .2, ex: t => mixA(aF(.5)) });
  // ---- the dreams: second copies of the same people float in the sky above the yard
  const DX = DS[0], DZ = DS[1], bob = (t, ph) => DY + .04 * Math.sin(t * 1.4 + ph);
  const aCd = still(cupD, [DX - .36, DZ], 25.2, 32.2, { y: t => bob(t, 0), face: () => Math.PI / 2, ex: t => mixA(aP(.5 * smooth(28.6, 29.2, t))) });
  const aPd = still(phaD, [DX + .36, DZ], 25.2, 32.2, { y: t => bob(t, 1.5), face: () => -Math.PI / 2, ex: t => mixA({ a0x: -1.1 * smooth(30.4, 31.0, t), a0z: -.2 * smooth(30.4, 31.0, t) }) });
  still(bakD, [DX, DZ], 41.6, 47.8, { y: t => bob(t, 3), face: () => headZ(0, 1) + .12, ex: t => mixA(aF(.3)) });
"""

NEW5 = r"""
  function update(t, camera, sid) {
    SID = sid;
    { const INT = ['attend', 'night', 'morn', 'ask', 'tell', 'hand', 'restore', 'remember', 'nothing', 'doom', 'empty'], lowS = INT.includes(sid), C = camera ? camera.position : null, gy = hC(PRIS[0], PRIS[1]);
      const side = C ? { N: C.z < PRIS[1] - 1.1 + .3, S: C.z > PRIS[1] + 1.1 - .3, E: C.x > PRIS[0] + 1.2 - .3, W: C.x < PRIS[0] - 1.2 + .3 } : {};
      for (const k of Object.keys(pWalls)) { const lo = lowS && side[k]; pWalls[k].scale.y = lo ? .4 : 1; pWalls[k].position.y = lo ? gy * .6 : 0; }
      if (pBeam) pBeam.visible = !(lowS && side.S); }
    const cam = camera && camera.position, MOOD = { night: 100, vine: 110, cup: 110, baskets: 110, birds: 110, forgot: 120, doom: 130, empty: 130 }, tc = MOOD[sid] ?? t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    const isDream = sid === 'vine' || sid === 'cup' || sid === 'baskets' || sid === 'birds', night = (sid === 'night' || isDream) ? 1 : (sid === 'forgot' ? .6 : 0), lit = (sid === 'night' || sid === 'forgot') ? 1 : 0, fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the town on the east bank stands as a distant city; its torches and windows light at night and dusk (cinematic interpretation)
    { townG.visible = true; const tk = lit;
      torchL.forEach((l, i) => { l.intensity = 0; }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = tk; w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    FIRES.forEach(f => { f.s.visible = f.s2.visible = false; });
    // ---- the prison: two torches at the gate and a warm light on the yard at night and dusk
    { const pk_ = lit;
      ptG.forEach(([s, s2], i) => { s.material.opacity = .85 * pk_ * (fl + .05 * i); s2.material.opacity = .9 * pk_ * fl; s.visible = s2.visible = pk_ > .01; });
      ptL.forEach((l, i) => { l.intensity = 1.7 * pk_ * (fl + .05 * i); }); prL.intensity = (sid === 'night' ? .8 : .5) * pk_ * fl; }
    // ---- the actors: every one is a pure function of time (and of the shot, for the dream copies)
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; if ((a.f === cupD || a.f === phaD) && sid !== 'cup') return; if (a.f === bakD && !(sid === 'baskets' || sid === 'birds')) return;
      const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // ---- the jar Joseph carries (until 8.4), then it stands by the mats
    { JARP.visible = true; if (t < 8.4) { const a = heldAt(aJ1, .16, 0, .17, t); JARP.position.set(a[0], a[1], a[2]); JARP.rotation.y = a[3]; } else { JARP.position.set(-3.1, hC(-3.1, -5.0) + .06, -5.0); JARP.rotation.y = .4; } }
    // ---- the gold cup: from the cupbearer's hand to Pharaoh's, in the dream and again on the third day
    { CUPP.visible = false;
      if (sid === 'cup') { const kk = smooth(30.5, 31.1, t), a = heldAt(aCd, .2, .08, .27, t, DY), b = heldAt(aPd, .17, .06, .25, t, DY); CUPP.visible = true; CUPP.position.set(lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(a[2], b[2], kk)); }
      else if (sid === 'feast') { const kk = smooth(54.0, 54.6, t), a = heldAt(aCf, .2, .08, .22, t), b = heldAt(aPh, .17, .06, .2, t, .06); CUPP.visible = true; CUPP.position.set(lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(a[2], b[2], kk)); } }
    thr.visible = tbl.visible = sid === 'feast';
    // ---- the vine grows: the trunk, then the three branches one after another (40:9-10)
    { vineG.visible = sid === 'vine'; const gt = smooth(25.4, 26.3, t); vTrunk.scale.set(1, Math.max(.001, gt), 1); vBr.forEach((b, i) => { const s = smooth(26.2 + i * .6, 27.0 + i * .6, t); b.scale.setScalar(Math.max(.001, s)); b.visible = s > .01; }); vPool.material.opacity = (sid === 'vine' ? .35 : 0) * smooth(25.2, 26.5, t); vPool.visible = sid === 'vine'; }
    // ---- the birds come to the top basket and eat (40:17)
    { const tb = [DX, DY + gAt(DX, DZ) + 1.31 * .45 + .06, DZ];
      BIRDS.forEach((b, i) => { const on = sid === 'birds', u = smooth(44.7 + i * .35, 46.0 + i * .35, t), r = lerp(1.1, .13, u), a = 1.2 + i * 1.57 - (1 - u) * 3.2 - t * .6 * (1 - u), peck = u > .98 ? Math.max(0, Math.sin(t * 7 + i * 1.9)) * .035 : 0;
        b.group.visible = on; b.group.position.set(tb[0] + Math.cos(a) * r, tb[1] + (1 - u) * (.45 + .1 * i) + .02 - peck, tb[2] + Math.sin(a) * r * .8);
        const dx = -Math.sin(a) * (1 - u) * 3 + (u > .98 ? Math.cos(a + 1.6) * .4 : 0), dz = Math.cos(a) * (1 - u) * 3 * .8 + (u > .98 ? Math.sin(a + 1.6) * .4 : 0); b.group.rotation.set(0, Math.atan2(-dz, dx), 0);
        b.wings.forEach((w2, k) => w2.rotation.x = (k ? 1 : -1) * Math.sin(t * 9 + i * 1.3) * (.25 + .5 * (1 - u))); }); }
    // ---- the dream light: motes around the dream stage, glows over the two sleepers
    dreamM.update(t, isDream ? .9 : 0, [DX, DY + gAt(DX, DZ) + .6, DZ]);
    dg.forEach(([s, s2], i) => { const k = (sid === 'night' ? smooth(9.4 + i * .5, 11.2 + i * .5, t) : 0) * (.8 + .2 * Math.sin(t * 2.1 + i)); s.material.opacity = .75 * k; s2.material.opacity = .6 * k; s.visible = s2.visible = k > .01; });
    dust.update(t, 0, [0, 0, 0]); dustR.update(t, 0, [0, 0, 0]);
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const MORN = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.5, [9, 3.4, -5], .5, '#ffcf9a', FD, 14];
  const light = [Dk(0, ...GOLD), Dk(8.5, ...GOLD), Dk(12.2, ...MORN), Dk(50, ...MORN), Dk(51.6, ...GOLD), Dk(90, ...GOLD)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [8.5, ['#5a86c4', '#f6c890']], [12.2, ['#6a8ec8', '#f8d4a0']], [50, ['#6a8ec8', '#f8d4a0']], [51.6, ['#5a86c4', '#f6c890']], [90, ['#5a86c4', '#f6c890']], [100, ['#0e1636', '#2a3466']], [110, ['#070c24', '#1a2a5a']], [120, ['#2a3270', '#d08060']], [130, ['#7a8cb0', '#d8c8b4']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL], state };
}
"""
out = head + NEW3 + NEW4 + NEW5
# the file needs makeBird
out = rep(out, "import { underRock, TAU } from './terrain8.js';", "import { underRock, TAU } from './terrain8.js';\nimport { makeBird } from './fauna6.js';")
open(S + 'src/world40.js', 'w').write(out)
print('world40.js', len(out))
