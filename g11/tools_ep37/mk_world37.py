#!/usr/bin/env python3
# Derives g11/src/world37.js (Genesis 37, Joseph sold by his brothers) from world36.js: the island, terrain, river, trees, reeds, camp, walled town, torches and fires are reused; the people, props (robe, pit, silver, dream sky), choreography, update loop and light are new.
S = '/home/claude/g11/'
L = open(S + 'src/world36.js').read().split('\n')
def ln(a, b): return L[a - 1:b]            # 1-indexed inclusive
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

HEAD = [
"// Episode 37: Genesis 37, Joseph sold by his brothers. Joseph, seventeen, is loved most by his father Jacob, who makes him a fine robe (37:3-4); his brothers hate him; he dreams that the sun, the moon and eleven stars bow down to him (37:9); his father rebukes him but keeps the matter in mind (37:10-11).",
"// Jacob sends him to his brothers at Dothan (37:12-17); they say 'Here comes that dreamer' and plot to kill him (37:18-20); Reuben says not to take his life (37:21-22); they strip him of his robe and throw him into an empty pit (37:23-24); on Judah's word they sell him to traders for twenty pieces of silver (37:26-28).",
"// They dip the robe in goat's blood and send it to Jacob (37:31-32); Jacob says a wild beast has devoured his son, and mourns, and refuses to be comforted (37:33-35); in Egypt Joseph was sold to Potiphar (37:36).",
"// Cinematic interpretation: the camp, the road, the hill with its stone-ringed pit, the caravan of traders, the walled town at dusk and the night sky of the dream are pictures made for this film. The text gives no landscape, no faces and no number of the brothers beyond the eleven stars; no brother is named on screen, and the film shows no violence: the pit and the sale are shown as the text tells them.",
]
out = HEAD + ln(5, 123)                      # imports, terrain, helpers, trees, reeds, river, camp tents, walled town and torches, the oak, Jacob's camp
out += ln(131, 135)                          # FIRES + fire()

