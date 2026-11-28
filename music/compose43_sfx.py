"""Episode 43 ambience + sound effects (original, synthesised). Events follow the film's own timings (g11/src/world43.js, main43.js, reflect43.js).
Outputs: out43/amb.wav, out43/sfx.wav
"""
import sys, re, json, numpy as np, scipy.signal as ss, soundfile as sf
sys.path.insert(0, '/home/claude/music')
from lib3_sfx import *     # helpers, buses AMB / SFX, r_, S, SR ...

def night_bed(t0, t1, level, fade=1.6):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); ch = []
    for c in range(2):
        y = lp(nz(n), 120, 3) * 1.4 + bp(nz(n), 2500, 6000, 1) * .012 + np.sin(2 * np.pi * 118 * t) * .01
        ch.append((y * env * level).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)

def sfx_hiss(d):
    n = int(d * SR); t = np.arange(n) / SR; u = t / d
    x = bp(nz(n), 3500, 9500, 2) * (.55 + .45 * np.sin(2 * np.pi * 7.5 * t + 1.0)) ** 1.6 * np.sin(np.pi * np.clip(u * 1.05, 0, 1)) ** 1.2
    low = bp(nz(n), 300, 1400, 2) * .1 * np.sin(np.pi * u); rat = np.zeros(n)
    for _ in range(int(d * 9)):
        i = int(r_.uniform(0, d - .06) * SR); m = int(.02 * SR); rat[i:i + m] += hp(nz(m), 1500, 1) * np.exp(-np.arange(m) / SR / .006) * r_.uniform(.1, .35)
    return ((x * .5 + low + rat * .35) * .6).astype(np.float32)
