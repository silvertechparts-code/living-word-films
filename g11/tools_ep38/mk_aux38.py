#!/usr/bin/env python3
# Derives the Genesis 38 reflection (same time-warp as Ep35-37: the Ep38 reflection narration sits at the same times), question card, subtitle drawer, build script and debug scripts from the Ep37 files.
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect37.js').read()
L = s.split('\n')
hdr = [
 "// Episode 38, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Judah was ready to punish Tamar, yet he had kept Shelah from her.\");",
 "// the road quietly begins to glow (h2, \"Shown his seal, cord, and staff, he did not argue. He admitted it.\"); the person lifts their head into soft golden light (h3, \"It takes courage to say: I was wrong.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, stop defending one wrong, and make it right if you can.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W38) from the Ep31 timings onto the Ep38 narration (the same narration times as Ep35-37); there is no second person."]
assert L[4].startswith('import * as THREE')
s = '\n'.join(hdr + L[4:])
s = s.replace('W37', 'W38')
s = rep(s, "// Ep37 time -> Ep31 set time", "// Ep38 time -> Ep31 set time")
open(S + 'src/reflect38.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end37.js').read()
s = rep(s, "// Episode 37 final card (question: Whose success is hard for you to celebrate?)", "// Episode 38 final card (question: What wrong do you need to admit?)")
old = """  cineTitle(cx, t, ['WHOSE SUCCESS'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['IS HARD'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['FOR YOU TO'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['CELEBRATE?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT WRONG'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['DO YOU'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['NEED TO'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['ADMIT?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end38.js', 'w').write(s)

# ---- subtitles (cards file is written later by tools/build_subs38.py; an empty list until then)
s = open(S + 'src/subs37.js').read()
s = s.replace("subs37.json", "subs38.json").replace("Episode 37", "Episode 38")
open(S + 'src/subs38.js', 'w').write(s)
import os
if not os.path.exists(S + 'src/subs38.json'):
    open(S + 'src/subs38.json', 'w').write('[]')

# ---- build script
s = open(S + 'build37.sh').read()
s = s.replace('main37.js', 'main38.js').replace('bundle37.js', 'bundle38.js').replace('ep37.html', 'ep38.html').replace('Episode 37 - Genesis 37', 'Episode 38 - Genesis 38').replace('Episode 37', 'Episode 38')
open(S + 'build38.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep38_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '37.py').read()
    s = s.replace('ep37', 'ep38').replace('main37', 'main38')
    open(S + n + '38.py', 'w').write(s)
s = open(S + 'camtry37.py').read().replace('ep37', 'ep38')
open(S + 'camtry38.py', 'w').write(s)
s = open(S + 'sheet37.py').read().replace('ep37', 'ep38')
open(S + 'sheet38.py', 'w').write(s)
print('ok')
