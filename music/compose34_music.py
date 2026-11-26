"""Episode 34 (Genesis 34, Dinah and Shechem) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): a pastoral opening and the road to the city (a1) -> a held, empty gate (a2) -> Jacob's silence and his sons' anger (b1) -> Hamor's visit (b2) -> the sons' deceit, a creeping tension (c1) -> the men agree (c2) -> the third day, swords, the peak and a sudden hush (d1) -> Dinah led out, the plunder, Jacob's lament and the sons' question (e1) -> a soft, warm reflection -> the question.
Nothing is scored as violence: the score holds its breath at the gate and goes quiet.
Outputs: out34/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out34', exist_ok=True)
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





# ================================================================== 0 - 5.4  a1: Dinah went out to visit the women of the land (34:1): a calm, bright pastoral opening with one shadow in the last bar
drone(0, 5.6, FQ('D1'), .16, att=1.6, rel=1.8)
pad(0.2, 3.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1300)
solo(0.7, 'A4', 2.0, .2, att=.7, bright=1200); pno(1.4, 'F5', 2.8, .13, .46); solo(2.6, 'C5', 1.8, .18, att=.6, bright=1300)
bell(1.0, 'F6', .08, d=4.6)
pad(3.6, 6.0, ['D2', 'A2', 'D3', 'F3'], .28, att=.8, bright=900)
pno(4.2, 'Ab4', 2.6, .1, .4)

# ================================================================== 5.4 - 11.8  a2: Shechem saw her, seized her and lay with her by force (34:2): the gate stands empty; the score keeps nothing but a low note and a held breath
drone(5.4, 12.2, FQ('D1'), .2, att=1.0, rel=2.0)
B['timp'].add(S.timpani(FQ('D1'), 2.8, 1.0), 5.7, .16); B['sub'].add(S.sub_boom(FQ('D1'), 3.2), 5.7, .16)
trem_pad(6.4, 11.6, ['D2', 'A2', 'Db3'], .12, 5.6)
solo(7.4, 'Ab4', 2.4, .14, att=.9, bright=800); pno(9.4, 'F4', 3.0, .08, .36)
bell(9.0, 'D6', .05, d=5.0)

# ================================================================== 11.8 - 19.4  b1: Jacob heard it and held his peace; his sons came in from the field, grieved and very angry (34:5-7): a low, still chord, then a pulse of anger
pad(11.8, 15.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .28, att=1.2, bright=900)
solo(12.4, 'F4', 2.6, .16, att=.9, bright=800); pno(13.6, 'Db5', 3.0, .09, .38)
for k_ in range(7): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 15.7 + .5 * k_, .05 + .01 * k_)
pad(15.6, 19.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.6, bright=1200)
trem_pad(16.2, 19.6, ['D2', 'A2', 'F3'], .14, 6.4)
solo(16.8, 'D5', 1.8, .16, att=.4, bright=1100)

# ================================================================== 19.4 - 24.3  b2: Hamor came to speak with Jacob: his son longs for her, give her to him as wife (34:6-8): measured, courteous, uneasy
pad(19.4, 24.4, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .28, att=1.0, bright=1100)
solo(20.0, 'C5', 2.0, .17, att=.7, bright=1100); pno(21.4, 'F5', 2.6, .1, .42); solo(22.6, 'Ab4', 1.8, .16, att=.6, bright=1000)
B['timp'].add(S.timpani(FQ('F1'), 1.6, .6), 19.6, .08)

# ================================================================== 24.3 - 34.3  c1: the sons answered Shechem and Hamor deceitfully: we cannot give her to one uncircumcised; if every male is circumcised we will be one people (34:13-17): a creeping, low heartbeat
for k_ in range(24): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 24.4 + 1.0 * k_ if 24.4 + 1.0 * k_ < 34.2 else 33.9, .03 + .0035 * k_)
pad(24.3, 29.4, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=1.0, bright=1000)
pad(29.4, 34.6, ['C2', 'G2', 'C3', 'Eb3', 'G3'], .32, att=.8, bright=1300)
trem_pad(25.0, 29.6, ['Bb1', 'F2', 'Db3'], .13, 6.0); trem_pad(29.6, 34.6, ['C2', 'G2', 'Eb3'], .17, 6.8)
solo(25.6, 'F4', 2.0, .15, att=.6, bright=900); solo(28.0, 'Db5', 2.0, .15, att=.6, bright=1000); pno(26.8, 'Ab4', 2.6, .09, .4)
for t_, nm in ((30.0, 'C5'), (31.6, 'Eb5'), (33.0, 'G5')): solo(t_, nm, 1.8, .17, att=.4, bright=1300)
B['brass'].add(horn(M('C3') / 2, 4.0, att=1.2, rel=1.4, peak=900), 30.0, .12, pan=.1)

# ================================================================== 34.3 - 37.3  c2: the men of the city agreed to Hamor and Shechem and were circumcised (34:18-24): a held, listening chord
pad(34.3, 38.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.7, bright=1100)
solo(34.8, 'D5', 1.8, .16, att=.5, bright=1000); bell(35.6, 'D6', .07, d=4.6)
B['timp'].add(S.timpani(FQ('Bb1'), 2.4, 1.0), 36.8, .14)

# ================================================================== 37.3 - 47.3  d1: on the third day, while they were in pain, Simeon and Levi took their swords, came upon the city unawares and killed every male; they took Dinah out of Shechem's house and went away (34:25-26)
for k_ in range(24): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 37.4 + .5 * k_, .05 + .006 * k_)
pad(37.3, 41.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.8, bright=1000); pad(41.4, 44.4, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3', 'Ab3'], .4, att=.6, bright=1500)
trem_pad(37.8, 44.4, ['D2', 'A2', 'F3'], .16, 6.6)
for m_ in ('D3', 'F3'): B['brass'].add(horn(M(m_) / 2, 3.2, att=.7, rel=1.2, peak=1200), 41.4, .16, pan=.1)
solo(38.8, 'F4', 2.0, .16, att=.5, bright=1000); solo(41.8, 'Ab4', 2.0, .2, att=.4, bright=1500); solo(43.0, 'C5', 1.6, .2, att=.3, bright=1700)
B['timp'].add(S.timpani(FQ('Bb1'), 3.0, 1.0), 44.2, .26); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.4), 44.2, .3)
# the hush: they are inside the gate; nothing is shown and the score keeps a single low note
drone(44.4, 48.6, FQ('D1'), .2, att=.5, rel=2.2)
solo(46.3, 'C5', 3.2, .2, att=1.0, bright=1000, pan=-.1); pno(46.5, 'Ab4', 3.4, .12, .36)
bell(46.4, 'F6', .08, d=5.0)

# ================================================================== 47.3 - 58.5  e1: the other sons plundered the city and took their flocks, children and wives (34:27-29); Jacob: you have brought trouble on me (34:30); they answered: should he treat our sister like a prostitute? (34:31)
pad(47.8, 52.6, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .3, att=1.0, bright=1100)
for k_ in range(5): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 48.6 + 1.0 * k_, .06)
solo(49.0, 'F4', 2.2, .18, att=.7, bright=900); pno(50.4, 'Ab4', 2.8, .1, .38); solo(51.2, 'C5', 2.0, .16, att=.6, bright=1000)
pad(52.6, 56.4, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=1.0, bright=1000)
solo(53.4, 'Db5', 2.4, .18, att=.8, bright=900); solo(55.0, 'Bb4', 2.4, .16, att=.8, bright=900); bell(54.0, 'F6', .06, d=4.8)
pad(56.4, 60.8, ['C2', 'G2', 'Bb2', 'D3', 'G3'], .3, att=.9, bright=1200)
solo(57.0, 'G4', 2.0, .17, att=.6, bright=1100); pno(58.2, 'Bb4', 2.8, .1, .4); solo(59.0, 'D5', 1.8, .15, att=.6, bright=1200)

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
    sf.write(f'/home/claude/music/out34/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out34/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