def sfx_crunch():
    n = int(.5 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, t0 in enumerate((0, .045, .095)):
        i = int(t0 * SR); m = int(.09 * SR); tt = np.arange(m) / SR; y[i:i + m] += bp(nz(m), 900, 5200, 2) * np.exp(-tt / .02) * (.9 - .22 * k)
    y += np.sin(2 * np.pi * 95 * t) * np.exp(-t / .07) * .5
    return (y * .6).astype(np.float32)
def sfx_shatter():
    n = int(3.2 * SR); y = np.zeros(n); t = np.arange(n) / SR
    for _ in range(46):
        t0 = r_.exponential(.28); t0 = min(t0, 1.6); i = int(t0 * SR); m = n - i; tt = np.arange(m) / SR; f = r_.uniform(1700, 7200)
        y[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / r_.uniform(.12, .55)) * r_.uniform(.06, .22)
    y += hp(nz(n), 3000, 2) * np.exp(-t / .22) * .5 + lp(nz(n), 300, 2) * np.exp(-t / .12) * 1.2
    return (y * .55).astype(np.float32)
def sfx_heartbeat(d):
    n = int(d * SR); y = np.zeros(n + int(.6 * SR)); t = 0.0; k = 0
    while t < d - .6:
        for dt, f, a in ((0, 62, 1.0), (.23, 52, .7)):
            i = int((t + dt) * SR); m = int(.4 * SR); tt = np.arange(m) / SR
            y[i:i + m] += np.sin(2 * np.pi * f * tt * (1 + .25 * np.exp(-tt / .05))) * np.exp(-tt / .09) * a * (n - i > m)
        t += 1.2 - .0 * k; k += 1
    y = y[:n]; env = np.clip(np.minimum(np.arange(n) / SR / 1.2, (d - np.arange(n) / SR) / 1.5), 0, 1)
    return (y * env * .55).astype(np.float32)
def sfx_snap():
    n = int(2.2 * SR); t = np.arange(n) / SR
    y = bp(nz(n), 700, 4200, 2) * np.exp(-t / .012) * 1.1 + np.sin(2 * np.pi * 210 * t) * np.exp(-t / .06) * .6 + np.sin(2 * np.pi * 95 * t) * np.exp(-t / .2) * .6
    tw = np.sin(2 * np.pi * (180 + 40 * np.exp(-t / .2)) * t) * np.exp(-t / .5) * .22 * (t > .02)
    return ((y + tw) * .6).astype(np.float32)
def sfx_planks(d):
    n = int((d + .3) * SR); y = np.zeros(n); t = .0; gap = .06
    while t < d:
        i = int(t * SR); m = int(.18 * SR); tt = np.arange(m) / SR; a = r_.uniform(.3, 1) * (1 - t / (d * 1.1))
        y[i:i + m] += (np.sin(2 * np.pi * r_.uniform(140, 330) * tt) * np.exp(-tt / .04) * .7 + bp(nz(m), 400, 2200, 1) * np.exp(-tt / .012) * .6) * a
        gap *= 1.17; t += gap + r_.uniform(0, .05)
    return (y * .55).astype(np.float32)
def sfx_clack(k=0):
    m = int(.2 * SR); tt = np.arange(m) / SR; f = 250 + 25 * k
    return ((np.sin(2 * np.pi * f * tt) * np.exp(-tt / .035) * .7 + bp(nz(m), 700, 2800, 1) * np.exp(-tt / .01) * .55) * .6).astype(np.float32)


# ---- Episode 8 sound palette: rain, sea, thunder, timber, door, animals
def lvl_env(n, keys):
    t = np.arange(n) / SR; ks = np.array(keys, float); return np.interp(t, ks[:, 0], ks[:, 1]).astype(np.float32)
def rain_bed(t0, t1, keys, fade=1.5):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        hiss = bp(nz(n), 1800, 9500, 2) * (.8 + .2 * smooth_noise(n, 2.5)) * .5 + bp(nz(n), 500, 2200, 2) * .22 + lp(nz(n), 300, 2) * .1
        y = hiss.astype(np.float32)
        for _ in range(int((t1 - t0) * 70)):
            i = int(r_.uniform(0, t1 - t0 - .05) * SR); m = int(r_.uniform(.004, .014) * SR); tt = np.arange(m) / SR
            y[i:i + m] += (hp(nz(m), 2500, 1) * np.exp(-tt / .003) * r_.uniform(.1, .5)).astype(np.float32) * .35
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def sea_bed(t0, t1, keys, fade=2.0):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        sw = np.clip(.5 + .5 * smooth_noise(n, .22), 0, 1.3) ** 1.5
        y = lp(nz(n), 420, 2) * 1.5 * sw + bp(nz(n), 400, 1800, 2) * .22 * sw + lp(nz(n), 90, 3) * 1.0
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def room_bed(t0, t1, level, fade=1.0):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); ch = []
    for c in range(2):
        y = lp(nz(n), 160, 3) * 1.5 + np.sin(2 * np.pi * 58 * t) * .05 + bp(nz(n), 600, 1400, 1) * .012
        ch.append((y * env * level).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def sfx_thunder(d):
    n = int(d * SR); t = np.arange(n) / SR; crack = hp(nz(n), 1200, 2) * np.exp(-t / .06) * .35
    roll = lp(nz(n), 150, 3) * 2.4 * (np.exp(-t / (d * .38)) * (.6 + .4 * np.sin(2 * np.pi * (1.1 + 1.3 * t / d) * t) ** 2)) + lp(nz(n), 55, 3) * 3 * np.exp(-t / (d * .5))
    return ((crack + roll) * np.minimum(1, t / .05) * .55).astype(np.float32)
def sfx_creak(d):
    n = int(d * SR); t = np.arange(n) / SR; f = 95 + 70 * smooth_noise(n, .8) * .5 + 40 * np.sin(2 * np.pi * .35 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    saw = (np.sin(ph) + .55 * np.sin(2 * ph) + .35 * np.sin(3 * ph) + .2 * np.sin(5 * ph)) * (.55 + .45 * np.clip(smooth_noise(n, 6), -1, 1))
    x = bp(saw, 140, 1100, 2) * .5 + bp(nz(n), 300, 1600, 2) * .08 * (.5 + .5 * smooth_noise(n, 9) ** 2)
    env = np.minimum(1, t / .6) * np.clip((d - t) / .9, 0, 1); return (x * env * .6).astype(np.float32)
def sfx_door():
    n = int(2.6 * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (68 - 18 * (1 - np.exp(-t / .12))) * t) * np.exp(-t / .38) * 1.0 + np.sin(2 * np.pi * 40 * t) * np.exp(-t / .6) * .7
    wood = bp(nz(n), 160, 1100, 2) * np.exp(-t / .07) * .8 + bp(nz(n), 1200, 3800, 2) * np.exp(-t / .02) * .35
    lat = np.zeros(n); i = int(.22 * SR); m = int(.12 * SR); tt = np.arange(m) / SR; lat[i:i + m] = (np.sin(2 * np.pi * 420 * tt) * np.exp(-tt / .025) * .3 + bp(nz(m), 1500, 5000, 1) * np.exp(-tt / .008) * .4)
    rev = lp(nz(n), 240, 2) * np.exp(-t / .9) * .4
    return ((thud + wood + lat + rev) * .6).astype(np.float32)
def sfx_burst(d):
    n = int(d * SR); t = np.arange(n) / SR; rush = bp(nz(n), 500, 6500, 2) * np.minimum(1, t / .25) * np.exp(-t / (d * .5)) * .9 + lp(nz(n), 180, 2) * 1.6 * np.minimum(1, t / .2) * np.exp(-t / (d * .6))
    for _ in range(int(d * 26)):
        i = int(r_.uniform(0, d - .2) * SR); m = int(r_.uniform(.03, .09) * SR); tt = np.arange(m) / SR; f = r_.uniform(300, 1500) * (1 + 3 * tt / (m / SR))
        rush[i:i + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .02) * r_.uniform(.03, .1)
    return (rush * .5).astype(np.float32)
def hoof(k=0):
    m = int(.18 * SR); tt = np.arange(m) / SR; f = 150 + 18 * (k % 5)
    return ((np.sin(2 * np.pi * f * tt) * np.exp(-tt / .03) * .7 + bp(nz(m), 500, 2600, 1) * np.exp(-tt / .008) * .5) * .5).astype(np.float32)
def formant_voice(f0, d, forms, vib=0.0, drop=0.0, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 - drop * t / d) * (1 + .05 * np.sin(2 * np.pi * vib * t)) if vib else f0 * (1 - drop * t / d)
    src = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in range(1, 14)); y = sum(bp(src, a, b, 2) for a, b in forms) * np.sin(np.pi * t / d) ** .7
    return (y * g * .22).astype(np.float32)
def sfx_bleat(): return formant_voice(380, .62, [(600, 900), (1100, 1600)], vib=28, drop=.12)
def sfx_moo(): return formant_voice(112, 1.5, [(300, 520), (700, 1000)], vib=5, drop=.2, g=1.0)


# ---- Episode 8 additions
def sfx_flutter(d, rate=9.0, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n); k = 0; tt_ = 0.0
    while tt_ < d - .05:
        i = int(tt_ * SR); m = int(.05 * SR); u = np.arange(m) / SR
        y[i:i + m] += bp(nz(m), 900, 3800, 2) * np.exp(-u / .014) * (.5 + .5 * np.sin(np.pi * tt_ / d)) * r_.uniform(.5, 1.0) + np.sin(2 * np.pi * 220 * u) * np.exp(-u / .02) * .12
        tt_ += 1 / rate * (1 + .12 * r_.standard_normal())
    env = np.minimum(1, t / .25) * np.clip((d - t) / .35, 0, 1)
    return (y * env * g * .45).astype(np.float32)
def sfx_caw():
    a = formant_voice(300, .46, [(550, 950), (1300, 2100)], vib=0, drop=.35, g=2.4)
    return a
def sfx_coo():
    return formant_voice(430, .7, [(500, 800), (1500, 2100)], vib=6, drop=-.1, g=1.4)
def sfx_thump(f=70, d=1.2, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * f * (1 + .3 * np.exp(-t / .04)) * t) * np.exp(-t / .22) + bp(nz(n), 150, 900, 2) * np.exp(-t / .03) * .5) * g * .7).astype(np.float32)
def sfx_stone():
    n = int(1.0 * SR); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * 95 * t) * np.exp(-t / .16) * .8 + bp(nz(n), 400, 3000, 2) * np.exp(-t / .02) * .7 + np.sin(2 * np.pi * 420 * t) * np.exp(-t / .03) * .25) * .55).astype(np.float32)

