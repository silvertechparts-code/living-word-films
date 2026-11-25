"""Episode 14 (Genesis 14, Abram's rescue) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): the four kings' war (dark drone, timpani, horn) -> Lot carried off (a lament) -> the survivor (hush) -> the 318 muster and the chase (a rising march)
     -> the night (hush) -> the attack (timpani roll, brass, trem) -> Lot brought back (warm release) -> the king of Sodom comes out -> Melchizedek, bread and wine (serene choir, bells)
     -> the blessing and the tenth (warm swell) -> the king's offer and Abram's refusal (suspended, then firm) -> "I made Abram rich" (glory to God, resolving to F) -> the reflection (same harmony family as the other episodes) -> the question: a warm sustained chord.
Outputs: out14/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out14', exist_ok=True)
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

# ================================================================== 0 - 4.7  a1: four kings against five, war on the plain: a dark drone, timpani, a horn call (D minor)
drone(0, 4.9, FQ('D1'), .42, att=1.0, rel=1.4); B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 0.1, .4)
trem_pad(0.2, 5.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, 7.0)
for t_, g_ in ((1.0, .5), (1.8, .56), (2.6, .64), (3.3, .72), (3.9, .82), (4.3, .9)): B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), t_, g_ * .5)
B['brass'].add(horn(M('D3'), 3.0, att=.5, rel=1.4, peak=1500), 1.2, .3, pan=-.1); B['brass'].add(horn(M('A3'), 2.6, att=.4, rel=1.4, peak=1500), 2.6, .26, pan=.1)
for t_, nm in ((1.6, 'F4'), (3.2, 'D4')): solo(t_, nm, 1.8, .22, att=.5, bright=1200)

# ================================================================== 4.7 - 8.8  b1: Lot and his possessions carried off: a lament (slow minor line, soft choir)
pad(4.6, 8.9, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=900)
choir(5.0, 8.9, ['D4', 'F4', 'A4'], .26, 'ah', att=1.2)
for t_, nm, d_ in ((5.0, 'A4', 1.5), (6.4, 'G4', 1.5), (7.6, 'F4', 1.6)): solo(t_, nm, d_, .28, att=.5, bright=1300); pno(t_, nm, d_ + .8, .3, .55)
pno(5.0, 'D3', 3.6, .34, .55); bell(6.0, 'D6', .12, d=4.2, pan=-.2)

# ================================================================== 8.8 - 11.7  c1: a survivor comes and tells Abram: a held hush, a single piano note, a quiet heartbeat
trem_pad(8.8, 12.0, ['D2', 'A2', 'C3', 'F3'], .24, 6.0)
for k_, t_ in enumerate(np.arange(9.2, 11.6, 1.0)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), t_, .1 + .02 * k_)
pno(9.4, 'A4', 2.4, .28, .55, pan=-.2); pno(10.6, 'G4', 2.4, .28, .55, pan=.2); solo(10.0, 'D5', 2.0, .2, att=.6, bright=1200)

# ================================================================== 11.7 - 20.1  c2: Abram musters 318 trained men and pursues to Dan: a rising march (D, then F), timpani pulse, horns
B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 11.8, .3)
for a, b, ns, g_ in ((11.7, 14.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .26), (14.4, 17.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3), (17.2, 20.3, ['C2', 'G2', 'C3', 'E3', 'G3'], .34)):
    k = (a - 11.7) / 8.4; pad(a, b, ns, g_, att=.8, bright=1000 + 1600 * k)
for k_, t_ in enumerate(np.arange(12.0, 20.0, BEAT)): B['timp'].add(S.timpani(FQ('D1' if k_ % 2 == 0 else 'A1'), .9, .5), t_, .16 + .012 * k_)
arp(14.4, 20.1, 38, 3, .06, .46)
for m, t_ in (('D3', 14.0), ('A3', 14.0), ('F3', 17.0), ('C4', 17.0)): B['brass'].add(horn(M(m), 3.0, att=.5, rel=1.4, peak=1700), t_, .24, pan=.1)
choir(14.6, 20.2, ['D4', 'F4', 'A4'], .22, 'oo', att=1.2)
for t_, nm, d_ in ((15.0, 'A4', 1.3), (16.4, 'D5', 1.3), (17.8, 'F5', 1.4), (19.0, 'A5', 1.4)): solo(t_, nm, d_, .26, att=.4, bright=1700)

# ================================================================== 20.1 - 22.9  c3: night, they divide: a hush, a low drone, scattered notes
drone(20.0, 23.2, FQ('D1'), .3, att=.8, rel=1.2); pad(20.1, 23.2, ['D2', 'A2', 'D3'], .18, att=.8, bright=600)
for t_, nm in ((20.9, 'A4'), (21.7, 'Eb5'), (22.3, 'D5')): pno(t_, nm, 2.0, .24, .5, pan=-.3 + .2 * (t_ % 2))
bell(21.2, 'D6', .1, d=4.0, pan=.3)

# ================================================================== 22.9 - 26.5  attack by night: a timpani roll, brass stabs, a trembling pad, then release
B['timp'].add(S.timpani(FQ('D1'), 3.0, .9), 22.9, .5); B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 22.9, .42)
trem_pad(22.9, 25.4, ['D2', 'A2', 'D3', 'F3', 'B3'], .34, 8.5)
for k_ in range(12): B['timp'].add(S.timpani(FQ('D1'), .8, .5 + .03 * k_), 23.1 + .2 * k_, .12 + .016 * k_)
for m in ('D3', 'F3', 'A3', 'D4'): B['brass'].add(horn(M(m), 1.2, att=.15, rel=.8, peak=2200), 23.6, .3, pan=.1)
for m in ('D3', 'F3', 'A3', 'D4'): B['brass'].add(horn(M(m), 1.2, att=.15, rel=.8, peak=2200), 24.5, .34, pan=.1)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'D6')): B['harp'].add(pluck(M(nm)), 24.9 + .12 * k_, .22, pan=-.3 + .2 * k_)
pad(24.9, 27.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.7, bright=1500)

# ================================================================== 26.5 - 30.0  d0: Lot, his possessions, the women and people brought back: a warm release (F), horns, rising harp
B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 26.6, .3)
pad(26.5, 29.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.8, bright=1900); pad(29.0, 31.0, ['C2', 'G2', 'C3', 'E3', 'G3'], .32, att=.8, bright=2000)
choir(26.8, 31.0, ['A3', 'C4', 'F4', 'A4'], .32, 'ah', att=1.0)
for m in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m), 3.4, att=.8, rel=1.4, peak=1800), 27.0, .24, pan=.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 27.2 + .4 * k_, .24, pan=-.5 + .15 * k_)
for t_, nm, d_ in ((27.6, 'C5', 1.4), (29.0, 'F5', 1.6)): solo(t_, nm, d_, .26, att=.4, bright=1900)
bell(27.4, 'F6', .2, d=4.4); bell(29.2, 'C6', .16, d=4.0, pan=.3)

# ================================================================== 30.0 - 32.95  d1: the king of Sodom comes out to meet him: dignified, a low horn and a soft pad
pad(30.0, 33.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=.9, bright=1300)
B['brass'].add(horn(M('Bb2'), 3.2, att=.9, rel=1.6, peak=1300), 30.2, .22, pan=-.1)
for t_, nm, d_ in ((30.6, 'D5', 1.3), (32.0, 'F5', 1.4)): solo(t_, nm, d_, .24, att=.5, bright=1500); pno(t_, nm, d_ + .8, .3, .56)
bell(31.0, 'D6', .14, d=4.2)

# ================================================================== 32.95 - 39.25  d2: Melchizedek king of Salem brings bread and wine: serene (Bb - F), choir, bells, a slow harp
pad(32.95, 36.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.2, bright=1200); pad(36.0, 39.5, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1500)
choir(33.4, 39.4, ['A3', 'C4', 'F4', 'A4'], .3, 'oo', att=1.5)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4')): B['harp'].add(pluck(M(nm)), 34.0 + .6 * k_, .22, pan=-.3 + .12 * k_)
for t_, nm, d_ in ((33.8, 'C5', 1.6), (35.4, 'D5', 1.6), (37.0, 'F5', 1.8)): solo(t_, nm, d_, .26, att=.5, bright=1700)
bell(34.4, 'F6', .2, d=4.8); bell(37.6, 'C6', .2, d=4.6, pan=.3)

# ================================================================== 39.25 - 44.5  d3: he blesses Abram: "blessed be Abram by God Most High": a warm swell, choir, horns, bell
B['timp'].add(S.timpani(FQ('F1'), 2.8, .6), 39.4, .28); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 39.4, .3)
pad(39.3, 42.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.8, bright=1700); pad(42.0, 44.8, ['C2', 'G2', 'C3', 'E3', 'G3'], .34, att=.8, bright=2000)
choir(39.6, 44.6, ['A3', 'C4', 'F4', 'A4', 'C5'], .38, 'ah', att=.9)
for m in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m), 3.8, att=.9, rel=1.5, peak=1900), 40.0, .22, pan=.1)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 41.0 + .34 * k_, .22, pan=-.4 + .25 * k_)
bell(39.6, 'F6', .26, d=5.0); bell(41.8, 'C6', .2, d=4.4, pan=.3); bell(43.2, 'A6', .16, d=4.0, pan=-.3)

# ================================================================== 44.5 - 47.6  e1: Abram gave him a tenth of everything: a gentle rolling figure and piano
pad(44.5, 48.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.8, bright=1700); arp(44.6, 47.8, 34, 4, .08, .5)
for t_, nm, d_ in ((45.0, 'D5', 1.2), (46.0, 'F5', 1.2), (47.0, 'A5', 1.4)): solo(t_, nm, d_, .24, att=.4, bright=1800)
bell(45.4, 'D6', .16, d=4.0)

# ================================================================== 47.6 - 51.9  e2: the king of Sodom: "give me the persons, take the goods for yourself": a suspended, unresolved chord
pad(47.6, 52.0, ['G2', 'D3', 'G3', 'C4', 'D4'], .26, att=1.0, bright=1100)
trem_pad(48.2, 52.0, ['A2', 'E3', 'B3'], .16, 5.5)
for t_, nm in ((48.2, 'E5'), (49.6, 'D5'), (50.8, 'B4')): pno(t_, nm, 2.2, .26, .55, pan=-.3 + .2 * (t_ % 2))
solo(49.0, 'A4', 2.6, .22, att=.7, bright=1300); B['timp'].add(S.timpani(FQ('G1'), 2.4, .5), 48.0, .16)

# ================================================================== 51.9 - 56.1  e3: Abram refuses: "not a thread or a sandal strap": firm and plain, a low horn and timpani, then warmth
B['timp'].add(S.timpani(FQ('D1'), 2.8, .9), 51.9, .4); B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 51.9, .36)
pad(51.9, 54.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.7, bright=1200); pad(54.2, 57.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.8, bright=1700)
B['brass'].add(horn(M('D3'), 3.4, att=.6, rel=1.4, peak=1500), 52.0, .28, pan=-.1)
choir(52.4, 56.8, ['D4', 'F4', 'A4'], .3, 'oo', att=1.0)
for t_, nm, d_ in ((52.6, 'A4', 1.3), (53.8, 'F4', 1.3), (55.0, 'C5', 1.6)): solo(t_, nm, d_, .26, att=.4, bright=1500); pno(t_, nm, d_ + .8, .3, .6)
bell(54.6, 'F6', .18, d=4.4)

# ================================================================== 56.1 - 60.4  e4: "so that you will not say, I made Abram rich": the glory goes to God: a warm swell resolving to F, bells
pad(56.0, 58.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.8, bright=1900); pad(58.6, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.9, bright=1700)
choir(56.4, 60.8, ['A3', 'C4', 'F4', 'A4'], .34, 'ah', att=1.0)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5')): B['harp'].add(pluck(M(nm)), 56.8 + .4 * k_, .26, pan=-.3 + .2 * k_)
for t_, nm, d_ in ((56.6, 'C5', 1.4), (58.0, 'D5', 1.5), (59.2, 'F5', 2.0)): solo(t_, nm, d_, .28, att=.4, bright=1900)
B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 56.2, .26); bell(57.2, 'F6', .24, d=4.8); bell(58.8, 'C6', .18, d=4.4, pan=.3)

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
    sf.write(f'/home/claude/music/out14/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out14/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)


