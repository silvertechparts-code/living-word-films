"""Episode 37 (Genesis 37, Joseph sold by his brothers) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): a warm golden opening (a1) -> unease, then the dream as shimmering bells and a rising choir (a2) -> the rebuke and the walk to Dothan (b1) -> a low pulse as the brothers see him coming (b2) -> Reuben's one hopeful note, the robe stripped, the pit (c1) -> the swell and the peak at the sale for twenty pieces of silver (c2) -> the dusk fire, the blood on the robe (d1) -> Jacob's solemn mourning, sparse and low (d2) -> the caravan walks on, a gentle resolve into the mist (e1).
The peak is the sale; nothing is scored as triumph.
Outputs: out37/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out37', exist_ok=True)
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






# ================================================================== 0 - 6.5  a1: Joseph at seventeen; Jacob loved him most and gave him a fine robe (37:2-3): a calm golden opening, a low drone and a quiet voice
drone(0, 6.8, FQ('D1'), .15, att=1.6, rel=1.8)
pad(0.2, 3.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1300)
solo(0.9, 'A4', 2.4, .18, att=.9, bright=1200); pno(2.0, 'C5', 2.8, .11, .44); solo(3.0, 'F4', 2.0, .16, att=.7, bright=1200)
bell(1.4, 'F6', .08, d=4.6); bell(4.8, 'A6', .07, d=4.6)
pad(3.6, 7.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.8, bright=1100)
solo(4.3, 'D5', 2.0, .16, att=.5, bright=1200); pno(5.0, 'Bb4', 2.4, .09, .4)

# ================================================================== 6.6 - 14.5  a2: his brothers hated him (37:4); the dream of the sun, the moon and eleven stars (37:9): unease, then shimmering bells and a rising choir
pad(6.6, 10.0, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .3, att=.9, bright=900)
trem_pad(7.2, 10.2, ['G2', 'D3', 'Bb3'], .12, 6.0)
B['brass'].add(horn(M('G2') / 2, 2.8, att=.9, rel=1.2, peak=1000), 7.4, .14, pan=.1)
solo(8.0, 'Bb4', 1.8, .15, att=.6, bright=1000); solo(9.2, 'D5', 1.6, .14, att=.5, bright=1000)
pad(9.8, 14.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1600)
for t_, nm, g_ in ((10.2, 'F6', .16), (10.8, 'A6', .14), (11.3, 'C7', .14), (11.9, 'A6', .14), (12.4, 'F6', .16), (12.9, 'C7', .16), (13.4, 'A6', .14)): bell(t_, nm, g_, d=4.4)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A5', 'C6')): pno(10.4 + .42 * k_, nm, 2.4, .14, .5, pan=-.4 + .16 * k_)
choir(11.2, 14.8, ['A3', 'C4', 'F4', 'A4'], .3, 'oo', att=1.4)
solo(12.2, 'C5', 2.0, .16, att=.8, bright=1700)

# ================================================================== 14.3 - 21.5  b1: his father rebuked him but kept the matter in mind (37:10-11); Jacob sent him to his brothers (37:13): a stern chord, then a gentle walk
pad(14.3, 18.4, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .3, att=.7, bright=1000)
for k_ in range(5): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 14.6 + .7 * k_, .04 + .006 * k_)
solo(15.2, 'D5', 2.0, .15, att=.6, bright=1000); solo(16.8, 'Bb4', 2.0, .15, att=.5, bright=1000)
pad(18.4, 22.2, ['C2', 'G2', 'C3', 'F3', 'G3'], .3, att=.9, bright=1100)
for k_ in range(8): pno(18.6 + .45 * k_, ['C5', 'G4', 'D5', 'G4'][k_ % 4], 1.4, .08, .4, pan=-.3 + .08 * k_)
solo(19.6, 'G4', 1.8, .15, att=.6, bright=1100)

# ================================================================== 21.6 - 27.0  b2: the brothers see him coming: Here comes that dreamer (37:18-20): a low pulse, tremolo and a dark horn
drone(21.6, 27.4, FQ('D1'), .18, att=.8, rel=1.4)
for k_ in range(11): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 22.0 + .5 * k_, .04 + .006 * k_)
pad(21.8, 26.6, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .3, att=.8, bright=900)
trem_pad(22.2, 26.8, ['D2', 'A2', 'F3'], .14, 6.8)
B['brass'].add(horn(M('D3') / 2, 3.0, att=.9, rel=1.4, peak=1100), 22.4, .17, pan=.1)
solo(23.4, 'Ab4', 2.0, .15, att=.7, bright=900); pno(25.0, 'F4', 1.8, .08, .4)

# ================================================================== 27.0 - 34.0  c1: Reuben: do not take his life (37:21-22); they stripped off his robe and threw him into an empty pit (37:23-24): one hopeful note, then drums and a dark swell
pad(27.0, 30.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.7, bright=1000)
solo(27.6, 'A4', 2.2, .18, att=.5, bright=1100); pno(28.6, 'C5', 2.4, .09, .4)
pad(30.2, 34.4, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .34, att=.5, bright=900)
for k_, g_ in enumerate((.05, .07, .09, .11)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 30.3 + .5 * k_, g_)
B['timp'].add(S.timpani(FQ('Bb1'), 2.6, 1.0), 32.4, .22); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.2), 32.4, .2)
choir(31.0, 34.4, ['D4', 'F4', 'Ab4'], .26, 'oo', att=.9)
B['brass'].add(horn(M('D3') / 2, 3.2, att=.7, rel=1.3, peak=1200), 30.4, .16, pan=.1)

# ================================================================== 34.0 - 41.5  c2: Judah: let us sell him (37:26-27); drawn up from the pit and sold for twenty pieces of silver (37:28): the swell and the peak
pad(34.0, 38.2, ['G2', 'D3', 'G3', 'Bb3', 'D4', 'F4'], .36, att=.7, bright=1500)
choir(34.6, 39.0, ['G3', 'Bb3', 'D4', 'G4'], .36, 'ah', att=1.0)
for m_ in ('G3', 'D4'): B['brass'].add(horn(M(m_) / 2, 3.4, att=.8, rel=1.2, peak=1700), 35.6, .16, pan=.1)
for k_, g_ in enumerate((.05, .07, .09, .11, .13, .15)): B['timp'].add(S.timpani(FQ('G1'), 1.0, .5), 35.4 + .5 * k_, g_)
B['timp'].add(S.timpani(FQ('D1'), 3.0, 1.0), 38.4, .3); B['sub'].add(S.sub_boom(FQ('D1'), 3.6), 38.4, .26)
for m_ in ('D3', 'A3', 'D4', 'F4'): B['brass'].add(horn(M(m_), 3.0, att=.35, rel=1.2, peak=2300), 38.4, .24, pan=-.2 + .1 * (nn(m_) % 4))
pad(38.4, 42.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .34, att=.4, bright=1500)
solo(38.8, 'F5', 2.2, .18, att=.4, bright=1700)
for k_ in range(10): bell(39.4 + .2 * k_, ['D7', 'A6', 'F6', 'C7', 'E6'][k_ % 5], .07 + .006 * k_, d=2.2)

# ================================================================== 43.0 - 47.8  d1: the brothers dipped his robe in the blood of a goat and sent it to Jacob (37:31-32): dusk, a low horn, a slow heartbeat
drone(42.6, 48.0, FQ('D1'), .2, att=.5, rel=2.0)
for k_ in range(5): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 43.6 + 1.0 * k_, .06)
pad(43.0, 47.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.9, bright=900)
B['brass'].add(horn(M('Bb2') / 2, 3.4, att=.9, rel=1.4, peak=1100), 43.4, .17, pan=.1)
solo(44.4, 'Db5', 2.2, .15, att=.8, bright=900); bell(45.4, 'F6', .06, d=4.8); pno(46.2, 'Ab4', 2.4, .08, .38)

# ================================================================== 47.8 - 55.2  d2: Jacob tore his clothes and mourned; he refused to be comforted (37:33-35): solemn, sparse, low
pad(47.8, 51.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .28, att=1.0, bright=800)
solo(48.4, 'F4', 2.6, .17, att=.9, bright=800); pno(50.0, 'D4', 2.8, .09, .38)
B['brass'].add(horn(M('F3') / 2, 3.0, att=.9, rel=1.4, peak=1000), 49.4, .15, pan=.1)
choir(51.0, 55.4, ['A3', 'C4', 'F4'], .22, 'oo', att=1.4)
pad(51.6, 55.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=1.0, bright=900)
solo(52.4, 'D5', 2.2, .15, att=.8, bright=900); pno(53.6, 'Bb4', 2.6, .08, .38); bell(54.4, 'F6', .07, d=4.8)

# ================================================================== 55.2 - 61.8  e1: in Egypt the traders sold Joseph to Potiphar (37:36): the caravan walks on, a gentle resolve into the mist
for k_ in range(8): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 55.4 + .8 * k_, .035)
pad(55.2, 58.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1100)
solo(56.0, 'C5', 2.2, .15, att=.7, bright=1000); pno(57.2, 'A4', 2.4, .08, .4)
pad(58.8, 61.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=1.0, bright=1100)
solo(59.2, 'D5', 2.0, .15, att=.7, bright=1100); bell(59.6, 'F6', .09, d=4.8); pno(60.4, 'Bb4', 2.4, .08, .4)

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
THEME = [(61.4, 'C5', 1.6), (63.2, 'A4', 1.4), (65.0, 'D5', 1.6), (66.8, 'F5', 1.4), (68.6, 'D5', 1.2), (70.0, 'F5', 1.2), (71.4, 'G5', 1.8), (73.4, 'E5', 1.2), (74.8, 'F5', 1.6),
         (76.2, 'A5', 1.2), (77.6, 'Bb5', 1.6), (79.2, 'D6', 1.2), (80.4, 'F6', 1.2), (81.6, 'D6', 1.0), (82.5, 'E6', 1.0)]
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
    sf.write(f'/home/claude/music/out37/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out37/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

