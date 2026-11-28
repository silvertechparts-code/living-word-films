#!/usr/bin/env python3
# Derives the Genesis 42 reflection (same time-warp as Ep41: the Ep42 reflection lines start at the same places), question card, subtitle drawer, build script and debug scripts from the Ep41 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect41.js').read()
L = s.split('\n')
hdr = [
 "// Episode 42, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Years later, the brothers finally spoke of what they had done to Joseph.\");",
 "// the road quietly begins to glow (h2, \"The wrong had not stayed buried. It had only been waiting.\"); the person lifts their head into soft golden light (h3, \"Facing a wrong is where repair can begin.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, name one wrong you have been avoiding, and bring it to God.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W42) from the Ep31 timings onto the Ep42 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = rep(s, "// Ep41 time -> Ep31 set time (h1 61.8->61.4, h2 66.8->66.9, h3 73.0->72.4, h4 78.8->79.0, question 85->86.1); IW41 is the inverse",
           "// Ep42 time -> Ep31 set time (h1 61.8->61.4, h2 66.8->66.9, h3 73.0->72.4, h4 78.8->79.0, question 85->86.1); IW42 is the inverse")
assert "const WP = [[60, 60], [61.8, 61.4], [66.8, 66.9], [73.0, 72.4], [78.8, 79.0], [85, 86.1], [90, 91.1]];" in s
s = s.replace('W41', 'W42')   # also turns IW41 into IW42
open(S + 'src/reflect42.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end41.js').read()
s = rep(s, "// Episode 41 final card (question: What will you thank God for today?)", "// Episode 42 final card (question: What old wrong are you ready to face?)")
old = """  cineTitle(cx, t, ['WHAT WILL YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['THANK GOD FOR'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['TODAY?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT OLD WRONG'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['ARE YOU READY'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['TO FACE?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end42.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs41.js').read()
s = s.replace("subs41.json", "subs42.json").replace("Episode 41", "Episode 42")
open(S + 'src/subs42.js', 'w').write(s)
if not os.path.exists(S + 'src/subs42.json'):
    open(S + 'src/subs42.json', 'w').write('[]')

# ---- build script
s = open(S + 'build41.sh').read()
s = s.replace('main41.js', 'main42.js').replace('bundle41.js', 'bundle42.js').replace('ep41.html', 'ep42.html').replace('Episode 41 - Genesis 41', 'Episode 42 - Genesis 42').replace('Episode 41', 'Episode 42')
open(S + 'build42.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep42_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '41.py').read()
    s = s.replace('ep41', 'ep42').replace('main41', 'main42')
    open(S + n + '42.py', 'w').write(s)
s = open(S + 'camtry41.py').read().replace('ep41', 'ep42')
open(S + 'camtry42.py', 'w').write(s)
s = open(S + 'sheet41.py').read().replace('ep41', 'ep42')
open(S + 'sheet42.py', 'w').write(s)
print('ok')
