"""Episode 12 (Genesis 12, the call of Abram) score -- original, synthesised with numpy.
Arc (F-vocabulary, written in F and sounding in D): the call (one voice, one low horn note) -> the thread over the clouds -> six families lift from the earth -> a walking pulse as the caravan sets out
     -> the Lord appears at Shechem (a hush, a lone high choir note, bells) -> the altar -> Bethel -> famine (thin, dry) -> Egypt (a held tension, heartbeat) -> the plagues (dark cluster)
     -> sent away with all he had (relief, resolving to F) -> the reflection (same harmony family as the other episodes) -> the question: a warm sustained chord.
Outputs: out12/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out12', exist_ok=True)
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

# ================================================================== 0 - 7.4  a1: "Go from your country": one voice, one low horn note, a lone rising line (F, sounding D)
drone(0, 7.0, FQ('F1'), .4, att=2.0); pad(0.0, 7.0, ['F2', 'C3', 'F3', 'A3'], .22, att=1.8, bright=850)
B['brass'].add(horn(M('F3'), 4.6, att=1.2, rel=1.8, peak=1300), 1.0, .24, pan=-.1)
choir(1.4, 7.0, ['F4', 'A4', 'C5'], .22, 'oo', att=1.4)
for t_, nm, d_ in ((1.6, 'A4', 1.5), (2.8, 'C5', 1.5), (4.2, 'F5', 2.2)): solo(t_, nm, d_, .26, att=.4, bright=1700)
pno(0.9, 'F2', 4.6, .36, .6); bell(1.5, 'C6', .14, d=4.2, pan=-.3); bell(4.0, 'F6', .12, d=4.2, pan=.3)
B['timp'].add(S.timpani(FQ('F1'), 2.6, .35), 0.5, .2)

# ================================================================== 7.4 - 13.0  b1: "the land that I will show you": the thread draws over the clouds; a wandering harp line (Bb - C)
for a, b, ns in ((7.4, 10.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3']), (10.2, 13.2, ['C2', 'G2', 'C3', 'E3', 'G3'])): pad(a, b, ns, .26, att=1.0, bright=1300)
choir(8.0, 13.2, ['D4', 'F4', 'Bb4'], .22, 'oo', att=1.4)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'D5', 'F5', 'D5', 'C5')): B['harp'].add(pluck(M(nm)), 8.0 + .62 * k_, .24, pan=-.4 + .12 * k_)
solo(8.6, 'C5', 2.4, .26, att=.5, bright=1700); solo(11.0, 'D5', 2.0, .26, att=.5, bright=1800)
bell(9.0, 'F6', .16, d=4.4); bell(11.6, 'C6', .16, d=4.4, pan=.3); pno(7.6, 'Bb1', 4.8, .34, .55)

# ================================================================== 13.0 - 17.8  b2: "all the families of the earth": six lands lift, six rising notes, a warm swell
pad(13.0, 15.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.8, bright=1500); pad(15.8, 18.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1900)
choir(13.0, 18.0, ['A3', 'C4', 'F4', 'A4'], .34, 'ah', att=1.0)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'D6', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 13.4 + .46 * k_, .26, pan=-.7 + .28 * k_); bell(13.5 + .46 * k_, ('F6', 'A6', 'C7', 'D7', 'F7', 'A7')[k_], .1, d=3.2, pan=-.7 + .28 * k_)
B['timp'].add(S.timpani(FQ('F1'), 2.6, .5), 13.1, .24)
for m in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m), 3.8, att=1.0, rel=1.6, peak=1700), 14.2, .24, pan=.1)
arp(15.8, 18.0, 34, 4, .09, .46)

# ================================================================== 17.8 - 24.3  c1: "so Abram went": a gentle walking pulse, a rising line, soft timpani on the beat (F - Bb - C)
for a, b, ns, r, ti in ((17.8, 20.4, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (20.4, 22.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (22.4, 24.8, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)):
    k = (a - 17.8) / 6.5; pad(a, b, ns, .26 + .12 * k, att=.8, bright=1200 + 900 * k); arp(a, b, r, ti, .1 + .04 * k, .46 + .08 * k)
choir(18.2, 24.6, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.2)
for t_, nm, d_ in ((18.2, 'A4', 1.4), (19.6, 'C5', 1.4), (21.0, 'D5', 1.4), (22.4, 'F5', 1.8)): solo(t_, nm, d_, .28, att=.4, bright=2000); pno(t_, nm, d_ + .8, .34, .62)
for t_ in np.arange(18.0, 24.0, BEAT): B['timp'].add(S.timpani(FQ('F1'), 1.4, .4), t_, .1)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.0, att=1.0, rel=1.6, peak=2000), 20.6, .28, pan=.1)
for k_, nm in enumerate(('F5', 'C6', 'A5', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 20.4 + .34 * k_, .22, pan=-.4 + .15 * k_)
bell(19.6, 'C6', .18); bell(22.2, 'F6', .18, d=4.4)

# ================================================================== 24.3 - 31.0  c2: "the LORD appeared to Abram": the walking stops, a long sub drop, a lone high choir note, bells (open fifth in D), then a warm chord for the promise
B['timp'].add(S.timpani(FQ('D1'), 3.6, .9), 24.7, .5); B['sub'].add(S.sub_boom(FQ('D1'), 4.2), 24.7, .46)
pad(24.7, 29.4, ['D2', 'A2', 'E3', 'A3'], .26, att=1.0, bright=700); choir(25.0, 29.4, ['A4', 'D5', 'A5'], .36, 'ah', att=1.2)
solo(25.2, 'A5', 3.8, .3, att=.8, bright=1500); bell(25.4, 'D6', .24, d=5.0); bell(26.8, 'A6', .2, d=5.0, pan=.3); bell(28.0, 'F6', .18, d=4.4, pan=-.3)
drone(24.7, 29.6, FQ('D1'), .44, att=1.4)
pad(28.8, 32.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1400); choir(28.8, 32.6, ['F4', 'A4', 'C5'], .3, 'oo', att=.9)
bell(29.2, 'F6', .22, d=4.6)

# ================================================================== 31.0 - 34.0  c3: "he built an altar": a warm F chord, soft timpani, three harp notes, bells
B['timp'].add(S.timpani(FQ('F1'), 2.8, .6), 31.0, .3)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5')): B['harp'].add(pluck(M(nm)), 31.1 + .36 * k_, .28, pan=-.3 + .2 * k_)
bell(31.2, 'C6', .22); bell(32.2, 'F6', .2, d=4.4, pan=.3); pno(31.0, 'F2', 4.0, .38, .62)

# ================================================================== 34.0 - 38.6  d1: Bethel, the tent, the altar, calling on the name of the LORD: peaceful, a lone string line (Bb - C)
for a, b, ns in ((34.0, 36.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3']), (36.4, 39.0, ['C2', 'G2', 'C3', 'E3', 'G3'])): pad(a, b, ns, .26, att=1.0, bright=1300)
choir(34.2, 38.8, ['D4', 'F4', 'Bb4'], .22, 'oo', att=1.2)
for t_, nm, d_ in ((34.5, 'D5', 1.8), (36.2, 'C5', 1.6), (37.5, 'A4', 1.8)): solo(t_, nm, d_, .28, att=.45, bright=1700); pno(t_, nm, d_ + .9, .34, .55)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'A4')): B['harp'].add(pluck(M(nm)), 35.2 + .55 * k_, .2, pan=-.3 + .2 * k_)
bell(35.6, 'F6', .16, d=4.4)

# ================================================================== 38.6 - 43.6  d2: the famine: thin and dry (D minor), a sparse low piano, a dissonant tremolo, then down to Egypt: a low horn
B['timp'].add(S.timpani(FQ('D1'), 3.4, .7), 38.7, .36); B['sub'].add(S.sub_boom(FQ('D1'), 3.6), 38.7, .3)
pad(38.7, 43.8, ['D2', 'A2', 'D3', 'F3'], .22, att=.8, bright=700)
for t_, nm, d_ in ((39.2, 'D3', 2.6), (40.6, 'Ab3', 2.2)): pno(t_, nm, d_, .34, .6)
solo(39.8, 'A4', 2.6, .26, att=.6, bright=1300)
trem_pad(40.6, 44.0, ['Bb1', 'E2', 'Bb2', 'F3'], .24, 7.5)
choir(41.0, 44.0, ['Eb4', 'A4', 'D5'], .22, 'ah', att=1.0)
for m in ('D3', 'A3'): B['brass'].add(horn(M(m), 3.6, att=.8, rel=1.6, peak=1200), 41.7, .22, pan=-.1)

# ================================================================== 43.6 - 50.4  d3: Egypt, "say you are my sister": a held tension, a quiet heartbeat, scattered piano, a rising unease
trem_pad(43.6, 50.8, ['D2', 'Ab2', 'D3', 'Gb3', 'C4'], .3, 8.0)
for k_, t_ in enumerate(np.arange(44.2, 50.0, 1.2)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), t_, .1 + .012 * k_); B['timp'].add(S.timpani(FQ('D1'), 1.0, .4), t_ + .23, .07 + .01 * k_)
for k_, (t_, nm) in enumerate(((44.6, 'A4'), (45.4, 'Eb5'), (46.3, 'F#4'), (47.3, 'C5'), (48.1, 'G#4'), (49.0, 'D5'), (49.7, 'B4'))): pno(t_, nm, 2.0, .3, .62, pan=-.5 + .16 * k_)
solo(46.0, 'D5', 2.4, .24, att=.6, bright=1500); choir(47.4, 50.6, ['Eb4', 'A4', 'D5'], .24, 'ah', att=1.0)

# ================================================================== 50.4 - 55.3  e1: the great plagues on Pharaoh's house: a deep boom, a timpani roll, a detuned choir cluster, a dark tremolo
B['timp'].add(S.timpani(FQ('D1'), 3.6, .95), 50.4, .5); B['sub'].add(S.sub_boom(FQ('Bb1'), 4.0), 50.4, .46)
for k_, (m, g_) in enumerate((('F4', .3), ('F#4', .24), ('G4', .22), ('Ab4', .2), ('B4', .18), ('C5', .22), ('Db5', .18))):
    B['choir'].add(choir_note(M(m) * (1 + .004 * ((k_ % 3) - 1)), 4.4, 'ah_f', att=1.4, rel=1.3, voices=3), 50.6 + .12 * k_, g_, pan=-.5 + .16 * k_)
trem_pad(50.6, 55.6, ['Bb1', 'E2', 'Bb2', 'F3', 'B3'], .34, 8.5)
for k_ in range(14): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5 + .03 * k_), 51.2 + .24 * k_, .13 + .014 * k_)
pad(52.0, 55.6, ['D2', 'Ab2', 'D3', 'Gb3'], .24, att=.9, bright=1100)

# ================================================================== 55.3 - 60.4  e2: "sent away with all he had": relief, a rising line, a warm F resolution
B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 55.3, .3); B['timp'].add(S.timpani(FQ('F1'), 2.8, .6), 55.4, .3)
for a, b, ns, r, ti in ((55.4, 57.8, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (57.8, 59.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (59.2, 61.2, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4)):
    k = (a - 55.4) / 5.0; pad(a, b, ns, .26 + .12 * k, att=.8, bright=1300 + 900 * k); arp(a, b, r, ti, .1 + .03 * k, .46 + .06 * k)
choir(55.8, 60.8, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.2)
for t_, nm, d_ in ((55.6, 'A4', 1.4), (56.8, 'C5', 1.4), (58.0, 'D5', 1.4), (59.2, 'F5', 2.0)): solo(t_, nm, d_, .28, att=.4, bright=2000); pno(t_, nm, d_ + .8, .36, .65)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4')): B['harp'].add(pluck(M(nm)), 58.4 + .26 * k_, .26, pan=-.3 + .1 * k_)
bell(58.8, 'F6', .2); bell(59.6, 'A6', .18, d=4.2)

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
    sf.write(f'/home/claude/music/out12/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out12/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

