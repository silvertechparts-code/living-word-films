"""Episode 33 (Genesis 33, Jacob meets Esau) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): a held breath and a low rumble as Esau's host rises (a1) -> seven bows, a soft pulse (a2) -> Esau's run and the embrace, the emotional peak (b1) -> a tender, hushed family (b2, c1) -> the gift and a luminous swell (c2) -> an unhurried journey (d1) -> a sacred hush at the altar (e1) -> the warm reflection and the question (as in the other episodes).
Outputs: out33/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out33', exist_ok=True)
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





# ================================================================== 0 - 9.8  a1: Jacob looks up and sees Esau coming with four hundred men; he arranges his family, Rachel and Joseph last (33:1-2): a held breath, then a low rumble as the host rises
drone(0, 9.8, FQ('D1'), .22, att=1.2, rel=1.8)
pad(0.2, 4.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.4, bright=900)
solo(0.9, 'A4', 2.0, .2, att=.8, bright=1000); pno(1.6, 'D5', 3.0, .12, .42)
B['timp'].add(S.timpani(FQ('D1'), 2.4, 1.0), 1.0, .16); B['sub'].add(S.sub_boom(FQ('D1'), 3.2), 1.0, .2)
trem_pad(1.6, 4.8, ['D2', 'A2', 'F3'], .16, 6.0)
for k_ in range(6): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 2.2 + .5 * k_, .05 + .01 * k_)
pad(4.6, 10.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.9, bright=1100)
solo(5.2, 'F4', 2.0, .18, att=.6, bright=1000); solo(7.4, 'D5', 2.0, .18, att=.6, bright=1100); pno(6.2, 'A4', 2.6, .11, .42)
bell(8.6, 'D6', .08, d=5.0)

# ================================================================== 9.9 - 15.8  a2: he went ahead and bowed to the ground seven times (33:3): a soft pulse on each bow
pad(10.0, 15.8, ['D2', 'A2', 'D3', 'F3'], .26, att=1.0, bright=900)
solo(10.4, 'A4', 2.0, .2, att=.6, bright=1000)
for k_ in range(7): B['timp'].add(S.timpani(FQ('D1'), .9, .5), 11.1 + .67 * k_, .05 + .007 * k_)
solo(12.6, 'C5', 1.8, .19, att=.5, bright=1100); solo(14.2, 'D5', 1.8, .19, att=.5, bright=1100); pno(12.8, 'F4', 2.6, .11, .42)
trem_pad(13.0, 16.0, ['D2', 'A2', 'F3'], .15, 6.5)

# ================================================================== 15.8 - 23.2  b1: but Esau ran to meet him, embraced him, fell on his neck, kissed him, and they wept (33:4): his run builds, the embrace is the release and the emotional peak
for k_ in range(8): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 15.8 + .26 * k_, .06 + .012 * k_)
pad(15.8, 18.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.4, bright=1500)
B['timp'].add(S.timpani(FQ('F1'), 2.6, 1.0), 18.0, .18); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 18.0, .2)
pad(18.0, 23.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .42, att=.5, bright=2400)
choir(18.2, 23.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 18.4 + .3 * k_, .1, pan=-.3 + .08 * k_)
solo(18.6, 'C5', 2.2, .24, att=.5, bright=2000); solo(20.6, 'F5', 2.2, .25, att=.5, bright=2200); pno(19.0, 'A5', 3.0, .15, .5)
bell(18.3, 'F6', .16, d=4.8); bell(20.8, 'C7', .14, d=4.6, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.8, rel=1.4, peak=1500), 19.6, .1, pan=.1)

# ================================================================== 23.2 - 31.0  b2: Esau saw the women and children: who are these? The children God has graciously given me (33:5-7): tender, the family comes forward and bows
pad(23.2, 27.4, ['F2', 'C3', 'F3', 'A3'], .3, att=1.2, bright=1300); pad(27.4, 31.0, ['D2', 'A2', 'D3', 'F3'], .3, att=1.0, bright=1300)
choir(23.6, 31.0, ['A3', 'C4', 'F4'], .22, 'oo', att=1.4)
solo(24.2, 'A4', 2.0, .18, att=.7, bright=1100); pno(25.0, 'F5', 2.8, .11, .42); solo(26.4, 'C5', 2.0, .18, att=.6, bright=1100)
bell(28.4, 'A6', .08, d=5.0, pan=-.2); bell(29.4, 'D6', .08, d=5.0, pan=.2)

# ================================================================== 31.0 - 35.8  c1: I have enough, my brother; keep what is yours (33:9): warm, an open chord
pad(31.0, 35.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1500)
solo(31.4, 'D5', 1.8, .2, att=.5, bright=1300); solo(33.0, 'F5', 2.0, .2, att=.6, bright=1400); pno(32.4, 'A4', 2.6, .12, .44)

# ================================================================== 35.6 - 44.6  c2: please accept my gift; to see your face is like seeing the face of God (33:10-11): the gift arrives, then a luminous swell
pad(35.6, 40.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.9, bright=1900); pad(40.4, 45.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.8, bright=2500)
choir(36.4, 45.0, ['A3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 36.6 + .34 * k_, .09, pan=-.3 + .1 * k_)
for t_, nm, d_ in ((38.0, 'C5', 2.0), (40.2, 'F5', 2.0), (42.2, 'A5', 2.2)): solo(t_, nm, d_, .24, att=.4, bright=2100); pno(t_, nm, d_ + .8, .14, .5)
bell(40.6, 'F6', .14, d=4.8); bell(42.6, 'C7', .14, d=4.6, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1400), 41.0, .1, pan=.1)

# ================================================================== 44.6 - 53.4  d1: Esau accepted and returned to Seir; Jacob went on slowly at the pace of his children and flocks (33:11-16): a gentle rolling figure, unhurried
pad(44.6, 49.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.0, bright=1600); pad(49.0, 53.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1500)
arp(44.8, 52.8, 41, 4, .08, .44)
solo(45.4, 'C5', 2.0, .2, att=.6, bright=1400); solo(47.4, 'A4', 2.0, .19, att=.6, bright=1300); solo(49.6, 'F5', 2.0, .19, att=.6, bright=1400); pno(46.4, 'F5', 2.8, .11, .44)
bell(51.0, 'F6', .1, d=4.6)

# ================================================================== 53.2 - 60.8  e1: he came safely to Shechem, bought a piece of land, and built an altar there (33:18-20): a sacred hush, a bell for each of the seven stones
pad(53.2, 57.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.0, bright=1500)
choir(53.6, 59.6, ['A3', 'C4', 'F4'], .3, 'oo', att=1.2)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A5', 'C6', 'F6')): bell(55.0 + .42 * k_, nm, .07, d=3.4, pan=-.2 + .07 * k_)
solo(56.6, 'C5', 2.0, .2, att=.5, bright=1500); pno(57.0, 'A4', 2.6, .12, .45)
pad(57.4, 60.8, ['F2', 'C3', 'F3', 'A3'], .26, att=.8, bright=1500)
solo(58.0, 'F5', 1.8, .18, att=.5, bright=1500); bell(59.2, 'F6', .1, d=4.6)

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
    sf.write(f'/home/claude/music/out33/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out33/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

