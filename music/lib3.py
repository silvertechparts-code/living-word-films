"""Episode 02 score, nature/city ambience and sound effects (original, synthesised with numpy).
Outputs (48 kHz stereo float WAV): out2/music.wav, out2/amb.wav, out2/sfx.wav
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

