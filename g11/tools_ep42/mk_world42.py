#!/usr/bin/env python3
# Derives g11/src/world42.js (Genesis 42, the brothers in Egypt) from world41.js: the island, terrain, river, town, house, courtyard and prison yard are reused (the people, props and update are new); a new corner of the island holds Jacob's camp in Canaan (dry ground, three tents, dead trees); the sky/cloud colour tables are re-keyed.
S = '/home/claude/g11/'
src = open(S + 'src/world41.js').read()
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

MARK = "  // ---- the people. Joseph keeps the face and body of Genesis 37, 39 and 40"
i = src.index(MARK)
head = src[:i]
L = head.split('\n')
HDR = [
"// Episode 42: Genesis 42 (NRSV-CE). The famine is in Canaan; Jacob sends ten of his sons to Egypt for grain and keeps Benjamin at home (42:1-5); the brothers bow to Joseph, governor of the land; he knows them and they do not know him (42:6-8); 'you are spies', and their answer: twelve brothers, the youngest at home, and one is no more (42:9-14 in part); three days in custody, then 'I fear God': let one stay and bring your youngest brother (42:17-20);",
"// the brothers say to one another that this is punishment for what they did to Joseph, whose anguish they saw and did not heed (42:21); Joseph understands, turns away and weeps (42:23-24); he has Simeon bound before their eyes (42:24); he orders their silver put back in their sacks (42:25); on the way they find it and their hearts sink: what has God done to us? (42:27-28, 42:35); at home Jacob says: Joseph is gone, Simeon is gone, and now you would take Benjamin; my son will not go down with you (42:36, 42:38).",
"// Cinematic interpretation: the dry camp and its dead trees, the tents, who stands where, the road and the ford, the hall of the house with its seat, the prison yard, the servant at the sacks, the spilled silver, the light (bleached noon, morning, a cooler yard, gold, haze). Joseph is shown in fine linen with the gold chain of Genesis 41.",
]
assert L[3].startswith("import * as THREE"), L[:5]
head = '\n'.join(HDR + L[3:])
head = rep(head, "const CLOUD = [[0, '#f0d4a8'], [50, '#f0d4a8'], [52, '#e8c8a0'], [56, '#e8c8a0'], [57.5, '#d8c4a8'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];",
            "const CLOUD = [[0, '#ece0c8'], [10, '#ece0c8'], [11.5, '#f0d4a8'], [51, '#f0d4a8'], [53, '#ecdcc0'], [58, '#e8d0ac'], [90, '#d8c4a8'], [110, '#e8b8c8'], [130, '#d8c4a8']];")
head = rep(head, "const CEM = [[0, '#6a5848'], [56, '#6a5848'], [57.5, '#6a5c4a'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];",
            "const CEM = [[0, '#6a5c4c'], [90, '#6a5c4a'], [110, '#7a5668'], [130, '#6a5c4a']];")
# a new camp in the north-east: flat ground, a dry look
head = rep(head, "const FLATS = [", "export const CAN = [3.6, -6.0];                                                           // Jacob's camp in Canaan (Genesis 42): dry ground north of the road, east of the river\nconst FLATS = [")
head = rep(head, "[JC[0], JC[1], .31, 2.4]];", "[JC[0], JC[1], .31, 2.4], [CAN[0], CAN[1], .31, 2.9]];")
head = rep(head, "  b.lerp(C3('#e8d6aa'), .7 * smooth(.8, .3, dPath(x, z)));", "  b.lerp(C3('#e8d6aa'), .7 * smooth(.8, .3, dPath(x, z)));\n  b.lerp(C3('#c8a670'), .8 * smooth(3.4, 1.1, Math.hypot(x - CAN[0], z - CAN[1])));")

