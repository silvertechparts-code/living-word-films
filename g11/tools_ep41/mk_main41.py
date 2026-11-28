#!/usr/bin/env python3
# Builds g11/src/main41.js from main40.js (shared page machinery copied) plus the Ep41 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main40.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 40 - Genesis 40.', 'Episode 41 - Genesis 41.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s40.js'" % m, "'./%s41.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 10.1, b1 16.35, b2 24.0, c1 29.1, c2 32.8, d1 40.1, d2 47.6, e1 55.95
// phases of the world: 0-4.7 Pharaoh's dream of the cows | 4.7-9.4 his dream of the ears | 9.4-13 the court, no one can interpret | 13-16.2 the cupbearer remembers | 16.2-19.6 Joseph is brought out of prison | 19.6-23.7 Joseph before Pharaoh | 23.7-28.4 plenty, then famine | 28.4-32.4 store grain | 32.4-36.1 the spirit of God | 36.1-39.8 over Egypt | 39.8-43.5 the ring | 43.5-47.4 linen and chain | 47.4-51.6 the granaries | 51.6-55.7 Ephraim | 55.7-61.7 the famine
// a1 (0.6-9.36) two years later Pharaoh dreamed of seven thin cows that ate seven fat ones and seven thin ears that ate seven full ones (41:1-7)
const S1 = [K(0, 0, P3(-1.0, -.5, .15), -72, 8, 2.6, { dy: 60 }), K(0, 4.7, P3(-1.2, -.5, .15), -62, 6, 2.0, { dy: 60 })];
const S2 = [K(4.7, 4.7, [-1.93, .46, 2.24], 165, 6, 1.0, { dy: 60 }), K(4.7, 9.4, [-1.93, .5, 2.24], 150, 8, 1.25, { dy: 60 })];
// a2 (10.1-15.6) no wise man in Egypt could explain them (41:8); then the cupbearer remembered Joseph (41:9-13)
const S3 = [K(9.4, 9.4, P3(-5.3, -.5, .3), 88, 9, 3.4, { dy: 60 }), K(9.4, 13.1, P3(-5.3, -.5, .3), 82, 10, 2.7, { dy: 60 })];
const S4 = [K(13.0, 13.0, P3(-5.0, -.9, .3), 55, 9, 1.9, { dy: 60 }), K(13.0, 16.3, P3(-5.1, -.9, .3), 48, 9, 1.5, { dy: 60 })];
// b1 (16.35-23.24) Joseph was brought from prison to explain the dreams (41:14); not I, God will give Pharaoh an answer (41:16)
const S5 = [K(16.2, 16.2, P3(-3.3, -3.2, .25), 8, 16, 1.8, { dy: 60 }), K(16.2, 19.7, P3(-3.3, -2.9, .25), 3, 15, 2.0, { dy: 60 })];
const S6 = [K(19.6, 19.6, P3(-5.45, -.6, .32), 68, 9, 1.5, { dy: 60 }), K(19.6, 23.8, P3(-5.45, -.6, .32), 58, 9, 1.25, { dy: 60 })];
// b2 (24.0-28.36) seven years of plenty are coming, then seven of famine (41:29-30)
const S7 = [K(23.7, 23.7, [-2.2, .3, 4.0], -75, 22, 6.5, { dy: 60 }), K(23.7, 28.5, [-2.0, .3, 3.9], -62, 26, 5.3, { dy: 60 })];
// c1 (29.1-32.04) store grain in the good years (41:33-36)
const S8 = [K(28.4, 28.4, P3(-4.9, -.9, .3), 104, 8, 1.8, { dy: 60 }), K(28.4, 32.5, P3(-4.9, -.8, .3), 96, 9, 1.5, { dy: 60 })];
// c2 (32.8-39.38) Pharaoh asked: can we find anyone like him, with the spirit of God? (41:38); then he set Joseph over Egypt (41:41)
const S9 = [K(32.4, 32.4, P3(-6.0, -.6, .34), 78, 5, 1.2, { dy: 60 }), K(32.4, 36.2, P3(-6.0, -.6, .34), 66, 6, 1.0, { dy: 60 })];
const S10 = [K(36.1, 36.1, P3(-5.17, -.6, .32), 10, 5, 1.05, { dy: 60 }), K(36.1, 39.9, P3(-5.17, -.6, .32), 6, 5, .85, { dy: 60 })];
// d1 (40.1-46.82) the signet ring, fine linen and a gold chain (41:42); Joseph was thirty years old (41:46)
const S11 = [K(39.8, 39.8, P3(-5.2, -.55, .37), 0, 5, .8, { dy: 60 }), K(39.8, 43.6, P3(-5.2, -.55, .37), -4, 6, .65, { dy: 60 })];
const S12 = [K(43.5, 43.5, P3(-5.0, -.6, .4), 70, 4, .85, { dy: 60 }), K(43.5, 47.5, P3(-5.0, -.6, .4), 62, 4, .7, { dy: 60 })];
// d2 (47.6-55.21) for seven years he stored grain (41:47-49); he named a son Ephraim (41:52)
const S13 = [K(47.4, 47.4, P3(3.3, 3.5, .28), -90, 13, 1.9, { dy: 60 }), K(47.4, 51.7, P3(3.3, 3.5, .28), -82, 12, 1.5, { dy: 60 })];
const S14 = [K(51.6, 51.6, P3(-5.7, -.75, .4), 100, 5, .95, { dy: 60 }), K(51.6, 55.8, P3(-5.7, -.75, .4), 90, 5, .72, { dy: 60 })];
// e1 (55.95-59.78) then the famine came, and all lands came to Egypt for grain (41:54-57)
const S15 = [K(55.7, 55.7, [-.2, .5, 1.6], -72, 28, 5.4, { dy: 60 }), K(55.7, 61.7, [-.2, .5, 1.6], -62, 30, 4.4, { dy: 60 })];
const LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const DREAM = ')
LANDSHOT = t[i:j]
LANDSHOT += r"""const DAWND = { light: [[0, LK('#c8a8c8', '#6a5060', .95, '#ffb89a', 2.3, [9, 2.4, -5], .5, '#f0b8c8', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#7a6aa8', '#f8b898']]] };
"""
SHOTS_LIST = r"""const SHOTS = [
  landShot('cows', S1, { xin: 0, ...DAWND }), landShot('ears', S2, { xin: 0, ...DAWND }), landShot('court', S3, { xin: 0 }), landShot('remember', S4, { xin: 0 }), landShot('gate', S5, { xin: 0 }), landShot('before', S6, { xin: 0 }), landShot('years', S7, { xin: 0 }), landShot('store', S8, { xin: 0 }),
  landShot('asks', S9, { xin: 0 }), landShot('over', S10, { xin: 0 }), landShot('ring', S11, { xin: 0 }), landShot('chain', S12, { xin: 0 }), landShot('granaries', S13, { xin: 0 }), landShot('son', S14, { xin: 0 }), landShot('famine', S15, { xin: 0 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['SEVEN FAT COWS,', 'SEVEN THIN COWS'], a: 1.0, b: 4.5, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['SEVEN FULL EARS,', 'SEVEN THIN EARS'], a: 5.3, b: 9.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['NO ONE IN EGYPT', 'COULD EXPLAIN'], a: 9.8, b: 12.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THEN THE CUPBEARER', 'REMEMBERED'], a: 13.3, b: 16.0, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['JOSEPH WAS BROUGHT', 'FROM PRISON'], a: 16.6, b: 19.4, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['NOT I.', 'GOD WILL ANSWER'], a: 20.1, b: 23.5, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['SEVEN YEARS', 'OF PLENTY'], a: 24.2, b: 26.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THEN SEVEN', 'OF FAMINE'], a: 26.9, b: 28.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['STORE GRAIN IN', 'THE GOOD YEARS'], a: 28.9, b: 32.1, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ONE WITH THE', 'SPIRIT OF GOD?'], a: 32.9, b: 36.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JOSEPH OVER', 'ALL EGYPT'], a: 36.7, b: 39.7, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HIS SIGNET RING', 'AND FINE LINEN'], a: 40.2, b: 43.3, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['A GOLD CHAIN', 'JOSEPH WAS THIRTY'], a: 43.9, b: 47.3, y: 330, size: 100, glow: 1, maxW: 980, stag: 1.3 },
  { l: ['SEVEN YEARS', 'OF STORING GRAIN'], a: 47.9, b: 51.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['A SON NAMED', 'EPHRAIM'], a: 52.1, b: 55.5, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THEN THE FAMINE', 'CAME'], a: 56.2, b: 60.3, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['JOSEPH GAVE GOD', 'THE CREDIT'], a: 62.0, b: 65.5, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE PREPARED IN', 'THE GOOD YEARS'], a: 67.0, b: 69.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE NAMED HIS SON', 'IN THANKS'], a: 69.8, b: 72.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['THANKS AND PREPARATION', 'IN ONE HEART'], a: 73.2, b: 77.6, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['THANK GOD FOR', 'ONE GOOD THING'], a: 79.0, b: 81.8, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['PREPARE FOR', 'A HARDER DAY'], a: 82.1, b: 84.9, y: 330, size: 104, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 41', .6, 4.6, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 41:1–4', 1.4, 4.4, 540, { size: 34, track: 11 });
  [['GENESIS 41:5–7', 5.5, 9.2], ['GENESIS 41:8', 9.9, 12.8], ['GENESIS 41:9–13', 13.4, 16.0], ['GENESIS 41:14', 16.8, 19.4], ['GENESIS 41:15–16', 20.3, 23.5], ['GENESIS 41:29–30', 24.4, 28.3], ['GENESIS 41:33–36', 29.1, 32.1], ['GENESIS 41:38', 33.1, 36.0], ['GENESIS 41:41', 36.9, 39.7], ['GENESIS 41:42', 40.4, 43.3], ['GENESIS 41:42, 46', 44.1, 47.3], ['GENESIS 41:47–49', 48.1, 51.4], ['GENESIS 41:52', 52.3, 55.5], ['GENESIS 41:54–57', 56.4, 60.3]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 41:16', 62.1, 65.5, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 41:48–49', 66.9, 69.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 41:52', 69.9, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 73.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main41.js', 'w').write(out)
print('main41.js', len(out))
