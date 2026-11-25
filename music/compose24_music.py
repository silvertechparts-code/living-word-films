"""Episode 24 (Genesis 24, A Wife for Isaac) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): Abraham sends his servant (a1: a hush at dusk) -> ten camels to the well (b1: a slow pulse of travel) -> the prayer (b2: sparse, reverent) -> Rebekah comes with her jar (c1: a warm lift, rippling harp) -> he bows (c2: tender) ->
     'I will' (d1: morning warmth) -> Isaac in the field (e1: a lone string) -> Sarah's tent (e2: the warm peak, then it eases) -> the reflection (same harmonic progression as Ep23) -> the question chord.
Outputs: out24/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out24', exist_ok=True)
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


# ================================================================== 0 - 8.4  a1: Abraham was old and sends his oldest servant to find a wife for Isaac (24:1-4): a hush at dusk, a lone string, a question in the air
drone(0, 8.8, FQ('F1'), .22, att=1.4, rel=1.6)
pad(0.2, 4.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .2, att=1.8, bright=800); pad(4.6, 8.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .2, att=1.4, bright=900)
choir(2.0, 8.4, ['A3', 'C4', 'F4'], .12, 'oo', att=1.8)
solo(1.8, 'A4', 2.4, .2, att=.8, bright=900); solo(4.8, 'C5', 2.2, .2, att=.8, bright=900)
bell(2.4, 'C6', .08, d=4.8); bell(6.2, 'A5', .08, d=4.6, pan=.3)

# ================================================================== 8.4 - 12.2  b1: the servant took ten camels to the well at evening (24:10-11): a slow, soft pulse of travel
pad(8.4, 12.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .2, att=1.0, bright=1100)
for k_, t_ in enumerate((9.0, 9.9, 10.8, 11.7)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .045 + .006 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 9.2 + .45 * k_, .1, pan=-.3 + .15 * k_)
solo(9.4, 'C5', 1.8, .18, att=.5, bright=1100)

# ================================================================== 12.2 - 21.4  b2: the prayer at the well (24:12-14): sparse and reverent, a long held chord, one bell
pad(12.2, 16.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.4, bright=1000); pad(16.6, 21.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .24, att=1.4, bright=1100)
choir(13.0, 21.4, ['A3', 'D4', 'F4', 'A4'], .2, 'oo', att=1.8)
for t_, nm, d_ in ((13.4, 'F5', 2.0), (16.0, 'D5', 2.0), (18.6, 'A4', 2.2)): solo(t_, nm, d_, .2, att=.7, bright=1100); pno(t_, nm, d_ + .8, .14, .45)
bell(14.0, 'D6', .1, d=4.8); bell(19.4, 'F6', .1, d=4.6, pan=.3)

# ================================================================== 21.4 - 29.2  c1: before he had finished, Rebekah came with her jar and gave him a drink and drew water for all ten camels (24:15-20): a warm lift, a rippling harp
pad(21.4, 25.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=.9, bright=1500); pad(25.0, 29.6, ['F2', 'C3', 'G3', 'C4', 'E4'], .28, att=.9, bright=1700)
choir(22.2, 29.2, ['A3', 'C4', 'F4', 'A4'], .22, 'ah', att=1.2)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 22.0 + .32 * k_, .13, pan=-.3 + .1 * k_)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'A6', 'F6', 'C6')): B['harp'].add(pluck(M(nm)), 25.6 + .34 * k_, .12, pan=.3 - .1 * k_)
solo(22.6, 'A4', 1.8, .2, att=.6, bright=1400); solo(26.0, 'C5', 2.0, .2, att=.6, bright=1500)
bell(23.0, 'C6', .12, d=4.4); bell(27.0, 'A5', .1, d=4.2, pan=.3)

# ================================================================== 29.2 - 34.8  c2: he bowed and blessed the Lord (24:26-27): tender, settled
pad(29.2, 34.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.0, bright=1500)
for t_, nm, d_ in ((29.8, 'C5', 1.5), (31.2, 'A4', 1.5), (32.6, 'F5', 1.8)): solo(t_, nm, d_, .18, att=.5, bright=1300); pno(t_, nm, d_ + .8, .18, .55)
choir(30.0, 34.8, ['A3', 'C4', 'F4'], .2, 'ah', att=1.2)
bell(30.4, 'F6', .1, d=4.2)

# ================================================================== 34.8 - 42.8  d1: her family said "this comes from the Lord", and Rebekah answered "I will" (24:50, 57-58): morning warmth, a lift on the answer
pad(34.8, 38.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .24, att=1.0, bright=1400); pad(38.6, 43.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1900)
choir(35.6, 42.8, ['A3', 'C4', 'F4', 'A4'], .24, 'ah', att=1.2)
for t_, nm, d_ in ((36.0, 'D5', 1.6), (37.8, 'F5', 1.6)): solo(t_, nm, d_, .18, att=.5, bright=1300); pno(t_, nm, d_ + .8, .16, .5)
B['timp'].add(S.timpani(FQ('F1'), 2.0, .6), 40.0, .12)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 40.1 + .3 * k_, .15, pan=-.3 + .2 * k_)
solo(40.2, 'C6', 2.2, .22, att=.4, bright=1900); bell(40.2, 'F6', .16, d=4.4); bell(41.4, 'A6', .12, d=4.2, pan=-.3)

# ================================================================== 42.8 - 48.2  e1: Isaac, walking in the field at evening, saw the camels coming (24:63): a lone string, a hush
pad(42.8, 48.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .2, att=1.2, bright=1000)
choir(43.4, 48.2, ['A3', 'D4', 'F4'], .14, 'oo', att=1.4)
solo(43.4, 'F5', 2.2, .22, att=.7, bright=1200); solo(46.0, 'A5', 2.2, .22, att=.7, bright=1300)
for k_, t_ in enumerate((44.0, 45.2, 46.4)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .04 + .006 * k_)
bell(44.4, 'D6', .1, d=4.6)

# ================================================================== 48.2 - 60.8  e2: Isaac brought her into his mother Sarah's tent; he loved her and was comforted after his mother's death (24:67): the warm peak, then it eases to a held, quiet chord
B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 50.4, .14)
pad(48.2, 51.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1500); pad(51.6, 56.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.8, bright=2300)
choir(51.0, 56.0, ['F3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=.9)
for m_ in ('F3', 'C4', 'A4'): B['brass'].add(horn(M(m_), 3.8, att=.9, rel=1.4, peak=1900), 52.4, .18, pan=.05)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 52.6 + .3 * k_, .16, pan=-.4 + .18 * k_)
for t_, nm, d_ in ((52.8, 'C5', 1.4), (54.2, 'F5', 1.5), (55.4, 'A5', 1.6)): solo(t_, nm, d_, .2, att=.4, bright=1700); pno(t_, nm, d_ + .8, .18, .55)
bell(52.4, 'C7', .2, d=4.4, pan=.3); bell(53.8, 'F6', .18, d=4.2); bell(55.2, 'A6', .16, d=4.2, pan=-.3)
pad(56.4, 58.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1800); pad(58.8, 61.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500)
choir(56.6, 60.6, ['F3', 'A3', 'C4', 'F4'], .3, 'ah', att=1.0)
for t_, nm, d_ in ((57.0, 'A4', 1.6), (58.6, 'F5', 1.7), (59.8, 'C5', 1.9)): solo(t_, nm, d_, .2, att=.5, bright=1400); pno(t_, nm, d_ + .8, .18, .5)
bell(57.4, 'F6', .14, d=4.4); bell(59.4, 'A5', .1, d=4.4, pan=.3)

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
    sf.write(f'/home/claude/music/out24/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out24/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
