#!/usr/bin/env python3
# Builds g11/src/main37.js from main36.js (shared page machinery copied) plus the Ep37 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main36.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 36 - Genesis 36.', 'Episode 37 - Genesis 37.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s36.js'" % m, "'./%s37.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 6.9, b1 14.3, b2 21.6, c1 27.0, c2 34.0, d1 43.0, d2 47.8, e1 55.2
// phases of the world (who stands where): 0-4.6 Jacob gives the robe | 4.6-7.0 Joseph in the robe | 7.0-9.8 the brothers watch him pass | 9.8-14.4 the dream | 14.4-18.4 the rebuke | 18.4-21.5 he walks to his brothers | 21.5-25.0 the brothers see him coming | 25.0-27.0 they speak together | 27.0-30.2 Reuben speaks, Joseph is surrounded | 30.2-33.7 robe taken, lowered into the pit | 33.7-36.6 Judah speaks, traders arrive | 36.6-39.0 Joseph drawn from the pit | 39.0-43.2 the sale | 43.2-47.7 the robe dipped in blood | 47.7-51.3 Jacob receives it | 51.3-55.2 Jacob mourns | 55.2-61.8 the caravan reaches a walled town at dusk
// a1 (0.6-6.1) Joseph was seventeen; Jacob loved him most and gave him a fine robe (37:2-3): the camp at golden hour
const S1 = [K(0, 0, P3(-4.7, .5, .22), 65, 6, 1.7, { dy: 60 }), K(0, 4.7, P3(-4.7, .5, .22), 55, 6, 1.4, { dy: 60 })];
const S2 = [K(4.6, 4.6, P3(-4.6, .5, .22), 30, 6, 1.7, { dy: 60 }), K(4.6, 7.1, P3(-4.6, .5, .22), 12, 6, 1.35, { dy: 60 })];
// a2 (6.9-13.5) his brothers hated him (37:4); Joseph dreamed the sun, the moon and eleven stars bowed down to him (37:9)
const S3 = [K(7.0, 7.0, P3(-2.5, -.1, .25), 25, 6, 2.7, { dy: 60 }), K(7.0, 9.9, P3(-2.3, -.1, .25), 15, 6, 2.4, { dy: 60 })];
const S4 = [K(9.8, 9.8, P3(-4.55, 1.6, 1.4), 8, 8, 3.9, { dy: 60 }), K(9.8, 14.5, P3(-4.55, 1.6, .85), -5, 8, 3.0, { dy: 60 })];
// b1 (14.3-20.9) his father rebuked him but kept the matter in mind (37:10-11); Jacob sent him to his brothers (37:13)
const S5 = [K(14.4, 14.4, P3(-4.7, .5, .22), -25, 6, 1.8, { dy: 60 }), K(14.4, 18.6, P3(-4.7, .5, .22), -15, 6, 1.5, { dy: 60 })];
const S6 = [K(18.4, 18.4, P3(-2.8, 1.15, .25), 75, 6, 2.0, { dy: 60 }), K(18.4, 21.6, P3(-0.4, 1.15, .25), 65, 6, 1.8, { dy: 60 })];
// b2 (21.6-26.0) the brothers see him coming: Here comes that dreamer (37:18-20)
const S7 = [K(21.5, 21.5, P3(10.8, 5.5, .45), -50, 5, 3.0, { dy: 60 }), K(21.5, 25.1, P3(10.8, 5.5, .45), -45, 5, 2.6, { dy: 60 })];
const S8 = [K(25.0, 25.0, P3(10.5, 5.5, .45), -60, 5, 2.4, { dy: 60 }), K(25.0, 27.1, P3(10.5, 5.5, .45), -50, 5, 2.1, { dy: 60 })];
// c1 (27.0-33.0) Reuben said do not take his life (37:21-22); they stripped off his robe and threw him into an empty pit (37:23-24)
const S9 = [K(27.0, 27.0, P3(9.6, 5.3, .45), 20, 8, 2.0, { dy: 60 }), K(27.0, 30.3, P3(9.6, 5.3, .45), 12, 8, 1.8, { dy: 60 })];
const S10 = [K(30.2, 30.2, P3(10.0, 5.8, .2), -35, 22, 2.6, { dy: 60 }), K(30.2, 33.8, P3(10.0, 5.8, .2), -25, 20, 2.3, { dy: 60 })];
// c2 (34.0-41.2) Judah said let us sell him (37:26-27); Joseph was drawn up from the pit and sold for twenty pieces of silver (37:28)
const S11 = [K(33.7, 33.7, P3(10.4, 6.4, .45), 60, 10, 3.2, { dy: 60 }), K(33.7, 36.7, P3(10.4, 6.4, .45), 50, 10, 2.8, { dy: 60 })];
const S12 = [K(36.6, 36.6, P3(10.05, 5.95, .15), 70, 24, 2.0, { dy: 60 }), K(36.6, 39.1, P3(10.05, 5.95, .15), 85, 20, 1.7, { dy: 60 })];
const S13 = [K(39.0, 39.0, P3(9.45, 6.85, .35), -35, 10, 2.0, { dy: 60 }), K(39.0, 43.3, P3(9.45, 6.85, .35), -45, 10, 1.8, { dy: 60 })];
// d1 (43.0-46.9) they dipped his robe in the blood of a goat and sent it to Jacob (37:31-32): dusk at the hill fire
const S14 = [K(43.2, 43.2, P3(11.3, 5.9, .4), -40, 9, 2.2, { dy: 60 }), K(43.2, 47.8, P3(11.3, 5.9, .4), -55, 9, 1.9, { dy: 60 })];
// d2 (47.8-54.2) Jacob knew the robe, tore his clothes and mourned for many days; he refused to be comforted (37:33-35): night at the camp
const S15 = [K(47.7, 47.7, P3(-4.3, .9, .45), 50, 7, 2.4, { dy: 60 }), K(47.7, 51.4, P3(-4.3, .9, .45), 40, 7, 2.0, { dy: 60 })];
const S16 = [K(51.3, 51.3, P3(-4.4, .6, .4), 38, 10, 3.0, { dy: 60 }), K(51.3, 55.3, P3(-4.4, .6, .4), 30, 10, 2.4, { dy: 60 })];
// e1 (55.2-57.8) in Egypt the traders sold Joseph to Potiphar (37:36): the caravan reaches a walled town at dusk
const S17 = [K(55.2, 55.2, P3(-0.9, 1.15, .4), 58, 8, 3.4, { dy: 60 }), K(55.2, 58.5, P3(-0.2, 1.15, .4), 52, 8, 3.2, { dy: 60 })];
const S18 = [K(58.4, 58.4, P3(2.8, .6, .55), -35, 9, 7.0, { dy: 60 }), K(58.4, 61.8, P3(2.8, .6, .55), -25, 9, 7.4, { dy: 60 })];
const LBL = [[0, .45], [14, .5], [31, .55], [38, .65], [43, .78], [52, .7], [60, .62]], LSC = [[0, .05], [30, .05], [40, 0], [60, .03]], LVG = [[0, .5], [38, .56], [43, .62], [52, .58], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const DREAM = { light: [[0, LK('#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.4, [9, 5.5, -3], .62, '#7a8cd0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#070c24', '#1a2a5a']]] };
const SHOTS = [
  landShot('camp', S1, { xin: 0 }), landShot('robe', S2, { xin: 0 }), landShot('envy', S3, { xin: 0 }), landShot('dream', S4, { xin: 0, ...DREAM }), landShot('rebuke', S5, { xin: 0 }), landShot('road', S6, { xin: .4 }), landShot('coming', S7, { xin: 0 }),
  landShot('plot', S8, { xin: 0 }), landShot('reuben', S9, { xin: 0 }), landShot('pit', S10, { xin: 0 }), landShot('judah', S11, { xin: 0 }), landShot('drawn', S12, { xin: 0 }), landShot('sale', S13, { xin: 0 }), landShot('blood', S14, { xin: 0 }), landShot('news', S15, { xin: 0 }), landShot('mourn', S16, { xin: 0 }), landShot('egypt', S17, { xin: 0 }), landShot('gate', S18, { xin: 0 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['JOSEPH WAS', 'SEVENTEEN'], a: 1.0, b: 4.2, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['A FINE ROBE', 'FROM JACOB'], a: 4.8, b: 6.9, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HIS BROTHERS', 'HATED HIM'], a: 7.3, b: 9.7, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THE SUN, MOON,', 'ELEVEN STARS'], a: 10.3, b: 14.1, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HIS FATHER', 'REBUKED HIM'], a: 14.8, b: 18.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['SENT TO', 'HIS BROTHERS'], a: 18.6, b: 21.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HERE COMES', 'THE DREAMER'], a: 22.0, b: 26.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['DO NOT TAKE', 'HIS LIFE'], a: 27.4, b: 30.3, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['INTO AN', 'EMPTY PIT'], a: 30.7, b: 33.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['LET US', 'SELL HIM'], a: 34.3, b: 37.5, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['TWENTY PIECES', 'OF SILVER'], a: 38.0, b: 41.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['THE ROBE IN', "THE GOAT'S BLOOD"], a: 43.4, b: 47.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['JACOB MOURNED', 'FOR HIS SON'], a: 48.3, b: 51.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['REFUSED TO BE', 'COMFORTED'], a: 51.9, b: 54.8, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['SOLD IN EGYPT', 'TO POTIPHAR'], a: 55.5, b: 60.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HATRED GREW', 'IN STEPS'], a: 62.0, b: 67.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['ENVY BEGINS', 'IN A CLOSED HEART'], a: 68.3, b: 72.6, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['MEET ENVY', 'WHILE IT IS SMALL'], a: 73.3, b: 78.4, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['SAY ONE KIND', 'WORD TODAY'], a: 79.8, b: 84.8, y: 330, size: 108, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 37', .6, 4.4, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 37:2', 1.4, 4.2, 540, { size: 34, track: 11 });
  [['GENESIS 37:3', 5.0, 6.9], ['GENESIS 37:4', 7.5, 9.7], ['GENESIS 37:5–9', 10.5, 14.1], ['GENESIS 37:10–11', 15.0, 18.0], ['GENESIS 37:13–17', 18.8, 21.2], ['GENESIS 37:18–20', 22.2, 26.4], ['GENESIS 37:21–22', 27.6, 30.3], ['GENESIS 37:23–24', 30.9, 33.6], ['GENESIS 37:26–27', 34.5, 37.5], ['GENESIS 37:28', 38.2, 41.6], ['GENESIS 37:31–32', 43.6, 47.2], ['GENESIS 37:33–34', 48.5, 51.6], ['GENESIS 37:35', 52.1, 54.8], ['GENESIS 37:36', 55.7, 60.2]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 37:4–18', 62.1, 67.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 37:4', 68.4, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 37:11', 73.4, 78.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 79.9, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main37.js', 'w').write(out)
print('main37.js', len(out))
