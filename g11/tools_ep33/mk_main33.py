#!/usr/bin/env python3
# Builds g11/src/main33.js from main32.js (shared page machinery copied) plus the Ep33 shots, titles and reference lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main32.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
i, _ = cut('// windows follow the narration beats')
head = t[:i]
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
head = rep(head, 'Episode 32 - Genesis 32.', 'Episode 33 - Genesis 33.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s32.js'" % m, "'./%s33.js'" % m)
head = rep(head, 'const { gAt, JP, FORD, FIRE, CAMPC, RIDGE, EAST, WR, PATH, RV } = stage;', 'const { gAt, sPos, J0, ALT, UX, UZ } = stage;')
head = rep(head, "const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z];", "const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z];\nconst Q = (s, lat = 0, dy = .5) => { const p = sPos(s, lat); return P3(p[0], p[1], dy); };      // a point s along the way from Jacob to Esau and lat to the south-east of it")

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 9.9, b1 16.2, b2 22.7, c1 30.7, c2 35.5, d1 44.6, e1 53.2
// a1 (0.6-9.15) Jacob looked up and saw Esau coming with four hundred men; he arranged his family in order, Rachel and Joseph last (33:1-2)
const S1 = [K(0, 0, Q(1.8, -.3, .6), -44, 10, 6.6, { dy: 300 }), K(0, 4.8, Q(2.6, -.2, .7), -42, 9, 5.6, { dy: 300 })];
const S2 = [K(4.4, 4.4, Q(-.9, 0, .55), 138, 8, 4.8, { dy: 300 }), K(4.4, 9.8, Q(-.9, 0, .6), 150, 8, 4.2, { dy: 300 })];
// a2 (9.9-15.3) he went ahead of them and bowed to the ground seven times as he came near his brother (33:3)
const S3 = [K(9.2, 9.2, Q(1.4, 0, .6), -120, 8, 6.0, { dy: 300 }), K(9.2, 12.8, Q(2.6, 0, .6), -114, 8, 5.0, { dy: 300 })];
const S4 = [K(12.4, 12.4, P3(5.4, .8, .5), -60, 10, 4.2, { dy: 300 }), K(12.4, 15.0, P3(6.9, -.7, .5), -58, 9, 3.5, { dy: 300 }), K(12.4, 16.4, P3(7.3, -1.0, .5), -55, 9, 3.4, { dy: 300 })];
// b1 (16.2-21.89) Esau ran to meet him, embraced him, fell on his neck, kissed him, and they wept (33:4)
const S5 = [K(16.0, 16.0, Q(6.4, 0, .6), -112, 6, 5.0, { dy: 300 }), K(16.0, 17.4, Q(5.4, 0, .6), -110, 6, 3.6, { dy: 300 }), K(16.0, 19.2, Q(4.4, 0, .6), -108, 6, 3.0, { dy: 300 })];
const S6 = [K(18.8, 18.8, Q(4.25, 0, .55), 38, 4, 2.3, { dy: 300 }), K(18.8, 22.9, Q(4.3, 0, .6), 56, 4, 1.7, { dy: 300 })];
// b2 (22.7-29.86) Esau saw the women and children: "Who are these with you?" "The children God has graciously given your servant"; they come forward and bow (33:5-7)
const S7 = [K(22.5, 22.5, Q(2.2, 0, .5), -135, 7, 5.6, { dy: 300 }), K(22.5, 26.7, Q(2.4, 0, .5), -128, 7, 5.0, { dy: 300 })];
const S8 = [K(26.4, 26.4, Q(2.4, 0, .4), -140, 6, 4.6, { dy: 300 }), K(26.4, 30.8, Q(2.4, 0, .4), -132, 6, 3.8, { dy: 300 })];
// c1 (30.7-34.23) "I have enough, my brother; keep what you have for yourself" (33:9)
const S9 = [K(30.4, 30.4, Q(4.4, 0, 1.0), -38, 4, 2.5, { dy: 250 }), K(30.4, 35.3, Q(4.4, 0, 1.0), -30, 4, 2.2, { dy: 250 })];
// c2 (35.5-43.77) "Please accept my gift ... to see your face is like seeing the face of God" (33:10-11)
const S10 = [K(35.0, 35.0, Q(4.6, .9, .55), -125, 7, 4.4, { dy: 300 }), K(35.0, 39.7, Q(4.6, .9, .55), -120, 7, 3.6, { dy: 300 })];
const S11 = [K(39.4, 39.4, Q(4.4, 0, .95), 95, 4, 2.4, { dy: 235 }), K(39.4, 44.6, Q(4.4, 0, .95), 97, 4, 1.9, { dy: 235 })];
// d1 (44.6-51.86) Esau accepted it and went back toward Seir; Jacob led on slowly at the pace of his children and flocks (33:11, 33:14, 33:16)
const S12 = [K(44.2, 44.2, Q(6.0, 0, .6), -48, 8, 7.5, { dy: 300 }), K(44.2, 48.8, Q(7.0, 0, .6), -46, 10, 8.0, { dy: 300 })];
const S13 = [K(48.4, 48.4, P3(1.6, 1.0, .5), -82, 4, 5.6, { dy: 300 }), K(48.4, 53.2, P3(-.6, 1.1, .5), -82, 5, 5.6, { dy: 300 })];
// e1 (53.2-57.54) he came safely to Shechem, bought a piece of land, and built an altar there (33:18-20)
const S14 = [K(52.8, 52.8, P3(-2.2, .4, .6), 96, 6, 6.0, { dy: 300 }), K(52.8, 56.0, P3(-3.8, -.9, .6), 106, 6, 4.0, { dy: 300 }), K(52.8, 61.8, P3(-4.0, -1.1, .7), 112, 6, 3.4, { dy: 300 })];
const LBL = [[0, .45], [16, .5], [30, .5], [44, .55], [54, .55], [60, .5]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .55]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('family', S2, { xin: .5 }), landShot('ahead', S3, { xin: .5 }), landShot('bows', S4, { xin: .5 }), landShot('run', S5, { xin: .4 }), landShot('embrace', S6, { xin: .5 }), landShot('who', S7, { xin: .5 }),
  landShot('bow', S8, { xin: .5 }), landShot('enough', S9, { xin: .5 }), landShot('gift', S10, { xin: .5 }), landShot('face', S11, { xin: .5 }), landShot('leave', S12, { xin: .5 }), landShot('slow', S13, { xin: .5 }), landShot('altar', S14, { xin: .5 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['JACOB LOOKED UP', 'AND SAW ESAU'], a: 1.0, b: 4.5, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['HIS FAMILY', 'IN ORDER'], a: 5.0, b: 9.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['SEVEN BOWS', 'TO THE GROUND'], a: 10.4, b: 15.8, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['ESAU RAN', 'TO MEET HIM'], a: 16.6, b: 22.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['WHO ARE', 'THESE WITH YOU?'], a: 23.0, b: 30.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['I HAVE ENOUGH,', 'MY BROTHER'], a: 31.0, b: 35.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['PLEASE ACCEPT', 'MY GIFT'], a: 36.0, b: 44.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['ESAU WENT', 'BACK TO SEIR'], a: 44.8, b: 48.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JACOB WENT', 'ON SLOWLY'], a: 48.9, b: 52.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['AN ALTAR', 'AT SHECHEM'], a: 53.5, b: 59.6, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HE PREPARED', 'FOR THE WORST'], a: 61.8, b: 65.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['ESAU DID NOT', 'WAIT. HE RAN.'], a: 67.0, b: 71.2, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['THE FEARED BROTHER', 'RAN FIRST'], a: 72.5, b: 77.4, y: 330, size: 92, glow: 1, maxW: 890 },
  { l: ['ONE STEP', 'TOWARD THEM'], a: 78.2, b: 84.8, y: 330, size: 112, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 33', .6, 4.6, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 33:1', 1.4, 4.5, 540, { size: 34, track: 11 });
  [['GENESIS 33:1–2', 5.1, 9.2], ['GENESIS 33:3', 10.5, 15.8], ['GENESIS 33:4', 16.7, 22.4], ['GENESIS 33:5–7', 23.1, 30.2], ['GENESIS 33:9', 31.1, 35.2], ['GENESIS 33:10–11', 36.1, 44.0], ['GENESIS 33:11, 16', 44.9, 48.6], ['GENESIS 33:14', 49.0, 52.8], ['GENESIS 33:18–20', 53.6, 59.6]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.9, 65.5, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main33.js', 'w').write(out)
print('main33.js', len(out))
