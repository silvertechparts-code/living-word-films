#!/usr/bin/env python3
# Builds g11/src/main40.js from main39.js (shared page machinery copied) plus the Ep40 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main39.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 39 - Genesis 39.', 'Episode 40 - Genesis 40.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s39.js'" % m, "'./%s40.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.9, b1 17.6, b2 25.6, c1 32.1, c2 42.1, d1 48.0, d2 52.6, e1 58.0
// phases of the world: 0-4.6 the guards bring the two men to the prison gate | 4.6-8.4 Joseph attends them with a jar of water | 8.4-12.4 night: the three sleep, two dream | 12.4-17.4 morning: faces downcast, Joseph asks why | 17.4-25.4 they answer; Joseph: interpretations belong to God | 25.4-28.4 the vine (dream) | 28.4-32 the cup (dream) | 32-41.9 Joseph interprets, asks to be remembered | 41.9-47.7 the baskets and the birds (dream) | 47.7-51.9 Joseph tells the baker | 51.8-56 the third day, Pharaoh's birthday (the baker is not shown) | 55.9-58 the empty mats | 57.9-61.6 Joseph alone at the gate at dusk
// a1 (0.6-8.06) Pharaoh's cupbearer and baker offended him and were put in the prison where Joseph was held; Joseph attended them (40:1-4)
const S1 = [K(0, 0, P3(-3.4, -2.4, .3), 25, 14, 2.2, { dy: 60 }), K(0, 4.7, P3(-3.4, -3.2, .3), 8, 16, 1.9, { dy: 60 })];
const S2 = [K(4.6, 4.6, P3(-3.4, -4.6, .32), -45, 15, 1.45, { dy: 60 }), K(4.6, 8.5, P3(-3.4, -4.6, .32), -38, 15, 1.25, { dy: 60 })];
// a2 (8.9-16.75) one night each man had a dream; in the morning Joseph saw their faces downcast and asked why (40:5-7)
const S3 = [K(8.4, 8.4, P3(-3.4, -4.7, .15), -25, 22, 2.3, { dy: 60 }), K(8.4, 12.5, P3(-3.4, -4.7, .15), -32, 25, 1.9, { dy: 60 })];
const S4 = [K(12.4, 12.4, P3(-3.4, -4.5, .3), -50, 16, 1.45, { dy: 60 }), K(12.4, 15.1, P3(-3.4, -4.5, .3), -44, 16, 1.25, { dy: 60 })];
const S5 = [K(15.0, 15.0, P3(-3.4, -4.6, .38), 55, 14, 1.25, { dy: 60 }), K(15.0, 17.5, P3(-3.4, -4.6, .38), 48, 14, 1.1, { dy: 60 })];
// b1 (17.6-24.8) they said: we dreamed, and no one can explain it; Joseph said: interpretations belong to God. Tell me (40:8)
const S6 = [K(17.4, 17.4, P3(-3.4, -4.5, .3), -78, 14, 1.5, { dy: 60 }), K(17.4, 21.1, P3(-3.4, -4.5, .3), -68, 14, 1.3, { dy: 60 })];
const S7 = [K(21.0, 21.0, P3(-3.4, -4.62, .42), 72, 6, 1.05, { dy: 60 }), K(21.0, 25.5, P3(-3.4, -4.62, .42), 62, 6, .88, { dy: 60 })];
// b2 (25.6-31.28) the cupbearer dreamed of a vine with three branches (40:9-10), and put Pharaoh's cup into Pharaoh's hand (40:11)
const S8 = [K(25.4, 25.4, [-3.3, 2.85, -4.8], 0, -14, 1.9, { dy: 60 }), K(25.4, 28.5, [-3.3, 2.85, -4.8], 0, -14, 1.5, { dy: 60 })];
const S9 = [K(28.4, 28.4, [-3.3, 2.75, -4.8], 0, -10, 1.35, { dy: 60 }), K(28.4, 32.1, [-3.3, 2.75, -4.8], 12, -10, 1.1, { dy: 60 })];
// c1 (32.1-41.26) Joseph said: in three days Pharaoh will restore you (40:12-13); remember me and speak for me (40:14); I did nothing to deserve this prison (40:15)
const S10 = [K(32.0, 32.0, P3(-3.5, -4.55, .32), -40, 16, 1.35, { dy: 60 }), K(32.0, 35.7, P3(-3.5, -4.55, .32), -32, 16, 1.15, { dy: 60 })];
const S11 = [K(35.6, 35.6, P3(-3.55, -4.62, .4), 60, 15, 1.0, { dy: 60 }), K(35.6, 38.7, P3(-3.55, -4.62, .4), 52, 15, .85, { dy: 60 })];
const S12 = [K(38.6, 38.6, P3(-3.4, -4.6, .3), 35, 20, 1.5, { dy: 60 }), K(38.6, 42.0, P3(-3.4, -4.6, .3), 22, 26, 2.9, { dy: 60 })];
// c2 (42.1-47.09) the baker dreamed of three baskets on his head (40:16) and birds eating from the top one (40:17)
const S13 = [K(41.9, 41.9, [-3.3, 3.05, -4.8], 0, -10, 1.0, { dy: 60 }), K(41.9, 44.8, [-3.3, 3.05, -4.8], 0, -10, .8, { dy: 60 })];
const S14 = [K(44.7, 44.7, [-3.3, 3.0, -4.8], 22, -6, 1.3, { dy: 60 }), K(44.7, 47.8, [-3.3, 3.0, -4.8], 12, -6, 1.1, { dy: 60 })];
// d1 (48.0-51.76) Joseph said: in three days Pharaoh will have you executed (40:18-19)
const S15 = [K(47.7, 47.7, P3(-3.15, -4.5, .34), -55, 16, 1.15, { dy: 60 }), K(47.7, 52.0, P3(-3.15, -4.5, .34), -45, 16, 1.0, { dy: 60 })];
// d2 (52.6-57.15) on the third day, Pharaoh's birthday, it happened as Joseph had said (40:20-22): the cup is put into Pharaoh's hand; the baker is not shown
const S16 = [K(51.8, 51.8, P3(-5.85, -.62, .3), 68, 8, 1.5, { dy: 60 }), K(51.8, 56.1, P3(-5.85, -.62, .32), 58, 8, 1.2, { dy: 60 })];
const S17 = [K(55.9, 55.9, P3(-3.4, -4.45, .1), 10, 28, 1.7, { dy: 60 }), K(55.9, 58.1, P3(-3.4, -4.45, .1), 4, 30, 1.9, { dy: 60 })];
// e1 (58.0-59.79) the cupbearer did not remember Joseph; he forgot him (40:23): Joseph alone at the gate at dusk
const S18 = [K(57.9, 57.9, P3(-3.3, -4.1, .35), 4, 8, 1.6, { dy: 60 }), K(57.9, 61.7, P3(-3.3, -4.3, .35), 10, 30, 2.6, { dy: 60 })];
const LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
LANDSHOT += r"""const NIGHT = { light: [[0, LK('#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#0e1636', '#2a3466']]], bloom: [[0, .78]], scrim: [[0, 0]], vig: [[0, .62]] };
const COOL = { light: [[0, LK('#a8b4cc', '#5a5060', .95, '#e8d0b8', 2.0, [9, 3.0, -5], .5, '#c8d0e0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#7a8cb0', '#d8c8b4']]] };
const DUSK = { light: [[0, LK('#8a82a8', '#3a3248', .95, '#d89080', 1.9, [-10, 1.4, -4], .56, '#9a98d0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#2a3270', '#d08060']]], bloom: [[0, .78]], scrim: [[0, .02]], vig: [[0, .62]] };
"""
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('attend', S2, { xin: 0 }), landShot('night', S3, { xin: 0, ...NIGHT }), landShot('morn', S4, { xin: 0 }), landShot('ask', S5, { xin: 0 }), landShot('tell', S6, { xin: 0 }), landShot('hand', S7, { xin: 0 }), landShot('vine', S8, { xin: 0, ...DREAM }), landShot('cup', S9, { xin: 0, ...DREAM }),
  landShot('restore', S10, { xin: 0 }), landShot('remember', S11, { xin: 0 }), landShot('nothing', S12, { xin: 0 }), landShot('baskets', S13, { xin: 0, ...DREAM }), landShot('birds', S14, { xin: 0, ...DREAM }), landShot('doom', S15, { xin: 0, ...COOL }), landShot('feast', S16, { xin: 0 }), landShot('empty', S17, { xin: 0, ...COOL }),
  landShot('forgot', S18, { xin: 0, ...DUSK }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ["PHARAOH'S CUPBEARER", 'AND BAKER'], a: 1.0, b: 4.6, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['JOSEPH', 'ATTENDED THEM'], a: 5.3, b: 8.1, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['ONE NIGHT,', 'TWO DREAMS'], a: 9.1, b: 12.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THEIR FACES', 'WERE DOWNCAST'], a: 12.6, b: 14.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['WHY ARE YOU', 'SAD TODAY?'], a: 15.1, b: 17.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['NO ONE CAN', 'EXPLAIN IT'], a: 17.9, b: 21.1, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['INTERPRETATIONS', 'BELONG TO GOD'], a: 21.6, b: 25.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['A VINE WITH', 'THREE BRANCHES'], a: 25.9, b: 28.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ["PHARAOH'S CUP IN", "PHARAOH'S HAND"], a: 28.9, b: 31.9, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['IN THREE DAYS', 'YOU WILL BE RESTORED'], a: 32.4, b: 35.4, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['REMEMBER ME,', 'AND SPEAK FOR ME'], a: 35.8, b: 38.5, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['I DID NOTHING TO', 'DESERVE THIS PRISON'], a: 38.9, b: 41.6, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['THREE BASKETS', 'ON HIS HEAD'], a: 42.4, b: 44.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['BIRDS ATE FROM', 'THE TOP ONE'], a: 45.2, b: 47.7, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['JOSEPH SAID:', 'IN THREE DAYS'], a: 48.3, b: 51.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THE THIRD DAY', "PHARAOH'S BIRTHDAY"], a: 52.3, b: 55.0, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['JUST AS JOSEPH', 'HAD SAID'], a: 55.3, b: 57.7, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THE CUPBEARER', 'FORGOT JOSEPH'], a: 58.2, b: 60.3, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE NOTICED TWO', 'DOWNCAST FACES'], a: 62.0, b: 65.5, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['HE STOPPED', 'AND ASKED'], a: 66.0, b: 69.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['BEING FORGOTTEN', 'HURTS'], a: 69.8, b: 71.7, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['KINDNESS IS NOT', 'WORTH LESS'], a: 72.0, b: 73.9, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['KINDNESS WHILE', 'YOU ARE HURTING'], a: 74.3, b: 78.4, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['NOTICE WHO', 'LOOKS HEAVY'], a: 79.8, b: 84.8, y: 330, size: 104, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 40', .6, 4.6, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 40:1–3', 1.4, 4.4, 540, { size: 34, track: 11 });
  [['GENESIS 40:4', 5.5, 8.1], ['GENESIS 40:5', 9.3, 12.0], ['GENESIS 40:6–7', 12.8, 14.8], ['GENESIS 40:7', 15.3, 17.4], ['GENESIS 40:8', 18.1, 21.1], ['GENESIS 40:8', 21.8, 25.2], ['GENESIS 40:9–10', 26.1, 28.4], ['GENESIS 40:11', 29.1, 31.9], ['GENESIS 40:12–13', 32.6, 35.4], ['GENESIS 40:14', 36.0, 38.5], ['GENESIS 40:15', 39.1, 41.6], ['GENESIS 40:16', 42.6, 44.8], ['GENESIS 40:17', 45.4, 47.7], ['GENESIS 40:18–19', 48.5, 51.6], ['GENESIS 40:20', 52.5, 55.0], ['GENESIS 40:22', 55.5, 57.7], ['GENESIS 40:23', 58.4, 60.3]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 40:6–7', 62.1, 65.5, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 40:7', 66.1, 69.0, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 40:23', 69.9, 73.9, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 40:7', 74.4, 78.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 79.9, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + t[cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')[0]:cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')[1]] + r"""const NIGHT = { light: [[0, LK('#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [-9, 5.5, -3], .62, '#7a8cd0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#0e1636', '#2a3466']]], bloom: [[0, .78]], scrim: [[0, 0]], vig: [[0, .62]] };
const COOL = { light: [[0, LK('#a8b4cc', '#5a5060', .95, '#e8d0b8', 2.0, [9, 3.0, -5], .5, '#c8d0e0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#7a8cb0', '#d8c8b4']]] };
const DUSK = { light: [[0, LK('#8a82a8', '#3a3248', .95, '#d89080', 1.9, [-10, 1.4, -4], .56, '#9a98d0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#2a3270', '#d08060']]], bloom: [[0, .78]], scrim: [[0, .02]], vig: [[0, .62]] };
""" + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main40.js', 'w').write(out)
print('main40.js', len(out))