NEW3 = r"""  // ---- the people. Joseph keeps the face and body of Genesis 37 to 41 (seed 930), now in fine linen with the gold chain (41:42). Jacob is the Jacob of Genesis 33 to 37 (seed 720). The ten brothers (seeds 1100 to 1109), Benjamin (1110) and the servant are new, unnamed on screen except Simeon, the fourth of the ten
  const jac = mkJacob(rng(720));
  const ben = person(rng(1110), { pants: '#d9ccb0', top: '#4f9a8a', skin: '#c58c60', hair: '#2a1a10', sash: '#c8884a', seed: 1110 }, .38);
  const joL = person(rng(930), { pants: '#efe6d0', top: '#f4ecd8', skin: '#c58c60', hair: '#2a1a10', sash: '#d8b048', seed: 930 }, .44);
  const BRC = [['#8a4a3a', '#d8ccb0', '#b98a62', '#2a1a10', '#efe6d0', 1100, .47], ['#4a6a8a', '#d4c8a8', '#a8714a', '#3a2a1a', null, 1101, .46], ['#6a7a4a', '#d8ccb0', '#c58c60', null, '#e0d4b8', 1102, .45], ['#7a5a2a', '#cfc2a0', '#a8714a', '#3a2a1a', null, 1103, .46],
    ['#8a6a8a', '#d8c8a8', '#b98a62', null, '#efe6d0', 1104, .44], ['#a8704a', '#d0c4a4', '#c58c60', '#2a1a10', null, 1105, .46], ['#5a6a8a', '#d8ccb0', '#9a6a44', null, '#d8ccb0', 1106, .45], ['#9a5a4a', '#e0d4b8', '#b98a62', '#3a2a1a', null, 1107, .46],
    ['#6a8a7a', '#d4c8a8', '#a8714a', null, '#efe6d0', 1108, .44], ['#8a7a4a', '#d8ccb0', '#c58c60', '#2a1a10', '#e0d4b8', 1109, .45]];
  const br = BRC.map(([top, pants, skin, beard, cloth, seed, sc]) => person(rng(seed), { pants, top, skin, hair: '#2a1a10', beard, cloth, sash: '#6a4a2a', seed }, sc));
  const SIM = 3;
  const gu1 = person(rng(952), { pants: '#d8ccb0', top: '#7a5a3a', skin: '#a8714a', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 952 }, .47);
  const gu2 = person(rng(953), { pants: '#d8ccb0', top: '#6a5a4a', skin: '#9a6a44', hair: '#2a1a10', cloth: '#d8c9a8', sash: '#3a2a1a', seed: 953 }, .47);
  [gu1, gu2].forEach(o => o.group.add(mkSpear()));
  const sv = person(rng(950), { pants: '#e8dcc0', top: '#e8dcc0', skin: '#a8714a', hair: '#2a1a10', sash: '#8a6a3a', seed: 950 }, .42);
  const dnk = [0, 1, 2, 3, 4].map(i => { const s = makeDonkey(rng(810 + i)); s.group.scale.setScalar(.55);
    { const b = new GB(rng(830 + i)); for (const sz of [-1, 1]) { b.add(G.ico0, '#d8c9a0', [-.02, .76, sz * .16], [.1, .12, .08], [0, 0, 0], .004); b.box('#a8946a', [-.02, .87, sz * .16], [.05, .02, .05], [0, 0, 0], .002); } s.group.add(new THREE.Mesh(b.build(), lam)); }
    g.add(s.group); return s; });
  const ALLP = [jac, ben, joL, ...br, gu1, gu2, sv]; ALLP.forEach(o => g.add(o.group));
  // ---- Joseph's gold chain (41:42) rides on the linen figure; the cords that bind Simeon (42:24) ride on Simeon
  { const b = new GB(rng(791)), N = 20; for (let k = 0; k < N; k++) { const a = k / N * TAU, s = Math.sin(a), fr = s > 0 ? s * s : 0; b.box(k % 2 ? '#e8c040' : '#d8aa30', [Math.cos(a) * .17, .925 - .17 * fr, s * .17], [.038, .03, .038], [0, -a, 0], .003); }
    b.box('#f2ce50', [0, .735, .175], [.05, .06, .02], [0, 0, 0], .002); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; joL.group.add(m); }
  const ropeG = new THREE.Group(); { const b = new GB(rng(793)); for (const [y, r] of [[.9, .19], [.8, .19], [.7, .18]]) for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; b.box('#7a5a32', [Math.cos(a) * r, y, Math.sin(a) * r * .8], [.055, .035, .055], [0, -a, 0], .003); }
    b.box('#7a5a32', [0, .66, .2], [.2, .035, .06], [0, 0, 0], .003); b.box('#6a4a28', [0, .56, .22], [.035, .16, .035], [0, 0, 0], .003); ropeG.add(new THREE.Mesh(b.build(), lam)); ropeG.visible = false; br[SIM].group.add(ropeG); }
  // ---- props: sack stacks at the court, the silver
  const sackB = (b, x, y, z, ry = 0) => { b.add(G.ico0, '#d8c9a0', [x, y + .045, z], [.06, .05, .09], [0, ry, 0], .004); b.box('#a8946a', [x, y + .1, z], [.03, .02, .03], [0, ry, 0], .002); };
  const sackStack = (b, x, z, ry = 0) => { const y = hC(x, z); for (const [dx, dz] of [[-.07, -.1], [.07, -.1], [-.07, .1], [.07, .1], [0, 0]]) sackB(b, x + dx, y, z + dz, ry); for (const [dx, dz] of [[0, -.1], [0, .1]]) sackB(b, x + dx, y + .08, z + dz, ry); sackB(b, x, y + .16, z, ry); };
  const sackCourt = new THREE.Group(); { const b = new GB(rng(792)); sackStack(b, -4.85, -1.35); sackStack(b, -5.0, -1.05, .4); sackB(b, -4.7, hC(-4.7, -1.2), -1.2, .8); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; sackCourt.add(m); g.add(sackCourt); }
  const mkSackSilver = (spill, sd) => { const gr = new THREE.Group(), b = new GB(rng(sd)), rr = rng(sd + 1), tilt = spill ? .55 : 0;
    b.add(G.ico0, '#d8c9a0', [0, .075, 0], [.13, .1, .17], [0, 0, tilt], .004); b.box('#b89c68', [spill ? .06 : 0, .15, 0], [.11, .02, .11], [0, 0, tilt], .002);
    const n = spill ? 30 : 16;
    for (let k = 0; k < n; k++) { const a = rr() * TAU, d = spill ? .06 + rr() * .34 : rr() * .06, x = Math.cos(a) * d + (spill ? .16 : 0), z = Math.sin(a) * d, y = spill ? .012 + rr() * .02 : .15 + rr() * .035;
      b.add(G.cyl6, pk(rr, ['#eef0f6', '#d8dce6', '#f6f7fb']), [x, y, z], [.028, .007, .028], [rr() * .6, rr() * 3, rr() * .6], .002); }
    gr.add(new THREE.Mesh(b.build(), lam)); gr.visible = false; g.add(gr); return gr; };
  const silverIn = mkSackSilver(false, 840), silverSp = mkSackSilver(true, 850);
  const SACKP = [-4.5, -.7], SPILLP = [1.62, 1.1];
  const glint = spriteGlow(0, 0, 0, .3, 0xffffff, 0); g.add(glint);
  // ---- Canaan: three tents on a dry rise, dead trees, dry scrub (Genesis 42:1-5, 42:29-38)
  const CT = [[3.6, -6.8, .95, '#cdb48c', 0], [2.1, -6.45, .8, '#c2a67a', .35], [5.1, -6.6, .8, '#d4c29c', -.3]];
  CT.forEach(([x, z, s, c, ry], i) => { const m = tentMesh(rng(1200 + i), c, s); m.position.set(x, hC(x, z) - .02, z); m.rotation.y = ry; m.castShadow = true; ca.add(m); });
  for (let k = occ.length - 1; k >= 0; k--) { const p = occ[k].m.position; if (Math.hypot(p.x - CAN[0], p.z - CAN[1]) < 3.4) { ca.remove(occ[k].m); occ.splice(k, 1); } }
  const deadTree = (x, z, s, sd) => { const rr = rng(sd), b = new GB(rr); let cx = 0; const n = 6;
    for (let k = 0; k < n; k++) { cx = .05 * s * Math.sin(k * 1.3); b.box(k % 2 ? '#6a5844' : '#5e4c3a', [cx, (k + .5) * .17 * s, 0], [.075 * s * (1 - .4 * k / n), .18 * s, .075 * s * (1 - .4 * k / n)], [0, 0, 0], .01); }
    const top = n * .17 * s;
    for (let k = 0; k < 6; k++) { const an = k * TAU / 6 + rr() * .5, len = (.38 + .22 * rr()) * s, tl = .5 + .5 * rr(), y0 = top * (.55 + .4 * rr());
      b.box('#54422f', [cx + Math.cos(an) * Math.cos(tl) * len / 2, y0 + Math.sin(tl) * len / 2, Math.sin(an) * Math.cos(tl) * len / 2], [len, .03 * s, .03 * s], [0, -an, tl], .006);
      b.box('#54422f', [cx + Math.cos(an) * Math.cos(tl) * len * .9, y0 + Math.sin(tl) * len * .95, Math.sin(an) * Math.cos(tl) * len * .9], [len * .45, .02 * s, .02 * s], [0, -an + .6, tl + .5], .005); }
    const m = new THREE.Mesh(b.build(), lam); m.position.set(x, hC(x, z) - .02, z); m.castShadow = true; m.rotation.y = rr() * 6; ca.add(m); occ.push({ m, s: .9 * s }); return m; };
  [[2.1, -5.0, 1.5, 1210], [5.9, -5.1, 1.7, 1211], [2.8, -8.0, 1.3, 1212], [4.6, -8.2, 1.6, 1213], [1.9, -7.6, 1.2, 1214]].forEach(([x, z, s, sd]) => deadTree(x, z, s, sd));
  { const b = new GB(rng(1220)), rr = rng(1221); for (let k = 0; k < 70; k++) { const a = rr() * TAU, d = 1.2 + rr() * 3.8, x = CAN[0] + Math.cos(a) * d, z = CAN[1] + Math.sin(a) * d * .9; if (hC(x, z) < .15) continue; const h = .07 + rr() * .11;
      b.add(G.cone5, pk(rr, ['#b8a478', '#a89466', '#c4b088', '#9a8a60']), [x, hC(x, z) + h * .5, z], [.03, h, .03], [(rr() - .5) * .3, 0, (rr() - .5) * .3], .02); }
    for (let k = 0; k < 16; k++) { const a = rr() * TAU, d = .8 + rr() * 3.4, x = CAN[0] + Math.cos(a) * d, z = CAN[1] + Math.sin(a) * d; if (hC(x, z) < .15) continue; b.add(G.ico0, pk(rr, ['#9a8e7c', '#a99c86', '#85796a']), [x, hC(x, z), z], [.1 + rr() * .16, .07 + rr() * .1, .1 + rr() * .16], [rr() * 3, rr() * 3, 0], .05); }
    b.add(G.cylT, '#b87a4a', [2.85, hC(2.85, -7.5), -7.5], [.07, .15, .07], [0, 0, 0], .01); b.add(G.cylT, '#a8683c', [4.3, hC(4.3, -7.5), -7.5], [.06, .13, .06], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.receiveShadow = true; ca.add(m); }
"""

