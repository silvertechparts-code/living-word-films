#!/usr/bin/env python3
# Builds g11/src/main47.js from main46.js (shared page machinery copied) plus the Ep47 shots, titles and Scripture lines.
import json, os
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main46.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 46 - Genesis 46.', 'Episode 47 - Genesis 47.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s46.js'" % m, "'./%s47.js'" % m)
exec(open('/home/claude/g11/tools_ep47/cams47.py').read())
def kline(n):
    ks = ["K(%s, %s, P3(%s, %s, %s), %s, %s, %s, { dy: 60 })" % k for k in CAMS[n]]
    return "const %s = [%s];" % (n, ', '.join(ks))
SHOTS_BLOCK = ("// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.8, b1 12.9, b2 18.9, c1 24.5, c2 31.9, d1 41.5, d2 46.7, e1 56.5\n"
 "// phases of the world: 0-24 Pharaoh's court (the brothers, Jacob's blessing), with Goshen at 9.7-12.9 | 24-41 the famine: the granary, the livestock, the field, the seed | 41-50 Goshen grows, Jacob at his tent | 50-62 the bed, the oath, the bow at dusk\n"
 + '\n'.join(kline('S%d' % n) for n in range(1, 21)) + "\nconst LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];\n")
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
IDS = ['court', 'shepherds', 'settle', 'goshen', 'jacobin', 'bless', 'asks', 'years', 'famine', 'silver', 'stock', 'buyland', 'seed', 'saved', 'numerous', 'lived', 'dying', 'bury', 'swear', 'bow']
SHOTS_LIST = "const SHOTS = [\n  " + ', '.join("landShot('%s', S%d, { xin: 0 })" % (n, k + 1) for k, n in enumerate(IDS)) + ",\n"
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
# (line 1, line 2, from, to, Scripture reference, size); windows follow the real clip phrases (a1 0.6, a2 7.8, b1 12.9, b2 18.9, c1 24.5, c2 31.9, d1 41.5, d2 46.7, e1 56.5)
STORY = [
 ('JOSEPH BROUGHT', 'HIS BROTHERS', .8, 3.0, 'GENESIS 47:2', 92), ('WE ARE', 'SHEPHERDS', 3.4, 5.5, 'GENESIS 47:3', 124), ('THE FAMINE IN', 'CANAAN IS SEVERE', 5.7, 7.5, 'GENESIS 47:4', 88),
 ('SETTLE THEM', 'IN GOSHEN', 8.0, 10.6, 'GENESIS 47:6', 112), ('THE BEST', 'OF THE LAND', 10.8, 12.5, 'GENESIS 47:6', 112),
 ('JACOB BLESSED', 'PHARAOH', 13.2, 15.8, 'GENESIS 47:7', 104), ('HOW OLD', 'ARE YOU?', 16.4, 18.5, 'GENESIS 47:8', 124),
 ('A HUNDRED AND', 'THIRTY YEARS', 19.1, 21.4, 'GENESIS 47:9', 100), ('FEW AND HARD', 'HAVE BEEN MY YEARS', 21.7, 24.2, 'GENESIS 47:9', 76),
 ('THE FAMINE', 'GREW HEAVY', 24.7, 26.7, 'GENESIS 47:13', 112), ('FIRST SILVER', 'FOR GRAIN', 27.0, 28.9, 'GENESIS 47:14', 108), ('THEN THEIR', 'LIVESTOCK', 29.2, 31.1, 'GENESIS 47:17', 112),
 ('JOSEPH BOUGHT', 'THE LAND', 32.0, 34.2, 'GENESIS 47:20', 104), ('HE GAVE THEM', 'SEED', 34.4, 36.0, 'GENESIS 47:23', 120), ('A FIFTH TO', 'PHARAOH', 36.2, 38.0, 'GENESIS 47:24', 112),
 ('YOU HAVE SAVED', 'OUR LIVES', 38.3, 40.9, 'GENESIS 47:25', 100),
 ('ISRAEL SETTLED', 'IN GOSHEN', 41.7, 44.2, 'GENESIS 47:27', 100), ('A VERY', 'NUMEROUS PEOPLE', 44.4, 46.5, 'GENESIS 47:27', 96),
 ('JACOB LIVED', 'SEVENTEEN YEARS', 47.0, 49.6, 'GENESIS 47:28', 100), ('DO NOT BURY ME', 'IN EGYPT', 50.2, 52.8, 'GENESIS 47:29', 100), ('CARRY ME TO', 'MY FATHERS', 53.0, 55.4, 'GENESIS 47:30', 104),
 ('JOSEPH', 'SWORE IT', 56.7, 58.6, 'GENESIS 47:31', 124), ('ISRAEL BOWED', 'AT HIS BED', 58.8, 60.2, 'GENESIS 47:31', 104)]
REFL = [(['HIS LIFE,', 'A JOURNEY'], 62.0, 64.0, 108), (['FEW AND', 'HARD YEARS'], 64.1, 66.0, 108), (['YET HE', 'BLESSED A KING'], 66.9, 69.0, 100), (['TO BE CARRIED', 'TO HIS FATHERS'], 69.1, 71.0, 92),
 (['HARD YEARS', 'DO NOT WASTE'], 72.7, 74.6, 108), (['A LIFE WALKING', 'TO A PROMISE'], 74.7, 78.6, 96), (['HOLD YOUR', 'TROUBLES LOOSELY'], 79.1, 81.0, 84), (['KEEP', 'WALKING'], 81.1, 84.0, 124)]
def T(l, a, b, size): return "  { l: %s, a: %s, b: %s, y: 330, size: %d, glow: 1, maxW: 980 }," % (str(list(l)), a, b, size)
tl = [T([x[0], x[1]], x[2], x[3], x[5]) for x in STORY] + [T(r[0], r[1], r[2], r[3]) for r in REFL]
refs = ', '.join("['%s', %s, %s]" % (x[4], round(x[2] + .2, 2), x[3]) for x in STORY)
TITLES = ("// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area\nconst TITLES = [\n" + '\n'.join(tl) + "\n];\n" + r"""function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 47', .6, 4.6, 252, { size: 28, track: 7 });
  [""" + refs + r"""].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 47:9', 61.9, 66.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 47:7', 66.6, 68.9, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 47:30', 69.0, 71.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 72.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
""")
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main47.js', 'w').write(out)
print('main47.js', len(out))
