#!/usr/bin/env python3
# Builds g11/src/main36.js from main35.js (shared page machinery copied) plus the Ep36 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main35.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 35 - Genesis 35.', 'Episode 36 - Genesis 36.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s35.js'" % m, "'./%s36.js'" % m)
head = rep(head, 'const { gAt, CITY, JD, HEAP, OAK, BETH, RACH, PIL, CAMPC, PATH } = stage;', 'const { gAt, CITY, JD, OAK, JC, SEIR, HOR, CAMPC, PATH } = stage;')

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 6.2, b1 14.5, b2 21.8, c1 31.6, c2 40.1, d1 45.8, e1 53.0
// phases of the world (who stands where): A 0-6.4 Esau at his camp | B 6.4-14.7 his wives and children | C 14.7-21.9 the herds of two houses on one land | D 21.9-31.6 the caravan goes east to Seir | E 31.6-40.0 the clans on the hill | F 40.0-45.8 the people of Seir before him | G 45.8-52.9 the halls of the kings | H 52.9-61.8 the clans and their places at night
// a1 (0.6-6.1) this is the family line of Esau, who is also called Edom, the brother of Jacob (36:1): the camp at golden hour, Esau standing in front of his tents
const S1 = [K(0, 0, P3(-4.7, .3, .55), 60, 8, 3.6, { dy: 60 }), K(0, 5.9, P3(-4.7, .3, .6), 65, 6, 2.3, { dy: 60 })];
// a2 (6.6-14.0) Esau took three wives, two Canaanite women and Ishmael's daughter Basemath (36:2-3); they bore him sons in Canaan (36:5)
const S2 = [K(5.7, 5.7, P3(-4.9, .3, .5), 5, 7, 3.2, { dy: 60 }), K(5.7, 10.4, P3(-4.9, .1, .5), -20, 6, 2.8, { dy: 60 })];
const S3 = [K(10.2, 10.2, P3(-5.0, .5, .4), 15, 6, 3.6, { dy: 60 }), K(10.2, 14.9, P3(-4.9, .5, .4), 35, 7, 3.1, { dy: 60 })];
// b1 (14.8-21.1) his household and herds grew so large that the land could not hold his and Jacob's together (36:7)
const S4 = [K(14.4, 14.4, P3(-5.4, 2.2, .5), -20, 10, 4.5, { dy: 60 }), K(14.4, 18.8, P3(-5.0, 2.0, .5), 30, 10, 5.5, { dy: 60 })];
const S5 = [K(18.4, 18.4, P3(-4.2, -.5, .6), 125, 20, 8.0, { dy: 60 }), K(18.4, 22.0, P3(-4.6, -.2, .6), 145, 22, 8.8, { dy: 60 })];
// b2 (22.0-30.95) Esau took his wives, his children and all his livestock and went to the hill country of Seir, away from his brother Jacob (36:6-8)
const S6 = [K(21.7, 21.7, P3(-2.4, 1.0, .6), 75, 8, 5.0, { dy: 60 }), K(21.7, 26.4, P3(1.6, 1.3, .6), 80, 8, 5.2, { dy: 60 })];
const S7 = [K(26.2, 26.2, P3(4.2, 2.5, .7), -35, 10, 6.4, { dy: 60 }), K(26.2, 29.8, P3(6.4, 3.6, .7), -30, 10, 6.0, { dy: 60 })];
// c1 (31.8-39.45) there his family grew; the text names his sons and grandsons (36:9-14), and they became chiefs of clans in Edom (36:15-19)
const S8 = [K(29.6, 29.6, P3(10.2, 5.4, .9), -35, 12, 7.0, { dy: 60 }), K(29.6, 34.8, P3(11.0, 5.8, .9), -15, 10, 5.8, { dy: 60 })];
const S9 = [K(34.6, 34.6, P3(11.2, 5.5, .9), 15, 10, 5.6, { dy: 60 }), K(34.6, 39.8, P3(11.2, 5.5, .9), 30, 8, 4.6, { dy: 60 })];
// c2 (40.3-45.03) the people who lived in Seir before him, and their clans (36:20-30): a small camp in the valley, their own fires
const S10 = [K(39.6, 39.6, P3(5.6, 8.2, .5), -35, 12, 7.0, { dy: 60 }), K(39.6, 43.6, P3(5.5, 8.4, .5), 25, 12, 5.4, { dy: 60 })];
const S11 = [K(43.4, 43.4, P3(5.4, 8.6, .55), 30, 7, 4.2, { dy: 60 }), K(43.4, 46.0, P3(5.4, 8.6, .55), 18, 6, 3.5, { dy: 60 })];
// d1 (46.0-51.95) the kings who ruled in Edom before any king ruled over the Israelites (36:31-39): a walled town, its torches lit, windows lighting one after another
const S12 = [K(45.8, 45.8, P3(8.3, .4, .8), -60, 14, 8.0, { dy: 60 }), K(45.8, 49.6, P3(8.0, .3, .8), -66, 11, 7.0, { dy: 60 })];
const S13 = [K(49.4, 49.4, P3(6.4, .3, .8), -86, 6, 4.2, { dy: 60 }), K(49.4, 53.0, P3(6.6, .3, .8), -80, 5, 3.4, { dy: 60 })];
// e1 (53.2-59.64) the chapter closes with the clans of Esau by their families and the places where they lived (36:40-43): night, a fire in each camp
const S14 = [K(52.9, 52.9, P3(11.2, 5.4, .9), -30, 10, 5.4, { dy: 60 }), K(52.9, 57.2, P3(11.0, 5.4, .9), -60, 12, 6.0, { dy: 60 })];
const S15 = [K(57.0, 57.0, P3(7.4, 4.0, .6), -70, 16, 12, { dy: 60 }), K(57.0, 61.8, P3(7.4, 4.0, .6), -60, 18, 15.5, { dy: 60 })];
const LBL = [[0, .45], [14, .5], [31, .55], [38, .65], [43, .78], [52, .7], [60, .62]], LSC = [[0, .05], [30, .05], [40, 0], [60, .03]], LVG = [[0, .5], [38, .56], [43, .62], [52, .58], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('camp', S1, { xin: 0 }), landShot('wives', S2, { xin: .5 }), landShot('sons', S3, { xin: .5 }), landShot('herds', S4, { xin: .5 }), landShot('land', S5, { xin: .5 }), landShot('leave', S6, { xin: 0 }), landShot('ford', S7, { xin: .5 }),
  landShot('seir', S8, { xin: 0 }), landShot('chiefs', S9, { xin: .5 }), landShot('before', S10, { xin: .6 }), landShot('fires', S11, { xin: .5 }), landShot('kings', S12, { xin: 0 }), landShot('gate', S13, { xin: .5 }), landShot('clans', S14, { xin: 0 }), landShot('places', S15, { xin: .5 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['THE FAMILY', 'OF ESAU'], a: 1.0, b: 5.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ESAU TOOK', 'THREE WIVES'], a: 6.7, b: 11.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['SONS BORN', 'IN CANAAN'], a: 11.9, b: 14.5, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HIS HOUSEHOLD', 'AND HERDS GREW'], a: 15.0, b: 18.4, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['TOO MANY FOR', 'ONE LAND'], a: 18.8, b: 21.6, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['ESAU MOVED TO', 'THE HILLS OF SEIR'], a: 22.3, b: 27.0, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['AWAY FROM', 'HIS BROTHER'], a: 27.4, b: 31.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HIS FAMILY', 'GREW'], a: 31.9, b: 35.5, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['CHIEFS OF', 'CLANS IN EDOM'], a: 35.9, b: 39.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['THE PEOPLE OF SEIR', 'BEFORE HIM'], a: 40.4, b: 45.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['KINGS RULED', 'IN EDOM'], a: 46.1, b: 49.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['BEFORE ANY KING', 'OVER ISRAEL'], a: 49.9, b: 52.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THE CLANS', 'OF ESAU'], a: 53.4, b: 56.8, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['THEIR FAMILIES', 'AND THEIR PLACES'], a: 57.1, b: 60.2, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['AFTER PEACE,', 'SEPARATE WAYS'], a: 62.0, b: 67.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['TOO MANY HERDS', 'FOR ONE LAND'], a: 68.3, b: 72.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['PEACE IS NOT ALWAYS', 'SIDE BY SIDE'], a: 73.3, b: 78.8, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['PRAY FOR SOMEONE', 'YOU PARTED FROM'], a: 79.8, b: 84.8, y: 330, size: 96, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 36', .6, 5.5, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 36:1', 1.4, 5.5, 540, { size: 34, track: 11 });
  [['GENESIS 36:2–3', 6.8, 11.4], ['GENESIS 36:5', 12.0, 14.5], ['GENESIS 36:7', 15.1, 21.6], ['GENESIS 36:6–7', 22.4, 27.0], ['GENESIS 36:8', 27.5, 31.2], ['GENESIS 36:9–14', 32.0, 35.5], ['GENESIS 36:15–19', 36.0, 39.6], ['GENESIS 36:20–30', 40.5, 45.4], ['GENESIS 36:31–39', 46.2, 49.6], ['GENESIS 36:31', 50.0, 52.8], ['GENESIS 36:40', 53.5, 56.8], ['GENESIS 36:43', 57.2, 60.2]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 36:6–8', 62.1, 67.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 36:7', 68.4, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 79.9, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main36.js', 'w').write(out)
print('main36.js', len(out))
