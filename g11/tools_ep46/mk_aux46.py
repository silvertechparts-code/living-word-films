#!/usr/bin/env python3
# Derives the Genesis 46 reflection, question card, subtitle drawer, build script and debug scripts from the Ep45 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect45.js').read()
L = s.split('\n')
hdr = [
 "// Episode 46, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Jacob was old, heading for a land not his own.\");",
 "// the road quietly begins to glow (h2, \"God told him: do not be afraid, I will go down with you.\"); the person lifts their head into soft golden light (h3, \"Many of us face a loss or a start we did not choose.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, take one step, trusting that God goes with you.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W46) from the Ep31 timings onto the Ep46 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = s.replace('W45', 'W46').replace('Ep45 time', 'Ep46 time')   # also turns IW45 into IW46; the reflection clips start at the same times as in Ep45
open(S + 'src/reflect46.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end45.js').read()
s = rep(s, "// Episode 45 final card (question: Who do you need to invite closer again?)", "// Episode 46 final card (question: What new beginning are you afraid of?)")
old = """  cineTitle(cx, t, ['WHO DO YOU NEED'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['TO INVITE'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['CLOSER AGAIN?'], 86.7, 89.9, { ...q, size: 104, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT NEW'], 85.4, 89.9, { ...q, size: 90, y: 430, color: P.cream });
  cineTitle(cx, t, ['BEGINNING ARE'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOU AFRAID OF?'], 86.7, 89.9, { ...q, size: 100, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end46.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs45.js').read()
s = s.replace("subs45.json", "subs46.json").replace("Episode 45", "Episode 46")
open(S + 'src/subs46.js', 'w').write(s)
if not os.path.exists(S + 'src/subs46.json'):
    open(S + 'src/subs46.json', 'w').write('[]')

# ---- build script
s = open(S + 'build45.sh').read()
s = s.replace('main45.js', 'main46.js').replace('bundle45.js', 'bundle46.js').replace('ep45.html', 'ep46.html').replace('Episode 45 - Genesis 45', 'Episode 46 - Genesis 46').replace('Episode 45', 'Episode 46')
open(S + 'build46.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep46_qc', exist_ok=True)
for n in ('dbg', 'dbgcam', 'camtry', 'sheet'):
    s = open(S + n + '45.py').read()
    s = s.replace('ep45', 'ep46').replace('main45', 'main46')
    open(S + n + '46.py', 'w').write(s)
print('ok')
