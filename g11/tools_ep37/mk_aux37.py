#!/usr/bin/env python3
# Derives the Genesis 37 reflection (same time-warp as Ep36: the Ep37 reflection narration sits at the same times), question card, subtitle drawer, build script and debug scripts from the Ep36 files.
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect36.js').read()
L = s.split('\n')
hdr = [
 "// Episode 37, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"The brothers' hatred grew in steps: unkind words, more hatred, then a plot.\");",
 "// the road quietly begins to glow (h2, \"Envy rarely begins with a plot. It begins with a closed heart.\"); the person lifts their head into soft golden light (h3, \"Deal with envy while it is small, before it hardens in you.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, say one kind word to someone you envy.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W37) from the Ep31 timings onto the Ep37 narration (the same narration times as Ep36); there is no second person."]
assert L[4].startswith('import * as THREE')
s = '\n'.join(hdr + L[4:])
s = s.replace('W36', 'W37')
s = rep(s, "// Ep36 time -> Ep31 set time", "// Ep37 time -> Ep31 set time")
open(S + 'src/reflect37.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end36.js').read()
s = rep(s, "// Episode 36 final card (question: Who can you bless, even from far away?)", "// Episode 37 final card (question: Whose success is hard for you to celebrate?)")
old = """  cineTitle(cx, t, ['WHO CAN YOU'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['BLESS,'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['EVEN FROM'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['FAR AWAY?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHOSE SUCCESS'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['IS HARD'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['FOR YOU TO'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['CELEBRATE?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end37.js', 'w').write(s)

# ---- subtitles (cards file is written later by tools/build_subs37.py; an empty list until then)
s = open(S + 'src/subs36.js').read()
s = s.replace("subs36.json", "subs37.json").replace("Episode 36", "Episode 37")
open(S + 'src/subs37.js', 'w').write(s)
import os
if not os.path.exists(S + 'src/subs37.json'):
    open(S + 'src/subs37.json', 'w').write('[]')

# ---- build script
s = open(S + 'build36.sh').read()
s = s.replace('main36.js', 'main37.js').replace('bundle36.js', 'bundle37.js').replace('ep36.html', 'ep37.html').replace('Episode 36 - Genesis 36', 'Episode 37 - Genesis 37').replace('Episode 36', 'Episode 37')
open(S + 'build37.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep37_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '36.py').read()
    s = s.replace('ep36', 'ep37').replace('main36', 'main37')
    open(S + n + '37.py', 'w').write(s)
s = open(S + 'camtry36.py').read().replace('ep36', 'ep37')
open(S + 'camtry37.py', 'w').write(s)
print('ok')
