#!/usr/bin/env python3
# Derives the Genesis 40 reflection (re-timed time-warp W40: the Ep40 reflection narration is longer in h1), question card, subtitle drawer, build script and debug scripts from the Ep39 files.
import os
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect39.js').read()
L = s.split('\n')
hdr = [
 "// Episode 40, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Joseph was a prisoner himself, yet he noticed two downcast faces. He stopped, and asked what was wrong.\");",
 "// the road quietly begins to glow (h2, \"Being forgotten hurts. It does not make kindness worth less.\"); the person lifts their head into soft golden light (h3, \"Kindness given while you are hurting is still kindness.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, notice who around you looks heavy, and ask.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W40) from the Ep31 timings onto the Ep40 narration (h1 is longer than in Ep35-39, so its window and the later cues move); there is no second person."]
assert L[4].startswith('import * as THREE'), L[:6]
s = '\n'.join(hdr + L[4:])
s = s.replace('W39', 'W40')
s = rep(s, "// Ep39 time -> Ep31 set time (h1 61.8->61.4, h2 68.0->66.9, h3 73.0->72.4, h4 79.6->79.0, question 85->86.1); IW40 is the inverse",
           "// Ep40 time -> Ep31 set time (h1 61.5->61.4, h2 69.5->66.9, h3 74.1->72.4, h4 79.6->79.0, question 85->86.1); IW40 is the inverse")
s = rep(s, "const WP = [[60, 60], [61.8, 61.4], [68.0, 66.9], [73.0, 72.4], [79.6, 79.0], [85, 86.1], [90, 91.1]];",
           "const WP = [[60, 60], [61.5, 61.4], [69.5, 66.9], [74.1, 72.4], [79.6, 79.0], [85, 86.1], [90, 91.1]];")
open(S + 'src/reflect40.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end39.js').read()
s = rep(s, "// Episode 39 final card (question: Where is doing right costing you something?)", "// Episode 40 final card (question: Who around you looks downcast right now?)")
old = """  cineTitle(cx, t, ['WHERE IS'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['DOING RIGHT'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['COSTING YOU'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['SOMETHING?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHO AROUND YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['LOOKS DOWNCAST'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['RIGHT NOW?'], 86.7, 89.9, { ...q, size: 100, y: 680, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end40.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs39.js').read()
s = s.replace("subs39.json", "subs40.json").replace("Episode 39", "Episode 40")
open(S + 'src/subs40.js', 'w').write(s)
if not os.path.exists(S + 'src/subs40.json'):
    open(S + 'src/subs40.json', 'w').write('[]')

# ---- build script
s = open(S + 'build39.sh').read()
s = s.replace('main39.js', 'main40.js').replace('bundle39.js', 'bundle40.js').replace('ep39.html', 'ep40.html').replace('Episode 39 - Genesis 39', 'Episode 40 - Genesis 40').replace('Episode 39', 'Episode 40')
open(S + 'build40.sh', 'w').write(s)

# ---- debug scripts
os.makedirs('/home/claude/ep40_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '39.py').read()
    s = s.replace('ep39', 'ep40').replace('main39', 'main40')
    open(S + n + '40.py', 'w').write(s)
s = open(S + 'camtry39.py').read().replace('ep39', 'ep40')
open(S + 'camtry40.py', 'w').write(s)
s = open(S + 'sheet39.py').read().replace('ep39', 'ep40')
open(S + 'sheet40.py', 'w').write(s)
print('ok')
