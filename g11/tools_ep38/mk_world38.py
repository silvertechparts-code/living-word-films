#!/usr/bin/env python3
# Derives g11/src/world38.js (Genesis 38, Judah and Tamar) from world37.js: the island, terrain, river, trees, reeds, camps, walled town, torches and the road are reused; the people, props (lamp, veil, seal, cord, staff, infants), choreography, update loop and light are new.
S = '/home/claude/g11/'
L = open(S + 'src/world37.js').read().split('\n')
def ln(a, b): return L[a - 1:b]            # 1-indexed inclusive
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

HEAD = [
"// Episode 38: Genesis 38, Judah and Tamar. Judah gives his firstborn Er a wife, Tamar (38:6); Er displeased the Lord and the Lord took his life (38:7); Judah tells Onan to marry his brother's widow (38:8); Onan would not give her a child and the Lord took his life too (38:9-10).",
"// Judah tells Tamar to stay a widow in her father's house until his son Shelah is grown, for he feared Shelah would die like his brothers (38:11); years pass and Shelah is grown but Tamar is not given to him (38:14); she covers herself with a veil and sits by the road, and Judah does not know her (38:14-16); he leaves his seal, cord and staff and she conceives (38:18).",
"// Three months later Judah is told Tamar is pregnant and says: bring her out, and let her be burned (38:24); she sends him the seal, cord and staff (38:25); Judah says she is more in the right than he (38:26); Tamar gives birth to twins, Perez and Zerah (38:27-30).",
"// Cinematic interpretation: the camp, the road, the roadside stone, the gate of the walled town at dusk, the lamp, the veil, the seal, cord and staff and the two newborns are pictures made for this film. The text gives no landscape and no faces; nothing of the act between Judah and Tamar is shown, and the deaths of Er and Onan are shown only as a lamp going out and an empty place.",
]
out = HEAD + ln(5, 128)                      # imports, terrain, helpers, trees, reeds, river, camp tents, walled town, torches, the oak, Jacob's camp (used as Tamar's father's house), fire()

