#!/usr/bin/env python3
# Builds g11/src/main44.js from main43.js (shared page machinery copied) plus the Ep44 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main43.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 43 - Genesis 43.', 'Episode 44 - Genesis 44.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s43.js'" % m, "'./%s44.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.9, b1 14.05, b2 22.3, c1 28.8, c2 40.4, d1 47.9, d2 54.35
// phases of the world: 0-7.8 night in the courtyard (the order, the cup in the sack) | 7.8-11 dawn, the road, the steward runs after them | 11-20.8 the accusation | 20.8-24.8 the search, the cup is found | 24.6-28.8 they tear their clothes and return | 28.8-39.6 before Joseph | 39.6-47 Judah steps forward and speaks of the father | 47-60 the pledge and the offer
const S1 = [K(0, 0, P3(-5.1, -1.25, .28), 24, 13, 2.4, { dy: 60 }), K(0, 3.7, P3(-5.1, -1.25, .28), 12, 12, 1.95, { dy: 60 })];
const S2 = [K(3.5, 3.5, P3(-4.65, -1.8, .2), 8, 17, 1.5, { dy: 60 }), K(3.5, 7.95, P3(-4.65, -1.8, .2), -2, 15, 1.05, { dy: 60 })];
const S3 = [K(7.8, 7.8, P3(-3.8, -.2, .2), 8, 20, 3.7, { dy: 60 }), K(7.8, 11.0, P3(-3.1, .3, .2), 4, 18, 3.1, { dy: 60 })];
const S4 = [K(10.8, 10.8, P3(-2.3, .75, .3), 14, 14, 2.7, { dy: 60 }), K(10.8, 14.2, P3(-1.6, .75, .3), 10, 12, 2.3, { dy: 60 })];
const S5 = [K(14.0, 14.0, P3(-2.0, .65, .35), 80, 8, 1.9, { dy: 60 }), K(14.0, 17.6, P3(-2.0, .65, .35), 74, 8, 1.55, { dy: 60 })];
const S6 = [K(17.4, 17.4, P3(-1.25, .66, .4), -62, 8, 1.6, { dy: 60 }), K(17.4, 21.0, P3(-1.25, .66, .4), -54, 8, 1.3, { dy: 60 })];
const S7 = [K(20.8, 20.8, P3(-2.7, .6, .2), 14, 22, 2.9, { dy: 60 }), K(20.8, 23.1, P3(-3.7, .6, .2), 10, 20, 2.4, { dy: 60 })];
const S8 = [K(22.9, 22.9, P3(-4.1, .68, .35), 24, 8, 1.5, { dy: 60 }), K(22.9, 24.8, P3(-4.1, .68, .4), 18, 8, 1.15, { dy: 60 })];
const S9 = [K(24.6, 24.6, P3(-3.4, .55, .42), -22, 10, 1.9, { dy: 60 }), K(24.6, 26.4, P3(-3.2, .55, .42), -16, 10, 1.55, { dy: 60 })];
const S10 = [K(26.2, 26.2, P3(-3.7, .65, .35), 16, 12, 3.1, { dy: 60 }), K(26.2, 29.0, P3(-4.6, .65, .35), 12, 12, 2.7, { dy: 60 })];
const S11 = [K(28.8, 28.8, P3(-5.2, -.55, .2), 72, 20, 3.4, { dy: 60 }), K(28.8, 30.5, P3(-5.2, -.55, .2), 66, 18, 2.9, { dy: 60 })];
const S12 = [K(30.3, 30.3, P3(-4.85, -.65, .3), 56, 12, 1.9, { dy: 60 }), K(30.3, 33.3, P3(-4.85, -.65, .3), 50, 11, 1.5, { dy: 60 })];
const S13 = [K(33.1, 33.1, P3(-5.85, -.85, .42), 75, 7, 1.5, { dy: 60 }), K(33.1, 37.3, P3(-5.85, -.85, .42), 70, 7, 1.25, { dy: 60 }), K(33.1, 39.8, P3(-5.6, -.75, .35), 64, 10, 2.1, { dy: 60 })];
const S14 = [K(39.6, 39.6, P3(-5.65, -.65, .35), 12, 10, 1.95, { dy: 60 }), K(39.6, 42.2, P3(-5.65, -.65, .35), 8, 10, 1.6, { dy: 60 })];
const S15 = [K(42.0, 42.0, P3(-5.4, -.68, .6), -34, 8, 1.5, { dy: 60 }), K(42.0, 47.1, P3(-5.4, -.68, .6), -30, 8, 1.25, { dy: 60 })];
const S16 = [K(46.9, 46.9, P3(-5.4, -.68, .6), -38, 7, 1.3, { dy: 60 }), K(46.9, 53.4, P3(-5.4, -.68, .6), -28, 7, .95, { dy: 60 })];
const S17 = [K(53.2, 53.2, P3(-5.4, -.68, .3), -22, 8, 1.7, { dy: 60 }), K(53.2, 57.2, P3(-5.4, -.68, .3), -14, 8, 1.3, { dy: 60 })];
const S18 = [K(57.0, 57.0, P3(-5.95, -.62, .42), 70, 6, 1.4, { dy: 60 }), K(57.0, 61.7, P3(-5.95, -.62, .42), 66, 6, 1.0, { dy: 60 })];
const LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];
const NIGHT = { bloom: [[0, .78]], scrim: [[0, 0]], vig: [[0, .62]] };
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
LANDSHOT = LANDSHOT[:LANDSHOT.index('const DAWND')]
SHOTS_LIST = r"""const SHOTS = [
  landShot('order', S1, { xin: 0, ...NIGHT }), landShot('cup', S2, { xin: 0, ...NIGHT }), landShot('dawn', S3, { xin: 0 }), landShot('overtake', S4, { xin: 0 }), landShot('accuse', S5, { xin: 0 }), landShot('only', S6, { xin: 0 }), landShot('sacks', S7, { xin: 0 }), landShot('found', S8, { xin: 0 }), landShot('tear', S9, { xin: 0 }), landShot('return', S10, { xin: 0 }),
  landShot('fall', S11, { xin: 0 }), landShot('guilt', S12, { xin: 0 }), landShot('verdict', S13, { xin: 0 }), landShot('step', S14, { xin: 0 }), landShot('father', S15, { xin: 0 }), landShot('promise', S16, { xin: 0 }), landShot('offer', S17, { xin: 0 }), landShot('joseph', S18, { xin: 0 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
# (line 1, line 2, from, to, Scripture reference, size)
STORY = [
 ('FILL THEIR', 'SACKS', .7, 3.3, 'GENESIS 44:1', 112), ('THE SILVER CUP', 'IN HIS SACK', 3.7, 6.6, 'GENESIS 44:2', 104), ('THE STEWARD', 'OVERTAKES THEM', 8.2, 10.5, 'GENESIS 44:6', 104),
 ('ACCUSED OF', 'STEALING THE CUP', 10.9, 13.4, 'GENESIS 44:4–5', 100), ('WHOEVER HAS IT', 'WILL DIE', 14.3, 17.3, 'GENESIS 44:9', 104), ('ONLY HE WILL', 'BE MY SLAVE', 18.9, 21.0, 'GENESIS 44:10', 108),
 ('THE CUP IN', 'BENJAMIN’S SACK', 22.5, 24.6, 'GENESIS 44:12', 104), ('THEY TORE', 'THEIR CLOTHES', 24.9, 26.4, 'GENESIS 44:13', 112), ('BACK TO THE', 'CITY', 26.7, 28.6, 'GENESIS 44:13', 116),
 ('THEY FELL BEFORE', 'JOSEPH', 29.0, 30.9, 'GENESIS 44:14', 100), ('GOD HAS FOUND', 'OUR GUILT', 31.5, 33.3, 'GENESIS 44:16', 104), ('ONLY THE ONE WITH', 'THE CUP STAYS', 34.5, 37.0, 'GENESIS 44:17', 96),
 ('THE REST GO', 'IN PEACE', 37.4, 39.0, 'GENESIS 44:17', 112), ('JUDAH', 'STEPS FORWARD', 40.5, 42.1, 'GENESIS 44:18', 112), ('HIS OLD FATHER', 'LOVES BENJAMIN', 42.3, 44.4, 'GENESIS 44:20', 100),
 ('HE WOULD DIE', 'OF GRIEF', 44.7, 46.5, 'GENESIS 44:29–31', 112), ('BEAR THE BLAME', 'ALL MY LIFE', 49.2, 52.9, 'GENESIS 44:32', 104), ('LET ME STAY', 'AS YOUR SLAVE', 54.5, 56.6, 'GENESIS 44:33', 108),
 ('HOW CAN I GO BACK', 'WITHOUT HIM?', 57.1, 59.4, 'GENESIS 44:34', 88)]
REFL = [(['JUDAH OFFERED', 'HIS FREEDOM'], 62.0, 64.2, 108), (['SO BENJAMIN', 'COULD GO HOME'], 64.5, 66.5, 108), (['LOVE IS MORE', 'THAN A FEELING'], 67.0, 68.9, 104), (['IT PAYS WHAT', 'OTHERS WOULD OWE'], 69.0, 71.2, 92),
 (['RARELY ASKED', 'FOR FREEDOM'], 72.9, 74.9, 108), (['OFTEN: TIME,', 'COMFORT, PRIDE'], 75.1, 77.9, 104), (['CARRY A COST', 'FOR SOMEONE'], 79.1, 81.7, 104), (['YOU LOVE'], 82.0, 84.9, 130)]
def T(l, a, b, size): return "  { l: %s, a: %s, b: %s, y: 330, size: %d, glow: 1, maxW: 980 }," % (str(list(l)).replace("'", "'"), a, b, size)
tl = [T([x[0], x[1]], x[2], x[3], x[5]) for x in STORY] + [T(r[0], r[1], r[2], r[3]) for r in REFL]
refs = ', '.join("['%s', %s, %s]" % (x[4], x[2] + .2, x[3]) for x in STORY)
TITLES = ("// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area\nconst TITLES = [\n" + '\n'.join(tl) + "\n];\n" + r"""function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 44', .6, 4.6, 252, { size: 28, track: 7 });
  [""" + refs + r"""].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 44:33', 62.1, 64.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 73.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
""")
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main44.js', 'w').write(out)
print('main44.js', len(out))
