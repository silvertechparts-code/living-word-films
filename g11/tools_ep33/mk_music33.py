#!/usr/bin/env python3
# Builds /home/claude/music/compose33_music.py from compose32_music.py: same instruments and reflection, new Ep33 story arc (times follow world33.js / main33.js).
s = open('/home/claude/music/compose32_music.py').read()
a = s.index('# ================================================================== 0 - 7.0'); b = s.index('# ================================================================== 60 - 85')
NEW = r'''# ================================================================== 0 - 9.8  a1: Jacob looks up and sees Esau coming with four hundred men; he arranges his family, Rachel and Joseph last (33:1-2): a held breath, then a low rumble as the host rises
drone(0, 9.8, FQ('D1'), .22, att=1.2, rel=1.8)
pad(0.2, 4.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.4, bright=900)
solo(0.9, 'A4', 2.0, .2, att=.8, bright=1000); pno(1.6, 'D5', 3.0, .12, .42)
B['timp'].add(S.timpani(FQ('D1'), 2.4, 1.0), 1.0, .16); B['sub'].add(S.sub_boom(FQ('D1'), 3.2), 1.0, .2)
trem_pad(1.6, 4.8, ['D2', 'A2', 'F3'], .16, 6.0)
for k_ in range(6): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 2.2 + .5 * k_, .05 + .01 * k_)
pad(4.6, 10.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.9, bright=1100)
solo(5.2, 'F4', 2.0, .18, att=.6, bright=1000); solo(7.4, 'D5', 2.0, .18, att=.6, bright=1100); pno(6.2, 'A4', 2.6, .11, .42)
bell(8.6, 'D6', .08, d=5.0)

# ================================================================== 9.9 - 15.8  a2: he went ahead and bowed to the ground seven times (33:3): a soft pulse on each bow
pad(10.0, 15.8, ['D2', 'A2', 'D3', 'F3'], .26, att=1.0, bright=900)
solo(10.4, 'A4', 2.0, .2, att=.6, bright=1000)
for k_ in range(7): B['timp'].add(S.timpani(FQ('D1'), .9, .5), 11.1 + .67 * k_, .05 + .007 * k_)
solo(12.6, 'C5', 1.8, .19, att=.5, bright=1100); solo(14.2, 'D5', 1.8, .19, att=.5, bright=1100); pno(12.8, 'F4', 2.6, .11, .42)
trem_pad(13.0, 16.0, ['D2', 'A2', 'F3'], .15, 6.5)

# ================================================================== 15.8 - 23.2  b1: but Esau ran to meet him, embraced him, fell on his neck, kissed him, and they wept (33:4): his run builds, the embrace is the release and the emotional peak
for k_ in range(8): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 15.8 + .26 * k_, .06 + .012 * k_)
pad(15.8, 18.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.4, bright=1500)
B['timp'].add(S.timpani(FQ('F1'), 2.6, 1.0), 18.0, .18); B['sub'].add(S.sub_boom(FQ('F1'), 3.4), 18.0, .2)
pad(18.0, 23.2, ['F2', 'C3', 'F3', 'A3', 'C4'], .42, att=.5, bright=2400)
choir(18.2, 23.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'C6', 'F6')): B['harp'].add(pluck(M(nm)), 18.4 + .3 * k_, .1, pan=-.3 + .08 * k_)
solo(18.6, 'C5', 2.2, .24, att=.5, bright=2000); solo(20.6, 'F5', 2.2, .25, att=.5, bright=2200); pno(19.0, 'A5', 3.0, .15, .5)
bell(18.3, 'F6', .16, d=4.8); bell(20.8, 'C7', .14, d=4.6, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.8, rel=1.4, peak=1500), 19.6, .1, pan=.1)

# ================================================================== 23.2 - 31.0  b2: Esau saw the women and children: who are these? The children God has graciously given me (33:5-7): tender, the family comes forward and bows
pad(23.2, 27.4, ['F2', 'C3', 'F3', 'A3'], .3, att=1.2, bright=1300); pad(27.4, 31.0, ['D2', 'A2', 'D3', 'F3'], .3, att=1.0, bright=1300)
choir(23.6, 31.0, ['A3', 'C4', 'F4'], .22, 'oo', att=1.4)
solo(24.2, 'A4', 2.0, .18, att=.7, bright=1100); pno(25.0, 'F5', 2.8, .11, .42); solo(26.4, 'C5', 2.0, .18, att=.6, bright=1100)
bell(28.4, 'A6', .08, d=5.0, pan=-.2); bell(29.4, 'D6', .08, d=5.0, pan=.2)

# ================================================================== 31.0 - 35.8  c1: I have enough, my brother; keep what is yours (33:9): warm, an open chord
pad(31.0, 35.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .34, att=.8, bright=1500)
solo(31.4, 'D5', 1.8, .2, att=.5, bright=1300); solo(33.0, 'F5', 2.0, .2, att=.6, bright=1400); pno(32.4, 'A4', 2.6, .12, .44)

# ================================================================== 35.6 - 44.6  c2: please accept my gift; to see your face is like seeing the face of God (33:10-11): the gift arrives, then a luminous swell
pad(35.6, 40.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .36, att=.9, bright=1900); pad(40.4, 45.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.8, bright=2500)
choir(36.4, 45.0, ['A3', 'C4', 'F4', 'A4', 'C5'], .4, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'A5', 'F5')): B['harp'].add(pluck(M(nm)), 36.6 + .34 * k_, .09, pan=-.3 + .1 * k_)
for t_, nm, d_ in ((38.0, 'C5', 2.0), (40.2, 'F5', 2.0), (42.2, 'A5', 2.2)): solo(t_, nm, d_, .24, att=.4, bright=2100); pno(t_, nm, d_ + .8, .14, .5)
bell(40.6, 'F6', .14, d=4.8); bell(42.6, 'C7', .14, d=4.6, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.6, att=.9, rel=1.4, peak=1400), 41.0, .1, pan=.1)

# ================================================================== 44.6 - 53.4  d1: Esau accepted and returned to Seir; Jacob went on slowly at the pace of his children and flocks (33:11-16): a gentle rolling figure, unhurried
pad(44.6, 49.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.0, bright=1600); pad(49.0, 53.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.9, bright=1500)
arp(44.8, 52.8, 41, 4, .08, .44)
solo(45.4, 'C5', 2.0, .2, att=.6, bright=1400); solo(47.4, 'A4', 2.0, .19, att=.6, bright=1300); solo(49.6, 'F5', 2.0, .19, att=.6, bright=1400); pno(46.4, 'F5', 2.8, .11, .44)
bell(51.0, 'F6', .1, d=4.6)

# ================================================================== 53.2 - 60.8  e1: he came safely to Shechem, bought a piece of land, and built an altar there (33:18-20): a sacred hush, a bell for each of the seven stones
pad(53.2, 57.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .34, att=1.0, bright=1500)
choir(53.6, 59.6, ['A3', 'C4', 'F4'], .3, 'oo', att=1.2)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'A5', 'C6', 'F6')): bell(55.0 + .42 * k_, nm, .07, d=3.4, pan=-.2 + .07 * k_)
solo(56.6, 'C5', 2.0, .2, att=.5, bright=1500); pno(57.0, 'A4', 2.6, .12, .45)
pad(57.4, 60.8, ['F2', 'C3', 'F3', 'A3'], .26, att=.8, bright=1500)
solo(58.0, 'F5', 1.8, .18, att=.5, bright=1500); bell(59.2, 'F6', .1, d=4.6)

'''
s = s[:a] + NEW + s[b:]
s = s.replace('out32', 'out33')
i = s.index('"""Episode 32'); j = s.index('Outputs:')
s = s[:i] + '"""Episode 33 (Genesis 33, Jacob meets Esau) score -- original, synthesised with numpy.\nArc (written in F, sounding in D): a held breath and a low rumble as Esau\'s host rises (a1) -> seven bows, a soft pulse (a2) -> Esau\'s run and the embrace, the emotional peak (b1) -> a tender, hushed family (b2, c1) -> the gift and a luminous swell (c2) -> an unhurried journey (d1) -> a sacred hush at the altar (e1) -> the warm reflection and the question (as in the other episodes).\n' + s[j:]
open('/home/claude/music/compose33_music.py', 'w').write(s); print('ok', len(s))
