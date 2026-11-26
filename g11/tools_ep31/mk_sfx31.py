#!/usr/bin/env python3
# Builds /home/claude/music/compose31_sfx.py from compose30_sfx.py: same helpers and reflection, new Ep31 story effects (times follow world31.js / main31.js).
s = open('/home/claude/music/compose30_sfx.py').read()
a = s.index('# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 30)')
b = s.index('# the reflection (60 - 85)')
head = s[:a]; tail = s[b:]
NEW = r'''# ------------------------------------------------------------------ ambience and effects, scene by scene (Genesis 31). Times follow world31.js / main31.js / reflect31.js
wind_bed(0.0, 22.0, .05, 2.0); wind_bed(21.8, 60.0, .06, 2.0); wind_bed(59.5, 90.4, .07, 2.0)                         # the pasture and the road; the camp on the hill; the village lane
bird_bed(0.2, 6.6, .07, .025, 7)                                                                                        # the golden pasture
cricket_bed(6.6, 12.0, [(6.6, 0), (8.0, .03), (10.4, .026), (12.0, 0)])                                                # the grey hour of the departure
bird_bed(11.6, 16.6, .08, .03, 9)                                                                                       # the dawn, the road
cricket_bed(16.6, 22.4, [(16.6, 0), (18.0, .03), (21.0, .028), (22.4, 0)])                                             # the night of the dream
fire_bed(16.8, 22.4, [(16.8, 0), (18.0, .03), (21.4, .03), (22.4, 0)], 1.2)                                           # Laban's night fire
bird_bed(22.4, 54.0, .08, .03, 13)                                                                                      # the day at the camp
murmur_bed(22.5, 36.0, .016, 1.6)                                                                                       # the kinsmen and the household, watching
cricket_bed(50.0, 54.6, [(50.0, 0), (52.0, .02), (54.0, .016), (54.6, 0)])                                             # the dusk by the heap of stones
bird_bed(54.6, 60.4, .09, .03, 15)                                                                                      # the morning of the farewell
fire_bed(61.0, 80.6, [(61.0, 0), (63.0, .02), (78.0, .02), (80.6, 0)], 1.2)                                           # the lamp-lit house
bird_bed(66.0, 85.0, .12, .045, 11)                                                                                    # the lane, a calm evening
# 1.0 - 6.4: the Lord says to Jacob: go home, and I will be with you (31:3): a soft rising light and a chime
SFX.add(sfx_grow(2.8), 1.0, .14, 0); SFX.add(sfx_chime(), 3.3, .2, 0); SFX.add(sparkle(1.0, 3), 3.6, .18, 0)
for t_ in (1.8, 2.7, 4.6): SFX.add(sfx_bleat(), t_, .03, r_.uniform(-.6, .6))
light_hum(1.2, 7.0, [(1.2, 0), (3.0, .5), (6.0, .35), (7.0, 0)], 1.2)
# 6.9 - 10.9: Jacob leaves in secret with his wives, children and flocks (31:17-18): quiet steps, cloth, hooves, a camel
for k_ in range(10): SFX.add(sfx_step(), 7.6 + .4 * k_, .022, -.3 + .06 * k_)
SFX.add(sfx_cloth(1.0), 7.4, .04, 0); SFX.add(sfx_cloth(.9), 9.2, .04, .1)
for t_ in (8.6, 9.4, 10.1): SFX.add(sfx_bleat(), t_, .035, r_.uniform(-.7, .7))
for k_ in range(10): SFX.add(hoof(k_), 8.4 + .3 * k_, .028, -.2 + .05 * k_)
SFX.add(sfx_camel_grunt(), 8.9, .05, .3)
# 10.9 - 13.0: Rachel takes her father's household gods (31:19): a hush, cloth, a soft clink, a low note
SFX.add(sfx_cloth(.9), 11.0, .04, 0); SFX.add(sfx_clink(1), 11.8, .05, .1); SFX.add(sfx_low(), 12.0, .07, 0)
for k_ in range(5): SFX.add(sfx_step(), 12.9 + .4 * k_, .022, .2)
# 14.5 - 17.4: Laban chases them seven days (31:22-23): running steps and breath of wind
for k_ in range(11): SFX.add(sfx_step(), 14.6 + .27 * k_, .03, -.1 + .04 * k_)
for k_ in range(9): SFX.add(sfx_step(), 14.9 + .31 * k_, .024, .2 - .03 * k_)
SFX.add(sfx_cloth(1.0), 15.2, .045, 0); SFX.add(S.whoosh(1.6, 500, 2600, .5, .4), 16.4, .06, 0)
# 17.9 - 21.8: God comes to Laban in a dream (31:24): a rising pale light, a chime, a sparkle
SFX.add(sfx_grow(2.8), 18.4, .15, 0); SFX.add(sfx_chime(), 18.7, .22, 0); SFX.add(sparkle(1.0, 18), 19.0, .2, 0)
light_hum(18.2, 22.0, [(18.2, 0), (19.4, .5), (21.0, .4), (22.0, 0)], 1.2)
SFX.add(sfx_chime(), 20.6, .12, .2)
# 21.4 - 24.9: Laban comes into the camp and faces Jacob (31:25-30): steps, cloth, a low thud
for k_ in range(6): SFX.add(sfx_step(), 21.5 + .26 * k_, .03, .2 - .08 * k_)
SFX.add(sfx_thump(58, 1.4, .8), 22.2, .1, 0); SFX.add(sfx_cloth(1.0), 23.2, .04, 0); SFX.add(sfx_low(), 22.4, .06, 0)
SFX.add(sfx_cloth(.9), 25.8, .04, 0)
# 28.5 - 31.0: Jacob answers: whoever has them will not live (31:31-32)
SFX.add(sfx_low(), 28.4, .06, 0); SFX.add(sfx_cloth(1.0), 29.6, .04, 0)
# 31.0 - 36.0: Laban searches the tents (31:33-35): steps, a tent flap, goods moved, then a quiet beat on Rachel
for t_ in (31.4, 32.7, 34.0): SFX.add(sfx_cloth(.8), t_, .06, .1); SFX.add(sfx_clink(int(t_) % 4), t_ + .3, .05, .1)
for k_ in range(14): SFX.add(sfx_step(), 31.0 + .33 * k_, .022, .15)
SFX.add(sfx_low(), 35.4, .06, 0); SFX.add(sfx_chime(), 35.3, .08, .2)
# 36.4 - 41.0: Jacob answers Laban: twenty years I served you (31:36-42): a hush and a held tension
SFX.add(sfx_thump(58, 1.4, .8), 36.5, .07, 0); SFX.add(sfx_cloth(1.0), 38.4, .04, 0)
# 41.2 - 46.4: God is with Jacob (31:42): a pale gold light falls on him
SFX.add(sfx_grow(2.6), 41.0, .15, 0); SFX.add(sfx_chime(), 41.6, .22, 0); SFX.add(sparkle(1.0, 41), 41.9, .2, 0)
light_hum(41.2, 46.6, [(41.2, 0), (42.6, .5), (45.0, .5), (46.6, 0)], 1.2)
SFX.add(sfx_chime(), 44.4, .14, .1)
# 46.3 - 50.7: the stones are piled up as a witness (31:46): one stone after another
for k_ in range(15): SFX.add(sfx_stone(), 46.4 + .3 * k_, .04 + .005 * (k_ % 3), -.3 + .04 * k_)
for k_ in range(12): SFX.add(sfx_step(), 46.6 + .34 * k_, .02, .1)
# 51.3 - 54.0: the Lord watch between us (31:49)
SFX.add(sfx_grow(2.4), 51.4, .1, 0); SFX.add(sfx_chime(), 51.7, .16, 0)
# 54.6 - 58.4: next morning Laban kisses his grandchildren and daughters and blesses them (31:55)
SFX.add(sfx_grow(2.6), 54.5, .12, 0); SFX.add(sfx_chime(), 55.2, .16, 0)
for t_ in (55.8, 56.5, 57.2): SFX.add(sfx_cloth(1.0), t_, .04, .1)
SFX.add(sfx_chime(), 56.6, .14, .1); SFX.add(sparkle(1.0, 56), 56.9, .16, 0)
# 58.0 - 60.6: Laban goes home alone: steps fading away
for k_ in range(7): SFX.add(sfx_step(), 58.2 + .5 * k_, .026 - .002 * k_, -.2 - .04 * k_)
# 58.8 - 61.6: the mist wipe into the reflection
SFX.add(S.whoosh(2.4, 500, 3800, .6, .4), 59.0, .16, 0); SFX.add(sfx_chime(), 60.8, .18, 0)
'''
out = head + NEW + tail
out = out.replace('out30', 'out31')
out = out.replace('"""Episode 30 ambience + sound effects (original, synthesised). Events follow the film\'s own timings (g11/src/world30.js, main30.js, reflect30.js).', '"""Episode 31 ambience + sound effects (original, synthesised). Events follow the film\'s own timings (g11/src/world31.js, main31.js, reflect31.js).')
open('/home/claude/music/compose31_sfx.py', 'w').write(out); print('ok', len(out))