NEW1 = r"""
  // ---- the stage: Judah's tents at the west end of the road, Tamar's father's house in the north camp, the roadside stone and the town gate in the east
  const DOOR = [-5.1, .55], LAMP = [-5.25, .88], JU1 = [-4.1, .45], ER1 = [-4.8, .9], TB1 = [-4.8, .2], ON1 = [-4.5, .88], JU2 = [-3.7, .78], TJ = [-4.25, .45], SH1 = [-3.4, .45];
  const JCD = [-3.35, -4.15], JCD2 = [-3.4, -4.3], RSIT = [3.95, 1.3], STN = [3.62, 1.52], GB_ = [4.6, .6], GATE0 = [6.45, .2];
  // ---- harvest: small sheaves of grain stand about the camp (the text gives no season for the weddings; this is the film's picture)
  { const b = new GB(rng(396)), rr = rng(397); [[-7.1, -2.1], [-6.7, -2.3], [-6.4, -1.9], [-3.1, 3.0], [-2.6, 3.3], [-8.8, 1.9], [-9.1, 1.5], [-2.2, 3.4], [-1.5, 3.1]].forEach(([x, z]) => { const y = hC(x, z); for (let k = 0; k < 3; k++) b.box(pk(rr, ['#d8b860', '#c9a850', '#e0c470']), [x + (k - 1) * .035, y + .15, z + (k % 2) * .03], [.045, .3, .045], [(k - 1) * .18, 0, (1 - k) * .12], .01); b.box('#a8884a', [x, y + .15, z], [.11, .03, .11], [0, 0, 0], .005); }); ca.add(meshOf(b)); }
  // ---- the roadside stone where Tamar sits, and the bench of stone at the town gate where Judah hears the matter
  { const b = new GB(rng(398)); b.box('#9a8e7c', [RSIT[0], hC(RSIT[0], RSIT[1]) + .08, RSIT[1]], [.34, .16, .28], [0, .3, 0], .03); b.box('#a99c86', [STN[0], hC(STN[0], STN[1]) + .09, STN[1]], [.3, .18, .24], [0, -.2, 0], .03); b.box('#a08a64', [GB_[0], hC(GB_[0], GB_[1]) + .07, GB_[1]], [.3, .14, .22], [0, 0, 0], .03); b.box('#b0a088', [3.2, hC(3.2, 1.6) + .05, 1.6], [.16, .1, .14], [0, .5, 0], .03); ca.add(meshOf(b)); }
  // ---- the rug at the door of the north camp, where Tamar will sit
  { const b = new GB(rng(399)); b.box('#8a4a3a', [JCD2[0], hC(JCD2[0], JCD2[1]) + .012, JCD2[1] + .1], [.9, .016, .6], [0, 0, 0], .005); b.box('#d8b060', [JCD2[0], hC(JCD2[0], JCD2[1]) + .02, JCD2[1] + .1], [.9, .006, .08], [0, 0, 0], .002); ca.add(meshOf(b)); }
  // ---- the lamp (a small clay oil lamp at the door of Judah's tent): it burns while Er is there, and goes out
  { const b = new GB(rng(400)); b.box('#a8743a', [LAMP[0], hC(LAMP[0], LAMP[1]) + .03, LAMP[1]], [.08, .05, .06], [0, .4, 0], .01); b.box('#8a5a2a', [LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .05, LAMP[1]], [.04, .02, .03], [0, .4, 0], .005); ca.add(meshOf(b)); }
  const lampG = spriteGlow(LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .1, LAMP[1], .12, 0xffb858, 0), lampG2 = spriteGlow(LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .095, LAMP[1], .05, 0xfff0c0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa458, 0, 3.0, 1.6); lampL.position.set(LAMP[0] + .05, hC(LAMP[0], LAMP[1]) + .3, LAMP[1] + .1);
  // ---- the seal (a small cylinder on a cord), the cord, and the staff (38:18, 38:25)
  const mkSeal = () => { const gr = new THREE.Group(), b = new GB(rng(380)); b.add(G.cyl6, '#d8aa48', [0, .03, 0], [.026, .06, .026], [0, 0, 0], .01); b.box('#8a6a2a', [0, .065, 0], [.034, .012, .034], [0, 0, 0], .005); gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkCord = () => { const gr = new THREE.Group(), b = new GB(rng(381)); for (let k = 0; k < 14; k++) { const a = k * TAU / 14; b.box(k % 2 ? '#a83a2c' : '#e8dcc0', [Math.cos(a) * .045, .008, Math.sin(a) * .045], [.02, .012, .04], [0, -a, 0], .003); } gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkStaffP = () => { const gr = new THREE.Group(), b = new GB(rng(382)); b.box('#6b4a2c', [0, .3, 0], [.026, .6, .026], [0, 0, 0], .004); b.box('#5a3a20', [0, .6, 0], [.04, .035, .04], [0, 0, 0], .003); const m = meshOf(b); m.castShadow = true; gr.add(m); g.add(gr); gr.visible = false; return gr; };
  const SEAL = mkSeal(), CORD = mkCord(), STAFFP = mkStaffP();
  // ---- the two newborns (38:27-30): swaddled, one with a red thread at his wrist
  const mkInfant = (col, thread, sd) => { const gr = new THREE.Group(), b = new GB(rng(390 + sd)); b.box(col, [0, .035, 0], [.2, .07, .09], [0, 0, 0], .015); b.box('#efe4cc', [-.06, .075, 0], [.08, .025, .09], [0, 0, 0], .01); b.add(G.ico0, '#cf9468', [.115, .05, 0], [.045, .045, .042], [0, 0, 0], .01); b.box('#2a1a10', [.125, .078, 0], [.03, .012, .04], [0, 0, 0], .005);
    if (thread) { b.box('#cf9468', [.03, .08, .055], [.05, .016, .016], [0, 0, .3], .003); b.box('#c0302a', [.052, .085, .057], [.012, .022, .022], [0, 0, 0], .002); }
    gr.add(meshOf(b)); ca.add(gr); gr.visible = false; return gr; };
  const INF = [mkInfant('#d8c8a8', false, 0), mkInfant('#c8d0b8', true, 1)];
  { const p = [[JCD2[0] + .26, JCD2[1] + .3, .5], [JCD2[0] - .12, JCD2[1] + .34, -.3]]; INF.forEach((m, i) => { m.position.set(p[i][0], hC(p[i][0], p[i][1]) + .022, p[i][1]); m.rotation.y = p[i][2]; }); }
  // ---- animals: Judah's flock stays at the camp; two sheep at Tamar's father's house
  const place = (s, x, z, ry) => { s.group.position.set(x, hC(x, z) - .02, z); s.group.rotation.y = ry; ca.add(s.group); return s; };
  const HOME = [0, 1, 2, 3, 4].map(i => place(makeSheep(rng(700 + i)), 0, 0, 0)), JSH = [0, 1].map(i => place(makeSheep(rng(750 + i)), 0, 0, 0));
"""
out += NEW1.split('\n')
out += ln(160, 165)                          # far mountains, cloud sea, sun glow, motes, dust
NEW2 = r"""  const CLOUD = [[0, '#e8c8a0'], [14, '#e8d0a8'], [27, '#e8c8a0'], [38, '#e8b898'], [42, '#d8a08c'], [45, '#a8809a'], [48, '#5a5a88'], [60, '#4a4a78'], [70, '#f0cfa8'], [99, '#f0cfa8']];
  const CEM = [[0, '#6a5848'], [38, '#6a5848'], [42, '#5a4a52'], [46, '#3a3a58'], [60, '#22223a'], [70, '#7a6050'], [99, '#7a6050']];"""
