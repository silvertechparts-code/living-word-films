#!/usr/bin/env python3
# Derives the Genesis 36 reflection (time-warped to the Ep36 narration, same warp as Ep35), question card, subtitle drawer, build script and debug scripts from the Ep35/Ep31 files.
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25)
s = open(S + 'src/reflect35.js').read()
L = s.split('\n')
hdr = [
 "// Episode 36, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"After meeting in peace, Esau and Jacob went separate ways.\");",
 "// the road quietly begins to glow (h2, \"The text gives one reason: their herds were too many for one land.\"); the person lifts their head into soft golden light (h3, \"Peace does not always mean living side by side.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, pray for someone you had to part from, and wish them well.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W36) from the Ep31 timings onto the Ep36 narration (the same narration times as Ep35); there is no second person."]
assert L[4].startswith('import * as THREE')
s = '\n'.join(hdr + L[4:])
s = s.replace('W35', 'W36').replace('IW35', 'IW36')
s = rep(s, "// Ep35 time -> Ep31 set time", "// Ep36 time -> Ep31 set time")
s = rep(s, "onto the Ep35 narration", "onto the Ep36 narration") if "onto the Ep35 narration" in s else s
open(S + 'src/reflect36.js', 'w').write(s)

# ---- question card: four lines (WHO CAN YOU / BLESS, / EVEN FROM / FAR AWAY?), the same layout as Ep31
s = open(S + 'src/end35.js').read()
s = rep(s, "// Episode 35 final card (question: What do you need to let go of?)", "// Episode 36 final card (question: Who can you bless, even from far away?)")
old = """  cineTitle(cx, t, ['WHAT DO YOU'], 85.4, 89.9, { ...q, size: 76, y: 430, color: P.cream });
  cineTitle(cx, t, ['NEED TO'], 85.95, 89.9, { ...q, size: 76, y: 540, color: P.cream });
  cineTitle(cx, t, ['LET GO OF?'], 86.5, 89.9, { ...q, size: 112, y: 665, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHO CAN YOU'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['BLESS,'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['EVEN FROM'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['FAR AWAY?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end36.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs35.js').read()
s = s.replace("subs35.json", "subs36.json").replace("Episode 35", "Episode 36")
open(S + 'src/subs36.js', 'w').write(s)

# ---- build script
s = open(S + 'build35.sh').read()
s = s.replace('main35.js', 'main36.js').replace('bundle35.js', 'bundle36.js').replace('ep35.html', 'ep36.html').replace('Episode 35 - Genesis 35', 'Episode 36 - Genesis 36').replace('Episode 35', 'Episode 36')
open(S + 'build36.sh', 'w').write(s)

# ---- debug scripts
import os
os.makedirs('/home/claude/ep36_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '35.py').read()
    s = s.replace('ep35', 'ep36').replace('main35', 'main36')
    open(S + n + '36.py', 'w').write(s)
s = open(S + 'camtry.py').read().replace('ep35', 'ep36')
open(S + 'camtry36.py', 'w').write(s)
print('ok')
