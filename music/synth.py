import numpy as np, scipy.signal as ss
SR = 48000
rng = np.random.default_rng(11)
PC = {'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def nn(name):
    p = PC[name[0]]; i = 1
    if name[i] == '#': p += 1; i += 1
    elif name[i] == 'b': p -= 1; i += 1
    return 12 * (int(name[i:]) + 1) + p
def mf(m): return 440.0 * 2 ** ((m - 69) / 12)
def pan_gains(p): a = (p + 1) * np.pi / 4; return np.cos(a), np.sin(a)

class Bus:
    def __init__(self, T=60.0):
        self.N = int(SR * T); self.L = np.zeros(self.N, np.float32); self.R = np.zeros(self.N, np.float32)
    def add(self, sig, t0, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i >= self.N or i + len(sig) <= 0: return
        a = max(0, -i); b = min(len(sig), self.N - i)
        gl, gr = pan_gains(pan)
        seg = sig[a:b].astype(np.float32) * g
        self.L[i + a:i + b] += seg * gl; self.R[i + a:i + b] += seg * gr
    def add_st(self, sl, sr_, t0, g=1.0):
        i = int(round(t0 * SR)); b = min(len(sl), self.N - i)
        if b <= 0: return
        self.L[i:i + b] += sl[:b].astype(np.float32) * g; self.R[i:i + b] += sr_[:b].astype(np.float32) * g

def env_pad(n, att, rel, dur_sustain):
    t = np.arange(n) / SR
    a = np.clip(t / max(att, 1e-3), 0, 1); a = a * a * (3 - 2 * a)
    r = np.clip(1 - (t - dur_sustain) / max(rel, 1e-3), 0, 1); r = r * r * (3 - 2 * r)
    return (a * r).astype(np.float32)

def harm_voice(f, n, shape_fn, vib=0.0, vib_rate=5.3, phase0=None, vib_delay=1.0):
    t = np.arange(n) / SR
    vf = 1 + vib * np.sin(2 * np.pi * vib_rate * t + (phase0 or 0)) * np.clip(t / vib_delay, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vf) / SR + (phase0 or 0)
    H = max(1, min(40, int(14000 / f)))
    ks = np.arange(1, H + 1)
    amps = shape_fn(ks, f)
    out = np.zeros(n, np.float32)
    for k, a in zip(ks, amps):
        if a < 1e-4: continue
        out += (a * np.sin(k * ph)).astype(np.float32)
    return out

def strings_note(f, dur, att=0.9, rel=1.2, bright=2600, vib=0.003, det=(-8, 0, 8)):
    n = int((dur + rel) * SR); out = np.zeros(n, np.float32)
    sh = lambda ks, ff: 1.0 / ks / (1 + (ks * ff / bright) ** 2)
    for c in det:
        out += harm_voice(f * 2 ** (c / 1200), n, sh, vib=vib, phase0=rng.uniform(0, 6.28))
    out *= env_pad(n, att, rel, dur) / (len(det) * 1.6)
    return out

FORM = {  # vowel formants (Hz, gain, bandwidth)
 'ah_m': [(650, 1.0, 110), (1080, .55, 130), (2650, .22, 220)],
 'oo_m': [(320, 1.0, 90), (870, .35, 120), (2250, .10, 200)],
 'ah_f': [(850, 1.0, 130), (1220, .5, 150), (2810, .2, 260)],
 'oo_f': [(340, 1.0, 90), (750, .3, 120), (2530, .10, 200)],
}
def choir_note(f, dur, vowel='ah_m', att=1.2, rel=1.4, vib=0.0045, voices=3, bright=1.0):
    n = int((dur + rel) * SR); out = np.zeros(n, np.float32)
    fm = FORM[vowel]
    def sh(ks, ff):
        fr = ks * ff
        g = 0.04 + sum(gg * np.exp(-0.5 * ((fr - F) / bw) ** 2) for F, gg, bw in fm)
        return g / ks ** 0.55 * (1 / (1 + (fr / (5200 * bright)) ** 4))
    for i in range(voices):
        c = (-14, 0, 14, -7, 7)[i % 5]
        out += harm_voice(f * 2 ** (c / 1200), n, sh, vib=vib, vib_rate=5.0 + 0.4 * i, phase0=rng.uniform(0, 6.28), vib_delay=1.4)
    # breath
    nz = rng.standard_normal(n).astype(np.float32)
    sos = ss.butter(2, [900, 3800], 'bp', fs=SR, output='sos'); nz = ss.sosfilt(sos, nz) * 0.018
    out = (out / voices * 0.8 + nz) * env_pad(n, att, rel, dur)
    return out

def brass_note(f, dur, att=0.12, rel=0.5, peak=4200, scoop=0.0, vib=0.002):
    n = int((dur + rel) * SR); t = np.arange(n) / SR
    bright_t = np.clip(t / (att * 2.2 + 0.05), 0, 1)
    fs = f * (1 - scoop * np.exp(-t / 0.07))
    vf = 1 + vib * np.sin(2 * np.pi * 5.6 * t) * np.clip(t / 0.5, 0, 1)
    ph = 2 * np.pi * np.cumsum(fs * vf) / SR + rng.uniform(0, 6.28)
    H = max(1, min(36, int(13000 / f))); out = np.zeros(n, np.float32)
    for k in range(1, H + 1):
        fc_t = 700 + (peak - 700) * bright_t
        a = (1.0 / k ** 0.85) * np.clip((fc_t - k * f) / (fc_t * 0.7) + 0.35, 0, 1) * (1 / (1 + (k * f / 9000) ** 2))
        out += (a * np.sin(k * ph)).astype(np.float32)
    return out * env_pad(n, att, rel, dur) * 0.5

def pluck(f, dur=1.6, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n, np.float32)
    ph0 = rng.uniform(0, 6.28)
    for k in range(1, 11):
        if k * f > 12000: break
        a = (1.0 / k ** 1.15) * (bright if k > 3 else 1.0)
        out += (a * np.sin(2 * np.pi * k * f * (1 + 0.0004 * k * k) * t + ph0 * k) * np.exp(-t * (2.0 + 0.9 * k))).astype(np.float32)
    out *= np.minimum(1, t / 0.002)
    return out * 0.6

def bell(f, dur=3.2, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n, np.float32)
    for r, a, d in ((1, 1, 1.6), (2.0, .45, 2.0), (2.76, .55, 2.4), (4.07, .28, 3.0), (5.4, .22, 3.6), (6.8, .12, 4.4)):
        if f * r > 14000: continue
        out += (a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.28)) * np.exp(-t * d)).astype(np.float32)
    out *= np.minimum(1, t / 0.002)
    return out * 0.35 * g