NEW4 = r"""
  let SID = '';
  const headingOf = (a, tt) => { const p = kp(tt, a.keys), fo = a.face ? a.face(tt, p) : null; return fo != null ? fo : (p.mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, tt)); };
  const SH = (...w) => t => w.some(([a, b]) => t >= a && t < b);
  const still = (f, p, a, b, o = {}) => act(f, [[0, p[0], p[1], 'L']], { show: Array.isArray(a) ? SH(...a) : W_(a, b), ...o });
  const roadZ = x => { for (let i = 0; i < PATH.length - 1; i++) { const a = PATH[i], b = PATH[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return x < PATH[0][0] ? PATH[0][1] : PATH[PATH.length - 1][1]; };
  const TH = [-6.02, -.6], JAC = [3.6, -5.6], BEN = [3.15, -5.5];
  const bow = (t, a, b, c, d, k = 1.0) => k * ON(t, a, b, c, d);
  // ---- Jacob and Benjamin at the camp: sending the ten (42:1-4), keeping Benjamin (42:4), and at the end the refusal (42:36, 42:38)
  const CAMPW = [[0, 8.6], [52.6, 61.7]];
  still(jac, JAC, CAMPW, 0, { face: () => 0, ex: t => mixA(aP(.9 * ON(t, 3.4, 3.9, 4.9, 5.4)), { lx: .05 * ON(t, 6.0, 6.6, 8.0, 8.5) }, aO(.55 * ON(t, 53.4, 54.0, 55.6, 56.2)), aP(.8 * ON(t, 56.7, 57.2, 58.0, 58.5)), aO(.6 * ON(t, 58.7, 59.1, 59.7, 60.1))) });
  still(ben, BEN, CAMPW, 0, { face: t => t < 9 ? -.75 : 1.7, ex: t => mixA(aF(.4 * ON(t, 56.4, 57.0, 60.0, 60.6))) });
  // sons in the camp (a line before Jacob, then they leave), and at the end (the nine, without Simeon)
  const ARC = [[2.75, -4.6], [3.15, -4.6], [3.55, -4.55], [3.95, -4.6], [4.35, -4.6], [2.95, -4.15], [3.35, -4.15], [3.75, -4.1], [4.15, -4.15], [4.55, -4.15]];
  const ARC2 = [[2.45, -4.65], [2.9, -4.6], [3.35, -4.65], null, [4.1, -4.65], [4.55, -4.6], [2.7, -4.2], [3.15, -4.2], [4.0, -4.2], [4.45, -4.15]];
  br.forEach((f, i) => { const p = ARC[i], r = route(0, p).wait(5.0).go(.5, [p[0] - .4, p[1] + 1.7]).wait(8.6);
    act(f, r.keys, { sp: 6, show: W_(0, 8.6), face: (t, q) => q.mv ? null : toward(q.x, q.z, JAC), ex: t => mixA(aF(.25 * ON(t, 3.0, 3.5, 4.8, 5.2)), { lx: .1 * ON(t, 3.4, 3.8, 4.8, 5.1) }) });
    const q = ARC2[i]; if (q) still(f, q, 52.6, 61.7, { face: () => toward(q[0], q[1], JAC), ex: t => mixA(aF(.3), { lx: .1 * ON(t, 53.0, 53.6, 56.0, 56.6) + .06 * ON(t, 57, 57.5, 59.5, 60.5) }) }); });
  // ---- the caravan on the road, west towards the ford (42:3)
  const DKR = [];
  br.forEach((f, i) => { const x0 = 1.55 + .3 * i, off = i % 2 ? -.12 : -.02, r = route(8.6, [x0, roadZ(x0) + off]).go(.55, [x0 - 1.1, roadZ(x0 - 1.1) + off]).wait(10.8); act(f, r.keys, { sp: 6, show: W_(8.6, 10.8), ex: () => mixA(aF(.15)) }); });
  [0, 1, 2, 3, 4].forEach(k => { const p = [2.9 + .5 * k, -3.3 - .2 * (k % 2)], r = route(0, p).wait(5.2).go(.5, [p[0] - .3, p[1] + 1.5]).wait(8.6); DKR.push({ d: dnk[k], keys: r.keys, show: W_(0, 8.6) }); });
  [0, 1, 2, 3, 4].forEach(k => { const x0 = 1.8 + .6 * k, off = .13, r = route(8.6, [x0, roadZ(x0) + off]).go(.55, [x0 - 1.1, roadZ(x0 - 1.1) + off]).wait(10.8); DKR.push({ d: dnk[k], keys: r.keys, show: W_(8.6, 10.8) }); });
  // ---- the hall (the portico of the house): Joseph stands on his seat; the brothers bow (42:6), rise and answer (42:10-14), are put in custody (42:17), speak among themselves (42:21), Simeon is bound (42:24)
  const HZ = [-1.25, -.95, -.65, -.35, -.05], HP = br.map((f, i) => [i < 5 ? -5.05 : -4.6, HZ[i % 5] + (i < 5 ? 0 : .12)]);
  const HALL1 = [10.8, 22.0], HALL2 = [24.6, 45.0];
  still(joL, TH, [HALL1, HALL2], 0, { y: () => .06, face: t => Math.PI / 2 - (Math.PI / 2 + .5) * smooth(39.2, 40.0, t) + (Math.PI / 2 + .5) * smooth(41.9, 42.5, t), ex: t => mixA(aF(.35), aP(.85 * ON(t, 15.3, 15.8, 16.4, 16.9)), aO(.5 * ON(t, 24.8, 25.3, 26.0, 26.5)), aP(.7 * ON(t, 26.7, 27.2, 27.8, 28.3)),
    { a0x: -2.3 * ON(t, 39.7, 40.3, 41.5, 42.0), a0z: .25 * ON(t, 39.7, 40.3, 41.5, 42.0) }, { lx: .08 * ON(t, 39.8, 40.4, 41.4, 42.0) }, aO(.4 * ON(t, 42.6, 43.1, 44.0, 44.5))) });
  br.forEach((f, i) => { const p = HP[i];
    still(f, p, [HALL1, HALL2], 0, { face: t => (t > 30.1 && t < 36.8 && i < 2) ? toward(p[0], p[1], HP[1 - i]) : (t > 36.6 && t < 37.8 && i === 2) ? toward(p[0], p[1], HP[3]) : -Math.PI / 2,
      y: t => -.1 * bow(t, 10.9, 11.6, 16.0, 16.7),
      ex: t => mixA({ lx: 1.1 * bow(t, 10.9, 11.6, 16.0, 16.7) }, aO(.45 * ON(t, 17.2, 17.6, 19.6, 20.2)), aF(.25 * ON(t, 20.4, 20.8, 21.8, 22.2)), aO(.3 * ON(t, 28.8, 29.2, 29.8, 30.2)),
        i < 2 ? { lx: .14 * ON(t, 30.4, 31.0, 36.0, 36.6) } : (i === 4 ? { lx: .3 * ON(t, 34.2, 34.8, 36.4, 36.9) } : {}), (i === SIM) ? { a0x: -1.0 * ON(t, 43.4, 43.8, 45, 45.1), a1x: -1.0 * ON(t, 43.4, 43.8, 45, 45.1), a0z: .3 * ON(t, 43.4, 43.8, 45, 45.1), a1z: -.3 * ON(t, 43.4, 43.8, 45, 45.1) } : {}) }); });
  // the guards bind Simeon (42:24)
  act(gu1, route(41.0, [-3.6, -1.5]).go(.55, [-4.7, -.9]).wait(45.0).keys, { sp: 7, show: W_(41.0, 45.0), face: (t, p) => p.mv ? null : -Math.PI / 2 });
  act(gu2, route(41.0, [-3.6, .2]).go(.55, [-4.7, -.15]).wait(45.0).keys, { sp: 7, show: W_(41.0, 45.0), face: (t, p) => p.mv ? null : -Math.PI / 2 });
  // ---- the custody (42:17): the ten stand together in the prison yard, heads low, a guard at each side of the gate
  const CELLP = [[-3.95, -4.65], [-3.6, -4.65], [-3.25, -4.65], [-2.9, -4.65], [-3.95, -4.3], [-3.6, -4.3], [-3.25, -4.3], [-2.9, -4.3], [-3.75, -3.98], [-3.15, -3.98]];
  br.forEach((f, i) => { const p = CELLP[i]; still(f, p, 22.0, 24.6, { face: () => [.4, -.5, 1.2, 2.4, -1.0, .8, -2.2, 1.9, 3.0, -.3][i], ex: t => mixA({ lx: .22 }, i % 3 === 0 ? aF(.5) : {}) }); });
  still(gu1, [-3.57, -3.45], 22.0, 24.6, { face: () => 0 }); still(gu2, [-3.03, -3.45], 22.0, 24.6, { face: () => 0 });
  // ---- the silver is put back in the sacks (42:25): the servant at the court sacks, two donkeys loaded
  still(sv, [-4.1, -.7], 45.0, 48.6, { face: () => -Math.PI / 2, ex: t => mixA({ lx: .75 * ON(t, 45.6, 46.1, 47.2, 47.8), a0x: -1.25 * ON(t, 45.6, 46.1, 47.2, 47.8), a1x: -1.1 * ON(t, 45.6, 46.1, 47.2, 47.8) }) });
  DKR.push({ d: dnk[0], keys: [[0, -3.15, -1.05, 'L']], show: W_(45.0, 48.6), face: -1.4 }); DKR.push({ d: dnk[1], keys: [[0, -3.0, -.2, 'L']], show: W_(45.0, 48.6), face: -1.7 });
  // ---- the road: the silver is found (42:27-28, 42:35); the others wait on the road with the donkeys
  const FIND = { 0: [1.95, 1.2], 4: [1.45, 1.45], 5: [2.2, .75], 1: [2.9, .9], 2: [3.25, 1.05], 6: [3.6, .85], 7: [3.95, .75], 8: [4.3, .55], 9: [4.65, .4] };
  Object.entries(FIND).forEach(([k, p]) => { const i = +k; still(br[i], p, 48.6, 52.6, { face: () => (i === 0 ? -2.0 : i === 4 ? -.7 : -Math.PI / 2 + .5 * Math.sin(i)), ex: t => mixA(i === 0 ? { lx: .7 * ON(t, 48.9, 49.4, 51.0, 51.6), a0x: -1.1 * ON(t, 48.9, 49.4, 51.0, 51.6), a1x: -1.1 * ON(t, 48.9, 49.4, 51.0, 51.6) } : aO(.5 * ON(t, 49.8, 50.4, 51.6, 52.2)), { lx: .12 * ON(t, 49.6, 50.2, 52.0, 52.5) * (i === 0 ? 0 : 1) }) }); });
  DKR.push({ d: dnk[2], keys: [[0, 1.3, .9, 'L']], show: W_(48.6, 52.6), face: -1.6 }); DKR.push({ d: dnk[3], keys: [[0, 2.6, .85, 'L']], show: W_(48.6, 52.6), face: -1.5 }); DKR.push({ d: dnk[4], keys: [[0, 3.1, 1.3, 'L']], show: W_(48.6, 52.6), face: -1.7 });
"""

