"""Episode 29 (Genesis 29, Seven Years for Rachel) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): the well in open country (a1) -> here comes Rachel (a2) -> the stone, the flock, the kiss and tears (a3) -> Laban's welcome and seven years (b1) -> the years like a few days (b2)
 -> the wedding night, a hush (c1) -> the morning, why have you deceived me (c2) -> Rachel too, seven more years (c3) -> the Lord sees Leah unloved (d1) -> Judah, I will praise the Lord (d2)
 -> the reflection (same harmonic progression as Ep23/25-28) -> the question chord.
Outputs: out29/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out29', exist_ok=True)
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





# ================================================================== 0 - 7.0  a1: Jacob reached a well in the open country, where shepherds waited to roll away its great stone (29:1-3): open country, a warm pad, a lone string, a pastoral harp
drone(0, 7.2, FQ('F1'), .2, att=1.2, rel=1.8)
pad(0.2, 3.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.6, bright=1000); pad(3.8, 7.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.2, bright=1200)
solo(1.0, 'C5', 2.2, .22, att=.8, bright=1000); solo(3.0, 'A4', 2.0, .2, att=.8, bright=1000); solo(4.8, 'F5', 2.2, .22, att=.7, bright=1100)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 2.4 + .36 * k_, .08, pan=-.3 + .15 * k_)
bell(1.6, 'F6', .1, d=5.0); bell(5.0, 'C6', .1, d=4.6, pan=.3)

# ================================================================== 7.2 - 11.3  a2: they said: here comes Laban's daughter Rachel with his sheep (29:6-9): a gentle rise, sparse piano, hope
pad(7.0, 11.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=.9, bright=1300)
solo(7.4, 'A4', 1.8, .22, att=.6, bright=1200); solo(9.0, 'D5', 1.8, .22, att=.6, bright=1300)
pno(8.0, 'F5', 2.6, .18, .45); pno(9.6, 'A5', 2.6, .16, .45)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'D6')): B['harp'].add(pluck(M(nm)), 8.4 + .34 * k_, .08, pan=-.3 + .12 * k_)
bell(9.8, 'D6', .1, d=4.4, pan=.2)

# ================================================================== 11.45 - 16.9  a3: Jacob rolled the stone away, watered her flock, kissed Rachel, and wept aloud (29:10-11): a stone-lift timp, then a warm swell to the kiss and the tears
B['timp'].add(S.timpani(FQ('F1'), 1.6, .8), 12.2, .12); B['sub'].add(S.sub_boom(FQ('F1'), 2.6), 12.2, .14)
pad(11.4, 14.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.8, bright=1700); pad(14.8, 17.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .38, att=.7, bright=2100)
choir(13.0, 17.2, ['A3', 'C4', 'F4', 'A4'], .34, 'oo', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6')): B['harp'].add(pluck(M(nm)), 13.2 + .3 * k_, .1, pan=-.3 + .1 * k_)
solo(14.0, 'A4', 2.0, .24, att=.5, bright=1700); solo(15.4, 'C5', 2.2, .26, att=.5, bright=1900); solo(16.4, 'F5', 2.0, .24, att=.5, bright=1900)
pno(15.2, 'F5', 3.0, .18, .5)
bell(15.3, 'F6', .16, d=4.6); bell(16.2, 'C7', .12, d=4.4, pan=.3)

# ================================================================== 17.6 - 23.5  b1: Laban welcomed him; Jacob said: I will work seven years for Rachel, your younger daughter (29:13-18): warm, homely, steady
pad(17.4, 21.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.9, bright=1800); pad(21.0, 24.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.9, bright=2000)
choir(18.0, 24.0, ['A3', 'C4', 'F4'], .3, 'ah', att=1.1)
for t_, nm, d_ in ((18.4, 'C5', 2.0), (20.2, 'A4', 2.0), (22.0, 'D5', 2.2)): solo(t_, nm, d_, .24, att=.5, bright=1800); pno(t_, nm, d_ + .8, .15, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1400), 21.0, .1, pan=.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'A5', 'F5', 'C6')): B['harp'].add(pluck(M(nm)), 21.4 + .32 * k_, .09, pan=-.3 + .1 * k_)
bell(21.4, 'F6', .12, d=4.4); bell(22.8, 'A6', .1, d=4.4, pan=.3)

# ================================================================== 24.5 - 29.8  b2: the seven years felt like a few days, because he loved her (29:20): time flowing, rolling harp, tender and bright
pad(24.2, 27.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=2200); pad(27.4, 30.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.8, bright=1800)
arp(24.4, 28.2, 41, 4, .12, .52)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5', 'C6')): B['harp'].add(pluck(M(nm)), 25.0 + .4 * k_, .1, pan=-.3 + .08 * k_)
solo(25.4, 'A5', 2.2, .24, att=.5, bright=2000); solo(27.0, 'F5', 2.2, .22, att=.5, bright=1800)
bell(25.6, 'C6', .12, d=4.6); bell(27.0, 'F6', .12, d=4.4, pan=.3); bell(28.4, 'A6', .1, d=4.4)

# ================================================================== 30.0 - 35.0  c1: on the wedding night Laban brought his older daughter Leah to Jacob (29:22-23): a feast dusk, a held breath, then a hush (the night is told in one sentence)
pad(29.8, 33.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.0, bright=1100); pad(33.0, 36.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .24, att=1.2, bright=900)
solo(30.6, 'A4', 2.0, .2, att=.7, bright=1000); solo(32.4, 'F5', 2.2, .2, att=.7, bright=1100); solo(34.0, 'D5', 2.0, .18, att=.8, bright=1000)
pno(31.2, 'D5', 3.0, .15, .42); pno(33.0, 'F5', 3.0, .14, .4)
B['timp'].add(S.timpani(FQ('F1'), 2.0, .6), 34.6, .08)
bell(31.6, 'D6', .08, d=4.6); bell(34.2, 'F6', .08, d=4.6, pan=.3)

# ================================================================== 35.2 - 42.7  c2: in the morning Jacob cried: why did you deceive me? Laban answered: the younger is never given before the firstborn (29:25-26): a tremble, a low swell, a held tension
B['timp'].add(S.timpani(FQ('F1'), 2.0, .8), 35.6, .14); B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 35.6, .22)
trem_pad(35.8, 40.4, ['A2', 'D3', 'F3'], .2, 6.5)
pad(36.0, 39.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3', 'Ab3'], .3, att=.6, bright=1500)
solo(36.6, 'A4', 1.8, .22, att=.5, bright=1100); solo(38.2, 'F5', 1.8, .22, att=.5, bright=1300)
for k_, t_ in enumerate((37.4, 38.4, 39.4, 40.2)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .008 * k_)
for m_ in ('F2', 'C3'): B['brass'].add(horn(M(m_), 3.6, att=.8, rel=1.4, peak=1200), 39.6, .1, pan=.1)
pad(39.6, 43.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.8, bright=1500)
solo(40.4, 'D5', 2.0, .2, att=.6, bright=1300)

# ================================================================== 43.7 - 49.6  c3: after the bridal week Laban gave him Rachel too, for seven more years of work (29:27-30): bittersweet, a slow piano, strings, steady years
pad(43.4, 46.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.8, bright=1900); pad(46.6, 49.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1800)
choir(44.0, 49.6, ['A3', 'C4', 'F4'], .3, 'oo', att=1.2)
for t_, nm, d_ in ((44.4, 'C5', 2.2), (46.0, 'A4', 2.2), (47.6, 'D5', 2.4)): solo(t_, nm, d_, .24, att=.5, bright=1800); pno(t_, nm, d_ + .8, .16, .5)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 46.6 + .36 * k_, .09, pan=-.3 + .1 * k_)
bell(45.0, 'F6', .1, d=4.6); bell(47.2, 'C6', .1, d=4.6, pan=.3); bell(48.8, 'A6', .1, d=4.4)

# ================================================================== 50.35 - 55.4  d1: the Lord saw that Leah was unloved, and she bore Reuben, Simeon and Levi (29:31-34): a luminous hush, a choir, compassion
B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 49.9, .12)
pad(50.0, 53.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.0, bright=2000); pad(53.4, 56.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.9, bright=1800)
choir(50.6, 56.2, ['A3', 'C4', 'F4', 'A4'], .38, 'ah', att=1.1)
for t_, nm, d_ in ((51.0, 'A4', 2.2), (52.8, 'C5', 2.2), (54.4, 'F5', 2.2)): solo(t_, nm, d_, .26, att=.5, bright=1900); pno(t_, nm, d_ + .8, .16, .5)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 51.4 + .34 * k_, .09, pan=-.3 + .1 * k_)
bell(51.2, 'F6', .12, d=4.6); bell(52.6, 'A6', .12, d=4.6, pan=.3); bell(54.0, 'C7', .1, d=4.4)

# ================================================================== 56.2 - 61.6  d2: her fourth son she named Judah: this time I will praise the Lord (29:35): a warm lift, bells, a bright peak that settles
pad(56.0, 58.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.6, bright=2600); pad(58.8, 61.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.9, bright=2400)
choir(56.4, 61.0, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 56.6 + .3 * k_, .11, pan=-.3 + .08 * k_)
for t_, nm, d_ in ((57.0, 'D5', 2.0), (58.4, 'F5', 2.0), (59.6, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.4, bright=2200); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.2, att=.8, rel=1.4, peak=1500), 57.0, .12, pan=.1)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 57.2, .14)
bell(57.4, 'C7', .16, d=4.4); bell(58.6, 'F6', .14, d=4.6, pan=.3); bell(60.0, 'A6', .12, d=4.4)

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
    sf.write(f'/home/claude/music/out29/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out29/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

