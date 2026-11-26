#!/usr/bin/env python3
# Builds g11/src/main30.js from main29.js (shared page machinery copied) plus the Ep30 shots, titles and reference lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main29.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
# ---- head: up to the shot windows
i, _ = cut('// windows follow the narration beats')
head = t[:i]
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
head = rep(head, 'Episode 29 - Genesis 29.', 'Episode 30 - Genesis 30.')
head = rep(head, "'./world29.js'", "'./world30.js'"); head = rep(head, "'./reflect29.js'", "'./reflect30.js'"); head = rep(head, "'./end29.js'", "'./end30.js'"); head = rep(head, "'./subs29.js'", "'./subs30.js'")
head = rep(head, 'const { gAt, HZ, DOOR, YARD, WELL, FLD, TL, PATH } = stage;', 'const { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH } = stage;')

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.43, b1 12.89, b2 21.15, c1 26.29, d1 34.26, d2 44.81, e1 54.19
// a1 (0.6-7.83) Rachel had no children and envied her sister Leah; she told Jacob: give me children, or I will die (30:1)
const S1 = [K(0, 0, P3(-3.2, 1.0, .5), 22, 16, 8.2, { dy: 300 }), K(0, 4.4, P3(-4.2, 1.2, .6), 12, 10, 3.6, { dy: 300 })];
const S2 = [K(3.9, 3.9, P3(-4.1, 1.25, .6), 14, 7, 4.6, { dy: 300 }), K(3.9, 8.6, P3(-4.25, 1.25, .65), 4, 6, 2.8, { dy: 300 })];
// a2 (8.43-12.19) Jacob answered: am I God, who has kept children from you? (30:2)
const S3 = [K(8.3, 8.3, P3(-3.85, 1.2, .75), 30, 5, 2.2, { dy: 300 }), K(8.3, 12.9, P3(-4.2, 1.25, .7), 10, 5, 2.6, { dy: 300 })];
// b1 (12.89-20.55) Rachel and Leah each gave Jacob a maid; the maids bore four sons: Dan, Naphtali, Gad, Asher (30:3-13)
const S4 = [K(12.7, 12.7, P3(-4.1, 1.25, .5), -8, 8, 3.0, { dy: 300 }), K(12.7, 15.2, P3(-3.0, 1.25, .5), 0, 8, 3.2, { dy: 300 }), K(12.7, 17.4, P3(-2.0, 1.3, .5), 8, 8, 3.4, { dy: 300 })];
const S5 = [K(17.2, 17.2, P3(-4.2, .9, .4), -12, 10, 2.6, { dy: 300 }), K(17.2, 19.0, P3(-3.0, 1.1, .4), -2, 10, 4.0, { dy: 300 }), K(17.2, 21.2, P3(-1.2, 1.3, .4), 14, 9, 3.2, { dy: 300 })];
// b2 (21.15-25.44) Leah bore two more sons, Issachar and Zebulun, and a daughter, Dinah (30:17-21)
const S6 = [K(20.9, 20.9, P3(-2.4, 1.0, .5), -16, 14, 3.8, { dy: 300 }), K(20.9, 25.2, P3(-2.0, .8, .45), -6, 13, 3.0, { dy: 300 })];
// c1 (26.29-33.56) then God remembered Rachel; she bore a son and called him Joseph (30:22-24); God is shown only as a shaft of light
const S7 = [K(26.0, 26.0, P3(-4.3, 1.85, .9), 10, 3, 3.6, { dy: 300 }), K(26.0, 29.8, P3(-4.3, 1.9, .8), 4, 5, 2.2, { dy: 300 })];
const S8 = [K(29.6, 29.6, P3(-4.3, 1.9, .75), -18, 5, 2.2, { dy: 300 }), K(29.6, 32.0, P3(-4.0, 1.85, .7), -8, 5, 2.4, { dy: 300 }), K(29.6, 34.6, P3(-4.0, 1.85, .7), 12, 6, 3.2, { dy: 300 })];
// d1 (34.26-44.26) Jacob asked Laban to let him go home with his wives and children; Laban said the Lord had blessed him because of Jacob and bade him name his wages (30:25-28)
const S9 = [K(34.0, 34.0, P3(-2.4, 1.75, .7), 30, 5, 4.4, { dy: 300 }), K(34.0, 38.8, P3(-3.0, 1.8, .7), 8, 5, 3.2, { dy: 300 })];
const S10 = [K(38.6, 38.6, P3(-2.3, 1.75, .8), -28, 4, 2.0, { dy: 300 }), K(38.6, 41.6, P3(-2.3, 1.75, .8), -34, 4, 1.8, { dy: 300 }), K(38.6, 44.8, P3(-3.0, 1.8, .8), -10, 5, 2.8, { dy: 300 })];
// d2 (44.81-53.59) Jacob asked for the dark lambs and the spotted goats as his wages; Laban agreed, and sent those animals three days away (30:32-36)
const S11 = [K(44.4, 44.4, P3(6.0, -1.6, .4), -22, 16, 9.0, { dy: 300 }), K(44.4, 49.2, P3(5.6, -1.3, .4), -12, 10, 5.4, { dy: 300 })];
const S12 = [K(49.0, 49.0, P3(4.9, -.8, .7), -34, 6, 3.2, { dy: 300 }), K(49.0, 52.8, P3(5.2, -.9, .7), -10, 6, 3.8, { dy: 300 })];
const S13 = [K(52.4, 52.4, P3(8.0, -1.0, .35), -20, 9, 5.6, { dy: 300 }), K(52.4, 54.6, P3(10.0, .2, .35), -14, 8, 6.4, { dy: 300 })];
// e1 (54.19-59.99) Jacob's flocks grew and he became very rich, with servants, camels and donkeys (30:43)
const S14 = [K(54.2, 54.2, P3(5.4, -2.6, .5), 20, 8, 6.0, { dy: 300 }), K(54.2, 57.0, P3(7.4, -2.4, .6), 12, 12, 8.0, { dy: 300 }), K(54.2, 61.0, P3(9.0, -2.4, .7), 4, 18, 9.5, { dy: 300 })];
const LBL = [[0, .4], [14, .42], [24, .46], [27, .56], [34, .5], [44, .45], [46, .42], [56, .46], [60, .46]], LSC = [[0, .06], [26, .04], [34, .05], [46, .03], [60, .03]], LVG = [[0, .5], [60, .55]];
"""

i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('plea', S2, { xin: .5 }), landShot('answer', S3, { xin: .5 }), landShot('maids', S4, { xin: .5 }), landShot('sons', S5, { xin: .5 }), landShot('more', S6, { xin: .5 }),
  landShot('remembered', S7, { xin: .6 }), landShot('joseph', S8, { xin: .6 }), landShot('asks', S9, { xin: .5 }), landShot('wages', S10, { xin: .5 }), landShot('pasture', S11, { xin: .6 }), landShot('agree', S12, { xin: .5 }), landShot('away', S13, { xin: .5 }), landShot('rich', S14, { xin: .5 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['RACHEL ENVIED', 'HER SISTER'], a: 1.0, b: 5.2, y: 390, size: 100, glow: 1, maxW: 980 },
  { l: ['GIVE ME CHILDREN,', 'OR I WILL DIE'], a: 5.8, b: 8.3, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['AM I GOD?'], a: 9.0, b: 12.4, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['TWO MAIDS,', 'FOUR SONS'], a: 13.1, b: 20.3, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['TWO MORE SONS', 'AND A DAUGHTER'], a: 21.4, b: 25.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['GOD REMEMBERED', 'RACHEL'], a: 26.6, b: 33.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['LET ME GO', 'HOME'], a: 34.5, b: 38.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THE LORD BLESSED ME', 'BECAUSE OF YOU'], a: 39.2, b: 44.0, y: 330, size: 84, glow: 1, maxW: 980 },
  { l: ['THE DARK LAMBS', 'AND SPOTTED GOATS'], a: 45.0, b: 49.2, y: 330, size: 84, glow: 1, maxW: 980 },
  { l: ['THREE DAYS', 'AWAY'], a: 51.0, b: 53.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['JACOB BECAME', 'VERY RICH'], a: 54.7, b: 59.2, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['LONGING AND', 'COMPARING'], a: 61.8, b: 66.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['IN THE RIVALRY,', 'GOD REMEMBERED'], a: 67.3, b: 71.9, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['WAITING IS NOT', 'BEING FORGOTTEN'], a: 72.7, b: 78.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['LET GO', 'OF THE COUNT'], a: 79.5, b: 84.8, y: 330, size: 108, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 30', .6, 5.0, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 30:1', 2.6, 5.6, 596, { size: 36, track: 12 });
  [['GENESIS 30:2', 9.1, 12.4], ['GENESIS 30:3–13', 13.2, 20.3], ['GENESIS 30:17–21', 21.5, 25.2], ['GENESIS 30:22–24', 26.7, 33.4], ['GENESIS 30:25–28', 34.6, 44.0], ['GENESIS 30:31–36', 45.1, 53.8], ['GENESIS 30:43', 54.8, 59.2]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.9, 65.2, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main30.js', 'w').write(out)
print('main30.js', len(out))
