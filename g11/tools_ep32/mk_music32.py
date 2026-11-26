#!/usr/bin/env python3
# Builds /home/claude/music/compose32_music.py from compose31_music.py: same instruments and reflection, new Ep32 story arc (times follow world32.js / main32.js).
s = open('/home/claude/music/compose31_music.py').read()
a = s.index('# ================================================================== 0 - 6.4'); b = s.index('# ================================================================== 60 - 85')
NEW = r'''# ================================================================== 0 - 7.0  a1: Jacob sends messengers to Esau; they return: he is coming with four hundred men (32:3-6): a golden evening, then a low rumble as the host rises over the ridge
drone(0, 8.0, FQ('D1'), .22, att=1.2, rel=1.8)
pad(0.2, 3.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=1.6, bright=900)
solo(0.9, 'A4', 2.2, .2, att=.8, bright=1000); solo(2.6, 'F4', 2.0, .18, att=.7, bright=900)
pno(1.8, 'D5', 3.0, .13, .42); bell(2.4, 'D6', .08, d=5.0)
B['timp'].add(S.timpani(FQ('D1'), 2.4, 1.0), 3.7, .16); B['sub'].add(S.sub_boom(FQ('D1'), 3.2), 3.7, .2)
pad(3.7, 8.2, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.6, bright=1200); trem_pad(4.0, 8.2, ['D2', 'A2', 'F3'], .16, 6.0)
for k_ in range(7): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 4.6 + .46 * k_, .06 + .01 * k_)
solo(4.8, 'D5', 1.8, .18, att=.5, bright=1200); solo(6.2, 'Db5', 1.8, .18, att=.5, bright=1100)

# ================================================================== 7.9 - 15.0  a2: Jacob was terrified and prayed: Lord, you told me to go home; I am unworthy; save me (32:7-12): hushed, a lone voice, then a plea
pad(8.0, 12.4, ['D2', 'A2', 'D3', 'F3'], .26, att=1.4, bright=800)
solo(9.0, 'A4', 2.2, .2, att=.7, bright=1000); solo(10.8, 'F4', 2.0, .19, att=.7, bright=900)
pno(9.6, 'D5', 2.8, .12, .4)
choir(11.0, 15.2, ['D4', 'F4', 'A4'], .24, 'oo', att=1.2)
pad(12.4, 15.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .26, att=.9, bright=1100)
solo(12.6, 'C5', 2.0, .2, att=.5, bright=1100); pno(12.2, 'A4', 2.6, .12, .42)
bell(13.4, 'D6', .1, d=5.0, pan=.2)

# ================================================================== 15.9 - 20.2  b1: he sent a great gift of animals ahead, herd by herd (32:13-21): a gentle walking pulse, hope in the night
pad(15.0, 20.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.4, bright=1300)
arp(15.2, 20.2, 41, 4, .09, .46)
solo(16.2, 'A4', 2.0, .19, att=.6, bright=1300); solo(17.8, 'C5', 2.0, .2, att=.6, bright=1400)
pno(16.6, 'F5', 2.8, .12, .44); pno(18.4, 'A5', 2.8, .12, .44)
choir(17.0, 20.6, ['A3', 'C4', 'F4'], .22, 'oo', att=1.2)
bell(18.6, 'F6', .1, d=4.8, pan=.3)

# ================================================================== 20.8 - 26.8  b2: that night he sent his family across the Jabbok and stayed behind, alone (32:22-24): a tender, hushed crossing by torchlight; then only a low drone
pad(20.4, 25.2, ['D2', 'A2', 'D3', 'F3'], .24, att=1.4, bright=800)
choir(21.4, 25.6, ['A3', 'D4', 'F4'], .2, 'oo', att=1.4)
solo(22.4, 'F5', 2.0, .17, att=.7, bright=1000); pno(22.8, 'A4', 2.8, .11, .4); solo(24.0, 'D5', 2.4, .16, att=.8, bright=900)
bell(24.4, 'A6', .08, d=5.0, pan=-.2)
drone(24.6, 27.6, FQ('D1'), .2, att=.8, rel=1.2)

# ================================================================== 27.0 - 35.6  c1: a man wrestled with him until daybreak; he struck Jacob's hip (32:24-25): a heartbeat, a rising tremolo, a stab at the strike (31.2 s)
trem_pad(26.9, 31.2, ['D2', 'A2', 'F3'], .2, 7.0)
pad(27.2, 31.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .28, att=.8, bright=1300)
for k_ in range(8): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 27.4 + .5 * k_, .07 + .008 * k_)
solo(28.2, 'D5', 1.8, .18, att=.5, bright=1200); solo(29.8, 'F5', 1.8, .18, att=.5, bright=1300); pno(28.8, 'A4', 2.6, .11, .44)
B['timp'].add(S.timpani(FQ('D1'), 2.4, 1.0), 31.2, .2); B['sub'].add(S.sub_boom(FQ('D1'), 3.4), 31.2, .24)
pad(31.2, 35.8, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .32, att=.3, bright=1500)
solo(31.9, 'Db5', 1.8, .2, att=.5, bright=1200); solo(33.4, 'Bb4', 2.0, .2, att=.6, bright=1100); pno(32.6, 'F5', 2.8, .11, .42)
for k_ in range(3): B['timp'].add(S.timpani(FQ('D1'), .9, .5), 32.6 + 1.0 * k_, .07 + .015 * k_)

# ================================================================== 35.6 - 41.0  c2: "Let me go." "Not unless you bless me." (32:26): held tension, a steady rising line
pad(35.6, 41.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.6, bright=1400)
for t_, nm in ((36.2, 'A4'), (37.4, 'D5'), (38.6, 'F5')): solo(t_, nm, 1.8, .2, att=.5, bright=1400); pno(t_, nm, 2.6, .12, .45)
for k_ in range(5): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 38.2 + .5 * k_, .07 + .015 * k_)
B['timp'].add(S.timpani(FQ('D1'), 1.8, .7), 40.6, .1)

# ================================================================== 41.2 - 49.4  d1: "You will no longer be called Jacob, but Israel" (32:27-29): a luminous swell as the light falls and he is blessed
pad(41.0, 45.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .4, att=.9, bright=2400); pad(45.2, 49.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .4, att=.9, bright=2200)
choir(41.4, 49.6, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 42.0 + .34 * k_, .1, pan=-.3 + .08 * k_)
solo(43.0, 'C5', 2.2, .24, att=.5, bright=2000); solo(45.0, 'F5', 2.2, .25, att=.5, bright=2200); solo(47.0, 'A5', 2.2, .25, att=.5, bright=2200)
pno(43.4, 'A5', 3.0, .15, .5)
bell(41.8, 'F6', .16, d=4.8); bell(44.4, 'C7', .14, d=4.6, pan=.3); bell(46.6, 'F6', .14, d=4.6)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1400), 44.0, .1, pan=.1)

# ================================================================== 49.4 - 56.3  d2: Peniel: "I have seen God face to face, and my life is spared" (32:30): a warm sunrise, the choir opens wide
pad(49.4, 54.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .42, att=.9, bright=2600); pad(54.2, 58.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.8, bright=2800)
choir(50.0, 58.0, ['A3', 'C4', 'F4', 'A4', 'C5'], .5, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 50.8 + .32 * k_, .11, pan=-.3 + .08 * k_)
for t_, nm, d_ in ((51.2, 'D5', 2.0), (52.8, 'F5', 2.0), (54.4, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.4, bright=2200); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.8, rel=1.4, peak=1500), 52.4, .12, pan=.1)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 52.6, .14)
bell(51.8, 'C7', .14, d=4.4); bell(53.4, 'F6', .14, d=4.6, pan=.3); bell(55.0, 'A6', .12, d=4.4)

# ================================================================== 57.4 - 60.6  e1: the sun rose and Jacob walked on, limping (32:31): the light settles and the music thins to one voice
pad(57.4, 60.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=.8, bright=1800)
solo(57.8, 'C5', 2.0, .2, att=.5, bright=1600); pno(58.6, 'A4', 2.6, .12, .45); solo(59.2, 'F5', 1.8, .18, att=.5, bright=1500)
bell(59.0, 'F6', .1, d=4.6)

'''
s = s[:a] + NEW + s[b:]
s = s.replace('out31', 'out32')
i = s.index('"""Episode 31'); j = s.index('Outputs:')
s = s[:i] + '"""Episode 32 (Genesis 32, Jacob wrestles with God at the Jabbok) score -- original, synthesised with numpy.\nArc (written in F, sounding in D): a golden evening, then a low rumble as Esau\'s host rises (a1) -> Jacob\'s fearful prayer, hushed (a2) -> the gift of animals, a gentle walking pulse (b1) -> the family crosses by torchlight, then a lone drone (b2) -> the wrestling, a heartbeat and a stab at the strike (c1) -> "Let me go" / "bless me", held tension (c2) -> the new name, a luminous swell (d1) -> Peniel and sunrise (d2) -> the limp, thinning to one voice (e1) -> the reflection (same harmonic progression as Ep23/25-31) -> the question chord.\n' + s[j:]
open('/home/claude/music/compose32_music.py', 'w').write(s); print('ok', len(s))
