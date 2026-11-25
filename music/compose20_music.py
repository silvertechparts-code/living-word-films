"""Episode 20 (Genesis 20, Abraham and Abimelech) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): a warm evening road to Gerar (a1) -> fear (b1: a slow heartbeat and a tritone as Sarah is taken in) -> the dream (b2: a hush, then light blooms: bells and a rising choir)
     -> Abimelech's answer (c1: soft, bewildered) -> God's answer (c2: the grandest moment, a mercy swell) -> dawn and the confrontation (d1: tension) -> Abraham's explanation (d2: pensive)
     -> the half-sister (d3: small unease) -> Sarah returned (e1: warming) -> prayer and healing (e2: the peak) -> the reflection (same harmony family as the other episodes) -> the question.
Outputs: out20/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out20', exist_ok=True)
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

# ================================================================== 0 - 5.2  a1: a warm evening on the road south to Gerar: a drone, an open F chord, a thin choir, a few bells; a shadow of Db at the end
drone(0, 5.6, FQ('F1'), .26, att=1.4, rel=1.6)
pad(0.2, 3.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=1.4, bright=1100); pad(3.4, 6.0, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.0, bright=1000)
choir(0.8, 4.2, ['C4', 'F4', 'A4'], .16, 'oo', att=1.4); choir(3.8, 6.0, ['Db4', 'F4', 'Ab4'], .16, 'oo', att=1.0)
bell(0.9, 'C6', .12, d=4.6); bell(3.2, 'F6', .14, d=4.4, pan=.3)
solo(1.6, 'A4', 1.8, .2, att=.5, bright=1100); solo(3.6, 'C5', 1.8, .2, att=.5, bright=1200)
for k_, nm in enumerate(('F5', 'A5', 'C6')): B['harp'].add(pluck(M(nm)), 2.2 + .35 * k_, .14, pan=-.3 + .2 * k_)

# ================================================================== 5.2 - 12.6  b1: afraid for his life, he says Sarah is his sister; the king's men take her to the king: a slow heartbeat, a tritone, a low tremolo
drone(5.2, 12.9, FQ('F1'), .32, att=.8, rel=1.6)
t_ = 5.8; k_ = 0
while t_ < 12.2:
    B['timp'].add(S.timpani(FQ('F1'), 1.0, .55 + .02 * k_), t_, .07 + .01 * k_); t_ += .85 - .015 * k_; k_ += 1
trem_pad(5.4, 12.6, ['F2', 'B2', 'F3'], .18, 7.0)
pad(5.6, 12.6, ['F2', 'C3', 'F3', 'Ab3'], .14, att=1.2, bright=800)
choir(6.6, 12.4, ['F3', 'B3', 'F4'], .16, 'oo', att=1.4)
solo(6.6, 'B4', 1.6, .2, att=.5, bright=1000); solo(8.8, 'F4', 1.8, .2, att=.5, bright=1000); solo(10.6, 'Ab4', 1.6, .18, att=.5, bright=1000)
B['sub'].add(S.sub_boom(FQ('F1'), 2.8), 10.7, .24); bell(11.0, 'F6', .1, d=4.2)

# ================================================================== 12.6 - 19.4  b2: God speaks to Abimelech in a dream: a hush, then the light begins at ~13.4 (bells), and a choir rises
pad(12.6, 15.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .2, att=1.8, bright=1200); pad(15.8, 19.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.0, bright=1500)
B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 13.4, .26)
for k_, nm in enumerate(('C6', 'F6', 'A6', 'C7')): bell(13.6 + .3 * k_, nm, .22, d=4.4, pan=-.3 + .2 * k_)
choir(14.0, 19.6, ['A3', 'C4', 'F4', 'A4'], .26, 'oo', att=1.6)
solo(14.8, 'C5', 1.8, .2, att=.5, bright=1300); solo(16.6, 'A4', 1.8, .2, att=.5, bright=1300); solo(18.2, 'F5', 1.6, .2, att=.5, bright=1300)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 15.6 + .34 * k_, .14, pan=-.3 + .2 * k_)
bell(17.0, 'A6', .12, d=4.2)

# ================================================================== 19.4 - 25.6  c1: Abimelech answers: "Lord, will you destroy an innocent people?": soft and bewildered
pad(19.4, 22.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .18, att=1.0, bright=1000); pad(22.6, 25.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .18, att=1.0, bright=1100)
choir(19.8, 25.4, ['D4', 'F4', 'Bb4'], .15, 'oo', att=1.2)
for t_, nm, d_ in ((20.2, 'D5', 1.4), (21.8, 'F5', 1.4), (23.2, 'Bb4', 1.6)): solo(t_, nm, d_, .2, att=.5, bright=1200); pno(t_, nm, d_ + .8, .16, .5)
bell(21.2, 'D6', .1, d=4.0)

# ================================================================== 25.6 - 33.4  c2: God answers: "I kept you from sinning ... he will pray for you, and you shall live": the grandest, gentlest swell
B['timp'].add(S.timpani(FQ('F1'), 2.4, .7), 25.6, .2); B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 25.6, .26)
pad(25.6, 29.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700); pad(29.0, 33.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1900)
choir(26.0, 33.2, ['A3', 'C4', 'F4', 'A4'], .34, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 28.0 + .32 * k_, .18, pan=-.4 + .18 * k_)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1600), 29.8, .15, pan=.1)
for t_, nm, d_ in ((27.0, 'C5', 1.3), (28.8, 'F5', 1.4), (30.4, 'A5', 1.5), (31.8, 'C6', 1.6)): solo(t_, nm, d_, .22, att=.4, bright=1700); pno(t_, nm, d_ + .8, .2, .55)
bell(26.0, 'F6', .18, d=4.4); bell(28.4, 'C6', .16, d=4.2, pan=.3); bell(30.6, 'A6', .15, d=4.2, pan=-.3)

# ================================================================== 33.4 - 38.7  dawn, and d1: Abimelech calls Abraham: "What have you done to us?": a first light, then tension
pad(33.4, 36.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=1.0, bright=1500)
B['brass'].add(horn(M('F3'), 2.6, att=1.0, rel=1.2, peak=1300), 33.8, .12, pan=.1); bell(34.2, 'F6', .14, d=4.0)
for k_, t_ in enumerate((34.6, 35.4, 36.2, 37.0)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .07 + .01 * k_)
trem_pad(36.2, 39.0, ['F2', 'C3', 'F3', 'Ab3'], .16, 7.5)
choir(34.8, 38.6, ['C4', 'F4', 'Ab4'], .14, 'oo', att=1.0)
solo(35.0, 'Ab4', 1.6, .18, att=.5, bright=1100); solo(36.8, 'F4', 1.6, .18, att=.5, bright=1100)

# ================================================================== 38.7 - 45.6  d2: Abraham: "I thought there was no fear of God in this place": pensive
pad(38.7, 42.4, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.2, bright=900); pad(42.4, 46.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .2, att=1.0, bright=900)
choir(39.4, 45.2, ['Db4', 'F4', 'Ab4'], .14, 'oo', att=1.3)
for t_, nm, d_ in ((39.6, 'Ab4', 1.8), (41.6, 'F4', 1.8), (43.4, 'Db5', 1.8)): solo(t_, nm, d_, .2, att=.6, bright=1100); pno(t_, nm, d_ + .8, .16, .5)
bell(40.6, 'Db6', .1, d=4.4)

# ================================================================== 45.6 - 48.8  d3: "she is truly my half-sister": a small, unsettled moment
pad(45.8, 49.2, ['Bb1', 'F2', 'Bb2', 'Db3'], .14, att=.8, bright=900)
for k_, (t_, nm) in enumerate(((46.0, 'F5'), (46.7, 'Ab5'), (47.4, 'F5'), (48.0, 'Db5'))): pno(t_, nm, 1.6, .2, .5, pan=-.2 + .1 * k_)
bell(46.4, 'Db6', .1, d=3.8)

# ================================================================== 48.8 - 54.4  e1: Abimelech returns Sarah and gives sheep, cattle and servants: warming
pad(48.8, 52.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=.8, bright=1500); pad(52.0, 54.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .22, att=.8, bright=1500)
choir(49.4, 54.4, ['A3', 'C4', 'F4'], .26, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 49.6 + .32 * k_, .16, pan=-.3 + .2 * k_)
for t_, nm, d_ in ((49.8, 'C5', 1.3), (51.4, 'F5', 1.4), (52.8, 'A5', 1.5)): solo(t_, nm, d_, .2, att=.4, bright=1600); pno(t_, nm, d_ + .8, .18, .52)
bell(49.2, 'F6', .16, d=4.4); bell(51.0, 'C6', .14, d=4.2, pan=.3)

# ================================================================== 54.4 - 60.4  e2: Abraham prays and God heals Abimelech's household: the peak, then a held F chord into the morning
B['timp'].add(S.timpani(FQ('F1'), 2.6, .7), 54.5, .2)
pad(54.4, 57.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .4, att=.9, bright=2400); pad(57.2, 61.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=1.0, bright=1900)
choir(54.8, 60.2, ['F3', 'C4', 'F4', 'A4', 'C5'], .42, 'ah', att=.8)
for m_ in ('F3', 'C4', 'A4'): B['brass'].add(horn(M(m_), 4.0, att=.8, rel=1.5, peak=2000), 55.2, .24, pan=.05)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 55.6 + .3 * k_, .18, pan=-.4 + .18 * k_)
for t_, nm, d_ in ((55.4, 'C5', 1.4), (57.0, 'F5', 1.5), (58.6, 'A5', 1.8)): solo(t_, nm, d_, .22, att=.4, bright=1700); pno(t_, nm, d_ + .8, .2, .55)
bell(55.0, 'F6', .2, d=4.6); bell(56.6, 'C7', .22, d=4.4, pan=.3); bell(58.4, 'A6', .16, d=4.2, pan=-.3)

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
    sf.write(f'/home/claude/music/out20/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out20/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
