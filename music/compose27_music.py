"""Episode 27 (Genesis 27, The Blessing and the Lie) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): old, almost blind Isaac and the lamp-lit tent (a1) -> Rebekah overhears and tells Jacob (b1) -> Jacob's fear of a curse; "let the curse fall on me" (b2)
 -> dressing in Esau's clothes and the goatskin (b3) -> Jacob goes in: the voice and the hands (c1) -> the blessing, dew from heaven (c2) -> Esau returns, Isaac trembles, Esau's bitter cry (d1)
 -> the blessing is given; Esau's anger; flight to Laban (d2) -> the reflection (same harmonic progression as Ep23/25/26) -> the question chord.
Outputs: out27/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out27', exist_ok=True)
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




# ================================================================== 0 - 9.0  a1: Isaac old and almost blind; he asks Esau for game and the dish he loves, so that he may bless him (27:1-4): a lamp-lit hush, a lone string; Esau leaves with a faint hunting pulse
drone(0, 8.8, FQ('F1'), .22, att=1.2, rel=1.8)
pad(0.2, 3.6, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .2, att=1.6, bright=700); pad(3.6, 8.8, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .22, att=1.2, bright=800)
solo(1.0, 'C5', 2.4, .18, att=.9, bright=800); solo(3.0, 'Ab4', 2.2, .16, att=.9, bright=800); solo(5.2, 'F4', 2.4, .16, att=.8, bright=900)
pad(5.4, 9.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .22, att=1.2, bright=1200)
bell(2.2, 'F5', .1, d=5.0); bell(5.8, 'C6', .12, d=4.8, pan=.3)
for k_, t_ in enumerate((7.4, 8.2, 9.0)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .04 + .006 * k_)

# ================================================================== 9.3 - 16.8  b1: Rebekah was listening; she tells Jacob: bring two young goats, take Isaac the dish, so he blesses you (27:5-10): whispered, conspiratorial, a quiet tremolo
pad(9.0, 13.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .22, att=.8, bright=900)
trem_pad(9.4, 13.0, ['Bb2', 'Db3', 'F3'], .16, 6.0)
solo(10.2, 'F5', 1.8, .16, att=.6, bright=1000); solo(11.8, 'Db5', 1.8, .16, att=.6, bright=1000)
pad(13.0, 17.4, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .26, att=.8, bright=1300)
for k_, nm in enumerate(('Ab4', 'Db5', 'F5', 'Db5')): B['harp'].add(pluck(M(nm)), 13.6 + .38 * k_, .1, pan=-.3 + .12 * k_)
solo(14.6, 'Ab4', 2.0, .2, att=.5, bright=1300); solo(16.0, 'F5', 1.8, .2, att=.5, bright=1400)
bell(10.0, 'Db6', .1, d=4.6); bell(14.2, 'F6', .1, d=4.4, pan=.3)

# ================================================================== 16.8 - 23.0  b2: Jacob feared a curse rather than a blessing; Rebekah: let the curse fall on me (27:11-13): cold, then a resolute warm chord at her words
pad(17.1, 20.2, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .24, att=.8, bright=1000)
trem_pad(17.4, 20.2, ['Bb2', 'Db3', 'F3'], .18, 6.5)
for k_, t_ in enumerate((18.0, 19.1, 20.2)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .008 * k_)
solo(18.0, 'Db5', 2.0, .18, att=.5, bright=1100)
pad(20.3, 23.1, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.6, bright=1500)
for m_ in ('Bb2', 'F3'): B['brass'].add(horn(M(m_), 2.8, att=.6, rel=1.0, peak=1300), 20.4, .14, pan=.1)
choir(20.6, 23.0, ['D4', 'F4', 'Bb4'], .22, 'oo', att=1.0)
solo(20.8, 'D5', 1.8, .22, att=.4, bright=1600)
bell(20.5, 'Bb5', .1, d=4.4)

# ================================================================== 23.0 - 28.0  b3: she dressed him in Esau's clothes and covered his hands and neck with goatskin (27:15-16): tight tremolo, a nervous pulse, plucked harp as the skins go on
pad(22.9, 27.9, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .26, att=.7, bright=1300)
trem_pad(23.2, 27.9, ['Ab2', 'Db3', 'F3'], .18, 7.0)
for k_, t_ in enumerate((24.4, 25.0, 25.6, 26.2, 26.8, 27.4)): B['timp'].add(S.timpani(FQ('F1'), .9, .5), t_, .05 + .006 * k_)
for k_, nm in enumerate(('F5', 'Ab5', 'Db6', 'Ab5', 'F5', 'Db6')): B['harp'].add(pluck(M(nm)), 25.0 + .3 * k_, .1, pan=-.3 + .1 * k_)
solo(24.6, 'Ab4', 1.6, .2, att=.4, bright=1500); solo(26.4, 'C5', 1.8, .22, att=.4, bright=1700)
bell(25.4, 'Ab5', .1, d=4.4)

# ================================================================== 29.0 - 37.0  c1: Jacob went in: Father, I am Esau; the voice is Jacob's, but the hands are Esau's; and he blessed him (27:18-23): hush, a heartbeat, suspense, then the first warm chord at "he blessed him"
pad(28.6, 32.2, ['F2', 'C3', 'F3', 'Ab3', 'C4'], .22, att=.8, bright=1000)
solo(29.4, 'C5', 2.0, .18, att=.6, bright=1000)
pad(32.2, 36.6, ['Db2', 'Ab2', 'Db3', 'F3', 'Ab3'], .28, att=.6, bright=1300)
trem_pad(32.2, 36.6, ['Ab2', 'Db3', 'F3'], .2, 7.5)
B['timp'].add(S.timpani(FQ('F1'), 1.6, .6), 32.2, .1)
for k_, t_ in enumerate((33.0, 34.0, 35.0, 35.8)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .05 + .008 * k_)
solo(32.6, 'Db5', 1.6, .18, att=.4, bright=1300); solo(34.2, 'Ab5', 1.8, .2, att=.4, bright=1600)
pad(36.4, 38.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.6, bright=1800)
choir(36.6, 38.6, ['A3', 'C4', 'F4'], .26, 'ah', att=.8)
bell(36.8, 'C6', .14, d=4.6)

# ================================================================== 38.1 - 44.8  c2: may God give you dew from heaven and the earth's richness; may nations serve you (27:28-29): the blessing, a shimmer of harp and bells, a warm peak
pad(38.2, 41.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.9, bright=2000); pad(41.4, 45.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .38, att=.8, bright=2400)
choir(38.4, 45.0, ['A3', 'C4', 'F4', 'A4'], .38, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 38.8 + .32 * k_, .12, pan=-.3 + .08 * k_)
for k_, nm in enumerate(('A5', 'C6', 'F6', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 41.6 + .34 * k_, .11, pan=-.3 + .1 * k_)
for t_, nm, d_ in ((38.6, 'A4', 2.0), (40.6, 'C5', 2.0), (42.8, 'F5', 2.2)): solo(t_, nm, d_, .24, att=.5, bright=1900); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.2, att=.8, rel=1.4, peak=1500), 41.4, .12, pan=.1)
bell(38.4, 'F6', .14, d=4.6); bell(40.0, 'A6', .16, d=4.6, pan=.3); bell(41.8, 'C7', .14, d=4.4); bell(43.4, 'F6', .12, d=4.4)

# ================================================================== 44.9 - 53.5  d1: Jacob had barely left when Esau came in; Isaac trembled; Esau cried out bitterly: bless me too, Father (27:30-34): a hush, a low tremble, then the cry -- the emotional peak
pad(44.9, 49.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .22, att=1.0, bright=1000)
trem_pad(45.6, 49.4, ['A2', 'D3', 'F3'], .16, 6.5)
solo(46.0, 'A4', 2.0, .16, att=.7, bright=1000)
B['timp'].add(S.timpani(FQ('F1'), 2.0, .8), 47.6, .16); B['sub'].add(S.sub_boom(FQ('F1'), 3.0), 47.6, .3)
pad(49.2, 53.8, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3', 'Ab3'], .38, att=.5, bright=1800)
trem_pad(49.3, 53.8, ['F3', 'Ab3', 'Db4'], .26, 7.0)
choir(49.4, 53.6, ['Db4', 'F4', 'Bb4'], .3, 'ah', att=.7)
solo(49.4, 'F5', 1.6, .3, att=.3, bright=2200); solo(51.0, 'Db5', 2.0, .32, att=.4, bright=2000); solo(52.6, 'Ab4', 1.8, .26, att=.4, bright=1500)
for m_ in ('Bb2', 'F3'): B['brass'].add(horn(M(m_), 3.0, att=.5, rel=1.4, peak=1400), 49.5, .14, pan=-.1)
bell(49.6, 'F6', .1, d=4.6); bell(51.8, 'Db6', .12, d=4.6, pan=.3)

# ================================================================== 53.5 - 61.6  d2: but the blessing was given; Esau planned to kill Jacob; Rebekah told Jacob to flee to Laban (27:33-45): a heavy chord, anger in the timpani, then a night hush as they part
B['timp'].add(S.timpani(FQ('Bb1'), 2.4, .9), 53.5, .22)
pad(53.5, 57.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.5, bright=1400)
for k_, t_ in enumerate((54.4, 55.0, 55.5, 56.0, 56.4, 56.8)): B['timp'].add(S.timpani(FQ('F1'), 1.0, .5), t_, .08 + .012 * k_)
for m_ in ('Bb2', 'F3', 'Db4'): B['brass'].add(horn(M(m_), 2.4, att=.4, rel=1.0, peak=1700), 54.3, .16, pan=.1)
solo(54.6, 'Db5', 1.6, .22, att=.4, bright=1500); solo(56.0, 'F5', 1.6, .24, att=.4, bright=1700)
drone(54.0, 61.0, FQ('F1'), .2, att=1.0, rel=1.8)
pad(57.0, 61.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.0, bright=1100)
solo(57.6, 'A4', 2.2, .2, att=.7, bright=1200); solo(59.4, 'D5', 2.2, .2, att=.7, bright=1300)
choir(58.0, 61.4, ['D4', 'F4', 'A4'], .2, 'oo', att=1.2)
bell(58.4, 'D6', .1, d=4.8); bell(60.0, 'A5', .1, d=4.6, pan=.3)

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
    sf.write(f'/home/claude/music/out27/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out27/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)
