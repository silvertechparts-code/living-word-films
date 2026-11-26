#!/usr/bin/env python3
# Builds g11/src/main31.js from main30.js (shared page machinery copied) plus the Ep31 shots, titles and reference lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main30.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
i, _ = cut('// windows follow the narration beats')
head = t[:i]
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
head = rep(head, 'Episode 30 - Genesis 30.', 'Episode 31 - Genesis 31.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s30.js'" % m, "'./%s31.js'" % m)
head = rep(head, 'const { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH } = stage;', 'const { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH, CAMP, HEAP } = stage;')

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 6.66, b1 14.49, b2 22.04, c1 27.72, c2 36.44, d1 46.21, e1 54.41
// a1 (0.6-5.9) after twenty years with Laban the Lord told Jacob: go back to the land of your fathers, and I will be with you (31:3); God is shown only as a shaft of light
const S1 = [K(0, 0, P3(-1.5, -2.6, .5), 22, 16, 8.2, { dy: 300 }), K(0, 3.7, P3(-1.6, -2.7, .5), 14, 12, 6.0, { dy: 300 })];
const S2 = [K(3.2, 3.2, P3(-.6, -2.45, .62), 14, 6, 3.2, { dy: 300 }), K(3.2, 7.0, P3(-.58, -2.45, .62), 4, 5, 2.5, { dy: 300 })];
// a2 (6.66-13.74) Jacob left in secret with his wives, children and flocks; Rachel stole her father's household gods (31:17-21)
const S3 = [K(6.4, 6.4, P3(-3.8, 1.3, .5), 36, 8, 3.8, { dy: 300 }), K(6.4, 8.8, P3(-3.2, 1.4, .5), 34, 8, 4.6, { dy: 300 }), K(6.4, 10.9, P3(-1.4, 1.3, .5), 28, 8, 5.2, { dy: 300 })];
const S4 = [K(10.4, 10.4, P3(-5.1, .8, .5), 24, 5, 2.4, { dy: 300 }), K(10.4, 12.4, P3(-5.1, .7, .45), 22, 5, 1.7, { dy: 300 }), K(10.4, 13.6, P3(-4.5, 1.1, .5), 14, 5, 2.0, { dy: 300 }), K(10.4, 14.6, P3(-3.9, 1.4, .5), 8, 5, 2.6, { dy: 300 })];
// b1 (14.49-21.29) Laban chased them for seven days; in a dream God warned him to be careful what he said to Jacob (31:22-24)
const S5 = [K(14.3, 14.3, P3(-3.2, 1.2, .5), 40, 5, 3.6, { dy: 300 }), K(14.3, 15.8, P3(-.5, .9, .5), 40, 5, 3.6, { dy: 300 }), K(14.3, 17.5, P3(2.4, -.1, .5), 40, 5, 4.2, { dy: 300 })];
const S6 = [K(17.2, 17.2, P3(2.6, 3.6, .3), 24, 14, 5.0, { dy: 300 }), K(17.2, 19.4, P3(3.0, 3.9, .2), 12, 10, 3.2, { dy: 300 }), K(17.2, 22.0, P3(3.2, 3.9, .2), 6, 22, 3.6, { dy: 300 })];
// b2 (22.04-26.97) Laban asked Jacob why he fled in secret and why he stole his gods (31:26-30)
const S7 = [K(21.6, 21.6, P3(5.6, -1.1, .55), -8, 6, 3.6, { dy: 300 }), K(21.6, 25.0, P3(5.7, -1.1, .55), 4, 6, 2.8, { dy: 300 })];
const S8 = [K(24.7, 24.7, P3(4.85, -1.15, .62), 36, 4, 2.4, { dy: 300 }), K(24.7, 28.0, P3(4.85, -1.15, .62), 32, 4, 2.2, { dy: 300 })];
// c1 (27.72-35.69) Jacob: whoever has them will not live (he did not know Rachel had taken them); Laban searched and found nothing (31:31-35)
const S9 = [K(27.6, 27.6, P3(6.5, -1.15, .62), -48, 5, 2.2, { dy: 300 }), K(27.6, 31.0, P3(6.5, -1.15, .62), -34, 5, 2.0, { dy: 300 })];
const S10 = [K(30.8, 30.8, P3(7.0, -2.2, .5), 0, 8, 5.8, { dy: 300 }), K(30.8, 33.4, P3(8.0, -2.2, .5), 6, 8, 4.9, { dy: 300 }), K(30.8, 36.0, P3(9.6, -1.9, .5), 8, 8, 3.8, { dy: 300 })];
// c2 (36.44-45.46) Jacob answered: twenty years I served you, you changed my wages ten times; without God you would have sent me away empty (31:36-42)
const S11 = [K(35.7, 35.7, P3(6.7, -1.15, .62), -35, 4, 2.4, { dy: 300 }), K(35.7, 40.8, P3(6.7, -1.15, .62), -30, 4, 2.3, { dy: 300 })];
const S12 = [K(40.6, 40.6, P3(6.5, -1.15, .7), -28, 2, 2.4, { dy: 300 }), K(40.6, 43.6, P3(6.5, -1.15, .7), -16, 5, 2.0, { dy: 300 }), K(40.6, 46.6, P3(6.55, -1.1, .8), -6, 9, 2.6, { dy: 300 })];
// d1 (46.21-53.66) they piled up stones as a witness; Laban: the Lord watch between us when we are out of each other's sight (31:44-49)
const S13 = [K(46.0, 46.0, P3(5.6, -1.0, .45), 16, 9, 5.6, { dy: 300 }), K(46.0, 48.4, P3(5.6, -1.0, .45), 6, 8, 4.4, { dy: 300 }), K(46.0, 50.6, P3(5.6, -1.0, .45), -4, 7, 3.8, { dy: 300 })];
const S14 = [K(50.2, 50.2, P3(5.6, -1.1, .6), -10, 4, 4.6, { dy: 300 }), K(50.2, 54.6, P3(5.6, -1.1, .6), 6, 4, 3.6, { dy: 300 })];
// e1 (54.41-59.64) next morning Laban kissed his grandchildren and daughters, blessed them, and went home (31:55)
const S15 = [K(54.2, 54.2, P3(7.7, -.9, .5), 18, 6, 3.0, { dy: 300 }), K(54.2, 58.4, P3(8.2, -.9, .5), 8, 7, 3.4, { dy: 300 })];
const S16 = [K(57.8, 57.8, P3(5.0, -1.0, .6), 12, 7, 4.0, { dy: 300 }), K(57.8, 60.0, P3(3.0, -.6, .6), 16, 8, 4.6, { dy: 300 }), K(57.8, 61.8, P3(1.2, -.1, .6), 22, 9, 5.4, { dy: 300 })];
const LBL = [[0, .4], [10, .42], [17, .5], [22, .46], [30, .45], [41, .52], [47, .45], [54, .46], [60, .46]], LSC = [[0, .06], [17, .04], [24, .05], [47, .03], [60, .03]], LVG = [[0, .5], [60, .55]];
"""

i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('go', S2, { xin: .5 }), landShot('leave', S3, { xin: .5 }), landShot('steal', S4, { xin: .5 }), landShot('chase', S5, { xin: .5 }), landShot('dream', S6, { xin: .5 }), landShot('meet', S7, { xin: .5 }), landShot('accuse', S8, { xin: .5 }),
  landShot('oath', S9, { xin: .5 }), landShot('search', S10, { xin: .5 }), landShot('grief', S11, { xin: .5 }), landShot('light', S12, { xin: .5 }), landShot('stones', S13, { xin: .5 }), landShot('pact', S14, { xin: .5 }), landShot('kiss', S15, { xin: .5 }), landShot('home', S16, { xin: .5 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['TWENTY YEARS', 'WITH LABAN'], a: 1.0, b: 5.4, y: 390, size: 100, glow: 1, maxW: 980 },
  { l: ['LEAVING', 'IN SECRET'], a: 7.2, b: 13.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['LABAN CHASED', 'SEVEN DAYS'], a: 14.9, b: 18.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['GOD WARNED HIM', 'IN A DREAM'], a: 19.0, b: 22.0, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['WHY DID YOU', 'STEAL MY GODS?'], a: 22.5, b: 27.2, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['WHOEVER HAS THEM', 'WILL NOT LIVE'], a: 28.2, b: 32.8, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['LABAN SEARCHED,', 'FOUND NOTHING'], a: 33.1, b: 35.8, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['TWENTY YEARS,', 'TEN CHANGES'], a: 36.9, b: 41.6, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['GOD WAS', 'ON MY SIDE'], a: 42.2, b: 45.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A HEAP OF STONES', 'AS WITNESS'], a: 46.6, b: 50.8, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['THE LORD WATCH', 'BETWEEN US'], a: 51.3, b: 54.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['BLESSED THEM,', 'WENT HOME'], a: 54.9, b: 59.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['TWENTY YEARS', 'OF HARD WORK'], a: 61.8, b: 66.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['GOD SAW', 'HIS HARDSHIP'], a: 67.3, b: 71.9, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['GOD SEES WHAT', 'NO ONE NOTICES'], a: 72.7, b: 78.4, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['TELL GOD', 'WHAT NO ONE SAW'], a: 79.5, b: 84.8, y: 330, size: 96, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 31', .6, 5.0, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 31:3', 2.6, 5.6, 596, { size: 36, track: 12 });
  [['GENESIS 31:17–21', 7.3, 13.0], ['GENESIS 31:22–24', 15.0, 22.0], ['GENESIS 31:26–30', 22.6, 27.2], ['GENESIS 31:31–35', 28.3, 35.8], ['GENESIS 31:36–42', 37.0, 45.8], ['GENESIS 31:44–49', 46.7, 54.1], ['GENESIS 31:55', 55.0, 59.4]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.9, 65.2, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main31.js', 'w').write(out)
print('main31.js', len(out))
