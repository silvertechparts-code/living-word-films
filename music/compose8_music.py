"""Episode 08 (Genesis 8) score -- original, synthesised with numpy.
Arc: a low drone over a violent world (D minor) -> solemn grief (slow choir, tremolo strings) -> one warm ray: Noah finds favour (F major, piano + harp)
     -> gentle family theme -> the ark: a restrained piano ostinato and soft timpani build (Dm-Bb-F-C) -> held dominant under gathering clouds
     -> the modern reflection opens in D minor and rises to F major -> the question: a warm sustained chord that settles.
Outputs: out8/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out8', exist_ok=True)
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


# ================================================================== 0 - 5.6  "God remembered Noah": the storm's last breath. Low D drone, a solo string that rises, rain-soaked bells (D minor)
drone(0, 6.4, 36.7, .5, att=2.4); drone(0.4, 6.0, 55.0, .2, att=2.6)
pad(0.0, 3.2, ['D3', 'A3', 'F4'], .24, att=2.0, bright=800); pad(3.2, 6.2, ['Bb2', 'F3', 'D4'], .26, att=1.0, bright=1000)
choir(1.2, 6.2, ['A3', 'D4', 'F4'], .14, 'oo', att=2.0)
for t_, nm, d_ in ((1.4, 'A4', 2.0), (3.0, 'D5', 1.8), (4.4, 'F5', 2.4)): solo(t_, nm, d_, .26, att=.6, bright=1600)
pno(0.6, 'D2', 4.6, .42, .6); pno(3.4, 'Bb2', 3.6, .32, .6)
bell(2.2, 'A5', .12, d=4.4, pan=-.3); bell(4.8, 'D6', .12, d=4.4, pan=.3)
B['timp'].add(S.timpani(44, 2.4, .4), 0.1, .26)

# ================================================================== 5.6 - 11.4  the wind passes over the earth; the rain stops. Bb -> F: the first warm light
pad(5.6, 8.4, ['Bb2', 'F3', 'Bb3', 'D4'], .3, att=1.0, bright=1400); pad(8.4, 11.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.2, bright=1900)
choir(6.0, 11.6, ['D4', 'F4', 'A4', 'Bb4'], .22, 'oo', att=1.6)
for t_, nm, d_ in ((6.2, 'D5', 1.8), (7.8, 'F5', 1.8), (9.2, 'A5', 2.0), (10.6, 'C6', 2.2)): pno(t_, nm, d_ + 1.0, .46, .7); solo(t_ + .05, nm, d_, .2, att=.5, bright=2200)
bell(8.6, 'F6', .2); bell(10.6, 'C6', .24, d=4.8)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4')): B['harp'].add(pluck(M(nm)), 9.2 + .38 * k_, .22 + .01 * k_, pan=-.4 + .15 * k_)

# ================================================================== 11.4 - 17.4  the ark comes to rest: one low touch, then hush. The tops of the mountains appear (rising bells)
B['timp'].add(S.timpani(41, 3.2, .8), 12.4, .5); B['sub'].add(S.sub_boom(41.2, 3.0), 12.4, .4)
pad(11.6, 14.4, ['F2', 'C3', 'F3', 'A3'], .22, att=1.0, bright=1100); pad(14.4, 18.0, ['Bb2', 'F3', 'Bb3', 'D4', 'F4'], .3, att=1.0, bright=1700)
choir(14.2, 18.0, ['F4', 'A4', 'D5'], .26, 'ah', att=1.2)
for k_, (t_, nm) in enumerate(((14.7, 'F5'), (15.4, 'A5'), (16.1, 'C6'), (16.8, 'D6'), (17.4, 'F6'))): bell(t_, nm, .18 + .03 * k_, d=4.0, pan=-.4 + .2 * k_)
pno(15.0, 'D5', 3.0, .44, .7); pno(16.6, 'F5', 3.0, .44, .72)

# ================================================================== 17.4 - 22.2  the raven: sparse, a little uneasy. A low solo line over a held fifth
n_ = int(SR * 5.0); fifth = (np.sin(2 * np.pi * 73.4 * np.arange(n_) / SR) + .5 * np.sin(2 * np.pi * 110 * np.arange(n_) / SR)).astype(np.float32) * env_pad(n_, 1.2, 1.6, 2.4); B['sub'].add(fifth, 17.4, .22)
pad(17.8, 22.6, ['D2', 'A2', 'D3'], .16, att=1.4, bright=600)
for t_, nm, d_ in ((18.4, 'D4', 1.6), (19.9, 'E4', 1.4), (21.2, 'D4', 2.0)): solo(t_, nm, d_, .3, att=.5, bright=1100)
pno(19.0, 'A2', 3.4, .36, .6); bell(20.4, 'A5', .1, d=4.0)

# ================================================================== 22.2 - 33.4  the dove: a gentle figure, hope that finds nowhere to rest, then comes back with a leaf (Gm -> F)
pad(22.2, 25.0, ['G2', 'D3', 'G3', 'Bb3'], .26, att=1.0, bright=1300); pad(25.0, 27.4, ['Eb2', 'Bb2', 'Eb3', 'G3'], .24, att=1.0, bright=1200); pad(27.4, 30.2, ['C2', 'G2', 'C3', 'E3', 'G3'], .32, att=.9, bright=1800)
pad(30.2, 33.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.9, bright=2200)
choir(22.4, 27.4, ['D4', 'G4', 'Bb4'], .2, 'oo', att=1.4); choir(27.4, 33.6, ['E4', 'G4', 'C5', 'E5'], .3, 'ah', att=1.0)
arp(22.4, 25.0, 31, 3, .1, .44); arp(25.2, 27.2, 27, 4, .09, .42); arp(27.6, 30.2, 36, 4, .11, .5)
for t_, nm, d_ in ((22.9, 'D5', 1.6), (24.3, 'G5', 1.4), (25.7, 'F5', 1.6), (27.4, 'E5', 1.6), (28.7, 'G5', 1.4), (30.0, 'C6', 1.8), (31.6, 'A5', 2.0)): pno(t_, nm, d_ + 1.0, .46, .72)
for t_, nm, d_ in ((24.6, 'Bb4', 2.0), (29.0, 'E5', 2.0), (31.8, 'F5', 2.4)): solo(t_, nm, d_, .26, att=.5, bright=2400)
bell(31.2, 'C6', .3); bell(31.5, 'A6', .22); bell(32.2, 'F6', .26)                                                 # the olive leaf

# ================================================================== 33.4 - 41  "the waters had gone down": quiet, a held chord; the third dove (a tender line)
pad(33.6, 38.0, ['F2', 'C3', 'F3', 'A3'], .2, att=1.0, bright=1500); pad(38.0, 41.8, ['Bb2', 'F3', 'Bb3', 'D4'], .24, att=1.0, bright=1700)
choir(34.0, 41.8, ['F4', 'A4', 'D5'], .22, 'oo', att=1.4)
for t_, nm, d_ in ((34.2, 'C5', 1.8), (36.4, 'A4', 1.8), (37.8, 'C5', 2.0), (39.6, 'D5', 2.4)): pno(t_, nm, d_ + 1.0, .44, .7); solo(t_ + .05, nm, d_, .22, att=.5, bright=2400)
bell(36.6, 'F6', .2); bell(39.8, 'A6', .2, d=4.4)

# ================================================================== 41 - 47.6  "the earth was dry": the way out. A steady, gentle processional pulse (F - Bb - C - F), brightening
PROC = [('F', 41, 4, ['F2', 'C3', 'F3', 'A3', 'C4']), ('Bb', 34, 4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3']), ('C', 36, 4, ['C2', 'G2', 'C3', 'E3', 'G3']), ('F', 41, 4, ['F2', 'C3', 'F3', 'A3', 'C4'])]
t_ = 41.4; i_ = 0
while t_ < 47.6:
    nm, r, ti, ns = PROC[i_ % 4]; b_ = min(t_ + 4 * BEAT, 47.8); k = (t_ - 41.4) / 6.2
    pad(t_, b_, ns, .3 + .1 * k, att=.7, bright=1500 + 900 * k); arp(t_, b_, r, ti, .1 + .04 * k, .46 + .1 * k)
    B['piano'].add(piano(M(ns[0]), 3.0, .8), t_, .32, pan=-.15)
    B['timp'].add(S.timpani({'F': 43, 'Bb': 41, 'C': 49}[nm], 1.6, .28), t_, .12 + .04 * k); t_ += 4 * BEAT; i_ += 1
choir(41.6, 47.6, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.4)
bell(41.6, 'C6', .26); bell(41.8, 'F6', .18)
for t_, nm, d_ in ((42.4, 'A5', 1.4), (44.0, 'C6', 1.4), (45.6, 'F5', 1.8), (46.8, 'A5', 1.8)): solo(t_, nm, d_, .26, att=.5, bright=2600); pno(t_, nm, d_ + .8, .42, .7)

# ================================================================== 47.6 - 51.6  the altar: hushed, reverent. Low strings, a single slow figure, then the fire takes
pad(47.6, 51.8, ['Bb2', 'F3', 'Bb3', 'D4'], .3, att=1.0, bright=1500); choir(47.8, 51.8, ['D4', 'F4', 'Bb4'], .3, 'oo', att=1.2)
B['timp'].add(S.timpani(43, 2.4, .4), 47.6, .22)
for t_, nm, d_ in ((48.2, 'F5', 1.6), (49.6, 'D5', 1.6), (50.8, 'Bb4', 2.0)): pno(t_, nm, d_ + 1.0, .44, .7)
bell(50.2, 'D6', .2); bell(50.6, 'F6', .16)

# ================================================================== 51.6 - 60  God's promise: the seasons will never cease. F major swells to its peak (choir, brass, harp), then eases into the reflection
B['timp'].add(S.timpani(46, 3.0, .9), 51.6, .44); B['sub'].add(S.sub_boom(43.65, 3.2), 51.6, .34)
for m in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m), 5.2, att=.9, rel=1.6, peak=1900), 52.4, .3, pan=-.1)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.4, att=.8, rel=1.6, peak=2300), 56.0, .34, pan=.1)
PRO = [(51.6, 54.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (54.6, 57.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (57.2, 60.4, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)]
for a, b, ns, r, ti in PRO:
    k = (a - 51.6) / 8.8; pad(a, b, ns, .38 + .3 * k, att=.7, bright=1900 + 1800 * k); arp(a, b, r, ti, .11 + .06 * k, .5 + .16 * k)
    B['piano'].add(piano(M(ns[0]), 3.2, .85), a, .4, pan=-.15)
choir(51.8, 60.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=1.2)
for k_, (t_, nm) in enumerate(((52.6, 'A5'), (54.0, 'C6'), (55.4, 'F6'), (57.0, 'A6'), (58.4, 'C7'))): bell(t_, nm, .2 + .03 * k_, d=4.0, pan=-.4 + .2 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'Bb5', 'D6', 'F6', 'D6', 'Bb5', 'G5')): B['harp'].add(pluck(M(nm)), 52.2 + .55 * k_, .26 + .008 * k_, pan=-.5 + .08 * k_)

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
    sf.write(f'/home/claude/music/out8/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out8/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

