#!/usr/bin/env python3
# Builds g11/src/main34.js from main33.js (shared page machinery copied) plus the Ep34 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main33.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
i, _ = cut('// windows follow the narration beats')
head = t[:i]
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
head = rep(head, 'Episode 33 - Genesis 33.', 'Episode 34 - Genesis 34.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s33.js'" % m, "'./%s34.js'" % m)
head = rep(head, 'const { gAt, sPos, J0, ALT, UX, UZ } = stage;', 'const { gAt, CITY, GX, GZ, JD, CAMPC, PATH } = stage;')
head = rep(head, "const Q = (s, lat = 0, dy = .5) => { const p = sPos(s, lat); return P3(p[0], p[1], dy); };      // a point s along the way from Jacob to Esau and lat to the south-east of it\n", "")

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 5.4, b1 11.8, b2 19.4, c1 24.3, c2 34.3, d1 37.3, e1 48.1
// a1 (0.6-4.63) Dinah, Jacob's daughter, went out to visit the women of the land (34:1)
const S1 = [K(0, 0, P3(2.2, .95, .5), -34, 8, 4.8, { dy: 300 }), K(0, 4.4, P3(3.2, .8, .5), -30, 7, 3.9, { dy: 300 })];
const S2 = [K(4.0, 4.0, P3(4.8, .3, .5), -58, 6, 3.0, { dy: 300 }), K(4.0, 6.4, P3(5.2, .3, .55), -64, 6, 2.6, { dy: 300 })];
// a2 (5.4-10.49) Shechem, the ruler's son, seized her and assaulted her; then he wanted to marry her (34:2-4). Nothing is shown: the film holds on the gate and the wall
const S3 = [K(6.0, 6.0, P3(5.9, .25, .72), -86, 5, 4.4, { dy: 300 }), K(6.0, 11.8, P3(6.0, .25, .75), -88, 5, 3.3, { dy: 300 })];
// b1 (11.8-18.61) Jacob heard, and kept silent until his sons came in from the field; they were grieved and very angry (34:5-7)
const S4 = [K(11.4, 11.4, P3(-4.6, .45, .52), 64, 5, 2.4, { dy: 300 }), K(11.4, 14.4, P3(-4.6, .45, .55), 76, 5, 1.9, { dy: 300 })];
const S5 = [K(13.8, 13.8, P3(-3.2, -3.4, .5), 8, 7, 4.4, { dy: 300 }), K(13.8, 19.0, P3(-3.4, -1.2, .5), 12, 6, 3.6, { dy: 300 })];
// b2 (19.4-23.53) Hamor, Shechem's father, came to ask for Dinah as his son's wife (34:6, 8)
const S6 = [K(18.4, 18.4, P3(4.4, .55, .55), -84, 8, 3.8, { dy: 300 }), K(18.4, 24.2, P3(.4, 1.0, .55), -86, 8, 3.2, { dy: 300 })];
// c1 (24.3-33.54) Jacob's sons answered deceitfully; every man in the city must be circumcised (34:13-17)
const S7 = [K(23.8, 23.8, P3(-2.9, .6, .5), -38, 6, 3.6, { dy: 300 }), K(23.8, 28.6, P3(-2.9, .65, .5), -28, 6, 3.0, { dy: 300 })];
const S8 = [K(28.2, 28.2, P3(-3.5, .3, .5), 30, 5, 2.2, { dy: 300 }), K(28.2, 33.8, P3(-3.4, .4, .52), 42, 5, 1.9, { dy: 300 })];
// c2 (34.3-36.5) the men agreed, and were circumcised (34:18-24)
const S9 = [K(33.4, 33.4, P3(4.7, .5, .5), -72, 7, 3.8, { dy: 300 }), K(33.4, 37.2, P3(4.8, .45, .5), -64, 7, 3.0, { dy: 300 })];
// d1 (37.3-47.33) on the third day, while the men were in pain, Simeon and Levi took swords, entered the city and killed every male; they took Dinah out of Shechem's house (34:25-26). The killing is not shown
const S10 = [K(37.0, 37.0, P3(5.0, .5, .4), -56, 4, 3.0, { dy: 300 }), K(37.0, 41.0, P3(5.2, .5, .42), -50, 4, 2.5, { dy: 300 })];
const S11 = [K(40.8, 40.8, P3(1.6, .9, .55), -90, 10, 3.0, { dy: 300 }), K(40.8, 44.8, P3(4.9, .45, .55), -90, 5, 2.8, { dy: 300 })];
const S12 = [K(44.4, 44.4, P3(5.4, .3, .55), -92, 3, 2.9, { dy: 300 }), K(44.4, 48.4, P3(4.3, .4, .55), -90, 3, 2.6, { dy: 300 })];
// e1 (48.1-58.52) the other sons plundered the city and took its women and children captive (34:27-29); Jacob said "you have brought trouble on me" (34:30); they said "should he treat our sister like that?" (34:31)
const S13 = [K(48.2, 48.2, P3(4.4, .5, .55), -72, 7, 3.6, { dy: 300 }), K(48.2, 52.6, P3(3.0, .75, .55), -74, 7, 3.4, { dy: 300 })];
const S14 = [K(52.4, 52.4, P3(-4.2, .5, .55), 88, 5, 2.5, { dy: 300 }), K(52.4, 56.4, P3(-4.3, .5, .58), 78, 5, 2.1, { dy: 300 })];
const S15 = [K(56.2, 56.2, P3(-3.9, .8, .5), 36, 6, 3.0, { dy: 300 }), K(56.2, 61.8, P3(-4.0, .9, .45), 48, 5, 2.4, { dy: 300 })];
const LBL = [[0, .45], [12, .5], [34, .5], [38.5, .7], [43, .78], [47, .66], [52, .55], [60, .5]], LSC = [[0, .05], [34, .05], [41, 0], [60, .03]], LVG = [[0, .5], [38, .56], [43, .62], [52, .55], [60, .55]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('meet', S2, { xin: .4 }), landShot('gate', S3, { xin: .6 }), landShot('silent', S4, { xin: .6 }), landShot('sons', S5, { xin: .6 }), landShot('hamor', S6, { xin: .5 }), landShot('answer', S7, { xin: .5 }),
  landShot('deceit', S8, { xin: .5 }), landShot('agree', S9, { xin: .5 }), landShot('pain', S10, { xin: .6 }), landShot('swords', S11, { xin: .6 }), landShot('out', S12, { xin: .5 }), landShot('column', S13, { xin: .5 }), landShot('trouble', S14, { xin: .5 }), landShot('camp', S15, { xin: .5 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['DINAH WENT OUT', 'TO VISIT THE WOMEN'], a: 1.0, b: 4.5, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['A WRONG DONE', 'TO DINAH'], a: 5.8, b: 10.3, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JACOB HEARD', 'AND KEPT SILENT'], a: 12.0, b: 15.3, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HIS SONS WERE', 'GRIEVED AND ANGRY'], a: 15.7, b: 19.1, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['HAMOR CAME', 'TO ASK FOR DINAH'], a: 19.7, b: 23.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THE SONS ANSWERED', 'WITH DECEIT'], a: 24.6, b: 29.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['EVERY MAN MUST', 'BE CIRCUMCISED'], a: 29.6, b: 33.8, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['THE MEN', 'AGREED'], a: 34.5, b: 37.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THE THIRD DAY', 'THE MEN IN PAIN'], a: 37.7, b: 41.0, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['SIMEON AND LEVI', 'TOOK SWORDS'], a: 41.4, b: 45.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THEY TOOK DINAH', 'OUT OF THE HOUSE'], a: 45.8, b: 48.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['THE OTHER SONS', 'PLUNDERED THE CITY'], a: 48.6, b: 52.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['YOU HAVE BROUGHT', 'TROUBLE ON ME'], a: 52.9, b: 56.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['SHOULD HE TREAT', 'OUR SISTER LIKE THAT?'], a: 56.7, b: 59.7, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['THE ANGER', 'WAS REAL'], a: 61.8, b: 65.5, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['DECEIT AND KILLING', 'A CITY PAID'], a: 67.0, b: 71.2, y: 330, size: 92, glow: 1, maxW: 890 },
  { l: ['VIOLENCE CANNOT', 'HEAL A WOUND'], a: 72.6, b: 78.4, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['STAND WITH', 'SOMEONE HURT'], a: 79.8, b: 84.6, y: 330, size: 104, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 34', .6, 4.6, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 34:1', 1.4, 4.5, 540, { size: 34, track: 11 });
  [['GENESIS 34:2–4', 5.9, 10.3], ['GENESIS 34:5', 12.1, 15.3], ['GENESIS 34:7', 15.8, 19.1], ['GENESIS 34:6, 8', 19.8, 23.6], ['GENESIS 34:13–15', 24.7, 29.2], ['GENESIS 34:15–17', 29.7, 33.8], ['GENESIS 34:18–24', 34.6, 37.0], ['GENESIS 34:25', 37.8, 41.0], ['GENESIS 34:25', 41.5, 45.2], ['GENESIS 34:26', 45.9, 48.1], ['GENESIS 34:27–29', 48.7, 52.4], ['GENESIS 34:30', 53.0, 56.2], ['GENESIS 34:31', 56.8, 59.7]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.9, 65.5, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main34.js', 'w').write(out)
print('main34.js', len(out))
