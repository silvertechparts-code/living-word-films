"""Episode 31 (Genesis 31, twenty years with Laban: the secret flight, the chase, the covenant of stones, the farewell) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): the Lord's call and a warm light (a1) -> the secret departure and the theft, a hushed pulse and a muted stab (a2) -> the chase and the dream, a driving pulse then a pale hush (b1) -> Laban's accusation (b2) -> the search, anxious and sparse (c1)
 -> Jacob's answer, stern then luminous (c2) -> the stones and the covenant, calm (d1) -> the farewell blessing, a bright peak that settles (e1) -> the reflection (same harmonic progression as Ep23/25-30) -> the question chord.
Outputs: out31/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out31', exist_ok=True)
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





# ================================================================== 0 - 6.4  a1: after twenty years with Laban the Lord told Jacob: go home, I will be with you (31:3): a low drone, a lone solo, then a warm light as God speaks
drone(0, 6.8, FQ('D1'), .2, att=1.2, rel=1.8)
pad(0.2, 3.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=1.6, bright=900); pad(3.4, 6.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1500)
solo(1.0, 'A4', 2.2, .2, att=.8, bright=1000); solo(3.3, 'C5', 2.2, .22, att=.6, bright=1300)
choir(3.2, 7.0, ['A3', 'C4', 'F4'], .22, 'oo', att=1.2)
pno(2.0, 'D5', 3.0, .14, .42); pno(4.2, 'A5', 3.0, .13, .42)
bell(1.6, 'D6', .08, d=5.0); bell(3.6, 'F6', .12, d=4.8, pan=.3)

# ================================================================== 6.4 - 14.3  a2: Jacob left in secret with his wives, children and flocks; Rachel stole her father's household gods (31:17-21): hushed and tense, a low heartbeat, a muted stab at the theft
pad(6.6, 10.6, ['D2', 'A2', 'D3', 'F3'], .26, att=1.4, bright=800)
trem_pad(7.0, 10.8, ['D2', 'A2', 'F3'], .16, 5.5)
for k_ in range(6): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 7.2 + .83 * k_, .06 + .01 * k_)
solo(8.0, 'D5', 1.8, .16, att=.7, bright=900); solo(9.6, 'F5', 1.8, .16, att=.7, bright=900)
pno(8.6, 'A4', 2.4, .11, .4)
B['timp'].add(S.timpani(FQ('D1'), 2.0, .9), 10.9, .14); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 10.9, .18)
pad(10.9, 14.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.5, bright=1100)
solo(11.4, 'Db5', 1.8, .17, att=.5, bright=1100); solo(12.8, 'F5', 1.8, .15, att=.5, bright=1000)
pno(11.8, 'D5', 2.8, .12, .42)

# ================================================================== 14.3 - 22.0  b1: Laban chased them for seven days; in a dream God warned him (31:22-24): a driving low pulse, then a hush and a pale light as he sleeps
trem_pad(14.4, 17.9, ['D2', 'A2', 'D3'], .2, 6.5)
for k_ in range(10): B['timp'].add(S.timpani(FQ('D1'), .8, .55), 14.5 + .5 * k_ if False else 14.5 + .42 * k_, .07 + .008 * k_)
pad(14.4, 18.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.6, bright=1500)
arp(14.6, 17.8, 34, 3, .09, .5)
B['timp'].add(S.timpani(FQ('A1'), 2.6, .7), 17.9, .12)
pad(18.0, 22.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.4, bright=1000)
choir(18.4, 22.0, ['A4', 'D5', 'F5'], .26, 'oo', att=1.2)
bell(18.7, 'A6', .14, d=5.0, pan=.2); bell(20.0, 'D7', .1, d=5.0, pan=-.2)
solo(19.0, 'F5', 2.2, .17, att=.9, bright=1100); pno(19.6, 'A5', 3.0, .12, .4)

# ================================================================== 22.0 - 27.6  b2: Laban asked why Jacob fled in secret and stole his gods (31:26-30): a dark held chord and a stab at his arrival
B['timp'].add(S.timpani(FQ('D1'), 2.2, 1.0), 22.1, .17); B['sub'].add(S.sub_boom(FQ('D1'), 3.2), 22.1, .2)
pad(22.0, 25.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.5, bright=1400); pad(25.2, 28.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.8, bright=1300)
solo(22.8, 'A4', 1.8, .2, att=.5, bright=1200); solo(24.6, 'F5', 1.8, .2, att=.5, bright=1200)
pno(23.2, 'D5', 2.8, .13, .45)
for k_ in range(4): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 25.4 + .72 * k_, .06 + .01 * k_)

# ================================================================== 27.6 - 36.4  c1: Jacob: whoever has them will not live; Laban searched and found nothing (31:31-35): sparse and anxious, a rising tremolo, a held suspended chord at the end
trem_pad(27.8, 31.4, ['D2', 'A2', 'F3'], .18, 6.5)
pad(27.7, 31.5, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=.8, bright=1200)
solo(28.6, 'D5', 1.8, .18, att=.5, bright=1200); solo(30.2, 'F5', 1.8, .18, att=.5, bright=1300)
pno(29.0, 'A4', 2.6, .12, .44)
pad(31.5, 35.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.8, bright=1400)
for k_ in range(3): B['timp'].add(S.timpani(FQ('D1'), .9, .5), 31.5 + 1.3 * k_, .07 + .015 * k_)
solo(32.4, 'D5', 1.8, .18, att=.5, bright=1300); solo(34.0, 'Db5', 2.0, .2, att=.6, bright=1200)
pno(33.2, 'F5', 2.8, .12, .42)
pad(35.0, 37.0, ['Bb1', 'F2', 'Bb2', 'C3', 'F3'], .26, att=.6, bright=1100)
bell(35.2, 'F6', .08, d=4.6, pan=.3)

# ================================================================== 36.4 - 46.0  c2: Jacob answered: twenty years I served you, you changed my wages ten times; without God you would have sent me away empty (31:36-42): stern, then a luminous swell as God is named
pad(36.4, 40.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.8, bright=1300); pad(40.8, 43.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1600)
for t_, nm, d_ in ((37.2, 'A4', 2.0), (38.8, 'D5', 2.0), (40.2, 'F5', 2.0)): solo(t_, nm, d_, .2, att=.5, bright=1300); pno(t_, nm, d_ + .8, .12, .45)
B['timp'].add(S.timpani(FQ('D1'), 1.8, .7), 41.0, .1)
pad(43.0, 46.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .4, att=.9, bright=2400)
choir(41.6, 46.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 42.6 + .34 * k_, .1, pan=-.3 + .08 * k_)
solo(43.4, 'C5', 2.2, .25, att=.5, bright=2000); solo(45.0, 'F5', 2.2, .26, att=.5, bright=2200)
pno(43.8, 'A5', 3.0, .16, .5)
bell(42.9, 'F6', .18, d=4.8); bell(44.4, 'C7', .14, d=4.6, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.9, rel=1.4, peak=1400), 43.6, .1, pan=.1)

# ================================================================== 46.0 - 54.2  d1: they piled up stones as a witness; Laban: the Lord watch between us (31:44-49): calm and steady, a bell for each stone group, warm choir at the covenant
pad(46.0, 50.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=1.0, bright=1700); pad(50.4, 54.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.9, bright=1500)
arp(46.4, 50.4, 41, 4, .09, .48)
for t_, nm, d_ in ((47.0, 'A4', 2.0), (48.8, 'F5', 2.0), (50.6, 'D5', 2.0), (52.2, 'C5', 2.2)): solo(t_, nm, d_, .2, att=.5, bright=1600); pno(t_, nm, d_ + .8, .13, .5)
for k_, (t_, nm) in enumerate(((46.6, 'F6'), (47.4, 'A6'), (48.4, 'C7'), (49.6, 'F6'), (50.8, 'A6'))): bell(t_, nm, .1, d=4.4, pan=-.3 + .15 * k_)
choir(50.6, 54.4, ['A3', 'C4', 'F4'], .3, 'oo', att=1.2)
bell(51.6, 'D6', .14, d=4.8)

# ================================================================== 54.2 - 60.6  e1: next morning Laban kissed his grandchildren and daughters, blessed them, and went home (31:55): a warm lift that grows into a bright, full peak and settles
pad(54.2, 57.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.6, bright=2400); pad(57.0, 60.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.8, bright=2800)
choir(54.6, 60.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 54.6 + .32 * k_, .11, pan=-.3 + .08 * k_)
for t_, nm, d_ in ((55.0, 'D5', 2.0), (56.6, 'F5', 2.0), (58.0, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.4, bright=2200); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1500), 56.2, .12, pan=.1)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 56.4, .14)
bell(55.6, 'C7', .14, d=4.4); bell(57.2, 'F6', .14, d=4.6, pan=.3); bell(58.8, 'A6', .12, d=4.4)

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
    sf.write(f'/home/claude/music/out31/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out31/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