NEW1 = r"""
  // ---- the pit (37:20-24): a dry cistern on the hill, a low ring of stones with a dark opening; it is never anything more than a hole in the ground
  const PIT = [SEIR[0] - 1.15, SEIR[1] + .55];
  { const b = new GB(rng(350)), y0 = hC(PIT[0], PIT[1]), rr = rng(351); for (let k = 0; k < 9; k++) { const an = k * TAU / 9 + .2; b.box(pk(rr, ['#9a8e7c', '#a99c86', '#85796a']), [PIT[0] + Math.cos(an) * .31, y0 + .08, PIT[1] + Math.sin(an) * .31], [.17, .17, .13], [0, -an, 0], .04); }
    ca.add(meshOf(b)); const d = new THREE.Mesh(new THREE.CircleGeometry(.255, 20), new THREE.MeshBasicMaterial({ color: 0x0b0806 })); d.rotation.x = -Math.PI / 2; d.position.set(PIT[0], y0 + .014, PIT[1]); ca.add(d); }
  // ---- the robe: a long tunic of gold, red and blue stripes (37:3); a second state with dark stains is shown after the brothers dip it (37:31)
  const mkRobe = () => { const gr = new THREE.Group(), clean = new GB(rng(360)), stain = new GB(rng(361));
    clean.box('#e0a838', [0, 0, 0], [.34, .05, .26], [0, 0, 0], .02); clean.box('#b83a2c', [0, .012, .095], [.34, .05, .07], [0, 0, 0], .01); clean.box('#3a6aa8', [0, .014, -.02], [.34, .05, .06], [0, 0, 0], .01); clean.box('#e0a838', [-.26, 0, 0], [.2, .04, .13], [0, 0, 0], .02); clean.box('#e0a838', [.26, 0, 0], [.2, .04, .13], [0, 0, 0], .02);
    stain.box('#6a1612', [-.05, .03, .05], [.12, .02, .1], [0, .3, 0], .01); stain.box('#4a0e0c', [.08, .03, -.04], [.1, .02, .09], [0, -.4, 0], .01); stain.box('#6a1612', [-.24, .03, .0], [.1, .02, .09], [0, .2, 0], .01);
    const c = meshOf(clean), s = meshOf(stain); gr.add(c, s); gr.userData = { stain: s }; ca.add(gr); gr.visible = false; return gr; };
  const ROBE = mkRobe();
  // ---- twenty pieces of silver on a small cloth (37:28)
  const SILV = [9.3, 6.95], COINS = (() => { const gr = new THREE.Group(), cl = new GB(rng(362)); cl.box('#7a4a3a', [0, 0, 0], [.7, .02, .5], [0, .2, 0], .01); gr.add(meshOf(cl)); const cs = [];
    for (let i = 0; i < 20; i++) { const b = new GB(rng(363 + i)); b.box('#d6d8e0', [0, 0, 0], [.07, .018, .07], [0, i * .7, 0], .005); const m = meshOf(b); const col = i % 5, row = Math.floor(i / 5); m.position.set(-.24 + col * .12 + (row % 2) * .03, .03 + (i % 3) * .004, -.15 + row * .1); m.visible = false; gr.add(m); cs.push(m); }
    gr.position.set(SILV[0], hC(SILV[0], SILV[1]), SILV[1]); gr.rotation.y = .2; ca.add(gr); gr.userData = { cs }; return gr; })();
  // ---- the dream (37:9): the sun, the moon and eleven stars in the night sky above Joseph; they come down and bow toward him. A picture of what the text says Joseph dreamed.
  const DS = []; { const mkS = (s, col, s2) => { const a = spriteGlow(0, 0, 0, s, col, 0), c = spriteGlow(0, 0, 0, s2, 0xffffff, 0); g.add(a, c); return [a, c]; };
    DS.push({ s: mkS(.95, 0xffc860, .42), x: -3.0, y: 2.9, z: .2, big: 1 }); DS.push({ s: mkS(.62, 0xdfe6ff, .28), x: -6.1, y: 2.7, z: .2, big: 1 });
    for (let i = 0; i < 11; i++) { const an = Math.PI * (.1 + .8 * i / 10); DS.push({ s: mkS(.3, 0xe8f0ff, .12), x: -4.55 + 1.5 * Math.cos(an), y: 1.7 + .8 * Math.sin(an) + .08 * Math.sin(i * 2.3), z: -.4, big: 0 }); } }
  const JSLEEP = [-4.55, 1.95];
  // ---- fires: the brothers' on the hill at dusk, Jacob's at the camp at night
  const HF = [SEIR[0] + .75, SEIR[1] - .35], CF = [-3.7, .25];
  fire(HF[0], HF[1], 40.6, 43.0, 1.1); fire(CF[0], CF[1], 47.0, 50.5, 1.2);
  const brosL = new THREE.PointLight(0xffa458, 0, 6.0, 1.5); brosL.position.set(HF[0] - .1, hC(HF[0], HF[1]) + 1.1, HF[1] + .3);
  const homeL = new THREE.PointLight(0xffa458, 0, 6.5, 1.5); homeL.position.set(CF[0] - .1, hC(CF[0], CF[1]) + 1.1, CF[1] + .3);
  // ---- animals: Jacob's flock stays at the camp; the brothers' flock grazes on the hill; one goat; three camels of the traders
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const HOME = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0)), HILL = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => place(makeSheep(rng(720 + i)), 0, 0, 0)), GOAT = place(mkGoat(740), 0, 0, 0);
  const CAM = [0, 1, 2].map(i => { const c = makeCamel(rng(120 + i)); c.group.scale.setScalar(.5); const ld = new THREE.Group(), lb = new GB(rng(125 + i)); lb.box(['#a88454', '#8a3a2a', '#6a7a5a'][i], [0, 0, 0], [.5, .28, .38], [0, 0, 0], .04); lb.box('#c9b27c', [.06, .22, 0], [.3, .15, .32], [0, 0, 0], .04); ld.add(meshOf(lb)); ld.position.set(0, 1.32, 0); c.group.add(ld); ca.add(c.group); return c; });
"""
out += NEW1.split('\n')
out += ln(144, 150)                          # far mountains, cloud sea, sun glow, motes, dust
NEW2 = r"""  const CLOUD = [[0, '#e8c8a0'], [14, '#e8d0a8'], [28, '#e8c8a0'], [38, '#e8b898'], [43, '#e0a888'], [46, '#c89a98'], [49, '#6a6a98'], [52, '#4a4a78'], [62, '#4a4a78'], [90, '#4a4a78']];
  const CEM = [[0, '#6a5848'], [38, '#6a5848'], [43, '#5a4a52'], [46, '#4a3a58'], [49, '#3a3a58'], [52, '#22223a'], [62, '#22223a'], [90, '#22223a']];"""
out += NEW2.split('\n')
out += ln(153, 156)                          # colAt, FARC, bgAtW
out += ln(169, 186)                          # animation helpers, route builder, hdgAt, ACT, act, W_
out += ln(192, 197)                          # mixA, aF, aO, aP, toward, trek

