#!/usr/bin/env python3
# Builds g11/src/main35.js from main34.js (shared page machinery copied) plus the Ep35 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main34.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 34 - Genesis 34.', 'Episode 35 - Genesis 35.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s34.js'" % m, "'./%s35.js'" % m)
head = rep(head, 'const { gAt, CITY, GX, GZ, JD, CAMPC, PATH } = stage;', 'const { gAt, CITY, JD, HEAP, OAK, BETH, RACH, PIL, CAMPC, PATH } = stage;')

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 6.2, b1 15.7, b2 22.4, c1 30.4, c2 39.0, d1 46.6, e1 53.7
// phases of the world (who stands where): P1 0-21.7 camp and the road east | P2 21.7-29.9 Bethel | P3 29.9-46.5 the road west to the lone tent | P4 46.5-52.9 the bier and the pillar | P5 52.9-57.0 Isaac | P6 57.0-61.8 the bier carried away; shots change at these times by a hard cut
// a1 (0.6-6.2) God tells Jacob to go up to Bethel and make an altar there (35:1): God is shown only as light
const S1 = [K(0, 0, P3(-4.7, .35, .6), 30, 10, 4.5, { dy: 120 }), K(0, 5.4, P3(-4.7, .35, .55), 45, 6, 1.9, { dy: 90 })];
// a2 (6.2-15.7) Jacob tells his household to put away the foreign gods (35:2); they give him the gods and the rings in their ears, and he buries them under the oak (35:4)
const S2 = [K(5.2, 5.2, P3(-4.3, -.4, .5), 30, 10, 3.4, { dy: 110 }), K(5.2, 11.9, P3(-4.3, -.4, .5), 60, 8, 2.7, { dy: 100 })];
const S3 = [K(11.5, 11.5, P3(-3.5, -1.75, .5), 25, 7, 2.4, { dy: 130 }), K(11.5, 15.3, P3(-3.5, -1.75, .45), 22, 8, 2.0, { dy: 130 })];
// b1 (15.7-22.4) a terror from God fell on the towns around them, and no one pursued (35:5)
const S4 = [K(14.9, 14.9, P3(-2.2, 1.2, .6), -86, 7, 6.0, { dy: 300 }), K(14.9, 18.6, P3(.6, 1.2, .6), -84, 7, 5.4, { dy: 300 })];
const S5 = [K(18.4, 18.4, P3(1.2, 1.0, .6), 24, 24, 7.5, { dy: 300 }), K(18.4, 21.8, P3(2.6, 1.6, .5), 40, 18, 6.4, { dy: 300 })];
// b2 (22.4-30.4) Jacob builds an altar at Bethel (35:6-7); God appears to him again, blesses him and says "your name shall be Israel" (35:9-10)
const S6 = [K(21.7, 21.7, P3(10.0, 5.2, .55), -10, 8, 3.8, { dy: 60 }), K(21.7, 25.8, P3(10.0, 5.2, .55), 5, 8, 3.2, { dy: 60 })];
const S7 = [K(25.4, 25.4, P3(11.9, 5.3, .5), -5, 6, 3.2, { dy: 100 }), K(25.4, 30.0, P3(11.9, 5.3, .5), 10, 6, 2.6, { dy: 100 })];
// c1 (30.4-39.0) they travel on; near Ephrath Rachel is in hard labor; the midwife says "do not be afraid, you will have another son" (35:16-17)
const S8 = [K(29.9, 29.9, P3(.4, 1.5, .6), 152, 13, 6.6, { dy: 300 }), K(29.9, 34.2, P3(-.6, 1.7, .6), 160, 11, 4.8, { dy: 300 })];
const S9 = [K(33.8, 33.8, P3(-1.6, 1.9, .55), 176, 7, 3.2, { dy: 300 }), K(33.8, 38.6, P3(-1.7, 1.95, .55), 168, 6, 2.6, { dy: 300 })];
// c2 (39.0-46.6) Rachel dies; she named the boy Ben-oni, but his father named him Benjamin (35:18). The death is not shown: the film holds on the tent and the lamp
const S10 = [K(38.4, 38.4, P3(-1.7, 2.2, .5), 160, 5, 2.8, { dy: 130 }), K(38.4, 42.6, P3(-1.7, 2.2, .5), 168, 5, 2.4, { dy: 130 })];
const S11 = [K(42.2, 42.2, P3(-1.7, 2.2, .5), 170, 5, 2.4, { dy: 130 }), K(42.2, 46.7, P3(-1.7, 2.2, .5), 158, 4, 1.9, { dy: 130 })];
// d1 (46.6-53.7) he buried her on the road to Ephrath, that is Bethlehem, and set up a pillar over her grave (35:19-20). The grave is not shown
const S12 = [K(46.5, 46.5, P3(-2.5, 1.45, .6), 150, 8, 4.0, { dy: 120 }), K(46.5, 50.0, P3(-1.7, 1.2, .6), 148, 7, 3.2, { dy: 120 })];
const S13 = [K(49.7, 49.7, P3(-1.1, .45, .6), 150, 6, 3.0, { dy: 120 }), K(49.7, 53.0, P3(-1.1, .45, .6), 158, 6, 1.9, { dy: 120 })];
// e1 (53.7-61.8) Jacob came home to his father Isaac; Isaac died, old and full of days; his sons Esau and Jacob buried him (35:27-29)
const S14 = [K(52.9, 52.9, P3(-6.6, 2.1, .4), 40, 5, 2.6, { dy: 120 }), K(52.9, 57.1, P3(-6.5, 2.1, .4), 60, 5, 1.7, { dy: 120 })];
const S15 = [K(57.0, 57.0, P3(-2.4, 1.3, .6), 150, 7, 3.4, { dy: 120 }), K(57.0, 61.8, P3(-.6, 1.2, .6), 150, 7, 3.2, { dy: 120 })];
const LBL = [[0, .45], [12, .5], [26, .62], [31, .5], [38.5, .7], [43, .78], [47, .66], [52, .55], [60, .5]], LSC = [[0, .05], [34, .05], [41, 0], [60, .03]], LVG = [[0, .5], [38, .56], [43, .62], [52, .55], [60, .55]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('call', S1, { xin: 0 }), landShot('cloth', S2, { xin: .5 }), landShot('oak', S3, { xin: .5 }), landShot('road', S4, { xin: .5 }), landShot('ford', S5, { xin: .5 }), landShot('climb', S6, { xin: 0 }), landShot('altar', S7, { xin: .5 }),
  landShot('travel', S8, { xin: 0 }), landShot('labor', S9, { xin: .5 }), landShot('night', S10, { xin: .6 }), landShot('child', S11, { xin: .5 }), landShot('bier', S12, { xin: 0 }), landShot('pillar', S13, { xin: .5 }), landShot('isaac', S14, { xin: 0 }), landShot('carry', S15, { xin: 0 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['GO UP TO BETHEL', 'BUILD AN ALTAR'], a: 1.0, b: 5.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['PUT AWAY THE', 'FOREIGN GODS'], a: 6.6, b: 11.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['BURIED UNDER', 'THE OAK'], a: 11.6, b: 15.2, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['A TERROR FROM GOD', 'NO ONE PURSUED'], a: 16.1, b: 21.3, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['AN ALTAR', 'AT BETHEL'], a: 22.4, b: 26.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['YOUR NAME', 'IS ISRAEL'], a: 26.6, b: 29.8, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['NEAR EPHRATH', 'RACHEL IN LABOR'], a: 30.7, b: 34.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['DO NOT FEAR', 'ANOTHER SON'], a: 35.3, b: 38.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['RACHEL', 'DIED'], a: 39.5, b: 42.8, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['BEN-ONI', 'BECAME BENJAMIN'], a: 43.2, b: 46.4, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['BURIED ON THE ROAD', 'TO EPHRATH'], a: 46.9, b: 50.3, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['A PILLAR OVER', 'HER GRAVE'], a: 50.7, b: 53.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JACOB CAME HOME', 'TO ISAAC'], a: 54.0, b: 57.0, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ESAU AND JACOB', 'BURIED HIM'], a: 57.4, b: 60.0, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['PUT AWAY', 'THE OTHER GODS'], a: 62.0, b: 67.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['GOD WAS WITH HIM', 'WHEREVER HE WENT'], a: 68.4, b: 72.6, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['LET GO,', 'AND RETURN'], a: 73.4, b: 79.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['NAME ONE THING', 'TO PUT DOWN'], a: 80.0, b: 84.8, y: 330, size: 104, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 35', .6, 5.5, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 35:1', 1.4, 5.5, 540, { size: 34, track: 11 });
  [['GENESIS 35:2–3', 6.7, 11.0], ['GENESIS 35:4', 11.7, 15.2], ['GENESIS 35:5', 16.2, 21.3], ['GENESIS 35:6–7', 22.5, 26.0], ['GENESIS 35:9–10', 26.7, 29.8], ['GENESIS 35:16', 30.8, 34.8], ['GENESIS 35:17', 35.4, 38.8], ['GENESIS 35:18', 39.6, 46.4], ['GENESIS 35:19', 47.0, 50.3], ['GENESIS 35:20', 50.8, 53.4], ['GENESIS 35:27–28', 54.1, 57.0], ['GENESIS 35:29', 57.5, 60.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 62.1, 67.6, 520, { size: 30, track: 14, color: P.cream });
  capLine(cx, t, 'GENESIS 35:3', 68.5, 72.6, 520, { size: 30, track: 12, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
out = rep(out, "([x, y, z, az, el, w]) => ({ T: [x, y, z], az, el, w, fov: 26, dy: 290 })", "([x, y, z, az, el, w, dy]) => ({ T: [x, y, z], az, el, w, fov: 26, dy: dy ?? 290 })")
out = rep(out, "const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z];", "const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z]; window.__gAt = gAt;")
open(SRC + 'main35.js', 'w').write(out)
print('main35.js', len(out))
