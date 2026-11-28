"""Episode 41 (Genesis 41, From Prison to Palace) score -- original, synthesised with numpy.
Arc (written in F, sounding in D): Pharaoh's two dreams, thin cows and thin ears devouring the full ones (a1, eerie and slow) -> no one at court can explain them, the cupbearer remembers Joseph (a2) -> Joseph comes out of the prison, 'not I, God will give Pharaoh an answer' (b1) -> seven years of plenty then seven of famine (b2) -> store the grain (c1) -> 'one in whom is the spirit of God', Joseph set over Egypt (c2, the peak) -> ring, linen and chain, age thirty (d1) -> seven years of storing, Ephraim (d2) -> the famine and all lands coming for grain (e1) -> the shared reflection and question.
Outputs: out41/music.wav (+ stems)
"""
import sys, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3 import *
import synth as S
os.makedirs('/home/claude/music/out41', exist_ok=True)
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






# ================================================================== 0 - 4.8  cows: Pharaoh dreams of seven fat cows and seven thin ones that eat them (41:1-4): a slow, eerie dream dawn
drone(0, 9.8, FQ('D1'), .15, att=1.4, rel=1.8)
pad(0.2, 4.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .28, att=1.0, bright=1000)
trem_pad(0.4, 4.8, ['D3', 'A3', 'F4'], .08, 5.2)
bell(0.8, 'A6', .1, d=4.6); bell(2.2, 'F6', .08, d=4.6)
for k_, g_ in enumerate((.04, .05, .06, .07, .08)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 3.0 + .38 * k_, g_)
solo(3.0, 'Ab4', 1.8, .12, att=.5, bright=900)
# ================================================================== 4.8 - 9.5  ears: seven full ears and seven thin ears that swallow them (41:5-7)
pad(4.8, 9.6, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .3, att=.8, bright=900)
trem_pad(5.0, 9.6, ['D2', 'A2', 'F3'], .12, 6.4)
choir(5.4, 9.6, ['A3', 'D4', 'F4'], .16, 'oo', att=1.4)
for k_, g_ in enumerate((.05, .06, .07, .08, .09, .1, .12, .14)): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 6.8 + .36 * k_, g_)
bell(6.2, 'D6', .08, d=4.6); bell(8.4, 'F6', .06, d=4.6)
# ================================================================== 9.5 - 13.1  court: no wise man in Egypt could explain them (41:8): a held hush, sparse and low
pad(9.6, 13.4, ['G2', 'D3', 'G3', 'Bb3', 'D4'], .24, att=1.2, bright=800)
solo(10.6, 'Bb4', 2.4, .12, att=.9, bright=900); pno(12.0, 'D5', 2.0, .07, .36)
B['timp'].add(S.timpani(FQ('G1'), 1.4, .6), 9.8, .08)
# ================================================================== 13.1 - 16.3  remember: the cupbearer remembered Joseph (41:9-13): a plaintive solo that opens into a first warm chord
pad(13.4, 16.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.8, bright=1200)
solo(13.8, 'F5', 2.4, .17, att=.6, bright=1300); bell(14.6, 'A6', .1, d=4.6); pno(15.2, 'D5', 2.2, .1, .42)
# ================================================================== 16.3 - 19.8  gate: Joseph was brought from prison to explain the dreams (41:14): morning light, a door opens
pad(16.4, 20.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.6, bright=1700)
choir(16.6, 20.0, ['F3', 'A3', 'C4', 'F4'], .22, 'oo', att=1.0); bell(17.0, 'F6', .12, d=4.4); bell(18.4, 'A6', .1, d=4.4)
B['timp'].add(S.timpani(FQ('F1'), 2.0, .7), 16.4, .12)
# ================================================================== 19.8 - 23.7  before: not I, God will give Pharaoh an answer (41:15-16): reverent, a rising choir
pad(19.8, 24.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.6, bright=1500)
choir(20.0, 24.0, ['D4', 'F4', 'A4'], .26, 'ah', att=1.0); solo(20.6, 'A4', 2.6, .15, att=.6, bright=1300)
B['brass'].add(horn(M('D3') / 2, 3.0, att=.8, rel=1.2, peak=1300), 21.6, .14, pan=.1); bell(21.8, 'D6', .12, d=4.6)
# ================================================================== 23.7 - 28.6  years: seven years of plenty (a bright rolling piano) then seven of famine (a minor turn at 26.6) (41:29-30)
pad(23.8, 26.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=.6, bright=2000)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'A5', 'F5', 'C6')): pno(24.0 + .45 * k_, nm, 2.0, .12, .5, pan=-.4 + .15 * k_)
bell(24.2, 'C7', .12, d=4.4); bell(25.6, 'A6', .1, d=4.4)
drone(26.4, 29.4, FQ('D1'), .2, att=.8, rel=1.6)
pad(26.6, 29.0, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .3, att=.6, bright=800); solo(27.0, 'Ab4', 2.0, .12, att=.5, bright=900)
# ================================================================== 28.4 - 32.5  store: store grain in the good years (41:33-36): a steady, resolute pulse
pad(29.0, 32.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.6, bright=1300)
for k_ in range(8): B['timp'].add(S.timpani(FQ('Bb1'), .9, .5), 29.2 + .83 * k_, .1)
for k_, nm in enumerate(('D4', 'F4', 'D4', 'F4', 'D4', 'F4')): pno(29.5 + .5 * k_, nm, 1.6, .09, .45)
# ================================================================== 32.4 - 36.3  asks: can we find anyone like him, one in whom is the spirit of God (41:38): awe
pad(32.4, 36.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.8, bright=1800)
choir(32.6, 36.6, ['F3', 'A3', 'C4', 'F4'], .3, 'ah', att=1.0); bell(33.0, 'F6', .12, d=4.4); bell(34.8, 'C7', .1, d=4.4)
# ================================================================== 36.1 - 39.9  over: Pharaoh sets Joseph over the land of Egypt (41:41): the peak, brass and timpani, a dignified fanfare
for m_ in ('F3', 'A3', 'C4', 'F4'): B['brass'].add(horn(M(m_) / 2, 3.4, att=.4, rel=1.2, peak=2000), 36.2, .3, pan=-.2 + .1 * (nn(m_) % 4))
B['timp'].add(S.timpani(FQ('F1'), 3.0, 1.0), 36.2, .3); B['sub'].add(S.sub_boom(FQ('F1'), 3.2), 36.2, .2)
pad(36.1, 40.2, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], .42, att=.4, bright=2400)
choir(36.2, 40.2, ['F3', 'A3', 'C4', 'F4', 'A4'], .36, 'ah', att=.7)
for t_, nm, g_ in ((36.4, 'F6', .2), (37.4, 'A6', .16), (38.4, 'C7', .16)): bell(t_, nm, g_, d=4.4)
# ================================================================== 39.8 - 43.6  ring: Pharaoh gives Joseph his signet ring (41:42): warm, intimate
pad(40.0, 44.0, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.8, bright=1500)
solo(40.6, 'A4', 2.6, .15, att=.6, bright=1300); pno(41.4, 'F5', 2.2, .1, .5); bell(42.0, 'D6', .14, d=4.6)
# ================================================================== 43.5 - 47.5  chain: fine linen and a gold chain; Joseph was thirty (41:42, 41:46): full and bright
pad(43.8, 47.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .38, att=.6, bright=2000)
choir(44.0, 47.8, ['F3', 'A3', 'D4', 'F4'], .26, 'oo', att=1.0)
for t_, nm, g_ in ((44.2, 'F6', .16), (45.2, 'A6', .14), (46.2, 'D7', .12)): bell(t_, nm, g_, d=4.4)
# ================================================================== 47.4 - 51.7  granaries: for seven years he stored grain (41:47-49): a busy, gentle pastoral pulse
pad(47.8, 51.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.6, bright=1700)
for k_ in range(10): pno(47.8 + .4 * k_, ('F4', 'A4', 'C5', 'A4', 'F5')[k_ % 5], 1.6, .09, .46, pan=-.3 + .06 * k_)
# ================================================================== 51.6 - 55.9  son: he named his son Ephraim: God has made me fruitful in the land of my affliction (41:52): tender, a solo and a soft piano
pad(51.8, 56.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1500)
solo(52.4, 'D5', 2.8, .17, att=.5, bright=1500); pno(53.6, 'F5', 2.4, .12, .46); solo(54.6, 'F5', 2.2, .15, att=.5, bright=1500); bell(53.0, 'A6', .1, d=4.6)
# ================================================================== 55.7 - 60.4  famine: then the famine came, and all lands came to Egypt for grain (41:54-57): a low, dry hush that rises
drone(55.7, 61.0, FQ('D1'), .2, att=1.0, rel=2.0)
pad(55.9, 60.6, ['D2', 'A2', 'D3', 'F3', 'Ab3'], .3, att=.8, bright=800)
trem_pad(56.2, 60.6, ['D2', 'A2', 'F3'], .1, 6.2)
B['timp'].add(S.timpani(FQ('D1'), 3.0, .9), 56.0, .2); solo(57.4, 'D5', 2.6, .15, att=.5, bright=900)
pad(60.4, 61.4, ['D2', 'A2', 'D3', 'F3'], .22, att=.9, bright=800)

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
    sf.write(f'/home/claude/music/out41/stem_{k}.wav', np.stack([L, R], 1).astype(np.float32), SR)
pk = max(np.abs(ML).max(), np.abs(MR).max()); print('music peak', pk)
sf.write('/home/claude/music/out41/music.wav', (np.stack([ML, MR], 1) / pk * .85).astype(np.float32), SR)

