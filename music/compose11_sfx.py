"""Episode 11 ambience + sound effects (original, synthesised). Events are read from the film's own EV list (g11/src/world11.js).
Outputs: out11/amb.wav, out11/sfx.wav
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

# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 10). Times follow EV in g11/src/world11.js
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

# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 11). Times follow PLACE / EV in g11/src/world11.js
wind_bed(0.0, 62.0, .12, 2.0); wind_bed(62.0, 90.4, .1, 2.0)                                                       # the high air over the plain
bird_bed(1.0, 24.0, .3, .07); bird_bed(41.0, 48.0, .25, .06)
murmur_bed(1.0, 4.8, .16, 1.0)                                                                                     # one people, one language: a low, even murmur
murmur_bed(4.8, 22.0, .12, 2.0)                                                                                    # workers on the plain
crackle(4.5, 38.0, .5)                                                                                             # the kilns
city_bed(12.2, 22.4, .36, 1.6)                                                                                     # the city rises
murmur_bed(25.6, 36.6, .26, 1.2)                                                                                   # the speech breaks into babble (no words)
murmur_bed(30.0, 36.4, .22, 1.0)
night_bed(44.0, 61.0, .5, 3.0); crackle(48.0, 56.5, .6); crackle(58.0, 61.4, .5)                                   # dusk, the camp fire, the fire at Haran
bird_bed(61.0, 85.0, .5, .1); wind_bed(61.0, 85.0, .07, 2.0); wind_bed(85.0, 90.4, .12)
murmur_bed(78.6, 85.5, .22, 1.5)                                                                                   # builders gathering in the lantern light (soft, no words)
# bricks and the kilns: dull wooden/clay taps while the carriers walk
for k_, t_ in enumerate(np.arange(5.0, 22.0, .9)): SFX.add(sfx_clack(int(t_ * 3) % 4), t_ + .06 * (k_ % 3), .07, float(np.sin(t_ * 1.3)) * .5)
for k_, t_ in enumerate(np.arange(5.4, 21.0, 1.7)): SFX.add(sfx_step(), t_, .04, float(np.sin(t_)) * .4)
SFX.add(sfx_riser(2.0), 10.2, .24, 0); SFX.add(sparkle(1.0, 11.0), 11.6, .3, .1)
# the tower rises, tier by tier
for k_, t_ in enumerate((11.9, 13.5, 14.7, 16.8, 17.8, 18.8, 19.8, 20.8, 22.0)):
    SFX.add(sfx_stone(), t_ + .1, .26, -.3 + .08 * k_); SFX.add(sfx_grow(1.4), t_, .16, 0)
SFX.add(sfx_chime(), 12.2, .22, .2); SFX.add(sfx_chime(), 17.0, .24, -.2); SFX.add(sfx_chime(), 20.6, .24, .1)
# the Lord comes down: a deep rumble and a rising shimmer, then stillness
SFX.add(sfx_riser(3.4), 20.6, .4, 0); SFX.add(sfx_rumble(3.6), 21.6, .5, 0); hit = sfx_hit(); SFX.add(hit[0], 21.75, .4, 0); SFX.add(hit[1], 21.75, .4, 0)
SFX.add(sfx_grow(3.0), 21.8, .3, 0); SFX.add(sfx_chime(), 22.4, .36, 0); SFX.add(sparkle(1.0, 23.0), 23.4, .5, .1)
# one people, one language -> the speech is confused
for k_, t_ in enumerate((26.2, 27.4, 28.6)): SFX.add(sparkle(1.0, 40 + k_), t_, .3, -.3 + .3 * k_)
SFX.add(sfx_riser(2.6), 28.3, .3, 0); SFX.add(sfx_low(), 28.9, .3, 0)
for k_, t_ in enumerate((29.2, 30.0, 30.8, 31.4)): SFX.add(sfx_clink(k_ + 1), t_, .1, -.5 + .33 * k_)
# no one could understand: stumbling taps
for k_, t_ in enumerate((32.4, 33.2, 33.9, 34.6, 35.3)): SFX.add(sfx_clack(k_), t_, .06, -.4 + .2 * k_)
# scattered over the earth: the boom, six threads, a sweep
SFX.add(sfx_rumble(3.0), 36.2, .5, 0); hit = sfx_hit(); SFX.add(hit[0], 36.4, .45, 0); SFX.add(hit[1], 36.4, .45, 0)
for k_, t_ in enumerate((36.9, 37.15, 37.4, 37.65, 37.9, 38.15)): thread_sfx(t_, .26, -.6 + .24 * k_, 1.6)
SFX.add(S.whoosh(2.8, 200, 2400, .5, .4), 37.2, .3, 0); SFX.add(sfx_chime(), 39.4, .28, 0)
# Babel: the building stands alone
SFX.add(sfx_chime(), 41.6, .24, 0)
# the genealogy: nine soft chimes, one for each lit tent
for k_ in range(9): SFX.add(sfx_chime(), 44.9 + .38 * k_, .1 + .01 * k_, -.5 + .12 * k_); thread_sfx(44.8 + .38 * k_, .1, -.5 + .12 * k_, .8)
# Ur, Abram and Sarai at the night camp
SFX.add(sfx_chime(), 49.4, .22, 0); SFX.add(sfx_chime(), 54.6, .2, 0)
# out of Ur: steps, hooves, a sheep, then the fire at Haran
for k_ in range(8): SFX.add(sfx_step(), 55.9 + .46 * k_, .06, -.3 + .08 * k_)
for k_ in range(12): SFX.add(hoof(k_), 56.3 + .38 * k_, .08, .3)
SFX.add(sfx_bleat(), 57.5, .12, .2); SFX.add(sfx_bleat(), 58.9, .1, -.2)
SFX.add(sfx_grow(2.6), 58.0, .24, 0); SFX.add(sfx_chime(), 58.6, .34, 0)
# the reflection: stones, posts, beams, a roof; then a lantern
for k_, t_ in enumerate(np.arange(61.8, 65.2, .62)): SFX.add(sfx_stone(), t_, .12, -.4 + .3 * (k_ % 4))
for k_, t_ in enumerate(np.arange(66.0, 70.2, .6)): SFX.add(sfx_thump(120 + 8 * (k_ % 3), .5, .6), t_, .14, -.2 + .15 * (k_ % 5)); SFX.add(sfx_clack(k_), t_ + .22, .08, .2)
SFX.add(sfx_planks(1.2), 71.3, .22, 0); SFX.add(sfx_planks(1.6), 73.5, .2, .1); SFX.add(sfx_grow(2.8), 73.4, .22, 0)
SFX.add(sfx_chime(), 77.9, .22, 0); SFX.add(sfx_chime(), 78.8, .34, 0)
for k_ in range(5): SFX.add(sfx_step(), 79.1 + .3 * k_, .05, -.3 + .15 * k_)
SFX.add(sfx_chime(), 84.0, .24, 0)
# the question
SFX.add(sfx_chime(), 85.3, .5, 0)

for name, bus in (('amb', AMB), ('sfx', SFX)):
    L, R = bus.L, bus.R; p = max(np.abs(L).max(), np.abs(R).max(), 1e-6); print(name, 'peak', p)
    sf.write(f'/home/claude/music/out11/{name}.wav', (np.stack([L, R], 1) / p * .8).astype(np.float32), SR)
print('done')
