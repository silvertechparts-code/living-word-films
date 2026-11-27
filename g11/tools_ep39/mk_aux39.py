#!/usr/bin/env python3
# Derives the Genesis 39 reflection (same time-warp as Ep35-38: the Ep39 reflection narration sits at the same times), question card, subtitle drawer, build script and debug scripts from the Ep38 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect38.js').read()
L = s.split('\n')
hdr = [
 "// Episode 39, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Joseph did right, and it cost him his position and his freedom.\");",
 "// the road quietly begins to glow (h2, \"Yet again and again the chapter says: the Lord was with Joseph.\"); the person lifts their head into soft golden light (h3, \"Doing right may cost you something. It does not take God from you.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, do right when no one is watching.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W39) from the Ep31 timings onto the Ep39 narration (the same narration times as Ep35-38); there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = s.replace('W38', 'W39')
s = rep(s, "// Ep38 time -> Ep31 set time", "// Ep39 time -> Ep31 set time")
open(S + 'src/reflect39.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end38.js').read()
s = rep(s, "// Episode 38 final card (question: What wrong do you need to admit?)", "// Episode 39 final card (question: Where is doing right costing you something?)")
old = """  cineTitle(cx, t, ['WHAT WRONG'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['DO YOU'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['NEED TO'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['ADMIT?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHERE IS'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['DOING RIGHT'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['COSTING YOU'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['SOMETHING?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end39.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs38.js').read()
s = s.replace("subs38.json", "subs39.json").replace("Episode 38", "Episode 39")
open(S + 'src/subs39.js', 'w').write(s)
if not os.path.exists(S + 'src/subs39.json'):
    open(S + 'src/subs39.json', 'w').write('[]')

# ---- build script
s = open(S + 'build38.sh').read()
s = s.replace('main38.js', 'main39.js').replace('bundle38.js', 'bundle39.js').replace('ep38.html', 'ep39.html').replace('Episode 38 - Genesis 38', 'Episode 39 - Genesis 39').replace('Episode 38', 'Episode 39')
open(S + 'build39.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep39_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '38.py').read()
    s = s.replace('ep38', 'ep39').replace('main38', 'main39')
    open(S + n + '39.py', 'w').write(s)
s = open(S + 'camtry38.py').read().replace('ep38', 'ep39')
open(S + 'camtry39.py', 'w').write(s)
s = open(S + 'sheet38.py').read().replace('ep38', 'ep39')
open(S + 'sheet39.py', 'w').write(s)
print('ok')
