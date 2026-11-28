"""Episode 43 (Genesis 43, Judah Steps Forward) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): the famine and Jacob's order (a1, dry and hollow) -> Judah pledges himself (a2, plain and resolute) -> gifts, double silver and Jacob's prayer (b1, reverent) -> the road, Joseph sees Benjamin (b2, warm) -> the silver in the sacks, the steward's peace, Simeon freed (c1, fear then relief) -> Joseph comes home (c2, tender) -> he weeps (d1, the peak) -> the meal (d2, settled) -> the shared reflection and question.
Outputs: out43/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out43', exist_ok=True)
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






# ================================================================== 0 - 7.4  the famine grows; Jacob says: go back and buy us more food (43:1-2): a dry, hollow dawn; five soft timpani
drone(0, 8.0, FQ('D1'), .16, att=1.4, rel=1.8)
pad(0.2, 7.6, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .27, att=1.0, bright=900)
trem_pad(0.4, 7.6, ['D3', 'A3', 'F4'], .07, 5.0)
bell(0.8, 'A6', .09, d=4.6); bell(2.6, 'F6', .07, d=4.6); solo(1.6, 'Ab4', 2.4, .11, att=.6, bright=900)
for k_, g_ in enumerate((.04, .05, .06, .07, .08)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 3.2 + .4 * k_, g_)
solo(4.4, 'F4', 2.2, .13, att=.5, bright=1000)
# ================================================================== 7.4 - 17.2  Judah steps forward: send the boy with me, I will be responsible, let me bear the blame (43:8-9): plain and resolute, a quiet rise
pad(7.4, 11.4, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .28, att=.8, bright=1000)
solo(8.0, 'Bb4', 2.6, .13, att=.7, bright=1000); pno(9.6, 'D5', 2.0, .08, .4)
pad(11.2, 17.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1200)
trem_pad(11.4, 14.6, ['Bb2', 'F3', 'D4'], .08, 5.6)
choir(13.2, 17.4, ['D4', 'F4', 'A4'], .22, 'oo', att=1.2)
pno(13.6, 'F5', 2.2, .1, .46); solo(14.4, 'D5', 2.4, .16, att=.5, bright=1300); bell(15.0, 'F6', .1, d=4.6)
B['timp'].add(S.timpani(FQ('Bb1'), 2.0, .7), 13.4, .1)
# ================================================================== 17.0 - 25.2  Jacob sends gifts, double the silver and Benjamin; he prays for mercy (43:11-14): reverent, a rising choir
pad(17.0, 25.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.7, bright=1500)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'A4')): pno(18.2 + .6 * k_, nm, 1.8, .08, .42, pan=-.3 + .2 * k_)
bell(18.0, 'F6', .12, d=4.4)
choir(21.4, 25.4, ['F3', 'A3', 'C4', 'F4'], .28, 'ah', att=1.0); bell(21.8, 'A6', .1, d=4.4); bell(23.4, 'C7', .09, d=4.4)
B['brass'].add(horn(M('F3') / 2, 3.0, att=.8, rel=1.2, peak=1300), 21.6, .13, pan=.1)
# ================================================================== 24.8 - 26.4  the road to Egypt: a slow steady march
pad(24.8, 26.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=.5, bright=1200)
for k_ in range(3): B['timp'].add(S.timpani(FQ('D1'), .9, .5), 24.9 + .5 * k_, .08)
for k_, nm in enumerate(('D4', 'F4', 'A4')): pno(25.0 + .5 * k_, nm, 1.4, .07, .4)
# ================================================================== 26.4 - 31.4  Joseph sees Benjamin and orders a meal (43:16): a warm, bright recognition
pad(26.4, 31.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.6, bright=1800)
choir(27.2, 31.6, ['F3', 'A3', 'C4'], .22, 'oo', att=1.0)
bell(27.3, 'F6', .14, d=4.4); bell(29.0, 'A6', .1, d=4.4); pno(28.0, 'C5', 2.2, .12, .5); pno(29.6, 'A5', 2.0, .1, .46)
# ================================================================== 31.3 - 35.6  the brothers fear the silver in their sacks (43:18): tension
pad(31.3, 35.8, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .3, att=.5, bright=900)
trem_pad(31.5, 35.8, ['D3', 'A3', 'F4'], .11, 6.4)
for k_, g_ in enumerate((.05, .06, .07, .08, .09)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 32.0 + .5 * k_, g_)
B['brass'].add(horn(M('D3') / 2, 3.0, att=.8, rel=1.2, peak=1300), 32.4, .15, pan=.1)
solo(34.0, 'Ab4', 1.8, .13, att=.4, bright=900)
# ================================================================== 35.6 - 42.0  the steward: peace to you, do not be afraid; Simeon comes out (43:23): relief, a softening choir
pad(35.6, 42.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.9, bright=1700)
choir(36.0, 42.2, ['F3', 'A3', 'C4', 'F4'], .28, 'oo', att=1.0)
bell(36.4, 'A6', .11, d=4.4); bell(38.6, 'C7', .1, d=4.4); pno(37.0, 'A4', 2.2, .1, .46); pno(39.2, 'C5', 2.2, .1, .46)
B['brass'].add(horn(M('F3') / 2, 3.2, att=.6, rel=1.2, peak=1500), 39.6, .16, pan=.1)
# ================================================================== 42.0 - 48.8  Joseph comes home, the brothers bow, 'God be gracious to you, my son' (43:26-29): tender, building
pad(42.0, 45.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.7, bright=1500)
choir(42.6, 45.6, ['F3', 'A3', 'C4'], .22, 'oo', att=1.0); bell(43.0, 'F6', .1, d=4.4)
pad(45.4, 49.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1700)
solo(45.8, 'D5', 2.6, .16, att=.5, bright=1400); pno(46.6, 'F5', 2.2, .12, .5); bell(47.0, 'A6', .1, d=4.6)
# ================================================================== 48.6 - 54.2  overcome with feeling, Joseph hurries out and weeps (43:30): the emotional peak, warm and full
pad(48.6, 54.4, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .44, att=.5, bright=2200)
choir(48.8, 54.4, ['F3', 'A3', 'C4', 'F4', 'A4'], .38, 'ah', att=.8)
for m_ in ('F3', 'A3', 'C4', 'F4'): B['brass'].add(horn(M(m_) / 2, 3.2, att=.5, rel=1.2, peak=1800), 49.6, .24, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 3.0, .9), 49.6, .24)
solo(49.4, 'C5', 2.4, .2, att=.4, bright=1800); pno(50.6, 'A5', 2.4, .16, .55)
for t_, nm, g_ in ((49.0, 'F6', .18), (50.4, 'A6', .16), (51.8, 'C7', .14)): bell(t_, nm, g_, d=4.4)
# ================================================================== 54.0 - 61.4  he washes his face, the meal is served, Benjamin's portion five times larger (43:31-34): warm and settled, opening toward the reflection
pad(54.0, 58.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.9, bright=1400)
for k_, nm in enumerate(('D5', 'F5', 'A5', 'F5', 'D5')): pno(54.6 + .6 * k_, nm, 1.8, .08, .4, pan=-.3 + .12 * k_)
bell(55.2, 'D6', .09, d=4.6); bell(56.8, 'F6', .08, d=4.6)
drone(56.8, 61.4, FQ('D1'), .2, att=1.0, rel=2.0)
pad(58.2, 61.4, ['D2', 'A2', 'D3', 'F3'], .24, att=.9, bright=900)
B['timp'].add(S.timpani(FQ('D1'), 3.0, .9), 59.4, .16); solo(58.4, 'D5', 2.6, .14, att=.5, bright=900)

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
    sf.write(f'/home/claude/music/out43/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out43/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

