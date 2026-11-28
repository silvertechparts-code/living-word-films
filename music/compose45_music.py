"""Episode 45 (Genesis 45, I Am Joseph) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): Joseph cannot hold back, sends everyone out and weeps (a1, hushed, then a solo string) -> 'I am Joseph' (a2, the reveal, then a held, unanswered question) -> 'come closer' (b1, tender, a shadow at 'whom you sold') -> 'do not be angry; God sent me ahead to save lives' (b2, warm, a rising theme) -> 'it was God, not you' and Goshen (c1, noble then pastoral) -> the embrace, the first peak (c2) -> Pharaoh is glad (d1, bright and stately) -> Canaan: Jacob does not believe, the wagons, 'I will go and see him before I die' (d2, dry hush, then the second peak) -> the shared reflection and question.
Outputs: out45/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out45', exist_ok=True)
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






# ================================================================== 0 - 7.8  Joseph cannot hold back; he sends everyone out; he weeps so loudly the Egyptians hear (45:1-2): hushed, then a solo string that breaks open
drone(0, 8.4, FQ('D1'), .16, att=1.2, rel=1.8)
pad(0.2, 8.0, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .26, att=.9, bright=900)
trem_pad(0.6, 7.9, ['D3', 'A3', 'F4'], .07, 5.0)
bell(1.0, 'A6', .08, d=4.6); B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), 2.8, .10); B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), 3.4, .09)
solo(3.0, 'Ab4', 2.0, .12, att=.5, bright=900)
choir(4.6, 8.2, ['D4', 'F4', 'A4'], .20, 'oo', att=1.3); solo(4.8, 'A4', 1.6, .18, att=.3, bright=1100); solo(6.2, 'F4', 2.0, .18, att=.3, bright=1000)
bell(5.6, 'F6', .10, d=4.6); B['timp'].add(S.timpani(FQ('D1'), 2.0, .8), 4.9, .18)
# ================================================================== 7.8 - 14.9  'I am Joseph' (45:3): the reveal, then 'is my father still alive?', then a held silence: they cannot answer
B['timp'].add(S.timpani(FQ('Bb1'), 2.6, 1.0), 8.35, .34); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.0), 8.35, .30)
pad(8.3, 14.9, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .36, att=.5, bright=1500)
for m_ in ('F3', 'Bb3', 'D4'): B['brass'].add(horn(M(m_), 2.8, att=.35, rel=1.4, peak=1700), 8.35, .17, pan=-.2 + .1 * (nn(m_) % 4))
bell(8.45, 'F6', .16, d=4.6); bell(8.9, 'D7', .08, d=4.6)
choir(9.0, 12.2, ['D4', 'F4', 'Bb4'], .22, 'oo', att=1.0)
solo(10.1, 'D5', 1.8, .16, att=.4, bright=1300); solo(11.4, 'F5', 1.8, .15, att=.4, bright=1300); pno(10.3, 'Bb4', 2.0, .08, .44)
pad(12.0, 15.2, ['D2', 'A2', 'D3', 'G3', 'A3'], .30, att=.9, bright=1000)       # suspended: no answer
drone(12.2, 15.4, FQ('D1'), .15, att=1.2, rel=1.4); bell(12.8, 'A6', .08, d=4.6)
# ================================================================== 14.9 - 20.9  'come closer'; 'your brother whom you sold into Egypt' (45:4): tender, then a shadow
pad(14.9, 18.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.7, bright=1300)
pno(15.2, 'F4', 2.4, .10, .46); pno(16.0, 'A4', 2.2, .09, .44); pno(16.8, 'C5', 2.2, .09, .44); bell(15.3, 'C6', .10, d=4.4)
choir(15.4, 18.8, ['F3', 'A3', 'C4', 'F4'], .20, 'oo', att=1.2); solo(16.4, 'C5', 2.0, .14, att=.5, bright=1300)
pad(18.4, 21.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .30, att=.7, bright=900)           # 'whom you sold': the old wound
solo(18.6, 'D5', 1.8, .13, att=.4, bright=1000); bell(19.0, 'A6', .08, d=4.6); B['timp'].add(S.timpani(FQ('D1'), 1.6, .6), 18.5, .10)
# ================================================================== 20.9 - 27.1  'do not be angry with yourselves'; 'God sent me ahead to save lives' (45:5): warm, a small theme begins to rise
pad(20.9, 27.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1400)
pno(21.3, 'D5', 2.2, .09, .46); pno(22.5, 'F5', 2.2, .09, .46)
choir(21.6, 24.2, ['F3', 'Bb3', 'D4', 'F4'], .22, 'oo', att=1.0)
pad(23.0, 27.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.7, bright=1800)
choir(23.4, 27.4, ['F3', 'A3', 'C4', 'F4', 'A4'], .30, 'ah', att=.9)
solo(23.2, 'C5', 2.4, .17, att=.5, bright=1600); pno(24.3, 'A5', 2.4, .14, .55); bell(23.5, 'F6', .12, d=4.4); bell(25.0, 'A6', .10, d=4.4)
# ================================================================== 27.1 - 34.2  'it was God, not you' (45:8); 'come and live in Goshen, near me' (45:10): noble, then pastoral
pad(27.1, 30.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .36, att=.7, bright=1700)
for m_ in ('Bb3', 'D4', 'F4'): B['brass'].add(horn(M(m_), 2.6, att=.45, rel=1.3, peak=1700), 27.4, .15, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('Bb1'), 2.0, .8), 27.4, .16); bell(27.5, 'F6', .12, d=4.4); solo(28.0, 'D5', 2.0, .17, att=.4, bright=1500)
pad(30.2, 34.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.7, bright=2000)
arp(30.2, 34.0, 41, 4, .11, .50)
pno(30.6, 'C5', 2.2, .11, .5); pno(31.8, 'A4', 2.2, .10, .5); pno(32.8, 'F5', 2.4, .11, .52); bell(30.4, 'C6', .12, d=4.4); bell(32.4, 'A6', .10, d=4.4)
solo(31.0, 'F5', 2.6, .15, att=.5, bright=1700)
# ================================================================== 34.2 - 40.0  the embrace (45:14-15): the first peak, then they talk
pad(34.0, 38.0, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .46, att=.5, bright=2200)
choir(34.4, 38.0, ['F3', 'A3', 'C4', 'F4', 'A4'], .38, 'ah', att=.8)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.0, att=.4, rel=1.3, peak=2000), 34.6, .20, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 3.0, .9), 34.6, .24); B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 34.6, .24)
solo(35.2, 'C5', 2.4, .20, att=.4, bright=1900); pno(36.0, 'A5', 2.4, .15, .56)
for t_, nm, g_ in ((35.0, 'F6', .16), (36.4, 'A6', .15), (37.4, 'C7', .12)): bell(t_, nm, g_, d=4.4)
pad(37.8, 40.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1300)         # 'then they talked': settling
pno(38.4, 'D5', 2.0, .09, .44); pno(39.2, 'F5', 2.0, .08, .42)
# ================================================================== 40.0 - 47.6  Pharaoh is glad; 'bring your father and families'; 'the best of Egypt' (45:16-20): bright and stately
pad(40.0, 47.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.5, bright=2000)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 2.8, att=.4, rel=1.3, peak=2000), 40.3, .17, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 40.3, .20); bell(40.4, 'A6', .14, d=4.4); bell(41.8, 'C7', .12, d=4.4)
arp(40.6, 44.0, 41, 4, .10, .50)
choir(42.0, 47.8, ['A3', 'C4', 'F4', 'A4'], .28, 'ah', att=.9); solo(42.4, 'F5', 2.2, .15, att=.4, bright=1700)
pad(44.2, 47.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'Bb3'], .36, att=.5, bright=2000)
B['timp'].add(S.timpani(FQ('Bb1'), 2.4, .9), 44.35, .20); bell(44.5, 'D7', .12, d=4.4); pno(45.0, 'F5', 2.2, .11, .5)
# ================================================================== 47.6 - 60  Canaan: Jacob does not believe; the wagons; 'I will go and see him before I die' (45:25-28): a dry hush, a held doubt, then the second peak
pad(47.3, 52.6, ['D2', 'A2', 'D3', 'G3', 'A3'], .28, att=.9, bright=1000)
drone(47.4, 53.8, FQ('D1'), .17, att=1.4, rel=1.6)
solo(48.6, 'A4', 2.6, .13, att=.6, bright=900); bell(49.6, 'D6', .09, d=4.6); solo(50.8, 'F4', 2.4, .13, att=.5, bright=900)
trem_pad(52.1, 54.6, ['D3', 'A3', 'F4'], .11, 6.2)
pad(52.4, 54.9, ['D2', 'A2', 'Ab2', 'D3', 'F3', 'B3'], .30, att=.5, bright=1000)     # 'he did not believe them'
B['brass'].add(horn(M('D3') / 2, 2.6, att=.7, rel=1.3, peak=1300), 52.3, .14, pan=.1)
for k_, g_ in enumerate((.05, .06, .07)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 53.0 + .6 * k_, g_)
pad(54.4, 57.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.7, bright=1500)          # 'until he saw the wagons': a light opens
pno(54.8, 'D5', 2.2, .09, .46); pno(55.6, 'F5', 2.2, .10, .48); pno(56.4, 'A5', 2.2, .10, .5); bell(54.6, 'F6', .12, d=4.4); bell(56.0, 'A6', .11, d=4.4)
solo(55.2, 'D5', 2.4, .16, att=.4, bright=1500)
B['timp'].add(S.timpani(FQ('F1'), 3.2, 1.0), 57.3, .34); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 57.3, .36)
pad(57.2, 60.6, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .44, att=.5, bright=2300)       # 'I will go and see him before I die'
choir(57.4, 60.6, ['F3', 'A3', 'C4', 'F4', 'A4'], .36, 'ah', att=.7)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.2, att=.4, rel=1.5, peak=2100), 57.4, .20, pan=-.2 + .1 * (nn(m_) % 4))
solo(58.0, 'C5', 2.2, .18, att=.4, bright=1800); bell(58.2, 'F6', .15, d=4.4); bell(59.0, 'A6', .13, d=4.4)

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
    sf.write(f'/home/claude/music/out45/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out45/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

