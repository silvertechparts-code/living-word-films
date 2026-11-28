# Camera keys per shot: (t0, t, x, z, hy, az, el, w). t0 = shot start, t = key time (absolute), target = ground(x, z) + hy, w = frame width at the target.
# az: 90 = camera east of the target looking west, 0 = camera south looking north, 180 = camera north. Camera distance is about 3.85 x w (FOV 26).
# Version 1 (drafts; tuned with camtry46 candidate sheets).
import math
def _route(start, tdep, v, pts):
    ks = [(0.0, start[0], start[1])]
    ks.append((tdep, start[0], start[1]))
    for q in pts:
        l = ks[-1]; ks.append((l[0] + math.hypot(q[0] - l[1], q[1] - l[2]) / v, q[0], q[1]))
    return ks
def _at(ks, t):
    if t <= ks[0][0]: return ks[0][1], ks[0][2]
    for a, b in zip(ks, ks[1:]):
        if t <= b[0]:
            u = 0 if b[0] == a[0] else (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u
    return ks[-1][1], ks[-1][2]
_CP = [(2.6, .2), (2.2, .95), (.45, 1.22), (-1.0, 1.16)]
WK = [_route((1.4, -1.5), 32.4, .55, _CP + [(-1.7, 1.18)]), _route((2.6, -1.9), 33.4, .55, _CP + [(-.45, 1.14)])]
def wag(i, t, back=.9):
    x, z = _at(WK[i], t); x2, z2 = _at(WK[i], t + .3); dx, dz = x2 - x, z2 - z; l = math.hypot(dx, dz) or 1
    if l < 1e-6 or (dx == 0 and dz == 0): dx, dz, l = 1.2, 1.7, 2.08
    return x - dx / l * back, z - dz / l * back
def W(i, t, hy=.6, back=.9): x, z = wag(i, t, back); return x, z, hy
CAMS = {}
def K(n, t0, t, p, az, el, w): CAMS[n] = CAMS.get(n, []) + [(t0, t, round(p[0], 2), round(p[1], 2), p[2], az, el, w)]
# 1 camp at golden hour: Jacob sets out
K('S1', 0.0, 0.0, (4.3, -3.2, .45), 50, 9, 4.6); K('S1', 0.0, 3.0, (4.3, -3.2, .45), 44, 8, 3.8)
# 2 Jacob comes to the altar at Beersheba
K('S2', 2.8, 2.8, (4.4, -3.7, .5), 30, 8, 2.0); K('S2', 2.8, 5.6, (4.7, -3.4, .5), 24, 7, 1.7)
# 3 the sacrifice: Jacob kneels, hands raised, the fire
K('S3', 5.4, 5.4, (5.0, -3.3, .55), 25, 5, 1.5); K('S3', 5.4, 8.4, (5.1, -3.3, .6), 35, 5, 1.2)
# 4 night: he lies down, the stars
K('S4', 8.3, 8.3, (4.9, -3.3, .6), 15, 5, 3.0); K('S4', 8.3, 11.0, (4.9, -3.3, .7), 12, 4, 2.4)
# 5 the vision: the column of light, here I am
K('S5', 10.9, 10.9, (4.7, -3.5, .8), 235, 5, 2.2); K('S5', 10.9, 14.3, (4.7, -3.5, .8), 245, 5, 1.8)
# 6 the promise (I am the God of your father)
K('S6', 14.2, 14.2, (4.75, -3.5, .6), 250, 5, 1.8); K('S6', 14.2, 17.2, (4.75, -3.5, .6), 242, 5, 1.5)
# 7 close-up: do not fear
K('S7', 17.1, 17.1, (4.85, -3.3, .5), 240, 3, 1.1); K('S7', 17.1, 20.2, (4.85, -3.3, .5), 232, 3, .9)
# 8 high wide: the sons asleep around him, the column, the stars
K('S8', 20.1, 20.1, (4.2, -3.4, .3), 160, 20, 4.8); K('S8', 20.1, 23.0, (4.2, -3.4, .3), 150, 18, 4.2)
# 9 I will go down with you: from behind him, looking west toward Egypt
K('S9', 22.9, 22.9, (4.7, -3.3, .7), 95, 5, 2.4); K('S9', 22.9, 26.0, (4.6, -3.3, .7), 100, 6, 2.0)
# 10 Joseph will close your eyes
K('S10', 25.9, 25.9, (4.85, -3.3, .5), 232, 3, 1.0); K('S10', 25.9, 29.8, (4.85, -3.3, .5), 225, 3, .85)
# 11 dawn: the sons rise, the wagons wait
K('S11', 29.7, 29.7, (3.4, -2.4, .5), 205, 10, 4.2); K('S11', 29.7, 33.3, (3.2, -2.0, .5), 215, 10, 3.6)
# 12 the lead wagon rolls: Jacob rides
K('S12', 33.2, 33.2, W(0, 33.2), 60, 7, 1.7); K('S12', 33.2, 36.8, W(0, 36.8), 70, 7, 1.7)
# 13 the wives and children in the second wagon
K('S13', 36.7, 36.7, W(1, 36.7, .55), 50, 8, 2.0); K('S13', 36.7, 40.0, W(1, 40.0, .55), 60, 8, 2.0)
# 14 the caravan crosses the ford
K('S14', 39.9, 39.9, (.8, 1.0, .3), 150, 14, 5.0); K('S14', 39.9, 43.8, (-.2, 1.1, .3), 160, 14, 5.0)
# 15 Judah runs ahead
K('S15', 43.7, 43.7, (-2.2, 1.1, .5), 15, 6, 3.2); K('S15', 43.7, 47.0, (-5.4, 1.1, .5), 20, 6, 2.8)
# 16 Joseph hears him; the chariot
K('S16', 46.9, 46.9, (-8.3, .95, .5), 30, 7, 3.0); K('S16', 46.9, 49.6, (-8.0, .95, .5), 40, 7, 2.7)
# 17 the chariot drives east, Jacob steps down
K('S17', 49.5, 49.5, (-8.0, 1.0, .5), 70, 8, 3.8); K('S17', 49.5, 52.0, (-5.6, .9, .5), 85, 8, 3.4)
# 18 the embrace
K('S18', 51.9, 51.9, (-3.38, .75, .55), 15, 7, 1.8); K('S18', 51.9, 56.6, (-3.38, .75, .55), 25, 7, 1.4)
# 19 weeping on his neck; now I can die
K('S19', 56.5, 56.5, (-3.38, .75, .62), 25, 5, 1.2); K('S19', 56.5, 61.8, (-3.38, .75, .62), 35, 5, 1.0)