def timpani(fb=70.0, dur=2.4, hard=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = fb * (1 + 0.9 * np.exp(-t / 0.035))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    body = np.sin(ph) * np.exp(-t / 0.55) + 0.45 * np.sin(1.5 * ph) * np.exp(-t / 0.3) + 0.25 * np.sin(2.0 * ph) * np.exp(-t / 0.2)
    nz = ss.sosfilt(ss.butter(2, 900, 'lp', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.03) * 1.3 * hard
    out = (body + nz).astype(np.float32); out *= np.minimum(1, t / 0.001)
    return out * 0.9

def sub_boom(f=42.0, dur=3.2):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + 1.2 * np.exp(-t / 0.09)); ph = 2 * np.pi * np.cumsum(fr) / SR
    out = np.sin(ph) * np.exp(-t / 1.1) + 0.3 * np.sin(2 * ph) * np.exp(-t / 0.4)
    rumble = ss.sosfilt(ss.butter(2, 160, 'lp', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 1.0) * 1.5
    return ((out + rumble) * np.minimum(1, t / 0.002)).astype(np.float32)

def crash(dur=4.5, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n); nz = ss.sosfilt(ss.butter(3, 3200, 'hp', fs=SR, output='sos'), nz)
    env = np.exp(-t / 1.3) * np.minimum(1, t / 0.004) * 0.7 + np.exp(-t / 0.18) * 0.5
    return (nz * env * 0.35 * g).astype(np.float32)

def noise_sweep(dur, f0, f1, rise=2.0, q=0.9, g=1.0, falling_end=0.0):
    """bandpass-swept noise, chunked; amplitude grows ~ t^rise."""
    n = int(dur * SR); nz = rng.standard_normal(n); out = np.zeros(n); chunk = 1024
    zi = None; lf = np.linspace(np.log(f0), np.log(f1), n // chunk + 1)
    for i in range(0, n, chunk):
        fc = np.exp(lf[i // chunk]); lo = max(60, fc * (1 - 0.45 * q)); hi = min(SR / 2 - 100, fc * (1 + 0.8 * q))
        sos = ss.butter(2, [lo, hi], 'bp', fs=SR, output='sos')
        if zi is None or zi.shape != (sos.shape[0], 2): zi = np.zeros((sos.shape[0], 2))
        seg, zi = ss.sosfilt(sos, nz[i:i + chunk], zi=zi); out[i:i + chunk] = seg
    t = np.arange(n) / SR; e = (t / dur) ** rise
    if falling_end > 0: e *= np.clip((dur - t) / falling_end, 0, 1)
    return (out * e * 1.8 * g).astype(np.float32)

def page_turn(dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = ss.sosfilt(ss.butter(2, [1400, 6500], 'bp', fs=SR, output='sos'), rng.standard_normal(n))
    env = (np.minimum(1, t / 0.05) * np.exp(-t / 0.13)) * (1 + 0.6 * np.sin(2 * np.pi * 34 * t))
    th = np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.05) * 0.4
    return (nz * env * 0.45 + th).astype(np.float32)

def whoosh(dur=1.0, f0=300, f1=5000, g=1.0, peak=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = noise_sweep(dur, f0, f1, rise=1.0, q=1.2, g=1.0)
    x = t / dur; e = np.sin(np.pi * np.clip(x / (2 * peak) if x.size else x, 0, 1)) ; 
    e = np.where(x < peak, np.sin(0.5 * np.pi * x / peak) ** 2, np.cos(0.5 * np.pi * (x - peak) / (1 - peak)) ** 2)
    return (s / max(1e-6, np.abs(s).max()) * e * 0.5 * g).astype(np.float32)

def thunder(dur=3.4):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = ss.sosfilt(ss.butter(2, 500, 'lp', fs=SR, output='sos'), rng.standard_normal(n))
    env = (1 - np.exp(-t / 0.02)) * (np.exp(-t / 0.9) * 0.8 + 0.25 * np.abs(np.sin(2 * np.pi * 3.1 * t)) * np.exp(-t / 1.6))
    crack = ss.sosfilt(ss.butter(2, 2500, 'hp', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.05) * 0.8
    return ((nz * env * 1.3 + crack) * 0.5).astype(np.float32)

def make_ir(rt=3.4, seed=3):
    r = np.random.default_rng(seed); n = int(SR * rt * 1.15); t = np.arange(n) / SR
    out = []
    for ch in range(2):
        x = r.standard_normal(n) * np.exp(-6.9 * t / rt)
        # darker with time
        y = np.zeros(n); segs = 8
        for i in range(segs):
            a, b = int(n * i / segs), int(n * (i + 1) / segs)
            fc = 9000 * (0.35 ** (i / (segs - 1)))
            sos = ss.butter(1, fc, 'lp', fs=SR, output='sos')
            y[a:b] = ss.sosfilt(sos, x[a:b])
        pd = int(0.022 * SR); y = np.concatenate([np.zeros(pd), y])[:n]
        out.append(y.astype(np.float32))
    nrm = np.sqrt((out[0] ** 2).sum()); return out[0] / nrm, out[1] / nrm

def reverb(L, R, ir, wet=1.0):
    from scipy.signal import fftconvolve
    return fftconvolve(L, ir[0])[:len(L)].astype(np.float32) * wet, fftconvolve(R, ir[1])[:len(R)].astype(np.float32) * wet
