"""Episode 14 ambience + sound effects (original, synthesised). Events follow the film's own EV list (g11/src/world14.js).
Outputs: out14/amb.wav, out14/sfx.wav
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

# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 14). Times follow PLACE / EV in g11/src/world14.js and main14.js
wind_bed(0.0, 62.0, .1, 2.0); wind_bed(62.0, 90.4, .1, 2.0)                                                        # the high air over the clouds
murmur_bed(1.2, 3.8, .1, .6)                                                                                       # the plain of Sodom: armies (no words)
night_bed(20.2, 25.6, .12, 1.0); crackle(20.4, 25.0, .12)                                                          # night near Dan: the raiders' fire
bird_bed(26.8, 38.0, .22, .06); bird_bed(54.0, 61.0, .24, .06); bird_bed(61.0, 85.0, .4, .1); wind_bed(85.0, 90.4, .12)
# the four kings against the five: a low rumble, spears and shields
SFX.add(sfx_rumble(2.6), 0.9, .3, 0)
for k_, t_ in enumerate((1.5, 2.0, 2.4, 2.9, 3.3, 3.6)): SFX.add(sfx_crunch(), t_, .14 + .02 * (k_ % 3), -.5 + .2 * k_); SFX.add(sfx_clink(k_ + 1), t_ + .07, .08, .4 - .15 * k_)
for k_ in range(10): SFX.add(sfx_clack(k_), 1.3 + .27 * k_, .06, -.4 + .09 * k_)
# Lot and his goods carried off: steps, hooves, a camel's groan
for k_ in range(14): SFX.add(sfx_step(), 4.4 + .45 * k_, .06, .3 - .04 * k_)
for k_ in range(16): SFX.add(hoof(k_), 4.6 + .38 * k_, .08, .35)
SFX.add(sfx_moo(), 5.6, .07, .3); SFX.add(sfx_moo(), 8.2, .06, .2)
# a survivor runs to Abram
for k_ in range(9): SFX.add(sfx_step(), 6.6 + .3 * k_, .08, -.2)
# Abram musters 318 trained men: spears, many steps
for k_ in range(14): SFX.add(sfx_clack(k_), 11.0 + .17 * k_, .06, -.5 + .08 * k_)
SFX.add(S.whoosh(1.4, 400, 2800, .5, .4), 11.8, .12, 0)
for k_ in range(30): SFX.add(sfx_step(), 12.2 + .28 * k_, .05, -.4 + .03 * (k_ % 28))
# the chase to Dan: a marching column
for k_ in range(22): SFX.add(sfx_step(), 13.8 + .32 * k_, .05, -.3 + .02 * k_)
for k_ in range(14): SFX.add(hoof(k_), 14.5 + .45 * k_, .05, .3)
# night: they divide; a soft low riser into the attack
SFX.add(sfx_low(), 20.3, .22, 0); SFX.add(sfx_riser(1.6), 21.2, .2, 0)
# the night attack: a boom, flashes of torches, a rush of men
SFX.add(sfx_riser(1.6), 21.8, .24, 0); hit = sfx_hit(); SFX.add(hit[0], 22.9, .36, 0); SFX.add(hit[1], 22.9, .36, 0); SFX.add(sfx_rumble(2.6), 22.9, .3, 0)
for k_, t_ in enumerate((23.1, 23.5, 23.9, 24.3, 24.7)): SFX.add(sfx_snap(), t_, .12, -.5 + .25 * k_); SFX.add(sfx_crunch(), t_ + .08, .12, .4 - .2 * k_)
for k_ in range(18): SFX.add(sfx_clack(k_), 23.0 + .11 * k_, .06, -.6 + .07 * k_)
SFX.add(sfx_burst(2.0), 22.9, .16, 0)
# Lot and the people are freed: a soft chime; the return: steps, hooves, camels
SFX.add(sfx_chime(), 25.2, .24, 0); SFX.add(sparkle(1.0, 40), 25.3, .35, 0)
for k_ in range(24): SFX.add(sfx_step(), 26.4 + .3 * k_, .05, -.3 + .025 * k_)
for k_ in range(16): SFX.add(hoof(k_), 26.6 + .42 * k_, .06, .3)
SFX.add(sfx_moo(), 27.8, .06, .3); SFX.add(sfx_bleat(), 29.4, .06, -.2)
# the king of Sodom comes out: steps, a soft chime
for k_ in range(8): SFX.add(sfx_step(), 30.4 + .38 * k_, .06, .3); SFX.add(sfx_chime(), 32.9, .2, 0)
# Melchizedek brings bread and wine: a soft chime, wooden clink, a gentle shimmer
SFX.add(sfx_chime(), 33.4, .22, 0); SFX.add(sfx_clink(0), 37.7, .12, 0); SFX.add(sfx_clink(2), 38.4, .1, .1); SFX.add(sparkle(1.0, 55), 37.9, .25, 0)
# the blessing: the light grows
SFX.add(sfx_grow(3.0), 39.4, .26, 0); SFX.add(sfx_chime(), 39.6, .32, 0); SFX.add(sparkle(1.0, 60), 40.0, .45, .1); SFX.add(sfx_chime(), 41.8, .2, -.2)
# a tenth of everything: boxes set down
for k_, t_ in enumerate((45.0, 45.5, 46.0, 46.5, 47.0)): SFX.add(sfx_thump(f=95 + 4 * k_, d=.5, g=.5), t_, .1, -.3 + .15 * k_)
# the king's offer: a thin held riser, unresolved
SFX.add(sfx_riser(1.6), 49.6, .14, 0)
# Abram refuses: a firm low hit; a thread, a sandal strap
hit = sfx_hit(); SFX.add(hit[0], 51.9, .3, 0); SFX.add(hit[1], 51.9, .3, 0); thread_sfx(52.9, .24, -.1, 1.4); SFX.add(sfx_clack(2), 54.2, .1, .1)
# "I made Abram rich": the glory goes to God
SFX.add(sfx_grow(3.0), 56.2, .24, 0); SFX.add(sfx_chime(), 56.6, .3, 0); SFX.add(sparkle(1.0, 57), 57.2, .4, 0); SFX.add(sfx_chime(), 58.6, .2, 0)
# the reflection: the giver goes to the friend, then to the long table; a gift is turned down; one box goes to the altar; the beam rises; the friend joins
SFX.add(sparkle(1.0, 62), 61.0, .2, -.3)
for k_ in range(4): SFX.add(sfx_step(), 62.0 + .8 * k_, .05, -.3)
for k_ in range(3): SFX.add(sfx_step(), 66.2 + .35 * k_, .05, -.2)
for k_ in range(6): SFX.add(sfx_thump(f=110, d=.4, g=.4), 67.4 + .6 * k_, .05, -.2 + .1 * k_)
for k_ in range(5): SFX.add(sfx_step(), 68.6 + .3 * k_, .05, .5)
SFX.add(sfx_chime(), 69.8, .14, .3)
for k_ in range(4): SFX.add(sfx_step(), 72.3 + .35 * k_, .05, .5)
for k_ in range(3): SFX.add(sfx_step(), 72.0 + .33 * k_, .05, -.1)
SFX.add(sfx_stone(), 71.9, .16, 0)
SFX.add(sfx_grow(2.6), 72.9, .24, 0); SFX.add(sparkle(1.0, 73), 73.4, .4, 0); SFX.add(sfx_chime(), 73.6, .3, 0)
for k_ in range(6): SFX.add(sfx_step(), 77.0 + .4 * k_, .05, -.4)
SFX.add(sfx_riser(1.6), 77.0, .2, 0); SFX.add(sparkle(1.0, 78), 78.6, .45, 0); SFX.add(sfx_chime(), 78.6, .3, 0)
SFX.add(sfx_grow(2.6), 78.8, .2, 0); SFX.add(sfx_chime(), 80.6, .22, 0); SFX.add(sfx_chime(), 84.0, .24, 0)
# the question
SFX.add(sfx_chime(), 85.3, .5, 0)

for name, bus in (('amb', AMB), ('sfx', SFX)):
    L, R = bus.L, bus.R; p = max(np.abs(L).max(), np.abs(R).max(), 1e-6); print(name, 'peak', p)
    sf.write(f'/home/claude/music/out14/{name}.wav', (np.stack([L, R], 1) / p * .8).astype(np.float32), SR)
print('done')

