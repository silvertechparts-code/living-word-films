"""Episode 09 (Genesis 9) score -- original, synthesised with numpy.
Arc: a low drone over a violent world (D minor) -> solemn grief (slow choir, tremolo strings) -> one warm ray: Noah finds favour (F major, piano + harp)
     -> gentle family theme -> the ark: a restrained piano ostinato and soft timpani build (Dm-Bb-F-C) -> held dominant under gathering clouds
     -> the modern reflection opens in D minor and rises to F major -> the question: a warm sustained chord that settles.
Outputs: out9/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out9', exist_ok=True)
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


# ================================================================== 0 - 4.7  "After the flood, God spoke": a hush after the storm. A low F drone, a solo string, one bell (F major)
drone(0, 6.0, 43.65, .46, att=2.4); drone(0.4, 5.6, 65.4, .2, att=2.6)
pad(0.0, 2.6, ['F2', 'C3', 'F3', 'A3'], .2, att=2.0, bright=700); pad(2.6, 6.0, ['Bb2', 'F3', 'Bb3', 'D4'], .24, att=1.0, bright=1000)
choir(1.0, 6.0, ['A3', 'C4', 'F4'], .16, 'oo', att=2.0)
for t_, nm, d_ in ((1.2, 'C5', 2.0), (2.8, 'F5', 1.8), (4.0, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.6, bright=1600)
pno(0.8, 'F2', 4.6, .4, .6); bell(2.0, 'C6', .14, d=4.4, pan=-.3); bell(4.4, 'F6', .12, d=4.4, pan=.3)
B['timp'].add(S.timpani(43, 2.4, .35), 0.2, .22)

# ================================================================== 4.7 - 13.0  the blessing: warm, a rolling piano figure and harp (F - Bb - C - F). "Be fruitful, and fill the earth"
BL = [(4.7, 7.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (7.6, 10.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (10.4, 13.2, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)]
for a, b, ns, r, ti in BL:
    k = (a - 4.7) / 8.5; pad(a, b, ns, .26 + .1 * k, att=.9, bright=1300 + 700 * k); arp(a, b, r, ti, .1 + .03 * k, .46 + .08 * k)
choir(5.0, 13.2, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=1.4)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4', 'Bb4', 'D5')): B['harp'].add(pluck(M(nm)), 5.6 + .6 * k_, .22 + .01 * k_, pan=-.4 + .1 * k_)
for t_, nm, d_ in ((5.2, 'A5', 1.6), (7.4, 'C6', 1.6), (9.2, 'F5', 1.8), (11.0, 'G5', 1.6)): solo(t_, nm, d_, .24, att=.5, bright=2200)
bell(8.2, 'F6', .2); bell(11.0, 'C6', .2, d=4.6)

# ================================================================== 13.0 - 21.2  the covenant: solemn and growing (Bb - F - C - Dm), low horns, soft timpani
B['timp'].add(S.timpani(41, 3.0, .7), 13.2, .4); B['sub'].add(S.sub_boom(41.2, 3.0), 13.2, .3)
CV = [(13.2, 16.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (16.4, 18.8, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (18.8, 21.4, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)]
for a, b, ns, r, ti in CV:
    k = (a - 13.2) / 8.2; pad(a, b, ns, .3 + .12 * k, att=.8, bright=1500 + 900 * k); arp(a, b, r, ti, .1 + .03 * k, .48 + .08 * k); B['piano'].add(piano(M(ns[0]), 3.0, .8), a, .34, pan=-.15)
for m in ('Bb2', 'F3', 'D4'): B['brass'].add(horn(M(m), 4.4, att=1.0, rel=1.6, peak=1700), 15.6, .26, pan=-.1)
choir(13.4, 21.4, ['D4', 'F4', 'Bb4', 'D5'], .32, 'oo', att=1.4)
for t_, nm, d_ in ((14.6, 'D5', 1.6), (16.2, 'F5', 1.6), (17.8, 'A5', 1.8), (19.6, 'G5', 1.8)): pno(t_, nm, d_ + 1.0, .46, .7); solo(t_ + .05, nm, d_, .2, att=.5, bright=2200)
bell(15.0, 'Bb5', .18); bell(18.0, 'F6', .2)

# ================================================================== 21 - 30.6  THE BOW: the peak of the chapter. Rising bells, harp run, choir and horns in F major
B['timp'].add(S.timpani(46, 3.2, .9), 21.4, .46); B['sub'].add(S.sub_boom(43.65, 3.4), 21.4, .38)
for m in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m), 6.0, att=.8, rel=1.8, peak=2100), 22.2, .32, pan=-.1)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.6, att=.8, rel=1.6, peak=2300), 26.2, .3, pan=.1)
PK = [(21.4, 24.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (24.6, 27.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (27.4, 30.8, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)]
for a, b, ns, r, ti in PK:
    k = (a - 21.4) / 9.4; pad(a, b, ns, .4 + .26 * (1 - k), att=.7, bright=2200 + 1200 * (1 - k)); arp(a, b, r, ti, .13, .56); B['piano'].add(piano(M(ns[0]), 3.2, .85), a, .4, pan=-.15)
choir(21.6, 30.8, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=1.1)
for k_, (t_, nm) in enumerate(((22.0, 'A5'), (23.0, 'C6'), (24.0, 'F6'), (25.2, 'A6'), (26.4, 'C7'))): bell(t_, nm, .22 + .03 * k_, d=4.0, pan=-.4 + .2 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'C6', 'F6', 'A6', 'F6')): B['harp'].add(pluck(M(nm)), 21.6 + .26 * k_, .28 + .008 * k_, pan=-.5 + .1 * k_)

# ================================================================== 30.6 - 37  the vineyard: pastoral and quiet (F - C - Bb). A plain solo line, soft plucks, no timpani
for a, b, ns in ((30.8, 33.4, ['F2', 'C3', 'F3', 'A3']), (33.4, 36.0, ['Bb1', 'F2', 'Bb2', 'D3']), (36.0, 38.0, ['C2', 'G2', 'C3', 'E3'])): pad(a, b, ns, .24, att=1.0, bright=1500)
choir(31.0, 37.4, ['F4', 'A4', 'C5'], .2, 'oo', att=1.4)
for t_, nm, d_ in ((31.4, 'A4', 1.4), (32.8, 'C5', 1.4), (34.0, 'D5', 1.6), (35.4, 'C5', 1.6)): solo(t_, nm, d_, .28, att=.4, bright=2200); pno(t_, nm, d_ + .8, .36, .65)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'A4', 'Bb4', 'D5')): B['harp'].add(pluck(M(nm)), 32.0 + .5 * k_, .2, pan=-.3 + .1 * k_)

# ================================================================== 36.8 - 41  Ham looks: a low unease (D minor), the line darkens; sparse
n_ = int(SR * 5.0); fifth = (np.sin(2 * np.pi * 73.4 * np.arange(n_) / SR) + .5 * np.sin(2 * np.pi * 110 * np.arange(n_) / SR)).astype(np.float32) * env_pad(n_, 1.0, 1.6, 2.6); B['sub'].add(fifth, 36.6, .24)
pad(36.8, 41.4, ['D2', 'A2', 'D3', 'F3'], .2, att=1.2, bright=700)
for t_, nm, d_ in ((37.4, 'D4', 1.6), (38.8, 'E4', 1.4), (40.0, 'D4', 1.8)): solo(t_, nm, d_, .3, att=.5, bright=1100)
pno(38.0, 'A2', 3.0, .34, .6)

# ================================================================== 40.6 - 46  the cloak: tender (Bb - F - Gm), a warm solo line, choir "oo"
for a, b, ns in ((40.8, 43.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3']), (43.2, 45.2, ['G2', 'D3', 'G3', 'Bb3']), (45.2, 46.6, ['F2', 'C3', 'F3', 'A3'])): pad(a, b, ns, .26, att=1.0, bright=1500)
choir(41.0, 46.6, ['D4', 'F4', 'Bb4'], .26, 'oo', att=1.4)
for t_, nm, d_ in ((41.6, 'F5', 1.6), (43.0, 'D5', 1.6), (44.4, 'Bb4', 1.8)): solo(t_, nm, d_, .3, att=.5, bright=2200); pno(t_, nm, d_ + .8, .4, .7)
bell(42.2, 'D6', .16); bell(44.8, 'F6', .16)

# ================================================================== 46 - 50.8  Noah wakes: grave and reverent (Dm - Bb), low horns
B['timp'].add(S.timpani(38, 2.8, .5), 46.2, .3)
pad(46.4, 49.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1100); pad(49.0, 51.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=1.0, bright=1400)
for m in ('D3', 'A3', 'D4'): B['brass'].add(horn(M(m), 4.0, att=1.0, rel=1.4, peak=1500), 46.8, .24, pan=-.1)
choir(47.0, 51.2, ['D4', 'F4', 'A4'], .3, 'oo', att=1.2)
for t_, nm, d_ in ((47.8, 'A4', 1.6), (49.2, 'F4', 1.6), (50.2, 'D5', 1.8)): pno(t_, nm, d_ + 1.0, .44, .7)
bell(49.6, 'A5', .14)

# ================================================================== 50.8 - 60  the bow remained: an everlasting covenant. F major swells to a peak, then eases into the reflection
B['timp'].add(S.timpani(46, 3.0, .9), 51.4, .44); B['sub'].add(S.sub_boom(43.65, 3.2), 51.4, .34)
for m in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m), 5.2, att=.9, rel=1.6, peak=1900), 52.2, .3, pan=-.1)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.4, att=.8, rel=1.6, peak=2300), 56.0, .34, pan=.1)
PRO = [(51.4, 54.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (54.6, 57.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (57.2, 60.4, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)]
for a, b, ns, r, ti in PRO:
    k = (a - 51.4) / 9.0; pad(a, b, ns, .38 + .3 * k, att=.7, bright=1900 + 1800 * k); arp(a, b, r, ti, .11 + .06 * k, .5 + .16 * k)
    B['piano'].add(piano(M(ns[0]), 3.2, .85), a, .4, pan=-.15)
choir(51.6, 60.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=1.2)
for k_, (t_, nm) in enumerate(((52.4, 'A5'), (53.8, 'C6'), (55.2, 'F6'), (56.8, 'A6'), (58.2, 'C7'))): bell(t_, nm, .2 + .03 * k_, d=4.0, pan=-.4 + .2 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'Bb5', 'D6', 'F6', 'D6', 'Bb5', 'G5')): B['harp'].add(pluck(M(nm)), 52.0 + .55 * k_, .26 + .008 * k_, pan=-.5 + .08 * k_)

# ================================================================== 60 - 85  the reflection: a soft dawn, gentle piano, slow strings, a hopeful rise (F - Dm - Bb - C -> F)
B['timp'].add(S.timpani(50, 3.0, .5), 60.0, .2)
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
for t_, g_ in ((80.4, .3), (81.0, .36), (81.6, .42), (82.0, .5), (82.4, .58), (82.7, .66), (83.0, .74)): B['timp'].add(S.timpani(65, 1.0, .5), t_, g_ * .6)

# ================================================================== 85 - 90  the question: a warm sustained F-major chord that settles
B['timp'].add(S.timpani(58, 2.4, 1.0), 85.0, .6); B['sub'].add(S.sub_boom(43.65, 3.6), 85.0, .45)
for m in ('F3', 'C4', 'F4', 'A4', 'C5'): B['brass'].add(horn(M(m), 4.6, att=.5, rel=1.8, peak=2600), 85.0, .38, pan=-.2 + .1 * (nn(m) % 4))
pad(85.0, 89.0, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .7, att=.5, bright=3800)
choir(85.0, 89.0, ['F3', 'C4', 'F4', 'A4', 'C5', 'F5'], .7, 'ah', att=.6)
n_ = int(SR * 5.8); B['sub'].add(np.sin(2 * np.pi * 43.65 * np.arange(n_) / SR).astype(np.float32) * env_pad(n_, .4, 2.4, 3.4), 85.0, .5)
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
    sf.write(f'/home/claude/music/out9/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out9/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

