"""Episode 18 (Genesis 18, Three Visitors) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): noon at Mamre, the three men arrive (a warm pastoral hush) -> Abraham runs and bows (hurry, then low) -> a feast in haste (a light rolling figure)
     -> "where is Sarah?", "Sarah will have a son" (expectant warmth) -> Sarah laughs to herself (light, wry) -> "is anything too hard for the Lord?" (a swell) -> the outcry against Sodom (dusk, minor, low)
     -> Abraham pleads (a questioning solo line over a sparse bed) -> "what if fifty?" (an answering warmth) -> forty-five ... twenty (a quiet descending line over a slow pulse) -> "what about ten?" (hush, then a held F-major chord)
     -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out18/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out18', exist_ok=True)
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


trem_pad = lambda a, b, ns, g, tr: [B['str'].add(trem(strings_note(M(m), (b - a) + .3, att=1.0, rel=1.2, bright=1100), tr, .6, k), a, g, pan=-.4 + .15 * k) for k, m in enumerate(ns)]

# ================================================================== 0 - 6.2  a1: noon at Mamre, three men come: a warm pastoral hush, a low drone, a soft choir, bells in the heat
drone(0, 6.4, FQ('D1'), .28, att=1.4, rel=1.6)
pad(0.2, 3.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.5, bright=1000); pad(3.4, 6.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .24, att=1.0, bright=1200)
choir(1.0, 4.0, ['A3', 'C4', 'F4'], .2, 'oo', att=1.3); choir(3.8, 6.4, ['A3', 'C4', 'F4', 'A4'], .22, 'ah', att=1.0)
bell(0.9, 'F6', .16, d=4.6); bell(2.9, 'C6', .14, d=4.2, pan=.3); bell(5.0, 'A6', .14, d=4.0, pan=-.3)
solo(1.8, 'A4', 1.8, .2, att=.5, bright=1300); solo(4.2, 'C5', 1.8, .22, att=.5, bright=1500)
pno(3.4, 'F4', 2.6, .22, .5)

# ================================================================== 6.2 - 11.2  b1: he runs to meet them (a hurrying rise), then bows to the ground (low, reverent)
B['timp'].add(S.timpani(FQ('F1'), 1.2, .5), 6.2, .1)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'A5', 'C6')): B['piano'].add(piano(mf(nn(nm)), 1.4, .6), 6.3 + .22 * k_, .26, pan=-.4 + .16 * k_)
pad(6.4, 8.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .28, att=.6, bright=1700); pad(8.4, 11.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.0, bright=900)
choir(8.6, 11.2, ['D4', 'F4', 'A4'], .2, 'oo', att=1.2)
solo(8.6, 'A4', 1.6, .2, att=.5, bright=1200); solo(9.9, 'F4', 1.5, .2, att=.5, bright=1100)
B['sub'].add(S.sub_boom(FQ('D1'), 2.6), 8.4, .18); bell(10.2, 'D6', .12, d=4.0)

# ================================================================== 11.2 - 14.8  b2: a feast in haste: a light rolling figure
pad(11.3, 14.9, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=.8, bright=1500)
arp(11.4, 14.7, 41, 4, .11, .5)
for t_, nm, d_ in ((11.6, 'C5', 1.2), (12.8, 'F5', 1.3), (14.0, 'A5', 1.4)): solo(t_, nm, d_, .2, att=.4, bright=1700)
bell(11.5, 'F6', .16, d=4.2); bell(13.4, 'C6', .14, d=4.0, pan=.3)

# ================================================================== 14.8 - 20.2  c1: "where is Sarah?"; "I will return, and Sarah will have a son": expectant warmth, a harp run on the promise
pad(14.9, 17.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .28, att=1.0, bright=1500); pad(17.6, 20.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.9, bright=1700)
choir(15.2, 19.8, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=1.1)
for t_, nm, d_ in ((15.4, 'C5', 1.4), (17.0, 'F5', 1.4)): solo(t_, nm, d_, .22, att=.4, bright=1600); pno(t_, nm, d_ + .8, .22, .55)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 17.8 + .34 * k_, .2, pan=-.4 + .18 * k_)
bell(14.9, 'F6', .18, d=4.4); bell(17.9, 'C6', .2, d=4.4, pan=.3); bell(19.2, 'A6', .15, d=4.0, pan=-.3)

# ================================================================== 20.2 - 23.8  c2: Sarah laughs to herself: light, a little wry, still reverent
pad(20.3, 22.2, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .18, att=.9, bright=1500); pad(22.2, 24.0, ['C2', 'G2', 'C3', 'E3', 'G3'], .2, att=.9, bright=1700)
for k_, (t_, nm) in enumerate(((20.6, 'D5'), (21.0, 'F5'), (21.4, 'A5'), (22.0, 'G5'), (22.4, 'E5'), (22.8, 'C5'))): pno(t_, nm, 1.6, .24, .55, pan=-.3 + .1 * k_)
for k_, nm in enumerate(('C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 22.4 + .3 * k_, .15, pan=.3 - .2 * k_)
bell(20.8, 'D6', .12, d=3.8)

# ================================================================== 23.8 - 27.9  c3: "is anything too hard for the Lord?": a swell
B['timp'].add(S.timpani(FQ('F1'), 2.6, .7), 23.9, .26)
pad(23.8, 26.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.8, bright=1900); pad(26.0, 28.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1900)
choir(24.0, 27.9, ['A3', 'C4', 'F4', 'A4', 'C5'], .34, 'ah', att=.9)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1600), 24.3, .18, pan=.1)
for t_, nm, d_ in ((24.4, 'C5', 1.4), (25.8, 'F5', 1.5), (27.0, 'A5', 1.6)): solo(t_, nm, d_, .26, att=.4, bright=1800); pno(t_, nm, d_ + .8, .24, .56)
bell(24.2, 'F6', .22, d=4.6); bell(26.0, 'C6', .18, d=4.4, pan=.3); bell(27.2, 'A6', .15, d=4.2, pan=-.3)

# ================================================================== 27.9 - 34.4  d1: dusk, the outcry against Sodom: minor, low, a quiet pulse
drone(27.9, 34.6, FQ('D1'), .34, att=1.2, rel=1.6)
pad(28.0, 31.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.0, bright=1000); pad(31.2, 34.8, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .26, att=1.0, bright=1000)
choir(28.4, 34.2, ['D4', 'F4', 'A4'], .22, 'oo', att=1.3)
t_ = 28.6; k_ = 0
while t_ < 33.8:
    B['timp'].add(S.timpani(FQ('D1'), 1.2, .5), t_, .07 + .004 * k_); t_ += 1.4; k_ += 1
for t_, nm, d_ in ((29.0, 'F4', 2.0), (31.4, 'D4', 2.0)): solo(t_, nm, d_, .2, att=.7, bright=1100)
pno(29.8, 'A4', 2.4, .22, .5); pno(32.6, 'F4', 2.6, .22, .5); bell(28.2, 'D6', .1, d=4.4)

# ================================================================== 34.4 - 43.0  d2: Abraham pleads: a questioning solo line over a sparse bed, rising
drone(34.4, 43.2, FQ('D1'), .3, att=1.4, rel=1.6)
pad(34.6, 38.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=1.2, bright=1000); pad(38.4, 43.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1300)
choir(37.0, 43.0, ['D4', 'F4', 'A4'], .2, 'oo', att=1.4)
for t_, nm, d_ in ((35.2, 'A4', 1.6), (36.6, 'C5', 1.5), (38.0, 'D5', 1.6), (39.6, 'F5', 1.6), (41.0, 'A5', 1.9)): solo(t_, nm, d_, .24, att=.5, bright=1400 + 80 * (t_ - 35)); pno(t_, nm, d_ + .8, .2, .5)
bell(36.0, 'D6', .1, d=4.2); bell(39.0, 'F6', .12, d=4.2, pan=.3); bell(41.8, 'A6', .12, d=4.0, pan=-.3)

# ================================================================== 43.0 - 48.8  d3: "what if there are fifty righteous?" the answer: warmth
B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 43.1, .2)
pad(43.0, 45.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700); pad(45.8, 49.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1800)
choir(43.4, 48.6, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.0)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.2, att=.9, rel=1.4, peak=1500), 44.4, .15, pan=.1)
for t_, nm, d_ in ((43.8, 'C5', 1.4), (45.4, 'F5', 1.5), (46.8, 'A5', 1.6)): solo(t_, nm, d_, .24, att=.4, bright=1700); pno(t_, nm, d_ + .8, .22, .55)
bell(43.4, 'F6', .2, d=4.6); bell(45.6, 'C6', .16, d=4.4, pan=.3); bell(47.4, 'A6', .15, d=4.2, pan=-.3)

# ================================================================== 48.8 - 53.6  e1: forty-five ... twenty: a quiet descending line over a slow pulse (the chimes are in the effects)
drone(48.8, 54.0, FQ('D1'), .3, att=1.0, rel=1.6)
pad(48.9, 53.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.0, bright=900)
choir(49.4, 53.4, ['D4', 'F4', 'A4'], .16, 'oo', att=1.2)
for t_, nm, d_ in ((49.5, 'A5', 1.4), (50.5, 'F5', 1.4), (51.5, 'D5', 1.4), (52.5, 'A4', 1.6)): solo(t_, nm, d_, .22, att=.4, bright=1300); pno(t_, nm, d_ + .8, .2, .5)
for k_, t_ in enumerate((49.6, 50.7, 51.7, 52.7)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), t_, .06 + .01 * k_)

# ================================================================== 53.6 - 60.4  e2: "what about ten?" a hush, then "for ten, I will not destroy it": a held F-major chord into the morning
B['timp'].add(S.timpani(FQ('D1'), 2.0, .5), 54.4, .12); bell(54.4, 'D6', .16, d=4.6)
pad(53.7, 56.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.0, bright=1000); pad(56.2, 61.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.4, bright=1500)
choir(55.4, 60.4, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.3)
B['brass'].add(horn(M('F3'), 3.8, att=1.2, rel=1.6, peak=1300), 57.0, .16, pan=.1)
for t_, nm, d_ in ((54.6, 'D5', 1.4), (56.4, 'F5', 1.5), (58.0, 'A5', 1.8)): solo(t_, nm, d_, .22, att=.5, bright=1500); pno(t_, nm, d_ + .8, .2, .52)
bell(56.0, 'F6', .16, d=4.6); bell(57.8, 'C6', .16, d=4.4, pan=.3); bell(59.2, 'A6', .14, d=4.2, pan=-.3)

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
    sf.write(f'/home/claude/music/out18/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out18/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
