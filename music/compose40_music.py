"""Episode 40 (Genesis 40, Forgotten in Prison) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): the prison and the two men (a1) -> a quiet night of dreams (a2) -> downcast faces, Joseph asks and says interpretations belong to God (b1) -> two dream pictures, a vine and a cup (b2) -> hope and a plea to be remembered (c1) -> an uneasy dream of baskets and birds (c2) -> the baker's outcome as a low peak (d1) -> the third day (d2) -> a lonely hush, he was forgotten (e1) -> the reflection, then the question.
Outputs: out40/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out40', exist_ok=True)
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






# ================================================================== 0 - 8.9  a1: the cupbearer and baker offend Pharaoh and are put in the prison where Joseph is held; Joseph attends them (40:1-4): a cool, solemn opening, then a warm solo for Joseph's care
drone(0, 9.2, FQ('D1'), .15, att=1.6, rel=1.8)
pad(0.2, 4.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=900)
B['timp'].add(S.timpani(FQ('D1'), 2.4, .8), 0.3, .12)
solo(1.0, 'F4', 2.4, .16, att=.8, bright=1000); bell(2.2, 'A6', .07, d=4.6)
pad(4.6, 9.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.9, bright=1300)
solo(5.6, 'D5', 2.4, .16, att=.7, bright=1300); pno(6.6, 'F5', 2.6, .1, .42); bell(7.2, 'F6', .07, d=4.6)

# ================================================================== 8.4 - 12.4  one night each man had a dream (40:5): quiet, sparse, dreamlike; the morning grey comes in with 12.4
pad(8.9, 12.6, ['D2', 'A2', 'D3', 'F3'], .24, att=1.2, bright=800)
trem_pad(9.2, 12.6, ['D3', 'A3', 'F4'], .1, 5.4)
choir(9.4, 12.8, ['A3', 'D4', 'F4'], .16, 'oo', att=1.4)
bell(9.8, 'D6', .1, d=4.6); bell(10.9, 'F6', .1, d=4.6); bell(11.8, 'A6', .08, d=4.6)

# ================================================================== 12.4 - 17.5  the morning: their faces were downcast; Joseph asks why are you sad today (40:6-7): slow minor, a plaintive solo, a soft piano
pad(12.6, 17.8, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .3, att=1.0, bright=900)
solo(13.4, 'Bb4', 2.6, .16, att=.9, bright=1000); pno(15.0, 'D5', 2.2, .09, .4); solo(15.4, 'F4', 2.4, .13, att=.8, bright=1000)
B['timp'].add(S.timpani(FQ('G1'), 1.4, .6), 15.0, .08)

# ================================================================== 17.6 - 25.5  b1: they say we dreamed and no one can explain it (40:8); Joseph says interpretations belong to God, tell me: a held hush, then a warm rising chord with the choir
pad(17.8, 21.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1000)
solo(18.6, 'A4', 2.0, .14, att=.7, bright=1100); pno(20.0, 'F5', 2.0, .08, .4)
pad(21.6, 25.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .36, att=.6, bright=1700)
choir(21.7, 25.8, ['F3', 'A3', 'D4', 'F4'], .26, 'oo', att=1.0); B['brass'].add(horn(M('F3') / 2, 3.2, att=.8, rel=1.2, peak=1300), 22.0, .14, pan=.1)
bell(22.2, 'F6', .12, d=4.6); bell(23.6, 'A6', .1, d=4.6)

# ================================================================== 25.4 - 31.5  b2: the dream pictures, a vine with three branches (40:9-10) and Pharaoh's cup in Pharaoh's hand (40:11): a starlit shimmer
drone(25.4, 31.8, FQ('F1'), .12, att=1.2, rel=1.6)
pad(25.6, 31.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1900)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'A5', 'F5', 'C6', 'A5', 'C6')): pno(26.0 + .55 * k_, nm, 2.4, .11, .5, pan=-.4 + .11 * k_)
bell(26.2, 'C7', .13, d=4.6); bell(28.4, 'F6', .12, d=4.6); bell(30.2, 'A6', .12, d=4.6)
choir(28.2, 31.8, ['A3', 'C4', 'F4'], .2, 'oo', att=1.2)

# ================================================================== 32.1 - 41.9  c1: in three days Pharaoh will restore you (40:12-13): hope; remember me and speak for me (40:14): a plea; I did nothing to deserve this prison (40:15): an unresolved held chord
pad(32.1, 35.7, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=1800)
choir(32.4, 35.8, ['F3', 'A3', 'C4', 'F4'], .24, 'oo', att=1.0); bell(32.6, 'F6', .12, d=4.4); bell(34.2, 'A6', .1, d=4.4)
pad(35.6, 38.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.7, bright=1100)
solo(36.0, 'F5', 2.4, .17, att=.5, bright=1300); solo(37.6, 'D5', 2.0, .14, att=.5, bright=1100)
pad(38.8, 42.2, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .3, att=.6, bright=900)
trem_pad(39.0, 42.4, ['G2', 'D3', 'Bb3'], .12, 6.0); pno(39.6, 'Bb4', 2.2, .08, .38)

# ================================================================== 42.1 - 47.8  c2: the baker's dream, three baskets on his head (40:16) and birds eating from the top one (40:17): uneasy, a tremolo and a slow pulse
drone(41.9, 48.2, FQ('D1'), .2, att=.9, rel=1.8)
pad(42.1, 47.9, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .32, att=.8, bright=800)
trem_pad(42.4, 48.0, ['D2', 'A2', 'F3'], .13, 6.8)
for k_, g_ in enumerate((.04, .05, .06, .07, .08, .09, .1, .12)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 43.6 + .52 * k_, g_)
solo(44.0, 'Ab4', 2.0, .13, att=.6, bright=900); bell(46.2, 'F6', .07, d=4.4)

# ================================================================== 48.0 - 51.8  d1: in three days Pharaoh will have you executed (40:18-19): a low peak, brass and timpani, then a hush (nothing is shown)
for m_ in ('D3', 'A3', 'D4', 'F4'): B['brass'].add(horn(M(m_) / 2, 3.0, att=.5, rel=1.2, peak=1700), 47.9, .2, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('D1'), 3.0, 1.0), 47.9, .28); B['sub'].add(S.sub_boom(FQ('D1'), 3.6), 47.9, .24)
pad(47.9, 52.2, ['D2', 'A2', 'D3', 'F3', 'Ab3', 'C4'], .36, att=.5, bright=1400)
choir(48.0, 52.0, ['D4', 'F4', 'Ab4'], .26, 'ah', att=.9)

# ================================================================== 52.6 - 57.2  d2: the third day, Pharaoh's birthday, as Joseph had said (40:20-22): a brief warm, bright chord for the restored cupbearer; at 55.9 the empty mats, a dark return
pad(52.2, 55.9, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .4, att=.5, bright=2000)
choir(52.3, 55.9, ['F3', 'A3', 'C4', 'F4'], .28, 'oo', att=.7)
for t_, nm, g_ in ((52.6, 'F6', .18), (53.4, 'A6', .14), (54.2, 'C7', .14)): bell(t_, nm, g_, d=4.4)
B['timp'].add(S.timpani(FQ('Bb1'), 2.6, .9), 55.9, .2); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.0), 55.9, .14)
pad(55.9, 58.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=.8, bright=900)

# ================================================================== 58.0 - 60.4  e1: but the cupbearer forgot Joseph (40:23): a lonely high note and a hush, then the reflection's dawn
solo(58.0, 'D5', 2.6, .17, att=.5, bright=900); bell(58.6, 'D6', .09, d=5.0)
pad(58.6, 61.2, ['D2', 'A2', 'D3', 'F3'], .22, att=.9, bright=800)

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
THEME = [(61.4, 'C5', 1.6), (63.2, 'A4', 1.4), (65.0, 'D5', 1.6), (66.8, 'F5', 1.4), (68.6, 'D5', 1.2), (70.0, 'F5', 1.2), (71.4, 'G5', 1.8), (73.4, 'E5', 1.2), (74.8, 'F5', 1.6),
         (76.2, 'A5', 1.2), (77.6, 'Bb5', 1.6), (79.2, 'D6', 1.2), (80.4, 'F6', 1.2), (81.6, 'D6', 1.0), (82.5, 'E6', 1.0)]
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
    sf.write(f'/home/claude/music/out40/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out40/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

