#!/usr/bin/env python3
# Builds /home/claude/music/compose32_sfx.py from compose31_sfx.py: same helpers, new Ep32 story effects (times follow world32.js / main32.js), reflection re-timed with TW.
s = open('/home/claude/music/compose31_sfx.py').read()
a = s.index('# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 31)')
b = s.index('# the reflection (60 - 85)')
head = s[:a]; c = s.index("for name, bus in (('amb', AMB), ('sfx', SFX)):")
tail = s[c:]
NEW = r'''# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 32). Times follow world32.js / main32.js / reflect32.js
TW = lambda t: float(np.interp(t, [60, 61.4, 66.9, 72.4, 79.0, 86.1, 91.1], [60, 61.4, 66.2, 71.2, 77.9, 85.0, 90.0]))   # Ep31 reflection timings -> Ep32 narration
wind_bed(0.0, 22.0, .05, 2.0); wind_bed(21.8, 60.0, .045, 2.0); wind_bed(59.5, 90.4, .07, 2.0)                       # the riverbank; the night; the village lane
stream_bed(0.0, 60.6, [(0.0, .3), (14.0, .34), (26.0, .3), (44.0, .34), (52.0, .4), (60.6, 0)], 2.0)                    # the Jabbok, all the way through
bird_bed(0.2, 7.2, .07, .025, 7)                                                                                        # the golden evening
cricket_bed(7.0, 15.8, [(7.0, 0), (9.0, .03), (13.0, .026), (15.8, 0)])                                                # the dusk of the prayer
cricket_bed(15.6, 46.0, [(15.6, 0), (18.0, .03), (30.0, .022), (42.0, .02), (46.0, 0)])                                # the night
fire_bed(14.2, 47.0, [(14.2, 0), (15.2, .03), (44.0, .03), (47.0, 0)], 1.2)                                           # the camp fire
fire_bed(20.8, 47.0, [(20.8, 0), (22.0, .022), (40.0, .018), (47.0, 0)], 1.2)                                          # the torches carried across the ford
murmur_bed(21.0, 26.0, .012, 1.6)                                                                                       # the family, hushed, crossing
bird_bed(46.4, 60.4, .09, .03, 15)                                                                                      # the dawn after Peniel
fire_bed(61.0, 80.6, [(61.0, 0), (63.0, .02), (TW(78.0), .02), (TW(80.6), 0)], 1.2)                                   # the lamp-lit house
bird_bed(66.0, 85.0, .12, .045, 11)                                                                                    # the lane, a calm evening
# 0.0 - 3.6: the messengers run back across the ford and tell Jacob (32:6): splashing steps, cloth
for k_ in range(9): SFX.add(sfx_step(), 1.0 + .3 * k_, .028, -.2 + .05 * k_)
SFX.add(sfx_cloth(1.0), 3.2, .04, 0)
# 3.6 - 8.4: Esau's four hundred rise over the ridge: a low thud and a distant murmur
SFX.add(sfx_thump(58, 1.4, .8), 3.8, .1, 0); SFX.add(sfx_low(), 4.0, .07, 0); murmur_bed(4.0, 8.6, .02, 1.2)
for k_ in range(7): SFX.add(hoof(k_), 5.0 + .4 * k_, .016, .5)
# 8.2 - 14.9: Jacob prays in fear: a pale gold light falls on him, a low hum
SFX.add(sfx_low(), 8.4, .06, 0); SFX.add(sfx_cloth(1.0), 9.0, .035, 0)
light_hum(9.0, 14.9, [(9.0, 0), (10.5, .35), (13.5, .35), (14.9, 0)], 1.2)
SFX.add(sfx_chime(), 12.6, .1, .1)
# 14.4 - 21.0: the six droves cross the ford: hooves, bleating, one camel grunt
for t0_, n_ in ((14.4, 7), (15.2, 6), (16.0, 6), (16.8, 6), (17.5, 4), (18.2, 3)):
    for k_ in range(n_ + 4): SFX.add(hoof(k_), t0_ + 1.5 + .38 * k_, .02, -.3 + .06 * k_)
    SFX.add(sfx_bleat(), t0_ + 2.0, .03, r_.uniform(-.6, .6))
SFX.add(sfx_camel_grunt(), 18.6, .05, .3); SFX.add(sfx_camel_grunt(), 19.6, .04, .2)
for k_ in range(12): SFX.add(sfx_step(), 15.0 + .5 * k_, .02, .2)
# 20.8 - 25.5: the family crosses the Jabbok by torchlight (32:22-23): quiet steps and cloth
for k_ in range(26): SFX.add(sfx_step(), 21.0 + .17 * k_ + (.05 if k_ % 2 else 0), .02, -.3 + .025 * k_)
SFX.add(sfx_cloth(1.0), 22.0, .04, 0); SFX.add(sfx_cloth(.9), 24.0, .04, .1)
# 25.2 - 27.0: Jacob is left alone: a hush
SFX.add(sfx_low(), 25.6, .07, 0)
# 26.4 - 27.7: the man comes out of the dark: a soft rising light and a low note
SFX.add(sfx_grow(2.4), 26.4, .14, 0); SFX.add(sfx_low(), 27.0, .07, 0)
light_hum(27.0, 49.6, [(27.0, 0), (28.5, .3), (40.0, .3), (48.0, .2), (49.6, 0)], 1.4)
# 27.2 - 40.8: the wrestling (32:24-25): grappling steps, cloth, soft thuds
for k_ in range(20): SFX.add(sfx_step(), 27.8 + .5 * k_, .03, .15 * ((-1) ** k_))
for k_ in range(9): SFX.add(sfx_cloth(.6), 28.0 + 1.35 * k_, .035, .1 * ((-1) ** k_)); SFX.add(sfx_thump(70, .6, .5), 28.4 + 1.35 * k_, .05, 0)
# 31.2: the man strikes Jacob's hip (32:25)
SFX.add(sfx_thump(58, 1.6, 1.0), 31.2, .16, 0); SFX.add(sfx_snap(), 31.25, .1, 0); SFX.add(sfx_low(), 31.5, .08, 0)
# 38.0 - 40.6: "Not unless you bless me": a held rise
SFX.add(sfx_riser(2.0), 38.4, .1, 0)
# 41.2 - 46.4: the blessing and the new name (32:28): a pale gold light, chimes
SFX.add(sfx_grow(2.6), 41.0, .15, 0); SFX.add(sfx_chime(), 41.6, .22, 0); SFX.add(sparkle(1.0, 41), 41.9, .2, 0)
SFX.add(sfx_chime(), 44.4, .16, .1); SFX.add(sfx_chime(), 46.6, .14, -.1)
# 48.6 - 49.6: he is gone in a rising light
SFX.add(sparkle(1.0, 48), 48.8, .2, 0); SFX.add(S.whoosh(1.4, 400, 3400, .5, .4), 48.7, .07, 0)
# 50.4 - 56.3: Peniel (32:30): a chime, the sun, a wide light
SFX.add(sfx_grow(2.6), 50.3, .14, 0); SFX.add(sfx_chime(), 50.8, .22, 0); SFX.add(sparkle(1.0, 50), 51.1, .18, 0); SFX.add(sfx_chime(), 53.4, .14, .1)
# 57.3 - 60.2: Jacob walks on, limping (32:31): uneven steps and a dragged foot
for k_ in range(5): SFX.add(sfx_step(), 57.6 + .66 * k_, .034, -.1 + .05 * k_); SFX.add(sfx_cloth(.5), 57.95 + .66 * k_, .03, 0)
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
out = out.replace('out31', 'out32')
i = out.index('"""Episode 31'); j = out.index('Outputs:')
out = out[:i] + '"""Episode 32 ambience + sound effects (original, synthesised). Events follow the film\'s own timings (g11/src/world32.js, main32.js, reflect32.js).\n' + out[j:]
open('/home/claude/music/compose32_sfx.py', 'w').write(out); print('ok', len(out))
