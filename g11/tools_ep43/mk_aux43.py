#!/usr/bin/env python3
# Derives the Genesis 43 reflection, question card, subtitle drawer, build script and debug scripts from the Ep42 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect42.js').read()
L = s.split('\n')
hdr = [
 "// Episode 43, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Judah once said: let us sell him. Now he said: I will be responsible for him.\");",
 "// the road quietly begins to glow (h2, \"The chapter does not say why he changed. It shows what he risked.\"); the person lifts their head into soft golden light (h3, \"Character shows in what we carry for others.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, take responsibility for someone who depends on you.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W43) from the Ep31 timings onto the Ep43 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = rep(s, "// Ep42 time -> Ep31 set time (h1 61.8->61.4, h2 66.8->66.9, h3 73.0->72.4, h4 78.8->79.0, question 85->86.1); IW42 is the inverse",
           "// Ep43 time -> Ep31 set time (h1 61.8->61.4, h2 67.6->66.9, h3 73.0->72.4, h4 78.8->79.0, question 85->86.1); IW43 is the inverse")
assert "const WP = [[60, 60], [61.8, 61.4], [66.8, 66.9], [73.0, 72.4], [78.8, 79.0], [85, 86.1], [90, 91.1]];" in s
s = rep(s, "const WP = [[60, 60], [61.8, 61.4], [66.8, 66.9], [73.0, 72.4], [78.8, 79.0], [85, 86.1], [90, 91.1]];", "const WP = [[60, 60], [61.8, 61.4], [67.6, 66.9], [73.0, 72.4], [78.8, 79.0], [85, 86.1], [90, 91.1]];")
s = s.replace('W42', 'W43')   # also turns IW42 into IW43
open(S + 'src/reflect43.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end42.js').read()
s = rep(s, "// Episode 42 final card (question: What old wrong are you ready to face?)", "// Episode 43 final card (question: Who is depending on you right now?)")
old = """  cineTitle(cx, t, ['WHAT OLD WRONG'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['ARE YOU READY'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['TO FACE?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHO IS'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['DEPENDING ON'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOU NOW?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end43.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs42.js').read()
s = s.replace("subs42.json", "subs43.json").replace("Episode 42", "Episode 43")
open(S + 'src/subs43.js', 'w').write(s)
if not os.path.exists(S + 'src/subs43.json'):
    open(S + 'src/subs43.json', 'w').write('[]')

# ---- build script
s = open(S + 'build42.sh').read()
s = s.replace('main42.js', 'main43.js').replace('bundle42.js', 'bundle43.js').replace('ep42.html', 'ep43.html').replace('Episode 42 - Genesis 42', 'Episode 43 - Genesis 43').replace('Episode 42', 'Episode 43')
open(S + 'build43.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep43_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '42.py').read()
    s = s.replace('ep42', 'ep43').replace('main42', 'main43')
    open(S + n + '43.py', 'w').write(s)
s = open(S + 'camtry42.py').read().replace('ep42', 'ep43')
open(S + 'camtry43.py', 'w').write(s)
s = open(S + 'sheet42.py').read().replace('ep42', 'ep43')
open(S + 'sheet43.py', 'w').write(s)
print('ok')
