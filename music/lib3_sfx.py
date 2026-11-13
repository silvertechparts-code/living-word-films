"""Episode 02 score, nature/city ambience and sound effects (original, synthesised with numpy).
Outputs (48 kHz stereo float WAV): out3/music.wav, out3/amb.wav, out3/sfx.wav
"""
import sys, re, json, os, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from synth import *
import synth as S
os.makedirs('/home/claude/music/out3', exist_ok=True)
T = 91.0
r_ = np.random.default_rng(2026)

def lp(x, fc, o=2): return ss.sosfilt(ss.butter(o, fc, 'lp', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return ss.sosfilt(ss.butter(o, fc, 'hp', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return ss.sosfilt(ss.butter(o, [a, b], 'bp', fs=SR, output='sos'), x)
def nz(n): return r_.standard_normal(n)
def smooth_noise(n, fc):  # slow random modulation, unit-ish std
    x = lp(nz(n), fc, 2); return x / (x.std() + 1e-9)

# ------------------------------------------------------------------ instruments
def piano(f, dur=2.6, vel=.8):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n, np.float32); ph0 = r_.uniform(0, 6.28)
    dec = 0.9 + 0.7 * (f / 440.0) ** .6
    for k in range(1, 15):
        fk = f * k * np.sqrt(1 + 0.00035 * k * k)
        if fk > 9500: break
        a = (1.0 / k ** 1.1) * (vel if k > 2 else 1.0)
        for d in (-0.6, 0.6):
            out += (0.5 * a * np.sin(2 * np.pi * (fk + d * 0.25 * k ** .5) * t + ph0 * k) * np.exp(-t * dec * (1 + 0.55 * (k - 1) ** .8))).astype(np.float32)
    th = bp(nz(n), 250, 1600) * np.exp(-t / .012) * .07 * vel
    out = (out + th.astype(np.float32)) * np.minimum(1, t / .003)
    rel = np.clip((dur - t) / .25, 0, 1)
    return (out * rel * .55).astype(np.float32)

def solo_string(f, dur, att=.28, rel=.7, bright=3000, vib=.0045):
    n = int((dur + rel) * SR); out = np.zeros(n, np.float32)
    sh = lambda ks, ff: 1.0 / ks ** .9 / (1 + (ks * ff / bright) ** 2)
    for c in (-6, 5):
        out += harm_voice(f * 2 ** (c / 1200), n, sh, vib=vib, vib_rate=5.4, phase0=r_.uniform(0, 6.28), vib_delay=.5)
    return out * env_pad(n, att, rel, dur) / 3.2

def horn(f, dur, att=.3, rel=.7, peak=2200):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(f * (1 + .002 * np.sin(2 * np.pi * 5.2 * t))) / SR + r_.uniform(0, 6.28)
    out = np.zeros(n, np.float32)
    for k in range(1, 15):
        if k * f > 7000: break
        out += ((1.0 / k ** 1.0) / (1 + (k * f / peak) ** 2) * np.sin(k * ph)).astype(np.float32)
    return out * env_pad(n, att, rel, dur) * .5

def chirp(f0, f1, dur, vib=0.0, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    f = f0 + (f1 - f0) * u ** .8 + vib * np.sin(2 * np.pi * 38 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR; env = np.sin(np.pi * u) ** 1.4
    return ((np.sin(ph) + .22 * np.sin(2 * ph)) * env * .6 * g).astype(np.float32)

def bird_phrase(kind=None):
    k = kind if kind is not None else int(r_.integers(0, 4)); parts = []; gap = lambda d: np.zeros(int(d * SR), np.float32)
    if k == 0:   # rising three-note call
        b = r_.uniform(2300, 3100)
        for i, m in enumerate((1, 1.18, 1.4)): parts += [chirp(b * m, b * m * 1.12, .11), gap(.07)]
    elif k == 1:  # trill
        b = r_.uniform(3300, 4300)
        for i in range(int(r_.integers(6, 10))): parts += [chirp(b, b * 1.08, .045, vib=60), gap(.035)]
    elif k == 2:  # two-note whistle
        b = r_.uniform(1900, 2500); parts += [chirp(b * 1.25, b * 1.2, .22), gap(.09), chirp(b, b * .94, .3)]
    else:         # warble
        b = r_.uniform(2600, 3400)
        for i in range(4): parts += [chirp(b * (1 + .12 * (i % 2)), b * (1.2 - .1 * (i % 2)), .07, vib=120), gap(.05)]
    return np.concatenate(parts).astype(np.float32)

B = {}
AMB = Bus(T); SFX = Bus(T)
# ------------------------------------------------------------------ ambience beds
def stereo_noise_bed(n, fn):
    return [fn() for _ in range(2)]
def water_bed(t0, t1, level, fade=1.5):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); env = env * env * (3 - 2 * env)
    ch = []
    for c in range(2):
        x = nz(n); a = bp(x, 300, 2400, 2) * (.7 + .3 * smooth_noise(n, 5) * .5)
        hi = bp(nz(n), 2400, 7500, 1) * (.18 + .1 * np.abs(smooth_noise(n, 9)))
        lo = lp(nz(n), 260, 2) * .5
        y = (a + hi + lo) * .22
        for _ in range(int((t1 - t0) * 10)):
            i = int(r_.uniform(0, t1 - t0 - .2) * SR); m = int(r_.uniform(.03, .08) * SR); tt = np.arange(m) / SR; f = r_.uniform(450, 1700) * (1 + 3.5 * tt / (m / SR))
            y[i:i + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .018) * r_.uniform(.02, .07)
        ch.append((y * env * level).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def wind_bed(t0, t1, level, fade=2.0):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1)
    ch = []
    for c in range(2):
        gust = np.clip(.55 + .45 * smooth_noise(n, .35), 0, 1.4) ** 2
        y = lp(nz(n), 900, 2) * .5 * gust + bp(nz(n), 3200, 9000, 2) * .10 * gust * (.5 + .5 * np.clip(smooth_noise(n, 3), 0, 2))
        ch.append((y * env * level).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def bird_bed(t0, t1, rate, level, seed=0):
    t = t0 + r_.uniform(0, 1 / rate)
    while t < t1:
        ph = bird_phrase(); AMB.add(ph, t, level * r_.uniform(.35, 1.0), pan=r_.uniform(-.9, .9))
        t += r_.exponential(1 / rate) + .3
def city_bed(t0, t1, level, fade=1.8):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1)
    ch = []
    for c in range(2):
        y = lp(nz(n), 140, 3) * 1.6 + bp(nz(n), 240, 1300, 2) * (.18 + .08 * smooth_noise(n, .4)) + bp(nz(n), 1800, 5500, 1) * .02
        ch.append((y * env * level).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
    for tc in np.arange(t0 + .8, t1 - 1.6, 1.15):  # cars passing
        d = r_.uniform(1.3, 2.2); m = int(d * SR); tt = np.arange(m) / SR; fc = np.linspace(380, 900, m) * (1 + .15 * r_.standard_normal())
        sw = ss.sosfilt(ss.butter(2, [220, 900], 'bp', fs=SR, output='sos'), nz(m)) * np.sin(np.pi * tt / d) ** 2 * r_.uniform(.03, .08)
        AMB.add(sw.astype(np.float32), tc, level * 1.0, pan=r_.uniform(-.8, .8))
    for tc, f0 in ((63.7, 340), (66.9, 380)):  # distant horns
        if t0 <= tc <= t1:
            m = int(.42 * SR); tt = np.arange(m) / SR
            hn = (np.sin(2 * np.pi * f0 * tt) + .6 * np.sin(2 * np.pi * f0 * 1.26 * tt) + .3 * np.sin(2 * np.pi * f0 * 2 * tt)) * np.minimum(1, tt / .02) * np.clip((.42 - tt) / .05, 0, 1)
            AMB.add(lp(hn, 1400).astype(np.float32), tc, .011 * level, pan=.5)
def crackle(t0, t1, level):
    n = int((t1 - t0) * SR); y = np.zeros(n, np.float32)
    for _ in range(int((t1 - t0) * 16)):
        i = int(r_.uniform(0, t1 - t0 - .05) * SR); m = int(r_.uniform(.004, .02) * SR)
        y[i:i + m] += (hp(nz(m), 2200, 1) * np.exp(-np.arange(m) / SR / r_.uniform(.002, .006)) * r_.uniform(.15, 1)).astype(np.float32) * .12
    y += lp(nz(n), 400, 2).astype(np.float32) * .02
    t = np.arange(n) / SR; env = np.clip(np.minimum(t / .8, (t1 - t0 - t) / .8), 0, 1)
    AMB.add((y * env * level).astype(np.float32), t0, 1.0, pan=0)

# ------------------------------------------------------------------ SFX
def sparkle(g=1.0, seed=3):
    n = int(1.6 * SR); out = np.zeros(n, np.float32); rr = np.random.default_rng(int(seed * 7919))
    for i in range(9):
        f = rr.choice([1568, 1760, 2093, 2349, 2637, 3136, 3520, 4186]); t0 = int(i * .06 * SR + rr.uniform(0, .02) * SR); m = n - t0; tt = np.arange(m) / SR
        out[t0:] += (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5.5) * (.35 + .65 * rr.random())).astype(np.float32) * .18
    return out
def sfx_rumble(d):
    n = int(d * SR); t = np.arange(n) / SR; x = lp(nz(n), 95, 3) * 2.2 + np.sin(2 * np.pi * 34 * t) * .3
    env = np.minimum(1, t / 1.6) * np.clip((d - t) / 1.2, 0, 1); return (x * env).astype(np.float32)
def sfx_swirl(d):
    s = S.noise_sweep(d, 500, 2600, rise=1.0, q=1.2, g=1.0, falling_end=1.3); return (s * .5).astype(np.float32)
def sfx_breath(d):
    n = int(d * SR); t = np.arange(n) / SR; u = t / d
    x = bp(nz(n), 500, 3600, 2) * (np.sin(np.pi * np.clip(u * 1.1, 0, 1)) ** 1.6) * .9
    tone = np.sin(2 * np.pi * mf(nn('D4')) * t * (1 + .12 * u)) * np.sin(np.pi * u) ** 2 * .1
    return ((x + tone) * .6).astype(np.float32)
def sfx_chime(): return (S.bell(mf(nn('D6')), 3.4, 1.0) * .8 + S.bell(mf(nn('A6')), 3.4, .6) * .35).astype(np.float32)
def sfx_hit(): return (S.timpani(55, 2.0, .7) * .5).astype(np.float32), (S.sub_boom(42, 2.6) * .5).astype(np.float32)
def sfx_leaf(d=1.3):
    n = int(d * SR); y = np.zeros(n)
    for _ in range(26):
        i = int(r_.uniform(0, d - .15) * SR); m = int(r_.uniform(.03, .12) * SR)
        y[i:i + m] += bp(nz(m), 2200, 8000, 1) * np.sin(np.pi * np.arange(m) / m) * r_.uniform(.1, .4)
    return (y * .5).astype(np.float32)
def sfx_grow(d):
    n = int(d * SR); t = np.arange(n) / SR; u = t / d; f = 330 * (1 + 2.2 * u ** 1.3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * u) ** 2 * .18
    cr = np.zeros(n)
    for _ in range(14):
        i = int(r_.uniform(.1, d - .2) * SR); m = int(.05 * SR); cr[i:i + m] += bp(nz(m), 600, 3000, 2) * np.exp(-np.arange(m) / SR / .012) * .25
    return (tone + cr * .6 + sparkle(.5, 11)[:n] * .3).astype(np.float32) if n < len(sparkle()) else (tone + cr * .6).astype(np.float32)
def sfx_low(): n = int(3.2 * SR); t = np.arange(n) / SR; return ((np.sin(2 * np.pi * 55 * t) + .4 * np.sin(2 * np.pi * 110 * t) + .15 * np.sin(2 * np.pi * 165 * t)) * np.sin(np.pi * t / 3.2) ** 2 * .45).astype(np.float32)
def sfx_step():
    n = int(.22 * SR); t = np.arange(n) / SR; return ((lp(nz(n), 700, 2) * np.exp(-t / .03) * .9 + np.sin(2 * np.pi * 80 * t) * np.exp(-t / .05) * .4) * .5).astype(np.float32)
def sfx_riser(d, up=True):
    s = S.noise_sweep(d, 700, 8500, rise=2.0, q=1.3, g=1.0).astype(np.float32); n = len(s); t = np.arange(n) / SR
    f = 220 * (1 + 3 * (t / d) ** 2); tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * .12
    return (s * .55 + tone).astype(np.float32)
def sfx_tiles(d):
    n = int(d * SR); y = np.zeros(n)
    dens = lambda u: 8 + 120 * np.sin(np.pi * u) ** 1.2
    t = 0.0
    while t < d - .1:
        u = t / d; m = int(.03 * SR); tt = np.arange(m) / SR; f = r_.uniform(1800, 5200)
        y[int(t * SR):int(t * SR) + m] += (np.sin(2 * np.pi * f * tt) * np.exp(-tt / .006) * r_.uniform(.15, .5) + bp(nz(m), 2000, 7000, 1) * np.exp(-tt / .008) * .2)[:max(0, min(m, n - int(t * SR)))]
        t += r_.exponential(1 / dens(u))
    sw = S.noise_sweep(d, 300, 5200, rise=.8, q=1.0, g=1.0, falling_end=.7)[:n] * .25
    return ((y + sw) * .55).astype(np.float32)
def sfx_notif(g=1.0, i=0):
    kinds = [(1568, 2093), (1319, 1760), (1047, 1568), (1760, 2349)]; f1, f2 = kinds[i % 4]
    n = int(.5 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f1 * t) * np.exp(-t / .09) * (t < .16) + np.sin(2 * np.pi * f2 * np.clip(t - .1, 0, None)) * np.exp(-np.clip(t - .1, 0, None) / .12) * (t >= .1)
    return (x * .35).astype(np.float32)
def sfx_tick():
    n = int(.5 * SR); t = np.arange(n) / SR; return ((hp(nz(n), 1200, 1) * np.exp(-t / .004) * .6 + np.sin(2 * np.pi * 120 * t) * np.exp(-t / .06) * .5 + bp(nz(n), 300, 900, 1) * np.exp(-t / .03) * .25) * .6).astype(np.float32)
def sfx_drip(d):
    n = int(d * SR); y = np.zeros(n)
    for _ in range(18):
        i = int(r_.uniform(0, d - .2) * SR); m = int(.12 * SR); tt = np.arange(m) / SR; f = r_.uniform(700, 1500) * (1 + 3 * tt / .12)
        y[i:i + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .03) * r_.uniform(.15, .4)
    y += bp(nz(n), 1500, 5000, 1) * .04 * np.sin(np.pi * np.arange(n) / n)
    return y.astype(np.float32)
def sfx_knock():
    out = np.zeros(int(1.2 * SR), np.float32)
    for k, t0 in enumerate((0, .24, .46)):
        m = int(.2 * SR); tt = np.arange(m) / SR; i = int(t0 * SR)
        out[i:i + m] += (np.sin(2 * np.pi * (170 - 20 * k) * tt) * np.exp(-tt / .05) * .8 + bp(nz(m), 300, 1500, 1) * np.exp(-tt / .012) * .5).astype(np.float32)
    return out * .6

