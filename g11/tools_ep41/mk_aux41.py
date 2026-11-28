#!/usr/bin/env python3
# Derives the Genesis 41 reflection (re-timed time-warp W41 from the Ep31 timings onto the Ep41 narration), question card, subtitle drawer, build script and debug scripts from the Ep40 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect40.js').read()
L = s.split('\n')
hdr = [
 "// Episode 41, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Joseph gave God the credit before the palace.\");",
 "// the road quietly begins to glow (h2, \"He prepared in the good years. In the palace, he named his son in thanks.\"); the person lifts their head into soft golden light (h3, \"Thanks and preparation can live in the same heart.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, thank God for one good thing, and prepare for a harder day.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W41) from the Ep31 timings onto the Ep41 narration; there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = rep(s, "// Ep40 time -> Ep31 set time (h1 61.5->61.4, h2 69.5->66.9, h3 74.1->72.4, h4 79.6->79.0, question 85->86.1); IW40 is the inverse",
           "// Ep41 time -> Ep31 set time (h1 61.8->61.4, h2 66.8->66.9, h3 73.0->72.4, h4 78.8->79.0, question 85->86.1); IW41 is the inverse")
s = rep(s, "const WP = [[60, 60], [61.5, 61.4], [69.5, 66.9], [74.1, 72.4], [79.6, 79.0], [85, 86.1], [90, 91.1]];",
           "const WP = [[60, 60], [61.8, 61.4], [66.8, 66.9], [73.0, 72.4], [78.8, 79.0], [85, 86.1], [90, 91.1]];")
s = s.replace('W40', 'W41')   # also turns IW40 into IW41
open(S + 'src/reflect41.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end40.js').read()
s = rep(s, "// Episode 40 final card (question: Who around you looks downcast right now?)", "// Episode 41 final card (question: What will you thank God for today?)")
old = """  cineTitle(cx, t, ['WHO AROUND YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['LOOKS DOWNCAST'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['RIGHT NOW?'], 86.7, 89.9, { ...q, size: 100, y: 680, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT WILL YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['THANK GOD FOR'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['TODAY?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end41.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs40.js').read()
s = s.replace("subs40.json", "subs41.json").replace("Episode 40", "Episode 41")
open(S + 'src/subs41.js', 'w').write(s)
if not os.path.exists(S + 'src/subs41.json'):
    open(S + 'src/subs41.json', 'w').write('[]')

# ---- build script
s = open(S + 'build40.sh').read()
s = s.replace('main40.js', 'main41.js').replace('bundle40.js', 'bundle41.js').replace('ep40.html', 'ep41.html').replace('Episode 40 - Genesis 40', 'Episode 41 - Genesis 41').replace('Episode 40', 'Episode 41')
open(S + 'build41.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep41_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '40.py').read()
    s = s.replace('ep40', 'ep41').replace('main40', 'main41')
    open(S + n + '41.py', 'w').write(s)
s = open(S + 'camtry40.py').read().replace('ep40', 'ep41')
open(S + 'camtry41.py', 'w').write(s)
s = open(S + 'sheet40.py').read().replace('ep40', 'ep41')
open(S + 'sheet41.py', 'w').write(s)
print('ok')
