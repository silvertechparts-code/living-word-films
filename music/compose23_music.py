"""Episode 23 (Genesis 23, A Place for Sarah) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): Sarah has died, Abraham comes to mourn (a1: a hush at dusk, a dark open chord, a lone string) -> he wept (a2: a single piano line) -> he stands before the Hittites (b1: dignified, sparse)
     -> 'a prince of God among us' (b2: warm respect) -> he bows and asks for the cave of Machpelah (c1: open fifths) -> 'I give it to you' (c2: a tender piano) -> he insists on the full price (c3: a steady, low pulse) -> four hundred shekels (d1: a quiet ticking, the pad rising)
     -> the silver is weighed out (d2: a shimmer of coin bells, resolving) -> the field became his (e1: the warm peak) -> Sarah buried facing Mamre (e2: the peak eases to a held, quiet chord) -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out23/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out23', exist_ok=True)
_nn0 = nn
nn = lambda n: _nn0(n) - 3     # everything below is written in F and sounds a minor third lower, in D
FQ = lambda n: mf(nn(n))
T = 91.0
B = {k: Bus(T) for k in ('str', 'choir', 'brass', 'piano', 'harp', 'bell', 'sub', 'timp', 'dry')}
M = lambda n: mf(nn(n)) if isinstance(n, str) else mf(n)
def trem(x, rate=6.5, depth=.55, ph=0.0):
    t = np.arange(len(x)) / SR; return (x * (1 - depth * (.5 + .5 * np.sin(2 * np.pi * rate * t + ph)))).astype(np.float32)
def pad(a, b, notes, g, att=1.2, bright=1400, rel=1.4, pan0=-.4, tr=None):
    for k, m in enumerate(notes):
        x = strings_note(M(m), (b - a) + .3, att=att, rel=rel, bright=bright)
        if tr: x = trem(x, tr[0], tr[1], k)
        B['str'].add(x, a, g * (1.0 if k < 3 else .8), pan=pan0 + .18 * k)
def choir(a, b, notes, g, vowel='oo', att=1.4, rel=1.3):
    for k, m in enumerate(notes):
        v = vowel + ('_f' if M(m) > 330 else '_m')
        B['choir'].add(choir_note(M(m), (b - a) + .3, v, att=att, rel=rel, voices=3), a, g * (.9 if M(m) < 330 else .7), pan=-.3 + .12 * (k % 5))
def drone(a, b, f, g, att=3.0, rel=2.0):
    n = int((b - a + rel) * SR); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)).astype(np.float32) * env_pad(n, att, rel, b - a)
    B['sub'].add(x, a, g)
def pno(t, name, d=2.4, g=.5, vel=.8, pan=.1): B['piano'].add(piano(M(name), d, vel), t, g, pan=pan)
def bell(t, name, g=.4, d=3.6, pan=0.0): B['bell'].add(S.bell(M(name), d, 1.0), t, g, pan=pan)
def solo(t, name, d, g=.3, att=.4, bright=2200, pan=-.1): B['str'].add(solo_string(M(name), d, att=att, bright=bright), t, g, pan=pan)
BEAT = 60 / 72.0
def arp(a, b, root, third, g, vel=.55, top=1.0):
    """a rolling piano figure on a chord root (MIDI), 8th notes at 72 bpm"""
    t_ = a; n_ = 0
    while t_ < b - .05:
        pat = [root + 24, root + 24 + third, root + 31, root + 36, root + 31, root + 24 + third]
        B['piano'].add(piano(mf(pat[n_ % 6] - 3), 2.2, vel), t_, g * (1.0 if n_ % 6 == 0 else .72), pan=-.4 + .8 * ((n_ % 6) / 5)); t_ += BEAT / 2; n_ += 1


trem_pad = lambda a, b, ns, g, tr: [B['str'].add(trem(strings_note(M(m), (b - a) + .3, att=1.0, rel=1.2, bright=1100), tr, .6, k), a, g, pan=-.4 + .15 * k) for k, m in enumerate(ns)]


# ================================================================== 0 - 8.2  a1: "Sarah died in Kiriath-arba, that is Hebron" (23:2): a hush at dusk, a dark open chord, a lone string
drone(0, 8.6, FQ('F1'), .24, att=1.4, rel=1.6)
pad(0.2, 4.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .2, att=1.8, bright=800); pad(4.4, 8.8, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.4, bright=900)
choir(2.0, 8.4, ['A3', 'D4', 'F4'], .12, 'oo', att=1.8)
solo(1.8, 'F4', 2.4, .2, att=.8, bright=900); solo(4.8, 'D4', 2.2, .2, att=.8, bright=900)
bell(2.2, 'A5', .08, d=4.8); bell(6.0, 'F5', .08, d=4.6, pan=.3)

# ================================================================== 8.2 - 12.0  a2: "Abraham wept for her" (23:2): a single piano line, then rising to stand
pad(8.2, 12.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .18, att=1.2, bright=900)
for t_, nm, d_ in ((8.7, 'D5', 1.8), (9.8, 'C5', 1.8), (10.8, 'Bb4', 2.0)): solo(t_, nm, d_, .2, att=.6, bright=1000); pno(t_, nm, d_ + .8, .2, .5)
choir(9.0, 12.2, ['D4', 'F4', 'Bb4'], .12, 'oo', att=1.4)

# ================================================================== 12.0 - 19.4  b1: he rose and stood before the Hittites: "I am a stranger and a sojourner among you" (23:3-4): dignified, sparse, a slow pulse
pad(12.0, 15.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .2, att=1.2, bright=1200); pad(15.6, 19.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .2, att=1.2, bright=1300)
for k_, t_ in enumerate((12.6, 14.0, 15.4, 16.8, 18.2)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .005 * k_)
for t_, nm, d_ in ((13.0, 'C5', 1.6), (15.0, 'A4', 1.6), (17.0, 'F5', 1.8)): solo(t_, nm, d_, .2, att=.5, bright=1200); pno(t_, nm, d_ + .8, .15, .5)
choir(14.0, 19.6, ['A3', 'C4', 'F4'], .15, 'oo', att=1.5)
bell(13.6, 'F6', .08, d=4.0)

# ================================================================== 19.4 - 25.4  b2: "you are a prince of God among us; bury your dead in the choicest of our tombs" (23:5-6): warm respect
pad(19.4, 22.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500); pad(22.6, 25.8, ['F2', 'C3', 'G3', 'C4', 'E4'], .26, att=1.0, bright=1600)
choir(20.0, 25.4, ['A3', 'C4', 'F4', 'A4'], .22, 'ah', att=1.4)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 21.0 + .34 * k_, .13, pan=-.3 + .2 * k_)
solo(20.6, 'A4', 1.8, .2, att=.6, bright=1300); solo(23.2, 'C5', 1.8, .2, att=.6, bright=1400)
bell(21.4, 'C6', .12, d=4.4); bell(24.0, 'A5', .1, d=4.2, pan=.3)

# ================================================================== 25.4 - 31.6  c1: he bowed to the people of the land and asked for the cave of Machpelah, at the end of Ephron's field (23:7-9): open fifths, gentle
pad(25.4, 28.6, ['D2', 'A2', 'D3', 'A3'], .2, att=1.0, bright=1300); pad(28.6, 31.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .2, att=1.0, bright=1400)
choir(26.2, 31.4, ['A3', 'D4', 'F4'], .16, 'oo', att=1.4)
solo(26.6, 'F5', 1.8, .2, att=.6, bright=1300); solo(29.0, 'D5', 1.8, .2, att=.6, bright=1300)
for k_, nm in enumerate(('D5', 'F5', 'A5')): B['harp'].add(pluck(M(nm)), 28.0 + .36 * k_, .12, pan=-.3 + .2 * k_)
bell(27.0, 'A5', .1, d=4.4)

# ================================================================== 31.6 - 36.0  c2: "I give you the field and the cave in it" (23:10-11): a tender piano, a warm lift
pad(31.6, 36.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.0, bright=1500)
for t_, nm, d_ in ((32.2, 'C5', 1.5), (33.6, 'A4', 1.5), (34.8, 'F5', 1.6)): solo(t_, nm, d_, .18, att=.5, bright=1300); pno(t_, nm, d_ + .8, .18, .55)
choir(32.6, 36.2, ['A3', 'C4', 'F4'], .18, 'ah', att=1.2)
bell(33.0, 'F6', .1, d=4.2)

# ================================================================== 36.0 - 40.0  c3: "let me pay the full price" (23:12-13): firmer, a steady low pulse
drone(36.0, 40.6, FQ('F1'), .26, att=.8, rel=1.6)
pad(36.2, 40.6, ['Bb1', 'F2', 'Bb2', 'D3'], .18, att=1.0, bright=1000)
trem_pad(36.4, 40.6, ['D2', 'A2', 'D3'], .12, 5.6)
for k_, t_ in enumerate((36.6, 37.6, 38.6, 39.6)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .008 * k_)
solo(37.0, 'D5', 1.6, .18, att=.5, bright=1100); solo(38.8, 'F5', 1.6, .18, att=.5, bright=1100)

# ================================================================== 40.0 - 46.4  d1: "four hundred shekels of silver" (23:14-15): the silver is named; a quiet ticking and a slow rise
pad(40.0, 43.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.0, bright=1200); pad(43.4, 46.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .24, att=1.0, bright=1400)
choir(41.0, 46.4, ['A3', 'D4', 'F4', 'A4'], .2, 'ah', att=1.4)
for k_ in range(10): bell(40.8 + .55 * k_, 'A6' if k_ % 2 == 0 else 'F6', .05 + .004 * k_, d=1.6, pan=-.2 + .08 * (k_ % 5))
solo(41.4, 'F5', 1.8, .2, att=.5, bright=1200); solo(44.0, 'A5', 1.8, .2, att=.5, bright=1300)

# ================================================================== 46.4 - 51.4  d2: Abraham weighed out the silver, as the merchants count it (23:16): a shimmer of coin bells, resolving to the home chord
pad(46.4, 49.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500); pad(49.6, 52.0, ['F2', 'C3', 'G3', 'C4'], .26, att=.9, bright=1600)
choir(47.2, 51.6, ['A3', 'C4', 'F4', 'A4'], .22, 'ah', att=1.2)
for k_, nm in enumerate(('C6', 'F6', 'A6', 'C7', 'A6', 'F6')): bell(47.9 + .42 * k_, nm, .14, d=3.4, pan=-.3 + .12 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 49.6 + .32 * k_, .14, pan=-.3 + .2 * k_)
solo(48.0, 'C5', 1.8, .2, att=.5, bright=1400)

# ================================================================== 51.4 - 56.0  e1: the field, the cave and all the trees became Abraham's possession (23:17-18): the peak, warm and wide
B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 51.9, .16)
pad(51.4, 56.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.8, bright=2300)
choir(51.9, 56.0, ['F3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=.8)
for m_ in ('F3', 'C4', 'A4'): B['brass'].add(horn(M(m_), 3.8, att=.9, rel=1.4, peak=1900), 52.1, .18, pan=.05)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 52.2 + .3 * k_, .16, pan=-.4 + .18 * k_)
for t_, nm, d_ in ((52.4, 'C5', 1.4), (53.8, 'F5', 1.5), (55.0, 'A5', 1.6)): solo(t_, nm, d_, .2, att=.4, bright=1700); pno(t_, nm, d_ + .8, .18, .55)
bell(52.0, 'C7', .2, d=4.4, pan=.3); bell(53.4, 'F6', .18, d=4.2); bell(54.8, 'A6', .16, d=4.2, pan=-.3)

# ================================================================== 56.0 - 60.8  e2: "Abraham buried Sarah in the cave of the field of Machpelah, facing Mamre" (23:19-20): the peak eases to a held, quiet chord
pad(56.0, 58.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1800); pad(58.6, 61.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500)
choir(56.4, 60.6, ['F3', 'A3', 'C4', 'F4'], .3, 'ah', att=1.0)
for t_, nm, d_ in ((56.8, 'A4', 1.6), (58.4, 'F5', 1.7), (59.6, 'C5', 1.9)): solo(t_, nm, d_, .2, att=.5, bright=1400); pno(t_, nm, d_ + .8, .18, .5)
bell(57.2, 'F6', .14, d=4.4); bell(59.2, 'A5', .1, d=4.4, pan=.3)

# ================================================================== 60 - 85  the reflection: a soft dawn, gentle piano, slow strings, a hopeful rise (F - Dm - Bb - C -> F)
B['timp'].add(S.timpani(FQ('A1'), 3.0, .5), 60.0, .2)
CH = [(60.2, 63.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (63.6, 67.0, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3), (67.0, 70.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (70.6, 74.2, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4),
      (74.2, 77.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (77.6, 80.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (80.6, 83.0, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3), (83.0, 85.4, ['C2', 'G2', 'Bb2', 'E3', 'G3'], 36, 4)]
IKs = [(60.0, .12), (67.0, .28), (74.2, .6), (80.6, .86), (85.4, .96)]
for a, b, ns, r, ti in CH:
    i = float(np.interp(a + .3, [x for x, y in IKs], [y for x, y in IKs])); pad(a, b, ns, .24 + .5 * i, att=1.0, bright=1100 + 3400 * i)
    arp(a, b, r, ti, .09 + .09 * i, .46 + .2 * i); B['piano'].add(piano(M(ns[0]), min(4.5, b - a + .5), .85), a, .4, pan=-.15)
choir(63.6, 67.0, ['D4', 'F4', 'Bb4'], .2, 'oo', att=1.2); choir(67.0, 74.2, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.2)
choir(74.2, 80.6, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=.9); choir(80.6, 85.4, ['F4', 'A4', 'D5', 'F5'], .56, 'ah', att=.8)
THEME = [(61.4, 'A4', 1.6), (63.2, 'D5', 1.4), (65.0, 'F5', 1.6), (66.8, 'D5', 1.4), (68.6, 'C5', 1.2), (70.0, 'F5', 1.2), (71.4, 'A5', 1.8), (73.4, 'G5', 1.2), (74.8, 'A5', 1.6),
         (76.2, 'C6', 1.2), (77.6, 'F6', 1.6), (79.2, 'D6', 1.2), (80.4, 'Bb5', 1.2), (81.6, 'D6', 1.0), (82.5, 'C6', 1.0)]
for t_, nm, d in THEME:
    pno(t_, nm, d + .9, .56, .8)
    if t_ >= 66.0: solo(t_, nm, d, .3, att=.3, bright=2400)
    if t_ >= 76.0: B['brass'].add(horn(M(nm) / 2, d, att=.3, rel=.6, peak=2200), t_, .38, pan=.15)
bell(61.2, 'D6', .24); bell(65.7, 'F6', .26); bell(71.7, 'C6', .3); bell(78.6, 'F6', .3); bell(79.4, 'D6', .26); bell(80.6, 'F6', .3)
for t_, g_ in ((80.4, .3), (81.0, .36), (81.6, .42), (82.0, .5), (82.4, .58), (82.7, .66), (83.0, .74)): B['timp'].add(S.timpani(FQ('C2'), 1.0, .5), t_, g_ * .6)

# ================================================================== 85 - 90  the question: a warm sustained F-major chord that settles
B['timp'].add(S.timpani(FQ('Bb1'), 2.4, 1.0), 85.0, .6); B['sub'].add(S.sub_boom(FQ('F1'), 3.6), 85.0, .45)
for m in ('F3', 'C4', 'F4', 'A4', 'C5'): B['brass'].add(horn(M(m), 4.6, att=.5, rel=1.8, peak=2600), 85.0, .38, pan=-.2 + .1 * (nn(m) % 4))
pad(85.0, 89.0, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .7, att=.5, bright=3800)
choir(85.0, 89.0, ['F3', 'C4', 'F4', 'A4', 'C5', 'F5'], .7, 'ah', att=.6)
n_ = int(SR * 5.8); B['sub'].add(np.sin(2 * np.pi * FQ('F1') * np.arange(n_) / SR).astype(np.float32) * env_pad(n_, .4, 2.4, 3.4), 85.0, .5)
for t_, nm, g_ in ((85.4, 'F6', .42), (86.8, 'A6', .34), (87.6, 'C7', .28)): bell(t_, nm, g_)
for k_, m in enumerate(('F5', 'C6', 'F6', 'A6', 'C7')): pno(87.4 + .22 * k_, m, 3.2, .28, .6, pan=-.4 + .2 * k_)

# ================================================================== reverb + bus mix
ir = make_ir(4.2, 9)
wet = {'str': .36, 'choir': .55, 'brass': .3, 'piano': .32, 'harp': .42, 'bell': .6, 'sub': 0, 'timp': .2, 'dry': 0}
lvl = {'str': 1.0, 'choir': .85, 'brass': .75, 'piano': 1.0, 'harp': .8, 'bell': .8, 'sub': .95, 'timp': .9, 'dry': 1.0}
ML = np.zeros(B['str'].N, np.float32); MR = np.zeros(B['str'].N, np.float32)
for k, b in B.items():
    L, R = b.L * lvl[k], b.R * lvl[k]
    if wet[k] > 0: wl, wr = reverb(L, R, ir, wet[k]); L = L + wl; R = R + wr
    ML += L; MR += R
    sf.write(f'/home/claude/music/out23/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out23/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
