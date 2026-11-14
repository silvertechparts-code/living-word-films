"""Episode 10 (Genesis 10) score -- original, synthesised with numpy.
Arc (written in F-vocabulary, transposed down 3 semitones so the film sounds in D): a low drone over a violent world (D minor) -> solemn grief (slow choir, tremolo strings) -> one warm ray: Noah finds favour (F major, piano + harp)
     -> gentle family theme -> the ark: a restrained piano ostinato and soft timpani build (Dm-Bb-F-C) -> held dominant under gathering clouds
     -> the modern reflection opens in D minor and rises to F major -> the question: a warm sustained chord that settles.
Outputs: out10/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out10', exist_ok=True)
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
        B['piano'].add(piano(mf(pat[n_ % 6]), 2.2, vel), t_, g * (1.0 if n_ % 6 == 0 else .72), pan=-.4 + .8 * ((n_ % 6) / 5)); t_ += BEAT / 2; n_ += 1



# ================================================================== 0 - 5.2  "After the flood, Noah's three sons had children": a hush, then the first light (D)
drone(0, 6.0, FQ('F1'), .46, att=2.4); drone(0.4, 5.6, FQ('C2'), .2, att=2.6)
pad(0.0, 2.6, ['F2', 'C3', 'F3', 'A3'], .2, att=2.0, bright=700); pad(2.6, 5.6, ['Bb2', 'F3', 'Bb3', 'D4'], .24, att=1.0, bright=1000)
choir(1.0, 5.6, ['A3', 'C4', 'F4'], .16, 'oo', att=2.0)
for t_, nm, d_ in ((1.2, 'C5', 2.0), (2.8, 'F5', 1.8), (4.0, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.6, bright=1600)
pno(0.8, 'F2', 4.6, .4, .6); bell(2.0, 'C6', .14, d=4.4, pan=-.3); bell(4.4, 'F6', .12, d=4.4, pan=.3)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .35), 0.2, .22)

# ================================================================== 5.2 - 15.9  Japheth's coastlands and Ham's sons: wonder, a rolling piano figure and harp (F - Bb - C)
for a, b, ns, r, ti in ((5.2, 8.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (8.6, 12.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (12.0, 15.9, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)):
    k = (a - 5.2) / 10.7; pad(a, b, ns, .26 + .1 * k, att=.9, bright=1300 + 700 * k); arp(a, b, r, ti, .1 + .03 * k, .46 + .08 * k)
choir(5.6, 15.9, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=1.4)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4', 'Bb4', 'D5', 'F5', 'A5')): B['harp'].add(pluck(M(nm)), 6.0 + .62 * k_, .22 + .01 * k_, pan=-.4 + .09 * k_)
for t_, nm, d_ in ((5.8, 'A5', 1.6), (8.0, 'C6', 1.6), (10.4, 'F5', 1.8), (12.6, 'G5', 1.6), (14.2, 'A5', 1.4)): solo(t_, nm, d_, .24, att=.5, bright=2200)
bell(9.0, 'F6', .2); bell(13.0, 'C6', .2, d=4.6)

# ================================================================== 15.9 - 31.4  Nimrod, Babel, Nineveh: a darker line (Dm - Gm), timpani and low horns; the city rises; a brass peak at Nineveh
B['timp'].add(S.timpani(FQ('D1'), 3.0, .7), 15.9, .4); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 15.9, .3)
for a, b, ns, r, ti in ((15.9, 19.2, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3), (19.2, 22.0, ['G2', 'D3', 'G3', 'Bb3', 'D4'], 31, 3), (22.0, 24.8, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3)):
    k = (a - 15.9) / 9.0; pad(a, b, ns, .28 + .1 * k, att=.8, bright=1100 + 800 * k); arp(a, b, r, ti, .09 + .03 * k, .46 + .06 * k)
for m in ('D3', 'A3', 'D4'): B['brass'].add(horn(M(m), 4.0, att=1.0, rel=1.6, peak=1600), 17.2, .26, pan=-.1)
choir(16.2, 24.8, ['D4', 'F4', 'A4'], .3, 'oo', att=1.4)
for t_, nm, d_ in ((16.8, 'A4', 1.6), (18.4, 'D5', 1.6), (20.2, 'C5', 1.6), (22.0, 'A4', 1.6), (23.4, 'D5', 1.4)): pno(t_, nm, d_ + 1.0, .44, .7); solo(t_ + .05, nm, d_, .18, att=.5, bright=1300)
# Babel: the city rises (24.8 - 27.2)
B['timp'].add(S.timpani(FQ('F1'), 2.6, .8), 24.8, .4)
for k_, (t_, nm) in enumerate(((24.9, 'F5'), (25.5, 'A5'), (26.1, 'C6'), (26.7, 'F6'))): bell(t_, nm, .2 + .04 * k_, d=3.6, pan=-.4 + .27 * k_)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.4, att=.9, rel=1.6, peak=2100), 25.0, .3, pan=.1)
pad(24.8, 28.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .38, att=.7, bright=2000); arp(24.8, 28.4, 34, 4, .11, .54)
# Nineveh (28.7): brass peak (C -> F)
B['timp'].add(S.timpani(FQ('F1'), 3.0, .9), 28.7, .44); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 28.7, .36)
for m in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m), 4.6, att=.7, rel=1.8, peak=2300), 28.7, .32, pan=-.1)
pad(28.4, 31.6, ['C2', 'G2', 'C3', 'E3', 'G3'], .4, att=.6, bright=2400); arp(28.4, 31.6, 36, 4, .12, .56)
choir(25.0, 31.6, ['A3', 'C4', 'F4', 'A4'], .4, 'ah', att=1.2)
bell(29.5, 'A5', .2, d=4.0, pan=-.3); bell(30.2, 'C6', .22, d=4.0, pan=.3)

# ================================================================== 31.6 - 45.0  Shem: pastoral and warm (F - C - Bb - F); a plain solo line, soft plucks for the camps and the line to Eber
for a, b, ns in ((31.6, 34.6, ['F2', 'C3', 'F3', 'A3']), (34.6, 37.6, ['C2', 'G2', 'C3', 'E3']), (37.6, 41.0, ['Bb1', 'F2', 'Bb2', 'D3']), (41.0, 45.0, ['F2', 'C3', 'F3', 'A3'])): pad(a, b, ns, .26, att=1.0, bright=1600)
choir(32.0, 44.8, ['F4', 'A4', 'C5'], .24, 'oo', att=1.6)
for t_, nm, d_ in ((32.0, 'A4', 1.6), (33.6, 'C5', 1.5), (35.2, 'D5', 1.6), (36.8, 'C5', 1.6), (38.4, 'A4', 1.6), (40.0, 'Bb4', 1.8), (41.8, 'C5', 1.6), (43.4, 'A4', 1.6)): solo(t_, nm, d_, .28, att=.4, bright=2200); pno(t_, nm, d_ + .8, .36, .65)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'A4', 'Bb4', 'D5', 'C5', 'A4', 'F5', 'C5')): B['harp'].add(pluck(M(nm)), 36.7 + .45 * k_, .2, pan=-.3 + .07 * k_)
bell(40.4, 'C6', .18); bell(41.95, 'F6', .2, d=4.4)

# ================================================================== 45.0 - 48.4  "In Peleg's days the earth was divided": a deep boom, an open fifth, one long note
B['timp'].add(S.timpani(FQ('D1'), 3.0, .9), 45.16, .46); B['sub'].add(S.sub_boom(FQ('D1'), 3.6), 45.16, .42)
pad(45.0, 48.8, ['D2', 'A2', 'E3', 'A3'], .3, att=.5, bright=900)
for m in ('D3', 'A3', 'D4'): B['brass'].add(horn(M(m), 3.6, att=.8, rel=1.4, peak=1400), 45.4, .24, pan=-.1)
solo(45.8, 'A4', 2.6, .3, att=.5, bright=1100); bell(46.2, 'D6', .14)

# ================================================================== 48.2 - 60.4  the nations spread: F major swells to a peak (F - Bb - Dm - C - F), choir, brass, bells, harp runs; the crane rises
B['timp'].add(S.timpani(FQ('F1'), 3.0, .8), 48.2, .4); B['sub'].add(S.sub_boom(FQ('F1'), 3.2), 48.2, .32)
PRO = [(48.4, 51.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (51.6, 54.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (54.6, 57.4, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4), (57.4, 60.4, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4)]
for a, b, ns, r, ti in PRO:
    k = (a - 48.4) / 12.0; pad(a, b, ns, .36 + .3 * k, att=.7, bright=1800 + 1900 * k); arp(a, b, r, ti, .11 + .06 * k, .5 + .16 * k); B['piano'].add(piano(M(ns[0]), 3.2, .85), a, .4, pan=-.15)
for m in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m), 5.2, att=.9, rel=1.6, peak=1900), 50.0, .3, pan=-.1)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.6, att=.8, rel=1.6, peak=2300), 54.2, .34, pan=.1)
choir(48.8, 60.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=1.2)
for k_, (t_, nm) in enumerate(((49.4, 'A5'), (51.0, 'C6'), (52.6, 'F6'), (54.2, 'A6'), (55.8, 'C7'), (57.4, 'F6'))): bell(t_, nm, .2 + .03 * k_, d=4.0, pan=-.4 + .16 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'Bb5', 'D6', 'F6', 'D6', 'Bb5', 'G5', 'A5', 'C6')): B['harp'].add(pluck(M(nm)), 49.0 + .55 * k_, .26 + .008 * k_, pan=-.5 + .07 * k_)

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
bell(60.6, 'D6', .24); bell(65.9, 'F6', .26); bell(71.0, 'C6', .3); bell(77.7, 'F6', .3); bell(79.4, 'D6', .26); bell(80.6, 'F6', .3)
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
    sf.write(f'/home/claude/music/out10/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out10/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

