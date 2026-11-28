#!/usr/bin/env python3
# Builds g11/src/main46.js from main45.js (shared page machinery copied) plus the Ep46 shots, titles and Scripture lines.
import json, os
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main45.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 45 - Genesis 45.', 'Episode 46 - Genesis 46.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s45.js'" % m, "'./%s46.js'" % m)
exec(open('/home/claude/g11/tools_ep46/cams46.py').read())
def kline(n):
    ks = ["K(%s, %s, P3(%s, %s, %s), %s, %s, %s, { dy: 60 })" % k for k in CAMS[n]]
    return "const %s = [%s];" % (n, ', '.join(ks))
SHOTS_BLOCK = ("// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.0, b1 14.3, b2 23.0, c1 30.2, c2 38.4, d1 44.2, d2 51.4\n"
 "// phases of the world: 0-8 dusk, the altar at Beersheba | 8-30 night: the vision, the column of light | 30-44 dawn, the caravan to the ford and the road | 44-62 Judah ahead, the chariot, the meeting in Goshen\n"
 + '\n'.join(kline('S%d' % n) for n in range(1, 20)) + "\nconst LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];\n")
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
IDS = ['camp', 'arrive', 'kneel', 'night', 'vision', 'promise', 'face', 'sons', 'goingdown', 'closeeyes', 'dawn', 'ride', 'wives', 'ford', 'judah', 'joseph', 'chariot', 'embrace', 'weep']
SHOTS_LIST = "const SHOTS = [\n  " + ', '.join("landShot('%s', S%d, { xin: 0 })" % (n, k + 1) for k, n in enumerate(IDS)) + ",\n"
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
# (line 1, line 2, from, to, Scripture reference, size); windows follow the real clip phrases (a1 0.6, a2 8.0, b1 14.3, b2 23.0, c1 30.2, c2 38.4, d1 44.2, d2 51.4)
STORY = [
 ('JACOB SET OUT', 'WITH ALL HE OWNED', .7, 2.9, 'GENESIS 46:1', 92), ('AT BEERSHEBA', 'HE OFFERED SACRIFICE', 4.2, 7.0, 'GENESIS 46:1', 88),
 ('GOD SPOKE', 'IN THE NIGHT', 8.2, 10.4, 'GENESIS 46:2', 116), ('JACOB, JACOB', 'HERE I AM', 10.7, 13.0, 'GENESIS 46:2', 124),
 ('DO NOT FEAR', 'TO GO DOWN TO EGYPT', 15.4, 18.6, 'GENESIS 46:3', 92), ('A GREAT NATION', 'WILL COME FROM YOU', 19.0, 21.9, 'GENESIS 46:3', 96),
 ('I WILL GO DOWN', 'WITH YOU', 23.2, 25.8, 'GENESIS 46:4', 112), ('JOSEPH WILL CLOSE', 'YOUR EYES', 26.0, 28.6, 'GENESIS 46:4', 100),
 ('JACOB LEFT', 'BEERSHEBA', 30.4, 32.6, 'GENESIS 46:5', 112), ('HIS SONS CARRIED', 'THE FAMILY', 33.0, 36.4, 'GENESIS 46:5', 100),
 ('SEVENTY IN ALL', 'WENT TO EGYPT', 38.6, 41.4, 'GENESIS 46:27', 100),
 ('JUDAH WENT', 'AHEAD', 44.4, 46.6, 'GENESIS 46:28', 118), ('JOSEPH SET OUT', 'IN HIS CHARIOT', 47.0, 49.8, 'GENESIS 46:29', 104),
 ('HE EMBRACED', 'HIS FATHER', 51.6, 54.0, 'GENESIS 46:29', 108), ('NOW I CAN DIE,', 'YOU ARE ALIVE', 55.4, 59.2, 'GENESIS 46:30', 104)]
REFL = [(['JACOB WAS OLD'], 62.0, 63.5, 112), (['A LAND', 'NOT HIS OWN'], 63.7, 65.4, 108), (['DO NOT BE', 'AFRAID'], 66.9, 70.0, 124), (['MANY OF US', 'FACE A START'], 72.7, 76.0, 104), (['WE DID NOT', 'CHOOSE'], 76.2, 78.6, 112),
 (['ONE STEP,', 'TRUSTING GOD'], 79.1, 83.6, 112)]
def T(l, a, b, size): return "  { l: %s, a: %s, b: %s, y: 330, size: %d, glow: 1, maxW: 980 }," % (str(list(l)), a, b, size)
tl = [T([x[0], x[1]], x[2], x[3], x[5]) for x in STORY] + [T(r[0], r[1], r[2], r[3]) for r in REFL]
refs = ', '.join("['%s', %s, %s]" % (x[4], round(x[2] + .2, 2), x[3]) for x in STORY)
TITLES = ("// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area\nconst TITLES = [\n" + '\n'.join(tl) + "\n];\n" + r"""function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 46', .6, 4.6, 252, { size: 28, track: 7 });
  [""" + refs + r"""].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 46:3', 66.5, 70.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 72.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
""")
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main46.js', 'w').write(out)
print('main46.js', len(out))
