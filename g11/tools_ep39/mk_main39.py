#!/usr/bin/env python3
# Builds g11/src/main39.js from main38.js (shared page machinery copied) plus the Ep39 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main38.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 38 - Genesis 38.', 'Episode 39 - Genesis 39.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s38.js'" % m, "'./%s39.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.4, b1 15.6, b2 26.0, c1 29.6, c2 37.9, d1 44.4, d2 51.6
// phases of the world (who stands where): 0-8.4 Joseph carries a jar to the house | 8.4-15.4 Potiphar watches and puts him in charge | 15.6-22.4 she looks at him, he refuses | 22.4-26 he turns away | 26-29.6 day after day, the light swings | 29.6-32.5 the house is empty, he goes in | 32.5-35.2 she catches his cloak | 35.2-38 he runs out | 37.9-40.9 she calls the servants | 40.9-44.4 she shows the cloak | 44.4-47.4 Potiphar is furious | 47.4-50.6 Joseph is led to the prison | 50.5-58.5 the prison at night | 58.4-61.8 dawn
// a1 (0.6-8.4) In Egypt Joseph served in Potiphar's house; the Lord was with him and everything he did prospered (39:1-3): the house at golden hour, Joseph brings a jar
const S1 = [K(0, 0, P3(-5.3, -1.0, .45), 62, 6, 2.5, { dy: 60 }), K(0, 4.7, P3(-5.6, -1.0, .4), 52, 5, 1.7, { dy: 60 })];
const S2 = [K(4.6, 4.6, P3(-5.3, -1.0, .3), 62, 4, 1.35, { dy: 60 }), K(4.6, 8.5, P3(-5.3, -1.0, .3), 54, 4, 1.05, { dy: 60 })];
// a2 (8.4-15.4) Potiphar saw this; he made Joseph his attendant and put him in charge of his whole household (39:3-4)
const S3 = [K(8.4, 8.4, P3(-6.0, -.45, .3), 70, 4, 1.45, { dy: 60 }), K(8.4, 11.7, P3(-6.0, -.45, .3), 60, 4, 1.15, { dy: 60 })];
const S4 = [K(11.6, 11.6, P3(-5.7, -.85, .3), 25, 5, 1.8, { dy: 60 }), K(11.6, 15.5, P3(-5.7, -.85, .3), 15, 5, 1.4, { dy: 60 })];
// b1 (15.6-26.0) she looked at Joseph and asked him to lie with her (39:7); he refused: how could I do this great wickedness and sin against God (39:8-9)
const S5 = [K(15.6, 15.6, P3(-5.5, -1.2, .32), 58, 4, 1.8, { dy: 60 }), K(15.6, 19.5, P3(-5.5, -1.2, .32), 50, 4, 1.5, { dy: 60 })];
const S6 = [K(19.4, 19.4, P3(-5.0, -.95, .3), 18, 5, 1.8, { dy: 60 }), K(19.4, 22.5, P3(-5.0, -.95, .3), 8, 5, 1.5, { dy: 60 })];
const S7 = [K(22.4, 22.4, P3(-4.6, -.85, .34), -40, 6, 1.6, { dy: 60 }), K(22.4, 26.1, P3(-4.5, -.8, .34), -46, 6, 1.3, { dy: 60 })];
// b2 (26.0-29.6) she pressed him day after day (39:10): the light swings across the sky
const S8 = [K(26.0, 26.0, P3(-4.1, -.5, .3), 38, 6, 1.7, { dy: 60 }), K(26.0, 27.7, P3(-4.6, -1.35, .3), 22, 6, 1.6, { dy: 60 }), K(26.0, 29.6, P3(-5.2, -.35, .3), 48, 6, 1.6, { dy: 60 })];
// c1 (29.6-37.9) one day, with none of the men of the house inside, she caught hold of his cloak; he left it in her hand and ran outside (39:11-12)
const S9 = [K(29.5, 29.5, P3(-5.4, -.6, .32), 50, 6, 1.9, { dy: 60 }), K(29.5, 32.6, P3(-6.0, -1.0, .32), 56, 6, 1.4, { dy: 60 })];
const S10 = [K(32.5, 32.5, P3(-6.2, -1.0, .32), 52, 4, 1.25, { dy: 60 }), K(32.5, 35.3, P3(-6.2, -1.0, .32), 58, 4, 1.05, { dy: 60 })];
const S11 = [K(35.2, 35.2, P3(-5.3, -1.0, .3), 8, 7, 1.6, { dy: 60 }), K(35.2, 36.6, P3(-3.6, -1.0, .3), 8, 7, 1.6, { dy: 60 }), K(35.2, 38.0, P3(-1.9, -.9, .3), 8, 7, 1.6, { dy: 60 })];
// c2 (37.9-44.4) she called her servants and told her husband a story, showing the cloak (39:13-18)
const S12 = [K(37.9, 37.9, P3(-6.0, -1.4, .3), 58, 4, 1.5, { dy: 60 }), K(37.9, 41.0, P3(-6.0, -1.4, .3), 50, 4, 1.3, { dy: 60 })];
const S13 = [K(40.9, 40.9, P3(-5.7, -1.15, .32), 40, 4, 1.45, { dy: 60 }), K(40.9, 44.5, P3(-5.7, -1.15, .32), 30, 4, 1.25, { dy: 60 })];
// d1 (44.4-51.6) Potiphar was furious and had Joseph put in the prison where the king's prisoners were held (39:19-20)
const S14 = [K(44.4, 44.4, P3(-5.5, -.95, .36), 80, 3, 1.25, { dy: 60 }), K(44.4, 47.5, P3(-5.5, -.95, .36), 70, 3, 1.0, { dy: 60 })];
const S15 = [K(47.4, 47.4, P3(-3.15, -2.2, .3), 8, 10, 2.1, { dy: 60 }), K(47.4, 50.7, P3(-3.3, -3.9, .3), 5, 12, 1.7, { dy: 60 })];
// d2 (51.6-59.8) the Lord was with Joseph in prison too, and showed him kindness; the keeper put the prisoners in his care (39:21-23)
const S16 = [K(50.5, 50.5, P3(-3.35, -4.6, .3), 6, 12, 1.9, { dy: 60 }), K(50.5, 54.6, P3(-3.35, -4.6, .3), 8, 11, 1.35, { dy: 60 })];
const S17 = [K(54.5, 54.5, P3(-3.1, -4.7, .32), 22, 36, 1.7, { dy: 60 }), K(54.5, 58.5, P3(-3.1, -4.7, .32), 34, 34, 1.4, { dy: 60 })];
const S18 = [K(58.4, 58.4, P3(-3.4, -4.1, .3), 40, 12, 3.2, { dy: 60 }), K(58.4, 61.8, P3(-5.0, -2.6, .3), 68, 28, 9.0, { dy: 60 })];
const LBL = [[0, .45], [14, .5], [29, .55], [38, .65], [44, .78], [52, .7], [60, .62]], LSC = [[0, .05], [30, .05], [40, 0], [60, .03]], LVG = [[0, .5], [38, .56], [44, .62], [52, .58], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('work', S2, { xin: 0 }), landShot('watch', S3, { xin: 0 }), landShot('charge', S4, { xin: 0 }), landShot('look', S5, { xin: 0 }), landShot('ask', S6, { xin: 0 }), landShot('refuse', S7, { xin: 0 }), landShot('days', S8, { xin: 0 }), landShot('empty', S9, { xin: 0 }),
  landShot('catch', S10, { xin: 0 }), landShot('run', S11, { xin: 0 }), landShot('tell', S12, { xin: 0 }), landShot('show', S13, { xin: 0 }), landShot('furious', S14, { xin: 0 }), landShot('led', S15, { xin: 0 }), landShot('night', S16, { xin: 0 }), landShot('trust', S17, { xin: 0 }),
  landShot('rise', S18, { xin: 0, ...DAWN }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['THE LORD WAS', 'WITH JOSEPH'], a: 1.0, b: 4.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['EVERYTHING HE DID', 'PROSPERED'], a: 4.9, b: 8.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['POTIPHAR', 'SAW THIS'], a: 8.9, b: 11.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['PUT IN CHARGE', 'OF HIS HOUSEHOLD'], a: 12.0, b: 15.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ["HIS MASTER'S WIFE", 'LOOKED AT HIM'], a: 16.0, b: 19.2, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['JOSEPH', 'REFUSED'], a: 19.9, b: 22.3, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['HOW COULD I', 'SIN AGAINST GOD?'], a: 22.8, b: 25.9, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['DAY AFTER DAY', 'HE REFUSED'], a: 26.3, b: 29.3, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['NO SERVANTS', 'INSIDE'], a: 29.9, b: 32.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['SHE CAUGHT', 'HIS CLOAK'], a: 32.8, b: 35.1, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HE LEFT IT', 'AND RAN'], a: 35.6, b: 37.8, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['SHE CALLED HER', 'SERVANTS'], a: 38.2, b: 40.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['A FALSE STORY', 'AND THE CLOAK'], a: 41.2, b: 44.2, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['POTIPHAR', 'WAS FURIOUS'], a: 44.7, b: 47.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THROWN INTO', 'PRISON'], a: 47.7, b: 50.5, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['THE LORD WAS', 'THERE TOO'], a: 51.8, b: 54.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THE KEEPER', 'TRUSTED HIM'], a: 55.4, b: 59.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HE DID RIGHT', 'AND IT COST HIM'], a: 62.0, b: 67.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THE LORD WAS', 'WITH JOSEPH'], a: 68.3, b: 72.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['DOING RIGHT MAY', 'COST YOU SOMETHING'], a: 73.3, b: 78.4, y: 330, size: 84, glow: 1, maxW: 980 },
  { l: ['DO RIGHT WHEN', 'NO ONE IS WATCHING'], a: 79.8, b: 84.8, y: 330, size: 88, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 39', .6, 4.4, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 39:2', 1.4, 4.2, 540, { size: 34, track: 11 });
  [['GENESIS 39:3', 5.1, 8.1], ['GENESIS 39:3', 9.1, 11.4], ['GENESIS 39:4', 12.2, 15.2], ['GENESIS 39:7', 16.2, 19.2], ['GENESIS 39:8', 20.1, 22.3], ['GENESIS 39:9', 23.0, 25.9], ['GENESIS 39:10', 26.5, 29.3], ['GENESIS 39:11', 30.1, 32.3], ['GENESIS 39:12', 33.0, 35.1], ['GENESIS 39:12', 35.8, 37.8], ['GENESIS 39:13–14', 38.4, 40.8], ['GENESIS 39:16–18', 41.4, 44.2], ['GENESIS 39:19', 44.9, 47.3], ['GENESIS 39:20', 47.9, 50.5], ['GENESIS 39:21', 52.0, 54.8], ['GENESIS 39:22', 55.6, 59.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 39:20–21', 62.1, 67.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 39:2, 21', 68.4, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 39:21', 73.4, 78.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 79.9, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main39.js', 'w').write(out)
print('main39.js', len(out))
