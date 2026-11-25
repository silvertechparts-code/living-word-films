"""Episode 16 (Genesis 16, Hagar and the God who sees) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): a warm hush (the God who sees) -> Sarai gives Hagar to Abram (pensive) -> Hagar conceives and Sarai is despised (unease)
     -> harsh treatment, she flees (a quickening pulse) -> the spring in the wilderness (relief, harp and bells) -> "where have you come from?" (a gentle question) -> "I am running away" (small, alone)
     -> "return" and descendants too many to count (a rising shimmer) -> a son, Ishmael, the Lord has heard (warm) -> "the God who sees me" (glory in F) -> Ishmael is born (warm close)
     -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out16/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out16', exist_ok=True)
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

# ================================================================== 0 - 4.8  a1: the God who sees: a warm hush, a low drone, a soft choir, a bell
drone(0, 4.9, FQ('D1'), .3, att=1.2, rel=1.4)
pad(0.2, 4.9, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.4, bright=900)
choir(1.0, 4.9, ['D4', 'F4', 'A4'], .22, 'oo', att=1.2)
bell(1.0, 'D6', .16, d=4.6); bell(2.8, 'F6', .16, d=4.4, pan=.3)
solo(2.0, 'A4', 1.8, .22, att=.5, bright=1300)

# ================================================================== 4.8 - 13.2  b1: Sarai gives Hagar to Abram: pensive, slow, minor
pad(4.8, 9.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1000); pad(9.0, 13.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.0, bright=1100)
choir(5.4, 12.8, ['D4', 'F4', 'A4'], .2, 'ah', att=1.3)
for t_, nm, d_ in ((5.2, 'A4', 1.5), (6.8, 'G4', 1.4), (8.6, 'F4', 1.5), (10.4, 'E4', 1.4), (11.7, 'D4', 1.6)): solo(t_, nm, d_, .24, att=.5, bright=1200); pno(t_, nm, d_ + .8, .26, .55)
pno(5.0, 'D3', 3.6, .3, .55); bell(8.0, 'D6', .1, d=4.2, pan=-.2)

# ================================================================== 13.2 - 18.1  b2: Hagar conceives and Sarai is despised: unease, trembling low strings, muted timpani
pad(13.3, 18.4, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .24, att=1.0, bright=900); trem_pad(13.6, 18.4, ['A2', 'E3', 'C4'], .13, 5.0)
for t_, nm in ((14.2, 'D5'), (15.4, 'Bb4'), (16.6, 'A4')): pno(t_, nm, 2.2, .26, .55, pan=-.3 + .2 * (t_ % 2))
solo(14.8, 'F4', 2.4, .2, att=.7, bright=1100)
B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), 14.2, .12); B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), 16.2, .14)

# ================================================================== 18.1 - 23.8  c1: harshly treated, she flees: the pulse quickens, a darker drone
drone(18.0, 24.3, FQ('D1'), .4, att=.8, rel=1.2); trem_pad(18.2, 24.4, ['D2', 'A2', 'D3', 'F3', 'B3'], .3, 5.5)
t_ = 18.5; gap = 1.0; k_ = 0
while t_ < 24.0:
    B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), t_, .1 + .012 * k_); t_ += gap; gap = max(.42, gap * .9); k_ += 1
B['brass'].add(horn(M('Bb2'), 3.6, att=1.0, rel=1.4, peak=1300), 19.6, .22, pan=-.1)
choir(20.0, 24.2, ['D3', 'F3', 'A3'], .18, 'oo', att=1.2)
solo(21.0, 'A3', 2.2, .2, att=.7, bright=1000)

# ================================================================== 23.8 - 28.7  c2: the spring in the wilderness: relief, a shimmer of harp, bells, a warm F
B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 23.9, .22)
pad(23.9, 26.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700); pad(26.4, 29.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.9, bright=1700)
choir(24.4, 28.8, ['A3', 'C4', 'F4', 'A4'], .28, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 24.6 + .45 * k_, .2, pan=-.5 + .2 * k_)
bell(24.2, 'F6', .22, d=4.6); bell(26.0, 'C6', .2, d=4.4, pan=.3); bell(27.4, 'A6', .16, d=4.0, pan=-.3)
for t_, nm, d_ in ((25.0, 'C5', 1.4), (26.5, 'F5', 1.5)): solo(t_, nm, d_, .24, att=.4, bright=1800)

# ================================================================== 28.7 - 33.5  c3: "where have you come from and where are you going?": a gentle question, suspended
pad(29.0, 33.6, ['G2', 'D3', 'G3', 'C4', 'D4'], .24, att=1.0, bright=1100)
for t_, nm in ((29.8, 'E5'), (31.0, 'D5'), (32.2, 'C5')): pno(t_, nm, 2.2, .26, .55, pan=-.3 + .2 * (t_ % 2))
solo(30.4, 'A4', 2.6, .22, att=.7, bright=1300)

# ================================================================== 33.5 - 38.3  c4: "I am running away from my mistress Sarai": small and alone, one piano and one string
pad(33.6, 38.6, ['D2', 'A2', 'D3', 'F3'], .2, att=1.1, bright=800)
for t_, nm, d_ in ((33.9, 'D4', 2.2), (35.3, 'F4', 2.0), (36.7, 'A4', 2.2)): pno(t_, nm, d_ + .4, .3, .5, pan=-.1)
solo(34.6, 'A3', 2.4, .22, att=.7, bright=1000)

# ================================================================== 38.3 - 44.8  d1: the angel: "return... I will so greatly multiply your offspring they cannot be counted": a rising shimmer
B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 38.6, .2)
pad(38.6, 41.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.8, bright=1800); pad(41.6, 45.0, ['C2', 'G2', 'C3', 'E3', 'G3'], .34, att=.9, bright=2300)
choir(39.0, 44.8, ['A3', 'C4', 'F4', 'A4', 'C5'], .34, 'ah', att=1.0)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1700), 39.4, .2, pan=.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6', 'C7', 'A6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 40.2 + .38 * k_, .2, pan=-.5 + .1 * k_)
for k_, nm in enumerate(('F6', 'A6', 'C7', 'A6', 'F6', 'C7')): bell(40.8 + .6 * k_, nm, .14 + .01 * k_, d=4.2, pan=-.4 + .16 * k_)

# ================================================================== 44.8 - 50.7  d2: "you shall bear a son; call him Ishmael, for the Lord has given heed": warm and tender
pad(44.9, 48.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1300); pad(48.0, 50.9, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.9, bright=1700)
choir(45.2, 50.6, ['A3', 'C4', 'F4', 'A4'], .32, 'ah', att=1.0)
for t_, nm, d_ in ((46.0, 'C5', 1.4), (47.4, 'F5', 1.5), (48.8, 'A5', 1.7)): solo(t_, nm, d_, .26, att=.4, bright=1800); pno(t_, nm, d_ + .8, .26, .56)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 49.0 + .35 * k_, .2, pan=-.3 + .2 * k_)
bell(45.4, 'F6', .2, d=4.4)

# ================================================================== 50.7 - 55.6  e1: "You are the God who sees me": the peak, a glory swell in F
B['timp'].add(S.timpani(FQ('F1'), 3.0, .9), 50.9, .5); B['sub'].add(S.sub_boom(FQ('F1'), 3.6), 50.9, .4)
pad(50.9, 53.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.7, bright=2300); pad(53.6, 56.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1800)
choir(51.0, 55.6, ['A3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=.8)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.8, att=.8, rel=1.5, peak=1900), 51.1, .26, pan=.1)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 51.4 + .34 * k_, .22, pan=-.4 + .25 * k_)
for t_, nm, d_ in ((51.4, 'C5', 1.4), (52.8, 'F5', 1.5), (54.2, 'A5', 1.8)): solo(t_, nm, d_, .28, att=.4, bright=1900)
bell(51.0, 'F6', .28, d=5.0); bell(52.8, 'C6', .22, d=4.6, pan=.3); bell(54.4, 'A6', .18, d=4.2, pan=-.3)

# ================================================================== 55.6 - 61  e2: Ishmael is born; Abram names him: a warm close that leans into the reflection
pad(55.6, 58.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700); pad(58.4, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1500)
choir(55.8, 60.8, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.0)
for t_, nm, d_ in ((56.2, 'C5', 1.4), (57.6, 'F5', 1.5), (59.0, 'A5', 1.8)): solo(t_, nm, d_, .24, att=.4, bright=1700); pno(t_, nm, d_ + .8, .24, .55)
bell(56.0, 'F6', .2, d=4.6); bell(58.0, 'C6', .16, d=4.4, pan=.3)

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
    sf.write(f'/home/claude/music/out16/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out16/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)


