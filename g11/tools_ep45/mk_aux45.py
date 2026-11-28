#!/usr/bin/env python3
# Derives the Genesis 45 reflection, question card, subtitle drawer, build script and debug scripts from the Ep44 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect44.js').read()
L = s.split('\n')
hdr = [
 "// Episode 45, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Joseph said: I am the one you sold. Then he said: come closer.\");",
 "// the road quietly begins to glow (h2, \"He told the truth about the harm, and he opened the door anyway.\"); the person lifts their head into soft golden light (h3, \"Peace needs honest words about what happened, and an open hand.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, step toward someone you have drifted from.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W45) from the Ep31 timings onto the Ep45 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = s.replace('W44', 'W45').replace('Ep44 time', 'Ep45 time')   # also turns IW44 into IW45; reflection clips start at the same times as in Ep44
open(S + 'src/reflect45.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end44.js').read()
s = rep(s, "// Episode 44 final card (question: What would you give up for your family?)", "// Episode 45 final card (question: Who do you need to invite closer again?)")
old = """  cineTitle(cx, t, ['WHAT WOULD YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['GIVE UP FOR'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOUR FAMILY?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHO DO YOU NEED'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['TO INVITE'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['CLOSER AGAIN?'], 86.7, 89.9, { ...q, size: 104, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end45.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs44.js').read()
s = s.replace("subs44.json", "subs45.json").replace("Episode 44", "Episode 45")
open(S + 'src/subs45.js', 'w').write(s)
if not os.path.exists(S + 'src/subs45.json'):
    open(S + 'src/subs45.json', 'w').write('[]')

# ---- build script
s = open(S + 'build44.sh').read()
s = s.replace('main44.js', 'main45.js').replace('bundle44.js', 'bundle45.js').replace('ep44.html', 'ep45.html').replace('Episode 44 - Genesis 44', 'Episode 45 - Genesis 45').replace('Episode 44', 'Episode 45')
open(S + 'build45.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep45_qc', exist_ok=True)
for n in ('dbg', 'dbgcam', 'camtry', 'sheet'):
    s = open(S + n + '44.py').read()
    s = s.replace('ep44', 'ep45').replace('main44', 'main45')
    open(S + n + '45.py', 'w').write(s)
print('ok')
