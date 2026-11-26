"""Episode 25 (Genesis 25, One Bowl of Stew) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): Abraham is buried beside Sarah (a1) -> Isaac prays and the Lord answers (a2) -> the twins struggle and the Lord speaks (b1) -> the births, a bell for each name (b2) -> hunter and quiet man (c1) -> the weary hunter and the stew (d1) -> the bargain gathers (d2) -> the oath, then a bare chord that sinks (e1) -> the reflection (same harmonic progression as Ep23/24) -> the question chord. [older note follows:] Abraham sends his servant (a1: a hush at dusk) -> ten camels to the well (b1: a slow pulse of travel) -> the prayer (b2: sparse, reverent) -> Rebekah comes with her jar (c1: a warm lift, rippling harp) -> he bows (c2: tender) ->
     'I will' (d1: morning warmth) -> Isaac in the field (e1: a lone string) -> Sarah's tent (e2: the warm peak, then it eases) -> the reflection (same harmonic progression as Ep23) -> the question chord.
Outputs: out25/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out25', exist_ok=True)
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


# ================================================================== 0 - 6.6  a1: Abraham died at a good old age; Isaac and Ishmael buried him beside Sarah (25:7-10): a low drone, a hush, one lone string, a bell
drone(0, 7.4, FQ('F1'), .24, att=1.2, rel=1.8)
pad(0.2, 3.6, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .2, att=1.6, bright=700); pad(3.6, 7.4, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.4, bright=800)
choir(1.6, 7.0, ['Ab3', 'C4', 'F4'], .12, 'oo', att=1.8)
solo(1.4, 'C5', 2.6, .2, att=.9, bright=800); solo(4.4, 'Ab4', 2.4, .18, att=.9, bright=800)
bell(2.2, 'F5', .1, d=5.0); bell(5.0, 'C6', .08, d=4.8, pan=.3)

# ================================================================== 6.6 - 12.6  a2: Isaac prayed for his wife, who had no child, and the Lord answered (25:21): sparse and reverent; a turn toward the major as the answer comes
pad(6.6, 10.4, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .2, att=1.4, bright=900); pad(10.4, 13.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500)
choir(7.4, 12.6, ['A3', 'C4', 'F4'], .18, 'oo', att=1.6)
for t_, nm, d_ in ((7.8, 'C5', 2.0), (9.6, 'Ab4', 2.0)): solo(t_, nm, d_, .2, att=.7, bright=1000); pno(t_, nm, d_ + .8, .14, .45)
solo(10.9, 'A4', 2.2, .22, att=.5, bright=1500); bell(10.8, 'F6', .16, d=4.8); bell(11.8, 'A6', .1, d=4.4, pan=.3)

# ================================================================== 12.6 - 21.4  b1: the children struggled in her womb; the Lord told her two nations are in her (25:22-23): a restless low pulse, then a held, reverent chord for the word of the Lord
pad(12.6, 16.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .2, att=1.0, bright=1000)
[B['str'].add(trem(strings_note(M(m), 4.0, att=.8, rel=1.2, bright=1000), 7.5, .7, k), 12.8, .2, pan=-.3 + .15 * k) for k, m in enumerate(['D3', 'F3', 'A3'])]
for k_ in range(9): B['timp'].add(S.timpani(FQ('F1'), .9, .5), 13.0 + .62 * k_, .05 + .004 * k_)
pad(16.2, 21.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.2, bright=1200)
choir(16.4, 21.4, ['Bb3', 'D4', 'F4', 'Bb4'], .26, 'oo', att=1.2)
for t_, nm, d_ in ((17.0, 'F5', 2.0), (19.0, 'D5', 2.0)): solo(t_, nm, d_, .18, att=.6, bright=1200); pno(t_, nm, d_ + .8, .14, .45)
bell(16.8, 'D6', .12, d=4.8); bell(19.8, 'F6', .1, d=4.4, pan=.3)

# ================================================================== 21.5 - 27.4  b2: the first came out red, all his body like a hairy mantle, Esau; then his brother, holding his heel, Jacob (25:24-26): a soft lift and a rippling harp; a bell for each name
pad(21.5, 24.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=.9, bright=1500); pad(24.8, 27.9, ['Bb2', 'F3', 'Bb3', 'D4'], .22, att=.8, bright=1500)
choir(22.0, 27.4, ['A3', 'C4', 'F4', 'A4'], .2, 'ah', att=1.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 22.0 + .32 * k_, .13, pan=-.3 + .1 * k_)
for k_, nm in enumerate(('D5', 'F5', 'Bb5', 'D6', 'Bb5')): B['harp'].add(pluck(M(nm)), 24.3 + .34 * k_, .12, pan=.3 - .1 * k_)
solo(22.6, 'C5', 1.8, .2, att=.5, bright=1400); solo(24.6, 'D5', 2.0, .2, att=.5, bright=1500)
bell(22.7, 'F6', .16, d=4.4); bell(24.4, 'D6', .16, d=4.4, pan=.3)

# ================================================================== 27.5 - 35.5  c1: Esau a hunter, a man of the field; Jacob a quiet man living in tents; Isaac loved Esau and Rebekah loved Jacob (25:27-28): an open field, a low horn for the hunter, a gentle string for the quiet one
pad(27.5, 31.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.0, bright=1500); pad(31.4, 35.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .22, att=1.0, bright=1300)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 2.6, att=.7, rel=1.0, peak=1500), 27.8, .14, pan=.2)
for k_, t_ in enumerate((28.6, 29.5, 30.4)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .045 + .006 * k_)
solo(31.0, 'A4', 2.0, .2, att=.6, bright=1300); solo(33.0, 'C5', 2.2, .2, att=.6, bright=1300); pno(31.0, 'A4', 2.8, .14, .5); pno(33.0, 'C5', 3.0, .14, .5)
choir(31.2, 35.4, ['A3', 'C4', 'F4'], .16, 'oo', att=1.4)
bell(29.0, 'C6', .1, d=4.4); bell(33.6, 'F6', .1, d=4.2, pan=.3)

# ================================================================== 35.5 - 43.0  d1: Esau came in from the field, famished, and asked for some of the red stew (25:29-30): a weary low line, a warm, slow pulse
pad(35.5, 39.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .24, att=1.0, bright=1100); pad(39.2, 43.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=.9, bright=1200)
choir(36.2, 42.8, ['Bb3', 'D4', 'F4'], .16, 'oo', att=1.4)
for k_, t_ in enumerate((36.4, 37.6, 38.8, 40.0, 41.2)): B['timp'].add(S.timpani(FQ('F1'), 1.1, .5), t_, .05 + .005 * k_)
for t_, nm, d_ in ((36.8, 'D5', 1.8), (38.6, 'A4', 1.8), (40.4, 'F4', 2.0)): solo(t_, nm, d_, .18, att=.6, bright=1100); pno(t_, nm, d_ + .8, .14, .45)
bell(37.2, 'D6', .1, d=4.4); bell(41.0, 'A5', .1, d=4.2, pan=.3)

# ================================================================== 43.0 - 49.9  d2: Jacob: first sell me your birthright; Esau: I am about to die, what use is it to me? (25:31-32): tension gathers, tremolo strings, a rising line
pad(43.0, 46.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=.8, bright=1100); pad(46.4, 50.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1500)
for g_, (a_, b_, ns_) in enumerate(((43.0, 46.4, ['D3', 'F3', 'A3']), (46.4, 50.4, ['Bb2', 'D3', 'F3']))): [B['str'].add(trem(strings_note(M(m), b_ - a_ + .3, att=.8, rel=1.0, bright=1500), 7.0, .65, k), a_, .22 + .04 * g_, pan=-.3 + .15 * k) for k, m in enumerate(ns_)]
for k_, t_ in enumerate((43.2, 44.3, 45.4, 46.5, 47.2, 47.9, 48.6, 49.3)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .008 * k_)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'D6')): B['harp'].add(pluck(M(nm)), 46.4 + .3 * k_, .11, pan=-.3 + .2 * k_)
solo(44.0, 'F5', 2.0, .2, att=.5, bright=1500); solo(47.2, 'A5', 2.4, .24, att=.4, bright=1700)
choir(46.8, 50.4, ['Bb3', 'D4', 'F4', 'Bb4'], .26, 'oo', att=1.0)
bell(47.4, 'D6', .14, d=4.4)

# ================================================================== 49.9 - 60.8  e1: he swore and sold his birthright; Jacob gave him bread and lentil stew; he ate and drank, rose and went his way; Esau despised his birthright (25:33-34): the weight of the oath, then a bare chord that sinks and thins
B['timp'].add(S.timpani(FQ('F1'), 2.6, .7), 50.2, .2); B['sub'].add(S.sub_boom(FQ('F1'), 2.4), 50.2, .22)
pad(50.0, 53.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'Bb3'], .36, att=.6, bright=2000); pad(53.4, 57.0, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .3, att=.9, bright=1400)
choir(50.4, 56.2, ['F3', 'Bb3', 'D4', 'F4'], .34, 'ah', att=.8)
for m_ in ('Bb2', 'F3', 'D4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1500), 50.6, .16, pan=.05)
for t_, nm, d_ in ((51.4, 'F5', 1.4), (53.0, 'D5', 1.6), (54.6, 'C5', 1.8)): solo(t_, nm, d_, .2, att=.5, bright=1400); pno(t_, nm, d_ + .8, .16, .5)
bell(51.0, 'F6', .16, d=4.4); bell(53.8, 'D6', .14, d=4.4, pan=.3); bell(56.4, 'Ab5', .16, d=5.0)
pad(57.0, 61.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.2, bright=1200)
choir(57.2, 60.8, ['A3', 'C4', 'F4'], .2, 'oo', att=1.2)
solo(57.6, 'C5', 2.2, .2, att=.8, bright=1000); bell(58.8, 'A5', .1, d=4.4, pan=.3)

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
    sf.write(f'/home/claude/music/out25/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out25/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
