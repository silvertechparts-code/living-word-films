"""Episode 07 (Genesis 7) score -- original, synthesised with numpy.
Arc: a low drone over a violent world (D minor) -> solemn grief (slow choir, tremolo strings) -> one warm ray: Noah finds favour (F major, piano + harp)
     -> gentle family theme -> the ark: a restrained piano ostinato and soft timpani build (Dm-Bb-F-C) -> held dominant under gathering clouds
     -> the modern reflection opens in D minor and rises to F major -> the question: a warm sustained chord that settles.
Outputs: out7/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out7', exist_ok=True)
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

# ================================================================== 0 - 8  the call: a low drone, open fifths, one solo line rising (D minor)
drone(0, 8.8, 36.7, .5, att=3.0); drone(0.6, 8.4, 55.0, .2, att=3.4)
pad(0.0, 4.4, ['D3', 'A3', 'F4'], .26, att=2.6, bright=900); pad(4.4, 8.8, ['Bb2', 'F3', 'D4', 'F4'], .28, att=1.4, bright=1100)
choir(1.8, 8.6, ['A3', 'D4', 'F4'], .14, 'oo', att=2.4)
for t_, nm, d_ in ((1.6, 'A4', 2.2), (3.6, 'D5', 2.0), (5.4, 'F5', 2.8)): solo(t_, nm, d_, .28, att=.7, bright=1700)
pno(0.8, 'D2', 5.0, .44, .6); pno(4.6, 'Bb2', 4.0, .34, .6)
bell(3.0, 'A5', .14, d=4.4, pan=-.3); bell(6.3, 'D6', .12, d=4.4, pan=.3)
B['timp'].add(S.timpani(44, 2.6, .4), 7.6, .3)

# ================================================================== 8.4 - 20.4  the animals come in an orderly procession: a steady, gentle pulse (Dm - Bb - F - C)
PROC = [('Dm', 38, 3, ['D2', 'A2', 'D3', 'F3', 'A3']), ('Bb', 34, 4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3']), ('F', 41, 4, ['F2', 'C3', 'F3', 'A3', 'C4']), ('C', 36, 4, ['C2', 'G2', 'C3', 'E3', 'G3'])]
t_ = 8.4; i_ = 0
while t_ < 20.4:
    nm, r, ti, ns = PROC[i_ % 4]; b_ = min(t_ + 4 * BEAT, 20.6); k = (t_ - 8.4) / 12.0
    pad(t_, b_, ns, .3 + .1 * k, att=.8, bright=1100 + 700 * k); arp(t_, b_, r, ti, .1 + .04 * k, .46 + .1 * k)
    B['piano'].add(piano(M(ns[0]), 3.2, .8), t_, .34, pan=-.15)
    B['timp'].add(S.timpani({'Dm': 44, 'Bb': 41, 'F': 43, 'C': 49}[nm], 1.6, .3), t_, .14 + .04 * k); B['timp'].add(S.timpani({'Dm': 44, 'Bb': 41, 'F': 43, 'C': 49}[nm], 1.4, .28), t_ + 2 * BEAT, .1 + .03 * k)
    t_ += 4 * BEAT; i_ += 1
choir(10.6, 20.4, ['A3', 'D4', 'F4', 'A4'], .24, 'oo', att=2.0)
for t_, nm, d_ in ((9.0, 'D5', 2.0), (11.6, 'F5', 2.0), (14.0, 'A4', 2.4), (16.6, 'C5', 2.0), (18.4, 'A4', 2.4)): solo(t_, nm, d_, .26, att=.6, bright=2000); pno(t_, nm, d_ + .8, .42, .7)
bell(9.2, 'A5', .16); bell(14.2, 'D6', .14); bell(18.6, 'F6', .16)

# ================================================================== 20.4 - 30.2  Noah and his family enter: F major, warm; harp, choir, solo string
pad(20.4, 23.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.9, bright=2000); pad(23.8, 27.0, ['Bb2', 'F3', 'Bb3', 'D4', 'F4'], .36, att=.8, bright=2000); pad(27.0, 30.4, ['C2', 'G2', 'C3', 'E3', 'G3', 'C4'], .36, att=.8, bright=2000)
choir(20.5, 23.8, ['A3', 'C4', 'F4', 'A4'], .38, 'ah', att=1.0); choir(23.8, 27.0, ['Bb3', 'D4', 'F4', 'Bb4'], .36, 'oo', att=.9); choir(27.0, 30.4, ['E4', 'G4', 'C5', 'E5'], .34, 'oo', att=.9)
bell(20.5, 'C6', .34); bell(20.7, 'F6', .24)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'Bb5', 'D6', 'F6', 'D6', 'Bb5', 'G5')): B['harp'].add(pluck(M(nm)), 20.9 + .5 * k_, .28 + .008 * k_, pan=-.5 + .08 * k_)
for t_, nm, d_ in ((21.0, 'A5', 1.4), (22.6, 'C6', 1.2), (24.0, 'F5', 1.6), (25.6, 'G5', 1.0), (26.6, 'A5', 1.0), (27.8, 'Bb5', 1.2), (29.0, 'C6', 2.0)): pno(t_, nm, d_ + 1.0, .5, .74)
for t_, nm, d_ in ((22.6, 'C5', 1.8), (25.6, 'D5', 1.4), (28.0, 'E5', 2.4)): solo(t_, nm, d_, .3, att=.5, bright=2800)
B['timp'].add(S.timpani(46, 3.0, .5), 20.4, .3)
arp(24.0, 29.4, 41, 4, .12, .46)

# ================================================================== 30.2 - 36.2  the Lord shuts him in: the music all but stops. One low fifth, then the door, then silence.
n_ = int(SR * 4.6); fifth = (np.sin(2 * np.pi * 73.4 * np.arange(n_) / SR) + .6 * np.sin(2 * np.pi * 110 * np.arange(n_) / SR)).astype(np.float32) * env_pad(n_, 1.4, 1.8, 2.4); B['sub'].add(fifth, 30.2, .24)
pad(30.4, 33.6, ['D2', 'A2'], .14, att=1.4, bright=500)
B['timp'].add(S.timpani(40, 3.6, .9), 34.0, .46); B['sub'].add(S.sub_boom(38, 3.2), 34.0, .42)

# ================================================================== 36.2 - 60  the flood: the deep bursts forth. Tremolo strings, timpani and brass build in D minor (Dm - Bb - Gm - A)
B['timp'].add(S.timpani(40, 3.4, 1.0), 36.2, .64); B['sub'].add(S.sub_boom(36.7, 3.8), 36.2, .6)
for m in ('D3', 'A3', 'D4'): B['brass'].add(horn(M(m), 4.2, att=.25, rel=1.4, peak=1700), 36.2, .3, pan=.1)
LOOP = [('Dm', 38, 3, ['D2', 'A2', 'D3', 'F3', 'A3']), ('Bb', 34, 4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3']), ('Gm', 31, 3, ['G2', 'D3', 'G3', 'Bb3', 'D4']), ('A', 33, 4, ['A1', 'E2', 'A2', 'C#3', 'E3'])]
TP = {'Dm': 44, 'Bb': 41, 'Gm': 39, 'A': 45}
t_ = 36.6; i_ = 0
while t_ < 56.0:
    nm, r, ti, ns = LOOP[i_ % 4]; b_ = min(t_ + 4 * BEAT, 56.0); k = (t_ - 36.6) / 19.4
    pad(t_, b_, ns, .3 + .24 * k, att=.7, bright=1000 + 1800 * k, tr=(6.2, .35 + .1 * k))
    arp(t_, b_, r, ti, .1 + .1 * k, .5 + .22 * k)
    B['piano'].add(piano(M(ns[0]), 3.4, .85), t_, .36 + .1 * k, pan=-.15)
    B['timp'].add(S.timpani(TP[nm], 1.8, .4 + .3 * k), t_, .2 + .22 * k); B['timp'].add(S.timpani(TP[nm], 1.4, .34 + .3 * k), t_ + 2 * BEAT, .14 + .2 * k)
    t_ += 4 * BEAT; i_ += 1
choir(40.0, 46.0, ['D4', 'F4', 'A4'], .22, 'oo', att=1.4); choir(46.0, 56.0, ['F4', 'A4', 'D5', 'F5'], .34, 'ah', att=1.4)
for m in ('D3', 'A3', 'F4'): B['brass'].add(horn(M(m), 5.0, att=1.3, rel=1.6, peak=1600), 44.4, .26, pan=.1)         # the ark lifts
for m in ('Bb2', 'F3', 'D4'): B['brass'].add(horn(M(m), 6.0, att=1.2, rel=1.6, peak=1900), 49.4, .26, pan=.0)
for m in ('G3', 'D4', 'G4'): B['brass'].add(horn(M(m), 5.6, att=1.2, rel=1.6, peak=2100), 54.0, .3, pan=-.1)       # the high mountains are covered
for t_, nm, d_ in ((37.0, 'A4', 2.4), (40.2, 'D5', 2.4), (43.4, 'C5', 2.2), (46.6, 'E5', 2.0), (49.8, 'F5', 2.6), (53.0, 'D5', 2.4)): pno(t_, nm, d_ + 1.2, .5, .78); solo(t_ + .05, nm, d_, .24, att=.5, bright=2400)
bell(37.0, 'D6', .2); bell(43.4, 'A5', .18); bell(49.6, 'D6', .2); bell(53.0, 'F6', .2)
# 56 - 60: the held dominant, the roll tightens, the water stands over the earth
pad(56.0, 60.2, ['A2', 'E3', 'G3', 'C#4', 'E4'], .5, att=.8, bright=1700, tr=(5.8, .3)); choir(56.2, 60.2, ['E4', 'A4', 'C#5'], .3, 'oo', att=.8)
drone(55.8, 60.3, 27.5 * 2, .4, att=1.2, rel=1.0)
for k_, t_ in enumerate(np.arange(56.4, 59.9, .6)): B['timp'].add(S.timpani(46, 1.2, .5), float(t_), .2 + .05 * k_)
for k_, (t_, nm) in enumerate(((57.6, 'A5'), (58.4, 'E6'), (59.0, 'G6'), (59.5, 'C#7'))): bell(t_, nm, .16 + .03 * k_, d=3.0)

# ================================================================== 60 - 75  trust in uncertainty: the storm lets go; soft piano, slow strings, a quiet choir (Dm - Bb - F - C)
B['timp'].add(S.timpani(50, 3.4, .6), 60.0, .26)
CH = [(60.2, 63.8, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3), (63.8, 67.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (67.4, 71.0, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (71.0, 74.6, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4),
      (74.6, 77.8, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (77.8, 80.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (80.6, 82.0, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3), (82.0, 83.3, ['C2', 'G2', 'Bb2', 'E3', 'G3'], 36, 4)]
IKs = [(60.0, .12), (67.4, .28), (74.6, .6), (80.6, .86), (83.3, .96)]
for a, b, ns, r, ti in CH:
    i = float(np.interp(a + .3, [x for x, y in IKs], [y for x, y in IKs])); pad(a, b, ns, .24 + .5 * i, att=1.0, bright=1100 + 3400 * i)
    arp(a, b, r, ti, .09 + .09 * i, .46 + .2 * i); B['piano'].add(piano(M(ns[0]), min(4.5, b - a + .5), .85), a, .4, pan=-.15)
choir(64.0, 67.4, ['D4', 'F4', 'Bb4'], .2, 'oo', att=1.2); choir(67.4, 74.6, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.2)
choir(74.6, 80.6, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=.9); choir(80.6, 83.3, ['F4', 'A4', 'D5', 'F5'], .6, 'ah', att=.8)
THEME = [(61.4, 'A4', 1.6), (63.2, 'D5', 1.4), (65.0, 'F5', 1.6), (66.8, 'D5', 1.4), (68.6, 'C5', 1.2), (70.0, 'F5', 1.2), (71.4, 'A5', 1.8), (73.4, 'G5', 1.2), (74.8, 'A5', 1.6),
         (76.2, 'C6', 1.2), (77.6, 'F6', 1.6), (79.2, 'D6', 1.2), (80.4, 'Bb5', 1.2), (81.6, 'D6', 1.0), (82.5, 'C6', 1.0)]
for t_, nm, d in THEME:
    pno(t_, nm, d + .9, .56, .8)
    if t_ >= 66.0: solo(t_, nm, d, .3, att=.3, bright=2400)
    if t_ >= 76.0: B['brass'].add(horn(M(nm) / 2, d, att=.3, rel=.6, peak=2200), t_, .38, pan=.15)
for k_ in range(7): bell(62.4 + .55 * k_, ('A5', 'C6', 'D6', 'F6', 'A6', 'C7', 'D7')[k_], .1, d=3.2, pan=-.4 + .13 * k_)          # the lamps come on, one by one
bell(60.4, 'D6', .26); bell(74.0, 'C6', .3); bell(77.7, 'F6', .3); bell(79.4, 'D6', .26); bell(80.6, 'F6', .3)
B['timp'].add(S.timpani(46, 2.6, .5), 74.6, .3)
for t_, g_ in ((80.4, .3), (81.0, .36), (81.6, .42), (82.0, .5), (82.4, .58), (82.7, .66), (83.0, .74)): B['timp'].add(S.timpani(65, 1.0, .5), t_, g_ * .6)

# ================================================================== 83.3 - 90  the question: a warm sustained F-major chord that settles
B['timp'].add(S.timpani(58, 2.4, 1.0), 83.3, .7); B['sub'].add(S.sub_boom(43.65, 3.6), 83.3, .5)
for m in ('F3', 'C4', 'F4', 'A4', 'C5'): B['brass'].add(horn(M(m), 4.8, att=.5, rel=1.8, peak=2600), 83.3, .4, pan=-.2 + .1 * (nn(m) % 4))
pad(83.3, 88.6, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .7, att=.5, bright=3800)
choir(83.3, 88.6, ['F3', 'C4', 'F4', 'A4', 'C5', 'F5'], .7, 'ah', att=.6)
n_ = int(SR * 7.2); B['sub'].add(np.sin(2 * np.pi * 43.65 * np.arange(n_) / SR).astype(np.float32) * env_pad(n_, .4, 2.8, 4.4), 83.3, .5)
for t_, nm, g_ in ((83.8, 'F6', .46), (85.6, 'A6', .36), (86.4, 'C7', .28)): bell(t_, nm, g_)
for k_, m in enumerate(('F5', 'C6', 'F6', 'A6', 'C7')): pno(86.9 + .26 * k_, m, 4.2, .3, .6, pan=-.4 + .2 * k_)

# ================================================================== reverb + bus mix
ir = make_ir(4.2, 9)
wet = {'str': .36, 'choir': .55, 'brass': .3, 'piano': .32, 'harp': .42, 'bell': .6, 'sub': 0, 'timp': .2, 'dry': 0}
lvl = {'str': 1.0, 'choir': .85, 'brass': .75, 'piano': 1.0, 'harp': .8, 'bell': .8, 'sub': .95, 'timp': .9, 'dry': 1.0}
ML = np.zeros(B['str'].N, np.float32); MR = np.zeros(B['str'].N, np.float32)
for k, b in B.items():
    L, R = b.L * lvl[k], b.R * lvl[k]
    if wet[k] > 0: wl, wr = reverb(L, R, ir, wet[k]); L = L + wl; R = R + wr
    ML += L; MR += R
    sf.write(f'/home/claude/music/out7/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out7/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
