#!/usr/bin/env python3
# Builds g11/src/main42.js from main41.js (shared page machinery copied) plus the Ep42 shots, titles and Scripture lines.
SRC = '/home/claude/g11/src/'
t = open(SRC + 'main41.js').read()
def cut(a, b=None):
    i = t.index(a); j = t.index(b, i) if b else len(t); return i, j
def rep(s, a, b):
    assert s.count(a) == 1, a[:60]; return s.replace(a, b)
i, _ = cut('// windows follow the narration beats')
head = t[:i]
head = rep(head, 'Episode 41 - Genesis 41.', 'Episode 42 - Genesis 42.')
for m in ('world', 'reflect', 'end', 'subs'):
    head = rep(head, "'./%s41.js'" % m, "'./%s42.js'" % m)

SHOTS_BLOCK = r"""// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 9.6, b1 15.0, b2 22.6, c1 30.1, c2 38.0, d1 45.6, d2 52.9
// phases of the world: 0-2.9 famine in Canaan | 2.9-5.6 Jacob sends ten sons | 5.6-8.6 Benjamin stays | 8.6-10.8 the road to Egypt | 10.8-12.4 they bow | 12.4-15.2 Joseph knows them | 15.2-18.4 spies | 18.4-22.0 their answer | 22.0-24.6 three days | 24.6-28.6 I fear God | 28.6-33.0 they whisper | 33.0-37.2 anguish | 37.2-41.0 Joseph weeps | 41.0-45.0 Simeon bound | 45.0-48.6 silver put back | 48.6-52.6 silver found | 52.6-56.8 home | 56.8-61.7 Jacob refuses
// a1 (0.6-6.9) the famine reached Canaan; Jacob sent ten sons to Egypt for grain, but kept Benjamin home (42:1-5)
const S1 = [K(0, 0, P3(3.4, -6.0, .4), -28, 16, 6.8, { dy: 60 }), K(0, 2.95, P3(3.6, -6.0, .4), -18, 14, 5.4, { dy: 60 })];
const S2 = [K(2.9, 2.9, P3(3.6, -5.2, .42), 4, 17, 3.2, { dy: 60 }), K(2.9, 5.7, P3(3.6, -5.3, .42), 0, 15, 2.6, { dy: 60 })];
const S3 = [K(5.6, 5.6, P3(3.4, -5.55, .36), -66, 7, 1.5, { dy: 60 }), K(5.6, 8.7, P3(3.4, -5.55, .38), -58, 7, 1.2, { dy: 60 })];
const S4 = [K(8.6, 8.6, P3(3.0, .7, .3), -78, 8, 2.6, { dy: 60 }), K(8.6, 10.9, P3(2.2, .8, .3), -66, 9, 2.3, { dy: 60 })];
// a2 (9.6-13.8) the brothers bowed before Joseph (42:6); he knew them, but they did not know him (42:8)
const S5 = [K(10.8, 10.8, P3(-5.3, -.65, .38), 84, 12, 2.1, { dy: 60 }), K(10.8, 12.5, P3(-5.4, -.65, .4), 78, 10, 1.8, { dy: 60 })];
const S6 = [K(12.4, 12.4, P3(-5.8, -.6, .48), 76, 5, 1.0, { dy: 60 }), K(12.4, 15.3, P3(-5.85, -.6, .5), 68, 4, .8, { dy: 60 })];
// b1 (15.0-20.96) you are spies (42:9); we are twelve brothers, the youngest is at home and one is no more (42:13)
const S7 = [K(15.2, 15.2, P3(-5.8, -.6, .44), 58, 8, 1.15, { dy: 60 }), K(15.2, 18.5, P3(-5.7, -.6, .44), 64, 8, 1.3, { dy: 60 })];
const S8 = [K(18.4, 18.4, P3(-5.1, -.65, .4), -38, 9, 2.3, { dy: 60 }), K(18.4, 22.1, P3(-5.1, -.6, .4), -48, 9, 2.0, { dy: 60 })];
// b2 (22.6-28.37) after three days in custody (42:17): I fear God; let one stay and bring your youngest brother (42:18-20)
const S9 = [K(22.0, 22.0, P3(-3.4, -4.35, .3), 4, 38, 2.4, { dy: 60 }), K(22.0, 24.7, P3(-3.4, -4.35, .3), 0, 34, 1.9, { dy: 60 })];
const S10 = [K(24.6, 24.6, P3(-5.8, -.55, .44), 50, 6, 1.1, { dy: 60 }), K(24.6, 28.7, P3(-5.85, -.55, .46), 60, 6, .95, { dy: 60 })];
// c1 (30.1-36.73) they said to one another: this is punishment for what we did to Joseph; we saw his anguish and would not listen (42:21)
const S11 = [K(28.6, 28.6, P3(-5.05, -1.1, .4), 86, 7, 1.2, { dy: 60 }), K(28.6, 33.1, P3(-5.05, -1.1, .4), 78, 7, .95, { dy: 60 })];
const S12 = [K(33.0, 33.0, P3(-5.05, -.2, .4), 52, 6, 1.1, { dy: 60 }), K(33.0, 37.3, P3(-5.05, -.2, .4), 60, 6, .85, { dy: 60 })];
// c2 (38.0-44.3) Joseph understood, turned away and wept (42:23-24); he had Simeon bound before their eyes (42:24)
const S13 = [K(37.2, 37.2, P3(-6.0, -.6, .46), 38, 5, 1.2, { dy: 60 }), K(37.2, 41.1, P3(-6.0, -.6, .46), 34, 5, .9, { dy: 60 })];
const S14 = [K(41.0, 41.0, P3(-5.2, -.45, .38), 46, 9, 2.0, { dy: 60 }), K(41.0, 45.1, P3(-5.1, -.4, .38), 52, 9, 1.6, { dy: 60 })];
// d1 (45.6-51.97) he had their silver put back in their sacks (42:25); they found it, and their hearts sank (42:28)
const S15 = [K(45.0, 45.0, P3(-4.4, -.7, .3), 28, 12, 1.5, { dy: 60 }), K(45.0, 48.7, P3(-4.45, -.7, .28), 22, 14, 1.15, { dy: 60 })];
const S16 = [K(48.6, 48.6, P3(1.8, 1.15, .2), -48, 18, 1.6, { dy: 60 }), K(48.6, 52.7, P3(1.75, 1.12, .2), -40, 20, 1.2, { dy: 60 })];
// d2 (52.9-59.89) at home Jacob said: Joseph is gone, Simeon is gone, and now you would take Benjamin; my son shall not go down with you (42:36, 42:38)
const S17 = [K(52.6, 52.6, P3(3.6, -5.1, .42), 4, 17, 2.8, { dy: 60 }), K(52.6, 56.9, P3(3.6, -5.2, .42), 0, 15, 2.3, { dy: 60 })];
const S18 = [K(56.8, 56.8, P3(3.4, -5.55, .42), -34, 8, 1.4, { dy: 60 }), K(56.8, 61.8, P3(3.4, -5.55, .44), -28, 7, .95, { dy: 60 })];
const LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];
"""
i, j = cut('const landShot = (id, S, extra = {}) =>', 'const SHOTS = [')
LANDSHOT = t[i:j]
SHOTS_LIST = r"""const SHOTS = [
  landShot('famine', S1, { xin: 0 }), landShot('send', S2, { xin: 0 }), landShot('benjamin', S3, { xin: 0 }), landShot('road', S4, { xin: 0 }), landShot('bow', S5, { xin: 0 }), landShot('knew', S6, { xin: 0 }), landShot('spies', S7, { xin: 0 }), landShot('answer', S8, { xin: 0 }),
  landShot('cell', S9, { xin: 0 }), landShot('fear', S10, { xin: 0 }), landShot('whisper', S11, { xin: 0 }), landShot('anguish', S12, { xin: 0 }), landShot('wept', S13, { xin: 0 }), landShot('bound', S14, { xin: 0 }), landShot('silverput', S15, { xin: 0 }), landShot('silverfind', S16, { xin: 0 }), landShot('home', S17, { xin: 0 }), landShot('refuse', S18, { xin: 0 }),
"""
i, j = cut("  { id: 'reflect', t0: RT.t0", '// ---------- render one shot into a 2D context')
REST1 = t[i:j]
i, j = cut('// ---------- render one shot into a 2D context', '// ---------- titles (one block per beat)')
REST2 = t[i:j]
TITLES = r"""// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['FAMINE REACHED', 'CANAAN'], a: .7, b: 2.7, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JACOB SENT', 'TEN SONS'], a: 3.2, b: 5.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['BENJAMIN', 'STAYED HOME'], a: 5.9, b: 8.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['TO EGYPT', 'FOR GRAIN'], a: 8.9, b: 10.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THEY BOWED', 'BEFORE JOSEPH'], a: 11.0, b: 12.3, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE KNEW THEM.', 'THEY DID NOT'], a: 12.6, b: 15.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['“YOU ARE', 'SPIES”'], a: 15.4, b: 18.1, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['TWELVE BROTHERS,', 'ONE IS NO MORE'], a: 18.7, b: 21.8, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['THREE DAYS', 'IN CUSTODY'], a: 22.2, b: 24.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['“I FEAR GOD.”', 'BRING THE YOUNGEST'], a: 24.9, b: 28.4, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['“THIS IS', 'PUNISHMENT”'], a: 29.8, b: 32.9, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['WE SAW HIS', 'ANGUISH'], a: 33.4, b: 36.9, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['JOSEPH', 'WEPT'], a: 38.8, b: 41.0, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['SIMEON', 'BOUND'], a: 41.6, b: 44.8, y: 330, size: 120, glow: 1, maxW: 980 },
  { l: ['SILVER PUT BACK', 'IN THEIR SACKS'], a: 45.4, b: 48.4, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['“WHAT HAS GOD', 'DONE TO US?”'], a: 49.2, b: 52.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['AT HOME,', 'JACOB SAID'], a: 53.1, b: 56.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['BENJAMIN', 'WILL NOT GO'], a: 57.1, b: 60.3, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['YEARS LATER,', 'THEY SPOKE OF IT'], a: 62.0, b: 65.5, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['THE WRONG HAD NOT', 'STAYED BURIED'], a: 66.9, b: 70.3, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['FACING IT IS', 'WHERE REPAIR BEGINS'], a: 73.2, b: 77.0, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['NAME ONE WRONG', 'YOU HAVE AVOIDED'], a: 79.0, b: 81.9, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['AND BRING', 'IT TO GOD'], a: 82.2, b: 84.9, y: 330, size: 108, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 42', .6, 4.6, 252, { size: 28, track: 7 });
  [['GENESIS 42:1–2', .9, 2.8], ['GENESIS 42:2–3', 3.3, 5.3], ['GENESIS 42:4', 6.0, 8.4], ['GENESIS 42:5', 9.0, 10.6], ['GENESIS 42:6', 11.1, 12.3], ['GENESIS 42:7–8', 12.7, 15.0], ['GENESIS 42:9', 15.5, 18.1], ['GENESIS 42:10–13', 18.8, 21.8], ['GENESIS 42:17', 22.3, 24.4], ['GENESIS 42:18–20', 25.0, 28.4], ['GENESIS 42:21', 29.9, 32.9], ['GENESIS 42:21', 33.5, 36.9], ['GENESIS 42:23–24', 38.9, 41.0], ['GENESIS 42:24', 41.7, 44.8], ['GENESIS 42:25', 45.5, 48.4], ['GENESIS 42:27–28', 49.3, 52.4], ['GENESIS 42:36', 53.2, 56.4], ['GENESIS 42:38', 57.2, 60.3]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 42:21', 62.1, 65.5, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 73.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
"""
i, j = cut('function seek(t) {')
TAIL = t[i:]
out = head + SHOTS_BLOCK + LANDSHOT + SHOTS_LIST + REST1 + REST2 + TITLES + TAIL
open(SRC + 'main42.js', 'w').write(out)
print('main42.js', len(out))
