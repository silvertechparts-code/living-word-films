#!/usr/bin/env python3
# Derives g11/src/world39.js (Genesis 39, The Lord Was With Joseph) from world37.js: the island, terrain, river, reeds, walled town (as a distant city), torches helper and the animation helpers are reused; the house, portico, courtyard, palms, prison yard, people and props are new.
S = '/home/claude/g11/'
L = open(S + 'src/world37.js').read().split('\n')
def ln(a, b): return L[a - 1:b]            # 1-indexed inclusive
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

HEAD = [
"// Episode 39: Genesis 39 (NRSV-CE). Joseph serves in Potiphar's house in Egypt and the Lord is with him (39:2-4); Potiphar puts him in charge of the household (39:4-6); Potiphar's wife asks him to lie with her and he refuses, saying how could he do this great wickedness and sin against God (39:7-9); she presses him day after day and he refuses (39:10);",
"// one day, when none of the men of the house was there, she caught hold of his garment and he left it in her hand and ran outside (39:11-12); she called her servants and told her husband a story, showing the garment (39:13-18); Potiphar was furious and put him in the prison where the king's prisoners were held (39:19-20); the Lord was with him there too, and the keeper of the prison put the prisoners in his care (39:21-23).",
"// Cinematic interpretation: the house, its portico and courtyard, the palms, the prison yard and its gate, the faces and clothes, the colour of the cloak, the keys handed over, the order of who stands where, and the light (golden day, dusk, night in the prison, dawn) are pictures made for this film. The text gives no architecture, faces or time of day. Nothing explicit is shown.",
]
out = HEAD + ln(5, 128)
src_a = '\n'.join(out)
# hide the six tents of the west camp (ETENTS) and the three tents of the north camp (Jacob's camp in the shared stage): they do not belong in Egypt
src_a = rep(src_a, "m.rotation.y = ry; ca.add(m); });", "m.rotation.y = ry; m.visible = false; ca.add(m); });")
src_a = rep(src_a, "m.castShadow = true; m.rotation.y = 1.3; ca.add(m); }", "m.castShadow = true; m.rotation.y = 1.3; ca.add(m); occ.push({ m, s: 2.5 }); }")
out = src_a.split('\n')