def murmur_bed(t0, t1, level, fade=2.0):
    """a table of people talking quietly: band-limited noise with slow syllable-like modulation (no words)"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); ch = []
    for c in range(2):
        v = bp(nz(n), 180, 2600, 2) * np.clip(.45 + .55 * smooth_noise(n, 3.2), 0, 1.6) ** 1.4 + bp(nz(n), 300, 1100, 2) * np.clip(.4 + .6 * smooth_noise(n, 5.0), 0, 1.6) ** 1.6 * .8
        ch.append((v * env * level * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def sfx_clink(k=0):
    m = int(.5 * SR); tt = np.arange(m) / SR; f = 2300 + 260 * (k % 4)
    return ((np.sin(2 * np.pi * f * tt) * np.exp(-tt / .12) * .5 + np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / .05) * .25) * .5).astype(np.float32)
def thread_sfx(t0, g=.3, pan=0.0, d=1.4):
    SFX.add(S.whoosh(d, 500, 3800, .6, .4), t0, g, pan); SFX.add(sparkle(1.0, int(t0 * 10) % 97 + 3), t0 + .1, g * .8, pan)

def cicada_bed(t0, t1, keys, fade=2.0):
    """noon heat: a shimmering, pulsed high band (no tune), level follows keys"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        pulse = np.clip(.5 + .5 * np.sin(2 * np.pi * (36 + 3 * smooth_noise(n, .4)) * t + c), 0, 1) ** 1.5 * np.clip(.6 + .4 * smooth_noise(n, .5), 0, 1.4)
        y = bp(nz(n), 4200, 7600, 2) * pulse * .6 + bp(nz(n), 2600, 4000, 1) * .05
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def cricket_bed(t0, t1, keys, fade=2.5):
    """evening: soft pulsed chirps around 3.6 kHz, irregular, level follows keys"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        y = np.zeros(n)
        for f0, r0 in ((3500, 5.1), (3900, 4.3), (3200, 6.2)):
            gate = np.clip(np.sin(2 * np.pi * (.55 + .12 * r_.random()) * t + r_.random() * 6) * 3, 0, 1)
            y += np.sin(2 * np.pi * f0 * t + 2 * np.sin(2 * np.pi * r0 * t)) * (.5 + .5 * np.sin(2 * np.pi * r0 * 2.0 * t)) ** 2 * gate * .12
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)


def fire_bed(t0, t1, keys, fade=1.2):
    """a big fire: low roar, wide hiss and hard crackles, level follows keys"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        y = lp(nz(n), 160, 3) * 2.2 * (.7 + .3 * smooth_noise(n, .5)) + bp(nz(n), 400, 3200, 2) * .26 * np.clip(.6 + .4 * smooth_noise(n, 1.4), 0, 1.5) + bp(nz(n), 3000, 9000, 1) * .04
        for _ in range(int((t1 - t0) * 34)):
            i = int(r_.uniform(0, t1 - t0 - .05) * SR); m = int(r_.uniform(.004, .03) * SR)
            y[i:i + m] += hp(nz(m), 1500, 1) * np.exp(-np.arange(m) / SR / r_.uniform(.003, .01)) * r_.uniform(.15, .8) * .4
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def crowd_shout(t0, t1, level, seed=0):
    """an angry crowd: men's voices (no words) rising and falling, a low murmur under them"""
    rr = np.random.default_rng(seed + 5); n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / 1.2, (t1 - t0 - t) / 1.2), 0, 1); ch = []
    for c in range(2):
        v = bp(nz(n), 160, 2400, 2) * np.clip(.4 + .6 * smooth_noise(n, 4.0), 0, 1.6) ** 1.5 * .8
        ch.append((v * env * level * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
    for _ in range(int((t1 - t0) * 1.6)):
        d = rr.uniform(.45, .95); f0 = rr.uniform(105, 165)
        AMB.add(formant_voice(f0, d, [(500, 900), (1000, 1600)], vib=5, drop=rr.uniform(.05, .3), g=rr.uniform(.8, 1.6)), t0 + rr.uniform(0, t1 - t0 - d), level * .5, pan=rr.uniform(-.7, .7))


def sfx_roll(d):
    """a heavy stone rolled over dry ground: a low rumble with a slow grinding pulse, then a soft settling thud"""
    n = int(d * SR); t = np.arange(n) / SR; u = t / d
    env = np.minimum(1, t / .25) * np.clip((d - t) / .5, 0, 1)
    rum = lp(nz(n), 140, 3) * 2.4 * (.6 + .4 * np.sin(2 * np.pi * 1.7 * t) ** 2) + lp(nz(n), 60, 3) * 1.6
    gr = bp(nz(n), 300, 1800, 2) * .3 * (.5 + .5 * np.sin(2 * np.pi * 3.4 * t + 1.0)) ** 2
    y = (rum + gr) * env
    i = int((d - .35) * SR); m = n - i; tt = np.arange(m) / SR
    y[i:] += np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / .12) * .9 + bp(nz(m), 200, 1400, 2) * np.exp(-tt / .03) * .5
    return (y * .5).astype(np.float32)
def sfx_cloth(d=.9):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp(nz(n), 400, 3200, 2) * np.sin(np.pi * t / d) ** 1.6 * .22).astype(np.float32)