out += NEW2.split('\n')
out += ln(168, 170)                          # colAt, FARC, bgAtW
out += ln(172, 195)                          # animation helpers, route builder, hdgAt, ACT, act, W_, mixA, aF, aO, aP, toward, trek

NEW3 = r"""
  // ---- the people. All are new and unnamed in the text beyond Judah, Er, Onan, Shelah and Tamar; Tamar has three states (bride, widow, veiled); Shelah has two (boy, grown man)
  const judah = person(rng(990), { pants: '#d9ccb0', top: '#3f5a7a', skin: '#b98a62', hair: '#2e1d10', beard: '#2e1d10', cloth: '#e8dcc0', mantle: '#7a4a2a', sash: '#6a3a1a', seed: 990 }, .46);
  const er = person(rng(991), { pants: '#d9ccb0', top: '#8a3a2e', skin: '#b98a62', hair: '#2a1a10', sash: '#3a2a1a', seed: 991 }, .43);
  const onan = person(rng(992), { pants: '#cdbd98', top: '#5a6a4a', skin: '#a8714a', hair: '#2a1a10', sash: '#3a2a1a', seed: 992 }, .43);
  const shB = person(rng(993), { pants: '#d9ccb0', top: '#c9a15a', skin: '#b98a62', hair: '#2a1a10', seed: 993 }, .31);
  const shM = person(rng(993), { pants: '#d9ccb0', top: '#c9a15a', skin: '#b98a62', hair: '#2a1a10', sash: '#6a3a1a', seed: 993 }, .44);
  const tBr = person(rng(994), { pants: '#e0d4b4', top: '#4f9a8a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#efe4cc', sash: '#c9a15a', seed: 994 }, .42);
  const tWd = person(rng(994), { pants: '#2c2830', top: '#3a323c', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#2c2830', sash: '#4a3a44', seed: 994 }, .42);
  const tVl = person(rng(994), { pants: '#c8a878', top: '#b8784a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#d8b080', sash: '#6a3a2a', seed: 994 }, .42);
  const veilG = new THREE.Group(); { const b = new GB(rng(995)); b.box('#d8b080', [0, -.09, .098], [.2, .18, .024], [0, 0, 0], .01); b.box('#c49a68', [0, -.01, .1], [.22, .03, .03], [0, 0, 0], .01); veilG.add(meshOf(b)); veilG.position.set(0, 1.08, 0); tVl.group.add(veilG); veilG.scale.y = 0; }
  const MEN = [['#7a5a3a', '#e8dcc0', '#6a4a2a', 1000], ['#5a6a7a', '#d8c9a8', null, 1001], ['#8a6a4a', '#e0d4b8', null, 1002]].map(([top, cloth, mantle, sd], i) => person(rng(260 + i), { pants: '#d8ccb0', top, skin: '#a8714a', hair: '#2a1a10', beard: i < 2 ? '#2a1a10' : undefined, cloth, mantle: mantle || undefined, sash: '#4a2a1a', seed: sd }, .45));
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(38)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  const judahStaff = mkStaff(); judah.group.add(judahStaff);
  const ALLP = [judah, er, onan, shB, shM, tBr, tWd, tVl, ...MEN]; ALLP.forEach(o => g.add(o.group));
"""
out += NEW3.split('\n')
src = '\n'.join(out)
open(S + 'src/_world38_part1.js', 'w').write(src)
print('part1 ok', len(src))