NEW1 = r"""
  // ---- the stage: Potiphar's house at the west end of the road (mudbrick, a painted frieze, a portico of four columns), its courtyard with a low wall and a gate, a well, jars, palms; the prison yard in the north (stone walls, a barred gate, torches)
  ETENTS.forEach(m => { m.visible = false; });
  const HSE = [-7.5, -1.0], FRX = HSE[0] + .95, CGATE = [-3.7, -1.0], PRIS = [-3.3, -4.8], PGATE = [-3.3, -3.7], WELL = [-4.55, -2.05];
  const wallB = (b, rr, x0, z0, x1, z1, h, th, cols) => { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(l / .27)), a = -Math.atan2(z1 - z0, x1 - x0);
    for (let i = 0; i < n; i++) { const u = (i + .5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u, hh = h * (.88 + .24 * rr()); b.box(pk(rr, cols), [x, hC(x, z) + hh / 2, z], [l / n * 1.04, hh, th], [0, a, 0], .02); } };
  const jarB = (b, x, z, sc, col) => { const y = hC(x, z); b.add(G.cylT, col, [x, y, z], [.068 * sc, .15 * sc, .068 * sc], [0, 0, 0], .01); b.add(G.cyl6, '#a8683c', [x, y + .15 * sc, z], [.036 * sc, .035 * sc, .036 * sc], [0, 0, 0], .005); };
  { const b = new GB(rng(391)), rr = rng(392), y0 = hC(HSE[0], HSE[1]), PZ = HSE[1];
    b.box('#d4bb8e', [HSE[0], y0 + .4, PZ], [1.9, .8, 2.4], [0, 0, 0], .02);                                   // the block
    b.box('#cdb284', [HSE[0] - .25, y0 + .95, PZ], [1.2, .3, 1.8], [0, 0, 0], .02);                         // a small upper room on the roof
    b.box('#2a1c12', [HSE[0] + .355, y0 + .97, PZ], [.02, .13, .26], [0, 0, 0], .004); b.box('#7a5a3a', [HSE[0] + .352, y0 + .97, PZ], [.015, .17, .32], [0, 0, 0], .004);
    b.box('#c4aa7a', [HSE[0] + .93, y0 + .86, PZ], [.07, .12, 2.4], [0, 0, 0], .015); b.box('#c4aa7a', [HSE[0] - .93, y0 + .86, PZ], [.07, .12, 2.4], [0, 0, 0], .015);
    b.box('#c4aa7a', [HSE[0], y0 + .86, PZ + 1.17], [1.9, .12, .07], [0, 0, 0], .015); b.box('#c4aa7a', [HSE[0], y0 + .86, PZ - 1.17], [1.9, .12, .07], [0, 0, 0], .015);
    for (let k = 0; k < 12; k++) b.box(['#b8402e', '#2e6a9a', '#d8a838', '#f0e8d0'][k % 4], [FRX + .012, y0 + .7, PZ - 1.1 + k * .2], [.02, .09, .17], [0, 0, 0], .003);   // the painted frieze
    b.box('#b79e72', [FRX + .006, y0 + .06, PZ], [.012, .12, 2.4], [0, 0, 0], .004);
    b.box('#6a4a2a', [FRX + .01, y0 + .22, PZ], [.025, .44, .32], [0, 0, 0], .004); b.box('#241810', [FRX + .02, y0 + .21, PZ], [.02, .4, .25], [0, 0, 0], .003);      // the door and its frame
    for (const dz of [-.92, .92]) { b.box('#6a4a2a', [FRX + .01, y0 + .42, PZ + dz], [.025, .17, .16], [0, 0, 0], .004); b.box('#241810', [FRX + .02, y0 + .42, PZ + dz], [.02, .13, .11], [0, 0, 0], .003); }
    b.box('#bfa87c', [FRX + .34, y0 + .03, PZ], [.68, .06, 2.3], [0, 0, 0], .01); b.box('#b39c70', [FRX + .72, y0 + .015, PZ], [.2, .03, 1.0], [0, 0, 0], .01);       // the portico floor and a step
    for (const dz of [-.9, -.3, .3, .9]) { b.box('#b8a070', [FRX + .31, y0 + .09, PZ + dz], [.13, .06, .13], [0, 0, 0], .004); b.add(G.cyl6, '#e4d2a2', [FRX + .31, y0 + .09, PZ + dz], [.052, .5, .052], [0, 0, 0], .006); b.box('#c8452e', [FRX + .31, y0 + .62, PZ + dz], [.14, .05, .14], [0, 0, 0], .004); }
    b.box('#c8b080', [FRX + .3, y0 + .675, PZ], [.62, .055, 2.3], [0, 0, 0], .01); b.box('#2e6a9a', [FRX + .605, y0 + .675, PZ], [.012, .05, 2.3], [0, 0, 0], .003);
    wallB(b, rr, -6.1, -2.6, -3.7, -2.6, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']); wallB(b, rr, -6.1, .6, -3.7, .6, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']);                   // the courtyard wall, low enough to see over
    wallB(b, rr, -3.7, -2.6, -3.7, -1.4, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']); wallB(b, rr, -3.7, -.6, -3.7, .6, .16, .1, ['#cdb48c', '#c2a67a', '#d4c29c']);
    for (const z of [-1.4, -.6]) b.box('#cbb78e', [-3.7, hC(-3.7, z) + .16, z], [.15, .32, .15], [0, 0, 0], .01);
    for (let k = 0; k < 8; k++) { const an = k * TAU / 8; b.box(pk(rr, ['#9a8e7c', '#a99c86', '#85796a']), [WELL[0] + Math.cos(an) * .14, hC(WELL[0], WELL[1]) + .05, WELL[1] + Math.sin(an) * .14], [.09, .1, .08], [0, -an, 0], .02); }
    jarB(b, -4.25, -2.2, 1.0, '#b87a4a'); jarB(b, -4.4, -2.32, .8, '#a8683c'); jarB(b, FRX + .22, PZ - 1.1, 1.1, '#b87a4a'); jarB(b, FRX + .3, PZ + 1.0, .9, '#a8683c'); jarB(b, -5.3, .4, 1.0, '#b87a4a');
    b.box('#c9a15a', [-5.0, hC(-5.0, .4) + .04, .38], [.16, .08, .13], [0, .3, 0], .01); b.box('#b8914a', [-5.95, hC(-5.95, .4) + .04, .42], [.15, .08, .12], [0, -.2, 0], .01);
    ca.add(meshOf(b)); }
  // ---- palms: a trunk of boxes, ten fronds that droop, a few upright ones, a cluster of dates
  const palm = (x, z, s, sd) => { const rr = rng(sd), b = new GB(rr), n = 7; let cx = 0;
    for (let k = 0; k < n; k++) { const u = k / n; cx = .14 * s * u * u; b.box(k % 2 ? '#8a6a48' : '#7c5e3e', [cx, (k + .5) * .15 * s, 0], [.08 * s * (1 - .35 * u), .16 * s, .08 * s * (1 - .35 * u)], [0, 0, 0], .012); }
    const top = n * .15 * s;
    for (let k = 0; k < 10; k++) { const an = k * TAU / 10 + rr() * .3, len = (.5 + .12 * rr()) * s, tl = .45 + .3 * rr(); b.box(pk(rr, ['#5f8a3a', '#6a9a44', '#557f36']), [cx + Math.cos(an) * Math.cos(tl) * len / 2, top - Math.sin(tl) * len / 2, Math.sin(an) * Math.cos(tl) * len / 2], [len, .014 * s, .11 * s], [0, -an, -tl], .01); }
    for (let k = 0; k < 4; k++) { const an = k * TAU / 4 + .7, len = .32 * s; b.box('#74a24c', [cx + Math.cos(an) * Math.cos(.8) * len / 2, top + Math.sin(.8) * len / 2, Math.sin(an) * Math.cos(.8) * len / 2], [len, .014 * s, .09 * s], [0, -an, .8], .01); }
    b.add(G.ico0, '#a8602a', [cx + .04 * s, top - .05 * s, .03 * s], [.04 * s, .05 * s, .04 * s], [0, 0, 0], .01); b.add(G.ico0, '#98521e', [cx - .03 * s, top - .06 * s, -.04 * s], [.035 * s, .045 * s, .035 * s], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = rr() * 6; ca.add(m); occ.push({ m, s: 1.05 * s }); return m; };
  [[-5.1, 2.4, .95, 11], [-9.7, -3.4, 1.05, 12], [-9.5, 2.0, .9, 13], [-2.1, 1.9, .85, 14], [-1.5, -3.0, 1.0, 15], [-6.4, -3.5, .85, 16], [1.5, 3.8, .95, 17], [-8.6, -4.6, .9, 18]].forEach(([x, z, s, sd]) => palm(x, z, s, sd));
  // ---- the prison yard: a compound of stone with a gate on its south side, a roof over one corner, mats, jars, two torches at the gate
  { const b = new GB(rng(393)), rr = rng(394), cols = ['#9a8e7c', '#a99c86', '#85796a'], x0 = PRIS[0] - 1.2, x1 = PRIS[0] + 1.2, z0 = PRIS[1] - 1.1, z1 = PRIS[1] + 1.1, gl = PGATE[0] - .27, gr = PGATE[0] + .27;
    b.box('#7a6a52', [PRIS[0], hC(PRIS[0], PRIS[1]) + .006, PRIS[1]], [2.36, .012, 2.16], [0, 0, 0], .004);
    wallB(b, rr, x0, z0, x1, z0, .72, .17, cols); wallB(b, rr, x0, z0, x0, z1, .72, .17, cols); wallB(b, rr, x1, z0, x1, z1, .72, .17, cols); wallB(b, rr, x0, z1, gl, z1, .72, .17, cols); wallB(b, rr, gr, z1, x1, z1, .72, .17, cols);
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) b.box('#aa9d86', [x, hC(x, z) + .43, z], [.22, .86, .22], [0, 0, 0], .02);
    for (const x of [gl, gr]) { b.box('#6a4a2a', [x, hC(x, z1) + .46, z1], [.14, .92, .14], [0, 0, 0], .01); b.box('#5a3a22', [x, hC(x, z1) + .93, z1], [.18, .05, .18], [0, 0, 0], .004); }
    b.box('#5a3a22', [PGATE[0], hC(PGATE[0], z1) + .96, z1], [.66, .07, .14], [0, 0, 0], .008);
    { const hx = gl + .07, hz = z1 + .02; b.box('#4a3220', [hx + Math.cos(1.1) * .13, hC(hx, hz) + .34, hz - Math.sin(1.1) * .13], [.26, .66, .03], [0, 1.1, 0], .006); for (let k = 0; k < 3; k++) b.box('#2e2218', [hx + Math.cos(1.1) * (.04 + k * .09), hC(hx, hz) + .34, hz - Math.sin(1.1) * (.04 + k * .09)], [.016, .6, .016], [0, 1.1, 0], .003); }   // the barred door, open
    for (const [x, z, a] of [[-4.1, -4.3, .1], [-2.55, -4.15, -.2], [-2.5, -5.4, .3]]) b.box('#8a7a5a', [x, hC(x, z) + .012, z], [.5, .016, .22], [0, a, 0], .004);
    for (const dx of [-.5, .5]) for (const dz of [-.4, .4]) b.box('#6a4a2a', [-2.62 + dx, hC(-2.62, -5.4) + .3, -5.38 + dz], [.04, .6, .04], [0, 0, 0], .006);
    b.box('#8a6a3a', [-2.62, hC(-2.62, -5.4) + .62, -5.38], [1.2, .045, .95], [0, 0, 0], .01);
    jarB(b, -4.15, -5.6, 1.0, '#a8683c'); jarB(b, -4.3, -5.45, .8, '#b87a4a'); jarB(b, -2.35, -4.6, .9, '#a8683c');
    b.box('#9a8e7c', [-4.3, hC(-4.3, -4.9) + .07, -4.9], [.14, .14, .7], [0, 0, 0], .015);
    ca.add(meshOf(b)); }
  const ptPos = [[PGATE[0] - .4, PGATE[1] - .12 + 1.1 - 1.1], [PGATE[0] + .4, PGATE[1] - .12]], PT = [[PGATE[0] - .27, PRIS[1] + 1.1 + .1], [PGATE[0] + .27, PRIS[1] + 1.1 + .1]];
  { const b = new GB(rng(395)); for (const [x, z] of PT) b.box('#5a3a22', [x, hC(x, z) + .8, z], [.03, .24, .03], [0, 0, 0], .01); ca.add(meshOf(b)); }
  const ptG = PT.map(([x, z]) => { const s = spriteGlow(x, hC(x, z) + .98, z, .3, 0xffa850, 0), s2 = spriteGlow(x, hC(x, z) + .96, z, .12, 0xfff0c0, 0); g.add(s, s2); return [s, s2]; });
  const ptL = PT.map(([x, z]) => { const l = new THREE.PointLight(0xffa050, 0, 4.6, 1.6); l.position.set(x, hC(x, z) + 1.0, z - .15); return l; });
  const prL = new THREE.PointLight(0xffb060, 0, 3.4, 1.5); prL.position.set(PRIS[0] - .1, hC(PRIS[0], PRIS[1]) + .85, PRIS[1] + .1);
  // ---- props: the cloak (39:12), a water jar carried at the start, the keys of the prison, spears for the guards
  const mkCloak = () => { const gr = new THREE.Group(), b = new GB(rng(380)); b.box('#2f6a72', [0, 0, 0], [.2, .05, .15], [0, .2, 0], .01); b.box('#d8b048', [0, .012, .07], [.2, .052, .02], [0, .2, 0], .004); b.box('#245860', [.07, -.06, .01], [.1, .12, .12], [0, 0, .2], .01); b.box('#2f6a72', [-.07, -.045, -.02], [.09, .09, .1], [0, 0, -.2], .01); gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkJarP = () => { const gr = new THREE.Group(), b = new GB(rng(381)); b.add(G.cylT, '#b87a4a', [0, 0, 0], [.07, .17, .07], [0, 0, 0], .01); b.add(G.cyl6, '#a8683c', [0, .17, 0], [.038, .04, .038], [0, 0, 0], .005); b.box('#8a5a2a', [.07, .12, 0], [.02, .07, .03], [0, 0, 0], .004); b.box('#8a5a2a', [-.07, .12, 0], [.02, .07, .03], [0, 0, 0], .004); gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const mkKeys = () => { const gr = new THREE.Group(), b = new GB(rng(382)); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; b.box('#d8aa48', [Math.cos(a) * .028, 0, Math.sin(a) * .028], [.014, .012, .02], [0, -a, 0], .002); } for (let k = 0; k < 3; k++) { b.box('#b89038', [-.01 + k * .014, -.04, .005 * k], [.01, .07, .012], [0, 0, 0], .002); b.box('#b89038', [-.01 + k * .014, -.072, .01 * k], [.024, .012, .012], [0, 0, 0], .002); } gr.add(meshOf(b)); g.add(gr); gr.visible = false; return gr; };
  const CLOAK = mkCloak(), JARP = mkJarP(), KEYS = mkKeys();
  const mkSpear = () => { const st = new THREE.Group(), b = new GB(rng(383)); b.box('#6b4a2c', [.2, .62, -.08], [.028, 1.3, .028], [0, 0, .04], .01); b.add(G.cone5, '#c0c4cc', [.215, 1.27, -.08], [.03, .1, .03], [0, 0, .04], .004); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
"""
out += NEW1.split('\n')
out += ln(160, 165)
NEW2 = r"""  const CLOUD = [[0, '#e8c8a0'], [14, '#e8d0a8'], [27, '#e8c8a0'], [40, '#e8b898'], [44, '#d8a08c'], [46.5, '#a8809a'], [49, '#5a5a88'], [60, '#4a4a78'], [70, '#f0cfa8'], [99, '#f0cfa8']];
  const CEM = [[0, '#6a5848'], [40, '#6a5848'], [44, '#5a4a52'], [47, '#3a3a58'], [60, '#22223a'], [70, '#7a6050'], [99, '#7a6050']];"""
