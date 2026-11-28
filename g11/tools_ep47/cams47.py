# Camera keys per shot: (t0, t, x, z, hy, az, el, w). t0 = shot start, t = key time (absolute), target = ground(x, z) + hy, w = frame width at the target.
# az: 90 = camera east of the target looking west, 0 = camera south looking north, 180 = camera north. Camera distance is about 3.85 x w (FOV 26).
# Version 1 (drafts; tuned with camtry47 candidate sheets).
CAMS = {}
def K(n, t0, t, p, az, el, w): CAMS[n] = CAMS.get(n, []) + [(t0, t, round(p[0], 2), round(p[1], 2), p[2], az, el, w)]
# 1 the court: Pharaoh enthroned, the brothers before him (low, wide)
K('S1', 0.0, 0.0, (-5.3, -.55, .4), 100, 7, 3.4); K('S1', 0.0, 3.4, (-5.45, -.55, .45), 108, 6, 2.8)
# 2 we are shepherds: the five brothers speak
K('S2', 3.3, 3.3, (-4.6, -.55, .35), 120, 8, 2.6); K('S2', 3.3, 7.0, (-4.6, -.55, .35), 130, 8, 2.3)
# 3 settle them in Goshen: Pharaoh speaks
K('S3', 6.9, 6.9, (-6.0, -.6, .45), 70, 5, 1.6); K('S3', 6.9, 9.8, (-6.0, -.6, .47), 78, 5, 1.3)
# 4 Goshen, the best of the land: tents, flocks, morning
K('S4', 9.7, 9.7, (-3.2, 3.6, .35), 350, 14, 4.2); K('S4', 9.7, 12.9, (-3.2, 3.6, .35), 338, 14, 3.8)
# 5 Joseph brings Jacob in through the gate
K('S5', 12.8, 12.8, (-4.2, -.9, .35), 100, 7, 2.6); K('S5', 12.8, 14.9, (-4.4, -.8, .35), 108, 7, 2.2)
# 6 Jacob raises his hands and blesses Pharaoh (over Jacob's shoulder)
K('S6', 14.8, 14.8, (-5.4, -.65, .45), 85, 6, 1.4); K('S6', 14.8, 16.9, (-5.4, -.65, .45), 90, 6, 1.25)
# 7 Pharaoh asks: how old are you?
K('S7', 16.8, 16.8, (-6.0, -.6, .52), 80, 4, 1.0); K('S7', 16.8, 18.9, (-6.0, -.6, .52), 85, 4, .85)
# 8 Jacob: a hundred and thirty years, few and hard (push-in)
K('S8', 18.8, 18.8, (-4.8, -.7, .42), 335, 8, 1.1); K('S8', 18.8, 24.5, (-4.8, -.7, .42), 330, 8, .85)
# 9 the famine grows heavy: the dusty queue at the granary
K('S9', 24.4, 24.4, (4.1, 1.7, .3), 150, 12, 2.8); K('S9', 24.4, 27.0, (4.0, 1.7, .3), 140, 12, 2.4)
# 10 silver for grain: the table, the balance
K('S10', 26.9, 26.9, (3.1, 1.72, .3), 200, 14, 1.1); K('S10', 26.9, 29.2, (3.1, 1.72, .3), 165, 14, 1.0)
# 11 livestock led in; the farmers kneel on the dry field
K('S11', 29.1, 29.1, (4.2, 1.0, .25), 150, 12, 2.1); K('S11', 29.1, 31.9, (4.2, 1.0, .25), 170, 12, 1.8)
# 12 Joseph buys the land for Pharaoh
K('S12', 31.8, 31.8, (2.8, 5.5, .3), 270, 8, 1.6); K('S12', 31.8, 33.8, (2.8, 5.5, .3), 280, 8, 1.4)
# 13 the seed is given; the field begins to grow
K('S13', 33.7, 33.7, (2.5, 5.4, .35), 0, 9, 1.4); K('S13', 33.7, 36.9, (2.5, 5.4, .35), -15, 9, 1.3)
# 14 you have saved our lives: the people with open hands, the green field
K('S14', 36.8, 36.8, (2.7, 5.5, .3), 200, 10, 2.3); K('S14', 36.8, 41.6, (2.7, 5.5, .3), 225, 10, 1.8)
# 15 Israel settled in Goshen and grew very numerous: crane over the camp at sunrise
K('S15', 41.5, 41.5, (-3.2, 4.4, .3), 30, 30, 5.0); K('S15', 41.5, 46.8, (-3.2, 4.4, .3), 40, 38, 6.0)
# 16 Jacob at the door of his tent at the end of the day
K('S16', 46.7, 46.7, (-3.5, 3.45, .3), 330, 6, 1.5); K('S16', 46.7, 50.0, (-3.5, 3.45, .3), 320, 6, 1.25)
# 17 Jacob in bed: the time of his death drew near
K('S17', 49.9, 49.9, (-4.45, 4.15, .24), 5, 28, 1.1); K('S17', 49.9, 52.9, (-4.45, 4.15, .24), 15, 26, .95)
# 18 do not bury me in Egypt (over Joseph's shoulder)
K('S18', 52.8, 52.8, (-4.2, 4.3, .25), 355, 22, 1.6); K('S18', 52.8, 56.6, (-4.2, 4.3, .25), 350, 20, 1.35)
# 19 Joseph swears
K('S19', 56.5, 56.5, (-4.15, 4.6, .35), 55, 8, 1.1); K('S19', 56.5, 58.7, (-4.15, 4.6, .35), 50, 8, 1.0)
# 20 Israel bowed at the head of his bed
K('S20', 58.6, 58.6, (-4.35, 4.2, .3), 50, 10, 1.1); K('S20', 58.6, 62.0, (-4.35, 4.2, .3), 55, 10, .95)
