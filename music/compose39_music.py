"""Episode 39 (Genesis 39, The Lord Was With Joseph) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): warm golden service in Potiphar's house (a1, a2) -> unease, then a steady refusal (b1, b2) -> the quiet, tense day the cloak is caught and he runs (c1) -> the false story under a low unease (c2) -> the peak at Potiphar's anger and the prison door (d1) -> a single warm chord in the dark: the Lord was with Joseph (d2) -> dawn into the reflection.
Outputs: out39/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out39', exist_ok=True)
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






# ================================================================== 0 - 8.2  a1: Joseph serves in Potiphar's house; the Lord was with him and all he did prospered (39:2-3): a warm golden hush
drone(0, 8.6, FQ('D1'), .14, att=1.6, rel=1.8)
pad(0.2, 4.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.2, bright=1500)
solo(0.9, 'A4', 2.4, .18, att=.9, bright=1300); pno(2.0, 'C5', 2.8, .11, .44); solo(3.0, 'F4', 2.0, .16, att=.7, bright=1300)
bell(1.4, 'F6', .08, d=4.6); bell(3.6, 'A6', .07, d=4.6)
pad(4.6, 8.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1500)
solo(5.2, 'D5', 2.4, .17, att=.7, bright=1500); B['brass'].add(horn(M('Bb2') / 2, 3.0, att=.9, rel=1.2, peak=1100), 5.6, .13, pan=.1)

# ================================================================== 8.4 - 15.4  a2: Potiphar saw it, made him his attendant, put his whole household in his charge (39:3-4): warm and rising confidence
pad(8.4, 12.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=.9, bright=1700)
arp(8.6, 14.6, 41, 4, .08, .48)
solo(9.2, 'C5', 2.2, .16, att=.7, bright=1600); choir(10.6, 14.6, ['A3', 'C4', 'F4'], .2, 'oo', att=1.2)
pad(12.2, 15.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .34, att=.7, bright=1900)
B['brass'].add(horn(M('F3') / 2, 3.0, att=.8, rel=1.2, peak=1400), 12.6, .15, pan=.1); bell(11.8, 'F6', .1, d=4.6); bell(13.4, 'A6', .09, d=4.6)

# ================================================================== 15.6 - 25.8  b1: she looks at Joseph and invites him (39:7); he refuses -- how can I do this great evil and sin against God (39:8-9): unease, then a steady, solemn refusal
pad(15.6, 20.0, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .3, att=.9, bright=900)
trem_pad(16.4, 20.2, ['G2', 'D3', 'Bb3'], .12, 6.2)
solo(17.0, 'Bb4', 2.0, .15, att=.6, bright=1000); pno(18.6, 'D5', 1.8, .08, .38)
B['timp'].add(S.timpani(FQ('D1'), 1.4, .8), 20.4, .12)
pad(20.2, 25.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .34, att=.7, bright=1100)
B['brass'].add(horn(M('D3') / 2, 3.4, att=.8, rel=1.3, peak=1200), 21.4, .17, pan=.1)
choir(22.0, 25.8, ['D4', 'F4', 'A4'], .22, 'oo', att=1.0); solo(22.8, 'F5', 2.2, .15, att=.6, bright=1200); bell(23.6, 'F6', .08, d=4.6)

# ================================================================== 26.0 - 29.4  b2: she pressed him day after day (39:10), and he refused: a steady pulse
drone(26.0, 30.0, FQ('D1'), .16, att=.8, rel=1.6)
pad(26.0, 29.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1000)
for k_ in range(5): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 26.3 + .55 * k_, .05 + .006 * k_)
solo(26.4, 'D5', 2.0, .14, att=.6, bright=1000); pno(28.0, 'Bb4', 1.8, .08, .38)

# ================================================================== 29.6 - 37.2  c1: a day with no servants inside (39:11): hush; she caught his cloak (39:12): tension; he left it in her hand and ran: a rising, running figure
drone(29.4, 37.6, FQ('D1'), .2, att=1.0, rel=2.0)
pad(29.6, 34.0, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .3, att=1.0, bright=900)
trem_pad(30.2, 34.2, ['D2', 'A2', 'F3'], .13, 6.6)
solo(31.0, 'Ab4', 2.0, .15, att=.7, bright=900); bell(31.6, 'F6', .06, d=4.8)
B['timp'].add(S.timpani(FQ('D1'), 2.0, .9), 32.2, .16); B['sub'].add(S.sub_boom(FQ('D1'), 2.4), 32.2, .12)
pad(34.0, 37.8, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .32, att=.5, bright=1500)
B['brass'].add(horn(M('D3') / 2, 2.6, att=.5, rel=1.0, peak=1700), 34.2, .17, pan=.1)
for k_, nm in enumerate(('D4', 'F4', 'G4', 'A4', 'Bb4', 'D5', 'F5', 'G5', 'A5', 'Bb5')): pno(34.3 + .22 * k_, nm, 1.4, .1, .5, pan=-.3 + .06 * k_)

# ================================================================== 37.9 - 43.4  c2: she told her servants, then her husband, a false story and showed the cloak as proof (39:13-18): dusk, unease, mounting pulse
pad(37.9, 41.4, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .32, att=.7, bright=1100)
trem_pad(38.4, 42.0, ['G2', 'D3', 'Bb3'], .13, 6.8)
solo(39.0, 'Ab4', 2.0, .15, att=.6, bright=1000); bell(41.0, 'F6', .08, d=4.4)
for k_, g_ in enumerate((.04, .05, .06, .07, .08, .09, .10, .12, .14, .16)): B['timp'].add(S.timpani(FQ('G1'), 1.0, .5), 40.0 + .42 * k_, g_)
pad(41.4, 44.6, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .36, att=.6, bright=1400)

# ================================================================== 44.4 - 50.6  d1: Potiphar's anger burned (39:19); he put Joseph in the king's prison (39:20): the peak -- brass and timpani, then the door and a hush
for m_ in ('D3', 'A3', 'D4', 'F4'): B['brass'].add(horn(M(m_) / 2, 3.0, att=.5, rel=1.2, peak=1800), 44.5, .22, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('D1'), 3.0, 1.0), 44.5, .3); B['sub'].add(S.sub_boom(FQ('D1'), 3.6), 44.5, .26)
pad(44.5, 48.8, ['D2', 'A2', 'D3', 'F3', 'Ab3', 'C4'], .38, att=.5, bright=1500)
choir(44.4, 48.8, ['D4', 'F4', 'Ab4'], .3, 'ah', att=.9); solo(45.0, 'F5', 2.0, .16, att=.4, bright=1500)
B['timp'].add(S.timpani(FQ('Bb1'), 2.6, 1.0), 48.9, .22); B['sub'].add(S.sub_boom(FQ('Bb1'), 3.0), 48.9, .18)
pad(49.0, 52.4, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .22, att=1.2, bright=800)

# ================================================================== 51.6 - 59.8  d2: the Lord was with Joseph in prison and showed him kindness (39:21); the keeper trusted him (39:22-23): a single warm chord in the dark, then a gentle rise toward dawn
solo(50.8, 'D5', 2.4, .14, att=.8, bright=900)
pad(51.6, 55.4, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .42, att=.6, bright=2000)
choir(51.6, 55.6, ['F3', 'A3', 'C4', 'F4'], .32, 'oo', att=.8)
for t_, nm, g_ in ((52.0, 'F6', .2), (52.7, 'A6', .16), (53.4, 'C7', .16)): bell(t_, nm, g_, d=4.4)
pad(55.4, 59.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=1.0, bright=1800)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A5', 'C6')): pno(56.2 + .45 * k_, nm, 2.4, .13, .5, pan=-.4 + .16 * k_)
solo(56.8, 'C5', 2.2, .17, att=.7, bright=1700); choir(56.6, 60.4, ['A3', 'C4', 'F4', 'A4'], .26, 'oo', att=1.2)
for t_, nm, g_ in ((57.4, 'A6', .12), (58.4, 'C7', .12), (59.2, 'F6', .12)): bell(t_, nm, g_, d=4.4)

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
    sf.write(f'/home/claude/music/out39/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out39/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

