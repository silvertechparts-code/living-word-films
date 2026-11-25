"""Episode 19 ambience + sound effects (original, synthesised). Events follow the film's own EV list (g11/src/world19.js) and the shot list in main19.js.
Outputs: out19/amb.wav, out19/sfx.wav
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
    n = int(d * SR); y = np.zeros(n); t = 0.0; k = 0
    while t < d - .6:
        for dt, f, a in ((0, 62, 1.0), (.23, 52, .7)):
            i = int((t + dt) * SR); m = int(.4 * SR); tt = np.arange(m) / SR
            y[i:i + m] += np.sin(2 * np.pi * f * tt * (1 + .25 * np.exp(-tt / .05))) * np.exp(-tt / .09) * a * (n - i > m)
        t += 1.2 - .0 * k; k += 1
    env = np.clip(np.minimum(np.arange(n) / SR / 1.2, (d - np.arange(n) / SR) / 1.5), 0, 1)
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

# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 10). Times follow EV in g11/src/world12.js
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

# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 19). Times follow PLACE / EV in g11/src/world19.js and main19.js
wind_bed(0.0, 60.0, .05, 2.0); wind_bed(60.0, 90.4, .07, 2.0)                                                       # dusk and night air over the plain, then the terrace
cricket_bed(0.0, 28.5, [(0, .05), (5, .05), (24, .04), (28.5, 0)])                                                   # the evening and the night
murmur_bed(0.6, 6.2, .035)                                                                                          # the city beyond the gate
crowd_shout(5.8, 12.4, .11, 1)                                                                                      # the men of the city gather and shout at the door
crackle(6.0, 13.0, .1); crackle(15.0, 28.0, .05)                                                                    # torches; the lamp in Lot's house
murmur_bed(16.0, 22.0, .04); murmur_bed(22.0, 25.2, .045)                                                           # the family; the sons-in-law
bird_bed(36.0, 49.0, .12, .05, 5); bird_bed(50.0, 60.0, .14, .05, 6); bird_bed(61.0, 71.0, .16, .05, 9)             # dawn at Zoar; morning at Mamre's hill; birds over the terrace
fire_bed(41.2, 60.0, [(41.2, 0), (42.4, .22), (46, .26), (47.4, .08), (48.2, .2), (54, .14), (58, .08), (60, 0)])    # the burning plain
# 1.1 - 3.3: the two visitors arrive along the road: slow steps; 3.4: Lot bows (a cloth hush), the guests accept his house (a soft chime)
for k_ in range(6): SFX.add(sfx_step(), 1.3 + .55 * k_, .04, -.4 + .12 * k_)
SFX.add(S.whoosh(1.0, 300, 1800, .5, .3), 3.4, .07, 0); SFX.add(sfx_chime(), 4.0, .12, 0)
for k_ in range(7): SFX.add(sfx_step(), 4.5 + .22 * k_, .04, .3 - .08 * k_)
# 8.9 - 11.5: the men press on the door: knocks and a low pulse
for k_, t_ in enumerate((8.9, 9.8, 10.6)): SFX.add(sfx_knock(), t_, .22 + .04 * k_, .2)
SFX.add(sfx_low(), 8.0, .12, 0)
# 11.6 - 12.5: the angels pull Lot in (steps and a hand), the door shuts; 12.0: the flash
SFX.add(sfx_riser(1.0), 11.3, .16, 0); SFX.add(sfx_door(), 11.8, .3, 0)
hit = sfx_hit(); SFX.add(hit[0], 12.0, .42, 0); SFX.add(hit[1], 12.0, .38, 0); SFX.add(sfx_burst(1.8), 12.0, .16, 0); SFX.add(sparkle(1.0, 12), 12.2, .3, 0); SFX.add(sfx_rumble(2.4), 12.0, .2, 0)
# 12.4 - 15.4: the men, struck blind, grope and stumble away: shuffling and a few cries
for k_ in range(10): SFX.add(sfx_step(), 12.6 + .28 * k_, .035, .6 - .12 * k_)
SFX.add(sfx_creak(1.6), 13.4, .06, .4)
# 15.9 - 22: "take your family and go": the lamp-lit room; a door opens and the family comes out
SFX.add(sfx_creak(1.4), 15.8, .08, 0); SFX.add(sfx_grow(2.6), 18.2, .12, 0); SFX.add(sfx_chime(), 18.5, .18, 0)
# 22.2 - 24.6: the sons-in-law think it a joke: small light sparkles, no laughter sound; steps away
for k_, t_ in enumerate((22.5, 23.0, 23.6, 24.1)): SFX.add(sparkle(1.0, 23 + k_), t_, .1 + .02 * k_, -.4 + .25 * k_)
# 25.0 - 27.4: Lot lingers: a held low note; 27.2: the angels take their hands: a warm bloom
SFX.add(sfx_low(), 25.2, .12, 0); SFX.add(sfx_grow(2.6), 27.2, .2, 0); SFX.add(sfx_chime(), 27.5, .28, 0); SFX.add(sparkle(1.0, 28), 28.0, .26, 0)
# 28.4 - 33: they are led out through the gate: steps, the gate creaks
for k_ in range(8): SFX.add(sfx_step(), 28.6 + .5 * k_, .04, .3 - .1 * k_)
SFX.add(sfx_creak(1.4), 29.3, .07, .2)
# 33.0 - 36.8: "flee for your life": quick steps, breath
for k_ in range(14): SFX.add(sfx_step(), 33.3 + .26 * k_, .05, -.2 + .03 * k_)
SFX.add(sfx_breath(1.6), 34.0, .1, 0); SFX.add(sfx_breath(1.6), 35.6, .1, 0)
# 36.8 - 41.2: sunrise, Zoar: slow steps, a warm chime
SFX.add(sfx_grow(2.6), 36.9, .16, 0); SFX.add(sfx_chime(), 37.2, .24, 0)
for k_ in range(7): SFX.add(sfx_step(), 38.3 + .45 * k_, .03, .3 - .1 * k_)
# 41.2 - 47: fire and sulfur from the Lord out of heaven
SFX.add(sfx_riser(1.2), 40.2, .16, 0)
hit = sfx_hit(); SFX.add(hit[0], 41.2, .5, 0); SFX.add(hit[1], 41.2, .5, 0); SFX.add(sfx_rumble(4.4), 41.2, .34, 0); SFX.add(sfx_burst(3.4), 41.3, .2, 0); SFX.add(sfx_thunder(4.0), 41.4, .3, 0)
SFX.add(sfx_shatter(), 43.6, .12, -.3); SFX.add(sfx_thunder(3.2), 44.2, .24, .2); SFX.add(sfx_shatter(), 45.4, .1, .3)
# 47.4: his wife looks back: a hush, one bell; 47.75: the pillar of salt rises: a crack of crystals and a low note
SFX.add(sfx_chime(), 47.5, .3, 0); SFX.add(sfx_low(), 47.7, .2, 0); SFX.add(sfx_crunch(), 47.9, .24, 0); SFX.add(sparkle(1.0, 48), 48.0, .32, 0); SFX.add(sfx_grow(1.6), 47.8, .12, 0)
# 50.2 - 54: Abraham looks toward the plain: the smoke like a furnace: a far rumble
SFX.add(sfx_rumble(3.6), 51.6, .12, 0); SFX.add(sfx_low(), 52.4, .08, 0)
# 54.6 - 58.8: "God remembered Abraham": a warm bloom
SFX.add(sfx_grow(3.0), 54.7, .18, 0); SFX.add(sfx_chime(), 55.1, .28, 0); SFX.add(sparkle(1.0, 56), 56.0, .28, 0)
# 58.8 - 61.6: the mist wipe into the reflection
SFX.add(S.whoosh(2.4, 500, 3800, .6, .4), 58.8, .2, 0); SFX.add(sfx_chime(), 60.4, .2, 0)
# the reflection: the glowing door; walking out; looking back; one step forward
SFX.add(sfx_grow(2.6), 63.2, .16, 0); SFX.add(sfx_chime(), 63.6, .24, 0)
for k_ in range(7): SFX.add(sfx_step(), 65.6 + .5 * k_, .03, .3 - .1 * k_)
SFX.add(sfx_grow(2.6), 66.6, .16, 0); SFX.add(sfx_chime(), 66.9, .26, 0); SFX.add(sparkle(1.0, 67), 67.5, .3, 0)
SFX.add(sfx_chime(), 71.6, .26, 0); SFX.add(sfx_grow(2.6), 71.8, .18, 0); SFX.add(sparkle(1.0, 72), 72.4, .32, 0)
for t_ in (78.1, 78.8, 79.4): SFX.add(sfx_step(), t_, .04, 0)
SFX.add(sfx_riser(1.6), 77.0, .12, 0); SFX.add(S.whoosh(4.8, 800, 5000, .5, .3), 77.6, .1, 0); SFX.add(sparkle(1.0, 78), 79.0, .26, 0)
for k_ in range(6): SFX.add(sfx_step(), 80.4 + .5 * k_, .03, .1 - .05 * k_)
SFX.add(sfx_chime(), 82.0, .32, 0); SFX.add(sparkle(1.0, 82), 82.2, .34, 0); SFX.add(sfx_grow(2.6), 82.2, .16, 0); SFX.add(sfx_chime(), 84.0, .22, 0)
# the question
SFX.add(sfx_chime(), 85.3, .5, 0)

for name, bus in (('amb', AMB), ('sfx', SFX)):
    L, R = bus.L, bus.R; p = max(np.abs(L).max(), np.abs(R).max(), 1e-6); print(name, 'peak', p)
    sf.write(f'/home/claude/music/out19/{name}.wav', (np.stack([L, R], 1) / p * .8).astype(np.float32), SR)
print('done')
