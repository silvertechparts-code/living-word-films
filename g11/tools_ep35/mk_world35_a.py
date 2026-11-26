#!/usr/bin/env python3
# Builds g11/src/world35.js from world34.js: the terrain, river, camp, walled town, people makers, animals and sky machinery are kept; the actors, props, light and timing are Genesis 35.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'world34.js').read()
def between(a, b=None, inc_b=False):
    i = t.index(a); j = t.index(b, i + len(a)) if b else len(t)
    return t[i:j + (len(b) if (b and inc_b) else 0)]
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80]); return s.replace(a, b)

HEADER = r"""// Episode 35: Genesis 35. God tells Jacob "go up to Bethel, settle there and make an altar" (35:1); Jacob tells his household to put away the foreign gods, purify themselves and change their clothes (35:2); they give him the foreign gods and the rings in their ears, and he buries them under the oak near Shechem (35:4).
// As they journey a terror from God falls on the towns around them and they do not pursue the sons of Jacob (35:5); Jacob comes to Luz, that is Bethel, builds an altar there (35:6-7); God appears to him again and blesses him, saying "your name is Jacob, you shall no longer be called Jacob, but Israel shall be your name" (35:9-10).
// They journey from Bethel; when there is still some distance to Ephrath Rachel begins to give birth and has a hard labor; the midwife says "Do not be afraid; now you will have another son"; as her soul departs, for she died, she names him Ben-oni, but his father calls him Benjamin (35:16-18); Rachel dies and is buried on the road to Ephrath, that is Bethlehem, and Jacob sets up a pillar over her tomb (35:19-20).
// Jacob comes to his father Isaac at Mamre; Isaac dies, old and full of days, and his sons Esau and Jacob bury him (35:27-29).
// Cinematic interpretation: the floating land, the camp, the great oak, the heap of small figures and rings laid on a cloth, the walled town with its gate closed, the column on the road, the hill and the altar of stones, the shaft of light that stands for God's appearing, the lone tent with its lamp, the pillar of stones, the bier carried by the two brothers, the dusk, the night and the dawn.
// The text gives no landscape and no thoughts. God is shown only as light. Rachel's death is not shown: the film holds on the tent and the lamp. The film leaves out Deborah's death (35:8), the promises of 35:11-12, the pillar and the drink offering at Bethel (35:14-15), Reuben and Bilhah (35:22) and the list of the twelve sons (35:22-26); the narration shortens Rachel's naming of Ben-oni in 35:18.
"""
IMPORTS = between("import * as THREE from 'three';", "\n\nexport const RIC")
CONSTS = r"""
export const RIC = 15, RW = .85, WL = .2;
export const RV = z => .55 * Math.sin(z * .32 + .6);                                   // the river runs north to south; this is its centre line
export const FORD = [.45, 1.3], CAMPC = [-7.0, -.2], EAST = [4.4, 1.6];                // the ford; the camp at the west end of the road; the east bank
export const CITY = [8.3, .2], CHD = 2.6, CHW = 3.0, GX = CITY[0] - CHD, GZ = CITY[1];   // a walled town on the east bank, its gate in the west wall at (GX, GZ)
export const JD = [-4.7, .35];                                                          // where Jacob stands in the camp
export const HEAP = [-4.3, -.4], OAK = [-2.7, -2.9];                                    // the cloth where the household lays down its other gods; the great oak
export const BETH = [12.2, 5.3];                                                        // Bethel: the altar on the north-east hill
export const RACH = [-1.9, 2.9];                                                        // the lone tent beside the road (Ephrath)
export const PIL = [-1.0, .05];                                                         // the pillar over the grave beside the road
"""
TERRAIN = between("// ---------------- terrain:", "export const stage = ")
TERRAIN = rep(TERRAIN, "[EAST[0] + .6, EAST[1] - .6, .32, 3.2]];", "[EAST[0] + .6, EAST[1] - .6, .32, 3.2], [BETH[0], BETH[1], .98, 1.9], [RACH[0], RACH[1], .3, 1.5], [PIL[0], PIL[1], .3, 1.0]];")
STAGE = "export const stage = { gAt, CITY, GX, GZ, JD, CAMPC, PATH, RV, FORD, HEAP, OAK, BETH, RACH, PIL, EAST };\n"
WALK = between("// ---------------- walkers:", "// ---------------- the people")