NEW5 = r"""
  function update(t, camera, sid) {
    SID = sid;
    const cam = camera && camera.position, tc = t;
    if (camera && camera.userData && camera.userData.T) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      for (const o of occ) { const p = o.m.position, px = p.x - C.x, py = p.y + o.s * .5 - C.y, pz = p.z - C.z, u = (px * vx + py * vy + pz * vz) / l2; let hide = false;
        if (u > 0 && u < .96) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; hide = Math.hypot(dx, dy, dz) < .45 * o.s + .25 + .38 * hw * u; }
        const dc = Math.hypot(px, py, pz), nk = smooth(3.4 + o.s * 1.2, 5.6 + o.s * 1.8, dc); o.m.scale.setScalar(Math.max(.001, nk)); o.m.visible = !hide && nk > .02; } }
    sea.mat.color.set(colAt(CLOUD, tc)); sea.mat.emissive.set(colAt(CEM, tc)); sea.update(t, cam, 22);
    { const bc = bgAtW(tc), hz = new THREE.Color(css(bc)).lerp(FARC, .5), M = far.userData.mat; M.color.setRGB(hz.r / .026, hz.g / .036, hz.b / .085); }
    { const k = .42, cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, cz = cam ? cam.z : 0;
      if (cam) { camera.getWorldDirection(v3); const hl = Math.hypot(v3.x, v3.z) || 1; sunS.position.set(cx + v3.x / hl * 150, cy + 7, cz + v3.z / hl * 150); }
      sunS2.position.copy(sunS.position); sunS.scale.setScalar(80); sunS2.scale.setScalar(26); sunS.material.opacity = .34 * k; sunS2.material.opacity = .5 * k; sunS.visible = sunS2.visible = k > .01; }
    motes.update(t, .5, [1, .5, 2.5]);
    { water.material.color.setRGB(.36, .48, .62); water.material.emissive.setRGB(.18, .25, .31);
      RIP.forEach(m => { const u = m.userData, z = ((u.z0 + t * u.sp) % 20.8) - 10.4; m.position.set(RV(z) + u.o, WL + .006, z); m.scale.x = u.w / .34; m.material.opacity = .6 * smooth(-9.4, -8, z) * smooth(9.4, 8, z); }); }
    townG.visible = true;
    // the prison yard: its near walls are open to the camera in the custody shot
    pWalls.S.visible = sid !== 'cell'; pWalls.E.visible = sid !== 'cell'; pBeam.visible = sid !== 'cell';
    // ---- the actors: every one is a pure function of time (and of the shot)
    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });
    ACT.forEach(a => { if (!a.show(t)) return;
      const f = a.f, p = kp(t, a.keys), mv = p.mv, fo = a.face ? a.face(t, p) : null, ry = fo != null ? fo : (mv ? headZ(p.vx, p.vz) : hdgAt(a.keys, t));
      f.group.visible = true; const ex = a.ex ? a.ex(t) : {}; fig(f, p.x, p.z, ry, mv, t, a.ph, { ...ex, s: ex.s ?? (1 + .006 * Math.sin(t * 1.4 + a.ph)) }, a.sp, a.y ? a.y(t) : 0); });
    { const ONLY = { whisper: [0, 1], anguish: [3, 4] }[sid]; if (ONLY) br.forEach((f, i) => { if (!ONLY.includes(i)) f.group.visible = false; }); }
    // keep the hall close-ups clear: a brother or guard standing between the camera and the subject is not drawn
    if (camera && camera.userData && camera.userData.T && ['knew', 'spies', 'fear', 'wept', 'bound', 'whisper', 'anguish', 'cell'].includes(sid)) { const C = camera.position, Tt = camera.userData.T, vx = Tt[0] - C.x, vy = Tt[1] - C.y, vz = Tt[2] - C.z, l2 = vx * vx + vy * vy + vz * vz, hw = (camera.userData.W || 4) / 2;
      [...br, gu1, gu2].forEach(f => { if (!f.group.visible) return; const q = f.group.position, px = q.x - C.x, py = q.y + .25 - C.y, pz = q.z - C.z, u = (px * vx + py * vy + pz * vz) / l2;
        if (u > 0 && u < .98) { const dx = px - u * vx, dy = py - u * vy, dz = pz - u * vz; if (Math.hypot(dx, dy, dz) < .15 + 1.3 * hw * u) f.group.visible = false; } }); }
    // ---- the donkeys
    dnk.forEach(d => { d.group.visible = false; });
    DKR.forEach(w => { if (!w.show(t)) return; const d = w.d, p = kp(t, w.keys); d.group.visible = true; d.group.position.set(p.x, gAt(p.x, p.z) - .02, p.z); d.group.rotation.y = (w.face != null ? w.face : hdgAt(w.keys, t)) - Math.PI / 2; walkLegs(d.legs, t + w.keys.length, 7, p.mv ? .4 : 0); });
    // ---- Simeon's cords (42:24); the silver (42:25, 42:27)
    ropeG.visible = t >= 43.4 && t < 45.0; sackCourt.visible = sid === 'silverput';
    { const on = sid === 'silverput', k = smooth(46.4, 47.1, t); silverIn.visible = on; silverIn.position.set(SACKP[0], gAt(SACKP[0], SACKP[1]), SACKP[1]); silverIn.scale.setScalar(Math.max(.01, k > .01 ? 1 : .01)); silverIn.children[0].visible = true; }
    { const on = sid === 'silverfind'; silverSp.visible = on; silverSp.position.set(SPILLP[0], gAt(SPILLP[0], SPILLP[1]), SPILLP[1]); silverSp.rotation.y = -2.2; silverSp.scale.setScalar(.6 + .4 * smooth(48.9, 49.6, t)); }
    { const on = sid === 'silverput' || sid === 'silverfind', P = sid === 'silverfind' ? SPILLP : SACKP; glint.visible = on; if (on) { glint.position.set(P[0] + (sid === 'silverfind' ? .1 : 0), gAt(P[0], P[1]) + (sid === 'silverfind' ? .05 : .17), P[1]); glint.material.opacity = (sid === 'silverfind' ? .5 * smooth(49.0, 49.6, t) : .5 * smooth(46.4, 47.1, t)) * (.7 + .3 * Math.sin(t * 9)); } }
    dust.update(t, (t < 9 || t > 52.6) ? .9 : .15, [t < 9 || t > 52.6 ? 7 : 0, .3, t < 9 || t > 52.6 ? -5 : 0]); dustR.update(t, t < 9 ? .5 : 0, [8, .3, -5]);
    state.t = t;
  }

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const DRY = ['#d4c8b8', '#6a5c4c', 1.0, '#ffe2b4', 2.6, [9, 3.8, -5], .5, '#fff0d0', FD, 14];
  const MORN = ['#c0b8c0', '#6a5448', .98, '#ffd8a0', 2.5, [9, 3.4, -5], .5, '#ffcf9a', FD, 14];
  const COOL = ['#b0b8cc', '#5a5048', .95, '#ffe0b8', 1.9, [7, 3.2, -5], .5, '#c8d0e8', FD, 14];
  const GOLD = ['#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14];
  const HAZE = ['#c8b8a8', '#6a5848', .98, '#ffd0a0', 2.1, [9, 3.6, -5], .5, '#e8c8a0', FD, 14];
  const light = [Dk(0, ...DRY), Dk(8.4, ...DRY), Dk(10.2, ...MORN), Dk(21.6, ...MORN), Dk(22.2, ...COOL), Dk(24.2, ...COOL), Dk(24.8, ...MORN), Dk(36.6, ...MORN), Dk(38.2, ...GOLD), Dk(44.6, ...GOLD), Dk(45.4, ...MORN), Dk(48.0, ...MORN), Dk(48.8, ...HAZE), Dk(52.2, ...HAZE), Dk(53.0, ...GOLD), Dk(58.0, ...GOLD), Dk(59.6, ...HAZE), Dk(90, ...HAZE)];
  const bg = [[0, ['#a8b8d0', '#f6e8cc']], [8.4, ['#a8b8d0', '#f6e8cc']], [10.2, ['#6a8ec8', '#f8d4a0']], [21.6, ['#6a8ec8', '#f8d4a0']], [22.2, ['#7a8ab8', '#e8d0b0']], [24.2, ['#7a8ab8', '#e8d0b0']], [24.8, ['#6a8ec8', '#f8d4a0']], [37.0, ['#6a8ec8', '#f8d4a0']], [38.2, ['#5a86c4', '#f6c890']], [44.6, ['#5a86c4', '#f6c890']], [45.4, ['#6a8ec8', '#f8d4a0']], [48.8, ['#9ab0c8', '#ecdcc0']], [52.2, ['#9ab0c8', '#ecdcc0']], [53.0, ['#8a98b8', '#f0c898']], [58.0, ['#8a98b8', '#f0c898']], [59.6, ['#8a98b8', '#d8c8b0']], [90, ['#8a98b8', '#d8c8b0']], [110, ['#7a6aa8', '#f8b898']], [130, ['#8a98b8', '#d8c8b0']]];
  return { group: g, update, light, bg, far, pl: [prL, ...ptL, ...torchL, gateL, campL], state };
}
"""
out = head + NEW3 + NEW4 + NEW5
open(S + 'src/world42.js', 'w').write(out)
print('world42.js', len(out))