def sfx_pour(d=1.6):
    """water poured from a jar: a bright, bubbling stream that thins out at the end"""
    n = int(d * SR); t = np.arange(n) / SR; u = t / d
    env = np.minimum(1, t / .12) * np.clip((d - t) / .5, 0, 1)
    y = bp(nz(n), 900, 5200, 2) * (.55 + .45 * smooth_noise(n, 9.0)) * .5 + bp(nz(n), 300, 1200, 2) * .18 * (.5 + .5 * np.sin(2 * np.pi * 7 * t))
    for _ in range(int(d * 26)):
        i = int(r_.uniform(0, d - .08) * SR); m = int(.05 * SR); tt = np.arange(m) / SR; f = r_.uniform(500, 1500) * (1 + 1.5 * tt / .05)
        y[i:i + m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / .015) * r_.uniform(.1, .35) * (1 - .6 * u[i])
    return (y * env * .5).astype(np.float32)
def sfx_camel_grunt(): return formant_voice(88, .9, [(300, 520), (800, 1150)], vib=6, drop=.3, g=1.0)


def sfx_baby_cry(d=.55, f0=470, g=1.0):
    """a newborn's cry: a short, high, wavering formant call that falls at the end (no words)"""
    return formant_voice(f0, d, [(750, 1200), (1800, 2700)], vib=7.0, drop=.18, g=g * 1.5)