NEW3 = r"""
  // ---- the people. Jacob is the same model as in Genesis 33 and 35 (a second state, in sackcloth, for his mourning); Joseph (seventeen), his ten brothers and the traders are new and the brothers and traders are unnamed on screen
  const jacobA = mkJacob(rng(87)), jacobB = person(rng(87), { pants: '#6a6054', top: '#7a7062', skin: '#d9a073', hair: '#2e1d10', beard: '#3a2616', cloth: '#7a7060', mantle: '#4a4238', sash: '#3a342c', seed: 720 }, .45);
  const josP = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', sash: '#6a3a1a', seed: 930 }, .41);
  const josR = person(rng(930), { pants: '#b83a2c', top: '#e0a838', skin: '#c58c60', hair: '#2a1a10', mantle: '#3a6aa8', sash: '#2e6a9a', seed: 930 }, .41);
  const BRC = ['#8a4a3a', '#4f6a7a', '#6f8a62', '#c9a15a', '#7a5a8a', '#8a6a4a', '#9a4a42', '#4f7a8a', '#6a7a5a', '#7a6a4a'], BRS = ['#a8714a', '#b98a62', '#c38a5c', '#a8714a', '#b98a62', '#c38a5c', '#a8714a', '#b98a62', '#c38a5c', '#a8714a'], BRP = ['#d9ccb0', '#cdbd98', '#d8ccb0', '#cdbd98', '#d9ccb0', '#c9bb94', '#d8ccb0', '#cdbd98', '#d9ccb0', '#c9bb94'];
  const BRO = BRC.map((c, i) => person(rng(300 + i), { pants: BRP[i], top: c, skin: BRS[i], hair: '#2e1d10', beard: [0, 2, 3, 5, 8].includes(i) ? '#2e1d10' : undefined, sash: '#3a2a1a', seed: 960 + i }, i === 0 ? .48 : .45));
  const TRD = [['#7a5a3a', '#e8dcc0', '#6a4a2a', 970], ['#5a6a7a', '#d8c9a8', null, 971], ['#8a6a4a', '#e0d4b8', null, 972]].map(([top, cloth, mantle, sd], i) => person(rng(250 + i), { pants: '#d8ccb0', top, skin: '#9a6a44', hair: '#2a1a10', beard: i < 2 ? '#2a1a10' : undefined, cloth, mantle: mantle || undefined, sash: '#4a2a1a', seed: sd }, .46));
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacobA.group.add(mkStaff());
  const ALLP = [jacobA, jacobB, josP, josR, ...BRO, ...TRD]; ALLP.forEach(o => g.add(o.group));
  // act() with a vertical offset (used when Joseph is lowered into the pit and pulled out again)
"""
out += NEW3.split('\n')
src = '\n'.join(out)
src = rep(src, "ex: o.ex || null };", "ex: o.ex || null, y: o.y || null };")
open(S + 'src/_world37_part1.js', 'w').write(src)
print('part1 ok', len(src))

