"""Episode 22 (Genesis 22, The Test on Moriah) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): God's call (a1: a hush, a dark open chord, a thin choir) -> early morning, they set out (b1: a steady, quiet pulse) -> the third day, he sees the place (c1: open fifths, bells, a held suspension)
     -> the wood, the fire (c2: low tremolo, a slow heartbeat) -> 'where is the lamb?' / 'God himself will provide' (c3: a tender piano, then a warm lift) -> the altar (d1: tension builds) -> the knife is reached for, then the angel's call (d2: a swell of mercy at ~38.9)
     -> 'you did not withhold your son' (d3: release, warm) -> the ram (e1: hope, harp) -> 'the Lord will provide' (e2: the peak builds) -> the blessing for all nations (e3: held, wide) -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out22/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out22', exist_ok=True)
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


# ================================================================== 0 - 8.2  a1: "Take your son, your only son, whom you love" (22:2): a hush at night, a dark open chord, a thin choir; the light of God's word at ~1.8
drone(0, 8.6, FQ('F1'), .26, att=1.4, rel=1.6)
pad(0.2, 4.4, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .2, att=1.6, bright=900); pad(4.4, 8.8, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .22, att=1.2, bright=1000)
choir(1.8, 8.4, ['C4', 'F4', 'Ab4'], .14, 'oo', att=1.6)
bell(1.6, 'C6', .1, d=4.8); bell(5.0, 'Ab5', .1, d=4.6, pan=.3)
solo(2.6, 'Ab4', 2.0, .18, att=.7, bright=1000); solo(5.6, 'F4', 2.0, .2, att=.7, bright=1000)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .5), 6.6, .1)

# ================================================================== 8.2 - 14.2  b1: early next morning he set out with Isaac, two young men and the wood (22:3): a steady, quiet pulse, a first light of dawn
pad(8.2, 11.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .2, att=1.0, bright=1300); pad(11.4, 14.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .2, att=1.0, bright=1300)
for k_, t_ in enumerate((9.2, 10.4, 11.6, 12.8, 14.0)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .006 * k_)
for t_, nm, d_ in ((9.4, 'C5', 1.5), (11.0, 'F5', 1.5), (12.6, 'A4', 1.6)): solo(t_, nm, d_, .2, att=.5, bright=1300); pno(t_, nm, d_ + .8, .14, .5)
choir(10.0, 14.4, ['A3', 'C4', 'F4'], .16, 'oo', att=1.4)
for k_, nm in enumerate(('F5', 'A5', 'C6')): B['harp'].add(pluck(M(nm)), 12.2 + .36 * k_, .12, pan=-.3 + .2 * k_)
bell(10.6, 'F6', .1, d=4.0)

# ================================================================== 14.2 - 20.1  c1: on the third day he saw the place far away (22:4); "we will worship, and come back" (22:5): open fifths, bells, a held suspension
pad(14.2, 17.4, ['F2', 'C3', 'G3', 'C4'], .22, att=1.0, bright=1400); pad(17.4, 20.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.0, bright=1600)
choir(14.8, 20.2, ['C4', 'F4', 'A4'], .2, 'ah', att=1.2)
for k_, nm in enumerate(('C6', 'F6', 'A6')): bell(15.2 + .5 * k_, nm, .12 + .02 * k_, d=4.4, pan=-.3 + .3 * k_)
solo(15.8, 'A4', 1.8, .2, att=.6, bright=1300); solo(18.0, 'C5', 1.8, .2, att=.6, bright=1400)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 17.6 + .34 * k_, .13, pan=-.3 + .2 * k_)

# ================================================================== 20.1 - 24.3  c2: Isaac carries the wood; Abraham, the fire and the knife (22:6): a low tremolo and a slow heartbeat
drone(20.1, 24.8, FQ('F1'), .28, att=.8, rel=1.6)
trem_pad(20.3, 24.8, ['F2', 'B2', 'F3'], .15, 5.6)
pad(20.4, 24.8, ['Db2', 'Ab2', 'Db3', 'F3'], .14, att=1.0, bright=800)
for k_, t_ in enumerate((20.6, 21.6, 22.6, 23.6)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .01 * k_)
solo(21.0, 'F4', 1.6, .18, att=.5, bright=1000); solo(22.8, 'Ab4', 1.6, .18, att=.5, bright=1000)

# ================================================================== 24.3 - 30.9  c3: "where is the lamb?" (22:7), then "God himself will provide the lamb" (22:8): a tender piano, then a warm lift from ~27.2
pad(24.3, 27.4, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .18, att=1.0, bright=1000)
for t_, nm, d_ in ((24.8, 'Ab4', 1.7), (26.2, 'F4', 1.7)): solo(t_, nm, d_, .18, att=.6, bright=1100); pno(t_, nm, d_ + .8, .16, .5)
B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 27.2, .18)
pad(27.2, 31.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700)
choir(27.4, 31.0, ['A3', 'C4', 'F4', 'A4'], .28, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 28.0 + .34 * k_, .15, pan=-.4 + .2 * k_)
bell(27.6, 'F6', .14, d=4.4); bell(29.2, 'C6', .12, d=4.2, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.0, att=.9, rel=1.3, peak=1400), 28.4, .1, pan=.1)

# ================================================================== 30.9 - 36.6  d1: at the place God had shown him he built the altar, laid the wood and bound Isaac (22:9): tension builds under a low drone
drone(30.9, 37.0, FQ('F1'), .3, att=1.0, rel=1.6)
trem_pad(31.2, 37.2, ['F2', 'B2', 'F3'], .16, 6.0)
pad(31.4, 37.2, ['Bb1', 'F2', 'Bb2', 'Db3'], .14, att=1.2, bright=800)
choir(32.4, 36.8, ['F3', 'B3', 'F4'], .14, 'oo', att=1.4)
for k_, t_ in enumerate((31.6, 32.6, 33.6, 34.4, 35.2, 35.8, 36.2)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .012 * k_)
solo(32.0, 'B4', 1.7, .18, att=.5, bright=1000); solo(34.0, 'F4', 1.8, .2, att=.5, bright=1000); solo(35.6, 'Ab4', 1.6, .2, att=.5, bright=1000)
B['sub'].add(S.sub_boom(FQ('F1'), 2.6), 34.2, .2)

# ================================================================== 36.6 - 42.5  d2: he reached for the knife (22:10); the angel of the Lord called from heaven: Abraham! Do not harm the boy (22:11-12): a hold, then a swell of mercy at ~38.9
trem_pad(36.6, 38.9, ['F2', 'B2', 'F3', 'B3'], .2, 6.8)
for k_, t_ in enumerate((37.0, 37.6, 38.0, 38.3, 38.55, 38.75)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .08 + .02 * k_)
B['sub'].add(S.sub_boom(FQ('F1'), 3.8), 38.9, .34); B['timp'].add(S.timpani(FQ('F1'), 2.6, .7), 38.9, .22)
pad(38.9, 43.0, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .36, att=.5, bright=2000)
choir(38.9, 43.0, ['A3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=.6)
for k_, nm in enumerate(('C6', 'F6', 'A6', 'C7')): bell(39.0 + .28 * k_, nm, .22, d=4.4, pan=-.3 + .2 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.7, rel=1.4, peak=1700), 39.2, .14, pan=.1)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 40.4 + .32 * k_, .14, pan=-.3 + .2 * k_)

# ================================================================== 42.5 - 47.3  d3: "now I know you fear God, for you did not withhold your son" (22:12): release, warm
pad(42.5, 47.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1800)
choir(42.8, 47.4, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.0)
for t_, nm, d_ in ((43.0, 'C5', 1.4), (44.6, 'F5', 1.5), (46.0, 'A5', 1.6)): solo(t_, nm, d_, .2, att=.5, bright=1500); pno(t_, nm, d_ + .8, .18, .55)
bell(43.4, 'F6', .16, d=4.4); bell(45.0, 'C6', .14, d=4.2, pan=.3)

# ================================================================== 47.3 - 51.8  e1: Abraham saw a ram caught in a thicket and offered it instead (22:13): hope, harp, a rising line
pad(47.3, 51.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1600); pad(51.0, 52.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .28, att=.8, bright=1900)
choir(47.6, 51.8, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=1.2)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 48.0 + .3 * k_, .15, pan=-.3 + .15 * k_)
solo(48.4, 'D5', 1.8, .2, att=.5, bright=1400); solo(50.2, 'F5', 1.7, .2, att=.5, bright=1500)
bell(48.8, 'A6', .14, d=4.2); bell(50.6, 'C7', .16, d=4.2, pan=-.3)

# ================================================================== 51.8 - 55.2  e2: "the Lord will provide" (22:14): the peak builds
B['timp'].add(S.timpani(FQ('F1'), 2.4, .65), 51.8, .18)
pad(51.8, 55.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.8, bright=2200)
choir(52.0, 55.6, ['F3', 'C4', 'F4', 'A4', 'C5'], .38, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6', 'C7')): B['harp'].add(pluck(M(nm)), 52.2 + .28 * k_, .17, pan=-.4 + .16 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.9, rel=1.4, peak=1700), 52.6, .17, pan=.1)
bell(52.0, 'C7', .2, d=4.4, pan=.3); bell(53.2, 'F6', .18, d=4.2); bell(54.4, 'A6', .16, d=4.2, pan=-.3)

# ================================================================== 55.2 - 60.4  e3: the angel called a second time: through your descendants all the nations of the earth shall gain blessing (22:15-18): the peak held, wide, into the morning
pad(55.2, 58.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .42, att=.8, bright=2500); pad(58.0, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=1.0, bright=1900)
choir(55.4, 60.2, ['F3', 'C4', 'F4', 'A4', 'C5'], .44, 'ah', att=.8)
for m_ in ('F3', 'C4', 'A4'): B['brass'].add(horn(M(m_), 4.0, att=.8, rel=1.5, peak=2000), 55.4, .22, pan=.05)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 55.8 + .3 * k_, .17, pan=-.4 + .18 * k_)
for t_, nm, d_ in ((55.6, 'C5', 1.4), (57.2, 'F5', 1.5), (58.8, 'A5', 1.8)): solo(t_, nm, d_, .22, att=.4, bright=1700); pno(t_, nm, d_ + .8, .2, .55)
bell(55.4, 'F6', .2, d=4.6); bell(57.0, 'C7', .22, d=4.4, pan=.3); bell(58.8, 'A6', .16, d=4.2, pan=-.3)

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
    sf.write(f'/home/claude/music/out22/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out22/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