def pot_bed(t0, t1, keys, fade=1.2):
    """a pot simmering on a fire: soft bubbling pops over a low, wet murmur; level follows keys"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        y = lp(nz(n), 260, 2) * .5 * (.6 + .4 * smooth_noise(n, 1.1)) + bp(nz(n), 500, 2200, 2) * .06
        for _ in range(int((t1 - t0) * 9)):
            i = int(r_.uniform(0, t1 - t0 - .1) * SR); m = int(.07 * SR); tt = np.arange(m) / SR; f = r_.uniform(260, 620) * (1 + 1.6 * tt / .07)
            y[i:i + m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / .018) * r_.uniform(.08, .3)
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def sfx_spoon(k=0):
    m = int(.3 * SR); tt = np.arange(m) / SR; f = 1900 + 190 * (k % 3)
    return ((np.sin(2 * np.pi * f * tt) * np.exp(-tt / .06) * .4 + bp(nz(m), 900, 3600, 1) * np.exp(-tt / .01) * .4) * .5).astype(np.float32)


# ---- Episode 27 palette: wells, earth, spades, spring water, a quarrel, flocks
def sfx_earth(d=1.0):
    """earth tipped into a well: a dull heavy thud, a slide of grit, a few stones rattling"""
    n = int(d * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (62 - 14 * (1 - np.exp(-t / .1))) * t) * np.exp(-t / .2) * .9 + lp(nz(n), 220, 2) * np.exp(-t / .12) * 1.2
    slide = bp(nz(n), 300, 2600, 2) * np.exp(-t / (d * .35)) * np.minimum(1, t / .03) * .45
    y = thud + slide
    for _ in range(int(d * 22)):
        i = int(r_.uniform(.03, d - .08) * SR); m = int(.05 * SR); tt = np.arange(m) / SR
        y[i:i + m] += bp(nz(m), 500, 3200, 1) * np.exp(-tt / .012) * r_.uniform(.06, .22) * np.exp(-i / SR / (d * .5))
    return (y * .55).astype(np.float32)
def sfx_spade():
    """a spade biting into dry ground, then a soft scrape and drop of earth"""
    n = int(.7 * SR); t = np.arange(n) / SR
    bite = bp(nz(n), 700, 3600, 2) * np.exp(-t / .018) * 1.0 + np.sin(2 * np.pi * 120 * t) * np.exp(-t / .05) * .55
    sc = bp(nz(n), 300, 1800, 2) * np.exp(-(t - .08).clip(0) / .12) * (t > .08) * .35
    drop = np.zeros(n); i = int(.34 * SR); m = int(.2 * SR); tt = np.arange(m) / SR; drop[i:i + m] = lp(nz(m), 400, 2) * np.exp(-tt / .06) * .5 + bp(nz(m), 400, 2200, 1) * np.exp(-tt / .02) * .3
    return ((bite + sc + drop) * .6).astype(np.float32)
def stream_bed(t0, t1, keys, fade=1.0):
    """spring water rising in a well and trickling: a bright bubbling murmur, level follows keys"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        y = bp(nz(n), 900, 5200, 2) * (.5 + .5 * smooth_noise(n, 7.0)) * .4 + bp(nz(n), 300, 1100, 2) * .12 * (.6 + .4 * smooth_noise(n, 2.0))
        for _ in range(int((t1 - t0) * 16)):
            i = int(r_.uniform(0, t1 - t0 - .09) * SR); m = int(.05 * SR); tt = np.arange(m) / SR; f = r_.uniform(500, 1500) * (1 + 1.6 * tt / .05)
            y[i:i + m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / .015) * r_.uniform(.06, .22)
        ch.append((y * env * lv * .5).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)
