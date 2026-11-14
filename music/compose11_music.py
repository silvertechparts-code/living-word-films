"""Episode 11 (Genesis 11) score -- original, synthesised with numpy.
Arc (F-vocabulary, transposed down 3 semitones so the film sounds in D): one voice, one warm chord (a1) -> a pastoral pulse for the bricks -> a confident rising ostinato as the tower climbs
     -> the Lord comes down: everything hushes, a lone high choir note and bells -> the speech is confused: a detuned choir cluster and scattered piano -> the scattering: strings and harp sweep outward, then thin away
     -> a quiet D-minor line for Babel -> nine harp plucks for the nine tents -> a sparse night camp for Abram and Sarai -> a gentle walking pulse out of Ur to Haran, resolving to F
     -> the reflection (same family of harmony as the other episodes) -> the question: a warm sustained chord that settles.
Outputs: out11/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out11', exist_ok=True)
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



# ================================================================== 0 - 4.5  a1: one language: a single warm chord and a plain unison line (F, sounding D)
drone(0, 5.0, FQ('F1'), .4, att=2.0); pad(0.0, 4.8, ['F2', 'C3', 'F3', 'A3'], .24, att=1.6, bright=900)
choir(1.0, 4.8, ['F4', 'A4', 'C5'], .2, 'oo', att=1.2)
for t_, nm, d_ in ((1.0, 'A4', 1.4), (2.0, 'C5', 1.4), (3.0, 'F5', 1.8)): solo(t_, nm, d_, .26, att=.4, bright=1700)
pno(0.8, 'F2', 4.2, .38, .6); bell(1.2, 'C6', .14, d=4.2, pan=-.3); bell(3.2, 'F6', .12, d=4.2, pan=.3)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .35), 0.2, .22)

# ================================================================== 4.5 - 11.8  b1: the plain of Shinar, the kilns and the bricks: a pastoral pulse (F - Bb - C), soft timpani on the beat
for a, b, ns, r, ti in ((4.5, 7.5, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (7.5, 10.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (10.0, 12.0, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)):
    k = (a - 4.5) / 7.5; pad(a, b, ns, .26 + .08 * k, att=.9, bright=1300 + 600 * k); arp(a, b, r, ti, .1 + .03 * k, .46 + .06 * k)
choir(5.0, 12.0, ['A3', 'C4', 'F4'], .22, 'oo', att=1.4)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4', 'Bb4', 'D5')): B['harp'].add(pluck(M(nm)), 5.4 + .7 * k_, .22 + .01 * k_, pan=-.4 + .1 * k_)
for t_ in (4.5, 6.0, 7.5, 9.0, 10.5): B['timp'].add(S.timpani(FQ('F1'), 1.4, .4), t_, .14)
bell(7.0, 'F6', .16); bell(10.2, 'C6', .18, d=4.4)

# ================================================================== 11.8 - 21.6  c1, c2: the tower rises: a confident rising ostinato (Dm - Bb - F - C), brass on the climb, bells for each tier
B['timp'].add(S.timpani(FQ('D1'), 3.0, .7), 11.8, .4); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 11.8, .28)
for a, b, ns, r, ti in ((11.8, 14.8, ['D2', 'A2', 'D3', 'F3', 'A3'], 38, 3), (14.8, 17.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (17.8, 20.0, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (20.0, 22.0, ['C2', 'G2', 'C3', 'E3', 'G3'], 36, 4)):
    k = (a - 11.8) / 10.0; pad(a, b, ns, .3 + .14 * k, att=.7, bright=1200 + 1500 * k); arp(a, b, r, ti, .1 + .04 * k, .48 + .1 * k)
for m in ('D3', 'A3', 'D4'): B['brass'].add(horn(M(m), 4.2, att=1.0, rel=1.6, peak=1700), 12.4, .26, pan=-.1)
for m in ('Bb2', 'F3', 'D4', 'F4'): B['brass'].add(horn(M(m), 4.6, att=.9, rel=1.6, peak=2200), 17.2, .32, pan=.1)
choir(12.2, 21.6, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.4)
for k_, t_ in enumerate((13.3, 14.5, 15.7, 17.7, 18.7, 19.7, 20.7, 21.8, 23.2)):
    if t_ < 21.6: bell(t_, ('F5', 'A5', 'C6', 'F6', 'A6', 'C7', 'F6', 'A6', 'C7')[k_], .16 + .02 * k_, d=3.2, pan=-.4 + .1 * k_)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'Bb5', 'D6', 'F6', 'D6', 'Bb5', 'G5')): B['harp'].add(pluck(M(nm)), 16.7 + .42 * k_, .22 + .008 * k_, pan=-.5 + .08 * k_)

# ================================================================== 21.6 - 25.9  c3: the Lord comes down: the ostinato stops, a lone high choir note, a long sub drop, bells (open fifth, D)
B['timp'].add(S.timpani(FQ('D1'), 3.6, .9), 21.7, .5); B['sub'].add(S.sub_boom(FQ('D1'), 4.2), 21.7, .5)
pad(21.7, 26.2, ['D2', 'A2', 'E3', 'A3'], .26, att=1.0, bright=700); choir(22.0, 26.2, ['A4', 'D5', 'A5'], .36, 'ah', att=1.2)
solo(22.2, 'A5', 3.6, .3, att=.8, bright=1500); bell(22.4, 'D6', .24, d=5.0); bell(23.6, 'A6', .2, d=5.0, pan=.3); bell(24.8, 'F6', .18, d=4.4, pan=-.3)
drone(21.7, 26.2, FQ('D1'), .46, att=1.4)

# ================================================================== 25.9 - 32.0  c4: one people, one language -> "let us confuse their speech": a calm chord that slides into a detuned choir cluster
pad(25.9, 29.0, ['F2', 'C3', 'F3', 'A3'], .28, att=.8, bright=900); choir(25.9, 29.0, ['F4', 'A4', 'C5'], .26, 'oo', att=.8)
solo(26.4, 'C5', 1.8, .24, att=.4, bright=1500); solo(28.0, 'A4', 1.4, .22, att=.4, bright=1400)
for k_, (m, g_) in enumerate((('F4', .3), ('F#4', .24), ('G4', .22), ('Ab4', .2), ('B4', .18), ('C5', .22), ('Db5', .18))):
    B['choir'].add(choir_note(M(m) * (1 + .004 * ((k_ % 3) - 1)), 4.4, 'ah_f', att=1.6, rel=1.3, voices=3), 28.9 + .12 * k_, g_, pan=-.5 + .16 * k_)
trem_pad = lambda a, b, ns, g, tr: [B['str'].add(trem(strings_note(M(m), (b - a) + .3, att=1.0, rel=1.2, bright=1100), tr, .6, k), a, g, pan=-.4 + .15 * k) for k, m in enumerate(ns)]
trem_pad(28.9, 32.4, ['Bb1', 'E2', 'Bb2', 'F3', 'B3'], .3, 7.5)
B['timp'].add(S.timpani(FQ('A1'), 3.0, .8), 28.9, .36); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.2), 28.9, .34)

# ================================================================== 32.0 - 36.35  d1: they can no longer understand one another: tremolo cluster, scattered piano notes, a timpani roll
trem_pad(32.0, 36.6, ['D2', 'Ab2', 'D3', 'Gb3', 'C4'], .34, 8.5)
for k_, (t_, nm) in enumerate(((32.2, 'A4'), (32.7, 'Eb5'), (33.2, 'F#4'), (33.8, 'C5'), (34.3, 'G#4'), (34.9, 'D5'), (35.4, 'B4'), (35.9, 'F5'))): pno(t_, nm, 2.0, .34, .65, pan=-.5 + .14 * k_)
for k_ in range(10): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5 + .05 * k_), 33.2 + .22 * k_, .16 + .02 * k_)
choir(32.2, 36.4, ['Eb4', 'A4', 'D5'], .26, 'ah', att=.8)

# ================================================================== 36.35 - 41.1  d2: scattered over the earth, the building stops: strings and harp sweep outward, a boom, then everything thins away
B['timp'].add(S.timpani(FQ('D1'), 3.4, .9), 36.4, .5); B['sub'].add(S.sub_boom(FQ('D1'), 3.6), 36.4, .42)
pad(36.4, 40.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .34, att=.6, bright=2100); choir(36.4, 40.4, ['A3', 'D4', 'F4', 'A4'], .36, 'ah', att=.8)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'D6', 'F6', 'A6', 'D7', 'A6', 'F6', 'D6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 36.7 + .3 * k_, .26 - .008 * k_, pan=-.8 + .14 * k_)
for k_, t_ in enumerate((37.0, 37.7, 38.4, 39.1, 39.8)): bell(t_, ('A5', 'D6', 'F6', 'A6', 'D7')[k_], .2 - .02 * k_, d=3.6, pan=-.6 + .3 * k_)

# ================================================================== 41.1 - 44.5  d3: the place was called Babel: quiet D minor, a lone string line and one bell
pad(41.1, 45.0, ['D2', 'A2', 'D3', 'F3'], .22, att=1.2, bright=800)
for t_, nm, d_ in ((41.3, 'A4', 1.8), (42.8, 'F4', 1.8)): solo(t_, nm, d_, .3, att=.5, bright=1300); pno(t_, nm, d_ + 1.0, .36, .6)
bell(41.6, 'D6', .16, d=4.6); pno(41.2, 'D2', 4.0, .36, .55)

# ================================================================== 44.5 - 49.96  e1: Shem's line down to Terah: nine harp plucks, one for each lit tent (F), a warm pastoral bed
for a, b, ns in ((44.5, 47.4, ['F2', 'C3', 'F3', 'A3']), (47.4, 50.2, ['Bb1', 'F2', 'Bb2', 'D3'])): pad(a, b, ns, .24, att=1.0, bright=1500)
choir(45.0, 50.0, ['F4', 'A4', 'C5'], .22, 'oo', att=1.6)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'D5', 'C5', 'A4', 'Bb4', 'C5', 'F5')): B['harp'].add(pluck(M(nm)), 44.8 + .38 * k_, .3, pan=-.5 + .12 * k_); bell(44.9 + .38 * k_, ('F6', 'A6', 'C7', 'D7', 'C7', 'A6', 'Bb6', 'C7', 'F7')[k_], .1, d=3.0, pan=-.5 + .12 * k_)
solo(46.0, 'C5', 2.2, .26, att=.5, bright=1900); solo(48.2, 'A4', 1.8, .26, att=.5, bright=1700)

# ================================================================== 49.96 - 55.27  e2: Abram and Sarai at the night fire: sparse and intimate (D minor, one solo string, soft piano, a held suspended chord at the end)
pad(49.96, 55.6, ['D2', 'A2', 'D3', 'F3'], .24, att=1.2, bright=850)
for t_, nm, d_ in ((50.3, 'D5', 1.6), (51.9, 'F5', 1.6), (53.2, 'A4', 1.8), (54.4, 'G4', 2.2)): solo(t_, nm, d_, .3, att=.4, bright=1600); pno(t_, nm, d_ + .8, .34, .55)
pno(50.1, 'D2', 4.6, .34, .55); bell(52.4, 'A6', .12, d=4.4); bell(54.6, 'D6', .14, d=4.4)
pad(54.0, 56.4, ['G2', 'D3', 'A3', 'C4'], .22, att=.8, bright=900)

# ================================================================== 55.27 - 60.4  e3: out of Ur toward Canaan: a gentle walking pulse, a rising line, and a warm F resolution at Haran
for a, b, ns, r, ti in ((55.3, 57.6, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4), (57.6, 59.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], 34, 4), (59.0, 61.0, ['F2', 'C3', 'F3', 'A3', 'C4'], 41, 4)):
    k = (a - 55.3) / 5.0; pad(a, b, ns, .26 + .12 * k, att=.9, bright=1200 + 900 * k); arp(a, b, r, ti, .1 + .03 * k, .46 + .06 * k)
choir(55.8, 60.6, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.4)
for t_, nm, d_ in ((55.5, 'A4', 1.4), (56.6, 'C5', 1.4), (57.7, 'D5', 1.4), (58.8, 'F5', 2.0)): solo(t_, nm, d_, .28, att=.4, bright=2000); pno(t_, nm, d_ + .8, .36, .65)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'F5', 'C5', 'A4')): B['harp'].add(pluck(M(nm)), 58.4 + .26 * k_, .26, pan=-.3 + .1 * k_)
bell(58.6, 'F6', .2); bell(59.4, 'A6', .18, d=4.2)

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
    sf.write(f'/home/claude/music/out11/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out11/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