# ===================== part 2: choreography, update loop, light =====================
NEW4 = r"""
  const trek2 = (r, v, off, dest) => { alongE(r, v, off, -3.0, 3.2); r.go(v, [4.3, 2.7 + off]).go(v, [5.3, 3.9 + off]).go(v, [8.0, 4.7 + .6 * off]).go(v, dest); return r; };
  const fx = (dx, dz) => () => headZ(dx, dz);
  const ftoP = p => (t, q) => toward(q.x, q.z, p);
  const ftoK = keys => (t, q) => { const o = kp(t, keys); return toward(q.x, q.z, [o.x, o.z]); };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const ang = (a, b, k) => a + (b - a) * k;
  const JKH = [-5.05, .55], JOH = [-4.35, .5];
  // ---- Jacob and Joseph at the camp: the robe (37:3), the rebuke (37:10-11), Jacob sends him to Dothan (37:13)
  const aJA1 = still(jacobA, JKH, 0, 7.2, { sp: 5, face: ftoP(JOH), ex: t => mixA(aF(ON(t, 1.8, 2.5, 4.4, 4.9)), aO(.3 * ON(t, 5.2, 5.8, 6.6, 7.1))) });
  const aJA1b = still(jacobA, JKH, 14.4, 22, { sp: 5, face: (t, q) => t < 18.4 ? toward(q.x, q.z, JOH) : toward(q.x, q.z, [kp(t, JWK_()).x, kp(t, JWK_()).z]), ex: t => mixA(aP(ON(t, 15.2, 15.7, 16.9, 17.4)), aP(ON(t, 18.5, 19.0, 20.6, 21.3))) });
  function JWK_() { return JWK; }
  const aJP1 = still(josP, JOH, 0, 4.6, { face: ftoP(JKH), ex: t => mixA(aF(.5)) });
  const aJR1 = still(josR, JOH, 4.6, 7.0, { face: (t, q) => ang(toward(q.x, q.z, JKH), headZ(-.47, .88), smooth(5.0, 6.2, t)), ex: t => mixA(aO(.45 * ON(t, 5.2, 5.7, 6.5, 7.0))) });
  const aJW1 = act(josR, route(7.0, [-4.2, .85]).go(1.1, [-3.2, 1.15]).go(1.1, [-1.7, 1.15]).keys, { sp: 8, show: W_(7.0, 9.8) });
  const aJS = still(josR, JSLEEP, 9.8, 14.4, { face: fx(1, 0), y: () => .07, ex: t => ({ lx: -1.5, a0z: -.1, a1z: .1, s: 1 + .012 * Math.sin(t * 1.6) }) });
  const aJR2 = still(josR, JOH, 14.4, 18.4, { face: ftoP(JKH), ex: t => mixA({ lx: .14 * ON(t, 14.8, 15.6, 17.4, 18.2) }, aF(.5)) });
  const JWK = (() => { const r = route(18.4, JOH).go(1.5, [-3.2, 1.1]); trek2(r, 1.9, 0, [9.05, 5.2]); r.wait(30.3); return r.keys; })();
  const aJRW = act(josR, JWK, { sp: 8, show: W_(18.4, 30.3), face: (t, p) => p.mv ? null : (t < 18.6 ? toward(p.x, p.z, JKH) : toward(p.x, p.z, [10.3, 5.4])), ex: t => mixA(aO(.45 * ON(t, 28.6, 29.0, 30.0, 30.3)), { lx: -.07 * ON(t, 28.8, 29.2, 30.0, 30.3) }) });
  // ---- the brothers at home, watching Joseph pass (37:4)
  const BA = BRO.map(() => []);
  const HP = { 0: [-3.4, -.55], 1: [-2.9, -.8], 3: [-2.4, -.5], 5: [-1.9, -.8], 7: [-1.5, -.45] };
  for (const i in HP) BA[i].push(still(BRO[i], HP[i], 7.0, 9.8, { ph: 1 + i * 1.7, sp: 5, face: ftoK(aJW1.keys), ex: t => mixA(aF(.65 * ON(t, 7.0, 7.7, 9.2, 9.8))) }));
  // ---- the brothers on the hill at Dothan (37:17-28), by phase: 0 watch the road | 1 huddle | 2 surround Joseph | 3 the pit | 4 Judah speaks | 5 pulled from the pit | 6 the sale
  const PHT = [21.5, 25.0, 27.0, 30.2, 33.7, 36.6, 39.0, 43.2];
  const BP = [
    [[10.5, 4.55], [10.55, 5.05], [9.55, 4.95], [10.65, 4.75], [10.7, 5.0], [10.9, 4.9], [11.0, 4.9]],
    [[10.0, 5.05], [10.15, 5.5], [9.45, 5.85], [9.55, 5.55], [10.2, 5.4], [10.7, 5.3], [10.5, 5.2]],
    [[10.7, 5.5], [10.95, 5.65], [9.9, 5.55], [10.4, 5.5], [10.95, 5.55], [11.1, 5.6], [11.0, 5.8]],
    [[10.45, 6.35], [10.45, 6.05], [10.2, 5.15], [10.8, 6.15], [10.75, 5.75], [10.85, 5.7], [9.65, 6.75]],
    [[9.7, 6.7], [9.95, 6.15], [8.55, 5.7], [10.4, 6.35], [10.4, 6.4], [10.9, 6.3], [10.2, 6.5]],
    [[10.95, 4.15], [11.05, 4.75], [10.0, 4.5], [10.9, 5.6], [10.95, 4.9], [10.4, 6.3], [11.3, 5.0]],
    [[11.2, 6.15], [11.3, 5.95], [10.4, 6.0], [11.3, 6.1], [11.4, 6.0], [9.7, 5.6], [11.5, 6.2]],
    [[11.45, 4.95], [11.5, 5.2], [10.8, 5.4], [11.2, 5.0], [11.55, 5.15], [11.6, 5.3], [11.5, 4.6]],
    [[11.9, 5.65], [11.85, 5.7], [10.9, 4.85], [11.6, 5.5], [11.9, 5.6], [11.9, 5.6], [12.1, 6.1]],
    [[11.55, 6.8], [11.35, 6.4], [10.5, 6.5], [10.9, 6.7], [11.0, 6.55], [11.1, 6.6], [11.3, 6.6]]];
  const TRADER0 = [8.75, 7.2], CENTRE = [10.6, 5.6], JB = [9.05, 5.2];
  const bFace = (i, ph) => {
    if (ph === 0) return fx(-1, -.15);
    if (ph === 1) return ftoP(CENTRE);
    if (ph === 2) return i === 0 ? fx(1, .1) : ftoP(JB);
    if (ph === 3) return i === 0 ? fx(-1, .3) : ftoP(PIT);
    if (ph === 4) return i === 3 ? fx(-1, .2) : ftoP([10.75, 5.75]);
    if (ph === 5) return ftoP(PIT);
    return i === 3 ? ftoP(TRADER0) : (i === 0 ? fx(-1, 1) : ftoP([9.3, 6.9]));
  };
  const bEx = (i, ph) => {
    const a = PHT[ph];
    if (ph === 0 && i === 9) return t => mixA(aP(ON(t, 22.4, 22.9, 24.0, 24.6)));
    if (ph === 1) return t => mixA(i === 1 ? aO(ON(t, 25.3, 25.7, 26.4, 26.9)) : (i === 4 ? aP(ON(t, 25.5, 25.9, 26.4, 26.9)) : (i === 6 ? aO(ON(t, 25.8, 26.2, 26.6, 26.95)) : {})));
    if (ph === 2) return t => mixA(i === 0 ? aO(ON(t, 27.5, 28.0, 29.8, 30.1)) : ((i === 1 || i === 4) ? aF(ON(t, 28.8, 29.5, 30.1, 30.2)) : (i === 2 ? aF(.5) : {})));
    if (ph === 3) return t => mixA(i === 2 ? aF(.9) : ((i === 1 || i === 4) ? { a0x: -1.1 * ON(t, 30.6, 31.2, 33.2, 33.6), a1x: -1.1 * ON(t, 30.6, 31.2, 33.2, 33.6), lx: .22 * ON(t, 32.0, 32.6, 33.2, 33.6) } : {}));
    if (ph === 4) return t => mixA(i === 3 ? aO(ON(t, 34.1, 34.6, 35.8, 36.4)) : (i === 2 ? aF(.9) : {}));
    if (ph === 5) return t => mixA((i === 5 || i === 6) ? { a0x: -1.25 * ON(t, 36.7, 37.1, 38.2, 38.8), a1x: -1.25 * ON(t, 36.7, 37.1, 38.2, 38.8), lx: .32 * ON(t, 36.8, 37.3, 38.1, 38.8) } : (i === 2 ? aF(.9) : {}));
    return t => mixA(i === 3 ? aO(ON(t, 40.0, 40.5, 41.6, 42.2)) : (i === 2 ? aF(.9) : {}));
  };
  BP.forEach((row, i) => row.forEach((pos, ph) => BA[i].push(still(BRO[i], pos, PHT[ph], PHT[ph + 1], { ph: 3 + i * 1.5, sp: 7, face: bFace(i, ph), ex: bEx(i, ph) }))));
  // ---- Joseph at the pit: seized, stripped of his robe, lowered into the empty pit (37:23-24); pulled out again (37:28)
  const aJP2 = act(josP, route(30.3, JB).go(.7, [PIT[0] - .12, PIT[1] - .05]).wait(34).keys, { sp: 7, show: W_(30.3, 33.7), face: (t, p) => p.mv ? null : headZ(-1, .35), y: t => -.98 * smooth(32.5, 33.6, t), ex: t => mixA({ a0x: -2.5 * ON(t, 31.8, 32.3, 33.2, 33.6), a1x: -2.5 * ON(t, 31.8, 32.3, 33.2, 33.6) }) });
  const aJP3 = act(josP, route(36.2, [PIT[0] - .12, PIT[1] - .05]).wait(38.4).go(.9, [9.45, 6.65]).wait(41.8).go(1.0, [8.2, 6.75]).go(1.0, [6.8, 5.7]).go(1.0, [5.3, 3.9]).keys, { sp: 7, show: W_(36.2, 43.5), face: (t, p) => p.mv ? null : (t < 41.8 ? ftoP(TRADER0)(t, p) : null), y: t => -.98 * (1 - smooth(36.5, 38.1, t)), ex: t => mixA({ a0x: -2.8 * ON(t, 36.3, 36.8, 37.9, 38.5), a1x: -2.8 * ON(t, 36.3, 36.8, 37.9, 38.5), lx: .1 * ON(t, 38.8, 39.4, 41.6, 42.0) }) });
  // ---- the traders (Ishmaelites and Midianites, 37:25-28) come from the south-east with their camels; twenty pieces of silver; they leave with Joseph
  const TE = [[8.75, 7.2], [9.55, 7.65], [10.3, 7.95]], CE = [[9.75, 7.9], [10.55, 8.3], [11.3, 8.55]];
  const caravanKeys = null;
  TRD.forEach((f, i) => act(f, route(34.0, [12.5 + .6 * i, 8.0 + .25 * i]).go(1.0, TE[i]).wait(41.8).go(1.0, [7.2 + .4 * i, 5.9 + .3 * i]).go(1.0, [5.3, 3.9]).keys, { ph: 2 + i * 1.7, sp: 7, show: W_(34.0, 43.5), face: (t, p) => p.mv ? null : (t < 41.8 ? (i === 0 ? ftoP(CENTRE)(t, p) : headZ(-1, .1)) : null), ex: t => mixA(i === 0 ? aO(ON(t, 39.6, 40.1, 41.4, 41.8)) : {}) }));
  // ---- d1: the brothers dip the robe in goat's blood (37:31); two of them take it to Jacob (37:32)
  const aB2d1 = act(BRO[2], route(43.2, [11.1, 5.95]).wait(46.9).go(1.7, [9.9, 5.4]).go(1.7, [8.0, 4.7]).keys, { ph: 5, sp: 7, show: W_(43.2, 47.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [11.5, 6.35]), ex: t => mixA(aF(.9), { lx: .26 * ON(t, 44.2, 44.8, 45.5, 46.0) }) });
  BA[2].push(aB2d1);
  const aB7d1 = act(BRO[7], route(43.2, [11.5, 4.6]).wait(46.9).go(1.7, [9.9, 5.1]).go(1.7, [8.0, 4.4]).keys, { ph: 9, sp: 7, show: W_(43.2, 47.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [11.1, 5.95]), ex: t => mixA(aF(.4)) });
  const aB3d1 = still(BRO[3], [10.7, 5.1], 43.2, 47.8, { ph: 4, face: ftoP(HF), ex: t => mixA(aF(.5)) }); BA[3].push(aB3d1);
  const aB8d1 = still(BRO[8], [12.1, 6.1], 43.2, 47.8, { ph: 7, face: ftoP(HF), ex: t => mixA(aF(.45)) }); BA[8].push(aB8d1);
  // ---- d2: Jacob receives the robe (37:32-33) and mourns, and will not be comforted (37:34-35)
  const aB2d2 = act(BRO[2], route(47.7, [-2.9, 1.15]).go(1.3, [-4.0, .95]).wait(51.3).keys, { ph: 5, sp: 7, show: W_(47.7, 51.3), face: (t, p) => p.mv ? null : headZ(-1, 0), ex: t => mixA(aF(.9 * ON(t, 47.9, 48.4, 48.9, 49.1))) }); BA[2].push(aB2d2);
  const aB7d2 = act(BRO[7], route(47.7, [-2.5, 1.5]).go(1.3, [-3.7, 1.4]).wait(51.3).keys, { ph: 9, sp: 7, show: W_(47.7, 51.3), face: (t, p) => p.mv ? null : headZ(-1, -.1), ex: t => mixA(aF(.3)) }); BA[7].push(aB7d2);
  const aJA2 = still(jacobA, [-4.8, .95], 47.5, 51.3, { sp: 5, face: fx(1, 0), ex: t => mixA(aF(ON(t, 48.6, 49.2, 51.0, 51.3)), { lx: -.1 * ON(t, 49.0, 49.5, 50.2, 50.8) + .12 * ON(t, 50.2, 50.9, 51.2, 51.3) }) });
  const JBH = [-4.6, .55];
  const aJB = still(jacobB, JBH, 51.3, 56, { sp: 5, face: (t, q) => ang(toward(q.x, q.z, CF), headZ(-1, -.5), smooth(53.0, 53.8, t)), ex: t => mixA({ a0x: -1.5, a1x: -1.5, a0z: .55, a1z: -.55, lx: .2 + .03 * Math.sin(t * 1.3) }) });
  [[6, [-3.2, -.2]], [7, [-3.3, 1.2]], [8, [-5.3, 1.45]]].forEach(([i, p]) => BA[i].push(still(BRO[i], p, 51.3, 56, { ph: 2 + i, sp: 7, face: ftoP(JBH), ex: t => mixA(aO(.75 * ON(t, 51.9 + .3 * (i - 6), 52.5 + .3 * (i - 6), 54.8, 55.4))) })));
  // ---- e1: the caravan arrives at the gate of a walled town at dusk (37:36): Joseph walks among the traders and camels
  const RD = [[-8.0, 1.1], [-3.2, 1.2], [-1.0, 1.15], [.45, 1.2], [2.2, 1.0], [4.0, .6], [5.0, .3]], RDL = [0]; for (let i = 1; i < RD.length; i++) RDL.push(RDL[i - 1] + Math.hypot(RD[i][0] - RD[i - 1][0], RD[i][1] - RD[i - 1][1]));
  const roadAt = s => { s = clamp(s, 0, RDL[RDL.length - 1]); let i = 1; while (i < RD.length - 1 && s > RDL[i]) i++; const u = (s - RDL[i - 1]) / (RDL[i] - RDL[i - 1]); return [lerp(RD[i - 1][0], RD[i][0], u), lerp(RD[i - 1][1], RD[i][1], u)]; };
  const SF = t => 7.2 + .8 * (t - 55), cKeys = (u, dz = 0) => { const ks = []; for (let t = 55; t <= 62.01; t += .5) { const p = roadAt(SF(t) - u); ks.push([t, p[0], p[1] + dz, 'L']); } return ks; };
  const UTR = [0, 1.8, 4.3], UCM = [.95, 3.35, 5.15], UJ = 2.55;
  TRD.forEach((f, i) => act(f, cKeys(UTR[i], .06 * (i - 1)), { ph: 2 + i * 1.7, sp: 7, show: W_(55.2, 62.2) }));
  const aJP4 = act(josP, cKeys(UJ, -.08), { sp: 7, show: W_(55.2, 62.2), ex: t => mixA({ lx: .09 }) });
  const camKeys = [0, 1, 2].map(i => { const r = route(34.2, [13.5 + .6 * i, 8.5 + .25 * i]).go(1.0, CE[i]).wait(41.9).go(1.0, [8.0 + .4 * i, 6.3 + .3 * i]).go(1.0, [5.6, 4.2]); const ks = r.keys; const e = cKeys(UCM[i], .1 * (i - 1)); ks.push([43.6, e[0][1], e[0][2], 'L']); return ks.concat(e); });
  // ---- the animals
  const ANIM = [...HOME, ...HILL, GOAT, ...CAM], AK = new Map(), AV = new Map();
  [[-2.2, -1.2], [-1.6, -.1], [-.5, -1.1], [-1.0, -1.6], [-3.3, -.5]].forEach((p, i) => { AK.set(HOME[i], route(0, p).wait(8).go(.12, [p[0] + .25, p[1] + .1]).wait(90).keys); AV.set(HOME[i], t => t < 22); });
  [[12.6, 4.2], [13.0, 5.2], [12.7, 6.2], [12.4, 7.0], [11.5, 7.5], [12.9, 6.8], [13.0, 4.2], [12.3, 3.7], [12.9, 5.8]].forEach((p, i) => { AK.set(HILL[i], route(0, p).wait(30).go(.1, [p[0] + .2, p[1] - .15]).wait(90).keys); AV.set(HILL[i], t => t >= 21.3 && t < 48); });
  AK.set(GOAT, route(0, [11.5, 6.4]).keys); AV.set(GOAT, t => t >= 41 && t < 48);
  CAM.forEach((c, i) => { AK.set(c, camKeys[i]); AV.set(c, t => (t >= 34.2 && t < 43.5) || (t >= 55.2 && t < 62.2)); });
  const FIN = 0;
  const heldBy = (a, fw, h, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null, hd = fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); return [p.x + Math.sin(hd) * fw, hC(p.x, p.z) + h, p.z + Math.cos(hd) * fw, hd]; };
  const actAt = (list, tt) => list.find(a => a.show(tt)) || list[list.length - 1];
"""
out2 = NEW4.split('\n')

