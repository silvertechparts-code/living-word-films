"""Episode 26 (Genesis 26, The Wells of Isaac) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): famine, and the Lord's word to Isaac in Gerar (a1) -> sowing, a hundredfold harvest (b1) -> envy, wells stopped with earth, "go away from us" (b2) -> digging again (c1) -> the quarrel at the wells (c2) -> Rehoboth, room at last (c3)
 -> Beersheba by night, "do not be afraid" (d1) -> dawn, the covenant of peace and the feast (d2) -> the reflection (same harmonic progression as Ep23/25) -> the question chord.
Outputs: out26/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out26', exist_ok=True)
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



# ================================================================== 0 - 8.0  a1: a famine in the land; Isaac went to Gerar; the Lord appeared: do not go down to Egypt, stay in the land, I will be with you and bless you (26:1-6): dry hush, one lone string, then a turn toward the major at the Lord's word
drone(0, 8.4, FQ('F1'), .24, att=1.2, rel=1.8)
pad(0.2, 3.4, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .2, att=1.6, bright=700); pad(3.4, 8.6, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .2, att=1.2, bright=800)
solo(1.2, 'C5', 2.2, .2, att=.9, bright=800); solo(2.8, 'Ab4', 2.0, .16, att=.9, bright=800)
pad(3.0, 8.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.4, bright=1300)
choir(3.4, 8.0, ['A3', 'C4', 'F4'], .2, 'oo', att=1.6)
solo(4.4, 'A4', 2.4, .22, att=.6, bright=1500); solo(6.4, 'C5', 2.0, .2, att=.6, bright=1500)
bell(2.0, 'F5', .1, d=5.0); bell(3.6, 'A6', .14, d=4.8, pan=.3); bell(5.6, 'C6', .1, d=4.6)

# ================================================================== 8.3 - 16.9  b1: Isaac sowed in that land and in the same year reaped a hundredfold; the Lord blessed him; he grew richer and richer (26:12-14): seed-like piano, a rippling harp that climbs, a golden rise
pad(8.3, 12.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .24, att=1.0, bright=1400); pad(12.0, 17.2, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .3, att=1.0, bright=2000)
for k_, nm in enumerate(('F4', 'A4', 'C5', 'A4', 'C5', 'F5', 'C5', 'F5')): pno(9.0 + .36 * k_, nm, 1.6, .16, .5, pan=-.3 + .08 * k_)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 12.4 + .3 * k_, .13, pan=-.3 + .1 * k_)
choir(11.6, 16.9, ['A3', 'C4', 'F4', 'A4'], .3, 'ah', att=1.2)
solo(10.4, 'A4', 2.0, .2, att=.6, bright=1500); solo(13.0, 'C5', 2.2, .22, att=.5, bright=1900)
bell(11.0, 'F6', .14, d=4.6); bell(13.5, 'A6', .18, d=4.6, pan=.3); bell(15.0, 'C7', .12, d=4.4)

# ================================================================== 17.1 - 27.0  b2: the Philistines envied him and stopped up all the wells with earth; Abimelech: go away from us, you are too powerful (26:14-16): envy gathers, earth thuds, a cold low chord
pad(17.1, 19.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=.9, bright=1000); pad(19.6, 24.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .26, att=.8, bright=1100)
[B['str'].add(trem(strings_note(M(m), 5.0, att=.8, rel=1.2, bright=1000), 7.0, .65, k), 19.6, .2, pan=-.3 + .15 * k) for k, m in enumerate(['Bb2', 'Db3', 'F3'])]
for k_, t_ in enumerate((19.8, 20.8, 21.9, 22.9, 23.9)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .006 * k_)
solo(18.4, 'F5', 2.0, .18, att=.6, bright=1200); solo(21.0, 'Db5', 2.0, .2, att=.5, bright=1100)
pad(24.6, 27.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.7, bright=1400)
for m_ in ('D3', 'A3'): B['brass'].add(horn(M(m_), 2.8, att=.7, rel=1.0, peak=1400), 24.6, .16, pan=.1)
choir(24.8, 27.4, ['D4', 'F4', 'A4'], .24, 'oo', att=1.0)
bell(18.0, 'D6', .1, d=4.4); bell(24.8, 'F6', .12, d=4.4, pan=.3)

# ================================================================== 27.3 - 33.6  c1: Isaac dug again the wells of his father Abraham, and gave them the names his father had given (26:17-18): steady and determined, a slow pulse, water coming back (31.4 on)
pad(27.3, 31.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .24, att=.9, bright=1200); pad(31.4, 34.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .28, att=.8, bright=1700)
for k_, t_ in enumerate((28.0, 29.2, 30.4, 31.6, 32.8)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .006 * k_)
solo(28.6, 'D5', 2.0, .2, att=.5, bright=1300); solo(30.8, 'F5', 2.0, .22, att=.5, bright=1500); pno(28.6, 'D5', 2.6, .14, .5); pno(30.8, 'F5', 2.8, .14, .5)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 31.6 + .3 * k_, .12, pan=-.3 + .12 * k_)
choir(31.6, 34.4, ['A3', 'C4', 'F4'], .2, 'oo', att=1.0)
bell(32.0, 'F6', .14, d=4.4); bell(33.4, 'A6', .1, d=4.2, pan=.3)

# ================================================================== 34.0 - 40.0  c2: they dug in the valley and found a well of spring water; the herdsmen of Gerar quarrelled: the water is ours (Esek); another well, and they quarrelled again (Sitnah) (26:19-21): a stone's knock, the quarrel rising
B['timp'].add(S.timpani(FQ('F1'), 1.6, .6), 34.0, .14)
pad(34.0, 37.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .28, att=.6, bright=1500); pad(37.0, 40.4, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .32, att=.6, bright=1700)
for g_, (a_, b_, ns_) in enumerate(((34.0, 37.0, ['Bb2', 'Db3', 'F3']), (37.0, 40.4, ['D3', 'F3', 'Ab3']))): [B['str'].add(trem(strings_note(M(m), b_ - a_ + .3, att=.7, rel=1.0, bright=1500), 7.5, .65, k), a_, .24 + .04 * g_, pan=-.3 + .15 * k) for k, m in enumerate(ns_)]
for k_, t_ in enumerate((35.0, 36.0, 37.0, 37.8, 38.6, 39.3)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .06 + .008 * k_)
for m_ in ('Bb2', 'F3'): B['brass'].add(horn(M(m_), 2.2, att=.5, rel=.9, peak=1500), 36.4, .14, pan=-.1)
solo(35.2, 'Db5', 1.8, .2, att=.4, bright=1500); solo(38.0, 'Ab5', 2.0, .24, att=.4, bright=1800)
bell(34.4, 'F6', .1, d=4.4)

# ================================================================== 40.0 - 48.0  c3: he moved on and dug another well, and they did not quarrel; he named it Rehoboth: now the Lord has made room for us (26:22): the music opens, wide and warm
pad(40.0, 43.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1300); pad(43.4, 48.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .32, att=1.0, bright=2100)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 42.4 + .32 * k_, .13, pan=-.3 + .1 * k_)
choir(43.4, 48.4, ['A3', 'C4', 'F4', 'A4'], .32, 'ah', att=1.1)
solo(41.0, 'A4', 2.0, .2, att=.6, bright=1400); solo(43.6, 'C5', 2.4, .22, att=.5, bright=1800); pno(43.6, 'C5', 3.0, .16, .55)
B['brass'].add(horn(M('F3'), 3.4, att=.9, rel=1.4, peak=1500), 44.6, .14, pan=.1)
bell(42.2, 'C6', .12, d=4.4); bell(44.4, 'F6', .18, d=4.6, pan=.3); bell(46.2, 'A6', .14, d=4.4)

# ================================================================== 48.0 - 53.2  d1: from there he went up to Beersheba; that night the Lord appeared: I am the God of Abraham; do not be afraid, I am with you (26:23-24): night hush, then a warm chord at "I am with you"
drone(47.6, 53.8, FQ('F1'), .2, att=1.2, rel=1.8)
pad(47.8, 50.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.4, bright=900); pad(50.6, 53.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.1, bright=1500)
choir(48.4, 52.2, ['D4', 'F4', 'A4'], .18, 'oo', att=1.4); choir(50.6, 53.8, ['A3', 'C4', 'F4', 'A4'], .26, 'ah', att=1.0)
solo(48.8, 'A4', 2.2, .18, att=.8, bright=1000); solo(51.0, 'C5', 2.4, .24, att=.6, bright=1500)
bell(49.2, 'D6', .12, d=4.8); bell(50.8, 'A6', .16, d=4.6, pan=.3); bell(52.4, 'F6', .12, d=4.4)

# ================================================================== 53.2 - 60.8  d2: Abimelech came to him; the Lord is with you; a covenant of peace; he made them a feast and they ate and drank; they departed from him in peace (26:26-31): dawn, a warm peak, then it eases into the reflection
pad(53.2, 56.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.9, bright=1700); pad(56.4, 59.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .38, att=.8, bright=2400); pad(59.4, 61.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .26, att=1.0, bright=1500)
choir(53.6, 59.4, ['A3', 'C4', 'F4', 'A4'], .32, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 54.0 + .34 * k_, .12, pan=-.3 + .12 * k_)
for t_, nm, d_ in ((55.0, 'A4', 1.6), (56.8, 'C5', 1.8), (58.2, 'F5', 2.0)): solo(t_, nm, d_, .22, att=.5, bright=1700); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.0, att=.8, rel=1.4, peak=1500), 56.4, .12, pan=.1)
bell(54.2, 'F6', .14, d=4.4); bell(56.6, 'A6', .16, d=4.6, pan=.3); bell(58.8, 'C6', .12, d=4.6)
choir(59.6, 61.4, ['A3', 'C4', 'F4'], .16, 'oo', att=1.0)

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
    sf.write(f'/home/claude/music/out26/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out26/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
