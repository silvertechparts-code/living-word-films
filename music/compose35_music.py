"""Episode 35 (Genesis 35, Bethel and Ephrath) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): a calm calling at dawn (a1) -> a solemn pulse and the hush of the burial under the oak (a2) -> an anxious terror that releases on "no one pursued" (b1) -> Bethel: the altar, God's light and a choir for "your name is Israel" (b2) -> Rachel's hard labour, tender and tense (c1) -> her death and the child's naming, one swell and a hush (c2) -> the grave and the pillar, slow and low (d1) -> Isaac's quiet end and a gentle resolution (e1) -> a soft, warm reflection -> the question.
Nothing is scored as spectacle: the peak is grief and the child's naming; the score falls quiet for the grave.
Outputs: out35/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out35', exist_ok=True)
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





# ================================================================== 0 - 6.0  a1: God said to Jacob: go up to Bethel and make an altar there (35:1): a calm dawn, a calling figure
drone(0, 6.4, FQ('D1'), .16, att=1.6, rel=1.8)
pad(0.2, 3.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1300)
solo(0.8, 'C5', 2.2, .2, att=.8, bright=1300); pno(1.6, 'F5', 2.8, .12, .46); solo(2.8, 'A4', 1.8, .18, att=.6, bright=1300)
bell(1.2, 'F6', .08, d=4.6)
pad(3.6, 6.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.8, bright=1100)
solo(4.2, 'D5', 2.0, .17, att=.5, bright=1200); pno(4.8, 'Bb4', 2.4, .1, .4)

# ================================================================== 6.0 - 15.6  a2: put away the foreign gods, purify yourselves, change your clothes; they gave Jacob the gods and the rings in their ears, and he buried them under the oak (35:2-4): a solemn pulse, then a hush at the burial
for k_ in range(10): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 6.6 + .9 * k_, .04 + .004 * k_)
pad(6.2, 11.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=1000)
trem_pad(7.0, 11.0, ['D2', 'A2', 'F3'], .12, 5.8)
solo(7.6, 'F4', 2.2, .15, att=.7, bright=900); pno(9.0, 'D5', 2.6, .09, .4)
pad(11.0, 15.8, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=1.0, bright=900)
solo(11.8, 'Db5', 2.4, .16, att=.8, bright=900); bell(12.6, 'F6', .07, d=4.8); pno(13.6, 'Ab4', 3.0, .09, .36); solo(14.2, 'F4', 2.0, .14, att=.8, bright=800)

# ================================================================== 15.4 - 22.2  b1: a terror from God fell on the cities all around, and no one pursued the sons of Jacob (35:5): an anxious pulse that releases on "no one pursued"
for k_ in range(9): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 15.8 + .5 * k_, .05 + .008 * k_)
pad(15.4, 19.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.6, bright=1200)
trem_pad(16.0, 19.6, ['D2', 'A2', 'F3'], .16, 6.6)
solo(16.6, 'D5', 1.8, .17, att=.4, bright=1300); solo(18.0, 'F5', 1.8, .15, att=.4, bright=1300)
pad(19.4, 22.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1200)
solo(20.0, 'A4', 2.0, .17, att=.6, bright=1100); pno(20.6, 'C5', 2.6, .1, .42)

# ================================================================== 22.0 - 30.2  b2: Jacob came to Luz, that is Bethel, and built an altar; God appeared to him again and blessed him: "your name is Israel" (35:6-10): warm, rising, the first light
pad(22.0, 26.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.9, bright=1400)
solo(22.8, 'C5', 2.0, .17, att=.6, bright=1300); pno(23.6, 'F5', 2.6, .1, .44); solo(24.8, 'A4', 1.8, .16, att=.5, bright=1300)
bell(25.0, 'D6', .1, d=4.8)
pad(26.4, 30.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .4, att=.7, bright=2000)
choir(26.6, 30.4, ['D4', 'F4', 'Bb4', 'D5'], .4, 'ah', att=.9)
for m_ in ('Bb2', 'D3'): B['brass'].add(horn(M(m_) / 2, 3.4, att=.8, rel=1.2, peak=1500), 26.8, .16, pan=.1)
solo(27.2, 'D5', 2.0, .2, att=.4, bright=1700); solo(28.6, 'F5', 1.8, .2, att=.4, bright=1800)
bell(27.4, 'F6', .2); bell(28.8, 'D6', .2)
B['timp'].add(S.timpani(FQ('Bb1'), 3.0, 1.0), 26.8, .22); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.4), 26.8, .22)

# ================================================================== 30.0 - 39.0  c1: Rachel in labour on the road to Ephrath, a hard labour; the midwife: "do not fear, you have another son" (35:16-17): tender and tense
for k_ in range(14): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 30.4 + .6 * k_, .03 + .005 * k_)
pad(30.0, 34.6, ['C2', 'G2', 'C3', 'Eb3', 'G3'], .3, att=.8, bright=1100)
trem_pad(30.6, 34.8, ['C2', 'G2', 'Eb3'], .15, 6.6)
solo(31.2, 'G4', 2.0, .16, att=.5, bright=1100); solo(32.8, 'Eb5', 2.0, .17, att=.4, bright=1200)
pad(34.6, 39.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1100)
solo(35.6, 'D5', 2.2, .18, att=.5, bright=1300); pno(36.6, 'F5', 2.6, .1, .42); solo(37.6, 'Bb4', 2.0, .16, att=.5, bright=1200)

# ================================================================== 39.0 - 46.6  c2: as her soul was departing, for she died, she named him Ben-oni; his father called him Benjamin (35:18): one swell at the child's naming, then a hush
pad(39.0, 43.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.9, bright=1000)
trem_pad(39.4, 43.4, ['D2', 'A2', 'F3'], .15, 6.0)
solo(39.8, 'F4', 2.4, .17, att=.7, bright=900); solo(41.4, 'A4', 2.0, .2, att=.5, bright=1200)
pad(43.0, 45.8, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3', 'Ab3'], .42, att=.5, bright=1700)
for m_ in ('Db3', 'F3'): B['brass'].add(horn(M(m_) / 2, 3.0, att=.7, rel=1.2, peak=1300), 43.2, .15, pan=.1)
solo(43.4, 'Ab4', 2.0, .2, att=.4, bright=1600); solo(44.4, 'C5', 1.8, .2, att=.3, bright=1700)
B['timp'].add(S.timpani(FQ('Bb1'), 3.0, 1.0), 43.2, .24); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.4), 43.2, .28)
drone(45.4, 49.6, FQ('D1'), .2, att=.5, rel=2.2)
pno(46.0, 'F5', 2.8, .12, .38); bell(46.4, 'F6', .08, d=5.0)

# ================================================================== 46.6 - 53.6  d1: Rachel was buried on the road to Ephrath, that is Bethlehem; Jacob set a pillar over her grave (35:19-20): slow, mournful, a quiet heartbeat
pad(46.8, 50.8, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .28, att=1.0, bright=900)
for k_ in range(5): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 47.4 + 1.0 * k_, .06)
solo(47.6, 'Ab4', 2.2, .17, att=.8, bright=900); pno(49.0, 'F4', 2.8, .1, .38); solo(50.0, 'C5', 2.0, .15, att=.6, bright=1000)
pad(50.8, 54.2, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=1.0, bright=1000)
bell(51.0, 'F6', .08, d=4.8); solo(51.8, 'Db5', 2.2, .16, att=.8, bright=900)

# ================================================================== 53.6 - 61.0  e1: Jacob came to his father Isaac; Isaac died, old and full of days; his sons Esau and Jacob buried him (35:27-29): quiet and warm, a gentle resolution
pad(54.0, 58.0, ['C2', 'G2', 'Bb2', 'D3', 'G3'], .3, att=1.0, bright=1100)
solo(54.8, 'G4', 2.2, .17, att=.7, bright=1000); pno(56.0, 'Bb4', 2.8, .1, .4); solo(56.8, 'D5', 2.0, .15, att=.6, bright=1200)
pad(58.0, 61.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1100)
solo(58.8, 'A4', 2.2, .16, att=.7, bright=1100); pno(59.6, 'C5', 2.6, .09, .4)

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
    sf.write(f'/home/claude/music/out35/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out35/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