# ===================== part 2: choreography, update loop, light =====================
NEW4 = r"""
  const fx = (dx, dz) => () => headZ(dx, dz);
  const ftoP = p => (t, q) => toward(q.x, q.z, p);
  const ftoK = keys => (t, q) => { const o = kp(t, keys); return toward(q.x, q.z, [o.x, o.z]); };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const ang = (a, b, k) => a + (b - a) * k;
  const SIT = () => -.12;
  // ---- a1 (0.6-8.6): Judah gives his firstborn Er a wife named Tamar (38:6); Er displeased the Lord and the Lord took his life (38:7): the lamp at the door goes out, and Tamar is alone in the dark clothes of a widow
  const aJ1 = still(judah, JU1, 0, 14.0, { sp: 5, face: (t, q) => t < 8.6 ? toward(q.x, q.z, [-4.8, .55]) : (t < 10.0 ? toward(q.x, q.z, ON1) : (t < 11.8 ? toward(q.x, q.z, DOOR) : toward(q.x, q.z, ON1))), ex: t => mixA(aO(.8 * ON(t, 1.0, 1.7, 3.2, 3.9)), aF(.4 * ON(t, 5.0, 5.8, 8.0, 8.5)), aP(ON(t, 10.0, 10.5, 11.5, 12.0)), aF(.5 * ON(t, 12.4, 12.9, 13.6, 14.0))) });
  const aE1 = still(er, ER1, 0, 4.6, { face: ftoP([-4.8, .55]), ex: t => mixA(aF(.55)) });
  const aTb = still(tBr, TB1, 0, 4.6, { face: ftoP(ER1), ex: t => mixA(aF(.45 * ON(t, .8, 1.5, 4.0, 4.5))) });
  const aE2 = still(er, DOOR, 4.6, 6.5, { face: fx(.75, .45), ex: t => mixA({ lx: .05 }, aO(.25 * ON(t, 5.0, 5.6, 6.1, 6.5))) });
  const DOOR2 = [-5.05, .02];
  const aT1 = still(tWd, DOOR, 6.4, 8.6, { face: fx(.7, .6), ex: t => mixA({ lx: .1 + .04 * Math.sin(t * 1.3) }, aF(.5)) });
  const aT1b = still(tWd, DOOR2, 8.6, 14.2, { face: (t, q) => toward(q.x, q.z, JU1), ex: t => mixA({ lx: .08 + .03 * Math.sin(t * 1.3) }, aF(.5)) });
  const aT1c = still(tWd, DOOR, 14.2, 16.2, { face: fx(.9, .3), ex: t => mixA({ lx: .1 + .03 * Math.sin(t * 1.3) }, aF(.5)) });
  // ---- a2 (8.6-16.8): Judah tells Onan to marry his brother's widow (38:8); Onan would not give her a child and the Lord took his life too (38:9-10): he turns away and is gone; the lamp goes out a second time
  const aO1 = still(onan, ON1, 8.6, 13.4, { face: (t, q) => t < 11.4 ? toward(q.x, q.z, JU1) : ang(toward(q.x, q.z, JU1), headZ(.2, 1), smooth(11.5, 12.6, t)), ex: t => mixA(aF(.35 * ON(t, 8.9, 9.5, 11.0, 11.5)), aF(.8 * ON(t, 12.2, 12.8, 13.3, 13.4))) });
  const aO2 = act(onan, route(13.4, ON1).go(.8, [-3.4, 1.3]).go(.9, [-1.6, 1.2]).keys, { sp: 6, show: W_(13.4, 16.8) });
  // ---- b1 (16.8-25.8): Judah tells Tamar to stay a widow in her father's house until Shelah is grown (38:11); he feared Shelah would die too
  const aJ2 = act(judah, route(14.0, JU1).go(.5, JU2).wait(30.9).keys, { sp: 5, show: W_(14.0, 30.9), face: (t, p) => p.mv ? null : (t < 18.3 ? toward(p.x, p.z, TJ) : (t < 20.4 ? headZ(0, -1) : (t < 22.8 ? ftoK(aT3.keys)(t, p) : (t < 27.0 ? toward(p.x, p.z, SH1) : toward(p.x, p.z, [-3.0, .9]))))), ex: t => mixA(aP(ON(t, 18.3, 18.8, 19.9, 20.4)), aF(.5 * ON(t, 22.9, 23.5, 25.6, 26.4)), { lx: .06 * ON(t, 23.5, 24.2, 25.4, 26.2) }) });
  const aT2 = act(tWd, route(16.2, DOOR).go(.55, TJ).wait(20.4).keys, { sp: 6, show: W_(16.2, 20.4), face: (t, p) => p.mv ? null : toward(p.x, p.z, JU2), ex: t => mixA({ lx: .08 }, aF(.5)) });
  const aT3 = act(tWd, route(20.4, TJ).go(1.15, [-4.0, -1.2]).go(1.15, [-3.6, -3.2]).go(1.0, JCD).keys, { sp: 7, show: W_(20.4, 24.6) });
  const aSB = still(shB, SH1, 16.8, 27.0, { face: (t, q) => t < 20.4 ? toward(q.x, q.z, TJ) : toward(q.x, q.z, JU2), ex: t => mixA({ lx: .04 }) });
  // ---- b2 (25.8-31.4): years passed, Shelah grew up, but Tamar was not given to him (38:14): the light swings across the sky; Tamar waits at her father's house
  const aSM = still(shM, SH1, 27.0, 31.4, { face: fx(1, .35), ex: t => mixA(aF(.3 * ON(t, 27.6, 28.2, 30.6, 31.2))) });
  const aT4 = still(tWd, JCD, 24.6, 31.4, { face: (t, q) => t < 28.4 ? headZ(.3, 1) : toward(q.x, q.z, [-3.7, .8]), ex: t => mixA({ lx: .05 }, aF(.45)) });
  // ---- c1 (31.2-41.8): she covered her face with a veil and sat by the road (38:14); Judah did not know her (38:15); he left his seal, cord and staff (38:18)
  const aTv0 = still(tVl, JCD, 31.4, 34.2, { face: (t, q) => ang(headZ(.3, 1), headZ(.9, .3), smooth(33.4, 34.0, t)), ex: t => mixA(aP(.7 * ON(t, 32.3, 32.8, 33.2, 33.6)), aF(.5 * ON(t, 33.4, 33.8, 34.1, 34.2))) });
  const aTv = still(tVl, RSIT, 34.2, 41.8, { y: SIT, face: (t, q) => t < 35.6 ? headZ(-1, -.3) : toward(q.x, q.z, [3.3, .85]), ex: t => mixA({ lx: .09 }, aF(.35)) });
  const aJ3 = act(judah, route(30.9, JU2).go(1.29, [-3.2, 1.1]).go(1.29, [-1.0, 1.15]).go(1.29, [.45, 1.2]).go(1.29, [2.2, 1.0]).go(1.29, [3.3, .85]).wait(37.7).go(1.1, [4.7, .45]).go(1.1, [5.5, .2]).go(1.1, [6.6, .2]).keys, { sp: 7, show: W_(30.9, 41.0), face: (t, p) => p.mv ? null : toward(p.x, p.z, RSIT), ex: t => mixA(aO(.35 * ON(t, 36.6, 37.0, 37.5, 37.8))) });
  // ---- c2 (41.5-49.4): three months later Judah heard Tamar was pregnant and said: bring her out, and let her be burned (38:24): dusk at the gate of the town
  const aJg = still(judah, GB_, 41.8, 54.8, { sp: 5, face: (t, q) => t < 44.9 ? toward(q.x, q.z, MENP[0]) : (t < 47.6 ? headZ(1, .05) : toward(q.x, q.z, [4.95, .3])), ex: t => mixA(aF(.45 * ON(t, 42.0, 42.6, 44.5, 45.0)), aP(ON(t, 45.3, 45.8, 46.9, 47.4)), aF(.5 * ON(t, 52.0, 52.6, 54.4, 54.8)), { lx: .12 * ON(t, 52.3, 53.0, 54.4, 54.8) }) });
  const MENP = [[4.15, .98], [4.3, -.4], [3.85, -.05]];
  const aM1 = still(MEN[0], MENP[0], 41.8, 54.8, { ph: 1, sp: 5, face: (t, q) => t < 47.6 ? toward(q.x, q.z, GB_) : toward(q.x, q.z, [4.95, .3]), ex: t => mixA(aP(ON(t, 42.4, 42.9, 44.2, 44.7))) });
  const aM2a = still(MEN[1], MENP[1], 41.8, 47.5, { ph: 3, sp: 5, face: ftoP(GB_), ex: t => mixA(aF(.3)) });
  const aM3a = still(MEN[2], MENP[2], 41.8, 47.5, { ph: 5, sp: 5, face: ftoP(GB_), ex: t => mixA(aF(.3)) });
  const aTg = act(tWd, route(47.6, GATE0).go(.85, [4.95, .3]).wait(54.8).keys, { sp: 6, show: W_(47.6, 54.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, GB_), ex: t => mixA({ lx: .04 }, aF(.6 * ON(t, 47.7, 48.4, 48.9, 49.4) + .95 * ON(t, 49.4, 49.9, 54.6, 54.8))) });
  const aM2b = act(MEN[1], route(47.6, [6.4, .6]).go(.85, [5.05, .62]).wait(54.8).keys, { ph: 3, sp: 6, show: W_(47.6, 54.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [4.95, .3]), ex: t => mixA(aF(.3)) });
  const aM3b = act(MEN[2], route(47.6, [6.4, -.2]).go(.85, [5.05, -.08]).wait(54.8).keys, { ph: 5, sp: 6, show: W_(47.6, 54.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [4.95, .3]), ex: t => mixA(aF(.3)) });
  // ---- d2 (54.8-61.8): Tamar gave birth to twins, Perez and Zerah (38:27-30): morning at her father's house
  const aTb2 = still(tWd, JCD2, 54.8, 61.8, { y: SIT, face: (t, q) => ang(headZ(.15, 1), toward(q.x, q.z, [JCD2[0] + .07, JCD2[1] + .32]), smooth(56.4, 57.2, t)), ex: t => mixA({ lx: .05 + .1 * smooth(56.4, 57.2, t) }, aF(.35 + .4 * smooth(56.4, 57.2, t))) });
  // ---- the animals
  const ANIM = [...HOME, ...JSH], AK = new Map(), AV = new Map();
  [[-2.4, -1.4], [-1.7, -.5], [-.7, -1.4], [-2.8, -.8], [-1.2, -1.0]].forEach((p, i) => { AK.set(HOME[i], route(0, p).wait(8).go(.12, [p[0] + .25, p[1] + .1]).wait(90).keys); AV.set(HOME[i], t => t < 31.5); });
  [[-2.4, -3.3], [-4.5, -3.7]].forEach((p, i) => { AK.set(JSH[i], route(0, p).wait(10).go(.1, [p[0] + .2, p[1] - .12]).wait(90).keys); AV.set(JSH[i], t => t >= 24.4 && t < 34.5 || t >= 54.0); });
  const heldAt = (a, fw, side, h, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null, hd = fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, hC(p.x, p.z) + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
"""
out2 = NEW4.split('\n')

