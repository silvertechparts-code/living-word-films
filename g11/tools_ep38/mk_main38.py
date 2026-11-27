#!/usr/bin/env python3
# Builds g11/src/main38.js from main37.js (shared page machinery copied) plus the Ep38 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main37.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 37 - Genesis 37.', 'Episode 38 - Genesis 38.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s37.js'" % m, "'./%s38.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.6, b1 16.8, b2 25.8, c1 31.2, c2 41.5, d1 49.2, d2 56.2
// phases of the world (who stands where): 0-4.6 the wedding | 4.6-6.5 Er at the door, the lamp goes out | 6.5-8.6 Tamar a widow | 8.6-12.2 Judah tells Onan | 12.2-14.2 Onan turns away | 14.2-16.8 the lamp goes out again | 16.8-20.4 Judah tells Tamar | 20.4-22.8 she goes to her father's house | 22.8-25.8 Judah and Shelah | 25.8-27.0 years pass | 27.0-28.4 Shelah grown | 28.4-31.4 Tamar waits | 31.4-34.2 the veil | 34.2-36.6 the road | 36.6-37.8 Judah does not know her | 37.8-41.8 the seal, cord and staff | 41.8-45.0 Judah is told | 45.0-47.6 bring her out | 47.6-49.4 she is led out | 49.4-51.8 she holds out the seal, cord and staff | 51.8-54.8 Judah owns it | 54.8-58.9 the twins | 58.9-61.8 morning
// a1 (0.6-8.6) Judah gave his firstborn Er a wife, Tamar (38:6); Er displeased the Lord and the Lord took his life (38:7): the camp at golden hour, the lamp at the door
const S1 = [K(0, 0, P3(-4.5, .5, .3), 62, 6, 1.6, { dy: 60 }), K(0, 4.7, P3(-4.5, .5, .25), 54, 6, 1.3, { dy: 60 })];
const S2 = [K(4.6, 4.6, P3(-5.1, .6, .25), 60, 5, 1.5, { dy: 60 }), K(4.6, 6.6, P3(-5.1, .6, .25), 52, 5, 1.2, { dy: 60 })];
const S3 = [K(6.5, 6.5, P3(-5.1, .58, .2), 45, 4, 1.4, { dy: 60 }), K(6.5, 8.7, P3(-5.1, .58, .2), 36, 4, 1.15, { dy: 60 })];
// a2 (8.6-16.8) Judah told Onan to marry his brother's widow (38:8); Onan would not give her a child and the Lord took his life too (38:9-10)
const S4 = [K(8.6, 8.6, P3(-4.5, .55, .25), 58, 6, 1.75, { dy: 60 }), K(8.6, 12.3, P3(-4.5, .55, .25), 48, 6, 1.4, { dy: 60 })];
const S5 = [K(12.2, 12.2, P3(-4.5, .88, .2), 22, 5, 1.25, { dy: 60 }), K(12.2, 14.3, P3(-4.5, .88, .2), 10, 5, 1.05, { dy: 60 })];
const S6 = [K(14.2, 14.2, P3(-5.2, .72, .15), 75, 6, 1.6, { dy: 60 }), K(14.2, 16.9, P3(-5.2, .72, .15), 64, 6, 1.3, { dy: 60 })];
// b1 (16.8-25.8) Judah told Tamar to stay a widow in her father's house until Shelah was grown (38:11); he feared Shelah would die too
const S7 = [K(16.8, 16.8, P3(-3.95, .6, .25), 34, 6, 1.9, { dy: 60 }), K(16.8, 20.5, P3(-3.95, .6, .25), 24, 6, 1.55, { dy: 60 })];
const S8 = [K(20.4, 20.4, P3(-3.9, -1.5, .2), 56, 8, 2.8, { dy: 60 }), K(20.4, 22.9, P3(-3.7, -2.6, .2), 50, 8, 2.4, { dy: 60 })];
const S9 = [K(22.8, 22.8, P3(-3.6, .7, .28), 38, 5, 1.6, { dy: 60 }), K(22.8, 25.9, P3(-3.6, .7, .28), 28, 5, 1.3, { dy: 60 })];
// b2 (25.8-31.4) years passed; Shelah grew up, but Tamar was not given to him (38:14)
const S10 = [K(25.8, 25.8, P3(-4.0, .6, .5), 40, 12, 6.2, { dy: 60 }), K(25.8, 27.1, P3(-4.0, .6, .5), 58, 10, 5.6, { dy: 60 })];
const S11 = [K(27.0, 27.0, P3(-3.4, .45, .32), 32, 4, 1.6, { dy: 60 }), K(27.0, 28.5, P3(-3.4, .45, .32), 22, 4, 1.3, { dy: 60 })];
const S12 = [K(28.4, 28.4, P3(-3.35, -4.15, .22), -14, 5, 1.8, { dy: 60 }), K(28.4, 31.5, P3(-3.35, -4.15, .22), -28, 5, 1.4, { dy: 60 })];
// c1 (31.2-41.8) she covered her face with a veil and sat by the road (38:14); Judah did not know her (38:15); he left his seal, cord and staff (38:18)
const S13 = [K(31.4, 31.4, P3(-3.35, -4.15, .24), -30, 4, 1.15, { dy: 60 }), K(31.4, 34.3, P3(-3.35, -4.15, .24), -40, 4, .95, { dy: 60 })];
const S14 = [K(34.2, 34.2, P3(3.4, .9, .3), -78, 6, 2.6, { dy: 60 }), K(34.2, 36.7, P3(3.5, 1.0, .3), -70, 6, 2.1, { dy: 60 })];
const S15 = [K(36.6, 36.6, P3(3.55, 1.0, .34), -62, 4, 1.6, { dy: 60 }), K(36.6, 37.9, P3(3.6, 1.1, .34), -58, 4, 1.35, { dy: 60 })];
const S16 = [K(37.8, 37.8, P3(3.6, 1.5, .1), -40, 9, 1.0, { dy: 60 }), K(37.8, 41.9, P3(4.0, 1.1, .35), -48, 10, 3.2, { dy: 60 })];
// c2 (41.5-49.4) three months later Judah heard Tamar was pregnant and said: bring her out, and let her be burned (38:24): dusk at the gate
const S17 = [K(41.8, 41.8, P3(4.6, .5, .3), -48, 6, 2.4, { dy: 60 }), K(41.8, 45.1, P3(4.6, .5, .3), -42, 6, 1.8, { dy: 60 })];
const S18 = [K(45.0, 45.0, P3(4.7, .55, .3), -8, 6, 1.5, { dy: 60 }), K(45.0, 47.7, P3(4.7, .55, .3), -18, 6, 1.3, { dy: 60 })];
const S19 = [K(47.6, 47.6, P3(5.3, .3, .3), -32, 8, 2.8, { dy: 60 }), K(47.6, 49.5, P3(5.2, .3, .3), -30, 8, 2.4, { dy: 60 })];
// d1 (49.2-54.6) she sent him the seal, cord and staff (38:25); Judah said she is more in the right than he (38:26)
const S20 = [K(49.4, 49.4, P3(4.95, .3, .27), -72, 5, 1.5, { dy: 60 }), K(49.4, 51.9, P3(4.95, .3, .27), -68, 5, 1.2, { dy: 60 })];
const S21 = [K(51.8, 51.8, P3(4.6, .6, .33), -15, 4, 1.3, { dy: 60 }), K(51.8, 54.9, P3(4.6, .6, .33), -24, 4, 1.05, { dy: 60 })];
// d2 (56.2-61.8) Tamar gave birth to twins, Perez and Zerah (38:27-30): morning at her father's house
const S22 = [K(54.8, 54.8, P3(-3.4, -4.2, .25), 30, 8, 3.0, { dy: 60 }), K(54.8, 59.0, P3(-3.4, -4.25, .2), 24, 6, 1.3, { dy: 60 })];
const S23 = [K(58.9, 58.9, P3(-3.4, -4.0, .3), 35, 10, 4.5, { dy: 60 }), K(58.9, 61.8, P3(-3.4, -4.0, .3), 58, 22, 8.0, { dy: 60 })];
const LBL = [[0, .45], [14, .5], [31, .55], [38, .65], [43, .78], [52, .7], [60, .62]], LSC = [[0, .05], [30, .05], [40, 0], [60, .03]], LVG = [[0, .5], [38, .56], [43, .62], [52, .58], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const DAWN = { light: [[0, LK('#c0b4c0', '#6a5448', .95, '#ffc890', 2.4, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#6a8ec8', '#f8d4a0']]] };
const SHOTS = [
  landShot('wed', S1, { xin: 0 }), landShot('door', S2, { xin: 0 }), landShot('widow', S3, { xin: 0 }), landShot('judah', S4, { xin: 0 }), landShot('onan', S5, { xin: 0 }), landShot('lamp', S6, { xin: 0 }), landShot('tell', S7, { xin: 0 }), landShot('away', S8, { xin: 0 }), landShot('worry', S9, { xin: 0 }),
  landShot('years', S10, { xin: 0 }), landShot('grown', S11, { xin: 0 }), landShot('father', S12, { xin: 0 }), landShot('veil', S13, { xin: 0 }), landShot('road', S14, { xin: 0 }), landShot('knew', S15, { xin: 0 }), landShot('left', S16, { xin: 0 }), landShot('told', S17, { xin: 0 }), landShot('burn', S18, { xin: 0 }), landShot('led', S19, { xin: 0 }), landShot('offer', S20, { xin: 0 }), landShot('owns', S21, { xin: 0 }),
  landShot('birth', S22, { xin: .5, ...DAWN }), landShot('rise', S23, { xin: 0, ...DAWN }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['THE FIRSTBORN ER', 'AND TAMAR'], a: 1.0, b: 4.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['THE LORD TOOK', "ER'S LIFE"], a: 4.9, b: 8.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['MARRY YOUR', "BROTHER'S WIDOW"], a: 9.0, b: 12.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ONAN WOULD NOT', 'GIVE HER A CHILD'], a: 12.6, b: 16.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['STAY A WIDOW', 'TILL SHELAH GROWS'], a: 17.1, b: 20.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['JUDAH FEARED', 'SHELAH WOULD DIE'], a: 20.9, b: 25.6, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['YEARS', 'PASSED'], a: 26.0, b: 28.2, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['SHE WAS NOT', 'GIVEN TO HIM'], a: 28.6, b: 31.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A VEIL', 'OVER HER FACE'], a: 31.7, b: 34.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['SHE SAT', 'BY THE ROAD'], a: 34.6, b: 37.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['SEAL, CORD', 'AND STAFF'], a: 37.9, b: 41.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THREE MONTHS', 'LATER'], a: 42.2, b: 44.8, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['BRING HER OUT', 'LET HER BE BURNED'], a: 45.3, b: 48.6, y: 330, size: 90, glow: 1, maxW: 980 },
  { l: ['SHE SENT HIM', 'HIS OWN SEAL'], a: 49.6, b: 52.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['MORE IN THE', 'RIGHT THAN I'], a: 52.6, b: 54.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['TWINS:', 'PEREZ AND ZERAH'], a: 56.3, b: 60.0, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HE HAD KEPT', 'SHELAH FROM HER'], a: 62.0, b: 67.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HE DID NOT ARGUE', 'HE ADMITTED IT'], a: 68.3, b: 72.6, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['IT TAKES COURAGE', 'TO ADMIT A WRONG'], a: 73.3, b: 78.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['MAKE IT RIGHT', 'IF YOU CAN'], a: 79.8, b: 84.8, y: 330, size: 108, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 38', .6, 4.4, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 38:6', 1.4, 4.2, 540, { size: 34, track: 11 });
  [['GENESIS 38:7', 5.1, 8.2], ['GENESIS 38:8', 9.2, 12.2], ['GENESIS 38:9–10', 12.8, 16.1], ['GENESIS 38:11', 17.3, 20.4], ['GENESIS 38:11', 21.1, 25.6], ['GENESIS 38:14', 26.2, 28.2], ['GENESIS 38:14', 28.8, 31.2], ['GENESIS 38:14', 31.9, 34.0], ['GENESIS 38:14–16', 34.8, 37.4], ['GENESIS 38:18', 38.1, 41.6], ['GENESIS 38:24', 42.4, 44.8], ['GENESIS 38:24', 45.5, 48.6], ['GENESIS 38:25', 49.8, 52.0], ['GENESIS 38:26', 52.8, 54.6], ['GENESIS 38:27–30', 56.5, 60.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 38:11', 62.1, 67.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 38:25–26', 68.4, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 38:26', 73.4, 78.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 79.9, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main38.js', 'w').write(out)
print('main38.js', len(out))
