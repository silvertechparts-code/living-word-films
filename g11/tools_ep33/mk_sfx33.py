#!/usr/bin/env python3
# Builds /home/claude/music/compose33_sfx.py from compose32_sfx.py: same helpers, new Ep33 story effects (times follow world33.js / main33.js), reflection re-timed with TW.
s = open('/home/claude/music/compose32_sfx.py').read()
a = s.index('# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 32)')
head = s[:a]; c = s.index("for name, bus in (('amb', AMB), ('sfx', SFX)):")
tail = s[c:]
NEW = r'''# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 33). Times follow world33.js / main33.js / reflect33.js
TW = lambda t: float(np.interp(t, [60, 61.4, 66.9, 72.4, 79.0, 86.1, 91.1], [60, 61.4, 66.9, 72.4, 78.0, 85.0, 90.0]))   # Ep31 reflection timings -> Ep33 narration
wind_bed(0.0, 22.0, .05, 2.0); wind_bed(21.8, 60.0, .045, 2.0); wind_bed(59.5, 90.4, .07, 2.0)                       # the east bank in the morning; the road; the village lane
stream_bed(0.0, 60.6, [(0.0, .3), (14.0, .34), (26.0, .3), (44.0, .34), (52.0, .4), (60.6, 0)], 2.0)                    # the river, all the way through
bird_bed(0.2, 30.0, .08, .03, 7); bird_bed(30.0, 60.4, .09, .03, 15)                                                  # the morning
fire_bed(61.0, 80.6, [(61.0, 0), (63.0, .02), (TW(78.0), .02), (TW(80.6), 0)], 1.2)                                   # the lamp-lit house
bird_bed(66.0, 85.0, .12, .045, 11)                                                                                    # the lane, a calm evening
# 0.2 - 4.0: Esau's four hundred rise over the ridge: a low thud, a distant murmur, a few steps
SFX.add(sfx_thump(58, 1.4, .8), 1.0, .1, 0); SFX.add(sfx_low(), 1.2, .07, 0); murmur_bed(1.0, 6.0, .02, 1.2)
for k_ in range(6): SFX.add(hoof(k_), 2.2 + .4 * k_, .016, .5)
# 4.6 - 9.8: Jacob arranges his family in order: many soft steps and cloth
for k_ in range(30): SFX.add(sfx_step(), 4.8 + .17 * k_ + (.04 if k_ % 2 else 0), .02, -.4 + .027 * k_)
SFX.add(sfx_cloth(1.0), 6.0, .04, 0); SFX.add(sfx_cloth(.9), 8.0, .035, .1)
# 10.4 - 15.3: Jacob walks ahead, limping, and bows seven times (33:3): uneven steps, a cloth rustle and a soft thud for each bow
for k_ in range(9): SFX.add(sfx_step(), 10.4 + .56 * k_, .03, -.1 + .03 * k_)
for k_ in range(7): SFX.add(sfx_cloth(.6), 11.1 + .67 * k_, .03, .05); SFX.add(sfx_thump(70, .5, .4), 11.25 + .67 * k_, .04, 0)
# 15.8 - 17.9: Esau runs (33:4): fast steps, dust
for k_ in range(10): SFX.add(sfx_step(), 15.8 + .21 * k_, .042 + .002 * k_, .3 - .05 * k_)
SFX.add(S.whoosh(1.2, 300, 2600, .4, .4), 16.2, .05, 0)
# 18.0 - 22.8: the embrace, the kiss and their weeping: cloth, a warm light, chimes
SFX.add(sfx_cloth(1.0), 18.0, .06, 0); SFX.add(sfx_grow(2.4), 18.0, .14, 0); SFX.add(sfx_chime(), 18.3, .2, 0); SFX.add(sparkle(1.0, 18), 18.5, .16, 0)
SFX.add(sfx_chime(), 21.0, .12, .1)
# 22.7 - 30.0: the women and children come forward and bow (33:6-7): a line of steps, cloth rustles
for k_ in range(34): SFX.add(sfx_step(), 26.6 + .12 * k_, .018, -.3 + .02 * k_)
for t_ in (28.3, 29.0, 29.8): SFX.add(sfx_cloth(.8), t_, .04, 0)
# 34.3 - 37.5: Jacob's gift arrives (33:10-11): hooves, bleating, one camel grunt
for k_ in range(14): SFX.add(hoof(k_), 34.5 + .22 * k_, .02, -.3 + .04 * k_)
for t_ in (34.8, 35.7, 36.4): SFX.add(sfx_bleat(), t_, .03, r_.uniform(-.6, .6))
SFX.add(sfx_camel_grunt(), 36.6, .04, .3)
# 40.6 - 44.6: "to see your face is like seeing the face of God": a quiet rising light and one chime
SFX.add(sfx_grow(2.6), 40.6, .12, 0); SFX.add(sfx_chime(), 41.4, .18, 0)
# 44.6 - 52.4: Esau goes back with his men; Jacob leads his people on slowly (33:16, 33:14): marching hooves and the herd on the road
for k_ in range(14): SFX.add(hoof(k_), 45.5 + .4 * k_, .016, .5)
murmur_bed(45.0, 52.0, .018, 1.2)
for k_ in range(20): SFX.add(sfx_step(), 46.6 + .27 * k_, .02, -.2 + .02 * k_)
for t_ in (47.0, 49.0, 51.0): SFX.add(sfx_bleat(), t_, .028, r_.uniform(-.6, .6))
SFX.add(sfx_camel_grunt(), 48.6, .045, .2)
# 52.2 - 54.2: the tents are pitched at Shechem (33:18): cloth and soft thuds
for k_ in range(4): SFX.add(sfx_thump(80, .5, .4), 52.4 + .3 * k_, .06, 0); SFX.add(sfx_cloth(.7), 52.5 + .3 * k_, .035, 0)
# 55.0 - 57.5: the altar is built, stone by stone (33:20): a heavy stone set down seven times
for k_ in range(7): SFX.add(sfx_thump(64 + 3 * k_, .7, .6), 55.0 + .42 * k_, .09, -.1 + .03 * k_)
SFX.add(sfx_chime(), 57.8, .14, 0)
# 58.8 - 61.6: the mist wipe into the reflection
SFX.add(S.whoosh(2.4, 500, 3800, .6, .4), 59.0, .16, 0); SFX.add(sfx_chime(), 60.8, .18, 0)
# the reflection (60 - 85): Ep31 effects re-timed by TW; no passer-by (there is one person alone)
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

'''
out = head + NEW + tail
out = out.replace('out32', 'out33')
i = out.index('"""Episode 32'); j = out.index('Outputs:') if 'Outputs:' in out else None
if j is None:
    k = out.index('"""', i + 4); out = out[:i] + '"""Episode 33 ambience + sound effects (original, synthesised). Events follow the film\'s own timings (g11/src/world33.js, main33.js, reflect33.js).' + out[k:]
else:
    out = out[:i] + '"""Episode 33 ambience + sound effects (original, synthesised). Events follow the film\'s own timings (g11/src/world33.js, main33.js, reflect33.js).\n' + out[j:]
open('/home/claude/music/compose33_sfx.py', 'w').write(out); print('ok', len(out))
