#!/usr/bin/env python3
# Derives the Genesis 44 reflection, question card, subtitle drawer, build script and debug scripts from the Ep43 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect43.js').read()
L = s.split('\n')
hdr = [
 "// Episode 44, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Judah offered his own freedom so Benjamin could go home.\");",
 "// the road quietly begins to glow (h2, \"Love is more than a feeling. It pays what someone else would owe.\"); the person lifts their head into soft golden light (h3, \"We are rarely asked for freedom. We are often asked for time, comfort or pride.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, carry a cost for someone you love.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W44) from the Ep31 timings onto the Ep44 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = rep(s, "// Ep43 time -> Ep31 set time (h1 61.8->61.4, h2 67.6->66.9, h3 73.0->72.4, h4 78.8->79.0, question 85->86.1); IW43 is the inverse",
           "// Ep44 time -> Ep31 set time (h1 61.8->61.4, h2 66.8->66.9, h3 72.6->72.4, h4 79.0->79.0, question 85->86.1); IW44 is the inverse")
a = "const WP = [[60, 60], [61.8, 61.4], [67.6, 66.9], [73.0, 72.4], [78.8, 79.0], [85, 86.1], [90, 91.1]];"
assert a in s
s = rep(s, a, "const WP = [[60, 60], [61.8, 61.4], [66.8, 66.9], [72.6, 72.4], [79.0, 79.0], [85, 86.1], [90, 91.1]];")
s = s.replace('W43', 'W44')   # also turns IW43 into IW44
open(S + 'src/reflect44.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end43.js').read()
s = rep(s, "// Episode 43 final card (question: Who is depending on you right now?)", "// Episode 44 final card (question: What would you give up for your family?)")
old = """  cineTitle(cx, t, ['WHO IS'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['DEPENDING ON'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOU NOW?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT WOULD YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['GIVE UP FOR'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOUR FAMILY?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end44.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs43.js').read()
s = s.replace("subs43.json", "subs44.json").replace("Episode 43", "Episode 44")
open(S + 'src/subs44.js', 'w').write(s)
if not os.path.exists(S + 'src/subs44.json'):
    open(S + 'src/subs44.json', 'w').write('[]')

# ---- build script
s = open(S + 'build43.sh').read()
s = s.replace('main43.js', 'main44.js').replace('bundle43.js', 'bundle44.js').replace('ep43.html', 'ep44.html').replace('Episode 43 - Genesis 43', 'Episode 44 - Genesis 44').replace('Episode 43', 'Episode 44')
open(S + 'build44.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep44_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '43.py').read()
    s = s.replace('ep43', 'ep44').replace('main43', 'main44')
    open(S + n + '44.py', 'w').write(s)
s = open(S + 'camtry43.py').read().replace('ep43', 'ep44')
open(S + 'camtry44.py', 'w').write(s)
s = open(S + 'sheet43.py').read().replace('ep43', 'ep44')
open(S + 'sheet44.py', 'w').write(s)
print('ok')
