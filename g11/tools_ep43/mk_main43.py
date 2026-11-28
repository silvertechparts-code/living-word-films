#!/usr/bin/env python3
# Builds g11/src/main43.js from main42.js (shared page machinery copied) plus the Ep43 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main42.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 42 - Genesis 42.', 'Episode 43 - Genesis 43.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s42.js'" % m, "'./%s43.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.7, b1 17.1, b2 26.2, c1 31.3, c2 42.4, d1 48.7, d2 54.1
// phases of the world: 0-6.9 Jacob tells his sons to buy food | 6.9-17.1 Judah steps out and pledges | 17.1-24.8 gifts, double silver, Jacob's prayer | 24.8-26.4 the road | 26.35-31.3 Joseph sees Benjamin, orders a meal | 31.3-39.4 the brothers afraid, the steward | 39.4-42 Simeon comes out | 42-48 Joseph comes home | 48-54 he hurries out and weeps | 54-57 he washes his face | 57-61.8 the meal
const S1 = [K(0, 0, P3(3.4, -6.0, .4), -28, 16, 6.8, { dy: 60 }), K(0, 3.05, P3(3.6, -6.0, .4), -18, 14, 5.4, { dy: 60 })];
const S2 = [K(2.95, 2.95, P3(3.6, -5.2, .42), 4, 17, 3.2, { dy: 60 }), K(2.95, 7.0, P3(3.6, -5.25, .42), 0, 15, 2.6, { dy: 60 })];
const S3 = [K(6.85, 6.85, P3(3.45, -4.9, .4), 78, 8, 2.1, { dy: 60 }), K(6.85, 11.0, P3(3.5, -5.1, .4), 68, 8, 1.7, { dy: 60 })];
const S4 = [K(10.85, 10.85, P3(3.4, -5.55, .4), 75, 8, 1.5, { dy: 60 }), K(10.85, 14.1, P3(3.4, -5.55, .4), 70, 8, 1.25, { dy: 60 })];
const S5 = [K(13.95, 13.95, P3(3.42, -5.0, .42), 72, 6, 1.15, { dy: 60 }), K(13.95, 17.3, P3(3.42, -5.0, .42), 68, 6, .95, { dy: 60 })];
const S6 = [K(17.1, 17.1, P3(3.4, -3.4, .25), -25, 22, 4.0, { dy: 60 }), K(17.1, 20.7, P3(3.0, -3.3, .25), -15, 20, 3.0, { dy: 60 })];
const S7 = [K(20.55, 20.55, P3(3.6, -5.3, .4), 75, 8, 1.7, { dy: 60 }), K(20.55, 25.0, P3(3.6, -5.3, .4), 70, 8, 1.2, { dy: 60 })];
const S8 = [K(24.85, 24.85, P3(3.0, .7, .3), -78, 8, 2.8, { dy: 60 }), K(24.85, 26.5, P3(2.2, .8, .3), -78, 9, 2.5, { dy: 60 })];
const S9 = [K(26.35, 26.35, P3(-5.5, -.3, .4), 55, 7, 1.5, { dy: 60 }), K(26.35, 29.1, P3(-5.5, -.3, .4), 50, 7, 1.2, { dy: 60 })];
const S10 = [K(28.95, 28.95, P3(-5.85, -.85, .42), 75, 7, 1.5, { dy: 60 }), K(28.95, 31.5, P3(-5.85, -.85, .42), 70, 7, 1.2, { dy: 60 })];
const S11 = [K(31.3, 31.3, P3(-3.2, -.9, .3), -40, 10, 2.0, { dy: 60 }), K(31.3, 35.5, P3(-3.2, -.9, .3), -35, 10, 1.7, { dy: 60 })];
const S12 = [K(35.35, 35.35, P3(-4.05, -1.0, .35), 80, 8, 1.5, { dy: 60 }), K(35.35, 39.5, P3(-4.05, -1.0, .35), 74, 8, 1.2, { dy: 60 })];
const S13 = [K(39.35, 39.35, P3(-3.3, -3.7, .3), 20, 8, 2.4, { dy: 60 }), K(39.35, 42.1, P3(-3.3, -3.5, .3), 14, 8, 2.0, { dy: 60 })];
const S14 = [K(41.95, 41.95, P3(-5.5, -.7, .3), 40, 18, 2.8, { dy: 60 }), K(41.95, 45.5, P3(-5.5, -.7, .3), 34, 16, 2.4, { dy: 60 })];
const S15 = [K(45.35, 45.35, P3(-5.55, -.27, .4), 138, 6, 1.2, { dy: 60 }), K(45.35, 48.1, P3(-5.55, -.27, .4), 132, 6, .95, { dy: 60 })];
const S16 = [K(47.95, 47.95, P3(-6.0, -.7, .35), 20, 12, 2.0, { dy: 60 }), K(47.95, 51.3, P3(-6.2, -.85, .35), 25, 10, 1.5, { dy: 60 })];
const S17 = [K(51.15, 51.15, P3(-6.38, -1.0, .33), 80, 5, 1.0, { dy: 60 }), K(51.15, 54.3, P3(-6.38, -1.0, .33), 74, 5, .8, { dy: 60 })];
const S18 = [K(54.15, 54.15, P3(-6.05, -1.62, .3), 30, 10, 1.1, { dy: 60 }), K(54.15, 57.0, P3(-6.05, -1.62, .3), 40, 10, .95, { dy: 60 })];
const S19 = [K(56.85, 56.85, P3(-4.9, -.62, .2), 60, 34, 3.0, { dy: 60 }), K(56.85, 61.9, P3(-4.95, -.62, .2), 52, 30, 2.4, { dy: 60 })];
const LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('famine', S1, { xin: 0 }), landShot('send', S2, { xin: 0 }), landShot('judah', S3, { xin: 0 }), landShot('pledge', S4, { xin: 0 }), landShot('blame', S5, { xin: 0 }), landShot('gifts', S6, { xin: 0 }), landShot('prayer', S7, { xin: 0 }), landShot('road', S8, { xin: 0 }), landShot('saw', S9, { xin: 0 }), landShot('order', S10, { xin: 0 }),
  landShot('fear', S11, { xin: 0 }), landShot('steward', S12, { xin: 0 }), landShot('simeon', S13, { xin: 0 }), landShot('home', S14, { xin: 0 }), landShot('gracious', S15, { xin: 0 }), landShot('hurry', S16, { xin: 0 }), landShot('weep', S17, { xin: 0 }), landShot('wash', S18, { xin: 0 }), landShot('meal', S19, { xin: 0 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['THE FAMINE', 'GREW WORSE'], a: .7, b: 2.8, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['GO BACK AND', 'BUY FOOD'], a: 3.4, b: 6.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['JUDAH', 'STEPS FORWARD'], a: 7.5, b: 10.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['I WILL BE', 'RESPONSIBLE'], a: 11.0, b: 13.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['“LET ME BEAR', 'THE BLAME”'], a: 14.0, b: 16.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['GIFTS AND', 'DOUBLE SILVER'], a: 17.4, b: 20.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['MAY GOD GRANT', 'YOU MERCY'], a: 21.5, b: 24.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JOSEPH SAW', 'BENJAMIN'], a: 26.7, b: 28.8, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['A MEAL', 'IS ORDERED'], a: 29.3, b: 31.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THE SILVER IN', 'THEIR SACKS'], a: 31.8, b: 34.9, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['PEACE TO YOU,', 'DO NOT BE AFRAID'], a: 35.7, b: 38.8, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['SIMEON', 'COMES OUT'], a: 40.0, b: 41.7, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['JOSEPH', 'CAME HOME'], a: 42.5, b: 44.8, y: 330, size: 120, glow: 1, maxW: 980 },
  { l: ['“GOD BE GRACIOUS', 'TO YOU, MY SON”'], a: 46.0, b: 47.8, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['HE HURRIED', 'OUT'], a: 49.0, b: 50.9, y: 330, size: 120, glow: 1, maxW: 980 },
  { l: ['HE WEPT', 'IN PRIVATE'], a: 51.8, b: 53.7, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['HE WASHED', 'HIS FACE'], a: 54.5, b: 56.4, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['BENJAMIN’S PORTION', 'FIVE TIMES LARGER'], a: 58.2, b: 60.5, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['ONCE: “LET US', 'SELL HIM”'], a: 62.0, b: 64.3, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['NOW: I WILL BE', 'RESPONSIBLE'], a: 64.5, b: 66.7, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['IT SHOWS', 'WHAT HE RISKED'], a: 69.9, b: 72.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['CHARACTER SHOWS IN', 'WHAT WE CARRY'], a: 73.3, b: 77.0, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['TAKE RESPONSIBILITY', 'FOR SOMEONE'], a: 79.0, b: 81.9, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['WHO DEPENDS', 'ON YOU'], a: 82.2, b: 84.9, y: 330, size: 116, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 43', .6, 4.6, 252, { size: 28, track: 7 });
  [['GENESIS 43:1', .9, 2.8], ['GENESIS 43:2', 3.5, 6.3], ['GENESIS 43:8', 7.6, 10.4], ['GENESIS 43:9', 11.1, 13.3], ['GENESIS 43:9', 14.1, 16.8], ['GENESIS 43:11–12', 17.5, 20.2], ['GENESIS 43:14', 21.6, 24.4], ['GENESIS 43:16', 26.8, 28.8], ['GENESIS 43:16', 29.4, 31.0], ['GENESIS 43:18', 31.9, 34.9], ['GENESIS 43:23', 35.8, 38.8], ['GENESIS 43:23', 40.1, 41.7], ['GENESIS 43:26', 42.6, 44.8], ['GENESIS 43:29', 46.1, 47.8], ['GENESIS 43:30', 49.1, 50.9], ['GENESIS 43:30', 51.9, 53.7], ['GENESIS 43:31', 54.6, 56.4], ['GENESIS 43:34', 58.3, 60.5]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 37:27', 62.1, 64.3, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 43:9', 64.6, 66.7, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 73.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main43.js', 'w').write(out)
print('main43.js', len(out))
