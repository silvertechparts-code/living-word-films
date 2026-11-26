"""Episode 36 (Genesis 36, the family of Esau) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): a calm, golden opening (a1) -> warm, gentle arpeggios for the household (a2) -> the herds grow and the land grows too small (b1) -> the parting: a steady walk, the ford, the arrival in Seir (b2) -> the family grows on the hill, a warm swell (c1) -> dusk among the people of Seir (c2) -> night, a solemn low horn for the kings (d1) -> a quiet resolve for the clans and their places (e1) -> a soft, warm reflection -> the question.
Nothing is scored as spectacle: the peak is the family gathered on the hill; the kings are solemn, not triumphant.
Outputs: out36/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out36', exist_ok=True)
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






# ================================================================== 0 - 6.2  a1: the family line of Esau, who is Edom (36:1): a calm, golden opening, a low drone and a quiet voice
drone(0, 6.4, FQ('D1'), .15, att=1.6, rel=1.8)
pad(0.2, 3.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1300)
solo(0.9, 'A4', 2.4, .18, att=.9, bright=1200); pno(2.0, 'C5', 2.8, .11, .44); solo(3.0, 'F4', 2.0, .16, att=.7, bright=1200)
bell(1.4, 'F6', .08, d=4.6)
pad(3.6, 6.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.8, bright=1100)
solo(4.3, 'D5', 2.0, .16, att=.5, bright=1200); pno(5.0, 'Bb4', 2.4, .09, .4)

# ================================================================== 6.2 - 14.5  a2: Esau took three wives; they bore him sons in Canaan (36:2-5): warm, gentle arpeggios
pad(6.2, 10.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1200)
arp(6.4, 10.4, 41, 4, .07, .42)
solo(7.2, 'C5', 2.2, .15, att=.7, bright=1200); bell(8.6, 'F6', .07, d=4.6)
pad(10.4, 14.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1100)
arp(10.4, 14.4, 38, 3, .07, .42)
solo(11.4, 'D5', 2.2, .15, att=.7, bright=1100); pno(13.0, 'A4', 2.6, .09, .4)

# ================================================================== 14.5 - 21.8  b1: the household and the herds grew so large that the land could not hold his and Jacob's together (36:6-7): a slow growth, an unease that tightens, then a held breath
pad(14.5, 18.4, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .3, att=1.0, bright=1000)
for k_ in range(8): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 16.0 + .6 * k_, .03 + .006 * k_)
trem_pad(16.2, 20.4, ['G2', 'D3', 'Bb3'], .13, 6.2)
solo(15.4, 'D5', 2.2, .15, att=.7, bright=1000); solo(17.2, 'Bb4', 2.0, .17, att=.5, bright=1100); solo(18.8, 'G4', 1.8, .16, att=.5, bright=1100)
pad(18.4, 22.2, ['C2', 'G2', 'C3', 'F3', 'G3'], .3, att=.9, bright=1000)
pno(19.6, 'F5', 2.4, .09, .4); solo(20.4, 'C5', 1.8, .15, att=.6, bright=1000)

# ================================================================== 21.8 - 31.6  b2: Esau took his wives, children and livestock and moved to the hill country of Seir, away from his brother (36:6-8): a wistful parting, a steady walk, the ford, the arrival
for k_ in range(10): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 22.4 + .9 * k_, .04)
pad(21.8, 26.2, ['C2', 'G2', 'C3', 'G3', 'D4'], .3, att=.9, bright=1000)
solo(22.6, 'G4', 2.4, .17, att=.8, bright=1000); pno(24.2, 'Eb5', 2.6, .09, .4); solo(24.8, 'D5', 2.0, .16, att=.6, bright=1100)
pad(26.2, 30.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.9, bright=1300)
choir(26.6, 30.0, ['D4', 'F4', 'Bb4'], .28, 'oo', att=1.0)
B['brass'].add(horn(M('Bb2') / 2, 3.2, att=.9, rel=1.2, peak=1300), 26.8, .14, pan=.1)
bell(27.4, 'F6', .12); bell(28.8, 'D6', .12)
pad(29.8, 32.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.8, bright=1300)
solo(30.2, 'A4', 2.0, .17, att=.6, bright=1200); pno(30.8, 'C5', 2.4, .09, .4)

# ================================================================== 31.6 - 40.1  c1: his family grew; his sons and grandsons became chiefs of clans in Edom (36:9-19): the warm swell, the family gathered on the hill
pad(31.6, 35.8, ['F2', 'C3', 'F3', 'A3', 'C4', 'G4'], .34, att=.8, bright=1500)
solo(32.4, 'C5', 1.8, .17, att=.5, bright=1500); solo(33.8, 'F5', 1.6, .18, att=.4, bright=1700); solo(35.2, 'A5', 1.8, .17, att=.4, bright=1800)
choir(33.6, 38.0, ['A3', 'C4', 'F4', 'A4'], .34, 'ah', att=1.0)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_) / 2, 3.2, att=.8, rel=1.2, peak=1700), 34.8, .15, pan=.1)
for k_, g_ in enumerate((.04, .06, .08, .1, .12)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), 35.0 + .55 * k_, g_)
B['timp'].add(S.timpani(FQ('Bb1'), 3.0, 1.0), 37.4, .2); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.4), 37.4, .18)
bell(36.0, 'F6', .16); bell(37.4, 'D6', .16)
pad(37.8, 40.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1300)
solo(38.4, 'D5', 2.0, .17, att=.6, bright=1200); pno(39.0, 'F5', 2.4, .09, .4)

# ================================================================== 40.1 - 45.8  c2: the people who lived in Seir before him, and their clans (36:20-30): dusk, a hush, small fires
pad(40.1, 44.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=1.0, bright=1000)
solo(41.0, 'Db5', 2.4, .16, att=.8, bright=900); bell(41.8, 'F6', .07, d=4.8); pno(42.6, 'Ab4', 2.8, .09, .38)
pad(44.0, 46.4, ['C2', 'G2', 'C3', 'Eb3', 'G3'], .3, att=.8, bright=900)
solo(44.4, 'Eb5', 2.0, .15, att=.7, bright=900)

# ================================================================== 45.8 - 53.0  d1: the kings who ruled in Edom before any king ruled over Israel (36:31-39): night, a solemn low horn, a slow heartbeat
drone(45.4, 53.4, FQ('D1'), .2, att=.5, rel=2.2)
for k_ in range(6): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 46.4 + 1.1 * k_, .06)
pad(46.0, 50.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=900)
for t_, m_, d_ in ((46.2, 'D3', 3.0), (48.8, 'F3', 2.6)): B['brass'].add(horn(M(m_) / 2, d_, att=.9, rel=1.4, peak=1200), t_, .18, pan=.1)
B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 46.2, .14)
solo(47.2, 'F4', 2.2, .16, att=.8, bright=900); bell(48.0, 'F6', .07, d=4.8); pno(49.2, 'A4', 2.8, .09, .38)
pad(50.0, 53.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=1.0, bright=1000)
solo(50.8, 'D5', 2.2, .16, att=.8, bright=1000); pno(51.8, 'F5', 2.6, .09, .4)

# ================================================================== 53.0 - 61.8  e1: the chapter closes with the clans of Esau, by their families and places (36:40-43): quiet, a gentle resolve into the mist
pad(53.0, 57.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1100)
solo(53.8, 'C5', 2.2, .16, att=.7, bright=1000); pno(55.0, 'A4', 2.6, .09, .4); solo(55.8, 'F5', 2.0, .15, att=.6, bright=1200)
pad(57.0, 61.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=1.0, bright=1100)
solo(57.8, 'D5', 2.2, .16, att=.7, bright=1100); bell(59.0, 'F6', .09, d=4.8); pno(59.6, 'Bb4', 2.6, .09, .4)

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
    sf.write(f'/home/claude/music/out36/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out36/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