NEW5 = r"""
  function update(t, camera, sid) {
    const cam = camera && camera.position, dream = sid === 'dream', tc = dream ? 60 : t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = dream ? 1 : ON(t, 47.5, 51.0, 90, 91), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    { const k = dream ? 0 : .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the walled town: it stands from the last scene on, torches at its gate and lit windows one after another (37:36, cinematic interpretation of Egypt)
    { const on = t >= 53.0; townG.visible = on; const tk = smooth(53.6, 55.4, t);
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = smooth(55.6 + 5.2 * w.ord, 56.6 + 5.2 * w.ord, t); w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    FIRES.forEach(f => { const k = f.b > f.a ? smooth(f.a, f.b, t) : 0; f.s.material.opacity = .8 * k * (fl + .05 * Math.sin(t * 9 + f.ph)); f.s2.material.opacity = .9 * k * fl; f.s.visible = f.s2.visible = k > .01; });
    brosL.intensity = 2.0 * smooth(40.6, 43.0, t) * (1 - smooth(48.0, 48.6, t)) * fl; homeL.intensity = 2.3 * smooth(47.0, 50.0, t) * fl;
    // ---- the dream: the sun, the moon and eleven stars bow toward the sleeping Joseph
    { const fi = dream ? smooth(9.6, 10.8, t) * (1 - smooth(14.2, 14.6, t)) : 0, bow = smooth(11.0, 13.6, t);
      DS.forEach((d, i) => { const x = lerp(d.x, JSLEEP[0] + (d.x - JSLEEP[0]) * .5, bow), y = d.y - 1.5 * bow, z = lerp(d.z, JSLEEP[1] - .3, bow * .7), tw = .88 + .12 * Math.sin(t * 3.1 + i * 1.9), o = fi * tw;
        d.s[0].position.set(x, y, z); d.s[1].position.set(x, y, z); d.s[0].material.opacity = (d.big ? .75 : .85) * o; d.s[1].material.opacity = .9 * o; d.s[0].visible = d.s[1].visible = o > .01; }); }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = AV.get(a)(t); a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      const big = i >= ANIM.length - 3; if (p.mv) walkLegs(a.legs, t + i * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); });
    // ---- the robe: held by Jacob (37:3), carried by a brother (37:23), dipped (37:31), handed back to Jacob (37:32), held in his mourning (37:34)
    { let on = true, pos = null;
      if (t < 4.6) pos = heldBy(aJA1, .2 + .2 * smooth(3.2, 4.4, t), .36, t);
      else if (t >= 30.2 && t < 43.2) pos = heldBy(actAt(BA[2].filter(a => a.show(t)), t), .2, .3, t);
      else if (t >= 43.2 && t < 47.7) { const h = lerp(.34, .09, ON(44.2, 44.8, 45.5, 46.0)); pos = heldBy(aB2d1, .22 + .1 * ON(44.2, 44.8, 45.5, 46.0), h, t); }
      else if (t >= 47.7 && t < 49.1) pos = heldBy(aB2d2, .24 + .12 * smooth(48.4, 49.0, t), .3, t);
      else if (t >= 49.1 && t < 51.3) pos = heldBy(aJA2, .14, .4, t);
      else if (t >= 51.3 && t < 56) pos = heldBy(aJB, .13, .42, t);
      else on = false;
      ROBE.visible = on; if (on) { ROBE.position.set(pos[0], pos[1], pos[2]); ROBE.rotation.y = pos[3]; } ROBE.userData.stain.visible = t >= 45.0; }
    { const n = t >= 39.4 && t < 43.3 ? Math.floor(20 * clamp((t - 39.6) / 1.8)) : 0; COINS.visible = t >= 39.2 && t < 43.3; COINS.userData.cs.forEach((m, i) => { m.visible = i < n; }); }
    { const k = kp(t, JWK); dust.update(t, 0, [0, 0, 0]); dustR.update(t, .4 * ON(t, 19.2, 20.2, 26.0, 27.0), [k.x, hC(k.x, k.z) + .05, k.z]); }
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(14, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(28, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(38, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(43, '#a89ab8', '#5a4448', .95, '#ff9458', 2.4, [10, 1.6, -4], .5, '#ffb480', FD, 14), Dk(46.5, '#8a86b0', '#4a3a40', .9, '#ff8a50', 2.0, [10, 1.2, -4], .5, '#ffa878', FD, 14),
    Dk(50.5, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(62, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [14, ['#5a86c4', '#f6d09a']], [28, ['#5a86c4', '#f6c890']], [38, ['#5a74b0', '#f4a070']], [43, ['#4a5a9a', '#f0905a']], [47, ['#2a3270', '#c87a60']], [50.5, ['#0e1636', '#2a3466']], [62, ['#0e1636', '#2a3466']]];
  return { group: g, update, light, bg, far, pl: [brosL, homeL, ...torchL, gateL, campL], state };
}
"""
out2 += NEW5.split('\n')
src2 = open(S + 'src/_world37_part1.js').read() + '\n'.join(out2)
open(S + 'src/world37.js', 'w').write(src2)
print('world37.js', len(src2))
