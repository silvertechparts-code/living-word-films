"""Episode 15 (Genesis 15, stars and a promise) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): the four kings' war (dark drone, timpani, horn) -> Lot carried off (a lament) -> the survivor (hush) -> the 318 muster and the chase (a rising march)
     -> the night (hush) -> the attack (timpani roll, brass, trem) -> Lot brought back (warm release) -> the king of Sodom comes out -> Melchizedek, bread and wine (serene choir, bells)
     -> the blessing and the tenth (warm swell) -> the king's offer and Abram's refusal (suspended, then firm) -> "I made Abram rich" (glory to God, resolving to F) -> the reflection (same harmony family as the other episodes) -> the question: a warm sustained chord.
Outputs: out15/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out15', exist_ok=True)
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

# ================================================================== 0 - 6.3  a1: in a vision the Lord says "do not be afraid, I am your shield": a warm hush, a low drone, a soft choir, a bell
drone(0, 6.4, FQ('D1'), .3, att=1.2, rel=1.4)
pad(0.2, 3.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.4, bright=900); pad(3.3, 6.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1500)
choir(1.2, 6.4, ['D4', 'F4', 'A4'], .24, 'oo', att=1.2)
bell(1.0, 'D6', .16, d=4.6); bell(3.4, 'F6', .18, d=4.4, pan=.3)
for t_, nm, d_ in ((2.0, 'A4', 1.5), (3.6, 'C5', 1.6)): solo(t_, nm, d_, .24, att=.5, bright=1300)

# ================================================================== 6.3 - 11.4  b1: "I have no child; my heir is a servant of my house": a lament, slow and low
pad(6.3, 11.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=900)
choir(6.6, 11.4, ['D4', 'F4', 'A4'], .24, 'ah', att=1.2)
for t_, nm, d_ in ((6.8, 'A4', 1.4), (8.1, 'G4', 1.4), (9.4, 'F4', 1.5), (10.4, 'D4', 1.4)): solo(t_, nm, d_, .26, att=.5, bright=1200); pno(t_, nm, d_ + .8, .28, .55)
pno(6.6, 'D3', 3.6, .32, .55); bell(8.2, 'D6', .1, d=4.2, pan=-.2)

# ================================================================== 11.4 - 15.3  b2: "your own son will be your heir": a warm answer, rising harp
pad(11.4, 15.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.8, bright=1700)
choir(11.7, 15.5, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.0)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.2, att=.8, rel=1.4, peak=1700), 12.0, .2, pan=.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 12.3 + .4 * k_, .22, pan=-.4 + .2 * k_)
for t_, nm, d_ in ((12.4, 'C5', 1.3), (13.8, 'F5', 1.5)): solo(t_, nm, d_, .26, att=.4, bright=1800)
bell(12.0, 'F6', .2, d=4.4); B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 11.5, .2)

# ================================================================== 15.3 - 22.3  c1: "count the stars, if you can": wonder, a rising shimmer of harp and bells as the stars come out
pad(15.3, 19.0, ['C2', 'G2', 'C3', 'E3', 'G3'], .28, att=1.2, bright=1500); pad(19.0, 22.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.0, bright=2300)
choir(16.0, 22.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .3, 'ah', att=1.4)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'A6', 'C7')): B['harp'].add(pluck(M(nm)), 17.4 + .55 * k_, .2, pan=-.5 + .16 * k_)
for t_, nm, g_ in ((17.8, 'F6', .16), (19.0, 'C6', .18), (20.2, 'A6', .18), (21.2, 'F6', .2)): bell(t_, nm, g_, d=4.4, pan=-.3 + .2 * (t_ % 3))
for t_, nm, d_ in ((15.7, 'A4', 1.4), (17.0, 'C5', 1.4), (18.4, 'F5', 1.6), (20.0, 'A5', 1.6)): solo(t_, nm, d_, .24, att=.5, bright=1700); pno(t_, nm, d_ + .8, .26, .56)
B['sub'].add(S.sub_boom(FQ('C1'), 3.0), 15.4, .2)

# ================================================================== 22.3 - 27.6  c3: "Abram believed the Lord, and it was counted to him as righteousness": peace, a resolved F chord, bells
pad(22.2, 25.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.8, bright=2000); pad(25.0, 27.9, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1700)
choir(22.4, 27.6, ['A3', 'C4', 'F4', 'A4', 'C5'], .36, 'ah', att=.9)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 3.6, att=.8, rel=1.4, peak=1800), 22.5, .22, pan=.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 23.0 + .5 * k_, .2, pan=-.4 + .18 * k_)
for t_, nm, d_ in ((23.0, 'C5', 1.4), (24.4, 'F5', 1.5), (25.8, 'A5', 1.7)): solo(t_, nm, d_, .26, att=.4, bright=1900)
bell(22.6, 'F6', .26, d=4.6); bell(24.2, 'C6', .2, d=4.4, pan=.3); bell(26.0, 'A6', .16, d=4.0, pan=-.3)

# ================================================================== 27.6 - 32.2  d1: "how will I know that I will possess this land?": a question, suspended and unresolved
pad(27.6, 32.4, ['G2', 'D3', 'G3', 'C4', 'D4'], .26, att=1.0, bright=1100); trem_pad(28.0, 32.4, ['A2', 'E3', 'B3'], .14, 5.0)
for t_, nm in ((28.4, 'E5'), (29.6, 'D5'), (30.8, 'B4')): pno(t_, nm, 2.2, .26, .55, pan=-.3 + .2 * (t_ % 2))
solo(29.0, 'A4', 2.6, .22, att=.7, bright=1300)

# ================================================================== 32.2 - 37.2  d2: the animals brought and cut in two: solemn, earthy, soft timpani
drone(32.0, 37.6, FQ('D1'), .3, att=1.0, rel=1.4); pad(32.2, 37.4, ['D2', 'A2', 'D3', 'F3'], .22, att=1.0, bright=700)
for t_ in (32.6, 33.8, 35.0, 36.2): B['timp'].add(S.timpani(FQ('D1'), 1.2, .6), t_, .14)
B['timp'].add(S.timpani(FQ('D1'), 2.0, .8), 34.2, .3); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 34.2, .26)
B['brass'].add(horn(M('D3'), 3.2, att=.9, rel=1.4, peak=1200), 33.0, .2, pan=-.1)
for t_, nm in ((33.4, 'A3'), (34.6, 'F3'), (35.8, 'D4')): pno(t_, nm, 2.4, .26, .55, pan=-.2 + .2 * (t_ % 2))
solo(35.0, 'D4', 2.0, .2, att=.6, bright=1100)

# ================================================================== 37.2 - 43.4  d3: sunset, a deep sleep, a great darkness: a low drone, trembling strings, a slow heartbeat, one distant bell
drone(37.0, 43.8, FQ('D1'), .42, att=1.0, rel=1.4); B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 37.3, .3)
trem_pad(37.4, 43.8, ['D2', 'A2', 'D3', 'F3', 'B3'], .3, 4.0)
for k_, t_ in enumerate(np.arange(38.6, 43.2, 1.2)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), t_, .1 + .02 * k_)
B['brass'].add(horn(M('Bb2'), 3.4, att=1.2, rel=1.6, peak=1200), 39.2, .22, pan=-.1)
choir(40.0, 43.6, ['D3', 'F3', 'A3'], .2, 'oo', att=1.2)
solo(40.6, 'A3', 2.4, .18, att=.8, bright=900); bell(41.0, 'D6', .1, d=4.8, pan=.3)

# ================================================================== 43.4 - 50.0  e1: "strangers for four hundred years, then out with great wealth": patient and bleak, then a first glimmer
pad(43.4, 47.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=1.0, bright=1000); pad(47.4, 50.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700)
for t_ in (43.8, 45.4, 47.0): B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), t_, .12)
for t_, nm, d_ in ((44.2, 'A4', 1.5), (45.8, 'G4', 1.5), (47.0, 'F4', 1.5)): solo(t_, nm, d_, .24, att=.6, bright=1100); pno(t_, nm, d_ + .8, .26, .55)
choir(47.6, 50.2, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 47.8 + .35 * k_, .2, pan=-.3 + .2 * k_)
bell(48.0, 'F6', .2, d=4.4)

# ================================================================== 50.0 - 55.8  e2: a smoking fire pot and a flaming torch pass between the pieces: awe, a choir building, a timpani swell
pad(49.9, 53.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1300); pad(53.2, 56.0, ['C2', 'G2', 'C3', 'E3', 'G3'], .34, att=.8, bright=2200)
choir(51.0, 55.8, ['D4', 'F4', 'A4'], .32, 'oo', att=1.2)
for m_ in ('D3', 'A3'): B['brass'].add(horn(M(m_), 3.8, att=.9, rel=1.4, peak=1500), 51.0, .24, pan=.1)
for k_, t_ in enumerate(np.arange(52.8, 55.8, .25)): B['timp'].add(S.timpani(FQ('D1'), .8, .5 + .02 * k_), t_, .06 + .014 * k_)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'D6', 'F6')): B['harp'].add(pluck(M(nm)), 52.0 + .38 * k_, .2, pan=-.3 + .15 * k_)
bell(51.4, 'F6', .2, d=4.6); bell(52.8, 'C6', .2, d=4.4, pan=.3); bell(54.2, 'A6', .18, d=4.2, pan=-.3)

# ================================================================== 55.8 - 61  e3: "the Lord made a covenant with Abram": the peak, a glory swell in F, then a lead into the reflection
B['timp'].add(S.timpani(FQ('F1'), 3.0, .9), 55.8, .5); B['sub'].add(S.sub_boom(FQ('F1'), 3.6), 55.8, .42)
pad(55.8, 58.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.7, bright=2300); pad(58.6, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1700)
choir(56.0, 60.8, ['A3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=.8)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.8, att=.8, rel=1.5, peak=1900), 56.2, .26, pan=.1)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 56.4 + .34 * k_, .22, pan=-.4 + .25 * k_)
for t_, nm, d_ in ((56.4, 'C5', 1.4), (57.8, 'F5', 1.5), (59.2, 'A5', 1.8)): solo(t_, nm, d_, .28, att=.4, bright=1900)
bell(56.0, 'F6', .28, d=5.0); bell(57.8, 'C6', .22, d=4.6, pan=.3); bell(59.4, 'A6', .18, d=4.2, pan=-.3)

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
    sf.write(f'/home/claude/music/out15/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out15/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)


