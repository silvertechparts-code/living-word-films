#!/usr/bin/env python3
# Builds g11/src/main45.js from main44.js (shared page machinery copied) plus the Ep45 shots, titles and Scripture lines.
import json, os
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main44.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 44 - Genesis 44.', 'Episode 45 - Genesis 45.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s44.js'" % m, "'./%s45.js'" % m)

# camera keys live in cams45.py (tuned with camtry45 / dbg45 stills)
exec(open('/home/claude/g11/tools_ep45/cams45.py').read())   # defines CAMS = {'S1': [(t0, t, x, z, hy, az, el, w), ...], ...}
def kline(n):
    ks = ["K(%s, %s, P3(%s, %s, %s), %s, %s, %s, { dy: 60 })" % k for k in CAMS[n]]
    return "const %s = [%s];" % (n, ', '.join(ks))
SHOTS_BLOCK = ("// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.9, b1 14.9, b2 20.9, c1 27.1, c2 34.2, d1 40.0, d2 47.6\n"
 "// phases of the world: 0-9.6 the attendants are sent out, Joseph weeps | 8-40 Joseph and the brothers in the courtyard | 39.9-47.3 Pharaoh's house | 46.9-62 Canaan: the brothers tell Jacob, the wagons arrive, Jacob rises\n"
 + '\n'.join(kline('S%d' % n) for n in range(1, 20)) + "\nconst LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];\n")
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
IDS = ['hall', 'out', 'weep', 'alive', 'silent', 'closer', 'sold', 'angry', 'ahead', 'goshen', 'road', 'embrace', 'talked', 'pharaoh', 'best', 'canaan', 'doubt', 'wagons', 'rise']
SHOTS_LIST = "const SHOTS = [\n  " + ', '.join("landShot('%s', S%d, { xin: 0 })" % (n, k + 1) for k, n in enumerate(IDS)) + ",\n"
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
# (line 1, line 2, from, to, Scripture reference, size); windows follow the real clip phrases (a1 0.6, a2 7.9, b1 14.9, b2 20.9, c1 27.1, c2 34.2, d1 40.0, d2 47.6)
STORY = [
 ('JOSEPH COULD', 'NOT HOLD BACK', .7, 2.5, 'GENESIS 45:1', 100), ('HE SENT', 'EVERYONE OUT', 2.8, 4.6, 'GENESIS 45:1', 108), ('THE EGYPTIANS', 'HEARD HIM WEEP', 4.8, 7.0, 'GENESIS 45:2', 92),
 ('I AM', 'JOSEPH', 8.4, 10.0, 'GENESIS 45:3', 130), ('IS MY FATHER', 'STILL ALIVE?', 10.1, 11.8, 'GENESIS 45:3', 104), ('THEY COULD', 'NOT ANSWER', 12.0, 13.9, 'GENESIS 45:3', 112),
 ('COME', 'CLOSER', 14.95, 16.6, 'GENESIS 45:4', 130), ('YOUR BROTHER,', 'WHOM YOU SOLD', 16.9, 19.4, 'GENESIS 45:4', 100),
 ('DO NOT BE', 'ANGRY', 21.0, 22.9, 'GENESIS 45:5', 116), ('GOD SENT ME', 'TO SAVE LIVES', 23.2, 25.6, 'GENESIS 45:5', 104),
 ('IT WAS GOD,', 'NOT YOU', 27.2, 29.3, 'GENESIS 45:8', 112), ('COME AND LIVE', 'IN GOSHEN', 30.0, 32.7, 'GENESIS 45:10', 104),
 ('HE EMBRACED', 'BENJAMIN', 34.3, 36.0, 'GENESIS 45:14', 108), ('KISSED ALL', 'HIS BROTHERS', 36.2, 37.9, 'GENESIS 45:15', 108), ('THEN THEY', 'TALKED', 38.0, 39.5, 'GENESIS 45:15', 120),
 ('PHARAOH', 'WAS GLAD', 40.1, 41.9, 'GENESIS 45:16', 116), ('BRING YOUR FATHER', 'AND FAMILIES', 42.3, 44.1, 'GENESIS 45:18', 88), ('THE BEST OF', 'EGYPT', 44.3, 46.2, 'GENESIS 45:18', 112),
 ('JOSEPH IS ALIVE', 'AND RULES EGYPT', 48.8, 51.6, 'GENESIS 45:26', 96), ('HE DID NOT', 'BELIEVE THEM', 52.1, 54.2, 'GENESIS 45:26', 108), ('UNTIL HE SAW', 'THE WAGONS', 54.3, 56.2, 'GENESIS 45:27', 104),
 ('I WILL SEE HIM', 'BEFORE I DIE', 57.3, 59.5, 'GENESIS 45:28', 100)]
REFL = [(['I AM THE ONE', 'YOU SOLD'], 62.6, 64.0, 104), (['COME', 'CLOSER'], 64.2, 66.5, 124), (['TRUTH ABOUT', 'THE HARM'], 67.0, 68.9, 104), (['AND HE OPENED', 'THE DOOR'], 69.1, 71.2, 100),
 (['PEACE NEEDS', 'HONEST WORDS'], 72.8, 75.1, 104), (['AND AN', 'OPEN HAND'], 75.3, 77.9, 112), (['STEP TOWARD', 'SOMEONE'], 79.1, 81.7, 112), (['YOU HAVE', 'DRIFTED FROM'], 82.0, 84.9, 100)]
def T(l, a, b, size): return "  { l: %s, a: %s, b: %s, y: 330, size: %d, glow: 1, maxW: 980 }," % (str(list(l)), a, b, size)
tl = [T([x[0], x[1]], x[2], x[3], x[5]) for x in STORY] + [T(r[0], r[1], r[2], r[3]) for r in REFL]
refs = ', '.join("['%s', %s, %s]" % (x[4], round(x[2] + .2, 2), x[3]) for x in STORY)
TITLES = ("// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area\nconst TITLES = [\n" + '\n'.join(tl) + "\n];\n" + r"""function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 45', .6, 4.6, 252, { size: 28, track: 7 });
  [""" + refs + r"""].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 45:4', 62.1, 66.0, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 73.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
""")
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main45.js', 'w').write(out)
print('main45.js', len(out))