def seed_patter(t0, t1, g=.04, rate=14):
    """seed scattered on dry earth: light, quick, random ticks"""
    for _ in range(int((t1 - t0) * rate)):
        t_ = r_.uniform(t0, t1 - .05); m = int(.035 * SR); tt = np.arange(m) / SR
        SFX.add((hp(nz(m), 2200, 1) * np.exp(-tt / .006) * .7 + np.sin(2 * np.pi * r_.uniform(900, 1700) * tt) * np.exp(-tt / .01) * .15).astype(np.float32), t_, g * r_.uniform(.5, 1.0), r_.uniform(-.5, .5))




# ---- Episode 28 palette: the road, a stone pillow, a stairway of light, the dawn
def light_hum(t0, t1, keys, fade=1.5):
    """a soft, wide celestial hum: three slow sines with a gentle shimmer (no melody); level follows keys"""
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; env = np.clip(np.minimum(t / fade, (t1 - t0 - t) / fade), 0, 1); lv = lvl_env(n, keys); ch = []
    for c in range(2):
        y = sum(np.sin(2 * np.pi * f * t + c * .7 + k) * (.55 + .45 * np.sin(2 * np.pi * (.11 + .03 * k) * t + k)) * a for k, (f, a) in enumerate(((146.8, 1.0), (220.0, .7), (293.7, .5), (440.0, .22))))
        y = y + bp(nz(n), 2400, 5200, 1) * .018 * (.5 + .5 * np.sin(2 * np.pi * .23 * t + c))
        ch.append((y * env * lv * .3).astype(np.float32))
    AMB.add_st(ch[0], ch[1], t0)



# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 43). Times follow world43.js / main43.js / reflect43.js
TW = lambda t: float(np.interp(t, [60, 61.4, 66.9, 72.4, 79.0, 86.1, 91.1], [60, 61.8, 67.6, 73.0, 78.8, 85.0, 90.0]))   # shared reflection timings -> Ep43 narration (h1 61.8, h2 67.6, h3 73.0, h4 78.8)
wind_bed(0.0, 24.8, .045, 2.0); wind_bed(24.4, 48.0, .05, 2.0); wind_bed(47.6, 61.0, .055, 2.0); wind_bed(60.5, 90.4, .07, 2.0)   # the dry camp, the road and Joseph's house, the chamber and the meal, the reflection
water_bed(0.0, 25.0, .05, 1.2); water_bed(24.4, 27.0, .04, 1.0)                                                                  # the river by Jacob's camp (43:1-14), the road to Egypt
bird_bed(26.4, 56.0, .05, .02, 7)                                                                                                # Joseph's courtyard in the morning
murmur_bed(31.4, 35.6, .012, 1.0); murmur_bed(56.9, 61.4, .014, 1.2)                                                             # the brothers uneasy at the gate, the table at the meal
room_bed(49.2, 53.6, .03, .8)                                                                                                    # the private chamber
fire_bed(61.0, 80.6, [(61.0, 0), (63.0, .02), (TW(78.0), .02), (TW(80.6), 0)], 1.2)                                             # the lamp-lit house in the reflection
bird_bed(66.0, 85.0, .12, .045, 11)                                                                                              # a calm evening
# 0 - 6.5 the famine; Jacob says: go back and buy us more food (43:1-2): dry wind, a dead branch, a low unease
SFX.add(sfx_low(), 0.4, .04, 0); SFX.add(sfx_leaf(1.4), 1.2, .03, -.3); SFX.add(sfx_leaf(1.0), 2.2, .025, .3); SFX.add(sfx_cloth(.9), 3.6, .025, 0)
# 6.5 - 17 Judah steps forward and pledges himself (43:8-9): steps, cloth, a held low note, a slow heartbeat on 'let me bear the blame'
for k_ in range(3): SFX.add(sfx_step(), 6.5 + .32 * k_, .011, .2)
SFX.add(sfx_cloth(.9), 8.0, .03, 0); SFX.add(sfx_low(), 9.0, .045, 0); SFX.add(sfx_cloth(.8), 12.0, .025, .2)
SFX.add(sfx_heartbeat(3.4), 13.4, .025, 0); SFX.add(sfx_low(), 14.6, .05, 0)
# 16.4 - 24.8 the sons load the gifts and the double silver and set out with Benjamin (43:11-15); Jacob prays: sacks, silver, donkeys, cloth, a reverent swell
for k_ in range(5): SFX.add(sfx_thump(75, .8, .4), 16.8 + .55 * k_, .026, -.4 + .2 * k_)
for k_ in range(4): SFX.add(sfx_clink(k_), 17.4 + .62 * k_, .045, .3 - .2 * k_)
SFX.add(sparkle(1.0, 51), 17.8, .06, 0); SFX.add(sfx_cloth(1.0), 19.4, .03, 0)
for k_ in range(4): SFX.add(hoof(k_), 20.0 + .35 * k_, .018, -.3 + .2 * k_)
SFX.add(sfx_grow(2.0), 21.6, .07, 0); SFX.add(sfx_chime(), 22.4, .09, 0); SFX.add(sfx_low(), 23.4, .035, 0)
# 24.8 - 26.35 the road to Egypt: the sons and the loaded donkeys walking west
for k_ in range(10): SFX.add(hoof(k_), 24.9 + .15 * k_, .03 - .001 * k_, -.4 + .09 * k_)
for k_ in range(6): SFX.add(sfx_step(), 25.0 + .24 * k_, .01, .3 - .1 * k_)
# 26.35 - 31.3 Joseph sees Benjamin and orders a meal (43:16): a warm chime, steps, the steward sent to prepare
SFX.add(sfx_chime(), 27.2, .1, 0); SFX.add(sparkle(1.0, 52), 27.4, .07, 0); SFX.add(sfx_cloth(.9), 28.0, .03, 0)
for k_ in range(4): SFX.add(sfx_step(), 28.4 + .3 * k_, .011, -.2)
# 31.3 - 36 the brothers fear the silver in their sacks (43:18): sacks set down, silver clink, a low note and a quick heartbeat
SFX.add(sfx_cloth(.9), 31.6, .03, 0)
for k_ in range(3): SFX.add(sfx_thump(75, .8, .4), 32.0 + .5 * k_, .026, -.3 + .3 * k_)
SFX.add(sfx_clink(0), 33.2, .07, .1); SFX.add(sparkle(1.0, 53), 33.3, .07, 0); SFX.add(sfx_low(), 33.6, .05, 0); SFX.add(sfx_heartbeat(2.4), 33.8, .03, 0); SFX.add(sfx_riser(1.4), 34.0, .04, 0)
# 35.5 - 41.9 the steward: peace to you; Simeon is brought out (43:23): a soft chime, the gate, steps
SFX.add(sfx_grow(1.8), 35.6, .06, 0); SFX.add(sfx_chime(), 36.2, .11, 0); SFX.add(sfx_cloth(.9), 37.4, .025, 0)
SFX.add(sfx_door(), 38.4, .045, 0); SFX.add(sfx_creak(1.2), 38.6, .02, .1)
for k_ in range(5): SFX.add(sfx_step(), 38.8 + .36 * k_, .012, .3 - .12 * k_)
SFX.add(sfx_chime(), 40.6, .09, 0)
# 41.95 - 47.9 Joseph comes home; the brothers bow; 'God be gracious to you, my son' (43:26-29): cloth, knees on the ground, a warm chime
SFX.add(sfx_cloth(1.0), 42.2, .035, 0)
for k_ in range(4): SFX.add(sfx_thump(80, .8, .4), 43.1 + .13 * k_, .02, -.3 + .2 * k_)
SFX.add(sfx_cloth(.9), 45.4, .03, .1); SFX.add(sfx_chime(), 46.4, .1, 0); SFX.add(sparkle(1.0, 54), 46.6, .08, 0)
# 47.9 - 53.4 overcome with feeling, he hurries out and weeps in a private room (43:30): quick steps, a door, a held swell and a soft heartbeat
for k_ in range(5): SFX.add(sfx_step(), 47.9 + .2 * k_, .012, -.2)
SFX.add(sfx_door(), 49.0, .04, -.2); SFX.add(sfx_grow(2.4), 49.4, .1, 0); SFX.add(sfx_low(), 49.8, .05, 0); SFX.add(sfx_heartbeat(3.0), 50.0, .025, 0); SFX.add(sfx_chime(), 51.2, .1, 0)
# 53.1 - 56.1 he washes his face (43:31): a jar, water poured, cloth
SFX.add(sfx_cloth(.8), 53.4, .025, 0); SFX.add(sfx_pour(1.6), 54.4, .05, -.2); SFX.add(sfx_cloth(.8), 56.0, .025, 0)
# 56.85 - 61.9 the meal is served; Benjamin's portion five times larger (43:31-34): plates, a table, a soft clink, then the mist wipe into the reflection
for k_ in range(4): SFX.add(sfx_thump(90, .6, .3), 57.2 + .22 * k_, .02, -.3 + .2 * k_)
for k_ in range(5): SFX.add(sfx_clink(k_), 58.0 + .5 * k_, .03, -.3 + .15 * k_)
SFX.add(S.whoosh(2.4, 500, 3800, .6, .4), 59.0, .16, 0); SFX.add(sfx_chime(), 60.8, .18, 0)
# the reflection (shared set, re-timed to the narration)
SFX.add(sfx_grow(2.6), TW(62.0), .14, 0); SFX.add(sfx_chime(), TW(62.4), .2, 0)
SFX.add(sfx_chime(), TW(65.7), .14, 0); SFX.add(sparkle(1.0, 65), TW(66.0), .14, 0)
SFX.add(sfx_low(), TW(68.2), .08, 0); SFX.add(sfx_cloth(1.2), TW(69.0), .045, 0); SFX.add(sfx_chime(), TW(69.4), .18, 0); SFX.add(sparkle(1.0, 69), TW(69.7), .16, 0)
SFX.add(sfx_grow(2.4), TW(72.4), .16, 0); SFX.add(sfx_chime(), TW(73.0), .22, 0); SFX.add(sparkle(1.0, 73), TW(73.4), .2, 0)
SFX.add(sfx_riser(1.6), TW(77.2), .1, 0)
for k_ in range(8): SFX.add(sfx_step(), TW(80.8) + .5 * k_, .026, .1 + .05 * k_)
SFX.add(sfx_chime(), TW(79.4), .3, 0); SFX.add(sparkle(1.0, 79), TW(79.6), .3, 0); SFX.add(sfx_grow(2.4), TW(79.4), .16, 0)
SFX.add(sfx_chime(), TW(82.6), .24, 0); SFX.add(sparkle(1.0, 82), TW(82.8), .24, 0); SFX.add(sfx_chime(), TW(84.2), .2, 0)
# the question
SFX.add(sfx_chime(), 85.3, .5, 0)

for name, bus in (('amb', AMB), ('sfx', SFX)):
    L, R = bus.L, bus.R; p = max(np.abs(L).max(), np.abs(R).max(), 1e-6); print(name, 'peak', p)
    sf.write(f'/home/claude/music/out43/{name}.wav', (np.stack([L, R], 1) / p * .8).astype(np.float32), SR)
print('done')
