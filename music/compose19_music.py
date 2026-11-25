"""Episode 19 (Genesis 19, Lot and the Fall of Sodom) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D; the darker colours use written Fm / Bbm / Db): dusk at Sodom, the two visitors arrive (low, watchful) -> the men surround the house at night (a torch-lit heartbeat, a tritone)
     -> the angels pull Lot in, the door-flash, the men are struck blind (a hit, then a held hush) -> "take your family and go" (urgent lamplight) -> the sons-in-law think it a joke (light, uneasy)
     -> Lot hesitates, the angels take their hands and lead them out (a rising mercy swell) -> "flee, do not look back" (a running pulse) -> sunrise at Zoar (warm resolution)
     -> fire and sulfur (the peak) -> Lot's wife looks back: a silence, a pillar of salt -> Abraham sees the smoke at dawn (a lonely line) -> "God remembered Abraham" (warmth, a held F-major chord)
     -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out19/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out19', exist_ok=True)
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

# ================================================================== 0 - 6.2  a1: dusk at Sodom; two visitors come to the gate: low and watchful, a drone, a thin choir, sparse bells
drone(0, 6.6, FQ('F1'), .3, att=1.4, rel=1.6)
pad(0.2, 3.4, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .22, att=1.5, bright=900); pad(3.4, 6.6, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .22, att=1.0, bright=1000)
choir(1.0, 4.2, ['C4', 'F4', 'Ab4'], .18, 'oo', att=1.4); choir(3.8, 6.4, ['Db4', 'F4', 'Ab4'], .2, 'oo', att=1.0)
bell(0.9, 'C6', .12, d=4.6); bell(3.4, 'F6', .16, d=4.4, pan=.3)
solo(1.8, 'Ab4', 1.8, .2, att=.5, bright=1100); solo(4.2, 'C5', 1.8, .2, att=.5, bright=1200)
pno(3.2, 'F4', 2.6, .2, .5)

# ================================================================== 6.2 - 11.2  b1: night; the men of the city come with torches and surround the house: a heartbeat, a tritone, a low tremolo
drone(6.2, 11.6, FQ('F1'), .36, att=.8, rel=1.6)
t_ = 6.4; k_ = 0
while t_ < 11.2:
    B['timp'].add(S.timpani(FQ('F1'), 1.0, .55 + .03 * k_), t_, .08 + .012 * k_); t_ += .8 - .02 * k_; k_ += 1
trem_pad(6.3, 11.4, ['F2', 'B2', 'F3'], .2, 7.0)
pad(6.4, 11.4, ['F2', 'C3', 'F3', 'Ab3'], .16, att=1.0, bright=800)
choir(7.2, 11.2, ['F3', 'B3', 'F4'], .18, 'oo', att=1.4)
solo(7.4, 'B4', 1.6, .2, att=.5, bright=1000); solo(9.2, 'F4', 1.8, .2, att=.5, bright=1000)
B['sub'].add(S.sub_boom(FQ('F1'), 2.6), 6.3, .22); bell(8.4, 'F6', .1, d=4.2)

# ================================================================== 11.2 - 15.9  b2: the angels pull Lot in; the door-flash at ~12.0 and the men struck blind: a rise, one hit, then a held hush
pad(11.2, 12.1, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .3, att=.8, bright=2200)
B['timp'].add(S.timpani(FQ('F1'), 2.8, .95), 12.0, .5); B['sub'].add(S.sub_boom(FQ('F1'), 3.2), 12.0, .42)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 2.6, att=.15, rel=1.2, peak=2400), 12.0, .26, pan=.05)
for k_, nm in enumerate(('C6', 'F6', 'Ab6', 'C7')): bell(12.0 + .12 * k_, nm, .26, d=4.2, pan=-.3 + .2 * k_)
pad(12.1, 15.9, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=1.2, bright=1500)
choir(12.4, 15.9, ['A3', 'C4', 'F4'], .2, 'oo', att=1.2)
solo(13.0, 'C5', 1.8, .2, att=.5, bright=1300); solo(14.6, 'A4', 1.6, .2, att=.5, bright=1200); bell(13.6, 'A6', .12, d=4.2)

# ================================================================== 15.9 - 22.0  c1: "take your family and go": urgent lamplight, a minor rolling figure and a rising line
drone(15.9, 22.2, FQ('Db1'), .28, att=1.0, rel=1.4)
pad(15.9, 19.0, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .26, att=.9, bright=1400); pad(19.0, 22.2, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .26, att=.9, bright=1500)
arp(16.0, 21.8, 41, 3, .1, .5)
choir(16.4, 21.8, ['C4', 'F4', 'Ab4'], .22, 'ah', att=1.0)
for t_, nm, d_ in ((16.6, 'C5', 1.2), (18.0, 'F5', 1.3), (19.6, 'Ab5', 1.3), (20.8, 'C6', 1.4)): solo(t_, nm, d_, .22, att=.4, bright=1500); pno(t_, nm, d_ + .8, .2, .55)
bell(16.2, 'F6', .14, d=4.2); bell(19.2, 'C6', .14, d=4.2, pan=.3)

# ================================================================== 22.0 - 25.0  c2: the sons-in-law think it a joke: light, a little uneasy
pad(22.0, 25.2, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .16, att=.8, bright=1300)
for k_, (t_, nm) in enumerate(((22.3, 'F5'), (22.7, 'Ab5'), (23.1, 'C6'), (23.5, 'Ab5'), (23.9, 'F5'), (24.3, 'Db5'))): pno(t_, nm, 1.4, .22, .52, pan=-.3 + .1 * k_)
bell(22.6, 'Db6', .1, d=3.8)

# ================================================================== 25.0 - 33.0  c3: Lot lingers (a slow pulse), then the angels take their hands and lead them out: a rising mercy swell
drone(25.0, 28.4, FQ('F1'), .3, att=.8, rel=1.2)
pad(25.0, 27.4, ['F2', 'C3', 'F3', 'Ab3'], .22, att=.8, bright=1000)
for k_, t_ in enumerate((25.3, 26.2, 27.1)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .07 + .012 * k_)
solo(25.6, 'Ab4', 1.6, .2, att=.5, bright=1100)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .7), 27.2, .24)
pad(27.2, 30.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.7, bright=1700); pad(30.2, 33.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1900)
choir(27.4, 33.2, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=.9)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 27.6 + .32 * k_, .2, pan=-.4 + .18 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.9, rel=1.4, peak=1600), 29.0, .16, pan=.1)
for t_, nm, d_ in ((28.6, 'C5', 1.3), (30.0, 'F5', 1.4), (31.4, 'A5', 1.6)): solo(t_, nm, d_, .24, att=.4, bright=1700); pno(t_, nm, d_ + .8, .22, .55)
bell(27.5, 'F6', .2, d=4.4); bell(29.4, 'C6', .16, d=4.2, pan=.3); bell(31.0, 'A6', .15, d=4.2, pan=-.3)

# ================================================================== 33.0 - 36.8  d1: "flee for your life, do not look back": a running pulse
t_ = 33.0; k_ = 0
while t_ < 36.9:
    B['timp'].add(S.timpani(FQ('F1'), .6, .6), t_, .08 + .004 * k_); t_ += BEAT / 2; k_ += 1
trem_pad(33.0, 37.0, ['F2', 'C3', 'F3', 'Ab3'], .2, 8.5)
pad(33.0, 37.0, ['Db2', 'Ab2', 'Db3', 'F3'], .16, att=.6, bright=1500)
choir(33.4, 36.8, ['C4', 'F4', 'Ab4'], .18, 'ah', att=.7)
for t_, nm in ((33.4, 'C5'), (34.0, 'F5'), (34.6, 'Ab5'), (35.2, 'C6'), (35.8, 'Ab5'), (36.4, 'F5')): solo(t_, nm, .7, .22, att=.15, bright=1700)
bell(33.0, 'F6', .14, d=3.8)

# ================================================================== 36.8 - 41.5  d2: sunrise, the family reaches Zoar: the pulse stops and a warm major chord opens
B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 36.9, .16)
pad(36.8, 39.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1900); pad(39.6, 42.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.9, bright=1900)
choir(37.2, 41.4, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.0)
for t_, nm, d_ in ((37.4, 'C5', 1.4), (38.8, 'F5', 1.4), (40.2, 'A5', 1.6)): solo(t_, nm, d_, .24, att=.4, bright=1800); pno(t_, nm, d_ + .8, .22, .55)
bell(37.0, 'F6', .2, d=4.6); bell(39.0, 'C6', .16, d=4.4, pan=.3); bell(40.4, 'A6', .15, d=4.2, pan=-.3)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 38.2 + .3 * k_, .16, pan=-.3 + .2 * k_)

# ================================================================== 41.2 - 46.2  e1: fire and sulfur from the Lord out of heaven: the peak
B['timp'].add(S.timpani(FQ('F1'), 3.2, 1.0), 41.2, .62); B['sub'].add(S.sub_boom(FQ('Db1'), 4.0), 41.2, .5)
drone(41.2, 47.0, FQ('Db1'), .4, att=.4, rel=1.6)
pad(41.2, 44.0, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .44, att=.35, bright=2800); pad(44.0, 47.0, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .42, att=.5, bright=2600)
choir(41.4, 46.8, ['F3', 'C4', 'F4', 'Ab4', 'C5'], .46, 'ah', att=.5)
for m_ in ('F3', 'C4', 'Ab4'): B['brass'].add(horn(M(m_), 4.2, att=.3, rel=1.4, peak=2500), 41.3, .3, pan=.05)
t_ = 41.6; k_ = 0
while t_ < 46.0:
    B['timp'].add(S.timpani(FQ('F1'), .9, .7), t_, .16 + .006 * k_); t_ += .55; k_ += 1
for k_, (t_, nm) in enumerate(((42.0, 'C6'), (42.6, 'Ab5'), (43.2, 'F5'), (43.8, 'C5'), (44.4, 'Ab4'), (45.0, 'F4'))): pno(t_, nm, 2.2, .3, .75, pan=.3 - .1 * k_)
for t_, nm in ((41.5, 'F6'), (43.0, 'C7'), (44.8, 'Ab6')): bell(t_, nm, .26, d=4.6)

# ================================================================== 46.2 - 50.4  e2: his wife looks back (a silence, one bell), and becomes a pillar of salt (a low rumble and a held chord)
pad(46.2, 47.4, ['Db2', 'Ab2', 'Db3'], .1, att=.6, bright=700, rel=.8)
bell(47.5, 'C7', .22, d=4.8); bell(47.52, 'F6', .16, d=4.8, pan=.3)
B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 47.7, .5); B['timp'].add(S.timpani(FQ('F1'), 2.6, .9), 47.7, .34)
pad(47.8, 50.8, ['F2', 'C3', 'F3', 'Ab3'], .3, att=.6, bright=900)
choir(48.0, 50.6, ['F3', 'Ab3', 'C4'], .26, 'oo', att=.8)
solo(48.4, 'Ab4', 2.0, .2, att=.6, bright=1000)

# ================================================================== 50.4 - 54.6  e3a: Abraham rises early and looks toward the plain: a lonely line, smoke like a furnace
drone(50.4, 54.8, FQ('F1'), .26, att=1.2, rel=1.4)
pad(50.5, 54.7, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .2, att=1.2, bright=900)
choir(51.0, 54.6, ['Db4', 'F4', 'Ab4'], .16, 'oo', att=1.3)
for t_, nm, d_ in ((51.0, 'Ab4', 1.8), (52.6, 'F4', 1.8), (53.8, 'Db5', 1.8)): solo(t_, nm, d_, .22, att=.6, bright=1100); pno(t_, nm, d_ + .8, .18, .5)
bell(51.6, 'Db6', .1, d=4.4)

# ================================================================== 54.6 - 60.4  e3b: "God remembered Abraham, and sent Lot out of the midst of the overthrow": warmth, a held F-major chord into the morning
B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 54.6, .16)
pad(54.6, 57.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1600); pad(57.4, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=1.2, bright=1500)
choir(55.0, 60.4, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.1)
B['brass'].add(horn(M('F3'), 3.8, att=1.2, rel=1.6, peak=1300), 56.0, .16, pan=.1)
for t_, nm, d_ in ((55.2, 'C5', 1.4), (56.8, 'F5', 1.5), (58.4, 'A5', 1.8)): solo(t_, nm, d_, .22, att=.5, bright=1600); pno(t_, nm, d_ + .8, .2, .52)
bell(55.0, 'F6', .18, d=4.6); bell(57.0, 'C6', .16, d=4.4, pan=.3); bell(59.0, 'A6', .14, d=4.2, pan=-.3)

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
    sf.write(f'/home/claude/music/out19/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out19/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
