"""Episode 21 (Genesis 21, Laughter and a Well) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): the promise kept (a1: warm dawn, a thin choir) -> Isaac (b1: tender piano) -> Sarah laughs (b2: a light, rolling piano and bells) -> the weaning feast and 'send them away' (c1: warm, then a low unease)
     -> Abraham troubled, then God's word (c2: pensive, then a gentle swell of mercy) -> early morning, bread and water (d1: quiet sorrow) -> the wilderness (d2: bare and dry, a slow heartbeat) -> God hears the boy (e1: light blooms) -> the well (e2: the peak)
     -> God was with the boy (e3: held, warm) -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out21/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out21', exist_ok=True)
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


# ================================================================== 0 - 7.8  a1: the Lord kept his promise; Sarah bore a son at the time God had set: a warm dawn, an open F chord, a thin choir, bells
drone(0, 8.0, FQ('F1'), .24, att=1.4, rel=1.6)
pad(0.2, 4.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=1.4, bright=1100); pad(4.0, 8.2, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .26, att=1.2, bright=1600)
choir(1.8, 8.0, ['C4', 'F4', 'A4'], .16, 'oo', att=1.4); choir(5.0, 8.4, ['A3', 'C4', 'F4', 'A4'], .2, 'ah', att=1.0)
bell(1.2, 'C6', .12, d=4.6); bell(2.2, 'F6', .14, d=4.4, pan=.3); bell(5.2, 'A6', .16, d=4.4, pan=-.3)
solo(2.2, 'A4', 1.8, .2, att=.5, bright=1100); solo(5.2, 'C5', 1.8, .22, att=.5, bright=1300)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 5.4 + .34 * k_, .14, pan=-.3 + .2 * k_)

# ================================================================== 7.8 - 9.9  b1: Abraham named him Isaac: a tender, naming moment
pad(7.8, 10.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=.6, bright=1500)
for t_, nm, d_ in ((8.0, 'C5', 1.6), (8.6, 'F5', 1.6), (9.2, 'A5', 1.8)): pno(t_, nm, d_, .3, .5, pan=.1)
bell(8.3, 'F6', .16, d=4.2)

# ================================================================== 9.9 - 15.4  b2: "God has made me laugh, and all who hear will laugh with me": light, rolling piano, bells, a rising choir
pad(9.9, 15.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=.8, bright=1900)
arp(10.2, 15.4, 41, 4, .12, .5)
choir(10.4, 15.6, ['A3', 'C4', 'F4', 'A4'], .24, 'ah', att=1.0)
for k_, nm in enumerate(('C6', 'F6', 'A6', 'C7', 'A6')): bell(10.6 + .65 * k_, nm, .16 + .02 * k_, d=4.2, pan=-.4 + .2 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 11.4 + .32 * k_, .15, pan=-.4 + .2 * k_)
solo(11.8, 'C5', 1.6, .2, att=.4, bright=1700); solo(13.4, 'F5', 1.8, .2, att=.4, bright=1700)

# ================================================================== 15.4 - 22.8  c1: the weaning feast (warm), then Sarah: "send Hagar and her son away" (a low unease from ~19.5)
pad(15.4, 19.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=1.0, bright=1500)
choir(15.8, 19.8, ['A3', 'C4', 'F4'], .18, 'oo', att=1.2)
for t_, nm, d_ in ((16.0, 'A4', 1.3), (17.2, 'C5', 1.3), (18.4, 'F5', 1.4)): solo(t_, nm, d_, .18, att=.4, bright=1400); pno(t_, nm, d_ + .8, .14, .5)
for k_, nm in enumerate(('F5', 'A5', 'C6')): B['harp'].add(pluck(M(nm)), 16.4 + .36 * k_, .12, pan=-.3 + .2 * k_)
bell(16.0, 'C6', .12, d=4.0)
B['sub'].add(S.sub_boom(FQ('F1'), 2.6), 19.5, .16)
trem_pad(19.5, 23.2, ['F2', 'B2', 'F3'], .16, 6.5)
pad(19.7, 23.2, ['Bb1', 'F2', 'Bb2', 'Db3'], .14, att=.9, bright=800)
choir(20.0, 23.0, ['F3', 'B3', 'F4'], .14, 'oo', att=1.0)
for k_, t_ in enumerate((20.0, 20.9, 21.8)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .01 * k_)
solo(20.4, 'B4', 1.5, .18, att=.5, bright=1000); solo(22.0, 'F4', 1.5, .18, att=.5, bright=1000)

# ================================================================== 22.8 - 30.4  c2: Abraham was deeply troubled (pensive), then God: "do not worry. I will make a nation of Ishmael too" (a gentle swell of mercy from ~26.8)
pad(22.8, 26.8, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.0, bright=900)
choir(23.2, 27.0, ['Db4', 'F4', 'Ab4'], .14, 'oo', att=1.2)
for t_, nm, d_ in ((23.4, 'Ab4', 1.7), (25.0, 'F4', 1.7)): solo(t_, nm, d_, .2, att=.6, bright=1100); pno(t_, nm, d_ + .8, .16, .5)
bell(24.2, 'Db6', .1, d=4.4)
B['sub'].add(S.sub_boom(FQ('F1'), 3.2), 26.8, .22); B['timp'].add(S.timpani(FQ('F1'), 2.2, .6), 26.9, .14)
pad(26.8, 30.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700)
choir(27.0, 30.8, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 27.8 + .34 * k_, .16, pan=-.4 + .2 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.2, att=.9, rel=1.3, peak=1500), 28.2, .13, pan=.1)
bell(27.0, 'F6', .16, d=4.4); bell(28.6, 'C6', .14, d=4.2, pan=.3)

# ================================================================== 30.4 - 37.2  d1: early next morning, Abraham gives Hagar bread and water and sends her away with the boy: quiet sorrow
pad(30.4, 33.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .2, att=1.2, bright=1000); pad(33.6, 37.6, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.0, bright=900)
choir(33.6, 37.4, ['Db4', 'F4', 'Ab4'], .14, 'oo', att=1.2)
for t_, nm, d_ in ((31.0, 'F4', 1.7), (32.8, 'Db5', 1.7), (34.8, 'Ab4', 1.8), (36.2, 'F4', 1.6)): solo(t_, nm, d_, .2, att=.6, bright=1100); pno(t_, nm, d_ + .8, .15, .5)
bell(33.0, 'Db6', .1, d=4.4)

# ================================================================== 37.2 - 43.4  d2: the wilderness, the water runs out, she weeps: bare and dry, a slow heartbeat, a low tremolo
drone(37.2, 43.8, FQ('F1'), .3, att=1.0, rel=1.6)
trem_pad(37.4, 43.8, ['F2', 'B2', 'F3'], .17, 5.8)
pad(37.6, 43.8, ['F2', 'C3', 'F3', 'Ab3'], .12, att=1.2, bright=800)
choir(39.0, 43.6, ['F3', 'B3', 'F4'], .15, 'oo', att=1.4)
for k_, t_ in enumerate((38.4, 39.4, 40.4, 41.4, 42.4)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .01 * k_)
solo(38.2, 'B4', 1.7, .18, att=.5, bright=1000); solo(40.2, 'F4', 1.8, .2, att=.5, bright=1000); solo(41.8, 'Ab4', 1.6, .18, att=.5, bright=1000)
B['sub'].add(S.sub_boom(FQ('F1'), 2.6), 40.5, .2); bell(41.6, 'F6', .08, d=4.0)

# ================================================================== 43.4 - 50.4  e1: God heard the boy crying; the angel: "Hagar, do not be afraid": a hush, then light blooms (the beam at 43.6): bells and a rising choir
B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 43.5, .26); B['timp'].add(S.timpani(FQ('F1'), 2.4, .6), 43.6, .16)
pad(43.4, 47.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500); pad(47.0, 51.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=1.0, bright=1600)
for k_, nm in enumerate(('C6', 'F6', 'A6', 'C7')): bell(43.7 + .3 * k_, nm, .22, d=4.4, pan=-.3 + .2 * k_)
choir(43.8, 50.8, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.2)
solo(44.4, 'C5', 1.8, .2, att=.5, bright=1300); solo(46.2, 'A4', 1.8, .2, att=.5, bright=1300); solo(47.8, 'F5', 1.6, .2, att=.5, bright=1400)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 45.8 + .34 * k_, .15, pan=-.3 + .2 * k_)
bell(48.4, 'A6', .12, d=4.2)

# ================================================================== 50.4 - 55.2  e2: God opened her eyes: she saw a well and gave the boy a drink (water at 51.2): the peak builds
B['timp'].add(S.timpani(FQ('F1'), 2.4, .65), 51.2, .18)
pad(50.4, 53.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1900); pad(53.4, 55.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=2200)
choir(50.6, 55.6, ['F3', 'C4', 'F4', 'A4', 'C5'], .38, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6', 'C7')): B['harp'].add(pluck(M(nm)), 51.4 + .28 * k_, .17, pan=-.4 + .16 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1700), 52.2, .17, pan=.1)
for t_, nm, d_ in ((52.4, 'C5', 1.3), (53.8, 'F5', 1.4)): solo(t_, nm, d_, .22, att=.4, bright=1700); pno(t_, nm, d_ + .8, .18, .55)
bell(51.4, 'C7', .22, d=4.4, pan=.3); bell(52.6, 'F6', .18, d=4.2); bell(53.8, 'A6', .16, d=4.2, pan=-.3)

# ================================================================== 55.2 - 60.4  e3: God was with the boy as he grew up: the peak held, warm, into the morning
pad(55.2, 58.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .4, att=.8, bright=2400); pad(58.0, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=1.0, bright=1900)
choir(55.4, 60.2, ['F3', 'C4', 'F4', 'A4', 'C5'], .42, 'ah', att=.8)
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
    sf.write(f'/home/claude/music/out21/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out21/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