PEOPLE = r"""// ---------------- the people
const mkJacob = R => person(R, { pants: '#d9ccb0', top: '#c9b27c', skin: '#d9a073', hair: '#2e1d10', beard: '#3a2616', cloth: '#efe4cc', sash: '#8a5a2a', seed: 720 }, .45);   // the same Jacob, Rachel and Leah as in Genesis 33, with a beard
const mkRachel = R => person(R, { pants: '#e0d4b4', top: '#4f9a8a', skin: '#cf9468', hair: '#2a1a10', long: true, cloth: '#efe4cc', sash: '#c8884a', seed: 810 }, .43);
const mkLeah = R => person(R, { pants: '#cdbf9c', top: '#8a5a78', skin: '#c58c60', hair: '#2a1a10', long: true, cloth: '#d8c8d6', sash: '#c9a15a', seed: 820 }, .44);
const mkMaid = (R, top, skin, cloth, sash, seed) => person(R, { pants: '#d8ccb0', top, skin, hair: '#2a1a10', long: true, cloth, sash, seed }, .42);
const mkHerd = (R, top, skin, seed, pants = '#5a4a38') => person(R, { pants, top, skin, hair: '#2e1d10', sash: '#3a2a1a', seed }, .45);
const mkKid = (R, top, seed, sc, skin = '#c58c60', long = false) => person(R, { pants: '#d9ccb0', top, skin, hair: '#2a1a10', long, seed }, sc);
const mkIsaac = R => person(R, { pants: '#d8d0bc', top: '#c9b890', skin: '#c38a5c', hair: '#d6d2ca', beard: '#e2dfd8', cloth: '#efe8d6', mantle: '#9a8a6a', sash: '#8a6a3a', seed: 630 }, .46);   // Isaac, very old: white beard, a long mantle
const mkEsau = R => person(R, { pants: '#8a5a38', top: '#7a3a26', skin: '#c87a50', hair: '#a8441c', beard: '#a8441c', cloth: '#e0d0b0', mantle: '#6a4a2a', sash: '#2e2018', seed: 975 }, .5);   // ruddy and hairy (25:25), broader than Jacob
const lamC = c => new THREE.MeshLambertMaterial({ color: c });
const mkDark = sd => makeQuad({ rn: rng(sd), len: .46, h: .24, w: .2, legL: .2, legW: .04, col: '#3a2e26', col2: '#2a201a', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#2a201a' });
const mkGoat = sd => { const s = makeQuad({ rn: rng(sd), len: .5, h: .24, w: .2, legL: .26, legW: .04, col: '#d8cdb4', col2: '#7a5a3a', neck: [.15, .75, .08], head: [.17, .1, .09], horns: true, ears: false, legCol: '#5a4430' });
  for (const [x, z] of [[.07, .3], [-.1, -.3]]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(.11, .08, .206), lamC('#4a3426')); sp.position.set(x, .42, z * .08); s.group.add(sp); } return s; };

"""

