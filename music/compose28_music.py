"""Episode 28 (Genesis 28, Jacob's Dream at Bethel) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): Isaac blesses Jacob and sends him away (a1) -> the lonely road and the stone for a pillow at sunset (a2) -> the dream: a stairway to heaven with angels (b1)
 -> the Lord stands beside him: the God of Abraham and Isaac, the land is yours (b2) -> all families blessed in you; I am with you (b3) -> Jacob wakes afraid: the gate of heaven (c1)
 -> dawn, the stone set up as a pillar, oil poured, Bethel (c2) -> the reflection (same harmonic progression as Ep23/25/26/27) -> the question chord.
Outputs: out28/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out28', exist_ok=True)
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





# ================================================================== 0 - 9.0  a1: Isaac blessed Jacob and sent him to Paddan-aram (28:1-5): a warm, solemn blessing, a lone string, a quiet parting
drone(0, 9.0, FQ('F1'), .22, att=1.2, rel=1.8)
pad(0.2, 4.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.6, bright=900); pad(4.0, 9.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.2, bright=1100)
solo(1.0, 'C5', 2.4, .2, att=.9, bright=900); solo(3.2, 'A4', 2.2, .2, att=.9, bright=900); solo(5.4, 'F5', 2.4, .2, att=.8, bright=1000); solo(7.0, 'D5', 2.2, .18, att=.8, bright=1000)
choir(3.4, 7.8, ['A3', 'C4', 'F4'], .18, 'oo', att=1.4)
for k_, nm in enumerate(('F5', 'A5', 'C6')): B['harp'].add(pluck(M(nm)), 4.4 + .34 * k_, .08, pan=-.3 + .15 * k_)
bell(2.0, 'F5', .1, d=5.0); bell(5.6, 'C6', .12, d=4.8, pan=.3)
B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), 7.8, .06)

# ================================================================== 9.3 - 18.6  a2: Jacob left Beersheba for Haran; at sunset he stopped for the night and slept with a stone for a pillow (28:10-11): a lonely road, a thin string, sparse piano, dusk
pad(9.0, 13.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .2, att=1.0, bright=800)
solo(10.2, 'A4', 2.2, .2, att=.7, bright=900); solo(12.0, 'F5', 2.0, .2, att=.7, bright=1000); solo(13.8, 'D5', 2.2, .2, att=.7, bright=1000)
pno(11.0, 'D5', 3.0, .16, .45); pno(12.8, 'F5', 3.0, .14, .45); pno(14.6, 'A4', 3.2, .14, .42)
pad(13.0, 18.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .24, att=1.0, bright=900)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 14.2 + .4 * k_, .08, pan=-.3 + .12 * k_)
solo(15.2, 'Db5', 2.0, .2, att=.6, bright=1000); solo(16.9, 'Ab4', 2.4, .18, att=.7, bright=900)
bell(11.4, 'D6', .1, d=4.6); bell(15.8, 'F6', .1, d=4.4, pan=.3)

# ================================================================== 18.9 - 27.6  b1: he dreamed of a stairway set on the earth, its top reaching heaven, with angels going up and down on it (28:12): awe, a rising harp, a choir, bells
B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 19.2, .2)
pad(19.0, 23.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1800)
choir(19.4, 27.6, ['A3', 'C4', 'F4', 'A4'], .32, 'ah', att=1.2)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 19.6 + .22 * k_, .1, pan=-.3 + .08 * k_)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C7')): B['harp'].add(pluck(M(nm)), 22.6 + .26 * k_, .09, pan=-.3 + .1 * k_)
solo(20.4, 'C5', 2.0, .22, att=.5, bright=1900); solo(22.2, 'A5', 2.0, .22, att=.5, bright=2000)
pad(23.0, 27.9, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=1.0, bright=2200)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1500), 26.6, .12, pan=.1)
bell(19.5, 'F6', .16, d=4.6); bell(22.4, 'C7', .14, d=4.4, pan=.3); bell(24.4, 'A6', .14, d=4.4)

# ================================================================== 27.7 - 36.9  b2: the Lord stood beside him: I am the God of Abraham and Isaac; the land on which you lie I will give you (28:13): a full warm chord, brass and choir
B['timp'].add(S.timpani(FQ('F1'), 2.4, .9), 27.4, .18); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 27.4, .3)
pad(27.4, 31.6, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .42, att=.6, bright=2400)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 4.0, att=.6, rel=1.4, peak=1700), 27.6, .16, pan=.1)
choir(27.8, 35.9, ['F3', 'A3', 'C4', 'F4', 'A4'], .4, 'ah', att=1.0)
solo(28.4, 'C5', 2.0, .24, att=.4, bright=1900); solo(30.2, 'A5', 2.0, .24, att=.4, bright=2000)
pad(31.6, 36.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .4, att=.8, bright=2600)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'A5', 'F5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 32.0 + .34 * k_, .1, pan=-.3 + .08 * k_)
pno(29.2, 'F5', 3.0, .16, .5); pno(33.6, 'D5', 3.0, .16, .5)
bell(28.0, 'F6', .14, d=4.6); bell(32.4, 'A6', .14, d=4.6, pan=.3); bell(35.0, 'C7', .12, d=4.4)

# ================================================================== 37.3 - 44.5  b3: all the families of the earth shall be blessed in you; I am with you and will not leave you (28:14-15): the warm peak, harp shimmer and a rising choir
pad(36.6, 40.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .44, att=.8, bright=2600); pad(40.0, 44.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .5, att=.8, bright=3000)
choir(37.0, 44.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=.9)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 37.8 + .32 * k_, .12, pan=-.3 + .08 * k_)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 40.6 + .34 * k_, .11, pan=-.3 + .1 * k_)
for t_, nm, d_ in ((38.0, 'A4', 2.0), (40.0, 'C5', 2.0), (42.0, 'F5', 2.4)): solo(t_, nm, d_, .26, att=.5, bright=2000); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1600), 40.0, .12, pan=.1)
bell(38.0, 'F6', .14, d=4.6); bell(40.0, 'A6', .16, d=4.6, pan=.3); bell(41.8, 'C7', .14, d=4.4); bell(43.2, 'F6', .12, d=4.4)

# ================================================================== 45.0 - 54.6  c1: Jacob woke, afraid: surely the Lord is in this place, and I did not know it; this is the gate of heaven (28:16-17): a sudden hush, a tremble, then awe
pad(44.2, 47.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.0, bright=1000)
B['timp'].add(S.timpani(FQ('F1'), 2.0, .8), 46.0, .16); B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 46.0, .26)
trem_pad(46.2, 50.8, ['A2', 'D3', 'F3'], .2, 7.0)
pad(46.6, 51.4, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3', 'Ab3'], .3, att=.6, bright=1500)
solo(47.0, 'A4', 1.8, .2, att=.5, bright=1100); solo(48.6, 'F5', 1.8, .22, att=.5, bright=1300)
for k_, t_ in enumerate((47.6, 48.6, 49.6, 50.4)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .008 * k_)
pad(51.0, 54.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=2200)
choir(51.2, 54.8, ['A3', 'C4', 'F4'], .34, 'ah', att=.8)
solo(51.6, 'C5', 2.0, .28, att=.4, bright=2000); solo(53.0, 'F5', 2.0, .28, att=.4, bright=2200)
bell(51.8, 'F6', .14, d=4.6); bell(53.4, 'C6', .12, d=4.6, pan=.3)

# ================================================================== 54.6 - 61.6  c2: early in the morning he took the stone, set it up as a pillar, poured oil on it and called the place Bethel (28:18-19): dawn, a hopeful rise, bells at the oil
pad(54.4, 58.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.9, bright=2400); pad(58.0, 61.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.9, bright=2000)
choir(54.8, 60.6, ['A3', 'C4', 'F4', 'A4'], .38, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 54.8 + .32 * k_, .11, pan=-.3 + .1 * k_)
for t_, nm, d_ in ((55.0, 'A4', 2.0), (56.6, 'C5', 2.0), (58.2, 'F5', 2.2)): solo(t_, nm, d_, .26, att=.5, bright=2000); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.0, att=.8, rel=1.4, peak=1500), 56.4, .12, pan=.1)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 56.4, .14)
bell(56.9, 'C7', .16, d=4.4); bell(58.0, 'F6', .14, d=4.6, pan=.3); bell(59.4, 'A6', .12, d=4.4)

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
    sf.write(f'/home/claude/music/out28/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out28/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