NEW5 = r"""
  function update(t, camera, sid) {
    const cam = camera && camera.position, dawn = sid === 'birth' || sid === 'rise', tc = dawn ? 70 : t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = dawn ? 0 : ON(t, 42.0, 47.0, 53.5, 54.6), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the walled town stands the whole time; its torches and windows light at dusk (38:24, cinematic interpretation)
    { townG.visible = true; const tk = smooth(40.4, 42.2, t) * (1 - smooth(52.8, 54.4, t));
      torchL.forEach((l, i) => { l.intensity = 2.0 * tk * (fl + .05 * i); }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = smooth(41.0 + 3 * w.ord, 42.0 + 3 * w.ord, t) * (1 - smooth(52.8, 54.4, t)); w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    FIRES.forEach(f => { f.s.visible = f.s2.visible = false; });
    // ---- the lamp at the door: lit while Er is there, relit, and out again after Onan
    { const lk = Math.min(1, smooth(.4, 1.0, t) * (1 - smooth(6.1, 6.5, t)) + smooth(8.8, 9.4, t) * (1 - smooth(14.9, 15.3, t))), lf = fl * (1 - .35 * ON(t, 14.2, 14.5, 14.7, 15.0));
      lampG.material.opacity = .6 * lk * lf; lampG2.material.opacity = .8 * lk * lf; lampG.visible = lampG2.visible = lk > .01; lampL.intensity = 1.3 * lk * lf; }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    veilG.scale.y = smooth(32.4, 33.6, t); judahStaff.visible = t < 37.7;
    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = AV.get(a)(t); a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      if (p.mv) walkLegs(a.legs, t + i * 1.3, 7, .5); else walkLegs(a.legs, 0, 0, 0); });
    // ---- the seal, the cord and the staff: left on the roadside stone (38:18), held out by Tamar at the gate (38:25)
    { const onStone = t >= 37.7 && t < 41.9, held = t >= 49.4 && t < 54.8;
      SEAL.visible = CORD.visible = STAFFP.visible = onStone || held;
      if (onStone) { const y = hC(STN[0], STN[1]) + .18; SEAL.position.set(STN[0] + .04, y, STN[1] - .03); SEAL.rotation.y = .4; CORD.position.set(STN[0] - .07, y, STN[1] + .05); CORD.rotation.y = .2; STAFFP.position.set(STN[0] - .26, hC(STN[0] - .26, STN[1] + .14), STN[1] + .14); STAFFP.rotation.set(0, .2, .32); }
      else if (held) { const k = smooth(49.4, 50.0, t), a = heldAt(aTg, .17 + .02 * k, .03, .21 + .02 * k, t), b2 = heldAt(aTg, .17 + .02 * k, -.03, .17 + .02 * k, t), c = heldAt(aTg, .06, -.2, 0, t); SEAL.position.set(a[0], a[1], a[2]); SEAL.rotation.y = a[3]; CORD.position.set(b2[0], b2[1], b2[2]); CORD.rotation.y = b2[3]; STAFFP.position.set(c[0], c[1] - hC(c[0], c[2]) + hC(c[0], c[2]) + .0, c[2]); STAFFP.position.y = hC(c[0], c[2]); STAFFP.rotation.set(0, c[3], .06); } }
    { const k = smooth(56.2, 56.9, t); INF.forEach((m, i) => { m.visible = t >= 56.1; m.scale.setScalar(Math.max(.01, k)); }); }
    { const k = kp(t, aT3.keys); dust.update(t, 0, [0, 0, 0]); dustR.update(t, .4 * ON(t, 20.8, 21.6, 23.8, 24.4), [k.x, hC(k.x, k.z) + .05, k.z]); }
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(4.4, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14),
    Dk(6.3, '#9a9cb0', '#584a46', .88, '#f0b078', 1.7, [9, 2.6, -5], .5, '#ffcf9a', FD, 14), Dk(8.9, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.5, [9, 2.8, -5], .5, '#ffcf9a', FD, 14),
    Dk(14.2, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.5, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(15.2, '#9a9cb0', '#584a46', .88, '#f0b078', 1.8, [9, 2.6, -5], .5, '#ffcf9a', FD, 14),
    Dk(16.8, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(25.8, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(27.1, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [-9, 3.0, -4], .5, '#ffcf9a', FD, 14), Dk(38, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [-10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(42, '#a89ab8', '#5a4448', .95, '#ff9458', 2.2, [-10, 1.5, -4], .5, '#ffb480', FD, 14), Dk(46.5, '#6a72a8', '#322c44', .95, '#9aa8f0', 1.6, [-9, 5.0, -3], .62, '#7a8cd0', FD, 14),
    Dk(54.0, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(62, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [14, ['#5a86c4', '#f6d09a']], [27, ['#5a86c4', '#f6c890']], [38, ['#5a74b0', '#f4a070']], [42, ['#4a5a9a', '#f0905a']], [45, ['#2a3270', '#c87a60']], [48, ['#0e1636', '#2a3466']], [60, ['#0e1636', '#2a3466']], [70, ['#6a8ec8', '#f8d4a0']], [99, ['#6a8ec8', '#f8d4a0']]];
  return { group: g, update, light, bg, far, pl: [lampL, ...torchL, gateL, campL], state };
}
"""
out2 += NEW5.split('\n')
src2 = open(S + 'src/_world38_part1.js').read() + '\n'.join(out2)
open(S + 'src/world38.js', 'w').write(src2)
print('world38.js', len(src2))