# ---- makeCountry, first half: terrain, trees, boulders, reeds, river, camp tents
MC1 = between("export function makeCountry() {", "  // ---- Shechem (34:2)")
MC1 = rep(MC1, "const R = rng(3434)", "const R = rng(3535)")
MC1 = rep(MC1, "rng(9871), RIC, hC, gcC, 38, 118), underRock(rng(9872)", "rng(9871), RIC, hC, gcC, 38, 118), underRock(rng(9872)")
MC1 = rep(MC1, "[[-10.0, 3.0, 2.4], [-9.2, -2.4, 2.0], [-10.4, 6.0, 1.9]]", "[[-10.0, 3.0, 2.4], [-10.6, -3.2, 2.0], [-10.4, 6.0, 1.9]]")
MC1 = rep(MC1, "|| (x > -5.6 && x < -2 && z > -4.2 && z < -.6);", "|| (x > -5.6 && x < -.8 && z > -4.4 && z < -.2) || Math.hypot(x - BETH[0], z - BETH[1]) < 2.6 || Math.hypot(x - RACH[0], z - RACH[1]) < 2.4 || Math.hypot(x - PIL[0], z - PIL[1]) < 1.6;")
# a closed town gate, a great oak and everything new that stands on the ground
CITYB = between("  // ---- Shechem (34:2)", "  const TX = GX - .34")
CITYB = CITYB.replace("// ---- Shechem (34:2): a walled city on the east bank; the gate is in the west wall facing the road; houses inside; torches at the gate and lit windows come on at dusk", "// ---- a walled town on the east bank (35:5); its gate is in the west wall facing the road, and it stays shut")
NEWPROPS = r"""  { const b = new GB(rng(348)), x0 = GX; b.box('#6a4a2a', [x0 + .04, hC(x0, GZ) + .42, GZ], [.1, .84, .84], [0, 0, 0], .03); for (const dz of [-.28, 0, .28]) b.box('#4a3220', [x0 - .02, hC(x0, GZ) + .42, GZ + dz], [.05, .8, .04], [0, 0, 0], .01); b.box('#4a3220', [x0 - .02, hC(x0, GZ) + .36, GZ], [.05, .04, .8], [0, 0, 0], .01); ca.add(meshOf(b)); }
  // ---- the great oak by the camp (35:4): its own tree, never hidden by the camera helper
  { const m = new THREE.Mesh(roundTreeGeo(2.5, R, ['#5f8a3a', '#6a9a44', '#557f36', '#74a24c']), lam); m.position.set(OAK[0], hC(OAK[0], OAK[1]) - .02, OAK[1]); m.castShadow = true; m.rotation.y = 1.3; ca.add(m); }
  const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lamC('#6a5038')); mound.scale.set(.3, .07, .2); mound.position.set(OAK[0] + .62, hC(OAK[0] + .62, OAK[1] + .45) - .01, OAK[1] + .45); mound.receiveShadow = true; ca.add(mound);
  // ---- the foreign gods and the rings, laid on a cloth (35:2, 4): small figures of gold, bronze and silver, and earrings
  const heapG = new THREE.Group(); heapG.position.set(HEAP[0], hC(HEAP[0], HEAP[1]), HEAP[1]); g.add(heapG);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(.78, .012, .66), lamC('#c8b48c')); cloth.position.y = .008; cloth.rotation.y = .3; cloth.receiveShadow = true; heapG.add(cloth);
  const ITEMS = []; { const Ri = rng(351); for (let i = 0; i < 18; i++) { const b = new GB(rng(360 + i)), ang = i * 2.4 + Ri() * .4, rr = .06 + Ri() * .22 * Math.sqrt(i / 17 + .15), kind = i % 3, col = ['#d4a73c', '#9a6a32', '#c0c0b6', '#e0b84c'][i % 4];
      if (kind === 2) b.add(G.ico0, col, [0, .02, 0], [.07, .018, .07], [0, 0, 0], .02); else { b.box(col, [0, .06, 0], [.045, .11, .04], [0, 0, 0], .01); b.add(G.ico0, col, [0, .13, 0], [.034, .034, .034], [0, 0, 0], .01); }
      const m = new THREE.Mesh(b.build(), lam); m.position.set(Math.cos(ang) * rr, .012 + (i > 11 ? .04 : 0), Math.sin(ang) * rr); m.rotation.set(i % 3 === 0 ? 1.2 : 0, ang * 2, 0); m.castShadow = true; heapG.add(m); ITEMS.push(m); } }
  // ---- the altar at Bethel (35:7): stones set one on another on the hilltop
  const altar = new THREE.Group(); altar.position.set(BETH[0], hC(BETH[0], BETH[1]) - .02, BETH[1]); ca.add(altar);
  const STN = [[-.34, .1, .08, .3, .2, .26, .2], [.0, .1, -.04, .32, .22, .27, -.1], [.34, .1, .09, .29, .2, .25, .4], [-.17, .29, .03, .3, .19, .25, .3], [.17, .29, -.02, .3, .2, .26, -.3], [.0, .46, .02, .28, .18, .24, .1], [-.02, .12, -.34, .26, .18, .22, .6]];
  const stones = STN.map(([x, y, z, sx, sy, sz, ry], i) => { const b = new GB(rng(77 + i)); b.add(G.ico0, pk(rng(78 + i), ['#9a8e7c', '#a99c86', '#85796a']), [0, 0, 0], [sx, sy, sz], [.2 * i, ry, .1], .06); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; altar.add(m); return m; });
  const altarL = new THREE.PointLight(0xffc878, 0, 7, 1.5); altarL.position.set(BETH[0] - .3, hC(BETH[0], BETH[1]) + 1.2, BETH[1] + .4);
  const shaftB = shaft(8, .36, 1.2, [1, .86, .5], 1, .3); shaftB.position.set(BETH[0], hC(BETH[0], BETH[1]), BETH[1]); g.add(shaftB);
  const poolB = pool(1.5, 0xffd890, 0); poolB.position.set(BETH[0], hC(BETH[0], BETH[1]) + .03, BETH[1]); g.add(poolB);
  const shaftJ = shaft(7, .3, .95, [1, .84, .5], 1, .25); shaftJ.position.set(JD[0] + 1.15, hC(JD[0] + 1.15, JD[1] + .1), JD[1] + .1); g.add(shaftJ);
  const poolJ = pool(1.1, 0xffd890, 0); poolJ.position.set(JD[0] + 1.15, hC(JD[0] + 1.15, JD[1] + .1) + .03, JD[1] + .1); g.add(poolJ);
  const bethM = makeMotes({ n: 70, area: [1.7, 3.6, 1.7], size: .032, v: .38, seed: 61, color: 0xffd47a }); g.add(bethM.mesh);
  const callM = makeMotes({ n: 40, area: [1.4, 3.0, 1.4], size: .028, v: .34, seed: 62, color: 0xffd47a }); g.add(callM.mesh);
  // ---- Rachel's tent beside the road, its door toward the road, and the lamp at its door (35:16)
  const rTent = tentMesh(rng(551), '#d4c29c', .95); rTent.position.set(RACH[0], hC(RACH[0], RACH[1]) - .02, RACH[1]); rTent.rotation.y = Math.PI + .12; ca.add(rTent);
  const RDIR = [Math.sin(Math.PI + .12), Math.cos(Math.PI + .12)], RDOOR = [RACH[0] + RDIR[0] * .86, RACH[1] + RDIR[1] * .86];
  const lampG = spriteGlow(RDOOR[0], hC(RDOOR[0], RDOOR[1]) + .28, RDOOR[1], .9, 0xffa850, 0), lampG2 = spriteGlow(RDOOR[0], hC(RDOOR[0], RDOOR[1]) + .26, RDOOR[1], .3, 0xfff0c0, 0); g.add(lampG, lampG2);
  const lampL = new THREE.PointLight(0xffa458, 0, 5.2, 1.6); lampL.position.set(RDOOR[0] + RDIR[0] * .3, hC(RDOOR[0], RDOOR[1]) + .6, RDOOR[1] + RDIR[1] * .3);
  { const b = new GB(rng(352)); b.box('#8a4a3c', [RDOOR[0] + RDIR[0] * .45, hC(RDOOR[0], RDOOR[1]) + .012, RDOOR[1] + RDIR[1] * .45], [.7, .02, .5], [0, 0, 0], .02); ca.add(meshOf(b)); }
  // ---- the pillar over the grave (35:20): stones set one on another; a low heap at its foot
  const pillar = new THREE.Group(); pillar.position.set(PIL[0], hC(PIL[0], PIL[1]) - .02, PIL[1]); ca.add(pillar);
  const PST = [[-.3, .06, .1, .26, .13, .2, .3], [.3, .06, -.04, .24, .12, .2, -.2], [.0, .06, .22, .26, .12, .18, .1], [.0, .07, -.22, .24, .13, .2, .5], [0, .2, 0, .24, .16, .22, .2], [0, .38, 0, .2, .2, .18, -.2], [0, .58, 0, .17, .2, .16, .4], [0, .78, 0, .14, .18, .13, .1]];
  const pStones = PST.map(([x, y, z, sx, sy, sz, ry], i) => { const b = new GB(rng(97 + i)); b.add(G.ico0, pk(rng(98 + i), ['#a89a84', '#b4a690', '#9a8e7c']), [0, 0, 0], [sx, sy, sz], [.1 * i, ry, .08], .05); const m = new THREE.Mesh(b.build(), lam); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; pillar.add(m); return m; });
  // ---- the body wrapped in linen on a bier (cinematic interpretation: the text says only that she, and later Isaac, was buried)
  const mkBier = () => { const br = new THREE.Group(), b = new GB(rng(31)); b.box('#8a4a3c', [0, .012, 0], [.98, .02, .4], [0, 0, 0], .02); b.box('#c8a050', [0, .024, 0], [.92, .01, .07], [0, 0, 0], .01);
    b.box('#efe6d2', [0, .075, 0], [.76, .1, .19], [0, 0, 0], .02); b.add(G.ico1, '#efe6d2', [-.37, .085, 0], [.09, .07, .09], [0, 0, 0], .02); b.box('#e0d6bc', [.12, .13, 0], [.24, .02, .2], [0, 0, 0], .01);
    b.box('#6b4a2c', [0, -.02, .26], [1.3, .03, .03], [0, 0, 0], .01); b.box('#6b4a2c', [0, -.02, -.26], [1.3, .03, .03], [0, 0, 0], .01);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; br.add(m); g.add(br); br.visible = false; return br; };
  const bierR = mkBier(), bierI = mkBier();
"""
MC2 = between("  // ---- the animals the sons drive out", "  const far = farMountains10")
MC2 = MC2.replace("the animals the sons drive out of the city (34:28): sheep, goats and donkeys", "the flocks that travel with Jacob: sheep, goats and donkeys")
SKY = between("  const far = farMountains10", "  // ---- the people. Jacob")
SKY = rep(SKY, "const CLOUD = [[0, '#e8c8a0'], [34, '#e8c0a0'], [39.5, '#8a86a8'], [42, '#4a4a78'], [46, '#4a4a78'], [49, '#e0a898'], [54, '#e8b898'], [60, '#e8a888'], [90, '#e8a888']];",
 "const CLOUD = [[0, '#e8c8a0'], [14, '#e8c8a0'], [17, '#c8b0a8'], [21, '#e8c8a0'], [25, '#f0d4a0'], [32, '#e8b898'], [37, '#c89a98'], [40, '#6a6a98'], [42, '#4a4a78'], [46, '#4a4a78'], [49, '#e0a898'], [54, '#e8b898'], [60, '#e8a888'], [90, '#e8a888']];")
