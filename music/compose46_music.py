"""Episode 46 (Genesis 46, Do Not Be Afraid to Go Down to Egypt) score -- original, synthesised with numpy.
Arc (written in F, sounding in Eb): dusk, the caravan reaches Beersheba and Jacob offers sacrifices (a1, warm and hushed) -> God speaks in visions of the night, 'Jacob, Jacob' / 'Here I am' (a2, a shimmering night, a held call) -> 'do not be afraid to go down to Egypt; I will make you a great nation there' (b1, tender, then a noble rise) -> 'I myself will go down with you and bring you up again; Joseph will close your eyes' (b2, the warm heart of the episode, then a hush) -> Jacob leaves Beersheba at dawn, the sons carry the family (c1, a pastoral march) -> the seventy who came to Egypt (c2, stately) -> Judah goes ahead; Joseph sets out in his chariot (d1, bright and rising) -> the embrace, the peak, he weeps a long time, 'now I can die' (d2, tender) -> the shared reflection and question.
Outputs: out46/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out46', exist_ok=True)
_nn0 = nn
nn = lambda n: _nn0(n) - 2     # everything below is written in F and sounds a whole tone lower, in Eb
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






# ================================================================== 0 - 8.0  dusk; Israel sets out with all that he has; Beersheba; he offers sacrifices to the God of his father Isaac (46:1): warm amber, hushed, a small fire lit
drone(0, 8.6, FQ('F1'), .15, att=1.2, rel=1.8)
pad(0.2, 8.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .28, att=1.0, bright=1100)
bell(1.0, 'C6', .08, d=4.6); solo(1.8, 'A4', 2.4, .13, att=.6, bright=1100)
arp(2.4, 7.2, 41, 4, .07, .42); B['timp'].add(S.timpani(FQ('F1'), 1.8, .6), 2.9, .09)
bell(4.4, 'F6', .10, d=4.6); choir(4.6, 8.2, ['F3', 'A3', 'C4'], .20, 'oo', att=1.3); solo(5.4, 'C5', 2.2, .15, att=.5, bright=1300); bell(6.2, 'A6', .08, d=4.6)
# ================================================================== 8.0 - 14.3  God speaks to Israel in visions of the night: 'Jacob, Jacob' - 'Here I am' (46:2): a shimmering night, a held call
pad(8.0, 14.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .30, att=.9, bright=900)
trem_pad(8.6, 13.8, ['D3', 'A3', 'F4'], .06, 5.4); drone(8.2, 14.6, FQ('D1'), .13, att=1.2, rel=1.4)
bell(8.8, 'A6', .09, d=4.6); choir(9.0, 12.4, ['D4', 'F4', 'A4'], .20, 'oo', att=1.2); solo(9.6, 'F5', 1.6, .13, att=.4, bright=1200)
B['timp'].add(S.timpani(FQ('D1'), 2.0, .8), 10.7, .20); bell(10.9, 'D6', .15, d=4.6); choir(10.9, 14.4, ['D4', 'F4', 'A4', 'D5'], .26, 'ah', att=.8)
solo(12.4, 'A4', 1.8, .14, att=.4, bright=1100); pno(12.9, 'D5', 2.0, .08, .44)
# ================================================================== 14.3 - 23.0  'Do not be afraid to go down to Egypt; there I will make you a great nation' (46:3): tender, then a noble rise
pad(14.3, 19.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.7, bright=1300)
pno(14.8, 'F4', 2.4, .10, .46); pno(15.8, 'A4', 2.2, .09, .44); pno(16.8, 'C5', 2.2, .09, .44); bell(15.2, 'C6', .10, d=4.4)
choir(15.0, 18.9, ['F3', 'A3', 'C4', 'F4'], .20, 'oo', att=1.2); solo(16.4, 'C5', 2.2, .14, att=.5, bright=1300)
pad(19.0, 23.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .36, att=.6, bright=1800)
for m_ in ('Bb3', 'D4', 'F4'): B['brass'].add(horn(M(m_), 2.8, att=.45, rel=1.3, peak=1800), 19.2, .15, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('Bb1'), 2.2, .8), 19.2, .16); bell(19.4, 'F6', .12, d=4.4); solo(19.8, 'D5', 2.2, .17, att=.4, bright=1600); pno(20.8, 'F5', 2.2, .11, .5); bell(21.6, 'A6', .10, d=4.4)
choir(20.0, 23.4, ['F3', 'Bb3', 'D4', 'F4'], .26, 'ah', att=1.0)
# ================================================================== 23.0 - 30.2  'I myself will go down with you, and I will bring you up again; Joseph will close your eyes' (46:4): the warm heart, then a hush
pad(23.0, 27.2, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .42, att=.6, bright=2000)
choir(23.2, 27.2, ['F3', 'A3', 'C4', 'F4', 'A4'], .34, 'ah', att=.8)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.0, att=.5, rel=1.4, peak=1900), 23.4, .16, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 2.6, .9), 23.3, .20); B['sub'].add(S.sub_boom(FQ('F1'), 2.6), 23.3, .18)
bell(23.5, 'F6', .14, d=4.4); bell(24.8, 'A6', .12, d=4.4); solo(23.8, 'C5', 2.4, .18, att=.4, bright=1800); pno(25.0, 'A5', 2.4, .13, .54)
pad(26.0, 30.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .30, att=.8, bright=1200)           # 'Joseph will close your eyes': a hush
solo(26.4, 'F5', 2.4, .15, att=.5, bright=1300); pno(27.2, 'D5', 2.0, .09, .44); bell(27.8, 'D6', .10, d=4.6); pno(28.6, 'F5', 2.0, .08, .42)
# ================================================================== 30.2 - 38.4  dawn: Jacob leaves Beersheba; his sons carry him, the little ones and the wives in the wagons (46:5): a pastoral march
pad(30.2, 38.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=2000)
arp(30.6, 37.8, 41, 4, .11, .50)
pno(30.8, 'C5', 2.2, .11, .5); pno(32.0, 'A4', 2.2, .10, .5); pno(33.4, 'F5', 2.4, .11, .52); bell(30.6, 'C6', .12, d=4.4); bell(33.0, 'A6', .10, d=4.4)
solo(31.4, 'F5', 2.6, .15, att=.5, bright=1700)
B['timp'].add(S.timpani(FQ('F1'), 1.6, .6), 32.4, .10); B['timp'].add(S.timpani(FQ('F1'), 1.6, .6), 33.4, .09)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 2.6, att=.5, rel=1.3, peak=1800), 34.0, .12, pan=-.2 + .1 * (nn(m_) % 4))
choir(34.4, 38.6, ['A3', 'C4', 'F4', 'A4'], .24, 'ah', att=1.0)
# ================================================================== 38.4 - 44.2  'seventy in all' came into Egypt (46:27), the ford: stately, a little awe
pad(38.2, 44.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1700)
B['timp'].add(S.timpani(FQ('Bb1'), 2.4, .8), 38.7, .16); bell(38.8, 'F6', .12, d=4.4); bell(40.0, 'A6', .11, d=4.4); bell(41.4, 'D7', .10, d=4.4)
choir(38.8, 44.2, ['F3', 'Bb3', 'D4', 'F4'], .26, 'ah', att=1.0); solo(39.2, 'D5', 2.2, .16, att=.4, bright=1500); pno(40.6, 'F5', 2.2, .10, .5)
pad(42.4, 44.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.6, bright=1700)             # the last stretch: the road to Goshen
# ================================================================== 44.2 - 51.4  Judah goes ahead (46:28); Joseph has his chariot made ready and sets out (46:29): bright and rising
pad(44.2, 52.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.5, bright=2000)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 2.8, att=.4, rel=1.3, peak=2000), 44.5, .15, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 44.4, .18); bell(44.6, 'A6', .12, d=4.4)
arp(44.6, 48.8, 41, 4, .10, .52); choir(46.0, 51.8, ['A3', 'C4', 'F4', 'A4'], .28, 'ah', att=.9); solo(46.4, 'F5', 2.2, .15, att=.4, bright=1700)
for k_, g_ in enumerate((.06, .08, .10, .13, .16, .20)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), 48.8 + .45 * k_, g_)
bell(47.2, 'C7', .12, d=4.4); bell(49.0, 'A6', .12, d=4.4); pno(49.8, 'C6', 2.0, .10, .52)
# ================================================================== 51.4 - 61.8  the embrace (46:29): the peak; he weeps a long time; 'Now I can die, since I have seen your face and you are alive' (46:30): tender, then a soft lift
B['timp'].add(S.timpani(FQ('F1'), 3.2, 1.0), 51.9, .34); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 51.9, .34)
pad(51.7, 55.6, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .46, att=.5, bright=2300)
choir(51.9, 55.6, ['F3', 'A3', 'C4', 'F4', 'A4'], .38, 'ah', att=.8)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.2, att=.4, rel=1.5, peak=2100), 52.0, .19, pan=-.2 + .1 * (nn(m_) % 4))
solo(52.4, 'C5', 2.4, .19, att=.4, bright=1900); bell(52.6, 'F6', .15, d=4.4); bell(53.6, 'A6', .13, d=4.4); pno(54.0, 'A5', 2.4, .13, .54)
pad(54.8, 59.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .30, att=.9, bright=1100)              # he wept a long time
solo(55.4, 'A4', 2.6, .16, att=.5, bright=1000); solo(57.0, 'F4', 2.2, .14, att=.5, bright=1000); pno(56.2, 'D5', 2.2, .08, .44); bell(56.6, 'D6', .09, d=4.6)
pad(57.4, 61.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1500)             # 'you are alive': a light opens
pno(58.0, 'F5', 2.2, .10, .48); solo(58.2, 'D5', 2.4, .15, att=.4, bright=1400); bell(58.6, 'F6', .11, d=4.4); pno(59.6, 'A5', 2.2, .09, .46)

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
    sf.write(f'/home/claude/music/out46/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out46/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

