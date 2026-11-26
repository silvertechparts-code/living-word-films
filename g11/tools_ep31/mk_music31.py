#!/usr/bin/env python3
# Builds /home/claude/music/compose31_music.py from compose30_music.py: same instruments and reflection, new Ep31 story arc.
s = open('/home/claude/music/compose30_music.py').read()
a = s.index('# ================================================================== 0 - 8.4'); b = s.index('# ================================================================== 60 - 85')
NEW = r'''# ================================================================== 0 - 6.4  a1: after twenty years with Laban the Lord told Jacob: go home, I will be with you (31:3): a low drone, a lone solo, then a warm light as God speaks
drone(0, 6.8, FQ('D1'), .2, att=1.2, rel=1.8)
pad(0.2, 3.4, ['D2', 'A2', 'D3', 'F3', 'A3'], .24, att=1.6, bright=900); pad(3.4, 6.8, ['F2', 'C3', 'F3', 'A3', 'C4'], .3, att=1.0, bright=1500)
solo(1.0, 'A4', 2.2, .2, att=.8, bright=1000); solo(3.3, 'C5', 2.2, .22, att=.6, bright=1300)
choir(3.2, 7.0, ['A3', 'C4', 'F4'], .22, 'oo', att=1.2)
pno(2.0, 'D5', 3.0, .14, .42); pno(4.2, 'A5', 3.0, .13, .42)
bell(1.6, 'D6', .08, d=5.0); bell(3.6, 'F6', .12, d=4.8, pan=.3)

# ================================================================== 6.4 - 14.3  a2: Jacob left in secret with his wives, children and flocks; Rachel stole her father's household gods (31:17-21): hushed and tense, a low heartbeat, a muted stab at the theft
pad(6.6, 10.6, ['D2', 'A2', 'D3', 'F3'], .26, att=1.4, bright=800)
trem_pad(7.0, 10.8, ['D2', 'A2', 'F3'], .16, 5.5)
for k_ in range(6): B['timp'].add(S.timpani(FQ('D1'), 1.0, .5), 7.2 + .83 * k_, .06 + .01 * k_)
solo(8.0, 'D5', 1.8, .16, att=.7, bright=900); solo(9.6, 'F5', 1.8, .16, att=.7, bright=900)
pno(8.6, 'A4', 2.4, .11, .4)
B['timp'].add(S.timpani(FQ('D1'), 2.0, .9), 10.9, .14); B['sub'].add(S.sub_boom(FQ('D1'), 3.0), 10.9, .18)
pad(10.9, 14.6, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.5, bright=1100)
solo(11.4, 'Db5', 1.8, .17, att=.5, bright=1100); solo(12.8, 'F5', 1.8, .15, att=.5, bright=1000)
pno(11.8, 'D5', 2.8, .12, .42)

# ================================================================== 14.3 - 22.0  b1: Laban chased them for seven days; in a dream God warned him (31:22-24): a driving low pulse, then a hush and a pale light as he sleeps
trem_pad(14.4, 17.9, ['D2', 'A2', 'D3'], .2, 6.5)
for k_ in range(10): B['timp'].add(S.timpani(FQ('D1'), .8, .55), 14.5 + .5 * k_ if False else 14.5 + .42 * k_, .07 + .008 * k_)
pad(14.4, 18.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .3, att=.6, bright=1500)
arp(14.6, 17.8, 34, 3, .09, .5)
B['timp'].add(S.timpani(FQ('A1'), 2.6, .7), 17.9, .12)
pad(18.0, 22.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=1.4, bright=1000)
choir(18.4, 22.0, ['A4', 'D5', 'F5'], .26, 'oo', att=1.2)
bell(18.7, 'A6', .14, d=5.0, pan=.2); bell(20.0, 'D7', .1, d=5.0, pan=-.2)
solo(19.0, 'F5', 2.2, .17, att=.9, bright=1100); pno(19.6, 'A5', 3.0, .12, .4)

# ================================================================== 22.0 - 27.6  b2: Laban asked why Jacob fled in secret and stole his gods (31:26-30): a dark held chord and a stab at his arrival
B['timp'].add(S.timpani(FQ('D1'), 2.2, 1.0), 22.1, .17); B['sub'].add(S.sub_boom(FQ('D1'), 3.2), 22.1, .2)
pad(22.0, 25.2, ['D2', 'A2', 'D3', 'F3', 'A3'], .32, att=.5, bright=1400); pad(25.2, 28.0, ['Bb1', 'F2', 'Bb2', 'Db3', 'F3'], .3, att=.8, bright=1300)
solo(22.8, 'A4', 1.8, .2, att=.5, bright=1200); solo(24.6, 'F5', 1.8, .2, att=.5, bright=1200)
pno(23.2, 'D5', 2.8, .13, .45)
for k_ in range(4): B['timp'].add(S.timpani(FQ('D1'), .8, .5), 25.4 + .72 * k_, .06 + .01 * k_)

# ================================================================== 27.6 - 36.4  c1: Jacob: whoever has them will not live; Laban searched and found nothing (31:31-35): sparse and anxious, a rising tremolo, a held suspended chord at the end
trem_pad(27.8, 31.4, ['D2', 'A2', 'F3'], .18, 6.5)
pad(27.7, 31.5, ['D2', 'A2', 'D3', 'F3', 'A3'], .26, att=.8, bright=1200)
solo(28.6, 'D5', 1.8, .18, att=.5, bright=1200); solo(30.2, 'F5', 1.8, .18, att=.5, bright=1300)
pno(29.0, 'A4', 2.6, .12, .44)
pad(31.5, 35.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .28, att=.8, bright=1400)
for k_ in range(3): B['timp'].add(S.timpani(FQ('D1'), .9, .5), 31.5 + 1.3 * k_, .07 + .015 * k_)
solo(32.4, 'D5', 1.8, .18, att=.5, bright=1300); solo(34.0, 'Db5', 2.0, .2, att=.6, bright=1200)
pno(33.2, 'F5', 2.8, .12, .42)
pad(35.0, 37.0, ['Bb1', 'F2', 'Bb2', 'C3', 'F3'], .26, att=.6, bright=1100)
bell(35.2, 'F6', .08, d=4.6, pan=.3)

# ================================================================== 36.4 - 46.0  c2: Jacob answered: twenty years I served you, you changed my wages ten times; without God you would have sent me away empty (31:36-42): stern, then a luminous swell as God is named
pad(36.4, 40.8, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.8, bright=1300); pad(40.8, 43.0, ['Bb1', 'F2', 'Bb2', 'D3', 'F3'], .32, att=.8, bright=1600)
for t_, nm, d_ in ((37.2, 'A4', 2.0), (38.8, 'D5', 2.0), (40.2, 'F5', 2.0)): solo(t_, nm, d_, .2, att=.5, bright=1300); pno(t_, nm, d_ + .8, .12, .45)
B['timp'].add(S.timpani(FQ('D1'), 1.8, .7), 41.0, .1)
pad(43.0, 46.6, ['F2', 'C3', 'F3', 'A3', 'C4'], .4, att=.9, bright=2400)
choir(41.6, 46.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=1.0)
for k_, nm in enumerate(('C5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5')): B['harp'].add(pluck(M(nm)), 42.6 + .34 * k_, .1, pan=-.3 + .08 * k_)
solo(43.4, 'C5', 2.2, .25, att=.5, bright=2000); solo(45.0, 'F5', 2.2, .26, att=.5, bright=2200)
pno(43.8, 'A5', 3.0, .16, .5)
bell(42.9, 'F6', .18, d=4.8); bell(44.4, 'C7', .14, d=4.6, pan=.3)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.9, rel=1.4, peak=1400), 43.6, .1, pan=.1)

# ================================================================== 46.0 - 54.2  d1: they piled up stones as a witness; Laban: the Lord watch between us (31:44-49): calm and steady, a bell for each stone group, warm choir at the covenant
pad(46.0, 50.4, ['F2', 'C3', 'F3', 'A3', 'C4'], .32, att=1.0, bright=1700); pad(50.4, 54.6, ['D2', 'A2', 'D3', 'F3', 'A3'], .3, att=.9, bright=1500)
arp(46.4, 50.4, 41, 4, .09, .48)
for t_, nm, d_ in ((47.0, 'A4', 2.0), (48.8, 'F5', 2.0), (50.6, 'D5', 2.0), (52.2, 'C5', 2.2)): solo(t_, nm, d_, .2, att=.5, bright=1600); pno(t_, nm, d_ + .8, .13, .5)
for k_, (t_, nm) in enumerate(((46.6, 'F6'), (47.4, 'A6'), (48.4, 'C7'), (49.6, 'F6'), (50.8, 'A6'))): bell(t_, nm, .1, d=4.4, pan=-.3 + .15 * k_)
choir(50.6, 54.4, ['A3', 'C4', 'F4'], .3, 'oo', att=1.2)
bell(51.6, 'D6', .14, d=4.8)

# ================================================================== 54.2 - 60.6  e1: next morning Laban kissed his grandchildren and daughters, blessed them, and went home (31:55): a warm lift that grows into a bright, full peak and settles
pad(54.2, 57.0, ['F2', 'C3', 'F3', 'A3', 'C4'], .38, att=.6, bright=2400); pad(57.0, 60.8, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'A3'], .42, att=.8, bright=2800)
choir(54.6, 60.4, ['A3', 'C4', 'F4', 'A4', 'C5'], .46, 'ah', att=.8)
for k_, nm in enumerate(('F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F6', 'A6')): B['harp'].add(pluck(M(nm)), 54.6 + .32 * k_, .11, pan=-.3 + .08 * k_)
for t_, nm, d_ in ((55.0, 'D5', 2.0), (56.6, 'F5', 2.0), (58.0, 'A5', 2.2)): solo(t_, nm, d_, .26, att=.4, bright=2200); pno(t_, nm, d_ + .8, .16, .5)
for m_ in ('F3', 'C4'): B['brass'].add(horn(M(m_), 3.4, att=.8, rel=1.4, peak=1500), 56.2, .12, pan=.1)
B['timp'].add(S.timpani(FQ('F1'), 2.4, .8), 56.4, .14)
bell(55.6, 'C7', .14, d=4.4); bell(57.2, 'F6', .14, d=4.6, pan=.3); bell(58.8, 'A6', .12, d=4.4)

'''
s = s[:a] + NEW + s[b:]
s = s.replace('out30', 'out31')
s = s.replace('"""Episode 30 (Genesis 30, Rachel and Leah, Joseph\'s birth, Jacob\'s flocks) score', '"""Episode 31 (Genesis 31, twenty years with Laban: the secret flight, the chase, the covenant of stones, the farewell) score')
i = s.index('Arc (written in F'); j = s.index('Outputs:')
s = s[:i] + "Arc (written in F, sounding in D): the Lord's call and a warm light (a1) -> the secret departure and the theft, a hushed pulse and a muted stab (a2) -> the chase and the dream, a driving pulse then a pale hush (b1) -> Laban's accusation (b2) -> the search, anxious and sparse (c1)\n -> Jacob's answer, stern then luminous (c2) -> the stones and the covenant, calm (d1) -> the farewell blessing, a bright peak that settles (e1) -> the reflection (same harmonic progression as Ep23/25-30) -> the question chord.\n" + s[j:]
open('/home/claude/music/compose31_music.py', 'w').write(s); print('ok', len(s))