out += NEW2.split('\n')
out += ln(168, 170)
out += ln(172, 195)

NEW3 = r"""
  // ---- the people. Joseph is the same face and body as in Genesis 37 (older, grown, in the plain tunic of a household servant; with and without the cloak); Potiphar, his wife, the servants, the guards, the prisoners and the keeper are new and unnamed on screen beyond Potiphar
  const joM = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', mantle: '#2f6a72', sash: '#6a3a1a', seed: 930 }, .44);
  const joN = person(rng(930), { pants: '#d9ccb0', top: '#c2812e', skin: '#c58c60', hair: '#2a1a10', sash: '#6a3a1a', seed: 930 }, .44);
  const pot = person(rng(940), { pants: '#efe6d0', top: '#efe6d0', skin: '#a8714a', hair: '#1a1410', mantle: '#c9a15a', sash: '#d8b048', seed: 940 }, .5);
  const wife = person(rng(941), { pants: '#efe6d0', top: '#f2ead6', skin: '#c58c60', hair: '#1a1410', long: true, sash: '#d8b048', seed: 941 }, .43);
  const sv1 = person(rng(950), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 950 }, .42);
  const sv2 = person(rng(951), { pants: '#d8c8a8', top: '#d0c0a0', skin: '#b98a62', hair: '#2a1a10', sash: '#8a6a3a', seed: 951 }, .41);
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  const PRS = [['#8a7a62', '#a8714a', 955, '#2e1d10'], ['#6a6a5a', '#b98a62', 956, null], ['#7a5a4a', '#c38a5c', 957, '#2e1d10'], ['#5a6a5a', '#9a6a44', 958, null]].map(([top, skin, sd, beard], i) => person(rng(270 + i), { pants: '#cdbd98', top, skin, hair: '#2a1a10', beard: beard || undefined, sash: '#3a2a1a', seed: sd }, .43));
  const wdn = person(rng(960), { pants: '#d8ccb0', top: '#4a5278', skin: '#b98a62', hair: '#6a6258', beard: '#6a6258', sash: '#c9a15a', seed: 960 }, .49);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  const ALLP = [joM, joN, pot, wife, sv1, sv2, gu1, gu2, ...PRS, wdn]; ALLP.forEach(o => g.add(o.group));
"""
out += NEW3.split('\n')
open(S + 'src/_world39_part1.js', 'w').write('\n'.join(out))
print('part1 ok', len('\n'.join(out)))

