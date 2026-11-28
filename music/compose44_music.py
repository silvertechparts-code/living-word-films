"""Episode 44 (Genesis 44, The Silver Cup) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): the night order and the cup in Benjamin's sack (a1, hushed) -> dawn, the brothers leave and are overtaken (a2, a pale march) -> the steward accuses, the oath (b1, tremolo and low horn) -> the cup is found, they tear their clothes (b2, grief) -> before Joseph, Judah falls (c1, solemn, then the first relief) -> Judah steps forward (c2, resolute) -> his plea and offer, the peak (d1) -> 'let me stay as your slave' (d2, a suspended hold) -> the shared reflection and question.
Outputs: out44/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out44', exist_ok=True)
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






# ================================================================== 0 - 7.8  night in Joseph's house: he orders the sacks filled, the silver put back, the cup in the youngest's sack (44:1-2): a hushed, low night, one soft bell as the cup is set down
drone(0, 8.2, FQ('D1'), .15, att=1.4, rel=1.8)
pad(0.2, 7.9, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .24, att=1.0, bright=800)
trem_pad(0.6, 7.7, ['D3', 'A3', 'F4'], .06, 4.6)
bell(1.0, 'A6', .07, d=4.6); solo(2.0, 'Ab4', 2.4, .10, att=.6, bright=900)
bell(4.3, 'F6', .12, d=4.6); bell(5.5, 'C7', .08, d=4.6); pno(4.6, 'D5', 2.2, .07, .4)
B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 3.2, .05); B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 6.4, .06)
# ================================================================== 7.8 - 14.0  dawn: the men are sent away with their donkeys; the steward is sent after them (44:3-4): a pale, light F pad with a soft march
pad(7.8, 14.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.6, bright=1500)
for k_ in range(6): B['timp'].add(S.timpani(FQ('F1'), .9, .5), 8.2 + .55 * k_, .05 + .005 * k_)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'A4')): pno(8.8 + .6 * k_, nm, 1.6, .07, .4, pan=-.3 + .2 * k_)
bell(8.0, 'F6', .12, d=4.4); solo(10.8, 'C5', 2.4, .1, att=.6, bright=1300)
# ================================================================== 14.0 - 22.3  the steward overtakes them and accuses them; they swear: whoever has it shall die (44:4-10): unease, tremolo strings, a low horn, timpani pulses
pad(14.0, 22.6, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .30, att=.6, bright=900)
trem_pad(14.2, 22.6, ['D3', 'A3', 'F4'], .11, 6.2)
B['brass'].add(horn(M('D3') / 2, 3.6, att=.8, rel=1.4, peak=1300), 14.6, .14, pan=.1)
for k_, g_ in enumerate((.05, .06, .07, .08, .09, .10)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 15.4 + .7 * k_, g_)
solo(18.0, 'Ab4', 1.8, .12, att=.4, bright=900)
B['brass'].add(horn(M('D3') / 2, 3.0, att=.6, rel=1.2, peak=1400), 20.0, .15, pan=.1)
# ================================================================== 22.3 - 28.8  the search from the eldest to the youngest: the cup is found in Benjamin's sack; they tear their clothes and go back (44:11-13): the blow, then grief
B['timp'].add(S.timpani(FQ('D1'), 2.4, .9), 22.4, .45); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 22.4, .4)
pad(22.4, 29.0, ['D2', 'A2', 'Ab2', 'D3', 'F3', 'B3'], .34, att=.5, bright=1000)
trem_pad(22.6, 28.6, ['D3', 'F3', 'B3'], .10, 6.8)
choir(24.5, 29.0, ['D4', 'F4', 'A4'], .22, 'oo', att=1.2); B['timp'].add(S.timpani(FQ('D1'), 2.0, .7), 24.7, .25)
solo(26.0, 'A4', 1.4, .17, att=.4, bright=1100); solo(27.3, 'F4', 1.8, .17, att=.4, bright=1000); bell(26.4, 'F6', .1, d=4.6)
# ================================================================== 28.8 - 39.6  before Joseph; Judah and his brothers fall to the ground; 'God has found out your servants' guilt'; Joseph: only the one who has the cup (44:14-17): solemn, a slow beat, then the first relief
pad(28.8, 37.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .33, att=.7, bright=1000)
choir(29.6, 37.6, ['D4', 'F4', 'A4'], .24, 'oo', att=1.4)
bell(30.6, 'D6', .1, d=4.6); bell(33.2, 'A6', .08, d=4.6); bell(35.4, 'F6', .08, d=4.6)
for k_, g_ in enumerate((.06, .07, .08, .09)): B['timp'].add(S.timpani(FQ('D1'), 1.4, .6), 33.0 + .9 * k_, g_)
solo(31.0, 'F4', 2.6, .13, att=.6, bright=1000)
pad(37.4, 40.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.7, bright=1300)
pno(37.9, 'D5', 2.0, .09, .44); bell(38.2, 'F6', .1, d=4.6)
# ================================================================== 39.6 - 47.0  Judah steps forward: 'my lord, let your servant speak a word' (44:18-): plain, resolute, a Bb pad with a solo line
pad(39.8, 47.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.7, bright=1400)
solo(40.8, 'D5', 2.4, .17, att=.5, bright=1300); solo(43.0, 'F5', 2.2, .15, att=.5, bright=1300)
pno(41.4, 'Bb4', 2.0, .09, .44); pno(43.6, 'D5', 2.0, .09, .44); bell(41.8, 'F6', .11, d=4.4)
choir(42.3, 47.4, ['F3', 'Bb3', 'D4', 'F4'], .24, 'oo', att=1.1); B['timp'].add(S.timpani(FQ('Bb1'), 2.0, .6), 43.6, .12)
# ================================================================== 47.0 - 60.0  his plea for the old father and the boy; 'let me stay as your slave in place of the boy' (44:30-34): the peak, then a suspended hold
pad(47.0, 54.8, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .42, att=.6, bright=2000)
choir(48.4, 54.8, ['F3', 'A3', 'C4', 'F4', 'A4'], .36, 'ah', att=.9)
for m_ in ('F3', 'A3', 'C4', 'F4'): B['brass'].add(horn(M(m_) / 2, 3.2, att=.5, rel=1.2, peak=1800), 49.2, .22, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 3.0, .9), 49.2, .22)
solo(50.0, 'C5', 2.4, .19, att=.4, bright=1700); pno(51.2, 'A5', 2.4, .15, .55)
for t_, nm, g_ in ((49.6, 'F6', .16), (51.0, 'A6', .15), (52.4, 'C7', .13)): bell(t_, nm, g_, d=4.4)
B['timp'].add(S.timpani(FQ('F1'), 3.2, 1.0), 54.35, .34); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 54.35, .38)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.6, att=.4, rel=1.6, peak=2200), 54.35, .22, pan=-.2 + .1 * (nn(m_) % 4))
pad(54.4, 60.4, ['D2', 'A2', 'D3', 'G3', 'A3'], .30, att=.8, bright=1100)
choir(55.0, 60.4, ['A3', 'D4', 'G4', 'A4'], .2, 'oo', att=1.2)
drone(56.8, 61.4, FQ('D1'), .2, att=1.0, rel=2.0)
solo(56.0, 'D5', 3.0, .14, att=.6, bright=1000); bell(57.0, 'A6', .09, d=4.6)
B['timp'].add(S.timpani(FQ('D1'), 3.0, .9), 59.4, .16)

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
    sf.write(f'/home/claude/music/out44/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out44/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

