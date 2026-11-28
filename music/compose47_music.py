"""Episode 47 (Genesis 47, Jacob Before Pharaoh) score -- original, synthesised with numpy.
Arc (written in F, sounding in Eb): the court at morning, the brothers presented and the famine named (a1, warm with a shadow) -> Pharaoh gives the best of the land (a2, generous, bright) -> Jacob is brought in and blesses Pharaoh (b1, tender) -> 'few and hard have been the years of my life' (b2, a dark-edged hush) -> the famine bites, silver, livestock, land (c, dusty and tense, tremolo strings and soft timpani) -> seed and 'you have saved our lives' (d, a light opens) -> Israel settles and grows in Goshen (bright, rising) -> the bed, 'do not bury me in Egypt' (e, hushed) -> the oath and the bow (a warm settle) -> the reflection (same hopeful rise as every episode) -> the question chord.
Outputs: out47/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out47', exist_ok=True)
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






# ================================================================== 0 - 7.8  the court at morning: Joseph presents five of his brothers; 'your servants are shepherds'; the famine is severe in Canaan (47:2-4): warm, then a shadow
drone(0, 8.0, FQ('F1'), .15, att=1.2, rel=1.8)
pad(0.2, 5.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .30, att=1.0, bright=1500)
bell(0.9, 'C6', .10, d=4.6); solo(1.6, 'A4', 2.6, .14, att=.6, bright=1300); arp(2.2, 5.6, 41, 4, .07, .44); B['timp'].add(S.timpani(FQ('F1'), 1.8, .6), 2.6, .10)
bell(4.0, 'F6', .09, d=4.6); choir(3.8, 6.2, ['F3', 'A3', 'C4'], .18, 'oo', att=1.3)
pad(5.4, 8.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .28, att=.8, bright=1000)                 # 'the famine in Canaan is severe'
trem_pad(5.8, 8.0, ['D3', 'A3', 'F4'], .05, 5.2); solo(6.0, 'F5', 1.8, .12, att=.4, bright=1100)
# ================================================================== 7.8 - 12.9  Pharaoh: 'settle your father and your brothers in the best of the land, in Goshen' (47:5-6): generous and bright
pad(7.8, 13.2, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .38, att=.6, bright=1900)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 2.8, att=.5, rel=1.3, peak=1800), 8.1, .13, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 2.2, .8), 8.0, .14); bell(8.2, 'A6', .12, d=4.4); solo(8.6, 'C5', 2.4, .16, att=.4, bright=1700); pno(9.8, 'A5', 2.2, .10, .5)
choir(9.2, 13.0, ['F3', 'A3', 'C4', 'F4'], .26, 'ah', att=1.0); bell(10.8, 'C7', .10, d=4.4); pno(11.4, 'F5', 2.2, .09, .46)
# ================================================================== 12.9 - 18.9  Joseph brings in Jacob his father; Jacob blesses Pharaoh (47:7,10): tender, a lift as his hands rise
pad(12.9, 16.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .30, att=.9, bright=1100)
solo(13.3, 'A4', 2.6, .15, att=.5, bright=1100); pno(14.2, 'D5', 2.2, .09, .44); bell(14.4, 'A6', .08, d=4.6)
pad(15.0, 19.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.7, bright=1700)             # he blesses Pharaoh
choir(15.2, 18.9, ['F3', 'Bb3', 'D4', 'F4'], .24, 'oo', att=1.2); bell(15.6, 'F6', .12, d=4.4); solo(15.8, 'D5', 2.2, .16, att=.4, bright=1500); pno(16.8, 'F5', 2.2, .10, .48)
# ================================================================== 18.9 - 24.4  'How many are the days of the years of your life?' 'A hundred and thirty years; few and hard' (47:8-9): a dark-edged hush
pad(18.8, 24.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .30, att=.9, bright=900)
drone(18.9, 24.8, FQ('D1'), .12, att=1.4, rel=1.6)
solo(19.6, 'F4', 2.4, .15, att=.5, bright=900); solo(21.4, 'D4', 2.4, .15, att=.5, bright=900); pno(20.4, 'A4', 2.2, .08, .42); bell(22.0, 'D6', .08, d=4.6); pno(23.0, 'F4', 2.2, .07, .40)
# ================================================================== 24.4 - 31.9  the famine grows heavy; silver for grain; the livestock (47:13-17): dusty, tense
pad(24.4, 32.2, ['D2', 'A2', 'D3', 'F3'], .30, att=.8, bright=800)
drone(24.4, 32.4, FQ('D1'), .15, att=1.2, rel=1.6)
trem_pad(25.0, 31.4, ['D3', 'A3', 'F4'], .06, 5.8)
for k_, t_ in enumerate((25.0, 26.2, 27.4, 28.6, 29.8, 31.0)): B['timp'].add(S.timpani(FQ('D1'), 1.3, .5), t_, .07 + .015 * k_)
solo(25.6, 'F4', 2.6, .13, att=.5, bright=800); pno(27.0, 'A4', 2.2, .07, .40); solo(29.0, 'D5', 2.4, .13, att=.5, bright=900); bell(28.4, 'D6', .07, d=4.6)
# ================================================================== 31.9 - 38.3  Joseph buys the land for Pharaoh; the people are given seed; a fifth to Pharaoh (47:20-24): dark, then a thin light
pad(31.9, 38.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.9, bright=1100)
drone(31.9, 38.8, FQ('Bb1'), .13, att=1.4, rel=1.6)
solo(32.6, 'F4', 2.6, .13, att=.5, bright=900); B['timp'].add(S.timpani(FQ('Bb1'), 2.4, .8), 32.0, .13)
bell(34.6, 'F6', .12, d=4.4); pno(34.9, 'A5', 2.2, .09, .46); bell(36.0, 'A6', .10, d=4.4); solo(35.4, 'C5', 2.4, .15, att=.5, bright=1400); pno(36.6, 'F5', 2.2, .08, .44)
# ================================================================== 38.3 - 44.6  'You have saved our lives' (47:25): relief, a warm major chord, then Israel settles in Goshen (47:27)
pad(38.2, 44.6, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .42, att=.6, bright=2000)
choir(38.4, 44.4, ['F3', 'A3', 'C4', 'F4', 'A4'], .32, 'ah', att=.8)
for m_ in ('F3', 'C4', 'F4', 'A4'): B['brass'].add(horn(M(m_), 3.0, att=.5, rel=1.4, peak=1900), 38.5, .15, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 2.6, .9), 38.4, .18); bell(38.6, 'F6', .13, d=4.4); bell(40.0, 'A6', .11, d=4.4); solo(38.8, 'C5', 2.4, .17, att=.4, bright=1800); pno(40.6, 'A5', 2.2, .11, .52)
arp(41.4, 44.6, 41, 4, .09, .48)
# ================================================================== 44.6 - 50.2  they grew very numerous; Jacob lived seventeen years in Egypt (47:27-28): bright and rising, then calm
pad(44.6, 51.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.5, bright=2000)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 2.8, att=.4, rel=1.3, peak=2000), 44.8, .14, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 44.7, .16); bell(44.9, 'A6', .12, d=4.4); arp(44.9, 48.6, 41, 4, .10, .50); choir(45.6, 50.4, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=.9)
solo(46.4, 'F5', 2.2, .15, att=.4, bright=1700); bell(47.4, 'C7', .11, d=4.4); pno(48.2, 'C6', 2.0, .09, .50); solo(49.0, 'A4', 2.2, .12, att=.5, bright=1200)
# ================================================================== 50.2 - 56.5  'the time of his death drew near': 'do not bury me in Egypt; carry me to the burial place of my fathers' (47:29-30): hushed
pad(50.0, 57.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .30, att=1.0, bright=1000)
drone(50.2, 57.0, FQ('D1'), .11, att=1.6, rel=1.8)
solo(51.2, 'A4', 2.8, .14, att=.6, bright=1000); solo(53.4, 'F4', 2.6, .13, att=.6, bright=1000); pno(52.4, 'D5', 2.2, .08, .42); bell(54.0, 'D6', .09, d=4.6); pno(55.0, 'A4', 2.2, .07, .40)
# ================================================================== 56.5 - 61.8  'Swear to me'; Joseph swore; Israel bowed himself on the head of his bed (47:31): a warm settle, then the reflection begins
pad(56.4, 61.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=1500)
choir(56.8, 61.0, ['F3', 'A3', 'C4', 'F4'], .24, 'oo', att=1.1)
B['timp'].add(S.timpani(FQ('F1'), 2.6, .8), 56.6, .14); bell(56.9, 'F6', .12, d=4.4); solo(57.2, 'C5', 2.4, .15, att=.5, bright=1400); pno(58.4, 'A5', 2.2, .09, .46); bell(59.2, 'C7', .10, d=4.4)
for m_ in ('F3', 'C4', 'F4'): B['brass'].add(horn(M(m_), 3.0, att=.5, rel=1.4, peak=1600), 58.6, .09, pan=-.2 + .1 * (nn(m_) % 4))

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
    sf.write(f'/home/claude/music/out47/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out47/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