NEW4 = r"""
  const fx = (dx, dz) => () => headZ(dx, dz);
  const ftoP = p => (t, q) => toward(q.x, q.z, p);
  const ftoK = keys => (t, q) => { const o = kp(t, keys); return toward(q.x, q.z, [o.x, o.z]); };
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: W_(a, b), ...o });
  const ang = (a, b, k) => a + (b - a) * k;
  const SIT = () => -.12;
  const heldAt = (a, fw, side, h, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null, hd = fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); return [p.x + Math.sin(hd) * fw + Math.cos(hd) * side, hC(p.x, p.z) + h, p.z + Math.cos(hd) * fw - Math.sin(hd) * side, hd]; };
  const PORCH = [-6.0, -1.0];
  // ---- Joseph (with the cloak): carries a jar to the house (39:2), is put in charge (39:4-6), refuses her (39:8-10), goes in to his work and she catches his cloak (39:11-12)
  const aJ = act(joM, route(0, [-3.5, -1.0]).go(.62, [-5.35, -1.05]).wait(15.4).go(.55, [-4.75, -.85]).wait(20.6).go(.4, [-4.45, -.85]).wait(24.0).go(.55, [-4.0, -.45]).wait(26.0).go(.8, [-4.6, -1.4]).wait(27.9).go(1.0, [-5.2, -.3]).wait(29.6).go(.75, PORCH).wait(35.2).keys, { sp: 6, show: W_(0, 35.2),
    face: (t, p) => p.mv ? null : (t < 15.4 ? ang(ang(headZ(-1, .2), headZ(.7, .7), smooth(4.2, 5.4, t)), toward(p.x, p.z, [-6.0, -.45]), smooth(8.0, 8.8, t)) : (t < 24.0 ? toward(p.x, p.z, [-6.2, -1.5]) + (t > 21.2 && t < 24 ? .35 * Math.sin((t - 21.2) * 5.5) : 0) : (t < 29.6 ? toward(p.x, p.z, [-6.2, -1.5]) : (t < 32.4 ? headZ(-1, 0) : headZ(-1, .05))))),
    ex: t => mixA(aF(.55 * ON(t, 3.0, 3.6, 7.8, 8.4)), aO(.4 * ON(t, 21.0, 21.5, 23.2, 23.8)), aF(.4 * ON(t, 11.8, 12.4, 14.8, 15.4)), aF(.5 * ON(t, 32.2, 32.8, 34.4, 35.1))) });
  const aJr = act(joN, route(35.2, PORCH).go(1.7, CGATE).go(1.7, [-2.0, -.9]).go(1.7, [-.6, -.4]).keys, { sp: 11, show: W_(35.2, 38.4), face: (t, p) => p.mv ? null : headZ(1, 0), ex: t => mixA({ a0x: -.5, a1x: -.1 }) });
  // ---- Potiphar: watches (39:3-4), puts him in charge, leaves; returns when his wife shows the cloak (39:16-19), furious (39:19)
  const aPo1 = act(pot, route(7.8, [-6.5, -1.0]).go(.5, [-6.0, -.45]).wait(15.0).go(.6, [-5.2, -.25]).go(.6, [-3.7, -.7]).go(.6, [-2.0, -.7]).keys, { sp: 6, show: W_(7.8, 21.8), face: (t, p) => p.mv ? null : toward(p.x, p.z, [-5.35, -1.05]), ex: t => mixA(aF(.35 * ON(t, 8.6, 9.2, 10.8, 11.4)), aO(.7 * ON(t, 11.8, 12.3, 12.8, 13.4)), aP(ON(t, 13.2, 13.8, 14.6, 15.0))) });
  const aPo2 = act(pot, route(40.2, [-2.3, -1.0]).go(.8, CGATE).go(.8, [-5.4, -.95]).wait(48.0).keys, { sp: 6, show: W_(40.2, 48.0), face: (t, p) => p.mv ? null : (t < 46.0 ? toward(p.x, p.z, [-6.0, -1.45]) : headZ(1, .3)), ex: t => mixA(aF(.3 * ON(t, 44.2, 44.6, 45.6, 45.9)), aO(.9 * ON(t, 44.8, 45.2, 45.9, 46.3)), aP(ON(t, 46.3, 46.7, 47.2, 47.5))) });
  // ---- Potiphar's wife: looks at Joseph (39:7), presses him day after day (39:10), catches his cloak (39:12), calls her servants (39:14), shows the cloak (39:16)
  const aWa = act(wife, route(14.8, [-6.5, -1.0]).go(.45, [-6.2, -1.55]).wait(19.4).go(.5, [-5.5, -1.0]).wait(25.4).go(.6, [-6.2, -1.5]).wait(29.6).go(.6, [-6.5, -1.0]).keys, { sp: 6, show: W_(14.8, 31.2), face: (t, p) => p.mv ? null : toward(p.x, p.z, [kp(t, aJ.keys).x, kp(t, aJ.keys).z]), ex: t => mixA(aF(.35 * ON(t, 15.8, 16.4, 18.8, 19.4)), aP(.55 * ON(t, 21.4, 21.9, 23.6, 24.2))) });
  const aWb = act(wife, route(32.3, [-6.58, -1.0]).go(.35, [-6.42, -1.0]).wait(35.2).keys, { sp: 6, show: W_(32.3, 35.2), face: fx(1, 0), ex: t => mixA(aP(ON(t, 33.0, 33.5, 34.8, 35.1))) });
  const aWc = act(wife, route(35.2, [-6.42, -1.0]).go(.45, [-6.1, -1.55]).wait(48.0).keys, { sp: 6, show: W_(35.2, 48.0), face: (t, p) => p.mv ? null : (t < 38.6 ? headZ(1, .35) : (t < 40.8 ? toward(p.x, p.z, [-5.6, -.7]) : (t < 44.4 ? headZ(1, .2) : toward(p.x, p.z, [-5.4, -.95])))), ex: t => mixA(aP(.7 * ON(t, 36.4, 36.9, 38.2, 38.7)), aF(.55 * ON(t, 41.0, 41.5, 44.0, 44.6))) });
  // ---- the household servants: at work in the courtyard, away while the house is empty (39:11), called back (39:14)
  const aS1a = act(sv1, route(0, [-4.4, -1.95]).wait(27.6).go(.6, CGATE).go(.8, [-1.8, -.9]).keys, { sp: 6, show: W_(0, 30.6), face: (t, p) => p.mv ? null : headZ(0, -1), ex: t => mixA(aF(.5)) });
  const aS2a = act(sv2, route(0, [-5.4, -2.15]).wait(28.2).go(.6, [-3.9, -.9]).go(.8, [-1.9, -1.0]).keys, { sp: 6, show: W_(0, 31.4), face: (t, p) => p.mv ? null : headZ(.2, 1), ex: t => mixA(aF(.5)) });
  const aS1b = act(sv1, route(37.2, [-3.9, -1.2]).go(.8, [-5.65, -1.35]).wait(48.0).keys, { sp: 6, show: W_(37.2, 47.4), face: (t, p) => p.mv ? null : toward(p.x, p.z, [-6.2, -1.5]), ex: t => mixA(aF(.4)) });
  const aS2b = act(sv2, route(37.4, [-3.9, -.8]).go(.8, [-5.55, -.65]).wait(48.0).keys, { sp: 6, show: W_(37.4, 47.4), face: (t, p) => p.mv ? null : toward(p.x, p.z, [-6.2, -1.5]), ex: t => mixA(aF(.4)) });
  // ---- Joseph is taken to the prison by two guards (39:20), at dusk; the guards then stand at the gate
  const aG1 = act(gu1, route(46.9, [-3.3, -1.55]).go(1.0, [-3.35, -2.6]).go(1.0, [-3.6, -3.45]).wait(61.9).keys, { sp: 6, show: W_(46.9, 61.9), face: (t, p) => p.mv ? null : headZ(0, 1) });
  const aG2 = act(gu2, route(46.9, [-2.8, -1.5]).go(1.0, [-2.85, -2.6]).go(1.0, [-3.0, -3.45]).wait(61.9).keys, { sp: 6, show: W_(46.9, 61.9), face: (t, p) => p.mv ? null : headZ(0, 1) });
  const aJp = act(joN, route(46.9, [-3.05, -1.55]).go(.95, [-3.1, -2.55]).go(.95, [-3.3, -3.5]).go(.8, [-3.3, -4.1]).go(.6, [-3.35, -4.6]).wait(61.9).keys, { sp: 6, show: W_(46.9, 61.9), face: (t, p) => p.mv ? null : (t < 55.2 ? headZ(.1, 1) : toward(p.x, p.z, [-2.8, -4.75])), ex: t => mixA(aF(.45 * ON(t, 51.4, 52.2, 56.2, 56.8)), aO(.5 * ON(t, 56.8, 57.4, 59.0, 59.8))) });
  // ---- the keeper of the prison and the prisoners (39:20-23)
  const aWd = still(wdn, [-2.8, -4.75], 48.0, 61.9, { face: (t, p) => toward(p.x, p.z, [-3.35, -4.6]), ex: t => mixA(aF(.4 * ON(t, 50.8, 51.4, 54.6, 55.2)), aP(.8 * ON(t, 55.8, 56.3, 57.6, 58.2))) });
  const PRP = [[-4.05, -4.4, 1], [-2.4, -4.2, 0], [-2.5, -5.45, 1], [-4.0, -5.4, 0]];
  PRP.forEach(([x, z, sit], i) => still(PRS[i], [x, z], 47.4, 61.9, { y: sit ? SIT : null, face: (t, q) => toward(q.x, q.z, [-3.35, -4.6]), ex: t => mixA({ lx: .02 }, aF(.35 * (i % 2))) }));
"""
NEW5 = r"""
  function update(t, camera, sid) {
    const cam = camera && camera.position, dawn = sid === 'birth' || sid === 'rise', tc = dawn ? 70 : t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    const night = dawn ? 0 : ON(t, 45.0, 50.0, 58.2, 58.8), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);
    { const k = .42 * (1 - night), cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]);
    { water.material.color.setRGB(lerp(.36, .12, night), lerp(.48, .18, night), lerp(.62, .34, night)); water.material.emissive.setRGB(lerp(.18, .05, night), lerp(.25, .08, night), lerp(.31, .16, night));
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = (.6 - .3 * night) * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    // ---- the town on the east bank stands the whole time as a distant city; its torches and windows light at dusk (cinematic interpretation)
    { townG.visible = true; const tk = smooth(43.6, 45.6, t) * (1 - smooth(57.0, 58.6, t));
      torchL.forEach((l, i) => { l.intensity = 0; }); torchG.forEach(([s, s2], i) => { s.material.opacity = .85 * tk * (fl + .04 * i); s2.material.opacity = .9 * tk * fl; });
      gateL.intensity = 0; gateG.material.opacity = 0; gateG.visible = false;
      WINS.forEach(w => { const o = smooth(44.0 + 3 * w.ord, 45.0 + 3 * w.ord, t) * (1 - smooth(57.0, 58.6, t)); w.s.material.opacity = .85 * o * (.88 + .12 * Math.sin(t * 2.3 + w.ph)); w.s.visible = o > .01; });
      campL.intensity = 0; }
    FIRES.forEach(f => { f.s.visible = f.s2.visible = false; });
    // ---- the prison: two torches at the gate and a warm light on the yard from dusk to the end of the night
    { const pk_ = smooth(46.8, 49.0, t) * (1 - smooth(58.0, 59.2, t)) * (dawn ? 0 : 1);
      ptG.forEach(([s, s2], i) => { s.material.opacity = .85 * pk_ * (fl + .05 * i); s2.material.opacity = .9 * pk_ * fl; s.visible = s2.visible = pk_ > .01; });
      ptL.forEach((l, i) => { l.intensity = 1.7 * pk_ * (fl + .05 * i); }); prL.intensity = .8 * smooth(50.0, 51.4, t) * (1 - smooth(58.0, 59.2, t)) * (dawn ? 0 : 1) * fl; }
    // ---- the actors: every one is a pure function of time
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return; const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    // ---- the jar Joseph carries (until he sets it down by the step), the cloak in her hand (35.2-47.4), the keys (keeper's hand, then Joseph's)
    { const carry = t < 8.4; JARP.visible = t < 29.0; if (carry) { const a = heldAt(aJ, .16, 0, .17, t); JARP.position.set(a[0], a[1], a[2]); JARP.rotation.y = a[3]; } else { JARP.position.set(-6.05, hC(-6.05, -1.55) + .06, -1.55); JARP.rotation.y = .4; } }
    { const on = t >= 35.2 && t < 47.4; CLOAK.visible = on; if (on) { const k = smooth(40.9, 41.6, t) * (1 - smooth(43.8, 44.4, t)), a = heldAt(aWc, .14 + .03 * k, .1, .2 + .12 * k, t); CLOAK.position.set(a[0], a[1], a[2]); CLOAK.rotation.set(0, a[3], .0); } }
    { const kw = t >= 50.4 && t < 56.4, kj = t >= 56.4 && t < 61.9; KEYS.visible = kw || kj; if (kw) { const a = heldAt(aWd, .13, .08, .21, t); KEYS.position.set(a[0], a[1], a[2]); KEYS.rotation.y = a[3]; } else if (kj) { const a = heldAt(aJp, .13, .06, .19, t); KEYS.position.set(a[0], a[1], a[2]); KEYS.rotation.y = a[3]; } }
    { const k = kp(t, aJp.keys); dust.update(t, 0, [0, 0, 0]); dustR.update(t, .35 * ON(t, 46.9, 47.6, 50.0, 50.6), [k.x, hC(k.x, k.z) + .05, k.z]); }
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const light = [
    Dk(0, ...GOLD), Dk(26.0, ...GOLD), Dk(27.0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.7, [2, 3.4, 8], .5, '#ffcf9a', FD, 14), Dk(28.0, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [-9, 3.0, -4], .5, '#ffcf9a', FD, 14),
    Dk(29.2, ...GOLD), Dk(38, '#bca8b8', '#6a4a3c', 1.0, '#ffbc78', 2.7, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(41.5, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [-10, 2.0, -4], .5, '#ffbc88', FD, 14),
    Dk(44.4, '#a89ab8', '#5a4448', .95, '#ff9458', 2.2, [-10, 1.5, -4], .5, '#ffb480', FD, 14), Dk(47.4, '#7a7aa8', '#3a3248', .95, '#c88ca8', 1.8, [-10, 1.2, -4], .56, '#9a98d0', FD, 14),
    Dk(50.0, '#6a72a8', '#322c44', .95, '#9aa8f0', 1.6, [-9, 5.0, -3], .62, '#7a8cd0', FD, 14), Dk(59, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(62, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [14, ['#5a86c4', '#f6d09a']], [27, ['#5a86c4', '#f6c890']], [40, ['#5a74b0', '#f4a070']], [44, ['#4a5a9a', '#f0905a']], [46.5, ['#2a3270', '#c87a60']], [49, ['#0e1636', '#2a3466']], [60, ['#0e1636', '#2a3466']], [70, ['#6a8ec8', '#f8d4a0']], [99, ['#6a8ec8', '#f8d4a0']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL], state };
}
"""
src = open(S + 'src/_world39_part1.js').read() + '\n'.join((NEW4).split('\n')) + NEW5
open(S + 'src/world39.js', 'w').write(src)
print('world39.js', len(src))
