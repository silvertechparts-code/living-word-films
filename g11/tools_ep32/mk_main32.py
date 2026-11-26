#!/usr/bin/env python3
# Builds g11/src/main32.js from main31.js (shared page machinery copied) plus the Ep32 shots, titles and reference lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main31.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
i, _ = cut('// windows follow the narration beats')
head = t[:i]
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
head = rep(head, 'Episode 31 - Genesis 31.', 'Episode 32 - Genesis 32.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s31.js'" % m, "'./%s32.js'" % m)
head = rep(head, 'const { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH, CAMP, HEAP } = stage;', 'const { gAt, JP, FORD, FIRE, CAMPC, RIDGE, EAST, WR, PATH, RV } = stage;')

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.9, b1 15.9, b2 21.2, c1 27.0, c2 35.6, d1 41.2, d2 50.4, e1 57.4
// a1 (0.6-6.84) Jacob sent messengers to Esau; they came back: he is coming with four hundred men (32:3-6)
const S1 = [K(0, 0, P3(-.9, 1.7, .5), -52, 12, 7.0, { dy: 300 }), K(0, 3.7, P3(-1.2, 1.8, .5), -44, 10, 5.0, { dy: 300 })];
const S2 = [K(3.2, 3.2, P3(-1.3, 1.9, .55), -30, 6, 3.4, { dy: 300 }), K(3.2, 5.6, P3(-1.2, 1.9, .6), -18, 6, 3.0, { dy: 300 })];
const S3 = [K(5.2, 5.2, P3(3.0, 1.0, .8), -42, 6, 9.0, { dy: 300 }), K(5.2, 8.2, P3(5.5, 1.5, .9), -38, 7, 8.0, { dy: 300 })];
// a2 (7.9-14.7) Jacob was terrified and prayed (32:7-12)
const S4 = [K(7.7, 7.7, P3(-2.0, 2.0, .5), 96, 8, 2.6, { dy: 300 }), K(7.7, 11.0, P3(-2.0, 2.0, .55), 110, 7, 1.9, { dy: 300 }), K(7.7, 15.2, P3(-2.0, 2.0, .6), 100, 10, 2.3, { dy: 300 })];
// b1 (15.9-19.88) the gift of animals, herd by herd (32:13-21)
const S5 = [K(14.6, 14.6, P3(-1.0, 1.3, .4), 14, 7, 5.5, { dy: 300 }), K(14.6, 18.0, P3(.6, 1.3, .4), 8, 7, 5.2, { dy: 300 }), K(14.6, 21.4, P3(2.6, 1.3, .4), 4, 8, 6.0, { dy: 300 })];
// b2 (21.2-25.66) that night he sent his family across the Jabbok and stayed behind, alone (32:22-24)
const S6 = [K(20.9, 20.9, P3(-.8, 1.2, .5), 6, 8, 5.2, { dy: 300 }), K(20.9, 25.5, P3(1.2, 1.2, .5), 4, 8, 5.0, { dy: 300 })];
const S7 = [K(25.2, 25.2, P3(-2.0, 2.0, .6), -45, 8, 3.4, { dy: 300 }), K(25.2, 28.0, P3(-2.0, 2.0, .6), -38, 8, 2.8, { dy: 300 })];
// c1 (27.0-34.0) a man wrestled with him until daybreak and struck his hip (32:24-25)
const S8 = [K(26.8, 26.8, P3(-2.1, 2.1, .55), 32, 6, 2.1, { dy: 300 }), K(26.8, 31.8, P3(-2.1, 2.1, .55), 12, 5, 1.65, { dy: 300 })];
const S9 = [K(31.3, 31.3, P3(-2.1, 2.1, .45), -28, 4, 1.5, { dy: 300 }), K(31.3, 36.0, P3(-2.1, 2.1, .5), -12, 5, 1.6, { dy: 300 })];
// c2 (35.6-39.7) "Let me go." "Not unless you bless me." (32:26)
const S10 = [K(35.5, 35.5, P3(-2.1, 2.1, .6), 40, 4, 1.6, { dy: 300 }), K(35.5, 41.6, P3(-2.1, 2.05, .6), 18, 6, 1.8, { dy: 300 })];
// d1 (41.2-49.06) the new name, Israel (32:27-29)
const S11 = [K(41.2, 41.2, P3(-1.7, 1.9, .6), -34, 4, 2.6, { dy: 300 }), K(41.2, 45.0, P3(-1.7, 1.9, .7), -24, 5, 2.4, { dy: 300 }), K(41.2, 50.8, P3(-1.7, 1.9, .75), -10, 6, 3.0, { dy: 300 })];
// d2 (50.4-56.27) Peniel: "I have seen God face to face" (32:30)
const S12 = [K(50.2, 50.2, P3(-2.0, 2.0, .65), -48, 3, 3.2, { dy: 300 }), K(50.2, 54.0, P3(-2.0, 2.0, .7), -38, 4, 2.6, { dy: 300 }), K(50.2, 57.8, P3(-2.0, 2.0, .7), -26, 5, 3.0, { dy: 300 })];
// e1 (57.4-60.21) the sun rose and Jacob walked on, limping (32:31)
const S13 = [K(57.2, 57.2, P3(-1.6, 1.9, .6), -30, 6, 3.4, { dy: 300 }), K(57.2, 59.6, P3(.2, 1.5, .5), -22, 7, 4.6, { dy: 300 }), K(57.2, 61.8, P3(2.0, 1.3, .5), -10, 8, 6.0, { dy: 300 })];
const LBL = [[0, .4], [8, .42], [16, .5], [22, .55], [30, .55], [42, .5], [48, .55], [54, .46], [60, .46]], LSC = [[0, .06], [16, .04], [24, .05], [48, .03], [60, .03]], LVG = [[0, .5], [60, .55]];
"""

i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('news', S2, { xin: .5 }), landShot('host', S3, { xin: .5 }), landShot('pray', S4, { xin: .5 }), landShot('droves', S5, { xin: .5 }), landShot('cross', S6, { xin: .5 }), landShot('alone', S7, { xin: .5 }),
  landShot('wrestle', S8, { xin: .5 }), landShot('hip', S9, { xin: .5 }), landShot('hold', S10, { xin: .5 }), landShot('bless', S11, { xin: .5 }), landShot('peniel', S12, { xin: .5 }), landShot('limp', S13, { xin: .5 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['ESAU IS COMING', 'WITH 400 MEN'], a: 1.0, b: 6.4, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['JACOB PRAYED', 'IN FEAR'], a: 8.2, b: 14.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A GIFT OF', 'ANIMALS AHEAD'], a: 16.2, b: 19.9, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ALONE AT', 'THE JABBOK'], a: 21.6, b: 26.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A MAN WRESTLED', 'WITH HIM'], a: 27.6, b: 32.8, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['NOT UNLESS YOU', 'BLESS ME'], a: 35.8, b: 39.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['A NEW NAME:', 'ISRAEL'], a: 41.4, b: 46.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['I SAW GOD', 'FACE TO FACE'], a: 50.6, b: 56.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE WALKED ON,', 'LIMPING'], a: 57.4, b: 60.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HE PRAYED', 'HONESTLY'], a: 61.8, b: 65.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HE HELD ON', 'UNTIL BLESSED'], a: 66.2, b: 69.8, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['STRUGGLE IS NOT', 'THE END OF FAITH'], a: 71.0, b: 77.5, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['HOLD ON TO GOD,', 'DO NOT LET GO'], a: 78.2, b: 84.8, y: 330, size: 96, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 32', .6, 5.0, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 32:3–6', 1.4, 6.4, 540, { size: 34, track: 11 });
  [['GENESIS 32:7–12', 8.3, 14.4], ['GENESIS 32:13–21', 16.3, 19.9], ['GENESIS 32:22–24', 21.7, 26.0], ['GENESIS 32:24–25', 27.7, 32.8], ['GENESIS 32:26', 35.9, 39.8], ['GENESIS 32:27–28', 41.5, 46.0], ['GENESIS 32:30', 50.7, 56.0], ['GENESIS 32:31', 57.5, 60.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.9, 65.2, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main32.js', 'w').write(out)
print('main32.js', len(out))