SKY = rep(SKY, "const CEM = [[0, '#6a5848'], [34, '#6a5848'], [39.5, '#3a3a58'], [42, '#22223a'], [46, '#22223a'], [49, '#5a4a52'], [54, '#6a5848'], [60, '#6a4a3e'], [90, '#6a4a3e']];",
 "const CEM = [[0, '#6a5848'], [32, '#6a5848'], [37, '#5a4a58'], [40, '#3a3a58'], [42, '#22223a'], [46, '#22223a'], [49, '#5a4a52'], [54, '#6a5848'], [60, '#6a4a3e'], [90, '#6a4a3e']];")

PEOPLE2 = r"""  // ---- the people. Jacob, Rachel, Leah and the sons are the same models as in Genesis 33 and 34; Isaac (older), Esau, the midwife and the household are shown here
  const jacob = mkJacob(rng(87)), rachel = mkRachel(rng(88)), leah = mkLeah(rng(90)), isaac = mkIsaac(rng(83)), esau = mkEsau(rng(114));
  const bil = mkMaid(rng(121), '#7a9a6a', '#b8825a', '#d8cfb4', '#a87a4a', 851), zil = mkMaid(rng(122), '#c09a58', '#c08a5e', '#e0d4bc', '#8a7a4a', 852), mid = mkMaid(rng(123), '#6a7aa8', '#b98a62', '#e8dcc4', '#c8a050', 853);
  const mkSon = (sd, top, seed, sc, beard) => person(rng(sd), { pants: '#d9ccb0', top, skin: '#c58c60', hair: '#2a1a10', beard, sash: '#8a5a2a', seed }, sc);
  const SON = { reu: mkSon(93, '#6a7fa0', 930, .44, '#2a1a10'), sim: mkSon(94, '#a8683a', 931, .44, '#2a1a10'), lev: mkSon(95, '#5f8a5a', 932, .43, '#2a1a10'), jud: mkSon(96, '#c9a15a', 933, .42, '#3a2616'), dan: mkSon(97, '#7a4a3a', 934, .41), gad: mkSon(99, '#a2564e', 936, .41), iss: mkSon(101, '#6a5a8a', 938, .4) };
  const mC = ['#6f8a62', '#9a4a42', '#8a6a4a', '#4f7a8a', '#c9a15a', '#7a5a8a'], mS = ['#a8714a', '#b98a62', '#a8714a', '#b98a62', '#c38a5c', '#a8714a'];
  const MEN = mC.map((c, i) => mkHerd(rng(130 + i), c, mS[i], 870 + i, i % 2 ? '#d8ccb0' : '#cdbd98'));
  const CAPW = [mkMaid(rng(150), '#8a6a9a', '#b8825a', '#d8cfb4', '#a87a4a', 890), mkMaid(rng(151), '#5a8a7a', '#c08a5e', '#e0d4bc', '#8a7a4a', 891)];
  const CAPK = [mkKid(rng(154), '#a87a5a', 894, .25), mkKid(rng(155), '#6a8a9a', 895, .27), mkKid(rng(156), '#9a6a7a', 896, .23)];
  const mkStaff = () => { const st = new THREE.Group(), b = new GB(rng(37)); b.box('#6b4a2c', [.2, .6, -.08], [.03, 1.3, .03], [0, 0, .06], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; st.add(m); return st; };
  jacob.group.add(mkStaff());
  const bundle = new THREE.Mesh(new THREE.BoxGeometry(.22, .15, .17), lamC('#cdbd98')); bundle.position.set(0, .6, .2); bundle.castShadow = true; jacob.group.add(bundle); bundle.visible = false;
  const babe = new THREE.Mesh(new THREE.BoxGeometry(.16, .1, .12), lamC('#efe6d2')); babe.position.set(0, .64, .2); babe.castShadow = true; jacob.group.add(babe); babe.visible = false;
  const ALLP = [jacob, rachel, leah, isaac, esau, bil, zil, mid, ...Object.values(SON), ...MEN, ...CAPW, ...CAPK]; ALLP.forEach(o => g.add(o.group));
"""
ANIMH = between("  // ---- animation helpers", "  // ---- who goes where")
ANIMH = rep(ANIMH, "  const walk = (ts, v, pts)", "  const walk = (ts, v, pts)")

