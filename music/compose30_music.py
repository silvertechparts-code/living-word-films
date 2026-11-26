"""Episode 30 (Genesis 30, Rachel and Leah, Joseph's birth, Jacob's flocks) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): Rachel's longing and the plea (a1) -> Jacob's answer, a low stab (a2) -> the maids and four sons (b1) -> two more sons and Dinah (b2) -> God remembered Rachel, a luminous swell (c1)
 -> let me go home, the Lord blessed me because of you (d1) -> the dark lambs and spotted goats, a quiet watchfulness (d2) -> Jacob grew very rich, a bright lift (e1)
 -> the reflection (same harmonic progression as Ep23/25-29) -> the question chord.
Outputs: out30/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out30', exist_ok=True)
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





# ================================================================== 0 - 8.4  a1: Rachel had no children and envied her sister; she told Jacob: give me children, or I will die (30:1): a low drone, a lone solo, sparse piano, tension that rises to the plea
drone(0, 8.6, FQ('D1'), .2, att=1.2, rel=1.8)
pad(0.2, 4.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=1.6, bright=900); pad(4.4, 8.8, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .26, att=1.0, bright=1100)
solo(1.0, 'A4', 2.2, .2, att=.8, bright=1000); solo(3.2, 'F5', 2.0, .2, att=.8, bright=1000); solo(5.4, 'D5', 2.0, .2, att=.7, bright=1100)
pno(2.0, 'D5', 3.0, .14, .42); pno(4.0, 'A5', 3.0, .12, .4)
trem_pad(5.8, 8.8, ['A2', 'D3', 'F3'], .18, 6.5)
bell(1.6, 'D6', .08, d=5.0); bell(6.2, 'F6', .08, d=4.6, pan=.3)

# ================================================================== 8.4 - 12.6  a2: Jacob answered: am I God, who has kept children from you? (30:2): a low stab and a held, sombre chord
B['timp'].add(S.timpani(FQ('D1'), 2.0, .9), 8.45, .14); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 8.45, .2)
pad(8.4, 12.8, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.5, bright=1300)
solo(9.2, 'F5', 1.8, .2, att=.5, bright=1200); solo(10.8, 'D5', 1.8, .2, att=.6, bright=1100)
pno(9.6, 'D5', 2.8, .14, .45)

# ================================================================== 12.6 - 21.0  b1: Rachel and Leah each gave Jacob a maid; the maids bore four sons: Dan, Naphtali, Gad, Asher (30:3-13): steady and homely, a rolling figure, a soft bell as each name is spoken
pad(12.6, 16.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.9, bright=1700); pad(16.6, 21.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.9, bright=1900)
choir(13.4, 20.8, ['A3', 'C4', 'F4'], .28, 'oo', att=1.1)
arp(13.0, 17.4, 41, 4, .1, .5)
for t_, nm, d_ in ((14.0, 'C5', 2.0), (15.8, 'A4', 2.0), (17.4, 'D5', 2.2)): solo(t_, nm, d_, .22, att=.5, bright=1700); pno(t_, nm, d_ + .8, .14, .5)
for k_, (t_, nm) in enumerate(((17.85, 'F5'), (18.4, 'A5'), (19.2, 'C6'), (19.75, 'F6'))): bell(t_, nm, .12, d=4.2, pan=-.3 + .2 * k_)

# ================================================================== 21.0 - 26.0  b2: Leah bore two more sons, Issachar and Zebulun, and a daughter, Dinah (30:17-21): a brighter, warmer lift; bells on the names
pad(21.0, 24.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=2200); pad(24.2, 26.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.8, bright=1900)
arp(21.4, 25.4, 41, 4, .11, .52)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 21.6 + .38 * k_, .1, pan=-.3 + .1 * k_)
solo(22.0, 'A5', 2.2, .22, att=.5, bright=2000); solo(24.0, 'F5', 2.2, .2, att=.5, bright=1800)
for t_, nm in ((23.0, 'C6'), (23.75, 'F6'), (24.95, 'A6')): bell(t_, nm, .12, d=4.4, pan=.2)

# ================================================================== 26.0 - 34.0  c1: then God remembered Rachel; she bore a son and called him Joseph (30:22-24): a hush, then a luminous choir swell as the light falls; the peak at the name
B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 26.2, .16)
pad(26.0, 29.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=1.0, bright=2200); pad(29.4, 34.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.9, bright=2600)
choir(26.6, 34.0, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 26.8 + .34 * k_, .11, pan=-.3 + .08 * k_)
solo(27.0, 'A4', 2.2, .24, att=.5, bright=1900); solo(29.2, 'C5', 2.2, .26, att=.5, bright=2100); solo(31.0, 'F5', 2.2, .26, att=.5, bright=2200)
pno(27.4, 'F5', 3.0, .18, .5); pno(30.2, 'A5', 3.0, .16, .5)
bell(26.6, 'F6', .18, d=4.8); bell(28.6, 'C7', .14, d=4.6, pan=.3); bell(30.6, 'A6', .14, d=4.6); bell(32.0, 'F6', .2, d=5.0, pan=.2)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.9, rel=1.4, peak=1500), 31.2, .1, pan=.1)

# ================================================================== 34.0 - 44.6  d1: Jacob asked Laban to let him go home with his wives and children; Laban said: I have learned the Lord blessed me because of you; name your wages (30:25-28): warm and steady, a slow piano, a dusk glow
pad(34.0, 38.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1500); pad(38.4, 41.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.9, bright=1700); pad(41.8, 45.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.9, bright=1800)
choir(35.0, 44.4, ['A3', 'C4', 'F4'], .28, 'oo', att=1.2)
for t_, nm, d_ in ((34.8, 'A4', 2.2), (36.8, 'F5', 2.2), (38.6, 'D5', 2.2), (40.6, 'C5', 2.4), (42.4, 'A4', 2.4)): solo(t_, nm, d_, .22, att=.5, bright=1600); pno(t_, nm, d_ + .8, .14, .5)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'A5', 'F5', 'C6')): B['harp'].add(pluck(M(nm)), 39.6 + .36 * k_, .09, pan=-.3 + .1 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1300), 40.2, .09, pan=.1)
bell(35.6, 'D6', .1, d=4.6); bell(40.6, 'F6', .12, d=4.6, pan=.3); bell(43.0, 'A6', .1, d=4.4)

# ================================================================== 44.6 - 54.2  d2: Jacob asked for the dark lambs and spotted goats; Laban agreed, then sent those animals three days away (30:31-36): a quiet watchfulness, a low tremolo, then a hush as the flocks go
B['timp'].add(S.timpani(FQ('D1'), 1.8, .6), 44.8, .1)
trem_pad(45.0, 49.4, ['D2', 'A2', 'F3'], .18, 6.5)
pad(45.0, 49.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .28, att=.9, bright=1300)
solo(46.0, 'D5', 1.8, .2, att=.5, bright=1200); solo(47.8, 'F5', 1.8, .2, att=.5, bright=1300)
pno(46.4, 'A4', 2.6, .14, .45); pno(48.2, 'D5', 2.6, .13, .45)
for t_ in (49.4, 50.4, 51.4, 52.4): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), t_, .05)
pad(49.6, 54.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1400)
solo(51.6, 'D5', 2.0, .2, att=.6, bright=1200); bell(52.6, 'F6', .08, d=4.6, pan=.3)

# ================================================================== 54.2 - 60.6  e1: Jacob's flocks grew and he became very rich, with servants, camels and donkeys (30:43): a warm lift that grows into a bright, full peak and settles
pad(54.2, 57.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.6, bright=2400); pad(57.0, 60.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.8, bright=2800)
choir(54.6, 60.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 54.6 + .32 * k_, .11, pan=-.3 + .08 * k_)
for t_, nm, d_ in ((55.0, 'D5', 2.0), (56.6, 'F5', 2.0), (58.0, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.4, bright=2200); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1500), 56.2, .12, pan=.1)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 56.4, .14)
bell(55.6, 'C7', .14, d=4.4); bell(57.2, 'F6', .14, d=4.6, pan=.3); bell(58.8, 'A6', .12, d=4.4)

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
    sf.write(f'/home/claude/music/out30/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out30/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

