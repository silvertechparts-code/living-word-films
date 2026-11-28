#!/usr/bin/env python3
# Derives the Genesis 47 reflection, question card, subtitle drawer, build script and debug scripts from the Ep46 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect46.js').read()
L = s.split('\n')
hdr = [
 "// Episode 47, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Jacob called his life a journey, with years few and hard.\");",
 "// the road quietly begins to glow (h2, \"Yet he blessed a king, and asked to be carried home to his fathers.\"); the person lifts their head into soft golden light (h3, \"Hard years do not waste a life that walks toward a promise.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, hold your troubles loosely, and keep walking.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W47) from the Ep31 timings onto the Ep47 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = s.replace('W46', 'W47').replace('Ep46 time', 'Ep47 time')   # also turns IW46 into IW47; the reflection clips start at the same times as in Ep46 (h1 61.8, h2 66.8, h3 72.6, h4 79.0, question 85.3)
open(S + 'src/reflect47.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end46.js').read()
s = rep(s, "// Episode 46 final card (question: What new beginning are you afraid of?)", "// Episode 47 final card (question: What are you really walking toward today?)")
old = """  cineTitle(cx, t, ['WHAT NEW'], 85.4, 89.9, { ...q, size: 90, y: 430, color: P.cream });
  cineTitle(cx, t, ['BEGINNING ARE'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOU AFRAID OF?'], 86.7, 89.9, { ...q, size: 100, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT ARE YOU'], 85.4, 89.9, { ...q, size: 84, y: 430, color: P.cream });
  cineTitle(cx, t, ['REALLY WALKING'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['TOWARD TODAY?'], 86.7, 89.9, { ...q, size: 104, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end47.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs46.js').read()
s = s.replace("subs46.json", "subs47.json").replace("Episode 46", "Episode 47")
open(S + 'src/subs47.js', 'w').write(s)
if not os.path.exists(S + 'src/subs47.json'):
    open(S + 'src/subs47.json', 'w').write('[]')

# ---- build script
s = open(S + 'build46.sh').read()
s = s.replace('main46.js', 'main47.js').replace('bundle46.js', 'bundle47.js').replace('ep46.html', 'ep47.html').replace('Episode 46 - Genesis 46', 'Episode 47 - Genesis 47').replace('Episode 46', 'Episode 47')
open(S + 'build47.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep47_qc', exist_ok=True)
for n in ('dbg', 'dbgcam', 'camtry', 'sheet'):
    s = open(S + n + '46.py').read()
    s = s.replace('ep46', 'ep47').replace('main46', 'main47')
    open(S + n + '47.py', 'w').write(s)
print('ok')
